import React from 'react';
import { SearchX, ArrowRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  actionLink?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Matching Standards Found",
  message = "No verified matching standard was found in the available knowledge base for the entered criteria.",
  actionText = "Refine Procurement Requirement",
  onAction,
  actionLink
}) => {
  return (
    <div className="card-enterprise bg-white p-8 sm:p-12 text-center rounded-lg border border-[#E2E8F0] shadow-sm max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-[#64748B]">
        <SearchX className="w-7 h-7 text-[#0B1220]" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#0B1220] font-heading mb-2">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-[#64748B] mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex justify-center">
        {actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 bg-[#0B1220] hover:bg-slate-800 text-white px-4 py-2 rounded-md text-xs font-semibold shadow-sm transition-all"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E87524]" />
          </Link>
        ) : onAction ? (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 bg-[#0B1220] hover:bg-slate-800 text-white px-4 py-2 rounded-md text-xs font-semibold shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E87524]" />
            <span>{actionText}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
