const express = require('express');
const router = express.Router();
const { loginUser, getMe, redeemInvite } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/auth/login — Public login endpoint
router.post('/login', loginUser);

// POST /api/auth/redeem-invite — Public redeem access code endpoint
router.post('/redeem-invite', redeemInvite);

// GET /api/auth/me — Private: get current authenticated user
router.get('/me', protect, getMe);

module.exports = router;
