const router = require('express').Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');
const allowStudentAccess = require('../middleware/studentAccess');

// Bulk mark attendance (daily register)
router.post('/bulk', protect, authorize('admin', 'teacher'), async (req, res) => {
  const { classId, date, records } = req.body; // records: [{student, status, remarks}]
  const dateObj = new Date(date);
  dateObj.setHours(0,0,0,0);

  const ops = records.map(r => ({
    updateOne: {
      filter: { student: r.student, date: dateObj },
      update: {
        student: r.student,
        class: classId,
        date: dateObj,
        status: r.status,
        remarks: r.remarks,
        markedBy: req.user.teacherProfile
      },
      upsert: true
    }
  }));
  await Attendance.bulkWrite(ops);
  res.json({ message: 'Attendance recorded' });
});

// Get by class and date
router.get('/class/:classId', protect, authorize('admin', 'teacher'), async (req, res) => {
  const { date } = req.query;
  const dateObj = new Date(date);
  dateObj.setHours(0,0,0,0);
  const next = new Date(dateObj); next.setDate(next.getDate() + 1);

  const records = await Attendance.find({
    class: req.params.classId,
    date: { $gte: dateObj, $lt: next }
  }).populate('student');
  res.json(records);
});

// Get attendance for a student
router.get('/student/:studentId', protect, allowStudentAccess('studentId', ['admin', 'teacher']), async (req, res) => {
  const studentId = req.params.studentId;
  const records = await Attendance.find({ student: studentId }).sort({ date: -1 });
  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const attendanceRate = total ? Math.round((present / total) * 100) : 0;
  res.json({ records, stats: { total, present, attendanceRate } });
});

module.exports = router;
