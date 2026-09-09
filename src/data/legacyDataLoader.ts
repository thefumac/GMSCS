import legacyAuditorsRaw from './legacyAuditors.json';
import legacyCompaniesRaw from './legacyCompanies.json';
import { Auditor, Company, StandardCode, AuditorAffiliation } from '../types';

// Map legacy auditors to Auditor[]
export function getMergedAuditors(): Auditor[] {
  return legacyAuditorsRaw.map((la, idx) => {
    // 4인 상근 (남경호, 정현일, 이혜원, 남효린) vs 그 외 비상근
    const isStaff4 = la.name.includes('남경호') || la.name.includes('정현일') || la.name.includes('이혜원') || la.name.includes('이예원') || la.name.includes('남효린');
    const affiliation: AuditorAffiliation = isStaff4 ? '상근' : '비상근';
    const originType: '상근' | '비상근' = isStaff4 ? '상근' : '비상근';

    // Determine highest grade
    let grade: Auditor['grade'] = '정심사원';
    if (la.qms.includes('선임') || la.ems.includes('선임') || la.ohs.includes('선임') || la.name.includes('김홍덕')) {
      grade = '선임심사원';
    } else if (la.qms.includes('보') || la.ems.includes('보') || la.ohs.includes('보')) {
      grade = '심사원보';
    }

    const regStandards: StandardCode[] = [];
    if (la.qms) regStandards.push('ISO 9001:2015');
    if (la.ems) regStandards.push('ISO 14001:2015');
    if (la.ohs) regStandards.push('ISO 45001:2018');

    const id = la.name.includes('남경호') ? 'admin' : `aud-${la.gmsNumber ? la.gmsNumber.toLowerCase() : idx + 1}`;

    // 이메일 매핑 (김홍덕: fumac@naver.com)
    let email = `${id}@gmscs.co.kr`;
    if (la.name.includes('김홍덕')) {
      email = 'fumac@naver.com';
    } else if (la.name.includes('남경호')) {
      email = 'ceo@gmscs.co.kr';
    } else if (la.name.includes('정현일')) {
      email = 'hi.jung@gmscs.co.kr';
    }

    return {
      id,
      gmsNumber: la.gmsNumber || '',
      originType,
      name: la.name,
      mobile: la.name.includes('남경호') ? '010-4848-2143' : la.name.includes('김홍덕') ? '010-2658-0296' : la.name.includes('정현일') ? '010-3345-8912' : '010-0000-0000',
      email,
      grade,
      status: '활동',
      affiliation,
      isSystemAdmin: la.name.includes('남경호'),
      iafCodes: la.name.includes('남경호') 
        ? ['17 (기계/금속)', '28 (건설/토목)', '33 (정보기술)', '35 (전문서비스)'] 
        : ['17 (기계/금속)', '28 (건설/토목)'],
      registeredStandards: regStandards.length > 0 ? regStandards : ['ISO 9001:2015'],
      contractExpiryDate: la.period ? la.period : '2028-12-31',
      activeClientCount: la.name.includes('남경호') ? 85 : la.name.includes('정현일') ? 52 : la.name.includes('김홍덕') ? 18 : Math.floor(Math.random() * 15) + 3,
      isCommitteeMember: la.name.includes('남경호') || la.name.includes('정현일') || la.name.includes('김홍덕') || la.name.includes('정순화') || la.name.includes('조무연'),
      committeeRole: la.name.includes('남경호') ? '심의위원장' : la.name.includes('정현일') ? '심의부위원장' : la.name.includes('김홍덕') ? '심의위원' : undefined,
      committeeAppointmentDate: '2024-01-01',
      bankAccount: undefined,
      payoutRatePerMd: 450000,
    };
  });
}

export interface LegacyCompanyExtended extends Company {
  certNo?: string;
  standards?: string;
  scope?: string;
  rawStatus?: string;
  regionCode?: string;
  hasDriveReports?: boolean;
}

// Map legacy companies to Company[]
export function getMergedCompanies(): LegacyCompanyExtended[] {
  // Known companies with Google Drive reports
  const driveCompanies = new Set([
    '주식회사 디와이메탈',
    '(주)케이원메탈1공장',
    '(주)케이원메탈2공장',
    '케이엠텍주식회사',
    '주식회사 두성토건',
    '(주)디아이엔바이로',
    '주식회사 송이실업',
    '동원시스템즈(주) 함안공장',
    '울산광역시청',
    '울산광역시 남구청',
    '명화공업(주)',
    '주식회사 엠넥스',
    '에이에스티인터내셔널 주식회사',
    '주식회사 썬즈'
  ]);

  const auditors = getMergedAuditors();

  return legacyCompaniesRaw.map((lc, idx) => {
    const isDrive = driveCompanies.has(lc.name) || Array.from(driveCompanies).some(dc => lc.name.includes(dc));
    
    // 36명의 심사원에게 기업 고르게 배분 (지역코드/순번에 따른 결정적 매핑)
    const assignedAuditor = auditors[idx % auditors.length];

    return {
      id: `comp-legacy-${lc.no || idx + 1}`,
      bizNumber: lc.bizNo || `000-00-${String(idx).padStart(5, '0')}`,
      companyName: lc.name,
      ceoName: lc.ceoName || '대표이사',
      address: lc.address || '',
      contactPerson: lc.contactPerson || '품질팀장',
      contactPhone: lc.phone || '',
      contactEmail: lc.email || '',
      managingAuditorId: assignedAuditor.id,
      clientType: lc.region === 'HQ' ? '직영' : '심사원영업',
      totalEmployees: parseInt(lc.employees, 10) || 10,
      industry: lc.standards || '제조/서비스',
      iafCode: lc.iafCode || '17',
      riskLevel: 'Medium',
      createdAt: '2024-01-01',
      certNo: lc.certNo,
      standards: lc.standards,
      scope: lc.scope,
      rawStatus: lc.status,
      regionCode: lc.region,
      hasDriveReports: isDrive
    };
  });
}
