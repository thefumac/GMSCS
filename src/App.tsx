import React, { useState } from 'react';
import { Navbar, ActiveTab, MainCategory } from './components/Navbar';
import { DashboardCalendar } from './components/DashboardCalendar';
import { AuditReportEditor } from './components/AuditReportEditor';
import { AuditReportList } from './components/AuditReportList';
import { AuditContractManager } from './components/AuditContractManager';
import { SurveillanceManager } from './components/SurveillanceManager';
import { CompanyAuditorManager } from './components/CompanyAuditorManager';
import { KabCalculator } from './components/KabCalculator';
import { BillingManager } from './components/BillingManager';
import { BackupManager } from './components/BackupManager';
import { EsgRecordIntegrator } from './components/EsgRecordIntegrator';
import { AuditorPortal } from './components/AuditorPortal';
import { AuditorSettlementManager } from './components/AuditorSettlementManager';
import { CommitteeManager } from './components/CommitteeManager';
import { EmailDispatchModal, EmailDispatchData } from './components/EmailDispatchModal';
import { LoginPage } from './components/LoginPage';
import { AuditorNoticeManager } from './components/AuditorNoticeManager';
import { PdfViewerModal } from './components/PdfViewerModal';
import { AuditorProfileModal } from './components/AuditorProfileModal';
import { AuditProcessStatusManager } from './components/AuditProcessStatusManager';
import { ClientManagement } from './components/ClientManagement';
import { AuditorManagement } from './components/AuditorManagement';
import { CertificationManagement } from './components/CertificationManagement';
import { CompanyAuditHistoryModal } from './components/CompanyAuditHistoryModal';
import { AuditReportWorkbench } from './components/AuditReportWorkbench';
import { CommitteeScheduleItem, loadSavedCommitteeSchedules } from './utils/committeeSchedule';

import { 
  mockAuditors, 
  mockCompanies, 
  mockContracts, 
  mockProjects, 
  mockReports,
  mockSettlements,
  mockCommitteeMeetings,
  mockEmailLogs,
  mockAuditContracts,
  mockAuditorNotices
} from './data/mockData';
import { getMergedAuditors, getMergedCompanies, getMergedContracts, getMergedProjects } from './data/legacyDataLoader';
import { 
  AuditReport, 
  AuditProject, 
  PaymentStatus, 
  TaxInvoiceStatus,
  Auditor,
  Company,
  CertContract,
  AuditorSettlement,
  CommitteeMeeting,
  CommitteeDecision,
  AuditorReassignmentLog,
  EmailDispatchLog,
  AuditContractRecord,
  AuditorAffiliation,
  AuditorNotice
} from './types';

