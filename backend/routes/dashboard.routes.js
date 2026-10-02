const router = require('express').Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Guardian = require('../models/Guardian');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Notice = require('../models/Notice');
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('admin'), async (req, res) => {
  const [students, teachers, guardians, notices, exams] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Teacher.countDocuments({ isActive: true }),
    Guardian.countDocuments(),
    Notice.find().sort({ createdAt: -1 }).limit(5),
    Exam.find({ endDate: { $gte: new Date() } }).limit(5),
  ]);

  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const todayAttendance = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });

  const fees = await Fee.find();
  const totalBilled = fees.reduce((s, f) => s + f.totalAmount, 0);
  const totalCollected = fees.reduce((s, f) => s + f.amountPaid, 0);

  res.json({
    counts: { students, teachers, guardians },
    attendance: {
      present: todayAttendance.filter(a => a.status === 'present').length,
      absent: todayAttendance.filter(a => a.status === 'absent').length,
      total: todayAttendance.length
    },
    finances: { totalBilled, totalCollected, outstanding: totalBilled - totalCollected },
    notices, exams
  });
});

router.get('/teacher', protect, authorize('teacher'), async (req, res) => {
  const teacher = await Teacher.findById(req.user.teacherProfile).populate('classes');
  const notices = await Notice.find({ audience: { $in: ['all', 'teachers'] } }).limit(5);
  const exams = await Exam.find({ endDate: { $gte: new Date() } }).limit(5);
  res.json({ teacher, notices, exams });
});

router.get('/student', protect, authorize('student'), async (req, res) => {
  const student = await Student.findById(req.user.studentProfile).populate('class');
  if (!student) return res.json({});
  const notices = await Notice.find({ audience: { $in: ['all', 'students'] } }).limit(5);
  const exams = await Exam.find({ endDate: { $gte: new Date() } }).limit(5);
  const attendance = await Attendance.find({ student: student._id }).sort({ date: -1 }).limit(30);
  res.json({ student, notices, exams, attendance });
});

router.get('/guardian', protect, authorize('guardian'), async (req, res) => {
  const guardian = await Guardian.findById(req.user.guardianProfile).populate('children');
  const notices = await Notice.find({ audience: { $in: ['all', 'guardians'] } }).limit(5);
  const exams = await Exam.find({ endDate: { $gte: new Date() } }).limit(5);
  res.json({ guardian, notices, exams });
});

module.exports = router;
