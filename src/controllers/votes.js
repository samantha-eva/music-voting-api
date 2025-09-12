const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addVote = async (req, res) => {
    try {
        // Début du jour actuel
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        //Fin du jour actuel
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const vote = await prisma.$transaction(async (tx) => {

            //Vérifier si l'utilisateur a déjà voté aujourd'hui
            const existingVote = await tx.vote.findFirst({
                where: {
                    userId: req.user.id,
                    votedAt: {
                        gte: startOfDay,
                        lt: endOfDay
                    }
                }
            });

            if (existingVote) {
                // On "lève" une erreur qui sera catchée dehors
                throw new Error("ALREADY_VOTED");
            }

            return await tx.vote.create({
                data: {
                    userId: req.user.id,
                    votedAt: new Date(),
                    // postId: req.body.postId,
                    // choice: req.body.choice
                }
            });
        });

        res.status(201).json(vote);

    } catch (error) {
        if (error.message === "ALREADY_VOTED") {
            return res.status(409).json({ message: "Vous avez déjà voté aujourd'hui" });
        }
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'ajout du vote" });
    }
};


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


module.exports = { addVote, myVotesToday }