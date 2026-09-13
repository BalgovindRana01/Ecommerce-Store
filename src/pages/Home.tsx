import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { Product } from '../types';
import { api } from '../utils/api';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import CartButton from '../components/CartButton';
import { ArrowUpDown, Truck, Clock, Sparkles } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<string>('default');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category') || null;
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    api.getCatalog().then(setProducts).catch(console.error);
  }, []);

  const handleCategoryChange = (category: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;
    
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return sorted;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-transparent text-white px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        
        {/* Interactive Premium Hero Banner */}
        <section className="relative mb-12 overflow-hidden rounded-[40px] border border-white/10 bg-linear-to-br from-white/5 to-white/[0.02] p-8 md:p-12 shadow-[0_40px_120px_-90px_rgba(124,111,233,0.9)] backdrop-blur-xl group">
          <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent opacity-50 group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs font-semibold tracking-widest text-purple-300 uppercase">
                <Sparkles size={12} className="animate-pulse" />
                Hyperlocal Grocery & Goods
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-white tracking-tight">
                BuyinHome
                <span className="bg-linear-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent block mt-2">
                  Everything you need, fast.
                </span>
              </h2>
              <p className="max-w-lg text-sm md:text-base text-gray-300 leading-relaxed font-medium">
                Browse our curated selection of fresh produce, snacks, daily dairy, and essential lifestyle goods. Flat-rate rapid shipping or free local pickup.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 border border-white/5 px-4.5 py-3 text-xs font-semibold text-gray-200">
                  <Clock size={16} className="text-purple-400" />
                  <span>Picked in 15 mins</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 border border-white/5 px-4.5 py-3 text-xs font-semibold text-gray-200">
                  <Truck size={16} className="text-purple-400" />
                  <span>Flat ₹20 Delivery</span>
                </div>
              </div>
            </div>

            {/* Banner Deco Widgets */}
            <div className="grid grid-cols-2 gap-4 w-full lg:max-w-md">
              <div className="rounded-3xl bg-linear-to-b from-white/5 to-transparent border border-white/5 p-6 text-center shadow-lg transition-all duration-300 hover:border-purple-500/20 hover:scale-102">
                <div className="text-4xl mb-2 drop-shadow-md">🍚</div>
                <p className="font-bold text-white text-sm">Grocery & Kirana</p>
                <p className="text-[10px] text-gray-400 mt-1">Grains, spices, sugars</p>
              </div>
              <div className="rounded-3xl bg-linear-to-b from-white/5 to-transparent border border-white/5 p-6 text-center shadow-lg transition-all duration-300 hover:border-blue-500/20 hover:scale-102">
                <div className="text-4xl mb-2 drop-shadow-md">🥛</div>
                <p className="font-bold text-white text-sm">Fresh Dairy</p>
                <p className="text-[10px] text-gray-400 mt-1">Milk, butter, cottage paneer</p>
              </div>
              <div className="rounded-3xl bg-linear-to-b from-white/5 to-transparent border border-white/5 p-6 text-center shadow-lg transition-all duration-300 hover:border-amber-500/20 hover:scale-102">
                <div className="text-4xl mb-2 drop-shadow-md">🍪</div>
                <p className="font-bold text-white text-sm">Tasty Snacks</p>
                <p className="text-[10px] text-gray-400 mt-1">Biscuits, chips, popcorn</p>
              </div>
              <div className="rounded-3xl bg-linear-to-b from-white/5 to-transparent border border-white/5 p-6 text-center shadow-lg transition-all duration-300 hover:border-pink-500/20 hover:scale-102">
                <div className="text-4xl mb-2 drop-shadow-md">💅</div>
                <p className="font-bold text-white text-sm">Lifestyle</p>
                <p className="text-[10px] text-gray-400 mt-1">Shampoos, scents, washes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Controls row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex-1 overflow-x-auto select-none">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Sort selection widget */}
          <div className="flex items-center gap-2 text-sm shrink-0 self-end md:self-auto">
            <span className="text-gray-400 flex items-center gap-1.5 font-medium">
              <ArrowUpDown size={16} />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0e0f19] border border-white/10 rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-xs font-semibold"
            >
              <option value="default">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* Product Catalog Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedProducts.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} className="block">
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[30px] p-8 max-w-xl mx-auto space-y-4 shadow-xl">
            <div className="text-5xl">🔍</div>
            <h3 className="text-xl font-bold">No Products Found</h3>
            <p className="text-sm text-gray-400">
              We couldn't find any products matching "{searchQuery}" in this category. Try adjusting your search query or choosing another category.
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setSortBy('default');
              }}
              className="rounded-full bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:bg-purple-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating cart CTA button */}
      <CartButton onClick={() => navigate('/checkout')} />
    </div>
  );
};

export default Home;