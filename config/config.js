// config/config.js
require('dotenv').config();

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 10000,
  
  // Database
  database: {
    uri: process.env.MONGODB_URI,
    name: 'sleep_tracker'
  },
  
  // Security
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    adminSecret: process.env.ADMIN_JWT_SECRET,
    expiresIn: '7d',
    refreshExpiresIn: '30d'
  },
  
  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@admin.com',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  
  // APIs
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY
  },
  
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    secret: process.env.RAZORPAY_SECRET
  }
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ MISSING REQUIRED ENV VARIABLE: ${envVar}`);
    process.exit(1);
  }
});

module.exports = config;
