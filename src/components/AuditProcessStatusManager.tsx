import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  Printer,
  X,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit3
} from 'lucide-react';
import {
  AuditProject,
  Auditor,
  Company,
  CertContract,
  AuditReport,
  AuditorSettlement,
  CommitteeMeeting,
  CommitteeScheduleItem
} from '../types';
import { CompanyAuditHistoryModal } from './CompanyAuditHistoryModal';
import { cleanStandardName } from './AuditorPortal';
import { findNextCommitteeMeetingDate } from '../utils/committeeSchedule';
import { getCompanyAuditState, getAuditStateBadgeClass, CompanyAuditState } from '../utils/auditStateUtils';

export type SortColumn = 
  | 'no' 
  | 'company' 
  | 'standard' 
  | 'auditType' 
  | 'preAudit' 
  | 'schedule' 
  | 'team' 
  | 'postAudit' 
  | 'committee';

export interface AuditProcessStatusManagerProps {
  projects: AuditProject[];
  auditors: Auditor[];
  companies: Company[];
  contracts?: CertContract[];
  reports?: Record<string, AuditReport>;
  settlements?: AuditorSettlement[];
  committeeMeetings?: CommitteeMeeting[];
  committeeSchedules?: CommitteeScheduleItem[];
  onOpenReport?: (reportId: string) => void;
  onSendPlan?: (companyName?: string, contactEmail?: string, templateType?: string) => void;
  onNavigateToSettlement?: () => void;
  onOpenPdfReport?: (info: { title: string; companyName: string; standard?: string; auditType?: string; auditDate?: string; auditorName?: string; pdfUrl?: string }) => void;
}

export interface ProcessRowData {
  projectId: string;
  companyId: string;
  companyName: string;
  ceoName: string;
  bizNumber: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  standardsText: string;
  certNo: string;
  auditType: string;
  auditState: CompanyAuditState;
  
  // 1. Pre-AUDIT (4개 항목 및 각각의 수집 일자)
  preAudit: {
    contractDate: string; // 계약(준비)
    scheduleDate: string; // 일정협의
    planApprovalDate: string; // 계획승인
    planDispatchDate: string; // 계획서발송
    isPlanSent: boolean;
    hasPlanApproved: boolean;
  };

  // 2. AUDIT (심사기간)
  schedule: {
    startDate: string;
    endDate: string;
    md: number;
  };

  // 3. TEAM (심사팀)
  team: {
    leadAuditor: string;
    teamAuditor: string;
  };

  // 4. Post-AUDIT (보고서 접수 / 보고서 승인)
  postAudit: {
    receiptDate: string; // 보고서 접수 일자
    approvalDate: string; // 보고서 승인 일자
    stage: '대기' | '접수' | '검토' | '승인';
    reportId?: string;
    note?: string;
  };

  // 5. 심의의결
  committee: {
    status: 'completed' | 'in_progress' | 'pending';
    displayText: string; // e.g. "2026-09-24 (예정)" 또는 "2026-09-17 (승인)"
    date: string;
  };

  // 레거시/팝업 호환용 데이터
  prep: { status: 'completed' | 'in_progress' | 'pending'; title: string; date: string };
  plan: { status: 'completed' | 'in_progress' | 'pending'; statusText: string; date: string };
  billing: { status: 'completed' | 'in_progress' | 'pending'; statusText: string; date: string; amount: number };
  onsite: { status: 'completed' | 'in_progress' | 'pending'; statusText: string };
  report: { status: 'completed' | 'in_progress' | 'pending'; stage: '대기' | '접수' | '검토' | '승인'; statusText: string; date: string; reportId?: string; note?: string };
  settlement: { status: 'completed' | 'in_progress' | 'pending'; statusText: string; date: string; amount?: number; withholdingTax?: number; netAmount?: number; bankAccount?: string };

  rawProject: AuditProject;
  rawCompany?: Company;
}

const PAGE_SIZE = 20;

