import api from './axios';

export const getStudentDocuments = () => api.get('/student/documents');
export const uploadStudentDocument = (formData) =>
  api.post('/student/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getStudentProgress = () => api.get('/student/progress');
export const getStudentNotifications = () => api.get('/student/notifications');
export const markNotificationsRead = () => api.patch('/student/notifications/read');
export const reportStudentIssue = (data) => api.post('/student/issues', data);