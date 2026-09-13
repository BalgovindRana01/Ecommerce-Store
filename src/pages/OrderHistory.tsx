import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../utils/useTranslation';
import { API_URL } from '../utils/api';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, MapPin, Calendar, ExternalLink } from 'lucide-react';

interface RawOrderRow {
  id: number;
  order_ref: string;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
}

interface GroupedOrder {
  id: string;
  orderRef: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

const loadLocalOrders = (): GroupedOrder[] => {
  try {
    return JSON.parse(localStorage.getItem('order-history') || '[]');
  } catch {
    return [];
  }
};

const groupOrders = (rows: RawOrderRow[]): GroupedOrder[] => {
  const map = new Map<string, GroupedOrder>();
  for (const row of rows) {
    const key = row.order_ref || String(row.id);
    if (!map.has(key)) {
      map.set(key, {
        id: String(row.id),
        orderRef: row.order_ref,
        totalAmount: row.total_amount,
        status: row.status,
        createdAt: row.created_at,
        customerName: row.customer_name || 'Guest User',
        customerEmail: row.customer_email || '',
        shippingAddress: row.shipping_address || '',
        items: []
      });
    }

    if (row.product_id) {
      const items = map.get(key)!.items;
      const exists = items.some(item => item.productId === String(row.product_id));
      if (!exists) {
        items.push({
          productId: String(row.product_id),
          productName: row.product_name,
          quantity: row.quantity,
          price: row.price
        });
      }
    }
  }
  return Array.from(map.values());
};

const OrderHistory = () => {
  const [orders, setOrders] = useState<GroupedOrder[]>(loadLocalOrders);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderRef, setExpandedOrderRef] = useState<string | null>(null);
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const rawRows: RawOrderRow[] = await response.json();
        // Group rows by order ref
        const grouped = groupOrders(rawRows);
        // Sort newest first
        grouped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(() => {
          const localOrders = loadLocalOrders();
          const merged = [...grouped, ...localOrders.filter(localOrder =>
            !grouped.some(order => order.orderRef === localOrder.orderRef)
          )];
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return merged;
        });
      } else {
        setError('Failed to load orders history.');
      }
    } catch {
      setError('Network error. Failed to retrieve orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const toggleExpand = (ref: string) => {
    setExpandedOrderRef(expandedOrderRef === ref ? null : ref);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'paid': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'shipped': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'accepted': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  if (!user && orders.length === 0) {
    return (
      <div className="min-h-screen bg-transparent text-white px-4 py-16 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md bg-white/5 border border-white/10 rounded-[34px] p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold">{t('pleaseLogin')}</h1>
          <p className="text-sm text-gray-400">{t('loginToViewOrders')}</p>
          <Link
            to="/login"
            className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-full transition shadow-lg shadow-purple-600/20"
          >
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-white px-4 py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400">{t('loadingOrders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header Title */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            {t('orderHistory')}
          </h1>
          <p className="text-gray-400 font-medium">{t('yourOrderHistory')}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[30px] p-8 max-w-md mx-auto space-y-5">
            <div className="text-6xl">📦</div>
            <h2 className="text-xl font-bold">{t('noOrdersYet')}</h2>
            <p className="text-sm text-gray-400">{t('startShopping')}</p>
            <Link
              to="/"
              className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 px-6 rounded-full transition shadow-lg shadow-purple-600/20"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderRef === order.orderRef;

              return (
                <div
                  key={order.id}
                  className="bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-lg hover:border-white/15 transition-all"
                >
                  {/* Card Main Summary Row */}
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white">Order #{order.orderRef}</h3>
                        <span className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-purple-400" />
                          <span>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </div>
                        {order.shippingAddress && (
                          <div className="flex items-center gap-1 max-w-[200px] md:max-w-[300px] truncate">
                            <MapPin size={14} className="text-purple-400" />
                            <span className="truncate">{order.shippingAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold md:text-right">Paid Amount</p>
                        <p className="text-2xl font-black text-purple-300">₹{order.totalAmount}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Collapsible Action */}
                        <button
                          onClick={() => toggleExpand(order.orderRef)}
                          className="rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white p-2.5 border border-white/5 transition-colors flex items-center justify-center"
                          title="View Details"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        {/* Tracking Link */}
                        <Link
                          to={`/track/${order.orderRef}`}
                          className="rounded-full bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white p-2.5 border border-purple-500/25 transition-all flex items-center justify-center shadow-inner"
                          title="Track Live"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    </div>

                  </div>

                  {/* Expanded Item invoice lists */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-black/25">
                      <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">Item Details</h4>
                      <div className="bg-[#07070d]/50 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-gray-400 font-bold text-[10px] uppercase">
                              <th className="px-5 py-3">Product Name</th>
                              <th className="px-5 py-3 text-center">Qty</th>
                              <th className="px-5 py-3 text-right">Unit Price</th>
                              <th className="px-5 py-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-semibold">
                            {order.items.map((item) => (
                              <tr key={item.productId} className="hover:bg-white/[0.01]">
                                <td className="px-5 py-3 text-white truncate max-w-[200px]">
                                  {item.productName}
                                </td>
                                <td className="px-5 py-3 text-center text-gray-300">
                                  {item.quantity}
                                </td>
                                <td className="px-5 py-3 text-right text-gray-300">
                                  ₹{item.price}
                                </td>
                                <td className="px-5 py-3 text-right text-purple-300 font-bold">
                                  ₹{item.price * item.quantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;