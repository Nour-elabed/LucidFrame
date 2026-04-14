import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import type { Post } from '../types';
import { postsService } from '../services/posts.service';
import { useAuthStore } from '../store/authStore';
import { usePostsStore } from '../store/postsStore';

interface PostCardProps {
  post: Post;
  index?: number;
  apiBase: string;
  onDeleted?: (postId: string) => void;
}

const getImageSrc = (url: string, base: string) =>
  url?.startsWith('http') ? url : `${base}${url}`;

export default function PostCard({
  post,
  index = 0,
  apiBase,
  onDeleted,
}: PostCardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { updateLikes } = usePostsStore();

  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const myId = (user as any)?._id || user?.id;

  // normalize owner ID safely
  const postOwnerId =
    typeof post.userId === 'object'
      ? (post.userId as any)?._id
      : post.userId;

  const isOwner =
    isAuthenticated && !!myId && postOwnerId?.toString() === myId;

  const hasLiked =
    isAuthenticated && !!myId && post.likes.includes(myId);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || liking) return;

    setLiking(true);
    try {
      const result = await postsService.likePost(post._id);
      updateLikes(post._id, result.likes);
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Delete this post?')) return;

    setDeleting(true);
    try {
      await postsService.deletePost(post._id);
      onDeleted?.(post._id);
    } catch {
      alert('Failed to delete post.');
    } finally {
      setDeleting(false);
    }
  };

  const username = (post.userId as any)?.username || 'Unknown';
  const avatarLetter = username[0]?.toUpperCase() || 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.4 }}
      className="w-full mb-8"
    >
      <div className="bg-card border border-border/40 rounded-2xl premium-shadow flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            {avatarLetter}
          </div>

          <span className="text-sm font-semibold text-foreground">
            {username}
          </span>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Image */}
        <Link to={`/post/${post._id}`}>
          <div className="w-full bg-black/5 flex items-center justify-center">
            <img
              src={getImageSrc(post.imageUrl, apiBase)}
              alt={post.caption}
              loading="lazy"
              className="w-full max-h-[600px] object-cover"
            />
          </div>
        </Link>

        {/* Actions */}
        <div className="p-4 flex flex-col gap-3">

          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`transition-transform hover:scale-110 active:scale-95 ${
                hasLiked || liking ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              <Heart
                className={`w-6 h-6 ${
                  hasLiked || liking ? 'fill-current' : ''
                }`}
              />
            </button>

            <Link
              to={`/post/${post._id}`}
              className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-semibold">
                {post.commentsCount ?? 0}
              </span>
            </Link>
          </div>

          <span className="text-sm font-semibold text-foreground">
            {post.likes.length}{' '}
            {post.likes.length === 1 ? 'like' : 'likes'}
          </span>

          {post.caption && (
            <div className="text-sm leading-relaxed">
              <span className="font-semibold text-foreground mr-2">
                {username}
              </span>
              <span className="text-foreground/90">
                {post.caption}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}