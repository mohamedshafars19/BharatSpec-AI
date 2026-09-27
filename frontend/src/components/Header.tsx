import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Command,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { openSearch, isNotificationsOpen, setIsNotificationsOpen, notificationsCount } = useUI();
  const { user } = useAuth();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/projects/')) return { section: 'Projects', current: 'Project Workspace' };
    if (path === '/projects') return { section: 'Workspace', current: 'Projects' };
    if (path === '/analyze') return { section: 'Workspace', current: 'New Specification Analysis' };
    if (path === '/results') return { section: 'Workspace', current: 'Specification Audit Report' };
    if (path.startsWith('/standards/')) return { section: 'Standards', current: 'Standard Record' };
    if (path === '/standards') return { section: 'Knowledge Base', current: 'Standards Explorer' };
    if (path === '/saved') return { section: 'Workspace', current: 'Saved Items' };
    if (path === '/history') return { section: 'Audit', current: 'Analysis History' };
    if (path === '/reports') return { section: 'Export', current: 'Procurement Reports' };
    if (path === '/about') return { section: 'Information', current: 'About & Methodology' };
    return { section: 'Workspace', current: 'Dashboard' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E2DBD0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded text-[#575E54] hover:bg-[#FAF7F2] transition-colors"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-[#7E867B]">
          <span className="font-medium hover:text-[#20241F] transition-colors">
            {breadcrumb.section}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#CDC4B6]" />
          <span className="font-semibold text-[#20241F]">
            {breadcrumb.current}
          </span>
        </div>
      </div>

      {/* Right: Search shortcut, Notifications & User */}
      <div className="flex items-center gap-3">
        {/* Global Search Trigger (Ctrl + K) */}
        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#FAF7F2] border border-[#E2DBD0] hover:border-[#CDC4B6] text-xs text-[#575E54] transition-all"
          title="Search Standards, Projects, and Analyses (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-[#7E867B]" />
          <span className="hidden sm:inline">Search workspace...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#E2DBD0] rounded text-[#7E867B]">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded hover:bg-[#FAF7F2] text-[#575E54] relative transition-colors"
            title="Attention & Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B7791F]"></span>
            )}
          </button>

          {/* Notifications Modal/Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2DBD0] rounded-md shadow-xl p-3 z-50 animate-fade-in text-xs">
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

        {/* User Badge */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E2DBD0]">
            <div className="w-7 h-7 rounded-full bg-[#20241F] text-white flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-[#20241F] leading-tight">
                {user.name}
              </div>
              <div className="text-[10px] text-[#7E867B] leading-tight truncate max-w-[130px]">
                {user.organization}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
