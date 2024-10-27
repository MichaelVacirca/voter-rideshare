// package.json
{
  "name": "voter-rideshare",
  "version": "1.0.0",
  "description": "Connect voters with rides to polling locations",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "express": "^4.17.1",
    "body-parser": "^1.19.0",
    "mongoose": "^6.0.0",
    "dotenv": "^10.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.15"
  }
}

// Procfile
web: node index.js

// config.js
require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost/voter-rideshare',
    port: process.env.PORT || 3000
};

// index.js (updated version)
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Rest of your existing code...

// Updated server startup
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

// .gitignore
node_modules/
.env
npm-debug.log
.DS_Store

// .env (create this locally, don't commit to git)
MONGODB_URI=your_mongodb_uri
PORT=3000
