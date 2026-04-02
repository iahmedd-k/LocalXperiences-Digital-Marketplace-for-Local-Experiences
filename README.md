
---

## ✨ Features

### For Travelers
- 🔍 **Search & Discover** experiences by keyword, city, category, price range
- 🗺️ **Interactive Map** — toggle Leaflet/OpenStreetMap view on search results
- 📅 **Book Experiences** — pick date/time slots, choose guest count, pay via Stripe
- ⭐ **Reviews & Ratings** — leave reviews after completed bookings
- 💬 **Q&A** — ask hosts questions directly on listing pages
- 🗂️ **Itineraries** — build, save, and share multi-experience trip plans
- 🤖 **AI Recommendations** — personalized experience suggestions powered by Groq (Llama 3.3)

### For Hosts
- 🏠 **Host Dashboard** — earnings overview, booking stats, recent activity
- ➕ **Create Listings** — 5-step wizard with photos, availability slots, pricing
- ✏️ **Edit Listings** — update details, manage availability, toggle active/inactive
- 📋 **Manage Bookings** — view all bookings filtered by status
- 💬 **Reply to Reviews** — respond publicly to guest reviews

### Platform
- 🔐 **Auth** — JWT + Google OAuth
- 📧 **Email Notifications** — booking confirmations via SendGrid
- 🖼️ **Image Uploads** — Cloudinary integration
- ⚡ **Redis Caching** — Upstash Redis for experience lists & recommendations
- 📍 **Geocoding** — Mapbox for address → coordinates

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| State | Redux Toolkit, React Query |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Cache | Upstash Redis |
| Auth | JWT, Passport.js, Google OAuth 2.0 |
| Payments | Stripe |
| AI | Groq API (llama-3.3-70b-versatile) |
| Maps | Leaflet + OpenStreetMap, Mapbox (geocoding) |
| Email | SendGrid |
| Storage | Cloudinary |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
LocalXperiences/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Navbar, Footer, Button, Modal, etc.
│   │   │   ├── experience/        # ExperienceCard, Filters, Gallery, etc.
│   │   │   ├── map/               # Leaflet map components
│   │   │   ├── booking/           # BookingCard, PaymentForm, etc.
│   │   │   ├── reviews/           # ReviewCard, ReviewForm, etc.
│   │   │   ├── qna/               # Q&A components
│   │   │   └── itinerary/         # Itinerary components
│   │   ├── pages/
│   │   │   ├── auth/              # Login, Signup, GoogleCallback
│   │   │   ├── discovery/         # HomePage, SearchPage, ExperienceDetailPage
│   │   │   ├── booking/           # CheckoutPage, BookingConfirmPage
│   │   │   ├── traveler/          # MyBookingsPage, ProfilePage
│   │   │   ├── itinerary/         # MyItinerariesPage, Detail, Shared
│   │   │   └── host/              # Dashboard, Create, Edit, Bookings, Reviews
│   │   ├── store/                 # Redux slices (auth, search, location, itinerary)
│   │   ├── services/              # Axios API calls
│   │   ├── hooks/                 # useGeolocation, useAuth, useDebounce, etc.
│   │   └── utils/                 # formatters, helpers, validators
│   └── package.json
│
└── server/                        # Node.js + Express backend
    ├── src/
    │   ├── controllers/           # Route logic
    │   ├── models/                # Mongoose schemas
    │   ├── routes/                # Express routers
    │   ├── middleware/            # Auth, error handler, rate limiter
    │   ├── services/              # Email, payment, recommendations, upload
    │   ├── config/                # DB, Redis, Stripe, Cloudinary, Passport
    │   └── utils/                 # apiResponse, generateToken, validators
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Accounts for: Stripe, SendGrid, Cloudinary, Groq, Mapbox, Google Cloud, Upstash

### 1. Clone the repo

```bash
git clone https://github.com/iahmedd-k/LocalXperiences-Digital-Marketplace-for-Local-Experiences.git
cd LocalXperiences-Digital-Marketplace-for-Local-Experiences
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

---

## 🔑 Environment Variables

### Backend — `server/.env`

```env
# ── Server ──────────────────────────────────────────
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# ── MongoDB Atlas ────────────────────────────────────
# Get from: https://cloud.mongodb.com → Clusters → Connect → Drivers
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/localxperiences?retryWrites=true&w=majority

# ── JWT ──────────────────────────────────────────────
# Any long random string (use: openssl rand -base64 64)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=30d

# ── Google OAuth ─────────────────────────────────────
# Get from: https://console.cloud.google.com → APIs & Services → Credentials
# Create OAuth 2.0 Client ID → Authorized redirect URI: http://localhost:5000/api/auth/google/callback
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret

