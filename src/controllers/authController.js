import {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
} from '../services/userService.js';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await registerUser(email, password, firstName, lastName);

    res.status(201).json({
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const result = await loginUser(email, password);

    res.status(200).json({
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.userId);

    res.status(200).json({
      message: 'Profile retrieved',
      data: user,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, profilePicture } = req.body;

    const user = await updateUserProfile(req.userId, {
      firstName,
      lastName,
      profilePicture,
    });

    res.status(200).json({
      message: 'Profile updated',
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getQuotaInfo = async (req, res) => {
  try {
    const user = await getUserById(req.userId);

    const quotaInfo = {
      subscription: user.subscription,
      monthlyQuota: {
        videos: user.apiQuota.videosPerMonth,
        voiceOvers: user.apiQuota.voiceOversPerMonth,
      },
      usage: {
        videosThisMonth: user.apiUsage.videosThisMonth,
        voiceOversThisMonth: user.apiUsage.voiceOversThisMonth,
        lastReset: user.apiUsage.lastResetDate,
      },
      remainingQuota: {
        videos:
          user.apiQuota.videosPerMonth - user.apiUsage.videosThisMonth,
        voiceOvers:
          user.apiQuota.voiceOversPerMonth - user.apiUsage.voiceOversThisMonth,
      },
    };

    res.status(200).json({
      message: 'Quota info retrieved',
      data: quotaInfo,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
