const express = require('express');
const router = express.Router();

const {
  getStories,
  getStoryBySlug,
  getHostStories,
  createStory,
} = require('../controllers/storyController');
const { protect, hostOnly } = require('../middleware/authMiddleware');
const { uploadStoryAssets } = require('../config/cloudinary');

router.get('/', getStories);
router.get('/host/my-stories', protect, hostOnly, getHostStories);
router.get('/:slug', getStoryBySlug);
router.post('/', protect, hostOnly, uploadStoryAssets, createStory);

module.exports = router;
