const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail } = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const parseField = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
};

const normalizeHostStoryProfile = (rawValue) => {
  const parsed = parseField(rawValue, {});
  const blocks = Array.isArray(parsed?.storyBlocks) ? parsed.storyBlocks : [];

  return {
    headline: String(parsed?.headline || '').trim(),
    city: String(parsed?.city || '').trim(),
    craft: String(parsed?.craft || '').trim(),
    coverPhoto: String(parsed?.coverPhoto || '').trim(),
    featuredTips: (Array.isArray(parsed?.featuredTips) ? parsed.featuredTips : [])
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 8),
    storyBlocks: blocks
      .map((block) => ({
        type: ['text', 'photo', 'tip'].includes(block?.type) ? block.type : 'text',
        title: String(block?.title || '').trim(),
        content: String(block?.content || '').trim(),
        photo: String(block?.photo || '').trim(),
        caption: String(block?.caption || '').trim(),
      }))
      .filter((block) => block.content || block.photo)
      .slice(0, 30),
  };
};

// ─── @POST /api/auth/signup ───────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, 400, 'Email already in use');

    const user = await User.create({ name, email, password, role });

    sendWelcomeEmail({ email: user.email, name: user.name, role: user.role }).catch((e) =>
      console.error('Welcome email failed:', e.message)
    );

    const token = generateToken(user);
    return successResponse(res, 201, 'User registered', { user, token });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/auth/login ────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return errorResponse(res, 401, 'Invalid credentials');

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return errorResponse(res, 401, 'Invalid credentials');

    const token = generateToken(user);
    return successResponse(res, 200, 'Login successful', { user, token });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/auth/me ───────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'User fetched', req.user);
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/auth/profile ──────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    const { name, bio, phone, languages, hostDetails, travelerPreferences, rewards, hostStoryProfile } = req.body;

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone;
    if (languages) {
      updates.languages = Array.isArray(languages) ? languages : languages.split(',').map((l) => l.trim());
    }
    if (hostDetails) {
      updates.hostDetails = typeof hostDetails === 'string' ? JSON.parse(hostDetails) : hostDetails;
    }
    if (travelerPreferences) {
      updates.travelerPreferences = typeof travelerPreferences === 'string'
        ? JSON.parse(travelerPreferences)
        : travelerPreferences;
    }
    if (rewards) {
      updates.rewards = typeof rewards === 'string' ? JSON.parse(rewards) : rewards;
    }
    if (hostStoryProfile !== undefined) {
      updates.hostStoryProfile = normalizeHostStoryProfile(hostStoryProfile);
    }

    if (req.file && req.file.path) {
      updates.profilePic = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return successResponse(res, 200, 'Profile updated', updatedUser);
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/auth/change-password ──────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) return errorResponse(res, 404, 'User not found');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return errorResponse(res, 401, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/auth/google/callback ──────────────────────────────────────
const googleCallback = async (req, res, next) => {
  try {
    if (!req.user) return errorResponse(res, 400, 'Google authentication failed');

    const token = generateToken(req.user);

    // Frontend Google callback route is /auth/google/success
    const redirectUrl = process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL}/auth/google/success?token=${token}`
      : null;
    if (redirectUrl) {
      return res.redirect(redirectUrl);
    }

    return successResponse(res, 200, 'Login successful', { user: req.user, token });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/auth/become-host ────────────────────────────────────────
const becomeHost = async (req, res, next) => {
  try {
    if (req.user.role === 'host') {
      return errorResponse(res, 400, 'Your account is already a host');
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { role: 'host' },
      { new: true, runValidators: true }
    );
    const token = generateToken(updatedUser);
    return successResponse(res, 200, 'Account upgraded to host', { user: updatedUser, token });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, updateProfile, changePassword, googleCallback, becomeHost };
