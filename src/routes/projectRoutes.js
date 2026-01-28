import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createProjectHandler,
  getProject,
  listProjects,
  updateProjectHandler,
  deleteProjectHandler,
  addScene,
  updateSceneHandler,
  deleteSceneHandler,
  reorderScenesHandler,
  shareProject,
  getSharedProject,
  removeShare,
} from '../controllers/projectController.js';

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new project
 *     description: Create a new video project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags:
 *       - Projects
 *     summary: List all projects
 *     description: Retrieve all projects for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, createProjectHandler);
router.get('/', authMiddleware, listProjects);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get project details
 *     description: Retrieve details of a specific project
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
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *   put:
 *     tags:
 *       - Projects
 *     summary: Update project
 *     description: Update project details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Delete project
 *     description: Delete a project and all associated scenes
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
 *         description: Project deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 */
router.get('/:projectId', authMiddleware, getProject);
router.put('/:projectId', authMiddleware, updateProjectHandler);
router.delete('/:projectId', authMiddleware, deleteProjectHandler);

/**
 * @swagger
 * /api/projects/{projectId}/scenes:
 *   post:
 *     tags:
 *       - Scenes
 *     summary: Add scene to project
 *     description: Add a new scene to a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SceneRequest'
 *     responses:
 *       201:
 *         description: Scene created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scene'
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied
 */
router.post('/:projectId/scenes', authMiddleware, addScene);

/**
 * @swagger
 * /api/projects/scenes/{sceneId}:
 *   put:
 *     tags:
 *       - Scenes
 *     summary: Update scene
 *     description: Update scene details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sceneId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SceneRequest'
 *     responses:
 *       200:
 *         description: Scene updated successfully
 *       404:
 *         description: Scene not found
 *   delete:
 *     tags:
 *       - Scenes
 *     summary: Delete scene
 *     description: Delete a scene from a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sceneId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scene deleted successfully
 *       404:
 *         description: Scene not found
 */
router.put('/scenes/:sceneId', authMiddleware, updateSceneHandler);
router.delete('/scenes/:sceneId', authMiddleware, deleteSceneHandler);

/**
 * @swagger
 * /api/projects/{projectId}/reorder-scenes:
 *   post:
 *     tags:
 *       - Scenes
 *     summary: Reorder scenes
 *     description: Change the order of scenes in a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sceneOrder:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Scenes reordered successfully
 *       400:
 *         description: Bad request
 */
router.post('/:projectId/reorder-scenes', authMiddleware, reorderScenesHandler);

/**
 * @swagger
 * /api/projects/{projectId}/share:
 *   post:
 *     tags:
 *       - Sharing
 *     summary: Share project
 *     description: Share a project with another user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               permission:
 *                 type: string
 *                 enum: ['view', 'edit']
 *     responses:
 *       200:
 *         description: Project shared successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied
 */
router.post('/:projectId/share', authMiddleware, shareProject);

/**
 * @swagger
 * /api/projects/share/{shareToken}:
 *   get:
 *     tags:
 *       - Sharing
 *     summary: Get shared project
 *     description: Retrieve a project shared via share token (no auth required)
 *     parameters:
 *       - in: path
 *         name: shareToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shared project retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Share token not found
 */
router.get('/share/:shareToken', getSharedProject);

/**
 * @swagger
 * /api/projects/{projectId}/share/{email}:
 *   delete:
 *     tags:
 *       - Sharing
 *     summary: Remove share access
 *     description: Remove sharing access for a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Share access removed
 *       403:
 *         description: Access denied
 */
router.delete('/:projectId/share/:email', authMiddleware, removeShare);

export default router;
