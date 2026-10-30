import api from './api';

export const registrationService = {
  registerForEvent: async (eventId) => {
    const response = await api.post('/registrations', { eventId });
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await api.get('/registrations/my');
    return response.data;
  },

  getEventRegistrations: async (eventId) => {
    const response = await api.get(`/registrations/event/${eventId}`);
    return response.data;
  },

  cancelRegistration: async (id) => {
    const response = await api.put(`/registrations/${id}/cancel`);
    return response.data;
  },
};

export default registrationService;
