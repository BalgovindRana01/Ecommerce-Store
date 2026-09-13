import type { Product, Order, ApiResponse, PaymentOrder, RazorpayConfig } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'https://store1.buyinhome.workers.dev';

const getRealProductImage = (name: string, category: string, existingImage?: string): string => {
  if (existingImage && !existingImage.includes('example.com') && existingImage.startsWith('http')) {
    return existingImage;
  }

  const n = name.trim().toLowerCase();

  switch (n) {
    // Grocery
    case 'rice':
      return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80';
    case 'bread':
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80';
    case 'sugar':
      return 'https://images.unsplash.com/photo-1709651808265-977ed7ef78c6?w=600&auto=format&fit=crop&q=80';
    case 'cooking oil':
      return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80';
    case 'wheat flour':
      return 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=600&auto=format&fit=crop&q=80';
    case 'salt':
      return 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80';
    case 'lentils':
      return 'https://images.unsplash.com/photo-1552585960-0e1069ce7405?w=600&auto=format&fit=crop&q=80';
    case 'spices mix':
      return 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80';

    // Dairy
    case 'milk':
      return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80';
    case 'cheese':
      return 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&auto=format&fit=crop&q=80';
    case 'yogurt':
      return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80';
    case 'butter':
      return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80';
    case 'paneer':
      return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80';
    case 'cream':
      return 'https://images.unsplash.com/photo-1629385701021-fcd568a743e8?w=600&auto=format&fit=crop&q=80';

    // Snacks
    case 'chips':
      return 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=600&auto=format&fit=crop&q=80';
    case 'cookies':
      return 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80';
    case 'biscuits':
      return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80';
    case 'namkeen':
      return 'https://images.unsplash.com/photo-1601050690597-df056f70950?w=600&auto=format&fit=crop&q=80';
    case 'popcorn':
      return 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=600&auto=format&fit=crop&q=80';
    case 'chocolates':
      return 'https://images.unsplash.com/photo-1623660053975-cf75a8be0908?w=600&auto=format&fit=crop&q=80';

    // Beverages
    case 'tea':
      return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80';
    case 'coffee':
      return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80';
    case 'juice':
      return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80';
    case 'soda':
      return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80';
    case 'energy drink':
      return 'https://images.unsplash.com/photo-1560689189-65b6ed6228e7?w=600&auto=format&fit=crop&q=80';

    // Household
    case 'soap':
      return 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&auto=format&fit=crop&q=80';
    case 'detergent':
      return 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=600&auto=format&fit=crop&q=80';
    case 'toothpaste':
      return 'https://images.unsplash.com/photo-1594178990090-ca641059a506?w=600&auto=format&fit=crop&q=80';
    case 'dish soap':
      return 'https://images.unsplash.com/photo-1590610994353-7b0e7546e681?w=600&auto=format&fit=crop&q=80';
    case 'cleaning cloth':
      return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80';

    // Lifestyles
    case 'shampoo':
      return 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80';
    case 'deodorant':
      return 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80';
    case 'perfume':
      return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80';
    case 'face wash':
      return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80';
    case 'hair oil':
      return 'https://images.unsplash.com/photo-1671493229066-f36e86b35841?w=600&auto=format&fit=crop&q=80';
    case 'body lotion':
      return 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80';

    // Fashion
    case 't-shirt':
      return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80';
    case 'jeans':
      return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80';
    case 'sneakers':
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
    case 'watch':
      return 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80';
    case 'sunglasses':
      return 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80';
    case 'cap':
      return 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600&auto=format&fit=crop&q=80';

    // Electronics
    case 'smartphone':
      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
    case 'laptop':
      return 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80';
    case 'smart watch':
      return 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80';
    case 'wireless headphones':
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
    case 'data cable':
      return 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80';
    case 'power bank':
      return 'https://images.unsplash.com/photo-1585995603413-eb35b5f4a50b?w=600&auto=format&fit=crop&q=80';
    case 'bluetooth speaker':
      return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80';
    case 'tablet':
      return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80';

    // Others in seed
    case 'blender':
      return 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80';
    case 'cookbook':
      return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80';

    default:
      // Catch-all fallbacks per category
      if (category === 'grocery') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
      if (category === 'dairy') return 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?w=600&auto=format&fit=crop&q=80';
      if (category === 'snacks') return 'https://images.unsplash.com/photo-1599490659203-7b3befe87c20?w=600&auto=format&fit=crop&q=80';
      if (category === 'beverages') return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80';
      if (category === 'household') return 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&auto=format&fit=crop&q=80';
      if (category === 'lifestyles') return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80';
      if (category === 'fashion') return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80';
      if (category === 'electronic') return 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&auto=format&fit=crop&q=80';

      return 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80';
  }
};

