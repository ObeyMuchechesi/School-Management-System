const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: String,
  department: String,
  dateOfJoining: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
