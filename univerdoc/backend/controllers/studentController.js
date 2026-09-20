const { PrismaClient } = require('@prisma/client');
const { sendIssueFlaggedEmail } = require('../services/emailService');
const { logAudit } = require('../services/auditService');

const prisma = new PrismaClient();

async function getStudentDocuments(req, res) {
  try {
    const studentId = req.user.id;

    // Fetch all document types grouped by department
    const departments = await prisma.department.findMany({
      include: {
        document_types: {
          include: {
            submissions: {
              where: { student_id: studentId },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = departments.map((dept) => {
      return {
        id: dept.id,
        name: dept.name,
        slug: dept.slug,
        icon: dept.icon,
        color: dept.color,
        documents: dept.document_types.map((dt) => {
          const submission = dt.submissions[0] || null;
          return {
            document_type_id: dt.id,
            slug: dt.slug,
            label: dt.label,
            icon: dt.icon,
            is_required: dt.is_required,
            submission_id: submission ? submission.id : null,
            status: submission ? submission.status : 'not_submitted',
            file_name: submission ? submission.file_name : null,
            file_url: submission ? submission.file_url : null,
            uploaded_at: submission ? submission.uploaded_at : null,
            reviewed_at: submission ? submission.reviewed_at : null,
            rejection_note: submission ? submission.rejection_note : null,
            version: submission ? submission.version : 1,
          };
        }),
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('getStudentDocuments error:', err);
    return res.status(500).json({ error: 'Failed to fetch clearance documents' });
  }
}

async function uploadStudentDocument(req, res) {
  try {
    const studentId = req.user.id;
    const { document_type_id } = req.body;

    if (!document_type_id) {
      return res.status(400).json({ error: 'document_type_id is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or file rejected by validator' });
    }

    const docType = await prisma.documentType.findUnique({
      where: { id: document_type_id },
      include: { department: true },
    });

    if (!docType) {
      return res.status(404).json({ error: 'Document type not found' });
    }

    const file_url = `/uploads/${req.file.filename}`;
    const file_name = req.file.originalname;

    // Check if submission already exists
    let submission = await prisma.documentSubmission.findFirst({
      where: {
        student_id: studentId,
        document_type_id: document_type_id,
      },
    });

    if (submission) {
      const newVersion = submission.status === 'rejected' || submission.status === 'pending'
        ? submission.version + 1
        : submission.version;

      submission = await prisma.documentSubmission.update({
        where: { id: submission.id },
        data: {
          status: 'pending',
          file_url,
          file_name,
          uploaded_at: new Date(),
          rejection_note: null, // Clear old rejection note on new upload
          version: newVersion,
        },
      });
    } else {
      submission = await prisma.documentSubmission.create({
        data: {
          student_id: studentId,
          document_type_id: document_type_id,
          status: 'pending',
          file_url,
          file_name,
          uploaded_at: new Date(),
          version: 1,
        },
      });
    }

    // Write audit log
    await logAudit({
      actorId: studentId,
      action: 'document.uploaded',
      targetType: 'document_submission',
      targetId: submission.id,
      metadata: { document_label: docType.label, file_name, version: submission.version },
    });

    return res.status(200).json({
      message: 'Document uploaded successfully and queued for verification',
      submission,
    });
  } catch (err) {
    console.error('uploadStudentDocument error:', err);
    return res.status(500).json({ error: 'Failed to upload clearance document' });
  }
}

async function getStudentProgress(req, res) {
  try {
    const studentId = req.user.id;

    const departments = await prisma.department.findMany({
      include: {
        document_types: {
          include: {
            submissions: {
              where: { student_id: studentId },
            },
          },
        },
      },
    });

    let totalDocs = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let notSubmittedCount = 0;

    const per_dept = departments.map((dept) => {
      let dTotal = dept.document_types.length;
      let dApproved = 0;
      let dPending = 0;
      let dRejected = 0;
      let dNotSubmitted = 0;

      for (const dt of dept.document_types) {
        totalDocs++;
        const sub = dt.submissions[0];
        const status = sub ? sub.status : 'not_submitted';

        if (status === 'approved') {
          dApproved++;
          approvedCount++;
        } else if (status === 'pending') {
          dPending++;
          pendingCount++;
        } else if (status === 'rejected') {
          dRejected++;
          rejectedCount++;
        } else {
          dNotSubmitted++;
          notSubmittedCount++;
        }
      }

      const dPct = dTotal > 0 ? Math.round((dApproved / dTotal) * 100) : 0;

      return {
        id: dept.id,
        name: dept.name,
        slug: dept.slug,
        icon: dept.icon,
        color: dept.color,
        total: dTotal,
        approved: dApproved,
        pending: dPending,
        rejected: dRejected,
        not_submitted: dNotSubmitted,
        percentage: dPct,
      };
    });

    const overall_pct = totalDocs > 0 ? Math.round((approvedCount / totalDocs) * 100) : 0;

    return res.json({
      overall_pct,
      approved_count: approvedCount,
      pending_count: pendingCount,
      rejected_count: rejectedCount,
      missing_count: notSubmittedCount,
      total_count: totalDocs,
      per_dept,
    });
  } catch (err) {
    console.error('getStudentProgress error:', err);
    return res.status(500).json({ error: 'Failed to calculate student clearance progress' });
  }
}

async function getStudentNotifications(req, res) {
  try {
    const studentId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { user_id: studentId },
      orderBy: { sent_at: 'desc' },
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return res.json({
      unread_count: unreadCount,
      notifications,
    });
  } catch (err) {
    console.error('getStudentNotifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

async function markNotificationsAsRead(req, res) {
  try {
    const studentId = req.user.id;
    await prisma.notification.updateMany({
      where: { user_id: studentId, is_read: false },
      data: { is_read: true },
    });

    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('markNotificationsAsRead error:', err);
    return res.status(500).json({ error: 'Failed to update notifications' });
  }
}

async function reportStudentIssue(req, res) {
  try {
    const studentId = req.user.id;
    const { department_id, subject, body } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and details are required' });
    }

    let dept = null;
    if (department_id) {
      dept = await prisma.department.findUnique({ where: { id: department_id } });
    }

    const newIssue = await prisma.issue.create({
      data: {
        reported_by: studentId,
        reporter_role: 'student',
        department_id: department_id || null,
        subject: subject.trim(),
        body: body.trim(),
        status: 'open',
      },
    });

    // Email notification to Super Admin
    await sendIssueFlaggedEmail({
      reporterName: `${req.user.name} (${req.user.matric_no})`,
      reporterRole: 'Student',
      departmentName: dept ? dept.name : 'General Clearance Inquiry',
      subject: subject.trim(),
      body: body.trim(),
    });

    await logAudit({
      actorId: studentId,
      action: 'issue.reported',
      targetType: 'issue',
      targetId: newIssue.id,
      metadata: { subject: newIssue.subject },
    });

    return res.status(201).json(newIssue);
  } catch (err) {
    console.error('reportStudentIssue error:', err);
    return res.status(500).json({ error: 'Failed to submit issue' });
  }
}

module.exports = {
  getStudentDocuments,
  uploadStudentDocument,
  getStudentProgress,
  getStudentNotifications,
  markNotificationsAsRead,
  reportStudentIssue,
};