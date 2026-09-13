import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { api } from '../utils/api';
import { useCartStore } from '../store';
import { useTranslation } from '../utils/useTranslation';
import ProductCard from '../components/ProductCard';
import CartButton from '../components/CartButton';
import { ArrowLeft, ShoppingBag, ShieldCheck, RefreshCw, Truck, Plus, Minus } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [imgError, setImgError] = useState(false);
  const { items, addItem, updateQuantity } = useCartStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cartItem = items.find(item => item.product.id === product?.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await api.getProduct(id);
        setProduct(data.product);
        setRelated(data.related);
        setImgError(false); // Reset image error state for new product
      } catch (error) {
        console.error('Failed to fetch product:', error);
        // Fallback to sample data for demo
        import('../data/sampleProducts').then(({ sampleProducts }) => {
          const prod = sampleProducts.find(p => p.id === id);
          if (prod) {
            setProduct(prod);
            setRelated(sampleProducts.filter(p => p.category === prod.category && p.id !== id).slice(0, 4));
            setImgError(false);
          }
        });
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-transparent text-white px-4 py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  const getCategoryGradient = (cat: string) => {
    switch (cat) {
      case 'grocery': return 'from-emerald-500/15 via-teal-500/5 to-transparent border-emerald-500/20';
      case 'dairy': return 'from-blue-500/15 via-cyan-500/5 to-transparent border-blue-500/20';
      case 'snacks': return 'from-amber-500/15 via-orange-500/5 to-transparent border-amber-500/20';
      case 'beverages': return 'from-red-500/15 via-rose-500/5 to-transparent border-rose-500/20';
      case 'household': return 'from-purple-500/15 via-indigo-500/5 to-transparent border-purple-500/20';
      case 'lifestyles': return 'from-pink-500/15 via-fuchsia-500/5 to-transparent border-fuchsia-500/20';
      case 'fashion': return 'from-sky-500/15 via-indigo-500/5 to-transparent border-sky-500/20';
      case 'electronic': return 'from-indigo-500/15 via-violet-500/5 to-transparent border-violet-500/20';
      default: return 'from-gray-500/15 via-slate-500/5 to-transparent border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        
        {/* Back Link */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-purple-400 transition hover:text-purple-300 hover:translate-x-[-2px] duration-200"
        >
          <ArrowLeft size={16} />
          {t('back')}
        </Link>

        {/* Product Card Details */}
        <article className="overflow-hidden rounded-[40px] border border-white/10 bg-linear-to-br from-white/5 to-white/[0.02] p-6 md:p-10 shadow-[0_40px_120px_-90px_rgba(124,111,233,0.8)] backdrop-blur-xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            
            {/* Left Side Showcase */}
            <div className={`relative w-full aspect-video md:aspect-square lg:aspect-auto lg:h-[460px] rounded-3xl border flex items-center justify-center bg-linear-to-b ${getCategoryGradient(product.category)} overflow-hidden`}>
              {product.image && !imgError ? (
                <img
                  src={product.image}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover shadow-2xl"
                />
              ) : (
                <div className="text-[120px] drop-shadow-2xl select-none animate-pulse">
                  {product.emoji}
                </div>
              )}
              <span className="absolute top-4 left-4 rounded-full bg-[#07070d]/60 backdrop-blur-md px-4.5 py-1.5 text-xs font-bold uppercase tracking-wider border border-white/5">
                {t(`categories.${product.category}`)}
              </span>
            </div>

            {/* Right Side Content Details */}
            <div className="flex flex-col justify-between h-full space-y-8">
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 text-xs font-bold tracking-wider text-purple-300 uppercase">
                  Premium Essentials
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {product.name}
                </h1>
                
                {/* Price Display */}
                <div className="flex items-baseline gap-2 pt-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Offer Price</p>
                  <p className="text-4xl font-extrabold text-purple-300">₹{product.price}</p>
                </div>
                
                <div className="border-t border-white/5 pt-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed font-medium">
                    {product.description || 'Experience high-quality goodness with our hand-picked product. Guaranteed fresh, carefully selected, and securely packed to ensure it reaches you in the finest condition.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons Block */}
              <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-6 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block">Fulfillment</span>
                    <span className="text-xs font-bold text-green-400 mt-1 block">⚡ In Stock - Ready to Ship</span>
                  </div>

                  {quantity > 0 ? (
                    <div className="flex items-center bg-purple-600 border border-purple-500 rounded-full p-1 shadow-lg shadow-purple-600/15">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-5 text-sm font-extrabold select-none text-white min-w-[24px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addItem(product)}
                      className="rounded-full bg-purple-600 hover:bg-purple-500 text-white px-8 py-3.5 text-sm font-bold shadow-lg shadow-purple-600/20 transition-all hover:scale-102 flex items-center gap-2"
                    >
                      <ShoppingBag size={16} />
                      {t('addToCart')}
                    </button>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="border-t border-white/5 pt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-gray-400">
                  <div className="flex flex-col items-center gap-1.5">
                    <Truck size={14} className="text-purple-400" />
                    <span className="font-semibold leading-tight">{t('deliveryCharge') || 'Fast Shipping'}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <ShieldCheck size={14} className="text-purple-400" />
                    <span className="font-semibold leading-tight">100% Secure Checkout</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <RefreshCw size={14} className="text-purple-400" />
                    <span className="font-semibold leading-tight">Easy Local Returns</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </article>

        {/* Related Products Grid */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
              <h2 className="text-2xl font-bold text-white tracking-wide">{t('relatedProducts')}</h2>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Matching Category</span>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {related.map(rel => (
                <Link key={rel.id} to={`/product/${rel.id}`} className="block">
                  <ProductCard product={rel} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating cart CTA button */}
      <CartButton onClick={() => navigate('/checkout')} />
    </div>
  );
};

export default ProductDetail;