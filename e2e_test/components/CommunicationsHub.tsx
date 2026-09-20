
import React, { useState } from 'react';
import { EmailMessage, OutboundEmail } from '../types';

interface CommunicationsHubProps {
  inbound: EmailMessage[];
  outbound: OutboundEmail[];
  onIngest: (emailId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onSendManualEmail: (to: string, subject: string, body: string) => void;
  isGmailConnected: boolean;
  onConnectGmail: () => void;
  onLoadDemo?: () => void;
}

const CommunicationsHub: React.FC<CommunicationsHubProps> = ({ 
  inbound, 
  outbound, 
  onIngest, 
  onRefresh, 
  isRefreshing,
  onSendManualEmail,
  isGmailConnected,
  onConnectGmail,
  onLoadDemo
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'inbound' | 'outbound'>('inbound');
  const [isComposing, setIsComposing] = useState(false);
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', body: '' });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onSendManualEmail(newEmail.to, newEmail.subject, newEmail.body);
    setNewEmail({ to: '', subject: '', body: '' });
    setIsComposing(false);
    setActiveSubTab('outbound');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-darkSurface rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveSubTab('inbound')}
              className={`pb-5 -mb-5 border-b-2 transition-all font-bold text-sm ${activeSubTab === 'inbound' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
            >
              Inbound Ingest ({inbound.filter(e => !e.isProcessed).length})
            </button>
            <button 
              onClick={() => setActiveSubTab('outbound')}
              className={`pb-5 -mb-5 border-b-2 transition-all font-bold text-sm ${activeSubTab === 'outbound' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
            >
              Outbound Notifications ({outbound.length})
            </button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsComposing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Compose
            </button>
            {activeSubTab === 'inbound' && (
              <button 
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
              >
                <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Sync
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[400px]">
          {!isGmailConnected && activeSubTab === 'inbound' ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Connect your Gmail</h3>
              <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto">Automatically ingest documents sent to your email and route them with AI.</p>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <button 
                  onClick={onConnectGmail}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-full font-black text-sm shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Connect Gmail Account
                </button>
                <button 
                  onClick={onLoadDemo}
                  className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                  Try Demo Mode (No Setup)
                </button>
              </div>
            </div>
          ) : activeSubTab === 'inbound' ? (
            inbound.length === 0 ? (
              <EmptyState icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" title="No inbound messages" subtitle="Incoming documents from ingest@docroute.ai will appear here." />
            ) : (
              inbound.map((email) => (
                <div key={email.id} className={`p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${email.isProcessed ? 'opacity-50' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{email.from}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(email.receivedAt).toLocaleTimeString()}</span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">{email.subject}</h5>
                    <p className="text-[11px] text-slate-500 mb-4 line-clamp-2">{email.body}</p>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{email.attachmentName}</span>
                      </div>
                      {!email.isProcessed && (
                        <button onClick={() => onIngest(email.id)} className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700 uppercase">Process</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            outbound.length === 0 ? (
              <EmptyState icon="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" title="No sent notifications" subtitle="Routing alerts sent to departments will be listed here." />
            ) : (
              outbound.map((email) => (
                <div key={email.id} className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">To: {email.to}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(email.sentAt).toLocaleString()}</span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">{email.subject}</h5>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono leading-relaxed border border-slate-200 dark:border-slate-800">
                      {email.body}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {isComposing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkSurface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">New Message</h3>
              <button onClick={() => setIsComposing(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSend} className="p-6 space-y-4">
              <input 
                type="email" 
                placeholder="To" 
                required
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-900 dark:text-white"
                value={newEmail.to}
                onChange={e => setNewEmail({...newEmail, to: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Subject" 
                required
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-900 dark:text-white"
                value={newEmail.subject}
                onChange={e => setNewEmail({...newEmail, subject: e.target.value})}
              />
              <textarea 
                placeholder="Message body..." 
                required
                rows={6}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-900 dark:text-white resize-none"
                value={newEmail.body}
                onChange={e => setNewEmail({...newEmail, body: e.target.value})}
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsComposing(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ icon, title, subtitle }: { icon: string, title: string, subtitle: string }) => (
  <div className="p-12 text-center">
    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
    </div>
    <p className="text-slate-500 dark:text-slate-400 font-medium">{title}</p>
    <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
  </div>
);

export default CommunicationsHub;
