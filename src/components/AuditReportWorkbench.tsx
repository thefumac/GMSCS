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
import type { Company, Auditor, AuditReport, AuditContractRecord, ProofDocument, CompanyEhsCompliance } from '../types';
import { initialFullReportData } from '../data/mockFullRemarkPack';
import { remarkMeetingAgendas } from '../data/mockRemarkData';

// ============================================================
// 심사보고서 워크벤치 (2.5 : 7.5 분할 + 4대 인덱스 탭)
// Remark 2025 Audit Report Pack(251001).pdf / .docx 실물 양식 100% 충실 반영
// 1단계 & 2단계 심사원 세부 심사 기록, 객관적 증거, 전자메일 서명 완비
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

// 전자메일 서명 레코드
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

export interface Stage1ClauseItem {
  clause: string;
  findings: string;
  result: '적합' | '부적합' | '관찰/권고';
  note: string;
}

export interface Stage2ClauseItem {
  clause: string;
  findings: string;
  dept: string;
  result: '적합' | '경부적합' | '중부적합' | '관찰사항';
  evidence: string;
}

type ReportTabKey = 'upload' | 'stage1' | 'stage2' | 'special';

// 과거 심사보고서 목록 (DB 전체 보유분)
const mockPastReports = [
  { id: 'past-1', label: '2026-06 2차 사후관리 심사보고서 (PDF)', date: '2026-06-20', type: '사후2차' },
  { id: 'past-2', label: '2025-10 1차 사후관리 심사보고서 (PDF)', date: '2025-10-15', type: '사후1차' },
  { id: 'past-3', label: '2024-10 최초 심사보고서 (1-2단계)', date: '2024-10-24', type: '최초' },
  { id: 'past-4', label: '2024-10 전환 심사자료', date: '2024-10-20', type: '전환' },
  { id: 'past-5', label: '2023-09 타인증원 갱신심사 보고서', date: '2023-09-12', type: '갱신' },
];

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
  const [selectedPastReport, setSelectedPastReport] = useState<string>('');
  const [showPastPdfAlert, setShowPastPdfAlert] = useState(false);

  // 저장 키
  const storageKey = useMemo(() => `GMSCS_WORKBENCH_${company.id || company.companyName}`, [company]);

  // 전자메일 서명 상태 (LocalStorage 연동)
  const [signatures, setSignatures] = useState<Record<string, EmailSignatureRecord>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_SIGS`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      's1_cover_cust': {
        slotId: 's1_cover_cust',
        slotLabel: '고객 확인 (서명)',
        role: '고객확인',
        signerName: company.ceoName || '박한성',
        signerPosition: '대표이사',
        signerEmail: company.contactEmail || 'ceo@k1metal.co.kr',
        signedAt: '2026-09-08 17:30:00',
        signatureHash: 'SIG-EMAIL-89A4-F291',
        isVerified: true,
        ipAddress: '211.234.120.45'
      },
      's1_cover_lead': {
        slotId: 's1_cover_lead',
        slotLabel: '심사 팀장 (서명)',
        role: '심사팀장',
        signerName: auditor?.name || '남경호',
        signerPosition: auditor?.grade || '선임심사원',
        signerEmail: auditor?.email || 'auditor@gmscs.co.kr',
        signedAt: '2026-09-08 17:40:00',
        signatureHash: 'SIG-EMAIL-A773-EE19',
        isVerified: true,
        ipAddress: '121.134.88.92'
      }
    };
  });

  // 서명 모달 상태
  const [activeSigningSlot, setActiveSigningSlot] = useState<{
    slotId: string;
    slotLabel: string;
    role: '고객확인' | '근로자대표' | '심사팀장' | '심사팀원' | '확인심사원';
    defaultName?: string;
    defaultPosition?: string;
    defaultEmail?: string;
  } | null>(null);

  const [signingForm, setSigningForm] = useState({
    name: '',
    position: '',
    email: '',
    pinCode: '',
    isPinSent: false,
    generatedPin: '789012'
  });

  const handleSaveSignature = (record: EmailSignatureRecord) => {
    setSignatures(prev => {
      const updated = { ...prev, [record.slotId]: record };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${storageKey}_SIGS`, JSON.stringify(updated));
      }
      return updated;
    });
    setActiveSigningSlot(null);
  };

  const handleResetSignature = (slotId: string) => {
    if (confirm('해당 서명을 초기화하고 재서명 가능한 상태로 전환하시겠습니까?')) {
      setSignatures(prev => {
        const updated = { ...prev };
        delete updated[slotId];
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storageKey}_SIGS`, JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  // 1단계 요구사항별 심사 기록 (Table 9: 4~10장)
  const [stage1Clauses, setStage1Clauses] = useState<Stage1ClauseItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_STAGE1_CLAUSES`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        clause: '4. 조직상황',
        findings: '조직의 목적과 전략적 방향에 관련된 내·외부 이슈(HS-CTX-2026) 파악 및 이해관계자 요구사항 등록부(Rev.3) 검토 완료. 인증적용범위 설정의 타당성 확인됨.',
        result: '적합',
        note: '조직상황 분석 주기적 검토 확인'
      },
      {
        clause: '5. 리더십',
        findings: '최고경영자의 품질·환경 경영방침 제정 및 전 임직원 공표 확인. 업무분장 규정(HS-HR-04) 상의 리더십 및 의지표명 체계 적합.',
        result: '적합',
        note: '방침 게시 및 숙지 상태 양호'
      },
      {
        clause: '6. 기획',
        findings: '2026년 리스크 및 기회 평가표(HS-QP-02) 수립 확인. 전사 및 부서별 품질·환경 목표 수립 및 세부 달성계획 적정 수립됨.',
        result: '적합',
        note: '리스크 조치 계획 적절'
      },
      {
        clause: '7. 지원',
        findings: '인적·물적 자원 관리 절차 수립. 2026년 교육훈련 계획서 및 적격성 평가 기준 확인. 품질/환경 문서화된 정보 관리체계 양호.',
        result: '적합',
        note: '법정 의무교육 이수 확인'
      },
      {
        clause: '8. 운용',
        findings: '제품 및 서비스 요구사항 검토 절차, 생산 운영 관리 기준(SOP-PR-01~12) 및 외주업체 관리 평가 기준서 적합 수립됨.',
        result: '적합',
        note: '작업표준서 제개정 상태 양호'
      },
      {
        clause: '9. 성과평가',
        findings: '2026년 상반기 내부심사 실시(2026-05-15, 전 부서 대상) 및 경영검토 회의(2026-07-20) 실시 결과 보고서 확인.',
        result: '적합',
        note: '경영검토 후속조치 확인 완료'
      },
      {
        clause: '10. 개선',
        findings: '부적합 관리 및 시정조치 절차서(HS-QP-10) 수립. 과거 시정조치 요구건에 대한 4M 원인분석 및 유효성 검증 체계 확인.',
        result: '적합',
        note: '재발방지대책 이행 점검'
      },
      {
        clause: '11. 기타문서',
        findings: '환경 인허가(대기배출시설 설치신고) 및 안전보건 위험성평가표, 물질안전보건자료(MSDS) 최신본 비치 확인.',
        result: '적합',
        note: '법규 등록부 갱신 확인'
      }
    ];
  });

  // 2단계 요구사항별 현장 실사 기록 (Table 21 & Table 31: 4~10장)
  const [stage2Clauses, setStage2Clauses] = useState<Stage2ClauseItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}_STAGE2_CLAUSES`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        clause: '4. 조직상황',
        findings: '2026 사업계획서(HS-BP-2026) 상에 전기차 부품 전환에 따른 외부 리스크 파악 및 대응 전략 수립 확인. 이해관계자 요구사항 등록부(Rev.3) 주기적 갱신 확인됨.',
        dept: '대표이사실 / 기획팀',
        result: '적합',
        evidence: '2026 사업계획서 및 이해관계자 관리대장'
      },
      {
        clause: '5. 리더십',
        findings: '최고경영자가 품질 및 환경 방침을 제정하여 사내 로비 및 MES 로그인 화면에 게시하고 전 임직원이 숙지하고 있음을 면담을 통해 확인. 2026 업무분장 규정 확인.',
        dept: '경영총괄 / 전사',
        result: '적합',
        evidence: '품질/환경 경영방침서 및 2026 업무분장 규정'
      },
      {
        clause: '6. 기획',
        findings: '2026년도 전사 및 부서별 품질/환경 목표 달성률 94.2% 모니터링 확인. 리스크 평가표(Rev.3) 상에 기계설비 노후화 대응 조치 반영 적정함.',
        dept: '품질혁신팀 / 생산기술팀',
        result: '적합',
        evidence: '2026 목표추진실적 및 리스크 관리대장'
      },
      {
        clause: '7. 지원',
        findings: '정밀가공 라인 작업자 적격성 평가 및 사내외 교육훈련 이수표(연간 24시간) 확인. 제2공장 정밀 계측기 교정검사 대장(QC-CAL-01~12) 확인.',
        dept: '인사총무팀 / 품질관리팀',
        result: '적합',
        evidence: '교육훈련 이수대장 및 계측기 검교정 성적서'
      },
      {
        clause: '8. 운용',
        findings: '제1공장 프레스 및 제2공장 사출성형 라인의 작업표준서(SOP-PR-05) 현장 비치 및 준수 상태 확인. 초·중·종물 자주검사 체크시트 실시간 기록 확인.',
        dept: '생산팀 (1공장/2공장)',
        result: '적합',
        evidence: '작업표준서 및 현장 자주검사 체크시트'
      },
      {
        clause: '9. 성과평가',
        findings: '2026년도 상반기 내부심사(2026-05-15) 및 경영검토(2026-07-20) 실행 기록 확인. 프로세스별 핵심성과지표(KPI) 모니터링 주기적 보고 확인.',
        dept: '품질혁신팀 / 경영진',
        result: '적합',
        evidence: '내부심사 보고서 및 경영검토 회의록'
      },
      {
        clause: '10. 개선',
        findings: '고객 불만 접수 및 부적합 발생에 따른 4M 원인분석, 시정조치 및 재발방지대책 수립의 유효성 검증 완료 확인.',
        dept: '품질관리팀 / 고객지원팀',
        result: '적합',
        evidence: '시정조치 요구서(CAR) 및 개선 유효성 검증서'
      }
    ];
  });

  // 1단계 일반 정보
  const [stage1General, setStage1General] = useState({
    manualDocNo: 'QM-01',
    manualRevDate: '2026-01-10',
    manualRevNo: 'Rev.4',
    processDocNo: 'QP-01~12',
    processRevDate: '2025-11-20',
    processRevNo: 'Rev.2',
    appDiff: '없음 (일치)',
    scopeText: company.scope || company.industry || '정밀 주조 및 기계부품 가공',
    exclusionText: '8.3 설계개발 (고객도면 주문생산에 따른 정당한 제외)',
    conclusion: 'pass' as 'pass' | 'corrective' | 'fail'
  });

  // 2단계 일반 정보
  const [stage2General, setStage2General] = useState({
    summaryMajor: 0,
    summaryMinor: 0,
    summaryObs: 1,
    overallSummary: '1. 최고경영자의 품질/환경/안전 경영 추진의지가 확고함.\n2. MES 연동 공정 품질추적 체계가 매우 우수하게 운영 중임.\n3. 작업자 안전보건 교육 및 법규 준수 평가가 성실히 이행됨.',
    recommendation: '인증 유지 추천',
    nextAuditMonth: '2027-10',
    nextAuditMd: '2.0',
    nextAuditType: '사후3차'
  });

  const auditStandards = contract?.standards?.join(' & ') || 'ISO 9001:2015 & ISO 14001:2015';
  const auditType = contract?.contractType || '정기사후';

  // 서명 렌더 헬퍼
  const renderSigSlot = (
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
          className="group relative cursor-pointer inline-flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 border border-emerald-300 hover:border-emerald-500 shadow-2xs transition-all text-left min-w-[150px]"
          title="전자메일 서명 검증 완료 (클릭 시 서명 초기화)"
        >
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>[전자메일 서명완료]</span>
          </div>
          <div className="text-[11.5px] font-extrabold text-slate-900 mt-0.5">
            {signed.signerName} ({signed.signerPosition})
          </div>
          <div className="text-[9.5px] text-slate-600 font-mono mt-0.5">
            {signed.signedAt.slice(0, 16)} ({signed.signatureHash})
          </div>
          <span className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-800 backdrop-blur-2xs transition-opacity">
            클릭 시 재서명
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
          setActiveSigningSlot({
            slotId,
            slotLabel,
            role,
            defaultName,
            defaultPosition: defaultPos,
            defaultEmail
          });
        }}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-cyan-500 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-semibold cursor-pointer group"
        title="전자메일 서명 인증을 진행합니다."
      >
        <PenTool className="w-3 h-3 text-cyan-700 group-hover:scale-110 transition-transform" />
        <span>{slotLabel}</span>
        <span className="text-[9.5px] bg-cyan-200 text-cyan-900 px-1 py-0.2 rounded font-mono">이메일 인증</span>
      </button>
    );
  };

  const handleSaveAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}_STAGE1_CLAUSES`, JSON.stringify(stage1Clauses));
      localStorage.setItem(`${storageKey}_STAGE2_CLAUSES`, JSON.stringify(stage2Clauses));
      localStorage.setItem(`${storageKey}_STAGE1_GEN`, JSON.stringify(stage1General));
      localStorage.setItem(`${storageKey}_STAGE2_GEN`, JSON.stringify(stage2General));
      localStorage.setItem(`${storageKey}_SIGS`, JSON.stringify(signatures));
    }
    if (onSave) {
      onSave({ stage1Clauses, stage2Clauses, stage1General, stage2General, signatures, proofDocs });
    }
    alert(`[${company.companyName}] 2025 Audit Report Pack 심사보고서가 브라우저 및 시스템 DB에 안전하게 저장되었습니다.`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 text-slate-800 text-xs overflow-hidden animate-in fade-in">
      
      {/* ========================================================= */}
      {/* 상단 통합 툴바 */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950 px-6 py-3.5 shadow-md text-white shrink-0 border-b border-cyan-900/40">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer" title="닫기 / 이전으로">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-black flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>2025 Audit Report Pack 심사보고서 작성 및 검토</span>
              <span className="text-xs font-normal text-cyan-300">— {company.companyName}</span>
            </h2>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {auditType} · {auditStandards} · {contract?.plannedAuditStartDate || '2026-10-24'} ~ {contract?.plannedAuditEndDate || '2026-10-25'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={handleSaveAll} 
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>임시저장</span>
          </button>
          <button 
            type="button" 
            onClick={() => {
              handleSaveAll();
              alert(`[${company.companyName}] 심사보고서가 사무국으로 공식 제출되었습니다.`);
            }}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>사무국 제출</span>
          </button>
          <button 
            type="button" 
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            title="인쇄"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 메인 2.5 : 7.5 스플릿 워크벤치 레이아웃                                     */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT 2.5: 기업 메타정보 & 과거 심사보고서 & OKESG 규제현황 (독립 스크롤) */}
        <div className="w-[340px] lg:w-[380px] bg-white border-r border-slate-300 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4 shadow-sm">
          
          {/* 기업 기본 정보 카드 */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-cyan-800" />
                {company.companyName}
              </span>
              <span className="text-[10.5px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-100 text-cyan-900">
                {company.bizNumber || '107-88-30351'}
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <div><strong className="text-slate-800">대표자:</strong> {company.ceoName || '박한성'} 대표</div>
              <div><strong className="text-slate-800">총 인원:</strong> {company.totalEmployees || 48}명 (현장 가동 36명)</div>
              <div><strong className="text-slate-800">주사업장:</strong> {company.address || '경기도 화성시 향남읍 발안공단로 45'}</div>
              <div><strong className="text-slate-800">인증범위:</strong> {company.scope || company.industry || '정밀 주조 및 자동차용 기계부품 가공'}</div>
            </div>
          </div>

          {/* 과거 심사보고서 아카이브 풀다운 */}
          <div className="space-y-1.5 border-t border-slate-200 pt-3">
            <label className="font-bold text-slate-900 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-700" />
              <span>과거 심사보고서 아카이브 열람</span>
            </label>
            <select
              value={selectedPastReport}
              onChange={(e) => {
                setSelectedPastReport(e.target.value);
                if (e.target.value) setShowPastPdfAlert(true);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 cursor-pointer"
            >
              <option value="">-- 보관된 과거 보고서 ({mockPastReports.length}건) --</option>
              {mockPastReports.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>

            {showPastPdfAlert && selectedPastReport && (
              <div className="border border-cyan-300 rounded-xl bg-cyan-50 p-3 space-y-1 text-[11px] text-cyan-950 animate-in fade-in">
                <div className="flex items-center justify-between font-bold">
                  <span>📄 {mockPastReports.find(r => r.id === selectedPastReport)?.label}</span>
                  <button type="button" onClick={() => setShowPastPdfAlert(false)} className="text-cyan-700 hover:text-cyan-950 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-cyan-800">
                  구글 드라이브(<code className="text-cyan-900 font-bold">G:\내 드라이브\GMSCS_과거심사보고서</code>)에 저장된 원본 PDF와 동기화되었습니다.
                </p>
              </div>
            )}
          </div>

          {/* 증빙 서류 업로드 & 확인 현황 */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-slate-700" />
                <span>심사 필수 증빙 서류 ({proofDocs.filter(d => d.uploaded).length}/{proofDocs.length})</span>
              </label>
            </div>
            <div className="space-y-1.5">
              {proofDocs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px]">
                  <span className="font-medium text-slate-800 truncate max-w-[180px]">{doc.docType}</span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    첨부완료
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT 7.5: 2025 Audit Report Pack 본문 에디터 (독립 스크롤) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          
          {/* 상단 탭 전환 바 */}
          <div className="bg-white border-b border-slate-300 px-6 py-2 flex items-center gap-2 shrink-0">
            {[
              { key: 'stage1', label: '1단계 문서심사 보고서 (1st Stage Pack)' },
              { key: 'stage2', label: '2단계 현장심사 보고서 (2nd Stage Pack)' },
              { key: 'special', label: '특약 및 환경·안전 점검' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as ReportTabKey)}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'bg-cyan-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 탭 본문 영역 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* ========================================================================= */}
            {/* 1. [1단계 문서심사 보고서 탭] (Table 0, Table 1, Table 5, Table 9 등)          */}
            {/* ========================================================================= */}
            {activeTab === 'stage1' && (
              <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6">
                
                {/* 1단계 헤더 */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-bold text-cyan-900 font-mono">ESG with GMSCS · 1st Stage Pack</span>
                    <h3 className="text-xl font-extrabold text-slate-950">적합성 평가 심사보고서 (1st Stage)</h3>
                    <p className="text-xs text-slate-500">경영시스템 문서화 정보 검토 및 2단계 심사 준비상태 평가</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300">
                      1단계 심사 승인
                    </span>
                  </div>
                </div>

                {/* 1단계 고객 확인 및 전자메일 서명란 (Table 1, Table 2) */}
                <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-cyan-800" />
                      1단계 보고서 공식 확인 및 전자메일 서명
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">※ 클릭 시 전자메일 서명 인증이 진행됩니다</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
                      <span className="font-bold text-slate-700 block mb-1.5">고객 확인 (대표자)</span>
                      {renderSigSlot('s1_cover_cust', '고객 확인 (서명)', '고객확인', company.ceoName || '박한성', '대표이사', company.contactEmail)}
                    </div>
                    <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
                      <span className="font-bold text-slate-700 block mb-1.5">근로자 대표 (ISO 45001)</span>
                      {renderSigSlot('s1_cover_work', '근로자대표 (서명)', '근로자대표', '최진우', '근로자대표', 'worker@company.com')}
                    </div>
                    <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
                      <span className="font-bold text-slate-700 block mb-1.5">심사 팀장</span>
                      {renderSigSlot('s1_cover_lead', '심사팀장 (서명)', '심사팀장', auditor?.name || '남경호', '선임심사원', auditor?.email)}
                    </div>
                    <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
                      <span className="font-bold text-slate-700 block mb-1.5">심사 팀원</span>
                      {renderSigSlot('s1_cover_team', '심사팀원 (서명)', '심사팀원', '신현섭', '심사원', 'auditor2@gmscs.co.kr')}
                    </div>
                  </div>
                </div>

                {/* 1단계 공통 심사 점검 항목 (매뉴얼 정보, 적용제외, 법규) */}
                <div className="border border-slate-300 rounded-xl p-4 space-y-3 bg-white text-xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                    Ⅰ. 경영시스템 문서화 정보 및 기본 확인
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">매뉴얼 문서번호 / 제개정일자</label>
                      <input 
                        type="text" 
                        value={stage1General.manualDocNo} 
                        onChange={e => setStage1General({...stage1General, manualDocNo: e.target.value})}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold" 
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">절차서 문서번호</label>
                      <input 
                        type="text" 
                        value={stage1General.processDocNo} 
                        onChange={e => setStage1General({...stage1General, processDocNo: e.target.value})}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold" 
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">신청서와 차이 여부</label>
                      <input 
                        type="text" 
                        value={stage1General.appDiff} 
                        onChange={e => setStage1General({...stage1General, appDiff: e.target.value})}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-emerald-800" 
                      />
                    </div>
                  </div>
                </div>

                {/* 1단계 요구사항별 문서화 정보 확인 결과 (Table 9: No 컬럼 제거, 요구사항 4~10장 직접 명시 및 심사원의 심사 내용 입력/저장) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-800" />
                      요구사항별 문서화 정보 확인 결과 (심사원 심사 기록란)
                    </h4>
                    <span className="text-[11px] text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-medium">
                      ✎ 심사원이 확인한 문서화 내용과 검토 의견을 직접 작성합니다
                    </span>
                  </div>

                  <div className="border border-slate-400 text-xs rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                        <tr>
                          <th className="p-2.5 border-r border-slate-300 w-32 text-left">요구사항</th>
                          <th className="p-2.5 border-r border-slate-300 text-left">문서화된 정보 확인 사항 (심사원의 심사 내용 기록)</th>
                          <th className="p-2.5 border-r border-slate-300 w-28 text-center">심사결과</th>
                          <th className="p-2.5 w-44 text-left">심사확인 내역</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {stage1Clauses.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            {/* 요구사항 */}
                            <td className="p-2.5 border-r border-slate-300 font-bold text-slate-900 align-top bg-slate-50/80">
                              {c.clause}
                            </td>

                            {/* 심사원의 심사 내용 기록 공간 */}
                            <td className="p-2 border-r border-slate-300 align-top">
                              <textarea
                                value={c.findings}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStage1Clauses(prev => {
                                    const updated = [...prev];
                                    updated[idx] = { ...updated[idx], findings: val };
                                    return updated;
                                  });
                                }}
                                rows={2}
                                className="w-full p-1.5 text-xs text-slate-900 border border-transparent hover:border-slate-300 focus:border-cyan-500 rounded bg-transparent focus:bg-white focus:outline-hidden transition leading-relaxed resize-y"
                                placeholder="심사원이 확인한 문서화 정보 및 심사 내용을 기록하십시오..."
                              />
                            </td>

                            {/* 심사결과 */}
                            <td className="p-2 border-r border-slate-300 align-top text-center">
                              <select
                                value={c.result}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  setStage1Clauses(prev => {
                                    const updated = [...prev];
                                    updated[idx] = { ...updated[idx], result: val };
                                    return updated;
                                  });
                                }}
                                className={`font-bold text-xs p-1 rounded border focus:outline-hidden cursor-pointer ${
                                  c.result === '적합' ? 'text-emerald-800 bg-emerald-50 border-emerald-300' :
                                  c.result === '부적합' ? 'text-rose-800 bg-rose-50 border-rose-300' :
                                  'text-amber-800 bg-amber-50 border-amber-300'
                                }`}
                              >
                                <option value="적합">적합</option>
                                <option value="부적합">부적합</option>
                                <option value="관찰/권고">관찰/권고</option>
                              </select>
                            </td>

                            {/* 심사확인 내역 */}
                            <td className="p-2 align-top">
                              <input
                                type="text"
                                value={c.note}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStage1Clauses(prev => {
                                    const updated = [...prev];
                                    updated[idx] = { ...updated[idx], note: val };
                                    return updated;
                                  });
                                }}
                                className="w-full p-1 text-xs text-slate-700 border border-transparent hover:border-slate-300 focus:border-cyan-500 rounded bg-transparent focus:bg-white focus:outline-hidden transition"
                                placeholder="확인 메모..."
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 1단계 심사 결론 (Table 12) */}
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-950 text-xs">1단계 심사 결론 선택:</div>
                  <div className="space-y-1.5 text-xs text-emerald-900">
                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                      <input type="radio" name="s1_concl" checked={stage1General.conclusion === 'pass'} onChange={() => setStage1General({...stage1General, conclusion: 'pass'})} />
                      <span>✔ 부적합이 발견되지 않아 2단계 심사로 진행 가능합니다. (권장)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="s1_concl" checked={stage1General.conclusion === 'corrective'} onChange={() => setStage1General({...stage1General, conclusion: 'corrective'})} />
                      <span>부적합이 발견되어 시정조치 완료 후 2단계 심사로 진행 가능합니다.</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="s1_concl" checked={stage1General.conclusion === 'fail'} onChange={() => setStage1General({...stage1General, conclusion: 'fail'})} />
                      <span>중대한 부적합이 발견되어 2단계 심사로 진행이 불가능합니다.</span>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. [2단계 현장심사 보고서 탭] (시작/종결회의, 현장실사기록, 총평, 서명 완비)     */}
            {/* ========================================================================= */}
            {activeTab === 'stage2' && (
              <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6">
                
                {/* 2단계 헤더 */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-bold text-cyan-900 font-mono">ESG with GMSCS · 2nd Stage Pack</span>
                    <h3 className="text-xl font-extrabold text-slate-950">적합성 평가 심사보고서 (2nd Stage)</h3>
                    <p className="text-xs text-slate-500">현장 실사 실행 증거 검증, 프로세스 성과 모니터링 및 인증 유지 평가</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg border border-blue-300">
                      인증 유지 추천
                    </span>
                  </div>
                </div>

                {/* 2단계 고객 확인 및 전자메일 서명란 (Table 14, Table 15) */}
                <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-cyan-800" />
                      2단계 현장보고서 공식 확인 및 전자메일 서명
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">※ 클릭 시 전자메일 서명 인증이 진행됩니다</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
                      <span className="font-bold text-slate-700 block mb-1.5">고객 확인 (대표자)</span>
                      {renderSigSlot('s2_cover_cust', '고객 확인 (서명)', '고객확인', company.ceoName || '박한성', '대표이사', company.contactEmail)}
                    </div>
                    <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
                      <span className="font-bold text-slate-700 block mb-1.5">근로자 대표 (ISO 45001)</span>
                      {renderSigSlot('s2_cover_work', '근로자대표 (서명)', '근로자대표', '최진우', '근로자대표', 'worker@company.com')}
                    </div>
                    <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
                      <span className="font-bold text-slate-700 block mb-1.5">심사 팀장</span>
                      {renderSigSlot('s2_cover_lead', '심사팀장 (서명)', '심사팀장', auditor?.name || '남경호', '선임심사원', auditor?.email)}
                    </div>
                    <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
                      <span className="font-bold text-slate-700 block mb-1.5">심사 팀원</span>
                      {renderSigSlot('s2_cover_team', '심사팀원 (서명)', '심사팀원', '신현섭', '심사원', 'auditor2@gmscs.co.kr')}
                    </div>
                  </div>
                </div>

                {/* 시작회의 / 종결회의 안건 요약 (Table 16) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-1.5">
                    <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 flex justify-between">
                      <span>시작회의 안건 (13개 항목 확인)</span>
                      <span className="text-emerald-700 font-bold">확인 완료</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 text-[11px]">
                      {remarkMeetingAgendas.slice(0, 7).map(item => (
                        <li key={item.id}>{item.opening}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-1.5">
                    <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 flex justify-between">
                      <span>종결회의 안건 (11개 항목 확인)</span>
                      <span className="text-emerald-700 font-bold">합의 완료</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 text-[11px]">
                      {remarkMeetingAgendas.filter(item => item.closing && item.closing !== '-').slice(0, 7).map(item => (
                        <li key={item.id}>{item.closing}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* 2단계 요구사항별 현장 실사 확인 결과 및 심사원 현장 실사 기록란 (Table 21 & Table 31) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-blue-800" />
                      요구사항별 현장 실사 확인 결과 (심사원 현장 실사 기록란)
                    </h4>
                    <span className="text-[11px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                      ✎ 4~10장 조항별 심사원의 현장 실사 내용과 객관적 증거를 직접 작성합니다
                    </span>
                  </div>

                  <div className="border border-slate-400 text-xs rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                        <tr>
                          <th className="p-2.5 border-r border-slate-300 w-32 text-left">요구사항</th>
                          <th className="p-2.5 border-r border-slate-300 text-left">현장 심사 확인 사항 (심사원의 현장 실사 내용 기록)</th>
                          <th className="p-2.5 border-r border-slate-300 w-36 text-left">대상 프로세스/부서</th>
                          <th className="p-2.5 border-r border-slate-300 w-28 text-center">심사결과</th>
                          <th className="p-2.5 w-44 text-left">객관적 증거</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {stage2Clauses.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            {/* 요구사항 */}
                            <td className="p-2.5 border-r border-slate-300 font-bold text-slate-900 align-top bg-slate-50/80">
                              {c.clause}
                            </td>

                            {/* 심사원의 현장 실사 내용 기록 공간 */}
                            <td className="p-2 border-r border-slate-300 align-top">
                              <textarea
                                value={c.findings}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStage2Clauses(prev => {
                                    const updated = [...prev];
                                    updated[idx] = { ...updated[idx], findings: val };
                                    return updated;
                                  });
                                }}
                                rows={2}
                                className="w-full p-1.5 text-xs text-slate-900 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white focus:outline-hidden transition leading-relaxed resize-y"
                                placeholder="현장에서 면담 및 실사를 통해 확인한 객관적 사실 및 실행 기록을 기술하십시오..."
                              />
                            </td>

                            {/* 대상 프로세스/부서 */}
                            <td className="p-2 border-r border-slate-300 align-top">
                              <input
                                type="text"
                                value={c.dept}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStage2Clauses(prev => {
                                    const updated = [...prev];
                                    updated[idx] = { ...updated[idx], dept: val };
                                    return updated;
                                  });
                                }}
                                className="w-full p-1 text-xs text-slate-800 font-medium border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white focus:outline-hidden transition"
                                placeholder="대상 부서/공정..."
                              />
                            </td>

                            {/* 심사결과 */}
                            <td className="p-2 border-r border-slate-300 align-top text-center">
                              <select
                                value={c.result}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  setStage2Clauses(prev => {
                                    const updated = [...prev];
                                    updated[idx] = { ...updated[idx], result: val };
                                    return updated;
                                  });
                                }}
                                className={`font-bold text-xs p-1 rounded border focus:outline-hidden cursor-pointer ${
                                  c.result === '적합' ? 'text-emerald-800 bg-emerald-50 border-emerald-300' :
                                  c.result === '중부적합' ? 'text-rose-800 bg-rose-50 border-rose-300' :
                                  c.result === '경부적합' ? 'text-amber-800 bg-amber-50 border-amber-300' :
                                  'text-slate-800 bg-slate-50 border-slate-300'
                                }`}
                              >
                                <option value="적합">적합</option>
                                <option value="경부적합">경부적합</option>
                                <option value="중부적합">중부적합</option>
                                <option value="관찰사항">관찰사항</option>
                              </select>
                            </td>

                            {/* 객관적 증거 */}
                            <td className="p-2 align-top">
                              <input
                                type="text"
                                value={c.evidence}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStage2Clauses(prev => {
                                    const updated = [...prev];
                                    updated[idx] = { ...updated[idx], evidence: val };
                                    return updated;
                                  });
                                }}
                                className="w-full p-1 text-xs text-slate-700 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white focus:outline-hidden transition"
                                placeholder="확인된 문서번호, 설비명 등..."
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 심사 발견사항 요약 & 심사총평 (Table 24) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 text-center">
                    <span className="font-bold text-slate-600 block text-xs">중부적합</span>
                    <input 
                      type="number" 
                      value={stage2General.summaryMajor} 
                      onChange={e => setStage2General({...stage2General, summaryMajor: parseInt(e.target.value) || 0})}
                      className="w-16 mx-auto text-center font-mono font-bold text-lg border border-slate-300 rounded mt-1" 
                    />
                  </div>
                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 text-center">
                    <span className="font-bold text-slate-600 block text-xs">경부적합</span>
                    <input 
                      type="number" 
                      value={stage2General.summaryMinor} 
                      onChange={e => setStage2General({...stage2General, summaryMinor: parseInt(e.target.value) || 0})}
                      className="w-16 mx-auto text-center font-mono font-bold text-lg border border-slate-300 rounded mt-1" 
                    />
                  </div>
                  <div className="border border-amber-300 rounded-xl p-3.5 bg-amber-50 text-center">
                    <span className="font-bold text-amber-800 block text-xs">관찰사항</span>
                    <input 
                      type="number" 
                      value={stage2General.summaryObs} 
                      onChange={e => setStage2General({...stage2General, summaryObs: parseInt(e.target.value) || 0})}
                      className="w-16 mx-auto text-center font-mono font-bold text-lg border border-amber-300 rounded mt-1 text-amber-900" 
                    />
                  </div>
                </div>

                {/* 심사 총평 입력란 */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 text-xs">심사 총평 (우수한 점 및 개선 권고사항 기술):</label>
                  <textarea
                    value={stage2General.overallSummary}
                    onChange={e => setStage2General({...stage2General, overallSummary: e.target.value})}
                    rows={3}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs leading-relaxed focus:border-cyan-500 focus:outline-hidden"
                    placeholder="심사 총평을 기술하십시오..."
                  />
                </div>

                {/* 최종 심사결론 & 차기심사 안내 */}
                <div className="p-4 bg-cyan-900 text-white rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-cyan-200">FINAL RECOMMENDATION</span>
                    <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-full">
                      {stage2General.recommendation}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-cyan-300 block mb-1">차기 심사종류</span>
                      <input 
                        type="text" 
                        value={stage2General.nextAuditType} 
                        onChange={e => setStage2General({...stage2General, nextAuditType: e.target.value})}
                        className="w-full bg-cyan-950 border border-cyan-700 px-2 py-1 rounded text-white font-bold" 
                      />
                    </div>
                    <div>
                      <span className="text-cyan-300 block mb-1">차기 심사 예정월</span>
                      <input 
                        type="text" 
                        value={stage2General.nextAuditMonth} 
                        onChange={e => setStage2General({...stage2General, nextAuditMonth: e.target.value})}
                        className="w-full bg-cyan-950 border border-cyan-700 px-2 py-1 rounded text-white font-mono font-bold" 
                      />
                    </div>
                    <div>
                      <span className="text-cyan-300 block mb-1">심사일수 (MD)</span>
                      <input 
                        type="text" 
                        value={stage2General.nextAuditMd} 
                        onChange={e => setStage2General({...stage2General, nextAuditMd: e.target.value})}
                        className="w-full bg-cyan-950 border border-cyan-700 px-2 py-1 rounded text-white font-mono font-bold" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. [특약 및 환경·안전 점검 탭]                                             */}
            {/* ========================================================================= */}
            {activeTab === 'special' && (
              <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="text-lg font-bold text-slate-950">규격별 특약 점검 및 EHS 환경·안전 법규 실사</h3>
                  <p className="text-xs text-slate-500">ISO 14001, ISO 45001, ESG-MS 부속서 E 심사 점검표</p>
                </div>

                {/* ISO 14001 환경 */}
                <div className="border border-emerald-300 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-300 font-bold text-emerald-950 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-700" />
                    <span>ISO 14001:2015 환경경영시스템 특약 점검</span>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    {['환경측면 파악 및 영향 평가', '환경법규 준수 평가', '환경목표 및 세부목표', '비상사태 대비 및 대응', '폐기물/오염물질 관리'].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border-b border-slate-200">
                        <span className="font-medium text-slate-800">{item}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">적합 확인</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ISO 45001 안전보건 */}
                <div className="border border-amber-300 rounded-xl overflow-hidden">
                  <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-300 font-bold text-amber-950 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>ISO 45001:2018 안전보건경영시스템 특약 점검</span>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    {['근로자 참여 및 협의', '위험성평가 실시 및 관리', '아차사고/사고 관리 프로세스', '비상조치계획 및 훈련', '산업안전보건위원회 운영'].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border-b border-slate-200">
                        <span className="font-medium text-slate-800">{item}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">적합 확인</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 전자메일 서명 인증 인터랙티브 다이얼로그 (Email Signature Modal)              */}
      {/* ========================================================================= */}
      {activeSigningSlot && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden text-slate-900">
            <div className="bg-cyan-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-300" />
                <h4 className="font-bold text-base">전자메일 서명 인증</h4>
              </div>
              <button
                onClick={() => setActiveSigningSlot(null)}
                className="text-cyan-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-cyan-50 border border-cyan-200 p-3 rounded-xl text-cyan-950 leading-relaxed">
                <strong>[{activeSigningSlot.slotLabel}]</strong> 서명을 진행합니다.
                <br />
                기재된 이메일로 발송된 6자리 인증번호를 확인하여 전자서명을 날인합니다.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">서명자 성명</label>
                  <input
                    type="text"
                    value={signingForm.name}
                    onChange={(e) => setSigningForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="예: 홍길동"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">직위 / 역할</label>
                  <input
                    type="text"
                    value={signingForm.position}
                    onChange={(e) => setSigningForm(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="예: 대표이사, 품질팀장, 선임심사원"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">인증 전자메일 (Email)</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={signingForm.email}
                      onChange={(e) => setSigningForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="signer@company.com"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!signingForm.email) {
                          alert('이메일 주소를 입력해 주세요.');
                          return;
                        }
                        setSigningForm(prev => ({ ...prev, isPinSent: true }));
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs whitespace-nowrap cursor-pointer transition"
                    >
                      {signingForm.isPinSent ? '재발송' : '인증번호 발송'}
                    </button>
                  </div>
                </div>

                {signingForm.isPinSent && (
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800">6자리 인증 PIN 번호</label>
                      <span className="text-[10px] text-cyan-800 font-mono font-bold bg-cyan-100 px-1.5 py-0.5 rounded">
                        테스트 PIN: {signingForm.generatedPin}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={signingForm.pinCode}
                      onChange={(e) => setSigningForm(prev => ({ ...prev, pinCode: e.target.value }))}
                      placeholder="6자리 숫자 입력"
                      className="w-full px-3 py-2 border border-slate-400 rounded-lg text-center text-sm font-mono tracking-widest font-extrabold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSigningSlot(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer transition"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!signingForm.name || !signingForm.email) {
                      alert('성명과 이메일을 모두 입력해 주세요.');
                      return;
                    }
                    if (signingForm.isPinSent && signingForm.pinCode && signingForm.pinCode !== signingForm.generatedPin) {
                      alert('인증번호가 일치하지 않습니다.');
                      return;
                    }

                    const now = new Date();
                    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                    const randomHash = `SIG-EMAIL-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

                    handleSaveSignature({
                      slotId: activeSigningSlot.slotId,
                      slotLabel: activeSigningSlot.slotLabel,
                      role: activeSigningSlot.role,
                      signerName: signingForm.name,
                      signerPosition: signingForm.position || '직책 미지정',
                      signerEmail: signingForm.email,
                      signedAt: nowStr,
                      signatureHash: randomHash,
                      isVerified: true,
                      ipAddress: '211.234.120.45'
                    });
                  }}
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md shadow-cyan-700/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>전자메일 서명 확정</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
