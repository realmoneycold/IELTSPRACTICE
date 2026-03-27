// ═══════════════════════════════════════════════════════════════
// Education Centre Dashboard Routes - IELTSPRACTICE
// Protected routes for education centre administrators
// ═══════════════════════════════════════════════════════════════

'use strict';

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyCentreAccess } = require('./educationAuth');

const prisma = new PrismaClient();

// ─── PROTECTED DASHBOARD ROUTES ─────────────────────────────────────────────────────────────
// All routes below require valid JWT with CENTRE_ADMIN role

/**
 * GET /api/education/dashboard
 * Get dashboard statistics for the authenticated centre
 */
router.get('/dashboard', verifyCentreAccess, async (req, res) => {
  try {
    const centreId = req.user.centreId;
    
    // Get centre information
    const centre = await prisma.educationCentre.findUnique({
      where: { id: centreId },
      select: {
        id: true,
        name: true,
        location: true,
        code: true
      }
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        error: 'Centre not found',
        code: 'CENTRE_NOT_FOUND'
      });
    }

    // Get centre-specific statistics
    const [totalUsers, activeUsers] = await Promise.all([
      prisma.centreUser.count({
        where: { centreId, isActive: true }
      }),
      prisma.centreUser.count({
        where: { 
          centreId, 
          isActive: true,
          lastLoginAt: { not: null }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        centre,
        statistics: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers
        }
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/education/users
 * Get all users for the authenticated centre (centre-specific filtering)
 */
router.get('/users', verifyCentreAccess, async (req, res) => {
  try {
    const centreId = req.user.centreId;
    const { page = 1, limit = 10, search = '' } = req.query;

    const where = {
      centreId,
      isActive: true
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.centreUser.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          lastLoginAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.centreUser.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/education/users
 * Create a new user for the authenticated centre
 */
router.post('/users', verifyCentreAccess, async (req, res) => {
  try {
    const centreId = req.user.centreId;
    const { email, fullName, password, role = 'CENTRE_STAFF' } = req.body;

    // Validation
    if (!email || !fullName || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, full name, and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Check if email already exists in this centre
    const existingUser = await prisma.centreUser.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        centreId
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'A user with this email already exists in this centre',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.centreUser.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName: fullName.trim(),
        role,
        centreId
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
