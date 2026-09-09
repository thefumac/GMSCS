import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Users, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  FileCheck,
  Check,
  Printer
} from 'lucide-react';
import { 
  CommitteeMeeting, 
  CommitteeAgenda, 
  CommitteeDecision, 
  Auditor, 
  AuditProject 
} from '../types';

interface CommitteeManagerProps {
  meetings: CommitteeMeeting[];
  auditors: Auditor[];
  projects: AuditProject[];
  currentUserAuditor?: Auditor | null;
  onApproveAgenda: (meetingId: string, agendaId: string, decision: CommitteeDecision, note: string) => void;
  onOpenReport?: (reportId: string) => void;
}

export const CommitteeManager: React.FC<CommitteeManagerProps> = ({
  meetings: initialMeetings,
  auditors,
  projects,
  currentUserAuditor,
  onApproveAgenda,
  onOpenReport,
}) => {
  const [meetings, setMeetings] = useState<CommitteeMeeting[]>(initialMeetings);
  const [activeMeetingId, setActiveMeetingId] = useState<string>(initialMeetings[0]?.id || 'comm-2026-04');
  
  // Selected Agenda for Review
  const [selectedAgenda, setSelectedAgenda] = useState<CommitteeAgenda | null>(null);
  const [deliberationDecision, setDeliberationDecision] = useState<CommitteeDecision>('인증등록승인');
  const [deliberationNote, setDeliberationNote] = useState<string>('');
  
  // Resolution Print View Modal
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState<boolean>(false);

  const activeMeeting = meetings.find(m => m.id === activeMeetingId) || meetings[0];
  const committeeMembers = auditors.filter(a => a.isCommitteeMember);

  const handleOpenReview = (agenda: CommitteeAgenda) => {
    setSelectedAgenda(agenda);
    setDeliberationDecision(agenda.decision || '인증등록승인');
    setDeliberationNote(
      agenda.reviewNote || 
      `인증심사보고서 및 부적합 시정조치 계획의 적절성을 검토한 결과, KAB 공인 심사 기준에 부합하므로 최종 ${agenda.decision || '인증등록승인'}을 의결함.`
    );
  };

  const handleSaveDecision = () => {
    if (!selectedAgenda || !activeMeeting) return;

    setMeetings(prev => prev.map(m => {
      if (m.id === activeMeeting.id) {
        return {
          ...m,
          agendas: m.agendas.map(a => {
            if (a.id === selectedAgenda.id) {
              return {
                ...a,
                decision: deliberationDecision,
                reviewNote: deliberationNote,
                decidedAt: new Date().toISOString().substring(0, 10),
              };
            }
            return a;
          })
        };
      }
      return m;
    }));

    onApproveAgenda(activeMeeting.id, selectedAgenda.id, deliberationDecision, deliberationNote);
    setSelectedAgenda(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  GMSCS 인증심의위원회 (인증위원회)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  KAB 공인 인증 심의 의결기구
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                현장 심사 완료 보고서의 적합성을 최종 검토·의결하여 공식 인증서(Certificate) 발행을 승인합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Resolution View */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsResolutionModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4" />
            <span>공식 심의의결서 확인/출력</span>
          </button>
        </div>
      </div>

      {/* Committee Overview & Members Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Meeting Selector & Info (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700">위원회 회차 선택</span>
            <span className="text-[11px] text-indigo-600 font-semibold">{meetings.length}개 회차 보관</span>
          </div>

          <div className="space-y-2">
            {meetings.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMeetingId(m.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                  activeMeeting.id === m.id
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{m.meetingNumber}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">개최일: {m.meetingDate}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  m.status === '의결완료'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {m.status}
                </span>
              </button>
            ))}
          </div>

          {/* Committee Member Registry Status */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                위촉 인증심의위원 현황 ({committeeMembers.length}인)
              </span>
            </div>
            <div className="space-y-1.5">
              {committeeMembers.map(member => (
                <div 
                  key={member.id} 
                  className="bg-slate-50 p-2 rounded-xl flex items-center justify-between text-xs border border-slate-200"
                >
                  <div>
                    <span className="font-bold text-slate-800">{member.name}</span>
                    <span className="text-[10px] text-indigo-700 font-semibold ml-2">
                      [{member.committeeRole || '심의위원'}]
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    위촉: {member.committeeAppointmentDate || '2023-01'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Agendas for Deliberation (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>{activeMeeting.meetingNumber} 상정 안건 목록</span>
                <span className="text-xs text-slate-400 font-normal">
                  (총 {activeMeeting.agendas.length}건 / 심의완료 {activeMeeting.agendas.filter(a => a.decision).length}건)
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                이전 심의위원회 이후 서명 완료된 심사보고서가 상정되었습니다.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              심의위원장: <strong className="text-slate-800">{activeMeeting.chairperson}</strong>
            </div>
          </div>

          <div className="space-y-3">
            {activeMeeting.agendas.map((agenda) => {
              const hasDecided = !!agenda.decision;
              return (
                <div 
                  key={agenda.id}
                  className={`p-4 rounded-2xl border transition ${
                    hasDecided
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-white border-indigo-200 ring-2 ring-indigo-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{agenda.companyName}</h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          {agenda.auditType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        심사 표준: <span className="font-semibold text-slate-700">{agenda.standards.join(', ')}</span>
                        <span className="mx-1.5 text-slate-300">|</span>
                        심사팀장: <span className="font-semibold text-slate-700">{agenda.leadAuditorName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasDecided ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                          agenda.decision === '인증등록승인'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : agenda.decision === '조건부승인'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {agenda.decision}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          심의 의결 대기
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Audit Findings Summary */}
                  <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-center text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">중부적합</span>
                      <strong className={`text-sm font-mono ${agenda.majorCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {agenda.majorCount}건
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">경부적합</span>
                      <strong className={`text-sm font-mono ${agenda.minorCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {agenda.minorCount}건
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">관찰사항</span>
                      <strong className="text-sm font-mono text-slate-700">
                        {agenda.observationCount}건
                      </strong>
                    </div>
                  </div>

                  {/* Recommendation & Review Note */}
                  <div className="text-xs text-slate-600 space-y-1 mb-3">
                    <p>
                      <strong className="text-slate-700">심사팀 종합 의견:</strong> {agenda.leadRecommendation}
                    </p>
                    {agenda.reviewNote && (
                      <p className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-indigo-950 font-sans text-[11px] leading-relaxed">
                        <strong>심의의결 내용:</strong> {agenda.reviewNote}
                        {agenda.decidedAt && (
                          <span className="block text-[10px] text-indigo-600 font-mono mt-0.5">
                            의결일자: {agenda.decidedAt}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenReview(agenda)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-2xs flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{hasDecided ? '심의의결 재검토' : '심의 의결 진행'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deliberation Modal */}
      {selectedAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  인증심의위원회 심의 의결서 작성
                </h3>
                <p className="text-[11px] text-slate-500">
                  대상 기업: <strong>{selectedAgenda.companyName}</strong> ({selectedAgenda.auditType} / {selectedAgenda.standards.join(', ')})
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Decision Radio Buttons */}
              <div>
                <label className="block text-slate-800 font-bold mb-2">
                  위원회 심의 판정 (Decision)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['인증등록승인', '조건부승인', '인증보류', '인증불가'] as CommitteeDecision[]).map(dec => (
                    <button
                      key={dec}
                      type="button"
                      onClick={() => setDeliberationDecision(dec)}
                      className={`p-3 rounded-xl border text-left font-bold transition flex items-center justify-between ${
                        deliberationDecision === dec
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{dec}</span>
                      {deliberationDecision === dec && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Note */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  심의위원 종합 심의의견 (의결 사유)
                </label>
                <textarea
                  rows={4}
                  value={deliberationNote}
                  onChange={(e) => setDeliberationNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-sans text-xs leading-relaxed"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 leading-relaxed">
                <span className="font-bold">📋 안내:</span> [인증등록승인] 또는 [조건부승인] 의결 시, 해당 심사 프로젝트는 즉시 <strong>'인증발행(Certified)'</strong> 단계로 연동되며 인증서 출력 권한이 활성화됩니다.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedAgenda(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleSaveDecision}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
              >
                의결 확정 및 인증발행 연동
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Document Modal */}
      {isResolutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-8 space-y-6 text-xs animate-in fade-in max-h-[90vh] overflow-y-auto">
            {/* Formal Resolution Sheet Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">GMSCS Form No. F18-001 (Rev. 3)</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                경영시스템 인증심의위원회 의결서 (Certification Resolution)
              </h2>
              <p className="text-xs text-slate-600">
                한국인정지원센터(KAB) 공인 인증기관 운영 절차서 제18조에 의거함
              </p>
            </div>

            {/* Meeting Info Table */}
            <table className="w-full border-collapse border border-slate-300 text-xs text-left">
              <tbody>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2.5 font-bold w-1/4">회의 명칭</th>
                  <td className="border border-slate-300 p-2.5 font-semibold">{activeMeeting.meetingNumber}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2.5 font-bold w-1/4">개최 일자</th>
                  <td className="border border-slate-300 p-2.5 font-mono">{activeMeeting.meetingDate}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2.5 font-bold">심의위원장</th>
                  <td className="border border-slate-300 p-2.5 font-bold text-indigo-900">{activeMeeting.chairperson}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2.5 font-bold">참석 심의위원</th>
                  <td className="border border-slate-300 p-2.5">{activeMeeting.attendees.join(', ')}</td>
                </tr>
              </tbody>
            </table>

            {/* Agendas Review Table */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 text-xs">■ 상정 안건 심의 및 의결 결과</h4>
              <table className="w-full border-collapse border border-slate-300 text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="border border-slate-300 p-2">안건</th>
                    <th className="border border-slate-300 p-2">기업명</th>
                    <th className="border border-slate-300 p-2">인증 규격</th>
                    <th className="border border-slate-300 p-2">심사팀장</th>
                    <th className="border border-slate-300 p-2 text-center">심의 판정</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMeeting.agendas.map((ag, idx) => (
                    <tr key={ag.id}>
                      <td className="border border-slate-300 p-2 font-mono text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">{ag.companyName}</td>
                      <td className="border border-slate-300 p-2 font-mono">{ag.standards.join(', ')}</td>
                      <td className="border border-slate-300 p-2">{ag.leadAuditorName}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-indigo-900">
                        {ag.decision || '심의진행중'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Committee Final Endorsement */}
            <div className="border border-slate-300 p-4 rounded-xl bg-slate-50 text-slate-700 space-y-2 leading-relaxed">
              <p>
                위 상정 안건에 대하여 본 인증심의위원회는 심사 계획, 현장 심사 수행의 객관성, 부적합 사항에 대한 시정조치 유효성 검증 결과를 엄정히 검토하였으며, 위와 같이 최종 의결하였음을 확인합니다.
              </p>
              <div className="flex justify-between items-center pt-4 font-bold text-slate-900">
                <span>{activeMeeting.meetingDate}</span>
                <span>GMSCS 인증심의위원장: {activeMeeting.chairperson} (인)</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>의결서 인쇄</span>
              </button>
              <button
                onClick={() => setIsResolutionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
