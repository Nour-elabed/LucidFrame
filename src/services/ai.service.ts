import api from '../lib/axios';
import type { ApiResponse, GeneratedImage } from '../types';

export type GenerationType = 'person' | 'product' | 'person_with_product';

export const aiService = {
  generate: async (
    prompt: string,
    type: GenerationType,
    imageFile?: File | null
  ): Promise<GeneratedImage> => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('type', type);
      formData.append('image', imageFile);

      const res = await api.post<ApiResponse<GeneratedImage>>('/ai/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.data;
    }

    const res = await api.post<ApiResponse<GeneratedImage>>('/ai/generate', {
      prompt,
      type,
    });
    return res.data.data;
  },

  getMyGenerations: async (): Promise<GeneratedImage[]> => {
    const res = await api.get<ApiResponse<GeneratedImage[]>>('/ai/my-generations');
    return res.data.data;
  },
};
