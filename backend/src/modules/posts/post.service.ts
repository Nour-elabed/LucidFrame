import { PostModel, IPost } from './post.model';
import mongoose from 'mongoose';
import { getIO } from '../../sockets/socket.manager';
import { createError } from '../../middlewares/error.middleware';

export const createPost = async (
  userId: string,
  imageUrl: string,
  caption: string
): Promise<IPost> => {
  const post = await PostModel.create({ userId, imageUrl, caption });
  const populated = await post.populate('userId', 'username avatar');

  // Broadcast new post to all connected clients
  getIO().emit('new-post', populated);
  return populated;
};

export const getFeed = async (page = 1, limit = 12): Promise<{ posts: any[]; total: number; page: number; totalPages: number }> => {
  const skip = (page - 1) * limit;
  const posts = await PostModel.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username avatar')
    .lean();

  const postsWithComments = await Promise.all(
    posts.map(async (p) => {
      const count = await mongoose.model('Comment').countDocuments({ postId: p._id });
      return { ...p, commentsCount: count };
    })
  );

  const total = await PostModel.countDocuments();
  return { posts: postsWithComments, total, page, totalPages: Math.ceil(total / limit) };
};

export const getPostById = async (postId: string) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw createError('Invalid post ID', 400);
  }
  const post = await PostModel.findById(postId).populate('userId', 'username avatar');
  if (!post) throw createError('Post not found', 404);
  return post;
};

export const toggleLike = async (postId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw createError('Invalid post ID', 400);
  }
  const post = await PostModel.findById(postId);
  if (!post) throw createError('Post not found', 404);

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const alreadyLiked = post.likes.some((id) => id.equals(userObjectId));

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => !id.equals(userObjectId));
  } else {
    post.likes.push(userObjectId);
  }

  await post.save();

  // Broadcast real-time like update
  getIO().emit('like-updated', { postId, likes: post.likes.length });
  return post;
};

export const deletePost = async (postId: string, userId: string) => {
  const post = await PostModel.findById(postId);
  if (!post) throw createError('Post not found', 404);
  if (post.userId.toString() !== userId) {
    throw createError('Not authorized to delete this post', 403);
  }
  await post.deleteOne();
  return { deleted: true };
};
