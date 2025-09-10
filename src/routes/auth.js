const express = require('express')
const router = express.Router()
const { requestLogin, loginWithToken, getMe, refreshToken } = require('../controllers/auth')
const authMiddleware = require('../middleware/auth')

// POST /api/auth/request-login
router.post('/request-login', requestLogin)

// POST /api/auth/login/:token
router.post('/login/:token', loginWithToken)

// GET /api/auth/me (protégé)
router.get('/me', authMiddleware, getMe)

// POST /api/auth/refresh (protégé)
router.post('/refresh', authMiddleware, refreshToken)

module.exports = router
