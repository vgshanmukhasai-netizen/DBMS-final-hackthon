const { Notification } = require('../models');

/**
 * Get all notifications for logged-in user
 * GET /api/notifications
 */
const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    const unreadCount = await Notification.count({
      where: {
        user_id: req.user.id,
        is_read: false,
      },
    });

    return res.status(200).json({
      success: true,
      total: count,
      unreadCount,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
      notifications,
    });
  } catch (error) {
    console.error('Error in getMyNotifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.',
      error: error.message,
    });
  }
};

/**
 * Mark a single notification as read
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    notification.is_read = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification,
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read for current user
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const [updatedCount] = await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: req.user.id,
          is_read: false,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `Marked ${updatedCount} notification(s) as read.`,
      updatedCount,
    });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read.',
      error: error.message,
    });
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: req.user.id,
        is_read: false,
      },
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread notification count.',
      error: error.message,
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
