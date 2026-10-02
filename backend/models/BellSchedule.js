const mongoose = require('mongoose');

const bellScheduleSchema = new mongoose.Schema({
  name: { type: String, default: 'Default Bell Schedule' },
  periods: [{
    label: String,
    startTime: String,
    endTime: String,
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('BellSchedule', bellScheduleSchema);
