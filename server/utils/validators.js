const { body, param, query } = require('express-validator');

const parseJsonField = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
};

// ─── Auth Validators ───────────────────────────────────────────────────────
const signupValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['traveler', 'host']).withMessage('Role must be traveler or host'),
];

const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Experience Validators ─────────────────────────────────────────────────
const experienceValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['food','culture','adventure','art','music','sports','wellness','tour','workshop','other']),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number')
    .custom((v) => v >= 0).withMessage('Price cannot be negative'),
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isNumeric().withMessage('Duration must be a number'),
  body().custom((value, { req }) => {
    const includes = parseJsonField(req.body.includes, []);
    const notIncluded = parseJsonField(req.body.notIncluded, []);
    const detailsSections = parseJsonField(req.body.detailsSections, {});
    const detailKeys = [
      'whatToExpect',
      'meetingAndPickup',
      'accessibility',
      'additionalInformation',
      'cancellationPolicy',
      'help',
    ];

    if (Array.isArray(includes) && includes.length > 8) {
      throw new Error('You can add up to 8 included items');
    }

    if (Array.isArray(notIncluded) && notIncluded.length > 8) {
      throw new Error('You can add up to 8 not included items');
    }



    return true;
  }),
  body().custom((value, { req }) => {
    // Support both JSON and multipart/form-data
    const city = req.body['location.city'] || (req.body.location && req.body.location.city);
    const address = req.body['location.address'] || (req.body.location && req.body.location.address);
    if (!city && !address) {
      throw new Error('Either city or address is required');
    }
    return true;
  }),
  body().custom((value, { req }) => {
    const uploadedFiles = Array.isArray(req.files) ? req.files.length : 0;

    if (uploadedFiles > 0) {
      if (uploadedFiles < 2) throw new Error('Please upload at least 2 photos');
      if (uploadedFiles > 10) throw new Error('You can upload a maximum of 10 photos');
      return true;
    }

    const rawPhotos = req.body.photos;
    if (!rawPhotos) {
      throw new Error('Please upload at least 2 photos');
    }

    let photos = [];
    if (Array.isArray(rawPhotos)) {
      photos = rawPhotos;
    } else if (typeof rawPhotos === 'string') {
      try {
        photos = JSON.parse(rawPhotos);
      } catch {
        photos = [];
      }
    }

    if (!Array.isArray(photos) || photos.length < 2) {
      throw new Error('Please upload at least 2 photos');
    }
    if (photos.length > 10) {
      throw new Error('You can upload a maximum of 10 photos');
    }

    return true;
  }),
];

// ─── Booking Validators ────────────────────────────────────────────────────
const bookingValidator = [
  body('experienceId').notEmpty().withMessage('Experience ID is required').isMongoId(),
  body('slot.date')
    .notEmpty().withMessage('Slot date is required')
    .custom((value) => {
      const parsed = new Date(value);
      if (!Number.isFinite(parsed.getTime())) {
        throw new Error('Slot date must be a valid date');
      }
      return true;
    }),
  body('slot.startTime').notEmpty().withMessage('Start time is required'),
  body('guestCount')
    .notEmpty().withMessage('Guest count is required')
    .isInt({ min: 1 }).withMessage('At least 1 guest required'),
];

// ─── Review Validators ─────────────────────────────────────────────────────
const reviewValidator = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ max: 1000 }),
];

module.exports = {
  signupValidator,
  loginValidator,
  experienceValidator,
  bookingValidator,
  reviewValidator,
};
