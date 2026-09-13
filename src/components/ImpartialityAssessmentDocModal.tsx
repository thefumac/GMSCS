import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Award,
  UserCheck
} from 'lucide-react';
import { Company, AuditProject, Auditor, AuditContractRecord } from '../types';
import { cleanCeoName, cleanPersonName } from '../utils/personUtils';

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

  const compName = company.companyName;
  const ceoName = cleanCeoName(company.ceoName);
  const stds = contract?.standards?.length ? contract.standards.join(', ') : (company.standards ? (Array.isArray(company.standards) ? company.standards.join(', ') : company.standards) : 'ISO 9001:2015');
  const iafCode = company.iafCode || '29, 14';
  const auditType = project?.auditType || (contract?.contractType === '신규인증' ? '최초심사 (1·2단계)' : '사후관리심사');
  
  // Auditor sanitization
  const invalidKeywords = ['수금', '미수', '입금', '청구', 'HQ', '직영', '협력기관', '미배정', '사무국', 'admin'];
  const rawLead = project?.leadAuditorName || contract?.leadAuditorName || auditor?.name || '';
  const isInvalidLead = !rawLead || invalidKeywords.some(kw => rawLead.includes(kw));
  const leadAuditorName = isInvalidLead ? '미배정 (배정 검토 중)' : rawLead;
  
  const rawTeam = project?.teamAuditorNames?.length ? project.teamAuditorNames.join(', ') : '';
  const isInvalidTeam = !rawTeam || invalidKeywords.some(kw => rawTeam.includes(kw));
  const teamAuditorNames = isInvalidTeam ? '단독심사' : rawTeam;
  
  const consultantName = company.consultant || company.agency || '직영';
  const assessmentDate = project?.startDate || contract?.contractDate || new Date().toISOString().substring(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* 상단 툴바 (No-Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white">
                  공정성 관리 및 이해상충 평가서 (F14-001)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 text-[10px] font-mono border border-cyan-700">
                  ISO/IEC 17021-1 규정 준수
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                심사원 배정 및 인증 서비스 제공에 따른 공정성 위협 요소 사전 검토·승인서
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
              <span>서식번호: F14-001 (Rev. 3)</span>
              <span>한국인정지원센터(KAB) 공인인증원 운영규정 제14조</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 mt-1">
              공정성 관리 및 이해상충 리스크 평가서
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              (Impartiality &amp; Conflict of Interest Risk Assessment Report)
            </p>
          </div>

          {/* 1. 기본 정보 테이블 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-cyan-700" />
              <span>1. 피평가 대상 기업 및 심사 배정 개요</span>
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <tbody>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold w-28 text-center">신청 기업명</th>
                  <td className="border border-slate-300 p-2 font-semibold text-slate-900">{compName}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold w-28 text-center">대표자</th>
                  <td className="border border-slate-300 p-2">{ceoName}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">사업자번호</th>
                  <td className="border border-slate-300 p-2 font-mono">{company.bizNumber || '-'}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">IAF 코드</th>
                  <td className="border border-slate-300 p-2 font-mono font-medium">{iafCode}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">신청 규격</th>
                  <td className="border border-slate-300 p-2 font-medium text-cyan-900">{stds}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">심사 구분</th>
                  <td className="border border-slate-300 p-2 font-semibold">{auditType}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">배정 심사팀장</th>
                  <td className="border border-slate-300 p-2 font-bold text-slate-900">{leadAuditorName} (선임심사원)</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">배정 심사팀원</th>
                  <td className="border border-slate-300 p-2">{teamAuditorNames}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">컨설팅/영업경로</th>
                  <td className="border border-slate-300 p-2">{consultantName}</td>
                  <th className="border border-slate-300 bg-slate-100 p-2 font-bold text-center">평가 일자</th>
                  <td className="border border-slate-300 p-2 font-mono">{assessmentDate}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. 공정성 7대 리스크 점검 체크리스트 */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-700" />
              <span>2. 공정성 및 이해상충 7대 핵심 항목 평가 체크리스트</span>
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th className="border border-slate-300 p-2 text-center w-12">No.</th>
                  <th className="border border-slate-300 p-2 text-center">공정성 위협 점검 항목 (ISO/IEC 17021-1 제5.2조)</th>
                  <th className="border border-slate-300 p-2 text-center w-24">점검 결과</th>
                  <th className="border border-slate-300 p-2 text-center w-36">확인 근거 및 조치사항</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">1</td>
                  <td className="border border-slate-300 p-2">
                    <span className="font-semibold block">컨설팅 및 자문 제공 여부 (자기검토 위협)</span>
                    <span className="text-[11px] text-slate-500">최근 2년 이내 피심사 기업에 경영시스템 구축, 지도, 컨설팅을 제공하였는가?</span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">해당없음 (적합)</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">심사원 서약서 및 컨설팅 이력 대조 완료</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">2</td>
                  <td className="border border-slate-300 p-2">
                    <span className="font-semibold block">재직 및 재정적 이해관계 여부 (자체이익 위협)</span>
                    <span className="text-[11px] text-slate-500">최근 2년 이내 해당 기업에 재직하였거나 주식/지분 등 금전적 이해관계가 있는가?</span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">해당없음 (적합)</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">경력조회 및 독립성 확인서 징구</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">3</td>
                  <td className="border border-slate-300 p-2">
                    <span className="font-semibold block">친인척 및 특수관계 여부 (친밀성 위협)</span>
                    <span className="text-[11px] text-slate-500">신청 기업의 대표이사 또는 주요 임원과 8촌 이내 친인척 관계가 있는가?</span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">해당없음 (적합)</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">심사원 사전 신고 및 서약 확인</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">4</td>
                  <td className="border border-slate-300 p-2">
                    <span className="font-semibold block">내부심사 대행 여부 (자기심사 위협)</span>
                    <span className="text-[11px] text-slate-500">최근 2년 이내 해당 고객사의 내부심사를 대행하거나 관여한 사실이 있는가?</span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">해당없음 (적합)</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">내부심사 수행 이력 무관 확인</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">5</td>
                  <td className="border border-slate-300 p-2">
                    <span className="font-semibold block">컨설팅 기관과의 유착 및 패키지 영업 여부 (대외 위협)</span>
                    <span className="text-[11px] text-slate-500">특정 컨설팅 업체와 연계하여 인증 보장 등 부당한 영업 활동이 있었는가?</span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">해당없음 (적합)</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">독립 계약 및 KAB 고시 심사비용 기준 준수</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">6</td>
                  <td className="border border-slate-300 p-2">
                    <span className="font-semibold block">심사원 행동강령 및 보안·비밀유지 준수</span>
                    <span className="text-[11px] text-slate-500">심사 중 지득한 고객사 기술·영업비밀 보호 및 윤리강령 준수 서약 여부</span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">서약완료 (적합)</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">연간 보안 및 윤리서약서 체결</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">7</td>
                  <td className="border border-slate-300 p-2">
                    <span className="font-semibold block">심사원의 전공/경력 적격성 (기술적 역량)</span>
                    <span className="text-[11px] text-slate-500">해당 IAF 코드 및 산업분야에 대한 등록 심사원 자격을 유효하게 보유하고 있는가?</span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800 bg-emerald-50/50">자격보유 (적합)</td>
                  <td className="border border-slate-300 p-2 text-[11px] text-slate-600">IAF 코드 적격성 및 보수교육 이수 확인</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. 종합 평가 의견 및 승인 결재 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-cyan-700" />
              <span>3. 공정성 리스크 종합 평가 및 심사원 배정 승인 결재</span>
            </h3>
            
            <div className="p-3 bg-white rounded border border-slate-200 text-slate-800 leading-relaxed text-xs">
              <p className="font-semibold text-slate-900 mb-1">[공정성 관리책임자 종합 검토 의견]</p>
              <p>
                본 인증심사 신청 건에 대하여 ISO/IEC 17021-1 및 KAB 공인인증기관 운영기준에 따라 공정성 위협 요소를 다각도로 검토한 결과, 
                자기검토, 자체이익, 친밀성, 대외유착 등의 리스크가 전혀 존재하지 아니하며 <strong>'공정성 리스크 등급: Low(낮음)'</strong>으로 최종 평가됨. 
                따라서 신청 규격에 대한 적격 심사팀 배정 및 심사 수행을 공식 승인함.
              </p>
            </div>

            {/* 결재란 (가상 성명 배제 및 표준 서명란 적용) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-center space-y-2">
                <span className="text-[11px] text-slate-500 block">공정성 검토자 (심사기획팀장)</span>
                <div className="text-slate-400 font-mono text-xs py-1 tracking-wider">
                  ________________________ (서명/인)
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">{assessmentDate}</span>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-center space-y-2">
                <span className="text-[11px] text-slate-500 block">공정성 승인권자 (대표이사/원장)</span>
                <div className="text-slate-400 font-mono text-xs py-1 tracking-wider">
                  ________________________ (직인/서명)
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">{assessmentDate}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
