import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Search, 
  FileText, 
  Printer, 
  Mail, 
  Clock, 
  DollarSign, 
  Send, 
  Check, 
  Sparkles, 
  Info, 
  Briefcase,
  FileCheck,
  Receipt,
  UserCheck,
  ClipboardList,
  HelpCircle,
  RefreshCw,
  Database,
  Plus,
  ArrowRightLeft,
  Edit3,
  CheckSquare,
  Square,
  Award
} from 'lucide-react';
import { 
  Company, 
  Auditor, 
  StandardCode, 
  AuditContractRecord, 
  AuditContractType,
  AuditProject,
  CertChangeApplicationData,
  WeekendAuditReasonData,
  AdditionalSite
} from '../types';
import { calculateKabMd } from '../services/kabMdEngine';
import { isConflictOfInterest, getAgencyDisplayName } from '../utils/conflictUtils';
import { checkAuditPeriodForHolidays } from '../utils/koreanHolidays';
import { cleanCeoName, cleanPersonName, splitPersonAndPosition, formatCeoDisplay } from '../utils/personUtils';

interface AuditContractManagerProps {
  companies: Company[];
  auditors: Auditor[];
  contracts: AuditContractRecord[];
  projects?: AuditProject[];
  isAdmin: boolean;
  onSaveContract: (newContract: AuditContractRecord) => void;
  onApproveContract: (contractId: string, approvedBy: string) => void;
  onRejectContract: (contractId: string, reason: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<AuditProject>) => void;
  onDispatchPlanAndInvoice?: (contractId: string, target: '기업' | '심사원' | '협력기관' | 'all') => void;
  onSimulateResponse?: (contractId: string, role: 'auditor' | 'agency' | 'client', action: 'agree' | 'request_adjust') => void;
  onOpenCompanyAuditHistory?: (company: Company) => void;
  onAddCompany?: (company: Company) => void;
}

// 금액 한글 표기 변환 함수
function numberToKorean(num: number): string {
  if (!num) return '영';
  const units = ['', '만', '억', '조'];
  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  let result = '';
  let unitIdx = 0;
  let temp = num;

  while (temp > 0) {
    const chunk = temp % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      const c1000 = Math.floor(chunk / 1000);
      const c100 = Math.floor((chunk % 1000) / 100);
      const c10 = Math.floor((chunk % 100) / 10);
      const c1 = chunk % 10;

      if (c1000 > 0) chunkStr += (c1000 === 1 ? '' : digits[c1000]) + '천';
      if (c100 > 0) chunkStr += (c100 === 1 ? '' : digits[c100]) + '백';
      if (c10 > 0) chunkStr += (c10 === 1 ? '' : digits[c10]) + '십';
      if (c1 > 0) chunkStr += digits[c1];

      result = chunkStr + units[unitIdx] + (result ? ' ' + result : '');
    }
    temp = Math.floor(temp / 10000);
    unitIdx++;
  }
  return result;
}

