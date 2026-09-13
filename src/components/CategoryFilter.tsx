import { useTranslation } from '../utils/useTranslation';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories = ['grocery', 'dairy', 'snacks', 'beverages', 'household', 'lifestyles', 'fashion', 'electronic'];

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8 flex flex-wrap gap-3 overflow-x-auto pb-1">
      <button
        onClick={() => onCategoryChange(null)}
        className={`rounded-full px-5 py-3 text-sm font-medium transition ${
          selectedCategory === null
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
            : 'bg-white/10 text-gray-200 hover:bg-white/20'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`rounded-full px-5 py-3 text-sm font-medium transition ${
            selectedCategory === cat
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'bg-white/10 text-gray-200 hover:bg-white/20'
          }`}
        >
          {t(`categories.${cat}`)}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;