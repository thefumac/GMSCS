export type StandardCode = 
  | 'ISO 9001:2015' 
  | 'ISO 14001:2015' 
  | 'ISO 45001:2018' 
  | 'ESG-MS:2023' 
  | 'ISO 50001:2018' 
  | 'ISO 27001:2022' 
  | 'ISO 27701:2019' 
  | 'ISO 37001:2016' 
  | 'ISO 37301:2021' 
  | 'ISO 22301:2019' 
  | 'ISO 22716:2007' 
  | 'ISO 15378:2017' 
  | 'ISO 22000:2018' 
  | 'ISO 13485:2016';

export type AuditType = '최초 1단계' | '최초 2단계' | '사후관리 1차' | '사후관리 2차' | '갱신심사' | '전환심사' | '특별심사';

export type AuditStatus = '계획수립' | '계획서발송' | '심사진행중' | '보고서작성' | '서명대기' | '서명완료' | '사무국검토대기' | '보완요청' | '심의대기' | '심의진행' | '인증발행';

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
  consultant?: string;       // 영업 유치자 / 컨설턴트명
  agency?: string;           // 유치 기관 (협력기관 / HQ사무국)
  salesType?: string;        // 영업구분 (협력기관, HQ업체 등)
  assignedAuditorName?: string; // 배정된 심사원명
  isAuditorChanged?: boolean;   // 심사원 교체 여부
  auditorHistory?: string[];    // 역대 심사원 이력
}

export type AuditorAffiliation = '상근' | '비상근';
export type AuditorPayoutMethod = '세금계산서' | '원천징수';

export interface Auditor {
  id: string;
  gmsNumber?: string; // GMS 심사원 등록번호 (예: GMS23001)
  name: string;
  mobile: string;
  email: string;
  grade: '선임심사원' | '정심사원' | '심사원보' | '검증심사원' | '기술전문가';
  status: '활동' | '휴식' | '자격만료임박';
  originType?: '상근' | '비상근'; // 원본 DB 구분: '상근' | '비상근'
  affiliation: AuditorAffiliation; // 상근 / 비상근 구분 (4인만 상근)
  isSystemAdmin?: boolean; // 시스템 총괄 관리자 여부 (대표님 등)
  iafCodes: string[];
  registeredStandards: StandardCode[];
  contractExpiryDate: string;
  activeClientCount: number;
  
  // 개인 사진 (프로필 이미지 DataURL 또는 URL)
  photoUrl?: string;

  // 심사비 지급 방식 및 세무 사업자 정보
  payoutMethod?: AuditorPayoutMethod; // '세금계산서' | '원천징수'
  isBusinessEntity?: boolean; // 개인사업자 여부
  businessNumber?: string; // 사업자등록번호 (000-00-00000)
  businessName?: string; // 상호명
  businessCeo?: string; // 사업자 대표명
  businessAddress?: string; // 사업장 주소
  taxEmail?: string; // 세금계산서 수신 이메일
  residentNumberFront?: string; // 원천징수용 생년월일 (YYMMDD)

  // 정산 계좌 정보
  bankName?: string; // 은행명
  accountNumber?: string; // 계좌번호
  accountHolder?: string; // 예금주
  bankAccount?: string; // 기존 호환용 (예: "신한 110-123-456789 김홍덕")
  payoutRatePerMd?: number; // 기본 MD당 수당

  // 규격별 상세 등급 매핑 (ISO 9001: 선임심사원, ISO 14001: 정심사원 등)
  standardGrades?: Record<string, '선임심사원' | '정심사원' | '심사원보' | '기술전문가'>;
  
  // 인증심의위원 자격
  isCommitteeMember: boolean;
  committeeRole?: '심의위원장' | '심의부위원장' | '심의위원' | '심의간사' | '전문심의위원';
  committeeAppointmentDate?: string;
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

export type AuditContractType = '신규인증' | '정기사후' | '갱신심사' | '규격추가' | '인증변경';

export interface CertChangeApplicationData {
  appliedDate: string;
  changeCategories: ('상호' | '주소' | '사업자' | '범위' | '표준' | '기타')[];
  newCompanyNameKo?: string;
  newCompanyNameEn?: string;
  newCeoName?: string;
  newAddressHead?: string;
  newAddressPlant?: string;
  newBizType?: string;
  scopeChangeType?: '이전' | '추가' | '축소' | '기타';
  newScopeDetails?: string;
  desiredAuditDate?: string;
  attachedDocuments: string[];
  clientSignature?: string;
}

export interface WeekendAuditReasonData {
  auditDates: string;
  isWeekendOrHoliday: boolean;
  reasonCategory: '연속가동생산' | '고객사요청' | '공정특성' | '기타';
  detailedReason: string;
  auditorSigned: boolean;
  auditorSignedAt?: string;
  clientVerified: boolean;
  clientVerifiedAt?: string;
  clientVerificationMethod: '전자서명' | '이메일확인';
  clientEmail?: string;
  clientName?: string;
}

export interface AuditContractRecord {
  id: string;
  contractNumber: string;
  contractDate: string;
  companyId: string;
  companyName: string;
  contractType: AuditContractType;
  standards: StandardCode[];
  addedStandards?: StandardCode[]; // 규격추가 시
  changeDetails?: string; // 인증변경 시 사유/내용
  employeeCount: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  
  // 이전 계약 사항 (대사 및 비교용)
  previousContract?: {
    contractNumber: string;
    contractDate: string;
    contractType: string;
    standards: StandardCode[];
    appliedMd: number;
    ratePerMd: number;
    finalFee: number;
    travelExpense: number;
  };

