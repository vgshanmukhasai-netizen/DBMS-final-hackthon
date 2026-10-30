const { Registration, Event, Student, User, Notification } = require('../models');

/**
 * Register for an event (Student)
 * POST /api/registrations
 */
const registerEvent = async (req, res) => {
  try {
    const { event_id } = req.body;

    if (!event_id) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required.',
      });
    }

    // Ensure user has student profile
    let student = req.user.studentProfile;
    if (!student) {
      student = await Student.findOne({ where: { user_id: req.user.id } });
    }
    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Only registered students can register for events.',
      });
    }

    // Check event exists
    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for a cancelled event.',
      });
    }

    if (event.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for an event that has already concluded.',
      });
    }

    // Check registration deadline if specified
    if (event.registration_deadline) {
      const today = new Date().toISOString().split('T')[0];
      if (today > event.registration_deadline) {
        return res.status(400).json({
          success: false,
          message: `Registration closed on ${event.registration_deadline}.`,
        });
      }
    }

    // Check current capacity
    const activeCount = await Registration.count({
      where: {
        event_id: event.id,
        status: ['registered', 'attended'],
      },
    });

    if (activeCount >= event.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'Registration full. Maximum participants limit reached.',
      });
    }

    // Check if registration already exists
    const existingReg = await Registration.findOne({
      where: {
        event_id: event.id,
        student_id: student.id,
      },
    });

    if (existingReg) {
      if (existingReg.status === 'registered' || existingReg.status === 'attended') {
        return res.status(409).json({
          success: false,
          message: 'You are already registered for this event.',
        });
      }
      // If was previously cancelled, reactivate
      existingReg.status = 'registered';
      existingReg.registered_at = new Date();
      await existingReg.save();

      await Notification.create({
        user_id: req.user.id,
        title: 'Event Registration Reactivated',
        message: `Your registration for "${event.title}" has been reactivated.`,
        type: 'registration',
        reference_id: event.id,
      });

      return res.status(200).json({
        success: true,
        message: 'Registration reactivated successfully.',
        registration: existingReg,
      });
    }

    // Create new registration
    const newRegistration = await Registration.create({
      event_id: event.id,
      student_id: student.id,
      status: 'registered',
      registered_at: new Date(),
    });

    // Send confirmation notification
    await Notification.create({
      user_id: req.user.id,
      title: 'Registration Confirmed',
      message: `You have successfully registered for "${event.title}" on ${event.event_date}.`,
      type: 'registration',
      reference_id: event.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for event.',
      registration: newRegistration,
    });
  } catch (error) {
    console.error('Error in registerEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration.',
      error: error.message,
    });
  }
};

/**
 * Get logged-in student's registrations
 * GET /api/registrations/my
 */
const getMyRegistrations = async (req, res) => {
  try {
    let student = req.user.studentProfile;
    if (!student) {
      student = await Student.findOne({ where: { user_id: req.user.id } });
    }
    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    const registrations = await Registration.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Event,
          as: 'event',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'email'],
            },
          ],
        },
      ],
      order: [['registered_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error('Error in getMyRegistrations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve registrations.',
      error: error.message,
    });
  }
};

/**
 * Get registrations for a specific event (Teacher/Admin)
 * GET /api/registrations/event/:eventId
 */
const getEventRegistrations = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const registrations = await Registration.findAll({
      where: { event_id: eventId },
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email'],
            },
          ],
        },
      ],
      order: [['registered_at', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error('Error in getEventRegistrations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event registrations.',
      error: error.message,
    });
  }
};

/**
 * Cancel registration (Student/Admin)
 * PUT /api/registrations/:id/cancel
 */
const cancelRegistration = async (req, res) => {
  try {
    const registrationId = req.params.id;

    const registration = await Registration.findByPk(registrationId, {
      include: [
        { model: Event, as: 'event' },
        { model: Student, as: 'student' },
      ],
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    // If student is cancelling, ensure it belongs to them
    if (req.user.role === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (!student || registration.student_id !== student.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only cancel your own registrations.',
        });
      }
    }

    registration.status = 'cancelled';
    await registration.save();

    // Notify student
    if (registration.student) {
      await Notification.create({
        user_id: registration.student.user_id,
        title: 'Registration Cancelled',
        message: `Your registration for "${registration.event ? registration.event.title : 'Event'}" has been cancelled.`,
        type: 'registration',
        reference_id: registration.event_id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully.',
      registration,
    });
  } catch (error) {
    console.error('Error in cancelRegistration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel registration.',
      error: error.message,
    });
  }
};

/**
 * Delete registration permanently (Admin/Teacher)
 * DELETE /api/registrations/:id
 */
const deleteRegistration = async (req, res) => {
  try {
    const registrationId = req.params.id;

    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    await registration.destroy();

    return res.status(200).json({
      success: true,
      message: 'Registration record deleted successfully.',
    });
  } catch (error) {
    console.error('Error in deleteRegistration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete registration.',
      error: error.message,
    });
  }
};

module.exports = {
  registerEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
  deleteRegistration,
};
