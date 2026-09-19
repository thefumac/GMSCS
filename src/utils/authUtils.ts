import { Auditor } from '../types';

export const DEFAULT_AUTH_PASSWORD = 'gms9001';
export const SUPER_ADMIN_EMAIL = 'the.elphis@gmail.com';
export const SUPER_ADMIN_DEFAULT_PASSWORD = 'TempAdmin2026!#';

export const SUPER_ADMIN_ACCOUNT: Auditor = {
  id: 'super-admin',
  gmsNumber: 'GMS-SUPER',
  originType: '상근',
  name: '최고관리자',
  mobile: '010-0000-0000',
  telephone: '02-6929-1700',
  email: 'the.elphis@gmail.com',
  address: '서울특별시 금천구 가산디지털1로 181 (가산동, W-MALL 12층)',
  residentialRegion: '서울 금천구',
  birthDate: '1980-01-01',
  gender: '남',
  education: '경영공학과',
  major: '시스템품질경영',
  agency: 'GMS',
  regDate: '2020-01-01',
  grade: '선임심사원',
  status: '활동',
  affiliation: '상근',
  isSystemAdmin: true,
  role: 'SuperAdmin',
  iafCodes: ['14', '18', '29', '34', '35'],
  iafDetails: [],
  qualifications: [],
  certificates: [],
  trainingHistory: [],
  seminarHistory: [],
  careerCertRequests: [],
  registeredStandards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
  contractExpiryDate: '2030-12-31',
  activeClientCount: 0,
  isCommitteeMember: true,
  committeeRole: '심의위원장',
  payoutRatePerMd: 0,
};

const STORAGE_KEY = 'gmscs_auditor_passwords';

export function getStoredPasswords(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse gmscs passwords', e);
    return {};
  }
}

export function getAuditorPassword(auditorId: string, email: string): string {
  const emailKey = email?.toLowerCase().trim();
  const superAdminEmail = (import.meta.env.VITE_SUPERADMIN_EMAIL || SUPER_ADMIN_EMAIL).toLowerCase().trim();
  const superAdminPass = (import.meta.env.VITE_SUPERADMIN_TEMP_PASSWORD || SUPER_ADMIN_DEFAULT_PASSWORD).trim();

  if (emailKey === superAdminEmail || emailKey === SUPER_ADMIN_EMAIL || auditorId === 'super-admin') {
    const store = getStoredPasswords();
    if (store['super-admin'] && store['super-admin'] !== DEFAULT_AUTH_PASSWORD) return store['super-admin'];
    if (store[SUPER_ADMIN_EMAIL] && store[SUPER_ADMIN_EMAIL] !== DEFAULT_AUTH_PASSWORD) return store[SUPER_ADMIN_EMAIL];
    return superAdminPass;
  }

  const store = getStoredPasswords();
  if (store[auditorId]) return store[auditorId];
  if (emailKey && store[emailKey]) return store[emailKey];

  if (emailKey === 'kgms2304@gmail.com') return '14001';

  return DEFAULT_AUTH_PASSWORD;
}

export function saveAuditorPassword(auditorId: string, email: string, newPassword: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const store = getStoredPasswords();
    store[auditorId] = newPassword;
    if (email) {
      store[email.toLowerCase().trim()] = newPassword;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch (e) {
    console.error('Failed to save password', e);
    return false;
  }
}

export function verifyPassword(auditorId: string, email: string, inputPass: string): boolean {
  const trimmed = inputPass.trim();
  if (!trimmed) return false;
  
  const emailKey = email?.toLowerCase().trim();
  const superAdminEmail = (import.meta.env.VITE_SUPERADMIN_EMAIL || SUPER_ADMIN_EMAIL).toLowerCase().trim();
  const superAdminPass = (import.meta.env.VITE_SUPERADMIN_TEMP_PASSWORD || SUPER_ADMIN_DEFAULT_PASSWORD).trim();

  // SuperAdmin 계정 검증: 오직 설정된 정식 비밀번호로만 인증 허용 (gms9001 완전 차단)
  if (emailKey === superAdminEmail || emailKey === SUPER_ADMIN_EMAIL || auditorId === 'super-admin') {
    const stored = getAuditorPassword(auditorId, email);
    if (trimmed === superAdminPass || trimmed === SUPER_ADMIN_DEFAULT_PASSWORD || (stored && stored !== DEFAULT_AUTH_PASSWORD && trimmed === stored)) {
      return true;
    }
    return false;
  }

  // 사무국 테스트 임시 관리자 계정 (kgms2304@gmail.com / 14001)
  if (emailKey === 'kgms2304@gmail.com' && (trimmed === '14001' || trimmed === DEFAULT_AUTH_PASSWORD)) {
    return true;
  }

  // 긴급 관리자 마스터 비번 허용
  if (trimmed === 'admin' || trimmed === '1234') return true;

  const currentPass = getAuditorPassword(auditorId, email);
  return trimmed === currentPass;
}
