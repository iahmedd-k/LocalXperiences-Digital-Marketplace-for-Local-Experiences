const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  milestoneId:   { type: String, required: true, unique: true },
  title:         { type: String, required: true },
  description:   { type: String, required: true },
  targetCount:   { type: Number, required: true },
  badgeReward:   { type: String, required: true },
  role:          { type: String, enum: ['traveler', 'host', 'both'], required: true },
});

module.exports = mongoose.model('Milestone', milestoneSchema);
