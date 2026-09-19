import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight
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
import { getCompanyAuditState, CompanyAuditState } from '../utils/auditStateUtils';
import { Pagination } from './Pagination';

export type SortColumn = 
  | 'no' 
  | 'company' 
  | 'standard' 
  | 'auditType' 
  | 'team' 
  | 'schedule' 
  | 'status';

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
  onOpenReportWorkbench?: (companyId: string) => void;
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
    contractDate: string;
    scheduleDate: string;
    planApprovalDate: string;
    planDispatchDate: string;
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
    receiptDate: string;
    approvalDate: string;
    stage: '대기' | '접수' | '검토' | '승인';
    reportId?: string;
    note?: string;
  };

  // 5. 심의의결
  committee: {
    status: 'completed' | 'in_progress' | 'pending';
    displayText: string;
    date: string;
  };

  rawProject: AuditProject;
  rawCompany?: Company;
}

const PAGE_SIZE = 20;

export const AuditProcessStatusManager: React.FC<AuditProcessStatusManagerProps> = ({
  projects,
  auditors: _auditors,
  companies,
  contracts = [],
  reports: _reports = {},
  settlements = [],
  committeeMeetings: _committeeMeetings = [],
  committeeSchedules: _committeeSchedules = []
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
    return projects.map((p, _idx) => {
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
      
      const standardsText = Array.isArray(standardsList) ? standardsList.map(s => String(s).trim()).join(', ') : String(standardsList);
      const certNo = compAny?.certNo || compAny?.certNumber || (p as any)?.certNo || '-';

      // Pre-Audit
      const contractDate = (contract as any)?.contractDate || p.startDate || '2026-08-10';
      const scheduleDate = p.startDate ? `${p.startDate} 확정` : '일정조율중';
      const planApprovalDate = p.planSentDate ? '승인완료' : ((p.status as any) === '계약완료' ? '승인대기' : '미승인');
      const planDispatchDate = p.planSentDate || ((p.status as any) === '계약완료' ? '2026-08-25' : '');
      const isPlanSent = Boolean(planDispatchDate);
      const hasPlanApproved = planApprovalDate === '승인완료';

      // Post-Audit
      const postStage: '대기' | '접수' | '검토' | '승인' = 
        p.committeeStatus === '등록승인' ? '승인' :
        p.status === '심의대기' || p.status === '심의진행' ? '검토' :
        p.status === '보고서작성' ? '접수' : '대기';

      return {
        projectId: p.id,
        companyId: p.companyId,
        companyName: p.companyName || comp?.companyName || '고객사',
        ceoName,
        bizNumber,
        address,
        contactPerson,
        contactPhone,
        contactEmail,
        standardsText,
        certNo,
        auditType: p.auditType || '사후심사',
        auditState,
        preAudit: {
          contractDate,
          scheduleDate,
          planApprovalDate,
          planDispatchDate,
          isPlanSent,
          hasPlanApproved
        },
        schedule: {
          startDate: p.startDate || '2026-09-10',
          endDate: p.endDate || '2026-09-12',
          md: p.appliedMd || p.kabStandardMd || 2.0
        },
        team: {
          leadAuditor: p.leadAuditorName || '남경호',
          teamAuditor: p.teamAuditorNames?.length ? p.teamAuditorNames.join(', ') : '단독심사'
        },
        postAudit: {
          receiptDate: p.endDate ? p.endDate : '',
          approvalDate: p.committeeStatus === '등록승인' ? '2026-09-24' : '',
          stage: postStage
        },
        committee: {
          status: p.committeeStatus === '등록승인' ? 'completed' : 'pending',
          displayText: p.committeeStatus === '등록승인' ? '2026-09-24 (승인)' : '2026-09-24 (예정)',
          date: '2026-09-24'
        },
        rawProject: p,
        rawCompany: comp
      };
    });
  }, [projects, companies, contracts, settlements, companyMap, contractMap]);

  // 검색 및 필터링
  const filteredRows = useMemo(() => {
    return processRows.filter(row => {
      // 1. 월 필터링
      if (selectedMonth !== 'all') {
        const startYear = parseInt(row.schedule.startDate.slice(0, 4), 10);
        const startMonth = parseInt(row.schedule.startDate.slice(5, 7), 10);
        if (startYear !== selectedYear || startMonth !== selectedMonth) {
          return false;
        }
      }

      // 2. 검색어 필터링
      const cleanSearch = searchTerm.trim().toLowerCase();
      const matchesSearch = !cleanSearch || 
        row.companyName.toLowerCase().includes(cleanSearch) ||
        row.ceoName.toLowerCase().includes(cleanSearch) ||
        row.bizNumber.replace(/[-\s]/g, '').includes(cleanSearch.replace(/[-\s]/g, '')) ||
        row.standardsText.toLowerCase().includes(cleanSearch) ||
        row.certNo.toLowerCase().includes(cleanSearch) ||
        row.team.leadAuditor.toLowerCase().includes(cleanSearch);

      // 3. 규격 필터링
      const matchesStd = selectedStandard === 'all' || row.standardsText.includes(selectedStandard);

      // 4. 진행단계 필터링
      let matchesStep = true;
      if (selectedFilterStep === 'preAudit') {
        matchesStep = row.auditState === '일정·계획';
      } else if (selectedFilterStep === 'onsite') {
        matchesStep = row.rawProject.status === '심사진행중';
      } else if (selectedFilterStep === 'report') {
        matchesStep = row.auditState === '보고서작성' || row.postAudit.stage === '접수' || row.postAudit.stage === '검토';
      } else if (selectedFilterStep === 'committee') {
        matchesStep = row.auditState === '심의중' || row.committee.status === 'in_progress';
      } else if (selectedFilterStep === 'approved') {
        matchesStep = row.auditState === '인증유지' || row.committee.status === 'completed';
      }

      return matchesSearch && matchesStd && matchesStep;
    });
  }, [processRows, searchTerm, selectedFilterStep, selectedStandard, selectedYear, selectedMonth]);

  // 상태별 정렬 우선순위
  const STATE_PRIORITY: Record<CompanyAuditState, number> = {
    '보고서작성': 1,
    '일정·계획': 2,
    '사무국검토': 3,
    '심의중': 4,
    '비용정산중': 5,
    '인증유지': 6,
    '자격정지': 7
  };

  // 정렬 처리
  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    list.sort((a, b) => {
      const prioA = STATE_PRIORITY[a.auditState] || 99;
      const prioB = STATE_PRIORITY[b.auditState] || 99;
      
      if (prioA !== prioB) {
        return prioA - prioB;
      }

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
        case 'team':
          valA = a.team.leadAuditor;
          valB = b.team.leadAuditor;
          break;
        case 'schedule':
          valA = a.schedule.startDate;
          valB = b.schedule.startDate;
          break;
        case 'status':
          valA = a.auditState;
          valB = b.auditState;
          break;
      }
      const cmp = valA.localeCompare(valB);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filteredRows, sortColumn, sortOrder]);

  // 페이지네이션 계산
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
          {/* 월 네비게이터 */}
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

      {/* 2. 심사진행현황 프로세스 대장 테이블 */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 select-none text-[12px]">
                {/* 1. 순번 (No) */}
                <th 
                  onClick={() => handleSort('no')}
                  className="py-2.5 px-2 text-center w-12 text-slate-600 font-normal whitespace-nowrap border-r border-slate-300 hover:bg-slate-200/80 cursor-pointer"
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
                  className="py-2.5 px-3 min-w-[180px] text-slate-700 font-normal whitespace-nowrap border-r border-slate-300 hover:bg-slate-200/80 cursor-pointer"
                  title="기업명 순 정렬"
                >
                  <div className="flex items-center">
                    <span>기업명 (대표자)</span>
                    {renderSortIcon('company')}
                  </div>
                </th>

                {/* 3. 인증표준/규격 (인증번호) */}
                <th 
                  onClick={() => handleSort('standard')}
                  className="py-2.5 px-3 min-w-[180px] text-slate-700 font-normal whitespace-nowrap border-r border-slate-300 hover:bg-slate-200/80 cursor-pointer"
                  title="인증규격 순 정렬"
                >
                  <div className="flex items-center">
                    <span>인증표준/규격 (인증번호)</span>
                    {renderSortIcon('standard')}
                  </div>
                </th>

                {/* 4. 심사구분 */}
                <th 
                  onClick={() => handleSort('auditType')}
                  className="py-2.5 px-2 text-center min-w-[90px] text-slate-700 font-normal whitespace-nowrap border-r border-slate-300 hover:bg-slate-200/80 cursor-pointer"
                  title="심사구분 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>심사구분</span>
                    {renderSortIcon('auditType')}
                  </div>
                </th>

                {/* 5. 심사팀 (팀장/팀원) */}
                <th 
                  onClick={() => handleSort('team')}
                  className="py-2.5 px-3 text-center min-w-[140px] text-slate-700 font-normal whitespace-nowrap border-r border-slate-300 hover:bg-slate-200/80 cursor-pointer"
                  title="심사팀 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>심사팀 (팀장/팀원)</span>
                    {renderSortIcon('team')}
                  </div>
                </th>

                {/* 6. 심사일정 (기간) */}
                <th 
                  onClick={() => handleSort('schedule')}
                  className="py-2.5 px-3 text-center min-w-[160px] text-slate-700 font-normal whitespace-nowrap border-r border-slate-300 hover:bg-slate-200/80 cursor-pointer"
                  title="심사일정 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>심사일정 (기간)</span>
                    {renderSortIcon('schedule')}
                  </div>
                </th>

                {/* 7. 진행상태 (가장 우측) */}
                <th 
                  onClick={() => handleSort('status')}
                  className="py-2.5 px-2 text-center min-w-[110px] text-slate-700 font-normal whitespace-nowrap hover:bg-slate-200/80 cursor-pointer"
                  title="심사진행 상태 순 정렬"
                >
                  <div className="flex items-center justify-center">
                    <span>진행상태</span>
                    {renderSortIcon('status')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-normal">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-normal">
                    {selectedYear}년 {selectedMonth === 'all' ? '전체 기간' : `${selectedMonth}월`}에 일치하는 심사 일정이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const auditState = getCompanyAuditState(row.rawCompany, undefined, row.rawProject);

                  return (
                    <tr
                      key={row.projectId}
                      className="hover:bg-slate-50/80 transition font-normal select-text"
                    >
                      {/* 1. No */}
                      <td className="py-2.5 px-2 text-center font-mono text-slate-400 text-xs align-middle border-r border-slate-200 font-normal">
                        {(safeCurrentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>

                      {/* 2. 기업명 (대표자) */}
                      <td className="py-2.5 px-3 align-middle border-r border-slate-200">
                        <div className="text-slate-900 font-bold">
                          {row.companyName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5 whitespace-nowrap">
                          {row.ceoName} 대표 {row.bizNumber ? `(${row.bizNumber})` : ''}
                        </div>
                      </td>

                      {/* 3. 인증표준/규격 (인증번호) */}
                      <td className="py-2.5 px-3 leading-snug align-middle border-r border-slate-200 whitespace-nowrap font-normal">
                        <div className="text-slate-700 font-normal whitespace-nowrap">
                          {row.standardsText}
                        </div>
                        <div className="text-slate-950 font-mono text-[12px] font-bold mt-0.5 whitespace-nowrap tracking-tight">
                          ({row.certNo})
                        </div>
                      </td>

                      {/* 4. 심사구분 */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-slate-700 text-[12px] font-normal">
                        {row.auditType}
                      </td>

                      {/* 5. 심사팀 (팀장/팀원) */}
                      <td className="py-2.5 px-3 text-center align-middle border-r border-slate-200 whitespace-nowrap font-normal">
                        <div className="leading-snug text-[11.5px] text-slate-800 font-normal">
                          <span className="font-semibold text-slate-900">{row.team.leadAuditor} (팀장)</span>
                          {row.team.teamAuditor && row.team.teamAuditor !== '단독심사' && (
                            <span className="text-slate-500 font-normal">, {row.team.teamAuditor}</span>
                          )}
                        </div>
                      </td>

                      {/* 6. 심사일정 (기간) */}
                      <td className="py-2.5 px-3 text-center align-middle border-r border-slate-200 whitespace-nowrap font-normal">
                        <div className="font-mono text-slate-800 text-xs leading-snug font-normal">
                          <div>{row.schedule.startDate} ~ {row.schedule.endDate}</div>
                          <div className="text-slate-500 font-normal text-[11px] mt-0.5">
                            ({row.schedule.md.toFixed(1)} MD)
                          </div>
                        </div>
                      </td>

                      {/* 7. 진행상태 (가장 우측) */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle text-xs font-normal">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          auditState === '보고서작성' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          auditState === '일정·계획' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                          auditState === '사무국검토' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          auditState === '심의중' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          auditState === '비용정산중' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          auditState === '자격정지' ? 'bg-slate-200 text-slate-600 border border-slate-300' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {auditState}
                        </span>
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
            * 심사 진행상태는 실시간 공정 데이터에 따라 자동으로 분류·표시됩니다.
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            {selectedYear}년 {selectedMonth === 'all' ? '전체' : `${selectedMonth}월`} 대상 총 <strong className="text-slate-900">{filteredRows.length}</strong>건 (페이지당 {PAGE_SIZE}건)
          </div>
        </div>
      </div>

      {/* 3. 페이지네이션 컨트롤 바 */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center gap-2">
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filteredRows.length}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => setCurrentPage(p)}
        />
        <div className="flex flex-col sm:flex-row items-center justify-between w-full text-slate-500 font-normal px-2 pt-1 border-t border-slate-100 text-xs">
          <div>
            {selectedYear}년 {selectedMonth === 'all' ? '전체' : `${selectedMonth}월`} 대상 총 <strong className="text-slate-900">{filteredRows.length}</strong>건 (페이지당 {PAGE_SIZE}건)
          </div>
          <div className="font-mono text-slate-600">
            총 {filteredRows.length}건 중 {filteredRows.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1} ~ {Math.min(safeCurrentPage * PAGE_SIZE, filteredRows.length)}건 표시
          </div>
        </div>
      </div>
    </div>
  );
};
