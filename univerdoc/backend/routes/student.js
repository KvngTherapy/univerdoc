const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getStudentDocuments,
  uploadStudentDocument,
  getStudentProgress,
  getStudentNotifications,
  markNotificationsAsRead,
  reportStudentIssue,
} = require('../controllers/studentController');

// All student routes require student role
router.use(authenticate, requireRole('student'));

router.get('/documents', getStudentDocuments);
router.post('/documents/upload', upload.single('file'), uploadStudentDocument);
router.get('/progress', getStudentProgress);
router.get('/notifications', getStudentNotifications);
router.patch('/notifications/read', markNotificationsAsRead);
router.post('/issues', reportStudentIssue);

module.exports = router;