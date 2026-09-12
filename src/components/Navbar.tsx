import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Building2, 
  Users, 
  Award, 
  CheckCircle2, 
  FileCheck,
  FileText,
  UserCheck, 
  LogOut,
  ChevronDown,
  User,
  Settings
} from 'lucide-react';
import { Auditor } from '../types';

export type MainCategory = 
  | 'certification'
  | 'audit'
  | 'auditor-mgmt'
  | 'general-admin';

export type ActiveTab = 
  // 6대 핵심 파일인덱스 메뉴
  | 'calendar'       // 1. 대시보드
  | 'projects'       // 2. 심사진행현황
  | 'contracts'      // 3. 심사관리 (신규 위치)
  | 'clients'        // 4. 고객관리
  | 'auditors'       // 5. 심사원관리
  | 'certification'  // 6. 인증관리
  // 심사원 포털 & 보고서 & 심의
  | 'portal'
  | 'reports'
  | 'committee'
  // 레거시 호환용
  | 'companies'
  | 'surveillance'
  | 'kab'
  | 'integrations'
  | 'finance'
  | 'data'
  | 'notices';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeCategory?: MainCategory;
  setActiveCategory?: (cat: MainCategory) => void;
  urgentAlertCount?: number;
  currentUserRole: string; // 'admin' | auditor ID
  onSelectUserRole: (role: string) => void;
  allAuditors: Auditor[];
  pendingAdjustmentCount?: number;
  pendingCommitteeCount?: number;
  pendingSecretariatReviewCount?: number;
  onOpenEmailModal: () => void;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUserRole,
  allAuditors,
  onOpenProfileModal,
  onLogout
}) => {
  const currentAuditorObj = allAuditors.find(a => a.id === currentUserRole) || allAuditors[0];
  const STAFF_NAMES = ['남경호', '정현일', '남효린', '이혜원', '이예원', '김홍덕'];
  const STAFF_EMAILS = ['nam2304@empas.com', 'himix1993@gmail.com', 'kgms2304@gmail.com', 'yewon6798@gmail.com', 'fumac@naver.com'];

  const isStaff = 
    currentAuditorObj?.isSystemAdmin || 
    currentAuditorObj?.affiliation === '상근' || 
    STAFF_NAMES.some(name => currentAuditorObj?.name?.includes(name)) ||
    (currentAuditorObj?.email && STAFF_EMAILS.includes(currentAuditorObj.email.toLowerCase().trim())) ||
    currentUserRole === 'admin';
  const isRegularAuditor = !isStaff;

  // 사용자 메뉴 드롭다운 상태
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 사무국(상근) 6대 핵심 파일인덱스 메뉴
  const staffTabs = [
    { 
      id: 'calendar' as ActiveTab, 
      label: '대시보드', 
      icon: Calendar, 
      description: '월간 심사일정 달력 및 실시간 종합 통계' 
    },
    { 
      id: 'projects' as ActiveTab, 
      label: '심사진행현황', 
      icon: CheckCircle2, 
      description: 'Pre-Audit부터 Post-Audit까지 4대 수명주기 대장' 
    },
    { 
      id: 'contracts' as ActiveTab, 
      label: '심사관리', 
      icon: FileCheck, 
      description: '심사 계약 체결·수동조정 승인 및 일정 수립' 
    },
    { 
      id: 'clients' as ActiveTab, 
      label: '고객관리', 
      icon: Building2, 
      description: '572개사 고객 대장 및 심사계획서 수립·발송' 
    },
    { 
      id: 'auditors' as ActiveTab, 
      label: '심사원관리', 
      icon: Users, 
      description: '36명 심사원 자격 대장, IAF 전문코드 및 보수교육' 
    },
    { 
      id: 'certification' as ActiveTab, 
      label: '인증관리', 
      icon: Award, 
      description: '공인규격·심의위원회 일정·정산원장·DB백업' 
    },
  ];

  // 비상근 심사원 메뉴
  const auditorTabs = [
    { id: 'calendar' as ActiveTab, label: '심사일정 달력', icon: Calendar, description: '월간 배정 심사 일정 달력' },
    { id: 'portal' as ActiveTab, label: '나의 관리 대상 기업', icon: UserCheck, description: '배정 고객사 및 심사 착수 관리' },
  ];
  if (currentAuditorObj?.isCommitteeMember) {
    auditorTabs.push({
      id: 'committee' as ActiveTab,
      label: '인증심의위원회',
      icon: Award,
      description: '정기 심의위원회 안건 심의 및 의결'
    });
  }

  const primaryTabs = isStaff ? staffTabs : auditorTabs;

  // 표시 이름
  const displayName = currentAuditorObj?.isSystemAdmin 
    ? `${currentAuditorObj.name} 원장` 
    : `${currentAuditorObj?.name} ${currentAuditorObj?.grade || '심사원'}`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* ========================================================================= */}
      {/* 1. 최상단 브랜드 영역: 로고 + 대형 사이트 제목 + 남경호 원장 드롭다운 */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-200 bg-white">
        <div className="w-[96%] sm:w-[92%] lg:w-[90%] mx-auto max-w-[1850px] px-2 sm:px-4">
          <div className="flex items-center justify-between h-20">
            
            {/* 좌측: GMSCS 로고 + KAB 로고 + 대형 제목 */}
            <div 
              className="flex items-center space-x-3.5 cursor-pointer group"
              onClick={() => setActiveTab('calendar')}
              title="클릭 시 대시보드 홈으로 이동"
            >
              {/* GMSCS 원형 로고 */}
              <img 
                src="/gmscs_logo.png" 
                alt="GMSCS 로고" 
                className="h-12 w-12 object-contain drop-shadow-xs group-hover:scale-105 transition-transform" 
              />

              {/* KAB 공인인정 타원형 로고 */}
              <img 
                src="/kab_logo.png" 
                alt="KAB 인정 로고" 
                className="h-9 object-contain drop-shadow-xs group-hover:scale-105 transition-transform" 
              />

              <div className="h-8 w-px bg-slate-300 mx-1 hidden sm:block" />

              {/* 대형 플랫폼 사이트 타이틀 */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-950 tracking-tight leading-tight">
                  GMSCS 인증원 스마트 인증 플랫폼
                </h1>
                <p className="text-[11px] text-slate-500 font-semibold tracking-wide hidden md:block">
                  KAB 공인 인증기관 (QC-2601) · ISO 국제표준 &amp; ESG 통합 관리 시스템
                </p>
              </div>
            </div>

            {/* 우측: 접속자 명 (박스/아바타 없이 텍스트로만 표시, 규격명보다 1pt 큰 text-[13.5px]) */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="flex items-center space-x-1 py-1 text-[13.5px] font-bold text-slate-800 hover:text-cyan-700 transition cursor-pointer select-none"
                title="클릭하여 심사원 포털 및 계정 메뉴 열기"
              >
                <span>{displayName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* 사용자 드롭다운 메뉴 레이어 */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500">
                    <div className="font-bold text-slate-900 text-sm">{currentAuditorObj.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {currentAuditorObj.email || 'fumac@naver.com'}
                    </div>
                  </div>

                  {/* 1. 심사원 포털로 이동 (자기 심사 관리) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setActiveTab('portal');
                    }}
                    className="w-full text-left px-4 py-3 text-xs sm:text-sm font-bold text-cyan-900 hover:bg-cyan-50 flex items-center space-x-2.5 transition cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-cyan-700" />
                    <span>👉 심사원 포털로 이동</span>
                  </button>

                  {/* 2. 개인정보 및 정산 계좌 관리 */}
                  {onOpenProfileModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfileModal();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>개인정보 및 정산계좌 관리</span>
                    </button>
                  )}

                  {/* 3. 로그아웃 */}
                  {onLogout && (
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2.5 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 하단 파일 인덱스(File Index) 메뉴 영역: 기존 대비 60% 슬림 높이로 최적화 */}
      {/* ========================================================================= */}
      <div className="bg-slate-50/90 border-b border-slate-300">
        <div className="w-[96%] sm:w-[92%] lg:w-[90%] mx-auto max-w-[1850px] px-2 sm:px-4">
          <nav className="flex items-center gap-1.5 sm:gap-2 py-1.5 overflow-x-auto no-scrollbar">
            {primaryTabs.map((tabItem) => {
              const Icon = tabItem.icon;
              const isActive = activeTab === tabItem.id || 
                (tabItem.id === 'clients' && activeTab === 'companies') || 
                (tabItem.id === 'contracts' && (activeTab === 'contracts' || activeTab === 'surveillance' || activeTab === 'reports')) ||
                (tabItem.id === 'certification' && (activeTab === 'kab' || activeTab === 'finance' || activeTab === 'data'));

              return (
                <button
                  key={tabItem.id}
                  onClick={() => setActiveTab(tabItem.id)}
                  className={`group rounded-lg border transition-all duration-200 ease-in-out cursor-pointer select-none h-8.5 px-3 flex items-center justify-center ${
                    isActive
                      ? 'flex-[2] min-w-[160px] bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'flex-1 min-w-[105px] sm:min-w-[120px] bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-300'
                  }`}
                  title={tabItem.description}
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-700'}`} />
                    <span className={`text-xs sm:text-[13px] truncate ${isActive ? 'font-bold text-white' : 'font-semibold text-slate-700 group-hover:text-slate-950'}`}>
                      {tabItem.label}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 ml-0.5"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
