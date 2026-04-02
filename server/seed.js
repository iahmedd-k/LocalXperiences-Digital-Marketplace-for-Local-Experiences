const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Experience = require('./models/Experience');

const dummyExperiences = [
  {
    title: 'Authentic Street Food Tour in the Old City',
    description: 'Join me for a mouth-watering journey through the hidden alleys of the old city. We will taste authentic local dishes, meet the vendors who have been cooking for generations, and learn about the city\'s rich culinary history.',
    category: 'food',
    location: {
      city: 'Lahore',
      address: 'Food Street, Old Lahore',
      coordinates: { type: 'Point', coordinates: [74.3146, 31.5875] }
    },
    tags: ['food', 'history', 'culture'],
    includes: ['All food tastings', 'Bottled water', 'Local guide'],
    notIncluded: ['Transportation to meeting point', 'Alcoholic beverages'],
    price: 45,
    duration: 180,
    availability: [
       { date: new Date(Date.now() + 86400000*2), startTime: '18:00', slots: 10 },
       { date: new Date(Date.now() + 86400000*3), startTime: '18:00', slots: 10 }
    ],
    photos: ['https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80'],
    isFeatured: true,
    rating: { average: 4.8, count: 24 }
  },
  {
    title: 'Morning Yoga and Meditation Retreat',
    description: 'Start your day with a peaceful yoga and meditation session surrounded by nature. Suitable for all levels, this experience will help you connect with your inner self and prepare for the day ahead.',
    category: 'wellness',
    location: {
      city: 'Islamabad',
      address: 'Margalla Hills Trail 3',
      coordinates: { type: 'Point', coordinates: [73.0645, 33.7431] }
    },
    tags: ['wellness', 'yoga', 'nature', 'morning'],
    includes: ['Yoga mat', 'Herbal tea', 'Guided meditation'],
    notIncluded: ['Transportation'],
    price: 25,
    duration: 90,
    availability: [
       { date: new Date(Date.now() + 86400000*1), startTime: '06:30', slots: 15 },
       { date: new Date(Date.now() + 86400000*4), startTime: '06:30', slots: 15 }
    ],
    photos: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80'],
    isFeatured: false,
    rating: { average: 4.9, count: 15 }
  },
  {
    title: 'Traditional Calligraphy Workshop',
    description: 'Learn the ancient art of calligraphy from a master artisan. In this hands-on workshop, you will learn the basic strokes and techniques, and create your own masterpiece to take home.',
    category: 'art',
    location: {
      city: 'Karachi',
      address: 'Clifton Art Gallery',
      coordinates: { type: 'Point', coordinates: [67.0118, 24.8213] }
    },
    tags: ['art', 'workshop', 'cultural'],
    includes: ['Calligraphy kit', 'Canvas', 'Refreshments'],
    notIncluded: ['Frame for the artwork'],
    price: 60,
    duration: 120,
    availability: [
       { date: new Date(Date.now() + 86400000*5), startTime: '14:00', slots: 5 }
    ],
    photos: ['https://images.unsplash.com/photo-1580228475267-313550e5008f?auto=format&fit=crop&q=80'],
    isFeatured: true,
    rating: { average: 5.0, count: 8 }
  },
  {
    title: 'Sunset Boat Tour & Hidden Beaches',
    description: 'Set sail in the late afternoon to explore coastal secrets usually inaccessible by land. We will stop at a hidden inlet for a quick swim and enjoy a freshly prepared local snack while watching a breathtaking sunset from the water.',
    category: 'tour',
    location: {
      city: 'Karachi',
      address: 'Kemari Boat Basin',
      coordinates: { type: 'Point', coordinates: [66.9833, 24.8152] }
    },
    tags: ['boat', 'ocean', 'sunset'],
    includes: ['Boat ride', 'Life jacket', 'Local snacks', 'Refreshments'],
    notIncluded: ['Swimwear'],
    price: 35,
    duration: 150,
    availability: [
      { date: new Date(Date.now() + 86400000*2), startTime: '16:00', slots: 20 },
      { date: new Date(Date.now() + 86400000*3), startTime: '16:00', slots: 20 }
    ],
    photos: ['https://images.unsplash.com/photo-1512403754473-27835f7b9984?auto=format&fit=crop&q=80'],
    isFeatured: false,
    rating: { average: 4.7, count: 12 }
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('Connected to Database');

    // Make sure we have a Host user
    let user = await User.findOne({ role: 'host' });
    if (!user) {
      console.log('No host found, creating one...');
      user = new User({
        name: 'Jane Doe',
        email: 'host@example.com',
        password: 'password123',
        role: 'host',
        bio: 'Passionate about sharing my local culture.'
      });
      await user.save();
    }
    
    console.log('Using Host ID:', user._id);
    
    // Clear old experiences optionally if needed:
    // await Experience.deleteMany({});
    
    const experiencesToInsert = dummyExperiences.map(exp => {
      return { ...exp, hostId: user._id };
    });
    
    await Experience.insertMany(experiencesToInsert);
    console.log(`Successfully inserted ${experiencesToInsert.length} experiences!`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
};

seedDB();
