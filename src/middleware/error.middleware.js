const multer = require("multer");

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || 500;

  const message = err.statusCode ? err.message : "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
  });
};

module.exports = errorMiddleware;
