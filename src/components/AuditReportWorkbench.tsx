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
  Bell
} from 'lucide-react';
import type { Company, Auditor, AuditReport, AuditContractRecord, ProofDocument } from '../types';
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
const initialProofDocs: ProofDocument[] = [
  { docType: '사업자등록증 / 공장등록증', uploaded: true, fileName: '사업자등록증_우진테크.pdf', uploadedAt: '2026-09-08', verified: true },
  { docType: '심사 신청서 및 표준계약서 사본', uploaded: true, fileName: 'F16-004_표준계약서_체결본.pdf', uploadedAt: '2026-09-08', verified: true },
  { docType: '공정도 (제조/서비스 흐름도)', uploaded: true, fileName: '정밀가공_제조공정도.pdf', uploadedAt: '2026-09-09', verified: true },
  { docType: '조직도 및 비상연락망', uploaded: true, fileName: '2026_조직기구표.pdf', uploadedAt: '2026-09-09', verified: true },
  { docType: '국민연금 가입자 명부 (인원확인)', uploaded: true, fileName: '국민연금_가입자내역(22명).pdf', uploadedAt: '2026-09-09', verified: true },
  { docType: '환경/안전 인허가증 (대기/폐수/소방)', uploaded: true, fileName: '환경인허가_신고필증.pdf', uploadedAt: '2026-09-09', verified: true },
];

