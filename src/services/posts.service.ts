import api from '../lib/axios';
import type { ApiResponse, FeedResponse, Post } from '../types';

export const postsService = {
  getFeed: async (page = 1): Promise<FeedResponse> => {
    const res = await api.get<ApiResponse<FeedResponse>>(`/posts?page=${page}&limit=12`);
    return res.data.data;
  },

  getPost: async (id: string): Promise<Post> => {
    const res = await api.get<ApiResponse<Post>>(`/posts/${id}`);
    return res.data.data;
  },

  createPost: async (imageUrl: string, caption: string): Promise<Post> => {
    const res = await api.post<ApiResponse<Post>>('/posts', { imageUrl, caption });
    return res.data.data;
  },

  uploadAndCreatePost: async (file: File, caption: string): Promise<Post> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption);
    const res = await api.post<ApiResponse<Post>>('/posts', formData, {
    });
    return res.data.data;
  },

  likePost: async (id: string): Promise<{ likes: number }> => {
    const res = await api.post<ApiResponse<{ likes: number }>>(`/posts/${id}/like`);
    return res.data.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },
};
