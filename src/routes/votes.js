const express = require('express');
const { addVote } = require('../controllers/votes'); // chemin vers ton fichier
const { authenticateUser } = require('../middlewares/auth');

const router = express.Router();

// POST /api/votes  Voter pour un morceau
router.post('/', authenticateUser, addVote);

module.exports = router;
