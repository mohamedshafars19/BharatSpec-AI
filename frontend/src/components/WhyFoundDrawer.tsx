import React from 'react';
import { X, Check } from 'lucide-react';
import { RecommendationItem, StructuredRequirement } from '../types';

interface WhyFoundDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: RecommendationItem | null;
  structuredReq?: StructuredRequirement | null;
}

export const WhyFoundDrawer: React.FC<WhyFoundDrawerProps> = ({
  isOpen,
  onClose,
  recommendation,
  structuredReq,
}) => {
  if (!isOpen || !recommendation) return null;

  const std = recommendation.standard_details;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-[#EAE2D6] animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#EAE2D6] bg-[#F7F2EB] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
              <h3 className="font-serif text-lg font-bold text-[#20241F]">
                Why Was This Standard Found?
              </h3>
            </div>
            <p className="text-xs text-[#20241F]/70">
              Audit trail & explainable evidence chain linking your requirement to standard clauses.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#EAE2D6] flex items-center justify-center text-gray-500 hover:text-black transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Standard Summary */}
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EAE2D6]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-bold text-[#20241F]">
                {recommendation.standard_id}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded border font-mono font-medium ${
                  std.data_status === 'verified'
                    ? 'border-[#557A5B]/30 bg-[#F0FFF4] text-[#22543D]'
                    : 'border-[#B7791F]/30 bg-[#FFFBEB] text-[#92400E]'
                }`}
              >
                {std.data_status}
              </span>
            </div>
            <p className="font-serif text-sm font-semibold text-[#20241F] mb-2">
              {recommendation.title}
            </p>
            <p className="text-xs text-[#20241F]/75 leading-relaxed">
              {std.scope || std.description}
            </p>
          </div>

          {/* Reasoning Chain Step Flow */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#20241F] mb-4">
              Deterministic Reasoning Chain
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#8B9A6E]/40">
              {/* Step 1: User Requirement */}
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#8B9A6E] flex items-center justify-center text-[9px] font-bold text-[#8B9A6E]">
                  1
                </span>
                <span className="text-[10px] uppercase font-bold text-[#8B9A6E] block mb-0.5">
                  Procurement Requirement
                </span>
                <div className="p-2.5 rounded-lg bg-[#F7F8F5] border border-[#EAE2D6] text-xs font-mono text-[#20241F]/80">
                  {structuredReq?.product || 'Specified product equipment'}
                </div>
              </div>

              {/* Step 2: Product & Application Context */}
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#8B9A6E] flex items-center justify-center text-[9px] font-bold text-[#8B9A6E]">
                  2
                </span>
                <span className="text-[10px] uppercase font-bold text-[#8B9A6E] block mb-0.5">
                  Identified Application & Environment
                </span>
                <div className="p-2.5 rounded-lg bg-[#F7F8F5] border border-[#EAE2D6] text-xs text-[#20241F]/80 flex items-center justify-between">
                  <span>Application: <strong>{structuredReq?.application || 'Municipal roads'}</strong></span>
                  <span>Environment: <strong>{structuredReq?.environment || 'Outdoor'}</strong></span>
                </div>
              </div>

              {/* Step 3: Specific Technical Parameters Matched */}
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#8B9A6E] flex items-center justify-center text-[9px] font-bold text-[#8B9A6E]">
                  3
                </span>
                <span className="text-[10px] uppercase font-bold text-[#8B9A6E] block mb-0.5">
                  Matched Technical Parameters
                </span>
                <div className="p-2.5 rounded-lg bg-[#F7F8F5] border border-[#EAE2D6] text-xs text-[#20241F]/80 space-y-1">
                  {recommendation.match_criteria.length > 0 ? (
                    recommendation.match_criteria.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#557A5B] shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#557A5B] shrink-0" />
                      <span>Product category directly matches standard scope.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Mandated Standard */}
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-[#557A5B] text-white flex items-center justify-center text-[9px] font-bold">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
                <span className="text-[10px] uppercase font-bold text-[#557A5B] block mb-0.5">
                  Prescribed Indian Standard Specification
                </span>
                <div className="p-3 rounded-lg bg-[#F0FFF4] border border-[#38A169]/30 text-xs text-[#22543D] font-mono font-medium">
                  {recommendation.standard_id} — {std.title}
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Evidence Explanation */}
          <div className="border-t border-[#EAE2D6] pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#20241F] mb-2">
              Qualitative Applicability Justification
            </h4>
            <div className="bg-[#F7F2EB] p-3.5 rounded-lg text-xs text-[#20241F]/85 leading-relaxed font-sans">
              {recommendation.why_recommended ||
                'This standard covers technical specifications, quality benchmarks, and mandatory testing procedures applicable to this equipment.'}
            </div>
          </div>

          {/* Publication & Version Provenance */}
          <div className="border-t border-[#EAE2D6] pt-4 text-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#20241F] mb-1">
              Source & Version Provenance
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-gray-50 border border-gray-100">
                <span className="text-gray-500 block">Source Catalogue:</span>
                <span className="font-semibold text-gray-800">{std.source}</span>
              </div>
              <div className="p-2 rounded bg-gray-50 border border-gray-100">
                <span className="text-gray-500 block">Catalogued Version:</span>
                <span className="font-mono font-semibold text-gray-800">{std.version || 'Active'}</span>
              </div>
            </div>
            {std.amendments && std.amendments.length > 0 && (
              <div className="p-2 rounded bg-amber-50 border border-amber-100 text-[11px] text-amber-900">
                <span className="font-semibold block mb-0.5">Noted Amendments:</span>
                {std.amendments.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#EAE2D6] bg-gray-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#20241F] text-white text-xs font-medium rounded-lg hover:bg-black transition-colors"
          >
            Close Evidence Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
