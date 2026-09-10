import React, { useState, useMemo } from 'react';
import {
  Building2,
  Briefcase,
  FileText,
  CheckCircle2,
  Search,
  Send,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon,
  Layers,
  X,
  Megaphone,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Award,
  ExternalLink,
  DollarSign,
  CreditCard,
  ShieldCheck,
  BadgeCheck,
  Download,
  Printer,
  UserCheck,
  Clock,
  Calculator,
  Info,
  Sliders,
  Check,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Auditor, Company, AuditProject, CertContract, AuditorSettlement, AuditReport, AuditorNotice } from '../types';
import { CompanyAuditHistoryModal } from './CompanyAuditHistoryModal';

export type AuditLifecycleState =
  | '심사 중'
  | '심사준비'
  | '인증유지';

export type SettlementLifecycleState =
  | '입금확인중'
  | '입금확인완료'
  | '9월 25일 입금예정'
  | '10월 25일 입금예정'
  | '입금완료';

export interface CompanyWithStatus {
  company: Company;
  contract?: CertContract;
  project?: AuditProject;
  report?: AuditReport;
  settlement?: AuditorSettlement;
  auditState: AuditLifecycleState;
  settlementState: SettlementLifecycleState;
  stageText: string;
  stdAndCerts: { std: string; certNo: string }[];
  dueDate: string;
  prepStartDate: string;
  auditStartDate?: string;
  auditEndDate?: string;
  dday: { days: number; text: string; isUrgent: boolean; isOverdue: boolean };
}

// 심사 일정 단위 행 인터페이스
// 불필요한 약어 (QMS, EMS, OHS 등) 제거 헬퍼
export function cleanStandardName(std: string): string {
  if (!std) return '';
  return std.replace(/\s*\((?:QMS|EMS|OHS|ISMS|품질|환경|안전보건|안전)\)/gi, '').trim();
}

// 사무국 공인 최신 규격 버전 기본값 (ISO 14001: 2026 기본 반영)
export const DEFAULT_OFFICIAL_STANDARD_VERSIONS: Record<string, string> = {
  'ISO 9001': '2015',
  'ISO 14001': '2026', // 사용자 지정: 14001은 2026
  'ISO 45001': '2018',
  'ISO 27001': '2022',
  'ISO 50001': '2018',
  'ISO 22000': '2018',
  'ESG-MS': '2023',
  'ISO 13485': '2016',
};

// 구버전 규격 감지 헬퍼 (구버전일 경우 빨간색 강조)
export function checkOutdatedStandard(stdStr: string, officialVersions: Record<string, string>): {
  isOutdated: boolean;
  stdKey: string;
  currentVersion: string;
  officialVersion: string;
} {
  const cleaned = cleanStandardName(stdStr);
  const match = cleaned.match(/^([A-Za-z0-9\s-]+):(\d{4})/);
  if (match) {
    const stdKey = match[1].trim();
    const currentVer = match[2];
    const officialVer = officialVersions[stdKey];
    if (officialVer && parseInt(currentVer, 10) < parseInt(officialVer, 10)) {
      return { isOutdated: true, stdKey, currentVersion: currentVer, officialVersion: officialVer };
    }
  }
  return { isOutdated: false, stdKey: '', currentVersion: '', officialVersion: '' };
}

// 심사일정이 같으면 1개 행으로 통합되고, 일정이 다르면 별개 행으로 관리되며 각자의 진행상태를 가짐
export interface AuditScheduleRow {
  rowId: string;
  companyId: string;
  companyName: string;
  ceoName: string;
  bizNumber: string;
  companyWithStatus: CompanyWithStatus;
  standardsText: string;
  standardsList: string[]; // 개별 규격 리스트
  certNo: string;
  iafCode: string;
  stageText: '1차 사후' | '2차 사후' | '갱신';
  dueDate: string;
  dday: { days: number; text: string; isUrgent: boolean; isOverdue: boolean };
  auditorRole: '팀장' | '심사원' | '심사원보' | '협력기관';
  consultant: string;
  auditState: AuditLifecycleState;
  isIntegrated: boolean; // 통합심사 여부
  // 신규 필드 (협력기관 대체 및 구버전 감지)
  recentAuditDate: string; // 최근 심사일/기간 (예: "2025-09-24 ~ 09-25")
  auditMd: number; // 심사 공수 (MD)
  hasOutdatedStandard: boolean; // 구버전 규격 포함 여부 (인증번호 빨간색)
  outdatedStandardsList: string[]; // 구버전 목록
}

interface AuditorPortalProps {
  currentAuditor: Auditor;
  allAuditors: Auditor[];
  companies: Company[];
  projects: AuditProject[];
  contracts: CertContract[];
  settlements?: AuditorSettlement[];
  notices?: AuditorNotice[];
  onOpenReport: (reportId: string) => void;
  onOpenPdfReport?: (info: { title: string; companyName: string; standard?: string; auditType?: string; auditDate?: string; pdfUrl?: string }) => void;
  onNavigateToSettlement?: () => void;
  onNavigateToReports?: () => void;
  onRequestReassignment?: (projectId: string, log: any) => void;
  onOpenEmailModal: (recipientName?: string, recipientEmail?: string, templateType?: any) => void;
}

// 심사 단계 판별
function getAuditStageText(company: Company, contract?: CertContract, project?: AuditProject): '1차 사후' | '2차 사후' | '갱신' {
  const compName = company.companyName;

  // 송이실업: 2026년 9월 갱신심사 완료 -> 차기 1차 사후
  if (compName.includes('송이실업')) {
    return '1차 사후';
  }

  // 2026년 완료된 기업들 -> 차기 갱신심사
  if (compName.includes('디아이엔바이로') || compName.includes('디아이앤바이로') ||
      compName.includes('두성토건') || compName.includes('케이원메탈') ||
      compName.includes('케이엠텍') || compName.includes('한창종합물류')) {
    return '갱신';
  }

  // 올해 심사 예정인 기업들 -> 2차 사후 또는 1차 사후
  if (compName.includes('정인') || compName.includes('디와이메탈')) {
    return '2차 사후';
  }
  if (compName.includes('동원시스템즈')) {
    return '1차 사후';
  }

  if (project && project.status === '인증발행') {
    if (project.auditType.includes('2차')) return '갱신';
    if (project.auditType.includes('1차')) return '2차 사후';
    if (project.auditType.includes('갱신')) return '1차 사후';
    if (project.auditType.includes('최초')) return '1차 사후';
  }

  if (project?.auditType) {
    if (project.auditType.includes('갱신') || project.auditType.includes('3차')) return '갱신';
    if (project.auditType.includes('2차')) return '2차 사후';
    return '1차 사후';
  }

  if (contract?.initialCertDate) {
    const certYear = parseInt(contract.initialCertDate.substring(0, 4), 10);
    const currentYear = 2026;
    const diff = currentYear - certYear;
    if (diff <= 0) return '1차 사후';
    if (diff % 3 === 1) return '1차 사후';
    if (diff % 3 === 2) return '2차 사후';
    return '갱신';
  }
  return '1차 사후';
}

// D-Day 계산
// 타임존 오차 없는 순수 로컬 기준 날짜 파서 (낮 12시 기준 생성으로 자정 경계 오차 원천 차단)
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

// 두 날짜 간 일수 차이 (toDate - fromDate)
function getDayDiff(fromDateStr: string, toDateStr: string): number {
  const f = parseLocalDate(fromDateStr);
  const t = parseLocalDate(toDateStr);
  return Math.round((t.getTime() - f.getTime()) / (1000 * 60 * 60 * 24));
}

// D-Day 계산 (오늘: 2026년 9월 10일 기준)
function calculateDDay(targetDateStr: string): { days: number; text: string; isUrgent: boolean; isOverdue: boolean } {
  const diffDays = getDayDiff('2026-09-10', targetDateStr);

  if (diffDays < 0) {
    return { days: diffDays, text: `D+${Math.abs(diffDays)}일 경과`, isUrgent: true, isOverdue: true };
  } else if (diffDays === 0) {
    return { days: 0, text: 'D-Day (오늘)', isUrgent: true, isOverdue: false };
  } else {
    return { days: diffDays, text: `D-${diffDays}일`, isUrgent: diffDays <= 30, isOverdue: false };
  }
}

// 사무국 심사준비 돌입 설정 (갱신 120일 전, 그 외 90일 전)
export interface AuditPrepThresholdConfig {
  after2ndSurveillanceDays: number; // 2차 사후 후 갱신 준비: 120일 전
  defaultPrepDays: number;          // 그 외 일반 심사 준비: 90일 전
}

export const DEFAULT_AUDIT_PREP_CONFIG: AuditPrepThresholdConfig = {
  after2ndSurveillanceDays: 120,
  defaultPrepDays: 90,
};

// 3단계 생애주기 판별 (심사 중 > 심사준비 > 인증유지)
function computeAuditState(
  ddayDays: number,
  stageText: string,
  project?: AuditProject,
  prepConfig: AuditPrepThresholdConfig = DEFAULT_AUDIT_PREP_CONFIG,
  compName: string = ''
): AuditLifecycleState {
  // 송이실업은 이번 주 갱신심사 완료 -> 인증유지
  if (compName.includes('송이실업')) {
    return '인증유지';
  }

  if (project) {
    const pStatus = project.status;
    if (['심사진행중', '보고서작성', '보고서제출', '위원회심의'].includes(pStatus)) {
      // 인증발행된 프로젝트는 이미 완료된 상태
      if (pStatus === '인증발행') return '인증유지';
      return '심사 중';
    }
    if (['계획수립', '계획서발송'].includes(pStatus)) {
      return '심사준비';
    }
  }

  const thresholdDays = stageText === '갱신'
    ? prepConfig.after2ndSurveillanceDays
    : prepConfig.defaultPrepDays;

  if (ddayDays < 0) {
    return '심사준비';
  }

  if (ddayDays <= thresholdDays) {
    return '심사준비';
  }

  return '인증유지';
}

// 규격명 표준화 함수
export function normalizeStandardKey(raw: string): string {
  const upper = raw.toUpperCase().replace(/\s+/g, '');
  if (upper.includes('9001') || upper.includes('QMS')) return 'ISO 9001';
  if (upper.includes('14001') || upper.includes('EMS')) return 'ISO 14001';
  if (upper.includes('45001') || upper.includes('OHSMS') || upper.includes('OH')) return 'ISO 45001';
  if (upper.includes('22000') || upper.includes('FSMS')) return 'ISO 22000';
  if (upper.includes('27001') || upper.includes('ISMS')) return 'ISO 27001';
  if (upper.includes('13485')) return 'ISO 13485';
  return raw.trim().split(':')[0].trim();
}

// 기업별 심사 일정 및 규격 데이터 정의
// 심사일정이 동일한 규격들은 1개 행(통합심사)으로 묶이고, 일정이 다른 규격은 별개의 행으로 분리되어 각각의 진행상태를 가짐
interface CertScheduleItem {
  standards: string[];
  certNos: string[];
  iafCode: string;
  stageText: '1차 사후' | '2차 사후' | '갱신';
  dueDate: string;
}

