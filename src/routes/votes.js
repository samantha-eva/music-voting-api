const express = require('express');
const router = express.Router();
const { addVote, myVotesToday} = require('../controllers/sessions')


// POST /api/votes  Voter pour un morceau
router.post('/', addVote)

//GET /api/votes/my-votes Mes votes du jour
router.get('/my-votes', myVotesToday)

/*
//GET /api/votes/can-vote/:sessionId  Puis-je voter ?
router.get('/can-vote', canVote)

//DELETE /api/votes/:id  Annuler mon vote
router.delete('/api/votes/:id', deleteVote)
*/
module.exports = router