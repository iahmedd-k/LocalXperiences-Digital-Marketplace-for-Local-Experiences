const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Experience = require('./models/Experience');
const Pathway = require('./models/Pathway');
const Booking = require('./models/Booking');

const seedMore = async () => {
  try {
    await connectDB();
    console.log('Connected to Database');

    // 1. Get host and some experiences
    const host = await User.findOne({ role: 'host' });
    if (!host) {
      throw new Error('No host found to associate data with.');
    }

    // Try to get a traveler user, or create one if none exists
    let traveler = await User.findOne({ role: 'traveler' });
    if (!traveler) {
      traveler = new User({
        name: 'John Traveler',
        email: 'traveler@example.com',
        password: 'password123',
        role: 'traveler',
      });
      await traveler.save();
      console.log('Created dummy traveler user');
    }

    const experiences = await Experience.find({ hostId: host._id }).limit(3);
    if (experiences.length === 0) {
      throw new Error('No experiences found. Run the first seed script again.');
    }

    // --- 2. Create Dummy Pathways ---
    // A pathway typically links multiple experiences.
    const pathwayStops = experiences.map((exp, index) => ({
      experienceId: exp._id,
      order: index,
      travelTimeToNext: 15,
      travelMode: 'walk',
    }));

    const dummyPathway = {
      creatorId: host._id,
      title: 'Ultimate Cultural Weekend',
      description: 'A curated weekend pathway connecting the best food, art, and relaxation localXperiences has to offer.',
      city: experiences[0].location.city,
      difficulty: 'moderate',
      bestFor: 'Couples & Friends',
      bestTime: 'Weekends',
      status: 'published',
      stops: pathwayStops,
      totalDuration: 450,
      totalPrice: experiences.reduce((acc, curr) => acc + curr.price, 0),
      tags: ['weekend', 'culture', 'curated'],
      isPublic: true,
      saves: 5
    };

    await Pathway.create(dummyPathway);
    console.log('Successfully inserted a Pathway!');

    // --- 3. Create Dummy Bookings to Test Rewards ---
    // We will create some bookings in 'confirmed' status so the user can test the Check-In/Rewards functionality.
    
    // Booking 1: Today's booking (Ready to be checked in)
    const booking1 = {
      experienceId: experiences[0]._id,
      userId: traveler._id,
      hostId: host._id,
      slot: {
        date: new Date(),
        startTime: '10:00'
      },
      guestCount: 2,
      amount: experiences[0].price * 2 * 100, // in cents
      status: 'confirmed',
      contact: {
        firstName: traveler.name.split(' ')[0],
        lastName: traveler.name.split(' ')[1] || '',
        email: traveler.email,
        phone: '1234567890'
      },
      checkIn: {
        status: 'not_checked_in',
        method: 'none'
      }
    };

    // Booking 2: Upcoming booking
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const booking2 = {
      experienceId: experiences[1] ? experiences[1]._id : experiences[0]._id,
      userId: traveler._id,
      hostId: host._id,
      slot: {
        date: tomorrow,
        startTime: '14:00'
      },
      guestCount: 1,
      amount: (experiences[1] ? experiences[1].price : experiences[0].price) * 100, // in cents
      status: 'confirmed',
      contact: {
        firstName: traveler.name.split(' ')[0],
        lastName: traveler.name.split(' ')[1] || '',
        email: traveler.email,
        phone: '1234567890'
      },
      checkIn: {
        status: 'not_checked_in',
        method: 'none'
      }
    };

    await Booking.create([booking1, booking2]);
    console.log('Successfully inserted 2 Bookings for testing rewards!');

    console.log('Done!');
    process.exit(0);

  } catch (err) {
    console.error('Error seeding more data:', err);
    process.exit(1);
  }
};

seedMore();
