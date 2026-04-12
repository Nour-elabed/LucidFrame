import { motion } from 'motion/react';
import type { Comment } from '../types';


interface CommentBubbleProps {
  comment: Comment;
  index?: number;
}

const CommentBubble = ({ comment, index = 0 }: CommentBubbleProps) => {
  const username = (comment.userId as any)?.username || 'Anonymous';
  const avatarLetter = username[0]?.toUpperCase() || 'U';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-3 py-3"
    >
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
        {avatarLetter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">{username}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-secondary-foreground leading-relaxed">{comment.text}</p>
      </div>
    </motion.div>
  );
};

export default CommentBubble;
