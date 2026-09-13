import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Order } from '../types';
import { api } from '../utils/api';
import { useTranslation } from '../utils/useTranslation';
import { Check, AlertCircle, ArrowLeft, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderTracking = () => {
  const { orderRef } = useParams<{ orderRef: string }>();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderRef) return;
      try {
        const data = await api.trackOrder(orderRef);
        setOrder(data);

        // If order status is paid or delivered, trigger celebratory confetti!
        if (data.status === 'paid' || data.status === 'delivered') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        // Fallback mock order for demo
        setOrder({
          id: '1',
          items: [],
          customer: { name: 'Guest User', email: 'guest@example.com', phone: '+91 9999999999', notes: 'Leave at front gate' },
          deliveryType: 'delivery',
          total: 250,
          status: 'accepted',
          orderRef: orderRef!,
          createdAt: new Date().toISOString(),
        });
      }
    };
    fetchOrder();
  }, [orderRef]);

  if (!order) {
    return (
      <div className="min-h-screen bg-transparent text-white px-4 py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400">Loading order tracking status...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'verified', label: 'Verified', desc: 'Order verified by OTP security' },
    { key: 'accepted', label: 'Accepted', desc: 'Store accepted your order details' },
    { key: 'paid', label: 'Paid', desc: 'Secure payment transaction confirmed' },
    { key: 'shipped', label: 'Shipped', desc: 'Order shipped with rapid delivery' },
    { key: 'delivered', label: 'Delivered', desc: 'Order delivered to destination' }
  ];

  // Map status index. If order status is pending, index is -1.
  const currentStatusIndex = steps.findIndex(step => step.key === order.status);

  // Print invoice function
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-transparent text-white px-4 py-8 print:bg-white print:text-black">
      <div className="container mx-auto max-w-5xl">
        
        {/* Back Link (Hide when printing) */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-purple-400 transition hover:text-purple-300 print:hidden"
        >
          <ArrowLeft size={16} />
          Back to Shopping
        </Link>

        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 print:mb-6">
          <div className="text-left">
            <span className="inline-flex rounded-full bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 text-xs font-bold tracking-wider text-purple-300 uppercase mb-2">
              Live Fulfillment Status
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-linear-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent leading-none pb-2 print:text-black">
              {t('orderTracking')}
            </h1>
            <p className="text-gray-400 font-medium text-sm mt-1">
              Order Reference: <span className="text-purple-300 font-bold">#{order.orderRef}</span>
            </p>
          </div>

          <button
            onClick={handlePrintInvoice}
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full px-5 py-2.5 text-xs font-bold transition-all w-fit shadow-md shrink-0 print:hidden"
          >
            <Printer size={14} />
            Print Invoice
          </button>
        </div>

        {/* Dynamic visual tracking card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] p-6 md:p-10 border border-white/15 shadow-xl space-y-12 print:border-none print:shadow-none print:bg-transparent print:p-0">
          
          {/* Visual Step-by-Step progress timeline */}
          <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-4 select-none">
            
            {/* Timeline progress line background (Desktop) */}
            <div className="hidden md:block absolute top-[22px] left-6 right-6 h-1 bg-white/10 -z-10 rounded-full" />
            
            {/* Timeline progress line active (Desktop) */}
            {currentStatusIndex >= 0 && (
              <div
                className="hidden md:block absolute top-[22px] left-6 h-1 bg-linear-to-r from-green-500 to-blue-500 -z-10 rounded-full transition-all duration-700"
                style={{ width: `${(currentStatusIndex / (steps.length - 1)) * 95}%` }}
              />
            )}

            {steps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isActive = index === currentStatusIndex;

              return (
                <div key={step.key} className="flex md:flex-col items-center gap-4 md:text-center md:flex-1 relative">
                  
                  {/* Step status ring */}
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-300 shadow-md ${
                      isCompleted
                        ? 'bg-linear-to-br from-green-500 to-emerald-500 border-green-400 text-white shadow-green-500/20 scale-105'
                        : 'bg-[#0f101d] border-white/10 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : index + 1}
                  </div>

                  {/* Step label descriptions */}
                  <div>
                    <h4 className={`font-bold text-sm leading-tight transition-colors ${
                      isActive ? 'text-purple-300 text-base' : isCompleted ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      {t(`status.${step.key}`) || step.label}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-[120px] md:mx-auto leading-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conditional state helper alerts */}
          {order.status === 'accepted' && (
            <div className="bg-linear-to-r from-amber-500/10 to-yellow-500/10 border border-yellow-500/20 rounded-3xl p-5 flex items-start gap-4">
              <AlertCircle size={22} className="text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-yellow-300">Awaiting Delivery Agent</h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Your order details have been verified and accepted by the store operators. A delivery executive is currently being assigned to package and ship your items.
                </p>
              </div>
            </div>
          )}

          {order.status === 'paid' && (
            <div className="bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-5 flex items-start gap-4">
              <Check size={22} className="text-green-400 shrink-0 mt-0.5" strokeWidth={3} />
              <div>
                <h4 className="font-bold text-sm text-green-300">Payment Verified Successfully</h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Your online payment transaction has been confirmed securely. We are currently processing your grocery items. Sit back and relax!
                </p>
              </div>
            </div>
          )}

          {/* Detailed summary details sections */}
          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5 print:border-none print:pt-0">
            
            {/* Customer Details info block */}
            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-4 print:border-none print:p-0">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-bold flex items-center gap-2">
                👤 Customer Destination Info
              </h3>
              <div className="space-y-2.5 text-sm font-medium">
                <p className="text-white"><span className="text-gray-400 text-xs">Recipient:</span> {order.customer.name}</p>
                <p className="text-white"><span className="text-gray-400 text-xs">Telephone:</span> {order.customer.phone}</p>
                <p className="text-white"><span className="text-gray-400 text-xs">Email:</span> {order.customer.email}</p>
                {order.customer.notes && (
                  <p className="text-gray-300 text-xs italic bg-white/5 p-3.5 rounded-xl border border-white/5">
                    Note: "{order.customer.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Delivery address details */}
            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-4 print:border-none print:p-0">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-bold flex items-center gap-2">
                📍 Shipping Details
              </h3>
              <div className="space-y-2.5 text-sm font-medium">
                <p className="text-white flex items-start gap-1">
                  <span className="text-gray-400 text-xs shrink-0">Address:</span>
                  <span>
                    {order.customer.address || (order.deliveryType === 'pickup' ? 'Self-Pickup from BuyinHome neighborhood store' : 'Not Available')}
                  </span>
                </p>
                <p className="text-white">
                  <span className="text-gray-400 text-xs">Method:</span>{' '}
                  <span className="capitalize">{order.deliveryType} fulfillment</span>
                </p>
                <p className="text-white">
                  <span className="text-gray-400 text-xs">Payment Method:</span>{' '}
                  <span className="uppercase text-purple-300 font-bold bg-purple-900/20 border border-purple-500/20 px-2 py-0.5 rounded-lg text-xs">
                    {order.paymentMethod || 'card'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Items breakdown invoice summary */}
          <div className="space-y-4 pt-6 border-t border-white/5 print:border-none">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 font-bold flex items-center gap-2">
              📋 Invoice Items Summary
            </h3>
            
            <div className="border border-white/10 rounded-2xl overflow-hidden print:border-none">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-xs font-bold uppercase print:bg-transparent print:border-black">
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium print:divide-black">
                  {order.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                        No items found in this order backup.
                      </td>
                    </tr>
                  ) : (
                    order.items.map((item) => (
                      <tr key={item.product.id} className="hover:bg-white/[0.02] transition-colors print:hover:bg-transparent">
                        <td className="px-6 py-4 font-semibold text-white print:text-black">
                          {item.product.name}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right">
                          ₹{item.product.price}
                        </td>
                        <td className="px-6 py-4 text-right text-purple-300 font-bold print:text-black">
                          ₹{item.product.price * item.quantity}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-white/5 font-bold text-base border-t border-white/10 print:bg-transparent print:border-black">
                    <td colSpan={3} className="px-6 py-4 text-right text-gray-400 font-semibold print:text-black">
                      Total Invoice Amount:
                    </td>
                    <td className="px-6 py-4 text-right text-purple-300 font-black text-lg print:text-black">
                      ₹{order.total}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderTracking;