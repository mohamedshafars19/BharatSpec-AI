import React, { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { ImprovedSpecification, SpecSection } from '../types';

interface BeforeAfterSpecProps {
  originalText: string;
  improvedSpec: ImprovedSpecification;
  onApplyChanges?: (modifiedSpec: ImprovedSpecification) => void;
  onExport?: (format: 'txt' | 'md' | 'docx') => void;
}

export const BeforeAfterSpec: React.FC<BeforeAfterSpecProps> = ({
  originalText,
  improvedSpec,
  onApplyChanges,
  onExport,
}) => {
  const [sections, setSections] = useState<SpecSection[]>(improvedSpec.sections);
  const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleStartEdit = (idx: number, currentText: string) => {
    setEditingSectionIdx(idx);
    setEditedContent(currentText);
  };

  const handleSaveEdit = (idx: number) => {
    const updated = [...sections];
    updated[idx] = {
      ...updated[idx],
      content: editedContent,
      is_modified: true,
    };
    setSections(updated);
    setEditingSectionIdx(null);

    if (onApplyChanges) {
      onApplyChanges({
        ...improvedSpec,
        sections: updated,
      });
    }
  };

  const handleCopy = () => {
    const fullText = sections
      .map((sec) => `## ${sec.title}\n${sec.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white border border-[#EAE2D6] rounded-xl overflow-hidden shadow-sm">
      {/* Top Banner */}
      <div className="px-6 py-4 border-b border-[#EAE2D6] bg-[#F7F2EB] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#557A5B]" />
            <h3 className="font-serif text-lg font-semibold text-[#20241F]">
              Procurement Specification Comparison (Before & After)
            </h3>
          </div>
          <p className="text-xs text-[#20241F]/70 mt-1">
            Transform an ambiguous raw requirement into a legally robust, standards-aligned tender specification schedule.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg border border-[#EAE2D6] bg-white text-xs font-medium text-[#20241F] hover:bg-[#F7F2EB] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-[#557A5B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-[#20241F]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Improved Spec</span>
              </>
            )}
          </button>

          {onExport && (
            <button
              type="button"
              onClick={() => onExport('md')}
              className="px-3 py-1.5 rounded-lg bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Tender Spec</span>
            </button>
          )}
        </div>
      </div>

      {/* Improvements Highlight summary */}
      {improvedSpec.improvements_made && improvedSpec.improvements_made.length > 0 && (
        <div className="px-6 py-3 bg-[#F0FFF4] border-b border-[#38A169]/20 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-semibold text-[#22543D] whitespace-nowrap">
            Audit Additions:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {improvedSpec.improvements_made.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-white border border-[#38A169]/30 text-[#22543D] text-[11px] font-medium whitespace-nowrap inline-flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-[#38A169]" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Split Comparison Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#EAE2D6]">
        {/* Left: Original Requirement */}
        <div className="lg:col-span-4 p-5 bg-[#FAF7F2] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#20241F]/60">
               Input Specification
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#EAE2D6] text-[#20241F]/80 font-mono">
              Raw Input
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#EAE2D6] font-mono text-xs text-[#20241F]/80 leading-relaxed whitespace-pre-wrap flex-1">
            {originalText || 'No raw requirement provided.'}
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border border-[#EAE2D6] text-xs text-[#20241F]/70">
            <span className="font-semibold text-[#B7791F] mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" />
              <span>Inherent Procurement Risk:</span>
            </span>
            Raw requirements without precise standard test clauses or IP ratings leave room for vendor disputes and substandard supply acceptance.
          </div>
        </div>

        {/* Right: Improved Specification */}
        <div className="lg:col-span-8 p-5 bg-white space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#557A5B]">
              Standardized Procurement Schedule (9 Sections)
            </span>
            <span className="text-[11px] text-[#20241F]/60">
              Click any section to edit inline
            </span>
          </div>

          <div className="space-y-3">
            {sections.map((section, idx) => {
              const isEditing = editingSectionIdx === idx;

              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-3.5 transition-all ${
                    section.is_added
                      ? 'border-[#8B9A6E]/40 bg-[#F7F8F5]'
                      : 'border-[#EAE2D6] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-xs font-bold text-[#20241F]">
                        {section.title}
                      </span>
                      {section.is_added && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#557A5B]/15 text-[#557A5B] font-semibold">
                          + Standards Augmented
                        </span>
                      )}
                      {section.is_modified && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B7791F]/15 text-[#B7791F] font-semibold">
                          Edited
                        </span>
                      )}
                    </div>

                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(idx, section.content)}
                        className="text-xs text-[#8B9A6E] hover:text-[#707E55] font-medium"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(idx)}
                          className="text-xs px-2 py-0.5 bg-[#557A5B] text-white rounded font-medium"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSectionIdx(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={4}
                      className="w-full text-xs font-mono p-2 border border-[#8B9A6E] rounded focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] bg-white"
                    />
                  ) : (
                    <div className="text-xs text-[#20241F]/85 leading-relaxed font-sans whitespace-pre-line">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
