const { Announcement, AnnouncementRecipient, Student, User, Notification, Teacher } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a targeted announcement (Teacher/Admin)
 * POST /api/announcements
 */
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type = 'general', target_type = 'all', target_value, student_ids } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required.',
      });
    }

    // Determine target students
    const studentQuery = {};

    if (target_type === 'department') {
      if (!target_value) {
        return res.status(400).json({ success: false, message: 'Department value is required for department targeting.' });
      }
      studentQuery.department = target_value;
    } else if (target_type === 'year') {
      if (!target_value) {
        return res.status(400).json({ success: false, message: 'Year of study is required for year targeting.' });
      }
      studentQuery.year_of_study = parseInt(target_value, 10);
    } else if (target_type === 'section') {
      if (!target_value) {
        return res.status(400).json({ success: false, message: 'Section value is required for section targeting.' });
      }
      studentQuery.section = target_value;
    } else if (target_type === 'selected') {
      const ids = Array.isArray(student_ids)
        ? student_ids
        : (target_value ? target_value.split(',').map((id) => parseInt(id.trim(), 10)) : []);
      if (!ids || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'student_ids array is required for selected student targeting.' });
      }
      studentQuery.id = { [Op.in]: ids };
    }

    const targetedStudents = await Student.findAll({
      where: studentQuery,
      attributes: ['id', 'user_id', 'full_name', 'department'],
    });

    if (targetedStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found matching the specified targeting criteria.',
      });
    }

    // Create Announcement
    const announcement = await Announcement.create({
      title,
      message,
      type,
      target_type,
      target_value: target_value ? String(target_value) : null,
      created_by: req.user.id,
    });

    // Create AnnouncementRecipient entries for all matching students
    const recipientsData = targetedStudents.map((s) => ({
      announcement_id: announcement.id,
      student_id: s.id,
      is_read: false,
      read_at: null,
    }));
    await AnnouncementRecipient.bulkCreate(recipientsData, { ignoreDuplicates: true });

    // Create system notification for each recipient student
    const notificationsData = targetedStudents.map((s) => ({
      user_id: s.user_id,
      title: `Announcement: ${title}`,
      message: message.length > 120 ? `${message.substring(0, 117)}...` : message,
      type: 'announcement',
      reference_id: announcement.id,
    }));
    await Notification.bulkCreate(notificationsData);

    return res.status(201).json({
      success: true,
      message: `Announcement created and sent to ${targetedStudents.length} student(s).`,
      announcement,
      recipientsCount: targetedStudents.length,
    });
  } catch (error) {
    console.error('Error in createAnnouncement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create announcement.',
      error: error.message,
    });
  }
};

/**
 * List all announcements (Teacher/Admin or general overview)
 * GET /api/announcements
 */
const getAnnouncements = async (req, res) => {
  try {
    const { type, target_type, search } = req.query;

    const whereClause = {};
    if (type) whereClause.type = type;
    if (target_type) whereClause.target_type = target_type;
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } },
      ];
    }

    const announcements = await Announcement.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'email', 'role'],
          include: [
            {
              model: Teacher,
              as: 'teacherProfile',
              attributes: ['full_name', 'department'],
            },
          ],
        },
        {
          model: AnnouncementRecipient,
          as: 'recipients',
          attributes: ['id', 'is_read'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = announcements.map((item) => {
      const json = item.toJSON();
      const totalRecipients = json.recipients ? json.recipients.length : 0;
      const readCount = json.recipients ? json.recipients.filter((r) => r.is_read).length : 0;
      delete json.recipients;
      return {
        ...json,
        totalRecipients,
        readCount,
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      announcements: formatted,
    });
  } catch (error) {
    console.error('Error in getAnnouncements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve announcements.',
      error: error.message,
    });
  }
};

/**
 * Get announcements received by logged-in student
 * GET /api/announcements/my
 */
const getMyAnnouncements = async (req, res) => {
  try {
    let student = req.user.studentProfile;
    if (!student) {
      student = await Student.findOne({ where: { user_id: req.user.id } });
    }

    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Student profile required to view received announcements.',
      });
    }

    const recipientEntries = await AnnouncementRecipient.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Announcement,
          as: 'announcement',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'email', 'role'],
              include: [
                {
                  model: Teacher,
                  as: 'teacherProfile',
                  attributes: ['full_name', 'department'],
                },
              ],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const result = recipientEntries.map((entry) => ({
      recipient_id: entry.id,
      is_read: entry.is_read,
      read_at: entry.read_at,
      announcement: entry.announcement,
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      announcements: result,
    });
  } catch (error) {
    console.error('Error in getMyAnnouncements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your announcements.',
      error: error.message,
    });
  }
};

/**
 * Get single announcement details
 * GET /api/announcements/:id
 */
const getAnnouncementById = async (req, res) => {
  try {
    const announcementId = req.params.id;

    const announcement = await Announcement.findByPk(announcementId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'email', 'role'],
          include: [
            {
              model: Teacher,
              as: 'teacherProfile',
              attributes: ['full_name', 'department'],
            },
          ],
        },
        {
          model: AnnouncementRecipient,
          as: 'recipients',
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

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    return res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error('Error in getAnnouncementById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve announcement details.',
      error: error.message,
    });
  }
};

/**
 * Mark announcement as read (Student)
 * PUT /api/announcements/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const announcementId = req.params.id;

    let student = req.user.studentProfile;
    if (!student) {
      student = await Student.findOne({ where: { user_id: req.user.id } });
    }

    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Student profile required to mark announcement as read.',
      });
    }

    const recipient = await AnnouncementRecipient.findOne({
      where: {
        announcement_id: announcementId,
        student_id: student.id,
      },
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Announcement recipient entry not found.',
      });
    }

    recipient.is_read = true;
    recipient.read_at = new Date();
    await recipient.save();

    return res.status(200).json({
      success: true,
      message: 'Announcement marked as read.',
      recipient,
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark announcement as read.',
      error: error.message,
    });
  }
};

/**
 * Delete announcement (Teacher/Admin)
 * DELETE /api/announcements/:id
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;

    const announcement = await Announcement.findByPk(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    // Role check: Admin can delete any; Teachers can only delete their own
    if (req.user.role === 'teacher' && announcement.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete announcements you created.',
      });
    }

    await announcement.destroy();

    return res.status(200).json({
      success: true,
      message: 'Announcement and all recipient records deleted successfully.',
    });
  } catch (error) {
    console.error('Error in deleteAnnouncement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete announcement.',
      error: error.message,
    });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getMyAnnouncements,
  getAnnouncementById,
  markAsRead,
  deleteAnnouncement,
};
