const express = require('express');
const router = express.Router();
const { getRewardsConfig } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRewardsConfig);

module.exports = router;
