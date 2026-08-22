import React, { useState } from 'react';
import { Database, Link2, Key, ArrowRight, Layers, ShieldCheck, Check } from 'lucide-react';

interface SchemaField {
  name: string;
  type: string;
  required?: boolean;
  ref?: string;
  unique?: boolean;
  desc?: string;
}

interface ModelSchema {
  name: string;
  collection: string;
  description: string;
  color: string;
  fields: SchemaField[];
}

const SCHEMAS: ModelSchema[] = [
  {
    name: 'User',
    collection: 'users',
    description: 'System authentication credentials, roles, and password hashes with JWT integration',
    color: 'border-blue-500/40 bg-blue-500/5',
    fields: [
      { name: '_id', type: 'ObjectId', desc: 'Primary Key' },
      { name: 'name', type: 'String', required: true },
      { name: 'email', type: 'String', required: true, unique: true },
      { name: 'password', type: 'String (hashed)', required: true },
      { name: 'role', type: 'Enum: admin | hr | manager | employee' },
      { name: 'employeeId', type: 'ObjectId', ref: 'Employee' },
      { name: 'isActive', type: 'Boolean', desc: 'Default true' },
      { name: 'lastLogin', type: 'Date' }
    ]
  },
  {
    name: 'Employee',
    collection: 'employees',
    description: 'Full employee profile, job designation, salary structure, and leave balances',
    color: 'border-indigo-500/40 bg-indigo-500/5',
    fields: [
      { name: '_id', type: 'ObjectId', desc: 'Primary Key' },
      { name: 'employeeCode', type: 'String', required: true, unique: true, desc: 'e.g. DAY-1001' },
      { name: 'firstName / lastName', type: 'String', required: true },
      { name: 'email', type: 'String', required: true, unique: true },
      { name: 'department', type: 'ObjectId', ref: 'Department', required: true },
      { name: 'designation', type: 'String', required: true },
      { name: 'role', type: 'Enum: admin | hr | manager | employee' },
      { name: 'status', type: 'Enum: Active | On Leave | Terminated' },
      { name: 'salary', type: 'Object: { base, hra, allowances, currency }' },
      { name: 'leaveBalances', type: 'Object: { casual, sick, annual, unpaid }' }
    ]
  },
  {
    name: 'Department',
    collection: 'departments',
    description: 'Company organizational units, team hierarchy, and budget allocations',
    color: 'border-emerald-500/40 bg-emerald-500/5',
    fields: [
      { name: '_id', type: 'ObjectId', desc: 'Primary Key' },
      { name: 'name', type: 'String', required: true, unique: true },
      { name: 'code', type: 'String', required: true, unique: true, desc: 'e.g. ENG, HR' },
      { name: 'manager', type: 'ObjectId', ref: 'Employee' },
      { name: 'budget', type: 'Number' },
      { name: 'designations', type: 'Array of { title, level }' }
    ]
  },
  {
    name: 'Attendance',
    collection: 'attendances',
    description: 'Daily clock-in/out stamps, computed hours, work mode, and status',
    color: 'border-amber-500/40 bg-amber-500/5',
    fields: [
      { name: '_id', type: 'ObjectId', desc: 'Primary Key' },
      { name: 'employee', type: 'ObjectId', ref: 'Employee', required: true },
      { name: 'date', type: 'Date', required: true },
      { name: 'clockIn', type: 'Date', required: true },
      { name: 'clockOut', type: 'Date (Nullable)' },
      { name: 'totalWorkHours', type: 'Number' },
      { name: 'workMode', type: 'Enum: Office | Remote | Hybrid' },
      { name: 'status', type: 'Enum: Present | Absent | Late | Half-Day | On-Leave' }
    ]
  },
  {
    name: 'Leave',
    collection: 'leaves',
    description: 'Leave request applications, date ranges, and manager/HR approval records',
    color: 'border-cyan-500/40 bg-cyan-500/5',
    fields: [
      { name: '_id', type: 'ObjectId', desc: 'Primary Key' },
      { name: 'employee', type: 'ObjectId', ref: 'Employee', required: true },
      { name: 'leaveType', type: 'Enum: Casual | Sick | Annual | Maternity | Unpaid', required: true },
      { name: 'startDate / endDate', type: 'Date', required: true },
      { name: 'totalDays', type: 'Number', required: true },
      { name: 'reason', type: 'String', required: true },
      { name: 'status', type: 'Enum: Pending | Approved | Rejected' },
      { name: 'reviewedBy', type: 'ObjectId', ref: 'User' }
    ]
  },
  {
    name: 'Payroll',
    collection: 'payrolls',
    description: 'Monthly salary disbursements, breakdown of allowances and PF/Tax deductions',
    color: 'border-purple-500/40 bg-purple-500/5',
    fields: [
      { name: '_id', type: 'ObjectId', desc: 'Primary Key' },
      { name: 'employee', type: 'ObjectId', ref: 'Employee', required: true },
      { name: 'month / year', type: 'String / Number', required: true },
      { name: 'earnings', type: 'Object: { basic, hra, conveyance, specialAllowance, bonus }' },
      { name: 'deductions', type: 'Object: { providentFund, professionalTax, incomeTaxTds }' },
      { name: 'grossSalary / netSalary', type: 'Number', required: true },
      { name: 'paymentStatus', type: 'Enum: Pending | Processing | Paid' },
      { name: 'payslipNumber', type: 'String', unique: true }
    ]
  }
];

