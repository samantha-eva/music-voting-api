const prisma = require('../config/database');

// Fonction qui retourne un objet Date à l'heure locale Europe/Paris valide en Node.js
function getFranceDate() {
    const now = new Date();

    // Récupère la date/heure locale Paris sous forme de chaîne "dd/mm/yyyy, hh:mm:ss"
    const localeString = now.toLocaleString("en-GB", { timeZone: "Europe/Paris" });
    console.log("Date locale France (string) :", localeString);

    // Découpe la chaîne en date et heure
    const [datePart, timePart] = localeString.split(", ");
    const [day, month, year] = datePart.split("/");
    const [hour, minute, second] = timePart.split(":");

    // Crée et retourne un objet Date en UTC correspondant à cette date/heure locale Paris
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    console.log("Date locale France (obj Date) :", dateObj);
    return dateObj;
}

const hasUserVotedForSession = async (req, res) => {
    try {
        const { userId, sessionId } = req.params;

        if (!userId || !sessionId) {
            return res.status(400).json({ error: 'userId et sessionId sont requis' });
        }

        const today = getFranceDate();
        today.setUTCHours(0, 0, 0, 0); // début du jour en UTC équivalent Paris minuit
        console.log("Début de journée aujourd'hui (France) :", today);

        const vote = await prisma.vote.findFirst({
            where: {
                userId: parseInt(userId),
                votedAt: { gte: today }
            }
        });

        console.log("Vote trouvé :", vote);

        return res.status(200).json({ hasVoted: !!vote, vote: vote || null });
    } catch (error) {
        console.error('Erreur lors de la vérification du vote:', error);
        return res.status(500).json({ error: 'Erreur serveur lors de la vérification du vote' });
    }
};

const submitVote = async (req, res) => {
    try {
        const { userId, trackId, sessionId } = req.body;

        if (!userId || !trackId || !sessionId) {
            return res.status(400).json({ error: 'userId, trackId et sessionId sont requis' });
        }

        const today = getFranceDate();
        today.setUTCHours(0, 0, 0, 0);
        console.log("Début de journée aujourd'hui (France) pour vérification :", today);

        const existingVote = await prisma.vote.findFirst({
            where: {
                userId: parseInt(userId),
                votedAt: { gte: today }
            }
        });

        if (existingVote) {
            console.log("Vote déjà existant aujourd'hui pour cet utilisateur :", existingVote);
            return res.status(409).json({ error: 'Vous avez déjà voté aujourd\'hui.' });
        }

        const voteDate = getFranceDate();
        console.log("Date/heure de vote enregistrée :", voteDate);

        const newVote = await prisma.vote.create({
            data: {
                userId: parseInt(userId),
                trackId: parseInt(trackId),
                sessionId: parseInt(sessionId),
                votedAt: voteDate
            }
        });

        console.log("Nouveau vote créé :", newVote);

        return res.status(201).json({ message: 'Vote enregistré avec succès', vote: newVote });
    } catch (error) {
        console.error('Erreur lors de la soumission du vote:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Vous avez déjà voté pour cette session.' });
        }
        return res.status(500).json({ error: 'Erreur serveur lors de la soumission du vote' });
    }
};

module.exports = { hasUserVotedForSession, submitVote };
