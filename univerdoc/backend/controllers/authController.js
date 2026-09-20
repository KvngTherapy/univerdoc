const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { isValidMatricNo } = require('../utils/matricValidator');
const { sendRegistrationWelcomeEmail } = require('../services/emailService');
const { logAudit } = require('../services/auditService');

const prisma = new PrismaClient();

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username.trim(),
        },
      },
      include: {
        department: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact the Super Administrator.' });
    }

    // Rule 3: Concurrent session enforcement for dept_staff
    if (user.role === 'dept_staff') {
      if (user.is_logged_in) {
        return res.status(403).json({ error: 'This account is already in use' });
      }

      // Mark slot as logged in
      await prisma.user.update({
        where: { id: user.id },
        data: { is_logged_in: true },
      });
    }

    // Generate JWT token expiring in 8 hours
    const payload = {
      user_id: user.id,
      role: user.role,
      department_id: user.department_id,
      slot_number: user.slot_number,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Write audit log
    await logAudit({
      actorId: user.id,
      action: 'auth.login',
      targetType: 'user',
      targetId: user.id,
      metadata: { role: user.role, username: user.username },
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        department_id: user.department_id,
        department_slug: user.department ? user.department.slug : null,
        department_name: user.department ? user.department.name : null,
        slot_number: user.slot_number,
        matric_no: user.matric_no,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  }
}

async function register(req, res) {
  try {
    const { name, email, matric_no, username, password } = req.body;

    if (!name || !email || !matric_no || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const trimmedMatric = matric_no.trim();
    if (!isValidMatricNo(trimmedMatric)) {
      return res.status(400).json({
        error: 'Invalid Matric Number format. Must match M.YY/PROGRAM/DEPT/NUMBER (e.g. M.24/ND/PEG/11245)',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check uniqueness
    const existingMatric = await prisma.user.findUnique({ where: { matric_no: trimmedMatric } });
    if (existingMatric) {
      return res.status(400).json({ error: 'A student with this Matric Number is already registered.' });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email address is already in use.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Hash password with 12 rounds
    const password_hash = await bcrypt.hash(password, 12);

    const newStudent = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim(),
        matric_no: trimmedMatric,
        password_hash,
        role: 'student',
        is_active: true,
        is_logged_in: false,
      },
    });

    // Populate default document submissions for all document types
    const docTypes = await prisma.documentType.findMany();
    for (const dt of docTypes) {
      await prisma.documentSubmission.create({
        data: {
          student_id: newStudent.id,
          document_type_id: dt.id,
          status: 'not_submitted',
          version: 1,
        },
      });
    }

    // Create in-app welcome notification
    await prisma.notification.create({
      data: {
        user_id: newStudent.id,
        subject: `Welcome to UniverDoc, ${newStudent.name}`,
        body: `Your PTI student clearance account (Matric: ${newStudent.matric_no}) has been created successfully. Submit your clearance documents to proceed with admission verification.`,
        type: 'system',
      },
    });

    // Send welcome email via Nodemailer
    await sendRegistrationWelcomeEmail({
      to: newStudent.email,
      studentName: newStudent.name,
      matricNo: newStudent.matric_no,
      username: newStudent.username,
    });

    // Audit log
    await logAudit({
      actorId: newStudent.id,
      action: 'student.registered',
      targetType: 'user',
      targetId: newStudent.id,
      metadata: { matric_no: newStudent.matric_no, username: newStudent.username },
    });

    return res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'An error occurred during registration. Please try again.' });
  }
}

async function logout(req, res) {
  try {
    if (req.user && req.user.role === 'dept_staff') {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { is_logged_in: false },
      });
    }

    if (req.user) {
      await logAudit({
        actorId: req.user.id,
        action: 'auth.logout',
        targetType: 'user',
        targetId: req.user.id,
        metadata: { username: req.user.username },
      });
    }

    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Error during logout' });
  }
}

async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { department: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      department_id: user.department_id,
      department_slug: user.department ? user.department.slug : null,
      department_name: user.department ? user.department.name : null,
      slot_number: user.slot_number,
      matric_no: user.matric_no,
      is_active: user.is_active,
      is_logged_in: user.is_logged_in,
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ error: 'Error fetching profile' });
  }
}

module.exports = {
  login,
  register,
  logout,
  getMe,
};