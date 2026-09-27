import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, RotateCcw, ArrowRight, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalyzeRequest } from '../types';

interface RequirementInputProps {
  onSubmit: (request: AnalyzeRequest) => void;
  isLoading: boolean;
  initialValues?: AnalyzeRequest;
}

const PRESET_REQUIREMENTS = [
  {
    label: "500 LED Street Lights (Municipal Roads)",
    text: "We need 500 energy-efficient LED street lights for municipal roads with high surge protection and IP66 ingress protection.",
    category: "Lighting"
  },
  {
    label: "100 Ergonomic Office Chairs (Secretariat)",
    text: "Procurement of 100 ergonomic mesh swivel office chairs with Class-4 gas lift and adjustable lumbar support for administrative staff.",
    category: "Office Furniture"
  },
  {
    label: "50 Metric Tons TMT Steel Bars (RCC Bridge)",
    text: "Supply of 50 MT high-ductility Fe-500D thermo-mechanically treated (TMT) steel reinforcement bars for flyover and bridge foundation.",
    category: "Construction Materials"
  },
  {
    label: "200 Industrial Safety Helmets (Site PPE)",
    text: "Procuring 200 industrial safety hard hat helmets with shock absorption and 440V electrical proof insulation for infrastructure site workers.",
    category: "Safety Equipment"
  },
  {
    label: "5 Units 11kV Distribution Transformers",
    text: "Need 5 outdoor oil-immersed distribution transformers 11kV/433V 100kVA with copper windings and BEE Star energy efficiency rating.",
    category: "Electrical Equipment"
  }
];

const CATEGORIES = [
  "All",
  "Lighting",
  "Electrical Equipment",
  "Construction Materials",
  "Office Furniture",
  "Safety Equipment",
  "IT & Office Hardware",
  "Water Supply & Sanitation"
];

export const RequirementInput: React.FC<RequirementInputProps> = ({
  onSubmit,
  isLoading,
  initialValues
}) => {
  const [requirement, setRequirement] = useState(initialValues?.requirement || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [category, setCategory] = useState(initialValues?.category || 'All');
  const [application, setApplication] = useState(initialValues?.application || '');
  const [technicalSpecs, setTechnicalSpecs] = useState(initialValues?.technical_specs || '');
  const [quantity, setQuantity] = useState<number | undefined>(initialValues?.quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement.trim()) return;

    onSubmit({
      requirement: requirement.trim(),
      category: category !== 'All' ? category : undefined,
      application: application.trim() || undefined,
      technical_specs: technicalSpecs.trim() || undefined,
      quantity: quantity ? Number(quantity) : undefined
    });
  };

  const handleClear = () => {
    setRequirement('');
    setCategory('All');
    setApplication('');
    setTechnicalSpecs('');
    setQuantity(undefined);
  };

  const handleSelectPreset = (preset: typeof PRESET_REQUIREMENTS[0]) => {
    setRequirement(preset.text);
    setCategory(preset.category);
  };

  return (
    <div className="card-enterprise bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0B1220] font-heading flex items-center gap-2">
            <span>Analyze Procurement Requirement</span>
            <span className="badge-demo text-[11px]">Prototype Mode</span>
          </h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Describe what you want to procure in natural language. BharatSpec AI will extract technical requirements and match verified Indian Standards.
          </p>
        </div>
      </div>

      {/* Preset Quick Fill Buttons */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1220] mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-[#E87524]" />
          <span>Quick Sample Scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_REQUIREMENTS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs px-3 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors text-left font-medium"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Requirement Textarea */}
        <div>
          <label htmlFor="procurement-requirement" className="block text-sm font-semibold text-[#0B1220] mb-1.5">
            Procurement Requirement Description <span className="text-[#DC2626]">*</span>
          </label>
          <textarea
            id="procurement-requirement"
            rows={4}
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Example: We need 500 energy-efficient LED street lights for municipal roads."
            className="w-full px-4 py-3 rounded-md border border-[#E2E8F0] bg-[#FDFDFD] text-[#0B1220] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1220] focus:border-transparent text-sm leading-relaxed transition-all"
            required
            minLength={5}
          />
        </div>

        {/* Collapsible Advanced Parameters */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0B1220] transition-colors focus:outline-none"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E87524]" />
            <span>{showAdvanced ? 'Hide Optional Tender Parameters' : 'Add Optional Tender Details (Category, Application, Specs, Quantity)'}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 p-4 rounded-md bg-slate-50 border border-slate-200/80 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1220]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Application
                </label>
                <input
                  type="text"
                  value={application}
                  onChange={(e) => setApplication(e.target.value)}
                  placeholder="e.g. Municipal highway, Secretariat"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1220]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Technical Spec
                </label>
                <input
                  type="text"
                  value={technicalSpecs}
                  onChange={(e) => setTechnicalSpecs(e.target.value)}
                  placeholder="e.g. 10kV surge, Fe-500D, Class 4"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1220]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tender Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity || ''}
                  onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1220]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0B1220] rounded hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !requirement.trim()}
            className="inline-flex items-center gap-2 bg-[#0B1220] hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-md text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-[#0B1220]"
          >
            <Sparkles className="w-4 h-4 text-[#E87524]" />
            <span>{isLoading ? 'Analyzing Procurement Requirement...' : 'Analyze Requirement'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </form>
    </div>
  );
};
