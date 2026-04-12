import api from '../lib/axios';
import type { ApiResponse, UserStats, AdminStats } from '../types';

export const dashboardService = {
  getMyStats: async (): Promise<UserStats> => {
    const res = await api.get<ApiResponse<UserStats>>('/users/stats');
    return res.data.data;
  },

  getAdminStats: async (): Promise<AdminStats> => {
    const res = await api.get<ApiResponse<AdminStats>>('/users/admin/stats');
    return res.data.data;
  },
};
