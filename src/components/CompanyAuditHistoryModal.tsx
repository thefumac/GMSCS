import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  X, 
  Calendar as CalendarIcon, 
  FileText, 
  Award, 
  UserCheck, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { Company, AuditProject, CertContract, Auditor, AuditReport, AuditorSettlement, AuditContractRecord } from '../types';
import { cleanCeoName, cleanPersonName } from '../utils/personUtils';
import { getDriveReportsForCompany, DriveReportFileItem } from '../data/driveReportFiles';
import { getAuditTimelineStatus } from '../utils/auditStateUtils';

export interface DocStorageTarget {
  companyId?: string;
  companyName?: string;
  bizNumber?: string;
  auditYear?: number | string;
  auditStage?: string;
  roundKey?: string;
}

export interface CompanyAuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  contracts?: CertContract[];
  auditContracts?: AuditContractRecord[];
  projects?: AuditProject[];
  reports?: Record<string, AuditReport>;
  settlements?: AuditorSettlement[];
  allAuditors?: Auditor[];
  onOpenReport?: (reportId: string) => void;
  onOpenReportWorkbench?: (company: Company) => void;
  onOpenPlanInvoiceModal?: (company: Company) => void;
  onOpenPdfReport?: (info: { title: string; companyName: string; standard?: string; auditType?: string; auditDate?: string; auditorName?: string; pdfUrl?: string }) => void;
  onNavigateToDocStorage?: (target: DocStorageTarget) => void;
}

// 심사 구분 표준 판정 (괄호 중복 없이 간결하게 '최초심사', '1차 사후', '2차 사후', '갱신심사', '전환심사')
export function formatCleanAuditStage(rawStage?: string): string {
  if (!rawStage) return '1차 사후';
  const s = rawStage.trim();
  if (s.includes('최초') || s.includes('1단계') || s.includes('2단계') || s.includes('1-2') || s.includes('1·2') || s.includes('신규')) {
    return '최초심사';
  }
  if (s.includes('1차') || s.includes('사후1') || s.includes('사후 1')) {
    return '1차 사후';
  }
  if (s.includes('2차') || s.includes('사후2') || s.includes('사후 2')) {
    return '2차 사후';
  }
  if (s.includes('갱신') || s.includes('재인증')) {
    return '갱신심사';
  }
  if (s.includes('전환')) {
    return '전환심사';
  }
  if (s.includes('특별') || s.includes('임시')) {
    return '특별심사';
  }
  return '1차 사후';
}

// 심사 성격 계산 (원장 우선 및 최초인증일/3년주기/만료일 기반 정밀 판정)
function getAuditStage(comp: Company, contract?: CertContract, project?: AuditProject): string {
  if (project?.auditType) {
    const pType = project.auditType;
    if (pType.includes('1차') || pType.includes('사후1')) return '1차 사후';
    if (pType.includes('2차') || pType.includes('사후2')) return '2차 사후';
    if (pType.includes('갱신') || pType.includes('재인증')) return '갱신심사';
    if (pType.includes('전환')) return '전환심사';

    // 최초심사 지정된 경우 최초인증일과의 격차 검증 (45일 초과 시 주기 기반 자동 판정)
    if (pType.includes('최초') || pType.includes('1-2단계') || pType.includes('1·2단계') || pType.includes('신규')) {
      const initDateStr = comp.initialCertDate || contract?.initialCertDate || comp.initialContractDate;
      const auditDateStr = project.startDate || project.endDate;
      if (initDateStr && auditDateStr) {
        const initD = new Date(initDateStr);
        const auditD = new Date(auditDateStr);
        if (!isNaN(initD.getTime()) && !isNaN(auditD.getTime())) {
          const diffDays = Math.abs(auditD.getTime() - initD.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays <= 45) {
            return '최초심사';
          }
        }
      } else {
        return '최초심사';
      }
    }
  }

  // 3년 만료일 근접 시 갱신심사 판정
  const expStr = comp.expiryDate || contract?.validUntil;
  if (expStr) {
    const expD = new Date(expStr);
    const targetD = project?.startDate ? new Date(project.startDate) : new Date('2026-09-19');
    if (!isNaN(expD.getTime()) && !isNaN(targetD.getTime())) {
      const diffD = (expD.getTime() - targetD.getTime()) / (1000 * 60 * 60 * 24);
      if (diffD >= -60 && diffD <= 120) {
        return '갱신심사';
      }
    }
  }

  const baseDateStr = comp.cycleBaseDate || comp.certStartDate || contract?.initialCertDate || comp.initialCertDate;
  if (baseDateStr) {
    const baseD = new Date(baseDateStr);
    if (!isNaN(baseD.getTime())) {
      const targetD = project?.startDate ? new Date(project.startDate) : new Date('2026-09-19');
      const diffMonths = (targetD.getFullYear() - baseD.getFullYear()) * 12 + (targetD.getMonth() - baseD.getMonth());
      const cycleMonth = ((diffMonths % 36) + 36) % 36;

      if (cycleMonth <= 14) return '1차 사후';
      if (cycleMonth <= 26) return '2차 사후';
      return '갱신심사';
    }
  }

  return '1차 사후';
}

