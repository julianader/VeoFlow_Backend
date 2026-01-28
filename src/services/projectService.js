import { Project } from '../models/Project.js';
import { Scene } from '../models/Scene.js';
import { v4 as uuidv4 } from 'uuid';

export const createProject = async (userId, projectData) => {
  try {
    const project = new Project({
      userId,
      title: projectData.title || 'Untitled Project',
      description: projectData.description || '',
      videoSettings: projectData.videoSettings || {
        quality: 'standard',
        aspectRatio: '16:9',
        resolution: '1080p',
        audioTrack: {
          enabled: false,
        },
      },
      template: projectData.template || null,
    });

    await project.save();
    return project;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getProjectById = async (projectId) => {
  try {
    const project = await Project.findById(projectId).populate('scenes');
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getUserProjects = async (userId) => {
  try {
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    return projects;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateProject = async (projectId, updateData) => {
  try {
    const project = await Project.findByIdAndUpdate(projectId, updateData, {
      new: true,
    }).populate('scenes');

    return project;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteProject = async (projectId) => {
  try {
    // Delete all associated scenes
    await Scene.deleteMany({ projectId });

    // Delete project
    const project = await Project.findByIdAndDelete(projectId);
    return project;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addSceneToProject = async (projectId, sceneData) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const sceneCount = await Scene.countDocuments({ projectId });

    const scene = new Scene({
      projectId,
      title: sceneData.title || `Scene ${sceneCount + 1}`,
      description: sceneData.description || '',
      script: sceneData.script || '',
      order: sceneCount,
      duration: sceneData.duration || 5000,
      stylePreset: sceneData.stylePreset || 'professional',
      voiceSettings: sceneData.voiceSettings || {
        enabled: false,
        voice: 'en-US-Neural2-A',
        speed: 1.0,
      },
      metadata: sceneData.metadata || {
        aspectRatio: '16:9',
        resolution: '1080p',
      },
    });

    await scene.save();
    project.scenes.push(scene._id);
    await project.save();

    return scene;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateScene = async (sceneId, updateData) => {
  try {
    const scene = await Scene.findByIdAndUpdate(sceneId, updateData, {
      new: true,
    });

    return scene;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteScene = async (sceneId) => {
  try {
    const scene = await Scene.findById(sceneId);
    if (!scene) {
      throw new Error('Scene not found');
    }

    // Remove from project
    await Project.findByIdAndUpdate(scene.projectId, {
      $pull: { scenes: sceneId },
    });

    // Delete scene
    await Scene.findByIdAndDelete(sceneId);

    return scene;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const reorderScenes = async (projectId, sceneOrder) => {
  try {
    // sceneOrder should be an array of sceneIds in new order
    for (let i = 0; i < sceneOrder.length; i++) {
      await Scene.findByIdAndUpdate(sceneOrder[i], { order: i });
    }

    const project = await Project.findById(projectId).populate('scenes');
    return project;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const generateShareToken = async (projectId) => {
  try {
    const token = uuidv4();
    const project = await Project.findByIdAndUpdate(
      projectId,
      { shareToken: token, visibility: 'shared' },
      { new: true }
    );

    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getProjectByShareToken = async (shareToken) => {
  try {
    const project = await Project.findOne({ shareToken }).populate('scenes');
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const shareProjectWithUser = async (projectId, email, permission) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if already shared
    const alreadyShared = project.sharedWith.some(
      (item) => item.email === email
    );
    if (alreadyShared) {
      throw new Error('Already shared with this user');
    }

    project.sharedWith.push({
      email,
      permission,
    });

    await project.save();
    return project;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const removeShareAccess = async (projectId, email) => {
  try {
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $pull: {
          sharedWith: { email },
        },
      },
      { new: true }
    );

    return project;
  } catch (error) {
    throw new Error(error.message);
  }
};
