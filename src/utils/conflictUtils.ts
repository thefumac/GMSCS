/**
 * 인증 업무 이해충돌(Conflict of Interest) 방지 및 협력기관 명칭 포맷터
 * 
 * 규칙:
 * 1. 담당심사원과 협력기관(컨설턴트/유치자)이 동일인이거나 포함되는 경우 이해충돌 방지를 위해 협력기관을 노출하지 않고 '—' (N/A)로 처리합니다.
 * 2. 원래 협력기관 데이터(consultant)가 있는 경우 해당 명칭을 표시합니다.
 * 3. '사무국직접' 또는 'HQ사무국' 등 본원 직영인 경우 'HQ직영'으로 표시합니다.
 */

export function isConflictOfInterest(consultantName?: string, auditorName?: string): boolean {
  if (!consultantName || !auditorName) return false;
  
  const cleanConsultant = consultantName.replace(/\s+/g, '');
  if (!cleanConsultant || cleanConsultant === '사무국직접' || cleanConsultant === 'HQ사무국' || cleanConsultant === 'HQ직영') {
    return false;
  }

  // 심사원명이 복수인 경우 (예: "이기영,남미현", "이기영 / 남미현") 분리 검사
  const auditors = auditorName.split(/[,/·\s]+/).map(a => a.replace(/\s+/g, '')).filter(Boolean);

  return auditors.some(aud => {
    if (aud === cleanConsultant) return true;
    if (cleanConsultant.length >= 2 && (aud.includes(cleanConsultant) || cleanConsultant.includes(aud))) {
      return true;
    }
    return false;
  });
}

export function getAgencyDisplayName(consultantName?: string, auditorName?: string): string {
  const clean = (consultantName || '').trim();
  
  if (!clean || clean === '사무국직접' || clean === 'HQ사무국' || clean === 'HQ직영') {
    return 'HQ직영';
  }

  if (isConflictOfInterest(clean, auditorName)) {
    return '—'; // 이해충돌(COI) 방지로 미표기
  }

  return clean;
}
