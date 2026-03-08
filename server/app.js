const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const passport = require('./config/passport');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { globalRateLimiter }      = require('./middleware/rateLimiter');
require('dotenv').config();

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet());

// Allow frontend dev on common Vite ports + configured CLIENT_URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'https://local-xperiences.vercel.app',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server / curl (no origin) and known dev origins
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(null, false);
  },
  credentials: true,
}));

// ─── Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Passport ─────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ─── Rate Limiting ─────────────────────────────────────────────────────────
app.use('/api', globalRateLimiter);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/experiences',     require('./routes/experiences'));
app.use('/api/bookings',        require('./routes/bookings'));
app.use('/api/reviews',         require('./routes/reviews'));
app.use('/api/comments',        require('./routes/comments'));
app.use('/api/qna',             require('./routes/qna'));
app.use('/api/itineraries',     require('./routes/itineraries'));
app.use('/api/recommendations', require('./routes/recommendations'));

// ─── Error Handling ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;