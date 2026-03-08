const express = require('express');
const router  = express.Router();

const {
  createReview,
  getExperienceReviews,
  replyToReview,
  getHostReviews,
} = require('../controllers/reviewController');

const { protect, hostOnly } = require('../middleware/authMiddleware');

router.post('/',                       protect, createReview);           // Traveler — submit review
router.get('/host/my-reviews',         protect, hostOnly, getHostReviews); // Host — all my reviews
router.get('/:experienceId',           getExperienceReviews);            // Public — reviews per experience
router.put('/:id/reply',               protect, hostOnly, replyToReview); // Host — reply to review

module.exports = router;