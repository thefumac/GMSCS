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
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Send,
  Building2,
  Users
} from 'lucide-react';
import { Auditor, Company, AuditProject, AuditorSettlement, CommitteeScheduleItem } from '../types';
import { 
  DEFAULT_COMMITTEE_RULE, 
  CommitteeScheduleRule, 
  generateYearlyCommitteeSchedules,
  loadSavedCommitteeRule,
  saveCommitteeRule,
  saveCommitteeSchedules
} from '../utils/committeeSchedule';

export type CertSubTab = 'standards' | 'committee' | 'kab' | 'settlements' | 'general' | 'mail';

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

  // 1. 인증가능 규격 데이터
  const availableStandards = [
    {
      code: 'ISO 9001:2015',
      name: '품질경영시스템 (QMS)',
      iafScope: '전 업종 (01~39 IAF 코드 인가)',
      validity: '2028-12-31',
      status: '공인인정',
      versionYear: 2015,
      transitionStatus: '현행 최신',
      feeBasePerMd: 700000
    },
    {
      code: 'ISO 14001:2015',
      name: '환경경영시스템 (EMS)',
      iafScope: '제조, 화학, 건설, 서비스 전반',
      validity: '2028-12-31',
      status: '공인인정',
      versionYear: 2015,
      transitionStatus: '현행 최신',
      feeBasePerMd: 700000
    },
    {
      code: 'ISO 45001:2018',
      name: '안전보건경영시스템 (OHSMS)',
      iafScope: '중대재해처벌법 대응 전 업종',
      validity: '2027-10-31',
      status: '공인인정',
      versionYear: 2018,
      transitionStatus: '현행 최신',
      feeBasePerMd: 750000
    },
    {
      code: 'ISO 27001:2022',
      name: '정보보안경영시스템 (ISMS)',
      iafScope: 'IT, 소프트웨어, 금융, 데이터센터',
      validity: '2027-05-31',
      status: '공인인정',
      versionYear: 2022,
      transitionStatus: '2022 신규전환 완료',
      feeBasePerMd: 850000
    },
    {
      code: 'ISO 37001:2016',
      name: '부패방지경영시스템 (ABMS)',
      iafScope: '공공기관, 제약, 건설, 대기업',
      validity: '2026-12-31',
      status: '공인인정',
      versionYear: 2016,
      transitionStatus: '현행 최신',
      feeBasePerMd: 800000
    },
    {
      code: 'ISO 22000:2018',
      name: '식품안전경영시스템 (FSMS)',
      iafScope: '식음료 제조 및 유통 체인',
      validity: '2027-08-31',
      status: '공인인정',
      versionYear: 2018,
      transitionStatus: '현행 최신',
      feeBasePerMd: 750000
    },
    {
      code: 'ISO 50001:2018',
      name: '에너지경영시스템 (EnMS)',
      iafScope: '철강, 에너지, 운송, 화학 플랜트',
      validity: '2027-03-31',
      status: '공인인정',
      versionYear: 2018,
      transitionStatus: '현행 최신',
      feeBasePerMd: 800000
    },
    {
      code: 'ISO 13485:2016',
      name: '의료기기 품질경영시스템 (MD-QMS)',
      iafScope: '의료기기 제조 및 공급망',
      validity: '2026-11-30',
      status: '공인인정',
      versionYear: 2016,
      transitionStatus: '규제 부합 검토중',
      feeBasePerMd: 900000
    }
  ];

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

  // 심의위원회 일정 재산출 (기본 규칙 적용)
  const handleRegenerateCommitteeSchedules = () => {
    if (window.confirm(`매월 ${commRule.nthWeek}째주 목요일(기본 ${commRule.time}) 규칙으로 2026년 12개월 일정을 다시 산출하시겠습니까?\n기존에 수동 추가된 일정도 초기화됩니다.`)) {
      saveCommitteeRule(commRule);
      const generated = generateYearlyCommitteeSchedules(2026, commRule);
      saveCommitteeSchedules(generated);
      onUpdateCommitteeSchedules?.(generated);
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

        {/* 2. 인증심의위원회 일정 관리 뷰 (사용자 신규 요청) */}
        {activeSubTab === 'committee' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">인증심의위원회 개최 일정 관리</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  정기 심의위원회 기본 규칙을 설정하고, 연간 개최 일정을 확정·수정·추가하여 대시보드 및 심사진행현황에 실시간 연동합니다.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNewSchedule(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 심의일정 추가</span>
                </button>
              </div>
            </div>

            {/* 정기 심의 기본 규칙 설정 바 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cyan-700" />
                  <span>기본 개최 규칙 설정:</span>
                </span>
                <span>매월</span>
                <select
                  value={commRule.nthWeek}
                  onChange={(e) => setCommRule(prev => ({ ...prev, nthWeek: Number(e.target.value) }))}
                  className="py-1 px-2 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                >
                  <option value={1}>1째주</option>
                  <option value={2}>2째주</option>
                  <option value={3}>3째주</option>
                  <option value={4}>4째주</option>
                </select>
                <select
                  value={commRule.dayOfWeek}
                  onChange={(e) => setCommRule(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                  className="py-1 px-2 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                >
                  <option value={1}>월요일</option>
                  <option value={2}>화요일</option>
                  <option value={3}>수요일</option>
                  <option value={4}>목요일</option>
                  <option value={5}>금요일</option>
                </select>
                <span>시간:</span>
                <input
                  type="text"
                  value={commRule.time}
                  onChange={(e) => setCommRule(prev => ({ ...prev, time: e.target.value }))}
                  className="py-1 px-2 w-20 bg-white border border-slate-300 rounded font-mono text-center"
                  placeholder="14:00"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRegenerateCommitteeSchedules}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold transition cursor-pointer"
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
                  <span className="font-bold text-cyan-900">➕ 새 일정 추가:</span>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="py-1 px-2 bg-white border border-cyan-300 rounded font-mono"
                  />
                  <input
                    type="text"
                    value={newSession}
                    onChange={(e) => setNewSession(e.target.value)}
                    placeholder="회차명 (예: 제2026-09차 임시 심의)"
                    className="py-1 px-2 w-64 bg-white border border-cyan-300 rounded"
                  />
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="14:00"
                    className="py-1 px-2 w-20 bg-white border border-cyan-300 rounded text-center font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddNewSchedule}
                    className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-bold transition cursor-pointer"
                  >
                    추가 완료
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewSchedule(false)}
                    className="px-3 py-1.5 bg-white text-slate-600 border border-slate-300 rounded hover:bg-slate-100 transition cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 일정 목록 테이블 */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[12px]">
                    <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">회차 및 심의 명칭</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">개최 일자</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">개최 시간</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">상태</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">비고</th>
                    <th className="py-2.5 px-3 text-center">사무국 일정 관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {committeeSchedules.map((item, idx) => {
                    const isEditing = editingScheduleId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 text-center font-mono text-slate-400 border-r border-slate-200">
                          {idx + 1}
                        </td>
                        
                        {/* 회차명 */}
                        <td className="py-2.5 px-3 font-semibold border-r border-slate-200">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editSession}
                              onChange={(e) => setEditSession(e.target.value)}
                              className="py-1 px-2 border border-slate-300 rounded text-xs w-full"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{item.sessionNumber}</span>
                              {item.isCustom && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                                  수동추가
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 개최 일자 */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="py-1 px-2 border border-slate-300 rounded text-xs"
                            />
                          ) : (
                            <span>{item.date}</span>
                          )}
                        </td>

                        {/* 개최 시간 */}
                        <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="py-1 px-1 border border-slate-300 rounded text-xs w-16 text-center"
                            />
                          ) : (
                            <span>{item.time || '14:00'}</span>
                          )}
                        </td>

                        {/* 상태 */}
                        <td className="py-2.5 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleScheduleStatus(item.id)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                              item.status === '완료'
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : item.status === '확정'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}
                            title="클릭 시 예정/확정 상태를 토글합니다."
                          >
                            {item.status}
                          </button>
                        </td>

                        {/* 비고 */}
                        <td className="py-2.5 px-3 text-slate-500 text-[11.5px] border-r border-slate-200">
                          {item.notes || '-'}
                        </td>

                        {/* 관리 버튼 */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveEditSchedule(item.id)}
                                className="px-2 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded text-[11px] font-bold cursor-pointer"
                              >
                                저장
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingScheduleId(null)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] cursor-pointer"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingScheduleId(item.id);
                                  setEditDate(item.date);
                                  setEditSession(item.sessionNumber);
                                  setEditTime(item.time || '14:00');
                                }}
                                className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold cursor-pointer"
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSchedule(item.id)}
                                className="px-1.5 py-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded text-[11px] cursor-pointer"
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
