const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  term: String,
  academicYear: String,
  subjects: [{
    subject: String,
    score: Number,
    grade: String,
    teacherComment: String,
  }],
  overallGrade: String,
  conduct: String,
  attendanceRate: Number,
  classTeacherComment: String,
  published: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ProgressReport', progressSchema);
