import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle,
  LogIn
} from 'lucide-react';
import { Auditor } from '../types';
import { verifyPassword } from '../utils/authUtils';

interface LoginPageProps {
  auditors: Auditor[];
  onLogin: (roleId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ auditors, onLogin }) => {
  const [username, setUsername] = useState<string>('fumac@naver.com');
  const [password, setPassword] = useState<string>('gms9001');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const inputClean = username.trim().toLowerCase();
    if (!inputClean) {
      setLoginError('이메일 계정을 입력해 주십시오.');
      return;
    }

    // 1. 심사원 DB에서 이메일 또는 성함으로 사용자 식별
    let matched = auditors.find(a => 
      a.email.toLowerCase().trim() === inputClean || 
      a.name.toLowerCase().trim() === inputClean ||
      a.id.toLowerCase().trim() === inputClean ||
      (a.gmsNumber && a.gmsNumber.toLowerCase().trim() === inputClean)
    );

    // kgms2304@gmail.com 테스트 관리자 계정 특별 보장
    if (!matched && inputClean === 'kgms2304@gmail.com') {
      matched = auditors.find(a => a.name.includes('남효린')) || auditors.find(a => a.isSystemAdmin) || auditors[0];
    }

    if (!matched) {
      setLoginError('등록된 심사원 계정을 찾을 수 없습니다. 심사원 DB에 등록된 개인 이메일을 입력해 주십시오.');
      return;
    }

    // 2. 비밀번호 검증 (kgms2304@gmail.com의 경우 14001 및 기본 gms9001 허용)
    const isPassValid = verifyPassword(matched.id, inputClean === 'kgms2304@gmail.com' ? 'kgms2304@gmail.com' : matched.email, password);
    if (!isPassValid) {
      setLoginError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onLogin(matched.id);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-slate-800 antialiased font-sans selection:bg-cyan-600 selection:text-white">
      {/* 상단 미니 헤더 */}
      <div className="w-full py-4 px-6 flex justify-end items-center">
        <span className="text-xs text-slate-400 font-medium">KAB 공인 인증기관 · 보안 전산망</span>
      </div>

      {/* 중앙 메인 컨텐츠: 로고 + 제목 + 로그인 폼 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 -mt-10">
        <div className="w-full max-w-md space-y-7">
          
          {/* 1. 인증원 로고 및 타이틀 영역 */}
          <div className="text-center space-y-3">
            {/* 로고 이미지 */}
            <div className="flex justify-center items-center">
              <img 
                src="/gmscs_logo.png" 
                alt="GMSCS 로고" 
                className="h-16 w-auto object-contain drop-shadow-xs"
                onError={(e) => {
                  // 이미지 로드 실패 시 대체 로고 박스
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* 메인 타이틀 */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                GMSCS 인증관리 시스템
              </h1>
              <p className="text-xs font-medium text-slate-500">
                글로벌 경영시스템 인증원 (Global Management System Certification Service)
              </p>
            </div>
          </div>

          {/* 2. 로그인 창 카드 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-100/90 space-y-5">
            
            {/* 에러 메시지 안내 */}
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{loginError}</span>
              </div>
            )}

            {/* 로그인 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 이메일 계정 입력 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  계정 (개인 이메일)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-cyan-600 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 transition font-medium"
                    placeholder="등록된 이메일 (예: fumac@naver.com)"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    비밀번호
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">초기: gms9001</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-cyan-600 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 transition font-medium"
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-cyan-900/10 transition cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>로그인</span>
                  </>
                )}
              </button>
            </form>

            {/* 하단 안내 가이드 */}
            <div className="pt-4 border-t border-slate-100 space-y-1 text-[11px] text-slate-500 leading-relaxed bg-slate-50/60 -mx-7 sm:-mx-9 -mb-7 sm:-mb-9 p-4 rounded-b-3xl">
              <p className="flex items-center gap-1 font-semibold text-slate-700">
                <span>ℹ️ 계정 및 접속 안내</span>
              </p>
              <p>• 계정: 심사원 DB에 등록된 개인 이메일 (초기 비밀번호: <strong className="text-cyan-800 font-mono">gms9001</strong>)</p>
              <p>• 상근 직원 및 사무국 권한자는 접속 시 사무국 관리 화면으로 진입합니다.</p>
              <p>• 비밀번호 변경은 로그인 후 <strong className="text-slate-700">[개인포털 &gt; 개인정보]</strong>에서 가능합니다.</p>
            </div>
          </div>

        </div>
      </main>

      {/* 하단 카피라이트 푸터 */}
      <footer className="w-full py-5 text-center text-[11px] text-slate-400">
        <p>© {new Date().getFullYear()} GMSCS (Global Management System Certification Service). All rights reserved.</p>
      </footer>
    </div>
  );
};
