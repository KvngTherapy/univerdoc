const { PrismaClient } = require('@prisma/client');
const { sendDocumentApprovedEmail, sendDocumentRejectedEmail, sendIssueFlaggedEmail } = require('../services/emailService');
const { logAudit } = require('../services/auditService');

const prisma = new PrismaClient();

async function getDeptQueue(req, res) {
  try {
    const deptId = req.user.department_id;
    if (!deptId) {
      return res.status(403).json({ error: 'User is not assigned to any department' });
    }

    const pendingSubmissions = await prisma.documentSubmission.findMany({
      where: {
        status: 'pending',
        document_type: {
          department_id: deptId,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            matric_no: true,
            email: true,
            username: true,
          },
        },
        document_type: true,
      },
      orderBy: {
        uploaded_at: 'asc', // Oldest first
      },
    });

    return res.json(pendingSubmissions);
  } catch (err) {
    console.error('getDeptQueue error:', err);
    return res.status(500).json({ error: 'Failed to fetch department queue' });
  }
}

async function getDeptHistory(req, res) {
  try {
    const deptId = req.user.department_id;
    if (!deptId) {
      return res.status(403).json({ error: 'User is not assigned to any department' });
    }

    const history = await prisma.documentSubmission.findMany({
      where: {
        status: { in: ['approved', 'rejected'] },
        document_type: {
          department_id: deptId,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            matric_no: true,
            email: true,
          },
        },
        document_type: true,
        reviewer: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        reviewed_at: 'desc',
      },
    });

    return res.json(history);
  } catch (err) {
    console.error('getDeptHistory error:', err);
    return res.status(500).json({ error: 'Failed to fetch review history' });
  }
}

