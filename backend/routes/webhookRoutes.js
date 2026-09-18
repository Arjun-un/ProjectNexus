const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Project = require('../models/Project');
const RepositoryEvent = require('../models/RepositoryEvent');
const Task = require('../models/Task');
const verifyGithubSignature = require('../middlewares/verifyGithubSignature');
const { recalculateHealthScore } = require('../services/healthService');

// Rate limiting specifically for incoming GitHub webhook events: 150 requests per 15 mins
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many webhook requests from this IP. Please wait a few minutes.'
  }
});

// Helper to find project by MongoDB ID or human Project ID
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
 * Smart Commit Parser:
 * Matches patterns like "Fixes #PN-24", "closes PN-101", "resolves #12", "[M3]"
 */
const parseSmartCommit = async (projectId, message) => {
  if (!message || typeof message !== 'string') return null;

  // Pattern 1: Action keyword + Task ID or issue number
  const actionMatch = message.match(/\b(?:fixes|closes|resolves)\s+#?([a-zA-Z0-9_-]+)\b/i);
  // Pattern 2: Milestone tag [M1], [M2]
  const milestoneMatch = message.match(/\[M(\d+)\]/i);

  const candidateId = actionMatch ? actionMatch[1].trim() : null;
  if (!candidateId) return null;

  try {
    // Search for Task by taskId or title or MongoDB _id
    let task = null;
    if (candidateId.match(/^[0-9a-fA-F]{24}$/)) {
      task = await Task.findOne({ _id: candidateId, projectId });
    }
    if (!task) {
      task = await Task.findOne({
        projectId,
        $or: [
          { taskId: candidateId.toUpperCase() },
          { taskId: candidateId },
          { title: new RegExp(candidateId, 'i') }
        ]
      });
    }

    if (task) {
      // Transition task status to 'done'
      task.status = 'done';
      task.completedAt = new Date();
      await task.save();
      return task._id;
    }
  } catch (err) {
    console.warn('[Smart Commit] Could not link task:', err.message);
  }

  return null;
};

/**
 * @route   POST /api/webhooks/github/:projectId
 * @desc    Production GitHub Webhook Ingestion with HMAC-SHA256 signature verification
 * @access  Public (Signature-Verified via verifyGithubSignature)
 */
router.post('/github/:projectId', webhookLimiter, verifyGithubSignature, async (req, res) => {
  try {
    const project = req.project;
    const event = req.headers['x-github-event'] || 'push';

    // Parse body if still Buffer, else use req.body
    let payload = req.body;
    if (Buffer.isBuffer(payload)) {
      try {
        payload = JSON.parse(payload.toString('utf8'));
      } catch (e) {
        payload = {};
      }
    }

    console.log(`📡 [GITHUB WEBHOOK] Project: ${project.projectId} | Event: ${event}`);

    // Update connection status
    if (!project.githubIntegration) {
      project.githubIntegration = {};
    }
    project.githubIntegration.isConnected = true;
    project.githubIntegration.lastEventAt = new Date();
    project.lastActivityDate = new Date();

    // ──────────────────────────────────────────
    // CASE 1: PUSH EVENT
    // ──────────────────────────────────────────
    if (event === 'push') {
      const commits = Array.isArray(payload.commits) ? payload.commits : [];
      const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'main';
      const pusher = payload.pusher?.name || payload.sender?.login || 'Team Contributor';
      let newCommitsProcessed = 0;

      for (const commit of commits) {
        const commitSha = commit.id || commit.sha;
        if (!commitSha) continue;

        // Idempotency check: Skip if already ingested
        const existingEvent = await RepositoryEvent.findOne({
          projectId: project._id,
          commitSha
        });
        if (existingEvent) {
          continue;
        }

        const author = {
          name: commit.author?.name || pusher,
          email: (commit.author?.email || '').toLowerCase().trim(),
          githubUsername: commit.author?.username || payload.sender?.login || ''
        };

        const filesChanged = {
          added: Array.isArray(commit.added) ? commit.added.length : 0,
          removed: Array.isArray(commit.removed) ? commit.removed.length : 0,
          modified: Array.isArray(commit.modified) ? commit.modified.length : 0
        };

        // Smart commit parsing to auto-resolve Jira-style tasks
        const linkedTaskId = await parseSmartCommit(project._id, commit.message);

        // Store immutable repository event
        await RepositoryEvent.create({
          projectId: project._id,
          eventType: 'push',
          commitSha,
          author,
          message: commit.message || '',
          filesChanged,
          linkedTaskId,
          rawPayloadSummary: {
            branch,
            url: commit.url || '',
            pusher
          },
          receivedAt: new Date()
        });

        // Upsert Contributor Ledger on Project
        const contribKey = author.email || author.githubUsername.toLowerCase();
        let contributor = project.githubIntegration.contributors.find(
          c => (c.email && c.email.toLowerCase() === contribKey) ||
               (c.githubUsername && c.githubUsername.toLowerCase() === contribKey)
        );

        const linesDelta = filesChanged.added + filesChanged.modified;
        const linesRemoved = filesChanged.removed;

        if (contributor) {
          contributor.commitCount = (contributor.commitCount || 0) + 1;
          contributor.linesAdded = (contributor.linesAdded || 0) + linesDelta;
          contributor.linesRemoved = (contributor.linesRemoved || 0) + linesRemoved;
          contributor.lastCommitAt = new Date();
          if (!contributor.githubUsername && author.githubUsername) {
            contributor.githubUsername = author.githubUsername;
          }
        } else {
          project.githubIntegration.contributors.push({
            name: author.name,
            email: author.email,
            githubUsername: author.githubUsername,
            commitCount: 1,
            linesAdded: linesDelta,
            linesRemoved: linesRemoved,
            lastCommitAt: new Date()
          });
        }

        newCommitsProcessed++;
      }

      project.githubIntegration.totalCommits = (project.githubIntegration.totalCommits || 0) + newCommitsProcessed;
      if (commits.length > 0) {
        project.githubIntegration.lastCommitSha = commits[0].id || project.githubIntegration.lastCommitSha;
      }

      // Add timeline entry
      if (commits.length > 0) {
        const latestMsg = commits[0].message || 'Code pushed to repository';
        project.timeline.unshift({
          title: `Git Push (${branch}): ${commits.length} commit${commits.length > 1 ? 's' : ''}`,
          description: `"${latestMsg.slice(0, 90)}" by ${pusher}`,
          timestamp: new Date(),
          type: 'repo_activity'
        });
      }

      await project.save();

      // Recalculate dynamic health score
      await recalculateHealthScore(project._id);

      return res.status(200).json({
        success: true,
        message: `Successfully processed ${newCommitsProcessed} commit(s) for ${project.projectId}`,
        commitsCount: newCommitsProcessed
      });
    }

    // ──────────────────────────────────────────
    // CASE 2: PULL REQUEST EVENT
    // ──────────────────────────────────────────
    if (event === 'pull_request') {
      const action = payload.action; // opened, closed, merged, etc.
      const pr = payload.pull_request || {};
      const isMerged = Boolean(pr.merged && action === 'closed');

      if (action === 'opened' || isMerged) {
        project.githubIntegration.totalPullRequests = (project.githubIntegration.totalPullRequests || 0) + 1;

        await RepositoryEvent.create({
          projectId: project._id,
          eventType: 'pull_request',
          commitSha: pr.merge_commit_sha || pr.head?.sha || '',
          author: {
            name: pr.user?.login || 'Developer',
            email: '',
            githubUsername: pr.user?.login || ''
          },
          message: `PR #${pr.number}: ${pr.title} (${isMerged ? 'merged' : action})`,
          filesChanged: {
            added: pr.additions || 0,
            removed: pr.deletions || 0,
            modified: pr.changed_files || 0
          },
          rawPayloadSummary: {
            prNumber: pr.number,
            action,
            isMerged,
            url: pr.html_url
          },
          receivedAt: new Date()
        });

        project.timeline.unshift({
          title: `Pull Request #${pr.number} ${isMerged ? 'Merged' : 'Opened'}`,
          description: `"${(pr.title || '').slice(0, 90)}" by ${pr.user?.login || 'Contributor'}`,
          timestamp: new Date(),
          type: 'repo_activity'
        });

        await project.save();
        await recalculateHealthScore(project._id);
      }

      return res.status(200).json({
        success: true,
        message: `Pull request event (${action}) acknowledged`
      });
    }

    // ──────────────────────────────────────────
    // CASE 3: PING / OTHER EVENTS
    // ──────────────────────────────────────────
    if (event === 'ping') {
      project.timeline.unshift({
        title: 'GitHub Webhook Ping Verified',
        description: 'GitHub repository handshake ping confirmed and active.',
        timestamp: new Date(),
        type: 'alert'
      });
      await project.save();
      await recalculateHealthScore(project._id);

      return res.status(200).json({
        success: true,
        message: 'GitHub webhook ping handshake verified successfully',
        zen: payload.zen
      });
    }

    await project.save();
    return res.status(200).json({
      success: true,
      message: `GitHub event '${event}' acknowledged`
    });
  } catch (error) {
    console.error('GitHub Webhook Handler Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process GitHub webhook',
      error: error.message
    });
  }
});

// Backward-compatible test ping endpoint
router.post('/test/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProject(id);

    if (project) {
      project.lastActivityDate = new Date();
      project.timeline.unshift({
        title: 'Webhook Test Ping Handshake Verified',
        description: 'Simulated repository test ping received and verified successfully.',
        timestamp: new Date(),
        type: 'alert'
      });
      await project.save();
      await recalculateHealthScore(project._id);
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

// Backward-compatible unauthenticated repo webhook
router.post('/repo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProject(id);

    if (project) {
      project.lastActivityDate = new Date();
      project.timeline.unshift({
        title: 'Repository Telemetry Ping',
        description: 'Repository push event received via legacy tracking URL.',
        timestamp: new Date(),
        type: 'repo_activity'
      });
      await project.save();
      await recalculateHealthScore(project._id);
    }

    res.status(200).json({
      success: true,
      message: 'Legacy webhook received'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
