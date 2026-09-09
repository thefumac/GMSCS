import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Search, 
  FileSpreadsheet, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download,
  Filter,
  Users
} from 'lucide-react';
import { Auditor, AuditorSettlement } from '../types';

interface AuditorSettlementManagerProps {
  settlements: AuditorSettlement[];
  currentAuditor?: Auditor | null; // null이면 사무국 관리자 모드
  allAuditors: Auditor[];
  onUpdateSettlementStatus?: (settlementId: string, status: '정산대기' | '지급완료') => void;
}

export const AuditorSettlementManager: React.FC<AuditorSettlementManagerProps> = ({
  settlements: initialSettlements,
  currentAuditor,
  allAuditors,
  onUpdateSettlementStatus,
}) => {
  const [settlements, setSettlements] = useState<AuditorSettlement[]>(initialSettlements);
  
  // Filters
  const [selectedAuditorId, setSelectedAuditorId] = useState<string>(
    currentAuditor ? currentAuditor.id : 'all'
  );
  const [yearFilter, setYearFilter] = useState<string>('2026');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 심사원 모드일 땐 자신의 ID로 강제 고정
  const effectiveAuditorId = currentAuditor ? currentAuditor.id : selectedAuditorId;

  const filteredSettlements = settlements.filter(s => {
    const matchesAuditor = effectiveAuditorId === 'all' || s.auditorId === effectiveAuditorId;
    const matchesYear = yearFilter === 'all' || s.year.toString() === yearFilter;
    const matchesDate = (!startDate || s.settlementDate >= startDate) && (!endDate || s.settlementDate <= endDate);
    const matchesStatus = statusFilter === 'all' || s.payoutStatus === statusFilter;
    const matchesSearch = s.companyName.includes(searchQuery) || s.auditorName.includes(searchQuery);
    return matchesAuditor && matchesYear && matchesDate && matchesStatus && matchesSearch;
  });

  const totalGross = filteredSettlements.reduce((acc, s) => acc + s.payoutAmount, 0);
  const totalTax = filteredSettlements.reduce((acc, s) => acc + s.taxWithheld, 0);
  const totalNet = filteredSettlements.reduce((acc, s) => acc + s.netPayout, 0);
  const paidCount = filteredSettlements.filter(s => s.payoutStatus === '지급완료').length;
  const pendingCount = filteredSettlements.filter(s => s.payoutStatus === '정산대기').length;

  const handleToggleStatus = (id: string) => {
    setSettlements(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus: '정산대기' | '지급완료' = s.payoutStatus === '지급완료' ? '정산대기' : '지급완료';
        const updated: AuditorSettlement = {
          ...s,
          payoutStatus: nextStatus,
          paidDate: nextStatus === '지급완료' ? new Date().toISOString().substring(0, 10) : undefined
        };
        if (onUpdateSettlementStatus) onUpdateSettlementStatus(id, nextStatus);
        return updated;
      }
      return s;
    }));
  };

  const activeAuditorObj = allAuditors.find(a => a.id === effectiveAuditorId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                심사비용 정산 &amp; 심사원 수익 관리
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {currentAuditor ? (
                  <span>
                    <strong>{currentAuditor.name}</strong> 님의 연도별/기간별 심사 수당 및 원천징수 명세서
                  </span>
                ) : (
                  <span>사무국 총괄 심사원별 수당 정산 및 원천징수(3.3%) 대사 원장</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Account Info Card */}
        {activeAuditorObj?.bankAccount && (
          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs">
            <CreditCard className="w-4 h-4 text-cyan-600" />
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">지급 등록 계좌</span>
              <span className="font-mono font-bold text-slate-800">{activeAuditorObj.bankAccount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">총 심사 수당 (원천징수 전)</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ₩{totalGross.toLocaleString()}
          </h3>
          <span className="text-[11px] text-cyan-700 font-semibold mt-1 block">
            조회 대상 {filteredSettlements.length}건 합계
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">사업소득 원천징수 (3.3%)</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1 font-mono">
            -₩{totalTax.toLocaleString()}
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
            소득세 3% + 지방소득세 0.3%
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">실 수령액 (통장 입금액)</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            ₩{totalNet.toLocaleString()}
          </h3>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
            원천징수 후 실 지급액
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">정산 완료 / 대기 현황</span>
          <div className="flex items-center space-x-3 mt-1.5">
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              지급완료 {paidCount}건
            </span>
            <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              대기 {pendingCount}건
            </span>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 심사원 셀렉터 (관리자일 때만 노출) */}
          {!currentAuditor && (
            <div className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <select
                value={selectedAuditorId}
                onChange={(e) => setSelectedAuditorId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="all">전체 심사원</option>
                {allAuditors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 연도 빠른 선택 */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setYearFilter('2026');
                setStartDate('2026-01-01');
                setEndDate('2026-12-31');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                yearFilter === '2026' ? 'bg-white text-cyan-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              2026년
            </button>
            <button
              onClick={() => {
                setYearFilter('2025');
                setStartDate('2025-01-01');
                setEndDate('2025-12-31');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                yearFilter === '2025' ? 'bg-white text-cyan-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              2025년
            </button>
            <button
              onClick={() => {
                setYearFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                yearFilter === 'all' ? 'bg-white text-cyan-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              전체
            </button>
          </div>

          {/* 기간 지정 입력 */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-800 font-mono text-[11px] focus:outline-none"
            />
            <span className="text-slate-400">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-800 font-mono text-[11px] focus:outline-none"
            />
          </div>

          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:outline-none"
          >
            <option value="all">전체 상태</option>
            <option value="지급완료">지급 완료</option>
            <option value="정산대기">정산 대기</option>
          </select>
        </div>

        {/* Search & Export */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="기업명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-slate-800 text-xs w-40 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>명세서 인쇄</span>
          </button>
        </div>
      </div>

      {/* Settlement Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">정산일자 / 심사일</th>
                <th className="p-3.5">심사원명</th>
                <th className="p-3.5">피심사 대상 기업</th>
                <th className="p-3.5">심사 유형 / 규격</th>
                <th className="p-3.5 text-center">투입 MD</th>
                <th className="p-3.5 text-right">심사 수당 (원)</th>
                <th className="p-3.5 text-right">원천세 (3.3%)</th>
                <th className="p-3.5 text-right">실지급액 (원)</th>
                <th className="p-3.5 text-center">지급 상태</th>
                {!currentAuditor && <th className="p-3.5 text-right">사무국 조치</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-medium">
                    선택하신 조건에 해당하는 정산 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <strong className="text-slate-900 font-mono block">{s.settlementDate}</strong>
                      <span className="text-[11px] text-slate-400">{s.auditDates}</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {s.auditorName}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {s.companyName}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800">{s.auditType}</span>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {s.standards.join(', ')}
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-cyan-700">
                      {s.appliedMd} MD
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-800">
                      ₩{s.payoutAmount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-mono text-rose-600">
                      -₩{s.taxWithheld.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-emerald-600">
                      ₩{s.netPayout.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.payoutStatus === '지급완료'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {s.payoutStatus}
                      </span>
                      {s.paidDate && (
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                          {s.paidDate} 입금
                        </span>
                      )}
                    </td>
                    {!currentAuditor && (
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleStatus(s.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            s.payoutStatus === '지급완료'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
                          }`}
                        >
                          {s.payoutStatus === '지급완료' ? '대기로 변경' : '지급완료 처리'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
