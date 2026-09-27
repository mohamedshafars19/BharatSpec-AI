import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, FolderPlus, Trash2, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { SavedStandardItem } from '../types';
import { getSavedStandards, removeSavedStandard } from '../services/api';
import { useUI } from '../context/UIContext';
import { SaveToProjectModal } from '../components/SaveToProjectModal';

export const Saved: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [savedList, setSavedList] = useState<SavedStandardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectTarget, setProjectTarget] = useState<SavedStandardItem | null>(null);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSavedStandards();
      setSavedList(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item: SavedStandardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeletingId(item.id);
      await removeSavedStandard(item.id);
      setSavedList((prev) => prev.filter((s) => s.id !== item.id));
      showToast(`Removed ${item.standard_id} from saved items`, 'info');
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove saved standard', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-[#EAE2D6] pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
          <span className="text-xs uppercase font-bold tracking-wider text-[#557A5B]">
            Bookmarked Standards & Specifications
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F]">
          Saved Standards Repository
        </h1>
        <p className="text-xs sm:text-sm text-[#20241F]/70 mt-1">
          Quickly access bookmarked Indian Standards, technical schedules, and project references.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500 space-y-2">
          <div className="w-8 h-8 border-2 border-[#8B9A6E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading your saved standards...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadSaved}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : savedList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#EAE2D6] p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#8B9A6E] flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6 text-[#8B9A6E]" />
          </div>
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            You haven't saved any standards yet.
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            When reviewing requirement audits or browsing the standards catalogue, click "Save" to keep them organized here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/standards')}
            className="px-4 py-2 bg-[#8B9A6E] hover:bg-[#707E55] text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            Explore Standards Catalogue →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedList.map((item) => {
            const std = item.standard;
            const isDeleting = deletingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl border border-[#EAE2D6] hover:border-[#8B9A6E] transition-all shadow-xs hover:shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#20241F] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#EAE2D6]">
                      {item.standard_id}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(item.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <h3
                    onClick={() => navigate(`/standards/${item.standard_id}`)}
                    className="font-serif text-sm font-bold text-[#20241F] group-hover:text-[#557A5B] transition-colors mb-1.5 line-clamp-2 cursor-pointer"
                  >
                    {std?.title || 'Indian Standard Specification'}
                  </h3>

                  <p className="text-xs text-[#20241F]/70 line-clamp-3 mb-3 leading-relaxed">
                    {std?.scope || 'Prescribed technical specification for procurement verification.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE2D6] space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-mono text-[11px]">
                      Ver: {std?.version || 'Active'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] font-mono text-[#557A5B]">
                      {std?.category || 'Standard'}
                    </span>
                  </div>

                  {/* Actions: Open, Add to Project, Remove */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => navigate(`/standards/${item.standard_id}`)}
                      className="flex-1 py-1.5 px-2 rounded bg-[#F7F2EB] hover:bg-[#EAE2D6] text-[#20241F] text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      title="Open standard detail"
                    >
                      <ExternalLink className="w-3 h-3 text-[#557A5B]" />
                      <span>Open</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProjectTarget(item)}
                      className="py-1.5 px-2.5 rounded bg-white hover:bg-gray-50 border border-[#EAE2D6] text-[#20241F] text-xs font-medium transition-colors flex items-center gap-1"
                      title="Add to a procurement project"
                    >
                      <FolderPlus className="w-3 h-3 text-[#8B9A6E]" />
                      <span>Add to Project</span>
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={(e) => handleRemove(item, e)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Remove from saved items"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save to Project Modal */}
      {projectTarget && (
        <SaveToProjectModal
          isOpen={Boolean(projectTarget)}
          onClose={() => setProjectTarget(null)}
          itemType="standard"
          itemId={projectTarget.standard_id}
          itemTitle={projectTarget.standard?.title || projectTarget.standard_id}
          itemMeta={{ category: projectTarget.standard?.category }}
          onSaved={() => {
            setProjectTarget(null);
            showToast(`Added ${projectTarget.standard_id} to project`, 'success');
          }}
        />
      )}
    </div>
  );
};

