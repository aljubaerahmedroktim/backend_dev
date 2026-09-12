const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError.js");
const prisma = require("../lib/prisma.js");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authentication required", 401);
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      throw new AppError("Invalid authorization format.", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isDeleted: false,
      },
    });

    if (!user) {
      return next(new AppError("Authentication required!", 401));
    }

    req.user = decoded;

    next();
  } catch (e) {
    throw new AppError(e.message, 500);
  }
};

module.exports = authMiddleware;
