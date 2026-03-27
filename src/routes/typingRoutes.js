const express = require('express');
const { addTypingResult, getLeaderboard } = require('../controllers/studentController');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

router.post('/submit', verifyToken, checkRole('STUDENT'), addTypingResult);
router.get('/leaderboard', verifyToken, checkRole('STUDENT', 'ADMIN', 'CEO'), getLeaderboard);

module.exports = router;
