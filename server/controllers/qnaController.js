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

    if (!question || !String(question).trim()) {
      return errorResponse(res, 400, 'Question is required');
    }

    const experience = await Experience
      .findById(experienceId)
      .populate('hostId', 'name email');

    if (!experience || !experience.isActive) {
      return errorResponse(res, 404, 'Experience not found');
    }

    const qna = await QnA.create({
      experienceId,
      askedBy:  req.user._id,
      guestName: null,
      question: String(question).trim(),
    });

    await qna.populate('askedBy', 'name profilePic');

    // Notify host — non-blocking
    sendNewQuestionAlert({
      email:      experience.hostId.email,
      hostName:   experience.hostId.name,
      experience,
      question,
      askerName:  req.user?.name || 'Traveler',
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
    const { page = 1, limit } = req.query;
    const parsedLimit = limit ? Number(limit) : null;
    const skip  = parsedLimit ? (Number(page) - 1) * parsedLimit : 0;
    const total = await QnA.countDocuments({ experienceId: req.params.experienceId });

    let query = QnA
      .find({ experienceId: req.params.experienceId })
      .populate('askedBy', 'name profilePic')
      .populate('answer.answeredBy', 'name profilePic')
      .populate('replies.repliedBy', 'name profilePic')
      .sort({ createdAt: -1 });

    if (parsedLimit) {
      query = query.skip(skip).limit(parsedLimit);
    }

    const qnas = await query;

    return paginatedResponse(res, 'Q&A fetched', qnas, {
      total,
      page:       Number(page),
      limit:      parsedLimit || total,
      totalPages: parsedLimit ? Math.ceil(total / parsedLimit) : 1,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/qna/:id/answer ─────────────────────────────────────────────
// Any logged-in user — Answer a question
const answerQuestion = async (req, res, next) => {
  try {
    const { answer } = req.body;

    if (!answer || !String(answer).trim()) {
      return errorResponse(res, 400, 'Answer is required');
    }

    const qna = await QnA
      .findById(req.params.id)
      .populate('experienceId', 'title hostId')
      .populate('askedBy', 'name email');

    if (!qna) return errorResponse(res, 404, 'Question not found');

    const replyText = String(answer).trim();

    qna.replies.push({
      text: replyText,
      repliedBy: req.user._id,
      createdAt: new Date(),
    });

    // Keep legacy single-answer fields in sync with latest reply for older clients.
    qna.answer = {
      text: replyText,
      answeredBy: req.user._id,
      answeredAt: new Date(),
    };
    qna.isAnswered = true;
    await qna.save();
    await qna.populate('answer.answeredBy', 'name profilePic');
    await qna.populate('replies.repliedBy', 'name profilePic');

    // Notify the person who asked — non-blocking
    if (qna.askedBy?.email) {
      sendQuestionAnsweredAlert({
        email:      qna.askedBy.email,
        name:       qna.askedBy.name,
        experience: qna.experienceId,
        answer:     replyText,
      }).catch((e) => console.error('Answer alert email failed:', e.message));
    }

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

    if (!qna.askedBy) {
      return errorResponse(res, 403, 'Anonymous questions cannot be deleted');
    }

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