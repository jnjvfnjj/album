import React, { useState } from 'react';
import { Camera, Plus, Globe, User, LogOut, Sparkles, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useI18n } from '../../utils/i18n';

interface NavbarProps {
  onCreateAlbum?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCreateAlbum }) => {
  const { user, signOut, isDemoMode, enableDemoMode } = useAuth();
  const { pathname, navigate } = useRouter();
  const { t, lang, setLanguage } = useI18n();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ru' : 'en';
    setLanguage(nextLang);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand title, single line */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex cursor-pointer items-center gap-3 whitespace-nowrap shrink-0 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 shadow-sm">
            <Camera className="h-5 w-5 text-neutral-200" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">
              {t.brandName}
            </span>
            <span className="hidden text-xs text-neutral-500 sm:inline">· Live</span>
          </div>
        </div>

        {/* Zone 2: 4 nav links, single-line text with subtle hover */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-400">
          <button
            onClick={() => navigate('/dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              pathname === '/dashboard' || pathname === '/' ? 'text-white font-semibold' : ''
            }`}
          >
            {t.dashboard}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              pathname.startsWith('/albums') && pathname !== '/albums/new' ? 'text-white' : ''
            }`}
          >
            {t.myAlbums}
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              pathname === '/settings' ? 'text-white font-semibold' : ''
            }`}
          >
            {t.settings}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            title="Toggle Language (EN / RU)"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="uppercase">{lang}</span>
          </button>

          {/* Create Album Button */}
          {onCreateAlbum ? (
            <button
              onClick={onCreateAlbum}
              className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3.5 py-2 text-xs font-semibold text-neutral-950 transition-all hover:bg-white active:scale-95 shadow-sm whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t.createAlbum}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/albums/new')}
              className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3.5 py-2 text-xs font-semibold text-neutral-950 transition-all hover:bg-white active:scale-95 shadow-sm whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t.createAlbum}</span>
            </button>
          )}

          {/* Profile / Demo Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex h-9 items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 text-xs text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-bold text-neutral-300">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden max-w-[90px] truncate sm:inline">
                {user?.displayName || 'User'}
              </span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-neutral-800 bg-neutral-900 py-1 shadow-xl z-50">
                <div className="border-b border-neutral-800 px-3 py-2 text-xs">
                  <p className="font-medium text-white">{user?.displayName}</p>
                  <p className="truncate text-neutral-400">{user?.email}</p>
                  {isDemoMode && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-sky-400">
                      <Sparkles className="h-3 w-3" />
                      <span>Demo Mode Active</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{t.settings}</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>Supabase Schema & SQL</span>
                </button>

                {!isDemoMode ? (
                  <button
                    onClick={() => {
                      enableDemoMode();
                      setProfileDropdownOpen(false);
                      navigate('/dashboard');
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-sky-400 hover:bg-neutral-800"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Switch to Demo Account</span>
                  </button>
                ) : null}

                <div className="border-t border-neutral-800 my-1" />

                <button
                  onClick={() => {
                    signOut();
                    setProfileDropdownOpen(false);
                    navigate('/auth');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-neutral-800"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t.signOut}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
