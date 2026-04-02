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
      default:  null,
    },
    guestName: {
      type:      String,
      trim:      true,
      maxlength: [80, 'Guest name cannot exceed 80 characters'],
      default:   null,
    },
    question: {
      type:      String,
      required:  [true, 'Question is required'],
      maxlength: [500, 'Question cannot exceed 500 characters'],
    },
    answer: {
      text:       { type: String, default: null },
      answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      answeredAt: { type: Date,   default: null },
    },
    replies: {
      type: [
        {
          text: {
            type: String,
            required: true,
            maxlength: [500, 'Reply cannot exceed 500 characters'],
          },
          repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
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