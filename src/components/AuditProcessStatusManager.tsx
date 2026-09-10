import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Download,
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
  RotateCcw,
  Edit3
} from 'lucide-react';
import {
  AuditProject,
  Auditor,
  Company,
  CertContract,
  AuditReport,
  AuditorSettlement,
  CommitteeMeeting
} from '../types';
import { CompanyAuditHistoryModal } from './CompanyAuditHistoryModal';
import { cleanStandardName } from './AuditorPortal';

export interface AuditProcessStatusManagerProps {
  projects: AuditProject[];
  auditors: Auditor[];
  companies: Company[];
  contracts?: CertContract[];
  reports?: Record<string, AuditReport>;
  settlements?: AuditorSettlement[];
  committeeMeetings?: CommitteeMeeting[];
  onOpenReport?: (reportId: string) => void;
  onSendPlan?: (companyName?: string, contactEmail?: string, templateType?: string) => void;
  onNavigateToSettlement?: () => void;
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
  
  // 1. 심사준비 (일정협의 / 시작일정)
  prep: {
    status: 'completed' | 'in_progress' | 'pending';
    title: string;
    date: string;
  };

  // 2. 계획서 (업체발송 / 승인완료)
  plan: {
    status: 'completed' | 'in_progress' | 'pending';
    statusText: string;
    date: string;
  };

  // 3. 청구서 (업체발송 / 승인완료)
  billing: {
    status: 'completed' | 'in_progress' | 'pending';
    statusText: string;
    date: string;
    amount: number;
  };

  // 4. 심사일정 (일자만 기록)
  schedule: {
    startDate: string;
    endDate: string;
    md: number;
  };

  // 5. 심사팀 (팀장: xxx / 팀원: yyy)
  team: {
    leadAuditor: string;
    teamAuditor: string;
  };

  // 6. 심사완료 (완료 표시만)
  onsite: {
    status: 'completed' | 'in_progress' | 'pending';
    statusText: string;
  };

  // 7. 심사보고서 (대기-접수-검토-승인)
  report: {
    status: 'completed' | 'in_progress' | 'pending';
    stage: '대기' | '접수' | '검토' | '승인';
    statusText: string;
    date: string;
    reportId?: string;
    note?: string;
  };

  // 8. 심의의결 (대기중, 승인일자)
  committee: {
    status: 'completed' | 'in_progress' | 'pending';
    statusText: string;
    date: string;
  };

  // 9. 심사비정산 (정산중, 정산일자)
  settlement: {
    status: 'completed' | 'in_progress' | 'pending';
    statusText: string;
    date: string;
  };

  rawProject: AuditProject;
  rawCompany?: Company;
}

