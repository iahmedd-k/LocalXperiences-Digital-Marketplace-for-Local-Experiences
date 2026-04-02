const User = require('../models/User');
const Experience = require('../models/Experience');
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

    return successResponse(res, 200, 'Host profile fetched', {
      ...host.toObject(),
      experiences,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicHostProfile,
};
