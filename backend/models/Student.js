const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  admissionNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  grade: { type: String, required: true },
  section: String,
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  guardians: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guardian' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enrollmentDate: { type: Date, default: Date.now },
  photo: String,
  bloodGroup: String,
  medicalNotes: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
