import React, { useState } from 'react';
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
  Paperclip
} from 'lucide-react';
import { Company, AuditProject, CertContract, Auditor, AuditReport, AuditorSettlement, AuditContractRecord } from '../types';
import { isConflictOfInterest, getAgencyDisplayName } from '../utils/conflictUtils';
import { AuditPlanInvoiceDocModal } from './AuditPlanInvoiceDocModal';
import { AuditAttachmentDocModal, AttachmentDocItem } from './AuditAttachmentDocModal';

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
  onOpenPdfReport?: (info: { title: string; companyName: string; standard?: string; auditType?: string; auditDate?: string; pdfUrl?: string }) => void;
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

  if (!isOpen || !company) return null;

  const contract = contracts.find(c => c.companyId === company.id);
  const matchingProjects = projects.filter(p => p.companyId === company.id || p.companyName === company.companyName);
  const latestProject = matchingProjects[0];
  const matchingAuditContract = auditContracts.find(c => c.companyId === company.id || c.companyName === company.companyName);
  
  const stageText = getAuditStage(company, contract, latestProject);
  const stdAndCerts = getStandardsWithCertNo(company, contract);
  const dueDate = contract?.surveillanceDueDate || contract?.validUntil || latestProject?.endDate || '2026-10-31';
  const dday = calculateDDay(dueDate);

  // 배정 심사원
  const managingAuditor = allAuditors.find(a => a.id === company.managingAuditorId || a.id === latestProject?.leadAuditorId) 
    || allAuditors.find(a => a.name === latestProject?.leadAuditorName)
    || { name: company.managingAuditorId || '김홍덕', grade: '선임심사원', mobile: '010-3797-1563', email: 'auditor@gmscs.co.kr' };

  // Effective AuditContractRecord for document display
  const effectiveContractRecord: AuditContractRecord = matchingAuditContract || {
    id: `CTR-${company.id}`,
    contractNumber: `CTR-${company.bizNumber ? company.bizNumber.replace(/[^0-9]/g, '').substring(0, 6) : '202601'}`,
    companyId: company.id,
    companyName: company.companyName,
    contractType: (stageText.includes('최초') ? '신규인증' : stageText.includes('갱신') ? '갱신심사' : '정기사후') as any,
    standards: stdAndCerts.map(s => s.std as any),
    employeeCount: company.totalEmployees || 48,
    riskLevel: 'Medium',
    contractDate: contract?.initialCertDate || '2026-09-10',
    plannedAuditStartDate: latestProject?.startDate || '2026-10-24',
    contractStatus: (latestProject?.status === '계획수립' ? '진행중' : '계약체결') as any,
    leadAuditorId: (managingAuditor as any).id || 'AUD-001',
    leadAuditorName: managingAuditor.name || '김홍덕',
    agency: company.consultant || company.agency || '직영',
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

  // 과거 심사 완료 이력 대장 데이터 (각 심사별 부속서류 유무 및 탭 데이터 연동)
  const auditHistoryRecords: AuditHistoryRecordItem[] = [
    {
      id: 'audit-2026',
      auditDate: latestProject ? `${latestProject.startDate} ~ ${latestProject.endDate}` : '2026-10-24 ~ 2026-10-25',
      auditType: stageText,
      leadAuditor: managingAuditor.name,
      teamAuditor: '신현섭 심사원',
      ncCount: { major: 0, minor: 0, obs: 1 },
      status: latestProject?.status || '계획수립',
      reportAvailable: true,
      certAvailable: true,
      planAvailable: true,
      hasAttachments: true,
      attachments: [
        {
          id: 'att-2026-1',
          docType: 'F19-002 인증변경신청서',
          title: '인증변경신청서',
          date: '2026-09-08',
          summary: '제2공장 주조라인 증설에 따른 인증범위 및 사업장 추가 신청',
          status: '사무국 승인완료',
          fileLinkType: 'f19-002'
        },
        {
          id: 'att-2026-2',
          docType: 'F19-003 휴일(주말) 심사 사유서',
          title: '휴일심사사유서',
          date: '2026-09-08',
          summary: '주말(토) 정상 가동에 따른 현장 심사 수행 (기업 원클릭 승인)',
          status: '접수 및 확인완료',
          fileLinkType: 'f19-003'
        }
      ]
    },
    {
      id: 'audit-2025',
      auditDate: '2025-10-14 ~ 2025-10-15',
      auditType: '1차 사후관리심사',
      leadAuditor: managingAuditor.name,
      teamAuditor: '김홍덕 선임심사원',
      ncCount: { major: 0, minor: 1, obs: 2 },
      status: '인증유지완료',
      reportAvailable: true,
      certAvailable: true,
      planAvailable: true,
      hasAttachments: true,
      attachments: [
        {
          id: 'att-2025-1',
          docType: '사업자등록증명원 / 공장등록증',
          title: '사업자/공장등록증',
          date: '2025-10-10',
          summary: '대표자 변경 및 사업장 주소 이전 확인 증빙 서류',
          status: '보관완료',
          fileLinkType: 'biz-cert'
        }
      ]
    },
    {
      id: 'audit-2024',
      auditDate: contract?.initialCertDate ? `${contract.initialCertDate} ~ 2024-10-19` : '2024-10-18 ~ 2024-10-19',
      auditType: '최초 인증심사 (1·2단계)',
      leadAuditor: managingAuditor.name,
      teamAuditor: '단독심사',
      ncCount: { major: 0, minor: 0, obs: 0 },
      status: '최초등록완료',
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
                <span className="text-cyan-800 font-semibold text-[11px] bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  IAF {company.iafCode || '14'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  (사업자번호: {company.bizNumber || '214-88-92810'})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                대표자: {company.ceoName} · 업종: {company.industry || '제조업'} · 본사: {company.address}
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
                      <span className="text-slate-900 font-medium">{company.companyName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">대표자명:</span>
                      <span className="text-slate-900 font-normal">{company.ceoName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">사업자등록번호:</span>
                      <span className="font-mono text-slate-800 font-normal">{company.bizNumber || '214-88-92810'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">업종 / 주요생산품:</span>
                      <span className="text-slate-800 font-normal">{company.industry || '자동차 및 선박용 주조물 제조'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">실무 담당자:</span>
                      <span className="text-slate-900 font-medium">{company.contactPerson || '정순호 이사'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">담당자 연락처:</span>
                      <span className="font-mono text-slate-800 font-normal">{company.contactPhone || '054-955-9197'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">담당자 이메일:</span>
                      <span className="font-mono text-cyan-800 font-normal">{company.contactEmail || 'quality@kwonmetal.co.kr'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">소재지 주소:</span>
                      <span className="text-slate-800 font-normal truncate max-w-[240px]">{company.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1-2. 인증범위 요약 박스 (국문 & 영문) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-700" />
                    <span>공식 인증범위 (Certification Scope)</span>
                  </h4>
                  <span className="text-[11px] text-indigo-900 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    IAF Code: {company.iafCode || '17'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-medium text-slate-600 block mb-0.5">[국문 인증범위]</span>
                    <p className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 font-normal leading-relaxed">
                      {company.scope || '자동차 및 선박기계, 공작기계, 건설기계, 일반산업기계용 주조물 제작'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-600 block mb-0.5">[영문 인증범위 (English Scope)]</span>
                    <p className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 font-mono text-[11px] font-normal leading-relaxed">
                      Manufacture of Castings for Automobile, Marine, Machine Tools, Construction Machinery and General Industrial Machinery.
                    </p>
                  </div>
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
                      <span className="text-slate-900 font-medium">{managingAuditor.name} ({managingAuditor.grade || '선임심사원'})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">심사원 연락처/이메일:</span>
                      <span className="font-mono text-slate-700 text-[11px] font-normal">{managingAuditor.mobile || '010-3797-1563'} / {managingAuditor.email || 'auditor@gmscs.co.kr'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">영업/협력기관 (컨설턴트):</span>
                      <span className="text-slate-800 font-normal">{company.consultant || company.agency || 'GMSCS 본부 직영'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">종업원 수 (M/D 산정기준):</span>
                      <span className="text-slate-800 font-mono font-normal">{company.totalEmployees || 48}명 (정규직 {Math.max(1, (company.totalEmployees || 48) - 3)}명)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">보유 인증표준 &amp; 인증번호:</span>
                      <div className="text-right">
                        {stdAndCerts.map((sc, i) => (
                          <div key={i} className="text-cyan-950 font-mono text-[11px] font-medium">
                            {sc.std} <span className="text-slate-500 font-normal">({sc.certNo})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">최초 계약일:</span>
                      <span className="font-mono text-slate-800 font-normal">{contract?.initialCertDate || '2024-10-18'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">최초 인증등록일:</span>
                      <span className="font-mono text-emerald-800 font-medium">{contract?.initialCertDate || '2024-10-18'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-normal">차기 사후관리 만료일:</span>
                      <span className="font-mono text-amber-900 font-medium">{dueDate} ({dday.text})</span>
                    </div>
                  </div>
                </div>
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

              {/* 심사 대장 테이블: 내용 비례 너비 최적화 및 2줄 정돈된 균형미 확보 */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-[210px] whitespace-nowrap">심사일자 (MD)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-[180px] whitespace-nowrap">심사구분</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-[140px] whitespace-nowrap">담당 심사원</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-[110px] text-center whitespace-nowrap">부적합 수</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">발급 문서 및 보고서 열람</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-900 bg-white">
                    {auditHistoryRecords.map((rec) => {
                      const mdValue = rec.id.includes('2026') ? (effectiveContractRecord.appliedMd || 2.0) : 2.0;

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50 transition">
                          
                          {/* 1. 심사일자 & MD: 깔끔한 2줄(또는 1줄) 정돈 */}
                          <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                            <div className="font-mono text-[12px] font-medium text-slate-900 whitespace-nowrap">
                              {rec.auditDate}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1">
                              <span className="text-[10.5px] text-cyan-800 font-bold font-mono bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 inline-block">
                                {mdValue.toFixed(1)} MD
                              </span>
                            </div>
                          </td>

                          {/* 2. 심사구분 */}
                          <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                            <span className="font-semibold text-cyan-950 block">{rec.auditType}</span>
                            <span className="text-[10.5px] text-emerald-700 font-normal">({rec.status})</span>
                          </td>

                          {/* 3. 담당 심사원 */}
                          <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                            <span className="font-medium text-slate-900 block">{rec.leadAuditor} (팀장)</span>
                            <span className="text-[11px] text-slate-500 font-normal">{rec.teamAuditor}</span>
                          </td>

                          {/* 4. 부적합 수 */}
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center align-middle">
                            <div className="flex items-center justify-center gap-1 text-[11px] font-mono">
                              <span className={`px-1.5 py-0.5 rounded font-medium ${rec.ncCount.major > 0 ? 'bg-rose-100 text-rose-800' : 'text-slate-400'}`}>
                                중 {rec.ncCount.major}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded font-medium ${rec.ncCount.minor > 0 ? 'bg-amber-100 text-amber-800' : 'text-slate-400'}`}>
                                경 {rec.ncCount.minor}
                              </span>
                              <span className="text-slate-500 font-normal">
                                관 {rec.ncCount.obs}
                              </span>
                            </div>
                          </td>

                          {/* 5. 발급 문서 및 보고서 열람 */}
                          <td className="py-2.5 px-3 align-middle">
                            <div className="flex items-center gap-3.5 flex-wrap">
                              
                              {/* 심사보고서 링크 */}
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenPdfReport?.({
                                    title: `[심사보고서] ${rec.auditType} (${rec.auditDate})`,
                                    companyName: company.companyName,
                                    standard: stdAndCerts[0]?.std || 'ISO 9001:2015',
                                    auditType: rec.auditType,
                                    auditDate: rec.auditDate
                                  });
                                }}
                                className="text-cyan-800 hover:text-cyan-950 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer group"
                                title="공식 심사보고서 PDF 열람"
                              >
                                <FileText className="w-3.5 h-3.5 text-cyan-800 group-hover:scale-110 transition-transform" />
                                <span>심사보고서</span>
                              </button>

                              {/* 인증서 링크 */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (onOpenPdfReport) {
                                    onOpenPdfReport({
                                      title: `[인증서] ${company.companyName} 공식 인증서 (${stdAndCerts[0]?.std})`,
                                      companyName: company.companyName,
                                      standard: stdAndCerts[0]?.std || 'ISO 9001:2015',
                                      auditType: '인증서 발급본',
                                      auditDate: rec.auditDate
                                    });
                                  }
                                }}
                                className="text-indigo-800 hover:text-indigo-950 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer group"
                                title="공식 인증서 PDF 열람"
                              >
                                <Award className="w-3.5 h-3.5 text-indigo-800 group-hover:scale-110 transition-transform" />
                                <span>인증서(국/영문)</span>
                              </button>

                              {/* 심사계획서 링크 */}
                              <button
                                type="button"
                                onClick={() => setIsPlanDocOpen(true)}
                                className="text-slate-700 hover:text-slate-950 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer group"
                                title="F16-004 심사계획서 &amp; 청구서 열람"
                              >
                                <FileCheck className="w-3.5 h-3.5 text-slate-700 group-hover:scale-110 transition-transform" />
                                <span>심사계획서</span>
                              </button>

                              {/* 부속서류 링크 - 서류가 있는 경우 진하게 & 탭 팝업 열기, 없는 경우 흐리게 표시 */}
                              {rec.hasAttachments && rec.attachments && rec.attachments.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAuditForAttachments(rec);
                                    setIsAttachmentModalOpen(true);
                                  }}
                                  className="text-purple-800 hover:text-purple-950 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer group"
                                  title={`${rec.auditType} 부속서류 (${rec.attachments.length}건) 열람`}
                                >
                                  <Paperclip className="w-3.5 h-3.5 text-purple-700 group-hover:scale-110 transition-transform" />
                                  <span>부속서류</span>
                                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1 py-0.2 rounded-full font-mono font-bold">
                                    {rec.attachments.length}
                                  </span>
                                </button>
                              ) : (
                                <span 
                                  className="text-slate-300 font-normal inline-flex items-center gap-1 cursor-default select-none"
                                  title="등록된 부속서류 없음"
                                >
                                  <Paperclip className="w-3.5 h-3.5 text-slate-300" />
                                  <span>부속서류</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
