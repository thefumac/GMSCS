import { Company, CertContract, AuditProject, AuditorSettlement, AuditStatus } from '../types';

export type CompanyAuditState = 
  | '인증유지' 
  | '일정·계획' 
  | '보고서작성' 
  | '사무국검토'
  | '심의중' 
  | '비용정산중' 
  | '자격정지';

export type AuditStageCycle = '최초심사' | '1차 사후' | '2차 사후' | '갱신' | '전환';

export function isNormalCompany(c: any): boolean {
  if (!c) return false;

  const certStatus = (c.certStatus || '').toString().trim();
  const rawStatus = (c.rawStatus || '').toString().trim();
  const status = (c.status || '').toString().trim();

  // 1. [정규 인증완료 명시적 확인] '인증완료', '인증유지', '정상인증' 상태 인정
  const isValidStatus = 
    certStatus === '인증완료' || 
    certStatus === '인증유지' || 
    certStatus === '정상인증' || 
    status === '정상인증';
  if (!isValidStatus) {
    return false;
  }

  // 2. 실효/정지 키워드 재검증
  if (
    certStatus.includes('취소') || 
    certStatus.includes('보류') || 
    certStatus.includes('정지') || 
    rawStatus.includes('취소') ||
    rawStatus.includes('정지') ||
    status.includes('취소') ||
    status.includes('정지')
  ) {
    return false;
  }

  // 3. 만료일(expiryDate) 검증 (2026-09-19 기준)
  const expiryDate = c.expiryDate || c.validUntil;
  if (expiryDate && expiryDate !== '2027-12-31') {
    const exp = new Date(expiryDate);
    const now = new Date('2026-09-19');
    if (!isNaN(exp.getTime()) && exp < now) {
      return false;
    }
  }

  // 4. 필수 식별자 존재 여부
  return Boolean(c.bizNumber?.trim() || c.certNo?.trim() || c.id);
}

/**
 * 11단계 AuditStatus를 상위 5대 프로세스 그룹으로 매핑
 */
export function getAuditStatusGroup(status?: AuditStatus): CompanyAuditState {
  if (!status) return '인증유지';

  switch (status) {
    case '계획수립':
    case '계획서발송':
      return '일정·계획';
    case '심사진행중':
    case '보고서작성':
    case '서명대기':
    case '서명완료':
      return '보고서작성';
    case '사무국검토대기':
    case '보완요청':
      return '사무국검토';
    case '심의대기':
    case '심의진행':
      return '심의중';
    case '인증발행':
      return '인증유지';
    default:
      return '인증유지';
  }
}

/**
 * ISO 3년 주기 기반 심사 차수 판별
 */
/**
 * ISO 3년 주기 기반 심사 차수 판별
 */
