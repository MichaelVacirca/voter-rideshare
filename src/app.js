const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Get MongoDB connection string from environment variables
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// ... (rest of your app.js code will go here later)

module.exports = app;