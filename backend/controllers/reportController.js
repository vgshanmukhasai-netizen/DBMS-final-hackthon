const { Event, Student, Teacher, Registration, Attendance, Certificate, User, sequelize } = require('../models');
const { fn, col, literal } = require('sequelize');

/**
 * Get overall dashboard stats
 * GET /api/reports/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.count();
    const totalStudents = await Student.count();
    const totalTeachers = await Teacher.count();
    const totalRegistrations = await Registration.count();
    const totalCertificates = await Certificate.count();

    const upcomingEventsCount = await Event.count({ where: { status: 'upcoming' } });
    const ongoingEventsCount = await Event.count({ where: { status: 'ongoing' } });
    const completedEventsCount = await Event.count({ where: { status: 'completed' } });
    const cancelledEventsCount = await Event.count({ where: { status: 'cancelled' } });

    const pendingTeachersCount = await User.count({
      where: { role: 'teacher', is_approved: false },
    });

    const recentEvents = await Event.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'event_date', 'status', 'category', 'venue', 'max_participants'],
    });

    const recentRegistrations = await Registration.findAll({
      order: [['registered_at', 'DESC']],
      limit: 5,
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title', 'event_date'] },
        { model: Student, as: 'student', attributes: ['id', 'full_name', 'student_id', 'department'] },
      ],
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        totalStudents,
        totalTeachers,
        totalRegistrations,
        totalCertificates,
        upcomingEventsCount,
        ongoingEventsCount,
        completedEventsCount,
        cancelledEventsCount,
        pendingTeachersCount,
      },
      recentEvents,
      recentRegistrations,
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.',
      error: error.message,
    });
  }
};

/**
 * Get event analytics (categories, status, timeline)
 * GET /api/reports/events
 */
const getEventAnalytics = async (req, res) => {
  try {
    // Breakdown by category
    const categoryStats = await Event.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      raw: true,
    });

    // Breakdown by status
    const statusStats = await Event.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // Monthly event distribution
    const monthlyEvents = await Event.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('event_date'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['month'],
      order: [['month', 'ASC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      byCategory: categoryStats,
      byStatus: statusStats,
      monthlyDistribution: monthlyEvents,
    });
  } catch (error) {
    console.error('Error in getEventAnalytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event analytics.',
      error: error.message,
    });
  }
};

/**
 * Get registration analytics
 * GET /api/reports/registrations
 */
const getRegistrationAnalytics = async (req, res) => {
  try {
    // Status breakdown
    const statusBreakdown = await Registration.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // Top 5 most registered events
    const topEvents = await Registration.findAll({
      attributes: [
        'event_id',
        [fn('COUNT', col('Registration.id')), 'registration_count'],
      ],
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['title', 'category', 'event_date', 'max_participants'],
        },
      ],
      group: ['event_id', 'event.id'],
      order: [[literal('registration_count'), 'DESC']],
      limit: 10,
    });

    // Monthly registration timeline
    const monthlyRegistrations = await Registration.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('registered_at'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['month'],
      order: [['month', 'ASC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      statusBreakdown,
      topEvents,
      monthlyTimeline: monthlyRegistrations,
    });
  } catch (error) {
    console.error('Error in getRegistrationAnalytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve registration analytics.',
      error: error.message,
    });
  }
};

/**
 * Get attendance analytics
 * GET /api/reports/attendance
 */
