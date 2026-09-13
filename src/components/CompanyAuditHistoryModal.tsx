import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  X, 
  Calendar as CalendarIcon, 
  FileText, 
  Award, 
  UserCheck, 
  Folder,
  Layers,
  MapPin,
  Phone,
  Mail,
  Clock,
  Briefcase,
  Send,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  ExternalLink,
  Shield,
  Leaf,
  Users,
  Database,
  Printer,
  ChevronRight,
  ClipboardList,
  Plus,
  Trash2,
  Paperclip,
  ArrowRightLeft,
  FileCheck2,
  Download,
  FolderArchive,
  HardDrive
} from 'lucide-react';
import { Company, AuditProject, CertContract, Auditor, AuditReport, AuditorSettlement, AuditContractRecord } from '../types';
import { isConflictOfInterest, getAgencyDisplayName } from '../utils/conflictUtils';
import { AuditPlanInvoiceDocModal } from './AuditPlanInvoiceDocModal';
import { AuditAttachmentDocModal, AttachmentDocItem } from './AuditAttachmentDocModal';
import { cleanCeoName, cleanPersonName, splitPersonAndPosition } from '../utils/personUtils';
import { getDriveReportsForCompany, DriveReportFileItem } from '../data/driveReportFiles';

export interface CompanyAuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  contracts?: CertContract[];
  auditContracts?: AuditContractRecord[];
  projects?: AuditProject[];
  reports?: Record<string, AuditReport>;
  settlements?: AuditorSettlement[];
  allAuditors?: Auditor[];
  onOpenReport?: (reportId: string) => void;
  onOpenReportWorkbench?: (company: Company) => void;
  onOpenPlanInvoiceModal?: (company: Company) => void;
  onOpenPdfReport?: (info: { title: string; companyName: string; standard?: string; auditType?: string; auditDate?: string; auditorName?: string; pdfUrl?: string }) => void;
}

// 심사 성격 계산
function getAuditStage(comp: Company, contract?: CertContract, project?: AuditProject): string {
  if (project?.auditType) {
    if (project.auditType.includes('최초')) return '최초심사 (1단계/2단계)';
    if (project.auditType.includes('1차')) return '1차 사후관리심사';
    if (project.auditType.includes('2차')) return '2차 사후관리심사';
    if (project.auditType.includes('갱신')) return '갱신심사 (재인증)';
    return project.auditType;
  }
  if (contract?.initialCertDate) {
    const certYear = parseInt(contract.initialCertDate.substring(0, 4), 10);
    const currentYear = 2026;
    const diff = currentYear - certYear;
    if (diff <= 0) return '최초심사 (1단계/2단계)';
    if (diff % 3 === 1) return '1차 사후관리심사';
    if (diff % 3 === 2) return '2차 사후관리심사';
    return '갱신심사 (재인증)';
  }
  return '1차 사후관리심사';
}

// 인증 표준 및 인증번호 매핑
function getStandardsWithCertNo(comp: Company, contract?: CertContract): { std: string; certNo: string }[] {
  const compAny = comp as any;
  let stds: string[] = ['ISO 9001:2015'];

  if (contract?.standards && contract.standards.length > 0) {
    stds = contract.standards;
  } else if (compAny.standards) {
    stds = typeof compAny.standards === 'string' 
      ? compAny.standards.split(/[/,;]+/).map((s: string) => s.trim()) 
      : compAny.standards;
  }

  const baseCert = contract?.certNumber || compAny.certNo || 'Q260101';

  return stds.map((rawS: string, idx: number) => {
    const s = rawS.replace(/\s*\((?:QMS|EMS|OHS|ISMS|품질|환경|안전보건|안전)\)/gi, '').trim();
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
function calculateDDay(dueDateStr: string): { text: string; isUrgent: boolean; isOverdue: boolean } {
  const target = new Date(dueDateStr);
  const now = new Date(2026, 8, 9);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `D+${Math.abs(diffDays)}일 경과`, isUrgent: true, isOverdue: true };
  } else if (diffDays === 0) {
    return { text: 'D-Day (오늘)', isUrgent: true, isOverdue: false };
  } else {
    return { text: `D-${diffDays}일`, isUrgent: diffDays <= 30, isOverdue: false };
  }
}

type BinderTabKey = 'profile' | 'history' | 'ehs';

interface AuditHistoryRecordItem {
  id: string;
  auditDate: string;
  auditType: string;
  leadAuditor: string;
  teamAuditor: string;
  ncCount: { major: number; minor: number; obs: number };
  status: string;
  reportAvailable: boolean;
  certAvailable: boolean;
  planAvailable: boolean;
  hasAttachments: boolean;
  attachments?: AttachmentDocItem[];
}

export const CompanyAuditHistoryModal: React.FC<CompanyAuditHistoryModalProps> = ({
  isOpen,
  onClose,
  company,
  contracts = [],
  auditContracts = [],
  projects = [],
  reports = {},
  allAuditors = [],
  onOpenReport,
  onOpenReportWorkbench,
  onOpenPdfReport,
  onOpenPlanInvoiceModal
}) => {
  // 상단 종이 바인더 탭 상태 (3개 탭 구성)
  const [activeTab, setActiveTab] = useState<BinderTabKey>('profile');
  
  const [isPlanDocOpen, setIsPlanDocOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [selectedAuditForAttachments, setSelectedAuditForAttachments] = useState<AuditHistoryRecordItem | null>(null);

  // 실시간 로컬스토리지 및 심사보고서(인정범위확인서) 변경분 병합 (반드시 모든 Hook은 조건문 이전에 실행)
  const effectiveCompany = useMemo(() => {
    if (!company) return null;
    try {
      const compId = company.id || company.companyName;
      // 1순위: 보고서 팩에서 저장된 SCOPE_CONFIRM
      const packScope = localStorage.getItem(`GMSCS_PACK_FULL_${compId}_SCOPE_CONFIRM`);
      let scopeData: any = {};
      if (packScope) {
        const parsed = JSON.parse(packScope);
        scopeData = {
          scope: parsed.scopeKor,
          scopeEng: parsed.scopeEng,
          companyNameEng: parsed.companyNameEng,
          addressEng: parsed.addressEng,
          scopeUpdatedAt: parsed.updatedAt
        };
      }

      // 2순위: gmscs_company_overrides
      const saved = localStorage.getItem('gmscs_company_overrides');
      const overrides = saved ? JSON.parse(saved) : {};
      const compOverride = overrides[compId] || {};

      return {
        ...company,
        ...compOverride,
        ...scopeData
      };
    } catch (e) {}
    return company;
  }, [company, isOpen]);

  const archivedDocs = useMemo<DriveReportFileItem[]>(() => {
    return effectiveCompany ? getDriveReportsForCompany(effectiveCompany.companyName) : [];
  }, [effectiveCompany]);

  if (!isOpen || !company || !effectiveCompany) return null;

  const contract = contracts.find(c => c.companyId === effectiveCompany.id);
  const matchingProjects = projects.filter(p => p.companyId === effectiveCompany.id || p.companyName === effectiveCompany.companyName);
  const latestProject = matchingProjects[0];
  const matchingAuditContract = auditContracts.find(c => c.companyId === effectiveCompany.id || c.companyName === effectiveCompany.companyName);
  
  const stageText = getAuditStage(effectiveCompany, contract, latestProject);
  const stdAndCerts = getStandardsWithCertNo(effectiveCompany, contract);
  const dueDate = contract?.surveillanceDueDate || contract?.validUntil || latestProject?.endDate || '2026-10-31';
  const dday = calculateDDay(dueDate);

  // 배정 심사원
  const managingAuditor = allAuditors.find(a => a.id === effectiveCompany.managingAuditorId || a.id === latestProject?.leadAuditorId) 
    || allAuditors.find(a => a.name === latestProject?.leadAuditorName) 
    || { name: effectiveCompany.managingAuditorId || '', grade: '심사원', mobile: '', email: '' };

  // Effective AuditContractRecord for document display
  const effectiveContractRecord: AuditContractRecord = matchingAuditContract || {
    id: `CTR-${effectiveCompany.id}`,
    contractNumber: `CTR-${effectiveCompany.bizNumber ? effectiveCompany.bizNumber.replace(/[^0-9]/g, '').substring(0, 6) : ''}`,
    companyId: effectiveCompany.id,
    companyName: effectiveCompany.companyName,
    contractType: (stageText.includes('최초') ? '신규인증' : stageText.includes('갱신') ? '갱신심사' : '정기사후') as any,
    standards: stdAndCerts.map(s => s.std as any),
    employeeCount: effectiveCompany.totalEmployees || 0,
    riskLevel: 'Medium',
    contractDate: contract?.initialCertDate || '',
    plannedAuditStartDate: latestProject?.startDate || '',
    contractStatus: (latestProject?.status === '계획수립' ? '진행중' : '계약체결') as any,
    leadAuditorId: (managingAuditor as any).id || '',
    leadAuditorName: managingAuditor.name || '',
    agency: effectiveCompany.consultant || effectiveCompany.agency || '직영',
    kabStandardMd: 2.0,
    appliedMd: 2.0,
    standardRatePerMd: 800000,
    ratePerMd: 800000,
    standardFee: 1600000,
    finalFee: 2000000,
    docAuditMd: 0.5,
    docAuditFee: 500000,
    onsiteAuditMd: 1.5,
    onsiteAuditFee: 1100000,
    travelExpense: 200000,
    lodgingOption: '업체직접제공',
    lodgingNights: 0,
    lodgingExpense: 0,
    applicationFee: 200000,
    docFee: 500000,
    siteFee: 1100000,
    travelFee: 200000,
    lodgingFee: 0,
    lodgingProvidedByClient: true,
    appFee: 200000,
    approvalStatus: '승인완료',
    isAdjusted: false,
    planInvoiceDispatchStatus: (latestProject?.status === '계획서발송' || latestProject?.status === '심사진행중') ? '발송완료' : '발송대기',
    auditorResponseStatus: latestProject?.status === '심사진행중' ? '동의' : '미응답',
    agencyResponseStatus: latestProject?.status === '심사진행중' ? '동의' : '미응답',
    clientResponseStatus: latestProject?.status === '심사진행중' ? '동의' : '미응답'
  };

  // 과거 심사 완료 이력 대장 데이터 (실제 프로젝트 목록 매핑)
  const auditHistoryRecords: AuditHistoryRecordItem[] = matchingProjects.length > 0 ? matchingProjects.map((p, idx) => ({
    id: p.id || `audit-${idx}`,
    auditDate: p.startDate && p.endDate ? `${p.startDate} ~ ${p.endDate}` : (p.startDate || ''),
    auditType: p.auditType || stageText,
    leadAuditor: p.leadAuditorName || managingAuditor.name || '',
    teamAuditor: (p as any).teamAuditorName || '단독심사',
    ncCount: { major: 0, minor: 0, obs: 0 },
    status: p.status || '계획수립',
    reportAvailable: true,
    certAvailable: true,
    planAvailable: true,
    hasAttachments: false,
    attachments: []
  })) : [
    {
      id: `audit-${effectiveCompany.id}`,
      auditDate: latestProject ? (latestProject.startDate && latestProject.endDate ? `${latestProject.startDate} ~ ${latestProject.endDate}` : latestProject.startDate) : (contract?.initialCertDate || ''),
      auditType: stageText,
      leadAuditor: managingAuditor.name || '',
      teamAuditor: '단독심사',
      ncCount: { major: 0, minor: 0, obs: 0 },
      status: latestProject?.status || (contract ? '인증유지' : '계획수립'),
      reportAvailable: true,
      certAvailable: true,
      planAvailable: true,
      hasAttachments: false,
      attachments: []
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-5 pt-6 sm:pt-10 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-100 rounded-3xl max-w-5xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col h-[86vh] mb-6">
        
        {/* ========================================================================= */}
        {/* 1. 모달 상단 헤더 & 기업 타이틀 */}
        {/* ========================================================================= */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-700 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {company.companyName}
                </h3>
                {company.iafCode && (
                  <span className="text-cyan-800 font-semibold text-[11px] bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    IAF {company.iafCode}
                  </span>
                )}
                {company.bizNumber && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    (사업자번호: {company.bizNumber})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                대표자: {company.ceoName || ''} {company.industry ? `· 업종: ${company.industry}` : ''} {company.address ? `· 본사: ${company.address}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {latestProject && latestProject.status !== '인증발행' ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse shrink-0" />
                <span>현재 심사진행 중 ({latestProject.auditType || stageText})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                <span>인증유지 (유효)</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. 상단 종이 바인더 서류철 인덱스 탭 (3개 탭으로 정돈) */}
        {/* ========================================================================= */}
        <div className="bg-slate-200/90 px-4 pt-2 border-b border-slate-300 grid grid-cols-3 gap-0 shrink-0">
          
          {/* 탭 1: 기업 및 인증 기본 정보 */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-2 text-xs font-bold transition flex items-center justify-center gap-1.5 border-t border-r border-l first:rounded-tl-xl cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-cyan-950 border-slate-300 shadow-xs translate-y-[1px] z-10 font-extrabold'
                : 'bg-slate-200/60 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-300/60'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${activeTab === 'profile' ? 'text-cyan-700' : 'text-slate-500'}`} />
            <span>1. 기업 및 인증 기본 정보</span>
          </button>

          {/* 탭 2: 심사 이력 및 발급 문서 대장 */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-2 text-xs font-bold transition flex items-center justify-center gap-1.5 border-t border-r border-l -ml-[1px] cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-cyan-950 border-slate-300 shadow-xs translate-y-[1px] z-10 font-extrabold'
                : 'bg-slate-200/60 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-300/60'
            }`}
          >
            <CalendarIcon className={`w-3.5 h-3.5 ${activeTab === 'history' ? 'text-cyan-700' : 'text-slate-500'}`} />
            <span>2. 심사 이력 및 발급 문서 대장</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-mono">
              {auditHistoryRecords.length}
            </span>
          </button>

          {/* 탭 3: EHS & 환경·안전 법규 관리 */}
          <button
            type="button"
            onClick={() => setActiveTab('ehs')}
            className={`py-2.5 px-2 text-xs font-bold transition flex items-center justify-center gap-1.5 border-t border-r border-l -ml-[1px] last:rounded-tr-xl cursor-pointer ${
              activeTab === 'ehs'
                ? 'bg-white text-emerald-950 border-slate-300 shadow-xs translate-y-[1px] z-10 font-extrabold'
                : 'bg-slate-200/60 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-300/60'
            }`}
          >
            <Leaf className={`w-3.5 h-3.5 ${activeTab === 'ehs' ? 'text-emerald-700' : 'text-slate-500'}`} />
            <span>3. EHS &amp; 환경·안전 법규 관리</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. 인덱스 탭 내용 영역 (Scrollable Body) */}
        {/* ========================================================================= */}
        <div className="flex-1 bg-white p-6 overflow-y-auto space-y-4 text-slate-800 text-xs">
          
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: [기업 및 인증 기본 정보] - 볼드체 다이어트 적용        */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in">
              
              {/* 1-1. 회사 기본 정보 & 담당자 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                  <Building2 className="w-4 h-4 text-cyan-700" />
                  <span>회사 기본 정보 및 실무 담당자</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">회사명:</span>
                      <span className="text-slate-900 font-medium">{effectiveCompany.companyName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">대표자명:</span>
                      <span className="text-slate-900 font-normal">{cleanCeoName(effectiveCompany.ceoName)} 대표이사</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">사업자등록번호:</span>
                      <span className="font-mono text-slate-800 font-normal">{effectiveCompany.bizNumber || ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">업종 / 주요생산품:</span>
                      <span className="text-slate-800 font-normal">{effectiveCompany.industry || ''}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">실무 담당자:</span>
                      <span className="text-slate-900 font-medium">
                        {cleanPersonName(effectiveCompany.contactPerson)} {effectiveCompany.contactPosition || '담당자'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">담당자 연락처:</span>
                      <span className="font-mono text-slate-800 font-normal">{effectiveCompany.contactPhone || ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">담당자 이메일:</span>
                      <span className="font-mono text-cyan-800 font-normal">{effectiveCompany.contactEmail || ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">대표 사업장 주소:</span>
                      <span className="text-slate-800 font-normal truncate max-w-[240px]">{effectiveCompany.address || ''}</span>
                    </div>
                  </div>
                </div>

                {/* 추가사업장 (Multi-Site) 목록 렌더링 */}
                {effectiveCompany.additionalSites && effectiveCompany.additionalSites.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-700" />
                      <span>등록된 추가사업장 ({effectiveCompany.additionalSites.length}개소)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      {effectiveCompany.additionalSites.map((site: any, sIdx: number) => (
                        <div key={site.id || sIdx} className="p-2 bg-white border border-slate-200 rounded-lg space-y-0.5">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>#{sIdx + 1} {site.siteName}</span>
                            {site.employees && <span className="font-mono text-cyan-800 font-medium">{site.employees}명</span>}
                          </div>
                          <p className="text-slate-600 truncate">{site.address}</p>
                          {site.scope && <p className="text-slate-500 text-[10.5px]">범위: {site.scope}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 1-2. 인증범위 요약 박스 (국문 & 영문) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-700" />
                      <span>공식 인증범위 (Certification Scope)</span>
                    </h4>
                    {(effectiveCompany as any).scopeUpdatedAt && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300">
                        인정범위 확인서 최종 반영됨 ({(effectiveCompany as any).scopeUpdatedAt})
                      </span>
                    )}
                  </div>
                  {effectiveCompany.iafCode && (
                    <span className="text-[11px] text-indigo-900 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      IAF Code: {effectiveCompany.iafCode}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-medium text-slate-600 block mb-0.5">[국문 인증범위]</span>
                    <p className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 font-medium leading-relaxed">
                      {effectiveCompany.scope || ''}
                    </p>
                  </div>
                  {(effectiveCompany as any).scopeEng && (
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block mb-0.5">[영문 인증범위 (English Scope)]</span>
                      <p className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 font-mono text-[11px] font-normal leading-relaxed">
                        {(effectiveCompany as any).scopeEng}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 1-3. 인증원 관리 사항 & 심사 배정 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                  <UserCheck className="w-4 h-4 text-cyan-700" />
                  <span>인증원 관리 사항 및 배정 심사원 현황</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">담당 심사팀장:</span>
                      <span className="text-slate-900 font-medium">{managingAuditor.name ? `${managingAuditor.name} (${managingAuditor.grade || '심사원'})` : '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">심사원 연락처/이메일:</span>
                      <span className="font-mono text-slate-700 text-[11px] font-normal">{managingAuditor.mobile || ''}{managingAuditor.email ? ` / ${managingAuditor.email}` : ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">영업/협력기관 (컨설턴트):</span>
                      <span className="text-slate-800 font-normal">{company.consultant || company.agency || 'GMSCS 본부 직영'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">종업원 수 (M/D 산정기준):</span>
                      <span className="text-slate-800 font-mono font-normal">{company.totalEmployees ? `${company.totalEmployees}명` : '-'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">보유 인증표준 &amp; 인증번호:</span>
                      <div className="text-right">
                        {stdAndCerts.map((sc, i) => (
                          <div key={i} className="text-cyan-950 font-mono text-[11px] font-medium">
                            {sc.std} <span className="text-slate-500 font-normal">({sc.certNo || '발급전'})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">최초 계약일:</span>
                      <span className="font-mono text-slate-800 font-normal">{contract?.initialCertDate || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">최초 인증등록일:</span>
                      <span className="font-mono text-emerald-800 font-medium">{contract?.initialCertDate || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">차기 사후관리 만료일:</span>
                      <span className="font-mono text-amber-900 font-medium">{dueDate ? `${dueDate} (${dday.text})` : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1-4. 인증 전환(Transfer) 및 이전 인증기관 이력 정보 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-cyan-700" />
                    <span>인증 전환(Transfer) 및 이전 인증기관 이력 정보</span>
                  </h4>
                  {effectiveCompany.isTransfer ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 text-[11px] font-bold border border-cyan-300">
                      타 기관 전환 심사 고객 ({effectiveCompany.transferType || '타기관 인증 전환'})
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                      GMSCS 표준 심사 대상 (신규/갱신)
                    </span>
                  )}
                </div>

                {effectiveCompany.isTransfer ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-slate-200/60 pb-1">
                          <span className="text-slate-500 font-normal">이전 인증기관명:</span>
                          <span className="text-cyan-950 font-bold">{effectiveCompany.prevCertificationBody || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-1">
                          <span className="text-slate-500 font-normal">이전 인증서 번호:</span>
                          <span className="font-mono text-slate-800 font-medium">{effectiveCompany.prevCertNumber || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-1">
                          <span className="text-slate-500 font-normal">이전 인증 유효기간:</span>
                          <span className="font-mono text-slate-800">
                            {effectiveCompany.prevCertIssueDate || '-'} ~ {effectiveCompany.prevCertExpiryDate || '-'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-slate-200/60 pb-1">
                          <span className="text-slate-500 font-normal">전환 심사 착수 구분:</span>
                          <span className="text-slate-900 font-medium">{effectiveCompany.transferType || '타기관 인증 전환'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-normal block mb-1">전환 / 대체 사유 및 시작 배경:</span>
                          <p className="p-2 bg-white rounded border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                            {effectiveCompany.transferReason || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {effectiveCompany.prevAuditDetails && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="text-slate-500 font-normal text-[11px] block mb-1">이전 심사 기록 및 부적합(NCR) 조치 사항:</span>
                        <p className="p-2 bg-white rounded border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                          {effectiveCompany.prevAuditDetails}
                        </p>
                      </div>
                    )}

                    {/* 이전 인증서 / 심사보고서 첨부파일 목록 */}
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-600 font-bold text-[11px] block mb-1.5 flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5 text-cyan-700" />
                        <span>이전 심사보고서 및 인증서 사본 첨부문서</span>
                      </span>
                      {effectiveCompany.transferAttachments && effectiveCompany.transferAttachments.length > 0 ? (
                        <div className="space-y-1.5">
                          {effectiveCompany.transferAttachments.map((att: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileCheck2 className="w-4 h-4 text-cyan-700 shrink-0" />
                                <div>
                                  <div className="font-medium text-slate-800 truncate max-w-[320px]">{att.fileName}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{att.fileSize} · {att.uploadedAt}</div>
                                </div>
                              </div>
                              {att.fileData ? (
                                <a
                                  href={att.fileData}
                                  download={att.fileName}
                                  className="flex items-center gap-1 px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded border border-cyan-200 text-[11px] font-medium transition cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>다운로드</span>
                                </a>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">보관완료</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-white rounded border border-dashed border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
                          <span>등록된 이전 심사보고서 첨부파일이 없습니다.</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">첨부문서 없음</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 text-xs leading-relaxed">
                    <p className="flex items-center gap-2 text-slate-700 font-medium mb-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>타 기관 인증 전환 대상이 아닙니다.</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      GMSCS 인증원 최초 1·2단계 신규 심사 또는 정기 갱신/사후관리 심사 절차에 따라 진행되는 고객사입니다. 타 기관에서 이관된 경우 신규 등록 시 '전환 여부'를 체크하여 이전 인증기관 및 심사이력을 첨부 등록할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: [심사 이력 및 발급 문서 대장]                          */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-cyan-700" />
                    <span>완료 및 진행 심사 목록 대장 (DB 전체 보유분)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    해당 기업의 연차별 심사 결과와 발급 문서(보고서, 인증서, 계획서, 부속서류)를 확인합니다.
                  </p>
                </div>
              </div>

              {/* 심사 대장 테이블: Firebase Cloud Storage 보관 문서를 기반으로 연차별 심사 이력 일원화 */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-[180px] whitespace-nowrap">심사일자 (연월)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-[170px] whitespace-nowrap">심사구분 &amp; 규격</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-[130px] whitespace-nowrap">담당 심사원</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-[100px] text-center whitespace-nowrap">부적합 수</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">발급 문서 및 보고서 열람</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-900 bg-white">
                    {(() => {
                      // Firebase Cloud Storage 문서를 심사 차수별로 그룹화
                      const groups: Record<string, {
                        year?: number | string;
                        month?: number | string;
                        auditType: string;
                        standards: string[];
                        auditor: string;
                        reportDoc?: DriveReportFileItem;
                        certDoc?: DriveReportFileItem;
                        planDoc?: DriveReportFileItem;
                        otherDocs: DriveReportFileItem[];
                      }> = {};

                      if (archivedDocs.length > 0) {
                        archivedDocs.forEach((doc) => {
                          const yearVal = doc.year || 2025;
                          const monthVal = doc.month || 10;
                          const aType = doc.auditType || '정기심사';
                          const key = `${yearVal}_${monthVal}_${aType}`;

                          if (!groups[key]) {
                            groups[key] = {
                              year: yearVal,
                              month: monthVal,
                              auditType: aType,
                              standards: doc.standards || [],
                              auditor: doc.auditorName || doc.auditor || managingAuditor.name || '사무국',
                              otherDocs: []
                            };
                          }

                          // 규격 병합
                          if (doc.standards) {
                            doc.standards.forEach(s => {
                              if (!groups[key].standards.includes(s)) {
                                groups[key].standards.push(s);
                              }
                            });
                          }

                          // 문서 유형별 분류
                          if (doc.docType === '심사보고서' || (doc.fileName && (doc.fileName.includes('보고서') || doc.fileName.includes('_re_')))) {
                            if (!groups[key].reportDoc) groups[key].reportDoc = doc;
                          } else if (doc.docType === '인증서' || (doc.fileName && (doc.fileName.includes('인증서') || doc.fileName.includes('cert')))) {
                            if (!groups[key].certDoc) groups[key].certDoc = doc;
                          } else if (doc.docType === '신청/전환자료' || (doc.fileName && (doc.fileName.includes('계획서') || doc.fileName.includes('신청') || doc.fileName.includes('_tr_')))) {
                            if (!groups[key].planDoc) groups[key].planDoc = doc;
                          } else {
                            groups[key].otherDocs.push(doc);
                          }
                        });
                      }

                      const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
                        const gA = groups[a];
                        const gB = groups[b];
                        return (Number(gB.year || 0) * 100 + Number(gB.month || 0)) - (Number(gA.year || 0) * 100 + Number(gA.month || 0));
                      });

                      // 만약 등록된 아카이브가 없으면 기본 최신 프로젝트 1줄 표시
                      if (sortedGroupKeys.length === 0) {
                        return (
                          <tr className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 border-r border-slate-200 align-middle font-mono text-[12px] font-medium text-slate-900">
                              {latestProject?.startDate || dueDate || '2026-06'}
                              <div className="mt-0.5">
                                <span className="text-[10px] text-cyan-800 font-bold font-mono bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                                  {(effectiveContractRecord.appliedMd || 2.0).toFixed(1)} MD
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                              <span className="font-semibold text-cyan-950 block">{stageText}</span>
                              <span className="text-[10px] text-slate-500">{stdAndCerts.map(s => s.std).join(' / ')}</span>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                              <span className="font-medium text-slate-900 block">{managingAuditor.name || '사무국'}</span>
                              <span className="text-[10.5px] text-slate-400">단독심사</span>
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center align-middle text-[11px] font-mono text-slate-400">
                              중 0 · 경 0 · 관 0
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <div className="flex items-center gap-3.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-normal">
                                  기존보고서 없음 (신규 작성 대상)
                                </span>
                                {onOpenReportWorkbench && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenReportWorkbench(effectiveCompany)}
                                    className="text-slate-900 hover:text-black font-medium inline-flex items-center gap-1 hover:underline cursor-pointer text-xs"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                                    <span>심사보고서 작성/등록</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setIsPlanDocOpen(true)}
                                  className="text-slate-900 hover:text-black font-medium inline-flex items-center gap-1 hover:underline cursor-pointer text-xs"
                                >
                                  <FileCheck className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                                  <span>심사계획서</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return sortedGroupKeys.map((k) => {
                        const grp = groups[k];
                        const dateText = `${grp.year}년 ${grp.month ? String(grp.month).padStart(2, '0') + '월' : ''}`;
                        const stdDisplay = grp.standards.length > 0 ? grp.standards.map(s => s.split(':')[0]).join(' · ') : (stdAndCerts.map(s => s.std.split(':')[0]).join(' · ') || 'ISO 9001');

                        return (
                          <tr key={k} className="hover:bg-slate-50 transition">
                            {/* 1. 심사일자 */}
                            <td className="py-2.5 px-3 border-r border-slate-200 align-middle font-mono text-[12px] font-medium text-slate-900 whitespace-nowrap">
                              <div>{dateText}</div>
                              <div className="mt-0.5">
                                <span className="text-[10px] text-cyan-800 font-bold font-mono bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 inline-block">
                                  {grp.auditType.includes('최초') ? '3.0 MD' : '2.0 MD'}
                                </span>
                              </div>
                            </td>

                            {/* 2. 심사구분 & 규격 */}
                            <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                              <span className="font-semibold text-cyan-950 block">{grp.auditType}</span>
                              <span className="text-[11px] text-indigo-800 font-mono font-medium block mt-0.5">
                                {stdDisplay}
                              </span>
                            </td>

                            {/* 3. 담당 심사원 */}
                            <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                              <span className="font-medium text-slate-900 block">{grp.auditor || managingAuditor.name || '사무국'}</span>
                              <span className="text-[10.5px] text-slate-400 font-normal">인증원 공인심사</span>
                            </td>

                            {/* 4. 부적합 수 */}
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center align-middle text-[11px] font-mono text-slate-400">
                              중 0 · 경 0 · 관 0
                            </td>

                            {/* 5. 발급 문서 및 보고서 열람 (Firebase Cloud Storage 실물 PDF 연동) */}
                            <td className="py-2.5 px-3 align-middle">
                              <div className="flex items-center gap-3.5 flex-wrap">
                                
                                {/* 심사보고서 */}
                                {grp.reportDoc ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onOpenPdfReport?.({
                                        title: grp.reportDoc?.fileName || `[심사보고서] ${company.companyName} ${grp.auditType} (${dateText})`,
                                        companyName: company.companyName,
                                        standard: grp.standards[0] || 'ISO 9001:2015',
                                        auditType: grp.auditType,
                                        auditDate: `${grp.year}-${String(grp.month || 1).padStart(2, '0')}-15`,
                                        auditorName: grp.auditor,
                                        pdfUrl: grp.reportDoc?.downloadUrl || grp.reportDoc?.pdfUrl
                                      });
                                    }}
                                    className="text-slate-900 hover:text-black font-medium inline-flex items-center gap-1 hover:underline cursor-pointer text-xs"
                                    title={`공식 심사보고서 열람 (${grp.reportDoc.fileSize})`}
                                  >
                                    <FileText className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                                    <span>심사보고서</span>
                                  </button>
                                ) : (
                                  <span 
                                    className="text-slate-300 font-normal inline-flex items-center gap-1 text-xs cursor-default select-none"
                                    title="보관된 심사보고서 실물 파일 없음"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                    <span>심사보고서</span>
                                  </span>
                                )}

                                {/* 인증서 */}
                                {grp.certDoc ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onOpenPdfReport?.({
                                        title: grp.certDoc?.fileName || `[인증서] ${company.companyName} 공식 인증서 (${grp.standards[0] || ''})`,
                                        companyName: company.companyName,
                                        standard: grp.standards[0] || 'ISO 9001:2015',
                                        auditType: '공식 인증서',
                                        auditDate: `${grp.year}-${String(grp.month || 1).padStart(2, '0')}-15`,
                                        pdfUrl: grp.certDoc?.downloadUrl || grp.certDoc?.pdfUrl
                                      });
                                    }}
                                    className="text-slate-900 hover:text-black font-medium inline-flex items-center gap-1 hover:underline cursor-pointer text-xs"
                                    title={`공식 인증서 PDF 열람 (${grp.certDoc.fileSize})`}
                                  >
                                    <Award className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                                    <span>인증서(국/영문)</span>
                                  </button>
                                ) : (
                                  <span 
                                    className="text-slate-300 font-normal inline-flex items-center gap-1 text-xs cursor-default select-none"
                                    title="보관된 인증서 실물 파일 없음"
                                  >
                                    <Award className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                    <span>인증서</span>
                                  </span>
                                )}

                                {/* 심사계획서 / 전환자료 */}
                                {grp.planDoc ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onOpenPdfReport?.({
                                        title: grp.planDoc?.fileName || `[신청/전환자료] ${company.companyName} ${grp.auditType}`,
                                        companyName: company.companyName,
                                        standard: grp.standards[0] || 'ISO 9001:2015',
                                        auditType: grp.auditType,
                                        auditDate: `${grp.year}-${String(grp.month || 1).padStart(2, '0')}-15`,
                                        pdfUrl: grp.planDoc?.downloadUrl || grp.planDoc?.pdfUrl
                                      });
                                    }}
                                    className="text-slate-900 hover:text-black font-medium inline-flex items-center gap-1 hover:underline cursor-pointer text-xs"
                                    title={`신청/전환/계획서 열람 (${grp.planDoc.fileSize})`}
                                  >
                                    <Paperclip className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                                    <span>전환/부속자료</span>
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded font-mono border border-slate-200">
                                      {grp.planDoc.fileSize}
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setIsPlanDocOpen(true)}
                                    className="text-slate-900 hover:text-black font-medium inline-flex items-center gap-1 hover:underline cursor-pointer text-xs"
                                  >
                                    <FileCheck className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                                    <span>심사계획서</span>
                                  </button>
                                )}

                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: [EHS & 환경·안전 법규 관리]                            */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'ehs' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                  <Leaf className="w-4 h-4 text-emerald-700" />
                  <span>EHS(환경·안전보건) 법규 준수 평가 현황 (ISO 14001 / ISO 45001)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">대기 배출시설 등급:</span>
                      <span className="text-slate-800 font-medium">4종 (집진기 설비 보유)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">폐수 배출시설 등급:</span>
                      <span className="text-slate-800 font-medium">5종 (위탁처리)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">소방 안전관리 등급:</span>
                      <span className="text-slate-800 font-medium">2급 (자체 선임 관리)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">안전보건관리자 선임:</span>
                      <span className="text-emerald-800 font-medium">선임 완료 (안전관리 전문기관 위탁)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">유해화학물질 취급 여부:</span>
                      <span className="text-slate-800 font-medium">취급 없음 (해당없음)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">사업장폐기물 관리:</span>
                      <span className="text-slate-800 font-medium">올바로시스템(Allbaro) 전산 등록 준수</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 심사계획서 & 청구내역서 F16-004 모달 */}
      <AuditPlanInvoiceDocModal
        isOpen={isPlanDocOpen}
        onClose={() => setIsPlanDocOpen(false)}
        company={company}
        contract={effectiveContractRecord}
        auditor={managingAuditor as any}
      />

      {/* 회차별 부속서류철 탭 모달 */}
      {selectedAuditForAttachments && (
        <AuditAttachmentDocModal
          isOpen={isAttachmentModalOpen}
          onClose={() => setIsAttachmentModalOpen(false)}
          company={company}
          auditInfo={{
            auditDate: selectedAuditForAttachments.auditDate,
            auditType: selectedAuditForAttachments.auditType,
            leadAuditor: selectedAuditForAttachments.leadAuditor
          }}
          attachments={selectedAuditForAttachments.attachments || []}
        />
      )}

    </div>
  );
};
