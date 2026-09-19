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
  const localList = getMergedCompanies();
  const localMap = new Map<string, Company>();
  localList.forEach(c => localMap.set(c.id, c));

  try {
    const q = query(
      collection(db, 'companies'),
      where('tenantId', '==', TENANT_CONFIG.tenantId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const dbList = snap.docs.map(d => {
        const data = d.data();
        const local = localMap.get(d.id);

        const certNo = data.certNo || local?.certNo || '';
        const certStatus = data.certStatus !== undefined ? data.certStatus : ((local as any)?.certStatus || '');
        const certStartDate = data.certStartDate || (local as any)?.certStartDate || '';
        const initialDate = data.initialCertDate || data.initialContractDate || local?.initialCertDate || '2024-01-01';
        const lastAuditDate = data.lastAuditDate || local?.lastAuditDate || '';
        const latestAuditDate = (data.latestAuditDate && data.latestAuditDate !== '-')
          ? data.latestAuditDate
          : (certStartDate || local?.latestAuditDate || lastAuditDate || '-');
        const expiryDate = data.expiryDate || local?.expiryDate || '2027-12-31';

        return {
          id: d.id,
          companyName: data.companyName || local?.companyName || '고객사',
          bizNumber: data.bizNumber || local?.bizNumber || '',
          ceoName: data.ceoName || local?.ceoName || '대표이사',
          address: data.address || local?.address || '',
          zipCode: data.zipCode || (local as any)?.zipCode || '',
          phone: data.phone || local?.contactPhone || '',
          fax: data.fax || '',
          email: data.email || local?.contactEmail || '',
          industry: data.industry || local?.industry || (data as any).businessType || (data as any).product || '',
          scope: data.scope || local?.scope || '',
          iafCode: data.iafCode || local?.iafCode || '17',
          region: data.region || (local as any)?.regionCode || '경기',
          totalEmployees: Number(data.totalEmployees || local?.totalEmployees || 10),
          standards: data.standards || local?.standards || ['ISO 9001:2015'],
          certNo: certNo,
          certStatus: certStatus,
          rawStatus: (local as any)?.rawStatus || certStatus,
          certStartDate: certStartDate,
          initialContractDate: data.initialContractDate || initialDate,
          initialContractType: data.initialContractType || local?.initialContractType || '신규',
          initialCertDate: initialDate,
          lastAuditDate: lastAuditDate,
          latestAuditDate: latestAuditDate,
          expiryDate: expiryDate,
          currentCycleNumber: data.currentCycleNumber || (local as any)?.currentCycleNumber || 1,
          cycleBaseDate: data.cycleBaseDate || (local as any)?.cycleBaseDate || certStartDate || initialDate,
          pastCycles: data.pastCycles || (local as any)?.pastCycles || [],
          assignedAuditorName: data.assignedAuditorName || local?.assignedAuditorName || '남경호',
          managingAuditorId: data.managingAuditorId || local?.managingAuditorId || '',
          consultant: data.consultant || local?.consultant || 'HQ',
          auditState: (certStatus === '인증취소' || (expiryDate && expiryDate < '2026-09-19')) ? '인증취소/만료' : (data.auditState || (certStatus === '인증완료' || certStatus === '인증유지' ? '인증유지' : '미확인')),
          status: (certStatus === '인증완료' || certStatus === '인증유지') ? '정상인증' : (certStatus || '미확인'),
          riskLevel: data.riskLevel || local?.riskLevel || '일반'
        } as unknown as Company;
      });

      const dbIdSet = new Set(dbList.map(c => c.id));
      const mergedList = [...dbList];
      localList.forEach(lc => {
        if (!dbIdSet.has(lc.id)) {
          mergedList.push(lc);
        }
      });

      return mergedList;
    }
  } catch (err) {
    console.warn('[CompanyService] Firestore 연결 실패, 로컬 레거시 DB를 로드합니다:', err);
  }

  return localList;
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
