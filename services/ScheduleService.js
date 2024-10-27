// services/ScheduleService.js
const Schedule = require('../models/Schedule');
const moment = require('moment');

class ScheduleService {
  // Find available drivers
  static async findAvailableDrivers(date, time, location, requirements = {}) {
    const targetDate = moment(date).startOf('day');
    
    try {
      const query = {
        active: true,
        $or: [
          {
            'availabilityBlocks.date': targetDate.toDate(),
            'availabilityBlocks.timeSlots.status': 'available'
          },
          {
            'recurringAvailability.dayOfWeek': targetDate.day()
          }
        ]
      };

      // Add accessibility requirements if specified
      if (requirements.accessibility) {
        query['preferences.accessibilityOptions'] = requirements.accessibility;
      }

      const availableSchedules = await Schedule.find(query)
        .populate('driverId', 'firstName lastName phoneNumber rating')
        .lean();

      return availableSchedules.filter(schedule => {
        const isAvailable = this.checkTimeAvailability(schedule, date, time);
        const isWithinRange = this.checkDistance(schedule, location);
        return isAvailable && isWithinRange;
      });
    } catch (error) {
      throw new Error(`Error finding available drivers: ${error.message}`);
    }
  }

  // Book a ride
  static async bookRide(scheduleId, riderId, date, time) {
    try {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      const bookedSlot = await schedule.bookTimeSlot(date, time, riderId);
      return bookedSlot;
    } catch (error) {
      throw new Error(`Error booking ride: ${error.message}`);
    }
  }

  // Cancel a ride
  static async cancelRide(scheduleId, riderId, date, time) {
    try {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      const updated = await this.removeRiderFromTimeSlot(schedule, riderId, date, time);
      return updated;
    } catch (error) {
      throw new Error(`Error canceling ride: ${error.message}`);
    }
  }

  // Helper methods
  static checkTimeAvailability(schedule, date, time) {
    const targetTime = moment(time, 'HH:mm');
    
    // Check one-time availability first
    const daySchedule = schedule.availabilityBlocks.find(block => 
      moment(block.date).isSame(moment(date), 'day')
    );

    if (daySchedule) {
      return daySchedule.timeSlots.some(slot => 
        moment(slot.startTime, 'HH:mm').isSameOrBefore(targetTime) &&
        moment(slot.endTime, 'HH:mm').isSameOrAfter(targetTime) &&
        slot.status === 'available'
      );
    }

    // Check recurring availability
    return schedule.recurringAvailability.some(slot =>
      slot.dayOfWeek === moment(date).day() &&
      moment(slot.startTime, 'HH:mm').isSameOrBefore(targetTime) &&
      moment(slot.endTime, 'HH:mm').isSameOrAfter(targetTime)
    );
  }

  static checkDistance(schedule, location) {
    return this.calculateDistance(schedule.driverId.location, location) <= schedule.preferences.maxDistance;
  }

  static calculateDistance(point1, point2) {
    // Implement actual distance calculation using geocoding service
    // This is a placeholder - you'd want to use something like Google Maps Distance Matrix API
    return 5; // Returns placeholder distance in miles
  }
}

module.exports = ScheduleService;

// services/AuthService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthService {
  static async registerUser(userData) {
    try {
      const { email, password, firstName, lastName, phoneNumber, role } = userData;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role
      });

      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      throw new Error(`Registration error: ${error.message}`);
    }
  }

  static async loginUser(email, password) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      throw new Error(`Login error: ${error.message}`);
    }
  }

  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = AuthService;

// services/RiderService.js
class RiderService {
  static async getUpcomingRides(riderId) {
    try {
      const schedules = await Schedule.find({
        'availabilityBlocks.timeSlots.riderIds': riderId
      }).populate('driverId', 'firstName lastName phoneNumber');

      return this.formatUpcomingRides(schedules, riderId);
    } catch (error) {
      throw new Error(`Error fetching upcoming rides: ${error.message}`);
    }
  }

  static formatUpcomingRides(schedules, riderId) {
    return schedules.flatMap(schedule => {
      return schedule.availabilityBlocks.flatMap(block => {
        return block.timeSlots
          .filter(slot => slot.riderIds.includes(riderId))
          .map(slot => ({
            date: block.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            driver: {
              id: schedule.driverId._id,
              name: `${schedule.driverId.firstName} ${schedule.driverId.lastName}`,
              phone: schedule.driverId.phoneNumber
            },
            scheduleId: schedule._id
          }));
      });
    });
  }
}

module.exports = RiderService;

// services/index.js
module.exports = {
  ScheduleService: require('./ScheduleService'),
  AuthService: require('./AuthService'),
  RiderService: require('./RiderService')
};