import mongoose, { Document, Schema } from 'mongoose';

export type GenerationType = 'person' | 'product' | 'person_with_product';

export interface IGeneratedImage extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  prompt: string;
  type: GenerationType;
  imageUrl: string;
  createdAt: Date;
}

const GeneratedImageSchema = new Schema<IGeneratedImage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      maxlength: [500, 'Prompt cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['person', 'product', 'person_with_product'],
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const GeneratedImageModel = mongoose.model<IGeneratedImage>(
  'GeneratedImage',
  GeneratedImageSchema
);
