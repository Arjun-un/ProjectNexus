const express = require('express');
const router = express.Router();
const {
  getProjectKPIs,
  getProjects,
  getProjectById,
  createProject,
  regenerateAccessCode,
  revokeAccessCode,
  sendProjectInvite
} = require('../controllers/projectController');

// Routes for projects
router.get('/kpis', getProjectKPIs);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.post('/:id/regenerate-code', regenerateAccessCode);
router.post('/:id/revoke-code', revokeAccessCode);
router.post('/:id/send-invite', sendProjectInvite);

module.exports = router;
