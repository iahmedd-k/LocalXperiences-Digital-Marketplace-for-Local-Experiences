const Booking                    = require('../models/Booking');
const Experience                 = require('../models/Experience');
const User                       = require('../models/User');
const { createPaymentIntent,
        retrievePaymentIntent,
        refundPayment }          = require('../services/paymentService');
const { sendBookingConfirmation,
        sendNewBookingAlert,
        sendCancellationEmail }  = require('../services/emailService');
const { successResponse,
        errorResponse,
        paginatedResponse }      = require('../utils/apiResponse');

// ─── @POST /api/bookings/create-payment-intent ────────────────────────────
// Step 1 — Create Stripe payment intent, return clientSecret to frontend
const createBookingPaymentIntent = async (req, res, next) => {
  try {
    const { experienceId, guestCount, slot } = req.body;

    const experience = await Experience.findById(experienceId);
    if (!experience || !experience.isActive) {
      return errorResponse(res, 404, 'Experience not found');
    }

    // Check slot availability
    const slotEntry = experience.availability.find(
      (a) =>
        new Date(a.date).toDateString() === new Date(slot.date).toDateString() &&
        a.startTime === slot.startTime
    );

    if (!slotEntry) {
      return errorResponse(res, 400, 'Selected slot not found');
    }

    const remainingSlots = slotEntry.slots - slotEntry.booked;
    if (remainingSlots < guestCount) {
      return errorResponse(res, 400, `Only ${remainingSlots} slots available`);
    }

    // Validate guest count against group size
    if (guestCount > experience.groupSize.max) {
      return errorResponse(res, 400, `Maximum group size is ${experience.groupSize.max}`);
    }

    // Calculate amount in cents
    const amount = experience.price * guestCount * 100;

    const paymentIntent = await createPaymentIntent({
      amount,
      metadata: {
        experienceId: experienceId.toString(),
        userId:       req.user._id.toString(),
        guestCount:   guestCount.toString(),
        slotDate:     slot.date,
        startTime:    slot.startTime,
      },
    });

    return successResponse(res, 200, 'Payment intent created', {
      clientSecret: paymentIntent.client_secret,
      amount,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/bookings ───────────────────────────────────────────────────
// Step 2 — Confirm booking after successful payment
const confirmBooking = async (req, res, next) => {
  try {
    const { experienceId, guestCount, slot, paymentIntentId } = req.body;
    const isProd = process.env.NODE_ENV === 'production';

    // Verify payment was successful with Stripe.
    // In non-production, degrade gracefully if Stripe lookup fails so local dev isn't blocked.
    let paymentIntent = null;
    if (paymentIntentId) {
      try {
        paymentIntent = await retrievePaymentIntent(paymentIntentId);
      } catch (err) {
        if (isProd) {
          return errorResponse(res, 400, 'Payment not completed');
        }
        console.warn('⚠️  Stripe payment lookup failed in non-production, continuing anyway:', err.message);
      }
    }

    if (isProd && paymentIntent && paymentIntent.status !== 'succeeded') {
      return errorResponse(res, 400, 'Payment not completed');
    }

    const experience = await Experience.findById(experienceId);
    if (!experience) return errorResponse(res, 404, 'Experience not found');

    // Find and lock the slot
    const slotIndex = experience.availability.findIndex(
      (a) =>
        new Date(a.date).toDateString() === new Date(slot.date).toDateString() &&
        a.startTime === slot.startTime
    );

    if (slotIndex === -1) return errorResponse(res, 400, 'Slot not found');

    const slotEntry    = experience.availability[slotIndex];
    const remaining    = slotEntry.slots - slotEntry.booked;

    if (remaining < guestCount) {
      return errorResponse(res, 400, 'Not enough slots available');
    }

    // Increment booked count
    experience.availability[slotIndex].booked += guestCount;
    await experience.save();

    const amountCents = paymentIntent?.amount ?? (experience.price * guestCount * 100);

    // Create booking record
    const booking = await Booking.create({
      experienceId,
      userId:     req.user._id,
      hostId:     experience.hostId,
      slot,
      guestCount,
      amount:     amountCents,
      status:     'confirmed',
      payment: {
        paymentIntentId,
        status: 'succeeded',
      },
    });

    // Send emails — non-blocking
    const host = await User.findById(experience.hostId);

    sendBookingConfirmation({
      email:      req.user.email,
      name:       req.user.name,
      experience,
      booking,
    }).catch((e) => console.error('Booking confirm email failed:', e.message));

    sendNewBookingAlert({
      email:        host.email,
      hostName:     host.name,
      experience,
      booking,
      travelerName: req.user.name,
    }).catch((e) => console.error('Host alert email failed:', e.message));

    return successResponse(res, 201, 'Booking confirmed', booking);
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/bookings ────────────────────────────────────────────────────
// Traveler — Get my bookings
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking
      .find(filter)
      .populate('experienceId', 'title photos location price duration category')
      .populate('hostId', 'name profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'Bookings fetched', bookings, {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/bookings/host ───────────────────────────────────────────────
// Host — Get all bookings for my experiences
const getHostBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { hostId: req.user._id };
    if (status) filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking
      .find(filter)
      .populate('experienceId', 'title photos location price')
      .populate('userId', 'name email profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'Host bookings fetched', bookings, {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/bookings/:id ────────────────────────────────────────────────
// Get single booking detail
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking
      .findById(req.params.id)
      .populate('experienceId', 'title photos location price duration')
      .populate('userId',       'name email profilePic')
      .populate('hostId',       'name email profilePic');

    if (!booking) return errorResponse(res, 404, 'Booking not found');

    // Only the traveler or host can view
    const isOwner = booking.userId._id.toString() === req.user._id.toString();
    const isHost  = booking.hostId._id.toString() === req.user._id.toString();

    if (!isOwner && !isHost) {
      return errorResponse(res, 403, 'Not authorized');
    }

    return successResponse(res, 200, 'Booking fetched', booking);
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/bookings/:id/cancel ────────────────────────────────────────
// Cancel booking — traveler or host
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking
      .findById(req.params.id)
      .populate('experienceId', 'title availability')
      .populate('userId',       'name email')
      .populate('hostId',       'name email');

    if (!booking) return errorResponse(res, 404, 'Booking not found');

    if (booking.status === 'cancelled') {
      return errorResponse(res, 400, 'Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      return errorResponse(res, 400, 'Cannot cancel a completed booking');
    }

    const isTraveler = booking.userId._id.toString() === req.user._id.toString();
    const isHost     = booking.hostId._id.toString() === req.user._id.toString();

    if (!isTraveler && !isHost) {
      return errorResponse(res, 403, 'Not authorized');
    }

    // Update booking status
    booking.status      = 'cancelled';
    booking.cancelledBy = isTraveler ? 'traveler' : 'host';
    await booking.save();

    // Free up availability slots
    const experience = await Experience.findById(booking.experienceId._id);
    if (experience) {
      const slotIndex = experience.availability.findIndex(
        (a) =>
          new Date(a.date).toDateString() === new Date(booking.slot.date).toDateString() &&
          a.startTime === booking.slot.startTime
      );
      if (slotIndex !== -1) {
        experience.availability[slotIndex].booked = Math.max(
          0,
          experience.availability[slotIndex].booked - booking.guestCount
        );
        await experience.save();
      }
    }

    // Process refund if payment was made
    if (booking.payment?.paymentIntentId && booking.payment?.status === 'succeeded') {
      refundPayment(booking.payment.paymentIntentId)
        .catch((e) => console.error('Refund failed:', e.message));
    }

    // Send cancellation emails — non-blocking
    const cancelledBy = isTraveler ? 'traveler' : 'host';

    sendCancellationEmail({
      email:       booking.userId.email,
      name:        booking.userId.name,
      experience:  booking.experienceId,
      cancelledBy,
    }).catch((e) => console.error('Cancel email failed:', e.message));

    return successResponse(res, 200, 'Booking cancelled successfully', booking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBookingPaymentIntent,
  confirmBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  cancelBooking,
};