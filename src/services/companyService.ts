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
import { Company } from '../types';
import { getMergedCompanies } from '../data/legacyDataLoader';

export interface CompanyRecord extends Company {
  tenantId?: string;
  isLegacyMigrated?: boolean;
  updatedAt?: string;
}

/**
 * Firestore에서 고객사(기업) DB 실시간 조회 (로컬 fallback)
 */
export async function getCompaniesFromDb(): Promise<Company[]> {
  try {
    const q = query(
      collection(db, 'companies'),
      where('tenantId', '==', TENANT_CONFIG.tenantId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          companyName: data.companyName || '고객사',
          bizNumber: data.bizNumber || '',
          ceoName: data.ceoName || '대표이사',
          address: data.address || '',
          zipCode: data.zipCode || '',
          phone: data.phone || '',
          fax: data.fax || '',
          email: data.email || '',
          industry: data.industry || data.scope || '',
          scope: data.scope || '',
          iafCode: data.iafCode || '17',
          region: data.region || '경기',
          totalEmployees: Number(data.totalEmployees || 10),
          standards: data.standards || ['ISO 9001:2015'],
          certNo: data.certNo || '',
          initialContractDate: data.initialContractDate || '2024-01-01',
          initialContractType: data.initialContractType || '신규',
          assignedAuditorName: data.assignedAuditorName || '남경호',
          managingAuditorId: data.managingAuditorId || '',
          consultant: data.consultant || 'HQ',
          auditState: data.auditState || '인증유지',
          status: '정상인증',
          riskLevel: '일반'
        } as unknown as Company;
      });
      return list;
    }
  } catch (err) {
    console.warn('[CompanyService] Firestore 연결 실패, 로컬 레거시 DB를 로드합니다:', err);
  }

  // Fallback to local structured data
  return getMergedCompanies();
}

/**
 * Firestore 고객사 정보 수정/저장
 */
export async function saveCompanyToDb(company: Partial<Company> & { id: string }): Promise<void> {
  try {
    const ref = doc(db, 'companies', company.id);
    await setDoc(ref, {
      ...company,
      tenantId: TENANT_CONFIG.tenantId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('[CompanyService] Firestore 고객사 저장 실패:', err);
  }
}
