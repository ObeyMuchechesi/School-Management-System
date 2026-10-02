// Run: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Guardian = require('./models/Guardian');
const Class = require('./models/Class');
const Timetable = require('./models/Timetable');
const Notice = require('./models/Notice');
const Exam = require('./models/Exam');
const Fee = require('./models/Fee');
const Settings = require('./models/Settings');
const BellSchedule = require('./models/BellSchedule');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Promise.all([
    User.deleteMany({}), Student.deleteMany({}), Teacher.deleteMany({}),
    Guardian.deleteMany({}), Class.deleteMany({}), Timetable.deleteMany({}),
    Notice.deleteMany({}), Exam.deleteMany({}), Fee.deleteMany({}),
    Settings.deleteMany({}), BellSchedule.deleteMany({})
  ]);

  await Settings.create({
    schoolName: 'Greenfield Academy',
    address: '123 Main St',
    phone: '+1 555 0100',
    email: 'info@greenfield.edu',
    motto: 'Excellence in Learning',
    currentTerm: 'Term 1',
    currentAcademicYear: '2024/2025',
    currency: 'USD',
    gradingScale: [
      { grade: 'A', min: 80, max: 100 },
      { grade: 'B', min: 70, max: 79 },
      { grade: 'C', min: 60, max: 69 },
      { grade: 'D', min: 50, max: 59 },
      { grade: 'F', min: 0, max: 49 }
    ]
  });

  await BellSchedule.create({
    periods: [
      { label: 'Period 1', startTime: '08:00', endTime: '08:45' },
      { label: 'Period 2', startTime: '08:50', endTime: '09:35' },
      { label: 'Break',    startTime: '09:35', endTime: '10:00' },
      { label: 'Period 3', startTime: '10:00', endTime: '10:45' },
      { label: 'Period 4', startTime: '10:50', endTime: '11:35' },
      { label: 'Lunch',    startTime: '11:35', endTime: '12:30' },
      { label: 'Period 5', startTime: '12:30', endTime: '13:15' },
      { label: 'Period 6', startTime: '13:20', endTime: '14:05' }
    ]
  });

  // Admin
  await User.create({ name: 'System Admin', email: 'admin@school.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'Accounts Officer', email: 'accounts@school.com', password: 'accounts123', role: 'accounts' });

  // Teachers
  const t1 = await Teacher.create({ employeeId: 'T001', firstName: 'John', lastName: 'Doe', subjects: ['Math','Science'] });
  const t2 = await Teacher.create({ employeeId: 'T002', firstName: 'Jane', lastName: 'Smith', subjects: ['English','History'] });
  await User.create({ name: 'John Doe', email: 'teacher@school.com', password: 'teacher123', role: 'teacher', teacherProfile: t1._id });
  await User.create({ name: 'Jane Smith', email: 'jane@school.com', password: 'teacher123', role: 'teacher', teacherProfile: t2._id });

  // Classes
  const cls = await Class.create({ name: 'Grade 5A', grade: '5', section: 'A', classTeacher: t1._id, subjects: ['Math','English','Science','History'] });
  t1.classes.push(cls._id); await t1.save();

  // Students
  const s1 = await Student.create({ admissionNumber: 'STU001', firstName: 'Alice', lastName: 'Johnson', grade: '5', section: 'A', class: cls._id, gender: 'female' });
  const s2 = await Student.create({ admissionNumber: 'STU002', firstName: 'Bob', lastName: 'Johnson', grade: '5', section: 'A', class: cls._id, gender: 'male' });
  cls.students.push(s1._id, s2._id); await cls.save();

  // Guardians
  const g1 = await Guardian.create({ firstName: 'Mary', lastName: 'Johnson', relationship: 'mother', children: [s1._id, s2._id], phone: '+1555' });
  s1.guardians.push(g1._id); s2.guardians.push(g1._id); await s1.save(); await s2.save();
  await User.create({ name: 'Mary Johnson', email: 'parent@school.com', password: 'parent123', role: 'guardian', guardianProfile: g1._id });

  // Student user
  await User.create({ name: 'Alice Johnson', email: 'student@school.com', password: 'student123', role: 'student', studentProfile: s1._id });

  // Timetable
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const subjects = ['Math','English','Science','History','Math','English'];
  const slots = [];
  days.forEach(d => {
    subjects.forEach((sub, i) => {
      slots.push({
        day: d, period: i + 1,
        startTime: `${8 + i}:00`, endTime: `${8 + i}:45`,
        subject: sub, teacher: i % 2 === 0 ? t1._id : t2._id, room: 'R101'
      });
    });
  });
  await Timetable.create({ class: cls._id, academicYear: '2024/2025', term: 'Term 1', slots });

  // Notices
  await Notice.create({ title: 'Welcome Back', content: 'New term begins!', audience: ['all'], priority: 'normal' });
  await Notice.create({ title: 'Parent-Teacher Meeting', content: 'Scheduled for next Friday.', audience: ['guardians'], priority: 'high' });

  // Exam
  await Exam.create({
    title: 'Mid-Term Exams', term: 'Term 1', academicYear: '2024/2025',
    startDate: new Date(Date.now() + 7*86400000),
    endDate: new Date(Date.now() + 14*86400000),
    grades: ['5'], published: true,
    schedule: [
      { date: new Date(Date.now() + 7*86400000), startTime: '09:00', endTime: '11:00', subject: 'Math', grade: '5' },
      { date: new Date(Date.now() + 9*86400000), startTime: '09:00', endTime: '11:00', subject: 'English', grade: '5' }
    ]
  });

  // Fees
  await Fee.create({
    student: s1._id, term: 'Term 1', academicYear: '2024/2025',
    feeStructure: [{ item: 'Tuition', amount: 500 }, { item: 'Books', amount: 100 }],
    totalAmount: 600, amountPaid: 300, dueDate: new Date(Date.now() + 30*86400000),
    payments: [{ amount: 300, method: 'cash', reference: 'RCPT001' }]
  });
  await Fee.create({
    student: s2._id, term: 'Term 1', academicYear: '2024/2025',
    feeStructure: [{ item: 'Tuition', amount: 500 }, { item: 'Books', amount: 100 }],
    totalAmount: 600, amountPaid: 0, dueDate: new Date(Date.now() + 30*86400000)
  });

  console.log('Seeded successfully!');
  console.log('Logins:');
  console.log('  admin@school.com / admin123');
  console.log('  accounts@school.com / accounts123');
  console.log('  teacher@school.com / teacher123');
  console.log('  student@school.com / student123');
  console.log('  parent@school.com / parent123');
  process.exit(0);
})();
