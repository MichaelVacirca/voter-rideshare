// services/SMSService.js
const twilio = require('twilio');
const config = require('../config');

const client = twilio(config.sms.twilioSid, config.sms.twilioToken);

class SMSService {
  static async sendVerificationCode(phoneNumber, code) {
    return client.messages.create({
      body: `Your VoteRide verification code is: ${code}`,
      from: config.sms.twilioPhone,
      to: phoneNumber
    });
  }

  static async sendRideConfirmation(ride) {
    return client.messages.create({
      body: `Your ride is confirmed! Your driver ${ride.driver.firstName} will pick you up at ${ride.pickupTime}. Driver's contact: ${ride.driver.phoneNumber}`,
      from: config.sms.twilioPhone,
      to: ride.rider.phoneNumber
    });
  }

  static async sendArrivalAlert(ride) {
    return client.messages.create({
      body: `Your driver has arrived! Look for a ${ride.driver.vehicle.color} ${ride.driver.vehicle.make} ${ride.driver.vehicle.model}`,
      from: config.sms.twilioPhone,
      to: ride.rider.phoneNumber
    });
  }
}

module.exports = SMSService;