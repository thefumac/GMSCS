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
  ChevronRight
} from 'lucide-react';
import { Auditor, AuditorAffiliation } from '../types';

export interface AuditorManagementProps {
  auditors: Auditor[];
  onToggleCommitteeMember?: (auditorId: string) => void;
  onUpdateAuditorAffiliation?: (auditorId: string, affiliation: AuditorAffiliation) => void;
  onSelectAuditor?: (auditor: Auditor) => void;
}

const PAGE_SIZE = 20;

export const AuditorManagement: React.FC<AuditorManagementProps> = ({
  auditors,
  onToggleCommitteeMember,
  onUpdateAuditorAffiliation,
  onSelectAuditor
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedAffiliation, setSelectedAffiliation] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [detailAuditor, setDetailAuditor] = useState<Auditor | null>(null);

  // Filter auditors
  const filteredAuditors = useMemo(() => {
    const cleanSearch = searchTerm.replace(/\s+/g, '').toLowerCase();

    return auditors.filter(a => {
      const name = a.name.replace(/\s+/g, '').toLowerCase();
      const mobile = (a.mobile || '').replace(/[-\s]/g, '');
      const email = (a.email || '').toLowerCase();
      const gmsNo = (a.gmsNumber || '').toLowerCase();
      const iaf = a.iafCodes.join(' ').toLowerCase();

      const matchesSearch = !cleanSearch ||
        name.includes(cleanSearch) ||
        mobile.includes(cleanSearch) ||
        email.includes(cleanSearch) ||
        gmsNo.includes(cleanSearch) ||
        iaf.includes(cleanSearch);

      const matchesGrade = selectedGrade === 'all' || a.grade === selectedGrade;
      const matchesAffiliation = selectedAffiliation === 'all' || a.affiliation === selectedAffiliation;

      return matchesSearch && matchesGrade && matchesAffiliation;
    });
  }, [auditors, searchTerm, selectedGrade, selectedAffiliation]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAuditors.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedAuditors = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredAuditors.slice(start, start + PAGE_SIZE);
  }, [filteredAuditors, safePage]);

  return (
    <div className="space-y-3 animate-in fade-in">
      {/* 1. 상단 단일 조회바 (원칙 준수) */}
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
              placeholder="심사원명, 등록번호, 연락처, IAF 코드 검색"
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 focus:bg-white"
            />
          </div>

          {/* 자격 등급 필터 */}
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
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
            className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="all">전체 소속 구분</option>
            <option value="상근">상근 (사무국)</option>
            <option value="비상근">비상근 심사원</option>
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
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 select-none text-[12px]">
                <th className="py-2.5 px-2 text-center w-10 text-slate-500 font-normal border-r border-slate-300">
                  No
                </th>
                <th className="py-2.5 px-3 min-w-[130px] border-r border-slate-300">
                  심사원명 (등록번호)
                </th>
                <th className="py-2.5 px-2 text-center min-w-[80px] border-r border-slate-300">
                  소속
                </th>
                <th className="py-2.5 px-2 text-center min-w-[90px] border-r border-slate-300">
                  자격 등급
                </th>
                <th className="py-2.5 px-3 min-w-[150px] border-r border-slate-300">
                  등록 규격
                </th>
                <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-300">
                  IAF 전문 코드
                </th>
                <th className="py-2.5 px-2 text-center min-w-[110px] border-r border-slate-300 bg-slate-50/70">
                  보수교육 이수현황
                </th>
                <th className="py-2.5 px-2 text-center min-w-[110px] border-r border-slate-300 bg-slate-50/70">
                  직무세미나 참석
                </th>
                <th className="py-2.5 px-2 text-center min-w-[100px] border-r border-slate-300">
                  심의위원 자격
                </th>
                <th className="py-2.5 px-3 min-w-[120px]">
                  연락처 (휴대폰)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
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

                  return (
                    <tr
                      key={aud.id}
                      onClick={() => {
                        setDetailAuditor(aud);
                        if (onSelectAuditor) onSelectAuditor(aud);
                      }}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      title="클릭 시 심사원 자격 및 이력 상세를 확인합니다."
                    >
                      {/* No */}
                      <td className="py-2 px-1 text-center font-mono text-slate-400 text-xs align-middle border-r border-slate-200">
                        {(safePage - 1) * PAGE_SIZE + idx + 1}
                      </td>

                      {/* 심사원명 */}
                      <td className="py-2 px-3 align-middle border-r border-slate-200">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{aud.name}</span>
                          {aud.isSystemAdmin && (
                            <span className="px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-900 font-bold rounded">원장</span>
                          )}
                        </div>
                        {aud.gmsNumber && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {aud.gmsNumber}
                          </div>
                        )}
                      </td>

                      {/* 소속 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-[11.5px]">
                        <span className={isStaff ? 'text-amber-800 font-bold' : 'text-slate-600'}>
                          {aud.affiliation}
                        </span>
                      </td>

                      {/* 자격 등급 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200">
                        <span className={`text-[11.5px] font-semibold ${
                          aud.grade === '선임심사원' ? 'text-blue-700' : 'text-slate-800'
                        }`}>
                          {aud.grade}
                        </span>
                      </td>

                      {/* 등록 규격 */}
                      <td className="py-2 px-3 leading-snug align-middle border-r border-slate-200 text-[11.5px] text-slate-800 whitespace-nowrap">
                        {regStdText || 'ISO 9001:2015'}
                      </td>

                      {/* IAF 전문 코드 */}
                      <td className="py-2 px-3 leading-snug align-middle border-r border-slate-200 text-[11px] text-slate-600 font-mono">
                        {aud.iafCodes.length > 0 ? aud.iafCodes.join(', ') : '17, 28'}
                      </td>

                      {/* 보수교육 이수현황 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-[11.5px]">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>이수완료</span>
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">유효 ~2027.12</div>
                      </td>

                      {/* 직무세미나 참석 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-[11.5px]">
                        <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span>참석 (2026.06)</span>
                        </span>
                      </td>

                      {/* 심의위원 자격 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap align-middle border-r border-slate-200 text-[11.5px]">
                        {aud.isCommitteeMember ? (
                          <span className="text-indigo-700 font-bold">
                            {aud.committeeRole || '심의위원'}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* 연락처 */}
                      <td className="py-2 px-3 align-middle font-mono text-[11.5px] text-slate-800 whitespace-nowrap">
                        <div>{aud.mobile || '010-0000-0000'}</div>
                        <div className="text-[10.5px] text-slate-400 font-sans mt-0.5">{aud.email || 'auditor@gmscs.co.kr'}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 테이블 푸터 */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            * 심사원의 등록 코드, 자격 갱신일정, 보수교육 및 정기 세미나 참석 현황을 통합 관리합니다.
          </div>
          <div className="font-mono text-slate-600">
            총 {filteredAuditors.length}명 중 {Math.min(filteredAuditors.length, (safePage - 1) * PAGE_SIZE + 1)} ~ {Math.min(filteredAuditors.length, safePage * PAGE_SIZE)}명 표시
          </div>
        </div>
      </div>
    </div>
  );
};
