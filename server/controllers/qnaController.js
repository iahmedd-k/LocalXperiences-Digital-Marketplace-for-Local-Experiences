const QnA                        = require('../models/QnA');
const Experience                 = require('../models/Experience');
const User                       = require('../models/User');
const { sendNewQuestionAlert,
        sendQuestionAnsweredAlert } = require('../services/emailService');
const { successResponse,
        errorResponse,
        paginatedResponse }        = require('../utils/apiResponse');

// ─── @POST /api/qna ───────────────────────────────────────────────────────
// Any logged-in user — Ask a question on an experience
const askQuestion = async (req, res, next) => {
  try {
    const { experienceId, question } = req.body;

    const experience = await Experience
      .findById(experienceId)
      .populate('hostId', 'name email');

    if (!experience || !experience.isActive) {
      return errorResponse(res, 404, 'Experience not found');
    }

    const qna = await QnA.create({
      experienceId,
      askedBy:  req.user._id,
      question,
    });

    await qna.populate('askedBy', 'name profilePic');

    // Notify host — non-blocking
    sendNewQuestionAlert({
      email:      experience.hostId.email,
      hostName:   experience.hostId.name,
      experience,
      question,
      askerName:  req.user.name,
    }).catch((e) => console.error('Question alert email failed:', e.message));

    return successResponse(res, 201, 'Question posted', qna);
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/qna/:experienceId ──────────────────────────────────────────
// Public — Get all Q&A for an experience
const getExperienceQnA = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await QnA.countDocuments({ experienceId: req.params.experienceId });

    const qnas = await QnA
      .find({ experienceId: req.params.experienceId })
      .populate('askedBy', 'name profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'Q&A fetched', qnas, {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/qna/:id/answer ─────────────────────────────────────────────
// Host only — Answer a question
const answerQuestion = async (req, res, next) => {
  try {
    const { answer } = req.body;

    const qna = await QnA
      .findById(req.params.id)
      .populate('experienceId', 'title hostId')
      .populate('askedBy', 'name email');

    if (!qna) return errorResponse(res, 404, 'Question not found');

    // Only the host of that experience can answer
    if (qna.experienceId.hostId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to answer this question');
    }

    if (qna.isAnswered) {
      return errorResponse(res, 400, 'This question has already been answered');
    }

    qna.answer      = { text: answer, answeredAt: new Date() };
    qna.isAnswered  = true;
    await qna.save();

    // Notify the person who asked — non-blocking
    sendQuestionAnsweredAlert({
      email:      qna.askedBy.email,
      name:       qna.askedBy.name,
      experience: qna.experienceId,
      answer,
    }).catch((e) => console.error('Answer alert email failed:', e.message));

    return successResponse(res, 200, 'Question answered', qna);
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/qna/:id ─────────────────────────────────────────────────
// Only the question owner can delete (if not yet answered)
const deleteQuestion = async (req, res, next) => {
  try {
    const qna = await QnA.findById(req.params.id);
    if (!qna) return errorResponse(res, 404, 'Question not found');

    if (qna.askedBy.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    if (qna.isAnswered) {
      return errorResponse(res, 400, 'Cannot delete an answered question');
    }

    await qna.deleteOne();
    return successResponse(res, 200, 'Question deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { askQuestion, getExperienceQnA, answerQuestion, deleteQuestion };