const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function logAudit({ actorId, action, targetType = null, targetId = null, metadata = null }) {
  try {
    const metaStr = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;
    return await prisma.auditLog.create({
      data: {
        actor_id: actorId || null,
        action,
        target_type: targetType,
        target_id: targetId,
        metadata: metaStr,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
    return null;
  }
}

module.exports = {
  logAudit,
};