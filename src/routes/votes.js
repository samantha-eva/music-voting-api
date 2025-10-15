const express = require('express');
const router = express.Router();
const votesController = require('../controllers/votes');
const verifyJWT = require('../middleware/auth');

// Vérifier si l'utilisateur a déjà voté pour cette session
router.get('/user/:userId/session/:sessionId', votesController.hasUserVotedForSession);

router.post('/', verifyJWT, votesController.submitVote);
module.exports = router;