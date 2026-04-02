const express = require('express');
const router  = express.Router();

const {
  createComment,
  getExperienceComments,
  deleteComment,
} = require('../controllers/commentController');

const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/',               protect,      createComment);          // Auth — post comment
router.get('/:experienceId',   optionalAuth, getExperienceComments);  // Public — get comments
router.delete('/:id',          protect,      deleteComment);          // Auth — delete own comment

module.exports = router;