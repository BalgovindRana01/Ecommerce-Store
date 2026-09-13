import { useCartStore } from '../store';
import { ShoppingCart } from 'lucide-react';

interface CartButtonProps {
  onClick: () => void;
}

const CartButton = ({ onClick }: CartButtonProps) => {
  const { getItemCount } = useCartStore();
  const count = getItemCount();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full bg-linear-to-r from-purple-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-20px_rgba(124,111,233,0.85)] transition hover:scale-105"
    >
      <ShoppingCart size={20} />
      <span>Cart</span>
      {count > 0 && (
        <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-black">{count}</span>
      )}
    </button>
  );
};

export default CartButton;