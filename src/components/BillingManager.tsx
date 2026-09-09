import React, { useState } from 'react';
import { 
  Receipt, 
  Search
} from 'lucide-react';
import { AuditProject, PaymentStatus, TaxInvoiceStatus } from '../types';

interface BillingManagerProps {
  projects: AuditProject[];
  onUpdatePayment: (projectId: string, paymentStatus: PaymentStatus, taxStatus: TaxInvoiceStatus) => void;
}

export const BillingManager: React.FC<BillingManagerProps> = ({
  projects: initialProjects,
  onUpdatePayment
}) => {
  const [projects, setProjects] = useState<AuditProject[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  const filtered = projects.filter(p => {
    const matchesSearch = p.companyName.includes(searchQuery) || p.leadAuditorName.includes(searchQuery);
    const matchesFilter = filterPayment === 'all' || p.paymentStatus === filterPayment;
    return matchesSearch && matchesFilter;
  });

  const totalBilled = projects.reduce((acc, p) => acc + p.billedAmount, 0);
  const totalPaid = projects.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalUnpaid = totalBilled - totalPaid;

  const handleStatusChange = (projId: string, pStatus: PaymentStatus, tStatus: TaxInvoiceStatus) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          paymentStatus: pStatus,
          taxInvoiceStatus: tStatus,
          paidAmount: pStatus === '입금완료' ? p.billedAmount : pStatus === '미입금' ? 0 : p.paidAmount
        };
      }
      return p;
    }));
    onUpdatePayment(projId, pStatus, tStatus);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500">총 청구액 (VAT 포함)</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            ₩{totalBilled.toLocaleString()}
          </h3>
          <span className="text-[11px] text-cyan-700 font-semibold mt-1 block">심사 프로젝트 {projects.length}건 기준</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500">총 입금 확인액</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
            ₩{totalPaid.toLocaleString()}
          </h3>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
            수납률 {((totalPaid / (totalBilled || 1)) * 100).toFixed(1)}% 달성
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500">미수금 잔액</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
            ₩{totalUnpaid.toLocaleString()}
          </h3>
          <span className="text-[11px] text-rose-700 font-bold mt-1 block">
            미수 건수: {projects.filter(p => p.paymentStatus !== '입금완료').length}건
          </span>
        </div>
      </div>

      {/* Filter & Table Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-sm font-extrabold text-slate-900">
          <Receipt className="w-5 h-5 text-cyan-600" />
          <span>심사비 수납 및 세금계산서 발행 대사 원장</span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="회사명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white w-52"
            />
          </div>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white font-semibold"
          >
            <option value="all">전체 수납 상태</option>
            <option value="미입금">미입금 건</option>
            <option value="부분입금">부분입금 건</option>
            <option value="입금완료">입금완료 건</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">고객사 / 심사 구분</th>
              <th className="p-3.5">심사 일정</th>
              <th className="p-3.5">계획서 발송</th>
              <th className="p-3.5">적용 MD / 최종 심사비</th>
              <th className="p-3.5">청구액 (VAT포함)</th>
              <th className="p-3.5">입금 상태</th>
              <th className="p-3.5">세금계산서</th>
              <th className="p-3.5 text-right">상태 변경</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => {
              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5">
                    <strong className="text-slate-900 text-sm block">{p.companyName}</strong>
                    <span className="text-[11px] text-cyan-800 font-semibold">{p.auditType} · {p.leadAuditorName}</span>
                  </td>

                  <td className="p-3.5 text-slate-700 font-medium">
                    {p.startDate} ~ {p.endDate}
                  </td>

                  <td className="p-3.5">
                    {p.planSentDate ? (
                      <span className="text-emerald-700 font-bold">발송완료 ({p.planSentDate})</span>
                    ) : (
                      <span className="text-slate-400">미발송</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">
                      {p.appliedMd} MD (₩{p.finalFee.toLocaleString()})
                    </div>
                    {p.adjustmentReason && (
                      <div className="text-[10px] text-amber-800 font-medium truncate max-w-[160px]" title={p.adjustmentReason}>
                        {p.adjustmentReason}
                      </div>
                    )}
                  </td>

                  <td className="p-3.5 font-extrabold text-slate-900">
                    ₩{p.billedAmount.toLocaleString()}
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.paymentStatus === '입금완료'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : p.paymentStatus === '부분입금'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : 'bg-rose-50 text-rose-800 border border-rose-300'
                    }`}>
                      {p.paymentStatus}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      p.taxInvoiceStatus === '영수발행'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : p.taxInvoiceStatus === '청구발행'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {p.taxInvoiceStatus}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        const nextPStatus: PaymentStatus = p.paymentStatus === '입금완료' ? '미입금' : '입금완료';
                        const nextTStatus: TaxInvoiceStatus = nextPStatus === '입금완료' ? '영수발행' : '미발행';
                        handleStatusChange(p.id, nextPStatus, nextTStatus);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition"
                    >
                      {p.paymentStatus === '입금완료' ? '미입금 전환' : '입금확인 처리'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
