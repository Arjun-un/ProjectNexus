const Project = require('../models/Project');
const Task = require('../models/Task');
const RepositoryEvent = require('../models/RepositoryEvent');

/**
 * Enterprise Health Score Engine for ProjectNexus
 * Calculates dynamic project health score (0-100) and derives health enum
 * 
 * Weights:
 * - Update Recency: 40% (activity decay after 7 days)
 * - Milestone / Task Adherence: 35% (completed vs expected progress)
 * - Repo Activity: 25% (trailing 14-day velocity normalized by team size)
 */
const recalculateHealthScore = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) return null;

    const now = new Date();

    // 1. UPDATE RECENCY COMPONENT (40%)
    const lastActivity = project.lastActivityDate || project.updatedAt || project.createdAt || now;
    const daysSinceLastActivity = Math.max(0, (now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    
    let updateRecencyScore = 100;
    if (daysSinceLastActivity <= 2) {
      updateRecencyScore = 100;
    } else if (daysSinceLastActivity <= 7) {
      updateRecencyScore = Math.max(70, Math.round(100 - (daysSinceLastActivity - 2) * 6));
    } else {
      // Linear decay past 7 days of silence down to min 10
      const daysOverdue = daysSinceLastActivity - 7;
      updateRecencyScore = Math.max(10, Math.round(70 - daysOverdue * 7));
    }

    // 2. MILESTONE & TASK ADHERENCE COMPONENT (35%)
    let adherenceScore = project.progress || 50;
    const projectTasks = await Task.find({ projectId: project._id }).lean();

    if (projectTasks && projectTasks.length > 0) {
      const completedTasks = projectTasks.filter(t => t.status === 'done').length;
      const taskRatio = (completedTasks / projectTasks.length) * 100;
      // Blend task completion with registered progress
      adherenceScore = Math.round(taskRatio * 0.7 + (project.progress || 0) * 0.3);
    }

    // Penalty if passed deadline without completion
    if (project.deadline && new Date(project.deadline) < now && (project.progress || 0) < 100) {
      adherenceScore = Math.max(10, adherenceScore - 30);
    }

    // 3. REPO ACTIVITY COMPONENT (25%)
    let repoActivityScore = 50;
    const isRepoConnected = Boolean(project.githubIntegration?.isConnected || project.githubUrl);

    if (isRepoConnected) {
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      // Count repository events in trailing 14 days
      const recentEventsCount = await RepositoryEvent.countDocuments({
        projectId: project._id,
        receivedAt: { $gte: fourteenDaysAgo }
      });

      // Team size normalization (Leader + members)
      const teamSize = Math.max(1, 1 + (project.team?.members?.length || 0));
      // Expected baseline: ~2 code events per team member over 14 days
      const expectedEvents = Math.max(2, teamSize * 2);

      repoActivityScore = Math.min(100, Math.round((recentEventsCount / expectedEvents) * 100));
      // Give baseline credit if repo is connected even if commits just started
      if (recentEventsCount > 0 && repoActivityScore < 60) {
        repoActivityScore = 65;
      }
    }

    // Compute composite score based on whether repo is connected
    let finalScore = 80;
    if (isRepoConnected) {
      finalScore = Math.round(
        updateRecencyScore * 0.40 +
        adherenceScore * 0.35 +
        repoActivityScore * 0.25
      );
    } else {
      // Fallback weights when repo is not yet connected
      finalScore = Math.round(
        updateRecencyScore * 0.55 +
        adherenceScore * 0.45
      );
    }

    // Clamp score
    finalScore = Math.min(100, Math.max(0, finalScore));

    // Derive health category enum
    let derivedHealth = 'Good';
    if (finalScore >= 80) {
      derivedHealth = 'Good';
    } else if (finalScore >= 60) {
      derivedHealth = 'Moderate';
    } else if (finalScore >= 40) {
      derivedHealth = 'At Risk';
    } else {
      derivedHealth = 'Critical';
    }

    project.healthScore = finalScore;
    project.health = derivedHealth;

    // Harmonize status & health to prevent contradictory UI states:
    // If health drops to Critical or At Risk, update status away from Active green dot
    if (derivedHealth === 'Critical' || derivedHealth === 'At Risk') {
      if (project.status === 'Active') {
        project.status = 'At Risk';
      }
    } else if (derivedHealth === 'Good' || derivedHealth === 'Moderate') {
      // If previously flagged At Risk and recovered, restore Active
      if (project.status === 'At Risk') {
        project.status = 'Active';
      }
    }

    await project.save();

    return {
      projectId: project._id,
      healthScore: finalScore,
      health: derivedHealth,
      status: project.status,
      breakdown: {
        updateRecency: updateRecencyScore,
        milestoneAdherence: adherenceScore,
        repoActivity: isRepoConnected ? repoActivityScore : null
      }
    };
  } catch (error) {
    console.error(`[Health Engine Error] Project ${projectId}:`, error.message);
    return null;
  }
};

module.exports = {
  recalculateHealthScore
};
