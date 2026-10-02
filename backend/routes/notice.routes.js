const router = require('express').Router();
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const { audience } = req.query;
  const query = audience ? { audience: { $in: ['all', audience] } } : {};
  const notices = await Notice.find(query).populate('postedBy', 'name role').sort({ createdAt: -1 });
  res.json(notices);
});

router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  const notice = await Notice.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json(notice);
});

router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(notice);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
