import React, { useState } from 'react';
import { SpecificationAuditResult, AuditGapItem } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Copy,
  Check,
  Info,
  AlertCircle
} from 'lucide-react';
import { useUI } from '../context/UIContext';

interface SpecificationGapAuditProps {
  audit: SpecificationAuditResult;
  onApplyClause?: (clause: string) => void;
}

export const SpecificationGapAudit: React.FC<SpecificationGapAuditProps> = ({
  audit,
  onApplyClause
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedClause, setCopiedClause] = useState<string | null>(null);
  const { showToast } = useUI();

  const handleCopy = (clause: string) => {
    navigator.clipboard.writeText(clause);
    setCopiedClause(clause);
    showToast('Tender clause copied to clipboard', 'info');
    setTimeout(() => setCopiedClause(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete':
        return (
          <span className="badge-complete inline-flex items-center gap-1">
            <Check className="w-3 h-3 text-[#38A169]" />
            <span>Complete</span>
          </span>
        );
      case 'Needs Review':
        return (
          <span className="badge-review inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#B7791F]" />
            <span>Needs Review</span>
          </span>
        );
      default:
        return (
          <span className="badge-missing inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-[#B94A48]" />
            <span>Missing</span>
          </span>
        );
    }
  };

  const incompleteCount = audit.checklist.filter(i => i.status !== 'Complete').length;

  return (
    <div className="card-workspace p-5 sm:p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E2DBD0]">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8B9A6E]">
            Specification Completeness Audit
          </div>
          <h2 className="text-lg font-bold text-[#20241F] font-heading mt-0.5">
            Procurement Gap & Compliance Analysis
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {incompleteCount > 0 ? (
            <span className="badge-review text-xs py-1 px-2.5">
              {incompleteCount} Areas Need Attention
            </span>
          ) : (
            <span className="badge-complete text-xs py-1 px-2.5">
              All 10 Audit Areas Complete
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-[#575E54] mb-4 leading-relaxed">
        {audit.summary_message} Click on any category below to review findings, standard requirements, and copy tender-ready corrective clauses.
      </p>

      {/* 10-Point Audit Checklist Accordion */}
      <div className="space-y-2">
        {audit.checklist.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded border transition-all ${
                isExpanded ? 'border-[#CDC4B6] bg-[#FAF7F2]' : 'border-[#EAE2D6] bg-white hover:bg-[#FAF7F2]/50'
              }`}
            >
              {/* Accordion Trigger */}
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left focus:outline-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[#EAE2D6] text-[#20241F] flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-xs text-[#20241F] truncate">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-[#7E867B] hidden sm:inline">
                    {item.score}/{item.max_score} pts
                  </span>
                  {getStatusBadge(item.status)}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#7E867B]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#7E867B]" />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#EAE2D6] space-y-3 text-xs animate-fade-in">
                  {/* Findings */}
                  <div>
                    <span className="font-bold text-[#20241F] block mb-0.5">Audit Findings:</span>
                    <p className="text-[#575E54] leading-relaxed">{item.findings}</p>
                  </div>

                  {/* Procurement Recommendation */}
                  <div className="p-2.5 rounded bg-white border border-[#EAE2D6]">
                    <span className="font-bold text-[#20241F] block mb-0.5">Recommendation:</span>
                    <p className="text-[#575E54] leading-relaxed">{item.recommendation}</p>
                  </div>

                  {/* Suggested Corrective Clauses */}
                  {item.suggested_clauses && item.suggested_clauses.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-[#20241F] block">Suggested Tender Clauses:</span>
                      {item.suggested_clauses.map((clause, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded bg-white border border-[#E2DBD0] flex items-start justify-between gap-3 font-mono text-[11px] text-[#20241F]"
                        >
                          <span className="leading-relaxed">{clause}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(clause)}
                            className="shrink-0 p-1 rounded hover:bg-[#FAF7F2] text-[#7E867B] hover:text-[#20241F] transition-colors"
                            title="Copy clause"
                          >
                            {copiedClause === clause ? (
                              <Check className="w-3.5 h-3.5 text-[#557A5B]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
