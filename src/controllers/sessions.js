const prisma = require('../config/database');

// 1️⃣ Lister toutes les sessions (optionnel : filtrer par date via query)
const getSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des sessions' });
  }
};

// Sessions du jour par promotion
const getSessionsToday = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const promotion = req.user?.promotion; // récupéré depuis le JWT

    if (!promotion) {
      return res.status(400).json({ message: "Promotion utilisateur manquante" });
    }

    const sessions = await prisma.session.findMany({
      where: {
        date: today,
        promotion: promotion
      },
      orderBy: { subject: 'asc' },
    });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des sessions du jour' });
  }
};


// 3️⃣ Détails d'une session par ID
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await prisma.session.findUnique({
      where: { id: parseInt(id) },
    });

    if (!session) return res.status(404).json({ message: 'Session non trouvée' });
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la session' });
  }
};

// 4️⃣ Sessions par date
const getSessionsByDate = async (req, res) => {
  try {
    const { date } = req.params; // format YYYY-MM-DD
    const sessions = await prisma.session.findMany({
      where: { date },
      orderBy: { subject: 'asc' },
    });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des sessions par date' });
  }
};

module.exports = {
  getSessions,
  getSessionsToday,
  getSessionById,
  getSessionsByDate,
};
