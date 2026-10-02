const router = require('express').Router();
const Guardian = require('../models/Guardian');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'staff'), async (req, res) => {
  const guardians = await Guardian.find().populate('children');
  res.json(guardians);
});

router.get('/me', protect, async (req, res) => {
  if (!req.user.guardianProfile) return res.status(404).json({ message: 'No guardian profile' });
  const guardian = await Guardian.findById(req.user.guardianProfile).populate('children');
  res.json(guardian);
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const guardian = await Guardian.create(req.body);
  res.status(201).json(guardian);
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const guardian = await Guardian.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(guardian);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Guardian.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
