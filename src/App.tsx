import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GeneratePage from './pages/GeneratePage';
import ChatPage from './pages/ChatPage';
import { getSocket, connectSocket } from './lib/socket';
import { useEffect } from 'react';
import { useOnlineStore } from './store/onlineStore';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// We will manage connection within the App component with useEffect

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { setOnlineUsers } = useOnlineStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
      const socket = getSocket();
      
      const userId = (user as any)._id || user.id;
      socket.emit('user-online', userId);

      const handleOnlineUsers = (users: string[]) => {
        setOnlineUsers(users);
      };

      socket.on('online-users', handleOnlineUsers);

      return () => {
        socket.off('online-users', handleOnlineUsers);
      };
    }
  }, [isAuthenticated, user]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <GeneratePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
