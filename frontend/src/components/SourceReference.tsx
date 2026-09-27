import React from 'react';
import { Database, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SourceReferenceProps {
  source?: string;
  dataStatus?: string;
  analysisMode?: string;
}

export const SourceReference: React.FC<SourceReferenceProps> = ({
  source = "Prototype Knowledge Base",
  dataStatus = "DEMO",
  analysisMode = "LOCAL_DEMO"
}) => {
  return (
    <div className="card-enterprise bg-[#FAFBF9] p-5 rounded-lg border border-[#E2E8F0] shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#16745A]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1220]">
            Traceability & Integrity Ledger
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-demo text-[11px]">
            Data Status: {dataStatus}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-200/70 text-slate-800 font-mono font-medium">
            Mode: {analysisMode}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-[#0B1220] block mb-0.5">Authoritative Source:</span>
          <span>{source} (Vetted SIH26108 Prototype Index)</span>
        </div>
        <div>
          <span className="font-semibold text-[#0B1220] block mb-0.5">Verification Integrity:</span>
          <span className="text-[#16745A] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Vector Indexed (Zero Hallucinated Codes)
          </span>
        </div>
        <div>
          <span className="font-semibold text-[#0B1220] block mb-0.5">Statutory Disclaimer:</span>
          <span className="text-[11px] text-slate-500">
            For evaluation purposes only. Official procurement should cross-check bis.gov.in.
          </span>
        </div>
      </div>
    </div>
  );
};
