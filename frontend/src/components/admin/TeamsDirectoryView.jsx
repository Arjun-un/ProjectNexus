import React, { useState, useEffect, useMemo } from 'react';
import './TeamsDirectoryView.css';
import {
  Users,
  Search,
  FolderGit2,
  GitBranch,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  X,
  User,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function TeamsDirectoryView({
  projects = [],
  onSelectProject,
  onOpenSendInvite,
  getCategoryBadge,
  getHealthBadge
}) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeModalTeam, setActiveModalTeam] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // ── Fetch teams from backend API ──
  useEffect(() => {
    let isMounted = true;
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/projects/teams/all');
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setTeams(json.data);
        } else if (isMounted) {
          // Fallback extraction from projects prop
          extractTeamsFromProjects(projects);
        }
      } catch (err) {
        if (isMounted) {
          extractTeamsFromProjects(projects);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const extractTeamsFromProjects = (projs) => {
      const extracted = projs
        .filter(p => p.team?.name || p.team?.leader?.name || p.isAccessCodeClaimed)
        .map(p => ({
          _id: p._id || p.projectId,
          teamId: p._id || p.projectId,
          projectId: p.projectId,
          projectObjectId: p._id,
          teamName: p.team?.name || `${p.title} Team`,
          projectTitle: p.title,
          category: p.category || 'Software',
          department: p.department || 'General',
          academicYear: p.academicYear || '2025-2026',
          facultyGuide: p.facultyGuide || 'Not assigned',
          progress: p.progress || 0,
          health: p.health || 'Not Tracked',
          healthScore: p.healthScore || 0,
          status: p.status || 'Active',
          teamAccessCode: p.teamAccessCode || '',
          isAccessCodeClaimed: p.isAccessCodeClaimed || false,
          leader: {
            name: p.team?.leader?.name || '',
            email: p.team?.leader?.email || p.invitedLeadEmail || '',
            rollNo: p.team?.leader?.rollNo || p.team?.leader?.usn || '',
            role: p.team?.leader?.role || 'Team Lead',
            githubUsername: p.team?.leader?.githubUsername || '',
            contribution: p.team?.leader?.contribution || ''
          },
          members: (p.team?.members || []).map(m => ({
            name: m.name || '',
            email: m.email || '',
            rollNo: m.rollNo || m.usn || '',
            role: m.role || 'Project Contributor',
            githubUsername: m.githubUsername || '',
            contribution: m.contribution || '',
            tasksAssigned: m.tasksAssigned || 0
          })),
          memberCount: (p.team?.members?.length || 0) + (p.team?.leader?.name ? 1 : 0),
          githubRepoUrl: p.githubUrl || p.githubIntegration?.repoUrl || '',
          gitBranch: 'main',
          webhookUrl: `https://support-shy-overcook.ngrok-free.dev/api/webhooks/repo/${p.projectId}`
        }));
      setTeams(extracted);
    };

    fetchTeams();
    return () => { isMounted = false; };
  }, [projects]);

  // ── Filtered teams ──
  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (t.teamName && t.teamName.toLowerCase().includes(q)) ||
        (t.projectTitle && t.projectTitle.toLowerCase().includes(q)) ||
        (t.projectId && t.projectId.toLowerCase().includes(q)) ||
        (t.leader?.name && t.leader.name.toLowerCase().includes(q)) ||
        (t.leader?.email && t.leader.email.toLowerCase().includes(q)) ||
        (t.members && t.members.some(m => m.name && m.name.toLowerCase().includes(q)));

      const matchesDept = filterDepartment === 'All' || t.department === filterDepartment;
      const matchesCat = filterCategory === 'All' || t.category === filterCategory;

      return matchesSearch && matchesDept && matchesCat;
    });
  }, [teams, searchQuery, filterDepartment, filterCategory]);

  // ── Overall Metrics ──
  const totalTeams = teams.length;
  const totalContributors = teams.reduce((acc, t) => acc + (t.memberCount || 0), 0);
  const avgTeamSize = totalTeams > 0 ? (totalContributors / totalTeams).toFixed(1) : 0;

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="pn-teams-container">
      
      {/* ── 1. Page Header & Quick KPIs ── */}
      <div className="pn-teams-header">
        <div>
          <h1 className="pn-teams-title">Student Project Teams Directory</h1>
          <p className="pn-teams-subtitle">
            Centralized directory of registered capstone engineering teams, designated student leads, and member rosters.
          </p>
        </div>

        <div className="pn-teams-quick-stats">
          <div className="pn-teams-stat-pill">
            <span>Registered Teams:</span>
            <strong>{totalTeams}</strong>
          </div>
          <div className="pn-teams-stat-pill">
            <span>Total Student Contributors:</span>
            <strong>{totalContributors}</strong>
          </div>
          <div className="pn-teams-stat-pill">
            <span>Avg Team Size:</span>
            <strong>{avgTeamSize} / team</strong>
          </div>
        </div>
      </div>

      {/* ── 2. Search & Filtering Bar ── */}
      <div className="pn-teams-filter-bar">
        <div className="pn-teams-search-wrap">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams by team name, student lead, member, or project ID..."
            className="pn-teams-search-input"
          />
        </div>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="pn-teams-select"
        >
          <option value="All">All Departments</option>
          <option value="Computer Science & Engineering">Computer Science</option>
          <option value="Electronics & Communication">Electronics & Comm</option>
          <option value="Information Technology">Information Tech</option>
          <option value="Mechanical Engineering">Mechanical</option>
          <option value="Electrical & Electronics">Electrical</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="pn-teams-select"
        >
          <option value="All">All Categories</option>
          <option value="Software">Software</option>
          <option value="IoT">IoT</option>
          <option value="Hardware">Hardware</option>
        </select>
      </div>

      {/* ── 3. Registered Teams Grid ── */}
      {filteredTeams.length > 0 ? (
        <div className="pn-teams-grid">
          {filteredTeams.map((team) => (
            <div
              key={team.projectId || team._id}
              className="pn-team-card"
              onClick={() => setActiveModalTeam(team)}
            >
              <div>
                {/* Front Block Header */}
                <div className="pn-team-card-header">
                  <div>
                    <h3 className="pn-team-name">
                      {team.teamName || 'Registered Team'}
                    </h3>
                    <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                      {team.department || 'Engineering'}
                    </span>
                  </div>
                  <div>
                    {getCategoryBadge && getCategoryBadge(team.category)}
                  </div>
                </div>

                {/* Project Details Reference */}
                <div className="pn-team-project-meta" style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: '#64748B' }}>
                      Assigned Project:
                    </span>
                    <span className="pn-team-project-id">
                      {team.projectId}
                    </span>
                  </div>
                  <div className="pn-team-project-title">
                    {team.projectTitle}
                  </div>
                </div>

                {/* Designated Team Lead Block */}
                <div className="pn-team-lead-block" style={{ marginTop: '12px' }}>
                  <div className="pn-team-lead-avatar">
                    {team.leader?.name ? team.leader.name[0].toUpperCase() : 'L'}
                  </div>
                  <div className="pn-team-lead-info">
                    <div className="pn-team-lead-name">
                      {team.leader?.name || (team.leader?.email ? team.leader.email.split('@')[0] : 'Lead Not Assigned')}
                    </div>
                    <div className="pn-team-lead-role">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      <span>{team.leader?.role || 'Team Lead'}</span>
                      {team.leader?.rollNo && (
                        <span style={{ color: '#64748B', fontFamily: 'monospace' }}>• {team.leader.rollNo}</span>
                      )}
                    </div>
                    {team.leader?.email && (
                      <div className="pn-team-lead-email">
                        {team.leader.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Front Block Footer */}
              <div className="pn-team-card-footer">
                <span className="pn-member-badge">
                  <Users className="w-3.5 h-3.5" />
                  <span>{team.members?.length ? `${team.members.length + 1} Members` : '1 Member'}</span>
                </span>

                <span className="pn-card-inspect-link">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px dashed #CBD5E1',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          color: '#64748B'
        }}>
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>
            No registered student teams matching your filters
          </h3>
          <p style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '400px', margin: '6px auto 0' }}>
            Try clearing search filters or invite new student teams from the Projects directory.
          </p>
        </div>
      )}

      {/* ── 4. Full Team Details Modal ── */}
      {activeModalTeam && (
        <div className="pn-modal-backdrop" onClick={() => setActiveModalTeam(null)}>
          <div className="pn-team-detail-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="pn-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="pn-id-pill" style={{ fontSize: '11px' }}>
                    {activeModalTeam.projectId}
                  </span>
                  {getCategoryBadge && getCategoryBadge(activeModalTeam.category)}
                  <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                    {activeModalTeam.academicYear}
                  </span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {activeModalTeam.teamName}
                </h2>
                <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>
                  Project: <strong>{activeModalTeam.projectTitle}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalTeam(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  color: '#64748B'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="pn-modal-body">
              
              {/* Leader Profile Card */}
              <div>
                <div className="pn-detail-section-title">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Designated Team Leader</span>
                </div>

                <div className="pn-detail-lead-card">
                  <div className="pn-detail-lead-avatar">
                    {activeModalTeam.leader?.name ? activeModalTeam.leader.name[0].toUpperCase() : 'L'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                        {activeModalTeam.leader?.name || 'Lead Not Assigned'}
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {activeModalTeam.leader?.role || 'Team Lead'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#64748B', flexWrap: 'wrap' }}>
                      {activeModalTeam.leader?.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${activeModalTeam.leader.email}`} style={{ color: '#2563EB', textDecoration: 'none' }}>
                            {activeModalTeam.leader.email}
                          </a>
                        </div>
                      )}
                      {activeModalTeam.leader?.rollNo && (
                        <div>
                          <strong>Roll No / USN:</strong> {activeModalTeam.leader.rollNo}
                        </div>
                      )}
                      {activeModalTeam.leader?.githubUsername && (
                        <div>
                          <strong>GitHub:</strong> @{activeModalTeam.leader.githubUsername}
                        </div>
                      )}
                    </div>

                    {activeModalTeam.leader?.contribution && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #E2E8F0', fontSize: '12px' }}>
                        <strong style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                          Documented Contribution:
                        </strong>
                        <p style={{ margin: '3px 0 0', color: '#334155', fontStyle: 'italic', lineHeight: 1.4 }}>
                          "{activeModalTeam.leader.contribution}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Members Roster Grid */}
              <div>
                <div className="pn-detail-section-title">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Team Members ({activeModalTeam.members?.length || 0})</span>
                </div>

                {activeModalTeam.members && activeModalTeam.members.length > 0 ? (
                  <div className="pn-members-grid">
                    {activeModalTeam.members.map((m, idx) => (
                      <div key={idx} className="pn-member-detail-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            {m.name}
                          </div>
                          <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#475569', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                            {m.role || 'Contributor'}
                          </span>
                        </div>

                        {m.email && (
                          <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{m.email}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#64748B' }}>
                          {m.rollNo && <span><strong>USN:</strong> {m.rollNo}</span>}
                          {m.githubUsername && <span><strong>GitHub:</strong> @{m.githubUsername}</span>}
                        </div>

                        {m.contribution && (
                          <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#475569', fontStyle: 'italic' }}>
                            "{m.contribution}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1', fontSize: '12.5px', color: '#64748B', textAlign: 'center' }}>
                    No additional team members registered yet.
                  </div>
                )}
              </div>

              {/* Codebase Repository & Telemetry */}
              <div>
                <div className="pn-detail-section-title">
                  <FolderGit2 className="w-4 h-4 text-purple-600" />
                  <span>Codebase Repository & Access Configuration</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  backgroundColor: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12.5px'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      GitHub Repository:
                    </span>
                    <div style={{ marginTop: '3px' }}>
                      {activeModalTeam.githubRepoUrl ? (
                        <a
                          href={activeModalTeam.githubRepoUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#2563EB', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                        >
                          <span>{activeModalTeam.githubRepoUrl.replace('https://github.com/', '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not connected</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Active Branch:
                    </span>
                    <div style={{ marginTop: '3px', fontFamily: 'monospace', fontWeight: 600, color: '#0F172A' }}>
                      <GitBranch className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                      {activeModalTeam.gitBranch || 'main'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Team Access Code:
                    </span>
                    <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{ fontSize: '12.5px', fontWeight: 800, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                        {activeModalTeam.teamAccessCode}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(activeModalTeam.teamAccessCode)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
                        title="Copy Code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Faculty Guide Mentor:
                    </span>
                    <div style={{ marginTop: '3px', fontWeight: 600, color: '#334155' }}>
                      {activeModalTeam.facultyGuide || 'Not assigned'}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pn-modal-footer">
              <button
                type="button"
                onClick={() => setActiveModalTeam(null)}
                className="pn-action-btn-secondary"
              >
                Close
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeModalTeam.leader?.email && (
                  <a
                    href={`mailto:${activeModalTeam.leader.email}`}
                    className="pn-action-btn-secondary"
                    style={{ textDecoration: 'none' }}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Team Lead</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const pid = activeModalTeam.projectId || activeModalTeam.projectObjectId;
                    setActiveModalTeam(null);
                    onSelectProject && onSelectProject(pid);
                  }}
                  className="pn-action-btn-primary"
                >
                  <span>Open Project Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
