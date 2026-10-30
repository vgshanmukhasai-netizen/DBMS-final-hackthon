const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  assignEvent,
} = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public or Authenticated event listing and retrieval
router.get('/', authenticate, getEvents);
router.get('/:id', authenticate, getEventById);

// Protected routes (Admin and Teacher)
router.post('/', authenticate, authorize('admin', 'teacher'), upload.single('poster'), createEvent);
router.put('/:id', authenticate, authorize('admin', 'teacher'), upload.single('poster'), updateEvent);
router.delete('/:id', authenticate, authorize('admin', 'teacher'), deleteEvent);
router.post('/:id/assign', authenticate, authorize('admin', 'teacher'), assignEvent);

module.exports = router;
