const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  term: String,
  academicYear: String,
  startDate: Date,
  endDate: Date,
  grades: [String],
  schedule: [{
    date: Date,
    startTime: String,
    endTime: String,
    subject: String,
    grade: String,
    room: String,
  }],
  published: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
