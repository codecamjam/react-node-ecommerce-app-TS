import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the Product interface
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  quantity?: number;
  sold: number;
  photo?: {
    data: Buffer,
    contentType: string
  };
  shipping?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product Schema
const productSchema: Schema<IProduct> = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 50
    },
    description: {
      type: String,
      required: true,
      maxLength: 2000
    },
    price: {
      type: Number,
      trim: true,
      required: true,
      maxLength: 32
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    quantity: {
      type: Number
    },
    sold: {
      type: Number,
      default: 0
    },
    photo: {
      data: Buffer,
      contentType: String
    },
    shipping: {
      type: Boolean,
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Define and export the Product model
export const Product: Model<IProduct> =
  mongoose.model < IProduct > ('Product', productSchema);
