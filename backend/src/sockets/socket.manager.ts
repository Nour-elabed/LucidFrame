import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { config } from '../config/env';

let io: SocketServer;

/**
 * Initialize the central Socket.IO server.
 * Called once at server startup.
 */
export const initSocket = (httpServer: HTTPServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  

  const onlineUsers = new Set<string>();

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('user-online', (userId: string) => {
      socket.data.userId = userId;
      onlineUsers.add(userId);
      io.emit('online-users', Array.from(onlineUsers));
    });

    socket.on('send-message', async (data: { userId: string, text: string }) => {
      try {
        const { ChatMessageModel } = await import('../modules/chat/chat.model');
        const { UserModel } = await import('../modules/auth/auth.model');
        
        const message = await ChatMessageModel.create({
          userId: data.userId,
          text: data.text
        });

        const populatedMessage = await message.populate('userId', 'username avatar');
        io.emit('new-message', populatedMessage);
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('join-post', (postId: string) => {
      socket.join(`post:${postId}`);
    });

    socket.on('leave-post', (postId: string) => {
      socket.leave(`post:${postId}`);
    });

    socket.on('disconnect', () => {
      if (socket.data.userId) {
        onlineUsers.delete(socket.data.userId);
        io.emit('online-users', Array.from(onlineUsers));
      }
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get the singleton Socket.IO instance.
 * Throws if called before initSocket().
 */
export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocket() first.');
  }
  return io;
};
