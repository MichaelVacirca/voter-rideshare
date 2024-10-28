const mongoose = require('mongoose');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: process.env.NODE_ENV !== 'production',
  maxPoolSize: 10
};

mongoose.set('strictQuery', false);

module.exports = {
  url: process.env.MONGODB_URI,
  options
};