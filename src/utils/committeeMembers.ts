export interface CommitteeMember {
  id: string;
  name: string;
  role: string; // '대표이사 (심의위원장)', '부원장 (수석심의위원)', '대리 (심의위원)', '주임 (간사·운영담당)'
  affiliation: '상근' | '비상근' | '외부위원';
  isPermanent: boolean; // 상근 여부 (기본 4명 상근 보장)
  approvalPin: string; // 전자결재 승인 비밀번호/PIN (예: '9001', '1234')
  email: string;
  phone: string;
  specialty: string; // 심의 전문분야
  appointedDate: string; // 위촉일자
  status: '활동중' | '휴직' | '해촉';
  notes?: string;
}

export const DEFAULT_COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    id: 'comm-mem-1',
    name: '남경호',
    role: '대표이사 (심의위원장)',
    affiliation: '상근',
    isPermanent: true,
    approvalPin: '9001',
    email: 'fumac@naver.com',
    phone: '010-3797-1563',
    specialty: '품질(QMS) / 환경(EMS) / 안전보건(OHSMS) / 정보보안(ISMS) 종합 심의',
    appointedDate: '2023-01-01',
    status: '활동중',
    notes: '인증원 대표이사 및 심의위원회 위원장 총괄'
  },
  {
    id: 'comm-mem-2',
    name: '정현일',
    role: '부원장 (수석심의위원)',
    affiliation: '상근',
    isPermanent: true,
    approvalPin: '1234',
    email: 'jung@gmscs.co.kr',
    phone: '010-5818-0601',
    specialty: '정보보안(ISMS) / 클라우드 / 품질(QMS) 기술심의',
    appointedDate: '2023-01-01',
    status: '활동중',
    notes: '부원장 및 인증 심의 판정 수석책임자'
  },
  {
    id: 'comm-mem-3',
    name: '이혜원',
    role: '대리 (심의위원)',
    affiliation: '상근',
    isPermanent: true,
    approvalPin: '1234',
    email: 'lee@gmscs.co.kr',
    phone: '010-4421-8890',
    specialty: '환경경영(EMS) / 안전보건(OHSMS) / ESG 심의',
    appointedDate: '2024-03-01',
    status: '활동중',
    notes: '환경·안전보건 및 심사보고서 기술검토 전담'
  },
  {
    id: 'comm-mem-4',
    name: '남효린',
    role: '주임 (간사·운영담당)',
    affiliation: '상근',
    isPermanent: true,
    approvalPin: '1234',
    email: 'kgms2304@gmail.com',
    phone: '02-6929-1702',
    specialty: '인증심의 행정운영 / 공문 발송 / 의결대장 관리',
    appointedDate: '2024-06-01',
    status: '활동중',
    notes: '심의위원회 간사 및 공문·기안 행정 총괄'
  }
];

const LOCAL_STORAGE_KEY = 'GMSCS_COMMITTEE_MEMBERS';

/**
 * 저장된 심의위원 목록 로드 (로컬 스토리지 연동, 없으면 기본 4명 상근인원 반환)
 */
export function loadSavedCommitteeMembers(): CommitteeMember[] {
  if (typeof window === 'undefined') return DEFAULT_COMMITTEE_MEMBERS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_COMMITTEE_MEMBERS));
      return DEFAULT_COMMITTEE_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // 상근 4명이 누락되지 않도록 병합 보장
      const merged = [...parsed];
      DEFAULT_COMMITTEE_MEMBERS.forEach(def => {
        if (!merged.some(m => m.name === def.name || m.id === def.id)) {
          merged.unshift(def);
        }
      });
      return merged;
    }
  } catch (err) {
    console.error('Failed to load committee members:', err);
  }
  return DEFAULT_COMMITTEE_MEMBERS;
}

/**
 * 심의위원 목록 영구 저장
 */
export function saveCommitteeMembers(members: CommitteeMember[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save committee members:', err);
  }
}

/**
 * 심의위원 결재/승인 비밀번호 검증
 */
export function verifyMemberApprovalPin(memberIdOrName: string, pin: string): { valid: boolean; member?: CommitteeMember } {
  const members = loadSavedCommitteeMembers();
  const matched = members.find(m => m.id === memberIdOrName || m.name === memberIdOrName || m.email === memberIdOrName);
  
  if (!matched) {
    // 4명 기본 상근인원에 대한 기본 검증 fallback
    const def = DEFAULT_COMMITTEE_MEMBERS.find(d => d.name === memberIdOrName);
    if (def) {
      return { valid: def.approvalPin === pin.trim(), member: def };
    }
    return { valid: false };
  }

  const isValid = (matched.approvalPin || '1234').trim() === pin.trim();
  return { valid: isValid, member: matched };
}

/**
 * 특정 사용자(성명/이메일/아이디)가 상근 인원인지 판정
 */
export function isPermanentStaffMember(nameOrIdOrEmail?: string): boolean {
  if (!nameOrIdOrEmail) return false;
  const clean = nameOrIdOrEmail.toLowerCase().trim();
  if (clean === 'admin' || clean === 'fumac@naver.com' || clean === 'kgms2304@gmail.com') return true;
  
  const permanentNames = ['남경호', '정현일', '이혜원', '남효린', '김홍덕'];
  if (permanentNames.some(n => clean.includes(n.toLowerCase()))) return true;

  const members = loadSavedCommitteeMembers();
  const matched = members.find(m => 
    m.id.toLowerCase() === clean || 
    m.name.toLowerCase() === clean || 
    m.email.toLowerCase() === clean
  );
  return !!matched && (matched.isPermanent || matched.affiliation === '상근');
}
