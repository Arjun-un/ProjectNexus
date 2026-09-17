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
 * @desc    Get authenticated user's profile (session verification)
 * @route   GET /api/auth/me
 * @access  Private (requires JWT)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    res.status(200).json({
      success: true,
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

module.exports = { loginUser, getMe };
