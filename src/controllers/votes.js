const prisma = require('../config/database');

// Vérifier si l'utilisateur a déjà voté pour cette session
const hasUserVotedForSession = async (req, res) => {
    try {
        const { userId, sessionId } = req.params;

        console.log('Vérification du vote - userId:', userId, 'sessionId:', sessionId);

        if (!userId || !sessionId) {
            return res.status(400).json({ 
                error: 'userId et sessionId sont requis' 
            });
        }

        // Vérifier si l'utilisateur a voté pour cette session
        const vote = await prisma.vote.findFirst({
            where: {
                userId: parseInt(userId),
                sessionId: parseInt(sessionId)
            }
        });

        console.log('Vote trouvé:', vote);

        return res.status(200).json({ 
            hasVoted: !!vote,
            vote: vote || null
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du vote:', error);
        return res.status(500).json({ 
            error: 'Erreur serveur lors de la vérification du vote' 
        });
    }
};

// Soumettre un vote
const submitVote = async (req, res) => {
    try {
        const { userId, trackId, sessionId } = req.body;

        if (!userId || !trackId || !sessionId) {
            return res.status(400).json({ 
                error: 'userId, trackId et sessionId sont requis' 
            });
        }

        // Vérifier si l'utilisateur a déjà voté pour cette session
        const existingVote = await prisma.vote.findFirst({
            where: {
                userId: parseInt(userId),
                sessionId: parseInt(sessionId)
            }
        });

        if (existingVote) {
            return res.status(409).json({ 
                error: 'Vous avez déjà voté pour cette session.' 
            });
        }

        // Créer le vote
        const newVote = await prisma.vote.create({
            data: {
                userId: parseInt(userId),
                trackId: parseInt(trackId),
                sessionId: parseInt(sessionId),
                votedAt: new Date()
            }
        });

        return res.status(201).json({
            message: 'Vote enregistré avec succès',
            vote: newVote
        });
    } catch (error) {
        console.error('Erreur lors de la soumission du vote:', error);
        return res.status(500).json({ 
            error: 'Erreur serveur lors de la soumission du vote' 
        });
    }
};




module.exports = {
    hasUserVotedForSession,
    submitVote
};