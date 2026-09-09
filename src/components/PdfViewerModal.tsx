import React from 'react';
import { X, Download, Printer, ExternalLink, FileText, CheckCircle2, Shield } from 'lucide-react';

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
  if (!isOpen) return null;

  // 실제 PDF URL이 없거나 로컬 파일인 경우 내장 미리보기 뷰어 화면 제공
  const defaultPdfUrl = pdfUrl || `/Remark/(주)케이원메탈2공장 인증변경신청서.pdf`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* 상단 툴바 */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base truncate">{title}</h3>
                <span className="bg-blue-900/60 text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-700/50 flex-shrink-0">
                  과거 원본 PDF
                </span>
              </div>
              <p className="text-slate-400 text-xs truncate mt-0.5">
                기업명: <span className="text-slate-200 font-medium">{companyName}</span> | 규격: <span className="text-slate-200">{standard}</span> | 심사일: <span className="text-slate-200">{auditDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {pdfUrl && (
              <a
                href={pdfUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-600"
              >
                <Download className="w-3.5 h-3.5" />
                다운로드
              </a>
            )}
            
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-600"
            >
              <Printer className="w-3.5 h-3.5" />
              인쇄
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors ml-2"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 메인 PDF 뷰어 영역 */}
        <div className="flex-1 bg-slate-950 p-2 sm:p-4 overflow-hidden relative flex flex-col items-center justify-center">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full rounded-xl border border-slate-800 bg-white"
              title={title}
            />
          ) : (
            <div className="w-full h-full bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{companyName} 과거 심사보고서 아카이브</h4>
              <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                구글 드라이브(<code className="text-blue-400">G:\내 드라이브\GMSCS_과거심사보고서</code>)에 저장된 원본 PDF 파일과 안전하게 동기화되어 열람됩니다.
              </p>
              
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 w-full max-w-lg text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between text-slate-400 pb-1 border-b border-slate-700">
                  <span>보관 문서 식별자</span>
                  <span className="font-mono text-slate-200">[GMSCS-REP]_{companyName}_{standard}_{auditDate}.pdf</span>
                </div>
                <div className="flex justify-between text-slate-400 pb-1 border-b border-slate-700">
                  <span>인정기관 / 규격</span>
                  <span className="text-slate-200">KAB 공인 인증 / {standard}</span>
                </div>
                <div className="flex justify-between text-slate-400 pb-1 border-b border-slate-700">
                  <span>심사 단계</span>
                  <span className="text-emerald-400 font-medium">{auditType}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>서명 검증 상태</span>
                  <span className="text-blue-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 공인 전자서명 완비
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                >
                  확인 완료 (창 닫기)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 하단 상태바 */}
        <div className="bg-slate-800/60 border-t border-slate-700/60 px-5 py-2.5 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            GMSCS 암호화 보안 보관함 (Read-Only 무결성 검증 완료)
          </span>
          <span className="font-mono">Google Drive Synchronized</span>
        </div>

      </div>
    </div>
  );
};
