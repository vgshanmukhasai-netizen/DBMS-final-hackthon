import api from './api';

export const attendanceService = {
  getEventAttendance: async (eventId) => {
    const response = await api.get(`/attendance/event/${eventId}`);
    return response.data;
  },

  markAttendance: async (eventId, records) => {
    const response = await api.post(`/attendance/event/${eventId}`, { records });
    return response.data;
  },

  getStudentAttendance: async (studentId) => {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data;
  },
};

export default attendanceService;
