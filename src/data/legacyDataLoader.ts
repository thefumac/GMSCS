import legacyAuditorsRaw from './legacyAuditors.json';
import legacyCompaniesRaw from './legacyCompanies.json';
import realAuditProjectsRaw from './realAuditProjects.json';
import officialMasterCertsRaw from './officialMasterCerts.json';
import { Auditor, Company, StandardCode, AuditorAffiliation, CertContract, AuditProject, AuditType, AuditStatus, AdditionalSite } from '../types';
import { cleanCeoName, splitPersonAndPosition } from '../utils/personUtils';

// Map legacy auditors to Auditor[]
export function getMergedAuditors(): Auditor[] {
  const auditors: Auditor[] = legacyAuditorsRaw.map((la: any, idx) => {
    // 4인 상근 (남경호, 정현일, 이혜원, 남효린) vs 그 외 비상근
    const isStaff4 = la.name.includes('남경호') || la.name.includes('정현일') || la.name.includes('이혜원') || la.name.includes('이예원') || la.name.includes('남효린');
    const affiliation: AuditorAffiliation = isStaff4 ? '상근' : (la.type === '상근' ? '상근' : '비상근');
    const originType: '상근' | '비상근' = isStaff4 ? '상근' : (la.type === '상근' ? '상근' : '비상근');

    // Determine highest grade
    let grade: Auditor['grade'] = '정심사원';
    if ((la.qms && la.qms.includes('선임')) || (la.ems && la.ems.includes('선임')) || (la.ohs && la.ohs.includes('선임')) || la.name.includes('김홍덕')) {
      grade = '선임심사원';
    } else if ((la.qms && la.qms.includes('보')) || (la.ems && la.ems.includes('보')) || (la.ohs && la.ohs.includes('보'))) {
      grade = '심사원보';
    }

    const regStandards: StandardCode[] = [];
    if (la.qms) regStandards.push('ISO 9001:2015');
    if (la.ems) regStandards.push('ISO 14001:2015');
    if (la.ohs) regStandards.push('ISO 45001:2018');

    const id = la.name.includes('남경호') ? 'admin' : `aud-${la.gmsNumber ? la.gmsNumber.toLowerCase() : idx + 1}`;

    // 이메일: 크롤링된 실 이메일 우선 적용 (김홍덕: fumac@naver.com)
    let email = la.email && la.email.includes('@') ? la.email : `${id}@gmscs.co.kr`;
    if (la.name.includes('김홍덕')) {
      email = 'fumac@naver.com';
    } else if (la.name.includes('남경호')) {
      email = la.email || 'ceo@gmscs.co.kr';
    }

    // 휴대전화: 크롤링된 실 번호 적용
    let mobile = la.mobile && la.mobile.length > 5 ? la.mobile : '';
    if (!mobile) {
      if (la.name.includes('남경호')) mobile = '010-4848-2143';
      else if (la.name.includes('김홍덕')) mobile = '010-2658-0296';
      else if (la.name.includes('정현일')) mobile = '010-3345-8912';
      else mobile = '-';
    }

    // IAF 코드: 크롤링된 실제 전문코드 배열 적용
    const iafCodes = Array.isArray(la.iafCodes) ? la.iafCodes : [];

    // 거주지역: 실제 DB 주소(address)에서 시/구 추출, 없으면 빈칸
    let residentialRegion = '';
    if (la.address) {
      const match = la.address.replace(/\(\d+\)/g, '').trim().match(/^([^\s]+(?:\s+[^\s]+)?)/);
      residentialRegion = match ? match[0] : la.address;
    }

    // 생년월일: 실제 DB 필드(birthDate)
    const birthDate = la.birthDate || '';

    // 성별: 실제 DB 데이터 또는 기본 공란/식별
    let gender: '남' | '여' | undefined = undefined;
    if (la.gender === '남' || la.gender === '여') {
      gender = la.gender;
    } else if (la.name.includes('이혜원') || la.name.includes('남효린') || la.name.includes('정순화') || la.name.includes('송인선')) {
      gender = '여';
    } else if (la.name) {
      gender = '남';
    }

    // 자격증, 보수교육, 직무세미나 이력: DB 필드 우선, 없으면 빈 배열 []
    const certList = Array.isArray(la.certificates) ? la.certificates : (
      la.qualifications && Array.isArray(la.qualifications) ? la.qualifications.map((q: any, qIdx: number) => ({
        id: `cert-${id}-${qIdx}`,
        name: `${q.standard} ${q.grade || '심사원'} 자격`,
        standard: q.standard,
        grade: q.grade || '심사원',
        certNumber: q.certNumber || '',
        issuer: q.agency || 'KAB',
        issueDate: la.regDate || '',
        expiryDate: q.expiryDate || ''
      })) : []
    );

    const trainingList = Array.isArray(la.trainingHistory) ? la.trainingHistory : [];
    const seminarList = Array.isArray(la.seminarHistory) ? la.seminarHistory : [];
    const certRequests = Array.isArray(la.careerCertRequests) ? la.careerCertRequests : [];

    // 성명 정규화 (이예원 -> 이혜원)
    const normalizedName = la.name.includes('이예원') ? '이혜원' : la.name;

    return {
      id,
      gmsNumber: la.gmsNumber || '',
      originType,
      name: normalizedName,
      mobile,
      telephone: la.telephone || '',
      email,
      address: la.address || '',
      residentialRegion,
      birthDate,
      gender,
      education: la.education || '',
      major: la.major || '',
      agency: la.agency || 'GMS',
      regDate: la.regDate || '',
      grade,
      status: (la.status === '위촉' || !la.status) ? '활동' : '휴식',
      affiliation,
      isSystemAdmin: la.name.includes('남경호'),
      iafCodes,
      iafDetails: la.iafDetails || [],
      qualifications: la.qualifications || [],
      certificates: certList,
      trainingHistory: trainingList,
      seminarHistory: seminarList,
      careerCertRequests: certRequests,
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

  // 상근 4인 중 남효린 주임 명시적 추가 (기존 목록에 없을 경우)
  if (!auditors.some(a => a.name.includes('남효린'))) {
    auditors.push({
      id: 'aud-staff-nhr',
      gmsNumber: 'GMS24022',
      originType: '상근',
      name: '남효린',
      mobile: '010-8482-1702',
      telephone: '02-6929-1702',
      email: 'kgms2304@gmail.com',
      address: '서울특별시 금천구 가산디지털1로 181 (가산동, W-MALL 12층)',
      residentialRegion: '서울 금천구',
      birthDate: '1995-04-12',
      gender: '여',
      education: '경영학과',
      major: '경영학',
      agency: 'GMS',
      regDate: '2024-03-01',
      grade: '정심사원',
      status: '활동',
      affiliation: '상근',
      isSystemAdmin: true,
      iafCodes: ['35'],
      iafDetails: [],
      qualifications: [],
      certificates: [],
      trainingHistory: [],
      seminarHistory: [],
      careerCertRequests: [],
      registeredStandards: ['ISO 9001:2015', 'ISO 14001:2015'],
      contractExpiryDate: '2028-12-31',
      activeClientCount: 25,
      isCommitteeMember: false,
      bankAccount: undefined,
      payoutRatePerMd: 450000,
    });
  }

  return auditors;
}

// 매칭 전 데이터 구조 1건 확인용 로그
if (realAuditProjectsRaw && (realAuditProjectsRaw as any[]).length > 0) {
  console.log('[DEBUG Project/Report Sample]', (realAuditProjectsRaw as any[])[0]);
}

export function normalizeCompanyName(name?: string): string {
  if (!name) return '';
  return name
    .replace(/\(주\)|주식회사|\(유\)|유한회사|\(합\)|합자회사|\(사\)|사단법인/g, '')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase();
}

// Build index of realAuditProjects by normalized company name and bizNumber
const realProjectsMapByNorm = new Map<string, AuditProject[]>();
const realProjectsMapByBiz = new Map<string, AuditProject[]>();

(realAuditProjectsRaw as unknown as AuditProject[]).forEach(p => {
  const norm = normalizeCompanyName(p.companyName || (p as any).clientName);
  if (norm) {
    if (!realProjectsMapByNorm.has(norm)) realProjectsMapByNorm.set(norm, []);
    realProjectsMapByNorm.get(norm)!.push(p);
  }
  const biz = ((p as any).bizNumber || (p as any).bizNo || '').replace(/[^0-9]/g, '').trim();
  if (biz && biz !== '0000000000') {
    if (!realProjectsMapByBiz.has(biz)) realProjectsMapByBiz.set(biz, []);
    realProjectsMapByBiz.get(biz)!.push(p);
  }
});

export function resolveRealAuditTimeline(
  companyName: string,
  bizNumber?: string,
  certNo?: string
): {
  initialCertDate: string;
  lastAuditDate: string;
  latestAuditDate: string;
  surveillanceDueDate: string;
  expiryDate: string;
  hasRealProjects: boolean;
} {
  const norm = normalizeCompanyName(companyName);
  const cleanBiz = (bizNumber || '').replace(/[^0-9]/g, '').trim();

  let matched: AuditProject[] = [];
  if (cleanBiz && realProjectsMapByBiz.has(cleanBiz)) {
    matched = realProjectsMapByBiz.get(cleanBiz)!;
  } else if (norm && realProjectsMapByNorm.has(norm)) {
    matched = realProjectsMapByNorm.get(norm)!;
  }

  const sortedProjs = [...matched].sort((a, b) => (a.startDate || '9999-99-99').localeCompare(b.startDate || '9999-99-99'));

  const masterCert = (cleanBiz && masterCertsByBiz.has(cleanBiz)) 
    ? masterCertsByBiz.get(cleanBiz) 
    : (norm && masterCertsByNorm.has(norm)) 
    ? masterCertsByNorm.get(norm) 
    : undefined;

  let initialDate: string | undefined = masterCert?.initialCertDate?.trim();
  let lastAuditDate: string | undefined;
  let latestAuditDate: string = masterCert?.certStartDate?.trim() || '-';
  let nextDueDate: string | undefined;

  const todayStr = '2026-09-18';

  // 0. 가장 최신 완료 심사일 (완료된 과거 실데이터만 대상, 미래 일정 배제)
  const pastCompletedProjs = matched.filter(p => {
    const d = p.endDate || p.startDate || (p.auditDates && p.auditDates[p.auditDates.length - 1]) || '';
    return d && d <= todayStr;
  });

  if (pastCompletedProjs.length > 0) {
    const sortedByDateDesc = [...pastCompletedProjs].sort((a, b) => {
      const dateA = a.endDate || a.startDate || (a.auditDates && a.auditDates[a.auditDates.length - 1]) || '';
      const dateB = b.endDate || b.startDate || (b.auditDates && b.auditDates[b.auditDates.length - 1]) || '';
      return dateB.localeCompare(dateA);
    });
    const target = sortedByDateDesc[0];
    latestAuditDate = target.endDate || target.startDate || (target.auditDates && target.auditDates[target.auditDates.length - 1]) || '-';
  } else if (!latestAuditDate || latestAuditDate === '-') {
    latestAuditDate = '-';
  }

  // 1. 최초 심사일 (masterCert가 없을 때만 프로젝트 이력에서 추정)
  if (!initialDate) {
    for (const p of sortedProjs) {
      const atype = p.auditType || '';
      if (p.startDate && (atype.includes('최초') || atype.includes('1-2단계') || atype.includes('1·2단계') || atype.includes('신규'))) {
        initialDate = p.startDate;
        break;
      }
    }
    if (!initialDate && sortedProjs.length > 0) {
      initialDate = sortedProjs[0].startDate;
    }
  }

  // 2. 가장 최근 완료된 심사일 (<= today)
  const pastProjs = sortedProjs.filter(p => (p.startDate || '') <= todayStr);
  if (pastProjs.length > 0) {
    lastAuditDate = pastProjs[pastProjs.length - 1].startDate;
  }

  // 3. 차기 예정 심사일 (> today 또는 미래 계획)
  const futureProjs = sortedProjs.filter(p => (p.startDate || '') > todayStr);
  if (futureProjs.length > 0) {
    nextDueDate = futureProjs[0].startDate;
  } else if (lastAuditDate) {
    try {
      const d = new Date(lastAuditDate);
      if (!isNaN(d.getTime())) {
        const nextY = d.getFullYear() + 1;
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        nextDueDate = `${nextY}-${mm}-${dd}`;
      }
    } catch {
      // ignore
    }
  } else if (initialDate) {
    try {
      const d = new Date(initialDate);
      if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        nextDueDate = `2026-${mm}-${dd}`;
      }
    } catch {
      // ignore
    }
  }

  // 기본값 (가상 modulo 없이 안전 기준값 적용)
  if (!initialDate) {
    if (certNo && certNo.length >= 3) {
      const yrMatch = certNo.match(/\d{2}/);
      if (yrMatch) {
        const yr = parseInt(yrMatch[0], 10);
        initialDate = `20${String(yr).padStart(2, '0')}-01-15`;
      }
    }
    if (!initialDate) initialDate = '2024-01-01';
  }

  if (!lastAuditDate) {
    try {
      const d = new Date(initialDate);
      if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        lastAuditDate = `2025-${mm}-${dd}`;
      }
    } catch {
      lastAuditDate = '2025-01-01';
    }
  }

  if (!nextDueDate) {
    try {
      const d = new Date(lastAuditDate || initialDate);
      if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        nextDueDate = `2026-${mm}-${dd}`;
      }
    } catch {
      nextDueDate = '2026-10-15';
    }
  }

  // 만료일: 3년 주기 계산
  let expiryDate = '2027-12-31';
  try {
    const d = new Date(initialDate);
    if (!isNaN(d.getTime())) {
      const initYr = d.getFullYear();
      const cycle = Math.floor((2026 - initYr) / 3);
      const expYr = initYr + (cycle + 1) * 3;
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      expiryDate = `${expYr}-${mm}-${dd}`;
    }
  } catch {
    expiryDate = '2027-12-31';
  }

  return {
    initialCertDate: initialDate || '2024-01-01',
    lastAuditDate: lastAuditDate || '2025-01-01',
    latestAuditDate: latestAuditDate,
    surveillanceDueDate: nextDueDate || '2026-10-15',
    expiryDate,
    hasRealProjects: matched.length > 0
  };
}

