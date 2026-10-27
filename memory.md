# memory.md — Project State & Architectural Memory

## Project Overview
ProjectNexus is a full-stack academic project lifecycle governance and versioned continuity platform designed for higher education institutions. It centralizes student capstone projects, automated health scoring, GitHub telemetry tracking, and Jira-style milestone management under an administrative dashboard, while providing student teams with a dedicated workspace. When a project is abandoned or discontinued, ProjectNexus preserves completed deliverables, unresolved debt, and repository states into a Handover Packet, enabling successor teams to inherit and resume development seamlessly without restarting from scratch.

---

## Tech Stack in Use
* **Frontend**: React 19 (SPA with Vite), Vanilla CSS design tokens with Lucide React icons.
* **Backend**: Node.js & Express 5 (RESTful APIs with CORS, rate-limiting, and SHA-256 HMAC verification).
* **Database & ODM**: MongoDB Atlas with Mongoose 9 (models consolidated in `backend/db/`).
* **Authentication**: JSON Web Tokens (JWT) with bcryptjs (12 salt rounds) and role-based access control.
* **Email & Telemetry**: Nodemailer (Gmail SMTP service) for invitation links, GitHub Webhooks for real-time repository push/PR telemetry.

---

## Folder Structure Summary
```
mini_project/
├── CLAUDE.md                   # Standing instructions for agentic coding workflows
├── AGENTS.md                   # Canonical instruction rulebook
├── memory.md                   # Current architectural memory & project state
├── backend/
│   ├── controllers/            # Request handlers (authController, projectController)
│   ├── db/                     # Consolidated DB connection & schemas (Project, Task, TeamDB, User, RepositoryEvent, index)
│   ├── middlewares/            # JWT auth and GitHub HMAC signature verification
│   ├── routes/                 # Express API routes (/auth, /projects, /webhooks)
│   ├── scripts/                # Administrative seeds and telemetry diagnostic utilities
│   ├── services/               # Reusable business logic (emailService, githubService, healthService, handoverAnalysisService, tunnelService)
│   ├── utils/                  # Token generation helpers
│   └── server.js               # Express app entry point
└── frontend/
    ├── public/                 # Static SVG icons and favicon
    └── src/
        ├── assets/             # Brand illustrations and hero imagery
        ├── components/         # Clean modular UI pages & modals
        │   ├── admin/          # Admin portal subcomponents (AdminDashboard, ProjectListView, CreateProjectModal, etc.)
        │   ├── AccessCodePage.jsx     # Team access code redemption interface
        │   ├── AdminLoginPage.jsx     # Dedicated administrator login
        │   ├── EntryLandingPage.jsx   # Public institutional portal gateway
        │   ├── HandoverModal.jsx      # Project continuity & handover creation modal
        │   ├── InviteModal.jsx        # Quick team invitation modal
        │   ├── TeamWorkspacePage.jsx  # Student workspace (Kanban, Milestones, Team Directory, Webhook Telemetry)
        │   └── WorkspaceLoginPage.jsx # Team credentials login
        ├── data/               # Mock fallback data (mockData.js)
        ├── App.jsx             # Main client router & state orchestration
        ├── main.jsx            # React root mount
        └── index.css           # Global design system tokens and responsive utilities
```

---

## Key Architectural Decisions and WHY They Were Made
1. **Consolidated `backend/db/` Folder**:
   * *Decision*: Replaced the split between `models/` and `db/` by moving all Mongoose schemas (`Project`, `TeamDB`, `RepositoryEvent`, `Task`, `User`) directly into `backend/db/`.
   * *Why*: Eliminates ambiguity on where data definitions live and adheres to the user-mandated file organization.
2. **Dedicated `teamdb` Collection**:
   * *Decision*: Team member profiles, credentials, assigned tasks, GitHub repository URLs, branches, and webhook URLs are stored in a dedicated MongoDB collection named `teamdb` via [`backend/db/TeamDB.js`](backend/db/TeamDB.js).
   * *Why*: Enables decoupled team roster management and fast workspace synchronization across reloads.
3. **Public DNS Overrides for MongoDB Atlas**:
   * *Decision*: Configured `dns.setServers(['8.8.8.8', '8.8.4.4'])` in [`backend/db/db.js`](backend/db/db.js) before connecting.
   * *Why*: Institutional/college campus DNS resolvers frequently block MongoDB SRV lookups on Windows environments.
4. **Decoupled Team Directory with Dual Identification**:
   * *Decision*: Projects can be retrieved and updated by either MongoDB ObjectId (`_id`) or human-readable Project ID (`projectId`, e.g. `CSE-2025-642`).
   * *Why*: Simplifies student access via human-friendly codes while preserving relational integrity in backend models.
5. **No Redundant Prototype Components**:
   * *Decision*: Removed stale prototype components (`AdminDashboardView.jsx`, `TeamWorkspaceView.jsx`, root `CreateProjectModal.jsx`, `Navbar.jsx`) in favor of active domain components.
   * *Why*: Eliminates bundle bloat and prevents developers from accidentally editing obsolete files.
