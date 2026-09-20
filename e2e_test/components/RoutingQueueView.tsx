import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpDown,
  Building2,
  Users2,
  Scale,
  Headphones,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';
import { DocumentRecord, DepartmentType, RoutingStatus } from '../types';

interface RoutingQueueViewProps {
  documents: DocumentRecord[];
  onSelectDoc: (doc: DocumentRecord) => void;
  initialFilter?: DepartmentType | 'ALL';
}

export const RoutingQueueView: React.FC<RoutingQueueViewProps> = ({
  documents,
  onSelectDoc,
  initialFilter = 'ALL'
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | RoutingStatus>('ALL');
  const [deptFilter, setDeptFilter] = useState<DepartmentType | 'ALL'>(initialFilter);
  const [search, setSearch] = useState('');

  // Sample data fallback if empty
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
    },
    {
      id: 'DOC-REV-4401',
      name: 'blurry_statement.jpg',
      timestamp: Date.now() - 55 * 60 * 1000,
      department: 'Finance',
      confidence: 0.62,
      status: RoutingStatus.PENDING,
      category: 'Invoice' as any,
      fileSize: '180 KB',
      destination: 'review/queue',
      summary: 'Low resolution scan requiring human verification.',
      thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
      origin: 'Upload'
    }
  ];

  const allDocs = documents.length > 0 ? documents : defaultDocs;

  // Filtering
  const filteredDocs = allDocs.filter((doc) => {
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;
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

  const getStatusBadge = (status: RoutingStatus) => {
    switch (status) {
      case RoutingStatus.ROUTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#0E2018] text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Routed</span>
          </span>
        );
      case RoutingStatus.PENDING:
      case RoutingStatus.QUARANTINED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#24170D] text-[#FFB45C] border border-[#F59E42]/30">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case RoutingStatus.FAILED:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#220E0E] text-red-400 border border-red-500/30">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
    }
  };

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

  const getRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;
    return '1 day ago';
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Title Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
            Routing Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#A8A29E] mt-1 font-medium">
            Manage and review all incoming image routing tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Pills matching screenshot */}
          <div className="flex items-center p-1 rounded-xl bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] backdrop-blur-md">
            {(['ALL', RoutingStatus.PENDING, RoutingStatus.ROUTED, RoutingStatus.FAILED] as const).map((st) => {
              const label = st === 'ALL' ? 'All' : st === RoutingStatus.ROUTED ? 'Routed' : st === RoutingStatus.PENDING ? 'Pending' : 'Failed';
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FFB45C] to-[#E58525] text-[#120D09] shadow-sm shadow-[#F59E42]/25'
                      : 'text-[#A8A29E] hover:text-[#F5F5F5]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Secondary Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#77706A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name or ID..."
            className="w-full bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5F5] placeholder:text-[#77706A] focus:outline-none focus:border-[#F59E42] backdrop-blur-md transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#77706A] font-medium">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value as any)}
            className="bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-xl px-3 py-1.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#F59E42] backdrop-blur-md cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Legal">Legal</option>
            <option value="Support">Support</option>
            <option value="Operations">Operations</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
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
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(245,158,66,0.10)]">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#77706A]">
                    No images match the current filter.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const dept = doc.department || 'General';
                  const pillStyle = getDeptPill(dept);
                  const confPercent = Math.round(doc.confidence * 100);

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => onSelectDoc(doc)}
                      className="hover:bg-[rgba(29,18,11,0.75)] cursor-pointer transition-colors group"
                    >
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-9 h-9 rounded-lg bg-[#140D08] border border-[rgba(245,158,66,0.20)] flex items-center justify-center overflow-hidden">
                          {doc.thumbnail ? (
                            <img src={doc.thumbnail} alt={doc.name} className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#77706A]" />
                          )}
                        </div>
                      </td>

                      {/* Filename & ID */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#F5F5F5] group-hover:text-white truncate max-w-[180px]">
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-[#77706A] font-mono mt-0.5">
                          {doc.id}
                        </p>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${pillStyle}`}>
                          {dept}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">
                            {confPercent}%
                          </span>
                          <div className="w-12 h-1.5 bg-[#2D1F16] rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${confPercent}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(doc.status)}
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 text-[#A8A29E] text-[11px]">
                        {getRelativeTime(doc.timestamp)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDoc(doc);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[rgba(26,18,13,0.8)] hover:bg-[rgba(34,23,17,0.95)] border border-[rgba(245,158,66,0.25)] hover:border-[#F59E42]/50 text-xs font-semibold text-[#FFB45C] inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoutingQueueView;
