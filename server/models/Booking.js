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
      slotId:     { type: mongoose.Schema.Types.ObjectId, default: null },
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
    pricing: {
      subtotal: { type: Number, default: 0 },
      totalAfterDiscount: { type: Number, default: 0 },
      discountPercent: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      amountDueNow: { type: Number, default: 0 },
      remainingAmount: { type: Number, default: 0 },
      splitPayment: { type: Boolean, default: false },
      depositPercent: { type: Number, default: 0 },
      pricingLabel: { type: String, default: '' },
    },
    collaboration: {
      groupCode: { type: String, default: null },
      groupName: { type: String, default: '' },
      inviteNote: { type: String, default: '' },
      leaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      invitedEmails: { type: [String], default: [] },
      joinMode: {
        type: String,
        enum: ['solo', 'create', 'join'],
        default: 'solo',
      },
    },
    splitPayments: {
      type: [
        {
          email: { type: String, default: '', trim: true, lowercase: true },
          amount: { type: Number, default: 0 },
          isLeader: { type: Boolean, default: false },
          paymentIntentId: { type: String, default: null },
          status: {
            type: String,
            enum: ['pending', 'paid', 'refunded', 'cancelled'],
            default: 'pending',
          },
          inviteToken: { type: String, default: '' },
          paidAt: { type: Date, default: null },
        },
      ],
      default: [],
    },
    paymentDeadlineAt: {
      type: Date,
      default: null,
    },
    contact: {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      smsOptIn: { type: Boolean, default: false },
    },
    status: {
      type:    String,
      enum:    ['pending', 'pending_payment', 'partially_paid', 'confirmed', 'upcoming', 'cancelled', 'completed'],
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
    checkIn: {
      status: {
        type: String,
        enum: ['not_checked_in', 'checked_in'],
        default: 'not_checked_in',
      },
      method: {
        type: String,
        enum: ['none', 'geo', 'qr'],
        default: 'none',
      },
      qrCode: { type: String, default: '' },
      checkedInAt: { type: Date, default: null },
      rewardPointsGranted: { type: Number, default: 0 },
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
