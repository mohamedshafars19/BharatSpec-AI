import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, FlaskConical, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { StandardRecord, StandardGraphResponse } from '../types';
import { getStandardById, getStandardRelationships } from '../services/api';
import { useUI } from '../context/UIContext';
import { StandardRelationshipGraph } from '../components/StandardRelationshipGraph';
import { SaveToProjectModal } from '../components/SaveToProjectModal';
import { CompareStandardsModal } from '../components/CompareStandardsModal';

export const StandardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [standard, setStandard] = useState<StandardRecord | null>(null);
  const [graph, setGraph] = useState<StandardGraphResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'scope' | 'requirements' | 'related' | 'testing' | 'safety' | 'certification' | 'versions' | 'sources'
  >('overview');

  // Modals
  const [isSaveOpen, setIsSaveOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      loadStandard(id);
    }
  }, [id]);

  const loadStandard = async (stdId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStandardById(stdId);
      setStandard(data);

      try {
        const graphData = await getStandardRelationships(stdId);
        setGraph(graphData);
      } catch (_) {}
    } catch (err: any) {
      setError(err?.message || `Standard '${stdId}' not found.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#8B9A6E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500">Loading standard specification...</p>
      </div>
    );
  }

  if (error || !standard) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
          {error || 'Standard record could not be loaded.'}
        </div>
        <Link to="/standards" className="text-xs text-[#8B9A6E] font-semibold hover:underline">
          ← Back to Standards Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/standards" className="hover:text-[#20241F] transition-colors">
          Standards Knowledge Base
        </Link>
        <span>/</span>
        <span className="font-mono text-[#20241F] font-semibold">{standard.id}</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 border-b border-[#EAE2D6] pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-base font-bold text-[#8B9A6E] bg-[#FAF7F2] px-2.5 py-1 rounded border border-[#EAE2D6]">
              {standard.id}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded border font-mono ${
                standard.data_status === 'verified'
                  ? 'border-[#557A5B]/30 bg-[#F0FFF4] text-[#22543D]'
                  : 'border-[#B7791F]/30 bg-[#FFFBEB] text-[#92400E]'
              }`}
            >
              {standard.data_status}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#FAF7F2] text-gray-600 font-mono">
              Version: {standard.version || 'Active'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#EAE2D6]/60 text-[#20241F] font-medium">
              {standard.category}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F] leading-tight">
            {standard.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#20241F]/70 leading-relaxed font-sans">
            {standard.scope}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start">
          <button
            type="button"
            onClick={() => setIsCompareOpen(true)}
            className="px-3 py-2 rounded-lg border border-[#EAE2D6] bg-white text-xs font-semibold text-[#20241F] hover:bg-[#F7F2EB] transition-colors shadow-xs"
          >
            Compare Standard
          </button>

          <button
            type="button"
            onClick={() => setIsSaveOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            + Save to Project
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#EAE2D6] flex items-center gap-1 overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview & Scope' },
          { id: 'requirements', label: `Technical Specs (${standard.technical_requirements?.length || 0})` },
          { id: 'testing', label: `Mandatory Tests (${standard.test_methods?.length || 0})` },
          { id: 'safety', label: `Safety Protocols (${standard.safety_requirements?.length || 0})` },
          { id: 'related', label: `Normative Relations (${standard.related_standards?.length || 0})` },
          { id: 'certification', label: 'Certification & QCO' },
          { id: 'versions', label: 'Version Timeline' },
          { id: 'sources', label: 'Data Provenance' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === t.id
                ? 'border-[#8B9A6E] text-[#20241F] font-bold'
                : 'border-transparent text-gray-500 hover:text-[#20241F]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#EAE2D6] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#20241F]">
              Standard Scope & Application Field
            </h3>
            <p className="text-xs sm:text-sm text-[#20241F]/80 leading-relaxed whitespace-pre-line">
              {standard.description || standard.scope}
            </p>

            {standard.keywords && standard.keywords.length > 0 && (
              <div className="pt-4 border-t border-[#EAE2D6] flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-500">Index Keywords:</span>
                {standard.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] text-xs font-mono text-[#20241F]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Standards Relationship Graph Embedding */}
          {graph && (
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-[#20241F]">
                Normative & Subsystem Knowledge Graph
              </h3>
              <StandardRelationshipGraph
                graph={graph}
                onSelectStandard={(selectedId) => {
                  if (selectedId !== standard.id) {
                    navigate(`/standards/${selectedId}`);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'requirements' && (
        <div className="bg-white p-6 rounded-xl border border-[#EAE2D6] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            Technical Parameters & Benchmarks
          </h3>
          <p className="text-xs text-gray-500">
            Mandatory parameters prescribed in this standard that must be verified in tender bids.
          </p>

          <div className="space-y-2 pt-2">
            {standard.technical_requirements?.map((req, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6] text-xs text-[#20241F] flex items-start gap-2.5"
              >
                <Check className="w-3.5 h-3.5 text-[#557A5B] shrink-0 mt-0.5" />
                <span className="font-mono text-xs leading-relaxed">{req}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'testing' && (
        <div className="bg-white p-6 rounded-xl border border-[#EAE2D6] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            Prescribed Laboratory Test Methods
          </h3>
          <p className="text-xs text-gray-500">
            Test protocols that suppliers must perform in NABL-accredited or BIS-approved test labs.
          </p>

          <div className="space-y-2 pt-2">
            {standard.test_methods?.map((test, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#F0FFF4] border border-[#38A169]/30 text-xs text-[#22543D] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-3.5 h-3.5 text-[#22543D] shrink-0" />
                  <span className="font-mono">{test}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white font-semibold">
                  Mandatory Verification Clause
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="bg-white p-6 rounded-xl border border-[#EAE2D6] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            Electrical & Mechanical Safety Requirements
          </h3>

          <div className="space-y-2">
            {standard.safety_requirements?.map((saf, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#FFFBEB] border border-[#B7791F]/30 text-xs text-[#92400E] flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-[#92400E] shrink-0" />
                <span className="font-mono">{saf}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'related' && (
        <div className="bg-white p-6 rounded-xl border border-[#EAE2D6] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            Normative References & Companion Codes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {standard.related_standards?.map((rel, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6] flex items-center justify-between text-xs"
              >
                <span className="font-mono font-bold text-[#20241F]">{rel}</span>
                <button
                  type="button"
                  onClick={() => navigate(`/standards/${rel}`)}
                  className="text-xs text-[#8B9A6E] font-semibold hover:underline"
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'certification' && (
        <div className="bg-white p-6 rounded-xl border border-[#EAE2D6] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            Certification & Quality Control Orders (QCO)
          </h3>
          <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6] text-xs text-[#20241F]/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#20241F]">
              <ShieldCheck className="w-4 h-4 text-[#8B9A6E]" />
              <span>Mandatory Conformity Assessment Scheme</span>
            </div>
            <p className="leading-relaxed">
              Products covered under this standard are subject to Quality Control Orders (QCO) issued by the relevant Ministry. Bidders must produce valid Bureau of Indian Standards (BIS) Standard Mark licenses (ISI Mark) or test certificates prior to supply.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="bg-white p-6 rounded-xl border border-[#EAE2D6] shadow-xs space-y-6">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            Interactive Version & Amendment Timeline
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#8B9A6E]/40">
            <div className="relative">
              <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-400" />
              <span className="text-xs font-bold text-gray-500 block font-mono">
                Initial Publication
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                First formulated and notified in official gazette.
              </p>
            </div>

            {standard.amendments?.map((amend, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#B7791F]" />
                <span className="text-xs font-bold text-[#92400E] block font-mono">
                  Amendment Notified: {amend}
                </span>
                <p className="text-xs text-gray-600 mt-0.5">
                  Technical revision to testing requirements and tolerances.
                </p>
              </div>
            ))}

            <div className="relative">
              <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#557A5B]" />
              <span className="text-xs font-bold text-[#22543D] block font-mono">
                Current Valid Version: {standard.version || 'Active Edition'}
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Active benchmark for technical procurement specifications and tender evaluation.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="bg-white p-6 rounded-xl border border-[#EAE2D6] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            Data Source & Verification Provenance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6]">
              <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">
                Data Status
              </span>
              <span className="font-mono font-bold text-sm text-[#20241F]">
                {standard.data_status}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6]">
              <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">
                Catalogue Origin
              </span>
              <span className="font-bold text-sm text-[#20241F]">
                {standard.source || 'Bureau of Indian Standards Catalog'}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed pt-2">
            This record is maintained in the BharatSpec AI verified standards knowledge base with deterministic relationship linking.
          </p>
        </div>
      )}

      {/* Save Modal */}
      <SaveToProjectModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        itemType="standard"
        itemId={standard.id}
        itemTitle={standard.title}
        itemMeta={{ category: standard.category, version: standard.version }}
      />

      {/* Compare Modal */}
      <CompareStandardsModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        initialStandardIds={[standard.id]}
      />
    </div>
  );
};
