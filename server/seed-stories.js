const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Story = require('./models/Story');

const seedStories = async () => {
  try {
    await connectDB();
    console.log('Connected to Database');

    // Get a host
    const host = await User.findOne({ role: 'host' });
    if (!host) {
      throw new Error('No host found to associate data with. Run the first seed script.');
    }

    const dummyStories = [
      {
        hostId: host._id,
        title: 'The Hidden Magic of the Spice Bazaar',
        slug: 'hidden-magic-spice-bazaar',
        excerpt: 'Wandering through the oldest market in the city, where every scent tells a centuries-old story of trade and tradition.',
        coverImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80',
        coverImageAlt: 'Colorful spice mounds in a market',
        category: 'Cultural Heritage',
        locationLabel: 'Lahore, Pakistan',
        readTimeMinutes: 5,
        tags: ['market', 'history', 'spices'],
        isPublished: true,
        sections: [
          {
            heading: 'Sunrise at the Bazaar',
            body: 'Long before the tourists arrive, the bazaar is already alive with the sounds of merchants setting up their stalls. The scent of cardamom and cumin hangs thick in the cool morning air, a sensory prelude to the chaos that will soon follow.',
            image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80',
            imageCaption: 'Early morning light hitting the spice stalls',
            imagePosition: 'full'
          },
          {
            heading: 'Generations of Traders',
            body: 'I sat down with Mr. Tariq, whose family has been selling saffron here for four generations. He explained the intricate routes these tiny threads take before they reach his shop, and the skill required to distinguish the genuine article from imitations. His hands, stained slightly yellow, speak volumes of his lifelong dedication to this trade.',
          }
        ]
      },
      {
        hostId: host._id,
        title: 'Reviving Ancient Calligraphy',
        slug: 'reviving-ancient-calligraphy',
        excerpt: 'How a small workshop in the heart of the bustling metropolis is keeping the delicate art of traditional calligraphy alive for a new generation.',
        coverImage: 'https://images.unsplash.com/photo-1580228475267-313550e5008f?auto=format&fit=crop&q=80',
        coverImageAlt: 'A hand holding a bamboo pen over parchment',
        category: 'Art & Craft',
        locationLabel: 'Karachi, Pakistan',
        readTimeMinutes: 8,
        tags: ['art', 'calligraphy', 'workshop'],
        isPublished: true,
        sections: [
          {
            heading: 'The Rhythm of the Pen',
            body: 'There is a rhythm to traditional calligraphy. It is not merely writing; it is a meditation. The scratch of the bamboo qalam against specially polished paper is a sound that has echoed through these alleys for centuries.',
            image: 'https://images.unsplash.com/photo-1580228475267-313550e5008f?auto=format&fit=crop&q=80',
            imageCaption: 'The tools of the trade',
            imagePosition: 'right'
          },
          {
            heading: 'Passing the Torch',
            body: 'Master Ahmed, who leads the workshop, insists that patience is the first lesson. Students spend weeks merely learning how to carve their pens and prepare their ink before writing a single letter. In a fast-paced digital world, this slow, deliberate art form offers a necessary grounding.',
          }
        ]
      }
    ];

    await Story.insertMany(dummyStories);
    console.log(`Successfully inserted ${dummyStories.length} Stories!`);

    process.exit(0);
  } catch (err) {
    if (err.code === 11000) {
      console.log('Stories with these slugs already exist. Skipping.');
      process.exit(0);
    }
    console.error('Error seeding stories:', err);
    process.exit(1);
  }
};

seedStories();
