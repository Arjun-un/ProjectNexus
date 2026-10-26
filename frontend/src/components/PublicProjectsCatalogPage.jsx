import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  Wrench,
  Code2,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  X,
  GraduationCap,
  FolderGit2
} from 'lucide-react';
import { initialProjects } from '../data/mockData';
import './PublicProjectsCatalogPage.css';

/* ── ProjectNexus Brand Logo ── */
function ProjectNexusLogo({ className = "w-5 h-5 text-white" }) {
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

// Helper to determine specific badge styling for common frameworks & tools
function getTechBadgeClass(tech) {
  const t = (tech || '').toLowerCase();
  if (t.includes('react')) return 'tag-react';
  if (t.includes('python')) return 'tag-python';
  if (t.includes('node')) return 'tag-node';
  if (t.includes('postgres')) return 'tag-postgres';
  if (t.includes('mongo')) return 'tag-mongodb';
  if (t.includes('pytorch')) return 'tag-pytorch';
  if (t.includes('tensor')) return 'tag-tensorflow';
  return '';
}

export default function PublicProjectsCatalogPage({
  onBack,
  onEnterAdmin,
  onEnterWorkspace
}) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'COMPLETED' | 'PENDING'
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTech, setSelectedTech] = useState('');

  // 1. Fetch live projects from backend with fallback
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/projects?limit=100');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.projects) && json.data.projects.length > 0) {
            if (isMounted) {
              setProjects(json.data.projects);
              setIsLoading(false);
              return;
            }
          }
        }
        // Fallback to initialProjects mock data if DB empty or unavailable
        if (isMounted) {
          setProjects(initialProjects || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Backend fetch failed, utilizing institutional project repository fallback:', err);
        if (isMounted) {
          setProjects(initialProjects || []);
          setIsLoading(false);
        }
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Extract unique academic years dynamically
  const academicYears = useMemo(() => {
    const years = new Set();
    projects.forEach(p => {
      if (p.academicYear && typeof p.academicYear === 'string') {
        years.add(p.academicYear.trim());
      }
    });
    // Ensure default years are available
    years.add('2025-2026');
    years.add('2026-2027');
    return Array.from(years).sort().reverse();
  }, [projects]);

  // 3. Extract unique categories dynamically
  const categories = useMemo(() => {
    const cats = new Set();
    projects.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projects]);

  // 4. Extract most popular frameworks and tools
  const popularTech = useMemo(() => {
    const countMap = {};
    projects.forEach(p => {
      const stack = Array.isArray(p.techStack)
        ? p.techStack
        : (typeof p.techStack === 'string' ? p.techStack.split(',').map(s => s.trim()) : []);
      stack.forEach(tech => {
        if (!tech) return;
        const normalized = tech.trim();
        countMap[normalized] = (countMap[normalized] || 0) + 1;
      });
    });
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tech]) => tech);
  }, [projects]);

  // 5. Categorize Completed vs Pending
  const isCompletedProject = (proj) => {
    const st = (proj.status || '').toLowerCase();
    return st === 'completed' || proj.progress === 100 || proj.currentProgress === 100;
  };

  // 6. Metrics Calculation
  const totalCount = projects.length;
  const completedCount = useMemo(() => projects.filter(p => isCompletedProject(p)).length, [projects]);
  const pendingCount = totalCount - completedCount;

  // 7. Filter & Search Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const isCompleted = isCompletedProject(project);

      // Status Filter
      if (statusFilter === 'COMPLETED' && !isCompleted) return false;
      if (statusFilter === 'PENDING' && isCompleted) return false;

      // Academic Year Filter
      if (selectedYear !== 'ALL') {
        const pYear = (project.academicYear || '').trim();
        if (pYear !== selectedYear) return false;
      }

      // Category Filter
      if (selectedCategory !== 'ALL') {
        if (project.category !== selectedCategory) return false;
      }

      // Tech Chip Filter
      const techList = Array.isArray(project.techStack)
        ? project.techStack
        : (typeof project.techStack === 'string' ? project.techStack.split(',').map(s => s.trim()) : []);

      if (selectedTech) {
        const hasTech = techList.some(t => t.toLowerCase() === selectedTech.toLowerCase());
        if (!hasTech) return false;
      }

      // Live Search Query (searches title, description, tech stack, department)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = (project.title || '').toLowerCase().includes(query);
        const descMatch = (project.description || project.problemStatement || '').toLowerCase().includes(query);
        const deptMatch = (project.department || '').toLowerCase().includes(query);
        const idMatch = (project.projectId || project.id || '').toLowerCase().includes(query);
        const techMatch = techList.some(t => t.toLowerCase().includes(query));

        if (!titleMatch && !descMatch && !deptMatch && !idMatch && !techMatch) {
          return false;
        }
      }

      return true;
    });
  }, [projects, statusFilter, selectedYear, selectedCategory, selectedTech, searchQuery]);

  // Handle Copy Project ID
  const handleCopyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSelectedYear('ALL');
    setSelectedCategory('ALL');
    setSelectedTech('');
  };

  return (
    <div className="pn-catalog-page">
      {/* ═══════════════════ TOP NAVIGATION BAR ═══════════════════ */}
      <header className="pn-catalog-navbar">
        <div className="pn-catalog-brand" onClick={onBack}>
          <div className="pn-catalog-logo-badge">
            <ProjectNexusLogo className="w-5 h-5 text-white" />
          </div>
          <div className="pn-catalog-brand-title">
            ProjectNexus
            <span className="pn-catalog-brand-badge">Directory</span>
          </div>
        </div>

        <div className="pn-catalog-nav-actions">
          <button onClick={onBack} className="pn-catalog-btn-back">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          {onEnterWorkspace && (
            <button onClick={onEnterWorkspace} className="pn-catalog-btn-ghost">
              Workspace Login
            </button>
          )}

          {onEnterAdmin && (
            <button onClick={onEnterAdmin} className="pn-catalog-btn-primary">
              Admin Portal
            </button>
          )}
        </div>
      </header>

      {/* ═══════════════════ HERO BANNER ═══════════════════ */}
      <section className="pn-catalog-hero">
        <div className="pn-catalog-hero-inner">
          <div className="pn-catalog-eyebrow">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Institutional Engineering Archive • All Departments</span>
          </div>

          <h1 className="pn-catalog-hero-title">
            Explore University <span>Projects & Tech Stacks</span>
          </h1>

          <p className="pn-catalog-hero-desc">
            Discover existing engineering initiatives, software architectures, and hardware blueprints across all administrators.
            Inspect the project statuses, academic years, and the exact frameworks & tools adopted by previous and active cohorts.
          </p>

          {/* Stats Metrics Ribbon */}
          <div className="pn-catalog-stats-ribbon">
            <div className="pn-catalog-stat-card">
              <div className="pn-catalog-stat-icon-wrap blue">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div className="pn-catalog-stat-meta">
                <span className="pn-catalog-stat-value">{totalCount}</span>
                <span className="pn-catalog-stat-label">Cataloged Projects</span>
              </div>
            </div>

            <div className="pn-catalog-stat-card">
              <div className="pn-catalog-stat-icon-wrap emerald">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="pn-catalog-stat-meta">
                <span className="pn-catalog-stat-value">{completedCount}</span>
                <span className="pn-catalog-stat-label">Completed Deliverables</span>
              </div>
            </div>

            <div className="pn-catalog-stat-card">
              <div className="pn-catalog-stat-icon-wrap amber">
                <Clock className="w-5 h-5" />
              </div>
              <div className="pn-catalog-stat-meta">
                <span className="pn-catalog-stat-value">{pendingCount}</span>
                <span className="pn-catalog-stat-label">Pending / In Progress</span>
              </div>
            </div>

            <div className="pn-catalog-stat-card">
              <div className="pn-catalog-stat-icon-wrap indigo">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="pn-catalog-stat-meta">
                <span className="pn-catalog-stat-value">{popularTech.length}+</span>
                <span className="pn-catalog-stat-label">Frameworks & Tools</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ MAIN CONTENT AREA ═══════════════════ */}
      <main className="pn-catalog-content">
        {/* ── Search & Filter Toolbar ── */}
        <section className="pn-catalog-toolbar">
          <div className="pn-catalog-search-row">
            {/* Live Search Input */}
            <div className="pn-catalog-search-input-wrap">
              <Search className="pn-catalog-search-icon w-4 h-4" />
              <input
                type="text"
                className="pn-catalog-search-input"
                placeholder="Search projects by title, framework, tool (e.g. React, Python), or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="pn-catalog-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="pn-catalog-filters-group">
              {/* Academic Year Selector */}
              <select
                className="pn-catalog-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                title="Filter by Academic Year"
              >
                <option value="ALL">All Academic Years</option>
                {academicYears.map(yr => (
                  <option key={yr} value={yr}>Year: {yr}</option>
                ))}
              </select>

              {/* Category Selector */}
              {categories.length > 0 && (
                <select
                  className="pn-catalog-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  title="Filter by Category"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="pn-catalog-status-tabs">
            <button
              className={`pn-catalog-status-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              <span>All Projects</span>
              <span className="pn-catalog-tab-count">{totalCount}</span>
            </button>

            <button
              className={`pn-catalog-status-tab ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('COMPLETED')}
            >
              <span className="status-dot dot-completed" />
              <span>Completed</span>
              <span className="pn-catalog-tab-count">{completedCount}</span>
            </button>

            <button
              className={`pn-catalog-status-tab ${statusFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              <span className="status-dot dot-pending" />
              <span>Pending / In Progress</span>
              <span className="pn-catalog-tab-count">{pendingCount}</span>
            </button>

            {(searchQuery || statusFilter !== 'ALL' || selectedYear !== 'ALL' || selectedCategory !== 'ALL' || selectedTech) && (
              <button onClick={handleResetFilters} className="pn-catalog-reset-btn">
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>

          {/* Popular Tech Stacks Quick Chips */}
          {popularTech.length > 0 && (
            <div className="pn-catalog-tech-ribbon">
              <span className="pn-catalog-tech-ribbon-label">
                <Wrench className="w-3.5 h-3.5" />
                Filter by Tool:
              </span>
              {popularTech.map(tech => (
                <button
                  key={tech}
                  className={`pn-catalog-tech-chip ${selectedTech.toLowerCase() === tech.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setSelectedTech(selectedTech.toLowerCase() === tech.toLowerCase() ? '' : tech)}
                >
                  <span>{tech}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Results Count Summary ── */}
        <div className="pn-catalog-results-meta">
          <span>
            Showing <strong className="pn-catalog-results-count">{filteredProjects.length}</strong> of {totalCount} projects listed
          </span>
          {selectedTech && (
            <span>Filtered by Tool: <strong>{selectedTech}</strong></span>
          )}
        </div>

        {/* ── Stacked Project Cards ("One Below Another") ── */}
        {isLoading ? (
          <div className="pn-catalog-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="pn-catalog-skeleton">
                <div className="pn-skeleton-line" style={{ height: 24, width: '40%' }} />
                <div className="pn-skeleton-line" style={{ height: 16, width: '25%' }} />
                <div className="pn-skeleton-line" style={{ height: 48, width: '90%' }} />
                <div className="pn-skeleton-line" style={{ height: 28, width: '60%' }} />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="pn-catalog-empty">
            <div className="pn-catalog-empty-icon">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="pn-catalog-empty-title">No matching projects found</h3>
            <p className="pn-catalog-empty-desc">
              We couldn't find any projects matching your current search or filter criteria. Try adjusting the keywords or clear active filters.
            </p>
            <button onClick={handleResetFilters} className="pn-catalog-btn-primary" style={{ marginTop: 8 }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="pn-catalog-list">
            {filteredProjects.map((project) => {
              const completed = isCompletedProject(project);
              const projId = project.projectId || project.id || 'NEXUS-PROJ';
              const progressVal = project.progress !== undefined ? project.progress : (project.currentProgress || (completed ? 100 : 50));
              
              // Process tech stack array
              const techList = Array.isArray(project.techStack) && project.techStack.length > 0
                ? project.techStack
                : (typeof project.techStack === 'string' && project.techStack.trim()
                    ? project.techStack.split(',').map(s => s.trim())
                    : ['React', 'Node.js', 'Python', 'PostgreSQL']); // Standard fallback

              // Short description with fallback
              const shortDescription = (project.description && project.description.trim()) ||
                (project.problemStatement && project.problemStatement.trim()) ||
                `Academic engineering initiative under ${project.department || 'Computer Science & Engineering'}. System architecture, functional modules, and deliverables actively tracked on ProjectNexus.`;

              return (
                <article
                  key={project._id || project.id || projId}
                  className={`pn-catalog-card ${completed ? 'card-completed' : 'card-pending'}`}
                >
                  {/* Card Header: Title, ID & Status Badge */}
                  <div className="pn-catalog-card-header">
                    <div className="pn-catalog-card-title-group">
                      <div className="pn-catalog-card-id-row">
                        <span className="pn-catalog-id-badge">{projId}</span>
                        {project.category && (
                          <span className="pn-catalog-category-badge">{project.category}</span>
                        )}
                      </div>

                      <h2 className="pn-catalog-card-title">{project.title}</h2>
                    </div>

                    {/* Status Badge: Completed vs Pending / In Progress */}
                    {completed ? (
                      <span className="pn-catalog-status-badge status-completed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="pn-catalog-status-badge status-pending">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Pending ({progressVal}% Done)</span>
                      </span>
                    )}
                  </div>

                  {/* Card Metadata Row: Academic Year, Department & Faculty Guide */}
                  <div className="pn-catalog-card-meta-row">
                    <div className="pn-catalog-meta-item pn-catalog-meta-year">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Academic Year: <strong>{project.academicYear || '2025-2026'}</strong></span>
                    </div>

                    {project.department && (
                      <div className="pn-catalog-meta-item">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{project.department}</span>
                      </div>
                    )}

                    {project.facultyGuide && (
                      <div className="pn-catalog-meta-item pn-catalog-faculty-tag">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                        <span>Guide: {project.facultyGuide}</span>
                      </div>
                    )}
                  </div>

                  {/* Short Description */}
                  <p className="pn-catalog-card-desc">{shortDescription}</p>

                  {/* Frameworks & Tools Section (Tech Stack) */}
                  <div className="pn-catalog-tech-section">
                    <div className="pn-catalog-tech-header">
                      <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Frameworks & Tools Used</span>
                    </div>

                    <div className="pn-catalog-tech-tags">
                      {techList.map((tech, idx) => {
                        const badgeStyleClass = getTechBadgeClass(tech);
                        return (
                          <span
                            key={idx}
                            className={`pn-catalog-tech-tag ${badgeStyleClass}`}
                            title={`Framework/Tool: ${tech}`}
                          >
                            <span className="status-dot" style={{ backgroundColor: '#6366F1' }} />
                            <span>{tech}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Footer: Progress Bar and Reference Copy */}
                  <div className="pn-catalog-card-footer">
                    <div className="pn-catalog-progress-group">
                      <span className="pn-catalog-progress-text">
                        {completed ? 'Deliverables Finalized' : 'Milestone Progress'}: {progressVal}%
                      </span>
                      <div className="pn-catalog-progress-bar-bg">
                        <div
                          className="pn-catalog-progress-bar-fill"
                          style={{ width: `${Math.min(100, Math.max(5, progressVal))}%` }}
                        />
                      </div>
                    </div>

                    <div className="pn-catalog-footer-actions">
                      <button
                        onClick={() => handleCopyId(projId)}
                        className="pn-catalog-copy-btn"
                        title="Copy Project Reference ID"
                      >
                        {copiedId === projId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Ref ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
