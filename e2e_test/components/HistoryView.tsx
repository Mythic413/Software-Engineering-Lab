import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Search, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Users2,
  Scale,
  Headphones,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';
import { DocumentRecord, DepartmentType, RoutingStatus } from '../types';

interface HistoryViewProps {
  documents: DocumentRecord[];
  onSelectDoc: (doc: DocumentRecord) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  documents,
  onSelectDoc
}) => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  const defaultDocs: DocumentRecord[] = [
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
      origin: 'Upload'
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

  const allDocs = documents.length > 0 ? documents : defaultDocs;

  const filteredDocs = allDocs.filter(doc => {
    if (deptFilter !== 'ALL' && doc.department !== deptFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        (doc.department && doc.department.toLowerCase().includes(q)) ||
        doc.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getDeptPill = (dept: string) => {
    switch (dept) {
      case 'Finance':
        return 'bg-[#1E140C] text-[#FFB45C] border border-[#F59E42]/30';
      case 'HR':
        return 'bg-[#1D1024] text-[#C084FC] border border-[#A855F7]/30';
      case 'Legal':
        return 'bg-[#0E2018] text-[#34D399] border border-[#10B981]/30';
      case 'Support':
        return 'bg-[#22120A] text-[#FB923C] border border-[#F97316]/30';
      case 'Operations':
        return 'bg-[#0A1A22] text-[#22D3EE] border border-[#06B6D4]/30';
      default:
        return 'bg-[#16120F] text-[#A8A29E] border border-[#2D1F16]';
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Title and Date Range Row matching Screen 6 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
            History
          </h1>
          <p className="text-xs sm:text-sm text-[#A8A29E] mt-1 font-medium">
            View your past routing activity and compliance records.
          </p>
        </div>

        {/* Date range badge matching screenshot */}
        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] text-xs font-semibold text-[#A8A29E] backdrop-blur-md shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-[#F59E42]" />
          <span>1 Sep 2026 → 19 Sep 2026</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#77706A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past logs..."
            className="w-full bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5F5] placeholder:text-[#77706A] focus:outline-none focus:border-[#F59E42] backdrop-blur-md transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#77706A] font-medium">Filter by:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-xl px-3 py-1.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#F59E42] backdrop-blur-md cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Legal">Legal</option>
            <option value="Support">Support</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(245,158,66,0.15)] bg-[rgba(14,10,7,0.9)] text-[#A8A29E] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-14">Image</th>
                <th className="py-3.5 px-4">Filename</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Routed At</th>
                <th className="py-3.5 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(245,158,66,0.10)]">
              {filteredDocs.map((doc) => {
                const dept = doc.department || 'General';
                const pillStyle = getDeptPill(dept);
                const confPercent = Math.round(doc.confidence * 100);

                return (
                  <tr
                    key={doc.id}
                    onClick={() => onSelectDoc(doc)}
                    className="hover:bg-[rgba(29,18,11,0.75)] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="w-9 h-9 rounded-lg bg-[#140D08] border border-[rgba(245,158,66,0.20)] flex items-center justify-center overflow-hidden">
                        {doc.thumbnail ? (
                          <img src={doc.thumbnail} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#77706A]" />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-[#F5F5F5] group-hover:text-white truncate max-w-[180px]">
                        {doc.name}
                      </p>
                      <p className="text-[10px] text-[#77706A] font-mono mt-0.5">
                        {doc.id}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${pillStyle}`}>
                        {dept}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-400">
                        {confPercent}%
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0E2018] text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Routed</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#A8A29E] text-[11px]">
                      {formatDate(doc.timestamp)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDoc(doc);
                        }}
                        className="p-1 rounded-lg hover:bg-[rgba(34,23,17,0.9)] text-[#A8A29E] hover:text-[#FFB45C] transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
