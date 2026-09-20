const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { sendWeeklyPendingSummaryEmail } = require('../services/emailService');

const prisma = new PrismaClient();

async function runWeeklySummaryNow(targetDeptSlug = null) {
  try {
    const whereDept = targetDeptSlug ? { slug: targetDeptSlug } : {};
    const departments = await prisma.department.findMany({
      where: whereDept,
      include: {
        staff: {
          where: { is_active: true },
        },
        document_types: {
          include: {
            submissions: {
              where: { status: 'pending' },
              include: {
                student: true,
                document_type: true,
              },
              orderBy: { uploaded_at: 'asc' },
            },
          },
        },
      },
    });

    const results = [];

    for (const dept of departments) {
      // Flatten all pending submissions for this department
      const pendingSubmissions = [];
      for (const dt of dept.document_types) {
        for (const sub of dt.submissions) {
          pendingSubmissions.push(sub);
        }
      }

      // Sort by uploaded_at ascending (oldest first)
      pendingSubmissions.sort((a, b) => new Date(a.uploaded_at || 0) - new Date(b.uploaded_at || 0));

      const count = pendingSubmissions.length;
      const oldestDate = pendingSubmissions.length > 0 ? pendingSubmissions[0].uploaded_at : null;

      // Send to each active staff member
      for (const staff of dept.staff) {
        await sendWeeklyPendingSummaryEmail({
          to: staff.email,
          deptName: dept.name,
          count,
          documents: pendingSubmissions,
          oldestSubmissionDate: oldestDate,
        });
      }

      results.push({
        department: dept.name,
        slug: dept.slug,
        pendingCount: count,
        staffEmailed: dept.staff.map((s) => s.email),
      });
    }

    return results;
  } catch (err) {
    console.error('Error executing weekly summary job:', err);
    throw err;
  }
}

function initWeeklySummaryCron() {
  // Run every Monday at 8:00 AM (0 8 * * 1)
  cron.schedule('0 8 * * 1', async () => {
    console.log('[node-cron] Running scheduled weekly pending documents summary...');
    try {
      await runWeeklySummaryNow();
      console.log('[node-cron] Weekly pending documents summary completed successfully.');
    } catch (err) {
      console.error('[node-cron] Failed to execute weekly pending documents summary:', err);
    }
  });
  console.log('[node-cron] Scheduled weekly summary for Mondays at 8:00 AM.');
}

module.exports = {
  initWeeklySummaryCron,
  runWeeklySummaryNow,
};