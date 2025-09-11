const prisma = require('../config/database');
//
// GET /api/tracks/session/:sessionId
//
async function getTracksBySession(req, res) {
  try {
    const { sessionId } = req.params;

    const tracks = await prisma.track.findMany({
      where: { sessionId: parseInt(sessionId, 10) },
      include: {
        submittedBy: { select: { id: true, firstname: true, lastname: true } },
        votes: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    const result = tracks.map(t => ({
      id: t.id,
      artist: t.artist,
      title: t.title,
      submittedBy: t.submittedBy,
      submittedAt: t.submittedAt,
      votesCount: t.votes.length
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des morceaux." });
  }
}

//
// POST /api/tracks
//
async function submitTrack(req, res) {
  try {
    const { artist, title, sessionId } = req.body;
    console.log("req.user complet:", req.user);
    
    const userId = req.user.id || req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    if (!artist || !title || !sessionId) {
      return res.status(400).json({ error: "artist, title et sessionId sont requis." });
    }

    const track = await prisma.track.create({
      data: {
        artist,
        title,
        sessionId: parseInt(sessionId, 10),
        userId
      }
    });

    console.log("Morceau créé :", track);
    res.status(201).json(track);
  } catch (error) {
    console.error("Erreur lors de la création du morceau :", error);
    res.status(500).json({ error: "Erreur lors de la soumission du morceau." });
  }
}


module.exports = {
  getTracksBySession,
  submitTrack
};
