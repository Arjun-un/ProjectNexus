import React, { useState } from 'react';
import { X, Send, Copy, Check, ShieldAlert, KeyRound, Sparkles } from 'lucide-react';

export default function InviteModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!email) return;
    const mockToken = 'lead_inv_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    setGeneratedToken({
      token: mockToken,
      url: `https://nexus-college.edu/register?token=${mockToken}&role=team_lead`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    });
  };

  const handleCopy = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="nexus-card-glow max-w-lg w-full p-6 relative bg-slate-900 border border-white/15 text-slate-100">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Generate Team Lead Invitation</h3>
            <p className="text-xs text-slate-400">Strict invitation-gated access. No self-assigned roles.</p>
          </div>
        </div>

        {!generatedToken ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Team Lead Email Address
              </label>
              <input 
                type="email"
                required
                placeholder="e.g. student.lead@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option>Computer Science & Engineering</option>
                <option>Electronics & Communication</option>
                <option>Information Technology</option>
                <option>Electrical & Electronics</option>
                <option>Mechanical & Automation</option>
              </select>
            </div>

            <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                The recipient will receive a one-time cryptographic token allowing them to form a team and propose a project for faculty approval.
              </span>
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
                className="btn-primary text-xs py-2 px-5"
              >
                <Sparkles className="w-4 h-4" />
                Generate Secure Token
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 text-xs">
              <p className="font-semibold text-sm text-emerald-200 mb-1">Invitation Token Generated!</p>
              <p>Valid for 7 days (expires {generatedToken.expiresAt}). Share this link with the student lead:</p>
            </div>

            <div className="bg-slate-950 border border-white/10 rounded-xl p-3 text-xs font-mono text-slate-300 break-all flex items-center justify-between gap-3">
              <span className="truncate">{generatedToken.url}</span>
              <button
                onClick={handleCopy}
                className="btn-secondary text-xs py-1.5 px-3 shrink-0 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => {
                  setGeneratedToken(null);
                  setEmail('');
                  onClose();
                }}
                className="btn-primary text-xs py-2 px-5"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
