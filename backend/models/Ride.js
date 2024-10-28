const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rideType: {
    type: String,
    enum: ['request', 'offer'],
    required: true,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'completed', 'canceled'],
    default: 'pending',
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Ride', RideSchema);
