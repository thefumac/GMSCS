import React, { useState } from 'react';
import { 
  Layers, 
  FileSpreadsheet, 
  AlertCircle, 
  BookOpen, 
  Download
} from 'lucide-react';
import { mockCompanies } from '../data/mockData';

export const EsgRecordIntegrator: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('comp-1');

  const company = mockCompanies.find(c => c.id === selectedCompanyId) || mockCompanies[0];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              OK ESG & ISO-Record 생태계 연동 관리 허브
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            GMSCS 인증 플랫폼을 중심으로 <strong className="text-emerald-700">OK ESG(공급망 ESG 평가)</strong>와 
            <strong className="text-cyan-700"> ISO-Record(고객 자율 실행기록 저장고)</strong>를 사업자번호 기반 단일 식별자로 연계합니다.
          </p>
        </div>

        {/* Company Selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-600 font-semibold">연계 조회 대상 고객사:</span>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white font-bold"
          >
            {mockCompanies.map(c => (
              <option key={c.id} value={c.id}>{c.companyName} ({c.bizNumber})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Critical Policy: ISO 17021 독립성 보장 안내 */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-2 shadow-xs">
        <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span>[규정 준수] ISO/IEC 17021 이해충돌 방지 및 컨설팅 금지 원칙 가벽 (Firewall)</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          인증기관(GMSCS)은 인증의 공정성을 유지하기 위해 고객사에게 직접적인 경영시스템 컨설팅을 제공할 수 없습니다. 
          따라서 <strong>ISO-Record</strong>는 컨설팅이 아닌 <strong>“고객 자율형 표준 문서 템플릿 열람 및 실행기록 저장소”</strong>로 철저히 분리 운영되며, 
          제공되는 표준 서식은 참고용 가이드라인이며 실제 시스템 수립과 운영 책임은 피심사기업에 있음을 명시합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: ISO-Record 실행기록 연계 뷰 (BSI 수준) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-cyan-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">ISO-Record 실행기록 저장소</h3>
                <p className="text-[11px] text-slate-500 font-medium">고객이 자율 등록한 프로세스 및 심사 증빙</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              실시간 동기화중
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-slate-900 font-extrabold">
                <span>{company.companyName}의 최신 ISO 실행기록</span>
                <span className="text-cyan-800 text-[11px] font-mono font-bold">사업자: {company.bizNumber}</span>
              </div>
              <ul className="space-y-1.5 text-slate-700">
                <li className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <span className="font-medium">📄 2026년 상반기 경영검토 보고서 (REV.3)</span>
                  <button onClick={() => alert('ISO-Record에서 경영검토 보고서를 팝업으로 즉시 대조 열람합니다.')} className="text-cyan-700 hover:underline font-bold">심사 시 열람</button>
                </li>
                <li className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <span className="font-medium">📄 내부심사 결과보고서 및 시정조치 요구서</span>
                  <button onClick={() => alert('ISO-Record 내부심사 보고서를 열람합니다.')} className="text-cyan-700 hover:underline font-bold">심사 시 열람</button>
                </li>
                <li className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                  <span className="font-medium">📄 환경영향평가표 및 비상사태 대응 훈련일지</span>
                  <button onClick={() => alert('ISO-Record 환경영향평가표를 열람합니다.')} className="text-cyan-700 hover:underline font-bold">심사 시 열람</button>
                </li>
              </ul>
            </div>

            {/* 표준 문서 템플릿 제공 센터 */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
              <span className="font-bold text-slate-800 block">제공 중인 표준 문서 템플릿 (참고용 서식)</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex justify-between items-center">
                  <span className="font-medium text-slate-800">품질/환경 경영매뉴얼 표준안</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-cyan-600" />
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex justify-between items-center">
                  <span className="font-medium text-slate-800">리스크 및 기회 관리 절차서</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-cyan-600" />
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex justify-between items-center">
                  <span className="font-medium text-slate-800">문서 및 기록관리 규정</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-cyan-600" />
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex justify-between items-center">
                  <span className="font-medium text-slate-800">시정조치 및 지속적 개선 지침</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-cyan-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: OK ESG 연계 뷰 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">OK ESG 데이터 연계</h3>
                <p className="text-[11px] text-slate-500 font-medium">공급망 ESG 공시 및 ISO 심사 상호 보완</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              API 연동 정상
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-800 font-bold">{company.companyName} ESG 종합 진단</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  A- 등급 (우수)
                </span>
              </div>

              {/* ESG Pillar Scores */}
              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-bold mb-1">
                    <span>E (환경: ISO 14001 연계)</span>
                    <strong className="text-slate-900">88점</strong>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[88%] h-full bg-emerald-500 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-bold mb-1">
                    <span>S (사회/안전: ISO 45001 연계)</span>
                    <strong className="text-slate-900">82점</strong>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[82%] h-full bg-cyan-600 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-bold mb-1">
                    <span>G (지배구조/윤리: ISO 37001 연계)</span>
                    <strong className="text-slate-900">79점</strong>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[79%] h-full bg-indigo-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-[11px] text-indigo-950 space-y-1 leading-relaxed">
              <strong>💡 GMSCS 인증 마케팅 시너지</strong>
              <p>
                OK ESG 진단을 완료한 고객사에게 ISO 14001(환경) 및 ISO 45001(안전보건) 인증 취득 패키지를 추천하고, 
                인증 취득 시 OK ESG 평가에 인증 가점을 자동으로 반영하여 고객 유지율을 극대화합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
