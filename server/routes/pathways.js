const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPathway,
  getPathways,
  getPathwayById,
  updatePathway,
  deletePathway,
  toggleSavePathway
} = require('../controllers/pathwayController');

// Public routes
router.get('/', getPathways);
router.get('/:id', getPathwayById);

// Protected routes
router.post('/', protect, createPathway);
router.put('/:id', protect, updatePathway);
router.delete('/:id', protect, deletePathway);
router.post('/:id/save', protect, toggleSavePathway);

module.exports = router;
