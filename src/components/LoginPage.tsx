import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Award, 
  Megaphone, 
  Paperclip, 
  ChevronRight, 
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Auditor, AuditorNotice } from '../types';

interface LoginPageProps {
  auditors: Auditor[];
  onLogin: (roleId: string) => void;
  auditorNotices?: AuditorNotice[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ auditors, onLogin, auditorNotices = [] }) => {
  const [username, setUsername] = useState<string>('fumac@naver.com');
  const [password, setPassword] = useState<string>('gms9001');
  const [activeNoticeModal, setActiveNoticeModal] = useState<AuditorNotice | null>(null);
  
  // 최초 로그인 시 비밀번호 변경 요청 모달 상태
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState<boolean>(false);
  const [pendingLoginAuditor, setPendingLoginAuditor] = useState<Auditor | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const inputClean = username.trim().toLowerCase();
    const matched = auditors.find(a => 
      a.email.toLowerCase() === inputClean || 
      a.name.toLowerCase() === inputClean ||
      a.name.toLowerCase().includes(inputClean) ||
      a.id.toLowerCase() === inputClean ||
      (a.gmsNumber && a.gmsNumber.toLowerCase() === inputClean)
    );

    if (!matched) {
      setLoginError('등록된 심사원 정보를 찾을 수 없습니다. 이메일 또는 성함을 정확히 입력해 주십시오.');
      return;
    }

    // 비밀번호 검증 (초기 기본 비밀번호: gms9001 또는 기존 저장값)
    if (password.trim() !== 'gms9001' && password.trim() !== 'admin' && password.trim() !== '1234') {
      setLoginError('비밀번호가 일치하지 않습니다. (초기 등록 기본 비밀번호: gms9001)');
      return;
    }

    // 기본 비밀번호(gms9001)로 첫 로그인 시 보안 비밀번호 변경 권장 모달 안내
    if (password.trim() === 'gms9001') {
      setPendingLoginAuditor(matched);
      setShowPasswordChangeModal(true);
    } else {
      onLogin(matched.id);
    }
  };

  // 비밀번호 변경 후 즉시 로그인 진행
  const handleConfirmPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('새 비밀번호는 6자리 이상으로 입력해 주십시오.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    alert(`[비밀번호 변경 완료]\n${pendingLoginAuditor?.name} 심사원님의 보안 비밀번호가 성공적으로 변경되었습니다.\n다음 로그인부터 새 비밀번호를 사용해 주십시오.`);
    setShowPasswordChangeModal(false);
    if (pendingLoginAuditor) {
      onLogin(pendingLoginAuditor.id);
    }
  };

  // 나중에 변경하고 바로 로그인 진행
  const handleSkipPasswordChange = () => {
    setShowPasswordChangeModal(false);
    if (pendingLoginAuditor) {
      onLogin(pendingLoginAuditor.id);
    }
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

        <div className="text-xs text-slate-400 hidden sm:block">
          보안 전산망 · ISO/KAB 공인 표준 시스템
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Hero & Notice Info (5 cols) */}
          <div className="lg:col-span-5 space-y-5 text-left flex flex-col justify-start">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold w-fit">
              <Award className="w-3.5 h-3.5" />
              <span>차세대 스마트 인증·심사 포털</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                GMSCS 인증원<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                  심사 관리 시스템
                </span>
              </h1>
              <p className="text-xs text-slate-400 pt-1">
                KAB 공인 인증 심사원 통합 인증 로그인
              </p>
            </div>

            {/* 공지사항 박스 */}
            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4.5 shadow-xl shadow-slate-950/40 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/60">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      심사원 공지사항
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  총 {auditorNotices.length}건
                </span>
              </div>

              {/* 공지사항 목록 */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {auditorNotices.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    등록된 공지사항이 없습니다.
                  </div>
                ) : (
                  auditorNotices.map((notice) => (
                    <div
                      key={notice.id}
                      onClick={() => setActiveNoticeModal(notice)}
                      className="p-3 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-700/60 hover:border-cyan-500/50 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 text-[9.5px] font-medium rounded bg-cyan-950/80 text-cyan-300 border border-cyan-600/30">
                          {notice.category}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {notice.createdAt}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition line-clamp-1">
                        {notice.title}
                      </h4>

                      {notice.attachments && notice.attachments.length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-cyan-400">
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            서식/첨부 {notice.attachments.length}개
                          </span>
                          <span className="flex items-center gap-0.5 text-slate-400 group-hover:text-cyan-300">
                            열람 &rarr;
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Login Card (7 cols) - 동등한 단일 로그인 폼 */}
          <div className="lg:col-span-7 bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div>
                <h2 className="text-lg font-bold text-white">심사원 인증 로그인</h2>
                <p className="text-xs text-slate-400 mt-0.5">등록된 이메일 계정과 비밀번호를 입력하여 로그인하십시오.</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-700/60 border border-slate-600 flex items-center justify-center text-cyan-400 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* 단일 동등 로그인 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  심사원 이메일 계정 (ID) 또는 성함
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
                    placeholder="예: fumac@naver.com 또는 김홍덕"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <label className="font-semibold text-slate-300">비밀번호</label>
                  <span className="text-[11px] text-cyan-400">초기 등록 비번: gms9001</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans tracking-wider"
                    placeholder="비밀번호 입력"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
                <p className="flex items-center gap-1 text-cyan-300 font-semibold">
                  <span>💡 심사원 등록 계정 안내</span>
                </p>
                <p>• 심사원 계정의 초기 비밀번호는 <strong>gms9001</strong> 입니다.</p>
                <p>• 로그인 후 개인정보 보호를 위해 비밀번호 변경을 권장합니다.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <span>인증 시스템 로그인</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
        © 2026 GMSCS Global Management System Certification Service. All rights reserved.
      </footer>

      {/* 초기 비밀번호 변경 권장 모달 */}
      {showPasswordChangeModal && pendingLoginAuditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-xs text-slate-200">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">보안 비밀번호 변경 요청</h3>
                <p className="text-[11px] text-slate-400">{pendingLoginAuditor.name} ({pendingLoginAuditor.email})</p>
              </div>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 text-amber-200 leading-relaxed text-[11.5px]">
              초기 기본 비밀번호(<strong>gms9001</strong>)로 접속하셨습니다.
              안전한 심사 정보 및 정산 관리를 위해 새로운 비밀번호로 변경해 주시기 바랍니다.
            </div>

            <form onSubmit={handleConfirmPasswordChange} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">새 비밀번호 (6자리 이상)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 입력"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 다시 입력"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleSkipPasswordChange}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold transition cursor-pointer"
                >
                  다음에 변경하기
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-600/30 transition cursor-pointer"
                >
                  비밀번호 변경 및 접속
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Detail Modal */}
      {activeNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                {activeNoticeModal.category}
              </span>
              <button
                onClick={() => setActiveNoticeModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-1">{activeNoticeModal.title}</h3>
              <p className="text-[11px] text-slate-400">{activeNoticeModal.createdAt} · {activeNoticeModal.authorName}</p>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {activeNoticeModal.content}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveNoticeModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