export const AuditProcessStatusManager: React.FC<AuditProcessStatusManagerProps> = ({
  projects,
  auditors,
  companies,
  contracts = [],
  reports = {},
  settlements = [],
  committeeMeetings: _committeeMeetings = [],
  committeeSchedules = [],
  onOpenReport,
  onSendPlan: _onSendPlan,
  onNavigateToSettlement: _onNavigateToSettlement,
  onOpenPdfReport
}) => {
  // 검색 및 필터
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterStep, setSelectedFilterStep] = useState<string>('all');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  
  // 월별 조회 및 선택 상태 (기본값: 접속월 2026년 9월)
  const defaultYear = 2026;
  const defaultMonth = 9;

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(defaultMonth);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 테이블 헤더 정렬 상태 (기본: 심사일정 오름차순)
  const [sortColumn, setSortColumn] = useState<SortColumn>('schedule');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (col: SortColumn) => {
    if (sortColumn !== col) {
      return <span className="text-slate-300 text-[10px] ml-1">↕</span>;
    }
    return sortOrder === 'asc' 
      ? <span className="text-cyan-800 text-[10px] font-bold ml-1">▲</span>
      : <span className="text-cyan-800 text-[10px] font-bold ml-1">▼</span>;
  };

  // 이전 달 이동
  const handlePrevMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(12);
    } else if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth((prev) => (prev as number) - 1);
    }
  };

  // 다음 달 이동
  const handleNextMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(1);
    } else if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth((prev) => (prev as number) + 1);
    }
  };

  // 모달 팝업 상태
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // 문서(계획서 / 청구서) 팝업 미리보기 상태
  const [previewDoc, setPreviewDoc] = useState<{
    isOpen: boolean;
    type: 'plan' | 'billing';
    row: ProcessRowData | null;
  }>({
    isOpen: false,
    type: 'plan',
    row: null
  });

  // 사무국 심사보고서 단계 편집 상태 (projectId -> { stage, date, note })
  const [reportCustomStages, setReportCustomStages] = useState<Record<string, {
    stage: '대기' | '접수' | '검토' | '승인';
    date: string;
    note?: string;
  }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gmscs_report_custom_stages');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {};
  });

  useEffect(() => {
    const handleStageUpdate = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('gmscs_report_custom_stages');
        if (saved) {
          try { setReportCustomStages(JSON.parse(saved)); } catch (e) {}
        }
      }
    };
    window.addEventListener('gmscs-report-submitted', handleStageUpdate);
    window.addEventListener('storage', handleStageUpdate);
    return () => {
      window.removeEventListener('gmscs-report-submitted', handleStageUpdate);
      window.removeEventListener('storage', handleStageUpdate);
    };
  }, []);

  // 사무국 심사보고서 단계 편집 모달 상태
  const [editingReportRow, setEditingReportRow] = useState<{
    row: ProcessRowData;
    stage: '대기' | '접수' | '검토' | '승인';
    date: string;
    note: string;
  } | null>(null);

  // 회사 맵
  const companyMap = useMemo(() => {
    const map = new Map<string, Company>();
    companies.forEach(c => map.set(c.id, c));
    return map;
  }, [companies]);

  // 계약 맵
  const contractMap = useMemo(() => {
    const map = new Map<string, CertContract>();
    contracts.forEach(c => map.set(c.companyId, c));
    return map;
  }, [contracts]);

  // 4대 라이프사이클 프로세스 데이터 행 산출
  const processRows: ProcessRowData[] = useMemo(() => {
    return projects.map((p, idx) => {
      const comp = companyMap.get(p.companyId) || companies.find(c => c.id === p.companyId || c.companyName === p.companyName);
      const contract = contractMap.get(p.companyId) || (contracts ? contracts.find(c => c.companyId === p.companyId || c.companyName === p.companyName) : undefined);
      const curSettlement = settlements.find(s => s.projectId === p.id || s.companyName === p.companyName);
      const auditState = getCompanyAuditState(comp, contract, p, curSettlement);

      const compAny = comp as any;
      const ceoName = comp?.ceoName || '';
      const bizNumber = comp?.bizNumber || '';
      const address = comp?.address || '';
      const contactPerson = comp?.contactPerson || '';
      const contactPhone = comp?.contactPhone || '';
      const contactEmail = comp?.contactEmail || compAny?.email || '';

      const rawStd = compAny?.standards;
      const standardsList: string[] = p.standards && p.standards.length > 0 
        ? p.standards 
        : (rawStd ? (typeof rawStd === 'string' ? rawStd.split(/[/,;]+/) : rawStd) : ['ISO 9001:2015']);
      const standardsText = standardsList.map((s: string) => cleanStandardName(s)).join(', ');
      const certNo = compAny?.certNo || compAny?.certNumber || contract?.certNumber || (contract as any)?.contractNumber || '';
      const kabMd = p.appliedMd || p.kabStandardMd || 2.5;

      // 1. Pre-AUDIT 하위 항목 날짜 (추산 루틴 완전 제거: 실제 DB 및 저장된 일자만 바인딩)
      const isPlanSent = Boolean(p.planSentDate);
      const hasPlanApproved = Boolean((p as any).planApprovedDate);
      
      const contractDate = (contract as any)?.contractDate || (contract as any)?.createdAt?.slice(0, 10) || comp?.createdAt?.slice(0, 10) || '';
      const scheduleDate = (p as any).scheduleDate || (p as any).scheduleConfirmedDate || '';
      const planApprovalDate = (p as any).planApprovedDate || '';
      const planDispatchDate = p.planSentDate ? p.planSentDate.slice(0, 10) : '';

      const preAudit = {
        contractDate,
        scheduleDate,
        planApprovalDate,
        planDispatchDate,
        isPlanSent,
        hasPlanApproved
      };

      // 2. AUDIT 심사기간
      const schedule = {
        startDate: p.startDate || '',
        endDate: p.endDate || '',
        md: kabMd
      };

      // 3. TEAM 심사팀 (팀장 볼드 + 팀원 나열)
      const rep = p.reportId ? reports[p.reportId] : undefined;
      const teamLead = p.leadAuditorName || '남경호';
      let teamMember = '단독심사';
      if (rep && rep.auditTeam && rep.auditTeam.length > 0) {
        const otherMembers = rep.auditTeam.filter(m => !m.includes(teamLead));
        teamMember = otherMembers.length > 0 ? otherMembers.join(', ') : '단독심사';
      } else if (p.teamAuditorNames && p.teamAuditorNames.length > 0) {
        teamMember = p.teamAuditorNames.filter(name => name !== teamLead).join(', ') || '단독심사';
      } else {
        teamMember = '단독심사';
      }
      const team = {
        leadAuditor: teamLead,
        teamAuditor: teamMember
      };

      // 4. Post-AUDIT: 보고서 접수 및 승인 (추산 루틴 완전 제거: 실제 제출/승인 일자만 표시)
      const isReportApproved = ['심의대기', '심의진행', '인증발행'].includes(p.status as any);
      const isReportReviewing = ['사무국검토대기', '보완요청'].includes(p.status as any);
      const isReportSubmitted = ['보고서작성', '서명완료'].includes(p.status as any);

      const defaultStage: '대기' | '접수' | '검토' | '승인' = isReportApproved
        ? '승인'
        : (isReportReviewing ? '검토' : (isReportSubmitted ? '접수' : '대기'));

      const customReport = reportCustomStages[p.id] || reportCustomStages[p.companyId] || (comp?.id ? reportCustomStages[comp.id] : undefined) || (comp?.companyName ? reportCustomStages[comp.companyName] : undefined);
      const stage: '대기' | '접수' | '검토' | '승인' = customReport ? customReport.stage : defaultStage;

      const receiptDate = customReport?.date || (rep as any)?.submittedAt?.slice(0, 10) || (p as any).reportReceiptDate || '';
      const approvalDate = (customReport as any)?.approvalDate || (p as any).reportApprovalDate || (stage === '승인' && (rep as any)?.approvedAt ? (rep as any).approvedAt.slice(0, 10) : '');

      const postAudit = {
        receiptDate,
        approvalDate,
        stage,
        reportId: p.reportId,
        note: customReport?.note
      };

      // 5. 심의의결 (실제 심의 결정일 또는 확정 상태만 바인딩)
      const isCommitteeDone = p.committeeStatus === '등록승인' || p.status === '인증발행';
      const isCommitteePending = p.committeeStatus === '심의진행' || p.committeeStatus === '심의상정' || p.status === '심의대기' || p.status === '심의진행';
      
      const committeeMeetingDate = p.committeeDecisionDate || (p as any).committeeDate || '';

      let committeeStatus: 'completed' | 'in_progress' | 'pending' = 'pending';
      let displayText = '-';

      if (isCommitteeDone) {
        committeeStatus = 'completed';
        displayText = committeeMeetingDate ? `${committeeMeetingDate} (승인)` : '승인완료';
      } else if (isCommitteePending || stage === '승인') {
        committeeStatus = 'in_progress';
        displayText = committeeMeetingDate ? `${committeeMeetingDate} (진행)` : '심의진행';
      }

      const committee = {
        status: committeeStatus,
        displayText,
        date: committeeMeetingDate
      };

      // 호환용 객체
      const prep = {
        status: isPlanSent ? ('completed' as const) : ('in_progress' as const),
        title: '일정협의',
        date: scheduleDate
      };
      const plan = {
        status: hasPlanApproved ? ('completed' as const) : (isPlanSent ? ('in_progress' as const) : ('pending' as const)),
        statusText: hasPlanApproved ? '승인완료' : (isPlanSent ? '업체발송' : '-'),
        date: planDispatchDate
      };
      const billing = {
        status: 'in_progress' as const,
        statusText: '청구발행',
        date: planDispatchDate,
        amount: p.finalFee || 1800000
      };
      const onsite = {
        status: (stage !== '대기') ? ('completed' as const) : ('pending' as const),
        statusText: (stage !== '대기') ? '완료' : '-'
      };
      const report = {
        status: stage === '승인' ? ('completed' as const) : ('in_progress' as const),
        stage,
        statusText: stage,
        date: approvalDate || receiptDate,
        reportId: p.reportId,
        note: customReport?.note
      };
      const settlement = {
        status: isCommitteeDone ? ('completed' as const) : ('pending' as const),
        statusText: isCommitteeDone ? '정산완료' : '정산대기',
        date: ''
      };

      return {
        projectId: p.id,
        companyId: p.companyId,
        companyName: p.companyName,
        ceoName,
        bizNumber,
        address,
        contactPerson,
        contactPhone,
        contactEmail,
        standardsText,
        certNo,
        auditType: p.auditType || '1차 사후',
        auditState,
        preAudit,
        schedule,
        team,
        postAudit,
        committee,
        prep,
        plan,
        billing,
        onsite,
        report,
        settlement,
        rawProject: p,
        rawCompany: comp
      };
    });
  }, [projects, companyMap, contractMap, reports, auditors, reportCustomStages, committeeSchedules, settlements]);

  // 필터링 (월별 필터 + 검색어 + 규격 + 진행단계)
  const filteredRows = useMemo(() => {
    const monthStr = selectedMonth === 'all' ? '' : String(selectedMonth).padStart(2, '0');
    const targetPrefix = selectedMonth === 'all' ? `${selectedYear}-` : `${selectedYear}-${monthStr}`;

    return processRows.filter(row => {
      // 1. 월별 필터
      const matchesMonth = selectedMonth === 'all'
        ? (row.schedule.startDate.startsWith(`${selectedYear}-`) || row.schedule.endDate.startsWith(`${selectedYear}-`))
        : (row.schedule.startDate.startsWith(targetPrefix) || row.schedule.endDate.startsWith(targetPrefix));

      if (!matchesMonth) return false;

      // 2. 텍스트 검색
      const cleanSearch = searchTerm.replace(/\s+/g, '').toLowerCase();
      const cleanCompName = row.companyName.replace(/\s+/g, '').toLowerCase();
      const cleanCeo = row.ceoName.replace(/\s+/g, '').toLowerCase();
      const cleanBiz = row.bizNumber.replace(/[-\s]/g, '');

      const matchesSearch = !cleanSearch ||
        cleanCompName.includes(cleanSearch) ||
        cleanCeo.includes(cleanSearch) ||
        cleanBiz.includes(cleanSearch) ||
        row.certNo.replace(/[-\s]/g, '').toLowerCase().includes(cleanSearch) ||
        row.standardsText.replace(/\s+/g, '').toLowerCase().includes(cleanSearch);

      // 3. 인증규격 필터
      const matchesStd = selectedStandard === 'all' || row.standardsText.includes(selectedStandard);

      // 4. 진행단계 필터
      let matchesStep = true;
      if (selectedFilterStep === 'preAudit') {
        // 1. Pre-AUDIT 진행 중: 심사 전 사전 준비/일정/계획 단계만 표시 (보고서작성, 심의중, 비용정산중, 인증유지, 자격정지는 완전 제외)
        matchesStep = row.auditState === '일정·계획' || (
          row.auditState !== '보고서작성' &&
          row.auditState !== '심의중' &&
          row.auditState !== '비용정산중' &&
          row.auditState !== '인증유지' &&
          row.auditState !== '자격정지' &&
          row.postAudit.stage === '대기' &&
          !['심사진행중', '보고서작성', '보고서제출', '위원회심의', '심사의결', '인증발행', '심의완료', '종결'].includes(row.rawProject.status)
        );
      } else if (selectedFilterStep === 'onsite') {
        // 2. 현장심사 진행 중: 현장 심사 당일 또는 심사 진행 상태
        matchesStep = row.rawProject.status === '심사진행중' || (
          row.schedule.startDate <= '2026-09-12' && 
          row.schedule.endDate >= '2026-09-12' && 
          row.postAudit.stage === '대기'
        );
      } else if (selectedFilterStep === 'report') {
        // 3. 보고서 검토 중: 심사 완료 후 보고서 작성/접수/검토 진행 중
        matchesStep = row.auditState === '보고서작성' || row.postAudit.stage === '접수' || row.postAudit.stage === '검토' || ['사무국검토대기', '보완요청', '보고서작성', '서명완료'].includes(row.rawProject.status);
      } else if (selectedFilterStep === 'committee') {
        // 4. 심의의결 예정: 위원회 심의 대기/진행 중
        matchesStep = row.auditState === '심의중' || row.committee.status === 'in_progress' || ['심의대기', '심의진행', '위원회심의', '심사의결'].includes(row.rawProject.status);
      } else if (selectedFilterStep === 'approved') {
        // 5. 최종 승인 완료 / 인증유지: 심의 완료 및 인증서 발행/유지
        matchesStep = row.auditState === '인증유지' || row.committee.status === 'completed' || ['인증발행', '심의완료', '종결'].includes(row.rawProject.status);
      }

      return matchesSearch && matchesStd && matchesStep;
    });
  }, [processRows, searchTerm, selectedFilterStep, selectedStandard, selectedYear, selectedMonth]);

  // 상태별 정렬 우선순위 (진행중 업무 최우선 > 완료/유지 및 정지는 최후순위)
  const STATE_PRIORITY: Record<CompanyAuditState, number> = {
    '보고서작성': 1,
    '일정·계획': 2,
    '심의중': 3,
    '비용정산중': 4,
    '인증유지': 5,
    '자격정지': 6,
  };

  // 테이블 제목행 정렬 처리
  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    list.sort((a, b) => {
      // 1. 상태 우선순위: 진행 중인 심사(보고서작성 > 일정·계획 > 심의중 > 비용정산중)가 먼저 나오고, 완료된 '인증유지' 및 '자격정지'는 가장 후순위로 배치
      const prioA = STATE_PRIORITY[a.auditState] || 99;
      const prioB = STATE_PRIORITY[b.auditState] || 99;
      
      if (prioA !== prioB) {
        return prioA - prioB;
      }

      // 2. 동일 우선순위 그룹 내에서 컬럼별 정렬 수행
      let valA = '';
      let valB = '';
      switch (sortColumn) {
        case 'no':
          return sortOrder === 'asc' ? a.projectId.localeCompare(b.projectId) : b.projectId.localeCompare(a.projectId);
        case 'company':
          valA = a.companyName;
          valB = b.companyName;
          break;
        case 'standard':
          valA = a.standardsText;
          valB = b.standardsText;
          break;
        case 'auditType':
          valA = a.auditType;
          valB = b.auditType;
          break;
        case 'preAudit':
          valA = a.preAudit.scheduleDate || a.preAudit.contractDate;
          valB = b.preAudit.scheduleDate || b.preAudit.contractDate;
          break;
        case 'schedule':
          valA = a.schedule.startDate;
          valB = b.schedule.startDate;
          break;
        case 'team':
          valA = a.team.leadAuditor;
          valB = b.team.leadAuditor;
          break;
        case 'postAudit':
          valA = a.postAudit.approvalDate || a.postAudit.receiptDate;
          valB = b.postAudit.approvalDate || b.postAudit.receiptDate;
          break;
        case 'committee':
          valA = a.committee.date;
          valB = b.committee.date;
          break;
      }
      const cmp = valA.localeCompare(valB);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filteredRows, sortColumn, sortOrder]);

  // 페이지네이션 계산 (20건 단위)
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [sortedRows, safeCurrentPage]);

  return (
    <div className="space-y-3 animate-in fade-in">
      {/* 1. 월별 조회 & 단일 상단 검색 컨트롤 바 */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* 월 네비게이터 (가장 왼쪽의 것만 유지) */}
          <div className="inline-flex items-center bg-slate-50 border border-slate-300 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="이전 달 이동"
              className="p-1 hover:bg-white text-slate-600 hover:text-slate-900 rounded-md transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2.5 py-0.5 text-xs font-bold text-slate-900 min-w-[95px] text-center select-none font-mono">
              {selectedYear}년 {selectedMonth === 'all' ? '전체 월' : `${selectedMonth}월`}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              title="다음 달 이동"
              className="p-1 hover:bg-white text-slate-600 hover:text-slate-900 rounded-md transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 mx-0.5 hidden sm:block" />

          {/* 검색창 */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="업체명, 대표자, 사업자번호 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* 규격 필터 */}
          <select
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
            className="py-1 px-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 인증 규격</option>
            <option value="9001">ISO 9001</option>
            <option value="14001">ISO 14001</option>
            <option value="45001">ISO 45001</option>
            <option value="27001">ISO 27001</option>
          </select>

          {/* 단계 필터 */}
          <select
            value={selectedFilterStep}
            onChange={(e) => setSelectedFilterStep(e.target.value)}
            className="py-1 px-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 진행단계</option>
            <option value="preAudit">1. Pre-AUDIT 진행 중</option>
            <option value="onsite">2. 현장심사 진행 중</option>
            <option value="report">3. 보고서 검토 중</option>
            <option value="committee">4. 심의의결 예정</option>
            <option value="approved">5. 최종 승인 완료</option>
          </select>
        </div>

        {/* 우측: 건수 및 페이지 */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
          <span>총 <strong className="text-slate-900">{filteredRows.length}</strong>건</span>
          <span className="text-slate-300">|</span>
          <span>{safeCurrentPage} / {totalPages} 페이지</span>
        </div>
      </div>

      {/* 3. 심사진행현황 프로세스 대장 (제목행 정렬 기능 완비) */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 select-none text-[12px]">
                {/* 1. No */}
                <th 
                  onClick={() => handleSort('no')}
                  className="py-2.5 px-2 text-center w-12 text-slate-600 font-semibold whitespace-nowrap border-r border-slate-300 hover:bg-slate-200/80 cursor-pointer"
                  title="번호 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>No</span>
                    {renderSortIcon('no')}
                  </div>
                </th>

                {/* 2. 기업명 (대표자) */}
                <th 
                  onClick={() => handleSort('company')}
                  className="py-2.5 px-3 min-w-[160px] whitespace-nowrap border-r border-slate-300 hover:bg-slate-200/80 cursor-pointer"
                  title="기업명 순 정렬"
                >
                  <div className="flex items-center">
                    <span>기업명 (대표자)</span>
                    {renderSortIcon('company')}
                  </div>
                </th>

                {/* 3. 인증규격 (인증번호) */}
                <th 
                  onClick={() => handleSort('standard')}
                  className="py-2.5 px-3 min-w-[185px] whitespace-nowrap border-r border-slate-300 hover:bg-slate-200/80 cursor-pointer"
                  title="인증규격 순 정렬"
                >
                  <div className="flex items-center">
                    <span>인증규격 (인증번호)</span>
                    {renderSortIcon('standard')}
                  </div>
                </th>

                {/* 4. 심사구분 */}
                <th 
                  onClick={() => handleSort('auditType')}
                  className="py-2.5 px-2 text-center min-w-[85px] whitespace-nowrap border-r border-slate-300 hover:bg-slate-200/80 cursor-pointer"
                  title="심사구분 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>심사구분</span>
                    {renderSortIcon('auditType')}
                  </div>
                </th>

                {/* 5. Pre-AUDIT (3개 항목 및 하단 일자) */}
                <th 
                  onClick={() => handleSort('preAudit')}
                  className="py-2.5 px-3 text-center min-w-[210px] whitespace-nowrap border-r border-slate-300 bg-slate-50/70 hover:bg-slate-200/80 cursor-pointer"
                  title="Pre-AUDIT 진행일 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>Pre-AUDIT (일정·계획)</span>
                    {renderSortIcon('preAudit')}
                  </div>
                </th>

                {/* 6. AUDIT (심사기간) - 너비 확장하여 2줄로 여유 있게 충당 */}
                <th 
                  onClick={() => handleSort('schedule')}
                  className="py-2.5 px-3 text-center min-w-[160px] whitespace-nowrap border-r border-slate-300 bg-slate-50/70 hover:bg-slate-200/80 cursor-pointer"
                  title="심사일정 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>AUDIT (심사기간)</span>
                    {renderSortIcon('schedule')}
                  </div>
                </th>

                {/* 7. TEAM (심사팀 - 팀장 볼드) */}
                <th 
                  onClick={() => handleSort('team')}
                  className="py-2.5 px-3 text-center min-w-[125px] whitespace-nowrap border-r border-slate-300 bg-slate-50/70 hover:bg-slate-200/80 cursor-pointer"
                  title="심사팀장 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>TEAM (심사팀)</span>
                    {renderSortIcon('team')}
                  </div>
                </th>

                {/* 8. Post-AUDIT (보고서 접수/승인 및 하단 일자) */}
                <th 
                  onClick={() => handleSort('postAudit')}
                  className="py-2.5 px-3 text-center min-w-[185px] whitespace-nowrap border-r border-slate-300 bg-slate-50/70 hover:bg-slate-200/80 cursor-pointer"
                  title="보고서 일자 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>Post-AUDIT (보고서 접수·승인)</span>
                    {renderSortIcon('postAudit')}
                  </div>
                </th>

                {/* 9. 심의의결 (날짜(예정) / 날짜(승인)) */}
                <th 
                  onClick={() => handleSort('committee')}
                  className="py-2.5 px-2 text-center min-w-[100px] whitespace-nowrap bg-slate-50/70 hover:bg-slate-200/80 cursor-pointer"
                  title="심의의결 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>심의의결</span>
                    {renderSortIcon('committee')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-normal">
                    {selectedYear}년 {selectedMonth === 'all' ? '전체 기간' : `${selectedMonth}월`}에 일치하는 심사 일정이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const hasPreAudit = Boolean(row.preAudit.scheduleDate || row.preAudit.planApprovalDate || row.preAudit.planDispatchDate || row.preAudit.contractDate);
                  const hasPlanDispatched = Boolean(row.preAudit.planDispatchDate || row.preAudit.isPlanSent);
                  const hasReportReceived = Boolean(row.postAudit.receiptDate || row.postAudit.stage === '접수' || row.postAudit.stage === '검토' || row.postAudit.stage === '승인');
                  const auditState = getCompanyAuditState(row.rawCompany, undefined, row.rawProject);

                  return (
                    <tr
                      key={row.projectId}
                      onClick={() => {
                        if (row.rawCompany) {
                          setSelectedCompany(row.rawCompany);
                        }
                      }}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      title="해당 업체의 기업 기본정보 및 전체 심사이력 서류철 팝업을 엽니다."
                    >
                      {/* 1. No */}
                      <td className="py-2.5 px-2 text-center font-mono text-slate-400 text-xs align-middle border-r border-slate-200">
                        {(safeCurrentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>

                      {/* 2. 기업명 (대표자) - 진행상태 배지 포함 */}
                      <td className="py-2.5 px-3 align-middle border-r border-slate-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            row.rawCompany && setSelectedCompany(row.rawCompany);
                          }}
                          className="text-left group cursor-pointer"
                        >
                          <div className="text-slate-900 group-hover:text-cyan-700 transition flex items-center gap-1.5 flex-wrap">
                            <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getAuditStateBadgeClass(auditState)} shrink-0`}>
                              [{auditState}]
                            </span>
                            <span className="font-bold underline decoration-slate-300 group-hover:decoration-cyan-600 underline-offset-2">
                              {row.companyName}
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-cyan-600 shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal mt-0.5 whitespace-nowrap">
                            {row.ceoName} 대표 {row.bizNumber ? `(${row.bizNumber})` : ''}
                          </div>
                        </button>
                      </td>

                      {/* 3. 인증규격 (인증번호) */}
                      <td className="py-2.5 px-3 leading-snug align-middle border-r border-slate-200 whitespace-nowrap">
                        <div className="text-slate-800 font-normal whitespace-nowrap">
                          {row.standardsText}
                        </div>
                        <div className="text-slate-950 font-mono text-[13.5px] font-bold mt-0.5 whitespace-nowrap tracking-tight">
                          ({row.certNo})
                        </div>
                      </td>

                      {/* 4. 심사구분 */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-slate-800 text-[12px] font-normal">
                        {row.auditType}
                      </td>

                      {/* 5. Pre-AUDIT */}
                      <td className="py-2.5 px-3 align-middle border-r border-slate-200">
                        <div className="flex items-start justify-center gap-2 text-[11px] whitespace-nowrap">
                          {/* 1. 일정협의 */}
                          <div className="text-center min-w-[48px]">
                            <div className={row.preAudit.scheduleDate ? "text-slate-900 font-normal" : "text-slate-300"} title="일정협의 완료">
                              일정협의
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono min-h-[14px] mt-0.5">
                              {row.preAudit.scheduleDate || ''}
                            </div>
                          </div>

                          <span className="text-slate-300 mt-0.5">-</span>

                          {/* 2. 계획승인 */}
                          <div className="text-center min-w-[48px]">
                            <div className={row.preAudit.planApprovalDate ? "text-slate-900 font-normal" : "text-slate-300"} title="심사계획 승인">
                              계획승인
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono min-h-[14px] mt-0.5">
                              {row.preAudit.planApprovalDate || ''}
                            </div>
                          </div>

                          <span className="text-slate-300 mt-0.5">-</span>

                          {/* 3. 계획서발송 */}
                          <div className="text-center min-w-[56px]">
                            {row.preAudit.planDispatchDate ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewDoc({ isOpen: true, type: 'plan', row });
                                }}
                                className="text-cyan-800 font-normal hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                title="계획서 발송 완료 (문서 확인)"
                              >
                                <span>계획서발송</span>
                                <ExternalLink className="w-2.5 h-2.5 text-cyan-600 shrink-0" />
                              </button>
                            ) : (
                              <span className="text-slate-300" title="계획서 발송 대기">
                                계획서발송
                              </span>
                            )}
                            <div className="text-[10px] text-slate-500 font-mono min-h-[14px] mt-0.5">
                              {row.preAudit.planDispatchDate || ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 6. AUDIT (심사기간) */}
                      <td className="py-2.5 px-3 text-center align-middle border-r border-slate-200 whitespace-nowrap">
                        <div className="font-mono text-slate-900 text-xs leading-snug font-normal">
                          <div>{row.schedule.startDate} ~ {row.schedule.endDate}</div>
                          <div className="text-slate-500 font-normal text-[11px] mt-0.5">
                            ({row.schedule.md.toFixed(1)}MD)
                          </div>
                        </div>
                      </td>

                      {/* 7. TEAM (심사팀) */}
                      <td className="py-2.5 px-3 text-center align-middle border-r border-slate-200 whitespace-nowrap">
                        <div className="leading-snug text-[11.5px]">
                          <span className="font-bold text-slate-900">{row.team.leadAuditor}</span>
                          {row.team.teamAuditor && row.team.teamAuditor !== '단독심사' && (
                            <span className="text-slate-600 font-normal">, {row.team.teamAuditor}</span>
                          )}
                        </div>
                      </td>

                      {/* 8. Post-AUDIT (보고서 접수 클릭 시 워크벤치 작성/열람 페이지로 오픈) */}
                      <td className="py-2.5 px-3 text-center align-middle border-r border-slate-200 whitespace-nowrap">
                        <div className="flex items-start justify-center gap-2 text-[11px]">
                          {/* 보고서 접수 / 검토 */}
                          <div className="text-center min-w-[55px]">
                            {row.postAudit.receiptDate || row.postAudit.stage === '검토' || row.postAudit.stage === '접수' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // 심사원이 보고한 보고서 작성 페이지(워크벤치)로 직접 오픈
                                  if (typeof window !== 'undefined') {
                                    window.open(`#workbench/${encodeURIComponent(row.companyId)}`, '_blank');
                                  }
                                  if (row.rawProject.reportId && onOpenReport) {
                                    onOpenReport(row.rawProject.reportId);
                                  }
                                }}
                                className={row.postAudit.stage === '검토' ? "text-amber-800 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer" : "text-blue-700 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"}
                                title="심사원이 보고한 심사보고서 작성/열람 페이지(워크벤치)를 새 창으로 엽니다."
                              >
                                <span>{row.postAudit.stage === '검토' ? '보고서 검토' : '보고서 접수'}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-current shrink-0" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (typeof window !== 'undefined') {
                                    window.open(`#workbench/${encodeURIComponent(row.companyId)}`, '_blank');
                                  }
                                }}
                                className="text-slate-400 hover:text-cyan-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer text-[10.5px]"
                                title="심사보고서 작성 페이지(워크벤치) 열기"
                              >
                                <span>보고서 작성</span>
                              </button>
                            )}
                            <div className="text-[10px] text-slate-500 font-mono min-h-[14px] mt-0.5">
                              {row.postAudit.receiptDate || ''}
                            </div>
                          </div>

                          <span className="text-slate-300 mt-0.5">-</span>

                          {/* 보고서 승인 */}
                          <div className="text-center min-w-[55px]">
                            {row.postAudit.approvalDate ? (
                              <span className="text-emerald-700 font-normal" title={`사무국 승인 완료 (${row.postAudit.approvalDate})`}>
                                보고서 승인
                              </span>
                            ) : (
                              <span className="text-slate-300">보고서 승인</span>
                            )}
                            <div className="text-[10px] text-slate-500 font-mono min-h-[14px] mt-0.5">
                              {row.postAudit.approvalDate || ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 9. 심의의결 */}
                      <td className="py-2.5 px-3 text-center align-middle whitespace-nowrap">
                        {row.committee.status === 'completed' ? (
                          <div className="leading-snug text-emerald-700 font-normal text-[11.5px]">
                            {row.committee.displayText}
                          </div>
                        ) : row.committee.status === 'in_progress' ? (
                          <div className="leading-snug text-blue-700 font-normal text-[11.5px]">
                            {row.committee.displayText}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 테이블 푸터 */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            * 계획서 발송 문서는 클릭 시 공문서를 조회할 수 있으며, 각 행을 클릭하면 사무국에서 보고서 접수/승인 단계를 실시간 조정할 수 있습니다.
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            {selectedYear}년 {selectedMonth === 'all' ? '전체' : `${selectedMonth}월`} 대상 총 <strong className="text-slate-900">{filteredRows.length}</strong>건 (페이지당 {PAGE_SIZE}건)
          </div>
        </div>
      </div>

      {/* 4. 페이지네이션 컨트롤 바 (한 페이지에 20개씩 보기) */}
      {totalPages > 1 && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 font-normal">
            총 <strong className="text-slate-900 font-mono">{filteredRows.length}</strong>건 중{' '}
            <strong className="text-slate-900 font-mono">
              {filteredRows.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}
            </strong>
            ~
            <strong className="text-slate-900 font-mono">
              {Math.min(safeCurrentPage * PAGE_SIZE, filteredRows.length)}
            </strong>
            건 표시 (페이지 <strong className="text-slate-900 font-mono">{safeCurrentPage}</strong> / {totalPages})
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
              title="첫 페이지"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
              title="이전 페이지"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => {
                  return p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 2;
                })
                .map((pageNum, idx, arr) => {
                  const showEllipsisBefore = idx > 0 && pageNum - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsisBefore && (
                        <span className="px-1 text-slate-400 select-none">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-mono transition cursor-pointer ${
                          safeCurrentPage === pageNum
                            ? 'bg-slate-900 text-white font-bold shadow-2xs'
                            : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
              title="다음 페이지"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
              title="마지막 페이지"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. 심사계획서 공문 문서 팝업 모달 */}
      {previewDoc.isOpen && previewDoc.row && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-14 px-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  계획
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    심사계획서 공문 (Audit Plan)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    문서번호: GMS-DOC-{previewDoc.row.rawProject.id.toUpperCase()}-2026
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc({ isOpen: false, type: 'plan', row: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs text-slate-700">
              <div className="text-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-cyan-700 tracking-wider">글로벌매니지먼트시스템인증원 (GMSCS)</span>
                <h2 className="text-lg font-black text-slate-900 mt-1">심 사 계 획 통 보 공 문</h2>
                <span className="text-[11px] text-slate-400 font-mono">시행일자: {previewDoc.row.preAudit.planDispatchDate || '2026-08-25'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 leading-relaxed">
                <div><strong>수신:</strong> {previewDoc.row.companyName} 귀중 (대표: {previewDoc.row.ceoName})</div>
                <div><strong>참조:</strong> {previewDoc.row.contactPerson} ({previewDoc.row.contactPhone || previewDoc.row.contactEmail})</div>
                <div><strong>심사규격:</strong> <span className="font-bold text-cyan-900 whitespace-nowrap">{previewDoc.row.standardsText}</span></div>
                <div><strong>심사구분:</strong> {previewDoc.row.auditType}</div>
                <div><strong>심사일정:</strong> <span className="font-bold font-mono">{previewDoc.row.schedule.startDate} ~ {previewDoc.row.schedule.endDate} ({previewDoc.row.schedule.md} MD)</span></div>
                <div><strong>심사팀 구성:</strong> 팀장 <strong className="text-slate-900">{previewDoc.row.team.leadAuditor}</strong>, 심사원 {previewDoc.row.team.teamAuditor}</div>
              </div>

              <p className="text-slate-600 leading-relaxed">
                귀사의 무궁한 발전을 기원합니다. 귀사에서 신청하신 위 규격에 대한 {previewDoc.row.auditType} 일정을 상기와 같이 확정하여 통보하오니, 
                원활한 심사 진행을 위해 심사 준비 및 관련 자료 구비에 협조하여 주시기 바랍니다.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>고객사 계획서 발송 완료</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄하기</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc({ isOpen: false, type: 'plan', row: null })}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. 사무국 심사보고서 단계 수동 조정 모달 */}
      {editingReportRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">심사보고서 단계 편집 (사무국)</h3>
                <p className="text-xs text-slate-500">{editingReportRow.row.companyName}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingReportRow(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">진행 단계 선택</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['대기', '접수', '검토', '승인'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditingReportRow(prev => prev ? { ...prev, stage: st } : null)}
                      className={`py-2 text-center rounded-lg font-bold border transition cursor-pointer ${
                        editingReportRow.stage === st
                          ? 'bg-cyan-700 text-white border-cyan-800 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">기준 일자 (접수/승인일)</label>
                <input
                  type="date"
                  value={editingReportRow.date}
                  onChange={(e) => setEditingReportRow(prev => prev ? { ...prev, date: e.target.value } : null)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">사무국 검토 의견 / 비고</label>
                <textarea
                  rows={2}
                  value={editingReportRow.note}
                  onChange={(e) => setEditingReportRow(prev => prev ? { ...prev, note: e.target.value } : null)}
                  placeholder="보완 요청 사항이나 승인 메모를 입력하세요."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingReportRow(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  const compKey = editingReportRow.row.companyId || editingReportRow.row.companyName;
                  const nextMap = {
                    ...reportCustomStages,
                    [editingReportRow.row.projectId]: {
                      stage: editingReportRow.stage,
                      date: editingReportRow.date,
                      note: editingReportRow.note
                    },
                    [compKey]: {
                      stage: editingReportRow.stage,
                      date: editingReportRow.date,
                      note: editingReportRow.note
                    }
                  };
                  setReportCustomStages(nextMap);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('gmscs_report_custom_stages', JSON.stringify(nextMap));
                    window.dispatchEvent(new CustomEvent('gmscs-report-submitted', { detail: nextMap }));
                  }
                  setEditingReportRow(null);
                }}
                className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                저장 반영
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. 기업 심사 이력 팝업 모달 */}
      {selectedCompany && (
        <CompanyAuditHistoryModal
          isOpen={Boolean(selectedCompany)}
          onClose={() => setSelectedCompany(null)}
          company={selectedCompany}
          allAuditors={auditors}
          projects={projects}
          onOpenPdfReport={onOpenPdfReport}
        />
      )}
    </div>
  );
};
