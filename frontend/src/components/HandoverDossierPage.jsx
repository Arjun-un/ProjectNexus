import React, { useState, useEffect } from 'react';
import './HandoverDossierPage.css';
import {
  ArrowLeft,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  ShieldCheck,
  FolderGit2,
  GitBranch,
  GitCommit,
  Sparkles,
  Building2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sliders,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function HandoverDossierPage({
  project,
  onBack,
  onLaunchContinuationWorkspace
}) {
  const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' | 'simulator'
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulation Form State
  const [transferReason, setTransferReason] = useState(
    'Academic term conclusion & senior team internship migration'
  );
  const [newTeamName, setNewTeamName] = useState('Team Gamma (Continuation)');
  const [newLeadEmail, setNewLeadEmail] = useState('lead.gamma@college.edu');
  const [completedModules, setCompletedModules] = useState(
    'FaceNet embedding model (94.2% validation accuracy)\nStudent profile photo enrollment pipeline\nPostgreSQL vector database schema & indexing'
  );
  const [pendingModules, setPendingModules] = useState(
    'Anti-Spoofing & Liveness Filter (RGB camera spoof bug)\nEdge inference optimization (TensorRT on Jetson GPU)\nFaculty Attendance CSV Export module'
  );
  const [knownIssues, setKnownIssues] = useState(
    'RTSP memory leak on Wi-Fi reconnect\nHigh CPU inference latency (420ms -> target <80ms)'
  );
  const [facultyNotes, setFacultyNotes] = useState(
    'Hardware kit available in CS Lab 3, Locker #4. Base embedding network verified. Do not retrain from scratch — focus directly on liveness filtering and Jetson edge deployment.'
  );

  const [handoverData, setHandoverData] = useState({
    packetId: `HO-${project?.projectId || 'CSE-2025-041'}-v2.0`,
    fromVersion: project?.currentVersionNumber || 1,
    toVersion: (project?.currentVersionNumber || 1) + 1,
    fromTeamName: project?.team?.name || 'Alpha Visionary Labs',
    toTeamName: 'Team Gamma (Continuation)',
    progressAtHandover: project?.progress || 45,
    reason: 'Academic term conclusion & senior team internship migration',
    completedModules: [
      'FaceNet embedding model (94.2% validation accuracy)',
      'Student profile photo enrollment pipeline',
      'PostgreSQL vector database schema & indexing'
    ],
    pendingModules: [
      'Anti-Spoofing & Liveness Filter (RGB camera spoof bug)',
      'Edge inference optimization (TensorRT on Jetson GPU)',
      'Faculty Attendance CSV Export module'
    ],
    knownIssues: [
      'RTSP memory leak on Wi-Fi reconnect',
      'High CPU inference latency (420ms -> target <80ms)'
    ],
    facultyNotes: 'Hardware kit available in CS Lab 3, Locker #4. Base embedding network verified. Do not retrain from scratch — focus directly on liveness filtering and Jetson edge deployment.',
    hardwareLocation: 'Embedded Systems Lab 3, Workstation #4',
    githubUrl: project?.githubUrl || 'https://github.com/projectnexus/smart-attendance-system',
    pinnedCommitSha: '5fb748c',
    gitBranch: 'v1.0-handover-archive',
    newAccessCode: 'NEXUS-G789'
  });

  // Re-synchronize dynamically when a new project is selected
  useEffect(() => {
    if (!project) return;
    const currentVer = project.currentVersionNumber || 1;
    const nextVer = currentVer + 1;
    const pId = project.projectId || project._id || 'PROJ-001';
    const fromTeam = project.team?.name || (project.title ? `${project.title} Team` : 'Initial Team');
    const progressVal = project.progress !== undefined ? project.progress : 45;

    const defaultCompleted = [
      project.techStack && project.techStack.length > 0
        ? `Core stack pipeline implemented with ${project.techStack.slice(0, 3).join(', ')}`
        : `Sprint 1 & 2 baseline specifications and architecture verified`,
      project.category === 'IoT'
        ? `Sensor calibration and hardware schematic validation`
        : `User authentication, database schema, and REST API foundation`,
      `Milestone deliverables passed faculty review at ${progressVal}% progress`
    ];

    const defaultPending = [
      project.techStack && project.techStack.length > 3
        ? `Advanced service integration with ${project.techStack.slice(3).join(', ')}`
        : `Edge deployment and end-to-end production telemetry synchronization`,
      `Automated test coverage, edge load benchmarking and resilience checks`,
      `Final academic institutional presentation & documentation for department review`
    ];

    const defaultIssues = [
      `Throughput optimization required for high concurrency loads`,
      `Device reconnect error-handling under degraded network bandwidth`
    ];

    const defaultNotes = project.facultyGuide
      ? `Supervised by ${project.facultyGuide}. Inherit established baseline deliverables and consult departmental committee before altering core schemas.`
      : `Hardware and lab access registered in ${project.department || 'Department'}. Retain existing commit history.`;

    const repoUrl = project.githubUrl || project.githubIntegration?.repoUrl || `https://github.com/projectnexus/${pId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const labLoc = project.labAssigned || (project.category === 'IoT' ? 'Embedded Systems Lab (Room 304)' : 'Department Cloud Computing Lab');

    const nextTeamDefault = `Team NextGen (v${nextVer}.0)`;
    const nextEmailDefault = `lead.${pId.toLowerCase().replace(/[^a-z0-9]/g, '')}@college.edu`;
    const generatedAccessCode = `NEXUS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    setTransferReason('Academic term conclusion & senior team internship migration');
    setNewTeamName(nextTeamDefault);
    setNewLeadEmail(nextEmailDefault);
    setCompletedModules(defaultCompleted.join('\n'));
    setPendingModules(defaultPending.join('\n'));
    setKnownIssues(defaultIssues.join('\n'));
    setFacultyNotes(defaultNotes);

    setHandoverData({
      packetId: `HO-${pId}-v${nextVer}.0`,
      fromVersion: currentVer,
      toVersion: nextVer,
      fromTeamName: fromTeam,
      toTeamName: nextTeamDefault,
      progressAtHandover: progressVal,
      reason: 'Academic term conclusion & senior team internship migration',
      completedModules: defaultCompleted,
      pendingModules: defaultPending,
      knownIssues: defaultIssues,
      facultyNotes: defaultNotes,
      hardwareLocation: labLoc,
      githubUrl: repoUrl,
      pinnedCommitSha: project.githubIntegration?.lastCommitSha ? project.githubIntegration.lastCommitSha.slice(0, 7) : '5fb748c',
      gitBranch: `v${currentVer}.0-handover-archive`,
      newAccessCode: generatedAccessCode
    });
  }, [project]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(handoverData.newAccessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const pid = project?.projectId || 'CSE-2025-642';
      const res = await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(pid)}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: transferReason,
          newTeamName,
          newLeadEmail,
          completedModules: completedModules.split('\n').filter(Boolean),
          pendingModules: pendingModules.split('\n').filter(Boolean),
          knownIssues: knownIssues.split('\n').filter(Boolean),
          facultyNotes
        })
      });

      const json = await res.json();
      if (json.success && json.data?.handoverRecord) {
        const rec = json.data.handoverRecord;
        setHandoverData(prev => ({
          ...prev,
          packetId: rec.packetId || prev.packetId,
          fromVersion: rec.fromVersion,
          toVersion: rec.toVersion,
          fromTeamName: rec.fromTeamName,
          toTeamName: rec.toTeamName,
          progressAtHandover: rec.progressAtHandover,
          reason: rec.discontinuationReason,
          completedModules: rec.completedModules,
          pendingModules: rec.pendingModules,
          knownIssues: rec.knownIssues,
          facultyNotes: rec.facultyNotes,
          newAccessCode: rec.newAccessCode || prev.newAccessCode
        }));
      }
    } catch {
      // Offline fallback state update
      setHandoverData(prev => ({
        ...prev,
        toTeamName: newTeamName,
        reason: transferReason,
        completedModules: completedModules.split('\n').filter(Boolean),
        pendingModules: pendingModules.split('\n').filter(Boolean),
        knownIssues: knownIssues.split('\n').filter(Boolean),
        facultyNotes
      }));
    } finally {
      setIsSubmitting(false);
      setActiveTab('dossier');
    }
  };

  return (
    <div className="pn-dossier-page">
      <div className="pn-dossier-inner">
        
        {/* ── Top Bar ── */}
        <div className="pn-dossier-topbar">
          <button onClick={onBack} className="pn-dossier-back-btn" type="button">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Gateway</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="pn-dossier-protocol-badge">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Versioned Continuity Engine</span>
            </span>

            <div style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('dossier')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'dossier' ? '#7C3AED' : 'transparent',
                  color: '#FFFFFF',
                  transition: 'background 0.15s ease'
                }}
              >
                Official Handover Dossier
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'simulator' ? '#7C3AED' : 'transparent',
                  color: '#FFFFFF',
                  transition: 'background 0.15s ease'
                }}
              >
                Configure Parameters
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'dossier' ? (
          /* ══════════════════════════════════════════════════════ */
          /* 1. OFFICIAL HANDOVER DOSSIER & CERTIFICATE VIEW       */
          /* ══════════════════════════════════════════════════════ */
          <div className="pn-dossier-cert-card">
            
            {/* Header Row */}
            <div className="pn-dossier-header-row">
              <div className="pn-dossier-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C4B5FD' }}>
                    Institutional Continuity & Handover Protocol
                  </span>
                </div>
                <h1>{project?.title || 'AI Based Smart Attendance Management'}</h1>
                <p>
                  Formal version transition certificate verifying deliverable preservation, technical debt inheritance, and repository state continuity.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span className="pn-dossier-packet-id">{handoverData.packetId}</span>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
                  Status: Transition Verified
                </span>
              </div>
            </div>

            {/* Version Transition Ribbon */}
            <div className="pn-dossier-step-ribbon">
              {/* Outgoing Team */}
              <div className="pn-ribbon-team-box">
                <span className="pn-ribbon-team-tag" style={{ color: '#F87171' }}>
                  Outgoing Version v{handoverData.fromVersion}.0 (Archived)
                </span>
                <span className="pn-ribbon-team-name">{handoverData.fromTeamName}</span>
                <span className="pn-ribbon-team-meta">
                  Discontinued at <strong>{handoverData.progressAtHandover}%</strong> completion • {handoverData.reason}
                </span>
              </div>

              {/* Handover Engine Junction */}
              <div className="pn-ribbon-arrow-box">
                <span className="pn-ribbon-engine-pill">Zero Knowledge Loss</span>
                <GitFork className="w-6 h-6 stroke-[2.2]" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#DDD6FE' }}>
                  Handover Engine
                </span>
              </div>

              {/* Incoming Continuation Team */}
              <div className="pn-ribbon-team-box" style={{ textAlign: 'right' }}>
                <span className="pn-ribbon-team-tag" style={{ color: '#34D399' }}>
                  Continuation Version v{handoverData.toVersion}.0 (Active)
                </span>
                <span className="pn-ribbon-team-name">{handoverData.toTeamName}</span>
                <span className="pn-ribbon-team-meta">
                  Resuming from <strong>{handoverData.progressAtHandover}%</strong> baseline • Access code: <code style={{ color: '#A78BFA' }}>{handoverData.newAccessCode}</code>
                </span>
              </div>
            </div>

            {/* 4 Quadrants: Deliverables, Debt, Repository, Faculty Notes */}
            <div className="pn-dossier-quad-grid">
              
              {/* 1. Verified Working Deliverables */}
              <div className="pn-quad-card deliverables">
                <div className="pn-quad-header">
                  <h3 className="pn-quad-title" style={{ color: '#34D399' }}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Deliverables (Preserved v1.0)</span>
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                    Locked
                  </span>
                </div>
                <div className="pn-quad-list">
                  {handoverData.completedModules.map((item, idx) => (
                    <div key={idx} className="pn-quad-item completed">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Inherited Technical Debt & Open Blockers */}
              <div className="pn-quad-card debt">
                <div className="pn-quad-header">
                  <h3 className="pn-quad-title" style={{ color: '#FBBF24' }}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Inherited Technical Debt (Backlog for v2.0)</span>
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#FBBF24', backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                    Pending
                  </span>
                </div>
                <div className="pn-quad-list">
                  {handoverData.pendingModules.map((item, idx) => (
                    <div key={idx} className="pn-quad-item pending">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Codebase State & Hardware Location */}
              <div className="pn-quad-card" style={{ gridColumn: 'span 2' }}>
                <div className="pn-quad-header">
                  <h3 className="pn-quad-title" style={{ color: '#C084FC' }}>
                    <FolderGit2 className="w-4 h-4" />
                    <span>Repository Codebase Snapshot & Physical Lab Allocation</span>
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#C084FC', fontFamily: 'monospace' }}>
                    SHA: {handoverData.pinnedCommitSha}
                  </span>
                </div>

                <div className="pn-vault-specs-grid">
                  <div className="pn-spec-box">
                    <span className="pn-spec-label">GitHub Repository URL</span>
                    <span className="pn-spec-val" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {handoverData.githubUrl}
                    </span>
                  </div>
                  <div className="pn-spec-box">
                    <span className="pn-spec-label">Frozen Archive Branch</span>
                    <span className="pn-spec-val">{handoverData.gitBranch}</span>
                  </div>
                  <div className="pn-spec-box">
                    <span className="pn-spec-label">Physical Hardware Bench</span>
                    <span className="pn-spec-val">{handoverData.hardwareLocation}</span>
                  </div>
                  <div className="pn-spec-box">
                    <span className="pn-spec-label">New Team Access Code</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="pn-spec-val" style={{ color: '#A78BFA', fontSize: '14px' }}>
                        {handoverData.newAccessCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                        title="Copy Code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Faculty Guide Advisory Directive */}
            <div className="pn-faculty-card">
              <div className="pn-faculty-avatar">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '12.5px', color: '#C7D2FE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Faculty Guide Handover Directive • {project?.facultyGuide || 'Prof. Vikram Malhotra'}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#A5B4FC', fontFamily: 'monospace' }}>
                    Verified Sign-off
                  </span>
                </div>
                <p className="pn-faculty-directive-text">
                  "{handoverData.facultyNotes}"
                </p>
              </div>
            </div>

            {/* Launch Workspace Action Bar */}
            <div className="pn-dossier-actions">
              <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>
                Ready to resume development as <strong style={{ color: '#FFFFFF' }}>{handoverData.toTeamName}</strong>?
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => onLaunchContinuationWorkspace && onLaunchContinuationWorkspace(handoverData)}
                  className="pn-btn-launch-workspace"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Open v2.0 Continuation Workspace →</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* ══════════════════════════════════════════════════════ */
          /* 2. SIMULATION CONFIGURATOR VIEW                      */
          /* ══════════════════════════════════════════════════════ */
          <div className="pn-dossier-cert-card">
            <div className="pn-dossier-header-row">
              <div className="pn-dossier-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sliders className="w-5 h-5 text-purple-400" />
                  <span style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C4B5FD' }}>
                    Simulation Parameter Configurator
                  </span>
                </div>
                <h1>Custom Continuity Pipeline Setup</h1>
                <p>
                  Customize deliverables, unresolved technical debt, and continuation team credentials before generating the Handover Packet.
                </p>
              </div>
            </div>

            <form onSubmit={handleRunSimulation} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C4B5FD', marginBottom: '6px' }}>
                    Discontinuation Reason
                  </label>
                  <input
                    type="text"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C4B5FD', marginBottom: '6px' }}>
                    Incoming Continuation Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#34D399', marginBottom: '6px' }}>
                    Completed Working Modules (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={completedModules}
                    onChange={(e) => setCompletedModules(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '10px',
                      color: '#D1FAE5',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#FBBF24', marginBottom: '6px' }}>
                    Pending Technical Debt & Blockers (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={pendingModules}
                    onChange={(e) => setPendingModules(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '10px',
                      color: '#FEF3C7',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C4B5FD', marginBottom: '6px' }}>
                  Faculty Guide Advisory Directives
                </label>
                <textarea
                  rows={2}
                  value={facultyNotes}
                  onChange={(e) => setFacultyNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(2, 6, 23, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('dossier')}
                  className="pn-dossier-back-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="pn-btn-launch-workspace"
                  style={{ padding: '10px 22px', fontSize: '13px' }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Handover Packet...</span>
                    </>
                  ) : (
                    <>
                      <GitFork className="w-4 h-4" />
                      <span>Execute Handover & Update Dossier</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
