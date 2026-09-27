import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Network, Sliders } from 'lucide-react';
import { AnalyzeResponse } from '../types';
import { analyzeRequirement } from '../services/api';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Interactive Live Hero Demo state
  const [demoText, setDemoText] = useState<string>(
    'We need 500 energy-efficient LED street lights for municipal roads.'
  );
  const [demoResult, setDemoResult] = useState<AnalyzeResponse | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);

  const handleRunDemo = async () => {
    try {
      setIsDemoLoading(true);
      const res = await analyzeRequirement({
        requirement: demoText,
      });
      setDemoResult(res);
    } catch (err) {
      console.error('Demo analysis error:', err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handlePopulateSample = (text: string) => {
    setDemoText(text);
    setDemoResult(null);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* ============================================================== */}
      {/* HERO SECTION WITH LIVE INTERACTIVE PRODUCT DEMONSTRATION */}
      {/* ============================================================== */}
      <section className="relative pt-10 sm:pt-16 pb-16 border-b border-[#EAE2D6] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Product Positioning & Value Prop */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE2D6] text-xs font-semibold text-[#20241F]">
                <span className="w-2 h-2 rounded-full bg-[#8B9A6E]" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#557A5B]">
                  From Requirement → Standard → Compliance → Tender
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#20241F] leading-tight">
                Turn procurement requirements into standards-aware specifications.
              </h1>

              <p className="text-sm sm:text-base text-[#20241F]/80 leading-relaxed max-w-xl font-sans">
                BharatSpec AI helps you understand a requirement, identify applicable standards, find related requirements, detect specification gaps, and prepare a clearer procurement specification.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/analyze"
                  className="px-6 py-3 rounded-lg bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs flex items-center gap-2"
                >
                  <span>Start an Analysis</span>
                  <span>→</span>
                </Link>

                <Link
                  to="/standards"
                  className="px-5 py-3 rounded-lg bg-white hover:bg-[#F7F2EB] text-[#20241F] text-xs sm:text-sm font-semibold border border-[#EAE2D6] transition-colors shadow-xs"
                >
                  Explore Standards
                </Link>
              </div>

              {/* Trust & Quality Indicators */}
              <div className="pt-6 border-t border-[#EAE2D6] grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-serif font-bold text-sm text-[#20241F] block">
                    Zero Hallucination
                  </span>
                  <span className="text-[#20241F]/70 text-[11px] block mt-0.5">
                    Grounded in verified catalogue
                  </span>
                </div>
                <div>
                  <span className="font-serif font-bold text-sm text-[#20241F] block">
                    10-Point Audit
                  </span>
                  <span className="text-[#20241F]/70 text-[11px] block mt-0.5">
                    Identifies missing test clauses
                  </span>
                </div>
                <div>
                  <span className="font-serif font-bold text-sm text-[#20241F] block">
                    Normative Graph
                  </span>
                  <span className="text-[#20241F]/70 text-[11px] block mt-0.5">
                    Links safety & test methods
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Hero Demo */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl border border-[#EAE2D6] shadow-xl overflow-hidden">
                {/* Demo Card Header */}
                <div className="bg-[#20241F] text-white px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
                    <span className="text-xs font-semibold tracking-wide text-gray-200">
                      LIVE SPECIFICATION AUDIT WORKFLOW
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 font-mono text-gray-300">
                    Interactive Demo
                  </span>
                </div>

                {/* Demo Body */}
                <div className="p-5 space-y-4 text-xs">
                  {/* Sample selection chips */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-medium">Try a benchmark requirement:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handlePopulateSample(
                          'We need 500 energy-efficient LED street lights for municipal roads.'
                        )
                      }
                      className="text-[#8B9A6E] font-semibold hover:underline"
                    >
                      LED Street Light
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handlePopulateSample(
                          'Procurement of 120 ergonomic medium back revolving office chairs with lumbar support.'
                        )
                      }
                      className="text-[#8B9A6E] font-semibold hover:underline"
                    >
                      Office Chairs
                    </button>
                  </div>

                  {/* Input area */}
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={demoText}
                      onChange={(e) => setDemoText(e.target.value)}
                      className="w-full text-xs p-3 border border-[#EAE2D6] rounded-lg bg-[#FAF7F2] focus:bg-white text-[#20241F] focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        Live backend execution via FAISS & Deterministic Rules
                      </span>
                      <button
                        type="button"
                        onClick={handleRunDemo}
                        disabled={isDemoLoading || !demoText.trim()}
                        className="px-4 py-1.5 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isDemoLoading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Auditing...</span>
                          </>
                        ) : (
                          <span>Analyze Example →</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Live Results State or Initial Explainer */}
                  {demoResult ? (
                    <div className="space-y-3 pt-3 border-t border-[#EAE2D6] animate-in fade-in duration-300">
                      {/* Structured Extracted Parameters */}
                      <div className="p-3 rounded-lg bg-[#F7F8F5] border border-[#EAE2D6] grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-gray-500 block text-[10px] uppercase font-semibold">
                            Identified Product
                          </span>
                          <strong className="text-[#20241F]">
                            {demoResult.structured_requirement.product || 'Equipment'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] uppercase font-semibold">
                            Application
                          </span>
                          <strong className="text-[#20241F]">
                            {demoResult.structured_requirement.application || 'General'}
                          </strong>
                        </div>
                      </div>

                      {/* Missing Information & Readiness score */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6]">
                        <div className="text-xs">
                          <span className="font-semibold text-[#20241F] block">
                            Specification Readiness Index
                          </span>
                          <span className="text-[11px] text-[#B7791F]">
                            {demoResult.audit.critical_missing.length > 0
                              ? `Missing: ${demoResult.audit.critical_missing.slice(0, 2).join(', ')}`
                              : 'Checklist verified'}
                          </span>
                        </div>
                        <span className="font-mono text-base font-bold text-[#557A5B]">
                          {demoResult.audit.readiness_score} / 100
                        </span>
                      </div>

                      {/* Matched Primary Standard Card */}
                      {demoResult.recommendations.length > 0 && (
                        <div className="p-3 rounded-lg bg-white border border-[#8B9A6E]/40 space-y-1 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-[#20241F]">
                              {demoResult.recommendations[0].standard_id}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0FFF4] text-[#22543D] font-mono">
                              {demoResult.recommendations[0].standard_details.data_status}
                            </span>
                          </div>
                          <div className="font-serif font-bold text-xs text-[#20241F] line-clamp-1">
                            {demoResult.recommendations[0].title}
                          </div>
                          <p className="text-[11px] text-[#20241F]/70 line-clamp-2">
                            {demoResult.recommendations[0].why_recommended}
                          </p>
                        </div>
                      )}

                      {/* Full Workspace CTA */}
                      <button
                        type="button"
                        onClick={() => navigate(`/analyze?id=${demoResult.analysis_id}`)}
                        className="w-full py-2 bg-[#20241F] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors text-center shadow-xs"
                      >
                        Open Full Audit Workspace & Relationship Graph →
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6] text-xs text-[#20241F]/75 space-y-1.5">
                      <span className="font-serif font-bold text-[#20241F] block">
                        What happens when you click "Analyze Example"?
                      </span>
                      <p className="leading-relaxed">
                        1. Parameters & environmental conditions are isolated.<br />
                        2. Specification gaps (testing, safety, ingress) are audited.<br />
                        3. Verified Indian Standards and test methods are matched from the knowledge base.<br />
                        4. A 9-section tender technical schedule is synthesized.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4-STAGE PROCUREMENT INTELLIGENCE WORKFLOW */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-wider text-[#557A5B]">
            Engineered for Procurement Officers & Drafters
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F] mt-1">
            How BharatSpec AI Structures Procurement Specs
          </h2>
          <p className="text-xs sm:text-sm text-[#20241F]/70 mt-2 font-sans">
            A deterministic audit flow connecting raw procurement intents to legally binding Indian Standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Understand Requirement',
              desc: 'Provide your requirement in plain language or upload tender schedules (PDF, DOCX, TXT). The system extracts quantities, performance thresholds, and operational environment.',
            },
            {
              step: '02',
              title: 'Specification Gap Audit',
              desc: 'Identifies missing test methods, environmental ratings, or surge protection clauses before tender release to prevent substandard supplier deliveries.',
            },
            {
              step: '03',
              title: 'Standards Graph & Normatives',
              desc: 'Links the primary product standard to companion test protocols (IS 16107), ingress protection (IS/IEC 60529), and safety codes in an interactive visual graph.',
            },
            {
              step: '04',
              title: '9-Section Tender Schedule',
              desc: 'Generates a standardized technical tender schedule with before/after diff comparison, inline clause editing, and instant report export.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-[#EAE2D6] shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-2xl font-bold text-[#8B9A6E] block mb-3">
                  {item.step}
                </span>
                <h3 className="font-serif text-base font-bold text-[#20241F] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#20241F]/70 leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3 CORE PILLARS OF BHARATSPEC AI */}
      {/* ============================================================== */}
      <section className="bg-white border-y border-[#EAE2D6] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-wider text-[#8B9A6E]">
              Core Capabilities
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F] mt-1">
              Rigor Over Generic AI Chatbots
            </h2>
            <p className="text-xs sm:text-sm text-[#20241F]/70 mt-2 font-sans">
              Generic LLMs invent standard numbers. BharatSpec AI enforces strict grounded retrieval and deterministic audit rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6]">
              <div className="w-8 h-8 rounded-lg bg-[#557A5B] text-white flex items-center justify-center mb-3">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#20241F] mb-2">
                Explainable Matching Evidence
              </h3>
              <p className="text-xs text-[#20241F]/70 leading-relaxed font-sans">
                Every recommended standard provides a "Why Was This Found?" audit trail, proving direct alignment with your product category, environment, and technical parameters.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6]">
              <div className="w-8 h-8 rounded-lg bg-[#8B9A6E] text-white flex items-center justify-center mb-3">
                <Network className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#20241F] mb-2">
                Standards Relationship Graph
              </h3>
              <p className="text-xs text-[#20241F]/70 leading-relaxed font-sans">
                Explore how primary standards connect to secondary drivers, safety codes, and mandatory NABL test methods in an interactive node-edge graph.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6]">
              <div className="w-8 h-8 rounded-lg bg-[#20241F] text-white flex items-center justify-center mb-3">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#20241F] mb-2">
                What-If Context Simulation
              </h3>
              <p className="text-xs text-[#20241F]/70 leading-relaxed font-sans">
                Simulate how shifting an installation from standard outdoor to high-salinity coastal triggers mandatory salt-spray tests and upgraded IP ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FINAL CALL TO ACTION */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-[#20241F] text-white p-8 sm:p-14 rounded-2xl border border-black shadow-lg">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            Ready to audit your procurement specification?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto mb-6 leading-relaxed font-sans">
            Enter your specifications and instantly receive structured Indian Standards recommendations, normative references, and a tender-ready technical schedule.
          </p>
          <div className="flex justify-center items-center gap-3">
            <Link
              to="/analyze"
              className="px-6 py-3 bg-[#8B9A6E] hover:bg-[#707E55] text-white font-semibold rounded-lg text-xs sm:text-sm shadow-sm transition-colors"
            >
              Start Requirement Analysis →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
