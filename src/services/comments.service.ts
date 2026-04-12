import api from '../lib/axios';
import type { ApiResponse, Comment } from '../types';

export const commentsService = {
  getComments: async (postId: string): Promise<Comment[]> => {
    const res = await api.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`);
    return res.data.data;
  },

  addComment: async (postId: string, text: string): Promise<Comment> => {
    const res = await api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, { text });
    return res.data.data;
  },
};
