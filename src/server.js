// -------------------------
// Imports & Dependencies
// -------------------------
require("dotenv").config();
const express = require("express");
const prisma = require("./lib/prisma.js");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

// -------------------------
// Internal Modules
// -------------------------
const errorMiddleware = require("./middleware/error.middleware.js");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");
const postRoutes = require("./routes/post.routes.js");
const uploadRoutes = require("./routes/uploads.routes.js");
const { connectDB } = require("./config/db.config.js");
const { globalLimiter } = require("./middleware/rate-limit.middleware.js");
const AppError = require("./utils/appError.js");

const app = express();
const PORT = process.env.PORT || 5600;

// -------------------------
// Database Connection
// -------------------------
connectDB();

// -------------------------
// Global Middlewares
// -------------------------
app.use(helmet());
app.use(
  express.json({
    limit: "10kb",
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(globalLimiter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// -------------------------
// Routes
// -------------------------
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/uploads", uploadRoutes);

// Check server status
app.get("/health", (_req, res) => {
  res.json({
    message: "Authentication API is running...",
  });
});

// 404 Not Found Route
app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

// -------------------------
// Global Error Middleware
// -------------------------
app.use(errorMiddleware);

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () =>
  console.log(`Server running on: http://localhost:${PORT}`),
);
