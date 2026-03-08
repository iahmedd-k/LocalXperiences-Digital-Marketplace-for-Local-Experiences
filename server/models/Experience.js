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