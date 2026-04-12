import { Request, Response, NextFunction } from 'express';
import { ChatMessageModel } from './chat.model';

export const getRecentMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await ChatMessageModel.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'username avatar');
    
    // Reverse logic: recent messages sent first, but we want chronological order for UI
    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    next(error);
  }
};
