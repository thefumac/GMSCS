import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Company, Auditor, CertContract, AuditProject, AuditContractRecord } from '../types';
import { CompanyAuditHistoryModal } from './CompanyAuditHistoryModal';
import { NewCompanyModal } from './NewCompanyModal';
import { getAgencyDisplayName, isConflictOfInterest } from '../utils/conflictUtils';
import { GMS_AVAILABLE_STANDARDS } from '../constants/standards';
import { getCompanyAuditState, getAuditStateBadgeClass, CompanyAuditState, getAuditTimelineStatus } from '../utils/auditStateUtils';
import { MIGRATED_AUDIT_DOCUMENTS } from '../data/driveReportFiles';
import { Building2, CheckCircle2, AlertTriangle, Cloud, Clock } from 'lucide-react';

export interface ClientManagementProps {
  companies: Company[];
  auditors: Auditor[];
  contracts?: CertContract[];
  auditContracts?: AuditContractRecord[];
  projects?: AuditProject[];
  onOpenReport?: (reportId: string) => void;
  onOpenEmailModal?: (recipientName?: string, recipientEmail?: string, templateType?: string) => void;
  onAddCompany?: (company: Company) => void;
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
  if (addr.includes('미국') || reg.includes('USA')) return '미국';
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
  onOpenReport,
  onAddCompany
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'dormant' | 'cloudDocs'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedAuditState, setSelectedAuditState] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedAuditor, setSelectedAuditor] = useState<string>('all');
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState<boolean>(false);

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

  // Cloud PDF Document Map per company
  const cloudDocMap = useMemo(() => {
    const map = new Map<string, number>();
    MIGRATED_AUDIT_DOCUMENTS.forEach(doc => {
      const cleanName = (doc.companyName || '').replace(/[\(\)주식회사\s\-_]/g, '').toLowerCase();
      if (cleanName) {
        map.set(cleanName, (map.get(cleanName) || 0) + 1);
      }
    });
    return map;
  }, []);

  const getCloudDocCount = (comp: Company): number => {
    const cleanName = comp.companyName.replace(/[\(\)주식회사\s\-_]/g, '').toLowerCase();
    return cloudDocMap.get(cleanName) || 0;
  };

  // Client category statistics
  const counts = useMemo(() => {
    let active = 0;
    let dormant = 0;
    let cloudDocs = 0;

    companies.forEach(c => {
      const state = getCompanyAuditState(c, contractMap.get(c.id), projectMap.get(c.id));
      if (state === '자격정지') {
        dormant++;
      } else {
        active++;
      }
      if (getCloudDocCount(c) > 0) {
        cloudDocs++;
      }
    });

    return {
      all: companies.length,
      active,
      dormant,
      cloudDocs
    };
  }, [companies, contractMap, projectMap, cloudDocMap]);

  // 1. 고유 지역 목록 추출
  const regionOptions = useMemo(() => {
    const set = new Set<string>();
    companies.forEach(c => {
      const reg = getRegionDisplay(c);
      if (reg) set.add(reg);
    });
    const preferredOrder = ['경기', '서울', '충남', '경남', '전남', '부산', '인천', '충북', '경북', '전북', '강원', '대구', '대전', '광주', '울산', '세종', '제주', '베트남', '중국'];
    return Array.from(set).sort((a, b) => {
      const ia = preferredOrder.indexOf(a);
      const ib = preferredOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b, 'ko');
    });
  }, [companies]);

  // 2. 담당 심사원 목록 추출
  const auditorOptions = useMemo(() => {
    const names = new Set<string>();
    auditors.forEach(a => {
      if (a.name) names.add(a.name);
    });
    companies.forEach(c => {
      const compAny = c as any;
      if (compAny.assignedAuditor) names.add(compAny.assignedAuditor);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [auditors, companies]);

  // 3. 고유 협력기관 목록 추출
  const agencyOptions = useMemo(() => {
    const agencies = new Set<string>();
    companies.forEach(c => {
      const compAny = c as any;
      const managingAuditor = auditorMap.get(c.managingAuditorId || '') || { name: compAny.assignedAuditor || '남경호' };
      const agencyName = getAgencyDisplayName(c.consultant || compAny.consultant, managingAuditor.name);
      if (agencyName && agencyName !== '—') {
        agencies.add(agencyName);
      }
    });
    const list = Array.from(agencies).filter(a => a !== 'HQ').sort((a, b) => a.localeCompare(b, 'ko'));
    return ['HQ', ...list];
  }, [companies, auditorMap]);

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
      const region = getRegionDisplay(c);
      const managingAuditor = auditorMap.get(c.managingAuditorId || '') || { name: compAny.assignedAuditor || '남경호' };
      const agencyDisplay = getAgencyDisplayName(c.consultant || compAny.consultant, managingAuditor.name);
      const auditState = getCompanyAuditState(c, contractMap.get(c.id), projectMap.get(c.id));
      const cloudCount = getCloudDocCount(c);

      // 0. 스마트 분류 탭 필터
      if (activeTab === 'active' && auditState === '자격정지') return false;
      if (activeTab === 'dormant' && auditState !== '자격정지') return false;
      if (activeTab === 'cloudDocs' && cloudCount === 0) return false;

      // 1. 텍스트 검색 매칭 (기업명, 대표자, 사업자번호, 인증번호)
      const matchesSearch = !cleanSearch ||
        compName.includes(cleanSearch) ||
        ceo.includes(cleanSearch) ||
        biz.includes(cleanSearch) ||
        certNo.includes(cleanSearch) ||
        standards.includes(cleanSearch);

      // 2. 인증 규격 매칭 (GMS_AVAILABLE_STANDARDS 변수 기반)
      let matchesStandard = true;
      if (selectedStandard !== 'all') {
        const stdNumberMatch = selectedStandard.match(/\d+/);
        const stdNumber = stdNumberMatch ? stdNumberMatch[0] : selectedStandard;
        matchesStandard = standards.includes(stdNumber) || standards.includes(selectedStandard.toLowerCase());
      }

      // 3. 지역 매칭
      const matchesRegion = selectedRegion === 'all' || region === selectedRegion;

      // 4. 담당 심사원 매칭
      const rawAssigned = compAny.assignedAuditor || c.assignedAuditorName || '';
      const matchesAuditor = selectedAuditor === 'all' ||
        managingAuditor.name === selectedAuditor ||
        (rawAssigned && rawAssigned.includes(selectedAuditor)) ||
        (c.consultant && c.consultant.includes(selectedAuditor));

      // 5. 협력기관 매칭
      const matchesAgency = selectedAgency === 'all' || agencyDisplay === selectedAgency;

      // 6. 인증상태 매칭 (최근 2년 미시행 자격정지 및 진행단계)
      const matchesAuditState = selectedAuditState === 'all' || auditState === selectedAuditState;

      return matchesSearch && matchesStandard && matchesRegion && matchesAuditor && matchesAgency && matchesAuditState;
    });
  }, [companies, activeTab, searchTerm, selectedStandard, selectedRegion, selectedAuditor, selectedAgency, selectedAuditState, auditorMap, contractMap, projectMap, cloudDocMap]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedCompanies = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCompanies.slice(start, start + PAGE_SIZE);
  }, [filteredCompanies, safePage]);

  return (
    <div className="space-y-3 animate-in fade-in">
      {/* 0. 상단 스마트 고객 분류 탭 (전체 573 / 활성 정기유지 / 2년 미실시 휴면 / 클라우드 PDF 보관) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
          className={`p-2.5 rounded border text-left transition cursor-pointer flex items-center justify-between ${
            activeTab === 'all'
              ? 'bg-cyan-50/90 border-cyan-500 ring-1 ring-cyan-500 text-cyan-950 shadow-2xs'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded ${activeTab === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-normal">전체 고객사 DB</div>
              <div className="text-sm font-bold text-slate-800">{counts.all}<span className="text-xs font-normal text-slate-500 ml-0.5">개사</span></div>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-normal">누적전체</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
          className={`p-2.5 rounded border text-left transition cursor-pointer flex items-center justify-between ${
            activeTab === 'active'
              ? 'bg-emerald-50/90 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950 shadow-2xs'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded ${activeTab === 'active' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-normal">정기유지 · 활성 고객사</div>
              <div className="text-sm font-bold text-emerald-700">{counts.active}<span className="text-xs font-normal text-slate-500 ml-0.5">개사</span></div>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-normal">정상유지</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('dormant'); setCurrentPage(1); }}
          className={`p-2.5 rounded border text-left transition cursor-pointer flex items-center justify-between ${
            activeTab === 'dormant'
              ? 'bg-amber-50/90 border-amber-500 ring-1 ring-amber-500 text-amber-950 shadow-2xs'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded ${activeTab === 'dormant' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-normal">2년 미실시 휴면·만료 대상</div>
              <div className="text-sm font-bold text-amber-700">{counts.dormant}<span className="text-xs font-normal text-slate-500 ml-0.5">개사</span></div>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-normal">집중관리</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('cloudDocs'); setCurrentPage(1); }}
          className={`p-2.5 rounded border text-left transition cursor-pointer flex items-center justify-between ${
            activeTab === 'cloudDocs'
              ? 'bg-sky-50/90 border-sky-500 ring-1 ring-sky-500 text-sky-950 shadow-2xs'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded ${activeTab === 'cloudDocs' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600'}`}>
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-normal">클라우드 PDF 보관 기업</div>
              <div className="text-sm font-bold text-sky-700">{counts.cloudDocs}<span className="text-xs font-normal text-slate-500 ml-0.5">개사 (790건)</span></div>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-mono font-normal">PDF보관</span>
        </button>
      </div>

      {/* 1. 상단 단일 조회바 (인증규격 전체 메뉴 + 인증상태 + 지역 + 담당심사원 + 협력기관 검색창) */}
      <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* 검색창 */}
          <div className="relative min-w-[200px] max-w-[260px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="기업명, 대표자, 사업자번호 검색"
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-normal placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 focus:bg-white"
            />
          </div>

          {/* 인증상태 필터 (전체, 인증유지, 일정·계획, 보고서작성, 심의중, 자격정지) */}
          <select
            value={selectedAuditState}
            onChange={(e) => {
              setSelectedAuditState(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-700 font-semibold focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 인증상태</option>
            <option value="인증유지">인증유지</option>
            <option value="일정·계획">일정·계획</option>
            <option value="보고서작성">보고서작성</option>
            <option value="심의중">심의중</option>
            <option value="자격정지">자격정지 (2년 미시행)</option>
          </select>

          {/* 인증규격 필터 (GMS_AVAILABLE_STANDARDS 변수에서 동적 생성) */}
          <select
            value={selectedStandard}
            onChange={(e) => {
              setSelectedStandard(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-700 font-normal focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 인증 규격</option>
            {GMS_AVAILABLE_STANDARDS.map((std) => (
              <option key={std.code} value={std.code}>
                {std.code} ({std.name.split(' ')[0]})
              </option>
            ))}
          </select>

          {/* 지역 검색 필터 */}
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-700 font-normal focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 지역</option>
            {regionOptions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>

          {/* 담당 심사원 검색 필터 */}
          <select
            value={selectedAuditor}
            onChange={(e) => {
              setSelectedAuditor(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-700 font-normal focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 담당심사원</option>
            {auditorOptions.map((name) => (
              <option key={name} value={name}>
                {name} 심사원
              </option>
            ))}
          </select>

          {/* 협력기관 검색 필터 */}
          <select
            value={selectedAgency}
            onChange={(e) => {
              setSelectedAgency(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-700 font-normal focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 협력기관</option>
            {agencyOptions.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>
        </div>

        {/* 우측 카운터, 페이지네이션 및 신규 등록 버튼 */}
        <div className="flex items-center gap-2.5 text-xs text-slate-600 font-mono font-normal">
          <div>
            총 <span className="text-cyan-700 font-normal">{filteredCompanies.length}</span>개사
            <span className="text-slate-400 ml-1 font-normal">({safePage}/{totalPages}p)</span>
          </div>
          <div className="inline-flex items-center bg-slate-50 border border-slate-300 rounded p-0.5">
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

          {/* 신규 고객 등록 버튼 */}
          <button
            type="button"
            onClick={() => setIsNewCompanyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-700 to-sky-700 hover:from-cyan-800 hover:to-sky-800 text-white rounded font-sans font-medium text-xs shadow-2xs hover:shadow-xs transition cursor-pointer ml-1"
            title="신규 고객사 및 타기관 전환 기업 등록"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>신규 고객 등록</span>
          </button>
        </div>
      </div>

      {/* 2. 고객관리 엑셀 목록형 테이블 */}
      <div className="bg-white rounded border border-slate-300 shadow-2xs overflow-hidden">
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
                  최초 계약일
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
                <th className="py-2.5 px-2 text-center min-w-[85px] font-normal border-r border-slate-300">
                  협력기관
                </th>
                <th className="py-2.5 px-2 text-center min-w-[80px] font-normal">
                  인증상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-normal">
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 font-normal">
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
                  const auditState = getCompanyAuditState(comp, fallbackContract, projectMap.get(comp.id));

                  const cloudCount = getCloudDocCount(comp);

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
                        <div className="text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold underline decoration-slate-300 hover:decoration-cyan-600 underline-offset-2">
                            {comp.companyName}
                          </span>
                          <ExternalLink className="w-3 h-3 text-cyan-600 opacity-60 shrink-0" />
                          {cloudCount > 0 && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10.5px] rounded bg-sky-50 text-sky-700 border border-sky-200 font-normal font-mono"
                              title={`클라우드 스토리지 보관 보고서 및 인증서 ${cloudCount}건 보유`}
                            >
                              <Cloud className="w-2.5 h-2.5" />
                              <span>{cloudCount}건</span>
                            </span>
                          )}
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

                      {/* 최초 계약일 */}
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
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-xs font-normal text-slate-700" title={compAny.assignedAuditor || comp.assignedAuditorName || managingAuditor.name}>
                        {compAny.assignedAuditor || comp.assignedAuditorName || managingAuditor.name}
                      </td>

                      {/* 협력기관 (독립 컬럼, 이해충돌 방지 적용) */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-xs font-normal text-slate-700">
                        {agencyDisplay === '—' ? (
                          <span className="text-slate-400 font-mono" title="이해충돌 방지 (담당심사원과 동일)">—</span>
                        ) : (
                          <span>{agencyDisplay}</span>
                        )}
                      </td>

                      {/* 인증상태 및 12/24/34개월 발행 마감 알람 */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap align-middle text-xs font-normal">
                        <span className={`px-2 py-0.5 text-[11px] rounded font-normal ${getAuditStateBadgeClass(auditState)}`}>
                          {auditState}
                        </span>
                        {(() => {
                          const timeline = getAuditTimelineStatus(comp, fallbackContract, projectMap.get(comp.id));
                          if (!timeline) return null;
                          if (timeline.isOverdue) {
                            return (
                              <div className="text-[10px] text-rose-600 font-normal mt-0.5" title={`발행기한: ${timeline.deadlineDate}`}>
                                발행기한초과 ({Math.abs(timeline.daysRemainingToDeadline)}일)
                              </div>
                            );
                          }
                          if (timeline.isPrepAlert) {
                            return (
                              <div className="text-[10px] text-amber-700 font-normal mt-0.5 flex items-center justify-center gap-0.5" title={`발행마감 ${timeline.deadlineDate} (준비착수일 ${timeline.prepStartDate})`}>
                                <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>준비착수 D-{timeline.daysRemainingToDeadline}</span>
                              </div>
                            );
                          }
                          return null;
                        })()}
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

      {/* 신규 고객 등록 모달 (신규/전환) */}
      <NewCompanyModal
        isOpen={isNewCompanyModalOpen}
        onClose={() => setIsNewCompanyModalOpen(false)}
        onSave={(newCompany) => {
          onAddCompany?.(newCompany);
          setIsNewCompanyModalOpen(false);
          setSelectedCompany(newCompany);
        }}
        auditors={auditors}
      />
    </div>
  );
};
