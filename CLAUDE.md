PROJECT STANDING INSTRUCTIONS — read and follow this on every task, without 
being asked again.

==================================================
1. MAINTAIN MEMORY.MD AUTOMATICALLY
==================================================

Before starting any task, read `memory.md` at the project root if it exists. 
After completing any meaningful change, update it yourself — don't wait to 
be told.

memory.md should always reflect the CURRENT state of the project, not a 
changelog. Keep it structured as:

- Project overview (one paragraph, what this app does)
- Tech stack in use
- Folder structure summary (high-level, not every file)
- Key architectural decisions and WHY they were made
- Current features implemented vs. planned
- Known issues / things intentionally left unfinished
- Environment variables required (names only, never actual values/secrets)

Rewrite outdated sections rather than appending endlessly — memory.md should 
stay concise and current, not become a long historical log.

==================================================
2. ANALYZE BEFORE ACTING
==================================================

Before writing new code for any request:
- Check if similar logic, a similar component, or a similar utility already 
  exists somewhere in the project.
- If it exists, reuse or extend it instead of creating a duplicate version.
- If a new feature overlaps with existing files, tell me which files you're 
  touching and why, briefly, before making sweeping changes.

Never assume a fresh file is needed without first checking if functionality 
already exists elsewhere in the codebase.

==================================================
3. FOLDER & FILE STRUCTURE — KEEP IT CLEAN
==================================================

Enforce a consistent, predictable structure at all times. If you find files 
in the wrong place, misnamed, or structure that has drifted, fix it as part 
of your work (and note the reorganization in memory.md).

General rules:
- Group by feature/domain, not by file type, once the project grows past a 
  handful of files (e.g. `/features/projects/`, `/features/teams/` rather 
  than one giant `/components/` folder holding everything).
- One component/function per file where reasonable — no giant files mixing 
  many unrelated responsibilities.
- Consistent naming convention throughout (pick one: kebab-case or 
  PascalCase for components, camelCase for functions/variables) — never mix 
  conventions across the project.
- Shared/reusable code (hooks, utilities, types) goes in clearly labeled 
  shared folders, not duplicated per feature.
- Keep backend logic (API routes/functions) clearly separated from frontend 
  UI code — never mixed in the same file.

==================================================
4. AVOID REDUNDANT / DUPLICATE CODE
==================================================

- Before adding a new function, search for an existing one that does the 
  same or similar thing.
- If you notice duplicate logic while working on something else (even 
  unrelated to the current task), flag it to me and suggest consolidating it 
  — don't silently leave duplication in place.
- Prefer extending a shared utility/hook over copy-pasting logic into a new 
  location.
- If two components are nearly identical, suggest merging them into one 
  configurable component instead of maintaining both.

==================================================
5. WHEN MAKING UI CHANGES
==================================================

If a requested change affects both what's displayed AND how data is 
stored/processed, treat it as a full-stack task by default — implement the 
UI change AND the corresponding backend/database logic, unless I explicitly 
say "UI only" or "just the design."

==================================================
6. BEFORE FINISHING ANY TASK
==================================================

- Update memory.md with what changed and why.
- Confirm no duplicate files or logic were introduced.
- Confirm the change follows the existing folder structure and naming 
  convention — don't introduce a one-off pattern that breaks consistency.
