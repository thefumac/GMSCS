import legacyAuditorsRaw from './legacyAuditors.json';
import legacyCompaniesRaw from './legacyCompanies.json';
import { Auditor, Company, StandardCode, AuditorAffiliation } from '../types';
import { mockAuditors as defaultMockAuditors, mockCompanies as defaultMockCompanies } from './mockData';

// Map legacy auditors to Auditor[]
export function getMergedAuditors(): Auditor[] {
  const list: Auditor[] = [];

  // First include system admin (남경호) and office staff if already in defaultMockAuditors
  const defaultMap = new Map(defaultMockAuditors.map(a => [a.name.split(' ')[0], a]));

  legacyAuditorsRaw.forEach((la, idx) => {
    const existing = defaultMap.get(la.name);

    let affiliation: AuditorAffiliation = '비상근심사원';
    if (la.name.includes('남경호') || la.name.includes('정현일') || la.name.includes('이혜원') || la.name.includes('남효린')) {
      affiliation = '사무국직원';
    } else if (la.type === '상근' || la.type === '상임') {
      affiliation = '소속심사원';
    }

    let grade: Auditor['grade'] = '정심사원';
    if (la.qms.includes('선임') || la.ems.includes('선임') || la.ohs.includes('선임')) {
      grade = '선임심사원';
    } else if (la.qms.includes('보') || la.ems.includes('보')) {
      grade = '심사원보';
    }

    const regStandards: StandardCode[] = [];
    if (la.qms) regStandards.push('ISO 9001:2015');
    if (la.ems) regStandards.push('ISO 14001:2015');
    if (la.ohs) regStandards.push('ISO 45001:2018');

    const id = existing ? existing.id : `aud-legacy-${idx + 1}`;

    list.push({
      id,
      name: la.name,
      mobile: existing?.mobile || '010-0000-0000',
      email: existing?.email || `${id}@gmscs.co.kr`,
      grade,
      status: '활동',
      affiliation,
      isSystemAdmin: la.name.includes('남경호'),
      iafCodes: existing?.iafCodes || ['17 (기계/금속)', '28 (건설/토목)'],
      registeredStandards: regStandards.length > 0 ? regStandards : ['ISO 9001:2015'],
      contractExpiryDate: la.period ? '2028-12-31' : '2027-12-31',
      activeClientCount: existing?.activeClientCount || Math.floor(Math.random() * 20) + 5,
      isCommitteeMember: existing?.isCommitteeMember || la.name.includes('김홍덕') || la.name.includes('정순화') || la.name.includes('조무연'),
      committeeRole: existing?.committeeRole || (la.name.includes('김홍덕') ? '심의위원' : undefined),
      committeeAppointmentDate: existing?.committeeAppointmentDate || '2024-01-01',
      bankAccount: existing?.bankAccount,
      payoutRatePerMd: existing?.payoutRatePerMd || 450000,
    });
  });

  return list;
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

  return legacyCompaniesRaw.map((lc, idx) => {
    const isDrive = driveCompanies.has(lc.name) || Array.from(driveCompanies).some(dc => lc.name.includes(dc));
    return {
      id: `comp-legacy-${lc.no || idx + 1}`,
      bizNumber: lc.bizNo || `000-00-${String(idx).padStart(5, '0')}`,
      companyName: lc.name,
      ceoName: lc.ceoName || '대표이사',
      address: lc.address || '',
      contactPerson: lc.contactPerson || '품질팀장',
      contactPhone: lc.phone || '',
      contactEmail: lc.email || '',
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