export const AuditContractManager: React.FC<AuditContractManagerProps> = ({
  companies,
  auditors,
  contracts,
  projects = [],
  isAdmin,
  onSaveContract,
  onApproveContract: _onApproveContract,
  onRejectContract: _onRejectContract,
  onUpdateProject: _onUpdateProject,
  onDispatchPlanAndInvoice,
  onSimulateResponse,
  onOpenCompanyAuditHistory,
  onAddCompany
}) => {
  // -------------------------------------------------------------
  // [1] 접수 구분 (4대 모드: 정기사후/갱신 vs 규격추가 vs 신규인증 vs 전환심사)
  // -------------------------------------------------------------
  const [receptionType, setReceptionType] = useState<AuditContractType>('정기사후');
  const [hasCertChange, setHasCertChange] = useState<boolean>(false);

  // [A] 기존/신규 고객사 선택 및 검색
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('');
  const [isManualEditOpen, setIsManualEditOpen] = useState<boolean>(false);
  
  const selectedCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || null;
  }, [companies, selectedCompanyId]);

  // 필터된 기업 목록 (검색)
  const filteredCompanyList = useMemo(() => {
    if (!companySearchQuery.trim()) return companies.slice(0, 50);
    const q = companySearchQuery.toLowerCase();
    return companies.filter(c => 
      c.companyName.toLowerCase().includes(q) || 
      (c.bizNumber || '').includes(q) || 
      (c.ceoName || '').toLowerCase().includes(q)
    ).slice(0, 50);
  }, [companies, companySearchQuery]);

  // [B] 규격 추가 모드 특화
  const [addedStandards, setAddedStandards] = useState<StandardCode[]>([]);

  // [C] 신규 / 전환 기업 상세 편집 필드
  const [newCompanyName, setNewCompanyName] = useState<string>('');
  const [newCeoName, setNewCeoName] = useState<string>('');
  const [newBizNumber, setNewBizNumber] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newContactPerson, setNewContactPerson] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactEmail, setNewContactEmail] = useState<string>('');
  const [newIndustry, setNewIndustry] = useState<string>('');
  const [newIafCode, setNewIafCode] = useState<string>('');
  const [newScope, setNewScope] = useState<string>('');
  const [newRiskLevel] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newStandards, setNewStandards] = useState<StandardCode[]>([]);
  const [newAgency, setNewAgency] = useState<string>('');

  // [C-2] 심사계획서 및 공문 사무국 작성 필드 State
  const [planDate, setPlanDate] = useState<string>('');
  const [planDocSeq, setPlanDocSeq] = useState<string>('01');
  const [planDept, setPlanDept] = useState<string>('');
  const [planContactPerson, setPlanContactPerson] = useState<string>('');
  const [planContactPosition, setPlanContactPosition] = useState<string>('');
  const [planFax, setPlanFax] = useState<string>('');
  const [planSubAddress, setPlanSubAddress] = useState<string>('');
  const [planKsicCode, setPlanKsicCode] = useState<string>('');
  const [planCustomerNumber, setPlanCustomerNumber] = useState<string>('');

  // [J] 심사 일정 및 심사원 배정 상태 선언
  const [plannedStartDate, setPlannedStartDate] = useState<string>('');
  const [plannedEndDate, setPlannedEndDate] = useState<string>('');
  const [leadAuditorId, setLeadAuditorId] = useState<string>('');
  const [teamAuditorId, setTeamAuditorId] = useState<string>('');

  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');
  const isInitialMount = React.useRef<boolean>(true);

  // 고객사 선택 시 해당 기업 정보로 자동 동기화 (단일 DB 연결)
  useEffect(() => {
    if (!selectedCompany) {
      setNewCompanyName('');
      setNewCeoName('');
      setNewBizNumber('');
      setNewAddress('');
      setNewContactPerson('');
      setNewContactPhone('');
      setNewContactEmail('');
      setNewIndustry('');
      setNewIafCode('');
      setNewScope('');
      setNewAgency('');
      setCurrentEmployeeCount(0);
      setPlanDept('');
      setPlanContactPerson('');
      setPlanContactPosition('');
      setPlanFax('');
      setPlanSubAddress('');
      setPlanKsicCode('');
      setPlanCustomerNumber('');
      setPlannedStartDate('');
      setPlannedEndDate('');
      setPlanDate('');
      setLeadAuditorId('');
      setTeamAuditorId('');
      setNewStandards([]);
      setAddedStandards([]);
      setIsDirty(false);
      return;
    }

    const cleanedCeo = cleanCeoName(selectedCompany.ceoName);
    const parsedContact = splitPersonAndPosition(selectedCompany.contactPerson, selectedCompany.contactPosition || '담당자');

    setNewCompanyName(selectedCompany.companyName);
    setNewCeoName(cleanedCeo);
    setNewBizNumber(selectedCompany.bizNumber || '');
    setNewAddress(selectedCompany.address || '');
    setNewContactPerson(parsedContact.name);
    setNewContactPhone(selectedCompany.contactPhone || '');
    setNewContactEmail(selectedCompany.contactEmail || '');
    setNewIndustry(selectedCompany.industry || '');
    setNewIafCode(selectedCompany.iafCode || '17');
    setNewScope(selectedCompany.scope || '');
    setNewAgency(selectedCompany.consultant || selectedCompany.agency || '사무국직영');
    setCurrentEmployeeCount(selectedCompany.totalEmployees || 1);

    const compAny = selectedCompany as any;
    setPlanDept(compAny.department || '품질보증부');
    setPlanContactPerson(cleanPersonName(selectedCompany.contactPerson) || parsedContact.name || '');
    setPlanContactPosition(selectedCompany.contactPosition || parsedContact.position || '담당자');
    setPlanFax(compAny.fax || compAny.contactFax || '');
    
    // 복수 추가사업장 주소 자동 연동 (1순위: additionalSites[0].address)
    const subAddr = selectedCompany.additionalSites?.[0]?.address || compAny.subAddress || compAny.factoryAddress || '';
    setPlanSubAddress(subAddr);
    setPlanKsicCode(compAny.ksicCode || (selectedCompany.iafCode ? `IAF-${selectedCompany.iafCode}` : 'C2431'));
    setPlanCustomerNumber(compAny.customerNumber || compAny.certNo || (selectedCompany.bizNumber ? 'Q' + selectedCompany.bizNumber.replace(/[^0-9]/g, '').slice(-6) : ''));

    // 실제 프로젝트 일정 매칭 (projects에 등록된 실데이터가 있으면 해당 일자 및 심사원 호출)
    const matchedProject = projects?.find(p => p.companyId === selectedCompany.id || p.companyName === selectedCompany.companyName);
    if (matchedProject && matchedProject.startDate) {
      setPlannedStartDate(matchedProject.startDate);
      setPlannedEndDate(matchedProject.endDate || matchedProject.startDate);
      setPlanDate(matchedProject.startDate);
    } else if (selectedCompany.lastAuditDate) {
      // 이전 심사일 기준으로 연도/월 산출 (평일 기본 제안)
      const targetMonth = selectedCompany.lastAuditDate.substring(5, 7) || '10';
      setPlannedStartDate(`2026-${targetMonth}-14`);
      setPlannedEndDate(`2026-${targetMonth}-15`);
      setPlanDate(`2026-${targetMonth}-01`);
    } else {
      setPlannedStartDate('');
      setPlannedEndDate('');
      setPlanDate('');
    }

    // 심사원 자동 배정: 기업의 assignedAuditorName 또는 managingAuditorId 매칭
    const assignedStr = matchedProject?.leadAuditorName || selectedCompany.assignedAuditorName || compAny.assignedAuditor || '';
    if (assignedStr) {
      const auditorNames = assignedStr.split(/[,/]+/).map((s: string) => s.trim()).filter(Boolean);
      if (auditorNames.length > 0) {
        const matchedLead = auditors.find(a => a.name === auditorNames[0] || a.id === selectedCompany.managingAuditorId);
        if (matchedLead) {
          setLeadAuditorId(matchedLead.id);
        } else {
          setLeadAuditorId('');
        }
        if (auditorNames.length > 1) {
          const matchedTeam = auditors.find(a => a.name === auditorNames[1]);
          setTeamAuditorId(matchedTeam ? matchedTeam.id : '');
        } else {
          setTeamAuditorId('');
        }
      }
    } else if (selectedCompany.managingAuditorId) {
      const matched = auditors.find(a => a.id === selectedCompany.managingAuditorId);
      setLeadAuditorId(matched ? matched.id : '');
      setTeamAuditorId('');
    } else {
      setLeadAuditorId('');
      setTeamAuditorId('');
    }

    // 전환 기업 등록인 경우 전환심사로 자동 제안
    if (selectedCompany.isTransfer) {
      setReceptionType('전환심사');
    }

    // 등록된 규격 파싱 및 동기화 (기존 보유 인증규격 자동 추출)
    const extractedStds: StandardCode[] = [];
    const rawStds = compAny.standards || compAny.certifiedStandards || '';
    if (Array.isArray(rawStds)) {
      rawStds.forEach((s: string) => {
        if (s.includes('9001') && !extractedStds.includes('ISO 9001:2015')) extractedStds.push('ISO 9001:2015');
        if (s.includes('14001') && !extractedStds.includes('ISO 14001:2015')) extractedStds.push('ISO 14001:2015');
        if (s.includes('45001') && !extractedStds.includes('ISO 45001:2018')) extractedStds.push('ISO 45001:2018');
        if (s.includes('27001') && !extractedStds.includes('ISO 27001:2022')) extractedStds.push('ISO 27001:2022');
        if (s.includes('13485') && !extractedStds.includes('ISO 13485:2016')) extractedStds.push('ISO 13485:2016');
        if (s.includes('22000') && !extractedStds.includes('ISO 22000:2018')) extractedStds.push('ISO 22000:2018');
        if (s.includes('50001') && !extractedStds.includes('ISO 50001:2018')) extractedStds.push('ISO 50001:2018');
        if (s.includes('ESG') && !extractedStds.includes('ESG-MS:2023')) extractedStds.push('ESG-MS:2023');
      });
    } else if (typeof rawStds === 'string' && rawStds.trim().length > 0) {
      if (rawStds.includes('9001') && !extractedStds.includes('ISO 9001:2015')) extractedStds.push('ISO 9001:2015');
      if (rawStds.includes('14001') && !extractedStds.includes('ISO 14001:2015')) extractedStds.push('ISO 14001:2015');
      if (rawStds.includes('45001') && !extractedStds.includes('ISO 45001:2018')) extractedStds.push('ISO 45001:2018');
      if (rawStds.includes('27001') && !extractedStds.includes('ISO 27001:2022')) extractedStds.push('ISO 27001:2022');
      if (rawStds.includes('13485') && !extractedStds.includes('ISO 13485:2016')) extractedStds.push('ISO 13485:2016');
      if (rawStds.includes('22000') && !extractedStds.includes('ISO 22000:2018')) extractedStds.push('ISO 22000:2018');
      if (rawStds.includes('50001') && !extractedStds.includes('ISO 50001:2018')) extractedStds.push('ISO 50001:2018');
      if (rawStds.includes('ESG') && !extractedStds.includes('ESG-MS:2023')) extractedStds.push('ESG-MS:2023');
    }
    if (extractedStds.length === 0) {
      extractedStds.push('ISO 9001:2015');
    }
    setNewStandards(extractedStds);
    setAddedStandards(extractedStds);
    setIsDirty(false);
  }, [selectedCompanyId, selectedCompany, auditors, projects]);

  // 변경 감지 (미저장 이탈 방지용)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setIsDirty(true);
  }, [
    receptionType, hasCertChange, addedStandards,
    newCompanyName, newCeoName, newBizNumber, newAddress, newContactPerson, newContactPhone, newContactEmail, newIndustry, newIafCode, newScope, newAgency,
    planDate, planDocSeq, planDept, planContactPerson, planContactPosition, planFax, planSubAddress, planKsicCode, planCustomerNumber,
    plannedStartDate, plannedEndDate, leadAuditorId, teamAuditorId
  ]);

  // 심사계획서 문서번호 산출 로직: GMS-인증-년월일8자리일련번호2자리 (예: GMS-인증- 2026062501)
  const planDocNumber = useMemo(() => {
    if (!planDate) return 'GMS-인증-';
    const cleanDate = planDate.replace(/[^0-9]/g, '').slice(0, 8);
    const seq = (planDocSeq || '01').padStart(2, '0');
    return `GMS-인증- ${cleanDate}${seq}`;
  }, [planDate, planDocSeq]);

  // [D] 인원수 변동 검증 State 선언 (activeCompany 이전 선언)
  const [currentEmployeeCount, setCurrentEmployeeCount] = useState<number>(0);

  // 활성 회사 정보
  const activeCompany: Company = useMemo(() => {
    if (!selectedCompany) {
      return {
        id: '',
        companyName: newCompanyName || '',
        ceoName: newCeoName || '',
        bizNumber: newBizNumber || '',
        address: newAddress || '',
        contactPerson: newContactPerson || '',
        contactPhone: newContactPhone || '',
        contactEmail: newContactEmail || '',
        industry: newIndustry || '',
        iafCode: newIafCode || '',
        totalEmployees: currentEmployeeCount || 0,
        scope: newScope || '',
        clientType: '직영',
        riskLevel: 'Medium',
        createdAt: ''
      };
    }

    if (isManualEditOpen) {
      return {
        ...selectedCompany,
        companyName: newCompanyName,
        ceoName: newCeoName,
        bizNumber: newBizNumber,
        address: newAddress,
        contactPerson: newContactPerson,
        contactPhone: newContactPhone,
        contactEmail: newContactEmail,
        industry: newIndustry,
        iafCode: newIafCode,
        scope: newScope || selectedCompany.scope || ''
      };
    }

    return selectedCompany;
  }, [selectedCompany, isManualEditOpen, newCompanyName, newCeoName, newBizNumber, newAddress, newContactPerson, newContactPhone, newContactEmail, newIndustry, newIafCode, newScope, currentEmployeeCount]);

  const previousEmployeeCount = selectedCompany?.totalEmployees || 0;
  const isEmployeeChanged = !!selectedCompany && receptionType !== '신규인증' && currentEmployeeCount !== previousEmployeeCount;
  const employeeDiff = currentEmployeeCount - previousEmployeeCount;

  // [E] 심사 성격 자동 판정 및 이전 심사내역 조회
  const previousContract = useMemo(() => {
    return selectedCompany ? contracts.find(c => c.companyId === selectedCompany.id) : undefined;
  }, [contracts, selectedCompany]);

  const calculatedAuditStageText = useMemo(() => {
    if (!selectedCompany) return '고객사 미선택';
    if (receptionType === '신규인증') return '최초 인증심사 (1단계/2단계)';
    if (receptionType === '전환심사') return '전환 심사 (타인증원 이관)';
    if (receptionType === '규격추가') return '규격추가 심사 (신규 규격 추가)';
    if (receptionType === '입회심사') return '입회심사 (인정기구/사무국 입회)';
    if (receptionType === '인증변경') return '인증변경 심사 (상호/소재지/인원/범위 변경)';
    if (receptionType === '재심사') return '재심사 (부적합 시정 후 재심사)';
    if (receptionType === '갱신심사') return '갱신심사 (재인증)';
    if (previousContract) {
      if (previousContract.contractType.includes('최초')) return '1차 사후관리심사';
      if (previousContract.contractType.includes('1차')) return '2차 사후관리심사';
      if (previousContract.contractType.includes('2차')) return '갱신심사 (재인증)';
    }
    return '2차 사후관리심사';
  }, [selectedCompany, receptionType, previousContract]);

  // [F] 심사 표준 (규격)
  const activeStandards: StandardCode[] = useMemo(() => {
    if (!selectedCompany && newStandards.length === 0 && addedStandards.length === 0) {
      return [];
    }
    if (receptionType === '신규인증' || receptionType === '전환심사') {
      return newStandards.length > 0 ? newStandards : ['ISO 9001:2015' as StandardCode];
    }
    if (receptionType === '규격추가') {
      return addedStandards.length > 0 ? addedStandards : newStandards.length > 0 ? newStandards : ['ISO 9001:2015' as StandardCode];
    }
    return newStandards.length > 0 ? newStandards : (selectedCompany ? ['ISO 9001:2015' as StandardCode] : []);
  }, [selectedCompany, receptionType, newStandards, addedStandards]);

  // [G] KAB 공식 표준 MD 산출
  const kabCalculationResult = useMemo(() => {
    if (!selectedCompany && currentEmployeeCount === 0) {
      return {
        baseMd: 0,
        multiStandardDiscount: 0,
        riskFactor: 1,
        auditTypeRatio: 1,
        calculatedMd: 0,
        standardFee: 0,
        breakdown: ['고객사 선택 후 MD가 산출됩니다.']
      };
    }
    return calculateKabMd({
      standards: activeStandards.length > 0 ? activeStandards : ['ISO 9001:2015'],
      employeeCount: currentEmployeeCount || 1,
      riskLevel: receptionType === '신규인증' ? newRiskLevel : (selectedCompany?.riskLevel || 'Medium'),
      auditType: (receptionType === '신규인증' ? '최초 2단계' : receptionType === '갱신심사' ? '갱신심사' : '사후관리 1차') as any
    });
  }, [activeStandards, currentEmployeeCount, receptionType, newRiskLevel, selectedCompany]);

  const [mdDecisionType, setMdDecisionType] = useState<'KAB표준유지' | '수동조정변경'>('KAB표준유지');
  const [manualMd, setManualMd] = useState<number>(2.0);

  const appliedMd = mdDecisionType === 'KAB표준유지' ? kabCalculationResult.calculatedMd : manualMd;

  // [H] MD당 단가 결정 (기본 KAB 표준 800,000원 vs 우대단가)
  const [ratePerMd, setRatePerMd] = useState<number>(800000);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('표준 80만/MD 준수');

  // [I] 5대 공식 세부 비용 항목
  const docAuditMd = appliedMd >= 2.0 ? 0.5 : 0.0;
  const onsiteAuditMd = Math.max(0, appliedMd - docAuditMd);

  const docAuditFee = Math.round(docAuditMd * ratePerMd);
  const onsiteAuditFee = Math.round(onsiteAuditMd * ratePerMd);

  const [travelExpense, setTravelExpense] = useState<number>(120000);
  const [travelRegion, setTravelRegion] = useState<string>('영남권(고령/대구)');
  const [lodgingOption, setLodgingOption] = useState<'업체직접제공' | '턴키포함'>('업체직접제공');
  const [lodgingExpense, setLodgingExpense] = useState<number>(0);
  const [applicationFee, setApplicationFee] = useState<number>(
    receptionType === '신규인증' || receptionType === '전환심사' || receptionType === '규격추가' || receptionType === '인증변경' ? 200000 : 0
  );

  const finalFee = selectedCompany ? (docAuditFee + onsiteAuditFee + travelExpense + lodgingExpense + applicationFee) : 0;
  const vat = Math.round(finalFee * 0.1);
  const totalWithVat = finalFee + vat;

  // 한글 심사일정 포맷팅 함수 (예: 2026년 06월 29일 ~ 06월 30일)
  const formattedKoSchedule = useMemo(() => {
    if (!plannedStartDate) return '';
    const sParts = plannedStartDate.split('-');
    if (sParts.length < 3) return plannedStartDate;
    const sYear = sParts[0];
    const sMonth = sParts[1];
    const sDay = sParts[2];
    
    if (!plannedEndDate || plannedStartDate === plannedEndDate) {
      return `${sYear}년 ${sMonth}월 ${sDay}일`;
    }
    
    const eParts = plannedEndDate.split('-');
    if (eParts.length < 3) return `${sYear}년 ${sMonth}월 ${sDay}일 ~ ${plannedEndDate}`;
    const eYear = eParts[0];
    const eMonth = eParts[1];
    const eDay = eParts[2];
    
    if (sYear === eYear) {
      return `${sYear}년 ${sMonth}월 ${sDay}일 ~ ${eMonth}월 ${eDay}일`;
    }
    return `${sYear}년 ${sMonth}월 ${sDay}일 ~ ${eYear}년 ${eMonth}월 ${eDay}일`;
  }, [plannedStartDate, plannedEndDate]);

  const selectedLeadAuditor = useMemo(() => {
    return auditors.find(a => a.id === leadAuditorId) || ({ id: '', name: '', phone: '', email: '', affiliation: '' } as unknown as Auditor);
  }, [auditors, leadAuditorId]);

  const selectedTeamAuditor = useMemo(() => {
    return auditors.find(a => a.id === teamAuditorId);
  }, [auditors, teamAuditorId]);

  // 상근/HQ 심사원 여부 판정 (남경호 대표, 김홍덕 등 상근직원)
  const isHqOrStaffLead = useMemo(() => {
    return selectedLeadAuditor?.isSystemAdmin || 
           selectedLeadAuditor?.affiliation === '상근' || 
           selectedLeadAuditor?.name === '남경호' || 
           selectedLeadAuditor?.name === '김홍덕';
  }, [selectedLeadAuditor]);

  // 협력 기관 확인 및 이해충돌 판정
  const activeAgencyName = useMemo(() => {
    if (!selectedCompany) return '';
    if (receptionType === '신규인증' || receptionType === '전환심사') return newAgency || '사무국직영';
    return selectedCompany.consultant || selectedCompany.agency || '사무국직영';
  }, [receptionType, newAgency, selectedCompany]);

  const hasPartnerAgency = activeAgencyName && activeAgencyName !== '사무국직영' && activeAgencyName !== '직영';
  const isConflict = isConflictOfInterest(activeAgencyName, selectedLeadAuditor?.name || '');

  // HQ 심사 + 협력기관 존재 시 사전 협의 확정 State
  const needAgencyAgreement = isHqOrStaffLead && hasPartnerAgency && !isConflict;
  const [agencyAgreementStatus, setAgencyAgreementStatus] = useState<'협의완료' | '협의대기' | '협의불필요'>('협의불필요');
  const [agencyAgreementNote, setAgencyAgreementNote] = useState<string>('');
  const [agencyAgreementDate, setAgencyAgreementDate] = useState<string>('');

  // [K] 공식 서식 연동 State
  const [certChangeData, setCertChangeData] = useState<CertChangeApplicationData>({
    appliedDate: '',
    companyName: '',
    certNumber: '',
    dept: '',
    contactPerson: '',
    tel: '',
    fax: '',
    currentScope: '',
    changeCategories: ['상호', '주소'],
    newCompanyNameKo: '',
    newCompanyNameEn: '',
    newCeoName: '',
    newAddressHeadKo: '',
    attachedDocuments: ['사업자등록증 사본', '공장등록증명서'],
    verifyMethod: '서류확인',
    auditorChargeName: '',
    reviewerName: '사무국 검토원',
    approverName: '남경호 대표이사'
  });

  const [weekendData, setWeekendData] = useState<WeekendAuditReasonData>({
    auditDates: '',
    isWeekendOrHoliday: false,
    reasonCategory: '전기요금절감',
    detailedReason: '',
    auditorSigned: false,
    auditorSignedAt: '',
    clientVerified: false,
    clientVerifiedAt: '',
    clientVerificationMethod: '이메일확인',
    clientEmail: '',
    clientName: ''
  });

  // 주말/법정공휴일/대체공휴일/임시공휴일 심사 포함 여부 자동 산출
  const holidayCheck = useMemo(() => {
    return checkAuditPeriodForHolidays(plannedStartDate, plannedEndDate);
  }, [plannedStartDate, plannedEndDate]);

  const isWeekendAudit = holidayCheck.hasWeekendOrHoliday;

  // [탭별 작성 가능/활성화 여부 조건 (8대 공인 표준 서식)]
  // 1. 계약검토보고서 (F02): 전 심사 공통 활성화
  const isContractReviewAllowed = true;
  // 2. 공정성관리평가서 (F14): 전 심사 공통 활성화
  const isImpartialityAllowed = true;
  // 3. 표준계약서 (F16-004): 갱신, 최초(신규), 전환, 재인증 활성화
  const isContractAllowed = receptionType === '신규인증' || receptionType === '갱신심사' || receptionType === '전환심사' || (receptionType as string) === '재인증';
  // 4. 심사계획·청구서 (F16): 전 심사 공통 활성화
  const isPlanAllowed = true;
  // 5. 심사설문서: 신규, 갱신, 전환, 재인, 규격추가, 인증변경, 재심사 활성화 (1,2차 사후관리 제외)
  const isSurveyAllowed = receptionType === '신규인증' || receptionType === '갱신심사' || receptionType === '전환심사' || (receptionType as string) === '재인증' || receptionType === '규격추가' || receptionType === '인증변경' || receptionType === '재심사';
  // 6. 갱신추가설문서: 갱신심사 전용
  const isRenewalSurveyAllowed = receptionType === '갱신심사';
  // 7. 인증평가신청서: 인증변경사항 유무 토글이 [유]이거나 규격추가/인증변경/인원변동 시 활성화
  const isCertChangeAllowed = hasCertChange || receptionType === '규격추가' || receptionType === '인증변경' || isEmployeeChanged || receptionType === '신규인증';
  // 8. 휴일근무확인서: 심사일정에 주말(토/일)이 포함된 경우에만 활성화
  const isWeekendAllowed = isWeekendAudit;

  // [L] 오른쪽 종이 파일 철 인덱스 탭 State (9대 공식 서식)
  type DocTabKey = 'review' | 'impartiality' | 'deliberation' | 'contract' | 'plan' | 'survey' | 'renewal_survey' | 'change' | 'weekend';
  const [activeDocTab, setActiveDocTab] = useState<DocTabKey>('review');

  // 심사 구분 변경 시 비활성화된 탭에서 허용된 탭으로 자동 안전 이동
  useEffect(() => {
    const checkAllowed = (tab: DocTabKey): boolean => {
      switch (tab) {
        case 'review': return isContractReviewAllowed;
        case 'impartiality': return isImpartialityAllowed;
        case 'deliberation': return true;
        case 'contract': return isContractAllowed;
        case 'plan': return isPlanAllowed;
        case 'survey': return isSurveyAllowed;
        case 'renewal_survey': return isRenewalSurveyAllowed;
        case 'change': return isCertChangeAllowed;
        case 'weekend': return isWeekendAllowed;
        default: return true;
      }
    };

    if (!checkAllowed(activeDocTab)) {
      setActiveDocTab('review');
    }
  }, [activeDocTab, isContractReviewAllowed, isImpartialityAllowed, isContractAllowed, isPlanAllowed, isSurveyAllowed, isRenewalSurveyAllowed, isCertChangeAllowed, isWeekendAllowed]);

  // [M] 3자 발송 상태
  const [dispatchStatus, setDispatchStatus] = useState<'미발송' | '발송완료'>('미발송');
  const [auditorReply, setAuditorReply] = useState<'대기' | '동의' | '일정조정요청'>('대기');
  const [agencyReply, setAgencyReply] = useState<'대기' | '동의' | '수수료조정요청'>('대기');

  // 계약 레코드 생성 객체 (Right sheet and Save payload)
  const currentContractRecord: AuditContractRecord = useMemo(() => {
    return {
      id: `CTR-${activeCompany.id || '202601'}`,
      contractNumber: `CTR-2026-${(activeCompany.bizNumber || '2148892810').replace(/[^0-9]/g, '').substring(0, 6)}`,
      contractDate: '2026-09-11',
      companyId: activeCompany.id,
      companyName: activeCompany.companyName,
      contractType: receptionType,
      receptionType,
      standards: activeStandards,
      addedStandards: receptionType === '규격추가' ? addedStandards : undefined,
      employeeCount: currentEmployeeCount,
      previousEmployeeCount,
      isEmployeeChanged,
      employeeDiff,
      riskLevel: 'Medium',
      kabStandardMd: kabCalculationResult.calculatedMd,
      appliedMd,
      mdDecisionType,
      standardRatePerMd: 800000,
      ratePerMd,
      standardFee: Math.round(appliedMd * 800000),
      finalFee,
      docAuditMd,
      docAuditFee,
      onsiteAuditMd,
      onsiteAuditFee,
      travelExpense,
      lodgingOption,
      lodgingNights: 1,
      lodgingExpense,
      applicationFee,
      isAdjusted: ratePerMd !== 800000 || mdDecisionType === '수동조정변경',
      adjustmentReason,
      approvalStatus: ratePerMd !== 800000 ? '승인대기' : '승인완료',
      leadAuditorId: selectedLeadAuditor.id,
      leadAuditorName: selectedLeadAuditor.name,
      teamAuditorId: selectedTeamAuditor?.id,
      teamAuditorName: selectedTeamAuditor?.name,
      isHqOrStaffLead,
      agency: activeAgencyName,
      agencyAgreementStatus: needAgencyAgreement ? agencyAgreementStatus : '협의불필요',
      agencyAgreementDate,
      agencyAgreementNote,
      plannedAuditStartDate: plannedStartDate,
      plannedAuditEndDate: plannedEndDate,
      contractStatus: dispatchStatus === '발송완료' ? (auditorReply === '동의' ? '계약체결' : '계획서발송') : '계약대기',
      planInvoiceDispatchStatus: dispatchStatus,
      auditorResponseStatus: auditorReply,
      agencyResponseStatus: agencyReply,
      clientResponseStatus: '확인회신',
      weekendAuditData: weekendData,
      certChangeData
    };
  }, [
    activeCompany, receptionType, activeStandards, addedStandards, currentEmployeeCount, previousEmployeeCount,
    isEmployeeChanged, employeeDiff, kabCalculationResult, appliedMd, mdDecisionType, ratePerMd, finalFee,
    docAuditMd, docAuditFee, onsiteAuditMd, onsiteAuditFee, travelExpense, lodgingOption, lodgingExpense,
    applicationFee, adjustmentReason, selectedLeadAuditor, selectedTeamAuditor, isHqOrStaffLead,
    activeAgencyName, needAgencyAgreement, agencyAgreementStatus, agencyAgreementDate, agencyAgreementNote,
    plannedStartDate, plannedEndDate, dispatchStatus, auditorReply, agencyReply, weekendData, certChangeData
  ]);

  // 전산 저장 & 동기화 핸들러
  const handleSave = () => {
    if (!selectedCompany && !activeCompany.companyName) {
      alert('심사 대상 고객사를 먼저 선택해 주십시오.');
      return;
    }
    setIsSyncing(true);
    onSaveContract(currentContractRecord);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    setTimeout(() => {
      setIsSyncing(false);
      setIsDirty(false);
      setLastSyncedTime(timeStr);
      alert(`[심사계약 및 계획서 저장 & 동기화 완료 (${timeStr})]\n계약번호: ${currentContractRecord.contractNumber}\n고객사: ${currentContractRecord.companyName}\n적용 MD: ${appliedMd} MD (총 ₩${totalWithVat.toLocaleString()}원, VAT포함)\n\n입력 데이터가 시스템 및 계획서·청구서 7종 서식과 성공적으로 동기화되었습니다.`);
    }, 600);
  };

  // 3자 일괄 발송 핸들러
  const handleDispatchAll = () => {
    if (!selectedCompany && !activeCompany.companyName) {
      alert('심사 대상 고객사를 먼저 선택해 주십시오.');
      return;
    }
    setDispatchStatus('발송완료');
    if (onDispatchPlanAndInvoice) {
      onDispatchPlanAndInvoice(currentContractRecord.id, 'all');
    }
    alert(`[3자 일괄 공문 발송 완료]\n1. 피심사기업: ${activeCompany.companyName} (${activeCompany.contactEmail || 'qa@client.co.kr'})\n2. 담당심사원: ${selectedLeadAuditor.name || '미배정'} (${selectedLeadAuditor.email || 'auditor@gmscs.co.kr'})\n3. 협력기관: ${activeAgencyName || '사무국직영'}\n\n심사계획서 및 심사청구서가 3자에게 성공적으로 송부되었습니다.`);
  };

  // 회신 시뮬레이션 핸들러
  const handleSimulateAgree = (role: 'auditor' | 'agency') => {
    if (role === 'auditor') {
      setAuditorReply('동의');
    } else {
      setAgencyReply('동의');
    }
    if (onSimulateResponse) {
      onSimulateResponse(currentContractRecord.id, role, 'agree');
    }
    alert(`[${role === 'auditor' ? '심사팀장' : '협력기관'} 회신 확인]\n일정 및 심사팀 구성에 동의 회신이 등록되어 심사진행 일정이 공식 확정되었습니다.`);
  };

  // 14대 GMSCS 규격 선택 도우미
  const allStandardOptions: StandardCode[] = [
    'ISO 9001:2015',
    'ISO 14001:2015',
    'ISO 45001:2018',
    'ESG-MS:2023',
    'ISO 50001:2018',
    'ISO 27001:2022',
    'ISO 13485:2016',
    'ISO 22000:2018'
  ];

  return (
    <div className="w-full space-y-3 animate-in fade-in text-slate-800">
      
      {/* 최상단 헤더 요약 바 (깔끔한 플랫 디자인) */}
      <div className="bg-white border border-slate-300 rounded-lg p-3 px-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs no-print print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-800 text-white flex items-center justify-center font-bold text-sm">
            F16
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>GMSCS 심사계약·계획 관리</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-cyan-900 font-semibold">
                {activeCompany.companyName || '심사 대상 고객사 미선택'}
              </span>
              {selectedCompany && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {calculatedAuditStageText}
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-500">
              좌측 입력란에 값을 지정하면 우측 공식 서식(계약서·계획서·청구서)에 실시간으로 100% 자동 채워집니다.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {lastSyncedTime && (
            <span className="text-[11px] text-sky-700 font-mono hidden md:inline-block mr-1">
              ✓ 저장됨 ({lastSyncedTime})
            </span>
          )}
          <span className="text-slate-500 font-mono">
            최종청구액: <strong className="text-cyan-950 font-bold text-sm font-mono">₩{totalWithVat.toLocaleString()}</strong> (VAT포함)
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSyncing}
            className={`px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border border-sky-400 ${
              isSyncing ? 'animate-pulse opacity-90' : ''
            }`}
            title="좌측 입력 내용 및 우측 심사계약서·계획서·청구서 전체 서식 전산 저장 & 동기화"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? '저장 & 동기화 중...' : '저장 & 동기화'}</span>
          </button>
          <button
            type="button"
            onClick={handleDispatchAll}
            className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-md font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>3자 일괄 발송</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5 : 7.5 혹은 3 : 7 분할 작업 화면 (Left Input Workbench & Right Paper Binder) */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-col lg:flex-row gap-4 items-start pb-10 print:block print:w-full print:p-0 print:m-0 print:pb-0">

        {/* ------------------------------------------------------------- */}
        {/* LEFT PANEL: 28~30% 입력 메뉴 영역 (인쇄 시 완전 숨김) */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full lg:w-[380px] xl:w-[410px] shrink-0 bg-white border border-slate-300 rounded-lg p-4 space-y-4 text-xs shadow-2xs no-print print:hidden">
          
          {/* 1. 심사 구분 선택 */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">
              <span>1. 심사 구분 및 접수 성격</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['신규인증', '갱신심사', '정기사후', '전환심사', '규격추가', '입회심사'] as AuditContractType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setReceptionType(type);
                    if (type === '규격추가' && addedStandards.length === 0 && newStandards.length > 0) {
                      setAddedStandards([...newStandards]);
                    }
                  }}
                  className={`py-1.5 px-1.5 rounded-md font-bold text-center border transition cursor-pointer text-[11px] ${
                    receptionType === type
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-slate-100 hover:bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {type === '정기사후' ? '사후관리 (1·2차)' :
                   type === '갱신심사' ? '갱신심사 (재인)' :
                   type === '신규인증' ? '최초 (신규)' :
                   type === '입회심사' ? '입회심사' :
                   type === '재심사' ? '재심사' : type}
                </button>
              ))}
            </div>
            
            {/* 인증변경사항 유무 라디오 단추 (가운데 정렬) */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-[12px] pt-2 pb-1">
              <span className="font-bold text-slate-700">인증변경사항 유무:</span>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-800 font-semibold hover:text-purple-700">
                  <input
                    type="radio"
                    name="hasCertChange"
                    value="yes"
                    checked={hasCertChange === true}
                    onChange={() => setHasCertChange(true)}
                    className="w-3.5 h-3.5 text-purple-600 accent-purple-600 cursor-pointer"
                  />
                  <span>유</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-800 font-semibold hover:text-slate-900">
                  <input
                    type="radio"
                    name="hasCertChange"
                    value="no"
                    checked={hasCertChange === false}
                    onChange={() => setHasCertChange(false)}
                    className="w-3.5 h-3.5 text-slate-600 accent-slate-600 cursor-pointer"
                  />
                  <span>무</span>
                </label>
              </div>
              {hasCertChange && (
                <span className="text-[11px] text-purple-700 font-bold">
                  (인증변경신청서 F19-002 활성화)
                </span>
              )}
            </div>
          </div>

          {/* 2. 심사 대상 고객사 DB 검색 및 선택 (모든 접수 구분 공통 지원) */}
          <div className="space-y-2.5 border-t border-slate-200 pt-3">
            <label className="font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-700" />
              <span>2. 심사 대상 고객사 DB 검색 및 선택</span>
            </label>

            {/* 검색 및 드롭다운 */}
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="고객사명 / 사업자번호 / 대표자 검색..."
                  value={companySearchQuery}
                  onChange={(e) => setCompanySearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md pl-8 pr-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  const targetId = e.target.value;
                  if (isDirty) {
                    if (!window.confirm('[저장 & 동기화 확인]\n입력 중인 심사계획 및 계약 정보가 아직 [저장 & 동기화]되지 않았습니다.\n\n저장하지 않고 다른 고객사로 이동하시겠습니까?')) {
                      return;
                    }
                  }
                  setSelectedCompanyId(targetId);
                  const target = companies.find(c => c.id === targetId);
                  if (target) {
                    setCurrentEmployeeCount(target.totalEmployees || 1);
                  } else {
                    setCurrentEmployeeCount(0);
                  }
                  setIsDirty(false);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-500"
              >
                <option value="">-- 심사 대상 고객사를 선택하세요 --</option>
                {filteredCompanyList.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.companyName} (대표: {comp.ceoName} · IAF {comp.iafCode || '14'} {comp.isTransfer ? '· 전환고객' : ''})
                  </option>
                ))}
              </select>
            </div>

            {/* 전환 고객사 감지 배너 */}
            {selectedCompany?.isTransfer && (
              <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-cyan-950">
                  <span className="flex items-center gap-1">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-700" />
                    <span>타 기관 전환 심사 고객 ({selectedCompany.transferType || '타기관 인증 전환'})</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-cyan-200/80 text-cyan-900 rounded font-mono font-bold">
                    {selectedCompany.prevCertificationBody || '한국품질재단(KFQ)'}
                  </span>
                </div>
                <div className="text-[11px] text-cyan-900/90 leading-tight">
                  이전 인증번호: <span className="font-mono font-semibold">{selectedCompany.prevCertNumber || 'KFQ-QA-10928'}</span>
                  {selectedCompany.prevCertExpiryDate && ` · 이전 만료: ${selectedCompany.prevCertExpiryDate}`}
                </div>
                {selectedCompany.transferReason && (
                  <div className="text-[10.5px] text-cyan-800 italic pt-0.5 border-t border-cyan-200/60">
                    사유: {selectedCompany.transferReason}
                  </div>
                )}
              </div>
            )}

            {/* 신규인증 / 전환심사 / 규격추가 시 적용할 심사 규격 다중 선택 */}
            {(receptionType === '신규인증' || receptionType === '전환심사' || receptionType === '규격추가') && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
                <span className="font-bold text-slate-800 text-[11px] block flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-600" />
                    <span>{receptionType === '규격추가' ? '인증 및 추가 심사 규격 (보유규격 자동체크):' : '적용 심사 규격 선택:'}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    선택 {receptionType === '규격추가' ? addedStandards.length : newStandards.length}개
                  </span>
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {(['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'ISO 27001:2022', 'ISO 13485:2016', 'ISO 22000:2018', 'ISO 50001:2018', 'ESG-MS:2023'] as StandardCode[]).map(std => {
                    const isChecked = receptionType === '규격추가' ? addedStandards.includes(std) : newStandards.includes(std);
                    return (
                      <label key={std} className="flex items-center space-x-1.5 text-[11px] text-slate-700 cursor-pointer hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (receptionType === '규격추가') {
                              if (e.target.checked) setAddedStandards(Array.from(new Set([...addedStandards, std])));
                              else setAddedStandards(addedStandards.filter(s => s !== std));
                            } else {
                              if (e.target.checked) setNewStandards(Array.from(new Set([...newStandards, std])));
                              else setNewStandards(newStandards.filter(s => s !== std));
                            }
                          }}
                          className="rounded text-cyan-700 accent-cyan-700"
                        />
                        <span>{std}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DB 호출된 기업 정보 요약 (플랫 테두리) */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 space-y-1 text-[11px] text-slate-700">
              {selectedCompany ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">사업자번호:</span>
                    <span className="font-mono text-slate-900 font-semibold">{activeCompany.bizNumber || '--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">대표자:</span>
                    <span className="text-slate-900 font-medium">{activeCompany.ceoName || '--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">소재지:</span>
                    <span className="truncate max-w-[200px] text-slate-900">{activeCompany.address || '--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">실무담당자:</span>
                    <span className="text-slate-900">
                      {activeCompany.contactPerson ? `${activeCompany.contactPerson} (${activeCompany.contactPhone || '--'})` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">IAF 코드:</span>
                      <span className="font-mono text-cyan-900 font-bold">IAF {activeCompany.iafCode || '--'}</span>
                    </div>
                    {onOpenCompanyAuditHistory && selectedCompany && (
                      <button
                        type="button"
                        onClick={() => onOpenCompanyAuditHistory(selectedCompany)}
                        className="text-[11px] text-cyan-700 hover:text-cyan-900 hover:underline font-bold cursor-pointer inline-flex items-center gap-0.5"
                        title="고객 상세 정보 및 전체 심사이력 조회"
                      >
                        상세정보 ↗
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-2 text-center text-slate-400 text-[11px]">
                  고객사를 선택하면 기본 정보(사업자번호, 대표자, 소재지 등)가 자동 호출됩니다.
                </div>
              )}
            </div>

            {/* DB 호출된 인증범위 요약 박스 */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 space-y-1 text-[11px] text-slate-700">
              <div className="flex justify-between items-center pb-0.5 border-b border-slate-200/80">
                <span className="text-slate-500 font-bold">인증범위 (국문/영문):</span>
                {selectedCompany && (
                  <button
                    type="button"
                    onClick={() => setIsManualEditOpen(!isManualEditOpen)}
                    className="text-[10px] text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>{isManualEditOpen ? '수정 접기 ▲' : '정보 직접 수정 ▼'}</span>
                  </button>
                )}
              </div>
              <div className="text-slate-900 font-medium leading-relaxed break-keep pt-0.5">
                {activeCompany.scope || (selectedCompany ? '인증범위 정보 없음' : '고객사를 선택하면 인증범위가 자동으로 연동됩니다.')}
              </div>
            </div>

            {/* 정보 직접 수정 모드 펼침 영역 */}
            {isManualEditOpen && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md space-y-2 text-xs animate-in fade-in">
                <div className="font-bold text-amber-900 text-[11px] flex items-center justify-between pb-1 border-b border-amber-200/80">
                  <span>계약·계획서 반영 기업정보 직접 수정</span>
                  <span className="text-[10px] text-amber-700 font-normal">현재 계약 문서에만 적용</span>
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="기업명"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="대표자명"
                      value={newCeoName}
                      onChange={(e) => setNewCeoName(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="사업자번호"
                      value={newBizNumber}
                      onChange={(e) => setNewBizNumber(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="소재지 주소"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="담당자명"
                      value={newContactPerson}
                      onChange={(e) => setNewContactPerson(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="담당자 연락처"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="인증범위 수정"
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-xs resize-none placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. 인원수 변동 확인 */}
          <div className="space-y-1.5 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>3. 종업원수 확인 &amp; 변동 검증</span>
              </label>
              {isEmployeeChanged && (
                <span className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded ${
                  employeeDiff > 0 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {employeeDiff > 0 ? `+${employeeDiff}명 증가` : `${employeeDiff}명 감소`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-center">
                <span className="text-[10px] text-slate-500 block">이전 심사 인원</span>
                <strong className="font-mono text-xs text-slate-800">{previousEmployeeCount}명</strong>
              </div>
              <span className="text-slate-400 font-bold">→</span>
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 block">현재 실무 인원</span>
                <input
                  type="number"
                  value={currentEmployeeCount}
                  onChange={(e) => setCurrentEmployeeCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-500 text-center"
                />
              </div>
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
                <span className="text-[10px] text-slate-500 block">IAF 코드</span>
                <input
                  type="text"
                  value={activeCompany.iafCode || '17'}
                  readOnly={receptionType !== '신규인증' && receptionType !== '전환심사'}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-center text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">EA 코드</span>
                <input
                  type="text"
                  defaultValue="17"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-center text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">KSIC</span>
                <input
                  type="text"
                  defaultValue="C2431"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-center text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 4. 심사 정보 & 배정 (팀장, 일정, 협력기관) */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <label className="font-bold text-slate-900 flex items-center justify-between">
              <span>4. 심사 배정 &amp; 일정 / 협력기관</span>
              {isHqOrStaffLead && (
                <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-900 font-bold">
                  HQ 상근직원 배정
                </span>
              )}
            </label>

            <div className="space-y-1.5">
              {/* 심사 표준 */}
              <div>
                <span className="text-[11px] text-slate-500 block">심사 표준 (규격):</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {activeStandards.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[10.5px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* 일정 */}
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[10.5px] text-slate-500 block">심사 시작일:</span>
                  <input
                    type="date"
                    value={plannedStartDate}
                    onChange={(e) => setPlannedStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-500 block">심사 종료일:</span>
                  <input
                    type="date"
                    value={plannedEndDate}
                    onChange={(e) => setPlannedEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px]"
                  />
                </div>
              </div>

              {/* 주말/공휴일/임시공휴일 심사 감지 안내 */}
              {isWeekendAudit ? (
                <div className="text-[10.5px] font-bold text-amber-900 bg-amber-50 border border-amber-300 rounded p-1.5 flex items-start gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-tight">
                    <div>
                      <span className="text-amber-700 font-extrabold">[휴일 감지: {holidayCheck.summaryText}]</span>
                    </div>
                    <div className="text-[10px] text-amber-800 font-medium mt-0.5">
                      ➔ <strong>[휴일근무확인서(F19-003)]</strong> 탭이 자동 활성화되었습니다.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 pl-1">
                  평일 심사 일정 (주말/공휴일 미포함 시 휴일근무확인서 작성 제외)
                </div>
              )}

              {/* 심사팀장 배정 */}
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[10.5px] text-slate-500 block">담당 심사팀장:</span>
                  <select
                    value={leadAuditorId}
                    onChange={(e) => setLeadAuditorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] font-bold text-slate-800"
                  >
                    <option value="">-- 심사팀장 선택 --</option>
                    {auditors.map(aud => (
                      <option key={aud.id} value={aud.id}>
                        {aud.name} ({aud.affiliation || '비상근'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-500 block">협력기관 (영업컨설팅):</span>
                  <div className="p-1 px-2 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-800 truncate">
                    {activeAgencyName}
                  </div>
                </div>
              </div>

              {/* HQ 심사 + 협력기관 존재 시: 사전 협의 확정란 */}
              {needAgencyAgreement && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-amber-600" />
                      <span>HQ-협력기관 사전 협의 확정</span>
                    </span>
                    <select
                      value={agencyAgreementStatus}
                      onChange={(e) => setAgencyAgreementStatus(e.target.value as any)}
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-bold text-emerald-800"
                    >
                      <option value="협의완료">협의완료 ✓</option>
                      <option value="협의대기">협의대기</option>
                      <option value="협의불필요">협의불필요</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={agencyAgreementNote}
                    onChange={(e) => setAgencyAgreementNote(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[10.5px]"
                    placeholder="사전 유선 협의 내용 및 확정 비고..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* 5. KAB MD 산정 & 단가 결정 & 5대 공식 비용 */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-600" />
                <span>5. MD 산정 &amp; 단가 및 5대 비용</span>
              </label>
              <span className="text-[10.5px] font-mono text-slate-500">
                KAB 기준: {kabCalculationResult.calculatedMd} MD
              </span>
            </div>

            <div className="space-y-1.5">
              {/* MD 유지 vs 변경 & 단가 결정 */}
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 block">MD 결정:</span>
                  <select
                    value={mdDecisionType}
                    onChange={(e) => setMdDecisionType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] font-bold text-slate-800"
                  >
                    <option value="KAB표준유지">KAB 표준 유지 ({kabCalculationResult.calculatedMd} MD)</option>
                    <option value="수동조정변경">수동 조정 변경</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">MD당 단가:</span>
                  <select
                    value={ratePerMd}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setRatePerMd(val);
                      if (val === 800000) setAdjustmentReason('표준 80만/MD 준수');
                      else setAdjustmentReason(`우대 협의 단가 적용 (${val / 10000}만/MD)`);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] font-bold font-mono text-slate-800"
                  >
                    <option value={800000}>₩800,000 (KAB 표준단가)</option>
                    <option value={750000}>₩750,000 (우대 협의단가)</option>
                    <option value={700000}>₩700,000 (다규격 우대단가)</option>
                    <option value={600000}>₩600,000 (특별 협의단가)</option>
                  </select>
                </div>
              </div>

              {/* 5대 비용 테이블 명세 */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-[10.5px]">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-1 px-2 text-left">항목</th>
                      <th className="py-1 px-1.5 text-center">공수</th>
                      <th className="py-1 px-2 text-right">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    <tr>
                      <td className="py-1 px-2">1. 문서심사비</td>
                      <td className="py-1 px-1.5 text-center font-mono">{docAuditMd} MD</td>
                      <td className="py-1 px-2 text-right font-mono">₩{docAuditFee.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">2. 현장심사비</td>
                      <td className="py-1 px-1.5 text-center font-mono">{onsiteAuditMd} MD</td>
                      <td className="py-1 px-2 text-right font-mono">₩{onsiteAuditFee.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">3. 여비교통비</td>
                      <td className="py-1 px-1.5 text-center text-slate-400">—</td>
                      <td className="py-1 px-2 text-right font-mono">
                        <input
                          type="number"
                          value={travelExpense}
                          onChange={(e) => setTravelExpense(parseInt(e.target.value, 10) || 0)}
                          className="w-20 text-right font-mono text-[10.5px] border border-slate-200 rounded px-1 py-0.5"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">4. 출장숙박비</td>
                      <td className="py-1 px-1.5 text-center text-slate-400">—</td>
                      <td className="py-1 px-2 text-right text-slate-600 font-mono">₩{lodgingExpense} ({lodgingOption})</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">5. 신청및등록비</td>
                      <td className="py-1 px-1.5 text-center text-slate-400">—</td>
                      <td className="py-1 px-2 text-right font-mono">₩{applicationFee.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t border-slate-300 text-slate-900">
                      <td className="py-1.5 px-2" colSpan={2}>공급가액 소계</td>
                      <td className="py-1.5 px-2 text-right font-mono">₩{finalFee.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="py-1 px-2" colSpan={2}>부가가치세 (10%)</td>
                      <td className="py-1 px-2 text-right font-mono">₩{vat.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-cyan-900 text-white font-black">
                      <td className="py-1.5 px-2" colSpan={2}>최종 청구 총액</td>
                      <td className="py-1.5 px-2 text-right font-mono text-xs">₩{totalWithVat.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 6. 심사계획서 및 공문 사무국 작성 정보 */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <label className="font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-cyan-700" />
                <span>6. 심사계획서 공문 입력 (사무국)</span>
              </span>
              <span className="text-[10.5px] font-mono text-cyan-900 font-bold">
                {planDocNumber}
              </span>
            </label>

            <div className="space-y-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 block">작성일자</span>
                  <input
                    type="date"
                    value={planDate}
                    onChange={(e) => setPlanDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">문서일련번호(2자리)</span>
                  <input
                    type="text"
                    value={planDocSeq}
                    maxLength={2}
                    onChange={(e) => setPlanDocSeq(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-center"
                    placeholder="01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 block">고객번호</span>
                  <input
                    type="text"
                    value={planCustomerNumber}
                    onChange={(e) => setPlanCustomerNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                    placeholder="예: Q240233"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">담당부서</span>
                  <input
                    type="text"
                    value={planDept}
                    onChange={(e) => setPlanDept(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    placeholder="품질보증부"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold text-slate-700">담당자 성명</span>
                  <input
                    type="text"
                    value={planContactPerson}
                    onChange={(e) => setPlanContactPerson(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-900"
                    placeholder="담당자 성명"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">담당자 직책</span>
                  <input
                    type="text"
                    value={planContactPosition}
                    onChange={(e) => setPlanContactPosition(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    placeholder="부장"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 block">KSIC (산업분류코드)</span>
                  <input
                    type="text"
                    value={planKsicCode}
                    onChange={(e) => setPlanKsicCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold"
                    placeholder="C2431"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">팩스번호</span>
                  <input
                    type="text"
                    value={planFax}
                    onChange={(e) => setPlanFax(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                    placeholder="054-956-8225"
                  />
                </div>
              </div>

              {/* 추가사업장 주소 (1행 전체 너비) */}
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">추가사업장 주소 (사업장1 주소)</span>
                <input
                  type="text"
                  value={planSubAddress}
                  onChange={(e) => setPlanSubAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
                  placeholder="추가사업장 주소 (있을 시 자동 연동 및 직접 수정)"
                />
              </div>
            </div>
          </div>

          {/* 7. 3자 공문 발송 및 회신 시뮬레이션 버튼 바 */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800">3자 공문 발송 &amp; 회신:</span>
              <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                dispatchStatus === '발송완료' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {dispatchStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSimulateAgree('auditor')}
                className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded border border-slate-300 text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>심사원 동의 회신</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateAgree('agency')}
                className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded border border-slate-300 text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3 text-blue-600" />
                <span>협력기관 동의 회신</span>
              </button>
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT PANEL: 70~72% 종이 파일 철 인덱스 탭 & A4 실물 서식 영역 */}
        {/* ------------------------------------------------------------- */}
        <div className="flex-1 w-full bg-slate-200/70 border border-slate-300 rounded-lg overflow-hidden flex flex-col min-h-[920px] print:border-none print:bg-transparent print:min-h-0 print:overflow-visible print:w-full print:m-0 print:p-0">
          
          {/* 상단 서식철 유틸리티 바 */}
          <div className="bg-slate-200/95 border-b border-slate-300 px-4 py-2 flex items-center justify-between no-print print:hidden">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-700 animate-pulse"></span>
              <span className="font-bold text-slate-800 text-xs">2025 Audit Report Pack(251001)</span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-[11px] text-slate-600">
                심사구분: <strong className="text-slate-900">{receptionType}</strong> ({calculatedAuditStageText})
              </span>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>A4 인쇄 / PDF 출력</span>
            </button>
          </div>

          {/* 종이 파일 인덱스 탭 바 (8대 공인 표준 서식 완벽 균등 배치) */}
          <div className="w-full bg-slate-300/80 border-b border-slate-400 p-0 m-0 no-print print:hidden flex items-stretch">
            {[
              {
                id: 'review' as DocTabKey,
                label: '계약검토보고서',
                sub: '(F02)',
                icon: FileText,
                isAllowed: isContractReviewAllowed,
                activeColor: 'bg-white border-t-cyan-700 text-cyan-950',
                disabledHint: ''
              },
              {
                id: 'impartiality' as DocTabKey,
                label: '공정성관리평가서',
                sub: '(F14)',
                icon: FileCheck,
                isAllowed: isImpartialityAllowed,
                activeColor: 'bg-white border-t-emerald-700 text-emerald-950',
                disabledHint: ''
              },
              {
                id: 'deliberation' as DocTabKey,
                label: '심의결과보고서',
                sub: '(F18)',
                icon: Award,
                isAllowed: true,
                activeColor: 'bg-white border-t-purple-700 text-purple-950',
                disabledHint: ''
              },
              {
                id: 'contract' as DocTabKey,
                label: '표준계약서',
                sub: '(F16-004)',
                icon: FileCheck,
                isAllowed: isContractAllowed,
                activeColor: 'bg-white border-t-blue-700 text-blue-950',
                disabledHint: '1·2차 사후관리 심사는 표준계약서 작성 대상이 아닙니다.'
              },
              {
                id: 'plan' as DocTabKey,
                label: '심사계획·청구서',
                sub: '(F16)',
                icon: Receipt,
                isAllowed: isPlanAllowed,
                activeColor: 'bg-white border-t-indigo-700 text-indigo-950',
                disabledHint: ''
              },
              {
                id: 'survey' as DocTabKey,
                label: '심사 설문서',
                sub: '(F02-002)',
                icon: ClipboardList,
                isAllowed: isSurveyAllowed,
                activeColor: 'bg-white border-t-teal-700 text-teal-950',
                disabledHint: '정기 사후관리 심사는 심사설문서 작성 대상이 아닙니다.'
              },
              {
                id: 'renewal_survey' as DocTabKey,
                label: '갱신추가 설문서',
                sub: '(F02-003)',
                icon: HelpCircle,
                isAllowed: isRenewalSurveyAllowed,
                activeColor: 'bg-white border-t-purple-700 text-purple-950',
                disabledHint: '갱신심사(재인증) 대상 기업에 한하여 작성하는 설문서입니다.'
              },
              {
                id: 'change' as DocTabKey,
                label: '인증평가신청서',
                sub: '(F19-002)',
                icon: RefreshCw,
                isAllowed: isCertChangeAllowed,
                activeColor: 'bg-white border-t-rose-700 text-rose-950',
                disabledHint: '규격추가, 상호/소재지 변경, 인원 변동 등 변경 사항 발생 시에만 활성화됩니다.'
              },
              {
                id: 'weekend' as DocTabKey,
                label: '휴일근무 확인서',
                sub: '(F16-005)',
                icon: Clock,
                isAllowed: isWeekendAllowed,
                activeColor: 'bg-white border-t-amber-700 text-amber-950',
                disabledHint: '심사일정에 주말(토/일) 및 법정 공휴일이 포함된 경우에만 활성화됩니다.'
              }
            ].map((tab) => {
              const isActive = activeDocTab === tab.id;
              const isAllowed = tab.isAllowed;

              return (
                <button
                  key={tab.id}
                  type="button"
                  disabled={!isAllowed}
                  onClick={() => {
                    if (isAllowed) setActiveDocTab(tab.id);
                  }}
                  title={!isAllowed ? tab.disabledHint : `${tab.label} ${tab.sub}`}
                  className={`flex-1 min-w-0 py-2.5 px-1 text-center flex flex-col items-center justify-center border-r last:border-r-0 border-slate-300 transition select-none relative ${
                    isActive
                      ? `${tab.activeColor} border-t-2 font-bold shadow-xs -bottom-[1px] z-10`
                      : isAllowed
                      ? 'bg-slate-200/90 hover:bg-white/80 text-slate-700 border-t-2 border-t-transparent cursor-pointer'
                      : 'bg-slate-200/90 text-slate-400/80 border-t-2 border-t-transparent cursor-not-allowed opacity-55'
                  }`}
                >
                  <div className="flex items-center gap-1 truncate max-w-full justify-center">
                    <tab.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? '' : isAllowed ? 'text-slate-600' : 'text-slate-400'}`} />
                    <span className="truncate text-xs tracking-tight">{tab.label}</span>
                  </div>
                  <span className={`text-[10px] truncate max-w-full font-normal ${isActive ? 'opacity-85' : 'opacity-60'}`}>
                    {!isAllowed ? '(작성제외)' : tab.sub}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 실물 A4 종이 캔버스 영역 (스크롤 가능, 백색 종이 시트 렌더링) */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto flex justify-center bg-slate-200/60 print:p-0 print:m-0 print:bg-transparent print:overflow-visible print:block">
            <div className="w-full max-w-[850px] bg-white border border-slate-300 shadow-md p-8 md:p-12 text-slate-900 font-sans a4-sheet a4-page a4-single-page print:shadow-none print:border-none print:p-3 print:max-w-none print:w-full print:min-h-0">
              
              {/* ================================================================= */}
              {/* 1. 계약검토보고서 (F02) - ERP MenuD/D001_Add.do 1:1 완벽 서식 */}
              {/* ================================================================= */}
              {activeDocTab === 'review' && (
                <div className="space-y-3 text-xs leading-relaxed text-slate-900 font-sans">
                  {/* 상단 타이틀 바 */}
                  <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 tracking-tight">계약검토보고서</h2>
                      <span className="font-mono text-[10px] text-slate-500">gms.z99.kr/Admin/MenuD/D001_Add.do</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-600 font-medium">관리번호:</span>
                        <input type="text" placeholder="관리번호 입력" className="border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono w-36 bg-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-600 font-medium">검토일자:</span>
                        <input type="text" placeholder="YYYY-MM-DD" className="border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono w-28 text-center bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* 1. 기본 정보 테이블 */}
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <th className="w-24 bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">고객명</th>
                        <td className="p-1.5 border-r border-slate-300 font-medium">{activeCompany.companyName}</td>
                        <th className="w-24 bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">인증번호</th>
                        <td className="p-1.5 font-mono">
                          <input 
                            type="text" 
                            defaultValue={(activeCompany as any).certNo || ''} 
                            placeholder="인증번호 입력 (최초 시 직접 입력)" 
                            className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono bg-white" 
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <th className="bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">주소</th>
                        <td className="p-1.5" colSpan={3}>
                          <input 
                            type="text" 
                            defaultValue={activeCompany.address || ''} 
                            placeholder="사업장 소재지 주소" 
                            className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs bg-white" 
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <th className="bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium" rowSpan={3}>인증표준</th>
                        <td className="p-1.5 border-r border-slate-300">
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> ISO 9001:2015</label>
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> ISO 14001:2015</label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" /> 기타 ( <input type="text" className="w-24 border-b border-slate-300 px-1 py-0 text-xs bg-transparent" /> )
                            </label>
                          </div>
                        </td>
                        <th className="w-24 bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">code</th>
                        <td className="p-1.5 font-mono">
                          <input 
                            type="text" 
                            defaultValue={activeCompany.iafCode || ''} 
                            placeholder="IAF 코드" 
                            className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono bg-white" 
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-1.5 border-r border-slate-300 text-slate-400"></td>
                        <th className="bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">KSIC(산업분류코드)</th>
                        <td className="p-1.5 font-mono">
                          <input 
                            type="text" 
                            defaultValue={(activeCompany as any).ksicCode || ''} 
                            placeholder="KSIC 코드" 
                            className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono bg-white" 
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-1.5 border-r border-slate-300">
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> ISO 22000:2018</label>
                            <div className="flex items-center gap-1">
                              <span>Category:</span>
                              <input type="text" className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                            </div>
                            <div className="flex items-center gap-1">
                              <span>HACCP 수:</span>
                              <input type="text" className="w-10 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                            </div>
                          </div>
                        </td>
                        <th className="bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">총 사업장 수</th>
                        <td className="p-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <input type="text" className="w-12 border border-slate-300 rounded px-1 py-0.5 text-xs text-center bg-white" />
                            <div className="flex items-center gap-1 text-slate-500">
                              <span>심사대상 사업장 수:</span>
                              <input type="text" className="w-12 border border-slate-300 rounded px-1 py-0.5 text-xs text-center bg-white" />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">신청인증 범위</th>
                        <td className="p-1.5 leading-relaxed" colSpan={3}>
                          <input 
                            type="text" 
                            defaultValue={activeCompany.scope || ''} 
                            placeholder="신청인증 범위 입력" 
                            className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs bg-white" 
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 2. 심사종류 및 세부 M/D 배정 테이블 */}
                  <div className="border border-slate-400">
                    <div className="p-1.5 bg-slate-50 border-b border-slate-300 flex items-center gap-6 font-medium">
                      <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" /> 최초심사</label>
                      <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" /> 사후심사</label>
                      <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" /> 갱신심사</label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" /> 기타( <input type="text" className="w-20 border-b border-slate-300 px-1 py-0 text-xs bg-transparent" /> )
                      </label>
                    </div>
                    <table className="w-full border-collapse text-center text-xs">
                      <thead className="bg-slate-100 border-b border-slate-300">
                        <tr>
                          <th className="w-24 p-1.5 border-r border-slate-300 font-medium">심사종류</th>
                          <th className="p-1.5 border-r border-slate-300 font-normal"><input type="checkbox" /> 예비심사</th>
                          <th className="p-1.5 border-r border-slate-300 font-normal"><input type="checkbox" /> 1단계심사</th>
                          <th className="p-1.5 border-r border-slate-300 font-normal"><input type="checkbox" /> 2단계심사</th>
                          <th className="p-1.5 border-r border-slate-300 font-normal"><input type="checkbox" /> 방문심사</th>
                          <th className="p-1.5 font-normal"><input type="checkbox" /> 기타( )</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        <tr>
                          <th className="bg-slate-100 p-1.5 border-r border-slate-300 font-medium">심사 M/D</th>
                          <td className="p-1 border-r border-slate-300 font-mono"><input type="text" placeholder="0.00 M/D" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 border-r border-slate-300 font-mono"><input type="text" placeholder="0.00 M/D" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 border-r border-slate-300 font-mono"><input type="text" placeholder="0.00 M/D" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 border-r border-slate-300 font-mono"><input type="text" placeholder="0.00 M/D" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 font-mono"><input type="text" placeholder="0.00 M/D" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-1.5 border-r border-slate-300 font-medium">심사예정시기</th>
                          <td className="p-1 border-r border-slate-300 font-mono"><input type="text" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 border-r border-slate-300 font-mono"><input type="text" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 border-r border-slate-300 font-mono"><input type="text" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 border-r border-slate-300 font-mono"><input type="text" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 font-mono"><input type="text" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-1.5 border-r border-slate-300 font-medium">CODE심사원</th>
                          <td className="p-1 border-r border-slate-300"><input type="text" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 border-r border-slate-300"><input type="text" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 border-r border-slate-300"><input type="text" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1 border-r border-slate-300"><input type="text" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                          <td className="p-1"><input type="text" className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-xs bg-white" /></td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-1.5 border-r border-slate-300 font-medium">특기사항</th>
                          <td colSpan={5} className="p-1">
                            <input type="text" placeholder="특기사항 입력" className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 3. 검토대상 바 */}
                  <div className="p-1.5 bg-slate-100 border border-slate-400 font-medium text-slate-800">
                    검토대상: 1. 신청서 및 설문서 &nbsp;&nbsp; 2. 인증제안 &nbsp;&nbsp; 3. 인증계약서 &nbsp;&nbsp; 4. 첨부서류
                  </div>

                  {/* 4. 검토내용 및 결과 메인 테이블 */}
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <thead className="bg-slate-100 border-b border-slate-400 font-bold text-center">
                      <tr>
                        <th className="w-24 p-1.5 border-r border-slate-300">구분</th>
                        <th className="p-1.5 border-r border-slate-300">검토항목</th>
                        <th className="w-40 p-1.5 border-r border-slate-300">기준</th>
                        <th className="w-48 p-1.5">검토결과</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      <tr>
                        <th className="bg-slate-100 p-2 border-r border-slate-300 font-medium text-center" rowSpan={8}>
                          검토내용 및 결과
                        </th>
                        <td className="p-1.5 border-r border-slate-300">
                          <div className="font-semibold mb-1">심사일수의 적절성(공통) - 다음사항에 따라 가감 적용(20% 이내)</div>
                          <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                            <div className="flex items-center justify-between pr-2">
                              <span>1) 직원수 ( <input type="text" className="w-10 border border-slate-300 rounded px-1 py-0.2 text-center text-xs bg-white" /> )명</span>
                              <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                            </div>
                            <div className="flex items-center justify-between pr-2">
                              <span>2) 언어(통역필요 유무)</span>
                              <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                            </div>
                            <div className="flex items-center justify-between pr-2">
                              <span>3) 현장 순회 및 이동시간</span>
                              <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                            </div>
                            <div className="flex items-center justify-between pr-2">
                              <span>4) 인증범위 복합성 (시스템 복합성)</span>
                              <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                            </div>
                            <div className="flex items-center justify-between pr-2">
                              <span>5) 설계의 책임</span>
                              <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                            </div>
                            <div className="flex items-center justify-between pr-2">
                              <span>6) 타 인증기관의 인증 (유사인증)</span>
                              <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-between pr-2 pt-1 border-t border-slate-200">
                              <span>7) 공정의 단순성, 현장의수</span>
                              <input type="text" className="border border-slate-300 rounded px-1.5 py-0.5 w-44 bg-white" placeholder="" />
                            </div>
                          </div>
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-center align-middle font-mono font-medium">
                          KSP-17-17 &amp; KSI-03
                        </td>
                        <td className="p-1.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>기준일수</span>
                            <div className="flex items-center gap-1 font-mono">
                              <input type="text" className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs text-center bg-white" placeholder="M/D" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-200 pt-1">
                            <span>적용 %</span>
                            <input type="text" className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs text-center bg-white" placeholder="%" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>가감요인 MD</span>
                            <input type="text" className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs text-center bg-white" placeholder="M/D" />
                          </div>
                          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span>품질리스크:</span>
                              <input type="text" className="w-20 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>환경복잡성:</span>
                              <input type="text" className="w-20 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> 시스템 통합</label>
                              <input type="text" className="w-12 border border-slate-300 rounded px-1 py-0.5 text-xs text-center bg-white" placeholder="%" />
                            </div>
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-1.5 border-r border-slate-300">
                          <div className="font-semibold mb-1">
                            환경경영시스템 인증범위 리스크: &nbsp;
                            <label className="mr-2 cursor-pointer"><input type="checkbox" /> H</label>
                            <label className="mr-2 cursor-pointer"><input type="checkbox" /> M</label>
                            <label className="cursor-pointer"><input type="checkbox" /> L</label>
                          </div>
                          <div className="text-[11px] space-y-1">
                            <div className="flex items-center gap-2">
                              <span>1) 법적허가: 대기(</span>
                              <input type="text" className="w-8 border border-slate-300 rounded px-1 py-0.2 text-center text-xs bg-white" />
                              <span>)종, 수질(</span>
                              <input type="text" className="w-8 border border-slate-300 rounded px-1 py-0.2 text-center text-xs bg-white" />
                              <span>)종</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>2) 연간 폐기물 발생량:</span>
                              <input type="text" className="w-16 border border-slate-300 rounded px-1 py-0.2 text-center text-xs bg-white" />
                              <span>톤</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span>3) 위치:</span>
                              <label className="cursor-pointer"><input type="checkbox" /> 도시</label>
                              <label className="cursor-pointer"><input type="checkbox" /> 농촌</label>
                              <label className="cursor-pointer"><input type="checkbox" /> 공업단지</label>
                              <label className="cursor-pointer"><input type="checkbox" /> 기타</label>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <span>통합 시스템 평가: 1) 통합시스템 수준 및 수행능력 (%) :</span>
                              <input type="text" className="w-12 border border-slate-300 rounded px-1 py-0.2 text-center text-xs bg-white" />
                              <span>%</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-mono">
                          <div className="flex items-center justify-center gap-1">
                            <span>기타: (</span>
                            <input type="text" className="w-16 border-b border-slate-300 px-1 py-0 text-xs bg-transparent" />
                            <span>)</span>
                          </div>
                        </td>
                        <td className="p-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 font-medium">
                            <span>결정 M/D :</span>
                            <input type="text" placeholder="0.00 M/D" className="w-20 border border-slate-300 rounded px-1 py-0.5 text-xs text-center font-mono bg-white" />
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-medium">
                          심사일수 결정
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-mono">MD Table</td>
                        <td className="p-1 text-center">
                          <input type="text" placeholder="M/D 입력" className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs text-center font-mono bg-white" />
                        </td>
                      </tr>

                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-medium">
                          심사비 적절성 (필요한 심사일수 확보 여부)
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-mono">MD Table</td>
                        <td className="p-1 text-center">
                          <select className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                            <option value="">- 선택 -</option>
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                            <option value="해당없음">해당없음</option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-medium">
                          심사원 선정 (인증수행범위 및 세부인증수행범위 해당여부)
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-mono">심사자원</td>
                        <td className="p-1 text-center">
                          <select className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                            <option value="">- 선택 -</option>
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                            <option value="해당없음">해당없음</option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-medium">
                          인증범위의 적절성(신청범위에 대한 심사 가능) EMS의 경우 조직의 활동이 제외되는지 여부
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-mono">계약검토 절차</td>
                        <td className="p-1 text-center">
                          <select className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                            <option value="">- 선택 -</option>
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                            <option value="해당없음">해당없음</option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-medium">
                          전환심사의 경우-기 인증유효성확인(ICIN)
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-mono">심사절차</td>
                        <td className="p-1 text-center">
                          <select className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                            <option value="">- 선택 -</option>
                            <option value="적합">적합</option>
                            <option value="부적합">부적합</option>
                            <option value="해당없음">해당없음</option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-1.5 border-r border-slate-300 text-[11px] leading-relaxed">
                          <div>1.인증신청 조직이 조직의 일부 수행 활동만을 신청했을 경우 인증범위는 일부활동과 일치 하는가(해당 사항인경우 계약검토 결과 심사반장 제공)</div>
                          <div className="mt-1">2.복수사업장 여부(영업소 및/또는 A/S점) 및 복수사업장 심사 제외 시 제외되는 사유 기록</div>
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-mono align-middle">
                          계약검토 절차
                        </td>
                        <td className="p-1 text-center align-middle">
                          <select className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white mb-1">
                            <option value="">- 선택 -</option>
                            <option value="일치함 (단일 사업장)">일치함 (단일 사업장)</option>
                            <option value="일치함 (복수 사업장)">일치함 (복수 사업장)</option>
                            <option value="해당없음">해당없음</option>
                          </select>
                          <input type="text" placeholder="제외 사유 등 기록" className="w-full border border-slate-300 rounded px-1 py-0.5 text-[11px] bg-white" />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 5. 계약검토자 승인 / 날인란 */}
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <tbody>
                      <tr>
                        <th className="w-28 bg-slate-100 p-2 border-r border-slate-300 font-medium text-center">계약검토자 승인</th>
                        <th className="w-20 bg-slate-50 p-2 border-r border-slate-300 font-medium text-center">검토일자</th>
                        <td className="p-2 border-r border-slate-300 font-mono">
                          <input type="text" placeholder="YYYY-MM-DD" className="w-28 border border-slate-300 rounded px-1.5 py-0.5 text-xs text-center font-mono bg-white" />
                        </td>
                        <th className="w-20 bg-slate-50 p-2 border-r border-slate-300 font-medium text-center">검토자</th>
                        <td className="p-2 font-medium">
                          <div className="flex items-center justify-between gap-2">
                            <select className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-white">
                              <option value="">- 검토자 -</option>
                              {auditors.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                            </select>
                            <span className="text-slate-500 text-[11px]">(서명/인)</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* ================================================================= */}
              {/* 2. 공평성관리 평가서 (F14) - ERP MenuD/D003_Add.do 1:1 완벽 서식 */}
              {/* ================================================================= */}
              {activeDocTab === 'impartiality' && (
                <div className="space-y-3 text-xs leading-relaxed text-slate-900 font-sans">
                  {/* 상단 타이틀 바 */}
                  <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 tracking-tight">공평성관리 평가서</h2>
                      <span className="font-mono text-[10px] text-slate-500">gms.z99.kr/Admin/MenuD/D003_Add.do</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-600 font-medium">관리번호:</span>
                        <input type="text" placeholder="관리번호 입력" className="border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono w-36 bg-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-600 font-medium">확인일자:</span>
                        <input type="text" placeholder="YYYY-MM-DD" className="border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono w-28 text-center bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* 심사구분 라디오/체크박스 헤더 */}
                  <div className="flex items-center gap-6 border border-slate-300 bg-slate-50 p-2 rounded text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-400 text-blue-600" />
                      <span>최초</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-400 text-blue-600" />
                      <span>전환</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-400 text-blue-600" />
                      <span>갱신</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input type="checkbox" className="rounded border-slate-400 text-blue-600" />
                      <span>사후 (</span>
                      <input 
                        type="text" 
                        placeholder="" 
                        className="w-8 text-center border border-slate-300 bg-white rounded px-1 py-0.5 text-xs" 
                      />
                      <span>)차</span>
                    </div>
                  </div>

                  {/* 결재란 */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-100 px-3 py-1 font-bold text-xs border-b border-slate-300">결재</div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 text-center divide-x divide-y sm:divide-y-0 divide-slate-300 text-xs">
                      <div className="bg-slate-50 p-1.5 font-semibold">작성</div>
                      <div className="p-1 flex items-center justify-center">
                        <select className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                          <option value="">- 작성자 -</option>
                          {auditors.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                        </select>
                      </div>
                      <div className="bg-slate-50 p-1.5 font-semibold">모니터링</div>
                      <div className="p-1 flex items-center justify-center">
                        <select className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                          <option value="">- 모니터링 -</option>
                          {auditors.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                        </select>
                      </div>
                      <div className="bg-slate-50 p-1.5 font-semibold">승인</div>
                      <div className="p-1 flex items-center justify-center">
                        <select className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                          <option value="">- 승인자 -</option>
                          {auditors.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                        </select>
                      </div>
                      <div className="p-1 flex items-center justify-center col-span-4 sm:col-span-1">
                        <input 
                          type="text" 
                          placeholder="YYYY-MM-DD" 
                          className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs text-center font-mono bg-white" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* 메인 평가 테이블 */}
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead className="bg-slate-100 font-bold text-slate-800 text-center">
                      <tr>
                        <th className="border border-slate-300 p-1.5 w-24">단계</th>
                        <th className="border border-slate-300 p-1.5">공평성 평가 사항</th>
                        <th className="border border-slate-300 p-1.5 w-44">공평성 평가</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 기초 평가 [심사 전단계] */}
                      <tr>
                        <td rowSpan={13} className="border border-slate-300 p-2 text-center font-semibold align-top bg-slate-50/50">
                          <div className="font-bold text-slate-900 mb-2">기초 평가<br />[심사 전단계]</div>
                          <div className="text-[10.5px] text-slate-500 text-left leading-relaxed">
                            · 설문서<br />
                            · 검토 및 제안서<br />
                            · 심사팀 관리 기록<br />
                            · 기타 정보
                          </div>
                        </td>
                        <td className="border border-slate-300 p-1.5 leading-relaxed">
                          1. 인증 유치로 지도요원, 지도기관 또는 심사원등이 커미션 요구로 공평성 위협 유무(설문서/정보)
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <label className="flex items-center gap-0.5 cursor-pointer">
                              <input type="radio" name="cm_base_1" value="no" className="text-blue-600" />
                              <span>예(해당없음)</span>
                            </label>
                            <label className="flex items-center gap-0.5 cursor-pointer">
                              <input type="radio" name="cm_base_1" value="yes" className="text-blue-600" />
                              <span>커미션요구</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5 leading-relaxed">
                          2. 인증 조직 출신 심사원, 지도심사원 또는 친분관계 지정 심사원 배정요구 유무 [ 심사팀부 또는 설문서]
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <label className="flex items-center gap-0.5 cursor-pointer">
                              <input type="radio" name="cm_base_2" value="no" className="text-blue-600" />
                              <span>예(요구없음)</span>
                            </label>
                            <label className="flex items-center gap-0.5 cursor-pointer">
                              <input type="radio" name="cm_base_2" value="yes" className="text-blue-600" />
                              <span>지정요구</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5 leading-relaxed">
                          3. 외부 이해관계자 또는 컨설팅 기관에 따라 지정금액으로 심사 요청 유무( 설문서 / 정보)
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <label className="flex items-center gap-0.5 cursor-pointer">
                              <input type="radio" name="cm_base_3" value="no" className="text-blue-600" />
                              <span>예(해당없음)</span>
                            </label>
                            <label className="flex items-center gap-0.5 cursor-pointer">
                              <input type="radio" name="cm_base_3" value="yes" className="text-blue-600" />
                              <span>관련있음</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5 leading-relaxed">
                          4. 인증 고객(지도기관포함)이 인증 프로세스 외 사항 요구로 인하여 프로세스 미 준수로 공평성 위협 유무
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <label className="flex items-center gap-0.5 cursor-pointer">
                              <input type="radio" name="cm_base_4" value="no" className="text-blue-600" />
                              <span>예(해당없음)</span>
                            </label>
                            <label className="flex items-center gap-0.5 cursor-pointer">
                              <input type="radio" name="cm_base_4" value="yes" className="text-blue-600" />
                              <span>관련있음</span>
                            </label>
                          </div>
                        </td>
                      </tr>

                      {/* 기초평가 구분 안내문 */}
                      <tr className="bg-slate-50">
                        <td colSpan={2} className="border border-slate-300 p-1 text-[11px] font-semibold text-slate-600">
                          * 기초평가 1 ~ 4항의 근거에 따라 평가함
                        </td>
                      </tr>

                      <tr>
                        <td className="border border-slate-300 p-1.5">5. 지도기관, 지도위원 또는 심사원등에 대한 자체 검토유무</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_5" value="적격" className="text-blue-600" /> 적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_5" value="부적격" className="text-blue-600" /> 부적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_5" value="해당없음" className="text-blue-600" /> 해당없음</label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">6. 인증 유치와 관련 이해관계자 사익추구 위험 유무</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_6" value="적격" className="text-blue-600" /> 적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_6" value="부적격" className="text-blue-600" /> 부적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_6" value="해당없음" className="text-blue-600" /> 해당없음</label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">7. 인증 조직과 배정 예정 심사원에 대한 자체, 친분 위험 유무</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_7" value="적격" className="text-blue-600" /> 적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_7" value="부적격" className="text-blue-600" /> 부적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_7" value="해당없음" className="text-blue-600" /> 해당없음</label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">8. 최소 비용, 최소기간 인증 결정에 대한 침해, 지시 위험 유무</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_8" value="적격" className="text-blue-600" /> 적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_8" value="부적격" className="text-blue-600" /> 부적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_8" value="해당없음" className="text-blue-600" /> 해당없음</label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">9. 인증 조직 출신 심사원 또는 기관지정 심사원에 대한 위험 유무</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_9" value="적격" className="text-blue-600" /> 적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_9" value="부적격" className="text-blue-600" /> 부적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_9" value="해당없음" className="text-blue-600" /> 해당없음</label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">10. 인증 결정(형식적)에 대한 지시, 침범 등 공평성 위협</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_10" value="적격" className="text-blue-600" /> 적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_10" value="부적격" className="text-blue-600" /> 부적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_10" value="해당없음" className="text-blue-600" /> 해당없음</label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">11. 기타 자문 금지 또는 인증 제공 금지 대상과 관련되는 공평성 위협 유무 (4, 5항 사항)</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_11" value="적격" className="text-blue-600" /> 적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_11" value="부적격" className="text-blue-600" /> 부적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_base_11" value="해당없음" className="text-blue-600" /> 해당없음</label>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="border border-slate-300 p-1.5 font-bold text-center">소계</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono">
                          적 <input type="text" placeholder="" className="w-8 text-center border border-slate-300 rounded px-1 py-0.5 mx-1 bg-white" />
                          부 <input type="text" placeholder="" className="w-8 text-center border border-slate-300 rounded px-1 py-0.5 mx-1 bg-white" />
                          없음 <input type="text" placeholder="" className="w-8 text-center border border-slate-300 rounded px-1 py-0.5 mx-1 bg-white" />
                        </td>
                      </tr>

                      {/* 예측평가 [심사단계] */}
                      <tr>
                        <td rowSpan={7} className="border border-slate-300 p-2 text-center font-bold align-middle bg-slate-50/50">
                          예측평가<br />[심사단계]
                        </td>
                        <td className="border border-slate-300 p-1.5">1. 인증 고객 과도한 친분관계로 편의, 일정단축 등 위험 가능성</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input type="checkbox" className="rounded border-slate-400" />
                            <span>발생가능성</span>
                            <select className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                              <option value="">-</option>
                              <option value="N">N</option>
                              <option value="L">L</option>
                              <option value="M">M</option>
                              <option value="H">H</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">2. 동일(3년 이상) 심사원 배정으로 사익추구, 친분 위험가능성</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input type="checkbox" className="rounded border-slate-400" />
                            <span>발생가능성</span>
                            <select className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                              <option value="">-</option>
                              <option value="N">N</option>
                              <option value="L">L</option>
                              <option value="M">M</option>
                              <option value="H">H</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">3. 친분관계로 심사 수임 및 수행 지시 위험 가능성</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input type="checkbox" className="rounded border-slate-400" />
                            <span>발생가능성</span>
                            <select className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                              <option value="">-</option>
                              <option value="N">N</option>
                              <option value="L">L</option>
                              <option value="M">M</option>
                              <option value="H">H</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">4. 심사와 관련 재정적 사익 추구 위험 가능성</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input type="checkbox" className="rounded border-slate-400" />
                            <span>발생가능성</span>
                            <select className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                              <option value="">-</option>
                              <option value="N">N</option>
                              <option value="L">L</option>
                              <option value="M">M</option>
                              <option value="H">H</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">5. 기타 심사 단계에서 자문, 윤리준수 및 공평성 보장 위협 가능성</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input type="checkbox" className="rounded border-slate-400" />
                            <span>발생가능성</span>
                            <select className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                              <option value="">-</option>
                              <option value="N">N</option>
                              <option value="L">L</option>
                              <option value="M">M</option>
                              <option value="H">H</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="border border-slate-300 p-1.5 font-bold text-center">소계</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          L(1)소계: <input type="text" placeholder="" className="w-8 text-center border border-slate-300 rounded px-1 py-0.5 mx-1 bg-white" /> 개
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="border border-slate-300 p-1.5 font-bold text-center">소계 [적격/부적격]</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_pred_stage_total" value="적격" className="text-blue-600" /> 적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_pred_stage_total" value="부적격" className="text-blue-600" /> 부적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_pred_stage_total" value="해당없음" className="text-blue-600" /> 해당없음</label>
                          </div>
                        </td>
                      </tr>

                      {/* 예측평가 [심사후단계] */}
                      <tr>
                        <td rowSpan={7} className="border border-slate-300 p-2 text-center font-bold align-middle bg-slate-50/50">
                          예측평가<br />[심사후단계]
                        </td>
                        <td className="border border-slate-300 p-1.5">1. 친분관계로 심사 증거 추적성 또는 부적합 객관성 미흡등으로 공평성 위협(친분, 자체, 사익추구) 발생가능성</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input type="checkbox" className="rounded border-slate-400" />
                            <span>발생가능성</span>
                            <select className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                              <option value="">-</option>
                              <option value="N">N</option>
                              <option value="L">L</option>
                              <option value="M">M</option>
                              <option value="H">H</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">2. 고의적, 위협적, 또는 낭비 부적합 발행 등으로 공평성 위협 발생 가능성</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input type="checkbox" className="rounded border-slate-400" />
                            <span>발생가능성</span>
                            <select className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                              <option value="">-</option>
                              <option value="N">N</option>
                              <option value="L">L</option>
                              <option value="M">M</option>
                              <option value="H">H</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">3. 친분 관계 등으로 심사 객관성 미흡으로 인증결정에 대한 공평성 위협 발생 가능성</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input type="checkbox" className="rounded border-slate-400" />
                            <span>발생가능성</span>
                            <select className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                              <option value="">-</option>
                              <option value="N">N</option>
                              <option value="L">L</option>
                              <option value="M">M</option>
                              <option value="H">H</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">4. 기관 이해 관계자 또는 기관 지시 관련 공평성 위협 발생 가능성</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input type="checkbox" className="rounded border-slate-400" />
                            <span>발생가능성</span>
                            <select className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                              <option value="">-</option>
                              <option value="N">N</option>
                              <option value="L">L</option>
                              <option value="M">M</option>
                              <option value="H">H</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1.5">5. 심사 후 단계에서 인증 결정에 대한 권리, 용이 등으로 인해 공평성 위협 발생 가능성 유무</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input type="checkbox" className="rounded border-slate-400" />
                            <span>발생가능성</span>
                            <select className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                              <option value="">-</option>
                              <option value="N">N</option>
                              <option value="L">L</option>
                              <option value="M">M</option>
                              <option value="H">H</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="border border-slate-300 p-1.5 font-bold text-center">소계</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          L(1)소계: <input type="text" placeholder="" className="w-8 text-center border border-slate-300 rounded px-1 py-0.5 mx-1 bg-white" /> 개
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="border border-slate-300 p-1.5 font-bold text-center">소계 [적격/부적격]</td>
                        <td className="border border-slate-300 p-1.5 text-center">
                          <div className="flex items-center justify-center gap-2 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_post_stage_total" value="적격" className="text-blue-600" /> 적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_post_stage_total" value="부적격" className="text-blue-600" /> 부적격</label>
                            <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cm_post_stage_total" value="해당없음" className="text-blue-600" /> 해당없음</label>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 평가 기준 안내 박스 */}
                  <div className="border border-slate-300 p-2.5 bg-slate-50/50 rounded text-xs space-y-1 leading-relaxed text-slate-700">
                    <div className="font-bold text-slate-900 mb-0.5">평가 기준</div>
                    <div>- 전 항목 개별 평가</div>
                    <div>- 기초평가: 1.부적격: 인증거부</div>
                    <div>- 심사단계 및 후 단계: H(5), M(3), L(1), N(0) 등급으로 개별 등급 M 인증 중지, H: 인증 거부</div>
                    <div className="pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-900 mr-4">소계</span>
                      <span className="mr-6">적격: L(1)등급 1개 이하</span>
                      <span>부적격: L(1)등급 2 ~ 3개: 인증 중지, L(1)등급 4개 이상: 인증 거부</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 3. 인증심의결과보고서 (F18) - ERP MenuD/D002_Add.do 1:1 완벽 서식 */}
              {/* ================================================================= */}
              {activeDocTab === 'deliberation' && (
                <div className="space-y-3 text-xs leading-relaxed text-slate-900 font-sans">
                  {/* 상단 타이틀 바 */}
                  <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 tracking-tight">인증심의결과보고서</h2>
                      <span className="font-mono text-[10px] text-slate-500">gms.z99.kr/Admin/MenuD/D002_Add.do</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-600 font-medium">관리번호:</span>
                        <input type="text" placeholder="관리번호 입력" className="border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono w-36 bg-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-600 font-medium">심의일자:</span>
                        <input type="text" placeholder="YYYY-MM-DD" className="border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono w-28 text-center bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* 1. 기본정보 */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-xs">1. 기본정보</h3>
                    <table className="w-full border-collapse border border-slate-300 text-xs">
                      <tbody>
                        <tr>
                          <th className="border border-slate-300 bg-slate-50 p-1.5 font-semibold w-24 text-center">고 객 명</th>
                          <td className="border border-slate-300 p-1.5 font-medium text-slate-900">{activeCompany.companyName}</td>
                          <th className="border border-slate-300 bg-slate-50 p-1.5 font-semibold w-24 text-center">인증번호</th>
                          <td className="p-1.5 font-mono">
                            <input 
                              type="text" 
                              defaultValue={(activeCompany as any).certNo || ''} 
                              placeholder="인증번호 입력" 
                              className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono bg-white" 
                            />
                          </td>
                        </tr>
                        <tr>
                          <th className="border border-slate-300 bg-slate-50 p-1.5 font-semibold text-center">인 증 범 위</th>
                          <td className="border border-slate-300 p-1.5 text-slate-800">
                            <input 
                              type="text" 
                              defaultValue={activeCompany.scope || ''} 
                              placeholder="인증범위 입력" 
                              className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs bg-white" 
                            />
                          </td>
                          <th className="border border-slate-300 bg-slate-50 p-1.5 font-semibold text-center">인증코드</th>
                          <td className="p-1.5 font-mono">
                            <input 
                              type="text" 
                              defaultValue={activeCompany.iafCode || ''} 
                              placeholder="인증코드" 
                              className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono bg-white" 
                            />
                          </td>
                        </tr>
                        <tr>
                          <th className="border border-slate-300 bg-slate-50 p-1.5 font-semibold text-center">인 증 표 준</th>
                          <td colSpan={3} className="border border-slate-300 p-1.5">
                            <div className="flex items-center flex-wrap gap-4 text-xs">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-400 text-blue-600" />
                                <span>ISO 9001:2015</span>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-400 text-blue-600" />
                                <span>ISO 14001:2015</span>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-400 text-blue-600" />
                                <span>ISO 45001:2018</span>
                              </label>
                              <div className="flex items-center gap-1">
                                <input type="checkbox" className="rounded border-slate-400 text-blue-600" />
                                <span>기타</span>
                                <select className="border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                                  <option value="">- 선택 -</option>
                                  <option value="Q/E">Q/E</option>
                                  <option value="Q">Q</option>
                                  <option value="E">E</option>
                                  <option value="OH&S">OH&S</option>
                                </select>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th className="border border-slate-300 bg-slate-50 p-1.5 font-semibold text-center">심 사 팀</th>
                          <td colSpan={3} className="border border-slate-300 p-0">
                            <div className="grid grid-cols-4 divide-x divide-slate-300 text-center">
                              <div className="bg-slate-50 p-1.5 font-semibold">심사팀장</div>
                              <div className="p-1">
                                <select className="w-full border border-slate-200 rounded px-1 py-0.5 text-xs bg-white">
                                  <option value="">- 심사팀장 선택 -</option>
                                  {auditors.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                                </select>
                              </div>
                              <div className="bg-slate-50 p-1.5 font-semibold">심사팀원</div>
                              <div className="p-1">
                                <select className="w-full border border-slate-200 rounded px-1 py-0.5 text-xs bg-white">
                                  <option value="">- 심사팀원 선택 -</option>
                                  {auditors.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                                </select>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 2. 인증심의 */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-xs">2. 인증심의</h3>
                    <table className="w-full border-collapse border border-slate-300 text-xs">
                      <thead className="bg-slate-100 font-bold text-slate-800 text-center">
                        <tr>
                          <th rowSpan={2} className="border border-slate-300 p-1.5 w-28">심의항목</th>
                          <th rowSpan={2} className="border border-slate-300 p-1.5">심의 기준</th>
                          <th colSpan={2} className="border border-slate-300 p-1">심의 결과</th>
                        </tr>
                        <tr>
                          <th className="border border-slate-300 p-1 w-28">확인</th>
                          <th className="border border-slate-300 p-1 w-36">심의내역</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 1. 심사팀 구성의 적합성 및 공평성 */}
                        <tr>
                          <td rowSpan={3} className="border border-slate-300 p-1.5 font-bold text-center align-middle bg-slate-50/50">
                            심사팀 구성의<br />적합성 및 공평성
                          </td>
                          <td className="border border-slate-300 p-1.5">1. 심사일수 및 비용산정이 절차에 맞는가?(계약검토서 확인)</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_1" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_1" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_1" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" placeholder="" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs text-center bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">2. 심사팀 구성 및 심사 준비에 대한 원칙이 준수되었는가?(인증범위와 심사원 코드)</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_2" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_2" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_2" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">3. 심사업체와의 이해상충 및 공평성 위협요소는 없는가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_3" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_3" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_3" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>

                        {/* 2. 심사 수행의 적합성 */}
                        <tr>
                          <td rowSpan={5} className="border border-slate-300 p-1.5 font-bold text-center align-middle bg-slate-50/50">
                            심사 수행의 적합성
                          </td>
                          <td className="border border-slate-300 p-1.5">4. 심사계획은 최소 1주일 이전에 통보하였는가?(늦어도 3일전)</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_4" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_4" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_4" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">5. 심사팀의 구성은 적합한가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_5" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_5" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_5" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">6. 내부심사 및 경영 검토는 실시하였는가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_6" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_6" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_6" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">7. 심사시간은 준수하였는가?(현장 이동시간 포함)</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_7" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_7" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_7" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">8. 사후 심사는 전 심사의 12개월내에 실시 되었는가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_8" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_8" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_8" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" placeholder="YYYY-MM-DD" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs text-center font-mono bg-white" />
                          </td>
                        </tr>

                        {/* 3. 인증범위의 명확성 */}
                        <tr>
                          <td rowSpan={3} className="border border-slate-300 p-1.5 font-bold text-center align-middle bg-slate-50/50">
                            인증범위의<br />명확성
                          </td>
                          <td className="border border-slate-300 p-1.5">9. 인증수행범위는 적합한가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_9" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_9" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_9" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">10. 복합코드의 경우 코드가 전부 적용 되었는가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_10" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_10" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_10" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" defaultValue={activeCompany.iafCode || ''} placeholder="코드" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs text-center font-mono bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">11. 복수사업장의 경우 대상 사업장을 명확히 기술하였는가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_11" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_11" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_11" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>

                        {/* 4. 부적합 사항의 적합성 */}
                        <tr>
                          <td rowSpan={2} className="border border-slate-300 p-1.5 font-bold text-center align-middle bg-slate-50/50">
                            부적합 사항의<br />적합성
                          </td>
                          <td className="border border-slate-300 p-1.5">12. 부적합 사항이 적합하게 발행되었는가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_12" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_12" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_12" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" placeholder="" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs text-center bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">13. 부적합 내용과 표준 적용 항목번호는 적합한가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_13" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_13" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_13" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>

                        {/* 5. 시정조치의 효과성 */}
                        <tr>
                          <td rowSpan={2} className="border border-slate-300 p-1.5 font-bold text-center align-middle bg-slate-50/50">
                            시정조치의<br />효과성
                          </td>
                          <td className="border border-slate-300 p-1.5">14. 부적합 사항에 대한 시정조치가 효과적인가?(이전심사 포함)</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_14" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_14" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_14" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">15. 재발방지 대책은 적합한가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_15" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_15" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_15" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>

                        {/* 6. 기록관리 */}
                        <tr>
                          <td rowSpan={3} className="border border-slate-300 p-1.5 font-bold text-center align-middle bg-slate-50/50">
                            기록관리
                          </td>
                          <td className="border border-slate-300 p-1.5">16. 보고서에 오기 및 누락된 부분은 없는가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_16" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_16" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_16" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">17. 심사보고서는 기록관리 순서로 Filing 되었는가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_17" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_17" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_17" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5">18. 양식은 최신 본 인가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_18" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_18" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_18" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>

                        {/* 7. 고객 피드백 */}
                        <tr>
                          <td className="border border-slate-300 p-1.5 font-bold text-center align-middle bg-slate-50/50">
                            고객 피드백
                          </td>
                          <td className="border border-slate-300 p-1.5">19. 심사와 관련 고객 불만은 없었는가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_19" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_19" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_19" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>

                        {/* 8. 변경사항 */}
                        <tr>
                          <td className="border border-slate-300 p-1.5 font-bold text-center align-middle bg-slate-50/50">
                            변경사항
                          </td>
                          <td className="border border-slate-300 p-1.5">20. 사후 심사 시 변경 사항은 없는가?</td>
                          <td className="border border-slate-300 p-1 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_20" value="Y" className="text-blue-600" /> Y</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_20" value="N" className="text-blue-600" /> N</label>
                              <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_cm_20" value="NA" className="text-blue-600" /> NA</label>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1 text-center">
                            <input type="text" className="w-full border border-slate-300 rounded px-1 py-0.5 text-xs bg-white" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 인증심의 결과 결재 표 */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <table className="w-full border-collapse text-xs">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <th className="bg-slate-50 p-2 font-bold w-28 text-center border-r border-slate-300">인증심의 결과</th>
                          <td className="p-2">
                            <div className="flex items-center gap-6 text-xs font-semibold">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="deli_final_decision" value="승인" className="text-blue-600" />
                                <span>승인</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="deli_final_decision" value="보류" className="text-blue-600" />
                                <span>보류</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="deli_final_decision" value="재승인" className="text-blue-600" />
                                <span>재승인</span>
                              </label>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <th className="bg-slate-50 p-2 font-bold text-center border-r border-slate-300">인증심의 일자</th>
                          <td className="p-2">
                            <div className="grid grid-cols-3 gap-3">
                              <input type="text" placeholder="YYYY-MM-DD" className="border border-slate-300 rounded px-2 py-0.5 text-xs text-center font-mono bg-white" />
                              <input type="text" placeholder="YYYY-MM-DD" className="border border-slate-300 rounded px-2 py-0.5 text-xs text-center font-mono bg-white" />
                              <input type="text" placeholder="YYYY-MM-DD" className="border border-slate-300 rounded px-2 py-0.5 text-xs text-center font-mono bg-white" />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-slate-50 p-2 font-bold text-center border-r border-slate-300">인증위원 확인</th>
                          <td className="p-2">
                            <div className="grid grid-cols-3 gap-3">
                              <input type="text" placeholder="(서명)" className="border border-slate-300 rounded px-2 py-0.5 text-xs text-center bg-white" />
                              <input type="text" placeholder="(서명)" className="border border-slate-300 rounded px-2 py-0.5 text-xs text-center bg-white" />
                              <input type="text" placeholder="(서명)" className="border border-slate-300 rounded px-2 py-0.5 text-xs text-center bg-white" />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 3. 표준계약서 (F16-004) 종이 서식 */}
              {/* ================================================================= */}
              {activeDocTab === 'contract' && (
                <div className="space-y-5 text-xs leading-relaxed text-slate-900">
                  {/* 상단 서식 번호 및 타이틀 */}
                  <div className="border-b-2 border-slate-900 pb-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[11px] text-slate-500 block">F16-004 (2024.02.29)</span>
                      <h2 className="text-xl font-black text-slate-950 tracking-tight mt-0.5">인증심사 표준계약서</h2>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-cyan-900 block">계약번호: {currentContractRecord.contractNumber}</span>
                      <span className="text-[11px] text-slate-500">계약일자: {currentContractRecord.contractDate}</span>
                    </div>
                  </div>

                  {/* F16-004 공식 계약 당사자 표 */}
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">고객명</th>
                        <td className="p-2 border-r border-slate-400 font-bold text-slate-950">{activeCompany.companyName}</td>
                        <th className="w-20 bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">인증원</th>
                        <td className="p-2 font-bold text-slate-950">지엠에스씨에스(주)</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">주 &nbsp;소</th>
                        <td className="p-2 border-r border-slate-400 text-[11px]">{activeCompany.address}</td>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">주 &nbsp;소</th>
                        <td className="p-2 text-[11px]">서울특별시 강서구 강서로 406, 905호</td>
                      </tr>
                      <tr className="border-b border-slate-400">
                        <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">대표자</th>
                        <td className="p-2 border-r border-slate-400 font-semibold">{activeCompany.ceoName} &nbsp;&nbsp;(서명/인)</td>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">대표이사</th>
                        <td className="p-2 font-semibold">________________________ &nbsp;&nbsp;(직인/서명)</td>
                      </tr>
                      <tr className="border-b border-slate-400 text-center text-[11px] text-slate-600 bg-slate-50 font-medium">
                        <td className="p-1.5 border-r border-slate-400" colSpan={2}>이하 의뢰인이라 한다</td>
                        <td className="p-1.5" colSpan={2}>이하 인증원이라 한다.</td>
                      </tr>
                      <tr className="bg-slate-50 text-[11px]">
                        <th className="p-1.5 border-r border-slate-400 text-center font-bold">계약일자</th>
                        <td className="p-1.5 font-bold text-slate-900" colSpan={3}>
                          {currentContractRecord.contractDate}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* F16-004 전문 조항 25개 조항 */}
                  <div className="space-y-3.5 text-[11px] text-slate-800 text-justify leading-relaxed border-t border-slate-200 pt-2">
                    
                    {/* 제1조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제1조 (계약의 목적)</h4>
                      <p>
                        의뢰인이 인증원에게 의뢰한 인증심사 서비스를 제공하는데 있어 필요한 제반 권리 및 의무사항을 정하여 준수하기 위함이다.
                      </p>
                    </div>

                    {/* 제2조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제2조 (인증 서비스 범위)</h4>
                      <p className="mb-1.5">1. 경영시스템 인증심사에 대한 계약 범위는 다음과 같다.</p>
                      
                      {/* 공식 규격 선택 체크박스 */}
                      <div className="bg-slate-50 border border-slate-300 rounded p-2.5 my-1.5 flex flex-wrap items-center gap-x-6 gap-y-1.5 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[10px] font-bold ${activeStandards.some(s => s.includes('9001')) ? 'bg-cyan-700 text-white border-cyan-800' : 'border-slate-400 bg-white'}`}>
                            {activeStandards.some(s => s.includes('9001')) ? '✓' : ''}
                          </span>
                          <span>ISO 9001</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[10px] font-bold ${activeStandards.some(s => s.includes('14001')) ? 'bg-cyan-700 text-white border-cyan-800' : 'border-slate-400 bg-white'}`}>
                            {activeStandards.some(s => s.includes('14001')) ? '✓' : ''}
                          </span>
                          <span>ISO 14001</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[10px] font-bold ${activeStandards.some(s => s.includes('45001')) ? 'bg-cyan-700 text-white border-cyan-800' : 'border-slate-400 bg-white'}`}>
                            {activeStandards.some(s => s.includes('45001')) ? '✓' : ''}
                          </span>
                          <span>ISO 45001</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[10px] font-bold ${activeStandards.some(s => s.includes('ESG')) ? 'bg-cyan-700 text-white border-cyan-800' : 'border-slate-400 bg-white'}`}>
                            {activeStandards.some(s => s.includes('ESG')) ? '✓' : ''}
                          </span>
                          <span>ESG-MS</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-3.5 h-3.5 border border-slate-400 rounded bg-white flex items-center justify-center text-[10px]"></span>
                          <span>etc. ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</span>
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 pl-1 mb-1">※ ESG-MS 인증은 시범 운영기간에만 유효함.</p>
                      <p>
                        2. 인증심사는 의뢰인의 사업장 및 해당현장에서 수행하는 제품, 활동, 서비스에 대하여 진행되며, 인증범위는 실질적으로 심사가 이루어진 활동만을 대상으로 하므로 변경될 수 있다.
                      </p>
                    </div>

                    {/* 제3조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제3조 (인증심사의 방법)</h4>
                      <p>1. 심사는 심사표준 요구사항 및 의뢰인의 경영시스템을 기준으로 심사한다.</p>
                      <p>
                        2. 1단계 심사는 2단계 심사를 실시하기 전에 의뢰인의 경영시스템 관련 문서 (매뉴얼, 절차서, 지침서, 내부심사결과보고서, 경영검토자료, 환경/안전 측면 또는 중단적 사고 리스크 식별/평가 자료 등) 및 기록에 대한 심사로서 심사업무의 범위는 의뢰인의 조직, 방침, 업무절차 등 경영시스템 구축 상황을 조사 및 평가하고 이것이 인증범위와 관련된 모든 요구사항을 만족시키고 있는지 여부를 확인하는 것이다.
                      </p>
                      <p>
                        3. 2단계 심사는 의뢰인의 업무 활동이 문서화된 시스템에 따라 수행되고 있는지 평가하는 것이며, 필요시 1단계 심사의 내용이 반복될 수 있다. 심사결과 부적합 사항이 발생되었을 경우 인증원은 시정조치요구서(부적합 보고서)를 발행한다.
                      </p>
                      <p>
                        4. 인증심사 결과 부적합 사항이 발생한 경우, 문서 또는 현장확인심사를 수행한 후 인증심의를 거쳐 인증등록 여부를 결정한다.
                      </p>
                      <p>
                        5. 기타 인증등록 유지를 위한 준수사항은 인증서 발행 시 인증원은 이를 문서로 작성하여 의뢰인에게 제공한다.
                      </p>
                    </div>

                    {/* 제4조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제4조 (인증범위 확인)</h4>
                      <p>
                        인증표준, 인증범위(품목), 사업장 주소 등은 사전협의를 통하여 조정함을 원칙으로 하고 기준이 불분명한 부분은 인증원의 기준에 의거 적용하며 심사 수행 시 심사원이 제공하는 2단계 심사 결과 보고서의 인증범위 또는 “인증범위확인서”를 최종안으로 한다.
                      </p>
                    </div>

                    {/* 제5조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제5조 (인증서 발급)</h4>
                      <p>
                        인증원은 의뢰인이 제출한 “부적합 시정조치 결과”를 인증시스템 절차에 따라 검토, 확인한 후 인증서를 발급하여야 하며 발행일은 시정조치 결과를 확인하고 인증등록을 위한 검증을 완료한 이후로 한다.
                      </p>
                    </div>

                    {/* 제6조 (IAF CertSearch & KCN 동의란) */}
                    <div className="bg-slate-50 border border-slate-300 rounded p-3 space-y-1.5">
                      <h4 className="font-bold text-slate-950 text-xs">제6조 (인증정보의 공개 여부)</h4>
                      <p>인증받은 조직은 인증정보의 대외 공개여부를 결정하여야 한다.</p>
                      <p className="pl-2">· 공개기관: <strong>IAF CertSearch</strong>, <strong>KCN</strong>(한국인정지원센터 스마트인정시스템)</p>
                      <p className="pl-2">· 공개정보: 조직명, 사업장 주소, 인증서번호, 인증표준, IAF코드, 인증범위, 인증상태 등</p>
                      
                      <div className="flex items-center gap-6 py-1 pl-2 font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded bg-cyan-700 text-white flex items-center justify-center text-[10px]">✓</span>
                          <span>동의함</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <span className="w-3.5 h-3.5 rounded border border-slate-400 bg-white inline-block"></span>
                          <span>미동의</span>
                        </span>
                        <span className="text-[10.5px] text-slate-500 font-normal">
                          미동의 사유: _________________________________________________
                        </span>
                      </div>

                      <div className="text-[10.5px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                        <p>- IAF CertSearch는 IAF(국제인정기구포럼)에서 구축한 데이터베이스로 전 세계 모든 국가에서 발행된 인증의 유효성을 확인할 수 있다.</p>
                        <p>동의하지 않는 경우, 조직명 및 인증서번호를 통한 검색이 가능하며 검색 시 인증기관이 해당 기업을 인증했다는 내용을 확인할 수 있으나 인증과 관련한 세부 정보는 공개되지 않는다.</p>
                        <p>- KCN내 인증정보공개는 의무사항으로 대외공개여부를 선택할 수 없다.</p>
                      </div>
                    </div>

                    {/* 제7조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제7조 (인증마크의 사용)</h4>
                      <p>
                        인증 취득에 따른 ‘인증마크 사용기준’과 ‘인증마크 오용 시 조치’는 인증절차안내서 내용에 의거하며 의뢰인은 그 내용을 성실히 이행하여야 한다.
                      </p>
                    </div>

                    {/* 제8조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제8조 (사후관리심사 실시)</h4>
                      <p>
                        1. 인증서 발행일을 기준으로 의뢰인은 인증원의 사후관리심사절차에 따라 최소 1년에 한 번 이상 사후관리 심사를 수검하여야 하고, 인증원의 사후관리심사절차가 개정될 경우 개정된 절차에 따른다. 부득이 사후 심사를 수검치 못할 경우 그 사유를 인증원에 통보한다.
                      </p>
                      <p>2. 사후관리심사는 매회 인증기준 M/D기준일수에 따라 실시한다.</p>
                    </div>

                    {/* 제9조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제9조 (인증의 변경사항 보고 및 변경 심사 실시)</h4>
                      <p>
                        의뢰인은 인증등록 기업의 의무사항을 성실히 수행하여야 하며 아래와 같은 사항이 발생하였을 경우 즉시 인증원에게 서면으로 통보해야 한다. 이때, 인증원은 확인 후 필요에 따라 변경심사를 실시할 수 있다.
                      </p>
                      <ul className="list-disc list-inside pl-2 space-y-0.5 text-[10.5px] text-slate-700 mt-1">
                        <li>상호 및 대표자변경 (사업자등록증, 정관 제출)</li>
                        <li>인증등록기간 중 중대한 조직변경, 현장증설, 현장이전 등의 사항이 발생되었을 때</li>
                        <li>고객이나 이해관계자의 심각한 불만이 접수된 경우</li>
                        <li>환경/안전사고/중단적 사고/중대한 리스크가 발생하였거나 관련 법규를 위반하였을 때</li>
                        <li>인증범위(표준, 인증대상품목)의 축소 또는 확대에 따른 변경사항 발생 시</li>
                      </ul>
                    </div>

                    {/* 제10조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제10조 (특별심사 실시)</h4>
                      <p>A. 인증원은 환경/안전보건 관련 중대한 사건이 발생한 사실을 인지한 경우 별도의 특별심사를 할 수 있다.</p>
                      <p>B. 중대한 사고나 법규 위반과 같이 관계당국의 관여를 필요로 하는 사건에 대해 의뢰인이 제공한 정보 또는 특별심사 도중 심사팀에 의해 수집된 정보는 인증을 정지하거나 취소를 결정하는 근거로 제공한다.</p>
                    </div>

                    {/* 제11조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제11조 (갱신심사)</h4>
                      <p>
                        인증원은 의뢰인의 경영시스템의 효과성을 지속적으로 보장하기 위하여 인증 후 3년 이내에 의뢰인의 경영시스템 전체에 대하여 갱신심사를 실시하고 인증서를 재발행해야 한다.
                      </p>
                    </div>

                    {/* 제12조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제12조 (입회심사)</h4>
                      <p>
                        의뢰인의 조직이 인정원 또는 인증관련기관의 입회 심사 대상 기업으로 선정되었을 경우, 의뢰인은 인증원의 인정심사팀이 심사를 참여하는데 동의한다. 입회심사에 선정된 의뢰인은 인증원의 입회심사 절차 규정을 성실히 이행함을 원칙으로 한다.
                      </p>
                    </div>

                    {/* 제13조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제13조 (인증원 지정취소, 업무정지 시 처리)</h4>
                      <p>
                        인증원의 업무중단, 인증원 지정취소 및 업무정지와 같이 인증등록 유지가 불가능할 경우 인증원은 의뢰인의 인증등록의 계속 유지 또는 신규인증등록을 할 수 있도록 협력기관 또는 타 인증원을 주선하며 이러한 사항은 의뢰인과 협의하여 처리한다. 이에 따른 비용은 상호 협의하여 실비를 보상할 수 있다. 보상기준은 다음과 같다.
                      </p>
                      <ul className="list-disc list-inside pl-2 space-y-0.5 text-[10.5px] text-slate-700 mt-1">
                        <li>계약 시 협력기관으로의 승계에 동의한 기업은 인증승계 이외의 보상을 실시하지 아니한다.</li>
                        <li>인증승계와 관련하여 계약 시 동의하지 아니한 조직으로서 인증승계를 거부하고 타 인증원으로의 신규인증등록을 희망하는 경우 신규인증등록비용에서 잔여 유효기간 예상비용을 제외한 실비에 한하여 보상한다.</li>
                        <li>인증원의 귀책 사유로 손실이 발생되었음이 객관적으로 입증되었을 경우, 실 손해액 전액 배상을 원칙으로 하되 총 금액이 3천만원을 초과할 수 없다.</li>
                      </ul>
                    </div>

                    {/* 제14조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제14조 (인증효력 정지)</h4>
                      <p>
                        인증원은 의뢰인이 정해진 기한 내에 사후관리심사를 수검하지 않아 예고공문 접수 후 1개월 이내 미수검, 인증시스템 가동 불가, 클레임·사회적 물의, 심사비용 2개월 초과 미납, 인증서 적용범위 초과 사용, 계약 또는 합의사항 위반, 경부적합 시정조치 30일 이내 미검증 등의 사유가 발생할 경우 인증의 효력을 정지시킨다.
                      </p>
                    </div>

                    {/* 제15조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제15조 (인증의 취소)</h4>
                      <p>
                        인증원은 효력정지 처분에도 불구하고 3개월이 지나도록 시정조치가 이루어지지 않거나, 인증서 반납, 기업 해체·연락두절, 유효기간 내 3회 이상 효력정지, 인증심사비용을 심사일로부터 3개월 경과 시까지 미납한 경우 인증을 취소시키고 채권추심 절차를 이행한다.
                      </p>
                    </div>

                    {/* 제16조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제16조 (인증범위의 축소)</h4>
                      <p>
                        A. 인증원은 의뢰인의 경영시스템이 일부 인증 범위에 대해 지속적으로 혹은 심각하게 요구사항을 충족시키지 못하는 경우 인증범위를 축소한다.
                        B. 대상 제품(공정)의 생산이나 서비스가 중단된 경우 인증범위가 축소되며 해당 인증효력이 정지된다.
                      </p>
                    </div>

                    {/* 제17조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제17조 (이의, 불만 및 분쟁)</h4>
                      <p>
                        의뢰인은 인증심사 및 인증과 관련하여 이의, 불만, 분쟁사항이 있을 경우 인증원에게 서면으로 통보하며, 인증원은 내부 절차에 따라 공정히 처리하고 그 결과를 서면 통보한다.
                      </p>
                    </div>

                    {/* 제18조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제18조 (기밀유지)</h4>
                      <p>
                        인증원은 심사 중 취득한 어떠한 정보도 법령 및 인정기관의 공식 요구사항을 제외하고는 의뢰인의 서면동의 없이 제3자에게 제공하지 아니한다.
                      </p>
                    </div>

                    {/* 제19조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제19조 (인증 표준 요구사항 변경)</h4>
                      <p>
                        인증원의 인증 요구사항이 변경된 경우 최소 1개월간의 시행 예고기간을 두고 통보하며, 의뢰인은 이에 따른 문서화된 결과를 제출하고 인증원은 12개월 이내에 이행상태를 확인한다.
                      </p>
                    </div>

                    {/* 제20조 (심사비용 - 청구서 내용 준용) */}
                    <div className="bg-slate-50 border border-slate-300 rounded p-2.5">
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제20조 (심사비용)</h4>
                      <p className="font-semibold text-slate-900">1. 심사비용은 인증원의 청구서(심사비 청구내역서) 내용으로 한다.</p>
                      <p>2. 사후관리심사비용은 사후관리심사가 시행되는 시점의 일일요율로 부과된다.</p>
                      <p>3. 심사 시 또는 인증유지기간 동안 중부적합이 발생된 경우 현장확인심사가 필요하며, 그 비용은 방문시점에서 적용되는 일일요율로 부과된다.</p>
                      <p>4. 심사에 따른 인증원의 출장비, 숙박비 등의 경비는 의뢰인이 부담한다.</p>
                    </div>

                    {/* 제21조 (비용의 지불) */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제21조 (비용의 지불)</h4>
                      <p>1. 계약을 체결하면서 의뢰인은 신청서와 함께 신청비를 납부한다.</p>
                      <p>2. 모든 심사비(1단계, 2단계, 확인심사, 사후관리심사, 특별심사)는 각각의 심사 개시 7일 이전까지 지불한다. 단, 청구가 지연된 경우에는 청구서 접수일로부터 7일 이내에 지불한다.</p>
                      <p>3. 인증원의 출장비는 심사비와 같이 청구된다.</p>
                      <p>4. 모든 비용은 부가세 별도이며 현금으로 지불한다.</p>
                    </div>

                    {/* 제22조 ~ 제25조 */}
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제22조 (불가항력)</h4>
                      <p>본 계약이 전쟁, 천재지변, 전염병 등 통상의 능력을 초과하는 원인에 의해 수행하지 못할 경우는 계약불이행의 사유가 되지 아니한다.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제23조 (계약서의 해석 및 분쟁해결)</h4>
                      <p>본 계약서에 명시되지 않은 사항 및 해석상의 이의는 상호 협의 결정하며, 소송 발생 시 관할 법원은 인증원이 소재하고 있는 관할 법원으로 한다.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제24조 (신뢰, 성실 및 상호 협조)</h4>
                      <p>의뢰인과 인증원은 상호 신뢰를 바탕으로 계약을 이행하며, 심사훈련자 참여 시 상호 협조하고 심사훈련자 투입 비용은 인증원이 부담한다.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-950 text-xs mb-0.5">제25조 (계약기간 및 보관)</h4>
                      <p>
                        본 계약서의 계약기간은 계약일로부터 인증등록 만료일까지(3년)로 하며 갱신심사 시 재계약을 통해 연장할 수 있다.
                      </p>
                      <p className="font-semibold text-slate-900 mt-1">
                        의뢰인과 인증원은 상기 각 조항을 성실히 수행할 것을 확인하고 이를 증명하기 위하여 계약서를 2부 작성하여 대표자 인장 첨인 후 의뢰인과 인증원이 각 1부씩 보관한다. 끝.
                      </p>
                    </div>

                  </div>

                  {/* 하단 계약 당사자 정식 서명 날인 블록 */}
                  <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-6 text-xs">
                    <div className="border border-slate-400 p-4 rounded-xs space-y-2 bg-slate-50/50">
                      <span className="font-bold text-slate-900 block text-center pb-2 border-b border-slate-300">[의뢰인 (고객사)]</span>
                      <p>회사명: <strong>{activeCompany.companyName}</strong></p>
                      <p>주소: {activeCompany.address}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span>대표자: <strong>{activeCompany.ceoName}</strong></span>
                        <span className="w-12 h-12 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400">
                          (서명/인)
                        </span>
                      </div>
                    </div>

                    <div className="border border-slate-400 p-4 rounded-xs space-y-2 bg-slate-50/50">
                      <span className="font-bold text-slate-900 block text-center pb-2 border-b border-slate-300">[인증원 (지엠에스씨에스)]</span>
                      <p>상호: <strong>지엠에스씨에스(주)</strong></p>
                      <p>주소: 서울특별시 강서구 강서로 406, 905호</p>
                      <div className="flex items-center justify-between pt-2">
                        <span>대표이사: <strong>남 경 호</strong></span>
                        <span className="w-12 h-12 rounded-full bg-rose-50 border border-rose-400 text-rose-700 font-bold flex items-center justify-center text-[11px] shadow-2xs">
                          직인
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                            {/* ================================================================= */}
              {/* 2. 심사계획서 공식 공문 서식 (첨부 실물 양식 100% 모방 구현) */}
              {/* ================================================================= */}
              {activeDocTab === 'plan' && (
                <div className="space-y-3.5 print:space-y-2 text-xs print:text-[9.5px] leading-normal print:leading-tight font-sans text-slate-900 bg-white p-2">
                  
                  {/* 최상단 헤더 블록 (좌: 심사계획서 대제목 & 심사종류, 우: 문서번호/수신처/작성일자 3단표) */}
                  <div className="border-2 border-slate-950 grid grid-cols-1 md:grid-cols-12">
                    
                    {/* 좌측 타이틀 & 심사종류 (7컬럼) */}
                    <div className="md:col-span-7 flex flex-col justify-between border-b md:border-b-0 md:border-r-2 border-slate-950">
                      <div className="flex-1 flex items-center justify-center py-3.5 print:py-2">
                        <h1 className="text-2xl md:text-3xl print:text-2xl font-black text-slate-950 tracking-[0.6em] indent-[0.6em]">
                          심 사 계 획 서
                        </h1>
                      </div>
                      <div className="grid grid-cols-12 border-t-2 border-slate-950 text-xs print:text-[9.5px]">
                        <div className="col-span-4 bg-slate-100 p-2 print:p-1 text-center font-bold text-slate-950 border-r border-slate-950 flex items-center justify-center">
                          심사종류
                        </div>
                        <div className="col-span-8 p-2 print:p-1 text-center font-bold text-slate-950 flex items-center justify-center">
                          {receptionType === '신규인증' ? '신규 / 2단계 심사' :
                           receptionType === '갱신심사' ? '갱신 / 2단계 심사' :
                           receptionType === '정기사후' ? '사후 1차심사' :
                           receptionType === '전환심사' ? '전환 / 2단계 심사' : calculatedAuditStageText}
                        </div>
                      </div>
                    </div>

                    {/* 우측 메타데이터 표 (5컬럼) */}
                    <div className="md:col-span-5 text-xs print:text-[9.5px]">
                      <table className="w-full h-full border-collapse">
                        <tbody>
                          <tr className="border-b border-slate-950">
                            <th className="w-20 bg-slate-100 p-2 print:p-1 text-center font-bold text-slate-950 border-r border-slate-950">
                              문서번호
                            </th>
                            <td className="p-2 print:p-1 font-mono font-bold text-slate-950 text-center">
                              {planDocNumber}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-950">
                            <th className="w-20 bg-slate-100 p-2 print:p-1 text-center font-bold text-slate-950 border-r border-slate-950">
                              수신처
                            </th>
                            <td className="p-2 print:p-1 font-bold text-slate-950 text-center">
                              {activeCompany.companyName} 대표이사 귀하
                            </td>
                          </tr>
                          <tr>
                            <th className="w-20 bg-slate-100 p-2 print:p-1 text-center font-bold text-slate-950 border-r border-slate-950">
                              작성일자
                            </th>
                            <td className="p-2 print:p-1 font-mono text-slate-950 text-center">
                              {planDate}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 안내 인사말 (실물 양식 1, 2번 및 입금 안내 문구) */}
                  <div className="space-y-0.5 text-[11.5px] print:text-[9px] text-slate-900 py-1 font-medium leading-relaxed print:leading-tight">
                    <p className="font-bold">1. 귀사의 발전과 지속적 개선을 기원합니다.</p>
                    <p className="font-bold">2. 아래와 같이 ISO 국제표준에 따른 심사계획서 및 청구내역서를 송부하오니 확인하여 주시기 바랍니다.</p>
                    <p className="font-bold pl-3 text-slate-950">심사비용은 심사 수행 5일전까지 입금하여 주시기 바랍니다.</p>
                  </div>

                  {/* Ⅰ. 인증현황 */}
                  <div className="space-y-1 print:space-y-0.5">
                    <h3 className="font-bold text-slate-950 text-xs print:text-[10px] flex items-center gap-1.5">
                      <span className="font-black">Ⅰ. 인증현황</span>
                    </h3>
                    <table className="w-full border-collapse border-2 border-slate-950 text-xs print:text-[9.5px]">
                      <tbody>
                        {/* 1행: 고객명 / 대표자 / 고객번호 */}
                        <tr className="border-b border-slate-950">
                          <th className="w-24 bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950">
                            고 객 명
                          </th>
                          <td className="p-2 print:p-1 border-r border-slate-950 font-bold text-slate-950 text-center">
                            {activeCompany.companyName}
                          </td>
                          <th className="w-20 bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950">
                            대 표 자
                          </th>
                          <td className="p-2 print:p-1 border-r border-slate-950 text-slate-950 text-center font-semibold">
                            {cleanCeoName(activeCompany.ceoName)}
                          </td>
                          <th className="w-20 bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950">
                            고객번호
                          </th>
                          <td className="p-2 print:p-1 font-mono text-slate-950 text-center">
                            {planCustomerNumber || (activeCompany.bizNumber ? 'Q' + activeCompany.bizNumber.replace(/[^0-9]/g, '').slice(-6) : '')}
                          </td>
                        </tr>

                        {/* 2~5행: 사업장 주소 & 담당부서 / 담당자 / 전화 / 팩스 (실물 그리드 정밀 준용) */}
                        <tr className="border-b border-slate-950">
                          <th className="w-24 bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950" rowSpan={4}>
                            인 증 대 상<br />사업장 주소
                          </th>
                          <td className="p-2 print:p-1 border-r border-slate-950 text-slate-950" rowSpan={2}>
                            <span className="font-semibold text-slate-950 mr-1">주사업장:</span>
                            <span>{activeCompany.address}</span>
                          </td>
                          <th className="w-24 bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950">
                            담당부서
                          </th>
                          <td className="p-2 print:p-1 text-slate-950 text-center" colSpan={3}>
                            {planDept}
                          </td>
                        </tr>

                        <tr className="border-b border-slate-950">
                          <th className="w-24 bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950">
                            담당자/직책
                          </th>
                          <td className="p-2 print:p-1 text-slate-950 text-center font-semibold" colSpan={2}>
                            {cleanPersonName(planContactPerson || activeCompany.contactPerson)}
                          </td>
                          <td className="p-2 print:p-1 text-slate-950 text-center font-semibold">
                            {planContactPosition}
                          </td>
                        </tr>

                        <tr className="border-b border-slate-950">
                          <td className="p-2 print:p-1 border-r border-slate-950 text-slate-950" rowSpan={2}>
                            <span className="font-semibold text-slate-950 mr-1">사업장1:</span>
                            <span>{activeCompany.additionalSites?.[0]?.address || planSubAddress || '-'}</span>
                          </td>
                          <th className="w-24 bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950">
                            전    화
                          </th>
                          <td className="p-2 print:p-1 font-mono text-slate-950 text-center" colSpan={3}>
                            {activeCompany.contactPhone}
                          </td>
                        </tr>

                        <tr className="border-b border-slate-950">
                          <th className="w-24 bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950">
                            팩    스
                          </th>
                          <td className="p-2 print:p-1 font-mono text-slate-950 text-center" colSpan={3}>
                            {planFax}
                          </td>
                        </tr>

                        {/* 6행: 인증범위 */}
                        <tr className="border-b border-slate-950">
                          <th className="bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950">
                            인증범위
                          </th>
                          <td className="p-2 print:p-1 text-slate-950 text-center font-medium leading-relaxed" colSpan={5}>
                            {activeCompany.scope || '-'}
                          </td>
                        </tr>

                        {/* 7행: 인증코드 & KSIC */}
                        <tr>
                          <th className="bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950">
                            인증코드
                          </th>
                          <td className="p-2 print:p-1 border-r border-slate-950 text-center font-mono font-bold text-slate-950">
                            {activeCompany.iafCode}
                          </td>
                          <th className="bg-slate-100 p-2 print:p-1 border-r border-slate-950 text-center font-bold text-slate-950" colSpan={2}>
                            KSIC<br />(산업분류코드)
                          </th>
                          <td className="p-2 print:p-1 text-center font-mono text-slate-950 font-bold" colSpan={2}>
                            {planKsicCode}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Ⅱ. 심사기준 */}
                  <div className="space-y-1 print:space-y-0.5">
                    <h3 className="font-bold text-slate-950 text-xs print:text-[10px] flex items-center gap-1.5">
                      <span className="font-black">Ⅱ. 심사기준</span>
                    </h3>
                    <div className="p-2.5 print:p-1 border-2 border-slate-950 text-xs print:text-[9.5px] font-bold text-slate-950 text-center bg-white">
                      {activeStandards.join(' & ')} &amp; 관련법규, 고객요구사항, 고객기준문서
                    </div>
                  </div>

                  {/* Ⅲ. 심사의 목적 */}
                  <div className="space-y-1 print:space-y-0.5">
                    <h3 className="font-bold text-slate-950 text-xs print:text-[10px] flex items-center gap-1.5">
                      <span className="font-black">Ⅲ. 심사의 목적</span>
                    </h3>
                    <div className="p-2.5 print:p-1 border-2 border-slate-950 text-xs print:text-[9px] space-y-0.5 print:space-y-0 text-slate-950 leading-normal print:leading-tight bg-white font-medium">
                      <p>1. 조직의 경영시스템에 대한 심사기준의 적합성을 평가</p>
                      <p>2. 조직의 경영시스템의 효과성 평가 및 잠재적 개선분야 확인</p>
                      <p>3. 법규/규제/계약요구사항 충족/보장을 위한 조직경영시스템의 능력을 평가</p>
                      <p>4. {receptionType === '신규인증' ? '인증추천 여부를 결정' : '인증유지 및 추천 여부를 결정'}</p>
                    </div>
                  </div>

                  {/* Ⅳ. 심사일정 */}
                  <div className="space-y-1.5 print:space-y-0.5">
                    <h3 className="font-bold text-slate-950 text-xs print:text-[10px] flex items-center gap-1.5">
                      <span className="font-black">Ⅳ. 심사일정</span>
                    </h3>
                    <table className="w-full border-collapse border-2 border-slate-950 text-xs print:text-[9.5px] text-center">
                      <tbody>
                        {/* 1행: 심사일자 */}
                        <tr className="border-b border-slate-950">
                          <th className="w-24 bg-slate-100 p-2 print:p-1 border-r border-slate-950 font-bold text-slate-950">
                            심사일자
                          </th>
                          <td className="p-2 print:p-1 border-r border-slate-950 font-mono font-bold text-slate-950" colSpan={3}>
                            {formattedKoSchedule}
                          </td>
                          <td className="p-2 print:p-1 border-r border-slate-950 font-bold text-slate-950" colSpan={2}>
                            {appliedMd >= 2.0 ? '2일간' : '1일간'}
                          </td>
                          <td className="p-2 print:p-1 font-mono font-bold text-slate-950" colSpan={2}>
                            {appliedMd.toFixed(1)}M/D
                          </td>
                        </tr>

                        {/* 2행: 심사팀 헤더 */}
                        <tr className="border-b border-slate-950 bg-slate-100 font-bold text-slate-950">
                          <th className="p-1.5 print:p-0.5 border-r border-slate-950 w-24" rowSpan={4}>
                            심사팀
                          </th>
                          <th className="p-1.5 print:p-0.5 border-r border-slate-950 w-20">역할</th>
                          <th className="p-1.5 print:p-0.5 border-r border-slate-950 w-16">소속</th>
                          <th className="p-1.5 print:p-0.5 border-r border-slate-950 w-20">성명</th>
                          <th className="p-1.5 print:p-0.5 border-r border-slate-950 w-28">연락처</th>
                          <th className="p-1.5 print:p-0.5 border-r border-slate-950 w-20">역할</th>
                          <th className="p-1.5 print:p-0.5 border-r border-slate-950 w-16">소속</th>
                          <th className="p-1.5 print:p-0.5 border-r border-slate-950 w-20">성명</th>
                          <th className="p-1.5 print:p-0.5 w-28">연락처</th>
                        </tr>

                        {/* 3행: 심사팀장 / 팀원 */}
                        <tr className="border-b border-slate-950 text-slate-950">
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950 font-bold">심사팀장</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">GMS</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950 font-bold">{selectedLeadAuditor?.name}</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950 font-mono text-[11px] print:text-[9px]">{selectedLeadAuditor?.mobile}</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">{selectedTeamAuditor ? '심사원' : '-'}</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">{selectedTeamAuditor ? (selectedTeamAuditor.agency && selectedTeamAuditor.agency !== '사무국직영' ? selectedTeamAuditor.agency : 'GMS') : '-'}</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950 font-bold">{selectedTeamAuditor?.name || '-'}</td>
                          <td className="p-1.5 print:p-0.5 font-mono text-[11px] print:text-[9px]">{selectedTeamAuditor?.mobile || '-'}</td>
                        </tr>

                        {/* 4행: 검증심사원 */}
                        <tr className="border-b border-slate-950 text-slate-950">
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950 font-medium">검증심사원</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5">-</td>
                        </tr>

                        {/* 5행: 심사훈련 / 심사원보 */}
                        <tr className="border-b border-slate-950 text-slate-950">
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950 font-medium">심사훈련</td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950 text-[10px] print:text-[8px] leading-tight" colSpan={1}>
                            심사원보<br />코드확장
                          </td>
                          <td className="p-1.5 print:p-0.5 border-r border-slate-950">-</td>
                          <td className="p-1.5 print:p-0.5">-</td>
                        </tr>

                        {/* 6행: 차기심사종류/일수 */}
                        <tr className="text-slate-950 font-bold">
                          <th className="p-2 print:p-1 border-r border-slate-950 bg-slate-100" colSpan={2}>
                            차기심사종류/일수
                          </th>
                          <td className="p-2 print:p-1 border-r border-slate-950 text-center" colSpan={3}>
                            {receptionType === '신규인증' ? '사후 1차심사' :
                             receptionType === '정기사후' ? '사후 2차심사' : '갱신심사'}
                          </td>
                          <td className="p-2 print:p-1 border-r border-slate-950 text-center" colSpan={1}>
                            /
                          </td>
                          <td className="p-2 print:p-1 text-center font-medium" colSpan={3}>
                            추후통보M/D
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 하단 공식 고객안내 (IAF Guide, 전담심사원, 남효린 주임 연락처) */}
                  <div className="space-y-1 print:space-y-0.5 text-[10.5px] print:text-[8px] text-slate-700 leading-normal print:leading-tight pt-1">
                    <p>※ IAF Guide 와 KAB 적용기준에 근거한 인증원 규정 [GSI-03 인증심사일수와 비용기준]에 따라 심사일수가 산정됩니다.</p>
                    <p>※ 귀사는 인증심사전 " 인증기준 및 인증등록 조직의 권리와 의무사항" 에 대한 내용을 반드시 숙지하시기 바랍니다.</p>
                    <p className="pl-3">- 위 내용은 인증원 홈페이지 자료실 &lt;인증절차안내서&gt;로 게재되어 있습니다.</p>
                    <p>※ 심사팀에는 심사원 양성을 위한 심사훈련자 또는 심사팀의 심사수행 검증을 위한 검증심사원이 참석할 수 있으며,관련비용은 기업에서 부담하지 않습니다.</p>
                    <p>※ ICT를 활용한 원격심사는 전체 심사시간대비()%로 진행됩니다.(해당 시)</p>
                    <p className="font-semibold text-slate-900">
                      ▶ 당인증원은 귀사의 시스템 향상을 위하여 최선을 다하고 있습니다. 심사진행과 관련하여 궁금한 사항이 있으시면 언제라도 귀사의 전담심사원 또는 인증운영담당 ( 남효린 주임 ) ( ☎02-6929-1702, E-mail kgms2304@gmail.com ) 에게 전화주시면 고객 감동의 정신으로 상세하게 안내하여 드리겠습니다.
                    </p>
                    <p className="font-bold text-slate-950">
                      ▶ 상기 계획과 관련하여 이의가 있을 경우 사유를 기록하여 (FAX 070-8270-2141) 송부 바라며, 접수 후 2일 이내에 연락이 없으신 경우 본 일정으로 확정하겠습니다.
                    </p>
                  </div>

                  {/* 하단 이의 사유 및 작성자 서명 박스 (실물 양식과 100% 일치) */}
                  <div className="border-2 border-slate-950 p-3 print:p-2 space-y-3 bg-white text-slate-950 text-xs print:text-[9.5px] mt-2">
                    <div className="text-slate-950 font-bold">
                      이의 사유:
                    </div>
                    <div className="h-4 print:h-2"></div>
                    <div className="text-right text-slate-950 font-semibold text-[11px] print:text-[9px] pt-1">
                      작성자 : 직위 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, 성명 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;, 서명: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                  </div>

                  {/* 심사비 청구내역서 연계 출력 (F16 심사계획·청구서 팩) */}
                  <div className="my-8 border-t-4 border-double border-slate-400 pt-6"></div>

                  <div className="space-y-4 print:space-y-1.5 text-xs print:text-[10px] leading-normal print:leading-tight font-sans text-slate-900">
                    {/* 상단 인증원 헤더 정보 */}
                    <div className="border-b-2 border-slate-900 pb-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-900">서울특별시 강서구 강서로 406, 905호 (등촌동, 동광빌딩)</p>
                        <p className="text-slate-600">http://www.gmscs.co.kr &nbsp;|&nbsp; esggnf@naver.com</p>
                        <p className="font-mono text-slate-700">Tel : 02-6929-1702 &nbsp;|&nbsp; Fax : 070-8270-2141</p>
                      </div>
                    <div className="sm:text-right mt-2 sm:mt-0 flex flex-col items-start sm:items-end justify-between">
                      <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-bold text-xs rounded-xs tracking-wider">
                        ESG with GMSCS !
                      </span>
                    </div>
                  </div>

                  {/* 제목 */}
                  <div className="text-center py-2">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-[0.6em] indent-[0.6em]">
                      청구내역서
                    </h1>
                    <p className="text-xs font-bold text-slate-500 tracking-[0.3em] mt-1 font-mono">
                      INVOICE
                    </p>
                  </div>

                  {/* 상단 메타데이터 표 */}
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-400">
                        <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">청구번호</th>
                        <td className="p-2 border-r border-slate-400 font-mono font-bold text-slate-900">
                          GMS-인증-{currentContractRecord.contractNumber ? currentContractRecord.contractNumber.replace(/[^0-9]/g, '').slice(-8) : ''}
                        </td>
                        <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">작성일자</th>
                        <td className="p-2 font-mono text-slate-900">
                          {currentContractRecord.contractDate || ''}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">수 신 처</th>
                        <td className="p-2 border-r border-slate-400 font-bold text-slate-900">
                          {activeCompany.companyName} 대표이사 귀하
                        </td>
                        <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">참    조</th>
                        <td className="p-2 text-slate-900 font-semibold">
                          {activeCompany.contactPerson || ''} {activeCompany.contactPerson ? '담당자' : ''}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* ■ 인증심사 비용 */}
                  <div className="space-y-2 pt-1">
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-slate-900 inline-block"></span>
                      <span>인증심사 비용</span>
                    </h3>

                    {/* 심사 개요 요약 표 */}
                    <table className="w-full border-collapse border border-slate-700 text-xs">
                      <tbody>
                        <tr className="border-b border-slate-400">
                          <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">기업명</th>
                          <td className="p-2 border-r border-slate-400 font-bold text-slate-900" colSpan={3}>
                            {activeCompany.companyName}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">인증표준</th>
                          <td className="p-2 border-r border-slate-400 font-semibold text-slate-900" colSpan={3}>
                            {activeStandards.join(' & ')}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사종류</th>
                          <td className="p-2 border-r border-slate-400 font-bold text-slate-900">
                            {receptionType === '정기사후' ? '사후1차' : calculatedAuditStageText}
                          </td>
                          <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사형태</th>
                          <td className="p-2 text-slate-900">
                            {receptionType === '신규인증' ? '1단계 / 2단계 심사' : '현장 심사'}
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사일자</th>
                          <td className="p-2 border-r border-slate-400 font-mono text-slate-900">
                            {plannedStartDate} ~ {plannedEndDate}
                          </td>
                          <th className="bg-slate-100 p-2 border-r border-slate-400 text-center font-bold text-slate-800">심사일수(MD)</th>
                          <td className="p-2 font-mono font-bold text-slate-900">
                            {appliedMd} MD
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* 비용 세부 내역 표 (Remark 청구내역서 원본 표 준용) */}
                    <table className="w-full border-collapse border border-slate-700 text-xs text-center mt-3">
                      <thead className="bg-slate-100 border-b border-slate-400 font-bold text-slate-800">
                        <tr>
                          <th className="p-2 border-r border-slate-400 w-1/2">구분 / 항목</th>
                          <th className="p-2 border-r border-slate-400 w-1/2">금    액</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 text-slate-900">
                        <tr>
                          <td className="p-2 border-r border-slate-400 font-semibold text-left pl-6">신청비</td>
                          <td className="p-2 font-mono text-right pr-6">₩{applicationFee.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-400 font-semibold text-left pl-6">심사비</td>
                          <td className="p-2 font-mono text-right pr-6 font-bold">₩{(docAuditFee + onsiteAuditFee).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-400 font-semibold text-left pl-6">출장비</td>
                          <td className="p-2 font-mono text-right pr-6">₩{travelExpense.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                          <td className="p-2 border-r border-slate-400 text-left pl-6 text-slate-800">소 계</td>
                          <td className="p-2 font-mono text-right pr-6 text-slate-900">₩{finalFee.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="p-2 border-r border-slate-400 text-left pl-6 text-slate-800">V.A.T</td>
                          <td className="p-2 font-mono text-right pr-6 text-slate-900">₩{vat.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-slate-100 font-black border-t-2 border-slate-700 text-slate-950 text-sm">
                          <td className="p-2.5 border-r border-slate-400 text-left pl-6">총 심사비용</td>
                          <td className="p-2.5 font-mono text-right pr-6 text-cyan-950 font-bold">
                            ₩{totalWithVat.toLocaleString()}
                          </td>
                        </tr>
                        <tr className="bg-white text-slate-600 text-[11px]">
                          <td className="p-2 text-left pl-6 font-medium" colSpan={2}>
                            ★ 숙식비는 미포함 금액이며, 숙박시에는 귀사에 추가 비용이 청구됩니다.
                            {lodgingOption === '턴키포함' && ` (현재 턴키 포함 설정: ₩${lodgingExpense.toLocaleString()})`}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 입금계좌 안내 하이라이트 박스 */}
                  <div className="my-3 border-2 border-slate-800 p-4 bg-slate-50/60 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-700 block">입금 계좌:</span>
                      <span className="text-base font-black text-slate-950">지엠에스씨에스(주)</span>
                    </div>
                    <div className="text-center sm:text-right">
                      <span className="text-slate-600 text-xs block font-medium">공식 입금 은행 및 계좌번호</span>
                      <span className="font-mono text-lg font-black text-cyan-950 tracking-wider">
                        기업은행 : 070-4848-2143
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">(또는 010-3797-1563-010)</span>
                    </div>
                  </div>

                  {/* 하단 입금 안내 사항 (결재란 없음 - 공문) */}
                  <div className="border border-slate-700 p-3 space-y-1.5 text-[11px] text-slate-700 bg-white leading-relaxed">
                    <p className="font-semibold text-slate-900">
                      1. 인증심사비는 심사일 4일전까지 입금 바라오며, 기업명으로 입금하여 주시기 바랍니다.
                    </p>
                    <p className="pl-3 text-slate-600">
                      (미 입금 시 심사가 진행되지 않을 수 있습니다.)
                    </p>
                    <p className="font-semibold text-slate-900 pt-1">
                      2. 전자계산서는 입금 확인 후 영수로 발송됩니다. 청구 발행이 필요할 시에는 인증원으로 연락바랍니다. (☎ 02-6929-1702 / 010-5818-0601)
                    </p>
                  </div>
                </div>
              </div>
            )}

              {/* ================================================================= */}
              {/* 4. 심사설문서 (인증신청 및 설문서 Pack - 2025 Pack 형태 완벽 준용) */}
              {/* ================================================================= */}
              {activeDocTab === 'survey' && (
                <div className="space-y-5 text-xs leading-relaxed text-slate-900">
                  {/* 상단 서식 번호 및 타이틀 */}
                  <div className="border-b-2 border-slate-900 pb-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[11px] text-slate-500 block">GMSCS-F01-Pack (2025.10.01)</span>
                      <h2 className="text-xl font-black text-slate-950 tracking-tight mt-0.5">인증신청서 및 설문서</h2>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-teal-900 block">신청구분: {receptionType}</span>
                      <span className="text-[11px] text-slate-500">작성일자: {currentContractRecord.contractDate}</span>
                    </div>
                  </div>

                  {/* 작성 안내 및 제출 문서 목록 점검표 */}
                  <div className="border border-slate-400 text-[11px]">
                    <div className="bg-slate-100 p-2 border-b border-slate-300 font-semibold text-slate-800">
                      1) 본 양식은 심사 일수 및 비용을 정확하게 제안하기 위한 것이니 모든 항목을 정확하게 기록하여 주시기 바랍니다.
                    </div>
                    <div className="p-2 space-y-1.5 bg-white">
                      <p className="font-bold text-slate-900">2) 신청서 접수 시 제출 문서 목록 및 점검표 (굵은 글씨는 필수 제출 자료입니다.)</p>
                      <table className="w-full border-collapse border border-slate-300 text-[10.5px]">
                        <tbody>
                          <tr className="border-b border-slate-200">
                            <th className="w-28 bg-slate-50 p-1.5 border-r border-slate-200 text-left font-bold">① 공통 제출 문서</th>
                            <td className="p-1.5">
                              <strong>사업자등록증</strong>, <strong>공장등록증 및 건설업 면허증</strong>, <strong>조직도</strong>, <strong>제조공정도</strong>, <strong>인원 증빙서류</strong>, <strong>시스템문서(목차 또는 매뉴얼/절차서)</strong>, <strong>내부심사·경영검토결과보고서</strong>, 인증비용 입금증
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <th className="bg-slate-50 p-1.5 border-r border-slate-200 text-left font-bold">② ISO14001 신청 시</th>
                            <td className="p-1.5">
                              <strong>환경영향평가표</strong>, 환경측면등록부, 환경관련신고증 (예: 대기배출 허가증, 폐수배출신고증 등)
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <th className="bg-slate-50 p-1.5 border-r border-slate-200 text-left font-bold">③ ISO45001 신청 시</th>
                            <td className="p-1.5">
                              <strong>위험성평가표</strong>, 안전보건조직도, 안전보건 등록증 (위험물 취급 등록증 등)
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <th className="bg-slate-50 p-1.5 border-r border-slate-200 text-left font-bold">④ ESG-MS 신청 시</th>
                            <td className="p-1.5">
                              ESG 자가진단 평가표, ESG 관련 성과보고서, ESG 관련 인증서
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-slate-50 p-1.5 border-r border-slate-200 text-left font-bold">⑤ 인증원 전환 시</th>
                            <td className="p-1.5">
                              전 인증원 인증서 사본, 전회차 심사결과보고서 사본
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 1. 일반사항 */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                      <span>1. 일반사항</span>
                    </h3>
                    <table className="w-full border-collapse border border-slate-400 text-xs">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <th className="w-24 bg-slate-100 p-2 border-r border-slate-300 font-bold text-center">인증신청 구분</th>
                          <td className="p-2 border-r border-slate-300" colSpan={3}>
                            <div className="flex items-center gap-6 font-semibold">
                              <span className="flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[10px] ${receptionType === '신규인증' ? 'bg-teal-700 text-white border-teal-800' : 'bg-white border-slate-400'}`}>
                                  {receptionType === '신규인증' ? '✓' : ''}
                                </span>
                                <span>최초</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[10px] ${receptionType === '갱신심사' ? 'bg-teal-700 text-white border-teal-800' : 'bg-white border-slate-400'}`}>
                                  {receptionType === '갱신심사' ? '✓' : ''}
                                </span>
                                <span>갱신</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[10px] ${receptionType === '전환심사' ? 'bg-teal-700 text-white border-teal-800' : 'bg-white border-slate-400'}`}>
                                  {receptionType === '전환심사' ? '✓' : ''}
                                </span>
                                <span>전환 (인증원/표준)</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[10px] ${receptionType === '규격추가' ? 'bg-teal-700 text-white border-teal-800' : 'bg-white border-slate-400'}`}>
                                  {receptionType === '규격추가' ? '✓' : ''}
                                </span>
                                <span>규격추가</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[10px] ${receptionType === '인증변경' ? 'bg-teal-700 text-white border-teal-800' : 'bg-white border-slate-400'}`}>
                                  {receptionType === '인증변경' ? '✓' : ''}
                                </span>
                                <span>인증변경</span>
                              </span>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <th className="bg-slate-100 p-2 border-r border-slate-300 font-bold text-center">신청표준</th>
                          <td className="p-2 font-bold text-teal-950" colSpan={3}>
                            {activeStandards.join('  /  ')}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <th className="bg-slate-100 p-2 border-r border-slate-300 font-bold text-center">회사명</th>
                          <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{activeCompany.companyName}</td>
                          <th className="w-20 bg-slate-100 p-2 border-r border-slate-300 font-bold text-center">대표자</th>
                          <td className="p-2">{activeCompany.ceoName}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <th className="bg-slate-100 p-2 border-r border-slate-300 font-bold text-center">본사 주소</th>
                          <td className="p-2" colSpan={3}>{activeCompany.address}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <th className="bg-slate-100 p-2 border-r border-slate-300 font-bold text-center">연락처 / 담당자</th>
                          <td className="p-2 border-r border-slate-300">
                            {cleanPersonName(activeCompany.contactPerson)} {activeCompany.contactPosition || ''}
                          </td>
                          <th className="bg-slate-100 p-2 border-r border-slate-300 font-bold text-center">전화 / 이메일</th>
                          <td className="p-2 text-[11px]">
                            {activeCompany.contactPhone || ''} {activeCompany.contactEmail ? `| ${activeCompany.contactEmail}` : ''}
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-2 border-r border-slate-300 font-bold text-center">인원정보</th>
                          <td className="p-2" colSpan={3}>
                            <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
                              <span>전체 근로자: <strong>{currentEmployeeCount}명</strong></span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 2. 인증신청 정보 */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                      <span>2. 인증신청 정보</span>
                    </h3>
                    <table className="w-full border-collapse border border-slate-400 text-xs">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <th className="w-32 bg-slate-100 p-2 border-r border-slate-300 font-bold text-left">인 증 범 위</th>
                          <td className="p-2 font-medium text-slate-900">
                            {activeCompany.scope ? (
                              <span>{activeCompany.scope}</span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">
                                미등록 (인증범위 확인 필요)
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <th className="bg-slate-100 p-2 border-r border-slate-300 font-bold text-left">주요 생산품 / 서비스</th>
                          <td className="p-2">{activeCompany.industry || '-'}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <th className="bg-slate-100 p-2 border-r border-slate-300 font-bold text-left">주 요 공 정</th>
                          <td className="p-2 text-[11px]">
                            {(activeCompany as any).mainProcess || '조직 표준 업무 절차에 따름'}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <th className="bg-slate-100 p-2 border-r border-slate-300 font-bold text-left">외주 처리된 공정</th>
                          <td className="p-2 text-[11px]">{(activeCompany as any).outsourcedProcess || '해당 없음'}</td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-2 border-r border-slate-300 font-bold text-left">ISO 9001 적용제외</th>
                          <td className="p-2 text-[11px] text-slate-700">{(activeCompany as any).excludedClauses || '해당 없음'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 3. 인증설문서 (공통 15문항) */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-teal-700 inline-block rounded-xs"></span>
                      <span>3. 인증설문서 (공통 15문항)</span>
                    </h3>
                    <table className="w-full border-collapse border border-slate-400 text-[11px]">
                      <tbody className="divide-y divide-slate-300">
                        <tr>
                          <td className="p-2 font-medium w-3/4">1. 귀사의 경영시스템 구축은 어떻게 추진하였습니까?</td>
                          <td className="p-2 font-bold text-center">
                            <span className="text-teal-900">☑ 자체추진</span> &nbsp;&nbsp; <span className="text-slate-400">☐ 지도자문</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">2. 문서화된 정보의 결정 및 유지관리가 적절히 실행되고 있습니까?</td>
                          <td className="p-2 font-bold text-center">
                            <span className="text-teal-900">☑ Yes</span> &nbsp;&nbsp; <span className="text-slate-400">☐ No</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">3. 목표관리(성과지표)는 관리하고 있습니까?</td>
                          <td className="p-2 font-bold text-center">
                            <span className="text-teal-900">☑ Yes</span> &nbsp;&nbsp; <span className="text-slate-400">☐ No</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">4. 주요 이해관계자는 파악하고 있습니까? (주요고객: 현대모비스 등)</td>
                          <td className="p-2 font-bold text-center">
                            <span className="text-teal-900">☑ Yes</span> &nbsp;&nbsp; <span className="text-slate-400">☐ No</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">5. 귀사의 중요한 RISK와 기회는 파악하고 있습니까?</td>
                          <td className="p-2 font-bold text-center">
                            <span className="text-teal-900">☑ Yes</span> &nbsp;&nbsp; <span className="text-slate-400">☐ No</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">6. 내부심사는 실시되었습니까?</td>
                          <td className="p-2 font-bold text-center">
                            <span className="text-teal-900">☑ Yes</span> &nbsp;&nbsp; <span className="text-slate-400">☐ No</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">7. 경영검토는 실시되었습니까?</td>
                          <td className="p-2 font-bold text-center">
                            <span className="text-teal-900">☑ Yes</span> &nbsp;&nbsp; <span className="text-slate-400">☐ No</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">8. 복수 사업장이 있습니까? (단일 사업장 기준)</td>
                          <td className="p-2 font-bold text-center">
                            <span className="text-slate-400">☐ Yes</span> &nbsp;&nbsp; <span className="text-teal-900">☑ No (단일)</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">9. 사업장 위치: 공업단지 입지 여부</td>
                          <td className="p-2 font-bold text-center">
                            <span className="text-teal-900">☑ 공업단지</span> &nbsp;&nbsp; <span className="text-slate-400">☐ 도시/기타</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">10. 작업의 복잡성: 고도의 기술과 숙련도 필요 여부</td>
                          <td className="p-2 font-bold text-center text-teal-900">
                            ☑ 기술·숙련도 필요
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">11. 인증심사 희망일자</td>
                          <td className="p-2 font-mono font-bold text-center text-slate-900">
                            {plannedStartDate} ~ {plannedEndDate}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">12. 정보통신활용 (ICT) 심사에 대한 동의 여부</td>
                          <td className="p-2 font-bold text-center">
                            <span className="text-teal-900">☑ 동의함 (Yes)</span> &nbsp;&nbsp; <span className="text-slate-400">☐ 미동의</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 하단 확인 및 서명 */}
                  <div className="pt-5 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-slate-700">상기와 같이 사실에 근거하여 심사설문서를 작성하여 제출합니다.</p>
                      <p className="font-bold text-xs text-slate-900 mt-1">신청일자: {currentContractRecord.contractDate}</p>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-bold text-slate-900">신청인: {activeCompany.companyName} 대표이사 {activeCompany.ceoName}</span>
                        <span className="w-10 h-10 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400">
                          (직인)
                        </span>
                      </div>
                      <p className="text-xs font-black text-slate-950 mt-1.5">GMSCS인증원장 귀하</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 5. 갱신심사추가설문서 (Remark 갱신심사추가설문서.docx 형태 완벽 준용) */}
              {/* ================================================================= */}
              {activeDocTab === 'renewal_survey' && (
                <div className="space-y-6 text-xs leading-relaxed text-slate-900">
                  {/* 헤더 */}
                  <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[11px] text-slate-500 block">GMSCS 갱신심사 전용 서식</span>
                      <h2 className="text-xl font-black text-slate-950 tracking-tight mt-0.5">갱신 신청 추가 설문서</h2>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      <div>신청일자: {currentContractRecord.contractDate}</div>
                      <div>인증구분: 갱신심사 (재인증)</div>
                    </div>
                  </div>

                  {/* 1. 일반정보 */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-indigo-700 inline-block rounded-xs"></span>
                      <span>1. 일반정보</span>
                    </h3>
                    <table className="w-full border-collapse border border-slate-700 text-xs">
                      <tbody>
                        <tr className="border-b border-slate-400">
                          <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">회사명</th>
                          <td className="p-2 border-r border-slate-400 font-bold text-slate-950">{activeCompany.companyName}</td>
                          <th className="w-24 bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">인증번호</th>
                          <td className="p-2 font-mono font-bold text-slate-900">{(activeCompany as any).certNumber || (activeCompany as any).certNo || '-'}</td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">인증표준</th>
                          <td className="p-2 font-bold text-indigo-950" colSpan={3}>
                            {activeStandards.join('   ')}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-400">
                          <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">담당자명</th>
                          <td className="p-2 border-r border-slate-400">{cleanPersonName(activeCompany.contactPerson)}</td>
                          <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">직위</th>
                          <td className="p-2">{activeCompany.contactPosition || '담당자'}</td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-2 border-r border-slate-400 font-bold text-center">현 인증범위</th>
                          <td className="p-2 text-slate-800" colSpan={3}>
                            {activeCompany.scope || '-'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 2. 변경사항 확인 (워드 양식 8개 공식 항목) */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-indigo-700 inline-block rounded-xs"></span>
                      <span>2. 변경사항 확인</span>
                    </h3>
                    <table className="w-full border-collapse border border-slate-700 text-xs">
                      <thead className="bg-slate-100 border-b border-slate-400 text-slate-800 font-bold text-center">
                        <tr>
                          <th className="py-2 px-3 border-r border-slate-300 text-left w-1/3">변경내역</th>
                          <th className="py-2 px-2 border-r border-slate-300 w-28">유 &nbsp;&nbsp; 무</th>
                          <th className="py-2 px-3 text-left">변경 사항이 있을 경우 첨부서류</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 text-slate-800">
                        <tr>
                          <td className="p-2 font-medium border-r border-slate-300">1. 회사명 변경</td>
                          <td className="p-2 text-center border-r border-slate-300">
                            <span className="text-slate-400">☐ 유</span> &nbsp;&nbsp; <span className="font-bold text-indigo-900">☑ 무</span>
                          </td>
                          <td className="p-2 text-slate-600 text-[11px]">사업자등록증 또는 법인등기부 등본</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium border-r border-slate-300">2. 대표자 및 소유권 변경</td>
                          <td className="p-2 text-center border-r border-slate-300">
                            <span className="text-slate-400">☐ 유</span> &nbsp;&nbsp; <span className="font-bold text-indigo-900">☑ 무</span>
                          </td>
                          <td className="p-2 text-slate-600 text-[11px]">사업자등록증, 법인등기부 등본</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium border-r border-slate-300">3. 사업장 추가, 축소</td>
                          <td className="p-2 text-center border-r border-slate-300">
                            <span className="text-slate-400">☐ 유</span> &nbsp;&nbsp; <span className="font-bold text-indigo-900">☑ 무</span>
                          </td>
                          <td className="p-2 text-slate-600 text-[11px]">사업자등록증 또는 공장등록증</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium border-r border-slate-300">
                            4. 조직 개편 및 직원 증가 및 축소
                          </td>
                          <td className="p-2 text-center border-r border-slate-300 font-bold">
                            {isEmployeeChanged ? (
                              <><span className="text-indigo-900">☑ 유</span> &nbsp;&nbsp; <span className="text-slate-400">☐ 무</span></>
                            ) : (
                              <><span className="text-slate-400">☐ 유</span> &nbsp;&nbsp; <span className="text-indigo-900">☑ 무</span></>
                            )}
                          </td>
                          <td className="p-2 text-[11px]">
                            조직도 및 인원증빙서류
                            {isEmployeeChanged && (
                              <span className="ml-2 font-bold text-indigo-800 font-mono">
                                ({employeeDiff > 0 ? `+${employeeDiff}명 증원` : `${employeeDiff}명 감원`})
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium border-r border-slate-300">5. 인증범위 변경</td>
                          <td className="p-2 text-center border-r border-slate-300">
                            <span className="text-slate-400">☐ 유</span> &nbsp;&nbsp; <span className="font-bold text-indigo-900">☑ 무</span>
                          </td>
                          <td className="p-2 text-slate-600 text-[11px]">매뉴얼</td>
                        </tr>
                        <tr className="bg-slate-50 text-[11px]">
                          <td className="p-2 border-r border-slate-300 text-slate-600 font-semibold" colSpan={3}>
                            변경된 인증범위 : <span className="font-normal text-slate-500">해당 없음 (현행 인증범위 유지)</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium border-r border-slate-300">6. 인증표준의 변경</td>
                          <td className="p-2 text-center border-r border-slate-300 font-bold">
                            {receptionType === '규격추가' ? (
                              <><span className="text-indigo-900">☑ 유</span> &nbsp;&nbsp; <span className="text-slate-400">☐ 무</span></>
                            ) : (
                              <><span className="text-slate-400">☐ 유</span> &nbsp;&nbsp; <span className="text-indigo-900">☑ 무</span></>
                            )}
                          </td>
                          <td className="p-2 text-slate-600 text-[11px]">매뉴얼, 절차서</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium border-r border-slate-300">7. 최근 3년 이내 법규 위반</td>
                          <td className="p-2 text-center border-r border-slate-300">
                            <span className="text-slate-400">☐ 유</span> &nbsp;&nbsp; <span className="font-bold text-indigo-900">☑ 무</span>
                          </td>
                          <td className="p-2 text-slate-600 text-[11px]">법규위반 고지서 (해당 시)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 하단 날인 및 서명란 */}
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <tbody>
                      <tr>
                        <td className="w-1/2 p-3 border-r border-slate-300 font-bold text-slate-800">
                          신청일자 : &nbsp;&nbsp;<span className="font-normal">{currentContractRecord.contractDate}</span>
                        </td>
                        <td className="w-1/2 p-3">
                          <div className="flex items-center justify-between">
                            <span>회사명 : &nbsp;<strong>{activeCompany.companyName}</strong></span>
                            <span className="text-slate-400 text-[11px]">(명판/직인)</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="text-center pt-2">
                    <h3 className="text-base font-black text-slate-950 tracking-wider">
                      GMSCS 원장 귀하
                    </h3>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 6. 인증변경신청서 (F19-002) 종이 서식 */}
              {/* ================================================================= */}
              {activeDocTab === 'change' && (
                <div className="space-y-6 text-xs leading-relaxed">
                  {/* 헤더 */}
                  <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-slate-500">F19-002-Rev.01</span>
                      <h2 className="text-xl font-black text-slate-950 tracking-tight mt-0.5">인 증 변 경 신 청 서</h2>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      <div>신청일자: {certChangeData.appliedDate}</div>
                      <div>인증번호: {certChangeData.certNumber}</div>
                    </div>
                  </div>

                  {/* 신청인 정보 */}
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-purple-700 inline-block rounded-xs"></span>
                      <span>1. 신청인(인증기업) 정보</span>
                    </h3>
                    <table className="w-full border-collapse border border-slate-400 text-xs">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <th className="w-24 bg-slate-100 p-2 border-r border-slate-300 text-left font-semibold">기업명</th>
                          <td className="p-2 border-r border-slate-300 font-bold">{activeCompany.companyName}</td>
                          <th className="w-24 bg-slate-100 p-2 border-r border-slate-300 text-left font-semibold">대표자</th>
                          <td className="p-2">{activeCompany.ceoName}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <th className="bg-slate-100 p-2 border-r border-slate-300 text-left font-semibold">사업장주소</th>
                          <td className="p-2" colSpan={3}>{activeCompany.address}</td>
                        </tr>
                        <tr>
                          <th className="bg-slate-100 p-2 border-r border-slate-300 text-left font-semibold">담당자</th>
                          <td className="p-2 border-r border-slate-300">{certChangeData.contactPerson} ({certChangeData.tel})</td>
                          <th className="bg-slate-100 p-2 border-r border-slate-300 text-left font-semibold">적용표준</th>
                          <td className="p-2 font-mono font-bold">{activeStandards.join(', ')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 변경 신청 내용 (변경 전 vs 변경 후) */}
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-purple-700 inline-block rounded-xs"></span>
                      <span>2. 변경 신청 항목 및 대비표</span>
                    </h3>
                    <div className="p-2 bg-slate-50 border border-slate-300 mb-2 flex items-center gap-4 text-xs font-semibold">
                      <span>변경 구분:</span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">상호 변경 ✓</span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">소재지(주소) 변경 ✓</span>
                      <span className="text-slate-400">[ ] 대표자 변경</span>
                      <span className="text-slate-400">[ ] 생산품목 추가</span>
                    </div>

                    <table className="w-full border-collapse border border-slate-400 text-xs">
                      <thead className="bg-slate-100 border-b border-slate-400 font-bold text-center">
                        <tr>
                          <th className="w-28 p-2 border-r border-slate-300">구분</th>
                          <th className="p-2 border-r border-slate-300">변  경  전</th>
                          <th className="p-2">변  경  후 (신청 사항)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        <tr>
                          <th className="bg-slate-50 p-2 border-r border-slate-300 text-center font-semibold">상호(국문/영문)</th>
                          <td className="p-2 border-r border-slate-300 text-slate-600">{activeCompany.companyName}</td>
                          <td className="p-2 font-bold text-slate-900">{certChangeData.newCompanyNameKo || activeCompany.companyName} {certChangeData.newCompanyNameEn ? `/ ${certChangeData.newCompanyNameEn}` : ''}</td>
                        </tr>
                        <tr>
                          <th className="bg-slate-50 p-2 border-r border-slate-300 text-center font-semibold">사업장 주소</th>
                          <td className="p-2 border-r border-slate-300 text-slate-600">{activeCompany.address}</td>
                          <td className="p-2 font-bold text-slate-900">{certChangeData.newAddressHeadKo || activeCompany.address}</td>
                        </tr>
                        <tr>
                          <th className="bg-slate-50 p-2 border-r border-slate-300 text-center font-semibold">생산 품목 / 범위</th>
                          <td className="p-2 border-r border-slate-300 text-slate-600">{activeCompany.scope || '-'}</td>
                          <td className="p-2 font-bold text-slate-900">{certChangeData.currentScope || activeCompany.scope || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 서약 및 날인 */}
                  <div className="pt-4 border-t border-slate-300 text-center space-y-2">
                    <p className="text-xs text-slate-700">위와 같이 인증 등록 사항의 변경을 신청하오니 승인하여 주시기 바랍니다.</p>
                    <p className="font-bold text-xs text-slate-900">신청일자: {currentContractRecord.contractDate || certChangeData.appliedDate}</p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <span>신청인: <strong>{activeCompany.companyName}</strong> 대표이사 <strong>{activeCompany.ceoName}</strong></span>
                      <span className="w-10 h-10 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400">
                        (인)
                      </span>
                    </div>
                  </div>

                  {/* 인증원 확인란 */}
                  <div className="border border-slate-400 p-3 bg-slate-50 space-y-2">
                    <span className="font-bold text-slate-900 text-xs block">[인증원 검토 및 확인란]</span>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>확인방법: <strong>서류 확인 완료 (적합)</strong></div>
                      <div>검토자: <strong>________________________ (인)</strong></div>
                      <div>최종 승인: <strong>________________________ (직인)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* 5. 휴일근무확인서 종이 서식 */}
              {/* ================================================================= */}
              {activeDocTab === 'weekend' && (
                <div className="space-y-6 text-xs leading-relaxed">
                  {/* 헤더 */}
                  <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-slate-500">Remark 공인 실물 서식</span>
                      <h2 className="text-xl font-black text-slate-950 tracking-tight mt-0.5">휴일(토/일) 및 야간 심사 사유 확인서</h2>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      <div>심사일자: {weekendData.auditDates}</div>
                      <div>심사구분: {calculatedAuditStageText}</div>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <th className="w-24 bg-slate-100 p-2 border-r border-slate-300 text-left font-semibold">피심사기업</th>
                        <td className="p-2 border-r border-slate-300 font-bold">{activeCompany.companyName}</td>
                        <th className="w-24 bg-slate-100 p-2 border-r border-slate-300 text-left font-semibold">심사팀장</th>
                        <td className="p-2">{selectedLeadAuditor.name} ({selectedLeadAuditor.grade || '선임심사원'})</td>
                      </tr>
                      <tr>
                        <th className="bg-slate-100 p-2 border-r border-slate-300 text-left font-semibold">심사 대상일</th>
                        <td className="p-2 border-r border-slate-300 font-mono font-bold" colSpan={3}>
                          {weekendData.auditDates} (토요일 및 일요일 양일간 전일 심사)
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 사유 상세 (케이원메탈 실물 문구) */}
                  <div className="border border-slate-400 p-4 bg-slate-50 space-y-2">
                    <span className="font-bold text-slate-900 text-xs block">■ 휴일(주말) 심사 수행 사유:</span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3 border border-slate-300 rounded-xs">
                      {weekendData.detailedReason}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      ※ KAB 인정 기준 및 노동법규 준수를 위하여 기업의 서면 동의 및 실질 가동 상태를 확인하고 작성된 공식 증빙 서식입니다.
                    </p>
                  </div>

                  {/* 서명 확인란 */}
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-400">
                    <div className="border border-slate-300 p-3 text-center space-y-2">
                      <span className="font-bold text-slate-900 block">[심사팀장 서명]</span>
                      <p>소속: 글로벌매니지먼트시스템인증원</p>
                      <div className="flex items-center justify-center gap-2">
                        <span>성명: <strong>{selectedLeadAuditor.name}</strong></span>
                        <span className="text-emerald-700 font-bold text-[11px]">전자서명 완료 ✓</span>
                      </div>
                    </div>

                    <div className="border border-slate-300 p-3 text-center space-y-2">
                      <span className="font-bold text-slate-900 block">[피심사기업 확인]</span>
                      <p>기업명: {activeCompany.companyName}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span>확인자: <strong>{activeCompany.ceoName}</strong> 대표</span>
                        <span className="text-emerald-700 font-bold text-[11px]">이메일 확인 승인 완료 ✓</span>
                      </div>
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
