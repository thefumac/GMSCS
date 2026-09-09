import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  PenTool, 
  Send, 
  Printer, 
  Smartphone, 
  ShieldCheck, 
  Clock, 
  Building2,
  Paperclip,
  Upload,
  Lock,
  Unlock,
  Mail,
  Check,
  Calendar,
  AlertCircle,
  Eye,
  FileCheck,
  HelpCircle
} from 'lucide-react';
import { AuditReport, SignatureLog, ChecklistItem, AuditAttachment } from '../types';
import { SignatureCanvas } from './SignatureCanvas';
import { remarkFormTemplates, remarkMeetingAgendas } from '../data/mockRemarkData';

interface AuditReportEditorProps {
  report: AuditReport;
  onSaveReport: (updated: AuditReport) => void;
  onClose: () => void;
}

export const AuditReportEditor: React.FC<AuditReportEditorProps> = ({
  report: initialReport,
  onSaveReport,
  onClose
}) => {
  const [report, setReport] = useState<AuditReport>(initialReport);
  const [activeTabMenu, setActiveTabMenu] = useState<string>('stage2');
  const [activeSignerModal, setActiveSignerModal] = useState<SignatureLog | null>(null);
  const [emailVerifyModal, setEmailVerifyModal] = useState<SignatureLog | null>(null);
  
  // 기준일: 2026-09-09
  const today = new Date(2026, 8, 9);
  const startDate = new Date(report.startDate);
  const endDate = new Date(report.endDate);
  
  // 심사 기간 판정 (기본: 기간 중 여부)
  const isWithinPeriodReal = today >= startDate && today <= endDate;
  const [forcePeriodActive, setForcePeriodActive] = useState<boolean>(isWithinPeriodReal);
  const isFormEditable = forcePeriodActive;

  // 텍스트 필드 수정
  const handleTextChange = (field: keyof AuditReport, value: any) => {
    if (!isFormEditable) return;
    setReport(prev => ({ ...prev, [field]: value }));
  };

  // 체크리스트 판정 변경
  const handleChecklistResultChange = (id: string, result: ChecklistItem['result']) => {
    if (!isFormEditable) return;
    setReport(prev => ({
      ...prev,
      checklists: prev.checklists.map(item => item.id === id ? { ...item, result } : item)
    }));
  };

  // 체크리스트 증빙 내용 변경
  const handleChecklistEvidenceChange = (id: string, evidence: string) => {
    if (!isFormEditable) return;
    setReport(prev => ({
      ...prev,
      checklists: prev.checklists.map(item => item.id === id ? { ...item, evidence } : item)
    }));
  };

  // 증빙 서류 가상 첨부
  const handleAddAttachment = (clauseId: string, isReq: boolean) => {
    if (!isFormEditable) return;
    const fileInput = prompt('첨부할 증빙 서류 파일명을 입력해 주십시오 (예: 2026_품질매뉴얼_Rev4.pdf):', '현장_실행증빙_기록서.pdf');
    if (!fileInput) return;

    const newAtt: AuditAttachment = {
      id: `att-${Date.now()}`,
      clauseId,
      fileName: fileInput,
      fileSize: '2.1 MB',
      isRequired: isReq,
      uploadedAt: '2026-09-09 13:45',
    };

    setReport(prev => ({
      ...prev,
      checklists: prev.checklists.map(item => {
        if (item.id === clauseId) {
          const currentAtts = item.attachments || [];
          return { ...item, attachments: [...currentAtts, newAtt] };
        }
        return item;
      })
    }));
  };

  // 서명 저장
  const handleSaveSignature = (dataUrl: string) => {
    if (!activeSignerModal) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const updatedSignatures = report.signatures.map(sig => {
      if (sig.id === activeSignerModal.id) {
        return {
          ...sig,
          isSigned: true,
          signatureDataUrl: dataUrl,
          signedAt: formattedDate,
          ipAddress: '211.180.52.19 (SSL 암호화 서명)',
          userAgent: navigator.userAgent
        };
      }
      return sig;
    });

    const updatedReport = { ...report, signatures: updatedSignatures };
    setReport(updatedReport);
    onSaveReport(updatedReport);
    setActiveSignerModal(null);
  };

  // 기업 공인 이메일 무료 확인 처리
  const handleConfirmEmailVerification = (sigId: string) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const updatedSignatures = report.signatures.map(sig => {
      if (sig.id === sigId) {
        return {
          ...sig,
          isSigned: true,
          emailVerified: true,
          emailVerifiedAt: formattedDate,
          signedAt: formattedDate,
          ipAddress: '211.234.112.5 (기업 대표메일 원클릭 확인 완료)',
          userAgent: 'Corporate Email Client (Chrome/Windows)'
        };
      }
      return sig;
    });

    const updatedReport = { ...report, signatures: updatedSignatures };
    setReport(updatedReport);
    onSaveReport(updatedReport);
    setEmailVerifyModal(null);
    alert(`[기업 이메일 확인 완료 - 비용 0원]\n${report.companyName} 대표이사/품질책임자가 이메일로 전송된 보안 인증 링크를 통해 심사보고서의 최종 내용을 검토 및 확인·승인하였습니다.`);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in">
      {/* 1. 상단 액션바 & 심사 기간 잠금 상태 컨트롤러 (너비 일치 확장: w-full) */}
      <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm no-print">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900">{report.companyName} 스마트 웹 심사보고서 팩</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                {report.auditType}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              적용 규격: <strong className="text-slate-700">{report.standards.join(', ')}</strong> · 심사팀장: <strong className="text-slate-700">{report.leadAuditor}</strong>
            </p>
          </div>
        </div>

        {/* 심사 기간 제어 및 액션 버튼들 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 심사 기간 잠금 상태 뱃지 */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-cyan-600" />
            <span className="font-semibold text-slate-600">심사 기간: {report.startDate} ~ {report.endDate}</span>
            <span className="text-slate-300">|</span>
            {isFormEditable ? (
              <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                <Unlock className="w-3.5 h-3.5" />
                <span>심사 기간 중 (입력 가능)</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-rose-600 font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>심사 기간 외 잠금 (읽기전용)</span>
              </span>
            )}
          </div>

          {/* 심사 기간 제어 시뮬레이션 토글 */}
          <button
            onClick={() => setForcePeriodActive(!forcePeriodActive)}
            className="text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-bold transition shadow-xs"
            title="심사 기간 전/후에 따른 폼 잠금 기능을 테스트합니다"
          >
            {forcePeriodActive ? '🔒 기간 외 잠금 테스트' : '🔓 기간 내 활성화'}
          </button>

          {/* 심사원 보안 링크 복사 */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://gmscs.web.app/audit-entry?token=${report.signatures[1]?.verificationToken || 'vtok-secure'}&period=strict`);
              alert('[심사원 전용 보안 링크 복사 완료]\n심사 시작일~종료일 기간 동안만 열람 및 작성이 허용되는 보안 URL입니다.');
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-cyan-600" />
            <span>심사원 보안 링크 복사</span>
          </button>

          {/* A4 공인 PDF 인쇄/출력 */}
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-600" />
            <span>A4 공인 인쇄/PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold transition shadow-xs"
          >
            대시보드로 복귀
          </button>
        </div>
      </div>

      {/* 2. Remark 공식 양식 팩 메뉴 탭 (너비 일치: w-full) */}
      <div className="w-full bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-1 overflow-x-auto no-scrollbar text-xs font-bold no-print">
        {remarkFormTemplates.map(template => {
          const isActive = activeTabMenu === template.id;
          return (
            <button
              key={template.id}
              onClick={() => setActiveTabMenu(template.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{template.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isActive ? 'bg-cyan-700 text-cyan-100' : 'bg-slate-100 text-slate-500'}`}>
                {template.formCode}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. 메인 양식 내용 영역 (w-full 풀 와이드 확장) */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 print-page text-slate-800">
        
        {/* 양식 공식 헤더 */}
        <div className="border-b-2 border-slate-200 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 text-cyan-700 font-extrabold text-sm tracking-wide">
              <ShieldCheck className="w-5 h-5 text-cyan-600" />
              <span>GMSCS GLOBAL MANAGEMENT SYSTEM CERTIFICATION SERVICE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {remarkFormTemplates.find(t => t.id === activeTabMenu)?.name || 'ISO 경영시스템 적합성 평가 심사보고서'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              문서번호: GMS-REP-2026-{report.projectId} · 양식코드: {remarkFormTemplates.find(t => t.id === activeTabMenu)?.formCode} · 최종작성일: {report.updatedAt}
            </p>
          </div>
          <div className="text-right space-y-1">
            <span className="inline-block px-3 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300">
              KAB 공인 표준 서식팩
            </span>
            <div className="text-[11px] text-slate-500">
              {isFormEditable ? (
                <span className="text-emerald-700 font-bold">● 심사 기간 내 작성 모드</span>
              ) : (
                <span className="text-rose-600 font-bold">🔒 기간 외 잠금 (수정불가)</span>
              )}
            </div>
          </div>
        </div>

        {/* 탭 1: 2단계 현장심사 보고서 */}
        {activeTabMenu === 'stage2' && (
          <div className="space-y-8">
            {/* 1. 고객 현황 및 심사 개요 */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-cyan-600" /> I. 고객 현황 및 심사 개요 (2nd Stage)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">고객명</span>
                  <strong className="text-slate-900 text-sm">{report.companyName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">심사 표준</span>
                  <strong className="text-cyan-800 text-sm">{report.standards.join(', ')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">심사 일정</span>
                  <span className="text-slate-800 font-bold">{report.auditDates}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">심사 유형</span>
                  <span className="text-slate-800 font-bold">{report.auditType}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium block mb-0.5">심사반 구성</span>
                  <span className="text-slate-700">
                    팀장: <strong>{report.leadAuditor}</strong> / 심사원: {report.auditTeam.join(', ') || '없음'} / 심사원보: {report.provisionalAuditors?.join(', ') || '없음'} / 검증심사원: {report.technicalReviewer || '없음'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium block mb-0.5">심사 결과 통계</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                      중부적합: {report.nonConformityCount.major}건
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                      경부적합: {report.nonConformityCount.minor}건
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                      관찰사항: {report.nonConformityCount.observation}건
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 심사 총평 및 발견사항 요약 */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-600" /> II. 심사 총평 및 소견 (Executive Summary)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    종합 심사 총평 (시스템 유효성 및 적합성)
                  </label>
                  <textarea
                    rows={4}
                    disabled={!isFormEditable}
                    value={report.executiveSummary}
                    onChange={(e) => handleTextChange('executiveSummary', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white leading-relaxed disabled:opacity-60"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 조직의 우수 강점 (Strengths)
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isFormEditable}
                      value={report.strengthPoints}
                      onChange={(e) => handleTextChange('strengthPoints', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white leading-relaxed disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 지속적 개선 권고사항 (Improvements)
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isFormEditable}
                      value={report.improvementAreas}
                      onChange={(e) => handleTextChange('improvementAreas', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white leading-relaxed disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 현장 적합성 평가 체크리스트 & 필수/선택 증빙 첨부 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" /> III. 2단계 현장심사 세부 점검 항목 & 증빙 첨부
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    각 조항별 판정 결과와 실행 증빙 내용을 입력하고, <strong className="text-rose-600">[필수 증빙]</strong> 서류를 첨부하여 심사 무결성을 보장합니다.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {report.checklists.map((item) => (
                  <div key={item.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="font-extrabold text-cyan-800 text-sm block">{item.clause}</span>
                        <p className="text-xs text-slate-700 font-semibold mt-1">{item.question}</p>
                        {item.requirementDetails && (
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{item.requirementDetails}</span>
                        )}
                      </div>

                      {/* 판정 선택 */}
                      <div className="shrink-0">
                        <select
                          disabled={!isFormEditable}
                          value={item.result}
                          onChange={(e) => handleChecklistResultChange(item.id, e.target.value as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none ${
                            item.result === '적합'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : item.result === '경부적합'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : item.result === '중부적합'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="적합">적합</option>
                          <option value="경부적합">경부적합</option>
                          <option value="중부적합">중부적합</option>
                          <option value="관찰사항">관찰사항</option>
                          <option value="해당없음">해당없음</option>
                        </select>
                      </div>
                    </div>

                    {/* 객관적 증거 입력 필드 */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        객관적 증거 및 현장 확인 내용 (Audit Evidence)
                      </label>
                      <input
                        type="text"
                        disabled={!isFormEditable}
                        value={item.evidence}
                        onChange={(e) => handleChecklistEvidenceChange(item.id, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                        placeholder="확인한 문서번호, 설비명, 현장 실측치 등 입력"
                      />
                    </div>

                    {/* 증빙 첨부 파일 영역 (필수 / 선택 구분) */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-500 flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5" /> 첨부 증빙:
                        </span>
                        {item.attachments && item.attachments.length > 0 ? (
                          item.attachments.map(att => (
                            <span
                              key={att.id}
                              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                att.isRequired
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <span className={`text-[10px] px-1 py-0.2 rounded font-extrabold ${att.isRequired ? 'bg-rose-200 text-rose-900' : 'bg-slate-200 text-slate-600'}`}>
                                {att.isRequired ? '필수' : '선택'}
                              </span>
                              <span>{att.fileName} ({att.fileSize})</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">등록된 증빙 서류 없음</span>
                        )}
                      </div>

                      {/* 증빙 추가 버튼 */}
                      {isFormEditable && (
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleAddAttachment(item.id, true)}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold transition"
                          >
                            <Upload className="w-3 h-3 text-rose-600" />
                            <span>+ 필수증빙 첨부</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddAttachment(item.id, false)}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition"
                          >
                            <Upload className="w-3 h-3 text-slate-500" />
                            <span>+ 선택증빙 첨부</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 1단계 문서심사 보고서 */}
        {activeTabMenu === 'stage1' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-extrabold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-cyan-600" /> 적합성 평가 심사보고서 (1st Stage Pack)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                1단계 심사는 경영시스템 문서화 정보 검토, 사업장 상태 및 2단계 현장심사 준비 상태를 확인하기 위한 절차입니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">1. 신청서와 설문서 상의 차이점 여부</span>
                  <span className="text-emerald-700 font-bold">차이점 없음 (신청 사업장 및 공정 일치 확인)</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">2. 내부심사 및 경영검토 수행 여부</span>
                  <span className="text-emerald-700 font-bold">적합 (2단계 현장심사 진행 요건 충족)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 3: 시작/종결회의 및 이해관계유무 확인서 */}
        {activeTabMenu === 'stage2' || activeTabMenu === 'stage1' ? (
          <div className="space-y-6 pt-6 border-t-2 border-slate-200">
            <h3 className="text-sm font-extrabold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-600" /> IV. 시작/종결회의 13대 필수 의제 & 이해관계유무 확인서 (공평성 서약)
            </h3>
            
            {/* 시작/종결회의 테이블 */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3">시작회의 필수 의제</th>
                    <th className="p-3">종결회의 필수 의제</th>
                    <th className="p-3 w-28 text-center">확인 여부</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {remarkMeetingAgendas.slice(0, 6).map((agenda) => (
                    <tr key={agenda.id} className="hover:bg-slate-50/80">
                      <td className="p-3 text-center font-bold text-slate-400">{agenda.id}</td>
                      <td className="p-3 text-slate-800 font-medium">{agenda.opening}</td>
                      <td className="p-3 text-slate-700">{agenda.closing}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3 mr-1" /> 확인완료
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 이해관계유무 확인서 박스 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>심사팀 전원 이해관계유무 및 공평성 보장 서약서</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                본 심사팀은 피심사 조직에 대하여 최근 2년 내 재직, 자문(컨설팅) 행위, 주식 3% 이상 소유, 혈연/학연 등 이해관계가 일체 없음을 확인하며,
                인증원의 공평성보장 절차(GSP-02)를 철저히 준수하였음을 엄숙히 서약합니다.
              </p>
            </div>
          </div>
        ) : null}

        {/* 탭 4: ESG-MS 부속서E 점검표 뷰 */}
        {activeTabMenu === 'esg-checklist' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl text-xs space-y-2">
              <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> ESG-MS 부속서E 정량/정성 종합 점검표
              </h3>
              <p className="text-indigo-900 leading-relaxed">
                공급망 ESG 실사 및 지속가능경영을 위한 E(환경 88점), S(사회 82점), G(지배구조 79점) 정량 지표 대사 완료본입니다.
              </p>
            </div>
          </div>
        )}

        {/* 4. 전자서명 및 기업 공인 무료 이메일 확인 모듈 (너비 일치 확장) */}
        <div className="space-y-6 pt-8 border-t-2 border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-cyan-600" /> V. 심사원단 서명 & 기업 공인 확인 (E-Signatures & Corporate Verification)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                심사팀장, 참석 심사원, 심사원보, 검증 심사원의 <strong className="text-slate-800">자필 전자서명</strong>과 
                피심사기업 대표의 <strong className="text-cyan-700">비용 0원 공인 이메일 원클릭 확인</strong>을 통해 최종 법적 효력을 완성합니다.
              </p>
            </div>

            {/* 기업 무료 이메일 인증 발송 버튼 */}
            <button
              onClick={() => {
                alert(`[기업 공인 이메일 확인 링크 발송 완료 - 비용 0원]\n\n수신: ${report.companyName} 대표이사/품질책임자 이메일\n제목: [GMSCS] ISO 심사 종합보고서 내용 확인 및 승인 요청\n링크: https://gmscs.web.app/verify-email?token=${report.signatures[0]?.verificationToken}`);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition shadow-xs"
            >
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>기업 이메일 확인 인증 발송 (비용 0원)</span>
            </button>
          </div>

          {/* 서명 카드 그리드 (5명 전원: 기업대표, 팀장, 팀원, 심사원보, 검증심사원) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {report.signatures.map((sig) => (
              <div
                key={sig.id}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-extrabold text-slate-700">{sig.signerRole}</span>
                    {sig.isSigned ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-800 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{sig.verifyMethod === '기업이메일확인' ? '메일인증' : '서명완료'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-800 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>대기중</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 truncate">{sig.signerName}</p>
                </div>

                {/* 서명 표시 영역 또는 이메일 인증 버튼 */}
                <div className="h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden relative shadow-inner">
                  {sig.isSigned ? (
                    sig.verifyMethod === '기업이메일확인' ? (
                      <div className="text-center p-2">
                        <div className="w-7 h-7 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 block">이메일 확인 승인완료</span>
                        <span className="text-[9px] text-slate-400 font-mono">{sig.emailVerifiedAt?.split(' ')[1]}</span>
                      </div>
                    ) : (
                      sig.signatureDataUrl ? (
                        <img
                          src={sig.signatureDataUrl}
                          alt={`${sig.signerName} 서명`}
                          className="max-h-full max-w-full object-contain p-1"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <span className="text-xs font-bold text-slate-800">날인 완료 (공인)</span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center p-2">
                      {sig.verifyMethod === '기업이메일확인' ? (
                        <button
                          onClick={() => setEmailVerifyModal(sig)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                        >
                          이메일 원클릭 확인
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveSignerModal(sig)}
                          className="px-3 py-1 text-[10px] font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-xs"
                        >
                          지금 서명하기
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 감사로그 메타데이터 */}
                <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                  {sig.isSigned ? (
                    <>
                      <div className="truncate">일시: {sig.signedAt}</div>
                      <div className="truncate">IP: {sig.ipAddress}</div>
                    </>
                  ) : (
                    <div>방식: {sig.verifyMethod}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-slate-200 pt-4 text-center text-[11px] text-slate-400">
          본 심사보고서 팩은 KAB 및 GMSCS 표준 양식에 준거하여 작성되었으며, 전자 서명 및 기업 이메일 인증을 통해 위변조 방지 SHA-256 해시값으로 인증원 사내 스토리지에 영구 보존됩니다.
        </div>
      </div>

      {/* 모달 1: 자필 서명 Canvas 모달 */}
      {activeSignerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 p-6 shadow-2xl">
            <SignatureCanvas
              signerTitle={`${activeSignerModal.signerRole} (${activeSignerModal.signerName})`}
              onSave={handleSaveSignature}
              onCancel={() => setActiveSignerModal(null)}
            />
          </div>
        </div>
      )}

      {/* 모달 2: 기업 공인 이메일 무료 확인 시뮬레이터 모달 */}
      {emailVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm">
                <Mail className="w-5 h-5 text-emerald-600" />
                <span>기업 공인 이메일 본인 확인 (무료)</span>
              </div>
              <button
                onClick={() => setEmailVerifyModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="text-slate-800 font-bold">수신자: {emailVerifyModal.signerName}</div>
              <div className="text-slate-500">인증 토큰: {emailVerifyModal.verificationToken}</div>
              <p className="text-slate-600 leading-relaxed pt-1">
                GMSCS 인증원에서 발송된 심사보고서 전문을 검토하였으며, 심사 결과 및 부적합/관찰사항 합의 내용에 동의하여 기업 공인 확인을 승인합니다.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEmailVerifyModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                취소
              </button>
              <button
                onClick={() => handleConfirmEmailVerification(emailVerifyModal.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                보고서 내용 확인 및 승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
