const express = require('express');
const router = express.Router();
const { handleCheckIn, getUserRewards } = require('../services/rewardsService');
const { protect } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');

router.post('/experience/:experienceId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { experienceId } = req.params;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const booking = await Booking.findOne({
      userId,
      experienceId,
      status: { $in: ['confirmed', 'completed'] },
      'slot.date': { $gte: startOfDay, $lte: endOfDay }
    });

    if (!booking) {
      return res.status(400).json({ success: false, message: 'You must have an active booking for today to check in.' });
    }

    if (booking.checkIn && booking.checkIn.status === 'checked_in') {
      return res.status(400).json({ success: false, message: 'You have already checked in for this booking.' });
    }

    booking.checkIn = {
      ...booking.checkIn,
      status: 'checked_in',
      checkedInAt: new Date()
    };
    await booking.save();

    const result = await handleCheckIn({ userId });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/user/:id', protect, async (req, res) => {
  try {
    const result = await getUserRewards(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
