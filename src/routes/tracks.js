const express = require('express');
const router = express.Router();
const tracksController = require('../controllers/tracks');
const verifyJWT = require('../middleware/auth'); // ← PAS de {}

// Récupérer les morceaux d'une session
router.get('/session/:sessionId', tracksController.getTracksBySession);

// Soumettre un morceau (JWT requis)
router.post('/', verifyJWT, tracksController.submitTrack);


module.exports = router;
