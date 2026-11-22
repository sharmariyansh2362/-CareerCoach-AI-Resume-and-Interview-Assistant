const express = require('express');
const router = express.Router();
const { getUsageReport } = require('../controllers/adminController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Admin routes require valid JWT and 'admin' role
router.use(verifyJWT);
router.use(requireRole('admin'));

router.get('/usage-report', getUsageReport);

module.exports = router;
