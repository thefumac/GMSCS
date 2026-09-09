// Remark 2025 Audit Report Pack(251001).docx 원본 828줄 기반 전체 세부 항목 데이터 모델
import { ProcessMatrixRow, ThreeYearCyclePlanItem, PreviousAuditNcCheck } from '../types';

export interface MultiSiteInfo {
  id: string;
  siteName: string; // 예: 추가사업장 (화성 제2공장)
  siteNameEn?: string;
  address: string;
  addressEn?: string;
  scope: string;
  scopeEn?: string;
  employeeCount: number;
}

export interface ManualProcessDoc {
  docType: '매뉴얼' | '프로세스/절차서' | '지침서';
  docName: string;
  docNumber: string;
  revDate: string;
  revNumber: string;
}

export interface MeetingAttendance {
  clientAttendees: { name: string; position: string; role: string; remarks?: string }[];
  auditTeamAttendees: { name: string; role: string; standards: string }[];
  openingDate: string;
  closingDate: string;
}

export interface ProcessAuditNoteItem {
  id: string;
  clauseNumber: string;
  clauseTitle: string;
  targetProcessDept: string; // 프로세스 및 부서명 (예: 생산팀 / 사출공정)
  auditorName: string;
  auditDate: string;
  detailedFindings: string;  // 구체적 심사 확인 사항 (실행기록, 실행일자, 담당자명 등)
  result: '적합' | '경부적합' | '중부적합' | '관찰사항';
  objectiveEvidence: string; // 객관적 증거 문서명, 설비번호 등
  attachedFileName?: string;
  isAttachmentRequired?: boolean;
}

export interface FullAuditReportPackData {
  reportId: string;
  projectId: string;
  companyName: string;
  companyNameEn?: string;
  certNumber: string;
  
  // I. 고객 현황 & 복수 사업장
  ceoName: string;
  ceoNameEn?: string;
  mainSiteAddress: string;
  mainSiteAddressEn?: string;
  additionalSites: MultiSiteInfo[];
  tel: string;
  fax: string;
  homepage: string;
  email: string;
  contactPerson: string;
  contactPosition: string;

  // II. 심사 표준 및 범위
  standards: string[];
  auditType: string;
  auditScope: string;
  auditScopeEn?: string;
  iafCode: string;
  exclusionClause: string;
  exclusionJustification: string;
  exclusionJustificationEn?: string;

  // III. 1단계 문서심사 전용 섹션
  stage1: {
    appVsSurveyDiff: { hasDiff: boolean; details: string };
    manualDocs: ManualProcessDoc[];
    legalRequirements: string;
    hasLegalViolationLast3Years: { hasViolation: boolean; details: string };
    envAudit: {
      hasPermit: boolean;
      permitDetails: string;
      hasEnvAspectEval: boolean;
      hasSignificantAspects: boolean;
      hasComplianceEval: boolean;
      hasEnvGuidelines: boolean;
      envManagerAppointed: boolean;
      envManagerName: string;
    };
    safetyAudit: {
      safetyManagerName: string;
      healthManagerAgency: string;
      workerRepresentativeName: string;
      hasRiskAssessment: boolean;
      allHazardsIdentified: boolean;
      riskAssessmentAdequate: boolean;
      assessorCompetent: boolean;
      workersParticipated: boolean;
      controlMeasuresAdequate: boolean;
      recordsCommunicated: boolean;
      relevantLawsIdentified: boolean;
      safetyTeamAdequate: boolean;
      significantRiskCount: number;
    };
    esgAudit: {
      hasSustainabilityReport: boolean;
      hasQuantitativeEval: boolean;
      hasSupplyChainRequest: boolean;
      supplyChainDetails: string;
    };
    imsIntegration: {
      docsIntegrated: boolean;
      policyGoalsIntegrated: boolean;
      mgmtReviewIntegrated: boolean;
      internalAuditIntegrated: boolean;
      processApproachIntegrated: boolean;
      continuousImprovementIntegrated: boolean;
      responsibilitiesIntegrated: boolean;
    };
    stage1Conclusion: '2단계 심사 진행 가능' | '시정조치 완료 후 2단계 진행' | '중부적합으로 2단계 진행 불가';
  };

