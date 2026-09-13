import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  FileText, 
  FolderOpen,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck
} from 'lucide-react';
import { getDriveReportsForCompany, DriveReportFileItem } from '../data/driveReportFiles';

export interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl?: string;
  companyName: string;
  standard?: string;
  auditType?: string;
  auditDate?: string;
  auditorName?: string;
  auditorEmail?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  companyName,
  standard = 'ISO 9001:2015',
  auditType = '정기 사후관리 심사',
  auditDate = '2025-10-15',
  auditorName = '',
  auditorEmail = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 구글 드라이브/파이어베이스 스토리지 보관 문서 목록 조회
  const driveFiles = useMemo(() => {
    return getDriveReportsForCompany(companyName);
  }, [companyName]);

  const [selectedDriveIndex, setSelectedDriveIndex] = useState<number>(0);

  // 선택된 문서가 바뀔 때 index 초기화
  useEffect(() => {
    setSelectedDriveIndex(0);
  }, [companyName]);

  // 활성 PDF 파일 계산
  const activeDriveFile: DriveReportFileItem = useMemo(() => {
    if (driveFiles.length > 0 && driveFiles[selectedDriveIndex]) {
      return driveFiles[selectedDriveIndex];
    }
    return {
      fileName: `[GMSCS-REP]_${auditDate.slice(0, 7)}_${auditType}_심사_${auditorName || '담당'}_심사보고서팩(${companyName}).pdf`,
      originalName: `[GMSCS-REP]_${companyName}_심사보고서.pdf`,
      docType: '심사보고서',
      fileSize: '1.4 MB',
      sizeBytes: 1468000,
      auditor: auditorName || '사무국',
      pdfUrl: pdfUrl || '/docs/2025_Audit_Report_Pack.pdf'
    };
  }, [driveFiles, selectedDriveIndex, companyName, auditDate, auditType, auditorName, pdfUrl]);

  // 브라우저 인쇄 / PDF 저장 시 파일명 동적 설정
  useEffect(() => {
    if (isOpen) {
      const originalTitle = document.title;
      const leadAuditor = auditorName || activeDriveFile.auditor || '남경호';
      document.title = `[GMSCS_PDF] ${companyName}_${standard}_${auditType}_(${leadAuditor})`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [isOpen, companyName, standard, auditType, auditorName, activeDriveFile]);

  if (!isOpen) return null;

  const currentPdfUrl = activeDriveFile.pdfUrl || pdfUrl || '/docs/2025_Audit_Report_Pack.pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden animate-in fade-in">
      <div 
        className={`bg-white border border-slate-200 text-slate-900 flex flex-col shadow-2xl transition-all duration-200 overflow-hidden ${
          isFullscreen 
            ? 'fixed inset-0 rounded-none z-50' 
            : 'w-full max-w-7xl h-[92vh] max-h-[95vh] rounded-2xl'
        }`}
      >
        {/* ========================================================= */}
        {/* TOP BAR: 타이틀, 기업정보 및 조작 도구                    */}
        {/* ========================================================= */}
        <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {activeDriveFile.simplifiedFileName || activeDriveFile.fileName || title}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                  {standard}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {activeDriveFile.docType || '공식 문서'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1 font-normal">
                <span>기업명: <strong className="text-slate-900 font-bold">{companyName}</strong></span>
                <span>·</span>
                <span>심사구분: <span className="text-slate-700 font-medium">{activeDriveFile.auditType || auditType}</span></span>
                {activeDriveFile.auditor && (
                  <>
                    <span>·</span>
                    <span>담당 심사원: <span className="text-slate-700 font-medium">{activeDriveFile.auditor}</span></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 우측 조작 도구: 다운로드, 새 창 열기, 인쇄, 전체화면, 닫기 */}
          <div className="flex items-center gap-2">
            {/* 다운로드 */}
            <a
              href={currentPdfUrl}
              download={activeDriveFile.simplifiedFileName || activeDriveFile.fileName || `${companyName}_심사문서.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-xs"
              title="원본 PDF 파일 다운로드"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">다운로드</span>
            </a>

            {/* 새 창에서 열기 */}
            <button
              type="button"
              onClick={() => window.open(currentPdfUrl, '_blank')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-xs"
              title="브라우저 새 창에서 PDF 원본 열기"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">새 창 열기</span>
            </button>

            {/* 인쇄 */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors border border-cyan-600 cursor-pointer shadow-xs shadow-cyan-600/20"
              title="PDF 인쇄"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄</span>
            </button>

            {/* 전체화면 전환 */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title={isFullscreen ? "창 모드" : "전체 화면"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* 닫기 */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1 border border-transparent hover:border-rose-200"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUB BAR: 클라우드 보관 문서 탭 목록 ({driveFiles.length}건) */}
        {/* ========================================================= */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-600 flex items-center gap-1.5 font-bold shrink-0">
              <FolderOpen className="w-4 h-4 text-emerald-600" />
              <span>보관 문서 목록 ({driveFiles.length}건):</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {driveFiles.length > 0 ? (
                driveFiles.map((df, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDriveIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      selectedDriveIndex === idx
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                    title={`원본 파일명: ${df.originalName || df.fileName}`}
                  >
                    <FileText className={`w-3.5 h-3.5 ${selectedDriveIndex === idx ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="max-w-[220px] truncate font-mono">{df.simplifiedFileName || df.fileName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${selectedDriveIndex === idx ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>{df.fileSize}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>단일 심사문서 실시간 스트리밍</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cloud Storage 연결 완료</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PDF VIEWPORT: iframe 스트리밍 뷰어                         */}
        {/* ========================================================= */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col min-h-0">
          <iframe
            src={`${currentPdfUrl}#toolbar=1&navpanes=1&statusbar=1`}
            title={activeDriveFile.simplifiedFileName || activeDriveFile.fileName || title}
            className="w-full h-full border-0 flex-1"
          />
        </div>

        {/* ========================================================= */}
        {/* FOOTER BAR: KAB 공인 심사기록 확인 안내                    */}
        {/* ========================================================= */}
        <div className="bg-white border-t border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>KAB 공인 인증기록 공식 열람기</span>
            </span>
            <span>·</span>
            <span>파일명: <code className="font-mono text-slate-700 text-[11px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">{activeDriveFile.fileName}</code></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200"
            >
              닫기
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
