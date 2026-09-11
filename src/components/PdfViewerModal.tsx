import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Shield,
  Mail,
  PenTool,
  Check,
  Calendar,
  Building2,
  Users,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileCheck,
  HelpCircle,
  Clock,
  Send,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Award,
  RefreshCcw,
  CheckSquare
} from 'lucide-react';
import { initialFullReportData, FullAuditReportPackData, ProcessAuditNoteItem } from '../data/mockFullRemarkPack';
import { remarkMeetingAgendas } from '../data/mockRemarkData';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl?: string;
  companyName: string;
  standard?: string;
  auditType?: string;
  auditDate?: string;
}

// 전자메일 서명 레코드
export interface EmailSignatureRecord {
  slotId: string;
  slotLabel: string;
  role: '고객확인' | '근로자대표' | '심사팀장' | '심사팀원' | '확인심사원';
  signerName: string;
  signerPosition: string;
  signerEmail: string;
  signedAt: string; // ISO / YYYY-MM-DD HH:mm:ss
  signatureHash: string;
  isVerified: boolean;
  ipAddress: string;
}

type ReportSectionTab = 
  | 'all'
  | 'cover_agenda'
  | 'schedule_coi'
  | 'stage1'
  | 'stage2'
  | 'audit_note'
  | 'findings_summary'
  | 'three_year_plan'
  | 'ncr_report'
  | 'cert_preview';

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  companyName,
  standard = 'ISO 9001:2015',
  auditType = '정기 사후관리 심사',
  auditDate = '2025-10-15'
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<ReportSectionTab>('all');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 저장된 전자메일 서명 목록 (LocalStorage 연동)
  const storageKey = useMemo(() => `GMSCS_PDF_SIGNATURES_${companyName}_${auditDate}`, [companyName, auditDate]);
  
  const [signatures, setSignatures] = useState<Record<string, EmailSignatureRecord>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    // 기본 사전 서명 (예시 데이터)
    return {
      'cover_customer': {
        slotId: 'cover_customer',
        slotLabel: '고객 확인 (서명)',
        role: '고객확인',
        signerName: '박한성',
        signerPosition: '대표이사',
        signerEmail: 'ceo@k1metal.co.kr',
        signedAt: '2026-09-10 16:30:15',
        signatureHash: 'SIG-EMAIL-89A4-F291',
        isVerified: true,
        ipAddress: '211.234.120.45'
      },
      'cover_worker_rep': {
        slotId: 'cover_worker_rep',
        slotLabel: '근로자 대표 (서명)',
        role: '근로자대표',
        signerName: '최진우',
        signerPosition: '노사협의회 근로자대표 / 생산과장',
        signerEmail: 'worker.rep@k1metal.co.kr',
        signedAt: '2026-09-10 16:35:22',
        signatureHash: 'SIG-EMAIL-C412-88B0',
        isVerified: true,
        ipAddress: '211.234.120.45'
      },
      'cover_lead_auditor': {
        slotId: 'cover_lead_auditor',
        slotLabel: '심사 팀장 (서명)',
        role: '심사팀장',
        signerName: '남경호',
        signerPosition: '선임심사원 / 심사팀장',
        signerEmail: 'auditor.nam@gmscs.co.kr',
        signedAt: '2026-09-10 17:00:00',
        signatureHash: 'SIG-EMAIL-A773-EE19',
        isVerified: true,
        ipAddress: '121.134.88.92'
      },
      'coi_lead_auditor': {
        slotId: 'coi_lead_auditor',
        slotLabel: '이해관계확인 심사팀장 (서명)',
        role: '심사팀장',
        signerName: '남경호',
        signerPosition: '선임심사원 / 심사팀장',
        signerEmail: 'auditor.nam@gmscs.co.kr',
        signedAt: '2026-09-08 09:10:00',
        signatureHash: 'SIG-COI-9921-A1',
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

  // 서명 상태 LocalStorage 동기화
  const handleSaveSignature = (record: EmailSignatureRecord) => {
    setSignatures(prev => {
      const updated = { ...prev, [record.slotId]: record };
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updated));
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
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  if (!isOpen) return null;

  const reportData = initialFullReportData;

  // 서명 컴포넌트 렌더러
  const renderSignatureSlot = (
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
          className="group relative cursor-pointer inline-flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 border border-emerald-300 hover:border-emerald-500 shadow-2xs transition-all text-left min-w-[170px]"
          title="전자메일 서명 검증 완료 (클릭 시 서명 초기화 가능)"
        >
          <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>[전자메일 서명완료]</span>
          </div>
          <div className="text-xs font-extrabold text-slate-900 mt-0.5">
            {signed.signerName} ({signed.signerPosition})
          </div>
          <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
            <Mail className="w-2.5 h-2.5 text-slate-400" />
            <span>{signed.signerEmail}</span>
          </div>
          <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">
            {signed.signedAt} ({signed.signatureHash})
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
            name: defaultName || (role === '심사팀장' ? '남경호' : role === '고객확인' ? '박한성' : ''),
            position: defaultPos || (role === '심사팀장' ? '선임심사원' : role === '고객확인' ? '대표이사' : role === '근로자대표' ? '근로자 대표' : '심사원'),
            email: defaultEmail || (role === '심사팀장' ? 'auditor@gmscs.co.kr' : 'client@company.com'),
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-cyan-500 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-900 text-xs font-semibold hover:shadow-xs transition-all cursor-pointer group"
        title="전자메일 인증을 통해 서명을 진행합니다."
      >
        <PenTool className="w-3.5 h-3.5 text-cyan-700 group-hover:scale-110 transition-transform" />
        <span>{slotLabel}</span>
        <span className="text-[10px] bg-cyan-200/80 text-cyan-900 px-1 py-0.2 rounded font-mono">이메일 인증</span>
      </button>
    );
  };

  const totalSignatureSlots = 8;
  const verifiedCount = Object.values(signatures).filter(s => s.isVerified).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200 no-print-bg">
      <div className={`bg-slate-900 border border-slate-700 rounded-2xl w-full flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-[1550px] h-[95vh]'
      }`}>
        
        {/* ========================================================= */}
        {/* 상단 통합 네비게이션 툴바 */}
        {/* ========================================================= */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base truncate">
                  [공식 심사보고서] {companyName} - {standard}
                </h3>
                <span className="bg-cyan-900/80 text-cyan-300 text-xs px-2 py-0.5 rounded-full border border-cyan-700 font-medium shrink-0">
                  2025 Audit Report Pack 원본 실물 규격
                </span>
              </div>
              <p className="text-slate-400 text-xs truncate mt-0.5">
                심사구분: <span className="text-slate-200 font-medium">{auditType}</span> | 심사일자: <span className="text-slate-200 font-mono">{auditDate}</span> | 인증원: <span className="text-slate-200">GMSCS (지엠에스씨에스)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 서명 상태 배지 */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>전자메일 서명:</span>
              <strong className="text-emerald-400 font-mono font-bold">{verifiedCount}</strong> / {totalSignatureSlots}건 완료
            </div>

            {/* 확대/축소 */}
            <div className="hidden sm:flex items-center bg-slate-700/80 rounded-lg p-0.5 border border-slate-600 text-slate-300 text-xs">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
                className="p-1 hover:text-white hover:bg-slate-600 rounded cursor-pointer"
                title="축소"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
                className="p-1 hover:text-white hover:bg-slate-600 rounded cursor-pointer"
                title="확대"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 인쇄 */}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-semibold rounded-lg transition-colors border border-slate-600 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄 / PDF 저장</span>
            </button>

            {/* 전체화면 전환 */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
              title={isFullscreen ? "창 모드" : "전체 화면"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* 닫기 */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer ml-1"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 서브 섹션 탭 네비게이션 */}
        {/* ========================================================= */}
        <div className="bg-slate-800/60 border-b border-slate-700 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 no-scrollbar">
          {[
            { key: 'all', label: '전체 보고서 (연속 열람)' },
            { key: 'cover_agenda', label: '1. 표지 및 회의안건' },
            { key: 'schedule_coi', label: '2. 심사일정 & 이해관계확인' },
            { key: 'stage1', label: '3. 1단계 문서심사' },
            { key: 'stage2', label: '4. 2단계 현장심사' },
            { key: 'audit_note', label: '5. PROCESS Audit Note' },
            { key: 'findings_summary', label: '6. 심사발견사항 & 총평' },
            { key: 'three_year_plan', label: '7. 3개년 심사계획' },
            { key: 'ncr_report', label: '8. 시정조치요구서 (NCR)' },
            { key: 'cert_preview', label: '9. 인증서 표기확인' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ReportSectionTab)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 메인 A4 PDF 문서 열람 뷰어 영역 (배경 회색 + A4 시트) */}
        {/* ========================================================= */}
        <div className="flex-1 bg-slate-950 p-3 sm:p-6 overflow-y-auto flex flex-col items-center">
          <div 
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-[1100px] transition-transform duration-150 space-y-8 print:w-full print:max-w-none print:transform-none"
          >
            
            {/* ========================================================================= */}
            {/* SECTION 1: [표지 & 기본정보 & 시작/종결 회의 안건]                         */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'cover_agenda') && (
              <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-12 space-y-6">
                
                {/* 1.1 공식 문서 헤더 */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-extrabold tracking-widest text-cyan-900 block font-mono uppercase">
                      ESG with GMSCS · KAB-QC/EC-01
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                      적합성 평가 심사보고서 (1st &amp; 2nd Stage)
                    </h1>
                    <p className="text-xs text-slate-600">
                      국제표준화기구(ISO) 경영시스템 인증심사 기준 및 KAB 적합성평가 기준 준수
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="border-2 border-slate-900 px-3 py-1 text-center rounded">
                      <span className="text-[10px] block font-bold text-slate-600">문서 관리번호</span>
                      <span className="text-xs font-mono font-extrabold text-slate-900">F16-001 (Rev.0)</span>
                    </div>
                  </div>
                </div>

                {/* 1.2 고객 기본 정보 & 서명란 (Table 0, Table 1, Table 2 원본 실물 구현) */}
                <div className="border border-slate-400 text-xs">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="w-28 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">고 객 명</td>
                        <td className="p-2.5 font-semibold text-slate-950 border-r border-slate-300">{companyName}</td>
                        <td className="w-24 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">인증번호</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{reportData.certNumber}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">심 사 표 준</td>
                        <td className="p-2.5 border-r border-slate-300">
                          <span className="font-bold text-cyan-950">{standard}</span>
                          <span className="text-slate-500 ml-2">(ISO 9001 / ISO 14001 / ISO 45001 / ESG-MS)</span>
                        </td>
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">심 사 유 형</td>
                        <td className="p-2.5 font-bold text-emerald-800">{auditType}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">주사업장 주소</td>
                        <td colSpan={3} className="p-2.5 text-slate-900">{reportData.mainSiteAddress}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">추가사업장</td>
                        <td colSpan={3} className="p-2.5 text-slate-900">
                          {reportData.additionalSites.map(s => `${s.siteName}: ${s.address} (${s.scope})`).join(' / ')}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">연락처 / Email</td>
                        <td className="p-2.5 border-r border-slate-300 font-mono">TEL: {reportData.tel} / FAX: {reportData.fax}</td>
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">담당자/직책</td>
                        <td className="p-2.5 text-slate-900">{reportData.contactPerson} ({reportData.contactPosition})</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">인증범위(국문)</td>
                        <td colSpan={3} className="p-2.5 font-medium text-slate-900 leading-relaxed">{reportData.auditScope}</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">인증범위(영문)</td>
                        <td colSpan={3} className="p-2.5 font-mono text-[11px] text-slate-800 leading-relaxed">{reportData.auditScopeEn}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 1.3 [핵심 전자메일 서명란] 고객확인, 근로자대표, 심사팀장 서명 (Table 1 & Table 2) */}
                <div className="bg-slate-50 border-2 border-slate-400 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-cyan-700" />
                      보고서 공식 확인 및 전자메일 서명 날인 (Word 서식 인/서명란)
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      ※ ISO 45001 심사의 경우 근로자 대표 서명 필수
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* 고객 확인 서명 */}
                    <div className="border border-slate-300 bg-white p-3 rounded-lg flex flex-col justify-between space-y-2">
                      <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
                        고객 확인 (대표자/총괄책임)
                      </div>
                      <div className="py-1">
                        {renderSignatureSlot('cover_customer', '고객 확인 (서명)', '고객확인', reportData.ceoName, '대표이사', reportData.email)}
                      </div>
                    </div>

                    {/* 근로자 대표 서명 */}
                    <div className="border border-slate-300 bg-white p-3 rounded-lg flex flex-col justify-between space-y-2">
                      <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
                        근로자 대표 (ISO 45001 안전보건)
                      </div>
                      <div className="py-1">
                        {renderSignatureSlot('cover_worker_rep', '근로자 대표 (서명)', '근로자대표', '최진우', '노사협의회 근로자대표', 'worker.rep@k1metal.co.kr')}
                      </div>
                    </div>

                    {/* 심사 팀장 서명 */}
                    <div className="border border-slate-300 bg-white p-3 rounded-lg flex flex-col justify-between space-y-2">
                      <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
                        심사 팀장 (GMSCS 공인심사원)
                      </div>
                      <div className="py-1">
                        {renderSignatureSlot('cover_lead_auditor', '심사 팀장 (서명)', '심사팀장', '남경호', '선임심사원', 'auditor.nam@gmscs.co.kr')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.4 시작회의 및 종결회의 안건 (Table 16 원본 실물) */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-800" />
                    시작 / 종결회의 공식 안건 및 회의록
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                    <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-1.5">
                      <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 flex justify-between">
                        <span>시작회의 안건 (13개 항목 확인)</span>
                        <span className="text-emerald-700 font-bold">전원 참석 완료</span>
                      </div>
                      <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                        {remarkMeetingAgendas.map((item) => (
                          <li key={item.id}>{item.opening}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-1.5">
                      <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 flex justify-between">
                        <span>종결회의 안건 (11개 항목 확인)</span>
                        <span className="text-emerald-700 font-bold">합의 완료</span>
                      </div>
                      <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                        {remarkMeetingAgendas.filter(item => item.closing && item.closing !== '-').map((item) => (
                          <li key={item.id}>{item.closing}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 2: [심사 세부일정표 & 공평성·이해관계유무 확인서]                    */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'schedule_coi') && (
              <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-12 space-y-6">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="text-lg font-bold text-slate-950">
                    Ⅱ. 심사 세부 일정표 및 공평성·이해관계유무 확인서
                  </h3>
                  <p className="text-xs text-slate-500">
                    공평성보장 절차(GSP-02) 준수 서약 및 프로세스별 세부 심사 배정
                  </p>
                </div>

                {/* 2.1 세부 일정표 (Table 17) */}
                <div className="border border-slate-300 text-xs">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300 w-24 text-center">일자</th>
                        <th className="p-2 border-r border-slate-300 w-28 text-center">시각</th>
                        <th className="p-2 border-r border-slate-300">심사 프로세스 / 조항</th>
                        <th className="p-2 border-r border-slate-300 w-32">대상 부서</th>
                        <th className="p-2 w-28 text-center">담당 심사원</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td rowSpan={3} className="p-2 border-r border-slate-300 text-center font-mono font-bold bg-slate-50">1일차</td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">09:30 ~ 10:30</td>
                        <td className="p-2 border-r border-slate-300">시작회의 / 최고경영자 면담 / 경영방침 및 조직상황(4, 5절)</td>
                        <td className="p-2 border-r border-slate-300 font-medium">대표이사실 / 기획팀</td>
                        <td className="p-2 text-center font-bold text-slate-800">남경호 (팀장)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">10:30 ~ 12:30</td>
                        <td className="p-2 border-r border-slate-300">리스크 및 기회조치(6절), 환경측면평가, 안전보건 위험성평가</td>
                        <td className="p-2 border-r border-slate-300 font-medium">품질혁신팀 / 환경안전</td>
                        <td className="p-2 text-center font-bold text-slate-800">남경호 (팀장)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">13:30 ~ 17:30</td>
                        <td className="p-2 border-r border-slate-300">자원관리, 적격성, 문서화된 정보(7절), 설계 및 개발(8.3)</td>
                        <td className="p-2 border-r border-slate-300 font-medium">연구소 / 인사총무팀</td>
                        <td className="p-2 text-center font-bold text-slate-800">정현일 (심사원)</td>
                      </tr>
                      <tr>
                        <td rowSpan={2} className="p-2 border-r border-slate-300 text-center font-mono font-bold bg-slate-50">2일차</td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">09:00 ~ 15:30</td>
                        <td className="p-2 border-r border-slate-300">제조/서비스 운영관리(8.5), 설비보전, 유해물질/폐기물관리, 비상대응</td>
                        <td className="p-2 border-r border-slate-300 font-medium">생산팀 (제1·제2공장)</td>
                        <td className="p-2 text-center font-bold text-slate-800">남경호 / 정현일</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">15:30 ~ 17:30</td>
                        <td className="p-2 border-r border-slate-300">성과평가, 내부심사, 경영검토(9절), 시정조치(10절), 종결회의</td>
                        <td className="p-2 border-r border-slate-300 font-medium">경영진 / 전 부서</td>
                        <td className="p-2 text-center font-bold text-slate-800">심사팀 전원</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2.2 이해관계유무 확인서 (공평성 보장 서약) & 서명 */}
                <div className="bg-amber-50/50 border border-amber-300 rounded-xl p-5 space-y-3 text-xs">
                  <div className="font-extrabold text-slate-900 border-b border-amber-200 pb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-800" />
                      이해관계유무 확인서 (공평성 보장 절차 준수 서약)
                    </span>
                    <span className="text-[10.5px] font-mono text-amber-900">GMSCS-GSP-02</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    심사팀은 상기 업무를 수행함에 있어 인증원의 공정성 및 신뢰성에 위배되지 않도록 다음 사항을 준수하였으며, 만약 해당사항을 위반했을 경우 심사원 상벌규정에 따라 어떠한 처벌도 감수할 것을 확인합니다.
                    <br />
                    1. 본인은 상기 조직에 대하여 어떠한 자문행위를 제공하지 않았음을 확인합니다.
                    <br />
                    2. 최근 2년 내 재직, 주식 3% 이상 소유, 생산 제품의 공급/구매 관계, 경영진과의 학연/지연/친인척 관계 등 이해관계가 없음을 확인합니다.
                    <br />
                    3. 인증원의 “공평성보장 절차(GSP-02)”의 관련 규정을 준수하겠습니다.
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                    <span className="font-mono text-slate-700">작성일자: {auditDate}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">심사팀장:</span>
                      {renderSignatureSlot('coi_lead_auditor', '심사팀장 (서명)', '심사팀장', '남경호', '선임심사원', 'auditor.nam@gmscs.co.kr')}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 3: [1단계 문서심사 보고서 (1st Stage Audit Report)]                 */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'stage1') && (
              <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-12 space-y-6">
                <div className="border-b border-slate-300 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      Ⅲ. 적합성 평가 심사보고서 (1단계 문서심사 - 1st Stage)
                    </h3>
                    <p className="text-xs text-slate-500">
                      경영시스템 문서화 정보, 조직 상황, 2단계 준비상태 및 법적 요구사항 검토
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-300">
                    1단계 적합 판정 (2단계 진행 가능)
                  </span>
                </div>

                {/* 3.1 공통 심사 내역 (Table 5) */}
                <div className="border border-slate-300 text-xs">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300 w-12 text-center">No</th>
                        <th className="p-2 border-r border-slate-300">1단계 공통 심사 점검 항목</th>
                        <th className="p-2 w-28 text-center">심사결과</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">1</td>
                        <td className="p-2 border-r border-slate-300">신청서와 설문서 상의 차이가 있는가? (사업장 위치, 인원 등)</td>
                        <td className="p-2 text-center font-bold text-emerald-800">없음 (일치)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">2</td>
                        <td className="p-2 border-r border-slate-300">
                          경영시스템 매뉴얼/프로세스 제개정 상태:
                          <span className="font-mono text-slate-700 ml-1">HS-QM-01 (Rev.4, 2026-01-10)</span>
                        </td>
                        <td className="p-2 text-center font-bold text-emerald-800">적합</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">3</td>
                        <td className="p-2 border-r border-slate-300">
                          적용제외 항목 및 타당성 근거(ISO 9001):
                          <span className="text-slate-700 ml-1">8.3 설계개발 (고객도면 주문생산에 따른 정당한 제외)</span>
                        </td>
                        <td className="p-2 text-center font-bold text-emerald-800">타당함</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">4</td>
                        <td className="p-2 border-r border-slate-300">내부심사 및 경영검토가 계획/실시되었는가?</td>
                        <td className="p-2 text-center font-bold text-emerald-800">실시 완료</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">5</td>
                        <td className="p-2 border-r border-slate-300">최근 3년 내 법규 위반 사항이 있는가?</td>
                        <td className="p-2 text-center font-bold text-emerald-800">없음</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3.2 ISO 14001, 45001, ESG-MS 규격별 세부 심사 내역 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2">
                    <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 text-emerald-800">
                      ISO 14001 (환경경영)
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      <li>• 환경배출시설 설치신고 완료 (화성시)</li>
                      <li>• 환경영향평가 및 중대측면 파악 완료</li>
                      <li>• 준수의무 평가 실시 (적합)</li>
                      <li>• 환경관리자: <strong>이성훈 대리 선임</strong></li>
                    </ul>
                  </div>

                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2">
                    <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 text-blue-800">
                      ISO 45001 (안전보건경영)
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      <li>• 안전보건총괄책임자: <strong>박한성 대표</strong></li>
                      <li>• 근로자 대표 참여: <strong>최진우 과장</strong></li>
                      <li>• 정기 위험성평가 실시 완료 (유해위험 3건)</li>
                      <li>• 보건관리: 대한산업보건협회 위탁</li>
                    </ul>
                  </div>

                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2">
                    <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 text-purple-800">
                      통합경영시스템 (IMS)
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      <li>• 매뉴얼 및 절차서 통합: <strong>예</strong></li>
                      <li>• 내부심사 및 경영검토 통합: <strong>예</strong></li>
                      <li>• 프로세스 접근 통합성: <strong>예</strong></li>
                      <li>• 통합 수준 평가: <strong>높음 (95%)</strong></li>
                    </ul>
                  </div>
                </div>

                {/* 3.3 1단계 심사 결론 (Table 12) */}
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-950 block">1단계 심사 결론:</span>
                    <span className="text-emerald-900 mt-0.5 block">
                      ✔ 중대한 부적합이 발견되지 않아 계획된 일정대로 2단계 현장심사로 진행 가능합니다.
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs">
                    2단계 진행 승인
                  </span>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 4: [2단계 현장심사 보고서 (2nd Stage Audit Report)]                 */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'stage2') && (
              <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-12 space-y-6">
                <div className="border-b border-slate-300 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      Ⅳ. 적합성 평가 심사보고서 (2단계 현장심사 - 2nd Stage)
                    </h3>
                    <p className="text-xs text-slate-500">
                      표준 요구사항에 대한 현장 실행 증거 검증, 프로세스 성과 모니터링 및 인증 유지 평가
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full border border-blue-300">
                    인증 유지 및 추천 판정
                  </span>
                </div>

                {/* 4.1 2단계 공통 심사 내역 (Table 19) */}
                <div className="border border-slate-300 text-xs">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300 w-12 text-center">No</th>
                        <th className="p-2 border-r border-slate-300">2단계 현장 심사 확인 사항</th>
                        <th className="p-2 w-28 text-center">적합 여부</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">1</td>
                        <td className="p-2 border-r border-slate-300">구축된 시스템이 정해진 절차와 방법에 의거 적절히 시행/유지되고 있는가?</td>
                        <td className="p-2 text-center font-bold text-emerald-800">적합</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">2</td>
                        <td className="p-2 border-r border-slate-300">주요 성과 및 세부목표 대비 성과의 모니터링, 측정, 보고, 검토(리스크와 기회 반영)</td>
                        <td className="p-2 text-center font-bold text-emerald-800">적합</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">3</td>
                        <td className="p-2 border-r border-slate-300">지속적 개선을 위한 조치 및 부적합 재발방지대책의 효과성</td>
                        <td className="p-2 text-center font-bold text-emerald-800">적합</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">4</td>
                        <td className="p-2 border-r border-slate-300">인증마크 및 인정마크(KAB) 사용의 적절성 (홍보물, 명함 등)</td>
                        <td className="p-2 text-center font-bold text-emerald-800">적합</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">5</td>
                        <td className="p-2 border-r border-slate-300">법적, 규제적 요구사항의 지속적 준수 및 법규위반 여부</td>
                        <td className="p-2 text-center font-bold text-emerald-800">준수 확인</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 5: [PROCESS Audit Note (조항 4~10 요구사항별 세부 심사기록)]          */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'audit_note') && (
              <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-12 space-y-6">
                <div className="border-b border-slate-300 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      Ⅴ. PROCESS Audit Note (프로세스별 세부 심사기록 및 객관적 증거)
                    </h3>
                    <p className="text-xs text-slate-500">
                      조항 4(조직상황) ~ 10(개선)에 대한 프로세스별 현장 실사 기록 및 실행 증빙
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    심사원: 남경호, 정현일
                  </span>
                </div>

                {/* Audit Note 카드 리스트 */}
                <div className="space-y-4">
                  {reportData.stage2.processNotes.map((note) => (
                    <div key={note.id} className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                      <div className="bg-slate-100 p-2.5 font-bold text-slate-900 border-b border-slate-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[11px] font-mono">
                            {note.clauseNumber}
                          </span>
                          <span>{note.clauseTitle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-600">대상: <strong>{note.targetProcessDept}</strong></span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-600">심사원: <strong>{note.auditorName}</strong></span>
                          <span className="text-slate-300">|</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            note.result === '적합' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {note.result}
                          </span>
                        </div>
                      </div>
                      <div className="p-3.5 space-y-2 bg-white">
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px] text-slate-500 mb-0.5">구체적 심사 확인 내용 (실행기록/일자/면담):</span>
                          <p className="text-slate-900 leading-relaxed">{note.detailedFindings}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600">
                            <strong>객관적 증거(Objective Evidence):</strong> {note.objectiveEvidence}
                          </span>
                          {note.attachedFileName && (
                            <span className="inline-flex items-center gap-1 text-cyan-800 font-mono">
                              <FileCheck className="w-3.5 h-3.5" />
                              {note.attachedFileName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 6: [심사 발견사항 요약 & 심사총평 & 최종 심사결론]                    */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'findings_summary') && (
              <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-12 space-y-6">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="text-lg font-bold text-slate-950">
                    Ⅵ. 심사 발견사항 요약 및 심사총평 / 결론
                  </h3>
                  <p className="text-xs text-slate-500">
                    부적합 사항 집계, 시정조치 요구 및 인증추천 종합 의견
                  </p>
                </div>

                {/* 6.1 부적합 집계표 (Table 24) */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="border border-slate-300 p-4 rounded-xl bg-slate-50">
                    <span className="text-xs font-bold text-slate-600 block">중부적합 (Major)</span>
                    <span className="text-2xl font-mono font-extrabold text-slate-400 mt-1 block">0 건</span>
                    <span className="text-[10.5px] text-slate-400 mt-0.5 block">재심사 사유 없음</span>
                  </div>
                  <div className="border border-slate-300 p-4 rounded-xl bg-slate-50">
                    <span className="text-xs font-bold text-slate-600 block">경부적합 (Minor)</span>
                    <span className="text-2xl font-mono font-extrabold text-slate-400 mt-1 block">0 건</span>
                    <span className="text-[10.5px] text-slate-400 mt-0.5 block">1개월 이내 시정조치</span>
                  </div>
                  <div className="border border-amber-300 p-4 rounded-xl bg-amber-50">
                    <span className="text-xs font-bold text-amber-800 block">관찰사항 (Observation)</span>
                    <span className="text-2xl font-mono font-extrabold text-amber-900 mt-1 block">1 건</span>
                    <span className="text-[10.5px] text-amber-800 mt-0.5 block">차기 심사 시 개선 권고</span>
                  </div>
                </div>

                {/* 6.2 심사 총평 (우수한 점 포함) */}
                <div className="border border-slate-300 rounded-xl p-5 bg-slate-50 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    심사 총평 및 우수한 점 (Audit Summary)
                  </h4>
                  <p className="text-slate-800 leading-relaxed">
                    1. 최고경영자의 품질 및 환경경영시스템에 대한 추진 의지가 매우 확고하며, 전사 MES 시스템과의 연동을 통한 실시간 공정 데이터 추적 체계가 매우 우수하게 운영되고 있음.
                    <br />
                    2. 2026년 전기차 부품 전환에 대응한 공정 레이아웃 개선 및 작업자 적격성 교육이 체계적으로 수립되어 있음.
                    <br />
                    3. 환경/안전 법규 준수 평가가 성실히 이행되고 있으며 노사 협력 기반의 안전보건 활동이 정착되어 있음.
                  </p>
                </div>

                {/* 6.3 최종 심사 결론 */}
                <div className="p-5 bg-cyan-900 text-white rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider font-mono">
                      FINAL AUDIT RECOMMENDATION
                    </span>
                    <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-full">
                      인증 유지 추천 (Recommendation)
                    </span>
                  </div>
                  <h4 className="text-base font-bold">
                    본 심사팀은 (주)한성정밀공업의 {standard} 경영시스템이 규격 요구사항을 충족하고 효과적으로 유지되고 있음을 확인하였으므로 [인증 유지]를 KAB 인증위원회에 추천합니다.
                  </h4>
                  <div className="pt-2 border-t border-cyan-800 flex items-center justify-between text-xs text-cyan-300">
                    <span>심사팀장: <strong>남경호 선임심사원</strong></span>
                    <span>차기 심사 예정: <strong>2027년 10월 (3차 사후관리)</strong></span>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 7: [3년 주기 심사계획 (3-Year Cycle Plan)]                         */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'three_year_plan') && (
              <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-12 space-y-6">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="text-lg font-bold text-slate-950">
                    Ⅶ. 3개년 심사 주기 계획표 (3-Year Audit Cycle Plan)
                  </h3>
                  <p className="text-xs text-slate-500">
                    인증 주기(3년) 동안 모든 규격 조항이 누락 없이 심사되도록 수립된 중장기 계획 (Table 32)
                  </p>
                </div>

                <div className="border border-slate-300 text-xs">
                  <table className="w-full border-collapse text-center">
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300 text-left w-48">ISO 요구사항 (조항)</th>
                        <th className="p-2 border-r border-slate-300 w-28">최초/갱신 심사</th>
                        <th className="p-2 border-r border-slate-300 w-28">1차 사후 (2025)</th>
                        <th className="p-2 border-r border-slate-300 w-28 bg-cyan-50 text-cyan-950 font-extrabold">2차 사후 (금회)</th>
                        <th className="p-2 w-28">갱신 심사 (2027)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-left font-medium">4. 조직 상황</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 bg-cyan-50 font-bold text-cyan-900">● (완료)</td>
                        <td className="p-2 font-bold text-slate-700">●</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-left font-medium">5. 리더십 및 방침</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 bg-cyan-50 font-bold text-cyan-900">● (완료)</td>
                        <td className="p-2 font-bold text-slate-700">●</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-left font-medium">6. 기획 (리스크/기회)</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">○</td>
                        <td className="p-2 border-r border-slate-300 bg-cyan-50 font-bold text-cyan-900">● (완료)</td>
                        <td className="p-2 font-bold text-slate-700">●</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-left font-medium">7. 지원 (자원/적격성)</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 bg-cyan-50 font-bold text-cyan-900">● (완료)</td>
                        <td className="p-2 font-bold text-slate-700">●</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-left font-medium">8. 운용 (생산/서비스)</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 bg-cyan-50 font-bold text-cyan-900">● (완료)</td>
                        <td className="p-2 font-bold text-slate-700">●</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-left font-medium">9. 성과평가 (내부심사/경영검토)</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 bg-cyan-50 font-bold text-cyan-900">● (완료)</td>
                        <td className="p-2 font-bold text-slate-700">●</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-left font-medium">10. 개선 (시정조치)</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-700">●</td>
                        <td className="p-2 border-r border-slate-300 bg-cyan-50 font-bold text-cyan-900">● (완료)</td>
                        <td className="p-2 font-bold text-slate-700">●</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 8: [시정조치 요구서 (NCR - Non-Conformity Report)]                  */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'ncr_report') && (
              <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-12 space-y-6">
                <div className="border-b border-slate-300 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      Ⅷ. 시정조치 요구서 (NCR - Non-Conformity Report)
                    </h3>
                    <p className="text-xs text-slate-500">
                      심사 중 발견된 부적합 사항, 4M 원인분석, 재발방지대책 및 심사원 조치확인 (Table 33)
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    발행번호: NCR-2026-01
                  </span>
                </div>

                <div className="border border-slate-400 text-xs">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="w-28 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">적 용 표 준</td>
                        <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-300">{standard} (조항: 7.1.5)</td>
                        <td className="w-24 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">부적합 등급</td>
                        <td className="p-2.5 font-bold text-amber-800">관찰사항 (Observation)</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">심 사 부 서</td>
                        <td className="p-2.5 border-r border-slate-300 text-slate-900">품질관리팀 (검사구역)</td>
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">발행 일자</td>
                        <td className="p-2.5 font-mono text-slate-900">{auditDate}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">부적합 사실</td>
                        <td colSpan={3} className="p-3 text-slate-900 leading-relaxed">
                          제2공장 정밀 가공라인의 버니어 캘리퍼스(관리번호: QC-CAL-08)의 교정 유효기간이 2026년 9월 5일로 도래하였으나 교정 의뢰가 지연되어 사용 중인 상태가 식별됨.
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">원인 분석(4M)</td>
                        <td colSpan={3} className="p-3 text-slate-900 leading-relaxed">
                          [Method] 계측기 교정주기 알림 대장이 엑셀 수동관리로 되어 있어 월초 알림 확인 누락 발생.
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">재발방지대책</td>
                        <td colSpan={3} className="p-3 text-slate-900 leading-relaxed">
                          1. 해당 캘리퍼스 즉시 한국계측기연구원에 공인교정 의뢰 및 합격성적서 수령 (2026-09-09 완료)
                          <br />
                          2. 사내 ERP 계측기 관리 모듈에 만료 30일 전 자동 이메일 통보 시스템 구축
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* NCR 전자메일 서명란 */}
                <div className="border border-slate-300 bg-slate-50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">인증고객 확인 서명:</span>
                    {renderSignatureSlot('ncr_customer', '고객 확인 (서명)', '고객확인', reportData.contactPerson, '품질혁신팀장', reportData.email)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">조치확인 심사원 서명:</span>
                    {renderSignatureSlot('ncr_auditor', '심사원 확인 (서명)', '심사팀장', '남경호', '선임심사원', 'auditor.nam@gmscs.co.kr')}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 9: [인증서 표기사항 사전 확인서 (국/영문 인증범위·사업장)]            */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'cert_preview') && (
              <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-12 space-y-6">
                <div className="border-b border-slate-300 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      Ⅸ. 인증서 표기사항 사전 확인서 (국/영문 상호·인증범위)
                    </h3>
                    <p className="text-xs text-slate-500">
                      인증서에 표기될 기업명, 사업장 주소, 인증범위의 국/영문 정확성을 확인하고 서명합니다. (Table 29)
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-bold text-xs rounded-full border border-purple-300">
                    국/영문 일치 확인
                  </span>
                </div>

                <div className="border border-slate-400 text-xs">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="w-28 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">고객명 (국문)</td>
                        <td className="p-2.5 font-bold text-slate-950 border-r border-slate-300">{companyName}</td>
                        <td className="w-28 bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">고객명 (영문)</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{reportData.companyNameEn}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">사업장 주소 (국문)</td>
                        <td colSpan={3} className="p-2.5 text-slate-900">{reportData.mainSiteAddress}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">사업장 주소 (영문)</td>
                        <td colSpan={3} className="p-2.5 font-mono text-[11px] text-slate-800">{reportData.mainSiteAddressEn}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">인증범위 (국문)</td>
                        <td colSpan={3} className="p-2.5 font-medium text-slate-900 leading-relaxed">{reportData.auditScope}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">인증범위 (영문)</td>
                        <td colSpan={3} className="p-2.5 font-mono text-[11px] text-slate-800 leading-relaxed">{reportData.auditScopeEn}</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 p-2.5 font-bold text-slate-800 border-r border-slate-300">확인 결과</td>
                        <td colSpan={3} className="p-2.5 font-bold text-emerald-800">
                          ✔ 1단계 심사 시 확인된 내용과 일치하며, 인증서에 그대로 발행함에 동의함.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 인증서 표기 확인 전자메일 서명란 */}
                <div className="border border-slate-300 bg-slate-50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">고객 확인 서명:</span>
                    {renderSignatureSlot('cert_customer', '고객 확인 (서명)', '고객확인', reportData.ceoName, '대표이사', reportData.email)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">심사팀장 확인 서명:</span>
                    {renderSignatureSlot('cert_lead_auditor', '심사팀장 확인 (서명)', '심사팀장', '남경호', '선임심사원', 'auditor.nam@gmscs.co.kr')}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* ========================================================= */}
        {/* 하단 통합 상태바 */}
        {/* ========================================================= */}
        <div className="bg-slate-800/90 border-t border-slate-700 px-5 py-2.5 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            GMSCS ISO/ESG 인증 공인 심사보고서 · 전자메일 서명 인증 시스템 가동 중
          </span>
          <span className="font-mono text-[11px]">
            보관 식별자: [GMSCS-REP]_{companyName}_{standard}_{auditDate}.pdf
          </span>
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
