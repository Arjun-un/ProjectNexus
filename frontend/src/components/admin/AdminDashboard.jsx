import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  Building2,
  BarChart3,
  ScrollText,
  Settings,
  Plus,
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  Code2,
  Radio,
  Cog,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Sparkles,
  RefreshCw,
  Mail,
  Server,
  Database,
  Lock
} from 'lucide-react';

import DashboardHomeView from './DashboardHomeView';
import ProjectListView from './ProjectListView';
import ProjectDetailView from './ProjectDetailView';
import TeamsDirectoryView from './TeamsDirectoryView';
import DepartmentsView from './DepartmentsView';
import CreateProjectModal from './CreateProjectModal';
import SendInviteModal from './SendInviteModal';
import './AdminDashboard.css';

// Initial realistic projects data
const INITIAL_PROJECTS = [
  {
    _id: 'p1',
    projectId: 'CSE-2026-041',
    title: 'Smart Attendance & Proximate Face Biometrics System',
    category: 'Software',
    department: 'Computer Science & Engineering',
    academicYear: '2025-2026',
    facultyGuide: 'Dr. Robert Chen',
    deadline: '2026-05-15',
    priority: 'High',
    description: 'High-throughput edge-computing facial recognition engine for lecture hall attendance tracking with anti-spoofing liveness detection.',
    techStack: ['Python', 'FastAPI', 'PyTorch', 'React 19', 'PostgreSQL', 'Docker'],
    teamAccessCode: 'NEXUS-7F2K',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'Active',
    health: 'Good',
    healthScore: 94,
    progress: 68,
    currentMilestone: 'Sprint 4: Liveness Anti-Spoofing & Edge Model Quantization',
    lastActivityDate: '4 hours ago',
    team: {
      name: 'Alpha Visionary Labs',
      leader: {
        name: 'Arjun Swaminathan',
        email: 'arjun.swami@projectnexus.edu',
        role: 'Team Lead & Core ML Architect'
      },
      members: [
        { name: 'Priya Raman', email: 'priya.raman@projectnexus.edu', role: 'Frontend & Edge UI Developer' },
        { name: 'Karthik Raja', email: 'karthik.raja@projectnexus.edu', role: 'FastAPI Backend & Pipeline Engineer' },
        { name: 'Sneha Patel', email: 'sneha.patel@projectnexus.edu', role: 'Model Quantization & QA Specialist' }
      ]
    },
    timeline: [
      {
        _id: 't1',
        title: 'Milestone Review Completed',
        description: 'Sprint 3 Face Vector Matching passed faculty review with 99.2% accuracy.',
        timestamp: 'Today at 2:15 PM',
        type: 'milestone'
      },
      {
        _id: 't2',
        title: 'Team Registered & Project Linked',
        description: 'Team Alpha Visionary Labs claimed access code NEXUS-7F2K and assigned member roles.',
        timestamp: '3 days ago',
        type: 'team_join'
      }
    ]
  },
  {
    _id: 'p2',
    projectId: 'ECE-2026-022',
    title: 'Industrial IoT Predictive Vibration & Thermal Monitor',
    category: 'IoT',
    department: 'Electronics & Communication',
    academicYear: '2025-2026',
    facultyGuide: 'Dr. Arvind Rao',
    deadline: '2026-04-30',
    priority: 'High',
    description: 'Multi-axis accelerometer node monitoring high-voltage industrial motors with LoRaWAN wireless telemetry and cloud anomaly detection.',
    componentsRequired: ['STM32 Nucleo-F446RE', 'MPU-6050 Accelerometer', 'SX1276 LoRa Transceiver', 'MAX6675 Thermocouple'],
    labAssigned: 'Advanced Embedded Systems Lab (Room 304)',
    teamAccessCode: 'NEXUS-3W8L',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'At Risk',
    health: 'Critical',
    healthScore: 36,
    progress: 24,
    currentMilestone: 'Hardware Bring-up & Sensor Calibration (Overdue)',
    lastActivityDate: '9 days ago',
    team: {
      name: 'VibroSense Tech',
      leader: {
        name: 'Rohan Sharma',
        email: 'rohan.sharma@projectnexus.edu',
        role: 'Team Lead & Embedded Firmware Engineer'
      },
      members: [
        { name: 'Ananya Roy', email: 'ananya.roy@projectnexus.edu', role: 'Hardware Circuit & PCB Designer' },
        { name: 'Vivek Joshi', email: 'vivek.joshi@projectnexus.edu', role: 'LoRaWAN Telemetry & Cloud Integrator' }
      ]
    },
    timeline: [
      {
        _id: 't4',
        title: 'Health Warning: Milestone Delayed',
        description: 'Component calibration delayed by 11 days. LoRa gateway packet loss exceeds 45%. Admin review triggered.',
        timestamp: '2 days ago',
        type: 'alert'
      }
    ]
  },
  {
    _id: 'p3',
    projectId: 'IT-2026-064',
    title: 'Decentralized Academic Credential Verification Network',
    category: 'Software',
    department: 'Information Technology',
    academicYear: '2025-2026',
    facultyGuide: 'Dr. Meera Nambiar',
    deadline: '2026-04-10',
    priority: 'Medium',
    description: 'Ethereum L2 smart contracts issuing cryptographically verifiable student transcripts with zero-knowledge privacy proofs.',
    techStack: ['Solidity', 'Hardhat', 'Next.js', 'Ethers.js', 'IPFS', 'TypeScript'],
    teamAccessCode: 'NEXUS-4B9Q',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'Active',
    health: 'Good',
    healthScore: 98,
    progress: 82,
    currentMilestone: 'Zero-Knowledge Proof Verifier Deployment on Sepolia Testnet',
    lastActivityDate: '45 mins ago',
    team: {
      name: 'BlockNexus Team',
      leader: {
        name: 'Gaurav Kulkarni',
        email: 'gaurav.kulkarni@projectnexus.edu',
        role: 'Smart Contract & Cryptography Lead'
      },
      members: [
        { name: 'Divya Soni', email: 'divya.soni@projectnexus.edu', role: 'Full-Stack dApp Developer' },
        { name: 'Aditya Nair', email: 'aditya.nair@projectnexus.edu', role: 'IPFS Storage & Zero-Knowledge Prover' }
      ]
    },
    timeline: [
      {
        _id: 't7',
        title: 'Smart Contract Audit Passed',
        description: 'Automated Slither scan completed with 0 high severity vulnerabilities.',
        timestamp: '45 mins ago',
        type: 'milestone'
      }
    ]
  }
];

