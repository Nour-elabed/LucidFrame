import { io, Socket } from 'socket.io-client';
import { getApiOrigin } from './apiOrigin';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.trim() || getApiOrigin();

let socket: Socket | null = null;
socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  transports: ["websocket", "polling"], // 🔥 ADD THIS
});

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const connectSocket = (): void => {
  const s = getSocket();
  if (!s.connected) s.connect();
};

export const disconnectSocket = (): void => {
  if (socket?.connected) socket.disconnect();
};
