const express = require('express');
const router  = express.Router();

const {
  createBookingPaymentIntent,
  confirmBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');

const { protect, hostOnly } = require('../middleware/authMiddleware');

// ─── All booking routes require authentication ─────────────────────────────

// Stripe payment intent — Step 1
router.post('/create-payment-intent', protect, createBookingPaymentIntent);

// Confirm booking after payment — Step 2
router.post('/', protect, confirmBooking);

// Traveler — my bookings
router.get('/', protect, getMyBookings);

// Host — bookings for my experiences
router.get('/host', protect, hostOnly, getHostBookings);

// Single booking detail
router.get('/:id', protect, getBookingById);

// Cancel booking
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;