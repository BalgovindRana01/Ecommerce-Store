import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

const QuantityStepper = ({ quantity, onIncrease, onDecrease }: QuantityStepperProps) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onDecrease}
        className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600"
      >
        <Minus size={16} />
      </button>
      <span className="text-white">{quantity}</span>
      <button
        onClick={onIncrease}
        className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default QuantityStepper;