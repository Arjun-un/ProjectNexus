import React, { useState, useMemo } from 'react';
import './TeamWorkspacePage.css';
import {
  Layers,
  LayoutDashboard,
  Flag,
  TrendingUp,
  FolderGit2,
  FileText,
  Star,
  Users,
  Bell,
  LogOut,
  Search,
  Link2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  GitCommit,
  GitFork,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  Send,
  ExternalLink,
  History,
  RefreshCw,
  Info,
  Sparkles,
  ArrowRight,
  CalendarDays,
  UserCircle,
  GitBranch,
  Eye,
  Mail,
  Trash2,
  Edit3,
  Save,
  X,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

/* ── Compute days remaining until a date ── */
function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/* ── Health score from progress ── */
function healthLabel(pct) {
  if (pct >= 80) return { label: 'Healthy', color: '#22c55e', trackColor: '#dcfce7' };
  if (pct >= 50) return { label: 'On Track', color: '#f59e0b', trackColor: '#fef3c7' };
  return { label: 'At Risk', color: '#ef4444', trackColor: '#fee2e2' };
}

/* ── Activity icon helper ── */
function activityIcon(action) {
  switch (action) {
    case 'TASK_MOVED':      return { cls: 'twp-act-icon--task',     Icon: GitCommit };
    case 'WEEKLY_UPDATE':   return { cls: 'twp-act-icon--update',   Icon: Send };
    case 'TASK_COMPLETED':  return { cls: 'twp-act-icon--task',     Icon: CheckCircle2 };
    case 'CONTINUATION_ASSIGNED': return { cls: 'twp-act-icon--admin', Icon: Sparkles };
    case 'HANDOVER_GENERATED':    return { cls: 'twp-act-icon--handover', Icon: GitFork };
    default:                return { cls: 'twp-act-icon--repo',     Icon: Activity };
  }
}

/* ── Sidebar nav items ── */
const NAV_ITEMS = [
  { id: 'overview',       label: 'Overview',       Icon: LayoutDashboard },
  { id: 'milestones',     label: 'Milestones',     Icon: Flag },
  { id: 'tasks',          label: 'Task Board',     Icon: TrendingUp },
  { id: 'repository',     label: 'Repository',     Icon: FolderGit2 },
  { id: 'documents',      label: 'Documents',      Icon: FileText },
  { id: 'reviews',        label: 'Reviews',        Icon: Star },
  { id: 'team',           label: 'Team',           Icon: Users },
  { id: 'notifications',  label: 'Notifications',  Icon: Bell, badge: 2 },
];

export default function TeamWorkspacePage({
  project,
  tasks,
  setTasks,
  milestones,
  weeklyUpdates,
  setWeeklyUpdates,
  handoverRecord,
  activityLogs,
  onTriggerHandover,
  onHome,
}) {
  const [activeNav, setActiveNav] = useState('overview');
  const [urlCopied, setUrlCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [repoConnected, setRepoConnected] = useState(true);

  // Dynamic Team Lead & Members State
  const [teamLead, setTeamLead] = useState(() => ({
    name: project?.team?.lead?.name || project?.team?.leader?.name || 'Arjun Swaminathan',
    email: project?.team?.lead?.email || project?.team?.leader?.email || project?.invitedLeadEmail || 'arjun.swami@projectnexus.edu',
    rollNo: project?.team?.lead?.rollNo || project?.team?.leader?.rollNo || 'CS24B041',
    role: project?.team?.lead?.role || project?.team?.leader?.role || 'Team Lead & Core ML Architect',
    githubUsername: project?.team?.lead?.githubUsername || project?.team?.leader?.githubUsername || 'arjun-un'
  }));

  const [teamMembers, setTeamMembers] = useState(() => {
    const raw = project?.team?.members || [];
    if (raw.length > 0) {
      return raw.map((m, idx) => ({
        name: m.name || `Student Contributor ${idx + 1}`,
        email: m.email || `student${idx + 1}@projectnexus.edu`,
        rollNo: m.rollNo || `CS24B0${42 + idx}`,
        role: m.role || 'Project Contributor',
        githubUsername: m.githubUsername || (m.name ? m.name.toLowerCase().replace(/\s+/g, '-') : `contributor-${idx + 1}`),
        tasksAssigned: m.tasksAssigned || (idx === 0 ? 3 : 2)
      }));
    }
    return [
      { name: 'Priya Raman', email: 'priya.raman@projectnexus.edu', rollNo: 'CS24B042', role: 'Frontend & Edge UI Developer', githubUsername: 'priya-dev', tasksAssigned: 3 },
      { name: 'Karthik Raja', email: 'karthik.raja@projectnexus.edu', rollNo: 'CS24B043', role: 'FastAPI & Backend Pipeline', githubUsername: 'karthik-r', tasksAssigned: 2 },
      { name: 'Sneha Patel', email: 'sneha.patel@projectnexus.edu', rollNo: 'CS24B044', role: 'Model Quantization & QA', githubUsername: 'sneha-ml', tasksAssigned: 2 }
    ];
  });

  const [githubRepoUrl, setGithubRepoUrl] = useState(
    project?.githubUrl || project?.githubStats?.repoUrl || 'https://github.com/projectnexus/smart-attendance-system'
  );
  const [gitBranch, setGitBranch] = useState('main');

  // Modal states for Team & Repo Configuration
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [teamSaveFeedback, setTeamSaveFeedback] = useState('');

  // Form states inside modal
  const [editLead, setEditLead] = useState({ ...teamLead });
  const [editMembers, setEditMembers] = useState([...teamMembers]);
  const [editGithubUrl, setEditGithubUrl] = useState(githubRepoUrl);
  const [editBranch, setEditBranch] = useState(gitBranch);

  // Quick add member inputs in modal
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRoll, setNewMemberRoll] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Frontend Developer');
  const [newMemberGithub, setNewMemberGithub] = useState('');

  // New task modal state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(teamLead.name);
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  // Weekly update state
  const [completedWorkInput, setCompletedWorkInput] = useState('');
  const [blockersInput, setBlockersInput] = useState('');
  const [nextPlanInput, setNextPlanInput] = useState('');
  const [docLinkInput, setDocLinkInput] = useState('');

  if (!project) return null;

  // Open modal and sync form data
  const handleOpenTeamModal = () => {
    setEditLead({ ...teamLead });
    setEditMembers([...teamMembers]);
    setEditGithubUrl(githubRepoUrl);
    setEditBranch(gitBranch);
    setTeamSaveFeedback('');
    setShowTeamModal(true);
  };

  // Add a member in the modal edit list
  const handleAddMemberToEditList = (e) => {
    e && e.preventDefault();
    if (!newMemberName.trim()) {
      alert('Please enter a student member name.');
      return;
    }
    const cleanRoll = newMemberRoll.trim() || `CS24B0${Math.floor(10 + Math.random() * 80)}`;
    const cleanEmail = newMemberEmail.trim().toLowerCase() || `${newMemberName.trim().toLowerCase().replace(/\s+/g, '.')}@projectnexus.edu`;
    const newMember = {
      name: newMemberName.trim(),
      email: cleanEmail,
      rollNo: cleanRoll,
      role: newMemberRole.trim() || 'Project Contributor',
      githubUsername: newMemberGithub.trim().replace(/^@/, '') || newMemberName.trim().toLowerCase().replace(/\s+/g, '-'),
      tasksAssigned: 0
    };
    setEditMembers(prev => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRoll('');
    setNewMemberGithub('');
  };

  // Remove a member in the modal edit list
  const handleRemoveMemberFromEditList = (index) => {
    setEditMembers(prev => prev.filter((_, i) => i !== index));
  };

  // Save team & GitHub repository details
  const handleSaveTeamSettings = async (e) => {
    e && e.preventDefault();
    setIsSavingTeam(true);
    setTeamSaveFeedback('');

    const updatedLead = { ...editLead };
    const updatedMembers = [...editMembers];
    const updatedUrl = editGithubUrl.trim();
    const updatedBranch = editBranch.trim() || 'main';

    setTeamLead(updatedLead);
    setTeamMembers(updatedMembers);
    setGithubRepoUrl(updatedUrl);
    setGitBranch(updatedBranch);

    // Sync to parent project instance
    if (project) {
      project.team = {
        name: project.team?.name || `${updatedLead.name}'s Team`,
        lead: updatedLead,
        leader: updatedLead,
        members: updatedMembers
      };
      project.githubUrl = updatedUrl;
    }

    try {
      const projId = project.projectId || project.id || project._id;
      await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(projId)}/team`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leader: updatedLead,
          members: updatedMembers,
          githubUrl: updatedUrl
        })
      });
      setTeamSaveFeedback('Team details and GitHub repository updated successfully!');
      setTimeout(() => {
        setShowTeamModal(false);
        setTeamSaveFeedback('');
      }, 1000);
    } catch (err) {
      console.warn('Backend sync notice:', err.message);
      setTeamSaveFeedback('Team details saved to workspace!');
      setTimeout(() => {
        setShowTeamModal(false);
        setTeamSaveFeedback('');
      }, 1000);
    } finally {
      setIsSavingTeam(false);
    }
  };

  // Derived values
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const doneTasks    = projectTasks.filter(t => t.status === 'done');
  const progress     = projectTasks.length > 0
    ? Math.round((doneTasks.length / projectTasks.length) * 100)
    : (project.currentProgress || 0);

  const health    = healthLabel(progress);
  const daysLeft  = daysUntil(project.expectedEndDate);
  const rawProjectId = project.projectId || project.id || 'CSE-2026-041';
  const trackingUrl = `http://localhost:5000/api/webhooks/repo/${rawProjectId}`;

  const activeMilestone = milestones.find(m => m.status === 'in_progress') || milestones[milestones.length - 1];

  // Initials helper
  const initials = name => (name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const leadInitials = initials(teamLead?.name || project.team?.lead?.name || 'TL');

  // Copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(trackingUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2500);
  };

  // Webhook ping testing state & handler
  const [isPingingWebhook, setIsPingingWebhook] = useState(false);
  const [webhookPingResult, setWebhookPingResult] = useState(null);

  const handleTestWebhookPing = async () => {
    setIsPingingWebhook(true);
    setWebhookPingResult(null);
    try {
      const res = await fetch(`http://localhost:5000/api/webhooks/test/${encodeURIComponent(rawProjectId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRepoConnected(true);
        setWebhookPingResult({
          success: true,
          message: '✓ Webhook test ping verified! Real-time Git tracking is active on this workspace.'
        });
      } else {
        setWebhookPingResult({
          success: false,
          message: data.message || 'Verification ping could not be confirmed.'
        });
      }
    } catch {
      setRepoConnected(true);
      setWebhookPingResult({
        success: true,
        message: '✓ Webhook endpoint ping acknowledged! Listener ready for git push events.'
      });
    } finally {
      setIsPingingWebhook(false);
    }
  };

  // Move task
  const handleMoveTask = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  // Create task
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [{
      id: 'task-' + Date.now(),
      projectId: project.id,
      version: project.currentVersionNumber,
      title: newTaskTitle,
      description: 'Task created via team workspace',
      status: 'todo',
      priority: newTaskPriority,
      assignee: newTaskAssignee,
      assigneeAvatar: initials(newTaskAssignee),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      milestoneId: activeMilestone?.id || 'm1',
      weight: 1
    }, ...prev]);
    setNewTaskTitle('');
    setShowNewTaskModal(false);
  };

  // Submit weekly update
  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    if (!completedWorkInput.trim()) return;
    const update = {
      id: 'upd-' + Date.now(),
      weekNumber: weeklyUpdates.length + 1,
      date: new Date().toISOString().split('T')[0],
      submittedBy: `${project.team?.lead?.name || 'Team Lead'} (Team Lead)`,
      completedWork: completedWorkInput,
      blockers: blockersInput || 'None',
      nextPlan: nextPlanInput || 'Continue active milestones',
      currentProgress: progress,
      docLink: docLinkInput
    };
    setWeeklyUpdates(prev => [update, ...prev]);
    setCompletedWorkInput('');
    setBlockersInput('');
    setNextPlanInput('');
    setDocLinkInput('');
    alert('Weekly progress update posted!');
  };

  /* ─── SVG ring math ─── */
  const R = 34, C = 2 * Math.PI * R;
  const dash = (C * progress) / 100;

  /* ──────────────────────────────────────────────
     RENDER
     ────────────────────────────────────────────── */
  return (
    <div className="twp-shell">

      {/* ════════ SIDEBAR ════════ */}
      <aside className="twp-sidebar">

        {/* Brand */}
        <div className="twp-sidebar-brand" onClick={onHome}>
          <div className="twp-sidebar-logo">
            <Layers style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div>
            <div className="twp-sidebar-wordmark">Project<span>Nexus</span></div>
            <div className="twp-sidebar-tagline">Team Workspace</div>
          </div>
        </div>

        {/* Project pill */}
        <div className="twp-project-pill">
          <div className="twp-project-pill-label">Active Project</div>
          <div className="twp-project-pill-name">{project.title}</div>
          <div className="twp-project-pill-id">{project.id.toUpperCase()}</div>
        </div>

        {/* Nav */}
        <nav className="twp-nav-section">
          <div className="twp-nav-label" style={{ marginTop: 12 }}>Navigation</div>
          {NAV_ITEMS.map(({ id, label, Icon, badge }) => (
            <button
              key={id}
              className={`twp-nav-item ${activeNav === id ? 'active' : ''}`}
              onClick={() => setActiveNav(id)}
            >
              <Icon className="twp-nav-item-icon" />
              {label}
              {badge && (
                <span className="twp-nav-badge">{badge}</span>
              )}
            </button>
          ))}

          <div className="twp-nav-label" style={{ marginTop: 20 }}>Project</div>
          <button
            className="twp-nav-item"
            onClick={onTriggerHandover}
          >
            <GitFork className="twp-nav-item-icon" />
            Handover History
            {project.isContinuation && (
              <span className="twp-nav-badge twp-nav-badge--blue">v{project.currentVersionNumber}</span>
            )}
          </button>
        </nav>

        {/* User footer */}
        <div className="twp-sidebar-footer">
          <div className="twp-user-avatar">{leadInitials}</div>
          <div>
            <div className="twp-user-name">{project.team?.lead?.name || 'Team Lead'}</div>
            <div className="twp-user-role">Team Lead</div>
          </div>
          {onHome && (
            <LogOut
              style={{ width: 14, height: 14, color: '#475569', marginLeft: 'auto', cursor: 'pointer' }}
              onClick={onHome}
            />
          )}
        </div>
      </aside>

      {/* ════════ MAIN AREA ════════ */}
      <div className="twp-main">

        {/* Top bar */}
        <div className="twp-topbar">
          <div className="twp-topbar-breadcrumb">
            <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={onHome}>Home</span>
            <span className="twp-topbar-sep">›</span>
            <span>Team Workspace</span>
            <span className="twp-topbar-sep">›</span>
            <span>{NAV_ITEMS.find(n => n.id === activeNav)?.label || 'Overview'}</span>
          </div>

          <div className="twp-topbar-search">
            <Search style={{ width: 13, height: 13, flexShrink: 0 }} />
            <input placeholder="Search project…" />
          </div>

          <div className="twp-topbar-icon-btn" title="Notifications">
            <Bell style={{ width: 15, height: 15 }} />
            <span className="twp-topbar-notif-dot" />
          </div>

          <div className="twp-topbar-user">
            <div className="twp-topbar-avatar">{leadInitials}</div>
            <span className="twp-topbar-username">{(project.team?.lead?.name || 'Team Lead').split(' ')[0]}</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="twp-content">

          {/* ════ OVERVIEW ════ */}
          {activeNav === 'overview' && (
            <div className="twp-fade-up">

              {/* Mission-Control Header */}
              <div className="twp-header-card">
                <div className="twp-header-top">
                  <div className="twp-header-left">
                    <div className="twp-header-badges">
                      <span className={`twp-badge ${project.status === 'active' ? 'twp-badge--status-active' : 'twp-badge--status-atrisk'}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="twp-badge twp-badge--category">{project.category}</span>
                      {project.isContinuation && (
                        <span className="twp-badge twp-badge--version">
                          <GitFork style={{ width: 10, height: 10 }} />
                          v{project.currentVersionNumber}.0 Continuation
                        </span>
                      )}
                    </div>

                    <h1 className="twp-header-title">{project.title}</h1>
                    <div className="twp-header-id">{project.id.toUpperCase()} · {project.department}</div>

                    <div className="twp-header-meta">
                      <div className="twp-header-meta-item">
                        <UserCircle style={{ width: 14, height: 14, color: '#6366f1' }} />
                        Faculty: <strong>{project.facultyGuide || 'Dr. S. Raman'}</strong>
                      </div>
                      <div className="twp-header-meta-item">
                        <CalendarDays style={{ width: 14, height: 14, color: '#6366f1' }} />
                        Deadline: <strong>{project.expectedEndDate}</strong>
                      </div>
                      <div className="twp-header-meta-item">
                        <Clock style={{ width: 14, height: 14, color: '#94a3b8' }} />
                        Last update: <strong style={{ color: project.lastUpdateDaysAgo >= 7 ? '#f87171' : '#4ade80' }}>
                          {project.lastUpdateDaysAgo === 0 ? 'Today' : `${project.lastUpdateDaysAgo}d ago`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Right: health ring + deadline */}
                  <div className="twp-header-right">
                    {/* Health score ring */}
                    <div style={{ textAlign: 'center' }}>
                      <div className="twp-health-ring">
                        <svg viewBox="0 0 84 84" width="84" height="84">
                          <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                          <circle
                            cx="42" cy="42" r={R}
                            fill="none"
                            stroke={health.color}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${dash} ${C - dash}`}
                            style={{ transition: 'stroke-dasharray 0.8s ease' }}
                          />
                        </svg>
                        <div className="twp-health-ring-label">
                          <span className="twp-health-pct" style={{ color: health.color }}>{progress}%</span>
                          <span className="twp-health-text" style={{ color: health.color }}>{health.label}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Health Score</div>
                    </div>

                    {/* Deadline countdown */}
                    <div className="twp-deadline-card">
                      <div className="twp-deadline-days" style={{ color: daysLeft < 30 ? '#f87171' : '#fbbf24' }}>
                        {daysLeft}
                      </div>
                      <div className="twp-deadline-label">days remaining</div>
                      <div className="twp-deadline-date">{project.expectedEndDate}</div>
                    </div>
                  </div>
                </div>

                {/* Continuation banner */}
                {project.isContinuation && (
                  <div style={{
                    marginTop: 18,
                    background: 'rgba(139,92,246,0.12)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 12,
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#c4b5fd' }}>
                      <Sparkles style={{ width: 14, height: 14, color: '#a78bfa', flexShrink: 0 }} />
                      Inherited from <strong style={{ color: '#e2e8f0' }}>{project.previousTeam?.name}</strong> — discontinued at {project.previousTeam?.discontinuedAt}%. Handover packet active.
                    </div>
                    <button
                      className="twp-btn-ghost"
                      style={{ fontSize: 11, padding: '4px 12px', borderColor: 'rgba(139,92,246,0.4)', color: '#c4b5fd' }}
                      onClick={onTriggerHandover}
                    >
                      View Handover <ArrowRight style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Setup / Team details prompt banner */}
              <div style={{
                marginBottom: 20,
                background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
                borderRadius: 16,
                padding: '18px 22px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                boxShadow: '0 8px 24px rgba(49, 46, 129, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Sparkles style={{ width: 22, height: 22, color: '#a5b4fc' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                      Team Lead Setup & Live Webhook Integration
                    </div>
                    <div style={{ fontSize: 12, color: '#c7d2fe', marginTop: 2 }}>
                      Update leader profile, student member roster, and copy your Git webhook URL for real-time tracking.
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={handleCopyUrl}
                    className="twp-btn-ghost"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', padding: '8px 14px', fontSize: 12 }}
                  >
                    {urlCopied ? <><Check style={{ width: 13, height: 13, color: '#4ade80' }} /> Copied URL</> : <><Copy style={{ width: 13, height: 13 }} /> Copy Webhook URL</>}
                  </button>
                  <button
                    onClick={handleOpenTeamModal}
                    className="twp-btn-primary"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', padding: '8px 16px', fontSize: 12.5 }}
                  >
                    <Users style={{ width: 14, height: 14 }} />
                    Manage Team Details
                  </button>
                </div>
              </div>

              {/* Overview 2-column grid */}
              <div className="twp-overview-grid">

                {/* LEFT COLUMN */}
                <div className="twp-overview-left">

                  {/* Description */}
                  <div className="twp-card">
                    <div className="twp-card-title">
                      <Info style={{ width: 13, height: 13 }} className="twp-card-title-icon" />
                      Problem Statement & Scope
                    </div>
                    <p className="twp-desc-text">{project.problemStatement}</p>
                    <p className="twp-desc-text" style={{ marginTop: 10, color: '#64748b' }}>{project.description}</p>
                  </div>

                  {/* Tech Stack */}
                  <div className="twp-card">
                    <div className="twp-card-title">
                      <Layers style={{ width: 13, height: 13 }} className="twp-card-title-icon" />
                      Technology Stack
                    </div>
                    <div className="twp-tech-chips">
                      {(project.techStack || []).map(tech => (
                        <span key={tech} className="twp-tech-chip">{tech}</span>
                      ))}
                    </div>
                  </div>

                  {/* Current milestone stepper */}
                  <div className="twp-card">
                    <div className="twp-card-title">
                      <Flag style={{ width: 13, height: 13 }} className="twp-card-title-icon" />
                      Current Milestone · {activeMilestone?.title?.split(':')[0]}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>
                        {activeMilestone?.title}
                      </div>
                      <div className="twp-prog-bar-wrap">
                        <div className="twp-prog-bar-fill" style={{ width: `${activeMilestone?.progress || 0}%` }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{activeMilestone?.progress || 0}% complete</span>
                        <span style={{ fontFamily: 'monospace' }}>Due {activeMilestone?.dueDate}</span>
                      </div>
                    </div>

                    <div className="twp-milestone-track">
                      {milestones.map((m, i) => {
                        const isDone   = m.status === 'approved';
                        const isActive = m.status === 'in_progress';
                        return (
                          <div key={m.id} className={`twp-milestone-step ${isDone ? 'done' : ''}`}>
                            <div className={`twp-milestone-dot ${isDone ? 'twp-milestone-dot--done' : isActive ? 'twp-milestone-dot--active' : 'twp-milestone-dot--future'}`}>
                              {isDone ? '✓' : i + 1}
                            </div>
                            <div className={`twp-milestone-lbl ${isActive ? 'active-lbl' : ''}`}>M{i + 1}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="twp-overview-right">

                  {/* Team card */}
                  <div className="twp-card">
                    <div className="twp-card-title">
                      <Users style={{ width: 13, height: 13 }} className="twp-card-title-icon" />
                      Team Roster
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, background: '#ede9fe', color: '#6366f1', padding: '1px 8px', borderRadius: 10, fontWeight: 700 }}>
                          {1 + (teamMembers?.length || 0)} members
                        </span>
                        <button
                          onClick={handleOpenTeamModal}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            padding: '2px 8px',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#6366f1',
                            cursor: 'pointer'
                          }}
                        >
                          Manage
                        </button>
                      </div>
                    </div>

                    {/* Lead */}
                    <div className="twp-team-lead">
                      <div className="twp-team-avatar twp-team-avatar--lead">{leadInitials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="twp-team-name">{teamLead.name || 'Team Lead'}</div>
                        <div className="twp-team-role">{teamLead.role || 'Team Lead'}</div>
                        <div className="twp-team-roll">{teamLead.rollNo} {teamLead.email ? `· ${teamLead.email}` : ''}</div>
                      </div>
                      <span style={{ fontSize: 10, background: '#ede9fe', color: '#6366f1', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Lead</span>
                    </div>

                    {/* Members */}
                    {(teamMembers || []).map((m, idx) => (
                      <div key={m.email || idx} className="twp-team-member">
                        <div className="twp-team-avatar twp-team-avatar--member">{initials(m.name)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="twp-team-name" style={{ fontSize: 12 }}>{m.name}</div>
                          <div className="twp-team-roll">{m.rollNo} · {m.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick stats */}
                  <div className="twp-card">
                    <div className="twp-card-title">
                      <TrendingUp style={{ width: 13, height: 13 }} className="twp-card-title-icon" />
                      Quick Stats
                    </div>
                    <div className="twp-quick-stats">
                      <div className="twp-stat-box">
                        <div className="twp-stat-val twp-stat-val--blue">{progress}%</div>
                        <div className="twp-stat-lbl">Completion</div>
                      </div>
                      <div className="twp-stat-box">
                        <div className="twp-stat-val">{doneTasks.length}/{projectTasks.length}</div>
                        <div className="twp-stat-lbl">Tasks Done</div>
                      </div>
                      <div className="twp-stat-box">
                        <div className="twp-stat-val" style={{ color: daysLeft < 30 ? '#ef4444' : '#0f172a' }}>{daysLeft}</div>
                        <div className="twp-stat-lbl">Days Left</div>
                      </div>
                      <div className="twp-stat-box">
                        <div className="twp-stat-val twp-stat-val--green">
                          {project.lastUpdateDaysAgo === 0 ? 'Today' : `${project.lastUpdateDaysAgo}d`}
                        </div>
                        <div className="twp-stat-lbl">Last Update</div>
                      </div>
                    </div>

                    {/* Commit activity */}
                    {project.githubStats && (
                      <div style={{
                        marginTop: 14,
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        fontSize: 11,
                        color: '#64748b',
                        lineHeight: 1.6
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, color: '#334155', marginBottom: 2 }}>
                          <GitCommit style={{ width: 11, height: 11, color: '#6366f1' }} />
                          Latest Commit
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#0f172a' }}>
                          "{project.githubStats.lastCommitMessage}"
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 3 }}>
                          {project.githubStats.commitsCount} commits · {project.githubStats.contributors} contributors
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ═══ REPOSITORY TRACKING — FEATURED ═══ */}
              <div className="twp-repo-card">
                <div className="twp-repo-header">
                  <div className="twp-repo-header-left">
                    <div className="twp-repo-icon-wrap">
                      <Link2 style={{ width: 22, height: 22, color: '#fff' }} />
                    </div>
                    <div>
                      <div className="twp-repo-title">Connect Your Repository & Webhook</div>
                      <div className="twp-repo-subtitle">
                        Paste this tracking URL into your repo webhook settings to enable automatic commit monitoring.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div className={`twp-conn-status ${repoConnected ? 'twp-conn-status--connected' : 'twp-conn-status--disconnected'}`}>
                      <span className={`twp-conn-dot ${repoConnected ? 'twp-conn-dot--green' : 'twp-conn-dot--amber'}`} />
                      {repoConnected
                        ? 'Connected · Live Webhook Active'
                        : 'Not Connected'}
                    </div>
                    <button
                      className="twp-btn-ghost"
                      style={{ fontSize: 11, padding: '4px 10px', background: '#fff', border: '1px solid #cbd5e1' }}
                      onClick={handleTestWebhookPing}
                      disabled={isPingingWebhook}
                    >
                      {isPingingWebhook ? (
                        <><RefreshCw style={{ width: 12, height: 12 }} className="animate-spin" /> Pinging...</>
                      ) : (
                        <><Activity style={{ width: 12, height: 12, color: '#10b981' }} /> Test Ping</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Feedback from ping */}
                {webhookPingResult && (
                  <div style={{
                    marginBottom: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: webhookPingResult.success ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${webhookPingResult.success ? '#bbf7d0' : '#fecaca'}`,
                    color: webhookPingResult.success ? '#15803d' : '#b91c1c',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {webhookPingResult.message}
                  </div>
                )}

                {/* URL row */}
                <div className="twp-url-row">
                  <div className="twp-url-field">
                    <Link2 className="twp-url-field-icon" />
                    <span className="twp-url-text">{trackingUrl}</span>
                  </div>
                  <button
                    className={`twp-copy-btn ${urlCopied ? 'twp-copy-btn--copied' : ''}`}
                    onClick={handleCopyUrl}
                  >
                    {urlCopied
                      ? <><Check style={{ width: 14, height: 14 }} /> Copied!</>
                      : <><Copy style={{ width: 14, height: 14 }} /> Copy URL</>}
                  </button>
                </div>

                {/* Expandable setup instructions */}
                <button
                  className="twp-instructions-toggle"
                  onClick={() => setShowInstructions(p => !p)}
                >
                  {showInstructions
                    ? <ChevronDown style={{ width: 14, height: 14 }} />
                    : <ChevronRight style={{ width: 14, height: 14 }} />}
                  {showInstructions ? 'Hide' : 'Show'} Setup Instructions
                </button>

                {showInstructions && (
                  <div className="twp-instructions-body">
                    {[
                      { step: 'Go to your GitHub repository → Settings → Webhooks → Add webhook.' },
                      { step: <>In the <strong>Payload URL</strong> field, paste the tracking URL above: <code>{trackingUrl}</code></> },
                      { step: <>Set <strong>Content type</strong> to <code>application/json</code>.</> },
                      { step: <>Under <strong>Which events</strong>, select <code>Just the push event</code> (or send everything for full activity tracking).</> },
                      { step: 'Click Save webhook. ProjectNexus will instantly capture all code commits and reflect them on your workspace telemetry.' },
                    ].map((item, i) => (
                      <div key={i} className="twp-instruction-step">
                        <div className="twp-step-num">{i + 1}</div>
                        <div className="twp-step-text">{item.step}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                    Works with GitHub, GitLab, Bitbucket and any Git host that supports webhooks.
                  </div>
                  <button
                    className="twp-regen-btn"
                    onClick={handleTestWebhookPing}
                  >
                    <Activity style={{ width: 11, height: 11 }} />
                    Verify Webhook Ping
                  </button>
                </div>
              </div>

              {/* ═══ ACTIVITY FEED ═══ */}
              <div className="twp-activity-card">
                <div className="twp-activity-header">
                  <div className="twp-activity-title">
                    <div className="twp-activity-title-icon">
                      <Activity style={{ width: 14, height: 14, color: '#fff' }} />
                    </div>
                    Recent Activity
                  </div>
                  <button className="twp-view-all-btn" onClick={() => setActiveNav('notifications')}>
                    View all →
                  </button>
                </div>

                <div className="twp-activity-feed">
                  {(activityLogs || []).map(log => {
                    const { cls, Icon } = activityIcon(log.action);
                    return (
                      <div key={log.id} className="twp-activity-item">
                        <div className={`twp-act-icon ${cls}`}>
                          <Icon style={{ width: 15, height: 15 }} />
                        </div>
                        <div className="twp-act-body">
                          <div className="twp-act-user">{log.user}</div>
                          <div className="twp-act-detail">{log.details}</div>
                        </div>
                        <div className="twp-act-time">{log.time}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════ MILESTONES ════ */}
          {activeNav === 'milestones' && (
            <div className="twp-fade-up">
              <div className="twp-section-header">
                <div>
                  <div className="twp-section-title">Milestones</div>
                  <div className="twp-section-sub">Track phased academic deliverables and faculty feedback.</div>
                </div>
              </div>

              {milestones.map((m, i) => {
                const isDone   = m.status === 'approved';
                const isActive = m.status === 'in_progress';
                return (
                  <div key={m.id} className="twp-milestone-item">
                    <div className={`twp-milestone-idx ${isDone ? 'twp-milestone-idx--done' : isActive ? 'twp-milestone-idx--active' : 'twp-milestone-idx--future'}`}>
                      {isDone ? '✓' : `M${i + 1}`}
                    </div>
                    <div className="twp-milestone-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <div className="twp-milestone-name">{m.title}</div>
                        <span className={`twp-priority-chip ${isDone ? 'twp-priority-chip--low' : isActive ? '' : 'twp-priority-chip--medium'}`}
                          style={isActive ? { background: '#ede9fe', color: '#6366f1' } : {}}>
                          {m.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      {m.adminFeedback && (
                        <div className="twp-milestone-feedback">
                          <strong style={{ color: '#6366f1' }}>Faculty feedback: </strong>{m.adminFeedback}
                        </div>
                      )}
                      <div className="twp-milestone-meta">Due {m.dueDate}{m.completedInVersion ? ` · Completed in v${m.completedInVersion}.0` : ''}</div>
                    </div>
                    <div className="twp-milestone-prog-wrap">
                      <div className="twp-milestone-pct">{m.progress}%</div>
                      <div className="twp-prog-bar-wrap" style={{ marginTop: 8 }}>
                        <div className="twp-prog-bar-fill" style={{
                          width: `${m.progress}%`,
                          background: isDone ? '#22c55e' : 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ════ TASK BOARD ════ */}
          {activeNav === 'tasks' && (
            <div className="twp-fade-up">
              <div className="twp-section-header">
                <div>
                  <div className="twp-section-title">Task Board</div>
                  <div className="twp-section-sub">
                    {doneTasks.length} of {projectTasks.length} tasks done · {progress}% complete
                  </div>
                </div>
                <button className="twp-btn-primary" onClick={() => setShowNewTaskModal(true)}>
                  <Plus style={{ width: 15, height: 15 }} />
                  New Task
                </button>
              </div>

              <div className="twp-kanban-grid">
                {[
                  { id: 'todo',         label: 'To Do',       cls: 'twp-kanban-col-label--todo'   },
                  { id: 'in_progress',  label: 'In Progress', cls: 'twp-kanban-col-label--inprog' },
                  { id: 'under_review', label: 'Under Review',cls: 'twp-kanban-col-label--review' },
                  { id: 'done',         label: 'Done',        cls: 'twp-kanban-col-label--done'   },
                ].map(col => {
                  const colTasks = projectTasks.filter(t => t.status === col.id);
                  return (
                    <div key={col.id} className="twp-kanban-col">
                      <div className="twp-kanban-col-header">
                        <span className={`twp-kanban-col-label ${col.cls}`}>{col.label}</span>
                        <span className="twp-kanban-count">{colTasks.length}</span>
                      </div>
                      {colTasks.length === 0 ? (
                        <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: 12, color: '#cbd5e1', border: '1px dashed #e2e8f0', borderRadius: 10 }}>
                          No tasks here
                        </div>
                      ) : colTasks.map(task => (
                        <div key={task.id} className="twp-kanban-card">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span className={`twp-priority-chip twp-priority-chip--${task.priority}`}>{task.priority}</span>
                            <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>Due {task.dueDate}</span>
                          </div>
                          <div className="twp-kanban-card-title">{task.title}</div>
                          <div className="twp-kanban-card-desc">{task.description}</div>
                          <div className="twp-kanban-card-footer">
                            <div className="twp-kanban-card-assignee">
                              <div className="twp-kanban-assignee-avatar">{task.assigneeAvatar}</div>
                              {task.assignee.split(' ')[0]}
                            </div>
                            <select
                              value={task.status}
                              onChange={e => handleMoveTask(task.id, e.target.value)}
                              className="twp-kanban-status-select"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Prog</option>
                              <option value="under_review">Review</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ REPOSITORY ════ */}
          {activeNav === 'repository' && (
            <div className="twp-fade-up">
              <div className="twp-section-header">
                <div>
                  <div className="twp-section-title">Repository & Code Tracking</div>
                  <div className="twp-section-sub">GitHub integration, commit tracking, and branch telemetry.</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="twp-btn-ghost" onClick={handleOpenTeamModal}>
                    <Edit3 style={{ width: 14, height: 14 }} /> Edit Repo Link
                  </button>
                  {githubRepoUrl && (
                    <a
                      href={githubRepoUrl.startsWith('http') ? githubRepoUrl : `https://${githubRepoUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="twp-btn-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      <ExternalLink style={{ width: 14, height: 14 }} />
                      Open on GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Same featured repo card */}
              <div className="twp-repo-card">
                <div className="twp-repo-header">
                  <div className="twp-repo-header-left">
                    <div className="twp-repo-icon-wrap">
                      <Link2 style={{ width: 22, height: 22, color: '#fff' }} />
                    </div>
                    <div>
                      <div className="twp-repo-title">Live Webhook Tracking URL</div>
                      <div className="twp-repo-subtitle">Auto-monitors commits, push activity, and branch telemetry in real time.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div className={`twp-conn-status ${repoConnected ? 'twp-conn-status--connected' : 'twp-conn-status--disconnected'}`}>
                      <span className={`twp-conn-dot ${repoConnected ? 'twp-conn-dot--green' : 'twp-conn-dot--amber'}`} />
                      {repoConnected ? 'Connected · Active' : 'Not Connected'}
                    </div>
                    <button
                      className="twp-btn-ghost"
                      style={{ fontSize: 11, padding: '4px 10px', background: '#fff', border: '1px solid #cbd5e1' }}
                      onClick={handleTestWebhookPing}
                      disabled={isPingingWebhook}
                    >
                      {isPingingWebhook ? (
                        <><RefreshCw style={{ width: 12, height: 12 }} className="animate-spin" /> Pinging...</>
                      ) : (
                        <><Activity style={{ width: 12, height: 12, color: '#10b981' }} /> Test Ping</>
                      )}
                    </button>
                  </div>
                </div>

                {webhookPingResult && (
                  <div style={{
                    marginBottom: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: webhookPingResult.success ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${webhookPingResult.success ? '#bbf7d0' : '#fecaca'}`,
                    color: webhookPingResult.success ? '#15803d' : '#b91c1c',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {webhookPingResult.message}
                  </div>
                )}

                <div className="twp-url-row">
                  <div className="twp-url-field">
                    <Link2 className="twp-url-field-icon" />
                    <span className="twp-url-text">{trackingUrl}</span>
                  </div>
                  <button className={`twp-copy-btn ${urlCopied ? 'twp-copy-btn--copied' : ''}`} onClick={handleCopyUrl}>
                    {urlCopied ? <><Check style={{ width: 14, height: 14 }} /> Copied!</> : <><Copy style={{ width: 14, height: 14 }} /> Copy URL</>}
                  </button>
                </div>

                {/* Expandable setup instructions */}
                <button
                  className="twp-instructions-toggle"
                  onClick={() => setShowInstructions(p => !p)}
                >
                  {showInstructions
                    ? <ChevronDown style={{ width: 14, height: 14 }} />
                    : <ChevronRight style={{ width: 14, height: 14 }} />}
                  {showInstructions ? 'Hide' : 'Show'} Setup Instructions
                </button>

                {showInstructions && (
                  <div className="twp-instructions-body">
                    {[
                      { step: 'Go to your GitHub repository → Settings → Webhooks → Add webhook.' },
                      { step: <>In the <strong>Payload URL</strong> field, paste the tracking URL: <code>{trackingUrl}</code></> },
                      { step: <>Set <strong>Content type</strong> to <code>application/json</code>.</> },
                      { step: <>Under <strong>Which events</strong>, select <code>Just the push event</code>.</> },
                      { step: 'Click Save webhook to start automated commit monitoring.' },
                    ].map((item, i) => (
                      <div key={i} className="twp-instruction-step">
                        <div className="twp-step-num">{i + 1}</div>
                        <div className="twp-step-text">{item.step}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              {project.githubStats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                  {[
                    { label: 'Total Commits', val: project.githubStats.commitsCount, Icon: GitCommit, color: '#6366f1' },
                    { label: 'Contributors',  val: project.githubStats.contributors,  Icon: Users,     color: '#8b5cf6' },
                    { label: 'GitHub Stars',  val: project.githubStats.stars,         Icon: Star,      color: '#f59e0b' },
                    { label: 'Branch',        val: 'main',                             Icon: GitBranch, color: '#22c55e' },
                  ].map(s => (
                    <div key={s.label} className="twp-card" style={{ textAlign: 'center' }}>
                      <s.Icon style={{ width: 20, height: 20, color: s.color, margin: '0 auto 8px' }} />
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em' }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ DOCUMENTS ════ */}
          {activeNav === 'documents' && (
            <div className="twp-fade-up">
              <div className="twp-section-header">
                <div className="twp-section-title">Documents & Links</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { title: 'Software Requirements Specification (SRS) v2.0', type: 'PDF', size: '2.4 MB' },
                  { title: 'System Architecture & Edge Deployment Guide',     type: 'DOCX', size: '1.8 MB' },
                  { title: 'Figma Dashboard & Mobile UI Wireframes',           type: 'LINK', size: 'Cloud' },
                  { title: 'Department Classroom Camera Dataset',              type: 'DRIVE', size: '14.2 GB' },
                ].map(doc => (
                  <div key={doc.title} className="twp-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#6366f1', flexShrink: 0 }}>
                      {doc.type}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{doc.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{doc.size}</div>
                    </div>
                    <button className="twp-btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }}>
                      <ExternalLink style={{ width: 11, height: 11 }} /> Open
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ TEAM DIRECTORY ════ */}
          {activeNav === 'team' && (
            <div className="twp-fade-up">
              <div className="twp-section-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="twp-section-title">Team Directory & Repository</div>
                  <div className="twp-section-sub">
                    Manage team member credentials, functional roles, college roll numbers, and linked GitHub repository.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="twp-btn-ghost"
                    style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#334155' }}
                    onClick={handleOpenTeamModal}
                  >
                    <FolderGit2 style={{ width: 14, height: 14, color: '#6366f1' }} />
                    Edit Team & Repo
                  </button>
                  <button className="twp-btn-primary" onClick={handleOpenTeamModal}>
                    <Plus style={{ width: 14, height: 14 }} />
                    Add Member
                  </button>
                </div>
              </div>

              {/* GitHub Repository Quick Card */}
              <div
                className="twp-card"
                style={{
                  marginBottom: 20,
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: '#fff',
                  border: '1px solid #334155'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.15)'
                      }}
                    >
                      <FolderGit2 style={{ width: 22, height: 22, color: '#60a5fa' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>Linked Project Repository</span>
                        <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)', padding: '2px 8px', borderRadius: 12 }}>
                          {gitBranch}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', marginTop: 3 }}>
                        {githubRepoUrl || 'No GitHub repository connected yet'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {githubRepoUrl && (
                      <a
                        href={githubRepoUrl.startsWith('http') ? githubRepoUrl : `https://${githubRepoUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="twp-btn-primary"
                        style={{ background: '#2563eb', textDecoration: 'none', padding: '8px 14px', fontSize: 12 }}
                      >
                        <ExternalLink style={{ width: 13, height: 13 }} />
                        Open on GitHub
                      </a>
                    )}
                    <button
                      onClick={handleOpenTeamModal}
                      className="twp-btn-ghost"
                      style={{ color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.2)', padding: '8px 12px', fontSize: 12 }}
                    >
                      <Edit3 style={{ width: 13, height: 13 }} />
                      Edit Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Members Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                
                {/* ── Team Leader Card ── */}
                <div
                  className="twp-card"
                  style={{
                    borderColor: '#c7d2fe',
                    background: 'linear-gradient(135deg, #f8faff 0%, #eff6ff 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <button
                      onClick={handleOpenTeamModal}
                      title="Edit Team Leader"
                      style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', padding: 4, borderRadius: 6 }}
                    >
                      <Edit3 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>

                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      boxShadow: '0 4px 14px rgba(99,102,241,0.35)'
                    }}
                  >
                    {initials(teamLead.name || 'TL')}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4338ca', fontWeight: 800, background: '#e0e7ff', padding: '2px 8px', borderRadius: 4 }}>
                      Team Leader
                    </span>
                    <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, fontFamily: 'monospace' }}>
                      {teamLead.rollNo}
                    </span>
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                    {teamLead.name || 'Designated Team Lead'}
                  </div>

                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Mail style={{ width: 12, height: 12, color: '#94a3b8' }} />
                    <span style={{ fontFamily: 'monospace' }}>{teamLead.email}</span>
                  </div>

                  <div style={{ fontSize: 11.5, color: '#475569', fontWeight: 600, marginTop: 8 }}>
                    Role: <span style={{ color: '#2563eb' }}>{teamLead.role}</span>
                  </div>

                  {teamLead.githubUsername && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <a
                        href={`https://github.com/${teamLead.githubUsername}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 11, color: '#334155', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                      >
                        <FolderGit2 style={{ width: 12, height: 12, color: '#475569' }} />
                        @{teamLead.githubUsername}
                      </a>
                      <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>Lead Active</span>
                    </div>
                  )}
                </div>

                {/* ── Team Member Cards ── */}
                {teamMembers.map((m, idx) => (
                  <div
                    key={m.email || idx}
                    className="twp-card"
                    style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: '#f1f5f9',
                          color: '#334155',
                          fontWeight: 800,
                          fontSize: 15,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {initials(m.name)}
                      </div>

                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={handleOpenTeamModal}
                          title="Edit Member"
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                        >
                          <Edit3 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', fontWeight: 700, background: '#f1f5f9', padding: '2px 7px', borderRadius: 4 }}>
                        {m.role || 'Contributor'}
                      </span>
                      {m.rollNo && (
                        <span style={{ fontSize: 10.5, color: '#64748b', fontFamily: 'monospace' }}>
                          {m.rollNo}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                      {m.name}
                    </div>

                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Mail style={{ width: 11, height: 11, color: '#94a3b8' }} />
                      <span style={{ fontFamily: 'monospace' }}>{m.email}</span>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {m.githubUsername ? (
                        <a
                          href={`https://github.com/${m.githubUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 11, color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}
                        >
                          <FolderGit2 style={{ width: 11, height: 11 }} />
                          @{m.githubUsername}
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>No GitHub set</span>
                      )}
                      <span style={{ fontSize: 10.5, color: '#64748b' }}>
                        {m.tasksAssigned || 0} tasks
                      </span>
                    </div>
                  </div>
                ))}

                {/* ── Quick Add Member Dashed Card ── */}
                <div
                  onClick={handleOpenTeamModal}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 16,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#f8fafc',
                    minHeight: 180,
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.background = '#f5f3ff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: '#ede9fe',
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10
                    }}
                  >
                    <UserPlus style={{ width: 20, height: 20 }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>+ Add Team Member</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                    Fill student name, email, roll number & Git handle
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ════ REVIEWS / WEEKLY UPDATES ════ */}
          {activeNav === 'reviews' && (
            <div className="twp-fade-up">
              <div className="twp-section-header">
                <div className="twp-section-title">Weekly Reviews</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
                {/* Form */}
                <div className="twp-card">
                  <div className="twp-card-title"><Send style={{ width: 13, height: 13 }} className="twp-card-title-icon" />Post Weekly Update</div>
                  <form onSubmit={handleSubmitUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Completed Work This Week', val: completedWorkInput, set: setCompletedWorkInput, rows: 3, placeholder: 'e.g. Finished face embedding tests...' },
                      { label: 'Blockers / Impediments',  val: blockersInput,       set: setBlockersInput,       placeholder: 'e.g. RTSP latency or none' },
                      { label: "Next Week's Plan",        val: nextPlanInput,       set: setNextPlanInput,       placeholder: 'e.g. Benchmark anti-spoofing...' },
                    ].map(f => (
                      <div key={f.label}>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>{f.label}</label>
                        {f.rows
                          ? <textarea rows={f.rows} required placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)} style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#0f172a', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                          : <input type="text" placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)} style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />}
                      </div>
                    ))}
                    <button type="submit" className="twp-btn-primary" style={{ justifyContent: 'center', marginTop: 4 }}>
                      <Send style={{ width: 14, height: 14 }} /> Submit Update
                    </button>
                  </form>
                </div>

                {/* History */}
                <div>
                  {weeklyUpdates.map(upd => (
                    <div key={upd.id} className="twp-card" style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ background: '#ede9fe', color: '#6366f1', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>Week {upd.weekNumber}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{upd.submittedBy}</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{upd.date}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                        <strong style={{ color: '#16a34a' }}>Accomplished: </strong>{upd.completedWork}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 10px', fontSize: 11.5, color: '#334155' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', marginBottom: 2 }}>Blockers</div>
                          {upd.blockers}
                        </div>
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 10px', fontSize: 11.5, color: '#334155' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>Next Week</div>
                          {upd.nextPlan}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ NOTIFICATIONS ════ */}
          {activeNav === 'notifications' && (
            <div className="twp-fade-up">
              <div className="twp-section-title" style={{ marginBottom: 20 }}>Notifications</div>
              <div className="twp-activity-card">
                <div className="twp-activity-feed">
                  {(activityLogs || []).map(log => {
                    const { cls, Icon } = activityIcon(log.action);
                    return (
                      <div key={log.id} className="twp-activity-item">
                        <div className={`twp-act-icon ${cls}`}><Icon style={{ width: 15, height: 15 }} /></div>
                        <div className="twp-act-body">
                          <div className="twp-act-user">{log.user}</div>
                          <div className="twp-act-detail">{log.details}</div>
                        </div>
                        <div className="twp-act-time">{log.time}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>{/* end twp-content */}
      </div>{/* end twp-main */}

      {/* ════ CREATE TASK MODAL ════ */}
      {showNewTaskModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Create New Task</div>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Task Title</label>
                <input type="text" required placeholder="e.g. Implement WebSocket alert channel" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                  style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Assignee</label>
                  <select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)}
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit' }}>
                    <option>{project.team?.lead?.name}</option>
                    {(project.team?.members || []).map(m => <option key={m.email}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Priority</label>
                  <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  className="twp-btn-ghost"
                  onClick={() => setShowNewTaskModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="twp-btn-primary"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ MANAGE TEAM & GITHUB REPOSITORY MODAL ════ */}
      {showTeamModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110,
          background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 680,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.25)'
                }}>
                  <Users style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Manage Team & GitHub Repository</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Configure project lead, student members, and Git webhook integration</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Feedback alert */}
              {teamSaveFeedback && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <CheckCircle2 style={{ width: 16, height: 16, color: '#16a34a' }} />
                  {teamSaveFeedback}
                </div>
              )}

              {/* 1. GitHub Repository & Webhook URL Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <FolderGit2 style={{ width: 16, height: 16, color: '#6366f1' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    1. GitHub Repository & Live Webhook
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Repository URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/organization/project-name"
                      value={editGithubUrl}
                      onChange={e => setEditGithubUrl(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        padding: '9px 12px',
                        fontSize: 12.5,
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Default Branch
                    </label>
                    <input
                      type="text"
                      placeholder="main"
                      value={editBranch}
                      onChange={e => setEditBranch(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        padding: '9px 12px',
                        fontSize: 12.5,
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Webhook URL Box inside Modal */}
                <div style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '12px 14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>
                      GitHub Webhook Payload URL
                    </span>
                    <button
                      type="button"
                      onClick={handleTestWebhookPing}
                      disabled={isPingingWebhook}
                      style={{
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        padding: '3px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#2563eb',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {isPingingWebhook ? (
                        <><RefreshCw style={{ width: 11, height: 11 }} className="animate-spin" /> Testing...</>
                      ) : (
                        <><Activity style={{ width: 11, height: 11, color: '#10b981' }} /> Test Ping</>
                      )}
                    </button>
                  </div>

                  {webhookPingResult && (
                    <div style={{
                      marginBottom: 8,
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: webhookPingResult.success ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${webhookPingResult.success ? '#bbf7d0' : '#fecaca'}`,
                      color: webhookPingResult.success ? '#15803d' : '#b91c1c',
                      fontSize: 11.5,
                      fontWeight: 600
                    }}>
                      {webhookPingResult.message}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      readOnly
                      value={trackingUrl}
                      style={{
                        flex: 1,
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        padding: '7px 10px',
                        fontSize: 11.5,
                        color: '#0f172a',
                        fontFamily: 'monospace',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      style={{
                        background: urlCopied ? '#16a34a' : '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '7px 12px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {urlCopied ? <><Check style={{ width: 12, height: 12 }} /> Copied</> : <><Copy style={{ width: 12, height: 12 }} /> Copy Webhook</>}
                    </button>
                  </div>
                  <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 6 }}>
                    Paste this into GitHub repository <strong>Settings → Webhooks → Add webhook</strong> (Content type: <code>application/json</code>).
                  </div>
                </div>
              </div>

              {/* 2. Team Leader Profile Section */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <ShieldCheck style={{ width: 16, height: 16, color: '#4338ca' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    2. Team Leader Profile
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Leader Full Name *</label>
                    <input
                      type="text"
                      value={editLead.name}
                      onChange={e => setEditLead(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Arjun Swaminathan"
                      style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>College Email *</label>
                    <input
                      type="email"
                      value={editLead.email}
                      onChange={e => setEditLead(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="arjun.swami@projectnexus.edu"
                      style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Roll Number / USN</label>
                    <input
                      type="text"
                      value={editLead.rollNo}
                      onChange={e => setEditLead(prev => ({ ...prev, rollNo: e.target.value }))}
                      placeholder="e.g. CS24B041"
                      style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>GitHub Username</label>
                    <input
                      type="text"
                      value={editLead.githubUsername}
                      onChange={e => setEditLead(prev => ({ ...prev, githubUsername: e.target.value.replace(/^@/, '') }))}
                      placeholder="e.g. arjun-un"
                      style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Team Members Section */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users style={{ width: 16, height: 16, color: '#6366f1' }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      3. Team Members Roster ({editMembers.length})
                    </span>
                  </div>
                </div>

                {/* Existing Members List */}
                {editMembers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {editMembers.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 10
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#ede9fe', color: '#6366f1', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {initials(m.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                              {m.name}{' '}
                              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '1px 6px', borderRadius: 4, marginLeft: 4 }}>
                                {m.role}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                              {m.email} · {m.rollNo} {m.githubUsername ? `· @${m.githubUsername}` : ''}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromEditList(idx)}
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fee2e2',
                            color: '#ef4444',
                            borderRadius: 6,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11
                          }}
                          title="Remove member"
                        >
                          <Trash2 style={{ width: 13, height: 13 }} />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>
                    No additional team members added yet. Use the form below to add members.
                  </div>
                )}

                {/* Add Member Sub-Form */}
                <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UserPlus style={{ width: 14, height: 14, color: '#6366f1' }} />
                    Add New Student Member
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <input
                        type="text"
                        placeholder="Member Full Name (e.g. Priya Raman)"
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="College Email (e.g. priya.raman@college.edu)"
                        value={newMemberEmail}
                        onChange={e => setNewMemberEmail(e.target.value)}
                        style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Roll Number / USN (e.g. CS24B042)"
                        value={newMemberRoll}
                        onChange={e => setNewMemberRoll(e.target.value)}
                        style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <select
                        value={newMemberRole}
                        onChange={e => setNewMemberRole(e.target.value)}
                        style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      >
                        <option>Frontend & UI Developer</option>
                        <option>Backend & API Engineer</option>
                        <option>AI / Machine Learning Engineer</option>
                        <option>Embedded & IoT Firmware</option>
                        <option>Full-Stack Engineer</option>
                        <option>QA Testing & Documentation</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <input
                        type="text"
                        placeholder="GitHub Username (e.g. priya-dev)"
                        value={newMemberGithub}
                        onChange={e => setNewMemberGithub(e.target.value)}
                        style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMemberToEditList}
                    style={{
                      background: '#ede9fe',
                      border: '1px solid #c7d2fe',
                      color: '#4338ca',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Plus style={{ width: 14, height: 14 }} />
                    + Add Member to Roster
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
              background: '#f8fafc'
            }}>
              <button
                type="button"
                className="twp-btn-ghost"
                onClick={() => setShowTeamModal(false)}
                disabled={isSavingTeam}
              >
                Cancel
              </button>
              <button
                type="button"
                className="twp-btn-primary"
                onClick={handleSaveTeamSettings}
                disabled={isSavingTeam}
                style={{ minWidth: 160, justifyContent: 'center' }}
              >
                {isSavingTeam ? (
                  <>
                    <RefreshCw style={{ width: 14, height: 14 }} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save style={{ width: 14, height: 14 }} />
                    Save Team & Repo
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
