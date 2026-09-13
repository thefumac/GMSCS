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
 * ISO 3년 주기 기반 심사 차수 판별 (하드코딩 회사명 제거)
 */
export function getStandardAuditStage(
  company: Company, 
  contract?: CertContract, 
  project?: AuditProject
): AuditStageCycle {
  // 1. 활성 프로젝트에 명시된 auditType 우선
  if (project?.auditType) {
    const t = project.auditType;
    if (t.includes('최초') || t.includes('1-2단계')) return '최초심사';
    if (t.includes('1차') || t.includes('사후1')) return '1차 사후';
    if (t.includes('2차') || t.includes('사후2')) return '2차 사후';
    if (t.includes('갱신') || t.includes('재인증')) return '갱신';
    if (t.includes('전환')) return '전환';
  }

  // 2. 회사 또는 계약 정보의 전환 여부
  if (company.isTransfer || (company as any).transferType) {
    return '전환';
  }

  // 3. 최초 인증일 및 유효기간 만료일 기반 ISO 3년 주기 동적 계산
  const initDate = contract?.initialCertDate || company.initialCertDate || company.initialContractDate;
  if (initDate && initDate.length >= 4) {
    const startYear = parseInt(initDate.substring(0, 4), 10);
    const currentYear = new Date().getFullYear(); // 2026
    const diff = currentYear - startYear;

    if (diff <= 0) return '최초심사';
    const cyclePos = diff % 3;
    if (cyclePos === 1) return '1차 사후';
    if (cyclePos === 2) return '2차 사후';
    return '갱신';
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
      const today = new Date('2026-09-12');
      const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // 1년 이상 초과 시 자격정지
      if (diffDays < -365) return '자격정지';
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
 * 12 / 24 / 34개월 인증서 발행 마감 및 60일 사전 준비 알람 계산 인터페이스
 */
export interface AuditTimelineStatus {
  stage: AuditStageCycle;
  initialCertDate: string;
  deadlineDate: string; // YYYY-MM-DD (발행 마감일: 1차=12개월, 2차=24개월, 갱신=34개월)
  prepStartDate: string; // YYYY-MM-DD (준비 착수일 = 마감일 - 60일)
  daysRemainingToDeadline: number; // 마감일까지 남은 일수
  daysRemainingToPrep: number; // 준비착수일까지 남은 일수 (음수면 이미 준비 착수 시기 도래)
  isPrepAlert: boolean; // 60일 전 도래 여부 (심사 준비 착수 / 일정 조율 필요)
  isOverdue: boolean; // 발행 마감 초과 여부
  alarmText: string;
}

/**
 * 최초 인증일 기준 12 / 24 / 34개월 발행 마감 및 60일 리드타임 알람 산출
 * (기준일: 2026-09-12 / 현재 날짜)
 */
export function getAuditTimelineStatus(
  company: Company,
  contract?: CertContract,
  project?: AuditProject
): AuditTimelineStatus | null {
  const initDateStr = contract?.initialCertDate || company.initialCertDate || company.initialContractDate;
  if (!initDateStr || initDateStr.length < 10) return null;

  const stage = getStandardAuditStage(company, contract, project);
  const initDate = new Date(initDateStr);
  if (isNaN(initDate.getTime())) return null;

  // 마감 개월수 산정: 1차 사후 = 12개월, 2차 사후 = 24개월, 갱신 = 34개월
  let targetMonths = 12;
  if (stage === '2차 사후') targetMonths = 24;
  else if (stage === '갱신') targetMonths = 34;
  else if (stage === '최초심사') targetMonths = 12;

  // 3년 주기 오프셋 보정 (예: 4년차=사후1차(48개월), 5년차=사후2차(60개월), 6년차=갱신(70개월))
  const today = new Date('2026-09-12');
  const yearsPassed = today.getFullYear() - initDate.getFullYear();
  const cycleCount = Math.floor(yearsPassed / 3);
  if (cycleCount > 0) {
    targetMonths += cycleCount * 36;
  }

  // 마감일 계산
  const deadline = new Date(initDate);
  deadline.setMonth(deadline.getMonth() + targetMonths);

  // 60일 사전 준비 착수일
  const prepDate = new Date(deadline);
  prepDate.setDate(prepDate.getDate() - 60);

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

