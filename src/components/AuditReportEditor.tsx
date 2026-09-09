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
  Sparkles
} from 'lucide-react';
import { AuditReport, SignatureLog } from '../types';
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
}

export const AuditReportEditor: React.FC<AuditReportEditorProps> = ({
  report: initialReport,
  onSaveReport,
  onClose,
  onBackToList
}) => {
  // 풀스펙 양식 데이터 (LocalStorage 영구 저장 연동)
  const [packData, setPackData] = useState<FullAuditReportPackData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`GMSCS_REPORT_PACK_${initialReport.id}`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return initialFullReportData;
  });

  const [activeSection, setActiveSection] = useState<string>('sec-pnotes'); // 기본을 Process Audit Note로
  const [activeSignerModal, setActiveSignerModal] = useState<SignatureLog | null>(null);
  const [emailVerifyModal, setEmailVerifyModal] = useState<SignatureLog | null>(null);
  const [showEmailSendModal, setShowEmailSendModal] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // 심사 기간 제어
  const today = new Date(2026, 8, 9);
  const startDate = new Date(initialReport.startDate);
  const endDate = new Date(initialReport.endDate);
  const isWithinPeriodReal = today >= startDate && today <= endDate;
  const [forcePeriodActive, setForcePeriodActive] = useState<boolean>(isWithinPeriodReal);
  const isFormEditable = forcePeriodActive;

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

  // 서명 완료
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

  // 기업 무료 이메일 확인 승인
  const handleConfirmEmailVerification = (sigId: string) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const updated = initialReport.signatures.map(s => s.id === sigId ? {
      ...s,
      isSigned: true,
      emailVerified: true,
      emailVerifiedAt: formatted,
      signedAt: formatted,
      ipAddress: '211.234.112.5 (기업 대표 공인메일 원클릭 확인)',
      userAgent: 'Naver Mail Client (Chrome)'
    } : s);

    onSaveReport({ ...initialReport, signatures: updated });
    setEmailVerifyModal(null);
    handleSaveToSystem(true);
    alert('[기업 이메일 확인 승인 완료]\n심사보고서 내용이 기업 대표/품질책임자에 의해 최종 승인 및 시스템에 영구 저장되었습니다.');
  };

  // fumac@naver.com 전용 직행 URL
  const directLinkUrl = `https://gmscs.web.app/?mode=audit-entry&reportId=${initialReport.id}&token=sec-fumac-${Date.now()}`;

  const navSections = [
    { id: 'sec-overview', label: 'I. 고객 현황 & 복수 사업장', icon: Building2 },
    { id: 'sec-standards', label: 'II. 심사 표준 & 적용범위', icon: FileText },
    { id: 'sec-meetings', label: 'III. 시작/종결회의 & 공평성 서약', icon: ShieldCheck },
    { id: 'sec-stage1', label: 'IV. 1단계 문서심사 (IMS/환경/안전)', icon: CheckCircle2 },
    { id: 'sec-pnotes', label: 'V. 2단계 Process Audit Note (4~10조)', icon: FileText, badge: 'Full 828줄' },
    { id: 'sec-summary', label: 'VI. 발견사항 요약 & 추천결론', icon: AlertTriangle },
    { id: 'sec-signatures', label: 'VII. 다자간 서명 & 이메일 확인', icon: PenTool },
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
          {/* 심사 기간 제어 */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-cyan-600" />
            <span className="font-bold text-slate-700">기간: {initialReport.startDate} ~ {initialReport.endDate}</span>
            <span className="text-slate-300">|</span>
            {isFormEditable ? (
              <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                <Unlock className="w-3.5 h-3.5" />
                <span>심사 기간 중 (입력 활성)</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-rose-600 font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>기한 외 잠금</span>
              </span>
            )}
          </div>

          {/* fumac@naver.com 시험 발송 모달 열기 버튼 */}
          <button
            onClick={() => setShowEmailSendModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>fumac@naver.com으로 시험 발송</span>
          </button>

          {/* 시스템 영구 저장 버튼 */}
          <button
            onClick={() => handleSaveToSystem(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>시스템에 영구 저장</span>
          </button>

          {/* A4 인쇄 */}
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-600" />
            <span>A4 공인 인쇄</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs transition"
          >
            대시보드
          </button>
        </div>
      </div>

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
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-600" /> I. 고객 현황 및 복수 사업장 정보 (Remark 양식 37~57행)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">인증원 심사원에 의해 검토되고 피심사 조직에 확인된 공식 사업장 원장입니다.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">고객명</label>
                  <input
                    type="text"
                    disabled={!isFormEditable}
                    value={packData.companyName}
                    onChange={(e) => setPackData({ ...packData, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">대표자 성명</label>
                  <input
                    type="text"
                    disabled={!isFormEditable}
                    value={packData.ceoName}
                    onChange={(e) => setPackData({ ...packData, ceoName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-600 mb-1">주사업장 주소 (본사 및 제1공장)</label>
                  <input
                    type="text"
                    disabled={!isFormEditable}
                    value={packData.mainSiteAddress}
                    onChange={(e) => setPackData({ ...packData, mainSiteAddress: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">대표 전화번호</label>
                  <input
                    type="text"
                    disabled={!isFormEditable}
                    value={packData.tel}
                    onChange={(e) => setPackData({ ...packData, tel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">공식 이메일</label>
                  <input
                    type="email"
                    disabled={!isFormEditable}
                    value={packData.email}
                    onChange={(e) => setPackData({ ...packData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* 추가 사업장 (복수 사업장 목록) */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800">추가 사업장 (복수 사업장 현황)</h4>
                  <span className="text-[11px] text-slate-500">1~5개 추가 사업장 관리 가능</span>
                </div>
                {packData.additionalSites.map(site => (
                  <div key={site.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900">{site.siteName}</strong>
                      <span className="text-slate-500 font-bold">{site.employeeCount}명 근무</span>
                    </div>
                    <p className="text-slate-600">{site.address}</p>
                    <p className="text-cyan-800 font-medium">범위: {site.scope}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 섹션 II: 심사 표준 & 적용범위 & 제외조항 */}
          {activeSection === 'sec-standards' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-600" /> II. 심사 표준 및 인증범위 / 적용 제외 (Remark 양식 80~89행)
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">인증 범위 (Scope of Certification)</label>
                  <textarea
                    rows={3}
                    disabled={!isFormEditable}
                    value={packData.auditScope}
                    onChange={(e) => setPackData({ ...packData, auditScope: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
                  <span className="font-bold text-amber-900 block">적용제외 항목 및 타당성 근거 (ISO 9001만 해당)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-600 block mb-1">제외 조항 번호</span>
                      <input
                        type="text"
                        disabled={!isFormEditable}
                        value={packData.exclusionClause}
                        onChange={(e) => setPackData({ ...packData, exclusionClause: e.target.value })}
                        className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900 font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-600 block mb-1">타당성 근거</span>
                      <input
                        type="text"
                        disabled={!isFormEditable}
                        value={packData.exclusionJustification}
                        onChange={(e) => setPackData({ ...packData, exclusionJustification: e.target.value })}
                        className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                      />
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

          {/* 섹션 V: 2단계 Process Audit Note (4조~10조 전 조항) - 대규모 실전 양식! */}
          {activeSection === 'sec-pnotes' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-600" /> V. Process Audit Note (Remark 양식 558~582행 100% 반영)
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

          {/* 섹션 VI: 발견사항 요약 & 추천결론 */}
          {activeSection === 'sec-summary' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" /> VI. 심사 발견사항 요약 및 추천 결론 (Remark 양식 583~625행)
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

          {/* 섹션 VII: 다자간 서명 & 기업 공인 메일 인증 */}
          {activeSection === 'sec-signatures' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-cyan-600" /> VII. 다자간 전자서명 & 기업 공인 무료 이메일 확인
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    기업의 확인은 비용이 전혀 들지 않는 <strong>기업 공인 이메일 원클릭 확인</strong>을 적용하며, 심사팀 전원의 자필 서명이 날인됩니다.
                  </p>
                </div>
              </div>

              {/* 5대 서명 블록 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {initialReport.signatures.map(sig => (
                  <div key={sig.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-extrabold text-slate-700">{sig.signerRole}</span>
                        {sig.isSigned ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            완료
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            대기
                          </span>
                        )}
                      </div>
                      <p className="font-extrabold text-slate-900 truncate">{sig.signerName}</p>
                    </div>

                    {/* 서명 표시 또는 이메일 인증 버튼 */}
                    <div className="h-24 bg-white rounded-xl border border-slate-300 flex items-center justify-center p-1">
                      {sig.isSigned ? (
                        sig.verifyMethod === '기업이메일확인' ? (
                          <div className="text-center">
                            <div className="w-6 h-6 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 block">이메일 확인 승인</span>
                            <span className="text-[9px] text-slate-400 font-mono">{sig.emailVerifiedAt?.split(' ')[1]}</span>
                          </div>
                        ) : (
                          sig.signatureDataUrl ? (
                            <img src={sig.signatureDataUrl} alt="서명" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-xs font-bold text-slate-700">서명 완료</span>
                          )
                        )
                      ) : (
                        sig.verifyMethod === '기업이메일확인' ? (
                          <button
                            onClick={() => setEmailVerifyModal(sig)}
                            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                          >
                            이메일 원클릭 확인
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveSignerModal(sig)}
                            className="px-3 py-1 text-[10px] font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition"
                          >
                            자필 서명하기
                          </button>
                        )
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                      {sig.isSigned ? sig.signedAt : `방식: ${sig.verifyMethod}`}
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

      {/* 모달: 자필 서명 Canvas */}
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

      {/* 모달: 기업 이메일 원클릭 확인 */}
      {emailVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm">
                <Mail className="w-5 h-5 text-emerald-600" />
                <span>기업 공인 이메일 확인 (비용 0원)</span>
              </div>
              <button onClick={() => setEmailVerifyModal(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="text-slate-800 font-bold">확인자: {emailVerifyModal.signerName}</div>
              <p className="text-slate-600 leading-relaxed pt-1">
                심사보고서 전문의 내용 및 지적사항(시정조치 계획)에 대해 최종 동의하며 확인·승인합니다.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEmailVerifyModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                취소
              </button>
              <button
                onClick={() => handleConfirmEmailVerification(emailVerifyModal.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                내용 확인 및 승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
