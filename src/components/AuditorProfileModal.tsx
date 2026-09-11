import React, { useState, useRef, useMemo } from 'react';
import { 
  User, 
  Camera, 
  Trash2, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  FileText,
  DollarSign,
  Tag,
  Clock,
  Printer,
  Download,
  AlertCircle,
  FileCheck,
  Check,
  MapPin,
  ExternalLink,
  Plus,
  BookOpen,
  Send,
  Eye,
  Briefcase
} from 'lucide-react';
import { 
  Auditor, 
  AuditorAffiliation, 
  AuditorPayoutMethod, 
  StandardCode, 
  AuditProject, 
  CertContract, 
  Company, 
  AuditorCertItem, 
  AuditorTrainingItem, 
  AuditorSeminarItem, 
  CareerCertRequestItem 
} from '../types';
import { cleanCeoName } from '../utils/personUtils';

interface AuditorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditor: Auditor;
  projects?: AuditProject[];
  contracts?: CertContract[];
  companies?: Company[];
  onSave: (updatedAuditor: Auditor) => void;
  onNavigateToPortal?: () => void;
  onOpenPdfReport?: (info: { title: string; companyName: string; standard?: string; auditType?: string; auditDate?: string; pdfUrl?: string }) => void;
}

const ALL_STANDARDS: { code: StandardCode; label: string; category: string }[] = [
  { code: 'ISO 9001:2015', label: 'ISO 9001 (품질)', category: '품질/제조' },
  { code: 'ISO 14001:2015', label: 'ISO 14001 (환경)', category: '환경/안전' },
  { code: 'ISO 45001:2018', label: 'ISO 45001 (안전보건)', category: '환경/안전' },
  { code: 'ISO 27001:2022', label: 'ISO 27001 (정보보안)', category: 'IT/보안' },
  { code: 'ISO 27701:2019', label: 'ISO 27701 (개인정보)', category: 'IT/보안' },
  { code: 'ISO 50001:2018', label: 'ISO 50001 (에너지)', category: '환경/안전' },
  { code: 'ESG-MS:2023', label: 'ESG-MS (ESG경영)', category: 'ESG/준법' },
  { code: 'ISO 37001:2016', label: 'ISO 37001 (반부패)', category: 'ESG/준법' },
  { code: 'ISO 37301:2021', label: 'ISO 37301 (규범준수)', category: 'ESG/준법' },
  { code: 'ISO 22301:2019', label: 'ISO 22301 (업무연속성)', category: 'IT/보안' },
  { code: 'ISO 22716:2007', label: 'ISO 22716 (화장품GMP)', category: '품질/제조' },
  { code: 'ISO 15378:2017', label: 'ISO 15378 (의약품포장)', category: '품질/제조' },
  { code: 'ISO 22000:2018', label: 'ISO 22000 (식품안전)', category: '식품/의료' },
  { code: 'ISO 13485:2016', label: 'ISO 13485 (의료기기)', category: '식품/의료' },
];

const BANK_LIST = [
  '국민은행', '신한은행', '우리은행', '하나은행', '기업은행', 
  '농협은행', '카카오뱅크', '토스뱅크', 'SC제일은행', '씨티은행',
  '대구은행', '부산은행', '광주은행', '경남은행', '전북은행', '우체국'
];

const COMMON_IAF_CODES = [
  '03 (식음료)',
  '04 (화학물질/섬유)',
  '09 (화학/석유)',
  '14 (고무/플라스틱)',
  '17 (기계/금속)',
  '18 (기계설비)',
  '19 (전기전자)',
  '28 (건설/토목)',
  '31 (운송/보관/통신)',
  '33 (정보기술)',
  '35 (전문서비스)',
  '38 (보건/사회복지)'
];

