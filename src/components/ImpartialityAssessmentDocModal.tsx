import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck
} from 'lucide-react';
import { Company, AuditProject, Auditor, AuditContractRecord } from '../types';

export interface ImpartialityAssessmentDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  project?: AuditProject | null;
  contract?: AuditContractRecord | null;
  auditor?: Auditor | null;
}

export const ImpartialityAssessmentDocModal: React.FC<ImpartialityAssessmentDocModalProps> = ({
  isOpen,
  onClose,
  company,
  project,
  contract,
  auditor
}) => {
  if (!isOpen || !company) return null;

  // Determine audit type checkboxes
  const rawType = project?.auditType || contract?.contractType || '사후';
  const isInitial = rawType.includes('최초') || rawType.includes('신규');
  const isTransfer = rawType.includes('전환');
  const isRenewal = rawType.includes('갱신');
  const isSurveillance = !isInitial && !isTransfer && !isRenewal;
  
  // Extract degree / round (e.g. 1차, 2차)
  const projAny = project as any;
  const roundMatch = (projAny?.auditDegree || rawType || '').match(/(\d+)차/);
  const roundNum = roundMatch ? roundMatch[1] : (projAny?.auditDegree?.replace(/[^0-9]/g, '') || '1');

  // Real dates or current date
  const todayStr = new Date().toISOString().slice(0, 10);
  const confirmDate = project?.startDate || contract?.contractDate || todayStr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-4 flex flex-col max-h-[95vh]">
        
        {/* 브라우저/윈도우 상단 타이틀바 스타일 */}
        <div className="bg-[#2b3a4a] text-white px-4 py-2.5 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold tracking-tight">공평성관리 평가서</span>
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
          
          {/* 심사구분 라디오/체크박스 헤더 */}
          <div className="flex items-center gap-6 border border-slate-300 bg-slate-50 p-2.5 rounded text-xs font-semibold">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={isInitial} readOnly className="rounded border-slate-400 text-blue-600" />
              <span>최초</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={isTransfer} readOnly className="rounded border-slate-400 text-blue-600" />
              <span>전환</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={isRenewal} readOnly className="rounded border-slate-400 text-blue-600" />
              <span>갱신</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input type="checkbox" checked={isSurveillance} readOnly className="rounded border-slate-400 text-blue-600" />
              <span>사후 (</span>
              <input 
                type="text" 
                defaultValue={isSurveillance ? roundNum : ''} 
                className="w-8 text-center border border-slate-300 bg-white rounded px-1 py-0.5 text-xs font-bold" 
              />
              <span>)차</span>
            </div>
          </div>

          {/* 결재란 */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <div className="bg-slate-100 px-3 py-1 font-bold text-xs border-b border-slate-300">결재</div>
            <div className="grid grid-cols-4 sm:grid-cols-7 text-center divide-x divide-y sm:divide-y-0 divide-slate-300 text-xs">
              <div className="bg-slate-50 p-2 font-semibold">작성</div>
              <div className="p-1.5 flex items-center justify-center">
                <select className="w-full border border-slate-300 rounded px-1 py-1 text-xs bg-white">
                  <option value="">작성자</option>
                </select>
              </div>
              <div className="bg-slate-50 p-2 font-semibold">모니터링</div>
              <div className="p-1.5 flex items-center justify-center">
                <select className="w-full border border-slate-300 rounded px-1 py-1 text-xs bg-white">
                  <option value="">모니터링</option>
                </select>
              </div>
              <div className="bg-slate-50 p-2 font-semibold">승인</div>
              <div className="p-1.5 flex items-center justify-center">
                <select className="w-full border border-slate-300 rounded px-1 py-1 text-xs bg-white">
                  <option value="">승인자</option>
                </select>
              </div>
              <div className="p-1.5 flex items-center justify-center col-span-4 sm:col-span-1">
                <input 
                  type="text" 
                  defaultValue={confirmDate} 
                  className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs text-center font-mono" 
                />
              </div>
            </div>
          </div>

          {/* 메인 평가 테이블 */}
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead className="bg-slate-100 font-bold text-slate-800 text-center">
              <tr>
                <th className="border border-slate-300 p-2 w-28">단계</th>
                <th className="border border-slate-300 p-2">공평성 평가 사항</th>
                <th className="border border-slate-300 p-2 w-48">공평성 평가</th>
              </tr>
            </thead>
            <tbody>
              {/* 기초 평가 [심사 전단계] */}
              <tr>
                <td rowSpan={13} className="border border-slate-300 p-2.5 text-center font-semibold align-top bg-slate-50/50">
                  <div className="font-bold text-slate-900 mb-2">기초 평가<br />[심사 전단계]</div>
                  <div className="text-[11px] text-slate-500 text-left leading-relaxed pl-1">
                    · 설문서<br />
                    · 검토 및 제안서<br />
                    · 심사팀 관리 기록<br />
                    · 기타 정보
                  </div>
                </td>
                <td className="border border-slate-300 p-2 leading-relaxed">
                  1. 인증 유치로 지도요원, 지도기관 또는 심사원등이 커미션 요구로 공평성 위협 유무(설문서/정보)
                </td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="base_1" className="text-blue-600" />
                      <span>예(해당없음)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="base_1" className="text-blue-600" />
                      <span>커미션요구</span>
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 leading-relaxed">
                  2. 인증 조직 출신 심사원, 지도심사원 또는 친분관계 지정 심사원 배정요구 유무 [ 심사팀부 또는 설문서]
                </td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="base_2" className="text-blue-600" />
                      <span>예(요구없음)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="base_2" className="text-blue-600" />
                      <span>지정요구</span>
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 leading-relaxed">
                  3. 외부 이해관계자 또는 컨설팅 기관에 따라 지정금액으로 심사 요청 유무( 설문서 / 정보)
                </td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="base_3" className="text-blue-600" />
                      <span>예(해당없음)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="base_3" className="text-blue-600" />
                      <span>관련있음</span>
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 leading-relaxed">
                  4. 인증 고객(지도기관포함)이 인증 프로세스 외 사항 요구로 인하여 프로세스 미 준수로 공평성 위협 유무
                </td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="base_4" className="text-blue-600" />
                      <span>예(해당없음)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="base_4" className="text-blue-600" />
                      <span>관련있음</span>
                    </label>
                  </div>
                </td>
              </tr>

              {/* 기초평가 구분 안내문 */}
              <tr className="bg-slate-50">
                <td colSpan={2} className="border border-slate-300 p-1.5 text-[11px] font-semibold text-slate-600">
                  * 기초평가 1 ~ 4항의 근거에 따라 평가함
                </td>
              </tr>

              <tr>
                <td className="border border-slate-300 p-2">5. 지도기관, 지도위원 또는 심사원등에 대한 자체 검토유무</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_5" className="text-blue-600" /> 적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_5" className="text-blue-600" /> 부적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_5" className="text-blue-600" /> 해당없음</label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">6. 인증 유치와 관련 이해관계자 사익추구 위험 유무</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_6" className="text-blue-600" /> 적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_6" className="text-blue-600" /> 부적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_6" className="text-blue-600" /> 해당없음</label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">7. 인증 조직과 배정 예정 심사원에 대한 자체, 친분 위험 유무</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_7" className="text-blue-600" /> 적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_7" className="text-blue-600" /> 부적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_7" className="text-blue-600" /> 해당없음</label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">8. 최소 비용, 최소기간 인증 결정에 대한 침해, 지시 위험 유무</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_8" className="text-blue-600" /> 적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_8" className="text-blue-600" /> 부적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_8" className="text-blue-600" /> 해당없음</label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">9. 인증 조직 출신 심사원 또는 기관지정 심사원에 대한 위험 유무</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_9" className="text-blue-600" /> 적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_9" className="text-blue-600" /> 부적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_9" className="text-blue-600" /> 해당없음</label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">10. 인증 결정(형식적)에 대한 지시, 침범 등 공평성 위협</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_10" className="text-blue-600" /> 적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_10" className="text-blue-600" /> 부적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_10" className="text-blue-600" /> 해당없음</label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">11. 기타 자문 금지 또는 인증 제공 금지 대상과 관련되는 공평성 위협 유무 (4, 5항 사항)</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_11" className="text-blue-600" /> 적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_11" className="text-blue-600" /> 부적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="base_11" className="text-blue-600" /> 해당없음</label>
                  </div>
                </td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="border border-slate-300 p-2 font-bold text-center">소계</td>
                <td className="border border-slate-300 p-2 text-center font-mono">
                  적 <input type="text" className="w-8 text-center border border-slate-300 rounded px-1 py-0.5 mx-1" placeholder="" />
                  부 <input type="text" className="w-8 text-center border border-slate-300 rounded px-1 py-0.5 mx-1" placeholder="" />
                  없음 <input type="text" className="w-8 text-center border border-slate-300 rounded px-1 py-0.5 mx-1" placeholder="" />
                </td>
              </tr>

              {/* 예측평가 [심사단계] */}
              <tr>
                <td rowSpan={7} className="border border-slate-300 p-2.5 text-center font-bold align-middle bg-slate-50/50">
                  예측평가<br />[심사단계]
                </td>
                <td className="border border-slate-300 p-2">1. 인증 고객 과도한 친분관계로 편의, 일정단축 등 위험 가능성</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1"><input type="checkbox" className="rounded border-slate-400" /> 발생가능성</label>
                    <select className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                      <option value="">-</option>
                      <option value="N">N</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">2. 동일(3년 이상) 심사원 배정으로 사익추구, 친분 위험가능성</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1"><input type="checkbox" className="rounded border-slate-400" /> 발생가능성</label>
                    <select className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                      <option value="">-</option>
                      <option value="N">N</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">3. 친분관계로 심사 수임 및 수행 지시 위험 가능성</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1"><input type="checkbox" className="rounded border-slate-400" /> 발생가능성</label>
                    <select className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                      <option value="">-</option>
                      <option value="N">N</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">4. 심사와 관련 재정적 사익 추구 위험 가능성</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1"><input type="checkbox" className="rounded border-slate-400" /> 발생가능성</label>
                    <select className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                      <option value="">-</option>
                      <option value="N">N</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">5. 기타 심사 단계에서 자문, 윤리준수 및 공평성 보장 위협 가능성</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1"><input type="checkbox" className="rounded border-slate-400" /> 발생가능성</label>
                    <select className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                      <option value="">-</option>
                      <option value="N">N</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="border border-slate-300 p-2 font-bold text-center">소계</td>
                <td className="border border-slate-300 p-2 text-center">
                  L(1)소계: <input type="text" className="w-8 text-center border border-slate-300 rounded px-1 py-0.5 mx-1" placeholder="" /> 개
                </td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="border border-slate-300 p-2 font-bold text-center">소계 [적격/부적격]</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="pred_stage_total" className="text-blue-600" /> 적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="pred_stage_total" className="text-blue-600" /> 부적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="pred_stage_total" className="text-blue-600" /> 해당없음</label>
                  </div>
                </td>
              </tr>

              {/* 예측평가 [심사후단계] */}
              <tr>
                <td rowSpan={7} className="border border-slate-300 p-2.5 text-center font-bold align-middle bg-slate-50/50">
                  예측평가<br />[심사후단계]
                </td>
                <td className="border border-slate-300 p-2">1. 친분관계로 심사 증거 추적성 또는 부적합 객관성 미흡등으로 공평성 위협(친분, 자체, 사익추구) 발생가능성</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1"><input type="checkbox" className="rounded border-slate-400" /> 발생가능성</label>
                    <select className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                      <option value="">-</option>
                      <option value="N">N</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">2. 고의적, 위협적, 또는 낭비 부적합 발행 등으로 공평성 위협 발생 가능성</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1"><input type="checkbox" className="rounded border-slate-400" /> 발생가능성</label>
                    <select className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                      <option value="">-</option>
                      <option value="N">N</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">3. 친분 관계 등으로 심사 객관성 미흡으로 인증결정에 대한 공평성 위협 발생 가능성</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1"><input type="checkbox" className="rounded border-slate-400" /> 발생가능성</label>
                    <select className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                      <option value="">-</option>
                      <option value="N">N</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">4. 기관 이해 관계자 또는 기관 지시 관련 공평성 위협 발생 가능성</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1"><input type="checkbox" className="rounded border-slate-400" /> 발생가능성</label>
                    <select className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                      <option value="">-</option>
                      <option value="N">N</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">5. 심사 후 단계에서 인증 결정에 대한 권리, 용이 등으로 인해 공평성 위협 발생 가능성 유무</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1"><input type="checkbox" className="rounded border-slate-400" /> 발생가능성</label>
                    <select className="w-16 border border-slate-300 rounded px-1 py-0.5 text-xs bg-white">
                      <option value="">-</option>
                      <option value="N">N</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="border border-slate-300 p-2 font-bold text-center">소계</td>
                <td className="border border-slate-300 p-2 text-center">
                  L(1)소계: <input type="text" className="w-8 text-center border border-slate-300 rounded px-1 py-0.5 mx-1" placeholder="" /> 개
                </td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="border border-slate-300 p-2 font-bold text-center">소계 [적격/부적격]</td>
                <td className="border border-slate-300 p-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="post_stage_total" className="text-blue-600" /> 적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="post_stage_total" className="text-blue-600" /> 부적격</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="post_stage_total" className="text-blue-600" /> 해당없음</label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 평가 기준 안내 박스 */}
          <div className="border border-slate-300 p-3 bg-slate-50/50 rounded text-xs space-y-1.5 leading-relaxed text-slate-700">
            <div className="font-bold text-slate-900 mb-1">평가 기준</div>
            <div>- 전 항목 개별 평가</div>
            <div>- 기초평가: 1.부적격: 인증거부</div>
            <div>- 심사단계 및 후 단계: H(5), M(3), L(1), N(0) 등급으로 개별 등급 M 인증 중지, H: 인증 거부</div>
            <div className="pt-1 border-t border-slate-200">
              <span className="font-bold text-slate-900 mr-4">소계</span>
              <span className="mr-6">적격: L(1)등급 1개 이하</span>
              <span>부적격: L(1)등급 2 ~ 3개: 인증 중지, L(1)등급 4개 이상: 인증 거부</span>
            </div>
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
