import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers for local/cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- In-Memory Realistic HRMS Store (Matches MongoDB Mongoose Models) ---
interface IDepartment {
  _id: string;
  name: string;
  code: string;
  description: string;
  manager: string | null;
  budget: number;
  designations: Array<{ title: string; level: string }>;
  isActive: boolean;
  createdAt: string;
}

interface IEmployee {
  _id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  gender: string;
  department: string; // department ID
  designation: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  employmentType: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Terminated';
  salary: {
    base: number;
    hra: number;
    allowances: number;
    currency: string;
  };
  avatar: string;
  joiningDate: string;
  leaveBalances: {
    casual: number;
    sick: number;
    annual: number;
    unpaid: number;
  };
  createdAt: string;
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  employeeId: string;
  avatar: string;
  isActive: boolean;
  lastLogin: string | null;
}

interface IAttendance {
  _id: string;
  employee: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  totalWorkHours: number;
  status: 'Present' | 'Absent' | 'Half-Day' | 'Late' | 'On-Leave';
  workMode: 'Office' | 'Remote' | 'Hybrid';
  remarks: string;
}

interface ILeave {
  _id: string;
  employee: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reviewedBy?: string | null;
  reviewDate?: string | null;
  createdAt: string;
}

interface IPayroll {
  _id: string;
  employee: string;
  month: string;
  year: number;
  earnings: {
    basic: number;
    hra: number;
    conveyance: number;
    specialAllowance: number;
    bonus: number;
  };
  deductions: {
    providentFund: number;
    professionalTax: number;
    incomeTaxTds: number;
    unpaidLeaveDeduction: number;
  };
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paymentStatus: 'Pending' | 'Paid' | 'Processing';
  paymentDate: string | null;
  paymentMethod: string;
  payslipNumber: string;
  transactionId?: string;
  createdAt: string;
}

interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  isPinned: boolean;
  author: string;
  createdAt: string;
}

// Initial Database Seeding
const initialDepartments: IDepartment[] = [
  {
    _id: 'dept_eng_01',
    name: 'Engineering & Tech',
    code: 'ENG',
    description: 'Product architecture, full-stack development, and DevOps',
    manager: 'emp_02',
    budget: 550000,
    designations: [
      { title: 'Senior Full Stack Engineer', level: 'Senior' },
      { title: 'Frontend Specialist', level: 'Mid' },
      { title: 'Cloud DevOps Architect', level: 'Lead' }
    ],
    isActive: true,
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    _id: 'dept_hr_02',
    name: 'Human Resources',
    code: 'HR',
    description: 'Talent management, compliance, performance, and workplace culture',
    manager: 'emp_01',
    budget: 180000,
    designations: [
      { title: 'HR Director', level: 'Director' },
      { title: 'People Operations Lead', level: 'Lead' },
      { title: 'Talent Acquisition Partner', level: 'Mid' }
    ],
    isActive: true,
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    _id: 'dept_mkt_03',
    name: 'Marketing & Growth',
    code: 'MKT',
    description: 'Brand positioning, acquisition campaigns, and content pipeline',
    manager: 'emp_04',
    budget: 240000,
    designations: [
      { title: 'Growth Marketing Lead', level: 'Lead' },
      { title: 'Product Marketer', level: 'Mid' }
    ],
    isActive: true,
    createdAt: new Date('2024-02-01').toISOString()
  },
  {
    _id: 'dept_fin_04',
    name: 'Finance & Accounting',
    code: 'FIN',
    description: 'Corporate payroll, accounting, audits, and taxation',
    manager: 'emp_05',
    budget: 310000,
    designations: [
      { title: 'Finance Controller', level: 'Lead' },
      { title: 'Senior Payroll Specialist', level: 'Senior' }
    ],
    isActive: true,
    createdAt: new Date('2024-02-10').toISOString()
  }
];

