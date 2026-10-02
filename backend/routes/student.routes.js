const router = require('express').Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');
const allowStudentAccess = require('../middleware/studentAccess');

router.get('/', protect, authorize('admin', 'teacher', 'staff'), async (req, res) => {
  const students = await Student.find().populate('guardians').populate('class');
  res.json(students);
});

router.get('/me', protect, async (req, res) => {
  if (!req.user.studentProfile) return res.status(404).json({ message: 'No student profile' });
  const student = await Student.findById(req.user.studentProfile).populate('guardians').populate('class');
  res.json(student);
});

router.get('/:id', protect, allowStudentAccess('id', ['admin', 'teacher', 'staff']), async (req, res) => {
  const student = await Student.findById(req.params.id).populate('guardians').populate('class');
  if (!student) return res.status(404).json({ message: 'Not found' });
  res.json(student);
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(student);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
