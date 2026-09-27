import React, { useState } from 'react';
import { StandardRecord } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Wrench,
  FlaskConical,
  Award,
  BookOpen,
  Calendar,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface StandardDetailsModalProps {
  standard: StandardRecord | null;
  onClose: () => void;
}

export const StandardDetailsModal: React.FC<StandardDetailsModalProps> = ({
  standard,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'safety' | 'testing' | 'compliance' | 'references'>('specs');
  const [copied, setCopied] = useState(false);

  if (!standard) return null;

  const handleCopyCitation = () => {
    const citation = `${standard.id}: ${standard.title} (${standard.version}) - ${standard.source}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#E2E8F0] overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#0B1220] text-white p-6 flex items-start justify-between">
          <div className="space-y-1.5 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold bg-[#E87524] text-[#0B1220] px-2.5 py-0.5 rounded tracking-wide">
                {standard.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/20">
                {standard.category}
              </span>
              <span className="badge-demo text-[11px]">
                {standard.data_status}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-white leading-snug">
              {standard.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
              <span>Version: <strong className="font-mono">{standard.version}</strong></span>
              <span>•</span>
              <span>Source: <strong>{standard.source}</strong></span>
              {standard.verified_at && (
                <>
                  <span>•</span>
                  <span>Verified: {standard.verified_at}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8F0] bg-slate-50 px-6 overflow-x-auto">
          {[
            { id: 'specs', label: 'Technical Specifications', icon: FileText },
            { id: 'safety', label: 'Safety & Installation', icon: Wrench },
            { id: 'testing', label: 'Test Methods', icon: FlaskConical },
            { id: 'compliance', label: 'Certification', icon: Award },
            { id: 'references', label: 'References & Amendments', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#0B1220] text-[#0B1220] bg-white'
                    : 'border-transparent text-[#64748B] hover:text-[#0B1220]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E87524]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#0B1220]">
          {/* Scope Overview Always Visible */}
          <div className="bg-[#F8FAFC] p-4 rounded-md border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">
              Standard Scope & Application Field
            </h4>
            <p className="text-xs leading-relaxed text-slate-800">
              {standard.scope}
            </p>
          </div>

          {/* TAB: Technical Specifications */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#16745A]" />
                <span>Prescribed Technical Parameters & Thresholds</span>
              </h3>
              <ul className="space-y-2.5">
                {standard.technical_requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded bg-white border border-slate-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#16745A] shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB: Safety & Installation */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wide flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#E87524]" />
                  <span>Mandatory Safety Requirements</span>
                </h3>
                <ul className="space-y-2">
                  {standard.safety_requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded bg-amber-50/50 border border-amber-200/60 text-xs text-amber-950 font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#E87524] shrink-0 mt-1" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wide flex items-center gap-2 mb-3">
                  <Wrench className="w-4 h-4 text-[#0B1220]" />
                  <span>Installation & Field Guidelines</span>
                </h3>
                <ul className="space-y-2">
                  {standard.installation_requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0 mt-1" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB: Test Methods */}
          {activeTab === 'testing' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wide flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#16745A]" />
                <span>Verification & Laboratory Test Protocols</span>
              </h3>
              <ul className="space-y-2.5">
                {standard.test_methods.map((test, i) => (
                  <li key={i} className="p-3.5 rounded bg-emerald-50/40 border border-emerald-200/70 text-xs text-emerald-950">
                    <div className="font-semibold text-[#16745A] mb-0.5">Test Protocol #{i + 1}</div>
                    <div>{test}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB: Compliance & Certification */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wide flex items-center gap-2">
                <Award className="w-4 h-4 text-[#E87524]" />
                <span>Regulatory Compliance & Conformity Scheme</span>
              </h3>
              <div className="space-y-2.5">
                {standard.certification.map((cert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded bg-slate-50 border border-slate-200 text-xs">
                    <Award className="w-4 h-4 text-[#E87524] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#0B1220]">{cert}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Required for public sector tender bid eligibility and acceptance.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: References & Amendments */}
          {activeTab === 'references' && (
            <div className="space-y-6">
              {/* Amendments */}
              <div>
                <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wide flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[#0B1220]" />
                  <span>Document Amendments & Revisions</span>
                </h3>
                {standard.amendments.length > 0 ? (
                  <ul className="space-y-2">
                    {standard.amendments.map((amend, i) => (
                      <li key={i} className="p-3 rounded bg-blue-50/50 border border-blue-200 text-xs text-blue-900 font-medium">
                        {amend}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#64748B] italic">No active amendments registered for this version.</p>
                )}
              </div>

              {/* Normative References */}
              <div>
                <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wide flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-[#16745A]" />
                  <span>Normative References Cited</span>
                </h3>
                {standard.normative_references.length > 0 ? (
                  <ul className="space-y-2">
                    {standard.normative_references.map((norm, i) => (
                      <li key={i} className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono">
                        {norm}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#64748B] italic">No normative cross-references cited.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Prototype Demo Record — Grounded in Prototype Knowledge Base
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyCitation}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors w-full sm:w-auto"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Citation Copied' : 'Copy Citation'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1220] rounded hover:bg-slate-800 transition-colors w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
