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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-hidden animate-in fade-in">
      <div 
        className={`bg-slate-900 border border-slate-700 text-slate-100 flex flex-col shadow-2xl transition-all duration-200 overflow-hidden ${
          isFullscreen 
            ? 'fixed inset-0 rounded-none z-50' 
            : 'w-full max-w-7xl h-[92vh] max-h-[95vh] rounded-2xl'
        }`}
      >
        {/* ========================================================= */}
        {/* TOP BAR: 타이틀, 기업정보 및 조작 도구                    */}
        {/* ========================================================= */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {activeDriveFile.simplifiedFileName || activeDriveFile.fileName || title}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {standard}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {activeDriveFile.docType || '공식 문서'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-normal">
                <span>기업명: <strong className="text-white font-bold">{companyName}</strong></span>
                <span>·</span>
                <span>심사구분: <span className="text-slate-200">{activeDriveFile.auditType || auditType}</span></span>
                {activeDriveFile.auditor && (
                  <>
                    <span>·</span>
                    <span>담당: <span className="text-slate-200">{activeDriveFile.auditor}</span></span>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer shadow-xs"
              title="원본 PDF 파일 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">다운로드</span>
            </a>

            {/* 새 창에서 열기 */}
            <button
              type="button"
              onClick={() => window.open(currentPdfUrl, '_blank')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer shadow-xs"
              title="브라우저 새 창에서 PDF 원본 열기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">새 창 열기</span>
            </button>

            {/* 인쇄 */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-medium rounded-lg transition-colors border border-cyan-600 cursor-pointer shadow-xs"
              title="PDF 인쇄"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄</span>
            </button>

            {/* 전체화면 전환 */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isFullscreen ? "창 모드" : "전체 화면"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* 닫기 */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUB BAR: 클라우드 보관 문서 탭 목록 ({driveFiles.length}건) */}
        {/* ========================================================= */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium shrink-0">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
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
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                    title={`원본 파일명: ${df.originalName || df.fileName}`}
                  >
                    <FileText className="w-3 h-3 text-cyan-400" />
                    <span className="max-w-[220px] truncate font-mono">{df.simplifiedFileName || df.fileName}</span>
                    <span className="text-[10px] bg-slate-950/80 px-1.5 py-0.5 rounded text-slate-400 font-mono">{df.fileSize}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-1 rounded-lg text-xs bg-slate-900 text-emerald-300 border border-emerald-900/40 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{companyName}_심사보고서_표준문서 (PDF 리더 연결)</span>
                </div>
              )}
            </div>
          </div>

          {/* 현재 활성 파일 클라우드 경로 정보 */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="text-slate-500">클라우드 경로:</span>
            <span className="font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 max-w-[320px] truncate" title={activeDriveFile.storagePath || activeDriveFile.fileName}>
              {activeDriveFile.storagePath || activeDriveFile.fileName}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN VIEWER: 순수 내장 브라우저 PDF 리더 iframe          */}
        {/* ========================================================= */}
        <div className="flex-1 w-full h-full relative bg-slate-950 min-h-0">
          <iframe
            src={`${currentPdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0 bg-slate-950"
            title={activeDriveFile.simplifiedFileName || activeDriveFile.fileName || title}
          />
        </div>
      </div>
    </div>
  );
};
