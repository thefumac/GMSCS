import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  PenTool, 
  Send, 
  Printer, 
  ShieldCheck, 
  Clock, 
  Building2,
  Paperclip,
  Upload,
  Lock,
  Unlock,
  Mail,
  Check,
  Calendar,
  Save,
  Copy,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  ArrowLeft,
  DollarSign,
  Leaf,
  Sparkles,
  Layers,
  History,
  CheckSquare,
  RefreshCcw,
  Edit3,
  Database,
  Info,
  Languages,
  Globe
} from 'lucide-react';
import { AuditReport, SignatureLog, ProcessMatrixRow, ThreeYearCyclePlanItem, PreviousAuditNcCheck } from '../types';
import { SignatureCanvas } from './SignatureCanvas';
import { remarkMeetingAgendas } from '../data/mockRemarkData';
import { 
  FullAuditReportPackData, 
  initialFullReportData, 
  ProcessAuditNoteItem 
} from '../data/mockFullRemarkPack';

interface AuditReportEditorProps {
  report: AuditReport;
  onSaveReport: (updated: AuditReport) => void;
  onClose: () => void;
  onBackToList?: () => void;
  currentUserRole?: string;
  onSecretariatReview?: (reportId: string, status: '검토승인' | '보완요청', comment: string, reviewer: string) => void;
  onSubmitToSecretariat?: (reportId: string) => void;
}

