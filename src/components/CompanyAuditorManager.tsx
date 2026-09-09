import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Briefcase,
  Award,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Company, Auditor, AuditorReassignmentLog, AuditorAffiliation } from '../types';

interface CompanyAuditorManagerProps {
  companies: Company[];
  auditors: Auditor[];
  initialSubTab?: 'companies' | 'auditors';
  onToggleCommitteeMember?: (auditorId: string) => void;
  onReassignCompanyAuditor?: (companyId: string, newAuditorId: string, reasonCategory: AuditorReassignmentLog['reasonCategory'], reasonDetail: string) => void;
  onUpdateAuditorAffiliation?: (auditorId: string, affiliation: AuditorAffiliation) => void;
}

export const CompanyAuditorManager: React.FC<CompanyAuditorManagerProps> = ({
  companies: initialCompanies,
  auditors: initialAuditors,
  initialSubTab = 'companies',
  onToggleCommitteeMember,
  onReassignCompanyAuditor,
  onUpdateAuditorAffiliation,
}) => {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [auditors, setAuditors] = useState<Auditor[]>(initialAuditors);

  // Sync state when props change
  React.useEffect(() => {
    setCompanies(initialCompanies);
  }, [initialCompanies]);

  React.useEffect(() => {
    setAuditors(initialAuditors);
  }, [initialAuditors]);
  const [subTab, setSubTab] = useState<'companies' | 'auditors'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [committeeFilter, setCommitteeFilter] = useState<string>('all');

  // Reassignment Modal State
  const [reassignModalCompany, setReassignModalCompany] = useState<Company | null>(null);
  const [targetAuditorId, setTargetAuditorId] = useState<string>('');
  const [reasonCategory, setReasonCategory] = useState<AuditorReassignmentLog['reasonCategory']>('이해상충(Conflict of Interest)');
  const [reasonDetail, setReasonDetail] = useState<string>('');

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.companyName.includes(searchQuery) || c.bizNumber.includes(searchQuery) || c.contactPerson.includes(searchQuery);
    const matchesType = filterType === 'all' || c.clientType === filterType;
    return matchesSearch && matchesType;
  });

  const filteredAuditors = auditors.filter(a => {
    const matchesSearch = a.name.includes(searchQuery) || a.iafCodes.some(code => code.includes(searchQuery));
    const matchesCommittee = committeeFilter === 'all' 
      ? true 
      : committeeFilter === 'committee' 
      ? a.isCommitteeMember 
      : !a.isCommitteeMember;
    return matchesSearch && matchesCommittee;
  });

  const handleToggleCommittee = (audId: string) => {
    setAuditors(prev => prev.map(a => {
      if (a.id === audId) {
        const nextVal = !a.isCommitteeMember;
        return {
          ...a,
          isCommitteeMember: nextVal,
          committeeRole: nextVal ? '심의위원' : undefined,
          committeeAppointmentDate: nextVal ? new Date().toISOString().substring(0, 10) : undefined,
        };
      }
      return a;
    }));
    if (onToggleCommitteeMember) onToggleCommitteeMember(audId);
  };

  const handleUpdateAffiliation = (audId: string, affiliation: AuditorAffiliation) => {
    setAuditors(prev => prev.map(a => {
      if (a.id === audId) {
        return { ...a, affiliation };
      }
      return a;
    }));
    if (onUpdateAuditorAffiliation) {
      onUpdateAuditorAffiliation(audId, affiliation);
    }
  };

  const handleOpenReassign = (comp: Company) => {
    setReassignModalCompany(comp);
    const other = auditors.find(a => a.id !== comp.managingAuditorId);
    if (other) setTargetAuditorId(other.id);
    setReasonCategory('이해상충(Conflict of Interest)');
    setReasonDetail('');
  };

  const handleExecuteReassign = () => {
    if (!reassignModalCompany) return;
    const target = auditors.find(a => a.id === targetAuditorId);
    if (!target) {
      alert('대체 심사원을 선택해 주십시오.');
      return;
    }

    setCompanies(prev => prev.map(c => {
      if (c.id === reassignModalCompany.id) {
        return { ...c, managingAuditorId: target.id };
      }
      return c;
    }));

    if (onReassignCompanyAuditor) {
      onReassignCompanyAuditor(
        reassignModalCompany.id, 
        target.id, 
        reasonCategory, 
        reasonDetail || '사무국 접수 이해상충 방지 심사원 변경'
      );
    }

    alert(`[${reassignModalCompany.companyName}]의 담당 심사원이 [${target.name}]으로 변경 처리되었습니다.`);
    setReassignModalCompany(null);
  };

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
            <span>위촉/등록 심사원 및 인증심의위원 자격 관리</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={subTab === 'companies' ? "회사명, 사업자번호, 담당자 검색..." : "심사원명, IAF 코드 검색..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white w-60"
            />
          </div>

          {subTab === 'companies' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white font-medium"
            >
              <option value="all">전체 구분 (직영+영업)</option>
              <option value="직영">인증원 직영</option>
              <option value="심사원영업">심사원 영업</option>
            </select>
          )}

          {subTab === 'auditors' && (
            <select
              value={committeeFilter}
              onChange={(e) => setCommitteeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white font-bold text-indigo-950"
            >
              <option value="all">전체 심사원</option>
              <option value="committee">인증심의위원 자격자만</option>
              <option value="general">일반 심사원</option>
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
                <th className="p-3.5 text-right">이해상충 심사원 변경</th>
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
                        onClick={() => handleOpenReassign(c)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] transition inline-flex items-center gap-1 shadow-2xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>담당 심사원 변경</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Content: Auditors Cards Grid with Committee Qualification Toggle */}
      {subTab === 'auditors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAuditors.map((aud) => (
            <div key={aud.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-base font-extrabold text-slate-900">{aud.name}</h4>
                      {aud.isSystemAdmin && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          👑 시스템 총괄
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 inline-block">
                        {aud.grade}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    {aud.status}
                  </span>
                </div>

                {/* 소속 구분 & 시스템 접근 등급 */}
                <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-600">소속 등급</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      aud.affiliation === '사무국직원' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                      aud.affiliation === '소속심사원' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                      'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}>
                      {aud.affiliation === '사무국직원' ? '🏢 사무국 직원 (전체)' :
                       aud.affiliation === '소속심사원' ? '💼 소속 상근 (전체)' :
                       '👤 비상근 심사원 (격리)'}
                    </span>
                  </div>
                  <select
                    value={aud.affiliation || '비상근심사원'}
                    onChange={(e) => handleUpdateAffiliation(aud.id, e.target.value as AuditorAffiliation)}
                    className="w-full text-[11px] font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="사무국직원">사무국 직원 (전체 기능 & 관리자 권한)</option>
                    <option value="소속심사원">소속 상근 심사원 (전체 시스템 접근)</option>
                    <option value="비상근심사원">비상근 심사원 (담당 기업/보고서만 제한 접근)</option>
                  </select>
                </div>

                {/* 인증심의위원 자격 뱃지 */}
                <div className="mt-2.5">
                  {aud.isCommitteeMember ? (
                    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-[11px]">인증심의위원 자격 ({aud.committeeRole || '심의위원'})</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-mono">위촉됨</span>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 flex items-center justify-between text-[11px]">
                      <span>심의위원 자격: 미보유</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 mt-3">
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
                <div className="space-y-1 pt-2 border-t border-slate-100 mt-3">
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
                <div className="space-y-1 mt-2">
                  <span className="text-[11px] font-bold text-slate-500 block">자격 규격</span>
                  <div className="flex flex-wrap gap-1">
                    {aud.registeredStandards.map(std => (
                      <span key={std} className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-800 border border-blue-200">
                        {std.split(':')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Committee Toggle Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleCommittee(aud.id)}
                  className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-2xs ${
                    aud.isCommitteeMember
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{aud.isCommitteeMember ? '심의위원 자격 해제' : '인증심의위원 자격 부여'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reassign Modal */}
      {reassignModalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  담당 심사원 교체 배정 (이해상충 관리)
                </h3>
                <p className="text-[11px] text-slate-500">
                  대상 기업: <strong>{reassignModalCompany.companyName}</strong> (사업자: {reassignModalCompany.bizNumber})
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">현재 배정 심사원</label>
                <input
                  type="text"
                  disabled
                  value={auditors.find(a => a.id === reassignModalCompany.managingAuditorId)?.name || '미배정'}
                  className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-300 text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">새로 배정할 심사원</label>
                <select
                  value={targetAuditorId}
                  onChange={(e) => setTargetAuditorId(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 font-medium text-slate-800"
                >
                  {auditors
                    .filter(a => a.id !== reassignModalCompany.managingAuditorId)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.grade} / IAF: {a.iafCodes.join(', ')})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">교체 사유 선택</label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value as AuditorReassignmentLog['reasonCategory'])}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 font-bold text-amber-900"
                >
                  <option value="이해상충(Conflict of Interest)">이해상충(Conflict of Interest) - 과거 자문/친인척 관계 등</option>
                  <option value="심사일정 중복">심사일정 중복 (타사 심사 일정과 중복)</option>
                  <option value="전문분야(IAF) 불일치">전문분야(IAF 코드) 부합성 확보</option>
                  <option value="심사원 신병/개인사정">심사원 개인 사정/신병</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">상세 사유 기록 (감사 증적용)</label>
                <textarea
                  rows={3}
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="예: 제3자 독립성 검토 결과 과거 2년간 자문 이력이 확인되어 공정성 확보를 위해 심사팀장을 교체 배정함."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setReassignModalCompany(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteReassign}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md"
              >
                교체 배정 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

