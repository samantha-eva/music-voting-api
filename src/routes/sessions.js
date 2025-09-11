const express = require('express');
const router = express.Router();
const {
  getSessions,
  getSessionsToday,
  getSessionById,
  getSessionsByDate
} = require('../controllers/sessions');

const authMiddleware = require('../middleware/auth');

// GET /api/sessions
router.get('/', getSessions);

// GET /api/sessions/today
router.get('/today', authMiddleware, getSessionsToday);

// GET /api/sessions/:id
router.get('/:id', getSessionById);

// GET /api/sessions/by-date/:date
router.get('/by-date/:date', getSessionsByDate);

module.exports = router;
