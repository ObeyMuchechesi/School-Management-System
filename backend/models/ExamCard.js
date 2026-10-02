const mongoose = require('mongoose');

const examCardSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  subjects: [{
    subject: String,
    score: Number,
    grade: String,
    remarks: String,
  }],
  totalScore: Number,
  average: Number,
  position: Number,
  teacherRemarks: String,
  principalRemarks: String,
  published: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ExamCard', examCardSchema);
