// middlewares/logger.js
const winston = require('winston');
const morgan = require('morgan');

// Configure winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const logging = {
  // Request logging
  requestLogger: morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }),

  // Custom event logger
  eventLogger: (req, res, next) => {
    req.logger = logger;
    next();
  },

  // Error logger
  errorLogger: (err, req, res, next) => {
    logger.error({
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
      user: req.user?._id
    });
    next(err);
  }
};

module.exports = logging;