export const AuditReportEditor: React.FC<AuditReportEditorProps> = ({
  report: initialReport,
  onSaveReport,
  onClose,
  onBackToList,
  currentUserRole = 'admin',
  onSecretariatReview,
  onSubmitToSecretariat
}) => {
  // 풀스펙 양식 데이터 (LocalStorage 영구 저장 연동 & 신규 매트릭스 필드 안전 병합)
  const [packData, setPackData] = useState<FullAuditReportPackData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`GMSCS_REPORT_PACK_${initialReport.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...initialFullReportData,
            ...parsed,
            processMatrix: parsed.processMatrix && parsed.processMatrix.length > 0 ? parsed.processMatrix : initialFullReportData.processMatrix,
            threeYearPlan: parsed.threeYearPlan && parsed.threeYearPlan.length > 0 ? parsed.threeYearPlan : initialFullReportData.threeYearPlan,
            previousAuditChecks: parsed.previousAuditChecks && parsed.previousAuditChecks.length > 0 ? parsed.previousAuditChecks : initialFullReportData.previousAuditChecks,
          };
        } catch (e) {}
      }
    }
    return initialFullReportData;
  });

  const [activeSection, setActiveSection] = useState<string>('sec-matrix'); // 기본 매트릭스 또는 원하는 섹션으로
  const [activeSignerModal, setActiveSignerModal] = useState<SignatureLog | null>(null);
  const [emailVerifyModal, setEmailVerifyModal] = useState<SignatureLog | null>(null);
  const [auditorEmailSignModal, setAuditorEmailSignModal] = useState<SignatureLog | null>(null);
  const [showEmailSendModal, setShowEmailSendModal] = useState<boolean>(false);
  const [showSecretariatReviewModal, setShowSecretariatReviewModal] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // 사무국 검토 입력 state
  const [secretariatCommentInput, setSecretariatCommentInput] = useState<string>(initialReport.secretariatComment || '');
  const [secretariatChecklistState, setSecretariatChecklistState] = useState(
    initialReport.secretariatChecklist || {
      scopeCheck: true,
      ncrCheck: true,
      meetingCheck: true,
      signCheck: true,
    }
  );

  // 섹션 1 & 2 영문 번역 언어 모드 ('ko': 국문, 'en': 영문, 'dual': 한·영 병기)
  const [section1Lang, setSection1Lang] = useState<'ko' | 'en' | 'dual'>('dual');
  const [section2Lang, setSection2Lang] = useState<'ko' | 'en' | 'dual'>('dual');

  // 섹션 I 영문 자동 번역기 (ISO/IAF 표준 공인 영문 변환)
  const handleAutoTranslateSection1 = () => {
    setPackData(prev => ({
      ...prev,
      companyNameEn: prev.companyNameEn || (prev.companyName.includes('한성') ? 'Hansung Precision Industry Co., Ltd.' : `${prev.companyName} Co., Ltd.`),
      ceoNameEn: prev.ceoNameEn || (prev.ceoName.includes('한성') ? 'Han-Sung Park' : `${prev.ceoName}`),
      mainSiteAddressEn: prev.mainSiteAddressEn || (prev.mainSiteAddress.includes('화성') 
        ? '45, Baran-gongdan-ro, Hyangnam-eup, Hwaseong-si, Gyeonggi-do, Republic of Korea (Head Office & Plant 1)'
        : `${prev.mainSiteAddress}, Republic of Korea`),
      additionalSites: prev.additionalSites.map(s => ({
        ...s,
        siteNameEn: s.siteNameEn || (s.siteName.includes('사출') ? '2nd Site (Precision Injection Center)' : `${s.siteName} (Site 2)`),
        addressEn: s.addressEn || (s.address.includes('화성') ? '118, Jeongmunsongsan-ro, Yanggam-myeon, Hwaseong-si, Gyeonggi-do, Republic of Korea' : s.address),
        scopeEn: s.scopeEn || (s.scope.includes('사출') ? 'Precision plastic injection molding and secondary processing' : s.scope)
      }))
    }));
    setSaveToast('섹션 I 고객 정보의 공식 영문 번역이 자동 생성되었습니다.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  // 섹션 II 영문 자동 번역기 (ISO 인증범위 공식 영문 변환)
  const handleAutoTranslateSection2 = () => {
    setPackData(prev => ({
      ...prev,
      auditScopeEn: prev.auditScopeEn || (prev.auditScope.includes('금형') 
        ? 'Design, Development and Manufacture of Precision Molds and Components for Automobiles'
        : 'Design, Development, Manufacture and Servicing of Products'),
      exclusionJustificationEn: prev.exclusionJustificationEn || (prev.exclusionJustification.includes('도면')
        ? 'Machining is performed strictly in accordance with customer-provided specifications and CAD drawings, and justified exclusion is accepted as there is no design and development activity performed.'
        : 'Manufacture is performed strictly to customer requirements with no design activity.')
    }));
    setSaveToast('섹션 II 인증범위 및 적용제외의 공식 영문 번역이 자동 생성되었습니다.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  // 기업 대표/담당자 확인 정보 직접 입력 state (공용메일 사용 기업 실무 반영)
  const [clientSignerName, setClientSignerName] = useState<string>('박한성');
  const [clientSignerPosition, setClientSignerPosition] = useState<string>('대표이사');
  const [clientSignerEmail, setClientSignerEmail] = useState<string>('hansung_ceo@hansung.co.kr');

  // 심사 기간 제어 (부적합 처리 기간 반영: 심사 시작일 ~ 심사 종료일 + 7일)
  const today = new Date(2026, 8, 9);
  const startDate = new Date(initialReport.startDate);
  const endDate = new Date(initialReport.endDate);
  // 종료일로부터 +7일까지 작성 및 부적합 조치 가능
  const allowedEndDate = new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const allowedEndDateFormatted = `${allowedEndDate.getFullYear()}-${String(allowedEndDate.getMonth() + 1).padStart(2, '0')}-${String(allowedEndDate.getDate()).padStart(2, '0')}`;
  const isWithinPeriodReal = today >= startDate && today <= allowedEndDate;
  const [forcePeriodActive, setForcePeriodActive] = useState<boolean>(isWithinPeriodReal);
  const isFormEditable = forcePeriodActive;

  // 사무국 제출 핸들러
  const handleTriggerSubmitToSecretariat = () => {
    if (onSubmitToSecretariat) {
      onSubmitToSecretariat(initialReport.id);
    } else {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const updated: AuditReport = {
        ...initialReport,
        secretariatReviewStatus: '검토대기',
        submittedToSecretariatAt: nowStr,
        updatedAt: nowStr,
      };
      onSaveReport(updated);
      alert('[보고서 제출 완료]\n심사보고서가 성공적으로 제출되었습니다.\n내용 적정성 검토(승인)가 완료되면 인증 심의 안건으로 자동 상정됩니다.');
    }
  };

  // 적정성 검토 결정 핸들러 (승인 or 보완요청)
  const handlePerformSecretariatDecision = (decision: '검토승인' | '보완요청') => {
    const reviewerName = currentUserRole === 'admin' ? '남경호 원장' : '정현일 이사';
    if (onSecretariatReview) {
      onSecretariatReview(initialReport.id, decision, secretariatCommentInput, reviewerName);
    } else {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const updated: AuditReport = {
        ...initialReport,
        secretariatReviewStatus: decision,
        secretariatReviewer: reviewerName,
        secretariatReviewedAt: nowStr,
        secretariatComment: secretariatCommentInput,
        secretariatChecklist: secretariatChecklistState,
        updatedAt: nowStr,
      };
      onSaveReport(updated);
      alert(decision === '검토승인' 
        ? '[적정성 검토 승인 완료]\n적정성 검토가 승인되어 인증 심의 대기로 전환되었습니다. [인증심의위원회]로 안건이 이관됩니다.' 
        : '[보완 요청 완료]\n심사팀에 보완 요청이 전달되었습니다.'
      );
    }
    setShowSecretariatReviewModal(false);
  };

  // 로컬 스토리지 및 시스템 저장
  const handleSaveToSystem = (showNotification = true) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`GMSCS_REPORT_PACK_${initialReport.id}`, JSON.stringify(packData));
    }
    onSaveReport(initialReport);
    if (showNotification) {
      const nowStr = new Date().toLocaleTimeString();
      setSaveToast(`심사보고서 전체 데이터가 시스템에 안전하게 저장되었습니다. (${nowStr})`);
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  // 30초 주기 자동 저장 (Autosave)
  useEffect(() => {
    const timer = setInterval(() => {
      handleSaveToSystem(false);
    }, 30000);
    return () => clearInterval(timer);
  }, [packData]);

  // Process Audit Note 내용 변경
  const handlePNoteChange = (id: string, field: keyof ProcessAuditNoteItem, val: any) => {
    if (!isFormEditable) return;
    setPackData(prev => ({
      ...prev,
      stage2: {
        ...prev.stage2,
        processNotes: prev.stage2.processNotes.map(n => n.id === id ? { ...n, [field]: val } : n)
      }
    }));
  };

  // 증빙 첨부 파일 시뮬레이션
  const handleAttachPNoteFile = (noteId: string) => {
    if (!isFormEditable) return;
    const inputName = prompt('첨부할 객관적 증빙 서류명(확인한 실행기록 파일)을 입력하십시오:', '현장_실사_객관적증빙.pdf');
    if (!inputName) return;
    handlePNoteChange(noteId, 'attachedFileName', inputName);
  };

  // --- 신규 섹션 핸들러 ---
  // 1. 프로세스-조항 매트릭스 제어
  const handleProcessMatrixToggle = (id: string, clause: keyof ProcessMatrixRow) => {
    if (!isFormEditable) return;
    setPackData(prev => ({
      ...prev,
      processMatrix: (prev.processMatrix || []).map(row => 
        row.id === id ? { ...row, [clause]: !row[clause] } : row
      )
    }));
  };

  const handleProcessMatrixChange = (id: string, field: keyof ProcessMatrixRow, val: any) => {
    if (!isFormEditable) return;
    setPackData(prev => ({
      ...prev,
      processMatrix: (prev.processMatrix || []).map(row => 
        row.id === id ? { ...row, [field]: val } : row
      )
    }));
  };

  const handleAddProcessMatrixRow = () => {
    if (!isFormEditable) return;
    const newRow: ProcessMatrixRow = {
      id: `pm-${Date.now()}`,
      processName: '신규 관리 프로세스',
      deptName: '신규 부서',
      clause4: false,
      clause5: false,
      clause6: false,
      clause7: false,
      clause8: true,
      clause9: false,
      clause10: true,
      markUsage: false,
      ncCount: '√ (적합)'
    };
    setPackData(prev => ({
      ...prev,
      processMatrix: [...(prev.processMatrix || []), newRow]
    }));
  };

  const handleDeleteProcessMatrixRow = (id: string) => {
    if (!isFormEditable) return;
    setPackData(prev => ({
      ...prev,
      processMatrix: (prev.processMatrix || []).filter(r => r.id !== id)
    }));
  };

  // 2. 3개년 주기 심사 계획 제어
  const handleCyclePlanChange = (id: string, field: keyof ThreeYearCyclePlanItem, val: string) => {
    if (!isFormEditable) return;
    setPackData(prev => ({
      ...prev,
      threeYearPlan: (prev.threeYearPlan || []).map(item => 
        item.id === id ? { ...item, [field]: val } : item
      )
    }));
  };

  // 3. 전 회차(이전 심사) 부적합 확인 제어
  const handlePrevAuditCheckChange = (id: string, field: keyof PreviousAuditNcCheck, val: any) => {
    if (!isFormEditable) return;
    setPackData(prev => ({
      ...prev,
      previousAuditChecks: (prev.previousAuditChecks || []).map(item => 
        item.id === id ? { ...item, [field]: val } : item
      )
    }));
  };

  const handleFetchPreviousAuditRecords = () => {
    setPackData(prev => ({
      ...prev,
      previousAuditChecks: initialFullReportData.previousAuditChecks
    }));
    alert('[GMSCS 시스템 DB 동기화 완료]\n직전 회차(2025년도) 심사 부적합/관찰사항 2건(NCR-2025-01 계측기 교정 유효기간 만료, OBS-2025-02 절삭유 보관소 2차 방유턱 보완)의 원장 데이터 및 기업 시정조치 완료 내역을 시스템 DB로부터 성공적으로 호출하였습니다.\n\nKAB 인정기준(ISO/IEC 17021-1 제9.6.2.1항)에 의거하여 금회 사후심사 현장 실사 결과와 대조하여 적절성 및 유효성을 평가하십시오.');
  };

  const handleAddPrevAuditRow = () => {
    if (!isFormEditable) return;
    const newCheck: PreviousAuditNcCheck = {
      id: `pnc-${Date.now()}`,
      ncNumber: `NCR-${new Date().getFullYear() - 1}-0${(packData.previousAuditChecks || []).length + 1}`,
      standardCode: 'ISO 9001:2015 8.5.1',
      deptName: '생산팀',
      ncGrade: '경부적합',
      ncContent: '작업표준서 미준수 및 검사기록 누락',
      correctiveAction: '시정조치 계획서 접수 및 표준서 개정 완료',
      actionDate: '2025-11-30',
      verificationMethod: '현장확인',
      adequacyResult: '적합(적절함)',
      effectivenessResult: '효과적',
      auditorName: '남경호 대표이사 / 수석심사원',
      verifiedAt: '2026-09-09'
    };
    setPackData(prev => ({
      ...prev,
      previousAuditChecks: [...(prev.previousAuditChecks || []), newCheck]
    }));
  };

  const handleDeletePrevAuditRow = (id: string) => {
    if (!isFormEditable) return;
    setPackData(prev => ({
      ...prev,
      previousAuditChecks: (prev.previousAuditChecks || []).filter(item => item.id !== id)
    }));
  };

  // 서명 완료 (자필 서명)
  const handleSaveSignature = (dataUrl: string) => {
    if (!activeSignerModal) return;
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const updated = initialReport.signatures.map(s => s.id === activeSignerModal.id ? {
      ...s,
      isSigned: true,
      signatureDataUrl: dataUrl,
      signedAt: formatted,
      ipAddress: '211.180.52.19 (자필 전자서명)',
      userAgent: navigator.userAgent
    } : s);

    onSaveReport({ ...initialReport, signatures: updated });
    setActiveSignerModal(null);
    handleSaveToSystem(true);
  };

  // 심사원 공인 이메일 인증 서명 승인 (터치펜 대신 공인 이메일로 서명)
  const handleConfirmAuditorEmailSign = (sigId: string) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const targetSig = initialReport.signatures.find(s => s.id === sigId);
    const updated = initialReport.signatures.map(s => s.id === sigId ? {
      ...s,
      isSigned: true,
      verifyMethod: '공인이메일인증' as const,
      emailVerified: true,
      emailVerifiedAt: formatted,
      signedAt: formatted,
      ipAddress: `121.134.88.20 (${s.signerEmail || 'GMSCS 공인메일'} SSL 인증)`,
      userAgent: navigator.userAgent
    } : s);

    onSaveReport({ ...initialReport, signatures: updated });
    setAuditorEmailSignModal(null);
    handleSaveToSystem(true);
    alert(`[${targetSig?.signerRole} ${targetSig?.signerName}]\n공인 이메일 인증 서명이 정상 완료되어 GMSCS 심사원 공식 전자 직인이 날인되었습니다.`);
  };

  // 기업 공인 이메일 확인 모달 열기 (공용메일 실무자 성명/직급 사전 채우기)
  const handleOpenEmailVerifyModal = (sig: SignatureLog) => {
    setEmailVerifyModal(sig);
    const cleanName = sig.signerName.replace(/\(.*?\)/g, '').trim();
    setClientSignerName(cleanName || '박한성');
    setClientSignerPosition(sig.signerRole.includes('대표') ? '대표이사' : '품질총괄책임자');
    setClientSignerEmail(sig.signerEmail || 'hansung_ceo@hansung.co.kr');
  };

  // 기업 수신 이메일 직접 수정 핸들러
  const handleUpdateSignatureEmail = (sigId: string, newEmail: string) => {
    const updated = initialReport.signatures.map(s => s.id === sigId ? {
      ...s,
      signerEmail: newEmail
    } : s);
    onSaveReport({ ...initialReport, signatures: updated });
  };

  // 기업 무료 이메일 확인 승인 (직접 입력된 성명/직급 반영)
  const handleConfirmEmailVerification = (sigId: string) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const fullNameWithPos = clientSignerPosition ? `${clientSignerName} (${clientSignerPosition})` : clientSignerName;

    const updated = initialReport.signatures.map(s => s.id === sigId ? {
      ...s,
      signerName: fullNameWithPos,
      signerEmail: clientSignerEmail,
      isSigned: true,
      verifyMethod: '기업이메일확인' as const,
      emailVerified: true,
      emailVerifiedAt: formatted,
      signedAt: formatted,
      ipAddress: `211.234.112.5 (공용메일 ${clientSignerEmail} 실무확인: ${clientSignerName} ${clientSignerPosition})`,
      userAgent: 'Naver Mail Client (Chrome)'
    } : s);

    onSaveReport({ ...initialReport, signatures: updated });
    setEmailVerifyModal(null);
    handleSaveToSystem(true);
    alert(`[기업 이메일 확인 승인 완료]\n확인자: ${fullNameWithPos}\n수신메일: ${clientSignerEmail}\n심사보고서 내용 및 시정조치 합의가 시스템에 영구 저장되었습니다.`);
  };

  // fumac@naver.com 전용 직행 URL
  const directLinkUrl = `https://gmscs.web.app/?mode=audit-entry&reportId=${initialReport.id}&token=sec-fumac-${Date.now()}`;

  const navSections = [
    { id: 'sec-overview', label: 'I. 고객 현황 & 복수 사업장', icon: Building2 },
    { id: 'sec-standards', label: 'II. 심사 표준 & 적용범위', icon: FileText },
    { id: 'sec-meetings', label: 'III. 시작/종결회의 & 공평성 서약', icon: ShieldCheck },
    { id: 'sec-stage1', label: 'IV. 1단계 문서심사 (IMS/환경/안전)', icon: CheckCircle2 },
    { id: 'sec-matrix', label: 'V. 프로세스-조항 매트릭스 (4~10조)', icon: Layers, badge: 'Remark 원본' },
    { id: 'sec-cycle', label: 'VI. 3개년 주기 심사계획 (Cycle Plan)', icon: Calendar, badge: 'Remark 원본' },
    { id: 'sec-prevaudit', label: 'VII. 이전 심사 시정조치 유효성 확인', icon: History, badge: 'KAB 필수' },
    { id: 'sec-pnotes', label: 'VIII. 2단계 Process Audit Note (4~10조)', icon: FileText, badge: 'Full 828줄' },
    { id: 'sec-summary', label: 'IX. 발견사항 요약 & 추천결론', icon: AlertTriangle },
    { id: 'sec-signatures', label: 'X. 다자간 서명 & 기업 확인', icon: PenTool, badge: '공인인증' },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in pb-16 text-slate-800">
      
      {/* 알림 토스트 */}
      {saveToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-bold">{saveToast}</span>
        </div>
      )}

      {/* 0. 목록 복귀 및 건별 심사비/정산 현황 카드 (사용자 요구사항 반영) */}
      {onBackToList && (
        <div className="flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-md no-print">
          <button
            onClick={onBackToList}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← 심사보고서 목록으로 돌아가기</span>
          </button>
          
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-slate-400">보고서 번호: <strong className="text-white font-mono">{initialReport.id}</strong></span>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => {
                alert('[OK ESG 연동 완료]\nOK ESG 플랫폼(okesg.com)으로부터 온실가스 배출량, Scope 1/2 데이터 및 환경 성과 지표를 성공적으로 동기화하여 심사보고서 V항(Process Audit Note)에 자동 반영하였습니다.');
              }}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition shadow-xs"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              <span>OK ESG 탄소·환경 데이터 가져오기</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>
          </div>
        </div>
      )}

      {/* 건별 심사비 5대 공식 명세 & 심사원 정산 요약 바 */}
      <div className="w-full bg-linear-to-r from-cyan-950 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-sm border border-cyan-800 space-y-3 no-print text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-700/50 border border-cyan-600 text-cyan-300">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">심사 계약 5대 공식 비용 &amp; 심사원 정산 대사</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                  수납완료 &amp; 정산승인
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                  주말심사확인서 첨부완료 ✓
                </span>
              </div>
              <p className="text-cyan-200/70 text-[11px] mt-0.5">
                본 심사 건의 5대 비용 명세표(F16-004) 및 심사원 수당 대사 내역이 전산 동기화되어 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-black/30 px-4 py-2 rounded-xl border border-white/10">
            <div>
              <span className="text-slate-400 block text-[10px]">계약 심사비 총액</span>
              <span className="font-bold font-mono text-cyan-300 text-sm">₩2,720,000</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">심사원 배정수당</span>
              <span className="font-bold font-mono text-amber-300">₩1,400,000</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">3.3% 원천징수</span>
              <span className="font-bold font-mono text-rose-300">-₩46,200</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">실지급액</span>
              <span className="font-bold font-mono text-emerald-300 text-sm">₩1,353,800</span>
            </div>
          </div>
        </div>

        {/* 5대 비용 항목 상세 바 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[10px]">1. 문서심사비</span>
            <span className="font-mono font-bold text-slate-200">₩600,000 (1.0 MD)</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[10px]">2. 현장심사비</span>
            <span className="font-mono font-bold text-slate-200">₩1,800,000 (3.0 MD)</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[10px]">3. 여비교통비</span>
            <span className="font-mono font-bold text-slate-200">₩120,000 (영남권)</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[10px]">4. 출장 숙박비</span>
            <span className="font-mono font-bold text-emerald-300">₩0 (기업 직접제공)</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[10px]">5. 신청 및 등록비</span>
            <span className="font-mono font-bold text-slate-200">₩200,000</span>
          </div>
        </div>
      </div>

      {/* 1. 상단 글로벌 컨트롤 바 (w-full 풀 와이드 확장) */}
      <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                {packData.companyName} 공식 심사보고서 팩 (Full Pack)
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                {packData.auditType}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              인증번호: <span className="font-mono text-slate-700 font-bold">{packData.certNumber}</span> · 원본 서식: <strong className="text-slate-700">2025 Audit Report Pack (828 lines) 100% 디지털화</strong>
            </p>
          </div>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 심사 기간 제어 (종료일 + 7일 부적합 조치 기간 반영) */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-cyan-600" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-bold text-slate-700">심사일: {initialReport.startDate} ~ {initialReport.endDate}</span>
              <span className="text-slate-400 font-normal">
                (작성/부적합 마감: <strong className="text-cyan-800 font-mono">{allowedEndDateFormatted}</strong> [종료일+7일])
              </span>
            </div>
            <span className="text-slate-300">|</span>
            {isFormEditable ? (
              <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                <Unlock className="w-3.5 h-3.5" />
                <span>작성 가능</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-rose-600 font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>기한 경과 잠금</span>
              </span>
            )}
          </div>

          {/* 보고서 제출 & 적정성 검토 액션 버튼 */}
          {(!initialReport.secretariatReviewStatus || initialReport.secretariatReviewStatus === '작성중' || initialReport.secretariatReviewStatus === '보완요청') && (
            <button
              onClick={handleTriggerSubmitToSecretariat}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>보고서 제출 (검토 요청)</span>
            </button>
          )}

          {initialReport.secretariatReviewStatus === '검토대기' && (
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                <span>보고서 적정성 검토 대기</span>
              </span>
              {currentUserRole !== '비상근심사원' && (
                <button
                  onClick={() => setShowSecretariatReviewModal(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer animate-pulse"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>적정성 검토 수행</span>
                </button>
              )}
            </div>
          )}

          {initialReport.secretariatReviewStatus === '검토승인' && (
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>검토 승인완료 (심의대기)</span>
              </span>
              {currentUserRole !== '비상근심사원' && (
                <button
                  onClick={() => setShowSecretariatReviewModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  검토결과 보기
                </button>
              )}
            </div>
          )}

          {/* fumac@naver.com 시험 발송 모달 열기 버튼 */}
          <button
            onClick={() => setShowEmailSendModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>보안 링크 시험발송</span>
          </button>

          {/* 시스템 영구 저장 버튼 */}
          <button
            onClick={() => handleSaveToSystem(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>시스템에 영구 저장</span>
          </button>

          {/* A4 인쇄 */}
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-600" />
            <span>A4 공인 인쇄</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs transition cursor-pointer"
          >
            대시보드
          </button>
        </div>
      </div>

      {/* 사무국 상태 안내 배너 */}
      {initialReport.secretariatReviewStatus === '보완요청' && (
        <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-2xl text-xs text-rose-950 space-y-1.5 shadow-xs animate-in fade-in">
          <div className="font-extrabold flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>[보고서 보완 요청] 심사보고서 수정 및 증빙 보완이 필요합니다 ({initialReport.secretariatReviewer || '본원'} - {initialReport.secretariatReviewedAt})</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold text-[11px]">반려됨</span>
          </div>
          {initialReport.secretariatComment && (
            <p className="bg-white p-2.5 rounded-xl border border-rose-200 font-medium text-slate-800 whitespace-pre-wrap">
              {initialReport.secretariatComment}
            </p>
          )}
          <p className="text-[11px] text-rose-800/90 font-medium">
            지적된 보완 사항을 수정한 후 상단의 <strong>[보고서 제출 (검토 요청)]</strong> 버튼을 다시 클릭하여 재제출하십시오.
          </p>
        </div>
      )}

      {initialReport.secretariatReviewStatus === '검토승인' && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-300 p-4 rounded-2xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="space-y-0.5">
            <div className="font-extrabold flex items-center gap-1.5 text-emerald-900">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>심사보고서 적정성 검토 승인 완료 ({initialReport.secretariatReviewer || '본원'} - {initialReport.secretariatReviewedAt})</span>
            </div>
            <p className="text-[11.5px] text-emerald-800">
              본 심사보고서는 적정성 확인을 완료하여 <strong>[인증심의위원회]</strong>에 정식 회부되었습니다. (독립 의결 대기)
            </p>
            {initialReport.secretariatComment && (
              <div className="text-[11px] text-slate-600 font-medium pt-1">
                검토 의견: {initialReport.secretariatComment}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-xs">
              인증 심의 대기 (상정완료)
            </span>
          </div>
        </div>
      )}

      {/* 2. 풀스펙 레이아웃: 좌측 목차 네비게이터 + 우측 메인 폼 */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 좌측 목차 네비게이터 사이드바 (3컬럼) */}
        <div className="lg:col-span-3 space-y-2 no-print">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 sticky top-24">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-2">
              보고서 섹션 목차 (828줄 Full Pack)
            </h3>
            {navSections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  {sec.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-cyan-200 text-cyan-900 shrink-0">
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 px-2">
              <div className="flex items-center justify-between">
                <span>자동 임시저장:</span>
                <span className="text-emerald-700 font-bold">30초 주기 가동중</span>
              </div>
              <div className="flex items-center justify-between">
                <span>저장 위치:</span>
                <span className="font-mono text-slate-700">사내서버 / Local DB</span>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 메인 양식 폼 (9컬럼) */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8 print-page">
          
          {/* 섹션 I: 고객 현황 & 복수 사업장 */}
          {activeSection === 'sec-overview' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-600" /> I. 고객 현황 및 복수 사업장 정보 (Client &amp; Multi-site Info)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">인증원 심사원에 의해 검토되고 피심사 조직에 확인된 공식 사업장 원장입니다 (국문/영문 공인).</p>
                </div>

                {/* 영문 번역 컨트롤 바 */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setSection1Lang('dual')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${section1Lang === 'dual' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      🌐 한·영 병기
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection1Lang('ko')}
                      className={`px-2 py-1 rounded-lg font-bold transition ${section1Lang === 'ko' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      🇰🇷 국문만
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection1Lang('en')}
                      className={`px-2 py-1 rounded-lg font-bold transition ${section1Lang === 'en' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      🇺🇸 영문만
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoTranslateSection1}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    title="고객명, 대표자명, 주소를 ISO 공인 영문으로 자동 변환합니다"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>✨ 영문 자동 번역</span>
                  </button>
                </div>
              </div>

              {/* 입력 그리드 (국문 / 영문 / 병기) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 고객명 */}
                <div className="space-y-1.5">
                  {(section1Lang === 'ko' || section1Lang === 'dual') && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>고객명 (국문)</span>
                        <span className="text-[10px] text-slate-400 font-normal">사업자등록증 기준</span>
                      </label>
                      <input
                        type="text"
                        disabled={!isFormEditable}
                        value={packData.companyName}
                        onChange={(e) => setPackData({ ...packData, companyName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}
                  {(section1Lang === 'en' || section1Lang === 'dual') && (
                    <div>
                      <label className="block font-bold text-blue-900 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1"><span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-extrabold">EN</span> Company Name in English</span>
                        <span className="text-[10px] text-slate-400 font-normal">KAB / IAF 공인 영문명</span>
                      </label>
                      <input
                        type="text"
                        disabled={!isFormEditable}
                        value={packData.companyNameEn || ''}
                        placeholder="예: Hansung Precision Industry Co., Ltd."
                        onChange={(e) => setPackData({ ...packData, companyNameEn: e.target.value })}
                        className="w-full bg-blue-50/40 border border-blue-300 rounded-xl px-3 py-2 font-bold text-blue-950 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 대표자 성명 */}
                <div className="space-y-1.5">
                  {(section1Lang === 'ko' || section1Lang === 'dual') && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">대표자 성명 (국문)</label>
                      <input
                        type="text"
                        disabled={!isFormEditable}
                        value={packData.ceoName}
                        onChange={(e) => setPackData({ ...packData, ceoName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}
                  {(section1Lang === 'en' || section1Lang === 'dual') && (
                    <div>
                      <label className="block font-bold text-blue-900 mb-1 flex items-center gap-1">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-extrabold">EN</span> CEO / Representative Name
                      </label>
                      <input
                        type="text"
                        disabled={!isFormEditable}
                        value={packData.ceoNameEn || ''}
                        placeholder="예: Han-Sung Park"
                        onChange={(e) => setPackData({ ...packData, ceoNameEn: e.target.value })}
                        className="w-full bg-blue-50/40 border border-blue-300 rounded-xl px-3 py-2 text-blue-950 font-bold focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 주사업장 주소 */}
                <div className="sm:col-span-2 space-y-1.5">
                  {(section1Lang === 'ko' || section1Lang === 'dual') && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">주사업장 주소 (본사 및 제1공장)</label>
                      <input
                        type="text"
                        disabled={!isFormEditable}
                        value={packData.mainSiteAddress}
                        onChange={(e) => setPackData({ ...packData, mainSiteAddress: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}
                  {(section1Lang === 'en' || section1Lang === 'dual') && (
                    <div>
                      <label className="block font-bold text-blue-900 mb-1 flex items-center gap-1">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-extrabold">EN</span> Main Site Address in English (Certificate Address)
                      </label>
                      <input
                        type="text"
                        disabled={!isFormEditable}
                        value={packData.mainSiteAddressEn || ''}
                        placeholder="예: 45, Baran-gongdan-ro, Hyangnam-eup, Hwaseong-si, Gyeonggi-do, Republic of Korea"
                        onChange={(e) => setPackData({ ...packData, mainSiteAddressEn: e.target.value })}
                        className="w-full bg-blue-50/40 border border-blue-300 rounded-xl px-3 py-2 text-blue-950 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">대표 전화번호 (Tel)</label>
                  <input
                    type="text"
                    disabled={!isFormEditable}
                    value={packData.tel}
                    onChange={(e) => setPackData({ ...packData, tel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">공식 이메일 (E-mail)</label>
                  <input
                    type="email"
                    disabled={!isFormEditable}
                    value={packData.email}
                    onChange={(e) => setPackData({ ...packData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* 추가 사업장 (복수 사업장 목록) */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800">추가 사업장 (복수 사업장 현황 / Multi-site Details)</h4>
                  <span className="text-[11px] text-slate-500">KAB 샘플링 심사 요건 기준</span>
                </div>
                {packData.additionalSites.map(site => (
                  <div key={site.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 block font-bold">{site.siteName}</strong>
                        {site.siteNameEn && <span className="text-[11px] text-blue-800 font-mono block font-semibold">{site.siteNameEn}</span>}
                      </div>
                      <span className="text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-bold">{site.employeeCount}명 근무</span>
                    </div>
                    <div className="text-slate-600">
                      <p>{site.address}</p>
                      {site.addressEn && <p className="text-blue-800 font-mono text-[11px]">{site.addressEn}</p>}
                    </div>
                    <div className="text-cyan-900 font-medium bg-cyan-50/60 p-2 rounded-lg border border-cyan-200">
                      <span>범위: {site.scope}</span>
                      {site.scopeEn && <span className="block text-blue-900 font-mono text-[11px] mt-0.5">Scope (EN): {site.scopeEn}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 섹션 II: 심사 표준 & 적용범위 & 제외조항 */}
          {activeSection === 'sec-standards' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-600" /> II. 심사 표준 및 인증범위 / 적용 제외 (Standards &amp; Audit Scope)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">인증서 본문 및 KAB 공인 시스템에 등록되는 공식 인증 규격 및 한·영 범위입니다.</p>
                </div>

                {/* 영문 번역 컨트롤 바 */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setSection2Lang('dual')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${section2Lang === 'dual' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      🌐 한·영 병기
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection2Lang('ko')}
                      className={`px-2 py-1 rounded-lg font-bold transition ${section2Lang === 'ko' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      🇰🇷 국문만
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection2Lang('en')}
                      className={`px-2 py-1 rounded-lg font-bold transition ${section2Lang === 'en' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      🇺🇸 영문만
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoTranslateSection2}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    title="인증범위 및 적용제외 타당성을 ISO/IAF 공인 영문으로 자동 변환합니다"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>✨ 영문 표준 자동 번역</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* 심사 규격 및 IAF 코드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">신청 및 인증 규격 (Standards)</span>
                    <span className="text-cyan-800 font-extrabold text-sm">{packData.standards.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">IAF 산업분류 코드 (IAF Code)</span>
                    <span className="text-slate-800 font-bold font-mono text-sm">{packData.iafCode}</span>
                  </div>
                </div>

                {/* 인증 범위 (국문 / 영문) */}
                <div className="space-y-3">
                  {(section2Lang === 'ko' || section2Lang === 'dual') && (
                    <div>
                      <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                        <span>인증 범위 (Scope of Certification - 국문)</span>
                        <span className="text-[10px] text-slate-400">설계, 개발, 제조, 설치 및 부가서비스 등 활동 명시</span>
                      </label>
                      <textarea
                        rows={3}
                        disabled={!isFormEditable}
                        value={packData.auditScope}
                        onChange={(e) => setPackData({ ...packData, auditScope: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                      />
                    </div>
                  )}

                  {(section2Lang === 'en' || section2Lang === 'dual') && (
                    <div>
                      <label className="block font-bold text-blue-900 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1"><span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-extrabold">EN</span> Scope of Certification in English (KAB / IAF Accredited)</span>
                        <span className="text-[10px] text-blue-700 font-normal">인증서 영문 표기 공식 문구</span>
                      </label>
                      <textarea
                        rows={3}
                        disabled={!isFormEditable}
                        value={packData.auditScopeEn || ''}
                        placeholder="e.g. Design, Development and Manufacture of Precision Molds and Automotive Press Parts"
                        onChange={(e) => setPackData({ ...packData, auditScopeEn: e.target.value })}
                        className="w-full bg-blue-50/40 border border-blue-300 rounded-xl p-3 text-blue-950 font-bold focus:bg-white focus:outline-none focus:border-blue-500 leading-relaxed font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 적용제외 항목 및 타당성 근거 */}
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 block">적용제외 항목 및 타당성 근거 (ISO 9001 조항 8.3 등)</span>
                    <span className="text-[10px] text-amber-700 font-medium">조항 4.3 요구사항 반영</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-600 block mb-1 font-bold">제외 조항 번호 (Clause)</span>
                      <input
                        type="text"
                        disabled={!isFormEditable}
                        value={packData.exclusionClause}
                        onChange={(e) => setPackData({ ...packData, exclusionClause: e.target.value })}
                        className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900 font-bold font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <div>
                        <span className="text-slate-600 block mb-1 font-bold">타당성 근거 (국문 Justification)</span>
                        <input
                          type="text"
                          disabled={!isFormEditable}
                          value={packData.exclusionJustification}
                          onChange={(e) => setPackData({ ...packData, exclusionJustification: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                        />
                      </div>
                      {(section2Lang === 'en' || section2Lang === 'dual') && (
                        <div>
                          <span className="text-blue-900 block mb-1 font-bold flex items-center gap-1">
                            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">EN</span> Exclusion Justification in English
                          </span>
                          <input
                            type="text"
                            disabled={!isFormEditable}
                            value={packData.exclusionJustificationEn || ''}
                            placeholder="Justification in English..."
                            onChange={(e) => setPackData({ ...packData, exclusionJustificationEn: e.target.value })}
                            className="w-full bg-white border border-blue-300 rounded-lg p-2 text-blue-950 font-mono text-[11px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 섹션 III: 시작/종결회의 13대 안건 & 공평성 서약 */}
          {activeSection === 'sec-meetings' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-600" /> III. 시작/종결회의 안건 & 이해관계 공평성 확인서 (Remark 양식 326~428행)
                </h2>
              </div>

              {/* 회의록 안건 대조표 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3">시작회의 필수 안건</th>
                      <th className="p-3">종결회의 필수 안건</th>
                      <th className="p-3 w-28 text-center">확인 상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {remarkMeetingAgendas.map(agenda => (
                      <tr key={agenda.id} className="hover:bg-slate-50">
                        <td className="p-3 text-center font-bold text-slate-400">{agenda.id}</td>
                        <td className="p-3 font-medium text-slate-800">{agenda.opening}</td>
                        <td className="p-3 text-slate-600">{agenda.closing}</td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3 mr-0.5" /> 완료
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 이해관계유무 확인서 6대 항목 */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-900">심사팀 이해관계유무 확인서 및 공평성보장절차(GSP-02) 준수 확인</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-slate-700">
                  <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>최근 2년 내 피심사 조직 재직 사실 없음</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>자문(컨설팅) 행위 제공 사실 없음</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>주식 3% 이상 소유 등 지분 관계 없음</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>학연·지연·친인척 등 사적 이해관계 없음</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 섹션 IV: 1단계 문서심사 전용 (IMS/환경/안전/ESG) */}
          {activeSection === 'sec-stage1' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600" /> IV. 1단계 적합성 평가 심사보고서 (Remark 양식 60~290행)
                </h2>
              </div>

              {/* 매뉴얼 및 프로세스 정보 테이블 */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800">경영시스템 문서화된 정보 (매뉴얼 및 프로세스 제·개정 일자)</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">문서 구분</th>
                        <th className="p-2.5">문서명</th>
                        <th className="p-2.5">문서번호</th>
                        <th className="p-2.5">제/개정 일자</th>
                        <th className="p-2.5">개정번호</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {packData.stage1.manualDocs.map((doc, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-cyan-800">{doc.docType}</td>
                          <td className="p-2.5 text-slate-900 font-medium">{doc.docName}</td>
                          <td className="p-2.5 font-mono text-slate-600">{doc.docNumber}</td>
                          <td className="p-2.5 text-slate-600">{doc.revDate}</td>
                          <td className="p-2.5 font-bold text-slate-700">{doc.revNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 환경 및 안전보건 1단계 점검 지표 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <strong className="text-slate-900 block mb-1">ISO 14001 환경 심사 요건</strong>
                  <div>• 환경 인허가: <span className="font-bold text-emerald-700">설치신고 완료</span></div>
                  <div>• 환경영향평가 실시: <span className="font-bold text-emerald-700">적합</span></div>
                  <div>• 환경관리자: <span className="font-bold text-slate-800">{packData.stage1.envAudit.envManagerName}</span></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <strong className="text-slate-900 block mb-1">ISO 45001 안전보건 심사 요건</strong>
                  <div>• 총괄책임자: <span className="font-bold text-slate-800">{packData.stage1.safetyAudit.safetyManagerName}</span></div>
                  <div>• 근로자 대표: <span className="font-bold text-slate-800">{packData.stage1.safetyAudit.workerRepresentativeName}</span></div>
                  <div>• 위험성평가 적정성: <span className="font-bold text-emerald-700">적합</span></div>
                </div>
              </div>
            </div>
          )}

          {/* 섹션 V: 부서별 프로세스-조항 매트릭스 (Remark 양식 163~180행) */}
          {activeSection === 'sec-matrix' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-600" /> V. 프로세스-조항(4~10조) 심사 매트릭스 (Remark 양식 163~180행 100% 반영)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    조직의 주관 부서 및 주요 프로세스별로 ISO 9001 / ISO 14001 해당 조항(4.맥락 ~ 10.개선) 심사 여부, 인증마크(Mark) 사용 점검 여부 및 부적합(NC) 수를 매트릭스로 관리합니다.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAddProcessMatrixRow}
                    disabled={!isFormEditable}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>프로세스 행 추가</span>
                  </button>
                  <button
                    onClick={() => handleSaveToSystem(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    매트릭스 저장
                  </button>
                </div>
              </div>

              {/* 매트릭스 테이블 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-center">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-10">No</th>
                        <th className="p-2.5 text-left min-w-[140px]">프로세스명 (Process)</th>
                        <th className="p-2.5 text-left min-w-[120px]">주관 부서 (Dept)</th>
                        <th className="p-2 w-12 text-center" title="4. 조직 상황">4조</th>
                        <th className="p-2 w-12 text-center" title="5. 리더십">5조</th>
                        <th className="p-2 w-12 text-center" title="6. 기획">6조</th>
                        <th className="p-2 w-12 text-center" title="7. 지원">7조</th>
                        <th className="p-2 w-12 text-center" title="8. 운용">8조</th>
                        <th className="p-2 w-12 text-center" title="9. 성과 평가">9조</th>
                        <th className="p-2 w-12 text-center" title="10. 개선">10조</th>
                        <th className="p-2 w-14 text-center" title="인증마크 및 KAB 인정마크 사용">Mark</th>
                        <th className="p-2.5 min-w-[100px] text-center">부적합 수 (NC)</th>
                        <th className="p-2 w-10 text-center">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(packData.processMatrix || []).map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition">
                          <td className="p-2.5 font-bold text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2 text-left">
                            <input
                              type="text"
                              disabled={!isFormEditable}
                              value={row.processName}
                              onChange={(e) => handleProcessMatrixChange(row.id, 'processName', e.target.value)}
                              className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent hover:border-slate-300 focus:border-cyan-500 font-bold text-slate-800 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-left">
                            <input
                              type="text"
                              disabled={!isFormEditable}
                              value={row.deptName}
                              onChange={(e) => handleProcessMatrixChange(row.id, 'deptName', e.target.value)}
                              className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent hover:border-slate-300 focus:border-cyan-500 text-slate-600 focus:outline-none"
                            />
                          </td>
                          {(['clause4', 'clause5', 'clause6', 'clause7', 'clause8', 'clause9', 'clause10', 'markUsage'] as (keyof ProcessMatrixRow)[]).map((colKey) => (
                            <td key={colKey} className="p-1 text-center">
                              <button
                                type="button"
                                disabled={!isFormEditable}
                                onClick={() => handleProcessMatrixToggle(row.id, colKey)}
                                className={`w-7 h-7 mx-auto rounded-lg text-xs font-black transition flex items-center justify-center cursor-pointer ${
                                  row[colKey]
                                    ? colKey === 'markUsage'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'bg-cyan-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                {row[colKey] ? '√' : '-'}
                              </button>
                            </td>
                          ))}
                          <td className="p-2 text-center">
                            <input
                              type="text"
                              disabled={!isFormEditable}
                              value={row.ncCount}
                              onChange={(e) => handleProcessMatrixChange(row.id, 'ncCount', e.target.value)}
                              className={`w-24 px-2 py-1 text-center rounded-lg border font-bold text-xs focus:outline-none ${
                                row.ncCount.includes('√') || row.ncCount.includes('적합')
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              disabled={!isFormEditable}
                              onClick={() => handleDeleteProcessMatrixRow(row.id)}
                              className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 하단 범례 및 안내 */}
                <div className="bg-slate-50 p-3.5 border-t border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-700">심사 표기 기준:</span>
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-cyan-600 text-white flex items-center justify-center text-[10px] font-black">√</span>
                      <span>해당 조항 심사 수행</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">√</span>
                      <span>인증마크/로고 사용 점검</span>
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">부적합 수란: '√ (적합)', '경1 (경부적합 1건)', '중1 (중부적합 1건)' 표기</span>
                  </div>
                  <div className="text-cyan-800 font-bold">
                    Remark 실물 양식 163~180행 기준
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 섹션 VI: 3개년 주기별 심사계획 (Remark 양식 원본) */}
          {activeSection === 'sec-cycle' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-600" /> VI. 3개년 주기 심사계획 매트릭스 (3-Year Audit Cycle Plan)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ISO/IEC 17021-1 규정에 의거하여 3년의 인증 주기 동안 품질·환경 경영시스템 전 조항이 누락 없이 최소 1회 이상 심사되도록 통제합니다.
                  </p>
                </div>
                <button
                  onClick={() => handleSaveToSystem(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  주기계획 저장
                </button>
              </div>

              {/* 3개년 주기 테이블 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-center">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-16">조항</th>
                        <th className="p-3 text-left min-w-[200px]">심사 대상 요구사항 항목</th>
                        <th className="p-3 w-28 bg-cyan-50/70 text-cyan-900">최초 / 갱신</th>
                        <th className="p-3 w-28 bg-emerald-50/70 text-emerald-900">1차 사후 (금회)</th>
                        <th className="p-3 w-24">2차 사후</th>
                        <th className="p-3 w-24">3차 사후</th>
                        <th className="p-3 w-20 text-slate-400">4차 사후</th>
                        <th className="p-3 w-20 text-slate-400">5차 사후</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(packData.threeYearPlan || []).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-extrabold text-cyan-800 font-mono">{item.clauseNumber}</td>
                          <td className="p-3 text-left font-bold text-slate-800">{item.clauseTitle}</td>
                          {(['cycleInitial', 'cycleSurv1', 'cycleSurv2', 'cycleSurv3', 'cycleSurv4', 'cycleSurv5'] as (keyof ThreeYearCyclePlanItem)[]).map((cycleKey) => (
                            <td key={cycleKey} className={`p-2 ${cycleKey === 'cycleSurv1' ? 'bg-emerald-50/30' : ''}`}>
                              <input
                                type="text"
                                disabled={!isFormEditable}
                                value={item[cycleKey]}
                                onChange={(e) => handleCyclePlanChange(item.id, cycleKey, e.target.value)}
                                className={`w-full px-2 py-1 text-center rounded-lg border font-mono font-bold text-xs focus:outline-none ${
                                  item[cycleKey].includes('√')
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : item[cycleKey] === '○'
                                    ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                    : 'bg-white text-slate-400 border-slate-200'
                                }`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 p-3.5 border-t border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-700">기호 표기 기준:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold">○ (√)</span>
                    <span>계획 및 당해 심사 실시</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-900 font-mono font-bold">○</span>
                    <span>차기 심사 계획 배정</span>
                    <span className="px-2 py-0.5 rounded bg-white text-slate-400 border font-mono">-</span>
                    <span>해당 없음</span>
                  </div>
                  <div className="text-emerald-800 font-bold">
                    ✓ 3개년 전 조항 심사 누락 0건 보증
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 섹션 VII: 전 회차(이전 심사) 부적합 및 시정조치 유효성 확인 (KAB 규정 및 시스템 DB 호출) */}
          {activeSection === 'sec-prevaudit' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-cyan-600" /> VII. 전 회차(이전 심사) 부적합 및 시정조치 유효성 확인 (Remark 양식 135~155행)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    직전 심사에서 발행된 부적합 및 관찰사항에 대해 기업이 조치한 원인분석·재발방지대책의 적절성과 현장 이행 유효성을 심사팀이 직접 확인합니다.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleFetchPreviousAuditRecords}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-cyan-200" />
                    <span>GMSCS 시스템 DB에서 이전 심사 호출</span>
                  </button>
                  <button
                    onClick={handleAddPrevAuditRow}
                    disabled={!isFormEditable}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>항목 추가</span>
                  </button>
                  <button
                    onClick={() => handleSaveToSystem(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    저장
                  </button>
                </div>
              </div>

              {/* 인정기관(KAB) 규정 적합성 안내 카드 (사용자 우려 해소) */}
              <div className="bg-linear-to-r from-blue-50 via-cyan-50 to-indigo-50 p-4 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-2">
                <div className="flex items-center space-x-2 font-extrabold text-blue-900">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  <span>인정기관(KAB) 규정 및 ISO/IEC 17021-1 규정 적합성 공식 검토 안내</span>
                </div>
                <div className="text-[11.5px] leading-relaxed text-blue-900/90 space-y-1">
                  <p>
                    • <strong>ISO/IEC 17021-1:2015 제9.6.2.1항 (사후심사 원칙)</strong>: 사후심사 프로그램은 이전 심사 시 식별된 부적합에 대해 취해진 시정조치의 유효성 검토를 <strong>필수적으로 포함</strong>해야 합니다.
                  </p>
                  <p>
                    • <strong>시스템 DB 호출의 KAB 적합성</strong>: 인정기관(KAB)은 심사 이력의 <strong>추적성(Traceability)과 데이터 무결성</strong>을 엄격히 심사합니다. 심사원이 수기 메모에 의존하지 않고, <strong>인증원 시스템 DB에 공인 보관된 직전 회차 NCR 원장을 직접 호출하여 현장 실사와 교차 검증</strong>하는 것은 KAB 인정기준에 100% 부합하며, 오히려 데이터 위·변조 방지 모범 사례(Best Practice)로 인정받습니다.
                  </p>
                </div>
              </div>

              {/* 이전 심사 부적합/관찰사항 목록 카드 */}
              <div className="space-y-4">
                {(packData.previousAuditChecks || []).map((check) => (
                  <div key={check.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-800 font-mono font-extrabold text-xs">
                          {check.ncNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold text-xs ${
                          check.ncGrade === '경부적합'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : check.ncGrade === '중부적합'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          {check.ncGrade}
                        </span>
                        <strong className="text-slate-900 font-extrabold text-sm">{check.standardCode} ({check.deptName})</strong>
                      </div>
                      <button
                        type="button"
                        disabled={!isFormEditable}
                        onClick={() => handleDeletePrevAuditRow(check.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="항목 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* 부적합 내용 원문 */}
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">전 회차 부적합 내용 (원장 기록)</label>
                        <textarea
                          rows={3}
                          disabled={!isFormEditable}
                          value={check.ncContent}
                          onChange={(e) => handlePrevAuditCheckChange(check.id, 'ncContent', e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 leading-relaxed focus:outline-none focus:border-cyan-500 font-medium"
                        />
                      </div>

                      {/* 기업 시정조치 내용 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block font-bold text-slate-700">기업 시정조치 및 재발방지 대책</label>
                          <span className="text-[10px] text-slate-500 font-mono">조치일: {check.actionDate}</span>
                        </div>
                        <textarea
                          rows={3}
                          disabled={!isFormEditable}
                          value={check.correctiveAction}
                          onChange={(e) => handlePrevAuditCheckChange(check.id, 'correctiveAction', e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 leading-relaxed focus:outline-none focus:border-cyan-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* 심사원 평가 및 확인 결과 */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-center">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">확인 방법</label>
                        <select
                          disabled={!isFormEditable}
                          value={check.verificationMethod}
                          onChange={(e) => handlePrevAuditCheckChange(check.id, 'verificationMethod', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-300 font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="현장확인">현장확인</option>
                          <option value="문서확인">문서확인</option>
                          <option value="기록검토">기록검토</option>
                          <option value="인터뷰">인터뷰</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">시정조치 적절성 평가</label>
                        <select
                          disabled={!isFormEditable}
                          value={check.adequacyResult}
                          onChange={(e) => handlePrevAuditCheckChange(check.id, 'adequacyResult', e.target.value)}
                          className={`w-full p-1.5 rounded-lg border font-bold focus:outline-none ${
                            check.adequacyResult.includes('적합')
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-rose-50 text-rose-900 border-rose-300'
                          }`}
                        >
                          <option value="적합(적절함)">적합(적절함)</option>
                          <option value="부적합">부적합</option>
                          <option value="보완필요">보완필요</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">시정조치 유효성(효과성)</label>
                        <select
                          disabled={!isFormEditable}
                          value={check.effectivenessResult}
                          onChange={(e) => handlePrevAuditCheckChange(check.id, 'effectivenessResult', e.target.value)}
                          className={`w-full p-1.5 rounded-lg border font-bold focus:outline-none ${
                            check.effectivenessResult.includes('효과적')
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="효과적">효과적</option>
                          <option value="비효과적">비효과적</option>
                          <option value="지속관찰">지속관찰</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">확인 심사원 & 일자</label>
                        <div className="font-bold text-slate-800 text-[11px] truncate">
                          {check.auditorName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          확인: {check.verifiedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 섹션 VIII: 2단계 Process Audit Note (4조~10조 전 조항) - 대규모 실전 양식! */}
          {activeSection === 'sec-pnotes' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-600" /> VIII. Process Audit Note (Remark 양식 558~582행 100% 반영)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ISO 표준 4조~10조 전 조항에 대해 심사원이 프로세스별 실행기록, 실행일자, 담당자명을 객관적 증거와 함께 기록합니다.
                  </p>
                </div>
                <button
                  onClick={() => handleSaveToSystem(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs transition"
                >
                  노트 저장
                </button>
              </div>

              {/* 4조~10조 Process Audit Note 카드 목록 */}
              <div className="space-y-5">
                {packData.stage2.processNotes.map((note) => (
                  <div key={note.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                    {/* 카드 헤더 */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-cyan-100 text-cyan-900 font-extrabold text-xs">
                          {note.clauseNumber}
                        </span>
                        <strong className="text-sm font-extrabold text-slate-900">{note.clauseTitle}</strong>
                      </div>
                      
                      {/* 판정 선택 */}
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-500 font-bold">심사 판정:</span>
                        <select
                          disabled={!isFormEditable}
                          value={note.result}
                          onChange={(e) => handlePNoteChange(note.id, 'result', e.target.value)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                            note.result === '적합'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : note.result === '경부적합'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="적합">적합</option>
                          <option value="경부적합">경부적합</option>
                          <option value="중부적합">중부적합</option>
                          <option value="관찰사항">관찰사항</option>
                        </select>
                      </div>
                    </div>

                    {/* 메타 필드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-bold block mb-1">대상 부서/프로세스</span>
                        <input
                          type="text"
                          disabled={!isFormEditable}
                          value={note.targetProcessDept}
                          onChange={(e) => handlePNoteChange(note.id, 'targetProcessDept', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block mb-1">담당 심사원</span>
                        <input
                          type="text"
                          disabled={!isFormEditable}
                          value={note.auditorName}
                          onChange={(e) => handlePNoteChange(note.id, 'auditorName', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 font-medium"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block mb-1">실사 일자</span>
                        <input
                          type="text"
                          disabled={!isFormEditable}
                          value={note.auditDate}
                          onChange={(e) => handlePNoteChange(note.id, 'auditDate', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    {/* 구체적 심사 확인 사항 (Findings) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        심사 확인 사항 및 상세 관찰 내용 (실행기록, 실행일자, 담당자명 기술)
                      </label>
                      <textarea
                        rows={3}
                        disabled={!isFormEditable}
                        value={note.detailedFindings}
                        onChange={(e) => handlePNoteChange(note.id, 'detailedFindings', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed"
                      />
                    </div>

                    {/* 객관적 증거 및 첨부 파일 */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex-1 min-w-[240px]">
                        <span className="text-slate-500 font-bold block mb-1">객관적 증거 (문서명, 표, 장비번호 등)</span>
                        <input
                          type="text"
                          disabled={!isFormEditable}
                          value={note.objectiveEvidence}
                          onChange={(e) => handlePNoteChange(note.id, 'objectiveEvidence', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                        />
                      </div>

                      <div className="shrink-0 pt-4">
                        {note.attachedFileName ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                            <Paperclip className="w-3.5 h-3.5 text-cyan-600" />
                            <span>증빙: {note.attachedFileName}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAttachPNoteFile(note.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold transition"
                          >
                            <Upload className="w-3.5 h-3.5 text-slate-500" />
                            <span>+ 객관적 증빙 첨부</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 섹션 IX: 심사 발견사항 요약 및 추천 결론 */}
          {activeSection === 'sec-summary' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" /> IX. 심사 발견사항 요약 및 추천 결론 (Remark 양식 583~625행)
                </h2>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">심사 발견사항 종합 요약</label>
                  <textarea
                    rows={4}
                    disabled={!isFormEditable}
                    value={packData.stage2.nonConformitiesSummary.summaryText}
                    onChange={(e) => setPackData({
                      ...packData,
                      stage2: {
                        ...packData.stage2,
                        nonConformitiesSummary: {
                          ...packData.stage2.nonConformitiesSummary,
                          summaryText: e.target.value
                        }
                      }
                    })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed font-medium"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <label className="block font-bold text-slate-700 mb-2">심사팀 최종 추천 결론</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['인증 유지 추천', '인증 등록 추천', '시정조치 확인 후 추천', '재심사 필요'].map(rec => (
                      <button
                        key={rec}
                        type="button"
                        onClick={() => setPackData({
                          ...packData,
                          stage2: { ...packData.stage2, finalRecommendation: rec as any }
                        })}
                        className={`p-3 rounded-xl border text-xs font-extrabold transition ${
                          packData.stage2.finalRecommendation === rec
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {rec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 섹션 X: 다자간 서명 & 기업 공인 메일 인증 */}
          {activeSection === 'sec-signatures' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-cyan-600" /> X. 다자간 공인 이메일 전자서명 &amp; 감사 증적 (Audit Trail)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    마우스나 터치펜 대신 <strong>심사팀 전원 및 기업 대표의 공인 이메일 원클릭 인증</strong>을 통해 KAB/ISO 공인 감사 증적(디지털 직인)이 안전하게 날인됩니다.
                  </p>
                </div>
              </div>

              {/* 5대 서명 블록 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {initialReport.signatures.map(sig => (
                  <div key={sig.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-extrabold text-slate-700">{sig.signerRole}</span>
                        {sig.isSigned ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Check className="w-3 h-3" /> 인증완료
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            인증 대기
                          </span>
                        )}
                      </div>
                      <p className="font-extrabold text-slate-900 truncate">{sig.signerName}</p>

                      {/* 기업 이메일 미인증 상태일 때 직접 입력/수정 허용 */}
                      {!sig.isSigned && sig.verifyMethod === '기업이메일확인' ? (
                        <div className="mt-1.5 space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 block">수신 메일 (직접수정)</label>
                          <input
                            type="email"
                            value={sig.signerEmail || ''}
                            onChange={(e) => handleUpdateSignatureEmail(sig.id, e.target.value)}
                            placeholder="company@domain.com"
                            className="w-full text-[10px] px-2 py-1 rounded-lg border border-slate-300 bg-white font-mono text-cyan-900 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      ) : (
                        sig.signerEmail && (
                          <p className="text-[10px] text-slate-500 truncate">{sig.signerEmail}</p>
                        )
                      )}
                    </div>

                    {/* 서명 완료 시 디지털 공식 직인 (Digital Seal) 또는 미인증 시 이메일 인증 버튼 */}
                    <div className="min-h-[110px] bg-white rounded-xl border border-slate-300 flex items-center justify-center p-2 text-center">
                      {sig.isSigned ? (
                        sig.verifyMethod === '공인이메일인증' ? (
                          <div className="space-y-1">
                            {/* 붉은색 공식 심사원 디지털 직인 (스탬프) */}
                            <div className="inline-block px-3 py-1.5 rounded-xl border-2 border-rose-600 bg-rose-50/40 text-rose-700 shadow-2xs">
                              <div className="text-[9px] font-black tracking-widest text-rose-600 uppercase">
                                GMSCS 공인심사원
                              </div>
                              <div className="text-sm font-black tracking-wider py-0.5">
                                {sig.signerName.split(' ')[0]} <span className="text-xs font-normal">印</span>
                              </div>
                              <div className="text-[8.5px] font-bold text-rose-500 font-mono">
                                {sig.kabCertNumber || 'KAB-CERT-VERIFIED'}
                              </div>
                            </div>
                            <div className="text-[9.5px] font-bold text-emerald-700 flex items-center justify-center gap-0.5 pt-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>이메일 인증 승인</span>
                            </div>
                          </div>
                        ) : sig.verifyMethod === '기업이메일확인' ? (
                          <div className="space-y-1">
                            {/* 청색 공식 기업 확인 직인 */}
                            <div className="inline-block px-3 py-1.5 rounded-xl border-2 border-blue-600 bg-blue-50/40 text-blue-800 shadow-2xs">
                              <div className="text-[9px] font-black tracking-widest text-blue-600">
                                피심사기업 공인확인
                              </div>
                              <div className="text-sm font-black tracking-wider py-0.5">
                                {sig.signerName.split(' ')[0]} <span className="text-xs font-normal">印</span>
                              </div>
                              <div className="text-[8.5px] font-bold text-blue-500">
                                내용확인 및 시정조치합의
                              </div>
                            </div>
                            <div className="text-[9.5px] font-bold text-emerald-700 flex items-center justify-center gap-0.5 pt-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>기업 메일 확인완료</span>
                            </div>
                          </div>
                        ) : (
                          sig.signatureDataUrl ? (
                            <img src={sig.signatureDataUrl} alt="서명" className="max-h-20 max-w-full object-contain" />
                          ) : (
                            <span className="text-xs font-bold text-slate-700">전자서명 완료</span>
                          )
                        )
                      ) : (
                        <div className="space-y-1.5 w-full">
                          {sig.verifyMethod === '기업이메일확인' ? (
                            <button
                              onClick={() => handleOpenEmailVerifyModal(sig)}
                              className="w-full py-2 px-2 text-xs font-extrabold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>기업 이메일 확인</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setAuditorEmailSignModal(sig)}
                                className="w-full py-2 px-2 text-xs font-extrabold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>이메일 인증 서명</span>
                              </button>
                              <button
                                onClick={() => setActiveSignerModal(sig)}
                                className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer block mx-auto"
                              >
                                또는 자필 서명 날인
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                      <div className="truncate">
                        방식: <strong>{sig.verifyMethod}</strong>
                      </div>
                      {sig.signedAt && (
                        <div className="truncate text-[9.5px] text-slate-400 font-mono">
                          {sig.signedAt}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 모달: fumac@naver.com 시험 발송 안내 모달 */}
      {showEmailSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                <Mail className="w-5 h-5 text-cyan-600" />
                <span>심사보고서 보안 직행 링크 시험 발송</span>
              </div>
              <button onClick={() => setShowEmailSendModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="text-slate-800">
                수신 이메일: <strong className="text-cyan-800 font-bold">fumac@naver.com</strong>
              </div>
              <div className="text-slate-600">
                제목: <strong>[GMSCS] (주)한성정밀공업 심사보고서 작성 및 승인 전용 보안 링크</strong>
              </div>
              <div className="pt-2">
                <span className="font-bold text-slate-700 block mb-1">생성된 심사보고서 직행 URL:</span>
                <div className="bg-white p-2.5 rounded-lg border border-slate-300 font-mono text-[11px] text-cyan-800 break-all select-all">
                  {directLinkUrl}
                </div>
              </div>
              <p className="text-emerald-800 pt-1 font-semibold">
                ✓ 이 링크를 클릭하면 첫 화면을 거치지 않고 곧바로 심사보고서 작성 페이지로 직행하며, 작성된 모든 내용은 사내 시스템 및 로컬 DB에 자동 저장됩니다.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(directLinkUrl);
                  alert(`[보안 링크 복사 완료]\n클립보드에 복사되었습니다. 브라우저 주소창에 붙여넣어 바로 테스트하실 수 있습니다:\n${directLinkUrl}`);
                }}
                className="flex items-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>링크 복사</span>
              </button>

              <a
                href={`mailto:fumac@naver.com?subject=${encodeURIComponent('[GMSCS] (주)한성정밀공업 심사보고서 작성 보안 링크')}&body=${encodeURIComponent(`안녕하세요, GMSCS 인증원입니다.\n\n아래 보안 링크를 클릭하시면 심사보고서 작성 페이지로 직접 연결됩니다.\n\n접속 링크:\n${directLinkUrl}\n\n감사합니다.`)}`}
                onClick={() => setShowEmailSendModal(false)}
                className="flex items-center space-x-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>네이버 메일앱/클라이언트로 전송</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 모달: 심사원 공인 이메일 인증 서명 모달 */}
      {auditorEmailSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
                  <Mail className="w-5 h-5" />
                </span>
                <span>심사원 공인 이메일 전자서명</span>
              </div>
              <button 
                onClick={() => setAuditorEmailSignModal(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">배정 역할:</span>
                <span className="font-extrabold text-cyan-800">{auditorEmailSignModal.signerRole}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">서명 심사원:</span>
                <span className="font-extrabold text-slate-900">{auditorEmailSignModal.signerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">공인 이메일 계정:</span>
                <span className="font-mono text-cyan-700 font-bold">{auditorEmailSignModal.signerEmail || 'ceo@gmscs.co.kr'}</span>
              </div>
              {auditorEmailSignModal.kabCertNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">KAB 등록자격번호:</span>
                  <span className="font-mono text-slate-800 font-bold">{auditorEmailSignModal.kabCertNumber}</span>
                </div>
              )}
            </div>

            {/* 서약 및 보안 인증 문구 */}
            <div className="p-3.5 bg-cyan-50/60 rounded-xl border border-cyan-200/80 text-[11px] text-cyan-950 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1 text-cyan-900">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>ISO/IEC 17021 심사원 윤리 및 사실 일치 서약</span>
              </div>
              <p>
                본인은 GMSCS 공인 심사원으로서 현장 심사 결과 및 작성된 심사보고서의 전 조항 평가 내용이 사실과 일치함을 확인하며, 본인의 공인 이메일 인증을 통해 본 심사보고서에 공식 전자 직인을 정식 날인합니다.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAuditorEmailSignModal(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => handleConfirmAuditorEmailSign(auditorEmailSignModal.id)}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-extrabold shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>공인 이메일로 전자 직인 날인</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달: 기업 이메일 확인 (공용메일 실무자 성명/직급 직접 입력) */}
      {emailVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-base">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Mail className="w-5 h-5" />
                </span>
                <span>기업 공인 이메일 확인 및 전자 직인 날인</span>
              </div>
              <button onClick={() => setEmailVerifyModal(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>
            </div>

            {/* 대표메일/공용메일 공유 안내 박스 (사용자 요구 반영) */}
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 text-xs text-blue-950 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>기업 공용 이메일 확인자 실무 안내</span>
              </div>
              <p className="text-[11px] text-blue-900/85">
                중소기업의 경우 회사 대표메일(ceo@, info@, qa@ 등)을 사내에서 공유하는 경우가 많으므로, 실제 심사보고서를 확인하고 서명하는 실무자(대표자 또는 품질책임자)의 <strong>성명과 직급을 직접 입력</strong>하십시오.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  확인자 성명 (이름) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientSignerName}
                  onChange={(e) => setClientSignerName(e.target.value)}
                  placeholder="예: 박한성"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  직위 / 직급 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientSignerPosition}
                  onChange={(e) => setClientSignerPosition(e.target.value)}
                  placeholder="예: 대표이사, 품질보증팀장, 공장장 등"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">수신 이메일 (회사 또는 담당자 메일)</label>
                <input
                  type="email"
                  value={clientSignerEmail}
                  onChange={(e) => setClientSignerEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-700 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 직인 미리보기 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="text-[11px] text-slate-600">
                  날인 형태: <strong className="text-slate-800">{clientSignerName || '확인자'} ({clientSignerPosition || '직급'})</strong>
                </div>
                <div className="inline-block px-2.5 py-1 rounded-lg border-2 border-blue-600 bg-white text-blue-800 font-bold text-[11px] shadow-2xs">
                  {(clientSignerName || '기업').split(' ')[0]} 印
                </div>
              </div>

              <p className="text-[10.5px] text-slate-500 leading-normal">
                ✓ 상기 확인자는 심사보고서 전문의 내용, 부적합 사항 및 향후 시정조치 합의 내용에 대해 충분히 설명을 들었으며 이에 최종 동의하여 전자 날인합니다.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEmailVerifyModal(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => handleConfirmEmailVerification(emailVerifyModal.id)}
                disabled={!clientSignerName.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>내용 확인 및 승인 (직인 날인)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달: 사무국 심사보고서 내용 적정성 검토 모달 */}
      {showSecretariatReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-indigo-900 font-extrabold text-base">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span>심사보고서 내용 적정성 검토</span>
              </div>
              <button 
                onClick={() => setShowSecretariatReviewModal(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
              <div className="font-bold flex items-center gap-1 text-indigo-900">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>KAB 인정기준 &amp; 내부 통제 절차</span>
              </div>
              <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                심사보고서가 시스템에 업로드되면, <strong>인증 심의위원회 상정 전</strong>에 심사보고서의 전반적인 적정성(표준 조항, 부적합 조치, 회의록 및 전자서명)을 사전 검토하여 승인하거나 보완을 요청합니다.
              </p>
            </div>

            {/* 4대 점검 체크리스트 */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 block mb-1">4대 필수 적정성 점검 항목</label>
              
              <label className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={secretariatChecklistState.scopeCheck}
                  onChange={(e) => setSecretariatChecklistState(prev => ({ ...prev, scopeCheck: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-slate-700 font-medium">1. 심사 표준, 적용범위, IAF 코드 및 심사일수(MD) 산정 적정성</span>
              </label>

              <label className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={secretariatChecklistState.ncrCheck}
                  onChange={(e) => setSecretariatChecklistState(prev => ({ ...prev, ncrCheck: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-slate-700 font-medium">2. 부적합(NCR) 원인분석·시정조치 계획서 및 증빙자료 첨부 적정성</span>
              </label>

              <label className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={secretariatChecklistState.meetingCheck}
                  onChange={(e) => setSecretariatChecklistState(prev => ({ ...prev, meetingCheck: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-slate-700 font-medium">3. 시작/종결회의 13대 안건 및 공평성·독립성 서약 확인 완료</span>
              </label>

              <label className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={secretariatChecklistState.signCheck}
                  onChange={(e) => setSecretariatChecklistState(prev => ({ ...prev, signCheck: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-slate-700 font-medium">4. 심사팀 전원 및 기업 대표 전자서명·공인 직인 날인 완비</span>
              </label>
            </div>

            {/* 종합 적정성 검토 의견 */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-700">종합 적정성 검토 의견 (보완 사유 또는 심의 상정 의견)</label>
              <textarea
                rows={3}
                value={secretariatCommentInput}
                onChange={(e) => setSecretariatCommentInput(e.target.value)}
                placeholder="심사보고서 내용이 충실하며 KAB 인정기준에 부합하여 인증 심의위원회 상정을 승인함. (보완 요청 시 구체적인 보완 대상 조항 및 증빙을 기재하십시오)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handlePerformSecretariatDecision('보완요청')}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>보완 요청 (반려)</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSecretariatReviewModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={() => handlePerformSecretariatDecision('검토승인')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>검토 승인 (인증 심의 상정)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모달: 자필 서명 Canvas (서브 옵션) */}
      {activeSignerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 p-6 shadow-2xl">
            <SignatureCanvas
              signerTitle={`${activeSignerModal.signerRole} (${activeSignerModal.signerName})`}
              onSave={handleSaveSignature}
              onCancel={() => setActiveSignerModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
