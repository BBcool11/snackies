import { useState, useEffect } from 'react';
import { Search, User, X, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ViewType } from '@/types';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSearch?: (query: string) => void;
  onReturnHome?: () => void;
}

export function Navigation({ currentView, onViewChange, onSearch, onReturnHome }: NavigationProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('snackies_user_logged_in');
    setIsLoggedIn(!!user);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const navItems: { id: ViewType; labelKey: string }[] = [
    { id: 'exhibition', labelKey: 'nav.exhibition' },
    { id: 'curation', labelKey: 'nav.curation' },
    { id: 'traces', labelKey: 'nav.traces' },
  ];

  return (
    <>
      {/* Desktop & Mobile Navigation - Fixed Top */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled
            ? 'bg-rice-paper/95 backdrop-blur-nav border-b border-divider'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <button onClick={onReturnHome} className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded bg-card-bg flex items-center justify-center transition-colors group-hover:bg-cinnabar/10">
                <span className="font-serif-cn text-sm font-semibold text-ink group-hover:text-cinnabar transition-colors">
                  食
                </span>
              </div>
              <span className="font-sans text-[13px] font-semibold text-secondary-text tracking-wide">
                snackies.app
              </span>
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`nav-link py-1 ${currentView === item.id ? 'active text-ink' : ''}`}
                >
                  <span className="font-serif-cn text-[13px]">{t(item.labelKey)}</span>
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-card-bg transition-colors"
              >
                {showSearch ? <X className="w-4 h-4 text-secondary-text" /> : <Search className="w-4 h-4 text-secondary-text" />}
              </button>

              <button
                onClick={toggleLanguage}
                className="px-2 py-1 text-[11px] font-sans text-secondary-text hover:text-ink transition-colors"
              >
                {language === 'zh' ? '中 / EN' : 'EN / 中'}
              </button>

              <button 
                onClick={() => navigate('/login')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-divider rounded-full text-[11px] text-secondary-text hover:border-secondary-text hover:text-ink transition-colors"
              >
                <span className="font-serif-cn">{isLoggedIn ? t('nav.guest_log') : (language === 'zh' ? '登录' : 'Login')}</span>
              </button>

              <button
                onClick={() => onViewChange('archive')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentView === 'archive' ? 'bg-ink text-rice-paper' : 'bg-card-bg hover:bg-ink/10'
                }`}
              >
                <User className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden w-8 h-8 flex items-center justify-center"
              >
                <Menu className="w-5 h-5 text-secondary-text" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="border-t border-divider bg-rice-paper/95 backdrop-blur-nav">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary-text" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search_placeholder')}
                  className="w-full bg-card-bg rounded-full pl-11 pr-4 py-2.5 text-[14px] font-serif-cn text-ink placeholder:text-tertiary-text focus:outline-none focus:ring-1 focus:ring-ink/20"
                />
              </form>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[99] md:hidden">
          <div className="absolute inset-0 bg-ink/20" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute top-14 left-0 right-0 bg-rice-paper border-b border-divider p-4 shadow-lg">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onViewChange(item.id); setShowMobileMenu(false); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                    currentView === item.id ? 'bg-ink text-rice-paper' : 'bg-card-bg text-ink'
                  }`}
                >
                  <span className="font-serif-cn text-[15px]">{t(item.labelKey)}</span>
                </button>
              ))}
              <button
                onClick={() => { onViewChange('archive'); setShowMobileMenu(false); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                  currentView === 'archive' ? 'bg-ink text-rice-paper' : 'bg-card-bg text-ink'
                }`}
              >
                <span className="font-serif-cn text-[15px]">{t('nav.archive')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-rice-paper border-t border-divider md:hidden safe-area-pb">
        <div className="flex items-center justify-around h-[60px]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 ${currentView === item.id ? 'text-ink' : 'text-tertiary-text'}`}
            >
              <span className="font-serif-cn text-[11px]">{t(item.labelKey)}</span>
            </button>
          ))}
          <button
            onClick={() => onViewChange('archive')}
            className={`flex flex-col items-center gap-1 py-2 px-4 ${currentView === 'archive' ? 'text-ink' : 'text-tertiary-text'}`}
          >
            <span className="font-serif-cn text-[11px]">{language === 'zh' ? '卷宗' : 'Archive'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
