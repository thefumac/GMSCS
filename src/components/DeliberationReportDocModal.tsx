import React from 'react';
import { 
  X, 
  Printer 
} from 'lucide-react';
import { Company, AuditProject, Auditor, CommitteeDecision } from '../types';

export interface DeliberationReportDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  project?: AuditProject | null;
  auditor?: Auditor | null;
  decision?: CommitteeDecision;
  reviewNote?: string;
  deliberationDate?: string;
}

export const DeliberationReportDocModal: React.FC<DeliberationReportDocModalProps> = ({
  isOpen,
  onClose,
  company,
  project,
  auditor,
  decision = '승인',
  reviewNote,
  deliberationDate
}) => {
  if (!isOpen || !company) return null;

  const compName = company.companyName;
  const certNumber = (company as any).certNo || '';
  const scope = company.scope || (company as any).bizType || '-';
  const iafCode = company.iafCode || '-';

  // Standards
  const stdsStr = (company.standards ? (Array.isArray(company.standards) ? company.standards.join(', ') : company.standards) : '') + 
    (project?.standards ? project.standards.join(', ') : '');
  const hasIso9001 = stdsStr.includes('9001');
  const hasIso14001 = stdsStr.includes('14001');
  const hasIso45001 = stdsStr.includes('45001');

  // Audit Type category
  const auditType = project?.auditType || '사후';
  const auditTypeLabel = auditType.includes('최초') ? '최초' : (auditType.includes('갱신') ? '갱신' : '사후');

  // Auditors sanitization
  const invalidKeywords = ['수금', '미수', '입금', '청구', 'HQ', '직영', '협력기관', '미배정', '사무국', 'admin'];
  const rawLead = project?.leadAuditorName || (company as any).assignedAuditorName || auditor?.name || '';
  const isInvalidLead = !rawLead || invalidKeywords.some(kw => rawLead.includes(kw));
  const leadAuditor = isInvalidLead ? '' : rawLead;

  const rawTeam = project?.teamAuditorNames?.length ? project.teamAuditorNames.join(', ') : '';
  const isInvalidTeam = !rawTeam || invalidKeywords.some(kw => rawTeam.includes(kw));
  const teamAuditor = isInvalidTeam ? '' : rawTeam;

  const auditDateStr = project?.startDate ? project.startDate.replace(/-/g, '.') : '';
  const projAny = project as any;
  const mdStr = projAny?.md ? `${projAny.md}MD` : (projAny?.appliedMd ? `${projAny.appliedMd}MD` : '');
  const item1Detail = mdStr && auditDateStr ? `${mdStr}/${auditDateStr}` : (auditDateStr || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-4 flex flex-col max-h-[95vh]">
        
        {/* 상단 타이틀 바 */}
        <div className="bg-[#2b3a4a] text-white px-4 py-2.5 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold tracking-tight">인증심의결과보고서( {auditTypeLabel} )</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄 / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 문서 본문 (ERP 1:1 완벽 양식) */}
        <div className="p-4 sm:p-6 space-y-4 text-slate-900 text-xs overflow-y-auto bg-white font-sans">
          
          {/* 1. 기본정보 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs">1. 기본정보</h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <tbody>
                <tr>
                  <th className="border border-slate-300 bg-slate-50 p-2 font-semibold w-24 text-center">고 객 명</th>
                  <td className="border border-slate-300 p-2 font-bold text-slate-900">{compName}</td>
                  <th className="border border-slate-300 bg-slate-50 p-2 font-semibold w-24 text-center">인증번호</th>
                  <td className="border border-slate-300 p-2 font-mono">
                    {certNumber ? (
                      <span>{certNumber}</span>
                    ) : (
                      <input 
                        type="text" 
                        placeholder="최초인 경우 직접 입력" 
                        className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono" 
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-50 p-2 font-semibold text-center">인 증 범 위</th>
                  <td className="border border-slate-300 p-2 text-slate-800">{scope}</td>
                  <th className="border border-slate-300 bg-slate-50 p-2 font-semibold text-center">인증코드</th>
                  <td className="border border-slate-300 p-2 font-mono">{iafCode}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-50 p-2 font-semibold text-center">인 증 표 준</th>
                  <td colSpan={3} className="border border-slate-300 p-2">
                    <div className="flex items-center flex-wrap gap-4 text-xs">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={hasIso9001} readOnly className="rounded border-slate-400 text-blue-600" />
                        <span>ISO 9001:2015</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={hasIso14001} readOnly className="rounded border-slate-400 text-blue-600" />
                        <span>ISO 14001:2015</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={hasIso45001} readOnly className="rounded border-slate-400 text-blue-600" />
                        <span>ISO 45001:2018</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <input type="checkbox" className="rounded border-slate-400 text-blue-600" />
                        <span>기타</span>
                        <select className="border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                          <option value="">- 선택 -</option>
                          <option value="Q/E">Q/E</option>
                          <option value="Q">Q</option>
                          <option value="E">E</option>
                          <option value="OH&S">OH&S</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-50 p-2 font-semibold text-center">심 사 팀</th>
                  <td colSpan={3} className="border border-slate-300 p-0">
                    <div className="grid grid-cols-4 divide-x divide-slate-300 text-center">
                      <div className="bg-slate-50 p-2 font-semibold">심사팀장</div>
                      <div className="p-2 font-medium">{leadAuditor || '-'}</div>
                      <div className="bg-slate-50 p-2 font-semibold">심사팀원</div>
                      <div className="p-2 font-medium">{teamAuditor || '-'}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. 인증심의 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs">2. 인증심의</h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead className="bg-slate-100 font-bold text-slate-800 text-center">
                <tr>
                  <th rowSpan={2} className="border border-slate-300 p-2 w-32">심의항목</th>
                  <th rowSpan={2} className="border border-slate-300 p-2">심의 기준</th>
                  <th colSpan={2} className="border border-slate-300 p-1.5">심의 결과</th>
                </tr>
                <tr>
                  <th className="border border-slate-300 p-1.5 w-32">확인</th>
                  <th className="border border-slate-300 p-1.5 w-44">심의내역</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. 심사팀 구성의 적합성 및 공평성 */}
                <tr>
                  <td rowSpan={3} className="border border-slate-300 p-2 font-bold text-center align-middle bg-slate-50/50">
                    심사팀 구성의<br />적합성 및 공평성
                  </td>
                  <td className="border border-slate-300 p-2">1. 심사일수 및 비용산정이 절차에 맞는가?(계약검토서 확인)</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_1" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_1" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_1" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" defaultValue={item1Detail} className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">2. 심사팀 구성 및 심사 준비에 대한 원칙이 준수되었는가?<br />(인증범위와 심사원 코드)</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_2" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_2" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_2" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">3. 심사업체와의 이해상충 및 공평성 위협요소는 없는가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_3" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_3" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_3" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>

                {/* 2. 심사 수행의 적합성 */}
                <tr>
                  <td rowSpan={5} className="border border-slate-300 p-2 font-bold text-center align-middle bg-slate-50/50">
                    심사 수행의 적합성
                  </td>
                  <td className="border border-slate-300 p-2">4. 심사계획은 최소 1주일 이전에 통보하였는가?(늦어도 3일전)</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_4" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_4" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_4" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">5. 심사팀의 구성은 적합한가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_5" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_5" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_5" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">6. 내부심사 및 경영 검토는 실시하였는가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_6" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_6" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_6" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">7. 심사시간은 준수하였는가?(현장 이동시간 포함)</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_7" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_7" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_7" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">8. 사후 심사는 전 심사의 12개월내에 실시 되었는가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_8" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_8" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_8" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" defaultValue={auditDateStr} className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center font-mono" />
                  </td>
                </tr>

                {/* 3. 인증범위의 명확성 */}
                <tr>
                  <td rowSpan={3} className="border border-slate-300 p-2 font-bold text-center align-middle bg-slate-50/50">
                    인증범위의<br />명확성
                  </td>
                  <td className="border border-slate-300 p-2">9. 인증수행범위는 적합한가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_9" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_9" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_9" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">10. 복합코드의 경우 코드가 전부 적용 되었는가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_10" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_10" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_10" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" defaultValue={iafCode} className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center font-mono" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">11. 복수사업장의 경우 대상 사업장을 명확히 기술하였는가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_11" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_11" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_11" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>

                {/* 4. 부적합 사항의 적합성 */}
                <tr>
                  <td rowSpan={2} className="border border-slate-300 p-2 font-bold text-center align-middle bg-slate-50/50">
                    부적합 사항의<br />적합성
                  </td>
                  <td className="border border-slate-300 p-2">12. 부적합 사항이 적합하게 발행되었는가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_12" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_12" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_12" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" defaultValue={projAny?.minorNcrCount !== undefined ? String(projAny.minorNcrCount) : ""} className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center font-bold" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">13. 부적합 내용과 표준 적용 항목번호는 적합한가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_13" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_13" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_13" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>

                {/* 5. 시정조치의 효과성 */}
                <tr>
                  <td rowSpan={2} className="border border-slate-300 p-2 font-bold text-center align-middle bg-slate-50/50">
                    시정조치의<br />효과성
                  </td>
                  <td className="border border-slate-300 p-2">14. 부적합 사항에 대한 시정조치가 효과적인가?(이전심사 포함)</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_14" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_14" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_14" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">15. 재발방지 대책은 적합한가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_15" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_15" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_15" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>

                {/* 6. 기록관리 */}
                <tr>
                  <td rowSpan={3} className="border border-slate-300 p-2 font-bold text-center align-middle bg-slate-50/50">
                    기록관리
                  </td>
                  <td className="border border-slate-300 p-2">16. 보고서에 오기 및 누락된 부분은 없는가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_16" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_16" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_16" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">17. 심사보고서는 기록관리 순서로 Filing 되었는가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_17" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_17" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_17" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">18. 양식은 최신 본 인가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_18" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_18" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_18" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>

                {/* 7. 고객 피드백 */}
                <tr>
                  <td className="border border-slate-300 p-2 font-bold text-center align-middle bg-slate-50/50">
                    고객 피드백
                  </td>
                  <td className="border border-slate-300 p-2">19. 심사와 관련 고객 불만은 없었는가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_19" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_19" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_19" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>

                {/* 8. 변경사항 */}
                <tr>
                  <td className="border border-slate-300 p-2 font-bold text-center align-middle bg-slate-50/50">
                    변경사항
                  </td>
                  <td className="border border-slate-300 p-2">20. 사후 심사 시 변경 사항은 없는가?</td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px]">
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_20" className="text-blue-600" /> Y</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_20" className="text-blue-600" /> N</label>
                      <label className="flex items-center gap-0.5 cursor-pointer"><input type="radio" name="deli_20" className="text-blue-600" /> NA</label>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <input type="text" className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 인증심의 결과 결재 표 */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full border-collapse text-xs">
              <tbody>
                <tr className="border-b border-slate-300">
                  <th className="bg-slate-50 p-2.5 font-bold w-28 text-center border-r border-slate-300">인증심의 결과</th>
                  <td className="p-2.5">
                    <div className="flex items-center gap-6 text-xs font-semibold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="final_decision" className="text-blue-600" />
                        <span>승인</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="final_decision" className="text-blue-600" />
                        <span>보류</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="final_decision" className="text-blue-600" />
                        <span>재승인</span>
                      </label>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <th className="bg-slate-50 p-2 font-bold text-center border-r border-slate-300">인증심의 일자</th>
                  <td className="p-2">
                    <div className="grid grid-cols-3 gap-3">
                      <input type="text" defaultValue={auditDateStr} className="border border-slate-300 rounded px-2 py-1 text-xs text-center font-mono" />
                      <input type="text" className="border border-slate-300 rounded px-2 py-1 text-xs text-center font-mono" />
                      <input type="text" className="border border-slate-300 rounded px-2 py-1 text-xs text-center font-mono" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="bg-slate-50 p-2 font-bold text-center border-r border-slate-300">인증위원 확인</th>
                  <td className="p-2">
                    <div className="grid grid-cols-3 gap-3">
                      <input type="text" placeholder="(서명)" className="border border-slate-300 rounded px-2 py-1 text-xs text-center" />
                      <input type="text" placeholder="(서명)" className="border border-slate-300 rounded px-2 py-1 text-xs text-center" />
                      <input type="text" placeholder="(서명)" className="border border-slate-300 rounded px-2 py-1 text-xs text-center" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-center gap-2 pt-2 no-print">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-1.5 bg-[#c27d58] hover:bg-[#b06d4a] text-white rounded font-bold text-xs shadow-xs cursor-pointer"
            >
              등록
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-1.5 bg-[#4a5568] hover:bg-[#3b4453] text-white rounded font-bold text-xs shadow-xs cursor-pointer"
            >
              닫기
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
