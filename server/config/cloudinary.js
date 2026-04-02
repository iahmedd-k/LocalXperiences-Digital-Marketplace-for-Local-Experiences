const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

const uploadExperiencePhotos = multer({ storage: createStorage('localxperiences/experiences') }).array('photos', 10);
const uploadProfilePic = multer({ storage: createStorage('localxperiences/profiles') }).single('profilePic');
const uploadReviewPhotos = multer({ storage: createStorage('localxperiences/reviews') }).array('photos', 5);
const uploadStoryAssets = multer({ storage: createStorage('localxperiences/stories') }).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'sectionImages', maxCount: 12 },
]);

module.exports = { cloudinary, uploadExperiencePhotos, uploadProfilePic, uploadReviewPhotos, uploadStoryAssets };
