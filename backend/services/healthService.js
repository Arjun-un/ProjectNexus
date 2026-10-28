const Project = require('../db/Project');
const Task = require('../db/Task');
const RepositoryEvent = require('../db/RepositoryEvent');

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
    const projectTasks = await Task.find({ projectId: project._id }).lean();

    let adherenceScore;
    if (projectTasks && projectTasks.length > 0) {
      const completedTasks = projectTasks.filter(t => t.status === 'done').length;
      const taskRatio = (completedTasks / projectTasks.length) * 100;
      adherenceScore = Math.round(taskRatio);
      // Sync actual task progress to project model
      project.progress = adherenceScore;
    } else {
      // No tasks in DB: use actual project progress (0 for new project, never fake fallback)
      adherenceScore = typeof project.progress === 'number' ? project.progress : 0;
    }

    // Penalty if passed deadline without completion
    const isPastDeadline = project.deadline && new Date(project.deadline) < now;
    const projectAgeDays = Math.max(0, (now.getTime() - new Date(project.createdAt || now).getTime()) / (1000 * 60 * 60 * 24));
    
    if (isPastDeadline && (project.progress || 0) < 100 && projectAgeDays >= 7) {
      adherenceScore = Math.max(10, adherenceScore - 25);
    }

    // 3. REPO ACTIVITY COMPONENT (25%)
    const isRepoConnected = Boolean(project.githubIntegration?.isConnected || project.githubUrl);
    let repoActivityScore = 75;

    if (isRepoConnected) {
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      const recentEventsCount = await RepositoryEvent.countDocuments({
        projectId: project._id,
        receivedAt: { $gte: fourteenDaysAgo }
      });

      const teamSize = Math.max(1, 1 + (project.team?.members?.length || 0));
      const expectedEvents = Math.max(2, teamSize * 2);

      if (recentEventsCount > 0) {
        repoActivityScore = Math.min(100, Math.max(65, Math.round((recentEventsCount / expectedEvents) * 100)));
      } else {
        // Connected but waiting for first commit push:
        // Grant onboarding grace period of 7 days
        repoActivityScore = projectAgeDays <= 7 ? 75 : 40;
      }
    }

    // Check if project is newly active in initialization
    const isNewZeroState = projectAgeDays <= 3 && (!projectTasks || projectTasks.length === 0) && (project.githubIntegration?.totalCommits || 0) === 0;

    let finalScore;
    if (isNewZeroState) {
      // Newly active project: healthy starting state
      finalScore = 85;
    } else if (isRepoConnected) {
      finalScore = Math.round(
        updateRecencyScore * 0.40 +
        adherenceScore * 0.35 +
        repoActivityScore * 0.25
      );
    } else {
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

    // Harmonize status & health:
    // Only set project.status = 'At Risk' if it drops to Critical
    if (derivedHealth === 'Critical') {
      if (project.status === 'Active') {
        project.status = 'At Risk';
      }
    } else if (derivedHealth === 'Good' || derivedHealth === 'Moderate') {
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