  // KAB 공식 표준 MD (원칙상 조정하지 않고 준수)
  kabStandardMd: number;
  appliedMd: number; // KAB 표준 MD와 일치
  
  // MD당 단가 조정 (KAB 표준 800,000원에서 단가 조정)
  standardRatePerMd: number; // 800,000원
  ratePerMd: number; // 실제 합의 적용 단가 (예: 700,000원, 600,000원 등)

  // 5대 공식 비용 구성 항목
  docAuditMd: number; // 문서심사 MD
  docAuditFee: number; // 1. 문서심사비
  onsiteAuditMd: number; // 현장심사 MD
  onsiteAuditFee: number; // 2. 현장심사비
  travelExpense: number; // 3. 여비교통비
  lodgingOption: '업체직접제공' | '턴키포함'; // 4. 숙박비 옵션
  lodgingNights: number; // 숙박 일수
  lodgingExpense: number; // 숙박비 금액
  applicationFee: number; // 5. 신청 및 등록비 (신규/추가/변경 시)

  standardFee: number; // KAB 표준 총액
  finalFee: number; // 5대 항목 합산 최종 계약 금액 (VAT 별도)
  
  isAdjusted: boolean;
  adjustmentReason?: string;
  approvalStatus: '승인불필요' | '승인대기' | '승인완료' | '반려';
  approvedBy?: string;
  approvedAt?: string;
  leadAuditorId: string;
  leadAuditorName: string;
  plannedAuditStartDate?: string;
  plannedAuditEndDate?: string;
  contractStatus: '견적작성' | '승인요청' | '계약체결' | '심사진행중' | '완료';

  // 공식 서식 연동
  weekendAuditData?: WeekendAuditReasonData;
  certChangeData?: CertChangeApplicationData;
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
  signerEmail?: string;
  kabCertNumber?: string;
  signatureDataUrl?: string; // base64 canvas image 또는 전자 직인
  signedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  verificationToken: string;
  isSigned: boolean;
  verifyMethod: '공인이메일인증' | '기업이메일확인' | '자필서명';
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
  clause: string;
  question: string;
  result: '적합' | '경부적합' | '중부적합' | '관찰사항' | '해당없음';
  evidence: string;
  requirementDetails?: string;
  attachments?: AuditAttachment[];
}

export interface AuditReport {
  id: string;
  projectId: string;
  companyName: string;
  auditType: AuditType;
  standards: StandardCode[];
  startDate: string;
  endDate: string;
  auditDates: string;
  leadAuditor: string;
  auditTeam: string[];
  provisionalAuditors?: string[];
  technicalReviewer?: string;
  
  // 종합 내용
  executiveSummary: string;
  strengthPoints: string;
  improvementAreas: string;
  nonConformityCount: {
    major: number;
    minor: number;
    observation: number;
  };
  
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

  // 사무국 적정성 검토 프로세스 (신규)
  secretariatReviewStatus?: '작성중' | '검토대기' | '보완요청' | '검토승인';
  submittedToSecretariatAt?: string;
  secretariatReviewer?: string;
  secretariatReviewedAt?: string;
  secretariatComment?: string;
  secretariatChecklist?: {
    scopeCheck: boolean;
    ncrCheck: boolean;
    meetingCheck: boolean;
    signCheck: boolean;
  };
}

export interface AuditorReassignmentLog {
  id: string;
  date: string;
  prevAuditorId: string;
  prevAuditorName: string;
  newAuditorId: string;
  newAuditorName: string;
  reasonCategory: '이해상충(Conflict of Interest)' | '심사일정 중복' | '전문분야(IAF) 불일치' | '심사원 신병/개인사정' | '기타';
  reasonDetail: string;
  processedBy: string;
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
  auditDates?: string[];
  teamAuditorNames?: string[];
  status: AuditStatus;
  
  // KAB MD 및 비용 로직
  kabStandardMd: number;
  appliedMd: number;
  standardFee: number;
  finalFee: number;
  adjustmentReason?: string;
  
  // 사무국 심사비 조정 승인 워크플로우
  feeAdjustmentStatus?: '승인불필요' | '승인대기' | '승인완료' | '반려';
  feeAdjustmentRequestedFee?: number;
  feeAdjustmentApprovedBy?: string;
  feeAdjustmentApprovedAt?: string;
  
