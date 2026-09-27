import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Project, ProjectItem } from '../types';
import { getProjectById } from '../services/api';
import { useUI } from '../context/UIContext';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'standards' | 'reports' | 'activity'>('overview');

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProjectById(projId);
      setProject(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#8B9A6E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500">Loading procurement project docket...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error || 'Project not found.'}
        </div>
        <Link to="/projects" className="text-xs text-[#8B9A6E] font-semibold hover:underline">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const items = project.items || [];
  const standardItems = items.filter((i) => i.item_type === 'standard');
  const analysisItems = items.filter((i) => i.item_type === 'analysis');
  const reportItems = items.filter((i) => i.item_type === 'report');

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/projects" className="hover:text-[#20241F] transition-colors">
          Projects
        </Link>
        <span>/</span>
        <span className="text-[#20241F] font-semibold truncate max-w-sm">
          {project.name}
        </span>
      </div>

      {/* Project Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-[#EAE2D6] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F]">
              {project.name}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE2D6] text-[#20241F] font-mono font-medium">
              {project.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#20241F]/70 max-w-3xl leading-relaxed">
            {project.description || 'Dedicated procurement project docket for specification audit and standards verification.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="px-4 py-2 rounded-xl bg-white border border-[#EAE2D6] text-right shadow-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">
              Readiness Score
            </span>
            <span className="font-mono text-xl font-bold text-[#557A5B]">
              {project.readiness_score} / 100
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/analyze?projectId=${project.id}`)}
            className="px-4 py-2.5 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>+</span>
            <span>New Analysis in Project</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#EAE2D6] shadow-xs">
          <span className="text-[11px] uppercase font-bold text-gray-400 block">
            Requirements Audited
          </span>
          <span className="font-mono text-2xl font-bold text-[#20241F] mt-1 block">
            {project.requirements_count}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#EAE2D6] shadow-xs">
          <span className="text-[11px] uppercase font-bold text-gray-400 block">
            Standards Reviewed
          </span>
          <span className="font-mono text-2xl font-bold text-[#20241F] mt-1 block">
            {project.standards_count}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#EAE2D6] shadow-xs">
          <span className="text-[11px] uppercase font-bold text-gray-400 block">
            Open Issues
          </span>
          <span className="font-mono text-2xl font-bold text-[#B7791F] mt-1 block">
            {project.open_issues}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#EAE2D6] shadow-xs">
          <span className="text-[11px] uppercase font-bold text-gray-400 block">
            Tender Reports
          </span>
          <span className="font-mono text-2xl font-bold text-[#20241F] mt-1 block">
            {project.reports_count}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#EAE2D6] flex items-center gap-2 overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'requirements', label: `Requirements & Audits (${analysisItems.length})` },
          { id: 'standards', label: `Saved Standards (${standardItems.length})` },
          { id: 'reports', label: `Tender Reports (${reportItems.length})` },
          { id: 'activity', label: 'Activity Timeline' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-[#8B9A6E] text-[#20241F] font-bold'
                : 'border-transparent text-gray-500 hover:text-[#20241F]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-[#EAE2D6] shadow-xs space-y-4">
                <h3 className="font-serif text-base font-bold text-[#20241F]">
                  Procurement Scope & Objectives
                </h3>
                <p className="text-xs text-[#20241F]/80 leading-relaxed font-sans">
                  {project.description || 'This procurement docket is focused on standardizing technical specifications, ensuring mandatory IS test clauses are incorporated into tender schedules, and mitigating delivery-phase quality disputes.'}
                </p>

                <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#EAE2D6] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#20241F] block">
                      Tender Specification Readiness
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Based on checklist completeness across safety, testing, and environmental clauses.
                    </span>
                  </div>
                  <span className="font-mono text-base font-bold text-[#557A5B]">
                    {project.readiness_score}% Complete
                  </span>
                </div>
              </div>

              {/* Recent Saved Standards in Project */}
              <div className="bg-white rounded-xl border border-[#EAE2D6] p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-base font-bold text-[#20241F]">
                    Referenced Indian Standards ({standardItems.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('standards')}
                    className="text-xs font-semibold text-[#8B9A6E] hover:underline"
                  >
                    View All →
                  </button>
                </div>

                {standardItems.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-4">
                    No standards linked to this project yet. Run an analysis or explore standards to bookmark.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {standardItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-[#20241F] block">
                            {item.item_id}
                          </span>
                          <span className="text-gray-600 text-[11px] line-clamp-1">
                            {item.item_title}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/standards/${item.item_id}`)}
                          className="text-[#8B9A6E] font-medium text-[11px] hover:underline"
                        >
                          View Code →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick Action & Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-[#EAE2D6] shadow-xs space-y-4">
                <h4 className="font-serif text-sm font-bold text-[#20241F]">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/analyze?projectId=${project.id}`)}
                    className="w-full text-left p-3 rounded-lg border border-[#EAE2D6] hover:bg-[#FAF7F2] transition-colors text-xs font-semibold text-[#20241F] flex items-center justify-between"
                  >
                    <span>Run New Specification Audit</span>
                    <span className="text-gray-400">→</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/standards')}
                    className="w-full text-left p-3 rounded-lg border border-[#EAE2D6] hover:bg-[#FAF7F2] transition-colors text-xs font-semibold text-[#20241F] flex items-center justify-between"
                  >
                    <span>Explore Standards Knowledge Base</span>
                    <span className="text-gray-400">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requirements' && (
        <div className="bg-white rounded-xl border border-[#EAE2D6] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-base font-bold text-[#20241F]">
              Requirements Audited in Project
            </h3>
            <button
              type="button"
              onClick={() => navigate(`/analyze?projectId=${project.id}`)}
              className="px-3 py-1.5 bg-[#8B9A6E] text-white text-xs font-semibold rounded-lg"
            >
              + Add Requirement
            </button>
          </div>

          {analysisItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500">
              No requirements audited yet in this docket. Click "+ Add Requirement" to start.
            </div>
          ) : (
            <div className="space-y-3">
              {analysisItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/analyze?id=${item.item_id}`)}
                  className="p-4 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6] hover:border-[#8B9A6E] transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#20241F] text-sm block mb-1">
                      {item.item_title}
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      Added {new Date(item.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <span className="text-[#8B9A6E] font-semibold">
                    Re-open Audit →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'standards' && (
        <div className="bg-white rounded-xl border border-[#EAE2D6] p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            Saved Standards Schedule
          </h3>
          {standardItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500">
              No standards bookmarked yet for this project.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {standardItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] flex flex-col justify-between"
                >
                  <div>
                    <span className="font-mono text-sm font-bold text-[#20241F] block mb-1">
                      {item.item_id}
                    </span>
                    <p className="text-xs text-[#20241F]/80 font-serif font-medium line-clamp-2">
                      {item.item_title}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#EAE2D6] mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigate(`/standards/${item.item_id}`)}
                      className="text-xs text-[#8B9A6E] font-semibold hover:underline"
                    >
                      View Full Specification →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-[#EAE2D6] p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            Tender Specification Reports
          </h3>
          {reportItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500">
              No reports generated yet. Run an analysis and click "Export Tender Report" to log one here.
            </div>
          ) : (
            <div className="space-y-3">
              {reportItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-[#FAF7F2] border border-[#EAE2D6] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#20241F] block text-sm">
                      {item.item_title}
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      Generated: {new Date(item.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast(`Report "${item.item_title}" is ready in repository`, 'info')}
                    className="px-3 py-1 bg-white border border-[#EAE2D6] rounded text-xs font-medium text-[#20241F] hover:bg-gray-50"
                  >
                    Download Again
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-[#EAE2D6] p-6 shadow-xs space-y-6">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            Project Audit Activity Timeline
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#8B9A6E]/40">
            {[
              { title: 'Project Created', detail: 'Docket initiated for procurement specification preparation.', time: 'Initial setup' },
              { title: 'Requirement Added', detail: 'Initial technical parameters extracted from tender description.', time: 'Step 1' },
              { title: 'Standards Reviewed', detail: 'Mandatory Indian Standards matched and test methods catalogued.', time: 'Step 2' },
              { title: 'Specification Audited', detail: '10-point audit verified ingress, surge, and certification clauses.', time: 'Step 3' },
              { title: 'Report Generated', detail: 'Tender specification schedule exported to procurement docket.', time: 'Completed' },
            ].map((act, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#8B9A6E] border-2 border-white shadow-xs" />
                <span className="text-xs font-bold text-[#20241F] block">
                  {act.title}
                </span>
                <p className="text-xs text-gray-600 mt-0.5">{act.detail}</p>
                <span className="text-[10px] text-gray-400 block mt-1 font-mono">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
