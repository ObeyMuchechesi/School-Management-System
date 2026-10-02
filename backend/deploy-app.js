const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const guardianRoutes = require('./routes/guardian.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const timetableRoutes = require('./routes/timetable.routes');
const feeRoutes = require('./routes/fee.routes');
const examRoutes = require('./routes/exam.routes');
const noticeRoutes = require('./routes/notice.routes');
const progressRoutes = require('./routes/progress.routes');
const settingsRoutes = require('./routes/settings.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/guardians', guardianRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => res.json({ message: 'School Management API running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

module.exports = app;
