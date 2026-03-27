const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../models/prisma');

const VERIFICATION_CODE_TTL_MINUTES = 15;

function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000);
  return String(code);
}

async function signup(req, res) {
  try {
    const { full_name, email, password, country, role } = req.body || {};

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'full_name, email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const requestedRole = (role || 'STUDENT').toUpperCase();

    // Public registration must never be able to mint administrative accounts.
    if (requestedRole === 'ADMIN' || requestedRole === 'CEO') {
      return res
        .status(403)
        .json({ message: 'You cannot register an administrative account via this form.' });
    }

    const allowedPublicRoles = ['STUDENT']; // extend with 'CENTRE' later if needed
    const userRole = allowedPublicRoles.includes(requestedRole) ? requestedRole : 'STUDENT';

    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        password: hashed,
        country: country || null,
        role: userRole,
        current_band: 5.0,
        tasks_done: 0,
      },
    });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);

    await prisma.verificationCode.create({
      data: {
        email: user.email,
        code,
        expiresAt,
      },
    });

    // In real production you would send this via email.
    return res.status(201).json({
      message: 'User registered. Please verify your email using the code sent.',
      email: user.email,
      verificationCode: code,
    });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function verifyEmail(req, res) {
  try {
    const { email, code } = req.body || {};

    if (!email || !code) {
      return res.status(400).json({ message: 'email and code are required' });
    }

    const record = await prisma.verificationCode.findFirst({
      where: { email, code },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    await prisma.user.update({
      where: { email },
      data: { is_verified: true },
    });

    await prisma.verificationCode.deleteMany({ where: { email } });

    return res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify email error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password, role } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    if (!role) {
      return res.status(400).json({ message: 'role is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    // Strict role verification - the requested role must match the user's actual role
    if (role.toUpperCase() !== user.role) {
      return res.status(403).json({ message: 'Invalid role for this portal' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      role: user.role,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        country: user.country,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  signup,
  verifyEmail,
  login,
};