export function App() {
  // Session & Role Management - 접속 시 항상 랜딩(로그인) 페이지가 먼저 표시되도록 초기화
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [currentUserRole, setCurrentUserRole] = useState<string>('admin');

  // Core Data States (36 Legacy Auditors & 572 Legacy Companies)
  const [auditors, setAuditors] = useState<Auditor[]>(() => {
    const base = getMergedAuditors();
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gmscs_auditor_overrides');
        if (saved) {
          const overrides: Record<string, Partial<Auditor>> = JSON.parse(saved);
          return base.map(a => overrides[a.id] ? { ...a, ...overrides[a.id] } : a);
        }
      } catch (e) {
        console.error('Failed to load auditor overrides from localStorage', e);
      }
    }
    return base;
  });
  const [companies, setCompanies] = useState<Company[]>(() => {
    const base = getMergedCompanies();
    if (typeof window !== 'undefined') {
      try {
        const savedNew = localStorage.getItem('gmscs_custom_new_companies');
        if (savedNew) {
          const parsedNew: Company[] = JSON.parse(savedNew);
          return [...parsedNew, ...base];
        }
      } catch (e) {
        console.error('Failed to load custom companies from localStorage', e);
      }
    }
    return base;
  });

  const handleAddCompany = (newCompany: Company) => {
    setCompanies(prev => {
      const updated = [newCompany, ...prev];
      try {
        const customOnly = updated.filter(c => c.id?.startsWith('COMP-NEW-') || (c as any).isTransfer || (c as any).isCustom);
        localStorage.setItem('gmscs_custom_new_companies', JSON.stringify(customOnly));
      } catch (e) {
        console.error('Failed to save custom companies to localStorage', e);
      }
      return updated;
    });
  };

  const [contracts, setContracts] = useState<CertContract[]>(() => getMergedContracts());
  const [projects, setProjects] = useState<AuditProject[]>(() => getMergedProjects());
  const [reports, setReports] = useState<Record<string, AuditReport>>(mockReports);
  const [settlements, setSettlements] = useState<AuditorSettlement[]>(mockSettlements);
  const [committeeMeetings, setCommitteeMeetings] = useState<CommitteeMeeting[]>(mockCommitteeMeetings);
  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>(mockEmailLogs);
  const [auditContracts, setAuditContracts] = useState<AuditContractRecord[]>(mockAuditContracts);
  const [committeeSchedules, setCommitteeSchedules] = useState<CommitteeScheduleItem[]>(() => loadSavedCommitteeSchedules());
  // 심사보고서 목록 관리 vs 세부 에디터 전환 상태
  const [isEditingReport, setIsEditingReport] = useState<boolean>(false);
  const [activeReportId, setActiveReportId] = useState<string>('rep-1');

  // 일반관리 - 재무관리 하위 서브탭 ('settlements' | 'billing')
  const [financeSubTab, setFinanceSubTab] = useState<'settlements' | 'billing'>('settlements');

  // 심사원 공지사항 상태 (사무국 4인 공식 공지 & 파일/저장링크)
  const [auditorNotices, setAuditorNotices] = useState<AuditorNotice[]>(mockAuditorNotices);

  const handleAddNotice = (notice: AuditorNotice) => {
    setAuditorNotices(prev => [notice, ...prev]);
  };

  const handleUpdateNotice = (notice: AuditorNotice) => {
    setAuditorNotices(prev => prev.map(n => n.id === notice.id ? notice : n));
  };

  const handleDeleteNotice = (id: string) => {
    setAuditorNotices(prev => prev.filter(n => n.id !== id));
  };

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [emailModalData, setEmailModalData] = useState<Partial<EmailDispatchData>>({
    templateType: '심사계획서'
  });

  const [isEmailDirectEntry, setIsEmailDirectEntry] = useState<boolean>(false);

  // 과거 심사보고서 및 인증서 PDF 뷰어 모달 상태
  const [pdfModalState, setPdfModalState] = useState<{
    isOpen: boolean;
    title: string;
    pdfUrl?: string;
    companyName: string;
    standard?: string;
    auditType?: string;
    auditDate?: string;
    auditorName?: string;
  }>({
    isOpen: false,
    title: '',
    companyName: ''
  });

  // 기업 심사이력 및 경과 통합 모달 상태
  const [historyModalCompany, setHistoryModalCompany] = useState<Company | null>(null);

  // 심사보고서 워크벤치 모달 상태 (신규/1단계/2단계/특약/증빙서류 통합)
  const [workbenchCompany, setWorkbenchCompany] = useState<Company | null>(null);

  // 심사원 마이페이지 / 개인정보 및 지급방식 관리 모달 상태
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // 심사원 개인정보 및 지급정보 업데이트 핸들러 (로컬스토리지 영구 반영)
  const handleUpdateAuditorProfile = (updatedAuditor: Auditor) => {
    setAuditors(prev => prev.map(a => a.id === updatedAuditor.id ? updatedAuditor : a));
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gmscs_auditor_overrides');
        const overrides = saved ? JSON.parse(saved) : {};
        overrides[updatedAuditor.id] = updatedAuditor;
        localStorage.setItem('gmscs_auditor_overrides', JSON.stringify(overrides));
      } catch (e) {
        console.error('Failed to save auditor profile override', e);
      }
    }
  };

  // 기업 정보 (인증범위 등) 실시간 업데이트 핸들러
  const handleUpdateCompany = (updated: Company) => {
    setCompanies(prev => prev.map(c => (c.id === updated.id || c.companyName === updated.companyName) ? { ...c, ...updated } : c));
    setHistoryModalCompany(prev => (prev && (prev.id === updated.id || prev.companyName === updated.companyName)) ? { ...prev, ...updated } : prev);
  };

  React.useEffect(() => {
    const handleCompEvent = (e: any) => {
      if (e.detail) {
        handleUpdateCompany(e.detail);
      }
    };
    window.addEventListener('gmscs_company_updated', handleCompEvent);
    return () => window.removeEventListener('gmscs_company_updated', handleCompEvent);
  }, []);


  // 현재 로그인한 심사원 객체 및 권한 체계 (상근 4인: 남경호, 정현일, 남효린, 이혜원 + 현 시점 김홍덕)
  const currentAuditorObj: Auditor = auditors.find(a => a.id === currentUserRole) 
    || (currentUserRole === 'admin' ? auditors.find(a => a.isSystemAdmin) || auditors[0] : auditors[0]);

  const STAFF_NAMES = ['남경호', '정현일', '남효린', '이혜원', '이예원', '김홍덕'];
  const STAFF_EMAILS = ['nam2304@empas.com', 'himix1993@gmail.com', 'kgms2304@gmail.com', 'yewon6798@gmail.com', 'fumac@naver.com'];

  const isStaff = 
    currentAuditorObj?.isSystemAdmin || 
    currentAuditorObj?.affiliation === '상근' || 
    STAFF_NAMES.some(name => currentAuditorObj?.name?.includes(name)) ||
    (currentAuditorObj?.email && STAFF_EMAILS.includes(currentAuditorObj.email.toLowerCase().trim())) ||
    currentUserRole === 'admin';

  const isRegularAuditor = !isStaff;
  const isNonPermanent = isRegularAuditor; // 일반 심사원 전용 보안 격리

  // Navigation Category Helper
  const getCategoryForTab = (tab: ActiveTab): MainCategory => {
    switch (tab) {
      case 'calendar':
      case 'projects':
      case 'contracts':
      case 'reports':
      case 'integrations':
        return 'audit';
      case 'clients':
      case 'certification':
      case 'committee':
      case 'companies':
      case 'surveillance':
      case 'kab':
        return 'certification';
      case 'portal':
      case 'auditors':
        return 'auditor-mgmt';
      case 'finance':
      case 'notices':
      case 'data':
        return 'general-admin';
      default:
        return 'audit';
    }
  };

  // URL Hash 생성 헬퍼
  const buildHash = (tab: ActiveTab, isEditing: boolean, repId?: string, finSubTab?: 'settlements' | 'billing'): string => {
    if (tab === 'reports' && isEditing && repId) {
      return `#reports/edit/${repId}`;
    }
    if (tab === 'finance' && finSubTab) {
      return `#finance/${finSubTab}`;
    }
    return `#${tab}`;
  };

  // URL Hash 파싱 헬퍼
  const parseHashState = (hash: string) => {
    const clean = hash.replace(/^#\/?/, '');
    if (!clean) return null;
    const parts = clean.split('/');
    const tab = parts[0] as ActiveTab;

    if (tab === 'reports' && parts[1] === 'edit' && parts[2]) {
      return {
        tab: 'reports' as ActiveTab,
        category: 'audit' as MainCategory,
        isEditingReport: true,
        activeReportId: parts[2],
        financeSubTab: 'settlements' as const
      };
    }
    if (tab === 'finance' && (parts[1] === 'settlements' || parts[1] === 'billing')) {
      return {
        tab: 'finance' as ActiveTab,
        category: 'general-admin' as MainCategory,
        isEditingReport: false,
        activeReportId: 'rep-1',
        financeSubTab: parts[1] as 'settlements' | 'billing'
      };
    }
    return {
      tab,
      category: getCategoryForTab(tab),
      isEditingReport: false,
      activeReportId: 'rep-1',
      financeSubTab: 'settlements' as const
    };
  };

  // 2-Tier Navigation State (최초 접속 및 로그인 시 심사일정 달력화면 기본)
  const [activeCategory, setActiveCategory] = useState<MainCategory>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const parsed = parseHashState(window.location.hash);
      if (parsed) return parsed.category;
    }
    return 'audit';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const parsed = parseHashState(window.location.hash);
      if (parsed) return parsed.tab;
    }
    return 'calendar';
  });

  // 통합 네비게이션 함수 (Browser History pushState / replaceState 연동)
  const navigateTo = React.useCallback((
    tab: ActiveTab, 
    category?: MainCategory, 
    options?: {
      isEditingReport?: boolean;
      reportId?: string;
      financeSubTab?: 'settlements' | 'billing';
      replace?: boolean;
    }
  ) => {
    const targetCategory = category || getCategoryForTab(tab);
    const targetIsEditing = options?.isEditingReport !== undefined 
      ? options.isEditingReport 
      : (tab === 'reports' ? isEditingReport : false);
    const targetReportId = options?.reportId || activeReportId;
    const targetFinanceSubTab = options?.financeSubTab || financeSubTab;

    setActiveCategory(targetCategory);
    setActiveTab(tab);
    setIsEditingReport(targetIsEditing);
    if (options?.reportId) setActiveReportId(options.reportId);
    if (options?.financeSubTab) setFinanceSubTab(options.financeSubTab);

    const historyPayload = {
      category: targetCategory,
      tab,
      isEditingReport: targetIsEditing,
      activeReportId: targetReportId,
      financeSubTab: targetFinanceSubTab,
    };

    const newHash = buildHash(tab, targetIsEditing, targetReportId, targetFinanceSubTab);

    if (typeof window !== 'undefined') {
      if (options?.replace || window.location.hash === newHash) {
        window.history.replaceState(historyPayload, '', newHash);
      } else {
        window.history.pushState(historyPayload, '', newHash);
      }
    }
  }, [activeReportId, financeSubTab, isEditingReport]);

  const handleLogin = (roleId: string) => {
    setCurrentUserRole(roleId);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gmscs_auth', 'true');
      localStorage.setItem('gmscs_role', roleId);
    }

    const aud = auditors.find(a => a.id === roleId);
    const staffNames = ['남경호', '정현일', '남효린', '이혜원', '이예원', '김홍덕'];
    const staffEmails = ['nam2304@empas.com', 'himix1993@gmail.com', 'kgms2304@gmail.com', 'yewon6798@gmail.com', 'fumac@naver.com'];
    const isLoginStaff = 
      roleId === 'admin' || 
      aud?.isSystemAdmin || 
      aud?.affiliation === '상근' || 
      staffNames.some(name => aud?.name?.includes(name)) ||
      (aud?.email && staffEmails.includes(aud.email.toLowerCase().trim()));

    if (isLoginStaff) {
      // 상근 직원 및 사무국 권한자는 사무국 대시보드(월간 심사일정 달력)로 진입
      navigateTo('calendar', 'audit', { isEditingReport: false, replace: true });
    } else {
      // 일반 비상근 심사원은 개인포털로 진입
      navigateTo('portal', 'auditor-mgmt', { isEditingReport: false, replace: true });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gmscs_auth');
      localStorage.removeItem('gmscs_role');
      window.location.hash = '';
    }
  };

  // 일반 심사원일 경우 데이터 격리 필터링 (본인 담당 기업 및 본인 배정 보고서/정산만)
  const visibleProjects = isRegularAuditor 
    ? projects.filter(p => p.leadAuditorId === currentAuditorObj.id || p.leadAuditorName?.includes(currentAuditorObj.name) || p.teamAuditorNames?.some(t => t.includes(currentAuditorObj.name)))
    : projects;

  const visibleReports = isRegularAuditor
    ? Object.fromEntries(
        Object.entries(reports).filter(([_, rep]) => 
          rep.leadAuditor?.includes(currentAuditorObj.name) || 
          rep.auditTeam?.some(t => t.includes(currentAuditorObj.name)) ||
          rep.provisionalAuditors?.some(p => p.includes(currentAuditorObj.name)) ||
          visibleProjects.some(p => p.id === rep.projectId)
        )
      )
    : reports;

  const visibleSettlements = isRegularAuditor
    ? settlements.filter(s => s.auditorId === currentAuditorObj.id || s.auditorName.includes(currentAuditorObj.name))
    : settlements;

  const visibleCompanies = isRegularAuditor
    ? companies.filter(c => 
        c.managingAuditorId === currentAuditorObj.id || 
        (c as any).assignedAuditorName?.includes(currentAuditorObj.name) || 
        (c as any).assignedAuditor?.includes(currentAuditorObj.name) || 
        (c as any).consultant?.includes(currentAuditorObj.name) ||
        visibleProjects.some(p => p.companyId === c.id || p.companyName === c.companyName)
      )
    : companies;

  // 일반 비상근 심사원은 본인 및 상근 사무국 직원 외에 다른 비상근 심사원의 신상/자격 정보를 볼 수 없음
  const visibleAuditors = isRegularAuditor
    ? auditors.filter(a => a.id === currentAuditorObj.id || a.affiliation === '상근')
    : auditors;

  // 일반 심사원의 비인가 탭 접근 방지 및 자동 리디렉션
  React.useEffect(() => {
    if (isRegularAuditor) {
      const allowedTabs: ActiveTab[] = ['calendar', 'portal', 'reports', 'finance'];
      if (currentAuditorObj?.isCommitteeMember) {
        allowedTabs.push('committee');
      }
      if (!allowedTabs.includes(activeTab)) {
        navigateTo('calendar', 'audit', { replace: true });
      }
      // 일반 심사원은 재무관리에서 세금계산서/수납(billing) 탭 접근 금지
      if (financeSubTab === 'billing') {
        navigateTo('finance', 'general-admin', { financeSubTab: 'settlements', replace: true });
      }
    }
  }, [currentUserRole, isRegularAuditor, activeTab, financeSubTab, currentAuditorObj, navigateTo]);

  // 브라우저 뒤로 가기 / 앞으로 가기 (popstate) 이벤트 핸들러 등록
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (event: PopStateEvent) => {
      let state = event.state;
      if (!state && window.location.hash) {
        state = parseHashState(window.location.hash);
      }

      if (state) {
        setActiveCategory(state.category || getCategoryForTab(state.tab));
        setActiveTab(state.tab);
        setIsEditingReport(state.isEditingReport ?? false);
        if (state.activeReportId) setActiveReportId(state.activeReportId);
        if (state.financeSubTab) setFinanceSubTab(state.financeSubTab);
      } else {
        // 기본 시작 상태로 복귀
        if (isRegularAuditor) {
          setActiveCategory('auditor-mgmt');
          setActiveTab('portal');
          setIsEditingReport(false);
        } else {
          setActiveCategory('audit');
          setActiveTab('calendar');
          setIsEditingReport(false);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // 초기 마운트 시 현재 상태를 history.replaceState에 등록
    const initialPayload = {
      category: activeCategory,
      tab: activeTab,
      isEditingReport,
      activeReportId,
      financeSubTab,
    };
    const initialHash = buildHash(activeTab, isEditingReport, activeReportId, financeSubTab);
    window.history.replaceState(initialPayload, '', initialHash);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isRegularAuditor]);

  // URL 파라미터 감지 (이메일 보안 링크 클릭 시 직행)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const tab = params.get('tab');
      const repId = params.get('reportId');

      if (mode === 'audit-entry' || tab === 'report' || tab === 'reports') {
        setIsAuthenticated(true);
        setIsEmailDirectEntry(true);
        navigateTo('reports', 'audit', {
          isEditingReport: true,
          reportId: repId || 'rep-1',
          replace: true
        });
      }
    }
  }, [navigateTo]);

  // 긴급 알림 카운트 (D-30 이내)
  const urgentCount = mockContracts.filter(c => {
    const diff = Math.ceil((new Date(c.surveillanceDueDate).getTime() - new Date(2026, 8, 9).getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 30;
  }).length;

  // 비용 승인 대기 카운트 (계약 건 + 프로젝트 건)
  const pendingAdjustmentCount = auditContracts.filter(c => c.approvalStatus === '승인대기').length;

  // 사무국 심사보고서 적정성 검토 대기 건수
  const pendingSecretariatReviewCount = Object.values(reports).filter(
    r => r.secretariatReviewStatus === '검토대기'
  ).length;

  // 위원회 심의 대기 안건 카운트
  const pendingCommitteeCount = committeeMeetings
    .flatMap(m => m.agendas)
    .filter(a => !a.decision).length;

  // 심사 계약 저장 및 신규 프로젝트 연동
  const handleSaveContract = (newContract: AuditContractRecord) => {
    setAuditContracts(prev => [newContract, ...prev]);

    // 심사 프로젝트 자동 등록
    const newProject: AuditProject = {
      id: `proj-${Date.now()}`,
      contractId: newContract.id,
      companyId: newContract.companyId,
      companyName: newContract.companyName,
      issuerName: 'GMSCS',
      auditType: newContract.contractType === '신규인증' ? '최초 2단계' :
                 newContract.contractType === '정기사후' ? '사후관리 1차' :
                 newContract.contractType === '갱신심사' ? '갱신심사' : '사후관리 1차',
      standards: newContract.standards,
      leadAuditorId: newContract.leadAuditorId,
      leadAuditorName: newContract.leadAuditorName,
      startDate: newContract.plannedAuditStartDate || '2026-10-15',
      endDate: newContract.plannedAuditStartDate || '2026-10-16',
      status: '계획수립',
      kabStandardMd: newContract.kabStandardMd,
      appliedMd: newContract.appliedMd,
      standardFee: newContract.standardFee,
      finalFee: newContract.finalFee,
      feeAdjustmentStatus: newContract.approvalStatus,
      feeAdjustmentRequestedFee: newContract.isAdjusted ? newContract.finalFee : undefined,
      adjustmentReason: newContract.adjustmentReason,
      billedAmount: newContract.finalFee,
      paidAmount: 0,
      paymentStatus: '미입금',
      taxInvoiceStatus: '미발행'
    };

    setProjects(prev => [newProject, ...prev]);
  };

  // 심사 계약 수동조정 사무국 승인
  const handleApproveContract = (contractId: string, approvedBy: string) => {
    const nowStr = new Date().toISOString().substring(0, 10);
    setAuditContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          approvalStatus: '승인완료',
          contractStatus: '계약체결',
          approvedBy,
          approvedAt: nowStr
        };
      }
      return c;
    }));

    setProjects(prev => prev.map(p => {
      if (p.contractId === contractId) {
        return {
          ...p,
          feeAdjustmentStatus: '승인완료',
          feeAdjustmentApprovedBy: approvedBy,
          feeAdjustmentApprovedAt: nowStr
        };
      }
      return p;
    }));

    alert('[사무국 승인 완료]\n심사 계약 및 조정 심사비가 공식 승인되어 프로젝트 및 수납 대장에 확정 반영되었습니다.');
  };

  // 심사 계약 반려
  const handleRejectContract = (contractId: string, reason: string) => {
    setAuditContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          approvalStatus: '반려',
          adjustmentReason: `${c.adjustmentReason || ''} [반려사유: ${reason}]`
        };
      }
      return c;
    }));

    setProjects(prev => prev.map(p => {
      if (p.contractId === contractId) {
        return {
          ...p,
          feeAdjustmentStatus: '반려'
        };
      }
      return p;
    }));

    alert(`[계약 반려 처리]\n사유: ${reason}\n해당 계약 조정 건이 반려 처리되었습니다.`);
  };

  // 3자(기업/심사원/협력기관) 심사계획서 및 심사비청구서 공문 발송 처리
  const handleDispatchPlanAndInvoice = (contractId: string, target: '기업' | '심사원' | '협력기관' | 'all') => {
    const nowStr = '2026-09-11';
    setAuditContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          planInvoiceDispatchStatus: '발송완료',
          planInvoiceDispatchDate: nowStr,
          contractStatus: c.contractStatus === '계약대기' ? '진행중' : c.contractStatus
        };
      }
      return c;
    }));

    // 심사진행현황 프로젝트 상태도 '계획서발송'으로 연동 승격
    setProjects(prev => prev.map(p => {
      if (p.contractId === contractId || p.id === contractId) {
        return {
          ...p,
          status: '계획서발송',
          planSentDate: nowStr
        };
      }
      return p;
    }));
  };

  // 3자 회신 시뮬레이션 및 심사일정/진행 확정 자동 승격
  const handleSimulateResponse = (contractId: string, role: 'auditor' | 'agency' | 'client', action: 'agree' | 'request_adjust') => {
    const statusVal = action === 'agree' ? '동의' : '일정조정요청';

    setAuditContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        const updated = { ...c };
        if (role === 'auditor') updated.auditorResponseStatus = statusVal;
        if (role === 'agency') updated.agencyResponseStatus = statusVal;
        if (role === 'client') updated.clientResponseStatus = statusVal;

        // 심사원과 협력기관(존재시) 모두 동의 완료되면 계약체결 확정
        const auditorOk = updated.auditorResponseStatus === '동의';
        const agencyOk = !updated.agency || updated.agency === '직영' || updated.agencyResponseStatus === '동의';
        if (auditorOk && agencyOk) {
          updated.contractStatus = '계약체결';
        }
        return updated;
      }
      return c;
    }));

    // 프로젝트 상태 연동: 심사원 동의 시 '심사진행중' (일정확정)으로 변경
    setProjects(prev => prev.map(p => {
      if (p.contractId === contractId || p.id === contractId) {
        return {
          ...p,
          status: action === 'agree' ? '심사진행중' : '계획수립'
        };
      }
      return p;
    }));
  };

  // 심사보고서 목록에서 특정 보고서 상세 열기 (사용자 요구사항: 목록을 보고 클릭하여 세부 사항 열람)
  const handleOpenReportDetail = (reportId: string) => {
    navigateTo('reports', 'audit', {
      isEditingReport: true,
      reportId: reportId
    });
  };

  // 캘린더나 타 화면에서 보고서 열기
  const handleOpenReport = (reportId: string) => {
    handleOpenReportDetail(reportId);
  };

  // 심사보고서 워크벤치 열기 (브라우저 새 탭으로 전용 작업대 오픈)
  const handleOpenReportWorkbench = (companyOrId: Company | string) => {
    const targetId = typeof companyOrId === 'string' ? companyOrId : companyOrId.id;
    if (typeof window !== 'undefined') {
      window.open(`#workbench/${encodeURIComponent(targetId)}`, '_blank');
    }
  };

  // 심사보고서 목록으로 돌아가기
  const handleBackToReportList = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('reports', 'audit', { isEditingReport: false });
    }
  };

  // 심사계획서 발송
  const handleSendPlan = (projectId: string) => {
    const nowStr = '2026-09-09';
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          status: p.status === '계획수립' ? '계획서발송' : p.status,
          planSentDate: nowStr
        };
      }
      return p;
    }));
  };

  // 보고서 저장
  const handleSaveReport = (updated: AuditReport) => {
    setReports(prev => ({
      ...prev,
      [updated.id]: updated
    }));

    // 만약 모든 서명이 완료되었다면 프로젝트 상태를 '서명완료'로 변경 (사무국 검토 승인 전에는 위원회 심의상정되지 않음)
    const allSigned = updated.signatures.every(s => s.isSigned);
    if (allSigned) {
      setProjects(prev => prev.map(p => {
        if (p.reportId === updated.id) {
          const preservedStatus = ['사무국검토대기', '보완요청', '심의대기', '인증발행'].includes(p.status) 
            ? p.status 
            : '서명완료';
          return { 
            ...p, 
            status: preservedStatus
          };
        }
        return p;
      }));
    }
  };

  // 심사팀장: 심사보고서 작성 및 서명 완료 후 사무국에 적정성 검토 제출
  const handleSubmitToSecretariat = (reportId: string) => {
    const nowStr = new Date().toLocaleString();
    setReports(prev => {
      const rep = prev[reportId];
      if (!rep) return prev;
      return {
        ...prev,
        [reportId]: {
          ...rep,
          secretariatReviewStatus: '검토대기',
          submittedToSecretariatAt: nowStr
        }
      };
    });

    setProjects(prev => prev.map(p => {
      if (p.reportId === reportId) {
        return {
          ...p,
          status: '사무국검토대기'
        };
      }
      return p;
    }));

    alert('[사무국 제출 완료]\n심사보고서가 사무국으로 공식 제출되었습니다.\n사무국의 내용 적정성 사전 검토 후 승인 시 인증심의위원회로 공식 상정됩니다.');
  };

  // 사무국: 심사보고서 내용 적정성 사전 검토 (승인 또는 보완요청)
  const handleSecretariatReview = (
    reportId: string,
    status: '검토승인' | '보완요청',
    comment: string,
    reviewer: string
  ) => {
    const nowStr = new Date().toLocaleString();
    setReports(prev => {
      const rep = prev[reportId];
      if (!rep) return prev;
      return {
        ...prev,
        [reportId]: {
          ...rep,
          secretariatReviewStatus: status,
          secretariatReviewedAt: nowStr,
          secretariatReviewer: reviewer,
          secretariatComment: comment
        }
      };
    });

    const targetReport = reports[reportId];

    if (status === '검토승인') {
      // 1. 프로젝트 상태를 '심의대기'로 전환
      setProjects(prev => prev.map(p => {
        if (p.reportId === reportId) {
          return {
            ...p,
            status: '심의대기',
            committeeStatus: '심의대기'
          };
        }
        return p;
      }));

      // 2. 독립 의결 기구인 인증심의위원회(CommitteeManager)에 신규 안건으로 자동 등록
      const targetProject = projects.find(p => p.reportId === reportId);
      if (targetProject) {
        setCommitteeMeetings(prev => {
          const updated = [...prev];
          const firstMeeting = updated[0];
          if (firstMeeting) {
            const alreadyExists = firstMeeting.agendas.some(a => a.projectId === targetProject.id);
            if (!alreadyExists) {
              firstMeeting.agendas.push({
                id: `agenda-${Date.now()}`,
                projectId: targetProject.id,
                companyId: targetProject.companyId,
                companyName: targetProject.companyName,
                standards: targetProject.standards,
                auditType: targetProject.auditType,
                leadAuditorName: targetProject.leadAuditorName,
                auditDates: `${targetProject.startDate} ~ ${targetProject.endDate}`,
                majorCount: targetReport?.nonConformityCount.major || 0,
                minorCount: targetReport?.nonConformityCount.minor || 0,
                observationCount: targetReport?.nonConformityCount.observation || 0,
                leadRecommendation: (targetReport?.nonConformityCount.major || 0) > 0 ? '시정조치 후 추천' : '인증등록 추천'
              });
            }
          }
          return updated;
        });
      }

      alert(`[사무국 검토 승인 완료]\n심사보고서 내용 적정성 검토가 승인되었습니다.\n독립 의결 기구인 [인증심의위원회] 안건으로 공식 상정되어 심의 대기로 전환되었습니다.`);
    } else {
      // 보완 요청 (반려)
      setProjects(prev => prev.map(p => {
        if (p.reportId === reportId) {
          return {
            ...p,
            status: '보완요청'
          };
        }
        return p;
      }));

      alert(`[심사팀 보완요청 (반려)]\n사유: ${comment}\n심사팀장에게 보완요청 통보가 전송되었습니다.`);
    }
  };

  // 수납/계산서 상태 변경
  const handleUpdatePayment = (projectId: string, paymentStatus: PaymentStatus, taxStatus: TaxInvoiceStatus) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, paymentStatus, taxInvoiceStatus: taxStatus };
      }
      return p;
    }));
  };

  // 심사원 심의위원 자격 토글
  const handleToggleCommitteeMember = (auditorId: string) => {
    setAuditors(prev => prev.map(a => {
      if (a.id === auditorId) {
        const nextState = !a.isCommitteeMember;
        return {
          ...a,
          isCommitteeMember: nextState,
          committeeRole: nextState ? (a.committeeRole || '심의위원') : undefined,
          committeeAppointmentDate: nextState ? (a.committeeAppointmentDate || '2026-09-09') : undefined,
        };
      }
      return a;
    }));
  };

  // 심사원 소속 등급(사무국직원 / 소속심사원 / 비상근심사원) 변경
  const handleUpdateAuditorAffiliation = (auditorId: string, affiliation: AuditorAffiliation) => {
    setAuditors(prev => prev.map(a => a.id === auditorId ? { ...a, affiliation } : a));
  };

  // 고객사 담당 심사원 교체 배정
  const handleReassignCompanyAuditor = (
    companyId: string, 
    newAuditorId: string, 
    reasonCategory: AuditorReassignmentLog['reasonCategory'], 
    reasonDetail: string
  ) => {
    const oldComp = companies.find(c => c.id === companyId);
    if (!oldComp) return;
    const oldAuditorId = oldComp.managingAuditorId || 'admin';
    const oldAuditorName = auditors.find(a => a.id === oldAuditorId)?.name || '기존심사원';
    const newAuditorName = auditors.find(a => a.id === newAuditorId)?.name || '신규심사원';

    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return { ...c, managingAuditorId: newAuditorId };
      }
      return c;
    }));

    // 해당 기업의 진행중 심사 프로젝트 심사원도 변경
    const reassignmentLog: AuditorReassignmentLog = {
      id: `reassign-${Date.now()}`,
      date: '2026-09-09',
      prevAuditorId: oldAuditorId,
      prevAuditorName: oldAuditorName,
      newAuditorId,
      newAuditorName,
      reasonCategory,
      reasonDetail,
      processedBy: currentUserRole === 'admin' ? '사무국 관리자' : '시스템 승인'
    };

    setProjects(prev => prev.map(p => {
      if (p.companyId === companyId) {
        return {
          ...p,
          leadAuditorId: newAuditorId,
          leadAuditorName: newAuditorName,
          reassignmentHistory: [...(p.reassignmentHistory || []), reassignmentLog]
        };
      }
      return p;
    }));
  };

  // 심사원 포털에서 이해상충 등 사유로 심사원 변경 요청
  const handleRequestReassignment = (projectId: string, log: AuditorReassignmentLog) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          leadAuditorId: log.newAuditorId,
          leadAuditorName: log.newAuditorName,
          reassignmentHistory: [...(p.reassignmentHistory || []), log]
        };
      }
      return p;
    }));

    const prj = projects.find(p => p.id === projectId);
    if (prj) {
      setCompanies(prev => prev.map(c => {
        if (c.id === prj.companyId) {
          return { ...c, managingAuditorId: log.newAuditorId };
        }
        return c;
      }));
    }

    alert(`[이해상충 심사원 변경 완료]\n사유: ${log.reasonDetail}\n배정 심사원이 성공적으로 교체되었습니다.`);
  };

  // 인증심의위원회 의결 승인/판정
  const handleApproveCommitteeAgenda = (
    meetingId: string, 
    agendaId: string, 
    decision: CommitteeDecision, 
    note: string
  ) => {
    setCommitteeMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          agendas: m.agendas.map(a => {
            if (a.id === agendaId) {
              return {
                ...a,
                decision,
                reviewNote: note,
                decidedAt: new Date().toISOString().substring(0, 10),
              };
            }
            return a;
          })
        };
      }
      return m;
    }));

    // 의결 결과에 따라 프로젝트 상태를 '인증발행'으로 갱신
    const currentMeeting = committeeMeetings.find(m => m.id === meetingId);
    const currentAgenda = currentMeeting?.agendas.find(a => a.id === agendaId);
    if (currentAgenda) {
      setProjects(prev => prev.map(p => {
        if (p.id === currentAgenda.projectId) {
          return {
            ...p,
            committeeStatus: decision === '인증등록승인' ? '등록승인' : decision === '조건부승인' ? '조건부승인' : '보류',
            committeeDecisionDate: new Date().toISOString().substring(0, 10),
            committeeDecisionNote: note,
            status: (decision === '인증등록승인' || decision === '조건부승인') ? '인증발행' : p.status
          };
        }
        return p;
      }));
    }
  };

  // 정산 상태 토글
  const handleUpdateSettlementStatus = (settlementId: string, status: '정산대기' | '지급완료') => {
    setSettlements(prev => prev.map(s => {
      if (s.id === settlementId) {
        return {
          ...s,
          payoutStatus: status,
          paidDate: status === '지급완료' ? new Date().toISOString().substring(0, 10) : undefined
        };
      }
      return s;
    }));
  };

  // 메일 모달 열기 핸들러
  const handleOpenEmailModalWithPreset = (
    recipientName = '', 
    recipientEmail = '', 
    templateType: EmailDispatchData['templateType'] = '심사계획서'
  ) => {
    setEmailModalData({
      recipientName,
      recipientEmail,
      templateType,
    });
    setIsEmailModalOpen(true);
  };

  // 브라우저 새 탭에서 #workbench/xxx 로 직접 열린 경우 (100% 전체화면 전용 작업대 모드)
  const isStandaloneWorkbench = typeof window !== 'undefined' && window.location.hash.startsWith('#workbench');
  if (isStandaloneWorkbench) {
    const rawTarget = window.location.hash.replace(/^#workbench\/?/, '').split('?')[0];
    const targetComp = (rawTarget ? companies.find(c => c.id === rawTarget || c.companyName === decodeURIComponent(rawTarget)) : null) || companies[0];
    
    if (targetComp) {
      return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col overflow-hidden">
          <AuditReportWorkbench
            company={targetComp}
            contract={auditContracts.find(c => c.companyId === targetComp.id || c.companyName === targetComp.companyName)}
            project={projects.find(p => p.companyId === targetComp.id || p.companyName === targetComp.companyName)}
            report={Object.values(reports).find(r => r.companyName === targetComp.companyName)}
            auditor={currentAuditorObj}
            auditors={auditors}
            onClose={() => {
              if (window.opener) {
                window.close();
              } else {
                window.location.hash = '#reports';
              }
            }}
            onSave={(_data) => {
              alert(`[${targetComp.companyName}] 심사보고서 및 증빙 서류가 임시저장/보관되었습니다.`);
            }}
            onUpdateCompany={handleUpdateCompany}
          />
        </div>
      );
    }
  }

  // 브라우저 새 탭에서 #pdf-report/xxx 또는 #pdf-cert/xxx 로 열린 경우 (100% 독립창 PDF 뷰어)
  const isStandalonePdf = typeof window !== 'undefined' && (window.location.hash.startsWith('#pdf-report') || window.location.hash.startsWith('#pdf-cert'));
  if (isStandalonePdf) {
    const isCert = window.location.hash.startsWith('#pdf-cert');
    const hashWithoutPrefix = window.location.hash.replace(/^#(pdf-report|pdf-cert)\/?/, '');
    const [rawPath, rawQuery] = hashWithoutPrefix.split('?');
    const compNameDecoded = decodeURIComponent(rawPath || '');
    
    // URLSearchParams 파싱
    const params = new URLSearchParams(rawQuery || '');
    const stdParam = params.get('standard') || 'ISO 9001:2015';
    const auditTypeParam = params.get('auditType') || (isCert ? '인증서 발급본' : '정기 사후관리 심사');
    const auditDateParam = params.get('auditDate') || '2025-10-15';
    const titleParam = params.get('title') || (isCert ? `[인증서] ${compNameDecoded} 공식 인증서 (${stdParam})` : `[공식 심사보고서] ${compNameDecoded} - ${stdParam}`);

    const targetComp = (compNameDecoded ? companies.find(c => c.companyName === compNameDecoded || c.id === compNameDecoded) : null) || {
      id: 'temp',
      companyName: compNameDecoded || '고객사',
      ceoName: '',
      bizNumber: '',
      address: '',
      iafCode: '17',
      industry: '제조업',
      totalEmployees: 25,
      scope: '품질경영시스템 인증 범위',
      status: '인증유지'
    } as unknown as Company;

    const auditorNameParam = params.get('auditorName') || targetComp.assignedAuditorName || (targetComp as any).assignedAuditor || '남경호';

    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col overflow-hidden">
        <PdfViewerModal
          isOpen={true}
          onClose={() => {
            if (window.opener) {
              window.close();
            } else {
              window.location.hash = '';
            }
          }}
          title={titleParam}
          companyName={targetComp.companyName}
          standard={stdParam}
          auditType={auditTypeParam}
          auditDate={auditDateParam}
          auditorName={auditorNameParam}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage auditors={auditors} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Global Hierarchical Navigation Bar - 심사원 포털에서는 숨기고 전용 헤더 표시 */}
      {activeTab === 'portal' ? (
        /* 심사원 개인 포털 전용 헤더: 사무국 메뉴 완전 제거, 간결한 전용 타이틀만 표시 */
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
          <div className="w-[96%] sm:w-[92%] lg:w-[90%] mx-auto max-w-[1850px] px-2 sm:px-4">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center space-x-3">
                <img src="/gmscs_logo.png" alt="GMSCS 로고" className="h-9 w-9 object-contain" />
                <div className="h-6 w-px bg-slate-300 hidden sm:block" />
                <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                  GMSCS 인증원 심사원 개인별 심사관리
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-[13px] font-bold text-slate-700">
                  {currentAuditorObj.name} {currentAuditorObj.grade || '심사원'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-[12px] text-cyan-700 hover:text-cyan-900 font-semibold transition cursor-pointer"
                >
                  내 정보
                </button>
                {isStaff && (
                  <button
                    type="button"
                    onClick={() => navigateTo('calendar', 'audit')}
                    className="text-[12px] text-slate-500 hover:text-slate-800 font-semibold transition cursor-pointer"
                  >
                    사무국 화면
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[12px] text-rose-500 hover:text-rose-700 font-semibold transition cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </header>
      ) : (
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            navigateTo(tab, activeCategory, {
              isEditingReport: tab === 'reports' ? false : isEditingReport
            });
          }}
          activeCategory={activeCategory}
          setActiveCategory={(cat) => {
            setActiveCategory(cat);
          }}
          urgentAlertCount={urgentCount}
          currentUserRole={currentUserRole}
          onSelectUserRole={(role) => {
            setCurrentUserRole(role);
            if (typeof window !== 'undefined') {
              localStorage.setItem('gmscs_role', role);
            }
            const aud = auditors.find(a => a.id === role);
            const isLoginStaff = aud?.isSystemAdmin || aud?.affiliation === '상근' || role === 'admin';
            if (!isLoginStaff) {
              navigateTo('portal', 'auditor-mgmt', { isEditingReport: false, replace: true });
            } else {
              navigateTo('calendar', 'audit', { isEditingReport: false, replace: true });
            }
          }}
          allAuditors={auditors}
          pendingAdjustmentCount={pendingAdjustmentCount}
          pendingCommitteeCount={pendingCommitteeCount}
          pendingSecretariatReviewCount={pendingSecretariatReviewCount}
          onOpenEmailModal={() => handleOpenEmailModalWithPreset()}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Container - Aligned with Navbar Width */}
      <main className="flex-1 w-[96%] sm:w-[92%] lg:w-[90%] mx-auto max-w-[1850px] px-2 sm:px-4 py-4">
        
        {/* ========================================================= */}
        {/* 1. 홈 / 월간 심사 일정 (로그인 랜딩 페이지) */}
        {/* ========================================================= */}
        {activeTab === 'calendar' && (
          <DashboardCalendar
            projects={projects}
            auditors={auditors}
            companies={companies}
            committeeSchedules={committeeSchedules}
            onOpenReport={handleOpenReport}
            onOpenPdfReport={(info) => {
              setPdfModalState({
                isOpen: true,
                title: info.title,
                companyName: info.companyName,
                standard: info.standard,
                auditType: info.auditType,
                auditDate: info.auditDate,
                pdfUrl: info.pdfUrl
              });
            }}
            onSendPlan={handleSendPlan}
            onNavigateTab={(category, tab, subTab) => {
              navigateTo(tab, category, {
                isEditingReport: false,
                financeSubTab: subTab
              });
            }}
          />
        )}

        {/* ========================================================= */}
        {/* 2. 고객관리 (572개 고객사 대장 & 계획서 수립/발송) */}
        {/* ========================================================= */}
        {activeTab === 'clients' && (
          <ClientManagement
            companies={companies}
            auditors={auditors}
            contracts={contracts}
            auditContracts={auditContracts}
            projects={projects}
            onOpenReport={handleOpenReport}
            onOpenEmailModal={(companyName, contactEmail, templateType) => {
              handleOpenEmailModalWithPreset(companyName || '', contactEmail || '', (templateType as any) || '심사계획서');
            }}
            onAddCompany={handleAddCompany}
          />
        )}

        {/* ========================================================= */}
        {/* 3. 심사원 관리 (36명 심사원 대장 & IAF 전문코드) */}
        {/* ========================================================= */}
        {activeTab === 'auditors' && (
          <AuditorManagement
            auditors={auditors}
            projects={projects}
            contracts={contracts}
            companies={companies}
            onToggleCommitteeMember={handleToggleCommitteeMember}
            onUpdateAuditorAffiliation={handleUpdateAuditorAffiliation}
            onSaveAuditor={handleUpdateAuditorProfile}
            onOpenPdfReport={(info) => {
              setPdfModalState({
                isOpen: true,
                title: info.title,
                pdfUrl: info.pdfUrl,
                companyName: info.companyName,
                standard: info.standard,
                auditType: info.auditType,
                auditDate: info.auditDate
              });
            }}
          />
        )}

        {/* ========================================================= */}
        {/* 4. 인증관리 (유일한 좌측 사이드바 서브메뉴 관리 체계) */}
        {/* ========================================================= */}
        {activeTab === 'certification' && (
          <CertificationManagement
            auditors={auditors}
            companies={companies}
            projects={projects}
            settlements={settlements}
            committeeSchedules={committeeSchedules}
            onUpdateCommitteeSchedules={setCommitteeSchedules}
            onOpenEmailModal={() => handleOpenEmailModalWithPreset()}
            onUpdateSettlementStatus={handleUpdateSettlementStatus}
          />
        )}

        {/* ========================================================= */}
        {/* 보조/호환 탭: 인증심의위원회 */}
        {/* ========================================================= */}
        {activeTab === 'committee' && (
          <CommitteeManager
            meetings={committeeMeetings}
            auditors={auditors}
            projects={projects}
            currentUserAuditor={currentAuditorObj}
            onApproveAgenda={handleApproveCommitteeAgenda}
            onOpenReport={handleOpenReport}
          />
        )}

        {/* 보조/호환 탭: 고객사 인증현황 (레거시) */}
        {activeTab === 'companies' && (
          <CompanyAuditorManager
            companies={companies}
            auditors={auditors}
            initialSubTab="companies"
            onToggleCommitteeMember={handleToggleCommitteeMember}
            onReassignCompanyAuditor={handleReassignCompanyAuditor}
            onUpdateAuditorAffiliation={handleUpdateAuditorAffiliation}
          />
        )}

        {/* 보조/호환 탭: 사후 / 만료 관리 (D-day 알림) */}
        {activeTab === 'surveillance' && (
          <SurveillanceManager
            contracts={mockContracts}
            auditors={auditors}
            companies={companies}
          />
        )}

        {/* 보조/호환 탭: KAB 인정기관 관리 */}
        {activeTab === 'kab' && (
          <KabCalculator 
            isAdmin={currentUserRole === 'admin'} 
            onNavigateToContracts={() => {
              navigateTo('contracts', 'audit');
            }}
          />
        )}

        {/* ========================================================= */}
        {/* 보조/호환 탭: 심사 계약 관리 */}
        {/* ========================================================= */}
        {activeTab === 'contracts' && (
          <AuditContractManager
            companies={companies}
            auditors={auditors}
            contracts={auditContracts}
            projects={projects}
            isAdmin={currentUserRole === 'admin'}
            onSaveContract={handleSaveContract}
            onApproveContract={handleApproveContract}
            onRejectContract={handleRejectContract}
            onDispatchPlanAndInvoice={handleDispatchPlanAndInvoice}
            onSimulateResponse={handleSimulateResponse}
            onOpenCompanyAuditHistory={(comp: any) => setHistoryModalCompany(comp)}
            onAddCompany={handleAddCompany}
          />
        )}

        {/* 3-2. 심사 보고서 작성/편집 (특정 보고서 편집 모드일 때 렌더링, 목록은 심사진행현황으로 일원화) */}
        {activeTab === 'reports' && isEditingReport && (
          <div className="space-y-4">
            {isEmailDirectEntry && (
              <div className="bg-cyan-50 border border-cyan-200 text-cyan-900 px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    ✉️
                  </div>
                  <div>
                    <div className="text-sm font-bold text-cyan-950">
                      [보안 직행 링크 인증 접속] <span className="font-mono text-cyan-800 font-normal">fumac@naver.com</span> 전용 세션
                    </div>
                    <div className="text-xs text-cyan-700">
                      심사보고서 작성 및 실시간 저장 모드로 직접 접속되었습니다. 수정하신 모든 항목은 브라우저와 시스템 DB에 즉시 보관됩니다.
                    </div>
                  </div>
                </div>
                <div className="text-xs font-semibold px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full border border-cyan-200">
                  직행 링크 유효성 검증 완료 ✓
                </div>
              </div>
            )}
            <AuditReportEditor
              report={reports[activeReportId] || reports['rep-1']}
              onSaveReport={handleSaveReport}
              onClose={() => navigateTo('projects', 'audit')}
              onBackToList={() => navigateTo('projects', 'audit')}
              currentUserRole={currentUserRole}
              onSubmitToSecretariat={handleSubmitToSecretariat}
              onSecretariatReview={handleSecretariatReview}
            />
          </div>
        )}

        {/* 3-2. 심사 진행현황 & 프로세스 대장 (9단계 엑셀 매트릭스) */}
        {activeTab === 'projects' && (
          <AuditProcessStatusManager
            projects={projects}
            auditors={auditors}
            companies={companies}
            contracts={contracts}
            reports={reports}
            settlements={settlements}
            committeeMeetings={committeeMeetings}
            committeeSchedules={committeeSchedules}
            onOpenReport={handleOpenReport}
            onSendPlan={(companyName, contactEmail, templateType) => {
              handleOpenEmailModalWithPreset(companyName || '', contactEmail || '', (templateType as any) || '심사계획서');
            }}
            onNavigateToSettlement={() => {
              navigateTo('finance', 'general-admin', { financeSubTab: 'settlements' });
            }}
            onOpenPdfReport={(info) => {
              setPdfModalState({
                isOpen: true,
                title: info.title,
                companyName: info.companyName,
                standard: info.standard,
                auditType: info.auditType,
                auditDate: info.auditDate,
                pdfUrl: info.pdfUrl
              });
            }}
          />
        )}

        {/* 3-3. OK ESG & ISO-Record 연계 모듈 */}
        {activeTab === 'integrations' && (
          <EsgRecordIntegrator />
        )}


        {/* 4-2. 심사원 전용 포털 (나의 심사 관리 기업 목록 - 다가올 심사 순) */}
        {activeTab === 'portal' && currentAuditorObj && (
          <AuditorPortal
            currentAuditor={currentAuditorObj}
            allAuditors={visibleAuditors}
            companies={visibleCompanies}
            projects={visibleProjects}
            contracts={contracts}
            settlements={visibleSettlements}
            notices={auditorNotices}
            onOpenReport={handleOpenReport}
            onOpenPdfReport={(info) => {
              setPdfModalState({
                isOpen: true,
                title: info.title,
                companyName: info.companyName,
                standard: info.standard,
                auditType: info.auditType,
                auditDate: info.auditDate,
                auditorName: (info as any).auditorName,
                pdfUrl: info.pdfUrl
              });
            }}
            onNavigateToReports={() => {
              navigateTo('reports', 'audit', { isEditingReport: false });
            }}
            onNavigateToSettlement={() => {
              navigateTo('finance', 'general-admin', { financeSubTab: 'settlements' });
            }}
            onRequestReassignment={handleRequestReassignment}
            onOpenEmailModal={handleOpenEmailModalWithPreset}
            onOpenReportWorkbench={handleOpenReportWorkbench}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}

        {/* ========================================================= */}
        {/* 5. 일반관리 */}
        {/* ========================================================= */}
        {/* 5-1. 재무관리 (심사원 정산원장 & 심사비 수납/계산서) */}
        {activeTab === 'finance' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => navigateTo('finance', 'general-admin', { financeSubTab: 'settlements' })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  financeSubTab === 'settlements'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                💼 {isNonPermanent ? '나의 심사비 정산원장 (3.3% 원천징수)' : '심사원 심사비 정산원장 (3.3% 원천징수)'}
              </button>
              {!isNonPermanent && (
                <button
                  onClick={() => navigateTo('finance', 'general-admin', { financeSubTab: 'billing' })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    financeSubTab === 'billing'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  🧾 고객사 심사비용 수납 &amp; 세금계산서 대사
                </button>
              )}
            </div>

            {financeSubTab === 'settlements' ? (
              <AuditorSettlementManager
                settlements={visibleSettlements}
                currentAuditor={currentAuditorObj}
                allAuditors={auditors}
                onUpdateSettlementStatus={handleUpdateSettlementStatus}
              />
            ) : (
              <BillingManager
                projects={projects}
                onUpdatePayment={handleUpdatePayment}
              />
            )}
          </div>
        )}

        {/* 5-1. 심사원 공지사항 관리 (사무국 4인 공지 등록 & 파일/저장링크 배포) */}
        {activeTab === 'notices' && (
          <AuditorNoticeManager
            notices={auditorNotices}
            onAddNotice={handleAddNotice}
            onUpdateNotice={handleUpdateNotice}
            onDeleteNotice={handleDeleteNotice}
            currentUserRole={currentUserRole}
            allAuditors={auditors}
          />
        )}

        {/* 5-2. 자료관리 (주서버 & 외장 USB 백업 및 설정) */}
        {activeTab === 'data' && (
          <BackupManager />
        )}

      </main>

      {/* Hybrid Email Dispatch Modal */}
      <EmailDispatchModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        initialData={emailModalData}
        onLogSent={(log) => setEmailLogs(prev => [log, ...prev])}
      />

      {/* 과거 심사보고서 및 공인인증서 PDF 뷰어 모달 */}
      <PdfViewerModal
        isOpen={pdfModalState.isOpen}
        onClose={() => setPdfModalState(prev => ({ ...prev, isOpen: false }))}
        title={pdfModalState.title}
        pdfUrl={pdfModalState.pdfUrl}
        companyName={pdfModalState.companyName}
        standard={pdfModalState.standard}
        auditType={pdfModalState.auditType}
        auditDate={pdfModalState.auditDate}
        auditorName={pdfModalState.auditorName}
      />

      {/* 심사원 마이페이지 / 개인정보 및 심사비 지급방식 설정 모달 */}
      {isProfileModalOpen && (
        <AuditorProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          auditor={currentAuditorObj}
          projects={projects}
          contracts={contracts}
          companies={companies}
          mode="portal"
          onSave={handleUpdateAuditorProfile}
          onNavigateToPortal={() => {
            setIsProfileModalOpen(false);
            navigateTo('portal', 'auditor-mgmt');
          }}
          onOpenPdfReport={(info) => {
            setPdfModalState({
              isOpen: true,
              title: info.title,
              pdfUrl: info.pdfUrl,
              companyName: info.companyName,
              standard: info.standard,
              auditType: info.auditType,
              auditDate: info.auditDate
            });
          }}
        />
      )}

      {/* 기업 심사 이력 및 진행 경과 통합 모달 */}
      <CompanyAuditHistoryModal
        isOpen={!!historyModalCompany}
        onClose={() => setHistoryModalCompany(null)}
        company={historyModalCompany}
        contracts={contracts}
        auditContracts={auditContracts}
        projects={projects}
        reports={reports}
        settlements={settlements}
        allAuditors={auditors}
        onOpenReport={handleOpenReport}
        onOpenReportWorkbench={handleOpenReportWorkbench}
        onOpenPdfReport={(info) => {
          setPdfModalState({
            isOpen: true,
            title: info.title,
            companyName: info.companyName,
            standard: info.standard,
            auditType: info.auditType,
            auditDate: info.auditDate,
            auditorName: (info as any).auditorName,
            pdfUrl: info.pdfUrl
          });
        }}
      />

      {/* 심사보고서 워크벤치 (2.5:7.5 분할 + 4대 탭 + 증빙서류 업로드 + EHS) */}
      {workbenchCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-[1780px] h-[96vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-700">
            <AuditReportWorkbench
              company={workbenchCompany}
              contract={auditContracts.find(c => c.companyId === workbenchCompany.id || c.companyName === workbenchCompany.companyName)}
              project={projects.find(p => p.companyId === workbenchCompany.id || p.companyName === workbenchCompany.companyName)}
              report={Object.values(reports).find(r => r.companyName === workbenchCompany.companyName)}
              auditor={currentAuditorObj}
              auditors={auditors}
              onClose={() => setWorkbenchCompany(null)}
              onSave={(_data) => {
                alert(`[${workbenchCompany.companyName}] 심사보고서 및 증빙 서류가 임시저장/보관되었습니다.`);
              }}
              onUpdateCompany={handleUpdateCompany}
            />
          </div>
        </div>
      )}

      {/* Footer (okesg.com 사업자 및 플랫폼 정보 인용, 이용약관/개인정보처리방침 제외) */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="w-[95%] sm:w-[88%] lg:w-[85%] mx-auto max-w-[1800px] px-2 sm:px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-800 text-sm tracking-tight">GMSCS</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-semibold text-slate-600">Global Management System Certification Service · ISO &amp; ESG Total Platform</span>
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed space-y-0.5">
              <p className="flex flex-wrap items-center">
                <span><strong className="font-semibold text-slate-700">대표:</strong> 남경호</span>
                <span className="text-slate-300 mx-2">|</span>
                <span><strong className="font-semibold text-slate-700">사업자등록번호:</strong> 107-88-30351</span>
                <span className="text-slate-300 mx-2">|</span>
                <span><strong className="font-semibold text-slate-700">통신판매업신고:</strong> 2026-서울강서-0296</span>
              </p>
              <p className="flex flex-wrap items-center">
                <span><strong className="font-semibold text-slate-700">주소:</strong> 서울특별시 강서구 강서로 406, 9F</span>
                <span className="text-slate-300 mx-2">|</span>
                <span><strong className="font-semibold text-slate-700">Email:</strong> <a href="mailto:esggnf@naver.com" className="text-cyan-700 hover:underline">esggnf@naver.com</a></span>
              </p>
            </div>
            <p className="text-[10.5px] text-slate-400 pt-0.5">
              Copyright © 2026 GMSCS. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              KAB 공인 인증기관 기준 준수
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              DB 2중 실시간 백업 가동 중
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              OK ESG &amp; ISO-Record 연동
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
