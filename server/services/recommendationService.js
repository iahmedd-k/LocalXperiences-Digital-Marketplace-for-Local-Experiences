const Groq       = require('groq-sdk');
const Experience = require('../models/Experience');
const Booking    = require('../models/Booking');

const client = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const getRecommendations = async (user) => {
  // Skip recommendations completely if Groq is not configured
  if (!client) return [];

  // ── 1. Gather user context ──────────────────────────────────────────────
  const pastBookings = await Booking
    .find({ userId: user._id, status: { $in: ['confirmed', 'completed'] } })
    .populate('experienceId', 'title category tags location price')
    .sort({ createdAt: -1 })
    .limit(10);

  // ── 2. Get available experiences (exclude already booked) ───────────────
  const bookedIds = pastBookings.map((b) => b.experienceId?._id).filter(Boolean);
  const available = await Experience
    .find({ isActive: true, _id: { $nin: bookedIds } })
    .select('_id title category tags location price duration rating')
    .limit(50);

  if (available.length === 0) return [];

  // ── 3. Build prompt context ─────────────────────────────────────────────
  const userContext = {
    name:      user.name,
    languages: user.languages,
    pastBookings: pastBookings.map((b) => ({
      title:    b.experienceId?.title,
      category: b.experienceId?.category,
      tags:     b.experienceId?.tags,
      location: b.experienceId?.location?.city,
    })),
  };

  const experienceList = available.map((e) => ({
    id:       e._id,
    title:    e.title,
    category: e.category,
    tags:     e.tags,
    city:     e.location?.city,
    price:    e.price,
    duration: e.duration,
    rating:   e.rating?.average,
  }));

  // ── 4. Call Groq API ────────────────────────────────────────────────────
  const response = await client.chat.completions.create({
    model:      'llama-3.1-8b-instant',
    max_tokens: 1000,
    messages: [
      {
        role:    'system',
        content: 'You are a local experience recommendation engine. You always respond with valid JSON only. No markdown, no extra text.',
      },
      {
        role:    'user',
        content: `
User Profile:
${JSON.stringify(userContext, null, 2)}

Available Experiences:
${JSON.stringify(experienceList, null, 2)}

Based on the user's past bookings, preferences, and languages, recommend the TOP 6 most relevant experiences from the available list.

Rules:
- Prioritize experiences that match past categories and tags
- Consider variety — don't recommend 6 of the same category
- If no past bookings, recommend highly rated and diverse experiences
- Return ONLY a JSON array, no extra text, no markdown

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

  // ── 5. Parse response ───────────────────────────────────────────────────
  const text  = response.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, '').trim();

  let recommended;
  try {
    recommended = JSON.parse(clean);
  } catch (err) {
    console.warn('⚠️  Recommendation JSON parse failed:', err.message);
    // In case the model returns non-JSON, gracefully return empty recs
    return [];
  }

  // If recommended is an object, wrap it in an array
  if (!Array.isArray(recommended)) {
    if (typeof recommended === 'object' && recommended !== null) {
      recommended = [recommended];
    } else {
      console.warn('⚠️  Recommendation response was not an array. Got:', typeof recommended);
      return [];
    }
  }

  // ── 6. Enrich with full experience data ────────────────────────────────
  const enriched = await Promise.all(
    recommended.map(async ({ id, reason }) => {
      const exp = await Experience
        .findById(id)
        .populate('hostId', 'name profilePic');
      if (!exp) return null;
      return { ...exp.toObject(), reason };
    })
  );

  return enriched.filter(Boolean);
};

module.exports = { getRecommendations };