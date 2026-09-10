import React from 'react';
import { 
  Calendar, 
  Building2, 
  Users, 
  Award, 
  CheckCircle2, 
  FileText,
  UserCheck, 
  LogOut,
  ShieldCheck,
  User,
  Edit3,
  Mail
} from 'lucide-react';
import { Auditor } from '../types';

export type MainCategory = 
  | 'certification'
  | 'audit'
  | 'auditor-mgmt'
  | 'general-admin';

export type ActiveTab = 
  // 5대 핵심 메뉴
  | 'calendar'       // 대시보드
  | 'projects'       // 심사진행현황
  | 'clients'        // 고객관리
  | 'auditors'       // 심사원관리
  | 'certification'  // 인증관리 (유일한 하위메뉴 보유)
  // 심사원 포털 & 보고서 & 심의
  | 'portal'
  | 'reports'
  | 'committee'
  // 레거시 호환용
  | 'companies'
  | 'surveillance'
  | 'kab'
  | 'contracts'
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
  activeCategory = 'audit',
  setActiveCategory,
  urgentAlertCount = 0,
  currentUserRole,
  onSelectUserRole,
  allAuditors,
  pendingAdjustmentCount = 0,
  pendingCommitteeCount = 0,
  pendingSecretariatReviewCount = 0,
  onOpenEmailModal,
  onOpenProfileModal,
  onLogout
}) => {
  const currentAuditorObj = allAuditors.find(a => a.id === currentUserRole) || allAuditors[0];
  const isStaff = currentAuditorObj?.isSystemAdmin || currentAuditorObj?.affiliation === '상근' || currentUserRole === 'admin';
  const isRegularAuditor = !isStaff;

  // 사무국(상근) 5대 주요 메뉴
  const staffTabs = [
    { id: 'calendar' as ActiveTab, label: '대시보드', icon: Calendar, description: '월간 심사일정 & 통계' },
    { id: 'projects' as ActiveTab, label: '심사진행현황', icon: CheckCircle2, description: '심사진행 프로세스 대장 (Pre-Audit ~ Post-Audit)' },
    { id: 'clients' as ActiveTab, label: '고객관리', icon: Building2, description: '572개 고객사 계약 & 계획서 발송' },
    { id: 'auditors' as ActiveTab, label: '심사원관리', icon: Users, description: '36명 심사원 자격 & IAF 코드' },
    { id: 'certification' as ActiveTab, label: '인증관리', icon: Award, description: '규격·KAB·정산·자료·메일 (좌측 메뉴)' },
  ];

  // 비상근 심사원 메뉴
  const auditorTabs = [
    { id: 'calendar' as ActiveTab, label: '심사일정 달력', icon: Calendar },
    { id: 'portal' as ActiveTab, label: '나의 관리 대상 기업', icon: UserCheck },
    { id: 'reports' as ActiveTab, label: '나의 심사보고서', icon: FileText },
  ];
  if (currentAuditorObj?.isCommitteeMember) {
    auditorTabs.push({
      id: 'committee' as ActiveTab,
      label: '인증심의위원회',
      icon: Award
    });
  }

  const primaryTabs = isStaff ? staffTabs : auditorTabs;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="w-[96%] sm:w-[92%] lg:w-[90%] mx-auto max-w-[1850px] px-2 sm:px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Left: Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group shrink-0" 
            onClick={() => {
              if (isRegularAuditor) {
                setActiveTab('portal');
              } else {
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
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                  KAB 공인 인증기관
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">차세대 스마트 인증·심사 통합 관리 플랫폼</p>
            </div>
          </div>

          {/* 2. Center: 5 Primary Tabs (Single Row Clean Navbar) */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar mx-2">
            {primaryTabs.map((tabItem) => {
              const Icon = tabItem.icon;
              const isActive = activeTab === tabItem.id || (tabItem.id === 'clients' && activeTab === 'companies') || (tabItem.id === 'certification' && (activeTab === 'kab' || activeTab === 'surveillance' || activeTab === 'finance' || activeTab === 'data'));
              
              return (
                <button
                  key={tabItem.id}
                  onClick={() => {
                    setActiveTab(tabItem.id);
                    if (setActiveCategory) {
                      if (tabItem.id === 'certification') setActiveCategory('certification');
                      else if (tabItem.id === 'auditors') setActiveCategory('auditor-mgmt');
                      else setActiveCategory('audit');
                    }
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md ring-1 ring-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                  }`}
                  title={(tabItem as any).description || tabItem.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tabItem.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 3. Right: Portal Switcher + Profile + Actions + Logout */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Quick Email Dispatch Button */}
            <button
              type="button"
              onClick={onOpenEmailModal}
              className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition cursor-pointer"
              title="심사계획서 및 공문 스마트 메일 발송"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-600" />
              <span>스마트 메일</span>
            </button>

            {/* 사무국(관리자) vs 심사원 포털 1클릭 전환 버튼 */}
            {isStaff ? (
              <button
                type="button"
                onClick={() => {
                  const kim = allAuditors.find(a => a.name.includes('김홍덕')) || allAuditors[2];
                  onSelectUserRole(kim.id);
                  setActiveTab('portal');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-300 hover:border-cyan-300 text-xs font-semibold transition cursor-pointer shadow-2xs"
                title="비상근 심사원 포털 모드로 전환"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-700" />
                <span className="hidden sm:inline">심사원 포털</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onSelectUserRole('admin');
                  setActiveTab('calendar');
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xs text-xs font-semibold transition cursor-pointer"
                title="인증원 총괄 사무국(관리자) 화면으로 전환"
              >
                <Building2 className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">사무국 화면</span>
              </button>
            )}

            {/* Profile Button (원장/부원장/심사원 클릭 시 모달 오픈 및 내 심사포털 진입 가능) */}
            <button
              type="button"
              onClick={onOpenProfileModal}
              title="클릭하여 개인 정보, 심사비 계좌 및 내 심사포털로 진입합니다."
              className="flex items-center space-x-2 bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-400 px-3 py-1.5 rounded-full shadow-2xs transition group cursor-pointer text-left ring-0 hover:ring-2 hover:ring-blue-400/20"
            >
              {currentAuditorObj?.photoUrl ? (
                <img
                  src={currentAuditorObj.photoUrl}
                  alt={currentAuditorObj.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-500 shrink-0"
                />
              ) : (
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px] shrink-0 font-bold">
                  {currentAuditorObj?.isSystemAdmin ? '👑' : <User className="w-3 h-3 text-slate-600" />}
                </span>
              )}

              <span className="text-slate-800 font-bold text-xs group-hover:text-blue-900">
                {currentAuditorObj?.name}
                <span className="text-slate-500 font-normal ml-1 hidden md:inline">
                  ({currentAuditorObj?.isSystemAdmin ? '원장' : currentAuditorObj?.grade || '심사원'})
                </span>
              </span>

              <span className="p-0.5 rounded-full bg-slate-200/80 group-hover:bg-blue-200 text-slate-500 group-hover:text-blue-700 transition" title="개인정보 및 포털">
                <Edit3 className="w-2.5 h-2.5" />
              </span>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="시스템 로그아웃"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300 hover:border-rose-200 text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-500" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
