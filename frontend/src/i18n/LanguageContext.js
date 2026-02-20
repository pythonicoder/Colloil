
import { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('colloil-language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('colloil-language', language);
  }, [language]);

  const t = (key) => getTranslation(language, key);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'pl' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
