const express = require('express');
const router = express.Router();
const { DriverService } = require('../services');
const auth = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

// Get driver's upcoming rides
router.get('/rides', auth.verifyToken, auth.checkRole(['driver']), async (req, res) => {
  try {
    const rides = await DriverService.getUpcomingRides(req.user._id);
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver status (active/inactive)
router.put('/status', 
  auth.verifyToken, 
  auth.checkRole(['driver']),
  [body('status').isBoolean()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const status = await DriverService.updateStatus(req.user._id, req.body.status);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Update vehicle information
router.put('/vehicle', 
  auth.verifyToken, 
  auth.checkRole(['driver']),
  [
    body('vehicle.make').isString(),
    body('vehicle.model').isString(),
    body('vehicle.year').isInt({ min: 1990 }),
    body('vehicle.color').isString(),
    body('vehicle.licensePlate').isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const vehicle = await DriverService.updateVehicle(req.user._id, req.body.vehicle);
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Get driver statistics
router.get('/stats', auth.verifyToken, auth.checkRole(['driver']), async (req, res) => {
  try {
    const stats = await DriverService.getDriverStats(req.user._id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit documents for verification
router.post('/documents', 
  auth.verifyToken, 
  auth.checkRole(['driver']),
  async (req, res) => {
    try {
      const result = await DriverService.submitDocuments(req.user._id, req.files);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Get earnings report
router.get('/earnings', auth.verifyToken, auth.checkRole(['driver']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const earnings = await DriverService.getEarningsReport(req.user._id, startDate, endDate);
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;