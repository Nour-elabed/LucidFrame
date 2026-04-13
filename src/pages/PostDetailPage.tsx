import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Send, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { postsService } from '../services/posts.service';
import { commentsService } from '../services/comments.service';
import type { Post, Comment } from '../types';
import { useAuthStore } from '../store/authStore';
import { usePostsStore } from '../store/postsStore';
import { getSocket, connectSocket } from '../lib/socket';
import CommentBubble from '../components/CommentBubble';
import { getApiOrigin } from '../lib/apiOrigin';

const API_BASE = getApiOrigin();

const getImageSrc = (url: string, base: string) =>
  !url ? '' : url.startsWith('http') ? url : `${base}${url}`;
export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const { updateLikes } = usePostsStore();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [p, c] = await Promise.all([
          postsService.getPost(id),
          commentsService.getComments(id),
        ]);
        setPost(p);
        setComments(c);
      } finally {
        setLoading(false);
      }
    };
    load();

    connectSocket();
    const socket = getSocket();
    socket.emit('join-post', id);

    socket.on('new-comment', ({ postId, comment }: { postId: string; comment: Comment }) => {
      if (postId === id) {
        setComments((prev) =>
          prev.find((c) => c._id === comment._id) ? prev : [comment, ...prev]
        );
      }
    });

    socket.on('like-updated', ({ postId, likes }: { postId: string; likes: number }) => {
      if (postId === id) {
        setPost((prev) => (prev ? { ...prev, likes: Array(likes).fill('') } : prev));
        updateLikes(postId, likes);
      }
    });

    return () => {
      socket.off('new-comment');
      socket.off('like-updated');
      socket.emit('leave-post', id);
    };
  }, [id]);

  const handleLike = async () => {
    if (!post || !isAuthenticated || liking) return;
    setLiking(true);
    try {
      await postsService.likePost(post._id);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post || !isAuthenticated) return;
    setSubmitting(true);
    try {
      await commentsService.addComment(post._id, commentText);
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to feed
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl overflow-hidden premium-shadow"
          >
            <img
              src={getImageSrc(post.imageUrl, API_BASE)}
              alt={post.caption}
              className="w-full object-cover"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {/* Meta */}
            <div className="glass rounded-2xl p-5 border border-border/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">
                  {(post.userId as any)?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {(post.userId as any)?.username || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {post.caption && (
                <p className="text-sm text-foreground/90 leading-relaxed">{post.caption}</p>
              )}
              {(() => {
                const myId = (user as any)?._id || user?.id;
                const hasLiked = isAuthenticated && !!myId && post.likes.includes(myId);
                return (
                  <button
                    onClick={handleLike}
                    disabled={!isAuthenticated || liking}
                    className={`mt-4 flex items-center gap-2 text-sm transition-colors ${
                      hasLiked || liking ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-400'
                    } disabled:opacity-50`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked || liking ? 'fill-current' : ''}`} />
                    {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                  </button>
                );
              })()}
            </div>

            {/* Comments */}
            <div className="glass rounded-2xl p-5 border border-border/40 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Comments ({comments.length})
              </h3>
              <div className="flex-1 overflow-y-auto max-h-64 divide-y divide-border/30 pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No comments yet. Be the first!
                  </p>
                ) : (
                  comments.map((c, i) => <CommentBubble key={c._id} comment={c} index={i} />)
                )}
              </div>

              {isAuthenticated ? (
                <form onSubmit={handleComment} className="flex gap-2 mt-4">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment…"
                    className="flex-1 bg-secondary/50 border border-border/40 rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-primary-foreground" />
                  </button>
                </form>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  <Link to="/login" className="text-primary hover:underline">Log in</Link> to comment
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