  // 이해상충 등 심사원 변경 이력
  reassignmentHistory?: AuditorReassignmentLog[];
  
  // 인증심의위원회 심의 상태
  committeeStatus?: '심의대기' | '심의상정' | '심의진행' | '등록승인' | '조건부승인' | '보류' | '인증불가';
  committeeDecisionDate?: string;
  committeeDecisionNote?: string;

  // 계획서 및 수납
  planSentDate?: string;
  paymentStatus: PaymentStatus;
  taxInvoiceStatus: TaxInvoiceStatus;
  billedAmount: number;
  paidAmount: number;
  
  // 심사보고서 ID
  reportId?: string;
}

export interface AuditorSettlement {
  id: string;
  auditorId: string;
  auditorName: string;
  projectId: string;
  companyName: string;
  auditType: AuditType;
  auditDates: string;
  standards: StandardCode[];
  year: number;
  settlementDate: string;
  totalAuditFee: number;
  appliedMd: number;
  payoutAmount: number;
  taxWithheld: number; // 3.3%
  netPayout: number;
  payoutStatus: '정산대기' | '지급완료' | '보류';
  paidDate?: string;
}

export type CommitteeDecision = '인증등록승인' | '조건부승인' | '인증보류' | '인증불가';

export interface CommitteeAgenda {
  id: string;
  projectId: string;
  companyId: string;
  companyName: string;
  standards: StandardCode[];
  auditType: AuditType;
  leadAuditorName: string;
  auditDates: string;
  majorCount: number;
  minorCount: number;
  observationCount: number;
  leadRecommendation: '인증등록 추천' | '시정조치 후 추천' | '재심사 추천';
  decision?: CommitteeDecision;
  reviewNote?: string;
  decidedAt?: string;
}

export interface CommitteeMeeting {
  id: string;
  meetingNumber: string;
  meetingDate: string;
  chairperson: string;
  attendees: string[];
  status: '예정' | '진행중' | '의결완료';
  agendas: CommitteeAgenda[];
  resolutionDocNumber?: string;
}

export interface EmailDispatchLog {
  id: string;
  sentAt: string;
  templateType: '심사계획서' | '심사원배정통보' | '심사원변경통보' | '심사비승인통보' | '인증심의결과안내';
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodySummary: string;
  status: '발송완료' | '발송대기';
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

export interface NoticeAttachment {
  id: string;
  fileName: string;
  fileSize?: string;
  fileUrl: string; // 다운로드 또는 저장 링크 URL
  fileType?: string;
}

export interface AuditorNotice {
  id: string;
  title: string;
  content: string;
  category: '긴급' | 'KAB기준' | '심사지침' | '서식배포' | '일반공지';
  targetAudience: '전체 심사원' | '비상근심사원 전용' | '사무국 내부';
  authorName: string;
  authorRole: string;
  authorId: string;
  createdAt: string;
  isUrgent?: boolean;
  attachments: NoticeAttachment[];
}

// Remark 공식 서식: 부서/프로세스별 조항 심사 매트릭스
export interface ProcessMatrixRow {
  id: string;
  processName: string;
  deptName: string;
  clause4: boolean; // 조직상황
  clause5: boolean; // 리더십
  clause6: boolean; // 기획
  clause7: boolean; // 지원
  clause8: boolean; // 운용
  clause9: boolean; // 성과평가
  clause10: boolean; // 개선
  markUsage: boolean; // 인증마크 사용
  ncCount: string; // 부적합 수 (예: '√', '경1', '중1' 등)
}

// Remark 공식 서식: 3개년 심사계획 및 주기별 조항 매트릭스
export interface ThreeYearCyclePlanItem {
  id: string;
  clauseNumber: string;
  clauseTitle: string;
  cycleInitial: string; // '○' | '√' | ''
  cycleSurv1: string;
  cycleSurv2: string;
  cycleSurv3: string;
  cycleSurv4: string;
  cycleSurv5: string;
}

// Remark 공식 서식: 전 회차(이전 심사) 부적합 및 시정조치 유효성 확인
export interface PreviousAuditNcCheck {
  id: string;
  ncNumber: string; // 예: NCR-2025-01
  standardCode: string; // 예: ISO 9001:2015 7.1.5
  deptName: string;
  ncGrade: '경부적합' | '중부적합' | '관찰사항';
  ncContent: string; // 부적합 내용
  correctiveAction: string; // 시정조치 및 재발방지대책
  actionDate: string;
  verificationMethod: '문서확인' | '현장확인';
  adequacyResult: '적합(적절함)' | '부적합(부적절함)' | '보완필요';
  effectivenessResult: '효과적' | '효과적이지않음' | '확인대기';
  auditorName: string;
  verifiedAt: string;
}


