import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  FileText,
  Check,
  HelpCircle,
  Info,
  Sparkles,
  BookOpen,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Search,
  Upload,
  Layers,
  FolderKanban
} from 'lucide-react';
import {
  AnalyzeRequest,
  AnalyzeResponse,
  StructuredRequirement,
  ClarificationAnswer,
  RecommendationItem,
  StandardRecord,
} from '../types';
import {
  analyzeRequirement,
  clarifyAnalysis,
  uploadDocument,
  getHistoryDetail,
  getStandards,
} from '../services/api';
import { useUI } from '../context/UIContext';

// Interactive Components
import { StructuredRequirementReview } from '../components/StructuredRequirementReview';
import { ClarifyingQuestionsModal } from '../components/ClarifyingQuestionsModal';
import { SpecificationGapAudit } from '../components/SpecificationGapAudit';
import { ReadinessScoreCard } from '../components/ReadinessScoreCard';
import { StandardRelationshipGraph } from '../components/StandardRelationshipGraph';
import { BeforeAfterSpec } from '../components/BeforeAfterSpec';
import { WhatIfAnalysis } from '../components/WhatIfAnalysis';
import { WhyFoundDrawer } from '../components/WhyFoundDrawer';
import { CompareStandardsModal } from '../components/CompareStandardsModal';
import { SaveToProjectModal } from '../components/SaveToProjectModal';
import { ExportReportModal } from '../components/ExportReportModal';

