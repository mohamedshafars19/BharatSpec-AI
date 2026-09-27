import React from 'react';
import { Cpu, BarChart3, Search, Network } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#557A5B]">
            Procurement Intelligence Architecture
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#20241F] tracking-tight">
          About BharatSpec AI
        </h1>
        <p className="text-sm sm:text-base text-[#20241F]/80 mt-2 leading-relaxed font-sans">
          An AI-powered specification assistant engineered to audit procurement requirements, identify applicable Indian Standards, connect normative test protocols, and synthesize tender schedules.
        </p>
      </div>

      {/* Purpose & Mission */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#EAE2D6] shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#20241F]">
          The Procurement Specification Challenge
        </h2>
        <p className="text-xs sm:text-sm text-[#20241F]/80 leading-relaxed font-sans">
          Public procurement officers in municipal corporations, utilities, and infrastructure authorities frequently receive unstructured supply requests. Manually determining applicable Indian Standards requires searching voluminous catalogues, identifying secondary component standards (such as controlgear, photometric test methods, and ingress ratings), verifying active amendments, and preventing substandard supply disputes.
        </p>
        <p className="text-xs sm:text-sm text-[#20241F]/80 leading-relaxed font-sans">
          BharatSpec AI solves this by introducing a deterministic <strong>Specification Gap Auditor</strong> and an <strong>Interactive Standards Relationship Graph</strong>.
        </p>
      </div>

      {/* Pipeline Architecture */}
      <div className="space-y-6">
        <h2 className="font-serif text-lg font-bold text-[#20241F]">
          Technical Engine Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#20241F]">
              <Cpu className="w-4 h-4 text-[#8B9A6E]" />
              <span>1. Structured Parameter Extraction</span>
            </div>
            <p className="text-xs text-[#20241F]/75 leading-relaxed font-sans">
              Analyzes incoming tender text or uploaded documents (PDF, DOCX, TXT) to isolate equipment identity, quantities, operational environment, and key thresholds into an editable schema.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#20241F]">
              <BarChart3 className="w-4 h-4 text-[#8B9A6E]" />
              <span>2. 10-Point Specification Gap Audit</span>
            </div>
            <p className="text-xs text-[#20241F]/75 leading-relaxed font-sans">
              Evaluates specification readiness across product definition, performance, safety, testing, environment, installation, and certification to compute an explainable mathematical score.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#20241F]">
              <Search className="w-4 h-4 text-[#8B9A6E]" />
              <span>3. Grounded Standards Retrieval</span>
            </div>
            <p className="text-xs text-[#20241F]/75 leading-relaxed font-sans">
              Matches parameters against the verified Indian Standards knowledge base using dense vector embeddings and exact deterministic filtering. Strictly prevents fabricated standard codes.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#20241F]">
              <Network className="w-4 h-4 text-[#8B9A6E]" />
              <span>4. Standards Relationship Graph</span>
            </div>
            <p className="text-xs text-[#20241F]/75 leading-relaxed font-sans">
              Constructs interactive node-edge topologies connecting primary product specifications to compulsory testing protocols, safety requirements, and normative component codes.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#8B9A6E]/40 text-xs text-[#20241F]/80 space-y-2">
        <span className="font-bold text-[#20241F] block text-sm">
          Technical Verification Policy
        </span>
        <p className="leading-relaxed">
          BharatSpec AI grounds every recommendation in stored standard scopes and catalogue metadata. Each individual standard record clearly indicates its verification provenance and version history. Prior to contract finalization, procurement authorities should cross-reference prevailing gazette notifications with official Bureau of Indian Standards publications.
        </p>
      </div>
    </div>
  );
};
