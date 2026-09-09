import React, { useState } from 'react';
import { 
  HardDrive, 
  Server, 
  Usb, 
  CheckCircle2, 
  RefreshCw, 
  FileCode, 
  Copy
} from 'lucide-react';
import { BackupRecord } from '../types';
import { mockBackups } from '../data/mockData';

export const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>(mockBackups);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const backupScriptCode = `@echo off
:: ===============================================================
:: GMSCS 사내 서버 및 외장 하드 디스크 2중 자동 백업 스크립트
:: 실행 주기: 매일 02:00 (Windows Task Scheduler / Linux Cron)
:: ===============================================================

SET BACKUP_DIR=C:\\GMSCS_Backup
SET EXTERNAL_DRIVE=D:\\GMSCS_Cold_Storage
SET TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%

echo [%TIMESTAMP%] GMSCS PostgreSQL 1차 백업 시작...
pg_dump -U gmscs_admin -d gmscs_db -F c -b -v -f "%BACKUP_DIR%\\gmscs_db_%TIMESTAMP%.dump"

echo [%TIMESTAMP%] 심사보고서 및 전자서명 PDF 증분 백업...
robocopy "C:\\GMSCS_Storage\\PDFs" "%BACKUP_DIR%\\PDFs" /MIR /R:2 /W:5

echo [%TIMESTAMP%] 외장 하드 디스크(USB/스토리지) 감지 및 2차 미러링...
if exist "%EXTERNAL_DRIVE%" (
    robocopy "%BACKUP_DIR%" "%EXTERNAL_DRIVE%\\Daily_%TIMESTAMP%" /E /Z
    echo [성공] 외장 하드 백업 완료: %EXTERNAL_DRIVE%
) else (
    echo [경고] 외장 하드 드라이브가 연결되어 있지 않습니다! 관리자 확인 요망.
)
`;

  const handleManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      const newRecord: BackupRecord = {
        id: `bak-${Date.now()}`,
        backupDate: formattedDate,
        backupType: 'Full DB',
        sizeBytes: 1580000000,
        destination: '외장 하드 디스크 (USB 3.0)',
        status: '정상완료',
        checksum: `sha256:manual_${Math.random().toString(36).substring(2)}`
      };

      setBackups([newRecord, ...backups]);
      setIsBackingUp(false);
      alert('[2중 백업 완료]\n1. 인증원 사내 주서버 PostgreSQL 데이터베이스 덤프 완료\n2. 연결된 외장 하드 디스크(D:)로 암호화 미러링 완료\n3. 위변조 검증 체크섬 정상 검증');
    }, 1200);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(backupScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
              <HardDrive className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              인증원 사내 서버 & 외장 저장 유닛(외장하드/CD) 2중 백업 센터
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            KAB 심사기록 보존 규정(최소 6년 이상 보존)을 충족하기 위해 
            <strong className="text-cyan-700"> 사내 주서버(PostgreSQL)</strong>와 
            <strong className="text-emerald-700"> 외장 하드 디스크</strong>로 매일 심야 자동 백업됩니다.
          </p>
        </div>

        <button
          onClick={handleManualBackup}
          disabled={isBackingUp}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
          <span>{isBackingUp ? '사내 서버 및 외장하드 백업 중...' : '지금 즉시 2중 백업 실행'}</span>
        </button>
      </div>

      {/* Storage Architecture Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unit 1: 인증원 사내 주서버 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-cyan-600" />
              <h4 className="text-sm font-bold text-slate-900">1차: 인증원 사내 주서버 (Primary)</h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              운영 상태: 가동중
            </span>
          </div>
          <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>• 데이터베이스: PostgreSQL 16 (인증 트랜잭션, 감사로그)</div>
            <div>• 파일 저장소: 로컬 SSD RAID-1 (웹 심사보고서, 전자서명 원본 PDF)</div>
            <div>• 백업 주기: 매일 심야 02:00 (전체 DB 덤프)</div>
            <div>• 무결성 검증: SHA-256 해시값 실시간 비교</div>
          </div>
        </div>

        {/* Unit 2: 외장 하드 디스크 / 오프라인 유닛 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Usb className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">2차: 외장 저장 유닛 (USB 3.0 / 외장하드)</h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
              연결 감지: 마운트 완료 (D:)
            </span>
          </div>
          <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>• 장치 모델: 외장 드라이브 (USB 3.0 고속 전송, 4TB)</div>
            <div>• 백업 목적: 랜섬웨어/화재 대비 오프라인 에어갭(Air-gap) 보관</div>
            <div>• 동기화 주기: 매일 03:00 자동 미러링</div>
            <div>• 시디롬/블루레이: 반기별 1회 영구 불변(WORM) 디스크 굽기 지원</div>
          </div>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            최근 2중 백업 수행 로그
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">총 3건 정상 보관 중</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">백업 일시</th>
              <th className="p-3.5">백업 유형</th>
              <th className="p-3.5">저장 위치</th>
              <th className="p-3.5">용량</th>
              <th className="p-3.5">상태</th>
              <th className="p-3.5">위변조 검증 체크섬</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {backups.map((bak) => (
              <tr key={bak.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3.5 font-bold text-slate-900">{bak.backupDate}</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {bak.backupType}
                  </span>
                </td>
                <td className="p-3.5 text-slate-700 font-medium flex items-center gap-1.5">
                  {bak.destination.includes('외장') ? (
                    <Usb className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Server className="w-3.5 h-3.5 text-cyan-600" />
                  )}
                  <span>{bak.destination}</span>
                </td>
                <td className="p-3.5 text-slate-600 font-medium">
                  {(bak.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                </td>
                <td className="p-3.5">
                  <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{bak.status}</span>
                  </span>
                </td>
                <td className="p-3.5 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                  {bak.checksum}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Automatic Script Viewer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-cyan-600" />
            <h4 className="text-xs font-bold text-slate-800">
              인증원 서버 구동용 자동 2중 백업 스크립트 (Windows Task Scheduler / Linux Cron)
            </h4>
          </div>
          <button
            onClick={copyScript}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedScript ? '복사됨!' : '스크립트 복사'}</span>
          </button>
        </div>

        <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto leading-relaxed">
          {backupScriptCode}
        </pre>
      </div>
    </div>
  );
};
