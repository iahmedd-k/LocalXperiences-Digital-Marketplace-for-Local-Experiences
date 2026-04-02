const User    = require('../models/User');
const Booking = require('../models/Booking');

const BADGE_MILESTONES = {
  5:  'Local Explorer',
  10: 'Adventure Seeker',
  25: 'City Insider',
  50: 'Legend'
};

const LEVEL_THRESHOLDS = [
  { threshold: 1000, label: 'City Legend' },
  { threshold: 500,  label: 'Insider' },
  { threshold: 150,  label: 'Local Explorer' },
  { threshold: 0,    label: 'Explorer' }
];

async function handleCheckIn({ userId, pointsToAdd = 50 }) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!user.rewards) {
    user.rewards = { points: 0, level: 'Explorer', badges: [] };
  }

  // Award points
  user.rewards.points = (user.rewards.points || 0) + pointsToAdd;

  // Award badges based on total bookings (approx via points or explicit checkin tracking)
  // For simplicity, we'll use a virtual checkInCount or track it in rewards
  user.rewards.checkInCount = (user.rewards.checkInCount || 0) + 1;

  let newlyEarnedBadge = null;
  const milestoneBadge = BADGE_MILESTONES[user.rewards.checkInCount];
  if (milestoneBadge && !user.rewards.badges.includes(milestoneBadge)) {
    user.rewards.badges.push(milestoneBadge);
    newlyEarnedBadge = milestoneBadge;
  }

  // Update level based on points
  const newLevel = LEVEL_THRESHOLDS.find(l => user.rewards.points >= l.threshold);
  if (newLevel) {
    user.rewards.level = newLevel.label;
  }

  await user.save();
  return {
    points: user.rewards.points,
    level: user.rewards.level,
    newBadge: newlyEarnedBadge,
    badges: user.rewards.badges,
    checkInCount: user.rewards.checkInCount
  };
}

async function getUserRewards(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  if (!user.rewards) {
    return { points: 0, level: 'Explorer', badges: [], checkInCount: 0 };
  }

  return {
    points: user.rewards.points || 0,
    level: user.rewards.level || 'Explorer',
    badges: user.rewards.badges || [],
    checkInCount: user.rewards.checkInCount || 0
  };
}

module.exports = {
  handleCheckIn,
  getUserRewards,
  BADGE_MILESTONES
};