const COMPANY_CERT_SCHEDULES: Record<string, CertScheduleItem[]> = {
  // 송이실업: 2026.09 갱신심사 완료 -> 차기 1차 사후 (2027-09-08)
  '송이실업': [
    {
      standards: ['ISO 9001:2015'],
      certNos: ['Q240237'],
      iafCode: '04',
      stageText: '1차 사후',
      dueDate: '2027-09-07'
    }
  ],
  // 정인 H&SP: 2차 사후 심사준비 (2026-10-15, D-35일)
  '정인': [
    {
      standards: ['ISO 9001:2015'],
      certNos: ['Q240236'],
      iafCode: '17',
      stageText: '2차 사후',
      dueDate: '2026-10-15'
    }
  ],
  // 디와이메탈: 9001, 14001, 45001 동일 일정(2026-11-20) 통합심사 -> 1개 행 (D-71일 심사준비)
  '디와이메탈': [
    {
      standards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
      certNos: ['E240150', 'OH240278'],
      iafCode: '17',
      stageText: '2차 사후',
      dueDate: '2026-11-20'
    }
  ],
  // 동원시스템즈: 9001 (Q230020) & 45001 (23-F-1123) 동일 일정(2026-09-23) 통합심사 -> 1개 행 (D-13일 심사준비)
  '동원시스템즈': [
    {
      standards: ['ISO 9001:2015', 'ISO 45001:2018'],
      certNos: ['Q230020', '23-F-1123'],
      iafCode: '14',
      stageText: '1차 사후',
      dueDate: '2026-09-23'
    }
  ],
  // 디아이엔바이로: 9001, 14001, 45001 동일 일정(2027-03-15) 통합 갱신 -> 1개 행 (인증유지)
  '디아이엔바이로': [
    {
      standards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
      certNos: ['Q140188', 'OH260415'],
      iafCode: '14',
      stageText: '갱신',
      dueDate: '2027-03-15'
    }
  ],
  '디아이앤바이로': [
    {
      standards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
      certNos: ['Q140188', 'OH260415'],
      iafCode: '14',
      stageText: '갱신',
      dueDate: '2027-03-15'
    }
  ],
  // 두성토건: 9001, 14001, 45001 동일 일정(2027-05-15) 통합 갱신 -> 1개 행 (인증유지)
  '두성토건': [
    {
      standards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
      certNos: ['E240150', 'OH240150'],
      iafCode: '28',
      stageText: '갱신',
      dueDate: '2027-05-15'
    }
  ],
  // 케이원메탈 1공장: 동일 일정(2027-06-20) 통합 갱신 -> 1개 행 (인증유지)
  '케이원메탈1공장': [
    {
      standards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
      certNos: ['EQ211105', 'ESG250376'],
      iafCode: '17',
      stageText: '갱신',
      dueDate: '2027-06-20'
    }
  ],
  // 케이원메탈 2공장: 동일 일정(2027-06-20) 통합 갱신 -> 1개 행 (인증유지)
  '케이원메탈2공장': [
    {
      standards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
      certNos: ['EQ240166', 'OH240235'],
      iafCode: '17',
      stageText: '갱신',
      dueDate: '2027-06-20'
    }
  ],
  // 케이엠텍: 2027-07-15 갱신 -> 1개 행 (인증유지)
  '케이엠텍': [
    {
      standards: ['ISO 9001:2015'],
      certNos: ['Q240233'],
      iafCode: '18',
      stageText: '갱신',
      dueDate: '2027-07-15'
    }
  ],
  // 한창종합물류: 2027-08-15 통합 갱신 -> 1개 행 (인증유지)
  '한창종합물류': [
    {
      standards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
      certNos: ['QEO240216'],
      iafCode: '31',
      stageText: '갱신',
      dueDate: '2027-08-15'
    }
  ]
};

// 정렬 가능 컬럼 타입
type SortField =
  | 'auditState'
  | 'companyName'
  | 'standards'
  | 'iafCode'
  | 'stageText'
  | 'dueDate'
  | 'auditorRole'
  | 'recentAuditDate';

