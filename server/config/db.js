const mongoose = require('mongoose');

const ensureReviewIndexes = async () => {
  const reviewsCollection = mongoose.connection.collection('reviews');

  try {
    const indexes = await reviewsCollection.indexes();
    const bookingIndex = indexes.find((idx) => idx.name === 'bookingId_1');

    const isLegacyUniqueIndex = bookingIndex
      && bookingIndex.unique
      && !bookingIndex.partialFilterExpression;

    if (isLegacyUniqueIndex) {
      await reviewsCollection.dropIndex('bookingId_1');
      console.log('ℹ️ Dropped legacy reviews.bookingId_1 index');
    }

    await reviewsCollection.createIndex(
      { bookingId: 1 },
      {
        name: 'bookingId_1',
        unique: true,
        partialFilterExpression: { bookingId: { $type: 'objectId' } },
      }
    );
  } catch (error) {
    // Namespace not found can happen on fresh DB before any document exists.
    if (error.codeName !== 'NamespaceNotFound') {
      throw error;
    }
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localxperiences';
  try {
    await mongoose.connect(uri);
    await ensureReviewIndexes();

    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = { connectDB };
