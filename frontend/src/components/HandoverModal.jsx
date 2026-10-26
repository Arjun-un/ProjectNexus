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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="max-w-2xl w-full p-6 relative bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Versioned Project Continuity Engine</h3>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-full">
                Flagship Module
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Discontinue active version <span className="text-indigo-600 font-semibold font-mono">v{project?.currentVersionNumber || 1}.0</span> and generate structured handover packet for continuation team.
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmitHandover} className="space-y-4 text-xs">
            
            {/* Continuity Explain Banner */}
            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5 text-indigo-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-indigo-950 text-xs">How ProjectNexus Continuity Works:</p>
                <p className="text-[11.5px] text-indigo-800/90 mt-0.5 leading-relaxed">
                  Instead of resetting the project to 0%, the system locks current deliverables, preserves repository state, and provisions a <strong>v{(project?.currentVersionNumber || 1) + 1}.0 Continuation Workspace</strong> for the new student cohort.
                </p>
              </div>
            </div>

            {/* Discontinuation Reason */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Discontinuation / Transfer Reason
              </label>
              <input 
                type="text"
                required
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Completed Modules */}
              <div>
                <label className="block font-bold text-emerald-700 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Completed Modules (1 per line)
                </label>
                <textarea 
                  rows={3}
                  required
                  value={completedModules}
                  onChange={(e) => setCompletedModules(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
                />
              </div>

              {/* Pending Modules */}
              <div>
                <label className="block font-bold text-amber-700 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Pending Modules (1 per line)
                </label>
                <textarea 
                  rows={3}
                  required
                  value={pendingModules}
                  onChange={(e) => setPendingModules(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 transition-all font-mono"
                />
              </div>
            </div>

            {/* Known Issues & Bugs */}
            <div>
              <label className="block font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Known Issues & Technical Blockers
              </label>
              <textarea 
                rows={2}
                required
                value={knownIssues}
                onChange={(e) => setKnownIssues(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100 transition-all font-mono"
              />
            </div>

            {/* Faculty Guidance Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Faculty / Guide Handover Guidance
              </label>
              <textarea 
                rows={2}
                required
                value={facultyNotes}
                onChange={(e) => setFacultyNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* Assign Continuation Team */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Assign Incoming Continuation Team (v{(project?.currentVersionNumber || 1) + 1}.0)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text"
                  placeholder="New Team Name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                />
                <input 
                  type="email"
                  placeholder="New Team Lead Email"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={onClose}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <GitFork className="w-4 h-4" />
                Execute Versioned Handover
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs animate-fade-in py-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-base font-bold text-slate-900">Handover Executed Successfully!</h4>
            <p className="text-slate-600 max-w-md mx-auto text-xs leading-relaxed">
              Project version <span className="font-mono text-indigo-700 font-bold">v{project?.currentVersionNumber || 1}.0</span> has been archived with complete historical context. <strong>{newTeamName}</strong> has been granted immediate access to the <strong>v{(project?.currentVersionNumber || 1) + 1}.0 Continuation Workspace</strong>.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left font-mono text-[11px] text-slate-700 max-w-md mx-auto space-y-1.5">
              <div>📦 Project: <span className="text-slate-900 font-bold">{project?.title}</span></div>
              <div>⚡ Inherited Progress: <span className="text-emerald-700 font-bold">{project?.currentProgress || project?.progress || 45}%</span></div>
              <div>🔗 Handover Packet: <span className="text-indigo-700 font-bold">#HANDOVER-{(project?.projectId || project?.id || '101').toUpperCase()}</span></div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  setStep(1);
                  onClose();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
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
