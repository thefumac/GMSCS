/**
 * GMSCS 공인 인증관리 규격 단일 진실 소스 (Single Source of Truth)
 * 인증관리 및 앱 내 모든 테이블/조회 필터에서 공통으로 참조합니다.
 */

export interface AvailableStandard {
  code: string;
  name: string;
  iafScope: string;
  validity: string;
  status: string;
  versionYear: number;
  transitionStatus: string;
  feeBasePerMd: number;
}

export const GMS_AVAILABLE_STANDARDS: AvailableStandard[] = [
  {
    code: 'ISO 9001:2015',
    name: '품질경영시스템 (QMS)',
    iafScope: '전 업종 (01~39 IAF 코드 인가)',
    validity: '2028-12-31',
    status: '공인인정',
    versionYear: 2015,
    transitionStatus: '현행 최신',
    feeBasePerMd: 700000
  },
  {
    code: 'ISO 14001:2015',
    name: '환경경영시스템 (EMS)',
    iafScope: '제조, 화학, 건설, 서비스 전반',
    validity: '2028-12-31',
    status: '공인인정',
    versionYear: 2015,
    transitionStatus: '현행 최신',
    feeBasePerMd: 700000
  },
  {
    code: 'ISO 45001:2018',
    name: '안전보건경영시스템 (OHSMS)',
    iafScope: '중대재해처벌법 대응 전 업종',
    validity: '2027-10-31',
    status: '공인인정',
    versionYear: 2018,
    transitionStatus: '현행 최신',
    feeBasePerMd: 750000
  },
  {
    code: 'ISO 27001:2022',
    name: '정보보안경영시스템 (ISMS)',
    iafScope: 'IT, 소프트웨어, 금융, 데이터센터',
    validity: '2027-05-31',
    status: '공인인정',
    versionYear: 2022,
    transitionStatus: '2022 신규전환 완료',
    feeBasePerMd: 850000
  },
  {
    code: 'ISO 37001:2016',
    name: '부패방지경영시스템 (ABMS)',
    iafScope: '공공기관, 제약, 건설, 대기업',
    validity: '2026-12-31',
    status: '공인인정',
    versionYear: 2016,
    transitionStatus: '현행 최신',
    feeBasePerMd: 800000
  },
  {
    code: 'ISO 22000:2018',
    name: '식품안전경영시스템 (FSMS)',
    iafScope: '식음료 제조 및 유통 체인',
    validity: '2027-08-31',
    status: '공인인정',
    versionYear: 2018,
    transitionStatus: '현행 최신',
    feeBasePerMd: 750000
  },
  {
    code: 'ISO 50001:2018',
    name: '에너지경영시스템 (EnMS)',
    iafScope: '철강, 에너지, 운송, 화학 플랜트',
    validity: '2027-03-31',
    status: '공인인정',
    versionYear: 2018,
    transitionStatus: '현행 최신',
    feeBasePerMd: 800000
  },
  {
    code: 'ISO 13485:2016',
    name: '의료기기 품질경영시스템 (MD-QMS)',
    iafScope: '의료기기 제조 및 공급망',
    validity: '2026-11-30',
    status: '공인인정',
    versionYear: 2016,
    transitionStatus: '규제 부합 검토중',
    feeBasePerMd: 900000
  }
];
