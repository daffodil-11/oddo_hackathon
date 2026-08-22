import React, { useState } from 'react';
import { Download, Github, Database, Terminal, Check, Server, Layers, Code, Play } from 'lucide-react';
import { downloadBackendZip } from '../utils/zipDownloader';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiStatus: 'online' | 'checking' | 'offline';
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, apiStatus }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      await downloadBackendZip();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download ZIP:', err);
    } finally {
      setDownloading(false);
    }
  };

  const navItems = [
    { id: 'code', label: 'Backend Codebase', icon: Code, badge: '25 Files' },
    { id: 'api', label: 'Interactive API Tester', icon: Play, badge: 'Live REST' },
    { id: 'data', label: 'Live HR Database', icon: Server, badge: 'Realtime' },
    { id: 'schema', label: 'MongoDB Schema (ERD)', icon: Database },
    { id: 'github', label: 'GitHub & Deploy Guide', icon: Github }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 px-4 py-1.5 text-xs font-medium flex flex-wrap items-center justify-between text-blue-50">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[11px] font-semibold">
            DAYFLOW HRMS
          </span>
          <span>
            Matched Frontend Target: <strong className="text-white">https://dayflow-hrms-p6k4r9.pages.bu.app</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>API Server: <strong>{apiStatus === 'online' ? 'Ready & Serving' : 'Connecting...'}</strong></span>
          </span>
          <span className="hidden md:inline text-blue-200">|</span>
          <span className="hidden md:inline text-blue-100">Stack: Node.js 18+ • Express • MongoDB Mongoose • JWT</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">Dayflow HRMS Backend</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Node.js, Express & MongoDB repository source for GitHub</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-nav-download-zip"
              onClick={handleDownloadZip}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all duration-150 cursor-pointer disabled:opacity-75"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded ZIP!</span>
                </>
              ) : (
                <>
                  <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                  <span>{downloading ? 'Packing Archive...' : 'Download Backend (.ZIP)'}</span>
                </>
              )}
            </button>
            <button
              id="btn-nav-github-guide"
              onClick={() => setActiveTab('github')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              <Github className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Push to GitHub</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-t border-slate-800/80 overflow-x-auto py-1 scrollbar-none">
          {navItems.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
