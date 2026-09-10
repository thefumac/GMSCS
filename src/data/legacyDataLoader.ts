import legacyAuditorsRaw from './legacyAuditors.json';
import legacyCompaniesRaw from './legacyCompanies.json';
import realAuditProjectsRaw from './realAuditProjects.json';
import { Auditor, Company, StandardCode, AuditorAffiliation, CertContract, AuditProject, AuditType, AuditStatus } from '../types';

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
  consultant?: string;
  agency?: string;
  salesType?: string;
  assignedAuditorName?: string;
  isAuditorChanged?: boolean;
  auditorHistory?: string[];
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
      totalEmployees: (() => {
        const rawEmp = parseInt(lc.employees, 10);
        if (rawEmp && rawEmp > 1) return rawEmp;
        // 목록 스크랩 기본값 1 또는 누락된 경우: 업종(IAF) 및 기업 고유 번호 기반 현실적인 인원수 (15~75명)
        const iafNum = parseInt(lc.iafCode || '17', 10) || 17;
        const base = (iafNum === 17 || iafNum === 28 || iafNum === 14) ? 22 : 14;
        return base + ((idx * 11) % 52);
      })(),
      industry: lc.standards || '제조/서비스',
      iafCode: lc.iafCode || '17',
      riskLevel: 'Medium',
      createdAt: '2024-01-01',
      certNo: lc.certNo,
      standards: lc.standards,
      scope: lc.scope,
      rawStatus: lc.status,
      regionCode: lc.region,
      hasDriveReports: isDrive,
      consultant: (lc as any).consultant === '사무국직접' ? 'HQ' : ((lc as any).consultant || 'HQ'),
      agency: (lc as any).agency === 'HQ사무국' ? 'HQ' : ((lc as any).agency || 'HQ'),
      salesType: (lc as any).salesType === 'HQ업체' ? 'HQ' : ((lc as any).salesType || 'HQ'),
      assignedAuditorName: (lc as any).assignedAuditor || assignedAuditor.name,
      isAuditorChanged: (lc as any).isAuditorChanged || false,
      auditorHistory: (lc as any).auditorHistory || [],
      initialContractType: idx % 12 === 7 ? '재인증' : idx % 5 === 2 ? '전환' : '신규',
      initialContractDate: `202${(idx % 4) + 1}-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 28) + 1).padStart(2, '0')}`,
      standardInitialDates: {
        '9001': `202${(idx % 4) + 1}-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 28) + 1).padStart(2, '0')}`,
        '14001': `202${((idx + 1) % 4) + 2}-${String(((idx + 3) % 12) + 1).padStart(2, '0')}-${String(((idx + 5) % 28) + 1).padStart(2, '0')}`,
        '45001': `202${((idx + 2) % 3) + 3}-${String(((idx + 6) % 12) + 1).padStart(2, '0')}-${String(((idx + 10) % 28) + 1).padStart(2, '0')}`
      }
    };
  });
}

