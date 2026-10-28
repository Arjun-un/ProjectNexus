import React, { useState, useMemo } from 'react';
import './DepartmentsView.css';
import {
  Building2,
  GraduationCap,
  Laptop,
  Code2,
  Cpu,
  Radio,
  Network,
  Database,
  Cog,
  Zap,
  Users,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  BarChart2,
  FolderGit2,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  Layers,
  Award,
  BookOpen,
  UserCheck,
  Briefcase
} from 'lucide-react';

// Canonical metadata and styling for standard engineering branches
const CANONICAL_DEPARTMENTS = [
  {
    name: 'Computer Science & Engineering',
    shortCode: 'CSE',
    category: 'Software & AI Systems',
    description: 'Autonomous agents, distributed cloud infrastructure, applied machine learning, and computer vision systems.',
    icon: Laptop,
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    accentGradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    tags: ['AI / ML', 'Cloud DevOps', 'Distributed Systems', 'Web3', 'Computer Vision']
  },
  {
    name: 'Electronics & Communication',
    shortCode: 'ECE',
    category: 'Embedded & Signal Systems',
    description: 'Edge IoT telemetry nodes, LoRaWAN wireless sensor networks, embedded firmware, and VLSI circuit designs.',
    icon: Cpu,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    accentGradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    tags: ['IoT Nodes', 'LoRaWAN', 'Embedded C++', 'VLSI', 'Edge Telemetry']
  },
  {
    name: 'Information Technology',
    shortCode: 'IT',
    category: 'Networks & Web Infrastructure',
    description: 'Decentralized verification protocols, enterprise databases, cloud architectures, and cybersecurity auditing.',
    icon: Network,
    color: '#0284C7',
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    accentGradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    tags: ['Decentralized Web', 'Cloud Infra', 'Database Systems', 'Cybersecurity']
  },
  {
    name: 'Mechanical Engineering',
    shortCode: 'MECH',
    category: 'Robotics & Mechanical Systems',
    description: 'Autonomous robotic rovers, smart mechatronics, industrial thermal monitoring, and CAD kinematic assemblies.',
    icon: Cog,
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    accentGradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    tags: ['Robotics', 'Mechatronics', 'Kinematics', 'Sensor Nodes', 'CAD/CAM']
  },
  {
    name: 'Electrical & Electronics',
    shortCode: 'EEE',
    category: 'Power & Energy Systems',
    description: 'Renewable energy microgrids, high-voltage battery management systems, power converters, and motor telemetry.',
    icon: Zap,
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    accentGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    tags: ['Smart Grids', 'Battery Management', 'Renewable Energy', 'Power Electronics']
  }
];

