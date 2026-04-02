const express = require('express');
const router = express.Router();

const {
  createReview,
  getExperienceReviews,
  replyToReview,
  getHostReviews,
  getMyReviews,
} = require('../controllers/reviewController');
const { uploadReviewPhotos } = require('../config/cloudinary');
const { protect, hostOnly } = require('../middleware/authMiddleware');

router.post('/', protect, uploadReviewPhotos, createReview);
router.get('/me', protect, getMyReviews);
router.get('/host/my-reviews', protect, hostOnly, getHostReviews);
router.get('/:experienceId', getExperienceReviews);
router.put('/:id/reply', protect, hostOnly, replyToReview);

module.exports = router;
