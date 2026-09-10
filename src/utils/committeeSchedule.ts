export interface CommitteeScheduleItem {
  id: string;
  sessionNumber: string; // 예: "제2026-09차 정기 심의위원회"
  date: string; // "YYYY-MM-DD"
  time?: string; // "14:00"
  status: '예정' | '확정' | '완료';
  notes?: string;
  isCustom?: boolean;
}

export interface CommitteeScheduleRule {
  nthWeek: number; // 1, 2, 3, 4
  dayOfWeek: number; // 1: 월, 2: 화, 3: 수, 4: 목, 5: 금
  time: string; // "14:00"
}

export const DEFAULT_COMMITTEE_RULE: CommitteeScheduleRule = {
  nthWeek: 3, // 매월 3째주
  dayOfWeek: 4, // 목요일
  time: '14:00'
};

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 특정 연월의 N번째 특정 요일 날짜를 계산하여 YYYY-MM-DD 형식으로 반환
 */
export function calculateNthDayOfWeek(year: number, month: number, nthWeek: number, dayOfWeek: number): string {
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay();
  let day = 1 + ((dayOfWeek - firstDayOfWeek + 7) % 7);
  day += (nthWeek - 1) * 7;

  // 월의 총 일수 체크
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    day -= 7; // 초과 시 직전 주로 조정
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * 주어진 연도에 대해 기본 규칙에 따른 12개월 심의위원회 일정 생성
 */
export function generateYearlyCommitteeSchedules(year: number = 2026, rule: CommitteeScheduleRule = DEFAULT_COMMITTEE_RULE): CommitteeScheduleItem[] {
  const list: CommitteeScheduleItem[] = [];

  for (let m = 1; m <= 12; m++) {
    const dateStr = calculateNthDayOfWeek(year, m, rule.nthWeek, rule.dayOfWeek);
    const mm = String(m).padStart(2, '0');
    
    // 2026년 9월 이전은 완료 또는 확정, 현재/이후는 예정
    const isPast = m < 9;
    const isCurrent = m === 9;

    list.push({
      id: `comm-sched-${year}-${mm}`,
      sessionNumber: `제${year}-${mm}차 정기 심의위원회`,
      date: dateStr,
      time: rule.time || '14:00',
      status: isPast ? '완료' : isCurrent ? '확정' : '예정',
      notes: `정기 심의 (${rule.nthWeek}째주 ${DAY_NAMES[rule.dayOfWeek]}요일)`
    });
  }

  return list;
}

const STORAGE_KEY = 'gmscs_committee_schedules';
const RULE_STORAGE_KEY = 'gmscs_committee_rule';

export function loadSavedCommitteeSchedules(): CommitteeScheduleItem[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load committee schedules from storage', e);
    }
  }
  return generateYearlyCommitteeSchedules(2026, DEFAULT_COMMITTEE_RULE);
}

export function saveCommitteeSchedules(schedules: CommitteeScheduleItem[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    } catch (e) {
      console.error('Failed to save committee schedules to storage', e);
    }
  }
}

export function loadSavedCommitteeRule(): CommitteeScheduleRule {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(RULE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load committee rule from storage', e);
    }
  }
  return DEFAULT_COMMITTEE_RULE;
}

export function saveCommitteeRule(rule: CommitteeScheduleRule): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(RULE_STORAGE_KEY, JSON.stringify(rule));
    } catch (e) {
      console.error('Failed to save committee rule to storage', e);
    }
  }
}

/**
 * 기준 날짜 이후의 가장 가까운 심의위원회 개최일(YYYY-MM-DD)을 찾음
 */
export function findNextCommitteeMeetingDate(
  baseDate: string | undefined, 
  schedules: CommitteeScheduleItem[]
): string | null {
  const targetDate = baseDate || new Date().toISOString().slice(0, 10);
  
  // 기준일 이후 일정 중 가장 빠른 날짜
  const upcoming = schedules
    .filter(s => s.date >= targetDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length > 0) {
    return upcoming[0].date;
  }

  // 없으면 가장 마지막 예정 일정
  const allSorted = [...schedules].sort((a, b) => a.date.localeCompare(b.date));
  return allSorted.length > 0 ? allSorted[allSorted.length - 1].date : null;
}
