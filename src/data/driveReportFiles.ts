import rawMigratedDocs from './migratedAuditDocuments.json';
import { formatFileSizeBytes, normalizeCompanyName } from '../services/auditDocumentService';

export interface DriveReportFileItem {
  fileName: string;
  originalName: string;
  docType: '심사보고서' | '인증서' | '신청/전환자료' | '심사계획서' | '기타증빙';
  fileSize: string;
  sizeBytes: number;
  auditor: string;
  pdfUrl: string;
  storagePath?: string;
  year?: number;
  month?: number;
  auditType?: string;
  standards?: string[];
}

// 마이그레이션된 790개 문서 데이터를 기업명별로 그룹화
const companyDocsMap: Record<string, DriveReportFileItem[]> = {};

for (const doc of (rawMigratedDocs as any[])) {
  const compName = doc.companyName || '기타';
  if (!companyDocsMap[compName]) {
    companyDocsMap[compName] = [];
  }

  const storagePath = doc.storagePath || `audit_files/${compName}/${doc.simplifiedFileName}`;
  // Firebase Storage 공개 URL (브라우저 열람 지원)
  const encodedPath = encodeURIComponent(storagePath);
  const pdfUrl = `https://firebasestorage.googleapis.com/v0/b/gmscs-a9925.firebasestorage.app/o/${encodedPath}?alt=media`;

  companyDocsMap[compName].push({
    fileName: doc.simplifiedFileName || doc.originalFileName,
    originalName: doc.originalFileName,
    docType: doc.docType || '심사보고서',
    fileSize: formatFileSizeBytes(doc.fileSizeBytes || 0),
    sizeBytes: doc.fileSizeBytes || 0,
    auditor: doc.auditorName || '사무국',
    pdfUrl,
    storagePath,
    year: doc.year,
    month: doc.month,
    auditType: doc.auditType,
    standards: doc.standards
  });
}

export const DRIVE_REPORT_FILES: Record<string, DriveReportFileItem[]> = companyDocsMap;

/**
 * 특정 기업의 보관 보고서/인증서 파일 목록 조회
 */
export function getDriveReportsForCompany(companyName: string): DriveReportFileItem[] {
  if (!companyName) return [];

  const cleanTarget = normalizeCompanyName(companyName);
  
  // 정확 일치 또는 정규화 부분 일치 검색
  for (const [key, items] of Object.entries(companyDocsMap)) {
    const cleanKey = normalizeCompanyName(key);
    if (cleanKey === cleanTarget || cleanKey.includes(cleanTarget) || cleanTarget.includes(cleanKey)) {
      return items;
    }
  }

  return [];
}