export const Analyze: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useUI();

  // Search parameters for project context or re-opening analysis
  const existingAnalysisId = searchParams.get('id');
  const projectIdParam = searchParams.get('projectId') || undefined;

  // Step 1 Form state
  const [requirementText, setRequirementText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [docUploadStatus, setDocUploadStatus] = useState<string | null>(null);

  // Analysis result state
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isClarifyOpen, setIsClarifyOpen] = useState<boolean>(false);
  const [whyFoundRec, setWhyFoundRec] = useState<RecommendationItem | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [compareStandardIds, setCompareStandardIds] = useState<string[]>([]);
  const [allCatalogueStandards, setAllCatalogueStandards] = useState<StandardRecord[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [saveTarget, setSaveTarget] = useState<{
    type: 'analysis' | 'standard' | 'report';
    id: string;
    title: string;
    meta?: any;
  } | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Sample Requirements for 1-click population
  const samples = [
    {
      label: 'LED Street Lighting',
      category: 'Electronics & Lighting',
      text: 'We need 500 energy-efficient LED street lights for municipal roads. They should work outdoors, have IP66 protection, 120 lm/W luminous efficacy, 10 kV internal surge protection, and a 5-year warranty.',
    },
    {
      label: 'Office Chairs',
      category: 'Furniture',
      text: 'Procurement of 120 ergonomic medium back revolving office chairs with synchronous tilt mechanism, pneumatic height adjustment, lumbar support, and flame retardant fabric upholstery.',
    },
    {
      label: 'Solar Water Heater',
      category: 'Renewable Energy',
      text: 'Supply and installation of 20 evacuated tube collector (ETC) domestic solar water heating systems of 200 LPD capacity with inner stainless steel tank SS 304 and electrical backup heating element.',
    },
    {
      label: 'Electrical Cable',
      category: 'Electrical',
      text: 'Procurement of 3,000 meters 1.1 kV grade 4 core 120 sq.mm XLPE insulated, PVC sheathed, heavy duty aluminum conductor armored cable for underground power distribution.',
    },
    {
      label: 'Safety Helmet',
      category: 'Personal Protective Equipment',
      text: 'Supply of 400 industrial safety helmets with ratchet suspension, Chin strap, electrical resistance up to 2,000V, and high impact penetration resistance for civil construction personnel.',
    },
  ];

  // Animated processing flow labels
  const processingStages = [
    'Understanding requirement...',
    'Extracting technical parameters & quantities...',
    'Identifying operational application & environment...',
    'Checking missing information & specification gaps...',
    'Querying Indian Standards knowledge graph & FAISS index...',
    'Connecting normative test methods & safety codes...',
    'Synthesizing 9-section tender technical schedule...',
  ];

  // Load existing analysis if provided in URL
  useEffect(() => {
    if (existingAnalysisId) {
      loadExistingAnalysis(existingAnalysisId);
    }
    loadCatalogue();
  }, [existingAnalysisId]);

  const loadCatalogue = async () => {
    try {
      const list = await getStandards();
      setAllCatalogueStandards(list);
    } catch (_) {}
  };

  const loadExistingAnalysis = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await getHistoryDetail(id);
      setAnalysis(res);
      setRequirementText(res.user_requirement || '');
    } catch (err: any) {
      setError(err?.message || 'Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // Run or re-run analysis
  const executeAnalysis = async (payload: AnalyzeRequest) => {
    setIsLoading(true);
    setError(null);
    setProcessingStep(0);

    // Animate processing steps
    const interval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < processingStages.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const response = await analyzeRequirement({
        ...payload,
        project_id: projectIdParam,
      });
      clearInterval(interval);
      setAnalysis(response);
      showToast('Procurement specification audit completed', 'success');

      // Auto-open clarifying questions if critical info is missing
      if (
        response.clarifying_questions &&
        response.clarifying_questions.length > 0 &&
        response.audit.readiness_score < 75
      ) {
        setIsClarifyOpen(true);
      }
    } catch (err: any) {
      clearInterval(interval);
      setError(err?.message || 'Failed to complete analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirementText.trim()) return;

    executeAnalysis({
      requirement: requirementText.trim(),
      category: selectedCategory || undefined,
      quantity: quantity || undefined,
    });
  };

  // Document Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingDoc(true);
      setDocUploadStatus('Reading document...');
      setTimeout(() => setDocUploadStatus('Extracting requirements...'), 600);

      const res = await uploadDocument(file);
      setDocUploadStatus('Requirement extracted successfully!');
      setRequirementText(res.text);
      showToast(`Extracted ${res.character_count} characters from ${res.filename}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Document upload failed', 'error');
    } finally {
      setIsUploadingDoc(false);
      setTimeout(() => setDocUploadStatus(null), 3000);
    }
  };

  // Clarifications handler
  const handleApplyClarifications = async (answers: ClarificationAnswer[]) => {
    if (!analysis) return;
    try {
      setIsLoading(true);
      const updated = await clarifyAnalysis(analysis.analysis_id, answers);
      setAnalysis(updated);
      setIsClarifyOpen(false);
      showToast('Requirements clarified & readiness score re-evaluated!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update clarifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Editable parameters re-run
  const handleReAnalyzeWithUpdatedParams = (updated: StructuredRequirement) => {
    executeAnalysis({
      requirement: requirementText,
      category: updated.category,
      application: updated.application,
      quantity: updated.quantity || undefined,
      technical_specs: updated.requirements ? updated.requirements.join(', ') : undefined,
    });
  };

  // What-If Context Apply
  const handleApplyWhatIf = (newEnv: string, newApp: string) => {
    if (!analysis) return;
    const currentReq = analysis.structured_requirement;
    handleReAnalyzeWithUpdatedParams({
      ...currentReq,
      environment: newEnv,
      application: newApp,
    });
  };

  // Compare standard toggle
  const handleToggleCompare = (stdId: string) => {
    if (compareStandardIds.includes(stdId)) {
      setCompareStandardIds(compareStandardIds.filter((id) => id !== stdId));
    } else {
      if (compareStandardIds.length < 3) {
        setCompareStandardIds([...compareStandardIds, stdId]);
      } else {
        showToast('Maximum 3 standards can be compared simultaneously.', 'info');
      }
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#EAE2D6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#557A5B]">
              Procurement Intelligence Engine
            </span>
            {projectIdParam && (
              <span className="text-xs px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] font-mono text-[#20241F]">
                Project Linked
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F]">
            AI Procurement Specification Auditor
          </h1>
          <p className="text-xs sm:text-sm text-[#20241F]/70 mt-1 max-w-3xl leading-relaxed">
            From Requirement → Standard → Compliance → Tender. Audit technical completeness, identify missing test clauses, and build verified standards schedules.
          </p>
        </div>

        {/* Action Bar when analysis exists */}
        {analysis && !isLoading && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSaveTarget({
                  type: 'analysis',
                  id: analysis.analysis_id,
                  title: `${analysis.structured_requirement.product || 'Specification'} Audit`,
                  meta: { readiness: analysis.audit.readiness_score },
                });
                setIsSaveModalOpen(true);
              }}
              className="px-3 py-2 rounded-lg border border-[#EAE2D6] bg-white text-xs font-semibold text-[#20241F] hover:bg-[#F7F2EB] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-[#8B9A6E]" />
              <span>Save to Project</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#557A5B] hover:bg-[#436248] text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Tender Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Guided 7-Step Workflow Stepper */}
      <div className="bg-white border border-[#EAE2D6] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
          {[
            { id: 1, title: 'Describe Requirement', targetId: 'step-1-requirement' },
            { id: 2, title: 'AI Understanding', targetId: 'step-2-understanding' },
            { id: 3, title: 'Clarify Missing Info', targetId: 'step-3-clarify' },
            { id: 4, title: 'Specification Audit', targetId: 'step-4-audit' },
            { id: 5, title: 'Standards Intelligence', targetId: 'step-5-standards' },
            { id: 6, title: 'Review & Improve', targetId: 'step-6-improve' },
            { id: 7, title: 'Save / Report', targetId: 'step-7-report' },
          ].map((st, idx) => {
            const stepNum = st.id;
            const isCompleted = analysis ? stepNum < 7 : false;
            const isCurrent = !analysis && !isLoading ? stepNum === 1 : isLoading ? stepNum === 2 : stepNum >= 4;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  const el = document.getElementById(st.targetId);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  if (st.id === 3 && analysis?.clarifying_questions?.length) {
                    setIsClarifyOpen(true);
                  }
                }}
                disabled={!analysis && stepNum > 1 && !isLoading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-[#FAF7F2] border border-[#8B9A6E] text-[#20241F]'
                    : isCompleted
                    ? 'text-[#557A5B] hover:bg-[#F7F8F5]'
                    : 'text-gray-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                    isCompleted
                      ? 'bg-[#557A5B] text-white'
                      : isCurrent
                      ? 'bg-[#20241F] text-white ring-2 ring-[#8B9A6E]/50'
                      : 'border border-gray-300 text-gray-400 bg-white'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                    Step {stepNum}
                  </div>
                  <div className="text-xs font-semibold whitespace-nowrap">
                    {st.title}
                  </div>
                </div>
                {idx < 6 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-1 hidden xl:block" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 1: REQUIREMENT INPUT WORKFLOW */}
      {/* ============================================================== */}
      <div id="step-1-requirement" className="bg-white border border-[#EAE2D6] rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#EAE2D6] bg-[#F7F2EB] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#8B9A6E] text-white flex items-center justify-center text-xs font-bold font-mono">
              1
            </span>
            <h3 className="font-serif text-base font-bold text-[#20241F]">
              What are you planning to procure?
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Document Upload Button */}
            <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-[#EAE2D6] bg-white hover:bg-gray-50 text-xs font-medium text-[#20241F] transition-colors flex items-center gap-1.5 shadow-xs">
              <Upload className="w-3.5 h-3.5 text-[#575E54]" />
              <span>{isUploadingDoc ? 'Reading Doc...' : 'Upload Tender Doc (PDF/DOCX/TXT)'}</span>
              <input
                type="file"
                accept=".txt,.pdf,.docx"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploadingDoc}
              />
            </label>
          </div>
        </div>

        {/* Upload status banner */}
        {docUploadStatus && (
          <div className="px-6 py-2 bg-[#F0FFF4] border-b border-[#38A169]/20 text-xs text-[#22543D] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38A169] animate-ping" />
            <span>{docUploadStatus}</span>
          </div>
        )}

        <form onSubmit={handleInitialSubmit} className="p-6 space-y-5">
          {/* Sample quick-select buttons */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
              Populate from real procurement benchmarks:
            </span>
            <div className="flex flex-wrap gap-2">
              {samples.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRequirementText(s.text);
                    setSelectedCategory(s.category);
                  }}
                  className="px-3 py-1 rounded-full border border-[#EAE2D6] bg-[#FAF7F2] hover:bg-[#F7F2EB] text-xs font-medium text-[#20241F] transition-all hover:border-[#8B9A6E]"
                >
                  + {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Requirement Textarea */}
          <div>
            <textarea
              required
              rows={4}
              placeholder="We need 500 energy-efficient LED street lights for municipal roads. They should work outdoors and have IP66 protection..."
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              className="w-full text-xs sm:text-sm p-4 border border-[#EAE2D6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] font-sans leading-relaxed text-[#20241F]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-xs text-gray-500">
              Paste raw specifications, tender schedules, or scope of supply.
            </div>

            <button
              type="submit"
              disabled={isLoading || !requirementText.trim()}
              className="px-6 py-2.5 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Auditing Specification...</span>
                </>
              ) : (
                <>
                  <span>Audit & Find Applicable Standards</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ============================================================== */}
      {/* PROCESSING STATE: REAL ANIMATED CHECKLIST PROGRESS */}
      {/* ============================================================== */}
      {isLoading && (
        <div className="bg-white border border-[#EAE2D6] rounded-xl p-8 shadow-sm space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className="w-10 h-10 border-3 border-[#8B9A6E] border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#20241F]">
              Auditing Procurement Requirement
            </h3>
            <p className="text-xs text-gray-500">
              Analyzing technical clauses against Indian Standards knowledge graph...
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2.5 pt-4 border-t border-[#EAE2D6]">
            {processingStages.map((stg, idx) => {
              const isDone = idx < processingStep;
              const isCurrent = idx === processingStep;

              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  {isDone ? (
                    <span className="w-5 h-5 rounded-full bg-[#557A5B] text-white flex items-center justify-center font-bold text-[10px]">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-[#8B9A6E] border-t-transparent animate-spin" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-gray-300 text-gray-300 flex items-center justify-center text-[10px]">
                      ○
                    </span>
                  )}
                  <span
                    className={`font-medium ${
                      isDone
                        ? 'text-[#20241F]'
                        : isCurrent
                        ? 'text-[#8B9A6E] font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {stg}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-900 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* POST-ANALYSIS INTERACTIVE WORKSPACE */}
      {/* ============================================================== */}
      {analysis && !isLoading && (
        <div className="space-y-10">
          {/* Clarification Questions Prompt Banner */}
          {analysis.clarifying_questions && analysis.clarifying_questions.length > 0 && (
            <div id="step-3-clarify" className="p-5 rounded-xl bg-[#FFFBEB] border border-[#B7791F]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-[#B7791F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#92400E]">
                    AI Clarifying Questions Available ({analysis.clarifying_questions.length} Details Missing)
                  </h4>
                  <p className="text-xs text-[#92400E]/80 mt-0.5">
                    We extracted the main product, but answering key operating environment details will make your specification legally complete.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClarifyOpen(true)}
                className="px-4 py-2 bg-[#B7791F] hover:bg-[#92400E] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
              >
                Answer Questions (Step by Step) →
              </button>
            </div>
          )}

          {/* SECTION 10: STRUCTURED REQUIREMENT REVIEW */}
          <div id="step-2-understanding">
            <StructuredRequirementReview
              structuredReq={analysis.structured_requirement}
              onUpdateAndReAnalyze={handleReAnalyzeWithUpdatedParams}
              isLoading={isLoading}
            />
          </div>

          {/* SECTION 12 & 13: SPECIFICATION GAP AUDIT & READINESS SCORE */}
          <div id="step-4-audit" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4">
              <ReadinessScoreCard audit={analysis.audit} />
            </div>
            <div className="lg:col-span-8">
              <SpecificationGapAudit audit={analysis.audit} />
            </div>
          </div>

          {/* SECTION 16: INTERACTIVE STANDARDS RELATIONSHIP GRAPH & SECTION 14 & 15: STANDARDS RECOMMENDATIONS */}
          <div id="step-5-standards" className="space-y-6">
            {analysis.graph && (
              <StandardRelationshipGraph
                graph={analysis.graph}
                onSelectStandard={(stdId) => navigate(`/standards/${stdId}`)}
              />
            )}

            <div className="bg-white border border-[#EAE2D6] rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#EAE2D6] bg-[#F7F2EB] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
                    <h3 className="font-serif text-lg font-bold text-[#20241F]">
                      Prescribed Indian Standards Schedule
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#EAE2D6] text-[#20241F] font-mono font-medium">
                      {analysis.recommendations.length} Standards Catalogued
                    </span>
                  </div>
                  <p className="text-xs text-[#20241F]/70 mt-1">
                    Organized by role: Primary product specifications, mandatory test methods, and electrical safety codes.
                  </p>
                </div>

                {/* Compare Trigger */}
                {compareStandardIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCompareOpen(true)}
                    className="px-3 py-1.5 bg-[#8B9A6E] text-white text-xs font-medium rounded-lg hover:bg-[#707E55] transition-colors shadow-xs"
                  >
                    Compare Selected ({compareStandardIds.length}) →
                  </button>
                )}
              </div>

              <div className="p-6 divide-y divide-[#EAE2D6]">
                {analysis.recommendations.map((rec) => {
                  const std = rec.standard_details;
                  const isSelectedForCompare = compareStandardIds.includes(rec.standard_id);

                  return (
                    <div key={rec.standard_id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Link
                              to={`/standards/${rec.standard_id}`}
                              className="font-mono text-sm font-bold text-[#20241F] hover:text-[#8B9A6E] hover:underline"
                            >
                              {rec.standard_id}
                            </Link>

                            {rec.role_category && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] font-mono font-semibold text-[#557A5B]">
                                {rec.role_category}
                              </span>
                            )}

                            <span
                              className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                                std.data_status === 'verified'
                                  ? 'border-[#557A5B]/30 bg-[#F0FFF4] text-[#22543D]'
                                  : 'border-[#B7791F]/30 bg-[#FFFBEB] text-[#92400E]'
                              }`}
                            >
                              {std.data_status}
                            </span>

                            {std.version && (
                              <span className="text-[10px] text-gray-500 font-mono">
                                Ver: {std.version}
                              </span>
                            )}
                          </div>

                          <h4 className="font-serif text-base font-semibold text-[#20241F]">
                            {rec.title}
                          </h4>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleCompare(rec.standard_id)}
                            className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                              isSelectedForCompare
                                ? 'bg-[#8B9A6E] text-white border-[#8B9A6E]'
                                : 'bg-white text-gray-600 border-[#EAE2D6] hover:bg-gray-50'
                            }`}
                          >
                            {isSelectedForCompare ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" /> In Compare
                              </span>
                            ) : (
                              '+ Compare'
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setWhyFoundRec(rec)}
                            className="px-2.5 py-1 rounded bg-[#FAF7F2] hover:bg-[#F7F2EB] text-[#20241F] border border-[#EAE2D6] text-xs font-medium transition-colors"
                          >
                            <span className="flex items-center gap-1">
                              Why was this found? <Info className="w-3 h-3 text-[#8B9A6E]" />
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSaveTarget({
                                type: 'standard',
                                id: rec.standard_id,
                                title: rec.title,
                                meta: { category: rec.category },
                              });
                              setIsSaveModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-[#FAF7F2] hover:bg-[#F7F2EB] text-[#20241F] border border-[#EAE2D6] text-xs font-medium transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#20241F]/80 leading-relaxed font-sans">
                        {rec.why_recommended}
                      </p>

                      {/* Matched parameters chips */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                        <span className="text-[11px] font-semibold text-gray-500">
                          Evidence Matches:
                        </span>
                        {rec.match_criteria.map((crit, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-[#F7F8F5] border border-[#EAE2D6] text-[11px] text-[#20241F]"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 text-[#557A5B]" />
                              <span>{crit}</span>
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 20: WHAT-IF ANALYSIS */}
            <WhatIfAnalysis
              currentEnvironment={analysis.structured_requirement.environment}
              currentApplication={analysis.structured_requirement.application}
              onApplyContext={handleApplyWhatIf}
            />
          </div>

          {/* SECTION 19: BEFORE / AFTER SPECIFICATION IMPROVEMENT */}
          {analysis.improved_specification && (
            <div id="step-6-improve">
              <BeforeAfterSpec
                originalText={analysis.user_requirement}
                improvedSpec={analysis.improved_specification}
                onExport={() => setIsExportOpen(true)}
              />
            </div>
          )}

          {/* STEP 7: SAVE / REPORT FINALIZATION */}
          <div id="step-7-report" className="bg-white border border-[#EAE2D6] rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#8B9A6E] text-white flex items-center justify-center text-xs font-bold font-mono">
                    7
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#20241F]">
                    Save Audit & Generate Tender Documentation
                  </h3>
                </div>
                <p className="text-xs text-[#20241F]/70">
                  Save this specification audit to your procurement docket or export an official tender compliance report.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setSaveTarget({
                      type: 'analysis',
                      id: analysis.analysis_id,
                      title: `${analysis.structured_requirement.product || 'Specification'} Audit`,
                      meta: { readiness: analysis.audit.readiness_score },
                    });
                    setIsSaveModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-lg border border-[#EAE2D6] bg-white text-xs font-semibold text-[#20241F] hover:bg-[#F7F2EB] transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-[#8B9A6E]" />
                  <span>Save to Project Docket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExportOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#557A5B] hover:bg-[#436248] text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Tender Report (PDF/DOCX/JSON)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS */}
      {/* ============================================================== */}

      {/* Clarifying Questions Modal */}
      {analysis && (
        <ClarifyingQuestionsModal
          isOpen={isClarifyOpen}
          onClose={() => setIsClarifyOpen(false)}
          questions={analysis.clarifying_questions}
          onSubmitAnswers={handleApplyClarifications}
        />
      )}

      {/* Why Found Drawer */}
      <WhyFoundDrawer
        isOpen={Boolean(whyFoundRec)}
        onClose={() => setWhyFoundRec(null)}
        recommendation={whyFoundRec}
        structuredReq={analysis?.structured_requirement}
      />

      {/* Compare Standards Modal */}
      <CompareStandardsModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        initialStandardIds={compareStandardIds}
        allStandards={allCatalogueStandards}
      />

      {/* Save To Project Modal */}
      {saveTarget && (
        <SaveToProjectModal
          isOpen={isSaveModalOpen}
          onClose={() => {
            setIsSaveModalOpen(false);
            setSaveTarget(null);
          }}
          itemType={saveTarget.type}
          itemId={saveTarget.id}
          itemTitle={saveTarget.title}
          itemMeta={saveTarget.meta}
        />
      )}

      {/* Export Report Modal */}
      {analysis && (
        <ExportReportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          analysis={analysis}
          projectId={projectIdParam}
        />
      )}
    </div>
  );
};
