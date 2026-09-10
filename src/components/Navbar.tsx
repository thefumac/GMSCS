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
  Mail, 
  Award, 
  DollarSign, 
  UserCheck, 
  CheckCircle2, 
  FileCheck,
  LogOut,
  Megaphone,
  Briefcase,
  FolderLock,
  User,
  Edit3
} from 'lucide-react';
import { Auditor } from '../types';

export type MainCategory = 
  | 'certification'
  | 'audit'
  | 'auditor-mgmt'
  | 'general-admin';

export type ActiveTab = 
  // 인증관리
  | 'companies' 
  | 'committee' 
  | 'surveillance' 
  | 'kab' 
  // 심사관리
  | 'calendar'
  | 'contracts'
  | 'reports' 
  | 'projects' 
  | 'integrations'
  // 심사원 관리
  | 'auditors' 
  | 'portal'
  // 일반관리
  | 'finance'
  | 'data'
  | 'notices';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeCategory: MainCategory;
  setActiveCategory: (cat: MainCategory) => void;
  urgentAlertCount: number;
  currentUserRole: string; // 'admin' | 'aud-3' | 'aud-hq-2' etc.
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
  activeCategory,
  setActiveCategory,
  urgentAlertCount,
  currentUserRole,
  onSelectUserRole,
  allAuditors,
  pendingAdjustmentCount = 1,
  pendingCommitteeCount = 2,
  pendingSecretariatReviewCount = 0,
  onOpenEmailModal,
  onOpenProfileModal,
  onLogout
}) => {
  const currentAuditorObj = allAuditors.find(a => a.id === currentUserRole) || allAuditors[0];
  const isStaff = currentAuditorObj?.isSystemAdmin || currentAuditorObj?.affiliation === '상근' || currentUserRole === 'admin';
  const isRegularAuditor = !isStaff;

  // 1-Tier: 상위 카테고리 정의 (상근 4인 전용 vs 비상근 심사원)
  const mainCategories: { id: MainCategory; label: string; icon: React.ComponentType<{ className?: string }>; defaultTab: ActiveTab; badge?: number; badgeColor?: string; description: string }[] = isRegularAuditor ? [] : [
    { 
      id: 'certification' as MainCategory, 
      label: '인증관리', 
      icon: Award,
      defaultTab: 'companies' as ActiveTab,
      description: '고객사현황·심의위원회·사후만료·KAB인정'
    },
    { 
      id: 'audit' as MainCategory, 
      label: '심사관리', 
      icon: Briefcase,
      defaultTab: 'calendar' as ActiveTab,
      badge: ((pendingAdjustmentCount || 0) + (pendingSecretariatReviewCount || 0)) > 0 
        ? ((pendingAdjustmentCount || 0) + (pendingSecretariatReviewCount || 0)) 
        : undefined,
      badgeColor: 'bg-amber-600',
      description: '월간일정·심사계약·보고서·OK ESG'
    },
    { 
      id: 'auditor-mgmt' as MainCategory, 
      label: '심사원 관리', 
      icon: Users,
      defaultTab: 'auditors' as ActiveTab,
      description: '자격대장·심의위원·심사원 포털'
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

  const subMenus: Record<MainCategory, SubMenuItem[]> = {
    'certification': [
      { id: 'companies', label: '고객사 인증현황 (572개사 전수)', icon: Building2 },
      { id: 'committee', label: '인증심의위원회', icon: Award, badge: pendingCommitteeCount, badgeColor: 'bg-indigo-600' },
      { id: 'surveillance', label: '사후 / 만료 관리 (D-Day)', icon: BellRing, badge: urgentAlertCount, badgeColor: 'bg-rose-600' },
      { id: 'kab', label: 'KAB 인정기관 관리 (공인기준·MD)', icon: Calculator },
    ],
    'audit': [
      { id: 'calendar', label: '심사일정 달력', icon: Calendar },
      { id: 'projects', label: '심사진행현황', icon: CheckCircle2 },
      { id: 'contracts', label: '심사계약 관리', icon: FileCheck, badge: pendingAdjustmentCount, badgeColor: 'bg-amber-600' },
      { 
        id: 'reports', 
        label: '심사보고서 관리', 
        icon: FileText, 
        badge: pendingSecretariatReviewCount && pendingSecretariatReviewCount > 0 ? pendingSecretariatReviewCount : undefined, 
        badgeColor: 'bg-amber-500' 
      },
      { id: 'email-dispatch', label: '메일 발송 센터', icon: Mail, onClick: onOpenEmailModal },
    ],
    'auditor-mgmt': [
      { id: 'auditors', label: '심사원 자격·코드 관리 (36명)', icon: Users },
      { id: 'portal', label: '심사원별 목록 (포털)', icon: UserCheck },
    ],
    'general-admin': [
      { id: 'finance', label: '재무관리 (수납 및 정산)', icon: DollarSign },
      { id: 'notices', label: '심사원 공지사항', icon: Megaphone },
      { id: 'data', label: '자료관리 (백업 및 설정)', icon: HardDrive },
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

  const regularAuditorItems: SubMenuItem[] = [
    { id: 'calendar', label: '심사일정 달력', icon: Calendar },
    { id: 'portal', label: '나의 관리 대상 기업 목록', icon: UserCheck },
    { id: 'reports', label: '나의 심사보고서 (작성 및 서명)', icon: FileText },
    { id: 'finance', label: '나의 심사비 정산 명세서 (3.3% 원천징수)', icon: DollarSign },
    { id: 'email-dispatch', label: '심사계획서/공문 메일 발송', icon: Mail, onClick: onOpenEmailModal },
  ];
  if (currentAuditorObj?.isCommitteeMember) {
    regularAuditorItems.push({
      id: 'committee',
      label: '인증심의위원회 안건 의결',
      icon: Award,
      badge: pendingCommitteeCount,
      badgeColor: 'bg-indigo-600'
    });
  }

  const currentSubItems = isRegularAuditor ? regularAuditorItems : (subMenus[activeCategory] || []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      
      {/* ========================================================================= */}
      {/* 1. 시스템 타이틀 영역 (Top System Bar) */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-200 bg-white">
        <div className="w-[95%] sm:w-[88%] lg:w-[85%] mx-auto max-w-[1800px] px-2 sm:px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Platform Name */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => {
                if (isRegularAuditor) {
                  setActiveCategory('auditor-mgmt');
                  setActiveTab('portal');
                } else {
                  setActiveCategory('audit');
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

            {/* Right: Mode Switcher + Current User Info + Logout */}
            <div className="flex items-center space-x-2.5">
              {/* 사무국(관리자) vs 심사원 포털 1클릭 전환 버튼 */}
              {isStaff ? (
                <button
                  type="button"
                  onClick={() => {
                    const kim = allAuditors.find(a => a.name.includes('김홍덕')) || allAuditors[2];
                    onSelectUserRole(kim.id);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-300 hover:border-cyan-300 text-xs font-medium transition cursor-pointer shadow-2xs"
                  title="김홍덕 심사원 전용 포털 화면으로 전환"
                >
                  <UserCheck className="w-3.5 h-3.5 text-cyan-700" />
                  <span>심사원 포털 보기</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onSelectUserRole('admin');
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xs text-xs font-semibold transition cursor-pointer"
                  title="인증원 총괄 사무국(관리자) 화면으로 전환"
                >
                  <Building2 className="w-3.5 h-3.5 text-white" />
                  <span>사무국 화면 보기</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenProfileModal}
                title="클릭하여 개인 정보, 심사비 지급방식(세금계산서/원천징수), 계좌, 자격현황을 수정합니다."
                className="flex items-center space-x-2 bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-400 px-3.5 py-1.5 rounded-full shadow-2xs transition group cursor-pointer text-left ring-0 hover:ring-2 hover:ring-blue-400/20"
              >
                {/* Photo or Default Avatar */}
                {currentAuditorObj?.photoUrl ? (
                  <img
                    src={currentAuditorObj.photoUrl}
                    alt={currentAuditorObj.name}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-500 shrink-0"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px] shrink-0">
                    {currentAuditorObj?.isSystemAdmin ? '👑' : <User className="w-3 h-3 text-slate-600" />}
                  </span>
                )}

                {currentAuditorObj?.isSystemAdmin ? (
                  <span className="text-amber-700 font-medium text-xs group-hover:text-amber-800">
                    {currentAuditorObj.name} (상근)
                  </span>
                ) : (
                  <span className="text-slate-700 font-medium text-xs group-hover:text-blue-900">
                    {currentAuditorObj?.name} ({currentAuditorObj?.grade} · {currentAuditorObj?.affiliation === '상근' ? '상근' : '비상근'})
                  </span>
                )}

                <span className="p-0.5 rounded-full bg-slate-200/80 group-hover:bg-blue-200 text-slate-500 group-hover:text-blue-700 transition ml-1" title="개인정보 및 지급방식 수정">
                  <Edit3 className="w-2.5 h-2.5" />
                </span>
              </button>

              {/* Logout Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="시스템 로그아웃"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300 hover:border-rose-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-500" />
                  <span>로그아웃</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 주 메뉴 영역 (Tier-1 Main Navigation Bar - 상근 4인 전용) */}
      {/* ========================================================================= */}
      {isStaff && (
        <div className="bg-slate-900 text-slate-100 border-b border-slate-800">
          <div className="w-[95%] sm:w-[88%] lg:w-[85%] mx-auto max-w-[1800px] px-2 sm:px-4">
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
                  onClick={onOpenEmailModal}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-300" />
                  <span>스마트 메일</span>
                </button>

                <span className="px-3 py-1 text-xs font-bold rounded-full border bg-amber-900/40 text-amber-200 border-amber-500/50">
                  {currentAuditorObj.name} · 상근
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 하위 메뉴 영역 (Tier-2 Sub Navigation Bar - 상근 및 심사원 공통 지원) */}
      {/* ========================================================================= */}
      {currentSubItems.length > 0 && (
        <div className="bg-slate-100/90 border-b border-slate-200 shadow-2xs">
          <div className="w-[95%] sm:w-[88%] lg:w-[85%] mx-auto max-w-[1800px] px-2 sm:px-4 py-2">
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
