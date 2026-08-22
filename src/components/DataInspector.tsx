import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  Building2, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Plus, 
  RefreshCw,
  Search,
  Check
} from 'lucide-react';

export const DataInspector: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'employees' | 'attendance' | 'leaves' | 'payroll' | 'departments'>('overview');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, empRes, attRes, leavesRes, payRes, deptRes, annRes] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/attendance').then(r => r.json()),
        fetch('/api/leaves').then(r => r.json()),
        fetch('/api/payroll').then(r => r.json()),
        fetch('/api/departments').then(r => r.json()),
        fetch('/api/announcements').then(r => r.json())
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (empRes.success) setEmployees(empRes.employees);
      if (attRes.success) setAttendance(attRes.records);
      if (leavesRes.success) setLeaves(leavesRes.leaves);
      if (payRes.success) setPayrolls(payRes.payrolls);
      if (deptRes.success) setDepartments(deptRes.departments);
      if (annRes.success) setAnnouncements(annRes.announcements);
    } catch (err) {
      console.error('Error fetching HRMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleClockIn = async (employeeId: string) => {
    try {
      const res = await fetch('/api/attendance/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, workMode: 'Office', remarks: 'Live Inspector Clock-in' })
      });
      const data = await res.json();
      if (data.success) {
        showNotice('Clock-in recorded successfully!');
        fetchAllData();
      } else {
        showNotice(data.message || 'Already clocked in today');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      const res = await fetch(`/api/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      const data = await res.json();
      if (data.success) {
        showNotice('Leave approved & deducted from employee balance!');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaySalary = async (payId: string) => {
    try {
      const res = await fetch(`/api/payroll/${payId}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'Direct Deposit' })
      });
      const data = await res.json();
      if (data.success) {
        showNotice('Salary payment processed successfully!');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showNotice = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">Live HR Database State</h2>
            <span className="px-2 py-0.5 text-[11px] rounded bg-blue-500/20 text-blue-300 font-mono">
              Real-Time Backend Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visual inspection of live records stored and managed by the Express backend API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {actionSuccess && (
            <span className="text-xs px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              {actionSuccess}
            </span>
          )}
          <button
            id="btn-refresh-hr-data"
            onClick={fetchAllData}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'HR Dashboard Metrics', icon: Building2 },
          { id: 'employees', label: `Employees (${employees.length})`, icon: Users },
          { id: 'attendance', label: `Today's Attendance (${attendance.length})`, icon: Clock },
          { id: 'leaves', label: `Leave Requests (${leaves.length})`, icon: Calendar },
          { id: 'payroll', label: `Payroll (${payrolls.length})`, icon: DollarSign },
          { id: 'departments', label: `Departments (${departments.length})`, icon: Building2 }
        ].map(sub => {
          const Icon = sub.icon;
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panes */}
      {activeSubTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Headcount</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 mt-2">{stats.headcount?.total || 0}</div>
              <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <span>{stats.headcount?.active} Active Staff</span>
                <span className="text-slate-500">• {stats.headcount?.growthRate}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Present Today</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 mt-2">{stats.attendanceToday?.present || 0}</div>
              <div className="text-xs text-slate-400 mt-1">
                Attendance Rate: <strong className="text-emerald-400">{stats.attendanceToday?.attendanceRate}</strong>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Pending Leaves</span>
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 mt-2">{stats.pendingLeaveRequests || 0}</div>
              <div className="text-xs text-amber-400 mt-1">Awaiting HR Review</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Departments</span>
                <Building2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 mt-2">{stats.departmentCount || 0}</div>
              <div className="text-xs text-indigo-300 mt-1">Eng, HR, Marketing, Finance</div>
            </div>
          </div>

          {/* Department Breakdown & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Department Headcount Distribution
              </h3>
              <div className="space-y-3">
                {departments.map(dept => (
                  <div key={dept._id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{dept.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Code: {dept.code} • Budget: ${dept.budget?.toLocaleString()}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30">
                      {dept.employeeCount || 0} members
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Company Announcements & Notices
              </h3>
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann._id} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{ann.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        {ann.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ann.content}</p>
                    <div className="text-[10px] text-slate-500 mt-2">Author: {ann.author}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employees Table */}
      {activeSubTab === 'employees' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Employee Directory</span>
            <span className="text-xs text-slate-500 font-mono">GET /api/employees</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Base Salary</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {employees.map(emp => (
                  <tr key={emp._id} className="hover:bg-slate-800/50">
                    <td className="p-3 flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.firstName} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-slate-200">{emp.firstName} {emp.lastName}</div>
                        <div className="text-[11px] text-slate-500">{emp.email}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-blue-300">{emp.employeeCode}</td>
                    <td className="p-3">{emp.department?.name || emp.department}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-emerald-400">${emp.salary?.base?.toLocaleString()}/mo</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleClockIn(emp._id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        Clock In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {activeSubTab === 'attendance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Attendance Logs</span>
            <span className="text-xs text-slate-500 font-mono">GET /api/attendance</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Clock In</th>
                  <th className="p-3">Clock Out</th>
                  <th className="p-3">Total Hours</th>
                  <th className="p-3">Work Mode</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {attendance.map(att => (
                  <tr key={att._id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-200">
                      {att.employee?.firstName ? `${att.employee.firstName} ${att.employee.lastName}` : att.employee}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{att.date}</td>
                    <td className="p-3 font-mono text-emerald-400">{new Date(att.clockIn).toLocaleTimeString()}</td>
                    <td className="p-3 font-mono text-slate-400">
                      {att.clockOut ? new Date(att.clockOut).toLocaleTimeString() : 'Active (In Progress)'}
                    </td>
                    <td className="p-3 font-mono text-blue-300">{att.totalWorkHours || 4.5} hrs</td>
                    <td className="p-3">{att.workMode}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaves Table */}
      {activeSubTab === 'leaves' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Leave Applications</span>
            <span className="text-xs text-slate-500 font-mono">GET /api/leaves</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Applicant</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Days</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leaves.map(l => (
                  <tr key={l._id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-200">
                      {l.employee?.firstName ? `${l.employee.firstName} ${l.employee.lastName}` : l.employee}
                    </td>
                    <td className="p-3 font-medium text-blue-300">{l.leaveType}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{l.startDate} to {l.endDate}</td>
                    <td className="p-3 font-mono">{l.totalDays} days</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{l.reason}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          l.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : l.status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {l.status === 'Pending' && (
                        <button
                          onClick={() => handleApproveLeave(l._id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      {activeSubTab === 'payroll' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Payroll Disbursal Register</span>
            <span className="text-xs text-slate-500 font-mono">GET /api/payroll</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Month / Year</th>
                  <th className="p-3">Gross Salary</th>
                  <th className="p-3">Total Deductions</th>
                  <th className="p-3">Net Disbursed</th>
                  <th className="p-3">Payslip No.</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payrolls.map(pay => (
                  <tr key={pay._id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-200">
                      {pay.employee?.firstName ? `${pay.employee.firstName} ${pay.employee.lastName}` : pay.employee}
                    </td>
                    <td className="p-3">{pay.month} {pay.year}</td>
                    <td className="p-3 font-mono">${pay.grossSalary?.toLocaleString()}</td>
                    <td className="p-3 font-mono text-rose-400">-${pay.totalDeductions?.toLocaleString()}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">${pay.netSalary?.toLocaleString()}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{pay.payslipNumber}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          pay.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {pay.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {pay.paymentStatus !== 'Paid' && (
                        <button
                          onClick={() => handlePaySalary(pay._id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Process Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Departments Table */}
      {activeSubTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map(dept => (
            <div key={dept._id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-100">{dept.name}</h4>
                <span className="px-2 py-0.5 rounded font-mono text-xs bg-blue-500/20 text-blue-300 font-bold">
                  {dept.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{dept.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Annual Budget</span>
                  <span className="font-mono text-emerald-400 font-bold">${dept.budget?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Staff</span>
                  <span className="font-mono text-slate-200 font-bold">{dept.employeeCount || 0} Members</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
