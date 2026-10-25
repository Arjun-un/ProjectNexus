const crypto = require('crypto');
const Project = require('../db/Project');
const RepositoryEvent = require('../db/RepositoryEvent');
const TeamDB = require('../db/TeamDB');
const { sendProjectInvitationEmail } = require('../services/emailService');
const { parseRepoUrl, validateAndBackfillRepo } = require('../services/githubService');
const { recalculateHealthScore } = require('../services/healthService');

// Helper to get department code
const getDepartmentCode = (dept) => {
  if (!dept) return 'GEN';
  const clean = dept.toLowerCase();
  if (clean.includes('computer') || clean.includes('cse')) return 'CSE';
  if (clean.includes('information') || clean.includes('it')) return 'IT';
  if (clean.includes('electronics') || clean.includes('ece')) return 'ECE';
  if (clean.includes('electrical') || clean.includes('eee')) return 'EEE';
  if (clean.includes('mechanical') || clean.includes('mech')) return 'MECH';
  if (clean.includes('civil')) return 'CIVIL';
  if (clean.includes('biotech') || clean.includes('biomed')) return 'BIO';
  if (clean.includes('robotics') || clean.includes('ai') || clean.includes('data')) return 'ADS';
  return dept.substring(0, 3).toUpperCase();
};

