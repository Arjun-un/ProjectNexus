import React, { useState } from 'react';
import Navbar from './components/Navbar';
import EntryLandingPage from './components/EntryLandingPage';
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

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'admin' | 'workspace'
  const [projects, setProjects] = useState(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState('proj-101');
  const [tasks, setTasks] = useState(initialTasks);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [weeklyUpdates, setWeeklyUpdates] = useState(initialWeeklyUpdates);
  const [handoverRecord, setHandoverRecord] = useState(flagshipHandoverRecord);
  const [activityLogs, setActivityLogs] = useState(initialActivityLogs);

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [selectedProjectForHandover, setSelectedProjectForHandover] = useState(null);

  // Counts for alerts
  const stagnantCount = projects.filter(p => p.lastUpdateDaysAgo >= 7 && p.status === 'active').length;
  const overdueCount = projects.filter(p => p.hasOverdueMilestones).length;

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Select project and switch to workspace
  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    setCurrentView('workspace');
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
    setCurrentView('workspace');
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

  return (
    <div className="min-h-screen font-sans">
      
      {currentView === 'home' ? (
        <EntryLandingPage
          onEnterAdmin={() => setCurrentView('admin')}
          onEnterWorkspace={() => setCurrentView('workspace')}
          onOpenHandoverDemo={() => handleOpenHandoverModal(activeProject)}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
        />
      ) : (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative">
          
          {/* Ambient background glow effects */}
          <div className="bg-ambient-glow" />

          {/* Top Navigation */}
          <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            projects={projects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
            onOpenHandoverModal={() => handleOpenHandoverModal(activeProject)}
            stagnantCount={stagnantCount}
            overdueCount={overdueCount}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 z-10">
            {currentView === 'admin' ? (
              <AdminDashboardView
                projects={projects}
                onSelectProject={handleSelectProject}
                onOpenInviteModal={() => setIsInviteModalOpen(true)}
                onOpenHandoverModal={handleOpenHandoverModal}
                onApproveProject={handleApproveProject}
              />
            ) : (
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
            )}
          </main>

          {/* Footer for Dashboard / Workspace */}
          <footer className="border-t border-white/10 py-6 px-4 lg:px-8 text-center text-xs text-slate-500 z-10 bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentView('home')} 
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
