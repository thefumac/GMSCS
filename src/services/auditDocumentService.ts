import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { db, TENANT_CONFIG } from './firebase';
import { DRIVE_REPORT_FILES, DriveReportFileItem } from '../data/driveReportFiles';

export type AuditDocType = '심사보고서' | '인증서' | '신청/전환자료' | '심사계획서' | '기타증빙';

export interface AuditDocumentRecord {
  id: string;
  tenantId: string; // 멀티테넌트 인증기관 식별자 (예: 'gmscs', 'kqa')
  companyId?: string;
  companyName: string;
  docType: AuditDocType;
  auditType: string; // '최초 1-2단계' | '1차 사후' | '2차 사후' | '갱신' | '전환' 등
  standards: string[]; // ['ISO 9001:2015', 'ISO 14001:2015'] 등
  year: number; // 예: 2025, 2026
  month?: number; // 예: 3, 9
  auditorName: string; // 배정 심사원명
  auditorId?: string;
  agency?: string; // 협력기관/영업기관
  storagePath: string; // Firebase Storage 경로 e.g. "audit_files/gmscs/company-123/report.pdf"
  downloadUrl: string; // 보안 다운로드 URL 또는 로컬/클라우드 서빙 URL
  fileSizeBytes: number;
  originalFileName: string;
  createdAt: string;
  uploadedBy?: string;
  isLegacyMigrated?: boolean;
}

/**
 * 기존 파일명에서 복잡하게 얽혀 있던 메타데이터를 분해하여 구조화 객체로 변환하는 지능형 파서
 */
export function parseLegacyFileNameToMetadata(rawFileName: string, companyFallback: string = '기타'): Partial<AuditDocumentRecord> {
  let cleanName = rawFileName.replace(/\.pdf$/i, '').trim();
  
  // 1. 기업명 추출: 괄호 안의 이름 우선 (예: (세진엔지니어링), (디와이메탈))
  const compMatch = cleanName.match(/\(([^\)]+)\)/);
  const companyName = compMatch ? compMatch[1].trim() : companyFallback;

  // 2. 문서 유형 판별
  let docType: AuditDocType = '기타증빙';
  if (/보고서|rep/i.test(cleanName)) docType = '심사보고서';
  else if (/인증서|cert/i.test(cleanName)) docType = '인증서';
  else if (/계획서|plan/i.test(cleanName)) docType = '심사계획서';
  else if (/전환|신청/i.test(cleanName)) docType = '신청/전환자료';

  // 3. 심사 차수 판별
  let auditType = '정기심사';
  if (/1-2단계|최초/i.test(cleanName)) auditType = '최초 1-2단계';
  else if (/1차/i.test(cleanName)) auditType = '1차 사후';
  else if (/2차/i.test(cleanName)) auditType = '2차 사후';
  else if (/갱신/i.test(cleanName)) auditType = '갱신심사';
  else if (/전환/i.test(cleanName)) auditType = '전환심사';

  // 4. 연도 및 월 추출
  let year = 2026;
  let month = 1;
  const dateMatch = cleanName.match(/(20\d{2})[.\-_](\d{1,2})/);
  if (dateMatch) {
    year = parseInt(dateMatch[1], 10);
    month = parseInt(dateMatch[2], 10);
  }

  // 5. 적용 규격 추출
  const standards: string[] = [];
  if (/9001|qms|qe|품질/i.test(cleanName)) standards.push('ISO 9001:2015');
  if (/14001|ems|qe|환경/i.test(cleanName)) standards.push('ISO 14001:2015');
  if (/45001|ohs|안전/i.test(cleanName)) standards.push('ISO 45001:2018');
  if (/27001|isms|보안/i.test(cleanName)) standards.push('ISO 27001:2022');
  if (/esg/i.test(cleanName)) standards.push('ESG-MS:2023');
  if (standards.length === 0) standards.push('ISO 9001:2015');

  // 6. 심사원명 추출 (담당미상 등)
  let auditorName = '사무국';
  const auditorMatch = cleanName.match(/(김홍덕|이정호|최광현|박상범|정해선|김남훈|정만용|심사팀)/);
  if (auditorMatch) {
    auditorName = auditorMatch[1];
  }

  return {
    tenantId: TENANT_CONFIG.tenantId,
    companyName,
    docType,
    auditType,
    standards,
    year,
    month,
    auditorName,
    originalFileName: rawFileName,
    isLegacyMigrated: true,
    createdAt: new Date().toISOString()
  };
}

