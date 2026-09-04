# PROJECTNEXUS — MASTER IMPLEMENTATION PLAN (FINAL)
### Synthesized from workflow-design review + resume-positioning review

This is the canonical version. It merges the strongest ideas from both plans and cuts what's redundant or too heavy for the timeline.

---

## 1. FINAL MODULE ARCHITECTURE

```
                    PROJECTNEXUS
                         │
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
   Governance        Project          Student
   & Admin           Workspace        Teams
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ↓
                  Monitoring & Health
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
         Continuity &            Analytics &
         Version History          Archive
```

Six modules. Nothing gets added to this list without something else being cut.

---

## 2. THE DATA MODEL UPGRADE — PROJECT VERSIONING

This is the single best idea from the workflow review, and it should replace my earlier "handover packet as a one-off JSON blob" framing. Model it properly:

```
projects
  id, title, department, status, created_at

project_versions
  id, project_id, team_id, version_number,
  completion_at_handover, started_at, ended_at, reason_for_transfer

project_handovers
  id, project_id, from_version_id, to_version_id,
  completed_modules[], pending_modules[], known_issues[],
  faculty_notes, repository_access, handover_notes, created_at
```

Why this is better than a flat snapshot: it means "who worked on this project, in what order, and why did it change hands" is a **queryable history**, not a single overwritten record. This is exactly how real version-controlled systems (including Git itself) model change over time — and it's a genuinely strong thing to explain in an interview: *"I modeled project continuity as a version history rather than a status flag, so the system can answer 'who worked on this before and why did it transfer' as a native query."*

---

## 3. ACCESS MODEL (adopt this exactly as specified)

```
Student Account (Supabase Auth)
       ↓
Team Membership (join table: team_members)
       ↓
Project Assignment (project_assignments)
       ↓
Visible in "My Projects"
```

No shared credentials, no project-level passwords. A user's visibility into a project is entirely derived from their team membership + role — enforced by **Postgres Row-Level Security**, not frontend route guards. This is a security detail worth stating explicitly in your report: *"Frontend hiding a button is not access control — every permission is enforced at the database layer via RLS."*

---

## 4. ROLES (final list — 6, not more)

| Role | Sees |
|---|---|
| System Admin | Everything, technical config |
| Principal | Institution-wide trends, no low-level detail |
| HOD | Department projects, faculty workload, delayed projects |
| Faculty | Assigned projects, pending reviews, at-risk teams |
| Team Leader | Own project workspace, team management |
| Team Member | Own project workspace, contribution only |

---

## 5. PRE-CODE DOCUMENTATION (compressed to 3, not 5)

Don't skip this — but don't let it eat a month either.

1. **Requirements + Workflow** (combine into one doc): roles, permissions, business rules, full lifecycle diagram from creation to archive/handover
2. **Database Design**: ER diagram, table list, RLS policy map, enums — do this before touching Supabase
3. **UI/UX**: wireframes for each dashboard (Admin, Principal, HOD, Faculty, Student) + the Project Workspace + Handover screen, in Figma or Stitch

Time-box this to **2 weeks max**. If it's not converging, start building and refine in parallel — perfect documentation before any code is a trap for a 16-week timeline.

---

## 6. MVP SCOPE LOCK (merged, final)

**Build:**
- Auth + RBAC + RLS
- Project creation → team assignment → team onboarding → faculty approval
- Project Workspace (Overview, Team, Milestones, Progress, Repository, Documents, Reviews, Timeline, Continuity tabs)
- Milestone tracking with approval states
- Weekly progress updates + auto activity log
- Health Score engine (rule-based, testable module)
- Abandonment detection → **versioned handover** → new team continuation
- Role-specific dashboards (Admin, Principal, HOD, Faculty, Student)
- Institutional Archive (searchable completed/abandoned projects)
- Basic GitHub link (commit count, last commit, contributors)

**Explicitly do not build in v1:**
- ❌ AI features (risk prediction, summarization, duplicate detection) — real, but v2
- ❌ Real-time chat — use threaded milestone comments instead
- ❌ Mobile app
- ❌ Deep GitHub automation (webhooks, CI status)
- ❌ Video meetings, payments, microservices

---

## 7. TECH STACK (final)

```
Frontend: React + TypeScript + Vite + Tailwind + React Router
Backend/BaaS: Supabase (Postgres + Auth + Storage + RLS)
Repo data: GitHub REST API (read-only)
Hosting: Vercel + Supabase
Version control: Git + GitHub
```

TypeScript is worth the extra setup time — it's a stronger resume signal than plain JS and catches schema-mismatch bugs early, which matters a lot in a Supabase-typed workflow.

---

## 8. EXECUTION TIMELINE — 16 WEEKS

| Phase | Weeks | Deliverable |
|---|---|---|
| 1. Requirements + Workflow + DB Design | 1–2 | 3 core docs, ER diagram, RLS map |
| 2. Auth & RBAC | 3 | Login, roles, protected routes, RLS enforced |
| 3. Core Project Management | 4–6 | Project creation → team onboarding → faculty approval → workspace shell |
| 4. Tracking Engine | 7–9 | Milestones, progress updates, activity log, GitHub link |
| 5. Health Engine | 10 | Testable Health Score module + unit tests |
| 6. **Continuity Engine (flagship)** | 11–12 | Abandonment detection, versioned handover, new-team continuation |
| 7. Dashboards + Archive | 13–14 | Role-specific dashboards, Institutional Archive, marketplace/join-request flow |
| 8. Pilot + Polish | 15 | Real faculty + real team pilot, fix top friction points only |
| 9. Documentation + Demo | 16 | ADRs, demo video, resume bullets, clean public repo |

---

## 9. THE RESUME/PORTFOLIO LAYER (don't skip this — it's what makes this project *count*)

- **Architecture Decision Records**: short dated notes in `/docs/decisions` for each major call (why RLS over frontend checks, why versioned handover over flat snapshot, why threaded comments over real-time chat)
- **Unit tests on the Health Score module** — small, isolated, easy to explain in an interview
- **A real pilot** with one faculty guide and one team — this is where your resume numbers come from
- **Clean public GitHub repo** with a README architecture diagram — this is what actually gets clicked on

**Resume bullets to fill in with real pilot numbers:**
- *"Designed a versioned project-continuity model (Postgres) so institutional project history is queryable rather than overwritten — enabling automated handover when teams discontinue a project."*
- *"Enforced role-based access for 6 user roles entirely via PostgreSQL Row-Level Security, with zero frontend-only permission logic."*
- *"Built and pilot-tested a rule-based project health engine across [N] active projects, correctly flagging [N] at-risk projects before faculty manually noticed."*

---

## 10. THE PITCH (final script — use this verbatim structure)

**Problem:** *"Colleges manage hundreds of student projects a year, but progress, documentation, and history are scattered — and when a team discontinues a project, the next team usually starts from zero."*

**Solution:** *"ProjectNexus centralizes the full project lifecycle and models team changes as version history, so continuity is automatic instead of manual."*

**Demo:** Admin creates a project → Team A reaches 45% → Team A is marked abandoned → system generates a versioned handover with completed work, issues, and faculty notes → Admin assigns Team B → Team B opens the Continuation Workspace and resumes from 45%.

**Close with the evidence line:** *"Industry data shows fewer than a third of organizations even use a digital tool for handover today — this system automates a step that's normally manual and lossy, at the institutional scale of a college."*

That's the whole pitch. Everything else in the system exists to make that demo believable.
