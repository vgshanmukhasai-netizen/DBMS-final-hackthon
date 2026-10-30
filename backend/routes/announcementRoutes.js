const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getMyAnnouncements,
  getAnnouncementById,
  markAsRead,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

// Create announcement (Teacher & Admin)
router.post('/', authenticate, authorize('admin', 'teacher'), createAnnouncement);

// List announcements (Admin & Teacher)
router.get('/', authenticate, getAnnouncements);

// Student views received announcements
router.get('/my', authenticate, authorize('student'), getMyAnnouncements);

// View single announcement
router.get('/:id', authenticate, getAnnouncementById);

// Mark announcement as read (Student)
router.put('/:id/read', authenticate, authorize('student'), markAsRead);

// Delete announcement (Teacher & Admin)
router.delete('/:id', authenticate, authorize('admin', 'teacher'), deleteAnnouncement);

module.exports = router;
