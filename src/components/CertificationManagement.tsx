import React, { useState } from 'react';
import {
  Award,
  Calculator,
  DollarSign,
  HardDrive,
  Mail,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Send,
  Building2,
  Users
} from 'lucide-react';
import { Auditor, Company, AuditProject, AuditorSettlement } from '../types';

export type CertSubTab = 'standards' | 'kab' | 'settlements' | 'general' | 'mail';

export interface CertificationManagementProps {
  auditors: Auditor[];
  companies: Company[];
  projects: AuditProject[];
  settlements?: AuditorSettlement[];
  onOpenEmailModal?: () => void;
  onUpdateSettlementStatus?: (settlementId: string, status: '정산대기' | '지급완료') => void;
}

export const CertificationManagement: React.FC<CertificationManagementProps> = ({
  auditors,
  companies,
  projects,
  settlements = [],
  onOpenEmailModal,
  onUpdateSettlementStatus
}) => {
  const [activeSubTab, setActiveSubTab] = useState<CertSubTab>('standards');
  const [backupMessage, setBackupMessage] = useState<string>('');

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
      transitionStatus: '현행 (2026 개정 검토 진행 중)',
      feeBasePerMd: 700000
    },
    {
      code: 'ISO 45001:2018',
      name: '안전보건경영시스템 (OH&SMS)',
      iafScope: '제조, 플랜트, 건설, 시설관리',
      validity: '2028-12-31',
      status: '공인인정',
      versionYear: 2018,
      transitionStatus: '현행 최신',
      feeBasePerMd: 750000
    },
    {
      code: 'ESG-MS:2023',
      name: 'ESG 경영시스템 인증 (KAB 지정)',
      iafScope: '상장사, 수출 중소기업, 공급망 ESG',
      validity: '2027-06-30',
      status: '공인인정',
      versionYear: 2023,
      transitionStatus: 'KAB 특화 규격',
      feeBasePerMd: 800000
    },
    {
      code: 'ISO 50001:2018',
      name: '에너지경영시스템 (EnMS)',
      iafScope: '에너지 다소비 사업장, 중화학, 제지',
      validity: '2027-12-31',
      status: '인정 검토 중',
      versionYear: 2018,
      transitionStatus: '규격 신청',
      feeBasePerMd: 800000
    }
  ];

  // 2. KAB 공인 심사 MD 산정 기준표
  const kabMdTable = [
    { employees: '1 ~ 5인', qmsMd: 1.5, emsMd: 2.0, ohsMd: 2.0, integratedMd: 2.5 },
    { employees: '6 ~ 10인', qmsMd: 2.0, emsMd: 2.5, ohsMd: 2.5, integratedMd: 3.0 },
    { employees: '11 ~ 25인', qmsMd: 2.5, emsMd: 3.0, ohsMd: 3.0, integratedMd: 4.0 },
    { employees: '26 ~ 45인', qmsMd: 3.0, emsMd: 3.5, ohsMd: 3.5, integratedMd: 4.5 },
    { employees: '46 ~ 65인', qmsMd: 3.5, emsMd: 4.0, ohsMd: 4.0, integratedMd: 5.5 },
    { employees: '66 ~ 85인', qmsMd: 4.0, emsMd: 4.5, ohsMd: 4.5, integratedMd: 6.0 },
    { employees: '86 ~ 125인', qmsMd: 4.5, emsMd: 5.0, ohsMd: 5.0, integratedMd: 7.0 },
    { employees: '126 ~ 175인', qmsMd: 5.0, emsMd: 5.5, ohsMd: 5.5, integratedMd: 8.0 }
  ];

  // 백업 내보내기 핸들러
  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      exportDate: '2026-09-10',
      totalCompanies: companies.length,
      totalAuditors: auditors.length,
      totalProjects: projects.length,
      projects,
      companies,
      auditors
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GMSCS_DB_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage('백업 파일이 성공적으로 다운로드되었습니다.');
    setTimeout(() => setBackupMessage(''), 3000);
  };

  return (
    <div className="flex border border-slate-300 rounded-xl bg-white shadow-2xs overflow-hidden min-h-[720px] animate-in fade-in">
      
      {/* ========================================================================= */}
      {/* 1. 좌측 파일인덱스 스타일 서브메뉴 바 (인증관리 전용) */}
      {/* ========================================================================= */}
      <aside className="w-60 shrink-0 border-r border-slate-300 bg-slate-50 flex flex-col justify-between select-none">
        <div>
          {/* 인덱스 헤더 */}
          <div className="p-3 border-b border-slate-300 bg-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">인증원 행정 관리</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">인증관리 인덱스</div>
          </div>

          {/* 파일 인덱스 탭 버튼 목록 */}
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
                      <td className="py-2.5 px-3 font-bold font-mono text-cyan-900 border-r border-slate-200">
                        {std.code}
                      </td>
                      <td className="py-2.5 px-3 font-semibold border-r border-slate-200">
                        {std.name}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600 text-[11.5px]">
                        {std.iafScope}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200">
                        {std.versionYear}년
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200 text-slate-600">
                        {std.validity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold border-r border-slate-200">
                        {std.feeBasePerMd.toLocaleString()}원
                      </td>
                      <td className="py-2.5 px-2 text-center">
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

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800">규격 개정 및 전환 지침 안내:</div>
              <div>* 환경경영시스템(ISO 14001)의 2026년 개정안 승인 시, 기존 2015 버전 보유 업체는 3년의 전환 유예 기간이 부여됩니다.</div>
              <div>* 사무국에서 기준 버전을 변경 등록하면, 미전환 고객사의 인증 규격 번호는 심사업체 목록에서 자동으로 붉은색 알림 표시됩니다.</div>
            </div>
          </div>
        )}

        {/* 2. KAB 심사 관련사항 뷰 */}
        {activeSubTab === 'kab' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">KAB 한국인정지원센터 공인 심사 공수(MD) 기준</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                IAF MD 5 및 KAB 인정기준에 따른 종업원 수 규모별 법정 최소 심사 공수 산정 기준표입니다.
              </p>
            </div>

            {/* 평면 테이블 */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[12px]">
                    <th className="py-2.5 px-3 border-r border-slate-300">유효 종업원 규모</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-300">QMS 최소 MD</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-300">EMS 최소 MD</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-300">OH&amp;SMS 최소 MD</th>
                    <th className="py-2.5 px-3 text-center bg-cyan-50/50">통합심사 추천 MD (2개 이상 규격)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-mono text-center">
                  {kabMdTable.map((row) => (
                    <tr key={row.employees} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-left font-sans border-r border-slate-200">
                        {row.employees}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">
                        {row.qmsMd.toFixed(1)} MD
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">
                        {row.emsMd.toFixed(1)} MD
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">
                        {row.ohsMd.toFixed(1)} MD
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-900 bg-cyan-50/20">
                        {row.integratedMd.toFixed(1)} MD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800">KAB 공수 준수 원칙:</div>
              <div>1. 정기 사후관리 심사는 최초 인증 심사 총 공수(Stage 1+2)의 1/3 이상을 배정해야 합니다. (최소 1.0 MD)</div>
              <div>2. 갱신심사는 최초 인증 심사 총 공수의 2/3 이상을 배정해야 합니다.</div>
              <div>3. 복수 규격 통합 심사 시 최대 20%의 감면율이 적용될 수 있습니다.</div>
            </div>
          </div>
        )}

        {/* 3. 심사비 정산사항 뷰 */}
        {activeSubTab === 'settlements' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">심사원 심사비 정산원장 대장</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  심사 완료 및 보고서 승인된 프로젝트에 대한 심사원별 정산 내역 및 원천징수/세금계산서 지급 대장입니다.
                </p>
              </div>
            </div>

            {/* 평면 테이블 */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[12px]">
                    <th className="py-2.5 px-2 text-center w-10 border-r border-slate-300">No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">심사원명</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">대상 고객사명</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">심사구분</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">심사일정</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">공수(MD)</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-300">총 심사비</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-300">실 지급액 (세후)</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">지급 방식</th>
                    <th className="py-2.5 px-2 text-center">정산 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {settlements.slice(0, 15).map((s, idx) => {
                    const isPaid = s.payoutStatus === '지급완료';
                    const netPayout = Math.floor(s.totalAuditFee * 0.967);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2 text-center font-mono text-slate-400 border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-bold border-r border-slate-200 text-slate-900">
                          {s.auditorName}
                        </td>
                        <td className="py-2 px-3 font-medium border-r border-slate-200">
                          {s.companyName}
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-200 text-slate-700">
                          {s.auditType}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600 text-[11px] border-r border-slate-200">
                          {s.auditDates || '2026-09-07'}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-200">
                          {s.appliedMd.toFixed(1)} MD
                        </td>
                        <td className="py-2 px-3 text-right font-mono border-r border-slate-200">
                          {s.totalAuditFee.toLocaleString()}원
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                          {netPayout.toLocaleString()}원
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-200 text-[11px] text-slate-600">
                          3.3% 원천징수
                        </td>
                        <td className="py-2 px-2 text-center">
                          {isPaid ? (
                            <span className="text-emerald-700 font-bold text-[11.5px]">지급완료</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onUpdateSettlementStatus && onUpdateSettlementStatus(s.id, '지급완료')}
                              className="px-2 py-0.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[11px] font-semibold transition cursor-pointer"
                            >
                              지급확인
                            </button>
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

        {/* 4. 일반사항 & 자료관리 뷰 */}
        {activeSubTab === 'general' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">일반 행정 사항 및 시스템 DB 백업 관리</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                사무국 내부 데이터베이스 현황 조회 및 로컬/외장 USB 백업 파일을 생성합니다.
              </p>
            </div>

            {/* 평면 데이터 통계 바 */}
            <div className="grid grid-cols-4 gap-3 border border-slate-300 rounded-lg p-3 bg-slate-50">
              <div>
                <div className="text-slate-500 text-[11px] font-medium">관리 대상 고객사 수</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{companies.length}개사</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px] font-medium">등록 공인 심사원 수</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{auditors.length}명</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px] font-medium">2026 실 심사 프로젝트</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{projects.length}건</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px] font-medium">DB 동기화 상태</div>
                <div className="text-xl font-bold text-emerald-700 mt-0.5">정상 연동 중</div>
              </div>
            </div>

            {/* 백업 액션 영역 */}
            <div className="border border-slate-300 rounded-lg p-4 space-y-3">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-cyan-800" />
                <span>데이터 전체 백업 및 외장 저장장치 보관</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                현재 등록된 고객사 대장, 심사원 자격 정보, 2026 심사 일정 및 계약 데이터를 JSON 규격으로 완전 백업합니다. 생성된 파일은 사무국 전용 외장 USB 또는 보안 스토리지에 안전하게 보관할 수 있습니다.
              </p>

              {backupMessage && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-xs font-semibold">
                  ✓ {backupMessage}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>전체 DB 백업 다운로드 (.json)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. 스마트 메일 센터 뷰 */}
        {activeSubTab === 'mail' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">스마트 메일 발송 센터</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  심사계획서 공문 발송, 심사원 배정 통보, 차기 심사안내 및 고객사 공문을 발송합니다.
                </p>
              </div>
              {onOpenEmailModal && (
                <button
                  type="button"
                  onClick={onOpenEmailModal}
                  className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>새 메일 작성</span>
                </button>
              )}
            </div>

            {/* 최근 발송 내역 평면 테이블 */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[12px]">
                    <th className="py-2.5 px-3 border-r border-slate-300">발송 일시</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">서식 템플릿</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">수신 기업/담당자</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">수신 이메일</th>
                    <th className="py-2.5 px-2 text-center">전송 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500 border-r border-slate-200">2026-09-08 14:20</td>
                    <td className="py-2.5 px-3 font-semibold text-cyan-900 border-r border-slate-200">심사계획서 공문 통보</td>
                    <td className="py-2.5 px-3 font-medium border-r border-slate-200">주식회사 송이실업 (김홍덕 팀장)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200">quality@songi.co.kr</td>
                    <td className="py-2.5 px-2 text-center text-emerald-700 font-bold">발송 성공 ✓</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500 border-r border-slate-200">2026-09-07 10:15</td>
                    <td className="py-2.5 px-3 font-semibold text-cyan-900 border-r border-slate-200">심사일정 협의 공문</td>
                    <td className="py-2.5 px-3 font-medium border-r border-slate-200">(주)아하 (품질경영팀)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200">cert@aha.co.kr</td>
                    <td className="py-2.5 px-2 text-center text-emerald-700 font-bold">발송 성공 ✓</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500 border-r border-slate-200">2026-09-05 16:40</td>
                    <td className="py-2.5 px-3 font-semibold text-cyan-900 border-r border-slate-200">인증서 갱신 안내문</td>
                    <td className="py-2.5 px-3 font-medium border-r border-slate-200">아이엔지텍 주식회사</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200">admin@ingtech.kr</td>
                    <td className="py-2.5 px-2 text-center text-emerald-700 font-bold">발송 성공 ✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
