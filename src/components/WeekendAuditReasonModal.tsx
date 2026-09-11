import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Printer, 
  Mail, 
  Clock, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { WeekendAuditReasonData } from '../types';

interface WeekendAuditReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  auditDates: string;
  standards: string[];
  auditorName: string;
  initialData?: WeekendAuditReasonData;
  onSaveData: (data: WeekendAuditReasonData) => void;
}

export const WeekendAuditReasonModal: React.FC<WeekendAuditReasonModalProps> = ({
  isOpen,
  onClose,
  companyName,
  auditDates,
  standards,
  auditorName,
  initialData,
  onSaveData
}) => {
  if (!isOpen) return null;

  const [reasonCategory, setReasonCategory] = useState<WeekendAuditReasonData['reasonCategory']>(
    initialData?.reasonCategory || '고객사요청'
  );
  const [detailedReason, setDetailedReason] = useState<string>(
    initialData?.detailedReason || 
    '고객사의 주중 정상 조업 및 납품 생산 일정 차질을 방지하고, 교대근무 공정 및 설비 가동 상태를 온전히 확인하기 위하여 기업의 서면 요청에 따라 주말(토/일) 현장 심사를 편성하여 진행함.'
  );
  const [auditorSigned, setAuditorSigned] = useState<boolean>(initialData?.auditorSigned ?? true);
  const [clientVerified, setClientVerified] = useState<boolean>(initialData?.clientVerified ?? false);
  const [clientVerifiedAt, setClientVerifiedAt] = useState<string | undefined>(initialData?.clientVerifiedAt);
  const [clientEmail, setClientEmail] = useState<string>(initialData?.clientEmail || 'quality@' + (companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'client') + '.co.kr');
  const [clientName, setClientName] = useState<string>(initialData?.clientName || '대표이사 / 공장장');
  const [emailSentNotice, setEmailSentNotice] = useState<boolean>(false);

  const handleSendClientVerifyEmail = () => {
    setEmailSentNotice(true);
    setTimeout(() => {
      alert(`[휴일근무 확인 요청 메일 발송 완료]\n수신인: ${clientEmail} (${clientName})\n제목: [GMSCS 인증원] ${companyName} 주말/공휴일 심사 수행에 따른 휴일근무 확인서 동의 요청\n\n기업 담당자가 메일의 [원클릭 승인 확인] 링크를 통해 즉시 승인할 수 있습니다.`);
    }, 300);
  };

  const handleClientQuickVerify = () => {
    const now = new Date().toLocaleString();
    setClientVerified(true);
    setClientVerifiedAt(now);
    alert(`[기업 이메일 확인 승인 완료]\n${companyName} ${clientName}님이 본 휴일(주말) 심사 수행에 동의 및 확인 서명을 완료하였습니다.\n확인일시: ${now}`);
  };

  const handleSave = () => {
    const data: WeekendAuditReasonData = {
      auditDates,
      isWeekendOrHoliday: true,
      reasonCategory,
      detailedReason,
      auditorSigned,
      auditorSignedAt: auditorSigned ? new Date().toISOString().substring(0, 10) : undefined,
      clientVerified,
      clientVerifiedAt,
      clientVerificationMethod: '이메일확인',
      clientEmail,
      clientName
    };
    onSaveData(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold flex items-center gap-2">
                  <span>주말 및 공휴일 심사(근무) 사유서</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                    Remark 공인 서식
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setReasonCategory('전기요금절감');
                    setDetailedReason('전기 요금 절감을 위하여 휴일인 토, 일요일에 근무하고 평일에 휴무하는 근로방식을 6월부터 8월까지 시행하는 방침에 따라 휴일인 해당 일자에 근무하여 현장 심사를 수행함.');
                    setClientName('박경원 대표');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 border border-amber-400/40 font-bold text-[10px] transition cursor-pointer"
                  title="케이원메탈 실물 휴일근무확인서(전기요금 절감 토/일 근무) 사례 자동 입력"
                >
                  ★ 케이원메탈 실물사례 채우기
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                KAB 인정 기준 및 노동법규 준수를 위한 주말 심사 사유 증적 및 기업 이메일 확인 연동
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 text-xs text-slate-800">
          
          {/* 기업 및 심사 일정 요약 카드 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-500 block text-[11px]">대상 고객사</span>
              <strong className="text-slate-900 font-bold">{companyName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">심사 수행 일정</span>
              <strong className="text-amber-700 font-bold font-mono">{auditDates} (주말/휴일 포함)</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">심사 표준 규격</span>
              <span className="text-slate-800 font-bold">{standards.join(', ')}</span>
            </div>
          </div>

          {/* 1. 주말 심사 필요 사유 구분 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              1. 주말 및 공휴일 심사(근무) 사유 구분
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: '고객사요청', label: '고객사 서면 요청', desc: '주중 정상 조업 및 납품 차질 방지' },
                { id: '연속가동생산', label: '연속 공정 특성', desc: '24시간 연속 가동 설비 및 교대근무 확인' },
                { id: '공정특성', label: '현장 특별 심사', desc: '휴일 가동 공정 및 안전수칙 수검' },
                { id: '기타', label: '기타 사유', desc: '긴급 인증 갱신 만료 등' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setReasonCategory(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    reasonCategory === item.id
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs">{item.label}</span>
                  <span className="text-[10px] text-slate-500 font-normal">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 구체적 사유 기재 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              2. 상세 사유 및 감사 입증 내용
            </label>
            <textarea
              rows={3}
              value={detailedReason}
              onChange={(e) => setDetailedReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white leading-relaxed"
            />
          </div>

          {/* 3. 양 당사자 확인 및 기업 이메일 인증 패널 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
              <span>3. 심사팀장 서명 및 피심사기업 이메일 확인</span>
              <span className="text-[11px] font-normal text-slate-500">인정기관 감사 필수 증적</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 심사팀장 서명 */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">심사팀장 확인</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{auditorName}</span>
                  <label className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={auditorSigned}
                      onChange={(e) => setAuditorSigned(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>전자 서명 완료 ✓</span>
                  </label>
                </div>
              </div>

              {/* 피심사기업 확인 & 이메일 인증 */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 block">피심사기업 확인 (대표/품질책임자)</span>
                
                {clientVerified ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <div className="flex items-center space-x-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>기업 이메일 원클릭 확인 완료</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-0.5">
                      확인자: {clientName} ({clientEmail}) · 일시: {clientVerifiedAt}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[11px]"
                        placeholder="기업 담당자 이메일"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleSendClientVerifyEmail}
                        className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition flex items-center justify-center space-x-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span>확인 요청 메일 발송</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClientQuickVerify}
                        className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-2xs"
                      >
                        원클릭 승인
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-4 px-6 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>사유서 A4 인쇄</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-xs transition"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-xs shadow-md transition"
            >
              사유서 저장 및 계약 연동
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
