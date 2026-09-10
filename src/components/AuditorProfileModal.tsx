import React, { useState, useRef } from 'react';
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
  Tag
} from 'lucide-react';
import { Auditor, AuditorAffiliation, AuditorPayoutMethod, StandardCode } from '../types';

interface AuditorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditor: Auditor;
  onSave: (updatedAuditor: Auditor) => void;
  onNavigateToPortal?: () => void;
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
  '17 (기계/금속)',
  '28 (건설/토목)',
  '33 (정보기술)',
  '35 (전문서비스)',
  '14 (고무/플라스틱)',
  '18 (기계설비)',
  '19 (전기전자)',
  '03 (식음료)',
  '09 (화학/석유)',
  '38 (보건/사회복지)'
];

export const AuditorProfileModal: React.FC<AuditorProfileModalProps> = ({
  isOpen,
  onClose,
  auditor,
  onSave,
  onNavigateToPortal
}) => {
  if (!isOpen) return null;

  // Active sub-tab in modal
  const [activeTab, setActiveTab] = useState<'basic' | 'payout' | 'qualification' | 'standards'>('basic');

  // Form states initialized with auditor values
  const [name, setName] = useState(auditor.name || '');
  const [mobile, setMobile] = useState(auditor.mobile || '');
  const [email, setEmail] = useState(auditor.email || '');
  const [gmsNumber, setGmsNumber] = useState(auditor.gmsNumber || '');
  const [affiliation, setAffiliation] = useState<AuditorAffiliation>(auditor.affiliation || '비상근');
  const [grade, setGrade] = useState<Auditor['grade']>(auditor.grade || '선임심사원');
  const [contractExpiryDate, setContractExpiryDate] = useState(auditor.contractExpiryDate || '2028-12-31');
  const [photoUrl, setPhotoUrl] = useState<string>(auditor.photoUrl || '');

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

  const [iafCodes, setIafCodes] = useState<string[]>(auditor.iafCodes || ['17 (기계/금속)', '28 (건설/토목)']);

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
      iafCodes
    };

    onSave(updatedAuditor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-8 sm:pt-14 pb-8 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-xl overflow-hidden flex flex-col max-h-[88vh] transition-all duration-200">
        
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
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-cyan-500/80"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-medium text-base">
                  {name.charAt(0) || '심'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-cyan-600 text-[10px] font-medium rounded-full text-white">
                {affiliation}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold tracking-tight text-white">{name} 심사원</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-cyan-300 border border-slate-700">
                  {grade}
                </span>
                {isCommitteeMember && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60">
                    심의위원 ({committeeRole})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-normal">
                등록번호: <span className="font-mono text-slate-300">{gmsNumber || 'GMS25027'}</span> · 계약만료: <span className="font-mono text-slate-300">{contractExpiryDate}</span>
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
                className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                title="개인 심사원 전용 포털 화면으로 즉시 진입"
              >
                <span>내 심사포털로 진입</span>
                <span>→</span>
              </button>
            )}
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. Navigation Tabs Inside Modal (줄바꿈 방지 whitespace-nowrap & 간결한 명칭) */}
        {/* ========================================================================= */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 pt-2 flex space-x-1.5 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-t-lg text-xs font-medium border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'basic'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>인적사항·사진</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payout')}
            className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-t-lg text-xs font-medium border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'payout'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>정산방식·입금계좌</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qualification')}
            className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-t-lg text-xs font-medium border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'qualification'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>자격등급·계약형태</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('standards')}
            className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-t-lg text-xs font-medium border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'standards'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
            <span>심사규격·IAF코드 ({registeredStandards.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. Modal Content Body (단정하고 편안한 폰트 웨이트 및 안정적인 최소 높이 적용) */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-[460px]">
          
          {/* TAB 1: 기본 인적사항 & 사진 */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              {/* Photo Section */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt={name} 
                      className="w-24 h-24 rounded-full object-cover ring-2 ring-blue-100 shadow-xs"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                      <User className="w-8 h-8 text-slate-400" />
                      <span className="text-[11px] font-normal mt-1">사진 없음</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md border-2 border-white transition cursor-pointer"
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
                  <h4 className="text-xs font-semibold text-slate-800">심사원 프로필 사진</h4>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    인증원 심사계획서 및 공문 발송 시 서식 상단 및 헤더 프로필에 표시됩니다.<br />
                    권장 규격: 정면 상반신 사진 (JPG, PNG, 최대 2MB)
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 transition cursor-pointer"
                    >
                      사진 업로드
                    </button>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        사진 삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    성명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-normal focus:outline-none focus:border-blue-600 text-xs"
                    placeholder="예: 김홍덕"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    GMS 심사원 등록번호
                  </label>
                  <input
                    type="text"
                    value={gmsNumber}
                    onChange={(e) => setGmsNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-normal focus:outline-none focus:border-blue-600 text-xs"
                    placeholder="예: GMS25027"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    휴대전화 번호 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-normal focus:outline-none focus:border-blue-600 text-xs"
                    placeholder="010-XXXX-XXXX"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    이메일 주소 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-normal focus:outline-none focus:border-blue-600 text-xs"
                    placeholder="fumac@naver.com"
                  />
                  <p className="text-[11px] text-slate-400 font-normal mt-1">심사계획서 및 인증 보고서 수발신 기본 이메일로 활용됩니다.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 심사비 지급방식 & 입금계좌 */}
          {activeTab === 'payout' && (
            <div className="space-y-5">
              {/* Payout Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  1. 심사비 정산 방식 선택 <span className="text-rose-500">*</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Option A: 세금계산서 발행 (개인사업자) */}
                  <div 
                    onClick={() => setPayoutMethod('세금계산서')}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      payoutMethod === '세금계산서'
                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-400/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          세금계산서 발행 (개인사업자)
                        </span>
                        <input
                          type="radio"
                          name="payoutMethod"
                          checked={payoutMethod === '세금계산서'}
                          onChange={() => setPayoutMethod('세금계산서')}
                          className="accent-blue-600"
                        />
                      </div>
                      <p className="text-xs text-slate-500 font-normal mt-2 leading-relaxed">
                        개인사업자 등록증이 있는 경우 선택합니다. 심사 완료 후 인증원에 전자세금계산서(부가세 10% 포함)를 발행합니다.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded w-fit">
                      세금계산서 청구 (10% 부가세 반영)
                    </div>
                  </div>

                  {/* Option B: 3.3% 원천징수 (프리랜서 사업소득) */}
                  <div 
                    onClick={() => setPayoutMethod('원천징수')}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      payoutMethod === '원천징수'
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          3.3% 원천징수 (프리랜서 사업소득)
                        </span>
                        <input
                          type="radio"
                          name="payoutMethod"
                          checked={payoutMethod === '원천징수'}
                          onChange={() => setPayoutMethod('원천징수')}
                          className="accent-emerald-600"
                        />
                      </div>
                      <p className="text-xs text-slate-500 font-normal mt-2 leading-relaxed">
                        사업자등록이 없는 비상근 심사원 대상입니다. 지급액의 3.3%(소득세 3% + 지방소득세 0.3%)를 공제 후 계좌로 지급합니다.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded w-fit">
                      간이지급명세서 신고 (3.3% 자동 공제)
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditional Business Info when '세금계산서' is selected */}
              {payoutMethod === '세금계산서' && (
                <div className="bg-slate-50/70 border border-blue-200 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-900 font-semibold border-b border-blue-100 pb-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>개인사업자 등록 정보 (세금계산서용)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        사업자등록번호 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={businessNumber}
                        onChange={(e) => setBusinessNumber(e.target.value)}
                        placeholder="예: 000-00-00000"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono font-normal text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        상호명 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="예: 김홍덕 품질경영연구소"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-normal focus:outline-none focus:border-blue-600 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        대표자 성명
                      </label>
                      <input
                        type="text"
                        value={businessCeo}
                        onChange={(e) => setBusinessCeo(e.target.value)}
                        placeholder="예: 김홍덕"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-normal focus:outline-none focus:border-blue-600 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        세금계산서 수신 이메일 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={taxEmail}
                        onChange={(e) => setTaxEmail(e.target.value)}
                        placeholder="tax@company.co.kr"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono font-normal text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-medium mb-1">
                        사업장 주소
                      </label>
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="예: 서울특별시 금천구 가산디지털1로 145"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-normal focus:outline-none focus:border-blue-600 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Info when '원천징수' is selected */}
              {payoutMethod === '원천징수' && (
                <div className="bg-slate-50/70 border border-emerald-200 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-semibold border-b border-emerald-100 pb-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>원천징수 신고용 정보</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        생년월일 (주민등록번호 앞 6자리)
                      </label>
                      <input
                        type="text"
                        value={residentNumberFront}
                        onChange={(e) => setResidentNumberFront(e.target.value)}
                        placeholder="예: 620515"
                        maxLength={6}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono font-normal text-slate-900 focus:outline-none focus:border-emerald-600 text-xs"
                      />
                    </div>
                    <div className="flex items-center text-slate-500 font-normal text-[11px] leading-relaxed">
                      뒷자리는 보안을 위해 보관하지 않으며, 국세청 세무 신고 시 인증원 행정팀을 통해 확인됩니다.
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Account Registration */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                    <span>2. 심사비 입금 계좌 등록 <span className="text-rose-500">*</span></span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    매월 25일 심사비 정산 시 등록 계좌로 입금됩니다.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      입금 은행 <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-normal focus:outline-none focus:border-blue-600 text-xs"
                    >
                      {BANK_LIST.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      계좌번호 (숫자 및 '-' 포함) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="예: 110-123-456789"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono font-normal text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      예금주명 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="예: 김홍덕"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-normal focus:outline-none focus:border-blue-600 text-xs"
                    />
                    {accountHolder === name && (
                      <span className="text-[11px] text-emerald-600 font-normal flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3" /> 심사원 성명과 일치함
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 자격등급 & 계약형태 */}
          {activeTab === 'qualification' && (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Affiliation */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    소속 계약 형태 <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAffiliation('비상근')}
                      className={`py-2 px-3 rounded-lg font-medium border transition cursor-pointer text-center ${
                        affiliation === '비상근'
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      비상근 (일반 심사원)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAffiliation('상근')}
                      className={`py-2 px-3 rounded-lg font-medium border transition cursor-pointer text-center ${
                        affiliation === '상근'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      상근 (사무국 전임)
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal mt-1">
                    * 비상근 심사원은 배정 기업 관리 및 심사보고서/정산 전용 포털을 이용합니다.
                  </p>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    대표 자격 등급 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as Auditor['grade'])}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-normal focus:outline-none focus:border-blue-600 text-xs"
                  >
                    <option value="선임심사원">선임심사원 (Lead Auditor)</option>
                    <option value="정심사원">정심사원 (Auditor)</option>
                    <option value="심사원보">심사원보 (Provisional Auditor)</option>
                    <option value="검증심사원">검증심사원</option>
                    <option value="기술전문가">기술전문가 (Technical Expert)</option>
                  </select>
                </div>

                {/* Contract Expiry Date */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    계약 및 자격 유효기간
                  </label>
                  <input
                    type="date"
                    value={contractExpiryDate}
                    onChange={(e) => setContractExpiryDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-normal focus:outline-none focus:border-blue-600 text-xs"
                  />
                </div>

                {/* Committee Status */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    인증심의위원회 위원 위촉
                  </label>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCommitteeMember}
                        onChange={(e) => setIsCommitteeMember(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="font-medium text-slate-700">심의위원 위촉</span>
                    </label>

                    {isCommitteeMember && (
                      <select
                        value={committeeRole}
                        onChange={(e) => setCommitteeRole(e.target.value as any)}
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-normal text-xs"
                      >
                        <option value="심의위원장">심의위원장</option>
                        <option value="심의부위원장">심의부위원장</option>
                        <option value="심의위원">심의위원</option>
                        <option value="전문심의위원">전문심의위원</option>
                        <option value="심의간사">심의간사</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 심사 가능 규격 & IAF 코드 (공간 최적화 뱃지 적용) */}
          {activeTab === 'standards' && (
            <div className="space-y-4 text-xs">
              {/* Top Summary Banner */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    등록된 심사 가능 규격 ({registeredStandards.length}개)
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    규격 체크 시 등급(선임/정/보)을 선택할 수 있습니다.
                  </span>
                </div>

                {registeredStandards.length === 0 ? (
                  <div className="text-slate-400 text-xs py-2 text-center font-normal">
                    선택된 심사 규격이 없습니다.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {registeredStandards.map(std => {
                      const gr = standardGrades[std] || '선임심사원';
                      const isLead = gr.includes('선임');
                      return (
                        <div 
                          key={std}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-normal shadow-2xs ${
                            isLead 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900' 
                              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          }`}
                        >
                          <span>{std.split(':')[0]}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                            isLead ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {gr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Matrix Grid: Categories & Standard Selection */}
              <div className="space-y-3">
                {['품질/제조', '환경/안전', 'IT/보안', 'ESG/준법', '식품/의료'].map(category => {
                  const categoryStandards = ALL_STANDARDS.filter(s => s.category === category);
                  return (
                    <div key={category} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="bg-slate-50 px-3.5 py-1.5 font-medium text-slate-700 text-xs flex items-center justify-between border-b border-slate-100">
                        <span>{category} 규격군</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          보유 {categoryStandards.filter(s => registeredStandards.includes(s.code)).length} / {categoryStandards.length}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {categoryStandards.map(std => {
                          const isChecked = registeredStandards.includes(std.code);
                          const curGrade = standardGrades[std.code] || '선임심사원';
                          return (
                            <div 
                              key={std.code} 
                              className={`p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                                isChecked ? 'bg-blue-50/20' : 'hover:bg-slate-50/60'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <input
                                  type="checkbox"
                                  id={`std-${std.code}`}
                                  checked={isChecked}
                                  onChange={() => handleToggleStandard(std.code)}
                                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <label 
                                  htmlFor={`std-${std.code}`}
                                  className="font-medium text-slate-800 cursor-pointer text-xs flex items-center gap-1.5"
                                >
                                  <span>{std.label}</span>
                                  <span className="text-slate-400 font-mono text-[11px] font-normal">({std.code})</span>
                                </label>
                              </div>

                              {/* Grade selector when checked */}
                              {isChecked ? (
                                <div className="flex items-center space-x-1 pl-6 sm:pl-0">
                                  {(['선임심사원', '정심사원', '심사원보', '기술전문가'] as const).map(g => (
                                    <button
                                      key={g}
                                      type="button"
                                      onClick={() => handleSetStandardGrade(std.code, g)}
                                      className={`px-2 py-0.5 rounded text-[10.5px] font-normal border transition cursor-pointer ${
                                        curGrade === g
                                          ? g.includes('선임')
                                            ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                                            : 'bg-emerald-600 text-white border-emerald-600 font-medium'
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      {g}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-300 text-[11px] pl-6 sm:pl-0 font-normal">미등록</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* IAF Codes Management */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-600" />
                    심사 가능 IAF 전문 산업 코드 ({iafCodes.length}개)
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">
                    업종 일치 여부 판정 기준
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {COMMON_IAF_CODES.map(code => {
                    const isSelected = iafCodes.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleToggleIaf(code)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-normal border transition cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-900 text-white border-cyan-900 font-medium'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {code} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 4. Modal Footer (Save & Close Actions) */}
        {/* ========================================================================= */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-normal">
            * 변경된 개인정보 및 심사비 지급 정보는 즉시 안전하게 반영됩니다.
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-normal text-xs transition cursor-pointer shadow-2xs"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>개인정보 및 지급정보 저장</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
