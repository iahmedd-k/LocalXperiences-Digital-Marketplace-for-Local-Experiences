const Itinerary             = require('../models/Itinerary');
const Experience            = require('../models/Experience');
const crypto                = require('crypto');
const { successResponse,
        errorResponse,
        paginatedResponse } = require('../utils/apiResponse');

// ─── @POST /api/itineraries ───────────────────────────────────────────────
// Traveler — Create new itinerary
const createItinerary = async (req, res, next) => {
  try {
    const { title, experienceIds, notes } = req.body;

    // Validate experiences exist
    if (experienceIds && experienceIds.length > 0) {
      const count = await Experience.countDocuments({
        _id:      { $in: experienceIds },
        isActive: true,
      });
      if (count !== experienceIds.length) {
        return errorResponse(res, 400, 'One or more experiences not found');
      }
    }

    const itinerary = await Itinerary.create({
      userId: req.user._id,
      title,
      experienceIds: experienceIds || [],
      notes:         notes || '',
    });

    await itinerary.populate('experienceIds', 'title photos location price duration category');

    return successResponse(res, 201, 'Itinerary created', itinerary);
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/itineraries ────────────────────────────────────────────────
// Traveler — Get all my itineraries
const getMyItineraries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Itinerary.countDocuments({ userId: req.user._id });

    const itineraries = await Itinerary
      .find({ userId: req.user._id })
      .populate('experienceIds', 'title photos location price duration category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'Itineraries fetched', itineraries, {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/itineraries/:id ────────────────────────────────────────────
// Get single itinerary — owner or via share token
const getItineraryById = async (req, res, next) => {
  try {
    const itinerary = await Itinerary
      .findById(req.params.id)
      .populate('experienceIds', 'title photos location price duration category rating')
      .populate('userId', 'name profilePic');

    if (!itinerary) return errorResponse(res, 404, 'Itinerary not found');

    const isOwner  = req.user && itinerary.userId._id.toString() === req.user._id.toString();
    const isPublic = itinerary.isPublic;

    if (!isOwner && !isPublic) {
      return errorResponse(res, 403, 'This itinerary is private');
    }

    return successResponse(res, 200, 'Itinerary fetched', itinerary);
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/itineraries/share/:token ───────────────────────────────────
// Public — View shared itinerary via share token
const getItineraryByToken = async (req, res, next) => {
  try {
    const itinerary = await Itinerary
      .findOne({ shareToken: req.params.token })
      .populate('experienceIds', 'title photos location price duration category rating')
      .populate('userId', 'name profilePic');

    if (!itinerary) return errorResponse(res, 404, 'Shared itinerary not found');

    return successResponse(res, 200, 'Itinerary fetched', itinerary);
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/itineraries/:id ────────────────────────────────────────────
// Traveler — Update itinerary
const updateItinerary = async (req, res, next) => {
  try {
    const { title, experienceIds, notes } = req.body;

    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return errorResponse(res, 404, 'Itinerary not found');

    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    if (title)         itinerary.title         = title;
    if (notes !== undefined) itinerary.notes   = notes;
    if (experienceIds) itinerary.experienceIds  = experienceIds;

    await itinerary.save();
    await itinerary.populate('experienceIds', 'title photos location price duration category');

    return successResponse(res, 200, 'Itinerary updated', itinerary);
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/itineraries/:id/experiences ───────────────────────────────
// Traveler — Add a single experience to itinerary
const addExperienceToItinerary = async (req, res, next) => {
  try {
    const { experienceId } = req.body;

    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return errorResponse(res, 404, 'Itinerary not found');

    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    // Prevent duplicates
    if (itinerary.experienceIds.map(String).includes(experienceId)) {
      return errorResponse(res, 400, 'Experience already in itinerary');
    }

    const experience = await Experience.findById(experienceId);
    if (!experience || !experience.isActive) {
      return errorResponse(res, 404, 'Experience not found');
    }

    itinerary.experienceIds.push(experienceId);
    await itinerary.save();
    await itinerary.populate('experienceIds', 'title photos location price duration category');

    return successResponse(res, 200, 'Experience added to itinerary', itinerary);
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/itineraries/:id/experiences/:experienceId ───────────────
// Traveler — Remove experience from itinerary
const removeExperienceFromItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return errorResponse(res, 404, 'Itinerary not found');

    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    itinerary.experienceIds = itinerary.experienceIds.filter(
      (id) => id.toString() !== req.params.experienceId
    );

    await itinerary.save();
    return successResponse(res, 200, 'Experience removed from itinerary', itinerary);
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/itineraries/:id/share ─────────────────────────────────────
// Traveler — Generate shareable link
const shareItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return errorResponse(res, 404, 'Itinerary not found');

    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    // Generate token if not already shared
    if (!itinerary.shareToken) {
      itinerary.shareToken = crypto.randomBytes(16).toString('hex');
    }

    itinerary.isPublic = true;
    await itinerary.save();

    const shareUrl = `${process.env.CLIENT_URL}/itineraries/shared/${itinerary.shareToken}`;

    return successResponse(res, 200, 'Itinerary shared', { shareUrl, shareToken: itinerary.shareToken });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/itineraries/:id ─────────────────────────────────────────
// Traveler — Delete itinerary
const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return errorResponse(res, 404, 'Itinerary not found');

    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    await itinerary.deleteOne();
    return successResponse(res, 200, 'Itinerary deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItinerary,
  getMyItineraries,
  getItineraryById,
  getItineraryByToken,
  updateItinerary,
  addExperienceToItinerary,
  removeExperienceFromItinerary,
  shareItinerary,
  deleteItinerary,
};