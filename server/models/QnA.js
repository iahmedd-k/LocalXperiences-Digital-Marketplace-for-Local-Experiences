const mongoose = require('mongoose');

const qnaSchema = new mongoose.Schema(
  {
    experienceId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Experience',
      required: true,
    },
    askedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    question: {
      type:      String,
      required:  [true, 'Question is required'],
      maxlength: [500, 'Question cannot exceed 500 characters'],
    },
    answer: {
      text:       { type: String, default: null },
      answeredAt: { type: Date,   default: null },
    },
    isAnswered: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

qnaSchema.index({ experienceId: 1 });

module.exports = mongoose.model('QnA', qnaSchema);