const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No Bearer token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || 'careercoach_access_token_secret_key_2026_secure';

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Access token expired. Please refresh your token.'
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Invalid access token. Authorization failed.'
        });
      }

      req.user = {
        id: decoded.id,
        role: decoded.role
      };
      next();
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyJWT
};
