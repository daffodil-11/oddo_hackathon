import React, { useState } from 'react';
import { 
  Play, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Lock, 
  Copy, 
  Check, 
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EndpointConfig {
  id: string;
  name: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  defaultHeaders: Record<string, string>;
  defaultBody?: string;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'auth-login',
    name: '1. Auth: Login & Get JWT Token',
    category: 'Authentication',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate as HR Admin, Manager, or Employee and receive JWT Bearer token',
    defaultHeaders: { 'Content-Type': 'application/json' },
    defaultBody: JSON.stringify(
      {
        email: 'admin@dayflow.corp',
        password: 'password123'
      },
      null,
      2
    )
  },
  {
    id: 'auth-me',
    name: '2. Auth: Get Current Profile (/me)',
    category: 'Authentication',
    method: 'GET',
    path: '/api/auth/me',
    description: 'Retrieve logged-in user profile, role permissions, and linked employee ID',
    defaultHeaders: {
      Authorization: 'Bearer dayflow_jwt_admin'
    }
  },
  {
    id: 'dashboard-stats',
    name: '3. Dashboard: HR KPI Summary Stats',
    category: 'Dashboard',
    method: 'GET',
    path: '/api/dashboard/stats',
    description: 'Returns total headcount, today attendance count, active rates, pending leaves, and announcements',
    defaultHeaders: {
      Authorization: 'Bearer dayflow_jwt_admin'
    }
  },
  {
    id: 'employees-list',
    name: '4. Employees: List All with Search & Filter',
    category: 'Employees',
    method: 'GET',
    path: '/api/employees',
    description: 'Query employee directory with filters by department, status, role, or search string',
    defaultHeaders: {
      Authorization: 'Bearer dayflow_jwt_admin'
    }
  },
  {
    id: 'employees-create',
    name: '5. Employees: Create New Employee',
    category: 'Employees',
    method: 'POST',
    path: '/api/employees',
    description: 'Create an employee record with designations, salary breakdown, and department assignment',
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer dayflow_jwt_admin'
    },
    defaultBody: JSON.stringify(
      {
        firstName: 'Jonathan',
        lastName: 'Reed',
        email: 'jonathan.reed@dayflow.corp',
        phone: '+1 (555) 777-8899',
        department: 'dept_eng_01',
        designation: 'Staff Backend Architect',
        role: 'manager',
        salary: { base: 9500, hra: 3800, allowances: 2000, currency: 'USD' }
      },
      null,
      2
    )
  },
  {
    id: 'attendance-list',
    name: '6. Attendance: Daily Logs & Timesheets',
    category: 'Attendance',
    method: 'GET',
    path: '/api/attendance',
    description: 'Fetch attendance logs, timestamps, work mode (Office/Remote/Hybrid), and hours',
    defaultHeaders: {
      Authorization: 'Bearer dayflow_jwt_admin'
    }
  },
  {
    id: 'attendance-clockin',
    name: '7. Attendance: Clock In Employee',
    category: 'Attendance',
    method: 'POST',
    path: '/api/attendance/clock-in',
    description: 'Record clock-in timestamp for today with work mode tag and remarks',
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer dayflow_jwt_admin'
    },
    defaultBody: JSON.stringify(
      {
        employeeId: 'emp_05',
        workMode: 'Office',
        remarks: 'Direct check-in via Dayflow Terminal'
      },
      null,
      2
    )
  },
  {
    id: 'leaves-list',
    name: '8. Leaves: List Leave Applications',
    category: 'Leaves',
    method: 'GET',
    path: '/api/leaves',
    description: 'List leave applications with status filter (Pending, Approved, Rejected)',
    defaultHeaders: {
      Authorization: 'Bearer dayflow_jwt_admin'
    }
  },
  {
    id: 'leaves-apply',
    name: '9. Leaves: Apply for Leave',
    category: 'Leaves',
    method: 'POST',
    path: '/api/leaves',
    description: 'Submit a new leave application with date range, leave type, and reason',
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer dayflow_jwt_admin'
    },
    defaultBody: JSON.stringify(
      {
        employeeId: 'emp_01',
        leaveType: 'Casual',
        startDate: '2026-09-10',
        endDate: '2026-09-12',
        totalDays: 3,
        reason: 'Personal family commitment'
      },
      null,
      2
    )
  },
  {
    id: 'leaves-approve',
    name: '10. Leaves: Approve/Reject Leave',
    category: 'Leaves',
    method: 'PUT',
    path: '/api/leaves/leave_01/status',
    description: 'Approve or reject a pending leave application and update leave balance',
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer dayflow_jwt_admin'
    },
    defaultBody: JSON.stringify(
      {
        status: 'Approved'
      },
      null,
      2
    )
  },
  {
    id: 'payroll-list',
    name: '11. Payroll: Monthly Salary Sheets',
    category: 'Payroll',
    method: 'GET',
    path: '/api/payroll',
    description: 'View monthly payroll sheets with basic, allowances, PF, tax deductions, and net pay',
    defaultHeaders: {
      Authorization: 'Bearer dayflow_jwt_admin'
    }
  },
  {
    id: 'payroll-generate',
    name: '12. Payroll: Generate Payslip',
    category: 'Payroll',
    method: 'POST',
    path: '/api/payroll/generate',
    description: 'Calculate salary breakdown, auto deductions (PF/Tax), and create payslip record',
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer dayflow_jwt_admin'
    },
    defaultBody: JSON.stringify(
      {
        employeeId: 'emp_04',
        month: 'August',
        year: 2026,
        bonus: 1000
      },
      null,
      2
    )
  },
  {
    id: 'departments-list',
    name: '13. Departments: Org Structure & Teams',
    category: 'Departments',
    method: 'GET',
    path: '/api/departments',
    description: 'Retrieve departments, manager profiles, designations, and headcount distribution',
    defaultHeaders: {
      Authorization: 'Bearer dayflow_jwt_admin'
    }
  },
  {
    id: 'announcements-list',
    name: '14. Announcements: Company Notices',
    category: 'Announcements',
    method: 'GET',
    path: '/api/announcements',
    description: 'Get company broadcasts, pinned policy alerts, and department notices',
    defaultHeaders: {
      Authorization: 'Bearer dayflow_jwt_admin'
    }
  }
];

