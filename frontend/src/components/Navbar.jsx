import React from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Users, 
  GitFork, 
  PlusCircle, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Home
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  projects, 
  activeProjectId, 
  setActiveProjectId, 
  onOpenInviteModal,
  onOpenHandoverModal,
  stagnantCount,
  overdueCount
}) {
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-display">
                  Project<span className="text-indigo-400">Nexus</span>
                </span>
                <span className="badge badge-version text-[10px] py-0.5 px-2">
                  Academic OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Lifecycle & Continuity Platform</p>
            </div>
          </div>

          {/* Quick View Switcher on Mobile */}
          <div className="flex md:hidden bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'home' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'admin' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setCurrentView('workspace')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'workspace' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Workspace
            </button>
          </div>
        </div>

        {/* Center: Desktop View Switcher */}
        <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10 shadow-inner">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'home'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Portal Home</span>
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'admin'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Monitoring</span>
            {(stagnantCount > 0 || overdueCount > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setCurrentView('workspace')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'workspace'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Workspace</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              9-Tabs
            </span>
          </button>
        </div>

        {/* Right Actions & Context Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Active Project Dropdown */}
          <div className="relative group">
            <select
              value={activeProjectId}
              onChange={(e) => {
                setActiveProjectId(e.target.value);
                setCurrentView('workspace');
              }}
              className="appearance-none bg-slate-900 border border-white/10 hover:border-indigo-500/50 text-slate-200 text-xs rounded-xl px-3.5 py-2 pr-8 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer max-w-[200px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.isContinuation ? `[v${p.currentVersionNumber}] ` : ''}{p.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Invite Generator Button */}
          <button
            onClick={onOpenInviteModal}
            className="btn-primary text-xs py-2 px-3.5 whitespace-nowrap"
            title="Generate secure Team Lead invitation token"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite Lead</span>
          </button>

          {/* Handover Action Trigger */}
          <button
            onClick={onOpenHandoverModal}
            className="btn-secondary text-xs py-2 px-3 text-purple-300 hover:text-purple-200 border-purple-500/30 hover:bg-purple-500/10"
            title="Simulate Discontinuation & Versioned Handover"
          >
            <GitFork className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Handover Demo</span>
          </button>
        </div>

      </div>
    </header>
  );
}
