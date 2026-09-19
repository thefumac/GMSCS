import React, { useState, useEffect, useMemo } from 'react';
import { 
  HardDrive, 
  Search, 
  Download, 
  Printer, 
  FileText, 
  Loader2, 
  Building2, 
  Calendar,
  CheckCircle2,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { Company, AuditProject } from '../types';
import { 
  getCompanyAuditDocuments, 
  getDocumentDownloadUrl, 
  formatFileSizeBytes,
  AuditDocumentRecord,
  AuditDocType,
  normalizeCompanyName 
} from '../services/auditDocumentService';
import { isNormalCompany } from '../utils/auditStateUtils';
import { DocStorageTarget } from './CompanyAuditHistoryModal';
import { getMergedProjects } from '../data/legacyDataLoader';

export interface DocumentStorageProps {
  companies: Company[];
  projects?: AuditProject[];
  initialDocTarget?: DocStorageTarget | null;
  onOpenPdfReport?: (info: {
    title: string;
    pdfUrl: string;
    companyName: string;
    standard: string;
    auditType: string;
    auditDate?: string;
    auditorName?: string;
  }) => void;
}

// 사업자등록번호 특수문자 제거 10자리 순수 숫자 변환
function cleanBizNo(biz?: string): string {
  if (!biz) return '';
  return biz.replace(/\D/g, '');
}

// 심사 차수 표준 명칭 정규화 함수
function formatCleanAuditStage(rawStage?: string): string {
  if (!rawStage) return '1차 사후';
  const s = rawStage.replace(/\s+/g, '').toLowerCase();
  if (s.includes('최초') || s.includes('1단계') || s.includes('2단계') || s.includes('신규')) return '최초심사';
  if (s.includes('갱신') || s.includes('재인증')) return '갱신심사';
  if (s.includes('사후2') || s.includes('2차사후') || s.includes('2차')) return '2차 사후';
  if (s.includes('사후1') || s.includes('1차사후') || s.includes('1차') || s.includes('사후') || s.includes('정기')) return '1차 사후';
  if (s.includes('전환')) return '전환심사';
  if (s.includes('특별') || s.includes('변경')) return '특별심사';
  return rawStage.trim();
}

export const DocumentStorage: React.FC<DocumentStorageProps> = ({
  companies,
  projects,
  initialDocTarget,
  onOpenPdfReport
}) => {
  // 1단계 필터 및 검색 상태
  const [docScopeFilter, setDocScopeFilter] = useState<'active' | 'all'>('active');
  const [docCompanySearch, setDocCompanySearch] = useState<string>('');
  const [selectedDocCompanyId, setSelectedDocCompanyId] = useState<string | null>(null);

  // 2단계 심사 차수 선택 상태
  const [selectedDocAuditRound, setSelectedDocAuditRound] = useState<string>('all');

  // 3단계 문서 목록 및 선택 문서 상태
  const [companyAuditDocs, setCompanyAuditDocs] = useState<AuditDocumentRecord[]>([]);
  const [isCompanyDocsLoading, setIsCompanyDocsLoading] = useState<boolean>(false);
  const [selectedDocItem, setSelectedDocItem] = useState<AuditDocumentRecord | null>(null);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

  // 1. 고객사 목록 필터링 (인증 유지 vs 전체, 실시간 검색)
  const filteredDocCompanies = useMemo(() => {
    if (!companies || companies.length === 0) return [];

    return companies.filter((comp) => {
      // 1. 인증 유지 vs 전체 라디오 필터
      if (docScopeFilter === 'active') {
        if (!isNormalCompany(comp)) return false;
      }

      // 2. 검색어 필터링
      if (!docCompanySearch || !docCompanySearch.trim()) return true;

      const query = normalizeCompanyName(docCompanySearch);
      if (!query) return true;

      const compName = normalizeCompanyName(comp.companyName);
      const origCompName = normalizeCompanyName((comp as any).originalCompanyName || '');
      const ceoName = normalizeCompanyName(comp.ceoName);
      const origCeoName = normalizeCompanyName((comp as any).originalCeoName || '');
      const bizNo = cleanBizNo(comp.bizNumber);
      const certNo = (comp.certNo || '').toLowerCase();

      return (
        compName.includes(query) ||
        origCompName.includes(query) ||
        ceoName.includes(query) ||
        origCeoName.includes(query) ||
        bizNo.includes(query) ||
        certNo.includes(query)
      );
    });
  }, [companies, docScopeFilter, docCompanySearch]);

  // 2. 현재 선택된 기업 객체
  const selectedDocCompany = useMemo(() => {
    if (!selectedDocCompanyId) return null;
    return companies.find(c => c.id === selectedDocCompanyId) || null;
  }, [companies, selectedDocCompanyId]);

  // 3. 선택된 기업의 실제 심사 프로젝트 (projects 또는 legacyProjects에서 정규화된 10자리 사업자번호/기업명 매칭)
  const matchingProjects = useMemo<AuditProject[]>(() => {
    if (!selectedDocCompany) return [];
    const cleanBiz = cleanBizNo(selectedDocCompany.bizNumber);
    const normCompName = normalizeCompanyName(selectedDocCompany.companyName);
    const allProjects = (projects && projects.length > 0) ? projects : getMergedProjects();

    return allProjects.filter(p => {
      if (p.companyId && selectedDocCompany.id && p.companyId === selectedDocCompany.id) return true;
      if (p.companyName && normalizeCompanyName(p.companyName) === normCompName) return true;
      const pBiz = cleanBizNo((p as any).bizNumber);
      if (cleanBiz && cleanBiz.length === 10 && pBiz === cleanBiz) return true;
      return false;
    });
  }, [projects, selectedDocCompany]);

  // 4. 외부(CompanyDetailModal 등) 라우팅 타겟 수신 시 10자리 순수 사업자등록번호 기준 자동 고객사 선택
  useEffect(() => {
    if (!initialDocTarget) return;

    setDocScopeFilter('all');
    setDocCompanySearch('');

    const targetBizPure = cleanBizNo(initialDocTarget.bizNumber);
    const targetComp = companies.find(c => {
      const cBizPure = cleanBizNo(c.bizNumber);
      if (targetBizPure && targetBizPure.length === 10 && cBizPure === targetBizPure) {
        return true;
      }
      if (initialDocTarget.companyId && c.id === initialDocTarget.companyId) {
        return true;
      }
      if (initialDocTarget.companyName && normalizeCompanyName(c.companyName) === normalizeCompanyName(initialDocTarget.companyName)) {
        return true;
      }
      return false;
    });

    if (targetComp) {
      setSelectedDocCompanyId(targetComp.id);
    }
  }, [initialDocTarget, companies]);

  // 5. 선택된 기업 변경 시 실제 Firebase Cloud Storage / Firestore 문서 비동기 쿼리
  useEffect(() => {
    if (!selectedDocCompanyId) {
      setCompanyAuditDocs([]);
      setSelectedDocItem(null);
      setSelectedPdfUrl(null);
      return;
    }
    const targetComp = companies.find(c => c.id === selectedDocCompanyId);
    if (!targetComp) return;

    let isMounted = true;
    setIsCompanyDocsLoading(true);

    getCompanyAuditDocuments(targetComp.companyName)
      .then((docs) => {
        if (!isMounted) return;
        setCompanyAuditDocs(docs);
        setIsCompanyDocsLoading(false);
      })
      .catch((err) => {
        console.error('문서 목록 로드 오류:', err);
        if (isMounted) {
          setCompanyAuditDocs([]);
          setIsCompanyDocsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDocCompanyId, companies]);

  // 6. [2단계] 심사 년도 및 차수 옵션 동적 집계 (프로젝트 + Firebase 보관문서 + 마스터 원장 종합)
  const auditRoundOptions = useMemo<{
    key: string;
    label: string;
    year?: number;
    stage?: string;
    docCount: number;
  }[]>(() => {
    if (!selectedDocCompany) {
      return [{ key: 'all', label: '고객사를 먼저 선택해 주세요', docCount: 0 }];
    }

    const roundsMap = new Map<string, { key: string; label: string; year: number; stage: string }>();

    // ① matchingProjects (실제 심사 프로젝트 대장)
    matchingProjects.forEach((proj, idx) => {
      const startD = proj.startDate || proj.auditDates?.[0] || '';
      const yr = startD ? new Date(startD).getFullYear() : ((proj as any).auditYear || 2026);
      const stage = formatCleanAuditStage(proj.auditType);
      const roundKey = `round-${yr}-${stage}`;
      if (!roundsMap.has(roundKey)) {
        roundsMap.set(roundKey, {
          key: roundKey,
          label: `${yr}년 | ${stage}`,
          year: yr,
          stage
        });
      }
    });

    // ② companyAuditDocs (Firebase Storage / 아카이브 문서)
    companyAuditDocs.forEach((doc) => {
      const yr = doc.year || 2026;
      const stage = formatCleanAuditStage(doc.auditType || doc.docType);
      const roundKey = `round-${yr}-${stage}`;
      if (!roundsMap.has(roundKey)) {
        roundsMap.set(roundKey, {
          key: roundKey,
          label: `${yr}년 | ${stage}`,
          year: yr,
          stage
        });
      }
    });

    // ③ 기업 마스터 원장 내 auditHistory 필드 (있는 경우)
    const rawHist = (selectedDocCompany as any).auditHistory;
    if (Array.isArray(rawHist)) {
      rawHist.forEach((h: any) => {
        const yr = Number(h.year || h.auditYear) || 2026;
        const stage = formatCleanAuditStage(h.auditType || h.stage || h.degree);
        const roundKey = `round-${yr}-${stage}`;
        if (!roundsMap.has(roundKey)) {
          roundsMap.set(roundKey, {
            key: roundKey,
            label: `${yr}년 | ${stage}`,
            year: yr,
            stage
          });
        }
      });
    }

    // 기본 심사 이력이 전혀 없는 신규 고객사의 경우 2026년 기준 3개년 표준 주기 동적 생성
    if (roundsMap.size === 0) {
      const curYear = new Date().getFullYear();
      ['1차 사후', '2차 사후', '갱신심사'].forEach((stg) => {
        const roundKey = `round-${curYear}-${stg}`;
        roundsMap.set(roundKey, {
          key: roundKey,
          label: `${curYear}년 | ${stg}`,
          year: curYear,
          stage: stg
        });
      });
    }

    // 각 심사 차수별 실제 보관 PDF 문서 개수 카운팅
    const roundsList = Array.from(roundsMap.values()).map(r => {
      const count = companyAuditDocs.filter(d => {
        const dy = d.year || 2026;
        const ds = formatCleanAuditStage(d.auditType || d.docType);
        return dy === r.year && (ds === r.stage || (d.auditType && d.auditType.includes(r.stage)));
      }).length;

      return {
        ...r,
        docCount: count,
        label: count > 0 ? `${r.year}년 | ${r.stage} (${count}건 보관)` : `${r.year}년 | ${r.stage}`
      };
    });

    // 연도 내림차순 정렬
    roundsList.sort((a, b) => (b.year || 0) - (a.year || 0));

    return [
      { key: 'all', label: `전체 심사 차수 (${companyAuditDocs.length}건 보관)`, docCount: companyAuditDocs.length },
      ...roundsList
    ];
  }, [selectedDocCompany, matchingProjects, companyAuditDocs]);

  // 7. [차수 자동 바인딩] initialDocTarget 및 차수 목록 변경 시 일치 차수 자동 선택
  useEffect(() => {
    if (!selectedDocCompany) {
      setSelectedDocAuditRound('all');
      return;
    }

    if (initialDocTarget) {
      const targetBizPure = cleanBizNo(initialDocTarget.bizNumber);
      const cBizPure = cleanBizNo(selectedDocCompany.bizNumber);
      const isTargetCompany = 
        (targetBizPure && targetBizPure.length === 10 && cBizPure === targetBizPure) ||
        (initialDocTarget.companyId && selectedDocCompany.id === initialDocTarget.companyId) ||
        (initialDocTarget.companyName && normalizeCompanyName(selectedDocCompany.companyName) === normalizeCompanyName(initialDocTarget.companyName));

      if (isTargetCompany) {
        const targetYear = initialDocTarget.auditYear ? Number(initialDocTarget.auditYear) : null;
        const targetStage = initialDocTarget.auditStage ? formatCleanAuditStage(initialDocTarget.auditStage) : '';

        // 1순위: 연도 및 차수가 모두 일치하는 옵션 검색
        const exactRound = auditRoundOptions.find(opt => {
          if (opt.key === 'all') return false;
          const yearMatch = targetYear ? opt.year === targetYear : true;
          const stageMatch = targetStage ? (opt.stage === targetStage || opt.stage?.includes(targetStage) || targetStage.includes(opt.stage || '')) : true;
          return yearMatch && stageMatch;
        });

        if (exactRound) {
          setSelectedDocAuditRound(exactRound.key);
          return;
        }

        // 2순위: 연도 또는 차수가 일치하는 옵션 검색
        const partialRound = auditRoundOptions.find(opt => {
          if (opt.key === 'all') return false;
          if (targetYear && opt.year === targetYear) return true;
          if (targetStage && (opt.stage === targetStage || opt.stage?.includes(targetStage))) return true;
          return false;
        });

        if (partialRound) {
          setSelectedDocAuditRound(partialRound.key);
          return;
        }
      }
    }

    // 기본값: 첫 번째 개별 차수 또는 'all'
    if (auditRoundOptions.length > 1 && selectedDocAuditRound === 'all') {
      setSelectedDocAuditRound(auditRoundOptions[1].key);
    }
  }, [selectedDocCompany, initialDocTarget, auditRoundOptions]);

  // 8. [3단계] 선택된 차수에 해당하는 실제 Firebase Storage PDF 목록 필터링
  const filteredDocList = useMemo<AuditDocumentRecord[]>(() => {
    if (!companyAuditDocs || companyAuditDocs.length === 0) return [];
    if (selectedDocAuditRound === 'all') return companyAuditDocs;

    const matchedRound = auditRoundOptions.find(r => r.key === selectedDocAuditRound);
    if (!matchedRound || !matchedRound.year) return companyAuditDocs;

    const targetYear = matchedRound.year;
    const targetStageClean = (matchedRound.stage || '').replace(/\s+/g, '');

    return companyAuditDocs.filter(d => {
      // 연도 매칭 (d.year 또는 fileName/storagePath 포함)
      const docYear = d.year;
      const yearMatches = docYear === targetYear || 
                          d.simplifiedFileName?.includes(String(targetYear)) || 
                          d.originalFileName?.includes(String(targetYear)) ||
                          d.storagePath?.includes(String(targetYear));

      if (!yearMatches) return false;

      // 차수 매칭
      const docStageClean = formatCleanAuditStage(d.auditType || d.docType).replace(/\s+/g, '');
      const rawAuditType = (d.auditType || '').replace(/\s+/g, '');
      const rawFileName = (d.simplifiedFileName || d.originalFileName || '').replace(/\s+/g, '');

      const stageMatches = 
        docStageClean === targetStageClean ||
        rawAuditType.includes(targetStageClean) ||
        targetStageClean.includes(rawAuditType) ||
        rawFileName.includes(targetStageClean);

      return stageMatches;
    });
  }, [companyAuditDocs, selectedDocAuditRound, auditRoundOptions]);

  // 9. [문서 자동 선택 및 PDF URL 로드] filteredDocList 변경 시 첫 번째 문서 자동 로드
  useEffect(() => {
    let isMounted = true;

    if (filteredDocList.length > 0) {
      const currentStillValid = selectedDocItem && filteredDocList.some(d => d.id === selectedDocItem.id);
      const targetDoc = currentStillValid ? selectedDocItem : filteredDocList[0];

      if (targetDoc) {
        setSelectedDocItem(targetDoc);
        if (targetDoc.downloadUrl) {
          setSelectedPdfUrl(targetDoc.downloadUrl);
        } else if (targetDoc.storagePath) {
          setIsPdfLoading(true);
          getDocumentDownloadUrl(targetDoc.storagePath).then(url => {
            if (isMounted) {
              setSelectedPdfUrl(url);
              setIsPdfLoading(false);
            }
          }).catch(() => {
            if (isMounted) setIsPdfLoading(false);
          });
        }
      }
    } else {
      setSelectedDocItem(null);
      setSelectedPdfUrl(null);
    }

    return () => {
      isMounted = false;
    };
  }, [filteredDocList]);

  // 10. [스토리지 경로 정합성 점검] Storage 실제 경로 및 파라미터 콘솔 로깅
  useEffect(() => {
    if (!selectedDocCompany) return;

    const bizNumber = cleanBizNo(selectedDocCompany.bizNumber);
    const companyName = selectedDocCompany.companyName;
    const certNo = selectedDocCompany.certNo || '-';
    const selectedCycle = selectedDocAuditRound;
    const targetStoragePath = selectedDocItem?.storagePath || `audit_files/${selectedDocCompany.companyName}/`;

    console.log('[DocStorage DEBUG] Searching Storage Path:', targetStoragePath);
    console.log('[DocStorage DEBUG] Params:', { bizNumber, companyName, certNo, selectedCycle });
    console.log('[DocStorage DEBUG] Total Company Audit Docs:', companyAuditDocs.length, companyAuditDocs);
    console.log('[DocStorage DEBUG] Filtered Cycle Docs:', filteredDocList.length, filteredDocList.map(d => ({
      id: d.id,
      docType: d.docType,
      year: d.year,
      auditType: d.auditType,
      storagePath: d.storagePath,
      downloadUrl: d.downloadUrl
    })));
  }, [selectedDocCompany, selectedDocAuditRound, selectedDocItem, companyAuditDocs, filteredDocList]);

  // 고객사 선택 핸들러
  const handleSelectCompany = (compId: string) => {
    setSelectedDocCompanyId(compId || null);
    setSelectedDocAuditRound('all');
  };

  // 심사 차수 선택 핸들러
  const handleSelectRound = (roundKey: string) => {
    setSelectedDocAuditRound(roundKey);
  };

  // 개별 문서 선택 핸들러
  const handleSelectDocument = (docId: string) => {
    const doc = companyAuditDocs.find(d => d.id === docId);
    if (!doc) return;

    setSelectedDocItem(doc);
    if (doc.downloadUrl) {
      setSelectedPdfUrl(doc.downloadUrl);
    } else if (doc.storagePath) {
      setIsPdfLoading(true);
      getDocumentDownloadUrl(doc.storagePath).then(url => {
        setSelectedPdfUrl(url);
        setIsPdfLoading(false);
      }).catch(err => {
        console.error('PDF 다운로드 URL 획득 오류:', err);
        setIsPdfLoading(false);
      });
    }
  };

  // 다운로드 핸들러
  const handleDownloadPdf = async () => {
    if (!selectedDocItem) return;
    const url = selectedPdfUrl || await getDocumentDownloadUrl(selectedDocItem.storagePath);
    if (!url) {
      alert('문서 다운로드 URL을 가져올 수 없습니다.');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedDocItem.simplifiedFileName || selectedDocItem.originalFileName || 'audit_document.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // A4 인쇄 핸들러
  const handlePrintPdf = () => {
    const iframe = document.getElementById('doc-storage-pdf-viewer-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else if (selectedPdfUrl) {
      const win = window.open(selectedPdfUrl, '_blank');
      if (win) {
        win.focus();
        win.print();
      }
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* 1. 상단 타이틀 바 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-700" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">문서 보관함 (탐색기)</h2>
            <span className="text-[11px] bg-indigo-50 text-indigo-900 border border-indigo-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
              Firebase Cloud Storage 실시간 연동
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            3단계 풀다운 메뉴로 고객사와 심사 차수를 지정하여 해당 기업의 실제 공인 PDF 문서를 격리 열람·인쇄·다운로드합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-mono bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 font-bold">
            인증 기업: {filteredDocCompanies.length}개사 {selectedDocCompany ? `| 선택 기업 문서: ${companyAuditDocs.length}건` : ''}
          </span>
        </div>
      </div>

      {/* 2. 화면 2분할 레이아웃 (좌측: 3단계 계층형 풀다운 패널 / 우측: PDF 뷰어) */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-[660px]">
        
        {/* ========================================================================= */}
        {/* [좌측 영역] 3단계 계층형 풀다운 메뉴 패널 (너비: 약 400px) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[400px] shrink-0 bg-slate-50 rounded-xl border border-slate-300 flex flex-col justify-between overflow-hidden shadow-2xs">
          
          {/* 상단 3단계 풀다운 컨트롤 영역 */}
          <div className="p-4 space-y-4 overflow-y-auto">
            
            {/* ------------------------------------------------------------- */}
            {/* 1단계: 고객사 범위 및 고객사 선택 풀다운 */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-700 text-white text-[10px] flex items-center justify-center font-mono">1</span>
                  <span>고객사 선택</span>
                </span>
                <div className="flex items-center gap-2.5 text-[11px] font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="docScopeFilterGroup"
                      value="active"
                      checked={docScopeFilter === 'active'}
                      onChange={() => setDocScopeFilter('active')}
                      className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={docScopeFilter === 'active' ? 'text-indigo-950 font-bold' : 'text-slate-500'}>
                      인증 유지 ({companies.filter(c => isNormalCompany(c)).length}개)
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="docScopeFilterGroup"
                      value="all"
                      checked={docScopeFilter === 'all'}
                      onChange={() => setDocScopeFilter('all')}
                      className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={docScopeFilter === 'all' ? 'text-indigo-950 font-bold' : 'text-slate-500'}>
                      전체 기업 ({companies.length}개)
                    </span>
                  </label>
                </div>
              </div>

              {/* 실시간 기업 검색 인풋 */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={docCompanySearch}
                  onChange={(e) => setDocCompanySearch(e.target.value)}
                  placeholder="고객사명, 사업자번호, 대표자 검색..."
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium placeholder:text-slate-400"
                />
                {docCompanySearch && (
                  <button
                    type="button"
                    onClick={() => setDocCompanySearch('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* 1단계 풀다운 셀렉트 박스 */}
              <div>
                <select
                  value={selectedDocCompanyId || ''}
                  onChange={(e) => handleSelectCompany(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- 조회할 고객사를 선택하세요 --</option>
                  {filteredDocCompanies.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.companyName} ({comp.ceoName} 대표 | {comp.bizNumber || '-'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 선택된 기업 요약 카드 */}
            {selectedDocCompany ? (
              <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-1.5 shadow-2xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-sm">{selectedDocCompany.companyName}</span>
                  <span className="text-[10px] font-mono font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    {selectedDocCompany.certNo || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 pt-0.5">
                  <div><span className="text-slate-400">대표자:</span> <strong className="text-slate-900">{selectedDocCompany.ceoName || '-'}</strong></div>
                  <div><span className="text-slate-400">사업자:</span> <span className="font-mono">{selectedDocCompany.bizNumber || '-'}</span></div>
                  <div className="col-span-2 truncate"><span className="text-slate-400">인증표준:</span> <span className="font-mono font-semibold text-indigo-900">{Array.isArray(selectedDocCompany.standards) ? selectedDocCompany.standards.join(', ') : (selectedDocCompany.standards || '-')}</span></div>
                  <div className="col-span-2 truncate text-[10.5px] text-slate-500"><span className="text-slate-400">사업장:</span> {selectedDocCompany.address || '-'}</div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-100/70 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                위 드롭다운에서 조회할 고객사를 선택해 주세요.
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 2단계: 심사 년도 및 차수 선택 풀다운 */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-mono">2</span>
                  <span>심사 년도 및 차수 선택</span>
                </span>
                {selectedDocCompany && (
                  <span className="text-[10.5px] font-mono text-slate-500">
                    {auditRoundOptions.length - 1}개 심사 이력
                  </span>
                )}
              </div>
              
              <select
                disabled={!selectedDocCompany}
                value={selectedDocAuditRound}
                onChange={(e) => handleSelectRound(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {auditRoundOptions.map(opt => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 3단계: 보관 PDF 문서 선택 풀다운 */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-700 text-white text-[10px] flex items-center justify-center font-mono">3</span>
                  <span>보관 PDF 문서 선택</span>
                </span>
                {selectedDocCompany && (
                  <span className="text-[10.5px] font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {filteredDocList.length}건 보관
                  </span>
                )}
              </div>

              {!selectedDocCompany ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-400">
                  고객사를 먼저 선택해 주세요.
                </div>
              ) : isCompanyDocsLoading ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Firebase Storage 문서 목록 조회 중...</span>
                </div>
              ) : filteredDocList.length === 0 ? (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-center space-y-1">
                  <div className="text-xs font-bold text-amber-900">스토리지 보관 문서 없음 (FTP 미이관 대상)</div>
                  <p className="text-[10.5px] text-amber-700">
                    선택하신 심사 차수에 Firebase Storage에 아카이빙된 공인 PDF 파일이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedDocItem?.id || ''}
                    onChange={(e) => handleSelectDocument(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border-2 border-cyan-500/80 rounded-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-2xs"
                  >
                    {filteredDocList.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        [{doc.docType}] {doc.simplifiedFileName || doc.originalFileName} ({formatFileSizeBytes(doc.fileSizeBytes)})
                      </option>
                    ))}
                  </select>

                  {/* 선택된 문서 메타 카드 */}
                  {selectedDocItem && (
                    <div className="p-2.5 bg-cyan-50/60 border border-cyan-200 rounded-lg text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-cyan-950 font-bold">서식 구분: {selectedDocItem.docType}</span>
                        <span className="font-mono text-cyan-800">{formatFileSizeBytes(selectedDocItem.fileSizeBytes)}</span>
                      </div>
                      <div className="text-slate-600 truncate">
                        <strong>파일명:</strong> {selectedDocItem.simplifiedFileName || selectedDocItem.originalFileName}
                      </div>
                      <div className="text-slate-500 flex items-center justify-between text-[10.5px] font-mono">
                        <span>등록년도: {selectedDocItem.year}년</span>
                        <span>심사원: {selectedDocItem.auditorName || '사무국'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* 좌측 하단 정보 바 */}
          <div className="p-3 bg-slate-100 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="truncate max-w-[260px]">
              {selectedDocItem 
                ? selectedDocItem.storagePath 
                : (selectedDocCompany ? `audit_files/${selectedDocCompany.companyName}/` : 'audit_files/')}
            </span>
            <span className="font-bold text-indigo-900 shrink-0">Cloud Storage</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* [우측 영역] PDF 문서 열람 및 A4 인쇄 뷰어 (가변 너비, 우측 전체) */}
        {/* ========================================================= */}
        <div className="flex-1 bg-slate-100/90 rounded-xl border border-slate-300 flex flex-col overflow-hidden shadow-xs">
          
          {/* 1. 상단 액션 툴바 */}
          <div className="p-3.5 bg-white border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            {selectedDocItem && selectedDocCompany ? (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 text-[11px] font-mono font-bold">
                    {selectedDocItem.docType} ({selectedDocItem.year}년)
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {selectedDocItem.simplifiedFileName || selectedDocItem.originalFileName}
                  </h4>
                </div>
                <p className="text-[11.5px] text-slate-500 mt-0.5 flex items-center gap-3">
                  <span><strong>기업명:</strong> {selectedDocCompany.companyName}</span>
                  <span>|</span>
                  <span><strong>심사차수:</strong> {selectedDocItem.auditType || '정기심사'}</span>
                  <span>|</span>
                  <span><strong>용량:</strong> <span className="font-mono font-bold text-indigo-900">{formatFileSizeBytes(selectedDocItem.fileSizeBytes)}</span></span>
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-medium">열람할 문서를 선택해 주세요.</div>
            )}

            {/* 액션 버튼 */}
            {selectedDocItem && selectedPdfUrl && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>다운로드</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-indigo-950 text-white rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>🖨️ A4 인쇄 / PDF 저장</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. PDF 뷰어 렌더링 본문 */}
          <div className="flex-1 bg-slate-200/80 p-3 sm:p-4 overflow-hidden flex items-center justify-center relative min-h-[500px]">
            {isPdfLoading ? (
              <div className="flex flex-col items-center justify-center text-center space-y-3 p-8 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-300 shadow-lg">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <div className="text-xs font-bold text-slate-800">Firebase Storage에서 고화질 PDF를 불러오는 중입니다...</div>
                <p className="text-[11px] text-slate-500">잠시만 기다려 주십시오.</p>
              </div>
            ) : selectedPdfUrl ? (
              <div className="w-full h-full bg-white rounded-lg border border-slate-300 shadow-md overflow-hidden flex flex-col">
                <iframe
                  id="doc-storage-pdf-viewer-frame"
                  src={`${selectedPdfUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-0 bg-white min-h-[550px]"
                  title={selectedDocItem?.simplifiedFileName || 'PDF Viewer'}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-slate-300 max-w-md my-auto shadow-2xs">
                <FileText className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-800">
                  {selectedDocCompany ? '스토리지 보관 문서 없음 (FTP 미이관 대상)' : '고객사를 선택해 주세요.'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {selectedDocCompany 
                    ? `[${selectedDocCompany.companyName}]의 선택하신 심사 차수에 Firebase Storage에 아카이빙된 공인 PDF 파일이 존재하지 않습니다.`
                    : '좌측에서 고객사와 심사 차수를 선택하시면 보관된 PDF 문서가 여기에 로드됩니다.'}
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
