const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  schoolName: { type: String, default: 'My School' },
  schoolLogo: String,
  address: String,
  phone: String,
  email: String,
  motto: String,
  currentTerm: String,
  currentAcademicYear: String,
  gradingScale: [{
    grade: String,
    min: Number,
    max: Number,
  }],
  currency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'Africa/Harare' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
