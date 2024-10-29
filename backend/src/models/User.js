const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  isDriver: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  driverLicense: String,
  vehicleInfo: {
    make: String,
    model: String,
    year: String,
    color: String,
    licensePlate: String
  }
});

module.exports = mongoose.model('User', userSchema);