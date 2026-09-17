const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Helper to find project by MongoDB ID or Project ID
const findProject = async (id) => {
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
 * @route   POST /api/webhooks/repo/:id
 * @desc    Receive GitHub / Git webhook push and ping events
 * @access  Public (Webhook endpoint)
 */
router.post('/repo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProject(id);

    const event = req.headers['x-github-event'] || 'push';
    const payload = req.body || {};

    console.log(`📡 [WEBHOOK RECEIVED] Project: ${id} | Event: ${event}`);

    if (project) {
      const pusher = payload.pusher?.name || payload.sender?.login || 'Team Contributor';
      const commitCount = payload.commits?.length || 1;
      const latestMsg = payload.head_commit?.message || payload.commits?.[0]?.message || 'Code changes committed to repository';
      const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'main';

      project.lastActivityDate = new Date();
      
      // Add timeline entry
      project.timeline.unshift({
        title: `Git Push (${branch}): ${commitCount} commit${commitCount > 1 ? 's' : ''}`,
        description: `"${latestMsg.slice(0, 100)}" by ${pusher}`,
        timestamp: new Date(),
        type: 'milestone'
      });

      if (payload.repository?.html_url && !project.githubUrl) {
        project.githubUrl = payload.repository.html_url;
      }

      await project.save();
    }

    res.status(200).json({
      success: true,
      message: `Webhook successfully processed for project ${id}`,
      event,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook event',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/webhooks/test/:id
 * @desc    Send a test webhook ping to verify connection
 * @access  Public
 */
router.post('/test/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProject(id);

    if (project) {
      project.timeline.unshift({
        title: 'Webhook Ping Verified',
        description: 'GitHub webhook test ping received and verified successfully.',
        timestamp: new Date(),
        type: 'alert'
      });
      await project.save();
    }

    res.status(200).json({
      success: true,
      message: 'Webhook test ping verified successfully! Tracking is active.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify test ping',
      error: error.message
    });
  }
});

module.exports = router;
