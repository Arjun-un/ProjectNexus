import React from 'react';
import {
  Filter,
  Users,
  Copy,
  Check,
  Eye,
  Mail
} from 'lucide-react';

export default function ProjectListView({
  projects,
  filteredProjects,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  filterDepartment,
  setFilterDepartment,
  filterHealth,
  setFilterHealth,
  onSelectProject,
  onOpenSendInvite,
  copiedCode,
  onCopyCode,
  getCategoryBadge,
  getStatusBadge,
  getHealthBadge
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Master Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and audit all software, IoT, and hardware college projects.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{filteredProjects.length}</span> of {projects.length} projects
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 pr-2 border-r border-slate-200">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Categories</option>
          <option value="Software">💻 Software</option>
          <option value="IoT">📡 IoT</option>
          <option value="Hardware">⚙️ Hardware</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="At Risk">At Risk</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Department Filter */}
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Departments</option>
          <option value="Computer Science & Engineering">Computer Science</option>
          <option value="Electronics & Communication">Electronics & Comm</option>
          <option value="Information Technology">Information Tech</option>
          <option value="Mechanical Engineering">Mechanical</option>
          <option value="Electrical & Electronics">Electrical</option>
        </select>

        {/* Health Filter */}
        <select
          value={filterHealth}
          onChange={(e) => setFilterHealth(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Healths</option>
          <option value="Good">🟢 Healthy</option>
          <option value="Moderate">🟡 Moderate</option>
          <option value="Critical">🔴 At Risk / Critical</option>
        </select>

        {(filterCategory !== 'All' || filterStatus !== 'All' || filterDepartment !== 'All' || filterHealth !== 'All' || searchQuery !== '') && (
          <button
            onClick={() => {
              setFilterCategory('All');
              setFilterStatus('All');
              setFilterDepartment('All');
              setFilterHealth('All');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Project ID</th>
                <th className="py-3.5 px-5">Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Health</th>
                <th className="py-3.5 px-4">Team Assigned</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProjects.map((p) => (
                <tr
                  key={p.projectId}
                  onClick={() => onSelectProject(p.projectId)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-800 text-xs whitespace-nowrap">
                    {p.projectId}
                  </td>
                  <td className="py-3.5 px-5 max-w-xs">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Guide: {p.facultyGuide}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getCategoryBadge(p.category)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {p.department}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(p.status)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getHealthBadge(p.health, p.healthScore)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {p.isAccessCodeClaimed && p.team?.name ? (
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{p.team.name}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[11px]">
                        <span>Unassigned ({p.teamAccessCode})</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {typeof p.deadline === 'string' ? p.deadline.slice(0, 10) : new Date(p.deadline).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => onCopyCode(p.teamAccessCode, e)}
                        title="Copy Team Access Code"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        {copiedCode === p.teamAccessCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenSendInvite(p); }}
                        title="Send Invitation Link via Email"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectProject(p.projectId); }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
