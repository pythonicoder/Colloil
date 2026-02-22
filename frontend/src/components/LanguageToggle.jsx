
import { useLanguage } from '../i18n/LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-sm font-medium"
      data-testid="language-toggle"
    >
      <span className={language === 'en' ? 'text-primary font-bold' : 'text-stone-400'}>
        EN
      </span>
      <span className="text-stone-300">/</span>
      <span className={language === 'pl' ? 'text-primary font-bold' : 'text-stone-400'}>
        PL
      </span>
    </button>
  );
};

export default LanguageToggle;
