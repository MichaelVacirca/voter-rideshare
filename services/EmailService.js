// services/EmailService.js
const sgMail = require('@sendgrid/mail');
const config = require('../config');

sgMail.setApiKey(config.email.sendgridKey);

class EmailService {
  static async sendWelcomeEmail(user) {
    const msg = {
      to: user.email,
      from: config.email.from,
      subject: 'Welcome to VoteRide!',
      templateId: 'd-xxx', // SendGrid template ID
      dynamicTemplateData: {
        firstName: user.firstName,
        verificationLink: `${config.server.url}/verify-email?token=${user.verificationToken}`
      }
    };
    return sgMail.send(msg);
  }

  static async sendRideConfirmation(ride) {
    const msg = {
      to: ride.rider.email,
      from: config.email.from,
      subject: 'Your Ride is Confirmed',
      templateId: 'd-xxx',
      dynamicTemplateData: {
        riderName: ride.rider.firstName,
        driverName: ride.driver.firstName,
        pickupTime: ride.pickupTime,
        pickupLocation: ride.pickupAddress,
        pollingPlace: ride.pollingLocation
      }
    };
    return sgMail.send(msg);
  }

  static async sendDriverNotification(driver, ride) {
    const msg = {
      to: driver.email,
      from: config.email.from,
      subject: 'New Ride Request',
      templateId: 'd-xxx',
      dynamicTemplateData: {
        driverName: driver.firstName,
        pickupTime: ride.pickupTime,
        pickupLocation: ride.pickupAddress,
        pollingPlace: ride.pollingLocation
      }
    };
    return sgMail.send(msg);
  }
}

module.exports = EmailService;