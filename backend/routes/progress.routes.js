const router = require('express').Router();
const ProgressReport = require('../models/ProgressReport');
const { protect, authorize } = require('../middleware/auth');
const allowStudentAccess = require('../middleware/studentAccess');

router.get('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  const reports = await ProgressReport.find().populate('student');
  res.json(reports);
});

router.get('/student/:studentId', protect, allowStudentAccess('studentId', ['admin', 'teacher']), async (req, res) => {
  const studentId = req.params.studentId;
  const reports = await ProgressReport.find({ student: studentId, published: true }).sort({ createdAt: -1 });
  res.json(reports);
});

router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  const report = await ProgressReport.create(req.body);
  res.status(201).json(report);
});

router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  const report = await ProgressReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(report);
});

module.exports = router;
