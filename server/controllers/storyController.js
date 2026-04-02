const Story = require('../models/Story');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

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

const getStories = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { isPublished: true };
    const total = await Story.countDocuments(filter);

    const stories = await Story.find(filter)
      .populate('hostId', 'name profilePic bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

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
    const story = await Story.findOne({ slug: req.params.slug, isPublished: true })
      .populate('hostId', 'name profilePic bio languages');

    if (!story) return errorResponse(res, 404, 'Story not found');
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
