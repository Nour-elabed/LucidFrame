import api from '../lib/axios';
import type { ApiResponse, AuthResponse } from '../types';

export const authService = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      username,
      email,
      password,
    });
    return res.data.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return res.data.data;
  },
};
