
import { NavLink } from 'react-router-dom';
import { TicketPercent, Map, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const BottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/', icon: 'logo', label: t('home') },
    { to: '/discount', icon: TicketPercent, label: t('discount') },
    { to: '/map', icon: Map, label: t('map') },
    { to: '/profile', icon: User, label: t('profile') },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-stone-100 z-50"
      data-testid="bottom-navigation"
    >
      <div className="max-w-md mx-auto h-20 flex justify-around items-center px-4 pb-safe">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={`nav-${label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                isActive
                  ? 'text-primary bg-primary-50'
                  : 'text-stone-500 hover:text-stone-700'
              }`
            }
          >
            {Icon === 'logo' ? (
              <img
                src="/logo.png"
                alt="Home"
                className="w-6 h-6 object-contain"
              />
            ) : (
              <Icon size={24} strokeWidth={2} />
            )}
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
