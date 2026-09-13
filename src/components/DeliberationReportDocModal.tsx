import React from 'react';
import { 
  X, 
  Printer, 
  Award, 
  Building2, 
  CheckCircle2, 
  Calendar,
  FileCheck,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Company, AuditProject, Auditor, CommitteeDecision } from '../types';
import { cleanCeoName, cleanPersonName } from '../utils/personUtils';

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
  decision = '인증등록승인',
  reviewNote,
  deliberationDate
}) => {
  if (!isOpen || !company) return null;

  const compName = company.companyName;
  const ceoName = cleanCeoName(company.ceoName);
  const stds = project?.standards?.length ? project.standards.join(', ') : (company.standards ? (Array.isArray(company.standards) ? company.standards.join(', ') : company.standards) : 'ISO 9001:2015');
  const iafCode = company.iafCode || '29, 14';
  const auditType = project?.auditType || '정기 사후관리심사';
  const leadAuditor = project?.leadAuditorName || (company as any).assignedAuditorName || auditor?.name || '남경호';
  const auditDateStr = project?.startDate && project?.endDate ? `${project.startDate} ~ ${project.endDate}` : (project?.startDate || '2026-09-08');
  const decisionDate = deliberationDate || project?.endDate || new Date().toISOString().substring(0, 10);
  const certNumber = (company as any).certNo || 'Q260101';
  
  const defaultNote = reviewNote || `인증심사보고서 및 부적합 사항에 대한 시정조치 유효성 검증 결과를 엄정히 검토한 결과, KAB 공인 심사 기준 및 ISO 국제 표준 요구사항에 적합하게 수행되었으므로 최종 [${decision}]을 의결함.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* 상단 툴바 (No-Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white">
                  인증심의 결과보고서 및 의결서 (F18-001)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 text-[10px] font-mono border border-indigo-700">
                  인증심의위원회 공식 의결
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                심사보고서 검토, 시정조치 유효성 평가 및 최종 인증등록·유지 승인 의결서
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄 / PDF 저장</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 문서 본문 (A4 규격 스타일) */}
        <div className="p-8 space-y-6 text-slate-900 text-xs leading-relaxed overflow-y-auto bg-white">
          
          {/* 문서 헤더 */}
          <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>서식번호: F18-001 (Rev. 3)</span>
              <span>한국인정지원센터(KAB) 공인인증원 심의위원회 운영규정 제18조</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 mt-1">
              경영시스템 인증심의 결과보고서 (의결서)
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              (Certification Decision &amp; Deliberation Result Report)
            </p>
          </div>

          {/* 1. 심의 대상 기업 및 심사 개요 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-700" />
              <span>1. 심의 대상 기업 및 심사 개요</span>
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <tbody>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold w-28 text-center">신청 기업명</th>
                  <td className="border border-slate-300 p-2 font-bold text-slate-900">{compName}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold w-28 text-center">대표자</th>
                  <td className="border border-slate-300 p-2">{ceoName}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">인증 표준 규격</th>
                  <td className="border border-slate-300 p-2 font-bold text-cyan-900">{stds}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">인증번호</th>
                  <td className="border border-slate-300 p-2 font-mono font-bold">{certNumber}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">심사 구분</th>
                  <td className="border border-slate-300 p-2 font-semibold">{auditType}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">심사 일자</th>
                  <td className="border border-slate-300 p-2 font-mono">{auditDateStr}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">담당 심사팀장</th>
                  <td className="border border-slate-300 p-2 font-semibold">{leadAuditor} (선임심사원)</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">IAF 분류 코드</th>
                  <td className="border border-slate-300 p-2 font-mono font-medium">{iafCode}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">인증 범위</th>
                  <td colSpan={3} className="border border-slate-300 p-2 text-slate-800">
                    {company.scope || '금속 가공 및 기계 부품의 제조'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. 심사 결과 및 부적합 시정조치 검토 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-700" />
              <span>2. 심사 결과 및 부적합(NCR) 시정조치 유효성 검토</span>
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs text-center">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="border border-slate-300 p-2">중부적합 (Major)</th>
                  <th className="border border-slate-300 p-2">경부적합 (Minor)</th>
                  <th className="border border-slate-300 p-2">권고사항 (Obs)</th>
                  <th className="border border-slate-300 p-2">시정조치 완료 여부</th>
                  <th className="border border-slate-300 p-2">심사팀 추천 의견</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-mono font-bold text-slate-700">0 건</td>
                  <td className="border border-slate-300 p-2 font-mono font-bold text-slate-700">0 건</td>
                  <td className="border border-slate-300 p-2 font-mono text-slate-500">1 건</td>
                  <td className="border border-slate-300 p-2 font-bold text-emerald-800 bg-emerald-50/50">
                    조치완료 / 유효성 확인됨
                  </td>
                  <td className="border border-slate-300 p-2 font-bold text-indigo-950">
                    인증등록 (유지) 강력 추천
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. 인증심의위원회 4대 검토 기준 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              <span>3. 인증심의위원회 4대 심의 기준 평가 결과</span>
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="border border-slate-300 p-2 text-center w-12">No.</th>
                  <th className="border border-slate-300 p-2 text-center">심의 세부 기준 (ISO/IEC 17021-1 제9.5조)</th>
                  <th className="border border-slate-300 p-2 text-center w-24">판정</th>
                  <th className="border border-slate-300 p-2 text-center w-40">심의위원 검토 소견</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">1</td>
                  <td className="border border-slate-300 p-2 font-medium">
                    심사 계획, 심사 기간(MD), 절차의 KAB 인정기준 준수 여부
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">적합</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">표준 MD 산정 및 절차 이행 확인</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">2</td>
                  <td className="border border-slate-300 p-2 font-medium">
                    심사팀 구성의 적격성 및 공정성·독립성 보장 여부
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">적합</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">공정성 평가 F14-001 통과 확인</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">3</td>
                  <td className="border border-slate-300 p-2 font-medium">
                    심사보고서 기술 내용의 객관적 증거 및 표준 요구사항 충족성
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">적합</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">현장 객관적 증빙 충분히 기재됨</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">4</td>
                  <td className="border border-slate-300 p-2 font-medium">
                    부적합 사항에 대한 원인분석 및 시정조치 유효성 확인
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">적합</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">미결 부적합 없음 (종결 완료)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. 심의위원회 최종 의결 판정 및 서명 */}
          <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-200">
              <h3 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-700" />
                <span>4. 인증심의위원회 최종 의결 판정 결과</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-black text-xs shadow-xs">
                최종 의결: {decision}
              </span>
            </div>

            <div className="p-3 bg-white rounded border border-indigo-200 text-slate-800 leading-relaxed text-xs">
              <p className="font-semibold text-indigo-950 mb-1">[심의위원회 종합 의결 주문]</p>
              <p>{defaultNote}</p>
            </div>

            {/* 심의위원 3인 서명란 */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block mb-1">심의위원 1</span>
                <span className="font-bold text-slate-900 text-xs">박 영 수 (서명/인)</span>
                <span className="text-[10px] text-emerald-700 block mt-0.5 font-bold">✓ 승인 동의</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block mb-1">심의위원 2</span>
                <span className="font-bold text-slate-900 text-xs">이 정 훈 (서명/인)</span>
                <span className="text-[10px] text-emerald-700 block mt-0.5 font-bold">✓ 승인 동의</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-indigo-300 bg-indigo-50/50 text-center">
                <span className="text-[10px] text-indigo-800 block mb-1 font-bold">인증심의위원장</span>
                <span className="font-bold text-indigo-950 text-xs">강 성 호 (직인생략)</span>
                <span className="text-[10px] text-indigo-900 block mt-0.5 font-mono">{decisionDate}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
