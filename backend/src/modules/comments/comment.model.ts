import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [300, 'Comment cannot exceed 300 characters'],
      trim: true,
    },
  },
  { timestamps: true }
);

export const CommentModel = mongoose.model<IComment>('Comment', CommentSchema);
