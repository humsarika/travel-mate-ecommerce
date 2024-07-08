
module.exports = (req, res, next) => {
    if (req.isAuthenticated && req.user) {
      res.locals.isAuthenticated = true;
      res.locals.user = req.user;
    } else {
      res.locals.isAuthenticated = false;
      res.locals.user = null;
    }
    next();
  };
  