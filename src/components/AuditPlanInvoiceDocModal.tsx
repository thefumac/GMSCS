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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Control Bar */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Remark 공식 심사계획서 &amp; 청구서
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
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3자 발송 퀵 액션 배너 */}
        <div className="bg-slate-100 p-3 px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs no-print">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Mail className="w-4 h-4 text-cyan-600" />
              <span>3자 공식 메일 발송 현황:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {(['기업', '심사원', '협력기관'] as const).map(target => (
                <span
                  key={target}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    dispatchedTargets.includes(target)
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {target}: {dispatchedTargets.includes(target) ? '발송완료 ✓' : '미발송'}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleSend('기업')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 rounded-lg transition cursor-pointer text-[11px]"
            >
              기업 발송
            </button>
            <button
              type="button"
              onClick={() => handleSend('심사원')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 rounded-lg transition cursor-pointer text-[11px]"
            >
              심사원 발송
            </button>
            {contract.agency && (
              <button
                type="button"
                onClick={() => handleSend('협력기관')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 rounded-lg transition cursor-pointer text-[11px]"
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

        {/* Scrollable Document Content */}
        <div className="p-8 space-y-6 text-slate-900 text-xs leading-relaxed overflow-y-auto flex-1 bg-white print:p-0">
          
          {/* ========================================================= */}
          {/* 1. 심사계획서 공문 (Remark 샘플 PDF 양식 준용) */}
          {/* ========================================================= */}
          {activeDocTab === 'plan' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs leading-normal font-sans text-slate-900 bg-white p-4 sm:p-6 border border-slate-300 rounded-lg">
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
                      GMS-인증- {contract.contractNumber.replace(/[^0-9]/g, '').slice(-8) || '2026052001'}
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
                      {company?.contactPerson || '박광영'} 부장
                    </td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">작성일자</th>
                    <td className="p-2 border-r border-slate-400 font-mono text-slate-900">
                      {contract.contractDate || '2026-05-20'}
                    </td>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">전    화</th>
                    <td className="p-2 font-mono text-slate-900">
                      {company?.contactPhone || '054-956-9197'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-400">
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">대 표 자</th>
                    <td className="p-2 border-r border-slate-400 font-bold text-slate-900">
                      {company?.ceoName || '대표이사'}
                    </td>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">팩    스</th>
                    <td className="p-2 font-mono text-slate-900">
                      054-700-9397
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">고객번호</th>
                    <td className="p-2 font-mono text-slate-900" colSpan={3}>
                      {company?.bizNumber ? 'QE240206 / OH240234' : 'QE240206'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 안내 인사말 */}
              <div className="space-y-1 text-[11.5px] text-slate-800 py-1 leading-relaxed font-medium">
                <p>1. 귀사의 발전과 지속적 개선을 기원합니다.</p>
                <p>2. 아래와 같이 ISO 국제표준에 따른 심사계획서 및 청구내역서를 송부하오니 확인하여 주시기 바랍니다.</p>
                <p>3. 심사비용은 심사 수행 4일전까지 입금하여 주시기 바랍니다.</p>
              </div>

              {/* Ⅰ. 인증현황 */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="font-black text-cyan-950">Ⅰ.</span>
                  <span>인증현황</span>
                </h3>
                <table className="w-full border-collapse border border-slate-700 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">고 객 명</th>
                      <td className="p-2 border-r border-slate-400 font-bold text-slate-900">{contract.companyName}</td>
                      <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사종류</th>
                      <td className="p-2 font-bold text-slate-900">{contract.contractType}</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800" rowSpan={2}>사업장 주소</th>
                      <td className="p-2 border-r border-slate-400" colSpan={3}>
                        <span className="font-semibold text-slate-700 mr-2">주사업장:</span>
                        <span className="text-slate-900">{company?.address || '경북 고령군 다산면 다산산단로 136'}</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="p-2 border-r border-slate-400 text-slate-600" colSpan={3}>
                        <span className="font-semibold text-slate-700 mr-2">사업장1:</span>
                        <span>-</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">인 증 대 상</th>
                      <td className="p-2" colSpan={3}>
                        KSIC (산업분류코드) / <span className="font-bold text-slate-900">인증코드 {company?.iafCode || '17'}</span>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">인 증 범 위</th>
                      <td className="p-2 leading-relaxed text-slate-900" colSpan={3}>
                        {company?.scope || '자동차 및 선박기계, 공작기계, 건설기계, 일반산업기계용 주조물 제작'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ⅱ. 심사기준 */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="font-black text-cyan-950">Ⅱ.</span>
                  <span>심사기준</span>
                </h3>
                <div className="p-2.5 border border-slate-700 bg-slate-50/60 text-xs font-semibold text-slate-900">
                  {contract.standards.join(' & ')} &amp; 관련법규, 고객요구사항, 고객기준문서
                </div>
              </div>

              {/* Ⅲ. 심사의 목적 */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="font-black text-cyan-950">Ⅲ.</span>
                  <span>심사의 목적</span>
                </h3>
                <div className="p-2.5 border border-slate-700 text-xs space-y-1 text-slate-800 leading-normal bg-white">
                  <p>1. 조직의 경영시스템에 대한 심사기준의 적합성을 평가</p>
                  <p>2. 조직의 경영시스템의 효과성 평가 및 잠재적 개선분야 확인</p>
                  <p>3. 법규/규제/계약요구사항 충족/보장을 위한 조직경영시스템의 능력을 평가</p>
                  <p>4. 인증유지 효과성을 결정</p>
                </div>
              </div>

              {/* Ⅳ. 심사일정 및 심사팀 편성 */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="font-black text-cyan-950">Ⅳ.</span>
                  <span>심사일정 및 심사팀</span>
                </h3>
                <table className="w-full border-collapse border border-slate-700 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사일자</th>
                      <td className="p-2 border-r border-slate-400 font-bold font-mono text-slate-900">
                        {contract.plannedAuditStartDate || '2026-06-08'} ~ {contract.plannedAuditEndDate || '2026-06-10'} ({contract.appliedMd}일간, {contract.appliedMd} M/D)
                      </td>
                      <th className="w-32 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">차기심사종류/일수</th>
                      <td className="p-2 font-bold text-slate-900">
                        {contract.contractType === '신규인증' ? '사후1차' : '갱신'} / 추후통보 M/D
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 심사팀 편성 테이블 */}
                <table className="w-full border-collapse border border-slate-700 text-xs text-center">
                  <thead className="bg-slate-100 border-b border-slate-400 font-bold text-slate-800">
                    <tr>
                      <th className="p-1.5 border-r border-slate-400 w-24">역할</th>
                      <th className="p-1.5 border-r border-slate-400 w-24">소속</th>
                      <th className="p-1.5 border-r border-slate-400 w-28">성명</th>
                      <th className="p-1.5">연락처 / 이메일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-900">
                    <tr>
                      <td className="p-1.5 border-r border-slate-400 font-bold">심사팀장</td>
                      <td className="p-1.5 border-r border-slate-400 font-medium">GMS (HQ)</td>
                      <td className="p-1.5 border-r border-slate-400 font-bold">{contract.leadAuditorName || auditor?.name || '김홍덕'}</td>
                      <td className="p-1.5 font-mono text-[11px]">
                        {auditor?.mobile || '010-3797-1563'} / {auditor?.email || 'esggnf@naver.com'}
                      </td>
                    </tr>
                    <tr className="text-slate-500 bg-slate-50/50">
                      <td className="p-1.5 border-r border-slate-400">검증심사원</td>
                      <td className="p-1.5 border-r border-slate-400">-</td>
                      <td className="p-1.5 border-r border-slate-400">-</td>
                      <td className="p-1.5 font-mono text-[11px]">-</td>
                    </tr>
                    <tr className="text-slate-500 bg-slate-50/50">
                      <td className="p-1.5 border-r border-slate-400">심사원보 / 훈련 / 코드확장</td>
                      <td className="p-1.5 border-r border-slate-400">-</td>
                      <td className="p-1.5 border-r border-slate-400">-</td>
                      <td className="p-1.5 font-mono text-[11px]">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 하단 이의신청 및 공식 고객안내 (결재란 없음 - 공문) */}
              <div className="border border-slate-700 p-3 space-y-2 text-[11px] text-slate-800 leading-normal bg-white mt-3">
                <div className="border-b border-slate-300 pb-2 space-y-1">
                  <p className="font-bold text-slate-900">
                    ▶ 상기 계획과 관련하여 이의가 있을 경우 사유를 기록하여 (FAX 070-8270-2141) 송부 바라며, 접수 후 2일 이내에 연락이 없으실 경우 본 일정으로 확정하겠습니다.
                  </p>
                  <div className="pt-1">
                    <span className="font-semibold text-slate-700">이의 사유: </span>
                    <span className="text-slate-400">__________________________________________________________________________________________</span>
                  </div>
                  <div className="flex flex-wrap justify-end gap-6 text-slate-700 pt-1">
                    <span>작성자 : 직위 : ____________</span>
                    <span>성명 : ____________</span>
                    <span>서명: ____________</span>
                  </div>
                </div>

                <div className="space-y-1 text-slate-600 text-[10.5px]">
                  <p>※ IAF Guide 와 KAB 적용기준에 근거한 인증원 규정 [GSI-03 인증심사일수와 비용기준]에 따라 심사일수가 산정됩니다.</p>
                  <p>※ 귀사는 인증심사전 "인증기준 및 인증등록 조직의 권리와 의무사항" 에 대한 내용을 반드시 숙지하시기 바랍니다.</p>
                  <p className="pl-3">- 위 내용은 인증원 홈페이지 자료실 &lt;인증절차안내서&gt; 로 게재되어 있습니다.</p>
                  <p>※ 심사팀에는 심사원 양성을 위한 심사훈련자 또는 심사팀의 심사수행 검증을 위한 검증심사원이 참석할 수 있으며, 관련비용은 기업에서 부담하지 않습니다.</p>
                  <p>※ ICT를 활용한 원격심사는 전체 심사시간대비 ( &nbsp;&nbsp;&nbsp; )%로 진행됩니다. (해당 시)</p>
                </div>

                <div className="pt-2 border-t border-slate-300 text-[11px] text-slate-800">
                  <p className="font-semibold">
                    ▶ 당인증원은 귀사의 시스템 향상을 위하여 최선을 다하고 있습니다. 심사진행과 관련하여 궁금한 사항이 있으시면 언제라도 귀사의 전담심사원 또는 
                    인증운영담당 ( <strong className="text-slate-900">남효린 주임</strong> ) ( <span className="font-mono">☎ 02-6929-1702</span>, E-mail <span className="font-mono">esggnf@naver.com</span> ) 에게 전화주시면 고객 감동의 정신으로 상세하게 안내하여 드리겠습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. 심사비 청구내역서 (Remark 샘플 PDF 양식 준용) */}
          {/* ========================================================= */}
          {activeDocTab === 'invoice' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs leading-normal font-sans text-slate-900 bg-white p-4 sm:p-6 border border-slate-300 rounded-lg">
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
                      GMS-인증-{contract.contractNumber.replace(/[^0-9]/g, '').slice(-8) || '20260502'}
                    </td>
                    <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">작성일자</th>
                    <td className="p-2 font-mono text-slate-900">
                      {contract.contractDate || '2026-05-20'}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">수 신 처</th>
                    <td className="p-2 border-r border-slate-400 font-bold text-slate-900">
                      {contract.companyName} 대표이사 귀하
                    </td>
                    <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">참    조</th>
                    <td className="p-2 text-slate-900 font-semibold">
                      {company?.contactPerson || '박광영'} 부장
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
                        {contract.plannedAuditStartDate || '2026-06-08'} ~ {contract.plannedAuditEndDate || '2026-06-10'}
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

              {/* 하단 입금 안내 사항 (결재란 없음 - 공문) */}
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
          {/* 3. F16-004 표준계약서 */}
          {/* ========================================================= */}
          {activeDocTab === 'contract' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <span className="text-xs font-bold text-slate-400">서식번호: F16-004 (Rev. 20240229)</span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  경영시스템 인증심사 표준계약서
                </h1>
                <p className="text-xs text-slate-500">
                  (Global Management System Certification Service Standard Contract)
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-xs">
                <tbody>
                  <tr>
                    <th className="border border-slate-300 bg-slate-100 p-2 text-center w-24">의뢰인(고객)</th>
                    <td className="border border-slate-300 p-2 font-bold">{contract.companyName}</td>
                    <th className="border border-slate-300 bg-slate-100 p-2 text-center w-24">인증원</th>
                    <td className="border border-slate-300 p-2 font-bold">지엠에스씨에스(주) (GMSCS)</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-100 p-2 text-center">대표자</th>
                    <td className="border border-slate-300 p-2">{company?.ceoName || '대표이사'} (서명/인)</td>
                    <th className="border border-slate-300 bg-slate-100 p-2 text-center">대표이사</th>
                    <td className="border border-slate-300 p-2 font-bold text-cyan-900">남 경 호 (서명/인)</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-100 p-2 text-center">소재지</th>
                    <td className="border border-slate-300 p-2">{company?.address || '등록 사업장 주소'}</td>
                    <th className="border border-slate-300 bg-slate-100 p-2 text-center">소재지</th>
                    <td className="border border-slate-300 p-2">서울특별시 강서구 강서로 406, 905호</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-100 p-2 text-center">계약일자</th>
                    <td className="border border-slate-300 p-2 font-mono font-bold">{contract.contractDate}</td>
                    <th className="border border-slate-300 bg-slate-100 p-2 text-center">계약유형</th>
                    <td className="border border-slate-300 p-2 font-bold text-indigo-700">{contract.contractType}</td>
                  </tr>
                </tbody>
              </table>

              <div className="space-y-3 text-slate-700 leading-relaxed text-[11px] p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <strong>제1조 (계약의 목적)</strong> 의뢰인이 인증원에게 의뢰한 경영시스템 인증심사 서비스를 제공하는데 있어 필요한 제반 권리 및 의무사항을 정하여 준수하기 위함이다.
                </div>
                <div>
                  <strong>제2조 (인증 서비스 범위)</strong> {contract.standards.join(', ')} 인증심사는 의뢰인의 사업장 및 해당현장에서 수행하는 제품, 활동, 서비스에 대하여 진행된다.
                </div>
                <div>
                  <strong>제3조 (심사비용 및 지불)</strong> 모든 심사비용은 상호 합의된 ₩{contract.finalFee.toLocaleString()}원 (VAT 별도 ₩{vat.toLocaleString()}원, 합계 ₩{totalWithVat.toLocaleString()}원)으로 하며, 심사 개시 7일 이전까지 인증원의 지정계좌에 현금으로 지불한다.
                </div>
                <div>
                  <strong>제4조 (계약기간)</strong> 본 계약의 유효기간은 계약체결일로부터 3년간으로 하며, 갱신심사 시 재계약을 통해 연장할 수 있다.
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
