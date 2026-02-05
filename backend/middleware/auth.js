/**
 * Authentication middleware
 */

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

const isAuthenticatedRedirect = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

module.exports = {
  isAuthenticated,
  isAuthenticatedRedirect
};
