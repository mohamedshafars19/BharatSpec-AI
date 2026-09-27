import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';
import { getProjects, createProject, addProjectItem } from '../services/api';
import { useUI } from '../context/UIContext';

interface SaveToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'standard' | 'analysis' | 'report';
  itemId: string;
  itemTitle: string;
  itemMeta?: any;
  onSaved?: (project: Project) => void;
}

export const SaveToProjectModal: React.FC<SaveToProjectModalProps> = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemTitle,
  itemMeta,
  onSaved,
}) => {
  const { showToast } = useUI();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectDesc, setNewProjectDesc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getProjects();
      setProjects(list);
      if (list.length > 0) {
        setSelectedProjectId(list[0].id);
      } else {
        setIsCreatingNew(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      let targetProjId = selectedProjectId;

      if (isCreatingNew) {
        if (!newProjectName.trim()) {
          setError('Please enter a project name.');
          setSaving(false);
          return;
        }
        const created = await createProject({
          name: newProjectName.trim(),
          description: newProjectDesc.trim() || undefined,
        });
        targetProjId = created.id;
      }

      await addProjectItem(targetProjId, {
        item_type: itemType,
        item_id: itemId,
        item_title: itemTitle,
        item_meta: itemMeta,
      });

      const targetProject = projects.find((p) => p.id === targetProjId);
      const projName = targetProject ? targetProject.name : newProjectName;
      showToast(`Saved to ${projName}`, 'success');

      if (onSaved && targetProject) {
        onSaved(targetProject);
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save item to project');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-[#EAE2D6] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE2D6] bg-[#F7F2EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
            <h3 className="font-serif text-base font-bold text-[#20241F]">
              Save to Procurement Project
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white border border-[#EAE2D6] flex items-center justify-center text-gray-500 hover:text-black transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EAE2D6] text-xs">
            <span className="text-gray-500 uppercase tracking-wider text-[10px] block font-semibold">
              Item to Save:
            </span>
            <span className="font-bold text-[#20241F] font-mono text-xs block mt-0.5">
              {itemTitle}
            </span>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#20241F]">
              Target Procurement Project
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="text-xs text-[#8B9A6E] hover:text-[#707E55] font-semibold"
            >
              {isCreatingNew ? '← Select Existing' : '+ New Project'}
            </button>
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs text-gray-500">
              Loading your workspace projects...
            </div>
          ) : isCreatingNew ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#20241F] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Highway LED High-Mast Tender 2026"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#20241F] mb-1">
                  Scope / Procurement Purpose (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Preparation of technical tender specification for municipal corridor."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  No existing projects found. Create your first project above.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {projects.map((proj) => {
                    const isSelected = selectedProjectId === proj.id;
                    return (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProjectId(proj.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#8B9A6E] bg-[#F7F8F5] ring-1 ring-[#8B9A6E]'
                            : 'border-[#EAE2D6] bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#20241F]">
                            {proj.name}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Readiness: {proj.readiness_score}/100
                          </span>
                        </div>
                        {proj.description && (
                          <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE2D6] bg-[#F7F2EB] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-[#EAE2D6] text-xs font-medium text-gray-700 rounded-lg hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-medium rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save to Project'}
          </button>
        </div>
      </div>
    </div>
  );
};
