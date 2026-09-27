import React from 'react';
import { StructuredRequirement } from '../types';
import { Edit3, Box, Tag, Compass, CloudSun, Hash, CheckSquare } from 'lucide-react';

interface RequirementSummaryProps {
  structured: StructuredRequirement;
  onEdit: () => void;
  rawRequirement: string;
}

export const RequirementSummary: React.FC<RequirementSummaryProps> = ({
  structured,
  onEdit,
  rawRequirement
}) => {
  return (
    <div className="card-enterprise bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm mb-6">
      {/* Title & Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E2E8F0]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16745A]">
            Requirement Understanding & Extraction
          </span>
          <h2 className="text-lg font-bold text-[#0B1220] font-heading mt-0.5">
            Structured Procurement Profile
          </h2>
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1220] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#E87524]" />
          <span>Edit Requirement</span>
        </button>
      </div>

      {/* Raw Query Quote */}
      <div className="mb-5 p-3 rounded bg-slate-50 border-l-4 border-[#0B1220] text-xs text-slate-700 italic">
        "{rawRequirement}"
      </div>

      {/* Grid of Extracted Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Product */}
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#F8FAFC] border border-slate-200/60">
          <Box className="w-4 h-4 text-[#0B1220] shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
              Product Detected
            </div>
            <div className="text-sm font-bold text-[#0B1220] mt-0.5">
              {structured.product}
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#F8FAFC] border border-slate-200/60">
          <Tag className="w-4 h-4 text-[#0B1220] shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
              Category
            </div>
            <div className="text-sm font-semibold text-[#0B1220] mt-0.5">
              <span className="badge-category">{structured.category}</span>
            </div>
          </div>
        </div>

        {/* Application */}
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#F8FAFC] border border-slate-200/60">
          <Compass className="w-4 h-4 text-[#0B1220] shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
              Application Context
            </div>
            <div className="text-xs font-medium text-[#0B1220] mt-0.5 line-clamp-2">
              {structured.application}
            </div>
          </div>
        </div>

        {/* Environment */}
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#F8FAFC] border border-slate-200/60">
          <CloudSun className="w-4 h-4 text-[#0B1220] shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
              Environment
            </div>
            <div className="text-xs font-medium text-[#0B1220] mt-0.5">
              {structured.environment}
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#F8FAFC] border border-slate-200/60">
          <Hash className="w-4 h-4 text-[#0B1220] shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
              Procurement Volume
            </div>
            <div className="text-sm font-bold text-[#0B1220] mt-0.5">
              {structured.quantity ? `${structured.quantity.toLocaleString()} Units` : 'Not Specified'}
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#F8FAFC] border border-slate-200/60">
          <div className="w-full">
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-1">
              Indexed Keywords
            </div>
            <div className="flex flex-wrap gap-1">
              {structured.keywords.slice(0, 4).map((kw, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Extracted Technical Requirements */}
      {structured.requirements && structured.requirements.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-xs font-semibold text-[#0B1220] mb-2 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-[#16745A]" />
            <span>Extracted Technical Requirements Baseline:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {structured.requirements.map((req, idx) => (
              <div
                key={idx}
                className="text-xs px-2.5 py-1.5 rounded bg-emerald-50/70 border border-emerald-200/70 text-emerald-950 font-medium flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#16745A] shrink-0"></span>
                <span className="truncate">{req}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
