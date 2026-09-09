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
  Usb
} from 'lucide-react';

export type ActiveTab = 
  | 'calendar' 
  | 'report' 
  | 'surveillance' 
  | 'companies' 
  | 'auditors' 
  | 'kab' 
  | 'billing' 
  | 'backup' 
  | 'integrations';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  urgentAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  urgentAlertCount 
}) => {
  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'calendar', label: '종합 캘린더', icon: Calendar },
    { id: 'report', label: '웹 심사보고서/서명', icon: FileText },
    { id: 'surveillance', label: '사후관리/만료관리', icon: BellRing, badge: urgentAlertCount },
    { id: 'companies', label: '고객사 관리(300사)', icon: Building2 },
    { id: 'auditors', label: '심사원 관리', icon: Users },
    { id: 'kab', label: 'KAB MD/비용조정', icon: Calculator },
    { id: 'billing', label: '수납/계산서', icon: Receipt },
    { id: 'backup', label: '서버/외장백업', icon: HardDrive },
    { id: 'integrations', label: 'OK ESG & ISO-Record', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200/90 shadow-sm backdrop-blur-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('calendar')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">GMSCS</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                  ISO 인증기관
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">차세대 스마트 인증·심사 통합 관리 플랫폼</p>
            </div>
          </div>

          {/* Infrastructure & Security Status */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-100/90 py-1.5 px-3 rounded-full border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
              <Server className="w-3.5 h-3.5" />
              <span>사내 주서버: 정상 (PostgreSQL)</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-1.5 text-cyan-700 font-medium">
              <Usb className="w-3.5 h-3.5" />
              <span>외장 백업 유닛: 마운트됨 (USB 3.0)</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">KAB 규정 준수</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">GMSCS 사무국 (운영총괄)</div>
              <div className="text-[10px] text-slate-500">admin@gmscs.co.kr</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm">
              GM
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 no-scrollbar text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-800 border border-cyan-300/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
