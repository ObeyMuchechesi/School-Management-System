const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  relationship: { type: String, enum: ['father', 'mother', 'guardian', 'other'] },
  phone: String,
  occupation: String,
  address: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

module.exports = mongoose.model('Guardian', guardianSchema);