const initialEmployees: IEmployee[] = [
  {
    _id: 'emp_01',
    employeeCode: 'DAY-1001',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.jenkins@dayflow.corp',
    phone: '+1 (555) 234-8901',
    gender: 'Female',
    department: 'dept_hr_02',
    designation: 'HR Director',
    role: 'admin',
    employmentType: 'Full-Time',
    status: 'Active',
    salary: { base: 8500, hra: 3400, allowances: 1500, currency: 'USD' },
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2023-03-15',
    leaveBalances: { casual: 10, sick: 8, annual: 14, unpaid: 0 },
    createdAt: new Date('2023-03-15').toISOString()
  },
  {
    _id: 'emp_02',
    employeeCode: 'DAY-1002',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen@dayflow.corp',
    phone: '+1 (555) 345-6789',
    gender: 'Male',
    department: 'dept_eng_01',
    designation: 'Senior Full Stack Engineer',
    role: 'manager',
    employmentType: 'Full-Time',
    status: 'Active',
    salary: { base: 9200, hra: 3680, allowances: 2000, currency: 'USD' },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2023-06-01',
    leaveBalances: { casual: 11, sick: 10, annual: 12, unpaid: 0 },
    createdAt: new Date('2023-06-01').toISOString()
  },
  {
    _id: 'emp_03',
    employeeCode: 'DAY-1003',
    firstName: 'Amara',
    lastName: 'Okafor',
    email: 'amara.okafor@dayflow.corp',
    phone: '+1 (555) 456-7890',
    gender: 'Female',
    department: 'dept_eng_01',
    designation: 'Frontend Specialist',
    role: 'employee',
    employmentType: 'Full-Time',
    status: 'Active',
    salary: { base: 6800, hra: 2720, allowances: 1200, currency: 'USD' },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2024-01-10',
    leaveBalances: { casual: 12, sick: 9, annual: 15, unpaid: 0 },
    createdAt: new Date('2024-01-10').toISOString()
  },
  {
    _id: 'emp_04',
    employeeCode: 'DAY-1004',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@dayflow.corp',
    phone: '+1 (555) 789-0123',
    gender: 'Male',
    department: 'dept_mkt_03',
    designation: 'Growth Marketing Lead',
    role: 'manager',
    employmentType: 'Full-Time',
    status: 'Active',
    salary: { base: 7400, hra: 2960, allowances: 1400, currency: 'USD' },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2023-09-20',
    leaveBalances: { casual: 8, sick: 10, annual: 10, unpaid: 0 },
    createdAt: new Date('2023-09-20').toISOString()
  },
  {
    _id: 'emp_05',
    employeeCode: 'DAY-1005',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@dayflow.corp',
    phone: '+1 (555) 890-1234',
    gender: 'Female',
    department: 'dept_fin_04',
    designation: 'Finance Controller',
    role: 'hr',
    employmentType: 'Full-Time',
    status: 'Active',
    salary: { base: 8800, hra: 3520, allowances: 1600, currency: 'USD' },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2023-04-05',
    leaveBalances: { casual: 9, sick: 10, annual: 13, unpaid: 0 },
    createdAt: new Date('2023-04-05').toISOString()
  }
];

const initialUsers: IUser[] = [
  {
    _id: 'user_01',
    name: 'Sarah Jenkins',
    email: 'admin@dayflow.corp',
    passwordHash: 'password123',
    role: 'admin',
    employeeId: 'emp_01',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    lastLogin: new Date().toISOString()
  },
  {
    _id: 'user_02',
    name: 'HR Team',
    email: 'hr@dayflow.corp',
    passwordHash: 'password123',
    role: 'hr',
    employeeId: 'emp_01',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    lastLogin: new Date().toISOString()
  },
  {
    _id: 'user_03',
    name: 'David Chen',
    email: 'manager@dayflow.corp',
    passwordHash: 'password123',
    role: 'manager',
    employeeId: 'emp_02',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    lastLogin: new Date().toISOString()
  },
  {
    _id: 'user_04',
    name: 'Amara Okafor',
    email: 'employee@dayflow.corp',
    passwordHash: 'password123',
    role: 'employee',
    employeeId: 'emp_03',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    lastLogin: new Date().toISOString()
  }
];

