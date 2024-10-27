// services/JobService.js
const Queue = require('bull');
const config = require('../config');

// Create queues
const emailQueue = new Queue('email', config.redis.url);
const smsQueue = new Queue('sms', config.redis.url);
const reminderQueue = new Queue('reminder', config.redis.url);

class JobService {
  static async scheduleRideReminders(ride) {
    // Schedule reminder for 24 hours before
    await reminderQueue.add('24hrReminder', {
      rideId: ride._id
    }, {
      delay: new Date(ride.pickupTime).getTime() - Date.now() - (24 * 60 * 60 * 1000)
    });

    // Schedule reminder for 1 hour before
    await reminderQueue.add('1hrReminder', {
      rideId: ride._id
    }, {
      delay: new Date(ride.pickupTime).getTime() - Date.now() - (60 * 60 * 1000)
    });
  }

  static async processFailedRides() {
    await reminderQueue.add('processFailedRides', {}, {
      repeat: {
        cron: '0 * * * *' // Every hour
      }
    });
  }

  static async cleanupOldRecords() {
    await reminderQueue.add('cleanup', {}, {
      repeat: {
        cron: '0 0 * * *' // Daily at midnight
      }
    });
  }
}

// Process email queue
emailQueue.process(async (job) => {
  const { type, data } = job.data;
  switch (type) {
    case 'welcome':
      await EmailService.sendWelcomeEmail(data.user);
      break;
    case 'rideConfirmation':
      await EmailService.sendRideConfirmation(data.ride);
      break;
    // Add more email types
  }
});

// Process SMS queue
smsQueue.process(async (job) => {
  const { type, data } = job.data;
  switch (type) {
    case 'verification':
      await SMSService.sendVerificationCode(data.phoneNumber, data.code);
      break;
    case 'rideConfirmation':
      await SMSService.sendRideConfirmation(data.ride);
      break;
    // Add more SMS types
  }
});

// Process reminder queue
reminderQueue.process(async (job) => {
  const { type, data } = job.data;
  switch (type) {
    case '24hrReminder':
      // Handle 24-hour reminder
      break;
    case '1hrReminder':
      // Handle 1-hour reminder
      break;
    case 'processFailedRides':
      // Handle failed rides
      break;
    case 'cleanup':
      // Clean up old records
      break;
  }
});

module.exports = JobService;