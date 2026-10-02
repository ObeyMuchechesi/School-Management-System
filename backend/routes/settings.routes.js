const router = require('express').Router();
const Settings = require('../models/Settings');
const BellSchedule = require('../models/BellSchedule');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json(settings);
});

router.put('/', protect, authorize('admin'), async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create(req.body);
  else Object.assign(settings, req.body), await settings.save();
  res.json(settings);
});

router.get('/bell', protect, async (req, res) => {
  const bell = await BellSchedule.findOne({ isActive: true });
  res.json(bell);
});

router.put('/bell', protect, authorize('admin'), async (req, res) => {
  await BellSchedule.updateMany({}, { isActive: false });
  const bell = await BellSchedule.create({ ...req.body, isActive: true });
  res.json(bell);
});

module.exports = router;
