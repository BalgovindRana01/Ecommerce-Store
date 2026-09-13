import { useState } from 'react';
import type { Product } from '../types';
import { useCartStore } from '../store';
import { useTranslation } from '../utils/useTranslation';
import { Plus, Minus, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { items, addItem, updateQuantity } = useCartStore();
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const getCategoryGradient = (cat: string) => {
    switch (cat) {
      case 'grocery': return 'from-emerald-500/15 via-teal-500/5 to-transparent border-emerald-500/20 text-emerald-300';
      case 'dairy': return 'from-blue-500/15 via-cyan-500/5 to-transparent border-blue-500/20 text-blue-300';
      case 'snacks': return 'from-amber-500/15 via-orange-500/5 to-transparent border-amber-500/20 text-amber-300';
      case 'beverages': return 'from-red-500/15 via-rose-500/5 to-transparent border-rose-500/20 text-rose-300';
      case 'household': return 'from-purple-500/15 via-indigo-500/5 to-transparent border-purple-500/20 text-purple-300';
      case 'lifestyles': return 'from-pink-500/15 via-fuchsia-500/5 to-transparent border-fuchsia-500/20 text-pink-300';
      case 'fashion': return 'from-sky-500/15 via-indigo-500/5 to-transparent border-sky-500/20 text-sky-300';
      case 'electronic': return 'from-indigo-500/15 via-violet-500/5 to-transparent border-violet-500/20 text-indigo-300';
      default: return 'from-gray-500/15 via-slate-500/5 to-transparent border-gray-500/20 text-gray-300';
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_60px_-40px_rgba(124,111,233,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-[0_24px_60px_-25px_rgba(124,111,233,0.55)]">
      {/* Glow highlight */}
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-purple-500 via-fuchsia-500 to-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Visual Showcase (Image / Emoji) */}
        <div className={`relative w-full aspect-square rounded-2xl border flex items-center justify-center bg-linear-to-b ${getCategoryGradient(product.category)} overflow-hidden`}>
          {product.image && !imgError ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="text-6xl transition-transform duration-300 group-hover:scale-110 drop-shadow-lg select-none">
              {product.emoji}
            </div>
          )}

          {/* Quick view icon overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="rounded-full bg-white/15 backdrop-blur-md p-3 text-white border border-white/20 transform scale-90 group-hover:scale-100 transition-transform">
              <Eye size={20} />
            </div>
          </div>

          <span className="absolute top-3 left-3 rounded-full bg-[#07070d]/60 backdrop-blur-md px-3 py-1 text-[9px] font-bold uppercase tracking-wider border border-white/5">
            {t(`categories.${product.category}`)}
          </span>
        </div>

        {/* Product Details */}
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-bold text-white leading-tight truncate group-hover:text-purple-200 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px] leading-relaxed">
            {product.description || 'No description available for this premium product.'}
          </p>
        </div>
      </div>

      {/* Actions Section */}
      <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Price</p>
          <p className="text-xl font-bold text-purple-300">₹{product.price}</p>
        </div>

        {quantity > 0 ? (
          <div className="flex items-center bg-purple-600 border border-purple-500 rounded-full p-1 shadow-lg shadow-purple-600/10">
            <button
              onClick={handleDecrease}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              <Minus size={14} />
            </button>
            <span className="px-3.5 text-sm font-bold select-none text-white min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="rounded-full bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-purple-600/15 hover:shadow-purple-500/20 transition-all hover:scale-102"
          >
            {t('addToCart')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;