const express = require('express');
const router = express.Router();
const {
  getUsers,
  getStudents,
  getTeachers,
  approveTeacher,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// List all students (Admin and Teachers)
router.get('/students', authenticate, authorize('admin', 'teacher'), getStudents);

// List all teachers (Admin only)
router.get('/teachers', authenticate, authorize('admin'), getTeachers);

// List all users (Admin only)
router.get('/', authenticate, authorize('admin'), getUsers);

// Approve teacher account (Admin only)
router.put('/:id/approve', authenticate, authorize('admin'), approveTeacher);

// Update user details (Admin only)
router.put('/:id', authenticate, authorize('admin'), updateUser);

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
