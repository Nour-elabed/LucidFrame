import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  caption: string;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    caption: {
      type: String,
      default: '',
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    },
    likes: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 }); // for sorted feed queries

export const PostModel = mongoose.model<IPost>('Post', PostSchema);
