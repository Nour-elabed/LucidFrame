import { Request, Response, NextFunction } from 'express';
import * as PostService from './post.service';
import { sendSuccess } from '../../utils/response.utils';
import path from 'path';

export const getFeed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const result = await PostService.getFeed(page, limit);
    sendSuccess(res, result, 'Feed retrieved');
  } catch (err) {
    next(err);
  }
};

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await PostService.getPostById(req.params.id);
    sendSuccess(res, post, 'Post retrieved');
  } catch (err) {
    next(err);
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { caption, imageUrl } = req.body;
    let finalImageUrl = imageUrl;

    // If file was uploaded via multer, build the URL
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    if (!finalImageUrl) {
      res.status(400).json({ success: false, message: 'Image URL or file is required' });
      return;
    }

    const post = await PostService.createPost(req.user!.userId, finalImageUrl, caption || '');
    sendSuccess(res, post, 'Post created', 201);
  } catch (err) {
    next(err);
  }
};

export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await PostService.toggleLike(req.params.id, req.user!.userId);
    // Return both the count and the full array of user IDs
    const likesArray = post.likes.map((id: any) => id.toString());
    sendSuccess(res, { likes: post.likes.length, likesArray }, 'Like updated');
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await PostService.deletePost(req.params.id, req.user!.userId);
    sendSuccess(res, result, 'Post deleted');
  } catch (err) {
    next(err);
  }
};
