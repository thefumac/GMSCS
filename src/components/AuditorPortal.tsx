import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Search, 
  Send, 
  AlertCircle, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Calendar as CalendarIcon, 
  Layers, 
  X, 
  Megaphone,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Award
} from 'lucide-react';
import { Auditor, Company, AuditProject, CertContract, AuditorSettlement, AuditReport, AuditorNotice } from '../types';
import { CompanyAuditHistoryModal } from './CompanyAuditHistoryModal';

export type AuditLifecycleState = 
  | '심사준비' 
  | '계획수립중' 
  | '심사중' 
  | '보고서작성중' 
  | '심사보고' 
  | '보고서보완' 
  | '보고서승인' 
  | '인증유지';

export type SettlementLifecycleState = 
  | '입금확인중' 
  | '입금확인' 
  | '9월 25일 입금예정' 
  | '10월 25일 입금예정'
  | '입금완료';

export interface CompanyWithStatus {
  company: Company;
  contract?: CertContract;
  project?: AuditProject;
  report?: AuditReport;
  settlement?: AuditorSettlement;
  auditState: AuditLifecycleState;
  settlementState: SettlementLifecycleState;
  stageText: string;
  stdAndCerts: { std: string; certNo: string }[];
  dueDate: string;
  prepStartDate: string; // 심사준비 진입일 (기한 4개월 전)
  auditStartDate?: string;
  auditEndDate?: string;
  dday: { days: number; text: string; isUrgent: boolean; isOverdue: boolean };
}

interface AuditorPortalProps {
  currentAuditor: Auditor;
  allAuditors: Auditor[];
  companies: Company[];
  projects: AuditProject[];
  contracts: CertContract[];
  settlements?: AuditorSettlement[];
  notices?: AuditorNotice[];
  onOpenReport: (reportId: string) => void;
  onNavigateToSettlement?: () => void;
  onNavigateToReports?: () => void;
  onRequestReassignment?: (projectId: string, log: any) => void;
  onOpenEmailModal: (recipientName?: string, recipientEmail?: string, templateType?: any) => void;
}

// 심사 단계 계산 (최초, 1차사후, 2차사후, 갱신)
function getAuditStageText(company: Company, contract?: CertContract, project?: AuditProject): string {
  if (project?.auditType) {
    if (project.auditType.includes('최초')) return '최초심사';
    if (project.auditType.includes('1차')) return '1차 사후';
    if (project.auditType.includes('2차')) return '2차 사후';
    if (project.auditType.includes('갱신')) return '갱신심사';
    return project.auditType;
  }
  if (contract?.initialCertDate) {
    const certYear = parseInt(contract.initialCertDate.substring(0, 4), 10);
    const currentYear = 2026;
    const diff = currentYear - certYear;
    if (diff <= 0) return '최초심사';
    if (diff % 3 === 1) return '1차 사후';
    if (diff % 3 === 2) return '2차 사후';
    return '갱신심사';
  }
  return '1차 사후';
}

// 인증 규격 및 인증번호 매핑
function formatStandardsWithCert(comp: Company, contract?: CertContract): { std: string; certNo: string }[] {
  const stds = contract?.standards && contract.standards.length > 0 
    ? contract.standards 
    : ['ISO 9001:2015'];
  
  const baseCert = contract?.certNumber || 'Q260101';
  
  return stds.map((s: string, idx: number) => {
    let prefix = 'Q';
    if (s.includes('14001')) prefix = 'E';
    else if (s.includes('45001')) prefix = 'O';
    else if (s.includes('27001')) prefix = 'IS';
    else if (s.includes('13485')) prefix = 'M';
    else if (s.includes('22000')) prefix = 'FS';

    const numPart = baseCert.replace(/^[A-Za-z]+/, '');
    const certNum = `${prefix}${numPart ? (parseInt(numPart, 10) + idx * 2).toString().padStart(6, '0') : '260' + (100 + idx)}`;
    return { std: s, certNo: certNum };
  });
}

// D-Day 계산
function calculateDDay(targetDateStr: string): { days: number; text: string; isUrgent: boolean; isOverdue: boolean } {
  const target = new Date(targetDateStr);
  const now = new Date(2026, 8, 9); // 기준일 2026-09-09
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: diffDays, text: `D+${Math.abs(diffDays)}일 경과`, isUrgent: true, isOverdue: true };
  } else if (diffDays === 0) {
    return { days: 0, text: 'D-Day (오늘)', isUrgent: true, isOverdue: false };
  } else {
    return { days: diffDays, text: `D-${diffDays}일`, isUrgent: diffDays <= 30, isOverdue: false };
  }
}

// 심사 기한 4개월 전 날짜 계산
function getPrepStartDate(dueDateStr: string): string {
  const d = new Date(dueDateStr);
  d.setMonth(d.getMonth() - 4);
  return d.toISOString().substring(0, 10);
}

