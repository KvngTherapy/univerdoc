const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getDeptQueue,
  getDeptHistory,
  approveDocument,
  rejectDocument,
  getDeptIssues,
  flagDeptIssue,
  getDeptStats,
} = require('../controllers/deptController');

// All department routes require dept_staff role
router.use(authenticate, requireRole('dept_staff'));

router.get('/queue', getDeptQueue);
router.get('/history', getDeptHistory);
router.post('/approve/:submission_id', approveDocument);
router.post('/reject/:submission_id', rejectDocument);
router.get('/issues', getDeptIssues);
router.post('/issues', flagDeptIssue);
router.get('/stats', getDeptStats);

module.exports = router;