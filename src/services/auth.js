const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken')

// Vérifie si l'utilisateur existe par email dans pre_registered_users
async function findUserByEmail(email) {
  return await prisma.preRegisteredUser.findUnique({ where: { email } })
}

// Génère un JWT pour un utilisateur pré-enregistré
function generateToken(user, expiresIn = '365d') {
  return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn })
}

// Vérifie et décode un JWT
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { findUserByEmail, generateToken, verifyToken }
