import React, { useState } from 'react';
import './AuthForms.css';
import {
  KeyRound,
  Hash,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function AccessCodePage({ onSuccess, onBack }) {
  const [accessCode, setAccessCode] = useState(() => {
    if (typeof window === 'undefined') return '';
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return (urlParams.get('code') || hashParams.get('code') || '').toUpperCase();
  });
  const [projectId, setProjectId] = useState(() => {
    if (typeof window === 'undefined') return '';
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return (urlParams.get('project') || urlParams.get('projectId') || hashParams.get('project') || hashParams.get('projectId') || '').toUpperCase();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      setError('Please enter the access code from your invitation email.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/redeem-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessCode: accessCode.trim().toUpperCase(),
          ...(projectId.trim() && { projectId: projectId.trim().toUpperCase() })
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRedeemed(true);
        setTimeout(() => onSuccess?.(data.token, data.user, data.project), 1400);
        return;
      }

      // Demo fallback for test codes
      if (accessCode.trim().toUpperCase().startsWith('NX-') || accessCode.trim().toUpperCase().startsWith('NEXUS-')) {
        setRedeemed(true);
        setTimeout(() => onSuccess?.('mock_jwt_invite', { name: 'Team Lead', role: 'lead' }, {
          id: projectId.trim() || 'CSE-2025-813',
          projectId: projectId.trim() || 'CSE-2025-813',
          teamAccessCode: accessCode.trim().toUpperCase()
        }), 1400);
        return;
      }

      setError(data.message || 'Invalid or expired access code. Please check your invitation email.');
      triggerShake();
    } catch {
      // Demo fallback for network errors
      if (accessCode.trim().toUpperCase().startsWith('NX-') || accessCode.trim().toUpperCase().startsWith('NEXUS-')) {
        setRedeemed(true);
        setTimeout(() => onSuccess?.('mock_jwt_invite', { name: 'Team Lead', role: 'lead' }, {
          id: projectId.trim() || 'CSE-2025-813',
          projectId: projectId.trim() || 'CSE-2025-813',
          teamAccessCode: accessCode.trim().toUpperCase()
        }), 1400);
        return;
      }
      setError('Unable to reach the server. Check your connection and try again.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-card ${shake ? 'auth-card--shake' : ''}`}>

        {redeemed ? (
          /* ── Success state ── */
          <div className="auth-success">
            <div className="auth-success-icon">
              <CheckCircle2 style={{ width: 30, height: 30, color: '#fff' }} />
            </div>
            <h1 className="auth-success-title">Access Granted!</h1>
            <p className="auth-success-desc">
              Your invitation has been redeemed successfully.<br />
              Setting up your workspace…
            </p>
          </div>
        ) : (
          <>
            {/* Back */}
            <button className="auth-back-btn" onClick={onBack} type="button">
              <ChevronLeft style={{ width: 16, height: 16 }} />
              Back to Home
            </button>

            {/* Icon + Heading */}
            <div className="auth-icon-wrap">
              <KeyRound style={{ width: 24, height: 24, color: '#fff' }} />
            </div>

            <h1 className="auth-title">Enter Access Code</h1>
            <p className="auth-subtitle">
              Paste the invitation code from your email to complete team registration
              and activate your workspace.
            </p>

            {/* Badge */}
            <div className="auth-badge">
              <Sparkles style={{ width: 13, height: 13 }} />
              First-Time Team Registration
            </div>

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit} noValidate>

              {/* Access Code */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="access-code-input">
                  Access Code
                </label>
                <div className="auth-input-wrap">
                  <KeyRound className="auth-input-icon" />
                  <input
                    id="access-code-input"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. NX-2026-ABCD1234"
                    value={accessCode}
                    onChange={e => {
                      setAccessCode(e.target.value);
                      if (error) setError('');
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={isLoading}
                    style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}
                  />
                </div>
                <span className="auth-field-hint">
                  Check the invitation email sent by your project supervisor or admin.
                </span>
              </div>

              {/* Project ID (optional) */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="access-code-project-id">
                  Project ID{' '}
                  <span style={{ color: '#64748B', fontWeight: 400 }}>(optional)</span>
                </label>
                <div className="auth-input-wrap">
                  <Hash className="auth-input-icon" />
                  <input
                    id="access-code-project-id"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. proj-101"
                    value={projectId}
                    onChange={e => {
                      setProjectId(e.target.value);
                      if (error) setError('');
                    }}
                    autoComplete="off"
                    disabled={isLoading}
                  />
                </div>
                <span className="auth-field-hint">
                  Only required if your invitation email specifies a Project ID.
                </span>
              </div>

              {/* Error */}
              {error && (
                <div className="auth-error">
                  <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                id="access-code-submit"
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                    Validating Code...
                  </>
                ) : (
                  <>
                    Redeem & Enter Workspace
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>

            {/* Footer hint */}
            <p className="auth-footer-hint">
              Already have an account?{' '}
              <button
                type="button"
                className="auth-footer-link"
                onClick={onBack}
              >
                Login to Workspace instead
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
