const mongoose = require('mongoose');
const Pathway = require('../models/Pathway');
const User = require('../models/User');

/**
 * @desc    Create a new pathway
 * @route   POST /api/pathways
 * @access  Private
 */
const createPathway = async (req, res, next) => {
  try {
    const { title, description, coverPhoto, stops, tags, isPublic, totalDuration, totalPrice, city, difficulty, bestFor, bestTime, status, isAICurated } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const pathway = await Pathway.create({
      creatorId: req.user._id,
      title,
      description: description || '',
      coverPhoto: coverPhoto || '',
      stops: Array.isArray(stops) ? stops : [],
      tags: Array.isArray(tags) ? tags : [],
      isPublic: isPublic === true,
      totalDuration: totalDuration || 0,
      totalPrice: totalPrice || 0,
      city, difficulty, bestFor, bestTime, status, isAICurated
    });

    res.status(201).json({ success: true, data: pathway });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all public pathways (with filters)
 * @route   GET /api/pathways
 * @access  Public
 */
const getPathways = async (req, res, next) => {
  try {
    const { tag, limit = 10, page = 1 } = req.query;
    
    // Construct query to only fetch public pathways or those owned by user if logged in
    // For general browsing, we restrict to public ones.
    const query = { isPublic: true };
    
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const pathways = await Pathway.find(query)
      .populate('creatorId', 'name profilePic role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Pathway.countDocuments(query);

    res.status(200).json({
      success: true,
      count: pathways.length,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      },
      data: pathways
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single pathway
 * @route   GET /api/pathways/:id
 * @access  Public
 */
const getPathwayById = async (req, res, next) => {
  try {
    const pathway = await Pathway.findById(req.params.id)
      .populate('creatorId', 'name profilePic role bio')
      .populate({
        path: 'stops.experienceId',
        select: 'title coverPhoto photos price duration location hostId category rating'
      });

    if (!pathway) {
      return res.status(404).json({ success: false, message: 'Pathway not found' });
    }

    // Determine if user has access (public or creator)
    if (!pathway.isPublic && (!req.user || String(pathway.creatorId._id) !== String(req.user._id))) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this pathway' });
    }

    res.status(200).json({ success: true, data: pathway });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a pathway
 * @route   PUT /api/pathways/:id
 * @access  Private (Creator Only)
 */
const updatePathway = async (req, res, next) => {
  try {
    let pathway = await Pathway.findById(req.params.id);

    if (!pathway) {
      return res.status(404).json({ success: false, message: 'Pathway not found' });
    }

    // Check ownership
    if (String(pathway.creatorId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this pathway' });
    }

    // Protect certain fields from being updated directly like saves
    const updates = { ...req.body };
    delete updates.saves;
    delete updates.creatorId;

    pathway = await Pathway.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: pathway });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a pathway
 * @route   DELETE /api/pathways/:id
 * @access  Private (Creator Only)
 */
const deletePathway = async (req, res, next) => {
  try {
    const pathway = await Pathway.findById(req.params.id);

    if (!pathway) {
      return res.status(404).json({ success: false, message: 'Pathway not found' });
    }

    // Check ownership
    if (String(pathway.creatorId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this pathway' });
    }

    await pathway.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle save status of a pathway for the current user
 * @route   POST /api/pathways/:id/save
 * @access  Private
 */
const toggleSavePathway = async (req, res, next) => {
  try {
    const pathway = await Pathway.findById(req.params.id);
    if (!pathway) {
      return res.status(404).json({ success: false, message: 'Pathway not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const pathwayIdStr = String(pathway._id);
    const isSaved = user.savedPathways.some(id => String(id) === pathwayIdStr);

    if (isSaved) {
      user.savedPathways = user.savedPathways.filter(id => String(id) !== pathwayIdStr);
      pathway.saves = Math.max(0, pathway.saves - 1);
    } else {
      user.savedPathways.push(pathway._id);
      pathway.saves += 1;
    }

    await user.save();
    await pathway.save();

    res.status(200).json({ 
      success: true, 
      isSaved: !isSaved,
      savesCount: pathway.saves 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPathway,
  getPathways,
  getPathwayById,
  updatePathway,
  deletePathway,
  toggleSavePathway
};
