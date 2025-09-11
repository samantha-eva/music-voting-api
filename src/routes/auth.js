const express = require('express')
const router = express.Router()
const { requestLogin, getMe, refreshToken } = require('../controllers/auth')
const authMiddleware = require('../middleware/auth')

// POST /api/auth/request-login → génère directement le JWT
router.post('/request-login', requestLogin)

// GET /api/auth/me (protégé)
router.get('/me', authMiddleware, getMe)

// POST /api/auth/refresh (protégé)
router.post('/refresh', authMiddleware, refreshToken)

module.exports = router
