import api from './api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getAllStudents: async () => {
    const response = await api.get('/users/students');
    return response.data;
  },

  getAllTeachers: async () => {
    const response = await api.get('/users/teachers');
    return response.data;
  },

  approveTeacher: async (id) => {
    const response = await api.put(`/users/${id}/approve`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
