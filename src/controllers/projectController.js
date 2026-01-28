import {
  createProject,
  getProjectById,
  getUserProjects,
  updateProject,
  deleteProject,
  addSceneToProject,
  updateScene,
  deleteScene,
  reorderScenes,
  generateShareToken,
  getProjectByShareToken,
  shareProjectWithUser,
  removeShareAccess,
} from '../services/projectService.js';

export const createProjectHandler = async (req, res) => {
  try {
    console.log('createProjectHandler req.userId=', req.userId);
    console.log('createProjectHandler body=', JSON.stringify(req.body));
    const { title, description, videoSettings, template } = req.body;

    const project = await createProject(req.userId, {
      title,
      description,
      videoSettings,
      template,
    });

    res.status(201).json({
      message: 'Project created',
      data: project,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await getProjectById(req.params.projectId);

    // Verify ownership or shared access
    if (
      project.userId.toString() !== req.userId &&
      !project.sharedWith.some((item) => item.userId === req.userId)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({
      message: 'Project retrieved',
      data: project,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const listProjects = async (req, res) => {
  try {
    const projects = await getUserProjects(req.userId);

    res.status(200).json({
      message: 'Projects retrieved',
      data: projects,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProjectHandler = async (req, res) => {
  try {
    const project = await getProjectById(req.params.projectId);

    if (project.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await updateProject(req.params.projectId, req.body);

    res.status(200).json({
      message: 'Project updated',
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProjectHandler = async (req, res) => {
  try {
    const project = await getProjectById(req.params.projectId);

    if (project.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await deleteProject(req.params.projectId);

    res.status(200).json({
      message: 'Project deleted',
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addScene = async (req, res) => {
  try {
    const project = await getProjectById(req.params.projectId);

    if (project.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const scene = await addSceneToProject(req.params.projectId, req.body);

    res.status(201).json({
      message: 'Scene added',
      data: scene,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSceneHandler = async (req, res) => {
  try {
    const scene = await updateScene(req.params.sceneId, req.body);

    res.status(200).json({
      message: 'Scene updated',
      data: scene,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSceneHandler = async (req, res) => {
  try {
    await deleteScene(req.params.sceneId);

    res.status(200).json({
      message: 'Scene deleted',
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const reorderScenesHandler = async (req, res) => {
  try {
    const { sceneOrder } = req.body;
    const project = await reorderScenes(req.params.projectId, sceneOrder);

    res.status(200).json({
      message: 'Scenes reordered',
      data: project,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const shareProject = async (req, res) => {
  try {
    const project = await getProjectById(req.params.projectId);

    if (project.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { email, permission } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const updated = await shareProjectWithUser(
      req.params.projectId,
      email,
      permission || 'view'
    );

    res.status(200).json({
      message: 'Project shared',
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSharedProject = async (req, res) => {
  try {
    const project = await getProjectByShareToken(req.params.shareToken);

    res.status(200).json({
      message: 'Shared project retrieved',
      data: project,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const removeShare = async (req, res) => {
  try {
    const project = await getProjectById(req.params.projectId);

    if (project.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await removeShareAccess(
      req.params.projectId,
      req.params.email
    );

    res.status(200).json({
      message: 'Share removed',
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
