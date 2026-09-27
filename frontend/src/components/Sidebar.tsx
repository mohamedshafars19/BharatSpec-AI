import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  BookOpen,
  Bookmark,
  History,
  FileSpreadsheet,
  HelpCircle,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Analysis', path: '/analyze', icon: Sparkles, badge: 'Auditor' },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Standards', path: '/standards', icon: BookOpen },
    { label: 'Saved', path: '/saved', icon: Bookmark },
    { label: 'Audit History', path: '/history', icon: History },
    { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#FFFFFF] border-r border-[#E2DBD0] flex flex-col justify-between transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Brand */}
      <div>
        <div className="h-16 px-5 border-b border-[#E2DBD0] flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#20241F] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-[#8B9A6E]" />
            </div>
            <div>
              <span className="font-heading font-bold text-base tracking-tight text-[#20241F]">
                BharatSpec <span className="text-[#8B9A6E]">AI</span>
              </span>
              <span className="block text-[10px] text-[#7E867B] font-medium leading-none">
                Procurement Intelligence
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#FAF7F2] text-[#20241F] border border-[#EAE2D6]'
                      : 'text-[#575E54] hover:text-[#20241F] hover:bg-[#FAF7F2]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#8B9A6E]" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#EBF2EC] text-[#3C5A40]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation & Profile Area */}
      <div className="p-3 border-t border-[#E2DBD0] space-y-1">
        <Link
          to="/about"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#575E54] hover:text-[#20241F] rounded hover:bg-[#FAF7F2] transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-[#7E867B]" />
          <span>About & Methodology</span>
        </Link>

        {user && (
          <div className="pt-2 border-t border-[#EAE2D6]/80 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="w-7 h-7 rounded-full bg-[#EAE2D6] flex items-center justify-center text-[#575E54] shrink-0">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#20241F] truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-[#7E867B] truncate">
                  {user.organization || user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-[#7E867B] hover:text-[#B94A48] rounded hover:bg-[#F8ECEC] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
