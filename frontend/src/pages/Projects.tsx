import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, X, Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import { Project } from '../types';
import { getProjects, createProject } from '../services/api';
import { useUI } from '../context/UIContext';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Project Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProjects();
      setProjects(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const newProj = await createProject({
        name: name.trim(),
        description: desc.trim() || undefined,
        department: department.trim() || undefined,
        reference: reference.trim() || undefined,
      });
      setProjects([newProj, ...projects]);
      setIsModalOpen(false);
      setName('');
      setDesc('');
      setDepartment('');
      setReference('');
      showToast(`Created project "${newProj.name}"`, 'success');
      navigate(`/projects/${newProj.id}`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to create project', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#EAE2D6] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F]">
            Procurement Projects
          </h1>
          <p className="text-sm text-[#20241F]/70 mt-1">
            Organize requirements, standards schedules, specification audits, and tender reports by procurement docket.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Procurement Project</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#8B9A6E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Loading your procurement dockets...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadProjects}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#EAE2D6] p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F7F2EB] text-[#8B9A6E] flex items-center justify-center mx-auto">
            <Folder className="w-6 h-6 text-[#8B9A6E]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#20241F]">
            No Procurement Projects Yet
          </h3>
          <p className="text-xs text-[#20241F]/70 max-w-sm mx-auto">
            Group your requirements, standards recommendations, and specification reports into structured tender projects.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#8B9A6E] text-white rounded-lg text-xs font-semibold"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/projects/${proj.id}`)}
              className="bg-white border border-[#EAE2D6] hover:border-[#8B9A6E] rounded-xl p-6 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] text-gray-600 font-mono">
                    {proj.status.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#F7F2EB] text-[#557A5B]">
                    Readiness: {proj.readiness_score}/100
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#20241F] group-hover:text-[#557A5B] transition-colors mb-2">
                  {proj.name}
                </h3>
                {proj.department && (
                  <div className="text-[11px] font-semibold text-[#8B9A6E] mb-1">
                    {proj.department} {proj.reference ? `• ${proj.reference}` : ''}
                  </div>
                )}
                <p className="text-xs text-[#20241F]/70 line-clamp-2 leading-relaxed mb-4">
                  {proj.description || 'Dedicated project folder for procurement specifications and standards audit.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EAE2D6] grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Reqs</span>
                  <span className="font-mono font-bold text-[#20241F] text-sm">{proj.requirements_count}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Standards</span>
                  <span className="font-mono font-bold text-[#20241F] text-sm">{proj.standards_count}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Issues</span>
                  <span className="font-mono font-bold text-[#B7791F] text-sm">{proj.open_issues}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Reports</span>
                  <span className="font-mono font-bold text-[#20241F] text-sm">{proj.reports_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-[#EAE2D6] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EAE2D6] bg-[#F7F2EB] flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#20241F]">
                New Procurement Project
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white border border-[#EAE2D6] flex items-center justify-center text-gray-500 hover:text-black"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#20241F] mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Municipal Street Lighting Procurement 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#20241F] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Energy-efficient outdoor road luminaire procurement for urban highway corridors."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#20241F] mb-1">
                    Department / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Smart City Mission"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20241F] mb-1">
                    Optional Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SCM-TEN-2026-04"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#EAE2D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-[#EAE2D6] text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="px-4 py-1.5 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold rounded-lg shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
