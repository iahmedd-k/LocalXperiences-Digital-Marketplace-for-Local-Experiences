const express = require('express');
const router = express.Router();

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWishlist);
router.post('/:experienceId', protect, addToWishlist);
router.delete('/:experienceId', protect, removeFromWishlist);

module.exports = router;
