import { Request, Response, NextFunction } from 'express';
import * as UserService from './user.service';
import { sendSuccess } from '../../utils/response.utils';

export const getMyStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await UserService.getUserStats(req.user!.userId);
    sendSuccess(res, stats, 'User stats retrieved');
  } catch (err) {
    next(err);
  }
};

export const getAdminStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await UserService.getAdminStats();
    sendSuccess(res, stats, 'Admin stats retrieved');
  } catch (err) {
    next(err);
  }
};
