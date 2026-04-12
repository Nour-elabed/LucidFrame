import { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';
import { sendSuccess } from '../../utils/response.utils';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: 'username, email and password are required' });
      return;
    }
    const result = await AuthService.registerUser(username, email, password);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'email and password are required' });
      return;
    }
    const result = await AuthService.loginUser(email, password);
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await AuthService.getUserById(req.user!.userId);
    sendSuccess(res, { user }, 'Current user');
  } catch (err) {
    next(err);
  }
};
