const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = { id: user._id };
  const secret = process.env.JWT_SECRET || 'changeme';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;
