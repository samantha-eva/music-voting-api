const express = require("express");
const { addVote } = require("../controllers/votes");
const authMiddleware = require("../middleware/auth"); // pas de {}

const router = express.Router();

// 🗳️ POST /api/votes - Ajouter un vote
router.post("/", authMiddleware, addVote);

// Si tu veux réactiver la route GET plus tard, tu pourras décommenter et créer getMyVotes
// router.get("/my-votes", authMiddleware, getMyVotes);

module.exports = router;
