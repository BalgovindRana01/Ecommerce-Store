import { useCartStore } from '../store';
import { useTranslation } from '../utils/useTranslation';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, getTotal, getItemCount } = useCartStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md transform bg-[#0b0c16]/95 border-l border-white/10 text-white shadow-2xl transition-all duration-300 flex flex-col backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold tracking-wide">
                {t('cart')} ({getItemCount()})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-4xl shadow-inner">
                  🛒
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">Your cart is empty</h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs">
                    Browse our premium collections and add items to your cart!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 px-6 py-2.5 text-sm font-medium hover:bg-purple-600/35 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 shadow-lg hover:border-white/10 transition-all"
                >
                  {/* Image/Emoji Section */}
                  <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                    {item.product.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate text-base leading-tight">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {t(`categories.${item.product.category}`)}
                    </p>
                    <p className="text-purple-300 font-bold text-sm mt-1">
                      ₹{item.product.price}
                    </p>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex flex-col items-end justify-between h-16">
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-1 scale-90">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2.5 text-xs font-semibold select-none text-purple-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="border-t border-white/10 bg-[#07070d]/80 px-6 py-6 space-y-4">
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-400">{t('subtotal')}</span>
                <span className="font-semibold text-white">₹{getTotal()}</span>
              </div>
              <div className="text-xs text-gray-400">
                {t('deliveryCharge')}
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-linear-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold text-md transition-all shadow-[0_12px_36px_-10px_rgba(124,111,233,0.6)] transform active:scale-98"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
