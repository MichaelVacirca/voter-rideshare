const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');
const { errorHandler, notFound } = require('./middlewares/error');
const { requestLogger } = require('./middlewares/logger');

// Import routes
const authRoutes = require('./routes/auth');
const riderRoutes = require('./routes/riders');
const driverRoutes = require('./routes/drivers');
const scheduleRoutes = require('./routes/schedules');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Connect to MongoDB
mongoose.connect(config.database.url, config.database.options)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/schedules', scheduleRoutes);

// Serve static files
app.use(express.static('public'));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing