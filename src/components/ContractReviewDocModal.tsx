import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';
import { Company, AuditProject, Auditor, AuditContractRecord } from '../types';
import { cleanCeoName } from '../utils/personUtils';

export interface ContractReviewDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  contract?: AuditContractRecord | null;
  project?: AuditProject | null;
  auditor?: Auditor | null;
}

export const ContractReviewDocModal: React.FC<ContractReviewDocModalProps> = ({
  isOpen,
  onClose,
  company,
  contract,
  project,
  auditor
}) => {
  if (!isOpen || !company) return null;

  const compName = company.companyName;
  const address = company.address || '';
  const certNo = (company as any).certNo || contract?.contractNumber || '';
  const iafCode = company.iafCode || '';
  const scope = company.scope || '';
  const ksicCode = (company as any).ksicCode || '';
  const totalEmployees = company.totalEmployees || 0;
  const appliedMd = contract?.appliedMd || project?.appliedMd || 2.0;
  const startDate = project?.startDate || contract?.plannedAuditStartDate || '';

  const invalidKeywords = ['수금', '미수', '입금', '청구', 'HQ', '직영', '협력기관', '미배정', '사무국', 'admin'];
  const rawLead = project?.leadAuditorName || contract?.leadAuditorName || auditor?.name || '';
  const isInvalidLead = !rawLead || invalidKeywords.some(kw => rawLead.includes(kw));
  const leadAuditor = isInvalidLead ? '' : rawLead;

  const reviewDate = contract?.contractDate || project?.startDate || new Date().toISOString().substring(0, 10);

  const stdList = company.standards ? (Array.isArray(company.standards) ? company.standards : [company.standards]) : ['ISO 9001:2015'];
  const hasIso9001 = stdList.some(s => s.includes('9001'));
  const hasIso14001 = stdList.some(s => s.includes('14001'));
  const hasIso45001 = stdList.some(s => s.includes('45001'));
  const hasIso22000 = stdList.some(s => s.includes('22000'));

  const auditType = project?.auditType || contract?.contractType || '사후심사';
  const isInitial = auditType.includes('최초') || auditType.includes('신규');
  const isSurveillance = auditType.includes('사후');
  const isRenewal = auditType.includes('갱신');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-2xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-2xl border border-slate-400 overflow-hidden my-auto flex flex-col max-h-[95vh] text-[11px] text-slate-900">
        
        {/* 상단 브라우저 타이틀 바 (실물 ERP 헤더 준용) */}
        <div className="bg-[#2D425A] text-white px-4 py-2 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight">계약검토보고서</span>
            <span className="text-slate-300 text-[11px] font-mono">
              (gms.z99.kr/Admin/MenuD/D001_Add.do)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄 / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 메인 폼 본문 (실물 ERP 스크린샷 1:1 완벽 재현) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 bg-white font-sans">
          
          {/* 상단 서식 제목 및 관리번호/검토일자 헤더 */}
          <div className="flex items-start justify-between pb-2 border-b border-slate-300">
            <div>
              <h2 className="text-base font-bold text-slate-900">계약검토보고서</h2>
              <p className="text-[10px] text-slate-500 font-mono">gms.z99.kr/Admin/MenuD/D001_Add.do</p>
            </div>
            <div className="text-right text-xs space-y-1">
              <div className="flex items-center justify-end gap-1.5">
                <span className="font-semibold text-slate-700">관리번호:</span>
                <input 
                  type="text" 
                  defaultValue={contract?.contractNumber || ''} 
                  placeholder="직접 입력" 
                  className="w-36 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono" 
                />
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-slate-600">검토일자:</span>
                <input 
                  type="text" 
                  defaultValue={reviewDate || ''} 
                  placeholder="YYYY-MM-DD" 
                  className="w-28 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono text-center" 
                />
              </div>
            </div>
          </div>

          {/* 1. 기본 정보 테이블 */}
          <table className="w-full border-collapse border border-slate-400 text-xs">
            <tbody>
              <tr className="border-b border-slate-300">
                <th className="w-24 bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">고객명</th>
                <td className="p-1.5 border-r border-slate-300">{compName}</td>
                <th className="w-24 bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">인증번호</th>
                <td className="p-1.5 font-mono">
                  {certNo ? (
                    <span>{certNo}</span>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="최초인 경우 직접 입력" 
                      className="w-44 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono" 
                    />
                  )}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">주소</th>
                <td className="p-1.5" colSpan={3}>{address}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium" rowSpan={3}>인증표준</th>
                <td className="p-1.5 border-r border-slate-300">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1"><input type="checkbox" checked={hasIso9001} readOnly /> ISO 9001:2015</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={hasIso14001} readOnly /> ISO 14001:2015</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={hasIso45001} readOnly /> 기타 ( {hasIso45001 ? 'ISO 45001:2018' : ''} )</label>
                  </div>
                </td>
                <th className="w-24 bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">code</th>
                <td className="p-1.5 font-mono">{iafCode}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-1.5 border-r border-slate-300 text-slate-400"></td>
                <th className="bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">KSIC(산업분류코드)</th>
                <td className="p-1.5 font-mono">{ksicCode}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-1.5 border-r border-slate-300">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1"><input type="checkbox" checked={hasIso22000} readOnly /> ISO 22000:2018</label>
                    <span>Category: _________</span>
                    <span>HACCP 수: ___</span>
                  </div>
                </td>
                <th className="bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">총 사업장 수</th>
                <td className="p-1.5">
                  <div className="flex items-center justify-between">
                    <span>1</span>
                    <span className="text-slate-500">심사대상 사업장 수: 1</span>
                  </div>
                </td>
              </tr>
              <tr>
                <th className="bg-slate-100 p-1.5 border-r border-slate-300 text-left font-medium">신청인증 범위</th>
                <td className="p-1.5 leading-relaxed" colSpan={3}>{scope || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* 2. 심사종류 및 세부 M/D 배정 테이블 */}
          <div className="border border-slate-400">
            <div className="p-1.5 bg-slate-50 border-b border-slate-300 flex items-center gap-6 font-medium">
              <label className="flex items-center gap-1.5"><input type="checkbox" checked={isInitial} readOnly /> 최초심사</label>
              <label className="flex items-center gap-1.5"><input type="checkbox" checked={isSurveillance} readOnly /> 사후심사</label>
              <label className="flex items-center gap-1.5"><input type="checkbox" checked={isRenewal} readOnly /> 갱신심사</label>
              <label className="flex items-center gap-1.5"><input type="checkbox" checked={!isInitial && !isSurveillance && !isRenewal} readOnly /> 기타( _________ )</label>
            </div>
            <table className="w-full border-collapse text-center text-xs">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="w-24 p-1.5 border-r border-slate-300">심사종류</th>
                  <th className="p-1.5 border-r border-slate-300"><input type="checkbox" readOnly /> 예비심사</th>
                  <th className="p-1.5 border-r border-slate-300"><input type="checkbox" checked={isInitial} readOnly /> 1단계심사</th>
                  <th className="p-1.5 border-r border-slate-300"><input type="checkbox" checked={isInitial || isRenewal || isSurveillance} readOnly /> 2단계심사</th>
                  <th className="p-1.5 border-r border-slate-300"><input type="checkbox" readOnly /> 방문심사</th>
                  <th className="p-1.5"><input type="checkbox" readOnly /> 기타( )</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <th className="bg-slate-100 p-1.5 border-r border-slate-300 font-medium">심사 M/D</th>
                  <td className="p-1.5 border-r border-slate-300 font-mono">0.00 M/D</td>
                  <td className="p-1.5 border-r border-slate-300 font-mono">{isInitial ? '0.50 M/D' : '0.00 M/D'}</td>
                  <td className="p-1.5 border-r border-slate-300 font-mono font-bold">{appliedMd.toFixed(2)} M/D</td>
                  <td className="p-1.5 border-r border-slate-300 font-mono">0.00 M/D</td>
                  <td className="p-1.5 font-mono">0.00 M/D</td>
                </tr>
                <tr>
                  <th className="bg-slate-100 p-1.5 border-r border-slate-300 font-medium">심사예정시기</th>
                  <td className="p-1.5 border-r border-slate-300 font-mono">-</td>
                  <td className="p-1.5 border-r border-slate-300 font-mono">{isInitial ? startDate : '-'}</td>
                  <td className="p-1.5 border-r border-slate-300 font-mono font-bold">{startDate || '-'}</td>
                  <td className="p-1.5 border-r border-slate-300 font-mono">-</td>
                  <td className="p-1.5 font-mono">-</td>
                </tr>
                <tr>
                  <th className="bg-slate-100 p-1.5 border-r border-slate-300 font-medium">CODE심사원</th>
                  <td className="p-1.5 border-r border-slate-300 font-mono">-</td>
                  <td className="p-1.5 border-r border-slate-300 font-mono">-</td>
                  <td className="p-1.5 border-r border-slate-300 font-bold">{leadAuditor || '-'}</td>
                  <td className="p-1.5 border-r border-slate-300 font-mono">-</td>
                  <td className="p-1.5 font-mono">-</td>
                </tr>
                <tr>
                  <th className="bg-slate-100 p-1.5 border-r border-slate-300 font-medium">특기사항</th>
                  <td className="p-1.5 border-r border-slate-300"></td>
                  <td className="p-1.5 border-r border-slate-300"></td>
                  <td className="p-1.5 border-r border-slate-300"></td>
                  <td className="p-1.5 border-r border-slate-300"></td>
                  <td className="p-1.5"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. 검토대상 바 */}
          <div className="p-1.5 bg-slate-100 border border-slate-400 font-medium text-slate-800">
            검토대상: 1. 신청서 및 설문서 &nbsp;&nbsp; 2. 인증제안 &nbsp;&nbsp; 3. 인증계약서 &nbsp;&nbsp; 4. 첨부서류
          </div>

          {/* 4. 검토내용 및 결과 메인 테이블 */}
          <table className="w-full border-collapse border border-slate-400 text-xs">
            <thead className="bg-slate-100 border-b border-slate-400 font-bold text-center">
              <tr>
                <th className="w-24 p-1.5 border-r border-slate-300">구분</th>
                <th className="p-1.5 border-r border-slate-300">검토항목</th>
                <th className="w-40 p-1.5 border-r border-slate-300">기준</th>
                <th className="w-48 p-1.5">검토결과</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              <tr>
                <th className="bg-slate-100 p-2 border-r border-slate-300 font-medium text-center" rowSpan={8}>
                  검토내용 및 결과
                </th>
                <td className="p-1.5 border-r border-slate-300">
                  <div className="font-semibold mb-1">심사일수외 적절성(공통) - 다음사항에 따라 가감 적용(20% 이내)</div>
                  <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                    <div className="flex items-center justify-between pr-2">
                      <span>1) 직원수 ( {totalEmployees || ''} )명</span>
                      <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                    </div>
                    <div className="flex items-center justify-between pr-2">
                      <span>2) 언어(통역필요 유무)</span>
                      <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                    </div>
                    <div className="flex items-center justify-between pr-2">
                      <span>3) 현장 순회 및 이동시간</span>
                      <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                    </div>
                    <div className="flex items-center justify-between pr-2">
                      <span>4) 인증범위 복합성 (시스템 복합성)</span>
                      <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                    </div>
                    <div className="flex items-center justify-between pr-2">
                      <span>5) 설계의 책임</span>
                      <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                    </div>
                    <div className="flex items-center justify-between pr-2">
                      <span>6) 타 인증기관의 인증 (유사인증)</span>
                      <span><input type="checkbox" /> 유 <input type="checkbox" /> 무</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-between pr-2 pt-1 border-t border-slate-200">
                      <span>7) 공정의 단순성, 현장의수</span>
                      <input type="text" className="border border-slate-300 rounded px-1.5 py-0.5 w-44" placeholder="" />
                    </div>
                  </div>
                </td>
                <td className="p-1.5 border-r border-slate-300 text-center align-middle font-mono font-medium">
                  KSP-17-17 &amp; KSI-03
                </td>
                <td className="p-1.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>기준일수</span>
                    <span className="font-mono">{appliedMd ? `${appliedMd.toFixed(2)} M/D` : ''}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-1">
                    <span>적용 %</span>
                    <input type="text" className="w-16 border border-slate-300 rounded px-1 py-0.5 text-right font-mono" placeholder="%" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>가감요인 MD</span>
                    <input type="text" className="w-16 border border-slate-300 rounded px-1 py-0.5 text-right font-mono" placeholder="M/D" />
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span>품질리스크:</span>
                      <select className="border border-slate-300 rounded px-1 py-0.2 bg-white text-[10px]">
                        <option value="">- 선택 -</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>환경복잡성:</span>
                      <select className="border border-slate-300 rounded px-1 py-0.2 bg-white text-[10px]">
                        <option value="">- 선택 -</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div><input type="checkbox" /> 시스템 통합</div>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="p-1.5 border-r border-slate-300">
                  <div className="font-semibold mb-1 flex items-center gap-2">
                    <span>환경경영시스템 인증범위 리스크:</span>
                    <label className="flex items-center gap-1 font-normal"><input type="checkbox" /> H</label>
                    <label className="flex items-center gap-1 font-normal"><input type="checkbox" /> M</label>
                    <label className="flex items-center gap-1 font-normal"><input type="checkbox" /> L</label>
                  </div>
                  <div className="text-[11px] space-y-1">
                    <div className="flex items-center gap-2">
                      <span>1) 법적허가:</span>
                      <span>대기( <input type="text" className="w-8 border border-slate-300 rounded px-1 py-0.2 text-center" /> )종,</span>
                      <span>수질( <input type="text" className="w-8 border border-slate-300 rounded px-1 py-0.2 text-center" /> )종</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>2) 연간 폐기물 발생량:</span>
                      <input type="text" className="w-16 border border-slate-300 rounded px-1 py-0.2 text-center" /> 톤
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>3) 위치:</span>
                      <label className="flex items-center gap-1"><input type="checkbox" /> 도시</label>
                      <label className="flex items-center gap-1"><input type="checkbox" /> 농촌</label>
                      <label className="flex items-center gap-1"><input type="checkbox" /> 공업단지</label>
                      <label className="flex items-center gap-1"><input type="checkbox" /> 기타</label>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span>통합 시스템 평가: 1) 통합시스템 수준 및 수행능력 (%):</span>
                      <input type="text" className="w-12 border border-slate-300 rounded px-1 py-0.2 text-center" placeholder="%" />
                    </div>
                  </div>
                </td>
                <td className="p-1.5 border-r border-slate-300 text-center font-mono">기타: ( <input type="text" className="w-20 border-b border-slate-400 bg-transparent text-center" /> )</td>
                <td className="p-1.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>결정 M/D :</span>
                    <input type="text" className="w-16 border border-slate-300 rounded px-1 py-0.5 text-center font-mono" placeholder="M/D" />
                  </div>
                </td>
              </tr>

              <tr>
                <td className="p-1.5 border-r border-slate-300 font-medium">
                  심사일수 결정
                </td>
                <td className="p-1.5 border-r border-slate-300 text-center font-mono">MD Table</td>
                <td className="p-1.5 text-center">
                  <input type="text" className="w-24 border border-slate-300 rounded px-1.5 py-0.5 text-center font-mono" placeholder="M/D" />
                </td>
              </tr>

              <tr>
                <td className="p-1.5 border-r border-slate-300 font-medium">
                  심사비 적절성 (필요한 심사일수 확보 여부)
                </td>
                <td className="p-1.5 border-r border-slate-300 text-center font-mono">MD Table</td>
                <td className="p-1.5 text-center">
                  <select className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-white">
                    <option value="">- 선택 -</option>
                    <option value="적합">적합</option>
                    <option value="부적합">부적합</option>
                    <option value="해당없음">해당없음</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td className="p-1.5 border-r border-slate-300 font-medium">
                  심사원 선정 (인증수행범위 및 세부인증수행범위 해당여부)
                </td>
                <td className="p-1.5 border-r border-slate-300 text-center font-mono">심사자원</td>
                <td className="p-1.5 text-center">
                  <select className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-white">
                    <option value="">- 선택 -</option>
                    <option value="적합">적합</option>
                    <option value="부적합">부적합</option>
                    <option value="해당없음">해당없음</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td className="p-1.5 border-r border-slate-300 font-medium">
                  인증범위의 적절성(신청범위에 대한 심사 가능) EMS의 경우 조직의 활동이 제외되는지 여부
                </td>
                <td className="p-1.5 border-r border-slate-300 text-center font-mono">계약검토 절차</td>
                <td className="p-1.5 text-center">
                  <select className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-white">
                    <option value="">- 선택 -</option>
                    <option value="적합">적합</option>
                    <option value="부적합">부적합</option>
                    <option value="해당없음">해당없음</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td className="p-1.5 border-r border-slate-300 font-medium">
                  전환심사의 경우-기 인증유효성확인(ICIN)
                </td>
                <td className="p-1.5 border-r border-slate-300 text-center font-mono">심사절차</td>
                <td className="p-1.5 text-center">
                  <select className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-white">
                    <option value="">- 선택 -</option>
                    <option value="적합">적합</option>
                    <option value="부적합">부적합</option>
                    <option value="해당없음">해당없음</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td className="p-1.5 border-r border-slate-300 text-[11px] leading-relaxed">
                  <div>1.인증신청 조직이 조직의 일부 수행 활동만을 신청했을 경우 인증범위는 일부활동과 일치 하는가(해당 사항인경우 계약검토 결과 심사반장 제공)</div>
                  <div className="mt-1">2.복수사업장 여부(영업소 및/또는 A/S점) 및 복수사업장 심사 제외 시 제외되는 사유 기록</div>
                </td>
                <td className="p-1.5 border-r border-slate-300 text-center font-mono align-middle">
                  계약검토 절차
                </td>
                <td className="p-1.5 text-center align-middle">
                  <select className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-white">
                    <option value="">- 선택 -</option>
                    <option value="일치함 (단일 사업장)">일치함 (단일 사업장)</option>
                    <option value="일치함">일치함</option>
                    <option value="불일치">불일치</option>
                    <option value="해당없음">해당없음</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 5. 계약검토자 승인 / 날인란 (실물 ERP 하단) */}
          <table className="w-full border-collapse border border-slate-400 text-xs">
            <tbody>
              <tr>
                <th className="w-28 bg-slate-100 p-2 border-r border-slate-300 font-medium text-center">계약검토자 승인</th>
                <th className="w-20 bg-slate-50 p-2 border-r border-slate-300 font-medium text-center">검토일자</th>
                <td className="p-2 border-r border-slate-300">
                  <input type="text" defaultValue={reviewDate || ''} placeholder="YYYY-MM-DD" className="w-28 border border-slate-300 rounded px-1.5 py-0.5 text-center font-mono" />
                </td>
                <th className="w-20 bg-slate-50 p-2 border-r border-slate-300 font-medium text-center">검토자</th>
                <td className="p-2 font-medium">
                  <div className="flex items-center justify-between">
                    <input type="text" placeholder="성명 입력" className="border border-slate-300 rounded px-1.5 py-0.5 w-36" />
                    <span className="text-slate-500 text-[11px]">(서명/인)</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 하단 등록/닫기 버튼 (실물 ERP 스타일) */}
          <div className="flex items-center justify-center gap-2 pt-2 no-print">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 bg-[#D28268] hover:bg-[#c0735b] text-white font-bold rounded shadow-xs text-xs transition cursor-pointer"
            >
              등록
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 bg-[#4B5563] hover:bg-[#374151] text-white font-bold rounded shadow-xs text-xs transition cursor-pointer"
            >
              닫기
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