/**
 * Firestore에 심사 문서 메타데이터 저장
 */
export async function saveAuditDocumentMetadata(docData: AuditDocumentRecord): Promise<void> {
  try {
    const docRef = doc(db, 'audit_documents', docData.id);
    await setDoc(docRef, {
      ...docData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Firestore 문서 메타데이터 저장 실패:', error);
    throw error;
  }
}

/**
 * 특정 기업의 심사 문서 목록 조회 (Firestore 연동 + 기존 정적 데이터 폴백)
 */
export async function getCompanyAuditDocuments(companyName: string): Promise<AuditDocumentRecord[]> {
  if (!companyName) return [];

  const cleanTarget = companyName.replace(/[\s\(\)\[\]주식회사㈜\.]/g, '').toLowerCase();

  try {
    // 1. Firestore에서 해당 Tenant 및 기업명의 문서 쿼리 시도
    const q = query(
      collection(db, 'audit_documents'),
      where('tenantId', '==', TENANT_CONFIG.tenantId),
      where('companyName', '==', companyName)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs.map(d => d.data() as AuditDocumentRecord);
    }
  } catch (e) {
    console.warn('Firestore 조회 건너뜀 (오프라인/로컬 모드 유지):', e);
  }

  // 2. Firestore에 데이터가 없거나 로컬 모드일 경우 기존 DRIVE_REPORT_FILES에서 구조화 변환 후 제공
  for (const [compKey, items] of Object.entries(DRIVE_REPORT_FILES)) {
    const cleanKey = compKey.replace(/[\s\(\)\[\]주식회사㈜\.]/g, '').toLowerCase();
    if (cleanKey === cleanTarget || cleanTarget.includes(cleanKey) || cleanKey.includes(cleanTarget)) {
      return items.map((item: DriveReportFileItem, idx: number) => {
        const parsed = parseLegacyFileNameToMetadata(item.fileName || item.originalName, companyName);
        return {
          id: `legacy-${cleanKey}-${idx}`,
          tenantId: TENANT_CONFIG.tenantId,
          companyName: parsed.companyName || companyName,
          docType: item.docType || parsed.docType || '심사보고서',
          auditType: parsed.auditType || '정기심사',
          standards: parsed.standards || ['ISO 9001:2015'],
          year: parsed.year || 2025,
          month: parsed.month || 10,
          auditorName: item.auditor || parsed.auditorName || '사무국',
          storagePath: `audit_files/${TENANT_CONFIG.tenantId}/${cleanKey}/${item.fileName}`,
          downloadUrl: item.pdfUrl,
          fileSizeBytes: item.sizeBytes || 800000,
          originalFileName: item.originalName,
          createdAt: '2025-10-01T00:00:00Z',
          isLegacyMigrated: true
        } as AuditDocumentRecord;
      });
    }
  }

  // 3. 기본 샘플 표준 문서 반환
  return [
    {
      id: `sample-rep-${cleanTarget}`,
      tenantId: TENANT_CONFIG.tenantId,
      companyName,
      docType: '심사보고서',
      auditType: '정기심사',
      standards: ['ISO 9001:2015', 'ISO 14001:2015'],
      year: 2025,
      month: 10,
      auditorName: '사무국',
      storagePath: `audit_files/${TENANT_CONFIG.tenantId}/${cleanTarget}/2025_Audit_Report_Pack.pdf`,
      downloadUrl: '/docs/2025_Audit_Report_Pack.pdf',
      fileSizeBytes: 872919,
      originalFileName: '2025 Aduit Report Pack(251001).pdf',
      createdAt: '2025-10-01T00:00:00Z',
      isLegacyMigrated: true
    },
    {
      id: `sample-cert-${cleanTarget}`,
      tenantId: TENANT_CONFIG.tenantId,
      companyName,
      docType: '인증서',
      auditType: '정기심사',
      standards: ['ISO 9001:2015'],
      year: 2025,
      month: 10,
      auditorName: '사무국',
      storagePath: `audit_files/${TENANT_CONFIG.tenantId}/${cleanTarget}/cert_change_application.pdf`,
      downloadUrl: '/docs/cert_change_application.pdf',
      fileSizeBytes: 605486,
      originalFileName: '인증서_전자본.pdf',
      createdAt: '2025-10-01T00:00:00Z',
      isLegacyMigrated: true
    }
  ];
}
