import React, { useState } from 'react';
import { SpecificationAuditResult } from '../types';
import { Info, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface ReadinessScoreCardProps {
  audit: SpecificationAuditResult;
}

export const ReadinessScoreCard: React.FC<ReadinessScoreCardProps> = ({ audit }) => {
  const [showFormula, setShowFormula] = useState(false);

  const score = audit.readiness_score;

  const getScoreColor = () => {
    if (score >= 85) return 'text-[#557A5B] bg-[#EBF2EC] border-[#CFE0D1]';
    if (score >= 65) return 'text-[#B7791F] bg-[#FAF4E8] border-[#EFE0C2]';
    return 'text-[#B94A48] bg-[#F8ECEC] border-[#ECD0D0]';
  };

  return (
    <div className="card-workspace p-5 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-[#E2DBD0]">
        {/* Left: Score & Verdict */}
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center border font-mono ${getScoreColor()}`}>
            <span className="text-2xl font-extrabold leading-none">{score}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider mt-1">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#20241F] font-heading">
                Procurement Specification Readiness
              </h3>
              <button
                type="button"
                onClick={() => setShowFormula(!showFormula)}
                className="text-[#7E867B] hover:text-[#20241F]"
                title="View Scoring Calculation Formula"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-[#575E54]">Status:</span>
              <span className={`text-xs px-2 py-0.5 rounded font-bold border ${getScoreColor()}`}>
                {audit.overall_status}
              </span>
            </div>
            <p className="text-xs text-[#7E867B] mt-1 max-w-md">
              Mathematically derived from deterministic checklist weights across 8 mandatory public procurement categories.
            </p>
          </div>
        </div>

        {/* Right: Quick Gauge Bar */}
        <div className="md:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-[#20241F]">
            <span>Readiness Progress</span>
            <span className="font-mono">{score}%</span>
          </div>
          <div className="w-full bg-[#EEEEEE] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 85 ? 'bg-[#557A5B]' : score >= 65 ? 'bg-[#B7791F]' : 'bg-[#B94A48]'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#7E867B]">
            <span>0% Draft</span>
            <span>65% In Review</span>
            <span>85%+ Tender-Ready</span>
          </div>
        </div>
      </div>

      {/* Formula Explanation Drawer */}
      {showFormula && (
        <div className="my-4 p-3.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] text-xs text-[#575E54] space-y-2 animate-fade-in">
          <div className="font-bold text-[#20241F]">Mathematical Weight Distribution:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div>Product Definition: <strong>15 pts</strong></div>
            <div>Performance Specs: <strong>20 pts</strong></div>
            <div>Safety Compliance: <strong>15 pts</strong></div>
            <div>Laboratory Testing: <strong>15 pts</strong></div>
            <div>Environmental Rating: <strong>10 pts</strong></div>
            <div>Installation Hardware: <strong>10 pts</strong></div>
            <div>Statutory Certification: <strong>10 pts</strong></div>
            <div>Warranty SLA: <strong>5 pts</strong></div>
          </div>
          <p className="text-[11px] text-[#7E867B] italic">
            Total = 100 Points. Points are awarded based on explicit presence of thresholds, laboratory citations, and legal covenants.
          </p>
        </div>
      )}

      {/* Breakdown Grid */}
      <div className="pt-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#7E867B] mb-3">
          Category Completion Breakdown
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {audit.breakdown.map((b, i) => (
            <div key={i} className="p-2.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-[#20241F] truncate pr-1">{b.category}</span>
                <span className="font-mono font-bold text-[11px]">{b.earned}/{b.weight}</span>
              </div>
              <div className="w-full bg-[#EAE2D6] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    b.percentage >= 80 ? 'bg-[#557A5B]' : b.percentage >= 50 ? 'bg-[#B7791F]' : 'bg-[#B94A48]'
                  }`}
                  style={{ width: `${b.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
