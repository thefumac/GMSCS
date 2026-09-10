import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  FileCheck,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Plus
} from 'lucide-react';
import { Company, Auditor, CertContract, AuditProject, AuditContractRecord } from '../types';
import { CompanyAuditHistoryModal } from './CompanyAuditHistoryModal';

export interface ClientManagementProps {
  companies: Company[];
  auditors: Auditor[];
  contracts?: CertContract[];
  auditContracts?: AuditContractRecord[];
  projects?: AuditProject[];
  onOpenReport?: (reportId: string) => void;
  onOpenEmailModal?: (recipientName?: string, recipientEmail?: string, templateType?: string) => void;
}

const PAGE_SIZE = 20;

export const ClientManagement: React.FC<ClientManagementProps> = ({
  companies,
  auditors,
  contracts = [],
  projects = [],
  onOpenReport,
  onOpenEmailModal
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Auditor map
  const auditorMap = useMemo(() => {
    const map = new Map<string, Auditor>();
    auditors.forEach(a => map.set(a.id, a));
    return map;
  }, [auditors]);

  // Project map by companyId
  const projectMap = useMemo(() => {
    const map = new Map<string, AuditProject>();
    projects.forEach(p => {
      if (!map.has(p.companyId)) {
        map.set(p.companyId, p);
      }
    });
    return map;
  }, [projects]);

  // Contract map by companyId
  const contractMap = useMemo(() => {
    const map = new Map<string, CertContract>();
    contracts.forEach(c => {
      if (!map.has(c.companyId)) {
        map.set(c.companyId, c);
      }
    });
    return map;
  }, [contracts]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    const cleanSearch = searchTerm.replace(/\s+/g, '').toLowerCase();

    return companies.filter(c => {
      const compAny = c as any;
      const certNo = (compAny.certNo || '').toLowerCase();
      const standards = (compAny.standards || '').toLowerCase();
      const compName = c.companyName.replace(/\s+/g, '').toLowerCase();
      const ceo = (c.ceoName || '').replace(/\s+/g, '').toLowerCase();
      const biz = (c.bizNumber || '').replace(/[-\s]/g, '');

      // Search match
      const matchesSearch = !cleanSearch ||
        compName.includes(cleanSearch) ||
        ceo.includes(cleanSearch) ||
        biz.includes(cleanSearch) ||
        certNo.includes(cleanSearch) ||
        standards.includes(cleanSearch);

      // Standard match
      const matchesStandard = selectedStandard === 'all' || standards.includes(selectedStandard);

      // Status match
      const prj = projectMap.get(c.id);
      let matchesStatus = true;
      if (selectedStatus === 'contracted') {
        matchesStatus = Boolean(contractMap.get(c.id));
      } else if (selectedStatus === 'plan_sent') {
        matchesStatus = Boolean(prj && (prj.status === '계획서발송' || prj.planSentDate));
      } else if (selectedStatus === 'in_progress') {
        matchesStatus = Boolean(prj && prj.status === '심사진행중');
      }

      return matchesSearch && matchesStandard && matchesStatus;
    });
  }, [companies, searchTerm, selectedStandard, selectedStatus, projectMap, contractMap]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedCompanies = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCompanies.slice(start, start + PAGE_SIZE);
  }, [filteredCompanies, safePage]);

  return (
    <div className="space-y-3 animate-in fade-in">
      {/* 1. 상단 단일 조회바 (원칙 준수) */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* 검색창 */}
          <div className="relative min-w-[240px] max-w-[340px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="기업명, 대표자, 사업자번호, 인증번호 검색"
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 focus:bg-white"
            />
          </div>

          {/* 규격 필터 */}
          <select
            value={selectedStandard}
            onChange={(e) => {
              setSelectedStandard(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 인증 규격</option>
            <option value="9001">ISO 9001</option>
            <option value="14001">ISO 14001</option>
            <option value="45001">ISO 45001</option>
          </select>

          {/* 진행 상태 필터 */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 계약·계획 상태</option>
            <option value="contracted">심사계약 완료 기업</option>
            <option value="plan_sent">계획서 발송 완료</option>
            <option value="in_progress">심사진행 중</option>
          </select>
        </div>

        {/* 우측 카운터 및 페이지네이션 */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
          <div>
            총 <strong className="text-cyan-700 font-bold">{filteredCompanies.length}</strong>개사
            <span className="text-slate-400 ml-1">({safePage}/{totalPages}p)</span>
          </div>
          <div className="inline-flex items-center bg-slate-50 border border-slate-300 rounded-lg p-0.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 hover:bg-white disabled:opacity-30 rounded transition cursor-pointer"
              title="이전 페이지"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold text-xs">{safePage}</span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 hover:bg-white disabled:opacity-30 rounded transition cursor-pointer"
              title="다음 페이지"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 고객관리 엑셀 목록형 테이블 */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 select-none text-[12px]">
                <th className="py-2.5 px-2 text-center w-10 text-slate-500 font-normal border-r border-slate-300">
                  No
                </th>
                <th className="py-2.5 px-3 min-w-[160px] border-r border-slate-300">
                  고객사명 (대표자 / 사업자번호)
                </th>
                <th className="py-2.5 px-3 min-w-[170px] border-r border-slate-300">
                  인증규격 (인증번호)
                </th>
                <th className="py-2.5 px-2 text-center min-w-[90px] border-r border-slate-300">
                  영업/협력기관
                </th>
                <th className="py-2.5 px-2 text-center min-w-[90px] border-r border-slate-300">
                  담당 심사원
                </th>
                <th className="py-2.5 px-3 text-center min-w-[120px] border-r border-slate-300 bg-slate-50/70">
                  심사계약 관리
                </th>
                <th className="py-2.5 px-3 text-center min-w-[130px] border-r border-slate-300 bg-slate-50/70">
                  심사계획 수립/발송
                </th>
                <th className="py-2.5 px-2 text-center min-w-[80px] bg-slate-50/70">
                  상세이력
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-normal">
                    검색 조건에 일치하는 고객사 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((comp, idx) => {
                  const compAny = comp as any;
                  const prj = projectMap.get(comp.id);
                  const managingAuditor = auditorMap.get(comp.managingAuditorId || '') || { name: compAny.assignedAuditor || '남경호' };
                  const stdText = compAny.standards || 'ISO 9001:2015';
                  const certNo = compAny.certNo || 'Q260101';
                  const hasContract = Boolean(contractMap.get(comp.id));
                  const isPlanSent = Boolean(prj && (prj.status === '계획서발송' || prj.planSentDate));

                  return (
                    <tr
                      key={comp.id}
                      onClick={() => setSelectedCompany(comp)}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      title="클릭 시 고객사 전체 심사이력 및 상세정보를 확인합니다."
                    >
                      {/* No */}
                      <td className="py-2 px-1 text-center font-mono text-slate-400 text-xs align-middle border-r border-slate-200">
                        {(safePage - 1) * PAGE_SIZE + idx + 1}
                      </td>

                      {/* 고객사명 */}
                      <td className="py-2 px-3 align-middle border-r border-slate-200">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <span className="underline decoration-slate-300 hover:decoration-cyan-600 underline-offset-2">
                            {comp.companyName}
                          </span>
                          <ExternalLink className="w-3 h-3 text-cyan-600 opacity-60" />
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {comp.ceoName} 대표 {comp.bizNumber ? `(${comp.bizNumber})` : ''}
                        </div>
                      </td>

                      {/* 인증규격 */}
                      <td className="py-2 px-3 leading-snug align-middle border-r border-slate-200 whitespace-nowrap">
                        <div className="text-slate-800 font-medium whitespace-nowrap">
                          {stdText}
                        </div>
                        <div className="text-slate-900 font-mono text-[11px] font-bold mt-0.5 whitespace-nowrap">
                          ({certNo})
                        </div>
                      </td>

                      {/* 영업구분/협력기관 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-[11.5px]">
                        <div className="text-slate-800">{compAny.agency || compAny.salesType || 'HQ직영'}</div>
                        {compAny.consultant && (
                          <div className="text-[10.5px] text-slate-400 mt-0.5">{compAny.consultant}</div>
                        )}
                      </td>

                      {/* 담당 심사원 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-[12px] font-medium text-slate-900">
                        {managingAuditor.name}
                      </td>

                      {/* 심사계약 관리 */}
                      <td className="py-2 px-3 text-center align-middle border-r border-slate-200 whitespace-nowrap">
                        {hasContract ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11.5px]">
                            <span>계약체결 완료</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompany(comp);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-300 transition cursor-pointer"
                          >
                            + 계약서 작성
                          </button>
                        )}
                      </td>

                      {/* 심사계획 수립/발송 */}
                      <td className="py-2 px-3 text-center align-middle border-r border-slate-200 whitespace-nowrap">
                        {isPlanSent ? (
                          <span className="text-cyan-800 font-bold text-[11.5px]" title={prj?.planSentDate ? `발송일: ${prj.planSentDate}` : '발송완료'}>
                            계획서 발송완료
                          </span>
                        ) : prj ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenEmailModal) {
                                onOpenEmailModal(comp.companyName, comp.contactEmail, '심사계획서');
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-[11px] border border-cyan-300 transition cursor-pointer"
                          >
                            계획서 발송
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </td>

                      {/* 상세이력 버튼 */}
                      <td className="py-2 px-2 text-center align-middle whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompany(comp);
                          }}
                          className="px-2 py-1 rounded bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-900 border border-slate-200 text-xs font-medium transition cursor-pointer"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 테이블 푸터 */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            * 고객사 목록을 클릭하면 계약서 내역, 심사 계획서, 심사이력 및 담당 심사원 교체 배정을 확인할 수 있습니다.
          </div>
          <div className="font-mono text-slate-600">
            총 {filteredCompanies.length}개사 중 {Math.min(filteredCompanies.length, (safePage - 1) * PAGE_SIZE + 1)} ~ {Math.min(filteredCompanies.length, safePage * PAGE_SIZE)}개사 표시
          </div>
        </div>
      </div>

      {/* 기업 전체 심사 이력 팝업 모달 */}
      <CompanyAuditHistoryModal
        isOpen={Boolean(selectedCompany)}
        onClose={() => setSelectedCompany(null)}
        company={selectedCompany}
        contracts={contracts}
        projects={projects}
        allAuditors={auditors}
        onOpenReport={onOpenReport}
      />
    </div>
  );
};
