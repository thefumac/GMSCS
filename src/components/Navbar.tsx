import React from 'react';
import { 
  Calendar, 
  FileText, 
  BellRing, 
  Building2, 
  Users, 
  Calculator, 
  HardDrive, 
  Layers, 
  ShieldCheck, 
  Server, 
  Usb, 
  Mail, 
  Award, 
  DollarSign, 
  UserCheck, 
  LayoutDashboard, 
  CheckCircle2, 
  FolderLock, 
  Briefcase, 
  FileCheck,
  LogOut
} from 'lucide-react';
import { Auditor } from '../types';

export type MainCategory = 
  | 'dashboard'
  | 'certification'
  | 'audit'
  | 'auditor-mgmt'
  | 'general-admin';

export type ActiveTab = 
  // 대시보드
  | 'calendar'
  // 인증관리
  | 'committee' 
  | 'companies' 
  | 'surveillance' 
  | 'kab' 
  // 심사관리
  | 'contracts' // 심사 계약 관리 (신규 & 유지/추가/변경)
  | 'reports' 
  | 'projects' 
  | 'integrations'
  // 심사원 관리
  | 'auditors' 
  | 'portal'
  // 일반관리
  | 'finance' // 재무관리 (정산 + 수납/계산서)
  | 'data';   // 자료관리 (백업 + 서버설정)

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeCategory: MainCategory;
  setActiveCategory: (cat: MainCategory) => void;
  urgentAlertCount: number;
  currentUserRole: string; // 'admin' | 'aud-1' | 'aud-2' etc.
  onSelectUserRole: (role: string) => void;
  allAuditors: Auditor[];
  pendingAdjustmentCount?: number;
  pendingCommitteeCount?: number;
  onOpenEmailModal: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  activeCategory,
  setActiveCategory,
  urgentAlertCount,
  currentUserRole,
  onSelectUserRole,
  allAuditors,
  pendingAdjustmentCount = 1,
  pendingCommitteeCount = 2,
  onOpenEmailModal,
  onLogout
}) => {
  const currentAuditorObj = allAuditors.find(a => a.id === currentUserRole) || allAuditors[0];
  const isExternalAuditor = currentAuditorObj?.affiliation === '비상근심사원';
  const isStaffOrFullTime = !isExternalAuditor;

  // 1-Tier: 상위 카테고리 정의 (비상근 심사원 vs 사무국/상근 심사원 분기)
  const mainCategories = isExternalAuditor ? [
    { 
      id: 'auditor-mgmt' as MainCategory, 
      label: '나의 심사업무(포털)', 
      icon: UserCheck,
      defaultTab: 'portal' as ActiveTab,
      description: '담당 관리기업·심사일정·이해상충'
    },
    { 
      id: 'audit' as MainCategory, 
      label: '나의 심사보고서', 
      icon: FileText,
      defaultTab: 'reports' as ActiveTab,
      description: '배정 심사보고서 작성 및 서명'
    },
    { 
      id: 'general-admin' as MainCategory, 
      label: '나의 심사비 정산', 
      icon: DollarSign,
      defaultTab: 'finance' as ActiveTab,
      description: '심사 수당 정산 명세서 및 3.3% 원천징수'
    },
    ...(currentAuditorObj.isCommitteeMember ? [{
      id: 'certification' as MainCategory, 
      label: '인증심의위원회', 
      icon: Award,
      defaultTab: 'committee' as ActiveTab,
      badge: pendingCommitteeCount,
      badgeColor: 'bg-indigo-600',
      description: '심의위원 안건 의결'
    }] : []),
    { 
      id: 'dashboard' as MainCategory, 
      label: '심사 캘린더', 
      icon: LayoutDashboard,
      defaultTab: 'calendar' as ActiveTab,
      description: '월간 심사 일정'
    },
  ] : [
    { 
      id: 'dashboard' as MainCategory, 
      label: '대시보드', 
      icon: LayoutDashboard,
      defaultTab: 'calendar' as ActiveTab,
      description: '월간 일정 달력 및 경영 현황'
    },
    { 
      id: 'certification' as MainCategory, 
      label: '인증관리', 
      icon: ShieldCheck,
      defaultTab: 'committee' as ActiveTab,
      badge: (pendingCommitteeCount || 0) + (urgentAlertCount || 0),
      badgeColor: 'bg-indigo-600',
      description: '심의위원회·인증현황·사후만료·KAB인정'
    },
    { 
      id: 'audit' as MainCategory, 
      label: '심사관리', 
      icon: Briefcase,
      defaultTab: 'contracts' as ActiveTab,
      badge: pendingAdjustmentCount && pendingAdjustmentCount > 0 ? pendingAdjustmentCount : undefined,
      badgeColor: 'bg-amber-600',
      description: '심사계약·보고서·일정진행·OK ESG'
    },
    { 
      id: 'auditor-mgmt' as MainCategory, 
      label: '심사원 관리', 
      icon: Users,
      defaultTab: 'auditors' as ActiveTab,
      description: '자격코드·심의위원·심사원 전용포털'
    },
    { 
      id: 'general-admin' as MainCategory, 
      label: '일반관리', 
      icon: FolderLock,
      defaultTab: 'finance' as ActiveTab,
      description: '재무관리(정산·수납) 및 자료관리(백업)'
    },
  ];

  // 2-Tier: 각 상위 메뉴별 세부 서브메뉴 구성
  interface SubMenuItem {
    id: ActiveTab | 'email-dispatch';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    onClick?: () => void;
  }

  const subMenusByCategory: Record<MainCategory, SubMenuItem[]> = isExternalAuditor ? {
    'dashboard': [
      { id: 'calendar', label: '나의 배정 심사 일정 달력', icon: Calendar },
    ],
    'certification': [
      { id: 'committee', label: '인증심의위원회', icon: Award, badge: pendingCommitteeCount, badgeColor: 'bg-indigo-600' },
      { id: 'kab', label: 'KAB 인정기준 조회', icon: Calculator },
    ],
    'audit': [
      { id: 'reports', label: '나의 심사 보고서 관리', icon: FileText },
      { id: 'projects', label: '나의 심사 진행현황', icon: CheckCircle2 },
      { id: 'email-dispatch', label: '스마트 메일 발송', icon: Mail, onClick: onOpenEmailModal },
    ],
    'auditor-mgmt': [
      { id: 'portal', label: '나의 관리업체 & 배정 일정 & 이해상충 변경', icon: UserCheck },
    ],
    'general-admin': [
      { id: 'finance', label: '나의 심사비 정산 명세서 (3.3% 원천징수)', icon: DollarSign },
      { id: 'email-dispatch', label: '스마트 메일 발송', icon: Mail, onClick: onOpenEmailModal },
    ]
  } : {
    'dashboard': [
      { id: 'calendar', label: '월간 심사 일정 달력', icon: Calendar },
    ],
    'certification': [
      { id: 'committee', label: '인증심의위원회', icon: Award, badge: pendingCommitteeCount, badgeColor: 'bg-indigo-600' },
      { id: 'companies', label: '고객사 인증현황 (300사)', icon: Building2 },
      { id: 'surveillance', label: '사후 / 만료 관리 (D-Day)', icon: BellRing, badge: urgentAlertCount, badgeColor: 'bg-rose-600' },
      { id: 'kab', label: 'KAB 인정기관 관리 (공인기준·MD)', icon: Calculator },
    ],
    'audit': [
      { id: 'contracts', label: '심사 계약 관리 (신규·유지·추가·변경)', icon: FileCheck, badge: pendingAdjustmentCount, badgeColor: 'bg-amber-600' },
      { id: 'reports', label: '심사 보고서 관리 (목록·상세·정산)', icon: FileText, badge: 1, badgeColor: 'bg-cyan-600' },
      { id: 'projects', label: '심사 진행현황 & 계획서', icon: CheckCircle2 },
      { id: 'integrations', label: 'OK ESG & ISO-Record 연동', icon: Layers },
      { id: 'email-dispatch', label: '스마트 메일 발송 센터', icon: Mail, onClick: onOpenEmailModal },
    ],
    'auditor-mgmt': [
      { id: 'auditors', label: '심사원 자격·코드·심의위원 관리', icon: Users },
      { id: 'portal', label: '심사원 전용 포털 (배정업체·일정·이해상충)', icon: UserCheck },
    ],
    'general-admin': [
      { id: 'finance', label: '재무관리 (심사비용 수납 & 심사원 정산원장)', icon: DollarSign },
      { id: 'data', label: '자료관리 (주서버 & 외장 USB 백업·설정)', icon: HardDrive },
      { id: 'email-dispatch', label: '스마트 메일 발송 센터', icon: Mail, onClick: onOpenEmailModal },
    ]
  };

  // 상위 카테고리 클릭 시 핸들러
  const handleCategorySelect = (cat: MainCategory) => {
    setActiveCategory(cat);
    const categoryInfo = mainCategories.find(c => c.id === cat);
    if (categoryInfo) {
      setActiveTab(categoryInfo.defaultTab);
    }
  };

  const currentSubItems = subMenusByCategory[activeCategory] || [];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      
      {/* ========================================================================= */}
      {/* 1. 시스템 타이틀 영역 (Top System Bar) */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Platform Name */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => {
                if (isExternalAuditor) {
                  setActiveCategory('auditor-mgmt');
                  setActiveTab('portal');
                } else {
                  setActiveCategory('dashboard');
                  setActiveTab('calendar');
                }
              }}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-xl tracking-tight text-slate-900">GMSCS</span>
                  <span className="px-2 py-0.5 text-[10.5px] font-extrabold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                    KAB 공인 인증기관
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">차세대 스마트 인증·심사 통합 관리 플랫폼</p>
              </div>
            </div>

            {/* 주서버 및 외장 백업 상태 표시등 (버튼 형태가 아닌 정교한 LED 상태 표시등) */}
            <div className="hidden md:flex items-center space-x-3 bg-slate-50 border border-slate-200/90 px-3.5 py-1.5 rounded-full shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-700">주서버 정상</span>
              </div>
              
              <span className="text-slate-300 font-light">|</span>
              
              <div className="flex items-center space-x-2 text-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <Usb className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-700">외장 USB 백업 연결</span>
              </div>
            </div>

            {/* Right: Current User & Role Switcher + Logout Button */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  접속 계정
                </div>
                <div className="text-xs font-black text-slate-800 flex items-center gap-1 justify-end">
                  {currentAuditorObj?.isSystemAdmin && <span>👑</span>}
                  <span>{currentAuditorObj?.name}</span>
                  <span className="text-slate-400 font-normal text-[11px]">({currentAuditorObj?.grade})</span>
                </div>
              </div>

              {/* Role Switcher Select */}
              <select
                value={currentUserRole}
                onChange={(e) => {
                  const role = e.target.value;
                  onSelectUserRole(role);
                  const aud = allAuditors.find(a => a.id === role);
                  if (aud?.affiliation === '비상근심사원') {
                    setActiveCategory('auditor-mgmt');
                    setActiveTab('portal');
                  } else {
                    setActiveCategory('dashboard');
                    setActiveTab('calendar');
                  }
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs transition"
                title="계정 전환"
              >
                {allAuditors.map(aud => {
                  const badgeIcon = aud.isSystemAdmin ? '👑' : 
                                    aud.affiliation === '사무국직원' ? '🏢' :
                                    aud.affiliation === '소속심사원' ? '💼' : '👤';
                  const roleDesc = aud.isSystemAdmin ? '사무국직원 · 시스템 총괄' :
                                   aud.affiliation === '사무국직원' ? '사무국 심사원' :
                                   aud.affiliation === '소속심사원' ? '소속 상근' : '비상근 (격리)';
                  return (
                    <option key={aud.id} value={aud.id}>
                      {badgeIcon} {aud.name} ({roleDesc})
                    </option>
                  );
                })}
              </select>

              {/* Logout Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="시스템 로그아웃"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300 hover:border-rose-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-500" />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 주 메뉴 영역 (Tier-1 Main Navigation Bar) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-slate-100 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Primary Category Tabs */}
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2">
              {mainCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40 ring-1 ring-cyan-400/50'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span>{cat.label}</span>
                    {cat.badge && cat.badge > 0 ? (
                      <span className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full text-white ${cat.badgeColor || 'bg-rose-500'}`}>
                        {cat.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            {/* Right: Quick Action & User Affiliation Tag */}
            <div className="hidden lg:flex items-center space-x-3 py-1">
              <button
                type="button"
                onClick={onOpenEmailModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-900/80 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-xs font-bold transition cursor-pointer"
                title="공문 심사계획서 및 전자문서 발송"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>스마트 메일</span>
              </button>

              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                currentAuditorObj.isSystemAdmin ? 'bg-purple-900/40 text-purple-200 border-purple-500/50' :
                currentAuditorObj.affiliation === '사무국직원' ? 'bg-blue-900/40 text-blue-200 border-blue-500/50' :
                currentAuditorObj.affiliation === '소속심사원' ? 'bg-emerald-900/40 text-emerald-200 border-emerald-500/50' :
                'bg-amber-900/40 text-amber-200 border-amber-500/50'
              }`}>
                {currentAuditorObj.name} · {currentAuditorObj.affiliation}{currentAuditorObj.isSystemAdmin ? ' (시스템 총괄)' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 하위 메뉴 영역 (Tier-2 Sub Navigation Bar) */}
      {/* ========================================================================= */}
      {currentSubItems.length > 0 && (
        <div className="bg-slate-100/90 border-b border-slate-200 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <nav className="flex space-x-1.5 overflow-x-auto no-scrollbar text-xs">
              {currentSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id !== 'email-dispatch' && activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        setActiveTab(item.id as ActiveTab);
                      }
                    }}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-white text-cyan-900 border border-slate-300 shadow-xs ring-1 ring-cyan-500/20'
                        : item.id === 'email-dispatch'
                        ? 'text-cyan-800 hover:text-cyan-950 hover:bg-cyan-50/80 bg-white/40 border border-cyan-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-600' : item.id === 'email-dispatch' ? 'text-cyan-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white ${item.badgeColor || 'bg-rose-600'}`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

    </header>
  );
};