// Helper to generate unique Team Access Code: NEXUS-XXXX
const generateAccessCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NEXUS-${code}`;
};

// Helper to generate unique Project ID: DEPT-YEAR-XXX
const generateProjectId = async (department, academicYear) => {
  const deptCode = getDepartmentCode(department);
  const yearMatch = (academicYear || '').match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

  // Try up to 10 times to find unique ID
  for (let i = 0; i < 10; i++) {
    const randomNum = Math.floor(100 + Math.random() * 900); // 3 digits
    const candidateId = `${deptCode}-${year}-${randomNum}`;
    const exists = await Project.findOne({ projectId: candidateId });
    if (!exists) return candidateId;
  }
  return `${deptCode}-${year}-${Date.now().toString().slice(-3)}`;
};

/**
 * @route   GET /api/projects/kpis
 * @desc    Get dashboard metrics, critical projects, and recent activity
 * @access  Public / Admin
 */
exports.getProjectKPIs = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Active' });
    const softwareProjects = await Project.countDocuments({ category: 'Software' });
    const iotProjects = await Project.countDocuments({ category: 'IoT' });
    const hardwareProjects = await Project.countDocuments({ category: 'Hardware' });
    const atRiskProjects = await Project.countDocuments({
      $or: [
        { health: { $in: ['At Risk', 'Critical'] } },
        { status: 'At Risk' }
      ]
    });

    // Critical projects needing attention: sort by healthScore ascending (lowest first)
    const criticalProjects = await Project.find({
      $or: [
        { health: { $in: ['At Risk', 'Critical', 'Moderate'] } },
        { status: 'At Risk' }
      ]
    })
      .sort({ healthScore: 1, lastActivityDate: 1 })
      .limit(5)
      .select('projectId title category status health healthScore lastActivityDate progress department facultyGuide');

    // Aggregate recent timeline activities across projects
    const projectsWithTimeline = await Project.find({ 'timeline.0': { $exists: true } })
      .select('projectId title category timeline')
      .sort({ updatedAt: -1 })
      .limit(10);

    const activities = [];
    projectsWithTimeline.forEach((proj) => {
      if (proj.timeline && proj.timeline.length > 0) {
        proj.timeline.forEach((item) => {
          activities.push({
            id: item._id,
            projectId: proj.projectId,
            projectTitle: proj.title,
            category: proj.category,
            title: item.title,
            description: item.description,
            timestamp: item.timestamp,
            type: item.type
          });
        });
      }
    });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = activities.slice(0, 8);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalProjects,
          activeProjects,
          softwareProjects,
          iotProjects,
          hardwareProjects,
          atRiskProjects
        },
        criticalProjects,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project metrics',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/projects
 * @desc    Get filtered list of projects with pagination
 * @access  Public / Admin
 */
exports.getProjects = async (req, res) => {
  try {
    const {
      category,
      status,
      department,
      health,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (health && health !== 'All') {
      query.health = health;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { projectId: searchRegex },
        { department: searchRegex },
        { facultyGuide: searchRegex },
        { teamAccessCode: searchRegex },
        { 'team.name': searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects',
      error: error.message
    });
  }
};

// Safe project finder by MongoDB _id or custom projectId
const findProjectByIdOrCustomId = async (id) => {
  if (!id) return null;
  const cleanId = String(id).trim();
  if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
    const proj = await Project.findById(cleanId);
    if (proj) return proj;
  }
  return await Project.findOne({
    $or: [
      { projectId: cleanId.toUpperCase() },
      { projectId: cleanId }
    ]
  });
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project details by MongoDB ID or Project ID
 * @access  Public / Admin
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProjectByIdOrCustomId(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with identifier: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project details',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/projects
 * @desc    Create a new project and generate Project ID + Access Code
 * @access  Admin
 */
exports.createProject = async (req, res) => {
  try {
    const {
      category,
      title,
      department,
      academicYear = '2025-2026',
      facultyGuide,
      deadline,
      priority = 'Medium',
      description = '',
      techStack = [],
      componentsRequired = [],
      labAssigned = '',
      invitedLeadEmail = ''
    } = req.body;

    if (!category || !title || !department || !facultyGuide || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: category, title, department, facultyGuide, and deadline are mandatory'
      });
    }

    // Generate unique Project ID and Team Access Code
    const projectId = await generateProjectId(department, academicYear);
    let teamAccessCode = generateAccessCode();

    // Check collision for access code
    while (await Project.findOne({ teamAccessCode })) {
      teamAccessCode = generateAccessCode();
    }

    // Format techStack or components if sent as strings
    const formattedTechStack = Array.isArray(techStack)
      ? techStack
      : (typeof techStack === 'string' && techStack.trim() ? techStack.split(',').map(s => s.trim()) : []);

    const formattedComponents = Array.isArray(componentsRequired)
      ? componentsRequired
      : (typeof componentsRequired === 'string' && componentsRequired.trim() ? componentsRequired.split(',').map(s => s.trim()) : []);

    const initialTimeline = [{
      title: 'Project Created by Administration',
      description: `Project initialized under ${department} with Team Access Code ${teamAccessCode}`,
      timestamp: new Date(),
      type: 'creation'
    }];

    // If an invited email was provided, dispatch email and log to timeline
    const trimmedEmail = (invitedLeadEmail || '').trim().toLowerCase();
    let invitationSentAt = null;

    if (trimmedEmail) {
      invitationSentAt = new Date();
      initialTimeline.unshift({
        title: 'Project Invitation Dispatched via Email',
        description: `Access Code and workspace registration link dispatched to ${trimmedEmail}`,
        timestamp: new Date(),
        type: 'alert'
      });

      // Dispatch async email
      sendProjectInvitationEmail({
        toEmail: trimmedEmail,
        projectTitle: title.trim(),
        projectId,
        teamAccessCode,
        department: department.trim(),
        facultyGuide: facultyGuide.trim(),
        deadline: new Date(deadline)
      }).catch(err => console.error('Background email dispatch failed:', err.message));
    }

    const newProject = new Project({
      projectId,
      title: title.trim(),
      category,
      department: department.trim(),
      academicYear: academicYear.trim(),
      facultyGuide: facultyGuide.trim(),
      deadline: new Date(deadline),
      priority,
      description: description.trim(),
      techStack: formattedTechStack,
      componentsRequired: formattedComponents,
      labAssigned: labAssigned.trim(),
      teamAccessCode,
      isAccessCodeClaimed: false,
      accessCodeStatus: 'active',
      invitedLeadEmail: trimmedEmail,
      invitationSentAt,
      status: 'Active',
      health: 'Not Tracked',
      healthScore: 0,
      progress: 0,
      currentMilestone: 'Project Initiation & Setup',
      lastActivityDate: new Date(),
      timeline: initialTimeline,
      createdBy: req.user?._id
    });

    const savedProject = await newProject.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: savedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/projects/:id/regenerate-code
 * @desc    Regenerate Team Access Code for a project
 * @access  Admin
 */
exports.regenerateAccessCode = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProjectByIdOrCustomId(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    let newCode = generateAccessCode();
    while (await Project.findOne({ teamAccessCode: newCode })) {
      newCode = generateAccessCode();
    }

    project.teamAccessCode = newCode;
    project.accessCodeStatus = 'active';
    project.isAccessCodeClaimed = false;
    project.timeline.unshift({
      title: 'Team Access Code Regenerated',
      description: `New Access Code generated: ${newCode}`,
      timestamp: new Date(),
      type: 'alert'
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Team Access Code regenerated successfully',
      data: {
        projectId: project.projectId,
        teamAccessCode: newCode,
        accessCodeStatus: project.accessCodeStatus
      }
    });
  } catch (error) {
    console.error('Error regenerating access code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate access code',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/projects/:id/revoke-code
 * @desc    Revoke Team Access Code for a project
 * @access  Admin
 */
exports.revokeAccessCode = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProjectByIdOrCustomId(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.accessCodeStatus = 'revoked';
    project.timeline.unshift({
      title: 'Team Access Code Revoked',
      description: `Access Code ${project.teamAccessCode} has been deactivated by Admin`,
      timestamp: new Date(),
      type: 'alert'
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Team Access Code revoked successfully',
      data: {
        projectId: project.projectId,
        teamAccessCode: project.teamAccessCode,
        accessCodeStatus: project.accessCodeStatus
      }
    });
  } catch (error) {
    console.error('Error revoking access code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke access code',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/projects/:id/send-invite
 * @desc    Dispatch project invitation link & access code to Team Lead via email
 * @access  Admin
 */
exports.sendProjectInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      customNote,
      projectTitle,
      teamAccessCode,
      department,
      facultyGuide,
      deadline
    } = req.body;

    const project = await findProjectByIdOrCustomId(id);

    const recipientEmail = (email && email.trim()) || project?.invitedLeadEmail || project?.team?.leader?.email;
    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required. Please specify a valid email address.'
      });
    }

    const title = project?.title || projectTitle || 'Institutional Capstone Project';
    const projId = project?.projectId || id || 'PRJ-NEXUS';
    const accessCode = project?.teamAccessCode || teamAccessCode || 'NEXUS-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const dept = project?.department || department || 'Engineering';
    const guide = project?.facultyGuide || facultyGuide || 'Department Committee';
    const targetDeadline = project?.deadline || deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    // Send email
    const emailResult = await sendProjectInvitationEmail({
      toEmail: recipientEmail.trim(),
      projectTitle: title,
      projectId: projId,
      teamAccessCode: accessCode,
      department: dept,
      facultyGuide: guide,
      deadline: targetDeadline,
      customNote
    });

    if (project) {
      project.invitedLeadEmail = recipientEmail.trim().toLowerCase();
      project.invitationSentAt = new Date();
      project.timeline.unshift({
        title: 'Project Invitation Dispatched via Email',
        description: `Access Code and workspace registration link emailed to ${recipientEmail.trim()}`,
        timestamp: new Date(),
        type: 'alert'
      });
      await project.save();
    }

    res.status(200).json({
      success: true,
      message: `Invitation link successfully dispatched to ${recipientEmail.trim()}`,
      data: {
        projectId: projId,
        invitedLeadEmail: recipientEmail.trim().toLowerCase(),
        invitationSentAt: new Date(),
        teamAccessCode: accessCode,
        emailResult
      }
    });
  } catch (error) {
    console.error('Error sending project invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send project invitation',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/projects/test-email
 * @desc    Test SMTP email dispatch directly to any email address
 * @access  Public / Admin
 */
exports.sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required.'
      });
    }

    const emailResult = await sendProjectInvitationEmail({
      toEmail: email.trim(),
      projectTitle: 'ProjectNexus SMTP Live Verification Project',
      projectId: 'NEXUS-TEST-001',
      teamAccessCode: 'NEXUS-VERIFIED',
      department: 'Computer Science & Engineering',
      facultyGuide: 'Dr. System Administrator',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      customNote: 'This is a live test invitation dispatched via Gmail SMTP to verify end-to-end delivery.'
    });

    res.status(200).json({
      success: true,
      message: `Test email successfully dispatched to ${email.trim()}`,
      emailResult
    });
  } catch (error) {
    console.error('Error in sendTestEmail:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch test email'
    });
  }
};

/**
 * @route   GET /api/projects/teams/all
 * @desc    Get all registered student teams with their linked project details
 * @access  Public / Admin
 */
exports.getAllRegisteredTeams = async (req, res) => {
  try {
    // 1. Fetch all projects and team records in parallel
    const [projects, teamRecords] = await Promise.all([
      Project.find({}).lean(),
      TeamDB.find({}).lean()
    ]);

    // Map projects by projectId and string _id
    const projectMap = new Map();
    projects.forEach(p => {
      if (p.projectId) projectMap.set(p.projectId.toUpperCase(), p);
      if (p._id) projectMap.set(String(p._id), p);
    });

    const teamsList = [];
    const processedProjectIds = new Set();

    // 2. Process all records from TeamDB
    for (const t of teamRecords) {
      const proj = projectMap.get(t.projectId?.toUpperCase()) || (t.projectRef ? projectMap.get(String(t.projectRef)) : null) || {};
      if (t.projectId) processedProjectIds.add(t.projectId.toUpperCase());

      // Merge leader details (prefer TeamDB, fallback to project.team.leader)
      const leaderName = t.leader?.name || proj.team?.leader?.name || '';
      const leaderEmail = t.leader?.email || proj.team?.leader?.email || proj.invitedLeadEmail || '';
      const leaderRollNo = t.leader?.rollNo || proj.team?.leader?.rollNo || proj.team?.leader?.usn || '';
      const leaderRole = t.leader?.role || proj.team?.leader?.role || 'Team Lead';
      const leaderGithub = t.leader?.githubUsername || proj.team?.leader?.githubUsername || '';
      const leaderContrib = t.leader?.contribution || proj.team?.leader?.contribution || '';

      // Merge members (prefer TeamDB, fallback to project.team.members)
      const rawMembers = (t.members && t.members.length > 0) ? t.members : (proj.team?.members || []);
      const members = rawMembers.map(m => ({
        name: m.name || '',
        email: m.email || '',
        rollNo: m.rollNo || m.usn || '',
        role: m.role || 'Project Contributor',
        githubUsername: m.githubUsername || '',
        contribution: m.contribution || '',
        tasksAssigned: typeof m.tasksAssigned === 'number' ? m.tasksAssigned : 0
      }));

      const teamName = t.teamName || proj.team?.name || `${proj.title || 'Student'} Team`;
      const isClaimed = proj.isAccessCodeClaimed || (leaderName !== '' || members.length > 0);

      teamsList.push({
        _id: t._id,
        teamId: t._id,
        projectId: t.projectId || proj.projectId,
        projectObjectId: proj._id || t.projectRef,
        teamName,
        projectTitle: proj.title || 'Untitled Project',
        category: proj.category || 'Software',
        department: proj.department || 'General',
        academicYear: proj.academicYear || '2025-2026',
        facultyGuide: proj.facultyGuide || 'Not assigned',
        progress: proj.progress || 0,
        health: proj.health || 'Not Tracked',
        healthScore: proj.healthScore || 0,
        status: proj.status || 'Active',
        teamAccessCode: proj.teamAccessCode || '',
        isAccessCodeClaimed: isClaimed,
        leader: {
          name: leaderName,
          email: leaderEmail,
          rollNo: leaderRollNo,
          role: leaderRole,
          githubUsername: leaderGithub,
          contribution: leaderContrib
        },
        members,
        memberCount: members.length + (leaderName ? 1 : 0),
        githubRepoUrl: t.githubRepoUrl || proj.githubUrl || proj.githubIntegration?.repoUrl || '',
        gitBranch: t.gitBranch || 'main',
        webhookUrl: t.webhookUrl || '',
        studentSummary: t.studentSummary || proj.studentSummary || '',
        currentStatusNote: t.currentStatusNote || proj.currentStatusNote || '',
        lastUpdated: t.updatedAt || t.lastUpdated || proj.updatedAt
      });
    }

    // 3. Include any projects that have team details but no TeamDB entry yet
    for (const proj of projects) {
      if (proj.projectId && !processedProjectIds.has(proj.projectId.toUpperCase())) {
        if (proj.team?.name || proj.team?.leader?.name || proj.isAccessCodeClaimed) {
          processedProjectIds.add(proj.projectId.toUpperCase());

          const leaderName = proj.team?.leader?.name || '';
          const leaderEmail = proj.team?.leader?.email || proj.invitedLeadEmail || '';
          const members = (proj.team?.members || []).map(m => ({
            name: m.name || '',
            email: m.email || '',
            rollNo: m.rollNo || m.usn || '',
            role: m.role || 'Project Contributor',
            githubUsername: m.githubUsername || '',
            contribution: m.contribution || '',
            tasksAssigned: typeof m.tasksAssigned === 'number' ? m.tasksAssigned : 0
          }));

          teamsList.push({
            _id: proj._id,
            teamId: proj._id,
            projectId: proj.projectId,
            projectObjectId: proj._id,
            teamName: proj.team?.name || `${proj.title} Team`,
            projectTitle: proj.title,
            category: proj.category || 'Software',
            department: proj.department || 'General',
            academicYear: proj.academicYear || '2025-2026',
            facultyGuide: proj.facultyGuide || 'Not assigned',
            progress: proj.progress || 0,
            health: proj.health || 'Not Tracked',
            healthScore: proj.healthScore || 0,
            status: proj.status || 'Active',
            teamAccessCode: proj.teamAccessCode || '',
            isAccessCodeClaimed: proj.isAccessCodeClaimed || false,
            leader: {
              name: leaderName,
              email: leaderEmail,
              rollNo: proj.team?.leader?.rollNo || proj.team?.leader?.usn || '',
              role: proj.team?.leader?.role || 'Team Lead',
              githubUsername: proj.team?.leader?.githubUsername || '',
              contribution: proj.team?.leader?.contribution || ''
            },
            members,
            memberCount: members.length + (leaderName ? 1 : 0),
            githubRepoUrl: proj.githubUrl || proj.githubIntegration?.repoUrl || '',
            gitBranch: 'main',
            webhookUrl: `http://localhost:5000/api/webhooks/repo/${proj.projectId}`,
            studentSummary: proj.studentSummary || '',
            currentStatusNote: proj.currentStatusNote || '',
            lastUpdated: proj.updatedAt
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      count: teamsList.length,
      data: teamsList
    });
  } catch (error) {
    console.error('Error fetching registered teams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve registered teams',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/projects/:id/team
 * @desc    Get team directory and repository details from teamdb
 * @access  Public / Workspace
 */
exports.getProjectTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProjectByIdOrCustomId(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    let teamRecord = await TeamDB.findOne({ projectId: project.projectId });

    if (!teamRecord) {
      // Create initial teamdb record from actual project state (empty if not yet configured)
      teamRecord = await TeamDB.create({
        projectId: project.projectId,
        projectRef: project._id,
        teamName: project.team?.name || `${project.title} Team`,
        leader: {
          name: project.team?.leader?.name || '',
          email: project.team?.leader?.email || project.invitedLeadEmail || '',
          rollNo: project.team?.leader?.rollNo || '',
          role: project.team?.leader?.role || 'Team Lead',
          githubUsername: project.team?.leader?.githubUsername || ''
        },
        members: project.team?.members && project.team.members.length > 0 ? project.team.members : [],
        githubRepoUrl: project.githubUrl || '',
        gitBranch: 'main',
        webhookUrl: `http://localhost:5000/api/webhooks/repo/${project.projectId}`
      });
    }

    res.status(200).json({
      success: true,
      data: teamRecord
    });
  } catch (error) {
    console.error('Error fetching teamdb record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve team details from teamdb',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/projects/:id/team
 * @desc    Update project team details and sync with teamdb collection
 * @access  Public / Team Lead
 */
exports.updateProjectTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, leader, members, githubUrl, gitBranch, branch, webhookUrl } = req.body;

    const project = await findProjectByIdOrCustomId(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update team name if provided
    if (teamName !== undefined) {
      if (!project.team) project.team = {};
      project.team.name = teamName.trim();
    }

    // Update leader if provided
    if (leader) {
      if (!project.team) project.team = {};
      project.team.leader = {
        name: leader.name ? leader.name.trim() : (project.team?.leader?.name || ''),
        email: leader.email ? leader.email.trim().toLowerCase() : (project.team?.leader?.email || project.invitedLeadEmail || ''),
        rollNo: leader.rollNo ? leader.rollNo.trim() : (project.team?.leader?.rollNo || ''),
        role: leader.role ? leader.role.trim() : 'Team Lead',
        githubUsername: leader.githubUsername ? leader.githubUsername.trim() : (project.team?.leader?.githubUsername || ''),
        contribution: leader.contribution !== undefined ? leader.contribution.trim() : (project.team?.leader?.contribution || '')
      };
      if (leader.email) {
        project.invitedLeadEmail = leader.email.trim().toLowerCase();
      }
    }

    // Update members if provided
    if (Array.isArray(members)) {
      if (!project.team) project.team = {};
      project.team.members = members.map(m => ({
        name: (m.name || '').trim(),
        email: (m.email || '').trim().toLowerCase(),
        rollNo: (m.rollNo || '').trim(),
        role: (m.role || 'Project Contributor').trim(),
        githubUsername: (m.githubUsername || '').trim(),
        contribution: (m.contribution || '').trim(),
        tasksAssigned: typeof m.tasksAssigned === 'number' ? m.tasksAssigned : 0
      }));
    }

    // Update studentSummary & currentStatusNote if provided
    const { studentSummary, currentStatusNote } = req.body;
    if (studentSummary !== undefined) {
      project.studentSummary = studentSummary.trim();
      project.summaryLastUpdatedAt = new Date();
    }
    if (currentStatusNote !== undefined) {
      project.currentStatusNote = currentStatusNote.trim();
    }

    // Update githubUrl if provided
    if (githubUrl !== undefined) {
      project.githubUrl = githubUrl.trim();
    }

    const activeBranch = (gitBranch || branch || 'main').trim();
    const activeWebhookUrl = (webhookUrl || '').trim();
    const activeRepoUrl = (githubUrl !== undefined ? githubUrl : (project.githubUrl || '')).trim();

    // Upsert into teamdb collection
    const teamDbRecord = await TeamDB.findOneAndUpdate(
      { projectId: project.projectId },
      {
        projectId: project.projectId,
        projectRef: project._id,
        teamName: project.team?.name || teamName || 'Alpha Visionary Labs',
        leader: project.team.leader,
        members: project.team.members,
        studentSummary: project.studentSummary || '',
        currentStatusNote: project.currentStatusNote || '',
        githubRepoUrl: activeRepoUrl,
        gitBranch: activeBranch,
        webhookUrl: activeWebhookUrl,
        lastUpdated: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Add timeline entry
    project.timeline.unshift({
      title: 'Team Directory & Repository Updated in teamdb',
      description: `Team roster updated (${(project.team?.members?.length || 0) + 1} members). ${project.githubUrl ? `Repository: ${project.githubUrl}` : ''}`,
      timestamp: new Date(),
      type: 'status_change'
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Team details, repository link and webhook URL saved to teamdb successfully',
      data: project,
      teamdb: teamDbRecord
    });
  } catch (error) {
    console.error('Error updating project team in teamdb:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team details in teamdb',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/projects/:id/status
 * @desc    Update project status (e.g. Completed, Active) and progress
 * @access  Public / Admin
 */
exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress } = req.body;

    const project = await findProjectByIdOrCustomId(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const previousStatus = project.status;
    if (status) {
      project.status = status;
    }

    if (progress !== undefined) {
      project.progress = Math.min(100, Math.max(0, Number(progress)));
    } else if (status === 'Completed') {
      project.progress = 100;
    }

    const isMarkedCompleted = status === 'Completed' || (project.status === 'Completed' && previousStatus !== 'Completed');

    project.timeline.unshift({
      title: isMarkedCompleted ? 'Project Marked as Completed' : `Project Status Changed to ${project.status}`,
      description: isMarkedCompleted
        ? 'Institutional Administrator approved project deliverables and marked status as Completed (100% progress).'
        : `Status transitioned from ${previousStatus} to ${project.status}.`,
      timestamp: new Date(),
      type: 'status_change'
    });

    await project.save();

    // Also update TeamDB if exists
    await TeamDB.findOneAndUpdate(
      { projectId: project.projectId },
      {
        currentStatusNote: isMarkedCompleted ? 'Project completed and approved by administrator' : `Status: ${project.status}`,
        lastUpdated: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `Project ${project.projectId} status updated to ${project.status}`,
      data: project
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project status',
      error: error.message
    });
  }
};

/**
 * @desc    Update student project summary, current status, and member contributions
 * @route   PUT /api/projects/:id/contributions
 * @access  Public (Student Team / Workspace)
 */
exports.updateStudentContributions = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentSummary,
      currentStatusNote,
      leaderContribution,
      members,
      memberContributions
    } = req.body;

    const cleanId = String(id).trim();
    let query;
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: cleanId };
    } else {
      query = {
        $or: [
          { projectId: cleanId.toUpperCase() },
          { projectId: cleanId }
        ]
      };
    }

    const project = await Project.findOne(query);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!project.team) {
      project.team = { name: '', leader: {}, members: [] };
    }

    // 1. Update Student Summary & Current Status
    if (studentSummary !== undefined) {
      project.studentSummary = studentSummary.trim();
    }
    if (currentStatusNote !== undefined) {
      project.currentStatusNote = currentStatusNote.trim();
    }
    project.summaryLastUpdatedAt = new Date();
    project.lastActivityDate = new Date();

    // 2. Update Leader Contribution
    if (leaderContribution !== undefined) {
      if (!project.team.leader) project.team.leader = {};
      project.team.leader.contribution = leaderContribution.trim();
    }

    // 3. Update Member Contributions
    if (Array.isArray(members)) {
      project.team.members = members.map((m, idx) => {
        const existing = (project.team.members && project.team.members[idx]) || {};
        return {
          name: (m.name || existing.name || '').trim(),
          email: (m.email || existing.email || '').trim().toLowerCase(),
          rollNo: (m.rollNo || existing.rollNo || '').trim(),
          role: (m.role || existing.role || 'Project Contributor').trim(),
          githubUsername: (m.githubUsername || existing.githubUsername || '').trim(),
          contribution: (m.contribution !== undefined ? m.contribution : (existing.contribution || '')).trim(),
          tasksAssigned: typeof m.tasksAssigned === 'number' ? m.tasksAssigned : (existing.tasksAssigned || 0)
        };
      });
    } else if (Array.isArray(memberContributions)) {
      memberContributions.forEach((mc, idx) => {
        let member = null;
        if (mc.email) {
          member = project.team.members.find(m => m.email?.toLowerCase() === mc.email.toLowerCase());
        } else if (mc.rollNo) {
          member = project.team.members.find(m => m.rollNo === mc.rollNo);
        } else if (typeof mc.index === 'number' && project.team.members[mc.index]) {
          member = project.team.members[mc.index];
        } else if (project.team.members[idx]) {
          member = project.team.members[idx];
        }
        if (member && mc.contribution !== undefined) {
          member.contribution = String(mc.contribution).trim();
        }
      });
    }

    // 4. Upsert/Update TeamDB for synchronized roster & contributions
    await TeamDB.findOneAndUpdate(
      { projectId: project.projectId },
      {
        projectId: project.projectId,
        projectRef: project._id,
        teamName: project.team?.name || 'Alpha Visionary Labs',
        leader: project.team.leader,
        members: project.team.members,
        studentSummary: project.studentSummary || '',
        currentStatusNote: project.currentStatusNote || '',
        lastUpdated: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 5. Add timeline event
    project.timeline.unshift({
      title: 'Project Brief & Contributions Updated',
      description: 'Student team submitted updated project summary, status note, and individual member contribution deliverables.',
      timestamp: new Date(),
      type: 'status_change'
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project summary, status note, and member contributions updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Error updating student contributions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student contributions',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/projects/:id/github/generate-webhook
 * @desc    Validate GitHub repo, backfill stats, generate per-project secret & unique webhook URL
 * @access  Private (Team Lead / Admin)
 */
exports.generateGithubWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const { repoUrl } = req.body;

    const cleanId = String(id).trim();
    let query;
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: cleanId };
    } else {
      query = {
        $or: [
          { projectId: cleanId.toUpperCase() },
          { projectId: cleanId }
        ]
      };
    }

    const project = await Project.findOne(query).select('+githubIntegration.webhookSecret');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const targetUrl = repoUrl || project.githubIntegration?.repoUrl || project.githubUrl;
    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        message: 'Repository URL is required (e.g. https://github.com/organization/repository)'
      });
    }

    // 1. Parse repository URL
    const parsed = parseRepoUrl(targetUrl);
    if (!parsed) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub repository URL format. Please use https://github.com/:owner/:repo'
      });
    }

    // 2. Validate repository exists and is accessible + backfill stats
    const validation = await validateAndBackfillRepo(parsed.owner, parsed.repo);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // 3. Generate cryptographically random 32-byte HMAC secret
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    // 4. Update project's githubIntegration
    project.githubUrl = parsed.cleanUrl;
    project.githubIntegration = {
      isConnected: true,
      repoUrl: parsed.cleanUrl,
      repoOwner: parsed.owner,
      repoName: parsed.repo,
      webhookSecret: webhookSecret,
      connectedAt: new Date(),
      lastEventAt: new Date(),
      lastCommitSha: validation.lastCommitSha || '',
      totalCommits: validation.totalCommits || 0,
      totalPullRequests: 0,
      contributors: validation.contributors || []
    };

    project.lastActivityDate = new Date();

    // 5. Add timeline record
    project.timeline.unshift({
      title: 'GitHub Repository Linked',
      description: `Linked to ${parsed.owner}/${parsed.repo}. Webhook telemetry tracking initialized.`,
      timestamp: new Date(),
      type: 'repo_activity'
    });

    await project.save();

    // 6. Recalculate health score with repository link factored in
    await recalculateHealthScore(project._id);

    // 7. Construct Webhook Payload URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const webhookUrl = `${protocol}://${host}/api/webhooks/github/${project.projectId || project._id}`;

    // Return the secret ONCE in this response only
    res.status(200).json({
      success: true,
      message: 'GitHub webhook and tracking credentials generated successfully',
      data: {
        projectId: project.projectId,
        repoUrl: parsed.cleanUrl,
        repoOwner: parsed.owner,
        repoName: parsed.repo,
        webhookUrl,
        webhookSecret, // ONE-TIME EXPOSURE: user must copy to GitHub settings
        totalCommits: project.githubIntegration.totalCommits,
        contributorsCount: project.githubIntegration.contributors.length,
        setupSteps: [
          'Go to your GitHub repository → Settings → Webhooks → Add webhook',
          `In Payload URL, paste: ${webhookUrl}`,
          'Set Content type to application/json',
          'In Secret, paste the generated secret key (shown above)',
          'Under Which events, select "Just the push event" and "Pull requests"',
          'Click Add webhook. ProjectNexus will immediately ingest live code telemetry.'
        ]
      }
    });
  } catch (error) {
    console.error('Error generating GitHub webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate GitHub webhook credentials',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/projects/:id/github/events
 * @desc    Get latest repository events feed (push, PR, release) for project
 * @access  Public / Authenticated
 */
exports.getGithubEvents = async (req, res) => {
  try {
    const { id } = req.params;

    const cleanId = String(id).trim();
    let query;
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: cleanId };
    } else {
      query = {
        $or: [
          { projectId: cleanId.toUpperCase() },
          { projectId: cleanId }
        ]
      };
    }

    const project = await Project.findOne(query);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const events = await RepositoryEvent.find({ projectId: project._id })
      .sort({ receivedAt: -1 })
      .limit(25)
      .populate('linkedTaskId', 'taskId title status')
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching repository events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repository events',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/projects/:id/github/disconnect
 * @desc    Disconnect GitHub repository and revoke webhook secret
 * @access  Private (Team Lead / Admin)
 */
exports.disconnectGithub = async (req, res) => {
  try {
    const { id } = req.params;

    const cleanId = String(id).trim();
    let query;
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: cleanId };
    } else {
      query = {
        $or: [
          { projectId: cleanId.toUpperCase() },
          { projectId: cleanId }
        ]
      };
    }

    const project = await Project.findOne(query);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.githubIntegration) {
      project.githubIntegration.isConnected = false;
      project.githubIntegration.webhookSecret = undefined;
    }

    project.timeline.unshift({
      title: 'GitHub Repository Disconnected',
      description: 'GitHub webhook tracking disconnected by project administrators.',
      timestamp: new Date(),
      type: 'alert'
    });

    await project.save();
    await recalculateHealthScore(project._id);

    res.status(200).json({
      success: true,
      message: 'GitHub repository tracking disconnected successfully',
      data: project
    });
  } catch (error) {
    console.error('Error disconnecting GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect GitHub',
      error: error.message
    });
  }
};

