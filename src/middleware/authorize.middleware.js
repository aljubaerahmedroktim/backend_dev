const AppError = require("../utils/appError.js");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You don't have permission", 403));
    }
    next();
  };
};

module.exports = authorize;
