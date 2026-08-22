export interface BackendFile {
  path: string;
  name: string;
  category: 'core' | 'config' | 'models' | 'controllers' | 'routes' | 'middlewares' | 'seeder' | 'docs' | 'docker';
  description: string;
  content: string;
}

export const BACKEND_FILES: BackendFile[] = [
  {
    path: 'package.json',
    name: 'package.json',
    category: 'core',
    description: 'Node.js project manifest with all required dependencies (Express, Mongoose, JWT, bcryptjs, etc.)',
    content: `{
  "name": "dayflow-hrms-backend",
  "version": "1.0.0",
  "description": "Production-ready RESTful backend for Dayflow HRMS built with Node.js, Express, and MongoDB",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seeder.js",
    "seed:destroy": "node seeder.js -d"
  },
  "keywords": [
    "hrms",
    "human-resources",
    "express",
    "mongodb",
    "mongoose",
    "jwt",
    "dayflow"
  ],
  "author": "Dayflow HRMS Team",
  "license": "MIT",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.9.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}`
  },
  {
    path: '.env.example',
    name: '.env.example',
    category: 'config',
    description: 'Environment variables template for local and production deployment',
    content: `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas / Local Connection URI
# Example Atlas: mongodb+srv://<username>:<password>@cluster0.mongodb.net/dayflow_hrms?retryWrites=true&w=majority
# Example Local: mongodb://127.0.0.1:27017/dayflow_hrms
MONGO_URI=mongodb://127.0.0.1:27017/dayflow_hrms

# JWT Authentication Secrets
JWT_SECRET=dayflow_super_secret_jwt_key_2026_production_safe
JWT_EXPIRE=30d

# Frontend Allowed Origin for CORS
# Dayflow HRMS Frontend URL
CLIENT_URL=https://dayflow-hrms-p6k4r9.pages.bu.app
`
  },
  {
    path: '.gitignore',
    name: '.gitignore',
    category: 'config',
    description: 'Git ignore rules for node_modules, environment secrets, and upload caches',
    content: `node_modules/
.env
.env.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
uploads/
dist/
.DS_Store
*.log
`
  },
  {
    path: 'server.js',
    name: 'server.js',
    category: 'core',
    description: 'Main Express application entry point with middleware pipeline, CORS setup, and API routes mounting',
    content: `const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Security and utility middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for Dayflow HRMS frontend
const allowedOrigins = [
  'https://dayflow-hrms-p6k4r9.pages.bu.app',
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Not allowed by origin'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static uploads (profile photos, payslips)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Dayflow HRMS Backend API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount HRMS API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(\`===============================================\`);
  console.log(\`🚀 Dayflow HRMS Backend Server running on port \${PORT}\`);
  console.log(\`🌐 API Base URL: http://localhost:\${PORT}/api\`);
  console.log(\`📦 Database: MongoDB Connected\`);
  console.log(\`===============================================\`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(\`Unhandled Rejection Error: \${err.message}\`);
  // Graceful shutdown
  server.close(() => process.exit(1));
});
`
  },
  {
    path: 'config/db.js',
    name: 'config/db.js',
    category: 'config',
    description: 'MongoDB Mongoose connection manager with reconnection resilience and event listeners',
    content: `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose driver options are automated by default
    });

    console.log(\`✅ MongoDB Connected: \${conn.connection.host} / Database: \${conn.connection.name}\`);
  } catch (error) {
    console.error(\`❌ MongoDB Connection Error: \${error.message}\`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
});

module.exports = connectDB;
`
  },
  {
    path: 'models/User.js',
    name: 'models/User.js',
    category: 'models',
    description: 'User authentication model with password hashing, roles (Admin, HR, Manager, Employee), and JWT signing',
    content: `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'hr', 'manager', 'employee'],
      default: 'employee'
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Signed JWT Token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      name: this.name,
      employeeId: this.employeeId
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

module.exports = mongoose.model('User', userSchema);
`
  },
  {
    path: 'models/Employee.js',
    name: 'models/Employee.js',
    category: 'models',
    description: 'Comprehensive Employee profile model with department, designation, salary breakdown, contact & emergency details',
    content: `const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, 'Employee code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Work email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    personalEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say'
    },
    dateOfBirth: {
      type: Date
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
      default: Date.now
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required']
    },
    designation: {
      type: String,
      required: [true, 'Designation / job title is required'],
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'hr', 'manager', 'employee'],
      default: 'employee'
    },
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern', 'Probation'],
      default: 'Full-Time'
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Suspended', 'Terminated', 'Resigned'],
      default: 'Active'
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    salary: {
      base: { type: Number, required: true, default: 0 },
      hra: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      bankName: String,
      ifscOrRoutingCode: String
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    leaveBalances: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      annual: { type: Number, default: 15 },
      unpaid: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for full name
employeeSchema.virtual('fullName').get(function () {
  return \`\${this.firstName} \${this.lastName}\`;
});

module.exports = mongoose.model('Employee', employeeSchema);
`
  },
  {
    path: 'models/Attendance.js',
    name: 'models/Attendance.js',
    category: 'models',
    description: 'Attendance & Time tracking model supporting clock-in/out, work hours calculation, and status tags',
    content: `const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required']
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    clockIn: {
      type: Date,
      required: [true, 'Clock in time is required']
    },
    clockOut: {
      type: Date,
      default: null
    },
    totalWorkHours: {
      type: Number, // in hours
      default: 0
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half-Day', 'Late', 'On-Leave', 'Holiday'],
      default: 'Present'
    },
    workMode: {
      type: String,
      enum: ['Office', 'Remote', 'Hybrid'],
      default: 'Office'
    },
    location: {
      ip: String,
      city: String,
      latitude: Number,
      longitude: Number
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Ensure an employee can have at most one attendance record per calendar day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
`
  },
  {
    path: 'models/Leave.js',
    name: 'models/Leave.js',
    category: 'models',
    description: 'Leave request and approval workflow model with leave types, duration, reason, and approval tracking',
    content: `const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required']
    },
    leaveType: {
      type: String,
      enum: ['Casual', 'Sick', 'Annual', 'Maternity', 'Paternity', 'Unpaid', 'Bereavement'],
      required: [true, 'Leave type is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    totalDays: {
      type: Number,
      required: [true, 'Total days count is required'],
      min: [0.5, 'Minimum leave is half a day']
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewDate: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Leave', leaveSchema);
`
  },
  {
    path: 'models/Payroll.js',
    name: 'models/Payroll.js',
    category: 'models',
    description: 'Payroll and salary calculation model with earnings, deductions, net pay, and payment status',
    content: `const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required']
    },
    month: {
      type: String, // e.g. "August", "September" or "08"
      required: [true, 'Payroll month is required']
    },
    year: {
      type: Number,
      required: [true, 'Payroll year is required']
    },
    earnings: {
      basic: { type: Number, required: true },
      hra: { type: Number, default: 0 },
      conveyance: { type: Number, default: 0 },
      specialAllowance: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 }
    },
    deductions: {
      providentFund: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      incomeTaxTds: { type: Number, default: 0 },
      unpaidLeaveDeduction: { type: Number, default: 0 }
    },
    grossSalary: {
      type: Number,
      required: true
    },
    totalDeductions: {
      type: Number,
      required: true
    },
    netSalary: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Draft', 'Pending', 'Processing', 'Paid', 'Failed'],
      default: 'Pending'
    },
    paymentDate: {
      type: Date,
      default: null
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'Direct Deposit', 'Cheque', 'Cash'],
      default: 'Direct Deposit'
    },
    transactionId: {
      type: String,
      default: ''
    },
    payslipNumber: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payroll', payrollSchema);
`
  },
  {
    path: 'models/Department.js',
    name: 'models/Department.js',
    category: 'models',
    description: 'Department organization model with department codes, head of department, and member counts',
    content: `const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Department code is required (e.g. ENG, HR, MKT)'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    designations: [
      {
        title: { type: String, required: true },
        level: { type: String, default: 'Mid' }
      }
    ],
    budget: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Department', departmentSchema);
`
  },
  {
    path: 'models/Announcement.js',
    name: 'models/Announcement.js',
    category: 'models',
    description: 'Company-wide notices, HR broadcasts, priority badges, and target department filtering',
    content: `const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required']
    },
    category: {
      type: String,
      enum: ['General', 'Holiday', 'Policy', 'Event', 'Urgent', 'Wellness'],
      default: 'General'
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Urgent'],
      default: 'Normal'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetDepartments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      }
    ],
    isPinned: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);
`
  },
  {
    path: 'models/Performance.js',
    name: 'models/Performance.js',
    category: 'models',
    description: 'Performance appraisal, KPI ratings, manager reviews, and goal tracker model',
    content: `const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required']
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer reference is required']
    },
    reviewCycle: {
      type: String,
      required: [true, 'Review cycle is required (e.g. Q1 2026, Annual 2025)'],
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Overall rating (1-5) is required']
    },
    kpiScores: [
      {
        kpiName: String,
        weight: Number,
        score: Number,
        comment: String
      }
    ],
    strengths: {
      type: String,
      default: ''
    },
    areasOfImprovement: {
      type: String,
      default: ''
    },
    goals: [
      {
        goalDescription: String,
        status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'In Progress' },
        dueDate: Date
      }
    ],
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Acknowledged', 'Closed'],
      default: 'Submitted'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Performance', performanceSchema);
`
  },
  {
    path: 'middlewares/authMiddleware.js',
    name: 'middlewares/authMiddleware.js',
    category: 'middlewares',
    description: 'JWT Bearer token verification and Role-Based Access Control (RBAC) middleware',
    content: `const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verifies Bearer token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and attach to req.user (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists'
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact HR admin.'
        });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token is invalid or expired'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided'
    });
  }
};

// Grant access to specific roles (e.g. authorize('admin', 'hr'))
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: \`Role '\${req.user.role}' is not authorized to access this resource\`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
`
  },
  {
    path: 'middlewares/errorMiddleware.js',
    name: 'middlewares/errorMiddleware.js',
    category: 'middlewares',
    description: 'Global 404 handler and unified error handling with Mongoose CastError & validation formatting',
    content: `// 404 Not Found Handler
const notFound = (req, res, next) => {
  const error = new Error(\`Not Found - \${req.originalUrl}\`);
  res.status(404);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found with the specified ID';
  }

  // Handle Mongoose Duplicate Key (Code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = \`Duplicate value entered for '\${field}' field. Must be unique.\`;
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please login again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };
`
  },
  {
    path: 'controllers/authController.js',
    name: 'controllers/authController.js',
    category: 'controllers',
    description: 'Handles user login, user registration, profile retrieval, and session verification',
    content: `const User = require('../models/User');
const Employee = require('../models/Employee');

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Check for user (select password explicitly)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public or Admin
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'employee'
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('employeeId');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
`
  },
  {
    path: 'controllers/employeeController.js',
    name: 'controllers/employeeController.js',
    category: 'controllers',
    description: 'Full CRUD operations for employees with filtering, searching, department association, and pagination',
    content: `const Employee = require('../models/Employee');
const Department = require('../models/Department');

// @desc    Get all employees with filters and pagination
// @route   GET /api/employees
// @access  Private (Admin, HR, Manager)
exports.getEmployees = async (req, res, next) => {
  try {
    const { department, status, role, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (department) query.department = department;
    if (status) query.status = status;
    if (role) query.role = role;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name code budget designations')
      .populate('manager', 'firstName lastName email designation');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin, HR)
exports.createEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Employee profile created successfully',
      employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, HR)
exports.updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Employee removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
`
  },
  {
    path: 'controllers/attendanceController.js',
    name: 'controllers/attendanceController.js',
    category: 'controllers',
    description: 'Manages employee clock-in, clock-out, daily attendance status, timesheets, and hours computation',
    content: `const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Get attendance logs
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { date, employee, status, month, year } = req.query;
    const query = {};

    if (employee) query.employee = employee;
    if (status) query.status = status;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeCode designation avatar')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clock In
// @route   POST /api/attendance/clock-in
// @access  Private
exports.clockIn = async (req, res, next) => {
  try {
    const { employeeId, workMode = 'Office', remarks = '' } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existing = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Employee has already clocked in today',
        record: existing
      });
    }

    // Determine status based on clock in time (e.g. after 9:30 AM is Late)
    const clockInHour = new Date().getHours();
    const clockInMinutes = new Date().getMinutes();
    const isLate = clockInHour > 9 || (clockInHour === 9 && clockInMinutes > 30);

    const record = await Attendance.create({
      employee: employeeId,
      date: new Date(),
      clockIn: new Date(),
      workMode,
      status: isLate ? 'Late' : 'Present',
      remarks
    });

    res.status(201).json({
      success: true,
      message: 'Clock-in recorded successfully',
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clock Out
// @route   POST /api/attendance/clock-out
// @access  Private
exports.clockOut = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'No active clock-in found for today'
      });
    }

    if (record.clockOut) {
      return res.status(400).json({
        success: false,
        message: 'Employee has already clocked out today'
      });
    }

    const clockOutTime = new Date();
    const diffInMs = clockOutTime.getTime() - new Date(record.clockIn).getTime();
    const totalHours = Number((diffInMs / (1000 * 60 * 60)).toFixed(2));

    record.clockOut = clockOutTime;
    record.totalWorkHours = totalHours;

    if (totalHours < 4 && record.status !== 'On-Leave') {
      record.status = 'Half-Day';
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Clock-out recorded successfully',
      record
    });
  } catch (error) {
    next(error);
  }
};
`
  },
  {
    path: 'controllers/leaveController.js',
    name: 'controllers/leaveController.js',
    category: 'controllers',
    description: 'Handles leave applications, review status approvals/rejections, and leave balance calculations',
    content: `const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res, next) => {
  try {
    const { status, employee, leaveType } = req.query;
    const query = {};

    if (status) query.status = status;
    if (employee) query.employee = employee;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeCode designation avatar department')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res, next) => {
  try {
    const { employeeId, leaveType, startDate, endDate, totalDays, reason } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check balance
    const typeKey = leaveType.toLowerCase();
    if (employee.leaveBalances[typeKey] !== undefined) {
      if (employee.leaveBalances[typeKey] < totalDays) {
        return res.status(400).json({
          success: false,
          message: \`Insufficient \${leaveType} leave balance. Available: \${employee.leaveBalances[typeKey]} days.\`
        });
      }
    }

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update leave status (Approve / Reject)
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin, HR, Manager)
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user ? req.user.id : null;
    leave.reviewDate = new Date();
    if (rejectionReason) leave.rejectionReason = rejectionReason;

    await leave.save();

    // Deduct leave balance if approved
    if (status === 'Approved') {
      const employee = await Employee.findById(leave.employee);
      if (employee) {
        const typeKey = leave.leaveType.toLowerCase();
        if (employee.leaveBalances[typeKey] !== undefined) {
          employee.leaveBalances[typeKey] = Math.max(0, employee.leaveBalances[typeKey] - leave.totalDays);
          await employee.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: \`Leave request \${status.toLowerCase()} successfully\`,
      leave
    });
  } catch (error) {
    next(error);
  }
};
`
  },
  {
    path: 'controllers/payrollController.js',
    name: 'controllers/payrollController.js',
    category: 'controllers',
    description: 'Generates payroll slips, calculates deductions/allowances, processes payments, and exports summary',
    content: `const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private (Admin, HR)
exports.getPayrolls = async (req, res, next) => {
  try {
    const { month, year, paymentStatus, employee } = req.query;
    const query = {};

    if (month) query.month = month;
    if (year) query.year = Number(year);
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (employee) query.employee = employee;

    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeCode designation department salary')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate payroll for an employee
// @route   POST /api/payroll/generate
// @access  Private (Admin, HR)
exports.generatePayroll = async (req, res, next) => {
  try {
    const { employeeId, month, year, bonus = 0, deductionsOverride = 0 } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const basic = employee.salary.base || 4000;
    const hra = employee.salary.hra || basic * 0.4;
    const specialAllowance = employee.salary.allowances || basic * 0.2;
    const grossSalary = basic + hra + specialAllowance + Number(bonus);

    const pf = Math.round(basic * 0.12);
    const profTax = 200;
    const tds = Math.round(grossSalary * 0.05);
    const totalDeductions = pf + profTax + tds + Number(deductionsOverride);

    const netSalary = grossSalary - totalDeductions;
    const payslipNumber = \`PAY-\${year}-\${month.toUpperCase()}-\${employee.employeeCode}\`;

    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      year,
      earnings: {
        basic,
        hra,
        conveyance: 1600,
        specialAllowance,
        bonus: Number(bonus)
      },
      deductions: {
        providentFund: pf,
        professionalTax: profTax,
        incomeTaxTds: tds,
        unpaidLeaveDeduction: Number(deductionsOverride)
      },
      grossSalary,
      totalDeductions,
      netSalary,
      paymentStatus: 'Pending',
      payslipNumber
    });

    res.status(201).json({
      success: true,
      message: 'Payroll generated successfully',
      payroll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/payroll/:id/pay
// @access  Private (Admin, HR)
exports.processPayment = async (req, res, next) => {
  try {
    const { paymentMethod = 'Direct Deposit', transactionId = \`TXN-\${Date.now()}\` } = req.body;

    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    payroll.paymentStatus = 'Paid';
    payroll.paymentDate = new Date();
    payroll.paymentMethod = paymentMethod;
    payroll.transactionId = transactionId;

    await payroll.save();

    res.status(200).json({
      success: true,
      message: 'Salary payment processed successfully',
      payroll
    });
  } catch (error) {
    next(error);
  }
};
`
  },
  {
    path: 'controllers/dashboardController.js',
    name: 'controllers/dashboardController.js',
    category: 'controllers',
    description: 'Aggregates high-level HR stats (headcount, today attendance, pending leaves, department distribution, payroll outlay)',
    content: `const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Department = require('../models/Department');
const Payroll = require('../models/Payroll');
const Announcement = require('../models/Announcement');

// @desc    Get HR Dashboard KPI statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parallel metric fetches
    const [
      totalEmployees,
      activeEmployees,
      todayAttendance,
      pendingLeaves,
      departments,
      recentAnnouncements,
      recentPayrolls
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Attendance.find({
        date: { $gte: today, $lte: new Date(new Date().setHours(23, 59, 59, 999)) }
      }).populate('employee', 'firstName lastName employeeCode designation avatar'),
      Leave.find({ status: 'Pending' })
        .populate('employee', 'firstName lastName employeeCode avatar department')
        .limit(5),
      Department.find(),
      Announcement.find().sort({ createdAt: -1 }).limit(5),
      Payroll.find().sort({ createdAt: -1 }).limit(5)
    ]);

    const presentCount = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const onLeaveCount = todayAttendance.filter(a => a.status === 'On-Leave').length;
    const lateCount = todayAttendance.filter(a => a.status === 'Late').length;
    const absentCount = Math.max(0, activeEmployees - (presentCount + onLeaveCount));

    res.status(200).json({
      success: true,
      stats: {
        headcount: {
          total: totalEmployees,
          active: activeEmployees,
          growthRate: '+4.2%'
        },
        attendanceToday: {
          totalLogged: todayAttendance.length,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          onLeave: onLeaveCount,
          attendanceRate: activeEmployees > 0 ? \`\${((presentCount / activeEmployees) * 100).toFixed(1)}%\` : '0%'
        },
        pendingLeaveRequests: pendingLeaves.length,
        departmentCount: departments.length,
        recentAnnouncements,
        pendingLeavesList: pendingLeaves
      }
    });
  } catch (error) {
    next(error);
  }
};
`
  },
  {
    path: 'controllers/departmentController.js',
    name: 'controllers/departmentController.js',
    category: 'controllers',
    description: 'Manages company departments, team managers, designations, and budgets',
    content: `const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('manager', 'firstName lastName email avatar');

    // Aggregate employee count per department
    const departmentsWithCounts = await Promise.all(
      departments.map(async dept => {
        const count = await Employee.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          employeeCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      count: departmentsWithCounts.length,
      departments: departmentsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin, HR)
exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin, HR)
exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has employees
    const empCount = await Employee.countDocuments({ department: req.params.id });
    if (empCount > 0) {
      return res.status(400).json({
        success: false,
        message: \`Cannot delete department with \${empCount} assigned employee(s). Reassign them first.\`
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
`
  },
  {
    path: 'controllers/announcementController.js',
    name: 'controllers/announcementController.js',
    category: 'controllers',
    description: 'Broadcasts HR updates, alerts, policy updates, and company news',
    content: `const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('author', 'name role avatar')
      .populate('targetDepartments', 'name code')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin, HR)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, priority, isPinned, targetDepartments } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Normal',
      isPinned: Boolean(isPinned),
      targetDepartments: targetDepartments || [],
      author: req.user ? req.user.id : null
    });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin, HR)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
`
  },
  {
    path: 'routes/authRoutes.js',
    name: 'routes/authRoutes.js',
    category: 'routes',
    description: 'Authentication route definitions for login, registration, and user profile',
    content: `const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);

module.exports = router;
`
  },
  {
    path: 'routes/dashboardRoutes.js',
    name: 'routes/dashboardRoutes.js',
    category: 'routes',
    description: 'Dashboard overview summary metric routes',
    content: `const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/stats', protect, getDashboardStats);

module.exports = router;
`
  },
  {
    path: 'routes/employeeRoutes.js',
    name: 'routes/employeeRoutes.js',
    category: 'routes',
    description: 'Employee CRUD routing with role protection',
    content: `const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router
  .route('/')
  .get(protect, getEmployees)
  .post(protect, authorize('admin', 'hr'), createEmployee);

router
  .route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, authorize('admin', 'hr'), updateEmployee)
  .delete(protect, authorize('admin'), deleteEmployee);

module.exports = router;
`
  },
  {
    path: 'routes/attendanceRoutes.js',
    name: 'routes/attendanceRoutes.js',
    category: 'routes',
    description: 'Attendance log, clock-in, and clock-out routing',
    content: `const express = require('express');
const router = express.Router();
const {
  getAttendance,
  clockIn,
  clockOut
} = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getAttendance);
router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);

module.exports = router;
`
  },
  {
    path: 'routes/leaveRoutes.js',
    name: 'routes/leaveRoutes.js',
    category: 'routes',
    description: 'Leave request application and approval status routing',
    content: `const express = require('express');
const router = express.Router();
const {
  getLeaves,
  applyLeave,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router
  .route('/')
  .get(protect, getLeaves)
  .post(protect, applyLeave);

router
  .route('/:id/status')
  .put(protect, authorize('admin', 'hr', 'manager'), updateLeaveStatus);

module.exports = router;
`
  },
  {
    path: 'routes/payrollRoutes.js',
    name: 'routes/payrollRoutes.js',
    category: 'routes',
    description: 'Payroll management, salary generation, and payment processing routing',
    content: `const express = require('express');
const router = express.Router();
const {
  getPayrolls,
  generatePayroll,
  processPayment
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('admin', 'hr'), getPayrolls);
router.post('/generate', protect, authorize('admin', 'hr'), generatePayroll);
router.put('/:id/pay', protect, authorize('admin', 'hr'), processPayment);

module.exports = router;
`
  },
  {
    path: 'routes/departmentRoutes.js',
    name: 'routes/departmentRoutes.js',
    category: 'routes',
    description: 'Department management and hierarchy routing',
    content: `const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router
  .route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('admin', 'hr'), createDepartment);

router
  .route('/:id')
  .put(protect, authorize('admin', 'hr'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

module.exports = router;
`
  },
  {
    path: 'routes/announcementRoutes.js',
    name: 'routes/announcementRoutes.js',
    category: 'routes',
    description: 'Company announcements and notices routing',
    content: `const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router
  .route('/')
  .get(protect, getAnnouncements)
  .post(protect, authorize('admin', 'hr'), createAnnouncement);

router
  .route('/:id')
  .delete(protect, authorize('admin', 'hr'), deleteAnnouncement);

module.exports = router;
`
  },
  {
    path: 'routes/performanceRoutes.js',
    name: 'routes/performanceRoutes.js',
    category: 'routes',
    description: 'Performance review and appraisal rating routing',
    content: `const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Get performance reviews
router.get('/', protect, async (req, res, next) => {
  try {
    const { employee } = req.query;
    const query = employee ? { employee } : {};

    const reviews = await Performance.find(query)
      .populate('employee', 'firstName lastName employeeCode designation avatar')
      .populate('reviewer', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
});

// Create review
router.post('/', protect, authorize('admin', 'hr', 'manager'), async (req, res, next) => {
  try {
    const review = await Performance.create({
      ...req.body,
      reviewer: req.user.id
    });
    res.status(201).json({ success: true, message: 'Review recorded', review });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
`
  },
  {
    path: 'seeder.js',
    name: 'seeder.js',
    category: 'seeder',
    description: 'Seed database script with realistic Dayflow HRMS initial departments, employees, users, attendance, and leaves',
    content: `const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Department = require('./models/Department');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
const Announcement = require('./models/Announcement');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  try {
    console.log('🧹 Clearing existing database collections...');
    await User.deleteMany();
    await Department.deleteMany();
    await Employee.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Payroll.deleteMany();
    await Announcement.deleteMany();

    console.log('🏢 Creating default departments...');
    const engDept = await Department.create({
      name: 'Engineering & Tech',
      code: 'ENG',
      description: 'Software development, QA, and cloud infrastructure',
      budget: 500000,
      designations: [
        { title: 'Senior Full Stack Engineer', level: 'Senior' },
        { title: 'Frontend Specialist', level: 'Mid' },
        { title: 'DevOps & SRE Engineer', level: 'Lead' }
      ]
    });

    const hrDept = await Department.create({
      name: 'Human Resources',
      code: 'HR',
      description: 'People operations, talent acquisition, and employee happiness',
      budget: 150000,
      designations: [
        { title: 'HR Director', level: 'Director' },
        { title: 'People Operations Manager', level: 'Lead' },
        { title: 'HR Generalist', level: 'Mid' }
      ]
    });

    const mktDept = await Department.create({
      name: 'Marketing & Growth',
      code: 'MKT',
      description: 'Brand strategy, content, and demand generation',
      budget: 220000,
      designations: [
        { title: 'Marketing Lead', level: 'Lead' },
        { title: 'Content Strategist', level: 'Mid' }
      ]
    });

    console.log('👥 Creating core employees...');
    const emp1 = await Employee.create({
      employeeCode: 'EMP-1001',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@dayflow.corp',
      phone: '+1 (555) 234-5678',
      department: hrDept._id,
      designation: 'HR Director',
      role: 'admin',
      gender: 'Female',
      joiningDate: new Date('2022-03-15'),
      salary: { base: 8500, hra: 3400, allowances: 1500 },
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    });

    const emp2 = await Employee.create({
      employeeCode: 'EMP-1002',
      firstName: 'David',
      lastName: 'Chen',
      email: 'david.chen@dayflow.corp',
      phone: '+1 (555) 345-6789',
      department: engDept._id,
      designation: 'Senior Full Stack Engineer',
      role: 'manager',
      gender: 'Male',
      joiningDate: new Date('2023-01-10'),
      salary: { base: 9200, hra: 3680, allowances: 2000 },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });

    const emp3 = await Employee.create({
      employeeCode: 'EMP-1003',
      firstName: 'Amara',
      lastName: 'Okafor',
      email: 'amara.okafor@dayflow.corp',
      phone: '+1 (555) 456-7890',
      department: engDept._id,
      designation: 'Frontend Specialist',
      role: 'employee',
      gender: 'Female',
      joiningDate: new Date('2023-08-01'),
      salary: { base: 6800, hra: 2720, allowances: 1200 },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    console.log('🔐 Creating user logins...');
    // Password for all default accounts is: password123
    await User.create([
      {
        name: 'Sarah Jenkins',
        email: 'admin@dayflow.corp',
        password: 'password123',
        role: 'admin',
        employeeId: emp1._id,
        avatar: emp1.avatar
      },
      {
        name: 'HR Manager',
        email: 'hr@dayflow.corp',
        password: 'password123',
        role: 'hr',
        employeeId: emp1._id,
        avatar: emp1.avatar
      },
      {
        name: 'David Chen',
        email: 'manager@dayflow.corp',
        password: 'password123',
        role: 'manager',
        employeeId: emp2._id,
        avatar: emp2.avatar
      },
      {
        name: 'Amara Okafor',
        email: 'employee@dayflow.corp',
        password: 'password123',
        role: 'employee',
        employeeId: emp3._id,
        avatar: emp3.avatar
      }
    ]);

    console.log('📢 Creating company announcements...');
    await Announcement.create([
      {
        title: '🌟 Annual Performance Review Cycle 2026',
        content: 'The Q1 performance review portal is now open. All managers and employees please submit your self-evaluations before the end of this month.',
        category: 'Policy',
        priority: 'High',
        isPinned: true,
        author: emp1._id
      },
      {
        title: '🌴 Upcoming Public Holiday Notice: Labor Day',
        content: 'The company offices will remain closed next Monday in observance of the statutory holiday. Emergency on-call schedules have been updated.',
        category: 'Holiday',
        priority: 'Normal',
        isPinned: false,
        author: emp1._id
      }
    ]);

    console.log('✅ Dayflow HRMS database seeded successfully!');
    console.log('--------------------------------------------------');
    console.log('Default Credentials:');
    console.log('Admin:    admin@dayflow.corp    / password123');
    console.log('HR:       hr@dayflow.corp       / password123');
    console.log('Manager:  manager@dayflow.corp  / password123');
    console.log('Employee: employee@dayflow.corp / password123');
    console.log('--------------------------------------------------');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Department.deleteMany();
    await Employee.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Payroll.deleteMany();
    await Announcement.deleteMany();

    console.log('💥 Database wiped clean!');
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
`
  },
  {
    path: 'Dockerfile',
    name: 'Dockerfile',
    category: 'docker',
    description: 'Production container configuration for deploying to Render, Railway, AWS ECS, or Fly.io',
    content: `FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose backend port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Run server
CMD ["node", "server.js"]
`
  },
  {
    path: 'docker-compose.yml',
    name: 'docker-compose.yml',
    category: 'docker',
    description: 'Docker Compose orchestration file with Express backend and local MongoDB container',
    content: `version: '3.8'

services:
  api:
    build: .
    container_name: dayflow-hrms-api
    restart: always
    ports:
      - '5000:5000'
    environment:
      - PORT=5000
      - NODE_ENV=development
      - MONGO_URI=mongodb://mongo:27017/dayflow_hrms
      - JWT_SECRET=dayflow_super_secret_jwt_key_2026_production_safe
      - JWT_EXPIRE=30d
      - CLIENT_URL=https://dayflow-hrms-p6k4r9.pages.bu.app
    depends_on:
      - mongo
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules

  mongo:
    image: mongo:6.0
    container_name: dayflow-hrms-mongo
    restart: always
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'docs',
    description: 'Comprehensive documentation, GitHub setup instructions, API reference, and frontend integration guide',
    content: `# 🏢 Dayflow HRMS — Backend API (Node.js + Express + MongoDB)

This is the complete, production-ready backend API service for the **Dayflow HRMS** platform (matching the frontend at \`https://dayflow-hrms-p6k4r9.pages.bu.app/#/hr/dashboard\`).

Built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **JSON Web Tokens (JWT)** for role-based access control.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or free [MongoDB Atlas Cluster](https://www.mongodb.com/cloud/atlas))
- Git

### 2. Clone / Setup Repository
\`\`\`bash
# Create project folder
mkdir dayflow-hrms-backend
cd dayflow-hrms-backend

# Copy or extract all files from this project
npm install
\`\`\`

### 3. Configure Environment Variables
Create a \`.env\` file in the root folder (or copy from \`.env.example\`):
\`\`\`env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/dayflow_hrms
JWT_SECRET=dayflow_super_secret_jwt_key_2026_production_safe
JWT_EXPIRE=30d
CLIENT_URL=https://dayflow-hrms-p6k4r9.pages.bu.app
\`\`\`

### 4. Seed the Database with Demo HR Data
\`\`\`bash
npm run seed
\`\`\`
*This populates realistic departments, employees, admins, users, and leave balances.*

### 5. Start the Server
\`\`\`bash
# Development mode with hot-reload:
npm run dev

# Production mode:
npm start
\`\`\`

Server will start on: **\`http://localhost:5000\`**

---

## 🔑 Default Credentials (After Seeding)

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | \`admin@dayflow.corp\` | \`password123\` | Full system control |
| **HR Manager** | \`hr@dayflow.corp\` | \`password123\` | Employees, Leaves, Payroll, Notices |
| **Manager** | \`manager@dayflow.corp\` | \`password123\` | Department team, Leave approvals, Reviews |
| **Employee** | \`employee@dayflow.corp\` | \`password123\` | Profile, Clock-in/out, Apply leaves |

---

## 📡 API Endpoints Reference

### 🔐 Authentication (\`/api/auth\`)
- \`POST /api/auth/login\` - User authentication & JWT issuance
- \`POST /api/auth/register\` - Register new account
- \`GET  /api/auth/me\` - Get current logged-in user profile (Requires Bearer token)

### 📊 HR Dashboard (\`/api/dashboard\`)
- \`GET  /api/dashboard/stats\` - Overview counters (Headcount, Present today, Absent, Pending leaves, announcements)

### 👥 Employees (\`/api/employees\`)
- \`GET  /api/employees\` - List employees with filters (\`department\`, \`status\`, \`role\`, \`search\`, \`page\`)
- \`GET  /api/employees/:id\` - Single employee full dossier
- \`POST /api/employees\` - Add new employee (HR/Admin)
- \`PUT  /api/employees/:id\` - Update employee details
- \`DELETE /api/employees/:id\` - Remove employee profile

### ⏱️ Attendance (\`/api/attendance\`)
- \`GET  /api/attendance\` - Get attendance records
- \`POST /api/attendance/clock-in\` - Clock in employee for today
- \`POST /api/attendance/clock-out\` - Clock out employee & calculate total work hours

### 🏖️ Leaves (\`/api/leaves\`)
- \`GET  /api/leaves\` - List leave applications
- \`POST /api/leaves\` - Apply for leave (validates balance)
- \`PUT  /api/leaves/:id/status\` - Approve or reject leave request

### 💰 Payroll (\`/api/payroll\`)
- \`GET  /api/payroll\` - Fetch monthly payrolls
- \`POST /api/payroll/generate\` - Generate payslip with tax & PF deductions
- \`PUT  /api/payroll/:id/pay\` - Mark salary as Paid with transaction ID

### 🏢 Departments & Announcements
- \`GET / POST / PUT / DELETE /api/departments\` - Department hierarchy
- \`GET / POST / DELETE /api/announcements\` - Company notices & broadcasts

---

## 💻 How to Push to Your GitHub Repository

\`\`\`bash
# 1. Initialize Git in the project directory
git init

# 2. Add all backend files
git add .

# 3. Create your initial commit
git commit -m "feat: complete production Dayflow HRMS Node.js Express MongoDB backend"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/dayflow-hrms-backend.git

# 6. Push code to GitHub
git push -u origin main
\`\`\`

---

## 🔗 Connecting with the Frontend (\`dayflow-hrms-p6k4r9.pages.bu.app\`)

In your frontend application's API service or Axios client:
\`\`\`javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;
\`\`\`
`
  },
  {
    path: 'Dayflow_HRMS.postman_collection.json',
    name: 'Dayflow_HRMS.postman_collection.json',
    category: 'docs',
    description: 'Importable Postman Collection with pre-configured requests, headers, and test variables',
    content: JSON.stringify({
      info: {
        name: "Dayflow HRMS API Collection",
        description: "Complete Postman requests for Dayflow HRMS Backend",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        {
          name: "Auth - Login",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ email: "admin@dayflow.corp", password: "password123" }, null, 2)
            },
            url: { raw: "{{base_url}}/api/auth/login", host: ["{{base_url}}"], path: ["api", "auth", "login"] }
          }
        },
        {
          name: "Dashboard - Get Stats",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: { raw: "{{base_url}}/api/dashboard/stats", host: ["{{base_url}}"], path: ["api", "dashboard", "stats"] }
          }
        },
        {
          name: "Employees - List All",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: { raw: "{{base_url}}/api/employees", host: ["{{base_url}}"], path: ["api", "employees"] }
          }
        },
        {
          name: "Attendance - Clock In",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{token}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ employeeId: "EMP_ID_HERE", workMode: "Office" }, null, 2)
            },
            url: { raw: "{{base_url}}/api/attendance/clock-in", host: ["{{base_url}}"], path: ["api", "attendance", "clock-in"] }
          }
        },
        {
          name: "Leaves - Apply Leave",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{token}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                employeeId: "EMP_ID_HERE",
                leaveType: "Casual",
                startDate: "2026-09-01",
                endDate: "2026-09-03",
                totalDays: 3,
                reason: "Family travel"
              }, null, 2)
            },
            url: { raw: "{{base_url}}/api/leaves", host: ["{{base_url}}"], path: ["api", "leaves"] }
          }
        }
      ]
    }, null, 2)
  }
];
