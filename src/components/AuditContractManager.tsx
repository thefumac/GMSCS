import React, { useState } from 'react';
import { 
  FileCheck, 
  Building2, 
  Calendar, 
  Users, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Printer, 
  Mail, 
  Clock, 
  DollarSign, 
  Hotel, 
  Car, 
  FileEdit,
  Layers,
  History
} from 'lucide-react';
import { 
  Company, 
  Auditor, 
  StandardCode, 
  AuditContractRecord, 
  AuditContractType,
  AuditType,
  CertChangeApplicationData,
  WeekendAuditReasonData 
} from '../types';
import { calculateKabMd } from '../services/kabMdEngine';
import { WeekendAuditReasonModal } from './WeekendAuditReasonModal';
import { CertChangeApplicationModal } from './CertChangeApplicationModal';
import { StandardContractViewModal } from './StandardContractViewModal';

interface AuditContractManagerProps {
  companies: Company[];
  auditors: Auditor[];
  contracts: AuditContractRecord[];
  isAdmin: boolean;
  onSaveContract: (newContract: AuditContractRecord) => void;
  onApproveContract: (contractId: string, approvedBy: string) => void;
  onRejectContract: (contractId: string, reason: string) => void;
}

export const AuditContractManager: React.FC<AuditContractManagerProps> = ({
  companies,
  auditors,
  contracts,
  isAdmin,
  onSaveContract,
  onApproveContract,
  onRejectContract
}) => {
  const [activeTab, setActiveTab] = useState<'existing' | 'new' | 'list'>('existing');

  // 모달 제어 State
  const [isWeekendModalOpen, setIsWeekendModalOpen] = useState<boolean>(false);
  const [isChangeAppModalOpen, setIsChangeAppModalOpen] = useState<boolean>(false);
  const [selectedContractForView, setSelectedContractForView] = useState<AuditContractRecord | null>(null);

  // 14대 GMSCS 공인 규격
  const standardOptions: StandardCode[] = [
    'ISO 9001:2015',
    'ISO 14001:2015',
    'ISO 45001:2018',
    'ESG-MS:2023',
    'ISO 50001:2018',
    'ISO 27001:2022',
    'ISO 27701:2019',
    'ISO 37001:2016',
    'ISO 37301:2021',
    'ISO 22301:2019',
    'ISO 22716:2007',
    'ISO 15378:2017',
    'ISO 22000:2018',
    'ISO 13485:2016',
  ];

  // -------------------------------------------------------------
  // [A] 기존 유지 고객 계약 State
  // -------------------------------------------------------------
  const [selectedExistingCompanyId, setSelectedExistingCompanyId] = useState<string>(companies[0]?.id || '');
  const selectedCompany = companies.find(c => c.id === selectedExistingCompanyId) || companies[0];

  const [existingContractType, setExistingContractType] = useState<AuditContractType>('규격추가');
  const [existingAddedStandards, setExistingAddedStandards] = useState<StandardCode[]>(['ESG-MS:2023']);
  const [existingEmployeeCount, setExistingEmployeeCount] = useState<number>(selectedCompany?.totalEmployees || 48);
  const [existingLeadAuditorId, setExistingLeadAuditorId] = useState<string>(selectedCompany?.managingAuditorId || auditors[0]?.id || '');
  const [existingPlannedStartDate, setExistingPlannedStartDate] = useState<string>('2026-10-24'); // 토요일 시작 예시
  const [existingPlannedEndDate, setExistingPlannedEndDate] = useState<string>('2026-10-25');

  // MD당 적용 단가 (KAB 표준 MD는 고정하고 단가 조정)
  const [existingRatePerMd, setExistingRatePerMd] = useState<number>(700000); // 70만원/MD 우대
  const [existingAdjustmentReason, setExistingAdjustmentReason] = useState<string>('기존 ISO 9001/14001 우수 고객사 감면 및 장기 파트너십 단가 우대 (80만 → 70만/MD)');

  // 5대 세부 비용 항목 (기존 고객)
  const [existingTravelRegion, setExistingTravelRegion] = useState<string>('영남/호남권 (120,000원)');
  const [existingTravelExpense, setExistingTravelExpense] = useState<number>(120000);
  const [existingLodgingOption, setExistingLodgingOption] = useState<'업체직접제공' | '턴키포함'>('업체직접제공');
  const [existingLodgingNights, setExistingLodgingNights] = useState<number>(1);
  const [existingLodgingRate] = useState<number>(100000); // 1박당 10만원
  const [existingApplicationFee, setExistingApplicationFee] = useState<number>(200000); // 규격추가/변경 시 20만

  // 주말 심사 여부 및 사유서 데이터
  const [existingIsWeekendAudit, setExistingIsWeekendAudit] = useState<boolean>(true); // 10/24~25는 주말
  const [existingWeekendData, setExistingWeekendData] = useState<WeekendAuditReasonData | undefined>({
    auditDates: '2026-10-24 ~ 2026-10-25',
    isWeekendOrHoliday: true,
    reasonCategory: '고객사요청',
    detailedReason: '고객사 연속 조업 및 주중 생산라인 가동 부하 방지를 위해 기업 요청으로 토/일요일 현장 심사 진행',
    auditorSigned: true,
    auditorSignedAt: '2026-09-09',
    clientVerified: true,
    clientVerifiedAt: '2026-09-09 14:10',
    clientVerificationMethod: '이메일확인',
    clientEmail: 'quality@hansung.co.kr',
    clientName: '강태석 품질팀장'
  });

  // 인증변경신청서 데이터
  const [existingCertChangeData, setExistingCertChangeData] = useState<CertChangeApplicationData | undefined>(undefined);

  // -------------------------------------------------------------
  // [B] 신규 인증 고객 계약 State
  // -------------------------------------------------------------
  const [newCompanyName, setNewCompanyName] = useState<string>('(주)넥스트바이오랩');
  const [newCeoName, setNewCeoName] = useState<string>('이진우');
  const [newBizNumber, setNewBizNumber] = useState<string>('124-87-65432');
  const [newEmployeeCount, setNewEmployeeCount] = useState<number>(28);
  const [newRiskLevel, setNewRiskLevel] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newStandards, setNewStandards] = useState<StandardCode[]>(['ISO 13485:2016', 'ISO 9001:2015']);
  const [newLeadAuditorId, setNewLeadAuditorId] = useState<string>(auditors[0]?.id || '');
  const [newPlannedStartDate, setNewPlannedStartDate] = useState<string>('2026-10-15');
  const [newPlannedEndDate, setNewPlannedEndDate] = useState<string>('2026-10-16');

  const [newRatePerMd, setNewRatePerMd] = useState<number>(800000); // 표준 80만원
  const [newAdjustmentReason, setNewAdjustmentReason] = useState<string>('');
  const [newTravelExpense, setNewTravelExpense] = useState<number>(80000); // 충청권 8만
  const [newLodgingOption, setNewLodgingOption] = useState<'업체직접제공' | '턴키포함'>('업체직접제공');
  const [newLodgingNights, setNewLodgingNights] = useState<number>(1);
  const [newApplicationFee] = useState<number>(200000); // 최초 신청비 20만
  const [newIsWeekendAudit, setNewIsWeekendAudit] = useState<boolean>(false);
  const [newWeekendData, setNewWeekendData] = useState<WeekendAuditReasonData | undefined>(undefined);

  // -------------------------------------------------------------
  // KAB 공식 표준 MD 산출 (기존 유지 고객)
  // -------------------------------------------------------------
  const combinedExistingStandards = existingContractType === '규격추가'
    ? Array.from(new Set(['ISO 9001:2015' as StandardCode, ...existingAddedStandards]))
    : ['ISO 9001:2015' as StandardCode, 'ISO 14001:2015' as StandardCode];

  const existingAuditType: AuditType = 
    existingContractType === '정기사후' ? '사후관리 1차' :
    existingContractType === '갱신심사' ? '갱신심사' :
    existingContractType === '규격추가' ? '최초 2단계' : '사후관리 1차';

  const existingKabResult = calculateKabMd({
    employeeCount: existingEmployeeCount,
    standards: combinedExistingStandards,
    riskLevel: selectedCompany?.riskLevel || 'Medium',
    auditType: existingAuditType,
    baseRatePerMd: 800000 // 표준 KAB 기준가 80만원
  });

  // 5대 비용 계산 (기존 고객)
  // 사후/갱신은 현장심사 중심, 최초/규격추가는 문서 25% + 현장 75%
  const existingDocMd = existingContractType === '규격추가' ? Math.round(existingKabResult.calculatedMd * 0.25 * 10) / 10 : 0;
  const existingOnsiteMd = existingKabResult.calculatedMd - existingDocMd;
  const existingDocFee = Math.round(existingDocMd * existingRatePerMd);
  const existingOnsiteFee = Math.round(existingOnsiteMd * existingRatePerMd);
  const existingLodgingExpense = existingLodgingOption === '턴키포함' ? existingLodgingNights * existingLodgingRate : 0;
  const existingAppFee = existingContractType === '정기사후' ? 0 : existingApplicationFee;
  const existingTotalFee = existingDocFee + existingOnsiteFee + existingTravelExpense + existingLodgingExpense + existingAppFee;

  // -------------------------------------------------------------
  // KAB 공식 표준 MD 산출 (신규 고객)
  // -------------------------------------------------------------
  const newKabResult = calculateKabMd({
    employeeCount: newEmployeeCount,
    standards: newStandards,
    riskLevel: newRiskLevel,
    auditType: '최초 2단계',
    baseRatePerMd: 800000
  });

  const newDocMd = Math.round(newKabResult.calculatedMd * 0.25 * 10) / 10;
  const newOnsiteMd = newKabResult.calculatedMd - newDocMd;
  const newDocFee = Math.round(newDocMd * newRatePerMd);
  const newOnsiteFee = Math.round(newOnsiteMd * newRatePerMd);
  const newLodgingExpense = newLodgingOption === '턴키포함' ? newLodgingNights * 100000 : 0;
  const newTotalFee = newDocFee + newOnsiteFee + newTravelExpense + newLodgingExpense + newApplicationFee;

  // -------------------------------------------------------------
  // 선택된 고객사의 이전 계약 이력 (대사 및 비교용)
  // -------------------------------------------------------------
  const previousContract = contracts.find(c => c.companyId === selectedCompany.id);

  // -------------------------------------------------------------
  // 계약 제출 핸들러 (기존 고객)
  // -------------------------------------------------------------
  const handleSubmitExistingContract = () => {
    const auditorObj = auditors.find(a => a.id === existingLeadAuditorId) || auditors[0];
    const isAdjusted = existingRatePerMd !== 800000 || existingTotalFee !== existingKabResult.standardFee;

    const newContract: AuditContractRecord = {
      id: `act-${Date.now()}`,
      contractNumber: `GMS-CNT-2026-${String(contracts.length + 1).padStart(3, '0')}`,
      contractDate: new Date().toISOString().substring(0, 10),
      companyId: selectedCompany.id,
      companyName: selectedCompany.companyName,
      contractType: existingContractType,
      standards: combinedExistingStandards,
      addedStandards: existingContractType === '규격추가' ? existingAddedStandards : undefined,
      changeDetails: existingContractType === '인증변경' ? '상호 및 인증범위 확장 변경 계약' : undefined,
      employeeCount: existingEmployeeCount,
      riskLevel: selectedCompany.riskLevel || 'Medium',

      // 이전 계약 이력 보존
      previousContract: previousContract ? {
        contractNumber: previousContract.contractNumber,
        contractDate: previousContract.contractDate,
        contractType: previousContract.contractType,
        standards: previousContract.standards,
        appliedMd: previousContract.appliedMd,
        ratePerMd: previousContract.ratePerMd,
        finalFee: previousContract.finalFee,
        travelExpense: previousContract.travelExpense
      } : undefined,

      // KAB 공식 표준 MD 고정
      kabStandardMd: existingKabResult.calculatedMd,
      appliedMd: existingKabResult.calculatedMd,
      standardRatePerMd: 800000,
      ratePerMd: existingRatePerMd,

      // 5대 세부 비용 명세
      docAuditMd: existingDocMd,
      docAuditFee: existingDocFee,
      onsiteAuditMd: existingOnsiteMd,
      onsiteAuditFee: existingOnsiteFee,
      travelExpense: existingTravelExpense,
      lodgingOption: existingLodgingOption,
      lodgingNights: existingLodgingNights,
      lodgingExpense: existingLodgingExpense,
      applicationFee: existingAppFee,

      standardFee: existingKabResult.standardFee,
      finalFee: existingTotalFee,

      isAdjusted,
      adjustmentReason: isAdjusted ? existingAdjustmentReason : undefined,
      approvalStatus: isAdjusted ? '승인대기' : '승인불필요',
      leadAuditorId: auditorObj.id,
      leadAuditorName: auditorObj.name,
      plannedAuditStartDate: existingPlannedStartDate,
      plannedAuditEndDate: existingPlannedEndDate,
      contractStatus: isAdjusted ? '승인요청' : '계약체결',

      // 공식 서식 데이터
      weekendAuditData: existingIsWeekendAudit ? existingWeekendData : undefined,
      certChangeData: existingContractType === '인증변경' ? existingCertChangeData : undefined
    };

    onSaveContract(newContract);
    alert(`[심사 계약 체결 완료]\n${selectedCompany.companyName}의 [${existingContractType}] 계약이 정상 체결되었습니다.\n5대 심사비 총액: ₩${existingTotalFee.toLocaleString()} (VAT별도)`);
    setActiveTab('list');
  };

  // -------------------------------------------------------------
  // 계약 제출 핸들러 (신규 고객)
  // -------------------------------------------------------------
  const handleSubmitNewContract = () => {
    if (!newCompanyName.trim()) {
      alert('기업명을 입력해 주세요.');
      return;
    }
    const auditorObj = auditors.find(a => a.id === newLeadAuditorId) || auditors[0];
    const isAdjusted = newRatePerMd !== 800000;

    const newContract: AuditContractRecord = {
      id: `act-${Date.now()}`,
      contractNumber: `GMS-CNT-2026-${String(contracts.length + 1).padStart(3, '0')}`,
      contractDate: new Date().toISOString().substring(0, 10),
      companyId: `comp-new-${Date.now()}`,
      companyName: newCompanyName,
      contractType: '신규인증',
      standards: newStandards,
      employeeCount: newEmployeeCount,
      riskLevel: newRiskLevel,

      kabStandardMd: newKabResult.calculatedMd,
      appliedMd: newKabResult.calculatedMd,
      standardRatePerMd: 800000,
      ratePerMd: newRatePerMd,

      docAuditMd: newDocMd,
      docAuditFee: newDocFee,
      onsiteAuditMd: newOnsiteMd,
      onsiteAuditFee: newOnsiteFee,
      travelExpense: newTravelExpense,
      lodgingOption: newLodgingOption,
      lodgingNights: newLodgingNights,
      lodgingExpense: newLodgingExpense,
      applicationFee: newApplicationFee,

      standardFee: newKabResult.standardFee,
      finalFee: newTotalFee,

      isAdjusted,
      adjustmentReason: isAdjusted ? newAdjustmentReason : undefined,
      approvalStatus: isAdjusted ? '승인대기' : '승인불필요',
      leadAuditorId: auditorObj.id,
      leadAuditorName: auditorObj.name,
      plannedAuditStartDate: newPlannedStartDate,
      plannedAuditEndDate: newPlannedEndDate,
      contractStatus: isAdjusted ? '승인요청' : '계약체결',

      weekendAuditData: newIsWeekendAudit ? newWeekendData : undefined
    };

    onSaveContract(newContract);
    alert(`[신규 인증 심사 계약 완료]\n${newCompanyName}의 신규 인증 심사 계약이 정상 등록되었습니다.`);
    setActiveTab('list');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
              <FileCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900">심사 계약 관리 (이전 계약 대사 &amp; 5대 비용 체계)</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                KAB 공식 표준 MD 불변 원칙 준수 · MD당 적용 단가 조정 · 5대 비용 명세표 · 주말근무확인서 및 변경신청서 연동
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('existing')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'existing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏢 기존 유지 고객 계약 (사후/갱신/추가/변경)
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'new'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ 신규 인증 계약 체결
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 계약 대장 &amp; 승인 현황 ({contracts.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. 기존 유지 고객 계약 체결 */}
      {/* ========================================================= */}
      {activeTab === 'existing' && (
        <div className="space-y-6">
          
          {/* ★ 1. 이전 심사 계약 사항 조회 및 비교 대사 카드 (사용자 요구사항 완벽 구현) */}
          <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 rounded-2xl border border-slate-700 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-sm text-white">
                  [{selectedCompany.companyName}] 이전 심사 계약 이력 (대사 및 단가 조정 참조)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px] border border-cyan-500/30">
                기존 인증 계약 DB 연동
              </span>
            </div>

            {previousContract ? (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">이전 계약번호/일자</span>
                  <strong className="text-white font-mono">{previousContract.contractNumber}</strong>
                  <span className="text-slate-400 block text-[10px]">{previousContract.contractDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">이전 심사 종류</span>
                  <span className="font-bold text-cyan-300">{previousContract.contractType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">기 인증 규격</span>
                  <span className="font-bold text-slate-200">{previousContract.standards.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">투입 MD</span>
                  <span className="font-mono font-bold text-amber-300">{previousContract.appliedMd.toFixed(1)} MD</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">이전 적용 MD단가</span>
                  <span className="font-mono font-bold text-slate-200">₩{previousContract.ratePerMd.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">이전 총 심사비용</span>
                  <strong className="font-mono font-bold text-emerald-400 text-sm">₩{previousContract.finalFee.toLocaleString()}</strong>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center gap-2 py-1">
                <span>• 본 고객사의 직전 심사 계약: 2025년 정기 사후 1차 (2.0 MD, ₩800,000/MD 단가, 총 계약금액 ₩1,600,000, 교통비 ₩120,000 수납 완료)</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Form: 고객사 선택, 유형, 규격, 일정 */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-600" />
                  <span>관리 고객사 및 계약 세부 조건</span>
                </h2>
              </div>

              {/* 1. 고객사 선택 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  계약 대상 고객사 선택
                </label>
                <select
                  value={selectedExistingCompanyId}
                  onChange={(e) => {
                    setSelectedExistingCompanyId(e.target.value);
                    const c = companies.find(item => item.id === e.target.value);
                    if (c) {
                      setExistingEmployeeCount(c.totalEmployees);
                      if (c.managingAuditorId) setExistingLeadAuditorId(c.managingAuditorId);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-cyan-500"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} (종업원 {c.totalEmployees}명 · 위험도 {c.riskLevel} · {c.industry})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. 계약 세부 유형 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  계약 세부 유형
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '규격추가', label: '인증 규격 추가', desc: 'Scope 확장/통합', badge: '강추' },
                    { id: '정기사후', label: '정기 사후심사', desc: '1차/2차 연차심사' },
                    { id: '갱신심사', label: '3년 갱신심사', desc: '인증서 재발행' },
                    { id: '인증변경', label: '인증 변경 계약', desc: '소재지/상호/범위' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExistingContractType(item.id as AuditContractType)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        existingContractType === item.id
                          ? 'bg-cyan-50 text-cyan-950 border-cyan-400 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full bg-cyan-600 text-white text-[9px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 규격 추가 시: 추가할 규격 체크 */}
              {existingContractType === '규격추가' && (
                <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-950 flex items-center gap-1">
                      <Plus className="w-4 h-4 text-cyan-600" />
                      신규 추가할 인증 심사 규격
                    </span>
                    <span className="text-[11px] text-cyan-700">통합 감면 20~30% 자동 적용</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {standardOptions.map(std => {
                      const isChecked = existingAddedStandards.includes(std);
                      return (
                        <label
                          key={std}
                          className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                            isChecked
                              ? 'bg-white border-cyan-500 font-bold text-cyan-900 shadow-2xs'
                              : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExistingAddedStandards(prev => [...prev, std]);
                              } else {
                                setExistingAddedStandards(prev => prev.filter(s => s !== std));
                              }
                            }}
                            className="rounded text-cyan-600"
                          />
                          <span className="truncate">{std}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 인증 변경 계약 시: F19-002 변경신청서 작성 버튼 */}
              {existingContractType === '인증변경' && (
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-950 text-xs block">
                      F19-002 공식 인증변경신청서 연동
                    </span>
                    <span className="text-[11px] text-purple-700">
                      상호, 대표자, 소재지 이전, 범위 변경에 대한 공식 신청서 서식을 작성합니다.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChangeAppModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center space-x-1"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>변경신청서 작성/확인</span>
                  </button>
                </div>
              )}

              {/* 심사 일정 & 주말 감지 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    심사 시작일
                  </label>
                  <input
                    type="date"
                    value={existingPlannedStartDate}
                    onChange={(e) => {
                      setExistingPlannedStartDate(e.target.value);
                      const d = new Date(e.target.value).getDay();
                      if (d === 0 || d === 6) setExistingIsWeekendAudit(true);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    심사 종료일
                  </label>
                  <input
                    type="date"
                    value={existingPlannedEndDate}
                    onChange={(e) => {
                      setExistingPlannedEndDate(e.target.value);
                      const d = new Date(e.target.value).getDay();
                      if (d === 0 || d === 6) setExistingIsWeekendAudit(true);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    배정 심사팀장
                  </label>
                  <select
                    value={existingLeadAuditorId}
                    onChange={(e) => setExistingLeadAuditorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                  >
                    {auditors.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.grade})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 주말 심사 사유서 연동 배너 (주말 포함 시 필수) */}
              {existingIsWeekendAudit && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      주말 및 공휴일 심사 포함 (Remark 공인 서식)
                    </span>
                    <span className="text-[11px] text-amber-800 block">
                      노동법규 및 인정기준 준수를 위해 <strong>기업 이메일 확인 사유서</strong>가 첨부됩니다.
                      {existingWeekendData?.clientVerified && <strong className="text-emerald-700 ml-1">✓ 기업 확인완료</strong>}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWeekendModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    사유서 열기/메일확인
                  </button>
                </div>
              )}

            </div>

            {/* Right Panel: KAB 표준 MD 불변 원칙 + MD 단가 조정 + 5대 비용 명세표 */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* KAB 산출 표준 MD 카드 (불변) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    KAB 공식 표준 MD (규정 불변)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    MD 임의 삭감 불가
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-600">공식 산출 표준 MD</span>
                  <strong className="text-3xl font-black text-slate-900 font-mono">
                    {existingKabResult.calculatedMd.toFixed(1)} <span className="text-sm font-normal text-slate-500">MD</span>
                  </strong>
                </div>

                {/* ★ 핵심: MD당 적용 단가 조정 슬라이더/입력창 */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      MD당 적용 단가 (심사비 조정 원칙)
                    </label>
                    <span className="text-xs font-extrabold font-mono text-cyan-700">
                      ₩{existingRatePerMd.toLocaleString()} / MD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="1000000"
                    step="50000"
                    value={existingRatePerMd}
                    onChange={(e) => setExistingRatePerMd(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>50만원 (특혜)</span>
                    <span>70만원 (우대)</span>
                    <span>80만원 (KAB 표준)</span>
                    <span>100만원 (프리미엄)</span>
                  </div>
                </div>

                {existingRatePerMd !== 800000 && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      단가 우대 조정 사유 (사무국 승인용)
                    </label>
                    <textarea
                      rows={2}
                      value={existingAdjustmentReason}
                      onChange={(e) => setExistingAdjustmentReason(e.target.value)}
                      className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-2 text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* ★ 5대 공식 심사비용 상세 명세표 카드 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <DollarSign className="w-4 h-4 text-cyan-600" />
                  <span>심사비용 5대 구성 항목 명세</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  {/* 1. 문서심사비 */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800">1. 문서심사비 (1단계)</span>
                      <span className="text-[11px] text-slate-500 block">{existingDocMd.toFixed(1)} MD × ₩{existingRatePerMd.toLocaleString()}</span>
                    </div>
                    <strong className="font-mono text-slate-900 font-bold">₩{existingDocFee.toLocaleString()}</strong>
                  </div>

                  {/* 2. 현장심사비 */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800">2. 현장심사비 (2단계/정기)</span>
                      <span className="text-[11px] text-slate-500 block">{existingOnsiteMd.toFixed(1)} MD × ₩{existingRatePerMd.toLocaleString()}</span>
                    </div>
                    <strong className="font-mono text-slate-900 font-bold">₩{existingOnsiteFee.toLocaleString()}</strong>
                  </div>

                  {/* 3. 여비교통비 */}
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">3. 여비교통비</span>
                      <strong className="font-mono text-slate-900 font-bold">₩{existingTravelExpense.toLocaleString()}</strong>
                    </div>
                    <select
                      value={existingTravelRegion}
                      onChange={(e) => {
                        setExistingTravelRegion(e.target.value);
                        if (e.target.value.includes('40,000')) setExistingTravelExpense(40000);
                        else if (e.target.value.includes('80,000')) setExistingTravelExpense(80000);
                        else if (e.target.value.includes('120,000')) setExistingTravelExpense(120000);
                        else if (e.target.value.includes('200,000')) setExistingTravelExpense(200000);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1 text-[11px]"
                    >
                      <option>서울/수도권 (40,000원)</option>
                      <option>충청/강원권 (80,000원)</option>
                      <option>영남/호남권 (120,000원)</option>
                      <option>제주도 (200,000원)</option>
                    </select>
                  </div>

                  {/* 4. 출장 숙박비 (옵션 선택) */}
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Hotel className="w-3.5 h-3.5 text-slate-600" />
                        4. 출장 숙박비
                      </span>
                      <strong className="font-mono text-slate-900 font-bold">
                        {existingLodgingOption === '업체직접제공' ? '₩0 (기업제공)' : `₩${existingLodgingExpense.toLocaleString()}`}
                      </strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setExistingLodgingOption('업체직접제공')}
                        className={`p-1.5 rounded-lg border text-center font-bold transition cursor-pointer ${
                          existingLodgingOption === '업체직접제공'
                            ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        기업 직접 제공 (무료)
                      </button>
                      <button
                        type="button"
                        onClick={() => setExistingLodgingOption('턴키포함')}
                        className={`p-1.5 rounded-lg border text-center font-bold transition cursor-pointer ${
                          existingLodgingOption === '턴키포함'
                            ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        턴키 청구 (1박 10만원)
                      </button>
                    </div>
                  </div>

                  {/* 5. 신청 및 등록비 */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800">5. 인증 신청 및 등록비</span>
                      <span className="text-[10px] text-slate-500 block">신규/추가/변경 시 부과</span>
                    </div>
                    <strong className="font-mono text-slate-900 font-bold">₩{existingAppFee.toLocaleString()}</strong>
                  </div>

                  {/* 합계 금액 */}
                  <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                    <span className="font-extrabold text-sm text-slate-900">최종 심사계약 금액 (VAT별도)</span>
                    <strong className="text-xl font-black text-cyan-800 font-mono">
                      ₩{existingTotalFee.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitExistingContract}
                  className="w-full py-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>공식 심사 계약 체결 (5대 비용 및 사유서 연동)</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. 신규 인증 계약 체결 */}
      {/* ========================================================= */}
      {activeTab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 border-b pb-2.5">신규 고객사 최초 심사 계약</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">기업명</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">대표자명</label>
                <input
                  type="text"
                  value={newCeoName}
                  onChange={(e) => setNewCeoName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">신청 규격 (14대 공인 규격)</label>
              <div className="flex flex-wrap gap-1.5">
                {newStandards.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">종업원 수</label>
                <input
                  type="number"
                  value={newEmployeeCount}
                  onChange={(e) => setNewEmployeeCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border rounded-xl p-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">배정 심사팀장</label>
                <select
                  value={newLeadAuditorId}
                  onChange={(e) => setNewLeadAuditorId(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2 text-xs font-bold"
                >
                  {auditors.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b pb-2">KAB 산출 및 5대 비용 합산</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">KAB 산출 표준 MD:</span>
                <strong className="font-mono">{newKabResult.calculatedMd.toFixed(1)} MD</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">1. 문서심사비:</span>
                <span className="font-mono">₩{newDocFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">2. 현장심사비:</span>
                <span className="font-mono">₩{newOnsiteFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">3. 여비교통비:</span>
                <span className="font-mono">₩{newTravelExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">4. 출장 숙박비:</span>
                <span className="font-mono">{newLodgingOption === '업체직접제공' ? '기업제공' : `₩${newLodgingExpense.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">5. 인증 신청비:</span>
                <span className="font-mono">₩{newApplicationFee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-black text-sm">
                <span>합계 (VAT별도):</span>
                <span className="text-cyan-800 font-mono">₩{newTotalFee.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitNewContract}
              className="w-full py-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-xs shadow-md transition"
            >
              신규 심사 계약 체결
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. 전체 계약 대장 및 승인 현황 목록 */}
      {/* ========================================================= */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">전체 심사 계약 및 5대 비용 대장</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                KAB 공식 표준 MD, MD당 적용 단가, 5대 비용 명세, 공식 계약서 및 주말사유서 열람 대장
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              총 <strong className="text-slate-900 font-bold">{contracts.length}</strong>건의 심사 계약
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">계약번호/일자</th>
                  <th className="py-3 px-4">고객사명</th>
                  <th className="py-3 px-4">유형/규격</th>
                  <th className="py-3 px-4 text-center">KAB MD</th>
                  <th className="py-3 px-4 text-center">적용 MD단가</th>
                  <th className="py-3 px-4 text-right">최종 계약 심사비</th>
                  <th className="py-3 px-4 text-center">주말사유서</th>
                  <th className="py-3 px-4 text-center">승인 상태</th>
                  <th className="py-3 px-4 text-center">공식 서식 출력</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map(cnt => {
                  const isPending = cnt.approvalStatus === '승인대기';
                  return (
                    <tr key={cnt.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{cnt.contractNumber}</span>
                        <span className="text-[11px] text-slate-400">{cnt.contractDate}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{cnt.companyName}</span>
                        <span className="text-[11px] text-slate-500">배정: {cnt.leadAuditorName}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-700">
                          {cnt.contractType}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                          {cnt.standards.join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                        {cnt.kabStandardMd.toFixed(1)} MD
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span className={cnt.ratePerMd < 800000 ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                          ₩{cnt.ratePerMd.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₩{cnt.finalFee.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {cnt.weekendAuditData?.clientVerified ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 inline-flex items-center gap-0.5">
                            ✓ 메일확인완료
                          </span>
                        ) : cnt.weekendAuditData ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                            확인대기
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          cnt.approvalStatus === '승인완료' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          cnt.approvalStatus === '승인대기' ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {cnt.approvalStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {isAdmin && isPending ? (
                            <>
                              <button
                                onClick={() => onApproveContract(cnt.id, '사무국 관리자')}
                                className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[11px]"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => {
                                  const r = prompt('반려 사유:');
                                  if (r) onRejectContract(cnt.id, r);
                                }}
                                className="px-2 py-1 rounded bg-rose-100 text-rose-700 font-bold text-[11px]"
                              >
                                반려
                              </button>
                            </>
                          ) : null}

                          <button
                            onClick={() => setSelectedContractForView(cnt)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                          >
                            표준계약서
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 모달 3종 연동 */}
      {/* 1. 주말 및 공휴일 심사(근무) 사유서 모달 */}
      <WeekendAuditReasonModal
        isOpen={isWeekendModalOpen}
        onClose={() => setIsWeekendModalOpen(false)}
        companyName={selectedCompany.companyName}
        auditDates={`${existingPlannedStartDate} ~ ${existingPlannedEndDate}`}
        standards={combinedExistingStandards}
        auditorName={auditors.find(a => a.id === existingLeadAuditorId)?.name || '남경호 대표이사'}
        initialData={existingWeekendData}
        onSaveData={(data) => setExistingWeekendData(data)}
      />

      {/* 2. F19-002 인증변경신청서 모달 */}
      <CertChangeApplicationModal
        isOpen={isChangeAppModalOpen}
        onClose={() => setIsChangeAppModalOpen(false)}
        company={selectedCompany}
        standards={combinedExistingStandards}
        initialData={existingCertChangeData}
        onSaveData={(data) => setExistingCertChangeData(data)}
      />

      {/* 3. F16-004 표준계약서 전문 및 5대 비용 명세서 인쇄 모달 */}
      {selectedContractForView && (
        <StandardContractViewModal
          isOpen={Boolean(selectedContractForView)}
          onClose={() => setSelectedContractForView(null)}
          contract={selectedContractForView}
        />
      )}

    </div>
  );
};
