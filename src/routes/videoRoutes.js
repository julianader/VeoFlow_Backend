import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  generateVideo,
  generateVoiceOver,
  getJobStatus,
  compileProject,
  downloadVideo,
} from '../controllers/videoController.js';

const router = express.Router();

/**
 * @swagger
 * /api/videos/generate-video:
 *   post:
 *     tags:
 *       - Video Generation
 *     summary: Generate video
 *     description: Queue a video generation job for a scene
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VideoGenerationRequest'
 *     responses:
 *       202:
 *         description: Video generation queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     sceneId:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/generate-video', authMiddleware, generateVideo);

/**
 * @swagger
 * /api/videos/generate-voiceover:
 *   post:
 *     tags:
 *       - Voice Generation
 *     summary: Generate voice-over
 *     description: Generate text-to-speech voice-over for a scene
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoiceOverRequest'
 *     responses:
 *       200:
 *         description: Voice-over generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     sceneId:
 *                       type: string
 *                     audioUrl:
 *                       type: string
 *                     estimatedDuration:
 *                       type: number
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/generate-voiceover', authMiddleware, generateVoiceOver);

/**
 * @swagger
 * /api/videos/job/{jobId}:
 *   get:
 *     tags:
 *       - Video Generation
 *     summary: Get job status
 *     description: Check the status of a video generation job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobStatus'
 *       404:
 *         description: Job not found
 */
router.get('/job/:jobId', authMiddleware, getJobStatus);

/**
 * @swagger
 * /api/videos/compile/{projectId}:
 *   post:
 *     tags:
 *       - Video Compilation
 *     summary: Compile project
 *     description: Compile all scenes into a final MP4 video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project compiled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: string
 *                     videoUrl:
 *                       type: string
 *       400:
 *         description: Not all scenes ready
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 */
router.post('/compile/:projectId', authMiddleware, compileProject);

/**
 * @swagger
 * /api/videos/download/{projectId}:
 *   get:
 *     tags:
 *       - Video Download
 *     summary: Download video
 *     description: Get download link for compiled project video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download link provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     downloadUrl:
 *                       type: string
 *                     fileName:
 *                       type: string
 *       400:
 *         description: Video not compiled
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 */
router.get('/download/:projectId', authMiddleware, downloadVideo);

export default router;
