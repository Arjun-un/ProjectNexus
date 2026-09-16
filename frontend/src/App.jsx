import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import EntryLandingPage from './components/EntryLandingPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import AdminDashboardView from './components/AdminDashboardView';
import TeamWorkspaceView from './components/TeamWorkspaceView';
import InviteModal from './components/InviteModal';
import HandoverModal from './components/HandoverModal';
import { 
  initialProjects, 
  initialTasks, 
  initialMilestones, 
  initialWeeklyUpdates, 
  flagshipHandoverRecord,
  initialActivityLogs
} from './data/mockData';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'admin-login' | 'admin' | 'workspace'
  const [projects, setProjects] = useState(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState('proj-101');
  const [tasks, setTasks] = useState(initialTasks);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [weeklyUpdates, setWeeklyUpdates] = useState(initialWeeklyUpdates);
  const [handoverRecord, setHandoverRecord] = useState(flagshipHandoverRecord);
  const [activityLogs, setActivityLogs] = useState(initialActivityLogs);

  // ── Admin Auth State ──
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [selectedProjectForHandover, setSelectedProjectForHandover] = useState(null);

  // ── Restore admin session from localStorage on mount ──
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('adminToken');
      if (!savedToken) {
        setIsRestoringSession(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        const data = await res.json();

        if (res.ok && data.success && data.user.role === 'admin') {
          setAdminToken(savedToken);
          setAdminUser(data.user);
        } else {
          // Token expired or invalid — clean up
          localStorage.removeItem('adminToken');
        }
      } catch {
        // Backend unreachable — clear stale token silently
        localStorage.removeItem('adminToken');
      }

      setIsRestoringSession(false);
    };

    restoreSession();
  }, []);

  // ── Browser History Integration ──
  const navigateTo = useCallback((view) => {
    setCurrentView(view);
    window.history.pushState({ view }, '', `#${view}`);
  }, []);

  useEffect(() => {
    window.history.replaceState({ view: 'home' }, '', '#home');

    const handlePopState = (event) => {
      const view = event.state?.view || 'home';
      // If trying to go to admin without being logged in, redirect to login
      if (view === 'admin' && !adminUser) {
        setCurrentView('admin-login');
      } else {
        setCurrentView(view);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [adminUser]);

  // ── Admin Login Success Handler ──
  const handleAdminLoginSuccess = useCallback((token, user, targetRole) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('adminToken', token);
    if (targetRole === 'team') {
      navigateTo('workspace');
    } else {
      navigateTo('admin');
    }
  }, [navigateTo]);

  // ── Admin Logout Handler ──
  const handleAdminLogout = useCallback(() => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('adminToken');
    navigateTo('home');
  }, [navigateTo]);

  // ── Navigate to Admin — gate through login ──
  const handleNavigateToAdmin = useCallback(() => {
    if (adminUser) {
      navigateTo('admin');
    } else {
      navigateTo('admin-login');
    }
  }, [adminUser, navigateTo]);

  // Counts for alerts
  const stagnantCount = projects.filter(p => p.lastUpdateDaysAgo >= 7 && p.status === 'active').length;
  const overdueCount = projects.filter(p => p.hasOverdueMilestones).length;

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Select project and switch to workspace
  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    navigateTo('workspace');
  };

  // Trigger handover modal
  const handleOpenHandoverModal = (project) => {
    setSelectedProjectForHandover(project || activeProject);
    setIsHandoverModalOpen(true);
  };

  // Confirm and execute versioned handover
  const handleConfirmHandover = (handoverData) => {
    const updatedVersionNumber = (selectedProjectForHandover?.currentVersionNumber || 1) + 1;
    
    // Update the project state
    setProjects(prev => prev.map(p => {
      if (p.id === (selectedProjectForHandover?.id || activeProjectId)) {
        return {
          ...p,
          currentVersionNumber: updatedVersionNumber,
          isContinuation: true,
          status: 'active',
          currentProgress: p.currentProgress,
          team: {
            name: handoverData.newTeamName,
            lead: { name: handoverData.newLeadEmail.split('@')[0], email: handoverData.newLeadEmail, rollNo: 'CS24B001' },
            members: [
              { name: 'Continuation Member 1', email: 'mem1@college.edu', rollNo: 'CS24B002', tasksAssigned: 2 },
              { name: 'Continuation Member 2', email: 'mem2@college.edu', rollNo: 'CS24B003', tasksAssigned: 1 }
            ]
          },
          previousTeam: {
            name: p.team?.name || 'Previous Team',
            version: p.currentVersionNumber || 1,
            discontinuedAt: p.currentProgress,
            reason: handoverData.reason,
            discontinuedDate: new Date().toISOString().split('T')[0]
          },
          lastUpdateDaysAgo: 0,
          lastUpdateDate: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));

    // Update handover record
    setHandoverRecord({
      projectId: selectedProjectForHandover?.id || activeProjectId,
      fromVersion: selectedProjectForHandover?.currentVersionNumber || 1,
      toVersion: updatedVersionNumber,
      fromTeamName: selectedProjectForHandover?.team?.name || 'Team Alpha',
      toTeamName: handoverData.newTeamName,
      discontinuationReason: handoverData.reason,
      transferDate: new Date().toISOString().split('T')[0],
      progressAtHandover: selectedProjectForHandover?.currentProgress || 45,
      completedModules: handoverData.completed,
      pendingModules: handoverData.pending,
      knownIssues: handoverData.issues,
      facultyGuidanceNotes: handoverData.facultyNotes,
      githubUrl: selectedProjectForHandover?.githubUrl || 'https://github.com/nexus-college/smart-attendance-system',
      documents: [
        { title: 'Archived Handover Brief v1.0', url: '#' },
        { title: 'Inherited SRS & Module Guide', url: '#' }
      ]
    });

    // Add activity log
    setActivityLogs(prev => [
      {
        id: 'act-' + Date.now(),
        action: 'HANDOVER_EXECUTED',
        user: 'Admin (Governance Engine)',
        details: `Discontinued v${selectedProjectForHandover?.currentVersionNumber || 1}.0 and transferred project to ${handoverData.newTeamName} (v${updatedVersionNumber}.0)`,
        time: 'Just now'
      },
      ...prev
    ]);

    // Switch view directly into the continuation workspace!
    setActiveProjectId(selectedProjectForHandover?.id || activeProjectId);
    navigateTo('workspace');
  };

  // Approve a pending proposal
  const handleApproveProject = (projectId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, status: 'active', lastUpdateDaysAgo: 0 };
      }
      return p;
    }));
    alert('Project proposal approved! Status is now ACTIVE.');
  };

  // ── View Router with custom setCurrentView that gates admin ──
  const handleSetCurrentView = useCallback((view) => {
    if (view === 'admin') {
      handleNavigateToAdmin();
    } else {
      navigateTo(view);
    }
  }, [handleNavigateToAdmin, navigateTo]);

  return (
    <div className="min-h-screen font-sans">
      
      {currentView === 'home' ? (
        <EntryLandingPage
          onEnterAdmin={handleNavigateToAdmin}
          onEnterWorkspace={() => navigateTo('workspace')}
          onOpenHandoverDemo={() => handleOpenHandoverModal(activeProject)}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
        />
      ) : currentView === 'admin-login' ? (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          onBack={() => navigateTo('home')}
        />
      ) : currentView === 'admin' ? (
        <AdminDashboard
          adminUser={adminUser}
          onLogout={handleAdminLogout}
        />
      ) : (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative">
          
          {/* Ambient background glow effects */}
          <div className="bg-ambient-glow" />

          {/* Top Navigation */}
          <Navbar
            currentView={currentView}
            setCurrentView={handleSetCurrentView}
            projects={projects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
            onOpenHandoverModal={() => handleOpenHandoverModal(activeProject)}
            stagnantCount={stagnantCount}
            overdueCount={overdueCount}
            adminUser={adminUser}
            onAdminLogout={handleAdminLogout}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 z-10">
            <TeamWorkspaceView
              project={activeProject}
                tasks={tasks}
                setTasks={setTasks}
                milestones={milestones}
                weeklyUpdates={weeklyUpdates}
                setWeeklyUpdates={setWeeklyUpdates}
                handoverRecord={handoverRecord}
                activityLogs={activityLogs}
                onTriggerHandover={() => handleOpenHandoverModal(activeProject)}
              />
          </main>

          {/* Footer for Dashboard / Workspace */}
          <footer className="border-t border-white/10 py-6 px-4 lg:px-8 text-center text-xs text-slate-500 z-10 bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigateTo('home')} 
                  className="font-extrabold text-slate-300 font-display hover:text-indigo-400 transition-colors"
                >
                  ProjectNexus
                </button>
                <span>—</span>
                <span>Academic Project Lifecycle & Versioned Continuity OS</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="text-indigo-400">Queryable Version History</span>
                <span>•</span>
                <span className="text-emerald-400">Jira Kanban Sync</span>
                <span>•</span>
                <span className="text-purple-400">Token-Gated RBAC</span>
              </div>
            </div>
          </footer>

        </div>
      )}

      {/* Modals */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <HandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        onConfirmHandover={handleConfirmHandover}
        project={selectedProjectForHandover || activeProject}
      />

    </div>
  );
}
