import React, { useState } from 'react';
import {
  Award,
  Calculator,
  DollarSign,
  HardDrive,
  Mail,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Pencil,
  Sparkles,
  Clock,
  MapPin,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Send,
  Building2,
  Users,
  FileText,
  Bell,
  Search,
  BookOpen
} from 'lucide-react';
import { Auditor, Company, AuditProject, AuditorSettlement, CommitteeScheduleItem } from '../types';
import { 
  DEFAULT_COMMITTEE_RULE, 
  CommitteeScheduleRule, 
  generateYearlyCommitteeSchedules,
  loadSavedCommitteeRule,
  saveCommitteeRule,
  saveCommitteeSchedules,
  InstituteEventItem,
  loadSavedInstituteEvents,
  saveInstituteEvents
} from '../utils/committeeSchedule';
import { GMS_AVAILABLE_STANDARDS } from '../constants/standards';
import {
  AuditReportNoticeItem,
  loadAuditReportNotices,
  saveAuditReportNotices,
  DEFAULT_AUDIT_REPORT_NOTICES
} from '../utils/auditReportNotices';

export type CertSubTab = 'standards' | 'reportNotices' | 'committee' | 'events' | 'kab' | 'settlements' | 'general' | 'mail';

export interface CertificationManagementProps {
  auditors: Auditor[];
  companies: Company[];
  projects: AuditProject[];
  settlements?: AuditorSettlement[];
  committeeSchedules?: CommitteeScheduleItem[];
  onUpdateCommitteeSchedules?: (schedules: CommitteeScheduleItem[]) => void;
  onOpenEmailModal?: () => void;
  onUpdateSettlementStatus?: (settlementId: string, status: '정산대기' | '지급완료') => void;
}

