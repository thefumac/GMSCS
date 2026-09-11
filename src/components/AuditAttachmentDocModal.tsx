import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Paperclip, 
  FileText, 
  Clock, 
  Building2, 
  CheckCircle2, 
  ShieldCheck,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Company, Auditor, AuditContractRecord } from '../types';

export interface AttachmentDocItem {
  id: string;
  docType: string;
  title: string;
  date: string;
  summary: string;
  status: string;
  fileLinkType: 'f19-002' | 'f19-003' | 'biz-cert' | 'generic';
}

interface AuditAttachmentDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  auditInfo: {
    auditDate: string;
    auditType: string;
    leadAuditor: string;
  };
  attachments: AttachmentDocItem[];
}

export const AuditAttachmentDocModal: React.FC<AuditAttachmentDocModalProps> = ({
  isOpen,
  onClose,
  company,
  auditInfo,
  attachments
}) => {
  const [activeDocId, setActiveDocId] = useState<string>(attachments[0]?.id || '');

  if (!isOpen) return null;

  const currentDoc = attachments.find(a => a.id === activeDocId) || attachments[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col h-[90vh] max-h-[92vh]">
        
        {/* Modal Top Header Bar */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between no-print border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  심사 회차별 공식 부속서류철
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/40">
                  {auditInfo.auditType}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                기업명: <strong className="text-white">{company.companyName}</strong> · 심사일정: <span className="font-mono text-slate-300">{auditInfo.auditDate}</span> · 팀장: {auditInfo.leadAuditor}
              </p>
            </div>
          </div>

          {/* Document Sub Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl text-xs font-bold max-w-[50%] overflow-x-auto">
            {attachments.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setActiveDocId(doc.id)}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  currentDoc?.id === doc.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {doc.fileLinkType === 'f19-002' && <FileText className="w-3.5 h-3.5" />}
                {doc.fileLinkType === 'f19-003' && <Clock className="w-3.5 h-3.5" />}
                {doc.fileLinkType !== 'f19-002' && doc.fileLinkType !== 'f19-003' && <Paperclip className="w-3.5 h-3.5" />}
                <span>{doc.title}</span>
              </button>
            ))}
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="창 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-purple-50/90 border-b border-purple-100 p-2.5 px-6 flex flex-wrap items-center justify-between gap-2 no-print shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-950 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
              <span>현재 서류:</span>
            </span>
            <span className="font-semibold text-slate-800">{currentDoc?.docType}</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              {currentDoc?.status}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            등록일자: {currentDoc?.date}
          </div>
        </div>

        {/* Scrollable Document Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 text-xs leading-relaxed overflow-y-auto flex-1 min-h-0 bg-white print:p-0">
          
          {/* 1. F19-002 인증변경신청서 뷰어 */}
          {currentDoc?.fileLinkType === 'f19-002' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs leading-normal font-sans text-slate-900 bg-white p-4 sm:p-6 border border-slate-300 rounded-lg shadow-2xs">
              <div className="border-b-2 border-slate-900 pb-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">지엠에스씨에스(주) 경영시스템 인증원</p>
                  <p className="text-slate-600">서식번호: F19-002 (Rev. 20240301)</p>
                </div>
                <div className="sm:text-right mt-1 sm:mt-0 text-slate-700 font-mono">
                  <p>접수번호: GMS-CHG-20260908</p>
                </div>
              </div>

              <div className="text-center py-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-[0.4em] indent-[0.4em]">
                  인증 변경 신청서
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  (Application for Change of Certification)
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-700 text-xs">
                <tbody>
                  <tr className="border-b border-slate-400">
                    <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">신청기업명</th>
                    <td className="p-2 border-r border-slate-400 font-bold text-slate-900">{company.companyName}</td>
                    <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">대표자</th>
                    <td className="p-2 text-slate-900">{company.ceoName}</td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">사업자번호</th>
                    <td className="p-2 border-r border-slate-400 font-mono text-slate-900">{company.bizNumber || '214-88-92810'}</td>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">인증규격</th>
                    <td className="p-2 text-slate-900">ISO 9001 / ISO 14001</td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">변경 구분</th>
                    <td className="p-2 text-purple-900 font-bold" colSpan={3}>
                      ☑ 사업장 추가 / 인증범위 확대 &nbsp;&nbsp; ☐ 상호/대표자 변경 &nbsp;&nbsp; ☐ 소재지 이전
                    </td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">변경 사유 및 세부 내역</th>
                    <td className="p-3 leading-relaxed text-slate-900" colSpan={3}>
                      <p className="font-semibold text-slate-900 mb-1">1. 변경 사유:</p>
                      <p className="text-slate-700 pl-2">{currentDoc.summary}</p>
                      <p className="font-semibold text-slate-900 mt-2 mb-1">2. 변경 후 인증범위:</p>
                      <p className="text-slate-700 pl-2">{company.scope || '자동차 및 선박용 주조물 제작 및 정밀가공'}</p>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 border border-slate-300 rounded-lg bg-slate-50 text-[11px] text-slate-700 leading-relaxed">
                <p>위와 같이 경영시스템 인증 변경을 신청하며, 제출된 서류가 사실과 다름없음을 확인합니다.</p>
                <div className="pt-3 flex justify-between items-center text-slate-800">
                  <span className="font-mono">신청일자: {currentDoc.date}</span>
                  <span>신청인: <strong>{company.ceoName}</strong> (서명/인)</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. F19-003 주말/공휴일 심사사유서 뷰어 */}
          {currentDoc?.fileLinkType === 'f19-003' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs leading-normal font-sans text-slate-900 bg-white p-4 sm:p-6 border border-slate-300 rounded-lg shadow-2xs">
              <div className="border-b-2 border-slate-900 pb-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">지엠에스씨에스(주) 경영시스템 인증원</p>
                  <p className="text-slate-600">서식번호: F19-003 (Rev. 20240301)</p>
                </div>
                <div className="sm:text-right mt-1 sm:mt-0 text-slate-700 font-mono">
                  <p>관리번호: GMS-WKD-20260908</p>
                </div>
              </div>

              <div className="text-center py-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-[0.4em] indent-[0.4em]">
                  휴일(주말) 심사 사유서
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  (Weekend &amp; Holiday Audit Justification Statement)
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-700 text-xs">
                <tbody>
                  <tr className="border-b border-slate-400">
                    <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">피심사기업</th>
                    <td className="p-2 border-r border-slate-400 font-bold text-slate-900">{company.companyName}</td>
                    <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사팀장</th>
                    <td className="p-2 text-slate-900">{auditInfo.leadAuditor}</td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사일정</th>
                    <td className="p-2 border-r border-slate-400 font-mono text-slate-900" colSpan={3}>
                      {auditInfo.auditDate} (토요일 정상 가동)
                    </td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">휴일심사 사유</th>
                    <td className="p-3 leading-relaxed text-slate-900" colSpan={3}>
                      <p className="font-semibold text-amber-950 mb-1">■ 현장 가동 및 심사 수행 타당성:</p>
                      <p className="text-slate-700 pl-2">
                        {currentDoc.summary || '주말(토) 정상 생산 라인 가동 및 품질/생산 실무 관리자 전원 정상 근무에 따라 현장 심사를 수행함.'}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 border border-slate-300 rounded-lg bg-amber-50/50 text-[11px] text-slate-700 leading-relaxed">
                <p>본 심사는 한국인정지원센터(KAB) 인정기준 및 당원 심사운영규정에 의거하여 상호 합의 하에 정당하게 진행됨을 확인합니다.</p>
                <div className="pt-3 flex justify-between items-center text-slate-800">
                  <span className="font-mono">확인일자: {currentDoc.date}</span>
                  <span>기업 대표 / 담당 심사팀장 연명 날인 [승인완료]</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. 기타 일반 부속서류 (사업자등록증명원 / 등기부 등) */}
          {currentDoc?.fileLinkType !== 'f19-002' && currentDoc?.fileLinkType !== 'f19-003' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs leading-normal font-sans text-slate-900 bg-white p-4 sm:p-6 border border-slate-300 rounded-lg shadow-2xs">
              <div className="border-b-2 border-slate-900 pb-2 flex justify-between text-[11px] text-slate-700">
                <p className="font-semibold text-slate-900">공식 첨부 증빙 서류</p>
                <p className="font-mono">{currentDoc.date}</p>
              </div>

              <div className="text-center py-3">
                <h1 className="text-xl md:text-2xl font-black text-slate-900">
                  {currentDoc.docType}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  피심사기업: {company.companyName}
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-medium">서류명:</span>
                  <span className="font-bold text-slate-900">{currentDoc.docType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-medium">관련 심사:</span>
                  <span className="font-semibold text-slate-900">{auditInfo.auditType} ({auditInfo.auditDate})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-medium">보관 및 검증 상태:</span>
                  <span className="font-bold text-emerald-800">{currentDoc.status}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-500 font-medium block mb-1">증빙 내용 요약:</span>
                  <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                    {currentDoc.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 p-4 px-6 border-t border-slate-200 flex items-center justify-between no-print shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>A4 공문 인쇄</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