function getStandardsWithCertNo(comp?: Company | null, contract?: CertContract): { std: string; certNo: string }[] {
  if (!comp) return [];
  const compAny = comp as any;
  let stds: string[] = [];

  if (contract?.standards && Array.isArray(contract.standards) && contract.standards.length > 0) {
    stds = contract.standards;
  } else if (compAny.standards) {
    if (Array.isArray(compAny.standards)) {
      stds = compAny.standards;
    } else if (typeof compAny.standards === 'string') {
      stds = compAny.standards.split(/[/,;]+/).map((s: string) => s.trim()).filter(Boolean);
    }
  }

  const realCertNo = contract?.certNumber || compAny.certNo || (comp as any).certNo || '';

  return stds.map((rawS: string) => {
    const s = (typeof rawS === 'string' ? rawS : String(rawS))
      .replace(/\s*\((?:QMS|EMS|OHS|ISMS|품질|환경|안전보건|안전)\)/gi, '')
      .trim();
    return { std: s, certNo: realCertNo || '-' };
  });
}

export interface AuditHistoryEntry {
  key: string;
  year?: number | string;
  month?: number | string;
  dateDisplay: string;
  mdDisplay: string;
  stageDisplay: string;
  standardsDisplay: string;
  auditorDisplay: string;
  statusDisplay: string;
  isCompleted: boolean;
  project?: AuditProject;
  archivedGroup?: {
    year?: number | string;
    month?: number | string;
    auditType?: string;
  };
}

