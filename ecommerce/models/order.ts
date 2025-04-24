import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the CartItem interface
export interface ICartItem extends Document {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  count: number;
}

// Define the Order interface
export interface IOrder extends Document {
  products: ICartItem[];
  transaction_id?: string;
  amount: number;
  address: string;
  status:
    | 'Not processed'
    | 'Processing'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled';
  updated?: Date;
  user: mongoose.Types.ObjectId;
}

// CartItem Schema
const CartItemSchema: Schema<ICartItem> = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    count: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Order Schema
const OrderSchema: Schema<IOrder> = new mongoose.Schema(
  {
    products: [CartItemSchema],
    transaction_id: {
      type: String
    },
    amount: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'Not processed',
      enum: [
        'Not processed',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled'
      ]
    },
    updated: {
      type: Date
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Define models
export const CartItem: Model<ICartItem> = mongoose.model<ICartItem>(
  'CartItem',
  CartItemSchema
);
export const Order: Model<IOrder> = mongoose.model<IOrder>(
  'Order',
  OrderSchema
);
