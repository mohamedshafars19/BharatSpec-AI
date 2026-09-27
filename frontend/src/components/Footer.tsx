import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#EAE2D6] mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#8B9A6E]" />
              <span className="font-serif font-bold text-lg text-[#20241F]">
                BharatSpec AI
              </span>
            </div>
            <p className="text-xs text-[#20241F]/70 leading-relaxed font-sans">
              AI-powered procurement specification auditor and Indian Standards intelligence graph.
            </p>
            <div className="text-[11px] text-[#557A5B] font-semibold">
              From Requirement → Standard → Compliance → Tender
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#20241F] mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-xs text-[#20241F]/70">
              <li>
                <Link to="/analyze" className="hover:text-[#20241F] transition-colors">
                  New Specification Analysis
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-[#20241F] transition-colors">
                  Procurement Projects
                </Link>
              </li>
              <li>
                <Link to="/standards" className="hover:text-[#20241F] transition-colors">
                  Standards Explorer
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#20241F] transition-colors">
                  Audit History
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-[#20241F] transition-colors">
                  Tender Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards Domains */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#20241F] mb-3">
              Catalogued Domains
            </h4>
            <ul className="space-y-2 text-xs text-[#20241F]/70">
              <li>Lighting & LED Luminaire Infrastructure</li>
              <li>Civil & Construction Materials</li>
              <li>Electrical Power & Distribution</li>
              <li>Ergonomic Furniture & Seating</li>
              <li>Personal Protective Equipment (PPE)</li>
              <li>Water Supply & Sanitary Piping</li>
            </ul>
          </div>

          {/* Standards Verification */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#20241F] mb-3">
              Data Provenance
            </h4>
            <div className="space-y-2 text-xs text-[#20241F]/70">
              <p className="text-[11px] leading-relaxed">
                BharatSpec AI grounds every recommendation in stored standard scopes and normative references. Individual standard records indicate catalogued data status and version history.
              </p>
              <div className="pt-1 text-[11px] text-gray-500">
                Official Standards Body: Bureau of Indian Standards (BIS)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#EAE2D6] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#20241F]/60">
          <p>© 2026 BharatSpec AI. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 font-medium">
            <span>Procurement Specification Auditor</span>
            <span>•</span>
            <span>Standards Intelligence Graph</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
