import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Paperclip, 
  ExternalLink, 
  Download, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  X, 
  Link2, 
  Calendar,
  Eye,
  UserCheck
} from 'lucide-react';
import { AuditorNotice, NoticeAttachment, Auditor } from '../types';

interface AuditorNoticeManagerProps {
  notices: AuditorNotice[];
  onAddNotice: (notice: AuditorNotice) => void;
  onUpdateNotice: (notice: AuditorNotice) => void;
  onDeleteNotice: (id: string) => void;
  currentUserRole: string;
  allAuditors: Auditor[];
}

export const AuditorNoticeManager: React.FC<AuditorNoticeManagerProps> = ({
  notices,
  onAddNotice,
  onUpdateNotice,
  onDeleteNotice,
  currentUserRole,
  allAuditors
}) => {
  const currentAuditor = allAuditors.find(a => a.id === currentUserRole) || allAuditors[0];
  
  // 상근 4인 여부 (대표이사, 부원장, 대리, 주임)
  const isOfficeStaff = currentAuditor.affiliation === '상근' || currentAuditor.isSystemAdmin;

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  
  // 모달 상태 (신규/수정)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  // 상세 보기 모달
  const [viewingNotice, setViewingNotice] = useState<AuditorNotice | null>(null);

  // 폼 입력 상태
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<AuditorNotice['category']>('심사지침');
  const [formTarget, setFormTarget] = useState<AuditorNotice['targetAudience']>('전체 심사원');
  const [formContent, setFormContent] = useState('');
  const [formIsUrgent, setFormIsUrgent] = useState(false);
  
  // 첨부파일 목록 관리
  const [attachments, setAttachments] = useState<NoticeAttachment[]>([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  // 폼 모달 열기 (신규 작성)
  const handleOpenCreateModal = () => {
    if (!isOfficeStaff) {
      alert('공지사항 작성은 GMSCS 사무국 4인(대표이사, 부원장, 대리, 주임)만 가능합니다.');
      return;
    }
    setEditingNoticeId(null);
    setFormTitle('');
    setFormCategory('심사지침');
    setFormTarget('전체 심사원');
    setFormContent('');
    setFormIsUrgent(false);
    setAttachments([]);
    setNewFileName('');
    setNewFileSize('');
    setNewFileUrl('');
    setIsFormModalOpen(true);
  };

  // 폼 모달 열기 (수정)
  const handleOpenEditModal = (notice: AuditorNotice) => {
    if (!isOfficeStaff) {
      alert('공지사항 수정 권한이 없습니다.');
      return;
    }
    setEditingNoticeId(notice.id);
    setFormTitle(notice.title);
    setFormCategory(notice.category);
    setFormTarget(notice.targetAudience);
    setFormContent(notice.content);
    setFormIsUrgent(!!notice.isUrgent);
    setAttachments(notice.attachments || []);
    setNewFileName('');
    setNewFileSize('');
    setNewFileUrl('');
    setIsFormModalOpen(true);
  };

  // 첨부파일 추가
  const handleAddAttachment = () => {
    if (!newFileName.trim()) {
      alert('파일명을 입력해 주세요.');
      return;
    }
    if (!newFileUrl.trim()) {
      alert('저장 링크(다운로드 URL)를 입력해 주세요.');
      return;
    }

    const newAtt: NoticeAttachment = {
      id: `att-${Date.now()}`,
      fileName: newFileName.trim(),
      fileSize: newFileSize.trim() || '웹링크',
      fileUrl: newFileUrl.trim(),
      fileType: newFileName.split('.').pop()?.toUpperCase() || 'LINK'
    };

    setAttachments([...attachments, newAtt]);
    setNewFileName('');
    setNewFileSize('');
    setNewFileUrl('');
  };

  // 첨부파일 삭제
  const handleRemoveAttachment = (attId: string) => {
    setAttachments(attachments.filter(a => a.id !== attId));
  };

  // 공지사항 저장 제출
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('공지 제목을 입력해 주세요.');
      return;
    }
    if (!formContent.trim()) {
      alert('공지 본문 내용을 입력해 주세요.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (editingNoticeId) {
      // 수정
      const updated: AuditorNotice = {
        id: editingNoticeId,
        title: formTitle.trim(),
        category: formCategory,
        targetAudience: formTarget,
        content: formContent.trim(),
        isUrgent: formIsUrgent,
        authorName: currentAuditor.name,
        authorRole: currentAuditor.grade,
        authorId: currentAuditor.id,
        createdAt: today,
        attachments: attachments
      };
      onUpdateNotice(updated);
      alert('공지사항이 성공적으로 수정되었습니다.');
    } else {
      // 신규 등록
      const created: AuditorNotice = {
        id: `not-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        targetAudience: formTarget,
        content: formContent.trim(),
        isUrgent: formIsUrgent,
        authorName: currentAuditor.name,
        authorRole: currentAuditor.grade,
        authorId: currentAuditor.id,
        createdAt: today,
        attachments: attachments
      };
      onAddNotice(created);
      alert('공지사항이 로그인 화면 및 전 시스템에 성공적으로 등록·게시되었습니다.');
    }

    setIsFormModalOpen(false);
  };

  // 필터링된 공지 목록
  const filteredNotices = notices.filter(n => {
    const matchesCategory = selectedCategory === '전체' || n.category === selectedCategory;
    const matchesKeyword = 
      n.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      n.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      n.authorName.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  const totalAttachmentsCount = notices.reduce((acc, curr) => acc + (curr.attachments?.length || 0), 0);
  const urgentCount = notices.filter(n => n.isUrgent).length;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
              <Megaphone className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                심사원 공지사항 관리 센터
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  사무국 공식 게시판
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                KAB 공문, 심사보고서 개정 서식, 현장 지침을 등록하면 **로그인 화면**과 심사원 포털에 즉시 실시간 동기화 배포됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 작성 권한 안내 및 작성 버튼 */}
        <div className="flex items-center space-x-3">
          {isOfficeStaff ? (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>새 심사원 공지 등록 (파일/링크 첨부)</span>
            </button>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>사무국 4인 전용 게시판 (심사원 열람 모드)</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">전체 등록 공지</div>
            <div className="text-xl font-black text-slate-900">{notices.length}건</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">긴급 지침 공지</div>
            <div className="text-xl font-black text-rose-600">{urgentCount}건</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Paperclip className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">배포 첨부파일 / 저장링크</div>
            <div className="text-xl font-black text-indigo-600">{totalAttachmentsCount}개</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">게시 권한 사무국 4인</div>
            <div className="text-xs font-bold text-slate-800 truncate">남경호·정현일·이혜원·남효린</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {['전체', '긴급', 'KAB기준', '심사지침', '서식배포', '일반공지'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="공지 제목, 본문, 작성자 검색..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            검색 조건에 일치하는 공지사항이 없습니다.
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5 flex-wrap">
                  {notice.isUrgent ? (
                    <span className="px-2 py-0.5 rounded-md text-xs font-black bg-rose-600 text-white shadow-xs">
                      긴급 지침
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                      {notice.category}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    대상: {notice.targetAudience}
                  </span>
                  <span className="text-xs text-slate-500">
                    등록일: {notice.createdAt}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    작성자: {notice.authorName} ({notice.authorRole})
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setViewingNotice(notice)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>상세보기</span>
                  </button>

                  {isOfficeStaff && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(notice)}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`'${notice.title}' 공지사항을 삭제하시겠습니까?`)) {
                            onDeleteNotice(notice.id);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Title & Preview Content */}
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed whitespace-pre-wrap font-sans">
                  {notice.content}
                </p>
              </div>

              {/* Attachments Section */}
              {notice.attachments && notice.attachments.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-600" />
                    <span>첨부파일 및 저장 링크 ({notice.attachments.length}개)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {notice.attachments.map(att => (
                      <div
                        key={att.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                          <div className="truncate text-xs">
                            <span className="font-bold text-slate-800 truncate block">
                              {att.fileName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {att.fileSize} · {att.fileUrl.substring(0, 32)}...
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md bg-cyan-50 hover:bg-cyan-100 text-cyan-700 transition"
                            title="다운로드 / 저장 링크 열기"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 신규 등록 및 수정 모달 */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                  <Megaphone className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingNoticeId ? '심사원 공지사항 수정' : '새 심사원 공지사항 등록'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto pr-1 space-y-4 text-left">
              
              {/* 구분 및 대상 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    공지 구분
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AuditorNotice['category'])}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  >
                    <option value="심사지침">심사지침</option>
                    <option value="KAB기준">KAB기준</option>
                    <option value="서식배포">서식배포</option>
                    <option value="일반공지">일반공지</option>
                    <option value="긴급">긴급</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    공지 대상
                  </label>
                  <select
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value as AuditorNotice['targetAudience'])}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  >
                    <option value="전체 심사원">전체 심사원</option>
                    <option value="비상근심사원 전용">비상근심사원 전용</option>
                    <option value="사무국 내부">사무국 내부</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center space-x-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={formIsUrgent}
                      onChange={(e) => setFormIsUrgent(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                    />
                    <span className="text-xs font-bold text-rose-600">긴급 배지 표시</span>
                  </label>
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  공지 제목
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="예: [긴급/지침] 2026년 KAB 인정기준 개정 안내 및 서식 준수 철저"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* 본문 내용 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  공지 본문 내용
                </label>
                <textarea
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="심사원들께 전달할 공지 상세 내용을 입력하십시오..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                  required
                />
              </div>

              {/* 첨부파일 및 저장 링크 섹션 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-cyan-600" />
                    파일 첨부 및 클라우드/서버 저장 링크 추가
                  </span>
                  <span className="text-[11px] text-slate-500">
                    현재 {attachments.length}개 추가됨
                  </span>
                </div>

                {/* 입력 인풋 */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="파일명 (예: KAB_규정.pdf)"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newFileSize}
                      onChange={(e) => setNewFileSize(e.target.value)}
                      placeholder="용량 (예: 2.4MB)"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="url"
                      value={newFileUrl}
                      onChange={(e) => setNewFileUrl(e.target.value)}
                      placeholder="저장 링크 (https://...)"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
                    >
                      + 추가
                    </button>
                  </div>
                </div>

                {/* 첨부 리스트 */}
                {attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          <span className="font-bold text-slate-800 truncate">{att.fileName}</span>
                          <span className="text-[10px] text-slate-400">({att.fileSize})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
                >
                  {editingNoticeId ? '수정 내용 저장' : '공지사항 즉시 게시'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 상세보기 모달 */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1.5 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {viewingNotice.isUrgent ? (
                    <span className="px-2 py-0.5 text-xs font-black rounded-md bg-rose-600 text-white">
                      긴급
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-cyan-100 text-cyan-800 border border-cyan-200">
                      {viewingNotice.category}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">
                    대상: {viewingNotice.targetAudience}
                  </span>
                  <span className="text-xs text-slate-400">
                    · 등록일: {viewingNotice.createdAt}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {viewingNotice.title}
                </h3>
                <div className="text-xs text-slate-600">
                  작성자: <strong className="text-slate-800">{viewingNotice.authorName}</strong> ({viewingNotice.authorRole})
                </div>
              </div>
              <button
                onClick={() => setViewingNotice(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 whitespace-pre-wrap font-sans">
                {viewingNotice.content}
              </div>

              {viewingNotice.attachments && viewingNotice.attachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-cyan-600" />
                    <span>첨부파일 및 저장 링크 ({viewingNotice.attachments.length}개)</span>
                  </div>
                  <div className="space-y-2">
                    {viewingNotice.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {file.fileName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {file.fileSize} · {file.fileUrl}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(file.fileUrl);
                              alert('저장 링크 URL이 복사되었습니다.');
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                          >
                            링크 복사
                          </button>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1"
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

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingNotice(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
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
