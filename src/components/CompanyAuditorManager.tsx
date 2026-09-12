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
import { CompanyAuditHistoryModal } from './CompanyAuditHistoryModal';
import { LegacyCompanyExtended } from '../data/legacyDataLoader';
import { checkOutdatedStandard, cleanStandardName, DEFAULT_OFFICIAL_STANDARD_VERSIONS } from './AuditorPortal';

interface CompanyAuditorManagerProps {
  companies: (Company | LegacyCompanyExtended)[];
  auditors: Auditor[];
  initialSubTab?: 'companies' | 'auditors';
  onToggleCommitteeMember?: (auditorId: string) => void;
  onReassignCompanyAuditor?: (companyId: string, newAuditorId: string, reasonCategory: AuditorReassignmentLog['reasonCategory'], reasonDetail: string) => void;
  onUpdateAuditorAffiliation?: (auditorId: string, affiliation: AuditorAffiliation) => void;
}

// Helper to format Standards with matching Certificate Numbers
function formatStandardsWithCert(standardsStr?: string, certNoStr?: string): string {
  if (!standardsStr && !certNoStr) return '--';
  if (!standardsStr) return certNoStr ? `(${certNoStr})` : '--';

  const stds = standardsStr.split(/[\/,]/).map(s => s.trim()).filter(Boolean);
  const certs = (certNoStr || '').split(/[\/,]/).map(c => c.trim()).filter(Boolean);

  if (stds.length <= 1) {
    const cert = certs[0] ? ` (${certs[0]})` : (certNoStr ? ` (${certNoStr})` : '');
    return `${stds[0] || standardsStr}${cert}`;
  }

  return stds.map((std, idx) => {
    let matchedCert: string | undefined = certs[idx];
    if (!matchedCert && certs.length > 0) {
      if (std.includes('9001')) {
        matchedCert = certs.find(c => c.startsWith('Q') || c.includes('9001'));
      } else if (std.includes('14001')) {
        matchedCert = certs.find(c => c.startsWith('E') || c.includes('14001'));
      } else if (std.includes('45001')) {
        matchedCert = certs.find(c => c.startsWith('O') || c.startsWith('S') || c.includes('45001'));
      }
      if (!matchedCert) {
        matchedCert = certs[idx % certs.length];
      }
    }
    return matchedCert ? `${std} (${matchedCert})` : std;
  }).join(' / ');
}

