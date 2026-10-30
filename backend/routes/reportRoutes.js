const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getEventAnalytics,
  getRegistrationAnalytics,
  getAttendanceAnalytics,
  getDepartmentStats,
} = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

// Dashboard overview stats (Admin & Teacher)
router.get('/dashboard', authenticate, authorize('admin', 'teacher'), getDashboardStats);

// Event analytics (Admin & Teacher)
router.get('/events', authenticate, authorize('admin', 'teacher'), getEventAnalytics);

// Registration analytics (Admin & Teacher)
router.get('/registrations', authenticate, authorize('admin', 'teacher'), getRegistrationAnalytics);

// Attendance analytics (Admin & Teacher)
router.get('/attendance', authenticate, authorize('admin', 'teacher'), getAttendanceAnalytics);

// Department-wise stats (Admin & Teacher)
router.get('/departments', authenticate, authorize('admin', 'teacher'), getDepartmentStats);

module.exports = router;
