import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Printer, 
  Paperclip, 
  Calendar,
  Save
} from 'lucide-react';
import { CertChangeApplicationData, Company } from '../types';

interface CertChangeApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  certNumber?: string;
  standards: string[];
  initialData?: CertChangeApplicationData;
  onSaveData: (data: CertChangeApplicationData) => void;
}

export const CertChangeApplicationModal: React.FC<CertChangeApplicationModalProps> = ({
  isOpen,
  onClose,
  company,
  certNumber = 'GMS-Q-2023-0192',
  standards,
  initialData,
  onSaveData
}) => {
  if (!isOpen) return null;

  const [changeCategories, setChangeCategories] = useState<('상호' | '주소' | '사업자' | '범위' | '표준' | '기타')[]>(
    initialData?.changeCategories || ['상호', '범위']
  );
  const [newCompanyNameKo, setNewCompanyNameKo] = useState<string>(initialData?.newCompanyNameKo || company.companyName);
  const [newCompanyNameEn, setNewCompanyNameEn] = useState<string>(initialData?.newCompanyNameEn || '');
  const [newCeoName, setNewCeoName] = useState<string>(initialData?.newCeoName || company.ceoName);
  const [newAddressHead, setNewAddressHead] = useState<string>(initialData?.newAddressHead || company.address);
  const [newAddressPlant, setNewAddressPlant] = useState<string>(initialData?.newAddressPlant || '');
  const [scopeChangeType, setScopeChangeType] = useState<'이전' | '추가' | '축소' | '기타'>(initialData?.scopeChangeType || '추가');
  const [newScopeDetails, setNewScopeDetails] = useState<string>(
    initialData?.newScopeDetails || '기존 인증범위에 ESG 경영시스템 및 친환경 리사이클 부품 제조 공정 추가'
  );
  const [desiredAuditDate, setDesiredAuditDate] = useState<string>(initialData?.desiredAuditDate || '2026-10-25');
  const [attachedDocuments, setAttachedDocuments] = useState<string[]>(
    initialData?.attachedDocuments || ['사업자등록증사본', '등기부등본', '인증범위확인서']
  );

  const toggleCategory = (cat: '상호' | '주소' | '사업자' | '범위' | '표준' | '기타') => {
    if (changeCategories.includes(cat)) {
      setChangeCategories(changeCategories.filter(c => c !== cat));
    } else {
      setChangeCategories([...changeCategories, cat]);
    }
  };

  const toggleDoc = (doc: string) => {
    if (attachedDocuments.includes(doc)) {
      setAttachedDocuments(attachedDocuments.filter(d => d !== doc));
    } else {
      setAttachedDocuments([...attachedDocuments, doc]);
    }
  };

  const handleSave = () => {
    const data: CertChangeApplicationData = {
      appliedDate: new Date().toISOString().substring(0, 10),
      changeCategories,
      newCompanyNameKo,
      newCompanyNameEn,
      newCeoName,
      newAddressHead,
      newAddressPlant,
      scopeChangeType,
      newScopeDetails,
      desiredAuditDate,
      attachedDocuments,
      clientSignature: `${newCeoName} (인)`
    };
    onSaveData(data);
    alert('[F19-002 인증변경신청서 저장 완료]\n인증변경 신청 내역이 본 심사 계약 및 시스템에 저장되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span>F19-002 인증변경신청서</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                  GMSCS 공인 양식
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                상호, 대표자, 사업자, 주소(소재지), 인증범위, 표준 변경에 따른 공식 변경신청서
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 text-xs text-slate-800 max-h-[75vh] overflow-y-auto">
          
          {/* 1. 기 인증현황 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>1. 기 인증현황</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block">고객명 (국문)</span>
                <strong className="text-slate-900">{company.companyName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">인증서 번호</span>
                <span className="font-mono text-slate-800 font-bold">{certNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">대표자</span>
                <span className="text-slate-800">{company.ceoName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">기 인증 표준</span>
                <span className="font-bold text-purple-700">{standards.join(', ')}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">사업장 주소</span>
              <span className="text-slate-700 text-[11px]">{company.address}</span>
            </div>
          </div>

          {/* 2. 변경 신청 내용 구분 */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              2. 변경 신청 구분 (다중 선택 가능)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['상호', '주소', '사업자', '범위', '표준', '기타'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`p-2 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                    changeCategories.includes(cat)
                      ? 'bg-purple-50 text-purple-900 border-purple-400 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat} 변경
                </button>
              ))}
            </div>
          </div>

          {/* 3. 변경 상세 내용 입력 */}
          <div className="space-y-4 border border-slate-200 rounded-xl p-4 bg-white">
            
            {/* 상호/대표자 변경 */}
            {changeCategories.includes('상호') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-purple-50/40 rounded-xl border border-purple-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 상호 (국문)</label>
                  <input
                    type="text"
                    value={newCompanyNameKo}
                    onChange={(e) => setNewCompanyNameKo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 상호 (영문)</label>
                  <input
                    type="text"
                    value={newCompanyNameEn}
                    onChange={(e) => setNewCompanyNameEn(e.target.value)}
                    placeholder="예: Hankook Tech Co., Ltd."
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 대표자</label>
                  <input
                    type="text"
                    value={newCeoName}
                    onChange={(e) => setNewCeoName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {/* 주소(사업장 이전) 변경 */}
            {changeCategories.includes('주소') && (
              <div className="space-y-2 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 본사 주소</label>
                  <input
                    type="text"
                    value={newAddressHead}
                    onChange={(e) => setNewAddressHead(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 공장/연구소 주소</label>
                  <input
                    type="text"
                    value={newAddressPlant}
                    onChange={(e) => setNewAddressPlant(e.target.value)}
                    placeholder="공장 이전 시 기재"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {/* 인증범위 변경 */}
            {changeCategories.includes('범위') && (
              <div className="space-y-2 p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-bold text-slate-700">범위 변경 구분:</span>
                  {(['추가', '이전', '축소', '기타'] as const).map(t => (
                    <label key={t} className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="scopeChangeType"
                        checked={scopeChangeType === t}
                        onChange={() => setScopeChangeType(t)}
                        className="text-emerald-600"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 인증 범위 상세</label>
                  <textarea
                    rows={2}
                    value={newScopeDetails}
                    onChange={(e) => setNewScopeDetails(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            )}

            {/* 심사희망시기 */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 확인 심사 희망 시기</label>
              <input
                type="date"
                value={desiredAuditDate}
                onChange={(e) => setDesiredAuditDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold"
              />
            </div>

          </div>

          {/* 4. 첨부 서류 체크리스트 (F19-002 원본 규정) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5 text-purple-600" />
              <span>첨부 서류 체크리스트</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                '사업자등록증사본',
                '등기부등본',
                '약도(소재지이전시)',
                '인증범위확인서',
                '조직도(개편시)',
                '매뉴얼 및 절차서 목록',
                'M&A 관련 계약서'
              ].map(doc => (
                <label key={doc} className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attachedDocuments.includes(doc)}
                    onChange={() => toggleDoc(doc)}
                    className="rounded text-purple-600"
                  />
                  <span>{doc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 인증원 확인란 안내 */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">[인증원 검토 처리 구분]</span>
              <span>접수 후 특별사후관리심사 또는 서류확인(인증범위확인서) 절차로 진행됩니다.</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
              GMSCS 인증심의 상정 연동
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 px-6 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>신청서 A4 인쇄</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-xs transition"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs shadow-md transition"
            >
              신청서 저장 및 계약 반영
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
