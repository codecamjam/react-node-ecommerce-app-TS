export interface CartItem {
  id: number;
  product: Product;
  count: number;
  price: number;
}

export interface Category {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  transactionId?: string;
  amount: number;
  address?: string;
  status:
    | 'Not processed'
    | 'Processing'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled';
  user: User;
  products: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  quantity: number;
  sold: number;
  photoData?: string;
  photoContentType?: string;
  shipping: boolean;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  about?: string;
  role: number;
  history?: any[];
  createdAt: Date;
  updatedAt: Date;
}