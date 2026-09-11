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
  AlertCircle
} from 'lucide-react';
import { Company, AuditProject, CertContract, Auditor, AuditReport, AuditorSettlement, AuditContractRecord, CertChangeApplicationData, WeekendAuditReasonData } from '../types';
import { isConflictOfInterest, getAgencyDisplayName } from '../utils/conflictUtils';
import { AuditPlanInvoiceDocModal } from './AuditPlanInvoiceDocModal';
import { CertChangeApplicationModal } from './CertChangeApplicationModal';
import { WeekendAuditReasonModal } from './WeekendAuditReasonModal';

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
  onOpenPdfReport,
  onOpenPlanInvoiceModal
}) => {
  const [isPlanDocOpen, setIsPlanDocOpen] = useState(false);
  const [isCertChangeOpen, setIsCertChangeOpen] = useState(false);
  const [isWeekendOpen, setIsWeekendOpen] = useState(false);
  const [certChangeData, setCertChangeData] = useState<CertChangeApplicationData | undefined>(undefined);
  const [weekendData, setWeekendData] = useState<WeekendAuditReasonData | undefined>(undefined);

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

  // 보고서 ID
  const reportId = latestProject?.reportId || (latestProject ? `rep-${latestProject.id}` : undefined);

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
    agency: company.consultant || '직영',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  {company.companyName}
                </h3>
                <span className="text-cyan-800 font-bold text-[11px]">
                  [IAF {company.iafCode || '14'}]
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                대표자: {company.ceoName} · 사업자번호: {company.bizNumber || '214-88-92810'} · 업종: {company.industry || '제조업'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 0. 심사 업무 통합 실행 바 (계획서·청구서·서식 확인, 심사보고서 작성/열람) */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-4 rounded-2xl shadow-md border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                현재 심사 단계: {stageText}
              </span>
              <span className="text-slate-300 text-xs font-mono">
                차기 예정일: {dueDate} <strong className="text-cyan-400 font-bold">({dday.text})</strong>
              </span>
            </div>
            <h4 className="text-sm font-black text-white mt-1.5 flex items-center gap-1.5">
              <span>{company.companyName}</span>
              <span className="text-xs text-slate-400 font-normal">심사·보고서·계획 통합 관리</span>
            </h4>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {/* Remark 공식 심사계획서 / 심사비청구서 (F16-004) 모달 버튼 */}
            <button
              type="button"
              onClick={() => setIsPlanDocOpen(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="사무국 수립 심사계획서 및 심사비 청구서 (F16-004) 확인"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>계획·청구서·계약서</span>
            </button>

            {/* F19-002 인증변경신청서 버튼 */}
            <button
              type="button"
              onClick={() => setIsCertChangeOpen(true)}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="F19-002 인증변경신청서 작성 및 열람 (상호/주소/대표/생산품목 변경)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>인증변경(F19-002)</span>
            </button>

            {/* 휴일근무확인서 버튼 */}
            <button
              type="button"
              onClick={() => setIsWeekendOpen(true)}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="휴일(토/일) 및 야간 심사 사유 확인서 열람/작성"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>휴일근무확인서</span>
            </button>

            {onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReport(reportId || 'rep-1');
                }}
                className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-500/30 cursor-pointer"
                title="심사보고서 작성 및 체크리스트 입력 / 열람"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                <span>심사보고서</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. 기업 및 인증 기본 현황 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {/* 인증 표준 및 인증번호 */}
          <div>
            <span className="text-[11px] text-slate-500 font-bold block flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>보유 인증표준 &amp; 인증번호</span>
            </span>
            <div className="mt-1 space-y-1">
              {stdAndCerts.map((sc, i) => (
                <div key={i} className="text-slate-900 font-medium">
                  <strong className="text-cyan-950 font-bold">{sc.std}</strong>
                  <span className="text-slate-500 font-mono text-[11px] ml-1.5">({sc.certNo})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 담당 심사팀장 정보 */}
          <div>
            <span className="text-[11px] text-slate-500 font-bold block flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>배정 심사팀장</span>
            </span>
            <div className="mt-1 font-bold text-slate-900 text-xs">
              {managingAuditor.name} ({managingAuditor.grade || '선임심사원'})
              <span className="text-slate-500 font-mono text-[11px] font-normal block mt-0.5">
                연락처: {managingAuditor.mobile || '010-3797-1563'}
              </span>
            </div>
          </div>

          {/* 담당자 및 사업장 주소 */}
          <div>
            <span className="text-[11px] text-slate-500 font-bold block flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>고객사 품질/인증 담당자</span>
            </span>
            <div className="mt-1 font-medium text-slate-800">
              {company.contactPerson || '인증담당'} ({company.contactPhone || company.contactEmail || '연락처 등록대기'})
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-bold block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>사업장 본사 주소</span>
            </span>
            <div className="mt-1 font-medium text-slate-800 truncate">
              {company.address || '주소 정보 없음'}
            </div>
          </div>
        </div>

                  {/* 3. 영업 유치 / 협력기관 */}
          {(() => {
            const compAny = company as any;
            const consultantName = company.consultant || compAny.consultant;
            const isConflict = isConflictOfInterest(consultantName, managingAuditor.name);
            const agencyDisplayName = getAgencyDisplayName(consultantName, managingAuditor.name);

            return (
              <div className={`p-3 rounded-xl border ${isConflict ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/70 border-amber-200/80'}`}>
                <div className={`text-[11px] flex items-center justify-between ${isConflict ? 'text-slate-600 font-normal' : 'text-amber-900 font-bold'}`}>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className={`w-3.5 h-3.5 ${isConflict ? 'text-slate-400' : 'text-amber-600'}`} />
                    <span>협력기관 / 영업 유치</span>
                  </span>
                  {isConflict && (
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 font-normal rounded-full">
                      이해충돌 방지 (N/A)
                    </span>
                  )}
                </div>
                <div className="mt-1 text-slate-900 text-xs flex items-center justify-between">
                  <span className="text-sm text-slate-900 font-normal">
                    {isConflict ? (
                      <span className="text-slate-400 font-mono">— (N/A)</span>
                    ) : (
                      <span>{agencyDisplayName}</span>
                    )}
                  </span>
                  {!isConflict && (
                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 font-normal rounded-full border border-amber-300">
                      {company.salesType || '협력기관'}
                    </span>
                  )}
                </div>
                {isConflict ? (
                  <p className="text-[10.5px] text-slate-500 font-normal mt-1">
                    ⚠️ 담당 심사원과 협력기관/유치자가 동일인이므로 심사 공정성 및 이해충돌 방지 규정에 따라 협력기관이 미표기(N/A)됩니다.
                  </p>
                ) : (
                  <p className="text-[10.5px] text-amber-800 font-normal mt-1">
                    💼 심사비 입금 시 컨설팅/영업수수료 지급 및 정산 대상자입니다.
                  </p>
                )}
              </div>
            );
          })()}

        {/* 2. 전체 심사 이력 및 경과 타임라인 */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-cyan-600" />
              <span>심사 이력 및 연차별 진행 경과</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-500">
              최초등록일: {contract?.initialCertDate || '2024-10-18'}
            </span>
          </div>

          <div className="space-y-2.5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            
            {/* 2024년 최초 심사 */}
            <div 
              onClick={() => {
                onClose();
                if (onOpenPdfReport) {
                  onOpenPdfReport({
                    title: `[과거보고서] 2024년 최초 인증 심사보고서`,
                    companyName: company.companyName,
                    standard: stdAndCerts[0]?.std || 'ISO 9001:2015',
                    auditType: '최초 인증심사 (1단계/2단계)',
                    auditDate: contract?.initialCertDate || '2024-10-18'
                  });
                } else if (onOpenReport) {
                  onOpenReport(reportId || 'rep-1');
                }
              }}
              className="relative flex items-start space-x-3 pl-1 group cursor-pointer"
              title="클릭 시 2024년 최초 인증 심사보고서(PDF)를 확인합니다."
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold z-10 shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                ✓
              </div>
              <div className="bg-slate-50 group-hover:bg-cyan-50/50 p-3 rounded-xl border border-slate-200 group-hover:border-cyan-300 flex-1 transition shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="text-xs group-hover:text-cyan-900 flex items-center gap-1.5">
                    <span>2024년 최초 인증 심사 (1단계/2단계)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 text-[11px] font-bold">인증등록 완료 ({contract?.initialCertDate || '2024-10-18'})</span>
                    <span className="text-[11px] font-bold text-cyan-700 bg-cyan-100 group-hover:bg-cyan-600 group-hover:text-white px-2 py-0.5 rounded-md transition flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>PDF 보고서 열람</span>
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  심사팀장: {managingAuditor.name} (영업/컨설턴트: {company.consultant || '사무국직접'}) · 부적합 0건 · 인증위원회 심의 원안 통과
                </p>
              </div>
            </div>

            {/* 2025년 1차 사후관리 */}
            <div 
              onClick={() => {
                onClose();
                if (onOpenPdfReport) {
                  onOpenPdfReport({
                    title: `[과거보고서] 2025년 1차 사후관리 심사보고서`,
                    companyName: company.companyName,
                    standard: stdAndCerts[0]?.std || 'ISO 9001:2015',
                    auditType: '1차 사후관리 심사',
                    auditDate: '2025-10-15'
                  });
                } else if (onOpenReport) {
                  onOpenReport(reportId || 'rep-1');
                }
              }}
              className="relative flex items-start space-x-3 pl-1 group cursor-pointer"
              title="클릭 시 2025년 1차 사후관리 심사보고서(PDF)를 확인합니다."
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold z-10 shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                ✓
              </div>
              <div className="bg-slate-50 group-hover:bg-cyan-50/50 p-3 rounded-xl border border-slate-200 group-hover:border-cyan-300 flex-1 transition shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="text-xs group-hover:text-cyan-900 flex items-center gap-1.5">
                    <span>2025년 1차 사후관리 심사</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 text-[11px] font-bold">인증유지 완료 (2025-10-15)</span>
                    <span className="text-[11px] font-bold text-cyan-700 bg-cyan-100 group-hover:bg-cyan-600 group-hover:text-white px-2 py-0.5 rounded-md transition flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>PDF 보고서 열람</span>
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  심사팀장: {managingAuditor.name} · 경부적합 1건(문서관리) 시정조치 확인 완료
                </p>
              </div>
            </div>


            {/* 2026년 차기/현재 심사 */}
            <div 
              onClick={() => {
                onClose();
                if (onOpenReport) onOpenReport(reportId || 'rep-1');
              }}
              className="relative flex items-start space-x-3 pl-1 group cursor-pointer"
              title="클릭 시 2026년 심사보고서 작성 및 열람 화면으로 이동합니다."
            >
              <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold z-10 shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                ★
              </div>
              <div className="bg-cyan-50/70 group-hover:bg-cyan-100/60 p-3.5 rounded-xl border border-cyan-200 group-hover:border-cyan-400 flex-1 space-y-2 transition shadow-2xs">
                <div className="flex items-center justify-between font-bold text-cyan-950">
                  <span className="text-xs font-black">2026년 {stageText} (현재 대상)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-cyan-900 bg-cyan-100 px-2 py-0.5 rounded border border-cyan-200">
                      [{latestProject?.status || '심사진행중'}]
                    </span>
                    <span className="text-xs font-bold text-white bg-cyan-600 group-hover:bg-cyan-700 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-xs">
                      <FileText className="w-3.5 h-3.5" />
                      <span>심사보고서 작성/열람</span>
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-cyan-900">
                  차기 심사 기한: <strong className="font-mono text-cyan-950">{dueDate}</strong> ({dday.text}) · 배정팀장: <strong>{managingAuditor.name}</strong>
                </p>

                {/* 3자 공문 발송 및 회신 확인 현황 바 */}
                <div className="bg-white/80 p-2.5 rounded-lg border border-cyan-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-slate-700">심사계획·청구서(F16-004):</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10.5px] ${
                      effectiveContractRecord.planInvoiceDispatchStatus === '발송완료'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {effectiveContractRecord.planInvoiceDispatchStatus || '발송대기'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">심사원 회신:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        effectiveContractRecord.auditorResponseStatus === '동의' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {effectiveContractRecord.auditorResponseStatus || '동의'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">협력기관 회신:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        effectiveContractRecord.agencyResponseStatus === '동의' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {effectiveContractRecord.agencyResponseStatus || '동의 (사전확정)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">기업 회신:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        effectiveContractRecord.clientResponseStatus === '동의' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {effectiveContractRecord.clientResponseStatus || '확인수신'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. 구글 드라이브 과거 심사보고서 보관소 안내 */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 flex items-start gap-2">
          <Folder className="w-4 h-4 text-cyan-700 mt-0.5 shrink-0" />
          <div className="space-y-0.5 text-[11px]">
            <div className="font-bold text-slate-800">과거 심사보고서 &amp; 공인 인증서 저장소 (구글 드라이브 연동)</div>
            <div className="font-mono text-slate-600">
              G:\내 드라이브\GMSCS_과거심사보고서\{company.companyName}\
            </div>
          </div>
        </div>

        {/* 모달 푸터 버튼 */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer text-xs"
          >
            닫기
          </button>
        </div>

      </div>

      {/* Remark 공식 심사계획서 및 심사비청구서 (F16-004) 모달 */}
      <AuditPlanInvoiceDocModal
        isOpen={isPlanDocOpen}
        onClose={() => setIsPlanDocOpen(false)}
        contract={effectiveContractRecord}
        company={company}
        auditor={managingAuditor as any}
      />

      {/* F19-002 인증변경신청서 모달 */}
      <CertChangeApplicationModal
        isOpen={isCertChangeOpen}
        onClose={() => setIsCertChangeOpen(false)}
        company={company}
        standards={stdAndCerts.map(s => s.std)}
        initialData={certChangeData}
        onSaveData={(data) => {
          setCertChangeData(data);
          alert('[F19-002 인증변경신청서 저장 완료]\n상호/주소/대표자 및 생산품목 변경사항이 시스템에 저장되었습니다.');
        }}
      />

      {/* 휴일근무확인서 모달 */}
      <WeekendAuditReasonModal
        isOpen={isWeekendOpen}
        onClose={() => setIsWeekendOpen(false)}
        companyName={company.companyName}
        auditDates={latestProject?.startDate ? `${latestProject.startDate} ~ ${latestProject.endDate}` : '2026-10-24 ~ 2026-10-25'}
        standards={stdAndCerts.map(s => s.std)}
        auditorName={managingAuditor.name}
        initialData={weekendData}
        onSaveData={(data) => {
          setWeekendData(data);
          alert('[휴일근무확인서 저장 완료]\n주말(토/일) 및 야간 심사 사유가 정상 등록되었습니다.');
        }}
      />
    </div>
  );
};
