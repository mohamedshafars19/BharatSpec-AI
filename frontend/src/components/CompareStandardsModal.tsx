import React, { useState, useEffect } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { StandardRecord, CompareStandardsResponse } from '../types';
import { compareStandards } from '../services/api';

interface CompareStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStandardIds?: string[];
  allStandards?: StandardRecord[];
}

export const CompareStandardsModal: React.FC<CompareStandardsModalProps> = ({
  isOpen,
  onClose,
  initialStandardIds = [],
  allStandards = [],
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialStandardIds.slice(0, 3));
  const [comparisonData, setComparisonData] = useState<CompareStandardsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialStandardIds.length > 0) {
      setSelectedIds(initialStandardIds.slice(0, 3));
    }
  }, [initialStandardIds]);

  useEffect(() => {
    if (isOpen && selectedIds.length > 0) {
      loadComparison();
    }
  }, [isOpen, selectedIds]);

  const loadComparison = async () => {
    if (selectedIds.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const res = await compareStandards(selectedIds);
      setComparisonData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to compare selected standards');
    } finally {
      setLoading(false);
    }
  };

  const toggleStandard = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full border border-[#EAE2D6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE2D6] bg-[#F7F2EB] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
              <h3 className="font-serif text-lg font-bold text-[#20241F]">
                Side-by-Side Standards Comparison
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-[#EAE2D6] text-[#20241F] font-mono">
                {selectedIds.length} / 3 Selected
              </span>
            </div>
            <p className="text-xs text-[#20241F]/70 mt-1">
              Evaluate differences in scope, testing protocols, and certification requirements before final tender specification.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#EAE2D6] flex items-center justify-center text-gray-500 hover:text-black transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Standard Picker Chips */}
        {allStandards.length > 0 && (
          <div className="px-6 py-2.5 border-b border-[#EAE2D6] bg-[#FAF7F2] flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-semibold text-[#20241F]/70 whitespace-nowrap">
              Select standards (max 3):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {allStandards.map((std) => {
                const isSelected = selectedIds.includes(std.id);
                return (
                  <button
                    key={std.id}
                    type="button"
                    onClick={() => toggleStandard(std.id)}
                    className={`px-2.5 py-1 rounded-full font-mono text-xs transition-all inline-flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#8B9A6E] text-white font-semibold'
                        : 'bg-white border border-[#EAE2D6] text-[#20241F]/80 hover:bg-gray-100'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3" />}
                    <span>{std.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 text-center text-xs text-gray-500 space-y-2">
              <div className="w-8 h-8 border-2 border-[#8B9A6E] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Analyzing technical standards differences...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          ) : comparisonData ? (
            <div className="space-y-6">
              {/* Context Summary banner */}
              <div className="p-4 rounded-xl bg-[#F0FFF4] border border-[#38A169]/30 text-xs text-[#22543D] leading-relaxed">
                <span className="font-bold block mb-1">Comparative Applicability Guidance:</span>
                {comparisonData.recommendations_summary}
              </div>

              {/* Comparison Table */}
              <div className="border border-[#EAE2D6] rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-[#EAE2D6]">
                    <thead className="bg-[#F7F2EB]">
                      <tr>
                        <th className="py-3 px-4 font-semibold text-[#20241F] uppercase tracking-wider w-40 text-[11px]">
                          Specification Dimension
                        </th>
                        {comparisonData.standards.map((std) => (
                          <th
                            key={std.id}
                            className="py-3 px-4 font-bold text-[#20241F] border-l border-[#EAE2D6]"
                          >
                            <div className="font-mono text-sm">{std.id}</div>
                            <div className="font-serif font-medium text-[11px] text-[#20241F]/80 line-clamp-1 mt-0.5">
                              {std.title}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE2D6] bg-white">
                      {comparisonData.comparison_table.map((row, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'}
                        >
                          <td className="py-3 px-4 font-semibold text-[#20241F] uppercase tracking-wider text-[11px] bg-[#F7F2EB]/40 align-top">
                            {row.field_name}
                          </td>
                          {comparisonData.standards.map((std) => {
                            const val = row.values[std.id];
                            return (
                              <td
                                key={std.id}
                                className="py-3 px-4 border-l border-[#EAE2D6] text-[#20241F]/85 align-top"
                              >
                                {Array.isArray(val) ? (
                                  <ul className="list-disc pl-4 space-y-1">
                                    {val.map((v, i) => (
                                      <li key={i} className="text-[11px] leading-relaxed">
                                        {v}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-[11px] leading-relaxed">
                                    {val ? String(val) : '—'}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">
              Select up to 3 standards to compare their clauses and mandatory test schedules.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE2D6] bg-[#F7F2EB] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#20241F] text-white text-xs font-medium rounded-lg hover:bg-black transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
