import React, { useState } from 'react';
import {
  X,
  Building2,
  Award,
  Upload,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Plus,
  Trash2,
  RefreshCw,
  HelpCircle,
  MapPin
} from 'lucide-react';
import { Company, Auditor, TransferAttachment, StandardCode, AdditionalSite } from '../types';
import { GMS_AVAILABLE_STANDARDS } from '../constants/standards';
import { cleanCeoName, cleanPersonName, splitPersonAndPosition } from '../utils/personUtils';

export interface NewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCompany: Company) => void;
  auditors?: Auditor[];
}

export const NewCompanyModal: React.FC<NewCompanyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  auditors = []
}) => {
  // 폼 기본 상태
  const [formData, setFormData] = useState<Partial<Company>>({
    companyName: '',
    ceoName: '',
    bizNumber: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    clientType: '직영',
    totalEmployees: 15,
    industry: '',
    iafCode: '17',
    scope: '',
    riskLevel: 'Medium',
    consultant: 'GMSCS 본부 직영',
    agency: '본부 직영',
    // 전환 심사 필드
    isTransfer: false,
    transferType: '전환 사후심사',
    prevCertificationBody: '',
    prevCertNumber: '',
    prevCertIssueDate: '',
    prevCertExpiryDate: '',
    prevAuditDetails: '이전 인증기관 부적합 조치 완료 및 시스템 유지 양호',
    transferReason: '',
    transferAttachments: []
  });

  // 추가 확장 필드 (영문명 등)
  const [extraFields, setExtraFields] = useState({
    companyNameEng: '',
    ceoNameEng: '',
    addressEng: '',
    factoryAddress: '',
    factoryAddressEng: '',
    contactPosition: '품질부장',
    contactMobile: '',
    fax: '',
    corpNumber: '',
    auditTargetHeadcount: 15,
    shiftCount: 1,
    standards: ['ISO 9001:2015'] as string[],
    scopeEng: '',
    managingAuditorName: ''
  });

  // 복수 추가사업장 (Multi-Site) 상태
  const [additionalSites, setAdditionalSites] = useState<AdditionalSite[]>([]);

  if (!isOpen) return null;

  // 추가사업장 추가/수정/삭제 핸들러
  const handleAddSite = () => {
    setAdditionalSites(prev => [
      ...prev,
      {
        id: `site-${Date.now()}-${prev.length + 1}`,
        siteName: `제${prev.length + 2}공장`,
        address: '',
        zipCode: '',
        phone: '',
        employees: 5,
        scope: ''
      }
    ]);
  };

  const handleUpdateSite = (id: string, field: keyof AdditionalSite, value: any) => {
    setAdditionalSites(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleRemoveSite = (id: string) => {
    setAdditionalSites(prev => prev.filter(s => s.id !== id));
  };

  // 인증 규격 토글
  const toggleStandard = (std: string) => {
    setExtraFields(prev => {
      const exists = prev.standards.includes(std);
      return {
        ...prev,
        standards: exists ? prev.standards.filter(s => s !== std) : [...prev.standards, std]
      };
    });
  };

  // 이전 심사보고서/인증서 파일 업로드 핸들러
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newAtt: TransferAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          dataUrl,
          uploadedAt: new Date().toISOString().slice(0, 10)
        };

        setFormData(prev => ({
          ...prev,
          transferAttachments: [...(prev.transferAttachments || []), newAtt]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      transferAttachments: (prev.transferAttachments || []).filter(a => a.id !== id)
    }));
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName?.trim()) {
      alert('기업명을 입력해 주세요.');
      return;
    }
    if (!formData.ceoName?.trim()) {
      alert('대표자명을 입력해 주세요.');
      return;
    }
    if (!formData.bizNumber?.trim()) {
      alert('사업자등록번호를 입력해 주세요.');
      return;
    }
    if (!formData.address?.trim()) {
      alert('소재지 주소를 입력해 주세요.');
      return;
    }

    if (formData.isTransfer) {
      if (!formData.prevCertificationBody?.trim()) {
        alert('전환 심사의 경우 [이전 인증기관명]을 반드시 입력해 주세요.');
        return;
      }
    }

    const cleanedCeo = cleanCeoName(formData.ceoName);
    const parsedContact = splitPersonAndPosition(formData.contactPerson || formData.ceoName || '담당자', extraFields.contactPosition || '품질부장');

    const compId = `COMP-NEW-${Date.now()}`;
    const newCompany: Company = {
      id: compId,
      companyName: formData.companyName.trim(),
      ceoName: cleanedCeo,
      bizNumber: formData.bizNumber.trim(),
      address: formData.address.trim(),
      contactPerson: parsedContact.name,
      contactPosition: extraFields.contactPosition || parsedContact.position,
      contactPhone: formData.contactPhone || '02-000-0000',
      contactEmail: formData.contactEmail || 'contact@company.co.kr',
      clientType: formData.clientType || '직영',
      totalEmployees: Number(formData.totalEmployees) || 10,
      industry: formData.industry || '제조업',
      iafCode: formData.iafCode || '17',
      scope: formData.scope || `${formData.industry || '제품'}의 제조 및 서비스`,
      riskLevel: formData.riskLevel || 'Medium',
      createdAt: new Date().toISOString().slice(0, 10),
      consultant: formData.consultant,
      agency: formData.agency,
      initialCertDate: new Date().toISOString().slice(0, 10),
      lastAuditDate: new Date().toISOString().slice(0, 10),
      expiryDate: `${new Date().getFullYear() + 3}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
      additionalSites: additionalSites.filter(s => s.address.trim() || s.siteName.trim()),
      // 전환 심사 데이터
      isTransfer: formData.isTransfer,
      transferType: formData.isTransfer ? formData.transferType : undefined,
      prevCertificationBody: formData.isTransfer ? formData.prevCertificationBody : undefined,
      prevCertNumber: formData.isTransfer ? formData.prevCertNumber : undefined,
      prevCertIssueDate: formData.isTransfer ? formData.prevCertIssueDate : undefined,
      prevCertExpiryDate: formData.isTransfer ? formData.prevCertExpiryDate : undefined,
      prevAuditDetails: formData.isTransfer ? formData.prevAuditDetails : undefined,
      transferReason: formData.isTransfer ? formData.transferReason : undefined,
      transferAttachments: formData.isTransfer ? formData.transferAttachments : undefined,
      // 확장 필드
      ...({
        companyNameEng: extraFields.companyNameEng,
        ceoNameEng: extraFields.ceoNameEng,
        addressEng: extraFields.addressEng,
        factoryAddress: additionalSites[0]?.address || extraFields.factoryAddress,
        factoryAddressEng: extraFields.factoryAddressEng,
        contactPosition: extraFields.contactPosition || parsedContact.position,
        contactMobile: extraFields.contactMobile,
        fax: extraFields.fax,
        corpNumber: extraFields.corpNumber,
        auditTargetHeadcount: Number(extraFields.auditTargetHeadcount) || Number(formData.totalEmployees) || 10,
        shiftCount: Number(extraFields.shiftCount) || 1,
        standards: extraFields.standards.join(', '),
        scopeEng: extraFields.scopeEng,
        assignedAuditorName: extraFields.managingAuditorName || auditors[0]?.name || '남경호'
      } as any)
    };

    onSave(newCompany);
    alert(`[${newCompany.companyName}] 신규 고객사가 성공적으로 등록되었습니다.\n추가사업장 ${newCompany.additionalSites?.length || 0}개소가 저장되었으며, 심사진행현황 및 심사문서 7종에서 즉시 호출됩니다.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* 모달 상단 헤더 */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-700/80 flex items-center justify-center text-cyan-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">신규 인증 고객사 등록</h3>
              <p className="text-[11px] text-slate-400">
                신규 인증 기업 및 타 인증원 전환(Transfer) 고객사의 마스터 원부를 등록합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 폼 (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
          
          {/* 1. 인증 구분 선택 (일반 신규 vs 타 기관 전환) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-700" />
                <span>인증 구분 및 전환(Transfer) 여부</span>
              </span>
              <span className="text-[11px] text-slate-500">
                타 인증기관에서 이전하는 경우 전환 심사 항목을 기재하세요.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  !formData.isTransfer 
                    ? 'border-cyan-600 bg-cyan-50/60 ring-2 ring-cyan-600/20' 
                    : 'border-slate-200 bg-white hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="transferChoice"
                  checked={!formData.isTransfer}
                  onChange={() => setFormData({ ...formData, isTransfer: false })}
                  className="mt-0.5 text-cyan-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block text-xs">일반 신규 인증</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    GMSCS에서 최초로 ISO 인증을 신청하는 기업 (1단계·2단계 심사)
                  </span>
                </div>
              </label>

              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  formData.isTransfer 
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20' 
                    : 'border-slate-200 bg-white hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="transferChoice"
                  checked={formData.isTransfer}
                  onChange={() => setFormData({ ...formData, isTransfer: true })}
                  className="mt-0.5 text-amber-600"
                />
                <div>
                  <span className="font-bold text-amber-950 block text-xs flex items-center gap-1">
                    <span>타 기관 전환(Transfer) 심사</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-mono font-bold">권장</span>
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    타 공인 인증원에서 GMSCS로 이관·전환하는 기업 (사후/갱신 전환)
                  </span>
                </div>
              </label>
            </div>

            {/* 타 기관 전환 시 활성화되는 상세 카드 */}
            {formData.isTransfer && (
              <div className="mt-3 p-4 bg-amber-50/90 border border-amber-300 rounded-xl space-y-4 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs pb-2 border-b border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>이전 인증기관 정보 및 전환 심사 세부사항 (필수 기재)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">전환 심사 유형 *</label>
                    <select
                      value={formData.transferType}
                      onChange={(e) => setFormData({ ...formData, transferType: e.target.value as any })}
                      className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="전환 사후심사">전환 사후심사 (1차/2차)</option>
                      <option value="전환 갱신심사">전환 갱신심사 (재인증)</option>
                      <option value="전환 규격추가">전환 규격추가</option>
                      <option value="단순 기관이관">단순 인증기관 이관</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">이전 인증기관명 *</label>
                    <input
                      type="text"
                      placeholder="예: KSR인증원, 한국품질재단 등"
                      value={formData.prevCertificationBody || ''}
                      onChange={(e) => setFormData({ ...formData, prevCertificationBody: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">이전 인증번호</label>
                    <input
                      type="text"
                      placeholder="예: KSR-2309-08"
                      value={formData.prevCertNumber || ''}
                      onChange={(e) => setFormData({ ...formData, prevCertNumber: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">이전 인증 만료일</label>
                    <input
                      type="date"
                      value={formData.prevCertExpiryDate || ''}
                      onChange={(e) => setFormData({ ...formData, prevCertExpiryDate: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      전환 사유 및 대체 시작 배경 *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="예: 이전 인증기관 수수료 체계 변경에 따른 기관 전환, 컨설팅 협력기관 변경으로 인한 갱신 전환 등 기술"
                      value={formData.transferReason || ''}
                      onChange={(e) => setFormData({ ...formData, transferReason: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs leading-relaxed focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      이전 심사 결과 및 부적합(NCR) 조치 현황
                    </label>
                    <textarea
                      rows={2}
                      placeholder="이전 심사 시 발견된 부적합 사항 조치 완료 여부 및 특이사항 기술"
                      value={formData.prevAuditDetails || ''}
                      onChange={(e) => setFormData({ ...formData, prevAuditDetails: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs leading-relaxed focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 이전 심사보고서 및 인증서 사본 첨부 컨트롤러 */}
                <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-amber-700" />
                      <span className="font-bold text-slate-800">이전 심사보고서 &amp; 이전 인증서 사본 첨부</span>
                      <span className="text-[10px] text-slate-500">
                        ({(formData.transferAttachments || []).length}건 등록됨)
                      </span>
                    </div>

                    <label className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded font-bold text-xs flex items-center gap-1 cursor-pointer transition">
                      <Upload className="w-3 h-3" />
                      <span>파일 추가 (PDF / 사본)</span>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* 첨부파일 목록 */}
                  {(formData.transferAttachments || []).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(formData.transferAttachments || []).map(att => (
                        <div key={att.id} className="flex items-center justify-between p-2 bg-amber-50/50 border border-amber-200 rounded text-[11px]">
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{att.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">({att.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. 기업 기본 정보 (사업자번호, 대표자, 주소 등) */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-cyan-700" />
              <span>기업 기본 정보</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">기업명 (국문) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 주식회사 우진테크"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">기업명 (영문)</label>
                <input
                  type="text"
                  placeholder="예: WOOJIN TECH CO., LTD."
                  value={extraFields.companyNameEng}
                  onChange={(e) => setExtraFields({ ...extraFields, companyNameEng: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">사업자등록번호 *</label>
                <input
                  type="text"
                  required
                  placeholder="000-00-00000"
                  value={formData.bizNumber || ''}
                  onChange={(e) => setFormData({ ...formData, bizNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">대표자명 (국문) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 박진용"
                  value={formData.ceoName || ''}
                  onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">대표자명 (영문)</label>
                <input
                  type="text"
                  placeholder="예: Jin-Yong Park"
                  value={extraFields.ceoNameEng}
                  onChange={(e) => setExtraFields({ ...extraFields, ceoNameEng: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">법인등록번호</label>
                <input
                  type="text"
                  placeholder="000000-0000000"
                  value={extraFields.corpNumber}
                  onChange={(e) => setExtraFields({ ...extraFields, corpNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">본사 주소 (대표 사업장) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 경기 군포시 공단로140번길 46, 206호"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">본사 주소 (영문)</label>
                <input
                  type="text"
                  placeholder="예: #206, 46, Gongdan-ro 140beon-gil, Gunpo-si, Gyeonggi-do, Korea"
                  value={extraFields.addressEng}
                  onChange={(e) => setExtraFields({ ...extraFields, addressEng: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            {/* 복수 추가사업장 (Multi-Site) 동적 관리 카드 */}
            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-700" />
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">추가사업장 (지사 / 공장 / 연구소 등 Multi-Site)</h5>
                    <p className="text-[11px] text-slate-500">본사 외 심사 대상 추가 사업장이 있는 경우 모두 등록합니다. (심사계획서 및 보고서 자동 반영)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddSite}
                  className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ 추가사업장 추가</span>
                </button>
              </div>

              {additionalSites.length === 0 ? (
                <div className="text-center py-4 bg-white border border-dashed border-slate-300 rounded-lg text-xs text-slate-500">
                  등록된 추가사업장이 없습니다. (단일 본사 사업장만 있는 경우 생략 가능)
                </div>
              ) : (
                <div className="space-y-2.5">
                  {additionalSites.map((site, index) => (
                    <div key={site.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2 relative">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-800">추가사업장 #{index + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSite(site.id)}
                          className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1 rounded transition-colors text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="block text-slate-600 font-medium text-[11px] mb-0.5">사업장명 (공장/지사명)</label>
                          <input
                            type="text"
                            placeholder="예: 제2공장 (주조라인)"
                            value={site.siteName}
                            onChange={(e) => handleUpdateSite(site.id, 'siteName', e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-slate-600 font-medium text-[11px] mb-0.5">사업장 주소 (소재지)</label>
                          <input
                            type="text"
                            placeholder="예: 충남 아산시 둔포면 아산밸리로 123"
                            value={site.address}
                            onChange={(e) => handleUpdateSite(site.id, 'address', e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium text-[11px] mb-0.5">인원수 (명)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="5"
                            value={site.employees || ''}
                            onChange={(e) => handleUpdateSite(site.id, 'employees', Number(e.target.value))}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium text-[11px] mb-0.5">전화번호</label>
                          <input
                            type="text"
                            placeholder="예: 041-530-0000"
                            value={site.phone || ''}
                            onChange={(e) => handleUpdateSite(site.id, 'phone', e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-slate-600 font-medium text-[11px] mb-0.5">해당 사업장 활동/생산품목 (Scope)</label>
                          <input
                            type="text"
                            placeholder="예: 자동차용 알루미늄 다이캐스팅 주조 및 가공"
                            value={site.scope || ''}
                            onChange={(e) => handleUpdateSite(site.id, 'scope', e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. 담당자 및 연락처 */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-cyan-700" />
              <span>고객 실무 담당자 및 통신 정보</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">담당자 성명</label>
                <input
                  type="text"
                  placeholder="예: 박진웅"
                  value={formData.contactPerson || ''}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">직위/직책</label>
                <input
                  type="text"
                  placeholder="예: 품질부장"
                  value={extraFields.contactPosition}
                  onChange={(e) => setExtraFields({ ...extraFields, contactPosition: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">대표 전화 / 유선</label>
                <input
                  type="text"
                  placeholder="예: 031-360-7078"
                  value={formData.contactPhone || ''}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">담당자 이메일</label>
                <input
                  type="email"
                  placeholder="contact@company.co.kr"
                  value={formData.contactEmail || ''}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. 인증 대상 규격 및 인증 범위 */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-700" />
              <span>신청 인증 규격 &amp; 인증범위 (Scope)</span>
            </h4>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">신청 인증 규격 (다중 선택 가능) *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GMS_AVAILABLE_STANDARDS.slice(0, 8).map(std => {
                  const checked = extraFields.standards.includes(std.code);
                  return (
                    <label
                      key={std.code}
                      onClick={() => toggleStandard(std.code)}
                      className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                        checked 
                          ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 font-bold' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="rounded text-cyan-700"
                      />
                      <span className="text-xs">{std.code}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">업종 (주요 생산품)</label>
                <input
                  type="text"
                  placeholder="예: 정밀 금속 절삭가공 제품 제조"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">IAF 코드</label>
                <input
                  type="text"
                  placeholder="예: 17 (기계 및 장비)"
                  value={formData.iafCode || ''}
                  onChange={(e) => setFormData({ ...formData, iafCode: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">종업원 수 (심사 대상 인원)</label>
                <input
                  type="number"
                  min={1}
                  value={formData.totalEmployees || 15}
                  onChange={(e) => setFormData({ ...formData, totalEmployees: parseInt(e.target.value, 10) || 1 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">인증 범위 (국문)</label>
                <textarea
                  rows={2}
                  placeholder="예: 금속 절삭가공 제품의 제조(AL가공, SUS가공, 광학부품, 산업용 카메라부품)"
                  value={formData.scope || ''}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs leading-relaxed focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">인증 범위 (영문 Scope)</label>
                <textarea
                  rows={2}
                  placeholder="예: Manufacture of metal machining parts (AL machining, SUS machining, optical parts)"
                  value={extraFields.scopeEng}
                  onChange={(e) => setExtraFields({ ...extraFields, scopeEng: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono leading-relaxed focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. 영업 유치 기관 & 배정 심사팀장 */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-cyan-700" />
              <span>영업 유치 기관 및 배정 희망 심사팀장</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">유치 기관 / 컨설턴트</label>
                <input
                  type="text"
                  placeholder="예: GMSCS 본부 직영 또는 컨설팅사명"
                  value={formData.consultant || ''}
                  onChange={(e) => setFormData({ ...formData, consultant: e.target.value, agency: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">배정 희망 심사팀장</label>
                <select
                  value={extraFields.managingAuditorName}
                  onChange={(e) => setExtraFields({ ...extraFields, managingAuditorName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                >
                  <option value="">-- 심사팀장 선택 (미지정 시 사무국 자동 배정) --</option>
                  {auditors.map(a => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({a.grade || '선임심사원'} / {a.affiliation || '비상근'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>신규 고객사 등록 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
