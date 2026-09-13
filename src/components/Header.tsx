import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useI18nStore, useCartStore } from '../store';
import { useTranslation } from '../utils/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { Search, User, LogOut, Languages, ShoppingCart, ShieldAlert, Package } from 'lucide-react';
import CartDrawer from './CartDrawer';

const Header = () => {
  const { language, setLanguage } = useI18nStore();
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchVal = searchParams.get('search') || '';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (location.pathname !== '/') {
      navigate(`/?search=${encodeURIComponent(val)}`);
    } else {
      if (val) {
        navigate(`/?search=${encodeURIComponent(val)}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      navigate('/', { replace: true });
      // clear search params
      navigate(location.pathname);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07070d]/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          
          {/* Logo / Title */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-all">
              🛍️
            </div>
            <div className="hidden sm:block">
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-purple-400 block leading-none">
                {t('storeName')}
              </span>
              <span className="text-lg font-bold text-white tracking-wide block mt-1 leading-none">
                BuyinHome
              </span>
            </div>
          </Link>

          {/* Search Bar - Integrated in Header */}
          <div className="flex-1 max-w-md relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t('search')}
              value={searchVal}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Delivery Alert Label (Desktop Only) */}
            <div className="hidden lg:block rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wider text-gray-300">
              ⚡ {t('deliveryCharge')}
            </div>

            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="rounded-full p-2.5 bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Change Language"
            >
              <Languages size={16} />
              <span className="hidden md:inline">
                {language === 'en' ? 'हिन्दी' : 'English'}
              </span>
            </button>

            <Link
              to="/orders"
              className="rounded-full p-2.5 bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title={t('myOrders')}
            >
              <Package size={16} />
              <span className="hidden md:inline">{t('myOrders')}</span>
            </Link>

            {/* User Account Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`rounded-full p-2.5 border flex items-center justify-center gap-1.5 transition-colors ${
                    isUserMenuOpen
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <User size={16} />
                  <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0e0f19] border border-white/10 shadow-2xl p-2 z-50 text-sm">
                    <div className="px-3 py-2 border-b border-white/5 text-xs text-gray-400">
                      Signed in as <span className="font-semibold text-gray-200 block truncate mt-0.5">{user?.email}</span>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
                    >
                      📦 <span className="font-medium">{t('myOrders')}</span>
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      🛡️ <span className="font-medium">{t('admin')}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <LogOut size={16} />
                      <span className="font-medium">{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-white transition-all hover:bg-white/5 border border-transparent"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-purple-500 shadow-md shadow-purple-600/20"
                >
                  {t('signUp')}
                </Link>
              </div>
            )}

            {/* Admin Access (Fallback when not logged in) */}
            {!isAuthenticated && (
              <Link
                to="/admin"
                className="rounded-full p-2.5 bg-orange-600/25 border border-orange-500/30 text-orange-300 hover:text-orange-200 hover:bg-orange-600/40 transition-colors"
                title="Admin Panel"
              >
                <ShieldAlert size={16} />
              </Link>
            )}

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full p-2.5 bg-linear-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-500 hover:to-fuchsia-500 shadow-md transition-all flex items-center justify-center group"
            >
              <ShoppingCart size={16} className="group-hover:scale-105 transition-transform" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 border border-[#07070d] text-[10px] font-bold text-black flex items-center justify-center animate-bounce">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;