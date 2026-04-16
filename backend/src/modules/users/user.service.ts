import { UserModel } from '../auth/auth.model';
import { PostModel } from '../posts/post.model';
import { GeneratedImageModel } from '../ai/generated.model';

export const getUserStats = async (userId: string) => {
  const [totalPosts, totalGenerated] = await Promise.all([
    PostModel.countDocuments({ userId }),
    GeneratedImageModel.countDocuments({ userId }),
  ]);

  const recentActivity = await PostModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('caption imageUrl createdAt');

  return { totalPosts, totalGenerated, recentActivity };
};

export const getAdminStats = async () => {
  const [totalUsers, totalPosts] = await Promise.all([
    UserModel.countDocuments(),
    PostModel.countDocuments(),
    
  ]);

  const topPrompts = await GeneratedImageModel.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const totalGeneratedImages = await GeneratedImageModel.countDocuments();
  const recentUsers = await UserModel.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('username email role createdAt');

  return { totalUsers, totalPosts, totalGeneratedImages, topPrompts, recentUsers };
};
