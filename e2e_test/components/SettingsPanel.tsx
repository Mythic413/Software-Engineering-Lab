
import React from 'react';
import { SystemSettings } from '../types';

interface SettingsPanelProps {
  settings: SystemSettings;
  onUpdate: (updates: Partial<SystemSettings>) => void;
  onRetrain: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, onRetrain }) => {
  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-darkSurface rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">System Configuration</h2>
        
        <div className="space-y-8">
          <section className="pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">ML Confidence Threshold</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Minimum confidence score to automatically route a document. Documents below this will be quarantined.</p>
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{(settings.confidenceThreshold * 100).toFixed(0)}%</div>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={settings.confidenceThreshold}
              onChange={(e) => onUpdate({ confidenceThreshold: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Auto Routing</span>
              <span>Manual Review</span>
            </div>
          </section>

          <section className="pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Auto-Routing Engine</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Allow the system to route documents to file systems and databases automatically.</p>
              </div>
              <button 
                onClick={() => onUpdate({ autoRoutingEnabled: !settings.autoRoutingEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoRoutingEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoRoutingEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </section>

          <section className="pb-8 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">AI Model Configuration</h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Model Source</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdate({ modelSource: 'gemini' })}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all border ${settings.modelSource === 'gemini' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    Gemini AI (High Speed)
                  </button>
                  <button 
                    onClick={() => onUpdate({ modelSource: 'custom' })}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all border ${settings.modelSource === 'custom' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    Custom PyTorch (Local)
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  {settings.modelSource === 'gemini' ? 'Using Gemini 1.5 Flash for high-speed OCR and classification.' : 'Using local Python script for OCR and classification.'}
                </p>
              </div>

              {settings.modelSource === 'gemini' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Gemini Model Name</label>
                  <input 
                    type="text"
                    value={settings.modelName}
                    onChange={(e) => onUpdate({ modelName: e.target.value })}
                    placeholder="e.g. gemini-1.5-flash"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    Gemini 1.5 Flash is recommended for processing speed.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Default Routing Destination</h3>
            <select 
              value={settings.defaultDestination}
              onChange={(e) => onUpdate({ defaultDestination: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option>General Operations</option>
              <option>Unknown/Review Queue</option>
              <option>Admin Archive</option>
            </select>
          </section>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 text-white border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
        </div>
        <h3 className="text-lg font-bold mb-2">Model Health</h3>
        <p className="text-xs text-slate-400 mb-6 max-w-md">Classification accuracy is currently 94.2% across processed history.</p>
        <div className="flex gap-4">
          <button 
            onClick={onRetrain}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold transition-all"
          >
            Re-train Model
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all">Export Logs</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
