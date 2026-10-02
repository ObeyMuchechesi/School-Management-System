const mongoose = require('mongoose');

const timetableSlotSchema = new mongoose.Schema({
  day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
  period: Number,
  startTime: String,
  endTime: String,
  subject: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  room: String,
});

const timetableSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  academicYear: String,
  term: String,
  slots: [timetableSlotSchema],
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
