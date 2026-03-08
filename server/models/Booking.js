const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    hostId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    slot: {
      date:      { type: Date,   required: true },
      startTime: { type: String, required: true },
    },
    guestCount: {
      type:     Number,
      required: true,
      min:      [1, 'At least 1 guest required'],
    },
    amount: {
      type:     Number, // in cents (Stripe standard)
      required: true,
    },
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    cancelledBy: {
      type:    String,
      enum:    ['traveler', 'host', null],
      default: null,
    },
    // Stripe payment details
    payment: {
      paymentIntentId: { type: String, default: null },
      status:          { type: String, default: null }, // succeeded, failed, refunded
    },
    // Has the traveler left a review for this booking?
    reviewLeft: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ userId: 1 });
bookingSchema.index({ hostId: 1 });
bookingSchema.index({ experienceId: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);