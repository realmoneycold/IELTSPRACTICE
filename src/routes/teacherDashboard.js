// ═══════════════════════════════════════════════════════════════
// Teacher Dashboard API - IELTSPRACTICE
// Handles teacher dashboard functionality
// ═════════════════════════════════════════════════════════════

'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { verifyTeacherAuth } = require('./teacherAuth');

const prisma = new PrismaClient();

// ─── MULTER CONFIGURATION ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/materials/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and PPTX files are allowed.'), false);
    }
  }
});

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────────
/**
 * GET /api/teacher/dashboard-stats
 * Fetch dashboard statistics for teacher
 */
router.get('/dashboard-stats', verifyTeacherAuth, async (req, res) => {
  const teacherId = req.user.id;

  try {
    // Get next lesson countdown
    const nextLesson = await prisma.lesson.findFirst({
      where: {
        teacherId: teacherId,
        status: 'SCHEDULED',
        startTime: {
          gte: new Date()
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Get follower count
    const followerCount = await prisma.follow.count({
      where: {
        teacherId: teacherId
      }
    });

    // Get total hours taught (completed lessons)
    const completedLessons = await prisma.lesson.findMany({
      where: {
        teacherId: teacherId,
        status: 'COMPLETED'
      },
      select: {
        startTime: true
      }
    });

    // Calculate total hours (assuming each lesson is 1 hour)
    const hoursTaught = completedLessons.length;

    // Calculate countdown to next lesson
    let countdown = null;
    if (nextLesson) {
      const now = new Date();
      const lessonTime = new Date(nextLesson.startTime);
      const diff = lessonTime - now;
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdown = {
          hours,
          minutes,
          seconds,
          total: diff
        };
      }
    }

    res.json({
      success: true,
      data: {
        nextLesson: nextLesson,
        countdown,
        followerCount,
        hoursTaught,
        completedLessons: completedLessons.length
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      code: 'STATS_ERROR'
    });
  }
});

// ─── GET LESSONS ─────────────────────────────────────────────────────────────
/**
 * GET /api/teacher/lessons
 * Fetch all lessons for the logged-in teacher
 */
router.get('/lessons', verifyTeacherAuth, async (req, res) => {
  const teacherId = req.user.id;
  const { status, page = 1, limit = 10 } = req.query;

  try {
    const where = { teacherId };
    if (status) {
      where.status = status;
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: {
        startTime: 'desc'
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        materials: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileUrl: true,
            createdAt: true
          }
        }
      }
    });

    const total = await prisma.lesson.count({ where });

    res.json({
      success: true,
      data: {
        lessons,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lessons',
      code: 'LESSONS_ERROR'
    });
  }
});

// ─── CREATE LESSON ─────────────────────────────────────────────────────────────
/**
 * POST /api/teacher/lessons
 * Create a new lesson
 */
router.post('/lessons', verifyTeacherAuth, async (req, res) => {
  const teacherId = req.user.id;
  const { title, zoomLink, startTime } = req.body;

  // Input validation
  if (!title || !zoomLink || !startTime) {
    return res.status(400).json({
      success: false,
      error: 'Title, Zoom link, and start time are required',
      code: 'MISSING_FIELDS'
    });
  }

  try {
    const lesson = await prisma.lesson.create({
      data: {
        title,
        zoomLink,
        startTime: new Date(startTime),
        teacherId,
        status: 'SCHEDULED'
      }
    });

    res.json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lesson',
      code: 'CREATE_LESSON_ERROR'
    });
  }
});

// ─── GET FOLLOWERS ─────────────────────────────────────────────────────────────
/**
 * GET /api/teacher/followers
 * Fetch list of students following this teacher
 */
router.get('/followers', verifyTeacherAuth, async (req, res) => {
  const teacherId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const follows = await prisma.follow.findMany({
      where: {
        teacherId
      },
      include: {
        student: {
          select: {
            id: true,
            full_name: true,
            email: true,
            country: true,
            current_band: true,
            target_band: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.follow.count({
      where: { teacherId }
    });

    res.json({
      success: true,
      data: {
        followers: follows.map(follow => follow.student),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch followers',
      code: 'FOLLOWERS_ERROR'
    });
  }
});

// ─── UPLOAD MATERIAL ─────────────────────────────────────────────────────────────
/**
 * POST /api/teacher/materials
 * Upload a material file
 */
router.post('/materials', verifyTeacherAuth, upload.single('file'), async (req, res) => {
  const teacherId = req.user.id;
  const { lessonId } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
      code: 'NO_FILE'
    });
  }

  try {
    const material = await prisma.material.create({
      data: {
        fileName: req.file.originalname,
        fileUrl: `/uploads/materials/${req.file.filename}`,
        fileType: req.file.mimetype,
        teacherId,
        lessonId: lessonId ? parseInt(lessonId) : null
      }
    });

    res.json({
      success: true,
      message: 'Material uploaded successfully',
      data: material
    });

  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload material',
      code: 'UPLOAD_ERROR'
    });
  }
});

// ─── GET MATERIALS ─────────────────────────────────────────────────────────────
/**
 * GET /api/teacher/materials
 * Retrieve list of materials for the teacher
 */
router.get('/materials', verifyTeacherAuth, async (req, res) => {
  const teacherId = req.user.id;
  const { lessonId, page = 1, limit = 10 } = req.query;

  try {
    const where = { teacherId };
    if (lessonId) {
      where.lessonId = parseInt(lessonId);
    }

    const materials = await prisma.material.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.material.count({ where });

    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch materials',
      code: 'MATERIALS_ERROR'
    });
  }
});

module.exports = router;
