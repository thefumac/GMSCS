import React from 'react';
import type { Company, Auditor, AuditReport, AuditContractRecord, AuditProject } from '../types';
import { AuditReportWizard } from './report-wizard/AuditReportWizard';

export interface AuditReportWorkbenchProps {
  company: Company;
  contract?: AuditContractRecord;
  report?: AuditReport;
  auditor?: Auditor;
  auditors?: Auditor[];
  project?: AuditProject;
  onClose: () => void;
  onSave?: (data: any) => void;
  onUpdateCompany?: (updated: Company) => void;
}

/**
 * 7,200줄 비대 컴포넌트를 실용적인 4단계 스텝별 위저드(AuditReportWizard)로 전환한 경량화 래퍼
 */
export const AuditReportWorkbench: React.FC<AuditReportWorkbenchProps> = (props) => {
  return <AuditReportWizard {...props} />;
};
