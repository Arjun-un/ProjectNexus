import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Link,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader2,
  Share2
} from 'lucide-react';

export default function SendInviteModal({ isOpen, onClose, project, onInviteSent }) {
  const [email, setEmail] = useState(project?.invitedLeadEmail || '');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !project) return null;

  const directJoinUrl = `${window.location.origin}/join?code=${project.teamAccessCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directJoinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter a valid student team leader email.');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const targetId = project.projectId || project._id || 'PRJ-NEXUS';
      const res = await fetch(`http://localhost:5000/api/projects/${encodeURIComponent(targetId)}/send-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          customNote: customNote.trim(),
          projectTitle: project.title,
          teamAccessCode: project.teamAccessCode,
          department: project.department,
          facultyGuide: project.facultyGuide,
          deadline: project.deadline
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        onInviteSent && onInviteSent(email.trim(), data.data);
      } else {
        throw new Error(data.message || 'Failed to dispatch email');
      }
    } catch (err) {
      setError(err.message || 'Could not reach the server. Make sure the backend is running on port 5000.');
    } finally {
      setIsSending(false);
    }
  };

  const handleModalClose = () => {
    setIsSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Send Project Invitation Link</h2>
              <p className="text-[11px] text-slate-500 font-mono">{project.projectId}</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Invitation Link Dispatched!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Project details and access code <strong>{project.teamAccessCode}</strong> were emailed to <strong>{email}</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                <div className="text-[11px] font-semibold text-slate-500">Direct Workspace Link:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={directJoinUrl}
                    className="flex-1 text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleModalClose}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              
              {error && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Project summary banner */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs">
                <div className="font-bold text-blue-900 truncate">{project.title}</div>
                <div className="text-[11px] text-blue-700 mt-0.5 flex items-center justify-between">
                  <span>Access Code: <strong className="font-mono">{project.teamAccessCode}</strong></span>
                  <span>{project.department}</span>
                </div>
              </div>

              {/* Recipient Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Team Leader Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student.lead@projectnexus.edu"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Custom Note (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Directive Note from Admin (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Please register your team members and submit initial milestone plan by Friday."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              {/* Direct Link Preview & Copy */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-500">
                    Direct Registration Link
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 truncate">
                  {directJoinUrl}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Invitation Email</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
