const Groq = require('groq-sdk');
const Experience = require('../models/Experience');
const Booking = require('../models/Booking');
const User = require('../models/User');

const client = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const MAX_BOOKING_HISTORY = 10;
const MAX_AVAILABLE_POOL = 50;
const MAX_CANDIDATES = 12;
const MAX_RESULTS = 6;
const MIN_MATCH_SCORE = 3;

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const normalizeArray = (values) => (
  Array.isArray(values)
    ? values.map(normalizeText).filter(Boolean)
    : []
);

const getOverlapCount = (sourceSet, values) => (
  normalizeArray(values).reduce((count, value) => count + (sourceSet.has(value) ? 1 : 0), 0)
);

const getAveragePrice = (items) => {
  const prices = items
    .map((item) => Number(item?.experienceId?.price))
    .filter((price) => Number.isFinite(price) && price >= 0);

  if (prices.length === 0) return null;
  return prices.reduce((sum, price) => sum + price, 0) / prices.length;
};

const addCount = (map, key, amount = 1) => {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + amount);
};

const buildUserProfile = (user, pastBookings, wishlist = []) => {
  const categoryCounts = new Map();
  const tagCounts = new Map();
  const cityCounts = new Map();

  for (const booking of pastBookings) {
    const experience = booking.experienceId;
    const category = normalizeText(experience?.category);
    const city = normalizeText(experience?.location?.city);

    addCount(categoryCounts, category, 1);
    addCount(cityCounts, city, 1);

    for (const tag of normalizeArray(experience?.tags)) {
      addCount(tagCounts, tag, 1);
    }
  }

  for (const experience of wishlist) {
    const category = normalizeText(experience?.category);
    const city = normalizeText(experience?.location?.city);

    // Wishlist is a strong intent signal, but we still keep bookings as the primary source.
    addCount(categoryCounts, category, 2);
    addCount(cityCounts, city, 1);

    for (const tag of normalizeArray(experience?.tags)) {
      addCount(tagCounts, tag, 2);
    }
  }

  const preferredCategories = normalizeArray(user?.travelerPreferences?.categories);
  const preferredInterests = normalizeArray(user?.travelerPreferences?.interests);
  const preferredCities = normalizeArray(user?.travelerPreferences?.cities);

  preferredCategories.forEach((value) => addCount(categoryCounts, value, 2));
  preferredInterests.forEach((value) => addCount(tagCounts, value, 2));
  preferredCities.forEach((value) => addCount(cityCounts, value, 2));

  return {
    languages: normalizeArray(user?.languages),
    preferredLanguage: normalizeText(user?.travelerPreferences?.preferredLanguage || 'en'),
    // removed preferredDuration and preferredBudget
    categories: new Set(categoryCounts.keys()),
    tags: new Set(tagCounts.keys()),
    cities: new Set(cityCounts.keys()),
    averagePrice: getAveragePrice(pastBookings),
    categoryCounts,
    tagCounts,
    cityCounts,
  };
};

const scoreExperience = (experience, profile) => {
  const category = normalizeText(experience?.category);
  const city = normalizeText(experience?.location?.city);
  const tags = normalizeArray(experience?.tags);
  const languageSignals = normalizeArray([
    ...(experience?.languages || []),
    ...(experience?.languagesSupported || []),
    ...(experience?.hostId?.languages || []),
  ]);

  let score = 0;

  if (category && profile.categories.has(category)) {
    score += 4 + (profile.categoryCounts.get(category) || 0);
  }

  const tagScore = tags.reduce((sum, tag) => sum + (profile.tagCounts.get(tag) || 0), 0);
  score += tagScore * 2;

  if (city && profile.cities.has(city)) {
    score += 2 + (profile.cityCounts.get(city) || 0);
  }

  const languageOverlap = getOverlapCount(new Set(profile.languages), languageSignals);
  if (languageOverlap > 0) score += languageOverlap;

  if (profile.preferredLanguage && languageSignals.includes(profile.preferredLanguage)) {
    score += 2;
  }

  // removed preferredDuration scoring

  const price = Number(experience?.price);
  if (profile.averagePrice != null && Number.isFinite(price)) {
    const delta = Math.abs(price - profile.averagePrice);
    if (delta <= 25) score += 2;
    else if (delta <= 60) score += 1;
  }

  // removed preferredBudget scoring

  if (experience?.microExperience?.isEnabled) {
    // removed preferredDuration fallback
  }

  const ratingAverage = Number(experience?.rating?.average || 0);
  const ratingCount = Number(experience?.rating?.count || 0);
  if (ratingAverage >= 4.5) score += 1;
  if (ratingCount >= 5) score += 1;

  return {
    score,
    hasStrongMatch: Boolean(
      (category && profile.categories.has(category)) ||
      tagScore > 0 ||
      (city && profile.cities.has(city))
    ),
  };
};

const buildReason = (experience, profile) => {
  const category = normalizeText(experience?.category);
  const city = normalizeText(experience?.location?.city);
  const tags = normalizeArray(experience?.tags);

  const matchingTags = tags.filter((tag) => profile.tags.has(tag)).slice(0, 2);

  if (matchingTags.length > 0) {
    return `Matches your interest in ${matchingTags.join(' and ')} experiences.`;
  }

  if (category && profile.categories.has(category)) {
    return `Similar to the ${category} experiences you've booked before.`;
  }

  if (city && profile.cities.has(city)) {
    return `A good fit based on the cities you've explored before.`;
  }

  return 'Chosen because it aligns with your recent bookings.';
};

