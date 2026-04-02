const User = require('../models/User');
const Experience = require('../models/Experience');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { deleteCacheByPattern } = require('../config/redis');

// @GET /api/wishlist
// Protected - get logged-in user's saved experiences
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        match: { isActive: true },
        populate: { path: 'hostId', select: 'name profilePic' },
      });

    const wishlist = (user?.wishlist || []).filter(Boolean);
    return successResponse(res, 200, 'Wishlist fetched', wishlist);
  } catch (error) {
    next(error);
  }
};

// @POST /api/wishlist/:experienceId
// Protected - add an experience to wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const { experienceId } = req.params;

    const exp = await Experience.findOne({ _id: experienceId, isActive: true }).select('_id');
    if (!exp) return errorResponse(res, 404, 'Experience not found');

    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 404, 'User not found');

    const alreadySaved = user.wishlist.some((id) => id.toString() === experienceId);
    if (!alreadySaved) {
      user.wishlist.push(experienceId);
      await user.save();
    }

    await deleteCacheByPattern(`recommendations:*:${req.user._id}`);

    return successResponse(res, 200, 'Experience added to wishlist', {
      wishlistIds: user.wishlist.map((id) => id.toString()),
    });
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/wishlist/:experienceId
// Protected - remove an experience from wishlist
const removeFromWishlist = async (req, res, next) => {
  try {
    const { experienceId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 404, 'User not found');

    user.wishlist = user.wishlist.filter((id) => id.toString() !== experienceId);
    await user.save();

    await deleteCacheByPattern(`recommendations:*:${req.user._id}`);

    return successResponse(res, 200, 'Experience removed from wishlist', {
      wishlistIds: user.wishlist.map((id) => id.toString()),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