export const CompanyAuditHistoryModal: React.FC<CompanyAuditHistoryModalProps> = ({
  isOpen,
  onClose,
  company,
  contracts = [],
  auditContracts = [],
  projects = [],
  allAuditors = [],
  onOpenReport,
  onOpenReportWorkbench,
  onOpenPdfReport,
  onNavigateToDocStorage
}) => {
  // 실시간 로컬스토리지 및 심사보고서(인정범위확인서) 변경분 병합
  const effectiveCompany = useMemo(() => {
    if (!company) return null;
    try {
      const compId = company.id || company.companyName;
      // 1순위: 보고서 팩에서 저장된 SCOPE_CONFIRM
      const packScope = localStorage.getItem(`GMSCS_PACK_FULL_${compId}_SCOPE_CONFIRM`);
      let scopeData: any = {};
      if (packScope) {
        const parsed = JSON.parse(packScope);
        scopeData = {
          scope: parsed.scopeKor,
          scopeEng: parsed.scopeEng,
          companyNameEng: parsed.companyNameEng,
          addressEng: parsed.addressEng,
          scopeUpdatedAt: parsed.updatedAt
        };
      }

      // 2순위: gmscs_company_overrides
      const saved = localStorage.getItem('gmscs_company_overrides');
      const overrides = saved ? JSON.parse(saved) : {};
      const compOverride = overrides[compId] || {};

      return {
        ...company,
        ...compOverride,
        ...scopeData
      };
    } catch (e) {}
    return company;
  }, [company, isOpen]);

  const archivedDocs = useMemo<DriveReportFileItem[]>(() => {
    return effectiveCompany ? getDriveReportsForCompany(effectiveCompany.companyName) : [];
  }, [effectiveCompany]);

  // 업종 / 주요생산품 (ISO 규격명이 잘못 노출되지 않도록 필터링 및 실제 업종/생산품 필드 바인딩)
  const displayIndustry = useMemo(() => {
    if (!effectiveCompany) return '-';
    const compAny = effectiveCompany as any;
    const raw = (
      effectiveCompany.industry || 
      compAny.businessType || 
      compAny.product || 
      compAny.mainProduct || 
      compAny.industryType || 
      ''
    ).trim();

    if (!raw) return '-';
    // ISO/인증규격 문자열이 잘못 들어있는 경우 배제하고 '-' 처리
    if (/^ISO\s*\d+|^\d{4,5}|KS\s*Q|K-OHSAS|HACCP|IATF/i.test(raw)) {
      return '-';
    }
    return raw;
  }, [effectiveCompany]);

  const contract = useMemo(() => {
    if (!effectiveCompany) return undefined;
    return contracts.find(c => c.companyId === effectiveCompany.id);
  }, [contracts, effectiveCompany]);

  const matchingProjects = useMemo(() => {
    if (!effectiveCompany) return [];
    const cleanBiz = (effectiveCompany.bizNumber || '').replace(/[^0-9]/g, '');
    const normCompName = (effectiveCompany.companyName || '').replace(/[\s\(\)\[\]주식회사㈜\.\-_]/g, '').toLowerCase();

    return projects.filter(p => {
      if (p.companyId && effectiveCompany.id && p.companyId === effectiveCompany.id) return true;
      if (p.companyName === effectiveCompany.companyName) return true;
      if (cleanBiz && (p as any).bizNumber && (p as any).bizNumber.replace(/[^0-9]/g, '') === cleanBiz) return true;
      const pNorm = (p.companyName || '').replace(/[\s\(\)\[\]주식회사㈜\.\-_]/g, '').toLowerCase();
      if (pNorm && normCompName && pNorm === normCompName) return true;
      return false;
    });
  }, [projects, effectiveCompany]);

  const latestProject = matchingProjects[0];
  const matchingAuditContract = useMemo(() => {
    if (!effectiveCompany) return undefined;
    return auditContracts.find(c => c.companyId === effectiveCompany.id || c.companyName === effectiveCompany.companyName);
  }, [auditContracts, effectiveCompany]);
  
  const stageText = useMemo(() => {
    if (!effectiveCompany) return '1차 사후';
    return getAuditStage(effectiveCompany, contract, latestProject);
  }, [effectiveCompany, contract, latestProject]);

  const stdAndCerts = useMemo(() => {
    return getStandardsWithCertNo(effectiveCompany, contract);
  }, [effectiveCompany, contract]);

  const timeline = useMemo(() => {
    if (!effectiveCompany) return null;
    return getAuditTimelineStatus(effectiveCompany, contract, latestProject);
  }, [effectiveCompany, contract, latestProject]);

  // 배정 심사원
  const managingAuditor = useMemo(() => {
    if (!effectiveCompany) return { name: '-', grade: '', mobile: '', email: '' };
    return allAuditors.find(a => a.id === effectiveCompany.managingAuditorId || a.id === latestProject?.leadAuditorId) 
      || allAuditors.find(a => a.name === latestProject?.leadAuditorName) 
      || { name: (effectiveCompany as any).assignedAuditor || effectiveCompany.assignedAuditorName || (effectiveCompany as any).leadAuditor || '-', grade: '선임심사원', mobile: '', email: '' };
  }, [allAuditors, effectiveCompany, latestProject]);

  const effectiveContractRecord: AuditContractRecord = useMemo(() => {
    if (matchingAuditContract) return matchingAuditContract;
    const comp = effectiveCompany || { id: '', companyName: '', bizNumber: '', totalEmployees: 0, consultant: '', agency: '' };
    return {
      id: `CTR-${comp.id}`,
      contractNumber: `CTR-${comp.bizNumber ? comp.bizNumber.replace(/[^0-9]/g, '').substring(0, 6) : ''}`,
      companyId: comp.id,
      companyName: comp.companyName,
      contractType: (stageText.includes('최초') ? '신규인증' : stageText.includes('갱신') ? '갱신심사' : '정기사후') as any,
      standards: stdAndCerts.map(s => s.std as any),
      employeeCount: comp.totalEmployees || 0,
      riskLevel: 'Medium',
      contractDate: contract?.initialCertDate || '',
      plannedAuditStartDate: latestProject?.startDate || '',
      contractStatus: (latestProject?.status === '계획수립' ? '진행중' : '계약체결') as any,
      leadAuditorId: (managingAuditor as any).id || '',
      leadAuditorName: managingAuditor.name || '',
      agency: comp.consultant || (comp as any).agency || '직영',
      kabStandardMd: 2.0,
      appliedMd: 2.0,
      standardRatePerMd: 800000,
      ratePerMd: 800000,
      standardFee: 1600000,
      finalFee: 2000000,
      docAuditMd: 0.5,
      docAuditFee: 500000,
      onsiteAuditMd: 1.5,
      onsiteAuditFee: 1100000,
      travelExpense: 200000,
      lodgingOption: '업체직접제공',
      lodgingNights: 0,
      lodgingExpense: 0,
      applicationFee: 200000,
      docFee: 500000,
      siteFee: 1100000,
      travelFee: 200000,
      lodgingFee: 0,
      lodgingProvidedByClient: true,
      appFee: 200000,
      approvalStatus: '승인완료',
      isAdjusted: false,
      planInvoiceDispatchStatus: (latestProject?.status === '계획서발송' || latestProject?.status === '심사진행중') ? '발송완료' : '발송대기',
      auditorResponseStatus: latestProject?.status === '심사진행중' ? '동의' : '미응답',
      agencyResponseStatus: latestProject?.status === '심사진행중' ? '동의' : '미응답',
      clientResponseStatus: latestProject?.status === '심사진행중' ? '동의' : '미응답'
    };
  }, [matchingAuditContract, effectiveCompany, stageText, stdAndCerts, contract, latestProject, managingAuditor]);

  // [실데이터 기반 심사 이력 및 문서 대장 목록 구축]
  const auditHistoryList = useMemo<AuditHistoryEntry[]>(() => {
    if (!effectiveCompany) return [];

    const items: AuditHistoryEntry[] = [];
    const coveredYears = new Set<number>();

    // 1. matchingProjects에서 추출 (실제 프로젝트)
    matchingProjects.forEach((proj, idx) => {
      const startD = proj.startDate || proj.auditDates?.[0] || '';
      const yr = startD ? new Date(startD).getFullYear() : ((proj as any).auditYear || 2026);
      if (!isNaN(yr)) coveredYears.add(yr);

      const dateStr = proj.auditDates && proj.auditDates.length > 1
        ? `${proj.startDate} ~ ${proj.endDate?.slice(5) || ''}`
        : (proj.startDate || (yr ? `${yr}` : '-'));
      const mdVal = proj.appliedMd ? `${proj.appliedMd.toFixed(1)} MD` : '-';
      const cleanStage = formatCleanAuditStage(proj.auditType || stageText);
      const auditorName = proj.leadAuditorName 
        ? `팀장: ${proj.leadAuditorName}${proj.teamAuditorNames?.length ? ` / 팀원: ${proj.teamAuditorNames.join(', ')}` : ''}`
        : ((effectiveCompany as any).assignedAuditor || managingAuditor.name || '-');
      
      const stds = proj.standards && proj.standards.length > 0 
        ? proj.standards.map(s => s.split(':')[0]).join(' · ')
        : (stdAndCerts.length > 0 ? stdAndCerts.map(s => s.std.split(':')[0]).join(' · ') : '-');

      const isDone = (proj.status as string) === '인증발행' || (proj.status as string) === '완료';

      items.push({
        key: `proj-${proj.id || idx}-${yr}`,
        year: yr,
        month: startD ? new Date(startD).getMonth() + 1 : undefined,
        dateDisplay: mdVal !== '-' ? `${dateStr} (${mdVal})` : dateStr,
        mdDisplay: mdVal,
        stageDisplay: cleanStage,
        standardsDisplay: stds,
        auditorDisplay: auditorName !== '-' ? `${auditorName} (선임)` : '-',
        statusDisplay: isDone ? '적합 (인증발행)' : ((proj.status as string) || '적합 (인증유지)'),
        isCompleted: isDone,
        project: proj,
        archivedGroup: {
          year: yr,
          month: startD ? new Date(startD).getMonth() + 1 : undefined,
          auditType: cleanStage
        }
      });
    });

    // 2. archivedDocs에서 추출 (Firebase Storage / Drive 실제 보관 문서 아카이브)
    if (archivedDocs.length > 0) {
      const groups: Record<string, {
        year?: number;
        month?: number;
        auditType: string;
        standards: string[];
        auditor: string;
      }> = {};

      archivedDocs.forEach((doc) => {
        const yearVal = Number(doc.year) || undefined;
        const monthVal = Number(doc.month) || undefined;
        const aType = formatCleanAuditStage(doc.auditType || '1차 사후');
        const gKey = `${yearVal || ''}_${monthVal || ''}_${aType}`;

        if (!groups[gKey]) {
          groups[gKey] = {
            year: yearVal,
            month: monthVal,
            auditType: aType,
            standards: doc.standards || [],
            auditor: doc.auditorName || doc.auditor || managingAuditor.name || '-'
          };
        }
        if (doc.standards) {
          doc.standards.forEach(s => {
            if (!groups[gKey].standards.includes(s)) {
              groups[gKey].standards.push(s);
            }
          });
        }
      });

      Object.entries(groups).forEach(([gKey, gVal]) => {
        const yr = gVal.year;
        const alreadyHas = items.some(it => (yr ? it.year === yr : true) && it.stageDisplay === gVal.auditType);
        if (!alreadyHas) {
          if (yr) coveredYears.add(yr);
          const dateStr = gVal.year ? (gVal.month ? `${gVal.year}.${String(gVal.month).padStart(2, '0')}` : `${gVal.year}`) : '-';
          const stds = gVal.standards.length > 0 
            ? gVal.standards.map(s => s.split(':')[0]).join(' · ')
            : (stdAndCerts.length > 0 ? stdAndCerts.map(s => s.std.split(':')[0]).join(' · ') : '-');

          items.push({
            key: `arch-${gKey}`,
            year: yr,
            month: gVal.month,
            dateDisplay: dateStr,
            mdDisplay: '-',
            stageDisplay: gVal.auditType,
            standardsDisplay: stds,
            auditorDisplay: gVal.auditor !== '-' ? `${gVal.auditor} (선임)` : '-',
            statusDisplay: '적합 (인증유지)',
            isCompleted: true,
            archivedGroup: {
              year: yr,
              month: gVal.month,
              auditType: gVal.auditType
            }
          });
        }
      });
    }

    // 3. (effectiveCompany as any).auditHistory (원장에 저장된 실제 이력)
    const rawHist = (effectiveCompany as any).auditHistory || (effectiveCompany as any).audits;
    if (Array.isArray(rawHist) && rawHist.length > 0) {
      rawHist.forEach((h: any, idx: number) => {
        const dt = h.auditDate || h.auditStartDate || h.startDate || '';
        const yr = dt ? new Date(dt).getFullYear() : null;
        const cleanStage = formatCleanAuditStage(h.auditType || h.stage || h.auditStage);
        if (yr && !isNaN(yr)) {
          const alreadyHas = items.some(it => it.year === yr && it.stageDisplay === cleanStage);
          if (!alreadyHas) {
            coveredYears.add(yr);
            const mdVal = h.md || h.appliedMd ? `${(h.md || h.appliedMd)} MD` : '-';
            const stds = h.standards ? (Array.isArray(h.standards) ? h.standards.map((s: string) => s.split(':')[0]).join(' · ') : h.standards) : (stdAndCerts.length > 0 ? stdAndCerts.map(s => s.std.split(':')[0]).join(' · ') : '-');
            const audName = h.leadAuditor || h.leadAuditorName || managingAuditor.name || '-';
            items.push({
              key: `rawHist-${idx}-${yr}`,
              year: yr,
              month: dt ? new Date(dt).getMonth() + 1 : undefined,
              dateDisplay: mdVal !== '-' ? `${dt} (${mdVal})` : dt,
              mdDisplay: mdVal,
              stageDisplay: cleanStage,
              standardsDisplay: stds,
              auditorDisplay: audName !== '-' ? `${audName} (선임)` : '-',
              statusDisplay: h.status || '적합 (인증유지)',
              isCompleted: true,
              archivedGroup: {
                year: yr,
                month: dt ? new Date(dt).getMonth() + 1 : undefined,
                auditType: cleanStage
              }
            });
          }
        }
      });
    }

    // 날짜/연도 내림차순 정렬
    return items.sort((a, b) => {
      const yrA = Number(a.year || 0);
      const yrB = Number(b.year || 0);
      if (yrB !== yrA) return yrB - yrA;
      const moA = Number(a.month || 0);
      const moB = Number(b.month || 0);
      return moB - moA;
    });
  }, [effectiveCompany, matchingProjects, archivedDocs, stageText, stdAndCerts, managingAuditor]);

  // [React Rules of Hooks 준수] 모든 Hook 선언 완료 후 조기 반환 처리
  if (!isOpen || !company || !effectiveCompany) return null;

  // 문서 관리 연동 액션 핸들러 (문서 보관함 탐색기로 자동 라우팅 - 보고서 뷰어/작성기 팝업 호출 전면 제거)
  const handleOpenDocStorageAction = (grp?: { year?: number | string; month?: number | string; auditType?: string }) => {
    if (onNavigateToDocStorage) {
      const pureBiz = (effectiveCompany.bizNumber || '').replace(/[^0-9]/g, '');
      onNavigateToDocStorage({
        companyId: effectiveCompany.id,
        companyName: effectiveCompany.companyName,
        bizNumber: pureBiz || effectiveCompany.bizNumber,
        auditYear: grp?.year,
        auditStage: grp?.auditType || stageText,
        roundKey: grp ? `${grp.year}_${grp.month}_${grp.auditType}` : undefined
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* ========================================================================= */}
        {/* 1. 상단 모달 헤더 (회사명, 사업자번호, 우측 상태 뱃지, 닫기)             */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-tight">
                {effectiveCompany.companyName}
              </h3>
              <span className="text-xs text-slate-300 font-mono">
                (사업자: {effectiveCompany.bizNumber || '-'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 상태 뱃지: 고객 원장 기준의 기본 상태 깔끔 단일 표시 */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{effectiveCompany.certStatus === '정지' || effectiveCompany.certStatus === '취소' ? effectiveCompany.certStatus : '인증유지 (유효)'}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. 모달 본문 통합 단일 뷰 (위: 마스터 정보 3열 카드 / 아래: 심사이력 대장) */}
        {/* ========================================================================= */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 text-slate-800 text-xs">
          
          {/* ------------------------------------------------------------- */}
          {/* ① 상단 섹션: [기업 및 인증 마스터 정보 (3열 카드)]            */}
          {/* ------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* 카드 1: 기업 기본 정보 (사업자번호 제거로 여백 확보) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 font-bold text-slate-900 text-xs">
                <Building2 className="w-3.5 h-3.5 text-cyan-700" />
                <span>기업 기본 정보</span>
              </div>
              <div className="space-y-1.5 text-[11.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-normal">대표자명:</span>
                  <span className="text-slate-900 font-medium">{cleanCeoName(effectiveCompany.ceoName)} 대표</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-normal">업종 / 주요생산품:</span>
                  <span className="text-slate-800 font-normal truncate max-w-[150px]" title={displayIndustry !== '-' ? displayIndustry : ''}>
                    {displayIndustry}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-normal">실무 담당자:</span>
                  <span className="text-slate-900 font-medium">
                    {cleanPersonName(effectiveCompany.contactPerson)} {effectiveCompany.contactPosition || '담당자'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-normal">담당자 연락처:</span>
                  <span className="font-mono text-slate-800">{effectiveCompany.contactPhone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-normal">담당자 이메일:</span>
                  <span className="font-mono text-cyan-800 truncate max-w-[140px]" title={effectiveCompany.contactEmail || ''}>
                    {effectiveCompany.contactEmail || '-'}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-normal block mb-0.5">사업장 주소:</span>
                  <p className="text-slate-700 font-normal truncate" title={effectiveCompany.address || ''}>
                    {effectiveCompany.address || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* 카드 2: 인증 현황 및 범위 (IAF 코드 동적 조건부 렌더링) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-bold text-slate-900 text-xs">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-700" />
                  <span>인증 현황 및 범위</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {effectiveCompany.iafCode ? (
                    <span className="text-[10.5px] font-mono font-semibold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                      IAF {effectiveCompany.iafCode}
                    </span>
                  ) : null}
                  {effectiveCompany.totalEmployees ? (
                    <span className="text-[10.5px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-normal">
                      {effectiveCompany.totalEmployees}명 (MD기준)
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="space-y-1.5 text-[11.5px]">
                <div>
                  <span className="text-slate-500 font-normal block mb-0.5">인증규격 및 인증번호:</span>
                  <div className="space-y-0.5">
                    {stdAndCerts.map((sc, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 font-mono text-[11px]">
                        <span className="text-slate-900 font-medium">{sc.std}</span>
                        <span className="text-cyan-800 font-normal">{sc.certNo || '발급전'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-normal">담당(관리) 심사원:</span>
                  <span className="text-slate-900 font-medium">
                    {(effectiveCompany as any).assignedAuditor || effectiveCompany.assignedAuditorName || (effectiveCompany as any).leadAuditor || (managingAuditor.name !== '-' ? managingAuditor.name : '-')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-normal">영업/협력기관:</span>
                  <span className="text-slate-800">{effectiveCompany.consultant || (effectiveCompany as any).agency || 'GMSCS 본부 직영'}</span>
                </div>
                <div className="pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-normal block mb-0.5">국문 인증범위 (Scope):</span>
                  <p className="text-slate-700 font-normal line-clamp-2 leading-relaxed bg-slate-50 p-1.5 rounded border border-slate-200/60 text-[11px]" title={effectiveCompany.scope || ''}>
                    {effectiveCompany.scope || '인증 범위 정보가 등록되어 있지 않습니다.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 카드 3: 생애주기 날짜 & D-Day 알람 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-bold text-slate-900 text-xs">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-cyan-700" />
                  <span>생애주기 날짜 현황</span>
                </div>
                {timeline?.isPrepAlert ? (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 animate-pulse">
                    심사준비 대상
                  </span>
                ) : timeline?.isOverdue ? (
                  <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">
                    기한초과
                  </span>
                ) : (
                  <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    정상유지
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-[11.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-normal">최초 인증등록일:</span>
                  <span className="font-mono text-slate-800 font-normal">
                    {contract?.initialCertDate || effectiveCompany.initialCertDate || effectiveCompany.initialContractDate || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-normal">현 주기 기산일:</span>
                  <span className="font-mono text-cyan-900 font-medium">
                    {effectiveCompany.cycleBaseDate || effectiveCompany.certStartDate || contract?.initialCertDate || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-normal">최근 심사일자:</span>
                  <span className="font-mono text-slate-800 font-normal">
                    {effectiveCompany.latestAuditDate || effectiveCompany.certStartDate || effectiveCompany.lastAuditDate || latestProject?.startDate || '-'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-normal">차기 심사 마감일:</span>
                  <span className="font-mono text-slate-900 font-medium">
                    {timeline?.deadlineDate || contract?.surveillanceDueDate || contract?.validUntil || '-'}
                  </span>
                </div>
                <div className="p-2 bg-cyan-50/70 border border-cyan-200 rounded-lg text-center font-mono text-[11px]">
                  <span className="text-slate-600 mr-1">알람 상태:</span>
                  <span className={`font-bold ${timeline?.isOverdue ? 'text-rose-700' : timeline?.isPrepAlert ? 'text-amber-800' : 'text-cyan-900'}`}>
                    {timeline?.alarmText || '정상 유지'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------------- */}
          {/* ② 하단 섹션: [심사 이력 및 문서 대장 (3개년 전체 이력 표시)]   */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-cyan-700" />
                <span className="font-bold text-slate-900 text-xs">심사 이력 및 문서 대장</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  (연차별 심사 수행 결과 및 공인 발급 문서)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 text-[11.5px]">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-[200px] whitespace-nowrap">
                      심사구분 &amp; 규격
                    </th>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-[190px] whitespace-nowrap">
                      심사일자 (MD)
                    </th>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-[170px] whitespace-nowrap">
                      심사팀
                    </th>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-[130px] text-center whitespace-nowrap">
                      심사 결과
                    </th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap w-[160px]">
                      문서 관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
                  {auditHistoryList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-normal">
                        조회된 심사 이력 및 보관 문서가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    auditHistoryList.map((entry) => (
                      <tr key={entry.key} className="hover:bg-slate-50/80 transition">
                        {/* 1. 심사구분 & 규격 */}
                        <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                          <span className="font-semibold text-cyan-950 block">{entry.stageDisplay}</span>
                          <span className="text-[10.5px] text-slate-500 font-mono">
                            {entry.standardsDisplay}
                          </span>
                        </td>

                        {/* 2. 심사일자 (MD) */}
                        <td className="py-2.5 px-3 border-r border-slate-200 align-middle font-mono text-[11.5px] text-slate-800 whitespace-nowrap">
                          {entry.dateDisplay}
                        </td>

                        {/* 3. 심사팀 */}
                        <td className="py-2.5 px-3 border-r border-slate-200 align-middle">
                          <span className="font-medium text-slate-900 block">{entry.auditorDisplay}</span>
                          <span className="text-[10px] text-slate-400 font-normal">GMSCS 공인 심사원</span>
                        </td>

                        {/* 4. 심사 결과 */}
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center align-middle text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                            {entry.statusDisplay}
                          </span>
                        </td>

                        {/* 5. 문서 관리 단일 액션 버튼 (문서 보관함 탐색기로 이동) */}
                        <td className="py-2.5 px-3 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleOpenDocStorageAction(entry.archivedGroup)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-700 to-sky-700 hover:from-cyan-800 hover:to-sky-800 text-white rounded-lg text-xs font-medium shadow-2xs hover:shadow-xs transition cursor-pointer"
                            title="문서 보관함 (탐색기)로 이동하여 해당 심사 보관 문서 열람"
                          >
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span>문서관리 연동 열기</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

