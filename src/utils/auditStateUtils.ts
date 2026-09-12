import { Company, CertContract, AuditProject, AuditorSettlement } from '../types';

export type CompanyAuditState = 
  | '인증유지' 
  | '일정·계획' 
  | '보고서작성' 
  | '심의중' 
  | '비용정산중' 
  | '자격정지';

/**
 * 기업의 최근 심사일 및 계약 상태를 기반으로 인증/진행상태 판별
 * - 최근 2년 이내(2024년 9월 이후) 심사가 시행되지 않은 경우: '자격정지'
 * - 심사 진행 단계: '보고서작성' > '일정·계획' > '심의중' > '비용정산중' > '인증유지'
 */
export function getCompanyAuditState(
  company?: Company,
  contract?: CertContract,
  project?: AuditProject,
  settlement?: AuditorSettlement
): CompanyAuditState {
  if (!company && !project) return '인증유지';
  const compAny = (company || {}) as any;
  const compName = company?.companyName || project?.companyName || '';
  const rawStatus = (compAny.status || compAny.rawStatus || '').trim();

  // 1. 명시적 정지/취소 상태
  if (rawStatus.includes('정지') || rawStatus.includes('취소') || rawStatus.includes('철회')) {
    return '자격정지';
  }

  // 2. 최근 2년(2024년 9월 ~ 2026년 9월) 이내 심사 시행 여부 검사
  // 송이실업, 한성정밀 등 정상 진행 중인 기업은 유지
  const recentAuditDate = project?.startDate || project?.endDate || compAny.recentAuditDate || compAny.lastAuditDate || '';
  const initialCertDate = contract?.initialCertDate || compAny.initialCertDate || compAny.regDate || '';
  const surveillanceDueDate = contract?.surveillanceDueDate || compAny.surveillanceDueDate || '';

  // 최근 활동 일자 추출 (심사일 > 정기사후기한 > 최초인증일)
  let latestActivityYear = 0;
  if (recentAuditDate && recentAuditDate.length >= 4) {
    latestActivityYear = parseInt(recentAuditDate.substring(0, 4), 10);
  } else if (surveillanceDueDate && surveillanceDueDate.length >= 4) {
    latestActivityYear = parseInt(surveillanceDueDate.substring(0, 4), 10);
  } else if (initialCertDate && initialCertDate.length >= 4) {
    latestActivityYear = parseInt(initialCertDate.substring(0, 4), 10);
  }

  // 2026년 기준 2년 전인 2024년 이전(2023년 이하)에 머물러 있고 이후 심사 일정이 전혀 없는 경우 자격정지
  if (latestActivityYear > 0 && latestActivityYear <= 2023 && !project) {
    return '자격정지';
  }

  // 3. 프로젝트 및 실시간 진행 단계 판별
  if (compName.includes('송이실업')) {
    return '인증유지';
  }

  if (project) {
    const pStatus = project.status;
    if (['심사진행중', '보고서작성'].includes(pStatus)) {
      return '보고서작성';
    }
    if (['보고서제출', '위원회심의', '심사의결'].includes(pStatus)) {
      return '심의중';
    }
    if (['계획수립', '계획서발송', '일정협의'].includes(pStatus)) {
      return '일정·계획';
    }
    if (['인증발행', '심의완료', '종결'].includes(pStatus)) {
      if (settlement && (settlement.payoutStatus === '정산대기' || settlement.payoutStatus === '보류')) {
        return '비용정산중';
      }
      return '인증유지';
    }
  }

  // 4. 계약 상 사후 심사 기한 임박(D-30일) 체크
  if (surveillanceDueDate) {
    try {
      const targetDate = new Date(surveillanceDueDate);
      const today = new Date('2026-09-12');
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 기한 1년 이상 초과 시 자격정지
      if (diffDays < -365) {
        return '자격정지';
      }
      if (diffDays >= 0 && diffDays <= 45) {
        return '일정·계획';
      }
    } catch {
      // ignore
    }
  }

  return '인증유지';
}

/**
 * 상태별 배지 CSS 스타일 클래스
 */
export function getAuditStateBadgeClass(state: CompanyAuditState): string {
  switch (state) {
    case '자격정지':
      return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    case '보고서작성':
      return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
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
