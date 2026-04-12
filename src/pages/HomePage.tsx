import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImagePlus, MapPin, UploadCloud, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePostsStore } from '../store/postsStore';
import { postsService } from '../services/posts.service';
import { getSocket, connectSocket } from '../lib/socket';
import type { Post } from '../types';
import PostCard from '../components/PostCard';
import FeedSkeleton from '../components/FeedSkeleton';
import { getApiOrigin } from '../lib/apiOrigin';

const API_BASE = getApiOrigin();

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const { posts, setPosts, prependPost, updateLikes } = usePostsStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadLocation, setUploadLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const data = await postsService.getFeed(1);
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch {
        setError('Failed to load feed. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();

    // Real-time socket events
    connectSocket();
    const socket = getSocket();
    socket.on('new-post', (post: Post) => prependPost(post));
    socket.on('like-updated', ({ postId, likes }: { postId: string; likes: number }) =>
      updateLikes(postId, likes)
    );

    return () => {
      socket.off('new-post');
      socket.off('like-updated');
    };
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await postsService.getFeed(nextPage);
      setPosts([...posts, ...data.posts]);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const finalCaption = uploadLocation.trim() 
        ? `${uploadCaption}\n📍 ${uploadLocation}`
        : uploadCaption;
      
      await postsService.uploadAndCreatePost(uploadFile, finalCaption);
      setUploadFile(null);
      setUploadCaption('');
      setUploadLocation('');
      setShowUpload(false);
    } catch {
      setError('Failed to upload post.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
            Explore <span className="gold-text">LucidFrame</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time AI-generated & community images
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="text-center text-red-400 bg-red-400/10 border border-red-400/30 rounded-xl px-6 py-4 mb-8">
            {error}
          </div>
        )}

        {/* Upload Toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="glass flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-foreground hover:bg-secondary/40 transition-colors border border-border/40 premium-shadow"
          >
            <ImagePlus className="w-5 h-5 text-primary" />
            Upload a Photo
          </button>
        </div>

        {/* Upload Form */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className="glass border border-border/40 rounded-2xl p-6 max-w-2xl mx-auto">
                <form onSubmit={handleUpload} className="space-y-4">
                  
                  {/* File Importer */}
                  {!uploadFile ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <UploadCloud className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground">Click to select an image</p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG up to 10MB</p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden glass border border-border/40 h-48 flex items-center justify-center bg-secondary/30">
                      <img src={URL.createObjectURL(uploadFile)} alt="Preview" className="max-h-full object-contain" />
                      <button type="button" onClick={() => setUploadFile(null)} className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1.5 rounded-full text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="hidden" />

                  {/* Caption & Location */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <input
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        placeholder="Write a creative caption..."
                        className="w-full bg-secondary/50 border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2 relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={uploadLocation}
                        onChange={(e) => setUploadLocation(e.target.value)}
                        placeholder="Add a location (optional)..."
                        className="w-full bg-secondary/50 border border-border/40 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!uploadFile || uploading}
                    className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Publish to Feed'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed Grid */}
        {loading ? (
          <FeedSkeleton />
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className="flex flex-col items-center max-w-xl mx-auto space-y-8">
                {posts.map((post, i) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    index={i}
                    apiBase={API_BASE}
                  />
                ))}
              </div>
            </AnimatePresence>

            {posts.length === 0 && !error && (
              <div className="text-center text-muted-foreground py-20">
                <p className="text-lg">No posts yet.</p>
                <p className="text-sm mt-1">Be the first to share an AI-generated image!</p>
              </div>
            )}

            {page < totalPages && (
              <div className="mt-10 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Unauthenticated Popup */}
        {!isAuthenticated && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass border border-primary/30 rounded-2xl p-4 shadow-xl flex items-center gap-6 animate-in slide-in-from-bottom-5 w-[90%] max-w-md premium-shadow">
            <div>
              <p className="font-heading font-semibold text-foreground text-sm">Join the Community</p>
              <p className="text-muted-foreground text-xs mt-0.5">Log in to generate images, like posts, and chat!</p>
            </div>
            <Link to="/login" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0 hover:opacity-90 transition-opacity whitespace-nowrap">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
