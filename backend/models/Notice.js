const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  audience: {
    type: [String],
    enum: ['all', 'students', 'teachers', 'guardians', 'staff'],
    default: ['all']
  },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attachments: [String],
  expiresAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
