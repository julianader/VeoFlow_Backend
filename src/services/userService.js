import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

export const registerUser = async (email, password, firstName, lastName) => {
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await user.save();

    const token = generateToken(user._id.toString());

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription: user.subscription,
      },
      token,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id.toString());

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription: user.subscription,
      },
      token,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        profilePicture: updateData.profilePicture,
      },
      { new: true }
    );

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};
