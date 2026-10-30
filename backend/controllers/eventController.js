const { Event, User, Teacher, Student, Registration, Attendance, Notification } = require('../models');
const { Op } = require('sequelize');

/**
 * List events with filtering and search
 * GET /api/events
 */
const getEvents = async (req, res) => {
  try {
    const { status, category, search, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }
    if (category) {
      whereClause.category = category;
    }
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { venue: { [Op.like]: `%${search}%` } },
      ];
    }
    if (startDate && endDate) {
      whereClause.event_date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      whereClause.event_date = { [Op.gte]: startDate };
    } else if (endDate) {
      whereClause.event_date = { [Op.lte]: endDate };
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'role'],
          include: [
            {
              model: Teacher,
              as: 'teacherProfile',
              attributes: ['full_name', 'department', 'designation'],
            },
          ],
        },
        {
          model: Registration,
          as: 'registrations',
          attributes: ['id', 'status', 'student_id'],
        },
      ],
      order: [['event_date', 'ASC'], ['start_time', 'ASC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    // Format events with registration count
    const formattedEvents = events.map((evt) => {
      const plain = evt.toJSON();
      plain.registrationCount = plain.registrations ? plain.registrations.filter(r => r.status !== 'cancelled').length : 0;
      return plain;
    });

    return res.status(200).json({
      success: true,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
      events: formattedEvents,
    });
  } catch (error) {
    console.error('Error in getEvents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve events.',
      error: error.message,
    });
  }
};

/**
 * Get single event details by ID
 * GET /api/events/:id
 */
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'role'],
          include: [
            {
              model: Teacher,
              as: 'teacherProfile',
              attributes: ['full_name', 'department', 'designation'],
            },
          ],
        },
        {
          model: Registration,
          as: 'registrations',
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'full_name', 'student_id', 'department', 'year_of_study', 'section'],
            },
          ],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const plainEvent = event.toJSON();
    plainEvent.activeRegistrationCount = plainEvent.registrations
      ? plainEvent.registrations.filter((r) => r.status !== 'cancelled').length
      : 0;

    return res.status(200).json({
      success: true,
      event: plainEvent,
    });
  } catch (error) {
    console.error('Error in getEventById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event details.',
      error: error.message,
    });
  }
};

/**
 * Create a new event (Teacher/Admin)
 * POST /api/events
 */
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      event_date: eventDate,
      date,
      start_time: startTime,
      time,
      end_time,
      venue,
      max_participants: maxParticipants,
      capacity,
      registration_deadline,
      status,
    } = req.body;

    const eventDateValue = eventDate || date;
    const startTimeValue = startTime || time;
    const maxParticipantsValue = maxParticipants || capacity;

    if (!title || !eventDateValue) {
      return res.status(400).json({
        success: false,
        message: 'Title and event date are required.',
      });
    }

    let poster = null;
    if (req.file) {
      poster = `/uploads/${req.file.filename}`;
    } else if (req.body.poster) {
      poster = req.body.poster;
    }

    const newEvent = await Event.create({
      title,
      description: description || null,
      category: category || 'General',
      event_date: eventDateValue,
      start_time: startTimeValue || null,
      end_time: end_time || null,
      venue: venue || null,
      max_participants: maxParticipantsValue ? parseInt(maxParticipantsValue, 10) : 100,
      registration_deadline: registration_deadline || null,
      poster,
      status: status || 'upcoming',
      created_by: req.user.id,
    });

    // Notify all active students about the newly published event
    const allStudents = await Student.findAll({
      include: [{ model: User, as: 'user', where: { is_approved: true } }],
    });

    const notificationsToCreate = allStudents.map((s) => ({
      user_id: s.user_id,
      title: 'New Campus Event Published',
      message: `"${title}" has been scheduled on ${eventDateValue}. Register before deadline!`,
      type: 'event',
      reference_id: newEvent.id,
    }));

    if (notificationsToCreate.length > 0) {
      await Notification.bulkCreate(notificationsToCreate);
    }

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event: newEvent,
    });
  } catch (error) {
    console.error('Error in createEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event.',
      error: error.message,
    });
  }
};

