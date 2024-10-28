const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['rider', 'driver'], required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  availability: { type: [String], default: [] }, // For drivers (e.g., ['Monday morning', 'Tuesday afternoon'])
  rideRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }], // For riders
  rideOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }]  // For drivers
});

const User = mongoose.model('User', userSchema);

module.exports = User;