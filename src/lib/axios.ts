import axios from 'axios';
import { useAuthStore } from '../store/authStore';

let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

if (BASE_URL) {
  // Ensure we append /api if missing
  if (!BASE_URL.endsWith('/api')) {
    BASE_URL = `${BASE_URL.replace(/\/$/, '')}/api`;
  }
  // Ensure we have a protocol if missing
  if (!BASE_URL.startsWith('http')) {
    BASE_URL = `https://${BASE_URL}`;
  }
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage on every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('lucidframe_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
