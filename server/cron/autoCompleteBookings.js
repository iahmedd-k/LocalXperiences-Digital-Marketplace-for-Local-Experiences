// Auto-complete bookings whose slot date/time has passed
const mongoose = require('mongoose');
const Booking = require('../models/Booking');

async function autoCompleteBookings() {
  const now = new Date();
  // Find bookings with status 'upcoming' or 'confirmed' whose slot date/time is in the past
  const bookings = await Booking.find({
    status: { $in: ['upcoming', 'confirmed'] },
    'slot.date': { $lte: now },
  });

  for (const booking of bookings) {
    // Optionally, check slot.startTime if you want to be more precise
    booking.status = 'completed';
    await booking.save();
    // Optionally: send notification/email here
  }
  return bookings.length;
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      const count = await autoCompleteBookings();
      console.log(`Auto-completed ${count} bookings.`);
      process.exit(0);
    })
    .catch(err => {
      console.error('DB connection error:', err);
      process.exit(1);
    });
}

module.exports = autoCompleteBookings;
