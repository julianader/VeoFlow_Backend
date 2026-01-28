import { VideoGenerationJob } from '../models/VideoGenerationJob.js';
import { Scene } from '../models/Scene.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { googleVideoService } from './googleVideoService.js';
import { googleTTSService } from './googleTTSService.js';

class VideoGenerationService {
  /**
   * Queue video generation job
   */
  async queueVideoGeneration(userId, sceneId, projectId, options = {}) {
    try {
      const scene = await Scene.findById(sceneId);
      if (!scene) {
        throw new Error('Scene not found');
      }

      // Check user quota
      const user = await User.findById(userId);
      if (
        user.apiUsage.videosThisMonth >= user.apiQuota.videosPerMonth &&
        user.subscription === 'free'
      ) {
        throw new Error('Video generation quota exceeded');
      }

      // Create job
      const job = new VideoGenerationJob({
        projectId,
        sceneId,
        userId,
        script: scene.script,
        quality: options.quality || 'standard',
        resolution: options.resolution || '1080p',
        aspectRatio: options.aspectRatio || '16:9',
        stylePreset: options.stylePreset || scene.stylePreset,
        status: 'queued',
      });

      await job.save();

      // Queue with Google API
      const googleJob = await googleVideoService.generateVideo(
        scene.script,
        {
          duration: scene.duration / 1000, // convert to seconds
          quality: job.quality,
          aspectRatio: job.aspectRatio,
          resolution: job.resolution,
        }
      );

      job.googleJobId = googleJob.jobId;
      job.status = 'processing';
      job.processingStartTime = new Date();
      await job.save();

      // Update scene status
      await Scene.findByIdAndUpdate(sceneId, {
        videoStatus: 'generating',
      });

      // Update user usage
      await User.findByIdAndUpdate(userId, {
        'apiUsage.videosThisMonth': user.apiUsage.videosThisMonth + 1,
      });

      return job;
    } catch (error) {
      throw new Error(`Failed to queue video: ${error.message}`);
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId) {
    try {
      const job = await VideoGenerationJob.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // Check with Google API
      const status = await googleVideoService.getVideoStatus(job.googleJobId);

      return {
        jobId,
        status: job.status,
        progress: status.progress,
        estimatedTimeRemaining: status.estimatedTimeRemaining,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      };
    } catch (error) {
      throw new Error(`Failed to get job status: ${error.message}`);
    }
  }

  /**
   * Complete video generation job
   */
  async completeVideoGeneration(jobId, videoUrl) {
    try {
      const job = await VideoGenerationJob.findByIdAndUpdate(
        jobId,
        {
          status: 'completed',
          videoUrl,
          processingEndTime: new Date(),
        },
        { new: true }
      );

      // Update scene
      await Scene.findByIdAndUpdate(job.sceneId, {
        videoUrl,
        videoStatus: 'completed',
        duration: 5000, // Update with actual duration
      });

      return job;
    } catch (error) {
      throw new Error(`Failed to complete video: ${error.message}`);
    }
  }

  /**
   * Handle video generation failure
   */
  async failVideoGeneration(jobId, errorMessage) {
    try {
      const job = await VideoGenerationJob.findByIdAndUpdate(
        jobId,
        {
          status: 'failed',
          errorMessage,
          processingEndTime: new Date(),
          retryCount: (await VideoGenerationJob.findById(jobId)).retryCount + 1,
        },
        { new: true }
      );

      // Update scene
      await Scene.findByIdAndUpdate(job.sceneId, {
        videoStatus: 'failed',
        errors: [{ type: errorMessage, timestamp: new Date() }],
      });

      // Retry if possible
      if (job.retryCount < job.maxRetries) {
        // Queue for retry
        job.status = 'queued';
        await job.save();
      }

      return job;
    } catch (error) {
      throw new Error(`Failed to handle video error: ${error.message}`);
    }
  }

  /**
   * Generate voice-over for scene
   */
  async generateVoiceOver(userId, sceneId, projectId) {
    try {
      const scene = await Scene.findById(sceneId);
      if (!scene) {
        throw new Error('Scene not found');
      }

      // Check quota
      const user = await User.findById(userId);
      if (
        user.apiUsage.voiceOversThisMonth >=
          user.apiQuota.voiceOversPerMonth &&
        user.subscription === 'free'
      ) {
        throw new Error('Voice-over quota exceeded');
      }

      // Generate speech
      const speechResult = await googleTTSService.generateSpeech(
        scene.script,
        {
          voiceName: scene.voiceSettings.voice,
          rate: scene.voiceSettings.speed,
        }
      );

      // Upload audio
      const audioUrl = await this.uploadAudio(
        speechResult.audioContent,
        sceneId
      );

      // Update scene
      await Scene.findByIdAndUpdate(sceneId, {
        voiceOverUrl: audioUrl,
        voiceOverStatus: 'completed',
      });

      // Update user usage
      await User.findByIdAndUpdate(userId, {
        'apiUsage.voiceOversThisMonth': user.apiUsage.voiceOversThisMonth + 1,
      });

      return {
        sceneId,
        audioUrl,
        estimatedDuration: googleTTSService.estimateDuration(
          scene.script,
          scene.voiceSettings.speed
        ),
      };
    } catch (error) {
      throw new Error(`Failed to generate voice-over: ${error.message}`);
    }
  }

  /**
   * Upload audio to storage
   */
  async uploadAudio(audioContent, sceneId) {
    try {
      // Upload to GCS or S3
      // Placeholder - returns storage URL
      const fileName = `voiceover_${sceneId}_${Date.now()}.mp3`;
      return `https://storage.example.com/audio/${fileName}`;
    } catch (error) {
      throw new Error(`Failed to upload audio: ${error.message}`);
    }
  }
}

export const videoGenerationService = new VideoGenerationService();
