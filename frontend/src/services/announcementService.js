import api from './api';

export const announcementService = {
  createAnnouncement: async (announcementData) => {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  },

  getAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },

  getMyAnnouncements: async () => {
    const response = await api.get('/announcements/my');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/announcements/${id}/read`);
    return response.data;
  },

  deleteAnnouncement: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
};

export default announcementService;
