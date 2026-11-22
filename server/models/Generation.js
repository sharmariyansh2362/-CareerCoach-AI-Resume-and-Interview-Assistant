const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    type: {
      type: String,
      enum: {
        values: ['resume', 'interview'],
        message: '{VALUE} is not a valid generation type (must be resume or interview)'
      },
      required: [true, 'Generation type is required']
    },
    targetRole: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true
    },
    outputContent: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Generated output content is required']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Compound index on { userId: 1, createdAt: -1 } for fast user history and rate limit queries
generationSchema.index({ userId: 1, createdAt: -1 });

const Generation = mongoose.model('Generation', generationSchema);
module.exports = Generation;
