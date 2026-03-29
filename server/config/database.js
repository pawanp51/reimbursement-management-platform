// Database configuration - Using Prisma ORM with PostgreSQL (Neon)
const prisma = require('./prisma');

const connectDB = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };

