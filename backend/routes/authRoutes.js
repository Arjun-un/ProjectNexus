const express = require('express');
const router = express.Router();
const { loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/auth/login — Public login endpoint
router.post('/login', loginUser);

// GET /api/auth/me — Private: get current authenticated user
router.get('/me', protect, getMe);

module.exports = router;
