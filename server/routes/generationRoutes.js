const express = require('express');
const router = express.Router();
const {
  generateResume,
  generateInterview,
  getHistory
} = require('../controllers/generationController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { generationRateLimiter } = require('../middleware/rateLimitMiddleware');

// All generation routes require authenticated JWT
router.use(verifyJWT);

// Rate-limited AI generation endpoints
router.post('/resume', generationRateLimiter, generateResume);
router.post('/interview', generationRateLimiter, generateInterview);

// User history endpoint
router.get('/history', getHistory);

module.exports = router;
