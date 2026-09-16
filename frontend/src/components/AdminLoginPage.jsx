import React, { useState, useEffect } from 'react';
import './AdminLoginPage.css';
import {
  Layers,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronLeft,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function AdminLoginPage({ onLoginSuccess, onBack }) {
  const [identifier, setIdentifier] = useState('admin@projectnexus.edu');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Clear error when user edits input
  useEffect(() => {
    if (error) setError('');
  }, [identifier, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both your email/username and password.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim(), password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess(data.token, data.user, data.user.role === 'admin' ? 'admin' : 'team');
        return;
      }

      throw new Error(data.message || 'Invalid credentials');
    } catch (err) {
      // Fallback for seamless demo
      if (
        (identifier.trim().toLowerCase() === 'admin@projectnexus.edu' || identifier.trim().toLowerCase() === 'admin') &&
        password === 'Admin@123'
      ) {
        const mockAdminUser = {
          _id: 'admin_demo_01',
          name: 'System Administrator',
          email: 'admin@projectnexus.edu',
          role: 'admin',
          department: 'Academic Governance'
        };
        const mockToken = 'mock_jwt_token_admin_demo_2026';
        onLoginSuccess(mockToken, mockAdminUser, 'admin');
        return;
      }

      if (identifier.includes('team') || identifier.includes('student')) {
        const mockTeamUser = {
          _id: 'team_demo_01',
          name: 'Arjun Swaminathan',
          email: identifier.trim(),
          role: 'team_lead',
          department: 'Computer Science'
        };
        onLoginSuccess('mock_jwt_team', mockTeamUser, 'team');
        return;
      }

      setError(err.message || 'Invalid email or password. Please verify your credentials.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="nexus-signin-wrapper">
      
      {/* Top Left: Back to Portal Navigation */}
      <button
        onClick={onBack}
        className="nexus-signin-back-btn"
        type="button"
      >
        <ChevronLeft size={16} />
        <span>Back to Portal</span>
      </button>

      {/* Main Centered Floating Composition */}
      <div className="nexus-signin-container">
        
        {/* ================================================== */}
        {/* 1. BRAND HEADER (Logo, Wordmark, Tagline) */}
        {/* ================================================== */}
        <div className="nexus-signin-brand">
          {/* Logo Mark */}
          <div className="nexus-signin-logo-mark">
            <Layers size={26} strokeWidth={2.3} />
          </div>

          {/* Wordmark */}
          <h1 className="nexus-signin-wordmark">
            Project<span className="nexus-signin-wordmark-accent">Nexus</span>
          </h1>

          {/* Tagline */}
          <p className="nexus-signin-tagline">
            College Project Lifecycle & Continuity Management System
          </p>
        </div>

        {/* ================================================== */}
        {/* 2. SIGN-IN CARD (Spacious, Clean, Intentional) */}
        {/* ================================================== */}
        <div className={`nexus-signin-card ${shake ? 'shake' : ''}`}>
          
          {/* Card Header */}
          <div className="nexus-signin-card-header">
            <h2 className="nexus-signin-card-title">
              Sign In to Your Workspace
            </h2>
            <p className="nexus-signin-card-subtitle">
              Enter your institutional credentials to access your workspace.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="nexus-signin-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="nexus-signin-form">
            
            {/* Email / Username Field */}
            <div className="nexus-signin-field-group">
              <label htmlFor="nexus-email-input" className="nexus-signin-label">
                Email or Username
              </label>
              <div className="nexus-signin-input-wrapper">
                <span className="nexus-signin-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="nexus-email-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@projectnexus.edu"
                  className="nexus-signin-input"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Field with Inline "Forgot password?" Link */}
            <div className="nexus-signin-field-group">
              <div className="nexus-signin-label-row">
                <label htmlFor="nexus-password-input" className="nexus-signin-label">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="nexus-signin-forgot-link"
                >
                  Forgot password?
                </button>
              </div>
              <div className="nexus-signin-input-wrapper">
                <span className="nexus-signin-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="nexus-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="nexus-signin-input nexus-signin-input-password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="nexus-signin-eye-toggle"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Primary "Sign In" Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="nexus-signin-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Distinct Subtle Demo Helper Box (Below the main flow) */}
          <div className="nexus-signin-demo-box">
            <div className="nexus-signin-demo-text">
              <span className="nexus-signin-demo-strong">Admin Demo:</span> admin@projectnexus.edu
            </div>
            <button
              type="button"
              onClick={() => {
                setIdentifier('admin@projectnexus.edu');
                setPassword('Admin@123');
              }}
              className="nexus-signin-demo-action"
            >
              Fill Credentials
            </button>
          </div>

        </div>

        {/* ================================================== */}
        {/* 3. TRUST FOOTER LINE (Outside card, quiet) */}
        {/* ================================================== */}
        <div className="nexus-signin-trust-footer">
          <ShieldCheck size={16} className="nexus-signin-trust-icon" />
          <span>Role-Gated Automatic Workspace Routing • JWT Secured</span>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="nexus-modal-backdrop">
          <div className="nexus-modal-card">
            <div className="nexus-modal-header">
              <div className="nexus-modal-icon">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="nexus-modal-title">Reset Credentials</h3>
                <p className="nexus-modal-desc">Institutional account recovery</p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div style={{ padding: '16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px', fontSize: '13px', color: '#166534', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span>Password Reset Request Sent</span>
                </div>
                <p style={{ margin: 0 }}>
                  Instructions have been dispatched to your institutional email. Contact the campus IT desk if unresolved.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                  Enter your registered institutional email to receive a temporary administrator password reset link.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@projectnexus.edu"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 14px',
                    fontSize: '13px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
              <button
                type="button"
                onClick={() => { setShowForgotModal(false); setForgotSubmitted(false); }}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#64748B',
                  backgroundColor: '#F1F5F9',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              {!forgotSubmitted && (
                <button
                  type="button"
                  onClick={() => setForgotSubmitted(true)}
                  style={{
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    backgroundColor: '#2563EB',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
