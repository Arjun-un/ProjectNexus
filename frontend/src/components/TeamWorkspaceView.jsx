import React, { useState } from 'react';
import { 
  FolderGit2, 
  GitFork, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Users, 
  Calendar, 
  FileText, 
  ExternalLink, 
  Send, 
  Check, 
  Copy, 
  History, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Tag,
  GitCommit,
  GitBranch,
  Star,
  Info
} from 'lucide-react';

export default function TeamWorkspaceView({ 
  project, 
  tasks, 
  setTasks, 
  milestones, 
  weeklyUpdates, 
  setWeeklyUpdates, 
  handoverRecord, 
  activityLogs, 
  onTriggerHandover 
}) {
  const [activeTab, setActiveTab] = useState('overview');

  // Task creation state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(project.team?.lead?.name || 'Aarav Sharma');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskMilestone, setNewTaskMilestone] = useState('m3');

  // Weekly update form state
  const [completedWorkInput, setCompletedWorkInput] = useState('');
  const [blockersInput, setBlockersInput] = useState('');
  const [nextPlanInput, setNextPlanInput] = useState('');
  const [docLinkInput, setDocLinkInput] = useState('');

  // Team invite code state
  const [memberInviteCopied, setMemberInviteCopied] = useState(false);

  // Dynamic progress calculation based on tasks
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const doneTasks = projectTasks.filter(t => t.status === 'done');
  const calculatedProgress = projectTasks.length > 0 
    ? Math.round((doneTasks.length / projectTasks.length) * 100) 
    : project.currentProgress;

  // Move task status
  const handleMoveTask = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  // Add new task
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const newTask = {
      id: 'task-' + Date.now(),
      projectId: project.id,
      version: project.currentVersionNumber,
      title: newTaskTitle,
      description: 'Task created via team workspace board',
      status: 'todo',
      priority: newTaskPriority,
      assignee: newTaskAssignee,
      assigneeAvatar: newTaskAssignee.split(' ').map(n => n[0]).join(''),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      milestoneId: newTaskMilestone,
      weight: 1
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setShowNewTaskModal(false);
  };

  // Submit weekly update
  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    if (!completedWorkInput) return;

    const newUpdate = {
      id: 'upd-' + Date.now(),
      weekNumber: weeklyUpdates.length + 1,
      date: new Date().toISOString().split('T')[0],
      submittedBy: `${project.team?.lead?.name || 'Aarav Sharma'} (Team Lead)`,
      completedWork: completedWorkInput,
      blockers: blockersInput || 'None',
      nextPlan: nextPlanInput || 'Continue active milestones',
      currentProgress: calculatedProgress,
      docLink: docLinkInput
    };

    setWeeklyUpdates(prev => [newUpdate, ...prev]);
    setCompletedWorkInput('');
    setBlockersInput('');
    setNextPlanInput('');
    setDocLinkInput('');
    alert('Weekly progress update successfully posted to timeline!');
  };

  const copyMemberInvite = () => {
    const inviteLink = `https://nexus-college.edu/join-team?teamId=${project.id}&code=NEXUS-MEMBER-SECURE`;
    navigator.clipboard.writeText(inviteLink);
    setMemberInviteCopied(true);
    setTimeout(() => setMemberInviteCopied(false), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: 'Team Members' },
    { id: 'tasks', label: 'Task Board (Jira)' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'updates', label: 'Weekly Updates' },
    { id: 'github', label: 'GitHub Repository' },
    { id: 'documents', label: 'Documents / Links' },
    { id: 'activity', label: 'Activity Timeline' },
    { id: 'handover', label: 'Handover History', isFlagship: true }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Project Command Header Banner */}
      <div className="nexus-card-glow p-6 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Details */}
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="badge badge-active text-xs">
                {project.status.toUpperCase()}
              </span>

              {project.isContinuation ? (
                <span className="badge badge-handedover text-xs py-0.5 px-2.5">
                  <GitFork className="w-3.5 h-3.5" />
                  v{project.currentVersionNumber}.0 Continuation Workspace
                </span>
              ) : (
                <span className="badge badge-version text-xs">
                  v{project.currentVersionNumber}.0 Original
                </span>
              )}

              <span className="text-xs text-slate-400 font-medium">
                {project.category} • {project.department}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {project.title}
            </h1>

            <p className="text-xs lg:text-sm text-slate-300 line-clamp-2">
              {project.description}
            </p>

            {/* Continuation Banner Note */}
            {project.isContinuation && (
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-xs text-purple-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    Inherited from <strong>{project.previousTeam?.name}</strong> (v1.0 stopped at {project.previousTeam?.discontinuedAt}%). Handover packet context is active.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('handover')}
                  className="text-xs font-bold text-purple-300 hover:text-white underline whitespace-nowrap"
                >
                  View Handover Packet →
                </button>
              </div>
            )}
          </div>

          {/* Right Metrics Box */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 lg:w-72 shrink-0 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-semibold">Calculated Progress</span>
                <span className="font-extrabold text-indigo-300 font-mono text-base">{calculatedProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${calculatedProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                {doneTasks.length} of {projectTasks.length} Jira tasks completed
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Team:</span>
              <span className="font-bold text-white">{project.team?.name}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Last Update:</span>
              <span className={`font-mono font-semibold ${project.lastUpdateDaysAgo >= 7 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {project.lastUpdateDaysAgo === 0 ? 'Today' : `${project.lastUpdateDaysAgo}d ago`}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 9 Workspace Navigation Tabs */}
      <div className="border-b border-white/10 flex items-center gap-1 overflow-x-auto pb-1 text-xs font-semibold">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl whitespace-nowrap transition-all flex items-center gap-2 border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-500 text-white bg-white/[0.04]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            } ${tab.isFlagship ? 'text-purple-400 font-bold' : ''}`}
          >
            <span>{tab.label}</span>
            {tab.isFlagship && (
              <span className="badge badge-handedover text-[9px] py-0 px-1.5">
                Flagship
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Problem Statement Card */}
            <div className="nexus-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Problem Statement
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {project.problemStatement}
              </p>
            </div>

            {/* Scope & Abstract */}
            <div className="nexus-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
                Project Abstract & Scope
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {project.description}
              </p>

              <div className="pt-3 border-t border-white/5">
                <p className="text-xs font-semibold text-slate-400 mb-2">Technology Stack</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {project.techStack?.map(tech => (
                    <span key={tech} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Quick Team Roster */}
          <div className="space-y-6">
            <div className="nexus-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Active Team Roster
                </h3>
                <span className="badge badge-active text-[10px]">
                  {project.team?.members?.length + 1 || 4} Members
                </span>
              </div>

              {/* Team Lead */}
              <div className="bg-slate-950/70 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {project.team?.lead?.name?.split(' ').map(n => n[0]).join('') || 'TL'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{project.team?.lead?.name}</p>
                    <p className="text-[10px] text-indigo-300 font-mono">Team Lead ({project.team?.lead?.rollNo})</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">Lead</span>
              </div>

              {/* Members */}
              <div className="space-y-2">
                {project.team?.members?.map(m => (
                  <div key={m.email} className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 font-semibold text-[11px] flex items-center justify-center">
                        {m.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 text-xs">{m.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{m.rollNo}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{m.tasksAssigned} tasks</span>
                  </div>
                ))}
              </div>

              <button
                onClick={copyMemberInvite}
                className="btn-secondary w-full text-xs py-2 justify-center"
              >
                {memberInviteCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{memberInviteCopied ? 'Invite Link Copied!' : 'Copy Member Invite Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TEAM MEMBERS */}
      {activeTab === 'team' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Team Member Directory</h3>
              <p className="text-xs text-slate-400">All registered members have authenticated access via token invitation.</p>
            </div>
            <button onClick={copyMemberInvite} className="btn-primary text-xs py-2 px-4">
              <Plus className="w-3.5 h-3.5" />
              <span>Invite New Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Team Lead Card */}
            <div className="nexus-card p-5 border-indigo-500/40 bg-indigo-950/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-lg shadow-indigo-600/30">
                {project.team?.lead?.name?.split(' ').map(n => n[0]).join('') || 'TL'}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">Team Leader</span>
                <h4 className="text-sm font-bold text-white">{project.team?.lead?.name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{project.team?.lead?.email}</p>
                <p className="text-xs text-slate-400 font-mono">Roll: {project.team?.lead?.rollNo}</p>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tasks in Flight:</span>
                <span className="font-bold text-white font-mono">4</span>
              </div>
            </div>

            {/* Other Members */}
            {project.team?.members?.map(m => (
              <div key={m.email} className="nexus-card p-5 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-200 font-bold text-base flex items-center justify-center">
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Member</span>
                  <h4 className="text-sm font-bold text-white">{m.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{m.email}</p>
                  <p className="text-xs text-slate-400 font-mono">Roll: {m.rollNo}</p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Assigned Tasks:</span>
                  <span className="font-bold text-white font-mono">{m.tasksAssigned}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: TASK BOARD (JIRA-STYLE KANBAN) */}
      {activeTab === 'tasks' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Jira-Style Kanban Task Board</span>
                <span className="badge badge-active text-[10px]">Live Sync</span>
              </h3>
              <p className="text-xs text-slate-400">
                Progress automatically syncs: <strong className="text-indigo-400 font-mono">Done Tasks / Total Tasks = {calculatedProgress}%</strong>
              </p>
            </div>

            <button
              onClick={() => setShowNewTaskModal(true)}
              className="btn-primary text-xs py-2 px-4 shadow-lg self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>

          {/* 4 Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            
            {[
              { id: 'todo', label: 'To Do', color: 'border-slate-700 text-slate-300' },
              { id: 'in_progress', label: 'In Progress', color: 'border-indigo-500 text-indigo-400' },
              { id: 'under_review', label: 'Under Review', color: 'border-amber-500 text-amber-400' },
              { id: 'done', label: 'Done', color: 'border-emerald-500 text-emerald-400' }
            ].map(column => {
              const colTasks = projectTasks.filter(t => t.status === column.id);

              return (
                <div key={column.id} className="kanban-col">
                  
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className={`text-xs font-bold uppercase tracking-wider ${column.color}`}>
                      {column.label}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks in Column */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colTasks.length === 0 ? (
                      <div className="p-6 text-center text-[11px] text-slate-500 border border-dashed border-white/5 rounded-xl">
                        No tasks in this lane
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <div key={task.id} className="kanban-card space-y-2.5">
                          
                          <div className="flex items-start justify-between gap-2">
                            <span className={`badge text-[9px] py-0.5 px-1.5 ${
                              task.priority === 'high' ? 'priority-high' :
                              task.priority === 'medium' ? 'priority-medium' :
                              'priority-low'
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>

                            <span className="text-[10px] text-slate-400 font-mono">
                              Due {task.dueDate}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white leading-snug">
                            {task.title}
                          </h4>

                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {task.description}
                          </p>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-indigo-700 text-white font-bold text-[9px] flex items-center justify-center">
                                {task.assigneeAvatar}
                              </div>
                              <span className="text-[10px] text-slate-300">{task.assignee}</span>
                            </div>

                            {/* Quick Status Shift Select */}
                            <select
                              value={task.status}
                              onChange={(e) => handleMoveTask(task.id, e.target.value)}
                              className="bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300 px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Prog</option>
                              <option value="under_review">Review</option>
                              <option value="done">Done</option>
                            </select>
                          </div>

                        </div>
                      ))
                    )}
                  </div>

                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* TAB CONTENT 4: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-white">Project Milestones & Verification</h3>
            <p className="text-xs text-slate-400">Milestones reflect phased academic deliverables and faculty feedback.</p>
          </div>

          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div key={m.id} className="nexus-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-bold flex items-center justify-center font-mono">
                      M{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white">{m.title}</h4>
                    <span className={`badge text-[10px] ${
                      m.status === 'approved' ? 'badge-active' :
                      m.status === 'in_progress' ? 'badge-pending' :
                      'badge-discontinued'
                    }`}>
                      {m.status.toUpperCase()}
                    </span>
                  </div>

                  {m.adminFeedback && (
                    <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-indigo-300">Faculty Feedback:</strong> {m.adminFeedback}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Due Date: <strong className="text-slate-200 font-mono">{m.dueDate}</strong></span>
                    {m.completedInVersion && (
                      <span>Completed in: <strong className="text-purple-300 font-mono">v{m.completedInVersion}.0</strong></span>
                    )}
                  </div>
                </div>

                <div className="md:w-48 space-y-1.5 shrink-0">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Milestone Progress</span>
                    <span className="font-bold text-white font-mono">{m.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                    <div 
                      className={`h-full rounded-full ${
                        m.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: WEEKLY PROGRESS UPDATES */}
      {activeTab === 'updates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Submission Form */}
          <div className="nexus-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-400" />
              Post Weekly Update
            </h3>
            <p className="text-xs text-slate-400">
              Submitting resets the 7-day stagnant alert counter.
            </p>

            <form onSubmit={handleSubmitUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Completed Work This Week
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Finished face embedding tests, integrated MongoDB..."
                  value={completedWorkInput}
                  onChange={(e) => setCompletedWorkInput(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Current Blockers / Impediments
                </label>
                <input
                  type="text"
                  placeholder="e.g. RTSP latency or none"
                  value={blockersInput}
                  onChange={(e) => setBlockersInput(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Next Week's Plan
                </label>
                <input
                  type="text"
                  placeholder="e.g. Benchmark anti-spoofing algorithm"
                  value={nextPlanInput}
                  onChange={(e) => setNextPlanInput(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Optional Document / Demo Link
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={docLinkInput}
                  onChange={(e) => setDocLinkInput(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button type="submit" className="btn-primary w-full text-xs py-2 justify-center">
                <Send className="w-3.5 h-3.5" />
                <span>Submit Weekly Update</span>
              </button>
            </form>
          </div>

          {/* Historical Updates Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Weekly Progress Submissions Timeline
            </h3>

            <div className="space-y-3">
              {weeklyUpdates.map(upd => (
                <div key={upd.id} className="nexus-card p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-active text-[10px]">
                        Week {upd.weekNumber}
                      </span>
                      <span className="font-semibold text-white">{upd.submittedBy}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{upd.date}</span>
                  </div>

                  <p className="text-xs text-slate-200">
                    <strong className="text-emerald-400">Accomplished:</strong> {upd.completedWork}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-950/50 p-2 rounded-lg border border-white/5">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Blockers:</span>
                      <span className="text-rose-300">{upd.blockers}</span>
                    </div>
                    <div className="bg-slate-950/50 p-2 rounded-lg border border-white/5">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Next Week Plan:</span>
                      <span className="text-indigo-300">{upd.nextPlan}</span>
                    </div>
                  </div>

                  {upd.docLink && (
                    <a
                      href={upd.docLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 pt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Attached Report Document</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 6: GITHUB REPOSITORY */}
      {activeTab === 'github' && (
        <div className="nexus-card p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/15 flex items-center justify-center text-white">
                <FolderGit2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{project.githubStats?.repoName}</h3>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {project.githubUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs py-2 px-4 self-start sm:self-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open on GitHub</span>
            </a>
          </div>

          {/* GitHub Stats Widget */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/70 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <GitCommit className="w-3.5 h-3.5 text-indigo-400" /> Total Commits
              </span>
              <p className="text-xl font-extrabold text-white font-mono">{project.githubStats?.commitsCount || 42}</p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-400" /> Contributors
              </span>
              <p className="text-xl font-extrabold text-white font-mono">{project.githubStats?.contributors || 4}</p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400" /> GitHub Stars
              </span>
              <p className="text-xl font-extrabold text-white font-mono">{project.githubStats?.stars || 14}</p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" /> Primary Branch
              </span>
              <p className="text-base font-bold text-white font-mono">main</p>
            </div>
          </div>

          {/* Last Commit Snippet */}
          <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Latest Commit Activity</p>
            <p className="text-xs text-slate-200 font-mono">"{project.githubStats?.lastCommitMessage}"</p>
            <p className="text-[10px] text-slate-500 font-mono">Committed on {new Date(project.githubStats?.lastCommitDate).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: DOCUMENTS & LINKS */}
      {activeTab === 'documents' && (
        <div className="nexus-card p-6 space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-white">Project Documents & Shared Links</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Software Requirements Specification (SRS) v2.0', type: 'PDF', size: '2.4 MB', url: '#' },
              { title: 'System Architecture & Edge Deployment Guide', type: 'DOCX', size: '1.8 MB', url: '#' },
              { title: 'Figma Dashboard & Mobile UI Wireframes', type: 'LINK', size: 'Cloud', url: '#' },
              { title: 'Department Classroom Camera Dataset (250 Students)', type: 'DRIVE', size: '14.2 GB', url: '#' }
            ].map(doc => (
              <div key={doc.title} className="bg-slate-950/60 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {doc.type}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                    <p className="text-[10px] text-slate-400">{doc.size}</p>
                  </div>
                </div>
                <button className="btn-secondary text-xs py-1.5 px-3">
                  <ExternalLink className="w-3 h-3" />
                  <span>Open</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 8: ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <div className="nexus-card p-6 space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-white">Project Audit Trail & Activity Log</h3>
          
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            {activityLogs.map(log => (
              <div key={log.id} className="relative space-y-1">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{log.user}</span>
                  <span className="text-slate-500 text-[11px] font-mono">{log.time}</span>
                </div>
                <p className="text-xs text-slate-300">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 9: HANDOVER HISTORY (FLAGSHIP CONTINUITY ENGINE) */}
      {activeTab === 'handover' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Flagship Explainer Header */}
          <div className="nexus-card-glow p-5 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Institutional Handover History Packet</h3>
                <p className="text-xs text-purple-300">
                  Versioned Project Inheritance Record: <strong>v1.0 (Team Alpha)</strong> ➔ <strong>v2.0 (Team Beta)</strong>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl mt-2">
              When Team Alpha was discontinued at 45% completion, this immutable handover packet was generated by faculty governance. Team Beta inherited all repository states, completed modules, known issues, and notes without restarting from zero.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Completed Modules Inherited */}
            <div className="nexus-card p-5 space-y-3 border-emerald-500/30 bg-emerald-950/10">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Completed Deliverables (Inherited from v1.0)
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {handoverRecord.completedModules.map((mod, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/20">
                    <span className="text-emerald-400 font-bold font-mono">✓</span>
                    <span>{mod}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pending Modules for v2.0 */}
            <div className="nexus-card p-5 space-y-3 border-amber-500/30 bg-amber-950/10">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Deliverables (Targeted in v2.0)
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {handoverRecord.pendingModules.map((mod, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-amber-500/20">
                    <span className="text-amber-400 font-bold font-mono">→</span>
                    <span>{mod}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Known Issues & Bugs */}
            <div className="nexus-card p-5 space-y-3 border-rose-500/30 bg-rose-950/10">
              <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Documented Known Bugs & Technical Debt
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {handoverRecord.knownIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-rose-500/20">
                    <span className="text-rose-400 font-bold font-mono">!</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Faculty Guidance Notes */}
            <div className="nexus-card p-5 space-y-3 border-indigo-500/30 bg-indigo-950/10">
              <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Faculty Handover Directives
              </h4>
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-indigo-500/20 text-xs text-slate-200 leading-relaxed">
                {handoverRecord.facultyGuidanceNotes}
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Inherited Documentation Vault:</span>
                <div className="space-y-1.5">
                  {handoverRecord.documents.map(doc => (
                    <a
                      key={doc.title}
                      href={doc.url}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{doc.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* NEW TASK CREATION MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="nexus-card-glow max-w-md w-full p-6 bg-slate-900 border border-white/15 text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">Create New Jira-Style Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement real-time WebSocket alert channel"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option>{project.team?.lead?.name}</option>
                    {project.team?.members?.map(m => (
                      <option key={m.email}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
