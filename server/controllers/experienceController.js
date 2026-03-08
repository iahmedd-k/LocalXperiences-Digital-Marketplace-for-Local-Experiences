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

// ─── @GET /api/experiences ─────────────────────────────────────────────────
// Public — Search & filter experiences
// Supports: keyword, category, city, minPrice, maxPrice, tags, lat, lng, radius
const getExperiences = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
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

    // Build cache key from query
    const cacheKey = `experiences:${JSON.stringify(req.query)}`;
    const cached   = await getCache(cacheKey);
    if (cached) return paginatedResponse(res, 'Experiences fetched', cached.data, cached.pagination);

    const filter = { isActive: true };

    // ── Nearby search using coordinates (home page auto-detect) ────────────
    // Some MongoDB environments restrict $near / $geoNear in certain contexts,
    // so we use $geoWithin + $centerSphere for a radius search instead.
    if (lat && lng) {
      const distanceInMeters  = parseInt(radius, 10);
      const earthRadiusMeters = 6378137; // WGS84
      const distanceInRadians = distanceInMeters / earthRadiusMeters;

      filter['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
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

    const query = Experience
      .find(filter)
      .populate('hostId', 'name profilePic')
      .skip(skip)
      .limit(Number(limit));

    // Always safe to apply sort with $geoWithin
    query.sort(sortOptions[sort] || { createdAt: -1 });

    const experiences = await query;

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
      .populate('hostId', 'name profilePic')
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
    if (cached) return successResponse(res, 200, 'Experience fetched', cached);

    const experience = await Experience
      .findById(req.params.id)
      .populate('hostId', 'name profilePic bio languages hostDetails');

    if (!experience || !experience.isActive) {
      return errorResponse(res, 404, 'Experience not found');
    }

    await setCache(cacheKey, experience, 300);

    return successResponse(res, 200, 'Experience fetched', experience);
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

    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

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

    const parseField = (val, fallback) => {
      if (!val) return fallback;
      if (typeof val === 'string') { try { return JSON.parse(val); } catch { return fallback; } }
      return val; // already parsed by express (JSON body)
    };

    const { photos: bodyPhotos, includes } = req.body;

    const experience = await Experience.create({
      hostId:       req.user._id,
      title,
      description,
      category,
      location:     parsedLocation,
      tags:         parseField(tags, []),
      includes:     parseField(includes, []),
      price:        Number(price),
      duration:     Number(duration),
      groupSize:    parseField(groupSize, { min: 1, max: 10 }),
      availability: parseField(availability, []),
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
    const parseField = (val, fallback) => {
      if (!val) return fallback;
      if (typeof val === 'string') { try { return JSON.parse(val); } catch { return fallback; } }
      return val;
    };

    const { includes: bodyIncludes, photos: bodyPhotos } = req.body;

    if (title)       updates.title       = title;
    if (description) updates.description = description;
    if (category)    updates.category    = category;
    if (price)       updates.price       = Number(price);
    if (duration)    updates.duration    = Number(duration);
    if (tags)        updates.tags        = parseField(tags, []);
    if (bodyIncludes)updates.includes    = parseField(bodyIncludes, []);
    if (groupSize)   updates.groupSize   = parseField(groupSize, { min: 1, max: 10 });
    if (availability)updates.availability= parseField(availability, []);
    if (bodyPhotos)  updates.photos      = parseField(bodyPhotos, []);
    if (isActive !== undefined) updates.isActive = isActive;

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
      const newPhotos  = req.files.map((f) => f.path);
      updates.photos   = [...experience.photos, ...newPhotos];
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