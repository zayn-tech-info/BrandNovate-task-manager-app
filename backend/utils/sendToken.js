const jwt = require('jsonwebtoken');

/**
 * jsonwebtoken: numeric expiresIn = seconds; string = span like "24h", "7d".
 * Env JWT_EXPIRATION=86400 → 24 hours in seconds.
 */
function parseExpiresIn() {
  const raw = process.env.JWT_EXPIRATION;
  if (raw == null || raw === '') return '24h';
  const trimmed = String(raw).trim();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  return trimmed;
}

function signAccessToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  const id = userId && userId.toString ? userId.toString() : userId;
  return jwt.sign({ id }, secret, {
    expiresIn: parseExpiresIn()
  });
}

module.exports = {
  signAccessToken,
  parseExpiresIn
};
