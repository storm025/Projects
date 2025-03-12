const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized: No Authorization Header Provided!' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.email) {
      return res.status(401).json({ message: 'Invalid token: No email found' });
    }

    req.email = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticateUser };
