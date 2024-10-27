require('dotenv').config();

module.exports = {
    // Database configuration
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost/voter-rideshare',
    
    // Server configuration
    port: process.env.PORT || 3000,
    
    // Add any additional configuration here
    nodeEnv: process.env.NODE_ENV || 'development'
};