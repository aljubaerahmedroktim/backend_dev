const prisma = require("../lib/prisma.js");

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected via prisma.");
  } catch (error) {
    console.log(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
  process.exit(1);
};

module.exports = { connectDB, disconnectDB };
