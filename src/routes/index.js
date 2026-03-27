const express = require('express');
const authRoutes = require('./authRoutes');
const adminAuthRoutes = require('./adminAuthRoutes');
const educationAuthRoutes = require('./educationAuth');
const educationRoutes = require('./educationRoutes');
const teacherAuthRoutes = require('./teacherAuth');
const teacherDashboardRoutes = require('./teacherDashboard');
const studentAuthRoutes = require('./studentAuth');
const partnerRoutes = require('./partnerRoutes');
const studentRoutes = require('./studentRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');
const typingRoutes = require('./typingRoutes');
const ceoRoutes = require('./ceoRoutes');
const requireCeoAuth = require('../middleware/ceoAuth');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/auth/admin', adminAuthRoutes);
router.use('/auth/education', educationAuthRoutes);
router.use('/auth/teacher', teacherAuthRoutes);
router.use('/auth/student', studentAuthRoutes);
router.use('/education', educationRoutes);
router.use('/teacher', teacherDashboardRoutes);
router.use('/public', educationAuthRoutes); // For public centres endpoint
router.use('/partners', partnerRoutes);
router.use('/student', studentRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/typing', typingRoutes);
router.use('/ceo', requireCeoAuth, ceoRoutes);

module.exports = router;