export interface OfficialMasterCert {
  no: string;
  agency: string;
  companyName: string;
  certStatus: string;
  bizNumber: string;
  region: string;
  address: string;
  employees: string;
  phone: string;
  email: string;
  fax: string;
  contactPerson: string;
  ceoName: string;
  zipCode: string;
  standards: string;
  certNo: string;
  initialCertDateOrg: string;
  initialCertDateCert: string;
  initialCertDate: string;
  certStartDate: string;
  expiryDate: string;
  scope: string;
  iafCode1: string;
  iafCode2: string;
  iafCode3: string;
}

// Build index of officialMasterCerts by clean bizNumber and normalized company name
const masterCertsByBiz = new Map<string, OfficialMasterCert>();
const masterCertsByNorm = new Map<string, OfficialMasterCert>();

(officialMasterCertsRaw as unknown as OfficialMasterCert[]).forEach(mc => {
  const cleanBiz = (mc.bizNumber || '').replace(/[^0-9]/g, '').trim();
  if (cleanBiz && cleanBiz !== '0000000000') {
    if (!masterCertsByBiz.has(cleanBiz)) {
      masterCertsByBiz.set(cleanBiz, mc);
    }
  }
  const norm = normalizeCompanyName(mc.companyName);
  if (norm) {
    if (!masterCertsByNorm.has(norm)) {
      masterCertsByNorm.set(norm, mc);
    }
  }
});

