
import React from 'react';
import { EmailMessage } from '../types';

interface EmailInboxProps {
  emails: EmailMessage[];
  onIngest: (emailId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const EmailInbox: React.FC<EmailInboxProps> = ({ emails, onIngest, onRefresh, isRefreshing }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-darkSurface rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Email Ingest Server</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monitoring inbound mail for document attachments</p>
          </div>
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
          >
            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Check for Emails
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {emails.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Your ingest queue is empty.</p>
              <p className="text-xs text-slate-400 mt-1">New documents sent to ingest@docroute.ai will appear here.</p>
            </div>
          ) : (
            emails.map((email) => (
              <div key={email.id} className={`p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${email.isProcessed ? 'opacity-50 grayscale' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{email.from}</h4>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">{new Date(email.receivedAt).toLocaleTimeString()}</span>
                  </div>
                  <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">{email.subject}</h5>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{email.attachmentName}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Attached File</p>
                      </div>
                    </div>
                    {!email.isProcessed && (
                      <button 
                        onClick={() => onIngest(email.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 uppercase tracking-wider"
                      >
                        Process Attachment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailInbox;
