# PROJECTNEXUS — MASTER PROJECT MEMORY & REPOSITORY BLUEPRINT
*Canonical Project Memory, MERN Architecture, MongoDB Schema, UI Components, and Execution Log*

---

## 1. PROJECT EXECUTIVE SUMMARY & MISSION

- **Project Name**: ProjectNexus
- **Architecture Type**: MERN Stack (MongoDB Atlas, Express.js, React 19, Node.js)
- **Category**: Academic Project Lifecycle Governance, Jira-Style Progress Tracking & Versioned Project Continuity OS
- **Target Audience**: College Administrators, Department Heads (HODs), Faculty Project Guides, and Student Project Teams.
- **The Core Problem Solved**:
  Colleges run hundreds of student projects annually. Progress updates, code, and documentation are scattered across chats and local drives. When a student team abandons or discontinues a project at partial completion (e.g. 45%), the next team typically restarts from zero.
- **The Solution**:
  ProjectNexus centralizes project workflows with Jira-inspired task/milestone management and solves the continuity problem via a **Versioned Project Continuity Engine**. Handover packets preserve completed modules, pending deliverables, known technical debt/bugs, GitHub repository state, and faculty directives, enabling newly assigned teams to inherit projects seamlessly.

### The Flagship Demo Scenario
```
Admin creates Team Lead Invite ──> Team Lead A registers & creates "Smart Attendance System"
       │
       ▼
Team A adds 4 members, links GitHub repo, builds milestones, and reaches 45% completion
       │
       ▼
Team A discontinues ──> Admin marks Discontinued & generates Handover Packet
       │               (Completed modules, pending tasks, known bugs, GitHub state, faculty notes)
       ▼
Admin assigns Team Lead B ──> Team B enters "Continuation Workspace" (v2.0)
       │
       ▼
Team B inherits full history & resumes development immediately from 45% without starting from zero
```

---

## 2. DESIGN SYSTEM & VISUAL STYLE GUIDE (ENTERPRISE SAAS)

Adheres strictly to modern enterprise SaaS polish (Linear, Jira, Notion grade UI, card-based layout, subtle shadows, rounded corners):

### Color System Tokens
| Color Name | Hex Code | Semantic Role in Application |
|---|---|---|
| **Primary Blue** | `#2563EB` | Primary CTA buttons, brand badges, active tab rings, selected category border |
| **Sidebar Dark** | `#0F172A` | Left admin navigation sidebar, high-contrast dark shell |
| **Background** | `#F8FAFC` | Light workspace area, gentle neutral backdrop |
| **Surface White** | `#FFFFFF` | Content cards, data tables, modal dialogs, search inputs |
| **Success Green** | `#22C55E` | Healthy project badges, milestone passes, copied state, low priority |
| **Warning Orange** | `#F59E0B` | Moderate health indicator, pending approvals, medium priority |
| **Danger Red** | `#EF4444` | At Risk alert indicators, critical health badges, high priority |

---

## 3. USER ROLES & ACCESS CONTROL ARCHITECTURE

### The 3 Core Roles & Dashboards

| User Role | Assigned Dashboard | Core Permissions & Scope |
|---|---|---|
| **Admin** | **Admin Dashboard** | Provisions projects, generates Project IDs (`CSE-2026-041`) and Team Access Codes (`NEXUS-7F2K`), monitors institutional KPIs, tracks critical health alerts, regenerates/revokes codes, assigns continuation teams. |
| **Team Lead** | **Team Dashboard & Workspace** | Claims project using Team Access Code, registers team profile, invites team members, creates milestones & Jira-style tasks, submits weekly updates, links GitHub repo. |
| **Team Member** | **Team Dashboard & Workspace** | Views assigned project, updates own assigned task status (`To Do` $\rightarrow$ `Done`), logs progress comments. Cannot alter team ownership or project settings. |

### Strict Access & Registration Rules
1. **No Self-Assigned Admins**: Registration routes forbid selecting the "Admin" role. Admin accounts are seeded or provisioned directly.
2. **Unified Login Screen**: A single login screen (email/username + password) — no role dropdown shown to the user. After authentication, the system checks the account's role and routes automatically:
   - Admin credentials $\rightarrow$ Admin Dashboard
   - Team member credentials $\rightarrow$ Project Workspace directly