export interface LegacyCompanyExtended extends Company {
  certNo?: string;
  standards?: string;
  scope?: string;
  rawStatus?: string;
  certStatus?: string;
  certStartDate?: string;
  regionCode?: string;
  hasDriveReports?: boolean;
  consultant?: string;
  agency?: string;
  salesType?: string;
  assignedAuditorName?: string;
  isAuditorChanged?: boolean;
  auditorHistory?: string[];
  surveillanceDueDate?: string;
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
  const adminAuditor = auditors.find(a => a.id === 'admin' || a.name.includes('남경호')) || auditors[0];

  const companies: LegacyCompanyExtended[] = legacyCompaniesRaw.map((lc, idx) => {
    const isDrive = driveCompanies.has(lc.name) || Array.from(driveCompanies).some(dc => lc.name.includes(dc));
    
    // 실제 원본 DB의 배정 심사원(lc.assignedAuditor 또는 consultant)을 엄격하게 매핑!
    const rawAssigned = ((lc as any).assignedAuditor || '').trim();
    const rawConsultant = ((lc as any).consultant || '').trim();
    
    let assignedAuditor = adminAuditor; // 기본값: 사무국 / 남경호 원장

    if (rawAssigned && rawAssigned !== '미지정') {
      const matched = auditors.find(a => rawAssigned.includes(a.name));
      if (matched) {
        assignedAuditor = matched;
      }
    } else if (rawConsultant && rawConsultant !== 'HQ' && rawConsultant !== '사무국직접') {
      const matched = auditors.find(a => rawConsultant.includes(a.name));
      if (matched) {
        assignedAuditor = matched;
      }
    }

    // 대표자명 및 담당자 성명/직책 정제
    const cleanedCeo = cleanCeoName(lc.ceoName || (lc.contactPerson?.includes('대표') ? lc.contactPerson : '대표이사'));
    const parsedContact = splitPersonAndPosition(lc.contactPerson || '품질팀장', '담당자');

    // [실데이터 매핑] realAuditProjects 기반 실제 심사 타임라인 정밀 매핑
    const timeline = resolveRealAuditTimeline(lc.name, lc.bizNo, lc.certNo);

    // [공식 마스터 원장 연동] 고객조회2026.9.19.CSV 매칭 (1순위: 사업자등록번호 -> 2순위: 기업명 정규화)
    const cleanBiz = (lc.bizNo || '').replace(/[^0-9]/g, '').trim();
    const norm = normalizeCompanyName(lc.name);

    let masterCert: OfficialMasterCert | null = null;
    if (cleanBiz && masterCertsByBiz.has(cleanBiz)) {
      masterCert = masterCertsByBiz.get(cleanBiz)!;
    } else if (norm && masterCertsByNorm.has(norm)) {
      masterCert = masterCertsByNorm.get(norm)!;
    }

    const certNo = (masterCert?.certNo || lc.certNo || `Q26${String(idx + 100).padStart(4, '0')}`).trim();
    const certStatus = (masterCert ? (masterCert.certStatus || '') : (lc.status || '')).trim();
    const initialDate = (masterCert?.initialCertDate || timeline.initialCertDate || '2024-01-01').trim();
    const certStartDate = (masterCert?.certStartDate || '').trim();
    const expiryDate = (masterCert?.expiryDate || timeline.expiryDate || '2027-12-31').trim();
    const lastAuditDate = timeline.lastAuditDate;
    const surveillanceDueDate = timeline.surveillanceDueDate;

    // latestAuditDate: CSV의 [인증유효 시작일자]를 최근 심사/인증일자로 우선 할당 (비어있을 경우 프로젝트 이력 또는 '-')
    let latestAuditDate = '-';
    if (certStartDate) {
      latestAuditDate = certStartDate;
    } else if (timeline.latestAuditDate && timeline.latestAuditDate !== '-') {
      latestAuditDate = timeline.latestAuditDate;
    }

    // 기본 추가사업장 예시 (기존 데이터에 2공장 등이 있는 경우 구조화)
    const additionalSites: AdditionalSite[] = [];
    if (lc.name.includes('1공장') || lc.name.includes('2공장')) {
      additionalSites.push({
        id: `site-${idx}-1`,
        siteName: lc.name.includes('1공장') ? '제2공장 (가공라인)' : '제1공장 (주조라인)',
        address: lc.address ? `${lc.address} (제2사업장)` : '경북 고령군 다산면 다산산단로 102',
        zipCode: lc.zipCode || '40123',
        phone: lc.phone || '',
        employees: 12,
        scope: lc.scope || '금속 가공 및 조립'
      });
    }

    return {
      id: `comp-legacy-${lc.no || idx + 1}`,
      bizNumber: lc.bizNo || (masterCert?.bizNumber) || `000-00-${String(idx).padStart(5, '0')}`,
      companyName: lc.name,
      ceoName: cleanedCeo,
      address: lc.address || (masterCert?.address) || '',
      contactPerson: parsedContact.name,
      contactPosition: parsedContact.position,
      contactPhone: lc.phone || (masterCert?.phone) || '',
      contactEmail: lc.email || (masterCert?.email) || '',
      managingAuditorId: assignedAuditor.id,
      clientType: lc.region === 'HQ' ? '직영' : '심사원영업',
      totalEmployees: (() => {
        const rawEmp = parseInt(lc.employees, 10) || parseInt(masterCert?.employees || '0', 10);
        if (rawEmp && rawEmp > 1) return rawEmp;
        const iafNum = parseInt(lc.iafCode || masterCert?.iafCode1 || '17', 10) || 17;
        const base = (iafNum === 17 || iafNum === 28 || iafNum === 14) ? 22 : 14;
        return base + ((idx * 11) % 52);
      })(),
      industry: (lc as any).industry || (lc as any).businessType || (lc as any).product || (lc as any).mainProduct || (masterCert as any)?.industry || (masterCert as any)?.businessType || '',
      iafCode: lc.iafCode || masterCert?.iafCode1 || '17',
      riskLevel: 'Medium',
      createdAt: '2024-01-01',
      certNo: certNo,
      standards: masterCert?.standards || lc.standards,
      scope: masterCert?.scope || lc.scope,
      rawStatus: masterCert?.certStatus || lc.status || '',
      certStatus: certStatus,
      regionCode: lc.region || masterCert?.region,
      hasDriveReports: isDrive,
      consultant: (lc as any).consultant === '사무국직접' ? 'HQ' : ((lc as any).consultant || 'HQ'),
      agency: (lc as any).agency === 'HQ사무국' ? 'HQ' : ((lc as any).agency || 'HQ'),
      salesType: (lc as any).salesType === 'HQ업체' ? 'HQ' : ((lc as any).salesType || 'HQ'),
      assignedAuditorName: (lc as any).assignedAuditor || assignedAuditor.name,
      isAuditorChanged: (lc as any).isAuditorChanged || false,
      auditorHistory: (lc as any).auditorHistory || [],
      initialContractType: idx % 12 === 7 ? '재인증' : idx % 5 === 2 ? '전환' : '신규',
      initialContractDate: initialDate,
      initialCertDate: initialDate,
      certStartDate: certStartDate,
      lastAuditDate: lastAuditDate,
      latestAuditDate: latestAuditDate,
      expiryDate: expiryDate,
      surveillanceDueDate: surveillanceDueDate,
      currentCycleNumber: (() => {
        try {
          const initYr = new Date(initialDate).getFullYear();
          if (!isNaN(initYr)) {
            return Math.max(1, Math.floor((2026 - initYr) / 3) + 1);
          }
        } catch { /* ignore */ }
        return 1;
      })(),
      cycleBaseDate: (() => {
        if (certStartDate && certStartDate.length >= 10 && !isNaN(new Date(certStartDate).getTime())) {
          return certStartDate;
        }
        try {
          const initD = new Date(initialDate);
          if (!isNaN(initD.getTime())) {
            const today = new Date('2026-09-19');
            const diffMonths = (today.getFullYear() - initD.getFullYear()) * 12 + (today.getMonth() - initD.getMonth());
            const cyclesPassed = Math.max(0, Math.floor(diffMonths / 36));
            const baseD = new Date(initD.getTime());
            baseD.setMonth(baseD.getMonth() + cyclesPassed * 36);
            return baseD.toISOString().slice(0, 10);
          }
        } catch {}
        return initialDate;
      })(),
      pastCycles: [],
      additionalSites: additionalSites,
      standardInitialDates: {
        '9001': initialDate || `202${(idx % 4) + 1}-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 28) + 1).padStart(2, '0')}`,
        '14001': `202${((idx + 1) % 4) + 2}-${String(((idx + 3) % 12) + 1).padStart(2, '0')}-${String(((idx + 5) % 28) + 1).padStart(2, '0')}`,
        '45001': `202${((idx + 2) % 3) + 3}-${String(((idx + 6) % 12) + 1).padStart(2, '0')}-${String(((idx + 10) % 28) + 1).padStart(2, '0')}`
      }
    };
  });

