
const Booking                    = require('../models/Booking');
const Experience                 = require('../models/Experience');
const User                       = require('../models/User');
const { deleteCacheByPattern }   = require('../config/redis');
const { createPaymentIntent,
        retrievePaymentIntent,
        refundPayment }          = require('../services/paymentService');
const { awardUserEvent }        = require('../services/rewardService');
const { sendBookingConfirmation,
        sendNewBookingAlert,
  sendCancellationEmail,
  sendBookingCompletedEmail }  = require('../services/emailService');
const { successResponse,
        errorResponse,
        paginatedResponse }      = require('../utils/apiResponse');
const crypto = require('crypto');

const toDateOnlyString = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toDateString() : null;
};

const toSlotDateTime = (slot) => {
  const dateOnly = toDateOnlyString(slot?.date);
  if (!dateOnly || !slot?.startTime) return null;

  const [hours = '0', minutes = '0'] = String(slot.startTime).split(':');
  const date = new Date(slot.date);
  if (!Number.isFinite(date.getTime())) return null;
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return date;
};

const resolveBookingPricing = (experience, guestCount, splitPaymentRequested = false) => {
  const settings = experience?.bookingSettings || {};
  const subtotal = Math.round(Number(experience?.price || 0) * Number(guestCount) * 100);
  const discountTier = (Array.isArray(settings.groupDiscounts) ? settings.groupDiscounts : [])
    .filter((tier) => Number(guestCount) >= Number(tier?.minGuests || 0))
    .sort((left, right) => Number(right.percentOff || 0) - Number(left.percentOff || 0))[0];

  const discountPercent = settings.allowGroupPricing ? Number(discountTier?.percentOff || 0) : 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const splitPayment = Boolean(settings.allowSplitPayments && splitPaymentRequested);
  const depositPercent = splitPayment ? Math.max(10, Math.min(90, Number(settings.splitPaymentDepositPercent) || 30)) : 100;
  const amountDueNow = splitPayment
    ? Math.max(1, Math.round(totalAfterDiscount * (depositPercent / 100)))
    : totalAfterDiscount;

  return {
    subtotal,
    discountPercent,
    discountAmount,
    totalAfterDiscount,
    amountDueNow,
    remainingAmount: Math.max(0, totalAfterDiscount - amountDueNow),
    splitPayment,
    depositPercent: splitPayment ? depositPercent : 0,
    pricingLabel: discountTier?.label || '',
  };
};

const enforceBookingWindow = (experience, slot) => {
  const slotDateTime = toSlotDateTime(slot);
  if (!slotDateTime) return 'A valid slot date and time are required';

  const now = new Date();
  const diffDays = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const maxAdvanceDays = Number(experience?.bookingSettings?.maxAdvanceDays || 365);

  if (diffDays > maxAdvanceDays) {
    return `Bookings can only be made ${maxAdvanceDays} days ahead`;
  }

  return null;
};

