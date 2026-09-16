import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  Users,
  Building2,
  Clock,
  Mail,
  Copy,
  Check,
  RefreshCw,
  Slash,
  AlertCircle,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ProjectDetailView({
  project,
  onBack,
  onOpenSendInvite,
  onRegenerateCode,
  onRevokeCode,
  getCategoryBadge,
  getStatusBadge,
  getHealthBadge
}) {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!project) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project.teamAccessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Bar Navigation & Statuses */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">
            Academic Year: {project.academicYear || '2025-2026'}
          </span>
          {getCategoryBadge(project.category)}
          {getStatusBadge(project.status)}
        </div>
      </div>

      {/* Title & Health Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-xs font-mono font-bold text-blue-600 tracking-wide uppercase">
            {project.projectId} • {project.department}
          </div>
          <h1 className="text-xl font-bold text-slate-900 leading-snug">
            {project.title}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {project.description || 'Institutional engineering project assigned under departmental supervision.'}
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <strong>Faculty Guide:</strong> {project.facultyGuide}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <strong>Deadline:</strong> {typeof project.deadline === 'string' ? project.deadline.slice(0, 10) : new Date(project.deadline).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Health Score Gauge */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center min-w-[160px]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Health Score
          </div>
          <div className={`text-3xl font-black font-mono ${
            (project.healthScore || 0) >= 80 ? 'text-emerald-600' :
            (project.healthScore || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {project.healthScore || 85}%
          </div>
          <div className="mt-1">
            {getHealthBadge(project.health, project.healthScore)}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Specs & Timeline, Right Team Roster & Access Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Progress, Engineering Specs, Events Timeline */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Progress Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Progress Overview
              </h3>
              <span className="text-xs font-mono font-bold text-blue-600">
                {project.progress || 0}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Current Milestone:</span>
                <span className="font-semibold text-slate-800">
                  {project.currentMilestone || 'Project Initiation & Team Setup'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Last Activity:</span>
                <span className="font-semibold text-slate-800">
                  {project.lastActivityDate ? (typeof project.lastActivityDate === 'string' ? project.lastActivityDate : new Date(project.lastActivityDate).toLocaleDateString()) : 'Recent'}
                </span>
              </div>
            </div>
          </div>

          {/* Category-Specific Engineering Specs */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {project.category === 'Software' ? 'Software Tech Stack' : 'Physical Components & Lab Allocation'}
            </h3>

            {project.category === 'Software' ? (
              <div className="flex flex-wrap gap-2">
                {(project.techStack && project.techStack.length > 0 ? project.techStack : ['React', 'Node.js', 'PostgreSQL']).map((tech, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono font-medium border border-blue-200/60">
                    {tech}
                  </span>
                ))}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {project.labAssigned && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span><strong>Allocated Lab:</strong> {project.labAssigned}</span>
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Components Required:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(project.componentsRequired && project.componentsRequired.length > 0 ? project.componentsRequired : ['Microcontroller', 'Telemetry Sensor']).map((c, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-mono border border-emerald-200/60">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Major Events Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Timeline of Major Events</span>
            </h3>

            <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 ml-2">
              {(project.timeline && project.timeline.length > 0 ? project.timeline : [
                { title: 'Project Provisioned', description: 'Project initialized by Administration', timestamp: 'Initial' }
              ]).map((ev, idx) => (
                <div key={idx} className="relative group">
                  <div className={`w-3 h-3 rounded-full absolute -left-[23px] top-1 ring-4 ring-white ${
                    ev.type === 'alert' ? 'bg-red-500' :
                    ev.type === 'milestone' ? 'bg-emerald-500' : 'bg-blue-600'
                  }`} />
                  <div className="text-xs font-bold text-slate-900">{ev.title}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{ev.description}</p>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    {typeof ev.timestamp === 'string' ? ev.timestamp : new Date(ev.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Team Info & Access Code Panel */}
        <div className="space-y-6">
          
          {/* Team Info Card with Member Names, Emails & Roles */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Assigned Team Roster</span>
              </h3>
              {project.isAccessCodeClaimed && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Registered
                </span>
              )}
            </div>

            {project.isAccessCodeClaimed && project.team?.name ? (
              <div className="space-y-3.5">
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60">
                  <div className="text-xs font-bold text-blue-900">{project.team.name}</div>
                  <div className="text-[11px] text-blue-700">Status: Registered & Active</div>
                </div>

                {/* Team Lead */}
                {project.team.leader?.name && (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        Team Leader
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                        {project.team.leader.role || 'Team Lead'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{project.team.leader.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{project.team.leader.email}</span>
                    </div>
                  </div>
                )}

                {/* Team Members & their configured roles */}
                {project.team.members && project.team.members.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Team Members & Configured Roles ({project.team.members.length})
                    </span>
                    <div className="space-y-2">
                      {project.team.members.map((m, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{m.name}</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                              {m.role || 'Project Contributor'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{m.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center space-y-3">
                <AlertCircle className="w-7 h-7 text-amber-600 mx-auto" />
                <div>
                  <div className="text-xs font-bold text-amber-900">Awaiting Team Registration</div>
                  <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    Student team members and their individual roles will appear here once the access code is claimed.
                  </p>
                </div>

                {project.invitedLeadEmail ? (
                  <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200 text-left text-[11px] text-amber-900">
                    <span className="font-semibold block">Designated Team Lead:</span>
                    <span className="font-mono text-amber-800">{project.invitedLeadEmail}</span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">
                      Invite dispatched {project.invitationSentAt ? new Date(project.invitationSentAt).toLocaleDateString() : 'recently'}
                    </span>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => onOpenSendInvite(project)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-xl transition-colors shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invitation Link via Email</span>
                </button>
              </div>
            )}
          </div>

          {/* Access Code Management Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Team Access Code
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                project.accessCodeStatus === 'revoked' ? 'bg-red-100 text-red-700' :
                project.isAccessCodeClaimed ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {project.accessCodeStatus === 'revoked' ? 'Revoked' :
                 project.isAccessCodeClaimed ? 'Claimed' : 'Active & Ready'}
              </span>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-center">
              <div className="font-mono text-lg font-black tracking-widest text-slate-900 select-all">
                {project.teamAccessCode}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyCode}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied Access Code</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Team Access Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenSendInvite(project)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Send Invitation Link via Email</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => onRegenerateCode(project.projectId)}
                className="flex-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
              <button
                onClick={() => onRevokeCode(project.projectId)}
                className="flex-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Slash className="w-3 h-3" />
                <span>Revoke</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
