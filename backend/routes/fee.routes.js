const router = require('express').Router();
const Fee = require('../models/Fee');
const { protect, authorize } = require('../middleware/auth');
const allowStudentAccess = require('../middleware/studentAccess');

// Only admin/accounts can list all
router.get('/', protect, authorize('admin', 'accounts'), async (req, res) => {
  const fees = await Fee.find().populate('student');
  res.json(fees);
});

// Individual student fees - visible to that student/guardian
router.get('/student/:studentId', protect, allowStudentAccess('studentId', ['admin', 'accounts']), async (req, res) => {
  const studentId = req.params.studentId;
  const fees = await Fee.find({ student: studentId }).sort({ createdAt: -1 });
  res.json(fees);
});

router.post('/', protect, authorize('admin', 'accounts'), async (req, res) => {
  const fee = await Fee.create(req.body);
  res.status(201).json(fee);
});

router.post('/:id/payment', protect, authorize('admin', 'accounts'), async (req, res) => {
  const fee = await Fee.findById(req.params.id);
  if (!fee) return res.status(404).json({ message: 'Fee not found' });
  fee.payments.push({ ...req.body, recordedBy: req.user._id });
  fee.amountPaid += Number(req.body.amount);
  await fee.save();
  res.json(fee);
});

router.put('/:id', protect, authorize('admin', 'accounts'), async (req, res) => {
  const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(fee);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Fee.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
