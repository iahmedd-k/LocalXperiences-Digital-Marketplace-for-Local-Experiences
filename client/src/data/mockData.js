export const MOCK_EXPERIENCES = [
  {
    _id: "exp1",
    title: "Pasta Making with Nonna Rosa",
    city: "Rome, Italy",
    price: 85,
    rating: 4.9,
    reviewsCount: 124,
    category: "Food & Drink",
    host: { name: "Rosa", avatar: "https://i.pravatar.cc/150?u=rosa" },
    photos: ["https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=800"],
    description: "Learn to make authentic Italian pasta from scratch in a cozy Roman kitchen.",
    highlights: ["Hands-on cooking class", "Wine tasting included", "Take home recipe book"],
    duration: "3 hours",
    maxGroupSize: 6,
    language: "English, Italian",
    availability: [
      { _id: "slot1", date: "2026-05-10T10:00:00.000Z", startTime: "10:00 AM", slots: 6, booked: 2 },
      { _id: "slot2", date: "2026-05-12T14:00:00.000Z", startTime: "2:00 PM", slots: 6, booked: 5 },
    ]
  },
  {
    _id: "exp2",
    title: "Hidden Kyoto Temple Walk",
    city: "Kyoto, Japan",
    price: 45,
    rating: 4.8,
    reviewsCount: 89,
    category: "Culture",
    host: { name: "Kenji", avatar: "https://i.pravatar.cc/150?u=kenji" },
    photos: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800"],
    description: "Discover the serene and less-visited temples of Kyoto with a local historian.",
    highlights: ["Visit 3 hidden temples", "Traditional tea ceremony", "Photography tips"],
    duration: "4 hours",
    maxGroupSize: 8,
    language: "English, Japanese",
    availability: [
      { _id: "slot1", date: "2026-05-11T09:00:00.000Z", startTime: "9:00 AM", slots: 8, booked: 0 },
      { _id: "slot2", date: "2026-05-14T09:00:00.000Z", startTime: "9:00 AM", slots: 8, booked: 8 },
    ]
  },
  {
    _id: "exp3",
    title: "Sunset Sailing Adventure",
    city: "Santorini, Greece",
    price: 150,
    rating: 5.0,
    reviewsCount: 201,
    category: "Adventure",
    host: { name: "Nikos", avatar: "https://i.pravatar.cc/150?u=nikos" },
    photos: ["https://images.unsplash.com/photo-1544644181-1484b3f8c853?q=80&w=800"],
    description: "Sail around the caldera of Santorini and enjoy a spectacular sunset with dinner.",
    highlights: ["Catamaran sailing", "BBQ dinner on board", "Snorkeling equipment provided"],
    duration: "5 hours",
    maxGroupSize: 12,
    language: "English, Greek",
    availability: [
      { _id: "slot1", date: "2026-06-01T15:00:00.000Z", startTime: "3:00 PM", slots: 12, booked: 6 },
    ]
  }
];

export const MOCK_USER = {
  _id: 'demo-user-123',
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'traveler',
  avatar: 'https://i.pravatar.cc/150?u=demo'
};

export const MOCK_BOOKINGS = [];
export const MOCK_ITINERARIES = [];