  // IV. 2단계 현장심사 전용 섹션
  stage2: {
    meetingAttendance: MeetingAttendance;
    independenceConfirmed: boolean;
    scheduleNotes: string;
    commonAuditItems: {
      scopeAppropriate: boolean;
      systemCompliant: boolean;
      targetMonitoringAdequate: boolean;
      continuousImprovementEffective: boolean;
      markUsageAdequate: boolean; // 사후/갱신 시 마크 사용
      threeYearsRecordsReviewed: boolean; // 갱신 시 3년 기록
    };
    processNotes: ProcessAuditNoteItem[];
    nonConformitiesSummary: {
      majorCount: number;
      minorCount: number;
      obsCount: number;
      summaryText: string;
    };
    finalRecommendation: '인증 등록 추천' | '인증 유지 추천' | '인증 갱신 추천' | '시정조치 확인 후 추천' | '재심사 필요';
  };

  // V. Remark 공식 실물 서식 필수 3대 매트릭스
  processMatrix: ProcessMatrixRow[]; // 부서/프로세스별 조항 심사 결과 매트릭스
  threeYearPlan: ThreeYearCyclePlanItem[]; // 3개년 심사 주기 매트릭스
  previousAuditChecks: PreviousAuditNcCheck[]; // 전 회차(이전 심사) 부적합 및 시정조치 유효성 확인
}

