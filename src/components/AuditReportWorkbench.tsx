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
  RefreshCcw
} from 'lucide-react';
import type { Company, Auditor, AuditReport, AuditContractRecord, ProofDocument } from '../types';
import { initialFullReportData } from '../data/mockFullRemarkPack';
import { remarkMeetingAgendas } from '../data/mockRemarkData';

// ============================================================
// 2025 Audit Report Pack (251001) 실물 종이 서식 포맷 100% 완전 구현
// 신청서 / 청구서와 동일한 실물 문서 그리드 포맷 (1단계, 2단계, 인증서확인서, NCR, 회의록/이해관계)
// 모든 조항 심사원 작성란 및 전자메일 서명 기능 완비
// ============================================================

interface AuditReportWorkbenchProps {
  company: Company;
  contract?: AuditContractRecord;
  report?: AuditReport;
  auditor?: Auditor;
  auditors?: Auditor[];
  onClose: () => void;
  onSave?: (data: any) => void;
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

type ReportTabKey = 'stage1' | 'stage2' | 'cert_confirm' | 'ncr' | 'meeting_conflict' | 'proof_upload';

// 초기 증빙 서류 목록
const initialProofDocs: ProofDocument[] = [
  { docType: '사업자등록증 / 공장등록증', uploaded: true, fileName: '사업자등록증_케이원메탈.pdf', uploadedAt: '2026-09-08', verified: true },
  { docType: '심사 신청서 및 표준계약서 사본', uploaded: true, fileName: 'F16-004_표준계약서_체결본.pdf', uploadedAt: '2026-09-08', verified: true },
  { docType: '공정도 (제조/서비스 흐름도)', uploaded: true, fileName: '주조및가공_제조공정도.pdf', uploadedAt: '2026-09-09', verified: true },
  { docType: '조직도 및 비상연락망', uploaded: true, fileName: '2026_조직기구표.pdf', uploadedAt: '2026-09-09', verified: true },
  { docType: '국민연금 가입자 명부 (인원확인)', uploaded: true, fileName: '국민연금_가입자내역(48명).pdf', uploadedAt: '2026-09-09', verified: true },
  { docType: '환경/안전 인허가증 (대기/폐수/소방)', uploaded: true, fileName: '대기배출시설_설치신고필증.pdf', uploadedAt: '2026-09-09', verified: true },
];

export const AuditReportWorkbench: React.FC<AuditReportWorkbenchProps> = ({
  company,
  contract,
  report,
  auditor,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<ReportTabKey>('stage1');
  const [proofDocs, setProofDocs] = useState<ProofDocument[]>(initialProofDocs);

  // 로컬 스토리지 키
  const storageKey = useMemo(() => `GMSCS_REPORT_PACK_${company.id || company.companyName}`, [company]);

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
        signerName: company.ceoName || '박한성',
        signerPosition: '대표이사',
        signerEmail: company.contactEmail || 'ceo@k1metal.co.kr',
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

  // 1단계 심사 데이터 State
  const [stage1Data, setStage1Data] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_STAGE1`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      auditType: contract?.contractType || '최초',
      auditStandards: contract?.standards?.join(', ') || 'ISO 9001, ISO 14001',
      diffFromApp: '없다',
      diffDetails: '',
      manualDocNo: 'QM-01',
      manualRevDate: '2026-01-10',
      manualRevNo: 'Rev.4',
      processDocNo: 'QP-01~12',
      processRevDate: '2025-11-20',
      processRevNo: 'Rev.2',
      scopeConfirmed: company.scope || company.industry || '정밀 주조 및 자동차용 기계부품의 가공 및 조립',
      exclusionClause: '8.3',
      exclusionReason: '고객 제공 도면에 의한 주문 생산으로 설계 및 개발 활동 없음',
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
      env1_details: '대기배출시설 4종 신고필증 보유',
      env2_aspect: '예',
      env2_significant: '예',
      env2_compliance: '예',
      env3_procedure: '예',
      env4_manager: '예',
      // ISO 45001
      safe1_managerName: '박한성 대표이사',
      safe1_safetyPerson: '대한안전관리협회 위탁',
      safe1_healthPerson: '한국보건위탁연구소',
      safe1_workerRep: '최진우 직장 (근로자대표)',
      safe2_riskEval: '예',
      safe3_1: '예',
      safe3_2: '예',
      safe3_3: '예',
      safe3_4: '예',
      safe3_5: '예',
      safe3_6: '예',
      safe3_7: '예',
      safe4_team: '예',
      safe5_criticalCount: '2',
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
        { name: company.ceoName || '박한성', role: '대표이사 / 최고경영자' },
        { name: '김철수', role: '품질관리팀장 / 부장' },
        { name: '이영희', role: '환경안전관리자 / 차장' },
        { name: '최진우', role: '생산부 / 근로자대표' },
        { name: '정민호', role: '영업총괄 / 이사' },
        { name: '윤상혁', role: '구매자재팀 / 과장' },
      ],
      // 요구사항별 심사원 상세 기록
      clauseNotes: [
        { clause: '4. 조직상황', notes: '내·외부 이슈 등록부(Doc.QP-01) 및 이해관계자 요구사항이 2026년 경영계획에 잘 반영되어 관리되고 있음.', result: '적합', findings: '' },
        { clause: '5. 리더십', notes: '최고경영자의 품질/환경 방침이 사내 게시 및 홈페이지에 공표되었으며, 조직 내 역할과 책임이 명확히 분장됨.', result: '적합', findings: '' },
        { clause: '6. 기획', notes: '품질 및 환경 리스크 평가표가 수립되어 있으며, 부서별 2026년 품질/환경 목표 달성계획서가 적정하게 수립됨.', result: '적합', findings: '' },
        { clause: '7. 지원', notes: '적격성 관리대장, 교육훈련 계획 및 계측기(버니어캘리퍼스 등 12종) 교정검사 성적서가 유효하게 유지 관리됨.', result: '적합', findings: '' },
        { clause: '8. 운용', notes: '주조 및 가공 공정표준서, 작업표준서, 검사기준서(QP-08)가 현장에 비치되어 있으며 정상적으로 운용 기록됨.', result: '적합', findings: '' },
        { clause: '9. 성과평가', notes: '2026년 상반기 내부심사(2026.07.15 실시) 및 경영검토(2026.08.10 실시)가 체계적으로 이행 및 보고됨.', result: '적합', findings: '' },
        { clause: '10. 개선', notes: '고객불만 및 부적합품 발생에 대한 시정조치 요구서(NCR) 3건의 원인분석 및 유효성 확인이 완결됨.', result: '적합', findings: '' },
        { clause: '기타문서', notes: '공장등록증, 대기배출시설 신고필증, 폐기물 위탁계약서 등 인허가 관련 서류 적정 유지.', result: '적합', findings: '' },
      ],
      // 심사결과 및 결론
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

  // 2단계 심사 데이터 State
  const [stage2Data, setStage2Data] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_STAGE2`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      auditType: contract?.contractType || '최초',
      auditStandards: contract?.standards?.join(', ') || 'ISO 9001, ISO 14001',
      auditDateStart: '2026-09-10',
      auditDateEnd: '2026-09-11',
      auditMd: '2.0',
      // 공통 심사 내역
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
      performanceNotes: 'MES 연동 실시간 품질 모니터링 시스템 구축으로 공정불량률이 전년 대비 18% 감소하였으며, 작업장 조명 개선 및 분진 집진기 필터 교체로 환경 안전 조건이 대폭 향상됨.',
      internalAuditDate: '2026-07-15',
      internalAuditNotes: '전 부서 대상 내부심사 완료, 시정조치 2건 조치완료 확인',
      mgmtReviewDate: '2026-08-10',
      mgmtReviewNotes: '대표이사 주관 경영검토 회의록 및 예산/목표 승인 확인',
      coreProcessNotes: '영업 수주 -> 생산계획 -> 주조/용해 -> 정밀가공 -> 출하검사 -> 납품',
      keyCustomers: '(주)현대모비스, HD현대인프라코어, 두산밥캣',
      complaintNotes: '2026년 상반기 납기지연 불만 1건 접수, 생산 Capa 재조정 및 완제품 안전재고 확보로 유효성 확인 완료.',
      legalNotes: '산업안전보건법 및 대기환경보전법 자가측정 성적서(2026.06) 기준치 이내 적합.',
      exclusionClause: '8.3 설계 및 개발 (고객 도면 주문생산)',
      stage1ChangeNotes: '1단계 심사 이후 특이 변경사항 없음.',
      // ISO 14001 추가
      envAspect: '용해 공정 분진, 절삭유 폐기물, 전력 및 용수 사용',
      envEvalDate: '2026-04-10',
      envEvaluator: '이영희 차장',
      envEvalResult: '적합',
      envLegalDate: '2026-06-20',
      envLegalEvaluator: '이영희 차장',
      envLegalResult: '적합',
      // ISO 45001 추가
      safeRiskAspect: '크레인 중량물 낙하, 용해로 고열/화상, 지게차 충돌 리스크',
      safeEvalDate: '2026-05-15',
      safeEvaluator: '최진우 근로자대표 외 2명',
      safeLegalDate: '2026-06-25',
      safeLegalEvaluator: '박한성 대표이사',
      safeLegalResult: '적합',
      // PROCESS Audit NOTE (요구사항별 현장 심사 기록)
      auditNotes: [
        {
          clause: '4. 조직상황',
          content: '[확인 내용]: 2026년도 조직 내/외부 이슈 분석표 및 이해관계자의 요구사항 분석 기록(Doc No. QP-01) 검토.\n[객관적 증거]: 2026년 1월 경영계획 수립 시 원자재 가격 상승 및 숙련공 수급 이슈가 전략 과제로 선정되어 관리되고 있음 확인.'
        },
        {
          clause: '5. 리더십',
          content: '[확인 내용]: 최고경영자 면담 및 품질/환경/안전 경영방침 전파 상태 확인.\n[객관적 증거]: 정문 및 각 생산라인에 경영방침이 게시되어 있으며, 현장 반장 인터뷰 결과 방침 숙지 상태 양호.'
        },
        {
          clause: '6. 기획',
          content: '[확인 내용]: 품질목표(공정불량률 0.5% 이하, 고객만족도 90점) 및 환경안전 목표 추진실적 검토.\n[객관적 증거]: 2026년 상반기 실적 집계표(QP-05-02), 리스크 평가표 개정 이력 확인.'
        },
        {
          clause: '7. 지원',
          content: '[확인 내용]: 교육훈련, 시설관리, 측정장비 교정검사 성적서 확인.\n[객관적 증거]: 3차원 측정기(교정일자 2026-03-12, 성적서번호 KTR-2026-9912) 유효성 확인 완료.'
        },
        {
          clause: '8. 운용',
          content: '[확인 내용]: 수주 검토, 구매자재 입고검사, 주조/가공 생산공정, 최종검사 및 식별추적성 확인.\n[객관적 증거]: LOT No. KM2609-001 작업지시서, 초중종물 검사일지, 부적합품 격리보관 구역 확인.'
        },
        {
          clause: '9. 성과평가',
          content: '[확인 내용]: 고객만족도 조사(2026년 7월, 종합 92.4점), 내부심사(2026.07.15), 경영검토 보고서 확인.\n[객관적 증거]: 내부심사 체크리스트, 부적합 보고서 발행 및 시정조치 완료 내역 확인.'
        },
        {
          clause: '10. 개선',
          content: '[확인 내용]: 지속적 개선 과제 수행 및 부적합 시정조치 유효성 평가 확인.\n[객관적 증거]: NC-2026-01호(가공 칩 비산방지 커버 설치 완료) 시정조치 전후 사진 및 유효성 서명 확인.'
        }
      ],
      // 발견사항 요약
      ncrSummaryText: '부적합 사항 없음 (Clean Audit)',
      obsSummaryText: '1. 원자재 보관창고 일부 파레트의 적재 높이 기준 라벨 보강 권고.\n2. 신규 입사자 대상 OJT 안전교육 일지 작성 시 서명 누락 방지 관리 요망.',
      // 발견사항 집계
      countMinor: '0',
      countMajor: '0',
      countObs: '2',
      auditorResultReview: '적합',
      overallSummary: '본 조직은 경영시스템 요구사항에 따른 공정 운영 및 품질보증 활동을 성실히 이행하고 있으며, 데이터 기반의 공정 관리 수준이 매우 우수함. 발견된 권고사항 2건은 차기 사후심사 시 지속 개선 여부를 확인함.',
      conclusionChoice: '1', // 1: 어떠한 부적합도 발견되지 않아 인증추천/유지, 2: 경부적합 시정조치 후 추천, 3: 중부적합 재심사, 4: 기타
      conclusionOther: '',
      // 차기 심사
      nextAuditType: '사후1차',
      nextAuditMonth: '2027-09',
      nextAuditMd: '2.0'
    };
  });

  // 서명 상태 LocalStorage 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}_SIGS`, JSON.stringify(signatures));
    }
  }, [signatures, storageKey]);

  // 1단계 데이터 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}_STAGE1`, JSON.stringify(stage1Data));
    }
  }, [stage1Data, storageKey]);

  // 2단계 데이터 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}_STAGE2`, JSON.stringify(stage2Data));
    }
  }, [stage2Data, storageKey]);

  // 전체 저장 함수
  const handleSaveAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}_STAGE1`, JSON.stringify(stage1Data));
      localStorage.setItem(`${storageKey}_STAGE2`, JSON.stringify(stage2Data));
      localStorage.setItem(`${storageKey}_SIGS`, JSON.stringify(signatures));
    }
    if (onSave) {
      onSave({ stage1Data, stage2Data, signatures });
    }
    alert('[심사보고서 저장 완료]\n2025 Audit Report Pack의 모든 작성 내용과 전자 서명이 시스템에 안전하게 저장되었습니다.');
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

  // 서명 취소/초기화
  const handleResetSignature = (slotId: string) => {
    if (confirm('서명을 초기화하고 다시 서명하시겠습니까?')) {
      setSignatures(prev => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
    }
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
          onClick={() => handleResetSignature(slotId)}
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
            name: defaultName || (role === '심사팀장' ? (auditor?.name || '남경호') : company.ceoName || '박한성'),
            position: defaultPos || (role === '심사팀장' ? '선임심사원' : '대표이사'),
            email: defaultEmail || (role === '심사팀장' ? (auditor?.email || 'auditor@gmscs.co.kr') : company.contactEmail || 'ceo@company.com'),
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xs flex flex-col overflow-hidden text-slate-900">
      {/* 1. 최상단 글로벌 툴바 */}
      <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="닫기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <FileCheck className="w-5 h-5 text-teal-400" />
                <span>2025 Audit Report Pack 공식 심사보고서</span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-teal-900 text-teal-200 border border-teal-700">
                GMSCS-F01-Pack (251001)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              고객사: <strong className="text-white">{company.companyName}</strong> ({company.bizNumber || '사업자등록번호'}) | 담당 심사원: {auditor?.name || '남경호'} 선임심사원
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 인쇄/PDF 저장</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>보고서 전체 저장</span>
          </button>
        </div>
      </div>

      {/* 2. 메인 컨텐츠 영역: 좌측 2.5사이드바 + 우측 7.5 실물 종이 서식 */}
      <div className="flex-1 flex overflow-hidden bg-slate-200/80">
        {/* 좌측 사이드바 (2.5) */}
        <div className="w-72 lg:w-80 bg-slate-100 border-r border-slate-300 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4 text-xs">
          {/* 심사 서식 탭 네비게이션 */}
          <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-300 shadow-2xs">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-1.5 text-slate-500">
              보고서 서식 탭 선택
            </span>
            <button
              onClick={() => setActiveTab('stage1')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between transition-colors ${
                activeTab === 'stage1'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>1단계 적합성 심사보고서</span>
              </div>
              <span className="text-[10px] opacity-80">1st Stage</span>
            </button>

            <button
              onClick={() => setActiveTab('stage2')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between transition-colors ${
                activeTab === 'stage2'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>2단계 현장 심사보고서</span>
              </div>
              <span className="text-[10px] opacity-80">2nd Stage</span>
            </button>

            <button
              onClick={() => setActiveTab('cert_confirm')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between transition-colors ${
                activeTab === 'cert_confirm'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>인증서 기재사항 & 3년계획</span>
              </div>
              <span className="text-[10px] opacity-80">Table 29</span>
            </button>

            <button
              onClick={() => setActiveTab('ncr')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between transition-colors ${
                activeTab === 'ncr'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>부적합 보고서 (NCR)</span>
              </div>
              <span className="text-[10px] opacity-80">Table 33</span>
            </button>

            <button
              onClick={() => setActiveTab('meeting_conflict')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between transition-colors ${
                activeTab === 'meeting_conflict'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>회의록 & 이해관계서</span>
              </div>
              <span className="text-[10px] opacity-80">Table 16/17</span>
            </button>

            <button
              onClick={() => setActiveTab('proof_upload')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between transition-colors ${
                activeTab === 'proof_upload'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>심사 증빙 서류 첨부</span>
              </div>
              <span className="text-[10px] opacity-80">6종</span>
            </button>
          </div>

          {/* 고객사 마스터 정보 카드 */}
          <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900">{company.companyName}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600">
                {company.bizNumber || '107-88-30351'}
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <div><strong className="text-slate-800">대표자:</strong> {company.ceoName || '박한성'}</div>
              <div><strong className="text-slate-800">인원:</strong> {company.totalEmployees || 48}명</div>
              <div><strong className="text-slate-800">주소:</strong> {company.address || '경기도 화성시 향남읍 발안공단로 45'}</div>
              <div><strong className="text-slate-800">심사표준:</strong> {stage1Data.auditStandards}</div>
            </div>
          </div>

          {/* 전자 서명 상태 현황 요약 */}
          <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-2xs space-y-2">
            <span className="font-bold text-slate-800 text-[11px] block border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-700" />
              <span>전자메일 서명 상태</span>
            </span>
            <div className="space-y-1.5 text-[11px]">
              {Object.keys(signatures).length === 0 ? (
                <p className="text-slate-400 italic">완료된 전자 서명이 없습니다.</p>
              ) : (
                Object.values(signatures).map(sig => (
                  <div key={sig.slotId} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-1.5 rounded">
                    <div>
                      <span className="font-bold text-emerald-950">{sig.signerName}</span>
                      <span className="text-[10px] text-emerald-700 block">({sig.signerPosition} / {sig.slotLabel})</span>
                    </div>
                    <span className="text-[9.5px] font-mono text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded">
                      {sig.signedAt.slice(5, 16)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 우측 메인 영역 (7.5): 실물 종이 서식 A4 페이퍼 뷰어 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className="w-full max-w-[960px] bg-white shadow-xl border border-slate-400 p-6 md:p-12 text-slate-900 leading-normal text-xs font-sans space-y-8">
            
            {/* ======================================================== */}
            {/* TAB 1: 1단계 적합성 평가 심사보고서 실물 종이 서식 */}
            {/* ======================================================== */}
            {activeTab === 'stage1' && (
              <div className="space-y-6">
                {/* 상단 헤더 */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-2">
                  <span className="text-sm font-black tracking-wider text-slate-800 font-serif">ESG with GMSCS</span>
                  <span className="text-sm font-black tracking-wider text-slate-800 font-serif">ISO Audit Report</span>
                </div>

                <div className="text-center py-2">
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                    적합성 평가 심사보고서(1st Stage)
                  </h1>
                </div>

                {/* Table 0: 고객명 / 심사표준 / 심사유형 */}
                <table className="w-full border-collapse border border-slate-700 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <th className="w-28 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고 객 명</th>
                      <td className="p-2 font-bold text-slate-900">{company.companyName}</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심 사 표 준</th>
                      <td className="p-2 space-x-4">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded border-slate-400 text-teal-700" />
                          <span>ISO 9001</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded border-slate-400 text-teal-700" />
                          <span>ISO 14001</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-400 text-teal-700" />
                          <span>ISO 45001</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-400 text-teal-700" />
                          <span>ESG-MS</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-400 text-teal-700" />
                          <span>기타( )</span>
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심 사 유 형</th>
                      <td className="p-2 space-x-4">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input type="radio" name="s1_type" defaultChecked className="text-teal-700" />
                          <span>최초</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input type="radio" name="s1_type" className="text-teal-700" />
                          <span>사후 ( )</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input type="radio" name="s1_type" className="text-teal-700" />
                          <span>갱신</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input type="radio" name="s1_type" className="text-teal-700" />
                          <span>전환</span>
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Table 1 & Table 2: 고객 및 심사팀 확인 서명 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600 font-bold px-1">
                    <span>※ 보고서 확인</span>
                    <span>※ ISO 45001만 해당</span>
                  </div>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고객 확인</th>
                        <td className="p-2 border-r border-slate-400 font-bold">{company.ceoName || '박한성'}</td>
                        <td className="w-36 p-1 border-r border-slate-400">
                          {renderSignatureCell('s1_cust', '고객 확인 (서명)', '고객확인', company.ceoName || '박한성', '대표이사', company.contactEmail)}
                        </td>
                        <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">근로자 대표</th>
                        <td className="p-2 border-r border-slate-400 font-bold">최진우 (직장)</td>
                        <td className="w-36 p-1">
                          {renderSignatureCell('s1_work', '근로자대표 (서명)', '근로자대표', '최진우', '근로자대표', 'worker@k1metal.co.kr')}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀장</th>
                        <td className="p-2 border-r border-slate-400 font-bold">{auditor?.name || '남경호'}</td>
                        <td className="p-1 border-r border-slate-400">
                          {renderSignatureCell('s1_lead', '심사팀장 (서명)', '심사팀장', auditor?.name || '남경호', auditor?.grade || '선임심사원', auditor?.email)}
                        </td>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                        <td className="p-2 border-r border-slate-400 font-bold">신현섭</td>
                        <td className="p-1">
                          {renderSignatureCell('s1_team1', '심사팀원 (서명)', '심사팀원', '신현섭', '심사원', 'auditor2@gmscs.co.kr')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ◆ 1단계 심사의 목적 */}
                <div className="border border-slate-300 bg-slate-50 p-3 space-y-1.5 text-[11px] leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900 block text-xs">◆ 1단계 심사의 목적</span>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>경영시스템을 문서화한 정보 검토</li>
                    <li>조직의 위치 및 사업장별 상태를 평가하고, 2단계 심사를 위한 준비상태를 결정하기 위하여 조직의 인원들과 논의</li>
                    <li>표준 요구사항, 특히 경영시스템의 주요성과 또는 중대한 측면의 파악, 프로세스, 목표 및 운영과 관련된 조직의 상태 및 이해 정도를 검토</li>
                    <li>경영시스템의 인증범위와 관련된 필수 정보(사업장, 프로세스/장비, 법적·규제적 요구사항 등) 획득</li>
                    <li>2단계 심사를 위한 자원의 배정에 대해 검토하고 2단계 심사의 세부사항에 대하여 조직과 합의</li>
                    <li>중대한 측면과 관련하여 조직의 경영시스템 및 사업장 운영에 대하여 충분히 이해함으로써 2단계 심사계획을 위한 중점사항 제공</li>
                    <li>내부심사와 경영검토를 계획 및 수행하고 있는지의 여부를 평가하고, 인증고객이 2단계 심사를 받을 준비가 되었음을 평가</li>
                  </ol>
                </div>

                {/* I. 고객 현황 (Table 3) */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-950 text-xs">I. 고객 현황</h3>
                  <p className="text-[11px] text-slate-600">
                    다음 사항은 지엠에스씨에스㈜ 인증원 심사원에 의해 검토되고 고객에게 확인함 (변경사항이 있는 경우 최초 계약서를 아래에 기술한 내용으로 변경하는데 동의함)
                  </p>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <th className="w-28 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">고 객 명</th>
                        <td className="p-2 border-r border-slate-400 font-bold">{company.companyName}</td>
                        <th className="w-28 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">인증번호</th>
                        <td className="p-2 font-mono">GMS-2609-08</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">심사일자</th>
                        <td colSpan={3} className="p-2">2026년 09월 08일</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">주사업장 주소</th>
                        <td colSpan={3} className="p-2">{company.address || '경기도 화성시 향남읍 발안공단로 45'}</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">추가사업장 주소</th>
                        <td colSpan={3} className="p-2 text-slate-500">해당사항 없음 (단일 사업장)</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">Tel</th>
                        <td className="p-2 border-r border-slate-400">{company.contactPhone || '031-353-8890'}</td>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">Fax</th>
                        <td className="p-2">031-353-8891</td>
                      </tr>
                      <tr>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">Home page</th>
                        <td className="p-2 border-r border-slate-400">www.k1metal.co.kr</td>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">E-Mail</th>
                        <td className="p-2 font-mono">{company.contactEmail || 'ceo@k1metal.co.kr'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Ⅱ. 심사표준 */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-950 text-xs">Ⅱ. 심사표준</h3>
                  <div className="border border-slate-400 p-2.5 bg-slate-50 space-x-6 text-xs font-semibold">
                    <label className="inline-flex items-center gap-1.5">
                      <input type="checkbox" defaultChecked className="rounded border-slate-400 text-teal-700" />
                      <span>ISO 9001:2015</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input type="checkbox" defaultChecked className="rounded border-slate-400 text-teal-700" />
                      <span>ISO 14001:2015</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input type="checkbox" className="rounded border-slate-400 text-teal-700" />
                      <span>ISO 45001:2018</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input type="checkbox" className="rounded border-slate-400 text-teal-700" />
                      <span>ESG-MS</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input type="checkbox" className="rounded border-slate-400 text-teal-700" />
                      <span>기타( )</span>
                    </label>
                  </div>
                </div>

                {/* Ⅲ. 1단계 심사 (공통 심사 내역) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-950 text-xs">Ⅲ. 1단계 심사</h3>
                    <span className="text-[10.5px] text-rose-700 font-bold">
                      ▶ 심사팀장은 신청서와 차이점 발견 시 즉시 인증원에 보고하여 심사진행 및 변경사항을 협의합니다.
                    </span>
                  </div>

                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-700">
                        <th colSpan={3} className="p-2 text-center font-black tracking-wider text-slate-900 border-r border-slate-400">
                          ◆ 공 통 심 사 내 역 ◆
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 1 */}
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">1</td>
                        <td className="p-2 border-r border-slate-400 font-medium">
                          신청서와 설문서 상의 차이가 있는가? (사업장 위치, 조직 현황 등)
                        </td>
                        <td className="w-36 p-2 text-center">
                          <select
                            value={stage1Data.diffFromApp}
                            onChange={(e) => setStage1Data({ ...stage1Data, diffFromApp: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs bg-white"
                          >
                            <option value="없다">없다</option>
                            <option value="있다">있다</option>
                          </select>
                        </td>
                      </tr>

                      {/* 2 */}
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400" rowSpan={2}>2</td>
                        <td colSpan={2} className="p-2 bg-slate-50 font-bold border-b border-slate-300">
                          경영시스템의 문서화된 정보
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td colSpan={2} className="p-2 space-y-1.5">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 block">매뉴얼 문서번호</span>
                              <input
                                type="text"
                                value={stage1Data.manualDocNo}
                                onChange={(e) => setStage1Data({ ...stage1Data, manualDocNo: e.target.value })}
                                className="w-full border border-slate-300 rounded p-1 text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">제/개정 일자</span>
                              <input
                                type="text"
                                value={stage1Data.manualRevDate}
                                onChange={(e) => setStage1Data({ ...stage1Data, manualRevDate: e.target.value })}
                                className="w-full border border-slate-300 rounded p-1 text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">개정 번호</span>
                              <input
                                type="text"
                                value={stage1Data.manualRevNo}
                                onChange={(e) => setStage1Data({ ...stage1Data, manualRevNo: e.target.value })}
                                className="w-full border border-slate-300 rounded p-1 text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 block">프로세스 문서번호</span>
                              <input
                                type="text"
                                value={stage1Data.processDocNo}
                                onChange={(e) => setStage1Data({ ...stage1Data, processDocNo: e.target.value })}
                                className="w-full border border-slate-300 rounded p-1 text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">제/개정 일자</span>
                              <input
                                type="text"
                                value={stage1Data.processRevDate}
                                onChange={(e) => setStage1Data({ ...stage1Data, processRevDate: e.target.value })}
                                className="w-full border border-slate-300 rounded p-1 text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">개정 번호</span>
                              <input
                                type="text"
                                value={stage1Data.processRevNo}
                                onChange={(e) => setStage1Data({ ...stage1Data, processRevNo: e.target.value })}
                                className="w-full border border-slate-300 rounded p-1 text-xs"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* 3 */}
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">3</td>
                        <td className="p-2 border-r border-slate-400 font-medium">
                          경영시스템 적용범위와 인증범위 확인:
                          <input
                            type="text"
                            value={stage1Data.scopeConfirmed}
                            onChange={(e) => setStage1Data({ ...stage1Data, scopeConfirmed: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 mt-1 text-xs font-bold text-slate-800"
                          />
                        </td>
                        <td className="p-2 text-center font-bold text-emerald-700">확인완료</td>
                      </tr>

                      {/* 4 */}
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">4</td>
                        <td className="p-2 border-r border-slate-400">
                          <span className="font-medium block mb-1">적용제외 항목 및 타당성 근거(ISO 9001만 해당)</span>
                          <div className="grid grid-cols-4 gap-2">
                            <input
                              type="text"
                              value={stage1Data.exclusionClause}
                              onChange={(e) => setStage1Data({ ...stage1Data, exclusionClause: e.target.value })}
                              placeholder="제외조항 (예: 8.3)"
                              className="border border-slate-300 rounded p-1 text-xs"
                            />
                            <input
                              type="text"
                              value={stage1Data.exclusionReason}
                              onChange={(e) => setStage1Data({ ...stage1Data, exclusionReason: e.target.value })}
                              placeholder="타당성 근거 기술"
                              className="col-span-3 border border-slate-300 rounded p-1 text-xs"
                            />
                          </div>
                        </td>
                        <td className="p-2 text-center font-bold text-slate-700">적용제외</td>
                      </tr>

                      {/* 5 */}
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400" rowSpan={3}>5</td>
                        <td className="p-2 border-r border-slate-400">5.1 주요성과 및 중대한 측면이 파악되고 있는가?</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.q5_1}
                            onChange={(e) => setStage1Data({ ...stage1Data, q5_1: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="p-2 border-r border-slate-400">5.2 조직의 운영과 관련된 프로세스를 이해하고 있는가?</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.q5_2}
                            onChange={(e) => setStage1Data({ ...stage1Data, q5_2: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="p-2 border-r border-slate-400">5.3 조직의 목표 및 운영에 대해 파악하고 있는가?</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.q5_3}
                            onChange={(e) => setStage1Data({ ...stage1Data, q5_3: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                          </select>
                        </td>
                      </tr>

                      {/* 6, 7, 8, 9, 10 */}
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">6</td>
                        <td className="p-2 border-r border-slate-400">내부심사가 실시되었는가?</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.q6_internalAudit}
                            onChange={(e) => setStage1Data({ ...stage1Data, q6_internalAudit: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">7</td>
                        <td className="p-2 border-r border-slate-400">경영검토가 실시되었는가 ?</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.q7_managementReview}
                            onChange={(e) => setStage1Data({ ...stage1Data, q7_managementReview: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">8</td>
                        <td className="p-2 border-r border-slate-400">프로세스 및 장비에 대한 운영관리는 파악되고 있는가?</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.q8_operationControl}
                            onChange={(e) => setStage1Data({ ...stage1Data, q8_operationControl: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">9</td>
                        <td className="p-2 border-r border-slate-400">조직에 적용되는 법적, 규제적 요구사항이 파악되었는가?</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.q9_legalCompliance}
                            onChange={(e) => setStage1Data({ ...stage1Data, q9_legalCompliance: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">10</td>
                        <td className="p-2 border-r border-slate-400">최근 3년내 법규 위반사항이 있는가</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.q10_legalViolation}
                            onChange={(e) => setStage1Data({ ...stage1Data, q10_legalViolation: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="없다">없다</option>
                            <option value="있다">있다</option>
                          </select>
                        </td>
                      </tr>

                      {/* ISO 14001 심사내역 헤더 */}
                      <tr className="bg-slate-100 border-b border-slate-700">
                        <th colSpan={3} className="p-2 text-center font-black tracking-wider text-slate-900 border-r border-slate-400">
                          ◆ ISO 14001 심 사 내 역 ◆
                        </th>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">1</td>
                        <td className="p-2 border-r border-slate-400">환경 신고 및 허가 업종인가?(대기, 수질, 토양, 위험물 취급, 화학물질 취급 등)</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.env1_permit}
                            onChange={(e) => setStage1Data({ ...stage1Data, env1_permit: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="예">예</option>
                            <option value="아니오">아니오</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">2</td>
                        <td className="p-2 border-r border-slate-400">환경영향 평가를 실시하고 중대한 환경측면 및 준수의무사항을 파악하였는가?</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.env2_aspect}
                            onChange={(e) => setStage1Data({ ...stage1Data, env2_aspect: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="예">예</option>
                            <option value="아니오">아니오</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">3</td>
                        <td className="p-2 border-r border-slate-400">환경운영 기준을 수립 하였는가?(지침서 파악)</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.env3_procedure}
                            onChange={(e) => setStage1Data({ ...stage1Data, env3_procedure: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="예">예</option>
                            <option value="아니오">아니오</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">4</td>
                        <td className="p-2 border-r border-slate-400">환경관리자는 선임 되었는가?</td>
                        <td className="p-2 text-center">
                          <select
                            value={stage1Data.env4_manager}
                            onChange={(e) => setStage1Data({ ...stage1Data, env4_manager: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          >
                            <option value="예">예</option>
                            <option value="아니오">아니오</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Ⅳ. 통합경영시스템일 경우 통합 정도 파악 (Table 6) */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-950 text-xs">Ⅳ. 통합경영시스템일 경우 통합 정도 파악</h3>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      {[
                        { no: 1, text: '경영시스템 문서가 통합되어 있습니까?', val: stage1Data.ims1_doc, key: 'ims1_doc' },
                        { no: 2, text: '방침 및 목표가 통합되어 있습니까?', val: stage1Data.ims2_policy, key: 'ims2_policy' },
                        { no: 3, text: '전체 조직에 대한 경영검토가 이루어졌습니까', val: stage1Data.ims3_review, key: 'ims3_review' },
                        { no: 4, text: '내부심사가 통합적으로 수행되었습니까?', val: stage1Data.ims4_audit, key: 'ims4_audit' },
                        { no: 5, text: '프로세스 접근이 통합적으로 이루어졌습니까?', val: stage1Data.ims5_process, key: 'ims5_process' },
                        { no: 6, text: '지속적 개선(시정조치 등)이 통합적으로 접근 되었습니까?', val: stage1Data.ims6_improve, key: 'ims6_improve' },
                        { no: 7, text: '통합된 경영지원과 조직의 책임이 구성되어 있습니까?', val: stage1Data.ims7_org, key: 'ims7_org' },
                      ].map(item => (
                        <tr key={item.no} className="border-b border-slate-400">
                          <td className="w-8 p-1.5 text-center font-bold bg-slate-50 border-r border-slate-400">{item.no}</td>
                          <td className="p-1.5 border-r border-slate-400">{item.text}</td>
                          <td className="w-32 p-1.5 text-center">
                            <select
                              value={item.val}
                              onChange={(e) => setStage1Data({ ...stage1Data, [item.key]: e.target.value })}
                              className="w-full border border-slate-300 rounded p-1 text-xs"
                            >
                              <option value="예">예</option>
                              <option value="아니오">아니오</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Ⅴ. 조직의 심사 참석자 (Table 7) */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-950 text-xs">Ⅴ. 조직의 심사 참석자</h3>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-700">
                        <th className="p-1.5 border-r border-slate-400 text-center font-bold">참석자명</th>
                        <th className="p-1.5 border-r border-slate-400 text-center font-bold">직무/직책</th>
                        <th className="p-1.5 border-r border-slate-400 text-center font-bold">참석자명</th>
                        <th className="p-1.5 text-center font-bold">직무/직책</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <td className="p-1.5 border-r border-slate-400 font-bold">{stage1Data.attendees[0]?.name}</td>
                        <td className="p-1.5 border-r border-slate-400">{stage1Data.attendees[0]?.role}</td>
                        <td className="p-1.5 border-r border-slate-400 font-bold">{stage1Data.attendees[1]?.name}</td>
                        <td className="p-1.5">{stage1Data.attendees[1]?.role}</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="p-1.5 border-r border-slate-400 font-bold">{stage1Data.attendees[2]?.name}</td>
                        <td className="p-1.5 border-r border-slate-400">{stage1Data.attendees[2]?.role}</td>
                        <td className="p-1.5 border-r border-slate-400 font-bold">{stage1Data.attendees[3]?.name}</td>
                        <td className="p-1.5">{stage1Data.attendees[3]?.role}</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <td className="p-1.5 border-r border-slate-400 font-bold">{stage1Data.attendees[4]?.name}</td>
                        <td className="p-1.5 border-r border-slate-400">{stage1Data.attendees[4]?.role}</td>
                        <td className="p-1.5 border-r border-slate-400 font-bold">{stage1Data.attendees[5]?.name}</td>
                        <td className="p-1.5">{stage1Data.attendees[5]?.role}</td>
                      </tr>
                      <tr>
                        <th className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">비 고</th>
                        <td colSpan={3} className="p-1.5 text-[11px] text-slate-600">
                          * 필수 참석자: 품질은 품질관리자, 환경은 환경관리자, 안전보건은 안전보건관리책임자와 근로자 대표가 반드시 포함되어야 함
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Ⅶ. 문서화된 정보 확인 (Table 9) - 실물 종이 서식 포맷 (심사원 상세 기록용 Textarea) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-950 text-xs">Ⅶ. 문서화된 정보 확인</h3>
                    <span className="text-[10.5px] text-slate-500">
                      ※ 심사원은 각 요구사항별 문서화 정보 검토 내역을 직접 상세히 기술합니다.
                    </span>
                  </div>

                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-700">
                        <th className="w-28 p-2 border-r border-slate-400 text-center font-bold">요구사항</th>
                        <th className="p-2 border-r border-slate-400 text-center font-bold">문서화된 정보 확인 사항 (심사원의 심사 내용 기록)</th>
                        <th className="w-24 p-2 border-r border-slate-400 text-center font-bold">심사결과</th>
                        <th className="w-40 p-2 text-center font-bold">심사확인 내역(관찰/부적합)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stage1Data.clauseNotes.map((item: { clause: string; notes: string; result: string; findings: string }, idx: number) => (
                        <tr key={idx} className="border-b border-slate-400 hover:bg-slate-50/50">
                          <td className="p-2 font-bold text-slate-900 border-r border-slate-400 align-top bg-slate-50/80">
                            {item.clause}
                          </td>
                          <td className="p-1.5 border-r border-slate-400">
                            <textarea
                              rows={2}
                              value={item.notes}
                              onChange={(e) => {
                                const next = [...stage1Data.clauseNotes];
                                next[idx].notes = e.target.value;
                                setStage1Data({ ...stage1Data, clauseNotes: next });
                              }}
                              placeholder="심사원 검토 내용 기록..."
                              className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500 leading-relaxed resize-y"
                            />
                          </td>
                          <td className="p-1.5 border-r border-slate-400 text-center align-top">
                            <select
                              value={item.result}
                              onChange={(e) => {
                                const next = [...stage1Data.clauseNotes];
                                next[idx].result = e.target.value as any;
                                setStage1Data({ ...stage1Data, clauseNotes: next });
                              }}
                              className={`w-full border rounded p-1 text-xs font-bold ${
                                item.result === '적합' ? 'border-emerald-300 text-emerald-800 bg-emerald-50' : 'border-rose-300 text-rose-800 bg-rose-50'
                              }`}
                            >
                              <option value="적합">적합</option>
                              <option value="부적합">부적합</option>
                              <option value="관찰/권고">관찰/권고</option>
                            </select>
                          </td>
                          <td className="p-1.5 align-top">
                            <input
                              type="text"
                              value={item.findings}
                              onChange={(e) => {
                                const next = [...stage1Data.clauseNotes];
                                next[idx].findings = e.target.value;
                                setStage1Data({ ...stage1Data, clauseNotes: next });
                              }}
                              placeholder="부적합/관찰사항..."
                              className="w-full border border-slate-300 rounded p-1 text-xs"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Ⅷ. 1단계 심사 결과 (Table 10 & 12) */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-950 text-xs">Ⅷ. 1단계 심사 결과</h3>
                  
                  {/* 1) 관찰사항 또는 부적합 사항을 기술 하시오 (Table 10) */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-800 text-[11px] block">1) 관찰사항 또는 부적합 사항 기술</span>
                    <table className="w-full border-collapse border border-slate-700 text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-700">
                          <th className="w-10 p-1.5 border-r border-slate-400 text-center font-bold">No.</th>
                          <th className="w-24 p-1.5 border-r border-slate-400 text-center font-bold">관찰/부적합</th>
                          <th className="p-1.5 border-r border-slate-400 text-center font-bold">관련 내역</th>
                          <th className="w-32 p-1.5 text-center font-bold">시정조치 확인일자</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stage1Data.findingsTable.map((row: { no: number; type: string; details: string; dueDate: string }) => (
                          <tr key={row.no} className="border-b border-slate-400">
                            <td className="p-1.5 text-center font-bold border-r border-slate-400 bg-slate-50">{row.no}</td>
                            <td className="p-1.5 text-center border-r border-slate-400 font-bold text-amber-800">{row.type}</td>
                            <td className="p-1.5 border-r border-slate-400">{row.details}</td>
                            <td className="p-1.5 text-center font-mono">{row.dueDate}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 border-b border-slate-700">
                          <th className="p-1.5 border-r border-slate-400 text-center font-bold">심 사 결 과</th>
                          <td colSpan={3} className="p-2 space-x-6 text-xs font-bold text-slate-900">
                            <span>중부적합: <input type="text" value={stage1Data.summaryMajor} onChange={(e) => setStage1Data({...stage1Data, summaryMajor: e.target.value})} className="w-8 border border-slate-300 rounded text-center p-0.5 mx-1" /> 건</span>
                            <span>경부적합: <input type="text" value={stage1Data.summaryMinor} onChange={(e) => setStage1Data({...stage1Data, summaryMinor: e.target.value})} className="w-8 border border-slate-300 rounded text-center p-0.5 mx-1" /> 건</span>
                            <span>관찰사항: <input type="text" value={stage1Data.summaryObs} onChange={(e) => setStage1Data({...stage1Data, summaryObs: e.target.value})} className="w-8 border border-slate-300 rounded text-center p-0.5 mx-1" /> 건</span>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="p-2 text-[11px] text-slate-600 bg-white">
                            ☛ 경부적합은 심사 일로부터 1개월 이내, 중부적합은 3개월 이내에 시정조치를 하셔야 합니다.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 2) 심사총평 */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 text-[11px] block">2) 심사총평</span>
                    <textarea
                      rows={3}
                      value={stage1Data.overallSummary}
                      onChange={(e) => setStage1Data({ ...stage1Data, overallSummary: e.target.value })}
                      className="w-full border border-slate-400 rounded p-2 text-xs leading-relaxed focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  {/* 3) 1단계 심사 결론 (Table 12) */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-800 text-[11px] block">3) 1단계 심사 결론</span>
                    <table className="w-full border-collapse border border-slate-700 text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-700">
                          <th className="p-2 border-r border-slate-400 text-left font-bold">심 사 결 론</th>
                          <th className="w-28 p-2 text-center font-bold">결론 확인</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-400">
                          <td className="p-2 border-r border-slate-400 font-medium">
                            부적합이 발견되지 않아 2단계 심사로 진행 가능합니다.
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="radio"
                              name="s1_conclusion"
                              checked={stage1Data.conclusion === 'pass'}
                              onChange={() => setStage1Data({ ...stage1Data, conclusion: 'pass' })}
                              className="text-teal-700 w-4 h-4 cursor-pointer"
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <td className="p-2 border-r border-slate-400 font-medium">
                            부적합이 발견되어 시정조치 완료 후 2단계 심사로 진행 가능합니다
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="radio"
                              name="s1_conclusion"
                              checked={stage1Data.conclusion === 'corrective'}
                              onChange={() => setStage1Data({ ...stage1Data, conclusion: 'corrective' })}
                              className="text-teal-700 w-4 h-4 cursor-pointer"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-400 font-medium text-rose-800">
                            중대한 부적합이 발견되어 2단계 심사로 진행이 불가능 합니다
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="radio"
                              name="s1_conclusion"
                              checked={stage1Data.conclusion === 'fail'}
                              onChange={() => setStage1Data({ ...stage1Data, conclusion: 'fail' })}
                              className="text-teal-700 w-4 h-4 cursor-pointer"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: 2단계 현장 심사보고서 실물 종이 서식 */}
            {/* ======================================================== */}
            {activeTab === 'stage2' && (
              <div className="space-y-6">
                {/* 상단 헤더 */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-2">
                  <span className="text-sm font-black tracking-wider text-slate-800 font-serif">ESG with GMSCS</span>
                  <span className="text-sm font-black tracking-wider text-slate-800 font-serif">ISO Audit Report</span>
                </div>

                <div className="text-center py-2">
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                    적합성 평가 심사보고서(2nd Stage)
                  </h1>
                </div>

                {/* Table 13: 고객명 / 심사표준 / 심사유형 */}
                <table className="w-full border-collapse border border-slate-700 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <th className="w-28 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고 객 명</th>
                      <td className="p-2 font-bold text-slate-900">{company.companyName}</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심 사 표 준</th>
                      <td className="p-2 space-x-4">
                        <label className="inline-flex items-center gap-1"><input type="checkbox" defaultChecked /><span>ISO 9001</span></label>
                        <label className="inline-flex items-center gap-1"><input type="checkbox" defaultChecked /><span>ISO 14001</span></label>
                        <label className="inline-flex items-center gap-1"><input type="checkbox" /><span>ISO 45001</span></label>
                        <label className="inline-flex items-center gap-1"><input type="checkbox" /><span>ESG-MS</span></label>
                        <label className="inline-flex items-center gap-1"><input type="checkbox" /><span>기타( )</span></label>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심 사 유 형</th>
                      <td className="p-2 space-x-4">
                        <label className="inline-flex items-center gap-1"><input type="radio" name="s2_type" defaultChecked /><span>최초</span></label>
                        <label className="inline-flex items-center gap-1"><input type="radio" name="s2_type" /><span>사후 ( )</span></label>
                        <label className="inline-flex items-center gap-1"><input type="radio" name="s2_type" /><span>갱신</span></label>
                        <label className="inline-flex items-center gap-1"><input type="radio" name="s2_type" /><span>전환</span></label>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Table 14 & Table 15: 고객 및 심사팀 확인 서명 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600 font-bold px-1">
                    <span>※ 보고서 확인</span>
                    <span>※ ISO 45001만 해당</span>
                  </div>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고객 확인</th>
                        <td className="p-2 border-r border-slate-400 font-bold">{company.ceoName || '박한성'}</td>
                        <td className="w-36 p-1 border-r border-slate-400">
                          {renderSignatureCell('s2_cust', '고객 확인 (서명)', '고객확인', company.ceoName || '박한성', '대표이사', company.contactEmail)}
                        </td>
                        <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">근로자 대표</th>
                        <td className="p-2 border-r border-slate-400 font-bold">최진우 (직장)</td>
                        <td className="w-36 p-1">
                          {renderSignatureCell('s2_work', '근로자대표 (서명)', '근로자대표', '최진우', '근로자대표', 'worker@k1metal.co.kr')}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀장</th>
                        <td className="p-2 border-r border-slate-400 font-bold">{auditor?.name || '남경호'}</td>
                        <td className="p-1 border-r border-slate-400">
                          {renderSignatureCell('s2_lead', '심사팀장 (서명)', '심사팀장', auditor?.name || '남경호', auditor?.grade || '선임심사원', auditor?.email)}
                        </td>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 팀원</th>
                        <td className="p-2 border-r border-slate-400 font-bold">신현섭</td>
                        <td className="p-1">
                          {renderSignatureCell('s2_team1', '심사팀원 (서명)', '심사팀원', '신현섭', '심사원', 'auditor2@gmscs.co.kr')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ◆ 2단계 심사의 목적 */}
                <div className="border border-slate-300 bg-slate-50 p-3 space-y-1.5 text-[11px] leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900 block text-xs">◆ 2단계 심사의 목적</span>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>해당 경영시스템 표준 또는 기타 기준문서의 모든 요구사항에 대한 적합성에 관한 정보 및 증거 확인</li>
                    <li>주요 성과 목표 및 세부목표 대비 성과의 모니터링, 측정, 보고 및 검토</li>
                    <li>적용 가능한 법적, 규제적, 계약적 요구사항을 충족시키는 것과 관련된 조직의 경영시스템 능력과 성과</li>
                    <li>프로세스의 운영 관리, 내부심사 및 경영검토, 클라이언트의 방침에 대한 경영책임</li>
                    <li>내부심사 및 경영검토, 이전 심사 부적합에 대해 취해진 조치에 대한 검토, 불만의 처리, 조직의 목표달성 효과성</li>
                    <li>경영시스템 전반의 지속적인 적합성 및 효과성 확인, 인증범위에 대한 지속적 관련성 확인</li>
                    <li>심사는 샘플링 방식으로 진행되며, 심사팀에 의해 발견되지 못한 부적합 사항이 있을 수 있습니다.</li>
                  </ol>
                </div>

                {/* ◆ 고객현황 (Table 18) */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-950 text-xs">◆ 고객현황</h3>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <th className="w-24 bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">고 객 명</th>
                        <td className="p-1.5 border-r border-slate-400 font-bold">{company.companyName}</td>
                        <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">대표자</th>
                        <td className="p-1.5 border-r border-slate-400">{company.ceoName || '박한성'}</td>
                        <th className="w-20 bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">인증번호</th>
                        <td className="p-1.5 font-mono">GMS-2609-08</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">주사업장 주소</th>
                        <td colSpan={5} className="p-1.5">{company.address || '경기도 화성시 향남읍 발안공단로 45'}</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">TEL</th>
                        <td className="p-1.5 border-r border-slate-400">{company.contactPhone || '031-353-8890'}</td>
                        <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">FAX</th>
                        <td className="p-1.5 border-r border-slate-400">031-353-8891</td>
                        <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">E-mail</th>
                        <td className="p-1.5 font-mono">{company.contactEmail || 'ceo@k1metal.co.kr'}</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">담당자명</th>
                        <td className="p-1.5 border-r border-slate-400">김철수</td>
                        <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">직위</th>
                        <td colSpan={3} className="p-1.5">품질관리팀장 (부장)</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">심사일자</th>
                        <td colSpan={3} className="p-1.5 font-mono">
                          시작일: 2026-09-10 ~ 종료일: 2026-09-11
                        </td>
                        <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">심사일수</th>
                        <td className="p-1.5 font-bold">2.0 M/D</td>
                      </tr>
                      <tr>
                        <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">인증범위</th>
                        <td colSpan={5} className="p-1.5 font-semibold text-slate-800">
                          {company.scope || company.industry || '정밀 주조 및 자동차용 기계부품의 가공 및 조립'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* PROCESS Audit NOTE (Table 21) - 심사원 상세 심사 확인 사항 기록용 실물 종이 서식 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-1">
                    <h3 className="text-base font-black tracking-tight text-slate-950 font-serif">
                      PROCESS Audit NOTE (현장 심사 세부 기록)
                    </h3>
                    <span className="text-[11px] text-slate-600">
                      ► 객관적인 증거를 확인하여 심사원별 작성 (실행기록, 실행일자, 담당자명 등)
                    </span>
                  </div>

                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-700">
                        <th className="w-32 p-2 border-r border-slate-400 text-center font-bold">요구사항</th>
                        <th className="p-2 text-center font-bold">심사 확인 사항 (객관적 증거, 실행일자, 인터뷰, 샘플 확인 내역)</th>
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
                              placeholder="현장 심사 확인 사항 및 객관적 증거를 상세히 기술..."
                              className="w-full border border-slate-300 rounded p-2 text-xs leading-relaxed focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-y"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 심사 발견사항 요약 (Table 23) */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-950 text-xs">심사 발견사항 요약</h3>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <th className="w-32 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">
                          부적합사항 요약
                        </th>
                        <td className="p-1.5">
                          <textarea
                            rows={2}
                            value={stage2Data.ncrSummaryText}
                            onChange={(e) => setStage2Data({ ...stage2Data, ncrSummaryText: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">
                          관찰 및 권고사항 요약
                        </th>
                        <td className="p-1.5">
                          <textarea
                            rows={2}
                            value={stage2Data.obsSummaryText}
                            onChange={(e) => setStage2Data({ ...stage2Data, obsSummaryText: e.target.value })}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 심사 발견사항 집계 및 총평 / 결론 (Table 24) */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-950 text-xs">심사 발견사항 및 결론</h3>
                  
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-400 bg-slate-50">
                        <th className="w-32 p-2 border-r border-slate-400 text-center font-bold">심사 발견사항</th>
                        <td className="p-2 space-x-6 font-bold text-slate-900">
                          <span>경부적합: <input type="text" value={stage2Data.countMinor} onChange={(e) => setStage2Data({...stage2Data, countMinor: e.target.value})} className="w-8 border border-slate-300 rounded text-center p-0.5" /> 건</span>
                          <span>중부적합: <input type="text" value={stage2Data.countMajor} onChange={(e) => setStage2Data({...stage2Data, countMajor: e.target.value})} className="w-8 border border-slate-300 rounded text-center p-0.5" /> 건</span>
                          <span>관찰사항: <input type="text" value={stage2Data.countObs} onChange={(e) => setStage2Data({...stage2Data, countObs: e.target.value})} className="w-8 border border-slate-300 rounded text-center p-0.5" /> 건</span>
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
                        <td className="p-2 space-y-1.5">
                          <label className="flex items-center gap-2 cursor-pointer font-medium">
                            <input
                              type="radio"
                              name="s2_conclusion"
                              value="1"
                              checked={stage2Data.conclusionChoice === '1'}
                              onChange={(e) => setStage2Data({ ...stage2Data, conclusionChoice: e.target.value })}
                              className="text-teal-700"
                            />
                            <span>어떠한 부적합이 발견되지 않았으므로 인증추천 또는 인증유지를 추천합니다.</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-medium">
                            <input
                              type="radio"
                              name="s2_conclusion"
                              value="2"
                              checked={stage2Data.conclusionChoice === '2'}
                              onChange={(e) => setStage2Data({ ...stage2Data, conclusionChoice: e.target.value })}
                              className="text-teal-700"
                            />
                            <span>경부적합이 발견되어 시정조치 후 인증추천 또는 인증유지를 추천합니다.</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-medium text-rose-800">
                            <input
                              type="radio"
                              name="s2_conclusion"
                              value="3"
                              checked={stage2Data.conclusionChoice === '3'}
                              onChange={(e) => setStage2Data({ ...stage2Data, conclusionChoice: e.target.value })}
                              className="text-teal-700"
                            />
                            <span>중부적합이 발견되어 시정조치 후 재심사를 진행하여야 합니다.</span>
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 5. 차기심사 안내 (Table 27) */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-950 text-xs">5. 차기심사 안내</h3>
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
                          사후 1차 (정기사후)
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
                  <p className="text-[10.5px] text-slate-500 italic">
                    ※ IAF 평가 지침에 따라 사후심사가 진행되며, 심사가 기한 내 진행되지 않을 경우 인증이 정지 또는 취소될 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: 인증서 기재사항 확인서 & 3년 계획 (Table 29 & 32) */}
            {/* ======================================================== */}
            {activeTab === 'cert_confirm' && (
              <div className="space-y-6">
                <div className="text-center py-2 border-b-2 border-slate-800 pb-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 font-serif">
                    인증서 기재사항 확인서 (Table 29)
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    인증서에 국문 및 영문으로 정식 표기될 고객명, 사업장 주소 및 인증범위 최종 확인용 서식
                  </p>
                </div>

                <table className="w-full border-collapse border border-slate-700 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <th className="w-28 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">인증번호</th>
                      <td colSpan={2} className="p-2 font-mono">GMS-2609-08</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold" rowSpan={2}>고 객 명</th>
                      <td className="w-16 bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">KOR</td>
                      <td className="p-1.5 font-bold text-slate-900">{company.companyName}</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">ENG</td>
                      <td className="p-1.5 font-sans">K1 METAL CO., LTD.</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold" rowSpan={2}>사업장 주소</th>
                      <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">KOR</td>
                      <td className="p-1.5">{company.address || '경기도 화성시 향남읍 발안공단로 45'}</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">ENG</td>
                      <td className="p-1.5 font-sans">45, Balangongdan-ro, Hyangnam-eup, Hwaseong-si, Gyeonggi-do, Korea</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold" rowSpan={2}>인증범위</th>
                      <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">KOR</td>
                      <td className="p-1.5 font-bold">{company.scope || company.industry || '정밀 주조 및 자동차용 기계부품의 가공 및 조립'}</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="bg-slate-50 p-1.5 border-r border-slate-400 text-center font-bold">ENG</td>
                      <td className="p-1.5 font-sans">Precision casting and machining/assembly of mechanical parts for automobiles</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">동일성 확인</th>
                      <td colSpan={2} className="p-2 space-x-6">
                        <label className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                          <input type="radio" name="cert_match" defaultChecked className="text-teal-700" />
                          <span>1단계 심사 시 확인된 내용과 동일함</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-slate-700">
                          <input type="radio" name="cert_match" className="text-teal-700" />
                          <span>1단계 심사 시 확인된 내용과 상이함</span>
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">심사 확인 서명</th>
                      <td colSpan={2} className="p-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-slate-300 p-2 rounded">
                            <span className="font-bold text-slate-700 block mb-1">고객 확인 (대표자)</span>
                            {renderSignatureCell('cert_cust', '고객 확인 (서명)', '고객확인', company.ceoName || '박한성', '대표이사', company.contactEmail)}
                          </div>
                          <div className="border border-slate-300 p-2 rounded">
                            <span className="font-bold text-slate-700 block mb-1">심사 팀장</span>
                            {renderSignatureCell('cert_lead', '심사팀장 (서명)', '심사팀장', auditor?.name || '남경호', auditor?.grade || '선임심사원', auditor?.email)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: 부적합 보고서 (NCR - Table 33) */}
            {/* ======================================================== */}
            {activeTab === 'ncr' && (
              <div className="space-y-6">
                <div className="text-center py-2 border-b-2 border-slate-800 pb-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 font-serif">
                    부적합 보고서 (Non-Conformity Report)
                  </h1>
                  <span className="text-xs font-mono text-slate-500">Form No: GMSCS-F18-002 (Rev.0)</span>
                </div>

                <table className="w-full border-collapse border border-slate-700 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">고 객 명</th>
                      <td className="p-2 border-r border-slate-400 font-bold">{company.companyName}</td>
                      <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">부적합 번호</th>
                      <td className="p-2 font-mono font-bold text-rose-800">NCR-2026-09-01</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">적용표준</th>
                      <td className="p-2 border-r border-slate-400">ISO 9001:2015</td>
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">표준조항</th>
                      <td className="p-2 font-mono">7.1.5 (측정 자원 관리)</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">부적합등급</th>
                      <td colSpan={3} className="p-2 space-x-6">
                        <label className="inline-flex items-center gap-1 font-bold text-amber-800">
                          <input type="radio" name="ncr_grade" defaultChecked className="text-teal-700" />
                          <span>경부적합 (발행일로부터 1개월 이내 시정조치)</span>
                        </label>
                        <label className="inline-flex items-center gap-1 font-bold text-rose-800">
                          <input type="radio" name="ncr_grade" className="text-teal-700" />
                          <span>중부적합 (발행일로부터 3개월 이내 시정조치 및 재심사)</span>
                        </label>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">부적합사항 내용</th>
                      <td colSpan={3} className="p-2">
                        <textarea
                          rows={3}
                          defaultValue="가공 2공장 버니어캘리퍼스 1종의 교정주기 라벨이 마모되어 식별이 불가하며, 점검 대장에 일부 점검일자가 누락됨."
                          className="w-full border border-slate-300 rounded p-1.5 text-xs"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400 bg-slate-50">
                      <th className="p-2 border-r border-slate-400 text-left font-bold">발행 심사원</th>
                      <td className="p-2 border-r border-slate-400">
                        {renderSignatureCell('ncr_auditor', '심사원 (서명)', '심사팀장', auditor?.name || '남경호', '선임심사원', auditor?.email)}
                      </td>
                      <th className="p-2 border-r border-slate-400 text-left font-bold">고객 확인</th>
                      <td className="p-2">
                        {renderSignatureCell('ncr_cust_ack', '고객 확인 (서명)', '고객확인', company.ceoName || '박한성', '대표이사', company.contactEmail)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">원인분석 (4M)</th>
                      <td colSpan={3} className="p-2">
                        <textarea
                          rows={2}
                          defaultValue="[Man/Method]: 작업자 라벨 취급 부주의 및 월간 교정 대장 정기 대조 절차 미흡."
                          className="w-full border border-slate-300 rounded p-1.5 text-xs"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-left font-bold">재발방지대책</th>
                      <td colSpan={3} className="p-2">
                        <textarea
                          rows={2}
                          defaultValue="전 계측기 라벨 보호 비닐 코팅 부착 및 매월 1일 품질관리자 교정상태 전수 점검 의무화."
                          className="w-full border border-slate-300 rounded p-1.5 text-xs"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: 시작/종결 회의록 & 이해관계유무 확인서 (Table 16/17) */}
            {/* ======================================================== */}
            {activeTab === 'meeting_conflict' && (
              <div className="space-y-6">
                <div className="text-center py-2 border-b-2 border-slate-800 pb-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 font-serif">
                    시작/종결 회의 안건 및 이해관계 확인서
                  </h1>
                  <span className="text-xs font-mono text-slate-500">Table 16 & Table 17</span>
                </div>

                {/* 시작/종결회의 안건 (Table 16) */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-950 text-xs">시작/종결회의 안건 (Table 16)</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="border border-slate-400 p-3 bg-slate-50 space-y-1">
                      <span className="font-bold text-slate-900 block border-b border-slate-300 pb-1">시작회의 안건</span>
                      <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-700">
                        <li>인사말 및 심사협조에 대한 감사의 말씀</li>
                        <li>참석자 소개 및 근로자대표 참석 확인</li>
                        <li>심사팀장과 팀원의 책임과 역할 안내</li>
                        <li>심사의 목적, 표준, 인증범위 확인</li>
                        <li>부적합 설명 및 샘플 심사의 한계 안내</li>
                        <li>기밀유지 및 비밀 준수 서약 확인</li>
                        <li>회사 지원사항(중식, 안내자 등) 확인</li>
                      </ol>
                    </div>
                    <div className="border border-slate-400 p-3 bg-slate-50 space-y-1">
                      <span className="font-bold text-slate-900 block border-b border-slate-300 pb-1">종결회의 안건</span>
                      <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-700">
                        <li>심사협조에 대한 감사 및 결과 요약 보고</li>
                        <li>심사의 목적, 규격, 범위 재확인</li>
                        <li>부적합 및 관찰사항 설명 및 처리기준 안내</li>
                        <li>기밀유지 및 비밀 준수 재확인</li>
                        <li>차기 사후심사 안내 및 이의제기 절차</li>
                        <li>심사 리포트 고객 서명 및 확인</li>
                        <li>최고경영자/근로자대표 말씀 및 종결</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* 이해관계유무 확인서 (Table 17) */}
                <div className="border border-slate-700 p-4 space-y-3 bg-white">
                  <div className="text-center font-bold text-sm text-slate-950 underline underline-offset-4">
                    이해관계유무 확인서
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-700 space-y-1.5">
                    <p>
                      심사팀은 상기 업무를 수행함에 있어 인증원의 공정성 및 신뢰성에 위배되지 않도록 다음 사항을 준수하였으며, 만약 해당사항을 위반했을 경우 심사원 상벌규정에 따라 어떠한 처벌도 감수할 것을 확인합니다.
                    </p>
                    <ul className="list-disc list-inside pl-2 space-y-0.5 text-[10.5px]">
                      <li>본인은 상기 조직에 대하여 어떠한 컨설팅이나 자문행위를 제공하지 않았음을 확인합니다.</li>
                      <li>최근 2년 내 재직 또는 주식 3% 이상 소유 사실이 없습니다.</li>
                      <li>경영진과의 혈연, 지연 등 심사에 영향을 줄 수 있는 이해관계가 없습니다.</li>
                      <li>업무 수행 중 금품, 향응 또는 편의를 수수하지 않으며 공평성보장 절차(GSP-02)를 준수합니다.</li>
                    </ul>
                  </div>

                  <div className="border-t border-slate-300 pt-3 flex justify-end items-center gap-6">
                    <span className="text-xs text-slate-600">작성일자: 2026년 09월 10일</span>
                    <div className="w-48">
                      {renderSignatureCell('conflict_lead', '심사팀장 공평성 서약 (서명)', '심사팀장', auditor?.name || '남경호', '선임심사원', auditor?.email)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 6: 심사 증빙 서류 첨부 관리 */}
            {/* ======================================================== */}
            {activeTab === 'proof_upload' && (
              <div className="space-y-4">
                <div className="border-b-2 border-slate-800 pb-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 font-serif">
                    심사 증빙 서류 첨부 및 아카이브
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    인증 심사 보고서의 증빙을 위한 필수 제출 서류 6종 관리
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
