
import React, { useState, useEffect } from 'react';
import { MySQL_LogRecord } from '../types';
import { DBService } from '../services/dbService';

interface ActivityLogsProps {
  logs: MySQL_LogRecord[];
  onClear: () => void;
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({ logs, onClear }) => {
  const [dbStatus, setDbStatus] = useState<'connecting' | 'online' | 'error'>('connecting');
  const [showSchema, setShowSchema] = useState(false);

  useEffect(() => {
    const check = async () => {
      const isOnline = await DBService.checkHeartbeat();
      setDbStatus(isOnline ? 'online' : 'error');
    };
    check();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${dbStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-red-500 animate-pulse'}`} />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">MySQL Server: {dbStatus === 'online' ? 'LIVE Connection' : 'Disconnected'}</h3>
            <p className="text-[10px] text-slate-500 font-mono">Status: {dbStatus.toUpperCase()} | Engine: InnoDB</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSchema(true)} className="px-4 py-2 bg-slate-800 text-[10px] font-bold uppercase rounded-lg">SQL Schema</button>
        </div>
      </div>

      <div className="bg-white dark:bg-darkSurface rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Live Audit Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
              <tr>
                <th className="px-8 py-3">log_id</th>
                <th className="px-8 py-3">timestamp</th>
                <th className="px-8 py-3">event</th>
                <th className="px-8 py-3">level</th>
                <th className="px-8 py-3">payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map(log => (
                <tr key={log.log_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-[11px]">
                  <td className="px-8 py-3 text-indigo-500 font-bold">{log.log_id}</td>
                  <td className="px-8 py-3 text-slate-500">{log.timestamp}</td>
                  <td className="px-8 py-3 font-bold">{log.event_name}</td>
                  <td className="px-8 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      log.log_level === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {log.log_level}
                    </span>
                  </td>
                  <td className="px-8 py-3 text-slate-400 truncate max-w-[200px]">{log.payload_json}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
