const express = require('express');
const router = express.Router();
const {
  generateCertificates,
  getMyCertificates,
  getEventCertificates,
  downloadCertificate,
} = require('../controllers/certificateController');
const { authenticate, authorize } = require('../middleware/auth');

// Generate certificates for event participants (Admin & Teacher)
router.post('/generate/:eventId', authenticate, authorize('admin', 'teacher'), generateCertificates);

// Student gets their own certificates
router.get('/my', authenticate, authorize('student'), getMyCertificates);

// Download certificate PDF (Authenticated)
router.get('/download/:id', authenticate, downloadCertificate);

// List certificates issued for an event (Admin & Teacher)
router.get('/event/:eventId', authenticate, authorize('admin', 'teacher'), getEventCertificates);

module.exports = router;
