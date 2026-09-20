
import React from 'react';
import { DocumentRecord, RoutingStatus } from '../types';

interface StatsCardsProps {
  documents: DocumentRecord[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ documents }) => {
  const total = documents.length;
  const processed = documents.filter(d => d.status === RoutingStatus.ROUTED).length;
  const averageConfidence = total > 0 
    ? (documents.reduce((acc, d) => acc + d.confidence, 0) / total * 100).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[28px] shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col h-full justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 block">Total Volume</span>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{total}</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Documents Ingested</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            View Analytics
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[28px] shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col h-full justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 block">Success Rate</span>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{processed}</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Successfully Routed</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            View Reports
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[28px] shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col h-full justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 block">AI Performance</span>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{averageConfidence}%</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Avg. Confidence</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            Custom CNN + TF-IDF Fusion
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
