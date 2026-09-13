import React from 'react';
import { 
  X, 
  Printer, 
  FileCheck, 
  Building2, 
  ShieldCheck, 
  DollarSign
} from 'lucide-react';
import { AuditContractRecord } from '../types';

interface StandardContractViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: AuditContractRecord;
}

export const StandardContractViewModal: React.FC<StandardContractViewModalProps> = ({
  isOpen,
  onClose,
  contract
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span>F16-004 인증심사 표준계약서</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                  {contract.contractNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                KAB 인정 공인 인증심사 용역 표준계약서 및 5대 심사비용 명세표
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Document Body (A4 Style) */}
        <div className="p-8 space-y-6 text-slate-900 text-xs leading-relaxed max-h-[75vh] overflow-y-auto">
          
          <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
            <span className="text-xs font-bold text-slate-400">서식번호: F16-004 (Rev. 20240229)</span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              경영시스템 인증심사 표준계약서
            </h1>
            <p className="text-xs text-slate-500">
              (Global Management System Certification Service Standard Contract)
            </p>
          </div>

          {/* 당사자 정보 테이블 */}
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
                <td className="border border-slate-300 p-2">피심사기업 대표자 (인/서명)</td>
                <th className="border border-slate-300 bg-slate-100 p-2 text-center">대표이사</th>
                <td className="border border-slate-300 p-2 font-bold text-slate-800">________________________ (직인/서명)</td>
              </tr>
              <tr>
                <th className="border border-slate-300 bg-slate-100 p-2 text-center">소재지</th>
                <td className="border border-slate-300 p-2">본사 및 등록 주사업장</td>
                <th className="border border-slate-300 bg-slate-100 p-2 text-center">인증원 주소</th>
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

          {/* 심사 대상 규격 */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-700 block text-xs">인증 서비스 범위 (심사 대상 규격):</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {contract.standards.map(s => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-white border border-slate-300 font-bold text-slate-800 text-[11px]">
                  {s}
                </span>
              ))}
              {contract.addedStandards && contract.addedStandards.map(s => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 font-bold text-emerald-800 text-[11px]">
                  +{s} (추가규격)
                </span>
              ))}
            </div>
          </div>

          {/* ★ 핵심: 5대 공식 심사비용 상세 명세표 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-cyan-600" />
                <span>심사비용 5대 구성 명세표 (부가가치세 별도)</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                KAB 기준 M/D: <strong className="text-slate-900 font-mono">{contract.kabStandardMd.toFixed(1)} MD</strong> · 적용 단가: <strong className="text-cyan-700 font-mono">₩{contract.ratePerMd.toLocaleString()}</strong>/MD
              </span>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="border border-slate-300 p-2 text-left">비용 구분 (5대 공식 항목)</th>
                  <th className="border border-slate-300 p-2 text-center w-28">투입 일수 (MD)</th>
                  <th className="border border-slate-300 p-2 text-center w-28">적용 단가 (₩)</th>
                  <th className="border border-slate-300 p-2 text-right w-36">청구 금액 (₩)</th>
                  <th className="border border-slate-300 p-2 text-left">비고 및 산출 근거</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="border border-slate-300 p-2 font-bold text-slate-800">1. 문서심사비 (1단계)</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">{contract.docAuditMd.toFixed(1)} MD</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">₩{contract.ratePerMd.toLocaleString()}</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">₩{contract.docAuditFee.toLocaleString()}</td>
                  <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">매뉴얼/절차서 문서 검토</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-bold text-slate-800">2. 현장심사비 (2단계/정기)</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">{contract.onsiteAuditMd.toFixed(1)} MD</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">₩{contract.ratePerMd.toLocaleString()}</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">₩{contract.onsiteAuditFee.toLocaleString()}</td>
                  <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">사업장 현장 프로세스 실사</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-bold text-slate-800">3. 여비교통비</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">-</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">-</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">₩{contract.travelExpense.toLocaleString()}</td>
                  <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">지역별 규정 여비 실비 청구</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-bold text-slate-800">4. 출장 숙박비</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">{contract.lodgingNights}박</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">
                    {contract.lodgingOption === '업체직접제공' ? '기업부담' : '₩100,000'}
                  </td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                    {contract.lodgingOption === '업체직접제공' ? '₩0 (기업제공)' : `₩${contract.lodgingExpense.toLocaleString()}`}
                  </td>
                  <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">
                    {contract.lodgingOption === '업체직접제공' ? '피심사기업 인근 숙소 직접 예약/제공' : '턴키 일괄 계약비 합산 청구'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-bold text-slate-800">5. 인증 신청 및 등록비</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">-</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">-</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold">₩{contract.applicationFee.toLocaleString()}</td>
                  <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">인증원 및 인정기관 등록 수수료</td>
                </tr>
                <tr className="bg-cyan-50/80 font-black text-slate-900">
                  <td className="border border-slate-300 p-2.5 text-right font-bold text-sm" colSpan={3}>
                    합계 금액 (VAT 별도)
                  </td>
                  <td className="border border-slate-300 p-2.5 text-right font-mono text-base text-cyan-800">
                    ₩{contract.finalFee.toLocaleString()}
                  </td>
                  <td className="border border-slate-300 p-2 text-slate-600 text-[11px]">
                    부가가치세 10% 별도 청구
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 주요 계약 조항 발췌 (F16-004 원본) */}
          <div className="space-y-2 pt-2 border-t border-slate-200 text-[11.5px] text-slate-600">
            <h4 className="font-bold text-slate-800 text-xs">주요 계약 준수 조항:</h4>
            <p><strong>제1조 (목적):</strong> 의뢰인이 인증원에게 의뢰한 경영시스템 인증심사 서비스를 제공함에 있어 필요한 권리 및 의무사항을 정한다.</p>
            <p><strong>제6조 (사후관리심사):</strong> 인증서 발행일 기준 매 1년 이내 사후관리심사를 수검하여야 하며, M/D 기준일수에 따라 실시한다.</p>
            <p><strong>제16조 (심사비용 및 지불):</strong> 모든 심사비는 심사 개시 7일 이전까지 지불함을 원칙으로 하며 부가세 별도 현금 입금한다.</p>
            <p><strong>제17조 (출장비 및 숙박비):</strong> 심사에 소요되는 여비교통비 및 숙박 필요시 비용은 의뢰인의 부담으로 한다.</p>
          </div>

          {/* 직인 날인란 */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-2">
              <span className="font-bold text-slate-500">[의뢰인 (고객사)]</span>
              <p className="font-extrabold text-sm">{contract.companyName}</p>
              <div className="h-16 flex items-center justify-center text-slate-400 border border-dashed border-slate-300 rounded-lg">
                (대표자 인장 직인 날인)
              </div>
            </div>
            <div className="space-y-2">
              <span className="font-bold text-slate-500">[인증기관]</span>
              <p className="font-extrabold text-sm text-cyan-900">지엠에스씨에스(주) (GMSCS)</p>
              <div className="h-16 flex items-center justify-center font-medium text-slate-500 border border-dashed border-slate-300 rounded-lg">
                대표이사 ________________________ (직인/서명)
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-4 px-6 border-t border-slate-200 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500 font-medium">
            승인상태: <strong className="text-slate-900">{contract.approvalStatus}</strong> · 계약번호: {contract.contractNumber}
          </span>

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
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-xs shadow-md transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>공식 계약서 A4 인쇄 / PDF 저장</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
