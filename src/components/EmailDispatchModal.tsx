import React, { useState } from 'react';
import { 
  Mail, 
  Copy, 
  Check, 
  X, 
  FileText, 
  ShieldAlert, 
  DollarSign, 
  Award,
  ExternalLink
} from 'lucide-react';
import { EmailDispatchLog } from '../types';

export interface EmailDispatchData {
  templateType: '심사계획서' | '심사원배정통보' | '심사원변경통보' | '심사비승인통보' | '인증심의결과안내';
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
}

interface EmailDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<EmailDispatchData>;
  onLogSent?: (log: EmailDispatchLog) => void;
}

export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onLogSent,
}) => {
  if (!isOpen) return null;

  const [templateType, setTemplateType] = useState<EmailDispatchData['templateType']>(
    initialData?.templateType || '심사계획서'
  );
  const [recipientEmail, setRecipientEmail] = useState(initialData?.recipientEmail || '');
  const [recipientName, setRecipientName] = useState(initialData?.recipientName || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // 템플릿 변경 시 본문 프리셋 채우기
  const applyTemplate = (type: EmailDispatchData['templateType']) => {
    setTemplateType(type);
    if (type === '심사계획서') {
      setSubject(`[GMSCS 인증원] ${recipientName || '고객사'} 심사계획서 송부의 건`);
      setBody(`안녕하십니까, GMSCS 인증원입니다.

귀사의 무궁한 발전을 기원합니다.
신청하신 인증 심사와 관련하여 아래와 같이 심사계획서를 송부드리오니 확인 및 협조 부탁드립니다.

1. 피심사 기업: ${recipientName || '귀사'}
2. 심사 표준: ISO 9001:2015, ISO 14001:2015
3. 심사팀 편성: 정현일 선임심사원(팀장), 이혜원 정심사원
4. 심사 일정: 2026년 09월 14일(월) ~ 15일(화)
5. 준비 사항: 시작회의 참석자 명단 및 심사 장소(회의실) 안내

심사 일정이나 심사팀에 대해 이해상충이나 이의가 있으실 경우 즉시 인증원(02-2658-0296)으로 연락 주시기 바랍니다.

감사합니다.
GMSCS 인증원 배상`);
    } else if (type === '심사원변경통보') {
      setSubject(`[GMSCS 인증원] 담당 심사원 교체 배정 안내 (독립성/이해상충 방지)`);
      setBody(`안녕하십니까, GMSCS 인증원입니다.

인증 심사의 객관성 및 KAB 공정성 가이드라인(제3자 독립성 원칙)에 따라,
귀사의 차기 심사 담당 심사팀장이 아래와 같이 변경되었음을 통지하여 드립니다.

[변경 내역]
- 변경 사유: 심사원 이해상충 방지(과거 자문 이력 회피) 및 공정성 확보
- 기존 심사원: 정대현 심사원보
- 신규 배정 심사원: 정현일 선임심사원 (IAF 17, 28 전문자격)

신규 심사팀장이 사전 준비를 위해 유선으로 사전 연락을 드릴 예정입니다.
원활하고 신뢰성 높은 인증 서비스를 제공해 드리겠습니다.

감사합니다.
GMSCS 인증원 배상`);
    } else if (type === '심사비승인통보') {
      setSubject(`[GMSCS 인증원] 심사비용 조정 승인 결과 안내`);
      setBody(`안녕하십니까, GMSCS 인증원입니다.

신청하신 심사비용 조정 요청 건에 대해 내부 심의 및 승인이 완료되었습니다.

1. 대상 프로젝트: (주)한성정밀공업 사후관리 2차
2. 표준 산정 수수료: 2,000,000원 (VAT 별도)
3. 최종 승인 심사비: 1,700,000원 (VAT 별도 / 15% 우대할인 확정)
4. 승인권자: 대표 남경호

수정된 전자세금계산서 및 입금 안내는 순차 발행될 예정입니다.

감사합니다.
GMSCS 인증원 배상`);
    } else if (type === '인증심의결과안내') {
      setSubject(`[GMSCS 인증원] 인증심의위원회 심의 의결 완료 및 인증서 발행 통보`);
      setBody(`안녕하십니까, GMSCS 인증원입니다.

귀사에 대한 인증 심사 결과 보고서에 대해 당원 인증심의위원회의 엄정한 심의가 완료되어, 
최종 [인증등록 승인]이 결정되었음을 기쁜 마음으로 알려드립니다.

1. 인증 규격: ISO 9001:2015, ISO 14001:2015
2. 심의 결과: 적합 (인증등록 승인 의결)
3. 인증서 유효기간: 3년간 유효 (매년 사후관리 심사 수행 요건)
4. 인증서 원본 발송: 등기우편 및 전자 PDF 다운로드 지원

인증마크 사용 가이드 및 고해상도 AI 마크 파일은 첨부파일을 확인해 주시기 바랍니다.

감사합니다.
GMSCS 인증원장 남경호 배상`);
    }
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(`제목: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMailtoLaunch = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');

    // 시스템 발송 대장에 기록
    if (onLogSent) {
      onLogSent({
        id: `mlog-${Date.now()}`,
        sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        templateType,
        senderEmail: 'esggnf@naver.com',
        senderName: 'GMSCS 인증원',
        recipientEmail,
        recipientName: recipientName || recipientEmail,
        subject,
        bodySummary: body.substring(0, 80) + '...',
        status: '발송완료',
      });
    }

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">GMSCS 스마트 메일 발송 센터</h3>
              <p className="text-[11px] text-cyan-200/80">
                원클릭 아웃룩/기본 웹메일 연동 및 시스템 발송 이력 보관
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Quick Selector */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 px-6 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <span className="text-slate-500 mr-1 text-[11px]">서식 프리셋:</span>
          <button
            type="button"
            onClick={() => applyTemplate('심사계획서')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              templateType === '심사계획서'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            심사계획서 송부
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('심사원변경통보')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              templateType === '심사원변경통보'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            이해상충 심사원 변경
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('심사비승인통보')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              templateType === '심사비승인통보'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            심사비 조정 승인
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('인증심의결과안내')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              templateType === '인증심의결과안내'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            인증심의 통과/발행
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">수신자명 / 직함</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="예: 강태석 품질팀장"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">수신 이메일 주소</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="quality@company.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">메일 제목</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 bg-white font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-bold">메일 본문 (편집 가능)</label>
              <span className="text-[11px] text-slate-400">발신: esggnf@naver.com (GMSCS 인증원)</span>
            </div>
            <textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 bg-slate-50/50 font-mono text-[11px] leading-relaxed resize-y"
            />
          </div>

          {/* Technology Note */}
          <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl text-[11px] text-cyan-900 leading-relaxed">
            <span className="font-bold">🛡️ 보안 메일 발송 안내:</span> 아래 [메일 앱으로 발송하기] 클릭 시 본인 PC의 공식 아웃룩 또는 브라우저 기본 메일이 수신인과 본문이 채워진 채 안전하게 실행되며, 발송 이력은 당사 DB에 영구 기록됩니다.
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyBody}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition text-xs flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? '본문 복사됨!' : '본문 클립보드 복사'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-200 transition text-xs"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleMailtoLaunch}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition text-xs shadow-md flex items-center gap-2"
            >
              {sentSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>발송 연동 완료!</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>메일 앱(Outlook)으로 발송 & 대장 기록</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
