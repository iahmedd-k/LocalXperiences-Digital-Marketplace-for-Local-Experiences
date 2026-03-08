const { body, param, query } = require('express-validator');

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
  body('location.city')
    .notEmpty().withMessage('City is required'),
];

// ─── Booking Validators ────────────────────────────────────────────────────
const bookingValidator = [
  body('experienceId').notEmpty().withMessage('Experience ID is required').isMongoId(),
  body('slot.date').notEmpty().withMessage('Slot date is required').isISO8601(),
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