import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CodeExplorer } from './components/CodeExplorer';
import { ApiPlayground } from './components/ApiPlayground';
import { DataInspector } from './components/DataInspector';
import { GitHubGuide } from './components/GitHubGuide';
import { SchemaVisualizer } from './components/SchemaVisualizer';
import { Download, Github, CheckCircle2, ShieldCheck, Terminal, Layers } from 'lucide-react';
import { downloadBackendZip } from './utils/zipDownloader';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('code');
  const [apiStatus, setApiStatus] = useState<'online' | 'checking' | 'offline'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (err) {
        setApiStatus('offline');
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} apiStatus={apiStatus} />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'code' && <CodeExplorer />}
        {activeTab === 'api' && <ApiPlayground />}
        {activeTab === 'data' && <DataInspector />}
        {activeTab === 'schema' && <SchemaVisualizer />}
        {activeTab === 'github' && <GitHubGuide />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">Dayflow HRMS Backend Suite</div>
              <div className="text-[11px] text-slate-500">
                Crafted for Node.js, Express & MongoDB Mongoose integration • Compatible with dayflow-hrms-p6k4r9.pages.bu.app
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveTab('github')}
              className="hover:text-blue-400 transition cursor-pointer flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Git Push Instructions</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={downloadBackendZip}
              className="text-blue-400 hover:text-blue-300 font-medium transition cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