# ── Upstash Redis ─────────────────────────────────────
# Get from: https://console.upstash.com → Create Database → REST API
UPSTASH_REDIS_URL=https://your-db.upstash.io
UPSTASH_REDIS_TOKEN=your_upstash_token

# ── Cloudinary ───────────────────────────────────────
# Get from: https://cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Stripe ───────────────────────────────────────────
# Get from: https://dashboard.stripe.com → Developers → API Keys
# Use sk_test_... keys for development
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ── SendGrid ─────────────────────────────────────────
# Get from: https://app.sendgrid.com → Settings → API Keys
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# ── Groq AI ──────────────────────────────────────────
# Get from: https://console.groq.com → API Keys
GROQ_API_KEY=gsk_your_groq_api_key

# ── Mapbox (geocoding only) ───────────────────────────
# Get from: https://account.mapbox.com → Tokens
MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6InRva2VuIn0.xxxxx
```

### Frontend — `client/.env`

```env
# ── API ──────────────────────────────────────────────
VITE_API_URL=http://localhost:5000/api

# ── Stripe ───────────────────────────────────────────
# Get from: https://dashboard.stripe.com → Developers → API Keys
# Use pk_test_... keys for development
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# ── Mapbox ───────────────────────────────────────────
# Same token as backend
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6InRva2VuIn0.xxxxx
```

---

## 🔑 Where to Get Each API Key

| Service | URL | Notes |
|---------|-----|-------|
| **MongoDB Atlas** | [cloud.mongodb.com](https://cloud.mongodb.com) | Free M0 tier available. Whitelist `0.0.0.0/0` for dev |
| **Google OAuth** | [console.cloud.google.com](https://console.cloud.google.com) | Enable Google+ API. Add `http://localhost:5000/api/auth/google/callback` as redirect URI |
| **Upstash Redis** | [console.upstash.com](https://console.upstash.com) | Free tier: 10,000 requests/day |
| **Cloudinary** | [cloudinary.com](https://cloudinary.com) | Free tier: 25GB storage |
| **Stripe** | [dashboard.stripe.com](https://dashboard.stripe.com) | Use test keys (`sk_test_`, `pk_test_`) for dev. Test card: `4242 4242 4242 4242` |
| **SendGrid** | [app.sendgrid.com](https://app.sendgrid.com) | Free tier: 100 emails/day. Verify sender email |
| **Groq** | [console.groq.com](https://console.groq.com) | Free tier available. Model: `llama-3.3-70b-versatile` |
| **Mapbox** | [account.mapbox.com](https://account.mapbox.com) | Free tier: 50,000 geocoding requests/month |

---

## 🧪 Test Accounts

After creating accounts manually or seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Host | `ahmed@test.com` | `password123` |
| Host | `sara@test.com` | `password123` |
| Traveler | `fatima@test.com` | `password123` |
| Traveler | `omar@test.com` | `password123` |

**Stripe test card:** `4242 4242 4242 4242` — any future expiry, any CVC

---

## 📡 API Endpoints

| Module | Method | Endpoint |
|--------|--------|----------|
| **Auth** | POST | `/api/auth/signup` |
| | POST | `/api/auth/login` |
| | GET | `/api/auth/google` |
| | GET | `/api/auth/me` |
| | PUT | `/api/auth/profile` |
| **Experiences** | GET | `/api/experiences` |
| | GET | `/api/experiences/featured` |
| | GET | `/api/experiences/:id` |
| | POST | `/api/experiences` *(host only)* |
| | PUT | `/api/experiences/:id` *(host only)* |
| | DELETE | `/api/experiences/:id` *(host only)* |
| **Bookings** | POST | `/api/bookings/create-payment-intent` |
| | POST | `/api/bookings` |
| | GET | `/api/bookings` |
| | GET | `/api/bookings/host` |
| | PUT | `/api/bookings/:id/cancel` |
| **Reviews** | GET | `/api/reviews/:experienceId` |
| | POST | `/api/reviews` |
| | PUT | `/api/reviews/:id/reply` |
| **Q&A** | GET | `/api/qna/:experienceId` |
| | POST | `/api/qna` |
| | PUT | `/api/qna/:id/answer` |
| **Itineraries** | GET | `/api/itineraries` |
| | POST | `/api/itineraries` |
| | POST | `/api/itineraries/:id/share` |
| | GET | `/api/itineraries/shared/:token` |
| **AI** | GET | `/api/recommendations` |

---

## 🚢 Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Deploy /dist to Vercel
# Set environment variables in Vercel dashboard
```

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `server`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all environment variables from `server/.env`

### Update CORS after deployment
In `server/src/app.js`, update the `CLIENT_URL` env var to your Vercel URL.

---

## 📸 Screenshots

> Add screenshots of your deployed app here

---

## 📄 License

MIT © [Ahmed](https://github.com/iahmedd-k)
