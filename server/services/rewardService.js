const User = require('../models/User');
const UserEvent = require('../models/UserEvent');
const badgeDefinitions = require('../config/badges');

const LEVELS = [
  { threshold: 0, label: 'Explorer' },
  { threshold: 150, label: 'Local Explorer' },
  { threshold: 500, label: 'Insider' },
  { threshold: 1000, label: 'City Legend' },
];

const resolveLevel = (points) => LEVELS
  .slice()
  .reverse()
  .find((item) => points >= item.threshold)?.label || 'Explorer';

const countMatchingEvents = async ({ userId, event, category }) => {
  const filter = { userId };
  if (event) filter.type = event;
  if (category) filter.category = category;
  return UserEvent.countDocuments(filter);
};

const resolveBadges = async (userId, existingBadges = []) => {
  const awarded = new Set(existingBadges);

  for (const badge of badgeDefinitions) {
    const count = await countMatchingEvents({
      userId,
      event: badge.condition?.event,
      category: badge.condition?.category,
    });
    if (count >= Number(badge.condition?.count || 0)) {
      awarded.add(badge.label);
    }
  }

  return Array.from(awarded);
};

const awardUserEvent = async ({ userId, type, points = 0, experienceId = null, bookingId = null, category = '', meta = {} }) => {
  const event = await UserEvent.create({
    userId,
    type,
    points,
    experienceId,
    bookingId,
    category,
    meta,
  });

  const user = await User.findById(userId);
  if (!user) return { event, user: null, leveledUp: false };

  user.rewards = user.rewards || { points: 0, level: 'Explorer', badges: [] };
  const previousLevel = user.rewards.level || 'Explorer';
  user.rewards.points = Number(user.rewards.points || 0) + Number(points || 0);
  user.rewards.level = resolveLevel(user.rewards.points);
  user.rewards.badges = await resolveBadges(user._id, user.rewards.badges || []);
  await user.save();

  return {
    event,
    user,
    leveledUp: previousLevel !== user.rewards.level,
  };
};

module.exports = {
  awardUserEvent,
  resolveLevel,
};
