const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken')

/**
 * Vérifie si un utilisateur existe par email
 */
async function findUserByEmail(email) {
  return await prisma.user.findUnique({ where: { email } })
}

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user { id, email }
 * @param {string} expiresIn durée validité (ex: '1d', '365d')
 */
function generateToken(user, expiresIn = '1d') {
  return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn })
}

/**
 * Vérifie et décode un token JWT
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { findUserByEmail, generateToken, verifyToken }
