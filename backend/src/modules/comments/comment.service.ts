import { CommentModel, IComment } from './comment.model';
import mongoose from 'mongoose';
import { getIO } from '../../sockets/socket.manager';
import { createError } from '../../middlewares/error.middleware';

export const addComment = async (
  postId: string,
  userId: string,
  text: string
): Promise<IComment> => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw createError('Invalid post ID', 400);
  }

  const comment = await CommentModel.create({ postId, userId, text });
  const populated = await comment.populate('userId', 'username avatar');

  // Emit real-time event to all clients
  getIO().emit('new-comment', { postId, comment: populated });
  return populated;
};

export const getCommentsByPost = async (postId: string) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw createError('Invalid post ID', 400);
  }
  return CommentModel.find({ postId })
    .sort({ createdAt: -1 })
    .populate('userId', 'username avatar');
};
export const deleteComment = async (
  commentId: string,
  userId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw createError('Invalid comment ID', 400);
  }

  const comment = await CommentModel.findById(commentId);

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  // only owner can delete
  if (comment.userId.toString() !== userId) {
    throw createError('Not authorized to delete this comment', 403);
  }

  await comment.deleteOne();

  // optional real-time update (recommended)
  getIO().emit('delete-comment', {
    postId: comment.postId,
    commentId,
  });

  return { deleted: true };
};
