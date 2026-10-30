const express = require('express');
const router = express.Router();
const { registerStudent, registerTeacher, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register/student', registerStudent);
router.post('/register/teacher', registerTeacher);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);

module.exports = router;
