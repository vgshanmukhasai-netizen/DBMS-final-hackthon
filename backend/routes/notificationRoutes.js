const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Get all notifications for logged-in user
router.get('/', authenticate, getMyNotifications);

// Get unread notification count
router.get('/unread-count', authenticate, getUnreadCount);

// Mark all notifications as read
router.put('/read-all', authenticate, markAllAsRead);

// Mark a specific notification as read
router.put('/:id/read', authenticate, markAsRead);

module.exports = router;
