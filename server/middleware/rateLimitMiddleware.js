const Generation = require('../models/Generation');

const generationRateLimiter = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for rate limiting'
      });
    }

    const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const generationCount = await Generation.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: past24Hours }
    });

    const DAILY_LIMIT = 10;

    if (generationCount >= DAILY_LIMIT) {
      return res.status(429).json({
        success: false,
        message: 'Daily AI generation limit reached (maximum 10 generations per 24 hours). Please try again tomorrow.',
        usage: {
          current: generationCount,
          limit: DAILY_LIMIT,
          resetsInHours: 24
        }
      });
    }

    // Attach remaining quota to request object for informational headers or response
    req.remainingGenerations = DAILY_LIMIT - generationCount - 1;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generationRateLimiter
};
