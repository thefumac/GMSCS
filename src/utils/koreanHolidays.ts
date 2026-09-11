// ============================================================
// 대한민국 법정 공휴일, 대체공휴일, 정부 지정 임시공휴일 판별 모듈
// (한국천문연구원 특일 정보 및 관공서 공휴일 기준)
// ============================================================

export interface HolidayItem {
  date: string; // YYYY-MM-DD
  name: string;
  type: '법정공휴일' | '대체공휴일' | '임시공휴일' | '선거일';
}

// 2024년 ~ 2027년 대한민국 공식 공휴일, 대체공휴일, 임시공휴일 마스터 DB
export const KOREAN_HOLIDAYS: Record<string, HolidayItem> = {
  // --- 2024년 ---
  '2024-01-01': { date: '2024-01-01', name: '신정 (1월 1일)', type: '법정공휴일' },
  '2024-02-09': { date: '2024-02-09', name: '설날 연휴', type: '법정공휴일' },
  '2024-02-10': { date: '2024-02-10', name: '설날 당일', type: '법정공휴일' },
  '2024-02-11': { date: '2024-02-11', name: '설날 연휴', type: '법정공휴일' },
  '2024-02-12': { date: '2024-02-12', name: '설날 대체공휴일', type: '대체공휴일' },
  '2024-03-01': { date: '2024-03-01', name: '3·1절', type: '법정공휴일' },
  '2024-04-10': { date: '2024-04-10', name: '제22대 국회의원 선거일', type: '선거일' },
  '2024-05-05': { date: '2024-05-05', name: '어린이날', type: '법정공휴일' },
  '2024-05-06': { date: '2024-05-06', name: '어린이날 대체공휴일', type: '대체공휴일' },
  '2024-05-15': { date: '2024-05-15', name: '부처님오신날', type: '법정공휴일' },
  '2024-06-06': { date: '2024-06-06', name: '현충일', type: '법정공휴일' },
  '2024-08-15': { date: '2024-08-15', name: '광복절', type: '법정공휴일' },
  '2024-09-16': { date: '2024-09-16', name: '추석 연휴', type: '법정공휴일' },
  '2024-09-17': { date: '2024-09-17', name: '추석 당일', type: '법정공휴일' },
  '2024-09-18': { date: '2024-09-18', name: '추석 연휴', type: '법정공휴일' },
  '2024-10-01': { date: '2024-10-01', name: '국군의 날 (임시공휴일)', type: '임시공휴일' },
  '2024-10-03': { date: '2024-10-03', name: '개천절', type: '법정공휴일' },
  '2024-10-09': { date: '2024-10-09', name: '한글날', type: '법정공휴일' },
  '2024-12-25': { date: '2024-12-25', name: '성탄절', type: '법정공휴일' },

  // --- 2025년 ---
  '2025-01-01': { date: '2025-01-01', name: '신정', type: '법정공휴일' },
  '2025-01-28': { date: '2025-01-28', name: '설날 연휴', type: '법정공휴일' },
  '2025-01-29': { date: '2025-01-29', name: '설날 당일', type: '법정공휴일' },
  '2025-01-30': { date: '2025-01-30', name: '설날 연휴', type: '법정공휴일' },
  '2025-03-01': { date: '2025-03-01', name: '3·1절', type: '법정공휴일' },
  '2025-03-03': { date: '2025-03-03', name: '3·1절 대체공휴일', type: '대체공휴일' },
  '2025-05-05': { date: '2025-05-05', name: '어린이날 / 부처님오신날', type: '법정공휴일' },
  '2025-05-06': { date: '2025-05-06', name: '어린이날/부처님오신날 대체공휴일', type: '대체공휴일' },
  '2025-06-06': { date: '2025-06-06', name: '현충일', type: '법정공휴일' },
  '2025-08-15': { date: '2025-08-15', name: '광복절', type: '법정공휴일' },
  '2025-10-03': { date: '2025-10-03', name: '개천절', type: '법정공휴일' },
  '2025-10-05': { date: '2025-10-05', name: '추석 연휴', type: '법정공휴일' },
  '2025-10-06': { date: '2025-10-06', name: '추석 당일', type: '법정공휴일' },
  '2025-10-07': { date: '2025-10-07', name: '추석 연휴', type: '법정공휴일' },
  '2025-10-08': { date: '2025-10-08', name: '추석 대체공휴일', type: '대체공휴일' },
  '2025-10-09': { date: '2025-10-09', name: '한글날', type: '법정공휴일' },
  '2025-12-25': { date: '2025-12-25', name: '성탄절', type: '법정공휴일' },

  // --- 2026년 ---
  '2026-01-01': { date: '2026-01-01', name: '신정', type: '법정공휴일' },
  '2026-02-16': { date: '2026-02-16', name: '설날 연휴', type: '법정공휴일' },
  '2026-02-17': { date: '2026-02-17', name: '설날 당일', type: '법정공휴일' },
  '2026-02-18': { date: '2026-02-18', name: '설날 연휴', type: '법정공휴일' },
  '2026-03-01': { date: '2026-03-01', name: '3·1절', type: '법정공휴일' },
  '2026-03-02': { date: '2026-03-02', name: '3·1절 대체공휴일', type: '대체공휴일' },
  '2026-05-05': { date: '2026-05-05', name: '어린이날', type: '법정공휴일' },
  '2026-05-24': { date: '2026-05-24', name: '부처님오신날', type: '법정공휴일' },
  '2026-05-25': { date: '2026-05-25', name: '부처님오신날 대체공휴일', type: '대체공휴일' },
  '2026-06-03': { date: '2026-06-03', name: '제9회 전국동시지방선거일', type: '선거일' },
  '2026-06-06': { date: '2026-06-06', name: '현충일', type: '법정공휴일' },
  '2026-08-15': { date: '2026-08-15', name: '광복절', type: '법정공휴일' },
  '2026-08-17': { date: '2026-08-17', name: '광복절 대체공휴일', type: '대체공휴일' },
  '2026-09-24': { date: '2026-09-24', name: '추석 연휴', type: '법정공휴일' },
  '2026-09-25': { date: '2026-09-25', name: '추석 당일', type: '법정공휴일' },
  '2026-09-26': { date: '2026-09-26', name: '추석 연휴', type: '법정공휴일' },
  '2026-10-03': { date: '2026-10-03', name: '개천절', type: '법정공휴일' },
  '2026-10-05': { date: '2026-10-05', name: '개천절 대체공휴일', type: '대체공휴일' },
  '2026-10-09': { date: '2026-10-09', name: '한글날', type: '법정공휴일' },
  '2026-12-25': { date: '2026-12-25', name: '성탄절', type: '법정공휴일' },

  // --- 2027년 ---
  '2027-01-01': { date: '2027-01-01', name: '신정', type: '법정공휴일' },
  '2027-02-06': { date: '2027-02-06', name: '설날 연휴', type: '법정공휴일' },
  '2027-02-07': { date: '2027-02-07', name: '설날 당일', type: '법정공휴일' },
  '2027-02-08': { date: '2027-02-08', name: '설날 연휴', type: '법정공휴일' },
  '2027-02-09': { date: '2027-02-09', name: '설날 대체공휴일', type: '대체공휴일' },
  '2027-03-01': { date: '2027-03-01', name: '3·1절', type: '법정공휴일' },
  '2027-05-05': { date: '2027-05-05', name: '어린이날', type: '법정공휴일' },
  '2027-05-13': { date: '2027-05-13', name: '부처님오신날', type: '법정공휴일' },
  '2027-06-06': { date: '2027-06-06', name: '현충일', type: '법정공휴일' },
  '2027-06-07': { date: '2027-06-07', name: '현충일 대체공휴일', type: '대체공휴일' },
  '2027-08-15': { date: '2027-08-15', name: '광복절', type: '법정공휴일' },
  '2027-08-16': { date: '2027-08-16', name: '광복절 대체공휴일', type: '대체공휴일' },
  '2027-09-14': { date: '2027-09-14', name: '추석 연휴', type: '법정공휴일' },
  '2027-09-15': { date: '2027-09-15', name: '추석 당일', type: '법정공휴일' },
  '2027-09-16': { date: '2027-09-16', name: '추석 연휴', type: '법정공휴일' },
  '2027-10-03': { date: '2027-10-03', name: '개천절', type: '법정공휴일' },
  '2027-10-04': { date: '2027-10-04', name: '개천절 대체공휴일', type: '대체공휴일' },
  '2027-10-09': { date: '2027-10-09', name: '한글날', type: '법정공휴일' },
  '2027-10-11': { date: '2027-10-11', name: '한글날 대체공휴일', type: '대체공휴일' },
  '2027-12-25': { date: '2027-12-25', name: '성탄절', type: '법정공휴일' },
};

