const { translateText } = require('../services/translationService');
const Experience               = require('../models/Experience');
const { successResponse,
        errorResponse,
        paginatedResponse }    = require('../utils/apiResponse');
const { setCache,
        getCache,
        deleteCacheByPattern } = require('../config/redis');

// ─── Mapbox Geocoding Helper ───────────────────────────────────────────────
const geocodeAddress = async (address) => {
  const cacheKey = `geocode:${address}`;
  const cached = await getCache(cacheKey);
  if (cached && typeof cached.lng === 'number' && typeof cached.lat === 'number') {
    return cached;
  }
  try {
    const query    = encodeURIComponent(address);
    const token    = process.env.MAPBOX_TOKEN;
    const url      = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`;
    // Add timeout logic
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout
    let response, data;
    try {
      response = await fetch(url, { signal: controller.signal });
      data = await response.json();
    } catch (fetchErr) {
      console.error('Geocoding fetch error:', fetchErr.message);
      clearTimeout(timeout);
      return { lng: 0, lat: 0 };
    }
    clearTimeout(timeout);
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      await setCache(cacheKey, { lng, lat }, 86400); // cache for 1 day
      return { lng, lat };
    }
    return { lng: 0, lat: 0 };
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return { lng: 0, lat: 0 };
  }
};

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (fromLat, fromLng, toLat, toLng) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const attachDistanceKm = (experiences, userLat, userLng) => experiences.map((experience) => {
  const rawCoords = experience?.location?.coordinates?.coordinates;
  if (!Array.isArray(rawCoords) || rawCoords.length !== 2) return experience;

  const [expLng, expLat] = rawCoords;
  if (!Number.isFinite(expLat) || !Number.isFinite(expLng)) return experience;

  return {
    ...experience,
    distanceKm: Number(getDistanceKm(userLat, userLng, expLat, expLng).toFixed(1)),
  };
});

const normalizeItinerary = (rawValue) => {
  const parsed = Array.isArray(rawValue)
    ? rawValue
    : (typeof rawValue === 'string' ? (() => {
        try {
          return JSON.parse(rawValue);
        } catch {
          return [];
        }
      })() : []);

  return parsed
    .map((item, index) => ({
      stepNumber: Number(item?.stepNumber) > 0 ? Number(item.stepNumber) : index + 1,
      title: String(item?.title || '').trim(),
      startTime: String(item?.startTime || '').trim(),
      durationMinutes: Number.isFinite(Number(item?.durationMinutes)) ? Number(item.durationMinutes) : 0,
      locationName: String(item?.locationName || '').trim(),
      description: String(item?.description || '').trim(),
      transitionNote: String(item?.transitionNote || '').trim(),
    }))
    .filter((step) => step.title)
    .slice(0, 12);
};

const parseField = (val, fallback) => {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return val;
};

const normalizeStringArray = (rawValue, limit = 8) => {
  const parsed = Array.isArray(rawValue) ? rawValue : parseField(rawValue, []);

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, limit);
};

const DETAIL_SECTION_KEYS = [
  'whatToExpect',
  'meetingAndPickup',
  'accessibility',
  'additionalInformation',
  'cancellationPolicy',
  'help',
];

const normalizeDetailsSections = (rawValue) => {
  const parsed = parseField(rawValue, {});
  const normalized = {};

  DETAIL_SECTION_KEYS.forEach((key) => {
    normalized[key] = String(parsed?.[key] || '').trim();
  });

  return normalized;
};

const normalizeStorytellingProfile = (rawValue) => {
  const parsed = parseField(rawValue, {});

  return {
    hostStory: String(parsed?.hostStory || '').trim(),
    localConnection: String(parsed?.localConnection || '').trim(),
    insiderTips: normalizeStringArray(parsed?.insiderTips, 8),
    photoMoments: normalizeStringArray(parsed?.photoMoments, 6),
  };
};

const normalizeExperiencePathways = (rawValue) => {
  const parsed = parseField(rawValue, []);
  if (!Array.isArray(parsed)) return [];

  const phaseValues = ['before', 'anchor', 'after', 'full-day'];
  const timeValues = ['morning', 'afternoon', 'evening', 'anytime'];
  const paceValues = ['easy', 'balanced', 'immersive'];

  return parsed
    .map((item) => ({
      title: String(item?.title || '').trim(),
      summary: String(item?.summary || '').trim(),
      durationLabel: String(item?.durationLabel || '').trim(),
      highlight: String(item?.highlight || '').trim(),
      phase: phaseValues.includes(item?.phase) ? item.phase : 'anchor',
      idealTime: timeValues.includes(item?.idealTime) ? item.idealTime : 'anytime',
      pace: paceValues.includes(item?.pace) ? item.pace : 'balanced',
      bestFor: String(item?.bestFor || '').trim(),
      neighborhood: String(item?.neighborhood || '').trim(),
      stopCount: Math.max(1, Math.min(12, Number(item?.stopCount) || 3)),
    }))
    .filter((item) => item.title)
    .slice(0, 6);
};

const normalizeTranslations = (rawValue) => {
  const parsed = parseField(rawValue, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => ({
      languageCode: String(item?.languageCode || '').trim().toLowerCase(),
      languageLabel: String(item?.languageLabel || '').trim(),
      title: String(item?.title || '').trim(),
      description: String(item?.description || '').trim(),
      whatToExpect: String(item?.whatToExpect || '').trim(),
      meetingAndPickup: String(item?.meetingAndPickup || '').trim(),
    }))
    .filter((item) => item.languageCode && item.languageLabel && (item.title || item.description))
    .slice(0, 8);
};

const normalizeBookingSettings = (rawValue) => {
  const parsed = parseField(rawValue, {});
  const discounts = Array.isArray(parsed?.groupDiscounts) ? parsed.groupDiscounts : [];

  return {
    minAdvanceHours: Math.max(0, Math.min(720, Number(parsed?.minAdvanceHours) || 6)),
    maxAdvanceDays: Math.max(1, Math.min(730, Number(parsed?.maxAdvanceDays) || 180)),
    allowSplitPayments: Boolean(parsed?.allowSplitPayments),
    splitPaymentDepositPercent: Math.max(10, Math.min(90, Number(parsed?.splitPaymentDepositPercent) || 30)),
    allowGroupPricing: Boolean(parsed?.allowGroupPricing),
    groupDiscounts: discounts
      .map((item) => ({
        minGuests: Math.max(2, Math.min(100, Number(item?.minGuests) || 2)),
        percentOff: Math.max(1, Math.min(90, Number(item?.percentOff) || 0)),
        label: String(item?.label || '').trim(),
      }))
      .filter((item) => item.percentOff > 0)
      .slice(0, 6),
    allowCollaborativeBookings: Boolean(parsed?.allowCollaborativeBookings),
  };
};

const normalizeMicroExperience = (rawValue) => {
  const parsed = parseField(rawValue, {});

  return {
    isEnabled: Boolean(parsed?.isEnabled),
    label: String(parsed?.label || '').trim(),
    teaser: String(parsed?.teaser || '').trim(),
  };
};

const normalizeRewards = (rawValue) => {
  const parsed = parseField(rawValue, {});

  return {
    pointsPerCheckIn: Math.max(0, Math.min(1000, Number(parsed?.pointsPerCheckIn) || 50)),
    badgeLabel: String(parsed?.badgeLabel || '').trim(),
    bonusTip: String(parsed?.bonusTip || '').trim(),
  };
};

const normalizeAvailabilitySettings = (rawValue) => {
  const parsed = parseField(rawValue, {});
  const syncMode = ['manual', 'calendar', 'api'].includes(parsed?.syncMode) ? parsed.syncMode : 'manual';

  return {
    syncMode,
    timezone: String(parsed?.timezone || 'Asia/Karachi').trim() || 'Asia/Karachi',
    instantConfirmation: parsed?.instantConfirmation !== false,
    lastSyncedAt: parsed?.lastSyncedAt ? new Date(parsed.lastSyncedAt) : new Date(),
  };
};

const parseBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
};

// ─── @GET /api/experiences ─────────────────────────────────────────────────
// Public — Search & filter experiences
// Supports: keyword, category, city, minPrice, maxPrice, tags, lat, lng, radius
const getExperiences = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      date,
      timeOfDay,
      city,
      minPrice,
      maxPrice,
      tags,
      lat,
      lng,
      radius  = 50000, // default 50km
      page    = 1,
      limit   = 12,
      sort    = 'createdAt',
    } = req.query;
    const userLat = Number(lat);
    const userLng = Number(lng);
    const hasUserCoords = Number.isFinite(userLat) && Number.isFinite(userLng);

    // Build cache key from query
    const cacheKey = `experiences:${JSON.stringify(req.query)}`;
    const cached   = await getCache(cacheKey);
    if (cached) return paginatedResponse(res, 'Experiences fetched', cached.data, cached.pagination);

    const filter = { isActive: true };

    // ── Nearby search using coordinates (home page auto-detect) ────────────
    // Some MongoDB environments restrict $near / $geoNear in certain contexts,
    // so we use $geoWithin + $centerSphere for a radius search instead.
    if (hasUserCoords) {
      const distanceInMeters  = parseInt(radius, 10);
      const earthRadiusMeters = 6378137; // WGS84
      const distanceInRadians = distanceInMeters / earthRadiusMeters;

      filter['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [
            [userLng, userLat],
            distanceInRadians,
          ],
        },
      };
    }

    // ── City name filter (search page manual input) ────────────────────────
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    // ── Full-text keyword search ───────────────────────────────────────────
    if (keyword) {
      filter.$text = { $search: keyword };
    }

    // ── Other filters ──────────────────────────────────────────────────────
    if (category) filter.category = category;
    if (tags)     filter.tags     = { $in: tags.split(',') };

    // ── Date/time filters based on availability slots ───────────────────────
    const availabilityElemMatch = {};

    if (date) {
      const selectedDate = new Date(`${date}T00:00:00.000Z`);
      if (!Number.isNaN(selectedDate.getTime())) {
        const nextDate = new Date(selectedDate);
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);
        availabilityElemMatch.date = { $gte: selectedDate, $lt: nextDate };
      }
    }

    if (timeOfDay) {
      const timeRegexMap = {
        morning: /^(0[5-9]|1[01]):/,
        afternoon: /^(12|13|14|15|16):/,
        evening: /^(17|18|19|20):/,
        night: /^(21|22|23|0[0-4]):/,
      };

      if (timeRegexMap[timeOfDay]) {
        availabilityElemMatch.startTime = { $regex: timeRegexMap[timeOfDay] };
      }
    }

    if (Object.keys(availabilityElemMatch).length > 0) {
      filter.availability = { $elemMatch: availabilityElemMatch };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ── Sort options ───────────────────────────────────────────────────────
    const sortOptions = {
      createdAt:  { createdAt: -1 },
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      rating:     { 'rating.average': -1 },
    };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Experience.countDocuments(filter);
    const baseQuery = Experience
      .find(filter)
      .populate('hostId', 'name profilePic languages')
      .lean();

    let experiences;

    if (hasUserCoords && sort === 'nearest') {
      const results = await baseQuery;
      experiences = attachDistanceKm(results, userLat, userLng)
        .sort((left, right) => {
          const leftDistance = Number.isFinite(left.distanceKm) ? left.distanceKm : Number.MAX_SAFE_INTEGER;
          const rightDistance = Number.isFinite(right.distanceKm) ? right.distanceKm : Number.MAX_SAFE_INTEGER;
          return leftDistance - rightDistance;
        })
        .slice(skip, skip + Number(limit));
    } else {
      const results = await baseQuery
        .sort(sortOptions[sort] || { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      experiences = hasUserCoords ? attachDistanceKm(results, userLat, userLng) : results;
    }

    const pagination = {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };

    await setCache(cacheKey, { data: experiences, pagination }, 300); // 5 min cache

    return paginatedResponse(res, 'Experiences fetched', experiences, pagination);
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/experiences/featured ───────────────────────────────────────
// Public — Featured & trending experiences for home page
const getFeaturedExperiences = async (req, res, next) => {
  try {
    const cacheKey = 'experiences:featured';
    const cached   = await getCache(cacheKey);
    if (cached) return successResponse(res, 200, 'Featured experiences fetched', cached);

    const featured = await Experience
      .find({ isActive: true, isFeatured: true })
      .populate('hostId', 'name profilePic languages')
      .sort({ 'rating.average': -1 })
      .limit(8);

    await setCache(cacheKey, featured, 600); // 10 min cache

    return successResponse(res, 200, 'Featured experiences fetched', featured);
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/experiences/:id ─────────────────────────────────────────────
// Public — Single experience detail
const getExperienceById = async (req, res, next) => {
  try {
    const cacheKey = `experience:${req.params.id}`;
    const cached   = await getCache(cacheKey);
    // Only use cache if no translation is requested
    const requestedLang = (req.query.lang || req.headers['accept-language'] || 'en').split(',')[0].toLowerCase();
    if (cached && (!requestedLang || requestedLang === 'en')) {
      return successResponse(res, 200, 'Experience fetched', cached);
    }

    const experience = await Experience
      .findById(req.params.id)
      .populate('hostId', 'name profilePic bio languages hostDetails createdAt');

    if (!experience || !experience.isActive) {
      return errorResponse(res, 404, 'Experience not found');
    }

    let responseData = experience.toObject ? experience.toObject() : { ...experience };

    // On-demand translation for description
    if (requestedLang && requestedLang !== 'en') {
      try {
        const translated = await translateText(responseData.description, requestedLang);
        responseData.description = translated || responseData.description;
      } catch (err) {
        // Log error, but fallback to English
        console.error('Translation failed:', err?.message || err);
      }
    }

    // Only cache English version
    if (!requestedLang || requestedLang === 'en') {
      await setCache(cacheKey, responseData, 300);
    }

    return successResponse(res, 200, 'Experience fetched', responseData);
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/experiences ────────────────────────────────────────────────
// Host only — Create experience
const createExperience = async (req, res, next) => {
  try {
    const {
      title, description, category, location,
      tags, price, duration, groupSize, availability,
    } = req.body;

    let parsedLocation = {};
    try {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : (location || {});
    } catch {
      parsedLocation = {};
    }
        // Merge flat location fields from FormData into parsedLocation
        if (req.body['location.city']) parsedLocation.city = req.body['location.city'];
        if (req.body['location.address']) parsedLocation.address = req.body['location.address'];
        if (req.body['location.country']) parsedLocation.country = req.body['location.country'];
    // If coordinatesHint is sent as a flat field (FormData), merge it in
    if (req.body['location.coordinatesHint']) {
      try {
        parsedLocation.coordinatesHint = JSON.parse(req.body['location.coordinatesHint']);
      } catch {
        // ignore parse error, treat as missing
      }
    }

    // ── Geocode address to lat/lng ─────────────────────────────────────────
    // Prefer explicit coordinates from frontend hint when provided.
    let lng = parsedLocation.coordinatesHint?.lng;
    let lat = parsedLocation.coordinatesHint?.lat;

    if (lng == null || lat == null) {
      const addressToGeocode = parsedLocation.address || parsedLocation.city;
      const geo = await geocodeAddress(addressToGeocode);
      lng = geo.lng;
      lat = geo.lat;
    }

    parsedLocation.coordinates = {
      type:        'Point',
      coordinates: [lng, lat], // GeoJSON is [longitude, latitude]
    };

    // Handle uploaded photos from Cloudinary
    const photos = req.files ? req.files.map((f) => f.path) : [];

    const {
      photos: bodyPhotos,
      includes,
      notIncluded,
      itinerary,
      detailsSections,
      storytellingProfile,
      experiencePathways,
      languagesSupported,
      translations,
      bookingSettings,
      microExperience,
      rewards,
      availabilitySettings,
    } = req.body;

    const experience = await Experience.create({
      hostId:       req.user._id,
      title,
      description,
      category,
      location:     parsedLocation,
      tags:         normalizeStringArray(tags, 8),
      includes:     normalizeStringArray(includes, 8),
      notIncluded:  normalizeStringArray(notIncluded, 8),
      detailsSections: normalizeDetailsSections(detailsSections),
      itinerary:    normalizeItinerary(itinerary),
      storytellingProfile: normalizeStorytellingProfile(storytellingProfile),
      experiencePathways: normalizeExperiencePathways(experiencePathways),
      languagesSupported: normalizeStringArray(languagesSupported, 12),
      translations: normalizeTranslations(translations),
      price:        Number(price),
      duration:     Number(duration),
      groupSize:    parseField(groupSize, { min: 1, max: 10 }),
      bookingSettings: normalizeBookingSettings(bookingSettings),
      microExperience: normalizeMicroExperience(microExperience),
      rewards: normalizeRewards(rewards),
      availability: parseField(availability, []),
      availabilitySettings: normalizeAvailabilitySettings(availabilitySettings),
      photos:       req.files?.length ? req.files.map((f) => f.path) : parseField(bodyPhotos, []),
    });

    // Invalidate experience list cache
    await deleteCacheByPattern('experiences:*');

    return successResponse(res, 201, 'Experience created', experience);
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/experiences/:id ─────────────────────────────────────────────
// Host only — Update experience
const updateExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) return errorResponse(res, 404, 'Experience not found');

    if (experience.hostId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to update this experience');
    }

    const {
      title, description, category, location,
      tags, price, duration, groupSize, availability, isActive,
    } = req.body;

    const updates = {};
    const {
      includes: bodyIncludes,
      notIncluded,
      detailsSections,
      photos: bodyPhotos,
      itinerary,
      storytellingProfile,
      experiencePathways,
      languagesSupported,
      translations,
      bookingSettings,
      microExperience,
      rewards,
      availabilitySettings,
    } = req.body;

    if (title)       updates.title       = title;
    if (description) updates.description = description;
    if (category)    updates.category    = category;
    if (price)       updates.price       = Number(price);
    if (duration)    updates.duration    = Number(duration);
    if (tags !== undefined)        updates.tags        = normalizeStringArray(tags, 8);
    if (bodyIncludes !== undefined)updates.includes    = normalizeStringArray(bodyIncludes, 8);
    if (notIncluded !== undefined) updates.notIncluded = normalizeStringArray(notIncluded, 8);
    if (detailsSections !== undefined) updates.detailsSections = normalizeDetailsSections(detailsSections);
    if (itinerary !== undefined) updates.itinerary = normalizeItinerary(itinerary);
    if (storytellingProfile !== undefined) updates.storytellingProfile = normalizeStorytellingProfile(storytellingProfile);
    if (experiencePathways !== undefined) updates.experiencePathways = normalizeExperiencePathways(experiencePathways);
    if (languagesSupported !== undefined) updates.languagesSupported = normalizeStringArray(languagesSupported, 12);
    if (translations !== undefined) updates.translations = normalizeTranslations(translations);
    if (groupSize)   updates.groupSize   = parseField(groupSize, { min: 1, max: 10 });
    if (bookingSettings !== undefined) updates.bookingSettings = normalizeBookingSettings(bookingSettings);
    if (microExperience !== undefined) updates.microExperience = normalizeMicroExperience(microExperience);
    if (rewards !== undefined) updates.rewards = normalizeRewards(rewards);
    if (availability)updates.availability= parseField(availability, []);
    if (availabilitySettings !== undefined) updates.availabilitySettings = normalizeAvailabilitySettings(availabilitySettings);
    const parsedBodyPhotos = bodyPhotos ? parseField(bodyPhotos, []) : null;
    if (parsedBodyPhotos) updates.photos = parsedBodyPhotos;
    if (isActive !== undefined) updates.isActive = parseBoolean(isActive, experience.isActive);

    // If location updated — re-geocode
    if (location) {
      const parsedLocation       = typeof location === 'string' ? JSON.parse(location) : location;
      const addressToGeocode     = parsedLocation.address || parsedLocation.city;
      const { lat, lng }         = await geocodeAddress(addressToGeocode);
      parsedLocation.coordinates = { type: 'Point', coordinates: [lng, lat] };
      updates.location           = parsedLocation;
    }

    // New photos uploaded
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map((f) => f.path);
      const basePhotos = Array.isArray(parsedBodyPhotos) ? parsedBodyPhotos : experience.photos;
      updates.photos = [...basePhotos, ...newPhotos];
    }

    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    await deleteCacheByPattern('experiences:*');
    await deleteCacheByPattern(`experience:${req.params.id}`);

    return successResponse(res, 200, 'Experience updated', updated);
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/experiences/:id ─────────────────────────────────────────
// Host only — Soft delete
const deleteExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) return errorResponse(res, 404, 'Experience not found');

    if (experience.hostId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to delete this experience');
    }

    experience.isActive = false;
    await experience.save();

    await deleteCacheByPattern('experiences:*');
    await deleteCacheByPattern(`experience:${req.params.id}`);

    return successResponse(res, 200, 'Experience deleted');
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/experiences/host/my-listings ───────────────────────────────
// Host only — Get all experiences by logged-in host
const getHostExperiences = async (req, res, next) => {
  try {
    const experiences = await Experience
      .find({ hostId: req.user._id })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Host experiences fetched', experiences);
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/experiences/:id/availability ───────────────────────────────
// Host only — Update availability slots
const updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    const experience = await Experience.findById(req.params.id);
    if (!experience)  return errorResponse(res, 404, 'Experience not found');

    if (experience.hostId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized');
    }

    experience.availability = availability;
    experience.availabilitySettings = {
      ...(experience.availabilitySettings?.toObject?.() || experience.availabilitySettings || {}),
      lastSyncedAt: new Date(),
    };
    await experience.save();

    await deleteCacheByPattern(`experience:${req.params.id}`);

    return successResponse(res, 200, 'Availability updated', experience.availability);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExperiences,
  getFeaturedExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  getHostExperiences,
  updateAvailability,
};
