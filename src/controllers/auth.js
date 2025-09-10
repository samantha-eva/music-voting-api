const authService = require('../services/auth')

/**
 * POST /api/auth/request-login
 */
async function requestLogin(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email requis' })

  const user = await authService.findUserByEmail(email)
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })

  const token = authService.generateToken(user, '1d')
  res.json({ token })
}

/**
 * POST /api/auth/login/:token
 */
async function loginWithToken(req, res) {
  const { token } = req.params
  try {
    const payload = authService.verifyToken(token)
    const newToken = authService.generateToken({ id: payload.userId, email: payload.email }, '365d')
    res.json({ token: newToken })
  } catch (err) {
    res.status(403).json({ error: 'Token invalide' })
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res) {
  const payload = req.user
  const user = await authService.findUserByEmail(payload.email)
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })
  res.json(user)
}

/**
 * POST /api/auth/refresh
 */
async function refreshToken(req, res) {
  const payload = req.user
  const newToken = authService.generateToken({ id: payload.userId, email: payload.email }, '365d')
  res.json({ token: newToken })
}

module.exports = { requestLogin, loginWithToken, getMe, refreshToken }
