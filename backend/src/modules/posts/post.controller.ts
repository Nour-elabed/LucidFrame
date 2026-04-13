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

export const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { caption, imageUrl } = req.body;
    let finalImageUrl = imageUrl;

    if (req.file) {
      // ✅ Build a full absolute URL so Vercel frontend can always reach it
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      finalImageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      
      console.log('[Post Controller] File uploaded, absolute URL:', finalImageUrl);
    }

    if (!finalImageUrl) {
      res.status(400).json({ success: false, message: 'Image URL or file is required' });
      return;
    }

    const post = await PostService.createPost(req.user!.userId, finalImageUrl, caption || '');
    sendSuccess(res, post, 'Post created', 201);
  } catch (err: any) {
    console.error('[Post Controller] Error:', err.message);
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