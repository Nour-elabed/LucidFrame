import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Images, Sparkles, Activity, Users, TrendingUp, Shield } from 'lucide-react';
import { dashboardService } from '../services/dashboard.service';
import { aiService } from '../services/ai.service';
import { useAuthStore } from '../store/authStore';
import type { UserStats, AdminStats, GeneratedImage } from '../types';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const StatCard = ({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: number | string; color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass border border-border/40 rounded-2xl p-6 premium-shadow"
  >
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [generations, setGenerations] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, g] = await Promise.all([
          dashboardService.getMyStats(),
          aiService.getMyGenerations(),
        ]);
        setStats(s);
        setGenerations(g);
        if (user?.role === 'admin') {
          const as = await dashboardService.getAdminStats();
          setAdminStats(as);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="text-primary font-medium">{user?.username}</span>
          </p>
        </motion.div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Images} label="Total Posts" value={stats?.totalPosts ?? 0} color="bg-blue-500/80" />
          <StatCard icon={Sparkles} label="AI Generated" value={stats?.totalGenerated ?? 0} color="bg-purple-500/80" />
          <StatCard icon={Activity} label="Contributions (Posts + AI)" value={`${(stats?.totalPosts ?? 0) + (stats?.totalGenerated ?? 0)}`} color="bg-emerald-500/80" />
        </div>

        {/* Recent Activity */}
        {stats && stats.recentActivity.length > 0 && (
          <div className="glass border border-border/40 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Recent Activity
            </h2>
            <div className="space-y-3">
              {stats.recentActivity.map((p: any) => (
                <div key={p._id} className="flex items-center gap-3 text-sm">
                  <img
                    src={p.imageUrl?.startsWith('http') ? p.imageUrl : `${API_BASE}${p.imageUrl}`}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-secondary"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div>
                    <p className="text-foreground text-xs font-medium line-clamp-1">{p.caption || 'Untitled post'}</p>
                    <p className="text-muted-foreground text-xs">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Generations */}
        {generations.length > 0 && (
          <div className="glass border border-border/40 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> My AI Generations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {generations.slice(0, 8).map((g) => (
                <div key={g._id} className="relative group rounded-xl overflow-hidden aspect-square">
                  <img
                    src={g.imageUrl?.startsWith('http') ? g.imageUrl : `${API_BASE}${g.imageUrl}`}
                    alt={g.prompt}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs line-clamp-2">{g.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {user?.role === 'admin' && adminStats && (
          <div className="glass border border-amber-500/30 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Admin Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <StatCard icon={Users} label="Total Users" value={adminStats.totalUsers} color="bg-amber-500/80" />
              <StatCard icon={Images} label="Total Posts" value={adminStats.totalPosts} color="bg-rose-500/80" />
              <StatCard icon={Sparkles} label="AI Images Generated" value={adminStats.totalGeneratedImages} color="bg-violet-500/80" />
              <StatCard icon={TrendingUp} label="Top Type" value={adminStats.topPrompts[0]?._id || 'N/A'} color="bg-cyan-500/80" />
            </div>
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Recent Users</h3>
            <div className="space-y-2">
              {adminStats.recentUsers.map((u: any) => (
                <div key={u._id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">{u.username}</span>
                  <span className="text-muted-foreground">{u.email}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-secondary text-muted-foreground'}`}>{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
