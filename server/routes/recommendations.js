const express = require('express');
const router  = express.Router();

const { getPersonalizedRecommendations } = require('../controllers/recommendationController');
const { protect }                        = require('../middleware/authMiddleware');

// Protected — only logged-in travelers get recommendations
router.get('/', protect, getPersonalizedRecommendations);

module.exports = router;