const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Login to continue' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { email: decoded.email };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Authentication invalid. Login again.' });
  }
};

module.exports = verifyToken;
