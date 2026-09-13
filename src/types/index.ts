export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  description: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  deliveryType: 'delivery' | 'pickup';
  paymentMethod?: PaymentMethod;
  total: number;
  status: 'pending' | 'verified' | 'accepted' | 'paid' | 'shipped' | 'delivered';
  orderRef: string;
  createdAt: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  customer: {
    name: string;
    email: string;
  };
  demo?: boolean;
}

export interface RazorpayConfig {
  key: string;
  name: string;
  description: string;
  image: string;
  theme: {
    color: string;
  };
}

export type PaymentMethod = 'card' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'amazonpay' | 'other_upi' | 'netbanking' | 'cod';

export interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  popular?: boolean;
}