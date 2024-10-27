const express = require('express');
const router = express.Router();
const { ScheduleService } = require('../services');
const auth = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const scheduleValidation = [
  body('availabilityBlocks.*.date').isISO8601(),
  body('availabilityBlocks.*.timeSlots.*.startTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  body('availabilityBlocks.*.timeSlots.*.endTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  body('preferences.maxDistance').isNumeric()
];

// Create or update driver schedule
router.post('/driver', 
  auth.verifyToken, 
  auth.checkRole(['driver']), 
  scheduleValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const schedule = await ScheduleService.createOrUpdateSchedule(req.user._id, req.body);
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Get driver's schedule
router.get('/driver/:driverId', auth.verifyToken, async (req, res) => {
  try {
    const schedule = await ScheduleService.getDriverSchedule(req.params.driverId);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Find available rides
router.get('/available', auth.verifyToken, auth.checkRole(['rider']), async (req, res) => {
  try {
    const { date, time, location, accessibility } = req.query;
    const availableRides = await ScheduleService.findAvailableDrivers(
      date,
      time,
      location,
      { accessibility }
    );
    res.json(availableRides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Book a ride
router.post('/book', auth.verifyToken, auth.checkRole(['rider']), async (req, res) => {
  try {
    const { scheduleId, date, time } = req.body;
    const booking = await ScheduleService.bookRide(scheduleId, req.user._id, date, time);
    res.json({
      message: 'Ride booked successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel a ride
router.post('/cancel', auth.verifyToken, async (req, res) => {
  try {
    const { scheduleId, date, time } = req.body;
    await ScheduleService.cancelRide(scheduleId, req.user._id, date, time);
    res.json({ message: 'Ride cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update schedule availability
router.patch('/availability', auth.verifyToken, auth.checkRole(['driver']), async (req, res) => {
  try {
    const schedule = await ScheduleService.updateAvailability(req.user._id, req.body);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get schedule statistics
router.get('/stats', auth.verifyToken, auth.checkRole(['driver']), async (req, res) => {
  try {
    const stats = await ScheduleService.getScheduleStats(req.user._id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;