export const AuditReportWorkbench: React.FC<AuditReportWorkbenchProps> = ({
  company,
  contract,
  report,
  auditor,
  auditors = [],
  onClose,
  onSave,
  onUpdateCompany
}) => {
  const [activeDocTab, setActiveDocTab] = useState<DocTabKey>('all');
  const [proofDocs, setProofDocs] = useState<ProofDocument[]>(initialProofDocs);

  // 로컬 스토리지 키
  const storageKey = useMemo(() => `GMSCS_PACK_FULL_${company.id || company.companyName}`, [company]);

  // 심사 구분
  const [auditTypeCategory, setAuditTypeCategory] = useState<'최초' | '갱신' | '사후' | '전환' | '규격추가' | '재심사'>(() => {
    const t = contract?.contractType || '사후';
    if (t.includes('최초')) return '최초';
    if (t.includes('갱신') || t.includes('재인')) return '갱신';
    if (t.includes('전환')) return '전환';
    if (t.includes('규격')) return '규격추가';
    return '사후';
  });

  const [hasCertChange, setHasCertChange] = useState<boolean>(false);

  // 전자메일 서명 상태
  const [signatures, setSignatures] = useState<Record<string, EmailSignatureRecord>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_SIGS`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      's1_cust': {
        slotId: 's1_cust',
        slotLabel: '고객 확인 (서명)',
        role: '고객확인',
        signerName: company.ceoName || '박진용',
        signerPosition: '대표이사',
        signerEmail: company.contactEmail || 'wjt-jypark@naver.com',
        signedAt: '2026-09-08 17:30',
        signatureHash: 'SIG-EMAIL-89A4-F291',
        isVerified: true,
        ipAddress: '211.234.120.45'
      },
      's1_lead': {
        slotId: 's1_lead',
        slotLabel: '심사 팀장 (서명)',
        role: '심사팀장',
        signerName: auditor?.name || '남경호',
        signerPosition: auditor?.grade || '선임심사원',
        signerEmail: auditor?.email || 'auditor@gmscs.co.kr',
        signedAt: '2026-09-08 17:45',
        signatureHash: 'SIG-EMAIL-CC41-901B',
        isVerified: true,
        ipAddress: '112.170.88.19'
      }
    };
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

  // 1단계 심사 데이터 State (Page 1~6)
  const [stage1Data, setStage1Data] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_STAGE1`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      auditType: contract?.contractType || '2차 사후관리심사',
      auditStandards: contract?.standards?.join(', ') || 'ISO 9001:2015, ISO 14001:2015',
      diffFromApp: '없다',
      diffDetails: '',
      manualDocNo: 'QM-01',
      manualRevDate: '2026-01-10',
      manualRevNo: 'Rev.4',
      processDocNo: 'QP-01~12',
      processRevDate: '2025-11-20',
      processRevNo: 'Rev.2',
      scopeConfirmed: company.scope || company.industry || '금속 절삭가공 제품의 제조(AL가공, SUS가공, 광학부품, 산업용 카메라부품)',
      exclusionClause: '8.3',
      exclusionReason: '고객 제공 도면에 의한 주문 가공 생산으로 설계 및 개발 활동 없음',
      q5_1: '적합',
      q5_2: '적합',
      q5_3: '적합',
      q6_internalAudit: '적합',
      q7_managementReview: '적합',
      q8_operationControl: '적합',
      q9_legalCompliance: '적합',
      q10_legalViolation: '없다',
      q10_violationDetails: '',
      // ISO 14001
      env1_permit: '예',
      env1_details: '절삭유 및 폐유 위탁처리 계약 체결',
      env2_aspect: '예',
      env2_significant: '예',
      env2_compliance: '예',
      env3_procedure: '예',
      env4_manager: '예',
      // ISO 45001
      safe1_managerName: '박진용 대표이사',
      safe1_safetyPerson: '대한산업안전협회 위탁',
      safe1_healthPerson: '산업보건연구소',
      safe1_workerRep: '김진수 직장 (근로자대표)',
      safe2_riskEval: '예',
      safe3_1: '예',
      safe3_2: '예',
      safe3_3: '예',
      safe3_4: '예',
      safe3_5: '예',
      safe3_6: '예',
      safe3_7: '예',
      safe4_team: '예',
      safe5_criticalCount: '1',
      // ESG-MS
      esg1_report: '예',
      esg2_quant: '예',
      esg3_supply: '예',
      // 통합경영시스템
      ims1_doc: '예',
      ims2_policy: '예',
      ims3_review: '예',
      ims4_audit: '예',
      ims5_process: '예',
      ims6_improve: '예',
      ims7_org: '예',
      // 참석자
      attendees: [
        { name: company.ceoName || '박진용', role: '대표이사 / 최고경영자' },
        { name: '박진웅', role: '품질총괄 / 부장' },
        { name: '이영희', role: '환경안전관리자 / 차장' },
        { name: '김진수', role: '생산1팀 / 근로자대표' },
        { name: '정민호', role: '영업자재팀 / 과장' },
        { name: '윤상혁', role: '가공팀 / 반장' },
      ],
      // 5p: Ⅶ. 문서화된 정보 확인 (심사원 상세 기록)
      clauseNotes: [
        { clause: '4. 조직상황', notes: '내·외부 이슈 등록부(Doc.QP-01) 및 이해관계자(카메라 광학부품 고객사 등) 요구사항이 2026년 경영계획에 적정하게 반영됨.', result: '적합', findings: '' },
        { clause: '5. 리더십', notes: '최고경영자의 품질/환경 방침이 사내 정문 및 가공 라인에 공표되었으며, 조직 내 품질책임이 명확히 분장됨.', result: '적합', findings: '' },
        { clause: '6. 기획', notes: '품질 및 환경 리스크 평가표가 수립되어 있으며, 2026년 가공 불량률 0.3% 이하 목표 달성 세부계획서가 수립됨.', result: '적합', findings: '' },
        { clause: '7. 지원', notes: 'CNC/MCT 적격성 관리대장, 교육훈련 계획 및 계측기(마이크로미터 등 18종) 교정검사 성적서가 유효하게 유지 관리됨.', result: '적합', findings: '' },
        { clause: '8. 운용', notes: 'AL/SUS 절삭가공 공정표준서, 초중종물 검사기준서(QP-08)가 현장에 비치되어 있으며 정상 운용 기록됨.', result: '적합', findings: '' },
        { clause: '9. 성과평가', notes: '2026년 상반기 내부심사(2026.07.15 실시) 및 경영검토(2026.08.10 실시)가 체계적으로 이행 및 보고됨.', result: '적합', findings: '' },
        { clause: '10. 개선', notes: '고객불만 및 부적합품 발생에 대한 시정조치 요구서(NCR) 원인분석 및 유효성 확인이 완결됨.', result: '적합', findings: '' },
        { clause: '기타문서', notes: '공장등록증, 폐기물 위탁계약서 등 인허가 관련 서류 적정 유지.', result: '적합', findings: '' },
      ],
      // 6p: Ⅷ. 1단계 심사 결과
      findingsTable: [
        { no: 1, type: '관찰사항', details: '계측기 점검주기 라벨 일부 마모되어 재부착 필요', dueDate: '2026-10-15' }
      ],
      summaryMajor: '0',
      summaryMinor: '0',
      summaryObs: '1',
      overallSummary: '본 조직은 ISO 9001:2015 및 ISO 14001:2015 요구사항에 부합하는 경영시스템 문서를 충실히 수립하고 실행하고 있으며, 최고경영자의 확고한 실천 의지와 전부서의 참여도가 높음. 2단계 현장 심사 진행에 결격사유 없음.',
      conclusion: 'pass' as 'pass' | 'corrective' | 'fail'
    };
  });

  // 2단계 심사 데이터 State (Page 7~16)
  const [stage2Data, setStage2Data] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_STAGE2`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      auditType: contract?.contractType || '2차 사후관리심사',
      auditStandards: contract?.standards?.join(', ') || 'ISO 9001:2015, ISO 14001:2015',
      auditDateStart: '2026-09-10',
      auditDateEnd: '2026-09-11',
      auditMd: '2.0',
      // 공통 심사 내역 (Table 19)
      c1_appDiff: '적',
      c2_planDiff: '무',
      c3_programIssue: '무',
      c4_systemMaintained: '적',
      c5_scopeAdequate: '적',
      c6_meetsStandard: '적',
      c7_clientCooperation: '적',
      c8_monitoring: '적',
      c9_continualImprovement: '적',
      c10_imsAdequate: '적',
      c11_prevNcrEffective: '적',
      c12_markUsage: '적',
      c13_recertFactors: '적',
      c14_survChanges: '무',
      performanceNotes: 'CNC 고속 가공라인 설비 안정화로 가공 정밀도가 대폭 개선되었으며, 절삭유 집진 설비 가동으로 작업 환경 쾌적성 확보.',
      internalAuditDate: '2026-07-15',
      internalAuditNotes: '품질/환경 전 프로세스 내부심사 완료, 시정조치 1건 조치완료 확인',
      mgmtReviewDate: '2026-08-10',
      mgmtReviewNotes: '대표이사 주관 경영검토 회의록 및 사업 목표 승인 확인',
      coreProcessNotes: '영업 수주 -> 도면검토/NC프로그래밍 -> 원자재 입고 -> CNC/MCT 가공 -> 세척 -> 삼차원검사 -> 출하',
      keyCustomers: '(주)삼성전기 협력사, 광학 카메라모듈 업체, 정밀기계 제작사',
      complaintNotes: '2026년 상반기 치수 공차 관련 불만 1건 접수, 툴체인저 공구 보정주기 단축으로 유효성 완료.',
      legalNotes: '산업안전보건법 및 대기환경보전법 준수평가 성적서(2026.06) 기준치 이내 적합.',
      exclusionClause: '8.3 설계 및 개발 (고객 도면 주문생산)',
      stage1ChangeNotes: '1단계 심사 이후 특이 변경사항 없음.',
      // ISO 14001 추가
      envAspect: '절삭유 누유 리스크, 가공 알루미늄 칩 폐기물, 전력 사용량',
      envEvalDate: '2026-04-10',
      envEvaluator: '이영희 차장',
      envEvalResult: '적합',
      envLegalDate: '2026-06-20',
      envLegalEvaluator: '이영희 차장',
      envLegalResult: '적합',
      // ISO 45001 추가
      safeRiskAspect: 'MCT 고속 회전체 협착, 에어건 비산물 안구상해, 중량물 운반 요통',
      safeEvalDate: '2026-05-15',
      safeEvaluator: '김진수 근로자대표 외 2명',
      safeLegalDate: '2026-06-25',
      safeLegalEvaluator: '박진용 대표이사',
      safeLegalResult: '적합',
      // PROCESS Audit NOTE (12, 13, 14페이지 동적 확장 대상)
      auditNotes: [
        {
          clause: '4. 조직상황',
          content: '[확인 내용]: 2026년도 조직 내/외부 이슈 분석표 및 이해관계자 요구사항 분석 기록(Doc No. QP-01) 검토.\n[객관적 증거]: 2026년 1월 광학부품 경량화 및 원소재(AL6061) 단가 변동 리스크 대응 전략 과제 수립 확인.'
        },
        {
          clause: '5. 리더십',
          content: '[확인 내용]: 최고경영자 면담 및 품질/환경 경영방침 전파 상태 확인.\n[객관적 증거]: 가공 현장 게시판에 방침 게시, 현장 가공 OP 3명 인터뷰 결과 품질목표 인지 양호.'
        },
        {
          clause: '6. 기획',
          content: '[확인 내용]: 품질목표(공정불량률 0.3% 이하, 납기준수율 99%) 및 환경목표 추진실적 검토.\n[객관적 증거]: 2026년 상반기 목표 달성도 집계표(달성률 98.6%), 리스크 평가표 개정 이력 확인.'
        },
        {
          clause: '7. 지원',
          content: '[확인 내용]: 설비 보전관리, 측정기기 교정검사 성적서 확인.\n[객관적 증거]: 3차원 측정기(교정일자 2026-03-12, KTR-2026-9912) 및 하이트게이지 검교정 필증 유효.'
        },
        {
          clause: '8. 운용',
          content: '[확인 내용]: 원자재 입고검사, NC 프로그램 관리, CNC 1호기~10호기 가공 공정, 최종검사 식별 추적성 확인.\n[객관적 증거]: LOT No. WJ2609-08 작업지시서, 초중종물 치수검사 성적서, 부적합품 전용 보관대 확인.'
        },
        {
          clause: '9. 성과평가',
          content: '[확인 내용]: 고객만족도 조사(2026년 7월, 종합 94.2점), 내부심사(2026.07.15), 경영검토 보고서 확인.\n[객관적 증거]: 내부심사 결과보고서(Doc.QP-09-01), 경영검토 회의록 대표이사 승인 서명 확인.'
        },
        {
          clause: '10. 개선',
          content: '[확인 내용]: 지속적 개선 활동 및 시정조치 유효성 평가 확인.\n[객관적 증거]: NC-2026-01호(MCT 3호기 절삭유 비산방지 커버 교체 완료) 전후 사진 및 유효성 서명 확인.'
        }
      ],
      // 발견사항 요약 (14p)
      ncrSummaryText: '부적합 사항 없음 (Clean Audit)',
      obsSummaryText: '1. 원자재 보관대 일부 알루미늄 봉재의 식별표 태그 탈락 방지 관리 권고.\n2. 측정실 온습도 기록부 작성 주기(일 2회) 철저 이행 요망.',
      // 발견사항 집계 (15p)
      countMinor: '0',
      countMajor: '0',
      countObs: '2',
      auditorResultReview: '적합',
      overallSummary: '본 조직은 ISO 9001:2015 및 ISO 14001:2015 규격에 부합하는 가공 공정 운영 및 품질관리 활동을 매우 철저하게 수행하고 있으며, 최신 3차원 측정기를 통한 전수 품질 보증 체계가 우수함.',
      conclusionChoice: '1',
      conclusionOther: '',
      // 차기 심사 (16p)
      nextAuditType: '갱신심사 (재인증)',
      nextAuditMonth: '2027-09',
      nextAuditMd: '2.0'
    };
  });

  // NCR 부적합 보고서 목록 State (Page 19~ 동적 추가 가능)
  const [ncrList, setNcrList] = useState<NcrItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_NCRS`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 'ncr-1',
        ncrNo: 'NCR-2026-09-01',
        standard: 'ISO 9001:2015',
        clause: '7.1.5 (측정 자원)',
        dept: '가공2팀',
        auditorName: auditor?.name || '남경호',
        auditType: '사후 2차',
        grade: '경부적합',
        issueDate: '2026-09-11',
        details: '가공 2공장 버니어캘리퍼스 1종(No. VC-04)의 교정검사 라벨이 마모되어 식별이 불가하며, 일상 점검 대장에 일부 점검일자 기록이 누락됨.',
        correctionAction: '해당 버니어캘리퍼스 교정 라벨 재발행 부착 및 일상 점검 대장 보완 기록 완료.',
        causeAnalysis: '[Man/Method]: 작업자 라벨 취급 부주의 및 월간 계측기 정기 대조 절차 미흡.',
        recurrencePrevent: '전 계측기 라벨 보호 비닐 코팅 부착 및 매월 1일 품질관리자 교정상태 전수 점검 의무화.',
        actionDate: '2026-09-25',
        clientSigned: true,
        auditorVerified: true,
        verificationResult: '적절함',
        effectiveResult: '효과적'
      }
    ];
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
      localStorage.setItem(`${storageKey}_STAGE1`, JSON.stringify(stage1Data));
      localStorage.setItem(`${storageKey}_STAGE2`, JSON.stringify(stage2Data));
      localStorage.setItem(`${storageKey}_NCRS`, JSON.stringify(ncrList));
    }
  }, [signatures, stage1Data, stage2Data, ncrList, storageKey]);

  // 전체 저장 함수
  const handleSaveAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}_STAGE1`, JSON.stringify(stage1Data));
      localStorage.setItem(`${storageKey}_STAGE2`, JSON.stringify(stage2Data));
      localStorage.setItem(`${storageKey}_SIGS`, JSON.stringify(signatures));
      localStorage.setItem(`${storageKey}_NCRS`, JSON.stringify(ncrList));
    }
    if (onSave) {
      onSave({ stage1Data, stage2Data, signatures, ncrList });
    }
    alert('[심사보고서 전산 저장 완료]\n2025 Audit Report Pack(251001)의 모든 페이지(1p~20p+) 데이터와 전자 서명이 시스템에 안전하게 저장되었습니다.');
  };

  // NCR 추가 함수
  const handleAddNcr = () => {
    const nextNo = `NCR-2026-09-0${ncrList.length + 1}`;
    const newNcr: NcrItem = {
      id: `ncr-${Date.now()}`,
      ncrNo: nextNo,
      standard: 'ISO 9001:2015',
      clause: '8.5.1 (생산 및 서비스 제공의 관리)',
      dept: '생산팀',
      auditorName: auditor?.name || '남경호',
      auditType: '사후 2차',
      grade: '경부적합',
      issueDate: '2026-09-11',
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
    defaultEmail?: string
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

    return (
      <button
        type="button"
        onClick={() => {
          setSigningForm({
            name: defaultName || (role === '심사팀장' ? (auditor?.name || '남경호') : company.ceoName || '박진용'),
            position: defaultPos || (role === '심사팀장' ? '선임심사원' : '대표이사'),
            email: defaultEmail || (role === '심사팀장' ? (auditor?.email || 'auditor@gmscs.co.kr') : company.contactEmail || 'wjt-jypark@naver.com'),
            pinCode: '',
            isPinSent: false,
            generatedPin: Math.floor(100000 + Math.random() * 900000).toString()
          });
          setActiveSigningSlot({ slotId, slotLabel, role });
        }}
        className="w-full py-1 px-1.5 border border-dashed border-cyan-700 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 rounded font-bold text-[10.5px] flex items-center justify-center gap-1 transition-colors"
      >
        <Mail className="w-3 h-3 text-cyan-700" />
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
      certNo: (contract as any)?.certNumber || contract?.contractNumber || compAny.certNo || 'GMS-2609-08',
      companyNameKor: company.companyName,
      companyNameEng: compAny.companyNameEng || compAny.engName || 'WOOJIN TECH CO., LTD.',
      ceoName: company.ceoName || '박진용',
      addressKor: company.address || '경기 군포시 공단로140번길 46, 206호',
      addressEng: compAny.addressEng || compAny.engAddress || '#206, 46, Gongdan-ro 140beon-gil, Gunpo-si, Gyeonggi-do, Korea',
      factoryAddressKor: compAny.factoryAddress || '',
      factoryAddressEng: compAny.factoryAddressEng || '',
      scopeKor: compAny.scope || company.industry || '금속 절삭가공 제품의 제조(AL가공, SUS가공, 광학부품, 산업용 카메라부품)',
      scopeEng: compAny.scopeEng || 'Manufacture of metal machining parts (AL machining, SUS machining, optical parts, camera parts)',
      iafCode: compAny.iafCode || '17',
      standards: contract?.standards?.join(', ') || compAny.standards || 'ISO 9001:2015, ISO 14001:2015',
      identityConfirmed: '1단계 심사 시 확인된 내용과 동일함 (확인 완료)',
      updatedAt: '2026-09-11'
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xs flex flex-col overflow-hidden text-slate-900">
      
      {/* 1. 최상단 헤더 바 */}
      <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between border-b border-slate-700 shrink-0 no-print print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="닫기"
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
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 인쇄 / PDF 출력</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>전산 저장</span>
          </button>
        </div>
      </div>

      {/* 안내 서브 헤더 띠 */}
      <div className="bg-slate-800 text-slate-300 px-5 py-1.5 text-[11px] flex justify-between items-center border-b border-slate-700 shrink-0 no-print print:hidden">
        <span>좌측 참고 패널의 가이드를 확인하며 우측 공식 서식(1·2단계, 인정확인서, 3년계획, 시정조치 요구서 등)을 작성하세요.</span>
        <span className="text-teal-300 font-mono">1단계 / 2단계 / 인정범위확인(Table 29) / 3년계획(Table 30~32) / 시정조치요구서(F18-002)</span>
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
                <strong className="text-slate-800">업체명:</strong> <span className="font-bold text-slate-950">{scopeConfirmData.companyNameKor}</span> (대표: {scopeConfirmData.ceoName})
              </div>
              <div>
                <strong className="text-slate-800">사업자번호:</strong> <span className="font-mono">{company.bizNumber || '107-88-30351'}</span>
              </div>
              <div>
                <strong className="text-slate-800">소재지:</strong> {scopeConfirmData.addressKor}
              </div>
              <div>
                <strong className="text-slate-800">담당자:</strong> {company.contactPerson || '박진웅 부장'} ({company.contactPhone || '031-360-7078'})
              </div>
              <div>
                <strong className="text-slate-800">심사표준:</strong> <span className="font-semibold text-slate-900">{stage1Data.auditStandards}</span>
              </div>
              <div>
                <strong className="text-slate-800">심사일정:</strong> <span className="font-mono text-slate-900">{stage2Data.auditDateStart} ~ {stage2Data.auditDateEnd}</span>
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

          {/* 3. 보고서 작성 인증원 공지사항 (Certification Body Notice) */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-indigo-700 inline-block rounded-xs"></span>
                <span>3. 보고서 작성 인증원 공지사항</span>
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

          {/* 5. 전자메일 서명 현황 카드 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                <span>5. 전자메일 서명 현황</span>
              </span>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                {Object.keys(signatures).length}건 완료
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {Object.values(signatures).map(sig => (
                <div key={sig.slotId} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-1.5 rounded">
                  <div>
                    <span className="font-bold text-emerald-950">{sig.signerName}</span>
                    <span className="text-[9.5px] text-emerald-700 block">({sig.signerPosition} / {sig.slotLabel})</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded">
                    {sig.signedAt.slice(5, 16)}
                  </span>
                </div>
              ))}
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

                      {/* ◆ 1단계 심사의 목적 */}
                      <div className="border border-slate-400 bg-slate-50 p-4 space-y-2 text-[11px] leading-relaxed text-slate-700 mb-6">
                        <span className="font-bold text-slate-950 block text-xs">◆ 1단계 심사의 목적</span>
                        <ol className="list-decimal list-inside space-y-1.5 pl-1">
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
                          <span>※ ISO 45001만 해당</span>
                        </div>
                        <table className="w-full border-collapse border border-slate-700 text-xs">
                          <tbody>
                            <tr className="border-b border-slate-400">
                              <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고객 확인</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{company.ceoName || '박진용'}</td>
                              <td className="w-36 p-1 border-r border-slate-400">
                                {renderSignatureCell('s1_cust', '고객 확인 (서명)', '고객확인', company.ceoName || '박진용', '대표이사', company.contactEmail)}
                              </td>
                              <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">근로자 대표</th>
                              <td className="p-2 border-r border-slate-400 font-bold">김진수 (직장)</td>
                              <td className="w-36 p-1">
                                {renderSignatureCell('s1_work', '근로자대표 (서명)', '근로자대표', '김진수', '근로자대표', 'worker@k1metal.co.kr')}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀장</th>
                              <td className="p-2 border-r border-slate-400 font-bold">{auditor?.name || '남경호'}</td>
                              <td className="p-1 border-r border-slate-400">
                                {renderSignatureCell('s1_lead', '심사팀장 (서명)', '심사팀장', auditor?.name || '남경호', auditor?.grade || '선임심사원', auditor?.email)}
                              </td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                              <td className="p-2 border-r border-slate-400 font-bold">신현섭</td>
                              <td className="p-1 border-r border-slate-400">
                                {renderSignatureCell('s1_team1', '심사팀원 (서명)', '심사팀원', '신현섭', '심사원', 'auditor2@gmscs.co.kr')}
                              </td>
                            </tr>
                            <tr>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                              <td className="p-2 border-r border-slate-400 text-slate-400">-</td>
                              <td className="p-1 border-r border-slate-400">{renderSignatureCell('s1_t2', '심사팀원 (서명)', '심사팀원')}</td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">기 타</th>
                              <td className="p-2 border-r border-slate-400 text-slate-400">-</td>
                              <td className="p-1">{renderSignatureCell('s1_oth', '기타 (서명)', '확인심사원')}</td>
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
                              <td className="p-2 font-mono">{(company as any).certNumber || 'GMS-2609-08'}</td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사일자</th>
                              <td colSpan={3} className="p-2 font-medium">
                                {(contract as any)?.auditDateStart ? `${(contract as any).auditDateStart} ~ ${(contract as any).auditDateEnd || ''}` : '2026년 09월 08일'}
                              </td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">
                                주사업장<br />주 소
                              </th>
                              <td colSpan={3} className="p-2">{company.address || '경기 군포시 공단로140번길 46, 206호'}</td>
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
                              <td className="p-2 border-r border-slate-400">{company.contactPhone || '031-360-7078'}</td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">Fax</th>
                              <td className="p-2">{(company as any).fax || '031-353-8891'}</td>
                            </tr>
                            <tr>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">
                                Home<br />page
                              </th>
                              <td className="p-2 border-r border-slate-400">{(company as any).website || 'www.wjt.co.kr'}</td>
                              <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">E-Mail</th>
                              <td className="p-2 font-mono">{company.contactEmail || 'wjt-jypark@naver.com'}</td>
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
                                          value={stage1Data.manualDocNo || 'QM-01'}
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
                                          value={stage1Data.manualRevDate || '2026-01-10'}
                                          onChange={(e) => setStage1Data({ ...stage1Data, manualRevDate: e.target.value })}
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                                        />
                                      </td>
                                      <th className="w-20 bg-slate-50 p-2 border-r border-slate-300 text-center font-bold">
                                        개정<br />번호
                                      </th>
                                      <td className="p-1.5">
                                        <input
                                          type="text"
                                          value={stage1Data.manualRevNo || 'Rev.4'}
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
                                          value={stage1Data.processDocNo || 'QP-01~12'}
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
                                          value={stage1Data.processRevDate || '2025-11-20'}
                                          onChange={(e) => setStage1Data({ ...stage1Data, processRevDate: e.target.value })}
                                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center"
                                        />
                                      </td>
                                      <th className="bg-slate-50 p-2 border-r border-slate-300 text-center font-bold">
                                        개정<br />번호
                                      </th>
                                      <td className="p-1.5">
                                        <input
                                          type="text"
                                          value={stage1Data.processRevNo || 'Rev.2'}
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
                                      value={stage1Data.exclusionClause || '8.3'}
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
                                  value={stage1Data.env1_details || '절삭유 및 폐유 위탁처리 계약 체결'}
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
                                  value={stage1Data.safe5_criticalCount || '1'}
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
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{stage1Data.attendees[0]?.name || company.ceoName || '박진용'}</td>
                              <td className="p-1.5 border-r border-slate-400">{stage1Data.attendees[0]?.role || '대표이사 / 최고경영자'}</td>
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{stage1Data.attendees[1]?.name || '박진웅'}</td>
                              <td className="p-1.5">{stage1Data.attendees[1]?.role || '품질관리팀장 / 부장'}</td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{stage1Data.attendees[2]?.name || '이영희'}</td>
                              <td className="p-1.5 border-r border-slate-400">{stage1Data.attendees[2]?.role || '환경안전관리자 / 차장'}</td>
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{stage1Data.attendees[3]?.name || '김진수'}</td>
                              <td className="p-1.5">{stage1Data.attendees[3]?.role || '근로자대표 / 직장'}</td>
                            </tr>
                            <tr className="border-b border-slate-400">
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{stage1Data.attendees[4]?.name || '정민호'}</td>
                              <td className="p-1.5 border-r border-slate-400">{stage1Data.attendees[4]?.role || '영업자재팀 / 과장'}</td>
                              <td className="p-1.5 border-r border-slate-400 text-center font-bold">{stage1Data.attendees[5]?.name || '윤상혁'}</td>
                              <td className="p-1.5">{stage1Data.attendees[5]?.role || '가공팀 / 반장'}</td>
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
                              <td className="p-2 border-r border-slate-400 font-bold">{auditor?.name || '남경호'}</td>
                              <th className="w-20 bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-2 border-r border-slate-400 font-bold">신현섭</td>
                              <th className="w-20 bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-2 text-slate-400">-</td>
                            </tr>
                            <tr>
                              <th className="bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-2 border-r border-slate-400 text-slate-400">-</td>
                              <th className="bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">심사팀원</th>
                              <td className="p-2 border-r border-slate-400 text-slate-400">-</td>
                              <th className="bg-slate-50 p-2 border-r border-slate-400 text-center font-bold">기 타</th>
                              <td className="p-2 text-slate-400">-</td>
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
                            {[
                              { no: 1, type: '권고사항', details: '계측기 점검주기 라벨 일부 마모되어 재부착 필요', dueDate: '2026-10-15' },
                              { no: 2, type: '', details: '', dueDate: '' },
                              { no: 3, type: '', details: '', dueDate: '' },
                              { no: 4, type: '', details: '', dueDate: '' },
                              { no: 5, type: '', details: '', dueDate: '' },
                            ].map((row) => (
                              <tr key={row.no} className="border-b border-slate-400">
                                <td className="p-1.5 text-center font-bold border-r border-slate-400 bg-slate-50">{row.no}</td>
                                <td className="p-1.5 text-center border-r border-slate-400 font-bold text-amber-800">{row.type}</td>
                                <td className="p-1.5 border-r border-slate-400">{row.details}</td>
                                <td className="p-1.5 text-center font-mono">{row.dueDate}</td>
                              </tr>
                            ))}
                            <tr className="bg-slate-50 border-b border-slate-700">
                              <th className="p-2 border-r border-slate-400 text-center font-bold">심 사 결 과</th>
                              <td colSpan={3} className="p-2 space-x-6 text-xs font-bold text-slate-900">
                                <span>중부적합: 0 건</span>
                                <span>경부적합: 0 건</span>
                                <span>관찰사항: 1 건</span>
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
              {/* 2단계 심사보고서 (7p ~ 16p 실물 PDF 완벽 일치 & 동적 확장) */}
              {/* ================================================================= */}
              {(activeDocTab === 'all' || activeDocTab === 'stage2') && (
                <div className="space-y-10">
                  {/* --- [2단계 7 PAGE : 표지] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative">
                    {renderReportPageHeader('F16-011(20251001)')}

                    <div className="text-center py-6">
                      <h1 className="text-3xl font-black tracking-tight text-slate-950 font-serif">
                        적합성 평가 심사보고서(2nd Stage)
                      </h1>
                    </div>

                    {/* Table 13 */}
                    <table className="w-full border-collapse border border-slate-700 text-xs">
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
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-2.5 border-r border-slate-400 text-center font-bold">심 사 유 형</th>
                          <td className="p-2.5 space-x-5 text-xs font-medium">
                            <label className="inline-flex items-center gap-1.5"><input type="radio" name="s2_p7_type" defaultChecked /><span>최초</span></label>
                            <label className="inline-flex items-center gap-1.5"><input type="radio" name="s2_p7_type" /><span>사후 ( )</span></label>
                            <label className="inline-flex items-center gap-1.5"><input type="radio" name="s2_p7_type" /><span>갱신</span></label>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* ◆ 2단계 심사의 목적 */}
                    <div className="border border-slate-400 bg-slate-50 p-4 space-y-2 text-[11px] leading-relaxed text-slate-700">
                      <span className="font-bold text-slate-950 block text-xs">◆ 2단계 심사의 목적</span>
                      <ol className="list-decimal list-inside space-y-1.5 pl-1">
                        <li>해당 경영시스템 표준의 모든 요구사항에 대한 적합성에 관한 정보 및 증거 확인</li>
                        <li>주요 성과 목표 및 세부목표 대비 성과의 모니터링, 측정, 보고 및 검토</li>
                        <li>적용 가능한 법적, 규제적, 계약적 요구사항을 충족시키는 조직의 경영시스템 성과 확인</li>
                        <li>프로세스의 운영 관리, 내부심사 및 경영검토, 클라이언트의 방침에 대한 경영책임 검토</li>
                        <li>심사는 샘플링 방식으로 진행되며, 심사팀에 의해 발견되지 못한 부적합 사항이 있을 수 있습니다.</li>
                      </ol>
                    </div>

                    {/* Table 14 & Table 15 서명 */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[11px] text-slate-600 font-bold px-1">
                        <span>※ 보고서 확인</span>
                        <span>※ ISO 45001만 해당</span>
                      </div>
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고객 확인</th>
                            <td className="p-2 border-r border-slate-400 font-bold">{company.ceoName || '박진용'}</td>
                            <td className="w-36 p-1 border-r border-slate-400">
                              {renderSignatureCell('s2_cust', '고객 확인 (서명)', '고객확인', company.ceoName || '박진용', '대표이사', company.contactEmail)}
                            </td>
                            <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">근로자 대표</th>
                            <td className="p-2 border-r border-slate-400 font-bold">김진수 (직장)</td>
                            <td className="w-36 p-1">
                              {renderSignatureCell('s2_work', '근로자대표 (서명)', '근로자대표', '김진수', '근로자대표', 'worker@k1metal.co.kr')}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀장</th>
                            <td className="p-2 border-r border-slate-400 font-bold">{auditor?.name || '남경호'}</td>
                            <td className="p-1 border-r border-slate-400">
                              {renderSignatureCell('s2_lead', '심사팀장 (서명)', '심사팀장', auditor?.name || '남경호', auditor?.grade || '선임심사원', auditor?.email)}
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                            <td className="p-2 border-r border-slate-400 font-bold">신현섭</td>
                            <td className="p-1 border-r border-slate-400">
                              {renderSignatureCell('s2_team1', '심사팀원 (서명)', '심사팀원', '신현섭', '심사원', 'auditor2@gmscs.co.kr')}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                      - 7 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>

                  {/* --- [2단계 8 PAGE : 회의록(Table 16) & 이해관계서(Table 17)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative">
                    {renderReportPageHeader('F16-011(20251001)')}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-950 text-xs">시작/종결회의 안건 (Table 16)</h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="border border-slate-400 p-3 bg-slate-50 space-y-1">
                          <span className="font-bold text-slate-900 block border-b border-slate-300 pb-1">시작회의 안건</span>
                          <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-700">
                            <li>인사말 및 심사협조에 대한 감사의 말씀</li>
                            <li>참석자 소개 및 근로자대표 참석 확인</li>
                            <li>심사의 목적, 표준, 인증범위 확인</li>
                            <li>부적합 설명 및 샘플 심사의 한계 안내</li>
                            <li>기밀유지 및 비밀 준수 서약 확인</li>
                          </ol>
                        </div>
                        <div className="border border-slate-400 p-3 bg-slate-50 space-y-1">
                          <span className="font-bold text-slate-900 block border-b border-slate-300 pb-1">종결회의 안건</span>
                          <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-700">
                            <li>심사협조에 대한 감사 및 결과 요약 보고</li>
                            <li>부적합 및 관찰사항 설명 및 처리기준 안내</li>
                            <li>차기 사후심사 안내 및 이의제기 절차</li>
                            <li>심사 리포트 고객 서명 및 확인</li>
                          </ol>
                        </div>
                      </div>

                      <div className="border border-slate-700 p-4 space-y-3 bg-white">
                        <div className="text-center font-bold text-sm text-slate-950 underline underline-offset-4 font-serif">
                          이해관계유무 확인서 (Table 17)
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          심사팀은 상기 업무를 수행함에 있어 인증원의 공정성 및 신뢰성에 위배되지 않도록 다음 사항을 준수하였으며, 어떠한 컨설팅이나 자문행위를 제공하지 않았음을 확인합니다.
                        </p>
                        <div className="border-t border-slate-300 pt-3 flex justify-end items-center gap-6">
                          <span className="text-xs text-slate-600">작성일자: 2026년 09월 10일</span>
                          <div className="w-48">
                            {renderSignatureCell('conflict_lead_p8', '심사팀장 공평성 서약 (서명)', '심사팀장', auditor?.name || '남경호', '선임심사원', auditor?.email)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                      - 8 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>

                  {/* --- [2단계 9 PAGE : ◆ 고객현황 (Table 18)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative">
                    {renderReportPageHeader('F16-011(20251001)')}
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-950 text-xs">◆ 고객현황 (Table 18)</h3>
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">고 객 명</th>
                            <td className="p-2 border-r border-slate-400 font-bold">{company.companyName}</td>
                            <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">대표자</th>
                            <td className="p-2 border-r border-slate-400">{company.ceoName || '박진용'}</td>
                            <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">인증번호</th>
                            <td className="p-2 font-mono">GMS-2609-08</td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">주사업장 주소</th>
                            <td colSpan={5} className="p-2">{company.address || '경기 군포시 공단로140번길 46, 206호'}</td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">TEL</th>
                            <td className="p-2 border-r border-slate-400">{company.contactPhone || '031-360-7078'}</td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">FAX</th>
                            <td className="p-2 border-r border-slate-400">031-353-8891</td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">E-mail</th>
                            <td className="p-2 font-mono">{company.contactEmail || 'wjt-jypark@naver.com'}</td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">심사일자</th>
                            <td colSpan={3} className="p-2 font-mono">
                              시작일: 2026-09-10 ~ 종료일: 2026-09-11
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">심사일수</th>
                            <td className="p-2 font-bold">2.0 M/D</td>
                          </tr>
                          <tr>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">인증범위</th>
                            <td colSpan={5} className="p-2 font-semibold text-slate-800">
                              {company.scope || company.industry || '금속 절삭가공 제품의 제조(AL가공, SUS가공, 광학부품, 산업용 카메라부품)'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                      - 9 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>

                  {/* --- [2단계 10 PAGE & 11 PAGE : 1.2단계심사 공통내역 (Table 19)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative">
                    {renderReportPageHeader('F16-011(20251001)')}
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-950 text-xs">1. 2단계심사 적합성 평가 - 공통 심사 내역 (Table 19)</h3>
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-700">
                            <th colSpan={3} className="p-2 text-center font-black tracking-wider text-slate-900">
                              ◆ 공 통 심 사 내 역 ◆
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { text: '인증신청자가 제출한 자료와 현장심사 시 확인된 사항과의 차이점', res: '적' },
                            { text: '심사계획서와 차이가 있는가?', res: '무' },
                            { text: '심사프로그램에 영향을 미치는 주요한 이슈가 있는가?', res: '무' },
                            { text: '구축된 시스템이 정해진 절차와 방법에 의거 적절히 시행/유지되고 있는가?', res: '적' },
                            { text: '인증범위는 적절한가?', res: '적' },
                            { text: '인증고객의 시스템이 인증심사기준에 부합하는가?', res: '적' },
                            { text: '주요성과 및 세부목표 대비 성과의 모니터링, 측정, 보고, 검토', res: '적' },
                            { text: '지속적 개선을 위한 조치', res: '적' },
                            { text: '사후 / 갱신심사 시 인증마크 사용의 적절성', res: '적' },
                          ].map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-slate-400">
                              <td className="w-8 p-1.5 text-center font-bold bg-slate-50 border-r border-slate-400">{rIdx + 1}</td>
                              <td className="p-1.5 border-r border-slate-400">{row.text}</td>
                              <td className="w-24 p-1.5 text-center font-bold text-emerald-700">{row.res}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                      - 10 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>

                  {/* --- [2단계 12 PAGE & 13 PAGE & 14 PAGE : PROCESS Audit NOTE (Table 20~23) - 동적 확장] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative">
                    {renderReportPageHeader('F16-011(20251001)')}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-700 pb-1">
                        <h3 className="text-base font-black tracking-tight text-slate-950 font-serif">
                          PROCESS Audit NOTE (현장 심사 세부 확인 사항)
                        </h3>
                        <span className="text-[11px] text-slate-600">
                          ► 객관적 증거 확인 기록 (12p ~ 14p+ 동적 확장)
                        </span>
                      </div>

                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-700">
                            <th className="w-32 p-2 border-r border-slate-400 text-center font-bold">요구사항</th>
                            <th className="p-2 text-center font-bold">심사 확인 사항 (객관적 증거, 인터뷰, 샘플 확인 내역)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stage2Data.auditNotes.map((note: { clause: string; content: string }, idx: number) => (
                            <tr key={idx} className="border-b border-slate-400 hover:bg-slate-50/50">
                              <td className="p-2 font-bold text-slate-900 border-r border-slate-400 align-top bg-slate-50">
                                {note.clause}
                              </td>
                              <td className="p-1.5">
                                <textarea
                                  rows={3}
                                  value={note.content}
                                  onChange={(e) => {
                                    const next = [...stage2Data.auditNotes];
                                    next[idx].content = e.target.value;
                                    setStage2Data({ ...stage2Data, auditNotes: next });
                                  }}
                                  className="w-full border border-slate-300 rounded p-2 text-xs leading-relaxed focus:ring-1 focus:ring-teal-500 resize-y"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* 14p: 심사발견사항 요약 (Table 23) */}
                      <div className="space-y-1.5 pt-2">
                        <h4 className="font-bold text-slate-900 text-xs">심사발견사항 요약 (Table 23)</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="border border-slate-300 p-2 rounded bg-slate-50">
                            <span className="font-bold text-rose-900 block mb-1">부적합사항 요약</span>
                            <textarea
                              rows={2}
                              value={stage2Data.ncrSummaryText}
                              onChange={(e) => setStage2Data({...stage2Data, ncrSummaryText: e.target.value})}
                              className="w-full border border-slate-300 rounded p-1 text-xs"
                            />
                          </div>
                          <div className="border border-slate-300 p-2 rounded bg-slate-50">
                            <span className="font-bold text-amber-900 block mb-1">관찰 및 권고사항 요약</span>
                            <textarea
                              rows={2}
                              value={stage2Data.obsSummaryText}
                              onChange={(e) => setStage2Data({...stage2Data, obsSummaryText: e.target.value})}
                              className="w-full border border-slate-300 rounded p-1 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                      - 12~14 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>

                  {/* --- [2단계 15 PAGE : 2.심사결론 (Table 24) & 3.참석자 & 4.심사팀] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative">
                    {renderReportPageHeader('F16-011(20251001)')}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-950 text-xs">2. 심사결론 (Table 24)</h3>
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <tbody>
                          <tr className="border-b border-slate-400 bg-slate-50">
                            <th className="w-32 p-2 border-r border-slate-400 text-center font-bold">심사 발견사항</th>
                            <td className="p-2 space-x-6 font-bold text-slate-900">
                              <span>경부적합: 0 건</span>
                              <span>중부적합: 0 건</span>
                              <span>관찰사항: 2 건</span>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <th className="p-2 border-r border-slate-400 text-center font-bold bg-slate-100">
                              심사 총평 (우수한 점 포함)
                            </th>
                            <td className="p-1.5">
                              <textarea
                                rows={3}
                                value={stage2Data.overallSummary}
                                onChange={(e) => setStage2Data({ ...stage2Data, overallSummary: e.target.value })}
                                className="w-full border border-slate-300 rounded p-2 text-xs leading-relaxed"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th className="p-2 border-r border-slate-400 text-center font-bold bg-slate-100">
                              심 사 결 론
                            </th>
                            <td className="p-2 font-bold text-teal-900">
                              어떠한 부적합이 발견되지 않았으므로 인증추천 또는 인증유지를 추천합니다.
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* 3. 참석자 & 4. 심사팀 */}
                      <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                        <div className="border border-slate-400 p-2.5 rounded bg-slate-50">
                          <span className="font-bold text-slate-900 block mb-1">3. 조직의 참석자 (Table 25)</span>
                          <span className="text-slate-700">박진용 대표이사, 박진웅 부장, 김진수 근로자대표</span>
                        </div>
                        <div className="border border-slate-400 p-2.5 rounded bg-slate-50">
                          <span className="font-bold text-slate-900 block mb-1">4. 심사팀 (Table 26)</span>
                          <span className="text-slate-700">심사팀장: 남경호 선임심사원 / 심사팀원: 신현섭 심사원</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                      - 15 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>

                  {/* --- [2단계 16 PAGE : 5.차기심사 안내(Table 27) & 6.갱신심사 시 작성(Table 28)] --- */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative">
                    {renderReportPageHeader('F16-011(20251001)')}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-950 text-xs">5. 차기심사 안내 (Table 27)</h3>
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-700">
                            <th className="w-40 p-1.5 border-r border-slate-400 text-center font-bold">차 기 심사종류</th>
                            <th className="p-1.5 border-r border-slate-400 text-center font-bold">심사 예정 월</th>
                            <th className="w-32 p-1.5 text-center font-bold">심사일수 (M/D)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border-r border-slate-400 font-bold text-center">
                              갱신심사 (재인증)
                            </td>
                            <td className="p-2 border-r border-slate-400 text-center font-mono">
                              2027년 09월 (인증만료 1개월 전)
                            </td>
                            <td className="p-2 text-center font-bold">
                              2.0 M/D
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="space-y-1.5 pt-3">
                        <h3 className="font-bold text-slate-950 text-xs">6. 갱신심사 시 작성 (시정조치 효과성 확인 3년간 - Table 28)</h3>
                        <table className="w-full border-collapse border border-slate-700 text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-700">
                              <th className="p-1.5 border-r border-slate-400 text-center font-bold">심사종류</th>
                              <th className="p-1.5 border-r border-slate-400 text-center font-bold">부적합 건수</th>
                              <th className="p-1.5 border-r border-slate-400 text-center font-bold">심사팀장</th>
                              <th className="p-1.5 text-center font-bold">효과성 확인</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-400">
                              <td className="p-1.5 border-r border-slate-400 text-center">최초 심사</td>
                              <td className="p-1.5 border-r border-slate-400 text-center">경 1</td>
                              <td className="p-1.5 border-r border-slate-400 text-center">남경호</td>
                              <td className="p-1.5 text-center font-bold text-emerald-700">적절</td>
                            </tr>
                            <tr>
                              <td className="p-1.5 border-r border-slate-400 text-center">1차 사후</td>
                              <td className="p-1.5 border-r border-slate-400 text-center">0</td>
                              <td className="p-1.5 border-r border-slate-400 text-center">남경호</td>
                              <td className="p-1.5 text-center font-bold text-emerald-700">적절</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                      - 16 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 인정범위 확인서 (인증서 기재사항 확인서 - Table 29) */}
              {/* ================================================================= */}
              {(activeDocTab === 'all' || activeDocTab === 'cert_confirm') && (
                <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative">
                  {renderReportPageHeader('F16-014(20231001)')}
                  <div className="text-center py-2">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                      인증서 기재사항 확인서 (인정범위 확인서)
                    </h1>
                  </div>

                  <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-lg text-xs text-amber-900 leading-relaxed flex items-center justify-between">
                    <span>💡 <strong>인증범위 실시간 동기화:</strong> 아래 상호, 대표자, 사업장 주소, 국문/영문 인증범위를 수정하면 기업 관리 대장 및 팝업 카드 등 전 시스템에 즉시 반영됩니다.</span>
                  </div>

                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <th className="w-28 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">인증번호</th>
                        <td colSpan={2} className="p-1.5 font-mono">
                          <input
                            type="text"
                            value={scopeConfirmData.certNo}
                            onChange={(e) => handleUpdateScopeConfirmField('certNo', e.target.value)}
                            className="w-full font-mono bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-1 text-xs"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold" rowSpan={2}>고 객 명</th>
                        <td className="w-16 bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">KOR</td>
                        <td className="p-1.5 font-bold text-slate-900">
                          <input
                            type="text"
                            value={scopeConfirmData.companyNameKor}
                            onChange={(e) => handleUpdateScopeConfirmField('companyNameKor', e.target.value)}
                            className="w-full font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-1 text-xs"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">ENG</td>
                        <td className="p-1.5 font-sans">
                          <input
                            type="text"
                            value={scopeConfirmData.companyNameEng}
                            onChange={(e) => handleUpdateScopeConfirmField('companyNameEng', e.target.value)}
                            className="w-full font-sans bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-1 text-xs"
                            placeholder="e.g. WOOJIN TECH CO., LTD."
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">대표자명</th>
                        <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">KOR</td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={scopeConfirmData.ceoName}
                            onChange={(e) => handleUpdateScopeConfirmField('ceoName', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-1 text-xs"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold" rowSpan={2}>사업장 주소</th>
                        <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">KOR</td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={scopeConfirmData.addressKor}
                            onChange={(e) => handleUpdateScopeConfirmField('addressKor', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-1 text-xs"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">ENG</td>
                        <td className="p-1.5 font-sans">
                          <input
                            type="text"
                            value={scopeConfirmData.addressEng}
                            onChange={(e) => handleUpdateScopeConfirmField('addressEng', e.target.value)}
                            className="w-full font-sans bg-transparent border-b border-transparent focus:border-cyan-600 focus:bg-cyan-50/50 p-1 text-xs"
                            placeholder="English Address"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold" rowSpan={2}>인증범위</th>
                        <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">KOR</td>
                        <td className="p-1.5 font-bold">
                          <textarea
                            rows={2}
                            value={scopeConfirmData.scopeKor}
                            onChange={(e) => handleUpdateScopeConfirmField('scopeKor', e.target.value)}
                            className="w-full font-bold bg-transparent border border-slate-300 rounded focus:border-cyan-600 focus:bg-cyan-50/50 p-1.5 text-xs leading-relaxed"
                            placeholder="국문 인증범위 입력 (전 시스템 실시간 동기화)"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">ENG</td>
                        <td className="p-1.5 font-sans">
                          <textarea
                            rows={2}
                            value={scopeConfirmData.scopeEng}
                            onChange={(e) => handleUpdateScopeConfirmField('scopeEng', e.target.value)}
                            className="w-full font-sans bg-transparent border border-slate-300 rounded focus:border-cyan-600 focus:bg-cyan-50/50 p-1.5 text-xs leading-relaxed"
                            placeholder="Enter English Certification Scope"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">동일성 확인</th>
                        <td colSpan={2} className="p-2 font-bold text-teal-950">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                            <span>1단계 심사 시 확인된 내용과 동일함 (신청서 및 현장 실태 확인 완료)</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">심사 확인 서명</th>
                        <td colSpan={2} className="p-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border border-slate-300 p-2 rounded">
                              <span className="font-bold text-slate-700 block mb-1">고객 확인 (대표자)</span>
                              {renderSignatureCell('cert_cust_p17', '고객 확인 (서명)', '고객확인', scopeConfirmData.ceoName || company.ceoName || '박진용', '대표이사', company.contactEmail)}
                            </div>
                            <div className="border border-slate-300 p-2 rounded">
                              <span className="font-bold text-slate-700 block mb-1">심사 팀장</span>
                              {renderSignatureCell('cert_lead_p17', '심사팀장 (서명)', '심사팀장', auditor?.name || '남경호', auditor?.grade || '선임심사원', auditor?.email)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                    [지엠에스씨에스㈜ 인증원]
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 3년 심사계획 요약서 (Table 30~32) */}
              {/* ================================================================= */}
              {(activeDocTab === 'all' || activeDocTab === 'plan_summary') && (
                <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-page min-h-[1100px] space-y-6 relative">
                  {renderReportPageHeader('F16-012(20251001)')}
                  <div className="text-center py-2">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                      3년 심사계획 요약서
                    </h1>
                  </div>

                  {/* Table 32: 3년 심사계획 매트릭스 */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-950 text-xs">▶ 3년 심사계획 매트릭스</h3>
                    <table className="w-full border-collapse border border-slate-700 text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-700">
                          <th className="p-2 border-r border-slate-400 text-center font-bold">심사차수 요구사항</th>
                          <th className="p-2 border-r border-slate-400 text-center font-bold">최초/갱신</th>
                          <th className="p-2 border-r border-slate-400 text-center font-bold">사후1차</th>
                          <th className="p-2 border-r border-slate-400 text-center font-bold">사후2차</th>
                          <th className="p-2 text-center font-bold">사후3차</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { req: '4. 조직상황', c1: '○', c2: '○', c3: '○', c4: '○' },
                          { req: '5. 리더십', c1: '○', c2: '○', c3: '○', c4: '○' },
                          { req: '6. 기획', c1: '○', c2: '○', c3: '○', c4: '○' },
                          { req: '7. 지원', c1: '○', c2: '○', c3: '○', c4: '○' },
                          { req: '8. 운용', c1: '○', c2: '○', c3: '○', c4: '○' },
                          { req: '9. 성과평가', c1: '○', c2: '○', c3: '○', c4: '○' },
                          { req: '10. 개선', c1: '○', c2: '○', c3: '○', c4: '○' },
                        ].map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-400 text-center">
                            <td className="p-1.5 font-bold text-left bg-slate-50 border-r border-slate-400">{row.req}</td>
                            <td className="p-1.5 border-r border-slate-400 text-emerald-800 font-bold">{row.c1}</td>
                            <td className="p-1.5 border-r border-slate-400 text-emerald-800 font-bold">{row.c2}</td>
                            <td className="p-1.5 border-r border-slate-400 text-emerald-800 font-bold">{row.c3}</td>
                            <td className="p-1.5 text-emerald-800 font-bold">{row.c4}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                    [지엠에스씨에스㈜ 인증원]
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
                                value={ncrItem.certNo || scopeConfirmData.certNo || 'GMS-2609-08'}
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
                              {renderSignatureCell(`car_auditor_init_${ncrItem.id}`, '심사원 (서명)', '심사팀장', auditor?.name || '남경호', auditor?.grade || '선임심사원', auditor?.email)}
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
                              {renderSignatureCell(`car_lead_sign_${ncrItem.id}`, '심사팀장 (서명)', '심사팀장', auditor?.name || '남경호', auditor?.grade || '선임심사원', auditor?.email)}
                            </td>
                            <th className="p-2 border-r border-slate-400 text-left font-bold">인증고객</th>
                            <td className="p-2">
                              {renderSignatureCell(`car_client_sign_${ncrItem.id}`, '인증고객 확인 (서명)', '고객확인', scopeConfirmData.ceoName || company.ceoName || '박진용', '대표이사', company.contactEmail)}
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
                                value={ncrItem.actionDate || '2026-09-25'}
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
                              {renderSignatureCell(`car_client_done_${ncrItem.id}`, '인증고객 확인 (서명)', '고객확인', scopeConfirmData.ceoName || company.ceoName || '박진용', '대표이사', company.contactEmail)}
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
                                  {renderSignatureCell(`car_verif_auditor_${ncrItem.id}`, '확인 심사원 (서명)', '확인심사원', auditor?.name || '남경호', auditor?.grade || '선임심사원', auditor?.email)}
                                </div>
                              </div>
                            </td>
                            <td colSpan={2} className="p-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-slate-700">효과성 확인 서명:</span>
                                <div className="w-48">
                                  {renderSignatureCell(`car_eff_auditor_${ncrItem.id}`, '효과성 심사원 (서명)', '확인심사원', auditor?.name || '남경호', auditor?.grade || '선임심사원', auditor?.email)}
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
