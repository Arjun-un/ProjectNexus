import React, { useState, useEffect, useCallback } from 'react';
import EntryLandingPage from './components/EntryLandingPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import TeamWorkspacePage from './components/TeamWorkspacePage';
import InviteModal from './components/InviteModal';
import HandoverModal from './components/HandoverModal';
import HandoverDossierPage from './components/HandoverDossierPage';
import WorkspaceLoginPage from './components/WorkspaceLoginPage';
import AccessCodePage from './components/AccessCodePage';
import PublicProjectsCatalogPage from './components/PublicProjectsCatalogPage';
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
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'workspace-login' | 'access-code' | 'admin-login' | 'admin' | 'workspace'
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
  const [handoverJustExecuted, setHandoverJustExecuted] = useState(false);

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

  const activeProject = projects.find(p => p.id === activeProjectId || p.projectId === activeProjectId || p._id === activeProjectId) || projects[0];

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
  const handleConfirmHandover = async (handoverData) => {
    const updatedVersionNumber = (selectedProjectForHandover?.currentVersionNumber || 1) + 1;
    const targetId = selectedProjectForHandover?.id || selectedProjectForHandover?.projectId || selectedProjectForHandover?._id || activeProjectId;
    
    // Attempt backend persistence to MongoDB Atlas
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(targetId)}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: handoverData.reason,
          completedModules: handoverData.completed || handoverData.completedModules,
          pendingModules: handoverData.pending || handoverData.pendingModules,
          knownIssues: handoverData.issues || handoverData.knownIssues,
          facultyNotes: handoverData.facultyNotes,
          hardwareNotes: handoverData.hardwareNotes,
          newTeamName: handoverData.newTeamName,
          newLeadEmail: handoverData.newLeadEmail,
          pinnedCommitSha: handoverData.pinnedCommitSha
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updatedProject = json.data.project;
          const backendHandoverRecord = json.data.handoverRecord;

          setProjects(prev => prev.map(p => 
            (p.projectId === targetId || p._id === targetId || p.id === targetId) ? updatedProject : p
          ));
          setHandoverRecord(backendHandoverRecord);
          setActiveProjectId(updatedProject.projectId || updatedProject._id);
          setHandoverJustExecuted(true);
          navigateTo('workspace');
          return;
        }
      }
    } catch (err) {
      console.warn('Backend handover execution network error; falling back to optimistic local update:', err);
    }

    // Fallback optimistic update
    setProjects(prev => prev.map(p => {
      if (p.id === targetId || p.projectId === targetId || p._id === targetId) {
        return {
          ...p,
          currentVersionNumber: updatedVersionNumber,
          isContinuation: true,
          status: 'Active',
          team: {
            name: handoverData.newTeamName,
            lead: { name: (handoverData.newLeadEmail || 'lead').split('@')[0], email: handoverData.newLeadEmail, rollNo: 'CS24B001' },
            members: []
          },
          previousTeam: {
            name: p.team?.name || 'Previous Team',
            version: p.currentVersionNumber || 1,
            discontinuedAt: p.progress || 45,
            reason: handoverData.reason,
            discontinuedDate: new Date().toISOString().split('T')[0]
          }
        };
      }
      return p;
    }));

    // Update handover record
    setHandoverRecord({
      projectId: targetId,
      fromVersion: selectedProjectForHandover?.currentVersionNumber || 1,
      toVersion: updatedVersionNumber,
      fromTeamName: selectedProjectForHandover?.team?.name || 'Previous Student Team',
      toTeamName: handoverData.newTeamName,
      discontinuationReason: handoverData.reason,
      transferDate: new Date().toISOString().split('T')[0],
      progressAtHandover: selectedProjectForHandover?.progress || 45,
      completedModules: handoverData.completed || handoverData.completedModules,
      pendingModules: handoverData.pending || handoverData.pendingModules,
      knownIssues: handoverData.issues || handoverData.knownIssues,
      facultyGuidanceNotes: handoverData.facultyNotes,
      hardwareNotes: handoverData.hardwareNotes,
      githubUrl: selectedProjectForHandover?.githubUrl || 'https://github.com/Arjun-un/ProjectNexus.git',
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
    setHandoverJustExecuted(true);
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

  // Handle successful workspace login or access code redemption
  const handleWorkspaceAccess = (token, user, project) => {
    if (project) {
      const projId = project.id || project.projectId;
      setProjects(prev => {
        const exists = prev.some(p => p.id === projId || p.projectId === projId);
        if (exists) {
          return prev.map(p => (p.id === projId || p.projectId === projId ? { ...p, ...project } : p));
        }
        return [{
          id: projId,
          projectId: project.projectId || projId,
          title: project.title,
          category: project.category || 'Software',
          department: project.department || 'Computer Science',
          academicYear: project.academicYear || '2025-2026',
          facultyGuide: project.facultyGuide || 'Department Committee',
          deadline: project.deadline || '2026-05-30',
          priority: project.priority || 'Medium',
          description: project.description || '',
          techStack: Array.isArray(project.techStack) ? project.techStack : [],
          teamAccessCode: project.teamAccessCode,
          status: project.status || 'Active',
          currentProgress: project.progress !== undefined ? project.progress : 0,
          health: project.health || 'Not Tracked',
          healthScore: project.healthScore !== undefined ? project.healthScore : 0,
          currentVersionNumber: 1,
          lastUpdateDaysAgo: 0,
          team: project.team || {
            name: '',
            lead: { name: user?.name || '', email: user?.email || project.invitedLeadEmail || '' },
            members: []
          }
        }, ...prev];
      });
      setActiveProjectId(projId);
    }
    navigateTo('workspace');
  };

  return (
    <div className="min-h-screen font-sans">
      
      {currentView === 'home' ? (
        <EntryLandingPage
          onEnterAdmin={handleNavigateToAdmin}
          onEnterWorkspace={() => navigateTo('workspace-login')}
          onEnterAccessCode={() => navigateTo('access-code')}
          onOpenHandoverDemo={() => navigateTo('handover-dossier')}
          onViewProjects={() => navigateTo('public-projects')}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
        />
      ) : currentView === 'public-projects' ? (
        <PublicProjectsCatalogPage
          onBack={() => navigateTo('home')}
          onEnterAdmin={handleNavigateToAdmin}
          onEnterWorkspace={() => navigateTo('workspace-login')}
        />
      ) : currentView === 'handover-dossier' ? (
        <HandoverDossierPage
          project={selectedProjectForHandover || activeProject}
          onBack={() => {
            if (adminUser) navigateTo('admin');
            else navigateTo('home');
          }}
          onLaunchContinuationWorkspace={(handoverData) => {
            handleConfirmHandover(handoverData);
          }}
        />
      ) : currentView === 'workspace-login' ? (
        <WorkspaceLoginPage
          onLoginSuccess={handleWorkspaceAccess}
          onBack={() => navigateTo('home')}
        />
      ) : currentView === 'access-code' ? (
        <AccessCodePage
          onSuccess={handleWorkspaceAccess}
          onBack={() => navigateTo('home')}
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
          onOpenHandover={(proj) => {
            setSelectedProjectForHandover(proj);
            navigateTo('handover-dossier');
          }}
        />
      ) : (
        <TeamWorkspacePage
          project={activeProject}
          tasks={tasks}
          setTasks={setTasks}
          milestones={milestones}
          weeklyUpdates={weeklyUpdates}
          setWeeklyUpdates={setWeeklyUpdates}
          handoverRecord={handoverRecord}
          handoverJustExecuted={handoverJustExecuted}
          onDismissHandoverJustExecuted={() => setHandoverJustExecuted(false)}
          activityLogs={activityLogs}
          onTriggerHandover={() => handleOpenHandoverModal(activeProject)}
          onHome={() => navigateTo('home')}
        />
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
