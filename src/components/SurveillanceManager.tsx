import React, { useState, useMemo } from 'react';
import { 
  BellRing, 
  Clock, 
  User, 
  Send, 
  MessageSquare
} from 'lucide-react';
import { CertContract, Auditor, Company } from '../types';

interface SurveillanceManagerProps {
  contracts: CertContract[];
  auditors: Auditor[];
  companies: Company[];
}

interface EnrichedContract extends CertContract {
  company?: Company;
  auditor?: Auditor;
  diffDays: number;
  urgency: 'D-30 이내 (긴급)' | 'D-60 이내 (경고)' | 'D-90 이내 (예고)' | '정상 여유';
}

export const SurveillanceManager: React.FC<SurveillanceManagerProps> = ({
  contracts,
  auditors,
  companies
}) => {
  const [filterAuditor, setFilterAuditor] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [activeModalContract, setActiveModalContract] = useState<EnrichedContract | null>(null);

  // 기준일: 2026-09-09
  const today = new Date(2026, 8, 9);

  const enrichedContracts = useMemo(() => {
    return contracts.map(cnt => {
      const comp = companies.find(c => c.id === cnt.companyId);
      const auditor = auditors.find(a => a.id === comp?.managingAuditorId);
      
      const dueDate = new Date(cnt.surveillanceDueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let urgency: 'D-30 이내 (긴급)' | 'D-60 이내 (경고)' | 'D-90 이내 (예고)' | '정상 여유';
      if (diffDays <= 30) urgency = 'D-30 이내 (긴급)';
      else if (diffDays <= 60) urgency = 'D-60 이내 (경고)';
      else if (diffDays <= 90) urgency = 'D-90 이내 (예고)';
      else urgency = '정상 여유';

      return {
        ...cnt,
        company: comp,
        auditor,
        diffDays,
        urgency
      };
    });
  }, [contracts, auditors, companies]);

  const filteredList = useMemo(() => {
    return enrichedContracts.filter(item => {
      if (filterAuditor !== 'all' && item.auditor?.id !== filterAuditor) return false;
      if (filterUrgency === 'd30' && item.diffDays > 30) return false;
      if (filterUrgency === 'd60' && (item.diffDays <= 30 || item.diffDays > 60)) return false;
      if (filterUrgency === 'd90' && (item.diffDays <= 60 || item.diffDays > 90)) return false;
      return true;
    }).sort((a, b) => a.diffDays - b.diffDays);
  }, [enrichedContracts, filterAuditor, filterUrgency]);

  const handleSendNotification = (item: EnrichedContract) => {
    alert(`[자동 다단계 알림 발송 완료]\n\n수신처 1: ${item.company?.companyName} 담당자 (${item.company?.contactEmail})\n수신처 2: 담당 심사원 ${item.auditor?.name} (${item.auditor?.mobile})\n채널: 카카오 알림톡(건당 8원) + 이메일\n\n내용: "ISO 사후관리 심사기한(기한: ${item.surveillanceDueDate}, 남은 일수: D-${item.diffDays}일)이 도래했습니다. 심사 일정 수립을 요청드립니다."`);
    setActiveModalContract(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
              <BellRing className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              사후관리 심사 주기 및 3년 만료 일정 추적 엔진
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            KAB 및 국제 규정에 따른 연차별 사후심사(1차/2차) 및 갱신심사 주기를 자동 계산하여 
            <strong className="text-rose-600"> 담당 심사원</strong>과 <strong className="text-cyan-700">피심사기업</strong>에게 다단계 알림을 자동 발송합니다.
          </p>
        </div>

        {/* Action Status */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-xl font-bold">
            D-30 임박: {enrichedContracts.filter(c => c.diffDays <= 30).length}건
          </div>
          <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl font-bold">
            D-60 경고: {enrichedContracts.filter(c => c.diffDays > 30 && c.diffDays <= 60).length}건
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-600" />
            <span className="font-bold text-slate-700">담당 심사원:</span>
            <select
              value={filterAuditor}
              onChange={(e) => setFilterAuditor(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="all">전체 담당 심사원</option>
              {auditors.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.grade})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-600" />
            <span className="font-bold text-slate-700">긴급도(D-day):</span>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="all">전체 일정</option>
              <option value="d30">D-30 이내 (초긴급)</option>
              <option value="d60">D-60 이내 (경고)</option>
              <option value="d90">D-90 이내 (예고)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            alert('D-30 이내 2건의 고객사 및 담당 심사원에게 카카오 알림톡 일괄 자동 발송이 완료되었습니다.');
          }}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-sm shadow-rose-600/20"
        >
          <Send className="w-3.5 h-3.5" />
          <span>D-30 임박건 일괄 알림톡 발송</span>
        </button>
      </div>

      {/* Contracts Surveillance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">고객사 및 인증서 번호</th>
              <th className="p-3.5">인증 규격 / 발행기관</th>
              <th className="p-3.5">담당 심사원</th>
              <th className="p-3.5">차기 사후관리 기한</th>
              <th className="p-3.5 text-center">D-Day 긴급도</th>
              <th className="p-3.5 text-center">3년 유효 만료일</th>
              <th className="p-3.5 text-right">알림 조치</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.map((item) => {
              let badgeColor = 'bg-slate-100 text-slate-700';
              if (item.diffDays <= 30) badgeColor = 'bg-rose-50 text-rose-800 border border-rose-300 font-extrabold animate-pulse';
              else if (item.diffDays <= 60) badgeColor = 'bg-amber-50 text-amber-800 border border-amber-300 font-bold';
              else if (item.diffDays <= 90) badgeColor = 'bg-blue-50 text-blue-800 border border-blue-200 font-medium';

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5">
                    <strong className="text-slate-900 text-sm block">{item.companyName}</strong>
                    <span className="text-[11px] text-slate-500">{item.certNumber}</span>
                  </td>

                  <td className="p-3.5">
                    <div className="text-cyan-800 font-bold">{item.standards.join(', ')}</div>
                    {item.issuerName !== 'GMSCS' ? (
                      <span className="text-[10px] text-amber-700 font-bold">발행: {item.issuerName}</span>
                    ) : (
                      <span className="text-[10px] text-slate-500">발행: GMSCS 직영</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-slate-800">{item.auditor?.name || '미배정'}</div>
                    <div className="text-[10px] text-slate-500">{item.auditor?.mobile}</div>
                  </td>

                  <td className="p-3.5">
                    <span className="font-extrabold text-slate-900 text-sm">{item.surveillanceDueDate}</span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${badgeColor}`}>
                      D-{item.diffDays}일 ({item.urgency})
                    </span>
                  </td>

                  <td className="p-3.5 text-center text-slate-600">
                    {item.validUntil}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setActiveModalContract(item)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 text-cyan-700 border border-slate-200 hover:border-cyan-300 text-xs font-bold transition shadow-xs"
                    >
                      <Send className="w-3 h-3 text-cyan-600" />
                      <span>알림 발송</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Notification Modal */}
      {activeModalContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-600" />
                사후관리 심사 안내 알림 발송 (카카오 알림톡/메일)
              </h3>
              <button
                onClick={() => setActiveModalContract(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="text-slate-800 font-bold">
                대상: {activeModalContract.companyName}
              </div>
              <div className="text-slate-600">
                사후관리 예정일: <span className="text-rose-600 font-bold">{activeModalContract.surveillanceDueDate}</span>
              </div>
              <div className="text-slate-600">
                담당 심사원: {activeModalContract.auditor?.name} ({activeModalContract.auditor?.mobile})
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 leading-relaxed">
              💡 <strong>비용 최적화 적용</strong>: 일반 문자(LMS 25원) 대비 약 70% 저렴한 <strong>카카오 비즈니스 알림톡(건당 8원)</strong>으로 발송되며, 카카오톡 미설치 시에만 SMS로 자동 전환(Fallback)됩니다.
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModalContract(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                닫기
              </button>
              <button
                onClick={() => handleSendNotification(activeModalContract)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                알림톡 전송하기 (건당 8원)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
