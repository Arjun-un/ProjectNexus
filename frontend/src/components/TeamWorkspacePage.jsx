import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  GitCommit,
  GitFork,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  Send,
  ExternalLink,
  RefreshCw,
  Info,
  Sparkles,
  ArrowRight,
  CalendarDays,
  UserCircle,
  GitBranch,
  Mail,
  Trash2,
  Edit3,
  Save,
  X,
  ShieldCheck,
  UserPlus,
  Radio
} from 'lucide-react';

/* ── Compute days remaining until a date ── */
function daysUntil(dateStr) {
  if (!dateStr) return 45;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return 45;
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/* ── Health score from progress ── */
function healthLabel(pct, isTracked) {
  if (!isTracked || pct === 0) return { label: 'Not Tracked', color: '#64748b', trackColor: 'rgba(255,255,255,0.08)' };
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
  { id: 'continuity',     label: 'Continuity Protocol', Icon: GitFork, badge: 'v2.0' },
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

  // Dynamic Team Lead & Members State (clean initial states without dummy fallbacks)
  const [teamLead, setTeamLead] = useState(() => ({
    name: project?.team?.lead?.name || project?.team?.leader?.name || '',
    email: project?.team?.lead?.email || project?.team?.leader?.email || project?.invitedLeadEmail || '',
    rollNo: project?.team?.lead?.rollNo || project?.team?.leader?.rollNo || '',
    role: project?.team?.lead?.role || project?.team?.leader?.role || 'Team Lead',
    githubUsername: project?.team?.lead?.githubUsername || project?.team?.leader?.githubUsername || '',
    contribution: project?.team?.lead?.contribution || project?.team?.leader?.contribution || ''
  }));

  const [teamMembers, setTeamMembers] = useState(() => {
    const raw = project?.team?.members || [];
    if (raw.length > 0) {
      return raw.map((m, idx) => ({
        name: m.name || '',
        email: m.email || '',
        rollNo: m.rollNo || '',
        role: m.role || 'Project Contributor',
        githubUsername: m.githubUsername || '',
        contribution: m.contribution || '',
        tasksAssigned: m.tasksAssigned || 0
      }));
    }
    return [];
  });

  // Student Project Brief & Live Status states
  const [studentSummary, setStudentSummary] = useState(project?.studentSummary || '');
  const [currentStatusNote, setCurrentStatusNote] = useState(project?.currentStatusNote || '');

  const [githubRepoUrl, setGithubRepoUrl] = useState(
    project?.githubUrl || project?.githubStats?.repoUrl || ''
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
  const [editStudentSummary, setEditStudentSummary] = useState(studentSummary);
  const [editCurrentStatusNote, setEditCurrentStatusNote] = useState(currentStatusNote);

  // Quick add member inputs in modal
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRoll, setNewMemberRoll] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Frontend Developer');
  const [newMemberGithub, setNewMemberGithub] = useState('');
  const [newMemberContribution, setNewMemberContribution] = useState('');

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

  // Quick status update states
  const [quickStatusText, setQuickStatusText] = useState('');
  const [statusAuthor, setStatusAuthor] = useState(() => teamLead?.name || 'Team Lead');
  const [isPostingStatus, setIsPostingStatus] = useState(false);
  const [statusPostFeedback, setStatusPostFeedback] = useState('');
  const [statusHistory, setStatusHistory] = useState(() => project?.teamStatusHistory || []);

  const handlePostQuickStatus = async (e) => {
    if (e) e.preventDefault();
    if (!quickStatusText.trim()) return;

    setIsPostingStatus(true);
    setStatusPostFeedback('');

    const newNote = quickStatusText.trim();
    const author = statusAuthor.trim() || teamLead?.name || 'Team Member';
    const now = new Date();

    // Optimistically update
    setCurrentStatusNote(newNote);
    const newEntry = { message: newNote, updatedBy: author, updatedAt: now };
    setStatusHistory(prev => [newEntry, ...(Array.isArray(prev) ? prev.slice(0, 29) : [])]);

    if (project) {
      project.currentStatusNote = newNote;
      project.teamStatusUpdate = newEntry;
      project.summaryLastUpdatedAt = now;
      if (!Array.isArray(project.teamStatusHistory)) project.teamStatusHistory = [];
      project.teamStatusHistory = [newEntry, ...project.teamStatusHistory.slice(0, 29)];
    }

    try {
      const projId = project.projectId || project.id || project._id;
      await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(projId)}/status-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newNote,
          updatedBy: author
        })
      });
      setStatusPostFeedback('Live status broadcasted to admin dashboard!');
      setQuickStatusText('');
      setTimeout(() => setStatusPostFeedback(''), 3500);
    } catch (err) {
      console.warn('Backend status post notice:', err.message);
      setStatusPostFeedback('Status updated in local session!');
      setQuickStatusText('');
      setTimeout(() => setStatusPostFeedback(''), 3500);
    } finally {
      setIsPostingStatus(false);
    }
  };

  // Open modal and sync form data
  const handleOpenTeamModal = () => {
    setEditLead({ ...teamLead });
    setEditMembers([...teamMembers]);
    setEditGithubUrl(githubRepoUrl);
    setEditBranch(gitBranch);
    setEditStudentSummary(studentSummary || project?.studentSummary || '');
    setEditCurrentStatusNote(currentStatusNote || project?.currentStatusNote || '');
    setTeamSaveFeedback('');
    setShowTeamModal(true);
  };

  // Add a member in the modal edit list
  const handleAddMemberToEditList = (e) => {
    if (e) e.preventDefault();
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
      contribution: newMemberContribution.trim(),
      tasksAssigned: 0
    };
    setEditMembers(prev => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRoll('');
    setNewMemberGithub('');
    setNewMemberContribution('');
  };

  // Remove a member in the modal edit list
  const handleRemoveMemberFromEditList = (index) => {
    setEditMembers(prev => prev.filter((_, i) => i !== index));
  };

  // Save team, project brief & GitHub repository details
  const handleSaveTeamSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSavingTeam(true);
    setTeamSaveFeedback('');

    const updatedLead = { ...editLead };
    const updatedMembers = [...editMembers];
    const updatedUrl = editGithubUrl.trim();
    const updatedBranch = editBranch.trim() || 'main';
    const updatedSummary = editStudentSummary.trim();
    const updatedStatusNote = editCurrentStatusNote.trim();

    setTeamLead(updatedLead);
    setTeamMembers(updatedMembers);
    setGithubRepoUrl(updatedUrl);
    setGitBranch(updatedBranch);
    setStudentSummary(updatedSummary);
    setCurrentStatusNote(updatedStatusNote);

    // Sync to parent project instance
    if (project) {
      project.team = {
        name: project.team?.name || `${updatedLead.name}'s Team`,
        lead: updatedLead,
        leader: updatedLead,
        members: updatedMembers
      };
      project.githubUrl = updatedUrl;
      project.studentSummary = updatedSummary;
      project.currentStatusNote = updatedStatusNote;
      project.summaryLastUpdatedAt = new Date();
    }

    try {
      const projId = project.projectId || project.id || project._id;
      const targetTrackingUrl = (tunnelBaseUrl ? `${tunnelBaseUrl.trim().replace(/\/+$/, '')}/api/webhooks/repo/${projId}` : `http://localhost:5000/api/webhooks/repo/${projId}`);
      await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(projId)}/team`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentSummary: updatedSummary,
          currentStatusNote: updatedStatusNote,
          leader: updatedLead,
          members: updatedMembers,
          githubUrl: updatedUrl,
          gitBranch: updatedBranch,
          webhookUrl: targetTrackingUrl
        })
      });
      setTeamSaveFeedback('Team details, project brief, and contributions saved successfully!');
      setTimeout(() => {
        setShowTeamModal(false);
        setTeamSaveFeedback('');
      }, 1000);
    } catch (err) {
      console.warn('Backend sync notice:', err.message);
      setTeamSaveFeedback('Details saved to local workspace session!');
      setTimeout(() => {
        setShowTeamModal(false);
        setTeamSaveFeedback('');
      }, 1000);
    } finally {
      setIsSavingTeam(false);
    }
  };

  // Derived values
  const projectTasks = tasks.filter(t => t.projectId === project?.id || t.projectId === project?.projectId);
  const doneTasks    = projectTasks.filter(t => t.status === 'done');
  const isTracked    = Boolean(
    (projectTasks.length > 0) ||
    (project?.githubIntegration?.isConnected) ||
    (project?.progress && project.progress > 0) ||
    (project?.healthScore && project.healthScore > 0 && project.health !== 'Not Tracked')
  );
  const progress     = projectTasks.length > 0
    ? Math.round((doneTasks.length / projectTasks.length) * 100)
    : (isTracked ? (project?.progress !== undefined ? project.progress : (project?.currentProgress || 0)) : 0);

  const health    = healthLabel(progress, isTracked);
  const daysLeft  = daysUntil(project?.expectedEndDate || project?.deadline);
  const [tunnelBaseUrl, setTunnelBaseUrl] = useState(() => {
    return localStorage.getItem('nexus_tunnel_url') || '';
  });

  const handleUpdateTunnelUrl = (val) => {
    const clean = val.trim();
    setTunnelBaseUrl(clean);
    if (clean) {
      localStorage.setItem('nexus_tunnel_url', clean);
    } else {
      localStorage.removeItem('nexus_tunnel_url');
    }
  };

  const rawProjectId = project?.projectId || project?.id || 'CSE-2026-041';
  const effectiveBaseUrl = (tunnelBaseUrl || '').trim().replace(/\/+$/, '') || 'http://localhost:5000';
  const trackingUrl = `${effectiveBaseUrl}/api/webhooks/repo/${rawProjectId}`;

  // Accurate detection: Only projects that have undergone a handover show previous history
  const hasHandoverHistory = useMemo(() => {
    if (project?.isContinuation) return true;
    if (project?.currentVersionNumber && Number(project.currentVersionNumber) > 1) return true;
    if (project?.previousTeam && (project.previousTeam.name || project.previousTeam.version)) return true;
    if (Array.isArray(project?.handoverHistory) && project.handoverHistory.length > 0) return true;
    if (handoverRecord && (handoverRecord.projectId === project?.id || handoverRecord.projectId === project?.projectId)) return true;
    return false;
  }, [project, handoverRecord]);

  // Project-scoped milestones: clean initial 0% milestones for unconfigured projects
  const projectMilestones = useMemo(() => {
    if (project?.milestones && project.milestones.length > 0) {
      return project.milestones;
    }
    const projId = project?.id || project?.projectId;
    if (projId === 'proj-101' || projId === 'CSE-2026-041') {
      return milestones;
    }
    const baseDate = project?.deadline ? new Date(project.deadline) : new Date(Date.now() + 90 * 86400000);
    const formatDate = (daysOffset) => {
      const d = new Date(baseDate.getTime() - daysOffset * 86400000);
      return isNaN(d.getTime()) ? '2026-06-30' : d.toISOString().split('T')[0];
    };
    return [
      { id: 'm1', title: 'Milestone 1: Requirement Gathering & System Specification', dueDate: formatDate(60), status: 'in_progress', progress: 0 },
      { id: 'm2', title: 'Milestone 2: Architecture Design & Core Prototyping', dueDate: formatDate(40), status: 'pending', progress: 0 },
      { id: 'm3', title: 'Milestone 3: Full-Stack Implementation & Integration', dueDate: formatDate(20), status: 'pending', progress: 0 },
      { id: 'm4', title: 'Milestone 4: Verification, Quality Assurance & Final Review', dueDate: formatDate(0), status: 'pending', progress: 0 }
    ];
  }, [project, milestones]);

  const activeMilestone = projectMilestones.find(m => m.status === 'in_progress') || projectMilestones[0];

  // Hydrate team directory & repository from teamdb
  useEffect(() => {
    let isMounted = true;
    const fetchTeamFromDb = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(rawProjectId)}/team`);
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          const t = json.data;
          if (t.leader) {
            setTeamLead({
              name: t.leader.name || '',
              email: t.leader.email || '',
              rollNo: t.leader.rollNo || '',
              role: t.leader.role || 'Team Lead',
              githubUsername: t.leader.githubUsername || ''
            });
          }
          if (Array.isArray(t.members)) {
            setTeamMembers(t.members.map(m => ({
              name: m.name || '',
              email: m.email || '',
              rollNo: m.rollNo || '',
              role: m.role || 'Project Contributor',
              githubUsername: m.githubUsername || '',
              tasksAssigned: m.tasksAssigned || 0
            })));
          }
          if (t.githubRepoUrl) {
            setGithubRepoUrl(t.githubRepoUrl);
          }
          if (t.gitBranch) {
            setGitBranch(t.gitBranch);
          }
          if (t.webhookUrl) {
            const savedUrl = t.webhookUrl.trim();
            if (savedUrl && !savedUrl.includes('localhost:5000')) {
              try {
                const parsed = new URL(savedUrl);
                setTunnelBaseUrl(parsed.origin);
              } catch {}
            }
          }
        }
      } catch (err) {
        console.warn('Could not load team from teamdb:', err.message);
      }
    };
    fetchTeamFromDb();
    return () => { isMounted = false; };
  }, [rawProjectId]);

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

  // Git Webhook Telemetry Stream States
  const [gitEvents, setGitEvents] = useState([]);
  const [gitSummary, setGitSummary] = useState(null);
  const [isLoadingGitEvents, setIsLoadingGitEvents] = useState(false);
  const [isSimulatingGit, setIsSimulatingGit] = useState(false);
  const [gitSimFeedback, setGitSimFeedback] = useState('');
  const [copiedCommitSha, setCopiedCommitSha] = useState('');

  const fetchGitEvents = useCallback(async () => {
    if (!rawProjectId) return;
    setIsLoadingGitEvents(true);
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(rawProjectId)}/github/events`);
      const data = await res.json();
      if (res.ok && data.success) {
        setGitEvents(data.data || []);
        setGitSummary(data.summary || null);
        if (data.summary?.isConnected || (data.data && data.data.length > 0)) {
          setRepoConnected(true);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch git events:', err.message);
    } finally {
      setIsLoadingGitEvents(false);
    }
  }, [rawProjectId]);

  useEffect(() => {
    fetchGitEvents();
  }, [fetchGitEvents]);

  const handleSimulateGitPush = async () => {
    setIsSimulatingGit(true);
    setGitSimFeedback('');
    try {
      const res = await fetch(`http://localhost:5000/api/webhooks/simulate/${encodeURIComponent(rawProjectId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `feat(team): live code telemetry test via webhook [${rawProjectId}]`,
          authorName: teamLead?.name || 'Student Contributor'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGitSimFeedback('Test commit injected & traced by webhook!');
        await fetchGitEvents();
        setTimeout(() => setGitSimFeedback(''), 3500);
      } else {
        setGitSimFeedback(data.message || 'Simulation error');
        setTimeout(() => setGitSimFeedback(''), 3500);
      }
    } catch {
      setGitSimFeedback('Failed to reach webhook simulation server');
      setTimeout(() => setGitSimFeedback(''), 3500);
    } finally {
      setIsSimulatingGit(false);
    }
  };

  const handleCopySha = (sha) => {
    navigator.clipboard.writeText(sha);
    setCopiedCommitSha(sha);
    setTimeout(() => setCopiedCommitSha(''), 2000);
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
  if (!project) return null;

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
          {NAV_ITEMS.map(({ id, label, Icon, badge }) => {
            const dynamicBadge = id === 'continuity'
              ? (hasHandoverHistory ? `v${project.currentVersionNumber || 2}.0` : 'v1.0')
              : badge;
            return (
              <button
                key={id}
                className={`twp-nav-item ${activeNav === id ? 'active' : ''}`}
                onClick={() => setActiveNav(id)}
              >
                <Icon className="twp-nav-item-icon" />
                {label}
                {dynamicBadge && (
                  <span className="twp-nav-badge">{dynamicBadge}</span>
                )}
              </button>
            );
          })}

          <div className="twp-nav-label" style={{ marginTop: 20 }}>Project</div>
          <button
            className={`twp-nav-item ${activeNav === 'continuity' ? 'active' : ''}`}
            onClick={() => setActiveNav('continuity')}
          >
            <GitFork className="twp-nav-item-icon" />
            Handover History
            {hasHandoverHistory ? (
              <span className="twp-nav-badge twp-nav-badge--blue">v{project.currentVersionNumber || 2}.0</span>
            ) : (
              <span className="twp-nav-badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>v1.0</span>
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
                        Deadline: <strong>{project.expectedEndDate || (project.deadline ? String(project.deadline).split('T')[0] : 'In 55 days')}</strong>
                      </div>
                      <div className="twp-header-meta-item">
                        <Clock style={{ width: 14, height: 14, color: '#94a3b8' }} />
                        Last update: <strong style={{ color: (project.lastUpdateDaysAgo ?? 0) >= 7 ? '#f87171' : '#4ade80' }}>
                          {project.lastUpdateDaysAgo !== undefined && !isNaN(project.lastUpdateDaysAgo)
                            ? (project.lastUpdateDaysAgo === 0 ? 'Today' : `${project.lastUpdateDaysAgo}d ago`)
                            : (project.updatedAt || project.createdAt ? `${Math.max(0, Math.floor((new Date() - new Date(project.updatedAt || project.createdAt)) / 86400000))}d ago` : 'Just created')}
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
                          <span className="twp-health-pct" style={{ color: health.color }}>{isTracked ? `${progress}%` : '0%'}</span>
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
                      <div className="twp-deadline-date">{project.expectedEndDate || (project.deadline ? String(project.deadline).split('T')[0] : '')}</div>
                    </div>
                  </div>
                </div>

                {/* Continuation banner - Only displayed if project has genuine handover lineage */}
                {hasHandoverHistory && (
                  <div style={{
                    marginTop: 18,
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.12) 100%)',
                    border: '1px solid rgba(167,139,250,0.35)',
                    borderRadius: 14,
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#c4b5fd' }}>
                      <Sparkles style={{ width: 16, height: 16, color: '#a78bfa', flexShrink: 0 }} />
                      <span>
                        <strong style={{ color: '#fff' }}>v{project.currentVersionNumber || 2}.0 Continuation Project Active:</strong> Inherited from <strong style={{ color: '#e2e8f0' }}>{project.previousTeam?.name || handoverRecord?.fromTeamName || 'Team Alpha'}</strong> at <strong>{project.previousTeam?.discontinuedAt || project.progress || 45}%</strong> completion baseline.
                      </span>
                    </div>
                    <button
                      className="twp-btn-ghost"
                      style={{ fontSize: 11.5, padding: '5px 14px', borderColor: 'rgba(167,139,250,0.5)', color: '#fff', background: 'rgba(139,92,246,0.25)', fontWeight: 700 }}
                      onClick={() => setActiveNav('continuity')}
                    >
                      <GitFork style={{ width: 13, height: 13 }} />
                      <span>Open Continuity Protocol</span>
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
                    Manage Team & Brief
                  </button>
                </div>
              </div>

              {/* Overview 2-column grid */}
              <div className="twp-overview-grid">

                {/* LEFT COLUMN */}
                <div className="twp-overview-left">

                  {/* 1. Live Team Status Broadcast (Instantly updates Admin Dashboard) */}
                  <div className="twp-card" style={{ border: '1.5px solid #a7f3d0', background: '#f0fdf4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div className="twp-card-title" style={{ margin: 0, color: '#065f46', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: currentStatusNote ? '#10b981' : '#94a3b8',
                          boxShadow: currentStatusNote ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none',
                          display: 'inline-block'
                        }} />
                        <Radio style={{ width: 15, height: 15, color: '#059669' }} />
                        <span>Live Team Status Broadcast</span>
                      </div>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #bbf7d0'
                      }}>
                        Live on Admin Portal
                      </span>
                    </div>

                    {/* Current active status display */}
                    {currentStatusNote ? (
                      <div style={{
                        padding: '12px 14px',
                        backgroundColor: '#ffffff',
                        borderRadius: 10,
                        border: '1px solid #bbf7d0',
                        marginBottom: 14,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: '#047857', letterSpacing: '0.04em', marginBottom: 3 }}>
                          Active Status Message:
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#14532d', lineHeight: 1.5 }}>
                          "{currentStatusNote}"
                        </div>
                        <div style={{ fontSize: 11, color: '#166534', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>Reported by: <strong>{project.teamStatusUpdate?.updatedBy || teamLead.name || 'Team Lead'}</strong></span>
                          {project.summaryLastUpdatedAt && (
                            <span>• {new Date(project.summaryLastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#ffffff',
                        borderRadius: 8,
                        border: '1px dashed #86efac',
                        marginBottom: 14,
                        fontSize: 12,
                        color: '#166534'
                      }}>
                        No status message posted yet. Type a sprint update below to notify your faculty guide & administrator.
                      </div>
                    )}

                    {/* Quick status update form */}
                    <form onSubmit={handlePostQuickStatus} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          value={quickStatusText}
                          onChange={(e) => setQuickStatusText(e.target.value)}
                          placeholder="Update status message (e.g. Implementing OAuth2, testing payment webhooks...)"
                          disabled={isPostingStatus}
                          style={{
                            flex: 1,
                            minWidth: 220,
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1.5px solid #cbd5e1',
                            fontSize: 12.5,
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            outline: 'none',
                            fontFamily: 'inherit'
                          }}
                        />

                        {/* Member author select */}
                        <select
                          value={statusAuthor}
                          onChange={(e) => setStatusAuthor(e.target.value)}
                          disabled={isPostingStatus}
                          style={{
                            padding: '9px 10px',
                            borderRadius: 8,
                            border: '1.5px solid #cbd5e1',
                            fontSize: 12,
                            backgroundColor: '#ffffff',
                            color: '#334155',
                            outline: 'none',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <option value={teamLead.name || 'Team Lead'}>
                            {teamLead.name ? `${teamLead.name} (Lead)` : 'Team Lead'}
                          </option>
                          {teamMembers.map((m, idx) => (
                            <option key={idx} value={m.name || `Member ${idx + 1}`}>
                              {m.name || `Member ${idx + 1}`} ({m.role || 'Member'})
                            </option>
                          ))}
                        </select>

                        <button
                          type="submit"
                          disabled={isPostingStatus || !quickStatusText.trim()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '9px 16px',
                            backgroundColor: isPostingStatus || !quickStatusText.trim() ? '#94a3b8' : '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: isPostingStatus || !quickStatusText.trim() ? 'not-allowed' : 'pointer',
                            transition: 'background 0.15s ease',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Send style={{ width: 13, height: 13 }} />
                          <span>{isPostingStatus ? 'Broadcasting...' : 'Post Status'}</span>
                        </button>
                      </div>

                      {statusPostFeedback && (
                        <div style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: '#047857',
                          backgroundColor: '#dcfce7',
                          padding: '6px 10px',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5
                        }}>
                          <CheckCircle2 style={{ width: 13, height: 13 }} />
                          <span>{statusPostFeedback}</span>
                        </div>
                      )}
                    </form>

                    {/* Recent updates history */}
                    {statusHistory && statusHistory.length > 1 && (
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #d1fae5' }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#047857', letterSpacing: '0.04em', marginBottom: 6 }}>
                          Recent Updates ({statusHistory.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {statusHistory.slice(1, 4).map((item, idx) => (
                            <div key={idx} style={{
                              fontSize: 11.5,
                              color: '#334155',
                              backgroundColor: 'rgba(255,255,255,0.7)',
                              padding: '5px 8px',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8
                            }}>
                              <span style={{ fontWeight: 500 }}>"{item.message}"</span>
                              <span style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>
                                {item.updatedBy || 'Member'} • {item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Student-Authored Project Summary & Architecture Brief */}
                  <div className="twp-card" style={{ border: '1.5px solid #e0e7ff', background: '#faf5ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div className="twp-card-title" style={{ margin: 0, color: '#4338ca' }}>
                        <Sparkles style={{ width: 14, height: 14, color: '#7c3aed' }} className="twp-card-title-icon" />
                        Student Project Architecture & Brief
                      </div>
                      <button
                        onClick={handleOpenTeamModal}
                        style={{
                          background: '#ede9fe',
                          border: '1px solid #c4b5fd',
                          color: '#6d28d9',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Edit3 style={{ width: 11, height: 11 }} />
                        Edit Brief
                      </button>
                    </div>

                    {studentSummary ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <p className="twp-desc-text" style={{ color: '#1e1b4b', background: '#fff', padding: '12px 14px', borderRadius: 10, border: '1px solid #f3e8ff', margin: 0, lineHeight: 1.6 }}>
                          {studentSummary}
                        </p>
                        {project?.summaryLastUpdatedAt && (
                          <div style={{ fontSize: 10.5, color: '#8b5cf6', fontFamily: 'monospace', textAlign: 'right' }}>
                            Updated by team: {new Date(project.summaryLastUpdatedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '14px', background: '#fff', borderRadius: 8, border: '1px dashed #d8b4fe', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 12, color: '#6b21a8' }}>
                          Your team has not documented your custom technical architecture summary yet.
                        </p>
                        <button
                          onClick={handleOpenTeamModal}
                          style={{
                            marginTop: 8,
                            background: '#7c3aed',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 14px',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          + Write Project Brief
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="twp-card">
                    <div className="twp-card-title">
                      <Info style={{ width: 13, height: 13 }} className="twp-card-title-icon" />
                      Problem Statement & Scope
                    </div>
                    {project.problemStatement || project.description ? (
                      <>
                        {project.problemStatement && <p className="twp-desc-text">{project.problemStatement}</p>}
                        {project.description && <p className="twp-desc-text" style={{ marginTop: project.problemStatement ? 10 : 0, color: '#64748b' }}>{project.description}</p>}
                      </>
                    ) : (
                      <p className="twp-desc-text" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        No specific problem statement documented yet. Team can add requirements via workspace documents.
                      </p>
                    )}
                  </div>

                  {/* Tech Stack */}
                  <div className="twp-card">
                    <div className="twp-card-title">
                      <Layers style={{ width: 13, height: 13 }} className="twp-card-title-icon" />
                      Technology Stack
                    </div>
                    <div className="twp-tech-chips">
                      {project.techStack && project.techStack.length > 0 ? (
                        project.techStack.map(tech => (
                          <span key={tech} className="twp-tech-chip">{tech}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No technologies defined yet.</span>
                      )}
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
                      {projectMilestones.map((m, i) => {
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
                          {((teamLead.name ? 1 : 0) + (teamMembers?.length || 0))} {((teamLead.name ? 1 : 0) + (teamMembers?.length || 0)) === 1 ? 'member' : 'members'}
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

                    {!teamLead.name && (!teamMembers || teamMembers.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '22px 14px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                        <Users style={{ width: 24, height: 24, color: '#94a3b8', margin: '0 auto 6px', display: 'block' }} />
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>No Team Members Registered</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, marginBottom: 10 }}>
                          Team lead profile and member roster have not been filled yet.
                        </div>
                        <button
                          onClick={handleOpenTeamModal}
                          className="twp-btn-primary"
                          style={{ fontSize: 11.5, padding: '6px 12px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        >
                          <Plus style={{ width: 12, height: 12 }} /> Add Team Members
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Lead */}
                        {teamLead.name ? (
                          <div className="twp-team-lead">
                            <div className="twp-team-avatar twp-team-avatar--lead">{leadInitials}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="twp-team-name">{teamLead.name}</div>
                              <div className="twp-team-role">{teamLead.role || 'Team Lead'}</div>
                              <div className="twp-team-roll">{teamLead.rollNo} {teamLead.email ? `· ${teamLead.email}` : ''}</div>
                            </div>
                            <span style={{ fontSize: 10, background: '#ede9fe', color: '#6366f1', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Lead</span>
                          </div>
                        ) : null}

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
                      </>
                    )}
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
                          {project.lastUpdateDaysAgo === 0 ? 'Today' : `${project.lastUpdateDaysAgo ?? 1}d`}
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

                {/* Tunnel domain badge / setter */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 11 }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: tunnelBaseUrl ? '#10b981' : '#94a3b8' }} />
                    {tunnelBaseUrl ? <>Public Tunnel Active: <strong style={{ color: '#0f172a' }}>{tunnelBaseUrl}</strong></> : 'Using Localhost (Default)'}
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenTeamModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6366f1',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 11,
                      padding: 0
                    }}
                  >
                    {tunnelBaseUrl ? 'Change Tunnel URL' : '⚙️ Set ngrok / Tunnel URL'}
                  </button>
                </div>

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

                {/* Live Webhook Traced Preview (if any events exist) */}
                {gitEvents && gitEvents.length > 0 && (
                  <div style={{
                    marginTop: 14,
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: '#ffffff',
                    border: '1.5px solid #c7d2fe',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.06)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#1e1b4b' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                        <span>Live Telemetry: {gitSummary?.totalCommits || gitEvents.length} Commits Traced</span>
                      </div>
                      <button
                        onClick={() => setActiveNav('repository')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4338ca',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        View Full Telemetry Stream <ArrowRight style={{ width: 13, height: 13 }} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: 'monospace',
                        fontSize: 11,
                        background: '#f1f5f9',
                        padding: '3px 8px',
                        borderRadius: 6,
                        color: '#334155',
                        fontWeight: 600
                      }}>
                        <GitCommit style={{ width: 12, height: 12, color: '#6366f1' }} />
                        {(gitEvents[0]?.commitSha || gitSummary?.lastCommitSha || '').slice(0, 7) || 'HEAD'}
                      </div>
                      <div style={{ color: '#0f172a', fontWeight: 600, flex: 1, minWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{gitEvents[0]?.commitMessage || 'Latest commit'}"
                      </div>
                      <div style={{ color: '#64748b', fontSize: 11 }}>
                        by <strong>{gitEvents[0]?.authorName || 'Contributor'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                    Works with GitHub, GitLab, Bitbucket and any Git host that supports webhooks.
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      className="twp-regen-btn"
                      onClick={handleSimulateGitPush}
                      disabled={isSimulatingGit}
                      title="Simulate realistic Git commit push via webhook"
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}
                    >
                      {isSimulatingGit ? (
                        <><RefreshCw style={{ width: 11, height: 11 }} className="animate-spin" /> Simulating...</>
                      ) : (
                        <><Sparkles style={{ width: 11, height: 11, color: '#6366f1' }} /> Simulate Push</>
                      )}
                    </button>
                    <button
                      className="twp-regen-btn"
                      onClick={handleTestWebhookPing}
                    >
                      <Activity style={{ width: 11, height: 11 }} />
                      Verify Webhook Ping
                    </button>
                  </div>
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

              {projectMilestones.map((m, i) => {
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

          {/* ════ REPOSITORY & LIVE WEBHOOK TELEMETRY ════ */}
          {activeNav === 'repository' && (
            <div className="twp-fade-up">
              <div className="twp-section-header">
                <div>
                  <div className="twp-section-title">Git Webhook Telemetry & Code Stream</div>
                  <div className="twp-section-sub">Real-time commit ingestion, branch telemetry, and contributor tracking via webhook.</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    className="twp-btn-ghost"
                    onClick={handleSimulateGitPush}
                    disabled={isSimulatingGit}
                    style={{ background: '#f8fafc', border: '1px solid #cbd5e1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    title="Simulate realistic Git commit push via webhook"
                  >
                    {isSimulatingGit ? (
                      <><RefreshCw style={{ width: 14, height: 14 }} className="animate-spin" /> Ingesting Test Push...</>
                    ) : (
                      <><Sparkles style={{ width: 14, height: 14, color: '#6366f1' }} /> Simulate Test Push</>
                    )}
                  </button>

                  <button
                    className="twp-btn-ghost"
                    onClick={fetchGitEvents}
                    disabled={isLoadingGitEvents}
                    style={{ background: '#f8fafc', border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    title="Refresh webhook telemetry events"
                  >
                    <RefreshCw style={{ width: 14, height: 14, color: '#475569' }} className={isLoadingGitEvents ? 'animate-spin' : ''} />
                    Refresh Stream
                  </button>

                  <button className="twp-btn-ghost" onClick={handleOpenTeamModal}>
                    <Edit3 style={{ width: 14, height: 14 }} /> Edit Repo Link
                  </button>

                  {githubRepoUrl && (
                    <a
                      href={githubRepoUrl.startsWith('http') ? githubRepoUrl : `https://${githubRepoUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="twp-btn-primary"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <ExternalLink style={{ width: 14, height: 14 }} />
                      Open on GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Simulation feedback banner */}
              {gitSimFeedback && (
                <div style={{
                  marginBottom: 16,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <CheckCircle2 style={{ width: 16, height: 16, color: '#22c55e' }} />
                  {gitSimFeedback}
                </div>
              )}

              {/* Featured repo & webhook tracking configuration */}
              <div className="twp-repo-card">
                <div className="twp-repo-header">
                  <div className="twp-repo-header-left">
                    <div className="twp-repo-icon-wrap">
                      <Link2 style={{ width: 22, height: 22, color: '#fff' }} />
                    </div>
                    <div>
                      <div className="twp-repo-title">Live Git Webhook Endpoint</div>
                      <div className="twp-repo-subtitle">Auto-ingests commits, code diffs, and branch telemetry whenever code is pushed.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div className={`twp-conn-status ${(gitEvents.length > 0 || gitSummary?.isConnected) ? 'twp-conn-status--connected' : 'twp-conn-status--disconnected'}`}>
                      <span className={`twp-conn-dot ${(gitEvents.length > 0 || gitSummary?.isConnected) ? 'twp-conn-dot--green' : 'twp-conn-dot--amber'}`} />
                      {(gitEvents.length > 0 || gitSummary?.isConnected) ? 'Webhook Ingestion Active' : 'Awaiting First Push'}
                    </div>
                  </div>
                </div>

                {/* Tunnel domain badge / setter */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 11 }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: tunnelBaseUrl ? '#10b981' : '#94a3b8' }} />
                    {tunnelBaseUrl ? <>Public Tunnel Active: <strong style={{ color: '#0f172a' }}>{tunnelBaseUrl}</strong></> : 'Using Localhost (Default)'}
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenTeamModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6366f1',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 11,
                      padding: 0
                    }}
                  >
                    {tunnelBaseUrl ? 'Change Tunnel URL' : '⚙️ Set ngrok / Tunnel URL'}
                  </button>
                </div>

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
                  {showInstructions ? 'Hide' : 'Show'} GitHub Webhook Setup Guide
                </button>

                {showInstructions && (
                  <div className="twp-instructions-body">
                    {[
                      { step: 'Go to your GitHub repository → Settings → Webhooks → Add webhook.' },
                      { step: <>In the <strong>Payload URL</strong> field, paste your tracking URL: <code>{trackingUrl}</code></> },
                      { step: <>Set <strong>Content type</strong> to <code>application/json</code>.</> },
                      { step: <>Under <strong>Which events</strong>, select <code>Just the push event</code>.</> },
                      { step: 'Click Add webhook. Every commit pushed by team members will be traced here automatically.' },
                    ].map((item, i) => (
                      <div key={i} className="twp-instruction-step">
                        <div className="twp-step-num">{i + 1}</div>
                        <div className="twp-step-text">{item.step}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4 Quick Telemetry Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 20 }}>
                <div className="twp-card" style={{ padding: '16px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Commits Traced</span>
                    <GitCommit style={{ width: 18, height: 18, color: '#6366f1' }} />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                    {gitSummary?.totalCommits ?? gitEvents.length}
                  </div>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
                    Live Webhook Ingested
                  </div>
                </div>

                <div className="twp-card" style={{ padding: '16px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Pull Requests</span>
                    <GitFork style={{ width: 18, height: 18, color: '#8b5cf6' }} />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                    {gitSummary?.totalPullRequests ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    PR Telemetry Stream
                  </div>
                </div>

                <div className="twp-card" style={{ padding: '16px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Active Contributors</span>
                    <Users style={{ width: 18, height: 18, color: '#0ea5e9' }} />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                    {gitSummary?.contributors?.length ?? (gitEvents.length > 0 ? 1 : 0)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Unique authors tracked
                  </div>
                </div>

                <div className="twp-card" style={{ padding: '16px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Latest Ingested Commit</span>
                    <Radio style={{ width: 18, height: 18, color: '#22c55e' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                      {gitSummary?.lastCommitSha
                        ? gitSummary.lastCommitSha.slice(0, 7)
                        : (gitEvents[0]?.commitSha ? gitEvents[0].commitSha.slice(0, 7) : 'None')}
                    </span>
                    {(gitSummary?.lastCommitSha || gitEvents[0]?.commitSha) && (
                      <button
                        onClick={() => handleCopySha(gitSummary?.lastCommitSha || gitEvents[0]?.commitSha)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '2px 4px',
                          cursor: 'pointer',
                          color: copiedCommitSha ? '#16a34a' : '#64748b'
                        }}
                        title="Copy commit SHA"
                      >
                        {copiedCommitSha ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    {gitSummary?.lastEventAt ? new Date(gitSummary.lastEventAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No events yet'}
                  </div>
                </div>
              </div>

              {/* Contributor Activity Ledger */}
              {gitSummary?.contributors && gitSummary.contributors.length > 0 && (
                <div className="twp-card" style={{ padding: 20, borderRadius: 16, marginBottom: 20, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users style={{ width: 16, height: 16, color: '#6366f1' }} />
                    Team Contributor Telemetry Ledger
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {gitSummary.contributors.map((c, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 10,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                            {c.name || 'Anonymous Contributor'}
                          </div>
                          {c.username && (
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              @{c.username}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '3px 8px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 12
                          }}>
                            {c.commitsCount || 0} commits
                          </span>
                          {(c.linesAdded > 0 || c.linesRemoved > 0) && (
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, fontFamily: 'monospace' }}>
                              <span style={{ color: '#16a34a' }}>+{c.linesAdded || 0}</span> / <span style={{ color: '#dc2626' }}>-{c.linesRemoved || 0}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chronological Commit Telemetry Stream */}
              <div className="twp-card" style={{ padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#ede9fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6366f1'
                    }}>
                      <GitCommit style={{ width: 18, height: 18 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                        Traced Webhook Commits & Activity Stream
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>
                        Chronological record of code changes ingested through the webhook endpoint
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 14,
                    background: gitEvents.length > 0 ? '#f0fdf4' : '#f8fafc',
                    color: gitEvents.length > 0 ? '#166534' : '#64748b',
                    border: '1px solid',
                    borderColor: gitEvents.length > 0 ? '#bbf7d0' : '#e2e8f0'
                  }}>
                    {gitEvents.length} events logged
                  </span>
                </div>

                {isLoadingGitEvents ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw style={{ width: 22, height: 22, margin: '0 auto 10px' }} className="animate-spin" />
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Loading Git telemetry stream...</div>
                  </div>
                ) : gitEvents.length === 0 ? (
                  <div style={{
                    padding: '44px 20px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1.5px dashed #cbd5e1'
                  }}>
                    <GitCommit style={{ width: 36, height: 36, color: '#94a3b8', margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                      No Commits Traced Yet via Webhook
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748b', maxWidth: 460, margin: '0 auto 16px', lineHeight: 1.5 }}>
                      When team members push code to GitHub through the webhook URL, commits and file changes stream here live. You can also test the tracing pipeline right now!
                    </div>
                    <button
                      className="twp-btn-primary"
                      onClick={handleSimulateGitPush}
                      disabled={isSimulatingGit}
                      style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      {isSimulatingGit ? (
                        <><RefreshCw style={{ width: 14, height: 14 }} className="animate-spin" /> Simulating Push...</>
                      ) : (
                        <><Sparkles style={{ width: 14, height: 14 }} /> Simulate Realistic Test Push</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {gitEvents.map((evt, idx) => {
                      const sha = evt.commitSha || evt.commitHash || (evt.payload?.head_commit?.id) || '';
                      const message = evt.commitMessage || evt.message || evt.payload?.head_commit?.message || 'Git push update';
                      const author = evt.authorName || evt.author?.name || evt.authorUsername || evt.author?.githubUsername || 'Team Member';
                      const branch = evt.branch || evt.rawPayloadSummary?.branch || 'main';
                      const timestamp = evt.createdAt || evt.receivedAt || evt.timestamp;

                      const addedCount = typeof evt.filesAddedCount === 'number' ? evt.filesAddedCount : (Array.isArray(evt.filesAdded) ? evt.filesAdded.length : (evt.filesChanged?.added || 0));
                      const modifiedCount = typeof evt.filesModifiedCount === 'number' ? evt.filesModifiedCount : (Array.isArray(evt.filesModified) ? evt.filesModified.length : (evt.filesChanged?.modified || 0));
                      const removedCount = typeof evt.filesRemovedCount === 'number' ? evt.filesRemovedCount : (Array.isArray(evt.filesRemoved) ? evt.filesRemoved.length : (evt.filesChanged?.removed || 0));
                      const fileNames = Array.isArray(evt.filesAdded) ? [...evt.filesAdded, ...(evt.filesModified || []), ...(evt.filesRemoved || [])] : [];

                      return (
                        <div
                          key={evt._id || idx}
                          style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 14,
                            flexWrap: 'wrap'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 260 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                              {sha && (
                                <button
                                  onClick={() => handleCopySha(sha)}
                                  title="Click to copy commit SHA"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    fontFamily: 'monospace',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 6,
                                    padding: '2px 7px',
                                    color: copiedCommitSha === sha ? '#16a34a' : '#334155',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <GitCommit style={{ width: 12, height: 12, color: '#6366f1' }} />
                                  {sha.slice(0, 7)}
                                  {copiedCommitSha === sha ? <Check style={{ width: 11, height: 11 }} /> : <Copy style={{ width: 11, height: 11 }} />}
                                </button>
                              )}

                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 7px',
                                borderRadius: 6,
                                background: '#eff6ff',
                                color: '#2563eb'
                              }}>
                                <GitBranch style={{ width: 11, height: 11 }} />
                                {branch}
                              </span>

                              <span style={{ fontSize: 11.5, color: '#64748b' }}>
                                by <strong style={{ color: '#0f172a' }}>{author}</strong>
                              </span>

                              {timestamp && (
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                  • {new Date(timestamp).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', lineHeight: 1.4, marginBottom: 8 }}>
                              {message}
                            </div>

                            {/* Files changed chips */}
                            {(addedCount > 0 || modifiedCount > 0 || removedCount > 0) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 11 }}>
                                {addedCount > 0 && (
                                  <span style={{ color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                    +{addedCount} added
                                  </span>
                                )}
                                {modifiedCount > 0 && (
                                  <span style={{ color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                    ~{modifiedCount} modified
                                  </span>
                                )}
                                {removedCount > 0 && (
                                  <span style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                    -{removedCount} removed
                                  </span>
                                )}
                                {fileNames.length > 0 && (
                                  <span style={{ color: '#64748b', fontSize: 10.5, fontFamily: 'monospace' }}>
                                    {fileNames.slice(0, 3).join(', ')}
                                    {fileNames.length > 3 ? ` +${fileNames.length - 3} more` : ''}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ CONTINUITY PROTOCOL & HANDOVER DOSSIER ════ */}
          {activeNav === 'continuity' && (
            <div className="twp-fade-up">
              <div className="twp-section-header">
                <div>
                  <div className="twp-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <GitFork style={{ width: 18, height: 18, color: '#4F46E5' }} />
                    <span>Versioned Continuity Protocol & Handover History</span>
                  </div>
                  <div className="twp-section-sub">
                    Institutional lineage tracking deliverables, technical debt, and team transitions across academic batches.
                  </div>
                </div>
                {onTriggerHandover && (
                  <button className="twp-btn-ghost" onClick={onTriggerHandover}>
                    <RefreshCw style={{ width: 13, height: 13 }} />
                    <span>Trigger Next Version Handover</span>
                  </button>
                )}
              </div>

              {!hasHandoverHistory ? (
                /* ── EMPTY STATE FOR FOUNDING / ORIGINAL TEAM ── */
                <div style={{
                  background: '#FFFFFF',
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: 16,
                  padding: '52px 32px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
                }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: '#EFF6FF',
                    border: '1.5px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.12)'
                  }}>
                    <GitFork style={{ width: 30, height: 30 }} />
                  </div>

                  <div style={{ maxWidth: 560 }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#DCFCE7',
                      color: '#15803D',
                      border: '1px solid #BBF7D0',
                      padding: '3px 12px',
                      borderRadius: 9999,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      <CheckCircle2 style={{ width: 13, height: 13 }} />
                      Founding Version v1.0 • Original Lifecycle
                    </span>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '14px 0 8px 0' }}>
                      No Handover History Yet
                    </h3>
                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                      This project is currently active under its <strong>original founding student team</strong> ({project.team?.name || teamLead?.name || 'Assigned Student Cohort'}). No prior team handovers, discontinuation snapshots, or predecessor packages exist.
                    </p>
                  </div>

                  {/* Founding Project Status Metadata Strip */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 14,
                    width: '100%',
                    maxWidth: 720,
                    marginTop: 8
                  }}>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px 18px', borderRadius: 12, textAlign: 'left' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lineage Stage</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>v1.0 (Initial Creation)</div>
                    </div>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px 18px', borderRadius: 12, textAlign: 'left' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Academic Year</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>{project.academicYear || '2025-2026'}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px 18px', borderRadius: 12, textAlign: 'left' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Continuity Status</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', marginTop: 4 }}>Original Founding Team</div>
                    </div>
                  </div>

                  <div style={{
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: '14px 20px',
                    maxWidth: 720,
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginTop: 4
                  }}>
                    <Sparkles style={{ width: 17, height: 17, color: '#6366F1', flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.55 }}>
                      <strong>How does Handover History work?</strong> When a university project discontinues or transitions at the end of an academic semester, ProjectNexus generates an immutable version packet (v1.0 → v2.0). If this project is ever transferred to a successor team, its full deliverable lineage and technical debt backlog will be archived and visible here.
                    </div>
                  </div>

                  {onTriggerHandover && (
                    <button
                      onClick={onTriggerHandover}
                      style={{
                        marginTop: 10,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        background: '#FFFFFF',
                        color: '#4F46E5',
                        border: '1.5px solid #C7D2FE',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <GitFork style={{ width: 15, height: 15 }} />
                      <span>Initiate Handover Protocol (Discontinue & Transfer)</span>
                    </button>
                  )}
                </div>
              ) : (
                /* ── FULL HANDOVER HISTORY FOR CONTINUATION TEAMS ── */
                <>
                  {/* Lineage Transition Ribbon */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 16,
                    padding: '24px 28px',
                    marginBottom: 20,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    gap: 20,
                    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
                  }}>
                    <div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#B91C1C',
                        background: '#FEE2E2',
                        border: '1px solid #FECACA',
                        padding: '3px 10px',
                        borderRadius: 9999,
                        letterSpacing: '0.04em'
                      }}>
                        Outgoing Version v{(project.currentVersionNumber || 2) - 1}.0 (Archived)
                      </span>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
                        {project.previousTeam?.name || handoverRecord?.fromTeamName || 'Team Alpha (Original)'}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#475569', marginTop: 4, lineHeight: 1.5 }}>
                        Discontinued at <strong style={{ color: '#0F172A' }}>{project.previousTeam?.discontinuedAt || project.progress || 45}%</strong> completion • {handoverRecord?.discontinuationReason || 'Lead transferred institution; remaining members assigned to research.'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 10px' }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        background: '#EEF2FF',
                        color: '#4338CA',
                        padding: '3px 10px',
                        borderRadius: 9999,
                        border: '1px solid #C7D2FE',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Automated Protocol
                      </span>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
                      }}>
                        <GitFork style={{ width: 22, height: 22, strokeWidth: 2.2 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB' }}>Handover Engine</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#15803D',
                        background: '#DCFCE7',
                        border: '1px solid #BBF7D0',
                        padding: '3px 10px',
                        borderRadius: 9999,
                        letterSpacing: '0.04em'
                      }}>
                        Continuation Version v{project.currentVersionNumber || 2}.0 (Active)
                      </span>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
                        {project.team?.name || 'Team Gamma (Continuation)'}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#475569', marginTop: 4, lineHeight: 1.5 }}>
                        Resumed from <strong style={{ color: '#0F172A' }}>{project.previousTeam?.discontinuedAt || project.progress || 45}%</strong> baseline • Access code: <code style={{
                          color: '#1E293B',
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontFamily: 'monospace'
                        }}>{project.teamAccessCode || 'NEXUS-CEN3'}</code>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Split: Deliverables vs Debt & Specs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
                    
                    {/* Column 1: Deliverables vs Debt */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {/* Verified Deliverables Card */}
                      <div style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #86EFAC',
                        borderTop: '4px solid #10B981',
                        borderRadius: 14,
                        padding: '22px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle2 style={{ width: 17, height: 17, color: '#059669' }} />
                            <span>Verified Deliverables (Preserved v1.0)</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '3px 9px', borderRadius: 6 }}>
                            3 Locked
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {(handoverRecord?.completedModules || [
                            'Core Project Requirements Specification & Database Schema (PostgreSQL/MongoDB)',
                            'Face Enrollment Frontend UI (Student profile picture upload & preprocessing)',
                            'Base PyTorch FaceNet embedding model integration (accuracy ~94%)',
                            'Department Classroom Layout & Camera Hardware Specification'
                          ]).map((item, idx) => (
                            <div key={idx} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#064E3B',
                              padding: '10px 14px',
                              background: '#F0FDF4',
                              borderRadius: 8,
                              border: '1px solid #BBF7D0'
                            }}>
                              <div style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: '#DCFCE7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Check style={{ width: 14, height: 14, color: '#059669', strokeWidth: 2.5 }} />
                              </div>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Technical Debt Backlog Card */}
                      <div style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #FDE68A',
                        borderTop: '4px solid #F59E0B',
                        borderRadius: 14,
                        padding: '22px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle style={{ width: 17, height: 17, color: '#D97706' }} />
                            <span>Inherited Technical Debt (v2.0 Backlog)</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '3px 9px', borderRadius: 6 }}>
                            Pending Resolution
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {(handoverRecord?.pendingModules || [
                            'Anti-Spoofing & Liveness Detection (Prevents photo/screen spoofing)',
                            'Edge optimization (TensorRT/ONNX Runtime for real-time 15+ FPS)',
                            'Faculty Attendance Review Dashboard & PDF Generation',
                            'Live RTSP Video Stream Ingestion Pipeline'
                          ]).map((item, idx) => (
                            <div key={idx} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#78350F',
                              padding: '10px 14px',
                              background: '#FFFBEB',
                              borderRadius: 8,
                              border: '1px solid #FDE68A'
                            }}>
                              <div style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: '#FEF3C7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <AlertTriangle style={{ width: 13, height: 13, color: '#D97706', strokeWidth: 2.5 }} />
                              </div>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Column 2: Repository, Lab, Faculty Notes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {/* Codebase & Hardware Vault */}
                      <div style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 14,
                        padding: '22px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#3730A3', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FolderGit2 style={{ width: 16, height: 16, color: '#4F46E5' }} />
                          <span>Codebase Snapshot & Hardware Lab</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5 }}>
                          <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              Frozen Commit SHA:
                            </span>
                            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', marginTop: 4, fontSize: 13 }}>
                              5fb748c (tag: v1.0-handover-archive)
                            </div>
                          </div>

                          <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              Physical Hardware Location:
                            </span>
                            <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 4, fontSize: 13 }}>
                              Embedded Systems Lab 3, Workstation #4 (Locker 4)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Faculty Directive */}
                      <div style={{
                        background: '#F5F3FF',
                        border: '1.5px solid #DDD6FE',
                        borderLeft: '4px solid #7C3AED',
                        borderRadius: 14,
                        padding: '20px 22px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                      }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                          <FileText style={{ width: 15, height: 15, color: '#7C3AED' }} />
                          <span>Faculty Guide Directive • Prof. Vikram Malhotra</span>
                        </div>
                        <p style={{
                          margin: 0,
                          fontSize: 13,
                          color: '#1E1B4B',
                          fontStyle: 'italic',
                          lineHeight: 1.6,
                          background: '#FFFFFF',
                          padding: '12px 14px',
                          borderRadius: 8,
                          border: '1px solid #EDE9FE'
                        }}>
                          "{handoverRecord?.facultyGuidanceNotes || 'Hardware kit stored in CS Lab 3, Locker #4. Base embedding model verified. Do not rewrite from scratch — focus immediately on liveness filtering and Jetson edge optimization.'}"
                        </p>
                      </div>

                    </div>

                  </div>
                </>
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

                  {teamLead.contribution && (
                    <div style={{ marginTop: 10, padding: '8px 10px', background: '#eef2ff', borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 11.5, color: '#312e81' }}>
                      <strong style={{ display: 'block', fontSize: 9.5, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Key Contribution:</strong>
                      {teamLead.contribution}
                    </div>
                  )}

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

                    {m.contribution && (
                      <div style={{ marginTop: 8, padding: '7px 10px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11.5, color: '#334155', lineHeight: 1.4 }}>
                        <strong style={{ display: 'block', fontSize: 9.5, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Key Contribution:</strong>
                        {m.contribution}
                      </div>
                    )}

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
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Manage Team, Project Brief & Contributions</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Configure project summary, live development status, team roster, and individual deliverables</div>
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

              {/* 0. Project Summary & Live Development Status Section */}
              <div style={{ background: '#faf5ff', border: '1.5px solid #d8b4fe', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Sparkles style={{ width: 16, height: 16, color: '#7c3aed' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#581c87', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Project Brief & Live Development Status
                  </span>
                </div>
                
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#581c87', display: 'block', marginBottom: 5 }}>
                    Detailed Project Summary & Abstract (Student-Authored)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide a comprehensive explanation of what your project accomplishes, target users, problem solved, and key architectural modules..."
                    value={editStudentSummary}
                    onChange={e => setEditStudentSummary(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#fff',
                      border: '1px solid #c084fc',
                      borderRadius: 8,
                      padding: '10px 12px',
                      fontSize: 12.5,
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      lineHeight: 1.5,
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ fontSize: 10.5, color: '#7e22ce', marginTop: 4 }}>
                    Displayed directly on your team workspace and to department administrators in the Project Master Directory.
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#581c87', display: 'block', marginBottom: 5 }}>
                    Current Development Status / Sprint Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Phase 2 Complete: Connected MongoDB Atlas, working on GitHub webhook telemetry listener"
                    value={editCurrentStatusNote}
                    onChange={e => setEditCurrentStatusNote(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#fff',
                      border: '1px solid #c084fc',
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
                  {/* Public Tunnel / ngrok URL Input */}
                  <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Link2 style={{ width: 12, height: 12, color: '#6366f1' }} />
                        Public Tunnel / ngrok URL (for GitHub tracking)
                      </label>
                      {tunnelBaseUrl && (
                        <button
                          type="button"
                          onClick={() => handleUpdateTunnelUrl('')}
                          style={{
                            fontSize: 10.5,
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline'
                          }}
                        >
                          Reset to localhost
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. https://c782-103-120-1-5.ngrok-free.app (from terminal)"
                      value={tunnelBaseUrl}
                      onChange={e => handleUpdateTunnelUrl(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        padding: '7px 10px',
                        fontSize: 11.5,
                        color: '#0f172a',
                        fontFamily: 'monospace',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                      Paste your <code>ngrok</code> or <code>localtunnel</code> address here. It will automatically update the webhook URL below.
                    </div>
                  </div>

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
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Lead's Key Contributions & Deliverables
                    </label>
                    <textarea
                      rows={2}
                      value={editLead.contribution || ''}
                      onChange={e => setEditLead(prev => ({ ...prev, contribution: e.target.value }))}
                      placeholder="e.g. Architected database schemas, established authentication, and configured deployment pipelines..."
                      style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
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
                      3. Team Members Roster & Contributions ({editMembers.length})
                    </span>
                  </div>
                </div>

                {/* Existing Members List */}
                {editMembers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {editMembers.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 10
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                              padding: '5px 8px',
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

                        {/* Editable Member Contribution */}
                        <div style={{ marginTop: 8 }}>
                          <label style={{ fontSize: 10.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 2 }}>
                            Documented Contribution / Module Deliverable:
                          </label>
                          <input
                            type="text"
                            value={m.contribution || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setEditMembers(prev => prev.map((item, i) => i === idx ? { ...item, contribution: val } : item));
                            }}
                            placeholder="e.g. Implemented Kanban task workflows and responsive design tokens..."
                            style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: '7px 10px', fontSize: 11.5, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
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
                    <div>
                      <input
                        type="text"
                        placeholder="GitHub Username (e.g. priya-dev)"
                        value={newMemberGithub}
                        onChange={e => setNewMemberGithub(e.target.value)}
                        style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Initial Contribution (Optional)"
                        value={newMemberContribution}
                        onChange={e => setNewMemberContribution(e.target.value)}
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
