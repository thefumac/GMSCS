import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Briefcase 
} from 'lucide-react';
import { Company, Auditor } from '../types';

interface CompanyAuditorManagerProps {
  companies: Company[];
  auditors: Auditor[];
  initialSubTab?: 'companies' | 'auditors';
}

export const CompanyAuditorManager: React.FC<CompanyAuditorManagerProps> = ({
  companies,
  auditors,
  initialSubTab = 'companies'
}) => {
  const [subTab, setSubTab] = useState<'companies' | 'auditors'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.companyName.includes(searchQuery) || c.bizNumber.includes(searchQuery) || c.contactPerson.includes(searchQuery);
    const matchesType = filterType === 'all' || c.clientType === filterType;
    return matchesSearch && matchesType;
  });

  const filteredAuditors = auditors.filter(a => {
    return a.name.includes(searchQuery) || a.iafCodes.some(code => code.includes(searchQuery));
  });

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setSubTab('companies')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              subTab === 'companies'
                ? 'bg-white text-cyan-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-600" />
            <span>고객사 관리 (현재 300사 데이터베이스)</span>
          </button>
          <button
            onClick={() => setSubTab('auditors')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              subTab === 'auditors'
                ? 'bg-white text-cyan-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-600" />
            <span>위촉/등록 심사원 현황 (IAF 코드)</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={subTab === 'companies' ? "회사명, 사업자번호, 담당자 검색..." : "심사원명, IAF 코드 검색..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white w-64"
            />
          </div>

          {subTab === 'companies' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white font-medium"
            >
              <option value="all">전체 (직영+심사원영업)</option>
              <option value="직영">인증원 직영 관리</option>
              <option value="심사원영업">심사원 발굴/영업</option>
            </select>
          )}

          <button
            onClick={() => alert(`신규 ${subTab === 'companies' ? '고객사' : '심사원'} 등록 모달을 엽니다.`)}
            className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>신규 등록</span>
          </button>
        </div>
      </div>

      {/* Content: Companies Table */}
      {subTab === 'companies' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">사업자번호 / 회사명</th>
                <th className="p-3.5">대표자 / 사업장 주소</th>
                <th className="p-3.5">품질/인증 담당자</th>
                <th className="p-3.5">관리 구분</th>
                <th className="p-3.5">IAF 코드 / 종업원</th>
                <th className="p-3.5">배정 심사원</th>
                <th className="p-3.5 text-right">상세조회</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.map((c) => {
                const managingAuditor = auditors.find(a => a.id === c.managingAuditorId);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <strong className="text-slate-900 text-sm block">{c.companyName}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">{c.bizNumber}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800 font-medium">{c.ceoName} 대표</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.address}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800 font-medium">{c.contactPerson}</div>
                      <div className="text-[11px] text-slate-500">{c.contactPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        c.clientType === '직영'
                          ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}>
                        {c.clientType}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800 font-bold">IAF {c.iafCode}</div>
                      <div className="text-[11px] text-slate-500">{c.totalEmployees}명 (위험도: {c.riskLevel})</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-cyan-800 font-bold">{managingAuditor ? managingAuditor.name : '미배정'}</div>
                      <div className="text-[10px] text-slate-500">{managingAuditor?.grade}</div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => alert(`[${c.companyName}]\n- 사업자번호: ${c.bizNumber}\n- 대표: ${c.ceoName}\n- 담당자: ${c.contactPerson} (${c.contactEmail})\n- 주소: ${c.address}\n- 담당심사원: ${managingAuditor?.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                      >
                        원장 보기
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Content: Auditors Cards Grid */}
      {subTab === 'auditors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAuditors.map((aud) => (
            <div key={aud.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{aud.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 mt-1 inline-block">
                    {aud.grade}
                  </span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {aud.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{aud.mobile}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="truncate">{aud.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-600" />
                  <span>담당 고객사: <strong className="text-slate-900">{aud.activeClientCount}</strong>개사</span>
                </div>
              </div>

              {/* 자격 IAF 코드 칩 */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block">보유 심사 코드 (IAF)</span>
                <div className="flex flex-wrap gap-1">
                  {aud.iafCodes.map(code => (
                    <span key={code} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200">
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              {/* 등록 규격 */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">자격 규격</span>
                <div className="flex flex-wrap gap-1">
                  {aud.registeredStandards.map(std => (
                    <span key={std} className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-800 border border-blue-200">
                      {std.split(':')[0]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-100">
                <span>계약만료: {aud.contractExpiryDate}</span>
                <button
                  onClick={() => alert(`심사원 [${aud.name}]의 담당 스케줄 및 배정 관리창으로 이동합니다.`)}
                  className="text-cyan-700 hover:underline font-bold"
                >
                  스케줄 배정
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
