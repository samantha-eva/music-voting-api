const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 🗳️ POST /api/votes - Ajouter un vote
const addVote = async (req, res) => {
  try {
    const { trackId, sessionId } = req.body;

    if (!trackId || !sessionId) {
      return res
        .status(400)
        .json({ message: "trackId et sessionId sont requis" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const vote = await prisma.$transaction(async (tx) => {
      const existingVote = await tx.vote.findFirst({
        where: {
          userId: req.user.id,
          sessionId,
          votedAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      if (existingVote) throw new Error("ALREADY_VOTED");

      return await tx.vote.create({
        data: {
          userId: req.user.id,
          trackId,
          sessionId,
          votedAt: new Date(),
        },
      });
    });

    res.status(201).json(vote);
  } catch (error) {
    if (error.message === "ALREADY_VOTED") {
      return res
        .status(409)
        .json({ message: "Vous avez déjà voté aujourd'hui pour cette session" });
    }
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'ajout du vote" });
  }
};

// 📋 GET /api/votes/my-votes - Récupérer mes votes du jour
const getMyVotes = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const votes = await prisma.vote.findMany({
      where: {
        userId: req.user.id,
        votedAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        track: true,   // inclut les infos du morceau
        session: true, // inclut les infos de la session
      },
    });

    res.json(votes);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des votes" });
  }
};

module.exports = { addVote, getMyVotes };


