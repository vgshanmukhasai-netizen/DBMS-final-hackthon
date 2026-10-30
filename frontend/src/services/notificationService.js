import api from './api';

export const notificationService = {
  getMyNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
};

export default notificationService;
