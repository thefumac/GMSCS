import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Server, 
  Usb, 
  AlertCircle,
  Award,
  Megaphone,
  Paperclip,
  ExternalLink,
  Download,
  Calendar,
  ChevronRight,
  X,
  FileText,
  Building
} from 'lucide-react';
import { Auditor, AuditorNotice } from '../types';

interface LoginPageProps {
  auditors: Auditor[];
  onLogin: (roleId: string) => void;
  auditorNotices?: AuditorNotice[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ auditors, onLogin, auditorNotices = [] }) => {
  const [selectedAuditorId, setSelectedAuditorId] = useState<string>('admin');
  const [password, setPassword] = useState<string>('******');
  const [username, setUsername] = useState<string>('ceo@gmscs.co.kr');
  const [activeNoticeModal, setActiveNoticeModal] = useState<AuditorNotice | null>(null);

  // 계정 선택 시 이메일 자동 세팅
  const handleSelectAccount = (audId: string) => {
    setSelectedAuditorId(audId);
    const aud = auditors.find(a => a.id === audId);
    if (aud) {
      setUsername(aud.email);
    }
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    const inputClean = val.trim().toLowerCase();
    const matched = auditors.find(a => 
      a.email.toLowerCase() === inputClean || 
      a.name.toLowerCase() === inputClean ||
      a.id.toLowerCase() === inputClean
    );
    if (matched) {
      setSelectedAuditorId(matched.id);
    } else {
      setSelectedAuditorId('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputClean = username.trim().toLowerCase();
    const matched = auditors.find(a => 
      a.email.toLowerCase() === inputClean || 
      a.name.toLowerCase() === inputClean ||
      a.name.toLowerCase().includes(inputClean) ||
      a.id.toLowerCase() === inputClean
    );

    if (matched) {
      onLogin(matched.id);
    } else if (selectedAuditorId) {
      onLogin(selectedAuditorId);
    } else {
      alert('입력하신 계정 정보를 확인해 주세요. 등록된 심사원 이메일 또는 성함을 입력하여 로그인할 수 있습니다.');
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
            <span className="font-semibold text-[11px]">원외 3차 DR 백업 연동됨</span>
          </div>
        </div>
      </header>

      {/* Main Login Container - items-start로 왼쪽 헤더와 오른쪽 카드 최상단 수평 정렬 */}
      <main className="flex-1 flex items-start justify-center p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Hero & Platform Info (5 cols) */}
          <div className="lg:col-span-5 space-y-5 text-left flex flex-col justify-start">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold w-fit">
              <Award className="w-3.5 h-3.5" />
              <span>차세대 스마트 인증·심사 포털 2.0</span>
            </div>

            {/* 변경된 브랜드 타이틀 (GMSCS인증원 / 심사 관리 시스템) */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                GMSCS인증원<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                  심사 관리 시스템
                </span>
              </h1>
              <p className="text-xs text-slate-400 pt-1">
                KAB 공인 심사원 및 인증사무국 전용 통합 전산망
              </p>
            </div>

            {/* 심사원 공지사항 박스 (사무국 4인 공식 공지 및 파일/저장링크 다운로드) */}
            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4.5 shadow-xl shadow-slate-950/40 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/60">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      심사원 공지사항
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-cyan-900/80 text-cyan-300 border border-cyan-700/60">
                        사무국 공식
                      </span>
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  총 {auditorNotices.length}건
                </span>
              </div>

              {/* 공지사항 목록 */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {auditorNotices.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    등록된 심사원 공지사항이 없습니다.
                  </div>
                ) : (
                  auditorNotices.map((notice) => (
                    <div
                      key={notice.id}
                      onClick={() => setActiveNoticeModal(notice)}
                      className="p-3 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-700/60 hover:border-cyan-500/50 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {notice.isUrgent ? (
                            <span className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-rose-950/80 text-rose-300 border border-rose-600/40">
                              긴급
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[9.5px] font-medium rounded bg-cyan-950/80 text-cyan-300 border border-cyan-600/30">
                              {notice.category}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            {notice.authorName} ({notice.authorRole.split('/')[0].trim()})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {notice.createdAt}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition line-clamp-1">
                        {notice.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {notice.content}
                      </p>

                      {/* 첨부파일 및 링크 뱃지 */}
                      {notice.attachments && notice.attachments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-cyan-400">
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            첨부파일/저장링크 {notice.attachments.length}개
                          </span>
                          <span className="flex items-center gap-0.5 text-slate-400 group-hover:text-cyan-300">
                            상세보기 <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-1 text-center">
                <p className="text-[10px] text-slate-500">
                  * 공지사항 등록 및 첨부파일 관리는 <strong>[일반관리] - [심사원 공지사항]</strong>에서 가능합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Right Login Card (7 cols) */}
          <div className="lg:col-span-7 bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div>
                <h2 className="text-lg font-bold text-white">심사원 인증 로그인</h2>
                <p className="text-xs text-slate-400">사무국 직원은 빠른 선택을 이용하시고, 외촉/비상근 심사원은 계정 정보를 직접 입력하여 로그인하십시오.</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-700/60 border border-slate-600 flex items-center justify-center text-cyan-400 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            {/* Quick 1-Click Role Presets (사무국 4인 전용) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>빠른 심사원 계정 선택 (데모/실무 프리셋)</span>
                <span className="text-[10px] text-cyan-400 font-normal">소속 등급별 권한 자동 부여</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. 남경호 대표이사 / 수석심사원 */}
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
                    <div className="text-[10.5px] text-purple-300 truncate">수석심사원(선임) · 시스템총괄</div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5">사무국 마스터 권한 (300사 총괄)</div>
                  </div>
                </button>

                {/* 2. 정현일 부원장 (선임심사원) */}
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
                    <div className="font-extrabold text-white truncate">정현일 부원장</div>
                    <div className="text-[10.5px] text-blue-300 truncate">사무국 선임심사원 (심의부위원장)</div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5">사무국 관리자 전 기능 접근</div>
                  </div>
                </button>

                {/* 3. 이혜원 대리 (심사원) */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('aud-hq-2')}
                  className={`p-3 rounded-2xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                    selectedAuditorId === 'aud-hq-2'
                      ? 'bg-blue-950/50 border-blue-400 text-blue-100 ring-2 ring-blue-500/30'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-sm shrink-0">
                    🏢
                  </div>
                  <div className="truncate text-xs">
                    <div className="font-extrabold text-white truncate">이혜원 대리</div>
                    <div className="text-[10.5px] text-blue-300 truncate">사무국 정심사원 (심의간사)</div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5">사무국 인증·심사 관리 권한</div>
                  </div>
                </button>

                {/* 4. 남효린 주임 (심사원보) */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('aud-hq-3')}
                  className={`p-3 rounded-2xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                    selectedAuditorId === 'aud-hq-3'
                      ? 'bg-blue-950/50 border-blue-400 text-blue-100 ring-2 ring-blue-500/30'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-sm shrink-0">
                    🏢
                  </div>
                  <div className="truncate text-xs">
                    <div className="font-extrabold text-white truncate">남효린 주임</div>
                    <div className="text-[10.5px] text-blue-300 truncate">사무국 심사원보 (행정/전산)</div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5">사무국 전체 메뉴 접근 권한</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  심사원 이메일 계정 (ID) 또는 성함
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    placeholder="이메일 또는 성함 입력 (예: name@gmscs.co.kr)"
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

      {/* 심사원 공지사항 상세 모달 */}
      {activeNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1.5 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {activeNoticeModal.isUrgent ? (
                    <span className="px-2 py-0.5 text-xs font-black rounded-md bg-rose-600 text-white shadow-sm">
                      긴급
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-cyan-600/30 text-cyan-300 border border-cyan-500/40">
                      {activeNoticeModal.category}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    대상: {activeNoticeModal.targetAudience}
                  </span>
                  <span className="text-xs text-slate-500">
                    · 등록일: {activeNoticeModal.createdAt}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                  {activeNoticeModal.title}
                </h3>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <span className="font-semibold text-slate-300">{activeNoticeModal.authorName}</span>
                  <span className="text-slate-500">({activeNoticeModal.authorRole})</span>
                </div>
              </div>

              <button
                onClick={() => setActiveNoticeModal(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 whitespace-pre-wrap font-sans">
                {activeNoticeModal.content}
              </div>

              {/* 첨부파일 및 외부/클라우드 저장 링크 영역 */}
              {activeNoticeModal.attachments && activeNoticeModal.attachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                    <Paperclip className="w-4 h-4 text-cyan-400" />
                    <span>첨부파일 및 공식 배포 저장 링크 ({activeNoticeModal.attachments.length}개)</span>
                  </div>

                  <div className="space-y-2">
                    {activeNoticeModal.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-700/80 flex items-center justify-between gap-3 hover:border-cyan-500/50 transition"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-200 truncate">
                              {file.fileName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              {file.fileSize && <span>{file.fileSize}</span>}
                              <span className="text-cyan-400/80 truncate max-w-[260px]">
                                {file.fileUrl}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(file.fileUrl);
                              alert('저장 링크 URL이 클립보드에 복사되었습니다.');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition cursor-pointer"
                          >
                            링크 복사
                          </button>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>다운로드</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveNoticeModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
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
