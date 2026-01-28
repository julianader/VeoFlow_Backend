import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    thumbnail: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'generating', 'completed', 'failed'],
      default: 'draft',
    },
    visibility: {
      type: String,
      enum: ['private', 'shared', 'public'],
      default: 'private',
    },
    sharedWith: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        email: String,
        permission: {
          type: String,
          enum: ['view', 'edit'],
        },
      },
    ],
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    videoSettings: {
      quality: {
        type: String,
        enum: ['fast', 'standard', 'high'],
        default: 'standard',
      },
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
      audioTrack: {
        enabled: Boolean,
        audioUrl: String,
        volume: Number,
      },
    },
    scenes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scene',
      },
    ],
    finalVideoUrl: {
      type: String,
      default: null,
    },
    finalVideoStatus: {
      type: String,
      enum: ['pending', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    template: {
      type: String,
      default: null,
    },
    tags: [String],
    metadata: {
      generationStartTime: Date,
      generationEndTime: Date,
      processingTimeMs: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model('Project', projectSchema);
