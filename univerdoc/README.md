# UniverDoc — Full-Stack University Document Verification and Clearance Platform

**Case Study**: Petroleum Training Institute (PTI), Effurun, Delta State, Nigeria  
**Regulatory Body**: National Board for Technical Education (NBTE)  
**Formal Title**: *"Automation of Admission Clearance Process Using Web Based Application with Petroleum Training Institute as Case Study"*

---

## 🚀 Overview

**UniverDoc** digitises and automates the admission clearance workflow at Petroleum Training Institute (PTI), Effurun. Students submit required verification certificates across 4 institutional departments (Finance, Library, Administration, Academic Records) for review and approval prior to formal enrollment.

### Key Architecture & Capabilities
- **Role-Based Access Control (RBAC)**: Dedicated interfaces and security boundaries for **Super Administrator**, **Department Staff**, and **Students**.
- **Concurrent Session Enforcement**: Exact 2 staff credential slots per department, with database-persisted session tracking (`is_logged_in`). Simultaneous logins on the same staff account are strictly blocked (`403 This account is already in use`).
- **Institutional Matric Validation**: Strict format validation matching PTI standards `M.YY/PROGRAM/DEPT/NUMBER` (regex: `/^M\.\d{2}\/[A-Z]{2,}\/[A-Z]{2,}\/\d{4,6}$/`).
- **Side-by-Side Review Queue**: Dedicated clearance review workflow with embedded document previews, student metadata, instant approval, and mandatory rejection notes.
- **Automated Notifications & Audit Trail**: Nodemailer email templates with dev/demo logger fallbacks, in-app notification inbox, Monday 8:00 AM weekly pending queue digest (`node-cron`), and immutable audit logging.

---

## 🔑 Demo Access Credentials

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `superadmin` | `Admin@123` | Platform oversight, credential reset, audit logs |
| **Finance Desk (Slot 1)** | `finance_01` | `Staff@123` | Reviews Fee Receipt, Scholarship Cert, Bank Statement |
| **Library Desk (Slot 1)** | `library_01` | `Staff@123` | Reviews Library Card Copy, Clearance Form |
| **Administration (Slot 1)** | `admin_01` | `Staff@123` | Reviews Admission Letter, Enrollment Form |
| **Academic Records (Slot 1)**| `academic_01` | `Staff@123` | Reviews Official Transcript, Government ID, Result Slip |
| **Demo Student** | `alex.mercer` | `Alex@123` | Matric: `M.24/ND/PEG/11245` |

*(Note: Slot 2 for each department can be activated and reset anytime by the Super Administrator).*

---

## 🛠️ Quick Start & Development

### 1. Backend Setup
```bash
cd backend
npm install
npm run setup   # Generates Prisma client, pushes schema to SQLite, seeds initial data
npm run dev     # Starts Express API server on port 3001
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Starts Vite development server on port 5173
```

Visit **`http://localhost:5173`** to access the application.

---

## 📂 Project Structure

```
univerdoc/
├── backend/
│   ├── server.js               # Express application entrypoint
│   ├── prisma/
│   │   ├── schema.prisma       # SQLite/PostgreSQL Prisma schema
│   │   └── seed.js             # PTI departments, staff slots, demo student
│   ├── middleware/
│   │   ├── auth.js             # JWT verify & RBAC middleware
│   │   ├── rateLimit.js        # Auth endpoint rate limiter
│   │   └── upload.js           # Multer file upload & MIME validation
│   ├── routes/
│   │   ├── auth.js             # /api/auth
│   │   ├── admin.js            # /api/admin
│   │   ├── dept.js             # /api/dept
│   │   ├── student.js          # /api/student
│   │   └── files.js            # /api/files
│   ├── controllers/            # Business logic handlers
│   ├── services/
│   │   ├── emailService.js     # Nodemailer PTI email templates
│   │   ├── fileService.js      # Storage & file delivery
│   │   └── auditService.js     # Audit log writer
│   ├── jobs/
│   │   └── weeklySummary.js    # node-cron scheduled summary (Monday 8AM)
│   ├── utils/
│   │   ├── generatePassword.js # 12-char secure mixed password generator
│   │   └── matricValidator.js  # PTI matriculation regex validator
│   └── test-e2e.js             # Automated 21-step E2E test suite
└── frontend/
    ├── index.html              # Typography (Plus Jakarta Sans, Syne, IBM Plex Mono)
    ├── vite.config.js          # Vite config with /api proxy
    └── src/
        ├── context/AuthContext # JWT session management
        ├── api/                # Axios API clients
        ├── pages/              # Landing, SuperAdmin, DeptDashboard, StudentDashboard
        ├── components/
        │   ├── shared/         # Toast, StatusBadge, ProgressBar, Modal, Spinner
        │   ├── landing/        # RoleSelector, LoginForm, RegisterForm
        │   ├── admin/          # AdminOverview, DeptCredentials, StudentRegistry, IssuesList, AuditLogViewer
        │   ├── dept/           # DeptSidebar, DocumentQueue, DocViewer, RejectModal, ReviewHistory, FlagIssue
        │   └── student/        # StudentSidebar, ProgressOverview, DocumentChecklist, NotificationInbox, ReportIssue
        └── utils/              # Client-side matric validation & formatters
```

---

## 🧪 Running Automated Tests

To execute the full end-to-end verification suite:
```bash
cd backend
node test-e2e.js
```