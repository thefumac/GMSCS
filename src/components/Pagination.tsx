import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 20,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= pageSize)) {
    return null;
  }

  // 5개 번호 단위 블록 계산 (1~5, 6~10, 11~15 ...)
  const blockSize = 5;
  const currentBlock = Math.floor((currentPage - 1) / blockSize);
  const startPage = currentBlock * blockSize + 1;
  const endPage = Math.min(totalPages, startPage + blockSize - 1);

  // 100개 이하 (5페이지 이하) 여부
  const isSmallDataset = totalPages <= blockSize;

  // 이전 블록 및 다음 블록 가능 여부
  const canGoPrev = !isSmallDataset && currentBlock > 0;
  const canGoNext = !isSmallDataset && endPage < totalPages;

  const handlePrevBlock = () => {
    if (canGoPrev) {
      const prevBlockStart = (currentBlock - 1) * blockSize + 1;
      onPageChange(prevBlockStart);
    }
  };

  const handleNextBlock = () => {
    if (canGoNext) {
      const nextBlockStart = (currentBlock + 1) * blockSize + 1;
      onPageChange(nextBlockStart);
    }
  };

  const pageNumbers: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={`flex items-center justify-center gap-1.5 select-none py-3 ${className}`}>
      {/* 이전 버튼 */}
      <button
        type="button"
        onClick={handlePrevBlock}
        disabled={!canGoPrev}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
          canGoPrev
            ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 active:bg-slate-200 cursor-pointer shadow-2xs'
            : 'bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed'
        }`}
        title={canGoPrev ? '이전 5개 페이지' : '이전 페이지 없음'}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>이전</span>
      </button>

      {/* 페이지 번호 목록 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs border border-teal-800'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-2xs'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* 다음 버튼 */}
      <button
        type="button"
        onClick={handleNextBlock}
        disabled={!canGoNext}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
          canGoNext
            ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 active:bg-slate-200 cursor-pointer shadow-2xs'
            : 'bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed'
        }`}
        title={canGoNext ? '다음 5개 페이지' : '다음 페이지 없음'}
      >
        <span>다음</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