6. **Zero-State Real-Time Tracking Initialization**:
   * *Decision*: Newly initialized projects start strictly at 0% progress and `'Not Tracked'` health status (`healthScore: 0`), with an empty team roster array and project-scoped milestones, until tasks, commits, or telemetry events are recorded.
   * *Why*: Ensures realistic, honest metrics on newly created projects rather than populating dummy roster data or pre-cooked progress indicators.
7. **Hybrid Cached Handover Intelligence Pipeline**:
   * *Decision*: Implemented `backend/services/handoverAnalysisService.js` using a 3-tier hybrid pipeline (instant MongoDB cache -> parallel `Promise.allSettled` GitHub API fetch -> deterministic manifest dependency & telemetry classifier) with persistence in `Project.automatedHandoverReport`.
   * *Why*: Eliminates 3-5s UI freezes, prevents GitHub's 60 req/hr unauthenticated rate limit lockouts, falls back gracefully if repos are private/offline, and synthesizes Git manifests + commit logs + Kanban tasks into a complete transition dossier.

---

## Current Features Implemented vs. Planned
### Implemented
* **Admin Governance**:
  - Live dashboard metrics (active projects, health distribution, upcoming deadlines).
  - Project provisioning with randomized faculty guide assignment and auto-generated `NEXUS-XXXX` access codes.
  - Deletion and archiving with full telemetry event cascading cleanup.
  - One-click Gmail SMTP email dispatch of project invitations and access codes.
  - Comprehensive Project Detail View with balanced two-column enterprise layout, sleek full-width Webhook Ingestion Payload URL bar, dedicated academic mentorship card, and normalized governance audit trail.
  - Critical Projects table with clean human-readable date formatting and responsive Action column alignment preventing Inspect button clipping.
* **Team Workspace**:
  - Direct team onboarding via human Project ID + Team Access Code.
  - Team Directory & Repository view synced with MongoDB collection `teamdb`.
  - Student-authored Project Brief, Live Status updates, and individual Member Contribution management.
  - In-browser webhook simulation and real-time GitHub webhook payload configuration (`/api/webhooks/repo/:id`) with zero-config auto-generation using the system's static public domain (`support-shy-overcook.ngrok-free.dev`).
  - Kanban task board with status workflows (`todo`, `in_progress`, `under_review`, `done`).
  - Milestone timeline and weekly update submission.
* **Continuity & Handover Engine**:
  - Handover generation modal capturing version bump (`v1.0` $\rightarrow$ `v2.0`), completed deliverables, pending items, and inherited repository links.
  - **Automated Repository & Tech Stack Intelligence Dossier**:
    * Analyzes repository via Git URL + GitHub API (languages, manifests `package.json`/`requirements.txt`, commit history, open issues).
    * Classifies detected tools & frameworks into 5 distinct tiers (Frontend, Backend, Database/ORM, DevOps/Infrastructure, AI/Data).
    * Calculates exact language distribution with multi-segment color bar.
    * Generates "What Happened in the Project" executive transition narrative synthesized from commits and completed sprints.
    * Successor Team Onboarding Terminal Guide featuring copyable `git clone` command, environment setup scripts (`npm install`, `cp .env.example .env`), and immediate sprint priorities.
    * On-demand "⚡ Re-Analyze Repository" button with instant cache (<50ms) and live sync status indicators.
    * Auto-triggered whenever an administrator flags a project "Open to Handover".

### Planned
* WebSocket / Server-Sent Events (SSE) for live push updates directly into the browser without manual page refresh.
* Native GitHub OAuth app integration as an alternative to manual webhook configuration.
* Automated grading / evaluation rubrics matrix for faculty mentors.

---

## Known Issues / Things Intentionally Left Unfinished
* **GitHub Webhook Verification**: Automatically exposed via built-in ngrok tunnel service (`backend/services/tunnelService.js`), connecting to developer's static domain (`support-shy-overcook.ngrok-free.dev`) automatically when `npm run dev` starts.
* **Mock Fallbacks**: If MongoDB Atlas loses Internet connectivity, the frontend gracefully falls back to mock data stored in [`frontend/src/data/mockData.js`](frontend/src/data/mockData.js).

---

## Environment Variables Required
### Backend (`backend/.env`)
* `PORT`: Server listening port (e.g. `5000`)
* `NODE_ENV`: Runtime environment (`development` / `production`)
* `MONGO_URI`: MongoDB connection string
* `JWT_SECRET`: Secret key for signing authentication tokens
* `JWT_EXPIRES_IN`: Token validity lifespan (e.g. `7d`)
* `CLIENT_URL`: Allowed frontend origin for CORS (e.g. `http://localhost:5173`)
* `EMAIL_SERVICE`: SMTP provider (e.g. `gmail`)
* `EMAIL_USER`: Email address used to dispatch invitation links
* `EMAIL_PASS`: App password / SMTP authentication token
* `ENABLE_NGROK_TUNNEL`: Boolean flag to auto-start ngrok on server launch
* `NGROK_DOMAIN`: Static ngrok dev domain assigned to developer
* `NGROK_AUTHTOKEN`: ngrok authentication token
