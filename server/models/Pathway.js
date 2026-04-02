const mongoose = require('mongoose');

const pathwaySchema = new mongoose.Schema(
  {
    pathwayId: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 3000,
    },
    city: { type: String, trim: true },
    difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'moderate' },
    bestFor: { type: String, trim: true },
    bestTime: { type: String, trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    isAICurated: { type: Boolean, default: false },
    coverPhoto: {
      type: String,
      default: '',
    },
    stops: [
      {
        experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience' },
        order: { type: Number, default: 0 },
        travelTimeToNext: { type: Number, default: 0 }, // mins
        travelMode: { type: String, enum: ['walk', 'drive', 'transit', 'bike', 'none'], default: 'walk' },
        isOptional: { type: Boolean, default: false },
        customNote: { type: String, default: '' },
      }
    ],
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    saves: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

pathwaySchema.index({ creatorId: 1 });
pathwaySchema.index({ isPublic: 1, createdAt: -1 });
pathwaySchema.index({ tags: 1 });

module.exports = mongoose.model('Pathway', pathwaySchema);
