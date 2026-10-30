const { sequelize } = require('../config/db');
const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Event = require('./Event');
const Registration = require('./Registration');
const Attendance = require('./Attendance');
const Announcement = require('./Announcement');
const AnnouncementRecipient = require('./AnnouncementRecipient');
const Notification = require('./Notification');
const Certificate = require('./Certificate');

// User <-> Student (1:1)
User.hasOne(Student, { foreignKey: 'user_id', as: 'studentProfile', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Teacher (1:1)
User.hasOne(Teacher, { foreignKey: 'user_id', as: 'teacherProfile', onDelete: 'CASCADE' });
Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Event (Creator)
User.hasMany(Event, { foreignKey: 'created_by', as: 'createdEvents', onDelete: 'CASCADE' });
Event.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Announcement
User.hasMany(Announcement, { foreignKey: 'created_by', as: 'announcements', onDelete: 'CASCADE' });
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'author' });

// User <-> Certificate (Issuer)
User.hasMany(Certificate, { foreignKey: 'issued_by', as: 'issuedCertificates', onDelete: 'SET NULL' });
Certificate.belongsTo(User, { foreignKey: 'issued_by', as: 'issuer' });

// User <-> Attendance (Marker)
User.hasMany(Attendance, { foreignKey: 'marked_by', as: 'markedAttendances', onDelete: 'SET NULL' });
Attendance.belongsTo(User, { foreignKey: 'marked_by', as: 'marker' });

// Event <-> Registration <-> Student
Event.hasMany(Registration, { foreignKey: 'event_id', as: 'registrations', onDelete: 'CASCADE' });
Registration.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Student.hasMany(Registration, { foreignKey: 'student_id', as: 'registrations', onDelete: 'CASCADE' });
Registration.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Event.belongsToMany(Student, { through: Registration, foreignKey: 'event_id', otherKey: 'student_id', as: 'registeredStudents' });
Student.belongsToMany(Event, { through: Registration, foreignKey: 'student_id', otherKey: 'event_id', as: 'registeredEvents' });

// Event <-> Attendance <-> Student
Event.hasMany(Attendance, { foreignKey: 'event_id', as: 'attendanceRecords', onDelete: 'CASCADE' });
Attendance.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Student.hasMany(Attendance, { foreignKey: 'student_id', as: 'attendanceRecords', onDelete: 'CASCADE' });
Attendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Event <-> Certificate <-> Student
Event.hasMany(Certificate, { foreignKey: 'event_id', as: 'certificates', onDelete: 'CASCADE' });
Certificate.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Student.hasMany(Certificate, { foreignKey: 'student_id', as: 'certificates', onDelete: 'CASCADE' });
Certificate.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Announcement <-> AnnouncementRecipient <-> Student
Announcement.hasMany(AnnouncementRecipient, { foreignKey: 'announcement_id', as: 'recipients', onDelete: 'CASCADE' });
AnnouncementRecipient.belongsTo(Announcement, { foreignKey: 'announcement_id', as: 'announcement' });

Student.hasMany(AnnouncementRecipient, { foreignKey: 'student_id', as: 'announcementReceipts', onDelete: 'CASCADE' });
AnnouncementRecipient.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Announcement.belongsToMany(Student, { through: AnnouncementRecipient, foreignKey: 'announcement_id', otherKey: 'student_id', as: 'targetStudents' });
Student.belongsToMany(Announcement, { through: AnnouncementRecipient, foreignKey: 'student_id', otherKey: 'announcement_id', as: 'announcements' });

module.exports = {
  sequelize,
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
};
