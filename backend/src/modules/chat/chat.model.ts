import mongoose from 'mongoose';

export interface IChatMessage extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}


const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

export const ChatMessageModel = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
