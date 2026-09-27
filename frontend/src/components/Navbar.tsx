import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-[#EAE2D6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Crest */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <span className="w-3 h-3 rounded-full bg-[#8B9A6E]" />
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-[#20241F]">
              BharatSpec AI
            </span>
            <span className="text-[10px] text-gray-500 hidden sm:block leading-none">
              Procurement Specification Auditor
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#20241F]/80">
          <Link to="/standards" className="hover:text-[#557A5B] transition-colors">
            Standards Explorer
          </Link>
          <Link to="/analyze" className="hover:text-[#557A5B] transition-colors">
            Audit Specification
          </Link>
          <Link to="/about" className="hover:text-[#557A5B] transition-colors">
            Methodology
          </Link>
        </nav>

        {/* User / Auth CTAs */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-[#20241F] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Open Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-[#20241F] hover:text-[#557A5B] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/analyze"
                className="px-4 py-2 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Start Analysis →
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
