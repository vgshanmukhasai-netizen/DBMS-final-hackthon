const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const PDFDocument = require('pdfkit');

const { initDB, sequelize } = require('./config/db');
const {
  User,
  Student,
  Teacher,
  Event,
  Registration,
  Attendance,
  Announcement,
  AnnouncementRecipient,
  Notification,
  Certificate,
} = require('./models');

// Helper to generate sample PDF certificate
const createSampleCertificate = (filePath, studentName, studentId, department, eventTitle, eventDate, certCode) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      const pageWidth = 842;
      const pageHeight = 595;

      // Decorative borders
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(4).strokeColor('#1e3a8a').stroke();
      doc.rect(26, 26, pageWidth - 52, pageHeight - 52).lineWidth(1.5).strokeColor('#d97706').stroke();

      // Accents
      const accent = 25;
      doc.polygon([26, 26], [26 + accent, 26], [26, 26 + accent]).fill('#1e3a8a');
      doc.polygon([pageWidth - 26, 26], [pageWidth - 26 - accent, 26], [pageWidth - 26, 26 + accent]).fill('#1e3a8a');
      doc.polygon([26, pageHeight - 26], [26 + accent, pageHeight - 26], [26, pageHeight - 26 - accent]).fill('#1e3a8a');
      doc.polygon([pageWidth - 26, pageHeight - 26], [pageWidth - 26 - accent, pageHeight - 26], [pageWidth - 26, pageHeight - 26 - accent]).fill('#1e3a8a');

      doc.moveDown(1.5);
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#1e3a8a').text('UNIVERSITY EVENT MANAGEMENT SYSTEM', { align: 'center', characterSpacing: 1.5 });
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(12).fillColor('#64748b').text('OFFICIAL CERTIFICATE OF PARTICIPATION', { align: 'center', characterSpacing: 3 });

      doc.moveDown(1.2);
      doc.font('Helvetica-Oblique').fontSize(14).fillColor('#334155').text('This is proudly presented to', { align: 'center' });

      doc.moveDown(0.6);
      doc.font('Helvetica-Bold').fontSize(28).fillColor('#1e3a8a').text(studentName.toUpperCase(), { align: 'center' });

      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(12).fillColor('#475569').text(`Student ID: ${studentId}  |  Department: ${department}`, { align: 'center' });

      doc.moveDown(1.0);
      doc.font('Helvetica').fontSize(13).fillColor('#334155').text('for actively participating in and successfully attending the campus event', { align: 'center' });

      doc.moveDown(0.6);
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#d97706').text(`"${eventTitle}"`, { align: 'center' });

      doc.moveDown(0.4);
      doc.font('Helvetica').fontSize(12).fillColor('#475569').text(`Conducted on ${eventDate}`, { align: 'center' });

      const footerY = pageHeight - 110;
      doc.font('Helvetica').fontSize(10).fillColor('#64748b').text(`Certificate No: ${certCode}`, 70, footerY);
      doc.font('Helvetica').fontSize(10).fillColor('#64748b').text(`Issued Date: ${new Date().toLocaleDateString()}`, 70, footerY + 16);

      const sigLineX = pageWidth - 250;
      doc.moveTo(sigLineX, footerY + 12).lineTo(sigLineX + 180, footerY + 12).lineWidth(1).strokeColor('#94a3b8').stroke();
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e3a8a').text('Authorized Signatory', sigLineX, footerY + 18, { width: 180, align: 'center' });
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text('Dean of Student Affairs', sigLineX, footerY + 32, { width: 180, align: 'center' });

      doc.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

