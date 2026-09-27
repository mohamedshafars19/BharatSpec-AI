import React from 'react';
import { RecommendationItem, StructuredRequirement } from '../types';
import { X, CheckCircle2, ArrowDown, HelpCircle, Layers, ShieldCheck, Target, Check } from 'lucide-react';

interface WhyRecommendedModalProps {
  item: RecommendationItem | null;
  structured: StructuredRequirement | null;
  onClose: () => void;
}

export const WhyRecommendedModal: React.FC<WhyRecommendedModalProps> = ({
  item,
  structured,
  onClose
}) => {
  if (!item || !structured) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-[#E2E8F0] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B1220] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#E87524]/20 border border-[#E87524]/40 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-[#E87524]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-white">
                Explainable Recommendation Reasoning
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                {item.standard_id} — {item.applicability}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-[#0B1220]">
          {/* Main Grounded Statement */}
          <div className="p-4 rounded-md bg-amber-50/70 border border-amber-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#E87524]" />
              <span>Grounded AI Matching Rationale</span>
            </h4>
            <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
              {item.why_recommended}
            </p>
          </div>

          {/* Traceability Flow Hierarchy (Section 22) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
              Procurement Alignment Hierarchy
            </h4>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#0B1220]">
                <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-mono text-[11px] shrink-0">1</span>
                <span>Requirement: </span>
                <span className="text-slate-700 font-normal truncate">{structured.product} ({structured.quantity ? `${structured.quantity} units` : 'Tender'})</span>
              </div>
              <div className="flex justify-start pl-3 text-slate-400">
                <ArrowDown className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 font-semibold text-[#0B1220]">
                <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-mono text-[11px] shrink-0">2</span>
                <span>Domain Category: </span>
                <span className="badge-category">{structured.category}</span>
              </div>
              <div className="flex justify-start pl-3 text-slate-400">
                <ArrowDown className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 font-semibold text-[#0B1220]">
                <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-mono text-[11px] shrink-0">3</span>
                <span>Deployment Context: </span>
                <span className="text-slate-700 font-normal">{structured.application}</span>
              </div>
              <div className="flex justify-start pl-3 text-slate-400">
                <ArrowDown className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 font-semibold text-[#0B1220] bg-white p-2 rounded border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-[#0B1220] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Verified Match: </span>
                <span className="text-[#16745A] font-bold font-mono">{item.standard_id}</span>
                <span className="text-slate-500 font-normal truncate">({item.title})</span>
              </div>
            </div>
          </div>

          {/* Verification Criteria Checkmarks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2.5">
              Verified Matching Criteria
            </h4>
            <div className="space-y-2">
              {item.match_criteria.map((crit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs p-2.5 rounded bg-emerald-50/50 border border-emerald-200/60 text-emerald-950 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#16745A] shrink-0 mt-0.5" />
                  <span>{crit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1220] rounded hover:bg-slate-800 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
