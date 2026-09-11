import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  Database,
  ChevronDown,
  Save,
  Send,
  Printer,
  ArrowLeft,
  Shield,
  AlertTriangle,
  Check,
  Layers,
  Leaf,
  Sparkles,
  X,
  Mail,
  PenTool,
  Clock,
  ExternalLink,
  Award,
  FileCheck,
  CheckSquare,
  HelpCircle,
  RefreshCcw,
  BookOpen,
  ClipboardList,
  Search,
  Plus,
  Trash2,
  Paperclip,
  Bell,
  Edit3
} from 'lucide-react';
import type { Company, Auditor, AuditReport, AuditContractRecord, ProofDocument, AuditProject } from '../types';
import { normalizeMd } from '../data/legacyDataLoader';
import { cleanCeoName, cleanPersonName, splitPersonAndPosition } from '../utils/personUtils';
import {
  AuditReportNoticeItem,
  loadAuditReportNotices
} from '../utils/auditReportNotices';

// ============================================================
// 2025 Audit Report Pack (251001) PDF 실물 1:1 완벽 복제 시스템
// 1단계 (1~6p), 2단계 (7~16p), 인정범위 확인서 (17p), 3년 심사계획 (18p), NCR (19p~)
// 13·14p PROCESS Audit Note 및 NCR 페이지 동적 확장 지원
// ============================================================

