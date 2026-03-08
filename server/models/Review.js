const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    experienceId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Experience',
      required: true,
    },
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    bookingId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Booking',
      required: true,
    },
    rating: {
      type:     Number,
      required: [true, 'Rating is required'],
      min:      [1, 'Rating must be at least 1'],
      max:      [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type:      String,
      required:  [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    hostReply: {
      text:      { type: String, default: null },
      repliedAt: { type: Date,   default: null },
    },
  },
  {
    timestamps: true,
  }
);

// One review per booking
reviewSchema.index({ bookingId: 1 }, { unique: true });
reviewSchema.index({ experienceId: 1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model('Review', reviewSchema);