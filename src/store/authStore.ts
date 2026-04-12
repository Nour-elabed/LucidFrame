import { create } from 'zustand';
import type { User } from '../types';
import { connectSocket, disconnectSocket } from '../lib/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const storedUser = localStorage.getItem('lucidframe_user');
const storedToken = localStorage.getItem('lucidframe_token');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,

  setAuth: (user, token) => {
    localStorage.setItem('lucidframe_user', JSON.stringify(user));
    localStorage.setItem('lucidframe_token', token);
    connectSocket();
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('lucidframe_user');
    localStorage.removeItem('lucidframe_token');
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
