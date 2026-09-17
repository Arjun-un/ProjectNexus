const crypto = require('crypto');
const Project = require('../models/Project');
const { sendProjectInvitationEmail } = require('../services/emailService');

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

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project details by MongoDB ID or Project ID
 * @access  Public / Admin
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Search by ObjectId or custom projectId
    let project = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id);
    }
    if (!project) {
      project = await Project.findOne({ projectId: id.toUpperCase() });
    }

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
      health: 'Good',
      healthScore: 100,
      progress: 0,
      currentMilestone: 'Team Onboarding & Requirement Analysis',
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
    const project = await Project.findById(id);

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
    const project = await Project.findById(id);

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
    const { email, customNote } = req.body;

    let project = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id);
    }
    if (!project) {
      project = await Project.findOne({ projectId: id.toUpperCase() });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const recipientEmail = (email && email.trim()) || project.invitedLeadEmail || project.team?.leader?.email;
    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required. Please specify an email address.'
      });
    }

    // Send email
    const emailResult = await sendProjectInvitationEmail({
      toEmail: recipientEmail.trim(),
      projectTitle: project.title,
      projectId: project.projectId,
      teamAccessCode: project.teamAccessCode,
      department: project.department,
      facultyGuide: project.facultyGuide,
      deadline: project.deadline,
      customNote
    });

    project.invitedLeadEmail = recipientEmail.trim().toLowerCase();
    project.invitationSentAt = new Date();
    project.timeline.unshift({
      title: 'Project Invitation Dispatched via Email',
      description: `Access Code and workspace registration link emailed to ${recipientEmail.trim()}`,
      timestamp: new Date(),
      type: 'alert'
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: `Invitation link successfully dispatched to ${recipientEmail.trim()}`,
      data: {
        projectId: project.projectId,
        invitedLeadEmail: project.invitedLeadEmail,
        invitationSentAt: project.invitationSentAt,
        teamAccessCode: project.teamAccessCode,
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

