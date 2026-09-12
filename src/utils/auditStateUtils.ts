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
 * 상태별 공통 배지 CSS 스타일 클래스
 */
export function getAuditStateBadgeClass(state: CompanyAuditState): string {
  switch (state) {
    case '자격정지':
      return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    case '보고서작성':
      return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
    case '사무국검토':
      return 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
    case '일정·계획':
      return 'bg-cyan-50 text-cyan-800 border-cyan-200 font-bold';
    case '심의중':
      return 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
    case '비용정산중':
      return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    case '인증유지':
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
  }
}

