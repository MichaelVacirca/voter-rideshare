const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Create an instance of Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Database connection error:', err);
});

// Routes
const rideRoutes = require('./routes/rideRoutes');
app.use('/api/rides', rideRoutes);

// Define root route
app.get('/', (req, res) => {
  res.send('Welcome to the Voter Rideshare API!');
});

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
