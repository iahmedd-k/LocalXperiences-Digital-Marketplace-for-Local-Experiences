const mongoose = require('mongoose');
const Milestone = require('../models/Milestone');

const milestones = [
  // Traveler milestones
  { milestoneId: 'first_step',      title: 'First Step',      description: 'Complete your first booking',         targetCount: 1,  badgeReward: 'First Timer',    role: 'traveler' },
  { milestoneId: 'explorer_pack',   title: 'Explorer Pack',   description: 'Complete 3 experiences',              targetCount: 3,  badgeReward: 'Explorer',       role: 'traveler' },
  { milestoneId: 'adventurer',      title: 'Adventurer',      description: 'Complete 10 experiences',             targetCount: 10, badgeReward: 'Adventurer',     role: 'traveler' },
  { milestoneId: 'local_legend',    title: 'Local Legend',    description: 'Complete 25 experiences',             targetCount: 25, badgeReward: 'Local Legend',   role: 'traveler' },
  { milestoneId: 'city_ambassador', title: 'City Ambassador', description: 'Complete 50 experiences',             targetCount: 50, badgeReward: 'City Ambassador',role: 'traveler' },
  { milestoneId: 'week_warrior',    title: 'Week Warrior',    description: 'Book experiences 3 weeks in a row',   targetCount: 3,  badgeReward: 'Streak Master',  role: 'traveler' },

  // Host milestones
  { milestoneId: 'first_listing',   title: 'First Listing',   description: 'Publish your first experience',       targetCount: 1,  badgeReward: 'New Host',       role: 'host' },
  { milestoneId: 'rising_host',     title: 'Rising Host',     description: 'Get 10 bookings across experiences',  targetCount: 10, badgeReward: 'Rising Host',    role: 'host' },
  { milestoneId: 'top_rated',       title: 'Top Rated',       description: 'Receive 20 five-star reviews',        targetCount: 20, badgeReward: 'Top Rated Host', role: 'host' },
  { milestoneId: 'community_host',  title: 'Community Host',  description: 'Host 50 total guests',                targetCount: 50, badgeReward: 'Community Host', role: 'host' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/localxperiences');
  await Milestone.deleteMany({});
  await Milestone.insertMany(milestones);
  console.log('Milestones seeded!');
  process.exit();
}

seed();
