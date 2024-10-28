const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');

// Create a new ride request/offer
router.post('/', async (req, res) => {
  try {
    const ride = new Ride(req.body);
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

module.exports = router;
