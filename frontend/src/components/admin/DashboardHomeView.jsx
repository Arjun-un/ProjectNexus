import React from 'react';
import './AdminDashboard.css';
import {
  FolderGit2,
  CheckCircle2,
  Code2,
  Cpu,
  AlertTriangle,
  Clock,
  ChevronRight,
  Eye,
  Sparkles
} from 'lucide-react';

export default function DashboardHomeView({
  totalCount,
  activeCount,
  softwareCount,
  iotCount,
  hardwareCount,
  atRiskCount,
  criticalProjects,
  recentActivities,
  onNavigateToProjects,
  onSelectProject,
  getCategoryBadge,
  getStatusBadge,
  getHealthBadge
}) {
  const hardwareIotCount = (iotCount || 0) + (hardwareCount || 0);

  return (
    <div className="admin-content-container">
      
      {/* 1. Page Heading Block */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Institutional Governance Overview</h1>
        <p className="admin-page-subtitle">
          Monitoring college project lifecycle health, engineering archetypes, and milestones across all engineering departments.
        </p>
      </div>

      {/* 2. Uniform 5-Card KPI Row */}
      <div className="admin-kpi-row">
        
        {/* 1. Total Projects */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top-row">
            <div className="admin-kpi-badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <FolderGit2 size={18} />
            </div>
            <span className="admin-kpi-label">TOTAL PROJECTS</span>
          </div>
          <div>
            <div className="admin-kpi-value">{totalCount}</div>
            <div className="admin-kpi-subtext" style={{ color: '#10B981' }}>100% cataloged</div>
          </div>
        </div>

        {/* 2. Active Projects */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top-row">
            <div className="admin-kpi-badge" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
              <CheckCircle2 size={18} />
            </div>
            <span className="admin-kpi-label">ACTIVE</span>
          </div>
          <div>
            <div className="admin-kpi-value">{activeCount}</div>
            <div className="admin-kpi-subtext">In development</div>
          </div>
        </div>

        {/* 3. Software Projects */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top-row">
            <div className="admin-kpi-badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Code2 size={18} />
            </div>
            <span className="admin-kpi-label">SOFTWARE</span>
          </div>
          <div>
            <div className="admin-kpi-value">{softwareCount}</div>
            <div className="admin-kpi-subtext">AI / Web / Cloud</div>
          </div>
        </div>

        {/* 4. Hardware & IoT Projects */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top-row">
            <div className="admin-kpi-badge" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <Cpu size={18} />
            </div>
            <span className="admin-kpi-label">HARDWARE / IOT</span>
          </div>
          <div>
            <div className="admin-kpi-value">{hardwareIotCount}</div>
            <div className="admin-kpi-subtext">Robotics & Telemetry</div>
          </div>
        </div>

        {/* 5. Projects At Risk (Clean card layout with red accent, not an error banner) */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top-row">
            <div className="admin-kpi-badge" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              <AlertTriangle size={18} />
            </div>
            <span className="admin-kpi-label">AT RISK</span>
          </div>
          <div>
            <div className="admin-kpi-value text-red">{atRiskCount}</div>
            <div className="admin-kpi-subtext" style={{ color: '#DC2626' }}>Needs intervention</div>
          </div>
        </div>

      </div>

      {/* 3. Two-Column Split (Critical Projects Table + Recent Activity Feed) */}
      <div className="admin-split-grid">
        
        {/* Left Column: Critical Projects Table Card Container */}
        <div className="admin-panel">
          
          {/* Card Header Row */}
          <div className="admin-panel-header">
            <div className="admin-panel-title-block">
              <h2 className="admin-panel-title">
                <AlertTriangle size={18} color="#F59E0B" />
                <span>Critical Projects Needing Attention</span>
              </h2>
              <p className="admin-panel-desc">
                Prioritized by health score, milestone slippage, and last team check-in.
              </p>
            </div>
            <button
              onClick={onNavigateToProjects}
              className="admin-panel-action-link"
              type="button"
            >
              <span>View All Projects</span>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Table Container */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PROJECT NAME</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>HEALTH</th>
                  <th>LAST ACTIVITY</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {criticalProjects.map((p) => (
                  <tr
                    key={p.projectId}
                    onClick={() => onSelectProject(p.projectId)}
                  >
                    <td>
                      <div className="admin-table-title">{p.title}</div>
                      <div className="admin-table-meta">
                        {p.projectId} • {p.department}
                      </div>
                    </td>
                    <td>
                      {getCategoryBadge(p.category)}
                    </td>
                    <td>
                      {getStatusBadge(p.status)}
                    </td>
                    <td>
                      {getHealthBadge(p.health, p.healthScore)}
                    </td>
                    <td style={{ color: '#64748B', fontSize: '12.5px' }}>
                      {typeof p.lastActivityDate === 'string'
                        ? p.lastActivityDate
                        : new Date(p.lastActivityDate).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(p.projectId);
                        }}
                        className="admin-inspect-btn"
                        type="button"
                      >
                        <Eye size={14} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed Card Container */}
        <div className="admin-panel">
          
          {/* Activity Header Row */}
          <div className="admin-panel-header">
            <div className="admin-panel-title-block">
              <h2 className="admin-panel-title">
                <Clock size={18} color="#2563EB" />
                <span>Recent Activity Feed</span>
              </h2>
              <p className="admin-panel-desc">Live Institutional Audit</p>
            </div>
          </div>

          {/* Activity List with Consistent Spacing & Dividers */}
          <div className="admin-activity-list">
            {recentActivities.map((act, idx) => {
              const isWarning = act.type === 'alert';
              const isSuccess = act.type === 'milestone';
              const badgeClass = isWarning ? 'warning' : isSuccess ? 'success' : 'info';

              return (
                <div key={idx} className="admin-activity-item">
                  <div className={`admin-activity-icon-badge ${badgeClass}`}>
                    {isWarning ? (
                      <AlertTriangle size={16} />
                    ) : isSuccess ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Sparkles size={16} />
                    )}
                  </div>
                  <div className="admin-activity-content">
                    <div className="admin-activity-title">{act.title}</div>
                    <div className="admin-activity-desc">{act.description}</div>
                    <div className="admin-activity-meta">
                      {act.projectId} • {typeof act.timestamp === 'string' ? act.timestamp : new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
