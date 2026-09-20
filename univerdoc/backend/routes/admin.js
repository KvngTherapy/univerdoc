const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getDepartments,
  resetCredentials,
  toggleSlot,
  forceLogout,
  getStudents,
  getIssues,
  resolveIssue,
  getStats,
  getAuditLogs,
  triggerWeeklySummary,
} = require('../controllers/adminController');

// All superadmin routes require superadmin role
router.use(authenticate, requireRole('superadmin'));

router.get('/departments', getDepartments);
router.post('/credentials/reset', resetCredentials);
router.post('/credentials/toggle', toggleSlot);
router.post('/credentials/force-logout', forceLogout);
router.get('/students', getStudents);
router.get('/issues', getIssues);
patchIssueHandler = resolveIssue;
router.patch('/issues/:id/resolve', patchIssueHandler);
router.get('/stats', getStats);
router.get('/audit-logs', getAuditLogs);
router.post('/weekly-summary/send', triggerWeeklySummary);

module.exports = router;