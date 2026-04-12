// ── Domain Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export interface Post {
  _id: string;
  userId: User;
  imageUrl: string;
  caption: string;
  likes: string[];
  commentsCount?: number;
  createdAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  userId: User;
  text: string;
  createdAt: string;
}

export interface GeneratedImage {
  _id: string;
  userId: string;
  prompt: string;
  type: 'person' | 'product' | 'person_with_product';
  imageUrl: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  userId: User;
  text: string;
  createdAt: string;
}

// ── API Response Wrappers ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface FeedResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserStats {
  totalPosts: number;
  totalGenerated: number;
  recentActivity: Partial<Post>[];
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalGeneratedImages: number;
  topPrompts: { _id: string; count: number }[];
  recentUsers: Partial<User>[];
}
