import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Trash2, 
  Send, 
  Building2, 
  Users2, 
  Scale, 
  Headphones, 
  Settings as SettingsIcon, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { DepartmentType, DocCategory, ClassificationResult } from '../types';
import { classifyDocumentCustom } from '../services/customModelService';

interface RouteImageViewProps {
  onRouteImage: (
    fileData: string, 
    fileName: string, 
    fileSize: string, 
    department: DepartmentType, 
    confidence: number,
    category: DocCategory,
    classification: ClassificationResult
  ) => Promise<void>;
  isProcessing: boolean;
}

export const RouteImageView: React.FC<RouteImageViewProps> = ({
  onRouteImage,
  isProcessing
}) => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    previewUrl: string;
    base64: string;
  } | null>(null);

  const [detectedDept, setDetectedDept] = useState<DepartmentType>('Finance');
  const [selectedDeptOverride, setSelectedDeptOverride] = useState<DepartmentType>('Finance');
  const [confidence, setConfidence] = useState<number>(0);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [modelState, setModelState] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [modelError, setModelError] = useState<string | null>(null);
  const [ocrPreview, setOcrPreview] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Department metadata
  const deptInfo: Record<DepartmentType, {
    icon: any;
    label: string;
    description: string;
    category: DocCategory;
    color: string;
  }> = {
    Finance: {
      icon: Building2,
      label: 'Finance',
      description: 'Invoices, bills, payments, financial documents',
      category: DocCategory.INVOICE,
      color: 'amber'
    },
    HR: {
      icon: Users2,
      label: 'HR',
      description: 'Employee resumes, onboarding, contracts',
      category: DocCategory.RESUME,
      color: 'purple'
    },
    Legal: {
      icon: Scale,
      label: 'Legal',
      description: 'NDAs, compliance, agreements, terms',
      category: DocCategory.LEGAL,
      color: 'emerald'
    },
    Support: {
      icon: Headphones,
      label: 'Support',
      description: 'Customer complaints, tickets, feedback',
      category: DocCategory.SUPPORT,
      color: 'orange'
    },
    Operations: {
      icon: SettingsIcon,
      label: 'Operations',
      description: 'Warehouse orders, inventory, manifests',
      category: DocCategory.OPERATIONS,
      color: 'cyan'
    },
    General: {
      icon: FileText,
      label: 'General',
      description: 'General office files, memos, team photos',
      category: DocCategory.GENERAL,
      color: 'slate'
    }
  };

  const [isProcessingStep, setIsProcessingStep] = useState<
    'idle' | 'uploading' | 'analyzing' | 'classifying' | 'routing' | 'complete'
  >('idle');
  const [showRoutingDiagram, setShowRoutingDiagram] = useState(false);

  const sampleDocs = [
    {
      name: 'invoice_2048.jpg',
      size: '245 KB',
      dept: 'Finance' as DepartmentType,
      conf: 0.96,
      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      keywords: ['invoice', 'subtotal', 'vendor', 'tax', 'payable']
    },
    {
      name: 'employee_resume.png',
      size: '310 KB',
      dept: 'HR' as DepartmentType,
      conf: 0.92,
      url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
      keywords: ['resume', 'experience', 'education', 'skills', 'applicant']
    },
    {
      name: 'nda_partner.jpg',
      size: '412 KB',
      dept: 'Legal' as DepartmentType,
      conf: 0.94,
      url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      keywords: ['confidential', 'agreement', 'clause', 'jurisdiction', 'liability']
    },
    {
      name: 'customer_complaint.png',
      size: '198 KB',
      dept: 'Support' as DepartmentType,
      conf: 0.89,
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      keywords: ['ticket', 'issue', 'escalation', 'billing dispute', 'customer']
    },
    {
      name: 'warehouse_order.jpg',
      size: '520 KB',
      dept: 'Operations' as DepartmentType,
      conf: 0.91,
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
      keywords: ['manifest', 'logistics', 'tracking', 'palette', 'inventory']
    }
  ];

  const dataUrlToPayload = (dataUrl: string) => {
    const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/s);
    return {
      mimeType: match?.[1] || 'image/jpeg',
      base64: match?.[2] || dataUrl
    };
  };

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });

  const applyClassification = (result: ClassificationResult) => {
    const dept = result.department || 'General';
    setClassification(result);
    setDetectedDept(dept);
    setSelectedDeptOverride(dept);
    setConfidence(result.confidence);
    setOcrPreview(result.ocrText || '');
    setModelState('complete');
    setModelError(null);
  };

  const classifyDataUrl = async (dataUrl: string, mimeType?: string) => {
    setModelState('processing');
    setModelError(null);
    try {
      const payload = dataUrlToPayload(dataUrl);
      const result = await classifyDocumentCustom(payload.base64, mimeType || payload.mimeType);
      applyClassification(result);
      return result;
    } catch (error: any) {
      console.error('Custom model classification failed:', error);
      setModelState('error');
      setModelError(error?.message || 'Custom model classification failed.');
      setClassification(null);
      setConfidence(0);
      return null;
    }
  };

  const handleSelectSample = async (sample: typeof sampleDocs[0]) => {
    setIsSuccess(false);
    setClassification(null);
    setModelError(null);
    setModelState('processing');

    try {
      const response = await fetch(sample.url);
      if (!response.ok) throw new Error('Could not load demo image.');
      const blob = await response.blob();
      const file = new File([blob], sample.name, { type: blob.type || 'image/jpeg' });
      const dataUrl = await readFileAsDataUrl(file);
      setSelectedFile({
        name: sample.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        previewUrl: dataUrl,
        base64: dataUrl
      });
      await classifyDataUrl(dataUrl, file.type);
    } catch (error: any) {
      setModelState('error');
      setModelError(error?.message || 'Unable to load demo image.');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setModelState('error');
      setModelError('Please upload an image or PDF (JPG, PNG, WEBP, PDF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setModelState('error');
      setModelError('Maximum file size is 10MB.');
      return;
    }

    setIsSuccess(false);
    setClassification(null);
    setModelError(null);
    const dataUrl = await readFileAsDataUrl(file);
    const sizeStr = `${(file.size / 1024).toFixed(0)} KB`;

    setSelectedFile({
      name: file.name,
      size: sizeStr,
      previewUrl: dataUrl,
      base64: dataUrl
    });

    await classifyDataUrl(dataUrl, file.type);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRouteSubmit = async () => {
    if (!selectedFile || !classification || modelState !== 'complete') return;

    const finalDept = selectedDeptOverride || detectedDept;
    const meta = deptInfo[finalDept];

    setShowRoutingDiagram(true);
    setIsProcessingStep('uploading');
    await new Promise(r => setTimeout(r, 350));
    setIsProcessingStep('analyzing');
    await new Promise(r => setTimeout(r, 450));
    setIsProcessingStep('classifying');
    await new Promise(r => setTimeout(r, 500));
    setIsProcessingStep('routing');

    await onRouteImage(
      selectedFile.base64 || selectedFile.previewUrl,
      selectedFile.name,
      selectedFile.size,
      finalDept,
      classification.confidence,
      classification.category,
      {
        ...classification,
        department: finalDept
      }
    );

    setIsProcessingStep('complete');
    await new Promise(r => setTimeout(r, 600));
    setShowRoutingDiagram(false);
    setIsProcessingStep('idle');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 4500);
  };

  const currentDeptMeta = deptInfo[selectedDeptOverride || detectedDept] || deptInfo.General;
  const DeptIcon = currentDeptMeta.icon;

  return (
    <div className="space-y-8 page-enter max-w-5xl mx-auto">
      {/* Page Title & Subtitle matching screenshot */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
          Route a Document
        </h1>
        <p className="text-xs sm:text-sm text-[#A8A29E] mt-1 font-medium">
          Upload an image or PDF and we'll automatically analyze, classify, and route it to the right department.
        </p>
      </div>

      {/* Large Drag and Drop Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 backdrop-blur-xl ${
          dragActive 
            ? 'border-[#FFB45C] bg-[rgba(34,23,17,0.92)] shadow-[0_0_45px_rgba(245,158,66,0.35)] scale-[1.01]' 
            : 'border-[rgba(245,158,66,0.25)] hover:border-[#FFB45C]/70 bg-[rgba(18,12,8,0.78)] hover:bg-[rgba(26,17,11,0.88)] hover:shadow-[0_0_35px_rgba(245,158,66,0.18)]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F59E42]/10 border border-[#F59E42]/30 flex items-center justify-center text-[#F59E42] shadow-md shadow-[#F59E42]/10">
            <UploadCloud className="w-7 h-7 stroke-[2]" />
          </div>

          <div>
            <p className="text-base font-bold text-[#F5F5F5]">
              Drag and drop an image or PDF here
            </p>
            <p className="text-xs text-[#FFB45C] font-semibold mt-1 hover:underline">
              or click to browse
            </p>
          </div>

          <p className="text-[11px] text-[#77706A]">
            Supported formats: JPG, PNG, JPEG, WEBP, PDF (Max 10MB)
          </p>
        </div>
      </div>

      {/* Quick Test Document Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-[#A8A29E] flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E42]" />
          <span>Quick Sample Files:</span>
        </span>
        {sampleDocs.map((sample) => (
          <button
            key={sample.name}
            type="button"
            onClick={() => handleSelectSample(sample)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              selectedFile?.name === sample.name
                ? 'bg-[#F59E42]/20 text-[#FFB45C] border-[#F59E42]/50 shadow-sm shadow-[#F59E42]/20'
                : 'bg-[rgba(20,13,9,0.72)] hover:bg-[rgba(29,18,11,0.85)] text-[#A8A29E] hover:text-[#F5F5F5] border-[rgba(245,158,66,0.18)] hover:border-[#F59E42]/40'
            }`}
          >
            {sample.name}
          </button>
        ))}
      </div>

      {/* Side-by-Side Review Section (Screen 3 in screenshot) */}
      {selectedFile && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          {/* Left Preview Box */}
          <div className="md:col-span-5 bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-2xl p-5 shadow-xl flex flex-col justify-between backdrop-blur-md">
            <div className="w-full h-56 sm:h-64 rounded-xl bg-[#140D08] border border-[rgba(245,158,66,0.18)] overflow-hidden flex items-center justify-center relative group">
              {selectedFile.name.toLowerCase().endsWith('.pdf') ? (
                <div className="flex flex-col items-center gap-3 text-[#FFB45C]">
                  <FileText className="w-12 h-12" />
                  <span className="text-xs font-semibold text-[#A8A29E]">PDF document ready for OCR</span>
                </div>
              ) : (
                <img
                  src={selectedFile.previewUrl}
                  alt={selectedFile.name}
                  className="w-full h-full object-contain p-2"
                />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-[rgba(245,158,66,0.15)]">
              <div>
                <p className="text-xs font-bold text-[#F5F5F5] truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-[#77706A] mt-0.5">
                  {selectedFile.size}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-red-950/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Right Routing Result Box */}
          <div className="md:col-span-7 bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-md">
            <div className="space-y-5">
              {/* Header with Confidence Pill */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#F5F5F5] tracking-tight">
                  Routing Result
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${modelState === 'complete' ? 'bg-[#0E2018] text-emerald-400 border-emerald-500/40' : 'bg-[#2A1D12] text-[#FFB45C] border-[#F59E42]/30'}`}>
                  {modelState === 'complete' ? `${Math.round(confidence * 100)}% confidence` : modelState === 'processing' ? 'Analyzing…' : 'Model required'}
                </span>
              </div>

              {/* Detected Department Card */}
              <div>
                <span className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider block mb-2">
                  Detected Department
                </span>

                <div className="p-4 rounded-xl bg-[rgba(26,18,13,0.75)] border border-[rgba(245,158,66,0.30)] flex items-start gap-4 shadow-md">
                  <div className="w-11 h-11 rounded-xl bg-[#F59E42]/10 border border-[#F59E42]/30 flex items-center justify-center text-[#F59E42] shrink-0 mt-0.5">
                    <DeptIcon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#F5F5F5]">
                      {currentDeptMeta.label}
                    </h4>
                    <p className="text-xs text-[#A8A29E] mt-0.5 leading-relaxed">
                      {currentDeptMeta.description}
                    </p>
                  </div>
                </div>
              </div>

            {/* Custom model explanation */}
            <div>
              <span className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider block mb-2">
                Custom Model Analysis
              </span>
              <div className="p-3.5 rounded-xl bg-[rgba(26,18,13,0.75)] border border-[rgba(245,158,66,0.18)] space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#FFB45C]">
                    <span className={`w-1.5 h-1.5 rounded-full ${modelState === 'complete' ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : modelState === 'processing' ? 'bg-[#FFB45C] animate-pulse' : 'bg-red-400'}`} />
                    ImageRoute Custom PyTorch
                  </span>
                  <span className="text-[10px] font-mono text-[#77706A]">EasyOCR + PyTorch</span>
                </div>
                <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                  {classification?.summary || (modelState === 'processing' ? 'Running OCR and local model inference…' : 'Upload an image to run the local classifier.')}
                </p>
                {ocrPreview && (
                  <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-[#77706A] mb-1">OCR preview</p>
                    <p className="text-[10px] text-[#A8A29E] line-clamp-3 leading-relaxed">{ocrPreview}</p>
                  </div>
                )}
                {modelError && (
                  <p className="text-[10px] text-red-300 bg-red-950/30 border border-red-500/20 rounded-lg px-3 py-2">{modelError}</p>
                )}
              </div>
            </div>

            {/* Change Department (Optional) Selector */}
            <div>
              <label className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider block mb-2">
                Change Department (optional)
              </label>
              <div className="relative">
                <select
                  value={selectedDeptOverride}
                  onChange={(e) => setSelectedDeptOverride(e.target.value as DepartmentType)}
                  className="w-full appearance-none bg-[rgba(26,18,13,0.8)] border border-[rgba(245,158,66,0.20)] hover:border-[#F59E42]/50 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#F5F5F5] focus:outline-none focus:border-[#F59E42] transition-colors pr-10 cursor-pointer"
                >
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Legal">Legal</option>
                  <option value="Support">Support</option>
                  <option value="Operations">Operations</option>
                  <option value="General">General</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#77706A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-6">
            <button
              type="button"
              onClick={handleRouteSubmit}
              disabled={isProcessing || showRoutingDiagram || modelState !== 'complete' || !classification}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#FFB45C] via-[#F59E42] to-[#E58525] hover:brightness-105 text-[#120D09] font-bold rounded-xl shadow-lg shadow-[#F59E42]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm hover:-translate-y-0.5"
            >
              {showRoutingDiagram ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#120D09] border-t-transparent rounded-full animate-spin" />
                  <span>Processing Routing Decision...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#120D09]" />
                  <span>Successfully Routed to {selectedDeptOverride || detectedDept}!</span>
                </>
              ) : (
                <>
                  <span>Route with Custom Model</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* SECTION 19: SUCCESS STATE NOTIFICATION */}
      {isSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-[rgba(20,13,9,0.95)] border border-[rgba(245,158,66,0.35)] rounded-2xl p-4 shadow-2xl backdrop-blur-xl max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
                Image routed
              </h4>
              <p className="text-[11px] text-[#A8A29E] mt-0.5 font-medium">
                {selectedDeptOverride || detectedDept} · {Math.round(confidence * 100)}% confidence
              </p>
            </div>
          </div>
          {/* Subtle amber line animation on bottom edge */}
          <div className="w-full h-0.5 bg-[#2D1F16] rounded-full overflow-hidden mt-3">
            <div className="h-full bg-gradient-to-r from-[#FFB45C] to-[#E58525] w-full animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* SECTION 17 & 18: SIGNATURE ROUTING ANIMATION & MULTI-STEP PROGRESS MODAL */}
      {showRoutingDiagram && (
        <div className="fixed inset-0 z-50 bg-[#070605]/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-xl bg-[rgba(20,13,9,0.92)] border border-[rgba(245,158,66,0.35)] rounded-2xl p-6 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(245,158,66,0.15)] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E42]" />
                <h3 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                  Vision Routing Engine
                </h3>
              </div>
              <span className="text-[11px] text-[#A8A29E] font-mono">
                {isProcessingStep.toUpperCase()}
              </span>
            </div>

            {/* SECTION 17: Thin Animated Glowing Amber Progress Line */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-2">
                <span className={isProcessingStep === 'uploading' ? 'text-[#FFB45C]' : ''}>Uploading</span>
                <span className={isProcessingStep === 'analyzing' ? 'text-[#FFB45C]' : ''}>Analyzing</span>
                <span className={isProcessingStep === 'classifying' ? 'text-[#FFB45C]' : ''}>Classifying</span>
                <span className={isProcessingStep === 'routing' ? 'text-[#FFB45C]' : ''}>Routing</span>
                <span className={isProcessingStep === 'complete' ? 'text-emerald-400' : ''}>Complete</span>
              </div>
              <div className="w-full h-1 bg-[#1A110C] rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-[#FFB45C] via-[#F59E42] to-[#E58525] rounded-full transition-all duration-400 shadow-[0_0_12px_#F59E42]"
                  style={{
                    width: isProcessingStep === 'uploading' ? '20%' :
                           isProcessingStep === 'analyzing' ? '45%' :
                           isProcessingStep === 'classifying' ? '70%' :
                           isProcessingStep === 'routing' ? '90%' : '100%'
                  }}
                />
              </div>
            </div>

            {/* SECTION 18: Signature Routing Animation Diagram */}
            <div className="relative py-6 px-4 rounded-xl bg-[rgba(14,10,7,0.9)] border border-[rgba(245,158,66,0.18)] flex items-center justify-center min-h-[220px]">
              {/* Central Graph */}
              <div className="w-full flex items-center justify-between max-w-md relative">
                
                {/* Left: Image Card */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="w-14 h-14 rounded-xl bg-[#140D08] border border-[rgba(245,158,66,0.35)] flex items-center justify-center overflow-hidden shadow-lg">
                    {selectedFile?.previewUrl ? (
                      <img src={selectedFile.previewUrl} alt="source" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-6 h-6 text-[#FFB45C]" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-[#A8A29E] uppercase">Image</span>
                </div>

                {/* Connecting Line 1 */}
                <div className="flex-1 h-[2px] bg-[#2A1D15] relative mx-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFB45C] to-[#F59E42] animate-pulse" />
                  <div className="absolute w-2 h-2 rounded-full bg-[#FFB45C] shadow-[0_0_8px_#FFB45C] top-1/2 -translate-y-1/2 animate-[ping_1.5s_infinite]" />
                </div>

                {/* Center: AI Neural Hub */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(245,158,66,0.25)] to-[#150D09] border border-[#F59E42] flex items-center justify-center shadow-[0_0_15px_rgba(245,158,66,0.3)]">
                    <Sparkles className="w-6 h-6 text-[#FFB45C] animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#FFB45C] uppercase tracking-wider">Vision AI</span>
                </div>

                {/* Connecting Line 2 */}
                <div className="flex-1 h-[2px] bg-[#2A1D15] relative mx-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F59E42] to-[#FFB45C] animate-pulse" />
                </div>

                {/* Right: Target Department Routes with only Selected Illuminated */}
                <div className="flex flex-col gap-2 z-10">
                  {(['Finance', 'HR', 'Legal', 'Support', 'Operations'] as DepartmentType[]).map((d) => {
                    const isSelected = (selectedDeptOverride || detectedDept) === d;
                    const meta = deptInfo[d];
                    const DIcon = meta.icon;

                    return (
                      <div
                        key={d}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#FFB45C] to-[#E58525] text-[#120D09] shadow-[0_0_20px_rgba(245,158,66,0.4)] scale-105 ring-1 ring-[#FFB45C]'
                            : 'bg-[#150E0A] text-[#554D47] opacity-35'
                        }`}
                      >
                        <DIcon className="w-3.5 h-3.5" />
                        <span>{d}</span>
                        {isSelected && (
                          <span className="ml-1 text-[10px] bg-[#120D09] text-[#FFB45C] px-1.5 py-0.2 rounded font-mono">
                            {Math.round(confidence * 100)}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            <p className="text-[11px] text-[#A8A29E] text-center font-medium">
              Routing packet verified with cryptographic destination assurance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteImageView;