const getAttendanceAnalytics = async (req, res) => {
  try {
    const totalMarked = await Attendance.count();
    const presentCount = await Attendance.count({ where: { status: 'present' } });
    const absentCount = await Attendance.count({ where: { status: 'absent' } });
    const overallRate = totalMarked > 0 ? ((presentCount / totalMarked) * 100).toFixed(2) : 0;

    // Per-event attendance breakdown
    const eventAttendance = await Attendance.findAll({
      attributes: [
        'event_id',
        [fn('COUNT', col('Attendance.id')), 'total'],
        [fn('SUM', literal("CASE WHEN Attendance.status = 'present' THEN 1 ELSE 0 END")), 'present'],
        [fn('SUM', literal("CASE WHEN Attendance.status = 'absent' THEN 1 ELSE 0 END")), 'absent'],
      ],
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['title', 'event_date', 'category'],
        },
      ],
      group: ['event_id', 'event.id'],
      order: [[literal('total'), 'DESC']],
    });

    const formattedEvents = eventAttendance.map((item) => {
      const plain = item.toJSON();
      const total = parseInt(plain.total, 10) || 0;
      const present = parseInt(plain.present, 10) || 0;
      const absent = parseInt(plain.absent, 10) || 0;
      return {
        event_id: plain.event_id,
        eventTitle: plain.event ? plain.event.title : 'Event',
        eventDate: plain.event ? plain.event.event_date : null,
        category: plain.event ? plain.event.category : null,
        total,
        present,
        absent,
        attendanceRate: total > 0 ? `${((present / total) * 100).toFixed(2)}%` : '0%',
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalMarked,
        presentCount,
        absentCount,
        overallRate: `${overallRate}%`,
      },
      perEventAttendance: formattedEvents,
    });
  } catch (error) {
    console.error('Error in getAttendanceAnalytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance analytics.',
      error: error.message,
    });
  }
};

/**
 * Get department-wise statistics
 * GET /api/reports/departments
 */
const getDepartmentStats = async (req, res) => {
  try {
    // 1. Student count per department
    const studentsByDept = await Student.findAll({
      attributes: ['department', [fn('COUNT', col('id')), 'studentCount']],
      group: ['department'],
      raw: true,
    });

    // 2. Registrations per department (through Student)
    const registrationsByDept = await Registration.findAll({
      attributes: [
        [col('student.department'), 'department'],
        [fn('COUNT', col('Registration.id')), 'registrationCount'],
      ],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: [],
        },
      ],
      group: ['student.department'],
      raw: true,
    });

    // 3. Attendance per department
    const attendanceByDept = await Attendance.findAll({
      attributes: [
        [col('student.department'), 'department'],
        [fn('COUNT', col('Attendance.id')), 'totalAttendanceMarked'],
        [fn('SUM', literal("CASE WHEN Attendance.status = 'present' THEN 1 ELSE 0 END")), 'presentCount'],
      ],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: [],
        },
      ],
      group: ['student.department'],
      raw: true,
    });

    // Merge department statistics
    const deptMap = {};

    studentsByDept.forEach((d) => {
      deptMap[d.department] = {
        department: d.department,
        studentsCount: parseInt(d.studentCount, 10),
        registrationsCount: 0,
        attendanceMarked: 0,
        presentCount: 0,
        attendanceRate: '0%',
      };
    });

    registrationsByDept.forEach((r) => {
      if (r.department) {
        if (!deptMap[r.department]) {
          deptMap[r.department] = {
            department: r.department,
            studentsCount: 0,
            registrationsCount: 0,
            attendanceMarked: 0,
            presentCount: 0,
            attendanceRate: '0%',
          };
        }
        deptMap[r.department].registrationsCount = parseInt(r.registrationCount, 10);
      }
    });

    attendanceByDept.forEach((a) => {
      if (a.department && deptMap[a.department]) {
        const total = parseInt(a.totalAttendanceMarked, 10) || 0;
        const present = parseInt(a.presentCount, 10) || 0;
        deptMap[a.department].attendanceMarked = total;
        deptMap[a.department].presentCount = present;
        deptMap[a.department].attendanceRate = total > 0 ? `${((present / total) * 100).toFixed(2)}%` : '0%';
      }
    });

    return res.status(200).json({
      success: true,
      departments: Object.values(deptMap),
    });
  } catch (error) {
    console.error('Error in getDepartmentStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve department statistics.',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getEventAnalytics,
  getRegistrationAnalytics,
  getAttendanceAnalytics,
  getDepartmentStats,
};