async function approveDocument(req, res) {
  try {
    const { submission_id } = req.params;
    const deptId = req.user.department_id;

    const submission = await prisma.documentSubmission.findUnique({
      where: { id: submission_id },
      include: {
        document_type: { include: { department: true } },
        student: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.document_type.department_id !== deptId) {
      return res.status(403).json({ error: 'You can only approve documents belonging to your own department.' });
    }

    const updated = await prisma.documentSubmission.update({
      where: { id: submission_id },
      data: {
        status: 'approved',
        reviewed_at: new Date(),
        reviewed_by: req.user.id,
      },
      include: {
        document_type: true,
        student: true,
      },
    });

    // Create in-app notification for student
    await prisma.notification.create({
      data: {
        user_id: submission.student_id,
        subject: `UniverDoc: ${submission.document_type.label} Approved ✓`,
        body: `Your document "${submission.document_type.label}" has been officially verified and approved by ${submission.document_type.department.name}.`,
        type: 'approval',
      },
    });

    // Send email notification to student
    await sendDocumentApprovedEmail({
      to: submission.student.email,
      studentName: submission.student.name,
      matricNo: submission.student.matric_no,
      documentName: submission.document_type.label,
      departmentName: submission.document_type.department.name,
    });

    // Write audit log
    await logAudit({
      actorId: req.user.id,
      action: 'document.approved',
      targetType: 'document_submission',
      targetId: updated.id,
      metadata: {
        student_matric: submission.student.matric_no,
        document_slug: submission.document_type.slug,
      },
    });

    return res.json({ message: 'Document approved successfully', submission: updated });
  } catch (err) {
    console.error('approveDocument error:', err);
    return res.status(500).json({ error: 'Failed to approve document' });
  }
}

async function rejectDocument(req, res) {
  try {
    const { submission_id } = req.params;
    const { rejection_note } = req.body;
    const deptId = req.user.department_id;

    // Rule 4: Rejection reasons are mandatory
    if (!rejection_note || !rejection_note.trim()) {
      return res.status(400).json({ error: 'Rejection reason is mandatory.' });
    }

    const submission = await prisma.documentSubmission.findUnique({
      where: { id: submission_id },
      include: {
        document_type: { include: { department: true } },
        student: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.document_type.department_id !== deptId) {
      return res.status(403).json({ error: 'You can only reject documents belonging to your own department.' });
    }

    const updated = await prisma.documentSubmission.update({
      where: { id: submission_id },
      data: {
        status: 'rejected',
        rejection_note: rejection_note.trim(),
        reviewed_at: new Date(),
        reviewed_by: req.user.id,
      },
      include: {
        document_type: true,
        student: true,
      },
    });

    // Create in-app notification for student
    await prisma.notification.create({
      data: {
        user_id: submission.student_id,
        subject: `UniverDoc: Action Required — ${submission.document_type.label} Rejected`,
        body: `Your document "${submission.document_type.label}" was rejected by ${submission.document_type.department.name}. Reason: ${rejection_note.trim()}. Please review and resubmit.`,
        type: 'rejection',
      },
    });

    // Send rejection email to student
    await sendDocumentRejectedEmail({
      to: submission.student.email,
      studentName: submission.student.name,
      matricNo: submission.student.matric_no,
      documentName: submission.document_type.label,
      rejectionReason: rejection_note.trim(),
      departmentName: submission.document_type.department.name,
    });

    // Write audit log
    await logAudit({
      actorId: req.user.id,
      action: 'document.rejected',
      targetType: 'document_submission',
      targetId: updated.id,
      metadata: {
        student_matric: submission.student.matric_no,
        document_slug: submission.document_type.slug,
        rejection_note: rejection_note.trim(),
      },
    });

    return res.json({ message: 'Document rejected successfully', submission: updated });
  } catch (err) {
    console.error('rejectDocument error:', err);
    return res.status(500).json({ error: 'Failed to reject document' });
  }
}

async function getDeptIssues(req, res) {
  try {
    const deptId = req.user.department_id;
    const issues = await prisma.issue.findMany({
      where: {
        reported_by: req.user.id,
      },
      orderBy: { created_at: 'desc' },
    });

    return res.json(issues);
  } catch (err) {
    console.error('getDeptIssues error:', err);
    return res.status(500).json({ error: 'Failed to fetch department issues' });
  }
}

async function flagDeptIssue(req, res) {
  try {
    const { subject, body } = req.body;
    const deptId = req.user.department_id;

    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    const dept = await prisma.department.findUnique({ where: { id: deptId } });

    const newIssue = await prisma.issue.create({
      data: {
        reported_by: req.user.id,
        reporter_role: 'dept_staff',
        department_id: deptId,
        subject: subject.trim(),
        body: body.trim(),
        status: 'open',
      },
    });

    // Send issue email notification to superadmin
    await sendIssueFlaggedEmail({
      reporterName: req.user.name,
      reporterRole: 'Department Staff',
      departmentName: dept ? dept.name : 'Unknown Department',
      subject: subject.trim(),
      body: body.trim(),
    });

    await logAudit({
      actorId: req.user.id,
      action: 'issue.flagged',
      targetType: 'issue',
      targetId: newIssue.id,
      metadata: { subject: newIssue.subject },
    });

    return res.status(201).json(newIssue);
  } catch (err) {
    console.error('flagDeptIssue error:', err);
    return res.status(500).json({ error: 'Failed to report issue' });
  }
}

async function getDeptStats(req, res) {
  try {
    const deptId = req.user.department_id;
    const docTypes = await prisma.documentType.findMany({
      where: { department_id: deptId },
      select: { id: true },
    });
    const docTypeIds = docTypes.map((d) => d.id);

    const [pending, approved, rejected] = await Promise.all([
      prisma.documentSubmission.count({
        where: { document_type_id: { in: docTypeIds }, status: 'pending' },
      }),
      prisma.documentSubmission.count({
        where: { document_type_id: { in: docTypeIds }, status: 'approved' },
      }),
      prisma.documentSubmission.count({
        where: { document_type_id: { in: docTypeIds }, status: 'rejected' },
      }),
    ]);

    return res.json({ pending, approved, rejected });
  } catch (err) {
    console.error('getDeptStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch department statistics' });
  }
}

module.exports = {
  getDeptQueue,
  getDeptHistory,
  approveDocument,
  rejectDocument,
  getDeptIssues,
  flagDeptIssue,
  getDeptStats,
};