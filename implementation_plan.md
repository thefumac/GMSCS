# 심사원 관리 및 개인포털 자격·이력·경력증명서 고도화 구현 계획

심사원 목록 클릭 시 열리는 **심사원 상세 팝업(AuditorProfileModal)**의 5대 탭 구성, **실제 심사 DB(`projects`, `contracts`) 기반 규격/코드별 누적 MD 및 승급·충족 요건 자동 산출**, **개인포털의 프로필(사진, 주거지역, 생년월일, 성별 등) 수정 및 경력증명서 신청·승인·출력 워크플로우**를 완성합니다.

## 1. 주요 변경 사항 및 설계

### A. 데이터 타입 확장 (`src/types/index.ts`)
- `Auditor` 인터페이스 확장:
  - `residentialRegion?: string;` // 주거지역 (예: "서울 강서구", "대구 달서구")
  - `birthDate?: string;` // 생년월일 (YYYY-MM-DD)
  - `gender?: '남' | '여';` // 성별
  - `certificates?: { id: string; name: string; standard: string; certNumber: string; issueDate: string; issuer: string; fileUrl?: string; fileName?: string }[];` // 자격증 사본/등록정보
  - `trainingHistory?: { id: string; title: string; year: string; hours: number; completedDate: string; institution: string; status: '이수완료' | '미이수'; fileUrl?: string }[];` // 보수교육 이력
  - `seminarHistory?: { id: string; title: string; date: string; host: string; hours: number; note?: string }[];` // 직무세미나 참석이력
  - `careerCertRequests?: CareerCertRequestItem[];` // 경력증명서 발급 신청 내역
- `CareerCertRequestItem` 인터페이스 정의 (신청ID, 신청일, 용도, 제출처, 상태: '신청대기' | '승인완료' | '반려', 승인일자, 사무국 승인자명, 발급번호 등)

### B. 심사원 상세 모달 고도화 (`src/components/AuditorProfileModal.tsx`)
1. **탭 1: 기본정보 (기본 프로필)**
   - 개인 프로필 사진 등록/삭제/미리보기
   - 성명, 등록번호(GMS Number), 소속(상근/비상근), 대표자격등급, 연락처, 이메일
   - **주거지역(시/구 단위)**, **생년월일**, **성별(남/여)**
   - 정산 방식(세금계산서/원천징수) 및 입금계좌 정보
2. **탭 2: 심사이력 (Audit History)**
   - 심사 DB(`projects`, `contracts`, `companies`)에서 해당 심사원이 **팀장(선임심사원)** 또는 **심사팀원(팀원/심사원보)**으로 수행한 실제 심사 이력 자동 연동/조회
   - 심사일자, 기업명, 인증규격, 심사구분(최초/사후/갱신), 역할(선임심사원/팀원/심사원보), 투입MD, 진행상태
   - **심사기록 열람 버튼**: 심사보고서, 인증서, 계획서 등 PDF 서식 즉시 조회
3. **탭 3: 자격 & 코드 관리 (Qualifications & IAF Code Matrix)**
   - **규격별 심사이력 및 누적 MD 자동 산출**: (예: ISO 9001: 24.5 MD, ISO 14001: 18.0 MD, ISO 45001: 8.0 MD 등)
   - **IAF 전문코드별 누적 MD 자동 산출**: (예: Code 17: 14.5 MD, Code 28: 10.0 MD 등)
   - **선임심사원 및 코드 충족 요건과 누적 경력 상태 판정 (자동 산출)**:
     - 충족된 경우: `[충족] 누적 OO.O MD 달성 (기준 충족)`
     - 미충족인 경우: `[미충족] 현재 OO.O MD / 기준 15.0 MD (충족까지 O.O MD 및 입회심사/보수교육 필요)`
     - 사무국 관리 권한 안내 및 자격 갱신 요건 달성도
4. **탭 4: 자격증·교육·세미나 이력 (Certificates, Training & Seminars)**
   - KAB 공인 심사원 자격증 사진/사본 및 등록 번호, 유효기간
   - 연간 필수 보수교육(CPD, 16시간) 이수 이력 및 증빙 서류
   - 인증원 정기 직무세미나/워크샵 참석 이력 (일자, 주제, 참석확인)
5. **탭 5: 심사 경력 증명서 발급/승인 (Career Certificate Approval & Print)**
   - 심사원이 개인포털에서 신청한 발급 요청 목록 조회
   - 사무국 [승인] / [반려] 처리 기능
   - 공식 심사 경력 증명서(국문/영문 표준 서식) 미리보기 및 PDF 고해상도 인쇄 팝업

### C. 심사원 관리 목록 연동 (`src/components/AuditorManagement.tsx` & `src/App.tsx`)
- 행 클릭 시 `setDetailAuditor(aud)`로 팝업 호출
- `projects`, `contracts`, `companies`, `onSaveAuditor`, `onOpenPdfReport` 프로퍼티 전달 및 모달 렌더링

### D. 개인포털 (AuditorPortal.tsx) 연동
- 개인정보 관리 영역에 주거지역, 생년월일, 성별, 사진, 정산계좌 편집 지원
- 심사자격관리 탭에 **"심사 경력 증명서 발급 신청"** 섹션 배치:
  - 신청 버튼 클릭 시 용도(제출용/자격갱신용/이직용 등) 입력 후 신청
  - **안내 배너 표시**: *"심사 경력 증명서 발급 신청이 접수되었습니다. 빠른 승인을 원하시면 사무국으로 유선 연락 바랍니다. (사무국 승인 후 즉시 출력이 가능합니다)"*
  - 사무국 승인 전: `[사무국 승인 대기중]` 뱃지 및 전화 안내
  - 사무국 승인 후: `[승인완료 - 출력 가능]` 뱃지 활성화 및 즉시 공식 PDF 증명서 인쇄 모달 제공

## 2. 검증 계획
1. `npm run build` 실행으로 타입 에러 및 빌드 무결성 확인
2. 심사원 관리(사무국) 화면에서 임의의 심사원 행 클릭 시 5개 탭의 팝업이 정확히 열리는지 확인
3. 개인포털에서 개인정보 수정 및 경력증명서 신청 테스트
4. 사무국에서 승인 후 개인포털에서 증명서 인쇄 가능 상태 전환 확인
