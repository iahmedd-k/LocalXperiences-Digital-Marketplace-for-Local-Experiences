const User = require('../models/User');
const Experience = require('../models/Experience');
const Story = require('../models/Story');
const Pathway = require('../models/Pathway');
const Review = require('../models/Review');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getPublicHostProfile = async (req, res, next) => {
  try {
    const host = await User.findById(req.params.id).select('-password -googleId');
    if (!host || host.role !== 'host') {
      return errorResponse(res, 404, 'Host not found');
    }

    const experiences = await Experience.find({
      hostId: host._id,
      isActive: true,
    })
      .select('title price duration photos location rating category microExperience')
      .sort({ createdAt: -1 })
      .limit(12);

    const experienceIds = experiences.map((experience) => experience._id);

    const [stories, pathways, reviews] = await Promise.all([
      Story.find({ hostId: host._id, isPublished: true })
        .select('title slug excerpt coverImage coverImageAlt category locationLabel readTimeMinutes tags createdAt')
        .sort({ createdAt: -1 })
        .limit(6),
      Pathway.find({ creatorId: host._id, isPublic: true })
        .select('title description coverPhoto city totalDuration totalPrice saves tags createdAt')
        .sort({ createdAt: -1 })
        .limit(6),
      experienceIds.length
        ? Review.find({ experienceId: { $in: experienceIds } })
            .populate('userId', 'name profilePic')
            .populate('experienceId', 'title')
            .sort({ createdAt: -1 })
            .limit(12)
        : [],
    ]);

    const averageRating = reviews.length
      ? Number((reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length).toFixed(1))
      : Number(host.hostDetails?.ratingAverage || 0);

    return successResponse(res, 200, 'Host profile fetched', {
      ...host.toObject(),
      experiences,
      stories,
      pathways,
      reviews,
      reviewSummary: {
        average: averageRating,
        count: reviews.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicHostProfile,
};
