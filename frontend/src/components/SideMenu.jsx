import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Leaf, Droplets, Users, HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";

const SideMenu = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Info, label: t('whoWeAre'), route: '/about' },
    { icon: Leaf, label: t('whatIsBiodiesel'), route: '/biodiesel' },
    { icon: Droplets, label: t('glycerin'), route: '/glycerin' },
    { icon: Users, label: t('community'), route: '/community' },
    { icon: HelpCircle, label: t('howItWorks'), route: '/how-it-works' },
  ];

  const handleItemClick = (route) => {
    navigate(route);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[55]"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl z-[60] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Colloil" className="w-8 h-8" />
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: "Comic Sans MS" }}
                >
                  Colloil
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleItemClick(item.route)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-stone-50 transition-colors text-left"
                  >
                    <div className="p-2 rounded-xl bg-primary-50">
                      <item.icon size={20} className="text-primary" />
                    </div>
                    <span className="font-medium text-stone-800">
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200"
              >
                {t('logout')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;