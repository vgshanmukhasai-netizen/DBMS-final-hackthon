const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Certificate, Event, Student, Attendance, User, Notification } = require('../models');

// Ensure certificates directory exists
const certDir = path.join(__dirname, '..', 'certificates');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

/**
 * Helper function to generate PDF certificate using PDFKit
 */
const generateCertificatePDF = (filePath, data) => {
  return new Promise((resolve, reject) => {
    try {
      // Landscape A4 (842 x 595)
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      const pageWidth = 842;
      const pageHeight = 595;

      // Outer Decorative Border
      doc
        .rect(20, 20, pageWidth - 40, pageHeight - 40)
        .lineWidth(4)
        .strokeColor('#1e3a8a')
        .stroke();

      // Inner Decorative Border
      doc
        .rect(26, 26, pageWidth - 52, pageHeight - 52)
        .lineWidth(1.5)
        .strokeColor('#d97706')
        .stroke();

      // Background Corner Accents
      const accentSize = 25;
      // Top-Left
      doc.polygon([26, 26], [26 + accentSize, 26], [26, 26 + accentSize]).fill('#1e3a8a');
      // Top-Right
      doc.polygon([pageWidth - 26, 26], [pageWidth - 26 - accentSize, 26], [pageWidth - 26, 26 + accentSize]).fill('#1e3a8a');
      // Bottom-Left
      doc.polygon([26, pageHeight - 26], [26 + accentSize, pageHeight - 26], [26, pageHeight - 26 - accentSize]).fill('#1e3a8a');
      // Bottom-Right
      doc.polygon([pageWidth - 26, pageHeight - 26], [pageWidth - 26 - accentSize, pageHeight - 26], [pageWidth - 26, pageHeight - 26 - accentSize]).fill('#1e3a8a');

      // Title & Header
      doc.moveDown(1.5);
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#1e3a8a')
        .text('UNIVERSITY EVENT MANAGEMENT SYSTEM', { align: 'center', characterSpacing: 1.5 });

      doc.moveDown(0.3);
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#64748b')
        .text('OFFICIAL CERTIFICATE OF PARTICIPATION', { align: 'center', characterSpacing: 3 });

      // Horizontal separator line
      doc.moveDown(0.8);
      const centerX = pageWidth / 2;
      doc
        .moveTo(centerX - 180, doc.y)
        .lineTo(centerX + 180, doc.y)
        .lineWidth(1)
        .strokeColor('#d97706')
        .stroke();

      // Body text
      doc.moveDown(1.2);
      doc
        .font('Helvetica-Oblique')
        .fontSize(14)
        .fillColor('#334155')
        .text('This is proudly presented to', { align: 'center' });

      // Student Name
      doc.moveDown(0.6);
      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor('#1e3a8a')
        .text(data.studentName.toUpperCase(), { align: 'center' });

      // Student Department & ID
      doc.moveDown(0.3);
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#475569')
        .text(`Student ID: ${data.studentId}  |  Department: ${data.department}`, { align: 'center' });

      // Event participation sentence
      doc.moveDown(1.0);
      doc
        .font('Helvetica')
        .fontSize(13)
        .fillColor('#334155')
        .text('for actively participating in and successfully attending the campus event', { align: 'center' });

      // Event Title
      doc.moveDown(0.6);
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#d97706')
        .text(`"${data.eventTitle}"`, { align: 'center' });

      // Event Date & Venue
      doc.moveDown(0.4);
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#475569')
        .text(`Conducted on ${data.eventDate}${data.venue ? ` at ${data.venue}` : ''}`, { align: 'center' });

      // Footer - Certificate ID, Date & Signature
      const footerY = pageHeight - 110;

      // Left: Issue Date and Certificate Code
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#64748b')
        .text(`Certificate No: ${data.certCode}`, 70, footerY);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#64748b')
        .text(`Issued Date: ${data.issuedDate}`, 70, footerY + 16);

      // Right: Signature line
      const sigLineX = pageWidth - 250;
      doc
        .moveTo(sigLineX, footerY + 12)
        .lineTo(sigLineX + 180, footerY + 12)
        .lineWidth(1)
        .strokeColor('#94a3b8')
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#1e3a8a')
        .text(data.issuerName || 'Authorized Signatory', sigLineX, footerY + 18, { width: 180, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#64748b')
        .text('Event Coordinator / Administrator', sigLineX, footerY + 32, { width: 180, align: 'center' });

      doc.end();

      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate certificates for attended students of an event (Admin/Teacher)
 * POST /api/certificates/generate/:eventId
 */
const generateCertificates = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Find all students marked present for this event
    const attendanceRecords = await Attendance.findAll({
      where: {
        event_id: eventId,
        status: 'present',
      },
      include: [
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user' }],
        },
      ],
    });

    if (attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No students marked present for this event. Please mark attendance before generating certificates.',
      });
    }

    const generatedCertificates = [];
    const notificationsToCreate = [];

    for (const record of attendanceRecords) {
      const student = record.student;
      if (!student) continue;

      const certCode = `CERT-EVT${event.id}-STD${student.id}-${Date.now().toString().slice(-6)}`;
      const fileName = `certificate-${event.id}-${student.id}.pdf`;
      const filePath = path.join(certDir, fileName);
      const certificateUrl = `/certificates/${fileName}`;

      // Generate the physical PDF file
      await generateCertificatePDF(filePath, {
        studentName: student.full_name,
        studentId: student.student_id,
        department: student.department,
        eventTitle: event.title,
        eventDate: event.event_date,
        venue: event.venue,
        certCode,
        issuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        issuerName: req.user.email,
      });

      // Find or create Certificate record
      const [certRecord, created] = await Certificate.findOrCreate({
        where: {
          event_id: event.id,
          student_id: student.id,
        },
        defaults: {
          event_id: event.id,
          student_id: student.id,
          certificate_url: certificateUrl,
          issued_at: new Date(),
          issued_by: req.user.id,
        },
      });

      if (!created) {
        certRecord.certificate_url = certificateUrl;
        certRecord.issued_at = new Date();
        certRecord.issued_by = req.user.id;
        await certRecord.save();
      }

      generatedCertificates.push(certRecord);

      // Create notification for student
      notificationsToCreate.push({
        user_id: student.user_id,
        title: 'Event Certificate Issued!',
        message: `Congratulations! Your certificate of participation for "${event.title}" is ready for download.`,
        type: 'certificate',
        reference_id: certRecord.id,
      });
    }

    if (notificationsToCreate.length > 0) {
      await Notification.bulkCreate(notificationsToCreate);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully generated ${generatedCertificates.length} certificate(s) for event "${event.title}".`,
      count: generatedCertificates.length,
      certificates: generatedCertificates,
    });
  } catch (error) {
    console.error('Error in generateCertificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate certificates.',
      error: error.message,
    });
  }
};

/**
 * Get logged-in student's certificates
 * GET /api/certificates/my
 */
const getMyCertificates = async (req, res) => {
  try {
    let student = req.user.studentProfile;
    if (!student) {
      student = await Student.findOne({ where: { user_id: req.user.id } });
    }

    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Student profile required to view certificates.',
      });
    }

    const certificates = await Certificate.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'event_date', 'category', 'venue', 'poster'],
        },
      ],
      order: [['issued_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error('Error in getMyCertificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificates.',
      error: error.message,
    });
  }
};

/**
 * List all certificates for an event (Teacher/Admin)
 * GET /api/certificates/event/:eventId
 */
const getEventCertificates = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const certificates = await Certificate.findAll({
      where: { event_id: eventId },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'full_name', 'student_id', 'department', 'year_of_study', 'section'],
        },
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'email'],
        },
      ],
      order: [['issued_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      eventTitle: event.title,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error('Error in getEventCertificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event certificates.',
      error: error.message,
    });
  }
};

/**
 * Download a certificate PDF
 * GET /api/certificates/download/:id
 */
const downloadCertificate = async (req, res) => {
  try {
    const certificateId = req.params.id;

    const certificate = await Certificate.findByPk(certificateId, {
      include: [
        { model: Event, as: 'event' },
        { model: Student, as: 'student' },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    // Authorization check: student can only download their own certificate
    if (req.user.role === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (!student || certificate.student_id !== student.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only download your own certificate.',
        });
      }
    }

    const fileName = path.basename(certificate.certificate_url);
    const filePath = path.join(certDir, fileName);

    // If file doesn't exist, regenerate on the fly
    if (!fs.existsSync(filePath)) {
      const certCode = `CERT-EVT${certificate.event_id}-STD${certificate.student_id}`;
      await generateCertificatePDF(filePath, {
        studentName: certificate.student ? certificate.student.full_name : 'Student',
        studentId: certificate.student ? certificate.student.student_id : 'N/A',
        department: certificate.student ? certificate.student.department : 'General',
        eventTitle: certificate.event ? certificate.event.title : 'University Event',
        eventDate: certificate.event ? certificate.event.event_date : 'N/A',
        venue: certificate.event ? certificate.event.venue : '',
        certCode,
        issuedDate: new Date(certificate.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        issuerName: 'University Event Administration',
      });
    }

    const downloadFileName = `Certificate-${(certificate.event ? certificate.event.title : 'Event').replace(/[^a-zA-Z0-9]/g, '_')}-${(certificate.student ? certificate.student.full_name : 'Student').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    return res.download(filePath, downloadFileName);
  } catch (error) {
    console.error('Error in downloadCertificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download certificate.',
      error: error.message,
    });
  }
};

module.exports = {
  generateCertificates,
  getMyCertificates,
  getEventCertificates,
  downloadCertificate,
};
