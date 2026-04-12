import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useOnlineStore } from '../store/onlineStore';
import { getSocket } from '../lib/socket';
import api from '../lib/axios';
import type { ChatMessage, ApiResponse } from '../types';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { onlineUsers } = useOnlineStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get<ApiResponse<ChatMessage[]>>('/chat');
        setMessages(res.data.data);
      } catch {
        console.error('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    const socket = getSocket();
    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };
    
    socket.on('new-message', handleNewMessage);
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;
    
    const socket = getSocket();
    const userId = (user as any)._id || user.id;
    socket.emit('send-message', { userId, text: inputText });
    setInputText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4 flex flex-col h-screen">
      <div className="container mx-auto max-w-4xl flex-1 flex flex-col h-full bg-card border border-border/40 rounded-2xl premium-shadow overflow-hidden">
        
        {/* Header */}
        <div className="h-16 px-6 glass flex items-center gap-3 border-b border-border/40 shrink-0">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground text-lg">Global Chat</h2>
          <div className="ml-auto flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {onlineUsers.length} Online
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const uId = (msg.userId as any)._id || msg.userId.id;
              const myId = (user as any)?._id || user?.id;
              const isMe = uId === myId;
              const isOnline = onlineUsers.includes(uId);

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-semibold text-xs text-foreground shrink-0 border border-border/40">
                      {msg.userId?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {/* Status Dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${isOnline ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                  </div>
                  <div className={`max-w-[75%] px-4 py-2 text-sm rounded-2xl ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-secondary-foreground rounded-bl-sm'}`}>
                    {!isMe && <p className="text-[10px] font-medium opacity-50 mb-0.5">{msg.userId?.username}</p>}
                    <p>{msg.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-border/40 bg-secondary/20 flex gap-3 shrink-0">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-background border border-border/40 px-4 py-3 rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 shadow-md"
          >
            <Send className="w-5 h-5 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
