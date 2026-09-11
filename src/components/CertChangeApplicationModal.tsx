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
  certNumber = 'QE240207 / OH240235',
  standards,
  initialData,
  onSaveData
}) => {
  if (!isOpen) return null;

  const [dept, setDept] = useState<string>(initialData?.dept || '품질경영팀');
  const [contactPerson, setContactPerson] = useState<string>(initialData?.contactPerson || company.contactPerson || '정순호 이사');
  const [tel, setTel] = useState<string>(initialData?.tel || company.contactPhone || '054-955-9197');
  const [fax, setFax] = useState<string>(initialData?.fax || '054-955-9198');
  const [currentScope, setCurrentScope] = useState<string>(
    initialData?.currentScope || company.scope || '자동차 및 선박기계, 공작기계, 건설기계, 일반산업기계용 주조물 제작'
  );

  const [changeCategories, setChangeCategories] = useState<('상호' | '주소' | '사업자' | '범위' | '표준' | '기타')[]>(
    initialData?.changeCategories || ['상호']
  );
  const [newCompanyNameKo, setNewCompanyNameKo] = useState<string>(initialData?.newCompanyNameKo || '(주)케이원메탈 2공장');
  const [newCompanyNameEn, setNewCompanyNameEn] = useState<string>(initialData?.newCompanyNameEn || 'K-WON METAL Co., Ltd. Factory 2');
  const [newCeoName, setNewCeoName] = useState<string>(initialData?.newCeoName || company.ceoName || '박경원');
  const [newManagerName, setNewManagerName] = useState<string>(initialData?.newManagerName || '정순호');
  const [newAddressHeadKo, setNewAddressHeadKo] = useState<string>(initialData?.newAddressHeadKo || company.address || '경북 고령군 다산면 다산산단 2길 88');
  const [newAddressPlantKo, setNewAddressPlantKo] = useState<string>(initialData?.newAddressPlantKo || '');
  const [scopeChangeType, setScopeChangeType] = useState<'이전' | '추가' | '축소' | '기타'>(initialData?.scopeChangeType || '추가');
  const [newScopeDetailsKo, setNewScopeDetailsKo] = useState<string>(
    initialData?.newScopeDetailsKo || '기존 인증범위에 ESG 경영시스템 및 친환경 리사이클 부품 제조 공정 추가'
  );
  const [desiredAuditDate, setDesiredAuditDate] = useState<string>(initialData?.desiredAuditDate || '2026-10-25');
  const [attachedDocuments, setAttachedDocuments] = useState<string[]>(
    initialData?.attachedDocuments || ['사업자등록증사본', '등기부등본', '약도']
  );

  // 인증원 확인란
  const [verifyMethod, setVerifyMethod] = useState<'서류확인' | '특별사후관리심사' | '인증변경심사'>(initialData?.verifyMethod || '서류확인');
  const [auditDays, setAuditDays] = useState<string>(initialData?.auditDays || '0.5 MD');
  const [auditFee, setAuditFee] = useState<number>(initialData?.auditFee || 200000);
  const [auditorChargeName, setAuditorChargeName] = useState<string>(initialData?.auditorChargeName || '김홍덕');
  const [reviewerName, setReviewerName] = useState<string>(initialData?.reviewerName || '남경호');
  const [approverName, setApproverName] = useState<string>(initialData?.approverName || '남경호');

  // 케이원메탈 2공장 실물 사례 원클릭 불러오기
  const applyK1MetalPreset = () => {
    setDept('경영지원본부');
    setContactPerson('정순호 이사');
    setTel('054-955-9197');
    setFax('054-955-9198');
    setCurrentScope('자동차 및 선박기계, 공작기계, 건설기계, 일반산업기계용 주조물 제작');
    setChangeCategories(['상호']);
    setNewCompanyNameKo('(주)케이원메탈 2공장');
    setNewCompanyNameEn('K-WON METAL Co., Ltd. Factory 2');
    setNewCeoName('박경원');
    setNewManagerName('정순호');
    setNewAddressHeadKo('경북 고령군 다산면 다산산단 2길 88');
    setAttachedDocuments(['사업자등록증사본', '등기부등본', '약도']);
    setVerifyMethod('서류확인');
    setAuditDays('0.5 MD');
    setAuditFee(200000);
  };

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
      companyName: company.companyName,
      certNumber,
      dept,
      contactPerson,
      tel,
      fax,
      currentScope,
      changeCategories,
      newCompanyNameKo,
      newCompanyNameEn,
      newCeoName,
      newManagerName,
      newAddressHeadKo,
      newAddressPlantKo,
      scopeChangeType,
      newScopeDetailsKo,
      desiredAuditDate,
      attachedDocuments,
      verifyMethod,
      auditDays,
      auditFee,
      auditorChargeName,
      reviewerName,
      approverName,
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
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold flex items-center gap-2">
                  <span>F19-002 인증변경신청서</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                    GMSCS 공인 양식
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={applyK1MetalPreset}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 border border-amber-400/40 font-bold text-[10px] transition flex items-center gap-1 cursor-pointer"
                  title="(주)케이원메탈 2공장 실물 변경신청서 사례 데이터 자동 입력"
                >
                  <span>★ 케이원메탈 실물사례 채우기</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                상호, 대표자, 사업자, 주소(공장/본사 이전), 인증범위(생산품목 추가) 변경 공식 신청서
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 text-xs text-slate-800 max-h-[75vh] overflow-y-auto">
          
          {/* 1. 기 인증현황 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>1. 기 인증현황 (등록 DB 연동)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">인증번호: {certNumber}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block font-medium">고객명 (국문)</span>
                <strong className="text-slate-900">{company.companyName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">담당부서 / 담당자</span>
                <span className="text-slate-800 font-bold">{dept} / {contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">대표자</span>
                <span className="text-slate-800 font-bold">{company.ceoName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">기 인증 표준</span>
                <span className="font-bold text-purple-700">{standards.join(', ')}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1 border-t border-slate-200/60">
              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-medium">등록 사업장 주소</span>
                <span className="text-slate-700">{company.address}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">TEL / FAX</span>
                <span className="text-slate-700 font-mono">{tel} / {fax}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">현 인증범위</span>
              <p className="text-slate-800 text-[11px] bg-white p-2 rounded-lg border border-slate-200 font-medium">
                {currentScope}
              </p>
            </div>
          </div>

          {/* 2. 변경 신청 내용 구분 */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              2. 변경 신청 구분 (실물 양식 체크박스)
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
                  {cat} 변경 {changeCategories.includes(cat) && '✓'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 변경 상세 내용 입력 */}
          <div className="space-y-4 border border-slate-200 rounded-xl p-4 bg-white">
            
            {/* 상호/대표자 변경 */}
            {changeCategories.includes('상호') && (
              <div className="space-y-3 p-3.5 bg-purple-50/40 rounded-xl border border-purple-200">
                <span className="font-extrabold text-purple-900 block text-xs">[상호 및 대표자 변경 내역]</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 국문 상호</label>
                    <input
                      type="text"
                      value={newCompanyNameKo}
                      onChange={(e) => setNewCompanyNameKo(e.target.value)}
                      placeholder="(주)케이원메탈 2공장"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 영문 상호</label>
                    <input
                      type="text"
                      value={newCompanyNameEn}
                      onChange={(e) => setNewCompanyNameEn(e.target.value)}
                      placeholder="K-WON METAL Co., Ltd. Factory 2"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 대표자</label>
                    <input
                      type="text"
                      value={newCeoName}
                      onChange={(e) => setNewCeoName(e.target.value)}
                      placeholder="박경원"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 담당자명</label>
                    <input
                      type="text"
                      value={newManagerName}
                      onChange={(e) => setNewManagerName(e.target.value)}
                      placeholder="정순호"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 주소(사업장 이전) 변경 */}
            {changeCategories.includes('주소') && (
              <div className="space-y-3 p-3.5 bg-blue-50/40 rounded-xl border border-blue-200">
                <span className="font-extrabold text-blue-900 block text-xs">[사업장 소재지 주소 변경 내역]</span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 본사 주소</label>
                  <input
                    type="text"
                    value={newAddressHeadKo}
                    onChange={(e) => setNewAddressHeadKo(e.target.value)}
                    placeholder="경북 고령군 다산면 다산산단 2길 88"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 공장/연구소 주소</label>
                  <input
                    type="text"
                    value={newAddressPlantKo}
                    onChange={(e) => setNewAddressPlantKo(e.target.value)}
                    placeholder="공장 이전 또는 2공장 추가 시 기재"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {/* 인증범위 변경 */}
            {changeCategories.includes('범위') && (
              <div className="space-y-3 p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200">
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-bold text-slate-800">범위 변경 구분:</span>
                  {(['추가', '이전', '축소', '기타'] as const).map(t => (
                    <label key={t} className="flex items-center space-x-1 cursor-pointer font-medium">
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 후 인증 범위 상세 (생산품목 추가 등)</label>
                  <textarea
                    rows={2}
                    value={newScopeDetailsKo}
                    onChange={(e) => setNewScopeDetailsKo(e.target.value)}
                    placeholder="기존 주조물 제작 공정에 정밀가공 및 알루미늄 다이캐스팅 품목 추가"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            )}

            {/* 심사희망시기 */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">변경 확인 심사 희망 시기</label>
                <input
                  type="date"
                  value={desiredAuditDate}
                  onChange={(e) => setDesiredAuditDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                />
              </div>
            </div>

          </div>

          {/* 4. 첨부 서류 체크리스트 (F19-002 원본 규정) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5 text-purple-600" />
              <span>첨부 서류 체크리스트 (실물 서식 제출 목록)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                '사업자등록증사본',
                '등기부등본',
                '약도',
                '인증범위확인서',
                '조직도',
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

          {/* 5. 인증원 확인란 (실물 F19-002 하단 표) */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-extrabold text-xs text-cyan-400">[인증원 확인란 (검토 및 승인)]</span>
              <span className="text-[10px] text-slate-400">서식번호: F19-002 (20231001)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">확인 방법</label>
                <select
                  value={verifyMethod}
                  onChange={(e) => setVerifyMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  <option value="서류확인">서류확인 (인증범위확인서 작성)</option>
                  <option value="특별사후관리심사">특별사후관리심사</option>
                  <option value="인증변경심사">인증변경심사</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">심사일수/기간</label>
                <input
                  type="text"
                  value={auditDays}
                  onChange={(e) => setAuditDays(e.target.value)}
                  placeholder="0.5 MD"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">심사비용 (신청/변경비)</label>
                <input
                  type="number"
                  value={auditFee}
                  onChange={(e) => setAuditFee(Number(e.target.value))}
                  placeholder="200000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2 text-[11px] text-slate-300">
              <div>담당: <strong className="text-white">{auditorChargeName}</strong></div>
              <div>검토: <strong className="text-white">{reviewerName}</strong></div>
              <div>승인: <strong className="text-white">{approverName}</strong></div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 px-6 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>A4 서식 인쇄</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-xs transition cursor-pointer"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              신청서 저장 및 심사관리 연동
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