const normalizeCollaboration = (rawValue = {}) => ({
  groupCode: String(rawValue?.groupCode || '').trim().toUpperCase(),
  groupName: String(rawValue?.groupName || '').trim(),
  inviteNote: String(rawValue?.inviteNote || '').trim(),
  invitedEmails: Array.from(new Set(
    String(rawValue?.invitedEmails || '')
      .split(/[\n,]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  )),
  joinMode: ['solo', 'create', 'join'].includes(rawValue?.joinMode) ? rawValue.joinMode : 'solo',
});

const buildGroupCode = () => crypto.randomBytes(3).toString('hex').toUpperCase();
const buildInviteToken = () => crypto.randomBytes(12).toString('hex');
const buildCheckInCode = () => String(Math.floor(100000 + Math.random() * 900000));
const splitAmountEvenly = (totalAmount, memberCount) => {
  const safeMembers = Math.max(1, Number(memberCount || 1));
  const total = Math.max(0, Math.round(Number(totalAmount || 0)));
  const base = Math.floor(total / safeMembers);
  return Array.from({ length: safeMembers }, (_, index) =>
    index === safeMembers - 1 ? total - (base * (safeMembers - 1)) : base
  );
};

const ACTIVE_GROUP_STATUSES = ['pending', 'pending_payment', 'partially_paid', 'confirmed', 'upcoming'];

const syncSplitBookingStatus = (booking) => {
  const shares = Array.isArray(booking?.splitPayments) ? booking.splitPayments : [];
  const allPaid = shares.length > 0 && shares.every((share) => share.status === 'paid');

  booking.payment = booking.payment || {};
  booking.payment.status = allPaid ? 'succeeded' : 'partially_paid';
  booking.status = allPaid ? 'upcoming' : 'pending_payment';

  return booking;
};

const ensureCollaborativeShares = (booking) => {
  const guestCount = Math.max(1, Number(booking?.guestCount || 1));
  if (guestCount <= 1 || !booking?.collaboration?.groupCode) return false;

  const leaderEmail = String(booking?.contact?.email || booking?.userId?.email || '').trim().toLowerCase();
  const invitedEmails = Array.isArray(booking?.collaboration?.invitedEmails)
    ? booking.collaboration.invitedEmails
    : String(booking?.collaboration?.invitedEmails || '').split(/[\n,]+/);
  const expectedEmails = Array.from(new Set([leaderEmail, ...invitedEmails.map((email) => String(email || '').trim().toLowerCase())].filter(Boolean)));
  if (expectedEmails.length !== guestCount) return false;

  const existingShares = Array.isArray(booking?.splitPayments) ? booking.splitPayments : [];
  const totalAmount = Math.max(0, Number(booking?.pricing?.totalAfterDiscount || 0));
  const existingTotal = existingShares.reduce((sum, share) => sum + Math.max(0, Number(share?.amount || 0)), 0);
  const existingEmails = existingShares.map((share) => String(share?.email || '').trim().toLowerCase()).filter(Boolean);
  const missingMembers = expectedEmails.some((email) => !existingEmails.includes(email));
  const mismatchedCount = existingShares.length !== expectedEmails.length;
  const mismatchedTotal = existingTotal !== totalAmount;
  const singleFullShare = existingShares.length === 1 && Number(existingShares[0]?.amount || 0) === totalAmount && guestCount > 1;
  const shouldRepair = missingMembers || mismatchedCount || mismatchedTotal || singleFullShare;

  if (!shouldRepair) return false;

  const splitAmounts = splitAmountEvenly(totalAmount, expectedEmails.length);
  booking.splitPayments = expectedEmails.map((email, index) => {
    const existingShare = existingShares.find((share) => String(share?.email || '').trim().toLowerCase() === email);
    const isLeader = email === leaderEmail;
    return {
      email,
      amount: splitAmounts[index],
      isLeader,
      inviteToken: existingShare?.inviteToken || buildInviteToken(),
      paymentIntentId: existingShare?.paymentIntentId || (isLeader ? booking?.payment?.paymentIntentId || null : null),
      status: existingShare?.status || (isLeader ? 'paid' : 'pending'),
      paidAt: existingShare?.paidAt || (isLeader && booking?.payment?.paymentIntentId ? new Date() : null),
    };
  });
  booking.collaboration.invitedEmails = expectedEmails.filter((email) => email !== leaderEmail);
  booking.paymentDeadlineAt = booking.paymentDeadlineAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
  booking.pricing.splitPayment = true;
  syncSplitBookingStatus(booking);
  return true;
};

const toRadians = (value) => (Number(value) * Math.PI) / 180;
const distanceMeters = (fromLat, fromLng, toLat, toLng) => {
  const earthRadius = 6371000;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── @POST /api/bookings/create-payment-intent ────────────────────────────
// Step 1 — Create Stripe payment intent, return clientSecret to frontend
const createBookingPaymentIntent = async (req, res, next) => {
  try {
    const { experienceId, guestCount, slot, splitPayment = false, costShare = false } = req.body;

    const experience = await Experience.findById(experienceId);
    if (!experience || !experience.isActive) {
      return errorResponse(res, 404, 'Experience not found');
    }

    if (String(experience.hostId) === String(req.user._id)) {
      return errorResponse(res, 400, 'You cannot book your own experience');
    }

    if (!Number.isInteger(Number(guestCount)) || Number(guestCount) < 1) {
      return errorResponse(res, 400, 'Guest count must be at least 1');
    }

    const requestedDate = toDateOnlyString(slot?.date);
    if (!requestedDate || !slot?.startTime) {
      return errorResponse(res, 400, 'A valid slot date and time are required');
    }

    const bookingWindowError = enforceBookingWindow(experience, slot);
    if (bookingWindowError) {
      return errorResponse(res, 400, bookingWindowError);
    }

    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      experienceId,
      status: { $in: ['pending', 'confirmed'] },
      'slot.date': new Date(slot.date),
      'slot.startTime': slot.startTime,
    }).select('_id');

    if (existingBooking) {
      return errorResponse(res, 400, 'You already have an active booking for this time slot');
    }

    // Check slot availability
    const slotEntry = experience.availability.find(
      (a) =>
        toDateOnlyString(a.date) === requestedDate &&
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
    const pricing = resolveBookingPricing(experience, Number(guestCount), splitPayment);
    const amount = costShare
      ? splitAmountEvenly(pricing.amountDueNow, Number(guestCount))[0]
      : pricing.amountDueNow;

    if (!Number.isInteger(amount) || amount <= 0) {
      return errorResponse(res, 400, 'Unable to calculate a valid payment amount');
    }

    const paymentIntent = await createPaymentIntent({
      amount,
      metadata: {
        experienceId: experienceId.toString(),
        userId:       req.user._id.toString(),
        guestCount:   guestCount.toString(),
        slotDate:     requestedDate,
        startTime:    slot.startTime,
        splitPayment: String(Boolean(pricing.splitPayment)),
        costShare: String(Boolean(costShare)),
        remainingAmount: String(pricing.remainingAmount),
      },
    });

    return successResponse(res, 200, 'Payment intent created', {
      clientSecret: paymentIntent.client_secret,
      amount,
      paymentIntentId: paymentIntent.id,
      pricing,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/bookings ───────────────────────────────────────────────────
// Step 2 — Confirm booking after successful payment
const confirmBooking = async (req, res, next) => {
  try {
    const { experienceId, guestCount, slot, paymentIntentId, splitPayment = false, costShare = false, splitPayments = [], collaboration, contact } = req.body;
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
    if (!experience || !experience.isActive) return errorResponse(res, 404, 'Experience not found');

    if (String(experience.hostId) === String(req.user._id)) {
      return errorResponse(res, 400, 'You cannot book your own experience');
    }

    const requestedGuestCount = Number(guestCount);
    if (!Number.isInteger(requestedGuestCount) || requestedGuestCount < 1) {
      return errorResponse(res, 400, 'Guest count must be at least 1');
    }

    const requestedDate = toDateOnlyString(slot?.date);
    if (!requestedDate || !slot?.startTime) {
      return errorResponse(res, 400, 'A valid slot date and time are required');
    }

    const bookingWindowError = enforceBookingWindow(experience, slot);
    if (bookingWindowError) {
      return errorResponse(res, 400, bookingWindowError);
    }

    const pricing = resolveBookingPricing(experience, requestedGuestCount, splitPayment);
    const collaborationInput = normalizeCollaboration(collaboration);
    const usesCollaborativeCostShare = Boolean(costShare && collaborationInput.joinMode === 'create' && requestedGuestCount > 1);
    const expectedAmount = usesCollaborativeCostShare
      ? splitAmountEvenly(pricing.amountDueNow, requestedGuestCount)[0]
      : pricing.amountDueNow;

    if (paymentIntent) {
      const metadata = paymentIntent.metadata || {};

      if (
        String(metadata.experienceId || '') !== String(experienceId) ||
        String(metadata.userId || '') !== String(req.user._id) ||
        String(metadata.guestCount || '') !== String(requestedGuestCount) ||
        String(metadata.slotDate || '') !== requestedDate ||
        String(metadata.startTime || '') !== String(slot.startTime)
      ) {
        return errorResponse(res, 400, 'Payment details do not match this booking request');
      }

      if (Number(paymentIntent.amount) !== Number(expectedAmount)) {
        return errorResponse(res, 400, 'Payment amount does not match this booking request');
      }
    }

    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      experienceId,
      status: { $in: ['pending', 'confirmed'] },
      'slot.date': new Date(slot.date),
      'slot.startTime': slot.startTime,
    }).select('_id');

    if (existingBooking) {
      return errorResponse(res, 400, 'You already have an active booking for this time slot');
    }

    // Find and lock the slot
    const slotIndex = experience.availability.findIndex(
      (a) =>
        toDateOnlyString(a.date) === requestedDate &&
        a.startTime === slot.startTime
    );

    if (slotIndex === -1) return errorResponse(res, 400, 'Slot not found');

    const slotEntry    = experience.availability[slotIndex];
    const remaining    = slotEntry.slots - slotEntry.booked;

    if (remaining < requestedGuestCount) {
      return errorResponse(res, 400, 'Not enough slots available');
    }

    const amountCents = paymentIntent?.amount ?? expectedAmount;
    let finalGroupCode = null;

    if (collaborationInput.joinMode === 'create') {
      finalGroupCode = collaborationInput.groupCode || buildGroupCode();
    }

    if (collaborationInput.joinMode === 'join' && collaborationInput.groupCode) {
      const existingGroup = await Booking.findOne({
        experienceId,
        'slot.date': new Date(slot.date),
        'slot.startTime': slot.startTime,
        'collaboration.groupCode': collaborationInput.groupCode,
        status: { $in: ['pending', 'confirmed', 'completed'] },
      }).select('_id collaboration');

      if (!existingGroup) {
        return errorResponse(res, 404, 'Collaborative booking group not found for this time slot');
      }

      finalGroupCode = collaborationInput.groupCode;
    }

    const requesterEmail = String(req.user?.email || contact?.email || '').trim().toLowerCase();
    const requestedShares = Array.isArray(splitPayments) ? splitPayments : [];
    const normalizedShares = requestedShares
      .map((share) => ({
        email: String(share?.email || '').trim().toLowerCase(),
        amount: Math.max(0, Math.round(Number(share?.amount || 0))),
        isLeader: Boolean(share?.isLeader),
      }))
      .filter((share) => share.email);
    const dedupedShares = Array.from(
      normalizedShares.reduce((map, share) => {
        if (!map.has(share.email)) map.set(share.email, share);
        return map;
      }, new Map()).values()
    );
    const leaderSeed = dedupedShares.find((share) => share.isLeader)
      || dedupedShares.find((share) => share.email === requesterEmail)
      || null;
    const normalizedCollaborativeShares = dedupedShares.length > 0
      ? [
          {
            email: requesterEmail,
            amount: leaderSeed?.amount || Math.round(pricing.totalAfterDiscount / Math.max(1, requestedGuestCount)),
            isLeader: true,
          },
          ...dedupedShares
            .filter((share) => share.email && share.email !== requesterEmail)
            .map((share) => ({
              ...share,
              isLeader: false,
            })),
        ]
      : [];

    if (collaborationInput.joinMode === 'create' && requestedGuestCount > 1) {
      const expectedMemberCount = requestedGuestCount;
      const providedMemberCount = (pricing.splitPayment || usesCollaborativeCostShare)
        ? normalizedCollaborativeShares.length
        : 1 + collaborationInput.invitedEmails.filter((email) => email !== requesterEmail).length;

      if (providedMemberCount !== expectedMemberCount) {
        return errorResponse(
          res,
          400,
          `This booking is for ${requestedGuestCount} guests. Please add details for all ${requestedGuestCount} group members before continuing.`
        );
      }
    }

    const usesSharedPayments = pricing.splitPayment || usesCollaborativeCostShare;
    const finalSplitPayments = usesSharedPayments
      ? (normalizedCollaborativeShares.length
          ? normalizedCollaborativeShares
          : [{
              email: requesterEmail,
              amount: Math.round(pricing.totalAfterDiscount / Math.max(1, requestedGuestCount)),
              isLeader: true,
            }])
          .map((share, index, arr) => ({
            ...share,
            amount: index === arr.length - 1
              ? Math.max(0, pricing.totalAfterDiscount - arr.slice(0, -1).reduce((sum, item) => sum + item.amount, 0))
              : share.amount,
            inviteToken: buildInviteToken(),
            paymentIntentId: share.isLeader ? paymentIntentId : null,
            status: share.isLeader ? 'paid' : 'pending',
            paidAt: share.isLeader ? new Date() : null,
          }))
      : [];

    const paymentDeadlineAt = usesSharedPayments
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : null;

    // Reserve the slot only after all validation passes.
    experience.availability[slotIndex].booked += requestedGuestCount;
    await experience.save();
    await deleteCacheByPattern(`experience:${experienceId}`);
    await deleteCacheByPattern('experiences:*');

    // Create booking record
    const booking = await Booking.create({
      experienceId,
      userId:     req.user._id,
      hostId:     experience.hostId,
      slot: {
        slotId: slotEntry?._id || null,
        date: new Date(slot.date),
        startTime: slot.startTime,
      },
      guestCount: requestedGuestCount,
      amount:     amountCents,
      pricing: {
        subtotal: pricing.subtotal,
        totalAfterDiscount: pricing.totalAfterDiscount,
        discountPercent: pricing.discountPercent,
        discountAmount: pricing.discountAmount,
        amountDueNow: pricing.amountDueNow,
        remainingAmount: pricing.remainingAmount,
        splitPayment: usesSharedPayments,
        depositPercent: pricing.depositPercent,
        pricingLabel: pricing.pricingLabel,
      },
      collaboration: {
        groupCode: finalGroupCode,
        groupName: collaborationInput.groupName,
        inviteNote: collaborationInput.inviteNote,
        leaderId: collaborationInput.joinMode === 'create' ? req.user._id : null,
        invitedEmails: usesSharedPayments
          ? finalSplitPayments.filter((share) => !share.isLeader).map((share) => share.email)
          : collaborationInput.invitedEmails.filter((email) => email !== requesterEmail),
        joinMode: collaborationInput.joinMode,
      },
      splitPayments: finalSplitPayments,
      paymentDeadlineAt,
      contact: {
        firstName: String(contact?.firstName || '').trim(),
        lastName: String(contact?.lastName || '').trim(),
        email: String(contact?.email || req.user.email || '').trim(),
        phone: String(contact?.phone || '').trim(),
        smsOptIn: Boolean(contact?.smsOptIn),
      },
      status:     usesSharedPayments ? 'pending_payment' : 'upcoming',
      payment: {
        paymentIntentId,
        status: usesSharedPayments ? 'partially_paid' : 'succeeded',
      },
      checkIn: {
        status: 'not_checked_in',
        method: 'none',
        qrCode: buildCheckInCode(),
        checkedInAt: null,
        rewardPointsGranted: 0,
      },
    });

    // Send emails — non-blocking
        // Send group invite emails to invited friends (not leader)
        if (collaborationInput.joinMode === 'create' && booking.collaboration?.invitedEmails?.length > 0) {
          const { sendGroupInviteEmail } = require('../services/emailService');
          for (const email of booking.collaboration.invitedEmails) {
            sendGroupInviteEmail({
              email,
              inviterName: req.user.name,
              experience,
              booking,
              groupCode: booking.collaboration.groupCode,
              inviteNote: booking.collaboration.inviteNote,
            }).catch((e) => console.error('Group invite email failed:', e.message));
          }
        }
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

    await deleteCacheByPattern(`recommendations:*:${req.user._id}`);

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

    const filter = {
      $or: [
        { userId: req.user._id },
        { 'splitPayments.email': String(req.user?.email || '').trim().toLowerCase() },
      ],
    };
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
    const isGroupMember = Array.isArray(booking.splitPayments) &&
      booking.splitPayments.some((share) => share.email === String(req.user?.email || '').trim().toLowerCase());

    if (!isOwner && !isHost && !isGroupMember) {
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
          toDateOnlyString(a.date) === toDateOnlyString(booking.slot.date) &&
          a.startTime === booking.slot.startTime
      );
      if (slotIndex !== -1) {
        experience.availability[slotIndex].booked = Math.max(
          0,
          experience.availability[slotIndex].booked - booking.guestCount
        );
        await experience.save();
        await deleteCacheByPattern(`experience:${experience._id}`);
        await deleteCacheByPattern('experiences:*');
      }
    }

    // Process refund only when the latest Stripe state is actually refundable.
    if (booking.payment?.paymentIntentId && booking.payment?.status === 'succeeded') {
      try {
        const paymentIntent = await retrievePaymentIntent(booking.payment.paymentIntentId);
        const hasSuccessfulCharge = paymentIntent?.status === 'succeeded';
        if (hasSuccessfulCharge) {
          refundPayment(booking.payment.paymentIntentId)
            .catch((e) => console.error('Refund failed:', e.message));
        } else {
          console.warn(`Skipping refund for booking ${booking._id}: payment intent is not refundable (${paymentIntent?.status || 'unknown'}).`);
        }
      } catch (e) {
        console.warn(`Skipping refund lookup for booking ${booking._id}: ${e.message}`);
      }
    }

    // Send cancellation emails — non-blocking
    const cancelledBy = isTraveler ? 'traveler' : 'host';

    sendCancellationEmail({
      email:       booking.userId.email,
      name:        booking.userId.name,
      experience:  booking.experienceId,
      cancelledBy,
    }).catch((e) => console.error('Cancel email failed:', e.message));

    await deleteCacheByPattern(`recommendations:*:${booking.userId._id}`);

    return successResponse(res, 200, 'Booking cancelled successfully', booking);
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/bookings/:id/complete ─────────────────────────────────────
// Host only — mark booking as completed
const completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking
      .findById(req.params.id)
      .populate('experienceId', 'title')
      .populate('userId', 'name email')
      .populate('hostId', 'name email');

    if (!booking) return errorResponse(res, 404, 'Booking not found');

    if (booking.hostId._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    if (booking.status === 'cancelled') {
      return errorResponse(res, 400, 'Cannot complete a cancelled booking');
    }

    if (booking.status === 'completed') {
      return errorResponse(res, 400, 'Booking is already completed');
    }

    booking.status = 'completed';
    await booking.save();

    await awardUserEvent({
      userId: booking.userId._id,
      type: 'booking_completed',
      points: 100,
      experienceId: booking.experienceId?._id,
      bookingId: booking._id,
      category: booking.experienceId?.category || '',
    });

    sendBookingCompletedEmail({
      email: booking.userId.email,
      name: booking.userId.name,
      experience: booking.experienceId,
    }).catch((e) => console.error('Booking completed email failed:', e.message));

    await deleteCacheByPattern(`recommendations:*:${booking.userId._id}`);

    return successResponse(res, 200, 'Booking marked as completed', booking);
  } catch (error) {
    next(error);
  }
};

const checkInBooking = async (req, res, next) => {
  try {
    const booking = await Booking
      .findById(req.params.id)
      .populate('experienceId', 'title location rewards')
      .populate('userId', 'name email rewards checkIns');

    if (!booking) return errorResponse(res, 404, 'Booking not found');

    const isTraveler = String(booking.userId._id) === String(req.user._id);
    const isHost = String(booking.hostId) === String(req.user._id);

    if (!isTraveler && !isHost) {
      return errorResponse(res, 403, 'Not authorized');
    }

    if (!['confirmed', 'completed', 'pending_payment', 'partially_paid'].includes(booking.status)) {
      return errorResponse(res, 400, 'Only confirmed bookings can be checked in');
    }

    if (booking.checkIn?.status === 'checked_in') {
      return successResponse(res, 200, 'Booking already checked in', booking);
    }

    const rewardPoints = Number(booking.experienceId?.rewards?.pointsPerCheckIn || 0);
    const { lat, lng, qrCode } = req.body || {};
    const expCoords = booking.experienceId?.location?.coordinates?.coordinates || [];
    const expLng = Number(expCoords?.[0]);
    const expLat = Number(expCoords?.[1]);
    const hasGeoAttempt = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Number.isFinite(expLat) && Number.isFinite(expLng);
    const withinRange = hasGeoAttempt ? distanceMeters(Number(lat), Number(lng), expLat, expLng) <= 200 : false;
    const qrMatches = qrCode && String(qrCode).trim() === String(booking.checkIn?.qrCode || '').trim();

    // Temporary fallback: allow check-in even when geo / QR verification is unavailable.
    const checkInMethod = qrMatches ? 'qr' : withinRange ? 'geo' : 'none';

    booking.checkIn = {
      status: 'checked_in',
      method: checkInMethod,
      qrCode: booking.checkIn?.qrCode || '',
      checkedInAt: new Date(),
      rewardPointsGranted: rewardPoints,
    };
    await booking.save();

    if (isTraveler) {
      const traveler = await User.findById(req.user._id);
      traveler.checkIns = Array.isArray(traveler.checkIns) ? traveler.checkIns : [];
      const rewardResult = await awardUserEvent({
        userId: traveler._id,
        type: 'check_in',
        points: rewardPoints,
        experienceId: booking.experienceId?._id,
        bookingId: booking._id,
        category: booking.experienceId?.category || '',
        meta: { method: checkInMethod },
      });

      traveler.checkIns.push({
        experienceId: booking.experienceId?._id,
        bookingId: booking._id,
        checkedInAt: booking.checkIn.checkedInAt,
        city: booking.experienceId?.location?.city || '',
        points: rewardPoints,
      });

      traveler.rewards = rewardResult.user?.rewards || traveler.rewards;
      await traveler.save();
    }

    return successResponse(res, 200, 'Check-in completed', booking);
  } catch (error) {
    next(error);
  }
};
const overrideBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return errorResponse(res, 404, 'Booking not found');
    if (String(booking.hostId) !== String(req.user._id)) return errorResponse(res, 403, 'Not authorized');
    
    booking.status = status;
    await booking.save();
    return successResponse(res, 200, 'Booking status updated manually', booking);
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
  completeBooking,
  checkInBooking,
  overrideBookingStatus,
  // Group booking endpoints
  getGroupBookingDetails: async (req, res, next) => {
    try {
      const { groupCode } = req.params;
      const booking = await Booking.findOne({
        'collaboration.groupCode': groupCode.toUpperCase(),
        status: { $in: ACTIVE_GROUP_STATUSES },
      })
        .populate('experienceId', 'title photos location price duration category availability groupSize bookingSettings')
        .populate('hostId', 'name profilePic')
        .populate('splitPayments');
      if (!booking) return errorResponse(res, 404, 'Group booking not found');
      if (ensureCollaborativeShares(booking)) {
        await booking.save();
      }

      const availabilityEntry = booking.experienceId?.availability?.find((slot) =>
        toDateOnlyString(slot.date) === toDateOnlyString(booking.slot?.date) &&
        String(slot.startTime) === String(booking.slot?.startTime)
      );
      const remaining = availabilityEntry
        ? Math.max(0, Number(availabilityEntry.slots || 0) - Number(availabilityEntry.booked || 0))
        : null;

      const payload = booking.toObject();
      payload.slot = {
        ...payload.slot,
        slotId: availabilityEntry?._id || null,
        remaining,
      };
      return successResponse(res, 200, 'Group booking details', payload);
    } catch (error) {
      next(error);
    }
  },

  joinGroupBooking: async (req, res, next) => {
    try {
      const { groupCode } = req.params;
      const email = String(req.body?.email || req.user?.email || '').trim().toLowerCase();
      if (!email) return errorResponse(res, 400, 'A valid email is required');
      const booking = await Booking.findOne({
        'collaboration.groupCode': groupCode.toUpperCase(),
        status: { $in: ACTIVE_GROUP_STATUSES },
      });
      if (!booking) return errorResponse(res, 404, 'Group booking not found');
      // Check if already joined
      const already = booking.splitPayments.find((s) => s.email === email);
      if (already) return successResponse(res, 200, 'Already joined group booking', booking);
      // Add to splitPayments
      booking.splitPayments.push({
        email,
        amount: Math.round(booking.pricing.totalAfterDiscount / Math.max(1, booking.splitPayments.length + 1)),
        isLeader: false,
        status: 'pending',
        inviteToken: '',
      });
      await booking.save();
      return successResponse(res, 200, 'Joined group booking', booking);
    } catch (error) {
      next(error);
    }
  },

  getGroupBookingProgress: async (req, res, next) => {
    try {
      const { groupCode } = req.params;
      const booking = await Booking.findOne({
        'collaboration.groupCode': groupCode.toUpperCase(),
        status: { $in: ACTIVE_GROUP_STATUSES },
      });
      if (!booking) return errorResponse(res, 404, 'Group booking not found');
      // Progress: how many paid, total, amounts
      const total = booking.splitPayments.length;
      const paid = booking.splitPayments.filter((s) => s.status === 'paid').length;
      const progress = {
        total,
        paid,
        members: booking.splitPayments.map((s) => ({ email: s.email, status: s.status, amount: s.amount })),
        totalAmount: booking.pricing.totalAfterDiscount,
        paidAmount: booking.splitPayments.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0),
        remainingAmount: booking.splitPayments.filter((s) => s.status !== 'paid').reduce((sum, s) => sum + s.amount, 0),
      };
      return successResponse(res, 200, 'Group booking progress', progress);
    } catch (error) {
      next(error);
    }
  },

  createGroupSharePaymentIntent: async (req, res, next) => {
    try {
      const { groupCode } = req.params;
      const booking = await Booking.findOne({
        'collaboration.groupCode': groupCode.toUpperCase(),
        status: { $in: ACTIVE_GROUP_STATUSES },
      }).populate('experienceId', 'isActive');

      if (!booking || !booking.experienceId?.isActive) {
        return errorResponse(res, 404, 'Group booking not found');
      }
      if (ensureCollaborativeShares(booking)) {
        await booking.save();
      }

      const userEmail = String(req.user?.email || '').trim().toLowerCase();
      if (!userEmail) return errorResponse(res, 400, 'A valid account email is required');

      let share = booking.splitPayments.find((entry) => entry.email === userEmail);
      if (!share) {
        booking.splitPayments.push({
          email: userEmail,
          amount: Math.round(booking.pricing.totalAfterDiscount / Math.max(1, booking.splitPayments.length + 1)),
          isLeader: false,
          status: 'pending',
          inviteToken: buildInviteToken(),
        });
        await booking.save();
        share = booking.splitPayments.find((entry) => entry.email === userEmail);
      }

      if (!share) return errorResponse(res, 400, 'Unable to prepare your payment share');
      if (share.status === 'paid') {
        return successResponse(res, 200, 'Your share is already paid', {
          alreadyPaid: true,
          amount: share.amount,
          pricing: {
            splitPayment: true,
            totalAfterDiscount: share.amount,
            amountDueNow: share.amount,
            remainingAmount: 0,
          },
        });
      }

      const amount = Math.max(1, Math.round(Number(share.amount || 0)));
      const paymentIntent = await createPaymentIntent({
        amount,
        metadata: {
          bookingId: booking._id.toString(),
          groupCode: groupCode.toUpperCase(),
          shareEmail: userEmail,
        },
      });

      return successResponse(res, 200, 'Share payment intent created', {
        clientSecret: paymentIntent.client_secret,
        amount,
        paymentIntentId: paymentIntent.id,
        bookingId: booking._id,
        pricing: {
          splitPayment: true,
          totalAfterDiscount: amount,
          amountDueNow: amount,
          remainingAmount: 0,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  confirmGroupSharePayment: async (req, res, next) => {
    try {
      const { groupCode } = req.params;
      const { paymentIntentId } = req.body || {};
      if (!paymentIntentId) return errorResponse(res, 400, 'Payment intent is required');

      const isProd = process.env.NODE_ENV === 'production';
      let paymentIntent = null;
      try {
        paymentIntent = await retrievePaymentIntent(paymentIntentId);
      } catch (err) {
        if (isProd) return errorResponse(res, 400, 'Payment not completed');
        console.warn('Stripe share payment lookup failed in non-production, continuing anyway:', err.message);
      }

      if (isProd && paymentIntent && paymentIntent.status !== 'succeeded') {
        return errorResponse(res, 400, 'Payment not completed');
      }

      const booking = await Booking.findOne({
        'collaboration.groupCode': groupCode.toUpperCase(),
        status: { $in: ACTIVE_GROUP_STATUSES },
      })
        .populate('experienceId', 'title photos location price duration')
        .populate('hostId', 'name email profilePic')
        .populate('userId', 'name email profilePic');

      if (!booking) return errorResponse(res, 404, 'Group booking not found');

      const userEmail = String(req.user?.email || '').trim().toLowerCase();
      const share = booking.splitPayments.find((entry) => entry.email === userEmail);
      if (!share) return errorResponse(res, 404, 'No payment share found for this user');
      if (share.status === 'paid') {
        syncSplitBookingStatus(booking);
        await booking.save();
        return successResponse(res, 200, 'Your share is already paid', booking);
      }

      if (paymentIntent) {
        const metadata = paymentIntent.metadata || {};
        if (
          String(metadata.bookingId || '') !== String(booking._id) ||
          String(metadata.groupCode || '') !== String(groupCode).toUpperCase() ||
          String(metadata.shareEmail || '').toLowerCase() !== userEmail
        ) {
          return errorResponse(res, 400, 'Payment details do not match this share');
        }

        if (Number(paymentIntent.amount) !== Number(share.amount)) {
          return errorResponse(res, 400, 'Payment amount does not match this share');
        }
      }

      share.status = 'paid';
      share.paymentIntentId = paymentIntentId;
      share.paidAt = new Date();
      syncSplitBookingStatus(booking);
      await booking.save();

      return successResponse(res, 200, 'Share payment completed', booking);
    } catch (error) {
      next(error);
    }
  },
};
