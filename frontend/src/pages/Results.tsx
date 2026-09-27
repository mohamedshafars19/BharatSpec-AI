import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AnalyzeResponse, AnalyzeRequest, RecommendationItem, StandardRecord } from '../types';
import { RequirementSummary } from '../components/RequirementSummary';
import { StandardCard } from '../components/StandardCard';
import { StandardDetailsModal } from '../components/StandardDetails';
import { WhyRecommendedModal } from '../components/WhyRecommendedModal';
import { RelatedStandards } from '../components/RelatedStandards';
import { VersionStatus } from '../components/VersionStatus';
import { SourceReference } from '../components/SourceReference';
import { EmptyState } from '../components/EmptyState';
import {
  FileCheck,
  RotateCcw,
  Download,
  Share2,
  Check,
  Layers,
  ArrowLeft,
  Printer
} from 'lucide-react';

export const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as { result?: AnalyzeResponse; request?: AnalyzeRequest } | undefined;
  const result = state?.result;
  const request = state?.request;

  const [selectedStandard, setSelectedStandard] = useState<StandardRecord | null>(null);
  const [whyItem, setWhyItem] = useState<RecommendationItem | null>(null);
  const [copiedSpec, setCopiedSpec] = useState(false);

  // If user navigates directly to /results without state
  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="No Active Procurement Analysis"
          message="Please enter a procurement specification to generate applicable Indian Standards recommendations."
          actionText="Start Analysis"
          actionLink="/analyze"
        />
      </div>
    );
  }

  const structured = result.structured_requirement;
  const recommendations = result.recommendations || [];

  const handleEditRequirement = () => {
    navigate('/analyze', {
      state: { initialValues: request }
    });
  };

  const handleCopyTenderSchedule = () => {
    const lines = [
      `=============================================================`,
      `BHARATSPEC AI — PROCUREMENT STANDARDS SPECIFICATION SCHEDULE`,
      `Analysis ID: ${result.analysis_id} | Date: ${result.created_at}`,
      `=============================================================`,
      ``,
      `1. PROCUREMENT REQUIREMENT:`,
      `"${result.user_requirement}"`,
      ``,
      `2. STRUCTURED SPECIFICATION:`,
      `- Product: ${structured.product}`,
      `- Category: ${structured.category}`,
      `- Application: ${structured.application}`,
      `- Volume: ${structured.quantity ? `${structured.quantity} Units` : 'As per BOQ'}`,
      `- Key Parameters: ${structured.requirements.join('; ')}`,
      ``,
      `3. RECOMMENDED MANDATORY INDIAN STANDARDS:`,
    ];

    recommendations.forEach((rec, idx) => {
      lines.push(`${idx + 1}. [${rec.standard_id}] ${rec.title}`);
      lines.push(`   Applicability: ${rec.applicability} (Match Score: ${rec.match_score}%)`);
      lines.push(`   Edition: ${rec.standard_details.version} | Source: ${rec.standard_details.source}`);
      lines.push(`   Why Required: ${rec.why_recommended}`);
      lines.push(``);
    });

    lines.push(`4. COMPLIANCE & TEST METHOD CITATIONS:`);
    result.related_standards.forEach((rel) => {
      lines.push(`- ${rel.standard_id}: ${rel.title} (${rel.relation_type})`);
    });
    lines.push(``);
    lines.push(`DISCLAIMER: ${result.disclaimer}`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E2E8F0]">
        <div>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0B1220] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Analysis Input</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-heading tracking-tight">
              Standards Recommendation Report
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              {result.analysis_id}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Generated on {result.created_at} • Engine Mode: <strong className="font-mono">{result.mode}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopyTenderSchedule}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0B1220] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-md shadow-xs transition-colors"
          >
            {copiedSpec ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Download className="w-3.5 h-3.5 text-[#E87524]" />}
            <span>{copiedSpec ? 'Schedule Copied!' : 'Copy Tender Schedule'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#64748B] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B1220] hover:bg-slate-800 rounded-md shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E87524]" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: REQUIREMENT UNDERSTANDING */}
      <RequirementSummary
        structured={structured}
        rawRequirement={result.user_requirement}
        onEdit={handleEditRequirement}
      />

      {/* SECTION 2: APPLICABLE STANDARDS */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16745A]">
              Vector Semantic Matching
            </span>
            <h2 className="text-xl font-bold text-[#0B1220] font-heading mt-0.5 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#E87524]" />
              <span>Applicable Indian Standards ({recommendations.length})</span>
            </h2>
          </div>
          <span className="badge-demo text-[11px]">
            {result.disclaimer}
          </span>
        </div>

        {recommendations.length === 0 ? (
          <EmptyState
            title="No Verified Matching Standard Found"
            message="No verified matching standard was found in the available knowledge base for the entered criteria."
            onAction={handleEditRequirement}
            actionText="Adjust Requirement Query"
          />
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <StandardCard
                key={rec.standard_id}
                item={rec}
                isPrimary={idx === 0}
                onViewDetails={(item) => setSelectedStandard(item.standard_details)}
                onWhyRecommended={(item) => setWhyItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: RELATED STANDARDS & DEPENDENCIES */}
      <RelatedStandards
        relatedList={result.related_standards}
      />

      {/* SECTION 4: VERSION & AMENDMENT STATUS */}
      <VersionStatus
        versionList={result.version_status}
      />

      {/* SECTION 5: SOURCE TRACEABILITY LEDGER */}
      <SourceReference
        source="Prototype Knowledge Base"
        dataStatus="DEMO"
        analysisMode={result.mode}
      />

      {/* MODAL: Full Standard Details */}
      <StandardDetailsModal
        standard={selectedStandard}
        onClose={() => setSelectedStandard(null)}
      />

      {/* MODAL: Why Recommended Breakdown */}
      <WhyRecommendedModal
        item={whyItem}
        structured={structured}
        onClose={() => setWhyItem(null)}
      />
    </div>
  );
};
