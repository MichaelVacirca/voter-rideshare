// routes/rideRoutes.js - Ride Request and Offer Routes
const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Create a new ride request/offer
router.post('/', auth, async (req, res) => {
  try {
    const ride = new Ride({ ...req.body, user: req.user });
    const savedRide = await ride.save();
    res.status(201).json(savedRide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all ride requests/offers
router.get('/', async (req, res) => {
  try {
    const rides = await Ride.find();
    res.status(200).json(rides);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Find matching rides
router.get('/matches', auth, async (req, res) => {
  const { location, destination, rideType } = req.query;

  try {
    const oppositeRideType = rideType === 'need' ? 'provide' : 'need';
    const matches = await Ride.find({
      location,
      destination,
      rideType: oppositeRideType,
    });

    res.status(200).json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all rides for a specific user
router.get('/myrides', auth, async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user });
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel a ride request/offer
router.delete('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    if (ride.user.toString() !== req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await ride.remove();
    res.status(200).json({ message: 'Ride successfully canceled' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