const seedDatabase = async () => {
  try {
    console.log('[Seed] Initializing database connection...');
    await initDB();
    await sequelize.sync({ force: true }); // Reset schema for clean seed
    console.log('[Seed] Database schema synchronized.');

    // Ensure folders exist
    const certDir = path.join(__dirname, 'certificates');
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 1. Create Administrator (email: admin@university.com, password: admin123)
    console.log('[Seed] Creating Administrator account...');
    const adminUser = await User.create({
      email: 'admin@university.com',
      password: 'admin123',
      role: 'admin',
      is_approved: true,
    });

    // 2. Create Faculty Teachers
    console.log('[Seed] Creating Teachers...');
    const teacher1User = await User.create({
      email: 'teacher1@university.com',
      password: 'teacher123',
      role: 'teacher',
      is_approved: true,
    });
    const teacher1 = await Teacher.create({
      user_id: teacher1User.id,
      full_name: 'Dr. Alan Turing',
      faculty_id: 'FAC-CSE-001',
      department: 'Computer Science',
      designation: 'Professor & HOD',
    });

    const teacher2User = await User.create({
      email: 'teacher2@university.com',
      password: 'teacher123',
      role: 'teacher',
      is_approved: true,
    });
    const teacher2 = await Teacher.create({
      user_id: teacher2User.id,
      full_name: 'Dr. Grace Hopper',
      faculty_id: 'FAC-ECE-002',
      department: 'Electronics & Communication',
      designation: 'Associate Professor',
    });

    // Pending teacher for approval testing
    const teacher3User = await User.create({
      email: 'teacher3@university.com',
      password: 'teacher123',
      role: 'teacher',
      is_approved: false, // Pending
    });
    await Teacher.create({
      user_id: teacher3User.id,
      full_name: 'Dr. John von Neumann',
      faculty_id: 'FAC-MECH-003',
      department: 'Mechanical Engineering',
      designation: 'Assistant Professor',
    });

    // 3. Create Students
    console.log('[Seed] Creating Students...');
    const student1User = await User.create({
      email: 'alice@student.university.com',
      password: 'student123',
      role: 'student',
      is_approved: true,
    });
    const student1 = await Student.create({
      user_id: student1User.id,
      full_name: 'Alice Johnson',
      student_id: 'STD-2023-CSE-01',
      department: 'Computer Science',
      year_of_study: 3,
      section: 'A',
    });

    const student2User = await User.create({
      email: 'bob@student.university.com',
      password: 'student123',
      role: 'student',
      is_approved: true,
    });
    const student2 = await Student.create({
      user_id: student2User.id,
      full_name: 'Bob Smith',
      student_id: 'STD-2023-CSE-02',
      department: 'Computer Science',
      year_of_study: 3,
      section: 'A',
    });

    const student3User = await User.create({
      email: 'charlie@student.university.com',
      password: 'student123',
      role: 'student',
      is_approved: true,
    });
    const student3 = await Student.create({
      user_id: student3User.id,
      full_name: 'Charlie Brown',
      student_id: 'STD-2022-ECE-01',
      department: 'Electronics & Communication',
      year_of_study: 4,
      section: 'B',
    });

    const student4User = await User.create({
      email: 'diana@student.university.com',
      password: 'student123',
      role: 'student',
      is_approved: true,
    });
    const student4 = await Student.create({
      user_id: student4User.id,
      full_name: 'Diana Prince',
      student_id: 'STD-2024-MECH-01',
      department: 'Mechanical Engineering',
      year_of_study: 2,
      section: 'A',
    });

    // 4. Create Events
    console.log('[Seed] Creating Events...');
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 14);
    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 25);
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 10);

    const event1 = await Event.create({
      title: 'Annual University Hackathon 2026',
      description: 'A 24-hour hackathon bringing together students across engineering branches to solve real-world sustainability and healthcare challenges.',
      category: 'Technical',
      event_date: futureDate1.toISOString().split('T')[0],
      start_time: '09:00:00',
      end_time: '18:00:00',
      venue: 'Main Campus Innovation Hub',
      max_participants: 120,
      registration_deadline: futureDate1.toISOString().split('T')[0],
      poster: null,
      status: 'upcoming',
      created_by: teacher1User.id,
    });

    const event2 = await Event.create({
      title: 'National AI & Robotics Symposium',
      description: 'Hands-on workshop and technical keynote sessions by industry leaders on generative AI, autonomous robotics, and edge computing.',
      category: 'Workshop',
      event_date: futureDate2.toISOString().split('T')[0],
      start_time: '10:00:00',
      end_time: '16:00:00',
      venue: 'Auditorium 2, Electronics Block',
      max_participants: 100,
      registration_deadline: futureDate2.toISOString().split('T')[0],
      poster: null,
      status: 'upcoming',
      created_by: teacher2User.id,
    });

    const event3 = await Event.create({
      title: 'Annual Cultural Fest - Tarang 2026',
      description: 'Inter-department music, dance, and drama competitions showcasing diverse talent across campus.',
      category: 'Cultural',
      event_date: pastDate.toISOString().split('T')[0],
      start_time: '17:00:00',
      end_time: '22:00:00',
      venue: 'Open Air Amphitheatre',
      max_participants: 300,
      registration_deadline: pastDate.toISOString().split('T')[0],
      poster: null,
      status: 'completed',
      created_by: adminUser.id,
    });

    // 5. Create Registrations
    console.log('[Seed] Creating Registrations...');
    // Alice & Bob registered for upcoming Hackathon
    await Registration.create({
      event_id: event1.id,
      student_id: student1.id,
      status: 'registered',
      registered_at: new Date(),
    });
    await Registration.create({
      event_id: event1.id,
      student_id: student2.id,
      status: 'registered',
      registered_at: new Date(),
    });

    // Alice, Bob, Charlie registered for past event (Cultural Fest)
    await Registration.create({
      event_id: event3.id,
      student_id: student1.id,
      status: 'attended',
      registered_at: pastDate,
    });
    await Registration.create({
      event_id: event3.id,
      student_id: student2.id,
      status: 'attended',
      registered_at: pastDate,
    });
    await Registration.create({
      event_id: event3.id,
      student_id: student3.id,
      status: 'registered',
      registered_at: pastDate,
    });

    // 6. Create Attendance for completed event
    console.log('[Seed] Recording Attendance...');
    await Attendance.create({
      event_id: event3.id,
      student_id: student1.id,
      status: 'present',
      marked_at: pastDate,
      marked_by: adminUser.id,
    });
    await Attendance.create({
      event_id: event3.id,
      student_id: student2.id,
      status: 'present',
      marked_at: pastDate,
      marked_by: adminUser.id,
    });
    await Attendance.create({
      event_id: event3.id,
      student_id: student3.id,
      status: 'absent',
      marked_at: pastDate,
      marked_by: adminUser.id,
    });

    // 7. Generate Certificates for attendees (Alice & Bob)
    console.log('[Seed] Generating Certificates...');
    const cert1Code = `CERT-EVT${event3.id}-STD${student1.id}-001`;
    const cert1File = path.join(certDir, `certificate-${event3.id}-${student1.id}.pdf`);
    await createSampleCertificate(
      cert1File,
      student1.full_name,
      student1.student_id,
      student1.department,
      event3.title,
      event3.event_date,
      cert1Code
    );
    await Certificate.create({
      event_id: event3.id,
      student_id: student1.id,
      certificate_url: `/certificates/certificate-${event3.id}-${student1.id}.pdf`,
      issued_at: new Date(),
      issued_by: adminUser.id,
    });

    const cert2Code = `CERT-EVT${event3.id}-STD${student2.id}-002`;
    const cert2File = path.join(certDir, `certificate-${event3.id}-${student2.id}.pdf`);
    await createSampleCertificate(
      cert2File,
      student2.full_name,
      student2.student_id,
      student2.department,
      event3.title,
      event3.event_date,
      cert2Code
    );
    await Certificate.create({
      event_id: event3.id,
      student_id: student2.id,
      certificate_url: `/certificates/certificate-${event3.id}-${student2.id}.pdf`,
      issued_at: new Date(),
      issued_by: adminUser.id,
    });

    // 8. Create Announcements
    console.log('[Seed] Creating Announcements & Recipients...');
    const announcement1 = await Announcement.create({
      title: 'Registration Open: Annual Hackathon 2026',
      message: 'All undergraduate students are invited to form teams and register for the Annual University Hackathon. Cash prizes and internship opportunities await!',
      type: 'event',
      target_type: 'all',
      target_value: null,
      created_by: teacher1User.id,
    });

    // Add all students as recipients of announcement 1
    const allStudents = [student1, student2, student3, student4];
    for (const st of allStudents) {
      await AnnouncementRecipient.create({
        announcement_id: announcement1.id,
        student_id: st.id,
        is_read: st.id === student1.id, // Alice has read it
        read_at: st.id === student1.id ? new Date() : null,
      });
      await Notification.create({
        user_id: st.user_id,
        title: `Announcement: ${announcement1.title}`,
        message: announcement1.message.substring(0, 100),
        type: 'announcement',
        reference_id: announcement1.id,
      });
    }

    // Announcement 2: Department-specific (CSE)
    const announcement2 = await Announcement.create({
      title: 'CSE Department: Project Lab Hours Extended',
      message: 'Computer Science Department laboratory hours will remain open until 9:00 PM throughout this month for hackathon preparations.',
      type: 'academic',
      target_type: 'department',
      target_value: 'Computer Science',
      created_by: teacher1User.id,
    });

    for (const st of [student1, student2]) {
      await AnnouncementRecipient.create({
        announcement_id: announcement2.id,
        student_id: st.id,
        is_read: false,
        read_at: null,
      });
      await Notification.create({
        user_id: st.user_id,
        title: `CSE Department Notice`,
        message: announcement2.message.substring(0, 100),
        type: 'announcement',
        reference_id: announcement2.id,
      });
    }

    // 9. Extra notifications
    await Notification.create({
      user_id: student1User.id,
      title: 'Certificate Issued!',
      message: `Your certificate of participation for "${event3.title}" has been issued. You can view and download it now.`,
      type: 'certificate',
      reference_id: event3.id,
    });
    await Notification.create({
      user_id: student2User.id,
      title: 'Certificate Issued!',
      message: `Your certificate of participation for "${event3.title}" has been issued. You can view and download it now.`,
      type: 'certificate',
      reference_id: event3.id,
    });

    console.log('========================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Admin Account:');
    console.log('  Email:    admin@university.com');
    console.log('  Password: admin123');
    console.log('Faculty Accounts:');
    console.log('  Email:    teacher1@university.com  (Alan Turing - Approved)');
    console.log('  Password: teacher123');
    console.log('  Email:    teacher2@university.com  (Grace Hopper - Approved)');
    console.log('  Password: teacher123');
    console.log('  Email:    teacher3@university.com  (John von Neumann - Pending Approval)');
    console.log('  Password: teacher123');
    console.log('Student Accounts:');
    console.log('  Email:    alice@student.university.com (Alice Johnson, CSE Year 3)');
    console.log('  Password: student123');
    console.log('  Email:    bob@student.university.com   (Bob Smith, CSE Year 3)');
    console.log('  Password: student123');
    console.log('  Email:    charlie@student.university.com (Charlie Brown, ECE Year 4)');
    console.log('  Password: student123');
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