3. **Team Structure Specification**:
   - Team data structure strictly maintains **Name** and **Email** only (no student roll numbers):
   ```javascript
   team: {
     name: String,
     leader: { name: String, email: String },
     members: [{ name: String, email: String }]
   }
   ```
4. **Backend-Enforced Authorization**: Express middleware verifies JWT tokens and checks user roles on every protected endpoint.

---

## 4. MONGODB DATA SCHEMAS & COLLECTIONS

```javascript
// 1. users
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String, // bcrypt hashed (12 salt rounds)
  role: { type: String, enum: ['admin', 'team_lead', 'team_member'] },
  department: String,
  isActive: { type: Boolean, default: true },
  createdAt: Date
}

// 2. projects (College Project Lifecycle Master Record)
{
  _id: ObjectId,
  projectId: { type: String, unique: true, uppercase: true, index: true }, // e.g. "CSE-2026-041"
  title: { type: String, required: true },
  category: { type: String, enum: ['Software', 'IoT', 'Hardware'], required: true, index: true },
  department: { type: String, required: true, index: true },
  academicYear: { type: String, default: '2025-2026' },
  facultyGuide: { type: String, required: true },
  deadline: { type: Date, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  description: String,
  
  // Conditional Engineering Category Metadata
  techStack: [String],                  // For Software projects (e.g. React 19, FastAPI, PyTorch)
  componentsRequired: [String],         // For IoT & Hardware projects (e.g. STM32, LoRa, Steppers)
  labAssigned: String,                  // For IoT & Hardware projects (e.g. Embedded Lab Room 304)

  // Team Access Code & Claim Lifecycle
  teamAccessCode: { type: String, unique: true, uppercase: true, index: true }, // e.g. "NEXUS-7F2K"
  isAccessCodeClaimed: { type: Boolean, default: false, index: true },
  accessCodeStatus: { type: String, enum: ['active', 'claimed', 'revoked'], default: 'active' },

  // Team Roster (Name and Email only - NO roll number)
  team: {
    name: { type: String, default: '' },
    leader: {
      name: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    members: [{
      name: { type: String, default: '' },
      email: { type: String, default: '' }
    }]
  },

  // Health, Progress & Lifecycle Status
  status: { 
    type: String, 
    enum: ['Draft', 'Pending Approval', 'Active', 'Completed', 'Discontinued', 'At Risk'],
    default: 'Active',
    index: true 
  },
  health: { 
    type: String, 
    enum: ['Good', 'Moderate', 'At Risk', 'Critical'], 
    default: 'Good', 
    index: true 
  },
  healthScore: { type: Number, min: 0, max: 100, default: 85 },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  currentMilestone: { type: String, default: 'Project Initiation & Setup' },
  lastActivityDate: { type: Date, default: Date.now },

  // Audit Timeline
  timeline: [{
    title: String,
    description: String,
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['creation', 'team_join', 'milestone', 'alert', 'status_change', 'handover'], default: 'creation' }
  }],

  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date,
  updatedAt: Date
}

// 3. invitations (Team Lead Invitation Tokens)
{
  _id: ObjectId,
  email: String,
  role: { type: String, enum: ['team_lead', 'team_member'] },
  teamId: { type: ObjectId, ref: 'Team', default: null },
  token: { type: String, unique: true, index: true },
  expiresAt: Date,
  status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date
}

// 4. tasks (Jira-Style Kanban Work Items)
{
  _id: ObjectId,
  projectId: { type: ObjectId, ref: 'Project', index: true },
  title: String,
  description: String,
  assigneeEmail: String,
  status: { type: String, enum: ['todo', 'in_progress', 'under_review', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: Date,
  createdAt: Date
}

// 5. handovers (Immutable Continuity Handover Packets)
{
  _id: ObjectId,
  projectId: { type: ObjectId, ref: 'Project', index: true },
  fromTeamName: String,
  toTeamName: String,
  completedModules: [String],
  pendingModules: [String],
  knownIssues: [String],
  facultyNotes: String,
  githubUrl: String,
  createdAt: { type: Date, default: Date.now }
}
```

