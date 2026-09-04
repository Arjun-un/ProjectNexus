import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  GitFork, 
  ExternalLink, 
  Eye, 
  UserCheck, 
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  FolderGit2,
  Check,
  XCircle
} from 'lucide-react';

export default function AdminDashboardView({ 
  projects, 
  onSelectProject, 
  onOpenInviteModal, 
  onOpenHandoverModal,
  onApproveProject
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Aggregated KPIs
  const totalCount = projects.length;
  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const pendingCount = projects.filter(p => p.status === 'pending_approval').length;
  const stagnantProjects = projects.filter(p => p.lastUpdateDaysAgo >= 7 && p.status === 'active');
  const overdueProjects = projects.filter(p => p.hasOverdueMilestones);

  // Filtered Project List
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.team?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.techStack?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? p.status === 'active' :
      statusFilter === 'stagnant' ? (p.lastUpdateDaysAgo >= 7 && p.status === 'active') :
      statusFilter === 'pending_approval' ? p.status === 'pending_approval' :
      statusFilter === 'completed' ? p.status === 'completed' :
      statusFilter === 'discontinued' ? (p.status === 'discontinued' || p.isContinuation) : true;

    const matchesDepartment = 
      departmentFilter === 'all' ? true : p.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Institutional Admin Dashboard
            </h1>
            <span className="badge badge-active text-xs">Live Monitoring</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centralized governance, milestone pace tracking, stagnant alert intervention, and continuity handovers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenInviteModal}
            className="btn-primary text-xs py-2 px-4 shadow-lg"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Generate Lead Invite</span>
          </button>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total */}
        <div 
          onClick={() => setStatusFilter('all')}
          className={`nexus-card p-4 cursor-pointer transition-all ${
            statusFilter === 'all' ? 'border-indigo-500 bg-indigo-950/20' : ''
          }`}
        >
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Projects</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-white">{totalCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">100%</span>
          </div>
        </div>

        {/* Active */}
        <div 
          onClick={() => setStatusFilter('active')}
          className={`nexus-card p-4 cursor-pointer transition-all ${
            statusFilter === 'active' ? 'border-emerald-500 bg-emerald-950/20' : ''
          }`}
        >
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Active</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-emerald-300">{activeCount}</span>
            <span className="text-[10px] text-emerald-400/80 font-mono">In-Flight</span>
          </div>
        </div>

        {/* Pending Approval */}
        <div 
          onClick={() => setStatusFilter('pending_approval')}
          className={`nexus-card p-4 cursor-pointer transition-all ${
            statusFilter === 'pending_approval' ? 'border-amber-500 bg-amber-950/20' : ''
          }`}
        >
          <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Pending Approval</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-300">{pendingCount}</span>
            <span className="text-[10px] text-amber-400/80 font-mono">Proposals</span>
          </div>
        </div>

        {/* Stagnant Alert (>= 7 days) */}
        <div 
          onClick={() => setStatusFilter('stagnant')}
          className={`nexus-card p-4 cursor-pointer relative overflow-hidden transition-all ${
            stagnantProjects.length > 0 ? 'border-rose-500/60 bg-rose-950/20' : ''
          } ${statusFilter === 'stagnant' ? 'ring-2 ring-rose-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Stagnant (&ge;7d)
            </p>
            {stagnantProjects.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-rose-300">{stagnantProjects.length}</span>
            <span className="text-[10px] text-rose-400 font-mono">Needs Nudge</span>
          </div>
        </div>

        {/* Overdue Milestones */}
        <div 
          onClick={() => setStatusFilter('stagnant')}
          className="nexus-card p-4 cursor-pointer transition-all"
        >
          <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-300">{overdueProjects.length}</span>
            <span className="text-[10px] text-amber-400/80 font-mono">Milestones</span>
          </div>
        </div>

        {/* Completed */}
        <div 
          onClick={() => setStatusFilter('completed')}
          className={`nexus-card p-4 cursor-pointer transition-all ${
            statusFilter === 'completed' ? 'border-cyan-500 bg-cyan-950/20' : ''
          }`}
        >
          <p className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Completed</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-cyan-300">{completedCount}</span>
            <span className="text-[10px] text-cyan-400/80 font-mono">Archived</span>
          </div>
        </div>

      </div>

      {/* Critical Intervention Banners */}
      {stagnantProjects.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-rose-100">
                Stagnant Project Detected: "{stagnantProjects[0].title}"
              </p>
              <p className="text-rose-300/80 text-[11px] mt-0.5">
                No weekly update posted for <span className="font-bold text-white">{stagnantProjects[0].lastUpdateDaysAgo} days</span>. Team lead: {stagnantProjects[0].team.lead.name} ({stagnantProjects[0].team.lead.email}).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onSelectProject(stagnantProjects[0].id)}
              className="btn-secondary text-[11px] py-1.5 px-3 bg-rose-950/60 border-rose-500/40 text-rose-200 hover:bg-rose-900/50"
            >
              Inspect Workspace
            </button>
            <button
              onClick={() => alert(`Official reminder notification sent to ${stagnantProjects[0].team.lead.email}!`)}
              className="btn-danger text-[11px] py-1.5 px-3"
            >
              Send Reminder Nudge
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="nexus-card p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title, team lead, tech stack, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'active', label: 'Active' },
            { id: 'pending_approval', label: 'Pending' },
            { id: 'stagnant', label: 'Stagnant' },
            { id: 'completed', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Master Projects Table / Grid */}
      <div className="nexus-card overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Project Registry & Status Overview</h2>
            <span className="text-xs text-slate-400 font-mono">({filteredProjects.length} results)</span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="p-4 hover:bg-white/[0.02] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 
                    onClick={() => onSelectProject(project.id)}
                    className="text-sm font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    {project.title}
                  </h3>

                  {project.isContinuation && (
                    <span className="badge badge-version text-[10px] py-0.5 px-2">
                      v{project.currentVersionNumber}.0 Continuation
                    </span>
                  )}

                  <span className={`badge ${
                    project.status === 'active' 
                      ? (project.lastUpdateDaysAgo >= 7 ? 'badge-stagnant' : 'badge-active')
                      : project.status === 'pending_approval' ? 'badge-pending'
                      : project.status === 'completed' ? 'badge-completed'
                      : 'badge-discontinued'
                  }`}>
                    {project.lastUpdateDaysAgo >= 7 && project.status === 'active' 
                      ? '⚠️ Stagnant' 
                      : project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1">
                  {project.problemStatement}
                </p>

                {/* Meta details */}
                <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                  <span className="text-slate-300 font-medium">
                    Team: <strong className="text-white">{project.team?.name || 'Unassigned'}</strong> (Lead: {project.team?.lead?.name})
                  </span>
                  <span>•</span>
                  <span>Dept: {project.department}</span>
                  <span>•</span>
                  <span className={`flex items-center gap-1 font-mono ${
                    project.lastUpdateDaysAgo >= 7 ? 'text-rose-400 font-bold' : 'text-slate-400'
                  }`}>
                    <Clock className="w-3 h-3" />
                    Last update: {project.lastUpdateDaysAgo === 0 ? 'Today' : `${project.lastUpdateDaysAgo}d ago`}
                  </span>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                  {project.techStack?.slice(0, 5).map(tech => (
                    <span key={tech} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5 font-mono">
                      {tech}
                    </span>
                  ))}
                  {project.techStack?.length > 5 && (
                    <span className="text-[10px] text-slate-500 font-mono">+{project.techStack.length - 5}</span>
                  )}
                </div>
              </div>

              {/* Center Progress & Stats */}
              <div className="lg:w-64 space-y-2 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progress</span>
                  <span className="font-extrabold text-white font-mono">{project.currentProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      project.currentProgress >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                      project.currentProgress >= 40 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                      'bg-gradient-to-r from-amber-500 to-rose-500'
                    }`}
                    style={{ width: `${project.currentProgress}%` }}
                  />
                </div>

                {/* GitHub link preview */}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors pt-1"
                  >
                    <FolderGit2 className="w-3 h-3" />
                    <span className="truncate max-w-[180px]">{project.githubStats?.repoName || 'GitHub Repo'}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                )}
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                {project.status === 'pending_approval' ? (
                  <>
                    <button
                      onClick={() => onApproveProject(project.id)}
                      className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 border-emerald-400/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => alert(`Requested revisions from ${project.team.lead.name}`)}
                      className="btn-secondary text-xs py-1.5 px-2.5 text-rose-300"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Revisions
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Workspace</span>
                    </button>

                    {project.status === 'active' && (
                      <button
                        onClick={() => onOpenHandoverModal(project)}
                        className="btn-secondary text-xs py-1.5 px-3 text-purple-300 hover:text-purple-200 border-purple-500/30 hover:bg-purple-900/30"
                        title="Discontinue project and initiate versioned handover"
                      >
                        <GitFork className="w-3.5 h-3.5 text-purple-400" />
                        <span>Handover</span>
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
