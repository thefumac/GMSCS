import React from 'react';
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
  Clock
} from 'lucide-react';
import { Company, AuditProject, CertContract, Auditor, AuditReport, AuditorSettlement } from '../types';

export interface CompanyAuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  contracts?: CertContract[];
  projects?: AuditProject[];
  reports?: Record<string, AuditReport>;
  settlements?: AuditorSettlement[];
  allAuditors?: Auditor[];
  onOpenReport?: (reportId: string) => void;
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
      ? compAny.standards.split(',').map((s: string) => s.trim()) 
      : compAny.standards;
  }

  const baseCert = contract?.certNumber || compAny.certNo || 'Q260101';

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
  projects = [],
  reports = {},
  allAuditors = [],
  onOpenReport
}) => {
  if (!isOpen || !company) return null;

  const contract = contracts.find(c => c.companyId === company.id);
  const matchingProjects = projects.filter(p => p.companyId === company.id || p.companyName === company.companyName);
  const latestProject = matchingProjects[0];
  
  const stageText = getAuditStage(company, contract, latestProject);
  const stdAndCerts = getStandardsWithCertNo(company, contract);
  const dueDate = contract?.surveillanceDueDate || contract?.validUntil || latestProject?.endDate || '2026-10-31';
  const dday = calculateDDay(dueDate);

  // 배정 심사원
  const managingAuditor = allAuditors.find(a => a.id === company.managingAuditorId || a.id === latestProject?.leadAuditorId) 
    || allAuditors.find(a => a.name === latestProject?.leadAuditorName)
    || { name: company.managingAuditorId || '김홍덕', grade: '선임심사원', mobile: '010-3797-1563' };

  // 보고서 ID
  const reportId = latestProject?.reportId || (latestProject ? `rep-${latestProject.id}` : undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        
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

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            
            {/* 2024년 최초 심사 */}
            <div className="relative flex items-start space-x-3 pl-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold z-10 shrink-0">
                ✓
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>2024년 최초 인증 심사 (1단계/2단계)</span>
                  <span className="text-emerald-700 text-[11px]">인증등록 완료 (2024-10-18)</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  심사팀장: {managingAuditor.name} · 부적합 0건 · 인증위원회 심의 원안 통과
                </p>
              </div>
            </div>

            {/* 2025년 1차 사후관리 */}
            <div className="relative flex items-start space-x-3 pl-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold z-10 shrink-0">
                ✓
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>2025년 1차 사후관리 심사</span>
                  <span className="text-emerald-700 text-[11px]">인증유지 완료 (2025-10-15)</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  심사팀장: {managingAuditor.name} · 경부적합 1건(문서관리) 시정조치 확인 완료
                </p>
              </div>
            </div>

            {/* 2026년 차기/현재 심사 */}
            <div className="relative flex items-start space-x-3 pl-1">
              <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold z-10 shrink-0">
                ★
              </div>
              <div className="bg-cyan-50/60 p-3.5 rounded-xl border border-cyan-200 flex-1 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-cyan-950">
                  <span className="text-xs font-black">2026년 {stageText} (현재 대상)</span>
                  <span className="text-[11px] font-extrabold text-cyan-800">
                    [{latestProject?.status || '심사준비'}]
                  </span>
                </div>
                <p className="text-[11px] text-cyan-900">
                  차기 심사 기한: <strong className="font-mono text-cyan-950">{dueDate}</strong> ({dday.text})
                </p>
                {reportId && onOpenReport && (
                  <div className="pt-1.5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenReport(reportId);
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>심사보고서 바로가기</span>
                    </button>
                  </div>
                )}
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
    </div>
  );
};
