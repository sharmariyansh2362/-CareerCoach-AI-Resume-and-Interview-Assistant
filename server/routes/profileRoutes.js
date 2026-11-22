const express = require('express');
const router = express.Router();
const { getProfile, upsertProfile } = require('../controllers/profileController');
const { verifyJWT } = require('../middleware/authMiddleware');

router.use(verifyJWT); // All profile routes are protected

router.get('/', getProfile);
router.post('/', upsertProfile);
router.put('/', upsertProfile);

module.exports = router;
