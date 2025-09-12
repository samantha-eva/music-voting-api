import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middlewares/auth.js'; // si tu as un middleware pour req.user

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/votes
const addVote = async (req, res) => {
    try {
        const { trackId, sessionId } = req.body;

        if (!trackId || !sessionId) {
            return res.status(400).json({ message: "trackId et sessionId sont requis" });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const vote = await prisma.$transaction(async (tx) => {
            const existingVote = await tx.vote.findFirst({
                where: {
                    userId: req.user.id,
                    sessionId: sessionId,
                    votedAt: {
                        gte: startOfDay,
                        lt: endOfDay
                    }
                }
            });

            if (existingVote) throw new Error("ALREADY_VOTED");

            return await tx.vote.create({
                data: {
                    userId: req.user.id,
                    trackId,
                    sessionId,
                    votedAt: new Date(),
                }
            });
        });

        res.status(201).json(vote);

    } catch (error) {
        if (error.message === "ALREADY_VOTED") {
            return res.status(409).json({ message: "Vous avez déjà voté aujourd'hui pour cette session" });
        }
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'ajout du vote" });
    }
};

// Middleware d’authentification pour que req.user soit défini
router.post('/', authenticateUser, addVote);

export default router;


/*
const myVotesToday = async (req, res) => {
    try {
        // Début et fin du jour actuel
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const myVotes = await prisma.vote.findMany({
            where: {
                userId: req.user.id,
                votedAt: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        res.json(myVotes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération de vos votes' });
    }
};
*/

module.exports = { addVote }