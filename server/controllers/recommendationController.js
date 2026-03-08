const { getRecommendations }   = require('../services/recommendationService');
const { setCache, getCache }   = require('../config/redis');
const { successResponse,
        errorResponse }        = require('../utils/apiResponse');

// ─── @GET /api/recommendations ────────────────────────────────────────────
// Protected — Get personalized recommendations for logged-in user
const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    // Cache per user — 30 min TTL so it stays fresh but not hammering Claude API
    const cacheKey = `recommendations:${req.user._id}`;
    const cached   = await getCache(cacheKey);
    if (cached) return successResponse(res, 200, 'Recommendations fetched', cached);

    const recommendations = await getRecommendations(req.user);

    await setCache(cacheKey, recommendations, 1800); // 30 minutes

    return successResponse(res, 200, 'Recommendations fetched', recommendations);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPersonalizedRecommendations };