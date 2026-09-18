const crypto = require('crypto');
const Project = require('../models/Project');
const RepositoryEvent = require('../models/RepositoryEvent');
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
 * @route   PUT /api/projects/:id/team
 * @desc    Update project team details (leader, members, name, githubUrl)
 * @access  Public / Team Lead
 */
exports.updateProjectTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, leader, members, githubUrl } = req.body;

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
        githubUsername: leader.githubUsername ? leader.githubUsername.trim() : (project.team?.leader?.githubUsername || '')
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
        githubUsername: (m.githubUsername || '').trim()
      }));
    }

    // Update githubUrl if provided
    if (githubUrl !== undefined) {
      project.githubUrl = githubUrl.trim();
    }

    // Add timeline entry
    project.timeline.unshift({
      title: 'Team Directory & Repository Updated',
      description: `Team roster updated (${(project.team?.members?.length || 0) + 1} members). ${project.githubUrl ? `Repository: ${project.githubUrl}` : ''}`,
      timestamp: new Date(),
      type: 'status_change'
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Team details and repository updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Error updating project team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team details',
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


