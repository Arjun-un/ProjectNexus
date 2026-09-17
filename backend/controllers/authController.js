const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Authenticate user & return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide both email and password'));
    }

    // Find user by email — explicitly select passwordHash since it's excluded by default
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403);
      return next(new Error('This account has been deactivated. Contact your administrator.'));
    }

    // Verify password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return success response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Redeem Team Access Code to join/claim project workspace
 * @route   POST /api/auth/redeem-invite
 * @access  Public
 */
const Project = require('../models/Project');

const redeemInvite = async (req, res, next) => {
  try {
    const { accessCode, projectId } = req.body;

    if (!accessCode || !accessCode.trim()) {
      res.status(400);
      return next(new Error('Please enter the team access code.'));
    }

    const cleanCode = accessCode.trim().toUpperCase();
    const cleanProjectId = projectId ? projectId.trim().toUpperCase() : null;

    let project = null;

    if (cleanProjectId) {
      project = await Project.findOne({
        teamAccessCode: cleanCode,
        projectId: cleanProjectId
      });
    }

    if (!project) {
      project = await Project.findOne({ teamAccessCode: cleanCode });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Invalid access code. Please check your invitation email or contact your administrator.'
      });
    }

    if (cleanProjectId && project.projectId !== cleanProjectId) {
      return res.status(400).json({
        success: false,
        message: `Access code is valid, but belongs to project ${project.projectId} instead of ${cleanProjectId}.`
      });
    }

    if (project.accessCodeStatus === 'revoked') {
      return res.status(403).json({
        success: false,
        message: 'This access code has been deactivated or revoked by the administrator.'
      });
    }

    // Mark access code claimed
    project.isAccessCodeClaimed = true;
    project.accessCodeStatus = 'claimed';
    
    // Add timeline log
    const hasClaimTimeline = (project.timeline || []).some(t => t.type === 'team_join');
    if (!hasClaimTimeline) {
      project.timeline.unshift({
        title: 'Team Access Code Redeemed',
        description: `Team workspace initialized via access code ${cleanCode}`,
        timestamp: new Date(),
        type: 'team_join'
      });
    }

    await project.save();

    // Generate JWT token
    const token = generateToken(project._id, 'lead');

    res.status(200).json({
      success: true,
      message: 'Access code verified successfully! Welcome to your project workspace.',
      token,
      user: {
        id: project._id,
        name: project.team?.leader?.name || (project.invitedLeadEmail ? project.invitedLeadEmail.split('@')[0] : 'Team Lead'),
        email: project.team?.leader?.email || project.invitedLeadEmail || 'teamlead@projectnexus.edu',
        role: 'lead',
        department: project.department
      },
      project: {
        id: project.projectId,
        projectId: project.projectId,
        title: project.title,
        category: project.category,
        department: project.department,
        academicYear: project.academicYear,
        facultyGuide: project.facultyGuide,
        deadline: project.deadline,
        priority: project.priority,
        description: project.description,
        techStack: project.techStack,
        componentsRequired: project.componentsRequired,
        teamAccessCode: project.teamAccessCode,
        isAccessCodeClaimed: project.isAccessCodeClaimed,
        status: project.status,
        health: project.health,
        healthScore: project.healthScore,
        progress: project.progress,
        currentMilestone: project.currentMilestone,
        team: project.team,
        timeline: project.timeline
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginUser, getMe, redeemInvite };