---

## 5. BACKEND REST API SPECIFICATION

Base URL: `http://localhost:5000/api`

### Authentication Endpoints (`/api/auth`)
- `POST /auth/login`: Authenticates with `{ email, password }`. Returns JWT token, user object, and user role.
- `GET /auth/me`: Verifies `Bearer <token>` and returns active authenticated user for session restoration.

### Projects & Governance Endpoints (`/api/projects`)
- `GET /projects/kpis`: Returns institutional KPI counts:
  - `totalProjects`, `activeProjects`, `softwareProjects`, `iotProjects`, `hardwareProjects`, `atRiskProjects`
  - `criticalProjects`: Top 5 projects needing attention sorted by lowest health score
  - `recentActivities`: Aggregated timeline events across institution
- `GET /projects`: Filterable, searchable project registry with pagination:
  - Query parameters: `category` (`Software`, `IoT`, `Hardware`), `status`, `department`, `health`, `search`, `page`, `limit`
- `GET /projects/:id`: Returns full project tracking record by MongoDB `_id` or `projectId` (e.g. `CSE-2026-041`).
- `POST /projects`: Multi-step admin creation endpoint:
  - Validates required parameters (`category`, `title`, `department`, `facultyGuide`, `deadline`).
  - Auto-generates unique Project ID (format: `[DEPT]-[YEAR]-[3-DIGIT-NUM]`, e.g. `CSE-2026-041`).
  - Auto-generates unique Team Access Code (format: `NEXUS-XXXX`, e.g. `NEXUS-7F2K`).
  - Initializes status `Active`, health `Good`, healthScore `100%`, progress `0%`, and logs creation event.
- `POST /projects/:id/regenerate-code`: Generates a new unique `teamAccessCode`, resets claim state, logs alert.
- `POST /projects/:id/revoke-code`: Sets `accessCodeStatus: 'revoked'`, logs alert.

---

## 6. ADMIN DASHBOARD & LOGIN FLOW UI ARCHITECTURE

### 1. Unified Login Screen (`AdminLoginPage.jsx` & `AdminLoginPage.css`)
- **Centered Floating Composition**: Vertically and horizontally centered with generous padding (`64px 24px`) on a soft `#F8FAFC` background.
- **Calm Visual Hierarchy & Spacing**:
  - Distinct 24–36px spacing between the centered logo mark (52×52px with gradient), large 32px wordmark ("ProjectNexus"), muted 13.5px tagline, and the card.
  - Generous internal card padding (**44px on all sides**), rounded corners (`24px`), and a soft layered shadow (`0 20px 40px -15px rgba(15, 23, 42, 0.07)`).
- **Form Rhythm & Sizing**:
  - Dedicated label row with inline "Forgot password?" link aligned to the Password label.
  - Tall **50px** email and password inputs with comfortable internal padding (`padding: 0 16px 0 46px`).
  - Vertically centered show/hide eye toggle button.
  - Primary **"Sign In"** button: full-width, solid `#2563EB`, tall (**52px**), with arrow icon and generous spacing above it.
  - Subtle, dashed-border demo helper box (`1px dashed #CBD5E1`) located distinctly below the main form flow.
- **Quiet Trust Footer**: "Role-Gated Automatic Workspace Routing • JWT Secured" sits quietly 32px below the card as an understated footer line.
- **Automatic Role-Based Routing**:
  - `admin` credentials $\rightarrow$ transitions to Admin Dashboard
  - `team_member`/`team_lead` credentials $\rightarrow$ transitions to Project Workspace directly

### 2. Admin Dashboard Layout (`AdminDashboard.jsx`)
- **Dark Sidebar (`#0F172A`)** on the left:
  - ProjectNexus OS logo & clearance level badge
  - Navigation sections: Dashboard, Projects, Teams, Departments, Analytics, Activity Logs, Settings
  - Active section highlighted with `#2563EB` pill & shadow
