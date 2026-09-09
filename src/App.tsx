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

import { 
  mockAuditors, 
  mockCompanies, 
  mockContracts, 
  mockProjects, 
  mockReports,
  mockSettlements,
  mockCommitteeMeetings,
  mockEmailLogs,
  mockAuditContracts
} from './data/mockData';
import { 
  AuditReport, 
  AuditProject, 
  PaymentStatus, 
  TaxInvoiceStatus,
  Auditor,
  Company,
  AuditorSettlement,
  CommitteeMeeting,
  CommitteeDecision,
  AuditorReassignmentLog,
  EmailDispatchLog,
  AuditContractRecord,
  AuditorAffiliation
} from './types';

export function App() {
  // Session & Role Management
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gmscs_auth') === 'true';
    }
    return false;
  });

  const [currentUserRole, setCurrentUserRole] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gmscs_role') || 'admin';
    }
    return 'admin';
  });

  const handleLogin = (roleId: string) => {
    setCurrentUserRole(roleId);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gmscs_auth', 'true');
      localStorage.setItem('gmscs_role', roleId);
    }
    const aud = auditors.find(a => a.id === roleId);
    if (aud?.affiliation === '비상근심사원') {
      setActiveCategory('auditor-mgmt');
      setActiveTab('portal');
    } else {
      setActiveCategory('dashboard');
      setActiveTab('calendar');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gmscs_auth');
    }
  };
  
  // 2-Tier Navigation State
  const [activeCategory, setActiveCategory] = useState<MainCategory>('dashboard');
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');

  // 심사보고서 목록 관리 vs 세부 에디터 전환 상태
  const [isEditingReport, setIsEditingReport] = useState<boolean>(false);
  const [activeReportId, setActiveReportId] = useState<string>('rep-1');

  // 일반관리 - 재무관리 하위 서브탭 ('settlements' | 'billing')
  const [financeSubTab, setFinanceSubTab] = useState<'settlements' | 'billing'>('settlements');

  // Core Data States
  const [auditors, setAuditors] = useState<Auditor[]>(mockAuditors);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [projects, setProjects] = useState<AuditProject[]>(mockProjects);
  const [reports, setReports] = useState<Record<string, AuditReport>>(mockReports);
  const [settlements, setSettlements] = useState<AuditorSettlement[]>(mockSettlements);
  const [committeeMeetings, setCommitteeMeetings] = useState<CommitteeMeeting[]>(mockCommitteeMeetings);
  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>(mockEmailLogs);
  const [auditContracts, setAuditContracts] = useState<AuditContractRecord[]>(mockAuditContracts);

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [emailModalData, setEmailModalData] = useState<Partial<EmailDispatchData>>({
    templateType: '심사계획서'
  });

  const [isEmailDirectEntry, setIsEmailDirectEntry] = useState<boolean>(false);

  // 현재 로그인한 심사원 객체 및 권한 체계
  const currentAuditorObj: Auditor = auditors.find(a => a.id === currentUserRole) 
    || (currentUserRole === 'admin' ? auditors.find(a => a.isSystemAdmin) || auditors[0] : auditors[0]);

  const currentAffiliation: AuditorAffiliation = currentAuditorObj?.affiliation 
    || (currentUserRole === 'admin' ? '사무국직원' : '비상근심사원');

  // 비상근 심사원 격리 여부 (사무국직원과 소속상근심사원은 전체 접근)
  const isNonPermanent = currentAffiliation === '비상근심사원';

  // 비상근 심사원일 경우 데이터 격리 필터링
  const visibleProjects = isNonPermanent 
    ? projects.filter(p => p.leadAuditorId === currentAuditorObj.id || p.leadAuditorName?.includes(currentAuditorObj.name))
    : projects;

  const visibleReports = isNonPermanent
    ? Object.fromEntries(
        Object.entries(reports).filter(([_, rep]) => 
          rep.leadAuditor?.includes(currentAuditorObj.name) || 
          rep.auditTeam?.some(t => t.includes(currentAuditorObj.name)) ||
          rep.provisionalAuditors?.some(p => p.includes(currentAuditorObj.name)) ||
          visibleProjects.some(p => p.id === rep.projectId)
        )
      )
    : reports;

  const visibleSettlements = isNonPermanent
    ? settlements.filter(s => s.auditorId === currentAuditorObj.id || s.auditorName.includes(currentAuditorObj.name))
    : settlements;

  const visibleCompanies = isNonPermanent
    ? companies.filter(c => c.managingAuditorId === currentAuditorObj.id)
    : companies;

  // 비상근 심사원의 비인가 탭 접근 방지 및 자동 리디렉션
  React.useEffect(() => {
    if (isNonPermanent) {
      const allowedTabs: ActiveTab[] = ['portal', 'reports', 'finance'];
      if (currentAuditorObj?.isCommitteeMember) {
        allowedTabs.push('committee');
      }
      if (!allowedTabs.includes(activeTab)) {
        setActiveCategory('dashboard');
        setActiveTab('portal');
      }
      // 비상근 심사원은 재무관리에서 세금계산서/수납(billing) 탭 접근 금지
      if (financeSubTab === 'billing') {
        setFinanceSubTab('settlements');
      }
    }
  }, [currentUserRole, isNonPermanent, activeTab, financeSubTab, currentAuditorObj]);

  // URL 파라미터 감지 (이메일 보안 링크 클릭 시 직행)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const tab = params.get('tab');
      const repId = params.get('reportId');

      if (mode === 'audit-entry' || tab === 'report' || tab === 'reports') {
        setIsAuthenticated(true);
        setActiveCategory('audit');
        setActiveTab('reports');
        if (repId) setActiveReportId(repId);
        setIsEditingReport(true);
        setIsEmailDirectEntry(true);
      }
    }
  }, []);

  // 긴급 알림 카운트 (D-30 이내)
  const urgentCount = mockContracts.filter(c => {
    const diff = Math.ceil((new Date(c.surveillanceDueDate).getTime() - new Date(2026, 8, 9).getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 30;
  }).length;

  // 비용 승인 대기 카운트 (계약 건 + 프로젝트 건)
  const pendingAdjustmentCount = auditContracts.filter(c => c.approvalStatus === '승인대기').length;

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

  // 심사보고서 목록에서 특정 보고서 상세 열기 (사용자 요구사항: 목록을 보고 클릭하여 세부 사항 열람)
  const handleOpenReportDetail = (reportId: string) => {
    setActiveCategory('audit');
    setActiveTab('reports');
    setActiveReportId(reportId);
    setIsEditingReport(true);
  };

  // 캘린더나 타 화면에서 보고서 열기
  const handleOpenReport = (reportId: string) => {
    handleOpenReportDetail(reportId);
  };

  // 심사보고서 목록으로 돌아가기
  const handleBackToReportList = () => {
    setIsEditingReport(false);
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

    // 만약 모든 서명이 완료되었다면 프로젝트 상태를 '서명완료' 및 위원회 '심의상정'으로 변경
    const allSigned = updated.signatures.every(s => s.isSigned);
    if (allSigned) {
      setProjects(prev => prev.map(p => {
        if (p.reportId === updated.id) {
          return { 
            ...p, 
            status: '서명완료',
            committeeStatus: '심의상정' 
          };
        }
        return p;
      }));
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

  if (!isAuthenticated) {
    return <LoginPage auditors={auditors} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Global Hierarchical Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'reports') {
            setIsEditingReport(false);
          }
        }}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        urgentAlertCount={urgentCount}
        currentUserRole={currentUserRole}
        onSelectUserRole={(role) => {
          setCurrentUserRole(role);
          if (typeof window !== 'undefined') {
            localStorage.setItem('gmscs_role', role);
          }
        }}
        allAuditors={auditors}
        pendingAdjustmentCount={pendingAdjustmentCount}
        pendingCommitteeCount={pendingCommitteeCount}
        onOpenEmailModal={() => handleOpenEmailModalWithPreset()}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* 비상근 심사원 보안 격리 모드 알림 배너 */}
        {isNonPermanent && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                🛡️
              </div>
              <div>
                <div className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                  <span>[비상근 심사원 보안 격리 모드] {currentAuditorObj.name} ({currentAuditorObj.grade})</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                    권한 격리 적용 중
                  </span>
                </div>
                <div className="text-xs text-amber-800 mt-0.5">
                  심사원 본인에게 배정된 심사 일정, 담당 기업, 작성 보고서, 및 개인 심사비 정산원장(3.3% 원천징수)만 열람 가능합니다. (사무국 전체 계약/수납/300사 총괄 관리는 차단됨)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-bold text-amber-900 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                담당 기업: {visibleCompanies.length}개사 | 배정 보고서: {Object.keys(visibleReports).length}건
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. 대시보드 (월간 달력 심사 일정 & 핵심 경영 지표) */}
        {/* ========================================================= */}
        {activeTab === 'calendar' && (
          <DashboardCalendar
            projects={projects}
            auditors={auditors}
            companies={companies}
            onOpenReport={handleOpenReport}
            onSendPlan={handleSendPlan}
          />
        )}

        {/* ========================================================= */}
        {/* 2. 인증관리 */}
        {/* ========================================================= */}
        {/* 2-1. 인증심의위원회 */}
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

        {/* 2-2. 고객사 인증현황 (300사) */}
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

        {/* 2-3. 사후 / 만료 관리 (D-day 알림) */}
        {activeTab === 'surveillance' && (
          <SurveillanceManager
            contracts={mockContracts}
            auditors={auditors}
            companies={companies}
          />
        )}

        {/* 2-4. KAB 인정기관 관리 (공인기준실 & 사전 견적 시뮬레이터) */}
        {activeTab === 'kab' && (
          <KabCalculator 
            isAdmin={currentUserRole === 'admin'} 
            onNavigateToContracts={() => {
              setActiveCategory('audit');
              setActiveTab('contracts');
            }}
          />
        )}

        {/* ========================================================= */}
        {/* 3. 심사관리 */}
        {/* ========================================================= */}
        {/* 3-1. 심사 계약 관리 (신규 & 유지·추가·변경 계약 및 수동조정 승인) */}
        {activeTab === 'contracts' && (
          <AuditContractManager
            companies={companies}
            auditors={auditors}
            contracts={auditContracts}
            isAdmin={currentUserRole === 'admin'}
            onSaveContract={handleSaveContract}
            onApproveContract={handleApproveContract}
            onRejectContract={handleRejectContract}
          />
        )}

        {/* 3-2. 심사 보고서 관리 (목록 대장 vs 클릭 시 세부 보고서/정산/OK ESG) */}
        {activeTab === 'reports' && (
          <div>
            {!isEditingReport ? (
              <AuditReportList
                reports={visibleReports}
                projects={visibleProjects}
                settlements={visibleSettlements}
                onSelectReport={handleOpenReportDetail}
                onOpenIntegrations={() => {
                  if (!isNonPermanent) {
                    setActiveCategory('audit');
                    setActiveTab('integrations');
                  }
                }}
              />
            ) : (
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
                  onClose={handleBackToReportList}
                  onBackToList={handleBackToReportList}
                />
              </div>
            )}
          </div>
        )}

        {/* 3-2. 심사 진행현황 & 계획서 */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">심사 진행현황 및 심사 계획서 관리</h2>
                <p className="text-xs text-slate-500 mt-1">
                  모든 인증 심사 프로젝트의 계획 수립, 심사계획서 발송 여부, 진행 상태를 통합 관리합니다.
                </p>
              </div>
              <button
                onClick={() => handleOpenEmailModalWithPreset('', '', '심사계획서')}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-sm"
              >
                + 공문 심사계획서 신규 발송
              </button>
            </div>

            <DashboardCalendar
              projects={projects}
              auditors={auditors}
              companies={companies}
              onOpenReport={handleOpenReport}
              onSendPlan={handleSendPlan}
            />
          </div>
        )}

        {/* 3-3. OK ESG & ISO-Record 연계 모듈 */}
        {activeTab === 'integrations' && (
          <EsgRecordIntegrator />
        )}

        {/* ========================================================= */}
        {/* 4. 심사원 관리 */}
        {/* ========================================================= */}
        {/* 4-1. 심사원 자격, 코드, 심의위원 관리 */}
        {activeTab === 'auditors' && (
          <CompanyAuditorManager
            companies={companies}
            auditors={auditors}
            initialSubTab="auditors"
            onToggleCommitteeMember={handleToggleCommitteeMember}
            onReassignCompanyAuditor={handleReassignCompanyAuditor}
            onUpdateAuditorAffiliation={handleUpdateAuditorAffiliation}
          />
        )}

        {/* 4-2. 심사원 전용 포털 */}
        {activeTab === 'portal' && currentAuditorObj && (
          <AuditorPortal
            currentAuditor={currentAuditorObj}
            allAuditors={auditors}
            companies={companies}
            projects={projects}
            contracts={mockContracts}
            onOpenReport={handleOpenReport}
            onNavigateToSettlement={() => {
              setActiveCategory('general-admin');
              setActiveTab('finance');
              setFinanceSubTab('settlements');
            }}
            onRequestReassignment={handleRequestReassignment}
            onOpenEmailModal={handleOpenEmailModalWithPreset}
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
                onClick={() => setFinanceSubTab('settlements')}
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
                  onClick={() => setFinanceSubTab('billing')}
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

      {/* Footer (okesg.com 사업자 및 플랫폼 정보 인용, 이용약관/개인정보처리방침 제외) */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                <span><strong className="font-semibold text-slate-700">Email:</strong> <a href="mailto:gnfokesg@gmail.com" className="text-cyan-700 hover:underline">gnfokesg@gmail.com</a></span>
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
