
import React, { useState } from 'react';
import { DocumentRecord } from '../types';

interface FileExplorerProps {
  documents: DocumentRecord[];
}

const FileExplorer: React.FC<FileExplorerProps> = ({ documents }) => {
  const folders = Array.from(new Set(documents.map(d => d.destination)));
  const [selectedFolder, setSelectedFolder] = useState<string | null>(folders[0] || null);

  const folderDocs = documents.filter(d => d.destination === selectedFolder);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Storage Volumes</h3>
        <div className="space-y-1">
          {folders.length === 0 ? (
            <div className="p-4 text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
              No directories created yet.
            </div>
          ) : (
            folders.map(folder => (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  selectedFolder === folder 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-darkSurface text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                <div className="text-left">
                  <p className="text-sm font-bold truncate">{folder}</p>
                  <p className="text-[10px] opacity-60 uppercase font-black">{documents.filter(d => d.destination === folder).length} Files</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-darkSurface rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[500px]">
          <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">/ Root /</span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedFolder || '...'}</span>
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {!selectedFolder ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20 grayscale">
                <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-bold">Waiting for Routing Actions</p>
              </div>
            ) : (
              folderDocs.map(doc => (
                <div key={doc.id} className="group relative bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-center">
                  <div className="aspect-[1/1.2] bg-white dark:bg-darkSurface rounded-lg mb-3 shadow-inner overflow-hidden flex items-center justify-center relative">
                    {doc.thumbnail ? (
                      <img src={doc.thumbnail} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <svg className="w-12 h-12 text-slate-200 dark:text-slate-800" fill="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    )}
                    <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate mb-1">{doc.name}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-black">{doc.category}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
