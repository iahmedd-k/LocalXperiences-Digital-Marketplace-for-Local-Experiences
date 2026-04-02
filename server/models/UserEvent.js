const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['booking_completed', 'review_left', 'itinerary_shared', 'check_in'],
    },
    points: {
      type: Number,
      default: 0,
    },
    experienceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Experience',
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    category: {
      type: String,
      default: '',
    },
    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

userEventSchema.index({ userId: 1, createdAt: -1 });
userEventSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('UserEvent', userEventSchema);
