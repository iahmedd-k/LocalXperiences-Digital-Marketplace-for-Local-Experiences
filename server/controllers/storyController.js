const Story = require('../models/Story');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { translateText } = require('../services/translationService');

const slugify = (value = '') => String(value)
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

const ensureUniqueSlug = async (title, excludeId = null) => {
  const base = slugify(title) || `story-${Date.now()}`;
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await Story.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).select('_id');

    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
};

const parseJson = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
};

const normalizeTags = (value) => {
  const parsed = parseJson(value, []);
  return Array.isArray(parsed)
    ? parsed.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 10)
    : [];
};

const normalizeSections = (rawSections, uploadedImages = []) => {
  const parsed = parseJson(rawSections, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((section) => {
      const imageIndex = Number(section?.imageIndex);
      const uploadedImage = Number.isInteger(imageIndex) && imageIndex >= 0 ? uploadedImages[imageIndex]?.path : '';

      return {
        heading: String(section?.heading || '').trim(),
        body: String(section?.body || '').trim(),
        image: uploadedImage || String(section?.image || '').trim(),
        imageCaption: String(section?.imageCaption || '').trim(),
        imagePosition: ['full', 'left', 'right'].includes(section?.imagePosition) ? section.imagePosition : 'full',
      };
    })
    .filter((section) => section.heading && section.body)
    .slice(0, 12);
};

const DEFAULT_LANGUAGE = 'en';

const normalizeRequestedLanguage = (value = DEFAULT_LANGUAGE) => {
  const normalized = String(value || DEFAULT_LANGUAGE).split(',')[0].trim().toLowerCase();
  return normalized || DEFAULT_LANGUAGE;
};

const getLanguageCandidates = (value = DEFAULT_LANGUAGE) => {
  const normalized = normalizeRequestedLanguage(value);
  const base = normalized.split('-')[0];
  return [...new Set([normalized, base].filter(Boolean))];
};

const isEnglishLanguage = (value = DEFAULT_LANGUAGE) => getLanguageCandidates(value).includes(DEFAULT_LANGUAGE);

const findStoredStoryTranslation = (translations = [], requestedLanguage = DEFAULT_LANGUAGE) => {
  if (!Array.isArray(translations) || !translations.length) return null;

  const candidates = getLanguageCandidates(requestedLanguage);
  return translations.find((item) => candidates.includes(String(item?.languageCode || '').trim().toLowerCase())) || null;
};

const applyStoryTranslation = (story, translation) => {
  if (!translation) return story;

  const translatedSections = Array.isArray(story?.sections)
    ? story.sections.map((section, index) => {
        const translatedSection = translation.sections?.[index];
        if (!translatedSection) return section;

        return {
          ...section,
          heading: translatedSection.heading || section.heading,
          body: translatedSection.body || section.body,
          imageCaption: translatedSection.imageCaption || section.imageCaption,
        };
      })
    : [];

  return {
    ...story,
    title: translation.title || story.title,
    excerpt: translation.excerpt || story.excerpt,
    coverImageAlt: translation.coverImageAlt || story.coverImageAlt,
    category: translation.category || story.category,
    locationLabel: translation.locationLabel || story.locationLabel,
    sections: translatedSections,
  };
};

const persistStoryTranslation = async (storyDoc, requestedLanguage, translatedFields) => {
  if (!storyDoc?.save || !translatedFields || Object.keys(translatedFields).length === 0) return;

  const candidates = getLanguageCandidates(requestedLanguage);
  const primaryLanguage = candidates[0];
  if (!primaryLanguage || primaryLanguage === DEFAULT_LANGUAGE) return;

  const existingIndex = Array.isArray(storyDoc.translations)
    ? storyDoc.translations.findIndex((item) => candidates.includes(String(item?.languageCode || '').trim().toLowerCase()))
    : -1;

  const payload = {
    languageCode: primaryLanguage,
    languageLabel: primaryLanguage.toUpperCase(),
    ...translatedFields,
  };

  try {
    if (existingIndex >= 0) {
      Object.assign(storyDoc.translations[existingIndex], payload);
    } else {
      storyDoc.translations.push(payload);
    }

    await storyDoc.save();
  } catch (error) {
    console.error('Failed to persist story translation:', error?.message || error);
  }
};

const resolveStoryForLanguage = async (storyDoc, requestedLanguage = DEFAULT_LANGUAGE, { persistMissing = true } = {}) => {
  const story = storyDoc?.toObject ? storyDoc.toObject() : { ...storyDoc };
  if (isEnglishLanguage(requestedLanguage)) return story;

  const storedTranslation = findStoredStoryTranslation(story.translations, requestedLanguage);
  if (storedTranslation) return applyStoryTranslation(story, storedTranslation);

  const targetLanguage = getLanguageCandidates(requestedLanguage)[0];
  const translatedSections = await Promise.all(
    (story.sections || []).map(async (section) => ({
      heading: section?.heading ? await translateText(section.heading, targetLanguage) : '',
      body: section?.body ? await translateText(section.body, targetLanguage) : '',
      imageCaption: section?.imageCaption ? await translateText(section.imageCaption, targetLanguage) : '',
    }))
  );

  const translatedFields = {
    title: story.title ? await translateText(story.title, targetLanguage) : '',
    excerpt: story.excerpt ? await translateText(story.excerpt, targetLanguage) : '',
    coverImageAlt: story.coverImageAlt ? await translateText(story.coverImageAlt, targetLanguage) : '',
    category: story.category ? await translateText(story.category, targetLanguage) : '',
    locationLabel: story.locationLabel ? await translateText(story.locationLabel, targetLanguage) : '',
    sections: translatedSections,
  };

  if (persistMissing) {
    await persistStoryTranslation(storyDoc, targetLanguage, translatedFields);
  }

  return applyStoryTranslation(story, translatedFields);
};

const getStories = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const requestedLanguage = normalizeRequestedLanguage(req.query.lang || req.headers['accept-language']);
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { isPublished: true };
    const total = await Story.countDocuments(filter);

    const storyDocs = await Story.find(filter)
      .populate('hostId', 'name profilePic bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const stories = await Promise.all(storyDocs.map((story) => resolveStoryForLanguage(story, requestedLanguage)));

    return paginatedResponse(res, 'Stories fetched', stories, {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

const getStoryBySlug = async (req, res, next) => {
  try {
    const requestedLanguage = normalizeRequestedLanguage(req.query.lang || req.headers['accept-language']);
    const storyDoc = await Story.findOne({ slug: req.params.slug, isPublished: true })
      .populate('hostId', 'name profilePic bio languages');

    if (!storyDoc) return errorResponse(res, 404, 'Story not found');

    const story = await resolveStoryForLanguage(storyDoc, requestedLanguage);
    return successResponse(res, 200, 'Story fetched', story);
  } catch (error) {
    next(error);
  }
};

const getHostStories = async (req, res, next) => {
  try {
    const stories = await Story.find({ hostId: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Host stories fetched', stories);
  } catch (error) {
    next(error);
  }
};

const createStory = async (req, res, next) => {
  try {
    const coverImage = req.files?.coverImage?.[0]?.path || '';
    const sectionImages = req.files?.sectionImages || [];

    if (!coverImage) return errorResponse(res, 400, 'A cover image is required');

    const title = String(req.body.title || '').trim();
    const excerpt = String(req.body.excerpt || '').trim();
    const sections = normalizeSections(req.body.sections, sectionImages);

    if (!title) return errorResponse(res, 400, 'Title is required');
    if (!excerpt) return errorResponse(res, 400, 'Excerpt is required');
    if (!sections.length) return errorResponse(res, 400, 'At least one section is required');

    const story = await Story.create({
      hostId: req.user._id,
      title,
      slug: await ensureUniqueSlug(title),
      excerpt,
      coverImage,
      coverImageAlt: String(req.body.coverImageAlt || '').trim(),
      category: String(req.body.category || 'Local Story').trim(),
      locationLabel: String(req.body.locationLabel || '').trim(),
      readTimeMinutes: Number(req.body.readTimeMinutes) || 6,
      sections,
      tags: normalizeTags(req.body.tags),
      isPublished: req.body.isPublished !== 'false',
    });

    return successResponse(res, 201, 'Story created', story);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStories,
  getStoryBySlug,
  getHostStories,
  createStory,
};
