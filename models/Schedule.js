const mongoose = require('mongoose');
const moment = require('moment');

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'unavailable'],
    default: 'available'
  },
  maxRiders: {
    type: Number,
    default: 1
  },
  currentRiders: {
    type: Number,
    default: 0
  },
  riderIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const scheduleSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availabilityBlocks: [{
    date: {
      type: Date,
      required: true
    },
    timeSlots: [timeSlotSchema]
  }],
  recurringAvailability: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    maxRiders: {
      type: Number,
      default: 1
    }
  }],
  preferences: {
    maxDistance: {
      type: Number,
      default: 20 // in miles
    },
    preferredAreas: [String],
    multipleRiders: {
      type: Boolean,
      default: false
    },
    accessibilityOptions: [{
      type: String,
      enum: ['wheelchair', 'elderly', 'childSeat', 'other']
    }]
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to check availability
scheduleSchema.methods.checkAvailability = async function(date, time) {
  const targetDate = moment(date).startOf('day');
  const targetTime = moment(time, 'HH:mm');
  
  // Check one-time availability
  const daySchedule = this.availabilityBlocks.find(block => 
    moment(block.date).isSame(targetDate, 'day')
  );
  
  if (daySchedule) {
    return daySchedule.timeSlots.find(slot => 
      moment(slot.startTime, 'HH:mm').isSameOrBefore(targetTime) &&
      moment(slot.endTime, 'HH:mm').isSameOrAfter(targetTime) &&
      slot.status === 'available' &&
      slot.currentRiders < slot.maxRiders
    );
  }
  
  // Check recurring availability
  const dayOfWeek = targetDate.day();
  const recurringSlot = this.recurringAvailability.find(slot =>
    slot.dayOfWeek === dayOfWeek &&
    moment(slot.startTime, 'HH:mm').isSameOrBefore(targetTime) &&
    moment(slot.endTime, 'HH:mm').isSameOrAfter(targetTime)
  );
  
  return recurringSlot;
};

// Method to book a time slot
scheduleSchema.methods.bookTimeSlot = async function(date, time, riderId) {
  const slot = await this.checkAvailability(date, time);
  if (!slot) throw new Error('Time slot not available');
  
  slot.currentRiders += 1;
  slot.riderIds.push(riderId);
  
  if (slot.currentRiders >= slot.maxRiders) {
    slot.status = 'booked';
  }
  
  await this.save();
  return slot;
};

module.exports = mongoose.model('Schedule', scheduleSchema);