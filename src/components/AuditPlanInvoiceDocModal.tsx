import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Mail, 
  Send, 
  FileText, 
  Receipt, 
  FileCheck, 
  Building2, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { AuditContractRecord, Company, Auditor } from '../types';

interface AuditPlanInvoiceDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: AuditContractRecord;
  company?: Company;
  auditor?: Auditor;
  onDispatchEmail?: (target: '기업' | '심사원' | '협력기관' | 'all') => void;
}

export const AuditPlanInvoiceDocModal: React.FC<AuditPlanInvoiceDocModalProps> = ({
  isOpen,
  onClose,
  contract,
  company,
  auditor,
  onDispatchEmail
}) => {
  const [activeDocTab, setActiveDocTab] = useState<'plan' | 'invoice' | 'contract'>('plan');
  const [dispatchedTargets, setDispatchedTargets] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSend = (target: '기업' | '심사원' | '협력기관' | 'all') => {
    if (target === 'all') {
      setDispatchedTargets(['기업', '심사원', '협력기관']);
      alert(`[3자 일괄 스마트 메일 발송 완료]\n\n1. 피심사기업: ${company?.contactEmail || '고객사'}\n2. 담당심사원: ${auditor?.email || '심사팀장'}\n3. 협력기관: ${contract.agency || '영업협력기관'}\n\n심사계획서 및 심사청구서가 3자에게 성공적으로 송부되었습니다.`);
    } else {
      setDispatchedTargets(prev => Array.from(new Set([...prev, target])));
      alert(`[${target} 메일 발송 완료]\n${target} 담당자에게 공식 공문 서식이 성공적으로 발송되었습니다.`);
    }
    if (onDispatchEmail) {
      onDispatchEmail(target);
    }
  };

  const vat = Math.round(contract.finalFee * 0.1);
  const totalWithVat = contract.finalFee + vat;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col h-[90vh] max-h-[92vh]">
        
        {/* Modal Top Control Bar */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between no-print border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  공식 심사계획서 &amp; 표준계약서
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40">
                  {contract.contractNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                피심사기업: <strong className="text-white">{contract.companyName}</strong> · 심사구분: <strong className="text-cyan-300">{contract.contractType}</strong>
              </p>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveDocTab('plan')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeDocTab === 'plan'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>심사계획서 공문</span>
            </button>
            <button
              onClick={() => setActiveDocTab('invoice')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeDocTab === 'invoice'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>심사비 청구서</span>
            </button>
            <button
              onClick={() => setActiveDocTab('contract')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeDocTab === 'contract'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>F16-004 표준계약서</span>
            </button>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="창 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3자 스마트 메일 발송 액션 바 */}
        <div className="bg-cyan-50/90 border-b border-cyan-100 p-2.5 px-6 flex flex-wrap items-center justify-between gap-2 no-print shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-950 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-cyan-700" />
              <span>3자 스마트 메일 발송:</span>
            </span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={`px-2 py-0.5 rounded-md font-semibold ${dispatchedTargets.includes('기업') ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                1. 피심사기업 {dispatchedTargets.includes('기업') ? '✓ 발송됨' : '(대기)'}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-semibold ${dispatchedTargets.includes('심사원') ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                2. 담당심사원 {dispatchedTargets.includes('심사원') ? '✓ 발송됨' : '(대기)'}
              </span>
              {contract.agency && (
                <span className={`px-2 py-0.5 rounded-md font-semibold ${dispatchedTargets.includes('협력기관') ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                  3. {contract.agency} {dispatchedTargets.includes('협력기관') ? '✓ 발송됨' : '(대기)'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleSend('기업')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
            >
              기업 발송
            </button>
            <button
              type="button"
              onClick={() => handleSend('심사원')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
            >
              심사원 발송
            </button>
            {contract.agency && (
              <button
                type="button"
                onClick={() => handleSend('협력기관')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
              >
                협력기관 발송
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSend('all')}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-lg transition cursor-pointer shadow-xs text-[11px] flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>3자 일괄 발송</span>
            </button>
          </div>
        </div>

        {/* Scrollable Document Content (min-h-0 ensures child scroll container takes full flex remainder) */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 text-xs leading-relaxed overflow-y-auto flex-1 min-h-0 bg-white print:p-0">
          
          {/* ========================================================= */}
          {/* 1. 심사계획서 공문 (Remark 샘플 PDF 양식 준용) */}
          {/* ========================================================= */}
          {activeDocTab === 'plan' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs leading-normal font-sans text-slate-900 bg-white p-4 sm:p-6 border border-slate-300 rounded-lg shadow-2xs">
              {/* 상단 인증원 헤더 정보 */}
              <div className="border-b-2 border-slate-900 pb-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">서울특별시 강서구 강서로 406, 905호 (등촌동, 동광빌딩)</p>
                  <p className="text-slate-600">http://www.gmscs.co.kr &nbsp;|&nbsp; esggnf@naver.com</p>
                </div>
                <div className="sm:text-right mt-1 sm:mt-0 text-slate-700 font-mono">
                  <p>Tel : 02-6929-1702</p>
                  <p>Fax : 070-8270-2141</p>
                </div>
              </div>

              {/* 공문 제목 */}
              <div className="text-center py-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-[0.6em] indent-[0.6em]">
                  심사계획서
                </h1>
              </div>

              {/* 상단 기본 인적/문서 정보 표 (샘플 원본 구조) */}
              <table className="w-full border-collapse border border-slate-700 text-xs">
                <tbody>
                  <tr className="border-b border-slate-400">
                    <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">문서번호</th>
                    <td className="p-2 border-r border-slate-400 font-mono text-slate-900 font-bold">
                      {contract.contractNumber ? `GMS-인증-${contract.contractNumber.replace(/[^0-9]/g, '').slice(-8) || contract.contractNumber}` : ''}
                    </td>
                    <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">담당부서</th>
                    <td className="p-2 text-slate-900">-</td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">수 신 처</th>
                    <td className="p-2 border-r border-slate-400 font-bold text-slate-900">
                      {contract.companyName} 대표이사 귀하
                    </td>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">담당자/직책</th>
                    <td className="p-2 text-slate-900 font-semibold">
                      {company?.contactPerson || ''}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">작성일자</th>
                    <td className="p-2 border-r border-slate-400 font-mono text-slate-900">
                      {contract.contractDate || ''}
                    </td>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">전    화</th>
                    <td className="p-2 font-mono text-slate-900">
                      {company?.contactPhone || ''}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">대 표 자</th>
                    <td className="p-2 border-r border-slate-400 font-bold text-slate-900">
                      {company?.ceoName || ''}
                    </td>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">팩    스</th>
                    <td className="p-2 font-mono text-slate-900">
                      {(company as any)?.contactFax || (company as any)?.fax || ''}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">주    소</th>
                    <td className="p-2 border-r border-slate-400 text-slate-900" colSpan={3}>
                      {company?.address || ''}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">인증범위</th>
                    <td className="p-2 border-r border-slate-400 text-slate-900 font-medium" colSpan={3}>
                      {company?.scope ? (
                        <span>{company.scope}</span>
                      ) : (
                        <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          ※ 심사시 인증범위를 반드시 기록하십시오 (신규 심사)
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">적용규격</th>
                    <td className="p-2 border-r border-slate-400 font-semibold text-slate-900">
                      {contract.standards.join(', ')}
                    </td>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사종류</th>
                    <td className="p-2 font-semibold text-slate-900">
                      {contract.contractType}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사팀장</th>
                    <td className="p-2 border-r border-slate-400 font-bold text-slate-900">
                      {contract.leadAuditorName || auditor?.name || ''}
                    </td>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사팀원</th>
                    <td className="p-2 text-slate-900">
                      -
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사일자</th>
                    <td className="p-2 border-r border-slate-400 font-mono text-slate-900" colSpan={3}>
                      {contract.plannedAuditStartDate || ''}{contract.plannedAuditEndDate ? ` ~ ${contract.plannedAuditEndDate}` : ''}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 본문 안내문 (Remark 표준 공문 문구) */}
              <div className="space-y-1.5 text-slate-800 text-[11px] leading-relaxed py-1">
                <p>1. 귀사의 무궁한 발전을 기원합니다.</p>
                <p>2. 귀사에서 신청하신 경영시스템 인증심사를 다음과 같이 실시하고자 하오니 협조하여 주시기 바랍니다.</p>
                <p>3. 아울러 원활한 심사 진행을 위하여 심사팀장의 요청사항에 적극 협조하여 주시기 바랍니다.</p>
                <p className="pl-4 text-slate-600">
                  가. 심사 일정은 현장 상황 및 진행 속도에 따라 일부 조정될 수 있습니다.<br />
                  나. 심사 준비물 : 표준 운영 절차서, 최근 내부심사 및 경영검토 결과, 관련 법규 등록부 등<br />
                  다. 심사팀에 대한 안전보호구 지급 및 안전수칙 안내 협조 요청
                </p>
              </div>

              {/* 하단 발신인 직인 영역 */}
              <div className="pt-4 border-t border-slate-300 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-mono">
                  GMSCS-FORM-AUDIT-PLAN (Rev.4)
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-950 tracking-wider">
                    지엠에스씨에스 주식회사 대표이사 [직인생략]
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. 심사비 청구내역서 (INVOICE - Remark 샘플 양식 준용) */}
          {/* ========================================================= */}
          {activeDocTab === 'invoice' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs leading-normal font-sans text-slate-900 bg-white p-4 sm:p-6 border border-slate-300 rounded-lg shadow-2xs">
              {/* 상단 인증원 헤더 정보 */}
              <div className="border-b-2 border-slate-900 pb-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">서울특별시 강서구 강서로 406, 905호 (등촌동, 동광빌딩)</p>
                  <p className="text-slate-600">http://www.gmscs.co.kr &nbsp;|&nbsp; esggnf@naver.com</p>
                  <p className="font-mono text-slate-700">Tel : 02-6929-1702 &nbsp;|&nbsp; Fax : 070-8270-2141</p>
                </div>
                <div className="sm:text-right mt-2 sm:mt-0 flex flex-col items-start sm:items-end justify-between">
                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-bold text-xs rounded-xs tracking-wider">
                    ESG with GMSCS !
                  </span>
                </div>
              </div>

              {/* 제목 */}
              <div className="text-center py-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-[0.6em] indent-[0.6em]">
                  청구내역서
                </h1>
                <p className="text-xs font-bold text-slate-500 tracking-[0.3em] mt-1 font-mono">
                  INVOICE
                </p>
              </div>

              {/* 상단 메타데이터 표 */}
              <table className="w-full border-collapse border border-slate-700 text-xs">
                <tbody>
                  <tr className="border-b border-slate-400">
                    <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">청구번호</th>
                    <td className="p-2 border-r border-slate-400 font-mono font-bold text-slate-900">
                      {contract.contractNumber ? `GMS-인증-${contract.contractNumber.replace(/[^0-9]/g, '').slice(-8) || contract.contractNumber}` : ''}
                    </td>
                    <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">작성일자</th>
                    <td className="p-2 font-mono text-slate-900">
                      {contract.contractDate || ''}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">수 신 처</th>
                    <td className="p-2 border-r border-slate-400 font-bold text-slate-900">
                      {contract.companyName} 대표이사 귀하
                    </td>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">참    조</th>
                    <td className="p-2 text-slate-900 font-semibold">
                      {company?.contactPerson || ''}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ■ 인증심사 비용 */}
              <div className="space-y-2 pt-1">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-900 inline-block"></span>
                  <span>인증심사 비용</span>
                </h3>

                {/* 심사 개요 요약 표 */}
                <table className="w-full border-collapse border border-slate-700 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">기업명</th>
                      <td className="p-2 border-r border-slate-400 font-bold text-slate-900" colSpan={3}>
                        {contract.companyName}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">인증표준</th>
                      <td className="p-2 border-r border-slate-400 font-semibold text-slate-900" colSpan={3}>
                        {contract.standards.join(' & ')}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">인증범위</th>
                      <td className="p-2 border-r border-slate-400 font-medium text-slate-900" colSpan={3}>
                        {company?.scope ? (
                          <span>{company.scope}</span>
                        ) : (
                          <span className="text-teal-800 font-bold bg-teal-50 px-2.5 py-1 rounded border border-teal-300 inline-block text-[11px]">
                            ※ 심사시 심사원에게 인증범위를 알려 주십시오 (신규 심사)
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사종류</th>
                      <td className="p-2 border-r border-slate-400 font-bold text-slate-900">
                        {contract.contractType}
                      </td>
                      <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사형태</th>
                      <td className="p-2 text-slate-900">
                        {contract.contractType === '신규인증' ? '1단계 / 2단계 심사' : '현장 심사'}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사일자</th>
                      <td className="p-2 border-r border-slate-400 font-mono text-slate-900">
                        {contract.plannedAuditStartDate || ''}{contract.plannedAuditEndDate ? ` ~ ${contract.plannedAuditEndDate}` : ''}
                      </td>
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사일수(MD)</th>
                      <td className="p-2 font-mono font-bold text-slate-900">
                        {contract.appliedMd} MD
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 비용 세부 내역 표 (Remark 청구내역서 원본 표 준용) */}
                <table className="w-full border-collapse border border-slate-700 text-xs text-center mt-3">
                  <thead className="bg-slate-100 border-b border-slate-400 font-bold text-slate-800">
                    <tr>
                      <th className="p-2 border-r border-slate-400 w-1/2">구분 / 항목</th>
                      <th className="p-2 border-r border-slate-400 w-1/2">금    액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-900">
                    <tr>
                      <td className="p-2 border-r border-slate-400 font-semibold text-left pl-6">신청비</td>
                      <td className="p-2 font-mono text-right pr-6">₩{contract.applicationFee.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-400 font-semibold text-left pl-6">심사비</td>
                      <td className="p-2 font-mono text-right pr-6 font-bold">₩{(contract.docAuditFee + contract.onsiteAuditFee).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-400 font-semibold text-left pl-6">출장비</td>
                      <td className="p-2 font-mono text-right pr-6">₩{contract.travelExpense.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                      <td className="p-2 border-r border-slate-400 text-left pl-6 text-slate-800">소 계</td>
                      <td className="p-2 font-mono text-right pr-6 text-slate-900">₩{contract.finalFee.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2 border-r border-slate-400 text-left pl-6 text-slate-800">V.A.T</td>
                      <td className="p-2 font-mono text-right pr-6 text-slate-900">₩{vat.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-slate-100 font-black border-t-2 border-slate-700 text-slate-950 text-sm">
                      <td className="p-2.5 border-r border-slate-400 text-left pl-6">총 심사비용</td>
                      <td className="p-2.5 font-mono text-right pr-6 text-cyan-950 font-bold">
                        ₩{totalWithVat.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-white text-slate-600 text-[11px]">
                      <td className="p-2 text-left pl-6 font-medium" colSpan={2}>
                        ★ 숙식비는 미포함 금액이며, 숙박시에는 귀사에 추가 비용이 청구됩니다.
                        {contract.lodgingOption === '턴키포함' && ` (현재 턴키 포함 설정: ₩${contract.lodgingExpense.toLocaleString()})`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 입금계좌 안내 하이라이트 박스 */}
              <div className="my-3 border-2 border-slate-800 p-4 bg-slate-50/60 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-700 block">입금 계좌:</span>
                  <span className="text-base font-black text-slate-950">지엠에스씨에스(주)</span>
                </div>
                <div className="text-center sm:text-right">
                  <span className="text-slate-600 text-xs block font-medium">공식 입금 은행 및 계좌번호</span>
                  <span className="font-mono text-lg font-black text-cyan-950 tracking-wider">
                    기업은행 : 070-4848-2143
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">(또는 010-3797-1563-010)</span>
                </div>
              </div>

              {/* 하단 입금 안내 사항 */}
              <div className="border border-slate-700 p-3 space-y-1.5 text-[11px] text-slate-700 bg-white leading-relaxed">
                <p className="font-semibold text-slate-900">
                  1. 인증심사비는 심사일 4일전까지 입금 바라오며, 기업명으로 입금하여 주시기 바랍니다.
                </p>
                <p className="pl-3 text-slate-600">
                  (미 입금 시 심사가 진행되지 않을 수 있습니다.)
                </p>
                <p className="font-semibold text-slate-900 pt-1">
                  2. 전자계산서는 입금 확인 후 영수로 발송됩니다. 청구 발행이 필요할 시에는 인증원으로 연락바랍니다. (☎ 02-6929-1702 / 010-5818-0601)
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. F16-004 표준계약서 (전문 및 끝까지 스크롤 가능한 본문) */}
          {/* ========================================================= */}
          {activeDocTab === 'contract' && (
            <div className="space-y-6 max-w-3xl mx-auto bg-white p-4 sm:p-6 border border-slate-300 rounded-lg shadow-2xs pb-10">
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <span className="text-xs font-bold text-slate-500 font-mono">서식번호: F16-004 (Rev. 20240229)</span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                  경영시스템 인증심사 표준계약서
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  (Global Management System Certification Service Standard Contract)
                </p>
              </div>

              {/* 계약 당사자 표 */}
              <table className="w-full border-collapse border border-slate-400 text-xs">
                <tbody>
                  <tr>
                    <th className="border border-slate-400 bg-slate-100 p-2.5 text-center w-24 font-bold text-slate-800">의뢰인(고객)</th>
                    <td className="border border-slate-400 p-2.5 font-bold text-slate-900">{contract.companyName}</td>
                    <th className="border border-slate-400 bg-slate-100 p-2.5 text-center w-24 font-bold text-slate-800">인증기관</th>
                    <td className="border border-slate-400 p-2.5 font-bold text-cyan-950">지엠에스씨에스(주) (GMSCS)</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-400 bg-slate-100 p-2.5 text-center font-bold text-slate-800">대표자</th>
                    <td className="border border-slate-400 p-2.5 text-slate-900">{company?.ceoName || ''} (서명/인)</td>
                    <th className="border border-slate-400 bg-slate-100 p-2.5 text-center font-bold text-slate-800">대표이사</th>
                    <td className="border border-slate-400 p-2.5 font-bold text-cyan-900">남 경 호 (서명/인)</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-400 bg-slate-100 p-2.5 text-center font-bold text-slate-800">사업자등록</th>
                    <td className="border border-slate-400 p-2.5 font-mono text-slate-900">{company?.bizNumber || ''}</td>
                    <th className="border border-slate-400 bg-slate-100 p-2.5 text-center font-bold text-slate-800">법인등록</th>
                    <td className="border border-slate-400 p-2.5 font-mono text-slate-900">110111-7489210</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-400 bg-slate-100 p-2.5 text-center font-bold text-slate-800">소재지</th>
                    <td className="border border-slate-400 p-2.5 text-slate-900">{company?.address || ''}</td>
                    <th className="border border-slate-400 bg-slate-100 p-2.5 text-center font-bold text-slate-800">소재지</th>
                    <td className="border border-slate-400 p-2.5 text-slate-900">서울특별시 강서구 강서로 406, 905호</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-400 bg-slate-100 p-2.5 text-center font-bold text-slate-800">계약일자</th>
                    <td className="border border-slate-400 p-2.5 font-mono font-bold text-slate-900">{contract.contractDate || ''}</td>
                    <th className="border border-slate-400 bg-slate-100 p-2.5 text-center font-bold text-slate-800">계약유형</th>
                    <td className="border border-slate-400 p-2.5 font-bold text-indigo-700">{contract.contractType}</td>
                  </tr>
                </tbody>
              </table>

              {/* 표준 계약 조항 전문 (1조 ~ 7조) */}
              <div className="space-y-4 text-slate-800 leading-relaxed text-xs p-5 bg-slate-50 border border-slate-300 rounded-xl">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">제1조 (계약의 목적)</h4>
                  <p className="text-slate-700">본 계약은 의뢰인(이하 "고객"이라 한다)이 인증기관인 지엠에스씨에스(주)(이하 "인증원"이라 한다)에게 의뢰한 경영시스템 인증심사 서비스를 공정하고 객관적으로 제공하는데 있어 필요한 권리와 의무 및 제반 준수사항을 정함을 목적으로 한다.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">제2조 (인증 규격 및 심사 범위)</h4>
                  <p className="text-slate-700">1. 본 계약에 적용되는 인증 규격은 <strong>{contract.standards.join(', ')}</strong> 이며, 심사 범위는 고객이 신청한 제품, 서비스 및 제조 활동 전반을 대상으로 한다.</p>
                  <p className="text-slate-700 mt-1">2. 심사는 인증원의 절차서 및 한국인정지원센터(KAB) 인정기준, IAF 가이드라인에 따라 1단계 문서심사 및 2단계 현장심사(또는 정기 사후관리심사)로 진행된다.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">제3조 (심사비용 및 지불조건)</h4>
                  <p className="text-slate-700">1. 본 심사의 총 비용은 <strong>₩{totalWithVat.toLocaleString()}원</strong> (공급가액 ₩{contract.finalFee.toLocaleString()}원 / VAT ₩{vat.toLocaleString()}원 포함)으로 상호 합의한다.</p>
                  <p className="text-slate-700 mt-1">2. 고객은 심사비용을 심사 착수 4일 전까지 인증원의 공식 지정 계좌(기업은행 070-4848-2143)에 현금으로 입금하여야 한다.</p>
                  <p className="text-slate-700 mt-1">3. 심사원의 숙식비 및 현장 접근에 따른 특별 경비는 상호 협의에 따라 고객이 실비로 제공하거나 별도 정산한다.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">제4조 (고객의 권리와 의무)</h4>
                  <p className="text-slate-700">1. 고객은 심사팀이 원활하게 심사를 진행할 수 있도록 현장 출입 권한, 제반 문서 및 기록의 열람, 관련 직원의 인터뷰에 성실히 협조하여야 한다.</p>
                  <p className="text-slate-700 mt-1">2. 고객은 조직의 중대한 변경(상호, 대표자, 소재지, 인증범위, 직원 수의 현저한 변동 등)이 발생한 경우 지체 없이 인증원에 서면으로 통보하여야 한다.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">제5조 (인증원의 권리와 의무)</h4>
                  <p className="text-slate-700">1. 인증원은 적격성이 검증된 공인 심사원을 배정하여 독립적이고 공정하게 심사를 수행한다.</p>
                  <p className="text-slate-700 mt-1">2. 심사 과정에서 취득한 고객의 모든 경영상·기술상 정보 및 기밀 사항은 관련 법령에 의한 경우를 제외하고는 제3자에게 누설하지 아니한다.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">제6조 (인증서의 발급 및 유효기간)</h4>
                  <p className="text-slate-700">1. 인증서는 심사 완료 후 시정조치 확인 및 인증심의위원회의 최종 승인을 거쳐 발행된다.</p>
                  <p className="text-slate-700 mt-1">2. 인증서의 유효기간은 최초 발행일로부터 3년으로 하며, 매년 주기적인 사후관리심사를 통과하여야 인증의 효력이 유지된다.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">제7조 (계약의 해지 및 분쟁 해결)</h4>
                  <p className="text-slate-700">1. 당사자 일방이 본 계약상의 의무를 중대하게 위반하고 서면 최고 후에도 시정하지 아니하는 경우 계약을 해지할 수 있다.</p>
                  <p className="text-slate-700 mt-1">2. 본 계약과 관련하여 분쟁이 발생하는 경우 상호 신의성실의 원칙에 입각하여 협의하되, 해결되지 아니할 때에는 인증원의 본사 소재지 관할 법원을 제1심 관할 법원으로 한다.</p>
                </div>
              </div>

              {/* 계약 체결 서명 날인란 */}
              <div className="border border-slate-400 p-5 bg-white rounded-xl space-y-4">
                <p className="text-center font-bold text-slate-900 text-xs">
                  위 계약의 성립을 증명하기 위하여 계약서 2부를 작성하여 고객과 인증원이 각각 서명 날인 후 1부씩 보관한다.
                </p>
                <div className="text-center font-mono font-bold text-slate-700 text-xs">
                  {contract.contractDate || ''}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3">
                  <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 space-y-1">
                    <span className="font-bold text-slate-900 block text-xs">[고객(의뢰인)]</span>
                    <p className="text-[11px] text-slate-700">상호 : {contract.companyName}</p>
                    <p className="text-[11px] text-slate-700">주소 : {company?.address || ''}</p>
                    <p className="text-[11px] text-slate-700 flex items-center justify-between pt-2">
                      <span>대표자 : <strong>{company?.ceoName || ''}</strong></span>
                      <span className="text-slate-400 text-xs">(인)</span>
                    </p>
                  </div>

                  <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 space-y-1">
                    <span className="font-bold text-cyan-950 block text-xs">[인증기관]</span>
                    <p className="text-[11px] text-slate-700">상호 : 지엠에스씨에스 주식회사</p>
                    <p className="text-[11px] text-slate-700">주소 : 서울특별시 강서구 강서로 406, 905호</p>
                    <p className="text-[11px] text-slate-700 flex items-center justify-between pt-2">
                      <span>대표이사 : <strong>남 경 호</strong></span>
                      <span className="text-cyan-800 text-xs font-bold">[직인생략]</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 p-4 px-6 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>A4 공문 인쇄</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={() => handleSend('all')}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>3자 일괄 발송 및 승격</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
