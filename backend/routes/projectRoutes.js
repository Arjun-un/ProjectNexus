const express = require('express');
const router = express.Router();
const {
  getProjectKPIs,
  getAllRegisteredTeams,
  getProjects,
  getProjectById,
  createProject,
  regenerateAccessCode,
  revokeAccessCode,
  sendProjectInvite,
  sendTestEmail,
  getProjectTeam,
  updateProjectTeam,
  updateStudentContributions,
  updateProjectStatus,
  generateGithubWebhook,
  getGithubEvents,
  disconnectGithub,
  deleteProject,
  executeProjectHandover,
  toggleProjectHandoverStatus,
  getOpenHandoverProjects,
  postTeamStatusUpdate
} = require('../controllers/projectController');

// Routes for projects
router.get('/kpis', getProjectKPIs);
router.get('/teams/all', getAllRegisteredTeams);
router.get('/handover/available', getOpenHandoverProjects);
router.get('/', getProjects);
router.post('/test-email', sendTestEmail);
router.get('/:id/team', getProjectTeam);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id/team', updateProjectTeam);
router.put('/:id/contributions', updateStudentContributions);
router.post('/:id/status-message', postTeamStatusUpdate);
router.put('/:id/status-message', postTeamStatusUpdate);
router.put('/:id/status', updateProjectStatus);
router.put('/:id/toggle-handover', toggleProjectHandoverStatus);
router.put('/:id', updateProjectTeam);
router.delete('/:id', deleteProject);
router.post('/:id/regenerate-code', regenerateAccessCode);
router.post('/:id/revoke-code', revokeAccessCode);
router.post('/:id/send-invite', sendProjectInvite);
router.post('/:id/handover', executeProjectHandover);

// GitHub Webhook & Telemetry Routes
router.post('/:id/github/generate-webhook', generateGithubWebhook);
router.get('/:id/github/events', getGithubEvents);
router.post('/:id/github/disconnect', disconnectGithub);

module.exports = router;
