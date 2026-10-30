const express = require('express');
const router = express.Router();
const {
  registerEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
  deleteRegistration,
} = require('../controllers/registrationController');
const { authenticate, authorize } = require('../middleware/auth');

// Student registers for event
router.post('/', authenticate, authorize('student'), registerEvent);

// Student views own registrations
router.get('/my', authenticate, authorize('student'), getMyRegistrations);

// Admin / Teacher views registrations for a specific event
router.get('/event/:eventId', authenticate, authorize('admin', 'teacher'), getEventRegistrations);

// Cancel registration (student for own, or admin)
router.put('/:id/cancel', authenticate, cancelRegistration);

// Delete registration (admin / teacher)
router.delete('/:id', authenticate, authorize('admin', 'teacher'), deleteRegistration);

module.exports = router;
