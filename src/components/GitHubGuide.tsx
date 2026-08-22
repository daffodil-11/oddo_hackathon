import React, { useState } from 'react';
import { 
  Github, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Server, 
  Database, 
  ShieldAlert, 
  Download, 
  Code2,
  Globe
} from 'lucide-react';
import { downloadBackendZip } from '../utils/zipDownloader';

export const GitHubGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState('https://github.com/YOUR_USERNAME/dayflow-hrms-backend.git');

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const gitCommands = `# 1. Create a new folder or unzip the downloaded archive
cd dayflow-hrms-backend

# 2. Initialize Git
git init

# 3. Add all backend files
git add .

# 4. Commit all files
git commit -m "feat: complete Dayflow HRMS Node.js Express MongoDB backend"

# 5. Set default branch to main
git branch -M main

# 6. Add your GitHub repository remote
git remote add origin ${repoUrl}

# 7. Push all code to GitHub
git push -u origin main`;

  const envContent = `PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dayflow_hrms?retryWrites=true&w=majority
JWT_SECRET=dayflow_super_secret_jwt_key_2026_production_safe
JWT_EXPIRE=30d
CLIENT_URL=https://dayflow-hrms-p6k4r9.pages.bu.app`;

  const frontendIntegrationCode = `// src/services/api.js (in your Dayflow React Frontend)
import axios from 'axios';

// Backend Base URL (Local or Deployed Render / Railway / Cloud Run URL)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Auto-attach JWT Bearer token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// Example API Service Calls matching Dayflow HRMS frontend:
export const loginUser = (email, password) => api.post('/auth/login', { email, password });
export const fetchDashboardStats = () => api.get('/dashboard/stats');
export const fetchEmployees = (params) => api.get('/employees', { params });
export const clockIn = (employeeId, workMode) => api.post('/attendance/clock-in', { employeeId, workMode });
export const clockOut = (employeeId) => api.post('/attendance/clock-out', { employeeId });
export const applyLeave = (leaveData) => api.post('/leaves', leaveData);
export const fetchPayroll = (params) => api.get('/payroll', { params });

export default api;`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Overview Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                <Github className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-100">Step-by-Step GitHub & Deployment Guide</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Push your complete Node.js + Express + MongoDB backend repository to GitHub in 60 seconds, connect a free cloud MongoDB Atlas cluster, and link it seamlessly to your Dayflow HRMS frontend.
            </p>
          </div>

          <button
            id="btn-guide-download-zip"
            onClick={downloadBackendZip}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download All Code (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Step 1: Git Push Commands */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h3 className="text-sm font-bold text-slate-100">Push to Your GitHub Repository</h3>
          </div>
          <button
            id="btn-copy-git-commands"
            onClick={() => copyToClipboard(gitCommands, 'git')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
          >
            {copiedSection === 'git' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Commands!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Terminal Commands</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Your GitHub Repository Remote URL:</span>
            <input
              type="text"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              placeholder="https://github.com/USERNAME/dayflow-hrms-backend.git"
              className="flex-1 px-3 py-1 bg-slate-950 border border-slate-800 rounded text-blue-300 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800/80">
            <pre>{gitCommands}</pre>
          </div>
        </div>
      </div>

      {/* Step 2: MongoDB Atlas Setup & .env */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h3 className="text-sm font-bold text-slate-100">MongoDB Atlas Setup</h3>
            </div>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="p-5 space-y-3 text-xs text-slate-300 flex-1">
            <p>To connect with a production cloud database:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-400 pl-1">
              <li>Go to <strong className="text-slate-200">mongodb.com/cloud/atlas</strong> and create a free M0 cluster.</li>
              <li>Under <strong className="text-slate-200">Database Access</strong>, create a database user with password.</li>
              <li>Under <strong className="text-slate-200">Network Access</strong>, add IP Address <code className="text-blue-300 bg-slate-950 px-1 py-0.5 rounded">0.0.0.0/0</code> (Allow Access from Anywhere).</li>
              <li>Click <strong className="text-slate-200">Connect &rarr; Drivers (Node.js)</strong> and copy the connection string into your <code className="text-blue-300 bg-slate-950 px-1 py-0.5 rounded">MONGO_URI</code>.</li>
            </ol>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h3 className="text-sm font-bold text-slate-100">Production .env Config</h3>
            </div>
            <button
              onClick={() => copyToClipboard(envContent, 'env')}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy .env</span>
            </button>
          </div>
          <div className="p-4 flex-1 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{envContent}</pre>
          </div>
        </div>
      </div>

      {/* Step 3: Frontend Integration Hookup */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">4</span>
            <h3 className="text-sm font-bold text-slate-100">Connecting Your Dayflow Frontend (https://dayflow-hrms-p6k4r9.pages.bu.app)</h3>
          </div>
          <button
            id="btn-copy-frontend-code"
            onClick={() => copyToClipboard(frontendIntegrationCode, 'fe')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
          >
            {copiedSection === 'fe' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Snippet!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Frontend Integration Snippet</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-400 mb-3">
            In your frontend repository, add this Axios service wrapper to auto-attach the JWT token from local storage on all requests:
          </p>
          <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800/80">
            <pre>{frontendIntegrationCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
