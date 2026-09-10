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
  nthWeek: string | number; // 1, 2, 3, 4, '1,3', '2,4'
  dayOfWeek: number; // 1: 월, 2: 화, 3: 수, 4: 목, 5: 금
  time: string; // "14:00"
}

export const DEFAULT_COMMITTEE_RULE: CommitteeScheduleRule = {
  nthWeek: '1,3', // 기본 월 2회 (1,3주) 또는 3째주
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
 * 1,3주 또는 2,4주 선택 시 월 2회 발생
 */
export function generateYearlyCommitteeSchedules(year: number = 2026, rule: CommitteeScheduleRule = DEFAULT_COMMITTEE_RULE): CommitteeScheduleItem[] {
  const list: CommitteeScheduleItem[] = [];
  const ruleStr = String(rule.nthWeek);

  for (let m = 1; m <= 12; m++) {
    const mm = String(m).padStart(2, '0');
    const isPast = m < 9;
    const isCurrent = m === 9;

    if (ruleStr === '1,3') {
      // 1째주 및 3째주 2회 발생
      const d1 = calculateNthDayOfWeek(year, m, 1, rule.dayOfWeek);
      list.push({
        id: `comm-sched-${year}-${mm}-1`,
        sessionNumber: `제${year}-${mm}-1차 정기 심의위원회`,
        date: d1,
        time: rule.time || '14:00',
        status: isPast ? '완료' : isCurrent ? '확정' : '예정',
        notes: `정기 심의 (1째주 ${DAY_NAMES[rule.dayOfWeek]}요일)`
      });

      const d2 = calculateNthDayOfWeek(year, m, 3, rule.dayOfWeek);
      list.push({
        id: `comm-sched-${year}-${mm}-2`,
        sessionNumber: `제${year}-${mm}-2차 정기 심의위원회`,
        date: d2,
        time: rule.time || '14:00',
        status: isPast ? '완료' : isCurrent ? '확정' : '예정',
        notes: `정기 심의 (3째주 ${DAY_NAMES[rule.dayOfWeek]}요일)`
      });
    } else if (ruleStr === '2,4') {
      // 2째주 및 4째주 2회 발생
      const d1 = calculateNthDayOfWeek(year, m, 2, rule.dayOfWeek);
      list.push({
        id: `comm-sched-${year}-${mm}-1`,
        sessionNumber: `제${year}-${mm}-1차 정기 심의위원회`,
        date: d1,
        time: rule.time || '14:00',
        status: isPast ? '완료' : isCurrent ? '확정' : '예정',
        notes: `정기 심의 (2째주 ${DAY_NAMES[rule.dayOfWeek]}요일)`
      });

      const d2 = calculateNthDayOfWeek(year, m, 4, rule.dayOfWeek);
      list.push({
        id: `comm-sched-${year}-${mm}-2`,
        sessionNumber: `제${year}-${mm}-2차 정기 심의위원회`,
        date: d2,
        time: rule.time || '14:00',
        status: isPast ? '완료' : isCurrent ? '확정' : '예정',
        notes: `정기 심의 (4째주 ${DAY_NAMES[rule.dayOfWeek]}요일)`
      });
    } else {
      // 단일 주차 1회 발생
      const nWeek = Number(rule.nthWeek) || 3;
      const dateStr = calculateNthDayOfWeek(year, m, nWeek, rule.dayOfWeek);
      list.push({
        id: `comm-sched-${year}-${mm}`,
        sessionNumber: `제${year}-${mm}차 정기 심의위원회`,
        date: dateStr,
        time: rule.time || '14:00',
        status: isPast ? '완료' : isCurrent ? '확정' : '예정',
        notes: `정기 심의 (${nWeek}째주 ${DAY_NAMES[rule.dayOfWeek]}요일)`
      });
    }
  }

  // 날짜 오름차순 정렬
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

// 인정원 행사 일정 모델
export interface InstituteEventItem {
  id: string;
  category: '심사원교육' | '심사원세미나' | '고객세미나' | '교육' | '직접입력';
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "09:00"
  endTime: string; // "17:30"
  location?: string;
  targetAudience?: string;
  notes?: string;
  createdAt: string;
}

export const DEFAULT_INSTITUTE_EVENTS: InstituteEventItem[] = [
  {
    id: 'inst-evt-1',
    category: '심사원교육',
    title: '2026년 3분기 ISO 9001/14001 심사원 역량강화 보수교육',
    date: '2026-09-18',
    startTime: '09:30',
    endTime: '17:30',
    location: 'GMSCS 본원 세미나실 1호',
    targetAudience: '상근/비상근 선임심사원 전원',
    notes: 'KAB 인정기준 개정안 및 부적합 판정 실무사례',
    createdAt: '2026-09-01'
  },
  {
    id: 'inst-evt-2',
    category: '고객세미나',
    title: '2026 하반기 ISO 45001 안전보건 & 중대재해처벌법 대응 고객 세미나',
    date: '2026-09-25',
    startTime: '14:00',
    endTime: '17:00',
    location: '서울 양재 aT센터 대회의실',
    targetAudience: '인증 고객사 최고안전책임자(CSO) 및 실무자',
    notes: '위험성평가 및 현장 심사 준비 가이드',
    createdAt: '2026-09-05'
  },
  {
    id: 'inst-evt-3',
    category: '심사원세미나',
    title: 'ESG 공급망 실사 및 ISO 27001 정보보안 심사기법 포럼',
    date: '2026-10-16',
    startTime: '13:30',
    endTime: '18:00',
    location: 'GMSCS 온라인 화상회의(ZOOM)',
    targetAudience: '인증원 심사위원단',
    notes: '글로벌 공급망 ESG 평가 연계 심사 가이드라인',
    createdAt: '2026-09-08'
  }
];

const EVENTS_STORAGE_KEY = 'gmscs_institute_events';

export function loadSavedInstituteEvents(): InstituteEventItem[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load institute events from storage', e);
    }
  }
  return DEFAULT_INSTITUTE_EVENTS;
}

export function saveInstituteEvents(events: InstituteEventItem[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save institute events to storage', e);
    }
  }
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
