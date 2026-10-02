const router = require('express').Router();
const Teacher = require('../models/Teacher');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'staff'), async (req, res) => {
  const teachers = await Teacher.find().populate('classes');
  res.json(teachers);
});

router.get('/me', protect, async (req, res) => {
  if (!req.user.teacherProfile) return res.status(404).json({ message: 'No teacher profile' });
  const teacher = await Teacher.findById(req.user.teacherProfile).populate('classes');
  res.json(teacher);
});

router.get('/:id', protect, authorize('admin', 'teacher', 'staff'), async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  res.json(teacher);
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const teacher = await Teacher.create(req.body);
  res.status(201).json(teacher);
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(teacher);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Teacher.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
