const jwt = require('jsonwebtoken');
const SECRET = 'games-portal-secret-2024';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  });
}

function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth) {
    const token = auth.split(' ')[1];
    try {
      req.user = jwt.verify(token, SECRET);
    } catch {}
  }
  next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth, SECRET };
