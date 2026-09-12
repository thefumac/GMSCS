export const DEFAULT_AUTH_PASSWORD = 'gms9001';
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
  if (emailKey === 'kgms2304@gmail.com') return '14001';

  const store = getStoredPasswords();
  if (store[auditorId]) return store[auditorId];
  if (emailKey && store[emailKey]) return store[emailKey];
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

  // 사무국 테스트 임시 관리자 계정 (kgms2304@gmail.com / 14001)
  if (emailKey === 'kgms2304@gmail.com' && (trimmed === '14001' || trimmed === 'gms9001')) {
    return true;
  }

  // 긴급 관리자 마스터 비번 허용
  if (trimmed === 'admin' || trimmed === '1234') return true;

  const currentPass = getAuditorPassword(auditorId, email);
  return trimmed === currentPass;
}
