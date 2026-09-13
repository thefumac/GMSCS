import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Save,
  Send,
  X,
  Users,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  PenTool,
  Check,
  Paperclip,
  Download
} from 'lucide-react';
import type { Company, Auditor, AuditReport, AuditContractRecord, AuditProject } from '../../types';

export interface AuditReportWizardProps {
  company: Company;
  contract?: AuditContractRecord;
  report?: AuditReport;
  auditor?: Auditor;
  auditors?: Auditor[];
  project?: AuditProject;
  onClose: () => void;
  onSave?: (data: any) => void;
  onUpdateCompany?: (updated: Company) => void;
}

export const AuditReportWizard: React.FC<AuditReportWizardProps> = ({
  company,
  contract,
  report,
  auditor,
  auditors = [],
  project,
  onClose,
  onSave,
  onUpdateCompany: _onUpdateCompany
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: 개요 및 심사팀 상태
  const [auditType, setAuditType] = useState<string>(
    project?.auditType || (contract?.contractType === '신규인증' ? '최초 2단계' : '사후관리 1차')
  );
  const [standards, setStandards] = useState<string[]>(
    project?.standards || contract?.standards || (company.standards ? (Array.isArray(company.standards) ? company.standards : [company.standards]) : ['ISO 9001:2015'])
  );
  const [startDate, setStartDate] = useState<string>(
    project?.startDate || contract?.plannedAuditStartDate || ''
  );
  const [endDate, setEndDate] = useState<string>(
    project?.endDate || contract?.plannedAuditEndDate || ''
  );
  const [leadAuditorName, setLeadAuditorName] = useState<string>(
    project?.leadAuditorName || contract?.leadAuditorName || auditor?.name || ''
  );
  const [teamAuditorName, setTeamAuditorName] = useState<string>(
    (project as any)?.teamAuditorNames?.join(', ') || contract?.teamAuditorName || ''
  );

  // Step 2: 체크리스트 및 공정 관찰 상태
  const [checklist, setChecklist] = useState<Array<{ clause: string; title: string; result: '적합' | '경부적합' | '중부적합' | '해당없음'; note: string }>>([
    { clause: '4.1 & 4.2', title: '조직 상황 및 이해관계자 요구사항 파악', result: '적합', note: '' },
    { clause: '5.1 & 5.2', title: '리더십과 의지표명, 방침 수립 및 전파', result: '적합', note: '' },
    { clause: '6.1', title: '리스크 및 기회에 대한 조치 계획', result: '적합', note: '' },
    { clause: '7.1 ~ 7.5', title: '자원 관리, 역량, 적격성 및 문서화된 정보', result: '적합', note: '' },
    { clause: '8.1 ~ 8.7', title: '운영 기획, 생산 및 서비스 제공 통제', result: '적합', note: '' },
    { clause: '9.1 ~ 9.3', title: '성과 평가, 내부심사 및 경영검토', result: '적합', note: '' },
    { clause: '10.1 ~ 10.3', title: '부적합 조치 및 지속적 개선 활동', result: '적합', note: '' }
  ]);

  // Step 3: NCR 및 종합평가
  const [majorCount, setMajorCount] = useState<number>(0);
  const [minorCount, setMinorCount] = useState<number>(0);
  const [obsCount, setObsCount] = useState<number>(0);
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    report?.executiveSummary || ''
  );
  const [recommendation, setRecommendation] = useState<'인증등록 추천' | '시정조치 후 추천' | '재심사 추천'>(
    '인증등록 추천'
  );

  // Step 4: 전자서명 상태
  const [leadSigned, setLeadSigned] = useState<boolean>(false);
  const [clientSigned, setClientSigned] = useState<boolean>(false);

  const handleSaveDraft = () => {
    const payload = {
      companyName: company.companyName,
      auditType,
      standards,
      startDate,
      endDate,
      leadAuditorName,
      teamAuditorName,
      checklist,
      nonConformityCount: { major: majorCount, minor: minorCount, observation: obsCount },
      executiveSummary,
      recommendation,
      signatures: { leadSigned, clientSigned },
      updatedAt: new Date().toISOString()
    };
    onSave?.(payload);
    alert(`[${company.companyName}] 심사보고서가 안전하게 임시저장되었습니다.`);
  };

  const handleSubmitToSecretariat = () => {
    handleSaveDraft();
    alert(`[사무국 제출 완료]\n${company.companyName}의 심사보고서가 사무국 검토 대기로 상정되었습니다.`);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* 1. 최상단 헤더 */}
      <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">{company.companyName}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-900/80 text-cyan-300 border border-cyan-700">
                {auditType}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              표준 심사보고서 작성 위저드 (실용형 4단계) · 담당 심사팀장: {leadAuditorName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-medium transition cursor-pointer border border-slate-600"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            <span>임시저장</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. 단계(Step) 네비게이션 바 */}
      <div className="px-6 py-3 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
          {[
            { step: 1, title: '1. 심사 개요 및 팀 편성', icon: Building2 },
            { step: 2, title: '2. 체크리스트 & 공정 관찰', icon: ShieldCheck },
            { step: 3, title: '3. 부적합(NCR) & 종합평가', icon: AlertTriangle },
            { step: 4, title: '4. 전자서명 및 제출', icon: PenTool }
          ].map(s => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-white font-bold shadow-sm'
                    : isCompleted
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Step {currentStep} / 4
        </div>
      </div>

      {/* 3. 메인 콘텐츠 영역 (단계별 전환) */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* STEP 1: 개요 및 심사팀 */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>기업 기본 정보 및 인증 범위</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">기업명</label>
                    <input
                      type="text"
                      disabled
                      value={company.companyName}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">사업자등록번호</label>
                    <input
                      type="text"
                      disabled
                      value={company.bizNumber}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block mb-1">본사 소재지</label>
                    <input
                      type="text"
                      disabled
                      value={company.address}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block mb-1">인증 범위 (Scope)</label>
                    <textarea
                      rows={2}
                      defaultValue={company.scope || '금속 가공 및 기계 부품의 설계, 개발, 제조 및 서비스'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>심사 일정 및 팀 구성</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">심사 구분</label>
                    <select
                      value={auditType}
                      onChange={e => setAuditType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                    >
                      <option value="최초 1단계">최초 1단계 심사</option>
                      <option value="최초 2단계">최초 2단계 심사</option>
                      <option value="사후관리 1차">사후관리 1차</option>
                      <option value="사후관리 2차">사후관리 2차</option>
                      <option value="갱신심사">갱신심사 (재인증)</option>
                      <option value="전환심사">전환심사</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">적용 규격</label>
                    <input
                      type="text"
                      value={standards.join(', ')}
                      onChange={e => setStandards(e.target.value.split(',').map(s => s.trim()))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">심사 시작일</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">심사 종료일</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">심사팀장</label>
                    <input
                      type="text"
                      value={leadAuditorName}
                      onChange={e => setLeadAuditorName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">참석 심사원 (팀원)</label>
                    <input
                      type="text"
                      value={teamAuditorName}
                      onChange={e => setTeamAuditorName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 체크리스트 및 공정 관찰 */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>표준 요구사항별 적합성 평가 체크리스트</span>
                </h3>
                <span className="text-xs text-slate-400">총 {checklist.length}개 핵심 조항</span>
              </div>

              <div className="space-y-3">
                {checklist.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-900 text-cyan-400 border border-slate-700 rounded font-mono text-xs font-bold">
                          {item.clause}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {(['적합', '경부적합', '중부적합', '해당없음'] as const).map(res => (
                          <button
                            key={res}
                            type="button"
                            onClick={() => {
                              const updated = [...checklist];
                              updated[idx].result = res;
                              setChecklist(updated);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                              item.result === res
                                ? res === '적합'
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : res === '경부적합'
                                  ? 'bg-amber-600 text-white font-bold'
                                  : res === '중부적합'
                                  ? 'bg-rose-600 text-white font-bold'
                                  : 'bg-slate-600 text-white font-bold'
                                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={item.note}
                      onChange={e => {
                        const updated = [...checklist];
                        updated[idx].note = e.target.value;
                        setChecklist(updated);
                      }}
                      placeholder="확인 근거 및 현장 관찰 메모를 입력하세요"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-cyan-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: 부적합(NCR) 및 종합평가 */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>심사 지적 사항 (NCR) 집계</span>
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <span className="text-xs text-rose-400 block mb-1 font-bold">중부적합 (Major)</span>
                    <input
                      type="number"
                      min={0}
                      value={majorCount}
                      onChange={e => setMajorCount(parseInt(e.target.value, 10) || 0)}
                      className="w-16 bg-slate-800 border border-slate-700 rounded-lg py-1 text-center font-mono font-bold text-rose-400 text-base outline-none"
                    />
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <span className="text-xs text-amber-400 block mb-1 font-bold">경부적합 (Minor)</span>
                    <input
                      type="number"
                      min={0}
                      value={minorCount}
                      onChange={e => setMinorCount(parseInt(e.target.value, 10) || 0)}
                      className="w-16 bg-slate-800 border border-slate-700 rounded-lg py-1 text-center font-mono font-bold text-amber-400 text-base outline-none"
                    />
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <span className="text-xs text-cyan-400 block mb-1 font-bold">관찰사항 (Observation)</span>
                    <input
                      type="number"
                      min={0}
                      value={obsCount}
                      onChange={e => setObsCount(parseInt(e.target.value, 10) || 0)}
                      className="w-16 bg-slate-800 border border-slate-700 rounded-lg py-1 text-center font-mono font-bold text-cyan-400 text-base outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>심사 총평 및 최종 추천 의견</span>
                </h3>
                <div>
                  <label className="text-slate-400 block mb-1 text-xs">심사 종합 의견 (Executive Summary)</label>
                  <textarea
                    rows={4}
                    value={executiveSummary}
                    onChange={e => setExecutiveSummary(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:border-cyan-500 outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-xs">심사팀장 추천 판정</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['인증등록 추천', '시정조치 후 추천', '재심사 추천'] as const).map(rec => (
                      <button
                        key={rec}
                        type="button"
                        onClick={() => setRecommendation(rec)}
                        className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                          recommendation === rec
                            ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                        <span>{rec}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: 전자서명 및 최종 제출 */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  <span>심사팀장 및 기업 대표자 전자 서명 확인</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 심사팀장 서명 */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">심사팀장: {leadAuditorName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${leadSigned ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                        {leadSigned ? '서명 완료' : '서명 대기'}
                      </span>
                    </div>
                    <div className="h-24 bg-slate-800/80 rounded-lg border border-dashed border-slate-700 flex items-center justify-center">
                      <span className="text-xs font-serif italic text-cyan-300 text-lg">
                        {leadAuditorName} (인)
                      </span>
                    </div>
                  </div>

                  {/* 피심사기업 대표 서명 */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">피심사기업 대표: {company.ceoName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${clientSigned ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'}`}>
                        {clientSigned ? '서명 확인' : '현장 서명 대기'}
                      </span>
                    </div>
                    <div 
                      onClick={() => setClientSigned(!clientSigned)}
                      className="h-24 bg-slate-800/80 rounded-lg border border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-cyan-500 transition"
                    >
                      {clientSigned ? (
                        <span className="text-xs font-serif italic text-emerald-300 text-lg">
                          {company.ceoName} (인)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">클릭하여 현장 서명 완료 처리</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 최종 제출 안내 카드 */}
              <div className="bg-gradient-to-br from-cyan-950/60 to-slate-900 p-6 rounded-2xl border border-cyan-800/50 space-y-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-cyan-400 mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-white">모든 심사 작성이 완료되었습니다</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto">
                    사무국으로 제출하시면 심사보고서 검토 및 심의위원회 상정 절차가 자동으로 진행됩니다.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-600 transition cursor-pointer"
                  >
                    임시저장만 하기
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitToSecretariat}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-900/40 transition cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>사무국에 정식 제출하기</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. 최하단 이전/다음 스텝 이동 바 */}
      <div className="px-6 py-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between shrink-0">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
            currentStep === 1 ? 'opacity-40 cursor-not-allowed text-slate-500' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전 단계</span>
        </button>

        <div className="flex items-center gap-2">
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
              className="flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
            >
              <span>다음 단계</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitToSecretariat}
              className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>작성 완료 및 사무국 제출</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