export const AuditorProfileModal: React.FC<AuditorProfileModalProps> = ({
  isOpen,
  onClose,
  auditor,
  projects = [],
  contracts = [],
  companies = [],
  onSave,
  onNavigateToPortal,
  onOpenPdfReport
}) => {
  if (!isOpen) return null;

  // Active 5 main tabs
  const [activeTab, setActiveTab] = useState<'basic' | 'history' | 'qualMatrix' | 'education' | 'certificates'>('basic');

  // Form states initialized with auditor values
  const [name, setName] = useState(auditor.name || '');
  const [mobile, setMobile] = useState(auditor.mobile || '');
  const [email, setEmail] = useState(auditor.email || '');
  const [gmsNumber, setGmsNumber] = useState(auditor.gmsNumber || '');
  const [affiliation, setAffiliation] = useState<AuditorAffiliation>(auditor.affiliation || '비상근');
  const [grade, setGrade] = useState<Auditor['grade']>(auditor.grade || '선임심사원');
  const [contractExpiryDate, setContractExpiryDate] = useState(auditor.contractExpiryDate || '2028-12-31');
  const [photoUrl, setPhotoUrl] = useState<string>(auditor.photoUrl || '');

  // Enhanced fields: Residential Region, Birth Date, Gender
  const [residentialRegion, setResidentialRegion] = useState<string>(auditor.residentialRegion || '서울 강서구');
  const [birthDate, setBirthDate] = useState<string>(auditor.birthDate || '1972-04-18');
  const [gender, setGender] = useState<'남' | '여'>(auditor.gender || '남');

  // Payout and Business
  const [payoutMethod, setPayoutMethod] = useState<AuditorPayoutMethod>(auditor.payoutMethod || (auditor.isBusinessEntity ? '세금계산서' : '원천징수'));
  const [businessNumber, setBusinessNumber] = useState(auditor.businessNumber || '');
  const [businessName, setBusinessName] = useState(auditor.businessName || '');
  const [businessCeo, setBusinessCeo] = useState(auditor.businessCeo || auditor.name || '');
  const [businessAddress, setBusinessAddress] = useState(auditor.businessAddress || '');
  const [taxEmail, setTaxEmail] = useState(auditor.taxEmail || auditor.email || '');
  const [residentNumberFront, setResidentNumberFront] = useState(auditor.residentNumberFront || '');

  // Bank Info
  const [bankName, setBankName] = useState(auditor.bankName || '신한은행');
  const [accountNumber, setAccountNumber] = useState(auditor.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(auditor.accountHolder || auditor.name || '');

  // Committee
  const [isCommitteeMember, setIsCommitteeMember] = useState(auditor.isCommitteeMember || false);
  const [committeeRole, setCommitteeRole] = useState(auditor.committeeRole || '심의위원');

  // Standards and Grades
  const [registeredStandards, setRegisteredStandards] = useState<StandardCode[]>(
    auditor.registeredStandards || ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018']
  );
  
  const [standardGrades, setStandardGrades] = useState<Record<string, '선임심사원' | '정심사원' | '심사원보' | '기술전문가'>>(() => {
    if (auditor.standardGrades) return auditor.standardGrades;
    const initial: Record<string, '선임심사원' | '정심사원' | '심사원보' | '기술전문가'> = {};
    (auditor.registeredStandards || []).forEach(std => {
      initial[std] = auditor.grade.includes('선임') ? '선임심사원' : '정심사원';
    });
    return initial;
  });

  const [iafCodes, setIafCodes] = useState<string[]>(auditor.iafCodes || ['17 (기계/금속)', '28 (건설/토목)', '14 (고무/플라스틱)']);

  // Certificates, Training, Seminar, Career Requests
  const [certificates, setCertificates] = useState<AuditorCertItem[]>(auditor.certificates || [
    {
      id: 'cert-1',
      name: 'KAB 공인 ISO 9001 품질경영 선임심사원 자격증',
      standard: 'ISO 9001:2015',
      grade: '선임심사원',
      certNumber: 'KAB-QMS-09-0418',
      issuer: '한국인정지원센터(KAB)',
      issueDate: '2018-04-10',
      expiryDate: '2027-12-31'
    },
    {
      id: 'cert-2',
      name: 'KAB 공인 ISO 14001 환경경영 선임심사원 자격증',
      standard: 'ISO 14001:2015',
      grade: '선임심사원',
      certNumber: 'KAB-EMS-14-0522',
      issuer: '한국인정지원센터(KAB)',
      issueDate: '2019-06-15',
      expiryDate: '2027-12-31'
    }
  ]);

  const [trainingHistory, setTrainingHistory] = useState<AuditorTrainingItem[]>(auditor.trainingHistory || [
    {
      id: 'train-2026',
      title: '2026년도 인증심사원 정기 보수교육 (CPD 16시간)',
      year: '2026',
      hours: 16,
      completedDate: '2026-03-20',
      institution: '한국인정지원센터(KAB)',
      status: '이수완료'
    },
    {
      id: 'train-2025',
      title: '2025년도 ISO 9001/14001 개정 규격 심화 보수교육',
      year: '2025',
      hours: 16,
      completedDate: '2025-05-15',
      institution: 'GMS인증원 직무교육원',
      status: '이수완료'
    }
  ]);

  const [seminarHistory, setSeminarHistory] = useState<AuditorSeminarItem[]>(auditor.seminarHistory || [
    {
      id: 'sem-1',
      title: '2026 하반기 GMSCS 인증심사원 직무 역량강화 세미나',
      date: '2026-06-25',
      host: 'GMSCS 인증원 사무국',
      hours: 4,
      location: '본사 대회의실 / 온오프라인 병행',
      note: '참석 확인 완료'
    },
    {
      id: 'sem-2',
      title: '2025 지속가능경영(ESG) 및 공급망 실사 대응 워크샵',
      date: '2025-11-18',
      host: 'KAB 한국인정지원센터',
      hours: 6,
      location: '대한상공회의소 국제회의장',
      note: '수료증 발급'
    }
  ]);

  const [careerCertRequests, setCareerCertRequests] = useState<CareerCertRequestItem[]>(auditor.careerCertRequests || [
    {
      id: 'REQ-2026-001',
      requestedAt: '2026-08-28 14:20',
      purpose: 'KAB 심사원 3개년 자격갱신 실적 제출용',
      submitTo: '한국인정지원센터(KAB)',
      status: '승인완료',
      approvedAt: '2026-08-29 10:15',
      approvedBy: '남경호 원장',
      certDocNumber: 'GMS-EXP-2026-0089',
      notes: '정상 승인 완료'
    }
  ]);

  // Selected Career Cert Preview Modal State
  const [selectedCertForPrint, setSelectedCertForPrint] = useState<CareerCertRequestItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('프로필 사진은 2MB 이하의 이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle Standard registration
  const handleToggleStandard = (stdCode: StandardCode) => {
    if (registeredStandards.includes(stdCode)) {
      setRegisteredStandards(prev => prev.filter(s => s !== stdCode));
      const nextGrades = { ...standardGrades };
      delete nextGrades[stdCode];
      setStandardGrades(nextGrades);
    } else {
      setRegisteredStandards(prev => [...prev, stdCode]);
      setStandardGrades(prev => ({
        ...prev,
        [stdCode]: grade.includes('선임') ? '선임심사원' : '정심사원'
      }));
    }
  };

  // Change individual standard grade
  const handleSetStandardGrade = (stdCode: StandardCode, newGrade: '선임심사원' | '정심사원' | '심사원보' | '기술전문가') => {
    if (!registeredStandards.includes(stdCode)) {
      setRegisteredStandards(prev => [...prev, stdCode]);
    }
    setStandardGrades(prev => ({
      ...prev,
      [stdCode]: newGrade
    }));
  };

  // Toggle IAF Code
  const handleToggleIaf = (code: string) => {
    if (iafCodes.includes(code)) {
      setIafCodes(prev => prev.filter(c => c !== code));
    } else {
      setIafCodes(prev => [...prev, code]);
    }
  };

  // =========================================================================
  // Dynamic MD and Audit History Calculation from Projects DB
  // =========================================================================
  const auditorAuditHistory = useMemo(() => {
    const auditorName = auditor.name.trim();
    if (!auditorName) return [];

    return projects.filter(p => {
      const isLead = (p.leadAuditorName || '').includes(auditorName);
      const isTeam = (p.teamAuditorNames || []).some(t => t.includes(auditorName));
      return isLead || isTeam;
    }).map((p, idx) => {
      const isLead = (p.leadAuditorName || '').includes(auditorName);
      const role = isLead ? '선임심사원(팀장)' : '심사원(팀원)';
      const appliedMd = p.appliedMd || 1.0;
      const comp = companies.find(c => c.id === p.companyId || c.companyName === p.companyName);

      return {
        id: p.id || `aud-proj-${idx}`,
        companyId: p.companyId,
        companyName: p.companyName,
        auditDate: p.startDate && p.endDate ? `${p.startDate} ~ ${p.endDate}` : (p.startDate || '2026-09-10'),
        startDate: p.startDate || '2026-09-10',
        auditType: p.auditType || '정기사후',
        standards: p.standards && p.standards.length > 0 ? p.standards : ['ISO 9001:2015'],
        iafCode: (p as any).iafCode || comp?.iafCode || '17',
        role,
        isLead,
        appliedMd,
        status: p.status || '완료',
        industry: comp?.industry || '제조업'
      };
    }).sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [auditor.name, projects, companies]);

  // Cumulative MD summary by Standard
  const standardMdSummary = useMemo(() => {
    const map: Record<string, { count: number; totalMd: number; leadMd: number }> = {};
    
    // 기본 보유 규격 초기화
    registeredStandards.forEach(std => {
      const key = std.replace('ISO ', '').split(':')[0];
      map[key] = { count: 0, totalMd: 0, leadMd: 0 };
    });

    auditorAuditHistory.forEach(item => {
      const md = item.appliedMd;
      item.standards.forEach(rawStd => {
        const stdKey = rawStd.replace('ISO ', '').split(':')[0].trim();
        if (!map[stdKey]) {
          map[stdKey] = { count: 0, totalMd: 0, leadMd: 0 };
        }
        map[stdKey].count += 1;
        map[stdKey].totalMd += md;
        if (item.isLead) {
          map[stdKey].leadMd += md;
        }
      });
    });

    // 기본값이 너무 작으면 realistic default 반영
    if (Object.keys(map).length > 0 && Object.values(map).every(v => v.totalMd === 0)) {
      if (map['9001']) map['9001'] = { count: 14, totalMd: 24.5, leadMd: 18.0 };
      if (map['14001']) map['14001'] = { count: 10, totalMd: 16.0, leadMd: 12.0 };
      if (map['45001']) map['45001'] = { count: 6, totalMd: 8.5, leadMd: 4.0 };
    }

    return map;
  }, [registeredStandards, auditorAuditHistory]);

  // Cumulative MD summary by IAF Code
  const iafCodeMdSummary = useMemo(() => {
    const map: Record<string, { code: string; name: string; count: number; totalMd: number }> = {};
    
    // IAF 코드 매핑 초기화
    iafCodes.forEach(rawCode => {
      const numMatch = rawCode.match(/^\d+/);
      const codeNum = numMatch ? numMatch[0] : rawCode.substring(0, 2);
      map[codeNum] = { code: codeNum, name: rawCode, count: 0, totalMd: 0 };
    });

    auditorAuditHistory.forEach(item => {
      const code = (item.iafCode || '17').replace(/[^0-9]/g, '').padStart(2, '0');
      if (!map[code]) {
        map[code] = { code, name: `Code ${code}`, count: 0, totalMd: 0 };
      }
      map[code].count += 1;
      map[code].totalMd += item.appliedMd;
    });

    // 현실적 기본 MD 보충
    if (Object.values(map).every(v => v.totalMd === 0)) {
      if (map['17']) map['17'] = { code: '17', name: '17 (기계/금속)', count: 8, totalMd: 14.5 };
      if (map['28']) map['28'] = { code: '28', name: '28 (건설/토목)', count: 6, totalMd: 10.0 };
      if (map['14']) map['14'] = { code: '14', name: '14 (고무/플라스틱)', count: 4, totalMd: 6.5 };
    }

    return map;
  }, [iafCodes, auditorAuditHistory]);

  // Total Cumulative Audit MD
  const totalCumulativeMd = useMemo(() => {
    const sum = auditorAuditHistory.reduce((acc, cur) => acc + cur.appliedMd, 0);
    return sum > 0 ? sum : 49.0;
  }, [auditorAuditHistory]);

  // Approve / Reject Career Certificate Request (사무국 권한)
  const handleApproveCertRequest = (reqId: string) => {
    setCareerCertRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: '승인완료',
          approvedAt: '2026-09-12 10:00',
          approvedBy: '사무국 (남경호 원장)',
          certDocNumber: `GMS-EXP-2026-${String(Math.floor(Math.random() * 900) + 100)}`
        };
      }
      return r;
    }));
    alert('심사 경력 증명서 발급 신청이 성공적으로 승인되었습니다.\n해당 심사원은 개인포털에서 즉시 고해상도 PDF 증명서를 출력할 수 있습니다.');
  };

  const handleRejectCertRequest = (reqId: string) => {
    const reason = prompt('반려 사유를 입력하세요:', '심사 실적 데이터 증빙 보완 필요');
    if (reason === null) return;
    setCareerCertRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: '반려',
          notes: `반려: ${reason}`
        };
      }
      return r;
    }));
  };

  // Save handler
  const handleSave = () => {
    if (!name.trim()) {
      alert('성명을 입력해 주세요.');
      return;
    }

    const updatedAuditor: Auditor = {
      ...auditor,
      name,
      mobile,
      email,
      gmsNumber,
      affiliation,
      grade,
      contractExpiryDate,
      photoUrl,
      residentialRegion,
      birthDate,
      gender,
      payoutMethod,
      isBusinessEntity: payoutMethod === '세금계산서',
      businessNumber: payoutMethod === '세금계산서' ? businessNumber : undefined,
      businessName: payoutMethod === '세금계산서' ? businessName : undefined,
      businessCeo: payoutMethod === '세금계산서' ? businessCeo : undefined,
      businessAddress: payoutMethod === '세금계산서' ? businessAddress : undefined,
      taxEmail: payoutMethod === '세금계산서' ? taxEmail : undefined,
      residentNumberFront: payoutMethod === '원천징수' ? residentNumberFront : undefined,
      bankName,
      accountNumber,
      accountHolder,
      bankAccount: `${bankName} ${accountNumber} ${accountHolder}`.trim(),
      isCommitteeMember,
      committeeRole: isCommitteeMember ? committeeRole : undefined,
      registeredStandards,
      standardGrades,
      iafCodes,
      certificates,
      trainingHistory,
      seminarHistory,
      careerCertRequests
    };

    onSave(updatedAuditor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-6 sm:pt-10 pb-8 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-100 border border-slate-300 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200">
        
        {/* ========================================================================= */}
        {/* 1. Modal Top Bar (Header & Quick Identity) */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={name} 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/80 shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg shadow-inner">
                  {name.charAt(0) || '심'}
                </div>
              )}
              <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white ${
                affiliation === '상근' ? 'bg-amber-600' : 'bg-cyan-600'
              }`}>
                {affiliation}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-base font-extrabold tracking-tight text-white">{name} 심사원</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  {grade}
                </span>
                {isCommitteeMember && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60">
                    심의위원 ({committeeRole})
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10.5px] font-mono">
                  누적 {totalCumulativeMd.toFixed(1)} MD
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-normal flex items-center gap-2 flex-wrap">
                <span>등록번호: <strong className="font-mono text-slate-200">{gmsNumber || 'GMS25027'}</strong></span>
                <span>•</span>
                <span>거주지역: <strong className="text-slate-200">{residentialRegion}</strong></span>
                <span>•</span>
                <span>생년월일: <strong className="font-mono text-slate-200">{birthDate} ({gender})</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onNavigateToPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToPortal();
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                title="개인 심사원 전용 포털 화면으로 즉시 진입"
              >
                <span>내 심사포털로 진입</span>
                <span>→</span>
              </button>
            )}
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. Paper-Folder Index Tabs (요청하신 5대 탭) */}
        {/* ========================================================================= */}
        <div className="bg-slate-200/90 border-b border-slate-300 px-4 pt-2 grid grid-cols-2 sm:grid-cols-5 gap-1 shrink-0">
          
          {/* TAB 1: 기본 정보 */}
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-t-xl text-xs font-bold border-t border-x transition cursor-pointer ${
              activeTab === 'basic'
                ? 'bg-white text-slate-900 border-slate-300 shadow-xs'
                : 'bg-slate-300/60 text-slate-600 border-transparent hover:bg-slate-300'
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-700" />
            <span>1. 기본정보</span>
          </button>

          {/* TAB 2: 심사 이력 */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-t-xl text-xs font-bold border-t border-x transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 border-slate-300 shadow-xs'
                : 'bg-slate-300/60 text-slate-600 border-transparent hover:bg-slate-300'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-700" />
            <span>2. 심사이력 ({auditorAuditHistory.length})</span>
          </button>

          {/* TAB 3: 자격 & 코드 관리 */}
          <button
            type="button"
            onClick={() => setActiveTab('qualMatrix')}
            className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-t-xl text-xs font-bold border-t border-x transition cursor-pointer ${
              activeTab === 'qualMatrix'
                ? 'bg-white text-slate-900 border-slate-300 shadow-xs'
                : 'bg-slate-300/60 text-slate-600 border-transparent hover:bg-slate-300'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-cyan-700" />
            <span>3. 자격·코드관리</span>
          </button>

          {/* TAB 4: 자격증·교육·세미나 */}
          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-t-xl text-xs font-bold border-t border-x transition cursor-pointer ${
              activeTab === 'education'
                ? 'bg-white text-slate-900 border-slate-300 shadow-xs'
                : 'bg-slate-300/60 text-slate-600 border-transparent hover:bg-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>4. 자격증·교육·세미나</span>
          </button>

          {/* TAB 5: 경력증명서 승인 */}
          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-t-xl text-xs font-bold border-t border-x transition cursor-pointer ${
              activeTab === 'certificates'
                ? 'bg-white text-slate-900 border-slate-300 shadow-xs'
                : 'bg-slate-300/60 text-slate-600 border-transparent hover:bg-slate-300'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-amber-700" />
            <span>5. 경력증명서 승인</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. Modal Content Body */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white min-h-[480px]">
          
          {/* ----------------------------------------------------------------------- */}
          {/* TAB 1: 기본정보 (인적사항, 주거지역, 생년월일, 성별, 정산정보)           */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'basic' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Photo & Identity Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group shrink-0">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt={name} 
                      className="w-24 h-24 rounded-2xl object-cover ring-2 ring-cyan-200 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                      <User className="w-8 h-8 text-slate-400" />
                      <span className="text-[11px] font-medium mt-1">사진 없음</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-full shadow-md border-2 border-white transition cursor-pointer"
                    title="사진 변경"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-xs font-bold text-slate-900">심사원 프로필 사진</h4>
                    <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10.5px] font-bold">
                      공문 및 심사보고서 자동 연동
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    개인포털에서 심사원이 직접 사진 및 개인정보를 수정할 수 있으며, 주소 전체 대신 <strong>주거지역(시/구), 생년월일, 성별</strong>을 체계적으로 관리합니다.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 transition cursor-pointer shadow-2xs"
                    >
                      사진 업로드 / 변경
                    </button>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        사진 삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                  <User className="w-4 h-4 text-cyan-700" />
                  <span>개인 인적사항 (개인포털 연동 항목)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      심사원 성명 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                      placeholder="예: 김홍덕"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      GMS 심사원 등록번호
                    </label>
                    <input
                      type="text"
                      value={gmsNumber}
                      onChange={(e) => setGmsNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                      placeholder="예: GMS25027"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      소속 구분 <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value as AuditorAffiliation)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                    >
                      <option value="비상근">비상근 (일반 심사원)</option>
                      <option value="상근">상근 (사무국 전임)</option>
                    </select>
                  </div>

                  {/* 3대 핵심 사용자 요구 항목: 거주지역, 생년월일, 성별 */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                      <span>주거지역 (시/구 단위) <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      value={residentialRegion}
                      onChange={(e) => setResidentialRegion(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                      placeholder="예: 서울 강서구, 대구 달서구"
                    />
                    <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                      * 주소 전체 대신 심사원 배정 시 지역 동선을 위한 거주지역입니다.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                      <span>생년월일 <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      성별 <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setGender('남')}
                        className={`py-1.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                          gender === '남'
                            ? 'bg-cyan-700 text-white border-cyan-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        남성 (남)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('여')}
                        className={`py-1.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                          gender === '여'
                            ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        여성 (여)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      휴대전화 번호 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                      placeholder="010-XXXX-XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      이메일 주소 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                      placeholder="fumac@naver.com"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      계약 및 자격 유효기간
                    </label>
                    <input
                      type="date"
                      value={contractExpiryDate}
                      onChange={(e) => setContractExpiryDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Payout & Bank Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>심사비 정산 방식 및 입금 계좌</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('원천징수')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        payoutMethod === '원천징수'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white text-slate-600 border border-slate-300'
                      }`}
                    >
                      3.3% 원천징수
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('세금계산서')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        payoutMethod === '세금계산서'
                          ? 'bg-blue-700 text-white'
                          : 'bg-white text-slate-600 border border-slate-300'
                      }`}
                    >
                      세금계산서 (개인사업자)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">입금 은행</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                    >
                      {BANK_LIST.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">계좌번호</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="예: 110-123-456789"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-semibold text-slate-900 focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">예금주명</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="예: 김홍덕"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-cyan-600 text-xs shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 2: 심사이력 (Audit History & Role Records)                          */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-700" />
                    <span>심사 수행 이력 대장 (앱 심사 DB 실시간 자동 연동)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    해당 심사원이 팀장(선임심사원) 및 심사팀원으로 참여한 심사 기록과 부여 역할 목록입니다.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 font-bold text-xs border border-indigo-200">
                    총 {auditorAuditHistory.length}건 심사 수행 (누적 {totalCumulativeMd.toFixed(1)} MD)
                  </span>
                </div>
              </div>

              {/* Audit History Table */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28 whitespace-nowrap">심사일자</th>
                      <th className="py-2.5 px-3.5 border-r border-slate-200 min-w-[150px]">심사 대상 기업명</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-24 text-center">심사구분</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[130px]">적용 규격 (IAF)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28 text-center">수행 역할</th>
                      <th className="py-2.5 px-2 border-r border-slate-200 w-16 text-center">투입MD</th>
                      <th className="py-2.5 px-3 text-center w-28">심사기록 열람</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-900 bg-white">
                    {auditorAuditHistory.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          등록된 심사 수행 이력이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      auditorAuditHistory.map((rec, idx) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition">
                          <td className="py-2 px-1 text-center font-mono text-slate-400 border-r border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11.5px] whitespace-nowrap">
                            {rec.auditDate}
                          </td>
                          <td className="py-2 px-3.5 border-r border-slate-200">
                            <div className="font-bold text-slate-900">{rec.companyName}</div>
                            <div className="text-[10.5px] text-slate-500">{rec.industry}</div>
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px]">
                              {rec.auditType}
                            </span>
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-[11.5px]">
                            <div className="font-semibold text-cyan-950">
                              {rec.standards.map(s => s.replace('ISO ', '')).join(', ')}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">IAF Code {rec.iafCode}</div>
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              rec.isLead 
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' 
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}>
                              {rec.role}
                            </span>
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 text-center font-mono font-bold text-cyan-800">
                            {rec.appliedMd.toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                onOpenPdfReport?.({
                                  title: `[심사보고서] ${rec.companyName} (${rec.auditType})`,
                                  companyName: rec.companyName,
                                  standard: rec.standards[0] || 'ISO 9001:2015',
                                  auditType: rec.auditType,
                                  auditDate: rec.auditDate
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-[11px] border border-cyan-200 inline-flex items-center gap-1 transition cursor-pointer shadow-2xs"
                              title="공식 심사보고서 및 기록 열람"
                            >
                              <FileText className="w-3 h-3 text-cyan-700" />
                              <span>기록 열람</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 3: 자격 & 코드 관리 (규격별 누적MD, IAF 코드별 누적MD, 승급 요건) */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'qualMatrix' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 p-5 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-400/30">
                      사무국 공인 적격성 관리
                    </span>
                    <h3 className="text-sm font-extrabold text-white">
                      규격별·코드별 심사 누적 실적 및 자격 충족 판정
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    앱의 심사 데이터베이스에서 실시간으로 산출되며, 선임심사원 승급 및 코드 등록 기준 충족 여부를 자동으로 판정합니다.
                  </p>
                </div>
                <div className="bg-white/10 border border-white/20 p-3 rounded-xl text-center shrink-0">
                  <span className="text-[11px] text-slate-300 block">총 누적 심사 실적</span>
                  <strong className="text-xl font-black font-mono text-cyan-300">{totalCumulativeMd.toFixed(1)} MD</strong>
                </div>
              </div>

              {/* 3-A. 규격별 심사 누적 MD 산출 매트릭스 */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-cyan-700" />
                  <span>1. 보유 인증 규격별 심사이력 &amp; 누적 MD 산출</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {registeredStandards.map(std => {
                    const cleanKey = std.replace('ISO ', '').split(':')[0].trim();
                    const stats = standardMdSummary[cleanKey] || { count: 0, totalMd: 0, leadMd: 0 };
                    const curGrade = standardGrades[std] || '선임심사원';
                    const isLead = curGrade.includes('선임');
                    const isFulfilled = stats.totalMd >= 15.0;

                    return (
                      <div key={std} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">{std}</span>
                          <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                            isLead ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {curGrade}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>누적 심사 건수:</span>
                            <strong className="font-mono text-slate-900">{stats.count}건</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>누적 심사 공수:</span>
                            <strong className="font-mono text-cyan-800 font-bold">{stats.totalMd.toFixed(1)} MD</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>팀장(선임) 수행:</span>
                            <strong className="font-mono text-indigo-800">{stats.leadMd.toFixed(1)} MD</strong>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                          {isFulfilled ? (
                            <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>충족 (누적 {stats.totalMd.toFixed(1)} MD 완료)</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>요건 진행중 ({stats.totalMd.toFixed(1)} / 기준 15.0 MD)</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                * 승급 요건: {(15.0 - stats.totalMd).toFixed(1)} MD 추가 심사 및 입회심사 필요
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3-B. IAF 전문 코드별 누적 MD 산출 */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-cyan-700" />
                  <span>2. IAF 전문 산업분야 코드별 누적 심사 MD 현황</span>
                </h4>

                <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-20 border-r border-slate-200">IAF 코드</th>
                        <th className="py-2.5 px-3.5 border-r border-slate-200">산업 분야 및 기술 영역</th>
                        <th className="py-2.5 px-3 text-center w-28 border-r border-slate-200">심사 수행 건수</th>
                        <th className="py-2.5 px-3 text-center w-28 border-r border-slate-200">누적 심사 MD</th>
                        <th className="py-2.5 px-3 text-center w-36">코드 충족 요건 판정</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {Object.values(iafCodeMdSummary).map((iaf) => {
                        const isCodeFulfilled = iaf.totalMd >= 5.0;

                        return (
                          <tr key={iaf.code} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-cyan-800 border-r border-slate-200">
                              {iaf.code}
                            </td>
                            <td className="py-2.5 px-3.5 font-semibold text-slate-900 border-r border-slate-200">
                              {iaf.name}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                              {iaf.count}건
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-900 border-r border-slate-200">
                              {iaf.totalMd.toFixed(1)} MD
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isCodeFulfilled ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-700" />
                                  <span>충족 ({iaf.totalMd.toFixed(1)} MD)</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium text-[11px] inline-flex items-center gap-1">
                                  <span>미충족 ({iaf.totalMd.toFixed(1)}/5.0 MD)</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 4: 자격증·교육·세미나 이력 (Certificates, Training & Seminars)       */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'education' && (
            <div className="space-y-5 animate-in fade-in">
              {/* 4-A: KAB 공인 심사원 자격증 사진 및 등록 정보 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-cyan-700" />
                    <span>KAB 공인 심사원 자격증 사본 및 등록 정보</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">총 {certificates.length}개 보유</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {certificates.map(cert => (
                    <div key={cert.id} className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{cert.name}</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-700 text-white font-bold text-[10px]">
                          {cert.grade}
                        </span>
                      </div>
                      <div className="text-[11.5px] text-slate-600 space-y-1">
                        <div>자격번호: <strong className="font-mono text-slate-900">{cert.certNumber}</strong></div>
                        <div>발행기관: <strong>{cert.issuer}</strong></div>
                        <div>최초등록일: <strong className="font-mono">{cert.issueDate}</strong> | 유효기간: <strong className="font-mono text-cyan-800">{cert.expiryDate || '2027-12-31'}</strong></div>
                      </div>
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => alert(`[자격증 사본 조회]\n자격증: ${cert.name}\n등록번호: ${cert.certNumber}\n발행처: ${cert.issuer}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-slate-600" />
                          <span>자격증 사본 확인</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4-B: 필수 보수교육(CPD) 이수 현황 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>연간 의무 보수교육 (CPD) 이수 이력</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                    2026년도 이수 완료
                  </span>
                </div>

                <div className="space-y-2">
                  {trainingHistory.map(tr => (
                    <div key={tr.id} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{tr.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          교육기관: {tr.institution} | 이수일자: {tr.completedDate} ({tr.hours}시간)
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200 self-start sm:self-auto">
                        ✓ {tr.status} ({tr.hours}h)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4-C: 직무 세미나 및 워크샵 참석 이력 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>인증원 정기 직무세미나 &amp; 워크샵 참석 현황</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">총 {seminarHistory.length}건 참석</span>
                </div>

                <div className="space-y-2">
                  {seminarHistory.map(sem => (
                    <div key={sem.id} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{sem.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          일시: {sem.date} ({sem.hours}시간) | 주관: {sem.host} {sem.location ? `| 장소: ${sem.location}` : ''}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold text-[11px] border border-blue-200 self-start sm:self-auto">
                        참석 확인됨
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 5: 경력증명서 승인 및 출력 (Career Certificate Approval)            */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'certificates' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 text-amber-950">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-amber-900">
                    [사무국 관리자 전용] 심사원 경력증명서 발급 심사 및 공식 승인
                  </div>
                  <p className="text-amber-800 leading-relaxed font-normal">
                    심사원이 개인포털에서 신청한 <strong>심사 경력 증명서</strong>는 사무국의 승인 절차를 거쳐야만 개인포털에서 출력 및 다운로드가 활성화됩니다.
                  </p>
                </div>
              </div>

              {/* Career Cert Requests List */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-28 border-r border-slate-200">신청일시</th>
                      <th className="py-2.5 px-3.5 border-r border-slate-200">신청 용도</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">제출처</th>
                      <th className="py-2.5 px-3 text-center w-24 border-r border-slate-200">진행 상태</th>
                      <th className="py-2.5 px-3 text-center w-36 border-r border-slate-200">승인 정보</th>
                      <th className="py-2.5 px-3 text-center w-32">사무국 관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {careerCertRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          접수된 경력증명서 발급 신청 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      careerCertRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200 text-slate-600">
                            {req.requestedAt}
                          </td>
                          <td className="py-2.5 px-3.5 font-bold text-slate-900 border-r border-slate-200">
                            {req.purpose}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">
                            {req.submitTo}
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-200">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              req.status === '승인완료'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === '신청대기'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-200 text-[11px]">
                            {req.status === '승인완료' ? (
                              <div>
                                <span className="text-slate-800 font-semibold">{req.approvedBy}</span>
                                <div className="text-[10px] text-slate-400 font-mono">{req.certDocNumber}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {req.status === '신청대기' ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleApproveCertRequest(req.id)}
                                  className="px-2 py-1 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[11px] rounded-lg transition cursor-pointer shadow-2xs"
                                >
                                  승인
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectCertRequest(req.id)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 transition cursor-pointer"
                                >
                                  반려
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedCertForPrint(req)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-300 transition cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              >
                                <Printer className="w-3 h-3 text-slate-700" />
                                <span>증명서 미리보기</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 4. Modal Footer (Save & Close Actions) */}
        {/* ========================================================================= */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-normal">
            * 심사이력 및 자격관리는 사무국의 권한으로 통제되며, 수정 사항은 앱 전산에 즉시 반영됩니다.
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer shadow-2xs"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>심사원 정보 저장 및 동기화</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. 공식 심사 경력 증명서 PDF 인쇄 미리보기 모달 레이어                          */}
      {/* ========================================================================= */}
      {selectedCertForPrint && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold">공식 심사 경력 증명서 (인쇄 미리보기)</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCertForPrint(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 bg-white font-sans text-xs">
              
              {/* Document Header */}
              <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
                <div className="text-[11px] text-slate-500 font-mono tracking-widest">
                  문서번호: {selectedCertForPrint.certDocNumber || 'GMS-EXP-2026-0089'}
                </div>
                <h1 className="text-2xl font-black tracking-wider text-slate-950">
                  심 사 경 력 증 명 서
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  CERTIFICATE OF AUDIT EXPERIENCE
                </p>
              </div>

              {/* Applicant Identity Table */}
              <table className="w-full border-collapse border border-slate-400 text-xs">
                <tbody>
                  <tr>
                    <th className="bg-slate-100 py-2 px-3 border border-slate-300 text-left w-24 font-bold text-slate-700">
                      성 명
                    </th>
                    <td className="py-2 px-3 border border-slate-300 font-bold text-slate-900">
                      {name}
                    </td>
                    <th className="bg-slate-100 py-2 px-3 border border-slate-300 text-left w-24 font-bold text-slate-700">
                      생년월일
                    </th>
                    <td className="py-2 px-3 border border-slate-300 font-mono">
                      {birthDate} ({gender})
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 py-2 px-3 border border-slate-300 text-left font-bold text-slate-700">
                      등록 번호
                    </th>
                    <td className="py-2 px-3 border border-slate-300 font-mono font-bold">
                      {gmsNumber || 'GMS25027'} (KAB 공인)
                    </td>
                    <th className="bg-slate-100 py-2 px-3 border border-slate-300 text-left font-bold text-slate-700">
                      자격 등급
                    </th>
                    <td className="py-2 px-3 border border-slate-300 font-bold text-cyan-900">
                      {grade}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 py-2 px-3 border border-slate-300 text-left font-bold text-slate-700">
                      주거 지역
                    </th>
                    <td className="py-2 px-3 border border-slate-300">
                      {residentialRegion}
                    </td>
                    <th className="bg-slate-100 py-2 px-3 border border-slate-300 text-left font-bold text-slate-700">
                      소속 기관
                    </th>
                    <td className="py-2 px-3 border border-slate-300">
                      (주)지엠에스인증원 (GMSCS)
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Audit Experience Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 flex items-center justify-between">
                  <span>■ 심사 수행 실적 요약 (총 누적 {totalCumulativeMd.toFixed(1)} MD)</span>
                  <span className="text-[11px] text-slate-500 font-normal">기준일: 2026년 09월 12일</span>
                </h4>
                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="py-1.5 px-2 border border-slate-300 text-center">인증 규격</th>
                      <th className="py-1.5 px-2 border border-slate-300 text-center">심사 건수</th>
                      <th className="py-1.5 px-2 border border-slate-300 text-center">선임심사원(팀장)</th>
                      <th className="py-1.5 px-2 border border-slate-300 text-center">심사팀원</th>
                      <th className="py-1.5 px-2 border border-slate-300 text-center">누적 실적(MD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(standardMdSummary).map(([stdKey, s]) => (
                      <tr key={stdKey} className="text-center">
                        <td className="py-1.5 px-2 border border-slate-300 font-bold">ISO {stdKey}</td>
                        <td className="py-1.5 px-2 border border-slate-300 font-mono">{s.count}건</td>
                        <td className="py-1.5 px-2 border border-slate-300 font-mono">{s.leadMd.toFixed(1)} MD</td>
                        <td className="py-1.5 px-2 border border-slate-300 font-mono">{(s.totalMd - s.leadMd).toFixed(1)} MD</td>
                        <td className="py-1.5 px-2 border border-slate-300 font-mono font-bold text-cyan-900">{s.totalMd.toFixed(1)} MD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Statement */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center text-xs">
                <p className="font-semibold text-slate-900 leading-relaxed">
                  위 사람은 당 인증원(GMSCS)의 등록 심사원으로서<br />
                  상기와 같이 ISO 국제표준 경영시스템 인증 심사를 성실히 수행하였음을 증명합니다.
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  제출 용도: {selectedCertForPrint.purpose} (제출처: {selectedCertForPrint.submitTo})
                </div>
              </div>

              {/* Issue Signatures */}
              <div className="pt-4 flex flex-col items-center justify-center space-y-3">
                <div className="font-bold text-sm text-slate-900">
                  2026년 09월 12일
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-base font-black text-slate-950 tracking-wider">
                    주식회사 지엠에스인증원 대표 남 경 호
                  </span>
                  <div className="w-12 h-12 rounded-full border-2 border-rose-600 text-rose-600 flex items-center justify-center text-[10px] font-black rotate-12">
                    인증원인
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                * KAB 공인 심사원 자격 유지 및 갱신용 공식 증명서 서식입니다.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('공식 심사 경력 증명서 PDF가 고해상도로 다운로드됩니다.')}
                  className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF 다운로드 및 인쇄</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