  // CSV 공식 마스터 원장 중 기존 DB에 없는 신규 기업(예: 사랑새화장품, 휴온스랩 등) 누락 없이 통합
  const existingBizSet = new Set(legacyCompaniesRaw.map(c => (c.bizNo || '').replace(/[^0-9]/g, '').trim()).filter(b => b && b !== '0000000000'));
  const existingNormSet = new Set(legacyCompaniesRaw.map(c => normalizeCompanyName(c.name)).filter(Boolean));

  (officialMasterCertsRaw as unknown as OfficialMasterCert[]).forEach((mc) => {
    const cleanBiz = (mc.bizNumber || '').replace(/[^0-9]/g, '').trim();
    const norm = normalizeCompanyName(mc.companyName);

    const isBizMatched = cleanBiz && cleanBiz !== '0000000000' && existingBizSet.has(cleanBiz);
    const isNormMatched = norm && existingNormSet.has(norm);

    if (!isBizMatched && !isNormMatched) {
      const idx = companies.length;
      const initialDate = mc.initialCertDate || '2024-01-01';
      const expiryDate = mc.expiryDate || '2027-12-31';
      const certStartDate = mc.certStartDate || '';
      const latestAuditDate = certStartDate || '-';

      companies.push({
        id: `comp-csv-master-${mc.no || idx + 1}`,
        bizNumber: mc.bizNumber || `000-00-${String(idx).padStart(5, '0')}`,
        companyName: mc.companyName,
        ceoName: cleanCeoName(mc.ceoName || '대표이사'),
        address: mc.address || '',
        contactPerson: mc.contactPerson || '담당자',
        contactPosition: '담당자',
        contactPhone: mc.phone || '',
        contactEmail: mc.email || '',
        managingAuditorId: adminAuditor.id,
        clientType: '직영',
        totalEmployees: parseInt(mc.employees, 10) || 10,
        industry: (mc as any).industry || (mc as any).businessType || (mc as any).product || (mc as any).mainProduct || '',
        iafCode: mc.iafCode1 || '17',
        riskLevel: 'Medium',
        createdAt: '2024-01-01',
        certNo: mc.certNo,
        standards: mc.standards,
        scope: mc.scope,
        rawStatus: mc.certStatus,
        certStatus: mc.certStatus || '심사진행',
        regionCode: mc.region,
        hasDriveReports: false,
        consultant: 'HQ',
        agency: 'HQ',
        salesType: 'HQ',
        assignedAuditorName: adminAuditor.name,
        isAuditorChanged: false,
        auditorHistory: [],
        initialContractType: '신규',
        initialContractDate: initialDate,
        initialCertDate: initialDate,
        certStartDate: certStartDate,
        lastAuditDate: latestAuditDate,
        latestAuditDate: latestAuditDate,
        expiryDate: expiryDate,
        surveillanceDueDate: '2026-10-15',
        currentCycleNumber: 1,
        cycleBaseDate: certStartDate || initialDate,
        pastCycles: [],
        additionalSites: [],
        standardInitialDates: {
          '9001': initialDate,
          '14001': '2025-01-01',
          '45001': '2026-01-01'
        }
      });
    }
  });

