import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Shield
} from 'lucide-react';
import { Auditor, AuditorAffiliation, AuditProject, CertContract, Company } from '../types';
import { AuditorProfileModal } from './AuditorProfileModal';
import { extractProvinceName, updateAuditorInDb } from '../services/auditorService';

export interface AuditorManagementProps {
  auditors: Auditor[];
  projects?: AuditProject[];
  contracts?: CertContract[];
  companies?: Company[];
  onToggleCommitteeMember?: (auditorId: string) => void;
  onUpdateAuditorAffiliation?: (auditorId: string, affiliation: AuditorAffiliation) => void;
  onSelectAuditor?: (auditor: Auditor) => void;
  onSaveAuditor?: (updatedAuditor: Auditor) => void;
  onOpenPdfReport?: (info: { title: string; companyName: string; standard?: string; auditType?: string; auditDate?: string; pdfUrl?: string }) => void;
}

const PAGE_SIZE = 20;

export const AuditorManagement: React.FC<AuditorManagementProps> = ({
  auditors,
  projects = [],
  contracts = [],
  companies = [],
  onToggleCommitteeMember,
  onUpdateAuditorAffiliation,
  onSelectAuditor,
  onSaveAuditor,
  onOpenPdfReport
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedAffiliation, setSelectedAffiliation] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [detailAuditor, setDetailAuditor] = useState<Auditor | null>(null);

  // 권한 변경 핸들러 (사무국 화면 접근 관리자 권한)
  const handleToggleAdminRole = async (aud: Auditor, newRole: boolean) => {
    const updated: Auditor = {
      ...aud,
      isSystemAdmin: newRole,
      isAdmin: newRole
    };
    if (onSaveAuditor) {
      onSaveAuditor(updated);
    }
    try {
      await updateAuditorInDb(updated);
    } catch (e) {
      console.error('권한 변경 Firestore 동기화 실패:', e);
    }
  };

  // Filter auditors
  const filteredAuditors = useMemo(() => {
    const cleanSearch = searchTerm.replace(/\s+/g, '').toLowerCase();

    return auditors.filter(a => {
      const name = a.name.replace(/\s+/g, '').toLowerCase();
      const mobile = (a.mobile || '').replace(/[-\s]/g, '');
      const email = (a.email || '').toLowerCase();
      const gmsNo = (a.gmsNumber || '').toLowerCase();
      const iaf = a.iafCodes.join(' ').toLowerCase();
      const region = (a.region || extractProvinceName(a.address, a.residentialRegion)).toLowerCase();

      const matchesSearch = !cleanSearch ||
        name.includes(cleanSearch) ||
        mobile.includes(cleanSearch) ||
        email.includes(cleanSearch) ||
        gmsNo.includes(cleanSearch) ||
        region.includes(cleanSearch) ||
        iaf.includes(cleanSearch);

      const matchesGrade = selectedGrade === 'all' || a.grade === selectedGrade;
      const matchesAffiliation = selectedAffiliation === 'all' || a.affiliation === selectedAffiliation;
      const matchesRegion = selectedRegion === 'all' || region.includes(selectedRegion.toLowerCase());

      return matchesSearch && matchesGrade && matchesAffiliation && matchesRegion;
    });
  }, [auditors, searchTerm, selectedGrade, selectedAffiliation, selectedRegion]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAuditors.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedAuditors = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredAuditors.slice(start, start + PAGE_SIZE);
  }, [filteredAuditors, safePage]);

  return (
    <div className="space-y-3 animate-in fade-in">
      {/* 1. 상단 단일 조회바 */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* 검색창 */}
          <div className="relative min-w-[240px] max-w-[340px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="심사원명, 등록번호, 지역, 연락처, IAF 코드 검색"
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 focus:bg-white font-normal"
            />
          </div>

          {/* 자격 등급 필터 */}
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-normal focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 자격 등급</option>
            <option value="선임심사원">선임심사원</option>
            <option value="정심사원">정심사원</option>
            <option value="심사원보">심사원보</option>
          </select>

          {/* 소속 구분 필터 */}
          <select
            value={selectedAffiliation}
            onChange={(e) => {
              setSelectedAffiliation(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-normal focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 소속 구분</option>
            <option value="상근">상근 (사무국)</option>
            <option value="비상근">비상근 심사원</option>
          </select>

          {/* 지역 필터 */}
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-normal focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 지역</option>
            <option value="서울">서울</option>
            <option value="경기">경기</option>
            <option value="인천">인천</option>
            <option value="대구">대구</option>
            <option value="부산">부산</option>
            <option value="대전">대전</option>
            <option value="광주">광주</option>
            <option value="충남">충남</option>
            <option value="충북">충북</option>
            <option value="경북">경북</option>
            <option value="경남">경남</option>
            <option value="전북">전북</option>
            <option value="전남">전남</option>
          </select>
        </div>

        {/* 우측 카운터 및 페이지네이션 */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
          <div>
            총 <strong className="text-cyan-700 font-bold">{filteredAuditors.length}</strong>명
            <span className="text-slate-400 ml-1">({safePage}/{totalPages}p)</span>
          </div>
          <div className="inline-flex items-center bg-slate-50 border border-slate-300 rounded-lg p-0.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 hover:bg-white disabled:opacity-30 rounded transition cursor-pointer"
              title="이전 페이지"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold text-xs">{safePage}</span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 hover:bg-white disabled:opacity-30 rounded transition cursor-pointer"
              title="다음 페이지"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 심사원관리 엑셀 목록형 테이블 */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 select-none text-[12px]">
                <th className="py-2.5 px-2 text-center w-10 text-slate-500 font-normal border-r border-slate-300">
                  No
                </th>
                <th className="py-2.5 px-3 min-w-[130px] font-normal border-r border-slate-300">
                  심사원명 (등록번호)
                </th>
                <th className="py-2.5 px-2 text-center min-w-[70px] font-normal border-r border-slate-300">
                  지역
                </th>
                <th className="py-2.5 px-2 text-center min-w-[80px] font-normal border-r border-slate-300">
                  소속
                </th>
                <th className="py-2.5 px-2 text-center min-w-[90px] font-normal border-r border-slate-300">
                  자격 등급
                </th>
                <th className="py-2.5 px-3 min-w-[150px] font-normal border-r border-slate-300">
                  등록 규격
                </th>
                <th className="py-2.5 px-3 min-w-[140px] font-normal border-r border-slate-300">
                  IAF 전문 코드
                </th>
                <th className="py-2.5 px-2 text-center min-w-[140px] font-normal border-r border-slate-300 bg-slate-50/70">
                  사무국 접근 권한 (관리자)
                </th>
                <th className="py-2.5 px-2 text-center min-w-[100px] font-normal border-r border-slate-300">
                  심의위원 자격
                </th>
                <th className="py-2.5 px-3 min-w-[120px] font-normal">
                  연락처 (휴대폰)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-normal">
              {paginatedAuditors.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-normal">
                    검색 조건에 일치하는 심사원 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedAuditors.map((aud, idx) => {
                  const isStaff = aud.affiliation === '상근';
                  const regStdText = aud.registeredStandards.map(s => s.replace('ISO ', '')).join(', ');
                  const region = aud.region || extractProvinceName(aud.address, aud.residentialRegion);
                  const isAdmin = Boolean(aud.isSystemAdmin || aud.isAdmin);

                  return (
                    <tr
                      key={aud.id}
                      onClick={() => {
                        setDetailAuditor(aud);
                        if (onSelectAuditor) onSelectAuditor(aud);
                      }}
                      className="hover:bg-slate-50/80 transition cursor-pointer font-normal"
                      title="클릭 시 심사원 자격, 이력, 교육/세미나 이수 상세를 확인합니다."
                    >
                      {/* No */}
                      <td className="py-2 px-1 text-center font-mono text-slate-400 text-xs align-middle border-r border-slate-200 font-normal">
                        {(safePage - 1) * PAGE_SIZE + idx + 1}
                      </td>

                      {/* 심사원명 */}
                      <td className="py-2 px-3 align-middle border-r border-slate-200">
                        <div className="text-slate-900 flex items-center gap-1.5 font-bold">
                          <span>{aud.name}</span>
                          {aud.isSystemAdmin && (
                            <span className="px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-900 font-normal rounded border border-amber-300">관리자</span>
                          )}
                        </div>
                        {aud.gmsNumber && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5 font-normal">
                            {aud.gmsNumber}
                          </div>
                        )}
                      </td>

                      {/* 지역 (광역자치단체명) */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-[11.5px] font-normal">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-normal">
                          {region}
                        </span>
                      </td>

                      {/* 소속 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-[11.5px] font-normal">
                        <span className={isStaff ? 'text-amber-800 font-normal' : 'text-slate-600 font-normal'}>
                          {aud.affiliation}
                        </span>
                      </td>

                      {/* 자격 등급 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 font-normal">
                        <span className={`text-[11.5px] font-normal ${
                          aud.grade === '선임심사원' ? 'text-blue-700' : 'text-slate-800'
                        }`}>
                          {aud.grade}
                        </span>
                      </td>

                      {/* 등록 규격 */}
                      <td className="py-2 px-3 leading-snug align-middle border-r border-slate-200 text-[11.5px] text-slate-800 whitespace-nowrap font-normal">
                        {regStdText || 'ISO 9001:2015'}
                      </td>

                      {/* IAF 전문 코드 */}
                      <td className="py-2 px-3 leading-snug align-middle border-r border-slate-200 text-[12px] text-slate-700 font-normal">
                        {aud.iafCodes && aud.iafCodes.length > 0 ? aud.iafCodes.join(', ') : '-'}
                      </td>

                      {/* 사무국 접근 권한 (관리자 권한 토글/선택) */}
                      <td 
                        className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-[11.5px] font-normal"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={isAdmin ? 'admin' : 'auditor'}
                          onChange={(e) => handleToggleAdminRole(aud, e.target.value === 'admin')}
                          className={`text-xs py-1 px-2 rounded border font-normal cursor-pointer focus:outline-hidden ${
                            isAdmin 
                              ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-medium' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 font-normal'
                          }`}
                          title="사무국 전체 관리 화면 접근 권한을 설정합니다. (초기 비밀번호: gms9001)"
                        >
                          <option value="auditor">일반 심사원 (전용 포털)</option>
                          <option value="admin">사무국 관리자 (전체 접근)</option>
                        </select>
                      </td>

                      {/* 심의위원 자격 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-[11.5px] font-normal">
                        {aud.isCommitteeMember ? (
                          <span className="text-indigo-700 font-normal">
                            {aud.committeeRole || '심의위원'}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal">-</span>
                        )}
                      </td>

                      {/* 연락처 */}
                      <td className="py-2 px-3 align-middle text-[11.5px] text-slate-800 whitespace-nowrap font-normal">
                        <div className="font-mono font-normal">{aud.mobile || '-'}</div>
                        <div className="text-[10.5px] text-slate-500 mt-0.5 font-normal">{aud.email || '-'}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 테이블 푸터 */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-normal">
          <div>
            * 심사원 기본 초기 비밀번호는 <code className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold">gms9001</code>이며, 교육 이수 및 세미나 상세는 행 클릭 시 팝업에서 조회 가능합니다.
          </div>
          <div className="font-mono text-slate-600 font-normal">
            총 {filteredAuditors.length}명 중 {Math.min(filteredAuditors.length, (safePage - 1) * PAGE_SIZE + 1)} ~ {Math.min(filteredAuditors.length, safePage * PAGE_SIZE)}명 표시
          </div>
        </div>
      </div>

      {/* 심사원 상세정보 팝업 모달 */}
      {detailAuditor && (
        <AuditorProfileModal
          isOpen={Boolean(detailAuditor)}
          onClose={() => setDetailAuditor(null)}
          auditor={detailAuditor}
          projects={projects}
          contracts={contracts}
          companies={companies}
          onSave={(updated: Auditor) => {
            setDetailAuditor(updated);
            if (onSaveAuditor) onSaveAuditor(updated);
            updateAuditorInDb(updated);
          }}
          onOpenPdfReport={onOpenPdfReport}
        />
      )}
    </div>
  );
};
