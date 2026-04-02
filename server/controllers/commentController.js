const Comment              = require('../models/Comment');
const Experience           = require('../models/Experience');
const { successResponse,
        errorResponse,
        paginatedResponse } = require('../utils/apiResponse');

// ─── @POST /api/comments ──────────────────────────────────────────────────
// Any logged-in user — Post a comment on an experience
const createComment = async (req, res, next) => {
  try {
    const { experienceId, text } = req.body;

    const experience = await Experience.findById(experienceId);
    if (!experience || !experience.isActive) {
      return errorResponse(res, 404, 'Experience not found');
    }

    const comment = await Comment.create({
      experienceId,
      userId: req.user._id,
      text,
    });

    await comment.populate('userId', 'name profilePic');

    return successResponse(res, 201, 'Comment posted', comment);
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/comments/:experienceId ─────────────────────────────────────
// Public — Get all comments for an experience
const getExperienceComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Comment.countDocuments({ experienceId: req.params.experienceId });

    const comments = await Comment
      .find({ experienceId: req.params.experienceId })
      .populate('userId', 'name profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'Comments fetched', comments, {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/comments/:id ────────────────────────────────────────────
// Only the comment owner can delete
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return errorResponse(res, 404, 'Comment not found');

    if (comment.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to delete this comment');
    }

    await comment.deleteOne();
    return successResponse(res, 200, 'Comment deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { createComment, getExperienceComments, deleteComment };