const router = require('express').Router();
const Timetable = require('../models/Timetable');
const Student = require('../models/Student');
const Guardian = require('../models/Guardian');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const timetables = await Timetable.find().populate('class').populate('slots.teacher');
  res.json(timetables);
});

router.get('/class/:classId', protect, async (req, res) => {
  const tt = await Timetable.findOne({ class: req.params.classId }).populate('slots.teacher');
  res.json(tt);
});

router.get('/student/:studentId', protect, async (req, res) => {
  const studentId = req.params.studentId;
  if (req.user.role === 'student' && req.user.studentProfile?.toString() !== studentId)
    return res.status(403).json({ message: 'Access denied' });
  if (req.user.role === 'guardian') {
    const g = await Guardian.findById(req.user.guardianProfile);
    if (!g.children.map(String).includes(studentId))
      return res.status(403).json({ message: 'Access denied' });
  }
  const student = await Student.findById(studentId);
  const tt = await Timetable.findOne({ class: student.class }).populate('slots.teacher');
  res.json(tt);
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const tt = await Timetable.create(req.body);
  res.status(201).json(tt);
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const tt = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(tt);
});

module.exports = router;
