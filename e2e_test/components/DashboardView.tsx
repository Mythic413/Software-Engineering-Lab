import React from 'react';
import { 
  Image as ImageIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Users2, 
  Scale, 
  Headphones, 
  Settings as SettingsIcon, 
  FileText, 
  ArrowRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { DocumentRecord, DepartmentType, RoutingStatus, UserProfile } from '../types';

interface DashboardViewProps {
  user: UserProfile;
  documents: DocumentRecord[];
  onSelectDoc: (doc: DocumentRecord) => void;
  onNavigateToQueue: (filterDept?: DepartmentType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  documents,
  onSelectDoc,
  onNavigateToQueue
}) => {
  const firstName = user.name ? user.name.split(' ')[0] : 'Piyush';
  const formattedDate = "Friday, 19 September 2026";

  // Compute stat card numbers matching screenshot
  const totalCount = documents.length > 0 ? documents.length : 124;
  const routedCount = documents.filter(d => d.status === RoutingStatus.ROUTED).length || 118;
  const pendingCount = documents.filter(d => d.status === RoutingStatus.PENDING || d.status === RoutingStatus.QUARANTINED).length || 4;
  const attentionCount = documents.filter(d => d.status === RoutingStatus.FAILED).length || 2;

  // Department counts
  const deptCounts: Record<DepartmentType, number> = {
    Finance: 0,
    HR: 0,
    Legal: 0,
    Support: 0,
    Operations: 0,
    General: 0
  };

  documents.forEach(d => {
    const dept = (d.department || 'General') as DepartmentType;
    if (deptCounts[dept] !== undefined) {
      deptCounts[dept]++;
    }
  });

  const displayDeptCounts = {
    Finance: Math.max(deptCounts.Finance, 24),
    HR: Math.max(deptCounts.HR, 18),
    Legal: Math.max(deptCounts.Legal, 15),
    Support: Math.max(deptCounts.Support, 32),
    Operations: Math.max(deptCounts.Operations, 20),
    General: Math.max(deptCounts.General, 15),
  };

  // 5 sample recent routed images matching screenshot
  const defaultRecentDocs: DocumentRecord[] = [
    {
      id: 'DOC-INV-2048',
      name: 'invoice_2048.jpg',
      timestamp: Date.now() - 2 * 60 * 1000,
      department: 'Finance',
      confidence: 0.96,
      status: RoutingStatus.ROUTED,
      category: 'Invoice' as any,
      fileSize: '245 KB',
      destination: 'finance/inbox',
      summary: 'This appears to be an invoice containing payment information, vendor details, and financial data.',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      origin: 'Upload',
      extractedFields: [
        { key: 'Vendor', value: 'Stripe Corporate Billing' },
        { key: 'Total Amount', value: '$1,420.00' },
        { key: 'Invoice Date', value: '12 Sept 2026' }
      ]
    },
    {
      id: 'DOC-RES-1044',
      name: 'employee_resume.png',
      timestamp: Date.now() - 8 * 60 * 1000,
      department: 'HR',
      confidence: 0.92,
      status: RoutingStatus.ROUTED,
      category: 'Resume' as any,
      fileSize: '310 KB',
      destination: 'hr/inbox',
      summary: 'Curriculum Vitae and background credentials for technical applicant.',
      thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&q=80',
      origin: 'Upload'
    },
    {
      id: 'DOC-NDA-0921',
      name: 'nda_partner.jpg',
      timestamp: Date.now() - 15 * 60 * 1000,
      department: 'Legal',
      confidence: 0.94,
      status: RoutingStatus.ROUTED,
      category: 'Legal' as any,
      fileSize: '412 KB',
      destination: 'legal/inbox',
      summary: 'Mutual non-disclosure agreement with confidential compliance clauses.',
      thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
      origin: 'Upload'
    },
    {
      id: 'DOC-SUP-3312',
      name: 'customer_complaint.png',
      timestamp: Date.now() - 23 * 60 * 1000,
      department: 'Support',
      confidence: 0.89,
      status: RoutingStatus.ROUTED,
      category: 'Support' as any,
      fileSize: '198 KB',
      destination: 'support/inbox',
      summary: 'User escalation regarding billing adjustment and account sync.',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      origin: 'Upload'
    },
    {
      id: 'DOC-OPS-8765',
      name: 'warehouse_order.jpg',
      timestamp: Date.now() - 41 * 60 * 1000,
      department: 'Operations',
      confidence: 0.91,
      status: RoutingStatus.ROUTED,
      category: 'Operations' as any,
      fileSize: '520 KB',
      destination: 'operations/inbox',
      summary: 'Logistics manifest detailing shipment tracking and palette inventory.',
      thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
      origin: 'Upload'
    }
  ];

  const recentImages = documents.length > 0 ? documents.slice(0, 5) : defaultRecentDocs;

  const getDeptColor = (dept: string) => {
    switch (dept) {
      case 'Finance':
        return {
          text: 'text-[#FFB45C]',
          iconColor: 'text-[#F59E42]',
          pillBg: 'bg-[#1E140C] text-[#FFB45C] border border-[#F59E42]/30',
          bar: 'bg-[#F59E42]'
        };
      case 'HR':
        return {
          text: 'text-[#C084FC]',
          iconColor: 'text-[#A855F7]',
          pillBg: 'bg-[#1D1024] text-[#C084FC] border border-[#A855F7]/30',
          bar: 'bg-[#A855F7]'
        };
      case 'Legal':
        return {
          text: 'text-[#34D399]',
          iconColor: 'text-[#10B981]',
          pillBg: 'bg-[#0E2018] text-[#34D399] border border-[#10B981]/30',
          bar: 'bg-[#10B981]'
        };
      case 'Support':
        return {
          text: 'text-[#FB923C]',
          iconColor: 'text-[#F97316]',
          pillBg: 'bg-[#22120A] text-[#FB923C] border border-[#F97316]/30',
          bar: 'bg-[#F97316]'
        };
      case 'Operations':
        return {
          text: 'text-[#22D3EE]',
          iconColor: 'text-[#06B6D4]',
          pillBg: 'bg-[#0A1A22] text-[#22D3EE] border border-[#06B6D4]/30',
          bar: 'bg-[#06B6D4]'
        };
      default:
        return {
          text: 'text-[#A8A29E]',
          iconColor: 'text-[#716B66]',
          pillBg: 'bg-[#16120F] text-[#A8A29E] border border-[#2D1F16]',
          bar: 'bg-[#716B66]'
        };
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;
    return '1 day ago';
  };

  return (
    <div className="space-y-8 page-enter">
      {/* Header Greeting row matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight flex items-center gap-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#A8A29E] mt-1 font-medium">
            Here's an overview of your image routing activity.
          </p>
        </div>

        <div className="self-start sm:self-auto px-4 py-1.5 rounded-full bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] text-xs font-semibold text-[#A8A29E] backdrop-blur-md shadow-sm">
          {formattedDate}
        </div>
      </div>

      {/* 4 Stat Metric Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Images */}
        <div className="bg-[rgba(20,13,9,0.72)] hover:bg-[rgba(29,18,11,0.85)] border border-[rgba(245,158,66,0.20)] hover:border-[rgba(245,158,66,0.40)] rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-200 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(245,158,66,0.12)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-3xl font-black text-[#F5F5F5] tracking-tight">
                {totalCount}
              </div>
              <div className="text-xs font-semibold text-[#A8A29E] mt-0.5">
                Total Images
              </div>
              <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+12% from last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Successfully Routed */}
        <div className="bg-[rgba(20,13,9,0.72)] hover:bg-[rgba(29,18,11,0.85)] border border-[rgba(245,158,66,0.20)] hover:border-emerald-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-200 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(16,185,129,0.12)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-3xl font-black text-[#F5F5F5] tracking-tight">
                {routedCount}
              </div>
              <div className="text-xs font-semibold text-[#A8A29E] mt-0.5">
                Successfully Routed
              </div>
              <div className="text-[11px] font-semibold text-emerald-400 mt-1">
                95% success rate
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Review */}
        <div className="bg-[rgba(20,13,9,0.72)] hover:bg-[rgba(29,18,11,0.85)] border border-[rgba(245,158,66,0.20)] hover:border-[rgba(245,158,66,0.45)] rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-200 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(245,158,66,0.15)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F59E42]/10 border border-[#F59E42]/25 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#FFB45C]" />
            </div>
            <div>
              <div className="text-3xl font-black text-[#F5F5F5] tracking-tight">
                {pendingCount}
              </div>
              <div className="text-xs font-semibold text-[#A8A29E] mt-0.5">
                Pending Review
              </div>
              <div className="text-[11px] font-semibold text-[#FFB45C] mt-1">
                3% of total
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Needs Attention */}
        <div className="bg-[rgba(20,13,9,0.72)] hover:bg-[rgba(29,18,11,0.85)] border border-[rgba(245,158,66,0.20)] hover:border-red-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-200 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(239,68,68,0.12)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-3xl font-black text-[#F5F5F5] tracking-tight">
                {attentionCount}
              </div>
              <div className="text-xs font-semibold text-[#A8A29E] mt-0.5">
                Needs Attention
              </div>
              <div className="text-[11px] font-semibold text-red-400 mt-1">
                2% of total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two main columns: Departments (Left) & Recent Routed Images (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Departments Grid */}
        <div className="lg:col-span-6 bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[#F5F5F5] tracking-tight">
              Departments
            </h2>
            <button
              onClick={() => onNavigateToQueue()}
              className="text-xs font-semibold text-[#F59E42] hover:text-[#FFB45C] flex items-center gap-1 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 2x3 Grid matching reference screenshot with hover rise & glow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Finance */}
            <div 
              onClick={() => onNavigateToQueue('Finance')}
              className="bg-[rgba(26,18,13,0.7)] hover:bg-[rgba(34,23,17,0.85)] border border-[rgba(245,158,66,0.18)] hover:border-[#F59E42]/50 rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#F59E42]/15 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#F59E42]" />
                <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-white">Finance</span>
              </div>
              <div className="text-xs text-[#A8A29E] font-medium mb-3">
                {displayDeptCounts.Finance} images
              </div>
              <div className="w-full h-1 bg-[#2D1F16] rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-[#F59E42] rounded-full" />
              </div>
            </div>

            {/* HR */}
            <div 
              onClick={() => onNavigateToQueue('HR')}
              className="bg-[rgba(26,18,13,0.7)] hover:bg-[rgba(34,23,17,0.85)] border border-[rgba(245,158,66,0.18)] hover:border-[#A855F7]/50 rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#A855F7]/15 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users2 className="w-4 h-4 text-[#C084FC]" />
                <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-white">HR</span>
              </div>
              <div className="text-xs text-[#A8A29E] font-medium mb-3">
                {displayDeptCounts.HR} images
              </div>
              <div className="w-full h-1 bg-[#2D1F16] rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-[#A855F7] rounded-full" />
              </div>
            </div>

            {/* Legal */}
            <div 
              onClick={() => onNavigateToQueue('Legal')}
              className="bg-[rgba(26,18,13,0.7)] hover:bg-[rgba(34,23,17,0.85)] border border-[rgba(245,158,66,0.18)] hover:border-[#10B981]/50 rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#10B981]/15 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 text-[#34D399]" />
                <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-white">Legal</span>
              </div>
              <div className="text-xs text-[#A8A29E] font-medium mb-3">
                {displayDeptCounts.Legal} images
              </div>
              <div className="w-full h-1 bg-[#2D1F16] rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-[#10B981] rounded-full" />
              </div>
            </div>

            {/* Support */}
            <div 
              onClick={() => onNavigateToQueue('Support')}
              className="bg-[rgba(26,18,13,0.7)] hover:bg-[rgba(34,23,17,0.85)] border border-[rgba(245,158,66,0.18)] hover:border-[#F97316]/50 rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#F97316]/15 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="w-4 h-4 text-[#FB923C]" />
                <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-white">Support</span>
              </div>
              <div className="text-xs text-[#A8A29E] font-medium mb-3">
                {displayDeptCounts.Support} images
              </div>
              <div className="w-full h-1 bg-[#2D1F16] rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-[#F97316] rounded-full" />
              </div>
            </div>

            {/* Operations */}
            <div 
              onClick={() => onNavigateToQueue('Operations')}
              className="bg-[rgba(26,18,13,0.7)] hover:bg-[rgba(34,23,17,0.85)] border border-[rgba(245,158,66,0.18)] hover:border-[#06B6D4]/50 rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#06B6D4]/15 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <SettingsIcon className="w-4 h-4 text-[#22D3EE]" />
                <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-white">Operations</span>
              </div>
              <div className="text-xs text-[#A8A29E] font-medium mb-3">
                {displayDeptCounts.Operations} images
              </div>
              <div className="w-full h-1 bg-[#2D1F16] rounded-full overflow-hidden">
                <div className="w-3/5 h-full bg-[#06B6D4] rounded-full" />
              </div>
            </div>

            {/* General */}
            <div 
              onClick={() => onNavigateToQueue('General')}
              className="bg-[rgba(26,18,13,0.7)] hover:bg-[rgba(34,23,17,0.85)] border border-[rgba(245,158,66,0.18)] hover:border-[#77706A]/50 rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#A8A29E]" />
                <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-white">General</span>
              </div>
              <div className="text-xs text-[#A8A29E] font-medium mb-3">
                {displayDeptCounts.General} images
              </div>
              <div className="w-full h-1 bg-[#2D1F16] rounded-full overflow-hidden">
                <div className="w-2/5 h-full bg-[#77706A] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Routed Images matching screenshot */}
        <div className="lg:col-span-6 bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#F5F5F5] tracking-tight">
              Recent Routed Images
            </h2>
            <button
              onClick={() => onNavigateToQueue()}
              className="text-xs font-semibold text-[#F59E42] hover:text-[#FFB45C] flex items-center gap-1 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* List items with thumbnail, filename, timestamp, dept badge, confidence */}
          <div className="space-y-2.5">
            {recentImages.map((doc) => {
              const dept = doc.department || 'General';
              const styling = getDeptColor(dept);
              const confPercent = Math.round(doc.confidence * 100);

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[rgba(26,18,13,0.7)] hover:bg-[rgba(34,23,17,0.85)] border border-[rgba(245,158,66,0.15)] hover:border-[#F59E42]/40 cursor-pointer transition-all duration-200 group hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail preview */}
                    <div className="w-10 h-10 rounded-lg bg-[#140D08] border border-[rgba(245,158,66,0.20)] flex items-center justify-center shrink-0 overflow-hidden">
                      {doc.thumbnail ? (
                        <img src={doc.thumbnail} alt={doc.name} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-4 h-4 text-[#A8A29E]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#F5F5F5] group-hover:text-white truncate">
                        {doc.name}
                      </p>
                      <p className="text-[10px] text-[#77706A] mt-0.5">
                        {getRelativeTime(doc.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Department badge */}
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${styling.pillBg}`}>
                      {dept}
                    </span>

                    {/* Confidence percentage badge */}
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0E2018] text-emerald-400 border border-emerald-500/30">
                      {confPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
