const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant après Bearer' });

    console.log("Token reçu côté serveur:", token);
    console.log("JWT_SECRET côté serveur:", process.env.JWT_SECRET);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT décodé côté serveur:", payload);

    req.user = payload; // id et email disponibles dans req.user
    next();
  } catch (err) {
    console.error("Erreur JWT:", err.message);
    res.status(403).json({ error: 'Token invalide ou expiré' });
  }
}

module.exports = authMiddleware;