export const api = {
  getCatalog: async (): Promise<Product[]> => {
    const res = await fetch(`${API_URL}/api/catalog`);
    const data: ApiResponse<Product[]> = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data.map(p => ({
      ...p,
      image: getRealProductImage(p.name, p.category, p.image)
    }));
  },

  getProduct: async (id: string): Promise<{ product: Product; related: Product[] }> => {
    const res = await fetch(`${API_URL}/api/catalog/${id}`);
    const data: ApiResponse<{ product: Product; related: Product[] }> = await res.json();
    if (!data.success) throw new Error(data.message);
    return {
      product: {
        ...data.data.product,
        image: getRealProductImage(data.data.product.name, data.data.product.category, data.data.product.image)
      },
      related: data.data.related.map(p => ({
        ...p,
        image: getRealProductImage(p.name, p.category, p.image)
      }))
    };
  },

  placeOrder: async (order: Omit<Order, 'id' | 'status' | 'orderRef' | 'createdAt'>): Promise<{ orderRef: string }> => {
    const res = await fetch(`${API_URL}/api/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data: ApiResponse<{ orderRef: string; otp?: string }> = await res.json();
    if (!data.success) throw new Error(data.message);

    // Store OTP in session storage for demo purposes
    if (data.data.otp) {
      sessionStorage.setItem('lastOrderOtp', data.data.otp);
    }

    return data.data;
  },

  verifyOtp: async (orderRef: string, otp: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/order/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderRef, otp }),
    });
    const data: ApiResponse<void> = await res.json();
    if (!data.success) throw new Error(data.message);
  },

  resendOtp: async (orderRef: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/order/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderRef }),
    });
    const data: ApiResponse<void> = await res.json();
    if (!data.success) throw new Error(data.message);
  },

  createPaymentOrder: async (orderRef: string): Promise<PaymentOrder> => {
    const res = await fetch(`${API_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderRef }),
    });
    const data: ApiResponse<PaymentOrder> = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  verifyPayment: async (orderRef: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderRef, razorpayOrderId, razorpayPaymentId, razorpaySignature }),
    });
    const data: ApiResponse<void> = await res.json();
    if (!data.success) throw new Error(data.message);
  },

  getPaymentConfig: async (): Promise<RazorpayConfig> => {
    const res = await fetch(`${API_URL}/api/payment/config`);
    const data: ApiResponse<RazorpayConfig> = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  updatePaymentMethod: async (orderRef: string, paymentMethod: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/order/payment-method`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderRef, paymentMethod }),
    });
    const data: ApiResponse<void> = await res.json();
    if (!data.success) throw new Error(data.message);
  },

  trackOrder: async (orderRef: string): Promise<Order> => {
    const res = await fetch(`${API_URL}/api/track/${orderRef}`);
    const data: ApiResponse<Order> = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  login: async (email: string, password: string): Promise<{ token: string; user: { id: string; email: string; name: string } }> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Login failed');
    }
    return await res.json();
  },

  register: async (userData: any): Promise<{ token: string; user: { id: string; email: string; name: string } }> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Registration failed');
    }
    return await res.json();
  },
};