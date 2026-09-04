import React, { useState } from 'react';
import { 
  X, 
  GitFork, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Users, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function HandoverModal({ isOpen, onClose, onConfirmHandover, project }) {
  const [step, setStep] = useState(1);
  const [transferReason, setTransferReason] = useState('Team discontinued due to semester internship migration');
  const [completedModules, setCompletedModules] = useState('FaceNet embedding model (94% accuracy)\nStudent profile enrollment UI\nPostgreSQL vector database schema');
  const [pendingModules, setPendingModules] = useState('Anti-Spoofing & Liveness Filter\nEdge inference optimization (TensorRT)\nFaculty Attendance CSV Export');
  const [knownIssues, setKnownIssues] = useState('RTSP memory leak on WiFi disconnect\nInference latency high on CPU (need Jetson GPU)');
  const [facultyNotes, setFacultyNotes] = useState('Hardware kit available in CS Lab 3. Do not retrain base embedding network; focus directly on liveness filtering.');
  const [newTeamName, setNewTeamName] = useState('Team Gamma (Continuation)');
  const [newLeadEmail, setNewLeadEmail] = useState('lead.gamma@college.edu');

  if (!isOpen) return null;

  const handleSubmitHandover = (e) => {
    e.preventDefault();
    onConfirmHandover({
      reason: transferReason,
      completed: completedModules.split('\n').filter(Boolean),
      pending: pendingModules.split('\n').filter(Boolean),
      issues: knownIssues.split('\n').filter(Boolean),
      facultyNotes,
      newTeamName,
      newLeadEmail
    });
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="nexus-card-glow max-w-2xl w-full p-6 relative bg-slate-900 border border-purple-500/30 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
          <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Versioned Project Continuity Engine</h3>
              <span className="badge badge-handedover text-[10px] py-0.5 px-2">Flagship Module</span>
            </div>
            <p className="text-xs text-slate-400">
              Discontinue active version <span className="text-purple-300 font-semibold font-mono">v{project?.currentVersionNumber || 1}.0</span> and generate structured handover packet for continuation team.
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmitHandover} className="space-y-4 text-xs">
            
            <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-3 text-purple-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-200">How ProjectNexus Continuity Works:</p>
                <p className="text-[11px] text-purple-300/90 mt-0.5">
                  Instead of resetting the project to 0%, the system locks current deliverables, saves the GitHub state, and boots a <strong>v{(project?.currentVersionNumber || 1) + 1}.0 Continuation Workspace</strong> for the new team.
                </p>
              </div>
            </div>

            {/* Discontinuation Reason */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Discontinuation / Transfer Reason
              </label>
              <input 
                type="text"
                required
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Completed Modules */}
              <div>
                <label className="block font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed Modules (1 per line)
                </label>
                <textarea 
                  rows={3}
                  required
                  value={completedModules}
                  onChange={(e) => setCompletedModules(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              {/* Pending Modules */}
              <div>
                <label className="block font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Pending Modules (1 per line)
                </label>
                <textarea 
                  rows={3}
                  required
                  value={pendingModules}
                  onChange={(e) => setPendingModules(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Known Issues & Bugs */}
            <div>
              <label className="block font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Known Issues & Technical Blockers
              </label>
              <textarea 
                rows={2}
                required
                value={knownIssues}
                onChange={(e) => setKnownIssues(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition-all font-mono"
              />
            </div>

            {/* Faculty Guidance Notes */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Faculty / Guide Handover Guidance
              </label>
              <textarea 
                rows={2}
                required
                value={facultyNotes}
                onChange={(e) => setFacultyNotes(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Assign Continuation Team */}
            <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Assign Incoming Continuation Team (v{(project?.currentVersionNumber || 1) + 1}.0)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text"
                  placeholder="New Team Name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <input 
                  type="email"
                  placeholder="New Team Lead Email"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary text-xs py-2 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-purple-400/30"
              >
                <GitFork className="w-4 h-4" />
                Execute Versioned Handover
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs animate-fade-in py-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-base font-bold text-white">Handover Executed Successfully!</h4>
            <p className="text-slate-300 max-w-md mx-auto">
              Project version <span className="font-mono text-purple-300">v{project?.currentVersionNumber || 1}.0</span> has been archived with complete historical context. <strong>{newTeamName}</strong> has been granted immediate access to the <strong>v{(project?.currentVersionNumber || 1) + 1}.0 Continuation Workspace</strong>.
            </p>

            <div className="bg-slate-950 border border-white/10 rounded-xl p-3.5 text-left font-mono text-[11px] text-slate-300 max-w-md mx-auto space-y-1">
              <div>📦 Project: <span className="text-white">{project?.title}</span></div>
              <div>⚡ Inherited Progress: <span className="text-emerald-400">{project?.currentProgress || 45}%</span></div>
              <div>🔗 Handover Packet: <span className="text-indigo-400">#HANDOVER-{(project?.id || '101').toUpperCase()}</span></div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  setStep(1);
                  onClose();
                }}
                className="btn-primary text-xs py-2 px-6"
              >
                Open Continuation Workspace
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
