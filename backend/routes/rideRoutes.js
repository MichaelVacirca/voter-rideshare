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

// Match a ride request with an offer
router.get('/match', auth, async (req, res) => {
  const { rideType, pickupLocation, destination, time } = req.query;

  try {
    // Find a potential match based on the ride type (request matches offer and vice versa)
    const oppositeRideType = rideType === 'request' ? 'offer' : 'request';

    // Find rides with the opposite type, matching the destination, and are still pending
    const matches = await Ride.find({
      rideType: oppositeRideType,
      pickupLocation,
      destination,
      status: 'pending',
      time: { $gte: new Date(time).setMinutes(new Date(time).getMinutes() - 30) }, // +- 30 min
    });

    if (matches.length === 0) {
      return res.status(404).json({ message: 'No matching rides found' });
    }

    res.status(200).json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update ride status to "matched" and associate the matched ride
router.put('/match/:id', auth, async (req, res) => {
  const { matchedRideId } = req.body;

  try {
    // Update the current ride with the matched ride ID
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.user.toString() !== req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Update ride status and matched ride details
    ride.status = 'matched';
    ride.matchedWith = matchedRideId;
    await ride.save();

    // Update the matched ride as well
    const matchedRide = await Ride.findById(matchedRideId);
    matchedRide.status = 'matched';
    matchedRide.matchedWith = req.params.id;
    await matchedRide.save();

    res.status(200).json({ message: 'Ride successfully matched', ride });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Search for rides
router.get('/search', auth, async (req, res) => {
  const { pickupLocation, destination, time } = req.query;

  try {
    // Search for rides that match the criteria
    const availableRides = await Ride.find({
      pickupLocation,
      destination,
      status: 'pending',
      time: { $gte: new Date(time).setMinutes(new Date(time).getMinutes() - 30) }, // +- 30 min
    });

    res.status(200).json(availableRides);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
