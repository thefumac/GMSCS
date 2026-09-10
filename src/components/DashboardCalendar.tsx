import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  DollarSign
} from 'lucide-react';
import { AuditProject, Auditor, Company } from '../types';
import { ActiveTab, MainCategory } from './Navbar';
import { CompanyAuditHistoryModal } from './CompanyAuditHistoryModal';

interface DashboardCalendarProps {
  projects: AuditProject[];
  auditors: Auditor[];
  companies: Company[];
  onOpenReport: (reportId: string) => void;
  onOpenPdfReport?: (info: { title: string; companyName: string; standard?: string; auditType?: string; auditDate?: string; pdfUrl?: string }) => void;
  onSendPlan: (projectId: string) => void;
  onNavigateTab?: (category: MainCategory, tab: ActiveTab, subTab?: 'settlements' | 'billing') => void;
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  projects,
  auditors,
  companies,
  onOpenReport,
  onOpenPdfReport,
  onSendPlan: _onSendPlan,
  onNavigateTab
}) => {
  // 현재 조회 연도/월 (기본: 2026년 9월)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 1-12

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

  // 심사 일정 매핑 (해당 심사의 각 일자에 기업명 표시)
  const projectsByDate = useMemo(() => {
    const map: Record<string, AuditProject[]> = {};
    projects.forEach(p => {
      const datesToMap = p.auditDates && p.auditDates.length > 0 ? p.auditDates : (p.startDate ? [p.startDate] : []);
      datesToMap.forEach(dateKey => {
        if (!map[dateKey]) map[dateKey] = [];
        if (!map[dateKey].some(item => item.id === p.id)) {
          map[dateKey].push(p);
        }
      });
    });
    return map;
  }, [projects]);

  // 대시보드 통계 계산
  const stats = useMemo(() => {
    const thisMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const nextMonthVal = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYearVal = currentMonth === 12 ? currentYear + 1 : currentYear;
    const nextMonthPrefix = `${nextYearVal}-${String(nextMonthVal).padStart(2, '0')}`;

    const thisMonthProjects = projects.filter(p => p.startDate?.startsWith(thisMonthPrefix));
    const nextMonthProjects = projects.filter(p => p.startDate?.startsWith(nextMonthPrefix));
    
    // 심사비 미수금 건수
    const unpaidProjects = projects.filter(p => p.paymentStatus === '미입금' || p.paymentStatus === '부분입금');

    return {
      thisMonthCount: thisMonthProjects.length,
      nextMonthCount: nextMonthProjects.length,
      nextMonth: nextMonthVal,
      nextYear: nextYearVal,
      unpaid: unpaidProjects.length,
    };
  }, [projects, currentYear, currentMonth]);

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
    <div className="space-y-4">
      {/* 5대 핵심 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. 당월 심사 */}
        <div 
          onClick={() => {
            setCurrentYear(2026);
            setCurrentMonth(9);
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 flex items-center justify-between shadow-2xs hover:shadow-md hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all cursor-pointer group"
          title="클릭 시 당월 심사 달력으로 이동"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition flex items-center gap-1">
              <span>{currentYear}년 {currentMonth}월 심사</span>
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.thisMonthCount} <span className="text-sm font-normal text-slate-500">건</span>
            </h3>
            <p className="text-[10.5px] text-slate-400 mt-0.5">당월 배정 심사</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs group-hover:scale-105 transition-transform">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        {/* 2. 익월 예정 심사 */}
        <div 
          onClick={() => {
            setCurrentYear(stats.nextYear);
            setCurrentMonth(stats.nextMonth);
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 flex items-center justify-between shadow-2xs hover:shadow-md hover:border-indigo-400 hover:ring-2 hover:ring-indigo-100 transition-all cursor-pointer group"
          title="클릭 시 익월 심사 달력으로 이동"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition flex items-center gap-1">
              <span>{stats.nextYear}년 {stats.nextMonth}월 예정 심사</span>
            </p>
            <h3 className="text-2xl font-extrabold text-indigo-700 mt-1">
              {stats.nextMonthCount} <span className="text-sm font-normal text-slate-500">건</span>
            </h3>
            <p className="text-[10.5px] text-slate-400 mt-0.5">익월 계획 수립 심사</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* 3. 심사비 미수금 관리 */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('general-admin', 'finance', 'billing')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 flex items-center justify-between shadow-2xs hover:shadow-md hover:border-rose-400 hover:ring-2 hover:ring-rose-100 transition-all cursor-pointer group"
          title="클릭 시 고객사 심사비용 수납 및 세금계산서 관리로 이동"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 group-hover:text-rose-600 transition">
              심사비 미수금 관리
            </p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
              {stats.unpaid} <span className="text-sm font-normal text-slate-500">건</span>
            </h3>
            <p className="text-[10.5px] text-slate-400 mt-0.5">수납 대사 이동</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs group-hover:scale-105 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Calendar Month Navigation Header */}
        <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-extrabold text-slate-900">
              {currentYear}년 {currentMonth}월
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Day Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center py-2 text-xs font-bold text-slate-700">
          <div className="text-rose-600">일</div>
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div className="text-blue-600">토</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-200">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="min-h-[110px] bg-slate-50/50 p-2 text-slate-300 select-none">
              <span className="font-mono text-xs"></span>
            </div>
          ))}

          {/* Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = currentYear === 2026 && currentMonth === 9 && dayNum === 9;
            const dayOfWeek = (firstDayOfWeek + idx) % 7;
            const dayProjects = projectsByDate[dateStr] || [];

            return (
              <div 
                key={`day-${dayNum}`}
                className={`min-h-[110px] bg-white p-2 flex flex-col justify-between transition ${
                  isToday ? 'bg-cyan-50/20 ring-2 ring-cyan-500 ring-inset' : ''
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <span className={`font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-cyan-600 text-white shadow-2xs' :
                    dayOfWeek === 0 ? 'text-rose-600' :
                    dayOfWeek === 6 ? 'text-blue-600' :
                    'text-slate-800'
                  }`}>
                    {dayNum}
                  </span>
                  {dayProjects.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayProjects.length}건
                    </span>
                  )}
                </div>

                {/* Day Project Chips (클릭 시 심사 이력 팝업 열기) */}
                {/* Day Project Chips (심사업체명만 표시, 클릭 시 심사 상세 및 이력 팝업 열기) */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                  {dayProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => handleProjectClick(proj)}
                      className="px-1.5 py-1 rounded bg-slate-50 hover:bg-sky-50 text-slate-800 hover:text-sky-900 border border-slate-200 hover:border-sky-300 text-[11px] font-semibold truncate cursor-pointer transition shadow-2xs leading-tight"
                      title={`${proj.companyName} (클릭하여 심사상세 및 이력 확인)`}
                    >
                      {proj.companyName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
