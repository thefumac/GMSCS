import React, { useState } from 'react';
import { 
  Calculator, 
  Settings2, 
  Check, 
  FileCheck
} from 'lucide-react';
import { StandardCode, AuditType } from '../types';
import { calculateKabMd } from '../services/kabMdEngine';

export const KabCalculator: React.FC = () => {
  const [employeeCount, setEmployeeCount] = useState<number>(45);
  const [selectedStandards, setSelectedStandards] = useState<StandardCode[]>([
    'ISO 9001:2015',
    'ISO 14001:2015'
  ]);
  const [riskLevel, setRiskLevel] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [auditType, setAuditType] = useState<AuditType>('사후관리 1차');
  const [baseRate] = useState<number>(800000); // 80만원/MD

  const [isOverride, setIsOverride] = useState<boolean>(true);
  const [overrideMd, setOverrideMd] = useState<number>(2.0);
  const [overrideFee, setOverrideFee] = useState<number>(1600000);
  const [overrideReason, setOverrideReason] = useState<string>('장기 고객사 패키지 우대 및 인근 심사 연계 출장비 감액');
  const [issuerName, setIssuerName] = useState<string>('GMSCS');

  const standardOptions: StandardCode[] = [
    'ISO 9001:2015',
    'ISO 14001:2015',
    'ISO 45001:2018',
    'ISO 27001:2022',
    'ISO 37001:2016'
  ];

  const result = calculateKabMd({
    employeeCount,
    standards: selectedStandards,
    riskLevel,
    auditType,
    baseRatePerMd: baseRate
  });

  const handleStandardToggle = (std: StandardCode) => {
    if (selectedStandards.includes(std)) {
      if (selectedStandards.length > 1) {
        setSelectedStandards(selectedStandards.filter(s => s !== std));
      }
    } else {
      setSelectedStandards([...selectedStandards, std]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              KAB(한국인증인정원) 심사 MD 산정 엔진 & 비용 수동 조정
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            KAB 공식 지침에 따른 종업원 수·위험도·통합심사 감면율을 자동 계산하며, 
            <strong className="text-amber-800"> 최종 심사비·적용 MD 수동 조정</strong> 및 
            <strong className="text-cyan-700"> 제휴 인증원 명의 발행</strong>을 지원합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: KAB Formula Inputs */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-cyan-600" /> 1. KAB 심사 MD 산정 기초 파라미터
          </h3>

          {/* 종업원 수 */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>상시 종업원 수 (FTE)</span>
              <strong className="text-cyan-700 text-sm font-extrabold">{employeeCount} 명</strong>
            </div>
            <input
              type="range"
              min={1}
              max={300}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
              <span>1명</span>
              <span>50명</span>
              <span>100명</span>
              <span>200명</span>
              <span>300명</span>
            </div>
          </div>

          {/* 인증 규격 선택 (복합 규격) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              심사 규격 (다중 선택 시 통합 심사 감면율 20% 자동 적용)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {standardOptions.map(std => {
                const isChecked = selectedStandards.includes(std);
                return (
                  <button
                    key={std}
                    type="button"
                    onClick={() => handleStandardToggle(std)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition ${
                      isChecked
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{std}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 심사 구분 및 위험도 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                심사 구분
              </label>
              <select
                value={auditType}
                onChange={(e) => setAuditType(e.target.value as AuditType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
              >
                <option value="Low">Low (단순 서비스/소프트웨어 -15%)</option>
                <option value="Medium">Medium (표준 제조/물류 0%)</option>
                <option value="High">High (중화학/건설/위험물 +15%)</option>
              </select>
            </div>
          </div>

          {/* 발행 기관 (GMSCS vs 타 인증원 명의) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              발행 인증기관 (Multi-Issuer 지원)
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['GMSCS', '한국품질인증원(제휴)', '글로벌QA인증(해외)'].map(issuer => (
                <button
                  key={issuer}
                  type="button"
                  onClick={() => setIssuerName(issuer)}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    issuerName === issuer
                      ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {issuer}
                </button>
              ))}
            </div>
            {issuerName !== 'GMSCS' && (
              <p className="text-[11px] text-amber-800 font-semibold mt-1.5">
                * 타 인증원 협약 규정에 따라 인증서 양식 및 인정마크가 해당 기관 규격으로 자동 전환됩니다.
              </p>
            )}
          </div>
        </div>

        {/* Right Panel: KAB Calculated vs Manual Override */}
        <div className="lg:col-span-5 space-y-6">
          {/* KAB Standard Calculation Result Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase">KAB 공식 표준 산출 결과</span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                규정 100% 준수
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-600">산출 표준 MD</span>
              <strong className="text-3xl font-extrabold text-slate-900">
                {result.calculatedMd.toFixed(1)} <span className="text-sm font-normal text-slate-500">MD</span>
              </strong>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-600">표준 견적가 (VAT별도)</span>
              <strong className="text-xl font-extrabold text-cyan-700">
                ₩{result.standardFee.toLocaleString()}
              </strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1 font-medium">
              {result.breakdown.map((txt, i) => (
                <div key={i} className="flex items-start gap-1">
                  <span className="text-cyan-600">•</span>
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 수동 조정 카드 */}
          <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-extrabold text-amber-900">심사비 / 적용 MD 수동 조정</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOverride}
                  onChange={(e) => setIsOverride(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {isOverride && (
              <div className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">실제 적용 MD</label>
                    <input
                      type="number"
                      step="0.5"
                      value={overrideMd}
                      onChange={(e) => setOverrideMd(Number(e.target.value))}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-extrabold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      최종 합의 심사비 (₩)
                    </label>
                    <input
                      type="text"
                      value={overrideFee ? overrideFee.toLocaleString() : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setOverrideFee(raw ? parseInt(raw, 10) : 0);
                      }}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-amber-900 font-extrabold focus:outline-none tracking-wide"
                      placeholder="금액을 입력하십시오"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">수동 조정 사유 (감사 입증용)</label>
                  <textarea
                    rows={2}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-amber-500 text-xs leading-relaxed"
                    placeholder="조정 사유를 입력하십시오"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => alert(`[KAB 심사비 및 MD 저장 완료]\n\n표준 산출: ${result.calculatedMd} MD / ₩${result.standardFee.toLocaleString()}\n실제 적용: ${overrideMd} MD / ₩${overrideFee.toLocaleString()}\n사유: ${overrideReason}\n발행기관: ${issuerName}`)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition shadow-sm"
                >
                  심사 계획서 및 견적에 반영하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
