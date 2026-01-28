import mongoose from 'mongoose';

const sceneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    script: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 5000, // milliseconds
    },
    videoUrl: {
      type: String,
      default: null,
    },
    videoStatus: {
      type: String,
      enum: ['pending', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
    voiceOverUrl: {
      type: String,
      default: null,
    },
    voiceOverStatus: {
      type: String,
      enum: ['pending', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
    voiceSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      voice: {
        type: String,
        enum: ['en-US-Neural2-A', 'en-US-Neural2-C', 'en-US-Neural2-E'],
        default: 'en-US-Neural2-A',
      },
      speed: {
        type: Number,
        min: 0.5,
        max: 2.0,
        default: 1.0,
      },
    },
    stylePreset: {
      type: String,
      enum: ['minimal', 'corporate', 'playful', 'professional', 'tech'],
      default: 'professional',
    },
    transitionType: {
      type: String,
      enum: ['fade', 'slide', 'zoom', 'cut'],
      default: 'fade',
    },
    thumbnail: {
      type: String,
      default: null,
    },
    metadata: {
      aspectRatio: {
        type: String,
        enum: ['16:9', '9:16', '1:1'],
        default: '16:9',
      },
      resolution: {
        type: String,
        enum: ['720p', '1080p', '4k'],
        default: '1080p',
      },
    },
    errors: [
      {
        type: String,
        timestamp: Date,
      },
    ],
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

export const Scene = mongoose.model('Scene', sceneSchema);
