const express   = require('express');
const passport  = require('passport');
const router    = express.Router();
const { validationResult } = require('express-validator');

const {
  signup,
  login,
  getMe,
  updateProfile,
  googleCallback,
  changePassword,
  becomeHost,
} = require('../controllers/authController');

const { protect }          = require('../middleware/authMiddleware');
const { authRateLimiter }  = require('../middleware/rateLimiter');
const { uploadProfilePic } = require('../config/cloudinary');
const { signupValidator,
        loginValidator }   = require('../utils/validators');

const isGoogleAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// Inline validation handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// ─── Public Routes ─────────────────────────────────────────────────────────
router.post('/signup',       authRateLimiter, signupValidator, validate, signup);
router.post('/login',        authRateLimiter, loginValidator,  validate, login);
router.post('/become-host',  protect, becomeHost);

// ─── Google OAuth ──────────────────────────────────────────────────────────
if (isGoogleAuthEnabled) {
  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );

  router.get('/google/callback',
    passport.authenticate('google', {
      failureRedirect: `${process.env.CLIENT_URL}/login`,
      session: false,
    }),
    googleCallback
  );
} else {
  router.get('/google', (req, res) => {
    res.status(503).json({ success: false, message: 'Google OAuth is not configured.' });
  });
  router.get('/google/callback', (req, res) => {
    res.status(503).json({ success: false, message: 'Google OAuth is not configured.' });
  });
}

// ─── Protected Routes ──────────────────────────────────────────────────────
router.get('/me',              protect, getMe);
router.put('/profile',         protect, uploadProfilePic, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;