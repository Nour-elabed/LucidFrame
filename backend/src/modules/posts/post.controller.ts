import { Request, Response, NextFunction } from 'express';
import * as PostService from './post.service';
import { sendSuccess } from '../../utils/response.utils';

export const getFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const result = await PostService.getFeed(page, limit);
    sendSuccess(res, result, 'Feed retrieved');
  } catch (err) { next(err); }
};

export const getPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await PostService.getPostById(req.params.id);
    sendSuccess(res, post, 'Post retrieved');
  } catch (err) { next(err); }
};

export const createPost = async (
  
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
const userId = req.user!.userId;

    if (!req.file) {
      res.status(400).json({ message: 'Image is required' });
      return;
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const caption = req.body.caption || '';

    const post = await PostService.createPost(userId, imageUrl, caption);

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

export const likePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await PostService.toggleLike(req.params.id, req.user!.userId);
    const likesArray = post.likes.map((id: any) => id.toString());
    sendSuccess(res, { likes: post.likes.length, likesArray }, 'Like updated');
  } catch (err) { next(err); }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await PostService.deletePost(req.params.id, req.user!.userId);
    sendSuccess(res, result, 'Post deleted');
  } catch (err) { next(err); }
};