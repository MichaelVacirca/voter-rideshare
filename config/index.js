// config/index.js
require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  },

  // Database configuration
  database: {
    url: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: process.env.NODE_ENV !== 'production'
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL,
    ttl: 3600
  },

  // Email configuration
  email: {
    from: process.env.EMAIL_FROM,
    sendgridKey: process.env.SENDGRID_API_KEY
  },

  // SMS configuration
  sms: {
    twilioSid: process.env.TWILIO_ACCOUNT_SID,
    twilioToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhone: process.env.TWILIO_PHONE_NUMBER
  },

  // Maps configuration
  maps: {
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY
  }
};