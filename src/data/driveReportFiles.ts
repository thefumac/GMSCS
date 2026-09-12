// 구글 드라이브 보관 표준화 PDF 문서 색인 (790개 실물 파일 매핑)
export interface DriveReportFileItem {
  fileName: string;
  originalName: string;
  docType: '심사보고서' | '인증서' | '신청/전환자료';
  fileSize: string;
  sizeBytes: number;
  auditor: string;
  pdfUrl: string;
}

export const DRIVE_REPORT_FILES: Record<string, DriveReportFileItem[]> = {
  "(주)세진엔지니어링": [
    {
      "fileName": "[GMSCS-REP]_2026-03_기타_심사_담당미상_1-2단계최초_2026.03_iso45001_인증서_전자본(세진엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.03_iso45001_인증서_전자본(세진엔지니어링).pdf - 552 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "552 KB",
      "sizeBytes": 564895,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-03_기타_심사_담당미상_1-2단계최초_2026.03_2603_qeoh_re_심사보고서(세진엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.03_2603_qeoh_re_심사보고서(세진엔지니어링).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.7 MB",
      "sizeBytes": 1759437,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-03_기타_심사_담당미상_1-2단계최초_2026.03_2603_qeoh_tr_전환자료(세진엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.03_2603_qeoh_tr_전환자료(세진엔지니어링).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "11.0 MB",
      "sizeBytes": 11518830,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-03_기타_심사_담당미상_1-2단계최초_2026.03_iso9001_인증서_전자본(세진엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.03_iso9001_인증서_전자본(세진엔지니어링).pdf - 550 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "550 KB",
      "sizeBytes": 563091,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-03_기타_심사_담당미상_1-2단계최초_2026.03_iso14001_인증서_전자본(세진엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.03_iso14001_인증서_전자본(세진엔지니어링).pdf - 548 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "548 KB",
      "sizeBytes": 561024,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-03_--__심사_담당미상_--__1-2단계최초_2026.03_iso45001_인증서_전자본(세진엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.03_iso45001_인증서_전자본(세진엔지니어링).pdf - 552 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "552 KB",
      "sizeBytes": 564895,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-03_--__심사_담당미상_--__1-2단계최초_2026.03_2603_qeoh_re_심사보고서(세진엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.03_2603_qeoh_re_심사보고서(세진엔지니어링).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.7 MB",
      "sizeBytes": 1759437,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-03_--__심사_담당미상_--__1-2단계최초_2026.03_2603_qeoh_tr_전환자료(세진엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.03_2603_qeoh_tr_전환자료(세진엔지니어링).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "11.0 MB",
      "sizeBytes": 11518830,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-03_--__심사_담당미상_--__1-2단계최초_2026.03_iso9001_인증서_전자본(세진엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.03_iso9001_인증서_전자본(세진엔지니어링).pdf - 550 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "550 KB",
      "sizeBytes": 563091,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-03_--__심사_담당미상_--__1-2단계최초_2026.03_iso14001_인증서_전자본(세진엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.03_iso14001_인증서_전자본(세진엔지니어링).pdf - 548 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "548 KB",
      "sizeBytes": 561024,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)미래디스플레이": [
    {
      "fileName": "[GMSCS-REP]_2026-02_기타_심사_담당미상_2차사후_2026.02_2602_qms_tr_전환자료(미래디스플레이).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2026.02_2602_qms_tr_전환자료(미래디스플레이).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.9 MB",
      "sizeBytes": 4040524,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_기타_심사_담당미상_2차사후_2026.02_2603_qms_su2_심사보고서(미래디스플레이).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2026.02_2603_qms_su2_심사보고서(미래디스플레이).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1295486,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_--__심사_담당미상_--__2차사후_2026.02_2602_qms_tr_전환자료(미래디스플레이).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2026.02_2602_qms_tr_전환자료(미래디스플레이).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.9 MB",
      "sizeBytes": 4040524,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_--__심사_담당미상_--__2차사후_2026.02_2603_qms_su2_심사보고서(미래디스플레이).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2026.02_2603_qms_su2_심사보고서(미래디스플레이).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1295486,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "": [
    {
      "fileName": "[GMSCS-REP]_2026-02_기타_심사_담당미상_2차사후_2026.02_iso9001_인증서_전자본((주)미래디스플레이).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2026.02_iso9001_인증서_전자본((주)미래디스플레이).pdf - 842 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "842 KB",
      "sizeBytes": 862636,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_갱신심사_담당미상_갱신심사_2025.11_iso9001_인증서_전자본((주)아하)_2026년01월26일기준.pdf",
      "originalName": "[GMSCS-REP]__갱신심사_2025.11_iso9001_인증서_전자본((주)아하)_2026년01월26일기준.pdf - 573 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "573 KB",
      "sizeBytes": 586425,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_갱신심사_담당미상_갱신심사_2025.11_iso14001_인증서_전자본((주)아하)_2026년01월26일기준_오기수정.pdf",
      "originalName": "[GMSCS-REP]__갱신심사_2025.11_iso14001_인증서_전자본((주)아하)_2026년01월26일기준_오기수정.pdf - 912 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "912 KB",
      "sizeBytes": 934136,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_갱신심사_담당미상_갱신심사_2025.07_iso45001_인증서_전자본((주)아하)_2026년01월26일기준.pdf",
      "originalName": "[GMSCS-REP]__갱신심사_2025.07_iso45001_인증서_전자본((주)아하)_2026년01월26일기준.pdf - 574 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "574 KB",
      "sizeBytes": 588141,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_갱신심사_담당미상_갱신심사_2025.05_iso9001_인증서_전자본((주)제이유코스앤팩코리아)_2026년5월14일기준.pdf",
      "originalName": "[GMSCS-REP]__갱신심사_2025.05_iso9001_인증서_전자본((주)제이유코스앤팩코리아)_2026년5월14일기준.pdf - 543 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "543 KB",
      "sizeBytes": 556187,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_갱신심사_담당미상_갱신심사_2025.05_iso14001_인증서_전자본((주)제이유코스앤팩코리아)_2026년5월14일기준.pdf",
      "originalName": "[GMSCS-REP]__갱신심사_2025.05_iso14001_인증서_전자본((주)제이유코스앤팩코리아)_2026년5월14일기준.pdf - 542 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "542 KB",
      "sizeBytes": 554833,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-04_기타_심사_담당미상_1-2단계최초_2026.04_iso22716_인증서_전자본((주)제이유코스앤팩코리아).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.04_iso22716_인증서_전자본((주)제이유코스앤팩코리아).pdf - 446 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "446 KB",
      "sizeBytes": 456331,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1-2단계최초_2025.03_iso22716_인증서_전자본((주)리문)_수정본.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.03_iso22716_인증서_전자본((주)리문)_수정본.pdf - 285 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "285 KB",
      "sizeBytes": 292011,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_(주)케이원메탈1공장_심사_송인선(변)_(주)케이원메탈1공장_esg-ms_심사기록.pdf",
      "originalName": "[GMSCS-REP]_202510_(주)케이원메탈1공장_esg-ms_심사기록.pdf",
      "docType": "심사보고서",
      "fileSize": "3.2 MB",
      "sizeBytes": 3362224,
      "auditor": "송인선",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-DOC]_2024-07_(주)케이원메탈1공장_심사_송인선(변)_(주)케이원메탈1공장_2407_최초신청자료(케이원1공장ohs).pdf",
      "originalName": "[GMSCS-DOC]_202407_(주)케이원메탈1공장_2407_최초신청자료(케이원1공장ohs).pdf",
      "docType": "신청/전환자료",
      "fileSize": "853 KB",
      "sizeBytes": 873643,
      "auditor": "송인선",
      "pdfUrl": "/docs/audit_plan_sample.pdf"
    },
    {
      "fileName": "[GMSCS-CERT]_2025-10_(주)케이원메탈1공장_심사_송인선(변)_(주)케이원메탈1공장_esg-ms_인증서_전자본(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-CERT]_202510_(주)케이원메탈1공장_esg-ms_인증서_전자본(케이원메탈1공장).pdf",
      "docType": "인증서",
      "fileSize": "489 KB",
      "sizeBytes": 500926,
      "auditor": "송인선",
      "pdfUrl": "/docs/cert_change_application.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_--__심사_담당미상_--__2차사후_2026.02_iso9001_인증서_전자본((주)미래디스플레이).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2026.02_iso9001_인증서_전자본((주)미래디스플레이).pdf - 842 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "842 KB",
      "sizeBytes": 862636,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__갱신심사_담당미상_--__갱신심사_2025.11_iso9001_인증서_전자본((주)아하)_2026년01월26일기준.pdf",
      "originalName": "[GMSCS-REP]_--__갱신심사_2025.11_iso9001_인증서_전자본((주)아하)_2026년01월26일기준.pdf - 573 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "573 KB",
      "sizeBytes": 586425,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__갱신심사_담당미상_--__갱신심사_2025.11_iso14001_인증서_전자본((주)아하)_2026년01월26일기준_오기수정.pdf",
      "originalName": "[GMSCS-REP]_--__갱신심사_2025.11_iso14001_인증서_전자본((주)아하)_2026년01월26일기준_오기수정.pdf - 912 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "912 KB",
      "sizeBytes": 934136,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__갱신심사_담당미상_--__갱신심사_2025.07_iso45001_인증서_전자본((주)아하)_2026년01월26일기준.pdf",
      "originalName": "[GMSCS-REP]_--__갱신심사_2025.07_iso45001_인증서_전자본((주)아하)_2026년01월26일기준.pdf - 574 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "574 KB",
      "sizeBytes": 588141,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__갱신심사_담당미상_--__갱신심사_2025.05_iso9001_인증서_전자본((주)제이유코스앤팩코리아)_2026년5월14일기준.pdf",
      "originalName": "[GMSCS-REP]_--__갱신심사_2025.05_iso9001_인증서_전자본((주)제이유코스앤팩코리아)_2026년5월14일기준.pdf - 543 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "543 KB",
      "sizeBytes": 556187,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__갱신심사_담당미상_--__갱신심사_2025.05_iso14001_인증서_전자본((주)제이유코스앤팩코리아)_2026년5월14일기준.pdf",
      "originalName": "[GMSCS-REP]_--__갱신심사_2025.05_iso14001_인증서_전자본((주)제이유코스앤팩코리아)_2026년5월14일기준.pdf - 542 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "542 KB",
      "sizeBytes": 554833,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-04_--__심사_담당미상_--__1-2단계최초_2026.04_iso22716_인증서_전자본((주)제이유코스앤팩코리아).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.04_iso22716_인증서_전자본((주)제이유코스앤팩코리아).pdf - 446 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "446 KB",
      "sizeBytes": 456331,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1-2단계최초_2025.03_iso22716_인증서_전자본((주)리문)_수정본.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.03_iso22716_인증서_전자본((주)리문)_수정본.pdf - 285 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "285 KB",
      "sizeBytes": 292011,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "회명워터젠(주)": [
    {
      "fileName": "[GMSCS-REP]_2026-02_기타_심사_담당미상_1차사후_2026.02_2601_qe_tr_전환자료(회명워터젠).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2026.02_2601_qe_tr_전환자료(회명워터젠).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.1 MB",
      "sizeBytes": 6402171,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_기타_심사_담당미상_1차사후_2026.02_2602_qe_su1_심사보고서(회명워터젠).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2026.02_2602_qe_su1_심사보고서(회명워터젠).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1116507,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_기타_심사_담당미상_1차사후_2026.02_iso9001_인증서_전자본(회명워터젠(주)).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2026.02_iso9001_인증서_전자본(회명워터젠(주)).pdf - 513 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "513 KB",
      "sizeBytes": 525485,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_기타_심사_담당미상_1차사후_2026.02_iso14001_인증서_전자본(회명워터젠(주)).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2026.02_iso14001_인증서_전자본(회명워터젠(주)).pdf - 512 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "512 KB",
      "sizeBytes": 524246,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_--__심사_담당미상_--__1차사후_2026.02_2601_qe_tr_전환자료(회명워터젠).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2026.02_2601_qe_tr_전환자료(회명워터젠).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.1 MB",
      "sizeBytes": 6402171,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_--__심사_담당미상_--__1차사후_2026.02_2602_qe_su1_심사보고서(회명워터젠).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2026.02_2602_qe_su1_심사보고서(회명워터젠).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1116507,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_--__심사_담당미상_--__1차사후_2026.02_iso9001_인증서_전자본(회명워터젠(주)).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2026.02_iso9001_인증서_전자본(회명워터젠(주)).pdf - 513 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "513 KB",
      "sizeBytes": 525485,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-02_--__심사_담당미상_--__1차사후_2026.02_iso14001_인증서_전자본(회명워터젠(주)).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2026.02_iso14001_인증서_전자본(회명워터젠(주)).pdf - 512 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "512 KB",
      "sizeBytes": 524246,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)그린마이스터": [
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1-2단계최초_2026.01_2601_ohs_in_신청자료(그린마이스터).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.01_2601_ohs_in_신청자료(그린마이스터).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.1 MB",
      "sizeBytes": 6437402,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1-2단계최초_2026.01_2602_ohs_in_심사보고서(그린마이스터).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.01_2602_ohs_in_심사보고서(그린마이스터).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 1984591,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1-2단계최초_2026.01_iso45001_인증서_전자본(그린마이스터).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.01_iso45001_인증서_전자본(그린마이스터).pdf - 505 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "505 KB",
      "sizeBytes": 516919,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1-2단계최초_2026.01_2601_ohs_in_신청자료(그린마이스터).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.01_2601_ohs_in_신청자료(그린마이스터).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.1 MB",
      "sizeBytes": 6437402,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1-2단계최초_2026.01_2602_ohs_in_심사보고서(그린마이스터).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.01_2602_ohs_in_심사보고서(그린마이스터).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 1984591,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1-2단계최초_2026.01_iso45001_인증서_전자본(그린마이스터).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.01_iso45001_인증서_전자본(그린마이스터).pdf - 505 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "505 KB",
      "sizeBytes": 516919,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)유진상사": [
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1-2단계최초_2026.01_2512_ohs_in_신청자료(유진상사).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.01_2512_ohs_in_신청자료(유진상사).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.1 MB",
      "sizeBytes": 2204978,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1-2단계최초_2026.01_2601_ohs_in_심사보고서(유진상사).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.01_2601_ohs_in_심사보고서(유진상사).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1700679,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1-2단계최초_2026.01_iso45001_인증서_전자본(유진상사).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.01_iso45001_인증서_전자본(유진상사)_.pdf - 863 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "863 KB",
      "sizeBytes": 884190,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1-2단계최초_2026.01_2512_ohs_in_신청자료(유진상사).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.01_2512_ohs_in_신청자료(유진상사).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.1 MB",
      "sizeBytes": 2204978,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1-2단계최초_2026.01_2601_ohs_in_심사보고서(유진상사).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.01_2601_ohs_in_심사보고서(유진상사).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1700679,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1-2단계최초_2026.01_iso45001_인증서_전자본(유진상사).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.01_iso45001_인증서_전자본(유진상사)_.pdf - 863 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "863 KB",
      "sizeBytes": 884190,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "태봉화장품": [
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1-2단계최초_2026.01_2601_c-gmp_in_신청자료(태봉화장품).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.01_2601_c-gmp_in_신청자료(태봉화장품).pdf - 828 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "828 KB",
      "sizeBytes": 847750,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1-2단계최초_2026.01_2601_c-gmp_in_심사보고서(태봉화장품).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.01_2601_c-gmp_in_심사보고서(태봉화장품).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1374125,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1-2단계최초_2026.01_iso22716_인증서_전자본(태봉화장품).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.01_iso22716_인증서_전자본(태봉화장품).pdf - 710 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "710 KB",
      "sizeBytes": 726648,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1-2단계최초_2026.01_2601_c-gmp_in_신청자료(태봉화장품).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.01_2601_c-gmp_in_신청자료(태봉화장품).pdf - 828 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "828 KB",
      "sizeBytes": 847750,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1-2단계최초_2026.01_2601_c-gmp_in_심사보고서(태봉화장품).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.01_2601_c-gmp_in_심사보고서(태봉화장품).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1374125,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1-2단계최초_2026.01_iso22716_인증서_전자본(태봉화장품).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.01_iso22716_인증서_전자본(태봉화장품).pdf - 710 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "710 KB",
      "sizeBytes": 726648,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)신의코퍼레이션": [
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_심사_담당미상_1-2단계최초_2025.11_iso45001_인증서_전자본(신의코퍼레이션).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.11_iso45001_인증서_전자본(신의코퍼레이션).pdf - 551 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "551 KB",
      "sizeBytes": 564204,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_심사_담당미상_1-2단계최초_2025.11_2512_qoh_in_신청자료(신의코퍼레이션).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.11_2512_qoh_in_신청자료(신의코퍼레이션).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.0 MB",
      "sizeBytes": 2074274,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_심사_담당미상_1-2단계최초_2025.11_2512_qoh_in_심사보고서(신의코퍼레이션).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.11_2512_qoh_in_심사보고서(신의코퍼레이션).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.0 MB",
      "sizeBytes": 2112677,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_심사_담당미상_1-2단계최초_2025.11_iso9001_인증서_전자본(신의코퍼레이션).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.11_iso9001_인증서_전자본(신의코퍼레이션).pdf - 547 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "547 KB",
      "sizeBytes": 560579,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__심사_담당미상_--__1-2단계최초_2025.11_iso45001_인증서_전자본(신의코퍼레이션).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.11_iso45001_인증서_전자본(신의코퍼레이션).pdf - 551 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "551 KB",
      "sizeBytes": 564204,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__심사_담당미상_--__1-2단계최초_2025.11_2512_qoh_in_신청자료(신의코퍼레이션).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.11_2512_qoh_in_신청자료(신의코퍼레이션).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.0 MB",
      "sizeBytes": 2074274,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__심사_담당미상_--__1-2단계최초_2025.11_2512_qoh_in_심사보고서(신의코퍼레이션).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.11_2512_qoh_in_심사보고서(신의코퍼레이션).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.0 MB",
      "sizeBytes": 2112677,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__심사_담당미상_--__1-2단계최초_2025.11_iso9001_인증서_전자본(신의코퍼레이션).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.11_iso9001_인증서_전자본(신의코퍼레이션).pdf - 547 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "547 KB",
      "sizeBytes": 560579,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "오성이엔지": [
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_2차사후_2025.10_2510_qoh_tr_전환자료(오성이엔지).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.10_2510_qoh_tr_전환자료(오성이엔지).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.3 MB",
      "sizeBytes": 5568435,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_2차사후_2025.10_2511_qoh_su2_심사보고서(오성이엔지).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.10_2511_qoh_su2_심사보고서(오성이엔지).pdf - 16 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "16.5 MB",
      "sizeBytes": 17292616,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_2차사후_2025.10_iso9001_인증서_전자본(오성이엔지).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.10_iso9001_인증서_전자본(오성이엔지).pdf - 524 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "524 KB",
      "sizeBytes": 536214,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_2차사후_2025.10_iso45001_인증서_전자본(오성이엔지).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.10_iso45001_인증서_전자본(오성이엔지).pdf - 528 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "528 KB",
      "sizeBytes": 541035,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__2차사후_2025.10_2510_qoh_tr_전환자료(오성이엔지).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.10_2510_qoh_tr_전환자료(오성이엔지).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.3 MB",
      "sizeBytes": 5568435,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__2차사후_2025.10_2511_qoh_su2_심사보고서(오성이엔지).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.10_2511_qoh_su2_심사보고서(오성이엔지).pdf - 16 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "16.5 MB",
      "sizeBytes": 17292616,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__2차사후_2025.10_iso9001_인증서_전자본(오성이엔지).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.10_iso9001_인증서_전자본(오성이엔지).pdf - 524 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "524 KB",
      "sizeBytes": 536214,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__2차사후_2025.10_iso45001_인증서_전자본(오성이엔지).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.10_iso45001_인증서_전자본(오성이엔지).pdf - 528 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "528 KB",
      "sizeBytes": 541035,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "울산광역시청": [
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_1-2단계최초_2025.10_2510_ohs_in_신청자료(울산광역시청).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.10_2510_ohs_in_신청자료(울산광역시청).pdf - 12 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.0 MB",
      "sizeBytes": 12555613,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_1-2단계최초_2025.10_2511_ohs_in_심사보고서(울산광역시청).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.10_2511_ohs_in_심사보고서(울산광역시청).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1448675,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_1-2단계최초_2025.10_iso45001_인증서_전자본(울산광역시청).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.10_iso45001_인증서_전자본(울산광역시청).pdf - 528 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "528 KB",
      "sizeBytes": 541012,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__1-2단계최초_2025.10_2510_ohs_in_신청자료(울산광역시청).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.10_2510_ohs_in_신청자료(울산광역시청).pdf - 12 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.0 MB",
      "sizeBytes": 12555613,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__1-2단계최초_2025.10_2511_ohs_in_심사보고서(울산광역시청).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.10_2511_ohs_in_심사보고서(울산광역시청).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1448675,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__1-2단계최초_2025.10_iso45001_인증서_전자본(울산광역시청).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.10_iso45001_인증서_전자본(울산광역시청).pdf - 528 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "528 KB",
      "sizeBytes": 541012,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "현우전기(주)": [
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1-2단계최초_2025.09_2509_qms_tr_전환자료(현우전기).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.09_2509_qms_tr_전환자료(현우전기)_.pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "9.8 MB",
      "sizeBytes": 10300022,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1-2단계최초_2025.09_2510_qms_re_심사보고서(현우전기).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.09_2510_qms_re_심사보고서(현우전기).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.1 MB",
      "sizeBytes": 2244940,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1-2단계최초_2025.09_iso9001_인증서_전자본(현우전기).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.09_iso9001_인증서_전자본(현우전기).pdf - 854 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "854 KB",
      "sizeBytes": 874438,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1-2단계최초_2025.09_2509_qms_tr_전환자료(현우전기).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.09_2509_qms_tr_전환자료(현우전기)_.pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "9.8 MB",
      "sizeBytes": 10300022,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1-2단계최초_2025.09_2510_qms_re_심사보고서(현우전기).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.09_2510_qms_re_심사보고서(현우전기).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.1 MB",
      "sizeBytes": 2244940,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1-2단계최초_2025.09_iso9001_인증서_전자본(현우전기).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.09_iso9001_인증서_전자본(현우전기).pdf - 854 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "854 KB",
      "sizeBytes": 874438,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "호성건설산업(주)": [
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1차사후_2025.09_2509_qms_su1_심사보고서(호성건설산업).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.09_2509_qms_su1_심사보고서(호성건설산업).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.3 MB",
      "sizeBytes": 8704603,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1차사후_2025.09_iso9001_인증서_전자본(호성건설산업).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.09_iso9001_인증서_전자본(호성건설산업).pdf - 550 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "550 KB",
      "sizeBytes": 562838,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1차사후_2025.09_2509_qms_tr_심사자료(호성건설산업).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.09_2509_qms_tr_심사자료(호성건설산업)_.pdf - 18 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "17.7 MB",
      "sizeBytes": 18564180,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1차사후_2025.09_2509_qms_su1_심사보고서(호성건설산업).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.09_2509_qms_su1_심사보고서(호성건설산업).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.3 MB",
      "sizeBytes": 8704603,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1차사후_2025.09_iso9001_인증서_전자본(호성건설산업).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.09_iso9001_인증서_전자본(호성건설산업).pdf - 550 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "550 KB",
      "sizeBytes": 562838,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1차사후_2025.09_2509_qms_tr_심사자료(호성건설산업).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.09_2509_qms_tr_심사자료(호성건설산업)_.pdf - 18 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "17.7 MB",
      "sizeBytes": 18564180,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)서현개발": [
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1-2단계최초_2025.09_2508_ohs_in_심사신청자료(서현개발).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.09_2508_ohs_in_심사신청자료(서현개발).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1282385,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1-2단계최초_2025.09_2509_ohs_in_심사보고서(서현개발).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.09_2509_ohs_in_심사보고서(서현개발).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1684923,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1-2단계최초_2025.09_iso45001_인증서_전자본(서현개발).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.09_iso45001_인증서_전자본(서현개발).pdf - 527 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "527 KB",
      "sizeBytes": 540081,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1-2단계최초_2025.09_2508_ohs_in_심사신청자료(서현개발).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.09_2508_ohs_in_심사신청자료(서현개발).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1282385,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1-2단계최초_2025.09_2509_ohs_in_심사보고서(서현개발).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.09_2509_ohs_in_심사보고서(서현개발).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1684923,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1-2단계최초_2025.09_iso45001_인증서_전자본(서현개발).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.09_iso45001_인증서_전자본(서현개발).pdf - 527 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "527 KB",
      "sizeBytes": 540081,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)고려비철공업": [
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1차사후_2025.07_2507_qms_전환심사자료(고려비철공업).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.07_2507_qms_전환심사자료(고려비철공업).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "13.0 MB",
      "sizeBytes": 13654292,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1차사후_2025.07_2508_qms_su1_심사보고서(고려비철공업).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.07_2508_qms_su1_심사보고서(고려비철공업).pdf - 12 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.0 MB",
      "sizeBytes": 12615887,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1차사후_2025.07_iso9001_인증서_전자본(고려비철공업).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.07_iso9001_인증서_전자본(고려비철공업).pdf - 861 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "861 KB",
      "sizeBytes": 881594,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1차사후_2025.07_2507_qms_전환심사자료(고려비철공업).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.07_2507_qms_전환심사자료(고려비철공업).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "13.0 MB",
      "sizeBytes": 13654292,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1차사후_2025.07_2508_qms_su1_심사보고서(고려비철공업).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.07_2508_qms_su1_심사보고서(고려비철공업).pdf - 12 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.0 MB",
      "sizeBytes": 12615887,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1차사후_2025.07_iso9001_인증서_전자본(고려비철공업).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.07_iso9001_인증서_전자본(고려비철공업).pdf - 861 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "861 KB",
      "sizeBytes": 881594,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "선진뷰티사이언스(주)": [
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1-2단계최초_2025.07_iso45001_인증서_전자본(선진뷰티사이언스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.07_iso45001_인증서_전자본(선진뷰티사이언스).pdf - 536 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "536 KB",
      "sizeBytes": 548464,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1-2단계최초_2025.07_2507_eoh_tr_전환자료(선진뷰티사이언스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.07_2507_eoh_tr_전환자료(선진뷰티사이언스).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.4 MB",
      "sizeBytes": 10938347,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1-2단계최초_2025.07_2508_eoh_re_심사보고서(선진뷰티사이언스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.07_2508_eoh_re_심사보고서(선진뷰티사이언스).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1721011,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1-2단계최초_2025.07_iso14001_인증서_전자본(선진뷰티사이언스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.07_iso14001_인증서_전자본(선진뷰티사이언스).pdf - 531 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "531 KB",
      "sizeBytes": 543572,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1-2단계최초_2025.07_iso45001_인증서_전자본(선진뷰티사이언스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.07_iso45001_인증서_전자본(선진뷰티사이언스).pdf - 536 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "536 KB",
      "sizeBytes": 548464,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1-2단계최초_2025.07_2507_eoh_tr_전환자료(선진뷰티사이언스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.07_2507_eoh_tr_전환자료(선진뷰티사이언스).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.4 MB",
      "sizeBytes": 10938347,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1-2단계최초_2025.07_2508_eoh_re_심사보고서(선진뷰티사이언스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.07_2508_eoh_re_심사보고서(선진뷰티사이언스).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1721011,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1-2단계최초_2025.07_iso14001_인증서_전자본(선진뷰티사이언스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.07_iso14001_인증서_전자본(선진뷰티사이언스).pdf - 531 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "531 KB",
      "sizeBytes": 543572,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)아하": [
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_심사_담당미상_2차사후_2025.11_2511_qe_su2_심사보고서(아하).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.11_2511_qe_su2_심사보고서(아하).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.8 MB",
      "sizeBytes": 1933246,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_심사_담당미상_2차사후_2025.11_2511_qe_tr_심사신청자료(아하).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.11_2511_qe_tr_심사신청자료(아하).pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "7.0 MB",
      "sizeBytes": 7324556,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_심사_담당미상_2차사후_2025.11_iso9001_인증서_전자본(아하).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.11_iso9001_인증서_전자본(아하).pdf - 549 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "549 KB",
      "sizeBytes": 562350,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_심사_담당미상_2차사후_2025.11_iso14001_인증서_전자본(아하).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.11_iso14001_인증서_전자본(아하).pdf - 547 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "547 KB",
      "sizeBytes": 559807,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1차사후_2025.07_2507_ohs_su1_심사보고서(아하).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.07_2507_ohs_su1_심사보고서(아하).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.0 MB",
      "sizeBytes": 2068877,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1차사후_2025.07_2507_ohs_tr_전환자료(아하).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.07_2507_ohs_tr_전환자료(아하).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "13.1 MB",
      "sizeBytes": 13703733,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1차사후_2025.07_iso45001_인증서_전자본(아하).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.07_iso45001_인증서_전자본(아하).pdf - 551 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "551 KB",
      "sizeBytes": 564310,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__심사_담당미상_--__2차사후_2025.11_2511_qe_su2_심사보고서(아하).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.11_2511_qe_su2_심사보고서(아하).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.8 MB",
      "sizeBytes": 1933246,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__심사_담당미상_--__2차사후_2025.11_2511_qe_tr_심사신청자료(아하).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.11_2511_qe_tr_심사신청자료(아하).pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "7.0 MB",
      "sizeBytes": 7324556,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__심사_담당미상_--__2차사후_2025.11_iso9001_인증서_전자본(아하).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.11_iso9001_인증서_전자본(아하).pdf - 549 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "549 KB",
      "sizeBytes": 562350,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__심사_담당미상_--__2차사후_2025.11_iso14001_인증서_전자본(아하).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.11_iso14001_인증서_전자본(아하).pdf - 547 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "547 KB",
      "sizeBytes": 559807,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1차사후_2025.07_2507_ohs_su1_심사보고서(아하).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.07_2507_ohs_su1_심사보고서(아하).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.0 MB",
      "sizeBytes": 2068877,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1차사후_2025.07_2507_ohs_tr_전환자료(아하).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.07_2507_ohs_tr_전환자료(아하).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "13.1 MB",
      "sizeBytes": 13703733,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1차사후_2025.07_iso45001_인증서_전자본(아하).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.07_iso45001_인증서_전자본(아하).pdf - 551 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "551 KB",
      "sizeBytes": 564310,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "인증범위": [
    {
      "fileName": "[GMSCS-REP]_2025-11_기타_갱신심사_담당미상_갱신심사_2025.11_2601_qe_변경심사자료(인증범위).pdf",
      "originalName": "[GMSCS-REP]__갱신심사_2025.11_2601_qe_변경심사자료(인증범위).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1667247,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_갱신심사_담당미상_갱신심사_2025.07_2601_ohs_변경심사자료(인증범위).pdf",
      "originalName": "[GMSCS-REP]__갱신심사_2025.07_2601_ohs_변경심사자료(인증범위).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1599301,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-11_--__갱신심사_담당미상_--__갱신심사_2025.11_2601_qe_변경심사자료(인증범위).pdf",
      "originalName": "[GMSCS-REP]_--__갱신심사_2025.11_2601_qe_변경심사자료(인증범위).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1667247,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__갱신심사_담당미상_--__갱신심사_2025.07_2601_ohs_변경심사자료(인증범위).pdf",
      "originalName": "[GMSCS-REP]_--__갱신심사_2025.07_2601_ohs_변경심사자료(인증범위).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1599301,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "탄용환경개발(주)": [
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1차사후_2025.07_2507_qms_tr_심사신청자료(탄용환경개발).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.07_2507_qms_tr_심사신청자료(탄용환경개발)_.pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.0 MB",
      "sizeBytes": 10475203,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1차사후_2025.07_2508_qms_su1_심사보고서(탄용환경개발).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.07_2508_qms_su1_심사보고서(탄용환경개발).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1429242,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1차사후_2025.07_iso9001_인증서_전자본(탄용환경개발).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.07_iso9001_인증서_전자본(탄용환경개발).pdf - 524 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "524 KB",
      "sizeBytes": 537012,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1차사후_2025.07_2507_qms_tr_심사신청자료(탄용환경개발).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.07_2507_qms_tr_심사신청자료(탄용환경개발)_.pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.0 MB",
      "sizeBytes": 10475203,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1차사후_2025.07_2508_qms_su1_심사보고서(탄용환경개발).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.07_2508_qms_su1_심사보고서(탄용환경개발).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1429242,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1차사후_2025.07_iso9001_인증서_전자본(탄용환경개발).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.07_iso9001_인증서_전자본(탄용환경개발).pdf - 524 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "524 KB",
      "sizeBytes": 537012,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "예도오토메이션": [
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1-2단계최초_2025.07_2507_qms_in_신청자료(예도오토메이션).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.07_2507_qms_in_신청자료(예도오토메이션).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.7 MB",
      "sizeBytes": 13344533,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1-2단계최초_2025.07_2507_qms_in_심사보고서(예도오토메이션).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.07_2507_qms_in_심사보고서(예도오토메이션).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.4 MB",
      "sizeBytes": 4610157,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_기타_심사_담당미상_1-2단계최초_2025.07_iso9001_인증서_전자본(예도오토메이션).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.07_iso9001_인증서_전자본(예도오토메이션)_.pdf - 843 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "843 KB",
      "sizeBytes": 863206,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1-2단계최초_2025.07_2507_qms_in_신청자료(예도오토메이션).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.07_2507_qms_in_신청자료(예도오토메이션).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.7 MB",
      "sizeBytes": 13344533,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1-2단계최초_2025.07_2507_qms_in_심사보고서(예도오토메이션).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.07_2507_qms_in_심사보고서(예도오토메이션).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.4 MB",
      "sizeBytes": 4610157,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-07_--__심사_담당미상_--__1-2단계최초_2025.07_iso9001_인증서_전자본(예도오토메이션).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.07_iso9001_인증서_전자본(예도오토메이션)_.pdf - 843 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "843 KB",
      "sizeBytes": 863206,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)지인": [
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_1-2단계최초_2025.06_2506_qe_re_심사보고서(지인).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.06_2506_qe_re_심사보고서(지인).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.6 MB",
      "sizeBytes": 4775953,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_1-2단계최초_2025.06_2506_qe_tr_전환자료(지인).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.06_2506_qe_tr_전환자료(지인).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.8 MB",
      "sizeBytes": 11285160,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_1-2단계최초_2025.06_iso9001_인증서_전자본(지인).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.06_iso9001_인증서_전자본(지인).pdf - 525 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "525 KB",
      "sizeBytes": 537272,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_1-2단계최초_2025.06_iso14001_인증서_전자본(지인).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.06_iso14001_인증서_전자본(지인).pdf - 525 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "525 KB",
      "sizeBytes": 537125,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__1-2단계최초_2025.06_2506_qe_re_심사보고서(지인).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.06_2506_qe_re_심사보고서(지인).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.6 MB",
      "sizeBytes": 4775953,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__1-2단계최초_2025.06_2506_qe_tr_전환자료(지인).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.06_2506_qe_tr_전환자료(지인).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.8 MB",
      "sizeBytes": 11285160,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__1-2단계최초_2025.06_iso9001_인증서_전자본(지인).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.06_iso9001_인증서_전자본(지인).pdf - 525 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "525 KB",
      "sizeBytes": 537272,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__1-2단계최초_2025.06_iso14001_인증서_전자본(지인).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.06_iso14001_인증서_전자본(지인).pdf - 525 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "525 KB",
      "sizeBytes": 537125,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)잉크테크": [
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_1차사후_2025.06_2507_qe_su1_심사보고서(잉크테크).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.06_2507_qe_su1_심사보고서(잉크테크).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 1955842,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_1차사후_2025.06_2507_qe_tr_전환자료(잉크테크).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.06_2507_qe_tr_전환자료(잉크테크).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.4 MB",
      "sizeBytes": 10895085,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_1차사후_2025.06_iso9001_인증서_전자본(잉크테크).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.06_iso9001_인증서_전자본(잉크테크).pdf - 539 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "539 KB",
      "sizeBytes": 551996,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_1차사후_2025.06_iso14001_인증서_전자본(잉크테크).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.06_iso14001_인증서_전자본(잉크테크).pdf - 538 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "538 KB",
      "sizeBytes": 550551,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__1차사후_2025.06_2507_qe_su1_심사보고서(잉크테크).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.06_2507_qe_su1_심사보고서(잉크테크).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 1955842,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__1차사후_2025.06_2507_qe_tr_전환자료(잉크테크).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.06_2507_qe_tr_전환자료(잉크테크).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.4 MB",
      "sizeBytes": 10895085,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__1차사후_2025.06_iso9001_인증서_전자본(잉크테크).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.06_iso9001_인증서_전자본(잉크테크).pdf - 539 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "539 KB",
      "sizeBytes": 551996,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__1차사후_2025.06_iso14001_인증서_전자본(잉크테크).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.06_iso14001_인증서_전자본(잉크테크).pdf - 538 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "538 KB",
      "sizeBytes": 550551,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "은보기계": [
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_2차사후_2025.06_2504_qe_tr_전환자료(은보기계).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.06_2504_qe_tr_전환자료(은보기계).pdf - 9 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "9.4 MB",
      "sizeBytes": 9889546,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_2차사후_2025.06_iso9001_인증서_전자본(은보기계).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.06_iso9001_인증서_전자본(은보기계).pdf - 522 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "522 KB",
      "sizeBytes": 534346,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_2차사후_2025.06_iso14001_인증서_전자본(은보기계).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.06_iso14001_인증서_전자본(은보기계).pdf - 520 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "520 KB",
      "sizeBytes": 532979,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__2차사후_2025.06_2504_qe_tr_전환자료(은보기계).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.06_2504_qe_tr_전환자료(은보기계).pdf - 9 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "9.4 MB",
      "sizeBytes": 9889546,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__2차사후_2025.06_iso9001_인증서_전자본(은보기계).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.06_iso9001_인증서_전자본(은보기계).pdf - 522 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "522 KB",
      "sizeBytes": 534346,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__2차사후_2025.06_iso14001_인증서_전자본(은보기계).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.06_iso14001_인증서_전자본(은보기계).pdf - 520 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "520 KB",
      "sizeBytes": 532979,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "기타": [
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_2차사후_2025.06_2506_qe_su2_심사보고서(은보기계.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.06_2506_qe_su2_심사보고서(은보기계.pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.8 MB",
      "sizeBytes": 1926248,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_1-2단계최초_2025.10_esg-ms_심사기록.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.10_esg-ms_심사기록.pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.2 MB",
      "sizeBytes": 3362224,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_2407_qeo_in_인증서_상호변경_전.zip - 1 MB.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_2407_qeo_in_인증서_상호변경_전.zip - 1 MB",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1515581,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_기타_심사_담당미상_2차사후_2024.03_2503_ohs_su2심사보고서.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.03_2503_ohs_su2심사보고서.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1129270,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_심사신청자료_qe.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_심사신청자료_qe.pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "11.0 MB",
      "sizeBytes": 11517193,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_최초심사자료_qe.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_최초심사자료_qe.pdf - 16 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "15.8 MB",
      "sizeBytes": 16525203,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_심사신청자료_ohs.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_심사신청자료_ohs.pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.4 MB",
      "sizeBytes": 10879095,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_최초심사자료_ohs.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_최초심사자료_ohs.pdf - 23 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "23.1 MB",
      "sizeBytes": 24171275,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_심사신청자료.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_심사신청자료.pdf - 36 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "35.8 MB",
      "sizeBytes": 37529013,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_최초심사자료.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_최초심사자료.pdf - 19 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "19.2 MB",
      "sizeBytes": 20109743,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_심사신청자료.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_심사신청자료.pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.8 MB",
      "sizeBytes": 3996989,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_최초심사자료.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_최초심사자료.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1453570,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1차사후_2023.11_사후심사자료.pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.11_사후심사자료.pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.4 MB",
      "sizeBytes": 8853843,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1차사후_2023.11_인증신청자료.pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.11_인증신청자료.pdf - 16 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "15.7 MB",
      "sizeBytes": 16482206,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1-2단계최초_2023.11_심사신청자료.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.11_심사신청자료.pdf - 22 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "22.1 MB",
      "sizeBytes": 23209440,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1-2단계최초_2023.11_최초심사자료.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.11_최초심사자료.pdf - 19 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "18.6 MB",
      "sizeBytes": 19467659,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1차사후_2023.11_전환신청자료.pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.11_전환신청자료.pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.3 MB",
      "sizeBytes": 6621572,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1차사후_2023.11_사후심사자료[0].pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.11_사후심사자료[0].pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.0 MB",
      "sizeBytes": 2146218,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "장업시스템": [
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_2차사후_2025.05_2506_qe_su2_심사보고서(장업시스템).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.05_2506_qe_su2_심사보고서(장업시스템).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.8 MB",
      "sizeBytes": 2907986,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_2차사후_2025.05_2506_qe_tr_전환자료(장업시스템).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.05_2506_qe_tr_전환자료(장업시스템)_.pdf - 20 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "20.4 MB",
      "sizeBytes": 21344234,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_2차사후_2025.05_iso9001_인증서_전자본(장업시스템).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.05_iso9001_인증서_전자본(장업시스템).pdf - 524 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "524 KB",
      "sizeBytes": 536725,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_2차사후_2025.05_iso14001_인증서_전자본(장업시스템).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.05_iso14001_인증서_전자본(장업시스템).pdf - 524 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "524 KB",
      "sizeBytes": 536240,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__2차사후_2025.05_2506_qe_su2_심사보고서(장업시스템).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.05_2506_qe_su2_심사보고서(장업시스템).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.8 MB",
      "sizeBytes": 2907986,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__2차사후_2025.05_2506_qe_tr_전환자료(장업시스템).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.05_2506_qe_tr_전환자료(장업시스템)_.pdf - 20 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "20.4 MB",
      "sizeBytes": 21344234,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__2차사후_2025.05_iso9001_인증서_전자본(장업시스템).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.05_iso9001_인증서_전자본(장업시스템).pdf - 524 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "524 KB",
      "sizeBytes": 536725,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__2차사후_2025.05_iso14001_인증서_전자본(장업시스템).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.05_iso14001_인증서_전자본(장업시스템).pdf - 524 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "524 KB",
      "sizeBytes": 536240,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)제이유코스앤팩코리아": [
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_갱신심사_담당미상_갱신심사_2025.05_2604_cs_인증변경심사자료(제이유코스앤팩코리아).pdf",
      "originalName": "[GMSCS-REP]__갱신심사_2025.05_2604_cs_인증변경심사자료(제이유코스앤팩코리아).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.3 MB",
      "sizeBytes": 2388542,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-04_기타_심사_담당미상_1-2단계최초_2026.04_2604_c-gmp_in_신청자료(제이유코스앤팩코리아).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.04_2604_c-gmp_in_신청자료(제이유코스앤팩코리아).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.3 MB",
      "sizeBytes": 5564711,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-04_기타_심사_담당미상_1-2단계최초_2026.04_2604_c-gmp_in_심사보고서(제이유코스앤팩코리아).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.04_2604_c-gmp_in_심사보고서(제이유코스앤팩코리아).pdf - 9 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "9.5 MB",
      "sizeBytes": 9958602,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__갱신심사_담당미상_--__갱신심사_2025.05_2604_cs_인증변경심사자료(제이유코스앤팩코리아).pdf",
      "originalName": "[GMSCS-REP]_--__갱신심사_2025.05_2604_cs_인증변경심사자료(제이유코스앤팩코리아).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.3 MB",
      "sizeBytes": 2388542,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-04_--__심사_담당미상_--__1-2단계최초_2026.04_2604_c-gmp_in_신청자료(제이유코스앤팩코리아).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.04_2604_c-gmp_in_신청자료(제이유코스앤팩코리아).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.3 MB",
      "sizeBytes": 5564711,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-04_--__심사_담당미상_--__1-2단계최초_2026.04_2604_c-gmp_in_심사보고서(제이유코스앤팩코리아).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.04_2604_c-gmp_in_심사보고서(제이유코스앤팩코리아).pdf - 9 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "9.5 MB",
      "sizeBytes": 9958602,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)대한엔지니어링": [
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_2507_qoh_re_심사보고서(대한엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_2507_qoh_re_심사보고서(대한엔지니어링).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1346595,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_2507_qoh_tr_전환신청자료(대한엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_2507_qoh_tr_전환신청자료(대한엔지니어링).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.5 MB",
      "sizeBytes": 4670677,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_iso9001_인증서_전자본(대한엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_iso9001_인증서_전자본(대한엔지니어링).pdf - 524 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "524 KB",
      "sizeBytes": 537054,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_iso45001_인증서_전자본(대한엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_iso45001_인증서_전자본(대한엔지니어링).pdf - 527 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "527 KB",
      "sizeBytes": 539836,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_2507_qoh_re_심사보고서(대한엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_2507_qoh_re_심사보고서(대한엔지니어링).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1346595,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_2507_qoh_tr_전환신청자료(대한엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_2507_qoh_tr_전환신청자료(대한엔지니어링).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.5 MB",
      "sizeBytes": 4670677,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_iso9001_인증서_전자본(대한엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_iso9001_인증서_전자본(대한엔지니어링).pdf - 524 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "524 KB",
      "sizeBytes": 537054,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_iso45001_인증서_전자본(대한엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_iso45001_인증서_전자본(대한엔지니어링).pdf - 527 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "527 KB",
      "sizeBytes": 539836,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "금하산업(주)": [
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_2505_ohs_in신청자료(금하산업).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_2505_ohs_in신청자료(금하산업).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "9.6 MB",
      "sizeBytes": 10061867,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_2505_ohs_in심사보고서(금하산업).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_2505_ohs_in심사보고서(금하산업).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1237986,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_iso45001_인증서_전자본(금하산업).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_iso45001_인증서_전자본(금하산업).pdf - 531 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "531 KB",
      "sizeBytes": 543455,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1차사후_2025.05_2605_ohs_su1_심사보고서(금하산업).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.05_2605_ohs_su1_심사보고서(금하산업).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.5 MB",
      "sizeBytes": 10966965,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_2505_ohs_in신청자료(금하산업).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_2505_ohs_in신청자료(금하산업).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "9.6 MB",
      "sizeBytes": 10061867,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_2505_ohs_in심사보고서(금하산업).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_2505_ohs_in심사보고서(금하산업).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1237986,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_iso45001_인증서_전자본(금하산업).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_iso45001_인증서_전자본(금하산업).pdf - 531 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "531 KB",
      "sizeBytes": 543455,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1차사후_2025.05_2605_ohs_su1_심사보고서(금하산업).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.05_2605_ohs_su1_심사보고서(금하산업).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.5 MB",
      "sizeBytes": 10966965,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)제이피코플랜트": [
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_2505_ohs_in심사보고서(제이피코플랜트).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_2505_ohs_in심사보고서(제이피코플랜트)_.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1465536,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_2505_ohs_in심사신청자료(제이피코플랜트).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_2505_ohs_in심사신청자료(제이피코플랜트)_.pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.7 MB",
      "sizeBytes": 3865630,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_iso45001_인증서_전자본(제이피코플랜트).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_iso45001_인증서_전자본(제이피코플랜트).pdf - 866 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "866 KB",
      "sizeBytes": 886740,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1차사후_2025.05_2602_ohs_su1_심사보고서(제이피코플랜트).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.05_2602_ohs_su1_심사보고서(제이피코플랜트).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1142408,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_2505_ohs_in심사보고서(제이피코플랜트).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_2505_ohs_in심사보고서(제이피코플랜트)_.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1465536,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_2505_ohs_in심사신청자료(제이피코플랜트).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_2505_ohs_in심사신청자료(제이피코플랜트)_.pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.7 MB",
      "sizeBytes": 3865630,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_iso45001_인증서_전자본(제이피코플랜트).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_iso45001_인증서_전자본(제이피코플랜트).pdf - 866 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "866 KB",
      "sizeBytes": 886740,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1차사후_2025.05_2602_ohs_su1_심사보고서(제이피코플랜트).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.05_2602_ohs_su1_심사보고서(제이피코플랜트).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1142408,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)문화": [
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_2차사후_2025.04_2504_qoh_su2심사보고서(문화).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.04_2504_qoh_su2심사보고서(문화).pdf - 12 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "11.5 MB",
      "sizeBytes": 12083836,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_2차사후_2025.04_2504_qoh_tr전환신청자료(문화).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.04_2504_qoh_tr전환신청자료(문화).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.3 MB",
      "sizeBytes": 4547053,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_2차사후_2025.04_iso9001_인증서_전자본(문화).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.04_iso9001_인증서_전자본(문화).pdf - 464 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "464 KB",
      "sizeBytes": 475647,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_2차사후_2025.04_iso45001_인증서_전자본(문화).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.04_iso45001_인증서_전자본(문화).pdf - 453 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "453 KB",
      "sizeBytes": 464013,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__2차사후_2025.04_2504_qoh_su2심사보고서(문화).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.04_2504_qoh_su2심사보고서(문화).pdf - 12 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "11.5 MB",
      "sizeBytes": 12083836,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__2차사후_2025.04_2504_qoh_tr전환신청자료(문화).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.04_2504_qoh_tr전환신청자료(문화).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.3 MB",
      "sizeBytes": 4547053,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__2차사후_2025.04_iso9001_인증서_전자본(문화).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.04_iso9001_인증서_전자본(문화).pdf - 464 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "464 KB",
      "sizeBytes": 475647,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__2차사후_2025.04_iso45001_인증서_전자본(문화).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.04_iso45001_인증서_전자본(문화).pdf - 453 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "453 KB",
      "sizeBytes": 464013,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "지에이치테크": [
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_iso9001_인증서_전자본(지에이치테크).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_iso9001_인증서_전자본(지에이치테크).pdf - 523 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "523 KB",
      "sizeBytes": 535766,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_iso14001_인증서_전자본(지에이치테크).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_iso14001_인증서_전자본(지에이치테크).pdf - 522 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "522 KB",
      "sizeBytes": 534857,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_iso45001_인증서_전자본(지에이치테크).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_iso45001_인증서_전자본(지에이치테크).pdf - 527 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "527 KB",
      "sizeBytes": 539845,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_2506_qeo_in심사보고서(지에이치테크).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_2506_qeo_in심사보고서(지에이치테크).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1284902,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_2506_qeo_in인증신청자료(지에이치테크).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_2506_qeo_in인증신청자료(지에이치테크).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.4 MB",
      "sizeBytes": 2484314,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_iso9001_인증서_전자본(지에이치테크).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_iso9001_인증서_전자본(지에이치테크).pdf - 523 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "523 KB",
      "sizeBytes": 535766,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_iso14001_인증서_전자본(지에이치테크).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_iso14001_인증서_전자본(지에이치테크).pdf - 522 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "522 KB",
      "sizeBytes": 534857,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_iso45001_인증서_전자본(지에이치테크).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_iso45001_인증서_전자본(지에이치테크).pdf - 527 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "527 KB",
      "sizeBytes": 539845,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_2506_qeo_in심사보고서(지에이치테크).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_2506_qeo_in심사보고서(지에이치테크).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1284902,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_2506_qeo_in인증신청자료(지에이치테크).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_2506_qeo_in인증신청자료(지에이치테크).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.4 MB",
      "sizeBytes": 2484314,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)제이솔루션": [
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_iso45001_인증서_전자본(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_iso45001_인증서_전자본(제이솔루션).pdf - 351 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "351 KB",
      "sizeBytes": 359784,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_2차사후_2025.04_2505_qeoh_sure심사보고서(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.04_2505_qeoh_sure심사보고서(제이솔루션).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.6 MB",
      "sizeBytes": 11076112,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_2차사후_2025.04_2505_qeoh_tr전환자료(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.04_2505_qeoh_tr전환자료(제이솔루션).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.9 MB",
      "sizeBytes": 3024744,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_2차사후_2025.04_iso9001_인증서_전자본(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.04_iso9001_인증서_전자본(제이솔루션).pdf - 351 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "351 KB",
      "sizeBytes": 358951,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_2차사후_2025.04_iso14001_인증서_전자본(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.04_iso14001_인증서_전자본(제이솔루션).pdf - 351 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "351 KB",
      "sizeBytes": 359080,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-05_기타_심사_담당미상_1-2단계최초_2026.05_2605_qeoh_resu_심사보고서(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.05_2605_qeoh_resu_심사보고서(제이솔루션).pdf - 21 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "21.0 MB",
      "sizeBytes": 21993790,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-05_기타_심사_담당미상_1-2단계최초_2026.05_iso9001_인증서_전자본(제이솔루션)_2026년06월29일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.05_iso9001_인증서_전자본(제이솔루션)_2026년06월29일기준.pdf - 503 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "503 KB",
      "sizeBytes": 514576,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-05_기타_심사_담당미상_1-2단계최초_2026.05_iso14001_인증서_전자본(제이솔루션)_2026년06월29일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.05_iso14001_인증서_전자본(제이솔루션)_2026년06월29일기준.pdf - 502 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "502 KB",
      "sizeBytes": 513724,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_iso45001_인증서_전자본(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_iso45001_인증서_전자본(제이솔루션).pdf - 351 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "351 KB",
      "sizeBytes": 359784,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__2차사후_2025.04_2505_qeoh_sure심사보고서(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.04_2505_qeoh_sure심사보고서(제이솔루션).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.6 MB",
      "sizeBytes": 11076112,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__2차사후_2025.04_2505_qeoh_tr전환자료(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.04_2505_qeoh_tr전환자료(제이솔루션).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.9 MB",
      "sizeBytes": 3024744,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__2차사후_2025.04_iso9001_인증서_전자본(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.04_iso9001_인증서_전자본(제이솔루션).pdf - 351 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "351 KB",
      "sizeBytes": 358951,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__2차사후_2025.04_iso14001_인증서_전자본(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.04_iso14001_인증서_전자본(제이솔루션).pdf - 351 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "351 KB",
      "sizeBytes": 359080,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-05_--__심사_담당미상_--__1-2단계최초_2026.05_2605_qeoh_resu_심사보고서(제이솔루션).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.05_2605_qeoh_resu_심사보고서(제이솔루션).pdf - 21 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "21.0 MB",
      "sizeBytes": 21993790,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-05_--__심사_담당미상_--__1-2단계최초_2026.05_iso9001_인증서_전자본(제이솔루션)_2026년06월29일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.05_iso9001_인증서_전자본(제이솔루션)_2026년06월29일기준.pdf - 503 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "503 KB",
      "sizeBytes": 514576,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-05_--__심사_담당미상_--__1-2단계최초_2026.05_iso14001_인증서_전자본(제이솔루션)_2026년06월29일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.05_iso14001_인증서_전자본(제이솔루션)_2026년06월29일기준.pdf - 502 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "502 KB",
      "sizeBytes": 513724,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "혜성소방(주)": [
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_2504_ohs_in심사보고서(혜성소방).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_2504_ohs_in심사보고서(혜성소방)_.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1210003,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_2504_ohs_in심사신청자료(혜성소방).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_2504_ohs_in심사신청자료(혜성소방).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1641408,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_iso45001_인증서_전자본(혜성소방).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_iso45001_인증서_전자본(혜성소방).pdf - 461 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "461 KB",
      "sizeBytes": 472477,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_2504_ohs_in심사보고서(혜성소방).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_2504_ohs_in심사보고서(혜성소방)_.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1210003,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_2504_ohs_in심사신청자료(혜성소방).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_2504_ohs_in심사신청자료(혜성소방).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1641408,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_iso45001_인증서_전자본(혜성소방).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_iso45001_인증서_전자본(혜성소방).pdf - 461 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "461 KB",
      "sizeBytes": 472477,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "화성종합엔지니어링(주)": [
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_2504_qeoh_re심사보고서(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_2504_qeoh_re심사보고서(화성종합엔지니어링).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1264363,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_2504_qeoh_tr_re심사신청자료(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_2504_qeoh_tr_re심사신청자료(화성종합엔지니어링).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.9 MB",
      "sizeBytes": 4120659,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_iso9001_인증서_전자본(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_iso9001_인증서_전자본(화성종합엔지니어링).pdf - 466 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "466 KB",
      "sizeBytes": 476678,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_iso14001_인증서_전자본(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_iso14001_인증서_전자본(화성종합엔지니어링).pdf - 465 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "465 KB",
      "sizeBytes": 476152,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_iso45001_인증서_전자본(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_iso45001_인증서_전자본(화성종합엔지니어링).pdf - 466 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "466 KB",
      "sizeBytes": 476895,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1차사후_2025.04_2603_qeoh_su1_심사보고서(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.04_2603_qeoh_su1_심사보고서(화성종합엔지니어링).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.6 MB",
      "sizeBytes": 2716011,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_2504_qeoh_re심사보고서(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_2504_qeoh_re심사보고서(화성종합엔지니어링).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1264363,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_2504_qeoh_tr_re심사신청자료(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_2504_qeoh_tr_re심사신청자료(화성종합엔지니어링).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.9 MB",
      "sizeBytes": 4120659,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_iso9001_인증서_전자본(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_iso9001_인증서_전자본(화성종합엔지니어링).pdf - 466 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "466 KB",
      "sizeBytes": 476678,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_iso14001_인증서_전자본(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_iso14001_인증서_전자본(화성종합엔지니어링).pdf - 465 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "465 KB",
      "sizeBytes": 476152,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_iso45001_인증서_전자본(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_iso45001_인증서_전자본(화성종합엔지니어링).pdf - 466 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "466 KB",
      "sizeBytes": 476895,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1차사후_2025.04_2603_qeoh_su1_심사보고서(화성종합엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.04_2603_qeoh_su1_심사보고서(화성종합엔지니어링).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.6 MB",
      "sizeBytes": 2716011,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "화성궤도(주)": [
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_2504_qeoh_tr심사자료(화성궤도)_압축.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_2504_qeoh_tr심사자료(화성궤도)_압축.pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.6 MB",
      "sizeBytes": 2708547,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_iso9001_인증서_전자본(화성궤도).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_iso9001_인증서_전자본(화성궤도).pdf - 464 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "464 KB",
      "sizeBytes": 475412,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_iso14001_인증서_전자본(화성궤도).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_iso14001_인증서_전자본(화성궤도).pdf - 464 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "464 KB",
      "sizeBytes": 474910,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_iso45001_인증서_전자본(화성궤도).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_iso45001_인증서_전자본(화성궤도).pdf - 465 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "465 KB",
      "sizeBytes": 476576,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1-2단계최초_2025.04_2504_qeoh_re심사보고서(화성궤도)_압축.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.04_2504_qeoh_re심사보고서(화성궤도)_압축.pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.7 MB",
      "sizeBytes": 1769080,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1차사후_2025.04_2604_qeoh_su1_심사보고서(화성궤도).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.04_2604_qeoh_su1_심사보고서(화성궤도).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.8 MB",
      "sizeBytes": 6096284,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_2504_qeoh_tr심사자료(화성궤도)_압축.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_2504_qeoh_tr심사자료(화성궤도)_압축.pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.6 MB",
      "sizeBytes": 2708547,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_iso9001_인증서_전자본(화성궤도).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_iso9001_인증서_전자본(화성궤도).pdf - 464 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "464 KB",
      "sizeBytes": 475412,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_iso14001_인증서_전자본(화성궤도).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_iso14001_인증서_전자본(화성궤도).pdf - 464 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "464 KB",
      "sizeBytes": 474910,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_iso45001_인증서_전자본(화성궤도).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_iso45001_인증서_전자본(화성궤도).pdf - 465 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "465 KB",
      "sizeBytes": 476576,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1-2단계최초_2025.04_2504_qeoh_re심사보고서(화성궤도)_압축.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.04_2504_qeoh_re심사보고서(화성궤도)_압축.pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.7 MB",
      "sizeBytes": 1769080,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1차사후_2025.04_2604_qeoh_su1_심사보고서(화성궤도).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.04_2604_qeoh_su1_심사보고서(화성궤도).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.8 MB",
      "sizeBytes": 6096284,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)디아이엔바이로": [
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1차사후_2025.04_2504_qe_su1심사보고서(디아이엔바이로).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.04_2504_qe_su1심사보고서(디아이엔바이로).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1716237,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1차사후_2025.04_2504_qe_tr_su1신청자료(디아이엔바이로).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.04_2504_qe_tr_su1신청자료(디아이엔바이로).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.3 MB",
      "sizeBytes": 4525436,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_2차사후_2025.04_2603_qe_su2_심사보고서(디아이엔바이로).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2025.04_2603_qe_su2_심사보고서(디아이엔바이로).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1261075,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1차사후_2025.04_2504_qe_su1심사보고서(디아이엔바이로).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.04_2504_qe_su1심사보고서(디아이엔바이로).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1716237,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1차사후_2025.04_2504_qe_tr_su1신청자료(디아이엔바이로).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.04_2504_qe_tr_su1신청자료(디아이엔바이로).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.3 MB",
      "sizeBytes": 4525436,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__2차사후_2025.04_2603_qe_su2_심사보고서(디아이엔바이로).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.04_2603_qe_su2_심사보고서(디아이엔바이로).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1261075,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "디아이_엔바이로": [
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1차사후_2025.04_iso9001_인증서_전자본(디아이_엔바이로).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.04_iso9001_인증서_전자본(디아이_엔바이로).pdf - 464 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "464 KB",
      "sizeBytes": 475189,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_기타_심사_담당미상_1차사후_2025.04_iso14001_인증서_전자본(디아이_엔바이로).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.04_iso14001_인증서_전자본(디아이_엔바이로).pdf - 464 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "464 KB",
      "sizeBytes": 474764,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1차사후_2025.04_iso9001_인증서_전자본(디아이_엔바이로).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.04_iso9001_인증서_전자본(디아이_엔바이로).pdf - 464 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "464 KB",
      "sizeBytes": 475189,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-04_--__심사_담당미상_--__1차사후_2025.04_iso14001_인증서_전자본(디아이_엔바이로).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.04_iso14001_인증서_전자본(디아이_엔바이로).pdf - 464 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "464 KB",
      "sizeBytes": 474764,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)리문": [
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1-2단계최초_2025.03_2503_cgmp_in신청자료(리문).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.03_2503_cgmp_in신청자료(리문).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1369757,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1-2단계최초_2025.03_2503_cgmp_in심사보고서(리문).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.03_2503_cgmp_in심사보고서(리문).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1565527,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1-2단계최초_2025.03_2503_cgmp_in신청자료(리문).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.03_2503_cgmp_in신청자료(리문).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1369757,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1-2단계최초_2025.03_2503_cgmp_in심사보고서(리문).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.03_2503_cgmp_in심사보고서(리문).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1565527,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "비케이기술(주)": [
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1-2단계최초_2025.03_2503_ohs_in심사보고서(비케이기술).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.03_2503_ohs_in심사보고서(비케이기술).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1204566,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1-2단계최초_2025.03_2503_ohs_in심사신청자료(비케이기술)_압축.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.03_2503_ohs_in심사신청자료(비케이기술)_압축.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1551706,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1-2단계최초_2025.03_iso45001_인증서_전자본(비케이기술).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.03_iso45001_인증서_전자본(비케이기술).pdf - 459 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "459 KB",
      "sizeBytes": 469630,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1차사후_2025.03_2602_ohs_su1_심사보고서(비케이기술).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.03_2602_ohs_su1_심사보고서(비케이기술).pdf - 916 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "916 KB",
      "sizeBytes": 937865,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1-2단계최초_2025.03_2503_ohs_in심사보고서(비케이기술).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.03_2503_ohs_in심사보고서(비케이기술).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1204566,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1-2단계최초_2025.03_2503_ohs_in심사신청자료(비케이기술)_압축.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.03_2503_ohs_in심사신청자료(비케이기술)_압축.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1551706,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1-2단계최초_2025.03_iso45001_인증서_전자본(비케이기술).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.03_iso45001_인증서_전자본(비케이기술).pdf - 459 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "459 KB",
      "sizeBytes": 469630,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1차사후_2025.03_2602_ohs_su1_심사보고서(비케이기술).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.03_2602_ohs_su1_심사보고서(비케이기술).pdf - 916 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "916 KB",
      "sizeBytes": 937865,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)올곧": [
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_1-2단계최초_2025.10_2511_ohs_in_심사자료(올곧).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.10_2511_ohs_in_심사자료(올곧).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.3 MB",
      "sizeBytes": 10835527,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1-2단계최초_2025.03_2503_ems_in심사보고서(올곧).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.03_2503_ems_in심사보고서(올곧).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.8 MB",
      "sizeBytes": 11368109,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1-2단계최초_2025.03_iso14001_인증서_전자본(올곧)_수정본.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.03_iso14001_인증서_전자본(올곧)_수정본.pdf - 460 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "460 KB",
      "sizeBytes": 470902,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1-2단계최초_2025.03_2503_ems_in신청자료(올곧).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.03_2503_ems_in신청자료(올곧).pdf - 16 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "16.1 MB",
      "sizeBytes": 16883300,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_기타_심사_담당미상_1차사후_2025.03_2602_ems_su1_심사보고서(올곧).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.03_2602_ems_su1_심사보고서(올곧).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.9 MB",
      "sizeBytes": 4046538,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__1-2단계최초_2025.10_2511_ohs_in_심사자료(올곧).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.10_2511_ohs_in_심사자료(올곧).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.3 MB",
      "sizeBytes": 10835527,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1-2단계최초_2025.03_2503_ems_in심사보고서(올곧).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.03_2503_ems_in심사보고서(올곧).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.8 MB",
      "sizeBytes": 11368109,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1-2단계최초_2025.03_iso14001_인증서_전자본(올곧)_수정본.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.03_iso14001_인증서_전자본(올곧)_수정본.pdf - 460 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "460 KB",
      "sizeBytes": 470902,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1-2단계최초_2025.03_2503_ems_in신청자료(올곧).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.03_2503_ems_in신청자료(올곧).pdf - 16 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "16.1 MB",
      "sizeBytes": 16883300,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-03_--__심사_담당미상_--__1차사후_2025.03_2602_ems_su1_심사보고서(올곧).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.03_2602_ems_su1_심사보고서(올곧).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.9 MB",
      "sizeBytes": 4046538,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "연태장업": [
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_2503_qe_in_심사보고서(연태장업).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_2503_qe_in_심사보고서(연태장업).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.1 MB",
      "sizeBytes": 4279861,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_2503_qe_in_심사신청자료(연태장업).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_2503_qe_in_심사신청자료(연태장업)_.pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.8 MB",
      "sizeBytes": 11375191,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_2503_qe_in_심사보고서(연태장업).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_2503_qe_in_심사보고서(연태장업).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.1 MB",
      "sizeBytes": 4279861,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_2503_qe_in_심사신청자료(연태장업).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_2503_qe_in_심사신청자료(연태장업)_.pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.8 MB",
      "sizeBytes": 11375191,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "연태장업화장용구유한공사": [
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_iso9001_인증서_전자본(연태장업화장용구유한공사).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_iso9001_인증서_전자본(연태장업화장용구유한공사).pdf - 694 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "694 KB",
      "sizeBytes": 710399,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_iso14001_인증서_전자본(연태장업화장용구유한공사).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_iso14001_인증서_전자본(연태장업화장용구유한공사).pdf - 694 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "694 KB",
      "sizeBytes": 710313,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1차사후_2025.02_2603_su1_심사보고서(연태장업화장용구유한공사).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.02_2603_su1_심사보고서(연태장업화장용구유한공사).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1575493,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_iso9001_인증서_전자본(연태장업화장용구유한공사).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_iso9001_인증서_전자본(연태장업화장용구유한공사).pdf - 694 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "694 KB",
      "sizeBytes": 710399,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_iso14001_인증서_전자본(연태장업화장용구유한공사).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_iso14001_인증서_전자본(연태장업화장용구유한공사).pdf - 694 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "694 KB",
      "sizeBytes": 710313,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1차사후_2025.02_2603_su1_심사보고서(연태장업화장용구유한공사).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.02_2603_su1_심사보고서(연태장업화장용구유한공사).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1575493,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)미래시스템": [
    {
      "fileName": "[GMSCS-REP]_2025-01_기타_심사_담당미상_1-2단계최초_2025.01_2501_갱신심사보고서(미래시스템).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.01_2501_갱신심사보고서(미래시스템).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.8 MB",
      "sizeBytes": 1929182,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_기타_심사_담당미상_1-2단계최초_2025.01_2501_전환신청자료(미래시스템).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.01_2501_전환신청자료(미래시스템).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "13.1 MB",
      "sizeBytes": 13754535,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_기타_심사_담당미상_1-2단계최초_2025.01_iso14001_인증서_전자본(미래시스템).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.01_iso14001_인증서_전자본(미래시스템).pdf - 462 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "462 KB",
      "sizeBytes": 472759,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_기타_심사_담당미상_1차사후_2025.01_2602_ems_su1_심사보고서(미래시스템).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.01_2602_ems_su1_심사보고서(미래시스템).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.2 MB",
      "sizeBytes": 3374225,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_--__심사_담당미상_--__1-2단계최초_2025.01_2501_갱신심사보고서(미래시스템).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.01_2501_갱신심사보고서(미래시스템).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.8 MB",
      "sizeBytes": 1929182,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_--__심사_담당미상_--__1-2단계최초_2025.01_2501_전환신청자료(미래시스템).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.01_2501_전환신청자료(미래시스템).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "13.1 MB",
      "sizeBytes": 13754535,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_--__심사_담당미상_--__1-2단계최초_2025.01_iso14001_인증서_전자본(미래시스템).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.01_iso14001_인증서_전자본(미래시스템).pdf - 462 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "462 KB",
      "sizeBytes": 472759,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_--__심사_담당미상_--__1차사후_2025.01_2602_ems_su1_심사보고서(미래시스템).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.01_2602_ems_su1_심사보고서(미래시스템).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.2 MB",
      "sizeBytes": 3374225,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "대찬": [
    {
      "fileName": "[GMSCS-REP]_2025-12_기타_심사_담당미상_1-2단계최초_2025.12_2512_qeo_re_심사보고서(대찬).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.12_2512_qeo_re_심사보고서(대찬).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.0 MB",
      "sizeBytes": 6274817,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-12_기타_심사_담당미상_1-2단계최초_2025.12_iso9001_인증서_전자본(대찬)_2026년01월29일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.12_iso9001_인증서_전자본(대찬)_2026년01월29일기준.pdf - 527 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "527 KB",
      "sizeBytes": 539303,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-12_기타_심사_담당미상_1-2단계최초_2025.12_iso14001_인증서_전자본(대찬)_2026년01월29일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.12_iso14001_인증서_전자본(대찬)_2026년01월29일기준.pdf - 525 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "525 KB",
      "sizeBytes": 537923,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-12_기타_심사_담당미상_1-2단계최초_2025.12_iso45001_인증서_전자본(대찬)_2026년01월29일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.12_iso45001_인증서_전자본(대찬)_2026년01월29일기준.pdf - 834 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "834 KB",
      "sizeBytes": 854301,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-12_기타_심사_담당미상_2차사후_2024.12_2501_사후2심사보고서(대찬).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.12_2501_사후2심사보고서(대찬).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1203101,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-12_기타_심사_담당미상_2차사후_2024.12_2501_전환신청자료(대찬).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.12_2501_전환신청자료(대찬).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.1 MB",
      "sizeBytes": 8514632,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-12_기타_심사_담당미상_2차사후_2024.12_iso9001_인증서_전자본(대찬).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.12_iso9001_인증서_전자본(대찬).pdf - 460 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "460 KB",
      "sizeBytes": 470790,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-12_기타_심사_담당미상_2차사후_2024.12_iso14001_인증서_전자본(대찬).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.12_iso14001_인증서_전자본(대찬).pdf - 460 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "460 KB",
      "sizeBytes": 470803,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-12_기타_심사_담당미상_2차사후_2024.12_iso45001_인증서_전자본(대찬).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.12_iso45001_인증서_전자본(대찬).pdf - 460 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "460 KB",
      "sizeBytes": 471549,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-12_--__심사_담당미상_--__1-2단계최초_2025.12_2512_qeo_re_심사보고서(대찬).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.12_2512_qeo_re_심사보고서(대찬).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.0 MB",
      "sizeBytes": 6274817,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-12_--__심사_담당미상_--__1-2단계최초_2025.12_iso9001_인증서_전자본(대찬)_2026년01월29일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.12_iso9001_인증서_전자본(대찬)_2026년01월29일기준.pdf - 527 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "527 KB",
      "sizeBytes": 539303,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-12_--__심사_담당미상_--__1-2단계최초_2025.12_iso14001_인증서_전자본(대찬)_2026년01월29일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.12_iso14001_인증서_전자본(대찬)_2026년01월29일기준.pdf - 525 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "525 KB",
      "sizeBytes": 537923,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-12_--__심사_담당미상_--__1-2단계최초_2025.12_iso45001_인증서_전자본(대찬)_2026년01월29일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.12_iso45001_인증서_전자본(대찬)_2026년01월29일기준.pdf - 834 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "834 KB",
      "sizeBytes": 854301,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-12_--__심사_담당미상_--__2차사후_2024.12_2501_사후2심사보고서(대찬).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.12_2501_사후2심사보고서(대찬).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1203101,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-12_--__심사_담당미상_--__2차사후_2024.12_2501_전환신청자료(대찬).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.12_2501_전환신청자료(대찬).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.1 MB",
      "sizeBytes": 8514632,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-12_--__심사_담당미상_--__2차사후_2024.12_iso9001_인증서_전자본(대찬).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.12_iso9001_인증서_전자본(대찬).pdf - 460 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "460 KB",
      "sizeBytes": 470790,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-12_--__심사_담당미상_--__2차사후_2024.12_iso14001_인증서_전자본(대찬).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.12_iso14001_인증서_전자본(대찬).pdf - 460 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "460 KB",
      "sizeBytes": 470803,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-12_--__심사_담당미상_--__2차사후_2024.12_iso45001_인증서_전자본(대찬).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.12_iso45001_인증서_전자본(대찬).pdf - 460 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "460 KB",
      "sizeBytes": 471549,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "한국항로표지기술원": [
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_iso9001_인증서_전자본(한국항로표지기술원)_2024년11월25일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_iso9001_인증서_전자본(한국항로표지기술원)_2024년11월25일기준.pdf - 472 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "472 KB",
      "sizeBytes": 483099,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1차사후_2024.10_2511_qms_su1_심사보고서(한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.10_2511_qms_su1_심사보고서(한국항로표지기술원).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1343462,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_2차사후_2024.10_iso45001_인증서_전자본(한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.10_iso45001_인증서_전자본(한국항로표지기술원).pdf - 484 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "484 KB",
      "sizeBytes": 495846,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_1-2단계최초_2025.10_2511_ohs_re_심사보고서(한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.10_2511_ohs_re_심사보고서(한국항로표지기술원).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.2 MB",
      "sizeBytes": 6500596,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_iso9001_인증서_전자본(한국항로표지기술원)_2024년11월25일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_iso9001_인증서_전자본(한국항로표지기술원)_2024년11월25일기준.pdf - 472 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "472 KB",
      "sizeBytes": 483099,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1차사후_2024.10_2511_qms_su1_심사보고서(한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.10_2511_qms_su1_심사보고서(한국항로표지기술원).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1343462,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__2차사후_2024.10_iso45001_인증서_전자본(한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.10_iso45001_인증서_전자본(한국항로표지기술원).pdf - 484 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "484 KB",
      "sizeBytes": 495846,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__1-2단계최초_2025.10_2511_ohs_re_심사보고서(한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.10_2511_ohs_re_심사보고서(한국항로표지기술원).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.2 MB",
      "sizeBytes": 6500596,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "q-한국항로표지기술원": [
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_전환신청자료(q-한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_전환신청자료(q-한국항로표지기술원).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.3 MB",
      "sizeBytes": 6649929,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_갱신심사자료(q-한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_갱신심사자료(q-한국항로표지기술원).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 2024316,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_전환신청자료(q-한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_전환신청자료(q-한국항로표지기술원).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.3 MB",
      "sizeBytes": 6649929,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_갱신심사자료(q-한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_갱신심사자료(q-한국항로표지기술원).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 2024316,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "oh-한국항로표지기술원": [
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_2차사후_2024.10_전환신청자료(oh-한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.10_전환신청자료(oh-한국항로표지기술원).pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.8 MB",
      "sizeBytes": 7108809,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_2차사후_2024.10_사후심사자료(oh-한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.10_사후심사자료(oh-한국항로표지기술원).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 1991241,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__2차사후_2024.10_전환신청자료(oh-한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.10_전환신청자료(oh-한국항로표지기술원).pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.8 MB",
      "sizeBytes": 7108809,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__2차사후_2024.10_사후심사자료(oh-한국항로표지기술원).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.10_사후심사자료(oh-한국항로표지기술원).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 1991241,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "휴온스_제천공장": [
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_iso45001_인증서_전자본(휴온스_제천공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_iso45001_인증서_전자본(휴온스_제천공장).pdf - 462 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "462 KB",
      "sizeBytes": 472802,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_iso45001_인증서_전자본(휴온스_제천공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_iso45001_인증서_전자본(휴온스_제천공장).pdf - 462 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "462 KB",
      "sizeBytes": 472802,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "휴온스공장": [
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_갱신심사자료(휴온스공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_갱신심사자료(휴온스공장).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1420351,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_전환신청자료(휴온스공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_전환신청자료(휴온스공장).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.1 MB",
      "sizeBytes": 8499212,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_갱신심사자료(휴온스공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_갱신심사자료(휴온스공장).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1420351,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_전환신청자료(휴온스공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_전환신청자료(휴온스공장).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.1 MB",
      "sizeBytes": 8499212,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)휴온스": [
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1차사후_2024.10_2512_ohs_su1_심사보고서(휴온스).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.10_2512_ohs_su1_심사보고서(휴온스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1193453,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1차사후_2024.10_2512_ohs_su1_심사보고서(휴온스).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.10_2512_ohs_su1_심사보고서(휴온스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1193453,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)휴온스바이오파마": [
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_iso45001_인증서_전자본(휴온스바이오파마).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_iso45001_인증서_전자본(휴온스바이오파마).pdf - 469 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "469 KB",
      "sizeBytes": 480259,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1차사후_2024.10_2512_ohs_su1_심사보고서(휴온스바이오파마).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.10_2512_ohs_su1_심사보고서(휴온스바이오파마).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1228002,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_iso45001_인증서_전자본(휴온스바이오파마).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_iso45001_인증서_전자본(휴온스바이오파마).pdf - 469 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "469 KB",
      "sizeBytes": 480259,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1차사후_2024.10_2512_ohs_su1_심사보고서(휴온스바이오파마).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.10_2512_ohs_su1_심사보고서(휴온스바이오파마).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1228002,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "휴파마": [
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_갱신심사자료(휴파마).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_갱신심사자료(휴파마).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.7 MB",
      "sizeBytes": 1740085,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_전환신청자료(휴파마)_small.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_전환신청자료(휴파마)_small.pdf - 25 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "24.8 MB",
      "sizeBytes": 26054695,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_갱신심사자료(휴파마).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_갱신심사자료(휴파마).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.7 MB",
      "sizeBytes": 1740085,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_전환신청자료(휴파마)_small.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_전환신청자료(휴파마)_small.pdf - 25 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "24.8 MB",
      "sizeBytes": 26054695,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)성남씨앤씨": [
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_2410_최초신청자료(성남씨앤씨).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_2410_최초신청자료(성남씨앤씨).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.7 MB",
      "sizeBytes": 13340368,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_2410_최초심사보고서(성남씨앤씨).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_2410_최초심사보고서(성남씨앤씨).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "11.2 MB",
      "sizeBytes": 11719647,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1-2단계최초_2024.10_iso45001_인증서_전자본(성남씨앤씨).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.10_iso45001_인증서_전자본(성남씨앤씨).pdf - 462 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "462 KB",
      "sizeBytes": 472848,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_기타_심사_담당미상_1차사후_2024.10_2510_ohs_su1_심사보고서(성남씨앤씨).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.10_2510_ohs_su1_심사보고서(성남씨앤씨).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "7.9 MB",
      "sizeBytes": 8334923,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_2410_최초신청자료(성남씨앤씨).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_2410_최초신청자료(성남씨앤씨).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.7 MB",
      "sizeBytes": 13340368,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_2410_최초심사보고서(성남씨앤씨).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_2410_최초심사보고서(성남씨앤씨).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "11.2 MB",
      "sizeBytes": 11719647,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1-2단계최초_2024.10_iso45001_인증서_전자본(성남씨앤씨).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.10_iso45001_인증서_전자본(성남씨앤씨).pdf - 462 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "462 KB",
      "sizeBytes": 472848,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-10_--__심사_담당미상_--__1차사후_2024.10_2510_ohs_su1_심사보고서(성남씨앤씨).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.10_2510_ohs_su1_심사보고서(성남씨앤씨).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "7.9 MB",
      "sizeBytes": 8334923,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)청운테크": [
    {
      "fileName": "[GMSCS-REP]_2024-09_기타_심사_담당미상_1-2단계최초_2024.09_2409_최초신청자료(청운테크).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.09_2409_최초신청자료(청운테크).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "9.6 MB",
      "sizeBytes": 10074987,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-09_기타_심사_담당미상_1-2단계최초_2024.09_2409_최초심사보고서(청운테크).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.09_2409_최초심사보고서(청운테크).pdf - 19 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "18.7 MB",
      "sizeBytes": 19642678,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-09_기타_심사_담당미상_1-2단계최초_2024.09_iso45001_인증서_전자본(청운테크).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.09_iso45001_인증서_전자본(청운테크).pdf - 460 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "460 KB",
      "sizeBytes": 471374,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-09_기타_심사_담당미상_1차사후_2024.09_2509_ohs_su1_심사보고서(청운테크).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.09_2509_ohs_su1_심사보고서(청운테크).pdf - 9 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.9 MB",
      "sizeBytes": 9329263,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-09_--__심사_담당미상_--__1-2단계최초_2024.09_2409_최초신청자료(청운테크).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.09_2409_최초신청자료(청운테크).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "9.6 MB",
      "sizeBytes": 10074987,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-09_--__심사_담당미상_--__1-2단계최초_2024.09_2409_최초심사보고서(청운테크).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.09_2409_최초심사보고서(청운테크).pdf - 19 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "18.7 MB",
      "sizeBytes": 19642678,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-09_--__심사_담당미상_--__1-2단계최초_2024.09_iso45001_인증서_전자본(청운테크).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.09_iso45001_인증서_전자본(청운테크).pdf - 460 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "460 KB",
      "sizeBytes": 471374,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-09_--__심사_담당미상_--__1차사후_2024.09_2509_ohs_su1_심사보고서(청운테크).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.09_2509_ohs_su1_심사보고서(청운테크).pdf - 9 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.9 MB",
      "sizeBytes": 9329263,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)위드인": [
    {
      "fileName": "[GMSCS-REP]_2025-01_기타_심사_담당미상_1-2단계최초_2025.01_iso45001_인증서_전자본(위드인)_2025년03월04일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.01_iso45001_인증서_전자본(위드인)_2025년03월04일기준.pdf - 470 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "470 KB",
      "sizeBytes": 481513,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_기타_심사_담당미상_1-2단계최초_2025.01_2408_qoh_전환자료(위드인).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.01_2408_qoh_전환자료(위드인).pdf - 20 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "19.6 MB",
      "sizeBytes": 20585867,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_기타_심사_담당미상_1-2단계최초_2025.01_2502_qoh_갱신심사보고서(위드인).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.01_2502_qoh_갱신심사보고서(위드인).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1437863,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_기타_심사_담당미상_1-2단계최초_2025.01_iso9001_인증서_전자본(위드인)_2025년03월04일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.01_iso9001_인증서_전자본(위드인)_2025년03월04일기준.pdf - 469 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "469 KB",
      "sizeBytes": 480443,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_--__심사_담당미상_--__1-2단계최초_2025.01_iso45001_인증서_전자본(위드인)_2025년03월04일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.01_iso45001_인증서_전자본(위드인)_2025년03월04일기준.pdf - 470 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "470 KB",
      "sizeBytes": 481513,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_--__심사_담당미상_--__1-2단계최초_2025.01_2408_qoh_전환자료(위드인).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.01_2408_qoh_전환자료(위드인).pdf - 20 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "19.6 MB",
      "sizeBytes": 20585867,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_--__심사_담당미상_--__1-2단계최초_2025.01_2502_qoh_갱신심사보고서(위드인).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.01_2502_qoh_갱신심사보고서(위드인).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1437863,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-01_--__심사_담당미상_--__1-2단계최초_2025.01_iso9001_인증서_전자본(위드인)_2025년03월04일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.01_iso9001_인증서_전자본(위드인)_2025년03월04일기준.pdf - 469 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "469 KB",
      "sizeBytes": 480443,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "수영전자": [
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_2차사후_2024.08_2408_사후심사보고서(수영전자).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.08_2408_사후심사보고서(수영전자).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.7 MB",
      "sizeBytes": 1797828,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_2차사후_2024.08_2408_전환신청자료(수영전자).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.08_2408_전환신청자료(수영전자).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.4 MB",
      "sizeBytes": 10879174,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_기타_심사_담당미상_1-2단계최초_2025.06_2508_qe_re_심사자료(수영전자).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.06_2508_qe_re_심사자료(수영전자).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.4 MB",
      "sizeBytes": 5643200,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__2차사후_2024.08_2408_사후심사보고서(수영전자).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.08_2408_사후심사보고서(수영전자).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.7 MB",
      "sizeBytes": 1797828,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__2차사후_2024.08_2408_전환신청자료(수영전자).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.08_2408_전환신청자료(수영전자).pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.4 MB",
      "sizeBytes": 10879174,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__1-2단계최초_2025.06_2508_qe_re_심사자료(수영전자).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.06_2508_qe_re_심사자료(수영전자).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.4 MB",
      "sizeBytes": 5643200,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "수영전자심천": [
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_2차사후_2024.08_iso9001_인증서_전자본(수영전자(심천)유한공사).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.08_iso9001_인증서_전자본(수영전자(심천)유한공사).pdf - 727 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "727 KB",
      "sizeBytes": 744643,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_2차사후_2024.08_iso14001_인증서_전자본(수영전자(심천)유한공사).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.08_iso14001_인증서_전자본(수영전자(심천)유한공사).pdf - 475 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "475 KB",
      "sizeBytes": 486299,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__2차사후_2024.08_iso9001_인증서_전자본(수영전자(심천)유한공사).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.08_iso9001_인증서_전자본(수영전자(심천)유한공사).pdf - 727 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "727 KB",
      "sizeBytes": 744643,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__2차사후_2024.08_iso14001_인증서_전자본(수영전자(심천)유한공사).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.08_iso14001_인증서_전자본(수영전자(심천)유한공사).pdf - 475 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "475 KB",
      "sizeBytes": 486299,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)유닛컴퍼니": [
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_1-2단계최초_2024.08_2408_최초신청자료(유닛컴퍼니).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.08_2408_최초신청자료(유닛컴퍼니).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.4 MB",
      "sizeBytes": 2543459,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_1-2단계최초_2024.08_2408_최초심사보고서(유닛컴퍼니).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.08_2408_최초심사보고서(유닛컴퍼니).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 2031897,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_1-2단계최초_2024.08_iso9001_인증서_전자본(유닛컴퍼니).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.08_iso9001_인증서_전자본(유닛컴퍼니).pdf - 986 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "986 KB",
      "sizeBytes": 1009560,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_1-2단계최초_2024.08_iso14001_인증서_전자본(유닛컴퍼니).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.08_iso14001_인증서_전자본(유닛컴퍼니).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1299478,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_1차사후_2024.08_2508_qe_su1_심사보고서_(유닛컴퍼니).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.08_2508_qe_su1_심사보고서_(유닛컴퍼니).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.7 MB",
      "sizeBytes": 1734232,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1-2단계최초_2024.08_2408_최초신청자료(유닛컴퍼니).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.08_2408_최초신청자료(유닛컴퍼니).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.4 MB",
      "sizeBytes": 2543459,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1-2단계최초_2024.08_2408_최초심사보고서(유닛컴퍼니).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.08_2408_최초심사보고서(유닛컴퍼니).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 2031897,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1-2단계최초_2024.08_iso9001_인증서_전자본(유닛컴퍼니).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.08_iso9001_인증서_전자본(유닛컴퍼니).pdf - 986 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "986 KB",
      "sizeBytes": 1009560,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1-2단계최초_2024.08_iso14001_인증서_전자본(유닛컴퍼니).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.08_iso14001_인증서_전자본(유닛컴퍼니).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1299478,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1차사후_2024.08_2508_qe_su1_심사보고서_(유닛컴퍼니).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.08_2508_qe_su1_심사보고서_(유닛컴퍼니).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.7 MB",
      "sizeBytes": 1734232,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "케이엠텍주식회사": [
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1차사후_2024.07_2407_사후심사보고서(케이엠텍).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.07_2407_사후심사보고서(케이엠텍).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.0 MB",
      "sizeBytes": 1074360,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1차사후_2024.07_2407_전환신청자료(케이엠텍).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.07_2407_전환신청자료(케이엠텍).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.8 MB",
      "sizeBytes": 4021656,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1차사후_2024.07_iso9001_인증서_전자본(케이엠텍주식회사).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.07_iso9001_인증서_전자본(케이엠텍주식회사).pdf - 492 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "492 KB",
      "sizeBytes": 503744,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_2차사후_2024.07_2507_qms_su2_심사보고서(케이엠텍).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.07_2507_qms_su2_심사보고서(케이엠텍).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1601977,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1차사후_2024.07_2407_사후심사보고서(케이엠텍).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.07_2407_사후심사보고서(케이엠텍).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.0 MB",
      "sizeBytes": 1074360,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1차사후_2024.07_2407_전환신청자료(케이엠텍).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.07_2407_전환신청자료(케이엠텍).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.8 MB",
      "sizeBytes": 4021656,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1차사후_2024.07_iso9001_인증서_전자본(케이엠텍주식회사).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.07_iso9001_인증서_전자본(케이엠텍주식회사).pdf - 492 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "492 KB",
      "sizeBytes": 503744,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__2차사후_2024.07_2507_qms_su2_심사보고서(케이엠텍).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.07_2507_qms_su2_심사보고서(케이엠텍).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1601977,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "인성피앤씨주식회사": [
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_2408_전환신청자료(인성피앤씨).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_2408_전환신청자료(인성피앤씨).pdf - 27 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "26.7 MB",
      "sizeBytes": 28005136,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_2408_갱신심사보고서(인성피앤씨).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_2408_갱신심사보고서(인성피앤씨).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.2 MB",
      "sizeBytes": 8641162,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_iso9001_인증서_전자본(인성피앤씨).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_iso9001_인증서_전자본(인성피앤씨).pdf - 759 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "759 KB",
      "sizeBytes": 776957,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1차사후_2024.07_2507_qms_su1_심사보고서(인성피앤씨).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.07_2507_qms_su1_심사보고서(인성피앤씨).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1367869,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_2408_전환신청자료(인성피앤씨).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_2408_전환신청자료(인성피앤씨).pdf - 27 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "26.7 MB",
      "sizeBytes": 28005136,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_2408_갱신심사보고서(인성피앤씨).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_2408_갱신심사보고서(인성피앤씨).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.2 MB",
      "sizeBytes": 8641162,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_iso9001_인증서_전자본(인성피앤씨).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_iso9001_인증서_전자본(인성피앤씨).pdf - 759 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "759 KB",
      "sizeBytes": 776957,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1차사후_2024.07_2507_qms_su1_심사보고서(인성피앤씨).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.07_2507_qms_su1_심사보고서(인성피앤씨).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1367869,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)민성": [
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_2408_갱신심사보고서(민성)_qoh.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_2408_갱신심사보고서(민성)_qoh.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1249140,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_iso9001_인증서_전자본(민성).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_iso9001_인증서_전자본(민성).pdf - 505 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "505 KB",
      "sizeBytes": 516980,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_2406_전환신청자료(민성)_qoh.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_2406_전환신청자료(민성)_qoh.pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.6 MB",
      "sizeBytes": 6934559,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1차사후_2024.07_2508_qeo_su1_심사보고서(민성).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.07_2508_qeo_su1_심사보고서(민성)_.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1252214,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_iso45001_인증서_전자본(민성).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_iso45001_인증서_전자본(민성).pdf - 505 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "505 KB",
      "sizeBytes": 516754,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_2408_최초심사보고서(민성)_ems.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_2408_최초심사보고서(민성)_ems.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1229905,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_2408_최초신청자료(민성)_ems.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_2408_최초신청자료(민성)_ems.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1500544,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_iso14001_인증서_전자본(민성).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_iso14001_인증서_전자본(민성).pdf - 504 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "504 KB",
      "sizeBytes": 516101,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_2408_갱신심사보고서(민성)_qoh.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_2408_갱신심사보고서(민성)_qoh.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1249140,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_iso9001_인증서_전자본(민성).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_iso9001_인증서_전자본(민성).pdf - 505 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "505 KB",
      "sizeBytes": 516980,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_2406_전환신청자료(민성)_qoh.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_2406_전환신청자료(민성)_qoh.pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.6 MB",
      "sizeBytes": 6934559,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1차사후_2024.07_2508_qeo_su1_심사보고서(민성).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.07_2508_qeo_su1_심사보고서(민성)_.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1252214,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_iso45001_인증서_전자본(민성).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_iso45001_인증서_전자본(민성).pdf - 505 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "505 KB",
      "sizeBytes": 516754,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_2408_최초심사보고서(민성)_ems.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_2408_최초심사보고서(민성)_ems.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1229905,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_2408_최초신청자료(민성)_ems.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_2408_최초신청자료(민성)_ems.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1500544,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_iso14001_인증서_전자본(민성).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_iso14001_인증서_전자본(민성).pdf - 504 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "504 KB",
      "sizeBytes": 516101,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "명화공업(주)": [
    {
      "fileName": "[GMSCS-REP]_2024-06_기타_심사_담당미상_2차사후_2024.06_iso45001_인증서_전자본(명화공업)_오타교정본.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.06_iso45001_인증서_전자본(명화공업)_오타교정본.pdf - 495 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "495 KB",
      "sizeBytes": 507058,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_1-2단계최초_2024.08_2410_갱신사후2심사보고서(명화공업).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.08_2410_갱신사후2심사보고서(명화공업).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1648436,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_1-2단계최초_2024.08_iso14001_인증서_전자본(명화공업)_2024년11월04일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.08_iso14001_인증서_전자본(명화공업)_2024년11월04일기준.pdf - 485 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "485 KB",
      "sizeBytes": 496267,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_1-2단계최초_2024.08_2408_전환신청자료(명화공업)_eoh.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.08_2408_전환신청자료(명화공업)_eoh.pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.2 MB",
      "sizeBytes": 10696557,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_기타_심사_담당미상_1차사후_2024.08_2510_eoh_su1_re_심사보고서(명화공업).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.08_2510_eoh_su1_re_심사보고서(명화공업).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.5 MB",
      "sizeBytes": 3654242,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1-2단계최초_2025.09_iso45001_인증서_전자본(명화공업)_2025년10월27일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.09_iso45001_인증서_전자본(명화공업)_2025년10월27일기준.pdf - 563 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "563 KB",
      "sizeBytes": 576017,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-06_--__심사_담당미상_--__2차사후_2024.06_iso45001_인증서_전자본(명화공업)_오타교정본.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.06_iso45001_인증서_전자본(명화공업)_오타교정본.pdf - 495 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "495 KB",
      "sizeBytes": 507058,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1-2단계최초_2024.08_2410_갱신사후2심사보고서(명화공업).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.08_2410_갱신사후2심사보고서(명화공업).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1648436,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1-2단계최초_2024.08_iso14001_인증서_전자본(명화공업)_2024년11월04일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.08_iso14001_인증서_전자본(명화공업)_2024년11월04일기준.pdf - 485 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "485 KB",
      "sizeBytes": 496267,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1-2단계최초_2024.08_2408_전환신청자료(명화공업)_eoh.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.08_2408_전환신청자료(명화공업)_eoh.pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.2 MB",
      "sizeBytes": 10696557,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1차사후_2024.08_2510_eoh_su1_re_심사보고서(명화공업).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.08_2510_eoh_su1_re_심사보고서(명화공업).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.5 MB",
      "sizeBytes": 3654242,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1-2단계최초_2025.09_iso45001_인증서_전자본(명화공업)_2025년10월27일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.09_iso45001_인증서_전자본(명화공업)_2025년10월27일기준.pdf - 563 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "563 KB",
      "sizeBytes": 576017,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)케이원메탈1공장": [
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_1-2단계최초_2025.10_esg-ms_인증서_전자본(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.10_esg-ms_인증서_전자본(케이원메탈1공장).pdf - 489 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "489 KB",
      "sizeBytes": 500926,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_iso45001_인증서_전자본(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_iso45001_인증서_전자본(케이원메탈1공장).pdf - 508 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "508 KB",
      "sizeBytes": 520133,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_2차사후_2024.07_iso45001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.07_iso45001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf - 505 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "505 KB",
      "sizeBytes": 517377,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_iso9001_인증서_전자본(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_iso9001_인증서_전자본(케이원메탈1공장).pdf - 507 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "507 KB",
      "sizeBytes": 518669,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_iso14001_인증서_전자본(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_iso14001_인증서_전자본(케이원메탈1공장).pdf - 506 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "506 KB",
      "sizeBytes": 518148,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1차사후_2024.05_2506_qeoh_su1심사보고서(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.05_2506_qeoh_su1심사보고서(케이원메탈1공장).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1715403,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_2차사후_2024.05_2606_qeo_su2_심사보고서(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.05_2606_qeo_su2_심사보고서(케이원메탈1공장).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1467866,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_2차사후_2024.05_iso9001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.05_iso9001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf - 504 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "504 KB",
      "sizeBytes": 515617,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_2차사후_2024.05_iso14001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.05_iso14001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf - 501 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "501 KB",
      "sizeBytes": 513471,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__1-2단계최초_2025.10_esg-ms_인증서_전자본(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.10_esg-ms_인증서_전자본(케이원메탈1공장).pdf - 489 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "489 KB",
      "sizeBytes": 500926,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_iso45001_인증서_전자본(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_iso45001_인증서_전자본(케이원메탈1공장).pdf - 508 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "508 KB",
      "sizeBytes": 520133,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__2차사후_2024.07_iso45001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.07_iso45001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf - 505 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "505 KB",
      "sizeBytes": 517377,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_iso9001_인증서_전자본(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_iso9001_인증서_전자본(케이원메탈1공장).pdf - 507 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "507 KB",
      "sizeBytes": 518669,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_iso14001_인증서_전자본(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_iso14001_인증서_전자본(케이원메탈1공장).pdf - 506 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "506 KB",
      "sizeBytes": 518148,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1차사후_2024.05_2506_qeoh_su1심사보고서(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.05_2506_qeoh_su1심사보고서(케이원메탈1공장).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1715403,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__2차사후_2024.05_2606_qeo_su2_심사보고서(케이원메탈1공장).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.05_2606_qeo_su2_심사보고서(케이원메탈1공장).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1467866,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__2차사후_2024.05_iso9001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.05_iso9001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf - 504 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "504 KB",
      "sizeBytes": 515617,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__2차사후_2024.05_iso14001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.05_iso14001_인증서_전자본(케이원메탈1공장)_기업영문명수정.pdf - 501 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "501 KB",
      "sizeBytes": 513471,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "케이원1공장ohs": [
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_2407_최초신청자료(케이원1공장ohs).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_2407_최초신청자료(케이원1공장ohs).pdf - 853 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "853 KB",
      "sizeBytes": 873643,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_2407_최초심사보고서(케이원1공장ohs).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_2407_최초심사보고서(케이원1공장ohs).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1447326,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_2407_최초신청자료(케이원1공장ohs).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_2407_최초신청자료(케이원1공장ohs).pdf - 853 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "853 KB",
      "sizeBytes": 873643,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_2407_최초심사보고서(케이원1공장ohs).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_2407_최초심사보고서(케이원1공장ohs).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1447326,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "케이원1공장": [
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_신청자료(케이원1공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_신청자료(케이원1공장).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.4 MB",
      "sizeBytes": 4594400,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_심사자료(케이원1공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_심사자료(케이원1공장).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.0 MB",
      "sizeBytes": 1096970,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_신청자료(케이원1공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_신청자료(케이원1공장).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.4 MB",
      "sizeBytes": 4594400,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_심사자료(케이원1공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_심사자료(케이원1공장).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.0 MB",
      "sizeBytes": 1096970,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "케이원2공장qe": [
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_2404_최초신청자료(케이원2공장qe).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_2404_최초신청자료(케이원2공장qe).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1692238,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_2404_최초심사보고서(케이원2공장qe).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_2404_최초심사보고서(케이원2공장qe).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1532778,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_2404_최초신청자료(케이원2공장qe).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_2404_최초신청자료(케이원2공장qe).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1692238,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_2404_최초심사보고서(케이원2공장qe).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_2404_최초심사보고서(케이원2공장qe).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1532778,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "케이원메탈제2공장": [
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_iso9001_인증서_전자본(케이원메탈제2공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_iso9001_인증서_전자본(케이원메탈제2공장).pdf - 463 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "463 KB",
      "sizeBytes": 474034,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_iso14001_인증서_전자본(케이원메탈제2공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_iso14001_인증서_전자본(케이원메탈제2공장).pdf - 506 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "506 KB",
      "sizeBytes": 517856,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_iso9001_인증서_전자본(케이원메탈제2공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_iso9001_인증서_전자본(케이원메탈제2공장).pdf - 463 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "463 KB",
      "sizeBytes": 474034,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_iso14001_인증서_전자본(케이원메탈제2공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_iso14001_인증서_전자본(케이원메탈제2공장).pdf - 506 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "506 KB",
      "sizeBytes": 517856,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "케이원메탈": [
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1차사후_2024.05_2506_qeoh_su1심사보고서(케이원메탈).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.05_2506_qeoh_su1심사보고서(케이원메탈).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1577089,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1차사후_2024.05_2506_qeoh_su1심사보고서(케이원메탈).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.05_2506_qeoh_su1심사보고서(케이원메탈).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1577089,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)케이원메탈2공장": [
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_2차사후_2024.05_2606_qeoh_su2_심사보고서(케이원메탈2공장).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.05_2606_qeoh_su2_심사보고서(케이원메탈2공장).pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "7.3 MB",
      "sizeBytes": 7649821,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_2차사후_2024.05_iso9001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.05_iso9001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf - 503 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "503 KB",
      "sizeBytes": 515512,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_2차사후_2024.05_iso14001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.05_iso14001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf - 501 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "501 KB",
      "sizeBytes": 513227,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_iso45001_인증서_전자본(케이원메탈2공장).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_iso45001_인증서_전자본(케이원메탈2공장).pdf - 507 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "507 KB",
      "sizeBytes": 518674,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_2차사후_2024.07_iso45001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.07_iso45001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf - 506 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "506 KB",
      "sizeBytes": 517719,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__2차사후_2024.05_2606_qeoh_su2_심사보고서(케이원메탈2공장).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.05_2606_qeoh_su2_심사보고서(케이원메탈2공장).pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "7.3 MB",
      "sizeBytes": 7649821,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__2차사후_2024.05_iso9001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.05_iso9001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf - 503 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "503 KB",
      "sizeBytes": 515512,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__2차사후_2024.05_iso14001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.05_iso14001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf - 501 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "501 KB",
      "sizeBytes": 513227,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_iso45001_인증서_전자본(케이원메탈2공장).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_iso45001_인증서_전자본(케이원메탈2공장).pdf - 507 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "507 KB",
      "sizeBytes": 518674,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__2차사후_2024.07_iso45001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.07_iso45001_인증서_전자본(케이원메탈2공장)_2026년06월22일기준.pdf - 506 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "506 KB",
      "sizeBytes": 517719,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "케이원2공장ohs": [
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_2407_최초신청자료(케이원2공장ohs).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_2407_최초신청자료(케이원2공장ohs).pdf - 638 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "638 KB",
      "sizeBytes": 652928,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_기타_심사_담당미상_1-2단계최초_2024.07_2407_최초심사보고서(케이원2공장ohs).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.07_2407_최초심사보고서(케이원2공장ohs).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1466178,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_2407_최초신청자료(케이원2공장ohs).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_2407_최초신청자료(케이원2공장ohs).pdf - 638 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "638 KB",
      "sizeBytes": 652928,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-07_--__심사_담당미상_--__1-2단계최초_2024.07_2407_최초심사보고서(케이원2공장ohs).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.07_2407_최초심사보고서(케이원2공장ohs).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1466178,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)대명기술": [
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_iso45001_인증서_전자본(대명기술).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_iso45001_인증서_전자본(대명기술).pdf - 491 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "491 KB",
      "sizeBytes": 503206,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_신청자료(대명기술).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_신청자료(대명기술).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.2 MB",
      "sizeBytes": 4368217,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_심사자료(대명기술).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_심사자료(대명기술).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1270714,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1차사후_2024.05_2503_su1_심사보고서(대명기술).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.05_2503_su1_심사보고서(대명기술).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.0 MB",
      "sizeBytes": 1100100,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_2차사후_2024.05_2602_ohs_su2_심사보고서(대명기술).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.05_2602_ohs_su2_심사보고서(대명기술).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1019 KB",
      "sizeBytes": 1043002,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_iso45001_인증서_전자본(대명기술).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_iso45001_인증서_전자본(대명기술).pdf - 491 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "491 KB",
      "sizeBytes": 503206,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_신청자료(대명기술).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_신청자료(대명기술).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.2 MB",
      "sizeBytes": 4368217,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_심사자료(대명기술).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_심사자료(대명기술).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1270714,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1차사후_2024.05_2503_su1_심사보고서(대명기술).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.05_2503_su1_심사보고서(대명기술).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.0 MB",
      "sizeBytes": 1100100,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__2차사후_2024.05_2602_ohs_su2_심사보고서(대명기술).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.05_2602_ohs_su2_심사보고서(대명기술).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1019 KB",
      "sizeBytes": 1043002,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "혜서산업(주)": [
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_iso45001_인증서_전자본(혜서산업).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_iso45001_인증서_전자본(혜서산업).pdf - 503 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "503 KB",
      "sizeBytes": 515130,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_신청자료(혜서산업).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_신청자료(혜서산업).pdf - 9 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.8 MB",
      "sizeBytes": 9175382,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_심사자료(혜서산업).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_심사자료(혜서산업).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.1 MB",
      "sizeBytes": 6383241,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1차사후_2024.05_2504_ohs_su1심사보고서(혜서산업).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.05_2504_ohs_su1심사보고서(혜서산업).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.6 MB",
      "sizeBytes": 4791386,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_2차사후_2024.05_2604_ohs_su2_심사보고서(혜서산업).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.05_2604_ohs_su2_심사보고서(혜서산업).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.5 MB",
      "sizeBytes": 3670855,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_iso45001_인증서_전자본(혜서산업).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_iso45001_인증서_전자본(혜서산업).pdf - 503 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "503 KB",
      "sizeBytes": 515130,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_신청자료(혜서산업).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_신청자료(혜서산업).pdf - 9 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.8 MB",
      "sizeBytes": 9175382,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_심사자료(혜서산업).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_심사자료(혜서산업).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.1 MB",
      "sizeBytes": 6383241,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1차사후_2024.05_2504_ohs_su1심사보고서(혜서산업).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.05_2504_ohs_su1심사보고서(혜서산업).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.6 MB",
      "sizeBytes": 4791386,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__2차사후_2024.05_2604_ohs_su2_심사보고서(혜서산업).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.05_2604_ohs_su2_심사보고서(혜서산업).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.5 MB",
      "sizeBytes": 3670855,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "유니퀘스트": [
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_iso45001_인증서_전자본(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_iso45001_인증서_전자본(유니퀘스트).pdf - 533 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "533 KB",
      "sizeBytes": 545393,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_iso9001_인증서_전자본(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_iso9001_인증서_전자본(유니퀘스트).pdf - 532 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "532 KB",
      "sizeBytes": 544900,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_신청자료(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_신청자료(유니퀘스트).pdf - 12 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "11.6 MB",
      "sizeBytes": 12115866,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_심사자료(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_심사자료(유니퀘스트).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 2000678,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1차사후_2024.05_2505_qeoh_su1심사보고서(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.05_2505_qeoh_su1심사보고서(유니퀘스트).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.8 MB",
      "sizeBytes": 1894750,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_2차사후_2024.05_2606_qeo_su2_심사보고서(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.05_2606_qeo_su2_심사보고서(유니퀘스트).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1281231,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_기타_심사_담당미상_1-2단계최초_2024.05_iso14001_인증서_전자본(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.05_iso14001_인증서_전자본(유니퀘스트).pdf - 532 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "532 KB",
      "sizeBytes": 544386,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_iso45001_인증서_전자본(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_iso45001_인증서_전자본(유니퀘스트).pdf - 533 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "533 KB",
      "sizeBytes": 545393,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_iso9001_인증서_전자본(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_iso9001_인증서_전자본(유니퀘스트).pdf - 532 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "532 KB",
      "sizeBytes": 544900,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_신청자료(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_신청자료(유니퀘스트).pdf - 12 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "11.6 MB",
      "sizeBytes": 12115866,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_심사자료(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_심사자료(유니퀘스트).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.9 MB",
      "sizeBytes": 2000678,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1차사후_2024.05_2505_qeoh_su1심사보고서(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.05_2505_qeoh_su1심사보고서(유니퀘스트).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.8 MB",
      "sizeBytes": 1894750,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__2차사후_2024.05_2606_qeo_su2_심사보고서(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.05_2606_qeo_su2_심사보고서(유니퀘스트).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1281231,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-05_--__심사_담당미상_--__1-2단계최초_2024.05_iso14001_인증서_전자본(유니퀘스트).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.05_iso14001_인증서_전자본(유니퀘스트).pdf - 532 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "532 KB",
      "sizeBytes": 544386,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "시앤파워텍(주)": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_iso14001_인증서_전자본(시앤파워텍).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_iso14001_인증서_전자본(시앤파워텍).pdf - 516 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "516 KB",
      "sizeBytes": 528043,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_iso9001_인증서_전자본(시앤파워텍).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_iso9001_인증서_전자본(시앤파워텍).pdf - 516 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "516 KB",
      "sizeBytes": 528580,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1차사후_2024.04_2506_qeo_su1(시앤파워텍).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.04_2506_qeo_su1(시앤파워텍).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.0 MB",
      "sizeBytes": 2076165,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_2606_qeo_su2_심사보고서(시앤파워텍).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_2606_qeo_su2_심사보고서(시앤파워텍).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.5 MB",
      "sizeBytes": 4711081,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_iso45001_인증서_전자본(시앤파워텍).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_iso45001_인증서_전자본(시앤파워텍).pdf - 516 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "516 KB",
      "sizeBytes": 528599,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_iso14001_인증서_전자본(시앤파워텍).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_iso14001_인증서_전자본(시앤파워텍).pdf - 516 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "516 KB",
      "sizeBytes": 528043,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_iso9001_인증서_전자본(시앤파워텍).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_iso9001_인증서_전자본(시앤파워텍).pdf - 516 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "516 KB",
      "sizeBytes": 528580,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1차사후_2024.04_2506_qeo_su1(시앤파워텍).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.04_2506_qeo_su1(시앤파워텍).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.0 MB",
      "sizeBytes": 2076165,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_2606_qeo_su2_심사보고서(시앤파워텍).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_2606_qeo_su2_심사보고서(시앤파워텍).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.5 MB",
      "sizeBytes": 4711081,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_iso45001_인증서_전자본(시앤파워텍).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_iso45001_인증서_전자본(시앤파워텍).pdf - 516 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "516 KB",
      "sizeBytes": 528599,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "시앤에스": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_신청자료(시앤에스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_신청자료(시앤에스).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.6 MB",
      "sizeBytes": 3730026,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_심사자료(시앤에스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_심사자료(시앤에스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1244138,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_신청자료(시앤에스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_신청자료(시앤에스).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.6 MB",
      "sizeBytes": 3730026,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_심사자료(시앤에스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_심사자료(시앤에스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1244138,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "상호변경": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_2408_qeo_cs(상호변경).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_2408_qeo_cs(상호변경).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1670949,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_2408_qeo_cs(상호변경).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_2408_qeo_cs(상호변경).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1670949,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)에스얜에스": [
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_iso14001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_iso14001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf - 482 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "482 KB",
      "sizeBytes": 493956,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_iso14001_인증서_전자본(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_iso14001_인증서_전자본(에스얜에스).pdf - 523 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "523 KB",
      "sizeBytes": 535305,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_iso45001_인증서_전자본(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_iso45001_인증서_전자본(에스얜에스).pdf - 523 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "523 KB",
      "sizeBytes": 535854,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_iso45001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_iso45001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf - 482 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "482 KB",
      "sizeBytes": 493873,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_iso9001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_iso9001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf - 483 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "483 KB",
      "sizeBytes": 494373,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1차사후_2025.02_2603_qeoh_su1_심사보고서(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.02_2603_qeoh_su1_심사보고서(에스얜에스).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.5 MB",
      "sizeBytes": 4672066,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_iso9001_인증서_전자본(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_iso9001_인증서_전자본(에스얜에스).pdf - 523 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "523 KB",
      "sizeBytes": 535780,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_신청자료(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_신청자료(에스얜에스).pdf - 17 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "16.5 MB",
      "sizeBytes": 17350880,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_심사자료(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_심사자료(에스얜에스).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.3 MB",
      "sizeBytes": 2437362,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_iso14001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_iso14001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf - 482 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "482 KB",
      "sizeBytes": 493956,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_iso14001_인증서_전자본(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_iso14001_인증서_전자본(에스얜에스).pdf - 523 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "523 KB",
      "sizeBytes": 535305,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_iso45001_인증서_전자본(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_iso45001_인증서_전자본(에스얜에스).pdf - 523 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "523 KB",
      "sizeBytes": 535854,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_iso45001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_iso45001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf - 482 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "482 KB",
      "sizeBytes": 493873,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_iso9001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_iso9001_인증서_전자본(에스얜에스)_2025년03월24일기준.pdf - 483 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "483 KB",
      "sizeBytes": 494373,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1차사후_2025.02_2603_qeoh_su1_심사보고서(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.02_2603_qeoh_su1_심사보고서(에스얜에스).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.5 MB",
      "sizeBytes": 4672066,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_iso9001_인증서_전자본(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_iso9001_인증서_전자본(에스얜에스).pdf - 523 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "523 KB",
      "sizeBytes": 535780,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_신청자료(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_신청자료(에스얜에스).pdf - 17 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "16.5 MB",
      "sizeBytes": 17350880,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_심사자료(에스얜에스).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_심사자료(에스얜에스).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.3 MB",
      "sizeBytes": 2437362,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "에스얜에스,qeo": [
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_2503_re_심사보고서(에스얜에스,qeo).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_2503_re_심사보고서(에스얜에스,qeo).pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "7.4 MB",
      "sizeBytes": 7747856,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_2503_re_심사보고서(에스얜에스,qeo).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_2503_re_심사보고서(에스얜에스,qeo).pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "7.4 MB",
      "sizeBytes": 7747856,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)엔에스에이치": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_iso9001_인증서_전자본(엔에스에이치).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_iso9001_인증서_전자본(엔에스에이치).pdf - 746 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "746 KB",
      "sizeBytes": 764283,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_심사자료(엔에스에이치).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_심사자료(엔에스에이치).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1140648,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_신청자료(엔에스에이치).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_신청자료(엔에스에이치).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.3 MB",
      "sizeBytes": 3486315,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_2505_qms_re심사자료(엔에스에이치).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_2505_qms_re심사자료(엔에스에이치).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.2 MB",
      "sizeBytes": 2319794,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1-2단계최초_2025.05_iso9001_인증서_전자본(엔에스에이치)_2025년06월09일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.05_iso9001_인증서_전자본(엔에스에이치)_2025년06월09일기준.pdf - 529 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "529 KB",
      "sizeBytes": 541668,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_기타_심사_담당미상_1차사후_2025.05_2605_qms_su1_심사보고서(엔에스에이치).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.05_2605_qms_su1_심사보고서(엔에스에이치).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.8 MB",
      "sizeBytes": 6040825,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_iso9001_인증서_전자본(엔에스에이치).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_iso9001_인증서_전자본(엔에스에이치).pdf - 746 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "746 KB",
      "sizeBytes": 764283,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_심사자료(엔에스에이치).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_심사자료(엔에스에이치).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1140648,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_신청자료(엔에스에이치).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_신청자료(엔에스에이치).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.3 MB",
      "sizeBytes": 3486315,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_2505_qms_re심사자료(엔에스에이치).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_2505_qms_re심사자료(엔에스에이치).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.2 MB",
      "sizeBytes": 2319794,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1-2단계최초_2025.05_iso9001_인증서_전자본(엔에스에이치)_2025년06월09일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.05_iso9001_인증서_전자본(엔에스에이치)_2025년06월09일기준.pdf - 529 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "529 KB",
      "sizeBytes": 541668,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-05_--__심사_담당미상_--__1차사후_2025.05_2605_qms_su1_심사보고서(엔에스에이치).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.05_2605_qms_su1_심사보고서(엔에스에이치).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.8 MB",
      "sizeBytes": 6040825,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "포스텍(주)": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_iso9001_인증서_전자본(포스텍).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_iso9001_인증서_전자본(포스텍).pdf - 502 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "502 KB",
      "sizeBytes": 513798,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_심사신청자료(포스텍).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_심사신청자료(포스텍).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.8 MB",
      "sizeBytes": 5020444,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_최초심사자료(포스텍).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_최초심사자료(포스텍).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.7 MB",
      "sizeBytes": 2872758,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1차사후_2024.04_2503_qms_su1_심사보고서(포스텍).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.04_2503_qms_su1_심사보고서(포스텍).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.4 MB",
      "sizeBytes": 2514505,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_2603_qms_su2_심사보고서(포스텍).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_2603_qms_su2_심사보고서(포스텍).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.3 MB",
      "sizeBytes": 6631386,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_iso9001_인증서_전자본(포스텍).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_iso9001_인증서_전자본(포스텍).pdf - 502 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "502 KB",
      "sizeBytes": 513798,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_심사신청자료(포스텍).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_심사신청자료(포스텍).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.8 MB",
      "sizeBytes": 5020444,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_최초심사자료(포스텍).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_최초심사자료(포스텍).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.7 MB",
      "sizeBytes": 2872758,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1차사후_2024.04_2503_qms_su1_심사보고서(포스텍).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.04_2503_qms_su1_심사보고서(포스텍).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.4 MB",
      "sizeBytes": 2514505,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_2603_qms_su2_심사보고서(포스텍).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_2603_qms_su2_심사보고서(포스텍).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.3 MB",
      "sizeBytes": 6631386,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "국문": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_iso9001_인증서전자본(국문)_제이에스지.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_iso9001_인증서전자본(국문)_제이에스지.pdf - 265 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "265 KB",
      "sizeBytes": 271334,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_iso9001_인증서전자본(국문)_제이에스지.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_iso9001_인증서전자본(국문)_제이에스지.pdf - 265 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "265 KB",
      "sizeBytes": 271334,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "영문": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_iso9001_인증서전자본(영문)_제이에스지.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_iso9001_인증서전자본(영문)_제이에스지.pdf - 248 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "248 KB",
      "sizeBytes": 254194,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_iso9001_인증서전자본(영문)_제이에스지.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_iso9001_인증서전자본(영문)_제이에스지.pdf - 248 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "248 KB",
      "sizeBytes": 254194,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)제이에스지": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_갱신심사자료(제이에스지).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_갱신심사자료(제이에스지).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.7 MB",
      "sizeBytes": 2807019,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_전환신청자료(제이에스지).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_전환신청자료(제이에스지).pdf - 20 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "20.2 MB",
      "sizeBytes": 21149136,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1차사후_2024.04_2505_qms_su1심사보고서(제이에스지).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.04_2505_qms_su1심사보고서(제이에스지).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1220205,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_2605_qms_su2_심사보고서(제이에스지).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_2605_qms_su2_심사보고서(제이에스지).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1010 KB",
      "sizeBytes": 1034156,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_갱신심사자료(제이에스지).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_갱신심사자료(제이에스지).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.7 MB",
      "sizeBytes": 2807019,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_전환신청자료(제이에스지).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_전환신청자료(제이에스지).pdf - 20 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "20.2 MB",
      "sizeBytes": 21149136,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1차사후_2024.04_2505_qms_su1심사보고서(제이에스지).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.04_2505_qms_su1심사보고서(제이에스지).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1220205,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_2605_qms_su2_심사보고서(제이에스지).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_2605_qms_su2_심사보고서(제이에스지).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1010 KB",
      "sizeBytes": 1034156,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)인우크로스": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_iso45001_인증서_전자본(인우크로스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_iso45001_인증서_전자본(인우크로스).pdf - 507 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "507 KB",
      "sizeBytes": 518790,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1차사후_2024.04_2504_ohs_su1심사보고서(인우크로스).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.04_2504_ohs_su1심사보고서(인우크로스).pdf - 960 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "960 KB",
      "sizeBytes": 982575,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_2차사후_2024.04_2604_ohs_su2_심사보고서(인우크로스).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.04_2604_ohs_su2_심사보고서(인우크로스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1266993,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_iso45001_인증서_전자본(인우크로스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_iso45001_인증서_전자본(인우크로스).pdf - 507 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "507 KB",
      "sizeBytes": 518790,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1차사후_2024.04_2504_ohs_su1심사보고서(인우크로스).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.04_2504_ohs_su1심사보고서(인우크로스).pdf - 960 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "960 KB",
      "sizeBytes": 982575,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__2차사후_2024.04_2604_ohs_su2_심사보고서(인우크로스).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.04_2604_ohs_su2_심사보고서(인우크로스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1266993,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "oh,_인우크로스": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_심사신청자료(oh,_인우크로스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_심사신청자료(oh,_인우크로스).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1627533,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_최초심사자료(oh,_인우크로스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_최초심사자료(oh,_인우크로스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1348105,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_심사신청자료(oh,_인우크로스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_심사신청자료(oh,_인우크로스).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.6 MB",
      "sizeBytes": 1627533,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_최초심사자료(oh,_인우크로스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_최초심사자료(oh,_인우크로스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1348105,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "한덕화학(주)": [
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_iso45001_인증서_전자본(한덕화학).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_iso45001_인증서_전자본(한덕화학).pdf - 504 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "504 KB",
      "sizeBytes": 516029,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_인증심사신청자료(한덕화학).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_인증심사신청자료(한덕화학).pdf - 19 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "18.7 MB",
      "sizeBytes": 19610582,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1-2단계최초_2024.04_최초심사자료(한덕화학).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.04_최초심사자료(한덕화학).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1347062,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_기타_심사_담당미상_1차사후_2024.04_2504_ohs_su1심사보고서(한덕화학).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.04_2504_ohs_su1심사보고서(한덕화학).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1139781,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1차사후_2026.01_2602_ems_tr_전환자료(한덕화학).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2026.01_2602_ems_tr_전환자료(한덕화학).pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.6 MB",
      "sizeBytes": 6938574,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1차사후_2026.01_iso14001_인증서_전자본(한덕화학(주)).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2026.01_iso14001_인증서_전자본(한덕화학(주)).pdf - 821 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "821 KB",
      "sizeBytes": 840750,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_기타_심사_담당미상_1차사후_2026.01_2602_eoh_su_심사보고서(한덕화학).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2026.01_2602_eoh_su_심사보고서(한덕화학).pdf - 996 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "996 KB",
      "sizeBytes": 1019733,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_iso45001_인증서_전자본(한덕화학).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_iso45001_인증서_전자본(한덕화학).pdf - 504 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "504 KB",
      "sizeBytes": 516029,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_인증심사신청자료(한덕화학).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_인증심사신청자료(한덕화학).pdf - 19 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "18.7 MB",
      "sizeBytes": 19610582,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_최초심사자료(한덕화학).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_최초심사자료(한덕화학).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1347062,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1차사후_2024.04_2504_ohs_su1심사보고서(한덕화학).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.04_2504_ohs_su1심사보고서(한덕화학).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1139781,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1차사후_2026.01_2602_ems_tr_전환자료(한덕화학).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2026.01_2602_ems_tr_전환자료(한덕화학).pdf - 7 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.6 MB",
      "sizeBytes": 6938574,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1차사후_2026.01_iso14001_인증서_전자본(한덕화학(주)).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2026.01_iso14001_인증서_전자본(한덕화학(주)).pdf - 821 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "821 KB",
      "sizeBytes": 840750,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-01_--__심사_담당미상_--__1차사후_2026.01_2602_eoh_su_심사보고서(한덕화학).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2026.01_2602_eoh_su_심사보고서(한덕화학).pdf - 996 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "996 KB",
      "sizeBytes": 1019733,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)드림엔지니어링": [
    {
      "fileName": "[GMSCS-REP]_2024-03_기타_심사_담당미상_2차사후_2024.03_iso45001_인증서_전자본(드림엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.03_iso45001_인증서_전자본(드림엔지니어링).pdf - 509 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "509 KB",
      "sizeBytes": 520893,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_기타_심사_담당미상_2차사후_2024.03_신청자료(드림엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.03_신청자료(드림엔지니어링).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.3 MB",
      "sizeBytes": 6558450,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_기타_심사_담당미상_2차사후_2024.03_심사자료(드림엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.03_심사자료(드림엔지니어링).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1184744,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_2503_re_심사보고서(드림엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_2503_re_심사보고서(드림엔지니어링).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.3 MB",
      "sizeBytes": 2412157,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_iso45001_인증서_전자본(드림엔지니어링)_2025년03월24일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_iso45001_인증서_전자본(드림엔지니어링)_2025년03월24일기준.pdf - 465 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "465 KB",
      "sizeBytes": 476216,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1차사후_2025.02_2602_ohs_su1_심사보고서(드림엔지니어링).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.02_2602_ohs_su1_심사보고서(드림엔지니어링).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1214199,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_--__심사_담당미상_--__2차사후_2024.03_iso45001_인증서_전자본(드림엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.03_iso45001_인증서_전자본(드림엔지니어링).pdf - 509 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "509 KB",
      "sizeBytes": 520893,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_--__심사_담당미상_--__2차사후_2024.03_신청자료(드림엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.03_신청자료(드림엔지니어링).pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.3 MB",
      "sizeBytes": 6558450,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_--__심사_담당미상_--__2차사후_2024.03_심사자료(드림엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.03_심사자료(드림엔지니어링).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1184744,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_2503_re_심사보고서(드림엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_2503_re_심사보고서(드림엔지니어링).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.3 MB",
      "sizeBytes": 2412157,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_iso45001_인증서_전자본(드림엔지니어링)_2025년03월24일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_iso45001_인증서_전자본(드림엔지니어링)_2025년03월24일기준.pdf - 465 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "465 KB",
      "sizeBytes": 476216,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1차사후_2025.02_2602_ohs_su1_심사보고서(드림엔지니어링).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.02_2602_ohs_su1_심사보고서(드림엔지니어링).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1214199,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)금정": [
    {
      "fileName": "[GMSCS-REP]_2026-03_기타_심사_담당미상_1-2단계최초_2026.03_2603_ohs_re_심사보고서(금정).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2026.03_2603_ohs_re_심사보고서(금정).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "7.6 MB",
      "sizeBytes": 8014906,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_기타_심사_담당미상_1차사후_2024.03_iso45001_인증서_전자본(금정).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.03_iso45001_인증서_전자본(금정).pdf - 495 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "495 KB",
      "sizeBytes": 507380,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_기타_심사_담당미상_1차사후_2024.03_신청자료(금정).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.03_신청자료(금정).pdf - 17 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "17.2 MB",
      "sizeBytes": 17995136,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_기타_심사_담당미상_1차사후_2024.03_심사자료(금정).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.03_심사자료(금정).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1549976,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2026-03_--__심사_담당미상_--__1-2단계최초_2026.03_2603_ohs_re_심사보고서(금정).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2026.03_2603_ohs_re_심사보고서(금정).pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "7.6 MB",
      "sizeBytes": 8014906,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_--__심사_담당미상_--__1차사후_2024.03_iso45001_인증서_전자본(금정).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.03_iso45001_인증서_전자본(금정).pdf - 495 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "495 KB",
      "sizeBytes": 507380,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_--__심사_담당미상_--__1차사후_2024.03_신청자료(금정).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.03_신청자료(금정).pdf - 17 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "17.2 MB",
      "sizeBytes": 17995136,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_--__심사_담당미상_--__1차사후_2024.03_심사자료(금정).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.03_심사자료(금정).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.5 MB",
      "sizeBytes": 1549976,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "켄코아에어로스페이스(주)": [
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1-2단계최초_2025.09_2509_ems_in_심사신청자료(켄코아에어로스페이스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.09_2509_ems_in_심사신청자료(켄코아에어로스페이스).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.8 MB",
      "sizeBytes": 2899004,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1-2단계최초_2025.09_2510_ems_in_인증심사보고서(켄코아에어로스페이스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.09_2510_ems_in_인증심사보고서(켄코아에어로스페이스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1507325,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_기타_심사_담당미상_1-2단계최초_2025.09_iso14001_인증서_전자본(켄코아에어로스페이스).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.09_iso14001_인증서_전자본(켄코아에어로스페이스).pdf - 532 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "532 KB",
      "sizeBytes": 544450,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-02_기타_심사_담당미상_1차사후_2024.02_iso45001_인증서_전자본(켄코아에어로스페이스).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.02_iso45001_인증서_전자본(켄코아에어로스페이스).pdf - 509 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "509 KB",
      "sizeBytes": 521205,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-02_기타_심사_담당미상_2차사후_2024.02_2506_ohs_su2_심사보고서(켄코아에어로스페이스).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.02_2506_ohs_su2_심사보고서(켄코아에어로스페이스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1182122,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1-2단계최초_2025.09_2509_ems_in_심사신청자료(켄코아에어로스페이스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.09_2509_ems_in_심사신청자료(켄코아에어로스페이스).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.8 MB",
      "sizeBytes": 2899004,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1-2단계최초_2025.09_2510_ems_in_인증심사보고서(켄코아에어로스페이스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.09_2510_ems_in_인증심사보고서(켄코아에어로스페이스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1507325,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-09_--__심사_담당미상_--__1-2단계최초_2025.09_iso14001_인증서_전자본(켄코아에어로스페이스).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.09_iso14001_인증서_전자본(켄코아에어로스페이스).pdf - 532 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "532 KB",
      "sizeBytes": 544450,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-02_--__심사_담당미상_--__1차사후_2024.02_iso45001_인증서_전자본(켄코아에어로스페이스).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.02_iso45001_인증서_전자본(켄코아에어로스페이스).pdf - 509 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "509 KB",
      "sizeBytes": 521205,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-02_--__심사_담당미상_--__2차사후_2024.02_2506_ohs_su2_심사보고서(켄코아에어로스페이스).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.02_2506_ohs_su2_심사보고서(켄코아에어로스페이스).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1182122,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "켄코아": [
    {
      "fileName": "[GMSCS-REP]_2024-02_기타_심사_담당미상_1차사후_2024.02_사후심사자료(켄코아).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.02_사후심사자료(켄코아).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1210315,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-02_기타_심사_담당미상_1차사후_2024.02_전환신청자료(켄코아).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2024.02_전환신청자료(켄코아).pdf - 14 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "14.4 MB",
      "sizeBytes": 15137319,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-02_--__심사_담당미상_--__1차사후_2024.02_사후심사자료(켄코아).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.02_사후심사자료(켄코아).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1210315,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-02_--__심사_담당미상_--__1차사후_2024.02_전환신청자료(켄코아).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.02_전환신청자료(켄코아).pdf - 14 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "14.4 MB",
      "sizeBytes": 15137319,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)선우컨스텍": [
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_iso9001_인증서_전자본(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_iso9001_인증서_전자본(선우컨스텍).pdf - 522 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "522 KB",
      "sizeBytes": 534791,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1차사후_2023.12_2501_qe_su1심사보고서(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.12_2501_qe_su1심사보고서(선우컨스텍).pdf - 12 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.2 MB",
      "sizeBytes": 12751212,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1차사후_2023.12_iso9001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.12_iso9001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf - 468 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "468 KB",
      "sizeBytes": 479086,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_2차사후_2023.12_2601_su2_인증심사보고서(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2023.12_2601_su2_인증심사보고서(선우컨스텍).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.7 MB",
      "sizeBytes": 13308316,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_2차사후_2023.12_iso9001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2023.12_iso9001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf - 537 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "537 KB",
      "sizeBytes": 549986,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_iso14001_인증서_전자본(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_iso14001_인증서_전자본(선우컨스텍).pdf - 510 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "510 KB",
      "sizeBytes": 521906,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1차사후_2023.12_iso14001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.12_iso14001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf - 467 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "467 KB",
      "sizeBytes": 478497,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_2차사후_2023.12_iso14001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2023.12_iso14001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf - 534 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "534 KB",
      "sizeBytes": 547179,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_iso45001_인증서_전자본(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_iso45001_인증서_전자본(선우컨스텍).pdf - 523 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "523 KB",
      "sizeBytes": 535404,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1차사후_2023.12_2501_ohs_su1심사보고서(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.12_2501_ohs_su1심사보고서(선우컨스텍).pdf - 14 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "14.0 MB",
      "sizeBytes": 14628250,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1차사후_2023.12_iso45001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.12_iso45001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf - 468 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "468 KB",
      "sizeBytes": 479637,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_2차사후_2023.12_2601_ohs_su2_심사보고서(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2023.12_2601_ohs_su2_심사보고서(선우컨스텍).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.7 MB",
      "sizeBytes": 11216699,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_2차사후_2023.12_iso45001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2023.12_iso45001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf - 540 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "540 KB",
      "sizeBytes": 552540,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_iso9001_인증서_전자본(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_iso9001_인증서_전자본(선우컨스텍).pdf - 522 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "522 KB",
      "sizeBytes": 534791,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1차사후_2023.12_2501_qe_su1심사보고서(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.12_2501_qe_su1심사보고서(선우컨스텍).pdf - 12 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.2 MB",
      "sizeBytes": 12751212,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1차사후_2023.12_iso9001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.12_iso9001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf - 468 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "468 KB",
      "sizeBytes": 479086,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__2차사후_2023.12_2601_su2_인증심사보고서(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2023.12_2601_su2_인증심사보고서(선우컨스텍).pdf - 13 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "12.7 MB",
      "sizeBytes": 13308316,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__2차사후_2023.12_iso9001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2023.12_iso9001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf - 537 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "537 KB",
      "sizeBytes": 549986,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_iso14001_인증서_전자본(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_iso14001_인증서_전자본(선우컨스텍).pdf - 510 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "510 KB",
      "sizeBytes": 521906,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1차사후_2023.12_iso14001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.12_iso14001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf - 467 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "467 KB",
      "sizeBytes": 478497,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__2차사후_2023.12_iso14001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2023.12_iso14001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf - 534 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "534 KB",
      "sizeBytes": 547179,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_iso45001_인증서_전자본(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_iso45001_인증서_전자본(선우컨스텍).pdf - 523 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "523 KB",
      "sizeBytes": 535404,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1차사후_2023.12_2501_ohs_su1심사보고서(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.12_2501_ohs_su1심사보고서(선우컨스텍).pdf - 14 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "14.0 MB",
      "sizeBytes": 14628250,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1차사후_2023.12_iso45001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.12_iso45001_인증서_전자본(선우컨스텍)_2025년02월10일기준.pdf - 468 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "468 KB",
      "sizeBytes": 479637,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__2차사후_2023.12_2601_ohs_su2_심사보고서(선우컨스텍).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2023.12_2601_ohs_su2_심사보고서(선우컨스텍).pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.7 MB",
      "sizeBytes": 11216699,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__2차사후_2023.12_iso45001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2023.12_iso45001_인증서_전자본(선우컨스텍)_2026년02월02일기준.pdf - 540 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "540 KB",
      "sizeBytes": 552540,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "태진a&t": [
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_iso14001_인증서_전자본(태진a&t).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_iso14001_인증서_전자본(태진a&t).pdf - 517 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "517 KB",
      "sizeBytes": 529400,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1차사후_2023.12_2412_ems_su1심사보고서(태진a&t).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.12_2412_ems_su1심사보고서(태진a&t).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.8 MB",
      "sizeBytes": 1938882,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_iso14001_인증서_전자본(태진a&t).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_iso14001_인증서_전자본(태진a&t).pdf - 517 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "517 KB",
      "sizeBytes": 529400,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1차사후_2023.12_2412_ems_su1심사보고서(태진a&t).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.12_2412_ems_su1심사보고서(태진a&t).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.8 MB",
      "sizeBytes": 1938882,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)태진에이엔티": [
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_2차사후_2023.12_2512_ems_su2_심사보고서(태진에이엔티).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2023.12_2512_ems_su2_심사보고서(태진에이엔티).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.6 MB",
      "sizeBytes": 4773783,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__2차사후_2023.12_2512_ems_su2_심사보고서(태진에이엔티).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2023.12_2512_ems_su2_심사보고서(태진에이엔티).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "4.6 MB",
      "sizeBytes": 4773783,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)씨에이치바이오": [
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_2502_q_최초신청자료(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_2502_q_최초신청자료(씨에이치바이오).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.2 MB",
      "sizeBytes": 2331365,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_2502_q_최초심사보고서(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_2502_q_최초심사보고서(씨에이치바이오).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1273405,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_iso9001_인증서_전자본(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_iso9001_인증서_전자본(씨에이치바이오).pdf - 274 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "274 KB",
      "sizeBytes": 280376,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1차사후_2025.02_2602_qms_su1_심사보고서(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2025.02_2602_qms_su1_심사보고서(씨에이치바이오).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1158624,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_2502_c_최초신청자료및보고서(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_2502_c_최초신청자료및보고서(씨에이치바이오).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.1 MB",
      "sizeBytes": 3278053,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_기타_심사_담당미상_1-2단계최초_2025.02_iso22716_인증서_전자본(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.02_iso22716_인증서_전자본(씨에이치바이오).pdf - 290 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "290 KB",
      "sizeBytes": 297448,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_2502_q_최초신청자료(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_2502_q_최초신청자료(씨에이치바이오).pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.2 MB",
      "sizeBytes": 2331365,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_2502_q_최초심사보고서(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_2502_q_최초심사보고서(씨에이치바이오).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.2 MB",
      "sizeBytes": 1273405,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_iso9001_인증서_전자본(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_iso9001_인증서_전자본(씨에이치바이오).pdf - 274 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "274 KB",
      "sizeBytes": 280376,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1차사후_2025.02_2602_qms_su1_심사보고서(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2025.02_2602_qms_su1_심사보고서(씨에이치바이오).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1158624,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_2502_c_최초신청자료및보고서(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_2502_c_최초신청자료및보고서(씨에이치바이오).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.1 MB",
      "sizeBytes": 3278053,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-02_--__심사_담당미상_--__1-2단계최초_2025.02_iso22716_인증서_전자본(씨에이치바이오).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.02_iso22716_인증서_전자본(씨에이치바이오).pdf - 290 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "290 KB",
      "sizeBytes": 297448,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "홍해기술(주)": [
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1-2단계최초_2023.12_iso45001_인증서_전자본(홍해기술).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.12_iso45001_인증서_전자본(홍해기술).pdf - 517 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "517 KB",
      "sizeBytes": 529070,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_1차사후_2023.12_2501_사후1심사보고서(홍해기술).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.12_2501_사후1심사보고서(홍해기술).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1155973,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_기타_심사_담당미상_2차사후_2023.12_2601_ohs_su2_심사보고서(홍해기술).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2023.12_2601_ohs_su2_심사보고서(홍해기술).pdf - 955 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "955 KB",
      "sizeBytes": 978098,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_iso45001_인증서_전자본(홍해기술).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_iso45001_인증서_전자본(홍해기술).pdf - 517 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "517 KB",
      "sizeBytes": 529070,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1차사후_2023.12_2501_사후1심사보고서(홍해기술).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.12_2501_사후1심사보고서(홍해기술).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1155973,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__2차사후_2023.12_2601_ohs_su2_심사보고서(홍해기술).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2023.12_2601_ohs_su2_심사보고서(홍해기술).pdf - 955 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "955 KB",
      "sizeBytes": 978098,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "효림이엔아이(주)": [
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1차사후_2023.11_iso14001_인증서_전자본(효림이엔아이).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.11_iso14001_인증서_전자본(효림이엔아이).pdf - 537 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "537 KB",
      "sizeBytes": 550160,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_1-2단계최초_2025.10_2511_qeoh_resu2_심사보고서(효림이엔아이).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.10_2511_qeoh_resu2_심사보고서(효림이엔아이).pdf - 9 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.6 MB",
      "sizeBytes": 8992178,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_1-2단계최초_2025.10_iso9001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.10_iso9001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf - 571 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "571 KB",
      "sizeBytes": 585089,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1차사후_2023.11_iso9001_인증서_전자본(효림이엔아이).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.11_iso9001_인증서_전자본(효림이엔아이).pdf - 538 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "538 KB",
      "sizeBytes": 550629,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_2차사후_2023.11_사후심사보고서(효림이엔아이).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2023.11_사후심사보고서(효림이엔아이).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.1 MB",
      "sizeBytes": 3285768,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-01_기타_심사_담당미상_1-2단계최초_2024.01_iso45001_인증서_전자본(효림이엔아이).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2024.01_iso45001_인증서_전자본(효림이엔아이).pdf - 537 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "537 KB",
      "sizeBytes": 549425,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-01_기타_심사_담당미상_2차사후_2024.01_iso45001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf",
      "originalName": "[GMSCS-REP]__2차사후_2024.01_iso45001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf - 573 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "573 KB",
      "sizeBytes": 586753,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_기타_심사_담당미상_1-2단계최초_2025.10_iso14001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2025.10_iso14001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf - 569 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "569 KB",
      "sizeBytes": 582709,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1차사후_2023.11_iso14001_인증서_전자본(효림이엔아이).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.11_iso14001_인증서_전자본(효림이엔아이).pdf - 537 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "537 KB",
      "sizeBytes": 550160,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__1-2단계최초_2025.10_2511_qeoh_resu2_심사보고서(효림이엔아이).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.10_2511_qeoh_resu2_심사보고서(효림이엔아이).pdf - 9 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.6 MB",
      "sizeBytes": 8992178,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__1-2단계최초_2025.10_iso9001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.10_iso9001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf - 571 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "571 KB",
      "sizeBytes": 585089,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1차사후_2023.11_iso9001_인증서_전자본(효림이엔아이).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.11_iso9001_인증서_전자본(효림이엔아이).pdf - 538 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "538 KB",
      "sizeBytes": 550629,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__2차사후_2023.11_사후심사보고서(효림이엔아이).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2023.11_사후심사보고서(효림이엔아이).pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.1 MB",
      "sizeBytes": 3285768,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-01_--__심사_담당미상_--__1-2단계최초_2024.01_iso45001_인증서_전자본(효림이엔아이).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.01_iso45001_인증서_전자본(효림이엔아이).pdf - 537 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "537 KB",
      "sizeBytes": 549425,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-01_--__심사_담당미상_--__2차사후_2024.01_iso45001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.01_iso45001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf - 573 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "573 KB",
      "sizeBytes": 586753,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__1-2단계최초_2025.10_iso14001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.10_iso14001_인증서_전자본(효림이엔아이)_2025년12월01일기준.pdf - 569 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "569 KB",
      "sizeBytes": 582709,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "청하에그린": [
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1-2단계최초_2023.11_iso45001_인증서_전자본(청하에그린).pdf",
      "originalName": "[GMSCS-REP]__1-2단계최초_2023.11_iso45001_인증서_전자본(청하에그린).pdf - 500 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "500 KB",
      "sizeBytes": 512263,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1차사후_2023.11_2411_사후1심사보고서(청하에그린).pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.11_2411_사후1심사보고서(청하에그린).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1460632,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_2차사후_2023.11_2511_ohs_su2_심사보고서(청하에그린).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2023.11_2511_ohs_su2_심사보고서(청하에그린).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.2 MB",
      "sizeBytes": 5424242,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1-2단계최초_2023.11_iso45001_인증서_전자본(청하에그린).pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.11_iso45001_인증서_전자본(청하에그린).pdf - 500 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "500 KB",
      "sizeBytes": 512263,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1차사후_2023.11_2411_사후1심사보고서(청하에그린).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.11_2411_사후1심사보고서(청하에그린).pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1460632,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__2차사후_2023.11_2511_ohs_su2_심사보고서(청하에그린).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2023.11_2511_ohs_su2_심사보고서(청하에그린).pdf - 5 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "5.2 MB",
      "sizeBytes": 5424242,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)메탈이노베이션코리아": [
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_1차사후_2023.11_iso9001_인증서_전자본(메탈이노베이션코리아)[0].pdf",
      "originalName": "[GMSCS-REP]__1차사후_2023.11_iso9001_인증서_전자본(메탈이노베이션코리아)[0].pdf - 727 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "727 KB",
      "sizeBytes": 744159,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1차사후_2023.11_iso9001_인증서_전자본(메탈이노베이션코리아)[0].pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.11_iso9001_인증서_전자본(메탈이노베이션코리아)[0].pdf - 727 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "727 KB",
      "sizeBytes": 744159,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "메탈이노베이션": [
    {
      "fileName": "[GMSCS-REP]_2023-11_기타_심사_담당미상_2차사후_2023.11_사후심사자료(메탈이노베이션).pdf",
      "originalName": "[GMSCS-REP]__2차사후_2023.11_사후심사자료(메탈이노베이션).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.5 MB",
      "sizeBytes": 3721724,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__2차사후_2023.11_사후심사자료(메탈이노베이션).pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2023.11_사후심사자료(메탈이노베이션).pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.5 MB",
      "sizeBytes": 3721724,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "주식회사 디와이메탈": [
    {
      "fileName": "[GMSCS-REP]_2024-12_주식회사 디와이메탈_심사_송인선(변)_주식회사 디와이메탈_2501_최초심사보고서(디와이메탈).pdf",
      "originalName": "[GMSCS-REP]_202412_주식회사 디와이메탈_2501_최초심사보고서(디와이메탈).pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1422073,
      "auditor": "송인선",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-11_주식회사 디와이메탈_심사_송인선(변)_주식회사 디와이메탈_2411_최초심사보고서(디와이메탈)qe.pdf",
      "originalName": "[GMSCS-REP]_202411_주식회사 디와이메탈_2411_최초심사보고서(디와이메탈)qe.pdf",
      "docType": "심사보고서",
      "fileSize": "1.3 MB",
      "sizeBytes": 1412271,
      "auditor": "송인선",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-CERT]_2024-11_주식회사 디와이메탈_심사_송인선(변)_주식회사 디와이메탈_iso14001_인증서_전자본(주식회사디와이메탈).pdf",
      "originalName": "[GMSCS-CERT]_202411_주식회사 디와이메탈_iso14001_인증서_전자본(주식회사디와이메탈).pdf",
      "docType": "인증서",
      "fileSize": "457 KB",
      "sizeBytes": 467921,
      "auditor": "송인선",
      "pdfUrl": "/docs/cert_change_application.pdf"
    },
    {
      "fileName": "[GMSCS-CERT]_2024-11_주식회사 디와이메탈_심사_송인선(변)_주식회사 디와이메탈_iso9001_인증서_전자본(주식회사디와이메탈).pdf",
      "originalName": "[GMSCS-CERT]_202411_주식회사 디와이메탈_iso9001_인증서_전자본(주식회사디와이메탈).pdf",
      "docType": "인증서",
      "fileSize": "457 KB",
      "sizeBytes": 467810,
      "auditor": "송인선",
      "pdfUrl": "/docs/cert_change_application.pdf"
    },
    {
      "fileName": "[GMSCS-DOC]_2024-11_주식회사 디와이메탈_심사_송인선(변)_주식회사 디와이메탈_2411_최초신청자료(디와이메탈)qe.pdf",
      "originalName": "[GMSCS-DOC]_202411_주식회사 디와이메탈_2411_최초신청자료(디와이메탈)qe.pdf",
      "docType": "신청/전환자료",
      "fileSize": "2.4 MB",
      "sizeBytes": 2494620,
      "auditor": "송인선",
      "pdfUrl": "/docs/audit_plan_sample.pdf"
    },
    {
      "fileName": "[GMSCS-DOC]_2024-12_주식회사 디와이메탈_심사_송인선(변)_주식회사 디와이메탈_2501_최초신청자료(디와이메탈).pdf",
      "originalName": "[GMSCS-DOC]_202412_주식회사 디와이메탈_2501_최초신청자료(디와이메탈).pdf",
      "docType": "신청/전환자료",
      "fileSize": "909 KB",
      "sizeBytes": 930694,
      "auditor": "송인선",
      "pdfUrl": "/docs/audit_plan_sample.pdf"
    },
    {
      "fileName": "[GMSCS-CERT]_2024-12_주식회사 디와이메탈_심사_송인선(변)_주식회사 디와이메탈_iso45001_인증서_전자본(주식회사디와이메탈).pdf",
      "originalName": "[GMSCS-CERT]_202412_주식회사 디와이메탈_iso45001_인증서_전자본(주식회사디와이메탈).pdf",
      "docType": "인증서",
      "fileSize": "458 KB",
      "sizeBytes": 468888,
      "auditor": "송인선",
      "pdfUrl": "/docs/cert_change_application.pdf"
    }
  ],
  "--_": [
    {
      "fileName": "[GMSCS-REP]_2025-06_--__심사_담당미상_--__2차사후_2025.06_2506_qe_su2_심사보고서(은보기계.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2025.06_2506_qe_su2_심사보고서(은보기계.pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.8 MB",
      "sizeBytes": 1926248,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2025-10_--__심사_담당미상_--__1-2단계최초_2025.10_esg-ms_심사기록.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2025.10_esg-ms_심사기록.pdf - 3 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.2 MB",
      "sizeBytes": 3362224,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-04_--__심사_담당미상_--__1-2단계최초_2024.04_2407_qeo_in_인증서_상호변경_전.zip - 1 MB.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2024.04_2407_qeo_in_인증서_상호변경_전.zip - 1 MB",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1515581,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-03_--__심사_담당미상_--__2차사후_2024.03_2503_ohs_su2심사보고서.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.03_2503_ohs_su2심사보고서.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.1 MB",
      "sizeBytes": 1129270,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_심사신청자료_qe.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_심사신청자료_qe.pdf - 11 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "11.0 MB",
      "sizeBytes": 11517193,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_최초심사자료_qe.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_최초심사자료_qe.pdf - 16 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "15.8 MB",
      "sizeBytes": 16525203,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_심사신청자료_ohs.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_심사신청자료_ohs.pdf - 10 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "10.4 MB",
      "sizeBytes": 10879095,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_최초심사자료_ohs.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_최초심사자료_ohs.pdf - 23 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "23.1 MB",
      "sizeBytes": 24171275,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_심사신청자료.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_심사신청자료.pdf - 36 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "35.8 MB",
      "sizeBytes": 37529013,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_최초심사자료.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_최초심사자료.pdf - 19 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "19.2 MB",
      "sizeBytes": 20109743,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_심사신청자료.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_심사신청자료.pdf - 4 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "3.8 MB",
      "sizeBytes": 3996989,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-12_--__심사_담당미상_--__1-2단계최초_2023.12_최초심사자료.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.12_최초심사자료.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.4 MB",
      "sizeBytes": 1453570,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1차사후_2023.11_사후심사자료.pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.11_사후심사자료.pdf - 8 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "8.4 MB",
      "sizeBytes": 8853843,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1차사후_2023.11_인증신청자료.pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.11_인증신청자료.pdf - 16 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "15.7 MB",
      "sizeBytes": 16482206,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1-2단계최초_2023.11_심사신청자료.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.11_심사신청자료.pdf - 22 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "22.1 MB",
      "sizeBytes": 23209440,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1-2단계최초_2023.11_최초심사자료.pdf",
      "originalName": "[GMSCS-REP]_--__1-2단계최초_2023.11_최초심사자료.pdf - 19 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "18.6 MB",
      "sizeBytes": 19467659,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1차사후_2023.11_전환신청자료.pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.11_전환신청자료.pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.3 MB",
      "sizeBytes": 6621572,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2023-11_--__심사_담당미상_--__1차사후_2023.11_사후심사자료[0].pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2023.11_사후심사자료[0].pdf - 2 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "2.0 MB",
      "sizeBytes": 2146218,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ],
  "(주)아이씨티이엔지": [
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1차사후_2024.08_2409_전환신청자료(아이씨티이엔지)_ohs.pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.08_2409_전환신청자료(아이씨티이엔지)_ohs.pdf - 6 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "6.2 MB",
      "sizeBytes": 6502496,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1차사후_2024.08_iso45001_인증서_전자본(아이씨티이엔지).pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.08_iso45001_인증서_전자본(아이씨티이엔지).pdf - 461 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "461 KB",
      "sizeBytes": 472522,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__1차사후_2024.08_2409_사후1심사보고서(아이씨티이엔지)_ohs.pdf",
      "originalName": "[GMSCS-REP]_--__1차사후_2024.08_2409_사후1심사보고서(아이씨티이엔지)_ohs.pdf - 1 MB.pdf",
      "docType": "심사보고서",
      "fileSize": "1.0 MB",
      "sizeBytes": 1096811,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    },
    {
      "fileName": "[GMSCS-REP]_2024-08_--__심사_담당미상_--__2차사후_2024.08_iso45001_인증서_전자본(아이씨티이엔지)_2025년10월27일기준.pdf",
      "originalName": "[GMSCS-REP]_--__2차사후_2024.08_iso45001_인증서_전자본(아이씨티이엔지)_2025년10월27일기준.pdf - 528 KB.pdf",
      "docType": "심사보고서",
      "fileSize": "528 KB",
      "sizeBytes": 540865,
      "auditor": "담당미상",
      "pdfUrl": "/docs/2025_Audit_Report_Pack.pdf"
    }
  ]
};

export function getDriveReportsForCompany(companyName: string): DriveReportFileItem[] {
  if (!companyName) return [];
  const clean = companyName.replace(/[\s\(\)\[\]주식회사㈜\.]/g, '').toLowerCase();
  
  for (const [k, list] of Object.entries(DRIVE_REPORT_FILES)) {
    const kClean = k.replace(/[\s\(\)\[\]주식회사㈜\.]/g, '').toLowerCase();
    if (kClean === clean || clean.includes(kClean) || kClean.includes(clean)) {
      return list;
    }
  }
  
  // 기본 Google Drive 보관 표준화 PDF 파일 샘플 반환
  return [
    {
      fileName: `[GMSCS-REP]_2025-10_${companyName}_심사보고서_원본실물.pdf`,
      originalName: `2025 Aduit Report Pack(251001).pdf`,
      docType: '심사보고서',
      fileSize: '852 KB',
      sizeBytes: 872919,
      auditor: '사무국',
      pdfUrl: '/docs/2025_Audit_Report_Pack.pdf'
    },
    {
      fileName: `[GMSCS-CERT]_2025-10_${companyName}_공식인증서_전자본.pdf`,
      originalName: `인증서_전자본(${companyName}).pdf`,
      docType: '인증서',
      fileSize: '591 KB',
      sizeBytes: 605486,
      auditor: '사무국',
      pdfUrl: '/docs/cert_change_application.pdf'
    }
  ];
}