/**
 * @desc    Delete project by ID or human Project ID
 * @route   DELETE /api/projects/:id
 * @access  Public / Admin
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).trim();
    let query;
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: cleanId };
    } else {
      query = {
        $or: [
          { projectId: cleanId.toUpperCase() },
          { projectId: cleanId }
        ]
      };
    }

    const project = await Project.findOneAndDelete(query);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or already deleted'
      });
    }

    // Clean up associated repository events
    try {
      await RepositoryEvent.deleteMany({ projectId: project._id });
    } catch (cleanupErr) {
      console.warn('RepositoryEvent cleanup notice:', cleanupErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Project ${project.projectId} and associated telemetry deleted successfully`,
      deletedProjectId: project.projectId
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/projects/:id/handover
 * @desc    Execute versioned project handover from outgoing team to continuation team
 * @access  Public / Admin
 */
exports.executeProjectHandover = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      reason,
      completedModules,
      pendingModules,
      knownIssues,
      facultyNotes,
      newTeamName,
      newLeadEmail,
      hardwareNotes
    } = req.body;

    const project = await findProjectByIdOrCustomId(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const previousVersion = project.currentVersionNumber || 1;
    const nextVersion = previousVersion + 1;
    const previousTeamName = project.team?.name || 'Previous Team';
    const progressAtHandover = project.progress || 45;

    // 1. Generate new Team Access Code for continuation team
    const newCode = `NEXUS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 2. Update Project fields
    project.currentVersionNumber = nextVersion;
    project.isContinuation = true;
    project.status = 'Active';
    project.teamAccessCode = newCode;
    project.isAccessCodeClaimed = false;
    project.accessCodeStatus = 'active';
    if (newLeadEmail) project.invitedLeadEmail = newLeadEmail.trim().toLowerCase();

    // Re-initialize team roster for incoming continuation team
    project.team = {
      name: newTeamName || `Continuation Team (v${nextVersion}.0)`,
      leader: {
        name: newLeadEmail ? newLeadEmail.split('@')[0] : 'Incoming Lead',
        email: newLeadEmail || '',
        rollNo: '',
        role: 'Team Lead',
        githubUsername: '',
        contribution: ''
      },
      members: []
    };

    // Push audit timeline event
    project.timeline.unshift({
      title: `Versioned Handover Executed (v${previousVersion}.0 → v${nextVersion}.0)`,
      description: `Project discontinued by ${previousTeamName} (${progressAtHandover}% complete). Transferred to ${newTeamName || 'Continuation Team'}. Reason: ${reason || 'Semester conclusion'}`,
      timestamp: new Date(),
      type: 'handover'
    });

    await project.save();

    // 3. Sync with TeamDB collection
    await TeamDB.findOneAndUpdate(
      { projectId: project.projectId },
      {
        teamName: newTeamName || `Continuation Team (v${nextVersion}.0)`,
        leader: {
          name: newLeadEmail ? newLeadEmail.split('@')[0] : 'Incoming Lead',
          email: newLeadEmail || '',
          rollNo: '',
          role: 'Team Lead',
          githubUsername: '',
          contribution: ''
        },
        members: [],
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    const handoverRecord = {
      packetId: `HO-${project.projectId}-${nextVersion}.0`,
      projectId: project.projectId,
      projectTitle: project.title,
      fromVersion: previousVersion,
      toVersion: nextVersion,
      fromTeamName: previousTeamName,
      toTeamName: newTeamName || `Continuation Team (v${nextVersion}.0)`,
      discontinuationReason: reason || 'Academic term conclusion and internship migration',
      progressAtHandover,
      completedModules: Array.isArray(completedModules) ? completedModules : [
        'FaceNet embedding model (94.2% accuracy)',
        'Student profile enrollment UI',
        'PostgreSQL vector database schema'
      ],
      pendingModules: Array.isArray(pendingModules) ? pendingModules : [
        'Anti-Spoofing & Liveness Filter',
        'Edge inference optimization (Jetson GPU)',
        'Faculty Attendance CSV Export'
      ],
      knownIssues: Array.isArray(knownIssues) ? knownIssues : [
        'RTSP memory leak on WiFi disconnect',
        'Inference latency high on CPU'
      ],
      facultyNotes: facultyNotes || 'Hardware kit available in CS Lab 3, Locker #4. Do not retrain base embedding network; focus directly on liveness filtering.',
      hardwareNotes: hardwareNotes || 'Workstation 4, CS Embedded Lab',
      githubUrl: project.githubUrl || 'https://github.com/projectnexus/smart-attendance-system',
      newAccessCode: newCode,
      transferredAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: `Versioned handover executed successfully to v${nextVersion}.0`,
      data: {
        project,
        handoverRecord
      }
    });
  } catch (error) {
    console.error('Error executing project handover:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute project handover',
      error: error.message
    });
  }
};



