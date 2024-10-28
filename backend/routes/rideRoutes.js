// rideRoutes.js - Backend route handling for ride sharing
const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride'); // Assuming Ride is your Mongoose model

// Route to register a new ride (offer or request)
router.post('/api/rides/register', async (req, res) => {
  const { rideType, pickupLocation, destination, time } = req.body;

  console.log("Registering ride with type:", rideType); // Debugging log
  try {
    const newRide = new Ride({
      rideType,
      pickupLocation,
      destination,
      time,
      status: 'pending'
    });
    
    const savedRide = await newRide.save();
    console.log("Ride successfully saved:", savedRide); // Debugging log
    
    res.status(201).json(savedRide);
  } catch (error) {
    console.error("Error saving ride:", error); // Log any error
    res.status(500).json({ error: "Failed to register ride" });
  }
});

// Route to search for rides based on parameters
router.get('/api/rides/search', async (req, res) => {
  const { pickupLocation, destination, rideType, time } = req.query;

  console.log("Received Search Request with params:", req.query); // Log the parameters
  try {
    const query = {};
    if (rideType) query.rideType = rideType;
    if (pickupLocation) query.pickupLocation = pickupLocation;
    if (destination) query.destination = destination;
    if (time) query.time = { $gte: new Date(time) }; // Example for filtering by time

    console.log("Constructed Query:", query); // Log the constructed query
    const rides = await Ride.find(query);
    console.log("Search Results:", rides); // Log the retrieved rides
    res.json(rides);
  } catch (err) {
    console.error("Error in Search:", err);
    res.status(500).send("Server Error");
  }
});

// Route to match a ride
router.put('/api/rides/match/:rideId', async (req, res) => {
  const { rideId } = req.params;

  console.log("Matching ride with ID:", rideId); // Debugging log
  try {
    const updatedRide = await Ride.findByIdAndUpdate(rideId, { status: 'matched' }, { new: true });
    if (!updatedRide) {
      return res.status(404).json({ error: "Ride not found" });
    }
    console.log("Ride successfully matched:", updatedRide); // Debugging log
    res.json(updatedRide);
  } catch (err) {
    console.error("Error matching ride:", err);
    res.status(500).json({ error: "Failed to match the ride" });
  }
});

module.exports = router;
