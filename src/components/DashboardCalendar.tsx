import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Users, 
  Building2, 
  Tag, 
  Code2, 
  Clock, 
  FileEdit,
  Send, 
  DollarSign
} from 'lucide-react';
import { AuditProject, Auditor, Company } from '../types';

interface DashboardCalendarProps {
  projects: AuditProject[];
  auditors: Auditor[];
  companies: Company[];
  onOpenReport: (reportId: string) => void;
  onSendPlan: (projectId: string) => void;
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  projects,
  auditors,
  companies,
  onOpenReport,
  onSendPlan
}) => {
  // 현재 조회 연도/월 (기본: 2026년 9월)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 1-12

  // 다차원 필터 상태
  const [selectedAuditorId, setSelectedAuditorId] = useState<string>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedIafCode, setSelectedIafCode] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // 선택된 프로젝트 상세 모달
  const [selectedProject, setSelectedProject] = useState<AuditProject | null>(null);

  // IAF 코드 목록 추출
  const iafCodes = useMemo(() => {
    const set = new Set<string>();
    companies.forEach(c => set.add(c.iafCode));
    return Array.from(set);
  }, [companies]);

  // 필터링된 프로젝트 목록
  const filteredProjects = useMemo(() => {
    return projects.filter(proj => {
      if (selectedAuditorId !== 'all' && proj.leadAuditorId !== selectedAuditorId) return false;
      if (selectedCompanyId !== 'all' && proj.companyId !== selectedCompanyId) return false;
      if (selectedStandard !== 'all' && !proj.standards.some(s => s.includes(selectedStandard))) return false;
      if (selectedStatus !== 'all' && proj.status !== selectedStatus) return false;
      if (selectedIafCode !== 'all') {
        const comp = companies.find(c => c.id === proj.companyId);
        if (!comp || comp.iafCode !== selectedIafCode) return false;
      }
      return true;
    });
  }, [projects, selectedAuditorId, selectedCompanyId, selectedStandard, selectedIafCode, selectedStatus, companies]);

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

  // 날짜별 프로젝트 맵핑
  const projectsByDay = useMemo(() => {
    const map: Record<number, AuditProject[]> = {};
    filteredProjects.forEach(proj => {
      const start = new Date(proj.startDate);
      if (start.getFullYear() === currentYear && (start.getMonth() + 1) === currentMonth) {
        const day = start.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(proj);
      }
    });
    return map;
  }, [filteredProjects, currentYear, currentMonth]);

  // 통계 집계
  const stats = useMemo(() => {
    const total = projects.length;
    const pendingSign = projects.filter(p => p.status === '서명대기').length;
    const unpaid = projects.filter(p => p.paymentStatus !== '입금완료').length;
    const thisMonthCount = projects.filter(p => {
      const d = new Date(p.startDate);
      return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
    }).length;

    return { total, pendingSign, unpaid, thisMonthCount };
  }, [projects, currentYear, currentMonth]);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">{currentYear}년 {currentMonth}월 심사 배정</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.thisMonthCount} <span className="text-sm font-normal text-slate-500">건</span></h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">전자서명 대기 보고서</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pendingSign} <span className="text-sm font-normal text-slate-500">건</span></h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">심사비 미수금 관리</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{stats.unpaid} <span className="text-sm font-normal text-slate-500">건</span></h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">등록 총 고객사</p>
            <h3 className="text-2xl font-extrabold text-cyan-700 mt-1">{companies.length} <span className="text-sm font-normal text-slate-500">개사 (300사 관리)</span></h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
            <Filter className="w-4 h-4 text-cyan-600" />
            <span>사무국 다차원 필터 컨트롤러</span>
            <span className="text-xs font-normal text-slate-500">
              (조회 결과: <strong className="text-cyan-700">{filteredProjects.length}</strong>건)
            </span>
          </div>

          {/* Quick Reset */}
          <button
            onClick={() => {
              setSelectedAuditorId('all');
              setSelectedCompanyId('all');
              setSelectedStandard('all');
              setSelectedIafCode('all');
              setSelectedStatus('all');
            }}
            className="text-xs font-semibold text-slate-500 hover:text-cyan-600 transition"
          >
            필터 초기화
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
          {/* 심사원별 필터 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" /> 심사원별
            </label>
            <select
              value={selectedAuditorId}
              onChange={(e) => setSelectedAuditorId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="all">전체 심사원</option>
              {auditors.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.grade})</option>
              ))}
            </select>
          </div>

          {/* 고객사별 필터 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" /> 고객사별
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="all">전체 고객사</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          {/* 규격별 필터 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" /> 심사 규격별
            </label>
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="all">전체 규격</option>
              <option value="9001">ISO 9001 (품질)</option>
              <option value="14001">ISO 14001 (환경)</option>
              <option value="45001">ISO 45001 (안전보건)</option>
              <option value="27001">ISO 27001 (정보보안)</option>
            </select>
          </div>

          {/* 심사코드별(IAF) 필터 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Code2 className="w-3 h-3 text-slate-400" /> 심사코드(IAF)별
            </label>
            <select
              value={selectedIafCode}
              onChange={(e) => setSelectedIafCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="all">전체 IAF 코드</option>
              {iafCodes.map(code => (
                <option key={code} value={code}>IAF {code}</option>
              ))}
            </select>
          </div>

          {/* 진행 상태별 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> 진행 상태별
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="all">전체 상태</option>
              <option value="계획수립">계획수립</option>
              <option value="계획서발송">계획서발송</option>
              <option value="심사진행중">심사진행중</option>
              <option value="보고서작성">보고서작성</option>
              <option value="서명대기">서명대기 (주의)</option>
              <option value="서명완료">서명완료</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Calendar Month Navigation Header */}
        <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-extrabold text-slate-900">
              {currentYear}년 {currentMonth}월
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-white text-slate-600 border border-slate-200 shadow-xs">
              월간 심사 캘린더
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setCurrentYear(2026);
                setCurrentMonth(9);
              }}
              className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition shadow-xs"
            >
              오늘 (2026.09)
            </button>
            <div className="flex space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-bold py-2.5 bg-slate-100/80 text-slate-600">
          <div className="text-rose-600">일</div>
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div className="text-blue-600">토</div>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 gap-[1px] min-h-[580px]">
          {/* Previous Month Blank Days */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="bg-slate-50/60 p-2 min-h-[110px]" />
          ))}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayProjects = projectsByDay[dayNum] || [];
            const dayOfWeek = (firstDayOfWeek + idx) % 7;
            const isToday = currentYear === 2026 && currentMonth === 9 && dayNum === 9; // Today: 2026-09-09

            return (
              <div
                key={`day-${dayNum}`}
                className={`bg-white p-2 min-h-[110px] transition relative ${
                  isToday ? 'bg-cyan-50/50 ring-2 ring-cyan-500 ring-inset' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : dayOfWeek === 0
                        ? 'text-rose-600'
                        : dayOfWeek === 6
                        ? 'text-blue-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayProjects.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayProjects.length}건
                    </span>
                  )}
                </div>

                {/* Day Project Chips */}
                <div className="space-y-1.5">
                  {dayProjects.map((p) => {
                    // Status style for light theme
                    let badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
                    if (p.status === '서명대기') badgeColor = 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-400/40 animate-pulse';
                    if (p.status === '서명완료') badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    if (p.status === '심사진행중') badgeColor = 'bg-cyan-50 text-cyan-800 border-cyan-200';

                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        className={`w-full text-left p-1.5 rounded-lg border text-[11px] font-medium leading-snug transition transform hover:scale-[1.02] shadow-xs ${badgeColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate font-bold">{p.companyName}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-white/80 font-bold border border-current/20 ml-1 shrink-0">
                            {p.appliedMd}MD
                          </span>
                        </div>
                        <div className="text-[10px] opacity-90 truncate mt-0.5 font-semibold">
                          {p.auditType} · {p.leadAuditorName.split(' ')[0]}
                        </div>
                        {p.issuerName !== 'GMSCS' && (
                          <div className="text-[9px] text-amber-700 font-bold truncate">
                            발행: {p.issuerName}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-xl w-full rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                    {selectedProject.auditType}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                    발행기관: {selectedProject.issuerName}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                  {selectedProject.companyName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Body Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">심사 일정</span>
                <p className="font-bold text-slate-800">
                  {selectedProject.startDate} ~ {selectedProject.endDate}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">담당 심사원</span>
                <p className="font-bold text-slate-800">{selectedProject.leadAuditorName}</p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">인증 규격</span>
                <p className="font-bold text-cyan-700">{selectedProject.standards.join(', ')}</p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">심사 MD (KAB 기준 / 실제 적용)</span>
                <p className="font-bold text-slate-800">
                  표준 {selectedProject.kabStandardMd} MD → <span className="text-emerald-700">{selectedProject.appliedMd} MD 적용</span>
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">심사비용 & 수납현황</span>
                <p className="font-bold text-slate-800">
                  ₩{selectedProject.finalFee.toLocaleString()} ({selectedProject.paymentStatus})
                </p>
                {selectedProject.adjustmentReason && (
                  <p className="text-[10px] text-amber-700 font-medium">조정: {selectedProject.adjustmentReason}</p>
                )}
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">세금계산서 발행상태</span>
                <p className="font-bold text-slate-800">{selectedProject.taxInvoiceStatus}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-2 justify-end border-t border-slate-100">
              {/* 심사계획서 발송 */}
              <button
                onClick={() => {
                  onSendPlan(selectedProject.id);
                  alert(`[심사계획서 발송 완료]\n${selectedProject.companyName} 고객사 및 ${selectedProject.leadAuditorName}에게 이메일/알림톡으로 심사계획서가 전송되었습니다.`);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
              >
                <Send className="w-3.5 h-3.5 text-cyan-600" />
                <span>심사계획서 발송</span>
              </button>

              {/* 웹 심사보고서 열기 */}
              {selectedProject.reportId ? (
                <button
                  onClick={() => {
                    const repId = selectedProject.reportId!;
                    setSelectedProject(null);
                    onOpenReport(repId);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>웹 심사보고서 & 전자서명 열기</span>
                </button>
              ) : (
                <button
                  onClick={() => alert('신규 심사보고서 양식을 생성합니다.')}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>보고서 신규 작성</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