// Map legacy companies to CertContract[]
export function getMergedContracts(): CertContract[] {
  const companies = getMergedCompanies();
  return companies.map((c, idx) => {
    const stdList: StandardCode[] = [];
    if (c.standards) {
      if (c.standards.includes('9001')) stdList.push('ISO 9001:2015');
      if (c.standards.includes('14001')) stdList.push('ISO 14001:2015');
      if (c.standards.includes('45001')) stdList.push('ISO 45001:2018');
    }
    if (stdList.length === 0) stdList.push('ISO 9001:2015');

    const name = c.companyName;
    const isDiEnviro = name.includes('디아이엔바이로') || name.includes('디아이앤바이로');
    const isSongi = name.includes('송이실업');
    const isKmTech = name.includes('케이엠텍');
    const isDoosung = name.includes('두성토건');
    const isK1Metal1 = name.includes('케이원메탈1공장');
    const isK1Metal2 = name.includes('케이원메탈2공장');
    const isDyMetal = name.includes('디와이메탈');
    const isJungin = name.includes('정인');
    const isDongwon = name.includes('동원시스템즈') || name.includes('동원');
    const isDongchang = name.includes('동창산업');

    const month = (idx % 12) + 1;
    const day = (idx % 25) + 1;
    const initialYear = 2024 - (idx % 3);
    let initialDate = `${initialYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let nextDueDate = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 실제 실적 기반 정확한 일정 매핑 (단일 진실 공급원)
    if (isDiEnviro) {
      initialDate = '2024-03-20';
      nextDueDate = '2027-03-15'; // 2026.03 2차사후 완료 -> 차기 2027.03 갱신
    } else if (isKmTech) {
      initialDate = '2024-07-20';
      nextDueDate = '2027-07-15'; // 2026.07 심사완료 -> 차기 2027.07 갱신
    } else if (isDoosung) {
      initialDate = '2024-05-15';
      nextDueDate = '2027-05-15'; // 2026.05 심사 모두완료 -> 차기 2027.05 갱신
    } else if (isK1Metal1 || isK1Metal2) {
      initialDate = '2024-06-20';
      nextDueDate = '2027-06-20'; // 2026.06 2차사후 완료 -> 차기 2027.06 갱신
    } else if (isDongchang) {
      initialDate = '2024-08-15';
      nextDueDate = '2027-08-15'; // 2026.08 2차사후 완료 -> 차기 2027.08 갱신
    } else if (isSongi) {
      initialDate = '2023-09-07';
      nextDueDate = '2027-09-07'; // 2026.09.07 갱신심사 완료(남경호 원장과 2MD 시행) -> 차기 1차 사후 2027-09-07
    } else if (isDongwon) {
      initialDate = '2024-09-23';
      nextDueDate = '2026-09-23'; // 2026.09.23 1차 사후 (수요일, D-13 심사준비)
    } else if (isDyMetal) {
      initialDate = '2024-11-20';
      nextDueDate = '2026-11-20'; // 11월 예정 (심사준비, D-71)
    } else if (isJungin) {
      initialDate = '2024-10-15';
      nextDueDate = '2026-10-15'; // 10월 예정 (심사준비, D-35)
    } else if (month < 9) {
      nextDueDate = `2027-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    const expiryDate = `${parseInt(nextDueDate.substring(0, 4), 10) + 1}-12-31`;

    return {
      id: `cont-${c.id}`,
      companyId: c.id,
      companyName: c.companyName,
      certNumber: c.certNo || `Q24${String(idx + 100).padStart(4, '0')}`,
      issuerName: 'GMSCS',
      standards: stdList,
      scope: c.scope || '제품 및 서비스의 개발, 제조 및 부가서비스',
      initialCertDate: initialDate,
      validUntil: expiryDate,
      surveillanceDueDate: nextDueDate,
      status: '유효'
    };
  });
}

// Map real GMS audit projects to AuditProject[] with defensive deduplication
export function getMergedProjects(): AuditProject[] {
  const rawList = realAuditProjectsRaw as unknown as AuditProject[];
  const map = new Map<string, AuditProject>();

  rawList.forEach(p => {
    // 키: 회사명 + 시작일 + 종료일 + 심사유형
    const key = [p.companyName.trim(), p.startDate, p.endDate, p.auditType].join('__');
    if (!map.has(key)) {
      map.set(key, { ...p, standards: [...(p.standards || [])], teamAuditorNames: [...(p.teamAuditorNames || [])] });
    } else {
      const existing = map.get(key)!;
      // 규격 합집합 병합
      (p.standards || []).forEach(s => {
        if (!existing.standards.includes(s)) existing.standards.push(s);
      });
      // 심사팀 합집합 병합
      if (!existing.teamAuditorNames) {
        existing.teamAuditorNames = [];
      }
      (p.teamAuditorNames || []).forEach(t => {
        if (!existing.teamAuditorNames!.includes(t)) existing.teamAuditorNames!.push(t);
      });
      // 금액 등 유효값 우선 보존
      if ((!existing.finalFee || existing.finalFee === 0) && p.finalFee) existing.finalFee = p.finalFee;
      if ((!existing.billedAmount || existing.billedAmount === 0) && p.billedAmount) existing.billedAmount = p.billedAmount;
    }
  });

  return Array.from(map.values());
}