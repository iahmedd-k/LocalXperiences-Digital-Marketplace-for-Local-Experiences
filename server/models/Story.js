const mongoose = require('mongoose');

const storySectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    image: { type: String, default: '' },
    imageCaption: { type: String, default: '', trim: true, maxlength: 220 },
    imagePosition: {
      type: String,
      enum: ['full', 'left', 'right'],
      default: 'full',
    },
  },
  { _id: false }
);

const storyTranslationSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, trim: true, maxlength: 160 },
    body: { type: String, trim: true, maxlength: 5000 },
    imageCaption: { type: String, default: '', trim: true, maxlength: 220 },
  },
  { _id: false }
);

const storySchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 420,
    },
    coverImage: {
      type: String,
      required: true,
    },
    coverImageAlt: {
      type: String,
      default: '',
      trim: true,
      maxlength: 180,
    },
    category: {
      type: String,
      default: 'Local Story',
      trim: true,
      maxlength: 80,
    },
    locationLabel: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    readTimeMinutes: {
      type: Number,
      default: 6,
      min: 1,
      max: 60,
    },
    sections: {
      type: [storySectionSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one story section is required',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    translations: {
      type: [
        {
          languageCode: { type: String, trim: true, maxlength: 12 },
          languageLabel: { type: String, trim: true, maxlength: 40 },
          title: { type: String, trim: true, maxlength: 180 },
          excerpt: { type: String, trim: true, maxlength: 420 },
          coverImageAlt: { type: String, trim: true, maxlength: 180 },
          category: { type: String, trim: true, maxlength: 80 },
          locationLabel: { type: String, trim: true, maxlength: 120 },
          sections: {
            type: [storyTranslationSectionSchema],
            default: [],
          },
        },
      ],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

storySchema.index({ hostId: 1, createdAt: -1 });
storySchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('Story', storySchema);
