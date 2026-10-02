const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['cash', 'bank_transfer', 'card', 'mobile'] },
  reference: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
});

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  term: { type: String, required: true },
  academicYear: { type: String, required: true },
  feeStructure: [{
    item: String,
    amount: Number,
  }],
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'partial', 'unpaid'], default: 'unpaid' },
  dueDate: Date,
  payments: [feePaymentSchema],
}, { timestamps: true });

feeSchema.pre('save', function(next) {
  this.balance = this.totalAmount - this.amountPaid;
  if (this.balance <= 0) this.status = 'paid';
  else if (this.amountPaid > 0) this.status = 'partial';
  else this.status = 'unpaid';
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
