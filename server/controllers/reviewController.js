const Review                   = require('../models/Review');
const Booking                  = require('../models/Booking');
const Experience               = require('../models/Experience');
const { sendNewReviewAlert }   = require('../services/emailService');
const { successResponse,
        errorResponse,
        paginatedResponse }    = require('../utils/apiResponse');
const { deleteCacheByPattern } = require('../config/redis');

// ─── @POST /api/reviews ────────────────────────────────────────────────────
// Authenticated user — Leave review
const createReview = async (req, res, next) => {
  try {
    const { bookingId, experienceId, rating, comment } = req.body;
    const trimmedComment = String(comment || '').trim();
    const photoPaths = Array.isArray(req.files) ? req.files.map((file) => file.path).filter(Boolean) : [];

    if (!req.user) {
      return errorResponse(res, 401, 'Login required to submit a review');
    }

    if (!trimmedComment && !photoPaths.length) {
      return errorResponse(res, 400, 'Add review text or upload at least one photo');
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return errorResponse(res, 400, 'Rating must be between 1 and 5');
    }

    let resolvedExperience = null;
    let resolvedHost = null;
    let reviewPayload = null;

    if (bookingId) {
      const booking = await Booking
        .findById(bookingId)
        .populate('experienceId')
        .populate('hostId', 'name email');

      if (!booking) {
        return errorResponse(res, 404, 'Booking not found');
      }

      if (booking.userId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, 'Not authorized to review this booking');
      }

      if (experienceId && String(booking.experienceId?._id || booking.experienceId) !== String(experienceId)) {
        return errorResponse(res, 400, 'This booking does not match the selected experience');
      }

      if (booking.reviewLeft) {
        return errorResponse(res, 400, 'You have already reviewed this booking');
      }

      resolvedExperience = booking.experienceId;
      resolvedHost = booking.hostId;

      reviewPayload = {
        experienceId: booking.experienceId._id,
        userId: req.user._id,
        bookingId,
        guestName: null,
        rating: numericRating,
        comment: trimmedComment,
        photos: photoPaths,
      };

      booking.reviewLeft = true;
      await booking.save();
    } else {
      const experience = await Experience
        .findById(experienceId)
        .populate('hostId', 'name email');

      if (!experience || !experience.isActive) {
        return errorResponse(res, 404, 'Experience not found');
      }

      resolvedExperience = experience;
      resolvedHost = experience.hostId;

      reviewPayload = {
        experienceId: experience._id,
        userId: req.user._id,
        bookingId: null,
        guestName: null,
        rating: numericRating,
        comment: trimmedComment,
        photos: photoPaths,
      };
    }

    const review = await Review.create(reviewPayload);

    // Update experience aggregated rating
    const allReviews = await Review.find({ experienceId: resolvedExperience._id });
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Experience.findByIdAndUpdate(resolvedExperience._id, {
      'rating.average': Math.round(avgRating * 10) / 10,
      'rating.count':   allReviews.length,
    });

    // Invalidate experience cache
    await deleteCacheByPattern(`experience:${resolvedExperience._id}`);
    await deleteCacheByPattern('experiences:*');

    // Notify host — non-blocking
    sendNewReviewAlert({
      email:        resolvedHost?.email,
      hostName:     resolvedHost?.name,
      experience:   resolvedExperience,
      rating:       numericRating,
      reviewerName: req.user?.name || 'Traveler',
    }).catch((e) => console.error('Review alert email failed:', e.message));

    return successResponse(res, 201, 'Review submitted', review);
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, 400, 'You have already submitted a review for this booking');
    }
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

// ─── @GET /api/reviews/me ────────────────────────────────────────────────
// Traveler — Get my posted reviews
const getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Review.countDocuments({ userId: req.user._id });

    const reviews = await Review
      .find({ userId: req.user._id })
      .populate('experienceId', 'title photos location duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'My reviews fetched', reviews, {
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
    const replyText = String(req.body?.text ?? req.body?.reply ?? '').trim();

    if (!req.user || req.user.role !== 'host') {
      return errorResponse(res, 403, 'Only hosts can reply to reviews');
    }

    if (!replyText) {
      return errorResponse(res, 400, 'Reply text is required');
    }

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

    review.hostReply = { text: replyText, repliedAt: new Date() };
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

module.exports = { createReview, getExperienceReviews, getMyReviews, replyToReview, getHostReviews };