export const initialFullReportData: FullAuditReportPackData = {
  reportId: 'rep-1',
  projectId: 'proj-1',
  companyName: '(주)한성정밀공업',
  companyNameEn: 'Hansung Precision Industry Co., Ltd.',
  certNumber: 'GMS-Q-2022-0491',
  ceoName: '박한성',
  ceoNameEn: 'Han-Sung Park',
  mainSiteAddress: '경기도 화성시 향남읍 발안공단로 45 (주사업장 및 제1공장)',
  mainSiteAddressEn: '45, Baran-gongdan-ro, Hyangnam-eup, Hwaseong-si, Gyeonggi-do, Republic of Korea (Head Office & Plant 1)',
  additionalSites: [
    {
      id: 'site-2',
      siteName: '제2사업장 (정밀 사출가공센터)',
      siteNameEn: '2nd Site (Precision Injection Center)',
      address: '경기도 화성시 양감면 정문송산로 118',
      addressEn: '118, Jeongmunsongsan-ro, Yanggam-myeon, Hwaseong-si, Gyeonggi-do, Republic of Korea',
      scope: '정밀 플라스틱 사출 및 후가공',
      scopeEn: 'Precision plastic injection molding and secondary processing',
      employeeCount: 18,
    }
  ],
  tel: '031-353-8821',
  fax: '031-353-8825',
  homepage: 'http://www.hansung-precision.co.kr',
  email: 'quality@hansung-precision.co.kr',
  contactPerson: '강태석',
  contactPosition: '품질혁신팀장 / 과장',
  standards: ['ISO 9001:2015', 'ISO 14001:2015'],
  auditType: '사후관리 2차',
  auditScope: '자동차용 정밀 금형 및 부품의 설계, 개발 및 제조',
  auditScopeEn: 'Design, Development and Manufacture of Precision Molds and Components for Automobiles',
  iafCode: '17 (기계/금속가공)',
  exclusionClause: '8.3 제품 및 서비스의 설계와 개발 (단, 고객 도면에 의한 주문생산)',
  exclusionJustification: '고객사가 제공하는 사양서 및 CAD 도면에 따라 가공하며, 자체 설계 행위가 없으므로 정당한 제외로 인정함.',
  exclusionJustificationEn: 'Machining is performed strictly in accordance with customer-provided specifications and CAD drawings, and justified exclusion is accepted as there is no design and development activity performed.',

  stage1: {
    appVsSurveyDiff: { hasDiff: false, details: '신청서 기재 인원 48명 및 공정 라인 변동 없음' },
    manualDocs: [
      { docType: '매뉴얼', docName: '품질/환경 통합경영매뉴얼', docNumber: 'HS-QM-01', revDate: '2026-01-10', revNumber: 'Rev. 4' },
      { docType: '프로세스/절차서', docName: '리스크 및 기회 관리 절차서', docNumber: 'HS-QP-02', revDate: '2025-11-20', revNumber: 'Rev. 2' },
      { docType: '프로세스/절차서', docName: '환경측면 평가 및 준수의무 관리규정', docNumber: 'HS-EP-01', revDate: '2026-02-15', revNumber: 'Rev. 3' },
      { docType: '프로세스/절차서', docName: '내부심사 및 경영검토 절차서', docNumber: 'HS-QP-09', revDate: '2025-08-01', revNumber: 'Rev. 2' }
    ],
    legalRequirements: '대기환경보전법, 물환경보전법, 산업안전보건법, 폐기물관리법 파악 완료',
    hasLegalViolationLast3Years: { hasViolation: false, details: '관할 지자체 과태료 및 행정처분 이력 없음 확인' },
    envAudit: {
      hasPermit: true,
      permitDetails: '대기배출시설 설치신고증명서 (화성시 제 2021-대기-104호)',
      hasEnvAspectEval: true,
      hasSignificantAspects: true,
      hasComplianceEval: true,
      hasEnvGuidelines: true,
      envManagerAppointed: true,
      envManagerName: '이성훈 환경안전대리',
    },
    safetyAudit: {
      safetyManagerName: '박한성 대표이사 (총괄책임자)',
      healthManagerAgency: '대한산업보건협회 위탁대행',
      workerRepresentativeName: '최진우 노사협의회 근로자대표',
      hasRiskAssessment: true,
      allHazardsIdentified: true,
      riskAssessmentAdequate: true,
      assessorCompetent: true,
      workersParticipated: true,
      controlMeasuresAdequate: true,
      recordsCommunicated: true,
      relevantLawsIdentified: true,
      safetyTeamAdequate: true,
      significantRiskCount: 3,
    },
    esgAudit: {
      hasSustainabilityReport: true,
      hasQuantitativeEval: true,
      hasSupplyChainRequest: true,
      supplyChainDetails: '현대/기아 협력사 ESG 공급망 진단 지표 제출 완료',
    },
    imsIntegration: {
      docsIntegrated: true,
      policyGoalsIntegrated: true,
      mgmtReviewIntegrated: true,
      internalAuditIntegrated: true,
      processApproachIntegrated: true,
      continuousImprovementIntegrated: true,
      responsibilitiesIntegrated: true,
    },
    stage1Conclusion: '2단계 심사 진행 가능',
  },

  stage2: {
    meetingAttendance: {
      clientAttendees: [
        { name: '박한성', position: '대표이사', role: '최고경영자' },
        { name: '강태석', position: '품질혁신팀장', role: '품질관리책임자' },
        { name: '이성훈', position: '생산팀 대리', role: '환경안전관리자' },
        { name: '최진우', position: '생산과장', role: '근로자 대표' }
      ],
      auditTeamAttendees: [
        { name: '남경호', role: '심사팀장', standards: 'ISO 9001, 14001' },
        { name: '정현일', role: '심사팀원', standards: 'ISO 9001' },
        { name: '정대현', role: '심사원보', standards: 'ISO 9001 (참관)' },
        { name: '박민우', role: '검증심사원', standards: '기술검토' }
      ],
      openingDate: '2026-09-08 09:30',
      closingDate: '2026-09-10 16:30',
    },
    independenceConfirmed: true,
    scheduleNotes: '1일차: 경영진 면담, 품질/환경 매뉴얼 및 조직상황, 기획 검토\n2일차: 프레스 가공라인, 열처리 및 표면처리 현장실사\n3일차: 출하검사, 계측기 교정, 내부심사/경영검토, 종결회의',
    commonAuditItems: {
      scopeAppropriate: true,
      systemCompliant: true,
      targetMonitoringAdequate: true,
      continuousImprovementEffective: true,
      markUsageAdequate: true,
      threeYearsRecordsReviewed: true,
    },
    processNotes: [
      {
        id: 'pnote-4',
        clauseNumber: '4. 조직 상황',
        clauseTitle: '4.1 조직과 그 상황의 이해 / 4.2 이해관계자 요구',
        targetProcessDept: '경영기획팀 / 대표이사실',
        auditorName: '남경호 대표이사',
        auditDate: '2026-09-08',
        detailedFindings: '2026년 경영계획서 상에 전기차 부품 전환에 따른 외부 리스크 파악 및 대응 전략 수립 확인. 이해관계자(완성차 고객사, 협력업체, 지역사회)의 요구사항 등록부(REV.3) 주기적 갱신 확인됨.',
        result: '적합',
        objectiveEvidence: '2026 사업계획서(HS-BP-2026) 및 이해관계자 관리대장',
        attachedFileName: '이해관계자_요구사항_등록부.pdf',
        isAttachmentRequired: true,
      },
      {
        id: 'pnote-5',
        clauseNumber: '5. 리더십',
        clauseTitle: '5.1 리더십과 의지표명 / 5.2 방침 / 5.3 역할과 책임',
        targetProcessDept: '경영총괄 / 전사',
        auditorName: '남경호 대표이사',
        auditDate: '2026-09-08',
        detailedFindings: '최고경영자가 품질 및 환경 방침을 제정하여 사내 로비 및 MES 로그인 화면에 게시하고 전 임직원이 숙지하고 있음을 면담을 통해 확인. 업무분장표(HS-HR-04) 상 품질/환경 책임 명확히 부여됨.',
        result: '적합',
        objectiveEvidence: '품질/환경 경영방침서 및 2026 업무분장 규정',
        attachedFileName: '품질환경방침서_게시사진.jpg',
        isAttachmentRequired: false,
      },
      {
        id: 'pnote-6',
        clauseNumber: '6. 기획',
        clauseTitle: '6.1 리스크 및 기회 조치 / 6.2 품질·환경 목표 수립',
        targetProcessDept: '품질혁신팀 / 생산기술팀',
        auditorName: '정현일 선임심사원',
        auditDate: '2026-09-08',
        detailedFindings: '신규 프레스 라인 도입에 따른 설비 고장 리스크 평가표 수립 및 예방보전 계획 수립 확인. 2026년 전사 불량률 목표(1.2% 이하) 및 폐기물 감축 목표(전년 대비 5% 절감) 수립 및 부서별 전개 확인.',
        result: '적합',
        objectiveEvidence: '리스크 평가표(HS-RA-26) 및 부서별 목표 관리 카드',
        attachedFileName: '2026_품질환경_목표관리대장.xlsx',
        isAttachmentRequired: true,
      },
      {
        id: 'pnote-7',
        clauseNumber: '7. 지원',
        clauseTitle: '7.1.5 모니터링 및 측정 자원 (계측기 교정) / 7.2 적격성',
        targetProcessDept: '품질보증팀 / 계측기 관리실',
        auditorName: '정현일 선임심사원',
        auditDate: '2026-09-09',
        detailedFindings: '사내 보유 계측기 84종 중 정밀 버니어캘리퍼스 및 마이크로미터 교정필증 확인 중, 가공 2라인 디지털 버니어캘리퍼스(No. HS-QC-14)의 교정 유효일자(2026-08-30)가 경과되었음에도 현장 사용 중 발견됨.',
        result: '경부적합',
        objectiveEvidence: '디지털 버니어캘리퍼스 HS-QC-14 실측 확인 (시정조치 요구서 CAR-26-01 발행)',
        attachedFileName: 'CAR-26-01_시정조치요구서.pdf',
        isAttachmentRequired: true,
      },
      {
        id: 'pnote-8',
        clauseNumber: '8. 운용',
        clauseTitle: '8.5 생산 및 서비스 제공 / 8.6 적합성 불출',
        targetProcessDept: '생산 1라인, 2라인 / 자재창고',
        auditorName: '남경호 대표이사',
        auditDate: '2026-09-09',
        detailedFindings: '작업표준서(SOP)가 작업자 눈높이에 게시되어 있으며 자주검사 체크시트 작성 양호. 초/중/종물 검사 기록 및 Lot 추적 번호 바코드 관리 상태 우수. 화학물질(절삭유) 보관소 방유턱 및 MSDS 비치 상태 확인.',
        result: '적합',
        objectiveEvidence: '작업표준서(HS-SOP-P03) 및 초중종물 검사일지 12부',
        attachedFileName: '생산현장_작업표준_게시현황.jpg',
        isAttachmentRequired: false,
      },
      {
        id: 'pnote-9',
        clauseNumber: '9. 성과평가',
        clauseTitle: '9.2 내부심사 / 9.3 경영검토',
        targetProcessDept: '품질기획실 / 최고경영진',
        auditorName: '남경호 대표이사',
        auditDate: '2026-09-10',
        detailedFindings: '2026년 상반기 전 부서 대상 내부심사 실시(2026-05-15~16) 및 적격 심사원 자격 부여 확인. 최고경영자 주재 경영검토 회의(2026-06-20)에서 상반기 성과 및 하반기 자원 배정 의결 확인.',
        result: '적합',
        objectiveEvidence: '내부심사 결과보고서 및 경영검토 회의록(REV.0)',
        attachedFileName: '2026_상반기_경영검토회의록.pdf',
        isAttachmentRequired: true,
      },
      {
        id: 'pnote-10',
        clauseNumber: '10. 개선',
        clauseTitle: '10.2 부적합 및 시정조치 / 10.3 지속적 개선',
        targetProcessDept: '품질보증팀 / 전 부서',
        auditorName: '이혜원 정심사원',
        auditDate: '2026-09-10',
        detailedFindings: '전년도 사후심사 지적사항(MSDS 라벨 식별 건)에 대한 시정조치 유효성 확인 완료. 사내 제안제도를 통한 공정 개선 24건 접수 및 포상 실시 확인됨.',
        result: '적합',
        objectiveEvidence: '시정조치 결과보고서(CAR-25-02) 및 사내 제안 포상대장',
        attachedFileName: '시정조치_유효성확인서.pdf',
        isAttachmentRequired: false,
      }
    ],
    nonConformitiesSummary: {
      majorCount: 0,
      minorCount: 1,
      obsCount: 2,
      summaryText: '중부적합 0건, 경부적합 1건(계측기 교정주기 초과 1건), 관찰사항 2건(절삭유 보관소 환기시설 추가 개선 권고, 협력업체 정기평가 주기 표준화 권고)',
    },
    finalRecommendation: '인증 유지 추천',
  },

  // V. Remark 공식 실물 서식 필수 3대 매트릭스
  processMatrix: [
    {
      id: 'pm-1',
      processName: '경영기획 및 리더십',
      deptName: '최고경영진 / 경영지원실',
      clause4: true,
      clause5: true,
      clause6: true,
      clause7: true,
      clause8: false,
      clause9: true,
      clause10: true,
      markUsage: false,
      ncCount: '√ (적합)'
    },
    {
      id: 'pm-2',
      processName: '품질보증 및 개선관리',
      deptName: '품질혁신팀',
      clause4: true,
      clause5: false,
      clause6: true,
      clause7: true,
      clause8: true,
      clause9: true,
      clause10: true,
      markUsage: true,
      ncCount: '√ / 경1 (부적합 1건)'
    },
    {
      id: 'pm-3',
      processName: '생산운영 및 공정관리',
      deptName: '생산1팀, 생산2팀 (화성공장)',
      clause4: false,
      clause5: false,
      clause6: false,
      clause7: true,
      clause8: true,
      clause9: true,
      clause10: false,
      markUsage: false,
      ncCount: '√ (적합)'
    },
    {
      id: 'pm-4',
      processName: '구매 및 공급자 관리',
      deptName: '자재구매팀',
      clause4: false,
      clause5: false,
      clause6: false,
      clause7: true,
      clause8: true,
      clause9: true,
      clause10: false,
      markUsage: false,
      ncCount: '√ (적합)'
    },
    {
      id: 'pm-5',
      processName: '제품설계 및 공정개발',
      deptName: '기술연구소',
      clause4: true,
      clause5: false,
      clause6: true,
      clause7: true,
      clause8: true,
      clause9: false,
      clause10: true,
      markUsage: false,
      ncCount: '√ (적합)'
    },
    {
      id: 'pm-6',
      processName: '영업 및 고객관리',
      deptName: '국내/해외 영업마케팅팀',
      clause4: true,
      clause5: false,
      clause6: false,
      clause7: false,
      clause8: true,
      clause9: true,
      clause10: true,
      markUsage: true,
      ncCount: '√ (적합)'
    }
  ],

  threeYearPlan: [
    { id: 'typ-4', clauseNumber: '4', clauseTitle: '조직 상황 (내외부 이슈, 이해관계자, 적용범위)', cycleInitial: '○ (√)', cycleSurv1: '○ (√)', cycleSurv2: '○', cycleSurv3: '○', cycleSurv4: '', cycleSurv5: '' },
    { id: 'typ-5', clauseNumber: '5', clauseTitle: '리더십 (방침, 조직 역할, 책임 및 권한)', cycleInitial: '○ (√)', cycleSurv1: '○ (√)', cycleSurv2: '○', cycleSurv3: '○', cycleSurv4: '', cycleSurv5: '' },
    { id: 'typ-6', clauseNumber: '6', clauseTitle: '기획 (리스크와 기회 관리, 품질/환경 목표)', cycleInitial: '○ (√)', cycleSurv1: '○ (√)', cycleSurv2: '○', cycleSurv3: '○', cycleSurv4: '', cycleSurv5: '' },
    { id: 'typ-7', clauseNumber: '7', clauseTitle: '지원 (자원, 역량, 인식, 문서화된 정보)', cycleInitial: '○ (√)', cycleSurv1: '○ (√)', cycleSurv2: '○', cycleSurv3: '○', cycleSurv4: '', cycleSurv5: '' },
    { id: 'typ-8', clauseNumber: '8', clauseTitle: '운용 (운용 기획 및 관리, 제품/서비스 요구사항)', cycleInitial: '○ (√)', cycleSurv1: '○ (√)', cycleSurv2: '○', cycleSurv3: '○', cycleSurv4: '', cycleSurv5: '' },
    { id: 'typ-9', clauseNumber: '9', clauseTitle: '성과 평가 (모니터링, 내부심사, 경영검토)', cycleInitial: '○ (√)', cycleSurv1: '○ (√)', cycleSurv2: '○', cycleSurv3: '○', cycleSurv4: '', cycleSurv5: '' },
    { id: 'typ-10', clauseNumber: '10', clauseTitle: '개선 (부적합 및 시정조치, 지속적 개선)', cycleInitial: '○ (√)', cycleSurv1: '○ (√)', cycleSurv2: '○', cycleSurv3: '○', cycleSurv4: '', cycleSurv5: '' },
    { id: 'typ-mark', clauseNumber: '기타', clauseTitle: '인증마크 및 인정마크(KAB) 사용 적절성', cycleInitial: '○ (√)', cycleSurv1: '○ (√)', cycleSurv2: '○', cycleSurv3: '○', cycleSurv4: '', cycleSurv5: '' }
  ],

  previousAuditChecks: [
    {
      id: 'pnc-1',
      ncNumber: 'NCR-2025-01',
      standardCode: 'ISO 9001:2015 7.1.5.2',
      deptName: '품질혁신팀',
      ncGrade: '경부적합',
      ncContent: '정밀 가공 공정의 디지털 버니어캘리퍼스(HS-QC-C08, C09) 2기의 공인기관 정기 교정 유효기간이 2025년 08월 15일로 만료되었으나, 유효기간 경과 후에도 식별 라벨 갱신 없이 계속 사용됨.',
      correctiveAction: '1. 해당 계측기 2기 즉시 사용중지 및 KOLAS 공인교정기관 긴급 재교정 완료(성적서 수령).\n2. 사내 전 계측기 42기 전수 점검 및 만료 D-30일 사전 알림 자동 대장 도입.\n3. 계측기 관리담당자 재교육 실시 완료.',
      actionDate: '2025-09-20',
      verificationMethod: '현장확인',
      adequacyResult: '적합(적절함)',
      effectivenessResult: '효과적',
      auditorName: '남경호 대표이사 / 수석심사원',
      verifiedAt: '2026-09-09'
    },
    {
      id: 'pnc-2',
      ncNumber: 'OBS-2025-02',
      standardCode: 'ISO 14001:2015 8.1',
      deptName: '생산2팀 (절삭유 보관소)',
      ncGrade: '관찰사항',
      ncContent: '제2공장 절삭유 보관소의 2차 방유턱 용량이 기준치에는 충족하나, 우천 시 빗물 유입 가능성이 관찰되어 배수로 차단막 보강 권고.',
      correctiveAction: '보관소 상부 처마 차양막 추가 설치(1.5m 연장) 및 빗물 차단용 경사턱 보강 공사 완료.',
      actionDate: '2025-10-10',
      verificationMethod: '문서확인',
      adequacyResult: '적합(적절함)',
      effectivenessResult: '효과적',
      auditorName: '이혜원 정심사원',
      verifiedAt: '2026-09-09'
    }
  ]
};
