const rateLimit = require('express-rate-limit');

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isProd = process.env.NODE_ENV === 'production';

const GLOBAL_WINDOW_MS = toPositiveInt(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const AUTH_WINDOW_MS = toPositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const GLOBAL_MAX = toPositiveInt(process.env.GLOBAL_RATE_LIMIT_MAX, isProd ? 200 : 1200);
const AUTH_MAX = toPositiveInt(process.env.AUTH_RATE_LIMIT_MAX, isProd ? 10 : 100);

const globalRateLimiter = rateLimit({
  windowMs: GLOBAL_WINDOW_MS,
  max: GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

const authRateLimiter = rateLimit({
  windowMs: AUTH_WINDOW_MS,
  max: AUTH_MAX,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const retryAfterSeconds = Math.max(1, Math.ceil((req.rateLimit?.resetTime?.getTime?.() - Date.now()) / 1000) || 60);
    res.status(429).json({
      success: false,
      message: 'Too many login/signup attempts. Please try again later.',
      retryAfterSeconds,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalRateLimiter, authRateLimiter };
