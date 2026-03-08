const express = require('express');
const router  = express.Router();

const {
  getExperiences,
  getFeaturedExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  getHostExperiences,
  updateAvailability,
} = require('../controllers/experienceController');

const { protect, hostOnly }       = require('../middleware/authMiddleware');
const { uploadExperiencePhotos }  = require('../config/cloudinary');
const { experienceValidator }     = require('../utils/validators');
const { validationResult }        = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// ─── Public Routes ─────────────────────────────────────────────────────────
router.get('/',          getExperiences);
router.get('/featured',  getFeaturedExperiences);
router.get('/:id',       getExperienceById);

// ─── Host Only Routes ──────────────────────────────────────────────────────
router.get('/host/my-listings',       protect, hostOnly, getHostExperiences);
router.post('/',                      protect, hostOnly, uploadExperiencePhotos, experienceValidator, validate, createExperience);
router.put('/:id',                    protect, hostOnly, uploadExperiencePhotos, updateExperience);
router.delete('/:id',                 protect, hostOnly, deleteExperience);
router.put('/:id/availability',       protect, hostOnly, updateAvailability);

module.exports = router;