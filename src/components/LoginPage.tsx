import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Server, 
  Usb, 
  AlertCircle,
  Briefcase,
  Building2,
  Award
} from 'lucide-react';
import { Auditor } from '../types';

interface LoginPageProps {
  auditors: Auditor[];
  onLogin: (roleId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ auditors, onLogin }) => {
  const [selectedAuditorId, setSelectedAuditorId] = useState<string>('admin');
  const [password, setPassword] = useState<string>('******');
  const [username, setUsername] = useState<string>('ceo@gmscs.co.kr');

  // 계정 선택 시 이메일 자동 세팅
  const handleSelectAccount = (audId: string) => {
    setSelectedAuditorId(audId);
    const aud = auditors.find(a => a.id === audId);
    if (aud) {
      setUsername(aud.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedAuditorId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex flex-col justify-between text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Top Brand Banner */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-700/50 backdrop-blur-md bg-slate-900/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-tight text-white">GMSCS</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                KAB 공인 인증기관
              </span>
            </div>
            <p className="text-[11px] text-slate-400">글로벌 경영시스템 인증원 (Global Management System Certification Service)</p>
          </div>
        </div>

        {/* Server & Security Status Indicators */}
        <div className="hidden md:flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Server className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">주서버: 정상 가동</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <Usb className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">외장 USB 2중 백업 연결됨</span>
          </div>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero & Platform Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>차세대 스마트 인증·심사 포털 2.0</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                GMSCS 심사원 및<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                  사무국 통합 로그인
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                ISO 9001 · 14001 · 45001 및 ESG 경영시스템 인증 심사, 심사일정 달력, 공문 심사계획서 발송, 실시간 보고서 작성, 심사비(3.3%) 정산을 통합 관리합니다.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 text-xs text-slate-400 border-t border-slate-700/50">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>KAB 인정기준 준수 (불변 공식 표준 MD 기반 산출)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>소속별 권한 격리 (사무국 직원 / 소속 상근 / 비상근 심사원)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>2중 안전 백업 (로컬 주서버 + 외장 USB 물리 스토리지)</span>
              </div>
            </div>
          </div>

          {/* Right Login Card (7 cols) */}
          <div className="lg:col-span-7 bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div>
                <h2 className="text-lg font-bold text-white">심사원 인증 로그인</h2>
                <p className="text-xs text-slate-400">등록된 계정을 선택하거나 로그인 정보를 입력하세요.</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-700/60 border border-slate-600 flex items-center justify-center text-cyan-400 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            {/* Quick 1-Click Role Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>빠른 심사원 계정 선택 (데모/실무 프리셋)</span>
                <span className="text-[10px] text-cyan-400 font-normal">소속 등급별 권한 자동 부여</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. 남경호 대표이사 */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('admin')}
                  className={`p-3 rounded-2xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                    selectedAuditorId === 'admin'
                      ? 'bg-purple-950/50 border-purple-400 text-purple-100 ring-2 ring-purple-500/30'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-sm shrink-0">
                    👑
                  </div>
                  <div className="truncate text-xs">
                    <div className="font-extrabold text-white truncate">남경호 대표이사</div>
                    <div className="text-[10.5px] text-purple-300 truncate">사무국직원 · 시스템 총괄</div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5">전체 마스터 권한 (전체 300사)</div>
                  </div>
                </button>

                {/* 2. 박민우 선임심사원 (사무국 직원) */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('aud-3')}
                  className={`p-3 rounded-2xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                    selectedAuditorId === 'aud-3'
                      ? 'bg-blue-950/50 border-blue-400 text-blue-100 ring-2 ring-blue-500/30'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-sm shrink-0">
                    🏢
                  </div>
                  <div className="truncate text-xs">
                    <div className="font-extrabold text-white truncate">박민우 선임심사원</div>
                    <div className="text-[10.5px] text-blue-300 truncate">사무국 직원 (사무국 심사원)</div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5">전체 관리자 기능 접근</div>
                  </div>
                </button>

                {/* 3. 김철수 선임심사원 (소속 상근 심사원) */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('aud-1')}
                  className={`p-3 rounded-2xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                    selectedAuditorId === 'aud-1'
                      ? 'bg-emerald-950/50 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-sm shrink-0">
                    💼
                  </div>
                  <div className="truncate text-xs">
                    <div className="font-extrabold text-white truncate">김철수 선임심사원</div>
                    <div className="text-[10.5px] text-emerald-300 truncate">소속 상근 심사원</div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5">전체 시스템 메뉴 공유</div>
                  </div>
                </button>

                {/* 4. 이영희 심사원 (비상근 심사원) */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('aud-2')}
                  className={`p-3 rounded-2xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                    selectedAuditorId === 'aud-2'
                      ? 'bg-amber-950/50 border-amber-400 text-amber-100 ring-2 ring-amber-500/30'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-sm shrink-0">
                    👤
                  </div>
                  <div className="truncate text-xs">
                    <div className="font-extrabold text-white truncate">이영희 심사원</div>
                    <div className="text-[10.5px] text-amber-300 truncate">비상근 심사원 (외부/위촉)</div>
                    <div className="text-[9.5px] text-amber-400/90 mt-0.5">★ 배정 기업/보고서/수당 격리</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  심사원 이메일 계정 (ID)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    placeholder="name@gmscs.co.kr"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <label className="font-semibold text-slate-300">비밀번호</label>
                  <span className="text-[11px] text-cyan-400">보안 PIN 6자리</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono tracking-widest"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>시스템 접속 (로그인)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-700/50 flex items-start space-x-2.5 text-[11px] text-slate-400">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                본 시스템은 한국인정지원센터(KAB) 인가를 받은 GMSCS 공식 업무 전산망입니다. 비인가자의 접근은 엄격히 금지되며, 모든 감사 증적과 로그인 기록은 2중 안전 스토리지에 암호화 보관됩니다.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        Copyright © 2026 GMSCS (Global Management System Certification Service). All rights reserved.
      </footer>
    </div>
  );
};