export const AuditProcessStatusManager: React.FC<AuditProcessStatusManagerProps> = ({
  projects,
  auditors,
  companies,
  contracts = [],
  reports = {},
  settlements = [],
  committeeMeetings: _committeeMeetings = [],
  onOpenReport,
  onSendPlan: _onSendPlan,
  onNavigateToSettlement: _onNavigateToSettlement
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

  // 페이지네이션 상태 (한 페이지에 20개씩)
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 필터나 선택 년/월 변경 시 1페이지로 자동 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStandard, selectedFilterStep, selectedYear, selectedMonth]);

  // 이전 달 이동
  const handlePrevMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
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

  // 당월(접속월)로 이동
  const handleCurrentMonth = () => {
    setSelectedYear(defaultYear);
    setSelectedMonth(defaultMonth);
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

  // 심사비 정산 상세 팝업 상태
  const [previewSettlement, setPreviewSettlement] = useState<{
    isOpen: boolean;
    row: ProcessRowData | null;
  }>({
    isOpen: false,
    row: null
  });

  // 사무국 심사보고서 단계 편집 상태 (projectId -> { stage, date, note })
  const [reportCustomStages, setReportCustomStages] = useState<Record<string, {
    stage: '대기' | '접수' | '검토' | '승인';
    date: string;
    note?: string;
  }>>({});

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

  // 9단계 프로세스 데이터 행 산출
  const processRows: ProcessRowData[] = useMemo(() => {
    return projects.map((p, idx) => {
      const comp = companyMap.get(p.companyId);
      const contract = contractMap.get(p.companyId);

      const compAny = comp as any;
      const ceoName = comp?.ceoName || '대표';
      const bizNumber = comp?.bizNumber || '000-00-00000';
      const address = comp?.address || '서울특별시 구로구 디지털로 288';
      const contactPerson = comp?.contactPerson || '인증담당';
      const contactPhone = comp?.contactPhone || '02-850-1000';
      const contactEmail = comp?.contactEmail || 'quality@company.co.kr';

      const rawStd = compAny?.standards;
      const standardsList: string[] = p.standards && p.standards.length > 0 
        ? p.standards 
        : (rawStd ? (typeof rawStd === 'string' ? rawStd.split(/[/,;]+/) : rawStd) : ['ISO 9001:2015']);
      const standardsText = standardsList.map((s: string) => cleanStandardName(s)).join(', ');
      const certNo = compAny?.certNo || contract?.certNumber || 'Q240101';
      const kabMd = p.appliedMd || p.kabStandardMd || 2.5;

      // 1. 심사준비: "일정협의" (줄바꾸어) "xx-xx 시작"
      const prepDate = p.startDate 
        ? (new Date(new Date(p.startDate).getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(5, 10))
        : '08-10';
      const isPastOrCurrent = (p.status as any) !== '계획수립';
      const prep = {
        status: isPastOrCurrent ? ('completed' as const) : ('in_progress' as const),
        title: '일정협의',
        date: `${prepDate} 시작`
      };

      // 2. 계획서: "업체발송", "승인완료"
      const hasPlanApproved = ['심사진행중', '보고서작성', '서명대기', '서명완료', '사무국검토대기', '보완요청', '심의대기', '심의진행', '인증발행'].includes(p.status as any);
      const isPlanSent = p.status === '계획서발송' || Boolean(p.planSentDate);
      const planDate = p.planSentDate || (p.startDate ? new Date(new Date(p.startDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(5, 10) : '08-25');
      const plan = {
        status: hasPlanApproved ? ('completed' as const) : (isPlanSent ? ('in_progress' as const) : ('pending' as const)),
        statusText: hasPlanApproved ? '승인완료' : (isPlanSent ? '업체발송' : '-'),
        date: (hasPlanApproved || isPlanSent) ? planDate : ''
      };

      // 3. 청구서: "업체발송", "승인완료"
      const isBillingApproved = p.taxInvoiceStatus === '영수발행' || p.paymentStatus === '입금완료';
      const isBillingSent = p.taxInvoiceStatus === '청구발행' || p.paymentStatus === '부분입금' || (hasPlanApproved && !isBillingApproved);
      const billDate = p.startDate ? new Date(new Date(p.startDate).getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(5, 10) : '08-28';
      const billing = {
        status: isBillingApproved ? ('completed' as const) : (isBillingSent ? ('in_progress' as const) : ('pending' as const)),
        statusText: isBillingApproved ? '승인완료' : (isBillingSent ? '업체발송' : '-'),
        date: (isBillingApproved || isBillingSent) ? billDate : '',
        amount: p.finalFee || 1800000
      };

      // 4. 심사일정: 일자만 기록
      const schedule = {
        startDate: p.startDate || '2026-09-15',
        endDate: p.endDate || '2026-09-16',
        md: kabMd
      };

      // 5. 심사팀: 팀장: xxx (줄바꾸어) 팀원: yyy
      const rep = p.reportId ? reports[p.reportId] : undefined;
      const teamLead = p.leadAuditorName || '김홍덕';
      let teamMember = '단독심사';
      if (rep && rep.auditTeam && rep.auditTeam.length > 0) {
        teamMember = rep.auditTeam.filter(m => !m.includes(teamLead))[0] || rep.auditTeam[0] || '이혜화';
      } else if (auditors.length > 2) {
        const otherAud = auditors[(idx * 2 + 1) % auditors.length];
        teamMember = otherAud.name !== teamLead ? otherAud.name : '이혜화';
      }
      const team = {
        leadAuditor: teamLead,
        teamAuditor: teamMember
      };

      // 6. 심사완료: 완료 표시만
      const isOnsiteDone = ['보고서작성', '서명대기', '서명완료', '사무국검토대기', '보완요청', '심의대기', '심의진행', '인증발행'].includes(p.status as any);
      const isOnsiteCurrent = p.status === '심사진행중';
      const onsite = {
        status: isOnsiteDone ? ('completed' as const) : (isOnsiteCurrent ? ('in_progress' as const) : ('pending' as const)),
        statusText: isOnsiteDone ? '완료' : (isOnsiteCurrent ? '진행중' : '-')
      };

      // 7. 심사보고서: 대기-접수-검토-승인
      const isReportApproved = ['심의대기', '심의진행', '인증발행'].includes(p.status as any);
      const isReportReviewing = ['사무국검토대기', '보완요청'].includes(p.status as any);
      const isReportSubmitted = ['보고서작성', '서명완료'].includes(p.status as any);

      const defaultStage: '대기' | '접수' | '검토' | '승인' = isReportApproved
        ? '승인'
        : (isReportReviewing ? '검토' : (isReportSubmitted ? '접수' : '대기'));

      const reportDate = p.endDate ? new Date(new Date(p.endDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(5, 10) : '09-18';

      // 사무국 수동 편집 상태가 있을 경우 우선 반영
      const customReport = reportCustomStages[p.id];
      const stage: '대기' | '접수' | '검토' | '승인' = customReport ? customReport.stage : defaultStage;
      const displayReportDate = customReport ? customReport.date : (stage === '대기' ? '' : reportDate);

      const report = {
        status: stage === '승인' ? ('completed' as const) : (stage === '대기' ? ('pending' as const) : ('in_progress' as const)),
        stage,
        statusText: stage,
        date: displayReportDate,
        reportId: p.reportId,
        note: customReport?.note
      };

      // 8. 심의의결: 대기중, 승인일자
      const isCommitteeDone = p.committeeStatus === '등록승인' || p.status === '인증발행';
      const isCommitteePending = p.committeeStatus === '심의진행' || p.committeeStatus === '심의상정' || p.status === '심의대기' || p.status === '심의진행' || isReportApproved;
      const committeeDate = p.endDate ? new Date(new Date(p.endDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(5, 10) : '09-22';
      const committee = {
        status: isCommitteeDone ? ('completed' as const) : (isCommitteePending ? ('in_progress' as const) : ('pending' as const)),
        statusText: isCommitteeDone ? '승인' : (isCommitteePending ? '대기중' : '-'),
        date: isCommitteeDone ? committeeDate : ''
      };

      // 9. 심사비정산: 정산중, 정산일자
      const settlementRecord = settlements.find(s => s.projectId === p.id);
      const isSettlementDone = settlementRecord?.payoutStatus === '지급완료';
      const isSettlementPending = isCommitteeDone && !isSettlementDone;
      const settlementDate = settlementRecord?.paidDate ? settlementRecord.paidDate.slice(5) : (p.endDate ? new Date(new Date(p.endDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(5, 10) : '09-25');
      const settlement = {
        status: isSettlementDone ? ('completed' as const) : (isSettlementPending ? ('in_progress' as const) : ('pending' as const)),
        statusText: isSettlementDone ? '정산완료' : (isSettlementPending ? '정산중' : '-'),
        date: isSettlementDone ? settlementDate : ''
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
        prep,
        plan,
        billing,
        schedule,
        team,
        onsite,
        report,
        committee,
        settlement,
        rawProject: p,
        rawCompany: comp
      };
    });
  }, [projects, companyMap, contractMap, reports, settlements, auditors, reportCustomStages]);

  // 필터링 (월별 필터 + 검색어 + 규격 + 진행단계)
  const filteredRows = useMemo(() => {
    const monthStr = selectedMonth === 'all' ? '' : String(selectedMonth).padStart(2, '0');
    const targetPrefix = selectedMonth === 'all' ? `${selectedYear}-` : `${selectedYear}-${monthStr}`;

    return processRows.filter(row => {
      // 1. 월별 필터 (접속월 / 선택월 기준 심사일정 매칭)
      const matchesMonth = selectedMonth === 'all'
        ? (row.schedule.startDate.startsWith(`${selectedYear}-`) || row.schedule.endDate.startsWith(`${selectedYear}-`))
        : (row.schedule.startDate.startsWith(targetPrefix) || row.schedule.endDate.startsWith(targetPrefix));

      if (!matchesMonth) return false;

      // 2. 텍스트 검색 (업체명, 대표자, 사업자번호, 인증번호, 규격)
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
      if (selectedFilterStep === 'prep') {
        matchesStep = row.prep.status === 'in_progress';
      } else if (selectedFilterStep === 'plan') {
        matchesStep = row.plan.status === 'in_progress';
      } else if (selectedFilterStep === 'onsite') {
        matchesStep = row.onsite.status === 'in_progress';
      } else if (selectedFilterStep === 'report') {
        matchesStep = row.report.status === 'in_progress';
      } else if (selectedFilterStep === 'committee') {
        matchesStep = row.committee.status === 'in_progress';
      } else if (selectedFilterStep === 'settlement_done') {
        matchesStep = row.settlement.status === 'completed';
      }

      return matchesSearch && matchesStd && matchesStep;
    });
  }, [processRows, searchTerm, selectedFilterStep, selectedStandard, selectedYear, selectedMonth]);

  // 페이지네이션 계산 (20건 단위)
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safeCurrentPage]);

  // CSV 다운로드 핸들러
  const handleExportCsv = () => {
    const headers = [
      'No',
      '기업명',
      '대표자',
      '사업자번호',
      '인증규격',
      '인증번호',
      '심사구분',
      '1.심사준비',
      '2.계획서',
      '3.청구서',
      '4.심사일정',
      '5.심사팀',
      '6.심사완료',
      '7.심사보고서',
      '8.심의의결',
      '9.심사비정산'
    ];

    const rows = filteredRows.map((r, i) => [
      i + 1,
      `"${r.companyName}"`,
      `"${r.ceoName}"`,
      r.bizNumber,
      `"${r.standardsText}"`,
      r.certNo,
      r.auditType,
      `"${r.prep.title} (${r.prep.date})"`,
      `"${r.plan.statusText} ${r.plan.date}"`,
      `"${r.billing.statusText} ${r.billing.date}"`,
      `"${r.schedule.startDate} ~ ${r.schedule.endDate}"`,
      `"팀장:${r.team.leadAuditor} / 팀원:${r.team.teamAuditor}"`,
      r.onsite.statusText,
      `"${r.report.statusText} ${r.report.date}"`,
      `"${r.committee.statusText} ${r.committee.date}"`,
      `"${r.settlement.statusText} ${r.settlement.date}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GMSCS_심사진행프로세스대장_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3 animate-in fade-in">
      {/* 1. 상단 타이틀 & 빠른 액션 바 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              심사진행현황
            </h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 font-mono">
              9개 단계 파이프라인
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            심사준비부터 계획서, 청구서, 심사일정, 심사팀, 심사완료, 심사보고서, 심의의결, 심사비정산까지 전체 수명주기를 엑셀 테이블로 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>엑셀 다운로드 (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. 월별 조회 & 필터 통합 컨트롤 바 (1줄로 통합) */}
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

          {/* 당월(접속월: 9월) 바로가기 버튼 */}
          <button
            type="button"
            onClick={handleCurrentMonth}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition cursor-pointer ${
              selectedYear === defaultYear && selectedMonth === defaultMonth
                ? 'bg-cyan-50 text-cyan-800 border-cyan-300 font-semibold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 font-medium'
            }`}
            title="접속월(현재 9월)로 바로 이동"
          >
            <RotateCcw className="w-3 h-3" />
            <span>접속월({defaultMonth}월)</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 mx-0.5 hidden sm:block" />

          {/* 검색창 */}
          <div className="relative min-w-[210px]">
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
            <option value="prep">1. 심사준비 중</option>
            <option value="plan">2. 계획서 진행 중</option>
            <option value="onsite">6. 현장심사 진행 중</option>
            <option value="report">7. 심사보고서 검토 중</option>
            <option value="committee">8. 심의의결 대기 중</option>
            <option value="settlement_done">9. 심사비 정산완료</option>
          </select>
        </div>

        {/* 우측: 범례 & 건수/페이지 */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          {/* 상태 범례 */}
          <div className="hidden xl:flex items-center gap-2.5 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-slate-400">대기</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span className="text-blue-700 font-semibold">진행중</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <span className="text-slate-900 font-medium">완료</span>
            </span>
          </div>

          <div className="h-3 w-[1px] bg-slate-200 hidden xl:block" />

          {/* 건수 및 페이지 */}
          <div className="font-mono text-xs whitespace-nowrap text-slate-700">
            총 <strong className="text-cyan-700 font-bold">{filteredRows.length}</strong>건
            <span className="text-slate-400 ml-1">({safeCurrentPage}/{totalPages}p)</span>
          </div>
        </div>
      </div>

      {/* 3. 메인 엑셀 스타일 프로세스 테이블 (박스 중첩 제거, 텍스트 직접 표시) */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 select-none text-[12px]">
                {/* 좌측 고정 기본 정보 */}
                <th className="py-2.5 px-2 text-center w-10 text-slate-500 font-normal whitespace-nowrap border-r border-slate-300">
                  No
                </th>
                <th className="py-2.5 px-3 min-w-[155px] whitespace-nowrap border-r border-slate-300">
                  기업명 (대표자)
                </th>
                <th className="py-2.5 px-3 min-w-[170px] whitespace-nowrap border-r border-slate-300">
                  인증규격 (인증번호)
                </th>
                <th className="py-2.5 px-2 text-center min-w-[80px] whitespace-nowrap border-r border-slate-300">
                  심사구분
                </th>

                {/* 우측 4대 라이프사이클 컬럼 + 심의의결 + 정산팝업 */}
                <th className="py-2.5 px-3 text-center min-w-[210px] whitespace-nowrap border-r border-slate-300 bg-slate-50/70">
                  Pre-AUDIT
                </th>
                <th className="py-2.5 px-2 text-center min-w-[125px] whitespace-nowrap border-r border-slate-300 bg-slate-50/70">
                  AUDIT (심사기간)
                </th>
                <th className="py-2.5 px-2 text-center min-w-[110px] whitespace-nowrap border-r border-slate-300 bg-slate-50/70">
                  TEAM (심사팀)
                </th>
                <th className="py-2.5 px-2 text-center min-w-[155px] whitespace-nowrap border-r border-slate-300 bg-slate-50/70">
                  Post-AUDIT
                </th>
                <th className="py-2.5 px-2 text-center min-w-[95px] whitespace-nowrap border-r border-slate-300 bg-slate-50/70">
                  심의의결
                </th>
                <th className="py-2.5 px-2 text-center min-w-[85px] whitespace-nowrap bg-slate-50/70">
                  심사비정산
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 font-normal">
                    {selectedYear}년 {selectedMonth === 'all' ? '전체 기간' : `${selectedMonth}월`}에 일치하는 심사 일정이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => (
                  <tr
                    key={row.projectId}
                    onClick={() => {
                      setEditingReportRow({
                        row,
                        stage: row.report.stage,
                        date: row.report.date || (row.schedule.endDate ? new Date(new Date(row.schedule.endDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(5, 10) : '09-18'),
                        note: row.report.note || ''
                      });
                    }}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    title="해당 행을 클릭하여 사무국에서 심사보고서 단계(대기-접수-검토-승인)를 편집할 수 있습니다."
                  >
                    {/* No (페이지네이션 연동 누적 순번) */}
                    <td className="py-2 px-1 text-center font-mono text-slate-400 text-xs align-middle border-r border-slate-200">
                      {(safeCurrentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>

                    {/* 기업명 (대표자) */}
                    <td className="py-2 px-3 align-middle border-r border-slate-200">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          row.rawCompany && setSelectedCompany(row.rawCompany);
                        }}
                        className="text-left group cursor-pointer"
                      >
                        <div className="font-semibold text-slate-900 group-hover:text-cyan-700 transition flex items-center gap-1">
                          <span className="underline decoration-slate-300 group-hover:decoration-cyan-600 underline-offset-2">
                            {row.companyName}
                          </span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-cyan-600 shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {row.ceoName} 대표 {row.bizNumber ? `(${row.bizNumber})` : ''}
                        </div>
                      </button>
                    </td>

                    {/* 인증규격 (인증번호) */}
                    <td className="py-2 px-3 leading-snug align-middle border-r border-slate-200">
                      <div className="text-slate-800 font-normal">
                        {row.standardsText}
                      </div>
                      <div className="text-slate-900 font-mono text-[11px] font-bold mt-0.5">
                        ({row.certNo})
                      </div>
                    </td>

                    {/* 심사구분: 배지 박스 없이 순수 텍스트만 표시 */}
                    <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-slate-800 text-[12px] font-normal">
                      {row.auditType}
                    </td>

                    {/* Pre-AUDIT: 계약(준비) - 일정협의 - 계획승인 - 계획서발송(고객) */}
                    <td className="py-2 px-2.5 align-middle border-r border-slate-200">
                      <div className="flex items-center justify-center gap-1 text-[11px] whitespace-nowrap">
                        <span className="text-slate-900 font-semibold" title="계약 체결 및 준비 완료">
                          계약(준비)
                        </span>
                        <span className="text-slate-300">-</span>
                        <span className={row.schedule.startDate ? "text-slate-900 font-semibold" : "text-slate-300"} title={row.schedule.startDate ? `일정협의 완료 (${row.schedule.startDate})` : "일정협의 대기"}>
                          일정협의
                        </span>
                        <span className="text-slate-300">-</span>
                        <span className={row.plan.status === 'completed' || row.plan.status === 'in_progress' ? "text-slate-900 font-semibold" : "text-slate-300"} title="심사계획 승인">
                          계획승인
                        </span>
                        <span className="text-slate-300">-</span>
                        {row.plan.status === 'completed' || row.plan.status === 'in_progress' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDoc({ isOpen: true, type: 'plan', row });
                            }}
                            className="text-cyan-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
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
                      </div>
                    </td>

                    {/* AUDIT (심사기간) */}
                    <td className="py-2 px-2 text-center align-middle border-r border-slate-200 whitespace-nowrap">
                      <div className="font-mono text-slate-800 text-[11.5px] leading-snug">
                        <div>{row.schedule.startDate}</div>
                        <div className="text-slate-500 text-[11px]">~ {row.schedule.endDate}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        ({row.schedule.md.toFixed(1)}MD)
                      </div>
                    </td>

                    {/* TEAM (심사팀) */}
                    <td className="py-2 px-2 text-center align-middle border-r border-slate-200 whitespace-nowrap">
                      <div className="leading-snug text-[11.5px]">
                        <div className="text-slate-900 font-medium">
                          <span className="text-slate-400 font-normal text-[10.5px]">팀장: </span>
                          <span>{row.team.leadAuditor}</span>
                        </div>
                        <div className="text-slate-600 font-normal text-[11px] mt-0.5">
                          <span className="text-slate-400 text-[10.5px]">팀원: </span>
                          <span>{row.team.teamAuditor}</span>
                        </div>
                      </div>
                    </td>

                    {/* Post-AUDIT: 보고서 접수 - 보고서 승인 */}
                    <td className="py-2 px-2 text-center align-middle border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 text-[11px]">
                        {row.report.stage === '접수' || row.report.stage === '검토' || row.report.stage === '승인' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (row.rawProject.reportId && onOpenReport) {
                                onOpenReport(row.rawProject.reportId);
                              } else {
                                setEditingReportRow({
                                  row,
                                  stage: row.report.stage,
                                  date: row.report.date || '',
                                  note: row.report.note || ''
                                });
                              }
                            }}
                            className="text-blue-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                            title="심사원 보고서 제출 완료 -> 사무국 접수됨 (클릭하여 열람)"
                          >
                            <span>보고서 접수</span>
                            <ExternalLink className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                          </button>
                        ) : (
                          <span className="text-slate-300">보고서 접수</span>
                        )}

                        <span className="text-slate-300">-</span>

                        {row.report.stage === '승인' ? (
                          <span className="text-emerald-700 font-bold" title={`사무국 승인 완료 (${row.report.date})`}>
                            보고서 승인
                          </span>
                        ) : (
                          <span className="text-slate-300">보고서 승인</span>
                        )}
                      </div>
                      {row.report.date && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {row.report.date}
                        </div>
                      )}
                    </td>

                    {/* 심의의결: 예정(날짜) -> 승인(날짜) */}
                    <td className={`py-2 px-2 text-center align-middle border-r border-slate-200 whitespace-nowrap ${
                      row.committee.status === 'in_progress' ? 'bg-blue-50/40' : ''
                    }`}>
                      {row.committee.status === 'completed' ? (
                        <div className="leading-snug text-emerald-700 font-bold text-[11.5px]">
                          <div>승인</div>
                          {row.committee.date && (
                            <div className="text-[10px] font-mono text-emerald-600 mt-0.5">({row.committee.date})</div>
                          )}
                        </div>
                      ) : row.committee.status === 'in_progress' ? (
                        <div className="leading-snug text-blue-700 font-semibold text-[11.5px]">
                          <div>예정</div>
                          {row.committee.date && (
                            <div className="text-[10px] font-mono text-blue-500 mt-0.5">({row.committee.date})</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[11px]">-</span>
                      )}
                    </td>

                    {/* 심사비정산: 팝업 창에서 표시 */}
                    <td className="py-2 px-2 text-center align-middle whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewSettlement({ isOpen: true, row });
                        }}
                        className={`px-2 py-1 rounded text-xs font-semibold border transition shadow-2xs cursor-pointer ${
                          row.settlement.status === 'completed'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                            : row.settlement.status === 'in_progress'
                            ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                        title="클릭 시 심사비 정산 상세 팝업 창 열기"
                      >
                        {row.settlement.status === 'completed' ? '정산완료' : (row.settlement.status === 'in_progress' ? '정산중' : '정산상세')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 테이블 푸터 */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            * 계획서, 청구서, 심사보고서는 승인 완료 상태에서 클릭 시 해당 공식 공문서를 팝업으로 조회할 수 있습니다.
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
            {/* 첫 페이지 */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
              title="첫 페이지"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            {/* 이전 페이지 */}
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
              title="이전 페이지"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* 페이지 번호 버튼들 */}
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

            {/* 다음 페이지 */}
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
              title="다음 페이지"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {/* 마지막 페이지 */}
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

      {/* ========================================================================= */}
      {/* 4. 공문 문서 팝업 모달 (계획서 승인 공문 or 청구서/세금계산서) */}
      {/* ========================================================================= */}
      {previewDoc.isOpen && previewDoc.row && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-14 px-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-6">
            {/* 팝업 헤더 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  {previewDoc.type === 'plan' ? '계획' : '청구'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {previewDoc.type === 'plan' ? '심사계획서 공문 (Audit Plan)' : '심사비 청구서 및 세금계산서 (Invoice)'}
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

            {/* 공문 본문 (A4 규격 서식 스타일) */}
            <div className="my-4 p-5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-4 font-sans">
              <div className="text-center pb-3 border-b border-slate-200">
                <h4 className="text-lg font-bold text-slate-900">
                  {previewDoc.type === 'plan' ? '인 증 심 사 계 획 서' : '인 증 심 사 비 청 구 서'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">글로벌매니지먼트시스템인증원 (GMSCS) 사무국</p>
              </div>

              {/* 수신 및 기본 정보 그리드 */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">수신 업체명</span>
                  <span className="font-bold text-slate-900 text-sm">{previewDoc.row.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">대표자 / 사업자번호</span>
                  <span className="text-slate-800">{previewDoc.row.ceoName} 대표 ({previewDoc.row.bizNumber})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">적용 인증 규격</span>
                  <span className="font-semibold text-cyan-900">{previewDoc.row.standardsText}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">인증번호</span>
                  <span className="font-mono text-slate-800 font-bold">{previewDoc.row.certNo}</span>
                </div>
              </div>

              {/* 계획서 전용 내용 */}
              {previewDoc.type === 'plan' && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">심사 구분 및 일자:</span>
                      <span className="font-bold text-slate-900">{previewDoc.row.auditType} ({previewDoc.row.schedule.startDate} ~ {previewDoc.row.schedule.endDate})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">배정 심사팀:</span>
                      <span className="font-bold text-blue-900">팀장 {previewDoc.row.team.leadAuditor} / 팀원 {previewDoc.row.team.teamAuditor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">인정 심사 공수(MD):</span>
                      <span className="font-mono text-slate-800">{previewDoc.row.schedule.md.toFixed(1)} MD</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    * 본 심사는 KAB 공인 규정 및 경영시스템 인증 기준에 따라 진행되며, 심사 개시 전 준비 서류 및 심사 동행자를 사전에 확인하여 주시기 바랍니다.
                  </div>
                </div>
              )}

              {/* 청구서 전용 내용 */}
              {previewDoc.type === 'billing' && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">기본 현장심사비:</span>
                      <span className="font-mono text-slate-900 font-semibold">{previewDoc.row.billing.amount.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">부가가치세 (10%):</span>
                      <span className="font-mono text-slate-700">{(previewDoc.row.billing.amount * 0.1).toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 text-sm font-bold">
                      <span className="text-slate-900">청구 총 합계액:</span>
                      <span className="text-cyan-800 font-mono">{(previewDoc.row.billing.amount * 1.1).toLocaleString()}원</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 text-[11.5px] text-emerald-950 space-y-1">
                    <div className="font-bold">입금 계좌 안내:</div>
                    <div className="font-mono text-xs">국민은행 814301-04-123456 (예금주: 글로벌매니지먼트시스템인증원)</div>
                    <div className="text-[10.5px] text-emerald-800">* 전자세금계산서는 국세청 홈택스를 통해 자동 영수/청구 발행됩니다.</div>
                  </div>
                </div>
              )}

              {/* 직인 영역 */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">발행일: 2026년 09월 10일</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">글로벌매니지먼트시스템인증원장</span>
                  <div className="w-8 h-8 rounded-full border-2 border-rose-600 text-rose-600 font-bold text-[9px] flex items-center justify-center rotate-6 select-none">
                    인증원인
                  </div>
                </div>
              </div>
            </div>

            {/* 팝업 푸터 버튼 */}
            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>문서 인쇄</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDoc({ isOpen: false, type: 'plan', row: null })}
                className="px-4 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. 사무국 심사보고서 진행단계(대기-접수-검토-승인) 편집 모달 */}
      {/* ========================================================================= */}
      {editingReportRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            {/* 헤더 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                  보고서
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    사무국 심사보고서 단계 편집
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[260px]">
                    {editingReportRow.row.companyName} ({editingReportRow.row.auditType})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingReportRow(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 본문 폼 */}
            <div className="mt-4 space-y-4 text-xs">
              {/* 단계 선택: 대기 - 접수 - 검토 - 승인 */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  진행 단계 선택 (대기 - 접수 - 검토 - 승인)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['대기', '접수', '검토', '승인'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditingReportRow(prev => prev ? { ...prev, stage: st } : null)}
                      className={`py-2 px-1 text-center font-bold rounded-lg border transition cursor-pointer ${
                        editingReportRow.stage === st
                          ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200 leading-relaxed">
                  * 선택된 <span className="text-slate-950 font-bold">[{editingReportRow.stage}]</span> 단계가 대장 테이블에서 검정색으로 진하게 표시되며, 나머지는 흐릿하게 표시됩니다.
                </div>
              </div>

              {/* 일자 */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  보고서 일자 (접수/검토/승인일)
                </label>
                <input
                  type="text"
                  placeholder="예: 09-18 또는 2026-09-18"
                  value={editingReportRow.date}
                  onChange={(e) => setEditingReportRow(prev => prev ? { ...prev, date: e.target.value } : null)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* 메모/검토의견 */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  사무국 검토 의견 / 메모
                </label>
                <textarea
                  rows={2}
                  placeholder="보완 요청사항 또는 사무국 검토 메모 입력"
                  value={editingReportRow.note}
                  onChange={(e) => setEditingReportRow(prev => prev ? { ...prev, note: e.target.value } : null)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* 보고서 원문 바로가기 링크 (있을 경우) */}
              {editingReportRow.row.report.reportId && onOpenReport && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenReport(editingReportRow.row.report.reportId!);
                      setEditingReportRow(null);
                    }}
                    className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-800 underline underline-offset-2 font-medium"
                  >
                    <span>심사보고서 전문 열람 및 온라인 검토</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingReportRow(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer font-medium"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingReportRow) {
                    setReportCustomStages(prev => ({
                      ...prev,
                      [editingReportRow.row.projectId]: {
                        stage: editingReportRow.stage,
                        date: editingReportRow.date,
                        note: editingReportRow.note
                      }
                    }));
                    setEditingReportRow(null);
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition cursor-pointer"
              >
                단계 저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. 심사비 정산 상세 팝업 모달 */}
      {/* ========================================================================= */}
      {previewSettlement.isOpen && previewSettlement.row && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                  정산
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    심사비 정산 상세 내역
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {previewSettlement.row.companyName} ({previewSettlement.row.auditType})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSettlement({ isOpen: false, row: null })}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">인증규격:</span>
                  <span className="font-semibold text-slate-800">{previewSettlement.row.standardsText}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">심사기간:</span>
                  <span className="font-mono text-slate-800">{previewSettlement.row.schedule.startDate} ~ {previewSettlement.row.schedule.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">심사팀 배정:</span>
                  <span className="font-semibold text-slate-900">팀장 {previewSettlement.row.team.leadAuditor} / 팀원 {previewSettlement.row.team.teamAuditor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">인정 공수:</span>
                  <span className="font-mono text-slate-800">{previewSettlement.row.schedule.md.toFixed(1)} MD</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">총 심사비용:</span>
                  <span className="font-mono font-bold text-slate-900">{previewSettlement.row.billing.amount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MD당 적용단가:</span>
                  <span className="font-mono text-slate-700">700,000원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">세무 처리 기준:</span>
                  <span className="text-slate-700 font-medium">3.3% 사업소득 원천징수 또는 세금계산서</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-700 font-semibold">정산 상태:</span>
                  <span className={`font-bold ${
                    previewSettlement.row.settlement.status === 'completed'
                      ? 'text-emerald-700'
                      : 'text-blue-600'
                  }`}>
                    {previewSettlement.row.settlement.statusText}
                    {previewSettlement.row.settlement.date ? ` (${previewSettlement.row.settlement.date})` : ''}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-[11px] text-blue-900 space-y-0.5">
                <div className="font-bold">정산 지급 계좌 안내:</div>
                <div className="text-blue-800 font-mono">신한은행 110-384-912048 (예금주: {previewSettlement.row.team.leadAuditor})</div>
                <div className="text-[10.5px] text-blue-600 mt-1">* 심사보고서 승인 및 심의 통과 후 익월 10일 정산 입금 처리됩니다.</div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewSettlement({ isOpen: false, row: null })}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기업 전체 심사 이력 팝업 모달 */}
      <CompanyAuditHistoryModal
        isOpen={Boolean(selectedCompany)}
        onClose={() => setSelectedCompany(null)}
        company={selectedCompany}
        contracts={contracts}
        projects={projects}
        reports={reports}
        settlements={settlements}
        allAuditors={auditors}
        onOpenReport={onOpenReport}
      />
    </div>
  );
};
