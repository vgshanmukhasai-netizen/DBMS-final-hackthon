const { Attendance, Event, Student, Registration, User, Notification } = require('../models');

/**
 * Get attendance records for a specific event
 * GET /api/attendance/event/:eventId
 */
const getEventAttendance = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Get all registered students for the event
    const registrations = await Registration.findAll({
      where: {
        event_id: eventId,
        status: ['registered', 'attended'],
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'full_name', 'student_id', 'department', 'year_of_study', 'section', 'user_id'],
        },
      ],
    });

    // Get existing attendance records for the event
    const attendanceRecords = await Attendance.findAll({
      where: { event_id: eventId },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'full_name', 'student_id', 'department', 'year_of_study', 'section'],
        },
        {
          model: User,
          as: 'marker',
          attributes: ['id', 'email'],
        },
      ],
    });

    // Create a map for quick attendance lookup
    const attendanceMap = new Map();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(att.student_id, att);
    });

    // Merge registered students with their attendance status
    const combinedList = registrations.map((reg) => {
      const attRecord = attendanceMap.get(reg.student_id);
      return {
        student_id: reg.student.id,
        full_name: reg.student.full_name,
        roll_number: reg.student.student_id,
        department: reg.student.department,
        year_of_study: reg.student.year_of_study,
        section: reg.student.section,
        attendance_id: attRecord ? attRecord.id : null,
        status: attRecord ? attRecord.status : 'not_marked',
        marked_at: attRecord ? attRecord.marked_at : null,
        marked_by: attRecord ? attRecord.marker : null,
      };
    });

    const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
    const absentCount = attendanceRecords.filter((a) => a.status === 'absent').length;

    return res.status(200).json({
      success: true,
      eventId: event.id,
      eventTitle: event.title,
      totalRegistered: registrations.length,
      totalMarked: attendanceRecords.length,
      presentCount,
      absentCount,
      attendance: combinedList,
    });
  } catch (error) {
    console.error('Error in getEventAttendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance records.',
      error: error.message,
    });
  }
};

/**
 * Mark bulk attendance for an event (Teacher/Admin)
 * POST /api/attendance/event/:eventId
 */
const markBulkAttendance = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { attendance } = req.body; // Array of { student_id, status }

    if (!Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance data must be a non-empty array of { student_id, status } objects.',
      });
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const savedRecords = [];
    const notificationsToCreate = [];

    for (const record of attendance) {
      const { student_id, status } = record;
      const attStatus = status === 'present' ? 'present' : 'absent';

      // Find or create attendance record
      const [att, created] = await Attendance.findOrCreate({
        where: {
          event_id: eventId,
          student_id,
        },
        defaults: {
          event_id: eventId,
          student_id,
          status: attStatus,
          marked_by: req.user.id,
          marked_at: new Date(),
        },
      });

      if (!created) {
        att.status = attStatus;
        att.marked_by = req.user.id;
        att.marked_at = new Date();
        await att.save();
      }

      savedRecords.push(att);

      // If present, update registration status to 'attended'
      if (attStatus === 'present') {
        await Registration.update(
          { status: 'attended' },
          { where: { event_id: eventId, student_id } }
        );
      }

      // Fetch student's user_id for notification
      const student = await Student.findByPk(student_id);
      if (student) {
        notificationsToCreate.push({
          user_id: student.user_id,
          title: `Attendance Marked: ${event.title}`,
          message: `Your attendance for "${event.title}" has been recorded as: ${attStatus.toUpperCase()}.`,
          type: 'attendance',
          reference_id: event.id,
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      await Notification.bulkCreate(notificationsToCreate);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully recorded attendance for ${savedRecords.length} student(s).`,
      count: savedRecords.length,
      records: savedRecords,
    });
  } catch (error) {
    console.error('Error in markBulkAttendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record attendance.',
      error: error.message,
    });
  }
};

/**
 * Update single attendance record
 * PUT /api/attendance/:id
 */
const updateAttendance = async (req, res) => {
  try {
    const attendanceId = req.params.id;
    const { status } = req.body;

    if (!status || !['present', 'absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "present" or "absent".',
      });
    }

    const attendance = await Attendance.findByPk(attendanceId, {
      include: [
        { model: Event, as: 'event' },
        { model: Student, as: 'student' },
      ],
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found.',
      });
    }

    attendance.status = status;
    attendance.marked_by = req.user.id;
    attendance.marked_at = new Date();
    await attendance.save();

    // If updated to present, update registration status
    if (status === 'present') {
      await Registration.update(
        { status: 'attended' },
        { where: { event_id: attendance.event_id, student_id: attendance.student_id } }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.',
      attendance,
    });
  } catch (error) {
    console.error('Error in updateAttendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update attendance record.',
      error: error.message,
    });
  }
};

/**
 * Get student's attendance across all events
 * GET /api/attendance/student/:studentId
 */
const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    const attendanceList = await Attendance.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'event_date', 'category', 'venue'],
        },
        {
          model: User,
          as: 'marker',
          attributes: ['id', 'email'],
        },
      ],
      order: [['marked_at', 'DESC']],
    });

    const totalMarked = attendanceList.length;
    const presentCount = attendanceList.filter((a) => a.status === 'present').length;
    const absentCount = attendanceList.filter((a) => a.status === 'absent').length;
    const attendancePercentage = totalMarked > 0 ? ((presentCount / totalMarked) * 100).toFixed(2) : 0;

    return res.status(200).json({
      success: true,
      student: {
        id: student.id,
        full_name: student.full_name,
        student_id: student.student_id,
        department: student.department,
      },
      stats: {
        totalMarked,
        presentCount,
        absentCount,
        attendancePercentage: `${attendancePercentage}%`,
      },
      attendance: attendanceList,
    });
  } catch (error) {
    console.error('Error in getStudentAttendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student attendance history.',
      error: error.message,
    });
  }
};

module.exports = {
  getEventAttendance,
  markBulkAttendance,
  updateAttendance,
  getStudentAttendance,
};