// 심사 진행 상태 판별 로직 (준비상태 전까지는 모두 '인증유지')
function computeAuditState(
  daysToDue: number, 
  project?: AuditProject
): AuditLifecycleState {
  if (project) {
    if (project.committeeStatus === '등록승인' || project.status === '인증발행') {
      return '인증유지';
    }
    if (project.status === '보완요청') {
      return '보고서보완';
    }
    if (project.status === '심의대기' || project.status === '심의진행') {
      return '보고서승인';
    }
    if (project.status === '사무국검토대기') {
      return '심사보고';
    }
    if (project.status === '보고서작성' || project.status === '서명대기' || project.status === '서명완료') {
      return '보고서작성중';
    }
    if (project.status === '심사진행중') {
      return '심사중';
    }
    if (project.status === '계획수립' || project.status === '계획서발송') {
      return '계획수립중';
    }
  }

  // 4개월(120일) 이내 진입 시 '심사준비', 그 전 평시는 모두 '인증유지'
  if (daysToDue <= 120 && daysToDue > 30) {
    return '심사준비';
  } else if (daysToDue <= 30 && daysToDue >= 0) {
    return '계획수립중';
  } else if (daysToDue < 0) {
    return '심사준비';
  }
  return '인증유지';
}

// 정산 상태 판별 로직
function computeSettlementState(
  auditState: AuditLifecycleState,
  project?: AuditProject,
  settlement?: AuditorSettlement
): SettlementLifecycleState {
  if (settlement) {
    if (settlement.payoutStatus === '지급완료') {
      return '입금완료';
    }
    if (settlement.payoutStatus === '정산대기') {
      return '9월 25일 입금예정';
    }
  }

  if (project) {
    if (project.paymentStatus === '입금완료') {
      if (['보고서승인', '인증유지'].includes(auditState)) {
        return '9월 25일 입금예정';
      }
      return '입금확인';
    }
    return '입금확인중';
  }

  if (auditState === '인증유지') {
    return '입금완료';
  }
  if (auditState === '보고서승인' || auditState === '심사보고') {
    return '9월 25일 입금예정';
  }
  if (auditState === '심사중' || auditState === '보고서작성중') {
    return '입금확인';
  }
  return '입금확인중';
}

type SortField = 'auditState' | 'no' | 'companyName' | 'standards' | 'iafCode' | 'stageText' | 'dueDate' | 'settlementState';

