const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  subjects: [String],
  qualification: String,
  dateOfJoining: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  phone: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
