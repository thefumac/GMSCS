import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardCalendar } from './components/DashboardCalendar';
import { AuditReportEditor } from './components/AuditReportEditor';
import { SurveillanceManager } from './components/SurveillanceManager';
import { CompanyAuditorManager } from './components/CompanyAuditorManager';
import { KabCalculator } from './components/KabCalculator';
import { BillingManager } from './components/BillingManager';
import { BackupManager } from './components/BackupManager';
import { EsgRecordIntegrator } from './components/EsgRecordIntegrator';

import { 
  mockAuditors, 
  mockCompanies, 
  mockContracts, 
  mockProjects, 
  mockReports 
} from './data/mockData';
import { AuditReport, AuditProject, PaymentStatus, TaxInvoiceStatus } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [projects, setProjects] = useState<AuditProject[]>(mockProjects);
  const [reports, setReports] = useState<Record<string, AuditReport>>(mockReports);
  const [activeReportId, setActiveReportId] = useState<string>('rep-1');

  // 긴급 알림 카운트 (D-30 이내)
  const urgentCount = mockContracts.filter(c => {
    const diff = Math.ceil((new Date(c.surveillanceDueDate).getTime() - new Date(2026, 8, 9).getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 30;
  }).length;

  // 캘린더 등에서 보고서 열기
  const handleOpenReport = (reportId: string) => {
    setActiveReportId(reportId);
    setActiveTab('report');
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

    // 만약 모든 서명이 완료되었다면 프로젝트 상태를 '서명완료'로 변경
    const allSigned = updated.signatures.every(s => s.isSigned);
    if (allSigned) {
      setProjects(prev => prev.map(p => {
        if (p.reportId === updated.id) {
          return { ...p, status: '서명완료' };
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        urgentAlertCount={urgentCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'calendar' && (
          <DashboardCalendar
            projects={projects}
            auditors={mockAuditors}
            companies={mockCompanies}
            onOpenReport={handleOpenReport}
            onSendPlan={handleSendPlan}
          />
        )}

        {activeTab === 'report' && (
          <AuditReportEditor
            report={reports[activeReportId] || reports['rep-1']}
            onSaveReport={handleSaveReport}
            onClose={() => setActiveTab('calendar')}
          />
        )}

        {activeTab === 'surveillance' && (
          <SurveillanceManager
            contracts={mockContracts}
            auditors={mockAuditors}
            companies={mockCompanies}
          />
        )}

        {activeTab === 'companies' && (
          <CompanyAuditorManager
            companies={mockCompanies}
            auditors={mockAuditors}
            initialSubTab="companies"
          />
        )}

        {activeTab === 'auditors' && (
          <CompanyAuditorManager
            companies={mockCompanies}
            auditors={mockAuditors}
            initialSubTab="auditors"
          />
        )}

        {activeTab === 'kab' && (
          <KabCalculator />
        )}

        {activeTab === 'billing' && (
          <BillingManager
            projects={projects}
            onUpdatePayment={handleUpdatePayment}
          />
        )}

        {activeTab === 'backup' && (
          <BackupManager />
        )}

        {activeTab === 'integrations' && (
          <EsgRecordIntegrator />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 <strong>GMSCS</strong> (Global Management System Certification Service). All rights reserved.
          </div>
          <div className="flex items-center space-x-4 text-slate-600 text-[11px]">
            <span>KAB 공인 인증기관 기준 준수</span>
            <span>•</span>
            <span>데이터베이스 2중 백업 가동 중</span>
            <span>•</span>
            <span>OK ESG & ISO-Record 연동 모듈</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