const initialAttendance: IAttendance[] = [
  {
    _id: 'att_01',
    employee: 'emp_01',
    date: new Date().toISOString().split('T')[0],
    clockIn: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
    clockOut: null,
    totalWorkHours: 4.5,
    status: 'Present',
    workMode: 'Office',
    remarks: 'Morning executive sync'
  },
  {
    _id: 'att_02',
    employee: 'emp_02',
    date: new Date().toISOString().split('T')[0],
    clockIn: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    clockOut: null,
    totalWorkHours: 5,
    status: 'Present',
    workMode: 'Remote',
    remarks: 'Sprint planning & code review'
  },
  {
    _id: 'att_03',
    employee: 'emp_03',
    date: new Date().toISOString().split('T')[0],
    clockIn: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
    clockOut: null,
    totalWorkHours: 3.8,
    status: 'Late',
    workMode: 'Hybrid',
    remarks: 'Transit delay'
  },
  {
    _id: 'att_04',
    employee: 'emp_04',
    date: new Date().toISOString().split('T')[0],
    clockIn: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    clockOut: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    totalWorkHours: 5,
    status: 'Half-Day',
    workMode: 'Office',
    remarks: 'Doctor appointment afternoon'
  }
];

const initialLeaves: ILeave[] = [
  {
    _id: 'leave_01',
    employee: 'emp_03',
    leaveType: 'Casual',
    startDate: '2026-09-01',
    endDate: '2026-09-02',
    totalDays: 2,
    reason: 'Family wedding attendance in hometown',
    status: 'Pending',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'leave_02',
    employee: 'emp_04',
    leaveType: 'Annual',
    startDate: '2026-09-15',
    endDate: '2026-09-20',
    totalDays: 5,
    reason: 'Annual vacation break',
    status: 'Approved',
    reviewedBy: 'user_01',
    reviewDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    _id: 'leave_03',
    employee: 'emp_05',
    leaveType: 'Sick',
    startDate: '2026-08-20',
    endDate: '2026-08-21',
    totalDays: 2,
    reason: 'Seasonal flu recovery',
    status: 'Approved',
    reviewedBy: 'user_01',
    reviewDate: '2026-08-19',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

const initialPayrolls: IPayroll[] = [
  {
    _id: 'pay_01',
    employee: 'emp_01',
    month: 'August',
    year: 2026,
    earnings: { basic: 8500, hra: 3400, conveyance: 1600, specialAllowance: 1500, bonus: 500 },
    deductions: { providentFund: 1020, professionalTax: 200, incomeTaxTds: 750, unpaidLeaveDeduction: 0 },
    grossSalary: 15500,
    totalDeductions: 1970,
    netSalary: 13530,
    paymentStatus: 'Paid',
    paymentDate: '2026-08-01',
    paymentMethod: 'Direct Deposit',
    payslipNumber: 'PAY-2026-AUG-DAY-1001',
    transactionId: 'TXN-98421455',
    createdAt: new Date('2026-08-01').toISOString()
  },
  {
    _id: 'pay_02',
    employee: 'emp_02',
    month: 'August',
    year: 2026,
    earnings: { basic: 9200, hra: 3680, conveyance: 1600, specialAllowance: 2000, bonus: 0 },
    deductions: { providentFund: 1104, professionalTax: 200, incomeTaxTds: 820, unpaidLeaveDeduction: 0 },
    grossSalary: 16480,
    totalDeductions: 2124,
    netSalary: 14356,
    paymentStatus: 'Paid',
    paymentDate: '2026-08-01',
    paymentMethod: 'Direct Deposit',
    payslipNumber: 'PAY-2026-AUG-DAY-1002',
    transactionId: 'TXN-98421456',
    createdAt: new Date('2026-08-01').toISOString()
  },
  {
    _id: 'pay_03',
    employee: 'emp_03',
    month: 'August',
    year: 2026,
    earnings: { basic: 6800, hra: 2720, conveyance: 1600, specialAllowance: 1200, bonus: 0 },
    deductions: { providentFund: 816, professionalTax: 200, incomeTaxTds: 540, unpaidLeaveDeduction: 0 },
    grossSalary: 12320,
    totalDeductions: 1556,
    netSalary: 10764,
    paymentStatus: 'Pending',
    paymentDate: null,
    paymentMethod: 'Direct Deposit',
    payslipNumber: 'PAY-2026-AUG-DAY-1003',
    createdAt: new Date('2026-08-05').toISOString()
  }
];

const initialAnnouncements: IAnnouncement[] = [
  {
    _id: 'ann_01',
    title: '🌟 Q1 2026 Company Performance & Bonus Cycle',
    content: 'We are delighted to announce that company performance metrics for the last quarter have surpassed our growth targets by 18%! Performance reviews are now live in the Dayflow portal.',
    category: 'Policy',
    priority: 'High',
    isPinned: true,
    author: 'Sarah Jenkins (HR Director)',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    _id: 'ann_02',
    title: '🌴 Office Schedule & Statutory Holiday Notice',
    content: 'Dayflow HR reminds everyone that all regional headquarters will be closed next Monday. Please make sure all client handover documentation is logged.',
    category: 'Holiday',
    priority: 'Normal',
    isPinned: false,
    author: 'People Ops Team',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

// Runtime State
let dbDepartments = JSON.parse(JSON.stringify(initialDepartments));
let dbEmployees = JSON.parse(JSON.stringify(initialEmployees));
let dbUsers = JSON.parse(JSON.stringify(initialUsers));
let dbAttendance = JSON.parse(JSON.stringify(initialAttendance));
let dbLeaves = JSON.parse(JSON.stringify(initialLeaves));
let dbPayrolls = JSON.parse(JSON.stringify(initialPayrolls));
let dbAnnouncements = JSON.parse(JSON.stringify(initialAnnouncements));

// Helper: Populate employee with department object
const formatEmployee = (emp: IEmployee) => {
  const dept = dbDepartments.find((d: IDepartment) => d._id === emp.department);
  return {
    ...emp,
    fullName: `${emp.firstName} ${emp.lastName}`,
    department: dept ? { _id: dept._id, name: dept.name, code: dept.code } : emp.department
  };
};

// ==================== REST API ENDPOINTS ====================

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    service: 'Dayflow HRMS Backend API',
    database: 'MongoDB (Mongoose Engine Simulated / Real Ready)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 1. Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password' });
  }

  const user = dbUsers.find(
    (u: IUser) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Check email and password.' });
  }

  user.lastLogin = new Date().toISOString();
  const token = `dayflow_jwt_${user._id}_${Date.now()}`;

  const employee = dbEmployees.find((e: IEmployee) => e._id === user.employeeId);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      employeeId: user.employeeId,
      employeeDetails: employee ? formatEmployee(employee) : null
    }
  });
});

