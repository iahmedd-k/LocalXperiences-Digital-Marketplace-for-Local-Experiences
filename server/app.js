const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const passport = require('./config/passport');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { globalRateLimiter }      = require('./middleware/rateLimiter');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  optionsSuccessStatus: 204,
}));
app.options('*', cors());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport
app.use(passport.initialize());

// Rate Limiting
app.use('/api', globalRateLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/experiences',     require('./routes/experiences'));
app.use('/api/bookings',        require('./routes/bookings'));
app.use('/api/reviews',         require('./routes/reviews'));
app.use('/api/comments',        require('./routes/comments'));
app.use('/api/qna',             require('./routes/qna'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/wishlist',        require('./routes/wishlist'));
app.use('/api/currency',        require('./routes/currency'));
app.use('/api/checkins',        require('./routes/checkins'));
app.use('/api/stories',         require('./routes/stories'));
app.use('/api/hosts',           require('./routes/hosts'));
app.use('/api/pathways',        require('./routes/pathways'));
app.use('/api/rewards',         require('./routes/rewards'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
