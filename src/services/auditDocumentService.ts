import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage, TENANT_CONFIG } from './firebase';
import rawMigratedDocs from '../data/migratedAuditDocuments.json';

export type AuditDocType = '심사보고서' | '인증서' | '신청/전환자료' | '심사계획서' | '기타증빙';

export interface AuditDocumentRecord {
  id: string;
  tenantId: string; // 멀티테넌트 인증기관 식별자 (예: 'gmscs', 'kqa')
  companyId?: string;
  companyName: string;
  docType: AuditDocType;
  auditType: string; // '최초심사' | '1차사후' | '2차사후' | '갱신심사' | '전환심사' 등
  standards: string[]; // ['ISO 9001:2015', 'ISO 14001:2015'] 등
  year: number; // 예: 2025, 2026
  month?: number; // 예: 3, 9
  auditorName: string; // 배정 심사원명
  auditorId?: string;
  agency?: string; // 협력기관/영업기관
  storagePath: string; // Firebase Storage 경로 e.g. "audit_files/gmscs/미래디스플레이/2026-01_1차사후_심사보고서.pdf"
  downloadUrl?: string; // Firebase Storage 다운로드 URL
  fileSizeBytes: number;
  originalFileName: string;
  simplifiedFileName: string;
  createdAt: string;
  uploadedBy?: string;
  isLegacyMigrated?: boolean;
}

// In-memory 캐시: 기업별 문서 목록 및 다운로드 URL 캐시
const companyDocsCache = new Map<string, AuditDocumentRecord[]>();
const downloadUrlCache = new Map<string, string>();

/**
 * 기업명 정규화 (괄호, 주식회사, 공백 등 제거하여 매칭 정밀도 극대화)
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  return name.replace(/[\s\(\)\[\]주식회사㈜\.\-_]/g, '').toLowerCase().trim();
}

/**
 * 바이트 크기를 사람이 읽기 쉬운 문자열로 변환 (예: 1.4 MB)
 */
export function formatFileSizeBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Firebase Storage 경로로부터 서명/공개 다운로드 URL 조회 (캐싱 지원)
 */
export async function getDocumentDownloadUrl(storagePath: string): Promise<string> {
  if (!storagePath) return '/docs/2025_Audit_Report_Pack.pdf';
  
  if (downloadUrlCache.has(storagePath)) {
    return downloadUrlCache.get(storagePath)!;
  }

  try {
    const fileRef = ref(storage, storagePath);
    const url = await getDownloadURL(fileRef);
    downloadUrlCache.set(storagePath, url);
    return url;
  } catch (error) {
    // Firebase Storage REST 직접 접근 URL 폴백
    const fallbackUrl = `https://firebasestorage.googleapis.com/v0/b/gmscs-a9925.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
    downloadUrlCache.set(storagePath, fallbackUrl);
    return fallbackUrl;
  }
}

/**
 * 특정 기업의 모든 심사 문서 목록 조회
 * (1. 메모리 캐시 -> 2. Firestore query -> 3. 로컬 마이그레이션 JSON 폴백)
 */
export async function getCompanyAuditDocuments(companyName: string): Promise<AuditDocumentRecord[]> {
  if (!companyName) return [];

  const cleanTarget = normalizeCompanyName(companyName);
  if (!cleanTarget) return [];

  if (companyDocsCache.has(cleanTarget)) {
    return companyDocsCache.get(cleanTarget)!;
  }

  let results: AuditDocumentRecord[] = [];

  try {
    // 1. Firestore에서 해당 테넌트 및 기업명으로 쿼리 시도
    const q = query(
      collection(db, 'audit_documents'),
      where('tenantId', '==', TENANT_CONFIG.tenantId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const allDocs = snap.docs.map(d => d.data() as AuditDocumentRecord);
      results = allDocs.filter(d => {
        const docClean = normalizeCompanyName(d.companyName);
        return docClean === cleanTarget || docClean.includes(cleanTarget) || cleanTarget.includes(docClean);
      });
    }
  } catch (e) {
    console.warn('Firestore 조회 건너뜀 (로컬 마이그레이션 데이터 사용):', e);
  }

  // 2. Firestore에 데이터가 없거나 로컬 모드일 경우 마이그레이션된 JSON에서 검색
  if (results.length === 0) {
    const staticDocs = rawMigratedDocs as any[];
    results = staticDocs
      .filter(item => {
        const itemClean = normalizeCompanyName(item.companyName || '');
        return itemClean === cleanTarget || itemClean.includes(cleanTarget) || cleanTarget.includes(itemClean);
      })
      .map((item, idx) => ({
        id: `migrated-${cleanTarget}-${idx}`,
        tenantId: item.tenantId || TENANT_CONFIG.tenantId,
        companyName: item.companyName || companyName,
        docType: (item.docType as AuditDocType) || '심사보고서',
        auditType: item.auditType || '정기심사',
        standards: item.standards || ['ISO 9001:2015'],
        year: item.year || 2026,
        month: item.month || 1,
        auditorName: item.auditorName || '사무국',
        storagePath: item.storagePath || `audit_files/gmscs/${item.companyName}/${item.simplifiedFileName}`,
        fileSizeBytes: item.fileSizeBytes || 800000,
        originalFileName: item.originalFileName || '',
        simplifiedFileName: item.simplifiedFileName || `${item.year || 2026}_심사문서.pdf`,
        createdAt: '2026-09-13T00:00:00Z',
        isLegacyMigrated: true
      }));
  }

  // 최신 연도, 최신 월 순으로 정렬
  results.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return (b.month || 0) - (a.month || 0);
  });

  companyDocsCache.set(cleanTarget, results);
  return results;
}

/**
 * 전체 아카이브 문서 목록 조회 (사무국 관리자용)
 */
export async function getAllArchivedDocuments(): Promise<AuditDocumentRecord[]> {
  try {
    const q = query(
      collection(db, 'audit_documents'),
      where('tenantId', '==', TENANT_CONFIG.tenantId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as AuditDocumentRecord);
    }
  } catch (e) {
    console.warn('전체 아카이브 Firestore 조회 실패, 로컬 데이터 사용:', e);
  }

  return (rawMigratedDocs as any[]).map((item, idx) => ({
    id: `migrated-all-${idx}`,
    tenantId: item.tenantId || TENANT_CONFIG.tenantId,
    companyName: item.companyName,
    docType: item.docType || '심사보고서',
    auditType: item.auditType || '정기심사',
    standards: item.standards || ['ISO 9001:2015'],
    year: item.year || 2026,
    month: item.month || 1,
    auditorName: item.auditorName || '사무국',
    storagePath: item.storagePath,
    fileSizeBytes: item.fileSizeBytes || 0,
    originalFileName: item.originalFileName || '',
    simplifiedFileName: item.simplifiedFileName || '',
    createdAt: '2026-09-13T00:00:00Z',
    isLegacyMigrated: true
  }));
}

/**
 * Firestore에 신규 심사 문서 메타데이터 저장
 */
export async function saveAuditDocumentMetadata(docData: AuditDocumentRecord): Promise<void> {
  try {
    const docRef = doc(db, 'audit_documents', docData.id);
    await setDoc(docRef, {
      ...docData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    // 캐시 무효화
    const cleanTarget = normalizeCompanyName(docData.companyName);
    companyDocsCache.delete(cleanTarget);
  } catch (error) {
    console.error('Firestore 문서 메타데이터 저장 실패:', error);
    throw error;
  }
}
