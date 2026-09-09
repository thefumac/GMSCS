import React from 'react';
import { 
  Calendar, 
  FileText, 
  BellRing, 
  Building2, 
  Users, 
  Calculator, 
  Receipt, 
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
  FileCheck
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
}) => {
  const currentAuditorObj = allAuditors.find(a => a.id === currentUserRole) || allAuditors[0];
  const isExternalAuditor = currentAuditorObj?.affiliation === '비상근심사원';
  const isStaffOrFullTime = !isExternalAuditor; // 사무국 직원 또는 소속 상근 심사원 (전체 기능 접근)

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

  // 2-Tier: 각 상위 메뉴별 세부 서브메뉴 구성 (비상근은 비인가 서브메뉴 완전 배제)
  interface SubMenuItem {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
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
    ],
    'auditor-mgmt': [
      { id: 'portal', label: '나의 관리업체 & 배정 일정 & 이해상충 변경', icon: UserCheck },
    ],
    'general-admin': [
      { id: 'finance', label: '나의 심사비 정산 명세서 (3.3% 원천징수)', icon: DollarSign },
    ]
  } : {
    'dashboard': [
      { id: 'calendar', label: '월간 심사 일정 달력', icon: Calendar },
    ],
    'certification': [
      { id: 'committee', label: '인증심의위원회', icon: Award, badge: pendingCommitteeCount, badgeColor: 'bg-indigo-600' },
      { id: 'companies', label: '고객사 인증현황 (300사)', icon: Building2 },
      { id: 'surveillance', label: '사후 / 만료 관리', icon: BellRing, badge: urgentAlertCount, badgeColor: 'bg-rose-600' },
      { id: 'kab', label: 'KAB 인정기관 관리 (공인기준·기본MD)', icon: Calculator },
    ],
    'audit': [
      { id: 'contracts', label: '심사 계약 관리 (신규·유지·추가·변경)', icon: FileCheck, badge: pendingAdjustmentCount, badgeColor: 'bg-amber-600' },
      { id: 'reports', label: '심사 보고서 관리 (목록·상세·정산)', icon: FileText, badge: 1, badgeColor: 'bg-cyan-600' },
      { id: 'projects', label: '심사 진행현황 & 계획서', icon: CheckCircle2 },
      { id: 'integrations', label: 'OK ESG & ISO-Record 연동', icon: Layers },
    ],
    'auditor-mgmt': [
      { id: 'auditors', label: '심사원 자격·코드·심의위원 관리', icon: Users },
      { id: 'portal', label: '심사원 전용 포털 (배정업체·일정·이해상충)', icon: UserCheck },
    ],
    'general-admin': [
      { id: 'finance', label: '재무관리 (심사비용 수납 & 심사원 정산원장)', icon: DollarSign },
      { id: 'data', label: '자료관리 (주서버 & 외장 USB 백업·설정)', icon: HardDrive },
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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-xs backdrop-blur-xl">
      {/* 1. 최상단 글로벌 헤더 & 로고 & 계정 선택 바 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-100">
          
          {/* Logo & Title */}
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-slate-900">GMSCS</span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                  KAB 공인 인증기관
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">차세대 스마트 인증·심사 통합 관리 플랫폼</p>
            </div>
          </div>

          {/* 시스템 백업 상태 & 스마트 메일 발송 센터 (사무국/상근만 백업 상태 노출) */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              type="button"
              onClick={onOpenEmailModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-600" />
              <span>스마트 메일 발송 센터</span>
            </button>

            {isStaffOrFullTime && (
              <div className="flex items-center space-x-2 bg-slate-100/90 py-1.5 px-3 rounded-full border border-slate-200 text-xs text-slate-600">
                <div className="flex items-center space-x-1 text-emerald-700 font-medium text-[11px]">
                  <Server className="w-3 h-3" />
                  <span>주서버: 정상</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center space-x-1 text-cyan-700 font-medium text-[11px]">
                  <Usb className="w-3 h-3" />
                  <span>외장 USB 백업 연결</span>
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Dropdown (등급 명시) */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                현재 접속 심사원 (소속·등급)
              </label>
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
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs"
              >
                {allAuditors.map(aud => {
                  const badgeIcon = aud.isSystemAdmin ? '👑' : 
                                    aud.affiliation === '사무국직원' ? '🏢' :
                                    aud.affiliation === '소속심사원' ? '💼' : '👤';
                  const roleDesc = aud.isSystemAdmin ? '사무국 직원 · 시스템 총괄' :
                                   aud.affiliation === '사무국직원' ? '사무국 심사원' :
                                   aud.affiliation === '소속심사원' ? '소속 상근 심사원' : '비상근 심사원 (권한 격리)';
                  return (
                    <option key={aud.id} value={aud.id}>
                      {badgeIcon} {aud.name} ({roleDesc})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm border ${
              currentAuditorObj?.isSystemAdmin
                ? 'bg-purple-100 text-purple-900 border-purple-300'
                : currentAuditorObj?.affiliation === '사무국직원'
                ? 'bg-blue-100 text-blue-900 border-blue-300'
                : currentAuditorObj?.affiliation === '소속심사원'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              {currentAuditorObj?.isSystemAdmin ? 'SYS' : 
               currentAuditorObj?.affiliation === '사무국직원' ? 'HQ' :
               currentAuditorObj?.affiliation === '소속심사원' ? 'FULL' : 'PART'}
            </div>
          </div>
        </div>

        {/* 2. Tier-1 대메뉴 네비게이션 */}
        <div className="flex items-center justify-between border-b border-slate-100 py-1">
          <nav className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
            {mainCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
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

          {/* 소속 뱃지 안내 */}
          <div className="hidden md:flex items-center space-x-2 text-xs">
            <span className={`px-2.5 py-1 rounded-lg font-bold border ${
              currentAuditorObj.isSystemAdmin ? 'bg-purple-50 text-purple-800 border-purple-200' :
              currentAuditorObj.affiliation === '사무국직원' ? 'bg-blue-50 text-blue-800 border-blue-200' :
              currentAuditorObj.affiliation === '소속심사원' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {currentAuditorObj.name} ({currentAuditorObj.affiliation}{currentAuditorObj.isSystemAdmin ? ' · 시스템 총괄' : ''})
            </span>
          </div>
        </div>

        {/* 3. Tier-2 서브메뉴 네비게이션 */}
        {currentSubItems.length > 0 && (
          <div className="bg-slate-50/70 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 border-t border-slate-200/50">
            <nav className="flex space-x-1 overflow-x-auto no-scrollbar text-xs">
              {currentSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-cyan-50 text-cyan-900 border border-cyan-300 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
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
        )}

      </div>
    </header>
  );
};

