import React, { useState, useMemo } from 'react';
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
  X
} from 'lucide-react';
import type { Company, Auditor, AuditReport, AuditContractRecord, ProofDocument, CompanyEhsCompliance } from '../types';

// ============================================================
// 심사보고서 워크벤치 (2.5 : 7.5 분할 + 4대 인덱스 탭)
// Remark 2025 Audit Report Pack(251001).docx 실물 양식 기반
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

// 과거 심사보고서 목록 (DB 전체 보유분 모의)
const mockPastReports = [
  { id: 'past-1', label: '2026-06 2차 사후관리 심사보고서', date: '2026-06-20', type: '사후2차', fileUrl: '#' },
  { id: 'past-2', label: '2025-10 1차 사후관리 심사보고서', date: '2025-10-15', type: '사후1차', fileUrl: '#' },
  { id: 'past-3', label: '2024-10 최초 심사보고서 (1-2단계)', date: '2024-10-24', type: '최초', fileUrl: '#' },
  { id: 'past-4', label: '2024-10 전환 심사자료', date: '2024-10-20', type: '전환', fileUrl: '#' },
  { id: 'past-5', label: '2023-09 타인증원 갱신심사 보고서', date: '2023-09-12', type: '갱신', fileUrl: '#' },
];

// 초기 증빙 서류 목록
const initialProofDocs: ProofDocument[] = [
  { docType: '사업자등록증', uploaded: false },
  { docType: '심사 신청서/계약서 사본', uploaded: false },
  { docType: '공정도 (제조/서비스 흐름도)', uploaded: false },
  { docType: '조직도 (기구표)', uploaded: false },
  { docType: '국민연금 가입자 명부', uploaded: false },
  { docType: '환경/안전 인허가증', uploaded: false },
];

// 초기 EHS 데이터
const initialEhs: CompanyEhsCompliance = {
  companyId: '',
  safetyManager: { appointed: false },
  airEmissionGrade: '해당없음',
  waterEmissionGrade: '해당없음',
  fireSafetyGrade: '해당없음',
  toxicChemicalHandling: false,
  wasteDischargeType: '해당없음'
};

