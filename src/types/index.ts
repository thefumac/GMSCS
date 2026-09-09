export type StandardCode = 'ISO 9001:2015' | 'ISO 14001:2015' | 'ISO 45001:2018' | 'ISO 27001:2022' | 'ISO 37001:2016' | 'ESG-MS';

export type AuditType = '최초 1단계' | '최초 2단계' | '사후관리 1차' | '사후관리 2차' | '갱신심사' | '전환심사' | '특별심사';

export type AuditStatus = '계획수립' | '계획서발송' | '심사진행중' | '보고서작성' | '서명대기' | '서명완료' | '인증발행';

export type ClientType = '직영' | '심사원영업';

export type PaymentStatus = '미입금' | '부분입금' | '입금완료';

export type TaxInvoiceStatus = '미발행' | '청구발행' | '영수발행';

export interface Company {
  id: string;
  bizNumber: string; // 사업자등록번호 (000-00-00000)
  companyName: string;
  ceoName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  managingAuditorId?: string; // 담당 심사원 ID
  clientType: ClientType;
  totalEmployees: number;
  industry: string;
  iafCode: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  createdAt: string;
}

export interface Auditor {
  id: string;
  name: string;
  mobile: string;
  email: string;
  grade: '선임심사원' | '정심사원' | '심사원보' | '검증심사원' | '기술전문가';
  status: '활동' | '휴식' | '자격만료임박';
  iafCodes: string[];
  registeredStandards: StandardCode[];
  contractExpiryDate: string;
  activeClientCount: number;
}

export interface CertContract {
  id: string;
  companyId: string;
  companyName: string;
  issuerName: 'GMSCS' | '한국품질인증원(제휴)' | '글로벌QA인증(해외)';
  certNumber: string;
  standards: StandardCode[];
  scope: string; // 인증범위
  initialCertDate: string; // 최초 인증일
  validUntil: string; // 만료일 (3년)
  surveillanceDueDate: string; // 차기 사후관리 예정일
  status: '유효' | '만료임박' | '만료' | '정지';
}

export interface AuditSchedule {
  id: string;
  projectId: string;
  auditorId: string;
  auditorName: string;
  role: '심사팀장' | '심사팀원' | '심사원보' | '검증심사원' | '기술전문가';
  startDate: string;
  endDate: string;
  assignedMd: number;
}

export interface SignatureLog {
  id: string;
  signerRole: '심사팀장' | '참석 심사원' | '심사원보' | '검증심사원' | '근로자 대표' | '피심사기업 대표/품질책임자';
  signerName: string;
  signatureDataUrl?: string; // base64 canvas image
  signedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  verificationToken: string;
  isSigned: boolean;
  verifyMethod: '자필서명' | '기업이메일확인';
  emailVerified?: boolean;
  emailVerifiedAt?: string;
}

export interface AuditAttachment {
  id: string;
  clauseId: string;
  fileName: string;
  fileSize: string;
  isRequired: boolean; // 필수사항 vs 선택사항 구분
  uploadedAt?: string;
  fileUrl?: string;
}

export interface ChecklistItem {
  id: string;
  clause: string; // 예: "4.1 조직과 그 상황의 이해"
  question: string;
  result: '적합' | '경부적합' | '중부적합' | '관찰사항' | '해당없음';
  evidence: string; // 심사 발견사항 및 객관적 증거
  requirementDetails?: string; // 세부 요구사항 가이드
  attachments?: AuditAttachment[]; // 증빙 첨부파일 목록
}

export interface AuditReport {
  id: string;
  projectId: string;
  companyName: string;
  auditType: AuditType;
  standards: StandardCode[];
  startDate: string; // 심사 시작일 (입력 가능 기간 제어)
  endDate: string;   // 심사 종료일
  auditDates: string;
  leadAuditor: string;
  auditTeam: string[];
  provisionalAuditors?: string[]; // 심사원보
  technicalReviewer?: string;     // 검증 심사원
  
  // 종합 내용
  executiveSummary: string;
  strengthPoints: string;
  improvementAreas: string;
  nonConformityCount: {
    major: number;
    minor: number;
    observation: number;
  };
  
  // 공식 Remark 양식 서브 섹션
  meetingAgendas: {
    openingChecked: boolean;
    closingChecked: boolean;
    workerRepresentativePresent: boolean;
    independenceConfirmed: boolean;
  };
  checklists: ChecklistItem[];
  signatures: SignatureLog[];
  pdfUrl?: string;
  updatedAt: string;
}

export interface AuditProject {
  id: string;
  contractId: string;
  companyId: string;
  companyName: string;
  issuerName: string;
  auditType: AuditType;
  standards: StandardCode[];
  leadAuditorId: string;
  leadAuditorName: string;
  startDate: string;
  endDate: string;
  status: AuditStatus;
  
  // KAB MD 및 비용 로직
  kabStandardMd: number;
  appliedMd: number;
  standardFee: number;
  finalFee: number;
  adjustmentReason?: string;
  
  // 계획서 및 수납
  planSentDate?: string;
  paymentStatus: PaymentStatus;
  taxInvoiceStatus: TaxInvoiceStatus;
  billedAmount: number;
  paidAmount: number;
  
  // 심사보고서 ID
  reportId?: string;
}

export interface BackupRecord {
  id: string;
  backupDate: string;
  backupType: 'Full DB' | 'Incremental File' | 'PDF Archive';
  sizeBytes: number;
  destination: '사내 주 서버 (Postgres)' | '외장 하드 디스크 (USB 3.0)' | 'NAS 오프라인 콜드보관';
  status: '정상완료' | '동기화중' | '외장하드 미연결경고';
  checksum: string;
}
