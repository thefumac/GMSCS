import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Company, Auditor, CertContract, AuditProject, AuditContractRecord } from '../types';
import { CompanyAuditHistoryModal } from './CompanyAuditHistoryModal';
import { getAgencyDisplayName, isConflictOfInterest } from '../utils/conflictUtils';

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

// 지역(광역자치명 및 해외국가명) 추출 헬퍼 함수
const getRegionDisplay = (comp: Company): string => {
  const compAny = comp as any;
  const reg = (compAny.region || compAny.regionCode || '').trim();
  const addr = (comp.address || compAny.address || '').trim();

  // 1. 해외 국가 체크
  if (addr.includes('베트남') || reg.includes('베트남') || reg.includes('VN') || addr.includes('Vietnam')) return '베트남';
  if (addr.includes('중국') || reg.includes('중국') || reg.includes('CN') || addr.includes('China')) return '중국';
  if (addr.includes('인도네시아') || reg.includes('인니') || addr.includes('Indonesia')) return '인도네시아';
  if (addr.includes('미국') || reg.includes('USA') || addr.includes('USA')) return '미국';
  if (addr.includes('일본') || reg.includes('JP') || addr.includes('Japan')) return '일본';
  if (addr.includes('인도') || reg.includes('인도') || addr.includes('India')) return '인도';

  // 2. 국내 광역자치명 정규화 매핑
  const regionsMap: [string, string][] = [
    ['서울', '서울'],
    ['경기', '경기'],
    ['인천', '인천'],
    ['부산', '부산'],
    ['대구', '대구'],
    ['광주', '광주'],
    ['대전', '대전'],
    ['울산', '울산'],
    ['세종', '세종'],
    ['강원', '강원'],
    ['충북', '충북'],
    ['충청북도', '충북'],
    ['충남', '충남'],
    ['충청남도', '충남'],
    ['전북', '전북'],
    ['전라북도', '전북'],
    ['전남', '전남'],
    ['전라남도', '전남'],
    ['경북', '경북'],
    ['경상북도', '경북'],
    ['경남', '경남'],
    ['경상남도', '경남'],
    ['제주', '제주']
  ];

  // reg 필드 우선 매칭
  for (const [key, val] of regionsMap) {
    if (reg === key || reg.startsWith(key)) return val;
  }

  // address 필드 앞부분 매칭
  for (const [key, val] of regionsMap) {
    if (addr.startsWith(key) || addr.includes(key)) return val;
  }

  return reg || '경기';
};

