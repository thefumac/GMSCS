import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers, 
  DollarSign, 
  ChevronRight,
  Printer,
  Calendar
} from 'lucide-react';
import { AuditReport, AuditProject, AuditorSettlement } from '../types';

interface AuditReportListProps {
  reports: Record<string, AuditReport>;
  projects: AuditProject[];
  settlements: AuditorSettlement[];
  onSelectReport: (reportId: string) => void;
  onOpenIntegrations: () => void;
}

export const AuditReportList: React.FC<AuditReportListProps> = ({
  reports,
  projects,
  settlements,
  onSelectReport,
  onOpenIntegrations,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [secretariatFilter, setSecretariatFilter] = useState<string>('all');

  const reportList = Object.values(reports);

  const filteredReports = reportList.filter(rep => {
    const matchesSearch = rep.companyName.includes(searchQuery) || 
                          rep.leadAuditor.includes(searchQuery) ||
                          rep.standards.some(s => s.includes(searchQuery));
    const matchesType = filterType === 'all' || rep.auditType === filterType;
    const currentSecretariatStatus = rep.secretariatReviewStatus || '작성중';
    const matchesSecretariat = secretariatFilter === 'all' || currentSecretariatStatus === secretariatFilter;
    return matchesSearch && matchesType && matchesSecretariat;
  });

  const pendingReviewCount = reportList.filter(r => r.secretariatReviewStatus === '검토대기').length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 shadow-2xs">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  심사 보고서 통합 관리 대장
                </h2>
                {pendingReviewCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs animate-pulse">
                    사무국 검토 대기 {pendingReviewCount}건
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                현장 심사 보고서 작성(종료일+7일 마감) &middot; 사무국 사전 적정성 검토 &middot; 심사비 정산 및 <strong>OK ESG 데이터 연동</strong>을 지원합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenIntegrations}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 border border-slate-200 shadow-2xs"
          >
            <Layers className="w-4 h-4 text-cyan-600" />
            <span>OK ESG &amp; ISO-Record 연계</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="기업명, 심사팀장, 규격 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-slate-800 text-xs w-56 focus:outline-none focus:border-cyan-500 focus:bg-white"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:outline-none"
          >
            <option value="all">전체 심사 유형</option>
            <option value="최초 1단계">최초 1단계</option>
            <option value="최초 2단계">최초 2단계</option>
            <option value="사후관리 1차">사후관리 1차</option>
            <option value="사후관리 2차">사후관리 2차</option>
            <option value="갱신심사">갱신심사</option>
          </select>

          {/* 사무국 적정성 검토 필터 */}
          <select
            value={secretariatFilter}
            onChange={(e) => setSecretariatFilter(e.target.value)}
            className={`border rounded-xl px-3 py-1.5 font-bold focus:outline-none transition ${
              secretariatFilter === '검토대기'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : secretariatFilter === '보완요청'
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : secretariatFilter === '검토승인'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="all">사무국 검토 상태 (전체)</option>
            <option value="검토대기">⚠️ 검토대기</option>
            <option value="보완요청">❌ 보완요청 (반려)</option>
            <option value="검토승인">✅ 검토승인 (심의대기)</option>
            <option value="작성중">📝 작성중</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          총 <strong className="text-cyan-700 font-bold">{filteredReports.length}</strong>건의 심사보고서
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">보고서 ID / 기업명</th>
                <th className="p-3.5">심사 유형 / 규격</th>
                <th className="p-3.5">심사 기간 (작성기한)</th>
                <th className="p-3.5">심사팀 (팀장/팀원)</th>
                <th className="p-3.5 text-center">부적합 사항</th>
                <th className="p-3.5">서명 진행상태</th>
                <th className="p-3.5">사무국 적정성 검토</th>
                <th className="p-3.5">건별 심사비 / 심사원 정산</th>
                <th className="p-3.5 text-right">상세 작성 / 서명</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((rep) => {
                const project = projects.find(p => p.reportId === rep.id);
                const settlement = settlements.find(s => s.projectId === project?.id);
                const signedCount = rep.signatures.filter(s => s.isSigned).length;
                const totalSigns = rep.signatures.length;
                const allSigned = totalSigns > 0 && signedCount === totalSigns;

                // 종료일 + 7일 계산
                let deadlineStr = '';
                if (rep.endDate) {
                  try {
                    const end = new Date(rep.endDate);
                    const deadline = new Date(end);
                    deadline.setDate(deadline.getDate() + 7);
                    deadlineStr = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}`;
                  } catch (e) {
                    // ignore
                  }
                }

                const secStatus = rep.secretariatReviewStatus || '작성중';

                return (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <strong className="text-slate-900 text-sm block">{rep.companyName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {rep.id}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-800">{rep.auditType}</span>
                      <div className="text-[11px] text-cyan-800 font-semibold truncate max-w-[150px]">
                        {rep.standards.join(', ')}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      <div>{rep.startDate} ~ {rep.endDate}</div>
                      {deadlineStr && (
                        <div className="text-[10px] text-cyan-700 font-medium mt-0.5">
                          마감: ~{deadlineStr} (+7일)
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-800 block">{rep.leadAuditor}</span>
                      <span className="text-[11px] text-slate-500">{rep.auditTeam.join(', ')}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono">
                        <span className={`px-1.5 py-0.5 rounded ${rep.nonConformityCount.major > 0 ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-500'}`}>
                          중 {rep.nonConformityCount.major}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded ${rep.nonConformityCount.minor > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-500'}`}>
                          경 {rep.nonConformityCount.minor}
                        </span>
                        <span className="text-slate-400">
                          관 {rep.nonConformityCount.observation}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          allSigned
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {allSigned ? '서명완료 (3/3)' : `서명진행 (${signedCount}/${totalSigns})`}
                        </span>
                      </div>
                    </td>
                    {/* 사무국 적정성 검토 상태 */}
                    <td className="p-3.5">
                      {secStatus === '검토대기' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs animate-pulse">
                          <span>⚠️</span> 사무국 검토대기
                        </span>
                      ) : secStatus === '보완요청' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <span>❌</span> 보완요청 (반려)
                        </span>
                      ) : secStatus === '검토승인' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span>✅</span> 검토승인 (심의대기)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                          작성중
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs">
                      {project ? (
                        <div className="space-y-0.5">
                          <div className="font-mono text-slate-800 font-semibold">
                            심사비: ₩{project.finalFee.toLocaleString()}
                          </div>
                          {settlement ? (
                            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 font-mono">
                              <span>수당: ₩{settlement.payoutAmount.toLocaleString()}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                settlement.payoutStatus === '지급완료' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {settlement.payoutStatus}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">정산 산정 대기</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectReport(rep.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-2xs inline-flex items-center gap-1 ${
                          secStatus === '검토대기'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white animate-bounce-subtle'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{secStatus === '검토대기' ? '검토 / 열람' : '보고서 열람 / 작성'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
