// middlewares/validation.js
const { body, query, param, validationResult } = require('express-validator');

const validation = {
  // User registration validation
  registerValidation: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain a number'),
    body('firstName')
      .notEmpty()
      .trim()
      .withMessage('First name is required'),
    body('lastName')
      .notEmpty()
      .trim()
      .withMessage('Last name is required'),
    body('phoneNumber')
      .matches(/^\+?[\d\s-]{10,}$/)
      .withMessage('Invalid phone number'),
    body('role')
      .isIn(['rider', 'driver'])
      .withMessage('Invalid role specified')
  ],

  // Schedule validation
  scheduleValidation: [
    body('availabilityBlocks.*.date')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('availabilityBlocks.*.timeSlots.*.startTime')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid start time format'),
    body('availabilityBlocks.*.timeSlots.*.endTime')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid end time format'),
    body('preferences.maxDistance')
      .isNumeric()
      .withMessage('Invalid distance value')
  ],

  // Ride booking validation
  bookingValidation: [
    body('scheduleId')
      .isMongoId()
      .withMessage('Invalid schedule ID'),
    body('date')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('time')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid time format')
  ],

  // Location validation
  locationValidation: [
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude'),
    body('address')
      .notEmpty()
      .withMessage('Address is required')
  ],

  // Handle validation results
  validate: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array() 
      });
    }
    next();
  }
};

module.exports = validation;