
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Leaf, Droplets, Users, HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SideMenu = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState(null);
  const [sectionContent, setSectionContent] = useState(null);
  const [communityStats, setCommunityStats] = useState(null);

  const menuItems = [
    { id: 'about', icon: Info, label: t('whoWeAre'), endpoint: '/info/about' },
    { id: 'biodiesel', icon: Leaf, label: t('whatIsBiodiesel'), endpoint: '/info/biodiesel' },
    { id: 'glycerin', icon: Droplets, label: t('glycerin'), endpoint: '/info/glycerin' },
    { id: 'community', icon: Users, label: t('community'), endpoint: '/info/community' },
    { id: 'howItWorks', icon: HelpCircle, label: t('howItWorks'), endpoint: null },
  ];

  const fetchSectionContent = async (endpoint) => {
    if (!endpoint) {
      setSectionContent({
        title: t('howItWorks'),
        content: "1. Collect your used cooking oil\n2. Request a pickup through the app\n3. Our courier collects it from your door\n4. Earn discounts from partner stores\n5. Your oil becomes biodiesel!"
      });
      return;
    }
    try {
      const response = await axios.get(`${API}${endpoint}`);
      setSectionContent(response.data);
      if (endpoint === '/info/community') {
        setCommunityStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const handleItemClick = (item) => {
    setActiveSection(item.id);
    fetchSectionContent(item.endpoint);
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
            data-testid="menu-backdrop"
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl z-[60] flex flex-col"
            data-testid="side-menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Colloil"
                  className="w-8 h-8 object-contain"
                />
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: "Comic Sans MS" }}
                >
                  Colloil
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                aria-label="Close menu"
                data-testid="close-menu-btn"
              >
                <X size={24} className="text-stone-600" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {!activeSection ? (
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-stone-50 transition-colors text-left"
                      data-testid={`menu-${item.id}`}
                    >
                      <div className="p-2 rounded-xl bg-primary-50">
                        <item.icon size={20} className="text-primary" />
                      </div>
                      <span className="font-medium text-stone-800">{item.label}</span>
                    </button>
                  ))}
                </nav>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => setActiveSection(null)}
                    className="text-primary font-medium flex items-center gap-2"
                    data-testid="back-to-menu"
                  >
                    ← Back
                  </button>
                  
                  {sectionContent && (
                    <div className="space-y-4">
                      <h3 className="font-outfit font-bold text-xl text-stone-800">
                        {sectionContent.title}
                      </h3>
                      
                      {activeSection === 'community' && communityStats ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-primary-50 rounded-2xl p-4 text-center">
                              <p className="text-3xl font-bold text-primary">
                                {communityStats.total_users}
                              </p>
                              <p className="text-sm text-stone-600">Members</p>
                            </div>
                            <div className="bg-secondary-50 rounded-2xl p-4 text-center">
                              <p className="text-3xl font-bold text-secondary">
                                {communityStats.total_oil_collected?.toFixed(1)}L
                              </p>
                              <p className="text-sm text-stone-600">Oil Collected</p>
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-2xl p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">
                              {communityStats.co2_saved_kg?.toFixed(1)} kg
                            </p>
                            <p className="text-sm text-stone-600">CO₂ Saved</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                          {sectionContent.content}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition-colors"
                data-testid="logout-btn"
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