const shortlistCandidates = (available, profile) => (
  available
    .map((experience) => {
      const { score, hasStrongMatch } = scoreExperience(experience, profile);
      return { experience, score, hasStrongMatch };
    })
    .filter(({ score, hasStrongMatch }) => hasStrongMatch && score >= MIN_MATCH_SCORE)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ratingDiff = Number(b.experience?.rating?.average || 0) - Number(a.experience?.rating?.average || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return Number(a.experience?.price || 0) - Number(b.experience?.price || 0);
    })
    .slice(0, MAX_CANDIDATES)
);

const rerankWithAi = async (user, pastBookings, wishlist, candidates) => {
  if (!client || candidates.length === 0) return null;

  const userContext = {
    name: user.name,
    languages: user.languages,
    pastBookings: pastBookings.map((booking) => ({
      title: booking.experienceId?.title,
      category: booking.experienceId?.category,
      tags: booking.experienceId?.tags,
      location: booking.experienceId?.location?.city,
      price: booking.experienceId?.price,
    })),
    wishlist: wishlist.map((experience) => ({
      title: experience?.title,
      category: experience?.category,
      tags: experience?.tags,
      location: experience?.location?.city,
      price: experience?.price,
    })),
  };

  const candidateList = candidates.map(({ experience, score }) => ({
    id: String(experience._id),
    title: experience.title,
    category: experience.category,
    tags: experience.tags,
    city: experience.location?.city,
    price: experience.price,
    duration: experience.duration,
    rating: experience.rating?.average,
    score,
  }));

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 800,
    messages: [
      {
        role: 'system',
        content: 'You are a local experience recommendation engine. You always respond with valid JSON only. No markdown, no extra text.',
      },
      {
        role: 'user',
        content: `
User Profile:
${JSON.stringify(userContext, null, 2)}

Shortlisted Candidate Experiences:
${JSON.stringify(candidateList, null, 2)}

Choose the TOP ${Math.min(MAX_RESULTS, candidateList.length)} most relevant experiences from this shortlist only.

Rules:
- Prefer the strongest category, tag, city, and price-fit matches
- Keep some variety when scores are close
- Only use IDs from the shortlist
- Return ONLY a JSON array, with no markdown and no extra text

Format:
[
  {
    "id": "experience_id_here",
    "reason": "One short sentence why this suits this user"
  }
]
        `,
      },
    ],
  });

  const text = response.choices?.[0]?.message?.content?.trim() || '';
  const clean = text.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (err) {
    console.warn('Recommendation JSON parse failed:', err.message);
    return null;
  }

  if (!Array.isArray(parsed)) {
    if (typeof parsed === 'object' && parsed !== null) parsed = [parsed];
    else return null;
  }

  return parsed;
};

const getRecommendations = async (user) => {
  const pastBookings = await Booking
    .find({ userId: user._id, status: { $in: ['confirmed', 'completed'] } })
    .populate('experienceId', 'title category tags location price')
    .sort({ createdAt: -1 })
    .limit(MAX_BOOKING_HISTORY);

  const wishlistOwner = await User
    .findById(user._id)
    .populate({
      path: 'wishlist',
      match: { isActive: true },
      select: '_id title category tags location price',
    })
    .select('wishlist');

  const wishlist = Array.isArray(wishlistOwner?.wishlist) ? wishlistOwner.wishlist.filter(Boolean) : [];

  if (pastBookings.length === 0 && wishlist.length === 0) return [];

  const bookedIds = pastBookings.map((booking) => booking.experienceId?._id).filter(Boolean);
  const wishlistedIds = wishlist.map((experience) => experience?._id).filter(Boolean);
  const available = await Experience
    .find({ isActive: true, _id: { $nin: [...bookedIds, ...wishlistedIds] } })
    .select('_id title category tags location price duration rating photos hostId')
    .populate('hostId', 'name profilePic languages')
    .limit(MAX_AVAILABLE_POOL);

  if (available.length === 0) return [];

  const profile = buildUserProfile(user, pastBookings, wishlist);
  const candidates = shortlistCandidates(available, profile);

  if (candidates.length === 0) return [];

  const allowedIds = new Set(candidates.map(({ experience }) => String(experience._id)));
  const candidateMap = new Map(candidates.map(({ experience, score }) => [String(experience._id), { experience, score }]));

  const aiResults = await rerankWithAi(user, pastBookings, wishlist, candidates);

  let selected = [];
  if (Array.isArray(aiResults) && aiResults.length > 0) {
    const seen = new Set();
    selected = aiResults
      .filter((item) => item && allowedIds.has(String(item.id)))
      .filter((item) => {
        const key = String(item.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((item) => ({
        ...candidateMap.get(String(item.id)).experience.toObject(),
        reason: normalizeText(item.reason) ? item.reason.trim() : buildReason(candidateMap.get(String(item.id)).experience, profile),
      }));
  }

  if (selected.length === 0) {
    selected = candidates.slice(0, MAX_RESULTS).map(({ experience }) => ({
      ...experience.toObject(),
      reason: buildReason(experience, profile),
    }));
  }

  if (selected.length < MAX_RESULTS) {
    const seen = new Set(selected.map((item) => String(item._id)));
    for (const { experience } of candidates) {
      const key = String(experience._id);
      if (seen.has(key)) continue;
      selected.push({
        ...experience.toObject(),
        reason: buildReason(experience, profile),
      });
      seen.add(key);
      if (selected.length >= MAX_RESULTS) break;
    }
  }

  return selected.slice(0, MAX_RESULTS);
};

module.exports = { getRecommendations };
