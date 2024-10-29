const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickupLocation: {
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  pollingLocation: {
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  requestedTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  specialNeeds: String,
  numberOfPassengers: { type: Number, default: 1 }
});

module.exports = mongoose.model('RideRequest', rideRequestSchema);
