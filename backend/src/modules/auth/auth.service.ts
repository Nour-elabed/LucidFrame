import bcrypt from 'bcryptjs';
import { UserModel } from './auth.model';
import { signToken } from '../../utils/jwt.utils';
import { createError } from '../../middlewares/error.middleware';

const SALT_ROUNDS = 12;

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  const existingUser = await UserModel.findOne({
    $or: [{ email }, { username }],
  });

  
  if (existingUser) {
    if (existingUser.email === email) {
      throw createError('Email already in use', 409);
    }
    throw createError('Username already taken', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await UserModel.create({ username, email, passwordHash });

  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const loginUser = async (email: string, password: string) => {
  // Must explicitly select passwordHash since it's excluded by default
  const user = await UserModel.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw createError('Invalid email or password', 401);
  }

  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    token,
  };
};

export const getUserById = async (userId: string) => {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw createError('User not found', 404);
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
};
