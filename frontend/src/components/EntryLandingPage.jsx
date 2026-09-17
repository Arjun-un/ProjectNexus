import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css';
import {
  Lock,
  Landmark,
  Users,
  GraduationCap,
  User,
  RotateCcw,
  ShieldCheck,
  Archive,
  HelpCircle,
  X,
  ChevronRight,
  ArrowRight,
  GitFork,
  Activity,
  Sparkles,
  CheckCircle2,
  Terminal,
  Cpu,
  Zap,
  Code2,
  Shield,
  FileCheck,
  ArrowUpRight,
  Layers,
  Database,
  Globe,
  Play,
  BarChart3,
  Clock,
  Menu,
  ExternalLink
} from 'lucide-react';

/* ── Animated counter hook ── */
function useCountUp(end, duration = 2000, start = 0, trigger = true) {
  const [value, setValue] = useState(start);
  useEffect(() => {
    if (!trigger) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start, trigger]);
  return value;
}

/* ── Intersection Observer hook for scroll animations ── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold: 0.15, ...options }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
}

/* ── ProjectNexus Logo ── */
function ProjectNexusLogo({ className = "w-6 h-6 text-indigo-600" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      <circle cx="4.5" cy="7.5" r="2.5" fill="currentColor" />
      <circle cx="19.5" cy="7.5" r="2.5" fill="currentColor" />
      <circle cx="12" cy="20.5" r="2.5" fill="currentColor" />
      <path
        d="M6.5 8.7L9.8 10.7M17.5 8.7L14.2 10.7M12 15.5V18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Floating Orb Background ── */
function FloatingOrbs() {
  return (
    <div className="landing-orbs-container">
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />
    </div>
  );
}

export default function EntryLandingPage({
  onEnterAdmin,
  onEnterWorkspace,
  onEnterAccessCode,
  onOpenHandoverDemo
}) {
  const [activeModal, setActiveModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for navbar style change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // In-view refs for scroll animations
  const [heroRef, heroInView] = useInView();
  const [statsRef, statsInView] = useInView();
  const [rolesRef, rolesInView] = useInView();
  const [archRef, archInView] = useInView();
  const [demoRef, demoInView] = useInView();

  // Animated stat counters
  const projectCount = useCountUp(450, 2200, 0, statsInView);
  const continuityPct = useCountUp(99, 1800, 0, statsInView);
  const handoverSpeed = useCountUp(1, 1000, 0, statsInView);

  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const roles = [
    {
      id: 'admin',
      label: 'System Admin',
      desc: 'Full technical configuration, token generation, institution-wide audit trails, and system governance.',
      icon: <ShieldCheck className="w-5 h-5" />,
      accent: '#6366f1',
      action: () => onEnterAdmin?.()
    },
    {
      id: 'principal',
      label: 'Principal / Dean',
      desc: 'Institution-wide analytics, department benchmarks, cross-faculty project trends, and completion reporting.',
      icon: <Landmark className="w-5 h-5" />,
      accent: '#8b5cf6',
      action: () => onEnterAdmin?.()
    },
    {
      id: 'hod',
      label: 'Head of Department',
      desc: 'Department project approvals, faculty guide allocation, bottleneck monitoring, and stagnation alerts.',
      icon: <Users className="w-5 h-5" />,
      accent: '#06b6d4',
      action: () => onEnterAdmin?.()
    },
    {
      id: 'faculty',
      label: 'Faculty Guide',
      desc: 'Assigned project evaluation, milestone review, stagnation alerts, and handover sign-off authority.',
      icon: <GraduationCap className="w-5 h-5" />,
      accent: '#10b981',
      action: () => onEnterAdmin?.()
    },
    {
      id: 'team_leader',
      label: 'Team Leader',
      desc: 'Sprint Kanban management, member task assignment, weekly progress submissions, and GitHub integration.',
      icon: <Zap className="w-5 h-5" />,
      accent: '#f59e0b',
      action: () => onEnterWorkspace?.()
    },
    {
      id: 'team_member',
      label: 'Team Member',
      desc: 'Task execution, milestone contributions, documentation uploads, and codebase collaboration.',
      icon: <User className="w-5 h-5" />,
      accent: '#0ea5e9',
      action: () => onEnterWorkspace?.()
    }
  ];

  const architecturePillars = [
    {
      id: 'handover',
      title: 'Versioned Continuity',
      subtitle: 'Queryable State Machine',
      desc: 'When teams discontinue midway, ProjectNexus immutably freezes deliverables into structured version packets. Successor teams inherit at exact completion percentages — eliminating ground-zero restarts.',
      icon: <RotateCcw className="w-7 h-7" />,
      gradient: 'from-violet-500 to-purple-600',
      tag: 'Flagship Core',
      onClick: onOpenHandoverDemo
    },
    {
      id: 'health',
      title: 'Health & Risk Engine',
      subtitle: 'Autonomous Risk Detection',
      desc: 'Projects with zero logged tasks or commits for 7+ days trigger automated stagnation alerts to Faculty Guides and HODs before milestone deadlines fail.',
      icon: <Activity className="w-7 h-7" />,
      gradient: 'from-rose-500 to-pink-600',
      tag: 'Automated Guard',
      onClick: () => {
        setActiveModal('architecture_info');
      }
    },
    {
      id: 'archive',
      title: 'Institutional Archive',
      subtitle: 'Knowledge Retention Vault',
      desc: 'Centralized searchable legacy vault maintaining SRS documents, architecture blueprints, and verified GitHub repositories across graduating classes.',
      icon: <Archive className="w-7 h-7" />,
      gradient: 'from-cyan-500 to-teal-600',
      tag: 'Multi-Year Vault',
      onClick: () => {
        setActiveModal('archive_info');
      }
    }
  ];

  return (
    <div className="landing-page">
      <FloatingOrbs />

      {/* ═══════════════════ TOP NAVBAR ═══════════════════ */}
      <header className={`landing-navbar ${scrolled ? 'landing-navbar-scrolled' : ''}`}>
        <div className="landing-navbar-inner">
          {/* Logo */}
          <div
            className="landing-logo-group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="landing-logo-icon">
              <ProjectNexusLogo className="w-5 h-5 text-white" />
            </div>
            <span className="landing-logo-text">
              Project<span className="landing-logo-accent">Nexus</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="landing-nav-links">
            <button onClick={() => handleScrollToSection('demo-section')}>How It Works</button>
            <button onClick={() => handleScrollToSection('roles-section')}>Role Portals</button>
            <button onClick={() => handleScrollToSection('architecture-section')}>Architecture</button>
          </nav>

          {/* Desktop CTAs */}
          <div className="landing-nav-ctas">
            <button onClick={onEnterAdmin} className="landing-btn-ghost">
              Admin Dashboard
            </button>
            <button onClick={onEnterWorkspace} className="landing-btn-primary-sm">
              Login to Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="landing-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="landing-mobile-menu">
            <button onClick={() => handleScrollToSection('demo-section')}>How It Works</button>
            <button onClick={() => handleScrollToSection('roles-section')}>Role Portals</button>
            <button onClick={() => handleScrollToSection('architecture-section')}>Architecture</button>
            <hr />
            <button onClick={() => { onEnterAdmin?.(); setMobileMenuOpen(false); }}>Admin Dashboard</button>
            <button onClick={() => { onEnterWorkspace?.(); setMobileMenuOpen(false); }} className="landing-mobile-cta">
              Login to Workspace →
            </button>
          </div>
        )}
      </header>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="landing-hero" ref={heroRef}>
        <div className={`landing-hero-content ${heroInView ? 'landing-animate-in' : 'landing-animate-hidden'}`}>
          {/* Status Pill */}
          <div className="landing-status-pill">
            <span className="landing-status-dot" />
            <span>Academic Continuity Protocol</span>
            <span className="landing-status-divider">•</span>
            <span className="landing-status-live">LIVE</span>
          </div>

          {/* Headline */}
          <h1 className="landing-hero-headline">
            Institutional Continuity.
            <br />
            <span className="landing-hero-gradient-text">Automated & Versioned.</span>
          </h1>

          <p className="landing-hero-sub">
            Eliminate ground-zero restarts when university student projects discontinue.
            Package repository code, SRS specs, and task states into queryable handover packets
            for next-generation teams.
          </p>

          {/* CTA Buttons */}
          <div className="landing-hero-ctas">
            <button onClick={onEnterAccessCode} className="landing-btn-primary">
              <Play className="w-4 h-4" />
              <span>Enter Access Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button onClick={onOpenHandoverDemo} className="landing-btn-outline">
              <GitFork className="w-4 h-4" />
              <span>Simulate Handover (v1.0 → v2.0)</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="landing-trust-row">
            <div className="landing-trust-item">
              <Shield className="w-3.5 h-3.5" />
              <span>JWT + RBAC Security</span>
            </div>
            <div className="landing-trust-item">
              <Database className="w-3.5 h-3.5" />
              <span>MongoDB Versioned Storage</span>
            </div>
            <div className="landing-trust-item">
              <Globe className="w-3.5 h-3.5" />
              <span>MERN Full-Stack Architecture</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ KPI STATS BAR ═══════════════════ */}
      <section className="landing-stats-bar" ref={statsRef}>
        <div className={`landing-stats-grid ${statsInView ? 'landing-animate-in' : 'landing-animate-hidden'}`}>
          <div className="landing-stat-item">
            <span className="landing-stat-value">{continuityPct}.8%</span>
            <span className="landing-stat-label">Continuity Retention</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat-item">
            <span className="landing-stat-value">{projectCount}+</span>
            <span className="landing-stat-label">Projects Managed</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat-item">
            <span className="landing-stat-value">0%</span>
            <span className="landing-stat-label">Knowledge Lost</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat-item">
            <span className="landing-stat-value">&lt; {handoverSpeed}s</span>
            <span className="landing-stat-label">Handover State Lock</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════ LIVE DEMO SECTION ═══════════════════ */}
      <section className="landing-section" id="demo-section" ref={demoRef}>
        <div className={`landing-section-inner ${demoInView ? 'landing-animate-in' : 'landing-animate-hidden'}`}>
          {/* Section Header */}
          <div className="landing-section-header">
            <div className="landing-section-badge">
              <Layers className="w-3.5 h-3.5" />
              <span>CONTINUITY PIPELINE</span>
            </div>
            <h2 className="landing-section-title">How Versioned Handover Works</h2>
            <p className="landing-section-desc">
              When a student team discontinues at partial completion, ProjectNexus
              captures the full project state into an immutable version packet — and
              the next team inherits everything seamlessly.
            </p>
          </div>

          {/* Visual Flow Diagram */}
          <div className="landing-demo-flow">
            {/* Step 1 */}
            <div className="landing-demo-card landing-demo-card-red">
              <div className="landing-demo-card-header">
                <span className="landing-demo-badge landing-demo-badge-red">v1.0 DISCONTINUED</span>
                <span className="landing-demo-pct">45%</span>
              </div>
              <h4 className="landing-demo-card-title">Team Alpha</h4>
              <p className="landing-demo-card-desc">
                Semester ended midway. 3 modules completed, 2 modules pending. SRS & GitHub state locked.
              </p>
              <div className="landing-demo-progress">
                <div className="landing-demo-progress-fill" style={{ width: '45%', background: '#ef4444' }} />
              </div>
              <div className="landing-demo-meta">
                <FileCheck className="w-3.5 h-3.5" />
                <span>SRS Snapshot Sealed</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="landing-demo-arrow">
              <div className="landing-demo-arrow-line" />
              <div className="landing-demo-arrow-icon">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="landing-demo-arrow-line" />
            </div>

            {/* Step 2: Engine */}
            <div className="landing-demo-card landing-demo-card-purple">
              <div className="landing-demo-card-header">
                <span className="landing-demo-badge landing-demo-badge-purple">CONTINUITY ENGINE</span>
              </div>
              <h4 className="landing-demo-card-title">Automated Transfer</h4>
              <p className="landing-demo-card-desc">
                GitHub branches, Kanban task states, milestone history & faculty notes — all preserved.
              </p>
              <button
                onClick={onOpenHandoverDemo}
                className="landing-demo-trigger-btn"
              >
                <GitFork className="w-4 h-4" />
                <span>Trigger Handover Demo</span>
              </button>
            </div>

            {/* Arrow */}
            <div className="landing-demo-arrow">
              <div className="landing-demo-arrow-line" />
              <div className="landing-demo-arrow-icon">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div className="landing-demo-arrow-line" />
            </div>

            {/* Step 3 */}
            <div className="landing-demo-card landing-demo-card-green">
              <div className="landing-demo-card-header">
                <span className="landing-demo-badge landing-demo-badge-green">v2.0 ACTIVE</span>
                <span className="landing-demo-pct landing-demo-pct-green">78%</span>
              </div>
              <h4 className="landing-demo-card-title">Team Gamma</h4>
              <p className="landing-demo-card-desc">
                Resumed from 45% mark without ground-zero rework. Zero knowledge fragmentation.
              </p>
              <div className="landing-demo-progress">
                <div className="landing-demo-progress-fill" style={{ width: '78%', background: '#10b981' }} />
              </div>
              <div className="landing-demo-meta landing-demo-meta-green">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Seamless Continuation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ ROLE PORTALS ═══════════════════ */}
      <section className="landing-section landing-section-alt" id="roles-section" ref={rolesRef}>
        <div className={`landing-section-inner ${rolesInView ? 'landing-animate-in' : 'landing-animate-hidden'}`}>
          <div className="landing-section-header">
            <div className="landing-section-badge landing-section-badge-indigo">
              <Lock className="w-3.5 h-3.5" />
              <span>ROLE-BASED ACCESS CONTROL</span>
            </div>
            <h2 className="landing-section-title">Secure Role Portals</h2>
            <p className="landing-section-desc">
              Six isolated dashboards with JWT-verified token security. Each role sees
              exactly what they need — nothing more, nothing less.
            </p>
          </div>

          <div className="landing-roles-grid">
            {roles.map((role, idx) => (
              <div
                key={role.id}
                className="landing-role-card"
                onClick={role.action}
                style={{
                  '--accent': role.accent,
                  animationDelay: `${idx * 80}ms`
                }}
              >
                <div className="landing-role-accent-bar" style={{ background: role.accent }} />
                <div className="landing-role-card-body">
                  <div className="landing-role-icon" style={{ color: role.accent, background: `${role.accent}12` }}>
                    {role.icon}
                  </div>
                  <div className="landing-role-info">
                    <h3 className="landing-role-label">{role.label}</h3>
                    <p className="landing-role-desc">{role.desc}</p>
                  </div>
                  <div className="landing-role-arrow">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ARCHITECTURE PILLARS ═══════════════════ */}
      <section className="landing-section" id="architecture-section" ref={archRef}>
        <div className={`landing-section-inner ${archInView ? 'landing-animate-in' : 'landing-animate-hidden'}`}>
          <div className="landing-section-header">
            <div className="landing-section-badge landing-section-badge-purple">
              <Cpu className="w-3.5 h-3.5" />
              <span>CORE PLATFORM CAPABILITIES</span>
            </div>
            <h2 className="landing-section-title">Engineered for University Excellence</h2>
            <p className="landing-section-desc">
              Three pillars designed to safeguard student innovations and streamline
              institutional governance across academic generations.
            </p>
          </div>

          <div className="landing-arch-grid">
            {architecturePillars.map((pillar) => (
              <div
                key={pillar.id}
                className="landing-arch-card"
                onClick={pillar.onClick}
              >
                <div className={`landing-arch-icon bg-gradient-to-br ${pillar.gradient}`}>
                  {pillar.icon}
                </div>
                <span className="landing-arch-tag">{pillar.tag}</span>
                <h3 className="landing-arch-title">{pillar.title}</h3>
                <p className="landing-arch-subtitle">{pillar.subtitle}</p>
                <p className="landing-arch-desc">{pillar.desc}</p>
                <div className="landing-arch-action">
                  <span>Explore</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA BANNER ═══════════════════ */}
      <section className="landing-cta-banner">
        <div className="landing-cta-banner-inner">
          <h2 className="landing-cta-title">Ready to Eliminate Knowledge Fragmentation?</h2>
          <p className="landing-cta-desc">
            Experience the full Continuity Pipeline — from project creation to versioned handover.
          </p>
          <div className="landing-cta-btns">
            <button onClick={onEnterWorkspace} className="landing-btn-primary landing-btn-white">
              <Zap className="w-4 h-4" />
              <span>Login to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={onEnterAdmin} className="landing-btn-outline-white">
              <BarChart3 className="w-4 h-4" />
              <span>Explore Admin Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-footer-logo">
              <ProjectNexusLogo className="w-4 h-4 text-indigo-500" />
              <span>PROJECTNEXUS</span>
            </div>
            <p className="landing-footer-tagline">
              Academic Project Lifecycle & Versioned Continuity OS.
              Built for university research continuity.
            </p>
          </div>

          <div className="landing-footer-links">
            <div className="landing-footer-col">
              <span className="landing-footer-col-title">Platform</span>
              <button onClick={() => handleScrollToSection('demo-section')}>How It Works</button>
              <button onClick={() => handleScrollToSection('architecture-section')}>Architecture</button>
              <button onClick={() => handleScrollToSection('roles-section')}>Role Portals</button>
            </div>
            <div className="landing-footer-col">
              <span className="landing-footer-col-title">Access</span>
              <button onClick={onEnterAdmin}>Admin Dashboard</button>
              <button onClick={onEnterWorkspace}>Team Workspace</button>
              <button onClick={onOpenHandoverDemo}>Handover Demo</button>
            </div>
            <div className="landing-footer-col">
              <span className="landing-footer-col-title">Resources</span>
              <button onClick={() => setActiveModal('help')}>User Guide</button>
              <button onClick={() => setActiveModal('about')}>About</button>
              <button onClick={() => setActiveModal('privacy')}>Privacy & Policy</button>
            </div>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>© 2024–2026 ProjectNexus. Institutional Continuity System.</span>
          <div className="landing-footer-bottom-links">
            <button onClick={() => setActiveModal('privacy')}>Privacy</button>
            <span>·</span>
            <button onClick={() => setActiveModal('support')}>Support</button>
          </div>
        </div>
      </footer>

      {/* ═══════════════════ MODALS ═══════════════════ */}
      {activeModal && (
        <div className="landing-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="landing-modal" onClick={(e) => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => setActiveModal(null)}>
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'help' && (
              <div className="landing-modal-content">
                <div className="landing-modal-icon-wrap" style={{ background: '#eef2ff' }}>
                  <HelpCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <h3>ProjectNexus Institutional Guide</h3>
                <div className="landing-modal-items">
                  <div className="landing-modal-item">
                    <strong>1. Versioned Handover Protocol</strong>
                    <p>When student project groups discontinue midway, ProjectNexus immutably seals their work into version packets (v1.0), enabling successor teams to inherit at exact completion percentages (v2.0).</p>
                  </div>
                  <div className="landing-modal-item">
                    <strong>2. Role-Based Token Security</strong>
                    <p>Each role operates with JWT-verified isolated permissions enforced via backend middleware and MongoDB document-level access control.</p>
                  </div>
                  <div className="landing-modal-item">
                    <strong>3. Automated Risk Watchdog</strong>
                    <p>Projects without task movements or updates for ≥ 7 days trigger automatic stagnation warnings to prevent last-minute emergencies.</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="landing-modal-btn">Understood</button>
              </div>
            )}

            {activeModal === 'architecture_info' && (
              <div className="landing-modal-content">
                <div className="landing-modal-icon-wrap" style={{ background: '#fff1f2' }}>
                  <Activity className="w-6 h-6 text-rose-600" />
                </div>
                <h3>Health Engine & Risk Architecture</h3>
                <p className="landing-modal-body">
                  Rule-based risk detection continuously scans all active repository links, Kanban task updates, and milestone deadlines. Inactivity exceeding 7 days triggers escalating notifications across the institutional chain of custody.
                </p>
                <button onClick={() => setActiveModal(null)} className="landing-modal-btn">Close</button>
              </div>
            )}

            {activeModal === 'archive_info' && (
              <div className="landing-modal-content">
                <div className="landing-modal-icon-wrap" style={{ background: '#ecfdf5' }}>
                  <Archive className="w-6 h-6 text-emerald-600" />
                </div>
                <h3>Institutional Knowledge Archive</h3>
                <p className="landing-modal-body">
                  Searchable academic project registry indexing technical architecture documents, design specifications, and codebases to enable progressive student research across academic years.
                </p>
                <button onClick={() => setActiveModal(null)} className="landing-modal-btn">Close</button>
              </div>
            )}

            {activeModal === 'about' && (
              <div className="landing-modal-content">
                <div className="landing-modal-icon-wrap" style={{ background: '#eef2ff' }}>
                  <ProjectNexusLogo className="w-6 h-6 text-indigo-600" />
                </div>
                <h3>About PROJECTNEXUS</h3>
                <p className="landing-modal-body">
                  PROJECTNEXUS is an enterprise-grade academic lifecycle operating system built to eliminate knowledge fragmentation and ground-zero restarts across university project tracks. Built with the MERN stack.
                </p>
                <button onClick={() => setActiveModal(null)} className="landing-modal-btn">Close</button>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div className="landing-modal-content">
                <div className="landing-modal-icon-wrap" style={{ background: '#f0fdf4' }}>
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <h3>Privacy & Governance Policy</h3>
                <p className="landing-modal-body">
                  All institutional project data, repository links, evaluation rubrics, and student records are governed by JWT-verified role-based access control and department-level endpoint guards enforced at the Express middleware layer.
                </p>
                <button onClick={() => setActiveModal(null)} className="landing-modal-btn">Close</button>
              </div>
            )}

            {activeModal === 'support' && (
              <div className="landing-modal-content">
                <div className="landing-modal-icon-wrap" style={{ background: '#eff6ff' }}>
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3>Institutional Support</h3>
                <p className="landing-modal-body">
                  For technical assistance, token resets, or departmental onboarding, contact your University IT Administrator or email <strong className="text-indigo-600">support@projectnexus.edu</strong>.
                </p>
                <button onClick={() => setActiveModal(null)} className="landing-modal-btn">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
