const express = require("express");
const { addVote, getMyVotes } = require("../controllers/votes");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, addVote);
router.get("/my-votes", authMiddleware, getMyVotes);

module.exports = router;



