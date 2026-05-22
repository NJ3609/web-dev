import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'supersecretjobboardtokenkey2026', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // Contains id, email, role
    next();
  });
}

export function authorizeEmployer(req, res, next) {
  if (!req.user || req.user.role !== 'employer') {
    return res.status(403).json({ message: 'Access denied: Employers only' });
  }
  next();
}

export function authorizeCandidate(req, res, next) {
  if (!req.user || req.user.role !== 'candidate') {
    return res.status(403).json({ message: 'Access denied: Candidates only' });
  }
  next();
}
