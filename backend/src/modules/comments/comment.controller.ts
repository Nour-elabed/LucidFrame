import { Request, Response, NextFunction } from 'express';
import * as CommentService from './comment.service';
import { sendSuccess } from '../../utils/response.utils';

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const comments = await CommentService.getCommentsByPost(req.params.postId);
    sendSuccess(res, comments, 'Comments retrieved');
  } catch (err) {
    next(err);
  }
};

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
      return;
    }

    const comment = await CommentService.addComment(
      req.params.postId,
      req.user!.userId,
      text
    );

    sendSuccess(res, comment, 'Comment added', 201);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    await CommentService.deleteComment(commentId, userId);

    sendSuccess(res, { deleted: true }, 'Comment deleted');
  } catch (err) {
    next(err);
  }
};
