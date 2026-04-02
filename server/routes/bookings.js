const express = require('express');
const router  = express.Router();
const { validationResult } = require('express-validator');

const {
  createBookingPaymentIntent,
  confirmBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  cancelBooking,
  completeBooking,
  checkInBooking,
  getGroupBookingDetails,
  joinGroupBooking,
  getGroupBookingProgress,
  overrideBookingStatus,
} = require('../controllers/bookingController');

const { protect, hostOnly } = require('../middleware/authMiddleware');
const { bookingValidator } = require('../utils/validators');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// ─── All booking routes require authentication ─────────────────────────────

// Stripe payment intent — Step 1
router.post('/create-payment-intent', protect, bookingValidator, validate, createBookingPaymentIntent);

// Confirm booking after payment — Step 2
router.post('/', protect, bookingValidator, validate, confirmBooking);

// Traveler — my bookings
router.get('/', protect, getMyBookings);

// Host — bookings for my experiences
router.get('/host', protect, hostOnly, getHostBookings);

// Group booking endpoints
router.get('/group/:groupCode', protect, getGroupBookingDetails);
router.post('/group/:groupCode/join', protect, joinGroupBooking);
router.get('/group/:groupCode/progress', protect, getGroupBookingProgress);

// Single booking detail
router.get('/:id', protect, getBookingById);

// Cancel booking
router.put('/:id/cancel', protect, cancelBooking);

// Host marks booking completed
router.put('/:id/complete', protect, hostOnly, completeBooking);

// Traveler or host check-in
router.put('/:id/check-in', protect, checkInBooking);

// Host manually overrides booking status
router.put('/:id/status', protect, hostOnly, overrideBookingStatus);

module.exports = router;
