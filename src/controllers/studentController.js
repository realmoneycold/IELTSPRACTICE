const prisma = require('../models/prisma');

async function getMyTypingStats(req, res) {
  try {
    const userId = req.user.id;

    const results = await prisma.typingResult.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return res.json({ results });
  } catch (err) {
    console.error('Get my typing stats error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function addTypingResult(req, res) {
  try {
    const userId = req.user.id;
    const { wpm, accuracy, durationMinutes } = req.body || {};

    if (typeof wpm !== 'number' || typeof accuracy !== 'number') {
      return res.status(400).json({ message: 'wpm and accuracy must be numbers' });
    }

    const record = await prisma.typingResult.create({
      data: {
        userId,
        wpm,
        accuracy,
        durationMinutes: typeof durationMinutes === 'number' && durationMinutes >= 0 ? durationMinutes : 2,
      },
    });

    return res.status(201).json({ message: 'Typing result saved', result: record });
  } catch (err) {
    console.error('Add typing result error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getLeaderboard(req, res) {
  try {
    // Simple leaderboard: best WPM per user, ordered desc.
    const leaderboard = await prisma.$queryRawUnsafe(`
      SELECT
        u.id,
        u.full_name,
        u.country,
        MAX(t."wpm") as best_wpm,
        AVG(t."accuracy") as avg_accuracy
      FROM "TypingResult" t
      JOIN "User" u ON u.id = t."userId"
      GROUP BY u.id, u.full_name, u.country
      ORDER BY best_wpm DESC
      LIMIT 50
    `);

    return res.json({ leaderboard });
  } catch (err) {
    console.error('Get leaderboard error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getMyTypingStats,
  addTypingResult,
  getLeaderboard,
};

