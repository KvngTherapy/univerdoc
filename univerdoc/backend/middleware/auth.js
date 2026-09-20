const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'univerdoc_super_secret_jwt_key_2026_nbte_pti_effurun';

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id },
      include: { department: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated. Please contact Super Administrator.' });
    }

    req.user = user;
    req.jwtPayload = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

function requireRole(allowedRoles) {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.user || !rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Authorized roles: ${rolesArray.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
  JWT_SECRET,
};