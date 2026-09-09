import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Briefcase,
  Award,
  ShieldAlert,
  Folder,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  Info
} from 'lucide-react';
import { Company, Auditor, AuditorReassignmentLog, AuditorAffiliation } from '../types';
import { LegacyCompanyExtended } from '../data/legacyDataLoader';

interface CompanyAuditorManagerProps {
  companies: (Company | LegacyCompanyExtended)[];
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
  const [companies, setCompanies] = useState<(Company | LegacyCompanyExtended)[]>(initialCompanies);
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
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterStandard, setFilterStandard] = useState<string>('all');
  const [filterDriveOnly, setFilterDriveOnly] = useState<boolean>(false);
  const [committeeFilter, setCommitteeFilter] = useState<string>('all');
  const [affiliationFilter, setAffiliationFilter] = useState<string>('all');

  // Pagination for companies
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Selected company for detailed inspection modal
  const [selectedCompany, setSelectedCompany] = useState<LegacyCompanyExtended | null>(null);

  // Reassignment Modal State
  const [reassignModalCompany, setReassignModalCompany] = useState<Company | null>(null);
  const [targetAuditorId, setTargetAuditorId] = useState<string>('');
  const [reasonCategory, setReasonCategory] = useState<AuditorReassignmentLog['reasonCategory']>('이해상충(Conflict of Interest)');
  const [reasonDetail, setReasonDetail] = useState<string>('');

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return companies.filter((c: any) => {
      const matchSearch = !q || 
        c.companyName?.toLowerCase().includes(q) ||
        c.bizNumber?.includes(q) ||
        c.ceoName?.toLowerCase().includes(q) ||
        c.contactPerson?.toLowerCase().includes(q) ||
        c.certNo?.toLowerCase().includes(q) ||
        c.iafCode?.includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.standards?.toLowerCase().includes(q);

      const matchRegion = filterRegion === 'all' || (c.regionCode && c.regionCode === filterRegion) || (c.address && c.address.includes(filterRegion));
      const matchStandard = filterStandard === 'all' || (c.standards && c.standards.includes(filterStandard));
      const matchDrive = !filterDriveOnly || c.hasDriveReports;

      return matchSearch && matchRegion && matchStandard && matchDrive;
    });
  }, [companies, searchQuery, filterRegion, filterStandard, filterDriveOnly]);

  // Paginated companies
  const totalPages = Math.ceil(filteredCompanies.length / pageSize) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage, pageSize]);

  // Filtered auditors
  const filteredAuditors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return auditors.filter(a => {
      const matchSearch = !q ||
        a.name.toLowerCase().includes(q) ||
        a.mobile.includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.grade.includes(q) ||
        a.iafCodes.some(c => c.includes(q));

      const matchCommittee = committeeFilter === 'all' 
        ? true 
        : committeeFilter === 'committee' 
        ? a.isCommitteeMember 
        : !a.isCommitteeMember;

      const matchAffiliation = affiliationFilter === 'all' || a.affiliation === affiliationFilter;

      return matchSearch && matchCommittee && matchAffiliation;
    });
  }, [auditors, searchQuery, committeeFilter, affiliationFilter]);

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
    <div className="space-y-4">
      {/* Upper Action & Filter Bar (Flat, Crisp Line Layout) */}
      <div className="bg-white border border-slate-300 rounded-lg p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          {/* SubTab Toggle */}
          <div className="inline-flex rounded border border-slate-300 p-0.5 bg-slate-100">
            <button
              onClick={() => { setSubTab('companies'); setCurrentPage(1); setSearchQuery(''); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                subTab === 'companies'
                  ? 'bg-white text-blue-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>인증 고객사 목록 ({companies.length}개사)</span>
            </button>
            <button
              onClick={() => { setSubTab('auditors'); setSearchQuery(''); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                subTab === 'auditors'
                  ? 'bg-white text-blue-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>심사원 & 심의위원 자격 ({auditors.length}명)</span>
            </button>
          </div>

          {/* Quick Info Indicator */}
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1 rounded font-medium">
              <Folder className="w-3.5 h-3.5 text-blue-600" />
              <span>저장소: <strong>G:\내 드라이브\GMSCS_과거심사보고서\</strong></span>
            </span>
            <span className="text-slate-500 font-mono">
              {subTab === 'companies' ? `검색 결과: ${filteredCompanies.length}건 / 전체 ${companies.length}건` : `검색 결과: ${filteredAuditors.length}명 / 전체 ${auditors.length}명`}
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Keyword Search */}
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder={subTab === 'companies' ? "기업명, 사업자번호, 대표자, 스코프, 인증번호..." : "심사원명, 등록번호, 전화번호, IAF 코드..."}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white text-xs"
              />
            </div>

            {/* Company Filters */}
            {subTab === 'companies' && (
              <>
                <select
                  value={filterRegion}
                  onChange={(e) => { setFilterRegion(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-600 text-xs"
                >
                  <option value="all">지역 전체</option>
                  <option value="서울">서울</option>
                  <option value="경기">경기</option>
                  <option value="인천">인천</option>
                  <option value="경북">경북</option>
                  <option value="경남">경남</option>
                  <option value="대구">대구</option>
                  <option value="부산">부산</option>
                  <option value="전남">전남</option>
                  <option value="전북">전북</option>
                  <option value="충남">충남</option>
                  <option value="충북">충북</option>
                  <option value="강원">강원</option>
                </select>

                <select
                  value={filterStandard}
                  onChange={(e) => { setFilterStandard(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-600 text-xs"
                >
                  <option value="all">인증표준 전체</option>
                  <option value="9001">ISO 9001 (품질)</option>
                  <option value="14001">ISO 14001 (환경)</option>
                  <option value="45001">ISO 45001 (안전보건)</option>
                  <option value="22716">ISO 22716 (화장품)</option>
                  <option value="ESG">ESG-MS</option>
                </select>

                <label className="flex items-center gap-1.5 text-slate-700 font-medium cursor-pointer select-none bg-slate-50 border border-slate-300 px-2.5 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={filterDriveOnly}
                    onChange={(e) => { setFilterDriveOnly(e.target.checked); setCurrentPage(1); }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <span>구글 드라이브 보고서 보관 기업만</span>
                </label>
              </>
            )}

            {/* Auditor Filters */}
            {subTab === 'auditors' && (
              <>
                <select
                  value={affiliationFilter}
                  onChange={(e) => setAffiliationFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-600 text-xs"
                >
                  <option value="all">소속 전체 (사무국 + 상근 + 비상근)</option>
                  <option value="사무국직원">🏢 사무국 직원</option>
                  <option value="소속심사원">💼 소속 상근 심사원</option>
                  <option value="비상근심사원">👤 비상근 심사원</option>
                </select>

                <select
                  value={committeeFilter}
                  onChange={(e) => setCommitteeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-600 text-xs"
                >
                  <option value="all">심의위원 전체</option>
                  <option value="committee">인증심의위원 자격자만</option>
                  <option value="general">일반 심사원만</option>
                </select>
              </>
            )}
          </div>

          {/* Page size selector for companies */}
          {subTab === 'companies' && (
            <div className="flex items-center space-x-2 text-slate-600">
              <span>페이지당 표시:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs focus:outline-none"
              >
                <option value={20}>20개씩</option>
                <option value={50}>50개씩</option>
                <option value={100}>100개씩</option>
                <option value={572}>전체 (572개)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMPANIES TABLE (High-density flat layout with fine line dividers) */}
      {/* ========================================================================= */}
      {subTab === 'companies' && (
        <div className="bg-white border border-slate-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap w-12">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">인증번호</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">인증기업명 (클릭: 상세/과거보고서)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">사업자등록번호</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">대표자</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap">지역</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">인증표준</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap">IAF</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">품질담당자 / 연락처</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap">현상태</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">과거기록/관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-normal text-slate-800">
                {paginatedCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500">
                      검색 조건에 일치하는 고객사가 없습니다.
                    </td>
                  </tr>
                ) : (
                  paginatedCompanies.map((c: any, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr 
                        key={c.id || idx}
                        className={`hover:bg-blue-50/50 transition cursor-pointer ${c.hasDriveReports ? 'bg-blue-50/20' : idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                        onClick={() => setSelectedCompany(c)}
                      >
                        <td className="py-2 px-3 border-r border-slate-200 text-center text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {rowNumber}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-blue-900 text-[11px] whitespace-nowrap">
                          {c.certNo || '--'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-[13px] hover:text-blue-700">
                              {c.companyName}
                            </span>
                            {c.hasDriveReports && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200 whitespace-nowrap" title="G: 드라이브 과거 보고서 보관됨">
                                <Folder className="w-2.5 h-2.5 text-blue-600" />
                                G:보고서
                              </span>
                            )}
                          </div>
                          {c.address && (
                            <div className="text-[11px] text-slate-500 truncate max-w-xl mt-0.5" title={c.address}>
                              {c.address}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-700 whitespace-nowrap tracking-wide text-[11px]">
                          {c.bizNumber || '--'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-800 whitespace-nowrap">
                          {c.ceoName}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-center font-medium text-slate-600 whitespace-nowrap">
                          {c.regionCode || (c.address ? c.address.substring(0, 2) : '--')}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-[11px] whitespace-nowrap font-medium text-slate-800">
                          {c.standards || c.industry || '--'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-center font-bold font-mono text-slate-700 whitespace-nowrap">
                          {c.iafCode || '--'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-[11px] whitespace-nowrap">
                          <span className="text-slate-900 font-semibold mr-2">{c.contactPerson || '--'}</span>
                          {c.contactPhone && (
                            <span className="text-slate-500 font-mono text-[11px]">{c.contactPhone}</span>
                          )}
                          {!c.contactPhone && c.contactEmail && (
                            <span className="text-slate-400 font-mono text-[10px]">{c.contactEmail}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            c.rawStatus === '인증완료' || c.rawStatus === '유지'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {c.rawStatus || '인증완료'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCompany(c)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[11px] font-medium transition cursor-pointer"
                              title="세부 정보 및 스코프 조회"
                            >
                              조회
                            </button>
                            {c.hasDriveReports && (
                              <button
                                type="button"
                                onClick={() => {
                                  alert(`[G: 드라이브 보관 경로 안내]\n\n기업명: ${c.companyName}\n저장 폴더: G:\\내 드라이브\\GMSCS_과거심사보고서\\${c.companyName}\\\n\n대표님의 파일 탐색기에서 위 경로를 열어 이전 심사보고서 및 인증서 PDF를 열람하실 수 있습니다.`);
                                }}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                title="구글 드라이브 보고서 폴더 확인"
                              >
                                <Folder className="w-3 h-3" />
                                <span>PDF</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-slate-50 border-t border-slate-300 p-2.5 flex items-center justify-between text-xs">
            <div className="text-slate-600">
              전체 <strong>{filteredCompanies.length}</strong>개 고객사 중 <strong>{Math.min((currentPage - 1) * pageSize + 1, filteredCompanies.length)}</strong> ~ <strong>{Math.min(currentPage * pageSize, filteredCompanies.length)}</strong> 표시 중
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs flex items-center gap-0.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                이전
              </button>

              {/* Dynamic Page Buttons */}
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 7) {
                  if (currentPage <= 4) p = i + 1;
                  else if (currentPage >= totalPages - 3) p = totalPages - 6 + i;
                  else p = currentPage - 3 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded text-xs font-bold transition border ${
                      currentPage === p
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs flex items-center gap-0.5"
              >
                다음
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUDITORS TABLE (Flat, High-Density Table without Bulky Cards)      */}
      {/* ========================================================================= */}
      {subTab === 'auditors' && (
        <div className="bg-white border border-slate-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-12">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-36">성명 / 직급</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-44">소속 등급 (권한)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-20">QMS 자격</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-20">EMS 자격</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-20">OHS 자격</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-40">인증심의위원 자격</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-32">연락처 / 이메일</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">심사 가능 코드 (IAF)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-20">담당 고객사</th>
                  <th className="py-2.5 px-3 text-center w-20">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-normal text-slate-800">
                {filteredAuditors.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500">
                      검색 조건에 일치하는 심사원이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredAuditors.map((aud, idx) => {
                    const isKim = aud.name.includes('김홍덕');
                    const isNam = aud.name.includes('남경호');
                    return (
                      <tr 
                        key={aud.id}
                        className={`hover:bg-blue-50/50 transition ${
                          isKim ? 'bg-amber-50/30' : isNam ? 'bg-blue-50/30' : idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-500 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-[13px]">{aud.name}</span>
                            {aud.isSystemAdmin && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[9px] border border-amber-300">
                                총괄대표
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {aud.grade}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <select
                            value={aud.affiliation || '비상근심사원'}
                            onChange={(e) => handleUpdateAffiliation(aud.id, e.target.value as AuditorAffiliation)}
                            className={`w-full text-xs font-semibold rounded px-2 py-1 border transition focus:outline-none ${
                              aud.affiliation === '사무국직원'
                                ? 'bg-purple-50 text-purple-900 border-purple-300'
                                : aud.affiliation === '소속심사원'
                                ? 'bg-blue-50 text-blue-900 border-blue-300'
                                : 'bg-slate-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="사무국직원">🏢 사무국 직원 (전체 기능)</option>
                            <option value="소속심사원">💼 소속 상근 (전체 열람)</option>
                            <option value="비상근심사원">👤 비상근 (담당건 격리)</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                          {aud.registeredStandards.some(s => s.includes('9001')) ? (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[11px] border border-blue-200">
                              {aud.grade.includes('선임') ? '선임' : '일반'}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">--</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                          {aud.registeredStandards.some(s => s.includes('14001')) ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                              {aud.grade.includes('선임') ? '선임' : '일반'}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">--</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                          {aud.registeredStandards.some(s => s.includes('45001')) ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                              {aud.grade.includes('선임') ? '선임' : '일반'}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">--</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleToggleCommittee(aud.id)}
                            className={`w-full py-1 px-2 rounded text-[11px] font-bold border transition flex items-center justify-between ${
                              aud.isCommitteeMember
                                ? 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <Award className={`w-3.5 h-3.5 ${aud.isCommitteeMember ? 'text-indigo-600' : 'text-slate-400'}`} />
                              <span>{aud.isCommitteeMember ? `위촉 (${aud.committeeRole || '심의위원'})` : '미위촉'}</span>
                            </span>
                            <span className="text-[10px] text-blue-600 underline">변경</span>
                          </button>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-[11px]">
                          <div className="font-mono text-slate-800 font-medium">{aud.mobile}</div>
                          <div className="text-slate-500 truncate text-[10px]">{aud.email}</div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <div className="flex flex-wrap gap-1">
                            {aud.iafCodes.map(code => (
                              <span key={code} className="px-1 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] border border-slate-200">
                                {code.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-800">
                          {aud.activeClientCount}사
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            {aud.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPANY DETAIL MODAL (Flat, Clean Document Inspection)                   */}
      {/* ========================================================================= */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-400 rounded-lg max-w-2xl w-full p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900">{selectedCompany.companyName}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                  인증번호: {selectedCompany.certNo || '--'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedCompany(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm px-2 py-1 rounded hover:bg-slate-100"
              >
                ✕ 닫기
              </button>
            </div>

            {/* Flat Grid Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-200 p-2.5 rounded bg-slate-50/50 space-y-1.5">
                <div className="text-slate-500 font-medium">사업자등록번호 / 대표자</div>
                <div className="font-bold text-slate-900">{selectedCompany.bizNumber} / {selectedCompany.ceoName} 대표</div>
              </div>

              <div className="border border-slate-200 p-2.5 rounded bg-slate-50/50 space-y-1.5">
                <div className="text-slate-500 font-medium">품질/인증 담당자 및 연락처</div>
                <div className="font-bold text-slate-900">{selectedCompany.contactPerson} ({selectedCompany.contactPhone || selectedCompany.contactEmail || '연락처 미등록'})</div>
              </div>

              <div className="col-span-2 border border-slate-200 p-2.5 rounded bg-slate-50/50 space-y-1">
                <div className="text-slate-500 font-medium">사업장 본사 주소</div>
                <div className="font-medium text-slate-800">{selectedCompany.address || '주소 정보 없음'}</div>
              </div>

              <div className="border border-slate-200 p-2.5 rounded bg-slate-50/50 space-y-1">
                <div className="text-slate-500 font-medium">인증 표준 및 IAF 코드</div>
                <div className="font-bold text-blue-900">{selectedCompany.standards || 'ISO 9001:2015'} (IAF {selectedCompany.iafCode})</div>
              </div>

              <div className="border border-slate-200 p-2.5 rounded bg-slate-50/50 space-y-1">
                <div className="text-slate-500 font-medium">인증 상태</div>
                <div className="font-bold text-emerald-800">{selectedCompany.rawStatus || '인증완료'}</div>
              </div>

              <div className="col-span-2 border border-slate-200 p-2.5 rounded bg-slate-50/50 space-y-1">
                <div className="text-slate-500 font-medium">공인 인증 범위 (Scope)</div>
                <div className="font-medium text-slate-800 bg-white border border-slate-200 p-2 rounded max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {selectedCompany.scope || '인증범위 세부 텍스트가 등록되지 않았습니다.'}
                </div>
              </div>
            </div>

            {/* Google Drive Archive Notice */}
            <div className={`p-3 rounded border text-xs flex items-start gap-2.5 ${
              selectedCompany.hasDriveReports 
                ? 'bg-blue-50 border-blue-300 text-blue-950'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}>
              <Folder className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="font-bold flex items-center justify-between">
                  <span>과거 심사보고서 및 인증서 보관소 (구글 드라이브)</span>
                  {selectedCompany.hasDriveReports ? (
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">보관됨</span>
                  ) : (
                    <span className="text-slate-400">보관 대기</span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-600 bg-white/80 p-1.5 rounded border border-slate-200">
                  G:\내 드라이브\GMSCS_과거심사보고서\{selectedCompany.companyName}\
                </div>
                {selectedCompany.hasDriveReports ? (
                  <p className="text-[11px] text-blue-800">
                    ✓ 대표님의 컴퓨터 `G:\` 드라이브에 표준 파일명(`[GMSCS-REP]`, `[GMSCS-CERT]`)으로 과거 PDF가 저장되어 있습니다.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    전체 레거시 마이그레이션 실행 시 본 기업의 과거 PDF가 위 폴더로 자동 저장됩니다.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-1.5 rounded border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUDITOR REASSIGNMENT MODAL                                                */}
      {/* ========================================================================= */}
      {reassignModalCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-lg w-full p-5 space-y-4 shadow-lg text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>담당 심사원 변경 (이해상충 방지)</span>
              </h4>
              <button onClick={() => setReassignModalCompany(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">대상 기업</label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900">
                  {reassignModalCompany.companyName} ({reassignModalCompany.bizNumber})
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">신규 배정 심사원 선택</label>
                <select
                  value={targetAuditorId}
                  onChange={(e) => setTargetAuditorId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-800 font-medium"
                >
                  {auditors.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.grade} / {a.affiliation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">변경 사유 구분</label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-800 font-medium"
                >
                  <option value="이해상충(Conflict of Interest)">이해상충(Conflict of Interest) 방지</option>
                  <option value="심사일정 중복">심사일정 중복 및 출장 불가</option>
                  <option value="고객사 요청">고객사 공식 변경 요청</option>
                  <option value="사무국 배정 조정">사무국 정기 배정 조정</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">상세 사유 기록</label>
                <textarea
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="KAB 인정기준에 따른 심사원 변경 사유를 간략히 입력하십시오..."
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-800 h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReassignModalCompany(null)}
                className="px-3 py-1.5 rounded border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteReassign}
                className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold"
              >
                변경 승인 및 기록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
