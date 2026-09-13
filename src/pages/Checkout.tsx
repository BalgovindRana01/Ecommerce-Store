import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store';
import { api } from '../utils/api';
import { useTranslation } from '../utils/useTranslation';
import QuantityStepper from '../components/QuantityStepper';
import type { PaymentMethod, PaymentOption } from '../types';
import { ArrowLeft, User, Mail, Phone, MapPin, Notebook, ChevronRight, Check } from 'lucide-react';

const Checkout = () => {
  const { items, getTotal, updateQuantity, removeItem, clearCart } = useCartStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const paymentOptions: PaymentOption[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, RuPay',
      icon: '💳',
      popular: true
    },
    {
      id: 'gpay',
      name: 'Google Pay (GPay)',
      description: 'Fast UPI checkout via GPay',
      icon: '🔵',
      popular: true
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      description: 'Instant UPI checkout via PhonePe',
      icon: '🟣',
      popular: true
    },
    {
      id: 'paytm',
      name: 'Paytm',
      description: 'Pay via Paytm UPI or Wallet',
      icon: '🔵',
      popular: true
    },
    {
      id: 'bhim',
      name: 'BHIM UPI',
      description: 'Government backed secure UPI',
      icon: '🟠'
    },
    {
      id: 'amazonpay',
      name: 'Amazon Pay',
      description: 'Pay via Amazon Pay UPI',
      icon: '🟡'
    },
    {
      id: 'other_upi',
      name: 'Other UPI Apps',
      description: 'Any other verified UPI application',
      icon: '📱'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major Indian banks',
      icon: '🏦'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      description: 'Pay with Cash/UPI on delivery',
      icon: '💵'
    }
  ];

  // Auto-fill customer details if logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCustomer(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || ''
        }));
      } catch (e) {
        console.error('Failed to parse user details', e);
      }
    }
  }, []);

  const subtotal = getTotal();
  const deliveryCharge = deliveryType === 'delivery' ? (subtotal < 100 ? 20 : 0) : 0;
  const total = subtotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }
    if (!customer.name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!customer.email.trim()) {
      alert('Please enter your email.');
      return;
    }
    if (!customer.phone.trim()) {
      alert('Please enter your phone number.');
      return;
    }
    if (deliveryType === 'delivery' && !customer.address.trim()) {
      alert('Please enter your delivery address.');
      return;
    }

    setLoading(true);
    try {
      const order = {
        items,
        customer,
        deliveryType,
        paymentMethod,
        total,
      };

      const response = await api.placeOrder(order);
      const orderRef = response.orderRef;

      const savedOrders = JSON.parse(localStorage.getItem('order-history') || '[]');
      savedOrders.unshift({
        id: orderRef,
        orderRef,
        totalAmount: total,
        status: paymentMethod === 'cod' ? 'accepted' : 'pending',
        createdAt: new Date().toISOString(),
        customerName: customer.name,
        customerEmail: customer.email,
        shippingAddress: deliveryType === 'pickup' ? 'Pickup at store' : customer.address,
        items: items.map(item => ({
          productId: String(item.product.id),
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });
      localStorage.setItem('order-history', JSON.stringify(savedOrders));

      // Clear the shopping cart upon placing the order successfully
      clearCart();

      if (paymentMethod === 'cod') {
        // Cash on delivery skip OTP verification screen
        navigate(`/track/${orderRef}`);
      } else {
        // Online payments proceed to verification
        navigate(`/otp/${orderRef}`);
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-transparent text-white px-4 py-16 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md bg-white/5 border border-white/10 rounded-[34px] p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-6xl">🛒</div>
          <h1 className="text-2xl font-bold">{t('cart')} is empty</h1>
          <p className="text-sm text-gray-400">Add products to your cart from catalog before checking out.</p>
          <Link
            to="/"
            className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-full transition shadow-lg shadow-purple-600/20"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        {/* Back navigation */}
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
          <ArrowLeft size={16} />
          {t('back')}
        </Link>

        {/* Hero Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-linear-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            {t('checkout')}
          </h1>
          <p className="text-gray-400 font-medium">Verify your items, select fulfillment, and choose payment method</p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
          
          {/* LEFT COLUMN: Customer Details & Payment Options */}
          <div className="space-y-6">
            
            {/* Customer details form */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[30px] p-6 shadow-xl border border-white/15">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-pink-400 rounded-full"></div>
                {t('customerDetails')}
              </h2>
              
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder={t('name')}
                    value={customer.name}
                    onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 focus:ring-1 focus:ring-pink-500/30 transition-all text-sm font-medium"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder={t('email')}
                      value={customer.email}
                      onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 focus:ring-1 focus:ring-pink-500/30 transition-all text-sm font-medium"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      placeholder={t('phone')}
                      value={customer.phone}
                      onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 focus:ring-1 focus:ring-pink-500/30 transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="relative group">
                    <div className="absolute top-4 left-4 pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                      <MapPin size={18} />
                    </div>
                    <textarea
                      placeholder={t('deliveryAddress')}
                      value={customer.address}
                      onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 focus:ring-1 focus:ring-pink-500/30 transition-all text-sm font-medium resize-none"
                      rows={3}
                      required
                    />
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute top-4 left-4 pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                    <Notebook size={18} />
                  </div>
                  <textarea
                    placeholder={t('notes')}
                    value={customer.notes}
                    onChange={(e) => setCustomer(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 focus:ring-1 focus:ring-pink-500/30 transition-all text-sm font-medium resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[30px] p-6 shadow-xl border border-white/15">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                Select Payment Method
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between relative ${
                      paymentMethod === option.id
                        ? 'bg-purple-600/10 border-purple-500/80 text-white ring-1 ring-purple-500/30 shadow-lg'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Active Checkmark */}
                    {paymentMethod === option.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white scale-90 border border-purple-400">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none">{option.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm leading-tight pr-5 flex items-center gap-1.5">
                          {option.name}
                          {option.popular && (
                            <span className="bg-yellow-500/10 text-yellow-300 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border border-yellow-500/20">
                              Popular
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 pr-4">{option.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Cart Items & Order Summary */}
          <div className="space-y-6">
            
            {/* Delivery/pickup selector */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[30px] p-6 shadow-xl border border-white/15">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                Fulfillment Option
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    deliveryType === 'delivery'
                      ? 'bg-purple-600/15 border-purple-500 text-purple-300 shadow-md'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg font-bold">{t('delivery')}</span>
                  <span className="text-xs text-gray-400">{subtotal < 100 ? '+₹20' : t('free')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    deliveryType === 'pickup'
                      ? 'bg-green-600/15 border-green-500 text-green-300 shadow-md'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg font-bold">{t('pickup')}</span>
                  <span className="text-xs text-gray-400">{t('free')}</span>
                </button>
              </div>
            </div>

            {/* Cart summary panel */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[30px] p-6 shadow-xl border border-white/15 max-h-[300px] overflow-y-auto space-y-4">
              <h2 className="text-xl font-bold border-b border-white/10 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-purple-400 rounded-full"></div>
                  {t('cart')}
                </span>
                <span className="text-xs text-gray-400 font-semibold">{items.length} unique items</span>
              </h2>
              
              <div className="divide-y divide-white/5">
                {items.map(item => (
                  <div key={item.product.id} className="py-3.5 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl select-none shrink-0">{item.product.emoji}</span>
                        <h4 className="font-semibold text-sm truncate text-white pr-2">{item.product.name}</h4>
                      </div>
                      <p className="text-xs text-purple-300 font-bold mt-1">
                        ₹{item.product.price} <span className="text-gray-400 font-normal">x {item.quantity}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <QuantityStepper
                        quantity={item.quantity}
                        onIncrease={() => updateQuantity(item.product.id, item.quantity + 1)}
                        onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
                      />
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill details and place order action */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[30px] p-6 shadow-xl border border-white/15 space-y-5">
              <h2 className="text-xl font-bold flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                Bill Details
              </h2>
              
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{t('delivery')}</span>
                  <span className="font-semibold text-white">
                    {deliveryCharge > 0 ? `₹${deliveryCharge}` : t('free')}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between text-lg font-bold">
                  <span>{t('total')}</span>
                  <span className="bg-linear-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">₹{total}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-4 py-4 bg-linear-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-2xl font-bold text-base transition-all shadow-[0_12px_36px_-10px_rgba(124,111,233,0.6)] hover:shadow-[0_12px_36px_-5px_rgba(124,111,233,0.7)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-98"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;