- **Light Workspace Area (`#F8FAFC`)** on the right:
  - Top bar: Search bar, notification bell with unread badge & dropdown, admin profile menu, and prominent `+ Create New Project` button.

### 3. Home View (`Dashboard`)
- **Row of 6 KPI Cards**:
  1. Total Projects (cataloged count)
  2. Active Projects (in-flight count)
  3. Software-Based Projects (💻 code badge)
  4. IoT-Based Projects (📡 radio badge)
  5. Hardware-Based Projects (⚙️ cog badge)
  6. Projects At Risk (🔴 alert pulse)
- **Critical Projects Table**:
  - Name, category badge, status, health indicator with pulsating indicator, last activity, and Inspect button.
- **Recent Activity Feed Panel**:
  - Event icons for creations, team joins, milestone passes, and health alerts.

### 4. Create Project Flow (`CreateProjectModal.jsx`)
- **Step 1 — Project Category**: 3 large selectable cards side-by-side (💻 Software, 📡 IoT, ⚙️ Hardware) with blue highlight border and background on selection.
- **Step 2 — Project Details**: Title, Department dropdown, Academic Year, Faculty Guide dropdown, Deadline date, Priority Level colored chips (Low, Medium, High), Description, plus category-specific dynamic fields:
  - Software: Tech Stack input
  - IoT / Hardware: Components Required input & Lab Assigned input
- **Step 3 — Confirmation & Access Code**:
  - Auto-generated Project ID (e.g. `CSE-2026-041`)
  - Auto-generated Team Access Code (e.g. `NEXUS-7F2K`) in large monospace badge
  - Copy Code button with instant feedback
  - Guidance note: *"Share this access code with the team leader. They'll use it to register their team and link to this project."*

### 5. Project List View
- Full directory table showing Project ID, Title, Category badge, Department, Status, Health indicator, Team Assigned status ("Unassigned" badge if code unclaimed), Deadline, Actions.
- Filters at the top for Category, Status, Department, Health, with live search and pagination.

### 6. Project Detail View (Admin's Tracking View)
- Header with Project ID, Title, Category badge, Health score gauge, and Status.
- Assigned Team Roster card: team name, leader, and members (name and email only).
- Progress overview (% completion, current milestone, last activity).
- Engineering specs: Tech Stack tags or Components & Allocated Lab.
- Chronological timeline feed of major events.
- Access Code panel: claimed status, copy code, regenerate/revoke code options.

---

## 7. EXECUTION CHRONOLOGY & VERIFICATION LOG

