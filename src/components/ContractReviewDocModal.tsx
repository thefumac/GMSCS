import React from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Building2, 
  CheckCircle2, 
  DollarSign,
  Award,
  Users,
  Briefcase
} from 'lucide-react';
import { Company, AuditProject, Auditor, AuditContractRecord } from '../types';
import { cleanCeoName, cleanPersonName } from '../utils/personUtils';

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
  const ceoName = cleanCeoName(company.ceoName);
  const contactName = cleanPersonName(company.contactPerson);
  const stds = contract?.standards?.length ? contract.standards.join(', ') : (company.standards ? (Array.isArray(company.standards) ? company.standards.join(', ') : company.standards) : 'ISO 9001:2015');
  const iafCode = company.iafCode || '29, 14';
  const totalEmployees = company.totalEmployees || 25;
  const scope = company.scope || '공식 인증 등록 범위';
  const contractType = contract?.contractType || (project?.auditType?.includes('최초') ? '신규인증' : project?.auditType?.includes('갱신') ? '갱신심사' : '사후관리');
  
  // Auditor name sanitization (filter out accounting/system words like 수금, 미수, HQ 등)
  const invalidKeywords = ['수금', '미수', '입금', '청구', 'HQ', '직영', '협력기관', '미배정', '사무국', 'admin'];
  const rawLead = project?.leadAuditorName || contract?.leadAuditorName || auditor?.name || '';
  const isInvalidLead = !rawLead || invalidKeywords.some(kw => rawLead.includes(kw));
  const leadAuditor = isInvalidLead ? '미배정 (배정 검토 중)' : rawLead;
  
  const rawTeam = project?.teamAuditorNames?.length ? project.teamAuditorNames.join(', ') : '';
  const isInvalidTeam = !rawTeam || invalidKeywords.some(kw => rawTeam.includes(kw));
  const teamAuditor = isInvalidTeam ? '단독심사' : rawTeam;
  
  // MD & Fee calculation
  const appliedMd = contract?.appliedMd || project?.appliedMd || 2.0;
  const docMd = contract?.docAuditMd || 0.5;
  const siteMd = contract?.onsiteAuditMd || 1.5;
  const standardFee = contract?.standardFee || (appliedMd * 800000);
  const travelExpense = contract?.travelExpense || 200000;
  const applicationFee = contract?.applicationFee || 200000;
  const finalFee = contract?.finalFee || (standardFee + travelExpense + applicationFee);

  const reviewDate = contract?.contractDate || project?.startDate || new Date().toISOString().substring(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* 상단 툴바 (No-Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white">
                  인증신청 및 계약검토보고서 (F02-001)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 text-[10px] font-mono border border-cyan-700">
                  KAB MD 산정기준 준수
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                고객 인증신청 정보, 심사범위, 종업원수 기반 MD 산정 및 심사팀 적격성 종합 검토서
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
              <span>서식번호: F02-001 (Rev. 4)</span>
              <span>한국인정지원센터(KAB) 공인인증원 계약검토 절차서</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 mt-1">
              인증신청 및 계약검토 보고서
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              (Application &amp; Contract Review Report)
            </p>
          </div>

          {/* 1. 신청 기업 기본 현황 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-cyan-700" />
              <span>1. 신청 기업 일반 정보 및 인증 신청 사항</span>
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <tbody>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold w-28 text-center">회사명 (고객)</th>
                  <td className="border border-slate-300 p-2 font-semibold">{compName}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold w-28 text-center">대표자</th>
                  <td className="border border-slate-300 p-2">{ceoName}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">사업자등록번호</th>
                  <td className="border border-slate-300 p-2 font-mono">{company.bizNumber || '-'}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">상시 종업원수</th>
                  <td className="border border-slate-300 p-2 font-mono font-bold text-cyan-900">{totalEmployees}명</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">사업장 소재지</th>
                  <td colSpan={3} className="border border-slate-300 p-2">{company.address || '본사 및 공장'}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">실무 담당자</th>
                  <td className="border border-slate-300 p-2">{contactName} ({company.contactPhone || '-'})</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">이메일</th>
                  <td className="border border-slate-300 p-2 font-mono">{company.contactEmail || '-'}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">신청 규격</th>
                  <td className="border border-slate-300 p-2 font-bold text-cyan-950">{stds}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">계약/심사 유형</th>
                  <td className="border border-slate-300 p-2 font-semibold">{contractType}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">IAF 코드/업종</th>
                  <td className="border border-slate-300 p-2 font-mono">{iafCode} ({company.industry || '제조업'})</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">추가사업장(Site)</th>
                  <td className="border border-slate-300 p-2">{company.additionalSites?.length ? `${company.additionalSites.length}개소 (Multi-Site)` : '단일 사업장 (Single Site)'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. 인증 신청 범위 검토 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-700" />
              <span>2. 인증 범위 (Scope) 및 적용 제외(Exclusion) 타당성 검토</span>
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">[신청 인증 범위]</span>
                <p className="p-2 bg-white rounded border border-slate-200 text-slate-800 font-medium">
                  {scope}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="flex justify-between p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-500">설계 및 개발(8.3항) 적용 여부:</span>
                  <span className="font-bold text-slate-800">적용 (포함)</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-500">인증범위 타당성 검토 결과:</span>
                  <span className="font-bold text-emerald-800">적합 (IAF 코드 부합)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 심사시간(MD) 산정 및 비용 명세 검토 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-cyan-700" />
              <span>3. KAB 심사시간(M/D) 산출 근거 및 심사비용 검토</span>
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs text-center">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="border border-slate-300 p-2">KAB 기준 MD</th>
                  <th className="border border-slate-300 p-2">조정 요인 (가감산)</th>
                  <th className="border border-slate-300 p-2">최종 결정 MD</th>
                  <th className="border border-slate-300 p-2">문서심사 (1단계)</th>
                  <th className="border border-slate-300 p-2">현장심사 (2단계/사후)</th>
                  <th className="border border-slate-300 p-2">최종 심사비용 (VAT별도)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-mono font-bold">{appliedMd.toFixed(1)} MD</td>
                  <td className="border border-slate-300 p-2 text-slate-600">표준 프로세스 (0%)</td>
                  <td className="border border-slate-300 p-2 font-mono font-extrabold text-cyan-900 bg-cyan-50/50">
                    {appliedMd.toFixed(1)} MD
                  </td>
                  <td className="border border-slate-300 p-2 font-mono">{docMd.toFixed(1)} MD</td>
                  <td className="border border-slate-300 p-2 font-mono">{siteMd.toFixed(1)} MD</td>
                  <td className="border border-slate-300 p-2 font-mono font-bold text-slate-900">
                    {finalFee.toLocaleString()}원
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. 심사팀 구성 및 자격 적격성 검토 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-700" />
              <span>4. 심사팀 배정 및 자격 적격성 검토</span>
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead className="bg-slate-100 font-bold text-slate-800 text-center">
                <tr>
                  <th className="border border-slate-300 p-2 w-24">역할 구분</th>
                  <th className="border border-slate-300 p-2 w-28">심사원 성명</th>
                  <th className="border border-slate-300 p-2 w-32">공인 심사원 등급</th>
                  <th className="border border-slate-300 p-2">해당 IAF 코드 적격성 검토 결과</th>
                </tr>
              </thead>
              <tbody className="text-center">
                <tr>
                  <td className="border border-slate-300 p-2 font-bold text-cyan-900">심사팀장 (Lead)</td>
                  <td className="border border-slate-300 p-2 font-bold">{leadAuditor}</td>
                  <td className="border border-slate-300 p-2">{leadAuditor.includes('미배정') ? '-' : 'KAB 선임심사원'}</td>
                  <td className="border border-slate-300 p-2 text-left px-3">
                    {leadAuditor.includes('미배정') ? (
                      <span className="text-slate-500">배정 시 IAF Code {iafCode} 정규 등록 심사원 자격 검토 예정</span>
                    ) : (
                      <span className="text-emerald-800 font-bold">✓ IAF Code {iafCode} 정규 등록 심사원 자격 보유 (적격)</span>
                    )}
                  </td>
                </tr>
                {teamAuditor !== '단독심사' && (
                  <tr>
                    <td className="border border-slate-300 p-2 text-slate-700">심사팀원 (Team)</td>
                    <td className="border border-slate-300 p-2">{teamAuditor}</td>
                    <td className="border border-slate-300 p-2">KAB 정심사원</td>
                    <td className="border border-slate-300 p-2 text-emerald-800 font-bold text-left px-3">
                      ✓ 심사팀 구성 요건 및 보수교육 이수 적합
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 5. 종합 검토 결론 및 계약 승인 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-700" />
              <span>5. 계약 검토 종합 결과 및 수락 판정</span>
            </h3>

            <div className="p-3 bg-white rounded border border-slate-200 text-slate-800 leading-relaxed text-xs">
              <p className="font-semibold text-slate-900 mb-1">[계약 검토자 종합 판정]</p>
              <p>
                신청 기업의 인증 요구사항, 인증 범위, IAF 코드 분류, 사업장 규모 및 KAB 공인 심사시간(MD) 산정 기준을 종합 검토한 결과, 
                인증기관의 심사 수행 능력 및 적격 자원을 완비하였으므로 <strong>'계약 수락 및 심사진행 승인'</strong>으로 판정함.
              </p>
            </div>

            {/* 결재 서명란 (가상 성명 배제 및 표준 서명란 적용) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-center space-y-2">
                <span className="text-[11px] text-slate-500 block">계약 검토자 (인증운영팀)</span>
                <div className="text-slate-400 font-mono text-xs py-1 tracking-wider">
                  ________________________ (서명/인)
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">{reviewDate}</span>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-center space-y-2">
                <span className="text-[11px] text-slate-500 block">계약 승인권자 (인증원장)</span>
                <div className="text-slate-400 font-mono text-xs py-1 tracking-wider">
                  ________________________ (직인/서명)
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">{reviewDate}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
