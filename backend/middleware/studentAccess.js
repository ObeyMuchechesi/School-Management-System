const Guardian = require('../models/Guardian');

const allowStudentAccess = (paramName, privilegedRoles = []) => async (req, res, next) => {
  try {
    const studentId = req.params[paramName];

    if (privilegedRoles.includes(req.user.role)) return next();

    if (req.user.role === 'student' && req.user.studentProfile?.toString() === studentId) {
      return next();
    }

    if (req.user.role === 'guardian' && req.user.guardianProfile) {
      const guardian = await Guardian.findById(req.user.guardianProfile).select('children');
      if (guardian?.children?.some(child => child.toString() === studentId)) return next();
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (err) {
    next(err);
  }
};

module.exports = allowStudentAccess;
