const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many request. Try again later.",
  },
  standardHeaders: true,
  headers: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    succcess: false,
    message: "Too many authentication request. Try again later.",
  },
  standardHeaders: true,
  headers: false,
});

module.exports = { globalLimiter, authLimiter };
