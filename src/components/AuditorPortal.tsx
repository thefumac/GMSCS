import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  ShieldAlert, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Briefcase,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Auditor, Company, AuditProject, CertContract, AuditorReassignmentLog } from '../types';

interface AuditorPortalProps {
  currentAuditor: Auditor;
  allAuditors: Auditor[];
  companies: Company[];
  projects: AuditProject[];
  contracts: CertContract[];
  onOpenReport: (reportId: string) => void;
  onNavigateToSettlement: () => void;
  onRequestReassignment: (projectId: string, log: AuditorReassignmentLog) => void;
  onOpenEmailModal: (recipientName: string, recipientEmail: string, templateType: '심사원변경통보' | '심사계획서') => void;
}

export const AuditorPortal: React.FC<AuditorPortalProps> = ({
  currentAuditor,
  allAuditors,
  companies,
  projects,
  contracts,
  onOpenReport,
  onNavigateToSettlement,
  onRequestReassignment,
  onOpenEmailModal,
}) => {
  const [activeSubView, setActiveSubView] = useState<'companies' | 'schedule'>('companies');
  
  // Reassignment Modal State
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<AuditProject | null>(null);
  const [targetAuditorId, setTargetAuditorId] = useState<string>('');
  const [reasonCategory, setReasonCategory] = useState<AuditorReassignmentLog['reasonCategory']>('이해상충(Conflict of Interest)');
  const [reasonDetail, setReasonDetail] = useState<string>('');

  // 내 담당 기업 (managingAuditorId가 나이거나, 내가 심사팀장으로 배정된 프로젝트 기업)
  const myCompanyIds = new Set<string>([
    ...companies.filter(c => c.managingAuditorId === currentAuditor.id).map(c => c.id),
    ...projects.filter(p => p.leadAuditorId === currentAuditor.id).map(p => p.companyId)
  ]);

  const myCompanies = companies.filter(c => myCompanyIds.has(c.id));

  // 내 심사 일정 (내가 심사팀장인 프로젝트)
  const myProjects = projects.filter(p => p.leadAuditorId === currentAuditor.id);

  const handleOpenReassignModal = (proj: AuditProject) => {
    setSelectedProject(proj);
    // 나를 제외한 다른 심사원 중 첫번째를 기본값으로
    const other = allAuditors.find(a => a.id !== currentAuditor.id);
    if (other) setTargetAuditorId(other.id);
    setReasonCategory('이해상충(Conflict of Interest)');
    setReasonDetail('');
    setIsReassignModalOpen(true);
  };

  const handleConfirmReassignment = () => {
    if (!selectedProject) return;
    const targetAuditor = allAuditors.find(a => a.id === targetAuditorId);
    if (!targetAuditor) {
      alert('대체 심사원을 선택해 주십시오.');
      return;
    }

    const newLog: AuditorReassignmentLog = {
      id: `reassign-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      prevAuditorId: currentAuditor.id,
      prevAuditorName: currentAuditor.name,
      newAuditorId: targetAuditor.id,
      newAuditorName: targetAuditor.name,
      reasonCategory,
      reasonDetail: reasonDetail || '이해상충 방지 및 공정성 유지를 위한 심사원 교체',
      processedBy: `${currentAuditor.name} (심사원 직접 신청/사무국 접수)`,
    };

    onRequestReassignment(selectedProject.id, newLog);
    setIsReassignModalOpen(false);

    // 알림 메일 제안
    if (window.confirm('심사원 변경 신청이 완료되었습니다.\n관련 기업 및 사무국에 안내 메일을 발송하시겠습니까?')) {
      const comp = companies.find(c => c.id === selectedProject.companyId);
      onOpenEmailModal(
        comp ? `${comp.companyName} (${comp.contactPerson})` : selectedProject.companyName,
        comp?.contactEmail || 'admin@gmscs.co.kr',
        '심사원변경통보'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Auditor Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-6 rounded-3xl text-white shadow-xl border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-full font-bold text-xs tracking-wider">
              {currentAuditor.grade}
            </span>
            {currentAuditor.isCommitteeMember && (
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full font-bold text-xs tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                인증심의위원 자격 보유 ({currentAuditor.committeeRole || '심의위원'})
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{currentAuditor.name} 전용 심사원 포털</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            담당 고객사의 실시간 인증 만료일과 이전 심사보고서를 확인하고, 심사 일정을 관리할 수 있습니다.
            이해상충 발생 시 담당 심사원 교체 신청이 가능하며, 심사비 정산 및 수익 명세서를 조회할 수 있습니다.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-cyan-200/90 font-mono">
            <span>보유 IAF 코드: {currentAuditor.iafCodes.join(', ')}</span>
            <span>•</span>
            <span>등록 규격: {currentAuditor.registeredStandards.join(', ')}</span>
          </div>
        </div>

        {/* Quick Revenue CTA Button */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[210px] space-y-2.5">
          <div className="text-[11px] text-slate-300 font-medium">관리 고객사 / 배정 프로젝트</div>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            {myCompanies.length}개사 <span className="text-xs text-slate-300 font-normal">/ {myProjects.length}건</span>
          </div>
          <button
            onClick={onNavigateToSettlement}
            className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>심사비 정산 &amp; 수익 확인</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubView('companies')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubView === 'companies'
                ? 'bg-white text-cyan-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-600" />
            <span>나의 관리 업체 인증 현황 &amp; 이전 보고서 ({myCompanies.length})</span>
          </button>
          <button
            onClick={() => setActiveSubView('schedule')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubView === 'schedule'
                ? 'bg-white text-cyan-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-cyan-600" />
            <span>나의 배정 심사 일정 &amp; 변경 ({myProjects.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          기준일: 2026-09-09 (현재 시스템 시간)
        </div>
      </div>

      {/* Sub-View 1: Companies & Previous Reports */}
      {activeSubView === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myCompanies.map((comp) => {
            const contract = contracts.find(c => c.companyId === comp.id);
            const compProjects = projects.filter(p => p.companyId === comp.id);
            const latestProjectWithReport = compProjects.find(p => p.reportId);

            return (
              <div 
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight">{comp.companyName}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{comp.bizNumber}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {comp.clientType}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">대표자 / 업종:</span>
                      <span className="font-medium text-slate-800">{comp.ceoName} 대표 ({comp.industry.substring(0, 14)}...)</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">인증 규격:</span>
                      <span className="font-semibold text-cyan-800">{contract?.standards.join(', ') || 'ISO 9001:2015'}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">차기 사후 예정일:</span>
                      <span className="font-mono font-bold text-amber-700">{contract?.surveillanceDueDate || '2026-10-15'}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">담당자:</span>
                      <span>{comp.contactPerson} ({comp.contactPhone})</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {latestProjectWithReport?.reportId ? (
                    <button
                      onClick={() => onOpenReport(latestProjectWithReport.reportId!)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 border border-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-600" />
                      <span>이전 심사 보고서 열람</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">완료 보고서 대기중</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-View 2: My Schedules & Conflict-of-Interest Change Request */}
      {activeSubView === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              <span>{currentAuditor.name} 배정 심사 프로젝트 및 일정</span>
            </div>
            <div className="text-[11px] text-slate-500">
              이해상충이나 일정 중복 발견 시 <strong className="text-amber-700">[심사원 변경]</strong>을 신청하십시오.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">심사 대상 기업</th>
                  <th className="p-3.5">심사 유형 / 규격</th>
                  <th className="p-3.5">심사 일정</th>
                  <th className="p-3.5">투입 MD</th>
                  <th className="p-3.5">심사진행 상태</th>
                  <th className="p-3.5">비용 승인상태</th>
                  <th className="p-3.5 text-right">이해상충 및 조치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myProjects.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-bold text-slate-900">
                        {p.companyName}
                        {p.reassignmentHistory && p.reassignmentHistory.length > 0 && (
                          <span className="block text-[10px] text-amber-700 font-normal mt-0.5">
                            (심사원 교체 이력 있음)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800">{p.auditType}</span>
                        <div className="text-[11px] text-slate-500">{p.standards.join(', ')}</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {p.startDate} ~ {p.endDate}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-cyan-700">
                        {p.appliedMd} MD
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === '서명완료' || p.status === '인증발행'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : p.status === '심사진행중'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.feeAdjustmentStatus === '승인완료'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : p.feeAdjustmentStatus === '승인대기'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.feeAdjustmentStatus || '표준산정'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {p.reportId && (
                          <button
                            onClick={() => onOpenReport(p.reportId!)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-cyan-600" />
                            <span>보고서</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenReassignModal(p)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          <span>심사원 변경 신청</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reassignment Modal */}
      {isReassignModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">담당 심사원 변경 신청 (이해상충 방지)</h3>
                <p className="text-[11px] text-slate-500">
                  대상 기업: <strong>{selectedProject.companyName}</strong> ({selectedProject.auditType})
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">현재 배정 심사원</label>
                <input
                  type="text"
                  disabled
                  value={currentAuditor.name}
                  className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-300 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">교체/대체 심사원 지정</label>
                <select
                  value={targetAuditorId}
                  onChange={(e) => setTargetAuditorId(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {allAuditors
                    .filter(a => a.id !== currentAuditor.id)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.grade} / IAF: {a.iafCodes.join(', ')})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">변경 사유 구분</label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value as AuditorReassignmentLog['reasonCategory'])}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 font-bold text-amber-900"
                >
                  <option value="이해상충(Conflict of Interest)">이해상충(Conflict of Interest) - 과거 자문/컨설팅 이력</option>
                  <option value="심사일정 중복">심사일정 중복 (타사 심사 일정과 중복)</option>
                  <option value="전문분야(IAF) 불일치">전문분야(IAF 코드) 기술역량 보강 필요</option>
                  <option value="심사원 신병/개인사정">심사원 건강/신병/개인사정</option>
                  <option value="기타">기타 사유</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">세부 사유 기술</label>
                <textarea
                  rows={3}
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="예: 해당 기업의 과거 2개년 품질 시스템 자문을 수행한 이력이 확인되어 공정성 확보를 위해 심사팀장 교체를 신청합니다."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsReassignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmReassignment}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-sm"
              >
                교체 신청 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
