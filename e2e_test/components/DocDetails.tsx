import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Users2, 
  Scale, 
  Headphones, 
  Settings as SettingsIcon, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  Share2, 
  Download, 
  Tag, 
  Clock, 
  ShieldCheck,
  Send,
  ArrowRight
} from 'lucide-react';
import { DocumentRecord, DepartmentType, RoutingStatus } from '../types';

interface DocDetailsProps {
  doc: DocumentRecord;
  onBack: () => void;
  onUpdateDept?: (docId: string, newDept: DepartmentType) => void;
}

export const DocDetails: React.FC<DocDetailsProps> = ({
  doc,
  onBack,
  onUpdateDept
}) => {
  const [selectedDept, setSelectedDept] = useState<DepartmentType>((doc.department || 'Finance') as DepartmentType);
  const [isSaved, setIsSaved] = useState(false);

  const dept = selectedDept;
  const confPercent = Math.round(doc.confidence * 100);

  // Keywords detected
  const defaultKeywords = ['invoice', 'payment', 'bill', 'financial', 'statement'];
  const keywords = doc.extractedFields?.map(f => f.key.toLowerCase()) || defaultKeywords;

  const deptInfo: Record<DepartmentType, { icon: any; label: string; desc: string }> = {
    Finance: { icon: Building2, label: 'Finance', desc: 'Invoices, bills, payments, financial documents' },
    HR: { icon: Users2, label: 'HR', desc: 'Employee resumes, payroll, onboarding records' },
    Legal: { icon: Scale, label: 'Legal', desc: 'NDAs, compliance, contracts, terms' },
    Support: { icon: Headphones, label: 'Support', desc: 'Customer complaints, tickets, inquiries' },
    Operations: { icon: SettingsIcon, label: 'Operations', desc: 'Warehouse orders, inventory, supply chain' },
    General: { icon: FileText, label: 'General', desc: 'General office memos and communications' }
  };

  const currentMeta = deptInfo[dept] || deptInfo.Finance;
  const DeptIcon = currentMeta.icon;

  const handleDeptChange = (newDept: DepartmentType) => {
    setSelectedDept(newDept);
    if (onUpdateDept) {
      onUpdateDept(doc.id, newDept);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="space-y-6 page-enter max-w-5xl mx-auto">
      {/* Top Back to Queue Navigation Link matching Screen 5 */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#FFB45C] hover:text-[#F59E42] transition-all py-1.5 px-3.5 rounded-xl bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] hover:border-[#F59E42]/50 backdrop-blur-md shadow-sm hover:translate-x-[-2px]"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Queue</span>
        </button>
      </div>

      {/* Main Two-Column Inspection View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Large Document Preview Box */}
        <div className="lg:col-span-6 bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-md">
          <div className="w-full h-80 sm:h-96 rounded-xl bg-[#140D08] border border-[rgba(245,158,66,0.18)] overflow-hidden flex items-center justify-center relative p-3">
            {doc.thumbnail ? (
              <img
                src={doc.thumbnail}
                alt={doc.name}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#77706A]">
                <FileText className="w-16 h-16 stroke-[1.5]" />
                <span className="text-xs mt-2">No preview available</span>
              </div>
            )}
          </div>

          {/* Document metadata label below preview */}
          <div className="mt-5 pt-4 border-t border-[rgba(245,158,66,0.15)]">
            <h2 className="text-base font-bold text-[#F5F5F5] truncate">
              {doc.name}
            </h2>
            <p className="text-xs text-[#77706A] mt-0.5">
              {doc.fileSize || '245 KB'} | 12 Sept 2026, 10:24 AM
            </p>
          </div>
        </div>

        {/* Right Column: Routing Result & AI Summary */}
        <div className="lg:col-span-6 bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6 backdrop-blur-md">
          
          <div className="space-y-6">
            {/* Header: Routing Result */}
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(245,158,66,0.15)]">
              <h3 className="text-lg font-extrabold text-[#F5F5F5] tracking-tight">
                Routing Result
              </h3>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0E2018] text-emerald-400 border border-emerald-500/40 shadow-sm">
                Verified by Model
              </span>
            </div>

            {/* Department Details */}
            <div>
              <span className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider block mb-2">
                Department
              </span>
              <div className="p-4 rounded-xl bg-[rgba(26,18,13,0.75)] border border-[rgba(245,158,66,0.25)] flex items-center gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#F59E42]/10 border border-[#F59E42]/30 flex items-center justify-center text-[#F59E42] shrink-0">
                  <DeptIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#F5F5F5]">
                    {currentMeta.label}
                  </h4>
                  <p className="text-xs text-[#A8A29E] mt-0.5">
                    {currentMeta.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider">
                  Confidence
                </span>
                <span className="text-sm font-black text-emerald-400">
                  {confPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#2D1F16] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${confPercent}%` }}
                />
              </div>
            </div>

            {/* Keywords Detected Chips matching Screen 5 */}
            <div>
              <span className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider block mb-2">
                Keywords Detected
              </span>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[rgba(26,18,13,0.75)] border border-[rgba(245,158,66,0.20)] text-[#FFB45C]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Summary matching Screen 5 */}
            <div>
              <span className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider block mb-2">
                AI Summary
              </span>
              <div className="p-3.5 rounded-xl bg-[rgba(26,18,13,0.75)] border border-[rgba(245,158,66,0.18)] text-xs text-[#A8A29E] leading-relaxed">
                {doc.summary || 'This appears to be an invoice containing payment information, vendor details, and financial data.'}
              </div>
            </div>
          </div>

          {/* Action Button: View in Queue → */}
          <div className="pt-4 border-t border-[rgba(245,158,66,0.15)]">
            <button
              onClick={onBack}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#FFB45C] via-[#F59E42] to-[#E58525] hover:brightness-105 text-[#120D09] font-bold rounded-xl shadow-lg shadow-[#F59E42]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm hover:-translate-y-0.5"
            >
              <span>View in Queue</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DocDetails;