export default function DepartmentsView({
  projects = [],
  onSelectProject,
  onNavigateToProjectsWithFilter,
  getCategoryBadge,
  getHealthBadge,
  getStatusBadge
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('projects'); // 'projects', 'health', 'progress', 'name'
  const [filterHealthStatus, setFilterHealthStatus] = useState('All'); // 'All', 'Healthy', 'Attention'
  const [activeDrawerDept, setActiveDrawerDept] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // ── 1. Aggregate Dynamic Department Statistics ──
  const departmentsData = useMemo(() => {
    // Collect all departments from projects plus canonical list
    const deptNames = new Set(CANONICAL_DEPARTMENTS.map(d => d.name));
    projects.forEach(p => {
      if (p.department && typeof p.department === 'string') {
        deptNames.add(p.department.trim());
      }
    });

    const list = Array.from(deptNames).map(name => {
      const canonical = CANONICAL_DEPARTMENTS.find(c => c.name.toLowerCase() === name.toLowerCase());
      const deptProjects = projects.filter(p => p.department && p.department.trim().toLowerCase() === name.toLowerCase());
      
      const totalProjects = deptProjects.length;
      const activeProjects = deptProjects.filter(p => p.status === 'Active').length;
      const completedProjects = deptProjects.filter(p => p.status === 'Completed').length;
      const atRiskProjects = deptProjects.filter(p => 
        p.health === 'Critical' || p.health === 'At Risk' || p.status === 'At Risk'
      ).length;

      const avgProgress = totalProjects > 0
        ? Math.round(deptProjects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjects)
        : 0;

      const avgHealthScore = totalProjects > 0
        ? Math.round(deptProjects.reduce((acc, p) => acc + (p.healthScore || 0), 0) / totalProjects)
        : 0;

      // Determine overall health tier
      let healthTier = 'Healthy';
      if (avgHealthScore === 0 && totalProjects === 0) healthTier = 'Not Tracked';
      else if (avgHealthScore < 50 || atRiskProjects > 0) healthTier = 'Attention';
      else if (avgHealthScore < 75) healthTier = 'Moderate';

      // Unique faculty guides
      const facultySet = new Set();
      const facultyGuidesList = [];
      deptProjects.forEach(p => {
        if (p.facultyGuide) {
          const fg = p.facultyGuide.trim();
          if (!facultySet.has(fg)) {
            facultySet.add(fg);
            facultyGuidesList.push({
              name: fg,
              count: deptProjects.filter(dp => dp.facultyGuide === fg).length
            });
          }
        }
      });

      // Aggregated tech stack chips
      const techChips = Array.from(new Set(
        deptProjects.flatMap(p => p.techStack || []).filter(Boolean)
      )).slice(0, 5);

      // Fallback metadata for custom departments
      const shortCode = canonical?.shortCode || name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);
      const icon = canonical?.icon || GraduationCap;
      const color = canonical?.color || '#4F46E5';
      const bgColor = canonical?.bgColor || '#EEF2FF';
      const borderColor = canonical?.borderColor || '#C7D2FE';
      const accentGradient = canonical?.accentGradient || 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)';
      const description = canonical?.description || `Academic capstone projects and research initiatives in ${name}.`;
      const category = canonical?.category || 'Engineering Sciences';
      const tags = canonical?.tags || (techChips.length > 0 ? techChips : ['Academic Research', 'Engineering']);

      return {
        name,
        shortCode,
        category,
        description,
        icon,
        color,
        bgColor,
        borderColor,
        accentGradient,
        tags,
        totalProjects,
        activeProjects,
        completedProjects,
        atRiskProjects,
        avgProgress,
        avgHealthScore,
        healthTier,
        facultyGuides: facultyGuidesList,
        registeredTeamsCount: deptProjects.filter(p => p.isAccessCodeClaimed || p.team?.name).length,
        projects: deptProjects
      };
    });

    return list;
  }, [projects]);

  // ── 2. Top Institutional Metrics ──
  const institutionalKpis = useMemo(() => {
    const totalBranches = departmentsData.length;
    const totalProjects = projects.length;
    const overallProgress = totalProjects > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjects)
      : 0;
    const overallHealth = totalProjects > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.healthScore || 0), 0) / totalProjects)
      : 0;

    const allFaculty = new Set(projects.map(p => p.facultyGuide).filter(Boolean));

    return {
      totalBranches,
      totalProjects,
      overallProgress,
      overallHealth,
      totalFaculty: allFaculty.size
    };
  }, [departmentsData, projects]);

  // ── 3. Filtered & Sorted Departments ──
  const filteredDepartments = useMemo(() => {
    let result = departmentsData.filter(dept => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        dept.name.toLowerCase().includes(q) ||
        dept.shortCode.toLowerCase().includes(q) ||
        dept.category.toLowerCase().includes(q) ||
        dept.facultyGuides.some(f => f.name.toLowerCase().includes(q));

      const matchesHealth = filterHealthStatus === 'All' ||
        (filterHealthStatus === 'Healthy' && dept.healthTier === 'Healthy') ||
        (filterHealthStatus === 'Attention' && (dept.healthTier === 'Attention' || dept.atRiskProjects > 0));

      return matchesSearch && matchesHealth;
    });

    result.sort((a, b) => {
      if (sortBy === 'projects') return b.totalProjects - a.totalProjects;
      if (sortBy === 'health') return b.avgHealthScore - a.avgHealthScore;
      if (sortBy === 'progress') return b.avgProgress - a.avgProgress;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [departmentsData, searchQuery, sortBy, filterHealthStatus]);

  return (
    <div className="pn-departments-container">
      
      {/* ── 1. Page Header ── */}
      <div className="pn-dept-header">
        <div>
          <div className="pn-dept-inst-badge">
            <Building2 size={13} />
            <span>Academic Divisions & Governance</span>
          </div>
          <h1 className="pn-dept-title">Engineering Departments</h1>
          <p className="pn-dept-subtitle">
            Branch-level capstone allocation, faculty mentorship distribution, real-time deliverable health telemetry, and cross-departmental benchmarks.
          </p>
        </div>

        <div className="pn-dept-quick-actions">
          <button
            onClick={() => onNavigateToProjectsWithFilter && onNavigateToProjectsWithFilter('All')}
            className="pn-dept-quick-btn primary"
            type="button"
          >
            <FolderGit2 size={15} />
            <span>View All Projects Directory</span>
          </button>
        </div>
      </div>

      {/* ── 2. Institutional KPI Summary Bar ── */}
      <div className="pn-dept-kpi-grid">
        <div className="pn-dept-kpi-card">
          <div className="pn-dept-kpi-top">
            <span className="pn-dept-kpi-label">Active Academic Branches</span>
            <div className="pn-dept-kpi-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Building2 size={18} />
            </div>
          </div>
          <div className="pn-dept-kpi-value">{institutionalKpis.totalBranches}</div>
          <div className="pn-dept-kpi-subtext">
            <span>Specialized engineering divisions</span>
          </div>
        </div>

        <div className="pn-dept-kpi-card">
          <div className="pn-dept-kpi-top">
            <span className="pn-dept-kpi-label">Total Capstone Projects</span>
            <div className="pn-dept-kpi-icon-wrap" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <FolderGit2 size={18} />
            </div>
          </div>
          <div className="pn-dept-kpi-value">{institutionalKpis.totalProjects}</div>
          <div className="pn-dept-kpi-subtext">
            <span style={{ color: '#16A34A', fontWeight: 600 }}>
              {projects.filter(p => p.status === 'Active').length} Active
            </span>
            <span>·</span>
            <span>{projects.filter(p => p.status === 'Completed').length} Completed</span>
          </div>
        </div>

        <div className="pn-dept-kpi-card">
          <div className="pn-dept-kpi-top">
            <span className="pn-dept-kpi-label">Institutional Health Index</span>
            <div className="pn-dept-kpi-icon-wrap" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
              <Activity size={18} />
            </div>
          </div>
          <div className="pn-dept-kpi-value">{institutionalKpis.overallHealth}%</div>
          <div className="pn-dept-kpi-subtext">
            <span style={{ color: institutionalKpis.overallHealth >= 70 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
              {institutionalKpis.overallHealth >= 70 ? '● Stable Governance' : '● Review Required'}
            </span>
          </div>
        </div>

        <div className="pn-dept-kpi-card">
          <div className="pn-dept-kpi-top">
            <span className="pn-dept-kpi-label">Faculty Guides Assigned</span>
            <div className="pn-dept-kpi-icon-wrap" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="pn-dept-kpi-value">{institutionalKpis.totalFaculty}</div>
          <div className="pn-dept-kpi-subtext">
            <span>Mentors actively presiding capstones</span>
          </div>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar ── */}
      <div className="pn-dept-filter-bar">
        <div className="pn-dept-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search department by branch name, code (CSE, ECE, IT...), or faculty mentor..."
            className="pn-dept-search-input"
          />
        </div>

        <div className="pn-dept-filter-group">
          <select
            value={filterHealthStatus}
            onChange={(e) => setFilterHealthStatus(e.target.value)}
            className="pn-dept-select"
          >
            <option value="All">All Health Statuses</option>
            <option value="Healthy">Healthy Divisions (≥75%)</option>
            <option value="Attention">Needs Attention / At Risk</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pn-dept-select"
          >
            <option value="projects">Sort by Most Projects</option>
            <option value="health">Sort by Highest Health</option>
            <option value="progress">Sort by Highest Progress</option>
            <option value="name">Sort by Department Name (A-Z)</option>
          </select>

          <div className="pn-dept-view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`pn-dept-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid Card View"
              type="button"
            >
              <Layers size={14} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`pn-dept-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              title="Institutional Performance Matrix"
              type="button"
            >
              <BarChart2 size={14} />
              <span>Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Main Departments Grid View ── */}
      {viewMode === 'grid' ? (
        <div className="pn-dept-grid">
          {filteredDepartments.map((dept) => {
            const IconComponent = dept.icon;
            return (
              <div
                key={dept.name}
                className="pn-dept-card"
                style={{ borderColor: dept.totalProjects > 0 ? dept.borderColor : '#E2E8F0' }}
              >
                {/* Decorative Top Gradient Strip */}
                <div
                  className="pn-dept-card-top-strip"
                  style={{ background: dept.accentGradient }}
                />

                <div>
                  {/* Card Header */}
                  <div className="pn-dept-card-header">
                    <div className="pn-dept-identity">
                      <div
                        className="pn-dept-icon-box"
                        style={{ backgroundColor: dept.bgColor, color: dept.color }}
                      >
                        <IconComponent size={22} />
                      </div>
                      <div className="pn-dept-title-group">
                        <span
                          className="pn-dept-code-pill"
                          style={{ backgroundColor: dept.bgColor, color: dept.color, border: `1px solid ${dept.borderColor}` }}
                        >
                          {dept.shortCode}
                        </span>
                        <h3 className="pn-dept-card-name">{dept.name}</h3>
                        <p className="pn-dept-domain-text">{dept.category}</p>
                      </div>
                    </div>

                    <div className="pn-dept-project-count-badge">
                      <span className="pn-dept-count-number">{dept.totalProjects}</span>
                      <span className="pn-dept-count-label">Projects</span>
                    </div>
                  </div>

                  {/* Status Breakdown Row */}
                  <div className="pn-dept-status-breakdown">
                    <div className="pn-dept-status-item">
                      <span className="pn-dept-status-dot active" />
                      <span><strong>{dept.activeProjects}</strong> Active</span>
                    </div>
                    <span className="pn-dept-status-divider">·</span>
                    <div className="pn-dept-status-item">
                      <span className="pn-dept-status-dot completed" />
                      <span><strong>{dept.completedProjects}</strong> Done</span>
                    </div>
                    <span className="pn-dept-status-divider">·</span>
                    <div className="pn-dept-status-item">
                      <span className="pn-dept-status-dot at-risk" />
                      <span><strong>{dept.atRiskProjects}</strong> At Risk</span>
                    </div>
                  </div>

                  {/* Progress & Health Gauges */}
                  <div className="pn-dept-metrics-section">
                    <div>
                      <div className="pn-dept-metric-row" style={{ marginBottom: '6px' }}>
                        <span className="pn-dept-metric-label">Branch Average Progress</span>
                        <span className="pn-dept-metric-val">{dept.avgProgress}%</span>
                      </div>
                      <div className="pn-dept-progress-track">
                        <div
                          className="pn-dept-progress-bar"
                          style={{
                            width: `${Math.max(dept.avgProgress, 3)}%`,
                            background: dept.avgProgress >= 80
                              ? 'linear-gradient(90deg, #10B981, #059669)'
                              : dept.avgProgress >= 40
                              ? 'linear-gradient(90deg, #3B82F6, #2563EB)'
                              : 'linear-gradient(90deg, #F59E0B, #D97706)'
                          }}
                        />
                      </div>
                    </div>

                    <div className="pn-dept-metric-row">
                      <span className="pn-dept-metric-label">Health & Risk Index</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: dept.avgHealthScore >= 75 ? '#ECFDF5' : dept.avgHealthScore >= 50 ? '#FFFBEB' : '#FEF2F2',
                          color: dept.avgHealthScore >= 75 ? '#065F46' : dept.avgHealthScore >= 50 ? '#92400E' : '#991B1B',
                          border: `1px solid ${dept.avgHealthScore >= 75 ? '#A7F3D0' : dept.avgHealthScore >= 50 ? '#FDE68A' : '#FECACA'}`
                        }}
                      >
                        {dept.avgHealthScore >= 75 ? 'Healthy' : dept.avgHealthScore >= 50 ? 'Moderate' : 'Attention'} ({dept.avgHealthScore}%)
                      </span>
                    </div>
                  </div>

                  {/* Faculty & Core Technologies */}
                  <div className="pn-dept-meta-info">
                    <div className="pn-dept-faculty-row">
                      <GraduationCap size={15} className="text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500">Mentors:</span>
                      <span className="pn-dept-faculty-names">
                        {dept.facultyGuides.length > 0
                          ? dept.facultyGuides.map(f => f.name).slice(0, 2).join(', ') + (dept.facultyGuides.length > 2 ? ` +${dept.facultyGuides.length - 2} more` : '')
                          : 'Pending assignment'}
                      </span>
                    </div>

                    <div className="pn-dept-chips-row">
                      {dept.tags.map((tag, idx) => (
                        <span key={idx} className="pn-dept-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pn-dept-card-actions">
                  <button
                    onClick={() => setActiveDrawerDept(dept)}
                    className="pn-dept-action-btn"
                    type="button"
                  >
                    <Users size={14} />
                    <span>Quick Roster</span>
                  </button>

                  <button
                    onClick={() => onNavigateToProjectsWithFilter && onNavigateToProjectsWithFilter(dept.name)}
                    className="pn-dept-action-btn primary"
                    type="button"
                  >
                    <span>View Projects</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ── 5. Institutional Department Comparison Table Matrix ── */}
      <div className="pn-dept-table-panel">
        <div className="pn-dept-table-header">
          <div>
            <h3 className="pn-dept-table-title">
              <BarChart2 size={18} className="text-blue-600" />
              <span>Cross-Departmental Performance & Resource Matrix</span>
            </h3>
            <p className="pn-dept-table-subtitle">
              Comparative benchmark across registered academic divisions, project health indexes, and faculty mentoring loads.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
            {filteredDepartments.length} Branches Reported
          </span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="pn-dept-table">
            <thead>
              <tr>
                <th>Academic Department</th>
                <th>Branch Code</th>
                <th>Total Projects</th>
                <th>Active / Done</th>
                <th>Health Score</th>
                <th>Avg Progress</th>
                <th>Faculty Mentors</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((dept) => {
                const IconComponent = dept.icon;
                return (
                  <tr key={dept.name}>
                    <td>
                      <div className="pn-dept-table-dept-cell">
                        <div
                          className="pn-dept-table-icon"
                          style={{ backgroundColor: dept.bgColor, color: dept.color }}
                        >
                          <IconComponent size={16} />
                        </div>
                        <div>
                          <div className="pn-dept-table-name">{dept.name}</div>
                          <div className="text-xs text-slate-400">{dept.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="pn-dept-code-pill"
                        style={{ backgroundColor: dept.bgColor, color: dept.color, border: `1px solid ${dept.borderColor}` }}
                      >
                        {dept.shortCode}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '14px', color: '#0F172A' }}>
                        {dept.totalProjects}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <span style={{ color: '#2563EB', fontWeight: 700 }}>{dept.activeProjects} active</span>
                        <span style={{ color: '#CBD5E1' }}>/</span>
                        <span style={{ color: '#10B981', fontWeight: 700 }}>{dept.completedProjects} done</span>
                        {dept.atRiskProjects > 0 && (
                          <>
                            <span style={{ color: '#CBD5E1' }}>/</span>
                            <span style={{ color: '#EF4444', fontWeight: 700 }}>{dept.atRiskProjects} risk</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: dept.avgHealthScore >= 75 ? '#ECFDF5' : dept.avgHealthScore >= 50 ? '#FFFBEB' : '#FEF2F2',
                          color: dept.avgHealthScore >= 75 ? '#065F46' : dept.avgHealthScore >= 50 ? '#92400E' : '#991B1B'
                        }}
                      >
                        {dept.avgHealthScore}% ({dept.avgHealthScore >= 75 ? 'Healthy' : 'Attention'})
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${dept.avgProgress}%`,
                              height: '100%',
                              backgroundColor: dept.avgProgress >= 80 ? '#10B981' : dept.avgProgress >= 40 ? '#3B82F6' : '#F59E0B'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' }}>
                          {dept.avgProgress}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        {dept.facultyGuides.length} Guides
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setActiveDrawerDept(dept)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '7px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#FFFFFF',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                          type="button"
                        >
                          Roster
                        </button>
                        <button
                          onClick={() => onNavigateToProjectsWithFilter && onNavigateToProjectsWithFilter(dept.name)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '7px',
                            border: 'none',
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          type="button"
                        >
                          <span>Projects</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. Department Roster Drawer / Modal ── */}
      {activeDrawerDept && (
        <div className="pn-dept-drawer-backdrop" onClick={() => setActiveDrawerDept(null)}>
          <div className="pn-dept-drawer-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div className="pn-dept-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  className="pn-dept-icon-box"
                  style={{ backgroundColor: activeDrawerDept.bgColor, color: activeDrawerDept.color }}
                >
                  {React.createElement(activeDrawerDept.icon, { size: 24 })}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className="pn-dept-code-pill"
                      style={{
                        backgroundColor: activeDrawerDept.bgColor,
                        color: activeDrawerDept.color,
                        border: `1px solid ${activeDrawerDept.borderColor}`
                      }}
                    >
                      {activeDrawerDept.shortCode}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                      Academic Division
                    </span>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '4px 0 0 0' }}>
                    {activeDrawerDept.name}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setActiveDrawerDept(null)}
                className="pn-dept-drawer-close"
                type="button"
                title="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="pn-dept-drawer-body">
              
              {/* Quick Summary Banner */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                    Branch Health Benchmark
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'monospace', color: '#0F172A' }}>
                      {activeDrawerDept.avgHealthScore}%
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: activeDrawerDept.avgHealthScore >= 75 ? '#ECFDF5' : '#FFFBEB',
                        color: activeDrawerDept.avgHealthScore >= 75 ? '#065F46' : '#92400E'
                      }}
                    >
                      {activeDrawerDept.healthTier}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                    Registered Projects
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'monospace', color: '#2563EB', marginTop: '4px' }}>
                    {activeDrawerDept.totalProjects}
                  </div>
                </div>
              </div>

              {/* Faculty Mentorship Roster */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
                  Faculty Mentorship Load
                </h4>
                {activeDrawerDept.facultyGuides.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                    {activeDrawerDept.facultyGuides.map((guide, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <GraduationCap size={16} className="text-blue-600" />
                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B' }}>
                            {guide.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            fontFamily: 'monospace'
                          }}
                        >
                          {guide.count} {guide.count === 1 ? 'proj' : 'projs'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                    No faculty guides officially assigned to this division yet.
                  </p>
                )}
              </div>

              {/* Projects Roster */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    Assigned Capstone Projects ({activeDrawerDept.projects.length})
                  </h4>
                  <button
                    onClick={() => {
                      onNavigateToProjectsWithFilter && onNavigateToProjectsWithFilter(activeDrawerDept.name);
                      setActiveDrawerDept(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    type="button"
                  >
                    <span>Open in Projects Table</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                {activeDrawerDept.projects.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeDrawerDept.projects.map((proj) => {
                      const pid = proj.projectId || proj._id;
                      return (
                        <div key={pid} className="pn-dept-drawer-project-card">
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span
                                  style={{
                                    fontFamily: 'monospace',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: '#F1F5F9',
                                    color: '#475569'
                                  }}
                                >
                                  {proj.projectId}
                                </span>
                                {getCategoryBadge && getCategoryBadge(proj.category)}
                              </div>
                              <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                                {proj.title}
                              </h5>
                              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                                Faculty Guide: <strong>{proj.facultyGuide || 'Unassigned'}</strong> · Team: <strong>{proj.team?.name || 'Unclaimed'}</strong>
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                onSelectProject && onSelectProject(pid);
                                setActiveDrawerDept(null);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '7px',
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #DBEAFE',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                              type="button"
                            >
                              <span>Inspect</span>
                              <ExternalLink size={12} />
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', paddingTop: '8px', borderTop: '1px solid #F8FAFC' }}>
                            <div>
                              <span>Progress: </span>
                              <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{proj.progress || 0}%</strong>
                            </div>
                            <div>
                              {getHealthBadge && getHealthBadge(proj.health, proj.healthScore)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                      No projects currently allocated under {activeDrawerDept.name}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pn-dept-drawer-footer">
              <button
                onClick={() => setActiveDrawerDept(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                type="button"
              >
                Close
              </button>

              <button
                onClick={() => {
                  onNavigateToProjectsWithFilter && onNavigateToProjectsWithFilter(activeDrawerDept.name);
                  setActiveDrawerDept(null);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                type="button"
              >
                <span>Filter Projects by this Branch</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