/**
 * 특정 날짜가 주말(토/일)이거나 공휴일(법정/대체/임시)인지 판별
 */
export function isWeekendOrHoliday(dateStr: string): {
  isRestDay: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  holidayType?: string;
} {
  if (!dateStr) {
    return { isRestDay: false, isWeekend: false, isHoliday: false };
  }

  // 1. 공휴일 DB 조회
  const holiday = KOREAN_HOLIDAYS[dateStr];
  const isHoliday = !!holiday;

  // 2. 토/일 요일 판별
  let isWeekend = false;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDay();
      isWeekend = (day === 0 || day === 6);
    }
  } catch {
    // ignore
  }

  const isRestDay = isHoliday || isWeekend;

  return {
    isRestDay,
    isWeekend,
    isHoliday,
    holidayName: holiday?.name || (isWeekend ? (new Date(dateStr).getDay() === 0 ? '일요일' : '토요일') : undefined),
    holidayType: holiday?.type || (isWeekend ? '주말' : undefined)
  };
}

/**
 * 심사 시작일 ~ 종료일 기간 중 주말 또는 공휴일이 포함되어 있는지 종합 판별
 */
export function checkAuditPeriodForHolidays(startDate: string, endDate: string): {
  hasWeekendOrHoliday: boolean;
  matchedList: { date: string; name: string; type: string }[];
  summaryText: string;
} {
  if (!startDate || !endDate) {
    return { hasWeekendOrHoliday: false, matchedList: [], summaryText: '' };
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { hasWeekendOrHoliday: false, matchedList: [], summaryText: '' };
    }

    const matchedList: { date: string; name: string; type: string }[] = [];

    // 루프: 시작일부터 종료일까지 매일 순회
    const current = new Date(start);
    while (current <= end) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const res = isWeekendOrHoliday(dateStr);
      if (res.isRestDay) {
        matchedList.push({
          date: dateStr,
          name: res.holidayName || '휴일',
          type: res.holidayType || '휴일'
        });
      }

      current.setDate(current.getDate() + 1);
    }

    const hasWeekendOrHoliday = matchedList.length > 0;
    const summaryText = matchedList.map(m => `${m.date}(${m.name})`).join(', ');

    return {
      hasWeekendOrHoliday,
      matchedList,
      summaryText
    };
  } catch {
    return { hasWeekendOrHoliday: false, matchedList: [], summaryText: '' };
  }
}