export const ClientManagement: React.FC<ClientManagementProps> = ({
  companies,
  auditors,
  contracts = [],
  projects = [],
  onOpenReport
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedContractType, setSelectedContractType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Auditor map
  const auditorMap = useMemo(() => {
    const map = new Map<string, Auditor>();
    auditors.forEach(a => map.set(a.id, a));
    return map;
  }, [auditors]);

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

  // Helper: Get standard initial contract dates
  const getStandardInitialDates = (comp: Company, fallbackContract?: CertContract) => {
    const compAny = comp as any;
    const stdText = compAny.standards || 'ISO 9001:2015';
    const baseDate = comp.initialContractDate || fallbackContract?.initialCertDate || '2022-04-10';
    const datesMap = comp.standardInitialDates || {};

    const items: { label: string; date: string }[] = [];
    const has9001 = stdText.includes('9001');
    const has14001 = stdText.includes('14001');
    const has45001 = stdText.includes('45001');

    const totalStandards = (has9001 ? 1 : 0) + (has14001 ? 1 : 0) + (has45001 ? 1 : 0);

    if (totalStandards <= 1) {
      // 단일 규격인 경우 날짜만 표시
      return [{ label: '', date: datesMap['9001'] || baseDate }];
    }

    if (has9001) {
      items.push({ label: '9001', date: datesMap['9001'] || baseDate });
    }
    if (has14001) {
      items.push({ label: '14001', date: datesMap['14001'] || '2023-05-12' });
    }
    if (has45001) {
      items.push({ label: '45001', date: datesMap['45001'] || '2024-06-18' });
    }

    return items.length > 0 ? items : [{ label: '', date: baseDate }];
  };

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
      const contractType = c.initialContractType || compAny.initialContractType || '신규';

      // Search match
      const matchesSearch = !cleanSearch ||
        compName.includes(cleanSearch) ||
        ceo.includes(cleanSearch) ||
        biz.includes(cleanSearch) ||
        certNo.includes(cleanSearch) ||
        standards.includes(cleanSearch);

      // Standard match
      const matchesStandard = selectedStandard === 'all' || standards.includes(selectedStandard);

      // Contract type match
      const matchesType = selectedContractType === 'all' || contractType === selectedContractType;

      return matchesSearch && matchesStandard && matchesType;
    });
  }, [companies, searchTerm, selectedStandard, selectedContractType]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedCompanies = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCompanies.slice(start, start + PAGE_SIZE);
  }, [filteredCompanies, safePage]);

  return (
    <div className="space-y-3 animate-in fade-in">
      {/* 1. 상단 단일 조회바 */}
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
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-normal placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 focus:bg-white"
            />
          </div>

          {/* 규격 필터 */}
          <select
            value={selectedStandard}
            onChange={(e) => {
              setSelectedStandard(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-normal focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 인증 규격</option>
            <option value="9001">ISO 9001</option>
            <option value="14001">ISO 14001</option>
            <option value="45001">ISO 45001</option>
          </select>

          {/* 구분 필터 (신규, 전환, 재인증) */}
          <select
            value={selectedContractType}
            onChange={(e) => {
              setSelectedContractType(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-normal focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 구분</option>
            <option value="신규">신규</option>
            <option value="전환">전환</option>
            <option value="재인증">재인증</option>
          </select>
        </div>

        {/* 우측 카운터 및 페이지네이션 (볼드 제거) */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-mono font-normal">
          <div>
            총 <span className="text-cyan-700 font-normal">{filteredCompanies.length}</span>개사
            <span className="text-slate-400 ml-1 font-normal">({safePage}/{totalPages}p)</span>
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
            <span className="px-2 text-xs font-normal">{safePage}</span>
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
              <tr className="bg-slate-100 text-slate-700 font-normal border-b border-slate-300 select-none text-[12px]">
                <th className="py-2.5 px-2 text-center w-10 text-slate-500 font-normal border-r border-slate-300">
                  No
                </th>
                <th className="py-2.5 px-3 min-w-[155px] font-normal border-r border-slate-300">
                  고객사명 (대표자 / 사업자번호)
                </th>
                <th className="py-2.5 px-3 min-w-[145px] font-normal border-r border-slate-300">
                  인증규격 (인증번호)
                </th>
                <th className="py-2.5 px-2 text-center w-14 font-normal border-r border-slate-300">
                  지역
                </th>
                <th className="py-2.5 px-2 text-center min-w-[65px] font-normal border-r border-slate-300">
                  구분
                </th>
                <th className="py-2.5 px-3 text-center min-w-[125px] font-normal border-r border-slate-300">
                  최초 계약일 (규격별)
                </th>
                <th className="py-2.5 px-2 text-center min-w-[60px] font-normal border-r border-slate-300">
                  직원수
                </th>
                <th className="py-2.5 px-3 min-w-[190px] font-normal border-r border-slate-300">
                  인증범위 및 IAF 코드
                </th>
                <th className="py-2.5 px-2 text-center min-w-[80px] font-normal border-r border-slate-300">
                  담당 심사원
                </th>
                <th className="py-2.5 px-2 text-center min-w-[85px] font-normal">
                  협력기관
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-normal">
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-normal">
                    검색 조건에 일치하는 고객사 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((comp, idx) => {
                  const compAny = comp as any;
                  const managingAuditor = auditorMap.get(comp.managingAuditorId || '') || { name: compAny.assignedAuditor || '남경호' };
                  const stdText = compAny.standards || 'ISO 9001:2015';
                  const certNo = compAny.certNo || 'Q260101';
                  const fallbackContract = contractMap.get(comp.id);
                  const standardDates = getStandardInitialDates(comp, fallbackContract);
                  const contractType = comp.initialContractType || compAny.initialContractType || '신규';
                  const employees = comp.totalEmployees || compAny.employees || 10;
                  const iafCode = comp.iafCode || compAny.iafCode || '17';
                  const scope = comp.scope || compAny.scope || comp.industry || '제품 및 서비스의 개발, 제조 및 부가서비스';
                  const region = getRegionDisplay(comp);
                  const agencyDisplay = getAgencyDisplayName(comp.consultant || compAny.consultant, managingAuditor.name);

                  return (
                    <tr
                      key={comp.id}
                      onClick={() => setSelectedCompany(comp)}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      title="클릭 시 고객사 상세 이력 및 심사 현황 팝업을 확인합니다."
                    >
                      {/* No */}
                      <td className="py-2.5 px-1 text-center font-mono text-slate-400 text-xs font-normal align-middle border-r border-slate-200">
                        {(safePage - 1) * PAGE_SIZE + idx + 1}
                      </td>

                      {/* 고객사명: 오직 회사명만 볼드(font-bold) 유지 */}
                      <td className="py-2.5 px-3 align-middle border-r border-slate-200">
                        <div className="text-slate-900 flex items-center gap-1">
                          <span className="font-bold underline decoration-slate-300 hover:decoration-cyan-600 underline-offset-2">
                            {comp.companyName}
                          </span>
                          <ExternalLink className="w-3 h-3 text-cyan-600 opacity-60 shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {comp.ceoName} 대표 {comp.bizNumber ? `(${comp.bizNumber})` : ''}
                        </div>
                      </td>

                      {/* 인증규격 (인증번호) - 규격명 줄바꿈 방지 및 볼드 제거 */}
                      <td className="py-2.5 px-3 leading-snug align-middle border-r border-slate-200 whitespace-nowrap">
                        <div className="text-slate-700 font-normal whitespace-nowrap">
                          {stdText}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] font-normal mt-0.5 whitespace-nowrap">
                          ({certNo})
                        </div>
                      </td>

                      {/* 지역 (광역자치명 또는 해외국가명) */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-xs font-normal text-slate-700">
                        {region}
                      </td>

                      {/* 구분 (신규, 전환, 재인증) */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-xs font-normal text-slate-700">
                        {contractType}
                      </td>

                      {/* 최초 계약일 (규격별) */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap align-middle border-r border-slate-200 font-mono text-xs font-normal text-slate-600">
                        {standardDates.map((item, dIdx) => (
                          <div key={dIdx} className="leading-tight">
                            {item.label ? (
                              <span>
                                <span className="text-slate-400 text-[10.5px] font-normal mr-1">{item.label}:</span>
                                <span className="text-slate-600 font-normal">{item.date}</span>
                              </span>
                            ) : (
                              <span className="text-slate-600 font-normal">{item.date}</span>
                            )}
                          </div>
                        ))}
                      </td>

                      {/* 직원수 */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-xs font-normal text-slate-700">
                        {employees}명
                      </td>

                      {/* 인증범위 및 IAF 코드 */}
                      <td className="py-2.5 px-3 align-middle border-r border-slate-200">
                        <div className="text-[11.5px] text-slate-600 font-normal leading-snug line-clamp-2" title={`[IAF ${iafCode}] ${scope}`}>
                          <span className="text-slate-500 font-mono font-normal mr-1">[IAF {iafCode}]</span>
                          <span className="text-slate-700 font-normal">{scope}</span>
                        </div>
                      </td>

                      {/* 담당 심사원 (독립 컬럼) */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-xs font-normal text-slate-700">
                        {managingAuditor.name}
                      </td>

                      {/* 협력기관 (독립 컬럼, 이해충돌 방지 적용) */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle text-xs font-normal text-slate-700">
                        {agencyDisplay === '—' ? (
                          <span className="text-slate-400 font-mono" title="이해충돌 방지 (담당심사원과 동일)">—</span>
                        ) : (
                          <span>{agencyDisplay}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 테이블 푸터 */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-normal">
          <div>
            * 고객사 목록의 행을 클릭하면 규격별 심사이력, 인증서, 심사계획 및 배정 정보 상세 팝업이 표시됩니다.
          </div>
          <div className="font-mono text-slate-600 font-normal">
            총 {filteredCompanies.length}개사 중 {filteredCompanies.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} ~ {Math.min(filteredCompanies.length, safePage * PAGE_SIZE)}개사 표시
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
