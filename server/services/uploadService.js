const { cloudinary } = require('../config/cloudinary');

// ─── Delete a single image by public ID ───────────────────────────────────
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // Extract public ID from Cloudinary URL
    // e.g. https://res.cloudinary.com/demo/image/upload/v123/localxperiences/experiences/abc123.jpg
    // public ID = localxperiences/experiences/abc123
    const parts    = imageUrl.split('/');
    const fileName = parts[parts.length - 1].split('.')[0];
    const folder   = parts[parts.length - 2];
    const publicId = `${folder}/${fileName}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Image delete error:', err.message);
  }
};

// ─── Delete multiple images ────────────────────────────────────────────────
const deleteImages = async (imageUrls = []) => {
  await Promise.all(imageUrls.map((url) => deleteImage(url)));
};

// ─── Delete a specific photo from an experience's photo array ─────────────
const deleteExperiencePhoto = async (experience, photoUrl) => {
  await deleteImage(photoUrl);
  experience.photos = experience.photos.filter((p) => p !== photoUrl);
  await experience.save();
  return experience;
};

module.exports = { deleteImage, deleteImages, deleteExperiencePhoto };