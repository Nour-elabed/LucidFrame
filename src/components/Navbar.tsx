import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Menu, X, Wand2, LayoutDashboard, LogOut, LogIn, UserPlus, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const authLinks = isAuthenticated
    ? [
        { to: '/', label: 'Feed', icon: null },
        { to: '/generate', label: 'Generate', icon: Wand2 },
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/chat', label: 'Chat', icon: MessageSquare },
      ]
    : [
        { to: '/', label: 'Feed', icon: null },
        { to: '/login', label: 'Sign In', icon: LogIn },
        { to: '/register', label: 'Register', icon: UserPlus },
      ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-heading text-xl font-semibold text-foreground">
            Lucid<span className="gold-text">Frame</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {authLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive(link.to) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.label}
              </Link>
            );
          })}

          {isAuthenticated && (
            <>
              <div className="flex items-center gap-2 ml-2 pl-4 border-l border-border/40">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-foreground font-medium">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-t border-border/30 px-4 py-4 space-y-3"
        >
          {authLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block text-sm font-medium ${
                isActive(link.to) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="block text-sm text-red-400 font-medium"
            >
              Logout
            </button>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
