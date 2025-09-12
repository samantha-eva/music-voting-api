const prisma = require('../config/database');
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// Cherche un utilisateur existant dans users
async function findUserByEmail(email) {
  return await prisma.user.findUnique({ where: { email } })
}

// Cherche un utilisateur pré-enregistré
async function findPreRegisteredUser(email) {
  return await prisma.preRegisteredUser.findUnique({ where: { email } })
}

// Crée un User à partir d'un pré-enregistré
async function createUserFromPreRegistered(preUser) {
  return await prisma.user.create({
    data: {
      email: preUser.email,
      firstname: preUser.firstname,
      lastname: preUser.lastname,
      promotion: preUser.promotion,
    },
  })
}

// Génère un JWT pour un utilisateur
function generateToken(user, expiresIn = '365d') {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn })
}

// Vérifie et décode un JWT
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

// Crée un token magique pour login
async function createLoginToken(userId, expiresInMinutes = 15) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  return await prisma.authToken.create({
    data: { token, userId, expiresAt }
  })
}

// Cherche un AuthToken et inclut l'utilisateur
async function findAuthToken(token) {
  return await prisma.authToken.findUnique({
    where: { token },
    include: { user: true }
  })
}

// Marque un AuthToken comme utilisé
async function markTokenUsed(id) {
  return await prisma.authToken.update({
    where: { id },
    data: { isUsed: true }
  })
}

module.exports = { 
  findUserByEmail, 
  findPreRegisteredUser, 
  createUserFromPreRegistered, 
  generateToken, 
  verifyToken, 
  createLoginToken,
  findAuthToken,
  markTokenUsed
}
