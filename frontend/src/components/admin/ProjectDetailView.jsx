import React, { useState, useEffect, useCallback } from 'react';
import './ProjectDetailView.css';
import {
  ArrowLeft,
  Calendar,
  User,
  Users,
  Building2,
  Clock,
  Mail,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  FolderGit2,
  GitCommit,
  FileText,
  Activity,
  Layers,
  GitFork,
  MessageSquare,
  X,
  Link2,
  UserCheck
} from 'lucide-react';

/* ── Date formatting helpers ── */
function formatDate(dateVal) {
  if (!dateVal) return 'Not set';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTimestamp(ts) {
  if (!ts || ts === 'Initial') return 'Project Initialization';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return String(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function getRelativeTime(ts) {
  if (!ts || ts === 'Initial' || ts === 'Recent') return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function getDeadlineInfo(deadlineStr) {
  if (!deadlineStr) return { text: 'No deadline set', type: 'normal' };
  const d = new Date(deadlineStr);
  if (isNaN(d.getTime())) return { text: String(deadlineStr), type: 'normal' };
  
  const diffDays = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return { text: `Overdue by ${Math.abs(diffDays)} days`, type: 'overdue' };
  }
  if (diffDays === 0) {
    return { text: 'Due today', type: 'urgent' };
  }
  if (diffDays <= 14) {
    return { text: `${diffDays} days left`, type: 'urgent' };
  }
  return { text: `${diffDays} days remaining`, type: 'normal' };
}

export default function ProjectDetailView({
  project,
  onBack,
  onOpenSendInvite,
  onRegenerateCode,
  onRevokeCode,
  onDeleteProject,
  onMarkCompleted,
  onToggleHandover,
  onOpenHandover,
  getCategoryBadge,
  getStatusBadge,
  getHealthBadge
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedChip, setCopiedChip] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Git Webhook Telemetry Stream States
  const [gitEvents, setGitEvents] = useState([]);
  const [gitSummary, setGitSummary] = useState(null);
  const [isLoadingGitEvents, setIsLoadingGitEvents] = useState(false);
  const [isSimulatingGit, setIsSimulatingGit] = useState(false);
  const [gitSimFeedback, setGitSimFeedback] = useState('');
  const [copiedCommitSha, setCopiedCommitSha] = useState('');

  const fetchGitEvents = async () => {
    if (!project?.projectId && !project?._id) return;
    setIsLoadingGitEvents(true);
    try {
      const projId = project.projectId || project._id;
      const res = await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(projId)}/github/events`);
      const data = await res.json();
      if (res.ok && data.success) {
        setGitEvents(data.data || []);
        setGitSummary(data.summary || null);
      }
    } catch (err) {
      console.warn('Failed to fetch git events:', err.message);
    } finally {
      setIsLoadingGitEvents(false);
    }
  };

  useEffect(() => {
    fetchGitEvents();
  }, [project?.projectId, project?._id]);

  const handleSimulateGitPush = async () => {
    setIsSimulatingGit(true);
    setGitSimFeedback('');
    try {
      const projId = project.projectId || project._id;
      const res = await fetch(`http://localhost:5000/api/webhooks/simulate/${encodeURIComponent(projId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `feat: verified repository telemetry handshake [${projId}]`,
          authorName: project.team?.leader?.name || 'Lead Contributor'
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

  if (!project) return null;

  const deadlineInfo = getDeadlineInfo(project.deadline);
  const isTeamRegistered = Boolean(
    project.isAccessCodeClaimed ||
    project.team?.name ||
    project.team?.leader?.name ||
    (project.team?.members && project.team.members.length > 0)
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project.teamAccessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyChip = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedChip(text);
    setTimeout(() => setCopiedChip(''), 2000);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmText.trim().toUpperCase() === project.projectId.trim().toUpperCase()) {
      onDeleteProject && onDeleteProject(project.projectId);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="pn-detail-container">
      
      {/* ── 1. Top Navigation & Status Bar ── */}
      <div className="pn-detail-nav">
        <button onClick={onBack} className="pn-back-btn" type="button">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Directory</span>
        </button>

        <div className="pn-nav-meta">
          <span className="pn-year-pill">
            Academic Year {project.academicYear || '2025-2026'}
          </span>
          {project.isOpenToHandover && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#4338CA',
              backgroundColor: '#EEF2FF',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #C7D2FE'
            }}>
              <GitFork size={12} color="#4338CA" />
              <span>Open for Handover</span>
            </span>
          )}
          {getCategoryBadge && getCategoryBadge(project.category)}
          {getStatusBadge && getStatusBadge(project.status)}
        </div>
      </div>

      {/* ── 2. Hero Header Block ── */}
      <div className="pn-hero-card">
        <div className="pn-hero-top">
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div className="pn-hero-badges">
              <span className="pn-id-pill">{project.projectId}</span>
              <span className="pn-dept-pill">{project.department}</span>
            </div>

            <h1 className="pn-hero-title">
              {project.title}
            </h1>

            <p className="pn-hero-desc">
              {project.description || 'Institutional engineering project assigned under departmental supervision.'}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="pn-hero-actions">
            {/* Mark Completed Button */}
            <button
              type="button"
              onClick={(e) => onMarkCompleted && onMarkCompleted(project, e)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: project.status === 'Completed' ? '#ECFDF5' : '#FFFFFF',
                color: project.status === 'Completed' ? '#047857' : '#334155',
                border: `1.5px solid ${project.status === 'Completed' ? '#6EE7B7' : '#CBD5E1'}`,
              }}
              title={project.status === 'Completed' ? 'Project Completed — Click to toggle status' : 'Admin Tick — Mark project as Completed'}
            >
              {project.status === 'Completed' ? <CheckCircle2 size={14} color="#059669" /> : <Check size={14} />}
              <span>{project.status === 'Completed' ? 'Completed' : 'Mark Completed'}</span>
            </button>

            {/* Toggle Mark Open to Handover Button */}
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                if (onToggleHandover) onToggleHandover(project.projectId);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: project.isOpenToHandover ? '#EEF2FF' : '#FFFFFF',
                color: project.isOpenToHandover ? '#4338CA' : '#334155',
                border: `1.5px solid ${project.isOpenToHandover ? '#818CF8' : '#CBD5E1'}`,
              }}
              title={project.isOpenToHandover ? 'Handover status is Active — Click to remove from open handover queue' : 'Mark this project as Open to Handover in the continuity directory'}
            >
              <GitFork size={14} color={project.isOpenToHandover ? '#4338CA' : '#64748B'} />
              <span>{project.isOpenToHandover ? 'Handover Open (Active)' : 'Mark Open to Handover'}</span>
            </button>

            {/* View Handover Dossier Button */}
            <button
              type="button"
              onClick={(e) => onOpenHandover && onOpenHandover(project, e)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: '#F5F3FF',
                color: '#7C3AED',
                border: '1.5px solid #DDD6FE',
              }}
              title="Inspect or execute formal handover transition certificate"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EDE9FE'; e.currentTarget.style.borderColor = '#8B5CF6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5F3FF'; e.currentTarget.style.borderColor = '#DDD6FE'; }}
            >
              <Sparkles size={14} color="#7C3AED" />
              <span>Handover Dossier</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenSendInvite && onOpenSendInvite(project)}
              className="pn-action-btn-primary"
            >
              <Mail className="w-4 h-4" />
              <span>Send Invite</span>
            </button>

            {onDeleteProject && (
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="pn-action-btn-danger"
                title="Delete this project"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Metadata Sub-Bar */}
        <div className="pn-hero-meta-row">
          <div className="pn-meta-item">
            <User className="w-4 h-4 text-blue-600" />
            <span>Faculty Guide: <strong>{project.facultyGuide}</strong></span>
          </div>

          <div className="pn-meta-item">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Target Deadline: <strong>{formatDate(project.deadline)}</strong></span>
            <span className={`pn-deadline-badge ${deadlineInfo.type}`}>
              {deadlineInfo.text}
            </span>
          </div>

          <div className="pn-meta-item">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Last Activity: <strong>{formatTimestamp(project.lastActivityDate)}</strong></span>
          </div>
        </div>
      </div>

      {/* ── 3. Executive KPI Stats Ribbon ── */}
      <div className="pn-kpi-grid">
        
        {/* Progress KPI */}
        <div className="pn-kpi-card">
          <div className="pn-kpi-header">
            <span className="pn-kpi-label">Progress Overview</span>
            <div className="pn-kpi-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="pn-kpi-value-row">
            <div className="pn-kpi-number">{project.progress || 0}%</div>
            <div className="pn-kpi-subtext">Completed</div>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${project.progress || 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2563EB 0%, #4F46E5 100%)',
                borderRadius: '999px'
              }}
            />
          </div>
        </div>

        {/* Health Score KPI */}
        <div className="pn-kpi-card">
          <div className="pn-kpi-header">
            <span className="pn-kpi-label">Health & Risk Index</span>
            <div className="pn-kpi-icon-wrap" style={{
              backgroundColor: (project.healthScore || 0) >= 70 ? '#ECFDF5' : (project.healthScore || 0) > 0 ? '#FEF3C7' : '#F1F5F9',
              color: (project.healthScore || 0) >= 70 ? '#059669' : (project.healthScore || 0) > 0 ? '#D97706' : '#64748B'
            }}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="pn-kpi-value-row">
            <div className="pn-kpi-number" style={{
              color: (project.healthScore || 0) >= 70 ? '#059669' : (project.healthScore || 0) > 0 ? '#D97706' : '#64748B'
            }}>
              {project.healthScore || 0}%
            </div>
            <div>
              {getHealthBadge ? getHealthBadge(project.health, project.healthScore) : (
                <span className="pn-year-pill">{project.health || 'Not Tracked'}</span>
              )}
            </div>
          </div>
          <div className="pn-kpi-subtext">
            <span>{project.healthScore > 0 ? 'Telemetry Active' : 'Awaiting Student Commits'}</span>
          </div>
        </div>

        {/* Team Registration Status */}
        <div className="pn-kpi-card">
          <div className="pn-kpi-header">
            <span className="pn-kpi-label">Team Registration</span>
            <div className="pn-kpi-icon-wrap" style={{
              backgroundColor: isTeamRegistered ? '#ECFDF5' : '#FFFBEB',
              color: isTeamRegistered ? '#059669' : '#D97706'
            }}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="pn-kpi-value-row">
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isTeamRegistered ? (project.team?.name || 'Registered Team') : 'Pending Claim'}
            </div>
          </div>
          <div className="pn-kpi-subtext">
            {isTeamRegistered ? (
              <span style={{ color: '#059669', fontWeight: 600 }}>Active in Workspace</span>
            ) : (
              <span>Invite: {project.invitedLeadEmail ? project.invitedLeadEmail.split('@')[0] : 'Unassigned'}</span>
            )}
          </div>
        </div>

        {/* GitHub Telemetry Status */}
        <div className="pn-kpi-card">
          <div className="pn-kpi-header">
            <span className="pn-kpi-label">GitHub Integration</span>
            <div className="pn-kpi-icon-wrap" style={{
              backgroundColor: project.githubIntegration?.isConnected ? '#F5F3FF' : '#F8FAFC',
              color: project.githubIntegration?.isConnected ? '#7C3AED' : '#94A3B8'
            }}>
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="pn-kpi-value-row">
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
              {project.githubIntegration?.isConnected ? 'Webhook Active' : 'Not Connected'}
            </div>
          </div>
          <div className="pn-kpi-subtext">
            {project.githubIntegration?.isConnected ? (
              <span>{project.githubIntegration.totalCommits || 0} commits recorded</span>
            ) : (
              <span>Setup in Team Workspace</span>
            )}
          </div>
        </div>

      </div>

      {/* ── 4. Main Two-Column Layout ── */}
      <div className="pn-main-grid">
        
        {/* LEFT COLUMN: Narrative, Engineering Specs, Timeline */}
        <div className="pn-content-col">
          
          {/* 1. Live Team Status from Students */}
          {(() => {
            const activeStatusMsg = project.teamStatusUpdate?.message || project.currentStatusNote || '';
            const statusAuthor = project.teamStatusUpdate?.updatedBy || project.team?.leader?.name || project.team?.lead?.name || 'Student Team';
            const statusDate = project.teamStatusUpdate?.updatedAt || project.summaryLastUpdatedAt;
            const historyList = Array.isArray(project.teamStatusHistory) ? project.teamStatusHistory : [];

            return (
              <div className="pn-panel" style={{ border: activeStatusMsg ? '1.5px solid #BBF7D0' : '1px solid #E2E8F0' }}>
                <div className="pn-panel-header">
                  <div className="pn-panel-title-group">
                    <span style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: activeStatusMsg ? '#10B981' : '#94A3B8',
                      boxShadow: activeStatusMsg ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none',
                      display: 'inline-block'
                    }} />
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <h3 className="pn-panel-title">Current Live Team Status</h3>
                  </div>
                  {activeStatusMsg ? (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      backgroundColor: '#ECFDF5',
                      color: '#047857',
                      border: '1px solid #A7F3D0'
                    }}>
                      Live Sprint Update
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      backgroundColor: '#F1F5F9',
                      color: '#64748B',
                      border: '1px solid #E2E8F0'
                    }}>
                      Awaiting Team Update
                    </span>
                  )}
                </div>

                {activeStatusMsg ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#DCFCE7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#15803D',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#15803D', letterSpacing: '0.04em', marginBottom: '4px' }}>
                          Current Status Note:
                        </div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#14532D', lineHeight: 1.5 }}>
                          "{activeStatusMsg}"
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#166534', marginTop: '8px' }}>
                          <span>Updated by: <strong>{statusAuthor}</strong></span>
                          {statusDate && <span>• {formatTimestamp(statusDate)}</span>}
                          {statusDate && getRelativeTime(statusDate) && <span style={{ color: '#047857', fontWeight: 600 }}>({getRelativeTime(statusDate)})</span>}
                        </div>
                      </div>
                    </div>

                    {/* Status history list if available */}
                    {historyList.length > 1 && (
                      <div style={{ marginTop: '2px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '8px', letterSpacing: '0.04em' }}>
                          Previous Updates ({historyList.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {historyList.slice(1, 4).map((h, hIdx) => (
                            <div key={hIdx} style={{
                              padding: '8px 12px',
                              backgroundColor: '#F8FAFC',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              fontSize: '12px',
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px'
                            }}>
                              <span style={{ fontWeight: 500, flex: 1 }}>"{h.message}"</span>
                              <span style={{ fontSize: '10.5px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                                {h.updatedBy || 'Member'} • {formatTimestamp(h.updatedAt)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pn-empty-summary">
                    <div className="pn-empty-summary-icon" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        No Live Team Status Message Yet
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0', lineHeight: 1.4 }}>
                        The student team can broadcast real-time sprint updates directly from their Student Team Workspace.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 2. Student-Authored Project Summary & Architecture Brief */}
          <div className="pn-panel">
            <div className="pn-panel-header">
              <div className="pn-panel-title-group">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="pn-panel-title">Student Technical Architecture & Project Brief</h3>
              </div>
              {project.studentSummary ? (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE'
                }}>
                  Student Submitted
                </span>
              ) : (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  border: '1px solid #E2E8F0'
                }}>
                  Awaiting Student Submission
                </span>
              )}
            </div>

            {project.studentSummary ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="pn-summary-box">
                  {project.studentSummary}
                </div>
                {project.summaryLastUpdatedAt && (
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace', textAlign: 'right' }}>
                    Updated by student team: {formatTimestamp(project.summaryLastUpdatedAt)}
                  </div>
                )}
              </div>
            ) : (
              <div className="pn-empty-summary">
                <div className="pn-empty-summary-icon">
                  <FileText className="w-5 h-5" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    No Technical Brief Submitted Yet
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0', lineHeight: 1.4 }}>
                    The student team can submit their technical architecture summary, module breakdown, and weekly notes directly from the Student Team Workspace.
                  </p>
                </div>
              </div>
            )}
          </div>


          {/* 3. Git Webhook Ingestion & Commit Telemetry Stream */}
          <div className="pn-panel" style={{ border: (gitEvents.length > 0 || gitSummary?.isConnected) ? '1.5px solid #DDD6FE' : '1px solid #E2E8F0' }}>
            <div className="pn-panel-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
              <div className="pn-panel-title-group">
                <span style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: (gitEvents.length > 0 || gitSummary?.isConnected) ? '#8B5CF6' : '#94A3B8',
                  boxShadow: (gitEvents.length > 0 || gitSummary?.isConnected) ? '0 0 0 3px rgba(139, 92, 246, 0.25)' : 'none',
                  display: 'inline-block'
                }} />
                <FolderGit2 className="w-4 h-4 text-purple-600" />
                <h3 className="pn-panel-title">Git Webhook Telemetry & Code Stream</h3>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  backgroundColor: (gitEvents.length > 0 || gitSummary?.isConnected) ? '#F5F3FF' : '#F1F5F9',
                  color: (gitEvents.length > 0 || gitSummary?.isConnected) ? '#6D28D9' : '#64748B',
                  border: `1px solid ${(gitEvents.length > 0 || gitSummary?.isConnected) ? '#DDD6FE' : '#CBD5E1'}`
                }}>
                  {(gitEvents.length > 0 || gitSummary?.isConnected) ? 'Webhook Ingestion Active' : 'Awaiting First Push'}
                </span>

                <button
                  type="button"
                  onClick={handleSimulateGitPush}
                  disabled={isSimulatingGit}
                  className="pn-action-btn-secondary"
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    gap: '5px',
                    backgroundColor: '#FAF5FF',
                    color: '#7C3AED',
                    borderColor: '#DDD6FE'
                  }}
                  title="Simulate a realistic Git push event to verify webhook tracing"
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>{isSimulatingGit ? 'Injecting...' : 'Simulate Test Push'}</span>
                </button>

                <button
                  type="button"
                  onClick={fetchGitEvents}
                  disabled={isLoadingGitEvents}
                  className="pn-action-btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '11.5px' }}
                  title="Refresh webhook telemetry events"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGitEvents ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Simulation feedback alert */}
            {gitSimFeedback && (
              <div style={{
                marginBottom: '14px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#15803D',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gitSimFeedback}</span>
              </div>
            )}

            {/* Webhook Tracking URL & Stats Header */}
            <div style={{
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Webhook Ingestion Payload URL
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '4px 6px 4px 12px',
                  gap: '8px',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                }}>
                  <Link2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span style={{
                    flex: 1,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1E293B',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} title={`https://support-shy-overcook.ngrok-free.dev/api/webhooks/repo/${project.projectId}`}>
                    https://support-shy-overcook.ngrok-free.dev/api/webhooks/repo/{project.projectId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyChip(`https://support-shy-overcook.ngrok-free.dev/api/webhooks/repo/${project.projectId}`)}
                    style={{
                      background: copiedChip === `https://support-shy-overcook.ngrok-free.dev/api/webhooks/repo/${project.projectId}` ? '#ECFDF5' : '#7C3AED',
                      border: copiedChip === `https://support-shy-overcook.ngrok-free.dev/api/webhooks/repo/${project.projectId}` ? '1px solid #A7F3D0' : 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: copiedChip === `https://support-shy-overcook.ngrok-free.dev/api/webhooks/repo/${project.projectId}` ? '#065F46' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {copiedChip === `https://support-shy-overcook.ngrok-free.dev/api/webhooks/repo/${project.projectId}` ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy URL</>
                    )}
                  </button>
                </div>
              </div>

              {/* 4 Quick Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Commits Traced</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '3px' }}>
                    {gitSummary?.totalCommits ?? gitEvents.length}
                  </div>
                </div>
                <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pull Requests</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '3px' }}>
                    {gitSummary?.totalPullRequests ?? 0}
                  </div>
                </div>
                <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contributors</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '3px' }}>
                    {gitSummary?.contributors?.length ?? 0}
                  </div>
                </div>
                <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Latest Commit</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: '#2563EB', marginTop: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {gitSummary?.lastCommitSha ? gitSummary.lastCommitSha.slice(0, 7) : (gitEvents[0]?.commitSha ? gitEvents[0].commitSha.slice(0, 7) : 'None')}
                  </div>
                </div>
              </div>
            </div>

            {/* Contributor Ledger if present */}
            {gitSummary?.contributors && gitSummary.contributors.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  Tracked Contributor Activity ({gitSummary.contributors.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {gitSummary.contributors.map((c, cIdx) => (
                    <div key={cIdx} style={{
                      padding: '10px 12px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                          {c.name || c.githubUsername || 'Contributor'}
                        </div>
                        {c.githubUsername && (
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            @{c.githubUsername}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          padding: '2px 7px',
                          borderRadius: '5px'
                        }}>
                          {c.commitCount} {c.commitCount === 1 ? 'commit' : 'commits'}
                        </span>
                        <div style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: 600, marginTop: '2px' }}>
                          +{c.linesAdded || 0} lines
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Commits List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.04em' }}>
                  Live Commit Ingestion Stream ({gitEvents.length})
                </div>
                {gitSummary?.lastEventAt && (
                  <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                    Last payload: {getRelativeTime(gitSummary.lastEventAt)}
                  </span>
                )}
              </div>

              {gitEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                  {gitEvents.map((ev, evIdx) => {
                    const commitShaShort = ev.commitSha ? ev.commitSha.slice(0, 7) : 'commit';
                    const branchName = ev.rawPayloadSummary?.branch || 'main';
                    const files = ev.filesChanged || {};
                    const totalDelta = (files.added || 0) + (files.modified || 0);

                    return (
                      <div key={ev._id || evIdx} style={{
                        padding: '12px 14px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'border-color 0.15s ease'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              backgroundColor: '#F1F5F9',
                              color: '#2563EB',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleCopyChip(ev.commitSha)}
                            title="Click to copy full commit SHA"
                            >
                              {commitShaShort}
                            </span>
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              backgroundColor: '#EEF2FF',
                              color: '#4338CA',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {branchName}
                            </span>
                            {ev.eventType === 'pull_request' && (
                              <span style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                backgroundColor: '#FAF5FF',
                                color: '#7E22CE',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                Pull Request
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {formatTimestamp(ev.receivedAt || ev.createdAt)}
                            {getRelativeTime(ev.receivedAt || ev.createdAt) && (
                              <span style={{ marginLeft: '4px', color: '#94A3B8' }}>
                                ({getRelativeTime(ev.receivedAt || ev.createdAt)})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Commit Message */}
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', lineHeight: 1.45 }}>
                          {ev.message || 'No commit message recorded'}
                        </div>

                        {/* Author & File Stats Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              <strong>{ev.author?.name || 'Contributor'}</strong>
                              {ev.author?.githubUsername && <span style={{ color: '#94A3B8' }}> (@{ev.author.githubUsername})</span>}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {totalDelta > 0 && (
                              <span style={{ color: '#16A34A', fontWeight: 700 }}>
                                +{totalDelta} {totalDelta === 1 ? 'file' : 'files'}
                              </span>
                            )}
                            {files.removed > 0 && (
                              <span style={{ color: '#DC2626', fontWeight: 700 }}>
                                -{files.removed}
                              </span>
                            )}
                            {ev.rawPayloadSummary?.url && (
                              <a
                                href={ev.rawPayloadSummary.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  padding: '32px 20px',
                  backgroundColor: '#FAF5FF',
                  borderRadius: '12px',
                  border: '1.5px dashed #DDD6FE',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#F3E8FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7C3AED',
                    marginBottom: '4px'
                  }}>
                    <FolderGit2 className="w-6 h-6" />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#4C1D95' }}>
                    No Commits Traced Yet via Webhook
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B21A8', margin: 0, maxWidth: '440px', lineHeight: 1.5 }}>
                    When team members push code to GitHub through the webhook URL, commits and file changes stream here live.
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateGitPush}
                    disabled={isSimulatingGit}
                    style={{
                      marginTop: '8px',
                      padding: '8px 18px',
                      backgroundColor: '#7C3AED',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D28D9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                  >
                    <GitCommit className="w-4 h-4" />
                    <span>{isSimulatingGit ? 'Injecting commit...' : 'Simulate Test Git Push Now'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Team Roster & Supervisor */}
        <div className="pn-content-col">

          {/* Assigned Team Roster Panel */}
          <div className="pn-panel">
            <div className="pn-panel-header">
              <div className="pn-panel-title-group">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="pn-panel-title">Assigned Team Roster</h3>
              </div>
              {isTeamRegistered && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  border: '1px solid #A7F3D0'
                }}>
                  Registered & Active
                </span>
              )}
            </div>

            {isTeamRegistered ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {project.team?.name && (
                  <div style={{
                    padding: '12px 14px',
                    backgroundColor: '#EFF6FF',
                    borderRadius: '10px',
                    border: '1px solid #DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E40AF' }}>
                        {project.team.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#3B82F6' }}>
                        Active Capstone Development Team
                      </div>
                    </div>
                    <span className="pn-id-pill" style={{ fontSize: '10.5px' }}>
                      {(project.team.members?.length || 0) + 1} Members
                    </span>
                  </div>
                )}

                {/* Team Lead Profile Card */}
                {project.team?.leader?.name && (
                  <div className="pn-lead-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#2563EB', letterSpacing: '0.04em' }}>
                        Designated Team Lead
                      </span>
                      <span style={{
                        fontSize: '10.5px',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        backgroundColor: '#EFF6FF',
                        color: '#1E40AF',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {project.team.leader.rollNo || project.team.leader.usn || 'Team Lead'}
                      </span>
                    </div>

                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                      {project.team.leader.name}
                    </div>

                    {project.team.leader.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${project.team.leader.email}`} style={{ color: '#2563EB', textDecoration: 'none' }}>
                          {project.team.leader.email}
                        </a>
                      </div>
                    )}

                    {project.team.leader.contribution && (
                      <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Documented Contribution:
                        </span>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#334155', fontStyle: 'italic', lineHeight: 1.4 }}>
                          "{project.team.leader.contribution}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Team Members List */}
                {project.team?.members && project.team.members.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.04em' }}>
                      Team Members ({project.team.members.length})
                    </div>
                    {project.team.members.map((m, idx) => (
                      <div key={idx} className="pn-member-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>{m.name}</span>
                          <span style={{ fontSize: '10.5px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                            {m.role || 'Contributor'}
                          </span>
                        </div>
                        {m.email && (
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                            {m.email}
                          </div>
                        )}
                        {m.contribution && (
                          <div style={{ fontSize: '11.5px', color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                            "{m.contribution}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="pn-team-empty-card">
                <AlertCircle className="w-8 h-8 text-amber-500" style={{ margin: '0 auto' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                    Awaiting Student Team Registration
                  </div>
                  <p style={{ fontSize: '12px', color: '#B45309', margin: '4px 0 0', lineHeight: 1.45 }}>
                    Students redeem the access code on the institutional portal to enroll their names, USNs, and module responsibilities.
                  </p>
                </div>

                {project.invitedLeadEmail && (
                  <div style={{
                    padding: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    border: '1px solid #FDE68A',
                    textAlign: 'left',
                    fontSize: '11.5px',
                    color: '#92400E'
                  }}>
                    <span style={{ fontWeight: 700, display: 'block' }}>Designated Lead Email:</span>
                    <span style={{ fontFamily: 'monospace', color: '#B45309' }}>{project.invitedLeadEmail}</span>
                    {project.invitationSentAt && (
                      <span style={{ display: 'block', fontSize: '10.5px', color: '#D97706', marginTop: '3px' }}>
                        Dispatched {formatDate(project.invitationSentAt)}
                      </span>
                    )}
                  </div>
                )}

                {project.teamAccessCode && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#FEF3C7',
                    borderRadius: '8px',
                    border: '1px solid #FDE68A',
                    fontSize: '12px',
                    color: '#92400E'
                  }}>
                    <span>Access Code: <strong style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{project.teamAccessCode}</strong></span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #FCD34D',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#78350F',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onOpenSendInvite && onOpenSendInvite(project)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    padding: '8px 12px',
                    backgroundColor: '#FDE68A',
                    color: '#78350F',
                    border: '1px solid #FCD34D',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FCD34D'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FDE68A'}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Registration Link via Email</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Technologies & Frameworks / Component Allocation */}
          <div className="pn-panel">
            <div className="pn-panel-header">
              <div className="pn-panel-title-group">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="pn-panel-title">
                  {project.category === 'Software' ? 'Software Tech Stack & Architecture' : 'Physical Components & Lab Allocation'}
                </h3>
              </div>
              <span className="pn-id-pill" style={{ fontSize: '11px' }}>
                {project.currentMilestone || 'Active Sprint'}
              </span>
            </div>

            {project.category === 'Software' ? (
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  Technologies & Frameworks
                </div>
                <div className="pn-chips-wrap">
                  {(project.techStack && project.techStack.length > 0
                    ? project.techStack
                    : ['React', 'Node.js', 'Python', 'PostgreSQL']
                  ).map((tech, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCopyChip(tech)}
                      className="pn-tech-chip"
                      title="Click to copy"
                    >
                      <span>{tech}</span>
                      {copiedChip === tech ? (
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {project.labAssigned && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    color: '#334155'
                  }}>
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Allocated Institutional Lab: <strong>{project.labAssigned}</strong></span>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    Required Hardware Components & Sensors
                  </div>
                  <div className="pn-chips-wrap">
                    {(project.componentsRequired && project.componentsRequired.length > 0
                      ? project.componentsRequired
                      : ['Microcontroller Module', 'Telemetry Sensor', 'Power Conditioning Unit']
                    ).map((comp, idx) => (
                      <span key={idx} className="pn-component-chip">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Academic Mentorship & Faculty Guide Card */}
          <div className="pn-panel">
            <div className="pn-panel-header">
              <div className="pn-panel-title-group">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h3 className="pn-panel-title">Academic Mentorship & Guide</h3>
              </div>
              <span className="pn-id-pill" style={{ fontSize: '10.5px' }}>
                {project.department || 'Academic Division'}
              </span>
            </div>

            <div style={{
              padding: '14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px',
                border: '1.5px solid #BFDBFE',
                flexShrink: 0
              }}>
                {(project.facultyGuide || 'P')[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                  {project.facultyGuide || 'Unassigned Faculty Guide'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  Institutional Project Supervisor • {project.department}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Institutional Governance & Telemetry Audit Trail */}
          <div className="pn-panel">
            <div className="pn-panel-header">
              <div className="pn-panel-title-group">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="pn-panel-title">Institutional Governance & Telemetry Audit Trail</h3>
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                {(project.timeline || []).length} Recorded Events
              </span>
            </div>

            <div className="pn-timeline-list">
              {(project.timeline && project.timeline.length > 0 ? project.timeline : [
                {
                  title: 'Project Provisioned',
                  description: 'Project initialized by Administration with access credentials.',
                  timestamp: project.createdAt || 'Initial',
                  type: 'creation'
                }
              ]).map((ev, idx) => {
                const relTime = getRelativeTime(ev.timestamp);
                const dotType = (ev.type || '').toLowerCase();
                return (
                  <div key={idx} className="pn-timeline-item">
                    <div className={`pn-timeline-dot ${dotType || 'creation'}`} />
                    <div className="pn-timeline-title">{ev.title}</div>
                    <p className="pn-timeline-desc">{ev.description}</p>
                    <div className="pn-timeline-time">
                      <span>{formatTimestamp(ev.timestamp)}</span>
                      {relTime && <span style={{ marginLeft: '6px', color: '#64748B' }}>• {relTime}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* ── 5. Delete Project Confirmation Modal ── */}
      {deleteModalOpen && (
        <div className="pn-modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
          <div className="pn-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
                <AlertTriangle className="w-5 h-5" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Confirm Project Deletion</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              This action will permanently delete project <strong>{project.title}</strong>, revoke its team access credentials, and purge associated GitHub telemetry logs.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Type <code style={{ backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', color: '#0F172A', fontWeight: 700 }}>{project.projectId}</code> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={project.projectId}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="pn-action-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText.trim().toUpperCase() !== project.projectId.trim().toUpperCase()}
                className="pn-action-btn-danger"
                style={{
                  opacity: deleteConfirmText.trim().toUpperCase() === project.projectId.trim().toUpperCase() ? 1 : 0.4,
                  cursor: deleteConfirmText.trim().toUpperCase() === project.projectId.trim().toUpperCase() ? 'pointer' : 'not-allowed'
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
