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

// Register as a ride offer or request
router.post('/register', auth, async (req, res) => {
  const { rideType, pickupLocation, destination, time } = req.body;

  try {
    // Ensure rideType is either 'offer' or 'request'
    if (!['offer', 'request'].includes(rideType)) {
      return res.status(400).json({ error: 'Invalid ride type' });
    }

    const newRide = new Ride({
      user: req.user,
      rideType,
      pickupLocation,
      destination,
      time,
      status: 'pending',
    });

    const savedRide = await newRide.save();
    res.status(201).json({ message: 'Ride registered successfully', ride: savedRide });
  } catch (err) {
    res.status(400).json({ error: 'Failed to register ride' });
  }
});

// Match a ride request with an offer
router.get('/match', auth, async (req, res) => {
  const { rideType, pickupLocation, destination } = req.query;

  try {
    // Determine the opposite ride type to find a match (e.g., request matches offer and vice versa)
    const oppositeRideType = rideType === 'request' ? 'offer' : 'request';

    // Find rides that match the destination and pickup location criteria
    const matches = await Ride.find({
      rideType: oppositeRideType,
      pickupLocation,
      destination,
      status: 'pending',
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
  const { pickupLocation, destination } = req.query;

  try {
    // Search for rides that match the criteria, regardless of time
    const availableRides = await Ride.find({
      pickupLocation,
      destination,
      status: 'pending',
    });

    res.status(200).json(availableRides);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
