const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    hostId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Host is required'],
    },
    title: {
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type:      String,
      required:  [true, 'Description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     ['food', 'culture', 'adventure', 'art', 'music', 'sports', 'wellness', 'tour', 'workshop', 'other'],
    },
    location: {
      city:    { type: String, required: true },
      address: { type: String, default: '' },
      // GeoJSON format required for MongoDB $near queries
      coordinates: {
        type:        { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
      },
    },
    tags: {
      type:    [String],
      default: [],
    },
    includes: {
      type: [String],
      default: [],
    },
    notIncluded: {
      type: [String],
      default: [],
    },
    detailsSections: {
      whatToExpect: { type: String, trim: true, default: '', maxlength: 2000 },
      meetingAndPickup: { type: String, trim: true, default: '', maxlength: 2000 },
      accessibility: { type: String, trim: true, default: '', maxlength: 2000 },
      additionalInformation: { type: String, trim: true, default: '', maxlength: 2000 },
      cancellationPolicy: { type: String, trim: true, default: '', maxlength: 2000 },
      help: { type: String, trim: true, default: '', maxlength: 2000 },
    },
    itinerary: {
      type: [
        {
          stepNumber: { type: Number, min: 1 },
          title: { type: String, required: true, trim: true, maxlength: 120 },
          startTime: { type: String, trim: true, maxlength: 20 },
          durationMinutes: { type: Number, min: 0, max: 1440 },
          locationName: { type: String, trim: true, maxlength: 180 },
          description: { type: String, trim: true, maxlength: 500 },
          transitionNote: { type: String, trim: true, maxlength: 240 },
        },
      ],
      default: [],
    },
    storytellingProfile: {
      hostStory: { type: String, trim: true, default: '', maxlength: 2000 },
      localConnection: { type: String, trim: true, default: '', maxlength: 500 },
      insiderTips: { type: [String], default: [] },
      photoMoments: { type: [String], default: [] },
    },
    experiencePathways: {
      type: [
        {
          title: { type: String, trim: true, maxlength: 120 },
          summary: { type: String, trim: true, maxlength: 400 },
          durationLabel: { type: String, trim: true, maxlength: 80 },
          highlight: { type: String, trim: true, maxlength: 120 },
          phase: {
            type: String,
            enum: ['before', 'anchor', 'after', 'full-day'],
            default: 'anchor',
          },
          idealTime: {
            type: String,
            enum: ['morning', 'afternoon', 'evening', 'anytime'],
            default: 'anytime',
          },
          pace: {
            type: String,
            enum: ['easy', 'balanced', 'immersive'],
            default: 'balanced',
          },
          bestFor: { type: String, trim: true, maxlength: 120 },
          neighborhood: { type: String, trim: true, maxlength: 120 },
          stopCount: { type: Number, min: 1, max: 12, default: 3 },
        },
      ],
      default: [],
    },
    languagesSupported: {
      type: [String],
      default: [],
    },
    translations: {
      type: [
        {
          languageCode: { type: String, trim: true, maxlength: 12 },
          languageLabel: { type: String, trim: true, maxlength: 40 },
          title: { type: String, trim: true, maxlength: 150 },
          description: { type: String, trim: true, maxlength: 3000 },
          whatToExpect: { type: String, trim: true, maxlength: 2000 },
          meetingAndPickup: { type: String, trim: true, maxlength: 2000 },
        },
      ],
      default: [],
    },
    price: {
      type:     Number,
      required: [true, 'Price is required'],
      min:      [0, 'Price cannot be negative'],
    },
    duration: {
      type:     Number, // in minutes
      required: [true, 'Duration is required'],
      min:      [15, 'Duration must be at least 15 minutes'],
    },
    groupSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 10 },
    },
    bookingSettings: {
      minAdvanceHours: { type: Number, default: 6, min: 0, max: 720 },
      maxAdvanceDays: { type: Number, default: 180, min: 1, max: 730 },
      allowSplitPayments: { type: Boolean, default: false },
      splitPaymentDepositPercent: { type: Number, default: 30, min: 10, max: 90 },
      allowGroupPricing: { type: Boolean, default: false },
      groupDiscounts: {
        type: [
          {
            minGuests: { type: Number, min: 2, max: 100 },
            percentOff: { type: Number, min: 1, max: 90 },
            label: { type: String, trim: true, maxlength: 80 },
          },
        ],
        default: [],
      },
      allowCollaborativeBookings: { type: Boolean, default: false },
    },
    microExperience: {
      isEnabled: { type: Boolean, default: false },
      label: { type: String, trim: true, default: '', maxlength: 60 },
      teaser: { type: String, trim: true, default: '', maxlength: 220 },
    },
    rewards: {
      pointsPerCheckIn: { type: Number, default: 50, min: 0, max: 1000 },
      badgeLabel: { type: String, trim: true, default: '', maxlength: 60 },
      bonusTip: { type: String, trim: true, default: '', maxlength: 220 },
    },
    photos: {
      type:    [String], // Cloudinary URLs
      default: [],
    },
    availability: [
      {
        date:      { type: Date,   required: true },
        startTime: { type: String, required: true }, // e.g. "10:00"
        slots:     { type: Number, required: true },  // total slots
        booked:    { type: Number, default: 0 },      // booked slots
      },
    ],
    // Aggregated rating — updated on each review
    rating: {
      average: { type: Number, default: 0 },
      count:   { type: Number, default: 0 },
    },
    availabilitySettings: {
      syncMode: {
        type: String,
        enum: ['manual', 'calendar', 'api'],
        default: 'manual',
      },
      timezone: { type: String, default: 'Asia/Karachi' },
      instantConfirmation: { type: Boolean, default: true },
      lastSyncedAt: { type: Date, default: Date.now },
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    isFeatured: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────
experienceSchema.index({ 'location.coordinates': '2dsphere' }); // For nearby search
experienceSchema.index({ 'location.city': 1 });
experienceSchema.index({ category: 1 });
experienceSchema.index({ tags: 1 });
experienceSchema.index({ price: 1 });
experienceSchema.index({ 'rating.average': -1 });
experienceSchema.index({ hostId: 1 });
experienceSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Full-text search

module.exports = mongoose.model('Experience', experienceSchema);
