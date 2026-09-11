/**
 * 직책/직함 및 성명 정제 유틸리티
 * DB 내 '박진용 대표이사', '최공남 대표이사', '이호용 이사' 등의 데이터에서
 * 순수 이름과 직책을 안전하게 분리하고 중복 결합('대표이사 이사' 등)을 원천 방지합니다.
 */

const KNOWN_POSITIONS = [
  '대표이사',
  '대표',
  '총괄대표',
  '공동대표',
  '전무이사',
  '상무이사',
  '상무',
  '전무',
  '이사',
  '부사장',
  '사장',
  '본부장',
  '부장',
  '차장',
  '과장',
  '대리',
  '주임',
  '사원',
  '팀장',
  '실장',
  '파트장',
  '소장',
  '품질팀장',
  '품질부장',
  '공장장'
];

/**
 * 성명에서 불필요한 직책 접미어를 제거한 순수 이름 반환
 * 예: "박진용 대표이사" -> "박진용"
 * 예: "박진용" -> "박진용"
 */
export function cleanPersonName(rawName?: string): string {
  if (!rawName) return '';
  let cleaned = rawName.trim();
  
  // 괄호 안 내용 분리 (예: "박진용 (대표이사)")
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, '').trim();

  // 알려진 직책 접미어 제거
  for (const pos of KNOWN_POSITIONS) {
    if (cleaned.endsWith(` ${pos}`)) {
      cleaned = cleaned.substring(0, cleaned.length - (pos.length + 1)).trim();
    } else if (cleaned.endsWith(pos) && cleaned.length > pos.length) {
      // "박진용대표이사" 처럼 공백 없는 경우도 안전하게 분리
      cleaned = cleaned.substring(0, cleaned.length - pos.length).trim();
    }
  }

  return cleaned || rawName.trim();
}

/**
 * 대표자 이름 정제 (순수 이름만 반환)
 */
export function cleanCeoName(rawCeo?: string): string {
  return cleanPersonName(rawCeo);
}

/**
 * 성명과 직책을 안전하게 분리
 * 예: "박진용 대표이사" -> { name: "박진용", position: "대표이사" }
 * 예: "정순호", default "이사" -> { name: "정순호", position: "이사" }
 */
export function splitPersonAndPosition(
  rawInput?: string,
  defaultPosition: string = '담당자'
): { name: string; position: string } {
  if (!rawInput) {
    return { name: '', position: defaultPosition };
  }

  const trimmed = rawInput.trim();
  
  // 1. 괄호 형식 처리: "홍길동 (부장)"
  const bracketMatch = trimmed.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (bracketMatch) {
    return {
      name: bracketMatch[1].trim(),
      position: bracketMatch[2].trim() || defaultPosition
    };
  }

  // 2. 공백 또는 슬래시 분리: "김성혜 과장/이태희 대표이사" -> 앞사람 우선
  if (trimmed.includes('/')) {
    const firstPerson = trimmed.split('/')[0].trim();
    return splitPersonAndPosition(firstPerson, defaultPosition);
  }

  // 3. 알려진 직책 매칭
  for (const pos of KNOWN_POSITIONS) {
    if (trimmed.endsWith(` ${pos}`)) {
      const namePart = trimmed.substring(0, trimmed.length - (pos.length + 1)).trim();
      if (namePart) {
        return { name: namePart, position: pos };
      }
    } else if (trimmed.endsWith(pos) && trimmed.length > pos.length) {
      const namePart = trimmed.substring(0, trimmed.length - pos.length).trim();
      if (namePart) {
        return { name: namePart, position: pos };
      }
    }
  }

  return {
    name: trimmed,
    position: defaultPosition
  };
}

/**
 * 대표자명 포맷팅 (서식용: "박진용 대표이사" 또는 "박진용")
 * 이미 대표이사 등이 포함되어 있더라도 중복 없이 1회만 결합
 */
export function formatCeoDisplay(ceoName?: string, suffix: string = '대표이사'): string {
  const clean = cleanCeoName(ceoName);
  if (!clean) return '';
  if (suffix && !clean.includes(suffix)) {
    return `${clean} ${suffix}`;
  }
  return clean;
}

/**
 * 담당자 및 직책 포맷팅 (예: "홍길동 부장")
 */
export function formatContactPersonDisplay(contactPerson?: string, contactPosition?: string): string {
  const { name, position } = splitPersonAndPosition(contactPerson, contactPosition || '담당자');
  const finalPos = contactPosition && contactPosition !== '담당자' ? contactPosition : position;
  if (finalPos && finalPos !== '담당자') {
    return `${name} ${finalPos}`;
  }
  return name;
}
