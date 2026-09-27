import React from 'react';
import { RecommendationItem } from '../types';
import { FileText, HelpCircle, ArrowUpRight, Check, Shield, Layers, Award } from 'lucide-react';

interface StandardCardProps {
  item: RecommendationItem;
  onViewDetails: (standard: RecommendationItem) => void;
  onWhyRecommended: (standard: RecommendationItem) => void;
  isPrimary?: boolean;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  item,
  onViewDetails,
  onWhyRecommended,
  isPrimary = false
}) => {
  const std = item.standard_details;

  return (
    <div
      className={`card-enterprise bg-white rounded-lg p-6 border transition-all ${
        isPrimary
          ? 'border-[#0B1220] ring-1 ring-[#0B1220]/10 shadow-md'
          : 'border-[#E2E8F0] hover:border-slate-300'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Standard ID in IBM Plex Mono */}
          <span className="font-mono text-sm font-bold bg-[#0B1220] text-white px-2.5 py-1 rounded tracking-wide">
            {item.standard_id}
          </span>

          {/* Applicability Badge */}
          <span
            className={`text-xs px-2.5 py-0.5 rounded font-semibold border ${
              isPrimary
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {item.applicability}
          </span>

          <span className="badge-demo">
            {std.data_status || 'DEMO'}
          </span>
        </div>

        {/* Semantic Match Score */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-xs font-semibold text-[#0B1220]">
          <span className="text-[#64748B] text-[11px] font-normal">Relevance:</span>
          <span className="text-[#16745A] font-bold font-mono">{item.match_score}%</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-[#0B1220] font-heading mb-2 leading-snug">
        {item.title}
      </h3>

      {/* Scope / Summary */}
      <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2 mb-4 leading-relaxed">
        {std.scope}
      </p>

      {/* Key Technical Requirements (Bullet Snippets) */}
      {std.technical_requirements && std.technical_requirements.length > 0 && (
        <div className="mb-4 bg-slate-50/70 p-3 rounded border border-slate-200/60">
          <div className="text-[11px] font-bold text-[#0B1220] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#E87524]" />
            <span>Prescribed Technical Parameters</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-700">
            {std.technical_requirements.slice(0, 2).map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#16745A] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Traceability & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
        <div className="text-[11px] text-[#64748B] flex items-center gap-2">
          <span>Source: <strong className="text-slate-700">{std.source}</strong></span>
          <span>•</span>
          <span>Ver: <strong className="text-slate-700 font-mono">{std.version}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {/* Why Recommended Button */}
          <button
            onClick={() => onWhyRecommended(item)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0B1220] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#E87524]" />
            <span>Why Recommended?</span>
          </button>

          {/* View Full Details Button */}
          <button
            onClick={() => onViewDetails(item)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#0B1220] hover:bg-slate-800 rounded transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#E87524]" />
            <span>View Full Details</span>
            <ArrowUpRight className="w-3 h-3 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