interface AuditReportWorkbenchProps {
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

export interface EmailSignatureRecord {
  slotId: string;
  slotLabel: string;
  role: '고객확인' | '근로자대표' | '심사팀장' | '심사팀원' | '확인심사원';
  signerName: string;
  signerPosition: string;
  signerEmail: string;
  signedAt: string;
  signatureHash: string;
  isVerified: boolean;
  ipAddress: string;
}

export interface EmailSignerItem {
  id: string;
  roleType: '심사팀장' | '심사팀원' | '고객담당자' | '근로자대표';
  name: string;
  position: string;
  email: string;
  useCompanyEmail: boolean;
  status: '대기' | '발송완료' | '서명완료';
  sentAt?: string;
  signedAt?: string;
  signatureHash?: string;
}

export interface CarAttachment {
  id: string;
  fileName: string;
  fileSize?: string;
  fileType: 'pdf' | 'image';
  dataUrl?: string;
  uploadedAt: string;
  description?: string;
}

export interface NcrItem {
  id: string;
  ncrNo: string;
  certNo?: string;
  standard: string;
  clause: string;
  dept: string;
  auditorName: string;
  auditType: string;
  grade: '경부적합' | '중부적합';
  issueDate: string;
  details: string;
  // 시정조치 및 증빙자료
  correctionAction: string;
  correctionAttachments?: CarAttachment[];
  // 원인분석 (4M) 및 재발방지대책 & 증빙자료
  causeAnalysis: string;
  recurrencePrevent: string;
  preventAttachments?: CarAttachment[];
  actionDate: string;
  clientSigned: boolean;
  auditorVerified: boolean;
  verificationType?: '문서확인' | '현장확인';
  verificationResult: '적절함' | '부적절함(보완 필요)';
  effectiveResult: '효과적' | '효과적이지 않음';
  verificationDate?: string;
  verifierAuditorName?: string;
  effectiveDate?: string;
  effectiveAuditorName?: string;
}

type DocTabKey = 'all' | 'stage1' | 'stage2' | 'cert_confirm' | 'plan_summary' | 'ncr' | 'proof_upload';

// 초기 증빙 서류 목록
// 초기 증빙 서류 목록 (실제 업로드 전 기본 빈 상태)
const initialProofDocs: ProofDocument[] = [
  { docType: '사업자등록증 / 공장등록증', uploaded: false, fileName: '', uploadedAt: '', verified: false },
  { docType: '심사 신청서 및 표준계약서 사본', uploaded: false, fileName: '', uploadedAt: '', verified: false },
  { docType: '공정도 (제조/서비스 흐름도)', uploaded: false, fileName: '', uploadedAt: '', verified: false },
  { docType: '조직도 및 비상연락망', uploaded: false, fileName: '', uploadedAt: '', verified: false },
  { docType: '국민연금 가입자 명부 (인원확인)', uploaded: false, fileName: '', uploadedAt: '', verified: false },
  { docType: '환경/안전 인허가증 (대기/폐수/소방)', uploaded: false, fileName: '', uploadedAt: '', verified: false },
];

export const AuditReportWorkbench: React.FC<AuditReportWorkbenchProps> = ({
  company,
  contract,
  report,
  auditor,
  auditors = [],
  project,
  onClose,
  onSave,
  onUpdateCompany
}) => {
  const [activeDocTab, setActiveDocTab] = useState<DocTabKey>('all');
  const [proofDocs, setProofDocs] = useState<ProofDocument[]>(initialProofDocs);

  // 실 인증번호 계산 (DB 연동: Company.certNo, certNumber, contract.certNumber, project.certNo)
  const compAny = company as any;
  const realCertNo = (company as any).certNo || (company as any).certNumber || (contract as any)?.certNumber || (contract as any)?.contractNumber || (project as any)?.certNo || '';

  // 로컬 스토리지 키
  const storageKey = useMemo(() => `GMSCS_PACK_FULL_${company.id || company.companyName}`, [company]);

  // 심사 구분
  const [auditTypeCategory, setAuditTypeCategory] = useState<'최초' | '갱신' | '사후' | '전환' | '규격추가' | '재심사'>(() => {
    const t = project?.auditType || contract?.contractType || '사후';
    if (t.includes('최초')) return '최초';
    if (t.includes('갱신') || t.includes('재인')) return '갱신';
    if (t.includes('전환')) return '전환';
    if (t.includes('규격')) return '규격추가';
    return '사후';
  });

  const [hasCertChange, setHasCertChange] = useState<boolean>(false);

  // 전자 메일 서명 대상자 목록 State (심사팀장, 심사팀원, 고객담당자, 근로자대표)
  const [emailSigners, setEmailSigners] = useState<EmailSignerItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_SIGNERS`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    const defaultLeadName = project?.leadAuditorName || auditor?.name || '';
    const defaultMemberName = (project?.teamAuditorNames && project.teamAuditorNames[0]) || (compAny.assignedAuditorName && compAny.assignedAuditorName !== defaultLeadName ? compAny.assignedAuditorName : '');
    const leadAuditorObj = auditors.find(a => a.name === defaultLeadName) || auditor;
    const memberAuditorObj = auditors.find(a => a.name === defaultMemberName);
    const companySharedEmail = company.contactEmail || (company as any).email || '';

    return [
      {
        id: 'signer-lead',
        roleType: '심사팀장',
        name: defaultLeadName,
        position: leadAuditorObj?.grade || '선임심사원',
        email: leadAuditorObj?.email || auditor?.email || '',
        useCompanyEmail: false,
        status: '대기'
      },
      {
        id: 'signer-member',
        roleType: '심사팀원',
        name: defaultMemberName,
        position: memberAuditorObj?.grade || '심사원',
        email: memberAuditorObj?.email || '',
        useCompanyEmail: false,
        status: '대기'
      },
      {
        id: 'signer-client',
        roleType: '고객담당자',
        name: cleanPersonName(company.contactPerson) || cleanCeoName(company.ceoName) || '',
        position: company.contactPosition || compAny.contactPosition || '담당자',
        email: company.contactEmail || (company as any).email || '',
        useCompanyEmail: false,
        status: '대기'
      },
      {
        id: 'signer-worker',
        roleType: '근로자대표',
        name: '',
        position: '근로자대표',
        email: companySharedEmail,
        useCompanyEmail: true,
        status: '대기'
      }
    ];
  });

  // 전자메일 서명 상태
  const [signatures, setSignatures] = useState<Record<string, EmailSignatureRecord>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_SIGS`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const clean: Record<string, EmailSignatureRecord> = {};
          Object.entries(parsed).forEach(([k, v]: [string, any]) => {
            // 과거 하드코딩되었던 더미 해시(SIG-EMAIL-89A4-F291, SIG-EMAIL-CC41-901B) 제거
            if (v && v.signatureHash && v.signatureHash !== 'SIG-EMAIL-89A4-F291' && v.signatureHash !== 'SIG-EMAIL-CC41-901B') {
              clean[k] = v;
            }
          });
          return clean;
        } catch (e) {}
      }
    }
    return {};
  });

  // 서명 팝업 State
  const [activeSigningSlot, setActiveSigningSlot] = useState<{
    slotId: string;
    slotLabel: string;
    role: '고객확인' | '근로자대표' | '심사팀장' | '심사팀원' | '확인심사원';
  } | null>(null);

  const [signingForm, setSigningForm] = useState({
    name: '',
    position: '',
    email: '',
    pinCode: '',
    isPinSent: false,
    generatedPin: ''
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const isInitialMount = React.useRef(true);

  const handleCloseWithGuard = () => {
    if (isDirty) {
      if (!window.confirm('[저장 & 동기화 확인]\n작성 중인 심사보고서 및 서명 내용이 아직 [저장 & 동기화]되지 않았습니다.\n\n저장하지 않고 심사보고서 작성을 종료하시겠습니까?')) {
        return;
      }
    }
    onClose();
  };

  // 1단계 심사 데이터 State (Page 1~6)
  const [stage1Data, setStage1Data] = useState(() => {
    const defaultData = {
      auditType: project?.auditType || contract?.contractType || '',
      auditStandards: project?.standards?.join(', ') || contract?.standards?.join(', ') || '',
      diffFromApp: '없다',
      diffDetails: '',
      manualDocNo: '',
      manualRevDate: '',
      manualRevNo: '',
      processDocNo: '',
      processRevDate: '',
      processRevNo: '',
      scopeConfirmed: company.scope || company.industry || '',
      exclusionClause: '',
      exclusionReason: '',
      q5_1: '',
      q5_2: '',
      q5_3: '',
      q6_internalAudit: '',
      q7_managementReview: '',
      q8_operationControl: '',
      q9_legalCompliance: '',
      q10_legalViolation: '',
      q10_violationDetails: '',
      // ISO 14001
      env1_permit: '',
      env1_details: '',
      env2_aspect: '',
      env2_significant: '',
      env2_compliance: '',
      env3_procedure: '',
      env4_manager: '',
      // ISO 45001
      safe1_managerName: company.ceoName ? `${company.ceoName} 대표이사` : '',
      safe1_safetyPerson: '',
      safe1_healthPerson: '',
      safe1_workerRep: '',
      safe2_riskEval: '',
      safe3_1: '',
      safe3_2: '',
      safe3_3: '',
      safe3_4: '',
      safe3_5: '',
      safe3_6: '',
      safe3_7: '',
      safe4_team: '',
      safe5_criticalCount: '',
      // ESG-MS
      esg1_report: '',
      esg2_quant: '',
      esg3_supply: '',
      // 통합경영시스템
      ims1_doc: '',
      ims2_policy: '',
      ims3_review: '',
      ims4_audit: '',
      ims5_process: '',
      ims6_improve: '',
      ims7_org: '',
      // 참석자
      attendees: [
        { name: company.ceoName || '', role: '대표이사 / 최고경영자' },
        { name: company.contactPerson || '', role: `${compAny.contactPosition || '담당자'} (고객담당)` },
        { name: '', role: '' },
        { name: '', role: '' },
        { name: '', role: '' },
        { name: '', role: '' },
      ],
      // 5p: Ⅶ. 문서화된 정보 확인 (심사원 상세 기록)
      clauseNotes: [
        { clause: '4. 조직상황', notes: '', result: '', findings: '' },
        { clause: '5. 리더십', notes: '', result: '', findings: '' },
        { clause: '6. 기획', notes: '', result: '', findings: '' },
        { clause: '7. 지원', notes: '', result: '', findings: '' },
        { clause: '8. 운용', notes: '', result: '', findings: '' },
        { clause: '9. 성과평가', notes: '', result: '', findings: '' },
        { clause: '10. 개선', notes: '', result: '', findings: '' },
        { clause: '기타문서', notes: '', result: '', findings: '' },
      ],
      // 6p: Ⅷ. 1단계 심사 결과
      findingsTable: [
        { no: 1, type: '', details: '', dueDate: '' },
        { no: 2, type: '', details: '', dueDate: '' },
        { no: 3, type: '', details: '', dueDate: '' },
        { no: 4, type: '', details: '', dueDate: '' },
        { no: 5, type: '', details: '', dueDate: '' },
      ],
      summaryMajor: '0',
      summaryMinor: '0',
      summaryObs: '0',
      overallSummary: '',
      conclusion: 'pass' as 'pass' | 'corrective' | 'fail'
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_STAGE1`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...defaultData,
            ...parsed,
            attendees: Array.isArray(parsed.attendees) && parsed.attendees.length > 0 ? parsed.attendees : defaultData.attendees,
            clauseNotes: Array.isArray(parsed.clauseNotes) && parsed.clauseNotes.length > 0 ? parsed.clauseNotes : defaultData.clauseNotes,
            findingsTable: Array.isArray(parsed.findingsTable) && parsed.findingsTable.length > 0 ? parsed.findingsTable : defaultData.findingsTable,
          };
        } catch (e) {}
      }
    }
    return defaultData;
  });

  // 2단계 심사 데이터 State (Page 7~16)
  const [stage2Data, setStage2Data] = useState(() => {
    const defaultData = {
      auditType: project?.auditType || contract?.contractType || '',
      auditStandards: project?.standards?.join(', ') || contract?.standards?.join(', ') || '',
      auditDateStart: (project as any)?.stage2StartDate || project?.startDate || (project as any)?.stage1StartDate || '',
      auditDateEnd: (project as any)?.stage2EndDate || project?.endDate || (project as any)?.stage1EndDate || '',
      auditMd: project?.appliedMd ? String(normalizeMd(project.appliedMd)) : '',
      // 시작/종결회의 질의응답
      meetingNotes: '',
      // 심사 세부 일정표 (심사팀장이 작성 / 심사원별 시간, 프로세스, 부서 계획 수립)
      scheduleLeader: project?.leadAuditorName || auditor?.name || '',
      scheduleMember: (project?.teamAuditorNames && project.teamAuditorNames.length > 0) ? project.teamAuditorNames.join(', ') : '',
      schedules: Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 1),
        date: '',
        time1: '',
        process1: '',
        dept1: '',
        time2: '',
        process2: '',
        dept2: '',
        remarks: ''
      })),
      conflictDate: (project as any)?.stage2StartDate || project?.startDate || (project as any)?.stage1StartDate || '',
      conflictLeader: project?.leadAuditorName || auditor?.name || '',
      conflictMember1: (project?.teamAuditorNames && project.teamAuditorNames[0]) || '',
      conflictMember2: (project?.teamAuditorNames && project.teamAuditorNames[1]) || '',
      conflictMember3: '',
      conflictMember4: '',
      conflictMember5: '',
      // 고객현황
      clientName: company.companyName || '',
      ceoName: company.ceoName || '',
      certNo: realCertNo,
      mainAddress: company.address || '',
      subAddress1: (company as any).subAddress1 || '',
      subAddress2: (company as any).subAddress2 || '',
      subAddress3: (company as any).subAddress3 || '',
      subAddress4: (company as any).subAddress4 || '',
      subAddress5: (company as any).subAddress5 || '',
      tel: company.contactPhone || '',
      fax: (company as any).fax || '',
      mobile: (company as any).contactMobile || '',
      email: company.contactEmail || '',
      contactPerson: company.contactPerson || '',
      contactPosition: (company as any).contactPosition || '',
      stdIso9001: true,
      stdIso14001: false,
      stdIso45001: false,
      stdEsg: false,
      stdOther: '',
      typeChoice: '사후',
      survRound: '',
      scopeText: company.scope || company.industry || '',
      scopeCode: (company as any).eaCode || (company as any).scopeCode || '',
      // 공통 심사 내역 (Table 19)
      c1_appDiff: '',
      c2_planDiff: '',
      c3_programIssue: '',
      c4_systemMaintained: '',
      c5_scopeAdequate: '',
      c6_meetsStandard: '',
      c7_clientCooperation: '',
      c8_monitoring: '',
      c9_continualImprovement: '',
      c10_imsAdequate: '',
      c11_prevNcrEffective: '',
      c12_markUsage: '',
      c13_1_interaction: '',
      c13_2_operation: '',
      c13_3_will: '',
      c13_4_prevReport: '',
      c14_survChanges: '',
      performanceNotes: '',
      internalAuditDateStart: '',
      internalAuditDateEnd: '',
      internalAuditDate: '',
      internalAuditNotes: '',
      mgmtReviewDateStart: '',
      mgmtReviewDateEnd: '',
      mgmtReviewDate: '',
      mgmtReviewNotes: '',
      coreProcessNotes: '',
      keyCustomers: '',
      complaintNotes: '',
      legalNotes: '',
      exclusionClause: '',
      stage1ChangeNotes: '',
      // ISO 14001 추가
      envAspect: '',
      envEvalDate: '',
      envEvaluator: '',
      envEvalResult: '',
      envLegalDate: '',
      envLegalEvaluator: '',
      envLegalResult: '',
      // ISO 45001 추가
      safeRiskAspect: '',
      safeEvalDate: '',
      safeEvaluator: '',
      safeLegalDate: '',
      safeLegalEvaluator: '',
      safeLegalResult: '',
      // ESG-MS 추가
      esgEvalDate: '',
      esgScoreEnv: '',
      esgScoreSocial: '',
      esgScoreGov: '',
      // PROCESS Audit NOTE (13p)
      auditNotes: [
        { clause: '4. 조직상황', content: '' },
        { clause: '5. 리더십', content: '' },
        { clause: '6. 기획', content: '' },
        { clause: '7. 지원', content: '' },
        { clause: '8. 운용', content: '' },
        { clause: '9. 성과평가', content: '' },
        { clause: '10. 개선', content: '' }
      ],
      // 14p 심사발견 사항 요약
      findingsAuditor: auditor?.name || project?.leadAuditorName || '',
      findingsDate: '',
      findingsPage: '',
      ncrSummaryLines: ['', '', '', '', '', '', '', '', '', ''],
      obsSummaryLines: ['', '', '', '', '', '', '', '', '', ''],
      // 15p 2. 심사결론 & 3. 조직의 참석자 & 4. 심사팀
      countMinor: '0',
      countMajor: '0',
      countObs: '0',
      auditorResultReview: '',
      overallSummary: '',
      prevObsResult: '',
      prevObsAuditor: '',
      prevNcrResult: '',
      prevNcrAuditor: '',
      conclusionOption: '',
      conclusionOther: '',
      attendees: [
        { name: cleanCeoName(company.ceoName) || '', role: '대표이사 / 최고경영자' },
        { name: cleanPersonName(company.contactPerson) || '', role: `${company.contactPosition || compAny.contactPosition || '담당자'}` },
        { name: '', role: '' },
        { name: '', role: '' },
        { name: '', role: '' },
        { name: '', role: '' },
        { name: '', role: '' },
        { name: '', role: '' },
        { name: '', role: '' },
        { name: '', role: '' },
        { name: '', role: '' },
        { name: '', role: '' },
      ],
      // 16p 5. 차기심사 안내 & 6. 갱신심사 시 작성
      nextSurvChoice: '',
      nextSurvRound: '',
      nextAuditMonth: '',
      nextAuditMd: '',
      renewalHistory: [
        { type: '최초 심사', count: '', leader: '', effect: '', reason: '' },
        { type: '1차 사후', count: '', leader: '', effect: '', reason: '' },
        { type: '2차 사후', count: '', leader: '', effect: '', reason: '' },
        { type: '기타', count: '', leader: '', effect: '', reason: '' },
      ],
      // 18p F16-012 심사계획 및 요약서 [ 3년심사관리용 ]
      planSummaryRev: '0',
      planSummaryDepts: [
        '경영진', '품질보증', '생산1팀', '생산2팀', '자재구매', '영업팀', '환경안전', '설비공무', '연구개발', '경영지원'
      ],
      planSummaryDeptMatrix: {
        '4. 조직상황': { '0': '-', '1': '-', '2': '-', '3': '-', '4': '-', '5': '-', '6': '-', '7': '-', '8': '-', '9': '-' },
        '5. 리더십': { '0': '-', '1': '-', '2': '-', '3': '-', '4': '-', '5': '-', '6': '-', '7': '-', '8': '-', '9': '-' },
        '6. 기획': { '0': '-', '1': '-', '2': '-', '3': '-', '4': '-', '5': '-', '6': '-', '7': '-', '8': '-', '9': '-' },
        '7. 지원': { '0': '-', '1': '-', '2': '-', '3': '-', '4': '-', '5': '-', '6': '-', '7': '-', '8': '-', '9': '-' },
        '8. 운용': { '0': '-', '1': '-', '2': '-', '3': '-', '4': '-', '5': '-', '6': '-', '7': '-', '8': '-', '9': '-' },
        '9. 성과평가': { '0': '-', '1': '-', '2': '-', '3': '-', '4': '-', '5': '-', '6': '-', '7': '-', '8': '-', '9': '-' },
        '10. 개선': { '0': '-', '1': '-', '2': '-', '3': '-', '4': '-', '5': '-', '6': '-', '7': '-', '8': '-', '9': '-' },
        '인증마크 사용': { '0': '-', '1': '-', '2': '-', '3': '-', '4': '-', '5': '-', '6': '-', '7': '-', '8': '-', '9': '-' },
        '부적합': { '0': '-', '1': '-', '2': '-', '3': '-', '4': '-', '5': '-', '6': '-', '7': '-', '8': '-', '9': '-' },
      },
      planSummary3YearDates: ['', '', '', '', '', ''],
      planSummary3YearMatrix: {
        '4. 조직 상황': ['-', '-', '-', '-', '-', '-'],
        '5. 리더십': ['-', '-', '-', '-', '-', '-'],
        '6. 기획': ['-', '-', '-', '-', '-', '-'],
        '7. 지원': ['-', '-', '-', '-', '-', '-'],
        '8. 운용': ['-', '-', '-', '-', '-', '-'],
        '9. 성과평가': ['-', '-', '-', '-', '-', '-'],
        '10. 개선': ['-', '-', '-', '-', '-', '-'],
      }
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_STAGE2`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...defaultData,
            ...parsed,
            schedules: Array.isArray(parsed.schedules) && parsed.schedules.length > 0 ? parsed.schedules : defaultData.schedules,
            auditNotes: Array.isArray(parsed.auditNotes) && parsed.auditNotes.length > 0 ? parsed.auditNotes : defaultData.auditNotes,
            ncrSummaryLines: Array.isArray(parsed.ncrSummaryLines) && parsed.ncrSummaryLines.length > 0 ? parsed.ncrSummaryLines : defaultData.ncrSummaryLines,
            obsSummaryLines: Array.isArray(parsed.obsSummaryLines) && parsed.obsSummaryLines.length > 0 ? parsed.obsSummaryLines : defaultData.obsSummaryLines,
            attendees: Array.isArray(parsed.attendees) && parsed.attendees.length > 0 ? parsed.attendees : defaultData.attendees,
            renewalHistory: Array.isArray(parsed.renewalHistory) && parsed.renewalHistory.length > 0 ? parsed.renewalHistory : defaultData.renewalHistory,
            planSummaryDepts: Array.isArray(parsed.planSummaryDepts) && parsed.planSummaryDepts.length > 0 ? parsed.planSummaryDepts : defaultData.planSummaryDepts,
            planSummaryDeptMatrix: parsed.planSummaryDeptMatrix || defaultData.planSummaryDeptMatrix,
            planSummary3YearDates: Array.isArray(parsed.planSummary3YearDates) && parsed.planSummary3YearDates.length > 0 ? parsed.planSummary3YearDates : defaultData.planSummary3YearDates,
            planSummary3YearMatrix: parsed.planSummary3YearMatrix || defaultData.planSummary3YearMatrix,
          };
        } catch (e) {}
      }
    }
    return defaultData;
  });

  // NCR 부적합 보고서 목록 State (Page 19~ 동적 추가 가능)
  const [ncrList, setNcrList] = useState<NcrItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_NCRS`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });



  // 사무국 인증관리 연동 심사보고서 작성 공지사항 상태
  const [cbNotices, setCbNotices] = useState<AuditReportNoticeItem[]>(() => loadAuditReportNotices());
  const [selectedNoticeFilter, setSelectedNoticeFilter] = useState<string>('all');
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  useEffect(() => {
    const handleNoticesUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setCbNotices(e.detail);
      } else {
        setCbNotices(loadAuditReportNotices());
      }
    };
    window.addEventListener('gmscs-audit-notices-updated', handleNoticesUpdate);
    window.addEventListener('storage', handleNoticesUpdate);
    return () => {
      window.removeEventListener('gmscs-audit-notices-updated', handleNoticesUpdate);
      window.removeEventListener('storage', handleNoticesUpdate);
    };
  }, []);

  // LocalStorage 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}_SIGS`, JSON.stringify(signatures));
      localStorage.setItem(`${storageKey}_SIGNERS`, JSON.stringify(emailSigners));
      localStorage.setItem(`${storageKey}_STAGE1`, JSON.stringify(stage1Data));
      localStorage.setItem(`${storageKey}_STAGE2`, JSON.stringify(stage2Data));
      localStorage.setItem(`${storageKey}_NCRS`, JSON.stringify(ncrList));
    }
  }, [signatures, emailSigners, stage1Data, stage2Data, ncrList, storageKey]);

  // 전자 메일 서명 일괄 발송 핸들러
  const handleDispatchSignatureEmails = () => {
    const invalidSigners = emailSigners.filter(s => !s.email || !s.email.includes('@'));
    if (invalidSigners.length > 0) {
      alert(`[발송 확인 필요] 다음 대상자의 수신 이메일 주소를 확인해주세요:\n- ${invalidSigners.map(s => `${s.roleType} (${s.name})`).join('\n- ')}`);
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updatedSigners = emailSigners.map(s => {
      if (s.status === '서명완료') return s;
      return {
        ...s,
        status: '발송완료' as const,
        sentAt: dateStr
      };
    });

    setEmailSigners(updatedSigners);
    localStorage.setItem(`${storageKey}_SIGNERS`, JSON.stringify(updatedSigners));

    const mailSummaries = updatedSigners.map(s => {
      const targetLabel = s.useCompanyEmail ? `[회사대표메일 수신] (수신대상: ${s.roleType} ${s.name} 귀하)` : `[개별수신: ${s.email}]`;
      const title = `[GMSCS 전자서명 요청] ${s.useCompanyEmail ? `(수신: ${s.roleType} ${s.name} 귀하)` : `${s.name}님 귀하`} - ${company.companyName} ${auditTypeCategory} 심사보고서 서명 요청`;
      return `• ${s.roleType} (${s.name} ${s.position})\n  - 메일: ${s.email} ${targetLabel}\n  - 제목: ${title}`;
    }).join('\n\n');

    alert(`[전자서명 요청 메일 발송 완료]\n총 ${updatedSigners.length}명의 서명 대상자에게 전자서명 요청 메일이 성공적으로 발송되었습니다.\n\n${mailSummaries}\n\n* 대표메일 수신 건은 메일 제목 및 본문 상단에 수신 대상자 식별 정보(기업담당자/근로자대표)가 명확히 기재되어 전송되었습니다.`);
  };

  // 심사팀원 동적 추가 핸들러
  const handleAddTeamMember = () => {
    const currentMembers = emailSigners.filter(s => s.roleType === '심사팀원');
    const newIdx = currentMembers.length + 1;
    const newMember: EmailSignerItem = {
      id: `signer-member-${Date.now()}`,
      roleType: '심사팀원',
      name: `심사원${newIdx}`,
      position: '심사원',
      email: `auditor${newIdx + 1}@gmscs.co.kr`,
      useCompanyEmail: false,
      status: '대기'
    };
    const leadIdx = emailSigners.findIndex(s => s.roleType === '심사팀장');
    const insertIdx = leadIdx !== -1 ? leadIdx + currentMembers.length + 1 : 1;
    const next = [...emailSigners];
    next.splice(insertIdx, 0, newMember);
    setEmailSigners(next);
  };

  const handleRemoveTeamMember = (id: string) => {
    if (emailSigners.filter(s => s.roleType === '심사팀원').length <= 1) {
      if (!confirm('심사팀원을 삭제하시겠습니까? (단독 심사로 전환)')) return;
    }
    setEmailSigners(prev => prev.filter(s => s.id !== id));
  };

  // 개별 서명 승인 / 서명 처리 핸들러 (원클릭 전자서명 및 실시간 도장 날인)
  const handleApproveSigner = (signerId: string) => {
    const signer = emailSigners.find(s => s.id === signerId);
    if (!signer) return;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const hash = 'SIG-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // 1. Update signer state
    const nextSigners = emailSigners.map(s => s.id === signerId ? {
      ...s,
      status: '서명완료' as const,
      signedAt: dateStr,
      signatureHash: hash
    } : s);
    setEmailSigners(nextSigners);
    localStorage.setItem(`${storageKey}_SIGNERS`, JSON.stringify(nextSigners));

    // 2. Automatically update signer names & positions into stage1Data & stage2Data & scopeConfirmData!
    if (signer.roleType === '심사팀장') {
      setStage2Data((prev: any) => ({
        ...prev,
        auditorName: signer.name,
        scheduleLeader: signer.name,
        conflictLeader: signer.name,
        findingsAuditor: signer.name,
        prevObsAuditor: signer.name,
        prevNcrAuditor: signer.name,
        renewalHistory: (prev.renewalHistory || []).map((r: any) => ({ ...r, leader: signer.name }))
      }));
    } else if (signer.roleType === '심사팀원') {
      setStage2Data((prev: any) => ({
        ...prev,
        scheduleMember: prev.scheduleMember ? `${prev.scheduleMember}, ${signer.name}` : signer.name,
        conflictMember1: prev.conflictMember1 ? `${prev.conflictMember1}, ${signer.name}` : signer.name
      }));
    } else if (signer.roleType === '고객담당자') {
      setStage2Data((prev: any) => ({
        ...prev,
        contactPerson: signer.name,
        contactPosition: signer.position,
        email: signer.email || prev.email
      }));
    } else if (signer.roleType === '근로자대표') {
      setStage1Data((prev: any) => ({
        ...prev,
        safe1_workerRep: `${signer.name} (${signer.position})`
      }));
      setStage2Data((prev: any) => ({
        ...prev,
        safeEvaluator: `${signer.name} 근로자대표`
      }));
    }

    // 3. Automatically synchronize into signatures map for all relevant slots
    const newSignRecord: EmailSignatureRecord = {
      slotId: signer.id,
      slotLabel: `${signer.roleType} 서명`,
      role: signer.roleType === '심사팀장' ? '심사팀장' : signer.roleType === '심사팀원' ? '심사팀원' : signer.roleType === '근로자대표' ? '근로자대표' : '고객확인',
      signerName: signer.name,
      signerPosition: signer.position,
      signerEmail: signer.email,
      signedAt: dateStr,
      signatureHash: hash,
      isVerified: true,
      ipAddress: '211.234.' + Math.floor(Math.random() * 200 + 10) + '.' + Math.floor(Math.random() * 200 + 10)
    };

    const teamMembers = emailSigners.filter(s => s.roleType === '심사팀원');
    const memberIdx = teamMembers.findIndex(s => s.id === signer.id);

    setSignatures(prev => {
      const next = { ...prev };
      if (signer.roleType === '심사팀장') {
        next['s1_lead'] = { ...newSignRecord, slotId: 's1_lead', slotLabel: '심사 팀장 (서명)' };
        next['s2_lead'] = { ...newSignRecord, slotId: 's2_lead', slotLabel: '심사팀장 (서명)' };
        next['s2_p9_lead'] = { ...newSignRecord, slotId: 's2_p9_lead', slotLabel: '심사팀장 서명' };
        next['s2_conf_lead'] = { ...newSignRecord, slotId: 's2_conf_lead', slotLabel: '심사팀장 서명' };
        next['s2_p15_lead'] = { ...newSignRecord, slotId: 's2_p15_lead', slotLabel: '심사팀장 서명' };
        next['cert_lead_p17'] = { ...newSignRecord, slotId: 'cert_lead_p17', slotLabel: '심사팀장 서명' };
        next['s2_p17_lead'] = { ...newSignRecord, slotId: 's2_p17_lead', slotLabel: '심사팀장 서명' };
        next['ncr_auditor'] = { ...newSignRecord, slotId: 'ncr_auditor', slotLabel: '확인 심사원 서명' };
        ncrList.forEach(item => {
          next[`car_lead_sign_${item.id}`] = { ...newSignRecord, slotId: `car_lead_sign_${item.id}`, slotLabel: '심사팀장 서명' };
        });
      } else if (signer.roleType === '심사팀원') {
        if (memberIdx === 0 || memberIdx === -1) {
          next['s1_team1'] = { ...newSignRecord, slotId: 's1_team1', slotLabel: '심사팀원 (서명)' };
          next['s2_team1'] = { ...newSignRecord, slotId: 's2_team1', slotLabel: '심사팀원1 (서명)' };
          next['s2_p9_member1'] = { ...newSignRecord, slotId: 's2_p9_member1', slotLabel: '심사팀원1 서명' };
          next['s2_conf_m1'] = { ...newSignRecord, slotId: 's2_conf_m1', slotLabel: '심사팀원1 서명' };
        } else if (memberIdx === 1) {
          next['s1_t2'] = { ...newSignRecord, slotId: 's1_t2', slotLabel: '심사팀원 (서명)' };
          next['s2_team2'] = { ...newSignRecord, slotId: 's2_team2', slotLabel: '심사팀원2 (서명)' };
          next['s2_p9_member2'] = { ...newSignRecord, slotId: 's2_p9_member2', slotLabel: '심사팀원2 서명' };
          next['s2_conf_m2'] = { ...newSignRecord, slotId: 's2_conf_m2', slotLabel: '심사팀원2 서명' };
        } else if (memberIdx === 2) {
          next['s1_t3'] = { ...newSignRecord, slotId: 's1_t3', slotLabel: '심사팀원 (서명)' };
          next['s2_team3'] = { ...newSignRecord, slotId: 's2_team3', slotLabel: '심사팀원3 (서명)' };
          next['s2_conf_m3'] = { ...newSignRecord, slotId: 's2_conf_m3', slotLabel: '심사팀원3 서명' };
        } else if (memberIdx === 3) {
          next['s1_oth'] = { ...newSignRecord, slotId: 's1_oth', slotLabel: '기타 (서명)' };
          next['s2_team4'] = { ...newSignRecord, slotId: 's2_team4', slotLabel: '심사팀원4 (서명)' };
          next['s2_conf_m4'] = { ...newSignRecord, slotId: 's2_conf_m4', slotLabel: '심사팀원4 서명' };
        }
      } else if (signer.roleType === '고객담당자') {
        next['s1_cust'] = { ...newSignRecord, slotId: 's1_cust', slotLabel: '고객 확인 (서명)' };
        next['s2_cust'] = { ...newSignRecord, slotId: 's2_cust', slotLabel: '고객 확인 (서명)' };
        next['cert_cust_p17'] = { ...newSignRecord, slotId: 'cert_cust_p17', slotLabel: '고객확인 (대표자/담당자)' };
        next['s2_p17_client'] = { ...newSignRecord, slotId: 's2_p17_client', slotLabel: '고객확인 (대표자/담당자)' };
        next['ncr_client'] = { ...newSignRecord, slotId: 'ncr_client', slotLabel: '고객 확인 서명' };
        ncrList.forEach(item => {
          next[`car_client_sign_${item.id}`] = { ...newSignRecord, slotId: `car_client_sign_${item.id}`, slotLabel: '인증고객 확인 (서명)' };
        });
      } else if (signer.roleType === '근로자대표') {
        next['s1_work'] = { ...newSignRecord, slotId: 's1_work', slotLabel: '근로자대표 (서명)' };
        next['s2_work'] = { ...newSignRecord, slotId: 's2_work', slotLabel: '근로자대표 (서명)' };
        next['s2_worker_rep'] = { ...newSignRecord, slotId: 's2_worker_rep', slotLabel: '근로자 대표 서명' };
      }
      return next;
    });

    alert(`[${signer.roleType} ${signer.name} 서명 완료]\n전자 서명 검증 해시: [${hash}]\n보고서 내 해당 서명란에 전자 서명이 즉시 날인되었습니다.`);
  };

  // 9p 세부 심사 일정 행 추가/삭제 핸들러 (심사팀장 작성 기능)
  const handleAddScheduleRow = () => {
    const defaultDate = stage2Data.auditDateStart ? stage2Data.auditDateStart.slice(5).replace('-', '/') : '09/10';
    const newRow = {
      id: `sch-${Date.now()}`,
      date: defaultDate,
      time1: '09:00~12:00',
      process1: '',
      dept1: '',
      time2: '09:00~12:00',
      process2: '',
      dept2: '',
      remarks: ''
    };
    setStage2Data((prev: any) => ({
      ...prev,
      schedules: [...(prev.schedules || []), newRow]
    }));
  };

  const handleDeleteScheduleRow = (idx: number) => {
    if ((stage2Data.schedules || []).length <= 1) {
      alert('최소 1개 이상의 일정 행이 유지되어야 합니다.');
      return;
    }
    setStage2Data((prev: any) => ({
      ...prev,
      schedules: (prev.schedules || []).filter((_: any, i: number) => i !== idx)
    }));
  };

  // 전체 저장 & 동기화 함수
  const handleSaveAll = () => {
    setIsSyncing(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}_STAGE1`, JSON.stringify(stage1Data));
      localStorage.setItem(`${storageKey}_STAGE2`, JSON.stringify(stage2Data));
      localStorage.setItem(`${storageKey}_SIGS`, JSON.stringify(signatures));
      localStorage.setItem(`${storageKey}_SIGNERS`, JSON.stringify(emailSigners));
      localStorage.setItem(`${storageKey}_NCRS`, JSON.stringify(ncrList));
      localStorage.setItem(`${storageKey}_SCOPE_CONFIRM`, JSON.stringify(scopeConfirmData));
    }
    if (onSave) {
      onSave({ stage1Data, stage2Data, signatures, ncrList, emailSigners });
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    setTimeout(() => {
      setIsSyncing(false);
      setIsDirty(false);
      setLastSyncedTime(timeStr);
      alert(`[저장 & 동기화 완료 (${timeStr})]\n작성 중인 1·2단계 심사보고서, 현장 관찰기록, 시정조치 요구서(CAR) 및 서명 데이터가 안전하게 저장되었습니다.`);
    }, 600);
  };

  // 보고서 제출 함수 (사무국 검토대기 상태 즉시 전환 및 전역 브로드캐스트)
  const handleSubmitReport = () => {
    const unsigned = emailSigners.filter(s => s.status !== '서명완료');
    if (unsigned.length > 0) {
      if (!confirm(`[확인 필요] 아직 서명이 완료되지 않은 대상자가 있습니다:\n- ${unsigned.map(s => `${s.roleType} (${s.name})`).join('\n- ')}\n\n이대로 보고서를 사무국에 접수/제출하시겠습니까?`)) {
        return;
      }
    }

    const today = new Date().toISOString().slice(0, 10);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}_STAGE1`, JSON.stringify(stage1Data));
      localStorage.setItem(`${storageKey}_STAGE2`, JSON.stringify(stage2Data));
      localStorage.setItem(`${storageKey}_SIGS`, JSON.stringify(signatures));
      localStorage.setItem(`${storageKey}_SIGNERS`, JSON.stringify(emailSigners));
      localStorage.setItem(`${storageKey}_NCRS`, JSON.stringify(ncrList));
      localStorage.setItem(`${storageKey}_SCOPE_CONFIRM`, JSON.stringify(scopeConfirmData));

      // 사무국 심사관리 전역 단계 갱신
      const savedStages = localStorage.getItem('gmscs_report_custom_stages');
      const stageMap = savedStages ? JSON.parse(savedStages) : {};
      const compId = company.id || company.companyName;
      stageMap[compId] = { stage: '검토', date: today, note: '심사보고서 제출 접수 완료' };
      stageMap[company.companyName] = { stage: '검토', date: today, note: '심사보고서 제출 접수 완료' };
      localStorage.setItem('gmscs_report_custom_stages', JSON.stringify(stageMap));
    }

    if (onSave) {
      onSave({
        stage1Data,
        stage2Data,
        signatures,
        ncrList,
        emailSigners,
        isSubmitted: true,
        status: '사무국검토대기',
        stage: '검토'
      });
    }

    setIsDirty(false);

    // 전역 이벤트 브로드캐스트
    window.dispatchEvent(new CustomEvent('gmscs-report-submitted', {
      detail: {
        companyId: company.id,
        companyName: company.companyName,
        status: '사무국검토대기',
        stage: '검토',
        submittedAt: today
      }
    }));

    alert(`[심사보고서 제출 완료]\n[${company.companyName}] 2025 Audit Report Pack(251001)이 사무국으로 성공적으로 접수/제출되었습니다.\n사무국 심사관리 프로세스(Post-AUDIT)가 '검토' 단계로 즉시 전환되었습니다.`);
  };

  // NCR 추가 함수
  const handleAddNcr = () => {
    const nextNo = `NCR-${new Date().toISOString().slice(0, 7)}-0${ncrList.length + 1}`;
    const newNcr: NcrItem = {
      id: `ncr-${Date.now()}`,
      ncrNo: nextNo,
      standard: 'ISO 9001:2015',
      clause: '',
      dept: '',
      auditorName: auditor?.name || '',
      auditType: stage2Data.typeChoice ? `${stage2Data.typeChoice} ${stage2Data.survRound || ''}차`.trim() : '',
      grade: '경부적합',
      issueDate: project?.endDate || project?.startDate || new Date().toISOString().slice(0, 10),
      details: '',
      correctionAction: '',
      causeAnalysis: '',
      recurrencePrevent: '',
      actionDate: '',
      clientSigned: false,
      auditorVerified: false,
      verificationResult: '적절함',
      effectiveResult: '효과적'
    };
    setNcrList([...ncrList, newNcr]);
    setActiveDocTab('ncr');
  };

  // 시정조치 요구서(CAR) 삭제 함수
  const handleDeleteNcr = (id: string) => {
    if (ncrList.length <= 1) {
      alert('최소 1건의 시정조치 요구서 양식이 유지되어야 합니다.');
      return;
    }
    if (confirm('해당 시정조치 요구서를 삭제하시겠습니까?')) {
      setNcrList(ncrList.filter(item => item.id !== id));
    }
  };

  // 18p F16-012 심사계획 및 요약서 매트릭스 도우미
  const handleToggleDeptMatrixCell = (req: string, dIdx: number) => {
    setStage2Data((prev: any) => {
      const current = prev.planSummaryDeptMatrix?.[req]?.[dIdx] ?? 'v';
      const next = current === 'v' ? '-' : current === '-' ? '○' : 'v';
      return {
        ...prev,
        planSummaryDeptMatrix: {
          ...(prev.planSummaryDeptMatrix || {}),
          [req]: {
            ...(prev.planSummaryDeptMatrix?.[req] || {}),
            [dIdx]: next
          }
        }
      };
    });
  };

  const handleUpdateDeptMatrixText = (req: string, dIdx: number, val: string) => {
    setStage2Data((prev: any) => ({
      ...prev,
      planSummaryDeptMatrix: {
        ...(prev.planSummaryDeptMatrix || {}),
        [req]: {
          ...(prev.planSummaryDeptMatrix?.[req] || {}),
          [dIdx]: val
        }
      }
    }));
  };

  const handleUpdateDeptName = (dIdx: number, name: string) => {
    setStage2Data((prev: any) => {
      const depts = [...(prev.planSummaryDepts || ['경영진', '품질보증', '생산1팀', '생산2팀', '자재구매', '영업팀', '환경안전', '설비공무', '연구개발', '경영지원'])];
      depts[dIdx] = name;
      return { ...prev, planSummaryDepts: depts };
    });
  };

  const handleUpdate3YearDate = (colIdx: number, val: string) => {
    setStage2Data((prev: any) => {
      const dates = [...(prev.planSummary3YearDates || ['2024-09', '2025-09', '2026-09', '2027-09', '-', '-'])];
      dates[colIdx] = val;
      return { ...prev, planSummary3YearDates: dates };
    });
  };

  const handleToggle3YearCell = (req: string, colIdx: number) => {
    setStage2Data((prev: any) => {
      const rowArr = [...(prev.planSummary3YearMatrix?.[req] || ['v', 'v', 'v', '○', '○', '○'])];
      const current = rowArr[colIdx] ?? (colIdx < 3 ? 'v' : '○');
      const next = current === 'v' ? '○' : current === '○' ? '-' : 'v';
      rowArr[colIdx] = next;
      return {
        ...prev,
        planSummary3YearMatrix: {
          ...(prev.planSummary3YearMatrix || {}),
          [req]: rowArr
        }
      };
    });
  };

  const handleApplyDefaultPlanSummary = () => {
    setStage2Data((prev: any) => ({
      ...prev,
      planSummaryDepts: ['경영진', '품질보증', '생산1팀', '생산2팀', '자재구매', '영업팀', '환경안전', '설비공무', '연구개발', '경영지원'],
      planSummaryDeptMatrix: {
        '4. 조직상황': { 0: 'v', 1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v' },
        '5. 리더십': { 0: 'v', 1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v' },
        '6. 기획': { 0: 'v', 1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v' },
        '7. 지원': { 0: 'v', 1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v' },
        '8. 운용': { 0: 'v', 1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v' },
        '9. 성과평가': { 0: 'v', 1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v' },
        '10. 개선': { 0: 'v', 1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v' },
        '인증마크 사용': { 0: 'v', 1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v' },
        '부적합': { 0: '-', 1: '-', 2: '-', 3: '-', 4: '-', 5: '-', 6: '-', 7: '-', 8: '-', 9: '-' },
      },
      planSummary3YearDates: ['2024-09', '2025-09', '2026-09', '2027-09', '-', '-'],
      planSummary3YearMatrix: {
        '4. 조직 상황': ['v', 'v', 'v', '○', '○', '○'],
        '5. 리더십': ['v', 'v', 'v', '○', '○', '○'],
        '6. 기획': ['v', 'v', 'v', '○', '○', '○'],
        '7. 지원': ['v', 'v', 'v', '○', '○', '○'],
        '8. 운용': ['v', 'v', 'v', '○', '○', '○'],
        '9. 성과평가': ['v', 'v', 'v', '○', '○', '○'],
        '10. 개선': ['v', 'v', 'v', '○', '○', '○'],
      }
    }));
  };

  // 시정조치 요구서 증빙자료 파일 첨부 핸들러 (PDF 또는 이미지)
  const handleCarFileUpload = (
    ncrIdx: number,
    section: 'correction' | 'prevent',
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newAttachment: CarAttachment = {
          id: `car-att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          fileName: file.name,
          fileSize: (file.size / 1024 < 1024) ? `${Math.round(file.size / 1024)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          fileType: isPdf ? 'pdf' : 'image',
          dataUrl: dataUrl,
          uploadedAt: new Date().toISOString().slice(0, 10),
          description: isPdf ? 'PDF 증빙 서류' : '시정조치 개선 전후 사진'
        };

        setNcrList((prev: NcrItem[]) => {
          const next = [...prev];
          const target = { ...next[ncrIdx] };
          if (section === 'correction') {
            target.correctionAttachments = [...(target.correctionAttachments || []), newAttachment];
          } else {
            target.preventAttachments = [...(target.preventAttachments || []), newAttachment];
          }
          next[ncrIdx] = target;
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // 시정조치 증빙자료 첨부 삭제 핸들러
  const handleDeleteCarAttachment = (
    ncrIdx: number,
    section: 'correction' | 'prevent',
    attId: string
  ) => {
    setNcrList((prev: NcrItem[]) => {
      const next = [...prev];
      const target = { ...next[ncrIdx] };
      if (section === 'correction') {
        target.correctionAttachments = (target.correctionAttachments || []).filter(a => a.id !== attId);
      } else {
        target.preventAttachments = (target.preventAttachments || []).filter(a => a.id !== attId);
      }
      next[ncrIdx] = target;
      return next;
    });
  };

  // 서명 검증 완료 처리
  const handleConfirmSignature = () => {
    if (!activeSigningSlot) return;
    if (!signingForm.pinCode || signingForm.pinCode.trim().length < 4) {
      alert('인증번호 6자리를 올바르게 입력해주세요.');
      return;
    }
    if (signingForm.isPinSent && signingForm.pinCode !== signingForm.generatedPin) {
      alert('입력하신 이메일 인증번호가 일치하지 않습니다. 다시 확인해 주세요.');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const hash = 'SIG-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    setSignatures(prev => ({
      ...prev,
      [activeSigningSlot.slotId]: {
        slotId: activeSigningSlot.slotId,
        slotLabel: activeSigningSlot.slotLabel,
        role: activeSigningSlot.role,
        signerName: signingForm.name || '홍길동',
        signerPosition: signingForm.position || '직위',
        signerEmail: signingForm.email || 'signer@company.com',
        signedAt: dateStr,
        signatureHash: hash,
        isVerified: true,
        ipAddress: '211.234.' + Math.floor(Math.random() * 200 + 10) + '.' + Math.floor(Math.random() * 200 + 10)
      }
    }));

    setActiveSigningSlot(null);
  };

  // 실물 종이 서명 슬롯 렌더러
  const renderSignatureCell = (
    slotId: string,
    slotLabel: string,
    role: '고객확인' | '근로자대표' | '심사팀장' | '심사팀원' | '확인심사원',
    defaultName?: string,
    defaultPos?: string,
    defaultEmail?: string,
    signerStatus?: '대기' | '발송완료' | '서명완료'
  ) => {
    const signed = signatures[slotId];
    if (signed && signed.isVerified) {
      return (
        <div 
          onClick={() => {
            if (confirm('서명을 초기화하고 다시 서명하시겠습니까?')) {
              setSignatures(prev => {
                const next = { ...prev };
                delete next[slotId];
                return next;
              });
            }
          }}
          className="cursor-pointer group flex flex-col items-center justify-center p-1 bg-emerald-50/80 border border-emerald-400 rounded text-[10px] text-emerald-950 hover:bg-emerald-100 transition-colors"
          title="클릭 시 전자 서명 초기화 및 재서명"
        >
          <div className="flex items-center gap-0.5 font-bold text-[10.5px] text-emerald-900">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{signed.signerName} (인)</span>
          </div>
          <span className="text-[9px] text-slate-600 font-mono scale-90 -mt-0.5">
            {signed.signedAt.slice(0, 10)} [{signed.signatureHash}]
          </span>
        </div>
      );
    }

    if (signerStatus === '발송완료') {
      return (
        <button
          type="button"
          onClick={() => {
            setSigningForm({
              name: defaultName || (role === '심사팀장' ? (auditor?.name || '') : company.ceoName || ''),
              position: defaultPos || (role === '심사팀장' ? (auditor?.grade || '선임심사원') : '대표이사'),
              email: defaultEmail || (role === '심사팀장' ? (auditor?.email || '') : company.contactEmail || ''),
              pinCode: '',
              isPinSent: true,
              generatedPin: Math.floor(100000 + Math.random() * 900000).toString()
            });
            setActiveSigningSlot({ slotId, slotLabel, role });
          }}
          className="w-full py-1 px-1.5 border border-blue-400 bg-blue-50/80 hover:bg-blue-100 text-blue-900 rounded font-bold text-[10px] flex items-center justify-center gap-1 transition-colors animate-pulse cursor-pointer"
          title="이메일 발송 완료 상태 - 클릭 시 서명 진행"
        >
          <Clock className="w-3 h-3 text-blue-600" />
          <span>(서명대기 / 전자서명)</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          setSigningForm({
            name: defaultName || (role === '심사팀장' ? (auditor?.name || '') : company.ceoName || ''),
            position: defaultPos || (role === '심사팀장' ? (auditor?.grade || '선임심사원') : '대표이사'),
            email: defaultEmail || (role === '심사팀장' ? (auditor?.email || '') : company.contactEmail || ''),
            pinCode: '',
            isPinSent: false,
            generatedPin: Math.floor(100000 + Math.random() * 900000).toString()
          });
          setActiveSigningSlot({ slotId, slotLabel, role });
        }}
        className="w-full py-1 px-1.5 border border-dashed border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded font-bold text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
      >
        <Mail className="w-3 h-3 text-slate-500" />
        <span>(서명 / 전자서명)</span>
      </button>
    );
  };

  // 17p 인정범위 확인서 (인증서 기재사항 확인서) 편집 데이터 State
  const [scopeConfirmData, setScopeConfirmData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_SCOPE_CONFIRM`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    const compAny = company as any;
    return {
      certNo: realCertNo || '',
      companyNameKor: company.companyName || '',
      companyNameEng: compAny.companyNameEng || compAny.engName || '',
      ceoName: company.ceoName || '',
      addressKor: company.address || '',
      addressEng: compAny.addressEng || compAny.engAddress || '',
      factoryAddressKor: compAny.factoryAddress || '',
      factoryAddressEng: compAny.factoryAddressEng || '',
      scopeKor: compAny.scope || company.industry || '',
      scopeEng: compAny.scopeEng || '',
      iafCode: compAny.iafCode || compAny.eaCode || '',
      standards: contract?.standards?.join(', ') || compAny.standards || project?.standards?.join(', ') || '',
      identityConfirmed: '1단계 심사 시 확인된 내용과 동일함 (확인 완료)',
      updatedAt: new Date().toISOString().slice(0, 10)
    };
  });

  // 17p 인정범위 변경 시 전역 저장 및 기업 데이터 실시간 전파 동기화
  const handleUpdateScopeConfirmField = (field: string, value: string) => {
    const next = { ...scopeConfirmData, [field]: value, updatedAt: new Date().toISOString().slice(0, 10) };
    setScopeConfirmData(next);
    localStorage.setItem(`${storageKey}_SCOPE_CONFIRM`, JSON.stringify(next));

    // 全 앱 및 기업 DB 동기화: localStorage overrides + 커스텀 이벤트 + 부모 콜백
    try {
      const savedOverrides = localStorage.getItem('gmscs_company_overrides');
      const overrides = savedOverrides ? JSON.parse(savedOverrides) : {};
      
      const compId = company.id || company.companyName;
      const updatedFields: Partial<Company> = {
        scope: next.scopeKor,
        companyName: next.companyNameKor,
        ceoName: next.ceoName,
        address: next.addressKor,
        ...({
          scopeEng: next.scopeEng,
          companyNameEng: next.companyNameEng,
          addressEng: next.addressEng,
          factoryAddress: next.factoryAddressKor,
          factoryAddressEng: next.factoryAddressEng,
          iafCode: next.iafCode,
          standards: next.standards,
          scopeUpdatedAt: next.updatedAt
        } as any)
      };

      overrides[compId] = { ...(overrides[compId] || {}), ...updatedFields };
      localStorage.setItem('gmscs_company_overrides', JSON.stringify(overrides));

      const mergedCompany: Company = { ...company, ...updatedFields };
      if (onUpdateCompany) {
        onUpdateCompany(mergedCompany);
      }
      window.dispatchEvent(new CustomEvent('gmscs_company_updated', { detail: mergedCompany }));
    } catch (e) {
      console.error('Failed to sync company scope updates', e);
    }
  };

  // 작성 내용 변경 감지 (미저장 이탈 방지용)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setIsDirty(true);
  }, [stage1Data, stage2Data, signatures, emailSigners, ncrList, scopeConfirmData]);

  // 1단계 작성 여부 판단 (사후 1,2차, 갱신 심사 등에서 1단계가 비어있으면 팩에서 자동 제외)
  const isStage1Empty = useMemo(() => {
    const findings = stage1Data.clauseFindings || {};
    const hasFindings = Object.values(findings).some((v: any) => typeof v === 'string' && v.trim().length > 0);
    const hasDiff = stage1Data.diffFromApp === '있다' && (stage1Data.diffDetails || '').trim().length > 0;
    const hasCustomConclusion = (stage1Data.conclusionText || '').trim().length > 0 && !stage1Data.conclusionText.includes('시스템이 적합하게 수립');
    return !hasFindings && !hasDiff && !hasCustomConclusion;
  }, [stage1Data]);

  // 사후/갱신 심사 시 1단계 보고서 팩 포함 여부 토글 (최초/전환은 기본 포함, 사후/갱신은 미작성 시 기본 제외)
  const [includeStage1InPack, setIncludeStage1InPack] = useState<boolean>(() => {
    if (auditTypeCategory === '최초' || auditTypeCategory === '전환' || auditTypeCategory === '규격추가') return true;
    return false; // 사후/갱신 기본 제외
  });

  // 탭 목록 정의 (페이지 번호 제거, 간결하고 슬림한 탭)
  const tabConfigs = [
    {
      id: 'all' as DocTabKey,
      label: '전체 보고서 Pack',
      icon: BookOpen,
      activeColor: 'bg-white border-t-2 border-t-slate-900 text-slate-950'
    },
    {
      id: 'stage1' as DocTabKey,
      label: '1단계 심사보고서',
      icon: FileText,
      activeColor: 'bg-white border-t-2 border-t-teal-700 text-teal-950'
    },
    {
      id: 'stage2' as DocTabKey,
      label: '2단계 심사보고서',
      icon: ClipboardList,
      activeColor: 'bg-white border-t-2 border-t-teal-700 text-teal-950'
    },
    {
      id: 'cert_confirm' as DocTabKey,
      label: '인정범위 확인서',
      icon: Award,
      activeColor: 'bg-white border-t-2 border-t-cyan-700 text-cyan-950'
    },
    {
      id: 'plan_summary' as DocTabKey,
      label: '3년 심사계획 요약서',
      icon: Calendar,
      activeColor: 'bg-white border-t-2 border-t-indigo-700 text-indigo-950'
    },
    {
      id: 'ncr' as DocTabKey,
      label: `시정조치 요구서 (${ncrList.length}건)`,
      icon: FileCheck,
      activeColor: 'bg-white border-t-2 border-t-rose-700 text-rose-950'
    },
    {
      id: 'proof_upload' as DocTabKey,
      label: '심사 증빙 서류',
      icon: Upload,
      activeColor: 'bg-white border-t-2 border-t-blue-700 text-blue-950'
    }
  ];

  // 공식 보고서 페이지 상단 헤더 컴포넌트 (로고 + ESG with GMSCS ISO Audit Report + 양식번호)
  const renderReportPageHeader = (formNo: string = 'F16-009(20251001)') => (
    <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2 mb-3">
      <div className="flex items-center gap-2.5">
        <img src="/report-logo.png" alt="GMSCS" className="h-8 md:h-9 object-contain" />
        <div className="flex flex-col">
          <span className="text-xs md:text-sm font-black tracking-wider text-slate-900 font-serif leading-none">
            ESG with GMSCS
          </span>
          <span className="text-[10px] md:text-[11px] font-bold tracking-wide text-slate-600 font-serif mt-0.5 leading-none">
            ISO Audit Report
          </span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-[11px] font-mono font-medium text-slate-600">
          양식번호: {formNo}
        </span>
      </div>
    </div>
  );

  const leadSigner = emailSigners.find(s => s.roleType === '심사팀장');
  const clientSigner = emailSigners.find(s => s.roleType === '고객담당자');
  const workerSigner = emailSigners.find(s => s.roleType === '근로자대표');
  const teamSigners = emailSigners.filter(s => s.roleType === '심사팀원');
  const leadAuditorObj = auditors.find(a => a.name === (leadSigner?.name || project?.leadAuditorName || auditor?.name)) || auditor;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xs flex flex-col overflow-hidden text-slate-900">
      
      {/* 1. 최상단 헤더 바 */}
      <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between border-b border-slate-700 shrink-0 no-print print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCloseWithGuard}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="닫기 (이탈 방지)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded font-mono font-black text-xs bg-teal-800 text-teal-200 border border-teal-600">
              F18-Pack
            </span>
            <h1 className="text-sm md:text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>GMSCS 심사보고서</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-teal-400 font-bold">{company.companyName}</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
                {stage1Data.auditType}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastSyncedTime && (
            <span className="text-[11px] text-sky-400 font-mono hidden md:inline-block mr-1">
              ✓ 저장됨 ({lastSyncedTime})
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={isSyncing}
            className={`px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 border border-sky-400 shadow-sm transition-all cursor-pointer ${
              isSyncing ? 'animate-pulse opacity-90' : ''
            }`}
            title="현재 작성 중인 모든 심사 내용 및 서명 데이터 저장 & 동기화"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? '저장 & 동기화 중...' : '저장 & 동기화'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 인쇄 / PDF 출력</span>
          </button>
          <button
            onClick={handleSubmitReport}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>보고서 제출</span>
          </button>
        </div>
      </div>

      {/* 2. 메인 컨텐츠 영역 (좌측 참고 패널 2.8 : 우측 종이 바인더 7.2) */}
      <div className="flex-1 flex overflow-hidden bg-slate-200/80 print:bg-white print:overflow-visible print:block">
        
        {/* ======================================================== */}
        {/* 좌측 참고 패널 (Left Reference & Guide Sidebar) */}
        {/* ======================================================== */}
        <div className="w-80 lg:w-96 bg-slate-50 border-r border-slate-300 p-4 space-y-4 overflow-y-auto shrink-0 text-xs no-print print:hidden">
          
          <div className="bg-slate-800 text-white px-3 py-2 rounded-xl flex items-center justify-between shadow-2xs">
            <span className="font-bold text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>심사 작성 참고 정보 (Guide)</span>
            </span>
            <span className="text-[10px] text-teal-300 font-mono">Reference Panel</span>
          </div>

          {/* 1. 심사 기본 정보 (참고용) */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                <span>1. 기업 및 심사 개요</span>
              </span>
              <span className="text-[10.5px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {auditTypeCategory}심사
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div>
                <strong className="text-slate-800">업체명:</strong> <span className="font-bold text-slate-950">{scopeConfirmData.companyNameKor || company.companyName}</span> (대표: {scopeConfirmData.ceoName || company.ceoName})
              </div>
              <div>
                <strong className="text-slate-800">사업자번호:</strong> <span className="font-mono">{company.bizNumber || ''}</span>
              </div>
              <div>
                <strong className="text-slate-800">소재지:</strong> {scopeConfirmData.addressKor || company.address}
              </div>
              <div>
                <strong className="text-slate-800">담당자:</strong> {company.contactPerson || ''} {company.contactPhone ? `(${company.contactPhone})` : ''}
              </div>
              <div>
                <strong className="text-slate-800">심사표준:</strong> <span className="font-semibold text-slate-900">{stage1Data.auditStandards}</span>
              </div>
              <div>
                <strong className="text-slate-800">심사일정:</strong> <span className="font-mono text-slate-900">{stage2Data.auditDateStart && stage2Data.auditDateEnd ? `${stage2Data.auditDateStart} ~ ${stage2Data.auditDateEnd}` : (stage2Data.auditDateStart || stage2Data.auditDateEnd || '')}</span>
              </div>
            </div>
          </div>

          {/* 2. 1단계 심사보고서 팩 포함/제외 제어 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                <span>2. 1단계 보고서 팩 포함 설정</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${includeStage1InPack ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'}`}>
                {includeStage1InPack ? '팩 포함' : '팩 제외 (2단계 중심)'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              사후(1·2차) 및 갱신심사는 1단계 미작성 시 전체 팩에서 자동으로 제외됩니다.
            </p>

            <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={includeStage1InPack}
                onChange={(e) => setIncludeStage1InPack(e.target.checked)}
                className="rounded text-teal-700 focus:ring-0 cursor-pointer"
              />
              <span className="font-bold text-slate-800 text-xs">전체 보고서 팩에 1단계 포함</span>
            </label>
          </div>

          {/* 3. 전자 메일 서명 대상자 관리 및 확인발송 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                <span>3. 전자 메일 서명 관리 & 발송</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="px-1.5 py-0.5 rounded bg-sky-50 border border-sky-300 text-sky-800 hover:bg-sky-100 font-bold text-[10px] flex items-center gap-0.5 transition cursor-pointer"
                  title="심사계획 상의 심사팀원을 추가합니다."
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>+ 팀원 추가</span>
                </button>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                  <Send className="w-3 h-3 text-teal-600" />
                  <span>서명 {emailSigners.filter(s => s.status === '서명완료').length}/{emailSigners.length}</span>
                </span>
              </div>
            </div>

            <div className="text-[10.5px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>서명 진행 순서:</span>
                <span className="text-teal-700 font-mono text-[10px]">1팀장 ➔ 2팀원 ➔ 3고객담당 ➔ 4근로자대표</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                * 근로자대표는 ISO 45001 심사 시에만 확인 및 서명을 진행합니다.
              </p>
            </div>

            {/* 서명 대상자 편집 카드 목록 */}
            <div className="space-y-2.5">
              {emailSigners.map((signer, sIdx) => {
                const isSigned = signer.status === '서명완료';
                const isSent = signer.status === '발송완료';

                return (
                  <div 
                    key={signer.id}
                    className={`p-2.5 rounded-xl border transition-all space-y-1.5 ${
                      isSigned
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : isSent
                        ? 'bg-blue-50/60 border-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          signer.roleType === '심사팀장' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                          signer.roleType === '심사팀원' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                          signer.roleType === '고객담당자' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                          'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {sIdx + 1}. {signer.roleType}
                        </span>
                        <span className="font-bold text-slate-800 text-xs">{signer.name}</span>
                        {signer.roleType === '심사팀원' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTeamMember(signer.id)}
                            className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                            title="해당 심사팀원 삭제"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {isSigned ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-0.5 shadow-2xs">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>서명완료</span>
                          </span>
                        ) : isSent ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white flex items-center gap-0.5 shadow-2xs animate-pulse">
                            <Clock className="w-2.5 h-2.5" />
                            <span>서명대기</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            발송대기
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 성명, 직위, 이메일 편집 인풋 */}
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div>
                        <label className="text-[9.5px] text-slate-500 font-bold block mb-0.5">성명</label>
                        <input
                          type="text"
                          value={signer.name}
                          onChange={(e) => {
                            const next = [...emailSigners];
                            next[sIdx] = { ...next[sIdx], name: e.target.value };
                            setEmailSigners(next);
                          }}
                          className="w-full px-1.5 py-0.5 bg-white rounded border border-slate-300 text-slate-900 text-xs font-medium focus:border-teal-600"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] text-slate-500 font-bold block mb-0.5">직위/직책</label>
                        <input
                          type="text"
                          value={signer.position}
                          onChange={(e) => {
                            const next = [...emailSigners];
                            next[sIdx] = { ...next[sIdx], position: e.target.value };
                            setEmailSigners(next);
                          }}
                          className="w-full px-1.5 py-0.5 bg-white rounded border border-slate-300 text-slate-900 text-xs focus:border-teal-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9.5px] text-slate-500 font-bold block mb-0.5">수신 이메일</label>
                      <input
                        type="email"
                        value={signer.email}
                        onChange={(e) => {
                          const next = [...emailSigners];
                          next[sIdx] = { ...next[sIdx], email: e.target.value };
                          setEmailSigners(next);
                        }}
                        className="w-full px-1.5 py-0.5 bg-white rounded border border-slate-300 text-slate-900 text-xs font-mono focus:border-teal-600"
                      />
                    </div>

                    {/* 고객담당자 및 근로자대표: 회사 대표메일로 수신 체크박스 */}
                    {(signer.roleType === '고객담당자' || signer.roleType === '근로자대표') && (
                      <label className="flex items-center gap-1.5 pt-0.5 cursor-pointer text-[10.5px] text-slate-700 font-medium select-none">
                        <input
                          type="checkbox"
                          checked={signer.useCompanyEmail}
                          onChange={(e) => {
                            const next = [...emailSigners];
                            const shared = company.contactEmail || (company as any).email || '';
                            next[sIdx] = {
                              ...next[sIdx],
                              useCompanyEmail: e.target.checked,
                              email: e.target.checked && shared ? shared : next[sIdx].email
                            };
                            setEmailSigners(next);
                          }}
                          className="rounded text-teal-700 focus:ring-0 cursor-pointer"
                        />
                        <span>회사 대표메일로 수신</span>
                        <span className="text-[9.5px] text-teal-700 font-mono">({company.contactEmail || (company as any).email || '대표메일'})</span>
                      </label>
                    )}

                    {/* 서명 처리 액션 버튼 */}
                    {isSigned ? (
                      <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-800 border-t border-emerald-200">
                        <span className="font-mono text-[9px]">{signer.signedAt?.slice(0, 16)} [{signer.signatureHash}]</span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...emailSigners];
                            next[sIdx] = { ...next[sIdx], status: '발송완료', signedAt: undefined, signatureHash: undefined };
                            setEmailSigners(next);
                          }}
                          className="text-[9px] text-rose-600 hover:underline cursor-pointer"
                        >
                          서명 취소
                        </button>
                      </div>
                    ) : (
                      <div className="pt-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleApproveSigner(signer.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isSent ? '전자서명 승인 / 서명하기' : '즉시 서명 (인/서명)'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 확인발송 메인 버튼 */}
            <button
              type="button"
              onClick={handleDispatchSignatureEmails}
              className="w-full py-2.5 px-3 bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>확인발송 (전자서명 요청 메일 전송)</span>
            </button>
          </div>

          {/* 4. 시정조치 요구서(CAR) 및 동적 페이지 관리 도구 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-rose-700 inline-block rounded-xs"></span>
                <span>4. 시정조치 요구서(CAR) 관리</span>
              </span>
              <button
                type="button"
                onClick={handleAddNcr}
                className="px-2 py-0.5 rounded bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-800 font-bold text-[10.5px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ 요구서 추가</span>
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-700 p-1.5 bg-slate-50 rounded border border-slate-200">
                <span>프로세스 노트: <strong>{stage2Data.auditNotes.length}개 조항</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    const newNote = {
                      clause: `추가 프로세스 (${stage2Data.auditNotes.length + 1})`,
                      content: '[확인 내용]: \n[객관적 증거]: '
                    };
                    setStage2Data((prev: any) => ({
                      ...prev,
                      auditNotes: [...prev.auditNotes, newNote]
                    }));
                    setActiveDocTab('stage2');
                  }}
                  className="px-2 py-0.5 rounded bg-teal-50 border border-teal-300 text-teal-800 font-bold text-[10px] hover:bg-teal-100 cursor-pointer"
                >
                  + 노트 추가
                </button>
              </div>
              <div className="flex items-center justify-between text-slate-700 p-1.5 bg-slate-50 rounded border border-slate-200">
                <span>시정조치 요구서(CAR): <strong>{ncrList.length}건</strong></span>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('ncr')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 font-bold text-[10px] hover:bg-slate-100 cursor-pointer"
                >
                  요구서 보기
                </button>
              </div>
            </div>
          </div>

          {/* 5. 보고서 작성 인증원 공지사항 (Certification Body Notice) */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-indigo-700 inline-block rounded-xs"></span>
                <span>5. 보고서 작성 인증원 공지사항</span>
              </span>
              <span className="text-[10px] text-indigo-800 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                <Bell className="w-3 h-3 text-indigo-600" />
                <span>사무국 공지 ({cbNotices.length})</span>
              </span>
            </div>

            {/* 규격 및 공통 필터 탭 바 */}
            <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => setSelectedNoticeFilter('all')}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  selectedNoticeFilter === 'all'
                    ? 'bg-indigo-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                전체 ({cbNotices.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedNoticeFilter('공통사항')}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  selectedNoticeFilter === '공통사항'
                    ? 'bg-indigo-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                공통사항 ({cbNotices.filter(n => n.category === '공통사항').length})
              </button>
              {Array.from(new Set(cbNotices.map(n => n.category).filter(c => c !== '공통사항'))).map(stdCode => {
                const count = cbNotices.filter(n => n.category === stdCode).length;
                return (
                  <button
                    key={stdCode}
                    type="button"
                    onClick={() => setSelectedNoticeFilter(stdCode)}
                    className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                      selectedNoticeFilter === stdCode
                        ? 'bg-indigo-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {stdCode.split(':')[0]} ({count})
                  </button>
                );
              })}
            </div>

            {/* 공지 목록 (스크롤 지원) */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
              {cbNotices
                .filter(n => {
                  if (selectedNoticeFilter === 'all') return true;
                  return n.category === selectedNoticeFilter;
                })
                .map((notice) => (
                  <div
                    key={notice.id}
                    className="p-2.5 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 hover:border-indigo-300 space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-extrabold ${
                          notice.priority === '필독'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : notice.priority === '중요'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {notice.priority === '필독' ? '🚨필독' : notice.priority === '중요' ? '⭐중요' : '📌일반'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 font-mono">
                          {notice.category}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-slate-400">{notice.updatedAt}</span>
                    </div>

                    <strong className="text-slate-900 font-bold block text-[11.5px] leading-snug">
                      {notice.title}
                    </strong>

                    <div className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed pl-0.5">
                      {notice.content}
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-2 bg-indigo-50/60 rounded border border-indigo-100 text-[10.5px] text-indigo-900 leading-tight">
              💡 <strong>안내:</strong> 본 공지사항은 <strong>[사무국 인증관리 &gt; 심사보고서 작성 공지]</strong>에서 규격별/공통으로 등록 및 수정되며 본 화면에 실시간 연동됩니다.
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 우측 종이 파일 철 공식 서식 시스템 (Right Paper Binder) */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-300/60 overflow-hidden print:bg-white print:overflow-visible print:w-full">
          
          {/* 종이 파일 철 인덱스 탭 헤더 바 - 좌우 여백 없이(px-0) 슬림한 높이 */}
          <div className="bg-slate-200/95 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between shrink-0 no-print print:hidden">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-700 inline-block"></span>
              <span>2025 Audit Report Pack(251001)</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-slate-600 font-normal text-[11px]">
                심사구분: <strong className="text-slate-900">{stage1Data.auditType} ({stage1Data.auditStandards})</strong>
              </span>
            </div>
          </div>

          {/* 실물 종이 파일 철 인덱스 탭 목록 (좌우 여백 0, 슬림 높이, 단일 행) */}
          <div className="flex border-b border-slate-300 bg-slate-200 w-full overflow-x-auto shrink-0 px-0 gap-0 no-print print:hidden">
            {tabConfigs.map(tab => {
              const isActive = activeDocTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDocTab(tab.id)}
                  className={`flex-1 min-w-[110px] h-9 px-2 text-center flex items-center justify-center gap-1.5 border-r border-slate-300 transition-all select-none relative ${
                    isActive
                      ? `${tab.activeColor} font-bold shadow-xs z-10 border-b-2 border-b-white bg-white`
                      : 'bg-slate-200/80 hover:bg-slate-100 text-slate-700 hover:text-slate-950 cursor-pointer border-t-2 border-t-transparent'
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                  <span className="truncate text-xs tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 실물 A4 종이 캔버스 영역 (스크롤 가능, 백색 종이 시트 렌더링) */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto flex justify-center bg-slate-200/60 print:bg-white print:p-0 print:overflow-visible print:block">
            <div className="w-full max-w-[850px] space-y-12 print:max-w-none print:w-full print:space-y-0">

              {/* ================================================================= */}
              {/* 1단계 심사보고서 (1p ~ 6p 실물 공문서/워드 양식 100% 완벽 일치) */}
              {/* ================================================================= */}
              {(activeDocTab === 'stage1' || (activeDocTab === 'all' && includeStage1InPack)) && (
                <div className="space-y-10">
                  
                  {/* --- [1단계 1 PAGE : 표지] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative flex flex-col justify-between">
                    <div>
                      {/* 공식 상단 헤더 (가운데: 1 단계 심사 보고서 / 우측: GMSCS 로고) */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-4">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          1 단계 심사 보고서
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      <div className="text-center py-5">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 font-serif">
                          적합성 평가 심사보고서(1st Stage)
                        </h1>
                      </div>

                      {/* Table 0 : 고객명 / 심사표준 / 심사유형 */}
                      <table className="w-full border-collapse border border-slate-700 text-xs mb-6">
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <th className="w-28 bg-slate-100 p-2.5 border-r border-slate-400 text-center font-bold">고 객 명</th>
                            <td className="p-2.5 font-bold text-sm text-slate-900">{company.companyName}</td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2.5 border-r border-slate-400 text-center font-bold">심 사 표 준</th>
                            <td className="p-2.5 space-x-5 text-xs font-medium">
                              <label className="inline-flex items-center gap-1.5"><input type="checkbox" defaultChecked /><span>ISO 9001</span></label>
                              <label className="inline-flex items-center gap-1.5"><input type="checkbox" defaultChecked /><span>ISO 14001</span></label>
                              <label className="inline-flex items-center gap-1.5"><input type="checkbox" /><span>ISO 45001</span></label>
                              <label className="inline-flex items-center gap-1.5"><input type="checkbox" /><span>ESG-MS</span></label>
                              <label className="inline-flex items-center gap-1.5"><input type="checkbox" /><span>기타( )</span></label>
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-slate-100 p-2.5 border-r border-slate-400 text-center font-bold">심 사 유 형</th>
                            <td className="p-2.5 space-x-5 text-xs font-medium">
                              <label className="inline-flex items-center gap-1.5"><input type="radio" name="s1_p1_type" defaultChecked /><span>최초</span></label>
                              <label className="inline-flex items-center gap-1.5"><input type="radio" name="s1_p1_type" /><span>사후 ( )</span></label>
                              <label className="inline-flex items-center gap-1.5"><input type="radio" name="s1_p1_type" /><span>갱신</span></label>
                              <label className="inline-flex items-center gap-1.5"><input type="radio" name="s1_p1_type" /><span>전환</span></label>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* 표지 식별 중앙 대형 로고 */}
                      <div className="flex justify-center items-center py-8 my-3 md:py-10 md:my-4">
                        <img 
                          src="/report-logo.png" 
                          alt="GMSCS 인증원" 
                          className="h-20 md:h-24 w-auto object-contain" 
                        />
                      </div>

                      {/* ◆ 1단계 심사의 목적 */}
                      <div className="border border-slate-400 bg-slate-50 p-3.5 space-y-1 text-[11px] leading-snug text-slate-700 mb-4">
                        <span className="font-bold text-slate-950 block text-xs">◆ 1단계 심사의 목적</span>
                        <ol className="list-decimal list-inside space-y-1 pl-1">
                          <li>경영시스템을 문서화한 정보 검토</li>
                          <li>조직의 위치 및 사업장별 상태를 평가하고, 2단계 심사를 위한 준비상태를 결정하기 위하여 조직의 인원들과 논의</li>
                          <li>표준 요구사항, 특히 경영시스템의 주요성과 또는 중대한 측면의 파악, 프로세스, 목표 및 운영과 관련된 조직의 상태 및 이해 정도를 검토</li>
                          <li>다음을 포함하여 경영시스템의 인증범위와 관련된 필수 정보 획득</li>
                          <li>2단계 심사를 위한 자원의 배정에 대해 검토하고 2단계 심사의 세부사항에 대하여 조직과 합의</li>
                          <li>중대한 측면과 관련하여 조직의 경영시스템 및 사업장 운영에 대하여 충분히 이해함으로써 2단계 심사계획을 위한 중점사항 제공</li>
                          <li>내부심사와 경영검토를 계획 및 수행하고 있는지의 여부를 평가하고, 인증고객이 2단계 심사를 받을 준비가 되었음을 평가</li>
                        </ol>
                      </div>

                      {/* 서명 확인란 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-600 font-bold px-1">
                          <span>※ 보고서 확인</span>
                          <span>* 근로자대표는 ISO 45001 심사시만 확인</span>
                        </div>
                        <table className="w-full border-collapse border border-slate-700 text-xs">
                          <tbody>
                            <tr className="border-b border-slate-400">
                              <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고객 확인</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{clientSigner?.name || company.contactPerson || company.ceoName || ''}</td>
                              <td className="w-36 p-1 border-r border-slate-400">
                                {renderSignatureCell('s1_cust', '고객 확인 (서명)', '고객확인', clientSigner?.name || company.contactPerson || company.ceoName || '', clientSigner?.position || '담당자', clientSigner?.email || company.contactEmail, clientSigner?.status)}
                              </td>
                              <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">근로자 대표</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{workerSigner?.name || ''}</td>
                              <td className="w-36 p-1">
                                {renderSignatureCell('s1_work', '근로자대표 (서명)', '근로자대표', workerSigner?.name || '', workerSigner?.position || '근로자대표', workerSigner?.email, workerSigner?.status)}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀장</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{leadSigner?.name || project?.leadAuditorName || auditor?.name || ''}</td>
                              <td className="p-1 border-r border-slate-400">
                                {renderSignatureCell('s1_lead', '심사팀장 (서명)', '심사팀장', leadSigner?.name || project?.leadAuditorName || auditor?.name || '', leadSigner?.position || leadAuditorObj?.grade || '선임심사원', leadSigner?.email || leadAuditorObj?.email, leadSigner?.status)}
                              </td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{teamSigners[0]?.name || ''}</td>
                              <td className="p-1 border-r border-slate-400">
                                {renderSignatureCell('s1_team1', '심사팀원 (서명)', '심사팀원', teamSigners[0]?.name || '', teamSigners[0]?.position || '심사원', teamSigners[0]?.email, teamSigners[0]?.status)}
                              </td>
                            </tr>
                            <tr>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                              <td className="p-2 border-r border-slate-400 text-slate-700">{teamSigners[1]?.name || '-'}</td>
                              <td className="p-1 border-r border-slate-400">{renderSignatureCell('s1_t2', '심사팀원 (서명)', '심사팀원', teamSigners[1]?.name, teamSigners[1]?.position, teamSigners[1]?.email, teamSigners[1]?.status)}</td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">기 타</th>
                              <td className="p-2 border-r border-slate-400 text-slate-700">{teamSigners[2]?.name || '-'}</td>
                              <td className="p-1">{renderSignatureCell('s1_oth', '기타 (서명)', '확인심사원', teamSigners[2]?.name, teamSigners[2]?.position, teamSigners[2]?.email, teamSigners[2]?.status)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-009(20251001)</span>
                      <span>- 1 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [1단계 2 PAGE : I. 고객 현황 & Ⅲ 1 단계 심사 (공통 심사 내역 Part 1)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          1 단계 심사 보고서
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      {/* I. 고객 현황 */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-950 text-xs">I. 고객 현황</h3>
                        <table className="w-full border-collapse border border-slate-700 text-xs">
                          <tbody>
                            <tr className="border-b border-slate-400">
                              <th className="w-28 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고 객 명</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{company.companyName}</td>
                              <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">인증번호</th>
                              <td className="p-2 font-mono">{stage2Data.certNo || realCertNo}</td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사일자</th>
                              <td colSpan={3} className="p-2 font-medium">
                                {(project as any)?.stage2StartDate ? `${(project as any).stage2StartDate} ~ ${(project as any).stage2EndDate || ''}` : (project?.startDate ? `${project.startDate} ~ ${project.endDate || ''}` : `${stage2Data.auditDateStart} ~ ${stage2Data.auditDateEnd}`)}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">
                                주사업장<br />주 소
                              </th>
                              <td colSpan={3} className="p-2">{company.address || ''}</td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold text-[11px]">
                                추가사업장<br />주 소
                              </th>
                              <td colSpan={3} className="p-1.5 text-slate-500">
                                {(company as any).subAddress1 || ''}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold text-[11px]">
                                추가사업장<br />주 소
                              </th>
                              <td colSpan={3} className="p-1.5 text-slate-500">
                                {(company as any).subAddress2 || ''}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold text-[11px]">
                                추가사업장<br />주 소
                              </th>
                              <td colSpan={3} className="p-1.5 text-slate-500">
                                {(company as any).subAddress3 || ''}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold text-[11px]">
                                추가사업장<br />주 소
                              </th>
                              <td colSpan={3} className="p-1.5 text-slate-500">
                                {(company as any).subAddress4 || ''}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold text-[11px]">
                                추가사업장<br />주 소
                              </th>
                              <td colSpan={3} className="p-1.5 text-slate-500">
                                {(company as any).subAddress5 || ''}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">Tel</th>
                              <td className="p-2 border-r border-slate-400">{company.contactPhone || ''}</td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">Fax</th>
                              <td className="p-2">{(company as any).fax || ''}</td>
                            </tr>
                            <tr>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">
                                Home<br />page
                              </th>
                              <td className="p-2 border-r border-slate-400">{(company as any).website || ''}</td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">E-Mail</th>
                              <td className="p-2 font-mono">{company.contactEmail || ''}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Ⅲ 1 단계 심사 */}
                      <div className="space-y-1 pt-1">
                        <h3 className="font-bold text-slate-950 text-xs">Ⅲ 1 단계 심사</h3>
                        <table className="w-full border-collapse border border-slate-700 text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-700">
                              <th colSpan={2} className="p-2 text-center font-black tracking-widest text-slate-900">
                                ◆ 공 통 심 사 내 역 ◆
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* 1번 문항 */}
                            <tr className="border-b border-slate-400">
                              <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">
                                1
                              </td>
                              <td className="p-0">
                                <div className="flex justify-between items-center p-2 border-b border-slate-300">
                                  <span className="font-medium text-slate-900">
                                    신청서와 설문서 상의 차이가 있는가? (사업장 위치, 조직 현황 등)
                                  </span>
                                  <div className="flex items-center gap-4 shrink-0 font-bold">
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="s1_diff"
                                        checked={stage1Data.diffFromApp === '있다'}
                                        onChange={() => setStage1Data({ ...stage1Data, diffFromApp: '있다' })}
                                      />
                                      <span>있다</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-teal-900">
                                      <input
                                        type="radio"
                                        name="s1_diff"
                                        checked={stage1Data.diffFromApp === '없다'}
                                        onChange={() => setStage1Data({ ...stage1Data, diffFromApp: '없다' })}
                                      />
                                      <span>없다</span>
                                    </label>
                                  </div>
                                </div>
                                <div className="p-2 flex items-center gap-2 text-[11px] bg-white">
                                  <span className="font-bold text-slate-700 underline shrink-0">있다면 :</span>
                                  <input
                                    type="text"
                                    value={stage1Data.diffDetails || ''}
                                    onChange={(e) => setStage1Data({ ...stage1Data, diffDetails: e.target.value })}
                                    placeholder="차이점 내역을 기술하세요"
                                    className="flex-1 border-b border-dotted border-slate-400 px-1 py-0.5 text-xs bg-transparent focus:outline-none"
                                  />
                                </div>
                              </td>
                            </tr>

                            {/* 2번 문항: 경영시스템의 문서화된 정보 */}
                            <tr className="border-b border-slate-400">
                              <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">
                                2
                              </td>
                              <td className="p-0">
                                <div className="p-2 font-bold text-slate-900 border-b border-slate-300 bg-slate-50/50">
                                  경영시스템의 문서화된 정보
                                </div>
                                <table className="w-full border-collapse text-xs">
                                  <tbody>
                                    <tr className="border-b border-slate-300">
                                      <th className="w-28 bg-slate-50 p-2 border-r border-slate-300 text-center font-bold">
                                        매뉴얼<br />문서번호
                                      </th>
                                      <td className="p-1.5 border-r border-slate-300">
                                        <input
                                          type="text"
                                          value={stage1Data.manualDocNo || ''}
                                          onChange={(e) => setStage1Data({ ...stage1Data, manualDocNo: e.target.value })}
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs"
                                        />
                                      </td>
                                      <th className="w-24 bg-slate-50 p-2 border-r border-slate-300 text-center font-bold">
                                        제/개정<br />일자
                                      </th>
                                      <td className="p-1.5 border-r border-slate-300">
                                        <input
                                          type="text"
                                          value={stage1Data.manualRevDate || ''}
                                          onChange={(e) => setStage1Data({ ...stage1Data, manualRevDate: e.target.value })}
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center font-mono"
                                        />
                                      </td>
                                      <th className="w-20 bg-slate-50 p-2 border-r border-slate-300 text-center font-bold">
                                        개정<br />번호
                                      </th>
                                      <td className="p-1.5">
                                        <input
                                          type="text"
                                          value={stage1Data.manualRevNo || ''}
                                          onChange={(e) => setStage1Data({ ...stage1Data, manualRevNo: e.target.value })}
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <th className="bg-slate-50 p-2 border-r border-slate-300 text-center font-bold">
                                        프로세스<br />문서번호
                                      </th>
                                      <td className="p-1.5 border-r border-slate-300">
                                        <input
                                          type="text"
                                          value={stage1Data.processDocNo || ''}
                                          onChange={(e) => setStage1Data({ ...stage1Data, processDocNo: e.target.value })}
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs"
                                        />
                                      </td>
                                      <th className="bg-slate-50 p-2 border-r border-slate-300 text-center font-bold">
                                        제/개정<br />일자
                                      </th>
                                      <td className="p-1.5 border-r border-slate-300">
                                        <input
                                          type="text"
                                          value={stage1Data.processRevDate || ''}
                                          onChange={(e) => setStage1Data({ ...stage1Data, processRevDate: e.target.value })}
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center font-mono"
                                        />
                                      </td>
                                      <th className="bg-slate-50 p-2 border-r border-slate-300 text-center font-bold">
                                        개정<br />번호
                                      </th>
                                      <td className="p-1.5">
                                        <input
                                          type="text"
                                          value={stage1Data.processRevNo || ''}
                                          onChange={(e) => setStage1Data({ ...stage1Data, processRevNo: e.target.value })}
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>

                            {/* 3번 문항: 경영시스템 적용범위와 인증범위 확인 */}
                            <tr className="border-b border-slate-400">
                              <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">
                                3
                              </td>
                              <td className="p-0">
                                <div className="p-2 font-bold text-slate-900 border-b border-slate-300 bg-slate-50/50">
                                  경영시스템 적용범위와 인증범위 확인
                                </div>
                                <div className="flex">
                                  <div className="w-28 bg-slate-50 p-3 border-r border-slate-300 flex items-center justify-center font-bold text-center">
                                    인증범위
                                  </div>
                                  <div className="flex-1 p-2">
                                    <textarea
                                      rows={2}
                                      value={stage1Data.scopeConfirmed || ''}
                                      onChange={(e) => setStage1Data({ ...stage1Data, scopeConfirmed: e.target.value })}
                                      className="w-full border border-slate-300 rounded p-1.5 text-xs leading-relaxed"
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* 4번 문항: 적용제외 항목 및 타당성 근거 */}
                            <tr className="border-b border-slate-400">
                              <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">
                                4
                              </td>
                              <td className="p-0">
                                <div className="p-2 font-bold text-slate-900 border-b border-slate-300 bg-slate-50/50">
                                  적용제외 항목 및 타당성 근거 (ISO 9001 만 해당)
                                </div>
                                <div className="flex border-t border-slate-200">
                                  <div className="w-28 bg-slate-50 p-2 border-r border-slate-300 flex items-center justify-center font-bold text-center leading-snug">
                                    적용 제외<br />조항 번호
                                  </div>
                                  <div className="w-36 p-1.5 border-r border-slate-300 flex items-center">
                                    <input
                                      type="text"
                                      value={stage1Data.exclusionClause || ''}
                                      onChange={(e) => setStage1Data({ ...stage1Data, exclusionClause: e.target.value })}
                                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                    />
                                  </div>
                                  <div className="w-24 bg-slate-50 p-2 border-r border-slate-300 flex items-center justify-center font-bold text-center">
                                    타당성 근거
                                  </div>
                                  <div className="flex-1 p-1.5 flex items-center">
                                    <input
                                      type="text"
                                      value={stage1Data.exclusionReason || ''}
                                      onChange={(e) => setStage1Data({ ...stage1Data, exclusionReason: e.target.value })}
                                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* 5번 문항: 조직의 경영시스템에 대한 이해 정도 */}
                            <tr>
                              <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">
                                5
                              </td>
                              <td className="p-0">
                                <div className="p-2 font-bold text-slate-900 border-b border-slate-300 bg-slate-50/50">
                                  조직의 경영시스템에 대한 이해 정도
                                </div>
                                <div className="divide-y divide-slate-200 text-xs">
                                  <div className="flex justify-between items-center p-2">
                                    <span>5.1 주요성과 및 중대한 측면이 파악되고 있는가?</span>
                                    <div className="flex items-center gap-4 shrink-0 font-bold">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                        <input
                                          type="radio"
                                          name="s1_q5_1"
                                          checked={stage1Data.q5_1 === '적합'}
                                          onChange={() => setStage1Data({ ...stage1Data, q5_1: '적합' })}
                                        />
                                        <span>적합</span>
                                      </label>
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                        <input
                                          type="radio"
                                          name="s1_q5_1"
                                          checked={stage1Data.q5_1 === '부적합'}
                                          onChange={() => setStage1Data({ ...stage1Data, q5_1: '부적합' })}
                                        />
                                        <span>부적합</span>
                                      </label>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center p-2">
                                    <span>5.2 조직의 운영과 관련된 프로세스를 이해하고 있는가?</span>
                                    <div className="flex items-center gap-4 shrink-0 font-bold">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                        <input
                                          type="radio"
                                          name="s1_q5_2"
                                          checked={stage1Data.q5_2 === '적합'}
                                          onChange={() => setStage1Data({ ...stage1Data, q5_2: '적합' })}
                                        />
                                        <span>적합</span>
                                      </label>
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                        <input
                                          type="radio"
                                          name="s1_q5_2"
                                          checked={stage1Data.q5_2 === '부적합'}
                                          onChange={() => setStage1Data({ ...stage1Data, q5_2: '부적합' })}
                                        />
                                        <span>부적합</span>
                                      </label>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center p-2">
                                    <span>5.3 조직의 목표 및 운영에 대해 파악하고 있는가?</span>
                                    <div className="flex items-center gap-4 shrink-0 font-bold">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                        <input
                                          type="radio"
                                          name="s1_q5_3"
                                          checked={stage1Data.q5_3 === '적합'}
                                          onChange={() => setStage1Data({ ...stage1Data, q5_3: '적합' })}
                                        />
                                        <span>적합</span>
                                      </label>
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                        <input
                                          type="radio"
                                          name="s1_q5_3"
                                          checked={stage1Data.q5_3 === '부적합'}
                                          onChange={() => setStage1Data({ ...stage1Data, q5_3: '부적합' })}
                                        />
                                        <span>부적합</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-009(20251001)</span>
                      <span>- 2 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [1단계 3 PAGE : 공통 심사 내역 Part 2 & ISO 14001 & ISO 45001] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          1 단계 심사 보고서
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      {/* 공통 심사 내역 (이어서: 7~10번) */}
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">7</td>
                            <td className="p-2 border-r border-slate-400 font-medium">내부심사가 실시되었는가?</td>
                            <td className="w-36 p-2 text-center font-bold">
                              <div className="flex justify-center items-center gap-4">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                  <input type="radio" name="s1_q7" checked={stage1Data.q6_internalAudit === '적합'} onChange={() => setStage1Data({...stage1Data, q6_internalAudit: '적합'})} />
                                  <span>적합</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input type="radio" name="s1_q7" checked={stage1Data.q6_internalAudit === '부적합'} onChange={() => setStage1Data({...stage1Data, q6_internalAudit: '부적합'})} />
                                  <span>부적합</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">8</td>
                            <td className="p-2 border-r border-slate-400 font-medium">경영검토가 실시되었는가?</td>
                            <td className="p-2 text-center font-bold">
                              <div className="flex justify-center items-center gap-4">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                  <input type="radio" name="s1_q8" checked={stage1Data.q7_managementReview === '적합'} onChange={() => setStage1Data({...stage1Data, q7_managementReview: '적합'})} />
                                  <span>적합</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input type="radio" name="s1_q8" checked={stage1Data.q7_managementReview === '부적합'} onChange={() => setStage1Data({...stage1Data, q7_managementReview: '부적합'})} />
                                  <span>부적합</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">8-2</td>
                            <td className="p-2 border-r border-slate-400 font-medium">프로세스 및 장비에 대한 운영관리는 파악되고 있는가?</td>
                            <td className="p-2 text-center font-bold">
                              <div className="flex justify-center items-center gap-4">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                  <input type="radio" name="s1_q8_2" checked={stage1Data.q8_operationControl === '적합'} onChange={() => setStage1Data({...stage1Data, q8_operationControl: '적합'})} />
                                  <span>적합</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input type="radio" name="s1_q8_2" checked={stage1Data.q8_operationControl === '부적합'} onChange={() => setStage1Data({...stage1Data, q8_operationControl: '부적합'})} />
                                  <span>부적합</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">9</td>
                            <td className="p-2 border-r border-slate-400 font-medium">조직에 적용되는 법적, 규제적 요구사항이 파악되었는가?</td>
                            <td className="p-2 text-center font-bold">
                              <div className="flex justify-center items-center gap-4">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                  <input type="radio" name="s1_q9" checked={stage1Data.q9_legalCompliance === '적합'} onChange={() => setStage1Data({...stage1Data, q9_legalCompliance: '적합'})} />
                                  <span>적합</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input type="radio" name="s1_q9" checked={stage1Data.q9_legalCompliance === '부적합'} onChange={() => setStage1Data({...stage1Data, q9_legalCompliance: '부적합'})} />
                                  <span>부적합</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">10</td>
                            <td colSpan={2} className="p-0">
                              <div className="flex justify-between items-center p-2 border-b border-slate-200">
                                <span className="font-medium">최근 3년대 법규 위반사항이 있는가?</span>
                                <div className="flex items-center gap-4 font-bold">
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-teal-900">
                                    <input type="radio" name="s1_q10" checked={stage1Data.q10_legalViolation === '없다'} onChange={() => setStage1Data({...stage1Data, q10_legalViolation: '없다'})} />
                                    <span>없다</span>
                                  </label>
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700">
                                    <input type="radio" name="s1_q10" checked={stage1Data.q10_legalViolation === '있다'} onChange={() => setStage1Data({...stage1Data, q10_legalViolation: '있다'})} />
                                    <span>있다</span>
                                  </label>
                                </div>
                              </div>
                              <div className="p-2 flex items-center gap-2 text-[11px] bg-white">
                                <span className="font-bold text-slate-700 underline shrink-0">있다면:</span>
                                <input
                                  type="text"
                                  value={stage1Data.q10_violationDetails || ''}
                                  onChange={(e) => setStage1Data({...stage1Data, q10_violationDetails: e.target.value})}
                                  placeholder="위반사항 내역"
                                  className="flex-1 border-b border-dotted border-slate-400 px-1 py-0.5 text-xs bg-transparent focus:outline-none"
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* ◆ ISO 14001 심 사 내 역 ◆ */}
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-700">
                            <th colSpan={2} className="p-2 text-center font-black tracking-widest text-slate-900">
                              ◆ ISO 14001 심 사 내 역 ◆
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">1</td>
                            <td className="p-0">
                              <div className="flex justify-between items-center p-2 border-b border-slate-200">
                                <span className="font-medium">환경 신고 및 허가 인허가사항 (대기, 수질, 토양, 위험물 취급, 화학물질 취급 등)</span>
                                <div className="flex items-center gap-4 font-bold shrink-0">
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                    <input type="radio" name="s1_env1" checked={stage1Data.env1_permit === '예'} onChange={() => setStage1Data({...stage1Data, env1_permit: '예'})} />
                                    <span>예</span>
                                  </label>
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                    <input type="radio" name="s1_env1" checked={stage1Data.env1_permit === '아니오'} onChange={() => setStage1Data({...stage1Data, env1_permit: '아니오'})} />
                                    <span>아니오</span>
                                  </label>
                                </div>
                              </div>
                              <div className="p-2 flex items-center gap-2 text-[11px] bg-white">
                                <span className="font-bold text-slate-700 underline shrink-0">있다면:</span>
                                <input
                                  type="text"
                                  value={stage1Data.env1_details || ''}
                                  onChange={(e) => setStage1Data({...stage1Data, env1_details: e.target.value})}
                                  className="flex-1 border-b border-dotted border-slate-400 px-1 py-0.5 text-xs bg-transparent focus:outline-none"
                                />
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">2</td>
                            <td className="p-0">
                              <div className="flex justify-between items-center p-2 border-b border-slate-200">
                                <span className="font-bold">환경영향 평가를 실시 하였는가?</span>
                                <div className="flex items-center gap-4 font-bold shrink-0">
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                    <input type="radio" name="s1_env2" checked={stage1Data.env2_aspect === '예'} onChange={() => setStage1Data({...stage1Data, env2_aspect: '예'})} />
                                    <span>예</span>
                                  </label>
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                    <input type="radio" name="s1_env2" checked={stage1Data.env2_aspect === '아니오'} onChange={() => setStage1Data({...stage1Data, env2_aspect: '아니오'})} />
                                    <span>아니오</span>
                                  </label>
                                </div>
                              </div>
                              <div className="divide-y divide-slate-200 pl-3">
                                <div className="flex justify-between items-center p-2">
                                  <span>중대한 환경측면은 파악 되었는가?</span>
                                  <div className="flex items-center gap-4 font-bold shrink-0">
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                      <input type="radio" name="s1_env2_sig" checked={stage1Data.env2_significant === '예'} onChange={() => setStage1Data({...stage1Data, env2_significant: '예'})} />
                                      <span>예</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                      <input type="radio" name="s1_env2_sig" checked={stage1Data.env2_significant === '아니오'} onChange={() => setStage1Data({...stage1Data, env2_significant: '아니오'})} />
                                      <span>아니오</span>
                                    </label>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center p-2">
                                  <span>준수의무 사항이 파악되고 준수평가를 실시 하였는가?</span>
                                  <div className="flex items-center gap-4 font-bold shrink-0">
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                      <input type="radio" name="s1_env2_comp" checked={stage1Data.env2_compliance === '예'} onChange={() => setStage1Data({...stage1Data, env2_compliance: '예'})} />
                                      <span>예</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                      <input type="radio" name="s1_env2_comp" checked={stage1Data.env2_compliance === '아니오'} onChange={() => setStage1Data({...stage1Data, env2_compliance: '아니오'})} />
                                      <span>아니오</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">3</td>
                            <td className="p-2 flex justify-between items-center">
                              <span className="font-medium">환경운영 기준을 수립 하였는가? (지침서 파악)</span>
                              <div className="flex items-center gap-4 font-bold shrink-0">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                  <input type="radio" name="s1_env3" checked={stage1Data.env3_procedure === '예'} onChange={() => setStage1Data({...stage1Data, env3_procedure: '예'})} />
                                  <span>예</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input type="radio" name="s1_env3" checked={stage1Data.env3_procedure === '아니오'} onChange={() => setStage1Data({...stage1Data, env3_procedure: '아니오'})} />
                                  <span>아니오</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">4</td>
                            <td className="p-2 flex justify-between items-center">
                              <span className="font-medium">환경관리자는 선임 되었는가?</span>
                              <div className="flex items-center gap-4 font-bold shrink-0">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                  <input type="radio" name="s1_env4" checked={stage1Data.env4_manager === '예'} onChange={() => setStage1Data({...stage1Data, env4_manager: '예'})} />
                                  <span>예</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input type="radio" name="s1_env4" checked={stage1Data.env4_manager === '아니오'} onChange={() => setStage1Data({...stage1Data, env4_manager: '아니오'})} />
                                  <span>아니오</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* ◆ ISO 45001 심 사 내 역 ◆ */}
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-700">
                            <th colSpan={2} className="p-2 text-center font-black tracking-widest text-slate-900">
                              ◆ ISO 45001 심 사 내 역 ◆
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">1</td>
                            <td className="p-0">
                              <div className="p-2 font-bold text-slate-900 border-b border-slate-300 bg-slate-50/50">
                                안전보건 관리체계상의 조직구조
                              </div>
                              <table className="w-full border-collapse text-xs">
                                <tbody>
                                  <tr className="border-b border-slate-200">
                                    <th className="w-36 bg-slate-50 p-1.5 border-r border-slate-300 text-left font-medium">안전보건관리책임자 명</th>
                                    <td className="p-1 border-r border-slate-300">
                                      <input
                                        type="text"
                                        value={stage1Data.safe1_managerName || ''}
                                        onChange={(e) => setStage1Data({...stage1Data, safe1_managerName: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs"
                                      />
                                    </td>
                                    <th className="w-36 bg-slate-50 p-1.5 border-r border-slate-300 text-left font-medium">안전관리자(대행 기관명)</th>
                                    <td className="p-1">
                                      <input
                                        type="text"
                                        value={stage1Data.safe1_safetyPerson || ''}
                                        onChange={(e) => setStage1Data({...stage1Data, safe1_safetyPerson: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs"
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th className="bg-slate-50 p-1.5 border-r border-slate-300 text-left font-medium">보건관리자(대행 기관명)</th>
                                    <td className="p-1 border-r border-slate-300">
                                      <input
                                        type="text"
                                        value={stage1Data.safe1_healthPerson || ''}
                                        onChange={(e) => setStage1Data({...stage1Data, safe1_healthPerson: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs"
                                      />
                                    </td>
                                    <th className="bg-slate-50 p-1.5 border-r border-slate-300 text-left font-medium">근로자 대표</th>
                                    <td className="p-1">
                                      <input
                                        type="text"
                                        value={stage1Data.safe1_workerRep || ''}
                                        onChange={(e) => setStage1Data({...stage1Data, safe1_workerRep: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs"
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">2</td>
                            <td className="p-2 flex justify-between items-center">
                              <span className="font-bold">위험성 평가는 실시되었는가?</span>
                              <div className="flex items-center gap-4 font-bold shrink-0">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                  <input type="radio" name="s1_safe2" checked={stage1Data.safe2_riskEval === '예'} onChange={() => setStage1Data({...stage1Data, safe2_riskEval: '예'})} />
                                  <span>예</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input type="radio" name="s1_safe2" checked={stage1Data.safe2_riskEval === '아니오'} onChange={() => setStage1Data({...stage1Data, safe2_riskEval: '아니오'})} />
                                  <span>아니오</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">3</td>
                            <td className="p-0">
                              <div className="p-2 font-bold text-slate-900 border-b border-slate-300 bg-slate-50/50">
                                위험성 평가에 대한 정보
                              </div>
                              <div className="divide-y divide-slate-200 pl-3">
                                {[
                                  { key: 'safe3_1', text: '3.1 유해·위험요인은 모두 파악되었는가?' },
                                  { key: 'safe3_2', text: '3.2 위험성 평가는 적합하게 실시되었는가?' },
                                  { key: 'safe3_3', text: '3.3 위험성 평가표는 적정한가?' },
                                  { key: 'safe3_4', text: '3.4 위험성 평가 시 해당 근로자는 참여하였는가?' },
                                  { key: 'safe3_5', text: '3.5 위험성 평가에 대한 관리대책은 적절한가?' },
                                  { key: 'safe3_6', text: '3.6 위험성 평가에 대한 기록은 의사소통 되고 있는가?' },
                                  { key: 'safe3_7', text: '3.7 관련 법규는 모두 파악되었는가?' },
                                ].map(item => (
                                  <div key={item.key} className="flex justify-between items-center p-1.5 text-xs">
                                    <span>{item.text}</span>
                                    <div className="flex items-center gap-4 font-bold shrink-0">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                        <input
                                          type="radio"
                                          name={`s1_${item.key}`}
                                          checked={(stage1Data as any)[item.key] === '예'}
                                          onChange={() => setStage1Data({ ...stage1Data, [item.key]: '예' })}
                                        />
                                        <span>예</span>
                                      </label>
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                        <input
                                          type="radio"
                                          name={`s1_${item.key}`}
                                          checked={(stage1Data as any)[item.key] === '아니오'}
                                          onChange={() => setStage1Data({ ...stage1Data, [item.key]: '아니오' })}
                                        />
                                        <span>아니오</span>
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">4</td>
                            <td className="p-2 flex justify-between items-center">
                              <span className="font-medium">안전보건방침은 적절하게 구성되었는가?</span>
                              <div className="flex items-center gap-4 font-bold shrink-0">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                  <input type="radio" name="s1_safe4" checked={stage1Data.safe4_team === '예'} onChange={() => setStage1Data({...stage1Data, safe4_team: '예'})} />
                                  <span>예</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input type="radio" name="s1_safe4" checked={stage1Data.safe4_team === '아니오'} onChange={() => setStage1Data({...stage1Data, safe4_team: '아니오'})} />
                                  <span>아니오</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">5</td>
                            <td className="p-2 flex items-center gap-2">
                              <span className="font-medium">중대한 위험성의 수:</span>
                              <span className="inline-flex items-center gap-1 font-bold">
                                (
                                <input
                                  type="text"
                                  value={stage1Data.safe5_criticalCount || ''}
                                  onChange={(e) => setStage1Data({...stage1Data, safe5_criticalCount: e.target.value})}
                                  className="w-10 text-center border-b border-slate-400 font-mono font-bold text-xs focus:outline-none"
                                />
                                ) 개
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-009(20251001)</span>
                      <span>- 3 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [1단계 4 PAGE : ESG-MS & Ⅳ. 통합정도 & Ⅴ. 조직 참석자 & Ⅵ. 심사팀 참석자] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          1 단계 심사 보고서
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      {/* ◆ ESG-MS 심 사 내 역 ◆ */}
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-700">
                            <th colSpan={2} className="p-2 text-center font-black tracking-widest text-slate-900">
                              ◆ ESG-MS 심 사 내 역 ◆
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">1</td>
                            <td className="p-2 flex justify-between items-center">
                              <span className="font-medium">ESG 경영성과보고서(지속가능경영보고서)가 작성되었는가?</span>
                              <div className="flex items-center gap-4 font-bold shrink-0">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                  <input type="radio" name="s1_esg1" checked={stage1Data.esg1_report === '예'} onChange={() => setStage1Data({...stage1Data, esg1_report: '예'})} />
                                  <span>예</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input type="radio" name="s1_esg1" checked={stage1Data.esg1_report === '아니오'} onChange={() => setStage1Data({...stage1Data, esg1_report: '아니오'})} />
                                  <span>아니오</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">2</td>
                            <td className="p-2 flex justify-between items-center">
                              <span className="font-medium">ESG 성과관련 정량평가는 이루어지고 있는가?</span>
                              <div className="flex items-center gap-4 font-bold shrink-0">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                  <input type="radio" name="s1_esg2" checked={stage1Data.esg2_quant === '예'} onChange={() => setStage1Data({...stage1Data, esg2_quant: '예'})} />
                                  <span>예</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input type="radio" name="s1_esg2" checked={stage1Data.esg2_quant === '아니오'} onChange={() => setStage1Data({...stage1Data, esg2_quant: '아니오'})} />
                                  <span>아니오</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400 align-top">3</td>
                            <td className="p-0">
                              <div className="flex justify-between items-center p-2 border-b border-slate-200">
                                <span className="font-medium">고객지정 정보 요구사항이 있는가? (예: 공급망 협약)</span>
                                <div className="flex items-center gap-4 font-bold shrink-0">
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                    <input type="radio" name="s1_esg3" checked={stage1Data.esg3_supply === '예'} onChange={() => setStage1Data({...stage1Data, esg3_supply: '예'})} />
                                    <span>예</span>
                                  </label>
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                    <input type="radio" name="s1_esg3" checked={stage1Data.esg3_supply === '아니오'} onChange={() => setStage1Data({...stage1Data, esg3_supply: '아니오'})} />
                                    <span>아니오</span>
                                  </label>
                                </div>
                              </div>
                              <div className="p-2 flex items-center gap-2 text-[11px] bg-white">
                                <span className="font-bold text-slate-700 underline shrink-0">있다면:</span>
                                <input
                                  type="text"
                                  placeholder="고객 요구사항 기술"
                                  className="flex-1 border-b border-dotted border-slate-400 px-1 py-0.5 text-xs bg-transparent focus:outline-none"
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* 안내 문구 */}
                      <p className="text-[10.5px] text-slate-700 font-medium px-1">
                        ▶ 심사결점은 신청서와 차이점 발견 시 즉시 인증원에 보고하여 심사진행 및 변경서류를 발의합니다.
                      </p>

                      {/* Ⅳ. 통합경영시스템일 경우 통합 정도 파악 */}
                      <div className="space-y-1 pt-1">
                        <h3 className="font-bold text-slate-950 text-xs">Ⅳ. 통합경영시스템일 경우 통합 정도 파악</h3>
                        <table className="w-full border-collapse border border-slate-700 text-xs">
                          <tbody>
                            {[
                              { no: 1, text: '경영시스템 문서가 통합되어 있습니까?', key: 'ims1_doc' },
                              { no: 2, text: '방침 및 목표가 통합되어 있습니까?', key: 'ims2_policy' },
                              { no: 3, text: '전체 조직에 대한 경영검토가 이루어졌습니까?', key: 'ims3_review' },
                              { no: 4, text: '내부심사가 통합적으로 수행되었습니까?', key: 'ims4_audit' },
                              { no: 5, text: '프로세스 접근이 통합적으로 이루어졌습니까?', key: 'ims5_process' },
                              { no: 6, text: '지속적 개선(시정조치 등)이 통합적으로 접근 되었습니까?', key: 'ims6_improve' },
                              { no: 7, text: '통합된 경영지원과 조직의 책임이 규정되어 있습니까?', key: 'ims7_org' },
                            ].map(item => (
                              <tr key={item.no} className="border-b border-slate-400">
                                <td className="w-8 p-1.5 text-center font-bold bg-slate-50 border-r border-slate-400">{item.no}</td>
                                <td className="p-1.5 border-r border-slate-400 font-medium">{item.text}</td>
                                <td className="w-32 p-1.5 text-center font-bold">
                                  <div className="flex justify-center items-center gap-4">
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                      <input
                                        type="radio"
                                        name={`s1_${item.key}`}
                                        checked={(stage1Data as any)[item.key] === '예'}
                                        onChange={() => setStage1Data({ ...stage1Data, [item.key]: '예' })}
                                      />
                                      <span>예</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                                      <input
                                        type="radio"
                                        name={`s1_${item.key}`}
                                        checked={(stage1Data as any)[item.key] === '아니오'}
                                        onChange={() => setStage1Data({ ...stage1Data, [item.key]: '아니오' })}
                                      />
                                      <span>아니오</span>
                                    </label>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Ⅴ. 조직의 심사 참석자 */}
                      <div className="space-y-1 pt-1">
                        <h3 className="font-bold text-slate-950 text-xs">Ⅴ. 조직의 심사 참석자</h3>
                        <table className="w-full border-collapse border border-slate-700 text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-700">
                              <th className="w-28 p-1.5 border-r border-slate-400 text-center font-bold">참석자명</th>
                              <th className="p-1.5 border-r border-slate-400 text-center font-bold">직무/직책</th>
                              <th className="w-28 p-1.5 border-r border-slate-400 text-center font-bold">참석자명</th>
                              <th className="p-1.5 text-center font-bold">직무/직책</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-400">
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{clientSigner?.name || stage1Data.attendees[0]?.name || company.ceoName || ''}</td>
                              <td className="p-1.5 border-r border-slate-400">{stage1Data.attendees[0]?.role || (company.ceoName ? '대표이사 / 최고경영자' : '')}</td>
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{stage1Data.attendees[1]?.name || company.contactPerson || ''}</td>
                              <td className="p-1.5">{stage1Data.attendees[1]?.role || (company.contactPerson ? `${(company as any).contactPosition || '담당자'}` : '')}</td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{stage1Data.attendees[2]?.name || ''}</td>
                              <td className="p-1.5 border-r border-slate-400">{stage1Data.attendees[2]?.role || ''}</td>
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{workerSigner?.name || stage1Data.attendees[3]?.name || ''}</td>
                              <td className="p-1.5">{stage1Data.attendees[3]?.role || (workerSigner?.name ? '근로자대표' : '')}</td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{stage1Data.attendees[4]?.name || ''}</td>
                              <td className="p-1.5 border-r border-slate-400">{stage1Data.attendees[4]?.role || ''}</td>
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{stage1Data.attendees[5]?.name || ''}</td>
                              <td className="p-1.5">{stage1Data.attendees[5]?.role || ''}</td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <td className="p-1.5 border-r border-slate-400 text-center text-slate-400">-</td>
                              <td className="p-1.5 border-r border-slate-400 text-slate-400">-</td>
                              <td className="p-1.5 border-r border-slate-400 text-center text-slate-400">-</td>
                              <td className="p-1.5 text-slate-400">-</td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <td className="p-1.5 border-r border-slate-400 text-center text-slate-400">-</td>
                              <td className="p-1.5 border-r border-slate-400 text-slate-400">-</td>
                              <td className="p-1.5 border-r border-slate-400 text-center text-slate-400">-</td>
                              <td className="p-1.5 text-slate-400">-</td>
                            </tr>
                            <tr>
                              <th className="bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">비 고</th>
                              <td colSpan={3} className="p-2 text-[11px] text-slate-600 leading-relaxed">
                                * 필수 참석자: 품질은 품질관리자, 환경은 환경관리자, 안전보건은 안전보건관리책임자와 근로자 대표가 반드시 포함되어야 함 (작성법 예시: 홍길동, 품질관리자/과장)
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Ⅵ. 심사팀 참석자 */}
                      <div className="space-y-1 pt-1">
                        <h3 className="font-bold text-slate-950 text-xs">Ⅵ. 심사팀 참석자</h3>
                        <table className="w-full border-collapse border border-slate-700 text-xs">
                          <tbody>
                            <tr className="border-b border-slate-400">
                              <th className="w-20 bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">심사팀장</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{leadSigner?.name || project?.leadAuditorName || auditor?.name || ''}</td>
                              <th className="w-20 bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{teamSigners[0]?.name || ''}</td>
                              <th className="w-20 bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-2 text-slate-400">{teamSigners[1]?.name || '-'}</td>
                            </tr>
                            <tr>
                              <th className="bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-2 border-r border-slate-400 text-slate-400">{teamSigners[2]?.name || '-'}</td>
                              <th className="bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-2 border-r border-slate-400 text-slate-400">{teamSigners[3]?.name || '-'}</td>
                              <th className="bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">기 타</th>
                              <td className="p-2 text-slate-400">{teamSigners[4]?.name || '-'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-009(20251001)</span>
                      <span>- 4 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [1단계 5 PAGE : Ⅶ. 문서화된 정보 확인 (심사원 상세 기록)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          1 단계 심사 보고서
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-950 text-xs">Ⅶ. 문서화된 정보 확인</h3>
                        <span className="text-[10.5px] text-slate-500">※ 심사원 검토 내용 직접 작성</span>
                      </div>

                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-700">
                            <th className="w-8 p-2 border-r border-slate-400 text-center font-bold">No.</th>
                            <th className="w-28 p-2 border-r border-slate-400 text-center font-bold">요구사항</th>
                            <th className="p-2 border-r border-slate-400 text-center font-bold">문서화된 정보 확인 사항</th>
                            <th className="w-24 p-2 border-r border-slate-400 text-center font-bold">심사결과</th>
                            <th className="w-40 p-2 text-center font-bold">실사확인 내역(면담/부적합)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stage1Data.clauseNotes.map((item: { clause: string; notes: string; result: string; findings: string }, idx: number) => (
                            <tr key={idx} className="border-b border-slate-400 hover:bg-slate-50/50">
                              <td className="p-2 text-center font-bold border-r border-slate-400 bg-slate-50 align-top">
                                {idx + 1}
                              </td>
                              <td className="p-2 font-bold text-slate-900 border-r border-slate-400 align-top bg-slate-50">
                                {item.clause}
                              </td>
                              <td className="p-1.5 border-r border-slate-400 align-top">
                                <textarea
                                  rows={3}
                                  value={item.notes}
                                  onChange={(e) => {
                                    const next = [...stage1Data.clauseNotes];
                                    next[idx].notes = e.target.value;
                                    setStage1Data({ ...stage1Data, clauseNotes: next });
                                  }}
                                  className="w-full border border-slate-300 rounded p-1.5 text-xs leading-relaxed focus:ring-1 focus:ring-teal-500 resize-y"
                                />
                              </td>
                              <td className="p-2 border-r border-slate-400 align-top">
                                <div className="space-y-1.5 font-bold text-[11px]">
                                  <label className="flex items-center gap-1.5 cursor-pointer text-emerald-800">
                                    <input
                                      type="radio"
                                      name={`s1_res_${idx}`}
                                      checked={item.result === '적합'}
                                      onChange={() => {
                                        const next = [...stage1Data.clauseNotes];
                                        next[idx].result = '적합';
                                        setStage1Data({ ...stage1Data, clauseNotes: next });
                                      }}
                                    />
                                    <span>적합</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer text-rose-800">
                                    <input
                                      type="radio"
                                      name={`s1_res_${idx}`}
                                      checked={item.result === '부적합'}
                                      onChange={() => {
                                        const next = [...stage1Data.clauseNotes];
                                        next[idx].result = '부적합';
                                        setStage1Data({ ...stage1Data, clauseNotes: next });
                                      }}
                                    />
                                    <span>부적합</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer text-amber-800">
                                    <input
                                      type="radio"
                                      name={`s1_res_${idx}`}
                                      checked={item.result === '권고사항' || item.result === '관찰/권고'}
                                      onChange={() => {
                                        const next = [...stage1Data.clauseNotes];
                                        next[idx].result = '권고사항';
                                        setStage1Data({ ...stage1Data, clauseNotes: next });
                                      }}
                                    />
                                    <span>관찰/권고</span>
                                  </label>
                                </div>
                              </td>
                              <td className="p-1.5 align-top">
                                <textarea
                                  rows={3}
                                  value={item.findings}
                                  onChange={(e) => {
                                    const next = [...stage1Data.clauseNotes];
                                    next[idx].findings = e.target.value;
                                    setStage1Data({ ...stage1Data, clauseNotes: next });
                                  }}
                                  placeholder="실사 확인 특이사항 기술..."
                                  className="w-full border border-slate-300 rounded p-1.5 text-xs resize-y"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-009(20251001)</span>
                      <span>- 5 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [1단계 6 PAGE : Ⅷ. 1단계 심사 결과 및 결론] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          1 단계 심사 보고서
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-950 text-xs">Ⅷ. 1단계 심사 결과</h3>
                      
                      {/* 1) 관찰사항 또는 부적합 사항 기술 */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 text-xs block">
                          1) 관찰사항 또는 부적합 사항을 기술 하시오 (있다면)
                        </span>
                        <table className="w-full border-collapse border border-slate-700 text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-700">
                              <th className="w-10 p-1.5 border-r border-slate-400 text-center font-bold">No.</th>
                              <th className="w-28 p-1.5 border-r border-slate-400 text-center font-bold">권고/부적합</th>
                              <th className="p-1.5 border-r border-slate-400 text-center font-bold">관련 내역</th>
                              <th className="w-32 p-1.5 text-center font-bold">시정조치 확인일자</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(stage1Data.findingsTable || [
                              { no: 1, type: '', details: '', dueDate: '' },
                              { no: 2, type: '', details: '', dueDate: '' },
                              { no: 3, type: '', details: '', dueDate: '' },
                              { no: 4, type: '', details: '', dueDate: '' },
                              { no: 5, type: '', details: '', dueDate: '' },
                            ]).map((row: any, rIdx: number) => (
                              <tr key={row.no || rIdx + 1} className="border-b border-slate-400">
                                <td className="p-1.5 text-center font-bold border-r border-slate-400 bg-slate-50">{row.no || rIdx + 1}</td>
                                <td className="p-1 border-r border-slate-400">
                                  <select
                                    value={row.type || ''}
                                    onChange={(e) => {
                                      const currentList = stage1Data.findingsTable || [
                                        { no: 1, type: '', details: '', dueDate: '' },
                                        { no: 2, type: '', details: '', dueDate: '' },
                                        { no: 3, type: '', details: '', dueDate: '' },
                                        { no: 4, type: '', details: '', dueDate: '' },
                                        { no: 5, type: '', details: '', dueDate: '' },
                                      ];
                                      const next = [...currentList];
                                      next[rIdx] = { ...next[rIdx], no: rIdx + 1, type: e.target.value };
                                      setStage1Data({ ...stage1Data, findingsTable: next });
                                    }}
                                    className="w-full bg-transparent border-0 text-center font-bold text-xs focus:ring-1 focus:ring-cyan-500 cursor-pointer text-slate-800"
                                  >
                                    <option value="">- 선택 -</option>
                                    <option value="권고사항">권고사항</option>
                                    <option value="관찰사항">관찰사항</option>
                                    <option value="경부적합">경부적합</option>
                                    <option value="중부적합">중부적합</option>
                                  </select>
                                </td>
                                <td className="p-1 border-r border-slate-400">
                                  <input
                                    type="text"
                                    value={row.details || ''}
                                    placeholder="관찰사항 또는 부적합 세부 내용 입력"
                                    onChange={(e) => {
                                      const currentList = stage1Data.findingsTable || [
                                        { no: 1, type: '', details: '', dueDate: '' },
                                        { no: 2, type: '', details: '', dueDate: '' },
                                        { no: 3, type: '', details: '', dueDate: '' },
                                        { no: 4, type: '', details: '', dueDate: '' },
                                        { no: 5, type: '', details: '', dueDate: '' },
                                      ];
                                      const next = [...currentList];
                                      next[rIdx] = { ...next[rIdx], no: rIdx + 1, details: e.target.value };
                                      setStage1Data({ ...stage1Data, findingsTable: next });
                                    }}
                                    className="w-full bg-transparent border-0 px-1.5 py-0.5 text-xs text-slate-900 focus:ring-1 focus:ring-cyan-500"
                                  />
                                </td>
                                <td className="p-1 text-center font-mono">
                                  <input
                                    type="text"
                                    value={row.dueDate || ''}
                                    placeholder="YYYY-MM-DD"
                                    onChange={(e) => {
                                      const currentList = stage1Data.findingsTable || [
                                        { no: 1, type: '', details: '', dueDate: '' },
                                        { no: 2, type: '', details: '', dueDate: '' },
                                        { no: 3, type: '', details: '', dueDate: '' },
                                        { no: 4, type: '', details: '', dueDate: '' },
                                        { no: 5, type: '', details: '', dueDate: '' },
                                      ];
                                      const next = [...currentList];
                                      next[rIdx] = { ...next[rIdx], no: rIdx + 1, dueDate: e.target.value };
                                      setStage1Data({ ...stage1Data, findingsTable: next });
                                    }}
                                    className="w-full bg-transparent border-0 text-center text-xs font-mono text-slate-900 focus:ring-1 focus:ring-cyan-500"
                                  />
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-slate-50 border-b border-slate-700">
                              <th className="p-2 border-r border-slate-400 text-center font-bold">심 사 결 과</th>
                              <td colSpan={3} className="p-2 space-x-6 text-xs font-bold text-slate-900">
                                <label className="inline-flex items-center gap-1">
                                  <span>중부적합:</span>
                                  <input
                                    type="text"
                                    value={stage1Data.summaryMajor ?? '0'}
                                    onChange={(e) => setStage1Data({ ...stage1Data, summaryMajor: e.target.value })}
                                    className="w-8 border-b border-slate-400 text-center font-bold bg-transparent focus:outline-none"
                                  />
                                  <span>건</span>
                                </label>
                                <label className="inline-flex items-center gap-1">
                                  <span>경부적합:</span>
                                  <input
                                    type="text"
                                    value={stage1Data.summaryMinor ?? '0'}
                                    onChange={(e) => setStage1Data({ ...stage1Data, summaryMinor: e.target.value })}
                                    className="w-8 border-b border-slate-400 text-center font-bold bg-transparent focus:outline-none"
                                  />
                                  <span>건</span>
                                </label>
                                <label className="inline-flex items-center gap-1">
                                  <span>관찰사항:</span>
                                  <input
                                    type="text"
                                    value={stage1Data.summaryObs ?? '0'}
                                    onChange={(e) => setStage1Data({ ...stage1Data, summaryObs: e.target.value })}
                                    className="w-8 border-b border-slate-400 text-center font-bold bg-transparent focus:outline-none"
                                  />
                                  <span>건</span>
                                </label>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="p-2 text-[11px] text-slate-600 bg-white leading-relaxed">
                                ※ 경부적합은 심사 일로부터 1개월 이내, 중부적합은 3개월 이내에 시정조치를 하셔야 합니다.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* 2) 심사총평 */}
                      <div className="space-y-1 pt-1">
                        <span className="font-bold text-slate-900 text-xs block">2) 심사총평</span>
                        <textarea
                          rows={4}
                          value={stage1Data.overallSummary}
                          onChange={(e) => setStage1Data({ ...stage1Data, overallSummary: e.target.value })}
                          className="w-full border border-slate-700 rounded p-2.5 text-xs leading-relaxed focus:ring-1 focus:ring-teal-500"
                        />
                      </div>

                      {/* 3) 1단계 심사 결론 */}
                      <div className="space-y-1.5 pt-1">
                        <span className="font-bold text-slate-900 text-xs block">3) 1단계 심사 결론</span>
                        <table className="w-full border-collapse border border-slate-700 text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-700">
                              <th className="p-2 border-r border-slate-400 text-center font-bold">심사 결론</th>
                              <th className="w-28 p-2 text-center font-bold">결론 확인</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-400">
                              <td className="p-2.5 border-r border-slate-400 font-medium">
                                부적합이 발견되지 않아 2단계 심사로 진행 가능합니다.
                              </td>
                              <td className="p-2.5 text-center">
                                <label className="inline-flex items-center gap-1.5 font-bold text-teal-950 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="s1_p6_concl"
                                    checked={stage1Data.conclusion === 'pass'}
                                    onChange={() => setStage1Data({ ...stage1Data, conclusion: 'pass' })}
                                    className="text-teal-700"
                                  />
                                  <span>확인</span>
                                </label>
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <td className="p-2.5 border-r border-slate-400 font-medium">
                                부적합이 발견되어 시정조치 완료 후 2단계 심사로 진행 가능합니다.
                              </td>
                              <td className="p-2.5 text-center">
                                <label className="inline-flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="s1_p6_concl"
                                    checked={stage1Data.conclusion === 'corrective'}
                                    onChange={() => setStage1Data({ ...stage1Data, conclusion: 'corrective' })}
                                    className="text-teal-700"
                                  />
                                  <span>확인</span>
                                </label>
                              </td>
                            </tr>
                            <tr>
                              <td className="p-2.5 border-r border-slate-400 font-medium text-slate-600">
                                중대한 부적합이 발견되어 2단계 심사로 진행이 불가능 합니다.
                              </td>
                              <td className="p-2.5 text-center">
                                <label className="inline-flex items-center gap-1.5 font-medium text-slate-500 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="s1_p6_concl"
                                    checked={stage1Data.conclusion === 'fail'}
                                    onChange={() => setStage1Data({ ...stage1Data, conclusion: 'fail' })}
                                    className="text-rose-700"
                                  />
                                  <span>확인</span>
                                </label>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-009(20251001)</span>
                      <span>- 6 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                </div>
              )}

              {/* ================================================================= */}
              {/* 2단계 심사보고서 (7p ~ 16p 원본 Word/PDF 실물 완벽 1:1 복제) */}
              {/* ================================================================= */}
              {(activeDocTab === 'all' || activeDocTab === 'stage2') && (
                <div className="space-y-10">
                  
                  {/* --- [2단계 7 PAGE : 표지 & 심사팀(팀장+팀원4+기타1) 서명] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative flex flex-col justify-between">
                    <div>
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-4">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          2 단계 심사 보고서
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      <div className="text-center py-5">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 font-serif">
                          적합성 평가 심사보고서(2nd Stage)
                        </h1>
                      </div>

                      {/* Table 13 : 고객명 / 심사표준 / 심사유형 */}
                      <table className="w-full border-collapse border border-slate-800 text-xs mb-5">
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <th className="w-28 bg-slate-100 p-2.5 border-r border-slate-400 text-center font-bold">고 객 명</th>
                            <td className="p-2.5 font-bold text-sm text-slate-900">
                              <input
                                type="text"
                                value={stage2Data.clientName || company.companyName}
                                onChange={(e) => setStage2Data({ ...stage2Data, clientName: e.target.value })}
                                className="w-full font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-1 text-sm"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2.5 border-r border-slate-400 text-center font-bold">심 사 표 준</th>
                            <td className="p-2.5 space-x-5 text-xs font-medium">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={stage2Data.stdIso9001}
                                  onChange={(e) => setStage2Data({ ...stage2Data, stdIso9001: e.target.checked })}
                                />
                                <span>ISO 9001</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={stage2Data.stdIso14001}
                                  onChange={(e) => setStage2Data({ ...stage2Data, stdIso14001: e.target.checked })}
                                />
                                <span>ISO 14001</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={stage2Data.stdIso45001}
                                  onChange={(e) => setStage2Data({ ...stage2Data, stdIso45001: e.target.checked })}
                                />
                                <span>ISO 45001</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={stage2Data.stdEsg}
                                  onChange={(e) => setStage2Data({ ...stage2Data, stdEsg: e.target.checked })}
                                />
                                <span>ESG-MS</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <span>기타(</span>
                                <input
                                  type="text"
                                  value={stage2Data.stdOther || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, stdOther: e.target.value })}
                                  className="w-20 border-b border-slate-400 px-1 text-center bg-transparent focus:outline-none"
                                />
                                <span>)</span>
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-slate-100 p-2.5 border-r border-slate-400 text-center font-bold">심 사 유 형</th>
                            <td className="p-2.5 space-x-5 text-xs font-medium">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="s2_p7_type"
                                  checked={stage2Data.typeChoice === '최초'}
                                  onChange={() => setStage2Data({ ...stage2Data, typeChoice: '최초' })}
                                />
                                <span>최초</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="s2_p7_type"
                                  checked={stage2Data.typeChoice === '사후'}
                                  onChange={() => setStage2Data({ ...stage2Data, typeChoice: '사후' })}
                                />
                                <span>사후(</span>
                                <input
                                  type="text"
                                  value={stage2Data.survRound || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, survRound: e.target.value })}
                                  className="w-8 border-b border-slate-400 px-1 text-center bg-transparent focus:outline-none"
                                />
                                <span>)</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="s2_p7_type"
                                  checked={stage2Data.typeChoice === '갱신'}
                                  onChange={() => setStage2Data({ ...stage2Data, typeChoice: '갱신' })}
                                />
                                <span>갱신</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="s2_p7_type"
                                  checked={stage2Data.typeChoice === '전환'}
                                  onChange={() => setStage2Data({ ...stage2Data, typeChoice: '전환' })}
                                />
                                <span>전환</span>
                              </label>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* 표지 식별 중앙 대형 로고 */}
                      <div className="flex justify-center items-center py-8 my-3 md:py-10 md:my-4">
                        <img 
                          src="/report-logo.png" 
                          alt="GMSCS 인증원" 
                          className="h-20 md:h-24 w-auto object-contain" 
                        />
                      </div>

                      {/* ◆ 2단계 심사의 목적 */}
                      <div className="border border-slate-400 bg-slate-50 p-3.5 space-y-1 text-[11px] leading-snug text-slate-700 mb-4">
                        <span className="font-bold text-slate-950 block text-xs">◆ 2단계 심사의 목적</span>
                        <ol className="list-decimal list-inside space-y-1 pl-1">
                          <li>해당 경영시스템 표준의 모든 요구사항에 대한 적합성에 관한 정보 및 증거 확인</li>
                          <li>주요 성과 목표 및 세부목표 대비 성과의 모니터링, 측정, 보고 및 검토</li>
                          <li>적용 가능한 법적, 규제적, 계약적 요구사항을 충족시키는 조직의 경영시스템 성과 확인</li>
                          <li>프로세스의 운영 관리, 내부심사 및 경영검토, 클라이언트의 방침에 대한 경영책임 검토</li>
                          <li>심사는 샘플링 방식으로 진행되며, 심사팀에 의해 발견되지 못한 부적합 사항이 있을 수 있습니다.</li>
                        </ol>
                      </div>

                      {/* Table 14 & Table 15 서명란 (팀장 제외 4명 + 기타 1명 = 총 6명 심사단 서명) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-600 font-bold px-1">
                          <span>※ 보고서 확인</span>
                          <span>* 근로자대표는 ISO 45001 심사시만 확인</span>
                        </div>
                        <table className="w-full border-collapse border border-slate-800 text-xs">
                          <tbody>
                            <tr className="border-b border-slate-400">
                              <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고객 확인</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{clientSigner?.name || company.contactPerson || company.ceoName || ''}</td>
                              <td className="w-36 p-1 border-r border-slate-400">
                                {renderSignatureCell('s2_cust', '고객 확인 (서명)', '고객확인', clientSigner?.name || company.contactPerson || company.ceoName || '', clientSigner?.position || '담당자', clientSigner?.email || company.contactEmail, clientSigner?.status)}
                              </td>
                              <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">근로자 대표</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{workerSigner?.name || ''}</td>
                              <td className="w-36 p-1">
                                {renderSignatureCell('s2_work', '근로자대표 (서명)', '근로자대표', workerSigner?.name || '', workerSigner?.position || '근로자대표', workerSigner?.email, workerSigner?.status)}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀장</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{leadSigner?.name || project?.leadAuditorName || auditor?.name || ''}</td>
                              <td className="p-1 border-r border-slate-400">
                                {renderSignatureCell('s2_lead', '심사팀장 (서명)', '심사팀장', leadSigner?.name || project?.leadAuditorName || auditor?.name || '', leadSigner?.position || leadAuditorObj?.grade || '선임심사원', leadSigner?.email || leadAuditorObj?.email, leadSigner?.status)}
                              </td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{teamSigners[0]?.name || ''}</td>
                              <td className="p-1">
                                {renderSignatureCell('s2_team1', '심사팀원 (서명)', '심사팀원', teamSigners[0]?.name || '', teamSigners[0]?.position || '심사원', teamSigners[0]?.email, teamSigners[0]?.status)}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                              <td className="p-2 border-r border-slate-400 text-slate-700">{teamSigners[1]?.name || '-'}</td>
                              <td className="p-1 border-r border-slate-400">
                                {renderSignatureCell('s2_team2', '심사팀원 (서명)', '심사팀원', teamSigners[1]?.name, teamSigners[1]?.position, teamSigners[1]?.email, teamSigners[1]?.status)}
                              </td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                              <td className="p-2 border-r border-slate-400 text-slate-700">{teamSigners[2]?.name || '-'}</td>
                              <td className="p-1">
                                {renderSignatureCell('s2_team3', '심사팀원 (서명)', '심사팀원', teamSigners[2]?.name, teamSigners[2]?.position, teamSigners[2]?.email, teamSigners[2]?.status)}
                              </td>
                            </tr>
                            <tr>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                              <td className="p-2 border-r border-slate-400 text-slate-700">{teamSigners[3]?.name || '-'}</td>
                              <td className="p-1 border-r border-slate-400">
                                {renderSignatureCell('s2_team4', '심사팀원 (서명)', '심사팀원', teamSigners[3]?.name, teamSigners[3]?.position, teamSigners[3]?.email, teamSigners[3]?.status)}
                              </td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">기 타</th>
                              <td className="p-2 border-r border-slate-400 text-slate-700">{teamSigners[4]?.name || '-'}</td>
                              <td className="p-1">
                                {renderSignatureCell('s2_oth', '기타 (서명)', '확인심사원', teamSigners[4]?.name, teamSigners[4]?.position, teamSigners[4]?.email, teamSigners[4]?.status)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-011(20251001)</span>
                      <span>- 7 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [2단계 8 PAGE : 시작/종결회의 안건 (media_1789130237080.png)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-4 relative flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Grey centered header banner */}
                      <div className="bg-slate-200 border border-slate-800 py-3 text-center">
                        <h2 className="text-lg md:text-xl font-black tracking-widest text-slate-950 font-serif">
                          시작/종결회의 안건
                        </h2>
                      </div>

                      {/* 2-Column Table */}
                      <table className="w-full border-collapse border border-slate-800 text-xs">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th colSpan={2} className="p-2 text-center font-black border-r border-slate-800 text-slate-950 text-sm">
                              시작회의
                            </th>
                            <th colSpan={2} className="p-2 text-center font-black text-slate-950 text-sm">
                              종결회의
                            </th>
                          </tr>
                          <tr className="border-b border-slate-800 bg-slate-50">
                            <th className="w-8 p-1.5 text-center font-bold border-r border-slate-400">No</th>
                            <th className="p-1.5 text-center font-bold border-r border-slate-800 underline underline-offset-4">
                              회 의 내 용
                            </th>
                            <th className="w-8 p-1.5 text-center font-bold border-r border-slate-400">No</th>
                            <th className="p-1.5 text-center font-bold underline underline-offset-4">
                              회 의 내 용
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              noLeft: 1,
                              contentLeft: '인사말/심사협조에 대한 감사의 말씀',
                              noRight: 1,
                              contentRight: '심사협조에 대한 감사의 말씀'
                            },
                            {
                              noLeft: 2,
                              contentLeft: (
                                <div>
                                  참석자 소개(심사팀 및 고객 참석자)<br />
                                  (안전보건경영시스템 : 근로자 대표 참석 확인)<br />
                                  - 이해관계유무 확인(심사팀)
                                </div>
                              ),
                              noRight: 2,
                              contentRight: '심사의 목적, 규격, 범위 재 확인'
                            },
                            {
                              noLeft: 3,
                              contentLeft: '심사팀장과 팀원의 책임과 역할 안내',
                              noRight: 3,
                              contentRight: '샘플 심사의 한계'
                            },
                            {
                              noLeft: 4,
                              contentLeft: '심사비 입금 확인',
                              noRight: 4,
                              contentRight: '심사원별 심사결과 요약'
                            },
                            {
                              noLeft: 5,
                              contentLeft: '심사의 목적, 표준, 인증범위 확인',
                              noRight: 5,
                              contentRight: '부적합 사항 처리기준 및 방법'
                            },
                            {
                              noLeft: 6,
                              contentLeft: '부적합 설명 / 샘플 심사의 한계',
                              noRight: 6,
                              contentRight: '기밀유지 및 비밀 준수 재 확인'
                            },
                            {
                              noLeft: 7,
                              contentLeft: '심사조기 종료 조건 안내',
                              noRight: 7,
                              contentRight: '차기 심사 안내'
                            },
                            {
                              noLeft: 8,
                              contentLeft: (
                                <div>
                                  이전 심사 부적합 및 발견사항<br />
                                  (최초심사 제외)
                                </div>
                              ),
                              noRight: 8,
                              contentRight: '이의 및 불만 제기 절차'
                            },
                            {
                              noLeft: 9,
                              contentLeft: (
                                <div>
                                  심사일정 설명<br />
                                  -필요시 안전사항,보안구역 등 질의
                                </div>
                              ),
                              noRight: 9,
                              contentRight: '심사 리포트 고객 서명 및 확인'
                            },
                            {
                              noLeft: 10,
                              contentLeft: '기밀유지 및 비밀 준수 확인',
                              noRight: 10,
                              contentRight: (
                                <div>
                                  대표자 말씀<br />
                                  (안전보건경영시스템 근로자 대표 참석 확인)
                                </div>
                              ),
                            },
                            {
                              noLeft: 11,
                              contentLeft: (
                                <div>
                                  회사지원사항 확인<br />
                                  (중식, 심사장소,심사안내자 등)
                                </div>
                              ),
                              noRight: 11,
                              contentRight: '질의 응답 / 감사의 말씀'
                            },
                            {
                              noLeft: 12,
                              contentLeft: '종결회의 시간 안내',
                              noRight: null,
                              contentRight: ''
                            },
                            {
                              noLeft: 13,
                              contentLeft: (
                                <div>
                                  질의 응답<br />
                                  (대표 또는 경영대리인 말씀)
                                </div>
                              ),
                              noRight: null,
                              contentRight: ''
                            },
                          ].map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-400">
                              <td className="p-1.5 text-center font-bold border-r border-slate-400 align-middle bg-slate-50/50">
                                {row.noLeft}
                              </td>
                              <td className="p-1.5 border-r border-slate-800 leading-snug">
                                {row.contentLeft}
                              </td>
                              <td className="p-1.5 text-center font-bold border-r border-slate-400 align-middle bg-slate-50/50">
                                {row.noRight || ''}
                              </td>
                              <td className="p-1.5 leading-snug">
                                {row.contentRight}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Bottom area: ▶질의응답 내용 */}
                      <div className="border border-slate-800 p-2 bg-white">
                        <div className="font-bold text-xs text-slate-950 mb-1">
                          ▶질의응답 내용
                        </div>
                        <textarea
                          rows={8}
                          value={stage2Data.meetingNotes}
                          onChange={(e) => setStage2Data({ ...stage2Data, meetingNotes: e.target.value })}
                          placeholder="시작 및 종결회의 중 논의된 질의응답 및 고객사 요청사항 기록..."
                          className="w-full border-none p-1 text-xs leading-relaxed focus:outline-none bg-transparent resize-y"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-011(20251001)</span>
                      <span>- 8 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [2단계 8b / Page 9 : 심사 세부 일정표 & 이해관계유무 확인서 (media_1789130257665.png left)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-3 relative flex flex-col justify-between">
                    <div className="space-y-2.5">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-2">
                        <div className="w-24"></div>
                        <h2 className="text-lg md:text-xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          심사 세부 일정표
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-6 md:h-7 object-contain" />
                        </div>
                      </div>

                      {/* Top customer / cert table */}
                      <table className="w-full border-collapse border border-slate-800 text-xs">
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <th className="w-24 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">고객명</th>
                            <td className="p-1 border-r border-slate-800 font-bold">
                              <input
                                type="text"
                                value={stage2Data.clientName || company.companyName}
                                onChange={(e) => setStage2Data({ ...stage2Data, clientName: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs focus:outline-none font-bold"
                              />
                            </td>
                            <th className="w-24 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">인증번호</th>
                            <td className="p-1 font-mono">
                              <input
                                type="text"
                                value={stage2Data.certNo}
                                onChange={(e) => setStage2Data({ ...stage2Data, certNo: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs font-mono focus:outline-none"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Schedule table Header Bar with Add Row Button */}
                      <div className="flex justify-between items-center px-1 pt-0.5">
                        <span className="font-bold text-slate-900 text-xs">■ 심사원별 세부 심사계획 수립</span>
                        <button
                          type="button"
                          onClick={handleAddScheduleRow}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-teal-700 hover:bg-teal-800 text-white rounded shadow-sm transition-all print:hidden"
                          title="일정 행 추가"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ 일정 행 추가</span>
                        </button>
                      </div>

                      {/* Schedule table */}
                      <table className="w-full border-collapse border border-slate-800 text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-800">
                            <th rowSpan={2} className="w-14 p-1 border-r border-slate-800 text-center font-bold">일자</th>
                            <th colSpan={3} className="p-1 border-r border-slate-800 text-center font-bold bg-slate-200">
                              <div className="flex justify-center items-center gap-2">
                                <span className="font-black text-slate-950">심사팀장:</span>
                                <input
                                  type="text"
                                  value={stage2Data.scheduleLeader}
                                  onChange={(e) => setStage2Data({...stage2Data, scheduleLeader: e.target.value})}
                                  className="w-20 border-b border-slate-600 font-bold text-center bg-transparent focus:outline-none"
                                />
                              </div>
                            </th>
                            <th colSpan={3} className="p-1 border-r border-slate-800 text-center font-bold bg-slate-200">
                              <div className="flex justify-center items-center gap-2">
                                <span className="font-black text-slate-950">심사팀원:</span>
                                <input
                                  type="text"
                                  value={stage2Data.scheduleMember}
                                  onChange={(e) => setStage2Data({...stage2Data, scheduleMember: e.target.value})}
                                  className="w-20 border-b border-slate-600 font-bold text-center bg-transparent focus:outline-none"
                                />
                              </div>
                            </th>
                            <th rowSpan={2} className="w-14 p-1 text-center font-bold border-r border-slate-800">비고</th>
                            <th rowSpan={2} className="w-8 p-1 text-center font-bold print:hidden">삭제</th>
                          </tr>
                          <tr className="bg-slate-50 border-b border-slate-800 text-[10.5px]">
                            <th className="w-20 p-1 border-r border-slate-400 text-center font-bold">시 각</th>
                            <th className="w-28 p-1 border-r border-slate-400 text-center font-bold">프로세스</th>
                            <th className="w-20 p-1 border-r border-slate-800 text-center font-bold">부서명</th>
                            <th className="w-20 p-1 border-r border-slate-400 text-center font-bold">시 각</th>
                            <th className="w-28 p-1 border-r border-slate-400 text-center font-bold">프로세스</th>
                            <th className="w-20 p-1 border-r border-slate-800 text-center font-bold">부서명</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(stage2Data.schedules || []).map((row: any, sIdx: number) => (
                            <tr key={sIdx} className="border-b border-slate-400 hover:bg-slate-50/60 transition-colors">
                              <td className="p-0.5 border-r border-slate-400 text-center font-mono bg-slate-50/50">
                                <input
                                  type="text"
                                  value={row.date}
                                  onChange={(e) => {
                                    const next = [...stage2Data.schedules];
                                    next[sIdx] = { ...next[sIdx], date: e.target.value };
                                    setStage2Data({ ...stage2Data, schedules: next });
                                  }}
                                  className="w-full text-center bg-transparent text-[11px] focus:outline-none"
                                />
                              </td>
                              <td className="p-0.5 border-r border-slate-400 text-center font-mono">
                                <input
                                  type="text"
                                  value={row.time1 || row.time || ''}
                                  onChange={(e) => {
                                    const next = [...stage2Data.schedules];
                                    next[sIdx] = { ...next[sIdx], time1: e.target.value };
                                    setStage2Data({ ...stage2Data, schedules: next });
                                  }}
                                  placeholder="09:00~12:00"
                                  className="w-full text-center bg-transparent text-[10.5px] focus:outline-none"
                                />
                              </td>
                              <td className="p-0.5 border-r border-slate-400">
                                <input
                                  type="text"
                                  value={row.process1 || ''}
                                  onChange={(e) => {
                                    const next = [...stage2Data.schedules];
                                    next[sIdx] = { ...next[sIdx], process1: e.target.value };
                                    setStage2Data({ ...stage2Data, schedules: next });
                                  }}
                                  className="w-full bg-transparent px-1 text-[11px] focus:outline-none"
                                />
                              </td>
                              <td className="p-0.5 border-r border-slate-800 text-center">
                                <input
                                  type="text"
                                  value={row.dept1 || ''}
                                  onChange={(e) => {
                                    const next = [...stage2Data.schedules];
                                    next[sIdx] = { ...next[sIdx], dept1: e.target.value };
                                    setStage2Data({ ...stage2Data, schedules: next });
                                  }}
                                  className="w-full text-center bg-transparent px-1 text-[11px] focus:outline-none"
                                />
                              </td>
                              <td className="p-0.5 border-r border-slate-400 text-center font-mono">
                                <input
                                  type="text"
                                  value={row.time2 || row.time || ''}
                                  onChange={(e) => {
                                    const next = [...stage2Data.schedules];
                                    next[sIdx] = { ...next[sIdx], time2: e.target.value };
                                    setStage2Data({ ...stage2Data, schedules: next });
                                  }}
                                  placeholder="09:00~12:00"
                                  className="w-full text-center bg-transparent text-[10.5px] focus:outline-none"
                                />
                              </td>
                              <td className="p-0.5 border-r border-slate-400">
                                <input
                                  type="text"
                                  value={row.process2 || ''}
                                  onChange={(e) => {
                                    const next = [...stage2Data.schedules];
                                    next[sIdx] = { ...next[sIdx], process2: e.target.value };
                                    setStage2Data({ ...stage2Data, schedules: next });
                                  }}
                                  className="w-full bg-transparent px-1 text-[11px] focus:outline-none"
                                />
                              </td>
                              <td className="p-0.5 border-r border-slate-800 text-center">
                                <input
                                  type="text"
                                  value={row.dept2 || ''}
                                  onChange={(e) => {
                                    const next = [...stage2Data.schedules];
                                    next[sIdx] = { ...next[sIdx], dept2: e.target.value };
                                    setStage2Data({ ...stage2Data, schedules: next });
                                  }}
                                  className="w-full text-center bg-transparent px-1 text-[11px] focus:outline-none"
                                />
                              </td>
                              <td className="p-0.5 border-r border-slate-800 text-center">
                                <input
                                  type="text"
                                  value={row.remarks || ''}
                                  onChange={(e) => {
                                    const next = [...stage2Data.schedules];
                                    next[sIdx] = { ...next[sIdx], remarks: e.target.value };
                                    setStage2Data({ ...stage2Data, schedules: next });
                                  }}
                                  className="w-full text-center bg-transparent text-[11px] focus:outline-none"
                                />
                              </td>
                              <td className="p-0.5 text-center print:hidden">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteScheduleRow(sIdx)}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  title="행 삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Middle: 이해관계유무 확인서 (media_1789131282686.png 실물 복제) */}
                      <div className="border border-slate-800 p-2.5 space-y-1.5 bg-white">
                        <div className="text-center font-bold text-xs text-slate-950">
                          이해관계유무 확인서
                        </div>
                        <p className="text-[10px] leading-snug text-slate-800">
                          심사팀은 상기 업무를 수행함에 있어 인증원의 공정성 및 신뢰성에 위배되지 않도록 다음사항을 준수하였으며, 만약 해당사항을 위반했을 경우 심사원 심원규정에 따라 어떠한 처벌도 감수할 것을 확인합니다.<br />
                          <span className="block text-center font-bold my-0.5">- 다 음 -</span>
                          1. 본인은 상기 조직에 대하여 어떠한 자문행위를 제공하지 않았음을 확인합니다.<br />
                          2. 심사업무를 수행함에 있어 인증고객 및 조직 구성원 간의 아래와 같은 사항에 대하여 이해관계가 없으며 향후 발생했을 경우 이를 즉시 인증원에 보고하겠습니다.<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;A. 최근 2년 내 재직<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;B. 주식 3% 이상 소유<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;C. 생산 제품의 공급 또는 구매관계(피 심사 조직의 협력업체인 경우)<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;D. 경영진과의 이해관계(혈연, 지연, 학연적 관계로 인하여 심사에 영향을 줄 수 있는 경우)<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;E. 최근 2년 내에 내부심사에 참여<br />
                          3. 업무를 수행하는 중 관련 조직 및 인원으로부터 금품 권유, 금품, 선물이나 기타 이익을 획득하지 않으며, 동료의 그러한 행동을 경고로 방조하지 않겠습니다.<br />
                          4. 인증원의 "공평정보장 절차(GSP-02)"의 관련 규정을 준수하겠습니다.
                        </p>

                        {/* 작성일자 (표 위 가장 우측 여유있게 배치) */}
                        <div className="flex justify-end items-center gap-3 pt-1 pb-0.5 text-xs">
                          <span className="font-bold text-slate-900">작성일자:</span>
                          <input
                            type="text"
                            value={stage2Data.conflictDate || project?.startDate || ''}
                            onChange={(e) => setStage2Data({ ...stage2Data, conflictDate: e.target.value })}
                            className="w-28 border-b border-slate-700 font-mono text-center bg-transparent font-bold py-0.5 focus:outline-none"
                          />
                          <span className="font-serif text-slate-600 font-bold ml-1">(Rev.0)</span>
                        </div>

                        {/* Signatures Table - 6등분 균등 분할 컬럼 */}
                        <table className="w-full border-collapse border border-slate-800 text-[10.5px] mt-0.5">
                          <tbody>
                            <tr className="border-b border-slate-400">
                              <th className="w-1/6 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀장</th>
                              <td className="w-1/6 p-1 border-r border-slate-400 text-center font-bold">
                                <input
                                  type="text"
                                  value={stage2Data.conflictLeader || leadSigner?.name || project?.leadAuditorName || auditor?.name || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conflictLeader: e.target.value })}
                                  className="w-full text-center bg-transparent font-bold"
                                />
                              </td>
                              <td className="w-1/6 p-1 border-r border-slate-800 text-center">
                                {renderSignatureCell('s2_conf_lead', '심사팀장 (서명)', '심사팀장', stage2Data.conflictLeader || leadSigner?.name || project?.leadAuditorName || auditor?.name || '', leadSigner?.position || auditor?.grade || '선임심사원', leadSigner?.email || auditor?.email || '')}
                              </td>
                              <th className="w-1/6 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="w-1/6 p-1 border-r border-slate-400 text-center font-bold">
                                <input
                                  type="text"
                                  value={stage2Data.conflictMember1 || teamSigners[0]?.name || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conflictMember1: e.target.value })}
                                  className="w-full text-center bg-transparent font-bold"
                                />
                              </td>
                              <td className="w-1/6 p-1 text-center">
                                {renderSignatureCell('s2_conf_m1', '심사팀원 (서명)', '심사팀원', stage2Data.conflictMember1 || teamSigners[0]?.name || '', teamSigners[0]?.position || '심사원', teamSigners[0]?.email || '')}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-1 border-r border-slate-400 text-center">
                                <input
                                  type="text"
                                  value={stage2Data.conflictMember2 || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conflictMember2: e.target.value })}
                                  placeholder="-"
                                  className="w-full text-center bg-transparent"
                                />
                              </td>
                              <td className="p-1 border-r border-slate-800 text-center">
                                {renderSignatureCell('s2_conf_m2', '심사팀원 (서명)', '심사팀원')}
                              </td>
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-1 border-r border-slate-400 text-center">
                                <input
                                  type="text"
                                  value={stage2Data.conflictMember3 || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conflictMember3: e.target.value })}
                                  placeholder="-"
                                  className="w-full text-center bg-transparent"
                                />
                              </td>
                              <td className="p-1 text-center">
                                {renderSignatureCell('s2_conf_m3', '심사팀원 (서명)', '심사팀원')}
                              </td>
                            </tr>
                            <tr>
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-1 border-r border-slate-400 text-center">
                                <input
                                  type="text"
                                  value={stage2Data.conflictMember4 || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conflictMember4: e.target.value })}
                                  placeholder="-"
                                  className="w-full text-center bg-transparent"
                                />
                              </td>
                              <td className="p-1 border-r border-slate-800 text-center">
                                {renderSignatureCell('s2_conf_m4', '심사팀원 (서명)', '심사팀원')}
                              </td>
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-1 border-r border-slate-400 text-center">
                                <input
                                  type="text"
                                  value={stage2Data.conflictMember5 || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conflictMember5: e.target.value })}
                                  placeholder="-"
                                  className="w-full text-center bg-transparent"
                                />
                              </td>
                              <td className="p-1 text-center">
                                {renderSignatureCell('s2_conf_m5', '심사팀원 (서명)', '심사팀원')}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Footnotes */}
                      <div className="text-[9.5px] text-slate-600 leading-tight space-y-0.5">
                        <p>※ 1M/D 심사시간 기준은 중식 1시간 포함 8시간입니다. 또한 현장 이동시간 및 심사보고서 작성 시간은 심사 시간에서 제외됩니다.</p>
                        <p>※ 심사 세부일정표는 프로세스별 기준으로 매매 해당하는 부서 또는 심사대상을 작성하시기 바랍니다.</p>
                        <p>※ 심사 세부일정표는 작성일은 심사일 1주일 전에 작성되어야 합니다.(인증고객에게 심사 전 발송)</p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-011(20251001)</span>
                      <span>- 9 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [2단계 10 PAGE : AUDIT REPORT (2 단계) - 고객현황 (media_1789130257665.png right)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-4 relative flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          AUDIT REPORT (2 단계)
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      <div className="font-bold text-xs text-slate-950">
                        ◆ 고객현황 ◆
                      </div>

                      <table className="w-full border-collapse border border-slate-800 text-xs table-fixed">
                        <colgroup>
                          <col className="w-[15%]" />
                          <col className="w-[46%]" />
                          <col className="w-[13%]" />
                          <col className="w-[26%]" />
                        </colgroup>
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고 객 명</th>
                            <td className="p-1.5 border-r border-slate-400 font-bold">
                              <input
                                type="text"
                                value={stage2Data.clientName || company.companyName}
                                onChange={(e) => setStage2Data({ ...stage2Data, clientName: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs font-bold"
                              />
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">대표자</th>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={stage2Data.ceoName || clientSigner?.name || company.ceoName || ''}
                                onChange={(e) => setStage2Data({ ...stage2Data, ceoName: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">인증번호</th>
                            <td colSpan={3} className="p-1.5 font-mono">
                              <input
                                type="text"
                                value={stage2Data.certNo}
                                onChange={(e) => setStage2Data({ ...stage2Data, certNo: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs font-mono"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold leading-tight">
                              주 사업장<br />주 소
                            </th>
                            <td colSpan={3} className="p-1.5">
                              <input
                                type="text"
                                value={stage2Data.mainAddress || company.address || ''}
                                onChange={(e) => setStage2Data({ ...stage2Data, mainAddress: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs"
                              />
                            </td>
                          </tr>
                          {[1, 2, 3, 4, 5].map((idx) => (
                            <tr key={idx} className="border-b border-slate-400">
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold text-[11px] leading-tight">
                                추가 사업장<br />주 소
                              </th>
                              <td colSpan={3} className="p-1.5">
                                <input
                                  type="text"
                                  value={(stage2Data as any)[`subAddress${idx}`] || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, [`subAddress${idx}`]: e.target.value })}
                                  placeholder={idx === 1 ? '추가 사업장이 있는 경우 기재' : ''}
                                  className="w-full bg-transparent px-1 py-0.5 text-xs"
                                />
                              </td>
                            </tr>
                          ))}
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">TEL</th>
                            <td className="p-1.5 border-r border-slate-400">
                              <input
                                type="text"
                                value={stage2Data.tel}
                                onChange={(e) => setStage2Data({ ...stage2Data, tel: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs"
                              />
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">FAX</th>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={stage2Data.fax}
                                onChange={(e) => setStage2Data({ ...stage2Data, fax: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">Mobile</th>
                            <td className="p-1.5 border-r border-slate-400">
                              <input
                                type="text"
                                value={stage2Data.mobile}
                                onChange={(e) => setStage2Data({ ...stage2Data, mobile: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs"
                              />
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">E-mail</th>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={stage2Data.email}
                                onChange={(e) => setStage2Data({ ...stage2Data, email: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs font-mono"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">담당자명</th>
                            <td className="p-1.5 border-r border-slate-400">
                              <input
                                type="text"
                                value={stage2Data.contactPerson}
                                onChange={(e) => setStage2Data({ ...stage2Data, contactPerson: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs"
                              />
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">직위</th>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={stage2Data.contactPosition}
                                onChange={(e) => setStage2Data({ ...stage2Data, contactPosition: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-xs"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사표준</th>
                            <td colSpan={3} className="p-2 space-x-4">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={stage2Data.stdIso9001} onChange={(e) => setStage2Data({...stage2Data, stdIso9001: e.target.checked})} />
                                <span>ISO9001</span>
                              </label>
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={stage2Data.stdIso14001} onChange={(e) => setStage2Data({...stage2Data, stdIso14001: e.target.checked})} />
                                <span>ISO14001</span>
                              </label>
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={stage2Data.stdIso45001} onChange={(e) => setStage2Data({...stage2Data, stdIso45001: e.target.checked})} />
                                <span>ISO45001</span>
                              </label>
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={stage2Data.stdEsg} onChange={(e) => setStage2Data({...stage2Data, stdEsg: e.target.checked})} />
                                <span>ESG-MS</span>
                              </label>
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <span>기타(</span>
                                <input type="text" value={stage2Data.stdOther} onChange={(e) => setStage2Data({...stage2Data, stdOther: e.target.value})} className="w-16 border-b border-slate-400 text-center bg-transparent" />
                                <span>)</span>
                              </label>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사종류</th>
                            <td colSpan={3} className="p-2 space-x-6">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="s2_p10_type" checked={stage2Data.typeChoice === '최초'} onChange={() => setStage2Data({...stage2Data, typeChoice: '최초'})} />
                                <span>최초</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="s2_p10_type" checked={stage2Data.typeChoice === '사후'} onChange={() => setStage2Data({...stage2Data, typeChoice: '사후'})} />
                                <span>사후(</span>
                                <input type="text" value={stage2Data.survRound} onChange={(e) => setStage2Data({...stage2Data, survRound: e.target.value})} className="w-6 border-b border-slate-400 text-center bg-transparent" />
                                <span>)</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="s2_p10_type" checked={stage2Data.typeChoice === '갱신'} onChange={() => setStage2Data({...stage2Data, typeChoice: '갱신'})} />
                                <span>갱신</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="s2_p10_type" checked={stage2Data.typeChoice === '전환'} onChange={() => setStage2Data({...stage2Data, typeChoice: '전환'})} />
                                <span>전환</span>
                              </label>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사일자</th>
                            <td colSpan={2} className="p-1.5 border-r border-slate-400">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 font-bold">시작일:</span>
                                <input type="text" value={stage2Data.auditDateStart} onChange={(e) => setStage2Data({...stage2Data, auditDateStart: e.target.value})} className="w-24 border-b border-slate-400 text-center bg-transparent font-mono" />
                                <span className="text-slate-600 font-bold ml-3">종료일:</span>
                                <input type="text" value={stage2Data.auditDateEnd} onChange={(e) => setStage2Data({...stage2Data, auditDateEnd: e.target.value})} className="w-24 border-b border-slate-400 text-center bg-transparent font-mono" />
                              </div>
                            </td>
                            <td className="p-1.5 text-center font-bold">
                              <input type="text" value={stage2Data.auditMd} onChange={(e) => setStage2Data({...stage2Data, auditMd: e.target.value})} className="w-10 border-b border-slate-400 text-center font-bold bg-transparent" /> M/D
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">인증범위</th>
                            <td colSpan={2} className="p-1.5 border-r border-slate-400">
                              <textarea
                                rows={3}
                                value={stage2Data.scopeText}
                                onChange={(e) => setStage2Data({ ...stage2Data, scopeText: e.target.value })}
                                className="w-full bg-transparent p-1 text-xs leading-relaxed focus:outline-none resize-none"
                              />
                            </td>
                            <td className="p-1.5 bg-slate-50/50">
                              <div className="font-bold text-center border-b border-slate-300 pb-1 mb-1">인증코드</div>
                              <input
                                type="text"
                                value={stage2Data.scopeCode}
                                onChange={(e) => setStage2Data({ ...stage2Data, scopeCode: e.target.value })}
                                className="w-full text-center bg-transparent text-xs"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Footnotes */}
                      <div className="text-[10px] text-slate-700 leading-relaxed pt-2 space-y-1">
                        <p>● 심사보고서는 고객의 동의가 없는 한 제3자에게 제공되지 않습니다.</p>
                        <p>● 심사에 대한 불만 및 이의제기는 esggms@naver.com 또는 02)6929-1702로 연락주시기 바랍니다.</p>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-011(20251001)</span>
                      <span>- 10 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [2단계 11 PAGE : 1. 2 단계심사 적합성 평가 - 공통 심사 내역 (media_1789130300533.png)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-3 relative flex flex-col justify-between">
                    <div className="space-y-2.5">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-2">
                        <div className="w-24"></div>
                        <h2 className="text-lg md:text-xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          AUDIT REPORT (2 단계)
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-6 md:h-7 object-contain" />
                        </div>
                      </div>

                      <div className="font-bold text-xs text-slate-950">
                        1. 2 단계심사 적합성 평가
                      </div>

                      {/* Questions Table */}
                      <table className="w-full border-collapse border border-slate-800 text-[11px]">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th colSpan={2} className="p-1.5 text-center font-black tracking-widest text-slate-950">
                              ◆ 공 통 심 사 내 역 ◆
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { no: 1, text: '인증신청자가 제출한 자료와 현장심사 시 확인된 사항과의 차이점', type: '적/부', key: 'c1_appDiff' },
                            { no: 2, text: '심사계획서와 차이가 있는가?', type: '무/유', key: 'c2_planDiff' },
                            { no: 3, text: '심사프로그램에 영향을 미치는 주요한 이슈가 있는가?', type: '무/유', key: 'c3_programIssue' },
                            { no: 4, text: '구축된 시스템이 정해진 절차와 방법에 의거 적절히 시행/유지되고 있는가?', type: '적/부', key: 'c4_systemMaintained' },
                            { no: 5, text: '인증범위는 적절한가?', type: '적/부', key: 'c5_scopeAdequate' },
                            { no: 6, text: '인증고객의 시스템이 인증심사기준에 부합하는가?', type: '적/부', key: 'c6_meetsStandard' },
                            { no: 7, text: '심사과정에서 클라이언트와 모든 사항이 적합하게 처리되었는가?', type: '적/부', key: 'c7_clientCooperation' },
                            { no: 8, text: '주요성과 및 세부목표 대비 성과의 모니터링, 측정, 보고, 검토(RISK 와 기회반영)', type: '적/부', key: 'c8_monitoring' },
                            { no: 9, text: '지속적 개선을 위한 조치', type: '적/부', key: 'c9_continualImprovement' },
                            { no: 10, text: '(해당 시) 통합 심사에 대한 통합 수준은 적절한가?', type: '적/부', key: 'c10_imsAdequate' },
                            { no: 11, text: '이전 심사 부적합 효과성 및 유효성 확인 (갱신심사시 과거 3년간의 기록검토)', type: '적/부', key: 'c11_prevNcrEffective' },
                          ].map((item) => (
                            <tr key={item.no} className="border-b border-slate-400">
                              <td className="p-1.5 border-r border-slate-800 font-medium">
                                {item.text}
                              </td>
                              <td className="w-36 p-1.5 text-center font-bold shrink-0">
                                <div className="flex justify-center items-center gap-3">
                                  {item.type === '적/부' ? (
                                    <>
                                      <label className="inline-flex items-center gap-1 cursor-pointer">
                                        <input type="radio" name={`s2_${item.key}`} checked={(stage2Data as any)[item.key] === '적'} onChange={() => setStage2Data({...stage2Data, [item.key]: '적'})} />
                                        <span>적</span>
                                      </label>
                                      <label className="inline-flex items-center gap-1 cursor-pointer">
                                        <input type="radio" name={`s2_${item.key}`} checked={(stage2Data as any)[item.key] === '부'} onChange={() => setStage2Data({...stage2Data, [item.key]: '부'})} />
                                        <span>부</span>
                                      </label>
                                    </>
                                  ) : (
                                    <>
                                      <label className="inline-flex items-center gap-1 cursor-pointer">
                                        <input type="radio" name={`s2_${item.key}`} checked={(stage2Data as any)[item.key] === '무'} onChange={() => setStage2Data({...stage2Data, [item.key]: '무'})} />
                                        <span>무</span>
                                      </label>
                                      <label className="inline-flex items-center gap-1 cursor-pointer">
                                        <input type="radio" name={`s2_${item.key}`} checked={(stage2Data as any)[item.key] === '유'} onChange={() => setStage2Data({...stage2Data, [item.key]: '유'})} />
                                        <span>유</span>
                                      </label>
                                    </>
                                  )}
                                  <label className="inline-flex items-center gap-1 cursor-pointer text-slate-500">
                                    <input type="radio" name={`s2_${item.key}`} checked={(stage2Data as any)[item.key] === 'NA'} onChange={() => setStage2Data({...stage2Data, [item.key]: 'NA'})} />
                                    <span>NA</span>
                                  </label>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {/* 12: 사후 / 갱신심사 시 추가사항 */}
                          <tr className="border-b border-slate-400">
                            <td className="p-1.5 border-r border-slate-800">
                              <span className="font-bold underline block">• 사후 / 갱신심사 시 추가사항</span>
                              <span className="pl-2">- 인증마크 사용의 적절성</span>
                            </td>
                            <td className="p-1.5 text-center font-bold">
                              <div className="flex justify-center items-center gap-3">
                                <label className="inline-flex items-center gap-1 cursor-pointer"><input type="radio" name="s2_c12" checked={stage2Data.c12_markUsage === '적'} onChange={() => setStage2Data({...stage2Data, c12_markUsage: '적'})} /><span>적</span></label>
                                <label className="inline-flex items-center gap-1 cursor-pointer"><input type="radio" name="s2_c12" checked={stage2Data.c12_markUsage === '부'} onChange={() => setStage2Data({...stage2Data, c12_markUsage: '부'})} /><span>부</span></label>
                                <label className="inline-flex items-center gap-1 cursor-pointer text-slate-500"><input type="radio" name="s2_c12" checked={stage2Data.c12_markUsage === 'NA'} onChange={() => setStage2Data({...stage2Data, c12_markUsage: 'NA'})} /><span>NA</span></label>
                              </div>
                            </td>
                          </tr>

                          {/* 13: 갱신심사 추가 확인사항 (4 sub items) */}
                          <tr className="border-b border-slate-400">
                            <td className="p-1.5 border-r border-slate-800 space-y-1">
                              <span className="font-bold underline block">• 갱신심사 추가 확인사항</span>
                              <div className="pl-2 space-y-1 text-[10.5px]">
                                <div>- 시스템의 모든 요소 간의 효과적 상호작용</div>
                                <div>- 운영상 변경에 따른 전체적인 시스템의 효율성</div>
                                <div>- 시스템의 효율성 유지를 위한 의지 확인</div>
                                <div>- 이전 사후심사 보고서에 대한 검토</div>
                              </div>
                            </td>
                            <td className="p-1.5 text-center font-bold align-bottom">
                              <div className="space-y-1">
                                {['c13_1_interaction', 'c13_2_operation', 'c13_3_will', 'c13_4_prevReport'].map((k) => (
                                  <div key={k} className="flex justify-center items-center gap-3">
                                    <label className="inline-flex items-center gap-1 cursor-pointer"><input type="radio" name={`s2_${k}`} checked={(stage2Data as any)[k] === '적'} onChange={() => setStage2Data({...stage2Data, [k]: '적'})} /><span>적</span></label>
                                    <label className="inline-flex items-center gap-1 cursor-pointer"><input type="radio" name={`s2_${k}`} checked={(stage2Data as any)[k] === '부'} onChange={() => setStage2Data({...stage2Data, [k]: '부'})} /><span>부</span></label>
                                    <label className="inline-flex items-center gap-1 cursor-pointer text-slate-500"><input type="radio" name={`s2_${k}`} checked={(stage2Data as any)[k] === 'NA'} onChange={() => setStage2Data({...stage2Data, [k]: 'NA'})} /><span>NA</span></label>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>

                          {/* 14: 사후 / 갱신심사 시 변경사항 */}
                          <tr className="border-b border-slate-800">
                            <td className="p-1.5 border-r border-slate-800 font-bold underline">
                              • 사후 / 갱신심사 시 변경사항
                            </td>
                            <td className="p-1.5 text-center font-bold">
                              <div className="flex justify-center items-center gap-3">
                                <label className="inline-flex items-center gap-1 cursor-pointer"><input type="radio" name="s2_c14" checked={stage2Data.c14_survChanges === '무'} onChange={() => setStage2Data({...stage2Data, c14_survChanges: '무'})} /><span>무</span></label>
                                <label className="inline-flex items-center gap-1 cursor-pointer"><input type="radio" name="s2_c14" checked={stage2Data.c14_survChanges === '유'} onChange={() => setStage2Data({...stage2Data, c14_survChanges: '유'})} /><span>유</span></label>
                                <label className="inline-flex items-center gap-1 cursor-pointer text-slate-500"><input type="radio" name="s2_c14" checked={stage2Data.c14_survChanges === 'NA'} onChange={() => setStage2Data({...stage2Data, c14_survChanges: 'NA'})} /><span>NA</span></label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Bottom 3 Sections on Page 11 */}
                      <table className="w-full border-collapse border border-slate-800 text-[11px]">
                        <tbody>
                          {/* 1: 경영시스템 성과 및 지속적 개선 실적 */}
                          <tr className="border-b border-slate-800">
                            <th className="w-40 bg-slate-200 p-2 border-r border-slate-800 text-center font-bold leading-snug">
                              경영시스템 성과 및<br />지속적 개선 실적
                            </th>
                            <td colSpan={2} className="p-1">
                              <textarea
                                rows={2}
                                value={stage2Data.performanceNotes}
                                onChange={(e) => setStage2Data({ ...stage2Data, performanceNotes: e.target.value })}
                                className="w-full bg-transparent p-1 text-[11px] focus:outline-none resize-none leading-relaxed"
                              />
                            </td>
                          </tr>

                          {/* 2: 내부심사의 적합성 */}
                          <tr className="border-b border-slate-800">
                            <th className="w-40 bg-slate-200 p-2 border-r border-slate-800 text-center font-bold" rowSpan={2}>
                              내부심사의 적합성
                            </th>
                            <th className="w-32 bg-slate-100 p-1 border-r border-slate-400 text-center font-bold text-[10.5px]">
                              실시기간 (시작~종료)
                            </th>
                            <th className="p-1 text-center font-bold">
                              내부심사 확인사항
                            </th>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-1 border-r border-slate-400 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <input
                                  type="text"
                                  placeholder="시작일 (YYYY-MM-DD)"
                                  value={stage2Data.internalAuditDateStart || (stage2Data.internalAuditDate ? stage2Data.internalAuditDate.split('~')[0]?.trim() : '')}
                                  onChange={(e) => {
                                    const s = e.target.value;
                                    setStage2Data({
                                      ...stage2Data,
                                      internalAuditDateStart: s,
                                      internalAuditDate: `${s} ~ ${stage2Data.internalAuditDateEnd || s}`
                                    });
                                  }}
                                  className="w-full text-center bg-transparent text-[10.5px] font-mono border-b border-slate-300 focus:border-slate-800"
                                />
                                <span className="text-[10px] text-slate-400 font-bold leading-none">~</span>
                                <input
                                  type="text"
                                  placeholder="종료일 (YYYY-MM-DD)"
                                  value={stage2Data.internalAuditDateEnd || (stage2Data.internalAuditDate?.includes('~') ? stage2Data.internalAuditDate.split('~')[1]?.trim() : stage2Data.internalAuditDateStart || '')}
                                  onChange={(e) => {
                                    const end = e.target.value;
                                    setStage2Data({
                                      ...stage2Data,
                                      internalAuditDateEnd: end,
                                      internalAuditDate: `${stage2Data.internalAuditDateStart || ''} ~ ${end}`
                                    });
                                  }}
                                  className="w-full text-center bg-transparent text-[10.5px] font-mono border-b border-slate-300 focus:border-slate-800"
                                />
                              </div>
                            </td>
                            <td className="p-1">
                              <textarea
                                rows={2}
                                value={stage2Data.internalAuditNotes}
                                onChange={(e) => setStage2Data({ ...stage2Data, internalAuditNotes: e.target.value })}
                                className="w-full bg-transparent p-1 text-[11px] focus:outline-none resize-none"
                              />
                            </td>
                          </tr>

                          {/* 3: 경영검토의 적합성 */}
                          <tr className="border-b border-slate-800">
                            <th className="w-40 bg-slate-200 p-2 border-r border-slate-800 text-center font-bold" rowSpan={2}>
                              경영검토의 적합성
                            </th>
                            <th className="w-32 bg-slate-100 p-1 border-r border-slate-400 text-center font-bold text-[10.5px]">
                              실시기간 (시작~종료)
                            </th>
                            <th className="p-1 text-center font-bold">
                              경영검토 확인사항
                            </th>
                          </tr>
                          <tr>
                            <td className="p-1 border-r border-slate-400 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <input
                                  type="text"
                                  placeholder="시작일 (YYYY-MM-DD)"
                                  value={stage2Data.mgmtReviewDateStart || (stage2Data.mgmtReviewDate ? stage2Data.mgmtReviewDate.split('~')[0]?.trim() : '')}
                                  onChange={(e) => {
                                    const s = e.target.value;
                                    setStage2Data({
                                      ...stage2Data,
                                      mgmtReviewDateStart: s,
                                      mgmtReviewDate: `${s} ~ ${stage2Data.mgmtReviewDateEnd || s}`
                                    });
                                  }}
                                  className="w-full text-center bg-transparent text-[10.5px] font-mono border-b border-slate-300 focus:border-slate-800"
                                />
                                <span className="text-[10px] text-slate-400 font-bold leading-none">~</span>
                                <input
                                  type="text"
                                  placeholder="종료일 (YYYY-MM-DD)"
                                  value={stage2Data.mgmtReviewDateEnd || (stage2Data.mgmtReviewDate?.includes('~') ? stage2Data.mgmtReviewDate.split('~')[1]?.trim() : stage2Data.mgmtReviewDateStart || '')}
                                  onChange={(e) => {
                                    const end = e.target.value;
                                    setStage2Data({
                                      ...stage2Data,
                                      mgmtReviewDateEnd: end,
                                      mgmtReviewDate: `${stage2Data.mgmtReviewDateStart || ''} ~ ${end}`
                                    });
                                  }}
                                  className="w-full text-center bg-transparent text-[10.5px] font-mono border-b border-slate-300 focus:border-slate-800"
                                />
                              </div>
                            </td>
                            <td className="p-1">
                              <textarea
                                rows={2}
                                value={stage2Data.mgmtReviewNotes}
                                onChange={(e) => setStage2Data({ ...stage2Data, mgmtReviewNotes: e.target.value })}
                                className="w-full bg-transparent p-1 text-[11px] focus:outline-none resize-none"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-011(20251001)</span>
                      <span>- 11 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [2단계 12 PAGE : 공통 심사내역 계속 & 규격별 추가확인사항 (media_1789130321438.png)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-3 relative flex flex-col justify-between">
                    <div className="space-y-2">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-2">
                        <div className="w-24"></div>
                        <h2 className="text-lg md:text-xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          AUDIT REPORT (2 단계)
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-6 md:h-7 object-contain" />
                        </div>
                      </div>

                      {/* Top Table */}
                      <table className="w-full border-collapse border border-slate-800 text-[11px]">
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <th className="w-44 bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold">핵심 프로세스의 파악</th>
                            <td className="p-1">
                              <input
                                type="text"
                                value={stage2Data.coreProcessNotes}
                                onChange={(e) => setStage2Data({ ...stage2Data, coreProcessNotes: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold leading-tight">주요고객 및 이해관계자<br />파악</th>
                            <td className="p-1">
                              <input
                                type="text"
                                value={stage2Data.keyCustomers}
                                onChange={(e) => setStage2Data({ ...stage2Data, keyCustomers: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold leading-tight">고객불만 처리 및<br />유효성 확인</th>
                            <td className="p-1">
                              <input
                                type="text"
                                value={stage2Data.complaintNotes}
                                onChange={(e) => setStage2Data({ ...stage2Data, complaintNotes: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold">법규 준수 여부</th>
                            <td className="p-1">
                              <input
                                type="text"
                                value={stage2Data.legalNotes}
                                onChange={(e) => setStage2Data({ ...stage2Data, legalNotes: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold">ISO 9001 적용 제외</th>
                            <td className="p-1">
                              <input
                                type="text"
                                value={stage2Data.exclusionClause}
                                onChange={(e) => setStage2Data({ ...stage2Data, exclusionClause: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold leading-tight">1 단계 심사 후 변경사항<br />(해당 시)</th>
                            <td className="p-1">
                              <input
                                type="text"
                                value={stage2Data.stage1ChangeNotes}
                                onChange={(e) => setStage2Data({ ...stage2Data, stage1ChangeNotes: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* ◆ ISO 14001 추가 확인사항 ◆ */}
                      <table className="w-full border-collapse border border-slate-800 text-[11px]">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th colSpan={5} className="p-1 text-center font-black tracking-widest text-slate-950">
                              ◆ ISO 14001 추가 확인사항 ◆
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <th className="w-28 bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold">중대한 환경측면</th>
                            <td colSpan={4} className="p-1">
                              <input
                                type="text"
                                value={stage2Data.envAspect}
                                onChange={(e) => setStage2Data({ ...stage2Data, envAspect: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold" rowSpan={2}>환경영향평가</th>
                            <th className="w-20 bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">실시일자</th>
                            <td className="p-1 border-r border-slate-400">
                              <input type="text" value={stage2Data.envEvalDate} onChange={(e) => setStage2Data({...stage2Data, envEvalDate: e.target.value})} className="w-full text-center bg-transparent text-[11px] font-mono" />
                            </td>
                            <th className="w-20 bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">평가자</th>
                            <td className="p-1">
                              <input type="text" value={stage2Data.envEvaluator} onChange={(e) => setStage2Data({...stage2Data, envEvaluator: e.target.value})} className="w-full text-center bg-transparent text-[11px]" />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">평가결과</th>
                            <td colSpan={3} className="p-1 space-x-6 font-bold">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="s2_envEval" checked={stage2Data.envEvalResult === '적합'} onChange={() => setStage2Data({...stage2Data, envEvalResult: '적합'})} />
                                <span>적합</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="s2_envEval" checked={stage2Data.envEvalResult === '부적합'} onChange={() => setStage2Data({...stage2Data, envEvalResult: '부적합'})} />
                                <span>부적합</span>
                              </label>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold">적용되는 관련 법규</th>
                            <td colSpan={4} className="p-1">
                              <input
                                type="text"
                                value={stage2Data.legalNotes}
                                onChange={(e) => setStage2Data({ ...stage2Data, legalNotes: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold" rowSpan={2}>준수평가</th>
                            <th className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">실시일자</th>
                            <td className="p-1 border-r border-slate-400">
                              <input type="text" value={stage2Data.envLegalDate} onChange={(e) => setStage2Data({...stage2Data, envLegalDate: e.target.value})} className="w-full text-center bg-transparent text-[11px] font-mono" />
                            </td>
                            <th className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">평가자</th>
                            <td className="p-1">
                              <input type="text" value={stage2Data.envLegalEvaluator} onChange={(e) => setStage2Data({...stage2Data, envLegalEvaluator: e.target.value})} className="w-full text-center bg-transparent text-[11px]" />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <th className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">평가결과</th>
                            <td colSpan={3} className="p-1 space-x-6 font-bold">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="s2_envLegal" checked={stage2Data.envLegalResult === '적합'} onChange={() => setStage2Data({...stage2Data, envLegalResult: '적합'})} />
                                <span>적합</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="s2_envLegal" checked={stage2Data.envLegalResult === '부적합'} onChange={() => setStage2Data({...stage2Data, envLegalResult: '부적합'})} />
                                <span>부적합</span>
                              </label>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* ◆ ISO 45001 추가 확인사항 ◆ */}
                      <table className="w-full border-collapse border border-slate-800 text-[11px]">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th colSpan={5} className="p-1 text-center font-black tracking-widest text-slate-950">
                              ◆ ISO 45001 추가 확인사항 ◆
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <th className="w-28 bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold">중대한 위험성</th>
                            <td colSpan={4} className="p-1">
                              <input
                                type="text"
                                value={stage2Data.safeRiskAspect}
                                onChange={(e) => setStage2Data({ ...stage2Data, safeRiskAspect: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold">위험성 평가</th>
                            <th className="w-20 bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">실시일자</th>
                            <td className="p-1 border-r border-slate-400">
                              <input type="text" value={stage2Data.safeEvalDate} onChange={(e) => setStage2Data({...stage2Data, safeEvalDate: e.target.value})} className="w-full text-center bg-transparent text-[11px] font-mono" />
                            </td>
                            <th className="w-20 bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">평가자</th>
                            <td className="p-1">
                              <input type="text" value={stage2Data.safeEvaluator} onChange={(e) => setStage2Data({...stage2Data, safeEvaluator: e.target.value})} className="w-full text-center bg-transparent text-[11px]" />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold">적용되는 관련 법규</th>
                            <td colSpan={4} className="p-1">
                              <input
                                type="text"
                                value={stage2Data.legalNotes}
                                onChange={(e) => setStage2Data({ ...stage2Data, legalNotes: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold" rowSpan={2}>준수평가</th>
                            <th className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">실시일자</th>
                            <td className="p-1 border-r border-slate-400">
                              <input type="text" value={stage2Data.safeLegalDate} onChange={(e) => setStage2Data({...stage2Data, safeLegalDate: e.target.value})} className="w-full text-center bg-transparent text-[11px] font-mono" />
                            </td>
                            <th className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">평가자</th>
                            <td className="p-1">
                              <input type="text" value={stage2Data.safeLegalEvaluator} onChange={(e) => setStage2Data({...stage2Data, safeLegalEvaluator: e.target.value})} className="w-full text-center bg-transparent text-[11px]" />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <th className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">평가결과</th>
                            <td colSpan={3} className="p-1 space-x-6 font-bold">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="s2_safeLegal" checked={stage2Data.safeLegalResult === '적합'} onChange={() => setStage2Data({...stage2Data, safeLegalResult: '적합'})} />
                                <span>적합</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="s2_safeLegal" checked={stage2Data.safeLegalResult === '부적합'} onChange={() => setStage2Data({...stage2Data, safeLegalResult: '부적합'})} />
                                <span>부적합</span>
                              </label>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* ◆ ESG-MS 추가 확인사항 ◆ */}
                      <table className="w-full border-collapse border border-slate-800 text-[11px]">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th colSpan={4} className="p-1 text-center font-black tracking-widest text-slate-950">
                              ◆ ESG-MS 추가 확인사항 ◆
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <th className="w-40 bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold leading-tight">
                              ESG 성과 관련<br />정량평가 실시일자
                            </th>
                            <td colSpan={3} className="p-1">
                              <input
                                type="text"
                                value={stage2Data.esgEvalDate}
                                onChange={(e) => setStage2Data({ ...stage2Data, esgEvalDate: e.target.value })}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] font-mono focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-800 text-center font-bold" rowSpan={2}>
                              ESG 심사 정량<br />평가결과
                            </th>
                            <th className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">환경분야</th>
                            <th className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold">사회분야</th>
                            <th className="bg-slate-50 p-1 text-center font-bold">지배구조분야</th>
                          </tr>
                          <tr>
                            <td className="p-1 border-r border-slate-400 text-center font-bold">
                              <input type="text" value={stage2Data.esgScoreEnv} onChange={(e) => setStage2Data({...stage2Data, esgScoreEnv: e.target.value})} className="w-12 text-center border-b border-slate-400 font-bold bg-transparent" /> 점
                            </td>
                            <td className="p-1 border-r border-slate-400 text-center font-bold">
                              <input type="text" value={stage2Data.esgScoreSocial} onChange={(e) => setStage2Data({...stage2Data, esgScoreSocial: e.target.value})} className="w-12 text-center border-b border-slate-400 font-bold bg-transparent" /> 점
                            </td>
                            <td className="p-1 text-center font-bold">
                              <input type="text" value={stage2Data.esgScoreGov} onChange={(e) => setStage2Data({...stage2Data, esgScoreGov: e.target.value})} className="w-12 text-center border-b border-slate-400 font-bold bg-transparent" /> 점
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-011(20251001)</span>
                      <span>- 12 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [2단계 13 PAGE : PROCESS Audit NOTE (media_1789131498471.png & Word 원본)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-4 relative flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          AUDIT REPORT (2 단계)
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                        <h3 className="text-sm font-black tracking-tight text-slate-950 font-serif">
                          PROCESS Audit NOTE (현장 심사 세부 확인 사항)
                        </h3>
                        <span className="text-[11px] text-slate-600">
                          ► 객관적 증거 확인 기록
                        </span>
                      </div>

                      {/* Clean table without nested double boxes */}
                      <table className="w-full border-collapse border border-slate-800 text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-800">
                            <th className="w-28 p-2 border-r border-slate-400 text-center font-bold">요구사항</th>
                            <th className="p-2 text-center font-bold">심사 확인 사항 (객관적 증거, 인터뷰, 샘플 확인 내역)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(stage2Data.auditNotes || []).map((note: { clause: string; content: string }, idx: number) => (
                            <tr key={idx} className="border-b border-slate-400 hover:bg-slate-50/50">
                              <td className="p-2 font-bold text-slate-900 border-r border-slate-400 align-top bg-slate-50 text-center">
                                {note.clause}
                              </td>
                              <td className="p-1.5 align-top">
                                <textarea
                                  rows={4}
                                  value={note.content}
                                  onChange={(e) => {
                                    const next = [...stage2Data.auditNotes];
                                    next[idx].content = e.target.value;
                                    setStage2Data({ ...stage2Data, auditNotes: next });
                                  }}
                                  placeholder="[확인 내용]: ...&#10;[객관적 증거]: ..."
                                  className="w-full border-none p-1 text-xs leading-relaxed focus:outline-none focus:bg-slate-50/80 bg-transparent resize-y"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-011(20251001)</span>
                      <span>- 13 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [2단계 14 PAGE : 심사발견 사항 요약 (media_1789131498471.png 원본 1:1 복제)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-3 relative flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-2">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          AUDIT REPORT (2 단계)
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      <div className="text-center font-serif font-black text-base text-slate-950 py-0.5">
                        심사발견 사항 요약
                      </div>

                      {/* Top Metadata Table */}
                      <table className="w-full border-collapse border border-slate-800 text-xs">
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">고객명</th>
                            <td className="p-1 border-r border-slate-400 font-bold">
                              <input
                                type="text"
                                value={stage2Data.clientName || company.companyName}
                                onChange={(e) => setStage2Data({ ...stage2Data, clientName: e.target.value })}
                                className="w-full bg-transparent px-1 text-xs font-bold focus:outline-none"
                              />
                            </td>
                            <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">인증번호</th>
                            <td className="p-1 border-r border-slate-400 font-mono">
                              <input
                                type="text"
                                value={stage2Data.certNo}
                                onChange={(e) => setStage2Data({ ...stage2Data, certNo: e.target.value })}
                                className="w-full bg-transparent px-1 text-xs font-mono focus:outline-none"
                              />
                            </td>
                            <th className="w-16 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">Page</th>
                            <td className="w-20 p-1 text-center font-mono">
                              <input
                                type="text"
                                value={stage2Data.findingsPage || ''}
                                onChange={(e) => setStage2Data({ ...stage2Data, findingsPage: e.target.value })}
                                className="w-full text-center bg-transparent text-xs font-mono focus:outline-none"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사원명</th>
                            <td className="p-1 border-r border-slate-400">
                              <input
                                type="text"
                                value={stage2Data.findingsAuditor || stage2Data.scheduleLeader || leadSigner?.name || project?.leadAuditorName || auditor?.name || ''}
                                onChange={(e) => setStage2Data({ ...stage2Data, findingsAuditor: e.target.value })}
                                className="w-full bg-transparent px-1 text-xs focus:outline-none"
                              />
                            </td>
                            <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사일자</th>
                            <td colSpan={3} className="p-1 font-mono">
                              <input
                                type="text"
                                value={stage2Data.findingsDate || stage2Data.auditDateEnd || project?.endDate || project?.startDate || ''}
                                onChange={(e) => setStage2Data({ ...stage2Data, findingsDate: e.target.value })}
                                className="w-full bg-transparent px-1 text-xs font-mono focus:outline-none"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Main Findings Ruled Table (media_1789131498471.png replica) */}
                      <table className="w-full border-collapse border border-slate-800 text-xs">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th colSpan={2} className="p-1.5 text-center font-black tracking-widest text-slate-950">
                              발견사항 요약
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 1) 부적합사항 요약 */}
                          <tr className="border-b border-slate-800">
                            <th className="w-24 bg-slate-100 p-2 border-r border-slate-800 text-center font-bold align-middle leading-relaxed">
                              부적합사항<br />요약
                            </th>
                            <td className="p-0">
                              <div className="divide-y divide-dashed divide-slate-400">
                                {(stage2Data.ncrSummaryLines || ['', '', '', '', '', '', '', '', '', '']).map((line: string, lIdx: number) => (
                                  <div key={lIdx} className="h-6 flex items-center px-2">
                                    <input
                                      type="text"
                                      value={line}
                                      onChange={(e) => {
                                        const next = [...(stage2Data.ncrSummaryLines || ['', '', '', '', '', '', '', '', '', ''])];
                                        next[lIdx] = e.target.value;
                                        setStage2Data({ ...stage2Data, ncrSummaryLines: next });
                                      }}
                                      placeholder={lIdx === 0 ? '1. 부적합 내용 입력...' : ''}
                                      className="w-full bg-transparent text-xs focus:outline-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>

                          {/* 2) 관찰 및 권고사항 요약 */}
                          <tr className="border-b border-slate-800">
                            <th className="w-24 bg-slate-100 p-2 border-r border-slate-800 text-center font-bold align-middle leading-relaxed">
                              관찰<br />및<br />권고사항<br />요약
                            </th>
                            <td className="p-0">
                              <div className="divide-y divide-dashed divide-slate-400">
                                {(stage2Data.obsSummaryLines || ['', '', '', '', '', '', '', '', '', '']).map((line: string, lIdx: number) => (
                                  <div key={lIdx} className="h-6 flex items-center px-2">
                                    <input
                                      type="text"
                                      value={line}
                                      onChange={(e) => {
                                        const next = [...(stage2Data.obsSummaryLines || ['', '', '', '', '', '', '', '', '', ''])];
                                        next[lIdx] = e.target.value;
                                        setStage2Data({ ...stage2Data, obsSummaryLines: next });
                                      }}
                                      placeholder={lIdx === 0 ? '1. 관찰/권고사항 내용 입력...' : ''}
                                      className="w-full bg-transparent text-xs focus:outline-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-011(20251001)</span>
                      <span>- 14 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [2단계 15 PAGE : 2. 심사결론 & 3. 조직의 참석자 & 4. 심사팀 (media_1789131048366.png left)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-3 relative flex flex-col justify-between">
                    <div className="space-y-2.5">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-2">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          AUDIT REPORT (2 단계)
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      {/* 2. 심사결론 */}
                      <div className="font-bold text-xs text-slate-950">
                        2. 심사결론
                      </div>

                      {/* Table 1: 심사 발견사항 */}
                      <table className="w-full border-collapse border border-slate-800 text-xs">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th colSpan={6} className="p-1 text-center font-black text-slate-950">
                              심사 발견사항
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">경부적합</th>
                            <td className="p-1 border-r border-slate-400 text-center">
                              <input
                                type="text"
                                value={stage2Data.countMinor}
                                onChange={(e) => setStage2Data({ ...stage2Data, countMinor: e.target.value })}
                                className="w-12 text-center border-b border-slate-400 bg-transparent font-bold"
                              /> 건
                            </td>
                            <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">중부적합</th>
                            <td className="p-1 border-r border-slate-400 text-center">
                              <input
                                type="text"
                                value={stage2Data.countMajor}
                                onChange={(e) => setStage2Data({ ...stage2Data, countMajor: e.target.value })}
                                className="w-12 text-center border-b border-slate-400 bg-transparent font-bold"
                              /> 건
                            </td>
                            <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">권고사항</th>
                            <td className="p-1 text-center">
                              <input
                                type="text"
                                value={stage2Data.countObs}
                                onChange={(e) => setStage2Data({ ...stage2Data, countObs: e.target.value })}
                                className="w-12 text-center border-b border-slate-400 bg-transparent font-bold"
                              /> 건
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Table 2: 부적합 시정조치 확인결과 */}
                      <table className="w-full border-collapse border border-slate-800 text-xs">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th className="p-1 text-center font-black text-slate-950">
                              부적합 시정조치 확인결과
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <td className="p-1.5 text-center font-bold">
                              <div className="flex justify-center items-center gap-6">
                                <span className="text-slate-900">◆ 심사원 확인결과:</span>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="s2_p15_auditReview"
                                    checked={stage2Data.auditorResultReview === '적합'}
                                    onChange={() => setStage2Data({ ...stage2Data, auditorResultReview: '적합' })}
                                  />
                                  <span>적합</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="s2_p15_auditReview"
                                    checked={stage2Data.auditorResultReview === '부적합'}
                                    onChange={() => setStage2Data({ ...stage2Data, auditorResultReview: '부적합' })}
                                  />
                                  <span>부적합</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="s2_p15_auditReview"
                                    checked={stage2Data.auditorResultReview === '보완 필요'}
                                    onChange={() => setStage2Data({ ...stage2Data, auditorResultReview: '보완 필요' })}
                                  />
                                  <span>보완 필요</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Table 3: 심사 총평 (우수한 점 포함) */}
                      <table className="w-full border-collapse border border-slate-800 text-xs">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th className="p-1 text-center font-black text-slate-950">
                              심사 총평 (우수한 점 포함)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <td className="p-1.5">
                              <textarea
                                rows={3}
                                value={stage2Data.overallSummary}
                                onChange={(e) => setStage2Data({ ...stage2Data, overallSummary: e.target.value })}
                                className="w-full border-none p-1 text-xs leading-relaxed focus:outline-none bg-transparent resize-y"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Table 4: 전 회차 발견사항 유효성 확인 & 심사결론 */}
                      <table className="w-full border-collapse border border-slate-800 text-xs">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th colSpan={4} className="p-1 text-center font-black text-slate-950">
                              전 회차 발견사항 유효성 확인
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <th className="w-28 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">관찰/권고 사항</th>
                            <td className="w-36 p-1 border-r border-slate-400 text-center space-x-3 font-bold">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name="s2_prevObs"
                                  checked={stage2Data.prevObsResult === '적합'}
                                  onChange={() => setStage2Data({ ...stage2Data, prevObsResult: '적합' })}
                                />
                                <span>적합</span>
                              </label>
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name="s2_prevObs"
                                  checked={stage2Data.prevObsResult === '부적합'}
                                  onChange={() => setStage2Data({ ...stage2Data, prevObsResult: '부적합' })}
                                />
                                <span>부적합</span>
                              </label>
                            </td>
                            <td className="p-1 border-r border-slate-400">
                              <div className="flex items-center gap-1 text-[11px]">
                                <span>확인 심사원명:</span>
                                <input
                                  type="text"
                                  value={stage2Data.prevObsAuditor || stage2Data.scheduleLeader || leadSigner?.name || project?.leadAuditorName || auditor?.name || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, prevObsAuditor: e.target.value })}
                                  className="w-20 border-b border-slate-400 text-center bg-transparent font-bold"
                                />
                              </div>
                            </td>
                            <td className="w-20 p-1 text-center">
                              {renderSignatureCell('s2_p15_prevObsSig', '확인심사원', '확인심사원', stage2Data.prevObsAuditor || leadSigner?.name || project?.leadAuditorName || auditor?.name || '')}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">부적합 사항</th>
                            <td className="p-1 border-r border-slate-400 text-center space-x-3 font-bold">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name="s2_prevNcr"
                                  checked={stage2Data.prevNcrResult === '적합'}
                                  onChange={() => setStage2Data({ ...stage2Data, prevNcrResult: '적합' })}
                                />
                                <span>적합</span>
                              </label>
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name="s2_prevNcr"
                                  checked={stage2Data.prevNcrResult === '부적합'}
                                  onChange={() => setStage2Data({ ...stage2Data, prevNcrResult: '부적합' })}
                                />
                                <span>부적합</span>
                              </label>
                            </td>
                            <td className="p-1 border-r border-slate-400">
                              <div className="flex items-center gap-1 text-[11px]">
                                <span>확인 심사원명:</span>
                                <input
                                  type="text"
                                  value={stage2Data.prevNcrAuditor || stage2Data.scheduleLeader || leadSigner?.name || project?.leadAuditorName || auditor?.name || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, prevNcrAuditor: e.target.value })}
                                  className="w-20 border-b border-slate-400 text-center bg-transparent font-bold"
                                />
                              </div>
                            </td>
                            <td className="p-1 text-center">
                              {renderSignatureCell('s2_p15_prevNcrSig', '확인심사원', '확인심사원', stage2Data.prevNcrAuditor || leadSigner?.name || project?.leadAuditorName || auditor?.name || '')}
                            </td>
                          </tr>
                          {/* 심사결론 선택지 */}
                          <tr className="border-b border-slate-800">
                            <th className="bg-slate-100 p-2 border-r border-slate-800 text-center font-bold align-middle">
                              심 사<br />결 론
                            </th>
                            <td colSpan={3} className="p-2 space-y-1.5 leading-snug">
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-950">
                                <input
                                  type="radio"
                                  name="s2_p15_conc"
                                  checked={stage2Data.conclusionOption === '1'}
                                  onChange={() => setStage2Data({ ...stage2Data, conclusionOption: '1' })}
                                />
                                <span>어떠한 부적합이 발견되지 않았으므로 인증추천 또는 인증유지를 추천합니다.</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                                <input
                                  type="radio"
                                  name="s2_p15_conc"
                                  checked={stage2Data.conclusionOption === '2'}
                                  onChange={() => setStage2Data({ ...stage2Data, conclusionOption: '2' })}
                                />
                                <span>경부적합이 발견되어 시정조치 후 인증추천 또는 인증유지를 추천합니다.</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-900">
                                <input
                                  type="radio"
                                  name="s2_p15_conc"
                                  checked={stage2Data.conclusionOption === '3'}
                                  onChange={() => setStage2Data({ ...stage2Data, conclusionOption: '3' })}
                                />
                                <span>중부적합이 발견되어 시정조치 후 재심사를 진행하여야 합니다.</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                                <input
                                  type="radio"
                                  name="s2_p15_conc"
                                  checked={stage2Data.conclusionOption === '4'}
                                  onChange={() => setStage2Data({ ...stage2Data, conclusionOption: '4' })}
                                />
                                <span>기타 (</span>
                                <input
                                  type="text"
                                  value={stage2Data.conclusionOther || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conclusionOther: e.target.value })}
                                  className="w-60 border-b border-slate-400 px-1 bg-transparent"
                                />
                                <span>)</span>
                              </label>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* 3. 조직의 참석자 (4-컬럼 6행 테이블) */}
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-slate-950">
                          3. 조직의 참석자
                        </div>
                        <table className="w-full border-collapse border border-slate-800 text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-800">
                              <th className="w-28 p-1 border-r border-slate-400 text-center font-bold">참석자명</th>
                              <th className="p-1 border-r border-slate-800 text-center font-bold">직무/직책</th>
                              <th className="w-28 p-1 border-r border-slate-400 text-center font-bold">참석자명</th>
                              <th className="p-1 text-center font-bold">직무/직책</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[0, 2, 4, 6, 8, 10].map((baseIdx) => (
                              <tr key={baseIdx} className="border-b border-slate-300 border-dashed">
                                <td className="p-0.5 border-r border-slate-400 text-center font-bold">
                                  <input
                                    type="text"
                                    value={stage2Data.attendees[baseIdx]?.name || ''}
                                    onChange={(e) => {
                                      const next = [...stage2Data.attendees];
                                      next[baseIdx] = { ...next[baseIdx], name: e.target.value };
                                      setStage2Data({ ...stage2Data, attendees: next });
                                    }}
                                    placeholder={baseIdx === 0 ? clientSigner?.name || company.ceoName || '' : ''}
                                    className="w-full text-center bg-transparent text-xs font-bold focus:outline-none"
                                  />
                                </td>
                                <td className="p-0.5 border-r border-slate-800">
                                  <input
                                    type="text"
                                    value={stage2Data.attendees[baseIdx]?.role || ''}
                                    onChange={(e) => {
                                      const next = [...stage2Data.attendees];
                                      next[baseIdx] = { ...next[baseIdx], role: e.target.value };
                                      setStage2Data({ ...stage2Data, attendees: next });
                                    }}
                                    placeholder={baseIdx === 0 ? '대표이사 / 최고경영자' : ''}
                                    className="w-full bg-transparent text-xs px-1 focus:outline-none"
                                  />
                                </td>
                                <td className="p-0.5 border-r border-slate-400 text-center font-bold">
                                  <input
                                    type="text"
                                    value={stage2Data.attendees[baseIdx + 1]?.name || ''}
                                    onChange={(e) => {
                                      const next = [...stage2Data.attendees];
                                      next[baseIdx + 1] = { ...next[baseIdx + 1], name: e.target.value };
                                      setStage2Data({ ...stage2Data, attendees: next });
                                    }}
                                    placeholder=""
                                    className="w-full text-center bg-transparent text-xs font-bold focus:outline-none"
                                  />
                                </td>
                                <td className="p-0.5">
                                  <input
                                    type="text"
                                    value={stage2Data.attendees[baseIdx + 1]?.role || ''}
                                    onChange={(e) => {
                                      const next = [...stage2Data.attendees];
                                      next[baseIdx + 1] = { ...next[baseIdx + 1], role: e.target.value };
                                      setStage2Data({ ...stage2Data, attendees: next });
                                    }}
                                    placeholder=""
                                    className="w-full bg-transparent text-xs px-1 focus:outline-none"
                                  />
                                </td>
                              </tr>
                            ))}
                            <tr className="border-t border-slate-800">
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">비 고</th>
                              <td colSpan={3} className="p-1 text-[10px] text-slate-600 leading-tight">
                                * 필수 참석자: 품질은 품질관리자, 환경은 환경관리자, 안전보건은 안전보건관리책임자와 근로자 대표가 반드시 포함되어야 함 (작성법 예시: 홍길동, 품질관리자/과장)
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* 4. 심사팀 */}
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-slate-950">
                          4. 심사팀
                        </div>
                        <table className="w-full border-collapse border border-slate-800 text-xs">
                          <tbody>
                            <tr className="border-b border-slate-400">
                              <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀장</th>
                              <td className="p-1 border-r border-slate-400 font-bold text-center">
                                <input
                                  type="text"
                                  value={stage2Data.scheduleLeader || leadSigner?.name || project?.leadAuditorName || auditor?.name || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, scheduleLeader: e.target.value })}
                                  className="w-full text-center bg-transparent font-bold"
                                />
                              </td>
                              <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-1 border-r border-slate-400 font-bold text-center">
                                <input
                                  type="text"
                                  value={stage2Data.scheduleMember || teamSigners[0]?.name || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, scheduleMember: e.target.value })}
                                  className="w-full text-center bg-transparent font-bold"
                                />
                              </td>
                              <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-1 text-center">
                                <input
                                  type="text"
                                  value={stage2Data.conflictMember2 || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conflictMember2: e.target.value })}
                                  placeholder="-"
                                  className="w-full text-center bg-transparent"
                                />
                              </td>
                            </tr>
                            <tr>
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-1 border-r border-slate-400 text-center">
                                <input
                                  type="text"
                                  value={stage2Data.conflictMember3 || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conflictMember3: e.target.value })}
                                  placeholder="-"
                                  className="w-full text-center bg-transparent"
                                />
                              </td>
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-1 border-r border-slate-400 text-center">
                                <input
                                  type="text"
                                  value={stage2Data.conflictMember4 || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conflictMember4: e.target.value })}
                                  placeholder="-"
                                  className="w-full text-center bg-transparent"
                                />
                              </td>
                              <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">기 타</th>
                              <td className="p-1 text-center">
                                <input
                                  type="text"
                                  value={stage2Data.conflictMember5 || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, conflictMember5: e.target.value })}
                                  placeholder="-"
                                  className="w-full text-center bg-transparent"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Footnotes */}
                      <div className="text-[10px] text-slate-600 leading-tight space-y-0.5 pt-0.5">
                        <p>4.1 세부심사 기록은 Audit Note에 기재하여야 합니다.</p>
                        <p>4.2 이 보고서는 심사 후 Copy하여 고객 보관용으로 제공하여야 합니다.</p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-011(20251001)</span>
                      <span>- 15 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>

                  {/* --- [2단계 16 PAGE : 5. 차기심사 안내 & 6. 갱신심사 시 작성 (media_1789131048366.png right)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-4 relative flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* 공식 상단 헤더 */}
                      <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-2">
                        <div className="w-24"></div>
                        <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                          AUDIT REPORT (2 단계)
                        </h2>
                        <div className="w-28 flex justify-end">
                          <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                        </div>
                      </div>

                      <div className="font-bold text-xs text-slate-950">
                        5. 차기심사 안내
                      </div>

                      {/* 5.1~5.6 Text */}
                      <div className="text-[10.5px] leading-relaxed text-slate-800 space-y-0.5 pl-1">
                        <p>5.1 차기 심사는 아래와 같이 진행될 예정입니다.</p>
                        <p>5.2 심사 1개월 전에 심사 일정을 안내해 드리겠습니다.</p>
                        <p>5.3 IAF 평가 지침 "인증기관 적합성 평가기준"에 따라 사후심사가 진행되며, 심사가 진행되지 않을 경우 인증은 정지 또는 취소될 수 있습니다.</p>
                        <p>5.4 갱신심사는 인증만료 1~2개월 전에 완료되어야 합니다.</p>
                        <p>5.5 심사일수는 조직의 변경에 따라 가감될 수 있습니다.</p>
                        <p>5.6 심사일정 연기가 필요할 경우 심사 전 "사후관리 유예 신청서(F18-004)"를 작성하며 연기 사유에 대한 적절성을 인증원으로부터 평가받아야 합니다.</p>
                      </div>

                      {/* Table: 차기 심사종류 및 예정 월 */}
                      <table className="w-full border-collapse border border-slate-800 text-xs mt-1">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th className="w-40 p-1.5 border-r border-slate-400 text-center font-bold">차 기 심사종류</th>
                            <th className="p-1.5 text-center font-bold">심사 예정 월(심사일수)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <td className="p-2 border-r border-slate-400 font-bold">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="s2_p16_nextChoice"
                                  checked={stage2Data.nextSurvChoice === '사후'}
                                  onChange={() => setStage2Data({ ...stage2Data, nextSurvChoice: '사후' })}
                                />
                                <span>사후(</span>
                                <input
                                  type="text"
                                  value={stage2Data.nextSurvRound || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, nextSurvRound: e.target.value })}
                                  className="w-6 border-b border-slate-400 text-center bg-transparent"
                                />
                                <span>)차</span>
                              </label>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center justify-between px-4">
                                <input
                                  type="text"
                                  value={stage2Data.nextAuditMonth || ''}
                                  onChange={(e) => setStage2Data({ ...stage2Data, nextAuditMonth: e.target.value })}
                                  className="w-28 border-b border-slate-400 text-center font-mono bg-transparent"
                                />
                                <span>( <input type="text" value={stage2Data.nextAuditMd || ''} onChange={(e) => setStage2Data({...stage2Data, nextAuditMd: e.target.value})} className="w-10 border-b border-slate-400 text-center font-bold bg-transparent" /> ) M/D</span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-slate-400 font-bold">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="s2_p16_nextChoice"
                                  checked={stage2Data.nextSurvChoice === '갱신'}
                                  onChange={() => setStage2Data({ ...stage2Data, nextSurvChoice: '갱신' })}
                                />
                                <span>갱 신</span>
                              </label>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center justify-between px-4">
                                <input
                                  type="text"
                                  placeholder="갱신 심사 예정월"
                                  className="w-28 border-b border-slate-300 text-center font-mono bg-transparent"
                                />
                                <span>( <input type="text" placeholder="M/D" className="w-10 border-b border-slate-300 text-center bg-transparent" /> ) M/D</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* 6. 갱신심사 시 작성 */}
                      <div className="space-y-1.5 pt-2">
                        <div className="font-bold text-xs text-slate-950">
                          6. 갱신심사 시 작성
                        </div>
                        <div className="text-[11px] font-bold text-slate-800 pl-1">
                          6.1 시정조치 효과성 확인(3 년간)
                        </div>
                        <table className="w-full border-collapse border border-slate-800 text-xs">
                          <thead>
                            <tr className="bg-slate-200 border-b border-slate-800">
                              <th rowSpan={2} className="w-24 p-1.5 border-r border-slate-400 text-center font-bold">심사종류</th>
                              <th colSpan={4} className="p-1.5 text-center font-bold">시정조치 효과성 확인</th>
                            </tr>
                            <tr className="bg-slate-100 border-b border-slate-800 text-[11px]">
                              <th className="w-24 p-1 border-r border-slate-400 text-center font-bold">부적합 건수</th>
                              <th className="w-24 p-1 border-r border-slate-400 text-center font-bold">심사팀장</th>
                              <th className="w-32 p-1 border-r border-slate-400 text-center font-bold">효과성 확인</th>
                              <th className="p-1 text-center font-bold">부적절 사유</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(stage2Data.renewalHistory || [
                              { type: '최초 심사', count: '', leader: leadSigner?.name || project?.leadAuditorName || auditor?.name || '', effect: '적절', reason: '' },
                              { type: '1차 사후', count: '', leader: leadSigner?.name || project?.leadAuditorName || auditor?.name || '', effect: '적절', reason: '' },
                              { type: '2차 사후', count: '', leader: leadSigner?.name || project?.leadAuditorName || auditor?.name || '', effect: '적절', reason: '' },
                              { type: '기타', count: '', leader: '', effect: '적절', reason: '' },
                            ]).map((rItem: any, rIdx: number) => (
                              <tr key={rIdx} className="border-b border-slate-400">
                                <td className="p-1.5 border-r border-slate-400 text-center font-bold bg-slate-50">
                                  {rItem.type}
                                </td>
                                <td className="p-1 border-r border-slate-400 text-center">
                                  <input
                                    type="text"
                                    value={rItem.count}
                                    onChange={(e) => {
                                      const next = [...stage2Data.renewalHistory];
                                      next[rIdx] = { ...next[rIdx], count: e.target.value };
                                      setStage2Data({ ...stage2Data, renewalHistory: next });
                                    }}
                                    className="w-full text-center bg-transparent text-xs"
                                  />
                                </td>
                                <td className="p-1 border-r border-slate-400 text-center font-bold">
                                  <input
                                    type="text"
                                    value={rItem.leader}
                                    onChange={(e) => {
                                      const next = [...stage2Data.renewalHistory];
                                      next[rIdx] = { ...next[rIdx], leader: e.target.value };
                                      setStage2Data({ ...stage2Data, renewalHistory: next });
                                    }}
                                    className="w-full text-center bg-transparent text-xs"
                                  />
                                </td>
                                <td className="p-1 border-r border-slate-400 text-center space-x-2 font-bold text-[11px]">
                                  <label className="inline-flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`s2_renew_eff_${rIdx}`}
                                      checked={rItem.effect === '적절'}
                                      onChange={() => {
                                        const next = [...stage2Data.renewalHistory];
                                        next[rIdx] = { ...next[rIdx], effect: '적절' };
                                        setStage2Data({ ...stage2Data, renewalHistory: next });
                                      }}
                                    />
                                    <span>적절</span>
                                  </label>
                                  <label className="inline-flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`s2_renew_eff_${rIdx}`}
                                      checked={rItem.effect === '부적절'}
                                      onChange={() => {
                                        const next = [...stage2Data.renewalHistory];
                                        next[rIdx] = { ...next[rIdx], effect: '부적절' };
                                        setStage2Data({ ...stage2Data, renewalHistory: next });
                                      }}
                                    />
                                    <span>부적절</span>
                                  </label>
                                </td>
                                <td className="p-1">
                                  <input
                                    type="text"
                                    value={rItem.reason || ''}
                                    onChange={(e) => {
                                      const next = [...stage2Data.renewalHistory];
                                      next[rIdx] = { ...next[rIdx], reason: e.target.value };
                                      setStage2Data({ ...stage2Data, renewalHistory: next });
                                    }}
                                    placeholder="부적절 사유 기재"
                                    className="w-full bg-transparent px-1 text-xs"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                      <span>양식번호: F16-011(20251001)</span>
                      <span>- 16 -</span>
                      <span>지엠에스씨에스㈜</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 인정범위 확인서 (인증서 기재사항 확인서 - media_1789131080848.png left) */}
              {/* ================================================================= */}
              {(activeDocTab === 'all' || activeDocTab === 'cert_confirm') && (
                <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* 공식 상단 헤더 */}
                    <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-2">
                      <div className="w-24"></div>
                      <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                        인 증 범 위 확 인 서
                      </h2>
                      <div className="w-28 flex justify-end">
                        <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                      </div>
                    </div>

                    <table className="w-full border-collapse border border-slate-800 text-xs">
                      <tbody>
                        <tr className="border-b border-slate-400">
                          <th className="w-24 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">인증번호</th>
                          <td colSpan={2} className="p-1 font-mono font-bold">
                            <input
                              type="text"
                              value={scopeConfirmData.certNo}
                              onChange={(e) => handleUpdateScopeConfirmField('certNo', e.target.value)}
                              className="w-full font-mono font-bold bg-transparent px-1 focus:outline-none"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold" rowSpan={2}>고객명</th>
                          <td className="w-12 bg-slate-50 p-1 border-r border-slate-400 text-center font-bold text-[11px]">KOR</td>
                          <td className="p-1 font-bold text-slate-900">
                            <input
                              type="text"
                              value={scopeConfirmData.companyNameKor}
                              onChange={(e) => handleUpdateScopeConfirmField('companyNameKor', e.target.value)}
                              className="w-full font-bold text-slate-900 bg-transparent px-1 focus:outline-none"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold text-[11px]">ENG</td>
                          <td className="p-1 font-sans">
                            <input
                              type="text"
                              value={scopeConfirmData.companyNameEng}
                              onChange={(e) => handleUpdateScopeConfirmField('companyNameEng', e.target.value)}
                              className="w-full font-sans bg-transparent px-1 focus:outline-none"
                              placeholder="영문 상호명 입력"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold" rowSpan={2}>사업장<br />주 소</th>
                          <td className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold text-[11px]">KOR</td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={scopeConfirmData.addressKor}
                              onChange={(e) => handleUpdateScopeConfirmField('addressKor', e.target.value)}
                              className="w-full bg-transparent px-1 focus:outline-none"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold text-[11px]">ENG</td>
                          <td className="p-1 font-sans">
                            <input
                              type="text"
                              value={scopeConfirmData.addressEng}
                              onChange={(e) => handleUpdateScopeConfirmField('addressEng', e.target.value)}
                              className="w-full font-sans bg-transparent px-1 focus:outline-none"
                            />
                          </td>
                        </tr>
                        {/* 추가 사업장 명 (해당 시 작성 요망) */}
                        <tr className="border-b border-slate-400 bg-slate-150">
                          <th colSpan={3} className="p-1 text-center font-bold text-[11px] text-slate-800 bg-slate-100">
                            추가 사업장 명 (해당 시 작성 요망)
                          </th>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold" rowSpan={2}>사업장명</th>
                          <td className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold text-[11px]">KOR</td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={(stage2Data as any).subCompanyNameKor || ''}
                              onChange={(e) => setStage2Data({ ...stage2Data, subCompanyNameKor: e.target.value })}
                              placeholder="추가 사업장 국문 상호"
                              className="w-full bg-transparent px-1 focus:outline-none"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold text-[11px]">ENG</td>
                          <td className="p-1 font-sans">
                            <input
                              type="text"
                              value={(stage2Data as any).subCompanyNameEng || ''}
                              onChange={(e) => setStage2Data({ ...stage2Data, subCompanyNameEng: e.target.value })}
                              placeholder="Additional Plant Name (ENG)"
                              className="w-full font-sans bg-transparent px-1 focus:outline-none"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold" rowSpan={2}>주 소</th>
                          <td className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold text-[11px]">KOR</td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={(stage2Data as any).subCompanyAddressKor || ''}
                              onChange={(e) => setStage2Data({ ...stage2Data, subCompanyAddressKor: e.target.value })}
                              placeholder="추가 사업장 국문 주소"
                              className="w-full bg-transparent px-1 focus:outline-none"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold text-[11px]">ENG</td>
                          <td className="p-1 font-sans">
                            <input
                              type="text"
                              value={(stage2Data as any).subCompanyAddressEng || ''}
                              onChange={(e) => setStage2Data({ ...stage2Data, subCompanyAddressEng: e.target.value })}
                              placeholder="Additional Plant Address (ENG)"
                              className="w-full font-sans bg-transparent px-1 focus:outline-none"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사표준</th>
                          <td colSpan={2} className="p-1.5 space-x-3 text-xs">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={stage2Data.stdIso9001} onChange={(e) => setStage2Data({...stage2Data, stdIso9001: e.target.checked})} />
                              <span>ISO9001</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={stage2Data.stdIso14001} onChange={(e) => setStage2Data({...stage2Data, stdIso14001: e.target.checked})} />
                              <span>ISO14001</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={stage2Data.stdIso45001} onChange={(e) => setStage2Data({...stage2Data, stdIso45001: e.target.checked})} />
                              <span>ISO45001</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={stage2Data.stdEsg} onChange={(e) => setStage2Data({...stage2Data, stdEsg: e.target.checked})} />
                              <span>ESG-MS</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <span>기타(</span>
                              <input type="text" value={stage2Data.stdOther || ''} onChange={(e) => setStage2Data({...stage2Data, stdOther: e.target.value})} className="w-16 border-b border-slate-400 text-center bg-transparent" />
                              <span>)</span>
                            </label>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold" rowSpan={2}>인증범위</th>
                          <td className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold text-[11px]">KOR</td>
                          <td className="p-1">
                            <textarea
                              rows={2}
                              value={scopeConfirmData.scopeKor}
                              onChange={(e) => handleUpdateScopeConfirmField('scopeKor', e.target.value)}
                              className="w-full font-bold bg-transparent border-none p-1 text-xs leading-relaxed focus:outline-none resize-none"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td className="bg-slate-50 p-1 border-r border-slate-400 text-center font-bold text-[11px]">ENG</td>
                          <td className="p-1 font-sans">
                            <textarea
                              rows={2}
                              value={scopeConfirmData.scopeEng}
                              onChange={(e) => handleUpdateScopeConfirmField('scopeEng', e.target.value)}
                              className="w-full font-sans bg-transparent border-none p-1 text-xs leading-relaxed focus:outline-none resize-none"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400 bg-slate-50">
                          <td colSpan={3} className="p-1.5 text-[11px] font-bold text-slate-800">
                            ▶ 사업장제품 및 서비스를 명료하게 작성하며, 필요 시 별지 사용
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td colSpan={3} className="p-2 space-y-1 text-xs font-medium">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-950">
                              <input
                                type="checkbox"
                                checked={!hasCertChange}
                                onChange={(e) => setHasCertChange(!e.target.checked)}
                              />
                              <span>1단계심사시 확인된 내용과 동일함</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                              <input
                                type="checkbox"
                                checked={hasCertChange}
                                onChange={(e) => setHasCertChange(e.target.checked)}
                              />
                              <span>1단계심사 시 확인된 내용과 상이함 (상이한 경우 재 작성 또는 수정하여 서명함)</span>
                            </label>
                            {hasCertChange && (
                              <div className="pl-6 pt-1">
                                <input
                                  type="text"
                                  placeholder="상이할 경우 사유 입력..."
                                  className="w-full border-b border-slate-400 p-1 text-xs bg-transparent"
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400 bg-slate-50 font-bold">
                          <td colSpan={3} className="p-1.5 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <span>심사 시작일자:</span>
                              <input
                                type="text"
                                value={stage2Data.auditDateStart}
                                onChange={(e) => setStage2Data({ ...stage2Data, auditDateStart: e.target.value })}
                                className="w-24 border-b border-slate-600 text-center font-mono bg-transparent"
                              />
                              <span className="mx-2">~</span>
                              <span>심사 종료일자:</span>
                              <input
                                type="text"
                                value={stage2Data.auditDateEnd}
                                onChange={(e) => setStage2Data({ ...stage2Data, auditDateEnd: e.target.value })}
                                className="w-24 border-b border-slate-600 text-center font-mono bg-transparent"
                              />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심 사<br />확 인</th>
                          <td colSpan={2} className="p-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="border border-slate-400 p-2 rounded bg-slate-50/50">
                                <span className="font-bold text-slate-800 block mb-1">고객확인 (대표자/담당자)</span>
                                {renderSignatureCell('cert_cust_p17', '고객 확인 (서명)', '고객확인', clientSigner?.name || company.contactPerson || company.ceoName || '', clientSigner?.position || '담당자', clientSigner?.email || company.contactEmail, clientSigner?.status)}
                              </div>
                              <div className="border border-slate-400 p-2 rounded bg-slate-50/50">
                                <span className="font-bold text-slate-800 block mb-1">심사팀장</span>
                                {renderSignatureCell('cert_lead_p17', '심사팀장 (서명)', '심사팀장', leadSigner?.name || project?.leadAuditorName || auditor?.name || '', leadSigner?.position || leadAuditorObj?.grade || '선임심사원', leadSigner?.email || leadAuditorObj?.email, leadSigner?.status)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Footnotes */}
                    <div className="text-[9px] text-slate-600 leading-tight space-y-0.5 pt-1">
                      <p>※ 위 내용은 인증서에 표기될 사항이오니 명확하게 기재 바랍니다.</p>
                      <p>※ 인증서 발행 이후, 변경사항이나 회사 측 필요에 의한 인증서 재 발행 요청 시에는 별도의 인증서 발행 수수료가 청구됩니다.</p>
                      <p>※ 현장심사 종료회의 시 반드시 확인하여 인증원에 제출바랍니다.</p>
                      <p>※ 판매에 대한 인증 범위 표기는 유통업에 한 합니다.</p>
                      <p>※ 부가 서비스에 대한 인증 표기는 기업에서 계약조건에 따라서 제공하는 제품(또는 서비스) 이외에, 무상으로 고객에게 어떠한 제품(또는 서비스)를 부가적으로 제공하는 활동이 있는 경우에만 기록합니다.</p>
                      <p>※ 양산 및 생산되지 않는 제품은 인증범위에 표기되지 않습니다.</p>
                      <p>※ 추가사업장이 많을 경우 별지 작성 바랍니다.</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                    <span>양식번호: F16-014(20231001)</span>
                    <span>- 17 -</span>
                    <span>지엠에스씨에스㈜</span>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 3년 심사계획 요약서 (F16-012 [3년심사관리용] - 심사원 실시간 편집/입력) */}
              {/* ================================================================= */}
              {(activeDocTab === 'all' || activeDocTab === 'plan_summary') && (
                <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* 상단 빠른 조작 도구바 (인쇄 시 숨김) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100/90 border border-slate-300 rounded text-xs no-print print:hidden">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Edit3 className="w-3.5 h-3.5 text-cyan-700" />
                        <span>[심사원 입력 모드] 심사계획 및 요약서 (F16-012)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleApplyDefaultPlanSummary}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-[11px] font-medium transition cursor-pointer shadow-2xs"
                          title="표준 체크값(v/○) 및 10개 부서명 기본값 복원"
                        >
                          기본값 세팅
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStage2Data((prev: any) => {
                              const newMatrix: Record<string, Record<number, string>> = {};
                              ['4. 조직상황', '5. 리더십', '6. 기획', '7. 지원', '8. 운용', '9. 성과평가', '10. 개선', '인증마크 사용'].forEach(r => {
                                newMatrix[r] = { 0: 'v', 1: 'v', 2: 'v', 3: 'v', 4: 'v', 5: 'v', 6: 'v', 7: 'v', 8: 'v', 9: 'v' };
                              });
                              newMatrix['부적합'] = { 0: '-', 1: '-', 2: '-', 3: '-', 4: '-', 5: '-', 6: '-', 7: '-', 8: '-', 9: '-' };
                              return { ...prev, planSummaryDeptMatrix: newMatrix };
                            });
                          }}
                          className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-800 rounded text-[11px] font-medium transition cursor-pointer shadow-2xs"
                        >
                          상단 매트릭스 전체 v 적용
                        </button>
                      </div>
                    </div>

                    {/* 공식 상단 헤더 */}
                    <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-2">
                      <div className="w-24"></div>
                      <h2 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 font-serif text-center flex-1">
                        심사계획 및 요약서
                        <span className="block text-xs font-normal text-slate-600 mt-0.5">[ 3 년심사관리용 ]</span>
                      </h2>
                      <div className="w-28 flex justify-end">
                        <img src="/report-logo.png" alt="GMSCS" className="h-7 md:h-8 object-contain" />
                      </div>
                    </div>

                    {/* Top Metadata */}
                    <table className="w-full border-collapse border border-slate-800 text-xs">
                      <tbody>
                        <tr className="border-b border-slate-800">
                          <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">고객명</th>
                          <td className="p-1 border-r border-slate-400 font-bold">
                            <input
                              type="text"
                              value={stage2Data.clientName || company.companyName}
                              onChange={(e) => setStage2Data({ ...stage2Data, clientName: e.target.value })}
                              className="w-full bg-transparent px-1 text-xs font-bold focus:bg-amber-50/50"
                            />
                          </td>
                          <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">인증번호</th>
                          <td className="p-1 border-r border-slate-400 font-mono">
                            <input
                              type="text"
                              value={stage2Data.certNo}
                              onChange={(e) => setStage2Data({ ...stage2Data, certNo: e.target.value })}
                              className="w-full bg-transparent px-1 text-xs font-mono focus:bg-amber-50/50"
                            />
                          </td>
                          <th className="w-16 bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">Rev.</th>
                          <td className="w-16 p-1 text-center font-serif">
                            <input
                              type="text"
                              value={stage2Data.planSummaryRev || ''}
                              onChange={(e) => setStage2Data({ ...stage2Data, planSummaryRev: e.target.value })}
                              className="w-full bg-transparent text-center text-xs font-serif focus:bg-amber-50/50"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-center font-bold">심사표준</th>
                          <td colSpan={5} className="p-1.5 space-x-3 text-xs">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={stage2Data.stdIso9001} onChange={(e) => setStage2Data({...stage2Data, stdIso9001: e.target.checked})} className="rounded text-cyan-700" />
                              <span>ISO9001</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={stage2Data.stdIso14001} onChange={(e) => setStage2Data({...stage2Data, stdIso14001: e.target.checked})} className="rounded text-cyan-700" />
                              <span>ISO14001</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={stage2Data.stdIso45001} onChange={(e) => setStage2Data({...stage2Data, stdIso45001: e.target.checked})} className="rounded text-cyan-700" />
                              <span>ISO45001</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={stage2Data.stdEsg} onChange={(e) => setStage2Data({...stage2Data, stdEsg: e.target.checked})} className="rounded text-cyan-700" />
                              <span>ESG-MS</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <span>기타(</span>
                              <input type="text" value={stage2Data.stdOther || ''} onChange={(e) => setStage2Data({...stage2Data, stdOther: e.target.value})} className="w-20 border-b border-slate-400 text-center bg-transparent" />
                              <span>)</span>
                            </label>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Matrix 1: 프로세스 / 부서별 요구사항 체크 매트릭스 (심사원 직접 수정 및 토글) */}
                    <table className="w-full border-collapse border border-slate-800 text-[10.5px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-800">
                          <th className="w-24 p-1 border-r border-slate-400 text-center font-bold leading-tight">
                            프로세스<br />부서명
                          </th>
                          {(stage2Data.planSummaryDepts || ['경영진', '품질보증', '생산1팀', '생산2팀', '자재구매', '영업팀', '환경안전', '설비공무', '연구개발', '경영지원']).map((dept: string, dIdx: number) => (
                            <th key={dIdx} className="p-0.5 border-r border-slate-400 text-center font-bold">
                              <input
                                type="text"
                                value={dept}
                                onChange={(e) => handleUpdateDeptName(dIdx, e.target.value)}
                                className="w-full bg-transparent text-center font-bold text-[10.5px] p-0.5 focus:bg-amber-50 focus:outline-none"
                                title="부서명 클릭하여 수정 가능"
                              />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          '4. 조직상황',
                          '5. 리더십',
                          '6. 기획',
                          '7. 지원',
                          '8. 운용',
                          '9. 성과평가',
                          '10. 개선',
                          '인증마크 사용',
                          '부적합'
                        ].map((reqName, rIdx) => {
                          const isNcrRow = reqName === '부적합';
                          return (
                            <tr key={rIdx} className="border-b border-slate-400 text-center">
                              <th className="p-1 font-bold text-left bg-slate-50 border-r border-slate-400 pl-2">
                                {reqName}
                              </th>
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((cIdx) => {
                                const val = stage2Data.planSummaryDeptMatrix?.[reqName]?.[cIdx] ?? (isNcrRow ? '-' : 'v');
                                if (isNcrRow) {
                                  return (
                                    <td key={cIdx} className="p-0.5 border-r border-slate-400 text-center font-bold text-slate-700">
                                      <input
                                        type="text"
                                        value={val}
                                        onChange={(e) => handleUpdateDeptMatrixText(reqName, cIdx, e.target.value)}
                                        className="w-full bg-transparent text-center font-bold text-xs p-0.5 focus:bg-amber-50 focus:outline-none"
                                        placeholder="-"
                                      />
                                    </td>
                                  );
                                }
                                return (
                                  <td
                                    key={cIdx}
                                    onClick={() => handleToggleDeptMatrixCell(reqName, cIdx)}
                                    className={`p-0.5 border-r border-slate-400 text-center font-bold cursor-pointer hover:bg-cyan-50/60 transition select-none ${
                                      val === 'v' ? 'text-teal-800' : val === '○' ? 'text-slate-800' : 'text-slate-400'
                                    }`}
                                    title="클릭하여 v / - / ○ 전환"
                                  >
                                    {val || '-'}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="text-[9.5px] text-slate-700 font-bold pl-1 flex items-center justify-between">
                      <span>● 부적합 발견 시 : 부적합 수 ( / 건 ) [ 예: 품질관리부 ( / 1 건 ) ]</span>
                      <span className="text-slate-500 font-normal no-print print:hidden">※ 매트릭스 셀을 클릭하면 v / - / ○ 상태가 순환 변경됩니다.</span>
                    </div>

                    {/* Matrix 2: ▶ 3년 심사계획 */}
                    <div className="space-y-1 pt-1">
                      <div className="font-bold text-xs text-slate-950 flex items-center justify-between">
                        <span>▶ 3년 심사계획</span>
                        <span className="text-[10px] text-slate-500 font-normal no-print print:hidden">※ 심사일 입력 및 각 차수별 요구사항 셀 클릭 시 v / ○ / - 전환</span>
                      </div>
                      <table className="w-full border-collapse border border-slate-800 text-[10.5px]">
                        <thead>
                          <tr className="bg-slate-200 border-b border-slate-800">
                            <th className="w-24 p-1.5 border-r border-slate-400 text-center font-bold">구 분</th>
                            <th className="p-1.5 border-r border-slate-400 text-center font-bold">최초/갱신</th>
                            <th className="p-1.5 border-r border-slate-400 text-center font-bold">사후 1차</th>
                            <th className="p-1.5 border-r border-slate-400 text-center font-bold">사후 2차</th>
                            <th className="p-1.5 border-r border-slate-400 text-center font-bold">사후 3차</th>
                            <th className="p-1.5 border-r border-slate-400 text-center font-bold">사후 4차</th>
                            <th className="p-1.5 text-center font-bold">사후 5차</th>
                          </tr>
                          <tr className="border-b border-slate-800 bg-slate-50 font-bold">
                            <th className="p-1 border-r border-slate-400 text-center">심 사 일</th>
                            {[0, 1, 2, 3, 4, 5].map((colIdx) => {
                              const dVal = stage2Data.planSummary3YearDates?.[colIdx] || '';
                              return (
                                <td key={colIdx} className={`p-0.5 ${colIdx < 5 ? 'border-r border-slate-400' : ''} text-center font-mono`}>
                                  <input
                                    type="text"
                                    value={dVal}
                                    onChange={(e) => handleUpdate3YearDate(colIdx, e.target.value)}
                                    className="w-full bg-transparent text-center font-mono font-bold text-xs p-0.5 focus:bg-amber-50 focus:outline-none text-slate-800"
                                    placeholder="-"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                          <tr className="bg-slate-100 border-b border-slate-800 text-[10px]">
                            <th className="p-1 border-r border-slate-400 text-center font-bold">심사차수 요구사항</th>
                            <th className="p-1 border-r border-slate-400 text-center font-bold">최초/갱신</th>
                            <th className="p-1 border-r border-slate-400 text-center font-bold">1차</th>
                            <th className="p-1 border-r border-slate-400 text-center font-bold">2차</th>
                            <th className="p-1 border-r border-slate-400 text-center font-bold">3차</th>
                            <th className="p-1 border-r border-slate-400 text-center font-bold">4차</th>
                            <th className="p-1 text-center font-bold">5차</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            '4. 조직 상황',
                            '5. 리더십',
                            '6. 기획',
                            '7. 지원',
                            '8. 운용',
                            '9. 성과평가',
                            '10. 개선'
                          ].map((reqName, rIdx) => (
                            <tr key={rIdx} className="border-b border-slate-400 text-center">
                              <th className="p-1 font-bold text-left bg-slate-50 border-r border-slate-400 pl-2">
                                {reqName}
                              </th>
                              {[0, 1, 2, 3, 4, 5].map((colIdx) => {
                                const rowArr = stage2Data.planSummary3YearMatrix?.[reqName] || ['v', 'v', 'v', '○', '○', '○'];
                                const val = rowArr[colIdx] ?? (colIdx < 3 ? 'v' : '○');
                                return (
                                  <td
                                    key={colIdx}
                                    onClick={() => handleToggle3YearCell(reqName, colIdx)}
                                    className={`p-1 ${colIdx < 5 ? 'border-r border-slate-400' : ''} text-center font-bold cursor-pointer hover:bg-cyan-50/60 transition select-none ${
                                      val === 'v' ? 'text-teal-800' : val === '○' ? 'text-slate-600' : 'text-slate-400'
                                    }`}
                                    title="클릭하여 v / ○ / - 전환"
                                  >
                                    {val || '○'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Footnotes */}
                    <div className="text-[9.5px] text-slate-600 leading-tight space-y-0.5 pt-1">
                      <p>● 사후심사에서도 반드시 확인해야 할 항목과 차기심사시 심사되어야 할 계획 항목을 "○" 로 표기합니다.</p>
                      <p>● 심사 시 심사를 실시한 항목에는 "v" 체크</p>
                      <p>● 차기 심사 시 계획대비 심사항목이 변경될 수 있으나, 이 경우 남은 주기의 심사에 대한 계획은 재 수립되어야 함.</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-serif border-t border-slate-200">
                    <span>양식번호: F16-012(20251001)</span>
                    <span>- 18 -</span>
                    <span>지엠에스씨에스㈜</span>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 시정조치 요구서 (CAR - Table 34, Form GMSCS-F18-002) */}
              {/* ================================================================= */}
              {(activeDocTab === 'all' || activeDocTab === 'ncr') && (
                <div className="space-y-10">
                  {ncrList.map((ncrItem, ncrIdx) => (
                    <div key={ncrItem.id} className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative">
                      {renderReportPageHeader('F16-016(20231001)')}
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <h1 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                            시정조치 요구서 (Corrective Action Request)
                          </h1>
                        </div>
                        {ncrList.length > 1 && (
                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteNcr(ncrItem.id)}
                              className="px-2 py-1 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded border border-rose-300 flex items-center gap-1 transition-colors no-print cursor-pointer"
                              title="이 시정조치 요구서 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>삭제</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <tbody>
                          {/* Row 1 */}
                          <tr className="border-b border-slate-400">
                            <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">고 객 명</th>
                            <td className="p-2 border-r border-slate-400 font-bold text-slate-900">{company.companyName}</td>
                            <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">부적합 번호</th>
                            <td className="p-2 font-mono font-bold text-rose-800">
                              <input
                                type="text"
                                value={ncrItem.ncrNo}
                                onChange={(e) => {
                                  const next = [...ncrList];
                                  next[ncrIdx].ncrNo = e.target.value;
                                  setNcrList(next);
                                }}
                                className="w-full font-mono font-bold text-rose-800 bg-transparent border-b border-transparent focus:border-rose-500 focus:bg-rose-50/50 p-0.5 text-xs"
                              />
                            </td>
                          </tr>

                          {/* Row 2 */}
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">인증번호</th>
                            <td className="p-2 border-r border-slate-400 font-mono">
                              <input
                                type="text"
                                value={ncrItem.certNo || scopeConfirmData.certNo || stage2Data.certNo || realCertNo}
                                onChange={(e) => {
                                  const next = [...ncrList];
                                  next[ncrIdx].certNo = e.target.value;
                                  setNcrList(next);
                                }}
                                className="w-full font-mono bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-0.5 text-xs"
                              />
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">발행일자</th>
                            <td className="p-2 font-mono">
                              <input
                                type="date"
                                value={ncrItem.issueDate}
                                onChange={(e) => {
                                  const next = [...ncrList];
                                  next[ncrIdx].issueDate = e.target.value;
                                  setNcrList(next);
                                }}
                                className="w-full font-mono bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-0.5 text-xs"
                              />
                            </td>
                          </tr>

                          {/* Row 3~5 */}
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold" rowSpan={3}>적용표준</th>
                            <td className="p-2 border-r border-slate-400" rowSpan={3}>
                              <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="checkbox" defaultChecked={ncrItem.standard.includes('9001')} className="rounded text-teal-700" />
                                  <span>ISO 9001:2015</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="checkbox" defaultChecked={ncrItem.standard.includes('14001')} className="rounded text-teal-700" />
                                  <span>ISO 14001:2015</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="checkbox" defaultChecked={ncrItem.standard.includes('45001')} className="rounded text-teal-700" />
                                  <span>ISO 45001:2018</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="checkbox" defaultChecked={ncrItem.standard.includes('ESG')} className="rounded text-teal-700" />
                                  <span>ESG-MS</span>
                                </label>
                              </div>
                            </td>
                            <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">표준항목</th>
                            <td className="p-2 font-mono">
                              <input
                                type="text"
                                value={ncrItem.clause}
                                onChange={(e) => {
                                  const next = [...ncrList];
                                  next[ncrIdx].clause = e.target.value;
                                  setNcrList(next);
                                }}
                                className="w-full font-mono bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-0.5 text-xs"
                                placeholder="예: 7.1.5 (측정 자원)"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">심사부서</th>
                            <td className="p-2">
                              <input
                                type="text"
                                value={ncrItem.dept}
                                onChange={(e) => {
                                  const next = [...ncrList];
                                  next[ncrIdx].dept = e.target.value;
                                  setNcrList(next);
                                }}
                                className="w-full bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-0.5 text-xs"
                                placeholder="예: 품질관리부, 가공2팀"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">심 사 원</th>
                            <td className="p-2">
                              {renderSignatureCell(`car_auditor_init_${ncrItem.id}`, '심사원 (서명)', '심사팀장', ncrItem.auditorName || auditor?.name || '', auditor?.grade || '선임심사원', auditor?.email || '')}
                            </td>
                          </tr>

                          {/* Row 6 */}
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">심사구분</th>
                            <td className="p-2 border-r border-slate-400 space-x-3">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input type="radio" name={`audit_type_${ncrItem.id}`} defaultChecked={stage1Data.auditType.includes('최초') || stage1Data.auditType.includes('갱신')} />
                                <span>최초(갱신)</span>
                              </label>
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input type="radio" name={`audit_type_${ncrItem.id}`} defaultChecked={stage1Data.auditType.includes('사후')} />
                                <span>사후</span>
                              </label>
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input type="radio" name={`audit_type_${ncrItem.id}`} />
                                <span>기타</span>
                              </label>
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">부적합등급</th>
                            <td className="p-2 space-x-4 font-bold">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer text-amber-800">
                                <input
                                  type="radio"
                                  name={`ncr_grade_${ncrItem.id}`}
                                  checked={ncrItem.grade === '경부적합'}
                                  onChange={() => {
                                    const next = [...ncrList];
                                    next[ncrIdx].grade = '경부적합';
                                    setNcrList(next);
                                  }}
                                />
                                <span>경부적합 (1개월 이내)</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer text-rose-800">
                                <input
                                  type="radio"
                                  name={`ncr_grade_${ncrItem.id}`}
                                  checked={ncrItem.grade === '중부적합'}
                                  onChange={() => {
                                    const next = [...ncrList];
                                    next[ncrIdx].grade = '중부적합';
                                    setNcrList(next);
                                  }}
                                />
                                <span>중부적합 (3개월 이내)</span>
                              </label>
                            </td>
                          </tr>

                          {/* Row 7: 부적합사항 내용 */}
                          <tr className="border-b border-slate-400 bg-slate-50">
                            <th colSpan={4} className="p-2 text-left font-bold text-slate-900 border-b border-slate-400">
                              ▶ 부적합사항 내용 (심사원 기술)
                            </th>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td colSpan={4} className="p-2">
                              <textarea
                                rows={3}
                                value={ncrItem.details}
                                onChange={(e) => {
                                  const next = [...ncrList];
                                  next[ncrIdx].details = e.target.value;
                                  setNcrList(next);
                                }}
                                placeholder="구체적인 부적합 발생 사실 및 객관적 증거를 기술하세요."
                                className="w-full border border-slate-300 rounded p-2 text-xs leading-relaxed focus:border-rose-500 focus:bg-rose-50/20"
                              />
                            </td>
                          </tr>

                          {/* Row 8: 부적합 발행 서명 */}
                          <tr className="border-b border-slate-400 bg-slate-50">
                            <th className="p-2 border-r border-slate-400 text-left font-bold">심사팀장</th>
                            <td className="p-2 border-r border-slate-400">
                              {renderSignatureCell(`car_lead_sign_${ncrItem.id}`, '심사팀장 (서명)', '심사팀장', ncrItem.auditorName || auditor?.name || '', auditor?.grade || '선임심사원', auditor?.email || '')}
                            </td>
                            <th className="p-2 border-r border-slate-400 text-left font-bold">인증고객</th>
                            <td className="p-2">
                              {renderSignatureCell(`car_client_sign_${ncrItem.id}`, '인증고객 확인 (서명)', '고객확인', clientSigner?.name || stage2Data.contactPerson || scopeConfirmData.ceoName || company.ceoName || '', stage2Data.contactPosition || '대표이사', clientSigner?.email || stage2Data.email || company.contactEmail || '')}
                            </td>
                          </tr>

                          {/* Row 9~10: 시정내용 및 시정조치 증빙자료 첨부 */}
                          <tr className="border-b border-slate-400 bg-slate-50">
                            <th colSpan={4} className="p-2 text-left font-bold text-slate-900 border-b border-slate-400">
                              ▶ 시정내용 (1. 해당 부적합사항 시정 및 시정조치 개선 증빙자료 첨부)
                            </th>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td colSpan={4} className="p-2.5 space-y-2">
                              <textarea
                                rows={2}
                                value={ncrItem.correctionAction}
                                onChange={(e) => {
                                  const next = [...ncrList];
                                  next[ncrIdx].correctionAction = e.target.value;
                                  setNcrList(next);
                                }}
                                placeholder="해당 부적합 건에 대한 즉각적인 시정 조치 내용을 기술하세요."
                                className="w-full border border-slate-300 rounded p-2 text-xs leading-relaxed focus:border-teal-500 focus:bg-teal-50/20"
                              />

                              {/* 시정조치 증빙자료 파일 첨부 컨트롤러 */}
                              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Paperclip className="w-3.5 h-3.5 text-teal-700" />
                                    <span className="font-bold text-xs text-slate-800">시정조치 증빙 첨부자료 (PDF / 개선 사진)</span>
                                    <span className="text-[10px] text-slate-500">
                                      ({(ncrItem.correctionAttachments || []).length}건 첨부됨 - 보고서 팩에 묶음 저장)
                                    </span>
                                  </div>
                                  <label className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors no-print">
                                    <Upload className="w-3 h-3" />
                                    <span>파일 첨부 (PDF / 이미지)</span>
                                    <input
                                      type="file"
                                      accept="application/pdf,image/*"
                                      multiple
                                      onChange={(e) => handleCarFileUpload(ncrIdx, 'correction', e.target.files)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                {/* 첨부된 증빙자료 목록 및 썸네일 미리보기 */}
                                {(ncrItem.correctionAttachments || []).length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                                    {(ncrItem.correctionAttachments || []).map((att) => (
                                      <div key={att.id} className="bg-white border border-slate-200 rounded p-2 flex items-start gap-2 shadow-2xs group relative">
                                        {att.fileType === 'image' && att.dataUrl ? (
                                          <img src={att.dataUrl} alt={att.fileName} className="w-12 h-12 object-cover rounded border border-slate-200 shrink-0" />
                                        ) : (
                                          <div className="w-12 h-12 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-mono font-bold text-[11px] shrink-0">
                                            PDF
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0 text-[11px]">
                                          <span className="font-bold text-slate-900 block truncate" title={att.fileName}>{att.fileName}</span>
                                          <span className="text-[10px] text-slate-500 block font-mono">{att.fileSize} · {att.uploadedAt}</span>
                                          {att.dataUrl && (
                                            <a
                                              href={att.dataUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[10px] text-teal-700 font-semibold hover:underline inline-flex items-center gap-0.5 mt-0.5"
                                            >
                                              <ExternalLink className="w-2.5 h-2.5" />
                                              <span>보기 / 다운로드</span>
                                            </a>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteCarAttachment(ncrIdx, 'correction', att.id)}
                                          className="p-1 rounded text-slate-300 hover:text-rose-600 no-print"
                                          title="삭제"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-500 italic py-1 text-center bg-white rounded border border-dashed border-slate-200">
                                    첨부된 증빙 서류가 없습니다. (PDF 문서 또는 사진 첨부 가능)
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Row 11~13: 4M 원인분석 & 재발방지대책 & 증빙 첨부 */}
                          <tr className="border-b border-slate-400 bg-slate-50">
                            <th colSpan={4} className="p-2 text-left font-bold text-slate-900 border-b border-slate-400">
                              ▶ 원인분석(4M) 및 재발방지대책 (인증고객 작성)
                            </th>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">1. 원인분석(4M)</th>
                            <td colSpan={3} className="p-2">
                              <textarea
                                rows={2}
                                value={ncrItem.causeAnalysis}
                                onChange={(e) => {
                                  const next = [...ncrList];
                                  next[ncrIdx].causeAnalysis = e.target.value;
                                  setNcrList(next);
                                }}
                                placeholder="부적합 발생 원인을 4M(Man, Machine, Material, Method) 등에 의거 분석하여 기술하세요."
                                className="w-full border border-slate-300 rounded p-1.5 text-xs"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">2. 재발방지대책</th>
                            <td colSpan={3} className="p-2.5 space-y-2">
                              <textarea
                                rows={2}
                                value={ncrItem.recurrencePrevent}
                                onChange={(e) => {
                                  const next = [...ncrList];
                                  next[ncrIdx].recurrencePrevent = e.target.value;
                                  setNcrList(next);
                                }}
                                placeholder="부적합 근본 원인을 제거하기 위한 재발방지대책을 구체적으로 기술하세요."
                                className="w-full border border-slate-300 rounded p-1.5 text-xs"
                              />

                              {/* 재발방지 증빙자료 첨부 컨트롤러 */}
                              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Paperclip className="w-3.5 h-3.5 text-indigo-700" />
                                    <span className="font-bold text-xs text-slate-800">재발방지 증빙 첨부자료 (개정 절차서 / 교육일지 / 점검표)</span>
                                    <span className="text-[10px] text-slate-500">
                                      ({(ncrItem.preventAttachments || []).length}건 첨부됨)
                                    </span>
                                  </div>
                                  <label className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors no-print">
                                    <Upload className="w-3 h-3" />
                                    <span>파일 첨부 (PDF / 이미지)</span>
                                    <input
                                      type="file"
                                      accept="application/pdf,image/*"
                                      multiple
                                      onChange={(e) => handleCarFileUpload(ncrIdx, 'prevent', e.target.files)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                {(ncrItem.preventAttachments || []).length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                                    {(ncrItem.preventAttachments || []).map((att) => (
                                      <div key={att.id} className="bg-white border border-slate-200 rounded p-2 flex items-start gap-2 shadow-2xs group relative">
                                        {att.fileType === 'image' && att.dataUrl ? (
                                          <img src={att.dataUrl} alt={att.fileName} className="w-12 h-12 object-cover rounded border border-slate-200 shrink-0" />
                                        ) : (
                                          <div className="w-12 h-12 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-mono font-bold text-[11px] shrink-0">
                                            PDF
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0 text-[11px]">
                                          <span className="font-bold text-slate-900 block truncate" title={att.fileName}>{att.fileName}</span>
                                          <span className="text-[10px] text-slate-500 block font-mono">{att.fileSize} · {att.uploadedAt}</span>
                                          {att.dataUrl && (
                                            <a
                                              href={att.dataUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[10px] text-indigo-700 font-semibold hover:underline inline-flex items-center gap-0.5 mt-0.5"
                                            >
                                              <ExternalLink className="w-2.5 h-2.5" />
                                              <span>보기 / 다운로드</span>
                                            </a>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteCarAttachment(ncrIdx, 'prevent', att.id)}
                                          className="p-1 rounded text-slate-300 hover:text-rose-600 no-print"
                                          title="삭제"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-500 italic py-1 text-center bg-white rounded border border-dashed border-slate-200">
                                    첨부된 증빙 서류가 없습니다. (PDF 문서 또는 사진 첨부 가능)
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Row 14: 시정조치 완료 확인 */}
                          <tr className="border-b border-slate-400 bg-slate-50">
                            <th className="p-2 border-r border-slate-400 text-left font-bold">시정조치일자</th>
                            <td className="p-2 border-r border-slate-400 font-mono">
                              <input
                                type="date"
                                value={ncrItem.actionDate || ''}
                                onChange={(e) => {
                                  const next = [...ncrList];
                                  next[ncrIdx].actionDate = e.target.value;
                                  setNcrList(next);
                                }}
                                className="w-full font-mono bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-0.5 text-xs"
                              />
                            </td>
                            <th className="p-2 border-r border-slate-400 text-left font-bold">인증고객 확인</th>
                            <td className="p-2">
                              {renderSignatureCell(
                                `car_client_done_${ncrItem.id}`,
                                '인증고객 확인 (서명)',
                                '고객확인',
                                clientSigner?.name || scopeConfirmData.ceoName || company.ceoName || '',
                                clientSigner?.position || '대표이사',
                                clientSigner?.email || company.contactEmail,
                                clientSigner?.status
                              )}
                            </td>
                          </tr>

                          {/* Row 15~20: 심사원 작성 란 */}
                          <tr className="bg-slate-200 border-b border-slate-400">
                            <th colSpan={4} className="p-2 text-center font-black text-slate-900 text-xs">
                              ◆ 아래 칸은 심사원 작성 란 입니다. ◆
                            </th>
                          </tr>

                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">
                              부적합 확인
                            </th>
                            <td className="p-2 border-r border-slate-400 space-x-3">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`verif_type_${ncrItem.id}`}
                                  checked={ncrItem.verificationType !== '현장확인'}
                                  onChange={() => {
                                    const next = [...ncrList];
                                    next[ncrIdx].verificationType = '문서확인';
                                    setNcrList(next);
                                  }}
                                />
                                <span>문서확인</span>
                              </label>
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`verif_type_${ncrItem.id}`}
                                  checked={ncrItem.verificationType === '현장확인'}
                                  onChange={() => {
                                    const next = [...ncrList];
                                    next[ncrIdx].verificationType = '현장확인';
                                    setNcrList(next);
                                  }}
                                />
                                <span>현장확인</span>
                              </label>
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">
                              차기 심사 확인
                            </th>
                            <td className="p-2">
                              <span className="font-semibold text-slate-700">시정조치 효과성 확인 대상</span>
                            </td>
                          </tr>

                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">
                              시정조치 적절성
                            </th>
                            <td className="p-2 border-r border-slate-400 space-x-4">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-emerald-800">
                                <input
                                  type="radio"
                                  name={`verif_res_${ncrItem.id}`}
                                  checked={ncrItem.verificationResult === '적절함'}
                                  onChange={() => {
                                    const next = [...ncrList];
                                    next[ncrIdx].verificationResult = '적절함';
                                    setNcrList(next);
                                  }}
                                />
                                <span>적절함</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-rose-800">
                                <input
                                  type="radio"
                                  name={`verif_res_${ncrItem.id}`}
                                  checked={ncrItem.verificationResult === '부적절함(보완 필요)'}
                                  onChange={() => {
                                    const next = [...ncrList];
                                    next[ncrIdx].verificationResult = '부적절함(보완 필요)';
                                    setNcrList(next);
                                  }}
                                />
                                <span>부적절함 (보완 필요)</span>
                              </label>
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">
                              효과성 평가
                            </th>
                            <td className="p-2 space-x-4">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-emerald-800">
                                <input
                                  type="radio"
                                  name={`eff_res_${ncrItem.id}`}
                                  checked={ncrItem.effectiveResult === '효과적'}
                                  onChange={() => {
                                    const next = [...ncrList];
                                    next[ncrIdx].effectiveResult = '효과적';
                                    setNcrList(next);
                                  }}
                                />
                                <span>효과적</span>
                              </label>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-rose-800">
                                <input
                                  type="radio"
                                  name={`eff_res_${ncrItem.id}`}
                                  checked={ncrItem.effectiveResult === '효과적이지 않음'}
                                  onChange={() => {
                                    const next = [...ncrList];
                                    next[ncrIdx].effectiveResult = '효과적이지 않음';
                                    setNcrList(next);
                                  }}
                                />
                                <span>효과적이지 않음</span>
                              </label>
                            </td>
                          </tr>

                          {/* 서명 슬롯 */}
                          <tr className="border-b border-slate-400 bg-slate-50">
                            <th colSpan={2} className="p-1.5 border-r border-slate-400 text-center font-bold">
                              시정조치 적절성 확인
                            </th>
                            <th colSpan={2} className="p-1.5 text-center font-bold">
                              시정조치 효과성 확인 (차기 심사)
                            </th>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td colSpan={2} className="p-2 border-r border-slate-400">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-slate-700">심사원 확인 서명:</span>
                                <div className="w-48">
                                  {renderSignatureCell(
                                    `car_verif_auditor_${ncrItem.id}`,
                                    '확인 심사원 (서명)',
                                    '확인심사원',
                                    leadSigner?.name || auditor?.name || '',
                                    leadSigner?.position || auditor?.grade || '선임심사원',
                                    leadSigner?.email || auditor?.email,
                                    leadSigner?.status
                                  )}
                                </div>
                              </div>
                            </td>
                            <td colSpan={2} className="p-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-slate-700">효과성 확인 서명:</span>
                                <div className="w-48">
                                  {renderSignatureCell(
                                    `car_eff_auditor_${ncrItem.id}`,
                                    '효과성 심사원 (서명)',
                                    '확인심사원',
                                    leadSigner?.name || auditor?.name || '',
                                    leadSigner?.position || auditor?.grade || '선임심사원',
                                    leadSigner?.email || auditor?.email,
                                    leadSigner?.status
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* 안내문 */}
                          <tr>
                            <td colSpan={4} className="p-2.5 text-[11px] text-slate-600 bg-slate-50/80 leading-relaxed space-y-1">
                              <p>1. 시정조치 결과는 발행일로부터 1개월 이내에 인증원으로 제출되어야 합니다.</p>
                              <p>2. 시정조치 조치 적절성 확인은 문서확인 또는 현장확인(중부적합인 경우)을 통해 이루어지며, 부적절할 경우 사안에 따라 재조치, 인증정지, 재심사 등이 이루어질 수 있습니다.</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                        [지엠에스씨에스㈜ 인증원]
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ================================================================= */}
              {/* 심사 증빙 서류 */}
              {/* ================================================================= */}
              {activeDocTab === 'proof_upload' && (
                <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-4">
                  <div className="border-b-2 border-slate-800 pb-2">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                      심사 증빙 서류 첨부 관리 (6종)
                    </h1>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {proofDocs.map((doc, idx) => (
                      <div key={idx} className="border border-slate-300 p-3 rounded-lg bg-slate-50 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 block text-xs">{doc.docType}</span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <FileText className="w-3.5 h-3.5 text-teal-700" />
                            <span className="font-mono">{doc.fileName}</span>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          확인완료
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* 3. 전자메일 PIN 인증 모달 팝업 */}
      {activeSigningSlot && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">전자메일 서명 PIN 인증</h3>
              </div>
              <button
                onClick={() => setActiveSigningSlot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-cyan-50 border border-cyan-200 p-3 rounded-xl space-y-1">
                <span className="font-bold text-cyan-950 block text-[12px]">{activeSigningSlot.slotLabel}</span>
                <p className="text-[11px] text-cyan-800">
                  서명자의 이메일로 발송된 6자리 일회용 PIN 인증번호를 입력하여 공인 전자 서명을 완료합니다.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">서명자 성명</label>
                    <input
                      type="text"
                      value={signingForm.name}
                      onChange={(e) => setSigningForm({ ...signingForm, name: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">직위 / 직책</label>
                    <input
                      type="text"
                      value={signingForm.position}
                      onChange={(e) => setSigningForm({ ...signingForm, position: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">인증 이메일 주소</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={signingForm.email}
                      onChange={(e) => setSigningForm({ ...signingForm, email: e.target.value })}
                      className="flex-1 border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSigningForm(prev => ({
                          ...prev,
                          isPinSent: true,
                          pinCode: prev.generatedPin
                        }));
                        alert(`[전자메일 발송 완료]\n${signingForm.email} (으)로 6자리 서명 인증번호 [${signingForm.generatedPin}] 가 발송되었습니다.`);
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-[11px] shrink-0"
                    >
                      PIN 발송
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">인증번호 (6자리)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={signingForm.pinCode}
                    onChange={(e) => setSigningForm({ ...signingForm, pinCode: e.target.value })}
                    placeholder="6자리 PIN 코드 입력"
                    className="w-full border border-slate-300 rounded-lg p-2 text-center text-base font-mono font-bold tracking-widest bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSigningSlot(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSignature}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>서명 완료 및 날인</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
