const authService = require('../services/auth')
const prisma = require('../config/database');
const jwt = require('jsonwebtoken')
const { sendMail } = require('../config/email')

// POST /api/auth/request-login
async function requestLogin(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email requis' })

  // Cherche si l'utilisateur existe déjà
  let user = await authService.findUserByEmail(email)

  if (!user) {
    // Cherche dans pre_registered_users
    const preUser = await authService.findPreRegisteredUser(email)
    if (!preUser) return res.status(403).json({ error: 'Email non autorisé' })

    // Crée le User
    user = await authService.createUserFromPreRegistered(preUser)

    // Marquer pre_registered_user comme utilisé
    await prisma.preRegisteredUser.update({
      where: { id: preUser.id },
      data: { isUsed: true }
    })
  }

  // Générer un token magique (AuthToken)
  const authToken = await authService.createLoginToken(user.id)

  // Envoyer le token par email
  await sendMail({
    to: user.email,
    subject: 'Votre lien de connexion',
    text: `Cliquez ici pour vous connecter : ${process.env.APP_URL}/api/auth/login/${authToken.token}`,
  })

  res.json({ message: 'Email de connexion envoyé ! Vérifiez votre boîte de réception.' })
}

// GET /api/auth/me
async function getMe(req, res) {
  const payload = req.user
  const user = await authService.findUserByEmail(payload.email)
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })
  res.json(user)
}

// POST /api/auth/refresh
async function refreshToken(req, res) {
  const payload = req.user
  const user = await authService.findUserByEmail(payload.email)
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })

  const newToken = authService.generateToken(user)
  res.json({ token: newToken })
}

// POST /api/auth/login/:token
async function loginWithToken(req, res) {
  const { token } = req.params
  if (!token) return res.status(400).json({ error: 'Token requis' })

  try {
    const authToken = await prisma.authToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!authToken || authToken.isUsed || authToken.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Token invalide ou expiré' })
    }

    let user = authToken.user

    if (!user) {
      const preUser = await prisma.preRegisteredUser.findUnique({ where: { id: authToken.userId } })
      if (!preUser) return res.status(404).json({ error: 'Utilisateur non trouvé' })

      user = await authService.createUserFromPreRegistered(preUser)

      await prisma.preRegisteredUser.update({
        where: { id: preUser.id },
        data: { isUsed: true }
      })
    }

    await prisma.authToken.update({
      where: { id: authToken.id },
      data: { isUsed: true }
    })

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token: jwtToken, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur lors de la connexion avec token' })
  }
}

module.exports = { requestLogin, getMe, refreshToken, loginWithToken }
