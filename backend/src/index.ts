import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';

import { config } from './config/env';
import { connectDB } from './config/db';
import { initSocket } from './sockets/socket.manager';
import { errorMiddleware } from './middlewares/error.middleware';
// Route modules
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import postRoutes from './modules/posts/post.routes';
import commentRoutes from './modules/comments/comment.routes';
import aiRoutes from './modules/ai/ai.routes';
import chatRoutes from './modules/chat/chat.routes';

const app = express();
const httpServer = createServer(app);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "https://lucid-frame.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Socket.IO ─────────────────────────────────────────────────────────────────
initSocket(httpServer);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts/:postId/comments', commentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use(errorMiddleware);
// Keep-alive to prevent Render free tier sleep
const BACKEND_URL = 'https://lucidframe-1.onrender.com';
setInterval(() => {
  fetch(`${BACKEND_URL}/api/health`).catch(() => {});
}, 14 * 60 * 1000);


// ── Start Server ──────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `\nPort ${config.port} is already in use (another app or an old backend is running).\n` +
          `Fix: close that terminal, or run  taskkill /PID <pid> /F  after  netstat -ano | findstr :${config.port}\n` +
          `Or set PORT=5001 in backend/.env and match VITE_API_URL / VITE_SOCKET_URL on the frontend.\n`
      );
      process.exit(1);
      return;
    }
    console.error(err);
    process.exit(1);
  });
  httpServer.listen(config.port, () => {
    console.log(`🚀 LucidFrame API running on http://localhost:${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`📡 Socket.IO listening`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
