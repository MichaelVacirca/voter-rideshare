const express = require('express');
const router = express.Router();
const { RiderService } = require('../services');
const auth = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

// Get rider's upcoming rides
router.get('/rides', auth.verifyToken, auth.checkRole(['rider']), async (req, res) => {
  try {
    const rides = await RiderService.getUpcomingRides(req.user._id);
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ride history
router.get('/history', auth.verifyToken, auth.checkRole(['rider']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const history = await RiderService.getRideHistory(req.user._id, page, limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search for available rides
router.get('/search', auth.verifyToken, auth.checkRole(['rider']), async (req, res) => {
  try {
    const { date, location, accessibility } = req.query;
    const rides = await RiderService.searchRides(date, location, accessibility);
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rate a completed ride
router.post('/rate', 
  auth.verifyToken, 
  auth.checkRole(['rider']),
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('feedback').optional().isString().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { scheduleId, rating, feedback } = req.body;
      await RiderService.rateRide(req.user._id, scheduleId, rating, feedback);
      res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Save favorite locations
router.post('/favorites', 
  auth.verifyToken, 
  auth.checkRole(['rider']),
  [body('location').isObject()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const favorite = await RiderService.addFavoriteLocation(req.user._id, req.body.location);
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Get favorite locations
router.get('/favorites', auth.verifyToken, auth.checkRole(['rider']), async (req, res) => {
  try {
    const favorites = await RiderService.getFavoriteLocations(req.user._id);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ride notifications
router.get('/notifications', auth.verifyToken, auth.checkRole(['rider']), async (req, res) => {
  try {
    const notifications = await RiderService.getRideNotifications(req.user._id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update rider preferences
router.put('/preferences', 
  auth.verifyToken, 
  auth.checkRole(['rider']), 
  async (req, res) => {
    try {
      const preferences = await RiderService.updatePreferences(req.user._id, req.body);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;