// Auth: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const existing = dbUsers.find((u: IUser) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'User already exists with this email' });
  }

  const newUser: IUser = {
    _id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash: password,
    role: role || 'employee',
    employeeId: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    lastLogin: new Date().toISOString()
  };

  dbUsers.push(newUser);
  const token = `dayflow_jwt_${newUser._id}_${Date.now()}`;

  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar
    }
  });
});

// Auth: Get Current User
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  // Default to Sarah Jenkins (Admin) if testing directly without header
  let user = dbUsers[0];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const tokenPart = authHeader.split(' ')[1];
    const match = dbUsers.find((u: IUser) => tokenPart.includes(u._id));
    if (match) user = match;
  }

  const employee = dbEmployees.find((e: IEmployee) => e._id === user.employeeId);

  res.json({
    success: true,
    user: {
      ...user,
      employeeDetails: employee ? formatEmployee(employee) : null
    }
  });
});

// 2. Dashboard: Summary Stats
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const totalEmployees = dbEmployees.length;
  const activeEmployees = dbEmployees.filter((e: IEmployee) => e.status === 'Active').length;

  const todayAtt = dbAttendance.filter((a: IAttendance) => a.date === todayStr);
  const presentCount = todayAtt.filter((a: IAttendance) => a.status === 'Present' || a.status === 'Late').length;
  const lateCount = todayAtt.filter((a: IAttendance) => a.status === 'Late').length;
  const onLeaveCount = todayAtt.filter((a: IAttendance) => a.status === 'On-Leave').length;
  const absentCount = Math.max(0, activeEmployees - (presentCount + onLeaveCount));

  const pendingLeaves = dbLeaves.filter((l: ILeave) => l.status === 'Pending').map((l: ILeave) => {
    const emp = dbEmployees.find((e: IEmployee) => e._id === l.employee);
    return {
      ...l,
      employee: emp ? formatEmployee(emp) : null
    };
  });

  const departmentCounts = dbDepartments.map((dept: IDepartment) => {
    const count = dbEmployees.filter((e: IEmployee) => e.department === dept._id).length;
    return {
      name: dept.name,
      code: dept.code,
      count
    };
  });

  res.json({
    success: true,
    stats: {
      headcount: {
        total: totalEmployees,
        active: activeEmployees,
        growthRate: '+6.5%'
      },
      attendanceToday: {
        totalLogged: todayAtt.length,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        onLeave: onLeaveCount,
        attendanceRate: activeEmployees > 0 ? `${((presentCount / activeEmployees) * 100).toFixed(1)}%` : '92%'
      },
      pendingLeaveRequests: pendingLeaves.length,
      departmentCount: dbDepartments.length,
      departmentDistribution: departmentCounts,
      recentAnnouncements: dbAnnouncements.slice(0, 3),
      pendingLeavesList: pendingLeaves
    }
  });
});

// 3. Employees: CRUD
app.get('/api/employees', (req: Request, res: Response) => {
  const { department, status, role, search } = req.query;
  let results = [...dbEmployees];

  if (department) results = results.filter(e => e.department === department);
  if (status) results = results.filter(e => e.status === status);
  if (role) results = results.filter(e => e.role === role);

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    results = results.filter(
      e =>
        e.firstName.toLowerCase().includes(s) ||
        e.lastName.toLowerCase().includes(s) ||
        e.email.toLowerCase().includes(s) ||
        e.employeeCode.toLowerCase().includes(s) ||
        e.designation.toLowerCase().includes(s)
    );
  }

  const populated = results.map(formatEmployee);
  res.json({
    success: true,
    count: populated.length,
    total: dbEmployees.length,
    employees: populated
  });
});

app.get('/api/employees/:id', (req: Request, res: Response) => {
  const emp = dbEmployees.find(e => e._id === req.params.id);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
  res.json({ success: true, employee: formatEmployee(emp) });
});

app.post('/api/employees', (req: Request, res: Response) => {
  const newEmp: IEmployee = {
    _id: `emp_${Date.now()}`,
    employeeCode: req.body.employeeCode || `DAY-${1000 + dbEmployees.length + 1}`,
    firstName: req.body.firstName || 'New',
    lastName: req.body.lastName || 'Staff',
    email: req.body.email || `user.${Date.now()}@dayflow.corp`,
    phone: req.body.phone || '+1 (555) 000-0000',
    gender: req.body.gender || 'Prefer not to say',
    department: req.body.department || dbDepartments[0]._id,
    designation: req.body.designation || 'Staff Member',
    role: req.body.role || 'employee',
    employmentType: req.body.employmentType || 'Full-Time',
    status: req.body.status || 'Active',
    salary: req.body.salary || { base: 6000, hra: 2400, allowances: 1000, currency: 'USD' },
    avatar: req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joiningDate: req.body.joiningDate || new Date().toISOString().split('T')[0],
    leaveBalances: { casual: 12, sick: 10, annual: 15, unpaid: 0 },
    createdAt: new Date().toISOString()
  };

  dbEmployees.unshift(newEmp);
  res.status(201).json({ success: true, message: 'Employee added successfully', employee: formatEmployee(newEmp) });
});