export function getStandardAuditStage(
  company: Company, 
  contract?: CertContract, 
  project?: AuditProject
): AuditStageCycle {
  // 1. 활성 프로젝트에 명시된 auditType 우선 검토 (단, 수년 전 최초인증 기업의 '최초' 오지정 방어)
  if (project?.auditType) {
    const t = project.auditType;
    if (t.includes('1차') || t.includes('사후1')) return '1차 사후';
    if (t.includes('2차') || t.includes('사후2')) return '2차 사후';
    if (t.includes('갱신') || t.includes('재인증')) return '갱신';
    if (t.includes('전환')) return '전환';

    if (t.includes('최초') || t.includes('1-2단계') || t.includes('1·2단계') || t.includes('신규')) {
      const initDateStr = company.initialCertDate || contract?.initialCertDate || company.initialContractDate;
      const auditDateStr = project.startDate || project.endDate;
      if (initDateStr && auditDateStr) {
        const initD = new Date(initDateStr);
        const auditD = new Date(auditDateStr);
        if (!isNaN(initD.getTime()) && !isNaN(auditD.getTime())) {
          const diffDays = Math.abs(auditD.getTime() - initD.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays <= 45) {
            return '최초심사';
          }
          // 차이가 45일 초과인 경우 '최초' 오기재로 간주하고 주기 기반 자동 판정으로 진행
        }
      } else {
        return '최초심사';
      }
    }
  }

  // 2. 회사 또는 계약 정보의 전환 여부
  if (company.isTransfer || (company as any).transferType) {
    return '전환';
  }

  // 3. 만료일(expiryDate) 또는 갱신 기산일 기반 갱신 판단
  const expiryDateStr = company.expiryDate || contract?.validUntil;
  if (expiryDateStr && expiryDateStr.length >= 7) {
    const expDate = new Date(expiryDateStr);
    if (!isNaN(expDate.getTime())) {
      const targetDate = project?.startDate ? new Date(project.startDate) : new Date('2026-09-19');
      const diffDays = (expDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
      // 만료일 기준 120일 전 ~ 60일 후는 갱신심사
      if (diffDays >= -60 && diffDays <= 120) {
        return '갱신';
      }
    }
  }

  // 4. cycleBaseDate / certStartDate / 최초 인증일 기반 ISO 3년 주기 동적 계산
  const baseDateStr = company.cycleBaseDate || company.certStartDate || contract?.initialCertDate || company.initialCertDate;
  if (baseDateStr && baseDateStr.length >= 7) {
    const baseDate = new Date(baseDateStr);
    if (!isNaN(baseDate.getTime())) {
      const targetDate = project?.startDate ? new Date(project.startDate) : new Date('2026-09-19');
      const diffMonths = (targetDate.getFullYear() - baseDate.getFullYear()) * 12 + (targetDate.getMonth() - baseDate.getMonth());
      const cycleMonth = ((diffMonths % 36) + 36) % 36;

      if (cycleMonth <= 14) return '1차 사후';
      if (cycleMonth <= 26) return '2차 사후';
      return '갱신';
    }
  }

  return '1차 사후';
}

/**
 * 기업의 실시간 통합 심사진행상태 판별 (사무국 & 심사원 포털 공통)
 */
export function getCompanyAuditState(
  company?: Company,
  contract?: CertContract,
  project?: AuditProject,
  settlement?: AuditorSettlement
): CompanyAuditState {
  if (!company && !project) return '인증유지';
  const compAny = (company || {}) as any;
  const rawStatus = (compAny.status || compAny.rawStatus || '').trim();

  // 1. 명시적 정지/취소
  if (rawStatus.includes('정지') || rawStatus.includes('취소') || rawStatus.includes('철회')) {
    return '자격정지';
  }

  // 2. 프로젝트 실시간 상태가 있을 때 우선 반영
  if (project) {
    if (project.status === '인증발행') {
      if (settlement && (settlement.payoutStatus === '정산대기' || settlement.payoutStatus === '보류')) {
        return '비용정산중';
      }
      return '인증유지';
    }
    return getAuditStatusGroup(project.status);
  }

  // 3. 차기 사후관리 예정일 기준 D-Day 계산
  const surveillanceDueDate = contract?.surveillanceDueDate || compAny.surveillanceDueDate;
  if (surveillanceDueDate) {
    try {
      const targetDate = new Date(surveillanceDueDate);
      const today = new Date('2026-09-19');
      const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // 6개월(180일) 이상 초과 시 자격정지
      if (diffDays < -180) return '자격정지';
      // 45일 이내 도래 시 일정계획 착수
      if (diffDays >= 0 && diffDays <= 45) return '일정·계획';
    } catch {
      // ignore
    }
  }

  return '인증유지';
}

/**
 * 상태별 공통 배지 CSS 스타일 클래스 (과도한 볼드/버튼형 배제, 심플하고 차분한 텍스트 스타일)
 */
export function getAuditStateBadgeClass(state: CompanyAuditState): string {
  switch (state) {
    case '자격정지':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case '보고서작성':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case '사무국검토':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case '일정·계획':
      return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
    case '심의중':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case '비용정산중':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case '인증유지':
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
}

/**
 * 12 / 24 / 36개월 인증서 발행 마감 및 D-60 / D-90 사전 준비 알람 계산 인터페이스
 */
export interface AuditTimelineStatus {
  stage: AuditStageCycle;
  initialCertDate: string;
  deadlineDate: string; // YYYY-MM-DD (발행 마감일: 1차=12개월, 2차=24개월, 갱신=36개월/만료일)
  prepStartDate: string; // YYYY-MM-DD (준비 착수일 = 마감일 - 60일(사후) / 90일(갱신))
  daysRemainingToDeadline: number; // 마감일까지 남은 일수
  daysRemainingToPrep: number; // 준비착수일까지 남은 일수 (음수면 이미 준비 착수 시기 도래)
  isPrepAlert: boolean; // D-60(사후) / D-90(갱신) 도래 여부 (심사 준비 착수 / 일정 조율 필요)
  isOverdue: boolean; // 발행 마감 초과 여부
  alarmText: string;
}

function addMonthsToDate(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const curMonth = result.getMonth();
  result.setMonth(curMonth + months);
  if (result.getMonth() !== ((curMonth + months) % 12 + 12) % 12) {
    result.setDate(0);
  }
  return result;
}

/**
 * cycleBaseDate 기준 12 / 24 / 36개월 발행 마감 및 D-60 (사후) / D-90 (갱신) 리드타임 알람 산출
 * (기준일: 2026-09-19)
 */
export function getAuditTimelineStatus(
  company: Company,
  contract?: CertContract,
  project?: AuditProject
): AuditTimelineStatus | null {
  const initDateStr = company.initialCertDate || contract?.initialCertDate || company.initialContractDate;
  if (!initDateStr || initDateStr.length < 10) return null;

  const initDate = new Date(initDateStr);
  if (isNaN(initDate.getTime())) return null;

  const today = new Date('2026-09-19');
  const stage = getStandardAuditStage(company, contract, project);

  // 현 주기 기산일(cycleBaseDate) 계산:
  // 1) 갱신일(certStartDate / cycleBaseDate)이 있고 initDate보다 최신이면 해당 일자를 기산일로 사용
  // 2) 없으면 initDate에서 36개월 주기를 곱하여 현재 주기의 기산일 산출
  let currentCycleBase: Date;
  const cycleBaseCandidate = company.cycleBaseDate || company.certStartDate;
  if (cycleBaseCandidate && cycleBaseCandidate.length >= 10 && !isNaN(new Date(cycleBaseCandidate).getTime())) {
    currentCycleBase = new Date(cycleBaseCandidate);
  } else {
    const diffMonthsToToday = (today.getFullYear() - initDate.getFullYear()) * 12 + (today.getMonth() - initDate.getMonth());
    const cyclesPassed = Math.max(0, Math.floor(diffMonthsToToday / 36));
    currentCycleBase = addMonthsToDate(initDate, cyclesPassed * 36);
  }

  const compAny = (company || {}) as any;
  const surveillanceDueDate = contract?.surveillanceDueDate || compAny.surveillanceDueDate;
  const expiryDateStr = company.expiryDate || contract?.validUntil || compAny.validUntil;

  let deadline: Date;
  let prepLeadDays = 60; // 사후관리 기본 D-60 (2개월 전)

  if (stage === '갱신') {
    prepLeadDays = 90; // 갱신심사는 36개월 만료일(expiryDate) 기준 D-90 (3개월 전)
    if (expiryDateStr && expiryDateStr.length >= 10 && !isNaN(new Date(expiryDateStr).getTime())) {
      deadline = new Date(expiryDateStr);
    } else {
      deadline = addMonthsToDate(currentCycleBase, 36);
    }
  } else if (stage === '2차 사후') {
    prepLeadDays = 60; // 2차 사후: 현 주기 기산일 + 24개월
    if (surveillanceDueDate && !isNaN(new Date(surveillanceDueDate).getTime())) {
      deadline = new Date(surveillanceDueDate);
    } else {
      deadline = addMonthsToDate(currentCycleBase, 24);
    }
  } else {
    // 1차 사후 (또는 최초심사/전환)
    prepLeadDays = 60; // 1차 사후: 현 주기 기산일 + 12개월
    if (surveillanceDueDate && !isNaN(new Date(surveillanceDueDate).getTime())) {
      deadline = new Date(surveillanceDueDate);
    } else {
      deadline = addMonthsToDate(currentCycleBase, 12);
    }
  }

  // 준비 착수일 (마감일 - 60일 또는 90일)
  const prepDate = new Date(deadline);
  prepDate.setDate(prepDate.getDate() - prepLeadDays);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemainingToDeadline = Math.ceil((deadline.getTime() - today.getTime()) / msPerDay);
  const daysRemainingToPrep = Math.ceil((prepDate.getTime() - today.getTime()) / msPerDay);

  const isOverdue = daysRemainingToDeadline < 0;
  const isPrepAlert = daysRemainingToPrep <= 0 && !isOverdue;

  let alarmText = '정상 유지';
  if (isOverdue) {
    alarmText = `발행기한 초과 (${Math.abs(daysRemainingToDeadline)}일 경과)`;
  } else if (isPrepAlert) {
    alarmText = `심사준비 착수 D-${daysRemainingToDeadline}일 (일정조율 요망)`;
  } else {
    alarmText = `준비 착수 D-${daysRemainingToPrep}일`;
  }

  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

  return {
    stage,
    initialCertDate: initDateStr.slice(0, 10),
    deadlineDate: formatDate(deadline),
    prepStartDate: formatDate(prepDate),
    daysRemainingToDeadline,
    daysRemainingToPrep,
    isPrepAlert,
    isOverdue,
    alarmText
  };
}

/**
 * 심사 도래 기준 판정 (1차 사후: 10개월, 2차 사후: 22개월, 갱신: 33개월)
 * 현재 접속 월이 기준월에 도달하거나 경과한 경우 true 반환
 */
export function checkAuditDueThreshold(
  initDateStr?: string,
  stage?: string,
  currentDate: Date = new Date()
): {
  isDue: boolean;
  isOverdue: boolean;
  targetTotalMonths: number;
  targetYearMonthStr: string;
  stageName: string;
  monthsPassed: number;
  monthsDiff: number;
  effectiveStage: string;
} {
  if (!initDateStr || initDateStr.length < 7) {
    return { isDue: false, isOverdue: false, targetTotalMonths: 0, targetYearMonthStr: '', stageName: stage || '', monthsPassed: 0, monthsDiff: 0, effectiveStage: stage || '' };
  }

  const initDate = new Date(initDateStr);
  if (isNaN(initDate.getTime())) {
    return { isDue: false, isOverdue: false, targetTotalMonths: 0, targetYearMonthStr: '', stageName: stage || '', monthsPassed: 0, monthsDiff: 0, effectiveStage: stage || '' };
  }

  const curYear = currentDate.getFullYear();
  const curMonth = currentDate.getMonth(); // 0-indexed (0=1월, 8=9월)
  const currentTotalMonths = curYear * 12 + curMonth;

  const initYear = initDate.getFullYear();
  const initMonth = initDate.getMonth();
  const initTotalMonths = initYear * 12 + initMonth;

  const monthsDiff = currentTotalMonths - initTotalMonths;

  // 3년 주기 내 차수 산출
  let effectiveStage = stage || '';
  if (!effectiveStage) {
    const yearsDiff = curYear - initYear;
    const cycle = (yearsDiff % 3 + 3) % 3;
    if (cycle === 1) effectiveStage = '1차 사후';
    else if (cycle === 2) effectiveStage = '2차 사후';
    else effectiveStage = '갱신';
  }

  // [수정부분] 36개월 갱신 시점에 cycleCount가 +1 오버슈팅되는 현상 방지
  const cycleCount = Math.max(0, Math.floor(Math.max(0, monthsDiff - 1) / 36));

  let baseMonths = 10; // 1차 사후 기본: 10개월째 달
  if (effectiveStage.includes('2차')) {
    baseMonths = 22; // 2차 사후: 22개월째 달
  } else if (effectiveStage.includes('갱신') || effectiveStage.includes('재인증')) {
    baseMonths = 33; // 갱신: 33개월째 달
  } else if (effectiveStage.includes('1차') || effectiveStage.includes('사후')) {
    baseMonths = 10;
  }

  const targetTotalMonths = initTotalMonths + (cycleCount * 36) + baseMonths;
  
  // [수정부분] 당월 정확 일치(===) 판정으로 교정 및 기한초과(isOverdue) 분리
  const isDue = currentTotalMonths === targetTotalMonths;
  const isOverdue = currentTotalMonths > targetTotalMonths;

  const targetYear = Math.floor(targetTotalMonths / 12);
  const targetMonthNum = (targetTotalMonths % 12) + 1;
  const targetYearMonthStr = `${targetYear}-${String(targetMonthNum).padStart(2, '0')}`;

  return {
    isDue,
    isOverdue,
    targetTotalMonths,
    targetYearMonthStr,
    stageName: effectiveStage,
    monthsPassed: monthsDiff,
    monthsDiff,
    effectiveStage
  };
}

