const jwt = require('jsonwebtoken');
const EndUser = require('../models/EndUser');

module.exports = async function requireEndUserAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.ENDUSER_JWT_SECRET);

    const user = await EndUser.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ error: 'Token revoked' });
    }

    req.endUser = user;
    req.appId = payload.app;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
