const express = require('express');
const router  = express.Router();

const {
  createItinerary,
  getMyItineraries,
  getItineraryById,
  getItineraryByToken,
  updateItinerary,
  addExperienceToItinerary,
  removeExperienceFromItinerary,
  shareItinerary,
  deleteItinerary,
} = require('../controllers/itineraryController');

const { protect, optionalAuth } = require('../middleware/authMiddleware');

// ─── Public ────────────────────────────────────────────────────────────────
router.get('/shared/:token', getItineraryByToken);

// ─── Protected ─────────────────────────────────────────────────────────────
router.post('/',                                          protect,      createItinerary);
router.get('/',                                           protect,      getMyItineraries);
router.get('/:id',                                        optionalAuth, getItineraryById);
router.put('/:id',                                        protect,      updateItinerary);
router.delete('/:id',                                     protect,      deleteItinerary);
router.post('/:id/share',                                 protect,      shareItinerary);
router.post('/:id/experiences',                           protect,      addExperienceToItinerary);
router.delete('/:id/experiences/:experienceId',           protect,      removeExperienceFromItinerary);

module.exports = router;