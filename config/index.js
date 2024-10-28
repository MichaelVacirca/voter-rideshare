require('dotenv').config();
const database = require('./database');

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  database,
  jwtSecret: process.env.JWT_SECRET,
  redis: {
    url: process.env.REDIS_URL
  },
  email: {
    sendgridKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.EMAIL_FROM
  },
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  google: {
    mapsKey: process.env.GOOGLE_MAPS_API_KEY
  }
};