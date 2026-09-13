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

export interface AdditionalSite {
  id: string;
  siteName: string; // 사업장명 / 공장명 / 지사명 (예: '제2공장', '연구소', '천안공장')
  address: string; // 사업장 주소 / 소재지
  zipCode?: string; // 우편번호
  phone?: string; // 전화번호
  employees?: number; // 해당 사업장 상주 인원수
  scope?: string; // 해당 사업장 생산품목 / 업무범위
}

export interface Company {
  id: string;
  bizNumber: string; // 사업자등록번호 (000-00-00000)
  companyName: string;
  ceoName: string;
  address: string; // 대표 사업장 본사 소재지
  contactPerson: string;
  contactPosition?: string; // 담당자 직책 (부장, 과장, 이사 등)
  contactPhone: string;
  contactEmail: string;
  managingAuditorId?: string; // 담당 심사원 ID
  clientType: ClientType;
  totalEmployees: number;
  industry: string;
  iafCode: string;
  scope?: string; // 인증범위
  riskLevel: 'High' | 'Medium' | 'Low';
  createdAt: string;
  consultant?: string;       // 영업 유치자 / 컨설턴트명
  agency?: string;           // 유치 기관 (협력기관 / HQ사무국)
  salesType?: string;        // 영업구분 (협력기관, HQ업체 등)
  assignedAuditorName?: string; // 배정된 심사원명
  isAuditorChanged?: boolean;   // 심사원 교체 여부
  auditorHistory?: string[];    // 역대 심사원 이력
  initialContractDate?: string; // 최초 계약일
  initialContractType?: string; // 계약 구분 (신규 / 갱신 / 전환 등)
  standardInitialDates?: Record<string, string>; // 규격별 최초 계약일자

  // 심사 일정 및 인증 이력
  initialCertDate?: string;  // 최초 인증일
  lastAuditDate?: string;    // 이전 인증심사일
  expiryDate?: string;       // 인증 유효기간 만료일
  certNo?: string;           // 인증서 번호
  standards?: string;        // 등록 규격 목록 (예: 'ISO 9001:2015, ISO 14001:2015')

  // 복수 추가사업장 (Multi-Site) 정보
  additionalSites?: AdditionalSite[];
  
  // 전환 심사 및 이전 인증기관 이력
  isTransfer?: boolean; // 전환 여부 (true: 타 기관 전환, false: 일반 신규)
  transferType?: '전환 사후심사' | '전환 갱신심사' | '전환 규격추가' | '단순 기관이관';
  prevCertificationBody?: string; // 이전 인증기관명 (예: KSR인증원, 한국품질재단, BSI, DNV 등)
  prevCertNumber?: string; // 이전 인증번호
  prevCertIssueDate?: string; // 이전 인증 최초 등록일
  prevCertExpiryDate?: string; // 이전 인증 유효기간 만료일
  prevAuditDetails?: string; // 이전 심사 및 부적합(NCR) 조치 현황
  transferReason?: string; // 전환 사유 및 대체 시작 배경
  transferAttachments?: TransferAttachment[]; // 이전 심사보고서/인증서 사본 첨부파일
}

export interface TransferAttachment {
  id: string;
  name?: string;
  fileName?: string;
  size?: string;
  fileSize?: string;
  type?: string;
  fileType?: string;
  dataUrl?: string;
  fileData?: string;
  uploadedAt?: string;
}

export type AuditorAffiliation = '상근' | '비상근';
export type AuditorPayoutMethod = '세금계산서' | '원천징수';

export interface Auditor {
  id: string;
  tenantId?: string;
  gmsNumber?: string; // GMS 심사원 등록번호 (예: GMS23001)
  name: string;
  mobile: string;
  email: string;
  grade: '선임심사원' | '정심사원' | '심사원보' | '검증심사원' | '기술전문가';
  status: '활동' | '휴식' | '자격만료임박';
  originType?: '상근' | '비상근'; // 원본 DB 구분: '상근' | '비상근'
  affiliation: AuditorAffiliation; // 상근 / 비상근 구분 (4인만 상근)
  region?: string; // 소속 지역 (광역자치단체: 서울, 경기, 대구, 부산, 충남 등)
  isSystemAdmin?: boolean; // 시스템 총괄/사무국 관리자 여부 (사무국 화면 접근 권한)
  isAdmin?: boolean;
  initialPassword?: string; // 기본 초기 비밀번호 (gms9001)
  password?: string;
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

  // 규격별 상세 등급 매핑
  standardGrades?: Record<string, '선임심사원' | '정심사원' | '심사원보' | '기술전문가'>;
  
  // 인증심의위원 자격
  isCommitteeMember?: boolean;
  committeeRole?: '심의위원장' | '심의부위원장' | '심의위원' | '심의간사' | '전문심의위원';
  committeeAppointmentDate?: string;

