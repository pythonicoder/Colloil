
import { useState } from 'react';
import { Menu } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import SideMenu from './SideMenu';

const Header = ({ showMenu = true }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          {/* Menu Button */}
          {showMenu ? (
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Open menu"
              data-testid="menu-button"
            >
              <Menu size={24} className="text-stone-700" />
            </button>
          ) : (
            <div className="w-10" />
          )}

          {/* Logo */}
          <h1 
            className="text-2xl font-bold text-stone-800 drop-shadow-sm"
            style={{ fontFamily: "Comic Sans MS "}}
            data-testid="app-logo"
          >
            Colloil
          </h1>

          {/* Language Toggle */}
          <LanguageToggle />
        </div>
      </header>

      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Header;
