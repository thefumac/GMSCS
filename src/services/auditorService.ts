import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, TENANT_CONFIG } from './firebase';
import { Auditor } from '../types';
import { getMergedAuditors } from '../data/legacyDataLoader';

export interface AuditorRecord extends Auditor {
  tenantId?: string;
  region?: string;
  initialPassword?: string;
  password?: string;
  isAdmin?: boolean;
}

/**
 * 주소에서 광역자치단체명 추출 (서울, 경기, 대구, 부산, 충남 등)
 */
export function extractProvinceName(address?: string, residentialRegion?: string): string {
  const text = (address || residentialRegion || '').trim();
  if (!text) return '서울';
  if (/서울/i.test(text)) return '서울';
  if (/경기/i.test(text)) return '경기';
  if (/인천/i.test(text)) return '인천';
  if (/부산/i.test(text)) return '부산';
  if (/대구/i.test(text)) return '대구';
  if (/대전/i.test(text)) return '대전';
  if (/광주/i.test(text)) return '광주';
  if (/울산/i.test(text)) return '울산';
  if (/세종/i.test(text)) return '세종';
  if (/경남|경상남도/i.test(text)) return '경남';
  if (/경북|경상북도/i.test(text)) return '경북';
  if (/전남|전라남도/i.test(text)) return '전남';
  if (/전북|전라북도/i.test(text)) return '전북';
  if (/충남|충청남도/i.test(text)) return '충남';
  if (/충북|충청북도/i.test(text)) return '충북';
  if (/강원/i.test(text)) return '강원';
  if (/제주/i.test(text)) return '제주';
  return text.split(' ')[0] || '서울';
}

/**
 * Firestore에서 심사원 목록 실시간 조회 (로컬 fallback)
 */
export async function getAuditorsFromDb(): Promise<Auditor[]> {
  try {
    const q = query(
      collection(db, 'auditors'),
      where('tenantId', '==', TENANT_CONFIG.tenantId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const list = snap.docs.map(d => {
        const data = d.data() as any;
        const region = data.region || extractProvinceName(data.address, data.residentialRegion);
        return {
          ...data,
          id: d.id,
          region,
          residentialRegion: region,
          isSystemAdmin: Boolean(data.isSystemAdmin || data.isAdmin)
        } as Auditor;
      });
      return list;
    }
  } catch (error) {
    console.warn('Firestore 심사원 목록 조회 실패, 로컬 데이터 사용:', error);
  }

  // Fallback to legacy merged data
  return getMergedAuditors().map(aud => {
    const region = extractProvinceName(aud.address, aud.residentialRegion);
    return {
      ...aud,
      region,
      residentialRegion: region,
      isSystemAdmin: Boolean(aud.isSystemAdmin || aud.affiliation === '상근')
    };
  });
}

/**
 * 심사원 정보 및 사무국(관리자) 권한 업데이트
 */
export async function updateAuditorInDb(auditor: Auditor): Promise<void> {
  try {
    const audId = auditor.id;
    const docRef = doc(db, 'auditors', audId);
    
    const updatePayload: Record<string, any> = {
      ...auditor,
      tenantId: TENANT_CONFIG.tenantId,
      isAdmin: Boolean(auditor.isSystemAdmin),
      isSystemAdmin: Boolean(auditor.isSystemAdmin),
      region: auditor.region || extractProvinceName(auditor.address, auditor.residentialRegion),
      updatedAt: new Date().toISOString()
    };

    await setDoc(docRef, updatePayload, { merge: true });
  } catch (error) {
    console.error('Firestore 심사원 정보 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 사무국(관리자) 접근 권한 부여/회수
 */
export async function setAuditorAdminRole(auditorId: string, isAdmin: boolean): Promise<void> {
  try {
    const docRef = doc(db, 'auditors', auditorId);
    await updateDoc(docRef, {
      isSystemAdmin: isAdmin,
      isAdmin: isAdmin,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Firestore 권한 업데이트 실패:', error);
  }
}