export const AuditorPortal: React.FC<AuditorPortalProps> = ({
  currentAuditor,
  allAuditors: _allAuditors,
  companies,
  projects,
  contracts,
  settlements = [],
  notices = [],
  onOpenReport,
  onNavigateToReports,
  onOpenEmailModal,
}) => {
  // 상단 뷰 모드: 'ledger' (업체 대장) vs 'monthly' (월간 심사 일정 달력)
  const [activeView, setActiveView] = useState<'ledger' | 'monthly'>('ledger');

  // 월간 일정 선택 년/월 (기본: 2026-09)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  
  // 정렬 상태
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // 모달 상태: 심사 이력 팝업
  const [historyModalCompany, setHistoryModalCompany] = useState<CompanyWithStatus | null>(null);

  // 모달 상태: 심사계획서 & 심사비 청구서 확인 및 동의
  const [planInvoiceModalCompany, setPlanInvoiceModalCompany] = useState<CompanyWithStatus | null>(null);
  const [isAgreedAndSent, setIsAgreedAndSent] = useState<boolean>(false);

  // 모달 상태: 공지사항 상세 팝업
  const [selectedNotice, setSelectedNotice] = useState<AuditorNotice | null>(null);

  // 1. 내 담당 기업 목록
  const myCompanyIds = useMemo(() => {
    const ids = new Set<string>();
    companies.forEach(c => {
      if (c.managingAuditorId === currentAuditor.id) ids.add(c.id);
    });
    projects.forEach(p => {
      if (p.leadAuditorId === currentAuditor.id || p.leadAuditorName?.includes(currentAuditor.name)) {
        ids.add(p.companyId);
      }
    });
    return ids;
  }, [companies, projects, currentAuditor.id, currentAuditor.name]);

  // 2. 통합 데이터 모델링
  const allCompanyItems: CompanyWithStatus[] = useMemo(() => {
    return companies
      .filter(c => myCompanyIds.has(c.id))
      .map(comp => {
        const contract = contracts.find(c => c.companyId === comp.id);
        const project = projects.find(p => p.companyId === comp.id && (p.leadAuditorId === currentAuditor.id || p.leadAuditorName?.includes(currentAuditor.name)));
        const settlement = settlements.find(s => s.companyName === comp.companyName && (s.auditorId === currentAuditor.id || s.auditorName.includes(currentAuditor.name)));
        
        const stageText = getAuditStageText(comp, contract, project);
        const stdAndCerts = formatStandardsWithCert(comp, contract);
        const dueDate = contract?.surveillanceDueDate || contract?.validUntil || (project?.endDate || '2026-10-31');
        const prepStartDate = getPrepStartDate(dueDate);
        const dday = calculateDDay(dueDate);

        const auditState = computeAuditState(dday.days, project);
        const settlementState = computeSettlementState(auditState, project, settlement);

        // 심사 프로젝트 일정 (시작일, 종료일)
        let auditStartDate = project?.startDate;
        let auditEndDate = project?.endDate;
        if (!auditStartDate && auditState === '계획수립중') {
          // 계획수립중일 때 예정 심사일정 2일간
          auditStartDate = dueDate;
          const endD = new Date(dueDate);
          endD.setDate(endD.getDate() + 1);
          auditEndDate = endD.toISOString().substring(0, 10);
        }

        return {
          company: comp,
          contract,
          project,
          settlement,
          auditState,
          settlementState,
          stageText,
          stdAndCerts,
          dueDate,
          prepStartDate,
          auditStartDate,
          auditEndDate,
          dday,
        };
      });
  }, [companies, myCompanyIds, contracts, projects, settlements, currentAuditor]);

  // 3. 3대 핵심 지표 계산
  const totalCompanyCount = allCompanyItems.length;
  const totalCertCount = useMemo(() => {
    return allCompanyItems.reduce((acc, item) => acc + item.stdAndCerts.length, 0);
  }, [allCompanyItems]);

  const standardBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    allCompanyItems.forEach(item => {
      item.stdAndCerts.forEach(sc => {
        const stdKey = sc.std.includes('9001') ? 'ISO 9001' :
                       sc.std.includes('14001') ? 'ISO 14001' :
                       sc.std.includes('45001') ? 'ISO 45001' :
                       sc.std.includes('27001') ? 'ISO 27001' :
                       sc.std.includes('13485') ? 'ISO 13485' : sc.std;
        counts[stdKey] = (counts[stdKey] || 0) + 1;
      });
    });
    return counts;
  }, [allCompanyItems]);

  // 4. 진행 중인 심사 실시간 알림 목록 (텍스트 라인)
  const activeAlertItems = useMemo(() => {
    return allCompanyItems.filter(item => 
      ['심사준비', '계획수립중', '심사중', '보고서작성중', '심사보고', '보고서보완', '보고서승인'].includes(item.auditState)
    ).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [allCompanyItems]);

  // 5. 필터링 & 소팅 (대장 뷰)
  const filteredItems = useMemo(() => {
    return allCompanyItems.filter(item => {
      const { company, stdAndCerts, auditState } = item;
      const matchesSearch = 
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.ceoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.bizNumber.includes(searchTerm);
      
      const matchesStd = selectedStandard === 'all' || stdAndCerts.some(sc => sc.std.includes(selectedStandard));
      const matchesState = selectedStateFilter === 'all' || auditState === selectedStateFilter;

      return matchesSearch && matchesStd && matchesState;
    });
  }, [allCompanyItems, searchTerm, selectedStandard, selectedStateFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'auditState': {
          const statePriority: Record<AuditLifecycleState, number> = {
            '심사준비': 1,
            '계획수립중': 2,
            '심사중': 3,
            '보고서작성중': 4,
            '심사보고': 5,
            '보고서보완': 6,
            '보고서승인': 7,
            '인증유지': 8,
          };
          valA = statePriority[a.auditState] || 99;
          valB = statePriority[b.auditState] || 99;
          break;
        }
        case 'companyName':
          valA = a.company.companyName;
          valB = b.company.companyName;
          break;
        case 'standards':
          valA = a.stdAndCerts.map(s => s.std).join(',');
          valB = b.stdAndCerts.map(s => s.std).join(',');
          break;
        case 'iafCode':
          valA = a.company.iafCode || '';
          valB = b.company.iafCode || '';
          break;
        case 'stageText':
          valA = a.stageText;
          valB = b.stageText;
          break;
        case 'dueDate':
          valA = a.dueDate;
          valB = b.dueDate;
          break;
        case 'settlementState':
          valA = a.settlementState;
          valB = b.settlementState;
          break;
        default:
          valA = a.dueDate;
          valB = b.dueDate;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 inline ml-1" />;
    }
    return sortAsc 
      ? <ArrowUp className="w-3 h-3 text-cyan-600 inline ml-1 font-bold" />
      : <ArrowDown className="w-3 h-3 text-cyan-600 inline ml-1 font-bold" />;
  };

  // =========================================================================
  // 달력 렌더링 데이터 계산 (월간 캘린더 그리드)
  // =========================================================================
  const calendarDays = useMemo(() => {
    const year = selectedYear;
    const month = selectedMonth; // 1-12
    
    // First day of the month
    const firstDay = new Date(year, month - 1, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Last date of the month
    const lastDate = new Date(year, month, 0).getDate(); // 28-31

    // Previous month last date for leading days
    const prevMonthLastDate = new Date(year, month - 1, 0).getDate();

    const days: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: {
        id: string;
        item: CompanyWithStatus;
        type: 'audit-period' | 'prep-start' | 'due-date';
        title: string;
        stage: string;
        isMultiDay: boolean;
        isStartDay: boolean;
        isEndDay: boolean;
        dayIndexText?: string;
        state: AuditLifecycleState;
      }[];
    }[] = [];

    // Leading days from prev month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = prevMonthLastDate - i;
      const prevM = month === 1 ? 12 : month - 1;
      const prevY = month === 1 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      days.push({
        dayNumber: dNum,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    // Current month days
    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === '2026-09-09';
      
      // Find events matching this date
      const events: any[] = [];

      allCompanyItems.forEach(item => {
        // 1. 심사 기간 (2일 이상인 경우 연속 기간 표시)
        if (item.auditStartDate && item.auditEndDate) {
          const start = item.auditStartDate;
          const end = item.auditEndDate;
          if (dateStr >= start && dateStr <= end) {
            const isStartDay = dateStr === start;
            const isEndDay = dateStr === end;
            const isMultiDay = start !== end;
            
            // 일차 계산
            const startD = new Date(start);
            const curD = new Date(dateStr);
            const endD = new Date(end);
            const totalDays = Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const curDayIdx = Math.ceil((curD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            events.push({
              id: `audit-${item.company.id}-${dateStr}`,
              item,
              type: 'audit-period',
              title: item.company.companyName,
              stage: item.stageText,
              isMultiDay,
              isStartDay,
              isEndDay,
              dayIndexText: isMultiDay ? `(${curDayIdx}/${totalDays}일차)` : '',
              state: item.auditState
            });
          }
        } else if (item.dueDate === dateStr && item.auditState !== '인증유지') {
          // 심사 기한일 단일 표시
          events.push({
            id: `due-${item.company.id}`,
            item,
            type: 'due-date',
            title: item.company.companyName,
            stage: item.stageText,
            isMultiDay: false,
            isStartDay: true,
            isEndDay: true,
            state: item.auditState
          });
        }

        // 2. 심사준비 돌입일 (기한 4개월 전)
        if (item.prepStartDate === dateStr) {
          events.push({
            id: `prep-${item.company.id}`,
            item,
            type: 'prep-start',
            title: item.company.companyName,
            stage: item.stageText,
            isMultiDay: false,
            isStartDay: true,
            isEndDay: true,
            state: '심사준비'
          });
        }
      });

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday,
        events
      });
    }

    // Trailing days to fill 7 columns (up to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextM = month === 12 ? 1 : month + 1;
      const nextY = month === 12 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    return days;
  }, [allCompanyItems, selectedYear, selectedMonth]);

  // 상태별 텍스트 색상 및 볼드 스타일 (단추 박스 제거)
  const getAuditStateTextClass = (state: AuditLifecycleState) => {
    switch (state) {
      case '심사준비':
        return 'text-amber-700 font-extrabold';
      case '계획수립중':
        return 'text-blue-700 font-extrabold';
      case '심사중':
        return 'text-purple-700 font-black';
      case '보고서작성중':
        return 'text-orange-700 font-extrabold';
      case '심사보고':
        return 'text-indigo-700 font-extrabold';
      case '보고서보완':
        return 'text-rose-700 font-extrabold';
      case '보고서승인':
        return 'text-teal-700 font-extrabold';
      case '인증유지':
        return 'text-emerald-700 font-bold';
      default:
        return 'text-slate-700 font-semibold';
    }
  };

  const getSettlementStateTextClass = (state: SettlementLifecycleState) => {
    switch (state) {
      case '입금확인중':
        return 'text-slate-500 font-medium';
      case '입금확인':
        return 'text-blue-700 font-bold';
      case '9월 25일 입금예정':
      case '10월 25일 입금예정':
        return 'text-amber-700 font-bold';
      case '입금완료':
        return 'text-emerald-700 font-bold';
      default:
        return 'text-slate-600 font-medium';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* ========================================================================= */}
      {/* 1. 상단: 인증원 공지사항 & 자동 심사 진행 알림 (단추 박스 없는 깔끔한 텍스트 리스트) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* 1-A: 실시간 심사 진행 알림 (순수 텍스트 라인) */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 mb-2">
            <div className="flex items-center space-x-1.5 text-amber-900 font-extrabold text-xs">
              <BellRing className="w-3.5 h-3.5 text-amber-600" />
              <span>실시간 심사 진행 알림 (심사준비~완료)</span>
            </div>
            <span className="text-[11px] font-bold text-amber-800">
              총 {activeAlertItems.length}건
            </span>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
            {activeAlertItems.length === 0 ? (
              <p className="text-slate-500 text-[11px] py-2 text-center">
                현재 심사준비 및 진행 중인 기업이 없습니다. (모두 인증유지 상태)
              </p>
            ) : (
              activeAlertItems.map((item) => (
                <div 
                  key={item.company.id}
                  onClick={() => setHistoryModalCompany(item)}
                  className="flex items-center justify-between py-1 px-1.5 hover:bg-amber-100/50 rounded-lg text-[11.5px] cursor-pointer transition"
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-amber-600 font-black">•</span>
                    <span className={`text-[11px] ${getAuditStateTextClass(item.auditState)}`}>
                      [{item.auditState}]
                    </span>
                    <span className="text-slate-900 font-bold truncate">{item.company.companyName}</span>
                    <span className="text-slate-500 text-[10.5px]">({item.stageText})</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 text-[10.5px] font-mono">
                    <span className={item.dday.isOverdue ? 'text-red-600 font-bold' : item.dday.isUrgent ? 'text-amber-700 font-bold' : 'text-slate-600 font-medium'}>
                      {item.dday.text}
                    </span>
                    <span className="text-slate-400">· 기한: {item.dueDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 1-B: 인증원 공지사항 & 심사지침 (순수 텍스트 라인) */}
        <div className="bg-cyan-50/60 border border-cyan-200/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-200/60 mb-2">
            <div className="flex items-center space-x-1.5 text-cyan-950 font-extrabold text-xs">
              <Megaphone className="w-3.5 h-3.5 text-cyan-700" />
              <span>인증원 공지사항 &amp; 심사지침</span>
            </div>
            <span className="text-[11px] font-bold text-cyan-800">
              최신 공지
            </span>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
            {notices.length === 0 ? (
              <p className="text-slate-500 text-[11px] py-2 text-center">등록된 공지사항이 없습니다.</p>
            ) : (
              notices.slice(0, 3).map((n) => (
                <div 
                  key={n.id}
                  onClick={() => setSelectedNotice(n)}
                  className="flex items-center justify-between py-1 px-1.5 hover:bg-cyan-100/50 rounded-lg text-[11.5px] cursor-pointer transition"
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-cyan-600 font-black">•</span>
                    <span className={`text-[11px] font-bold ${
                      n.category === '긴급' ? 'text-rose-600' :
                      n.category === 'KAB기준' ? 'text-indigo-700' :
                      'text-cyan-800'
                    }`}>
                      [{n.category}]
                    </span>
                    <span className="text-slate-800 font-medium truncate">{n.title}</span>
                  </div>
                  <span className="text-slate-400 text-[10.5px] font-mono shrink-0 ml-2">{n.createdAt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 3대 핵심 지표 바 & 뷰 전환 버튼 (나의 심사 업체 대장 vs 월간 심사 일정)        */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* 3대 핵심 지표 (관리업체수 / 총인증수 / 규격별 관리기업수) */}
        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          {/* 1. 관리 업체수 */}
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-600" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">관리 업체수</span>
              <span className="text-xs font-black text-slate-900 font-mono">{totalCompanyCount}개사</span>
            </div>
          </div>

          {/* 2. 총 인증수 */}
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">총 인증 규격수</span>
              <span className="text-xs font-black text-indigo-900 font-mono">{totalCertCount}건</span>
            </div>
          </div>

          {/* 3. 규격별 관리기업수 */}
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">규격별 관리 현황</span>
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-800 mt-0.5">
                {Object.entries(standardBreakdown).map(([std, count], idx) => (
                  <span key={std} className="inline-flex items-center">
                    <span className="text-slate-600 font-sans text-[10.5px]">{std.replace('ISO ', '')}:</span>
                    <strong className="text-cyan-800 ml-0.5">{count}사</strong>
                    {idx < Object.keys(standardBreakdown).length - 1 && <span className="text-slate-300 mx-1">/</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2대 뷰 메뉴 전환 버튼: [나의 심사 업체 대장] vs [월간 심사 일정 (달력)] */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('ledger')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'ledger'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>나의 심사 업체 대장</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'monthly'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>월간 심사 일정 (달력)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-A. [나의 심사 업체 대장] 테이블 뷰                                         */}
      {/* ========================================================================= */}
      {activeView === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          
          {/* 검색 및 필터 컨트롤러 */}
          <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="업체명, 대표자, 사업자번호 검색"
                  className="pl-8 pr-3 py-1.5 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-cyan-500 w-52"
                />
              </div>

              {/* 진행 상태 필터 */}
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">심사 진행상태 (전체)</option>
                <option value="심사준비">심사준비 (4개월 이내)</option>
                <option value="계획수립중">계획수립중</option>
                <option value="심사중">심사중</option>
                <option value="보고서작성중">보고서작성중</option>
                <option value="심사보고">심사보고 (제출완료)</option>
                <option value="보고서보완">보고서보완 (반려)</option>
                <option value="보고서승인">보고서승인</option>
                <option value="인증유지">인증유지 (평시)</option>
              </select>

              {/* 규격 필터 */}
              <select
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
                className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">전체 인증 규격</option>
                <option value="9001">ISO 9001 (QMS)</option>
                <option value="14001">ISO 14001 (EMS)</option>
                <option value="45001">ISO 45001 (OHS)</option>
                <option value="27001">ISO 27001 (ISMS)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              표시: <strong className="text-cyan-700 font-bold">{sortedItems.length}</strong> / {allCompanyItems.length}개사
              <span className="ml-2 text-slate-400 text-[11px]">(컬럼명을 클릭하면 정렬됩니다)</span>
            </div>
          </div>

          {/* 테이블 본문 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 select-none">
                  {/* 1. 진행 상태 (가장 왼쪽 컬럼) */}
                  <th 
                    onClick={() => handleSort('auditState')} 
                    className="py-3 px-3.5 text-center min-w-[105px] cursor-pointer hover:bg-slate-200/80 transition"
                  >
                    심사 진행상태 {renderSortIcon('auditState')}
                  </th>

                  {/* 2. No. */}
                  <th className="py-3 px-2 text-center w-10 text-slate-500">No</th>

                  {/* 3. 기업명 (대표자) */}
                  <th 
                    onClick={() => handleSort('companyName')} 
                    className="py-3 px-3.5 min-w-[160px] cursor-pointer hover:bg-slate-200/80 transition"
                  >
                    기업명 (대표자) {renderSortIcon('companyName')}
                  </th>

                  {/* 4. 인증표준 (인증번호) */}
                  <th 
                    onClick={() => handleSort('standards')} 
                    className="py-3 px-3.5 min-w-[190px] cursor-pointer hover:bg-slate-200/80 transition"
                  >
                    인증표준 (인증번호) {renderSortIcon('standards')}
                  </th>

                  {/* 5. IAF 코드 */}
                  <th 
                    onClick={() => handleSort('iafCode')} 
                    className="py-3 px-2 text-center w-16 cursor-pointer hover:bg-slate-200/80 transition"
                  >
                    IAF {renderSortIcon('iafCode')}
                  </th>

                  {/* 6. 심사 성격 */}
                  <th 
                    onClick={() => handleSort('stageText')} 
                    className="py-3 px-2.5 text-center min-w-[85px] cursor-pointer hover:bg-slate-200/80 transition"
                  >
                    심사 성격 {renderSortIcon('stageText')}
                  </th>

                  {/* 7. 차기 심사 기한 */}
                  <th 
                    onClick={() => handleSort('dueDate')} 
                    className="py-3 px-3.5 min-w-[145px] cursor-pointer hover:bg-slate-200/80 transition"
                  >
                    차기 심사 기한 {renderSortIcon('dueDate')}
                  </th>

                  {/* 8. 심사보고서 */}
                  <th className="py-3 px-3 text-center min-w-[130px]">
                    심사보고서 &amp; 계획
                  </th>

                  {/* 9. 정산 상태 (마지막 컬럼) */}
                  <th 
                    onClick={() => handleSort('settlementState')} 
                    className="py-3 px-3.5 text-center min-w-[125px] cursor-pointer hover:bg-slate-200/80 transition"
                  >
                    심사비 / 정산 상태 {renderSortIcon('settlementState')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      해당 조건의 심사 업체를 찾을 수 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item, idx) => {
                    const { company, project, auditState, settlementState, stageText, stdAndCerts, dueDate, dday } = item;
                    const reportId = project?.reportId || (project ? `rep-${project.id}` : undefined);

                    return (
                      <tr 
                        key={company.id} 
                        className="hover:bg-cyan-50/30 transition group"
                      >
                        {/* 1. 진행 상태 (가장 왼쪽 컬럼) */}
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[12px] ${getAuditStateTextClass(auditState)}`}>
                            {auditState}
                          </span>
                        </td>

                        {/* 2. No */}
                        <td className="py-3 px-2 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>

                        {/* 3. 기업명 (대표자) - 클릭 시 심사 이력 팝업 */}
                        <td 
                          className="py-3 px-3.5 cursor-pointer"
                          onClick={() => setHistoryModalCompany(item)}
                        >
                          <div className="font-extrabold text-slate-900 group-hover:text-cyan-700 transition flex items-center gap-1.5">
                            <span>{company.companyName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {company.ceoName} 대표 {company.bizNumber ? `(${company.bizNumber})` : ''}
                          </div>
                        </td>

                        {/* 4. 인증표준 (인증번호) */}
                        <td className="py-3 px-3.5 leading-snug">
                          {stdAndCerts.map((sc, sIdx) => (
                            <div key={sIdx} className="text-slate-800 text-[11.5px]">
                              <span className="font-bold text-cyan-950">{sc.std}</span>{' '}
                              <span className="text-slate-500 font-mono text-[10.5px]">({sc.certNo})</span>
                            </div>
                          ))}
                        </td>

                        {/* 5. IAF 코드 */}
                        <td className="py-3 px-2 text-center font-mono text-slate-700 font-bold text-[11.5px]">
                          {company.iafCode || '14'}
                        </td>

                        {/* 6. 심사 성격 */}
                        <td className="py-3 px-2.5 text-center">
                          <span className="font-semibold text-slate-800">
                            {stageText}
                          </span>
                        </td>

                        {/* 7. 차기 심사 기한 */}
                        <td className="py-3 px-3.5">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{dueDate}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] font-bold">
                            <span className={
                              dday.isOverdue
                                ? 'text-red-600'
                                : dday.isUrgent
                                ? 'text-amber-700'
                                : 'text-slate-500'
                            }>
                              {dday.text}
                            </span>
                          </div>
                        </td>

                        {/* 8. 심사보고서 & 계획 확인 버튼 */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* 계획서 & 청구서 확인 버튼 */}
                            {(auditState === '계획수립중' || auditState === '심사준비') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPlanInvoiceModalCompany(item);
                                  setIsAgreedAndSent(false);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 hover:border-blue-300 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-200 cursor-pointer shadow-2xs"
                                title="계획서 및 청구서 확인/동의"
                              >
                                <FileText className="w-3 h-3 text-blue-600" />
                                <span>계획·청구서</span>
                              </button>
                            )}

                            {/* 심사보고서 버튼 */}
                            {reportId ? (
                              <button
                                type="button"
                                onClick={() => onOpenReport(reportId)}
                                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-extrabold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="심사보고서 작성 및 열람"
                              >
                                <FileText className="w-3 h-3" />
                                <span>심사보고서</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={onNavigateToReports}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 border border-slate-200 cursor-pointer"
                                title="신규 심사보고서 작성으로 이동"
                              >
                                <FileText className="w-3 h-3 text-slate-400" />
                                <span>심사보고서</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 9. 정산 상태 (마지막 컬럼) */}
                        <td className="py-3 px-3.5 text-center">
                          <span className={`text-[12px] ${getSettlementStateTextClass(settlementState)}`}>
                            {settlementState}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              * 기업명을 클릭하면 해당 업체의 <strong>[전체 심사 이력]</strong>을 확인할 수 있습니다.
            </div>
            <div className="font-mono text-[11px] text-slate-600">
              총 {allCompanyItems.length}개사 중 {sortedItems.length}개사 표시 중
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3-B. [월간 심사 일정 (달력 뷰)] - 2일 이상 심사 기간 걸쳐서 표시                 */}
      {/* ========================================================================= */}
      {activeView === 'monthly' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 animate-in fade-in">
          
          {/* 달력 헤더: 년/월 이동 컨트롤러 */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedYear}년 {selectedMonth}월 심사 일정 캘린더
                </h3>
                <p className="text-[11px] text-slate-500">
                  2일 이상 심사는 기간에 걸쳐 표시되며, 4개월 전 <strong>[심사준비]</strong> 돌입 일정 및 예정 일정을 제공합니다.
                </p>
              </div>
            </div>

            {/* 년/월 이동 컨트롤러 */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 border border-slate-300 rounded-lg p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 1) {
                      setSelectedYear(prev => prev - 1);
                      setSelectedMonth(12);
                    } else {
                      setSelectedMonth(prev => prev - 1);
                    }
                  }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="font-mono font-bold text-xs text-slate-800 px-2">
                  {selectedYear}년 {String(selectedMonth).padStart(2, '0')}월
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 12) {
                      setSelectedYear(prev => prev + 1);
                      setSelectedMonth(1);
                    } else {
                      setSelectedMonth(prev => prev + 1);
                    }
                  }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 달력 그리드 (일 ~ 토) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100/40">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 text-center font-bold text-xs border-b border-slate-200 bg-slate-100 text-slate-700 py-2">
              <div className="text-rose-600">일</div>
              <div>월</div>
              <div>화</div>
              <div>수</div>
              <div>목</div>
              <div>금</div>
              <div className="text-blue-600">토</div>
            </div>

            {/* 날짜 셀 그리드 */}
            <div className="grid grid-cols-7 gap-[1px] bg-slate-200 text-xs">
              {calendarDays.map((cell, idx) => (
                <div
                  key={idx}
                  className={`min-h-[110px] p-1.5 flex flex-col justify-between transition ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/70 text-slate-400'
                  } ${cell.isToday ? 'ring-2 ring-cyan-500 ring-inset bg-cyan-50/20' : ''}`}
                >
                  {/* 날짜 번호 */}
                  <div className="flex items-center justify-between pb-1">
                    <span className={`font-mono font-bold text-[12px] inline-flex items-center justify-center w-5 h-5 rounded-full ${
                      cell.isToday 
                        ? 'bg-cyan-600 text-white shadow-2xs' 
                        : idx % 7 === 0 
                        ? 'text-rose-600' 
                        : idx % 7 === 6 
                        ? 'text-blue-600' 
                        : 'text-slate-800'
                    }`}>
                      {cell.dayNumber}
                    </span>
                    {cell.isToday && (
                      <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100 px-1.5 rounded">오늘</span>
                    )}
                  </div>

                  {/* 해당 날짜 이벤트 바 (2일 이상 심사는 기간에 걸쳐 연속 표시) */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[75px] no-scrollbar">
                    {cell.events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setHistoryModalCompany(ev.item)}
                        title={`${ev.title} - ${ev.stage} (${ev.state})`}
                        className={`text-[10px] p-1 cursor-pointer transition truncate flex items-center gap-1 font-medium ${
                          ev.type === 'audit-period'
                            ? ev.isMultiDay
                              ? `${ev.isStartDay ? 'rounded-l-md' : ''} ${ev.isEndDay ? 'rounded-r-md' : ''} bg-cyan-600 text-white shadow-2xs font-bold border-y border-cyan-700`
                              : 'rounded-md bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold'
                            : ev.type === 'prep-start'
                            ? 'rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                            : 'rounded-md bg-slate-100 text-slate-800 border border-slate-300'
                        }`}
                      >
                        {ev.type === 'audit-period' && (
                          <span className="truncate">
                            🏢 {ev.title} {ev.dayIndexText}
                          </span>
                        )}
                        {ev.type === 'prep-start' && (
                          <span className="truncate text-amber-900">
                            🔔 [준비] {ev.title}
                          </span>
                        )}
                        {ev.type === 'due-date' && (
                          <span className="truncate">
                            ⏳ [기한] {ev.title}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 달력 범례 안내 */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-cyan-600 inline-block"></span>
                <span>현장 심사 기간 (2일 이상 연속 표기)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block"></span>
                <span>심사준비 진입일 (기한 4개월 전)</span>
              </span>
            </div>
            <span className="text-slate-400 font-mono">
              * 일정을 클릭하면 해당 기업의 상세 심사 이력 팝업이 열립니다.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 팝업 모달 1: 기업 심사 이력 팝업 (통합 공통 모달)                              */}
      {/* ========================================================================= */}
      <CompanyAuditHistoryModal
        isOpen={!!historyModalCompany}
        onClose={() => setHistoryModalCompany(null)}
        company={historyModalCompany ? historyModalCompany.company : null}
        contracts={contracts}
        projects={projects}
        settlements={settlements}
        allAuditors={_allAuditors}
        onOpenReport={onOpenReport}
      />

      {/* ========================================================================= */}
      {/* 팝업 모달 2: 심사계획서 & 심사비 청구서 확인 및 동의 발송 모달                 */}
      {/* ========================================================================= */}
      {planInvoiceModalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    심사계획서 및 심사비 청구서 확인
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    수립 대상: <strong>{planInvoiceModalCompany.company.companyName}</strong> ({planInvoiceModalCompany.stageText})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlanInvoiceModalCompany(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl text-blue-950 space-y-1">
              <div className="font-bold flex items-center gap-1 text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>[실무 프로세스] 심사원 사전 확인 &amp; 기업 공문 발송</span>
              </div>
              <p className="text-[11px] text-blue-900/80 leading-relaxed">
                인증원에서 수립한 심사계획서 및 심사비 청구서입니다. 심사원님이 일정 및 내용을 확인하고 [동의 &amp; 기업 발송]을 누르시면 해당 고객사에 공문 메일이 발송됩니다.
              </p>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">피심사 기업</span>
                <strong className="text-slate-900">{planInvoiceModalCompany.company.companyName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">심사 표준</span>
                <strong className="text-slate-900">{planInvoiceModalCompany.stdAndCerts.map(s => s.std).join(', ')}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">배정 심사팀</span>
                <strong className="text-slate-900">{currentAuditor.name} 심사팀장</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">예정 심사일정</span>
                <strong className="text-cyan-800 font-mono">{planInvoiceModalCompany.dueDate} (2일간)</strong>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">심사비 청구액 (VAT 별도)</span>
                <strong className="text-emerald-700 text-sm font-mono">1,800,000원</strong>
              </div>
            </div>

            {isAgreedAndSent ? (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-center font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>심사원 동의 완료! 고객사에 심사계획서와 청구서가 성공적으로 발송되었습니다.</span>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setPlanInvoiceModalCompany(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
              >
                닫기
              </button>
              {!isAgreedAndSent && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAgreedAndSent(true);
                    onOpenEmailModal(
                      `${planInvoiceModalCompany.company.companyName} (${planInvoiceModalCompany.company.contactPerson || '담당자'})`,
                      planInvoiceModalCompany.company.contactEmail || 'admin@gmscs.co.kr',
                      '심사계획서'
                    );
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>심사원 동의 &amp; 기업에 발송</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 팝업 모달 3: 인증원 공지사항 상세 팝업                                       */}
      {/* ========================================================================= */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="text-[12px] font-bold text-cyan-800">
                  [{selectedNotice.category}]
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{selectedNotice.createdAt}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
              {selectedNotice.title}
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed text-[11.5px] max-h-60 overflow-y-auto">
              {selectedNotice.content}
            </div>

            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>작성자: {selectedNotice.authorName}</span>
              <span>대상: {selectedNotice.targetAudience}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