// Helper to determine audit type and next due date
function getAuditStageAndNextDue(comp: any, index: number): { auditType: string; nextDue: string } {
  const cert = comp.certNo || '';
  let auditType = '1차 사후';
  let nextDue = '2026-11-15';

  if (cert.includes('26')) {
    auditType = '최초';
    nextDue = '2027-05-20';
  } else if (cert.includes('25')) {
    auditType = '1차 사후';
    nextDue = '2026-10-25';
  } else if (cert.includes('24')) {
    auditType = '2차 사후';
    nextDue = '2026-11-30';
  } else if (cert.includes('23') || cert.includes('22')) {
    auditType = '갱신';
    nextDue = '2026-12-15';
  } else {
    const types = ['1차 사후', '2차 사후', '갱신', '최초'];
    auditType = types[index % 4];
    const months = ['10-20', '11-10', '11-28', '12-15', '01-20'];
    nextDue = `2026-${months[index % months.length]}`;
  }
  return { auditType, nextDue };
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
        (a.gmsNumber && a.gmsNumber.toLowerCase().includes(q)) ||
        a.mobile.includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.grade.includes(q) ||
        a.iafCodes.some(c => c.includes(q));

      const isFull = a.affiliation === '상근';
      const matchAffiliation = affiliationFilter === 'all' 
        ? true 
        : affiliationFilter === '상근' 
        ? isFull 
        : !isFull;

      return matchSearch && matchAffiliation;
    });
  }, [auditors, searchQuery, affiliationFilter]);

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

  // Selected auditor for detailed inspection modal with company list
  const [selectedAuditor, setSelectedAuditor] = useState<Auditor | null>(null);
  const [auditorCompanySearch, setAuditorCompanySearch] = useState<string>('');

  // Get companies assigned/managed by a specific auditor
  const getCompaniesForAuditor = (aud: Auditor) => {
    return companies.filter((c: any) => {
      if (c.managingAuditorId === aud.id) return true;
      if (c.assignedAuditorName?.includes(aud.name) || c.assignedAuditor?.includes(aud.name)) return true;
      if (c.consultant?.includes(aud.name)) return true;
      return false;
    });
  };

  // Filtered managed companies inside modal
  const modalManagedCompanies = useMemo(() => {
    if (!selectedAuditor) return [];
    const list = getCompaniesForAuditor(selectedAuditor);
    const q = auditorCompanySearch.toLowerCase().trim();
    if (!q) return list;
    return list.filter((c: any) => 
      c.companyName?.toLowerCase().includes(q) ||
      c.bizNumber?.includes(q) ||
      c.ceoName?.toLowerCase().includes(q) ||
      c.certNo?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  }, [companies, selectedAuditor, auditorCompanySearch, auditors]);

  return (
    <div className="space-y-4">
      {/* Upper Action & Filter Bar (Clean, Purpose-Driven Layout) */}
      <div className="bg-white border border-slate-300 rounded-lg p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            {subTab === 'auditors' ? (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">심사원 등록 대장 ({auditors.length}명)</h2>
                <span className="text-xs text-slate-500 font-normal">| 심사원을 클릭하면 담당 기업 목록이 표시됩니다.</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">인증 고객사 현황 ({companies.length}개사)</h2>
                <span className="text-xs text-slate-500 font-normal">| 기업을 클릭하면 상세 인증 정보가 표시됩니다.</span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {subTab === 'companies' 
              ? `검색 결과: ${filteredCompanies.length}건 / 전체 ${companies.length}건` 
              : `검색 결과: ${filteredAuditors.length}명 / 전체 ${auditors.length}명`}
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
              <select
                value={affiliationFilter}
                onChange={(e) => setAffiliationFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-600 text-xs"
              >
                <option value="all">구분 전체 (상근 + 비상근)</option>
                <option value="상근">💼 상근 심사원</option>
                <option value="비상근">👤 비상근 심사원</option>
              </select>
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
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap bg-slate-100">영업/컨설턴트</th>
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
                              <span className="text-blue-700 font-bold text-[11px] whitespace-nowrap" title="G: 드라이브 과거 보고서 보관됨">
                                [G:보관]
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
                        <td className="py-2 px-3 border-r border-slate-200 text-[11px] whitespace-nowrap font-normal text-slate-800">
                          {(() => {
                            const stdStr = c.standards || c.industry || '';
                            if (!stdStr || stdStr === '--') return '--';
                            const stds = stdStr.split(/[\/,;]+/).map((s: string) => s.trim()).filter(Boolean);
                            return stds.map((std: string, sIdx: number) => {
                              const outChk = checkOutdatedStandard(cleanStandardName(std), DEFAULT_OFFICIAL_STANDARD_VERSIONS);
                              return (
                                <span key={sIdx} className={`inline-flex items-center gap-0.5 ${outChk.isOutdated ? 'text-red-600' : 'text-slate-800'}`}>
                                  <span>{cleanStandardName(std)}</span>
                                  {outChk.isOutdated && (
                                    <span className="px-1 py-0.5 rounded text-[9.5px] bg-rose-50 text-rose-600 border border-rose-200 font-normal ml-0.5">
                                      {outChk.officialVersion} 전환대상
                                    </span>
                                  )}
                                  {sIdx < stds.length - 1 && <span className="text-slate-300 mx-0.5">/</span>}
                                </span>
                              );
                            });
                          })()}
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
                        <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap text-slate-800 font-medium text-[11px]">
                          {c.rawStatus || '인증완료'}
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
      {/* TAB 2: AUDITORS TABLE (Official Legacy GMSCS Registered Auditor Ledger)   */}
      {/* ========================================================================= */}
      {subTab === 'auditors' && (
        <div className="bg-white border border-slate-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-12 whitespace-nowrap">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-28 whitespace-nowrap text-center">심사원 등록번호</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-32 whitespace-nowrap">성명 / 직급</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-20 whitespace-nowrap">구분</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-20 whitespace-nowrap">QMS 자격</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-20 whitespace-nowrap">EMS 자격</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-20 whitespace-nowrap">OHS 자격</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-48 min-w-[140px]">심사 가능 코드 (IAF)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-44 min-w-[160px] whitespace-nowrap">연락처 / 이메일</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-24 min-w-[70px] whitespace-nowrap">담당 고객사</th>
                  <th className="py-2.5 px-3 text-center w-16 whitespace-nowrap">상태</th>
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
                    const isFullTime = aud.affiliation === '상근';
                    return (
                      <tr 
                        key={aud.id}
                        onClick={() => {
                          setSelectedAuditor(aud);
                          setAuditorCompanySearch('');
                        }}
                        className={`hover:bg-blue-50 transition cursor-pointer ${
                          isKim ? 'bg-amber-50/30' : isNam ? 'bg-blue-50/30' : idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                        title="클릭하여 담당 심사 기업 목록을 확인합니다."
                      >
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-[11px] text-slate-800 whitespace-nowrap">
                          {aud.gmsNumber || '--'}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-[13px] hover:text-blue-700 hover:underline">{aud.name}</span>
                            {aud.isSystemAdmin && (
                              <span className="text-amber-800 font-bold text-[11px]">
                                (대표)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {aud.grade}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap font-medium text-slate-800">
                          {isFullTime ? '상근' : '비상근'}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap font-medium text-slate-800">
                          {aud.registeredStandards.some(s => s.includes('9001')) ? (
                            aud.grade.includes('선임') ? '선임' : '일반'
                          ) : (
                            <span className="text-slate-300 font-mono">--</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap font-medium text-slate-800">
                          {aud.registeredStandards.some(s => s.includes('14001')) ? (
                            aud.grade.includes('선임') ? '선임' : '일반'
                          ) : (
                            <span className="text-slate-300 font-mono">--</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap font-medium text-slate-800">
                          {aud.registeredStandards.some(s => s.includes('45001')) ? (
                            aud.grade.includes('선임') ? '선임' : '일반'
                          ) : (
                            <span className="text-slate-300 font-mono">--</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <span className="font-mono text-[11px] text-slate-700 leading-tight block">
                            {aud.iafCodes.map(code => code.split(' ')[0]).join(', ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-[11px] whitespace-nowrap">
                          <div className="font-mono text-slate-900 font-medium">{aud.mobile}</div>
                          <div className="text-slate-500 font-mono text-[10.5px]">{aud.email}</div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold text-blue-900 whitespace-nowrap hover:underline">
                          {getCompaniesForAuditor(aud).length}사
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap text-emerald-700 font-medium text-[11px]">
                          {aud.status}
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
      {/* AUDITOR DETAIL & MANAGED COMPANIES MODAL                                   */}
      {/* ========================================================================= */}
      {selectedAuditor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-400 rounded-xl max-w-4xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-blue-700" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedAuditor.name} 심사원</h3>
                    <span className="text-xs text-slate-500 font-medium">({selectedAuditor.grade} · {selectedAuditor.affiliation === '상근' ? '상근' : '비상근'})</span>
                    {selectedAuditor.isSystemAdmin && (
                      <span className="text-xs text-amber-800 font-bold">(대표)</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    심사원 등록번호: {selectedAuditor.gmsNumber || '--'} | 유효기간: {selectedAuditor.contractExpiryDate || '2028-12-31'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAuditor(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base px-2.5 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                ✕ 닫기
              </button>
            </div>

            {/* Quick Auditor Overview (컴팩트 규격 뱃지 칩 / IAF 코드 / 정산방식 / 관리기업수) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 space-y-3 text-xs">
              {/* Row 1: 심사 가능 규격 컴팩트 뱃지 나열 (다규격 심사원도 공간 낭비 없이 2~3줄 내 완벽 정리) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-600 font-bold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    보유 심사 규격 및 등급 ({selectedAuditor.registeredStandards?.length || 0}개)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    * 인디고: 선임심사원 / 에메랄드: 정심사원 / 슬레이트: 심사원보
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(selectedAuditor.registeredStandards || ['ISO 9001:2015']).map(std => {
                    const mappedGrade = selectedAuditor.standardGrades?.[std] 
                      || (selectedAuditor.grade?.includes('선임') ? '선임심사원' : '정심사원');
                    const isLead = mappedGrade.includes('선임');
                    const isRegular = mappedGrade.includes('정');
                    return (
                      <span 
                        key={std}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-normal shadow-2xs ${
                          isLead 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                            : isRegular
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-slate-100 border-slate-300 text-slate-700'
                        }`}
                        title={`${std} - ${mappedGrade}`}
                      >
                        <span>{std.split(':')[0]}</span>
                        <span className={`px-1 py-0.2 rounded text-[9.5px] font-medium ${
                          isLead ? 'bg-indigo-600 text-white' : isRegular ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'
                        }`}>
                          {mappedGrade}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: IAF 코드, 연락처, 심사비 정산방식 & 입금계좌 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-500 font-medium block">심사 가능 IAF 코드</span>
                  <span className="font-bold font-mono text-slate-800 block mt-0.5 leading-tight">
                    {selectedAuditor.iafCodes?.join(', ') || '17 (기계/금속), 28 (건설/토목)'}
                  </span>
                  <div className="text-slate-500 font-mono text-[11px] mt-1">
                    {selectedAuditor.mobile} | {selectedAuditor.email}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">심사비 지급방식 & 입금계좌</span>
                  <div className="mt-0.5 space-y-0.5">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10.5px] font-bold ${
                      selectedAuditor.payoutMethod === '세금계산서'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedAuditor.payoutMethod === '세금계산서' ? '세금계산서 (개인사업자)' : '3.3% 원천징수 (프리랜서)'}
                    </span>
                    {selectedAuditor.businessNumber && (
                      <div className="text-slate-600 font-mono text-[11px]">
                        사업자: {selectedAuditor.businessNumber} ({selectedAuditor.businessName || '개인사업자'})
                      </div>
                    )}
                    <div className="text-slate-700 font-mono text-[11px]">
                      계좌: {selectedAuditor.bankAccount || `${selectedAuditor.bankName || '신한'} ${selectedAuditor.accountNumber || '등록필요'}`}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right flex flex-col justify-between">
                  <span className="text-slate-500 font-medium block">총 관리 고객사</span>
                  <div className="text-2xl font-black font-mono text-blue-900">
                    {getCompaniesForAuditor(selectedAuditor).length}개사
                  </div>
                </div>
              </div>
            </div>

            {/* Managed Companies Title & Search */}
            <div className="flex items-center justify-between gap-3 pt-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  담당 인증 고객사 목록 ({modalManagedCompanies.length}개사)
                </h4>
              </div>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="기업명, 인증번호 검색..."
                  value={auditorCompanySearch}
                  onChange={(e) => setAuditorCompanySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Managed Companies Table List */}
            <div className="border border-slate-300 rounded-lg overflow-hidden flex-1 overflow-y-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 sticky top-0 text-[13px]">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center w-12 whitespace-nowrap">No</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-48 whitespace-nowrap">기업명</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 min-w-[240px]">인증표준 (인증번호)</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center w-16 whitespace-nowrap">IAF</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center w-28 whitespace-nowrap">이전 심사 성격</th>
                    <th className="py-2.5 px-3 text-center w-28 whitespace-nowrap">차기 심사 기한</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-normal">
                  {modalManagedCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        {auditorCompanySearch ? '검색된 고객사가 없습니다.' : '현재 배정된 심사 고객사가 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    modalManagedCompanies.map((comp: any, cIdx: number) => {
                      const { auditType, nextDue } = getAuditStageAndNextDue(comp, cIdx);
                      return (
                        <tr key={comp.id || cIdx} className="hover:bg-blue-50/40 transition">
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-500 font-mono text-xs whitespace-nowrap">
                            {cIdx + 1}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-semibold text-[14px] text-slate-900 whitespace-nowrap">
                            {comp.companyName}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800">
                            <span className="font-mono text-[12.5px] leading-relaxed">
                              {formatStandardsWithCert(comp.standards, comp.certNo)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-slate-700 font-normal whitespace-nowrap">
                            {comp.iafCode || '--'}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center font-normal text-slate-700 whitespace-nowrap">
                            {auditType}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-normal text-slate-800 whitespace-nowrap">
                            {nextDue}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 shrink-0 text-xs">
              <span className="text-slate-500">
                총 <strong>{modalManagedCompanies.length}</strong>개사의 심사 및 인증 사후관리를 담당하고 있습니다.
              </span>
              <button
                type="button"
                onClick={() => setSelectedAuditor(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPANY AUDIT HISTORY MODAL                                               */}
      {/* ========================================================================= */}
      <CompanyAuditHistoryModal
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        company={selectedCompany}
        allAuditors={auditors}
      />

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
