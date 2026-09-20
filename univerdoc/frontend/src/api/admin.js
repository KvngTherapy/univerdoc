import api from './axios';

export const getDepartments = () => api.get('/admin/departments');
export const resetCredentials = (data) => api.post('/admin/credentials/reset', data);
export const toggleSlot = (data) => api.post('/admin/credentials/toggle', data);
export const forceLogout = (data) => api.post('/admin/credentials/force-logout', data);
export const getStudents = () => api.get('/admin/students');
export const getIssues = (status = 'all') => api.get(`/admin/issues?status=${status}`);
export const resolveIssue = (id) => api.patch(`/admin/issues/${id}/resolve`);
export const getStats = () => api.get('/admin/stats');
export const getAuditLogs = (page = 1, limit = 20) => api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
export const triggerWeeklySummary = () => api.post('/admin/weekly-summary/send');