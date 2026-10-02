const router = require('express').Router();
const Exam = require('../models/Exam');
const ExamCard = require('../models/ExamCard');
const { protect, authorize } = require('../middleware/auth');
const allowStudentAccess = require('../middleware/studentAccess');

// Upcoming exams - public to logged-in users
router.get('/upcoming', protect, async (req, res) => {
  const exams = await Exam.find({ endDate: { $gte: new Date() } }).sort({ startDate: 1 });
  res.json(exams);
});

router.get('/', protect, async (req, res) => {
  const exams = await Exam.find().sort({ startDate: -1 });
  res.json(exams);
});

router.get('/:id', protect, async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  res.json(exam);
});

router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  const exam = await Exam.create(req.body);
  res.status(201).json(exam);
});

router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(exam);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Exam.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Exam Cards
router.get('/cards/student/:studentId', protect, allowStudentAccess('studentId', ['admin', 'teacher']), async (req, res) => {
  const studentId = req.params.studentId;
  const cards = await ExamCard.find({ student: studentId, published: true }).populate('exam');
  res.json(cards);
});

router.post('/cards', protect, authorize('admin', 'teacher'), async (req, res) => {
  const card = await ExamCard.create(req.body);
  res.status(201).json(card);
});

router.put('/cards/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  const card = await ExamCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(card);
});

module.exports = router;
