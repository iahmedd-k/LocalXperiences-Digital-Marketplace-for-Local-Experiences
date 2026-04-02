import img1 from "./assets/img1.jpg";
import img2 from "./assets/img2.jpg";
import img3 from "./assets/img3.jpg";
import img4 from "./assets/img4.jpg";

export const SLIDES = [
  {
    url: img1,
    city: "Islamabad",
  },
  {
    url: img2,
    city: "Lahore",
  },
  {
    url: img3,
    city: "Skardu",
  },
  {
    url: img4,
    city: "Hunza",
  },
];

export const CHIPS = [
  { label: "Food Trails", icon: "FT" },
  { label: "Culture", icon: "CU" },
  { label: "Workshops", icon: "WS" },
  { label: "Adventure", icon: "AD" },
];

export const STATS = [
  { val: "2.4k+", lbl: "Experiences" },
  { val: "54+", lbl: "Cities" },
  { val: "4.9", lbl: "Average Rating" },
];

export const NEAR_YOU = [
  {
    _id: "near-1",
    title: "Old City Food Walk",
    img: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    reviews: 189,
    price: 29,
  },
  {
    _id: "near-2",
    title: "Margalla Sunrise Hike",
    img: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80",
    rating: 4.9,
    reviews: 114,
    price: 24,
  },
  {
    _id: "near-3",
    title: "Truck Art Workshop",
    img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    reviews: 72,
    price: 35,
  },
  {
    _id: "near-4",
    title: "Handcrafted Pottery Session",
    img: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=900&q=80",
    rating: 4.9,
    reviews: 98,
    price: 31,
  },
];

export const CATEGORIES_LIST = [
  { label: "All", icon: "All" },
  { label: "Food & Drink", icon: "Food" },
  { label: "Culture", icon: "Culture" },
  { label: "Workshops", icon: "Work" },
  { label: "Adventure", icon: "Adventure" },
  { label: "Nature", icon: "Nature" },
  { label: "Photography", icon: "Photo" },
  { label: "City Tours", icon: "City" },
  { label: "Events", icon: "Events" },
];

export const TRENDING_DATA = [
  {
    _id: "tr-1",
    title: "Sufi Music Evening",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    category: "Events",
    price: 32,
    duration: "2h",
    city: "Lahore",
    rating: 4.9,
    reviews: 205,
  },
  {
    _id: "tr-2",
    title: "Street Food Masterclass",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    category: "Food & Drink",
    price: 38,
    duration: "3h",
    city: "Karachi",
    rating: 4.8,
    reviews: 178,
  },
  {
    _id: "tr-3",
    title: "Ancient Fort Heritage Tour",
    img: "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=900&q=80",
    category: "Culture",
    price: 26,
    duration: "2.5h",
    city: "Multan",
    rating: 4.7,
    reviews: 133,
  },
  {
    _id: "tr-4",
    title: "City Portrait Walk",
    img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
    category: "Photography",
    price: 29,
    duration: "2h",
    city: "Islamabad",
    rating: 4.8,
    reviews: 121,
  },
  {
    _id: "tr-5",
    title: "Northern Valley Trek",
    img: "https://images.unsplash.com/photo-1464822759844-d150ad6d1d2f?auto=format&fit=crop&w=900&q=80",
    category: "Adventure",
    price: 49,
    duration: "5h",
    city: "Skardu",
    rating: 4.9,
    reviews: 89,
  },
  {
    _id: "tr-6",
    title: "Botanical Gardens Escape",
    img: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80",
    category: "Nature",
    price: 21,
    duration: "1.5h",
    city: "Islamabad",
    rating: 4.7,
    reviews: 67,
  },
];

export const TESTIMONIALS = [
  {
    name: "Ayesha Rahman",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    location: "Karachi",
    experience: "Food Trail",
    rating: 5,
    text: "Everything felt seamless, from discovery to checkout. The host was outstanding and the whole group had an amazing time.",
  },
  {
    name: "Hamza Ali",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    location: "Lahore",
    experience: "Cultural Walk",
    rating: 5,
    text: "The platform helped me find a hidden gem in minutes. The experience quality and host communication were both excellent.",
  },
  {
    name: "Sana Khan",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    location: "Islamabad",
    experience: "Workshop",
    rating: 5,
    text: "I booked for my visiting friends and it turned into the highlight of their trip. Definitely using LocalXperiences again.",
  },
  {
    name: "Bilal Saeed",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    location: "Peshawar",
    experience: "Adventure",
    rating: 4,
    text: "Clear details, fair pricing, and very smooth payment flow. Great trust factor compared to random social media listings.",
  },
];