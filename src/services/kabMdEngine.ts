import { AuditType, StandardCode } from '../types';

export interface KabMdCalculationInput {
  employeeCount: number;
  standards: StandardCode[];
  riskLevel: 'High' | 'Medium' | 'Low';
  auditType: AuditType;
  baseRatePerMd?: number; // MD당 기본 단가 (기본 800,000원)
}

export interface KabMdCalculationResult {
  baseMd: number;
  multiStandardDiscount: number; // 복합인증 할인 비율 (0 ~ 0.3)
  riskFactor: number; // 위험도 가감
  auditTypeRatio: number; // 심사 유형별 비율
  calculatedMd: number; // 최종 KAB 표준 MD (반올림 0.5단위)
  standardFee: number; // 표준 심사비 (VAT 별도)
  breakdown: string[];
}

/**
 * 종업원 수에 따른 기본 MD (KAB 지침 기준 요약 테이블)
 */
export function getBaseMdByEmployees(count: number): number {
  if (count <= 5) return 1.5;
  if (count <= 10) return 2.0;
  if (count <= 15) return 2.5;
  if (count <= 25) return 3.0;
  if (count <= 45) return 4.0;
  if (count <= 65) return 5.0;
  if (count <= 85) return 6.0;
  if (count <= 125) return 7.0;
  if (count <= 175) return 8.0;
  if (count <= 275) return 9.0;
  if (count <= 425) return 10.0;
  return 11.0 + Math.floor((count - 425) / 150);
}

/**
 * KAB 표준 심사 MD 및 표준 비용 계산 엔진
 */
export function calculateKabMd(input: KabMdCalculationInput): KabMdCalculationResult {
  const { employeeCount, standards, riskLevel, auditType, baseRatePerMd = 800000 } = input;
  const breakdown: string[] = [];

  // 1. 기본 MD
  let baseMd = getBaseMdByEmployees(employeeCount);
  breakdown.push(`기본 MD: 종업원 ${employeeCount}명 기준 -> ${baseMd} MD`);

  // 2. 복합 인증 (Multi-Standards) 가산 및 통합 할인
  let standardCount = Math.max(1, standards.length);
  let multiStandardDiscount = 0;
  if (standardCount > 1) {
    // 2개 규격: 두번째 규격에 대해 70% 가산 (30% 중복 할인)
    multiStandardDiscount = 0.20; // 20% 통합 할인 적용
    baseMd = baseMd * (1 + (standardCount - 1) * 0.8);
    breakdown.push(`복합 규격 (${standards.join(' + ')}): ${standardCount}개 규격 통합심사 -> 20% 감면율 적용`);
  }

  // 3. 위험도 조정
  let riskFactor = 1.0;
  if (riskLevel === 'High') {
    riskFactor = 1.15; // +15%
    breakdown.push(`위험도 High(고위험 업종): +15% 할증`);
  } else if (riskLevel === 'Low') {
    riskFactor = 0.85; // -15%
    breakdown.push(`위험도 Low(단순 조립/서비스): -15% 감면`);
  } else {
    breakdown.push(`위험도 Medium(표준 제조/유통): 표준 1.0 적용`);
  }

  // 4. 심사 종류별 비율
  let auditTypeRatio = 1.0;
  switch (auditType) {
    case '최초 1단계':
      auditTypeRatio = 0.25; // 최초 심사의 25% (문서심사)
      breakdown.push(`최초 1단계 심사: 전체 최초심사의 25% 배정`);
      break;
    case '최초 2단계':
      auditTypeRatio = 0.75; // 최초 심사의 75% (현장심사)
      breakdown.push(`최초 2단계 심사: 전체 최초심사의 75% 배정`);
      break;
    case '사후관리 1차':
    case '사후관리 2차':
      auditTypeRatio = 0.35; // 최초 심사의 약 1/3 (35%)
      breakdown.push(`사후관리 심사: 규정상 최초심사의 약 1/3 (35%) 배정`);
      break;
    case '갱신심사':
      auditTypeRatio = 0.67; // 최초 심사의 2/3 (67%)
      breakdown.push(`갱신 심사: 규정상 최초심사의 2/3 (67%) 배정`);
      break;
    default:
      auditTypeRatio = 0.3;
      breakdown.push(`특별/기타 심사: 필요 범위 산정 (30%)`);
      break;
  }

  // 5. 종합 산출
  let rawMd = baseMd * riskFactor * auditTypeRatio;
  // 0.5 단위로 올림 (KAB 통상 반올림 관행)
  let calculatedMd = Math.ceil(rawMd * 2) / 2;
  if (calculatedMd < 1.0) calculatedMd = 1.0; // 최소 1.0 MD 보장

  let standardFee = calculatedMd * baseRatePerMd;

  breakdown.push(`최종 산출 KAB 표준 MD: ${calculatedMd.toFixed(1)} MD (표준 견적가: ₩${standardFee.toLocaleString()})`);

  return {
    baseMd,
    multiStandardDiscount,
    riskFactor,
    auditTypeRatio,
    calculatedMd,
    standardFee,
    breakdown,
  };
}
