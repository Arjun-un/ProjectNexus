import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';

import DashboardHomeView from './DashboardHomeView';
import ProjectListView from './ProjectListView';
import ProjectDetailView from './ProjectDetailView';
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
    projectId: 'MECH-2026-077',
    title: 'Automated 5-Axis Robotic Arm for Surface SMD Soldering',
    category: 'Hardware',
    department: 'Mechanical Engineering',
    academicYear: '2025-2026',
    facultyGuide: 'Prof. David Vance',
    deadline: '2026-05-20',
    priority: 'Medium',
    description: 'Precision inverse kinematics mechanical arm with computer vision guidance for micro-soldering dense PCB surface mount ICs.',
    componentsRequired: ['NEMA 17 Steppers (x5)', 'TMC2209 Drivers', '3D Carbon-Nylon Joints', 'Stereo Microscope Camera'],
    labAssigned: 'Robotics Fabrication & Mechatronics Bay 2',
    teamAccessCode: 'NEXUS-8M2Y',
    isAccessCodeClaimed: false,
    accessCodeStatus: 'active',
    invitedLeadEmail: 'aravind.mech@projectnexus.edu',
    invitationSentAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'Pending Approval',
    health: 'Moderate',
    healthScore: 68,
    progress: 10,
    currentMilestone: 'Team Onboarding & Access Code Distribution',
    lastActivityDate: 'Yesterday',
    team: { name: '', leader: { name: '', email: '', role: 'Team Lead' }, members: [] },
    timeline: [
      {
        _id: 't6',
        title: 'Invitation Link Dispatched to Lead',
        description: 'Access Code NEXUS-8M2Y emailed to aravind.mech@projectnexus.edu',
        timestamp: 'Yesterday at 4:30 PM',
        type: 'alert'
      }
    ]
  },
  {
    _id: 'p4',
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
  },
  {
    _id: 'p5',
    projectId: 'EEE-2026-015',
    title: 'Campus Smart Microgrid Renewable Balancing Controller',
    category: 'IoT',
    department: 'Electrical & Electronics',
    academicYear: '2025-2026',
    facultyGuide: 'Prof. Sundar Rajan',
    deadline: '2026-05-30',
    priority: 'High',
    description: 'Real-time solar inverter load shedding and battery storage balancing controller interfacing via Modbus RTU and MQTT telemetry.',
    componentsRequired: ['Raspberry Pi 4B', 'Modbus RTU Shield', 'Current Transformers SCT-013', 'Solid State Relays 40A'],
    labAssigned: 'Power Electronics Lab (Room 112)',
    teamAccessCode: 'NEXUS-6K4P',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'Active',
    health: 'Good',
    healthScore: 89,
    progress: 54,
    currentMilestone: 'Solar PV Array Load Profiling & Modbus Polling Loop',
    lastActivityDate: '18 hours ago',
    team: {
      name: 'GridPulse Dynamics',
      leader: {
        name: 'Harish Varma',
        email: 'harish.varma@projectnexus.edu',
        role: 'Power Inverter & Systems Architect'
      },
      members: [
        { name: 'Kavita Menon', email: 'kavita.menon@projectnexus.edu', role: 'Modbus Telemetry Specialist' },
        { name: 'Rahul Bose', email: 'rahul.bose@projectnexus.edu', role: 'SCADA Dashboard Developer' }
      ]
    },
    timeline: [
      {
        _id: 't8',
        title: 'Telemetry Feed Live',
        description: 'MQTT broker established streaming power metrics every 500ms.',
        timestamp: '18 hours ago',
        type: 'milestone'
      }
    ]
  },
  {
    _id: 'p6',
    projectId: 'MECH-2026-092',
    title: 'Subsea Autonomous ROV for Acoustic Pipeline Flaw Detection',
    category: 'Hardware',
    department: 'Mechanical Engineering',
    academicYear: '2025-2026',
    facultyGuide: 'Dr. Anand Venkat',
    deadline: '2026-04-18',
    priority: 'High',
    description: 'Submersible remote operated vehicle with 30-meter depth rating, ultrasonic non-destructive testing probe, and onboard thruster PID stabilization.',
    componentsRequired: ['BlueRobotics T200 Thrusters (x4)', 'Pixhawk 4 Flight Controller', 'Ultrasonic Thickness Gauge'],
    labAssigned: 'Fluid Mechanics Testing Basin',
    teamAccessCode: 'NEXUS-5R7T',
    isAccessCodeClaimed: true,
    accessCodeStatus: 'claimed',
    status: 'At Risk',
    health: 'At Risk',
    healthScore: 49,
    progress: 32,
    currentMilestone: 'Pressure Hull Seal Integrity Testing at 3 Atmospheres',
    lastActivityDate: '6 days ago',
    team: {
      name: 'Aquanaut Robotics',
      leader: {
        name: 'Siddharth Nair',
        email: 'siddharth.nair@projectnexus.edu',
        role: 'Hull Structure & Thruster Control Lead'
      },
      members: [
        { name: 'Pooja Hegde', email: 'pooja.hegde@projectnexus.edu', role: 'Ultrasonic Acoustic Testing Engineer' }
      ]
    },
    timeline: [
      {
        _id: 't9',
        title: 'Seal Flange Micro-Leak Detected',
        description: 'Test dive revealed minor seal seepage at 2.2 bar pressure. Rework of O-ring groove required.',
        timestamp: '6 days ago',
        type: 'alert'
      }
    ]
  }
];

