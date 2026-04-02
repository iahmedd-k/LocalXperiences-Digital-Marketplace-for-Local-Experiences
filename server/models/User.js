const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['traveler', 'host'],
      default: 'traveler',
    },
    profilePic: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    phone: {
      type: String,
      default: '',
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
    },
    languages: {
      type: [String],
      default: [],
    },
    hostDetails: {
      type: Object,
      default: {},
    },
    hostStoryProfile: {
      headline: { type: String, default: '', trim: true, maxlength: 160 },
      city: { type: String, default: '', trim: true, maxlength: 120 },
      craft: { type: String, default: '', trim: true, maxlength: 120 },
      coverPhoto: { type: String, default: '' },
      featuredTips: { type: [String], default: [] },
      storyBlocks: {
        type: [
          {
            type: {
              type: String,
              enum: ['text', 'photo', 'tip'],
              default: 'text',
            },
            title: { type: String, default: '', trim: true, maxlength: 120 },
            content: { type: String, default: '', trim: true, maxlength: 4000 },
            photo: { type: String, default: '' },
            caption: { type: String, default: '', trim: true, maxlength: 220 },
          },
        ],
        default: [],
      },
    },
    travelerPreferences: {
      categories: { type: [String], default: [] },
      interests: { type: [String], default: [] },
      cities: { type: [String], default: [] },
      preferredLanguage: { type: String, default: 'en' },
      // removed preferredDuration and budget
    },
    savedPathways: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pathway',
      },
    ],
    rewards: {
      points: { type: Number, default: 0 },
      level:  { type: String, default: 'Explorer' },
      badges: { type: [String], default: [] },
      checkInCount: { type: Number, default: 0 },
    },
    checkIns: [
      {
        experienceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Experience',
        },
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Booking',
        },
        checkedInAt: { type: Date, default: Date.now },
        city: { type: String, default: '' },
        points: { type: Number, default: 0 },
      },
    ],
    googleId: {
      type: String,
      default: null,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Experience',
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
