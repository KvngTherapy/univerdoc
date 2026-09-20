const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateRandomPassword } = require('../utils/generatePassword');
const { sendCredentialIssuedEmail } = require('../services/emailService');
const { logAudit } = require('../services/auditService');
const { runWeeklySummaryNow } = require('../jobs/weeklySummary');

const prisma = new PrismaClient();

async function getDepartments(req, res) {
  try {
    const departments = await prisma.department.findMany({
      include: {
        staff: {
          orderBy: { slot_number: 'asc' },
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            slot_number: true,
            is_active: true,
            is_logged_in: true,
            updated_at: true,
          },
        },
        document_types: true,
      },
    });

    return res.json(departments);
  } catch (err) {
    console.error('getDepartments error:', err);
    return res.status(500).json({ error: 'Failed to fetch departments' });
  }
}

async function resetCredentials(req, res) {
  try {
    const { dept_id, slot_number } = req.body;

    if (!dept_id || !slot_number) {
      return res.status(400).json({ error: 'dept_id and slot_number are required' });
    }

    const dept = await prisma.department.findUnique({ where: { id: dept_id } });
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const staff = await prisma.user.findFirst({
      where: {
        department_id: dept_id,
        slot_number: parseInt(slot_number, 10),
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff credential slot not found' });
    }

    // Generate random 12-char secure password
    const plainPassword = generateRandomPassword(12);
    const password_hash = await bcrypt.hash(plainPassword, 12);

    // Update in database, also reset session
    await prisma.user.update({
      where: { id: staff.id },
      data: {
        password_hash,
        is_logged_in: false,
      },
    });

    // Write to audit log
    await logAudit({
      actorId: req.user.id,
      action: 'credentials.reset',
      targetType: 'user',
      targetId: staff.id,
      metadata: { department: dept.slug, slot_number, username: staff.username },
    });

    // Send email notification with credentials
    await sendCredentialIssuedEmail({
      to: staff.email,
      deptName: dept.name,
      slotNumber: staff.slot_number,
      username: staff.username,
      plainPassword,
    });

    return res.json({
      message: 'Password reset successfully',
      username: staff.username,
      password: plainPassword,
      slot_number: staff.slot_number,
      dept_name: dept.name,
    });
  } catch (err) {
    console.error('resetCredentials error:', err);
    return res.status(500).json({ error: 'Failed to reset credentials' });
  }
}

async function toggleSlot(req, res) {
  try {
    const { user_id, is_active } = req.body;

    if (user_id === undefined || is_active === undefined) {
      return res.status(400).json({ error: 'user_id and is_active are required' });
    }

    const updateData = { is_active: Boolean(is_active) };
    if (!is_active) {
      updateData.is_logged_in = false;
    }

    const updated = await prisma.user.update({
      where: { id: user_id },
      data: updateData,
    });

    await logAudit({
      actorId: req.user.id,
      action: 'credentials.toggle',
      targetType: 'user',
      targetId: updated.id,
      metadata: { is_active: updated.is_active, username: updated.username },
    });

    return res.json(updated);
  } catch (err) {
    console.error('toggleSlot error:', err);
    return res.status(500).json({ error: 'Failed to update slot status' });
  }
}

async function forceLogout(req, res) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const updated = await prisma.user.update({
      where: { id: user_id },
      data: { is_logged_in: false },
    });

    await logAudit({
      actorId: req.user.id,
      action: 'credentials.force_logout',
      targetType: 'user',
      targetId: updated.id,
      metadata: { username: updated.username },
    });

    return res.json({ message: 'Session forcefully terminated', user_id: updated.id });
  } catch (err) {
    console.error('forceLogout error:', err);
    return res.status(500).json({ error: 'Failed to force logout slot' });
  }
}

async function getStudents(req, res) {
  try {
    const totalRequiredDocs = await prisma.documentType.count({ where: { is_required: true } });

    const students = await prisma.user.findMany({
      where: { role: 'student' },
      include: {
        submissions: {
          select: {
            id: true,
            status: true,
            document_type_id: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const studentsWithProgress = students.map((s) => {
      const approvedCount = s.submissions.filter((sub) => sub.status === 'approved').length;
      const progress = totalRequiredDocs > 0 ? Math.round((approvedCount / totalRequiredDocs) * 100) : 0;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        matric_no: s.matric_no,
        username: s.username,
        is_active: s.is_active,
        progress,
        approved_count: approvedCount,
        total_docs: totalRequiredDocs,
        created_at: s.created_at,
      };
    });

    return res.json(studentsWithProgress);
  } catch (err) {
    console.error('getStudents error:', err);
    return res.status(500).json({ error: 'Failed to fetch students registry' });
  }
}

async function getIssues(req, res) {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, email: true, username: true, role: true, matric_no: true },
        },
        department: true,
        resolver: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.json(issues);
  } catch (err) {
    console.error('getIssues error:', err);
    return res.status(500).json({ error: 'Failed to fetch issues' });
  }
}

async function resolveIssue(req, res) {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        status: 'resolved',
        resolved_by: req.user.id,
        resolved_at: new Date(),
      },
    });

    await logAudit({
      actorId: req.user.id,
      action: 'issue.resolved',
      targetType: 'issue',
      targetId: updated.id,
      metadata: { subject: updated.subject },
    });

    return res.json(updated);
  } catch (err) {
    console.error('resolveIssue error:', err);
    return res.status(500).json({ error: 'Failed to resolve issue' });
  }
}

async function getStats(req, res) {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'student' } });
    const totalDepts = await prisma.department.count();
    const openIssues = await prisma.issue.count({ where: { status: 'open' } });
    const activeSessions = await prisma.user.count({
      where: { role: 'dept_staff', is_logged_in: true },
    });

    return res.json({
      total_students: totalStudents,
      total_depts: totalDepts,
      open_issues: openIssues,
      active_sessions: activeSessions,
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch platform statistics' });
  }
}

async function getAuditLogs(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, username: true, role: true },
          },
        },
      }),
    ]);

    return res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      logs,
    });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
}

async function triggerWeeklySummary(req, res) {
  try {
    const result = await runWeeklySummaryNow();
    return res.json({ message: 'Weekly summary email batch sent successfully', result });
  } catch (err) {
    console.error('triggerWeeklySummary error:', err);
    return res.status(500).json({ error: 'Failed to trigger weekly summary' });
  }
}

module.exports = {
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
};