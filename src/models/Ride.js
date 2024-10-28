const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  rideType: {
    type: String,
    enum: ['need', 'provide'],
    required: true
  },
  time: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ride', RideSchema);
