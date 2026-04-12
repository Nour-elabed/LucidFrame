import { create } from 'zustand';
import type { Post } from '../types';

interface PostsState {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  prependPost: (post: Post) => void;
  updateLikes: (postId: string, likes: number) => void;
  addComment: (postId: string) => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],

  setPosts: (posts) => set({ posts }),

  prependPost: (post) =>
    set((state) => ({
      posts: state.posts.find((p) => p._id === post._id)
        ? state.posts
        : [post, ...state.posts],
    })),

  updateLikes: (postId, likes) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p._id === postId ? { ...p, likes: Array(likes).fill('') } : p
      ),
    })),

  addComment: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p._id === postId ? { ...p, _commentCount: (p as any)._commentCount + 1 } : p
      ),
    })),
}));
