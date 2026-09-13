import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  FileText
} from 'lucide-react';

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
  auditType = '정기심사',
  auditorName = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const currentPdfUrl = pdfUrl || '/docs/2025_Audit_Report_Pack.pdf';
  const cleanFileName = title.replace(/^\[[^\]]+\]\s*/, '');

  // 브라우저 인쇄 / PDF 저장 시 파일명 동적 설정
  useEffect(() => {
    if (isOpen) {
      const originalTitle = document.title;
      document.title = `[GMSCS] ${cleanFileName || companyName}`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [isOpen, cleanFileName, companyName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-hidden animate-in fade-in">
      <div 
        className={`bg-white border border-slate-300 text-slate-900 flex flex-col shadow-2xl transition-all duration-200 overflow-hidden ${
          isFullscreen 
            ? 'fixed inset-0 rounded-none z-50' 
            : 'w-full max-w-7xl h-[94vh] max-h-[96vh] rounded-2xl'
        }`}
      >
        {/* TOP BAR: 심플 헤더 및 조작 도구 (다운로드, 인쇄, 닫기) */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {title}
                </h2>
                {standard && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                    {standard}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 truncate">
                <span>고객사: <strong className="text-slate-800 font-medium">{companyName}</strong></span>
                {auditType && (
                  <>
                    <span>·</span>
                    <span>구분: <span className="text-slate-700 font-medium">{auditType}</span></span>
                  </>
                )}
                {auditorName && (
                  <>
                    <span>·</span>
                    <span>심사원: <span className="text-slate-700 font-medium">{auditorName}</span></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 우측 조작 버튼: 다운로드, 새창, 인쇄, 닫기 */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={currentPdfUrl}
              download={cleanFileName || `${companyName}_심사문서.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition cursor-pointer shadow-2xs"
              title="PDF 다운로드/저장"
            >
              <Download className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">저장 / 다운로드</span>
            </a>

            <button
              type="button"
              onClick={() => window.open(currentPdfUrl, '_blank')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition cursor-pointer shadow-2xs"
              title="새 창에서 원본 열기"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">새 창 열기</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
              title="PDF 인쇄"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer border border-slate-200"
              title={isFullscreen ? "창 모드" : "전체 화면"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer border border-slate-200 ml-1"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF VIEWPORT: 단일 iframe 실물 뷰어 */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col min-h-0">
          <iframe
            src={`${currentPdfUrl}#toolbar=1&navpanes=1&statusbar=1`}
            title={title}
            className="w-full h-full border-0 flex-1 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
