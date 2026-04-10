const jwt = require('jsonwebtoken');

function getBearerToken(req) {
  const auth = req.headers.authorization;
  if (auth && typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return null;
}

const verifyToken = (req, res, next) => {
  const token = getBearerToken(req) || req.headers['x-access-token'];

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server auth is not configured.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
};

module.exports = {
  verifyToken
};
