
import React from 'react';
import { DocumentRecord, RoutingStatus } from '../types';

interface DocumentListProps {
  documents: DocumentRecord[];
  onSelect: (doc: DocumentRecord) => void;
  title?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onSelect, title = "Recent Documents" }) => {
  const getStatusStyle = (status: RoutingStatus) => {
    switch (status) {
      case RoutingStatus.ROUTED: return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50';
      case RoutingStatus.QUARANTINED: return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50';
      case RoutingStatus.PROCESSING: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 animate-pulse border border-blue-200 dark:border-blue-700/50';
      case RoutingStatus.FAILED: return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/50';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[28px] shadow-sm overflow-hidden transition-all">
      <div className="px-8 py-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-500 font-medium mt-1">Manage and review your latest document processing tasks.</p>
        </div>
        <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{documents.length} Records</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em] border-b border-slate-100 dark:border-zinc-800">
              <th className="px-8 py-4">Document</th>
              <th className="px-8 py-4">Source</th>
              <th className="px-8 py-4">Classification</th>
              <th className="px-8 py-4">Confidence</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 dark:text-zinc-600 font-medium italic">
                  No records to display.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer" onClick={() => onSelect(doc)}>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-indigo-500 mr-4 shadow-sm overflow-hidden">
                        {doc.thumbnail ? (
                          <img src={doc.thumbnail} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        ) : (
                          <svg className="w-6 h-6 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{doc.name}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">{new Date(doc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(doc.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${doc.origin === 'Email' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'}`}>
                      {doc.origin}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{doc.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${doc.confidence < 0.8 ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                          style={{ width: `${doc.confidence * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${doc.confidence < 0.8 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                        {(doc.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusStyle(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
                    >
                      {doc.status === RoutingStatus.QUARANTINED ? 'Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;
