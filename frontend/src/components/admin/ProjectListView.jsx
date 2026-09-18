import React, { useState, useEffect, useRef } from 'react';
import {
  Filter,
  Users,
  Eye,
  MoreVertical,
  Copy,
  Mail,
  Edit,
  Archive,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Tiny helper: dropdown item button
───────────────────────────────────────────── */
function DropdownItem({ icon, label, onClick, danger }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        width: '100%',
        padding: '9px 14px',
        background: hovered ? (danger ? '#FEF2F2' : '#F8FAFC') : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: '12.5px',
        fontWeight: 500,
        color: danger ? '#DC2626' : '#334155',
        transition: 'background 0.1s ease',
      }}
    >
      <span style={{ color: danger ? '#DC2626' : '#94A3B8', flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Delete confirmation modal
───────────────────────────────────────────── */
function DeleteModal({ project, confirmText, setConfirmText, onCancel, onConfirm }) {
  const hasTeam = project.isAccessCodeClaimed && project.team?.name;
  const canDelete = confirmText === project.projectId;

  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.52)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 24px 60px rgba(15,23,42,0.20), 0 0 0 1px #FEE2E2',
          animation: 'pnModalIn 0.18s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '13px',
            background: '#FEF2F2', border: '1.5px solid #FECACA',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={22} color="#DC2626" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
              Delete Project?
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94A3B8' }}>
              Permanent — cannot be undone
            </p>
          </div>
        </div>

        {/* Main warning */}
        <div style={{
          background: '#FFF8F8', border: '1px solid #FECACA', borderRadius: '10px',
          padding: '14px 16px', marginBottom: '12px',
          fontSize: '13px', lineHeight: 1.65, color: '#374151',
        }}>
          This will permanently delete{' '}
          <strong style={{ color: '#0F172A' }}>{project.title}</strong>{' '}
          (<code style={{
            fontSize: '11.5px', background: '#FEE2E2', color: '#B91C1C',
            padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace',
          }}>{project.projectId}</code>
          ){' '}and all associated data — team records, milestones, progress history, and repository links.{' '}
          <strong style={{ color: '#DC2626' }}>This action cannot be undone.</strong>
        </div>

        {/* Active team warning */}
        {hasTeam && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px',
            padding: '11px 14px', marginBottom: '12px',
            display: 'flex', gap: '10px', alignItems: 'flex-start',
          }}>
            <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '12.5px', color: '#92400E', lineHeight: 1.5 }}>
              This project has an active team assigned (
              <strong>{project.team.name}</strong>
              ). Consider <strong>archiving</strong> instead of deleting.
            </p>
          </div>
        )}

        {/* Confirm input */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>
            Type{' '}
            <code style={{
              fontSize: '12px', background: '#F1F5F9', color: '#0F172A',
              padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700,
            }}>{project.projectId}</code>{' '}
            to confirm deletion:
          </label>
          <input
            autoFocus
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={project.projectId}
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: '13px', fontFamily: 'monospace', fontWeight: 700,
              border: `1.5px solid ${
                confirmText.length === 0 ? '#E2E8F0'
                : canDelete ? '#10B981'
                : '#FCA5A5'
              }`,
              borderRadius: '9px', outline: 'none',
              color: '#0F172A', background: '#FAFAFA',
              boxSizing: 'border-box', transition: 'border-color 0.15s ease',
              letterSpacing: '0.04em',
            }}
          />
          {confirmText.length > 0 && !canDelete && (
            <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#EF4444', fontWeight: 500 }}>
              Doesn&apos;t match — check for typos
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 20px', fontSize: '13px', fontWeight: 600,
              color: '#64748B', background: '#F1F5F9',
              border: '1.5px solid #E2E8F0', borderRadius: '10px',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete}
            style={{
              padding: '9px 20px', fontSize: '13px', fontWeight: 700,
              color: '#FFFFFF',
              background: canDelete ? '#DC2626' : '#FCA5A5',
              border: 'none', borderRadius: '10px',
              cursor: canDelete ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
              boxShadow: canDelete ? '0 4px 14px rgba(220,38,38,0.28)' : 'none',
            }}
            onMouseEnter={(e) => { if (canDelete) e.currentTarget.style.background = '#B91C1C'; }}
            onMouseLeave={(e) => { if (canDelete) e.currentTarget.style.background = '#DC2626'; }}
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Health cell: pill + mini progress bar
───────────────────────────────────────────── */
function HealthCell({ health, healthScore }) {
  const color =
    health === 'Good' ? '#10B981'
    : health === 'Moderate' ? '#F59E0B'
    : '#EF4444';
  const bg =
    health === 'Good' ? '#ECFDF5'
    : health === 'Moderate' ? '#FFFBEB'
    : '#FEF2F2';
  const textColor =
    health === 'Good' ? '#047857'
    : health === 'Moderate' ? '#B45309'
    : '#B91C1C';
  const label = health === 'Good' ? 'Healthy' : health;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '108px' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 9px', borderRadius: '9999px',
        background: bg, border: `1px solid ${color}44`,
        fontSize: '11px', fontWeight: 700, color: textColor,
        width: 'fit-content',
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: color, flexShrink: 0,
        }} />
        {label} ({healthScore}%)
      </div>
      <div style={{
        width: '100%', height: '5px',
        background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(healthScore, 100)}%`,
          background: color,
          borderRadius: '99px',
          transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function ProjectListView({
  projects,
  filteredProjects,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  filterDepartment,
  setFilterDepartment,
  filterHealth,
  setFilterHealth,
  onSelectProject,
  onOpenSendInvite,
  copiedCode,
  onCopyCode,
  getCategoryBadge,
  getStatusBadge,
  onDeleteProject,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const isFiltersActive =
    filterCategory !== 'All' ||
    filterStatus !== 'All' ||
    filterDepartment !== 'All' ||
    filterHealth !== 'All' ||
    searchQuery !== '';

  const clearFilters = () => {
    setFilterCategory('All');
    setFilterStatus('All');
    setFilterDepartment('All');
    setFilterHealth('All');
    setSearchQuery('');
  };

  const handleDeleteConfirm = () => {
    if (deleteModal && deleteConfirmText === deleteModal.projectId) {
      onDeleteProject && onDeleteProject(deleteModal.projectId);
      setDeleteModal(null);
      setDeleteConfirmText('');
    }
  };

  const filterConfigs = [
    {
      value: filterCategory, set: setFilterCategory,
      options: [
        { v: 'All', l: 'All Categories' },
        { v: 'Software', l: '💻 Software' },
        { v: 'IoT', l: '📡 IoT' },
        { v: 'Hardware', l: '⚙️ Hardware' },
      ],
    },
    {
      value: filterStatus, set: setFilterStatus,
      options: [
        { v: 'All', l: 'All Statuses' },
        { v: 'Active', l: 'Active' },
        { v: 'Pending Approval', l: 'Pending Approval' },
        { v: 'At Risk', l: 'At Risk' },
        { v: 'Completed', l: 'Completed' },
      ],
    },
    {
      value: filterDepartment, set: setFilterDepartment,
      options: [
        { v: 'All', l: 'All Departments' },
        { v: 'Computer Science & Engineering', l: 'Computer Science' },
        { v: 'Electronics & Communication', l: 'Electronics & Comm' },
        { v: 'Information Technology', l: 'Information Tech' },
        { v: 'Mechanical Engineering', l: 'Mechanical' },
        { v: 'Electrical & Electronics', l: 'Electrical' },
      ],
    },
    {
      value: filterHealth, set: setFilterHealth,
      options: [
        { v: 'All', l: 'All Healths' },
        { v: 'Good', l: '🟢 Healthy' },
        { v: 'Moderate', l: '🟡 Moderate' },
        { v: 'Critical', l: '🔴 At Risk / Critical' },
      ],
    },
  ];

  return (
    <>
      <style>{`
        @keyframes pnModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pnDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pn-filter-select:hover { border-color: #94A3B8 !important; }
        .pn-filter-select:focus { border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); outline: none; }
        .pn-row:hover td { background: #F0F7FF !important; }
        .pn-view-btn:hover { background: #2563EB !important; color: #fff !important; border-color: #2563EB !important; }
        .pn-menu-btn:hover { background: #F1F5F9 !important; color: #334155 !important; }
        .pn-clear-filters:hover { background: #EFF6FF !important; text-decoration: underline; }
      `}</style>

      {/* Transparent overlay closes open dropdown */}
      {openMenuId && (
        <div
          onClick={() => setOpenMenuId(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 100 }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Project Master Directory
            </h1>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0', lineHeight: 1.5 }}>
              Search, filter, and audit all software, IoT, and hardware college projects.
            </p>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap', paddingTop: '4px' }}>
            Showing{' '}
            <span style={{ color: '#0F172A', fontWeight: 800 }}>{filteredProjects.length}</span>
            {' '}of {projects.length} projects
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '11px 16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '11px', fontWeight: 700, color: '#64748B',
            paddingRight: '12px', borderRight: '1px solid #E2E8F0',
          }}>
            <Filter size={13} />
            <span>Filters:</span>
          </div>

          {filterConfigs.map((fc, i) => {
            const active = fc.value !== 'All';
            return (
              <select
                key={i}
                value={fc.value}
                onChange={(e) => fc.set(e.target.value)}
                className="pn-filter-select"
                style={{
                  fontSize: '12px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: `1.5px solid ${active ? '#2563EB' : '#E2E8F0'}`,
                  background: active ? '#EFF6FF' : '#F8FAFC',
                  color: active ? '#1D4ED8' : '#374151',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  minWidth: '136px',
                  transition: 'all 0.15s ease',
                }}
              >
                {fc.options.map((o) => (
                  <option key={o.v} value={o.v}>{o.l}</option>
                ))}
              </select>
            );
          })}

          {isFiltersActive && (
            <button
              onClick={clearFilters}
              className="pn-clear-filters"
              style={{
                marginLeft: 'auto',
                fontSize: '12px', fontWeight: 600,
                color: '#2563EB',
                background: 'none', border: 'none',
                cursor: 'pointer',
                padding: '4px 8px', borderRadius: '6px',
                transition: 'all 0.15s ease',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
              }}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '960px' }}>
              <thead>
                <tr style={{
                  borderBottom: '1.5px solid #E2E8F0',
                  background: '#F8FAFC',
                  fontSize: '10.5px', fontWeight: 700,
                  color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em',
                }}>
                  {['Project ID', 'Title', 'Category', 'Department', 'Status', 'Health', 'Team Assigned', 'Deadline'].map((h) => (
                    <th key={h} style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                  <th style={{ padding: '13px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => {
                  const isMenuOpen = openMenuId === p.projectId;
                  const hasTeam = p.isAccessCodeClaimed && p.team?.name;

                  return (
                    <tr
                      key={p.projectId}
                      className="pn-row"
                      onClick={() => onSelectProject(p.projectId)}
                      style={{ cursor: 'pointer', borderBottom: '1px solid #F1F5F9', transition: 'background 0.12s ease' }}
                    >
                      {/* Project ID */}
                      <td style={{ padding: '15px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#1E293B', fontSize: '11.5px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        {p.projectId}
                      </td>

                      {/* Title */}
                      <td style={{ padding: '15px 14px', maxWidth: '220px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Guide: {p.facultyGuide}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '15px 14px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        {getCategoryBadge(p.category)}
                      </td>

                      {/* Department */}
                      <td style={{ padding: '15px 14px', fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'middle' }}>
                        {p.department}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '15px 14px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        {getStatusBadge(p.status)}
                      </td>

                      {/* Health */}
                      <td style={{ padding: '15px 14px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        <HealthCell health={p.health} healthScore={p.healthScore} />
                      </td>

                      {/* Team Assigned */}
                      <td style={{ padding: '15px 14px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        {hasTeam ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>
                            <Users size={13} color="#10B981" style={{ flexShrink: 0 }} />
                            <span>{p.team.name}</span>
                          </div>
                        ) : (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '3px 9px', borderRadius: '7px',
                            border: '1.5px dashed #CBD5E1',
                            background: 'transparent',
                            fontSize: '11px', color: '#94A3B8',
                            fontFamily: 'monospace', fontWeight: 500,
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', border: '1.5px solid #CBD5E1', flexShrink: 0 }} />
                            Unassigned ({p.teamAccessCode})
                          </div>
                        )}
                      </td>

                      {/* Deadline */}
                      <td style={{ padding: '15px 14px', whiteSpace: 'nowrap', fontSize: '11.5px', color: '#64748B', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                        {typeof p.deadline === 'string' ? p.deadline.slice(0, 10) : new Date(p.deadline).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td
                        style={{ padding: '15px 16px', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                          {/* View button */}
                          <button
                            className="pn-view-btn"
                            onClick={(e) => { e.stopPropagation(); onSelectProject(p.projectId); }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '5px 11px',
                              fontSize: '11.5px', fontWeight: 600,
                              color: '#2563EB', background: '#EFF6FF',
                              border: '1.5px solid #BFDBFE',
                              borderRadius: '7px', cursor: 'pointer',
                              transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                            }}
                          >
                            <Eye size={12} />
                            View
                          </button>

                          {/* Three-dot overflow menu */}
                          <div style={{ position: 'relative', zIndex: isMenuOpen ? 200 : 'auto' }}>
                            <button
                              className="pn-menu-btn"
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : p.projectId); }}
                              style={{
                                width: '29px', height: '29px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '7px',
                                border: `1.5px solid ${isMenuOpen ? '#CBD5E1' : '#E2E8F0'}`,
                                background: isMenuOpen ? '#F1F5F9' : '#FFFFFF',
                                color: isMenuOpen ? '#334155' : '#64748B',
                                cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
                              }}
                            >
                              <MoreVertical size={14} />
                            </button>

                            {isMenuOpen && (
                              <div
                                style={{
                                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                                  background: '#FFFFFF',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '12px',
                                  boxShadow: '0 8px 32px rgba(15,23,42,0.13), 0 2px 8px rgba(15,23,42,0.06)',
                                  zIndex: 201,
                                  minWidth: '196px',
                                  overflow: 'hidden',
                                  animation: 'pnDropIn 0.14s cubic-bezier(0.16,1,0.3,1)',
                                }}
                              >
                                <DropdownItem
                                  icon={copiedCode === p.teamAccessCode ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                                  label="Copy Project ID"
                                  onClick={() => { onCopyCode(p.teamAccessCode, { stopPropagation: () => {} }); setOpenMenuId(null); }}
                                />
                                <DropdownItem
                                  icon={<Mail size={13} />}
                                  label="Send Invitation Email"
                                  onClick={() => { onOpenSendInvite(p); setOpenMenuId(null); }}
                                />
                                <DropdownItem
                                  icon={<Edit size={13} />}
                                  label="Edit Project Details"
                                  onClick={() => { setOpenMenuId(null); }}
                                />
                                <DropdownItem
                                  icon={<Archive size={13} />}
                                  label="Archive Project"
                                  onClick={() => { setOpenMenuId(null); }}
                                />
                                <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />
                                <DropdownItem
                                  icon={<Trash2 size={13} />}
                                  label="Delete Project"
                                  danger
                                  onClick={() => {
                                    setDeleteModal(p);
                                    setDeleteConfirmText('');
                                    setOpenMenuId(null);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                      No projects match your filters.{' '}
                      {isFiltersActive && (
                        <button onClick={clearFilters} style={{ color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <DeleteModal
          project={deleteModal}
          confirmText={deleteConfirmText}
          setConfirmText={setDeleteConfirmText}
          onCancel={() => { setDeleteModal(null); setDeleteConfirmText(''); }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}
