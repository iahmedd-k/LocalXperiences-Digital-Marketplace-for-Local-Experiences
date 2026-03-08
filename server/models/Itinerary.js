const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    title: {
      type:      String,
      required:  [true, 'Itinerary title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    experienceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Experience',
      },
    ],
    notes: {
      type:    String,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    shareToken: {
      type:    String,
      default: null, // Generated when user shares
    },
    isPublic: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

itinerarySchema.index({ userId: 1 });
itinerarySchema.index({ shareToken: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);