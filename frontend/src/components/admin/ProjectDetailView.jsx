import React, { useState } from 'react';
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
  Slash,
  AlertCircle,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  FolderGit2,
  GitBranch,
  GitCommit,
  FileText,
  Activity,
  Layers,
  HelpCircle,
  GitFork,
  X
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
  onOpenHandover,
  getCategoryBadge,
  getStatusBadge,
  getHealthBadge
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedChip, setCopiedChip] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  if (!project) return null;

  const deadlineInfo = getDeadlineInfo(project.deadline);

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

            {/* Open to Handover Button */}
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
              title="Open Project in Versioned Handover Protocol"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EDE9FE'; e.currentTarget.style.borderColor = '#8B5CF6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5F3FF'; e.currentTarget.style.borderColor = '#DDD6FE'; }}
            >
              <GitFork size={14} color="#7C3AED" />
              <span>Open to Handover</span>
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
              backgroundColor: project.isAccessCodeClaimed ? '#ECFDF5' : '#FFFBEB',
              color: project.isAccessCodeClaimed ? '#059669' : '#D97706'
            }}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="pn-kpi-value-row">
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {project.isAccessCodeClaimed ? (project.team?.name || 'Registered Team') : 'Pending Claim'}
            </div>
          </div>
          <div className="pn-kpi-subtext">
            {project.isAccessCodeClaimed ? (
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
          
          {/* Student-Submitted Project Summary & Live Status */}
          <div className="pn-panel">
            <div className="pn-panel-header">
              <div className="pn-panel-title-group">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="pn-panel-title">Student Project Summary & Live Status</h3>
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

                {project.currentStatusNote && (
                  <div className="pn-status-note-box">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Current Development Status / Notes:
                      </strong>
                      <span style={{ fontSize: '12.5px', fontWeight: 500 }}>
                        {project.currentStatusNote}
                      </span>
                    </div>
                  </div>
                )}

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
                    No Project Summary Submitted Yet
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0', lineHeight: 1.4 }}>
                    The student team can submit their technical architecture summary, module breakdown, and weekly notes directly from the Student Team Workspace.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Current Milestone & Specs Card */}
          <div className="pn-panel">
            <div className="pn-panel-header">
              <div className="pn-panel-title-group">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="pn-panel-title">
                  {project.category === 'Software' ? 'Software Tech Stack & Architecture' : 'Physical Components & Lab Allocation'}
                </h3>
              </div>
              <span className="pn-id-pill" style={{ fontSize: '11px' }}>
                {project.currentMilestone || 'Project Initiation & Setup'}
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

          {/* Timeline of Major Events & Telemetry */}
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
                return (
                  <div key={idx} className="pn-timeline-item">
                    <div className={`pn-timeline-dot ${ev.type || 'creation'}`} />
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

        {/* RIGHT COLUMN: Access Code Security Vault & Team Roster */}
        <div className="pn-content-col">
          
          {/* Team Access Code Vault Card */}
          <div className="pn-code-vault">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Team Access Security Vault
                </span>
              </div>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: project.accessCodeStatus === 'revoked'
                  ? 'rgba(239, 68, 68, 0.25)'
                  : project.isAccessCodeClaimed
                  ? 'rgba(16, 185, 129, 0.25)'
                  : 'rgba(59, 130, 246, 0.25)',
                color: project.accessCodeStatus === 'revoked'
                  ? '#FCA5A5'
                  : project.isAccessCodeClaimed
                  ? '#6EE7B7'
                  : '#93C5FD',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {project.accessCodeStatus === 'revoked' ? 'Revoked' : project.isAccessCodeClaimed ? 'Claimed' : 'Active & Ready'}
              </span>
            </div>

            <div className="pn-code-display">
              {project.teamAccessCode || 'NEXUS-XXXX'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyCode}
                className="pn-vault-btn-copy"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied Access Code to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Team Access Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenSendInvite && onOpenSendInvite(project)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Send Registration Email</span>
              </button>
            </div>

            <div className="pn-vault-actions">
              <button
                type="button"
                onClick={() => setShowRegenConfirm(true)}
                className="pn-vault-btn-sub"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRevokeConfirm(true)}
                className="pn-vault-btn-sub danger"
              >
                <Slash className="w-3.5 h-3.5" />
                <span>Revoke</span>
              </button>
            </div>
          </div>

          {/* Assigned Team Roster Panel */}
          <div className="pn-panel">
            <div className="pn-panel-header">
              <div className="pn-panel-title-group">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="pn-panel-title">Assigned Team Roster</h3>
              </div>
              {project.isAccessCodeClaimed && (
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

            {project.isAccessCodeClaimed && (project.team?.name || project.team?.leader?.name) ? (
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

      {/* ── 6. Regenerate Code Confirmation Modal ── */}
      {showRegenConfirm && (
        <div className="pn-modal-backdrop" onClick={() => setShowRegenConfirm(false)}>
          <div className="pn-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB' }}>
              <RefreshCw className="w-5 h-5" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                Regenerate Access Code?
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Regenerating will instantly deactivate the previous access code (<code>{project.teamAccessCode}</code>) and generate a new secure code for the student team.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowRegenConfirm(false)}
                className="pn-action-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRegenerateCode && onRegenerateCode(project.projectId);
                  setShowRegenConfirm(false);
                }}
                className="pn-action-btn-primary"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Confirm & Regenerate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Revoke Code Confirmation Modal ── */}
      {showRevokeConfirm && (
        <div className="pn-modal-backdrop" onClick={() => setShowRevokeConfirm(false)}>
          <div className="pn-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
              <Slash className="w-5 h-5" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                Revoke Team Access Code?
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Revoking will block student logins using this access code until an administrator regenerates a new code.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(false)}
                className="pn-action-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRevokeCode && onRevokeCode(project.projectId);
                  setShowRevokeConfirm(false);
                }}
                className="pn-action-btn-danger"
              >
                <Slash className="w-4 h-4" />
                <span>Confirm Revoke</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
