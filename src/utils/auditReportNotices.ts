/**
 * GMSCS 심사보고서 작성 인증원 공지사항 관리 유틸리티
 * 사무국 인증관리에서 작성/수정한 공지사항이 심사보고서 작성 워크벤치(AuditReportWorkbench)에 실시간 연동됩니다.
 */

export interface AuditReportNoticeItem {
  id: string;
  category: '공통사항' | string; // '공통사항' or Standard Code like 'ISO 9001:2015'
  standardName?: string;
  title: string;
  content: string;
  author: string;
  priority: '필독' | '중요' | '일반';
  updatedAt: string;
}

export const STORAGE_KEY_AUDIT_NOTICES = 'GMSCS_AUDIT_REPORT_NOTICES_V1';

export const DEFAULT_AUDIT_REPORT_NOTICES: AuditReportNoticeItem[] = [
  // 공통 공지사항
  {
    id: 'notice-common-1',
    category: '공통사항',
    standardName: '전 규격 공통',
    title: '심사보고서 작성 시 객관적 증거 명시 및 실시간 기록 원칙',
    content: '1. 심사보고서 작성 시 모든 심사 의견에는 명확한 객관적 증거(문서번호, 양식명, 작성일자, 샘플링 건수, 담당자 직책 등)를 반드시 기술해야 합니다.\n2. 심사일정표(Time Schedule)와 실제 심사 진행 시간의 일치 여부를 철저히 확인하고 기록하십시오.\n3. 프로세스 감사노트는 1개 조항에 머무르지 않고 부서별/공정별 상호작용을 파악할 수 있도록 동적으로 페이지를 추가하여 충실히 작성하십시오.',
    author: 'GMSCS 인증원 사무국',
    priority: '필독',
    updatedAt: '2026-09-10'
  },
  {
    id: 'notice-common-2',
    category: '공통사항',
    standardName: '전 규격 공통',
    title: '시정조치 요구서(CAR) 및 증빙 자료(PDF/사진) 첨부 필수 지침',
    content: '1. 부적합(CAR) 발행 시 표준 조항 및 요구사항 위반 내용을 명확히 적시해야 합니다.\n2. 고객의 시정내용 및 재발방지대책(4M 분석) 작성 후, 반드시 관련 증빙자료(PDF 문서 또는 현장 개선 사진)를 요구서에 첨부하여 심사보고서 팩과 하나의 묶음으로 전산 저장/제출하십시오.\n3. 중부적합은 30일 이내, 경부적합은 90일 이내 시정조치 완료 확인이 원칙입니다.',
    author: 'GMSCS 인증원 사무국',
    priority: '필독',
    updatedAt: '2026-09-08'
  },
  {
    id: 'notice-common-3',
    category: '공통사항',
    standardName: '전 규격 공통',
    title: '인증범위 확인서(Scope) 국/영문 명칭 및 사업자등록증 일치 점검',
    content: '1. 인정범위 확인서(17p)의 국문/영문 회사명, 사업자등록번호, 본사 및 사업장 주소, 인증범위 표기가 최신 사업자등록증 및 신청서와 100% 일치해야 합니다.\n2. 범위 변경이나 주소 이전 발생 시 보고서 상에서 즉시 수정하고 사무국에 통보하십시오.',
    author: 'GMSCS 인증원 사무국',
    priority: '중요',
    updatedAt: '2026-09-01'
  },

  // ISO 9001 (품질)
  {
    id: 'notice-iso9001',
    category: 'ISO 9001:2015',
    standardName: '품질경영시스템 (QMS)',
    title: 'ISO 9001 심사보고서 작성 및 착안점 공지',
    content: '• 4.4 프로세스 접근법 및 리스크 기반 사고 적용 여부 철저 확인\n• 8.5 생산 및 서비스 제공의 공정 관리 상태, 식별 및 추적성 기록 기재\n• 9.2 내부심사 및 9.3 경영검토 주기적 이행 실적 및 입력/출력 항목의 적절성\n• 고객만족도 조사 분석 및 부적합품 관리/시정조치 실효성 검증',
    author: 'GMSCS 인증원 사무국',
    priority: '중요',
    updatedAt: '2026-09-05'
  },

  // ISO 14001 (환경)
  {
    id: 'notice-iso14001',
    category: 'ISO 14001:2015',
    standardName: '환경경영시스템 (EMS)',
    title: 'ISO 14001 환경법규 준수의무사항 및 비상사태 훈련 확인',
    content: '• 6.1.2 환경측면 식별 및 중대한 환경영향 평가 기준과 도출 결과 검증\n• 6.1.3 준수의무사항(대기/수질/폐기물 인허가, 배출기준, 측정기록) 준수 여부\n• 8.2 비상사태 대비 및 대응 훈련(소방훈련, 화학물질 누출대응) 실시 결과 및 개선점\n• 환경목표 달성도 추적 및 현장 폐기물 보관소/위탁처리 계약서 확인',
    author: 'GMSCS 인증원 사무국',
    priority: '중요',
    updatedAt: '2026-09-05'
  },

  // ISO 45001 (안전보건)
  {
    id: 'notice-iso45001',
    category: 'ISO 45001:2018',
    standardName: '안전보건경영시스템 (OHSMS)',
    title: 'ISO 45001 중대재해처벌법 대응 및 근로자 협의·참여 점검',
    content: '• 5.4 근로자의 협의 및 참여 (산업안전보건위원회, 안전보건 건의함 실적)\n• 6.1.2 위험성평가(수시/정기 평가, 유해·위험요인 파악 및 통제대책 실행 여부)\n• 8.1.4 도급·외주업체 안전보건 평가, 안전작업허가제 및 현장 안전관리\n• 비상대응 매뉴얼, 물질안전보건자료(MSDS) 비치 및 안전보건교육 이수 기록',
    author: 'GMSCS 인증원 사무국',
    priority: '필독',
    updatedAt: '2026-09-05'
  },

  // ISO 27001 (정보보안)
  {
    id: 'notice-iso27001',
    category: 'ISO 27001:2022',
    standardName: '정보보안경영시스템 (ISMS)',
    title: 'ISO 27001:2022 전환 통제항목(93개 통제) 및 SoA 적용성 검토',
    content: '• 2022 개정 규격의 4개 도메인(조직적, 인적, 물리적, 기술적) 93개 통제항목 반영 여부\n• 적용성 선언서(SoA)의 제외 항목 타당성 및 최신 개정본 일치 확인\n• 접근통제, 클라우드 서비스 보안, 데이터 유출 방지(DLP) 및 위협 인텔리전스 통제 검증\n• 정보자산 식별 및 위험평가 보고서, 보안사고 대응훈련 기록',
    author: 'GMSCS 인증원 사무국',
    priority: '중요',
    updatedAt: '2026-09-02'
  },

  // ISO 37001 (부패방지)
  {
    id: 'notice-iso37001',
    category: 'ISO 37001:2016',
    standardName: '부패방지경영시스템 (ABMS)',
    title: 'ISO 37001 부패 리스크 평가 및 제3자 실사(Due Diligence) 점검',
    content: '• 부패 리스크 평가(부서별 뇌물/부패 가능성 평가 및 통제수단)\n• 고위험 직무 종사자 및 협력사/에이전트 제3자 실사(Due Diligence) 절차 이행\n• 부패방지 책임자(준법감시인) 독립성 및 최고경영진의 부패방지 서약\n• 내부고발제도(휘슬블로어) 비밀보장 및 조사 결과 보고 기록',
    author: 'GMSCS 인증원 사무국',
    priority: '일반',
    updatedAt: '2026-08-25'
  },

  // ISO 22000 (식품안전)
  {
    id: 'notice-iso22000',
    category: 'ISO 22000:2018',
    standardName: '식품안전경영시스템 (FSMS)',
    title: 'ISO 22000 HACCP 플랜, 선행요건(PRP) 및 CCP 한계기준 검증',
    content: '• 선행요건프로그램(PRP, 개인위생, 방충방서, 용수관리, 교차오염 방지) 관리 상태\n• 중요관리점(CCP) 및 운영선행요건(oPRP) 한계기준 설정 근거 및 모니터링 기록\n• 회수(Recall) 모의훈련 실시 및 알레르기 유발물질 관리\n• 식품안전팀 역량 및 검교정 주기 준수 현황',
    author: 'GMSCS 인증원 사무국',
    priority: '중요',
    updatedAt: '2026-08-20'
  },

  // ISO 50001 (에너지)
  {
    id: 'notice-iso50001',
    category: 'ISO 50001:2018',
    standardName: '에너지경영시스템 (EnMS)',
    title: 'ISO 50001 에너지 기준(EnB) 및 에너지 성과지표(EnPI) 추적',
    content: '• 에너지 검토(Energy Review) 및 주요 에너지 사용처(SEU) 식별\n• 에너지 성과지표(EnPI)와 에너지 기준(EnB) 간 상관관계 및 정규화(변수 조정)\n• 설비 개선 및 에너지 절감 목표 달성도 정량 평가\n• 주요 에너지 계측기 교정 및 데이터 신뢰성 확보 여부',
    author: 'GMSCS 인증원 사무국',
    priority: '일반',
    updatedAt: '2026-08-15'
  },

  // ISO 13485 (의료기기)
  {
    id: 'notice-iso13485',
    category: 'ISO 13485:2016',
    standardName: '의료기기 품질경영시스템 (MD-QMS)',
    title: 'ISO 13485 규제 요구사항, 설계개발(DHF) 및 임상평가 점검',
    content: '• 의료기기 품목허가/신고 등 각국 인허가 규제사항(MDR, FDA 등)과의 정합성\n• 설계 및 개발 파일(DHF), 위험관리(ISO 14971) 적용 여부\n• 클린룸/작업환경 관리, 멸균 프로세스 밸리데이션(해당 시)\n• 시판 후 조사(PMS), 부작용 보고 및 고객불만 처리 절차',
    author: 'GMSCS 인증원 사무국',
    priority: '필독',
    updatedAt: '2026-08-10'
  }
];

export function loadAuditReportNotices(): AuditReportNoticeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_NOTICES);
    if (!raw) return DEFAULT_AUDIT_REPORT_NOTICES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_AUDIT_REPORT_NOTICES;
  } catch (err) {
    console.error('Failed to load audit report notices:', err);
    return DEFAULT_AUDIT_REPORT_NOTICES;
  }
}

export function saveAuditReportNotices(notices: AuditReportNoticeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT_NOTICES, JSON.stringify(notices));
    // Trigger storage event for other components in same window
    window.dispatchEvent(new CustomEvent('gmscs-audit-notices-updated', { detail: notices }));
  } catch (err) {
    console.error('Failed to save audit report notices:', err);
  }
}
