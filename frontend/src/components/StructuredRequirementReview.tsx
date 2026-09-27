import React, { useState } from 'react';
import { StructuredRequirement } from '../types';

interface StructuredRequirementReviewProps {
  structuredReq: StructuredRequirement;
  onUpdateAndReAnalyze: (updatedReq: StructuredRequirement) => void;
  isLoading?: boolean;
}

export const StructuredRequirementReview: React.FC<StructuredRequirementReviewProps> = ({
  structuredReq,
  onUpdateAndReAnalyze,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<StructuredRequirement>({ ...structuredReq });

  const handleFieldChange = (field: keyof StructuredRequirement, val: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSaveAndReRun = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    onUpdateAndReAnalyze(formData);
  };

  const handleCancel = () => {
    setFormData({ ...structuredReq });
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-[#EAE2D6] rounded-xl overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-[#EAE2D6] bg-[#F7F2EB] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
            <h3 className="font-serif text-lg font-semibold text-[#20241F]">
              Structured Requirement Review
            </h3>
          </div>
          <p className="text-xs text-[#20241F]/70 mt-1">
            Review and adjust the extracted technical parameters. Modifying any field re-evaluates applicable standards and gap scores.
          </p>
        </div>

        <div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-lg border border-[#8B9A6E] bg-white text-xs font-semibold text-[#8B9A6E] hover:bg-[#F7F2EB] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Extracted Parameters</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-lg border border-[#EAE2D6] bg-white text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAndReRun}
                disabled={isLoading}
                className="px-4 py-1.5 rounded-lg bg-[#557A5B] hover:bg-[#436248] text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isLoading ? (
                  <span>Re-analyzing...</span>
                ) : (
                  <span>Save & Re-run Analysis →</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fields Grid */}
      <div className="p-6">
        {!isEditing ? (
          /* View Mode */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6]">
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                Product
              </span>
              <span className="font-semibold text-xs text-[#20241F] block">
                {structuredReq.product || 'Not Specified'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6]">
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                Quantity
              </span>
              <span className="font-semibold text-xs text-[#20241F] block">
                {structuredReq.quantity ? `${structuredReq.quantity} units` : 'Not Specified'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6]">
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                Application
              </span>
              <span className="font-semibold text-xs text-[#20241F] block">
                {structuredReq.application || 'General'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6]">
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                Environment
              </span>
              <span className="font-semibold text-xs text-[#20241F] block">
                {structuredReq.environment || 'Standard'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6]">
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                Category
              </span>
              <span className="font-semibold text-xs text-[#20241F] block">
                {structuredReq.category || 'General Equipment'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6]">
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                Warranty
              </span>
              <span className="font-semibold text-xs text-[#20241F] block">
                {structuredReq.warranty || 'Unspecified'}
              </span>
            </div>

            <div className="col-span-2 p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6]">
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                Key Technical Parameters
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {structuredReq.requirements && structuredReq.requirements.length > 0 ? (
                  structuredReq.requirements.map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white border border-[#EAE2D6] text-[11px] font-mono text-[#20241F]"
                    >
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">None extracted yet</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSaveAndReRun} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#20241F] mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => handleFieldChange('product', e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#8B9A6E] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20241F] mb-1">
                  Quantity (Units)
                </label>
                <input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) =>
                    handleFieldChange(
                      'quantity',
                      e.target.value ? parseInt(e.target.value, 10) : null
                    )
                  }
                  className="w-full text-xs p-2.5 border border-[#8B9A6E] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20241F] mb-1">
                  Operating Environment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coastal Outdoor, High Salinity"
                  value={formData.environment}
                  onChange={(e) => handleFieldChange('environment', e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#8B9A6E] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20241F] mb-1">
                  Application
                </label>
                <input
                  type="text"
                  placeholder="e.g. Municipal roads, Expressway"
                  value={formData.application}
                  onChange={(e) => handleFieldChange('application', e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#8B9A6E] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20241F] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#8B9A6E] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20241F] mb-1">
                  Warranty Requirement
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 years comprehensive warranty"
                  value={formData.warranty || ''}
                  onChange={(e) => handleFieldChange('warranty', e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#8B9A6E] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#20241F] mb-1">
                Technical Parameters (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. >=120 lm/W, IP66, 10 kV surge protection, C4 corrosion"
                value={formData.requirements ? formData.requirements.join(', ') : ''}
                onChange={(e) =>
                  handleFieldChange(
                    'requirements',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full text-xs p-2.5 border border-[#8B9A6E] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 border border-[#EAE2D6] text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-1.5 bg-[#557A5B] hover:bg-[#436248] text-white text-xs font-medium rounded-lg shadow-xs"
              >
                {isLoading ? 'Re-analyzing...' : 'Apply Changes & Re-evaluate'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