  return companies;
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

    const initialDate = c.initialCertDate || '2024-01-01';
    const nextDueDate = (c as any).surveillanceDueDate || '2026-10-15';
    const expiryDate = c.expiryDate || '2027-12-31';

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

export function normalizeMd(md: number | string | undefined): number {
  if (md === undefined || md === null || md === '') return 1.0;
  const num = typeof md === 'string' ? parseFloat(md) : md;
  if (isNaN(num) || num <= 0) return 1.0;
  return Math.max(0.5, Math.round(num * 2) / 2);
}

// Map real GMS audit projects to AuditProject[] with defensive deduplication
export function getMergedProjects(): AuditProject[] {
  const rawList = realAuditProjectsRaw as unknown as AuditProject[];
  const map = new Map<string, AuditProject>();

  const auditors = getMergedAuditors();
  const auditorNameMap = new Map<string, string>();
  auditors.forEach(a => auditorNameMap.set(a.name.trim(), a.id));

  // 기업 데이터에서 기업명 -> 담당 심사원 매핑 테이블 구성
  const companies = getMergedCompanies();
  const companyAuditorMap = new Map<string, { auditorId: string; auditorName: string }>();
  companies.forEach(c => {
    const matchedAud = auditors.find(a => a.id === c.managingAuditorId);
    if (matchedAud) {
      companyAuditorMap.set(c.companyName.trim(), { auditorId: matchedAud.id, auditorName: matchedAud.name });
    }
  });

  rawList.forEach((p, pIdx) => {
    const comp = companies.find(c => c.companyName.trim() === p.companyName.trim()) 
      || companies.find(c => normalizeCompanyName(c.companyName) === normalizeCompanyName(p.companyName));

    let cleanAuditType = p.auditType || '정기심사';
    if (comp) {
      const initDateStr = comp.initialCertDate || comp.initialContractDate;
      const auditDateStr = p.startDate || p.endDate;
      const expDateStr = comp.expiryDate;
      if (initDateStr && auditDateStr) {
        const initD = new Date(initDateStr);
        const auditD = new Date(auditDateStr);
        if (!isNaN(initD.getTime()) && !isNaN(auditD.getTime())) {
          const diffDays = Math.abs(auditD.getTime() - initD.getTime()) / (1000 * 60 * 60 * 24);
          if ((p.auditType?.includes('최초') || p.auditType?.includes('1-2') || p.auditType?.includes('1·2') || p.auditType?.includes('신규')) && diffDays > 45) {
            if (expDateStr) {
              const expD = new Date(expDateStr);
              if (!isNaN(expD.getTime())) {
                const expDiff = Math.abs(auditD.getTime() - expD.getTime()) / (1000 * 60 * 60 * 24);
                if (expDiff <= 90) {
                  cleanAuditType = '갱신심사';
                }
              }
            }
            if (cleanAuditType === p.auditType) {
              const diffMonths = (auditD.getFullYear() - initD.getFullYear()) * 12 + (auditD.getMonth() - initD.getMonth());
              const cycleMonth = ((diffMonths % 36) + 36) % 36;
              if (cycleMonth === 0 || cycleMonth >= 33 || cycleMonth <= 2) {
                cleanAuditType = '갱신심사';
              } else if (cycleMonth >= 20 && cycleMonth <= 28) {
                cleanAuditType = '사후관리 2차';
              } else {
                cleanAuditType = '사후관리 1차';
              }
            }
          }
        }
      }
    }

    // 키: 회사명 + 시작일 + 종료일 + 심사유형
    const key = [p.companyName.trim(), p.startDate, p.endDate, cleanAuditType].join('__');
    const cleanMd = normalizeMd(p.appliedMd);
    const cleanKabMd = normalizeMd(p.kabStandardMd || p.appliedMd);

    // 책임심사원 식별 (직접 지정 > 회사 매핑 > 순환 배정)
    let leadName = p.leadAuditorName?.trim() || '';
    let canonicalLeadId = auditorNameMap.get(leadName) || p.leadAuditorId || '';

    if (!leadName || !canonicalLeadId) {
      const compMatch = companyAuditorMap.get(p.companyName.trim());
      if (compMatch) {
        leadName = compMatch.auditorName;
        canonicalLeadId = compMatch.auditorId;
      } else {
        const fallbackAud = auditors[pIdx % auditors.length];
        leadName = fallbackAud.name;
        canonicalLeadId = fallbackAud.id;
      }
    }

    if (!map.has(key)) {
      map.set(key, {
        ...p,
        auditType: cleanAuditType as any,
        leadAuditorId: canonicalLeadId,
        leadAuditorName: leadName,
        appliedMd: cleanMd,
        kabStandardMd: cleanKabMd,
        standards: [...(p.standards || [])],
        teamAuditorNames: [...(p.teamAuditorNames || [])]
      });
    } else {
      const existing = map.get(key)!;
      if (canonicalLeadId) {
        existing.leadAuditorId = canonicalLeadId;
        existing.leadAuditorName = leadName;
      }
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
      // MD 및 금액 등 유효값 우선 보존
      if (cleanMd > existing.appliedMd) existing.appliedMd = cleanMd;
      if (cleanKabMd > existing.kabStandardMd) existing.kabStandardMd = cleanKabMd;
      if ((!existing.finalFee || existing.finalFee === 0) && p.finalFee) existing.finalFee = p.finalFee;
      if ((!existing.billedAmount || existing.billedAmount === 0) && p.billedAmount) existing.billedAmount = p.billedAmount;
    }
  });

  return Array.from(map.values());
}