  // 추가 프로필 상세 정보
  address?: string;
  residentialRegion?: string; // 거주지역 (예: 서울 강서구, 대구 달서구)
  birthDate?: string; // 생년월일 (YYYY-MM-DD 또는 YYMMDD)
  gender?: '남' | '여'; // 성별
  education?: string;
  major?: string;
  agency?: string;
  regDate?: string;
  telephone?: string;
  iafDetails?: { standard: string; code: string; date: string; basis: string }[];
  qualifications?: { standard: string; grade: string; agency: string; certNumber: string; expiryDate: string }[];

  // 자격증, 교육, 세미나, 경력증명서 발급 신청 이력
  certificates?: AuditorCertItem[];
  trainingHistory?: AuditorTrainingItem[];
  seminarHistory?: AuditorSeminarItem[];
  careerCertRequests?: CareerCertRequestItem[];
}

export interface AuditorCertItem {
  id: string;
  name: string; // 예: KAB ISO 9001 선임심사원 자격증
  standard: string;
  grade: string;
  certNumber: string;
  issuer: string; // 예: 한국인정지원센터(KAB)
  issueDate: string;
  expiryDate?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface AuditorTrainingItem {
  id: string;
  title: string; // 예: 2026년도 심사원 정기 보수교육 (CPD)
  year: string;
  hours: number;
  completedDate: string;
  institution: string;
  status: '이수완료' | '미이수' | '심사중';
  fileUrl?: string;
}

export interface AuditorSeminarItem {
  id: string;
  title: string; // 예: 2026 하반기 인증심사원 역량강화 직무세미나
  date: string;
  host: string;
  hours: number;
  location?: string;
  note?: string;
}

export interface CareerCertRequestItem {
  id: string;
  requestedAt: string;
  purpose: string; // 제출용도 (예: KAB 심사원 자격갱신 제출용, 기관제출용, 경력확인용)
  submitTo: string; // 제출처 (예: 한국인정지원센터(KAB), 한국생산성본부인증원)
  status: '신청대기' | '승인완료' | '반려';
  approvedAt?: string;
  approvedBy?: string; // 승인자 (사무국 관리자)
  certDocNumber?: string; // 발급번호 (예: GMS-CERT-2026-042)
  notes?: string;
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

export type AuditContractType = '신규인증' | '전환심사' | '정기사후' | '갱신심사' | '규격추가' | '인증변경' | '입회심사' | '재심사';

export interface CertChangeApplicationData {
  appliedDate: string;
  companyName?: string;
  certNumber?: string;
  dept?: string;
  contactPerson?: string;
  standards?: string[];
  headAddress?: string;
  plantAddress?: string;
  tel?: string;
  fax?: string;
  currentScope?: string;
  
  changeCategories: ('상호' | '주소' | '사업자' | '범위' | '표준' | '기타')[];
  newCompanyNameKo?: string;
  newCompanyNameEn?: string;
  newCeoName?: string;
  newManagerName?: string;
  newAddressHeadKo?: string;
  newAddressHeadEn?: string;
  newAddressPlantKo?: string;
  newAddressPlantEn?: string;
  bizChangeType?: string; // 개인사업자에서 법인사업자 등
  bizChangeCeo?: string;
  bizChangeMna?: string;
  bizChangeOther?: string;
  scopeChangeType?: '이전' | '추가' | '축소' | '기타';
  newScopeDetailsKo?: string;
  newScopeDetailsEn?: string;
  newStandardDetails?: string;
  desiredAuditDate?: string;
  attachedDocuments: string[];
  
  // 인증원 확인란
  verifyMethod?: '서류확인' | '특별사후관리심사' | '인증변경심사';
  auditDays?: string;
  auditFee?: number;
  auditorChargeName?: string;
  reviewerName?: string;
  approverName?: string;
  
  clientSignature?: string;
  afterCompanyName?: string;
  afterCeoName?: string;
  afterAddress?: string;
}

export interface WeekendAuditReasonData {
  auditDates: string;
  isWeekendOrHoliday: boolean;
  reasonCategory: '전기요금절감' | '연속가동생산' | '고객사요청' | '공정특성' | '기타';
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
  receptionType?: AuditContractType;
  standards: StandardCode[];
  addedStandards?: StandardCode[]; // 규격추가 시
  changeDetails?: string; // 인증변경 시 사유/내용
  employeeCount: number;
  previousEmployeeCount?: number;
  isEmployeeChanged?: boolean;
  employeeDiff?: number;
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
    travelExpense?: number;
    leadAuditorName?: string;
    agency?: string;
  };

  // KAB 공식 표준 MD (원칙상 조정하지 않고 준수)
  kabStandardMd: number;
  appliedMd: number; // KAB 표준 MD와 일치
  mdDecisionType?: 'KAB표준유지' | '수동조정변경';
  
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

  // 편의 별칭 (호환성)
  docFee?: number;
  siteFee?: number;
  travelFee?: number;
  lodgingFee?: number;
  appFee?: number;
  lodgingProvidedByClient?: boolean;

  standardFee: number; // KAB 표준 총액
  finalFee: number; // 5대 항목 합산 최종 계약 금액 (VAT 별도)
  
  isAdjusted: boolean;
  adjustmentReason?: string;
  approvalStatus: '승인불필요' | '승인대기' | '승인완료' | '반려';
  approvedBy?: string;
  approvedAt?: string;
  leadAuditorId: string;
  leadAuditorName: string;
  teamAuditorId?: string;
  teamAuditorName?: string;
  isHqOrStaffLead?: boolean; // 본사/상근직원 여부

  // 협력 기관 및 사전 협의
  agency?: string;
  consultant?: string;
  agencyAgreementStatus?: '협의불필요' | '협의대기' | '협의완료';
  agencyAgreementDate?: string;
  agencyAgreementBy?: string;
  agencyAgreementNote?: string;

  // 3자 발송 및 회신 상태
  plannedAuditStartDate?: string;
  plannedAuditEndDate?: string;
  contractStatus: '견적작성' | '승인요청' | '계약체결' | '계획서발송' | '심사진행중' | '계약대기' | '진행중' | '완료';
  planInvoiceDispatchStatus?: '미발송' | '발송완료' | '발송대기';
  planInvoiceDispatchedAt?: string;
  
  auditorResponseStatus?: '대기' | '확인회신' | '일정조정요청' | '동의' | '미응답';
  auditorResponseAt?: string;
  auditorResponseNote?: string;
  agencyResponseStatus?: '대기' | '확인회신' | '수수료조정요청' | '일정조정요청' | '동의' | '미응답';
  agencyResponseAt?: string;
  agencyResponseNote?: string;
  clientResponseStatus?: '대기' | '확인회신' | '일정조정요청' | '동의' | '미응답';
  clientResponseAt?: string;

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
  planInvoiceDispatchStatus?: '미발송' | '발송완료' | '발송대기';
  planInvoiceDispatchedAt?: string;
  auditorResponseStatus?: '대기' | '확인회신' | '일정조정요청' | '동의' | '미응답';
  agencyResponseStatus?: '대기' | '확인회신' | '수수료조정요청' | '일정조정요청' | '동의' | '미응답';
  clientResponseStatus?: '대기' | '확인회신' | '일정조정요청' | '동의' | '미응답';
  agencyAgreementStatus?: '협의불필요' | '협의대기' | '협의완료';
  certChangeData?: CertChangeApplicationData;
  weekendAuditData?: WeekendAuditReasonData;
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
  backupType: 'Full DB' | 'Incremental File' | 'PDF Archive' | string;
  sizeBytes: number;
  destination: '사내 주 서버 (Postgres)' | '외장 하드 디스크 (USB 3.0)' | 'NAS 오프라인 콜드보관' | string;
  status: '정상완료' | '동기화중' | '외장하드 미연결경고' | string;
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
export type { CommitteeScheduleItem } from '../utils/committeeSchedule';

// ============================================================
// OKESG 연동 대비 환경·안전 규제 DB 모델
// ============================================================
export interface CompanyEhsCompliance {
  companyId: string;
  // 안전관리자
  safetyManager: {
    appointed: boolean;
    name?: string;
    certType?: string; // 자격 종류 (산업안전기사, 산업안전산업기사 등)
    certNumber?: string;
    phone?: string;
  };
  // 대기배출시설
  airEmissionGrade: '해당없음' | '1종' | '2종' | '3종' | '4종' | '5종';
  airEmissionSubstances?: string; // 주요 배출물질
  // 수질배출시설
  waterEmissionGrade: '해당없음' | '1종' | '2종' | '3종' | '4종' | '5종';
  waterDailyVolume?: string; // 일일 배출량
  // 소방안전관리자
  fireSafetyGrade: '해당없음' | '특급' | '1급' | '2급' | '3급';
  fireSafetyManagerName?: string;
  // 유해화학물질
  toxicChemicalHandling: boolean;
  toxicChemicalDetails?: string;
  // 폐기물 배출자 신고
  wasteDischargeType: '해당없음' | '일반폐기물' | '지정폐기물';
  wasteDischargeDetails?: string;
  // 기타 인허가 사항
  otherPermits?: string;
  // 메타
  updatedAt?: string;
  updatedBy?: string;
}

// 최초심사 증빙 서류 업로드 모델
export interface ProofDocument {
  docType: string; // '사업자등록증' | '공정도' | '조직도' | '국민연금가입자명부' | '환경인허가증' | '기타'
  fileName?: string;
  fileUrl?: string;
  uploaded: boolean;
  uploadedAt?: string;
  fileSize?: number;
  verified?: boolean;
  verifiedBy?: string;
  notes?: string;
}

export interface InitialAuditProofDocuments {
  companyId: string;
  contractId: string;
  documents: ProofDocument[];
  totalRequired: number;
  totalUploaded: number;
  allVerified: boolean;
}