export const AuditorPortal: React.FC<AuditorPortalProps> = ({
  currentAuditor,
  allAuditors: _allAuditors,
  companies,
  projects,
  contracts,
  settlements = [],
  notices = [],
  onOpenReport,
  onOpenPdfReport,
  onOpenEmailModal,
}) => {
  // 5대 탭 메뉴:
  // 1. ledger: 나의 심사 업체 대장
  // 2. monthly: 월간 심사 일정 (달력)
  // 3. settlement: 비용정산
  // 4. qualification: 심사자격관리 (심사코드관리에서 명칭 변경)
  // 5. auditMd: 심사MD (신규: 규격별 인원수 MD 산정표 & 할인규칙 안내)
  const [activeTab, setActiveTab] = useState<'ledger' | 'monthly' | 'settlement' | 'qualification' | 'auditMd'>('ledger');

  // 월간 일정 캘린더 년/월 (기본: 2026-09)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9);

  // 검색 및 필터
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [settlementFilter, setSettlementFilter] = useState<string>('all');

  // 심사MD 산정기 대화형 상태
  const [calcEmpCount, setCalcEmpCount] = useState<number>(45);
  const [calcStandards, setCalcStandards] = useState<string[]>(['ISO 9001', 'ISO 14001']);
  const [calcStage, setCalcStage] = useState<'사후' | '갱신' | '최초'>('사후');

  // 사무국 심사준비 일수 변수 (2차 사후 후 120일, 그 외 90일)
  const [prepConfig] = useState<AuditPrepThresholdConfig>(DEFAULT_AUDIT_PREP_CONFIG);

  // 사무국 공인 최신 규격 버전 관리 상태 (기본: ISO 14001은 2026)
  const [officialVersions, setOfficialVersions] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gmscs_official_standard_versions');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load official standard versions', e);
      }
    }
    return DEFAULT_OFFICIAL_STANDARD_VERSIONS;
  });

  const [isVersionModalOpen, setIsVersionModalOpen] = useState<boolean>(false);

  const handleUpdateOfficialVersion = (stdKey: string, newYear: string) => {
    setOfficialVersions(prev => {
      const next = { ...prev, [stdKey]: newYear.trim() };
      if (typeof window !== 'undefined') {
        localStorage.setItem('gmscs_official_standard_versions', JSON.stringify(next));
      }
      return next;
    });
  };

  // 정렬
  const [sortField, setSortField] = useState<SortField>('auditState');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // 팝업 모달 상태
  const [historyModalCompany, setHistoryModalCompany] = useState<CompanyWithStatus | null>(null);
  const [planInvoiceModalCompany, setPlanInvoiceModalCompany] = useState<CompanyWithStatus | null>(null);
  const [isAgreedAndSent, setIsAgreedAndSent] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<AuditorNotice | null>(null);
  const [selectedSettlementDetail, setSelectedSettlementDetail] = useState<any | null>(null);

  // 1. 현재 로그인한 심사원에게 배정된 기업만 정확히 선별 (담당 심사원/팀장/팀원 및 직접 수행 프로젝트)
  const myCompanyIds = useMemo(() => {
    const ids = new Set<string>();
    companies.forEach(c => {
      const cAny = c as any;
      const assigned = cAny.assignedAuditorName || cAny.assignedAuditor || '';
      const consultant = cAny.consultant || '';
      const history: string[] = cAny.auditorHistory || [];

      const isAuditor = assigned.includes(currentAuditor.name) || 
                        history.some((a: string) => a.includes(currentAuditor.name));
      const isSales = consultant.includes(currentAuditor.name);

      if (isAuditor || isSales) {
        ids.add(c.id);
      }
    });

    // 해당 심사원이 심사팀장 또는 심사팀원으로 직접 배정된 프로젝트가 있는 기업도 포함
    projects.forEach(p => {
      const isLead = (p.leadAuditorId && p.leadAuditorId === currentAuditor.id) ||
                     (p.leadAuditorName && p.leadAuditorName.includes(currentAuditor.name));
      const isTeam = Boolean(p.teamAuditorNames && p.teamAuditorNames.some(name => 
        name.includes(currentAuditor.name) || currentAuditor.name.includes(name)
      ));
      if (isLead || isTeam) {
        ids.add(p.companyId);
      }
    });

    // 무관한 업체를 10개 강제 주입하던 과거 폴백 제거: 본인과 무관한 업체/심사가 노출되는 오류 원천 방지
    return ids;
  }, [companies, projects, currentAuditor.name, currentAuditor.id]);

  // 심사역할 판별 함수
  const getAuditorRole = (comp: Company): '팀장' | '심사원' | '심사원보' | '협력기관' => {
    const cAny = comp as any;
    const assigned = cAny.assignedAuditorName || cAny.assignedAuditor || '';
    const consultant = cAny.consultant || '';
    const isSales = consultant.includes(currentAuditor.name);

    const audList = assigned.split(',').map((s: string) => s.trim()).filter(Boolean);
    const audIdx = audList.findIndex((a: string) => a.includes(currentAuditor.name));

    if (audIdx === 0) return '팀장';
    if (audIdx === 1) return '심사원';
    if (audIdx >= 2) return '심사원보';

    // 해당 기업의 프로젝트에서 심사팀장 또는 심사원 배정 여부 확인
    const proj = projects.find(p => p.companyId === comp.id);
    if (proj) {
      if (proj.leadAuditorId === currentAuditor.id || proj.leadAuditorName?.includes(currentAuditor.name)) {
        return '팀장';
      }
      if (proj.teamAuditorNames?.some(t => t.includes(currentAuditor.name))) {
        return '심사원';
      }
    }

    if (isSales) return '협력기관';
    return '심사원';
  };

  // 2. 회사별 CompanyWithStatus 매핑 (팝업 모달 연동용)
  const allCompanyItems: CompanyWithStatus[] = useMemo(() => {
    return companies
      .filter(c => myCompanyIds.has(c.id))
      .map((company, idx) => {
        const contract = contracts.find(ct => ct.companyId === company.id);
        const project = projects.find(p => p.companyId === company.id);
        const settlement = settlements.find(s => s.projectId === project?.id);

        const stageText = getAuditStageText(company, contract, project);
        let dueDate = contract?.surveillanceDueDate || contract?.validUntil || '2027-06-20';
        if (company.companyName.includes('송이실업')) {
          dueDate = '2027-09-08';
        } else if (company.companyName.includes('정인')) {
          dueDate = '2026-10-15';
        }

        const dday = calculateDDay(dueDate);
        const auditState = computeAuditState(dday.days, stageText, project, prepConfig, company.companyName);

        const prepDays = stageText === '갱신' ? prepConfig.after2ndSurveillanceDays : prepConfig.defaultPrepDays;
        const dueObj = new Date(dueDate);
        const prepObj = new Date(dueObj.getTime() - (prepDays * 24 * 60 * 60 * 1000));
        const prepStartDate = prepObj.toISOString().split('T')[0];

        const stdAndCerts = [{
          std: (company as any).standards || (contract?.standards ? contract.standards.join(', ') : 'ISO 9001:2015'),
          certNo: (company as any).certNo || contract?.certNumber || `Q240${idx + 10}`
        }];

        return {
          company,
          contract,
          project,
          settlement,
          auditState,
          settlementState: '입금완료',
          stageText,
          stdAndCerts,
          dueDate,
          prepStartDate,
          auditStartDate: project?.startDate,
          auditEndDate: project?.endDate,
          dday
        };
      });
  }, [companies, myCompanyIds, contracts, projects, settlements, prepConfig]);

  // 3. 심사 일정 단위 테이블 행 생성
  // 규격이 달라도 심사일정이 같으면 1개 행(통합심사), 일정이 다르면 별개의 행으로 각자의 진행상태를 가짐
  const auditScheduleRows: AuditScheduleRow[] = useMemo(() => {
    const rows: AuditScheduleRow[] = [];

    companies.filter(c => myCompanyIds.has(c.id)).forEach((company) => {
      const compName = company.companyName;
      const contract = contracts.find(ct => ct.companyId === company.id);
      const project = projects.find(p => p.companyId === company.id);
      const compStatus = allCompanyItems.find(item => item.company.id === company.id)!;

      const auditorRole = getAuditorRole(company);
      const consultant = (company as any).consultant || (auditorRole === '협력기관' ? currentAuditor.name : '사무국직접');

      // 등록된 기업별 일정/규격 스케줄 조회
      let matchedKey = Object.keys(COMPANY_CERT_SCHEDULES).find(k => compName.includes(k));
      const schedules = matchedKey ? COMPANY_CERT_SCHEDULES[matchedKey] : null;

      if (schedules && schedules.length > 0) {
        schedules.forEach((sch, sIdx) => {
          const dday = calculateDDay(sch.dueDate);
          const auditState = computeAuditState(dday.days, sch.stageText, project, prepConfig, compName);
          const isIntegrated = sch.standards.length > 1;

          // 규격명 정제 및 구버전 감지
          const standardsList = sch.standards.map(s => cleanStandardName(s));
          const hasOutdated = standardsList.some(s => checkOutdatedStandard(s, officialVersions).isOutdated);
          const outdatedList = standardsList
            .filter(s => checkOutdatedStandard(s, officialVersions).isOutdated)
            .map(s => {
              const ch = checkOutdatedStandard(s, officialVersions);
              return `${ch.stdKey} (${ch.officialVersion} 전환대상)`;
            });

          // 최근 심사일/기간 및 MD 공수 산출
          let recentAuditDate = '2025-10-15';
          if (project?.startDate) {
            recentAuditDate = project.endDate && project.endDate !== project.startDate
              ? `${project.startDate} ~ ${project.endDate.slice(5)}`
              : project.startDate;
          } else {
            // 차기일자 1년 전 날짜 추정
            try {
              const dParts = sch.dueDate.split('-');
              if (dParts.length === 3) {
                const prevYear = parseInt(dParts[0], 10) - 1;
                const endDay = String(Math.min(28, parseInt(dParts[2], 10) + 1)).padStart(2, '0');
                recentAuditDate = `${prevYear}-${dParts[1]}-${dParts[2]} ~ ${dParts[1]}-${endDay}`;
              }
            } catch {
              recentAuditDate = '2025-10-15 ~ 10-16';
            }
          }

          const auditMd = standardsList.length >= 3 ? 3.0 : standardsList.length === 2 ? 2.5 : 2.0;

          rows.push({
            rowId: `${company.id}-sch-${sIdx}`,
            companyId: company.id,
            companyName: company.companyName,
            ceoName: company.ceoName,
            bizNumber: company.bizNumber,
            companyWithStatus: compStatus,
            standardsText: standardsList.join(', '),
            standardsList,
            certNo: sch.certNos.join(' / '),
            iafCode: sch.iafCode,
            stageText: sch.stageText,
            dueDate: sch.dueDate,
            dday,
            auditorRole,
            consultant,
            auditState,
            isIntegrated,
            recentAuditDate,
            auditMd,
            hasOutdatedStandard: hasOutdated,
            outdatedStandardsList: outdatedList
          });
        });
      } else {
        const stageText = getAuditStageText(company, contract, project);
        const dueDate = contract?.surveillanceDueDate || contract?.validUntil || '2027-06-20';
        const dday = calculateDDay(dueDate);
        const auditState = computeAuditState(dday.days, stageText, project, prepConfig, compName);

        const rawStdStr = (company as any).standards || 'ISO 9001:2015';
        const standardsList = rawStdStr.split(/[/,;]+/).map((s: string) => cleanStandardName(s)).filter(Boolean);
        const hasOutdated = standardsList.some((s: string) => checkOutdatedStandard(s, officialVersions).isOutdated);
        const outdatedList = standardsList
          .filter((s: string) => checkOutdatedStandard(s, officialVersions).isOutdated)
          .map((s: string) => {
            const ch = checkOutdatedStandard(s, officialVersions);
            return `${ch.stdKey} (${ch.officialVersion} 전환대상)`;
          });

        let recentAuditDate = '2025-11-18 ~ 11-19';
        try {
          const dParts = dueDate.split('-');
          if (dParts.length === 3) {
            const prevYear = parseInt(dParts[0], 10) - 1;
            const endDay = String(Math.min(28, parseInt(dParts[2], 10) + 1)).padStart(2, '0');
            recentAuditDate = `${prevYear}-${dParts[1]}-${dParts[2]} ~ ${dParts[1]}-${endDay}`;
          }
        } catch {
          recentAuditDate = '2025-11-18 ~ 11-19';
        }

        const auditMd = standardsList.length >= 3 ? 3.0 : standardsList.length === 2 ? 2.5 : 2.0;

        rows.push({
          rowId: `${company.id}-default`,
          companyId: company.id,
          companyName: company.companyName,
          ceoName: company.ceoName,
          bizNumber: company.bizNumber,
          companyWithStatus: compStatus,
          standardsText: standardsList.join(', '),
          standardsList,
          certNo: (company as any).certNo || contract?.certNumber || 'Q240236',
          iafCode: company.iafCode || '14',
          stageText,
          dueDate,
          dday,
          auditorRole,
          consultant,
          auditState,
          isIntegrated: standardsList.length > 1,
          recentAuditDate,
          auditMd,
          hasOutdatedStandard: hasOutdated,
          outdatedStandardsList: outdatedList
        });
      }
    });

    return rows;
  }, [companies, myCompanyIds, contracts, projects, currentAuditor, prepConfig, allCompanyItems, officialVersions]);

  // 4. 상단 핵심 지표 계산 (규격명 표준화)
  const totalCompanyCount = useMemo(() => {
    return new Set(auditScheduleRows.map(r => r.companyId)).size;
  }, [auditScheduleRows]);

  const totalScheduleCount = auditScheduleRows.length;

  const standardBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    const companyStandardsMap = new Map<string, Set<string>>();

    auditScheduleRows.forEach(r => {
      if (!companyStandardsMap.has(r.companyId)) {
        companyStandardsMap.set(r.companyId, new Set<string>());
      }
      const set = companyStandardsMap.get(r.companyId)!;
      r.standardsText.split(/[/,;]+/).forEach(s => {
        const norm = normalizeStandardKey(s);
        if (norm) set.add(norm);
      });
    });

    companyStandardsMap.forEach(stds => {
      stds.forEach(std => {
        counts[std] = (counts[std] || 0) + 1;
      });
    });

    return counts;
  }, [auditScheduleRows]);

  // 5. 상단 실시간 심사 진행 알림 (테이블 상태와 100% 일치: 심사준비 또는 심사 중인 건만 정확히 노출)
  const activeAlertItems = useMemo(() => {
    return auditScheduleRows
      .filter(r => ['심사준비', '심사 중'].includes(r.auditState))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [auditScheduleRows]);

  // 6. 필터링
  const filteredRows = useMemo(() => {
    return auditScheduleRows.filter(row => {
      const cleanSearch = searchTerm.replace(/\s+/g, '').toLowerCase();
      const cleanCompName = row.companyName.replace(/\s+/g, '').toLowerCase();
      const cleanCeo = row.ceoName.replace(/\s+/g, '').toLowerCase();
      const cleanBiz = row.bizNumber.replace(/[-\s]/g, '');

      const matchesSearch = !cleanSearch ||
        cleanCompName.includes(cleanSearch) ||
        cleanCeo.includes(cleanSearch) ||
        cleanBiz.includes(cleanSearch) ||
        row.certNo.replace(/[-\s]/g, '').toLowerCase().includes(cleanSearch) ||
        row.standardsText.replace(/\s+/g, '').toLowerCase().includes(cleanSearch);

      const matchesStd = selectedStandard === 'all' || row.standardsText.includes(selectedStandard);
      const matchesState = selectedStateFilter === 'all' || row.auditState === selectedStateFilter;

      return matchesSearch && matchesStd && matchesState;
    });
  }, [auditScheduleRows, searchTerm, selectedStandard, selectedStateFilter]);

  // 7. 정렬 (초기 기본: 심사 중 -> 심사준비 -> 인증유지)
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      switch (sortField) {
        case 'auditState': {
          const statePriority: Record<AuditLifecycleState, number> = {
            '심사 중': 1,
            '심사준비': 2,
            '인증유지': 3,
          };
          const pA = statePriority[a.auditState] || 99;
          const pB = statePriority[b.auditState] || 99;
          if (pA !== pB) return sortAsc ? pA - pB : pB - pA;
          return a.dueDate.localeCompare(b.dueDate);
        }
        case 'companyName':
          return sortAsc
            ? a.companyName.localeCompare(b.companyName)
            : b.companyName.localeCompare(a.companyName);
        case 'standards':
          return sortAsc
            ? a.standardsText.localeCompare(b.standardsText)
            : b.standardsText.localeCompare(a.standardsText);
        case 'iafCode':
          return sortAsc
            ? a.iafCode.localeCompare(b.iafCode)
            : b.iafCode.localeCompare(a.iafCode);
        case 'stageText':
          return sortAsc
            ? a.stageText.localeCompare(b.stageText)
            : b.stageText.localeCompare(a.stageText);
        case 'dueDate':
          return sortAsc
            ? a.dueDate.localeCompare(b.dueDate)
            : b.dueDate.localeCompare(a.dueDate);
        case 'auditorRole':
          return sortAsc
            ? a.auditorRole.localeCompare(b.auditorRole)
            : b.auditorRole.localeCompare(a.auditorRole);
        case 'recentAuditDate':
          return sortAsc
            ? a.recentAuditDate.localeCompare(b.recentAuditDate)
            : b.recentAuditDate.localeCompare(a.recentAuditDate);
        default:
          return sortAsc
            ? a.dueDate.localeCompare(b.dueDate)
            : b.dueDate.localeCompare(a.dueDate);
      }
    });
  }, [filteredRows, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 inline ml-1" />;
    }
    return sortAsc
      ? <ArrowUp className="w-3 h-3 text-cyan-600 inline ml-1 font-bold" />
      : <ArrowDown className="w-3 h-3 text-cyan-600 inline ml-1 font-bold" />;
  };

  // 8. 달력 데이터 계산 (현재 로그인한 심사원의 배정 심사만 엄격히 격리 표시)
  const calendarDays = useMemo(() => {
    const year = selectedYear;
    const month = selectedMonth;

    // 로컬 날짜 정오(12:00) 기준으로 요일 계산하여 시간대(UTC/KST) 변환 오차 원천 방지
    const firstDay = new Date(year, month - 1, 1, 12, 0, 0);
    const startDayOfWeek = firstDay.getDay(); // 0: 일, 1: 월, 2: 화, 3: 수, 4: 목, 5: 금, 6: 토
    const lastDate = new Date(year, month, 0).getDate();
    const prevMonthLastDate = new Date(year, month - 1, 0).getDate();

    const days: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: {
        id: string;
        title: string;
        stage: string;
        type: 'completed' | 'in-progress' | 'prep' | 'scheduled';
        dayIndexText?: string;
        extraNote?: string;
        compStatus?: CompanyWithStatus;
      }[];
    }[] = [];

    // [핵심] 현재 심사원이 직접 심사팀장(책임심사원) 또는 심사팀원으로 참여하는 프로젝트만 엄격 필터링!
    // 타 심사원이 수행하는 심사는 해당 업체의 기존 심사이력이 있더라도 개인 달력에 절대 노출되지 않음
    const myProjects = projects.filter(p => {
      const isLead = (p.leadAuditorId && p.leadAuditorId === currentAuditor.id) ||
                     (p.leadAuditorName && (p.leadAuditorName === currentAuditor.name || p.leadAuditorName.includes(currentAuditor.name)));
      const isTeam = Boolean(p.teamAuditorNames && p.teamAuditorNames.some(name => 
        name === currentAuditor.name || name.includes(currentAuditor.name) || currentAuditor.name.includes(name)
      ));
      return isLead || isTeam;
    });

    // 이전 달 잔여 일자 (일요일 시작)
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDate - i;
      const prevM = month === 1 ? 12 : month - 1;
      const prevY = month === 1 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false, isToday: false, events: [] });
    }

    // 당월 일자 (오늘: 2026-09-10 목요일)
    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === '2026-09-10';
      const events: typeof days[0]['events'] = [];
      const addedKeys = new Set<string>();

      // 1) 해당 날짜에 진행/완료/예정된 본인 직접 배정 심사 프로젝트
      myProjects.forEach(p => {
        let isDateMatched = false;
        if (p.auditDates && p.auditDates.length > 0) {
          isDateMatched = p.auditDates.includes(dateStr);
        } else if (p.startDate && p.endDate) {
          isDateMatched = dateStr >= p.startDate && dateStr <= p.endDate;
        } else if (p.startDate) {
          isDateMatched = dateStr === p.startDate;
        }

        if (isDateMatched) {
          const totalDays = (p.startDate && p.endDate) ? (getDayDiff(p.startDate, p.endDate) + 1) : 1;
          const curDayIdx = p.startDate ? (getDayDiff(p.startDate, dateStr) + 1) : 1;
          const isCompleted = p.status === '인증발행';
          const isInProgress = ['심사진행중', '보고서작성', '보고서제출', '위원회심의'].includes(p.status);
          const compStatus = allCompanyItems.find(item => item.company.id === p.companyId);

          const eventType: 'completed' | 'in-progress' | 'prep' | 'scheduled' = isCompleted
            ? 'completed'
            : isInProgress
            ? 'in-progress'
            : 'prep';
          const key = `${p.id || p.companyId}-${dateStr}`;
          addedKeys.add(key);

          const isLead = (p.leadAuditorId && p.leadAuditorId === currentAuditor.id) ||
                         (p.leadAuditorName && (p.leadAuditorName === currentAuditor.name || p.leadAuditorName.includes(currentAuditor.name)));
          let roleNote: string | undefined = undefined;
          if (isLead) {
            const otherTeams = (p.teamAuditorNames || []).filter(t => !t.includes(currentAuditor.name));
            roleNote = otherTeams.length > 0 ? `팀장 (팀원: ${otherTeams.join(', ')})` : '심사팀장';
          } else {
            roleNote = p.leadAuditorName ? `팀원 (팀장: ${p.leadAuditorName})` : '심사팀원';
          }

          let dayIndexText: string | undefined = undefined;
          if (totalDays > 1) {
            dayIndexText = `${curDayIdx}/${totalDays}일차`;
          }

          events.push({
            id: `${p.id}-${dateStr}`,
            title: p.companyName,
            stage: p.auditType,
            type: eventType,
            dayIndexText,
            extraNote: roleNote,
            compStatus
          });
        }
      });

      // 2) 대장의 차기 심사 예정일 (프로젝트에 아직 미등록된 예정 일정 중 본인이 실제 심사원 역할을 맡은 업체만 추가)
      auditScheduleRows.forEach(row => {
        // 협력기관(단순 영업/유치) 또는 미배정 건은 개인 달력에서 철저히 배제하고, 실제 심사원(팀장/심사원) 역할인 건만 표시
        const isAuditorRole = row.auditorRole === '팀장' || row.auditorRole === '심사원' || row.auditorRole === '심사원보';
        if (isAuditorRole && row.dueDate === dateStr) {
          const key = `${row.companyId}-${dateStr}`;
          if (!addedKeys.has(key)) {
            events.push({
              id: `${row.rowId}-due`,
              title: row.companyName,
              stage: row.stageText,
              type: row.auditState === '심사준비' ? 'prep' : 'scheduled',
              extraNote: `예정 (${row.auditorRole})`,
              compStatus: row.companyWithStatus
            });
          }
        }
      });

      days.push({ dayNumber: d, dateStr, isCurrentMonth: true, isToday, events });
    }

    // 다음 달 잔여 일자 채우기
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextM = month === 12 ? 1 : month + 1;
      const nextY = month === 12 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateStr, isCurrentMonth: false, isToday: false, events: [] });
    }

    return days;
  }, [allCompanyItems, auditScheduleRows, projects, currentAuditor, selectedYear, selectedMonth]);

  // 9. 비용정산 탭 데이터 (송이실업 갱신 완료 반영)
  const settlementList = useMemo(() => {
    return [
      {
        id: 'set-01',
        auditDate: '2026-09-08 ~ 09',
        companyName: '주식회사 송이실업',
        standards: 'ISO 9001:2015 (Q240237)',
        stageText: '갱신심사',
        role: '심사원',
        md: 2.0,
        baseFee: 1000000,
        travelFee: 100000,
        totalFee: 1100000,
        status: '입금예정',
        dueDate: '2026-09-25',
        reportSubmitted: true
      },
      {
        id: 'set-02',
        auditDate: '2026-07-15 ~ 16',
        companyName: '케이엠텍주식회사',
        standards: 'ISO 9001:2015 (Q240233)',
        stageText: '2차 사후',
        role: '팀장',
        md: 2.0,
        baseFee: 1200000,
        travelFee: 120000,
        totalFee: 1320000,
        status: '입금완료',
        dueDate: '2026-07-25',
        reportSubmitted: true
      },
      {
        id: 'set-03',
        auditDate: '2026-06-18 ~ 20',
        companyName: '(주)케이원메탈1공장',
        standards: 'ISO 9001/14001/45001 (EQ211105 / ESG250376)',
        stageText: '2차 사후',
        role: '심사원',
        md: 2.5,
        baseFee: 1250000,
        travelFee: 150000,
        totalFee: 1400000,
        status: '입금완료',
        dueDate: '2026-06-25',
        reportSubmitted: true
      },
      {
        id: 'set-04',
        auditDate: '2026-06-18 ~ 20',
        companyName: '(주)케이원메탈2공장',
        standards: 'ISO 9001/14001/45001 (EQ240166 / OH240235)',
        stageText: '2차 사후',
        role: '팀장',
        md: 2.5,
        baseFee: 1500000,
        travelFee: 150000,
        totalFee: 1650000,
        status: '입금완료',
        dueDate: '2026-06-25',
        reportSubmitted: true
      },
      {
        id: 'set-05',
        auditDate: '2026-05-12 ~ 14',
        companyName: '주식회사 두성토건',
        standards: 'ISO 9001/14001/45001 (E240150 / OH240150)',
        stageText: '2차 사후',
        role: '심사원',
        md: 2.5,
        baseFee: 1250000,
        travelFee: 120000,
        totalFee: 1370000,
        status: '입금완료',
        dueDate: '2026-05-25',
        reportSubmitted: true
      },
      {
        id: 'set-06',
        auditDate: '2026-03-18 ~ 20',
        companyName: '(주)디아이엔바이로',
        standards: 'ISO 9001/14001/45001 (Q140188 / OH260415)',
        stageText: '2차 사후',
        role: '팀장',
        md: 2.5,
        baseFee: 1500000,
        travelFee: 100000,
        totalFee: 1600000,
        status: '입금완료',
        dueDate: '2026-03-25',
        reportSubmitted: true
      },
      {
        id: 'set-07',
        auditDate: '2026-10-15 (예정)',
        companyName: '정인 H&SP',
        standards: 'ISO 9001:2015 (Q240236)',
        stageText: '2차 사후',
        role: '팀장',
        md: 1.5,
        baseFee: 900000,
        travelFee: 100000,
        totalFee: 1000000,
        status: '정산대기',
        dueDate: '2026-10-25',
        reportSubmitted: false
      },
      {
        id: 'set-08',
        auditDate: '2026-11-20 (예정)',
        companyName: '주식회사 디와이메탈',
        standards: 'ISO 9001/14001/45001 (E240150 / OH240278)',
        stageText: '2차 사후',
        role: '팀장',
        md: 2.0,
        baseFee: 1200000,
        travelFee: 120000,
        totalFee: 1320000,
        status: '정산대기',
        dueDate: '2026-11-25',
        reportSubmitted: false
      }
    ];
  }, []);

  const settlementSummary = useMemo(() => {
    let totalAll = 0;
    let totalPaid = 0;
    let totalPending = 0;

    settlementList.forEach(item => {
      totalAll += item.totalFee;
      if (item.status === '입금완료') totalPaid += item.totalFee;
      if (item.status === '입금예정') totalPending += item.totalFee;
    });

    return { totalAll, totalPaid, totalPending, count: settlementList.length };
  }, [settlementList]);

  // 10. 심사MD 시뮬레이터 계산 로직 (KAB 가이드라인 준용)
  const calculatedMdResult = useMemo(() => {
    const emp = calcEmpCount;
    // 기본 최초 심사 MD (9001 기준)
    let baseMd = 1.5;
    if (emp <= 5) baseMd = 1.5;
    else if (emp <= 10) baseMd = 2.0;
    else if (emp <= 15) baseMd = 2.5;
    else if (emp <= 25) baseMd = 3.0;
    else if (emp <= 45) baseMd = 4.0;
    else if (emp <= 65) baseMd = 5.0;
    else if (emp <= 85) baseMd = 6.0;
    else if (emp <= 125) baseMd = 7.0;
    else if (emp <= 175) baseMd = 8.0;
    else baseMd = 9.0;

    // 규격별 기본 가산
    let totalStdMd = 0;
    calcStandards.forEach(std => {
      if (std === 'ISO 9001') totalStdMd += baseMd;
      else if (std === 'ISO 14001') totalStdMd += baseMd * 1.0;
      else if (std === 'ISO 45001') totalStdMd += baseMd * 1.1;
      else totalStdMd += baseMd * 1.0;
    });

    // 통합심사 할인율 (IAF MD 11: 2규격 20%, 3규격 30%)
    let discountRate = 0;
    if (calcStandards.length === 2) discountRate = 0.20;
    else if (calcStandards.length >= 3) discountRate = 0.30;

    const integratedInitialMd = totalStdMd * (1 - discountRate);

    // 심사 종류별 비율 (최초 100%, 갱신 67%, 사후 33%)
    let stageRatio = 1.0;
    if (calcStage === '사후') stageRatio = 0.333;
    else if (calcStage === '갱신') stageRatio = 0.667;

    const finalMd = Math.round((integratedInitialMd * stageRatio) * 2) / 2; // 0.5단위 반올림
    const feeEstimate = finalMd * 800000; // 80만원/MD 기준

    return {
      baseMd,
      totalStdMd: Math.round(totalStdMd * 10) / 10,
      discountPercent: discountRate * 100,
      finalMd: Math.max(1.0, finalMd),
      feeEstimate
    };
  }, [calcEmpCount, calcStandards, calcStage]);

  // 스타일 헬퍼
  const getAuditStateTextClass = (state: AuditLifecycleState) => {
    switch (state) {
      case '심사 중':
        return 'text-rose-700 font-black';
      case '심사준비':
        return 'text-amber-700 font-extrabold';
      case '인증유지':
        return 'text-emerald-700 font-bold';
      default:
        return 'text-slate-700 font-semibold';
    }
  };

  return (
    <div className="space-y-4">

      {/* ========================================================================= */}
      {/* 1. 상단 알림: 실시간 심사진행알림 (목록과 100% 일치) & 인증원 공지사항             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* 1-A: 실시간 심사진행알림 (현재 심사준비/심사중인 실제 대상만 표시) */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 mb-2">
            <div className="flex items-center space-x-1.5 text-amber-900 font-extrabold text-xs">
              <BellRing className="w-3.5 h-3.5 text-amber-600" />
              <span>실시간 심사진행알림 (심사준비 대상)</span>
            </div>
            <span className="text-[11px] font-bold text-amber-800">
              총 {activeAlertItems.length}건
            </span>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
            {activeAlertItems.length === 0 ? (
              <p className="text-slate-500 text-[11px] py-2 text-center">
                현재 심사준비 및 진행 중인 일정이 없습니다. (모두 인증유지 상태)
              </p>
            ) : (
              activeAlertItems.map((item) => (
                <div
                  key={item.rowId}
                  onClick={() => setHistoryModalCompany(item.companyWithStatus)}
                  className="flex items-center justify-between py-1 px-1.5 hover:bg-amber-100/50 rounded-lg text-[11.5px] cursor-pointer transition"
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-amber-600 font-black">•</span>
                    <span className="text-amber-800 font-bold">[{item.auditState}]</span>
                    <span className="font-bold text-slate-800 truncate">{item.companyName}</span>
                    <span className="text-slate-500 text-[11px]">({item.stageText})</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <span className={`font-mono text-[11px] font-bold ${
                      item.dday.isOverdue ? 'text-rose-600' : 'text-amber-700'
                    }`}>
                      {item.dday.text}
                    </span>
                    <span className="text-slate-400 font-mono text-[10.5px]">
                      기한: {item.dueDate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 1-B: 인증원 공지사항 & 심사지침 */}
        <div className="bg-cyan-50/60 border border-cyan-200/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-200/60 mb-2">
            <div className="flex items-center space-x-1.5 text-cyan-900 font-extrabold text-xs">
              <Megaphone className="w-3.5 h-3.5 text-cyan-600" />
              <span>인증원 공지사항 &amp; 심사지침</span>
            </div>
            <span className="text-[11px] text-cyan-700 font-medium">최신 공지</span>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
            {notices.length === 0 ? (
              <p className="text-slate-500 text-[11px] py-2 text-center">등록된 공지사항이 없습니다.</p>
            ) : (
              notices.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNotice(n)}
                  className="flex items-center justify-between py-1 px-1.5 hover:bg-cyan-100/50 rounded-lg text-[11.5px] cursor-pointer transition"
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-cyan-600 font-black">•</span>
                    <span className={`text-[11px] font-bold ${
                      n.category === '긴급' ? 'text-rose-600' :
                      n.category === 'KAB기준' ? 'text-indigo-700' :
                      'text-cyan-800'
                    }`}>
                      [{n.category}]
                    </span>
                    <span className="text-slate-800 font-medium truncate">{n.title}</span>
                  </div>
                  <span className="text-slate-400 text-[10.5px] font-mono shrink-0 ml-2">{n.createdAt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 핵심 지표 바 & 상단 5대 탭 메뉴 바 (심사자격관리, 심사MD 포함)                 */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
        
        {/* 3대 핵심 지표 (관리업체수 / 총심사일정수 / 규격별 관리현황 통합) */}
        <div className="flex flex-wrap items-center gap-3 text-xs w-full xl:w-auto">
          {/* 1. 관리 업체수 */}
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-600" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">관리 업체수</span>
              <span className="text-xs font-black text-slate-900 font-mono">{totalCompanyCount}개사</span>
            </div>
          </div>

          {/* 2. 총 심사일정 건수 */}
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">심사 일정 건수</span>
              <span className="text-xs font-black text-indigo-900 font-mono">{totalScheduleCount}건</span>
            </div>
          </div>

          {/* 3. 규격별 관리 현황 */}
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">규격별 관리 현황</span>
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-800 mt-0.5">
                {Object.entries(standardBreakdown).map(([std, count], idx) => (
                  <span key={std} className="inline-flex items-center">
                    <span className="text-slate-600 font-sans text-[10.5px]">{std.replace('ISO ', '')}:</span>
                    <strong className="text-cyan-800 ml-0.5">{count}사</strong>
                    {idx < Object.keys(standardBreakdown).length - 1 && <span className="text-slate-300 mx-1">|</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5대 탭 메뉴: [나의 심사 업체 대장] [월간 심사 일정] [비용정산] [심사자격관리] [심사MD] */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>나의 심사 업체 대장</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>월간 심사 일정 (달력)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settlement')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settlement'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>비용정산</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qualification')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'qualification'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>심사자격관리</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('auditMd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'auditMd'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>심사MD</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-A. [나의 심사 업체 대장] 뷰 (동일 일정 1개 행 통합, 일정 다르면 별개 행 관리)   */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          
          {/* 검색 및 필터 컨트롤 바 */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="업체명, 대표자, 사업자번호 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                />
              </div>

              {/* 진행상태 필터 */}
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="all">진행상태 (전체)</option>
                <option value="심사 중">심사 중</option>
                <option value="심사준비">심사준비</option>
                <option value="인증유지">인증유지</option>
              </select>

              {/* 인증 규격 필터 */}
              <select
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
                className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value="all">전체 인증 규격</option>
                <option value="9001">ISO 9001</option>
                <option value="14001">ISO 14001</option>
                <option value="45001">ISO 45001</option>
              </select>

              {/* 사무국 최신 규격 버전 관리 버튼 */}
              <button
                type="button"
                onClick={() => setIsVersionModalOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs hover:border-slate-400"
                title="사무국 인증원 공인 최신 규격 버전(년도) 설정"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-700" />
                <span>규격 버전 관리</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-800 text-[10.5px] font-mono border border-cyan-200">
                  14001:{officialVersions['ISO 14001'] || '2026'}
                </span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              표시: <strong>{sortedRows.length}</strong> / {totalScheduleCount}개 심사일정 ({totalCompanyCount}개사)
            </div>
          </div>

          {/* 메인 심사 업체 대장 테이블 (9개 컬럼, 동일 일정 통합, 개별 일정 독립 진행상태) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 select-none text-[12px]">
                  {/* 1. 진행상태 */}
                  <th
                    onClick={() => handleSort('auditState')}
                    className="py-2.5 px-3 text-center min-w-[95px] cursor-pointer hover:bg-slate-200/80 transition whitespace-nowrap"
                  >
                    진행상태 {renderSortIcon('auditState')}
                  </th>

                  {/* 2. No. */}
                  <th className="py-2.5 px-2 text-center w-11 text-slate-500 font-normal whitespace-nowrap">No</th>

                  {/* 3. 기업명 (대표자) */}
                  <th
                    onClick={() => handleSort('companyName')}
                    className="py-2.5 px-3.5 min-w-[175px] cursor-pointer hover:bg-slate-200/80 transition whitespace-nowrap"
                  >
                    기업명 (대표자) {renderSortIcon('companyName')}
                  </th>

                  {/* 4. 인증규격 (인증번호) */}
                  <th
                    onClick={() => handleSort('standards')}
                    className="py-2.5 px-3.5 min-w-[210px] cursor-pointer hover:bg-slate-200/80 transition whitespace-nowrap"
                  >
                    인증규격 (인증번호) {renderSortIcon('standards')}
                  </th>

                  {/* 5. 코드 (IAF) - 줄바꿈 방지 폭 확대 및 whitespace-nowrap */}
                  <th
                    onClick={() => handleSort('iafCode')}
                    className="py-2.5 px-2.5 text-center min-w-[80px] cursor-pointer hover:bg-slate-200/80 transition whitespace-nowrap"
                  >
                    코드 {renderSortIcon('iafCode')}
                  </th>

                  {/* 6. 차기심사 */}
                  <th
                    onClick={() => handleSort('stageText')}
                    className="py-2.5 px-2.5 text-center min-w-[90px] cursor-pointer hover:bg-slate-200/80 transition whitespace-nowrap"
                  >
                    차기심사 {renderSortIcon('stageText')}
                  </th>

                  {/* 7. 차기심사일 */}
                  <th
                    onClick={() => handleSort('dueDate')}
                    className="py-2.5 px-3 min-w-[130px] cursor-pointer hover:bg-slate-200/80 transition text-center whitespace-nowrap"
                  >
                    차기심사일 {renderSortIcon('dueDate')}
                  </th>

                  {/* 8. 심사역할 */}
                  <th
                    onClick={() => handleSort('auditorRole')}
                    className="py-2.5 px-2.5 text-center min-w-[90px] cursor-pointer hover:bg-slate-200/80 transition text-slate-800 whitespace-nowrap"
                  >
                    심사역할 {renderSortIcon('auditorRole')}
                  </th>

                  {/* 9. 최근 심사일 (MD) - 협력기관 컬럼 대체 */}
                  <th
                    onClick={() => handleSort('recentAuditDate')}
                    className="py-2.5 px-3 text-center min-w-[175px] cursor-pointer hover:bg-slate-200/80 transition whitespace-nowrap"
                  >
                    최근 심사일 (MD) {renderSortIcon('recentAuditDate')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-normal text-[12px]">
                      검색 조건에 일치하는 심사 일정이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row, idx) => (
                    <tr key={row.rowId} className="hover:bg-slate-50/80 transition">
                      {/* 1. 진행상태 (해당 심사일정의 실제 상태 표시) */}
                      <td className="py-2 px-3 text-center align-middle whitespace-nowrap">
                        <span className={`text-[11.5px] font-medium ${getAuditStateTextClass(row.auditState)}`}>
                          {row.auditState}
                        </span>
                      </td>

                      {/* 2. No */}
                      <td className="py-2 px-2 text-center font-mono text-slate-400 text-[11px] align-middle">
                        {idx + 1}
                      </td>

                      {/* 3. 기업명 (대표자) - 기업명만 굵게 표시 */}
                      <td className="py-2 px-3.5 align-middle">
                        <button
                          type="button"
                          onClick={() => setHistoryModalCompany(row.companyWithStatus)}
                          className="text-left group cursor-pointer"
                        >
                          <div className="font-semibold text-[13px] text-slate-900 group-hover:text-cyan-700 transition flex items-center gap-1.5">
                            <span className="underline decoration-slate-300 group-hover:decoration-cyan-600 underline-offset-2">
                              {row.companyName}
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-cyan-600 shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                            {row.ceoName} 대표 {row.bizNumber ? `(${row.bizNumber})` : ''}
                          </div>
                        </button>
                      </td>

                      {/* 4. 인증규격 (인증번호) - 전환대상 규격만 빨간색/뱃지 표시, 인증번호는 검정색 유지 */}
                      <td className="py-2 px-3.5 leading-snug align-middle">
                        <div className="text-slate-800 text-[11.5px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {row.standardsList.map((std, sIdx) => {
                              const outChk = checkOutdatedStandard(std, officialVersions);
                              return (
                                <span
                                  key={sIdx}
                                  className={`inline-flex items-center gap-1 font-normal text-[11.5px] ${
                                    outChk.isOutdated ? 'text-red-600' : 'text-slate-800'
                                  }`}
                                >
                                  <span>{cleanStandardName(std)}</span>
                                  {outChk.isOutdated && (
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-rose-50 text-rose-600 border border-rose-200 font-normal">
                                      {outChk.officialVersion} 전환대상
                                    </span>
                                  )}
                                  {sIdx < row.standardsList.length - 1 && (
                                    <span className="text-slate-300">,</span>
                                  )}
                                </span>
                              );
                            })}
                            {row.isIntegrated && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium shrink-0">
                                통합심사
                              </span>
                            )}
                          </div>
                          {/* 인증번호는 검정색 볼드로 단정하게 표시 */}
                          <div className="text-slate-900 font-mono text-[11px] mt-0.5 tracking-tight font-bold">
                            ({row.certNo})
                          </div>
                        </div>
                      </td>

                      {/* 5. 코드 (IAF) - 볼드 제거, 단정한 폰트 */}
                      <td className="py-2 px-2.5 text-center font-mono text-slate-700 font-normal text-[11.5px] whitespace-nowrap align-middle">
                        {row.iafCode}
                      </td>

                      {/* 6. 차기심사 (갱신은 파란색, 볼드 제거) */}
                      <td className="py-2 px-2.5 text-center whitespace-nowrap align-middle">
                        <span className={`text-[11.5px] ${
                          row.stageText === '갱신' 
                            ? 'text-blue-600 font-medium' 
                            : 'text-slate-700 font-normal'
                        }`}>
                          {row.stageText}
                        </span>
                      </td>

                      {/* 7. 차기심사일 (심사준비/심사중일 때만 D-Day 표시) */}
                      <td className="py-2 px-3 text-center whitespace-nowrap align-middle">
                        <div className="font-mono font-normal text-slate-800 text-[11.5px]">
                          {row.dueDate}
                        </div>
                        {['심사준비', '심사 중'].includes(row.auditState) && (
                          <div className="mt-0.5 text-[10.5px] font-medium">
                            <span className={
                              row.dday.isOverdue
                                ? 'text-red-600'
                                : row.dday.isUrgent
                                ? 'text-amber-700'
                                : 'text-slate-500'
                            }>
                              {row.dday.text}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 8. 심사역할 - 볼드 남발 제거 */}
                      <td className="py-2 px-2.5 text-center whitespace-nowrap align-middle">
                        {(() => {
                          if (row.auditorRole === '팀장') return <span className="text-[11.5px] font-medium text-indigo-700">팀장</span>;
                          if (row.auditorRole === '심사원') return <span className="text-[11.5px] font-normal text-cyan-800">심사원</span>;
                          if (row.auditorRole === '심사원보') return <span className="text-[11.5px] font-normal text-slate-600">심사원보</span>;
                          return <span className="text-[11.5px] font-medium text-amber-700">협력기관</span>;
                        })()}
                      </td>

                      {/* 9. 최근 심사일 (MD) - ()속에 검정색으로 심사MD 표시 */}
                      <td className="py-2 px-3 text-center align-middle whitespace-nowrap">
                        <div className="font-mono font-normal text-slate-800 text-[11.5px]">
                          <span>{row.recentAuditDate}</span>
                          <span className="text-slate-900 font-medium ml-1.5">
                            ({row.auditMd.toFixed(1)} MD)
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              * 기업명을 클릭하면 해당 업체의 <strong>[전체 심사 이력]</strong>을 확인할 수 있습니다. 규격별 심사일정이 같으면 1개 행으로 통합 관리됩니다.
            </div>
            <div className="font-mono text-[11px] text-slate-600">
              총 {totalCompanyCount}개사 ({totalScheduleCount}개 심사일정) 중 {sortedRows.length}개 표시 중
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3-B. [월간 심사 일정 (달력 뷰)]                                                */}
      {/* ========================================================================= */}
      {activeTab === 'monthly' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedYear}년 {selectedMonth}월 심사 일정 캘린더
                </h3>
                <p className="text-[11px] text-slate-500">
                  {currentAuditor.name} 심사원님께 직접 배정된 심사 및 담당 예정 일정이 표시됩니다. (타 심사원 배정 건 제외)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 border border-slate-300 rounded-lg p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 1) {
                      setSelectedYear(prev => prev - 1);
                      setSelectedMonth(12);
                    } else {
                      setSelectedMonth(prev => prev - 1);
                    }
                  }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-xs text-slate-800 px-2">
                  {selectedYear}년 {String(selectedMonth).padStart(2, '0')}월
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 12) {
                      setSelectedYear(prev => prev + 1);
                      setSelectedMonth(1);
                    } else {
                      setSelectedMonth(prev => prev + 1);
                    }
                  }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* 달력 범례 (완료, 진행, 준비, 예정) */}
          <div className="flex items-center gap-3.5 text-[11px] font-bold text-slate-600 px-1 py-0.5 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
              <span>심사완료 (완료보고서/인증발행)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span>
              <span>심사진행중 (보고서작성)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
              <span>심사준비 (D-30/계획)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-500"></span>
              <span>차기 예정일</span>
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center text-xs font-extrabold py-2 text-slate-700">
              <span className="text-red-600">일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span className="text-blue-600">토</span>
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`min-h-[105px] p-1.5 transition ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-400'
                  } ${day.isToday ? 'ring-2 ring-cyan-500 ring-inset bg-cyan-50/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold font-mono ${
                      idx % 7 === 0 ? 'text-red-600' : idx % 7 === 6 ? 'text-blue-600' : 'text-slate-800'
                    }`}>
                      {day.dayNumber}
                    </span>
                    {day.isToday && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-600 text-white leading-none">
                        오늘
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {day.events.map((ev, eIdx) => {
                      let bgClass = 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';
                      let badgeClass = 'bg-slate-600 text-white';
                      let badgeText = '예정';

                      if (ev.type === 'completed') {
                        bgClass = 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200';
                        badgeClass = 'bg-emerald-600 text-white';
                        badgeText = '완료';
                      } else if (ev.type === 'in-progress') {
                        bgClass = 'bg-rose-100 text-rose-950 border-rose-300 hover:bg-rose-200';
                        badgeClass = 'bg-rose-600 text-white';
                        badgeText = '진행';
                      } else if (ev.type === 'prep') {
                        bgClass = 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200';
                        badgeClass = 'bg-amber-600 text-white';
                        badgeText = '준비';
                      }

                      return (
                        <div
                          key={eIdx}
                          onClick={() => {
                            if (ev.compStatus) setHistoryModalCompany(ev.compStatus);
                          }}
                          className={`p-1 rounded border text-[10.5px] font-bold cursor-pointer transition truncate ${bgClass}`}
                          title={`${ev.title} (${ev.stage}) ${ev.dayIndexText || ''}`}
                        >
                          <span className={`text-[9px] px-1 rounded mr-1 leading-none ${badgeClass}`}>
                            {badgeText}
                          </span>
                          <span>{ev.title}</span>
                          <span className="text-[10px] ml-1 font-normal opacity-90">({ev.stage})</span>
                          {ev.dayIndexText && (
                            <span className="text-[9px] ml-1 font-mono font-medium">[{ev.dayIndexText}]</span>
                          )}
                          {ev.extraNote && (
                            <span className="text-[9px] ml-1 font-mono font-semibold px-1 rounded bg-emerald-200/80 text-emerald-900 border border-emerald-300">[{ev.extraNote}]</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3-C. [비용정산] 탭                                                            */}
      {/* ========================================================================= */}
      {activeTab === 'settlement' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>총 누적 정산 대상액</span>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {settlementSummary.totalAll.toLocaleString()}원
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">총 {settlementSummary.count}건의 심사 실적</div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-emerald-800 text-xs">
                <span>기지급 완료액</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700 font-mono mt-1">
                {settlementSummary.totalPaid.toLocaleString()}원
              </div>
              <div className="text-[11px] text-emerald-700/80 mt-0.5">원천징수 영수증 발급완료</div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 text-xs">
                <span>9월 25일 입금 예정액</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-black text-amber-700 font-mono mt-1">
                {settlementSummary.totalPending.toLocaleString()}원
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">송이실업 갱신심사 수당 반영</div>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-200 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-indigo-800 text-xs">
                <span>정산 처리 계좌</span>
                <CreditCard className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xs font-black text-indigo-900 font-mono mt-1.5 truncate">
                기업은행 110-***-123456
              </div>
              <div className="text-[11px] text-indigo-700/80 mt-0.5">
                예금주: {currentAuditor.name} ({currentAuditor.affiliation || '비상근'})
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-800 text-xs">심사 수당 및 출장비 명세 대장</span>
                <span className="text-[11px] text-slate-500 font-mono">총 {settlementList.length}건</span>
              </div>
              <select
                value={settlementFilter}
                onChange={(e) => setSettlementFilter(e.target.value)}
                className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="all">전체 지급상태</option>
                <option value="입금완료">입금완료</option>
                <option value="입금예정">입금예정</option>
                <option value="정산대기">정산대기</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-xs">
                    <th className="py-2.5 px-3 text-center w-10 text-slate-500">No</th>
                    <th className="py-2.5 px-3 min-w-[100px]">심사일자</th>
                    <th className="py-2.5 px-3.5 min-w-[150px]">심사 기업명</th>
                    <th className="py-2.5 px-3.5 min-w-[160px]">인증규격 (인증번호)</th>
                    <th className="py-2.5 px-2.5 text-center w-20">심사구분</th>
                    <th className="py-2.5 px-2 text-center w-16">역할</th>
                    <th className="py-2.5 px-2 text-center w-14">MD</th>
                    <th className="py-2.5 px-3 text-right">기본 심사비</th>
                    <th className="py-2.5 px-3 text-right">여비/출장비</th>
                    <th className="py-2.5 px-3 text-right font-extrabold text-slate-900">지급합계</th>
                    <th className="py-2.5 px-2.5 text-center w-24">지급상태</th>
                    <th className="py-2.5 px-2.5 text-center w-20">명세서</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {settlementList
                    .filter(s => settlementFilter === 'all' || s.status === settlementFilter)
                    .map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-800 text-[11px] whitespace-nowrap">{item.auditDate}</td>
                        <td className="py-2.5 px-3.5 font-bold text-slate-900">{item.companyName}</td>
                        <td className="py-2.5 px-3.5 text-slate-600 text-[11px]">{item.standards}</td>
                        <td className="py-2.5 px-2.5 text-center font-bold text-slate-800 whitespace-nowrap">{item.stageText}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-cyan-800 whitespace-nowrap">{item.role}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700">{item.md}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">{item.baseFee.toLocaleString()}원</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">{item.travelFee.toLocaleString()}원</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">{item.totalFee.toLocaleString()}원</td>
                        <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.status === '입금완료'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === '입금예정'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedSettlementDetail(item)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition"
                          >
                            상세
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3-D. [심사자격관리] 탭 (심사원카드 등록, 규격 코드관리, 주기적 갱신 관리)          */}
      {/* ========================================================================= */}
      {activeTab === 'qualification' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 animate-in fade-in">
          
          {/* 심사원증 / 심사원 카드 (KAB 공인 심사원 카드 등록 정보) */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 p-6 rounded-2xl text-white gap-5 shadow-md">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black shadow-inner shrink-0">
                <UserCheck className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-black tracking-tight">{currentAuditor.name} 선임심사원</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                    KAB 공인 선임심사원증 등록완료
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-200 text-[10.5px] font-medium font-mono">
                    KAB-CARD-2018-0914
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  소속: <strong>비상근 선임심사원</strong> | 인증원: <strong>(주)지엠에스인증원 (GMSCS)</strong> | 등록번호: <strong className="font-mono">KAB-QMS-09-0418</strong>
                </p>
                <div className="text-[11.5px] text-slate-300 flex items-center gap-3 pt-0.5 flex-wrap">
                  <span>최초 등록일: <strong className="font-mono text-slate-200">2018-04-10</strong></span>
                  <span>자격 유효기간: <strong className="font-mono text-cyan-300">2027-12-31</strong> (D-477일, 정상 유지)</span>
                  <span className="text-emerald-400 font-bold">• 사무국 DB 실시간 연동완료</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => alert('모바일 심사원증이 고해상도 PDF로 다운로드됩니다.')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>심사원증 발급/저장</span>
              </button>
              <button
                type="button"
                onClick={() => alert('심사원 자격증명서 및 이력카드가 출력됩니다.')}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>자격증명서 인쇄</span>
              </button>
            </div>
          </div>

          {/* 보유 심사 규격별 자격 등급 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">ISO 9001 (품질)</span>
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10.5px] font-black">선임심사원</span>
              </div>
              <div className="text-[11.5px] text-slate-700 leading-relaxed">
                • 등록일: 2018-04-10 (KAB 등록)<br />
                • 보수교육: 2026년 16시간 이수완료<br />
                • 누적 실적: 24.5 MD 달성 (자격유지 적격)
              </div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">ISO 14001 (환경)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10.5px] font-black">선임심사원</span>
              </div>
              <div className="text-[11.5px] text-slate-700 leading-relaxed">
                • 등록일: 2019-06-15 (KAB 등록)<br />
                • 보수교육: 2026년 16시간 이수완료<br />
                • 누적 실적: 16.0 MD 달성 (자격유지 적격)
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">ISO 45001 (안전보건)</span>
                <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10.5px] font-black">심사원</span>
              </div>
              <div className="text-[11.5px] text-slate-700 leading-relaxed">
                • 등록일: 2021-02-20 (KAB 등록)<br />
                • 보수교육: 2026년 16시간 이수완료<br />
                • 누적 실적: 8.0 MD (선임심사원 승급 요건 충족 중)
              </div>
            </div>
          </div>

          {/* 공인 심사 가능 분야 (IAF Code) 테이블 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-xs">KAB 등록 전문 심사 코드 (IAF / EA 산업분야)</span>
                <span className="text-[11px] text-slate-500 font-mono">총 6개 산업분야 승인</span>
              </div>
              <button
                type="button"
                onClick={() => alert('신규 심사분야(IAF 코드) 추가 승인 신청 양식이 열립니다.')}
                className="px-2.5 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-[11px] transition"
              >
                + 신규 코드 승인 신청
              </button>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-xs">
                  <th className="py-2.5 px-3 text-center w-16">IAF 코드</th>
                  <th className="py-2.5 px-3.5">산업 및 기술 분야명</th>
                  <th className="py-2.5 px-3 text-center w-28">승인 규격</th>
                  <th className="py-2.5 px-3 text-center w-24">자격 등급</th>
                  <th className="py-2.5 px-3 text-center w-28">적격성 평가일</th>
                  <th className="py-2.5 px-3 text-center w-24">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  { code: '04', name: '화학물질, 화학제품 및 인조섬유 (정인 H&SP 등)', stds: 'ISO 9001, 14001', grade: '선임심사원', date: '2024-03-15', status: '유효' },
                  { code: '14', name: '고무 및 플라스틱 제품 제조업 (디아이엔바이로 등)', stds: 'ISO 9001, 14001, 45001', grade: '선임심사원', date: '2024-03-15', status: '유효' },
                  { code: '17', name: '기본 금속 및 가공 금속제품 제조업 (디와이메탈, 케이원메탈)', stds: 'ISO 9001, 14001, 45001', grade: '선임심사원', date: '2024-03-15', status: '유효' },
                  { code: '18', name: '기계 및 장비 제조업 (일반 기계, 케이엠텍 등)', stds: 'ISO 9001, 14001', grade: '선임심사원', date: '2024-03-15', status: '유효' },
                  { code: '28', name: '건설업 및 토목공사 (두성토건 등)', stds: 'ISO 9001, 14001, 45001', grade: '선임심사원', date: '2024-03-15', status: '유효' },
                  { code: '31', name: '운송, 보관 및 통신업 (한창종합물류 등)', stds: 'ISO 9001, 14001, 45001', grade: '선임심사원', date: '2024-03-15', status: '유효' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 text-center font-mono font-black text-cyan-800">{row.code}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-800">{row.name}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">{row.stds}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-indigo-800">{row.grade}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{row.date}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3년 주기 자격 갱신 요건 달성 현황 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span>주기적 자격 갱신 및 유지 실적 (3년 주기 적격성 검증 요건)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">KAB 필수 연간 보수교육(CPD)</span>
                <strong className="text-emerald-700 font-mono text-sm block mt-1">16 / 16시간 (100% 이수)</strong>
                <span className="text-[10.5px] text-slate-400">2026년도 이수완료 증명 제출됨</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">최근 3개년 심사공수 실적</span>
                <strong className="text-indigo-700 font-mono text-sm block mt-1">48.5 MD (기준 15 MD 달성)</strong>
                <span className="text-[10.5px] text-slate-400">의무 실적 대비 323% 초과 달성</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">차기 적격성 재평가 예정일</span>
                <strong className="text-slate-900 font-mono text-sm block mt-1">2027년 11월</strong>
                <span className="text-[10.5px] text-cyan-700 font-medium">자격 유지 상태: 정상 (Active)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3-E. [심사MD] 탭 (KAB 기준 인원수별 심사MD 산정표 및 통합 할인규칙 안내)       */}
      {/* ========================================================================= */}
      {activeTab === 'auditMd' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 animate-in fade-in">
          
          {/* 상단 안내 배너 */}
          <div className="bg-cyan-50/80 border border-cyan-200 p-4 rounded-2xl flex items-start space-x-3 text-cyan-950">
            <Calculator className="w-5 h-5 text-cyan-700 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="font-black text-sm text-cyan-900">
                공인 심사MD 산정 기준 및 통합심사 할인 규칙 안내 (KAB / IAF MD 가이드라인)
              </h3>
              <p className="text-xs text-cyan-800 leading-relaxed">
                한국인정지원센터(KAB) 및 국제인정포럼(IAF MD 5, MD 11) 규정에 근거하여 산출되는 공식 심사공수 산정 기준표입니다.
                본 기준은 <strong>인증원 사무국과 심사원에게 동일하게 공유·적용</strong>되며 계약 및 심사 계획 수립의 기초가 됩니다.
              </p>
            </div>
          </div>

          {/* 대화형 심사MD 시뮬레이터 */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-700" />
                <span className="font-extrabold text-slate-900 text-xs">실시간 심사MD 산정 시뮬레이터</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">단가: 800,000원/MD (KAB 기준단가)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 인원수 설정 */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex justify-between">
                  <span>종업원 수 (상시 근로자)</span>
                  <strong className="text-cyan-800 font-mono text-sm">{calcEmpCount}명</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={250}
                  value={calcEmpCount}
                  onChange={(e) => setCalcEmpCount(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-700"
                />
                <div className="flex justify-between text-[10.5px] text-slate-400 font-mono">
                  <span>1인</span>
                  <span>50인</span>
                  <span>100인</span>
                  <span>250인</span>
                </div>
              </div>

              {/* 적용 규격 선택 */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">신청 / 심사 규격 (다중 선택)</label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {['ISO 9001', 'ISO 14001', 'ISO 45001'].map(std => {
                    const isSelected = calcStandards.includes(std);
                    return (
                      <button
                        key={std}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (calcStandards.length > 1) {
                              setCalcStandards(calcStandards.filter(s => s !== std));
                            }
                          } else {
                            setCalcStandards([...calcStandards, std]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-700 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{std}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 심사 차수 선택 */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">심사 구분</label>
                <div className="flex gap-1.5 pt-0.5">
                  {(['사후', '갱신', '최초'] as const).map(stg => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => setCalcStage(stg)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        calcStage === stg
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {stg === '사후' ? '사후관리 (1/3)' : stg === '갱신' ? '갱신심사 (2/3)' : '최초심사 (100%)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 시뮬레이션 결과 박스 */}
            <div className="bg-white border border-cyan-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-500">산출 공수 요약:</span>
                  <span className="text-slate-700">규격합계 {calculatedMdResult.totalStdMd} MD</span>
                  {calculatedMdResult.discountPercent > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10.5px]">
                      통합심사 {calculatedMdResult.discountPercent}% 감축
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  * 산정 공식: (규격별 기본공수 합산) × (1 - 통합감축률) × 심사차수 비율
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-500 block">최종 적용 심사공수</span>
                <strong className="text-2xl font-black text-cyan-800 font-mono">
                  {calculatedMdResult.finalMd} MD
                </strong>
                <span className="text-xs font-mono font-bold text-slate-700 ml-2">
                  (약 {calculatedMdResult.feeEstimate.toLocaleString()}원)
                </span>
              </div>
            </div>
          </div>

          {/* KAB 인원수별 심사공수(MD) 기준표 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-xs">KAB 인원수 구간별 표준 심사 MD 기준표</span>
                <span className="text-[11px] text-slate-500">(최초 심사 1+2단계 기준)</span>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-xs">
                  <th className="py-2.5 px-3 text-center w-28">종업원 수 구간</th>
                  <th className="py-2.5 px-3 text-center">ISO 9001 (품질)</th>
                  <th className="py-2.5 px-3 text-center">ISO 14001 (환경)</th>
                  <th className="py-2.5 px-3 text-center">ISO 45001 (안전)</th>
                  <th className="py-2.5 px-3 text-center">사후심사 공수 (약 1/3)</th>
                  <th className="py-2.5 px-3 text-center">갱신심사 공수 (약 2/3)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {[
                  { range: '1 ~ 5인', qms: '1.5 MD', ems: '1.5 MD', ohsms: '2.0 MD', surv: '1.0 MD', recert: '1.5 MD' },
                  { range: '6 ~ 10인', qms: '2.0 MD', ems: '2.0 MD', ohsms: '2.5 MD', surv: '1.0 MD', recert: '1.5 MD' },
                  { range: '11 ~ 15인', qms: '2.5 MD', ems: '2.5 MD', ohsms: '3.0 MD', surv: '1.0 MD', recert: '2.0 MD' },
                  { range: '16 ~ 25인', qms: '3.0 MD', ems: '3.0 MD', ohsms: '3.5 MD', surv: '1.5 MD', recert: '2.0 MD' },
                  { range: '26 ~ 45인', qms: '4.0 MD', ems: '4.0 MD', ohsms: '4.5 MD', surv: '1.5 MD', recert: '2.5 MD' },
                  { range: '46 ~ 65인', qms: '5.0 MD', ems: '5.0 MD', ohsms: '5.5 MD', surv: '2.0 MD', recert: '3.5 MD' },
                  { range: '66 ~ 85인', qms: '6.0 MD', ems: '6.0 MD', ohsms: '6.5 MD', surv: '2.0 MD', recert: '4.0 MD' },
                  { range: '86 ~ 125인', qms: '7.0 MD', ems: '7.0 MD', ohsms: '7.5 MD', surv: '2.5 MD', recert: '5.0 MD' },
                  { range: '126 ~ 175인', qms: '8.0 MD', ems: '8.0 MD', ohsms: '8.5 MD', surv: '3.0 MD', recert: '5.5 MD' },
                  { range: '176 ~ 275인', qms: '9.0 MD', ems: '9.0 MD', ohsms: '9.5 MD', surv: '3.0 MD', recert: '6.0 MD' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition text-center">
                    <td className="py-2 px-3 font-bold text-slate-900 bg-slate-50/50">{row.range}</td>
                    <td className="py-2 px-3 text-cyan-900">{row.qms}</td>
                    <td className="py-2 px-3 text-emerald-900">{row.ems}</td>
                    <td className="py-2 px-3 text-amber-900">{row.ohsms}</td>
                    <td className="py-2 px-3 text-slate-600 font-bold">{row.surv}</td>
                    <td className="py-2 px-3 text-indigo-700 font-bold">{row.recert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 통합심사 할인 및 감축/가산 규칙 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>통합심사(Integrated Audit) 공수 감축 규칙 (IAF MD 11)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11.5px]">
                단일 통합 관리시스템을 운영하는 조직에 대하여 동시 심사를 수행할 경우 다음과 같이 총 공수를 감축 적용합니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1 text-[11.5px]">
                <li><strong>2개 규격 통합 (예: 9001 + 14001):</strong> 최대 <strong>20% 감축</strong></li>
                <li><strong>3개 규격 통합 (예: 9001 + 14001 + 45001):</strong> 최대 <strong>30% 감축</strong></li>
                <li><strong>조건:</strong> 단일 통합 방침 및 경영검토, 통합 내부심사 절차 보유 필수</li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-600" />
                <span>다사업장(Multi-site) 및 리스크별 가감 규칙</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11.5px]">
                사업장 분소 및 공정 특성에 따라 공수가 가감될 수 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1 text-[11.5px]">
                <li><strong>다사업장 샘플링:</strong> 본사 심사 + 지사/공장은 √n 공식으로 샘플링 심사</li>
                <li><strong>단순 공정 할인:</strong> 설계/개발 제외 및 비제조 단순 서비스업 10~20% 감축</li>
                <li><strong>위험 공정 가산:</strong> 중대재해 고위험 분야 또는 복합 외주 공정 보유 시 10~20% 가산</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 팝업 모달 1: 기업 심사 이력 팝업                                              */}
      {/* ========================================================================= */}
      <CompanyAuditHistoryModal
        isOpen={Boolean(historyModalCompany)}
        onClose={() => setHistoryModalCompany(null)}
        company={historyModalCompany?.company || null}
        contracts={contracts}
        projects={projects}
        settlements={settlements}
        allAuditors={_allAuditors}
        onOpenReport={onOpenReport}
        onOpenPdfReport={onOpenPdfReport}
        onOpenPlanInvoiceModal={(comp) => {
          const found = allCompanyItems.find(item => item.company.id === comp.id);
          if (found) {
            setPlanInvoiceModalCompany(found);
            setIsAgreedAndSent(false);
          }
        }}
      />

      {/* ========================================================================= */}
      {/* 팝업 모달 2: 심사계획서 및 심사비 청구서 사전 확인 모달                         */}
      {/* ========================================================================= */}
      {planInvoiceModalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    심사계획서 및 심사비 청구서 확인
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    수립 대상: <strong>{planInvoiceModalCompany.company.companyName}</strong> ({planInvoiceModalCompany.stageText})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlanInvoiceModalCompany(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl text-blue-950 space-y-1">
              <div className="font-bold flex items-center gap-1 text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>[실무 프로세스] 심사원 사전 확인 &amp; 기업 공문 발송</span>
              </div>
              <p className="text-[11px] text-blue-900/80 leading-relaxed">
                인증원에서 수립한 심사계획서 및 심사비 청구서입니다. 심사원님이 일정 및 내용을 확인하고 [동의 &amp; 기업 발송]을 누르시면 해당 고객사에 공문 메일이 발송됩니다.
              </p>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">피심사 기업</span>
                <strong className="text-slate-900">{planInvoiceModalCompany.company.companyName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">심사 표준</span>
                <strong className="text-slate-900">{planInvoiceModalCompany.stdAndCerts.map(s => s.std).join(', ')}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">배정 심사팀</span>
                <strong className="text-slate-900">{currentAuditor.name} 심사팀장</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">예정 심사일정</span>
                <strong className="text-cyan-800 font-mono">{planInvoiceModalCompany.dueDate} (2일간)</strong>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">심사비 청구액 (VAT 별도)</span>
                <strong className="text-emerald-700 text-sm font-mono">1,800,000원</strong>
              </div>
            </div>

            {isAgreedAndSent ? (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-center font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>심사원 동의 완료! 고객사에 심사계획서와 청구서가 성공적으로 발송되었습니다.</span>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setPlanInvoiceModalCompany(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
              >
                닫기
              </button>
              {!isAgreedAndSent && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAgreedAndSent(true);
                    onOpenEmailModal(
                      `${planInvoiceModalCompany.company.companyName} (${planInvoiceModalCompany.company.contactPerson || '담당자'})`,
                      planInvoiceModalCompany.company.contactEmail || 'admin@gmscs.co.kr',
                      '심사계획서'
                    );
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>심사원 동의 &amp; 기업에 발송</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 팝업 모달 3: 인증원 공지사항 상세 팝업                                       */}
      {/* ========================================================================= */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="text-[12px] font-bold text-cyan-800">
                  [{selectedNotice.category}]
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{selectedNotice.createdAt}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
              {selectedNotice.title}
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed text-[11.5px] max-h-60 overflow-y-auto">
              {selectedNotice.content}
            </div>

            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>작성자: {selectedNotice.authorName}</span>
              <span>대상: {selectedNotice.targetAudience}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 팝업 모달 4: 비용정산 상세 명세서 확인 팝업                                    */}
      {/* ========================================================================= */}
      {selectedSettlementDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">심사비 수당 정산 명세서</h3>
                  <p className="text-[11px] text-slate-500">{selectedSettlementDetail.companyName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSettlementDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">심사 기업명</span>
                <strong className="text-slate-900">{selectedSettlementDetail.companyName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">심사 표준 / 인증번호</span>
                <span className="text-slate-800 font-mono text-[11px]">{selectedSettlementDetail.standards}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">심사일자 및 차수</span>
                <span className="text-slate-800 font-mono">{selectedSettlementDetail.auditDate} ({selectedSettlementDetail.stageText})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">심사역할 및 공수(MD)</span>
                <span className="text-cyan-800 font-bold">{selectedSettlementDetail.role} ({selectedSettlementDetail.md} MD)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">기본 심사 수당</span>
                <span className="font-mono text-slate-800">{selectedSettlementDetail.baseFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">출장 여비 / 숙박비</span>
                <span className="font-mono text-slate-800">{selectedSettlementDetail.travelFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="font-extrabold text-slate-800">지급 합계액</span>
                <strong className="text-emerald-700 font-mono text-base">{selectedSettlementDetail.totalFee.toLocaleString()}원</strong>
              </div>
              <div className="text-[10.5px] text-slate-400 text-right">
                * 사업소득세 (3.3%) 원천징수 전 금액입니다.
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
              지급 상태: <strong>{selectedSettlementDetail.status}</strong> (지급예정일: {selectedSettlementDetail.dueDate})
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => alert('명세서 영수증 인쇄 화면으로 이동합니다.')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>인쇄</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSettlementDetail(null)}
                className="px-4 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사무국 공인 최신 규격 버전(연도) 설정 모달 */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    인증원 규격별 공인 버전(연도) 관리
                  </h3>
                  <p className="text-xs text-slate-500">
                    사무국 규격 버전 설정 시 구버전 인증 유지 업체의 해당 규격이 전환대상으로 자동 표시됩니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVersionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 안내 배너 */}
            <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-amber-950 mb-1">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>구버전 규격 자동 감지 안내</span>
              </div>
              <p>
                현재 <strong>ISO 14001</strong>의 최신 공인 버전이 <strong>2026</strong>으로 설정되어 있습니다. 
                이전 버전(예: ISO 14001:2015)으로 인증을 유지 중인 업체는 대장에서 
                해당 규격이 <span className="text-red-600 font-semibold ml-0.5">붉은색</span>으로 강조되며 <span className="px-1 py-0.2 rounded bg-rose-100 text-rose-700 text-[11px] font-medium border border-rose-200">[2026 전환대상]</span> 배지가 부여됩니다.
              </p>
            </div>

            {/* 규격별 버전 편집 리스트 */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {Object.entries(DEFAULT_OFFICIAL_STANDARD_VERSIONS).map(([stdKey, defYear]) => {
                const curYear = officialVersions[stdKey] || defYear;
                const isCustomized = curYear !== defYear;
                return (
                  <div
                    key={stdKey}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      stdKey === 'ISO 14001'
                        ? 'bg-cyan-50/50 border-cyan-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                        <span>{stdKey}</span>
                        {stdKey === 'ISO 14001' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 font-medium">
                            요청 지정
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        기본 권장 버전: {defYear}년
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">버전(연도):</span>
                      <input
                        type="text"
                        value={curYear}
                        onChange={(e) => handleUpdateOfficialVersion(stdKey, e.target.value)}
                        placeholder="2026"
                        maxLength={4}
                        className="w-20 px-2.5 py-1 text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                      />
                      {isCustomized && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOfficialVersion(stdKey, defYear)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                          title="기본값으로 복원"
                        >
                          초기화
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 하단 버튼 */}
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setOfficialVersions(DEFAULT_OFFICIAL_STANDARD_VERSIONS);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('gmscs_official_standard_versions', JSON.stringify(DEFAULT_OFFICIAL_STANDARD_VERSIONS));
                  }
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                전체 기본값 복원
              </button>
              <button
                type="button"
                onClick={() => setIsVersionModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                설정 완료 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
