// Auto-generated 100% Content-Verified Audit Documents Index
import rawDocs from "./migratedAuditDocuments.json";

export interface DriveReportFileItem {
  id?: string;
  companyName: string;
  docType: "심사보고서" | "인증서" | "신청/전환자료";
  standards: string[];
  auditType: string;
  year: number;
  month: number;
  auditor?: string;
  auditorName?: string;
  fileName: string;
  originalFilename?: string;
  fileSize: string;
  storagePath: string;
  downloadUrl: string;
  pdfUrl: string;
  uploadedAt?: string;
}

export const MIGRATED_AUDIT_DOCUMENTS: DriveReportFileItem[] = rawDocs as DriveReportFileItem[];

export function getDriveReportsForCompany(companyName: string): DriveReportFileItem[] {
  if (!companyName) return [];
  const clean = companyName.replace(/[\s\(\)\[\]주회사\-\.]+/g, "").toLowerCase();
  return MIGRATED_AUDIT_DOCUMENTS.filter(doc => {
    const dClean = doc.companyName.replace(/[\s\(\)\[\]주회사\-\.]+/g, "").toLowerCase();
    return dClean === clean || dClean.includes(clean) || clean.includes(dClean);
  });
}
