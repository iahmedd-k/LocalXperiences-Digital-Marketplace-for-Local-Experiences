const express = require('express');
const router  = express.Router();

const {
  askQuestion,
  getExperienceQnA,
  answerQuestion,
  deleteQuestion,
} = require('../controllers/qnaController');

const { protect, hostOnly, optionalAuth } = require('../middleware/authMiddleware');

router.post('/',               protect,      askQuestion);          // Auth — ask question
router.get('/:experienceId',   optionalAuth, getExperienceQnA);    // Public — get Q&A
router.put('/:id/answer',      protect, hostOnly, answerQuestion); // Host — answer question
router.delete('/:id',          protect,      deleteQuestion);       // Auth — delete own question

module.exports = router;