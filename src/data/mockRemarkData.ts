import { ChecklistItem } from '../types';

export interface RemarkFormTemplate {
  id: string;
  name: string;
  formCode: string;
  category: '심사보고서' | '신청서/설문서' | '계약서/점검표';
  description: string;
}

export const remarkFormTemplates: RemarkFormTemplate[] = [
  {
    id: 'stage2',
    name: '적합성 평가 심사보고서 (2nd Stage Pack)',
    formCode: 'GMS-F25-001',
    category: '심사보고서',
    description: '시작/종결회의 안건, 이해관계 확인서, 현장 적합성 평가, Process Audit Note, 심사결론 및 추천',
  },
  {
    id: 'stage1',
    name: '적합성 평가 심사보고서 (1st Stage Pack)',
    formCode: 'GMS-F25-002',
    category: '심사보고서',
    description: '문서화된 정보 검토, 사업장 상태 평가, ISO 9001/14001/45001/ESG-MS 요건 점검',
  },
  {
    id: 'esg-checklist',
    name: 'ESG-MS 부속서E 종합 점검표',
    formCode: 'GMS-F23-ESG-E',
    category: '계약서/점검표',
    description: '환경(E), 사회(S), 지배구조(G) 정량/정성 지표 및 공급망 실사 점검표',
  },
  {
    id: 'application-pack',
    name: '인증 신청서 및 사전 설문서 Pack',
    formCode: 'GMS-F25-APP-01',
    category: '신청서/설문서',
    description: '조직현황, 신청 규격, 종업원수, 교대근무 현황, 프로세스 사전 설문서',
  },
  {
    id: 'contract-standard',
    name: '인증심사 표준계약서',
    formCode: 'F16-004(Rev.2024)',
    category: '계약서/점검표',
    description: '인증심사 계약 조항, 심사비 납부, 상호 권리의무, 인증 유지조건 명시',
  },
  {
    id: 'renewal-change',
    name: '갱신심사 설문서 & 인증변경 신청서',
    formCode: 'F19-002',
    category: '신청서/설문서',
    description: '3년 주기 갱신 시 변경사항 확인, 사업장 이전, 인증범위 확대/축소 신청',
  },
];

// 2단계 현장심사 체크리스트 (Remark docx 실제 데이터 반영)
export const remarkStage2Checklists: ChecklistItem[] = [
  {
    id: 's2-1',
    clause: '공통-1. 심사계획 및 신청 자료 대조',
    question: '인증신청자가 제출한 자료 및 심사계획서와 현장심사 시 확인된 사항 간에 차이점이 없는가?',
    result: '적합',
    evidence: '주사업장 화성공장 현장 확인 완료. 장비 및 인원 변동 없음.',
    requirementDetails: '[필수] 신청서 제출 사업장 주소, 공정 라인, 실 근무 인원 수 일치 확인',
    attachments: [
      {
        id: 'att-1',
        clauseId: 's2-1',
        fileName: '사업장_현장배치도_확인본.pdf',
        fileSize: '2.4 MB',
        isRequired: true,
        uploadedAt: '2026-09-09 10:15',
      }
    ]
  },
  {
    id: 's2-2',
    clause: '공통-4. 시스템 실행 및 유지상태',
    question: '구축된 경영시스템이 정해진 절차와 방법에 의거 적절히 시행/유지되고 있는가?',
    result: '적합',
    evidence: 'MES 연동 제조 공정 검사 성적서 15건 샘플링 대조 적합.',
    requirementDetails: '[필수] 프로세스 절차서 및 실행기록 10건 이상 샘플링',
    attachments: [
      {
        id: 'att-2',
        clauseId: 's2-2',
        fileName: '공정검사성적서_샘플링.xlsx',
        fileSize: '1.8 MB',
        isRequired: true,
        uploadedAt: '2026-09-09 11:30',
      }
    ]
  },
  {
    id: 's2-3',
    clause: '공통-8. 목표 모니터링 및 성과측정 (리스크/기회)',
    question: '주요 성과 목표 및 세부목표 대비 성과의 모니터링, 측정, 보고 및 검토가 수행되고 있는가?',
    result: '적합',
    evidence: '2026년 상반기 품질목표 달성률 분석표(달성률 94.2%) 및 리스크 조치 대장 확인.',
    requirementDetails: '[선택] 분기별 목표 분석 보고서 및 부서별 KPI 실적표 첨부 권장',
    attachments: [
      {
        id: 'att-3',
        clauseId: 's2-3',
        fileName: '2026_상반기_목표달성분석표.pdf',
        fileSize: '3.1 MB',
        isRequired: false,
        uploadedAt: '2026-09-09 13:20',
      }
    ]
  },
  {
    id: 's2-4',
    clause: '공통-11. 내부심사 및 경영검토 유효성',
    question: '계획된 주기에 따라 내부심사와 경영검토가 적합하게 실시되고 지속적 개선 조치가 취해졌는가?',
    result: '적합',
    evidence: '2026-05 내부심사 보고서 및 2026-06 대표이사 주재 경영검토 회의록 확인.',
    requirementDetails: '[필수] 경영검토 회의록 및 내부심사 부적합 시정조치 결과서 첨부 필수',
    attachments: [
      {
        id: 'att-4',
        clauseId: 's2-4',
        fileName: '2026년_경영검토회의록_최종.pdf',
        fileSize: '4.5 MB',
        isRequired: true,
        uploadedAt: '2026-09-09 14:00',
      }
    ]
  },
  {
    id: 's2-5',
    clause: 'ISO 14001 환경측면 및 법규 준수평가',
    question: '중대한 환경측면이 파악되었으며, 환경 인허가 및 관련 법규 준수평가가 주기적으로 실시되었는가?',
    result: '적합',
    evidence: '대기배출시설 설치신고증명서 및 2026년 상반기 환경법규 준수평가표 확인.',
    requirementDetails: '[필수] 배출시설 인허가증 및 환경측면 평가표 첨부',
    attachments: [
      {
        id: 'att-5',
        clauseId: 's2-5',
        fileName: '환경배출시설_신고증명서.jpg',
        fileSize: '1.2 MB',
        isRequired: true,
        uploadedAt: '2026-09-09 14:40',
      }
    ]
  },
  {
    id: 's2-6',
    clause: 'ISO 45001 위험성 평가 및 근로자 참여',
    question: '유해·위험요인이 파악되고 위험성평가에 근로자 대표가 참여하여 개선대책이 의사소통되고 있는가?',
    result: '경부적합',
    evidence: '가공 2라인 위험성 평가표에 현장 작업자 서명 누락 확인 (CAR-26-01 발행).',
    requirementDetails: '[필수] 산업안전보건위원회 회의록 또는 근로자대표 의견서 첨부',
    attachments: []
  },
  {
    id: 's2-7',
    clause: 'ESG-MS 성과 정량평가 지표',
    question: '환경/사회/지배구조 성과 관련 정량평가 지표가 수립되고 공급망 요구사항이 관리되는가?',
    result: '적합',
    evidence: '온실가스 스코프 1, 2 산정표 및 안전보건 무재해 기록 420일 달성 확인.',
    requirementDetails: '[선택] 지속가능경영보고서 또는 ESG 정량 진단 데이터 첨부',
    attachments: [
      {
        id: 'att-6',
        clauseId: 's2-7',
        fileName: '온실가스_배출량_산정표.xlsx',
        fileSize: '950 KB',
        isRequired: false,
        uploadedAt: '2026-09-09 15:10',
      }
    ]
  }
];

// 시작/종결회의 13대 필수 안건 (Remark docx 330~387라인 반영)
export const remarkMeetingAgendas = [
  { id: 1, opening: '인사말/심사협조에 대한 감사의 말씀', closing: '심사협조에 대한 감사의 말씀' },
  { id: 2, opening: '참석자 소개 (심사팀 및 조직 참석자 / 근로자대표 참석 확인)', closing: '심사의 목적, 규격, 범위 재확인' },
  { id: 3, opening: '심사팀장과 팀원의 책임과 역할 안내', closing: '샘플 심사의 한계 설명' },
  { id: 4, opening: '심사비 입금 확인 안내', closing: '심사원별 심사결과 요약 발표' },
  { id: 5, opening: '심사의 목적, 표준, 인증범위 확인', closing: '부적합 사항 처리기준 및 시정조치 기한 안내' },
  { id: 6, opening: '부적합 설명 / 샘플 심사의 한계 안내', closing: '기밀유지 및 비밀 준수 재확인' },
  { id: 7, opening: '심사 조기 종료 조건 안내', closing: '차기 사후관리 심사주기 안내' },
  { id: 8, opening: '이전 심사 부적합 및 발견사항 확인', closing: '이의 및 불만 제기 절차 안내 (esggms@naver.com)' },
  { id: 9, opening: '심사일정 세부 설명 및 안전보안구역 확인', closing: '심사 리포트 확인 및 자필 전자서명 날인' },
  { id: 10, opening: '기밀유지 및 공평성 비밀준수 확인서 낭독', closing: '피심사기업 대표자 말씀' },
  { id: 11, opening: '회사 지원사항 확인 (중식, 심사장소, 안내자)', closing: '질의 응답 / 감사 인사 및 폐회' },
  { id: 12, opening: '종결회의 예정 시간 안내', closing: '-' },
  { id: 13, opening: '질의 응답 (대표 또는 경영대리인)', closing: '-' },
];
