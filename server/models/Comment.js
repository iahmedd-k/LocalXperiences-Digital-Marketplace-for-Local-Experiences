const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    experienceId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Experience',
      required: true,
    },
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    text: {
      type:      String,
      required:  [true, 'Comment text is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

commentSchema.index({ experienceId: 1 });

module.exports = mongoose.model('Comment', commentSchema);