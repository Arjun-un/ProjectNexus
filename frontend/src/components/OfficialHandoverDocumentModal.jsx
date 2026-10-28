import React from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Cpu,
  GraduationCap,
  Calendar,
  Building2,
  ExternalLink,
  Lock,
  Sparkles,
  Download
} from 'lucide-react';

export default function OfficialHandoverDocumentModal({
  isOpen,
  onClose,
  project,
  handoverRecord
}) {
  if (!isOpen) return null;

  const p = project || {};
  const rec = handoverRecord || {};

  const packetId = rec.packetId || `HO-${p.projectId || 'CSE-2025-685'}-v${p.currentVersionNumber || 2}.0`;
  const projectTitle = p.title || rec.projectTitle || 'Capstone Engineering Project';
  const projectId = p.projectId || rec.projectId || 'CSE-2025-685';
  const department = p.department || 'Computer Science & Engineering';
  const academicYear = p.academicYear || '2025-2026';
  const fromVersion = rec.fromVersion || (p.currentVersionNumber ? p.currentVersionNumber - 1 : 1);
  const toVersion = rec.toVersion || (p.currentVersionNumber || 2);
  const fromTeamName = p.previousTeam?.name || rec.fromTeamName || 'Previous Student Team';
  const toTeamName = p.team?.name || rec.toTeamName || `Team NextGen (v${toVersion}.0)`;
  const progressBaseline = p.previousTeam?.discontinuedAt || rec.progressAtHandover || p.progress || 75;
  const reason = p.previousTeam?.reason || rec.discontinuationReason || 'Academic term conclusion & senior team internship migration';
  const facultyGuide = p.facultyGuide || 'Dr. Robert Chen (Distributed Systems & AI)';
  const facultyNotes = rec.facultyNotes || rec.facultyGuidanceNotes || (p.facultyGuide
    ? `Supervised by ${p.facultyGuide}. Inherit established baseline deliverables and consult departmental committee before altering core schemas.`
    : 'Inherit established baseline deliverables and consult departmental committee.');
  const gitUrl = rec.githubUrl || p.githubUrl || 'https://github.com/Arjun-un/ProjectNexus.git';
  const archiveBranch = rec.archiveBranch || `v${fromVersion}.0-handover-archive`;
  const pinnedCommitSha = rec.pinnedCommitSha || '5fb748c';
  const labBench = rec.hardwareNotes || p.labAssigned || 'Department Cloud Computing Lab';
  const accessCode = p.teamAccessCode || rec.newAccessCode || 'NEXUS-ODJP';

  const completed = Array.isArray(rec.completedModules) && rec.completedModules.length > 0
    ? rec.completedModules
    : [
        'Sprint 1 & 2 baseline specifications and architecture verified',
        'User authentication, database schema, and REST API foundation',
        `Milestone deliverables passed faculty review at ${progressBaseline}% progress`
      ];

  const pending = Array.isArray(rec.pendingModules) && rec.pendingModules.length > 0
    ? rec.pendingModules
    : [
        'Edge deployment and end-to-end production telemetry synchronization',
        'Automated test coverage, edge load benchmarking and resilience checks',
        'Final academic institutional presentation & documentation for department review'
      ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="pn-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="pn-print-container"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Action Controls (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} className="text-emerald-400" />
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em' }}>
              Official Institutional Continuity Dossier (PDF Export)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              type="button"
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              type="button"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Official Institutional Document Body ── */}
        <div
          id="official-handover-certificate"
          style={{
            padding: '36px 44px',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
            lineHeight: 1.5
          }}
        >
          {/* Document Header with Institutional Crest */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderBottom: '2px solid #0F172A',
              paddingBottom: '20px',
              marginBottom: '24px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#1E293B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '13px'
                  }}
                >
                  PN
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0F172A' }}>
                    ProjectNexus Institutional Governance Board
                  </span>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Division of Academic Capstone Continuity & Versioned Repository Governance
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE'
                }}
              >
                {packetId}
              </span>
              <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                Verified Institutional Transition Protocol
              </div>
            </div>
          </div>

          {/* Certificate Title */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: '#0F172A' }}>
              Academic Engineering Handover Certificate
            </h1>
            <p style={{ fontSize: '12.5px', color: '#475569', margin: '6px auto 0 auto', maxWidth: '640px' }}>
              Official university instrument certifying version transition from <strong>v{fromVersion}.0</strong> to <strong>v{toVersion}.0</strong>, deliverable baseline preservation, and successor cohort mandate.
            </p>
          </div>

          {/* Project & Cohort Identification Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              padding: '16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '12.5px'
            }}
          >
            <div>
              <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>Project Title & Identifier</span>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {projectTitle}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#2563EB', fontWeight: 700 }}>
                {projectId} · {department}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>Academic Term & Mentorship</span>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {facultyGuide}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                Academic Year: {academicYear}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#B91C1C' }}>Outgoing Cohort (Archived v{fromVersion}.0)</span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {fromTeamName}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                Discontinued at <strong>{progressBaseline}%</strong> completion baseline · Reason: {reason}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#15803D' }}>Successor Cohort (Active v{toVersion}.0)</span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {toTeamName}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                Provisioned Access Code: <strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>{accessCode}</strong>
              </div>
            </div>
          </div>

          {/* 2-Column Split: Preserved Deliverables vs Inherited Debt */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            
            {/* Preserved Deliverables */}
            <div style={{ border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px', backgroundColor: '#F0FDF4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#166534' }}>
                <CheckCircle2 size={16} />
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Verified Deliverables (Preserved v{fromVersion}.0)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completed.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#14532D' }}>
                    <span style={{ color: '#16A34A', fontWeight: 900 }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inherited Technical Debt */}
            <div style={{ border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px', backgroundColor: '#FFFBEB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#9A3412' }}>
                <AlertTriangle size={16} />
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Inherited Technical Debt (v{toVersion}.0 Scope)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pending.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#7C2D12' }}>
                    <span style={{ color: '#EA580C', fontWeight: 900 }}>⚠</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Repository & Physical Hardware Allocation Spec */}
          <div
            style={{
              padding: '16px',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              marginBottom: '24px',
              fontSize: '12px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '10px' }}>
              Codebase Repository & Hardware Laboratory Specifications
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <span style={{ color: '#64748B' }}>GitHub Repository URL:</span>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#2563EB', wordBreak: 'break-all' }}>
                  {gitUrl}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Frozen Archive Branch / Tag:</span>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0F172A' }}>
                  {archiveBranch} (SHA: {pinnedCommitSha})
                </div>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Allocated Lab Workstation:</span>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>
                  {labBench}
                </div>
              </div>
            </div>
          </div>

          {/* Faculty Directive & Verification Sign-Off */}
          <div
            style={{
              padding: '16px 20px',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              marginBottom: '24px'
            }}
          >
            <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#2563EB', letterSpacing: '0.05em' }}>
              Faculty Guide Handover Directive
            </span>
            <blockquote style={{ fontSize: '12.5px', fontStyle: 'italic', color: '#334155', margin: '6px 0 0 0' }}>
              "{facultyNotes}"
            </blockquote>
          </div>

          {/* Signatures & Formal Seal */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '16px',
              paddingTop: '20px',
              borderTop: '2px solid #E2E8F0',
              marginTop: '20px'
            }}
          >
            <div>
              <div style={{ height: '36px', borderBottom: '1px solid #94A3B8', marginBottom: '6px', display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>Signature on File</span>
              </div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#64748B' }}>Outgoing Team Representative</span>
            </div>

            <div>
              <div style={{ height: '36px', borderBottom: '1px solid #94A3B8', marginBottom: '6px', display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#16A34A', fontWeight: 700 }}>VERIFIED SIGN-OFF</span>
              </div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#64748B' }}>Faculty Project Guide</span>
            </div>

            <div>
              <div style={{ height: '36px', borderBottom: '1px solid #94A3B8', marginBottom: '6px', display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#2563EB', fontWeight: 700 }}>INSTITUTIONAL CLEARANCE 1.3</span>
              </div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#64748B' }}>ProjectNexus Governance Controller</span>
            </div>
          </div>

        </div>

        {/* CSS for Clean Printing */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #official-handover-certificate, #official-handover-certificate * {
              visibility: visible;
            }
            #official-handover-certificate {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

