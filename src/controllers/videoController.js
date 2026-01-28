import {
  videoGenerationService,
} from '../services/videoGenerationService.js';
import { Project } from '../models/Project.js';
import { Scene } from '../models/Scene.js';

export const generateVideo = async (req, res) => {
  try {
    const { sceneId, projectId, quality, resolution, aspectRatio, prompt, duration, style, captions } = req.body;

    if (!sceneId && !prompt) {
      return res
        .status(400)
        .json({ message: 'Scene ID or prompt required' });
    }

    // In development mode, allow generation without database lookup
    const videoPrompt = prompt || `Video scene ${sceneId}`;
    
    // Direct call to Google Video Service
    const { googleVideoService } = await import('../services/googleVideoService.js');
    
    const job = await googleVideoService.generateVideo(videoPrompt, {
      quality: quality || 'standard',
      resolution: resolution || '1080p',
      aspectRatio: aspectRatio || '16:9',
      duration: duration || 5, // Use duration from request, default to 5 seconds
      style: style, // Pass style preference
      captions: captions, // Pass caption settings
      projectId: projectId, // Pass projectId for GCS organization
    });

    res.status(202).json({
      message: 'Video generation queued',
      data: {
        jobId: job.jobId,
        status: job.status,
        sceneId: sceneId,
      },
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const generateVoiceOver = async (req, res) => {
  try {
    const { sceneId, projectId, text, voiceType } = req.body;

    if (!sceneId && !text) {
      return res
        .status(400)
        .json({ message: 'Scene ID or text required' });
    }

    // Direct call to Google TTS Service
    const { googleTTSService } = await import('../services/googleTTSService.js');
    
    const voiceText = text || 'This is a sample voice-over for your video scene.';
    
    // Map frontend voice types to Google TTS voice names
    const voiceMap = {
      'male-professional': 'en-US-Neural2-A',
      'female-professional': 'en-US-Neural2-C',
      'male-casual': 'en-US-Neural2-E',
      'female-casual': 'en-US-Neural2-F',
    };
    
    const selectedVoice = voiceMap[voiceType] || 'en-US-Neural2-A';
    
    const result = await googleTTSService.generateSpeech(voiceText, {
      voiceName: selectedVoice,
      rate: 1.0,
      pitch: 0,
    });

    // Save the audio file
    const filename = `voiceover_${sceneId || Date.now()}.mp3`;
    const audioPath = await googleTTSService.saveAudioToFile(result.audioContent, filename);

    res.status(200).json({
      message: 'Voice-over generated successfully',
      data: {
        audioUrl: `/uploads/audio/${filename}`,
        sceneId: sceneId,
      },
    });
  } catch (error) {
    console.error('Voice-over generation error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Direct call to Google Video Service
    const { googleVideoService } = await import('../services/googleVideoService.js');
    const status = await googleVideoService.getVideoStatus(jobId);

    res.status(200).json({
      message: 'Job status retrieved',
      data: {
        job: {
          ...status,
          videoUrl: status.videoUrl || null, // Include GCS URL if available
        },
      },
    });
  } catch (error) {
    console.error('Job status error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const compileProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify ownership (skip in development for local testing)
    let project = null;
    if (process.env.NODE_ENV !== 'development') {
      project = await Project.findById(projectId);
      if (project.userId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      project = await Project.findById(projectId).catch(() => null);
    }

    // Check all scenes are complete
    const scenes = await Scene.find({ projectId });
    const allComplete = scenes.every(
      (scene) =>
        scene.videoStatus === 'completed' &&
        (!scene.voiceSettings.enabled || scene.voiceOverStatus === 'completed')
    );

    if (!allComplete) {
      return res.status(400).json({
        message: 'Not all scenes are ready for compilation',
        sceneStatuses: scenes.map((s) => ({
          sceneId: s._id,
          videoStatus: s.videoStatus,
          voiceOverStatus: s.voiceOverStatus,
        })),
      });
    }

    // Compile videos (placeholder)
    const compiledVideoUrl = await compileVideos(scenes, project);

    // Update project
    const updated = await Project.findByIdAndUpdate(
      projectId,
      {
        finalVideoUrl: compiledVideoUrl,
        finalVideoStatus: 'completed',
        status: 'completed',
        'metadata.generationEndTime': new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Project compiled successfully',
      data: {
        projectId: updated._id,
        videoUrl: compiledVideoUrl,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const downloadVideo = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify access (skip in development for local testing)
    const project = await Project.findById(projectId);
    if (process.env.NODE_ENV !== 'development') {
      if (
        project.userId.toString() !== req.userId &&
        !project.sharedWith.some((item) => item.userId === req.userId)
      ) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (!project.finalVideoUrl) {
      return res
        .status(400)
        .json({ message: 'Video not yet compiled or available' });
    }

    // Increment download count
    await Project.findByIdAndUpdate(projectId, {
      downloadCount: project.downloadCount + 1,
    });

    res.status(200).json({
      message: 'Download started',
      data: {
        downloadUrl: project.finalVideoUrl,
        fileName: `${project.title}.mp4`,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Compile multiple video segments into final MP4
 * Placeholder - actual implementation uses FFmpeg or similar
 */
async function compileVideos(scenes, project) {
  try {
    // In real implementation:
    // 1. Download all scene videos
    // 2. Use FFmpeg to concatenate with transitions
    // 3. Add voice-overs and audio bed
    // 4. Export as MP4
    // 5. Upload to storage

    return `https://storage.example.com/projects/${project._id}_final.mp4`;
  } catch (error) {
    throw new Error(`Video compilation failed: ${error.message}`);
  }
}
