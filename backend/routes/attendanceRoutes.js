const express = require('express');
const router = express.Router();
const {
  getEventAttendance,
  markBulkAttendance,
  updateAttendance,
  getStudentAttendance,
} = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

// Get attendance list for an event (Admin & Teacher)
router.get('/event/:eventId', authenticate, authorize('admin', 'teacher'), getEventAttendance);

// Mark bulk attendance for an event (Admin & Teacher)
router.post('/event/:eventId', authenticate, authorize('admin', 'teacher'), markBulkAttendance);

// Update single attendance record (Admin & Teacher)
router.put('/:id', authenticate, authorize('admin', 'teacher'), updateAttendance);

// Get student attendance history
router.get('/student/:studentId', authenticate, getStudentAttendance);

module.exports = router;
