import { useTranslation } from '../utils/useTranslation';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative mb-5">
      <input
        type="text"
        placeholder={t('search')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border border-white/10 bg-white/10 px-5 py-4 pr-14 text-white placeholder:text-gray-400 shadow-[0_15px_50px_-35px_rgba(0,0,0,0.65)] outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
      />
      <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
    </div>
  );
};

export default SearchBar;