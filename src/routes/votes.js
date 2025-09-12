const express = require('express');
const { addVote } = require('../controllers/votes');
const { authenticateUser } = require('../middlewares/auth');

const router = express.Router();

// POST /api/votes  Voter pour un morceau
router.post('/', authenticateUser, addVote);

// GET /api/votes/my-votes
router.get("/my-votes", authenticateUser, getMyVotes);

module.exports = router;
