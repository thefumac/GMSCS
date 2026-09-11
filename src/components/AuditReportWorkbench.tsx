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
  Search
} from 'lucide-react';
import type { Company, Auditor, AuditReport, AuditContractRecord, ProofDocument } from '../types';

// ============================================================
// GMSCS 심사보고서 시스템 (심사관리 F16 표준 종이 파일 철 디자인 및 구조 100% 동일 적용)
// 좌측 인터랙티브 입력 패널 + 우측 종이 파일 철 탭 & A4 실물 종이 캔버스
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

type DocTabKey = 'stage1' | 'stage2' | 'cert_confirm' | 'ncr' | 'meeting_conflict' | 'proof_upload';

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
  auditors = [],
  onClose,
  onSave
}) => {
  // [A] 우측 파일 철 탭 선택
  const [activeDocTab, setActiveDocTab] = useState<DocTabKey>('stage1');
  const [proofDocs, setProofDocs] = useState<ProofDocument[]>(initialProofDocs);

  // [B] 로컬 스토리지 키
  const storageKey = useMemo(() => `GMSCS_REPORT_PACK_${company.id || company.companyName}`, [company]);

  // [C] 심사 구분 선택 State (최초, 갱신, 사후관리, 전환, 규격추가, 재심사)
  const [auditTypeCategory, setAuditTypeCategory] = useState<'최초' | '갱신' | '사후' | '전환' | '규격추가' | '재심사'>(() => {
    const t = contract?.contractType || '사후';
    if (t.includes('최초')) return '최초';
    if (t.includes('갱신') || t.includes('재인')) return '갱신';
    if (t.includes('전환')) return '전환';
    if (t.includes('규격')) return '규격추가';
    return '사후';
  });

  const [hasCertChange, setHasCertChange] = useState<boolean>(false);

  // [D] 전자메일 서명 상태
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

  // [E] 1단계 심사 데이터 State
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

  // [F] 2단계 심사 데이터 State
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
      // PROCESS Audit NOTE
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
      conclusionChoice: '1',
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
    alert('[심사보고서 전산 저장 완료]\n2025 Audit Report Pack의 모든 작성 데이터와 전자 서명이 시스템에 안전하게 저장되었습니다.');
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

  // 서명 초기화
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

  // 탭 목록 정의 (심사관리 F16 스타일 폴더 탭)
  const tabConfigs = [
    {
      id: 'stage1' as DocTabKey,
      label: '1단계 심사보고서',
      sub: '(1st Stage)',
      icon: FileText,
      activeColor: 'bg-white border-t-teal-700 text-teal-950'
    },
    {
      id: 'stage2' as DocTabKey,
      label: '2단계 심사보고서',
      sub: '(2nd Stage)',
      icon: ClipboardList,
      activeColor: 'bg-white border-t-teal-700 text-teal-950'
    },
    {
      id: 'cert_confirm' as DocTabKey,
      label: '인증서 기재확인서',
      sub: '(Table 29 & 3년계획)',
      icon: Award,
      activeColor: 'bg-white border-t-cyan-700 text-cyan-950'
    },
    {
      id: 'ncr' as DocTabKey,
      label: '부적합보고서',
      sub: '(NCR Table 33)',
      icon: AlertTriangle,
      activeColor: 'bg-white border-t-rose-700 text-rose-950'
    },
    {
      id: 'meeting_conflict' as DocTabKey,
      label: '회의록 & 이해관계서',
      sub: '(Table 16/17)',
      icon: Shield,
      activeColor: 'bg-white border-t-purple-700 text-purple-950'
    },
    {
      id: 'proof_upload' as DocTabKey,
      label: '심사 증빙 서류',
      sub: '(첨부 6종)',
      icon: Upload,
      activeColor: 'bg-white border-t-blue-700 text-blue-950'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xs flex flex-col overflow-hidden text-slate-900">
      
      {/* 1. 최상단 헤더 바 (심사관리 F16 표준) */}
      <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between border-b border-slate-700 shrink-0">
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
              <span>GMSCS 심사보고서 작성 및 검토 관리</span>
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
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 인쇄 / PDF 출력</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>전산 저장</span>
          </button>
        </div>
      </div>

      {/* 안내 서브 헤더 띠 */}
      <div className="bg-slate-800 text-slate-300 px-5 py-1.5 text-[11px] flex justify-between items-center border-b border-slate-700 shrink-0">
        <span>좌측 입력란에 값을 지정하면 우측 공식 서식(1·2단계 보고서, NCR 등)에 실시간으로 100% 자동 획득/동기화됩니다.</span>
        <span className="text-teal-300 font-mono">GMSCS-F01-Report-Pack (251001)</span>
      </div>

      {/* 2. 메인 컨텐츠 영역 (좌측 2.8 : 우측 7.2 심사관리 완벽 동일 구조) */}
      <div className="flex-1 flex overflow-hidden bg-slate-200/80">
        
        {/* ======================================================== */}
        {/* 좌측 입력 패널 (Left Sidebar) */}
        {/* ======================================================== */}
        <div className="w-80 lg:w-96 bg-slate-50 border-r border-slate-300 p-4 space-y-4 overflow-y-auto shrink-0 text-xs">
          
          {/* 1. 심사 구분 및 접수 성격 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                <span>1. 심사 구분 및 성격</span>
              </span>
              <span className="text-[10.5px] font-bold text-teal-800">[{auditTypeCategory}]</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(['최초', '갱신', '사후', '전환', '규격추가', '재심사'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setAuditTypeCategory(cat)}
                  className={`py-1.5 px-1 text-center font-bold rounded-lg border text-xs transition-colors ${
                    auditTypeCategory === cat
                      ? 'bg-teal-800 text-white border-teal-800 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {cat === '최초' ? '최초 (신규)' : cat === '갱신' ? '갱신 (재인)' : cat === '사후' ? '사후 (1·2차)' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <span className="font-semibold text-slate-700">인증변경사항 유무:</span>
              <div className="space-x-3">
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="cert_change_toggle"
                    checked={hasCertChange}
                    onChange={() => setHasCertChange(true)}
                    className="text-teal-700"
                  />
                  <span>유</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="cert_change_toggle"
                    checked={!hasCertChange}
                    onChange={() => setHasCertChange(false)}
                    className="text-teal-700"
                  />
                  <span>무</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. 고객사 DB 정보 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                <span>2. 고객사 DB 정보</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                IAF 17
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div>
                <strong className="text-slate-800">업체명:</strong> <span className="font-bold text-slate-950">{company.companyName}</span> (대표: {company.ceoName || '박한성'})
              </div>
              <div>
                <strong className="text-slate-800">사업자번호:</strong> <span className="font-mono">{company.bizNumber || '107-88-30351'}</span>
              </div>
              <div>
                <strong className="text-slate-800">소재지:</strong> {company.address || '경기 군포시 공단로140번길 46, 206호'}
              </div>
              <div>
                <strong className="text-slate-800">담당자:</strong> {company.contactPerson || '김철수 부장'} ({company.contactPhone || '031-360-7078'})
              </div>
              <div>
                <strong className="text-slate-800">인증범위:</strong> <span className="text-slate-800 font-medium">{company.scope || company.industry || '정밀 주조 및 기계부품 가공'}</span>
              </div>
            </div>
          </div>

          {/* 3. 심사 배정 & 심사원 정보 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                <span>3. 심사 배정 & 심사팀</span>
              </span>
              <span className="text-[10.5px] font-bold text-slate-600">2.0 M/D</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-0.5">심사팀장</label>
                <input
                  type="text"
                  value={auditor?.name || '남경호'}
                  readOnly
                  className="w-full border border-slate-300 rounded p-1.5 bg-slate-50 font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-0.5">심사팀원</label>
                <input
                  type="text"
                  defaultValue="신현섭 심사원"
                  className="w-full border border-slate-300 rounded p-1.5 bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-0.5">심사 일정</label>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <input
                  type="text"
                  value={stage2Data.auditDateStart}
                  onChange={(e) => setStage2Data({ ...stage2Data, auditDateStart: e.target.value })}
                  className="border border-slate-300 rounded p-1 text-center"
                />
                <input
                  type="text"
                  value={stage2Data.auditDateEnd}
                  onChange={(e) => setStage2Data({ ...stage2Data, auditDateEnd: e.target.value })}
                  className="border border-slate-300 rounded p-1 text-center"
                />
              </div>
            </div>
          </div>

          {/* 4. 조항별 심사원 소견 빠른 제어 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                <span>4. 조항별 심사결과 집계</span>
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                ISO 4~10 완결
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                <span>1단계 문서화 정보 검토 결과:</span>
                <span className="font-bold text-emerald-800">적합 (진행가능)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                <span>2단계 현장 심사 발견사항:</span>
                <span className="font-bold text-slate-800">경부 0 / 중부 0 / 관찰 2</span>
              </div>
            </div>
          </div>

          {/* 5. 전자메일 서명 현황 카드 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                <span>5. 전자메일 서명 상태</span>
              </span>
              <span className="text-[10px] font-bold text-teal-800">
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
        <div className="flex-1 flex flex-col min-w-0 bg-slate-300/60 overflow-hidden">
          
          {/* 종이 파일 철 인덱스 탭 헤더 바 (심사관리 동일) */}
          <div className="bg-slate-200/90 px-4 pt-3 border-b border-slate-300 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-700 inline-block"></span>
              <span>종이 파일 철 공식 서식 시스템</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-slate-600 font-normal text-[11px]">
                심사구분: <strong className="text-slate-900">{stage1Data.auditType} ({stage1Data.auditStandards})</strong>
              </span>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1 rounded bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>A4 인쇄 / PDF 출력</span>
            </button>
          </div>

          {/* 실물 종이 파일 철 인덱스 탭 목록 */}
          <div className="flex border-b border-slate-300 bg-slate-200/90 overflow-x-auto shrink-0 px-2 pt-1 gap-1">
            {tabConfigs.map(tab => {
              const isActive = activeDocTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDocTab(tab.id)}
                  className={`flex-1 min-w-[130px] py-2 px-2 text-center flex flex-col items-center justify-center rounded-t-lg border-t-2 border-r border-l transition-all select-none relative ${
                    isActive
                      ? `${tab.activeColor} border-slate-400 font-bold shadow-xs -bottom-[1px] z-10`
                      : 'bg-slate-100 hover:bg-white/80 text-slate-700 border-t-transparent border-slate-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate max-w-full justify-center">
                    <tab.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                    <span className="truncate text-xs tracking-tight">{tab.label}</span>
                  </div>
                  <span className={`text-[10px] truncate max-w-full font-normal ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                    {tab.sub}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 실물 A4 종이 캔버스 영역 (스크롤 가능, 백색 종이 시트 렌더링) */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto flex justify-center bg-slate-200/60">
            <div className="w-full max-w-[850px] space-y-10">

              {/* ================================================================= */}
              {/* 1. 1단계 적합성 평가 심사보고서 (표지 + 본문 Sheet) */}
              {/* ================================================================= */}
              {activeDocTab === 'stage1' && (
                <div className="space-y-10">
                  {/* [1단계 표지 Sheet] */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 min-h-[1100px] space-y-6 relative">
                    <div className="flex justify-between items-start border-b-2 border-slate-800 pb-2">
                      <span className="text-base font-black tracking-wider text-slate-800 font-serif">ESG with GMSCS</span>
                      <span className="text-base font-black tracking-wider text-slate-800 font-serif">ISO Audit Report</span>
                    </div>

                    <div className="text-center py-6">
                      <h1 className="text-3xl font-black tracking-tight text-slate-950 font-serif">
                        적합성 평가 심사보고서(1st Stage)
                      </h1>
                    </div>

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
                            <label className="inline-flex items-center gap-1.5"><input type="checkbox" /><span>기타( )</span></label>
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-2.5 border-r border-slate-400 text-center font-bold">심 사 유 형</th>
                          <td className="p-2.5 space-x-5 text-xs font-medium">
                            <label className="inline-flex items-center gap-1.5"><input type="radio" name="s1_tab_type" defaultChecked /><span>최초</span></label>
                            <label className="inline-flex items-center gap-1.5"><input type="radio" name="s1_tab_type" /><span>사후 ( )</span></label>
                            <label className="inline-flex items-center gap-1.5"><input type="radio" name="s1_tab_type" /><span>갱신</span></label>
                            <label className="inline-flex items-center gap-1.5"><input type="radio" name="s1_tab_type" /><span>전환</span></label>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="border border-slate-400 bg-slate-50 p-4 space-y-2 text-[11px] leading-relaxed text-slate-700">
                      <span className="font-bold text-slate-950 block text-xs">◆ 1단계 심사의 목적</span>
                      <ol className="list-decimal list-inside space-y-1.5 pl-1">
                        <li>경영시스템을 문서화한 정보 검토</li>
                        <li>조직의 위치 및 사업장별 상태를 평가하고, 2단계 심사를 위한 준비상태를 결정하기 위하여 조직의 인원들과 논의</li>
                        <li>표준 요구사항, 특히 경영시스템의 주요성과 또는 중대한 측면의 파악, 프로세스, 목표 및 운영과 관련된 조직의 상태 및 이해 정도를 검토</li>
                        <li>
                          다음을 포함하여 경영시스템의 인증범위와 관련된 필수 정보 획득
                          <ul className="list-disc list-inside pl-4 text-slate-600 mt-0.5 space-y-0.5">
                            <li>사업장(들), 사용된 프로세스 및 장비, 수립된 관리 수준(특히 복수사업장을 보유한 경우), 적용가능한 법적·규제적 요구사항</li>
                          </ul>
                        </li>
                        <li>2단계 심사를 위한 자원의 배정에 대해 검토하고 2단계 심사의 세부사항에 대하여 조직과 합의</li>
                        <li>중대한 측면과 관련하여 조직의 경영시스템 및 사업장 운영에 대하여 충분히 이해함으로써 2단계 심사계획을 위한 중점사항 제공</li>
                        <li>
                          내부심사와 경영검토를 계획 및 수행하고 있는지의 여부를 평가하고, 인증고객이 2단계 심사를 받을 준비가 되었음을 경영시스템의 실행 수준이 입증하고 있는지를 평가
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-1 pt-2">
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
                            <td className="p-1 border-r border-slate-400">
                              {renderSignatureCell('s1_team2', '심사팀원 (서명)', '심사팀원', '', '심사원', '')}
                            </td>
                            <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">기 타</th>
                            <td className="p-2 border-r border-slate-400 text-slate-400">-</td>
                            <td className="p-1">
                              {renderSignatureCell('s1_other', '기타 참관 (서명)', '확인심사원', '', '', '')}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                      - 1 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>

                  {/* [1단계 본문 Sheet] */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 min-h-[1100px] space-y-6 relative">
                    <div className="flex justify-between items-start border-b border-slate-400 pb-1.5">
                      <span className="text-xs font-bold text-slate-600 font-serif">ESG with GMSCS</span>
                      <span className="text-xs font-bold text-slate-600 font-serif">ISO Audit Report (1st Stage 본문)</span>
                    </div>

                    {/* I. 고객 현황 */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-slate-950 text-xs">I. 고객 현황</h3>
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

                    {/* Ⅲ. 1단계 공통 심사 내역 */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-slate-950 text-xs">Ⅲ. 1단계 심사 공통 내역</h3>
                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-700">
                            <th colSpan={3} className="p-2 text-center font-black tracking-wider text-slate-900 border-r border-slate-400">
                              ◆ 공 통 심 사 내 역 ◆
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">1</td>
                            <td className="p-2 border-r border-slate-400 font-medium">
                              신청서와 설문서 상의 차이가 있는가? (사업장 위치, 조직 현황 등)
                            </td>
                            <td className="w-36 p-2 text-center font-bold text-teal-900">
                              {stage1Data.diffFromApp}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400">
                            <td className="w-8 p-2 text-center font-bold bg-slate-50 border-r border-slate-400">2</td>
                            <td className="p-2 border-r border-slate-400">
                              경영시스템 적용범위 및 제외조항: <strong>{stage1Data.scopeConfirmed}</strong> (제외: {stage1Data.exclusionClause})
                            </td>
                            <td className="p-2 text-center font-bold text-emerald-700">확인완료</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Ⅶ. 문서화된 정보 확인 (심사원 실기록란) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-950 text-xs">Ⅶ. 문서화된 정보 확인 (요구사항별 심사원 기록)</h3>
                        <span className="text-[10.5px] text-slate-500">※ 심사원 검토 내용 직접 작성</span>
                      </div>

                      <table className="w-full border-collapse border border-slate-700 text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-700">
                            <th className="w-28 p-2 border-r border-slate-400 text-center font-bold">요구사항</th>
                            <th className="p-2 border-r border-slate-400 text-center font-bold">문서화된 정보 확인 사항 (심사원의 심사 내용 기록)</th>
                            <th className="w-24 p-2 border-r border-slate-400 text-center font-bold">심사결과</th>
                            <th className="w-36 p-2 text-center font-bold">확인 내역</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stage1Data.clauseNotes.map((item: { clause: string; notes: string; result: string; findings: string }, idx: number) => (
                            <tr key={idx} className="border-b border-slate-400 hover:bg-slate-50/50">
                              <td className="p-2 font-bold text-slate-900 border-r border-slate-400 align-top bg-slate-50">
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
                                  className="w-full border border-slate-300 rounded p-1.5 text-xs leading-relaxed focus:ring-1 focus:ring-teal-500 resize-y"
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
                                  className="w-full border rounded p-1 text-xs font-bold border-emerald-300 text-emerald-800 bg-emerald-50"
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
                                  placeholder="특이사항..."
                                  className="w-full border border-slate-300 rounded p-1 text-xs"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Ⅷ. 1단계 심사 결론 */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-slate-950 text-xs">Ⅷ. 1단계 심사 결론</h3>
                      <div className="border border-slate-700 p-3 bg-slate-50 space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-950">
                          <input type="radio" name="s1_concl" checked={stage1Data.conclusion === 'pass'} onChange={() => setStage1Data({...stage1Data, conclusion: 'pass'})} className="text-teal-700" />
                          <span>부적합이 발견되지 않아 2단계 심사로 진행 가능합니다.</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                          <input type="radio" name="s1_concl" checked={stage1Data.conclusion === 'corrective'} onChange={() => setStage1Data({...stage1Data, conclusion: 'corrective'})} className="text-teal-700" />
                          <span>부적합이 발견되어 시정조치 완료 후 2단계 심사로 진행 가능합니다.</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                      - 2 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 2. 2단계 현장 심사보고서 (표지 + 본문 Sheet) */}
              {/* ================================================================= */}
              {activeDocTab === 'stage2' && (
                <div className="space-y-10">
                  {/* [2단계 표지 Sheet] */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 min-h-[1100px] space-y-6 relative">
                    <div className="flex justify-between items-start border-b-2 border-slate-800 pb-2">
                      <span className="text-base font-black tracking-wider text-slate-800 font-serif">ESG with GMSCS</span>
                      <span className="text-base font-black tracking-wider text-slate-800 font-serif">ISO Audit Report</span>
                    </div>

                    <div className="text-center py-6">
                      <h1 className="text-3xl font-black tracking-tight text-slate-950 font-serif">
                        적합성 평가 심사보고서(2nd Stage)
                      </h1>
                    </div>

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
                            <label className="inline-flex items-center gap-1.5"><input type="radio" name="s2_tab_type" defaultChecked /><span>최초</span></label>
                            <label className="inline-flex items-center gap-1.5"><input type="radio" name="s2_tab_type" /><span>사후 ( )</span></label>
                            <label className="inline-flex items-center gap-1.5"><input type="radio" name="s2_tab_type" /><span>갱신</span></label>
                          </td>
                        </tr>
                      </tbody>
                    </table>

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

                    <div className="space-y-1 pt-2">
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
                      - 1 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>

                  {/* [2단계 본문 Sheet] */}
                  <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 min-h-[1100px] space-y-6 relative">
                    <div className="flex justify-between items-start border-b border-slate-400 pb-1.5">
                      <span className="text-xs font-bold text-slate-600 font-serif">ESG with GMSCS</span>
                      <span className="text-xs font-bold text-slate-600 font-serif">ISO Audit Report (2nd Stage 본문)</span>
                    </div>

                    {/* 고객현황 */}
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
                          <tr>
                            <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">심사일자</th>
                            <td colSpan={3} className="p-1.5 font-mono">
                              시작일: 2026-09-10 ~ 종료일: 2026-09-11
                            </td>
                            <th className="bg-slate-100 p-1.5 border-r border-slate-400 text-left font-bold">심사일수</th>
                            <td className="p-1.5 font-bold">2.0 M/D</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* PROCESS Audit NOTE */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center border-b border-slate-700 pb-1">
                        <h3 className="text-base font-black tracking-tight text-slate-950 font-serif">
                          PROCESS Audit NOTE (현장 심사 세부 기록)
                        </h3>
                        <span className="text-[11px] text-slate-600">
                          ► 객관적 증거 확인 기록 (실행일자, 담당자명 등)
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
                    </div>

                    {/* 발견사항 집계 및 결론 */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-slate-950 text-xs">심사 발견사항 및 결론</h3>
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
                    </div>

                    <div className="pt-4 text-center text-[10px] text-slate-400 font-serif">
                      - 2 - [지엠에스씨에스㈜ 인증원]
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 3. 인증서 기재사항 확인서 (Table 29) */}
              {/* ================================================================= */}
              {activeDocTab === 'cert_confirm' && (
                <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 min-h-[1100px] space-y-6">
                  <div className="text-center py-2 border-b-2 border-slate-800 pb-2">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                      인증서 기재사항 확인서 (Table 29)
                    </h1>
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

              {/* ================================================================= */}
              {/* 4. 부적합 보고서 (NCR - Table 33) */}
              {/* ================================================================= */}
              {activeDocTab === 'ncr' && (
                <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 min-h-[1100px] space-y-6">
                  <div className="text-center py-2 border-b-2 border-slate-800 pb-2">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
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
                        <td colSpan={3} className="p-2 space-x-6 font-bold text-amber-800">
                          경부적합 (발행일로부터 1개월 이내 시정조치)
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
                    </tbody>
                  </table>
                </div>
              )}

              {/* ================================================================= */}
              {/* 5. 회의록 & 이해관계서 (Table 16/17) */}
              {/* ================================================================= */}
              {activeDocTab === 'meeting_conflict' && (
                <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 min-h-[1100px] space-y-6">
                  <div className="text-center py-2 border-b-2 border-slate-800 pb-2">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                      시작/종결 회의 안건 및 이해관계 확인서
                    </h1>
                  </div>

                  <div className="border border-slate-700 p-4 space-y-3 bg-white">
                    <div className="text-center font-bold text-sm text-slate-950 underline underline-offset-4 font-serif">
                      이해관계유무 확인서
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-700">
                      심사팀은 상기 업무를 수행함에 있어 인증원의 공정성 및 신뢰성에 위배되지 않도록 제반 규정을 준수하였으며, 어떠한 컨설팅이나 자문행위를 제공하지 않았음을 확인합니다.
                    </p>
                    <div className="border-t border-slate-300 pt-3 flex justify-end items-center gap-6">
                      <span className="text-xs text-slate-600">작성일자: 2026년 09월 10일</span>
                      <div className="w-48">
                        {renderSignatureCell('conflict_lead', '심사팀장 서약 (서명)', '심사팀장', auditor?.name || '남경호', '선임심사원', auditor?.email)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 6. 심사 증빙 서류 첨부 */}
              {/* ================================================================= */}
              {activeDocTab === 'proof_upload' && (
                <div className="w-full bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 min-h-[1100px] space-y-4">
                  <div className="border-b-2 border-slate-800 pb-2">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                      심사 증빙 서류 첨부 관리
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
