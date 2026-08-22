import React, { useState } from 'react';
import { BACKEND_FILES, BackendFile } from '../data/backendFiles';
import { 
  FileCode, 
  Folder, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Sparkles, 
  FileText, 
  Settings, 
  Database, 
  ShieldCheck, 
  Route, 
  Cpu, 
  Terminal,
  ExternalLink
} from 'lucide-react';
import { downloadSingleFile, downloadBackendZip } from '../utils/zipDownloader';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<BackendFile>(BACKEND_FILES.find(f => f.path === 'server.js') || BACKEND_FILES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Files', count: BACKEND_FILES.length, icon: FileCode },
    { id: 'core', label: 'Server & Config', count: BACKEND_FILES.filter(f => ['core', 'config'].includes(f.category)).length, icon: Settings },
    { id: 'models', label: 'MongoDB Models', count: BACKEND_FILES.filter(f => f.category === 'models').length, icon: Database },
    { id: 'controllers', label: 'Controllers', count: BACKEND_FILES.filter(f => f.category === 'controllers').length, icon: Cpu },
    { id: 'routes', label: 'Express Routes', count: BACKEND_FILES.filter(f => f.category === 'routes').length, icon: Route },
    { id: 'middlewares', label: 'Middlewares', count: BACKEND_FILES.filter(f => f.category === 'middlewares').length, icon: ShieldCheck },
    { id: 'seeder', label: 'Seeder & Docker', count: BACKEND_FILES.filter(f => ['seeder', 'docker'].includes(f.category)).length, icon: Terminal },
    { id: 'docs', label: 'Docs & Postman', count: BACKEND_FILES.filter(f => f.category === 'docs').length, icon: FileText }
  ];

  const filteredFiles = BACKEND_FILES.filter(file => {
    const matchesSearch = file.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          file.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'all') return matchesSearch;
    if (activeCategory === 'core') return matchesSearch && ['core', 'config'].includes(file.category);
    if (activeCategory === 'seeder') return matchesSearch && ['seeder', 'docker'].includes(file.category);
    return matchesSearch && file.category === activeCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = selectedFile.content.split('\n').length;
  const charCount = selectedFile.content.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Intro Banner */}
      <div className="mb-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-500/20 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-100">Ready-to-Deploy Dayflow HRMS Backend Source Code</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete Node.js & Express architecture with MongoDB Mongoose schemas, JWT role-based access control, controllers, routes, and seeding scripts.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="btn-download-all-zip"
            onClick={downloadBackendZip}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-medium rounded-lg shadow transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download All as ZIP</span>
          </button>
        </div>
      </div>

      {/* Main Grid: File Tree + Code Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left File Tree Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[740px]">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/90">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="input-search-files"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files (e.g. employee, auth, .env)..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
            {filteredFiles.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No matching files found for "{searchQuery}"
              </div>
            ) : (
              filteredFiles.map(file => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    id={`file-item-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border border-blue-500/40 text-blue-200'
                        : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="mt-0.5">
                      {file.path.endsWith('.js') && <span className="text-amber-400 font-mono text-xs">JS</span>}
                      {file.path.endsWith('.json') && <span className="text-emerald-400 font-mono text-xs">{}</span>}
                      {file.path.endsWith('.md') && <span className="text-sky-400 font-mono text-xs">MD</span>}
                      {file.path.startsWith('.') && <span className="text-slate-400 font-mono text-xs">.*</span>}
                      {file.path.includes('Docker') && <span className="text-blue-400 font-mono text-xs">🐳</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-medium truncate text-slate-200">{file.path}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{file.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{file.description}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Directory Summary Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Total: <strong>{BACKEND_FILES.length} Files</strong></span>
            <span className="text-[11px] text-blue-400 font-mono">dayflow-hrms-backend/</span>
          </div>
        </div>

        {/* Right Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[740px]">
          {/* Header Bar */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileCode className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-slate-100 truncate">{selectedFile.path}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-medium">
                    {lineCount} lines
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-400 font-mono">
                    {(charCount / 1024).toFixed(1)} KB
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{selectedFile.description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-copy-code"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <button
                id="btn-download-single-file"
                onClick={() => downloadSingleFile(selectedFile.name, selectedFile.content)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition cursor-pointer"
                title="Download this single file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Syntax Code Editor Box */}
          <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300 select-text">
            <pre className="overflow-x-auto">
              <code>
                {selectedFile.content.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-slate-900/60">
                    <span className="table-cell pr-4 text-right text-slate-600 select-none w-10">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre text-slate-200">
                      {line}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>

          {/* Code Footer bar with quick path instructions */}
          <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">File location in repository:</span>
              <code className="text-blue-300 bg-slate-950 px-2 py-0.5 rounded text-[11px]">
                dayflow-hrms-backend/{selectedFile.path}
              </code>
            </div>
            <span className="text-slate-500 hidden sm:inline">UTF-8 • JavaScript / Node.js</span>
          </div>
        </div>
      </div>
    </div>
  );
};
