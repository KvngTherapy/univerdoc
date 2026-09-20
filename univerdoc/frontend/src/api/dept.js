import api from './axios';

export const getDeptQueue = () => api.get('/dept/queue');
export const getDeptHistory = () => api.get('/dept/history');
export const approveDocument = (submissionId) => api.post(`/dept/approve/${submissionId}`);
export const rejectDocument = (submissionId, rejection_note) =>
  api.post(`/dept/reject/${submissionId}`, { rejection_note });
export const getDeptIssues = () => api.get('/dept/issues');
export const flagDeptIssue = (data) => api.post('/dept/issues', data);
export const getDeptStats = () => api.get('/dept/stats');