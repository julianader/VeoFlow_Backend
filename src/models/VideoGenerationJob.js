import mongoose from 'mongoose';

const videoGenerationJobSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    sceneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scene',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
    },
    script: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    quality: {
      type: String,
      enum: ['fast', 'standard', 'high'],
      default: 'standard',
    },
    resolution: {
      type: String,
      enum: ['720p', '1080p', '4k'],
      default: '1080p',
    },
    aspectRatio: {
      type: String,
      enum: ['16:9', '9:16', '1:1'],
      default: '16:9',
    },
    stylePreset: {
      type: String,
      enum: ['minimal', 'corporate', 'playful', 'professional', 'tech'],
      default: 'professional',
    },
    googleJobId: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    processingStartTime: Date,
    processingEndTime: Date,
  },
  {
    timestamps: true,
  }
);

export const VideoGenerationJob = mongoose.model(
  'VideoGenerationJob',
  videoGenerationJobSchema
);
