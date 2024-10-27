const express = require('express');
const router = express.Router();
const { AuthService } = require('../services');
const auth = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('phoneNumber').notEmpty().trim(),
  body('role').isIn(['rider', 'driver'])
];

// Register new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await AuthService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth.verifyToken, async (req, res) => {
  try {
    const user = await AuthService.getCurrentUser(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', auth.verifyToken, async (req, res) => {
  try {
    const user = await AuthService.updateProfile(req.user._id, req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password request
router.post('/reset-password-request', async (req, res) => {
  try {
    await AuthService.initiatePasswordReset(req.body.email);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await AuthService.resetPassword(token, newPassword);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;