export const ApiPlayground: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [customPath, setCustomPath] = useState(ENDPOINTS[0].path);
  const [requestBody, setRequestBody] = useState(ENDPOINTS[0].defaultBody || '');
  const [authToken, setAuthToken] = useState('dayflow_jwt_admin_token_2026');
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [copiedRes, setCopiedRes] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSelectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setCustomPath(ep.path);
    setRequestBody(ep.defaultBody || '');
    setResponseData(null);
    setResponseStatus(null);
    setResponseTime(null);
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setResponseData(null);
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers
      };

      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(customPath, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const data = await res.json();
      setResponseData(data);

      if (res.ok && selectedEndpoint.id === 'auth-login' && data.token) {
        setAuthToken(data.token);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } else if (res.ok) {
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.85 } });
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(500);
      setResponseData({ error: 'Network / Fetch failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    try {
      setResetting(true);
      await fetch('/api/system/reset-demo-data', { method: 'POST' });
      handleSendRequest();
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const handleCopyResponse = () => {
    if (!responseData) return;
    navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
    setCopiedRes(true);
    setTimeout(() => setCopiedRes(false), 2000);
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'POST':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'PUT':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'DELETE':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="mb-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-100">Live Backend API Test Console</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Test live REST endpoints directly on the running Express instance. Inspect headers, JWT bearer authentication, payloads, and JSON output in real-time.
          </p>
        </div>
        <button
          id="btn-reset-demo-data"
          onClick={handleResetData}
          disabled={resetting}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting Data...' : 'Reset Demo Data'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Endpoints List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[740px]">
          <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Dayflow REST Endpoints</span>
            <span className="text-[11px] text-blue-400 font-mono">{ENDPOINTS.length} available</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
            {ENDPOINTS.map(ep => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  id={`api-btn-${ep.id}`}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${getMethodBadge(ep.method)}`}>
                    {ep.method}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{ep.name}</div>
                    <code className="text-[11px] text-slate-400 block truncate font-mono mt-0.5">{ep.path}</code>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Auth Info */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 mb-1.5 text-slate-300 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>JWT Bearer Token:</span>
            </div>
            <input
              type="text"
              value={authToken}
              onChange={e => setAuthToken(e.target.value)}
              placeholder="Bearer JWT token..."
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-blue-300 truncate focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Request & Response Console (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[740px]">
          {/* URL & Send Bar */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border uppercase ${getMethodBadge(selectedEndpoint.method)}`}>
              {selectedEndpoint.method}
            </span>
            <div className="flex-1 min-w-[200px] relative">
              <input
                id="input-endpoint-url"
                type="text"
                value={customPath}
                onChange={e => setCustomPath(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              id="btn-execute-request"
              onClick={handleSendRequest}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs rounded-lg transition shadow cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 flex-1 overflow-hidden">
            {/* Request Pane */}
            <div className="p-3.5 flex flex-col h-full overflow-hidden bg-slate-950/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Request Payload</span>
                <span className="text-[11px] text-slate-500 font-mono">application/json</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{selectedEndpoint.description}</p>
              <textarea
                id="textarea-request-payload"
                value={requestBody}
                onChange={e => setRequestBody(e.target.value)}
                placeholder="No request body required for this method"
                disabled={['GET', 'DELETE'].includes(selectedEndpoint.method)}
                className="flex-1 w-full p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 resize-none focus:outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Response Pane */}
            <div className="p-3.5 flex flex-col h-full overflow-hidden bg-slate-950">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response</span>
                  {responseStatus !== null && (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        responseStatus >= 200 && responseStatus < 300
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      HTTP {responseStatus}
                    </span>
                  )}
                  {responseTime !== null && (
                    <span className="text-[11px] text-slate-500 font-mono">{responseTime}ms</span>
                  )}
                </div>

                {responseData && (
                  <button
                    id="btn-copy-response"
                    onClick={handleCopyResponse}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    {copiedRes ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-auto bg-slate-900 border border-slate-800/80 rounded-lg p-3 font-mono text-xs text-slate-300">
                {responseData ? (
                  <pre className="whitespace-pre-wrap select-text">{JSON.stringify(responseData, null, 2)}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Play className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                    <p>Click "Send Request" to test this endpoint live.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