app.put('/api/employees/:id', (req: Request, res: Response) => {
  const index = dbEmployees.findIndex(e => e._id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Employee not found' });

  dbEmployees[index] = { ...dbEmployees[index], ...req.body };
  res.json({ success: true, message: 'Employee updated successfully', employee: formatEmployee(dbEmployees[index]) });
});

app.delete('/api/employees/:id', (req: Request, res: Response) => {
  const index = dbEmployees.findIndex(e => e._id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Employee not found' });

  dbEmployees.splice(index, 1);
  res.json({ success: true, message: 'Employee deleted successfully' });
});

// 4. Attendance
app.get('/api/attendance', (req: Request, res: Response) => {
  const { employee, status, date } = req.query;
  let records = [...dbAttendance];

  if (employee) records = records.filter(r => r.employee === employee);
  if (status) records = records.filter(r => r.status === status);
  if (date) records = records.filter(r => r.date === date);

  const populated = records.map(att => {
    const emp = dbEmployees.find(e => e._id === att.employee);
    return {
      ...att,
      employee: emp ? formatEmployee(emp) : null
    };
  });

  res.json({ success: true, count: populated.length, records: populated });
});

app.post('/api/attendance/clock-in', (req: Request, res: Response) => {
  const { employeeId, workMode = 'Office', remarks = 'Logged in via Dayflow HRMS' } = req.body;
  const targetEmpId = employeeId || dbEmployees[0]._id;

  const todayStr = new Date().toISOString().split('T')[0];
  const existing = dbAttendance.find(a => a.employee === targetEmpId && a.date === todayStr);

  if (existing) {
    return res.status(400).json({ success: false, message: 'Already clocked in for today', record: existing });
  }

  const newRecord: IAttendance = {
    _id: `att_${Date.now()}`,
    employee: targetEmpId,
    date: todayStr,
    clockIn: new Date().toISOString(),
    clockOut: null,
    totalWorkHours: 0,
    status: 'Present',
    workMode,
    remarks
  };

  dbAttendance.unshift(newRecord);
  res.status(201).json({ success: true, message: 'Clock-in successfully recorded', record: newRecord });
});

app.post('/api/attendance/clock-out', (req: Request, res: Response) => {
  const { employeeId } = req.body;
  const targetEmpId = employeeId || dbEmployees[0]._id;
  const todayStr = new Date().toISOString().split('T')[0];

  const record = dbAttendance.find(a => a.employee === targetEmpId && a.date === todayStr);
  if (!record) {
    return res.status(404).json({ success: false, message: 'No active clock-in found for today' });
  }

  if (record.clockOut) {
    return res.status(400).json({ success: false, message: 'Already clocked out for today' });
  }

  const clockOutTime = new Date();
  const diffInMs = clockOutTime.getTime() - new Date(record.clockIn).getTime();
  const totalHours = Number((diffInMs / (1000 * 60 * 60)).toFixed(2)) || 4.2;

  record.clockOut = clockOutTime.toISOString();
  record.totalWorkHours = totalHours;

  res.json({ success: true, message: 'Clock-out successfully recorded', record });
});

// 5. Leaves
app.get('/api/leaves', (req: Request, res: Response) => {
  const { status, employee } = req.query;
  let list = [...dbLeaves];

  if (status) list = list.filter(l => l.status === status);
  if (employee) list = list.filter(l => l.employee === employee);

  const populated = list.map(l => {
    const emp = dbEmployees.find(e => e._id === l.employee);
    return {
      ...l,
      employee: emp ? formatEmployee(emp) : null
    };
  });

  res.json({ success: true, count: populated.length, leaves: populated });
});

app.post('/api/leaves', (req: Request, res: Response) => {
  const { employeeId, leaveType, startDate, endDate, totalDays, reason } = req.body;
  const empId = employeeId || dbEmployees[0]._id;

  const newLeave: ILeave = {
    _id: `leave_${Date.now()}`,
    employee: empId,
    leaveType: leaveType || 'Casual',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    totalDays: Number(totalDays) || 1,
    reason: reason || 'Personal reasons',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  dbLeaves.unshift(newLeave);
  res.status(201).json({ success: true, message: 'Leave application submitted successfully', leave: newLeave });
});

app.put('/api/leaves/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const leave = dbLeaves.find(l => l._id === req.params.id);
  if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

  leave.status = status || 'Approved';
  leave.reviewedBy = 'user_01';
  leave.reviewDate = new Date().toISOString();

  res.json({ success: true, message: `Leave marked as ${leave.status}`, leave });
});

// 6. Payroll
app.get('/api/payroll', (req: Request, res: Response) => {
  const { month, year, paymentStatus } = req.query;
  let list = [...dbPayrolls];

  if (month) list = list.filter(p => p.month.toLowerCase() === String(month).toLowerCase());
  if (year) list = list.filter(p => p.year === Number(year));
  if (paymentStatus) list = list.filter(p => p.paymentStatus === paymentStatus);

  const populated = list.map(p => {
    const emp = dbEmployees.find(e => e._id === p.employee);
    return {
      ...p,
      employee: emp ? formatEmployee(emp) : null
    };
  });

  res.json({ success: true, count: populated.length, payrolls: populated });
});

app.post('/api/payroll/generate', (req: Request, res: Response) => {
  const { employeeId, month = 'August', year = 2026, bonus = 0 } = req.body;
  const emp = dbEmployees.find(e => e._id === (employeeId || dbEmployees[0]._id));
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

  const basic = emp.salary.base;
  const hra = emp.salary.hra;
  const specialAllowance = emp.salary.allowances;
  const grossSalary = basic + hra + 1600 + specialAllowance + Number(bonus);

  const pf = Math.round(basic * 0.12);
  const profTax = 200;
  const tds = Math.round(grossSalary * 0.05);
  const totalDeductions = pf + profTax + tds;
  const netSalary = grossSalary - totalDeductions;

  const newPayroll: IPayroll = {
    _id: `pay_${Date.now()}`,
    employee: emp._id,
    month,
    year: Number(year),
    earnings: { basic, hra, conveyance: 1600, specialAllowance, bonus: Number(bonus) },
    deductions: { providentFund: pf, professionalTax: profTax, incomeTaxTds: tds, unpaidLeaveDeduction: 0 },
    grossSalary,
    totalDeductions,
    netSalary,
    paymentStatus: 'Pending',
    paymentDate: null,
    paymentMethod: 'Direct Deposit',
    payslipNumber: `PAY-${year}-${month.toUpperCase()}-${emp.employeeCode}`,
    createdAt: new Date().toISOString()
  };

  dbPayrolls.unshift(newPayroll);
  res.status(201).json({ success: true, message: 'Payslip generated successfully', payroll: newPayroll });
});

app.put('/api/payroll/:id/pay', (req: Request, res: Response) => {
  const pay = dbPayrolls.find(p => p._id === req.params.id);
  if (!pay) return res.status(404).json({ success: false, message: 'Payroll record not found' });

  pay.paymentStatus = 'Paid';
  pay.paymentDate = new Date().toISOString();
  pay.transactionId = `TXN-${Date.now()}`;

  res.json({ success: true, message: 'Salary disbursed successfully', payroll: pay });
});

// 7. Departments
app.get('/api/departments', (req: Request, res: Response) => {
  const departmentsWithCounts = dbDepartments.map(dept => {
    const employeeCount = dbEmployees.filter(e => e.department === dept._id).length;
    const manager = dbEmployees.find(e => e._id === dept.manager);
    return {
      ...dept,
      employeeCount,
      manager: manager ? formatEmployee(manager) : null
    };
  });

  res.json({ success: true, count: departmentsWithCounts.length, departments: departmentsWithCounts });
});

app.post('/api/departments', (req: Request, res: Response) => {
  const newDept: IDepartment = {
    _id: `dept_${Date.now()}`,
    name: req.body.name || 'New Department',
    code: (req.body.code || 'DEPT').toUpperCase(),
    description: req.body.description || '',
    manager: req.body.manager || null,
    budget: Number(req.body.budget) || 100000,
    designations: req.body.designations || [{ title: 'Specialist', level: 'Mid' }],
    isActive: true,
    createdAt: new Date().toISOString()
  };

  dbDepartments.push(newDept);
  res.status(201).json({ success: true, message: 'Department created', department: newDept });
});

// 8. Announcements
app.get('/api/announcements', (req: Request, res: Response) => {
  res.json({ success: true, count: dbAnnouncements.length, announcements: dbAnnouncements });
});

app.post('/api/announcements', (req: Request, res: Response) => {
  const newAnn: IAnnouncement = {
    _id: `ann_${Date.now()}`,
    title: req.body.title || 'Company Notice',
    content: req.body.content || '',
    category: req.body.category || 'General',
    priority: req.body.priority || 'Normal',
    isPinned: Boolean(req.body.isPinned),
    author: req.body.author || 'HR Operations',
    createdAt: new Date().toISOString()
  };

  dbAnnouncements.unshift(newAnn);
  res.status(201).json({ success: true, message: 'Announcement broadcasted', announcement: newAnn });
});

// Reset Demo Data helper
app.post('/api/system/reset-demo-data', (req: Request, res: Response) => {
  dbDepartments = JSON.parse(JSON.stringify(initialDepartments));
  dbEmployees = JSON.parse(JSON.stringify(initialEmployees));
  dbUsers = JSON.parse(JSON.stringify(initialUsers));
  dbAttendance = JSON.parse(JSON.stringify(initialAttendance));
  dbLeaves = JSON.parse(JSON.stringify(initialLeaves));
  dbPayrolls = JSON.parse(JSON.stringify(initialPayrolls));
  dbAnnouncements = JSON.parse(JSON.stringify(initialAnnouncements));

  res.json({ success: true, message: 'Database state reset to default demo dataset' });
});

// ==================== Vite / SPA Middleware ====================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dayflow HRMS Backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