export const SchemaVisualizer: React.FC = () => {
  const [selectedSchema, setSelectedSchema] = useState<string>('Employee');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Intro Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <Database className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-100">MongoDB Database Architecture & ERD Diagram</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mongoose Schema relationships, indexed unique keys, and ObjectId references across Dayflow HRMS collections.
          </p>
        </div>
      </div>

      {/* Relations Summary Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Model Relationships Map</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
            <strong className="text-blue-400">User</strong> (1:1) &rarr; <span className="text-indigo-400">Employee</span>
          </span>
          <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
            <strong className="text-indigo-400">Employee</strong> (N:1) &rarr; <span className="text-emerald-400">Department</span>
          </span>
          <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
            <strong className="text-amber-400">Attendance</strong> (N:1) &rarr; <span className="text-indigo-400">Employee</span>
          </span>
          <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
            <strong className="text-cyan-400">Leave</strong> (N:1) &rarr; <span className="text-indigo-400">Employee</span> & <span className="text-blue-400">User</span>
          </span>
          <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
            <strong className="text-purple-400">Payroll</strong> (N:1) &rarr; <span className="text-indigo-400">Employee</span>
          </span>
        </div>
      </div>

      {/* Schema Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCHEMAS.map(schema => (
          <div
            key={schema.name}
            className={`p-5 rounded-xl border bg-slate-900 shadow-md ${schema.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-300" />
                <h4 className="text-base font-bold text-slate-100">{schema.name} Schema</h4>
              </div>
              <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {schema.collection}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">{schema.description}</p>

            <div className="space-y-1.5">
              {schema.fields.map(f => (
                <div key={f.name} className="p-2 bg-slate-950/80 rounded border border-slate-800/80 flex items-start justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="font-mono font-medium text-slate-200 truncate flex items-center gap-1.5">
                      {f.name}
                      {f.required && <span className="text-rose-400 text-[10px]">*req</span>}
                      {f.unique && <span className="text-amber-400 text-[10px]">*uniq</span>}
                    </div>
                    {f.desc && <span className="text-[10px] text-slate-500 block">{f.desc}</span>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-[11px] text-blue-300">{f.type}</span>
                    {f.ref && (
                      <span className="block text-[10px] text-emerald-400 font-mono">
                        &rarr; ref: {f.ref}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
