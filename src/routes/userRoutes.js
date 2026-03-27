const express = require('express');
const { getProfile, getPerformanceHistory, getPracticeStats, getNextExamDate, getStudyStreak } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.get('/performance-history', verifyToken, getPerformanceHistory);
router.get('/practice-stats', verifyToken, getPracticeStats);
router.get('/next-exam', verifyToken, getNextExamDate);
router.get('/study-streak', verifyToken, getStudyStreak);

module.exports = router;
