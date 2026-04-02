const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  experienceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true },
  bookingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  pointsEarned:  { type: Number, required: true },
  badgeUnlocked: { type: String, default: null },
  milestoneUnlocked: { type: String, default: null },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('CheckIn', checkInSchema);