export const CertificationManagement: React.FC<CertificationManagementProps> = ({
  auditors,
  companies,
  projects,
  settlements = [],
  committeeSchedules = [],
  onUpdateCommitteeSchedules,
  onOpenEmailModal,
  onUpdateSettlementStatus
}) => {
  const [activeSubTab, setActiveSubTab] = useState<CertSubTab>('standards');
  const [backupMessage, setBackupMessage] = useState<string>('');

  // 심의위원회 일정 설정 상태
  const [commRule, setCommRule] = useState<CommitteeScheduleRule>(() => loadSavedCommitteeRule());
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editSession, setEditSession] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [isAddingNewSchedule, setIsAddingNewSchedule] = useState<boolean>(false);
  const [newDate, setNewDate] = useState<string>('2026-09-24');
  const [newSession, setNewSession] = useState<string>('제2026-09차 임시 심의위원회');
  const [newTime, setNewTime] = useState<string>('14:00');

  // 인정원 행사 일정 관리 상태
  const [instituteEvents, setInstituteEvents] = useState<InstituteEventItem[]>(() => loadSavedInstituteEvents());
  const [eventCategory, setEventCategory] = useState<'심사원교육' | '심사원세미나' | '고객세미나' | '교육' | '직접입력'>('심사원교육');
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [eventTitle, setEventTitle] = useState<string>('2026 하반기 심사원 역량강화 교육');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventStartTime, setEventStartTime] = useState<string>('09:00');
  const [eventEndTime, setEventEndTime] = useState<string>('17:30');
  const [eventLocation, setEventLocation] = useState<string>('GMSCS 본원 세미나실');
  const [eventTargetAudience, setEventTargetAudience] = useState<string>('선임심사원 및 심사원');
  const [eventNotes, setEventNotes] = useState<string>('');

  // 심사보고서 작성 공지 관리 상태
  const [reportNotices, setReportNotices] = useState<AuditReportNoticeItem[]>(() => loadAuditReportNotices());
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<string>('all');
  const [noticeSearchTerm, setNoticeSearchTerm] = useState<string>('');
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticeCategoryInput, setNoticeCategoryInput] = useState<string>('공통사항');
  const [noticeStandardNameInput, setNoticeStandardNameInput] = useState<string>('전 규격 공통');
  const [noticeTitleInput, setNoticeTitleInput] = useState<string>('');
  const [noticeContentInput, setNoticeContentInput] = useState<string>('');
  const [noticePriorityInput, setNoticePriorityInput] = useState<'필독' | '중요' | '일반'>('중요');
  const [noticeAuthorInput, setNoticeAuthorInput] = useState<string>('GMSCS 인증원 사무국');
  const [isAddingNewNotice, setIsAddingNewNotice] = useState<boolean>(false);
  const [noticeSaveSuccess, setNoticeSaveSuccess] = useState<boolean>(false);

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitleInput.trim() || !noticeContentInput.trim()) {
      alert('공지 제목과 공지 내용을 모두 입력해주세요.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let updated: AuditReportNoticeItem[];

    if (editingNoticeId) {
      updated = reportNotices.map(n => {
        if (n.id === editingNoticeId) {
          return {
            ...n,
            category: noticeCategoryInput,
            standardName: noticeStandardNameInput,
            title: noticeTitleInput.trim(),
            content: noticeContentInput.trim(),
            priority: noticePriorityInput,
            author: noticeAuthorInput.trim() || 'GMSCS 인증원 사무국',
            updatedAt: todayStr
          };
        }
        return n;
      });
    } else {
      const newNotice: AuditReportNoticeItem = {
        id: `notice-custom-${Date.now()}`,
        category: noticeCategoryInput,
        standardName: noticeStandardNameInput,
        title: noticeTitleInput.trim(),
        content: noticeContentInput.trim(),
        priority: noticePriorityInput,
        author: noticeAuthorInput.trim() || 'GMSCS 인증원 사무국',
        updatedAt: todayStr
      };
      updated = [newNotice, ...reportNotices];
    }

    setReportNotices(updated);
    saveAuditReportNotices(updated);
    setIsAddingNewNotice(false);
    setEditingNoticeId(null);
    setNoticeTitleInput('');
    setNoticeContentInput('');
    setNoticeSaveSuccess(true);
    setTimeout(() => setNoticeSaveSuccess(false), 2500);
  };

  const handleStartEditNotice = (n: AuditReportNoticeItem) => {
    setEditingNoticeId(n.id);
    setNoticeCategoryInput(n.category);
    setNoticeStandardNameInput(n.standardName || (n.category === '공통사항' ? '전 규격 공통' : ''));
    setNoticeTitleInput(n.title);
    setNoticeContentInput(n.content);
    setNoticePriorityInput(n.priority);
    setNoticeAuthorInput(n.author);
    setIsAddingNewNotice(true);
  };

  const handleDeleteNotice = (id: string) => {
    if (window.confirm('이 공지사항을 삭제하시겠습니까? 심사보고서 작성 워크벤치에서도 삭제됩니다.')) {
      const updated = reportNotices.filter(n => n.id !== id);
      setReportNotices(updated);
      saveAuditReportNotices(updated);
    }
  };

  const handleRestoreDefaultNotices = () => {
    if (window.confirm('기본 인증원 심사보고서 작성 표준 공지사항(11건)으로 복원하시겠습니까?')) {
      setReportNotices(DEFAULT_AUDIT_REPORT_NOTICES);
      saveAuditReportNotices(DEFAULT_AUDIT_REPORT_NOTICES);
      setNoticeSaveSuccess(true);
      setTimeout(() => setNoticeSaveSuccess(false), 2500);
    }
  };

  // 1. 인증가능 규격 데이터 (공통 상수 참조)
  const availableStandards = GMS_AVAILABLE_STANDARDS;

  // 2. KAB MD 기준표 데이터
  const kabMdStandards = [
    { scale: '1~5인', initialStage1: 0.5, initialStage2: 1.0, initialTotal: 1.5, surv: 1.0, recert: 1.0 },
    { scale: '6~10인', initialStage1: 0.5, initialStage2: 1.5, initialTotal: 2.0, surv: 1.0, recert: 1.5 },
    { scale: '11~25인', initialStage1: 1.0, initialStage2: 1.5, initialTotal: 2.5, surv: 1.0, recert: 1.5 },
    { scale: '26~45인', initialStage1: 1.0, initialStage2: 2.0, initialTotal: 3.0, surv: 1.5, recert: 2.0 },
    { scale: '46~65인', initialStage1: 1.0, initialStage2: 2.5, initialTotal: 3.5, surv: 1.5, recert: 2.5 },
    { scale: '66~85인', initialStage1: 1.5, initialStage2: 2.5, initialTotal: 4.0, surv: 1.5, recert: 2.5 },
    { scale: '86~125인', initialStage1: 1.5, initialStage2: 3.0, initialTotal: 4.5, surv: 2.0, recert: 3.0 },
    { scale: '126~175인', initialStage1: 1.5, initialStage2: 3.5, initialTotal: 5.0, surv: 2.0, recert: 3.5 },
    { scale: '176~275인', initialStage1: 2.0, initialStage2: 4.0, initialTotal: 6.0, surv: 2.5, recert: 4.0 },
    { scale: '276~425인', initialStage1: 2.0, initialStage2: 5.0, initialTotal: 7.0, surv: 3.0, recert: 4.5 },
    { scale: '426~625인', initialStage1: 2.5, initialStage2: 5.5, initialTotal: 8.0, surv: 3.0, recert: 5.0 },
  ];

  // 요일 이름 헬퍼
  const getDayOfWeekName = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const names = ['일', '월', '화', '수', '목', '금', '토'];
    return names[d.getDay()] || '';
  };

  // 30분 단위 시간 슬롯 배열 (08:00 ~ 22:00)
  const TIME_SLOTS_30MIN = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  // 심의위원회 일정 재산출 (기본 규칙 적용: 1,3주 / 2,4주 또는 단일주차)
  const handleRegenerateCommitteeSchedules = () => {
    const ruleStr = String(commRule.nthWeek);
    const ruleDesc = ruleStr === '1,3' ? '1,3주 (월 2회)' :
                     ruleStr === '2,4' ? '2,4주 (월 2회)' :
                     `${ruleStr}째주 (월 1회)`;
    const dayName = ['일', '월', '화', '수', '목', '금', '토'][commRule.dayOfWeek] || '목요일';

    if (window.confirm(`매월 ${ruleDesc} ${dayName}(기본 ${commRule.time}) 규칙으로 2026년 일정을 다시 산출하시겠습니까?\n기존에 수동 추가된 일정도 초기화됩니다.`)) {
      saveCommitteeRule(commRule);
      const generated = generateYearlyCommitteeSchedules(2026, commRule);
      saveCommitteeSchedules(generated);
      onUpdateCommitteeSchedules?.(generated);
    }
  };

  // 인정원 행사 추가 등록 핸들러
  const handleAddInstituteEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate) {
      alert('개최 일자를 선택해 주세요.');
      return;
    }
    const finalCategory = eventCategory === '직접입력' ? (customCategoryName || '기타 행사') : eventCategory;
    const finalTitle = eventTitle || `${finalCategory} (${eventDate})`;

    const newEvent: InstituteEventItem = {
      id: `inst-evt-${Date.now()}`,
      category: eventCategory,
      title: finalTitle,
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      location: eventLocation || 'GMSCS 본원',
      targetAudience: eventTargetAudience || '인증 관계자',
      notes: eventNotes || '',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    const updated = [newEvent, ...instituteEvents].sort((a, b) => a.date.localeCompare(b.date));
    setInstituteEvents(updated);
    saveInstituteEvents(updated);

    // 폼 초기화
    setEventDate('');
    setEventNotes('');
    alert(`"${finalTitle}" 행사가 성공적으로 등록되었습니다.`);
  };

  // 인정원 행사 삭제 핸들러
  const handleDeleteInstituteEvent = (id: string) => {
    if (window.confirm('선택하신 인정원 행사를 삭제하시겠습니까?')) {
      const updated = instituteEvents.filter(e => e.id !== id);
      setInstituteEvents(updated);
      saveInstituteEvents(updated);
    }
  };

  // 심의위원회 일정 상태 변경 (예정 <-> 확정)
  const handleToggleScheduleStatus = (id: string) => {
    const updated = committeeSchedules.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === '확정' ? '예정' : '확정';
        return { ...item, status: nextStatus as '예정' | '확정' };
      }
      return item;
    });
    saveCommitteeSchedules(updated);
    onUpdateCommitteeSchedules?.(updated);
  };

  // 심의위원회 일정 삭제
  const handleDeleteSchedule = (id: string) => {
    if (window.confirm('선택하신 심의위원회 일정을 삭제하시겠습니까?')) {
      const updated = committeeSchedules.filter(item => item.id !== id);
      saveCommitteeSchedules(updated);
      onUpdateCommitteeSchedules?.(updated);
    }
  };

  // 심의위원회 일정 수정 저장
  const handleSaveEditSchedule = (id: string) => {
    const updated = committeeSchedules.map(item => {
      if (item.id === id) {
        return {
          ...item,
          date: editDate,
          sessionNumber: editSession,
          time: editTime
        };
      }
      return item;
    });
    saveCommitteeSchedules(updated);
    onUpdateCommitteeSchedules?.(updated);
    setEditingScheduleId(null);
  };

  // 심의위원회 임시 일정 수동 추가
  const handleAddNewSchedule = () => {
    if (!newDate || !newSession) {
      alert('일자와 회차명을 모두 입력해주세요.');
      return;
    }
    const newItem: CommitteeScheduleItem = {
      id: `comm-sched-custom-${Date.now()}`,
      sessionNumber: newSession,
      date: newDate,
      time: newTime || '14:00',
      status: '확정',
      notes: '사무국 수동 추가 심의',
      isCustom: true
    };
    const updated = [...committeeSchedules, newItem].sort((a, b) => a.date.localeCompare(b.date));
    saveCommitteeSchedules(updated);
    onUpdateCommitteeSchedules?.(updated);
    setIsAddingNewSchedule(false);
  };

  // 백업 다운로드
  const handleExportBackup = () => {
    const backupData = {
      version: '2.6.4',
      exportDate: new Date().toISOString(),
      standards: availableStandards,
      committeeSchedules,
      companiesCount: companies.length,
      auditorsCount: auditors.length,
      projectsCount: projects.length,
      settlementsCount: settlements.length
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GMSCS_MASTER_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage('✅ 주서버 데이터베이스 마스터 백업 파일 다운로드가 완료되었습니다.');
    setTimeout(() => setBackupMessage(''), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[750px]">
      
      {/* ========================================================================= */}
      {/* 1. 좌측 파일 인덱스 사이드바 (Flat Side Navigation) */}
      {/* ========================================================================= */}
      <aside className="w-full md:w-60 bg-slate-50/90 border-r border-slate-300 flex flex-col justify-between shrink-0">
        <div>
          {/* 사이드바 헤더 */}
          <div className="p-4 border-b border-slate-300 bg-slate-100/70">
            <div className="flex items-center space-x-2 text-slate-800">
              <Award className="w-5 h-5 text-cyan-700 shrink-0" />
              <h2 className="font-extrabold text-sm tracking-tight">인증관리 인덱스</h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              공인 규격·심의일정·KAB기준·정산원장
            </p>
          </div>

          {/* 사이드바 메뉴 탭 목록 */}
          <nav className="p-2 space-y-1">
            <button
              type="button"
              onClick={() => setActiveSubTab('standards')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer ${
                activeSubTab === 'standards'
                  ? 'bg-white text-slate-950 border border-slate-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Award className={`w-4 h-4 ${activeSubTab === 'standards' ? 'text-cyan-700' : 'text-slate-400'}`} />
              <span>인증가능 규격</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('reportNotices')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer ${
                activeSubTab === 'reportNotices'
                  ? 'bg-white text-slate-950 border border-slate-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeSubTab === 'reportNotices' ? 'text-cyan-700' : 'text-slate-400'}`} />
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span>심사보고서 작성 공지</span>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold font-mono">
                  {reportNotices.length}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('committee')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer ${
                activeSubTab === 'committee'
                  ? 'bg-white text-slate-950 border border-slate-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeSubTab === 'committee' ? 'text-cyan-700' : 'text-slate-400'}`} />
              <span>심의위원회 일정 관리</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('events')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer ${
                activeSubTab === 'events'
                  ? 'bg-white text-slate-950 border border-slate-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeSubTab === 'events' ? 'text-cyan-700' : 'text-slate-400'}`} />
              <span>인정원 행사 추가</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('kab')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer ${
                activeSubTab === 'kab'
                  ? 'bg-white text-slate-950 border border-slate-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Calculator className={`w-4 h-4 ${activeSubTab === 'kab' ? 'text-cyan-700' : 'text-slate-400'}`} />
              <span>KAB 심사 관련사항</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('settlements')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer ${
                activeSubTab === 'settlements'
                  ? 'bg-white text-slate-950 border border-slate-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent'
              }`}
            >
              <DollarSign className={`w-4 h-4 ${activeSubTab === 'settlements' ? 'text-cyan-700' : 'text-slate-400'}`} />
              <span>심사비 정산사항</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('general')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer ${
                activeSubTab === 'general'
                  ? 'bg-white text-slate-950 border border-slate-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent'
              }`}
            >
              <HardDrive className={`w-4 h-4 ${activeSubTab === 'general' ? 'text-cyan-700' : 'text-slate-400'}`} />
              <span>일반사항 &amp; 자료관리</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('mail')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer ${
                activeSubTab === 'mail'
                  ? 'bg-white text-slate-950 border border-slate-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Mail className={`w-4 h-4 ${activeSubTab === 'mail' ? 'text-cyan-700' : 'text-slate-400'}`} />
              <span>스마트 메일 센터</span>
            </button>
          </nav>
        </div>

        {/* 하단 시스템 요약 */}
        <div className="p-3 border-t border-slate-300 bg-slate-100 text-[11px] text-slate-500 font-mono">
          <div>GMSCS v2.6.4</div>
          <div className="text-[10px] text-slate-400">KAB-QC-2601 공인인증기관</div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. 우측 평면(Flat) 내용 영역 (카드 중첩 배제, 영역 평면 활용) */}
      {/* ========================================================================= */}
      <main className="flex-1 bg-white p-5 overflow-y-auto">

        {/* 1. 인증가능 규격 뷰 */}
        {activeSubTab === 'standards' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">인증원의 인증가능 규격 및 버전 관리</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  글로벌매니지먼트시스템인증원(GMSCS)이 한국인정지원센터(KAB)로부터 공인 인정받은 인증 심사 규격 대장입니다.
                </p>
              </div>
            </div>

            {/* 평면 테이블 */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[12px]">
                    <th className="py-2.5 px-3 border-r border-slate-300">규격 코드</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">인증 표준명</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">인가 인정 범위 (IAF)</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">버전 년도</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">인정 유효기한</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-300">기준 MD 단가</th>
                    <th className="py-2.5 px-2 text-center">전환 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {availableStandards.map((std) => (
                    <tr key={std.code} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold font-mono text-cyan-900 border-r border-slate-200 whitespace-nowrap">
                        {std.code}
                      </td>
                      <td className="py-2.5 px-3 font-semibold border-r border-slate-200">
                        {std.name}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600 text-[11.5px]">
                        {std.iafScope}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200 whitespace-nowrap">
                        {std.versionYear}년
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200 text-slate-600 whitespace-nowrap">
                        {std.validity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold border-r border-slate-200 whitespace-nowrap">
                        {std.feeBasePerMd.toLocaleString()}원
                      </td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          std.transitionStatus.includes('검토') 
                            ? 'bg-amber-100 text-amber-900' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {std.transitionStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 1-2. 심사보고서 작성 공지사항 관리 뷰 */}
        {activeSubTab === 'reportNotices' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">심사보고서 작성 인증원 공지사항 관리 (사무국 지침)</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
                    총 {reportNotices.length}건 등록됨
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  인증원이 심사 가능한 모든 규격별 및 전 규격 공통 심사보고서 작성 지침과 착안점을 등록·수정·관리합니다. 심사보고서 작성 워크벤치에 실시간 연동됩니다.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestoreDefaultNotices}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer shadow-2xs"
                  title="기본 11개 표준 공지사항으로 초기화"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>표준 공지 복원</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingNoticeId(null);
                    setNoticeCategoryInput('공통사항');
                    setNoticeStandardNameInput('전 규격 공통');
                    setNoticeTitleInput('');
                    setNoticeContentInput('');
                    setNoticePriorityInput('중요');
                    setNoticeAuthorInput('GMSCS 인증원 사무국');
                    setIsAddingNewNotice(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ 새 공지사항 등록</span>
                </button>
              </div>
            </div>

            {/* 저장 성공 알림 메시지 */}
            {noticeSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>공지사항이 성공적으로 저장되었습니다. 심사보고서 작성 워크벤치에 즉시 반영됩니다.</span>
              </div>
            )}

            {/* 공지 등록 / 수정 폼 */}
            {isAddingNewNotice && (
              <form onSubmit={handleSaveNotice} className="p-4 bg-slate-50 rounded-xl border border-cyan-300 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-700" />
                    <span>{editingNoticeId ? '심사보고서 작성 공지사항 수정' : '새 심사보고서 작성 공지사항 등록'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewNotice(false);
                      setEditingNoticeId(null);
                    }}
                    className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer font-bold"
                  >
                    닫기 ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 적용 규격 / 구분 */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">적용 대상 / 규격</label>
                    <select
                      value={noticeCategoryInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNoticeCategoryInput(val);
                        if (val === '공통사항') {
                          setNoticeStandardNameInput('전 규격 공통');
                        } else {
                          const matched = GMS_AVAILABLE_STANDARDS.find(s => s.code === val);
                          if (matched) {
                            setNoticeStandardNameInput(matched.name);
                          }
                        }
                      }}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-cyan-500 font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="공통사항">전 규격 공통사항</option>
                      {GMS_AVAILABLE_STANDARDS.map(std => (
                        <option key={std.code} value={std.code}>
                          {std.code} ({std.name.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 규격명 표기 */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">표시 표준명</label>
                    <input
                      type="text"
                      value={noticeStandardNameInput}
                      onChange={(e) => setNoticeStandardNameInput(e.target.value)}
                      placeholder="예: 품질경영시스템 (QMS) 또는 전 규격 공통"
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-cyan-500 text-slate-800"
                    />
                  </div>

                  {/* 중요도 */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">중요도 구분</label>
                    <select
                      value={noticePriorityInput}
                      onChange={(e) => setNoticePriorityInput(e.target.value as any)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-cyan-500 font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="필독">🚨 필독 (긴급/핵심지침)</option>
                      <option value="중요">⭐ 중요 (착안점 권고사항)</option>
                      <option value="일반">📌 일반 (안내 및 참고사항)</option>
                    </select>
                  </div>
                </div>

                {/* 공지 제목 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">공지 제목</label>
                  <input
                    type="text"
                    value={noticeTitleInput}
                    onChange={(e) => setNoticeTitleInput(e.target.value)}
                    placeholder="예: ISO 9001 프로세스 감사노트 및 객관적 증거 명시 지침"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-cyan-500 font-bold text-slate-900"
                    required
                  />
                </div>

                {/* 공지 상세 내용 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    공지 상세 내용 (줄바꿈 및 항목별 번호/불릿 기호 지원)
                  </label>
                  <textarea
                    rows={5}
                    value={noticeContentInput}
                    onChange={(e) => setNoticeContentInput(e.target.value)}
                    placeholder="• 4.4 프로세스 접근법 및 리스크 기반 사고 적용 여부 철저 확인&#10;• 8.5 생산 및 서비스 제공의 공정 관리 상태, 식별 및 추적성 기록 기재"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-cyan-500 font-mono text-slate-800 leading-relaxed"
                    required
                  />
                </div>

                {/* 작성 주체 & 저장 버튼 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-bold text-[11px]">발행처:</span>
                    <input
                      type="text"
                      value={noticeAuthorInput}
                      onChange={(e) => setNoticeAuthorInput(e.target.value)}
                      className="text-xs p-1 border border-slate-300 rounded bg-white w-40"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewNotice(false);
                        setEditingNoticeId(null);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingNoticeId ? '수정 완료' : '공지사항 저장'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 필터 및 검색 바 */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100 rounded-lg border border-slate-200">
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedNoticeCategory('all')}
                  className={`px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer ${
                    selectedNoticeCategory === 'all'
                      ? 'bg-cyan-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  전체 ({reportNotices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNoticeCategory('공통사항')}
                  className={`px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer ${
                    selectedNoticeCategory === '공통사항'
                      ? 'bg-cyan-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  공통사항 ({reportNotices.filter(n => n.category === '공통사항').length})
                </button>
                {GMS_AVAILABLE_STANDARDS.map(std => {
                  const count = reportNotices.filter(n => n.category === std.code).length;
                  if (count === 0 && selectedNoticeCategory !== std.code) return null;
                  return (
                    <button
                      key={std.code}
                      type="button"
                      onClick={() => setSelectedNoticeCategory(std.code)}
                      className={`px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer ${
                        selectedNoticeCategory === std.code
                          ? 'bg-cyan-700 text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                      }`}
                    >
                      {std.code.split(':')[0]} ({count})
                    </button>
                  );
                })}
              </div>

              {/* 검색창 */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={noticeSearchTerm}
                  onChange={(e) => setNoticeSearchTerm(e.target.value)}
                  placeholder="공지 제목 또는 본문 검색..."
                  className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-cyan-500 w-48 text-slate-800"
                />
              </div>
            </div>

            {/* 공지사항 카드 목록 */}
            <div className="space-y-2.5">
              {reportNotices
                .filter(n => {
                  if (selectedNoticeCategory !== 'all' && n.category !== selectedNoticeCategory) return false;
                  if (noticeSearchTerm.trim()) {
                    const q = noticeSearchTerm.toLowerCase();
                    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
                  }
                  return true;
                })
                .map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-300 shadow-2xs hover:border-cyan-300 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        {/* 중요도 뱃지 */}
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-extrabold ${
                          notice.priority === '필독'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : notice.priority === '중요'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {notice.priority === '필독' ? '🚨 필독' : notice.priority === '중요' ? '⭐ 중요' : '📌 일반'}
                        </span>

                        {/* 규격 뱃지 */}
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold font-mono ${
                          notice.category === '공통사항'
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            : 'bg-cyan-50 text-cyan-900 border border-cyan-200'
                        }`}>
                          {notice.category} {notice.standardName && notice.category !== '공통사항' ? `(${notice.standardName.split(' ')[0]})` : ''}
                        </span>

                        {/* 제목 */}
                        <h4 className="font-bold text-slate-900 text-xs">{notice.title}</h4>
                      </div>

                      {/* 작성자, 작성일 및 수정/삭제 액션 */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>{notice.author} · {notice.updatedAt}</span>
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditNotice(notice)}
                            className="p-1 rounded text-cyan-700 hover:bg-cyan-50 cursor-pointer"
                            title="수정하기"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNotice(notice.id)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="삭제하기"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 본문 내용 */}
                    <div className="text-xs text-slate-700 whitespace-pre-wrap font-normal leading-relaxed pl-1">
                      {notice.content}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 2. 인증심의위원회 일정 관리 뷰 (모든 텍스트 볼드 배제, 월 2회 1,3주/2,4주 규칙, 텍스트 상태, 연필 아이콘) */}
        {activeSubTab === 'committee' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-normal text-slate-900">인증심의위원회 개최 일정 관리</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  정기 심의위원회 기본 규칙을 설정하고, 연간 개최 일정을 확정·수정·추가하여 대시보드 및 심사진행현황에 실시간 연동합니다.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNewSchedule(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-normal rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 심의일정 추가</span>
                </button>
              </div>
            </div>

            {/* 정기 심의 기본 개최 규칙 설정 바 (1,3주 및 2,4주 월 2회 선택 지원) */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-normal text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cyan-700" />
                  <span>기본 개최 규칙 설정:</span>
                </span>
                <span className="font-normal text-slate-700">매월</span>
                <select
                  value={String(commRule.nthWeek)}
                  onChange={(e) => setCommRule(prev => ({ ...prev, nthWeek: e.target.value }))}
                  className="py-1 px-2 bg-white border border-slate-300 rounded font-normal text-slate-800 cursor-pointer"
                >
                  <option value="1,3">1,3주 (월 2회)</option>
                  <option value="2,4">2,4주 (월 2회)</option>
                  <option value="1">1째주 (월 1회)</option>
                  <option value="2">2째주 (월 1회)</option>
                  <option value="3">3째주 (월 1회)</option>
                  <option value="4">4째주 (월 1회)</option>
                </select>
                <select
                  value={commRule.dayOfWeek}
                  onChange={(e) => setCommRule(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                  className="py-1 px-2 bg-white border border-slate-300 rounded font-normal text-slate-800 cursor-pointer"
                >
                  <option value={1}>월요일</option>
                  <option value={2}>화요일</option>
                  <option value={3}>수요일</option>
                  <option value={4}>목요일</option>
                  <option value={5}>금요일</option>
                </select>
                <span className="font-normal text-slate-700">시간:</span>
                <input
                  type="text"
                  value={commRule.time}
                  onChange={(e) => setCommRule(prev => ({ ...prev, time: e.target.value }))}
                  className="py-1 px-2 w-20 bg-white border border-slate-300 rounded font-mono font-normal text-center"
                  placeholder="14:00"
                >
                </input>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRegenerateCommitteeSchedules}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-normal transition cursor-pointer"
                  title="현재 규칙을 바탕으로 2026 연간 일정을 일괄 재계산합니다."
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />
                  <span>규칙 적용 12개월 일정 재산출</span>
                </button>
              </div>
            </div>

            {/* 신규 일정 추가 팝업 박스 */}
            {isAddingNewSchedule && (
              <div className="bg-cyan-50/70 p-3.5 rounded-xl border border-cyan-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-normal text-cyan-900">➕ 새 일정 추가:</span>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="py-1 px-2 bg-white border border-cyan-300 rounded font-mono font-normal"
                  />
                  <input
                    type="text"
                    value={newSession}
                    onChange={(e) => setNewSession(e.target.value)}
                    placeholder="회차명 (예: 제2026-09차 임시 심의)"
                    className="py-1 px-2 w-64 bg-white border border-cyan-300 rounded font-normal"
                  />
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="14:00"
                    className="py-1 px-2 w-20 bg-white border border-cyan-300 rounded text-center font-mono font-normal"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddNewSchedule}
                    className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-normal transition cursor-pointer"
                  >
                    추가 완료
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewSchedule(false)}
                    className="px-3 py-1.5 bg-white text-slate-600 border border-slate-300 rounded hover:bg-slate-100 transition cursor-pointer font-normal"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 일정 목록 테이블 (볼드 제거, 상태 텍스트화, 수정 연필 아이콘) */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 font-normal text-[12px]">
                    <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center font-normal">No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 font-normal">회차 및 심의 명칭</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center font-normal">개최 일자</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300 font-normal">개최 시간</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300 font-normal">상태</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 font-normal">비고</th>
                    <th className="py-2.5 px-3 text-center font-normal">사무국 일정 관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {committeeSchedules.map((item, idx) => {
                    const isEditing = editingScheduleId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 text-center font-mono text-slate-400 border-r border-slate-200 font-normal">
                          {idx + 1}
                        </td>
                        
                        {/* 회차명 */}
                        <td className="py-2.5 px-3 border-r border-slate-200 font-normal">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editSession}
                              onChange={(e) => setEditSession(e.target.value)}
                              className="py-1 px-2 border border-slate-300 rounded text-xs w-full font-normal"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-900 font-normal">{item.sessionNumber}</span>
                              {item.isCustom && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-normal">
                                  수동추가
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 개최 일자 */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-900 border-r border-slate-200 whitespace-nowrap font-normal">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="py-1 px-2 border border-slate-300 rounded text-xs font-normal"
                            />
                          ) : (
                            <span>{item.date}</span>
                          )}
                        </td>

                        {/* 개최 시간 */}
                        <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200 whitespace-nowrap font-normal text-slate-700">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="py-1 px-1 border border-slate-300 rounded text-xs w-16 text-center font-normal"
                            />
                          ) : (
                            <span>{item.time || '14:00'}</span>
                          )}
                        </td>

                        {/* 상태 (버튼 형식을 버리고 텍스트만 표시) */}
                        <td className="py-2.5 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                          <span
                            onClick={() => handleToggleScheduleStatus(item.id)}
                            className={`text-xs font-normal cursor-pointer hover:underline select-none ${
                              item.status === '완료'
                                ? 'text-slate-500'
                                : item.status === '확정'
                                ? 'text-emerald-700'
                                : 'text-blue-700'
                            }`}
                            title="클릭 시 상태 전환 (예정/확정)"
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* 비고 */}
                        <td className="py-2.5 px-3 text-slate-500 text-[11.5px] border-r border-slate-200 font-normal">
                          {item.notes || '-'}
                        </td>

                        {/* 관리 버튼 (수정은 연필 아이콘으로 변경) */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveEditSchedule(item.id)}
                                className="px-2 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded text-[11px] font-normal cursor-pointer"
                              >
                                저장
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingScheduleId(null)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-normal cursor-pointer"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              {/* 수정: 연필 아이콘 */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingScheduleId(item.id);
                                  setEditDate(item.date);
                                  setEditSession(item.sessionNumber);
                                  setEditTime(item.time || '14:00');
                                }}
                                className="p-1 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded transition cursor-pointer"
                                title="일정 수정"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* 삭제 아이콘 */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSchedule(item.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                                title="일정 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2-2. 인정원 행사 추가 뷰 (사용자 신규 요청: 일자 선택 후 우측 30분 단위 시간 설정) */}
        {activeSubTab === 'events' && (
          <div className="space-y-4">
            {/* 타이틀 헤더 */}
            <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-normal text-slate-900">인정원 행사 일정 관리</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  심사원 교육, 심사원 세미나, 고객 세미나 등 인정원 공식 행사를 등록하고 일자별 30분 단위 시간을 설정합니다.
                </p>
              </div>
              <div className="text-xs text-slate-500 font-normal">
                등록된 행사 총 <span className="font-mono text-slate-900">{instituteEvents.length}</span>건
              </div>
            </div>

            {/* 행사 등록 2단계 인터랙티브 패널 (좌: 기본종류 및 일자 선택 / 우: 일자 선택 시 나타나는 30분단위 시간 설정 메뉴) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* 1단계 (왼쪽): 행사 종류 선택 및 개최 일자 지정 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3.5">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] flex items-center justify-center font-mono font-normal">1</span>
                  <span className="text-xs font-normal text-slate-900">행사 종류 선택 및 개최 일자 지정</span>
                </div>

                {/* 행사 구분 기본 메뉴: 심사원교육, 심사원세미나, 고객세미나, 교육, 직접입력 */}
                <div>
                  <label className="block text-[11px] font-normal text-slate-600 mb-1.5">
                    행사 기본 구분 <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['심사원교육', '심사원세미나', '고객세미나', '교육', '직접입력'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setEventCategory(cat);
                          if (cat !== '직접입력') {
                            setEventTitle(`2026 하반기 ${cat}`);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-normal transition cursor-pointer border ${
                          eventCategory === cat
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {eventCategory === '직접입력' && (
                    <div className="mt-2 animate-in fade-in">
                      <input
                        type="text"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        placeholder="행사 구분 직접 입력 (예: 임직원 워크숍, 정기 포럼 등)"
                        className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs font-normal"
                      />
                    </div>
                  )}
                </div>

                {/* 행사 명칭 */}
                <div>
                  <label className="block text-[11px] font-normal text-slate-600 mb-1">
                    행사 명칭 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="예: 2026년 4분기 KAB 심사원 정기 보수교육"
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs font-normal"
                  />
                </div>

                {/* 개최 일자 선택 */}
                <div>
                  <label className="block text-[11px] font-normal text-slate-600 mb-1">
                    개최 일자 선택 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs font-mono font-normal focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                  />
                  <p className="text-[10.5px] text-cyan-700 font-normal mt-1">
                    * 일자를 선택하시면 오른쪽에 일자별 30분 단위 시간 설정 메뉴가 열립니다.
                  </p>
                </div>

                {/* 장소 및 대상 (옵션) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 mb-1">장소</label>
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="예: GMSCS 본원 세미나실"
                      className="w-full py-1 px-2 bg-white border border-slate-300 rounded text-xs font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-normal text-slate-600 mb-1">참가 대상</label>
                    <input
                      type="text"
                      value={eventTargetAudience}
                      onChange={(e) => setEventTargetAudience(e.target.value)}
                      placeholder="예: 심사위원단 및 실무자"
                      className="w-full py-1 px-2 bg-white border border-slate-300 rounded text-xs font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* 2단계 (오른쪽): 일자가 선택되면 생성되는 30분 단위 시간 설정 패널 */}
              <div className="bg-white p-4 rounded-xl border border-slate-300 flex flex-col justify-between">
                {!eventDate ? (
                  /* 일자 미선택 시 안내 카드 */
                  <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/70 border border-dashed border-slate-300 rounded-lg">
                    <Clock className="w-8 h-8 text-slate-300 mb-2" />
                    <div className="text-xs font-normal text-slate-700">시간 설정 대기 중</div>
                    <p className="text-[11px] text-slate-400 font-normal mt-1 max-w-[260px]">
                      왼쪽에서 개최 일자를 먼저 선택하시면, 해당 일자의 30분 단위 시작·종료 시간 설정 메뉴가 여기에 열립니다.
                    </p>
                  </div>
                ) : (
                  /* 일자 선택 시 활성화되는 메뉴 */
                  <form onSubmit={handleAddInstituteEvent} className="space-y-3.5 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-cyan-700 text-white text-[11px] flex items-center justify-center font-mono font-normal">2</span>
                        <span className="text-xs font-normal text-slate-900">일자별 시간 설정 (30분 단위)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[11px] font-mono font-normal">
                        {eventDate} ({getDayOfWeekName(eventDate)})
                      </span>
                    </div>

                    {/* 시작 시간과 종료 시간 (30분 단위) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-normal text-slate-600 mb-1">
                          시작 시간 (30분 단위)
                        </label>
                        <select
                          value={eventStartTime}
                          onChange={(e) => setEventStartTime(e.target.value)}
                          className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded text-xs font-mono font-normal cursor-pointer"
                        >
                          {TIME_SLOTS_30MIN.map(time => (
                            <option key={`start-${time}`} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-normal text-slate-600 mb-1">
                          종료 시간 (30분 단위)
                        </label>
                        <select
                          value={eventEndTime}
                          onChange={(e) => setEventEndTime(e.target.value)}
                          className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded text-xs font-mono font-normal cursor-pointer"
                        >
                          {TIME_SLOTS_30MIN.map(time => (
                            <option key={`end-${time}`} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 비고 및 세부 안내 */}
                    <div>
                      <label className="block text-[11px] font-normal text-slate-600 mb-1">
                        행사 비고 및 상세 안내
                      </label>
                      <textarea
                        rows={3}
                        value={eventNotes}
                        onChange={(e) => setEventNotes(e.target.value)}
                        placeholder="준비물, 참가비, 온라인 링크 등 비고사항 입력"
                        className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded text-xs font-normal resize-none"
                      />
                    </div>

                    {/* 등록 버튼 */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-cyan-800 hover:bg-cyan-900 text-white rounded-lg text-xs font-normal transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>인정원 행사 등록 완료</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* 하단: 등록된 인정원 행사 목록 */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-normal text-slate-700">등록된 인정원 행사 목록 ({instituteEvents.length}건)</h4>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 font-normal text-[12px]">
                      <th className="py-2 px-3 border-r border-slate-300 w-12 text-center font-normal">No</th>
                      <th className="py-2 px-3 border-r border-slate-300 w-28 text-center font-normal">구분</th>
                      <th className="py-2 px-3 border-r border-slate-300 font-normal">행사 명칭</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-28 font-normal">개최 일자</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-32 font-normal">개최 시간</th>
                      <th className="py-2 px-3 border-r border-slate-300 font-normal">장소 / 대상</th>
                      <th className="py-2 px-3 border-r border-slate-300 font-normal">비고</th>
                      <th className="py-2 px-2 text-center w-14 font-normal">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {instituteEvents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-normal">
                          등록된 인정원 행사가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      instituteEvents.map((evt, idx) => (
                        <tr key={evt.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-center font-mono text-slate-400 border-r border-slate-200 font-normal">{idx + 1}</td>
                          <td className="py-2 px-3 text-center border-r border-slate-200 whitespace-nowrap font-normal">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-normal">
                              {evt.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-normal text-slate-900">{evt.title}</td>
                          <td className="py-2 px-3 text-center font-mono border-r border-slate-200 whitespace-nowrap font-normal">{evt.date}</td>
                          <td className="py-2 px-3 text-center font-mono border-r border-slate-200 whitespace-nowrap font-normal text-cyan-900">
                            {evt.startTime} ~ {evt.endTime}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-normal text-[11px]">
                            {evt.location} {evt.targetAudience ? `(${evt.targetAudience})` : ''}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-500 font-normal text-[11px]">{evt.notes || '-'}</td>
                          <td className="py-2 px-2 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteInstituteEvent(evt.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                              title="행사 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 3. KAB 심사 관련사항 뷰 */}
        {activeSubTab === 'kab' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">KAB 공인 심사 MD 산정 기준 및 필수 가감 규정</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                한국인정지원센터(KAB) 공인 산식에 의거한 종업원 수 대비 표준 심사일수(MD) 기준표입니다.
              </p>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[12px]">
                    <th className="py-2.5 px-3 border-r border-slate-300">인원 규모 (유효 인원수)</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">최초 1단계 MD</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">최초 2단계 MD</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-300 bg-cyan-50/50 font-bold text-cyan-900">
                      최초 심사 합계 MD
                    </th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">사후 심사 MD (연차별)</th>
                    <th className="py-2.5 px-2 text-center">갱신 심사 MD (3년차)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-mono">
                  {kabMdStandards.map((k) => (
                    <tr key={k.scale} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-sans font-bold border-r border-slate-200">
                        {k.scale}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200">
                        {k.initialStage1.toFixed(1)}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200">
                        {k.initialStage2.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-cyan-900 border-r border-slate-200 bg-cyan-50/30">
                        {k.initialTotal.toFixed(1)} MD
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200">
                        {k.surv.toFixed(1)} MD
                      </td>
                      <td className="py-2 px-2 text-center">
                        {k.recert.toFixed(1)} MD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. 심사비 정산사항 뷰 */}
        {activeSubTab === 'settlements' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">심사비 정산원장 (36명 심사원 대상 3.3% 원천징수 내역)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  현장 심사 완료 및 심사보고서 검토가 승인된 건에 대한 월간 심사수당 지급 원장입니다.
                </p>
              </div>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[12px]">
                    <th className="py-2.5 px-3 border-r border-slate-300">정산 번호</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">심사원명</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">대상 업체명</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">배정 MD</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-300">수당 총액</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-300 text-rose-700">3.3% 원천징수</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-300 font-bold text-cyan-900">실 지급액</th>
                    <th className="py-2.5 px-2 text-center">지급 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {settlements.slice(0, 15).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500 border-r border-slate-200">
                        {s.id}
                      </td>
                      <td className="py-2.5 px-3 font-bold border-r border-slate-200">
                        {s.auditorName}
                      </td>
                      <td className="py-2.5 px-3 font-semibold border-r border-slate-200">
                        {s.companyName}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200">
                        {s.appliedMd} MD
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                        {s.payoutAmount.toLocaleString()}원
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-700 border-r border-slate-200">
                        -{s.taxWithheld.toLocaleString()}원
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-900 border-r border-slate-200">
                        {s.netPayout.toLocaleString()}원
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onUpdateSettlementStatus?.(s.id, s.payoutStatus === '지급완료' ? '정산대기' : '지급완료')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                            s.payoutStatus === '지급완료'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                          title="클릭하여 지급 상태 변경"
                        >
                          {s.payoutStatus}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. 일반사항 & 자료관리 뷰 */}
        {activeSubTab === 'general' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">시스템 데이터베이스 백업 및 자료 보존</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  심사 대장, 고객사 원장, 심사보고서 및 심사비 지급 내역을 안전하게 2중 백업 보관합니다.
                </p>
              </div>
            </div>

            {backupMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold">
                {backupMessage}
              </div>
            )}

            <div className="border border-slate-300 rounded-xl p-5 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">주서버 실시간 데이터베이스 마스터 백업</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    현재 시스템의 모든 심사 데이터와 심사원 자격 원장을 표준 JSON 포맷으로 백업 다운로드합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-2xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>백업 파일 (.JSON) 생성 다운로드</span>
                </button>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400">등록 고객사 수:</span>
                  <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">{companies.length}개사</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400">활동 심사원 수:</span>
                  <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">{auditors.length}명</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400">누적 심사 프로젝트:</span>
                  <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">{projects.length}건</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. 스마트 메일 센터 뷰 */}
        {activeSubTab === 'mail' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">스마트 메일 및 공문 발송 센터</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  고객사 및 심사원에게 표준화된 심사계획서, 공문, 계약서를 즉시 발송합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenEmailModal}
                className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>메일 작성창 열기</span>
              </button>
            </div>

            <div className="border border-slate-300 rounded-xl p-6 bg-slate-50 text-center space-y-3">
              <Mail className="w-12 h-12 text-cyan-600 mx-auto opacity-70" />
              <div className="max-w-md mx-auto text-xs text-slate-600">
                심사계획서 및 공문 발송은 상단 우측의 <strong>스마트 메일</strong> 버튼이나, 
                심사진행현황 및 고객관리 테이블 각 행의 <strong>[계획서발송]</strong> 버튼을 통해서도 원클릭 사전 입력 발송이 가능합니다.
              </div>
              <button
                type="button"
                onClick={onOpenEmailModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition shadow-2xs cursor-pointer"
              >
                <Mail className="w-4 h-4 text-cyan-700" />
                <span>스마트 메일 발송 모달 열기</span>
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
