const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Experience = require('./models/Experience');
const Review = require('./models/Review');
const QnA = require('./models/QnA');

const seedInteractions = async () => {
  try {
    await connectDB();
    console.log('Connected to Database');

    // Get host, traveler, and experiences
    const host = await User.findOne({ role: 'host' });
    const traveler = await User.findOne({ role: 'traveler' });
    const experiences = await Experience.find({ hostId: host?._id });

    if (!host || !traveler || experiences.length === 0) {
      throw new Error('Required base data not found. Please ensure you ran previous seeds.');
    }

    const firstExperience = experiences[0];

    // --- 1. Create Dummy Reviews ---
    const reviewData = [
      {
        experienceId: firstExperience._id,
        userId: traveler._id,
        guestName: traveler.name,
        rating: 5,
        comment: 'This was an absolutely incredible experience. The host was incredibly knowledgeable and the whole day was planned perfectly. Would highly recommend to anyone visiting!'
      },
      {
        experienceId: firstExperience._id,
        guestName: 'Sarah M.',
        rating: 4,
        comment: 'Really enjoyed it. We learned a lot and the atmosphere was great. The only minor point was that it started a bit later than scheduled, but overall fantastic.'
      }
    ];

    await Review.insertMany(reviewData);
    console.log('Successfully inserted Reviews.');

    // Update experience rating logic
    const totalRating = ((firstExperience.rating?.average || 0) * (firstExperience.rating?.count || 0)) + 9;
    const newCount = (firstExperience.rating?.count || 0) + 2;
    firstExperience.rating = {
      average: Number((totalRating / newCount).toFixed(1)),
      count: newCount
    };
    await firstExperience.save();

    // --- 2. Create Dummy Q&A ---
    const qnaData = [
      {
        experienceId: firstExperience._id,
        askedBy: traveler._id,
        guestName: traveler.name,
        question: 'Is this experience suitable for young children (under 5 years old)?',
        answer: {
          text: 'While children are welcome, some parts of the walking tour might be a bit tiring for them. I recommend bringing a stroller if possible!',
          answeredBy: host._id,
          answeredAt: new Date()
        },
        isAnswered: true
      },
      {
        experienceId: firstExperience._id,
        guestName: 'Mike T.',
        question: 'Do we need to bring our own equipment, or is everything provided?',
        answer: {
          text: 'Everything you need will be provided on-site. Just bring yourself and a positive attitude!',
          answeredBy: host._id,
          answeredAt: new Date()
        },
        isAnswered: true
      },
      {
        experienceId: firstExperience._id,
        askedBy: traveler._id,
        guestName: traveler.name,
        question: 'Can you accommodate dietary restrictions if we let you know in advance?',
        isAnswered: false
      }
    ];

    await QnA.insertMany(qnaData);
    console.log('Successfully inserted Q&As.');

    console.log('Done!');
    process.exit(0);

  } catch (err) {
    if (err.code === 11000) {
      console.log('Some dummy interactions already exist or had a unique constraint error. Skipping.');
      process.exit(0);
    }
    console.error('Error seeding interactions:', err);
    process.exit(1);
  }
};

seedInteractions();
