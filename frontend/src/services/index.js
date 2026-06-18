import api from './api';

export const authApi = {
  login: (data) => api.post('/login', data),
  registerStudent: (data) => api.post('/register/student', data),
  getProfile: () => api.get('/profile'),
  listUsers: (role) => api.get('/users', { params: { role } }),
  createUser: (data) => api.post('/users', data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  listCoaches: () => api.get('/coaches'),
  listStudents: () => api.get('/students'),
};

export const courseApi = {
  list: (params) => api.get('/courses', { params }),
  create: (data) => api.post('/courses', data),
  book: (data) => api.post('/courses/book', data),
  cancel: (id) => api.post(`/courses/${id}/cancel`),
  complete: (id) => api.post(`/courses/${id}/complete`),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const trainingApi = {
  list: (params) => api.get('/training', { params }),
  record: (data) => api.post('/training', data),
  getProgress: (id) => api.get(id ? `/training/progress/${id}` : '/training/progress'),
  listCoachStudents: (id) => api.get(id ? `/training/coach-students/${id}` : '/training/coach-students'),
};

export const examApi = {
  list: (params) => api.get('/exams', { params }),
  create: (data) => api.post('/exams', data),
  updateResult: (id, data) => api.put(`/exams/${id}/result`, data),
  delete: (id) => api.delete(`/exams/${id}`),
};

export const financeApi = {
  list: (params) => api.get('/finances', { params }),
  create: (data) => api.post('/finances', data),
  delete: (id) => api.delete(`/finances/${id}`),
  getStudentFinance: (id) => api.get(`/finances/student/${id}`),
};

export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),
  getCoachStats: () => api.get('/stats/coaches'),
  getSubjectPassRates: () => api.get('/stats/subjects'),
};
