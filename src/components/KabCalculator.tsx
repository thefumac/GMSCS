import React, { useState } from 'react';
import { 
  Calculator, 
  Settings2, 
  FileCheck, 
  HelpCircle, 
  Table, 
  Layers, 
  ShieldAlert, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { StandardCode, AuditType } from '../types';
import { calculateKabMd } from '../services/kabMdEngine';

interface KabCalculatorProps {
  isAdmin?: boolean;
  onNavigateToContracts?: () => void;
}

export const KabCalculator: React.FC<KabCalculatorProps> = ({ 
  isAdmin = true,
  onNavigateToContracts 
}) => {
  const [employeeCount, setEmployeeCount] = useState<number>(45);
  const [selectedStandards, setSelectedStandards] = useState<StandardCode[]>([
    'ISO 9001:2015',
    'ISO 14001:2015'
  ]);
  const [riskLevel, setRiskLevel] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [auditType, setAuditType] = useState<AuditType>('사후관리 1차');
  const [baseRate] = useState<number>(800000); // 80만원/MD
  const [issuerName, setIssuerName] = useState<string>('GMSCS');

  // 안내 서브탭 (모의 견적기 vs KAB 공인 기준표)
  const [guideTab, setGuideTab] = useState<'calc' | 'table'>('calc');

  // GMSCS 전수 인증 심사 가능 규격 14종
  const standardOptions: StandardCode[] = [
    'ISO 9001:2015',
    'ISO 14001:2015',
    'ISO 45001:2018',
    'ESG-MS:2023',
    'ISO 50001:2018',
    'ISO 27001:2022',
    'ISO 27701:2019',
    'ISO 37001:2016',
    'ISO 37301:2021',
    'ISO 22301:2019',
    'ISO 22716:2007',
    'ISO 15378:2017',
    'ISO 22000:2018',
    'ISO 13485:2016',
  ];

  const result = calculateKabMd({
    employeeCount,
    standards: selectedStandards,
    riskLevel,
    auditType,
    baseRatePerMd: baseRate
  });

  const toggleStandard = (code: StandardCode) => {
    if (selectedStandards.includes(code)) {
      if (selectedStandards.length > 1) {
        setSelectedStandards(selectedStandards.filter(s => s !== code));
      }
    } else {
      setSelectedStandards([...selectedStandards, code]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* 1. Header Banner & 업무 프로세스 안내 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
              <Calculator className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                KAB 인정기관 공인 기준실 &amp; 사전 견적 시뮬레이터
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                한국인정지원센터(KAB) 공식 MD 산정 기준 테이블 조회 및 신규·유지 고객 사전 모의 견적 도구
              </p>
            </div>
          </div>
        </div>

        {/* 심사계약 직행 안내 버튼 */}
        <div className="flex items-center space-x-2">
          {onNavigateToContracts && (
            <button
              onClick={onNavigateToContracts}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <span>개별 심사계약 체결 및 수동조정 승인 바로가기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 안내 알림 배너 */}
      <div className="bg-cyan-50/70 border border-cyan-200 p-4 rounded-2xl text-xs text-cyan-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <HelpCircle className="w-5 h-5 text-cyan-600 shrink-0" />
          <span>
            <strong>[실무 프로세스 안내]</strong> 본 화면은 KAB 공인 표준 산정 테이블 및 사전 상담 모의 견적 도구입니다. 특정 고객사의 실제 적용 MD 수동 조정, 할인 합의 및 내부 승인은 <strong>[심사관리 &gt; 심사계약]</strong> 메뉴에서 개별 계약 건으로 진행됩니다.
          </span>
        </div>
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-cyan-200 text-[11px]">
          <button
            onClick={() => setGuideTab('calc')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              guideTab === 'calc' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            모의 시뮬레이터
          </button>
          <button
            onClick={() => setGuideTab('table')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              guideTab === 'table' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            KAB 공인 기준표
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2-A. 사전 모의 견적 시뮬레이터 */}
      {/* ========================================================= */}
      {guideTab === 'calc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Input Parameters */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Settings2 className="w-4 h-4 text-cyan-600" />
                <span>기업 규모 및 심사 조건 설정</span>
              </h2>
            </div>

            {/* 상시 종업원수 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  상시 종업원 수 (정규직 + 계약직 합산)
                </label>
                <span className="text-xs font-mono font-extrabold text-cyan-700">
                  {employeeCount}명
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1명 (소기업)</span>
                <span>50명</span>
                <span>150명</span>
                <span>300명</span>
                <span>500명+ (대기업)</span>
              </div>
            </div>

            {/* GMSCS 14대 공인 규격 선택 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700">
                  심사 대상 인증 규격 (GMSCS 공인 14대 규격)
                </label>
                <span className="text-[11px] text-slate-500">
                  선택 규격 수: <strong className="text-cyan-700 font-bold">{selectedStandards.length}개</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {standardOptions.map((std) => {
                  const isChecked = selectedStandards.includes(std);
                  return (
                    <button
                      key={std}
                      type="button"
                      onClick={() => toggleStandard(std)}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        isChecked
                          ? 'bg-cyan-50/80 border-cyan-400 text-cyan-950 font-bold shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        isChecked ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-slate-300'
                      }`}>
                        {isChecked && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                      <span className="truncate">{std}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 심사 구분 및 비즈니스 위험도 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  심사 구분
                </label>
                <select
                  value={auditType}
                  onChange={(e) => setAuditType(e.target.value as AuditType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="최초 1단계">최초 1단계 심사 (문서 25%)</option>
                  <option value="최초 2단계">최초 2단계 심사 (현장 75%)</option>
                  <option value="사후관리 1차">사후관리 1차 심사 (35%)</option>
                  <option value="사후관리 2차">사후관리 2차 심사 (35%)</option>
                  <option value="갱신심사">3년 갱신 심사 (67%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  업종 비즈니스 위험도
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="Low">Low (단순 서비스/소프트웨어 -15%)</option>
                  <option value="Medium">Medium (표준 제조/물류 0%)</option>
                  <option value="High">High (중화학/건설/위험물 +15%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Panel: KAB Calculated Result Card & Guidelines */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-slate-500 uppercase">KAB 공식 표준 산출 결과</span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  KAB 공식 준수율 100%
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-600">산출 표준 MD</span>
                <strong className="text-4xl font-black text-slate-900 font-mono">
                  {result.calculatedMd.toFixed(1)} <span className="text-sm font-normal text-slate-500">MD</span>
                </strong>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-600">표준 견적가 (VAT별도)</span>
                <strong className="text-2xl font-black text-cyan-700 font-mono">
                  ₩{result.standardFee.toLocaleString()}
                </strong>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5 font-medium">
                <span className="font-bold text-slate-800 block text-xs">산출 산식 및 감면 내역:</span>
                {result.breakdown.map((txt, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-cyan-600">•</span>
                    <span>{txt}</span>
                  </div>
                ))}
              </div>

              {onNavigateToContracts && (
                <div className="pt-2">
                  <button
                    onClick={onNavigateToContracts}
                    className="w-full py-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>이 산출 조건으로 심사계약 작성하러 가기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 2-B. KAB 공인 기준표 탭 (종업원수 테이블 & 감면 규정) */}
      {/* ========================================================= */}
      {guideTab === 'table' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 종업원 수별 기본 MD 테이블 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Table className="w-5 h-5 text-cyan-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">KAB 종업원 수 구간별 기본 심사일수 (MD)</h3>
                <p className="text-[11px] text-slate-500">ISO 9001/14001 기준 단일 규격 최초 심사 기준 MD</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">상시 종업원 수</th>
                    <th className="py-2.5 px-3 text-center">최초 심사 (MD)</th>
                    <th className="py-2.5 px-3 text-center">사후 관리 (35%)</th>
                    <th className="py-2.5 px-3 text-center">3년 갱신 (67%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {[
                    { range: '1 ~ 5 명', init: '1.5 MD', surv: '1.0 MD', ren: '1.0 MD' },
                    { range: '6 ~ 10 명', init: '2.0 MD', surv: '1.0 MD', ren: '1.5 MD' },
                    { range: '11 ~ 15 명', init: '2.5 MD', surv: '1.0 MD', ren: '1.5 MD' },
                    { range: '16 ~ 25 명', init: '3.0 MD', surv: '1.0 MD', ren: '2.0 MD' },
                    { range: '26 ~ 45 명', init: '4.0 MD', surv: '1.5 MD', ren: '2.5 MD' },
                    { range: '46 ~ 65 명', init: '5.0 MD', surv: '2.0 MD', ren: '3.5 MD' },
                    { range: '66 ~ 85 명', init: '6.0 MD', surv: '2.0 MD', ren: '4.0 MD' },
                    { range: '86 ~ 125 명', init: '7.0 MD', surv: '2.5 MD', ren: '4.5 MD' },
                    { range: '126 ~ 175 명', init: '8.0 MD', surv: '3.0 MD', ren: '5.5 MD' },
                    { range: '176 ~ 275 명', init: '9.0 MD', surv: '3.0 MD', ren: '6.0 MD' },
                    { range: '276 ~ 425 명', init: '10.0 MD', surv: '3.5 MD', ren: '7.0 MD' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-sans font-medium text-slate-700">{row.range}</td>
                      <td className="py-2 px-3 text-center text-slate-900 font-bold">{row.init}</td>
                      <td className="py-2 px-3 text-center text-cyan-700 font-bold">{row.surv}</td>
                      <td className="py-2 px-3 text-center text-amber-700 font-bold">{row.ren}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 통합 심사 감면율 및 위험도 규정 */}
          <div className="space-y-6">
            
            {/* 복합 심사 감면 규정 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">다수 규격 통합 심사 감면율 규정</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                동일 사업장에서 복수의 규격(예: ISO 9001 + ISO 14001)을 동시 심사할 경우, 공통 프로세스(문서관리, 내부심사, 경영검토 등) 중복을 배제하여 공식 감면율을 적용합니다:
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[11px] text-emerald-700 font-bold block">2개 규격 통합</span>
                  <strong className="text-lg font-black text-emerald-900 font-mono">20% 감면</strong>
                </div>
                <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-center">
                  <span className="text-[11px] text-cyan-700 font-bold block">3개 규격 통합</span>
                  <strong className="text-lg font-black text-cyan-900 font-mono">30% 감면</strong>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                  <span className="text-[11px] text-indigo-700 font-bold block">4개 이상 규격</span>
                  <strong className="text-lg font-black text-indigo-900 font-mono">35% 감면</strong>
                </div>
              </div>
            </div>

            {/* 업종 비즈니스 위험도 가이드 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">업종별 비즈니스 위험도 가중치</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800">Low (단순 서비스 / 소프트웨어)</span>
                    <span className="text-[11px] text-slate-500 block">IAF 33, 35 등 도소매, IT 시스템 개발</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">-15% 할인</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800">Medium (표준 제조 / 물류 / 유통)</span>
                    <span className="text-[11px] text-slate-500 block">IAF 14, 17, 19, 29 등 일반 기계, 전자 부품</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">표준 (0%)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800">High (중화학 / 건설 / 고위험 의료)</span>
                    <span className="text-[11px] text-slate-500 block">IAF 12, 13, 28 등 유해화학물질, 건축 토목 시공</span>
                  </div>
                  <span className="font-mono font-bold text-rose-600">+15% 가산</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