export default function AdminDashboard({ adminUser, onLogout }) {
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

  // Fetch from live backend if available
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/projects');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.projects && json.data.projects.length > 0) {
            setProjects(json.data.projects);
          }
        }
      } catch (err) {
        // Fallback to INITIAL_PROJECTS
      }
    };
    fetchBackendData();
  }, []);

  // Compute live KPIs
  const totalCount = projects.length;
  const activeCount = projects.filter(p => p.status === 'Active').length;
  const softwareCount = projects.filter(p => p.category === 'Software').length;
  const iotCount = projects.filter(p => p.category === 'IoT').length;
  const hardwareCount = projects.filter(p => p.category === 'Hardware').length;
  const atRiskCount = projects.filter(p => p.health === 'Critical' || p.health === 'At Risk' || p.status === 'At Risk').length;

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
              getHealthBadge={getHealthBadge}
            />
          ) : currentSection === 'teams' ? (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Student Project Teams</h1>
                <p className="text-xs text-slate-500 mt-1">Directory of registered teams and their configured member roles.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.filter(p => p.team?.name).map(p => (
                  <div key={p.projectId} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">{p.team.name}</h3>
                      {getCategoryBadge(p.category)}
                    </div>
                    <div className="text-xs text-slate-500">
                      <strong>Project:</strong> {p.title} ({p.projectId})
                    </div>
                    <div className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div><strong>Lead:</strong> {p.team.leader.name}</div>
                      <div className="text-[11px] text-blue-600 font-medium">{p.team.leader.role || 'Team Lead'}</div>
                      <div className="text-[11px] text-slate-400">{p.team.leader.email}</div>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {p.team.members?.length || 0} active members with assigned roles
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : currentSection === 'departments' ? (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Engineering Departments</h1>
                <p className="text-xs text-slate-500 mt-1">Institutional academic project distributions by branch.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Computer Science & Engineering',
                  'Electronics & Communication',
                  'Information Technology',
                  'Mechanical Engineering',
                  'Electrical & Electronics'
                ].map((dept, i) => {
                  const count = projects.filter(p => p.department === dept).length;
                  return (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{dept}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{count} Registered Projects</p>
                      </div>
                      <div className="text-xl font-bold font-mono text-blue-600">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentSection === 'analytics' ? (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Analytics & Institutional Metrics</h1>
                <p className="text-xs text-slate-500 mt-1">Velocity, completion rates, and cross-departmental benchmarks.</p>
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
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Institutional Activity Audit Trail</h1>
                <p className="text-xs text-slate-500 mt-1">Immutable audit logs across project lifecycles.</p>
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
            <div className="space-y-6 max-w-3xl mx-auto">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Governance Settings</h1>
                <p className="text-xs text-slate-500 mt-1">Configure institutional parameters and access code security policies.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">Automatic Stagnancy Alerts</div>
                    <p className="text-slate-500">Flag projects inactive for more than 7 days as At Risk.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">Access Code Format Enforcer</div>
                    <p className="text-slate-500">Generate 4-character alphanumeric codes prefixed with NEXUS-.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">L3 Multi-Factor Security Check</div>
                    <p className="text-slate-500">Require administrator JWT token re-authentication for code revocation.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
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
