const AppError = require("../utils/appError.js");

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(new AppError("Validation failed.", 400, errors));
    }
    req.body = result.data;
    next();
  };
};

module.exports = validate;
