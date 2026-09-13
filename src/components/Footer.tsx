import { useTranslation } from '../utils/useTranslation';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/10 bg-[#06060c]/90 text-gray-400 py-12 mt-16 backdrop-blur-md">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white text-base">
              🛍️
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              BuyinHome
            </span>
          </Link>
          <p className="text-sm leading-relaxed">
            {t('tagline') || 'Everything on this platform for you. Quality essentials delivered directly to your doorstep in minutes.'}
          </p>
          <div className="flex items-center gap-2.5 text-xs text-purple-400 font-semibold bg-purple-900/10 border border-purple-800/20 px-3 py-2 rounded-xl w-fit">
            <ShieldCheck size={14} />
            <span>Secure SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* Categories Column */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase">Categories</h4>
          <ul className="space-y-2 text-sm">
            {['grocery', 'dairy', 'snacks', 'beverages', 'household', 'lifestyles'].map((cat) => (
              <li key={cat}>
                <Link
                  to={`/?category=${cat}`}
                  className="hover:text-purple-400 transition-colors"
                >
                  {t(`categories.${cat}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase">Customer Care</h4>
          <ul className="space-y-3.5 text-sm">
            <li className="flex items-center gap-2.5">
              <Phone size={14} className="text-purple-400 shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={14} className="text-purple-400 shrink-0" />
              <span>support@buyinhome.com</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={14} className="text-purple-400 shrink-0 mt-0.5" />
              <span>123, Kharido Lane, Neighborhood Mall, Delhi, India</span>
            </li>
          </ul>
        </div>

        {/* Payment Methods Column */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase">Secure Payments</h4>
          <p className="text-xs leading-relaxed">
            We support all major payment networks, localized UPI applications, Net Banking and Cash on Delivery.
          </p>
          <div className="flex flex-wrap gap-2 text-xl text-gray-300">
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 hover:border-purple-500/20 transition-colors">
              💳 Cards
            </span>
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 hover:border-purple-500/20 transition-colors">
              📱 UPI
            </span>
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 hover:border-purple-500/20 transition-colors">
              🏦 Net Banking
            </span>
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 hover:border-purple-500/20 transition-colors">
              💵 COD
            </span>
          </div>
        </div>

      </div>

      <div className="border-t border-white/5 mt-10 pt-6 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-xs gap-4">
          <p>&copy; {new Date().getFullYear()} BuyinHome - Kharido. All rights reserved.</p>
          <p className="flex items-center gap-1 leading-none">
            Made with <Heart size={10} className="text-red-500 fill-red-500" /> for your neighborhood.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;