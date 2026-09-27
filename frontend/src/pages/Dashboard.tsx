import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  FolderKanban,
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle2,
  Bookmark,
  FileText,
  AlertTriangle,
  FolderPlus
} from 'lucide-react';
import { DashboardOverview, Project, HistoryItem, SavedStandardItem } from '../types';
import { getDashboardOverview, getSavedStandards } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openSearch } = useUI();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [savedStandards, setSavedStandards] = useState<SavedStandardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, saved] = await Promise.all([
        getDashboardOverview(),
        getSavedStandards().catch(() => [])
      ]);
      setData(res);
      setSavedStandards(saved || []);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError(err?.message || 'Failed to load dashboard overview from server.');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name || data?.user_name || 'Mohamed Shafar';

  // Build activity feed from real records
  const activityList = useMemo(() => {
    const activities: Array<{
      id: string;
      title: string;
      subtitle: string;
      date: string;
      type: 'analysis' | 'project' | 'saved';
      link: string;
    }> = [];

    if (data?.recent_analyses) {
      data.recent_analyses.forEach((item) => {
        activities.push({
          id: `act-ana-${item.id}`,
          title: `Specification Audit: ${item.user_requirement.slice(0, 50)}${item.user_requirement.length > 50 ? '...' : ''}`,
          subtitle: `Readiness Score: ${item.readiness_score || 72}/100 • ${item.recommendations_count} Standards Matched`,
          date: item.created_at,
          type: 'analysis',
          link: `/analyze?id=${item.id}`,
        });
      });
    }

    if (data?.projects) {
      data.projects.forEach((proj) => {
        activities.push({
          id: `act-proj-${proj.id}`,
          title: `Procurement Project: ${proj.name}`,
          subtitle: `${proj.requirements_count} Requirements • ${proj.standards_count} Standards Tracked`,
          date: proj.created_at,
          type: 'project',
          link: `/projects/${proj.id}`,
        });
      });
    }

    if (savedStandards) {
      savedStandards.forEach((saved) => {
        activities.push({
          id: `act-save-${saved.id}`,
          title: `Standard Bookmarked: ${saved.standard_id}`,
          subtitle: saved.standard?.title || 'Catalogued Indian Standard Specification',
          date: saved.created_at,
          type: 'saved',
          link: `/standards/${saved.standard_id}`,
        });
      });
    }

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [data, savedStandards]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#EAE2D6] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F]">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-sm text-[#20241F]/70 mt-1">
            Review procurement requirements and prepare standards-aware specifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#EAE2D6] bg-white text-xs font-semibold text-[#20241F] hover:bg-[#F7F2EB] transition-colors shadow-xs"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#8B9A6E]" />
            <span>Open Project</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/analyze')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#8B9A6E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Loading your procurement workspace...</p>
        </div>
      ) : error ? (
        <div className="bg-[#FAF7F2] p-8 text-center rounded-xl border border-[#B94A48]/30 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FCE8E8] text-[#B94A48] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#20241F]">
              Unable to load dashboard workspace
            </h3>
            <p className="text-xs text-[#575E54] max-w-sm mx-auto mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B9A6E] text-white rounded text-xs font-semibold hover:bg-[#78875E] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#EAE2D6] shadow-xs">
              <span className="text-[11px] uppercase font-bold text-gray-500 block">
                Active Projects
              </span>
              <span className="font-mono text-2xl font-bold text-[#20241F] mt-1 block">
                {data.stats.active_projects}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#EAE2D6] shadow-xs">
              <span className="text-[11px] uppercase font-bold text-gray-500 block">
                Specifications Audited
              </span>
              <span className="font-mono text-2xl font-bold text-[#20241F] mt-1 block">
                {data.stats.total_analyses}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#EAE2D6] shadow-xs">
              <span className="text-[11px] uppercase font-bold text-gray-500 block">
                Standards Catalogued
              </span>
              <span className="font-mono text-2xl font-bold text-[#20241F] mt-1 block">
                {data.stats.standards_catalogued}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#EAE2D6] shadow-xs">
              <span className="text-[11px] uppercase font-bold text-gray-500 block">
                Avg. Readiness Index
              </span>
              <span className="font-mono text-2xl font-bold text-[#557A5B] mt-1 block">
                {data.stats.avg_readiness} / 100
              </span>
            </div>
          </div>

          {/* Section: Recent Analyses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#20241F]">
                  Recent Analyses
                </h2>
                <span className="text-xs text-gray-500">Submitted procurement specifications and audit findings</span>
              </div>
              {data.recent_analyses.length > 0 && (
                <Link
                  to="/history"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B9A6E] hover:text-[#707E55]"
                >
                  <span>View All History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {data.recent_analyses.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-xl border border-[#EAE2D6] space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#8B9A6E] flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-sm font-bold text-[#20241F]">
                  No procurement analyses yet
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Start your first analysis to evaluate tender requirements and discover mandatory standards.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/analyze')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B9A6E] text-white rounded-lg text-xs font-semibold hover:bg-[#707E55] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Analysis</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.recent_analyses.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/analyze?id=${item.id}`)}
                    className="p-5 rounded-xl bg-white border border-[#EAE2D6] hover:border-[#8B9A6E] transition-all cursor-pointer shadow-xs hover:shadow-sm group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8B9A6E] block mb-0.5">
                          {item.category || 'Procurement Specification'}
                        </span>
                        <h3 className="font-serif font-bold text-sm text-[#20241F] group-hover:text-[#557A5B] transition-colors line-clamp-1">
                          "{item.user_requirement}"
                        </h3>
                      </div>
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                          (item.readiness_score || 0) >= 80
                            ? 'bg-[#F0FFF4] text-[#22543D]'
                            : 'bg-[#FFFBEB] text-[#92400E]'
                        }`}
                      >
                        {item.status || 'Needs Review'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#EAE2D6]/60 mt-3">
                      <div className="flex items-center gap-2">
                        <span>Readiness:</span>
                        <strong className="text-[#20241F] font-mono">
                          {item.readiness_score || 72}/100
                        </strong>
                      </div>
                      <span className="text-[11px]">
                        Last updated: {new Date(item.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grid Layout: Projects (Left) & Attention Required (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Projects Section (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#20241F]">
                    Projects
                  </h2>
                  <span className="text-xs text-gray-500">Active procurement dockets and compliance track</span>
                </div>
                {data.projects.length > 0 && (
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B9A6E] hover:text-[#707E55]"
                  >
                    <span>View All ({data.projects.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {data.projects.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-xl border border-[#EAE2D6] space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#8B9A6E] flex items-center justify-center mx-auto">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-sm font-bold text-[#20241F]">
                    No procurement projects yet
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Create a project docket to organize requirements, attach standards, and prepare tender schedules.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/projects')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B9A6E] text-white rounded-lg text-xs font-semibold hover:bg-[#707E55] transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Create New Project</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.projects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => navigate(`/projects/${proj.id}`)}
                      className="p-5 rounded-xl bg-white border border-[#EAE2D6] hover:border-[#8B9A6E] transition-all cursor-pointer shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif font-bold text-base text-[#20241F] group-hover:text-[#557A5B] transition-colors">
                              {proj.name}
                            </h3>
                            {proj.department && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] text-gray-600 font-medium">
                                {proj.department}
                              </span>
                            )}
                          </div>
                          {proj.description && (
                            <p className="text-xs text-[#20241F]/70 line-clamp-1">
                              {proj.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded bg-[#F7F2EB] font-mono text-[#20241F] font-semibold whitespace-nowrap">
                          Readiness: {proj.readiness_score}/100
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-3 border-t border-[#EAE2D6]/60 mt-3">
                        <span>
                          Requirements:{' '}
                          <strong className="text-[#20241F]">{proj.requirements_count}</strong>
                        </span>
                        <span>
                          Standards:{' '}
                          <strong className="text-[#20241F]">{proj.standards_count}</strong>
                        </span>
                        <span>
                          Open Issues:{' '}
                          <strong className="text-[#B7791F]">{proj.open_issues}</strong>
                        </span>
                        <span>
                          Reports:{' '}
                          <strong className="text-[#20241F]">{proj.reports_count}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attention Required Section (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#20241F]">
                    Attention Required
                  </h2>
                  <span className="text-xs text-gray-500">Critical gaps & amendment alerts</span>
                </div>
                <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
              </div>

              {data.attention_required.length === 0 ? (
                <div className="p-6 rounded-xl bg-white border border-[#EAE2D6] text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-[#557A5B] mx-auto" />
                  <p className="text-xs font-semibold text-[#20241F]">No critical compliance issues detected</p>
                  <p className="text-[11px] text-gray-500">All submitted requirements meet current baseline benchmarks.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.attention_required.map((attn) => (
                    <div
                      key={attn.id}
                      onClick={() => {
                        if (attn.analysis_id) {
                          navigate(`/analyze?id=${attn.analysis_id}`);
                        } else {
                          navigate('/analyze');
                        }
                      }}
                      className="p-4 rounded-xl bg-[#FFFBEB] border border-[#B7791F]/30 hover:border-[#B7791F] transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#92400E]">
                          {attn.title}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#B7791F]" />
                      </div>
                      <p className="text-[11px] text-[#92400E]/80 leading-relaxed">
                        {attn.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section: Recently Saved Standards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#20241F]">
                  Recently Saved Standards
                </h2>
                <span className="text-xs text-gray-500">Bookmarked specifications for fast procurement access</span>
              </div>
              <Link
                to="/saved"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B9A6E] hover:text-[#707E55]"
              >
                <span>View All Saved Items</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {savedStandards.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-xl border border-[#EAE2D6] space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#8B9A6E] flex items-center justify-center mx-auto">
                  <Bookmark className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-sm font-bold text-[#20241F]">
                  No saved standards yet
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Explore Indian Standards to save specifications directly to your docket for quick retrieval.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/standards')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B9A6E] text-white rounded-lg text-xs font-semibold hover:bg-[#707E55] transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Explore Standards Catalogue</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedStandards.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/standards/${item.standard_id}`)}
                    className="p-4 rounded-xl bg-white border border-[#EAE2D6] hover:border-[#8B9A6E] transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-[#20241F] group-hover:text-[#557A5B]">
                        {item.standard_id}
                      </span>
                      {item.standard?.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] text-gray-600 font-medium truncate max-w-[120px]">
                          {item.standard.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#20241F]/80 line-clamp-2 mt-1">
                      {item.standard?.title || 'Indian Standard Specification'}
                    </p>
                    <div className="mt-3 pt-2 border-t border-[#EAE2D6]/60 flex items-center justify-between text-[11px] text-gray-500">
                      <span>Saved: {new Date(item.created_at).toLocaleDateString('en-IN')}</span>
                      <span className="text-[#8B9A6E] font-medium group-hover:underline inline-flex items-center gap-1">
                        <span>Open Standard</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Activity Feed */}
          <div className="bg-white border border-[#EAE2D6] rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#EAE2D6] bg-[#F7F2EB] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#20241F]">
                  Procurement Activity
                </h3>
                <p className="text-xs text-[#20241F]/70">
                  Chronological event log of requirements evaluated, projects created, and standards attached.
                </p>
              </div>
              <Clock className="w-4 h-4 text-gray-500" />
            </div>

            <div className="p-6">
              {activityList.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No procurement activities recorded yet.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE2D6]">
                  {activityList.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => navigate(act.link)}
                      className="relative pl-8 flex items-start justify-between gap-4 cursor-pointer group"
                    >
                      <span className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#8B9A6E] group-hover:border-[#557A5B] transition-colors" />
                      <div>
                        <h4 className="text-xs font-bold text-[#20241F] group-hover:text-[#557A5B] transition-colors">
                          {act.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {act.subtitle}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap font-mono">
                        {new Date(act.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
