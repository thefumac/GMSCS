import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  DollarSign,
  CheckCircle2,
  Users
} from 'lucide-react';
import { AuditProject, Auditor, Company } from '../types';
import { ActiveTab, MainCategory } from './Navbar';
import { CompanyAuditHistoryModal } from './CompanyAuditHistoryModal';
import { CommitteeScheduleItem } from '../utils/committeeSchedule';

interface DashboardCalendarProps {
  projects: AuditProject[];
  auditors: Auditor[];
  companies: Company[];
  committeeSchedules?: CommitteeScheduleItem[];
  onOpenReport: (reportId: string) => void;
  onOpenPdfReport?: (info: { title: string; companyName: string; standard?: string; auditType?: string; auditDate?: string; pdfUrl?: string }) => void;
  onSendPlan: (projectId: string) => void;
  onNavigateTab?: (category: MainCategory, tab: ActiveTab, subTab?: 'settlements' | 'billing') => void;
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  projects,
  auditors,
  companies,
  committeeSchedules = [],
  onOpenReport,
  onOpenPdfReport,
  onSendPlan: _onSendPlan,
  onNavigateTab
}) => {
  // 시스템 현재 기준 날짜 (실시간 KST 시간대 반영: 2026-09-13 등)
  const todayDate = useMemo(() => new Date(), []);
  const todayYear = todayDate.getFullYear();
  const todayMonth = todayDate.getMonth() + 1; // 1-12
  const todayDay = todayDate.getDate();
  const todayStr = `${todayYear}-${String(todayMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;

  // 현재 조회 연도/월 (기본: 시스템 현재 연/월)
  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonth); // 1-12

  // 캘린더 보기 탭: 'project' (심사일정) | 'auditor' (심사원별 일정)
  const [viewMode, setViewMode] = useState<'project' | 'auditor'>('project');

  // 심사원 필터 상태 ('all' 또는 특정 심사원 이름)
  const [selectedAuditorFilter, setSelectedAuditorFilter] = useState<string>('all');

  // 선택된 기업 심사이력 모달 상태
  const [historyModalCompany, setHistoryModalCompany] = useState<Company | null>(null);

  // 달력 날짜 계산
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0(일) ~ 6(토)

  // 월 변경 핸들러
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 심사 일정 매핑 (해당 심사의 각 일자에 기업명 표시 - 동일 기업 중복 방지 및 규격 통합)
  const projectsByDate = useMemo(() => {
    const map: Record<string, AuditProject[]> = {};
    projects.forEach(p => {
      let datesToMap: string[] = [];
      if (p.auditDates && p.auditDates.length > 0) {
        datesToMap = p.auditDates;
      } else if (p.startDate && p.endDate && p.startDate !== p.endDate) {
        let cur = new Date(p.startDate);
        const end = new Date(p.endDate);
        while (cur <= end) {
          datesToMap.push(cur.toISOString().slice(0, 10));
          cur.setDate(cur.getDate() + 1);
        }
      } else if (p.startDate) {
        datesToMap = [p.startDate];
      }

      datesToMap.forEach(dateKey => {
        if (!map[dateKey]) map[dateKey] = [];
        const existingIdx = map[dateKey].findIndex(item => item.companyName.trim() === p.companyName.trim());
        if (existingIdx === -1) {
          map[dateKey].push({ ...p });
        } else {
          // 동일 기업 중복 시 규격 합집합 병합
          const existing = map[dateKey][existingIdx];
          const mergedStandards = Array.from(new Set([...(existing.standards || []), ...(p.standards || [])]));
          existing.standards = mergedStandards;
        }
      });
    });
    return map;
  }, [projects]);

  // 심의위원회 일정 매핑
  const committeesByDate = useMemo(() => {
    const map: Record<string, CommitteeScheduleItem[]> = {};
    committeeSchedules.forEach(c => {
      if (!map[c.date]) map[c.date] = [];
      map[c.date].push(c);
    });
    return map;
  }, [committeeSchedules]);

  // 대시보드 통계 계산 (실제 DB 기반 완전 동적 산출)
  const stats = useMemo(() => {
    // 1. 당해년도 전체 심사 및 시행 완료 건수
    const yearProjects = projects.filter(p => p.startDate && p.startDate.startsWith(String(currentYear)));
    const totalYearCount = yearProjects.length;

    // 시행 완료: 오늘 이전 심사일정이거나, 보고서작성/서명완료/심의/인증발행 상태인 심사
    const completedProjects = yearProjects.filter(p => {
      const isPastDate = (p.endDate && p.endDate <= todayStr) || (p.startDate && p.startDate <= todayStr);
      const isFinishedStatus = p.status === '인증발행' || p.status === '심의진행' || p.status === '보고서작성' || p.status === '서명완료' || p.status === '사무국검토대기';
      return isPastDate || isFinishedStatus;
    });
    const completedCount = completedProjects.length;
    const yearCompletionRate = totalYearCount > 0 ? ((completedCount / totalYearCount) * 100).toFixed(1) : '0.0';

    // 2. 당월 심사
    const thisMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const thisMonthProjects = projects.filter(p => {
      if (p.auditDates && p.auditDates.length > 0) {
        return p.auditDates.some(d => d.startsWith(thisMonthPrefix));
      }
      return p.startDate?.startsWith(thisMonthPrefix) || p.endDate?.startsWith(thisMonthPrefix);
    });

    // 3. 익월 심사
    const nextMonthVal = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYearVal = currentMonth === 12 ? currentYear + 1 : currentYear;
    const nextMonthPrefix = `${nextYearVal}-${String(nextMonthVal).padStart(2, '0')}`;
    const nextMonthProjects = projects.filter(p => p.startDate?.startsWith(nextMonthPrefix));

    // 4. 심사비 미수금 관리 (실제 심사가 시행 완료된 건 중 미입금/부분입금만 정확히 집계)
    const completedUnpaidProjects = projects.filter(p => {
      const isUnpaid = p.paymentStatus === '미입금' || p.paymentStatus === '부분입금';
      if (!isUnpaid) return false;
      const isPastDate = (p.endDate && p.endDate <= todayStr) || (p.startDate && p.startDate <= todayStr);
      const isFinishedStatus = p.status === '인증발행' || p.status === '심의진행' || p.status === '보고서작성' || p.status === '서명완료' || p.status === '사무국검토대기';
      return isPastDate || isFinishedStatus;
    });

    const unpaidCount = completedUnpaidProjects.length;
    const unpaidTotal = completedUnpaidProjects.reduce((sum, p) => {
      const fee = p.finalFee || p.billedAmount || p.standardFee || 0;
      const paid = p.paidAmount || 0;
      return sum + Math.max(0, fee - paid);
    }, 0);

    return {
      totalYearCount,
      completedCount,
      yearCompletionRate,
      thisMonthCount: thisMonthProjects.length,
      nextMonthCount: nextMonthProjects.length,
      nextMonth: nextMonthVal,
      nextYear: nextYearVal,
      unpaidCount,
      unpaidTotal
    };
  }, [projects, currentYear, currentMonth, todayStr]);

  // 일자별 심사원 배정 일정 매핑 (심사원별 달력 뷰용 - 동일 심사원/기업 중복 방지)
  const auditorSchedulesByDate = useMemo(() => {
    const map: Record<string, { auditorName: string; role: '책임' | '팀'; project: AuditProject; auditor?: Auditor }[]> = {};

    projects.forEach((p, pIdx) => {
      let datesToMap: string[] = [];
      if (p.auditDates && p.auditDates.length > 0) {
        datesToMap = p.auditDates;
      } else if (p.startDate && p.endDate && p.startDate !== p.endDate) {
        let cur = new Date(p.startDate);
        const end = new Date(p.endDate);
        while (cur <= end) {
          datesToMap.push(cur.toISOString().slice(0, 10));
          cur.setDate(cur.getDate() + 1);
        }
      } else if (p.startDate) {
        datesToMap = [p.startDate];
      }

      // 1. 책임심사원 결정 (프로젝트 leadAuditorName > leadAuditorId > 회사 매핑 > 순환 매핑)
      let leadName = p.leadAuditorName?.trim();
      let matchedAuditor = auditors.find(a => (p.leadAuditorId && a.id === p.leadAuditorId) || (leadName && a.name === leadName));

      if (!leadName || !matchedAuditor) {
        const comp = companies.find(c => c.id === p.companyId || c.companyName === p.companyName);
        if (comp && comp.managingAuditorId) {
          matchedAuditor = auditors.find(a => a.id === comp.managingAuditorId);
          if (matchedAuditor) leadName = matchedAuditor.name;
        }
      }

      if (!leadName && auditors.length > 0) {
        const fallback = auditors[pIdx % auditors.length];
        leadName = fallback.name;
        matchedAuditor = fallback;
      }

      datesToMap.forEach(dateKey => {
        if (!map[dateKey]) map[dateKey] = [];

        if (leadName) {
          const isDup = map[dateKey].some(item => item.auditorName === leadName && item.project.companyName.trim() === p.companyName.trim());
          if (!isDup) {
            map[dateKey].push({
              auditorName: leadName,
              role: '책임',
              project: p,
              auditor: matchedAuditor
            });
          }
        }

        // 2. 팀심사원 추가
        if (p.teamAuditorNames && p.teamAuditorNames.length > 0) {
          p.teamAuditorNames.forEach(tName => {
            if (tName && tName !== leadName) {
              const isDup = map[dateKey].some(item => item.auditorName === tName && item.project.companyName.trim() === p.companyName.trim());
              if (!isDup) {
                const matchedTeam = auditors.find(a => a.name === tName);
                map[dateKey].push({
                  auditorName: tName,
                  role: '팀',
                  project: p,
                  auditor: matchedTeam
                });
              }
            }
          });
        }
      });
    });

    return map;
  }, [projects, auditors, companies]);

  // 당월 심사가 배정된 모든 심사원 목록 (필터 드롭다운용)
  const assignedAuditorNames = useMemo(() => {
    const thisMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const nameSet = new Set<string>();

    Object.entries(auditorSchedulesByDate).forEach(([dateStr, items]) => {
      if (dateStr.startsWith(thisMonthPrefix)) {
        items.forEach(it => nameSet.add(it.auditorName));
      }
    });

    return Array.from(nameSet).sort((a, b) => a.localeCompare(b));
  }, [auditorSchedulesByDate, currentYear, currentMonth]);

  const handleProjectClick = (proj: AuditProject) => {
    // 해당 기업 객체 검색
    const foundCompany: Company = companies.find(c => c.id === proj.companyId || c.companyName === proj.companyName) || {
      id: proj.companyId,
      companyName: proj.companyName,
      ceoName: '대표자',
      bizNumber: '214-88-92810',
      address: '서울특별시 강서구',
      contactPerson: '품질담당',
      contactPhone: '010-0000-0000',
      contactEmail: 'admin@gmscs.co.kr',
      managingAuditorId: proj.leadAuditorId,
      clientType: '직영',
      totalEmployees: 15,
      industry: '제조업',
      iafCode: '14',
      riskLevel: 'Medium',
      createdAt: '2024-01-01'
    };
    setHistoryModalCompany(foundCompany);
  };

  return (
    <div className="space-y-3">
      {/* 상단 4대 핵심 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* 1. 당월 심사 */}
        <div 
          onClick={() => {
            setCurrentYear(todayYear);
            setCurrentMonth(todayMonth);
          }}
          className="bg-white p-3 rounded-lg border border-slate-200/90 flex items-center justify-between shadow-2xs hover:shadow-sm hover:border-blue-400 transition cursor-pointer group"
          title={`클릭 시 당월(${todayMonth}월) 심사 달력으로 이동`}
        >
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold text-slate-500 group-hover:text-blue-600 transition truncate flex items-center gap-1">
              <span>{currentYear}년 {currentMonth}월 심사</span>
            </p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 leading-tight">
              {stats.thisMonthCount} <span className="text-xs font-normal text-slate-500">건</span>
            </h3>
            <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">당월 배정 심사 일정</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>

        {/* 2. 익월 심사 */}
        <div 
          onClick={() => {
            setCurrentYear(stats.nextYear);
            setCurrentMonth(stats.nextMonth);
          }}
          className="bg-white p-3 rounded-lg border border-slate-200/90 flex items-center justify-between shadow-2xs hover:shadow-sm hover:border-indigo-400 transition cursor-pointer group"
          title={`클릭 시 ${stats.nextYear}년 ${stats.nextMonth}월 심사 달력으로 이동`}
        >
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold text-slate-500 group-hover:text-indigo-600 transition truncate flex items-center gap-1">
              <span>{stats.nextYear}년 {stats.nextMonth}월 심사</span>
            </p>
            <h3 className="text-xl font-bold text-indigo-700 mt-0.5 leading-tight">
              {stats.nextMonthCount} <span className="text-xs font-normal text-slate-500">건</span>
            </h3>
            <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">익월 계획 수립 심사</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* 3. 당해년도 심사 완료율 */}
        <div 
          className="bg-white p-3 rounded-lg border border-slate-200/90 flex items-center justify-between shadow-2xs hover:shadow-sm transition cursor-default"
          title="당해년도 전체 심사 건수 대비 시행완료 건수 및 진척도"
        >
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold text-slate-500 truncate flex items-center gap-1">
              <span>{currentYear}년 연간 심사 완료율</span>
            </p>
            <h3 className="text-xl font-bold text-emerald-800 mt-0.5 leading-tight">
              {stats.completedCount} <span className="text-xs text-slate-400 font-normal">/ {stats.totalYearCount}건</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-bold text-emerald-600">{stats.yearCompletionRate}%</span>
              <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, parseFloat(stats.yearCompletionRate))}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400">완료</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* 4. 심사비 미수금 관리 */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('general-admin', 'finance', 'billing')}
          className="bg-white p-3 rounded-lg border border-slate-200/90 flex items-center justify-between shadow-2xs hover:shadow-sm hover:border-rose-400 transition cursor-pointer group"
          title="클릭 시 고객사 심사비용 수납 및 세금계산서 관리로 이동 (시행 완료 심사 기준)"
        >
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold text-slate-500 group-hover:text-rose-600 transition truncate">
              심사비 미수금 (시행완료)
            </p>
            <h3 className="text-xl font-bold text-rose-600 mt-0.5 leading-tight">
              {stats.unpaidCount} <span className="text-xs font-normal text-slate-500">건</span>
            </h3>
            <p className="text-[10.5px] font-semibold text-rose-700 mt-0.5 truncate" title={`시행 완료건 총 미수액: ${stats.unpaidTotal.toLocaleString()}원`}>
              미수: {stats.unpaidTotal.toLocaleString()}원
            </p>
          </div>
          <div className="w-8 h-8 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Calendar Month Navigation Header & Mode Tabs */}
        <div className="p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80">
          {/* 좌측: [ 연도/월 ] [ < > ] | [ 심사일정 | 심사원별 일정 ] 탭 */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. 연/월 표시 */}
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 shrink-0">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>{currentYear}년 {currentMonth}월</span>
            </h2>

            {/* 2. 연/월 바로 우측 이전/다음달 이동 버튼 */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-md bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-2xs cursor-pointer"
                title="이전 달 이동"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-md bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-2xs cursor-pointer"
                title="다음 달 이동"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 구분선 */}
            <div className="h-5 w-px bg-slate-300 hidden sm:block"></div>

            {/* 3. 달력 전환 탭: [심사일정 (기존 달력)] [심사원별 일정 (심사원별 당월 일정)] */}
            <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg border border-slate-300/80 text-xs font-semibold shrink-0">
              <button
                onClick={() => setViewMode('project')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'project'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>심사일정</span>
              </button>
              <button
                onClick={() => setViewMode('auditor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'auditor'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>심사원별 일정</span>
                {assignedAuditorNames.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    viewMode === 'auditor' ? 'bg-blue-100 text-blue-800' : 'bg-slate-300/70 text-slate-700'
                  }`}>
                    {assignedAuditorNames.length}명
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 우측 정보 / 부가 도구 */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            {viewMode === 'project' ? (
              <div className="flex items-center space-x-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-100 border border-purple-300"></span>
                  <span className="text-slate-600 text-[11.5px]">⚖️ 심의위원회</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-300"></span>
                  <span className="text-slate-600 text-[11.5px]">🏢 인증심사 (클릭 시 이력)</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* 심사원 필터 선택 셀렉트 */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11.5px] font-medium text-slate-600">심사원 선택:</span>
                  <select
                    value={selectedAuditorFilter}
                    onChange={(e) => setSelectedAuditorFilter(e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800 cursor-pointer"
                  >
                    <option value="all">전체 심사원 ({assignedAuditorNames.length}명)</option>
                    {assignedAuditorNames.map(name => (
                      <option key={name} value={name}>{name} 심사원</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
                    <span className="text-slate-600 text-[11px]">책임심사</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-100 border border-indigo-300"></span>
                    <span className="text-slate-600 text-[11px]">팀심사</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Day Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center py-1.5 text-xs font-semibold text-slate-700">
          <div className="text-rose-600">일</div>
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div className="text-blue-600">토</div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: [심사일정 (기존 월간 달력 그리드 - 기업명 위주)]                     */}
        {/* ========================================================================= */}
        {viewMode === 'project' && (
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {/* Empty cells before month starts */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[105px] bg-slate-50/50 p-1.5 text-slate-300 select-none">
                <span className="font-mono text-xs"></span>
              </div>
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = currentYear === todayYear && currentMonth === todayMonth && dayNum === todayDay;
              const dayOfWeek = (firstDayOfWeek + idx) % 7;
              const dayProjects = projectsByDate[dateStr] || [];
              const dayCommittees = committeesByDate[dateStr] || [];

              return (
                <div 
                  key={`day-${dayNum}`}
                  className={`min-h-[105px] bg-white p-1.5 flex flex-col justify-between transition ${
                    isToday ? 'bg-cyan-50/20 ring-2 ring-cyan-500 ring-inset' : ''
                  }`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className={`font-mono text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-cyan-600 text-white shadow-2xs font-bold' :
                      dayOfWeek === 0 ? 'text-rose-600' :
                      dayOfWeek === 6 ? 'text-blue-600' :
                      'text-slate-800'
                    }`}>
                      {dayNum}
                    </span>
                    {(dayProjects.length > 0 || dayCommittees.length > 0) && (
                      <span className="text-[10px] font-normal text-slate-400">
                        {dayProjects.length + dayCommittees.length}건
                      </span>
                    )}
                  </div>

                  {/* Day Project & Committee Chips */}
                  <div className="space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {/* 심의위원회 일정 배지 */}
                    {dayCommittees.map(comm => (
                      <div
                        key={comm.id}
                        className="px-1.5 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-normal truncate transition shadow-2xs leading-tight flex items-center gap-1 cursor-default"
                        title={`${comm.sessionNumber} (${comm.time || '14:00'}) - ${comm.status}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0"></span>
                        <span className="truncate">⚖️ {comm.sessionNumber}</span>
                      </div>
                    ))}

                    {/* 심사 기업 목록 */}
                    {dayProjects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => handleProjectClick(proj)}
                        className="px-1.5 py-0.5 rounded bg-slate-50 hover:bg-sky-50 text-slate-800 hover:text-sky-900 border border-slate-200 hover:border-sky-300 text-[11px] font-normal truncate cursor-pointer transition shadow-2xs leading-tight"
                        title={`${proj.companyName} (책임: ${proj.leadAuditorName || '-'} / 클릭하여 심사상세 및 이력 확인)`}
                      >
                        {proj.companyName}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: [심사원별 일정 (동일한 달력에 당월 심사원별 배정 일정 표시)]          */}
        {/* ========================================================================= */}
        {viewMode === 'auditor' && (
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {/* Empty cells before month starts */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`auditor-empty-${idx}`} className="min-h-[105px] bg-slate-50/50 p-1.5 text-slate-300 select-none">
                <span className="font-mono text-xs"></span>
              </div>
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = currentYear === todayYear && currentMonth === todayMonth && dayNum === todayDay;
              const dayOfWeek = (firstDayOfWeek + idx) % 7;
              
              // 해당 일자의 모든 심사원 배정 목록
              const allAuditorDaySchedules = auditorSchedulesByDate[dateStr] || [];
              
              // 필터 적용
              const dayAuditorSchedules = selectedAuditorFilter === 'all'
                ? allAuditorDaySchedules
                : allAuditorDaySchedules.filter(item => item.auditorName === selectedAuditorFilter);

              return (
                <div 
                  key={`auditor-day-${dayNum}`}
                  className={`min-h-[105px] bg-white p-1.5 flex flex-col justify-between transition ${
                    isToday ? 'bg-cyan-50/20 ring-2 ring-cyan-500 ring-inset' : ''
                  }`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className={`font-mono text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-cyan-600 text-white shadow-2xs font-bold' :
                      dayOfWeek === 0 ? 'text-rose-600' :
                      dayOfWeek === 6 ? 'text-blue-600' :
                      'text-slate-800'
                    }`}>
                      {dayNum}
                    </span>
                    {dayAuditorSchedules.length > 0 && (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1 rounded">
                        {dayAuditorSchedules.length}명
                      </span>
                    )}
                  </div>

                  {/* Day Auditor Schedule Chips */}
                  <div className="space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {dayAuditorSchedules.map((item, aIdx) => {
                      const isLead = item.role === '책임';
                      return (
                        <div
                          key={`${item.project.id}-${item.auditorName}-${aIdx}`}
                          onClick={() => handleProjectClick(item.project)}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-normal truncate cursor-pointer transition shadow-2xs leading-tight flex items-center gap-1 border ${
                            isLead
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200 hover:border-blue-400'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200 hover:border-indigo-400'
                          }`}
                          title={`[${isLead ? '책임심사원' : '팀심사원'}] ${item.auditorName} - ${item.project.companyName}\n심사유형: ${item.project.auditType} (${item.project.standards?.join(', ') || 'ISO'})\n클릭 시 심사 상세 및 이력 확인`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isLead ? 'bg-blue-600' : 'bg-indigo-500'
                          }`}></span>
                          <span className="font-bold shrink-0">{item.auditorName}</span>
                          <span className="text-slate-400 text-[10px]">|</span>
                          <span className="truncate text-slate-700">{item.project.companyName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 기업 심사 이력 팝업 모달 */}
      <CompanyAuditHistoryModal
        isOpen={!!historyModalCompany}
        onClose={() => setHistoryModalCompany(null)}
        company={historyModalCompany}
        projects={projects}
        allAuditors={auditors}
        onOpenReport={onOpenReport}
        onOpenPdfReport={onOpenPdfReport}
      />
    </div>
  );
};


