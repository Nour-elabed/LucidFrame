import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, MessageCircle } from 'lucide-react';
import type { Post } from '../types';
import { postsService } from '../services/posts.service';
import { useAuthStore } from '../store/authStore';
import { usePostsStore } from '../store/postsStore';

interface PostCardProps {
  post: Post;
  index?: number;
  apiBase: string;
}

const getImageSrc = (url: string, base: string) =>
  url?.startsWith('http') ? url : `${base}${url}`;

export default function PostCard({ post, index = 0, apiBase }: PostCardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { updateLikes } = usePostsStore();
  const [liking, setLiking] = useState(false);

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

  const username = (post.userId as any)?.username || 'Unknown';
  const avatarLetter = username[0]?.toUpperCase() || 'U';
  const myId = (user as any)?._id || user?.id;
  const hasLiked = isAuthenticated && !!myId && post.likes.includes(myId);

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
          <span className="text-sm font-semibold text-foreground">{username}</span>
        </div>

        {/* Image */}
        <Link to={`/post/${post._id}`}>
          <div className="w-full bg-black/5 flex items-center justify-center">
            <img
              src={getImageSrc(post.imageUrl, apiBase)}
              alt={post.caption}
              loading="lazy"
              className="w-full max-h-[600px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/400x400?text=Image+unavailable';
              }}
            />
          </div>
        </Link>

        {/* Footer Actions & Caption */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`transition-transform hover:scale-110 active:scale-95 ${hasLiked || liking ? 'text-red-500' : 'text-gray-400'
                }`}
              disabled={liking}
            >
              <Heart className={`w-6 h-6 ${hasLiked || liking ? 'fill-current' : ''}`} />
            </button>
            <Link to={`/post/${post._id}`} className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-semibold">{post.commentsCount ?? 0}</span>
            </Link>
          </div>

          <span className="text-sm font-semibold text-foreground">
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
          </span>

          {post.caption && (
            <div className="text-sm leading-relaxed">
              <span className="font-semibold text-foreground mr-2">{username}</span>
              <span className="text-foreground/90">{post.caption}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
