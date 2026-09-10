// -------------------------
// Imports & Dependencies
// -------------------------
require("dotenv").config();
const express = require("express");
const prisma = require("./lib/prisma.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// -------------------------
// Internal Modules
// -------------------------
const errorMiddleware = require("./middleware/error.middleware.js");
const AppError = require("./utils/appError.js");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");
const { connectDB } = require("./config/db.config.js");

const app = express();
const PORT = process.env.PORT || 5600;

// -------------------------
// Database Connection
// -------------------------
connectDB();

// -------------------------
// Global Middlewares
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// -------------------------
// Routes
// -------------------------
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// Check server status
app.get("/health", (_req, res) => {
  res.json({
    message: "Authentication API is running...",
  });
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
