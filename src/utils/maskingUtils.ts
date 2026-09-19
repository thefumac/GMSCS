/**
 * 슈퍼관리자(SuperAdmin / 솔루션 공급사 / 개발자) 모드 전용 비식별화 마스킹 유틸리티
 * 개인정보보호법 및 영업비밀 보호 가이드라인에 따른 주요 식별 정보 마스킹 처리
 */

import { Company, Auditor, AuditProject, CertContract, AuditContractRecord } from '../types';

/**
 * 1. 기업명 마스킹
 * - (주) 등 접두사 보존, 앞 2~3자리 제외 후 마스킹
 * - 예: "(주)삼성전자" -> "(주)삼성**", "현대모비스 주식회사" -> "현대*** 주식회사", "송이실업" -> "송이**"
 */
export function maskCompanyName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  
  // (주), 주식회사 등 법인 형태 접두/접미사 분리
  const prefixMatch = trimmed.match(/^(\(주\)|주식회사|\(유\)|유한회사)\s*/);
  const suffixMatch = trimmed.match(/\s*(\(주\)|주식회사|\(유\)|유한회사)$/);
  
  const prefix = prefixMatch ? prefixMatch[0] : '';
  const suffix = suffixMatch ? suffixMatch[0] : '';
  
  const core = trimmed.substring(prefix.length, trimmed.length - suffix.length);
  if (core.length <= 2) {
    return prefix + core.slice(0, 1) + '*'.repeat(Math.max(1, core.length - 1)) + suffix;
  }
  const visibleLen = Math.min(2, Math.floor(core.length / 2));
  const maskedCore = core.slice(0, visibleLen) + '*'.repeat(core.length - visibleLen);
  return prefix + maskedCore + suffix;
}

/**
 * 2. 인명 (심사원, 대표자, 담당자 등) 마스킹
 * - 2자: 첫 글자 + * (예: "김홍" -> "김*")
 * - 3자: 첫 글자 + * + 끝 글자 (예: "홍길동" -> "홍*동", "남경호" -> "남*호")
 * - 4자 이상: 앞 1자 + *... + 끝 1자 (예: "남궁민수" -> "남**수")
 */
export function maskPersonName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed;
  if (trimmed.length === 2) return trimmed[0] + '*';
  if (trimmed.length === 3) return trimmed[0] + '*' + trimmed[2];
  return trimmed[0] + '*'.repeat(trimmed.length - 2) + trimmed[trimmed.length - 1];
}

/**
 * 3. 연락처 (휴대전화, 유선전화) 마스킹
 * - 중간 국번 전체 마스킹
 * - 예: "010-1234-5678" -> "010-****-5678", "02-123-4567" -> "02-***-4567"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  
  // 010-XXXX-XXXX 형태
  const mobileMatch = trimmed.match(/^(\d{2,3})-(\d{3,4})-(\d{4})$/);
  if (mobileMatch) {
    return `${mobileMatch[1]}-${'*'.repeat(mobileMatch[2].length)}-${mobileMatch[3]}`;
  }
  
  // 하이픈 없는 경우
  if (/^\d{9,11}$/.test(trimmed)) {
    if (trimmed.length === 11) {
      return `${trimmed.slice(0, 3)}-****-${trimmed.slice(7)}`;
    }
    if (trimmed.length === 10) {
      return `${trimmed.slice(0, 3)}-***-${trimmed.slice(6)}`;
    }
  }
  
  return trimmed.slice(0, 3) + '-****-' + trimmed.slice(-4);
}

/**
 * 4. 이메일 주소 마스킹
 * - ID 앞 2자리 제외 후 마스킹, 도메인 유지
 * - 예: "admin@gmscs.co.kr" -> "ad***@gmscs.co.kr", "fumac@naver.com" -> "fu***@naver.com"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) {
    return user[0] + '*@' + domain;
  }
  const visible = user.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(3, user.length - 2))}@${domain}`;
}

/**
 * 5. 사업자등록번호 마스킹
 * - 예: "123-45-67890" -> "123-**-*****"
 */
export function maskBizNumber(bizNo: string): string {
  if (!bizNo) return '';
  const trimmed = bizNo.trim();
  const match = trimmed.match(/^(\d{3})-(\d{2})-(\d{5})$/);
  if (match) {
    return `${match[1]}-**-*****`;
  }
  if (trimmed.length === 10) {
    return `${trimmed.slice(0, 3)}-**-*****`;
  }
  return trimmed.slice(0, 3) + '-**-*****';
}

