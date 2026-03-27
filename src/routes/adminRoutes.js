// ═════════════════════════════════════════════════════════════════════════
// routes/admin.js  — IELTSPRACTICE Admin Operations API v2
//
// Mount in app.js:
//   const adminRoutes = require('./routes/admin');
//   app.use('/api/admin', adminRoutes);   // JWT auth applied inside
//
// Install dependencies:
//   npm install @google/generative-ai jsonwebtoken bcryptjs
//
// Required environment variables:
//   GEMINI_API_KEY=your_key_here
//   JWT_SECRET=your_jwt_secret
// ═════════════════════════════════════════════════════════════════════════

'use strict';

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();

// Initialise Gemini AI
const genAI       = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


// ─── MIDDLEWARE: requireStaff ─────────────────────────────────────────────────
// Validates Bearer JWT and checks role is ADMIN or CEO.
// Sets req.user = { id, email, role, name } on success.
// ALL /api/admin/* routes are protected by this middleware.
function requireStaff(req, res, next) {
  const auth  = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!['ADMIN', 'CEO'].includes(decoded.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions — ADMIN or CEO role required' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    } else {
      return res.status(500).json({ success: false, error: 'Authentication error' });
    }
  }
}

// Apply middleware to all admin routes
router.use(requireStaff);

// ─────────────────────────────────────────────────────────────
// ██  AI INTEGRATION  ██
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/admin/ai-parse
 * Uses Gemini AI to extract questions from raw text
 * Body: { text: "raw practice test content" }
 */
router.post('/ai-parse', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: 'Text is required' });
  }

  try {
    const prompt = `
You are an IELTS practice test question extractor. Extract questions from the following text and return a structured JSON array.

Requirements:
1. Each question must have: questionText, type (MULTIPLE_CHOICE/FILL_BLANKS/TRUE_FALSE), correctAnswer, options (array for MC only)
2. For multiple choice: include all options in the options array
3. For fill-in-the-blanks: set options to null
4. For true/false: set options to ["true", "false"]
5. Return ONLY valid JSON array, no explanations

Text to process:
${text}

Expected format:
[
  {
    "questionText": "What is the capital of France?",
    "type": "MULTIPLE_CHOICE",
    "correctAnswer": "Paris",
    "options": ["Paris", "London", "Berlin", "Madrid"]
  }
]
`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();
    
    // Clean up response and parse JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ success: false, error: 'Failed to parse AI response' });
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data: questions });
  } catch (err) {
    console.error('AI Parse Error:', err);
    res.status(500).json({ success: false, error: 'AI parsing failed' });
  }
});

// ─────────────────────────────────────────────────────────────
// ██  TASKS MANAGEMENT  ██
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/tasks
 * Fetch tasks for the logged-in admin
 */
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.adminTask.findMany({
      where: { adminId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ██  PRACTICE TESTS  ██
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/admin/tests
 * Save a full practice test with nested questions in one transaction
 */
router.post('/tests', async (req, res) => {
  const { 
    title, 
    testType, 
    practiceMode, 
    focusArea, 
    durationMins, 
    instructions, 
    passage, 
    audioUrl, 
    questions 
  } = req.body;

  if (!title || !testType || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ 
      success: false, 
      error: 'title, testType, and questions array are required' 
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create the practice test
      const test = await tx.practiceTest.create({
        data: {
          title,
          testType: testType.toUpperCase(),
          practiceMode: practiceMode?.toUpperCase() || 'FULL',
          focusArea,
          durationMins: durationMins || 60,
          instructions,
          passage,
          audioUrl,
          createdById: req.user.id
        }
      });

      // Create all questions for this test
      const questionData = questions.map((q, index) => ({
        testId: test.id,
        questionText: q.questionText,
        type: q.type?.toUpperCase() || 'MULTIPLE_CHOICE',
        options: q.options || null,
        correctAnswer: q.correctAnswer,
        orderIndex: index
      }));

      await tx.question.createMany({
        data: questionData
      });

      return test;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Test Creation Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/tests
 * List all practice tests created by this admin
 */
router.get('/tests', async (req, res) => {
  try {
    const tests = await prisma.practiceTest.findMany({
      where: { createdById: req.user.id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: tests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ██  REPORTS MANAGEMENT  ██
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/reports
 * Fetch system and student-reported issues
 */
router.get('/reports', async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        student: {
          select: { id: true, full_name: true, email: true }
        },
        test: {
          select: { id: true, title: true }
        },
        question: {
          select: { id: true, questionText: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/reports/:id/resolve
 * Mark a report as resolved
 */
router.patch('/reports/:id/resolve', async (req, res) => {
  const { resolutionNote } = req.body;
  const reportId = parseInt(req.params.id);

  try {
    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolvedById: req.user.id,
        resolutionNote,
        resolvedAt: new Date()
      }
    });

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ██  PROFILE MANAGEMENT  ██
// ─────────────────────────────────────────────────────────────

/**
 * PATCH /api/admin/profile
 * Update name, password, and profile image
 */
router.patch('/profile', async (req, res) => {
  const { name, password, profileImage } = req.body;
  const updateData = {};

  try {
    if (name) updateData.name = name;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }
    if (profileImage) updateData.profileImage = profileImage;

    const admin = await prisma.admin.update({
      where: { id: req.user.id },
      data: updateData
    });

    // Remove sensitive data from response
    const { passwordHash, ...safeAdmin } = admin;
    res.json({ success: true, data: safeAdmin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/profile
 * Get current admin profile
 */
router.get('/profile', async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        lastSeenAt: true,
        createdAt: true
      }
    });

    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ██  STATISTICS & DASHBOARD  ██
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Get dashboard statistics for current admin
 */
router.get('/stats', async (req, res) => {
  try {
    const [testStats, reportStats, taskStats] = await Promise.all([
      // Test statistics
      prisma.practiceTest.aggregate({
        where: { createdById: req.user.id },
        _count: { id: true },
        _sum: { durationMins: true }
      }),
      // Report statistics
      prisma.report.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      // Task statistics
      prisma.adminTask.aggregate({
        where: { adminId: req.user.id },
        _count: { id: true },
        where: { isDone: true }
      })
    ]);

    res.json({ 
      success: true, 
      data: {
        tests: {
          total: testStats._count.id || 0,
          totalMinutes: testStats._sum.durationMins || 0
        },
        reports: reportStats.reduce((acc, curr) => {
          acc[curr.status] = curr._count.id;
          return acc;
        }, {}),
        tasks: {
          completed: taskStats._count.id || 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