type ReportTabKey = 'upload' | 'stage1' | 'stage2' | 'special';

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
  const [ehsData, setEhsData] = useState<CompanyEhsCompliance>({ ...initialEhs, companyId: company.id });
  const [selectedPastReport, setSelectedPastReport] = useState<string>('');
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // 1단계 문서심사 데이터
  const [stage1Data, setStage1Data] = useState({
    manualDocNo: 'QM-01',
    manualRevDate: '2024-10-01',
    manualRevNo: 'Rev.3',
    processDocNo: 'QP-01~12',
    processRevDate: '2024-09-15',
    processRevNo: 'Rev.2',
    isIntegratedManual: true,
    isIntegratedPolicy: true,
    isIntegratedMgmtReview: true,
    isIntegratedInternalAudit: true,
    isIntegratedProcessApproach: true,
    isIntegratedImprovement: true,
    clause4Result: '적합' as '적합' | '부적합' | '관찰/권고',
    clause5Result: '적합' as '적합' | '부적합' | '관찰/권고',
    clause6Result: '적합' as '적합' | '부적합' | '관찰/권고',
    clause7Result: '적합' as '적합' | '부적합' | '관찰/권고',
    clause8Result: '적합' as '적합' | '부적합' | '관찰/권고',
    clause9Result: '적합' as '적합' | '부적합' | '관찰/권고',
    clause10Result: '적합' as '적합' | '부적합' | '관찰/권고',
    conclusion: 'pass' as 'pass' | 'corrective' | 'fail',
    conclusionNote: ''
  });

  // 2단계 현장심사 데이터
  const [stage2Data, setStage2Data] = useState({
    openingMeetingDate: contract?.plannedAuditStartDate || '2026-10-24',
    closingMeetingDate: contract?.plannedAuditEndDate || '2026-10-25',
    diffFromPlan: false,
    diffDetail: '',
    programIssues: false,
    programIssueDetail: '',
    systemImplemented: true,
    scopeAdequate: true,
    minorNcCount: 0,
    majorNcCount: 0,
    observationCount: 0,
    overallComment: '',
    nextAuditType: '사후1차',
    nextAuditMonth: '',
    nextAuditMd: '2.0',
    attendees: [
      { name: '', title: '' },
      { name: '', title: '' },
      { name: '', title: '' },
      { name: '', title: '' },
    ]
  });

  const auditStandards = contract?.standards?.join(' & ') || 'ISO 9001:2015 & ISO 14001:2015 & ISO 45001:2018';
  const auditType = contract?.contractType || '정기사후';
  const isInitialAudit = auditType === '신규인증' || auditType === '전환심사';

  const tabs: { key: ReportTabKey; label: string; allowed: boolean }[] = [
    { key: 'upload', label: '고객정보/증빙 업로드', allowed: true },
    { key: 'stage1', label: '문서심사보고서 (1단계)', allowed: true },
    { key: 'stage2', label: '2단계 심사보고서 (현장)', allowed: true },
    { key: 'special', label: '규격별 특약 심사', allowed: true },
  ];

  const handleUploadFile = (index: number) => {
    const updated = [...proofDocs];
    updated[index] = {
      ...updated[index],
      uploaded: true,
      fileName: `${updated[index].docType}_${company.companyName}.pdf`,
      uploadedAt: new Date().toISOString().slice(0, 10),
      verified: false
    };
    setProofDocs(updated);
  };

  const handleSaveAll = () => {
    if (onSave) {
      onSave({ proofDocs, ehsData, stage1Data, stage2Data });
    }
    alert('[심사보고서 임시 저장 완료]\n모든 작성 내용이 브라우저 및 시스템 DB에 저장되었습니다.');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 text-slate-800 text-xs overflow-hidden animate-in fade-in">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950 px-6 py-3.5 shadow-md text-white shrink-0 border-b border-cyan-900/40">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer" title="닫기 / 이전으로">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-black flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>심사보고서 작성 및 검토</span>
              <span className="text-xs font-normal text-cyan-300">— {company.companyName}</span>
            </h2>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {auditType} · {auditStandards} · {contract?.plannedAuditStartDate || '2026-10-24'} ~ {contract?.plannedAuditEndDate || '2026-10-25'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleSaveAll} className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm">
            <Save className="w-3.5 h-3.5" />
            <span>저장</span>
          </button>
          <button type="button" className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm">
            <Send className="w-3.5 h-3.5" />
            <span>사무국 제출</span>
          </button>
          <button type="button" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer">
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5 : 7.5 분할 워크벤치 (메인 스크롤 영역) */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="w-full flex flex-col lg:flex-row gap-5 items-start pb-16">

        {/* ------------------------------------------------------------- */}
        {/* LEFT PANEL: 25~30% 입력 메뉴 영역 */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full lg:w-[380px] xl:w-[410px] shrink-0 bg-white border border-slate-300 rounded-lg p-4 space-y-4 text-xs shadow-2xs">
          
          {/* 회사 개요 */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>회사 개요</span>
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 space-y-1 text-[11px] text-slate-700">
              <div className="flex justify-between"><span className="text-slate-500">회사명:</span><span className="font-bold text-slate-900">{company.companyName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">대표자:</span><span className="text-slate-900">{company.ceoName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">사업자번호:</span><span className="font-mono text-slate-900">{company.bizNumber || '513-85-18153'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">소재지:</span><span className="text-slate-900 truncate max-w-[180px]">{company.address}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">담당자:</span><span className="text-slate-900">{company.contactPerson || '정순호 이사'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">종업원수:</span><span className="font-bold text-slate-900">{company.totalEmployees || 48}명</span></div>
            </div>
          </div>

          {/* 심사 개요 */}
          <div className="space-y-1.5 border-t border-slate-200 pt-3">
            <label className="font-bold text-slate-900 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>심사 개요</span>
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 space-y-1 text-[11px] text-slate-700">
              <div className="flex justify-between"><span className="text-slate-500">심사구분:</span><span className="font-bold text-slate-900">{auditType}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">심사일정:</span><span className="font-mono text-slate-900">{contract?.plannedAuditStartDate || '2026-10-24'} ~ {contract?.plannedAuditEndDate || '2026-10-25'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">M/D:</span><span className="font-bold text-slate-900">{contract?.appliedMd || 2.0}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">심사팀장:</span><span className="text-slate-900">{auditor?.name || '김홍덕'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">규격:</span><span className="text-slate-900 truncate max-w-[180px]">{auditStandards}</span></div>
            </div>
          </div>

          {/* 심사코드 (IAF / EA / KSIC) */}
          <div className="space-y-1.5 border-t border-slate-200 pt-3">
            <label className="font-bold text-slate-900 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span>심사코드 (IAF / EA / KSIC)</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <span className="text-[10px] text-slate-500 block">IAF</span>
                <input type="text" defaultValue={company.iafCode || '17'} className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-center" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">EA</span>
                <input type="text" defaultValue="17" className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-center" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">KSIC</span>
                <input type="text" defaultValue="C2431" className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-center" />
              </div>
            </div>
          </div>

          {/* 과거 심사보고서 열람 (전체 DB 풀다운 + PDF 뷰어) */}
          <div className="space-y-1.5 border-t border-slate-200 pt-3">
            <label className="font-bold text-slate-900 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>과거 심사보고서 열람</span>
            </label>
            <select
              value={selectedPastReport}
              onChange={(e) => {
                setSelectedPastReport(e.target.value);
                if (e.target.value) setShowPdfViewer(true);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-[11px] font-bold text-slate-900"
            >
              <option value="">-- 보고서 선택 (DB 전체 {mockPastReports.length}건) --</option>
              {mockPastReports.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            {showPdfViewer && selectedPastReport && (
              <div className="border border-slate-300 rounded-md bg-white overflow-hidden">
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-100 border-b border-slate-200">
                  <span className="text-[10.5px] font-bold text-slate-700">
                    📄 {mockPastReports.find(r => r.id === selectedPastReport)?.label}
                  </span>
                  <button type="button" onClick={() => setShowPdfViewer(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="h-[200px] flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
                  <div className="text-center space-y-1">
                    <FileText className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold">PDF 뷰어 (읽기전용)</p>
                    <p className="text-[10px]">실제 환경에서 Firebase Storage PDF가 임베딩됩니다</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 환경·안전 규제 및 등급 (OKESG 연동 DB) */}
          <div className="space-y-1.5 border-t border-slate-200 pt-3">
            <label className="font-bold text-slate-900 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-600" />
              <span>환경·안전 규제 등급 (OKESG)</span>
            </label>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">안전관리자 선임:</span>
                <select value={ehsData.safetyManager.appointed ? '선임' : '미선임'} onChange={(e) => setEhsData({...ehsData, safetyManager: {...ehsData.safetyManager, appointed: e.target.value === '선임'}})} className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px]">
                  <option>선임</option><option>미선임</option>
                </select>
              </div>
              {ehsData.safetyManager.appointed && (
                <input type="text" placeholder="안전관리자 성명 / 자격" defaultValue={ehsData.safetyManager.name} className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px]" />
              )}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">대기배출 종별:</span>
                <select value={ehsData.airEmissionGrade} onChange={(e) => setEhsData({...ehsData, airEmissionGrade: e.target.value as any})} className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px]">
                  {['해당없음', '1종', '2종', '3종', '4종', '5종'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">수질배출 종별:</span>
                <select value={ehsData.waterEmissionGrade} onChange={(e) => setEhsData({...ehsData, waterEmissionGrade: e.target.value as any})} className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px]">
                  {['해당없음', '1종', '2종', '3종', '4종', '5종'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">소방안전관리자:</span>
                <select value={ehsData.fireSafetyGrade} onChange={(e) => setEhsData({...ehsData, fireSafetyGrade: e.target.value as any})} className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px]">
                  {['해당없음', '특급', '1급', '2급', '3급'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">유해화학물질:</span>
                <select value={ehsData.toxicChemicalHandling ? '취급' : '해당없음'} onChange={(e) => setEhsData({...ehsData, toxicChemicalHandling: e.target.value === '취급'})} className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px]">
                  <option>해당없음</option><option>취급</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">폐기물 유형:</span>
                <select value={ehsData.wasteDischargeType} onChange={(e) => setEhsData({...ehsData, wasteDischargeType: e.target.value as any})} className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px]">
                  {['해당없음', '일반폐기물', '지정폐기물'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT PANEL: 70~75% 종이 파일 철 인덱스 탭 */}
        {/* ------------------------------------------------------------- */}
        <div className="flex-1 min-w-0">
          {/* 탭 인덱스 (좌우 빈칸 없이 일체형) */}
          <div className="flex w-full">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => tab.allowed && setActiveTab(tab.key)}
                className={`flex-1 py-2.5 text-xs font-bold text-center border-t border-l border-r first:rounded-tl-lg last:rounded-tr-lg transition cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 border-slate-300 border-b-white -mb-px z-10 relative'
                    : tab.allowed
                      ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                      : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 영역 */}
          <div className="bg-white border border-t-0 border-slate-300 rounded-b-lg min-h-[600px]">

            {/* ========= 탭 1: 고객 정보 및 증빙 서류 업로드 ========= */}
            {activeTab === 'upload' && (
              <div className="p-6 space-y-4">
                <div className="text-center pb-3 border-b border-slate-200">
                  <h3 className="text-lg font-black text-slate-900">고객 정보 및 증빙 서류</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isInitialAudit ? '최초(전환)심사 시 업체가 제출한 필수 증빙 서류를 업로드하십시오.' : '사후관리/갱신심사 시 변경사항이 있는 서류를 업로드하십시오.'}
                  </p>
                </div>

                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-2.5 border border-slate-300 text-left font-bold w-8">No</th>
                      <th className="p-2.5 border border-slate-300 text-left font-bold">서류 종류</th>
                      <th className="p-2.5 border border-slate-300 text-center font-bold w-28">상태</th>
                      <th className="p-2.5 border border-slate-300 text-center font-bold w-28">업로드 일자</th>
                      <th className="p-2.5 border border-slate-300 text-center font-bold w-24">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proofDocs.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-semibold text-slate-900">{doc.docType}</td>
                        <td className="p-2 border border-slate-300 text-center">
                          {doc.uploaded ? (
                            <span className="inline-flex items-center gap-1 text-green-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />업로드됨
                            </span>
                          ) : (
                            <span className="text-slate-400">미제출</span>
                          )}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono text-slate-600">
                          {doc.uploadedAt || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 text-center">
                          <button
                            type="button"
                            onClick={() => handleUploadFile(idx)}
                            className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10.5px] flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            업로드
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-center pt-2 text-[11px]">
                  <span className="text-slate-500">
                    제출 현황: <strong className="text-slate-900">{proofDocs.filter(d => d.uploaded).length}</strong> / {proofDocs.length} 건
                  </span>
                  {proofDocs.every(d => d.uploaded) && (
                    <span className="text-green-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> 전체 서류 제출 완료
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ========= 탭 2: 문서심사보고서 (1단계) ========= */}
            {activeTab === 'stage1' && (
              <div className="p-6 space-y-4">
                {/* 헤더 */}
                <div className="text-center pb-2">
                  <p className="text-[10px] text-slate-500 font-mono">GMSCS-F07/F08</p>
                  <h3 className="text-xl font-black text-slate-900 tracking-[0.4em] indent-[0.4em]">적합성 평가 심사보고서</h3>
                  <p className="text-xs text-slate-600 font-bold mt-1">(1st Stage — 문서심사)</p>
                </div>

                {/* 상단 기본 정보 */}
                <table className="w-full border-collapse border border-slate-700 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <th className="w-28 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">고 객 명</th>
                      <td className="p-2 font-bold text-slate-900">{company.companyName}</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 표준</th>
                      <td className="p-2 text-slate-900">{auditStandards}</td>
                    </tr>
                    <tr>
                      <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold">심사 유형</th>
                      <td className="p-2 font-bold text-slate-900">{auditType}</td>
                    </tr>
                  </tbody>
                </table>

                {/* 1단계 심사 목적 */}
                <div className="border border-slate-700 p-3 text-xs space-y-1 text-slate-800 leading-normal bg-white">
                  <h4 className="font-black text-slate-900 mb-1">◆ 1단계 심사의 목적</h4>
                  <p>1. 경영시스템을 문서화한 정보 검토</p>
                  <p>2. 조직의 위치 및 사업장별 상태를 평가하고, 2단계 심사를 위한 준비상태를 결정하기 위하여 조직의 인원들과 논의</p>
                  <p>3. 표준 요구사항, 특히 경영시스템의 주요성과 또는 중대한 측면의 파악, 프로세스, 목표 및 운영과 관련된 조직의 상태 및 이해 정도를 검토</p>
                  <p>4. 2단계 심사를 위한 자원의 배정에 대해 검토하고 2단계 심사의 세부사항에 대하여 조직과 합의</p>
                </div>

                {/* 경영시스템 문서화 정보 확인 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Ⅰ. 경영시스템의 문서화된 정보</h4>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <th className="w-32 bg-slate-100 p-2 border-r border-slate-400 font-bold text-left">매뉴얼 문서번호</th>
                        <td className="p-2 border-r border-slate-400">
                          <input type="text" value={stage1Data.manualDocNo} onChange={e => setStage1Data({...stage1Data, manualDocNo: e.target.value})} className="w-full bg-transparent focus:outline-none font-mono" />
                        </td>
                        <th className="w-28 bg-slate-100 p-2 border-r border-slate-400 font-bold text-left">제/개정 일자</th>
                        <td className="p-2 border-r border-slate-400">
                          <input type="text" value={stage1Data.manualRevDate} onChange={e => setStage1Data({...stage1Data, manualRevDate: e.target.value})} className="w-full bg-transparent focus:outline-none font-mono" />
                        </td>
                        <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 font-bold text-left">개정번호</th>
                        <td className="p-2">
                          <input type="text" value={stage1Data.manualRevNo} onChange={e => setStage1Data({...stage1Data, manualRevNo: e.target.value})} className="w-full bg-transparent focus:outline-none font-mono" />
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-left">프로세스 문서번호</th>
                        <td className="p-2 border-r border-slate-400">
                          <input type="text" value={stage1Data.processDocNo} onChange={e => setStage1Data({...stage1Data, processDocNo: e.target.value})} className="w-full bg-transparent focus:outline-none font-mono" />
                        </td>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-left">제/개정 일자</th>
                        <td className="p-2 border-r border-slate-400">
                          <input type="text" value={stage1Data.processRevDate} onChange={e => setStage1Data({...stage1Data, processRevDate: e.target.value})} className="w-full bg-transparent focus:outline-none font-mono" />
                        </td>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-left">개정번호</th>
                        <td className="p-2">
                          <input type="text" value={stage1Data.processRevNo} onChange={e => setStage1Data({...stage1Data, processRevNo: e.target.value})} className="w-full bg-transparent focus:outline-none font-mono" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 통합경영시스템 평가 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Ⅱ. 통합경영시스템일 경우 통합 정도 파악</h4>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      {[
                        { key: 'isIntegratedManual', label: '경영시스템 문서가 통합되어 있습니까?' },
                        { key: 'isIntegratedPolicy', label: '방침 및 목표가 통합되어 있습니까?' },
                        { key: 'isIntegratedMgmtReview', label: '전체 조직에 대한 경영검토가 이루어졌습니까?' },
                        { key: 'isIntegratedInternalAudit', label: '내부심사가 통합적으로 수행되었습니까?' },
                        { key: 'isIntegratedProcessApproach', label: '프로세스 접근이 통합적으로 이루어졌습니까?' },
                        { key: 'isIntegratedImprovement', label: '지속적 개선이 통합적으로 접근 되었습니까?' },
                      ].map((item, idx) => (
                        <tr key={item.key} className="border-b border-slate-300">
                          <td className="p-2 border-r border-slate-400 w-8 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-400 text-slate-800">{item.label}</td>
                          <td className="p-2 w-24 text-center">
                            <select
                              value={(stage1Data as any)[item.key] ? '예' : '아니오'}
                              onChange={e => setStage1Data({...stage1Data, [item.key]: e.target.value === '예'})}
                              className="bg-transparent font-bold text-center focus:outline-none"
                            >
                              <option>예</option>
                              <option>아니오</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 요구사항 확인 (4~10장) */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Ⅲ. 요구사항별 문서화 정보 확인 결과</h4>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="p-2 border border-slate-400 w-10">No.</th>
                        <th className="p-2 border border-slate-400">요구사항</th>
                        <th className="p-2 border border-slate-400 w-36">심사결과</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'clause4Result', label: '4. 조직상황' },
                        { key: 'clause5Result', label: '5. 리더십' },
                        { key: 'clause6Result', label: '6. 기획' },
                        { key: 'clause7Result', label: '7. 지원' },
                        { key: 'clause8Result', label: '8. 운용' },
                        { key: 'clause9Result', label: '9. 성과평가' },
                        { key: 'clause10Result', label: '10. 개선' },
                      ].map((item, idx) => (
                        <tr key={item.key} className="border-b border-slate-300">
                          <td className="p-2 border-r border-slate-400 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-400 font-semibold text-slate-800">{item.label}</td>
                          <td className="p-2 text-center">
                            <select
                              value={(stage1Data as any)[item.key]}
                              onChange={e => setStage1Data({...stage1Data, [item.key]: e.target.value})}
                              className={`bg-transparent font-bold text-center focus:outline-none ${
                                (stage1Data as any)[item.key] === '적합' ? 'text-green-700' :
                                (stage1Data as any)[item.key] === '부적합' ? 'text-red-700' : 'text-amber-700'
                              }`}
                            >
                              <option>적합</option>
                              <option>부적합</option>
                              <option>관찰/권고</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 1단계 심사 결론 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Ⅳ. 심사 결론</h4>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      {[
                        { value: 'pass', label: '부적합이 발견되지 않아 2단계 심사로 진행 가능합니다.' },
                        { value: 'corrective', label: '부적합이 발견되어 시정조치 완료 후 2단계 심사로 진행 가능합니다.' },
                        { value: 'fail', label: '중대한 부적합이 발견되어 2단계 심사로 진행이 불가능합니다.' },
                      ].map(item => (
                        <tr key={item.value} className="border-b border-slate-300">
                          <td className="p-2.5 border-r border-slate-400 text-slate-800">{item.label}</td>
                          <td className="p-2.5 w-16 text-center">
                            <button
                              type="button"
                              onClick={() => setStage1Data({...stage1Data, conclusion: item.value as any})}
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer ${
                                stage1Data.conclusion === item.value
                                  ? 'bg-cyan-700 border-cyan-800 text-white'
                                  : 'bg-white border-slate-300'
                              }`}
                            >
                              {stage1Data.conclusion === item.value && <Check className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========= 탭 3: 2단계 심사보고서 (현장심사) ========= */}
            {activeTab === 'stage2' && (
              <div className="p-6 space-y-4">
                <div className="text-center pb-2">
                  <p className="text-[10px] text-slate-500 font-mono">GMSCS-F10</p>
                  <h3 className="text-xl font-black text-slate-900 tracking-[0.4em] indent-[0.4em]">적합성 평가 심사보고서</h3>
                  <p className="text-xs text-slate-600 font-bold mt-1">(2nd Stage — 현장심사)</p>
                </div>

                {/* 기본 정보 */}
                <table className="w-full border-collapse border border-slate-700 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <th className="w-32 bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">고 객 명</th>
                      <td className="p-2 border-r border-slate-400 font-bold">{company.companyName}</td>
                      <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">인증번호</th>
                      <td className="p-2 font-mono">{(company as any).certNumber || 'QE240207'}</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">주사업장 주소</th>
                      <td className="p-2" colSpan={3}>{company.address}</td>
                    </tr>
                  </tbody>
                </table>

                {/* 공통 심사 내역 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="font-black text-cyan-950">◆</span>
                    <span>공통 심사 내역</span>
                  </h4>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="p-2 border-r border-slate-400 text-slate-800">심사계획서와 차이가 있는가?</td>
                        <td className="p-2 w-28 text-center">
                          <select value={stage2Data.diffFromPlan ? '있다' : '없다'} onChange={e => setStage2Data({...stage2Data, diffFromPlan: e.target.value === '있다'})} className="bg-transparent font-bold focus:outline-none">
                            <option>있다</option><option>없다</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2 border-r border-slate-400 text-slate-800">심사프로그램에 영향을 미치는 주요한 이슈가 있는가?</td>
                        <td className="p-2 w-28 text-center">
                          <select value={stage2Data.programIssues ? '있다' : '없다'} onChange={e => setStage2Data({...stage2Data, programIssues: e.target.value === '있다'})} className="bg-transparent font-bold focus:outline-none">
                            <option>있다</option><option>없다</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2 border-r border-slate-400 text-slate-800">구축된 시스템이 정해진 절차와 방법에 의거 적절히 시행/유지되고 있는가?</td>
                        <td className="p-2 w-28 text-center">
                          <select value={stage2Data.systemImplemented ? '예' : '아니오'} onChange={e => setStage2Data({...stage2Data, systemImplemented: e.target.value === '예'})} className="bg-transparent font-bold focus:outline-none">
                            <option>예</option><option>아니오</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2 border-r border-slate-400 text-slate-800">인증범위는 적절한가?</td>
                        <td className="p-2 w-28 text-center">
                          <select value={stage2Data.scopeAdequate ? '예' : '아니오'} onChange={e => setStage2Data({...stage2Data, scopeAdequate: e.target.value === '예'})} className="bg-transparent font-bold focus:outline-none">
                            <option>예</option><option>아니오</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 심사 발견사항 요약 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="font-black text-cyan-950">◆</span>
                    <span>심사 발견사항 요약</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-slate-300 rounded p-3 text-center">
                      <span className="text-[10px] text-slate-500 block">경부적합</span>
                      <input type="number" value={stage2Data.minorNcCount} onChange={e => setStage2Data({...stage2Data, minorNcCount: parseInt(e.target.value) || 0})} className="w-16 text-center text-lg font-black text-amber-700 bg-transparent focus:outline-none mx-auto block" />
                      <span className="text-[10px] text-slate-400">건</span>
                    </div>
                    <div className="border border-slate-300 rounded p-3 text-center">
                      <span className="text-[10px] text-slate-500 block">중부적합</span>
                      <input type="number" value={stage2Data.majorNcCount} onChange={e => setStage2Data({...stage2Data, majorNcCount: parseInt(e.target.value) || 0})} className="w-16 text-center text-lg font-black text-red-700 bg-transparent focus:outline-none mx-auto block" />
                      <span className="text-[10px] text-slate-400">건</span>
                    </div>
                    <div className="border border-slate-300 rounded p-3 text-center">
                      <span className="text-[10px] text-slate-500 block">관찰/권고사항</span>
                      <input type="number" value={stage2Data.observationCount} onChange={e => setStage2Data({...stage2Data, observationCount: parseInt(e.target.value) || 0})} className="w-16 text-center text-lg font-black text-blue-700 bg-transparent focus:outline-none mx-auto block" />
                      <span className="text-[10px] text-slate-400">건</span>
                    </div>
                  </div>
                </div>

                {/* 심사 총평 */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">◆ 심사 총평 (우수한 점 포함)</h4>
                  <textarea
                    value={stage2Data.overallComment}
                    onChange={e => setStage2Data({...stage2Data, overallComment: e.target.value})}
                    rows={4}
                    placeholder="심사 총평을 기술하십시오. 경영시스템의 우수한 점, 개선 권고사항 등을 포함합니다."
                    className="w-full border border-slate-400 rounded p-3 text-xs leading-relaxed focus:outline-none focus:border-slate-600 resize-none"
                  />
                </div>

                {/* 참석자 명단 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">◆ 조직의 심사 참석자</h4>
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="p-2 border border-slate-400 w-1/2">참석자명</th>
                        <th className="p-2 border border-slate-400 w-1/2">직무/직책</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stage2Data.attendees.map((att, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5 border border-slate-300">
                            <input type="text" value={att.name} onChange={e => { const a = [...stage2Data.attendees]; a[idx] = {...a[idx], name: e.target.value}; setStage2Data({...stage2Data, attendees: a}); }} className="w-full bg-transparent focus:outline-none" placeholder="성명" />
                          </td>
                          <td className="p-1.5 border border-slate-300">
                            <input type="text" value={att.title} onChange={e => { const a = [...stage2Data.attendees]; a[idx] = {...a[idx], title: e.target.value}; setStage2Data({...stage2Data, attendees: a}); }} className="w-full bg-transparent focus:outline-none" placeholder="직무/직책" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 차기 심사 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">◆ 차기 심사</h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">차기 심사종류</span>
                      <input type="text" value={stage2Data.nextAuditType} onChange={e => setStage2Data({...stage2Data, nextAuditType: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">심사 예정 월</span>
                      <input type="text" value={stage2Data.nextAuditMonth} onChange={e => setStage2Data({...stage2Data, nextAuditMonth: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1" placeholder="2027-10" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">심사일수 (M/D)</span>
                      <input type="text" value={stage2Data.nextAuditMd} onChange={e => setStage2Data({...stage2Data, nextAuditMd: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========= 탭 4: 규격별 특약 및 부속 심사 ========= */}
            {activeTab === 'special' && (
              <div className="p-6 space-y-5">
                <div className="text-center pb-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-[0.3em] indent-[0.3em]">규격별 특약 심사</h3>
                  <p className="text-xs text-slate-500 mt-1">ISO 9001 / 14001 / 45001 / ESG-MS 규격별 특약 점검 항목</p>
                </div>

                {/* ISO 9001 품질 */}
                <div className="border border-blue-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-2.5 border-b border-blue-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h4 className="font-black text-blue-900 text-xs">ISO 9001:2015 — 품질경영시스템 특약 점검</h4>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <table className="w-full border-collapse border border-slate-300">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-2 border border-slate-300 text-left">점검 항목</th>
                          <th className="p-2 border border-slate-300 w-28 text-center">결과</th>
                          <th className="p-2 border border-slate-300 w-[40%]">비고 / 심사확인 내역</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['고객만족도 측정 및 분석', '부적합품 관리 절차', '공급자 평가 및 관리', '설계개발 프로세스 (해당 시)', '제조/서비스 제공 관리'].map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-200">
                            <td className="p-2 border-r border-slate-300 font-medium">{item}</td>
                            <td className="p-2 border-r border-slate-300 text-center">
                              <select defaultValue="적합" className="bg-transparent font-bold text-green-700 focus:outline-none text-center"><option>적합</option><option>부적합</option><option>관찰</option><option>N/A</option></select>
                            </td>
                            <td className="p-2"><input type="text" className="w-full bg-transparent focus:outline-none" placeholder="심사 확인 내역 기술..." /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ISO 14001 환경 */}
                <div className="border border-green-200 rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-4 py-2.5 border-b border-green-200 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <h4 className="font-black text-green-900 text-xs">ISO 14001:2015 — 환경경영시스템 특약 점검</h4>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <table className="w-full border-collapse border border-slate-300">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-2 border border-slate-300 text-left">점검 항목</th>
                          <th className="p-2 border border-slate-300 w-28 text-center">결과</th>
                          <th className="p-2 border border-slate-300 w-[40%]">비고 / 심사확인 내역</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['환경측면 파악 및 영향 평가', '환경법규 준수 평가', '환경목표 및 세부목표', '비상사태 대비 및 대응', '폐기물/오염물질 관리'].map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-200">
                            <td className="p-2 border-r border-slate-300 font-medium">{item}</td>
                            <td className="p-2 border-r border-slate-300 text-center">
                              <select defaultValue="적합" className="bg-transparent font-bold text-green-700 focus:outline-none text-center"><option>적합</option><option>부적합</option><option>관찰</option><option>N/A</option></select>
                            </td>
                            <td className="p-2"><input type="text" className="w-full bg-transparent focus:outline-none" placeholder="심사 확인 내역 기술..." /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ISO 45001 안전보건 */}
                <div className="border border-amber-200 rounded-lg overflow-hidden">
                  <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <h4 className="font-black text-amber-900 text-xs">ISO 45001:2018 — 안전보건경영시스템 특약 점검</h4>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <table className="w-full border-collapse border border-slate-300">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-2 border border-slate-300 text-left">점검 항목</th>
                          <th className="p-2 border border-slate-300 w-28 text-center">결과</th>
                          <th className="p-2 border border-slate-300 w-[40%]">비고 / 심사확인 내역</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['근로자 참여 및 협의', '위험성평가 실시 및 관리', '아차사고/사고 관리 프로세스', '비상조치계획 및 훈련', '산업안전보건위원회 운영'].map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-200">
                            <td className="p-2 border-r border-slate-300 font-medium">{item}</td>
                            <td className="p-2 border-r border-slate-300 text-center">
                              <select defaultValue="적합" className="bg-transparent font-bold text-green-700 focus:outline-none text-center"><option>적합</option><option>부적합</option><option>관찰</option><option>N/A</option></select>
                            </td>
                            <td className="p-2"><input type="text" className="w-full bg-transparent focus:outline-none" placeholder="심사 확인 내역 기술..." /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ESG-MS */}
                <div className="border border-purple-200 rounded-lg overflow-hidden">
                  <div className="bg-purple-50 px-4 py-2.5 border-b border-purple-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="font-black text-purple-900 text-xs">ESG-MS — ESG 경영시스템 부속서 E 점검</h4>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <table className="w-full border-collapse border border-slate-300">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-2 border border-slate-300 text-left">점검 항목</th>
                          <th className="p-2 border border-slate-300 w-28 text-center">결과</th>
                          <th className="p-2 border border-slate-300 w-[40%]">비고 / 심사확인 내역</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['E.1 환경(E) 영역 체계화 및 실행', 'E.2 사회(S) 영역 노동·인권·안전보건', 'E.3 지배구조(G) 영역 경영투명성'].map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-200">
                            <td className="p-2 border-r border-slate-300 font-medium">{item}</td>
                            <td className="p-2 border-r border-slate-300 text-center">
                              <select defaultValue="적합" className="bg-transparent font-bold text-green-700 focus:outline-none text-center"><option>적합</option><option>부적합</option><option>관찰</option><option>N/A</option></select>
                            </td>
                            <td className="p-2"><input type="text" className="w-full bg-transparent focus:outline-none" placeholder="심사 확인 내역 기술..." /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
