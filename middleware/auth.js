
// Checks that the user is logged in, otherwise redirects to login
exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// Returns middleware that checks if the user has the requested role
exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session.userData || req.session.userData.role !== role) {
      return res.status(403).send('Forbidden');
    }
    next();
  };
};