- **Step 1**: Analyzed canonical `ProjectNexus_Master_Plan_Final_1.md` and integrated MERN MVP Requirements.
- **Step 2**: Created initial project memory blueprint.
- **Step 3**: Scaffolded React + Vite client in `frontend/` and installed dependencies (`npm install`).
- **Step 4**: Configured MongoDB Atlas connection with Google Public DNS resolver (`8.8.8.8`) to bypass restricted institutional networks.
- **Step 5**: Seeded default administrative credentials into MongoDB Atlas: `admin@projectnexus.edu` / `Admin@123`.
- **Step 6**: Built Mongoose `Project` model with Category, Access Code, Team (name & email only), Health, and Timeline schemas.
- **Step 7**: Implemented Express `projectController.js` and `projectRoutes.js` mounted at `/api/projects`.
- **Step 8**: Created `seedProjects.js` with 7+ rich multi-category college projects (Software, IoT, Hardware) and access codes.
- **Step 9**: Created `CreateProjectModal.jsx` implementing the 3-step project creation and access code generation flow.
- **Step 10**: Created `AdminDashboard.jsx` implementing the enterprise SaaS layout (`#0F172A`, `#F8FAFC`, `#2563EB`), 6 KPIs, Critical Projects table, Activity feed, Project list with filters, and Project detail tracking view.
- **Step 11**: Refined `AdminLoginPage.jsx` with centered card layout, ProjectNexus branding, and automated role-based routing.
- **Step 12**: Integrated full routing into `App.jsx` and verified production build with `npm run build` (completed cleanly with 0 errors).
- **Step 13**: Fully redesigned Admin Dashboard (`AdminDashboard.jsx`, `DashboardHomeView.jsx`, `AdminDashboard.css`):
  - **Spacing & Alignment**: Added consistent 32px padding around workspace content, 24px consistent gaps between sections, and 24px internal card/panel padding.
  - **Top Bar**: Styled 44px search bar with internal left padding, centered action icons (notification bell, profile pill, and + Create New Project button with 16px horizontal / 10px vertical padding).
  - **Uniform 5 KPI Cards**: Equal width, equal height, 24px padding, 12px rounded corners, subtle elevation, soft colored circular badges, uppercase muted labels, and clean color logic (neutral blue/green for Total/Active, blue for Software, amber for Hardware/IoT, and red ONLY for At Risk card without red-tinted alarm banner).
  - **Critical Projects Table**: White card container with section header and right-aligned link, uppercase muted header row, 15px row vertical padding, soft pill badges for Category/Status, single health pill (`dot + label + %`), and styled Inspect button with hover affordance.
  - **Recent Activity Feed**: Structured white card container with circular icon badges (success/warning/info), proper line-height, and subtle dividers.
  - **Sidebar**: Spacing between section groups, rounded active state (`#2563EB`), and generous padding on logo header and bottom Admin Mode pill.
  - Verified with production build `npm run build` (0 errors) and live browser subagent visual validation.
- **Step 14**: Redesigned "Create New Project — Project Details" modal (Step 2 of 3) (`CreateProjectModal.jsx`, `CreateProjectModal.css`):
  - **Modal Container & Header**: Added generous 32px padding on all sides, 24px header bottom separation with clear 6-8px vertical gap between title and subtitle, and aligned close button.
  - **Form Fields & Vertical Rhythm**: Standardized 44px height, 8px border-radius, 14px horizontal padding, consistent 8px label margins, 20px row gaps, and equal-width two-column alignment with visible chevron dropdown indicators.
  - **Priority Level Segmented Control**: Replaced plain-text selector with a 3-button segmented pill control (High with solid red `#EF4444` fill and white text; Medium/Low with soft gray `#F8FAFC`, muted text, and subtle border).
  - **Tech Stack & Description**: 44px Tech Stack input with muted helper hint; 110px min-height Description textarea with visible resize handle.
  - **Footer**: Subtle top border with 24px separation, left-aligned `← Back to Category`, secondary ghost `Cancel`, and prominent primary `Generate Project & Access Code` (`#2563EB`, 12px vertical / 24px horizontal padding) with 16px gap.
  - Verified via `npm run build` (0 errors) and live browser subagent visual validation.

---

## 8. SESSION LOG — 2026-09-17

- **Gmail SMTP Configuration**: Configured Gmail SMTP with an App Password and verified live mail delivery readiness.
- **Email Service Architecture Audit**: Verified `backend/services/emailService.js` and wired `POST /api/projects/:id/send-invite` to send project invitation emails.
- **Send Invitation Error Handling**: Replaced silent error handling in `SendInviteModal.jsx` with real user-facing error feedback.
- **Admin Authentication**: Configured MongoDB Atlas backed admin authentication with bcrypt password hashing and idempotent admin seeding script.

---

## 9. SESSION LOG — 2026-09-18

- **Backend Environment & Server Setup**:
  - Restored backend environment configuration (`.env`) for MongoDB Atlas, JWT authentication, and SMTP mailing services.
  - Installed and verified all core backend dependencies, adding `axios` (for GitHub REST API interactions) and `express-rate-limit` (for endpoint security).
  - Launched and verified the backend Express + Nodemon API server on port 5000 with healthy status check.

### Current Running Services
| Service | Target / Port | Status |
|---|---|---|
| Backend (Express + Nodemon) | `http://localhost:5000` | ✅ Running |
| MongoDB Atlas | Cloud Database | ✅ Connected |
| Health Check | `GET /api/health` | ✅ Healthy |
