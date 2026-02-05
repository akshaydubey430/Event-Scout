const express = require('express');
const router = express.Router();
const passport = require('passport');

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
        avatar: req.user.avatar
      }
    });
  } else {
    res.json({ user: null });
  }
});

// @route   GET /api/auth/logout
// @desc    Logout user
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
