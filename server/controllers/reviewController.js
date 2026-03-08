const Review                   = require('../models/Review');
const Booking                  = require('../models/Booking');
const Experience               = require('../models/Experience');
const { sendNewReviewAlert }   = require('../services/emailService');
const { successResponse,
        errorResponse,
        paginatedResponse }    = require('../utils/apiResponse');
const { deleteCacheByPattern } = require('../config/redis');

// ─── @POST /api/reviews ────────────────────────────────────────────────────
// Traveler — Leave review after completed booking
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    console.log('Review submission:', { bookingId, userId: req.user?._id });

    const booking = await Booking
      .findById(bookingId)
      .populate('experienceId')
      .populate('hostId', 'name email');

    if (!booking) {
      console.warn('Booking not found for bookingId:', bookingId);
      return errorResponse(res, 404, 'Booking not found');
    }

    // Only the traveler who made the booking can review
    if (booking.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to review this booking');
    }

    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      return errorResponse(res, 400, 'You can only review confirmed or completed bookings');
    }

    if (booking.reviewLeft) {
      return errorResponse(res, 400, 'You have already reviewed this booking');
    }

    // Create review
    const review = await Review.create({
      experienceId: booking.experienceId._id,
      userId:       req.user._id,
      bookingId,
      rating,
      comment,
    });

    // Mark booking as reviewed
    booking.reviewLeft = true;
    await booking.save();

    // Update experience aggregated rating
    const allReviews = await Review.find({ experienceId: booking.experienceId._id });
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Experience.findByIdAndUpdate(booking.experienceId._id, {
      'rating.average': Math.round(avgRating * 10) / 10,
      'rating.count':   allReviews.length,
    });

    // Invalidate experience cache
    await deleteCacheByPattern(`experience:${booking.experienceId._id}`);
    await deleteCacheByPattern('experiences:*');

    // Notify host — non-blocking
    sendNewReviewAlert({
      email:        booking.hostId.email,
      hostName:     booking.hostId.name,
      experience:   booking.experienceId,
      rating,
      reviewerName: req.user.name,
    }).catch((e) => console.error('Review alert email failed:', e.message));

    return successResponse(res, 201, 'Review submitted', review);
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/reviews/:experienceId ──────────────────────────────────────
// Public — Get all reviews for an experience
const getExperienceReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Review.countDocuments({ experienceId: req.params.experienceId });

    const reviews = await Review
      .find({ experienceId: req.params.experienceId })
      .populate('userId', 'name profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'Reviews fetched', reviews, {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/reviews/:id/reply ──────────────────────────────────────────
// Host — Reply to a review
const replyToReview = async (req, res, next) => {
  try {
    const { text } = req.body;

    const review = await Review
      .findById(req.params.id)
      .populate('experienceId', 'hostId');

    if (!review) return errorResponse(res, 404, 'Review not found');

    // Only the host of that experience can reply
    if (review.experienceId.hostId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to reply to this review');
    }

    if (review.hostReply.text) {
      return errorResponse(res, 400, 'You have already replied to this review');
    }

    review.hostReply = { text, repliedAt: new Date() };
    await review.save();

    return successResponse(res, 200, 'Reply added', review);
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/reviews/host/my-reviews ────────────────────────────────────
// Host — Get all reviews for my experiences
const getHostReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get all experience IDs owned by this host
    const experiences = await Experience
      .find({ hostId: req.user._id })
      .select('_id');

    const experienceIds = experiences.map((e) => e._id);
    const skip          = (Number(page) - 1) * Number(limit);
    const total         = await Review.countDocuments({ experienceId: { $in: experienceIds } });

    const reviews = await Review
      .find({ experienceId: { $in: experienceIds } })
      .populate('userId',       'name profilePic')
      .populate('experienceId', 'title photos')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'Host reviews fetched', reviews, {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getExperienceReviews, replyToReview, getHostReviews };