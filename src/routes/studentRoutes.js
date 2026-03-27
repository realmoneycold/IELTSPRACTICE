const express = require('express');
const { getMyTypingStats, addTypingResult, getLeaderboard } = require('../controllers/studentController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { verifyStudentAuth } = require('./studentAuth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Existing typing routes
router.get('/me/typing-stats', verifyToken, checkRole('STUDENT'), getMyTypingStats);
router.post('/me/typing-stats', verifyToken, checkRole('STUDENT'), addTypingResult);
router.get('/leaderboard', verifyToken, checkRole('STUDENT', 'ADMIN', 'CEO'), getLeaderboard);

// ─── STUDENT PROFILE ROUTES ─────────────────────────────────────────────────────

/**
 * GET /api/student/profile
 * Fetch student profile information
 */
router.get('/profile', verifyStudentAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch comprehensive student profile
    const student = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'STUDENT',
        is_verified: true
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        country: true,
        test_type: true,
        target_band: true,
        current_band: true,
        study_hours: true,
        tasks_done: true,
        weekly_goal_percent: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    // Format the response data
    const profileData = {
      id: student.id,
      fullName: student.full_name || '',
      email: student.email || '',
      phone: student.phone || '',
      country: student.country || '',
      testType: student.test_type || '',
      targetBand: student.target_band || 7.0,
      currentBand: student.current_band || 5.0,
      studyHours: student.study_hours || 0,
      tasksDone: student.tasks_done || 0,
      weeklyGoalPercent: student.weekly_goal_percent || 0,
      memberSince: student.createdAt,
      lastUpdated: student.updatedAt
    };

    res.json({
      success: true,
      message: 'Student profile retrieved successfully',
      data: {
        profile: profileData
      }
    });

  } catch (error) {
    console.error('Student profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/student/dashboard-stats
 * Fetch dashboard statistics for student
 */
router.get('/dashboard-stats', verifyStudentAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch student data for dashboard
    const student = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'STUDENT',
        is_verified: true
      },
      select: {
        id: true,
        full_name: true,
        target_band: true,
        current_band: true,
        study_hours: true,
        tasks_done: true,
        weekly_goal_percent: true,
        createdAt: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student data not found',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    // Calculate additional stats
    const bandProgress = student.target_band > 0 
      ? ((student.current_band / student.target_band) * 100).toFixed(1)
      : 0;

    const statsData = {
      fullName: student.full_name,
      targetBand: student.target_band || 7.0,
      currentBand: student.current_band || 5.0,
      bandProgress: parseFloat(bandProgress),
      studyHours: student.study_hours || 0,
      tasksDone: student.tasks_done || 0,
      weeklyGoalPercent: student.weekly_goal_percent || 0,
      memberSince: student.createdAt
    };

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        stats: statsData
      }
    });

  } catch (error) {
    console.error('Dashboard stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PUT /api/student/profile
 * Update student profile information
 */
router.put('/profile', verifyStudentAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, testType, targetBand } = req.body;

    // Update only allowed fields
    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (testType !== undefined) updateData.test_type = testType;
    if (targetBand !== undefined) updateData.target_band = parseFloat(targetBand);

    const updatedStudent = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        test_type: true,
        target_band: true,
        current_band: true,
        study_hours: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: {
          id: updatedStudent.id,
          fullName: updatedStudent.full_name,
          email: updatedStudent.email,
          phone: updatedStudent.phone || '',
          testType: updatedStudent.test_type || '',
          targetBand: updatedStudent.target_band,
          currentBand: updatedStudent.current_band,
          studyHours: updatedStudent.study_hours,
          lastUpdated: updatedStudent.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/student/dashboard-data
 * Fetch all dashboard data for student in one call
 */
router.get('/dashboard-data', verifyStudentAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch comprehensive student data
    const student = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'STUDENT',
        is_verified: true
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        country: true,
        test_type: true,
        target_band: true,
        current_band: true,
        study_hours: true,
        tasks_done: true,
        weekly_goal_percent: true,
        is_onboarded: true,
        exam_date: true,
        exam_date_text: true,
        target_band_range: true,
        study_commitment: true,
        referral_source: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student data not found',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    // Calculate additional metrics
    const bandProgress = student.target_band > 0 
      ? ((student.current_band / student.target_band) * 100).toFixed(1)
      : 0;

    const dashboardData = {
      id: student.id,
      fullName: student.full_name || '',
      email: student.email || '',
      phone: student.phone || '',
      country: student.country || '',
      testType: student.test_type || '',
      targetBand: student.target_band || 7.0,
      currentBand: student.current_band || 5.0,
      bandProgress: parseFloat(bandProgress),
      studyHours: student.study_hours || 0,
      tasksDone: student.tasks_done || 0,
      weeklyGoalPercent: student.weekly_goal_percent || 0,
      isOnboarded: student.is_onboarded || false,
      examDate: student.exam_date,
      examDateText: student.exam_date_text,
      targetBandRange: student.target_band_range,
      studyCommitment: student.study_commitment,
      referralSource: student.referral_source,
      memberSince: student.createdAt,
      lastUpdated: student.updatedAt
    };

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/student/onboarding
 * Save onboarding data for new student
 */
router.post('/onboarding', verifyStudentAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      examDate,
      examDateText,
      testType,
      targetBandRange,
      studyCommitment,
      referralSource
    } = req.body;

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        is_onboarded: true,
        exam_date: examDate ? new Date(examDate) : null,
        exam_date_text: examDateText || null,
        test_type: testType || null,
        target_band_range: targetBandRange || null,
        study_commitment: studyCommitment || null,
        referral_source: referralSource || null,
        updatedAt: new Date()
      }
    });

    // Fetch complete updated profile
    const profile = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'STUDENT',
        is_verified: true
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        country: true,
        test_type: true,
        target_band: true,
        current_band: true,
        study_hours: true,
        tasks_done: true,
        weekly_goal_percent: true,
        is_onboarded: true,
        exam_date: true,
        exam_date_text: true,
        target_band_range: true,
        study_commitment: true,
        referral_source: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        id: profile.id,
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        country: profile.country || '',
        testType: profile.test_type || '',
        targetBand: profile.target_band || 7.0,
        currentBand: profile.current_band || 5.0,
        bandProgress: profile.target_band > 0 
          ? ((profile.current_band / profile.target_band) * 100).toFixed(1)
          : 0,
        studyHours: profile.study_hours || 0,
        tasksDone: profile.tasks_done || 0,
        weeklyGoalPercent: profile.weekly_goal_percent || 0,
        isOnboarded: profile.is_onboarded,
        examDate: profile.exam_date,
        examDateText: profile.exam_date_text,
        targetBandRange: profile.target_band_range,
        studyCommitment: profile.study_commitment,
        referralSource: profile.referral_source,
        memberSince: profile.createdAt,
        lastUpdated: profile.updatedAt
      }
    });

  } catch (error) {
    console.error('Onboarding save error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/student/reset-onboarding
 * Reset onboarding status for testing
 */
router.post('/reset-onboarding', verifyStudentAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Reset user onboarding status
    await prisma.user.update({
      where: { id: userId },
      data: {
        is_onboarded: false,
        exam_date: null,
        exam_date_text: null,
        target_band_range: null,
        study_commitment: null,
        referral_source: null
      }
    });

    res.json({
      success: true,
      message: 'Onboarding reset successfully'
    });

  } catch (error) {
    console.error('Reset onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;

