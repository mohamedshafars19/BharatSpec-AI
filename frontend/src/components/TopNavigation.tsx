import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  BookOpen,
  Bookmark,
  History,
  FileText,
  Search,
  Bell,
  Command,
  ShieldCheck,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  HelpCircle,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export const TopNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { openSearch, isNotificationsOpen, setIsNotificationsOpen, notificationsCount } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when route changes
  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        // Only close if not clicking the toggle button
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        if (!toggleBtn?.contains(target)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsNotificationsOpen]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Analysis', path: '/analyze', icon: Sparkles, badge: 'Auditor' },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Standards', path: '/standards', icon: BookOpen },
    { label: 'Saved', path: '/saved', icon: Bookmark },
    { label: 'History', path: '/history', icon: History },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-[#EAE2D6] shadow-2xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* LEFT: Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 focus:outline-none group">
            <div className="w-8 h-8 rounded bg-[#20241F] flex items-center justify-center text-white shrink-0 group-hover:bg-[#313730] transition-colors">
              <ShieldCheck className="w-5 h-5 text-[#8B9A6E]" />
            </div>
            <div>
              <span className="font-heading font-bold text-base tracking-tight text-[#20241F] block leading-none">
                BharatSpec <span className="text-[#8B9A6E]">AI</span>
              </span>
              <span className="text-[10px] text-[#7E867B] font-medium leading-none block mt-1">
                Procurement Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#FAF7F2] text-[#20241F] border border-[#8B9A6E]/50 shadow-2xs'
                      : 'text-[#575E54] hover:text-[#20241F] hover:bg-[#FAF7F2] border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8B9A6E]' : 'text-[#7E867B]'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-[#EBF2EC] text-[#3C5A40]">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* RIGHT: Search, Notifications, Profile, Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global Search Trigger (Ctrl + K) */}
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-md bg-[#FAF7F2] border border-[#E2DBD0] hover:border-[#CDC4B6] text-xs text-[#575E54] transition-all"
            title="Search workspace (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-[#7E867B]" />
            <span className="hidden sm:inline text-xs text-[#7E867B]">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-mono bg-white border border-[#E2DBD0] rounded text-[#7E867B]">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-md hover:bg-[#FAF7F2] text-[#575E54] relative transition-colors focus:outline-none"
              title="Attention & Notifications"
              aria-label="Attention notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B7791F]" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2DBD0] rounded-lg shadow-xl p-3 z-50 animate-fade-in text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EAE2D6]">
                  <span className="font-bold text-[#20241F]">Procurement Attention Center</span>
                  <span className="text-[10px] text-[#8B9A6E] font-semibold">{notificationsCount} Actionable</span>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/analyze"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="block p-2 rounded bg-[#FAF4E8] border border-[#EFE0C2] hover:bg-[#F5EDD8] transition-colors"
                  >
                    <div className="font-semibold text-[#8C5C15] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Testing Protocol Missing</span>
                    </div>
                    <div className="text-[11px] text-[#575E54] mt-0.5">
                      Municipal street light tender lacks NABL laboratory test schedule.
                    </div>
                  </Link>

                  <Link
                    to="/standards/DEMO-STD-001"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="block p-2 rounded bg-[#FAF7F2] border border-[#EAE2D6] hover:bg-[#F3EFE8] transition-colors"
                  >
                    <div className="font-semibold text-[#20241F] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8B9A6E] shrink-0" />
                      <span>Version Audit Notice</span>
                    </div>
                    <div className="text-[11px] text-[#575E54] mt-0.5">
                      DEMO-STD-001 has 2 active amendments (2023 & 2024).
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          {user && (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-md hover:bg-[#FAF7F2] transition-colors focus:outline-none"
                aria-label="User profile menu"
                aria-expanded={isProfileOpen}
              >
                <div className="w-7 h-7 rounded-full bg-[#20241F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-[#20241F] leading-tight truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-[#7E867B] leading-tight truncate max-w-[120px]">
                    {user.organization || 'Procurement Officer'}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-[#7E867B] hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2DBD0] rounded-lg shadow-xl py-2 z-50 animate-fade-in text-xs">
                  <div className="px-4 py-2 border-b border-[#EAE2D6]">
                    <div className="font-bold text-[#20241F] truncate">{user.name}</div>
                    <div className="text-[11px] text-[#7E867B] truncate">{user.email}</div>
                    {user.organization && (
                      <div className="text-[10px] text-[#8B9A6E] font-medium mt-0.5 truncate">
                        {user.organization}
                      </div>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      to="/about"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#575E54] hover:text-[#20241F] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[#7E867B]" />
                      <span>About & Methodology</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        openSearch();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[#575E54] hover:text-[#20241F] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <Search className="w-4 h-4 text-[#7E867B]" />
                      <span>Search Workspace</span>
                    </button>
                  </div>

                  <div className="border-t border-[#EAE2D6] pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[#B94A48] hover:bg-[#F8ECEC] transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4 text-[#B94A48]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-[#575E54] hover:bg-[#FAF7F2] hover:text-[#20241F] transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden bg-white border-b border-[#EAE2D6] px-4 py-3 space-y-1 shadow-lg animate-fade-in"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#FAF7F2] text-[#20241F] border border-[#8B9A6E]/50'
                      : 'text-[#575E54] hover:text-[#20241F] hover:bg-[#FAF7F2]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#8B9A6E]" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EBF2EC] text-[#3C5A40]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-2 mt-2 border-t border-[#EAE2D6] space-y-1">
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#575E54] hover:text-[#20241F] hover:bg-[#FAF7F2] rounded-md transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-[#7E867B]" />
              <span>About & Methodology</span>
            </Link>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#B94A48] hover:bg-[#F8ECEC] rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 text-[#B94A48]" />
                <span>Sign Out ({user.name})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