/**
 * Update event (Teacher/Admin)
 * PUT /api/events/:id
 */
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Role check: Admin can edit any event; Teachers can edit only their own events
    if (req.user.role === 'teacher' && event.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit events you created.',
      });
    }

    const {
      title,
      description,
      category,
      event_date: eventDate,
      date,
      start_time: startTime,
      time,
      end_time,
      venue,
      max_participants: maxParticipants,
      capacity,
      registration_deadline,
      status,
    } = req.body;

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category = category;
    if (eventDate !== undefined || date !== undefined) event.event_date = eventDate || date;
    if (startTime !== undefined || time !== undefined) event.start_time = startTime || time;
    if (end_time !== undefined) event.end_time = end_time;
    if (venue !== undefined) event.venue = venue;
    if (maxParticipants !== undefined || capacity !== undefined) {
      event.max_participants = parseInt(maxParticipants || capacity, 10);
    }
    if (registration_deadline !== undefined) event.registration_deadline = registration_deadline;
    if (status !== undefined) event.status = status;

    if (req.file) {
      event.poster = `/uploads/${req.file.filename}`;
    } else if (req.body.poster !== undefined) {
      event.poster = req.body.poster;
    }

    await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      event,
    });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update event.',
      error: error.message,
    });
  }
};

/**
 * Delete event (Teacher/Admin)
 * DELETE /api/events/:id
 */
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Role check: Admin can delete any event; Teachers can delete only their own events
    if (req.user.role === 'teacher' && event.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete events you created.',
      });
    }

    await event.destroy();

    return res.status(200).json({
      success: true,
      message: 'Event and all related registrations/attendances deleted successfully.',
    });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete event.',
      error: error.message,
    });
  }
};

/**
 * Assign event to students (Teacher/Admin)
 * POST /api/events/:id/assign
 */
const assignEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const target_type = req.body.target_type || req.body.targetType || 'selected';
    const target_value = req.body.target_value || req.body.targetValue;
    const student_ids = req.body.student_ids || req.body.studentIds;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Determine target students
    const studentQuery = {};

    if (target_type === 'department') {
      if (!target_value) {
        return res.status(400).json({ success: false, message: 'target_value (department name) is required for department targeting.' });
      }
      studentQuery.department = target_value;
    } else if (target_type === 'year') {
      if (!target_value) {
        return res.status(400).json({ success: false, message: 'target_value (year of study) is required for year targeting.' });
      }
      studentQuery.year_of_study = parseInt(target_value, 10);
    } else if (target_type === 'section') {
      if (!target_value) {
        return res.status(400).json({ success: false, message: 'target_value (section) is required for section targeting.' });
      }
      studentQuery.section = target_value;
    } else if (target_type === 'selected') {
      const ids = Array.isArray(student_ids) ? student_ids : (target_value ? target_value.split(',').map(s => parseInt(s.trim(), 10)) : []);
      if (!ids || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'student_ids array is required for selected targeting.' });
      }
      studentQuery.id = { [Op.in]: ids };
    }

    const students = await Student.findAll({
      where: studentQuery,
      include: [{ model: User, as: 'user' }],
    });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching students found for the target criteria.',
      });
    }

    // Register each matching student if not already registered
    let assignedCount = 0;
    const notificationsToCreate = [];

    for (const student of students) {
      const [registration, created] = await Registration.findOrCreate({
        where: {
          event_id: event.id,
          student_id: student.id,
        },
        defaults: {
          event_id: event.id,
          student_id: student.id,
          status: 'registered',
          registered_at: new Date(),
        },
      });

      // If already registered but cancelled, reactivate
      if (!created && registration.status === 'cancelled') {
        registration.status = 'registered';
        await registration.save();
        assignedCount++;
      } else if (created) {
        assignedCount++;
      }

      notificationsToCreate.push({
        user_id: student.user_id,
        title: `Assigned to Event: ${event.title}`,
        message: `You have been registered for "${event.title}" on ${event.event_date}. Please review the event details.`,
        type: 'event',
        reference_id: event.id,
      });
    }

    if (notificationsToCreate.length > 0) {
      await Notification.bulkCreate(notificationsToCreate);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully assigned ${assignedCount} student(s) to event "${event.title}".`,
      assignedCount,
      target_type,
    });
  } catch (error) {
    console.error('Error in assignEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign event to students.',
      error: error.message,
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  assignEvent,
};