/**
 * 6. 계좌번호 마스킹
 * - 예: "110-123-456789" -> "110-***-******"
 */
export function maskAccountNumber(acc: string): string {
  if (!acc) return '';
  const parts = acc.split('-');
  if (parts.length >= 2) {
    return parts[0] + '-' + '*'.repeat(parts[1].length) + (parts[2] ? '-' + '*'.repeat(parts[2].length) : '');
  }
  return acc.slice(0, 3) + '-***-****';
}

/**
 * SuperAdmin용 단일 기업 객체 마스킹 트랜스포머
 */
export function maskCompany(comp: Company): Company {
  if (!comp) return comp;
  const cAny = comp as any;
  return {
    ...comp,
    originalCompanyName: (comp as any).originalCompanyName || comp.companyName,
    originalCeoName: (comp as any).originalCeoName || comp.ceoName,
    companyName: maskCompanyName(comp.companyName),
    ceoName: maskPersonName(comp.ceoName),
    bizNumber: maskBizNumber(comp.bizNumber),
    contactPerson: maskPersonName(comp.contactPerson),
    contactPhone: maskPhoneNumber(comp.contactPhone),
    contactEmail: maskEmail(comp.contactEmail),
    address: comp.address ? comp.address.split(' ').slice(0, 2).join(' ') + ' *** (상세주소 마스킹)' : '',
    ...((cAny.contactMobile || cAny.mobile) ? { contactMobile: maskPhoneNumber(cAny.contactMobile || cAny.mobile) } : {}),
    ...(cAny.fax ? { fax: maskPhoneNumber(cAny.fax) } : {}),
    ...(cAny.assignedAuditorName ? { assignedAuditorName: cAny.assignedAuditorName.split(',').map((s: string) => maskPersonName(s.trim())).join(', ') } : {}),
    ...(cAny.leadAuditorName ? { leadAuditorName: maskPersonName(cAny.leadAuditorName) } : {}),
    ...(cAny.consultant ? { consultant: maskPersonName(cAny.consultant) } : {}),
    ...(cAny.businessNumber ? { businessNumber: maskBizNumber(cAny.businessNumber) } : {})
  } as Company;
}

/**
 * SuperAdmin용 단일 심사원 객체 마스킹 트랜스포머
 */
export function maskAuditor(auditor: Auditor): Auditor {
  if (!auditor) return auditor;
  return {
    ...auditor,
    name: maskPersonName(auditor.name),
    email: maskEmail(auditor.email),
    mobile: maskPhoneNumber(auditor.mobile),
    phone: auditor.phone ? maskPhoneNumber(auditor.phone) : '',
    taxEmail: auditor.taxEmail ? maskEmail(auditor.taxEmail) : '',
    accountNumber: auditor.accountNumber ? maskAccountNumber(auditor.accountNumber) : '',
    accountHolder: auditor.accountHolder ? maskPersonName(auditor.accountHolder) : '',
    businessCeo: auditor.businessCeo ? maskPersonName(auditor.businessCeo) : '',
    businessNumber: auditor.businessNumber ? maskBizNumber(auditor.businessNumber) : ''
  };
}

/**
 * SuperAdmin용 단일 프로젝트 객체 마스킹 트랜스포머
 */
export function maskProject(proj: AuditProject): AuditProject {
  if (!proj) return proj;
  return {
    ...proj,
    companyName: maskCompanyName(proj.companyName),
    leadAuditorName: maskPersonName(proj.leadAuditorName),
    teamAuditorNames: proj.teamAuditorNames ? proj.teamAuditorNames.map(maskPersonName) : []
  };
}

/**
 * SuperAdmin용 단일 계약 객체 마스킹 트랜스포머
 */
export function maskCertContract(contract: CertContract): CertContract {
  if (!contract) return contract;
  return {
    ...contract,
    companyName: maskCompanyName(contract.companyName)
  };
}

export function maskAuditContractRecord(record: AuditContractRecord): AuditContractRecord {
  if (!record) return record;
  return {
    ...record,
    companyName: maskCompanyName(record.companyName),
    leadAuditorName: maskPersonName(record.leadAuditorName),
    teamAuditorName: record.teamAuditorName ? maskPersonName(record.teamAuditorName) : record.teamAuditorName,
    agency: record.agency ? maskPersonName(record.agency) : record.agency
  };
}