export default function AdminDashboard({ adminUser, onLogout, onOpenHandover }) {
  // Navigation & section states
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  // Data states
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterHealth, setFilterHealth] = useState('All');
  
  // Modals & UI states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sendInviteProject, setSendInviteProject] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Governance settings policy toggles
  const [stagnancyAlerts, setStagnancyAlerts] = useState(true);
  const [accessCodeEnforcer, setAccessCodeEnforcer] = useState(true);
  const [autoArchiving, setAutoArchiving] = useState(true);
  const [hmacVerification, setHmacVerification] = useState(true);

  // Fetch from live backend if available
  const fetchBackendData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('http://localhost:5000/api/projects');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.projects)) {
          setProjects(json.data.projects);
        }
      }
    } catch (err) {
      // Fallback to INITIAL_PROJECTS
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData, currentSection, selectedProjectId]);

  // Compute live KPIs
  const totalCount = projects.length;
  const activeCount = projects.filter(p => p.status === 'Active').length;
  const softwareCount = projects.filter(p => p.category === 'Software').length;
  const iotCount = projects.filter(p => p.category === 'IoT').length;
  const hardwareCount = projects.filter(p => p.category === 'Hardware').length;
  const atRiskCount = projects.filter(p => p.health === 'Critical' || p.health === 'At Risk' || p.status === 'At Risk').length;
  const departmentsCount = new Set([
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Information Technology',
    'Mechanical Engineering',
    'Electrical & Electronics',
    ...projects.map(p => p.department).filter(Boolean)
  ]).size;

  // Critical projects needing attention (lowest healthScore)
  const criticalProjects = [...projects]
    .sort((a, b) => (a.healthScore || 0) - (b.healthScore || 0))
    .slice(0, 5);

  // Aggregate recent activities
  const recentActivities = projects
    .flatMap(p => (p.timeline || []).map(t => ({ ...t, projectTitle: p.title, projectId: p.projectId, category: p.category })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 7);

  // Filtered projects for Project List View
  const filteredProjects = projects.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.team?.name && p.team.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.facultyGuide && p.facultyGuide.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchesDept = filterDepartment === 'All' || p.department === filterDepartment;
    const matchesHealth = filterHealth === 'All' || p.health === filterHealth;

    return matchesSearch && matchesCategory && matchesStatus && matchesDept && matchesHealth;
  });

  // Selected project for Detail View
  const activeDetailProject = projects.find(p => p.projectId === selectedProjectId || p._id === selectedProjectId);

  const handleCopyCode = (code, e) => {
    e && e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const handleDeleteProject = async (projectId) => {
    setProjects(prev => prev.filter(p => p.projectId !== projectId && p._id !== projectId));
    // If we're currently viewing this project, go back to the list
    if (selectedProjectId === projectId) setSelectedProjectId(null);

    try {
      await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(projectId)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to sync deletion with backend database:', err);
    }
  };

  const handleInviteSent = (recipientEmail) => {
    setProjects(prev => prev.map(p => {
      if (sendInviteProject && (p.projectId === sendInviteProject.projectId || p._id === sendInviteProject._id)) {
        return {
          ...p,
          invitedLeadEmail: recipientEmail,
          invitationSentAt: new Date(),
          timeline: [
            {
              _id: 'tl_send_' + Date.now(),
              title: 'Project Invitation Dispatched via Email',
              description: `Access Code and workspace registration link emailed to ${recipientEmail}`,
              timestamp: 'Just now',
              type: 'alert'
            },
            ...(p.timeline || [])
          ]
        };
      }
      return p;
    }));
  };

  const handleRegenerateCode = (projectId) => {
    const newCode = `NEXUS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setProjects(prev => prev.map(p => {
      if (p.projectId === projectId || p._id === projectId) {
        return {
          ...p,
          teamAccessCode: newCode,
          accessCodeStatus: 'active',
          isAccessCodeClaimed: false,
          timeline: [
            {
              _id: 'tl_reg_' + Date.now(),
              title: 'Team Access Code Regenerated',
              description: `New Access Code generated: ${newCode}`,
              timestamp: 'Just now',
              type: 'alert'
            },
            ...(p.timeline || [])
          ]
        };
      }
      return p;
    }));
  };

  const handleRevokeCode = (projectId) => {
    setProjects(prev => prev.map(p => {
      if (p.projectId === projectId || p._id === projectId) {
        return {
          ...p,
          accessCodeStatus: 'revoked',
          timeline: [
            {
              _id: 'tl_rev_' + Date.now(),
              title: 'Team Access Code Revoked',
              description: `Access code ${p.teamAccessCode} has been revoked by Admin`,
              timestamp: 'Just now',
              type: 'alert'
            },
            ...(p.timeline || [])
          ]
        };
      }
      return p;
    }));
  };

  // Toggle or mark project completed with backend persistence
  const handleMarkCompleted = async (project, e) => {
    e && e.stopPropagation();
    const pid = project.projectId || project._id;
    const isAlreadyCompleted = project.status === 'Completed';
    const nextStatus = isAlreadyCompleted ? 'Active' : 'Completed';
    const nextProgress = isAlreadyCompleted ? (project.progress && project.progress < 100 ? project.progress : 0) : 100;

    // Optimistically update local projects state
    setProjects(prev => prev.map(p => {
      if (p.projectId === pid || p._id === pid) {
        return {
          ...p,
          status: nextStatus,
          progress: nextProgress,
          timeline: [
            {
              _id: 'tl_status_' + Date.now(),
              title: isAlreadyCompleted ? 'Project Status Reverted to Active' : 'Project Marked as Completed',
              description: isAlreadyCompleted
                ? 'Institutional Administrator reverted project status back to Active.'
                : 'Institutional Administrator approved project deliverables and marked status as Completed (100% progress).',
              timestamp: 'Just now',
              type: 'status_change'
            },
            ...(p.timeline || [])
          ]
        };
      }
      return p;
    }));

    // Persist to backend database
    try {
      await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(pid)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          progress: nextProgress
        })
      });
    } catch (err) {
      console.error('Failed to sync project status to backend:', err);
    }
  };

  // Toggle project Open to Handover status
  const handleToggleHandover = async (projectId, targetState, reason) => {
    const pid = projectId;
    const project = projects.find(p => p.projectId === pid || p._id === pid);
    if (!project) return;

    const nextState = targetState !== undefined ? Boolean(targetState) : !project.isOpenToHandover;
    const defaultReason = reason || (nextState ? 'Academic term conclusion and senior team internship migration' : '');

    // Optimistic UI update
    setProjects(prev => prev.map(p => {
      if (p.projectId === pid || p._id === pid) {
        return {
          ...p,
          isOpenToHandover: nextState,
          handoverOpenedAt: nextState ? new Date() : null,
          handoverReason: defaultReason,
          timeline: [
            {
              _id: 'tl_ho_' + Date.now(),
              title: nextState ? 'Project Marked Open for Handover' : 'Handover Status Closed',
              description: nextState
                ? `Institutional Administrator marked this project open for continuity handover.${defaultReason ? ` Reason: ${defaultReason}` : ''}`
                : 'Institutional Administrator removed this project from the open handover queue.',
              timestamp: 'Just now',
              type: nextState ? 'handover' : 'status_change'
            },
            ...(p.timeline || [])
          ]
        };
      }
      return p;
    }));

    // Persist to backend database
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(pid)}/toggle-handover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOpenToHandover: nextState,
          handoverReason: defaultReason
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProjects(prev => prev.map(p => (p.projectId === pid || p._id === pid ? { ...p, ...data.data } : p)));
      }
    } catch (err) {
      console.error('Failed to sync handover status to backend:', err);
    }
  };

  // Open the project directly inside the Handover Engine dossier
  const handleOpenHandover = (project, e) => {
    e && e.stopPropagation();
    if (onOpenHandover) {
      onOpenHandover(project);
    }
  };

  // Helper badge styles matching design system
  const getCategoryBadge = (cat) => {
    if (cat === 'Software') {
      return (
        <span className="admin-badge admin-badge-software">
          <Code2 size={12} />
          <span>Software</span>
        </span>
      );
    }
    if (cat === 'IoT') {
      return (
        <span className="admin-badge admin-badge-iot">
          <Radio size={12} />
          <span>IoT</span>
        </span>
      );
    }
    return (
      <span className="admin-badge admin-badge-hardware">
        <Cog size={12} />
        <span>Hardware</span>
      </span>
    );
  };

  const getHealthBadge = (health, score) => {
    const isGood = health === 'Good' || health === 'Healthy';
    const isMod = health === 'Moderate';
    const variant = isGood ? 'healthy' : isMod ? 'moderate' : 'critical';
    const label = isGood ? 'Healthy' : isMod ? 'Moderate' : 'At Risk';
    return (
      <span className={`admin-health-pill ${variant}`}>
        <span className={`admin-health-dot ${variant}`} />
        <span>{label} {score ? `(${score}%)` : ''}</span>
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return <span className="admin-badge admin-badge-active">Active</span>;
    }
    if (status === 'Pending Approval' || status === 'Pending') {
      return <span className="admin-badge admin-badge-pending">Pending</span>;
    }
    if (status === 'At Risk') {
      return <span className="admin-badge admin-badge-at-risk">At Risk</span>;
    }
    return <span className="admin-badge">{status}</span>;
  };

  return (
    <div className="admin-layout">
      
      {/* ================================================== */}
      {/* 1. SIDEBAR (Dark: #0F172A) */}
      {/* ================================================== */}
      <aside className="admin-sidebar">
        
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo-icon">
            <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.02em' }}>PN</span>
          </div>
          <div>
            <div className="admin-sidebar-logo-title">
              Project<span style={{ color: '#60A5FA' }}>Nexus</span>
              <span className="admin-sidebar-logo-badge">
                OS
              </span>
            </div>
            <div className="admin-sidebar-logo-sub">Enterprise Admin Console</div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="admin-sidebar-nav">
          <div className="admin-sidebar-group-label">
            Core Governance
          </div>

          <button
            onClick={() => { setCurrentSection('dashboard'); setSelectedProjectId(null); }}
            className={`admin-nav-item ${currentSection === 'dashboard' && !selectedProjectId ? 'active' : ''}`}
            type="button"
          >
            <div className="admin-nav-item-left">
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => { setCurrentSection('projects'); setSelectedProjectId(null); }}
            className={`admin-nav-item ${currentSection === 'projects' && !selectedProjectId ? 'active' : ''}`}
            type="button"
          >
            <div className="admin-nav-item-left">
              <FolderGit2 size={16} />
              <span>Projects</span>
            </div>
            <span className="admin-nav-count-badge">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => { setCurrentSection('teams'); setSelectedProjectId(null); }}
            className={`admin-nav-item ${currentSection === 'teams' ? 'active' : ''}`}
            type="button"
          >
            <div className="admin-nav-item-left">
              <Users size={16} />
              <span>Teams</span>
            </div>
          </button>

          <button
            onClick={() => { setCurrentSection('departments'); setSelectedProjectId(null); }}
            className={`admin-nav-item ${currentSection === 'departments' ? 'active' : ''}`}
            type="button"
          >
            <div className="admin-nav-item-left">
              <Building2 size={16} />
              <span>Departments</span>
            </div>
            <span className="admin-nav-count-badge">
              {departmentsCount}
            </span>
          </button>

          <div className="admin-sidebar-group-label">
            Intelligence & Auditing
          </div>

          <button
            onClick={() => { setCurrentSection('analytics'); setSelectedProjectId(null); }}
            className={`admin-nav-item ${currentSection === 'analytics' ? 'active' : ''}`}
            type="button"
          >
            <div className="admin-nav-item-left">
              <BarChart3 size={16} />
              <span>Analytics</span>
            </div>
          </button>

          <button
            onClick={() => { setCurrentSection('activity'); setSelectedProjectId(null); }}
            className={`admin-nav-item ${currentSection === 'activity' ? 'active' : ''}`}
            type="button"
          >
            <div className="admin-nav-item-left">
              <ScrollText size={16} />
              <span>Activity Logs</span>
            </div>
          </button>

          <button
            onClick={() => { setCurrentSection('settings'); setSelectedProjectId(null); }}
            className={`admin-nav-item ${currentSection === 'settings' ? 'active' : ''}`}
            type="button"
          >
            <div className="admin-nav-item-left">
              <Settings size={16} />
              <span>Settings</span>
            </div>
          </button>
        </div>

        {/* Sidebar Bottom Security Tag */}
        <div className="admin-sidebar-footer">
          <div className="admin-mode-pill">
            <ShieldCheck size={18} color="#34D399" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="admin-mode-title">Admin Mode</div>
              <div className="admin-mode-sub">Governance Clearance: L3</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================== */}
      {/* 2. WORKSPACE AREA (Light: #F8FAFC) */}
      {/* ================================================== */}
      <div className="admin-main">
        
        {/* TOP BAR */}
        <header className="admin-topbar">
          
          {/* Search Bar */}
          <div className="admin-search-wrapper">
            <Search className="admin-search-icon" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, IDs, guides, teams..."
              className="admin-search-input"
            />
          </div>

          {/* Right Action Icons & Primary Button */}
          <div className="admin-topbar-actions">
            
            {/* Live Sync / Refresh Button */}
            <button
              onClick={() => fetchBackendData()}
              className="admin-icon-btn"
              type="button"
              title="Refresh project & team data from server"
              aria-label="Refresh Data"
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} style={{ transition: 'transform 0.5s', transform: isRefreshing ? 'rotate(180deg)' : 'none' }} />
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="admin-icon-btn"
                type="button"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="admin-notif-dot" />
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '8px',
                  width: '320px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #E2E8F0',
                  padding: '16px',
                  zIndex: 50
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Notifications & Alerts</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '9999px' }}>3 New</span>
                  </div>
                  <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '12px', padding: '10px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} color="#DC2626" />
                        <span>ECE-2026-022 Needs Review</span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#B91C1C', marginTop: '4px', margin: 0 }}>Sensor calibration delayed by 11 days.</p>
                    </div>
                    <div style={{ fontSize: '12px', padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', color: '#334155' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>Milestone Review Passed</div>
                      <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', margin: 0 }}>CSE-2026-041 face recognition model verified.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Pill */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="admin-profile-pill"
                type="button"
              >
                <div className="admin-profile-avatar">
                  {adminUser?.name ? adminUser.name[0].toUpperCase() : 'A'}
                </div>
                <div className="admin-profile-info">
                  <div className="admin-profile-name">
                    {adminUser?.name || 'System Administrator'}
                  </div>
                  <div className="admin-profile-role">Institutional Governance</div>
                </div>
                <ChevronDown size={14} color="#94A3B8" />
              </button>

              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '8px',
                  width: '220px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #E2E8F0',
                  padding: '8px',
                  zIndex: 50
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{adminUser?.name || 'Administrator'}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminUser?.email || 'admin@projectnexus.edu'}</div>
                  </div>
                  <button
                    onClick={() => { setShowProfileMenu(false); onLogout && onLogout(); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#DC2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '4px',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    type="button"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* ALWAYS VISIBLE PRIMARY BUTTON: + Create New Project */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="admin-create-project-btn"
              type="button"
            >
              <Plus size={16} />
              <span>Create New Project</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT ROUTER */}
        <main style={{ flex: 1, minHeight: 0 }}>
          
          {/* DETAIL VIEW ROUTE */}
          {selectedProjectId && activeDetailProject ? (
            <ProjectDetailView
              project={activeDetailProject}
              onBack={() => setSelectedProjectId(null)}
              onOpenSendInvite={(p) => setSendInviteProject(p)}
              onRegenerateCode={handleRegenerateCode}
              onRevokeCode={handleRevokeCode}
              onDeleteProject={handleDeleteProject}
              onMarkCompleted={handleMarkCompleted}
              onToggleHandover={handleToggleHandover}
              onOpenHandover={handleOpenHandover}
              getCategoryBadge={getCategoryBadge}
              getStatusBadge={getStatusBadge}
              getHealthBadge={getHealthBadge}
            />
          ) : currentSection === 'dashboard' ? (
            /* HOME DASHBOARD VIEW */
            <DashboardHomeView
              totalCount={totalCount}
              activeCount={activeCount}
              softwareCount={softwareCount}
              iotCount={iotCount}
              hardwareCount={hardwareCount}
              atRiskCount={atRiskCount}
              criticalProjects={criticalProjects}
              recentActivities={recentActivities}
              onNavigateToProjects={() => setCurrentSection('projects')}
              onSelectProject={(id) => setSelectedProjectId(id)}
              getCategoryBadge={getCategoryBadge}
              getStatusBadge={getStatusBadge}
              getHealthBadge={getHealthBadge}
            />
          ) : currentSection === 'projects' ? (
            /* PROJECT LIST VIEW */
            <ProjectListView
              projects={projects}
              filteredProjects={filteredProjects}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterDepartment={filterDepartment}
              setFilterDepartment={setFilterDepartment}
              filterHealth={filterHealth}
              setFilterHealth={setFilterHealth}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onOpenSendInvite={(p) => setSendInviteProject(p)}
              copiedCode={copiedCode}
              onCopyCode={handleCopyCode}
              getCategoryBadge={getCategoryBadge}
              getStatusBadge={getStatusBadge}
              onDeleteProject={handleDeleteProject}
              onMarkCompleted={handleMarkCompleted}
              onToggleHandover={handleToggleHandover}
              onOpenHandover={handleOpenHandover}
            />
          ) : currentSection === 'teams' ? (
            <TeamsDirectoryView
              projects={projects}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onOpenSendInvite={(p) => setSendInviteProject(p)}
              getCategoryBadge={getCategoryBadge}
              getHealthBadge={getHealthBadge}
            />
          ) : currentSection === 'departments' ? (
            <DepartmentsView
              projects={projects}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onNavigateToProjectsWithFilter={(deptName) => {
                setFilterDepartment(deptName);
                setCurrentSection('projects');
              }}
              getCategoryBadge={getCategoryBadge}
              getHealthBadge={getHealthBadge}
              getStatusBadge={getStatusBadge}
            />
          ) : currentSection === 'analytics' ? (
            <div className="admin-content-container">
              <div className="admin-page-header">
                <h1 className="admin-page-title">Analytics & Institutional Metrics</h1>
                <p className="admin-page-subtitle">Velocity, completion rates, and cross-departmental benchmarks.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Average Progress</span>
                  <div className="text-3xl font-bold text-blue-600 font-mono mt-2">
                    {Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / (projects.length || 1))}%
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Average Health Score</span>
                  <div className="text-3xl font-bold text-emerald-600 font-mono mt-2">
                    {Math.round(projects.reduce((acc, p) => acc + (p.healthScore || 0), 0) / (projects.length || 1))}%
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Team Adoption Rate</span>
                  <div className="text-3xl font-bold text-purple-600 font-mono mt-2">
                    {Math.round((projects.filter(p => p.isAccessCodeClaimed).length / (projects.length || 1)) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          ) : currentSection === 'activity' ? (
            <div className="admin-content-container">
              <div className="admin-page-header">
                <h1 className="admin-page-title">Institutional Activity Audit Trail</h1>
                <p className="admin-page-subtitle">Immutable audit logs across project lifecycles.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                {recentActivities.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 text-xs border-b border-slate-100 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{act.title}</div>
                      <p className="text-slate-500 mt-0.5">{act.description}</p>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        {act.projectId} • {typeof act.timestamp === 'string' ? act.timestamp : new Date(act.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ================================================== */
            /* GOVERNANCE & CONSOLE SETTINGS VIEW                 */
            /* ================================================== */
            <div className="admin-content-container">
              
              {/* Page Header */}
              <div className="admin-page-header">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #DBEAFE', width: 'fit-content' }}>
                  <ShieldCheck size={13} />
                  <span>Institutional Administration & Security</span>
                </div>
                <h1 className="admin-page-title" style={{ marginTop: '8px' }}>Governance & Console Settings</h1>
                <p className="admin-page-subtitle">
                  Configure institutional parameters, security enforcers, telemetry verification rules, and administrator session controls.
                </p>
              </div>

              {/* 2-Column Responsive Settings Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', alignItems: 'start' }}>
                
                {/* LEFT COLUMN: Administrator Session, Security Credentials & Danger Zone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* 1. Admin Profile Card */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} className="text-blue-600" />
                        <span>Active Administrator Session</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                        <span>Active Session</span>
                      </span>
                    </div>

                    {/* Profile Identity Block */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', flexShrink: 0 }}>
                        {adminUser?.name ? adminUser.name[0].toUpperCase() : 'S'}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {adminUser?.name || 'System Administrator'}
                        </h3>
                        <div style={{ fontSize: '12.5px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px', wordBreak: 'break-all' }}>
                          {adminUser?.email || 'admin@projectnexus.edu'}
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#4338CA', backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', padding: '2px 8px', borderRadius: '6px' }}>
                            <ShieldCheck size={12} />
                            <span>Governance Clearance L3</span>
                          </span>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>· Institutional Admin</span>
                        </div>
                      </div>
                    </div>

                    {/* Session Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px', marginBottom: '20px' }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '11px' }}>Authentication Token:</span>
                        <div style={{ fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>JWT (HS256)</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '11px' }}>Token Validity:</span>
                        <div style={{ fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>7 Days Rolling</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '11px' }}>Governance Scope:</span>
                        <div style={{ fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>All Branches</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '11px' }}>Audit Logging:</span>
                        <div style={{ fontWeight: 700, color: '#16A34A', marginTop: '2px' }}>Real-time Active</div>
                      </div>
                    </div>

                    {/* Quick Logout Button in Profile Card */}
                    <button
                      onClick={() => onLogout && onLogout()}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px 16px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
                      type="button"
                    >
                      <LogOut size={15} />
                      <span>Sign Out of Administrator Session</span>
                    </button>
                  </div>

                  {/* 2. Session Termination Danger Zone */}
                  <div style={{ backgroundColor: '#FFF5F5', border: '1.5px solid #FED7D7', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(220, 38, 38, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#991B1B' }}>
                      <AlertTriangle size={18} />
                      <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                        Session Termination & Security Revocation
                      </h3>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#7F1D1D', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                      Signing out immediately invalidates your JWT bearer authorization token on this device, purges cached console state, and returns you to the institutional gateway.
                    </p>
                    <button
                      onClick={() => onLogout && onLogout()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#B91C1C'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DC2626'; }}
                      type="button"
                    >
                      <LogOut size={15} />
                      <span>Terminate Session & Log Out</span>
                    </button>
                  </div>

                </div>

                {/* RIGHT COLUMN: Governance Security Policies & Infrastructure Gateways */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* 3. Institutional Policy Controls Card */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Lock size={16} className="text-blue-600" />
                          <span>Institutional Tracking & Governance Policies</span>
                        </h3>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                          Autonomous security and health tracking rules enforced across college capstones.
                        </p>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>
                        4 Active Rules
                      </span>
                    </div>

                    {/* Interactive Toggle List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      
                      {/* Toggle 1: Stagnancy Alerts */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', padding: '14px 16px', borderRadius: '12px', backgroundColor: stagnancyAlerts ? '#F8FAFC' : '#FFFFFF', border: '1px solid #E2E8F0', transition: 'background-color 0.15s ease' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            Automatic Stagnancy Health Scoring
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.4 }}>
                            Flag capstone projects with zero telemetry activity or commit updates for more than 7 days as <strong style={{ color: '#DC2626' }}>At Risk</strong>.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStagnancyAlerts(!stagnancyAlerts)}
                          style={{ width: '44px', height: '24px', borderRadius: '9999px', backgroundColor: stagnancyAlerts ? '#2563EB' : '#CBD5E1', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0, padding: 0 }}
                          title="Toggle Automatic Stagnancy Alerts"
                        >
                          <span style={{ position: 'absolute', top: '2px', left: stagnancyAlerts ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FFFFFF', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>

                      {/* Toggle 2: Access Code Enforcer */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', padding: '14px 16px', borderRadius: '12px', backgroundColor: accessCodeEnforcer ? '#F8FAFC' : '#FFFFFF', border: '1px solid #E2E8F0', transition: 'background-color 0.15s ease' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            Access Code Cryptographic Enforcer
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.4 }}>
                            Enforce 4-character cryptographic tokens prefixed with <strong style={{ fontFamily: 'monospace', color: '#2563EB' }}>NEXUS-</strong> for student team onboarding.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAccessCodeEnforcer(!accessCodeEnforcer)}
                          style={{ width: '44px', height: '24px', borderRadius: '9999px', backgroundColor: accessCodeEnforcer ? '#2563EB' : '#CBD5E1', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0, padding: 0 }}
                          title="Toggle Access Code Enforcer"
                        >
                          <span style={{ position: 'absolute', top: '2px', left: accessCodeEnforcer ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FFFFFF', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>

                      {/* Toggle 3: Auto-Archiving */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', padding: '14px 16px', borderRadius: '12px', backgroundColor: autoArchiving ? '#F8FAFC' : '#FFFFFF', border: '1px solid #E2E8F0', transition: 'background-color 0.15s ease' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            Automated Handover Repository Archiving
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.4 }}>
                            Generate frozen Git predecessor tags (<strong style={{ fontFamily: 'monospace', color: '#475569' }}>v1.0-handover-archive</strong>) whenever an admin flags continuity handover.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAutoArchiving(!autoArchiving)}
                          style={{ width: '44px', height: '24px', borderRadius: '9999px', backgroundColor: autoArchiving ? '#2563EB' : '#CBD5E1', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0, padding: 0 }}
                          title="Toggle Handover Auto-Archiving"
                        >
                          <span style={{ position: 'absolute', top: '2px', left: autoArchiving ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FFFFFF', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>

                      {/* Toggle 4: HMAC Signature Verification */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', padding: '14px 16px', borderRadius: '12px', backgroundColor: hmacVerification ? '#F8FAFC' : '#FFFFFF', border: '1px solid #E2E8F0', transition: 'background-color 0.15s ease' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            GitHub Webhook SHA-256 HMAC Verification
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.4 }}>
                            Verify cryptographic signature header (<strong style={{ fontFamily: 'monospace', color: '#475569' }}>X-Hub-Signature-256</strong>) on all inbound repository push payloads.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHmacVerification(!hmacVerification)}
                          style={{ width: '44px', height: '24px', borderRadius: '9999px', backgroundColor: hmacVerification ? '#2563EB' : '#CBD5E1', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0, padding: 0 }}
                          title="Toggle Webhook HMAC Verification"
                        >
                          <span style={{ position: 'absolute', top: '2px', left: hmacVerification ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FFFFFF', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* 4. Infrastructure & Live Gateways Status */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Server size={16} className="text-blue-600" />
                      <span>Connected Infrastructure & Ingestion Gateways</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', fontSize: '12.5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Database size={16} className="text-emerald-600" />
                          <span style={{ fontWeight: 600, color: '#1E293B' }}>MongoDB Atlas Cluster</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
                          Connected · TLS 1.3
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', fontSize: '12.5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Radio size={16} className="text-purple-600" />
                          <span style={{ fontWeight: 600, color: '#1E293B' }}>Public Webhook Gateway</span>
                        </div>
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
                          support-shy-overcook.ngrok-free.dev
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', fontSize: '12.5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Mail size={16} className="text-blue-600" />
                          <span style={{ fontWeight: 600, color: '#1E293B' }}>Nodemailer SMTP Gateway</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                          Gmail Service Active
                        </span>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* SEND INVITATION LINK VIA EMAIL MODAL */}
      <SendInviteModal
        isOpen={!!sendInviteProject}
        onClose={() => setSendInviteProject(null)}
        project={sendInviteProject}
        onInviteSent={handleInviteSent}
      />

    </div>
  );
}
