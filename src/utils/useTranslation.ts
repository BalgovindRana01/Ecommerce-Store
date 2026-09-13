import { useI18nStore } from '../store';
import { translations } from './translations';

const getNestedTranslation = (obj: Record<string, any>, path: string) =>
  path.split('.').reduce((current, segment) => {
    if (current && typeof current === 'object') {
      return current[segment];
    }
    return undefined;
  }, obj);

export const useTranslation = () => {
  const { language } = useI18nStore();

  const t = (key: string): string => {
    const value = getNestedTranslation(translations[language] as Record<string, any>, key);
    return typeof value === 'string' ? value : key;
  };

  return { t, language };
};