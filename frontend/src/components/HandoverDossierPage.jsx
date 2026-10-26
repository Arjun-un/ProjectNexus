import React, { useState, useEffect } from 'react';
import './HandoverDossierPage.css';
import {
  ArrowLeft,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  FolderGit2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sliders,
  User,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

export default function HandoverDossierPage({
  project: initialProject,
  onBack,
  onLaunchContinuationWorkspace
}) {
  const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' | 'simulator'
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available projects open to handover from the backend database
  const [availableProjects, setAvailableProjects] = useState([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);
  const [activeProject, setActiveProject] = useState(initialProject || null);

  // Fetch all projects open to handover
  useEffect(() => {
    let isMounted = true;
    const fetchOpenProjects = async () => {
      try {
        setIsLoadingAvailable(true);
        const res = await fetch('http://localhost:5000/api/projects/handover/available');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data)) {
            setAvailableProjects(json.data);
            // If no project was specifically selected yet, or if initialProject is not set
            if (!initialProject && json.data.length > 0) {
              setActiveProject(json.data[0]);
            } else if (initialProject) {
              // Ensure activeProject has latest data from open projects list if present
              const matched = json.data.find(p => p.projectId === initialProject.projectId || p._id === initialProject._id);
              if (matched) {
                setActiveProject(matched);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Backend fetch for open handovers:', err);
      } finally {
        if (isMounted) setIsLoadingAvailable(false);
      }
    };

    fetchOpenProjects();
    return () => { isMounted = false; };
  }, [initialProject]);

  const currentProject = activeProject || initialProject;

  // Simulation Form State
  const [transferReason, setTransferReason] = useState(
    currentProject?.handoverReason || 'Academic term conclusion & senior team internship migration'
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
    packetId: `HO-${currentProject?.projectId || 'CSE-2025-041'}-v2.0`,
    fromVersion: currentProject?.currentVersionNumber || 1,
    toVersion: (currentProject?.currentVersionNumber || 1) + 1,
    fromTeamName: currentProject?.team?.name || 'Alpha Visionary Labs',
    toTeamName: 'Team Gamma (Continuation)',
    progressAtHandover: currentProject?.progress || 45,
    reason: currentProject?.handoverReason || 'Academic term conclusion & senior team internship migration',
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
    githubUrl: currentProject?.githubUrl || 'https://github.com/projectnexus/smart-attendance-system',
    pinnedCommitSha: '5fb748c',
    gitBranch: 'v1.0-handover-archive',
    newAccessCode: 'NEXUS-G789'
  });

  // Re-synchronize dynamically when a project is selected
  useEffect(() => {
    if (!currentProject) return;
    const currentVer = currentProject.currentVersionNumber || 1;
    const nextVer = currentVer + 1;
    const pId = currentProject.projectId || currentProject._id || 'PROJ-001';
    const fromTeam = currentProject.team?.name || (currentProject.title ? `${currentProject.title} Team` : 'Outgoing Team');
    const progressVal = currentProject.progress !== undefined ? currentProject.progress : 45;

    const defaultCompleted = [
      currentProject.techStack && currentProject.techStack.length > 0
        ? `Core stack pipeline implemented with ${currentProject.techStack.slice(0, 3).join(', ')}`
        : `Sprint 1 & 2 baseline specifications and architecture verified`,
      currentProject.category === 'IoT'
        ? `Sensor calibration and hardware schematic validation`
        : `User authentication, database schema, and REST API foundation`,
      `Milestone deliverables passed faculty review at ${progressVal}% progress`
    ];

    const defaultPending = [
      currentProject.techStack && currentProject.techStack.length > 3
        ? `Advanced service integration with ${currentProject.techStack.slice(3).join(', ')}`
        : `Edge deployment and end-to-end production telemetry synchronization`,
      `Automated test coverage, edge load benchmarking and resilience checks`,
      `Final academic institutional presentation & documentation for department review`
    ];

    const defaultIssues = [
      `Throughput optimization required for high concurrency loads`,
      `Device reconnect error-handling under degraded network bandwidth`
    ];

    const defaultNotes = currentProject.facultyGuide
      ? `Supervised by ${currentProject.facultyGuide}. Inherit established baseline deliverables and consult departmental committee before altering core schemas.`
      : `Hardware and lab access registered in ${currentProject.department || 'Department'}. Retain existing commit history.`;

    const repoUrl = currentProject.githubUrl || currentProject.githubIntegration?.repoUrl || `https://github.com/projectnexus/${pId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const labLoc = currentProject.labAssigned || (currentProject.category === 'IoT' ? 'Embedded Systems Lab (Room 304)' : 'Department Cloud Computing Lab');

    const nextTeamDefault = `Team NextGen (v${nextVer}.0)`;
    const nextEmailDefault = `lead.${pId.toLowerCase().replace(/[^a-z0-9]/g, '')}@college.edu`;
    const generatedAccessCode = `NEXUS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const reasonText = currentProject.handoverReason || 'Academic term conclusion & senior team internship migration';

    setTransferReason(reasonText);
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
      reason: reasonText,
      completedModules: defaultCompleted,
      pendingModules: defaultPending,
      knownIssues: defaultIssues,
      facultyNotes: defaultNotes,
      hardwareLocation: labLoc,
      githubUrl: repoUrl,
      pinnedCommitSha: currentProject.githubIntegration?.lastCommitSha ? currentProject.githubIntegration.lastCommitSha.slice(0, 7) : '5fb748c',
      gitBranch: `v${currentVer}.0-handover-archive`,
      newAccessCode: generatedAccessCode
    });
  }, [currentProject]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(handoverData.newAccessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const pid = currentProject?.projectId || 'CSE-2025-642';
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className="pn-dossier-protocol-badge">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Versioned Continuity Engine</span>
            </span>

            <div className="pn-dossier-tab-group">
              <button
                type="button"
                onClick={() => setActiveTab('dossier')}
                className={`pn-dossier-tab-btn ${activeTab === 'dossier' ? 'active' : ''}`}
              >
                Official Handover Dossier
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className={`pn-dossier-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
              >
                Configure Parameters
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* AVAILABLE HANDOVER PROJECTS SELECTOR SECTION           */}
        {/* ══════════════════════════════════════════════════════ */}
        <div className="pn-handover-available-section">
          <div className="pn-handover-available-header">
            <div>
              <div className="pn-handover-available-title">
                <GitFork className="w-5 h-5 text-indigo-600" />
                <h2>Projects Open for Continuity & Handover</h2>
                <span className="pn-handover-count-pill">
                  {availableProjects.length} Available
                </span>
              </div>
              <p className="pn-handover-available-desc">
                Academic engineering projects flagged by administrators for succession transfer, technical debt inheritance, and versioned continuity.
              </p>
            </div>

            {isLoadingAvailable && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Syncing live handover records...</span>
              </div>
            )}
          </div>

          {availableProjects.length > 0 ? (
            <div className="pn-handover-available-grid">
              {availableProjects.map((proj) => {
                const isSelected = (currentProject?.projectId === proj.projectId) || (currentProject?._id === proj._id);
                const progressPct = proj.progress !== undefined ? proj.progress : 45;
                const outgoingTeamName = proj.team?.name || 'Previous Student Team';
                const guideName = proj.facultyGuide || 'Department Committee';

                return (
                  <div
                    key={proj.projectId || proj._id}
                    onClick={() => setActiveProject(proj)}
                    className={`pn-handover-project-card ${isSelected ? 'active' : ''}`}
                  >
                    {/* Top Row: ID, Category & Handover Tag */}
                    <div className="pn-handover-card-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="pn-handover-card-id">{proj.projectId}</span>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: proj.category === 'IoT' ? '#FEF3C7' : proj.category === 'Hardware' ? '#FEE2E2' : '#EFF6FF',
                          color: proj.category === 'IoT' ? '#B45309' : proj.category === 'Hardware' ? '#B91C1C' : '#1D4ED8',
                          border: `1px solid ${proj.category === 'IoT' ? '#FDE68A' : proj.category === 'Hardware' ? '#FECACA' : '#BFDBFE'}`
                        }}>
                          {proj.category || 'Software'}
                        </span>
                      </div>

                      <span className="pn-handover-card-tag">
                        <GitFork className="w-3 h-3" />
                        Open to Handover
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="pn-handover-card-title">
                      {proj.title}
                    </h3>

                    {/* Meta List: Guide, Outgoing Team, Dept */}
                    <div className="pn-handover-card-meta-list">
                      <div className="pn-handover-card-meta-item">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Outgoing: <strong>{outgoingTeamName}</strong></span>
                      </div>

                      <div className="pn-handover-card-meta-item">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Guide: <strong>{guideName}</strong></span>
                      </div>

                      <div className="pn-handover-card-meta-item">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{proj.department || 'Computer Science'} • {proj.academicYear || '2025-2026'}</span>
                      </div>
                    </div>

                    {/* Handover / Discontinuation Reason */}
                    {proj.handoverReason && (
                      <div className="pn-handover-card-reason-box">
                        "{proj.handoverReason}"
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="pn-handover-card-progress">
                      <div className="pn-handover-progress-label">
                        <span>Deliverables Baseline</span>
                        <span style={{ color: '#2563EB', fontWeight: 800 }}>{progressPct}% Preserved</span>
                      </div>
                      <div className="pn-handover-progress-track">
                        <div
                          className="pn-handover-progress-fill"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Tech Stack Chips */}
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                        {proj.techStack.slice(0, 4).map((tech, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#475569',
                              backgroundColor: '#F1F5F9',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #E2E8F0'
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Selection Indicator */}
                    <div className={`pn-handover-card-footer ${isSelected ? 'active' : 'inactive'}`}>
                      <span>{isSelected ? '✓ Currently Inspecting Dossier' : 'Click to Inspect Dossier'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pn-handover-empty-banner">
              <div className="pn-handover-empty-icon">
                <GitFork className="w-6 h-6" />
              </div>
              <div>
                <h3 className="pn-handover-empty-title">
                  No Projects Flagged for Handover Yet
                </h3>
                <p className="pn-handover-empty-desc">
                  Institutional Administrators can flag active or discontinued student projects as <strong>"Open to Handover"</strong> from the Admin Project Directory. Flagged projects will automatically appear here for incoming continuation teams to inspect and inherit.
                </p>
              </div>

              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="pn-dossier-back-btn"
                  style={{ marginTop: '4px' }}
                >
                  Return to Dashboard
                </button>
              )}
            </div>
          )}
        </div>

        {activeTab === 'dossier' ? (
          /* ══════════════════════════════════════════════════════ */
          /* 1. OFFICIAL HANDOVER DOSSIER & CERTIFICATE VIEW       */
          /* ══════════════════════════════════════════════════════ */
          <div className="pn-dossier-cert-card">
            
            {/* Header Row */}
            <div className="pn-dossier-header-row">
              <div className="pn-dossier-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563EB' }}>
                    Institutional Continuity & Handover Protocol
                  </span>
                </div>
                <h1>{currentProject?.title || 'Smart Attendance System using Edge Vision'}</h1>
                <p>
                  Formal version transition certificate verifying deliverable preservation, technical debt inheritance, and repository state continuity.
                </p>
              </div>

              <div className="pn-dossier-meta-column">
                <span className="pn-dossier-packet-id">{handoverData.packetId}</span>
                <span className="pn-dossier-status-pill">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Transition Verified</span>
                </span>
              </div>
            </div>

            {/* Version Transition Ribbon */}
            <div className="pn-dossier-step-ribbon">
              {/* Outgoing Team */}
              <div className="pn-ribbon-team-box">
                <span className="pn-ribbon-team-tag outgoing">
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
                <GitFork className="w-5 h-5 stroke-[2.2]" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#4338CA' }}>
                  Handover Engine
                </span>
              </div>

              {/* Incoming Continuation Team */}
              <div className="pn-ribbon-team-box" style={{ textAlign: 'right' }}>
                <span className="pn-ribbon-team-tag incoming">
                  Continuation Version v{handoverData.toVersion}.0 (Active)
                </span>
                <span className="pn-ribbon-team-name">{handoverData.toTeamName}</span>
                <span className="pn-ribbon-team-meta">
                  Resuming from <strong>{handoverData.progressAtHandover}%</strong> baseline • Access code: <code style={{ color: '#2563EB', fontWeight: 700 }}>{handoverData.newAccessCode}</code>
                </span>
              </div>
            </div>

            {/* 4 Quadrants: Deliverables, Debt, Repository, Faculty Notes */}
            <div className="pn-dossier-quad-grid">
              
              {/* 1. Verified Working Deliverables */}
              <div className="pn-quad-card deliverables">
                <div className="pn-quad-header">
                  <h3 className="pn-quad-title deliverables-title">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Deliverables (Preserved v{handoverData.fromVersion}.0)</span>
                  </h3>
                  <span className="pn-quad-badge deliverables-badge">
                    Locked
                  </span>
                </div>
                <div className="pn-quad-list">
                  {handoverData.completedModules.map((item, idx) => (
                    <div key={idx} className="pn-quad-item completed">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Inherited Technical Debt & Open Blockers */}
              <div className="pn-quad-card debt">
                <div className="pn-quad-header">
                  <h3 className="pn-quad-title debt-title">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Inherited Technical Debt (Backlog for v{handoverData.toVersion}.0)</span>
                  </h3>
                  <span className="pn-quad-badge debt-badge">
                    Pending
                  </span>
                </div>
                <div className="pn-quad-list">
                  {handoverData.pendingModules.map((item, idx) => (
                    <div key={idx} className="pn-quad-item pending">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Codebase State & Hardware Location */}
              <div className="pn-quad-card" style={{ gridColumn: 'span 2' }}>
                <div className="pn-quad-header">
                  <h3 className="pn-quad-title" style={{ color: '#4F46E5' }}>
                    <FolderGit2 className="w-4 h-4 text-indigo-600" />
                    <span>Repository Codebase Snapshot & Physical Lab Allocation</span>
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', fontFamily: 'monospace', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                    SHA: {handoverData.pinnedCommitSha}
                  </span>
                </div>

                <div className="pn-vault-specs-grid">
                  <div className="pn-spec-box">
                    <span className="pn-spec-label">GitHub Repository URL</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span className="pn-spec-val" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {handoverData.githubUrl}
                      </span>
                      <a
                        href={handoverData.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open Repository"
                        style={{ color: '#2563EB', display: 'flex', alignItems: 'center' }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
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
                      <span className="pn-spec-val" style={{ color: '#2563EB', fontSize: '14px', fontWeight: 700 }}>
                        {handoverData.newAccessCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 2 }}
                        title="Copy Access Code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
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
                  <strong style={{ fontSize: '12px', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Faculty Guide Handover Directive • {currentProject?.facultyGuide || 'Prof. Vikram Malhotra'}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, backgroundColor: '#DBEAFE', padding: '1px 8px', borderRadius: '4px' }}>
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
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Ready to resume development as <strong style={{ color: '#0F172A' }}>{handoverData.toTeamName}</strong>?
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => onLaunchContinuationWorkspace && onLaunchContinuationWorkspace(handoverData)}
                  className="pn-btn-launch-workspace"
                >
                  <Sparkles className="w-4 h-4 text-blue-100" />
                  <span>Open v{handoverData.toVersion}.0 Continuation Workspace →</span>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563EB' }}>
                    Simulation Parameter Configurator
                  </span>
                </div>
                <h1>Custom Continuity Pipeline Setup</h1>
                <p>
                  Customize deliverables, unresolved technical debt, and continuation team credentials before generating the Handover Packet for <strong>{currentProject?.title}</strong>.
                </p>
              </div>
            </div>

            <form onSubmit={handleRunSimulation} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="pn-config-form-group">
                  <label className="pn-config-label">
                    Discontinuation Reason
                  </label>
                  <input
                    type="text"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    required
                    className="pn-config-input"
                  />
                </div>

                <div className="pn-config-form-group">
                  <label className="pn-config-label">
                    Incoming Continuation Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                    className="pn-config-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="pn-config-form-group">
                  <label className="pn-config-label" style={{ color: '#065F46' }}>
                    Completed Working Modules (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={completedModules}
                    onChange={(e) => setCompletedModules(e.target.value)}
                    required
                    className="pn-config-textarea"
                    style={{ borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }}
                  />
                </div>

                <div className="pn-config-form-group">
                  <label className="pn-config-label" style={{ color: '#92400E' }}>
                    Pending Technical Debt & Blockers (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={pendingModules}
                    onChange={(e) => setPendingModules(e.target.value)}
                    required
                    className="pn-config-textarea"
                    style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}
                  />
                </div>
              </div>

              <div className="pn-config-form-group">
                <label className="pn-config-label">
                  Faculty Guide Advisory Directives
                </label>
                <textarea
                  rows={2}
                  value={facultyNotes}
                  onChange={(e) => setFacultyNotes(e.target.value)}
                  className="pn-config-textarea"
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
