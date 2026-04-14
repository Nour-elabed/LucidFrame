import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { getAxiosBaseUrl } from './apiOrigin';

const BASE_URL = getAxiosBaseUrl();

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Attach JWT token from localStorage on every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('lucidframe_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  // For FormData, browser sets Content-Type with correct boundary automatically

  return config;
});

// Handle 401s globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
